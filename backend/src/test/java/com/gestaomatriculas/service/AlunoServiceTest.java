package com.gestaomatriculas.service;

import com.gestaomatriculas.dto.AlunoDTO;
import com.gestaomatriculas.dto.ResponsavelDTO;
import com.gestaomatriculas.exception.BusinessException;
import com.gestaomatriculas.model.Aluno;
import com.gestaomatriculas.model.Responsavel;
import com.gestaomatriculas.model.Turma;
import com.gestaomatriculas.repository.AlunoRepository;
import com.gestaomatriculas.repository.ResponsavelRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AlunoServiceTest {

    @Mock
    private AlunoRepository alunoRepository;

    @Mock
    private ResponsavelRepository responsavelRepository;

    @InjectMocks
    private AlunoService alunoService;

    private AlunoDTO alunoAdultoDTO;
    private AlunoDTO alunoMenorDTO;

    @BeforeEach
    void setUp() {
        alunoAdultoDTO = AlunoDTO.builder()
                .nome("Carlos Silva")
                .cpf("123.456.789-00")
                .email("carlos@exemplo.com")
                .telefone("(11) 98765-4321")
                .dataNascimento(LocalDate.now().minusYears(25))
                .build();

        alunoMenorDTO = AlunoDTO.builder()
                .nome("Lucas Oliveira")
                .cpf("234.567.890-11")
                .email("lucas@exemplo.com")
                .telefone("(11) 97654-3210")
                .dataNascimento(LocalDate.now().minusYears(10)) // 10 anos
                .build();
    }

    @Test
    @DisplayName("Deve cadastrar aluno adulto com sucesso sem exigir responsável")
    void deveCadastrarAlunoAdultoComSucesso() {
        when(alunoRepository.existsByCpf("12345678900")).thenReturn(false);
        when(alunoRepository.save(any(Aluno.class))).thenAnswer(invocation -> {
            Aluno a = invocation.getArgument(0);
            a.setId(1L);
            return a;
        });

        AlunoDTO resultado = alunoService.criar(alunoAdultoDTO);

        assertNotNull(resultado);
        assertEquals("Carlos Silva", resultado.getNome());
        assertEquals("12345678900", resultado.getCpf());
        assertFalse(resultado.getMenorDeIdade());
        assertNull(resultado.getResponsavel());
        verify(alunoRepository, times(1)).save(any(Aluno.class));
    }

    @Test
    @DisplayName("Deve lançar BusinessException ao cadastrar aluno menor sem responsável")
    void deveLancarExcecaoParaMenorSemResponsavel() {
        when(alunoRepository.existsByCpf("23456789011")).thenReturn(false);

        BusinessException ex = assertThrows(BusinessException.class, () -> alunoService.criar(alunoMenorDTO));
        assertTrue(ex.getMessage().contains("menores de 18 anos"));
        verify(alunoRepository, never()).save(any(Aluno.class));
    }

    @Test
    @DisplayName("Deve cadastrar aluno menor com responsável legal preenchido")
    void deveCadastrarAlunoMenorComResponsavel() {
        alunoMenorDTO.setResponsavel(ResponsavelDTO.builder()
                .nome("Juliana Oliveira")
                .cpf("987.654.321-00")
                .telefone("(11) 91111-2222")
                .email("juliana@exemplo.com")
                .grauParentesco("Mãe")
                .build());

        when(alunoRepository.existsByCpf("23456789011")).thenReturn(false);
        when(responsavelRepository.findByCpf("98765432100")).thenReturn(Optional.empty());
        when(responsavelRepository.save(any(Responsavel.class))).thenAnswer(inv -> {
            Responsavel r = inv.getArgument(0);
            r.setId(10L);
            return r;
        });
        when(alunoRepository.save(any(Aluno.class))).thenAnswer(inv -> {
            Aluno a = inv.getArgument(0);
            a.setId(2L);
            return a;
        });

        AlunoDTO resultado = alunoService.criar(alunoMenorDTO);

        assertNotNull(resultado);
        assertTrue(resultado.getMenorDeIdade());
        assertNotNull(resultado.getResponsavel());
        assertEquals("Juliana Oliveira", resultado.getResponsavel().getNome());
    }

    @Test
    @DisplayName("Deve validar limites de idade da turma corretamente")
    void deveValidarFaixaEtariaNaTurma() {
        Turma turmaInfantil = Turma.builder()
                .idadeMinima(6)
                .idadeMaxima(10)
                .build();

        assertTrue(turmaInfantil.isIdadePermitida(6));
        assertTrue(turmaInfantil.isIdadePermitida(8));
        assertTrue(turmaInfantil.isIdadePermitida(10));
        assertFalse(turmaInfantil.isIdadePermitida(5));  // muito novo
        assertFalse(turmaInfantil.isIdadePermitida(11)); // muito velho
    }
}
