package com.gestaomatriculas.service;

import com.gestaomatriculas.dto.AlunoDTO;
import com.gestaomatriculas.exception.BusinessException;
import com.gestaomatriculas.exception.ResourceNotFoundException;
import com.gestaomatriculas.model.Aluno;
import com.gestaomatriculas.repository.AlunoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AlunoService {

    private final AlunoRepository alunoRepository;

    @Transactional(readOnly = true)
    public List<AlunoDTO> listarTodos() {
        return alunoRepository.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AlunoDTO buscarPorId(Long id) {
        Aluno aluno = alunoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Aluno não encontrado com id: " + id));
        return toDTO(aluno);
    }

    @Transactional
    public AlunoDTO criar(AlunoDTO dto) {
        String cpfLimpo = limparCpf(dto.getCpf());
        if (alunoRepository.existsByCpf(cpfLimpo)) {
            throw new BusinessException("Já existe um aluno cadastrado com o CPF: " + dto.getCpf());
        }

        Aluno aluno = Aluno.builder()
                .nome(dto.getNome())
                .cpf(cpfLimpo)
                .email(dto.getEmail())
                .telefone(dto.getTelefone())
                .dataNascimento(dto.getDataNascimento())
                .build();

        return toDTO(alunoRepository.save(aluno));
    }

    @Transactional
    public Aluno obterOuCriar(String nome, String cpf, String email, String telefone, java.time.LocalDate dataNascimento) {
        String cpfLimpo = limparCpf(cpf);
        return alunoRepository.findByCpf(cpfLimpo).orElseGet(() -> {
            Aluno novo = Aluno.builder()
                    .nome(nome)
                    .cpf(cpfLimpo)
                    .email(email)
                    .telefone(telefone)
                    .dataNascimento(dataNascimento)
                    .build();
            return alunoRepository.save(novo);
        });
    }

    private String limparCpf(String cpf) {
        return cpf != null ? cpf.replaceAll("\\D", "") : "";
    }

    public AlunoDTO toDTO(Aluno aluno) {
        return AlunoDTO.builder()
                .id(aluno.getId())
                .nome(aluno.getNome())
                .cpf(aluno.getCpf())
                .email(aluno.getEmail())
                .telefone(aluno.getTelefone())
                .dataNascimento(aluno.getDataNascimento())
                .build();
    }
}
