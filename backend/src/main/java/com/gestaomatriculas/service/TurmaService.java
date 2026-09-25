package com.gestaomatriculas.service;

import com.gestaomatriculas.dto.TurmaDTO;
import com.gestaomatriculas.exception.BusinessException;
import com.gestaomatriculas.exception.ResourceNotFoundException;
import com.gestaomatriculas.model.Curso;
import com.gestaomatriculas.model.Turma;
import com.gestaomatriculas.model.enums.StatusTurma;
import com.gestaomatriculas.repository.CursoRepository;
import com.gestaomatriculas.repository.TurmaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TurmaService {

    private final TurmaRepository turmaRepository;
    private final CursoRepository cursoRepository;

    @Transactional(readOnly = true)
    public List<TurmaDTO> listarTodas(Long cursoId, Long escolaId, Boolean apenasAbertas) {
        List<Turma> turmas;
        LocalDate hoje = LocalDate.now();

        if (Boolean.TRUE.equals(apenasAbertas)) {
            if (escolaId != null) {
                turmas = turmaRepository.findTurmasComMatriculaAbertaPorEscola(escolaId, hoje);
            } else {
                turmas = turmaRepository.findTurmasComMatriculaAberta(hoje);
            }
        } else if (cursoId != null) {
            turmas = turmaRepository.findByCursoId(cursoId);
        } else if (escolaId != null) {
            turmas = turmaRepository.findByCursoEscolaId(escolaId);
        } else {
            turmas = turmaRepository.findAll();
        }
        return turmas.stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public TurmaDTO buscarPorId(Long id) {
        Turma turma = turmaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Turma não encontrada com id: " + id));
        return toDTO(turma);
    }

    @Transactional
    public TurmaDTO criar(TurmaDTO dto) {
        validarDatas(dto);

        Curso curso = cursoRepository.findById(dto.getCursoId())
                .orElseThrow(() -> new ResourceNotFoundException("Curso não encontrado com id: " + dto.getCursoId()));

        turmaRepository.findByCodigo(dto.getCodigo()).ifPresent(t -> {
            throw new BusinessException("Já existe uma turma cadastrada com o código: " + dto.getCodigo());
        });

        Turma turma = Turma.builder()
                .curso(curso)
                .codigo(dto.getCodigo())
                .dataAberturaMatricula(dto.getDataAberturaMatricula())
                .dataFechamentoMatricula(dto.getDataFechamentoMatricula())
                .dataInicioAulas(dto.getDataInicioAulas())
                .dataFimAulas(dto.getDataFimAulas())
                .vagasTotais(dto.getVagasTotais())
                .vagasOcupadas(0)
                .idadeMinima(dto.getIdadeMinima())
                .idadeMaxima(dto.getIdadeMaxima())
                .diasToleranciaSuplencia(dto.getDiasToleranciaSuplencia() != null ? dto.getDiasToleranciaSuplencia() : 15)
                .status(dto.getStatus() == null ? StatusTurma.ABERTA : dto.getStatus())
                .build();

        Turma salva = turmaRepository.save(turma);
        return toDTO(salva);
    }

    @Transactional
    public TurmaDTO atualizar(Long id, TurmaDTO dto) {
        validarDatas(dto);

        Turma turma = turmaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Turma não encontrada com id: " + id));

        if (!turma.getCodigo().equals(dto.getCodigo())) {
            turmaRepository.findByCodigo(dto.getCodigo()).ifPresent(t -> {
                throw new BusinessException("Já existe uma turma cadastrada com o código: " + dto.getCodigo());
            });
        }

        Curso curso = cursoRepository.findById(dto.getCursoId())
                .orElseThrow(() -> new ResourceNotFoundException("Curso não encontrado com id: " + dto.getCursoId()));

        turma.setCurso(curso);
        turma.setCodigo(dto.getCodigo());
        turma.setDataAberturaMatricula(dto.getDataAberturaMatricula());
        turma.setDataFechamentoMatricula(dto.getDataFechamentoMatricula());
        turma.setDataInicioAulas(dto.getDataInicioAulas());
        turma.setDataFimAulas(dto.getDataFimAulas());
        turma.setVagasTotais(dto.getVagasTotais());
        turma.setIdadeMinima(dto.getIdadeMinima());
        turma.setIdadeMaxima(dto.getIdadeMaxima());
        if (dto.getDiasToleranciaSuplencia() != null) {
            turma.setDiasToleranciaSuplencia(dto.getDiasToleranciaSuplencia());
        }
        if (dto.getStatus() != null) {
            turma.setStatus(dto.getStatus());
        }

        Turma atualizada = turmaRepository.save(turma);
        return toDTO(atualizada);
    }

    private void validarDatas(TurmaDTO dto) {
        if (dto.getDataAberturaMatricula().isAfter(dto.getDataFechamentoMatricula())) {
            throw new BusinessException("A data de abertura de matrícula deve ser anterior à data de fechamento.");
        }
        if (dto.getDataInicioAulas().isAfter(dto.getDataFimAulas())) {
            throw new BusinessException("A data de início das aulas deve ser anterior à data de término.");
        }
        if (dto.getDataFechamentoMatricula().isAfter(dto.getDataFimAulas())) {
            throw new BusinessException("O fechamento de matrículas não pode ocorrer após o término do curso.");
        }
    }

    public TurmaDTO toDTO(Turma turma) {
        Long escolaId = null;
        String escolaNome = null;
        String escolaSigla = null;

        if (turma.getCurso() != null && turma.getCurso().getEscola() != null) {
            escolaId = turma.getCurso().getEscola().getId();
            escolaNome = turma.getCurso().getEscola().getNome();
            escolaSigla = turma.getCurso().getEscola().getSigla();
        }

        return TurmaDTO.builder()
                .id(turma.getId())
                .cursoId(turma.getCurso().getId())
                .cursoNome(turma.getCurso().getNome())
                .escolaId(escolaId)
                .escolaNome(escolaNome)
                .escolaSigla(escolaSigla)
                .codigo(turma.getCodigo())
                .dataAberturaMatricula(turma.getDataAberturaMatricula())
                .dataFechamentoMatricula(turma.getDataFechamentoMatricula())
                .dataInicioAulas(turma.getDataInicioAulas())
                .dataFimAulas(turma.getDataFimAulas())
                .vagasTotais(turma.getVagasTotais())
                .vagasOcupadas(turma.getVagasOcupadas())
                .idadeMinima(turma.getIdadeMinima())
                .idadeMaxima(turma.getIdadeMaxima())
                .diasToleranciaSuplencia(turma.getDiasToleranciaSuplencia())
                .suplenciaAberta(turma.isChamadaSuplenciaPermitida(LocalDate.now()))
                .status(turma.getStatus())
                .matriculaAberta(turma.isPeriodoMatriculaAberto())
                .build();
    }
}
