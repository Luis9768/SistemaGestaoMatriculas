package com.gestaomatriculas.service;

import com.gestaomatriculas.dto.InscricaoExternaDTO;
import com.gestaomatriculas.dto.MatriculaDTO;
import com.gestaomatriculas.exception.BusinessException;
import com.gestaomatriculas.exception.ResourceNotFoundException;
import com.gestaomatriculas.model.Aluno;
import com.gestaomatriculas.model.Matricula;
import com.gestaomatriculas.model.Turma;
import com.gestaomatriculas.model.enums.CanalOrigem;
import com.gestaomatriculas.model.enums.StatusMatricula;
import com.gestaomatriculas.repository.AlunoRepository;
import com.gestaomatriculas.repository.MatriculaRepository;
import com.gestaomatriculas.repository.TurmaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MatriculaService {

    private final MatriculaRepository matriculaRepository;
    private final TurmaRepository turmaRepository;
    private final AlunoRepository alunoRepository;
    private final AlunoService alunoService;

    @Transactional(readOnly = true)
    public List<MatriculaDTO> listar(Long turmaId, Long alunoId, CanalOrigem canal, StatusMatricula status) {
        List<Matricula> matriculas;
        if (turmaId != null) {
            matriculas = matriculaRepository.findByTurmaId(turmaId);
        } else if (alunoId != null) {
            matriculas = matriculaRepository.findByAlunoId(alunoId);
        } else if (canal != null) {
            matriculas = matriculaRepository.findByCanalOrigem(canal);
        } else if (status != null) {
            matriculas = matriculaRepository.findByStatus(status);
        } else {
            matriculas = matriculaRepository.findAll();
        }
        return matriculas.stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public MatriculaDTO buscarPorId(Long id) {
        Matricula m = matriculaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Matrícula não encontrada com id: " + id));
        return toDTO(m);
    }

    @Transactional
    public MatriculaDTO matricular(MatriculaDTO dto) {
        Aluno aluno = alunoRepository.findById(dto.getAlunoId())
                .orElseThrow(() -> new ResourceNotFoundException("Aluno não encontrado com id: " + dto.getAlunoId()));

        Turma turma = turmaRepository.findById(dto.getTurmaId())
                .orElseThrow(() -> new ResourceNotFoundException("Turma não encontrada com id: " + dto.getTurmaId()));

        return realizarMatricula(aluno, turma, dto.getCanalOrigem(), dto.getObservacoes());
    }

    @Transactional
    public MatriculaDTO inscrever(InscricaoExternaDTO dto) {
        Turma turma = turmaRepository.findById(dto.getTurmaId())
                .orElseThrow(() -> new ResourceNotFoundException("Turma não encontrada com id: " + dto.getTurmaId()));

        Aluno aluno = alunoService.obterOuCriar(
                dto.getNome(),
                dto.getCpf(),
                dto.getEmail(),
                dto.getTelefone(),
                dto.getDataNascimento()
        );

        return realizarMatricula(aluno, turma, dto.getCanalOrigem(), dto.getObservacoes());
    }

    @Transactional
    public MatriculaDTO cancelarMatricula(Long id) {
        Matricula matricula = matriculaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Matrícula não encontrada com id: " + id));

        if (matricula.getStatus() == StatusMatricula.CANCELADA) {
            throw new BusinessException("Esta matrícula já está cancelada.");
        }

        matricula.setStatus(StatusMatricula.CANCELADA);
        Matricula atualizada = matriculaRepository.save(matricula);

        Turma turma = matricula.getTurma();
        if (turma.getVagasOcupadas() > 0) {
            turma.setVagasOcupadas(turma.getVagasOcupadas() - 1);
            turmaRepository.save(turma);
        }

        return toDTO(atualizada);
    }

    private MatriculaDTO realizarMatricula(Aluno aluno, Turma turma, CanalOrigem canal, String observacoes) {
        if (matriculaRepository.existsByAlunoIdAndTurmaId(aluno.getId(), turma.getId())) {
            throw new BusinessException("O aluno " + aluno.getNome() + " já está matriculado nesta turma (" + turma.getCodigo() + ").");
        }

        if (!turma.isPeriodoMatriculaAberto()) {
            throw new BusinessException("O período de inscrições para a turma " + turma.getCodigo() + " está encerrado ou ainda não abriu.");
        }

        if (!turma.temVagasDisponiveis()) {
            throw new BusinessException("Não há vagas disponíveis para a turma " + turma.getCodigo() + ".");
        }

        Matricula matricula = Matricula.builder()
                .aluno(aluno)
                .turma(turma)
                .canalOrigem(canal != null ? canal : CanalOrigem.SITE)
                .status(StatusMatricula.CONFIRMADA)
                .observacoes(observacoes)
                .build();

        Matricula salva = matriculaRepository.save(matricula);

        turma.setVagasOcupadas(turma.getVagasOcupadas() + 1);
        turmaRepository.save(turma);

        return toDTO(salva);
    }

    public MatriculaDTO toDTO(Matricula m) {
        return MatriculaDTO.builder()
                .id(m.getId())
                .alunoId(m.getAluno().getId())
                .alunoNome(m.getAluno().getNome())
                .alunoCpf(m.getAluno().getCpf())
                .alunoEmail(m.getAluno().getEmail())
                .turmaId(m.getTurma().getId())
                .turmaCodigo(m.getTurma().getCodigo())
                .cursoNome(m.getTurma().getCurso().getNome())
                .dataMatricula(m.getDataMatricula())
                .canalOrigem(m.getCanalOrigem())
                .status(m.getStatus())
                .observacoes(m.getObservacoes())
                .build();
    }
}
