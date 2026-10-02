package com.gestaomatriculas.service;

import com.gestaomatriculas.dto.TurmaDTO;
import com.gestaomatriculas.dto.TurmaMateriaDTO;
import com.gestaomatriculas.exception.BusinessException;
import com.gestaomatriculas.exception.ResourceNotFoundException;
import com.gestaomatriculas.model.Curso;
import com.gestaomatriculas.model.Turma;
import com.gestaomatriculas.model.TurmaMateria;
import com.gestaomatriculas.model.enums.StatusTurma;
import com.gestaomatriculas.repository.CursoRepository;
import com.gestaomatriculas.repository.TurmaMateriaRepository;
import com.gestaomatriculas.repository.TurmaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TurmaService {

    private final TurmaRepository turmaRepository;
    private final CursoRepository cursoRepository;
    private final TurmaMateriaRepository turmaMateriaRepository;

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
        processarMaterias(salva, dto);
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

        if (dto.getMaterias() != null || dto.getMateriasNomes() != null) {
            turmaMateriaRepository.deleteAll(turma.getMaterias());
            turma.getMaterias().clear();
            processarMaterias(turma, dto);
        }

        Turma atualizada = turmaRepository.save(turma);
        return toDTO(atualizada);
    }

    private void processarMaterias(Turma turma, TurmaDTO dto) {
        List<TurmaMateria> novasMaterias = new ArrayList<>();

        if (dto.getMaterias() != null && !dto.getMaterias().isEmpty()) {
            int ordem = 1;
            for (TurmaMateriaDTO mDto : dto.getMaterias()) {
                if (mDto.getNome() != null && !mDto.getNome().trim().isEmpty()) {
                    novasMaterias.add(TurmaMateria.builder()
                            .turma(turma)
                            .nome(mDto.getNome().trim())
                            .duracaoEstimada(mDto.getDuracaoEstimada() != null ? mDto.getDuracaoEstimada().trim() : null)
                            .ordem(mDto.getOrdem() != null ? mDto.getOrdem() : ordem++)
                            .build());
                }
            }
        } else if (dto.getMateriasNomes() != null && !dto.getMateriasNomes().isEmpty()) {
            int ordem = 1;
            for (String item : dto.getMateriasNomes()) {
                if (item != null) {
                    String[] partes = item.split("[,;\\n]+");
                    for (String parte : partes) {
                        String nomeLimpo = parte.trim();
                        if (!nomeLimpo.isEmpty()) {
                            novasMaterias.add(TurmaMateria.builder()
                                    .turma(turma)
                                    .nome(nomeLimpo)
                                    .ordem(ordem++)
                                    .build());
                        }
                    }
                }
            }
        }

        if (!novasMaterias.isEmpty()) {
            turmaMateriaRepository.saveAll(novasMaterias);
            turma.getMaterias().clear();
            turma.getMaterias().addAll(novasMaterias);
        }
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

        List<TurmaMateriaDTO> materiasDTO = new ArrayList<>();
        List<String> materiasNomes = new ArrayList<>();
        if (turma.getMaterias() != null && !turma.getMaterias().isEmpty()) {
            for (TurmaMateria m : turma.getMaterias()) {
                materiasDTO.add(TurmaMateriaDTO.builder()
                        .id(m.getId())
                        .turmaId(turma.getId())
                        .nome(m.getNome())
                        .duracaoEstimada(m.getDuracaoEstimada())
                        .ordem(m.getOrdem())
                        .build());
                materiasNomes.add(m.getNome());
            }
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
                .materias(materiasDTO)
                .materiasNomes(materiasNomes)
                .build();
    }
}
