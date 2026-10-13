package com.gestaomatriculas.service;

import com.gestaomatriculas.dto.ChamadaItemDTO;
import com.gestaomatriculas.dto.SalvarChamadaDTO;
import com.gestaomatriculas.exception.BusinessException;
import com.gestaomatriculas.model.Turma;
import com.gestaomatriculas.model.TurmaMateria;
import com.gestaomatriculas.repository.MatriculaRepository;
import com.gestaomatriculas.repository.RegistroPresencaRepository;
import com.gestaomatriculas.repository.TurmaMateriaRepository;
import com.gestaomatriculas.repository.TurmaRepository;
import com.gestaomatriculas.security.SecurityService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ChamadaServiceTest {

    @Mock
    private RegistroPresencaRepository registroPresencaRepository;

    @Mock
    private TurmaRepository turmaRepository;

    @Mock
    private TurmaMateriaRepository turmaMateriaRepository;

    @Mock
    private MatriculaRepository matriculaRepository;

    @Mock
    private SecurityService securityService;

    @Mock
    private AuditoriaService auditoriaService;

    @InjectMocks
    private ChamadaService chamadaService;

    private Turma turma;
    private TurmaMateria materia;

    @BeforeEach
    void setUp() {
        turma = Turma.builder()
                .id(1L)
                .codigo("ELT-TEATRO-2026")
                .vagasTotais(25)
                .build();

        materia = TurmaMateria.builder()
                .id(10L)
                .nome("Prática de Montagem")
                .turma(turma)
                .build();
    }

    @Test
    @DisplayName("Deve impedir salvar chamada com data de amanhã ou futura")
    void deveImpedirSalvarChamadaComDataFutura() {
        LocalDate dataAmanha = LocalDate.now().plusDays(1);

        when(turmaRepository.findById(1L)).thenReturn(Optional.of(turma));
        when(turmaMateriaRepository.findById(10L)).thenReturn(Optional.of(materia));

        SalvarChamadaDTO dto = SalvarChamadaDTO.builder()
                .turmaId(1L)
                .materiaId(10L)
                .dataAula(dataAmanha)
                .responsavelRegistro("Prof. José")
                .itens(List.of(
                        ChamadaItemDTO.builder().matriculaId(100L).alunoId(200L).build()
                ))
                .build();

        BusinessException ex = assertThrows(BusinessException.class, () -> chamadaService.salvarChamada(dto));
        assertTrue(ex.getMessage().contains("Não é permitido adicionar ou registrar chamada para datas futuras"));

        verify(registroPresencaRepository, never()).save(any());
        verify(auditoriaService, never()).registrarAcao(any(), any(), any(), any(), any(), any());
    }

    @Test
    @DisplayName("Deve impedir abrir chamada para data de amanhã ou futura")
    void deveImpedirAbrirChamadaParaDataFutura() {
        LocalDate dataAmanha = LocalDate.now().plusDays(1);

        when(turmaRepository.findById(1L)).thenReturn(Optional.of(turma));
        when(turmaMateriaRepository.findById(10L)).thenReturn(Optional.of(materia));

        BusinessException ex = assertThrows(BusinessException.class, () ->
                chamadaService.obterAlunosParaChamada(1L, 10L, dataAmanha)
        );

        assertTrue(ex.getMessage().contains("Não é permitido abrir chamada para datas futuras"));
    }
}
