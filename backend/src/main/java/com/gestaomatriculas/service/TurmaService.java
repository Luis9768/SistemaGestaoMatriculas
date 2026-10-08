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
import com.gestaomatriculas.repository.RegistroPresencaRepository;
import com.gestaomatriculas.repository.TurmaMateriaRepository;
import com.gestaomatriculas.repository.TurmaRepository;
import com.gestaomatriculas.security.SecurityService;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
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
    private final RegistroPresencaRepository registroPresencaRepository;
    private final SecurityService securityService;

    @Cacheable(value = "turmas", key = "'curso_' + (#cursoId != null ? #cursoId : 'todos') + '_escola_' + (#escolaId != null ? #escolaId : 'todas') + '_abertas_' + (#apenasAbertas != null ? #apenasAbertas : 'false')")
    @Transactional(readOnly = true)
    public List<TurmaDTO> listarTodas(Long cursoId, Long escolaId, Boolean apenasAbertas) {
        escolaId = securityService.resolverEscolaId(escolaId);
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

    @Cacheable(value = "turmas", key = "#id")
    @Transactional(readOnly = true)
    public TurmaDTO buscarPorId(Long id) {
        Turma turma = turmaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Turma não encontrada com id: " + id));
        return toDTO(turma);
    }

    @CacheEvict(value = {"turmas", "dashboard_stats"}, allEntries = true)
    @Transactional
    public TurmaDTO criar(TurmaDTO dto) {
        validarDatas(dto);

        Curso curso = cursoRepository.findById(dto.getCursoId())
                .orElseThrow(() -> new ResourceNotFoundException("Curso não encontrado com id: " + dto.getCursoId()));

        if (securityService.isEncarregada() && curso.getEscola() != null && !securityService.temAcessoAEscola(curso.getEscola().getId())) {
            throw new BusinessException("Acesso negado: você não possui permissão para abrir turmas nesta escola.");
        }

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
                .educadorResponsavel(dto.getEducadorResponsavel())
                .diasHorariosLocal(dto.getDiasHorariosLocal())
                .status(dto.getStatus() == null ? StatusTurma.ABERTA : dto.getStatus())
                .build();

        Turma salva = turmaRepository.save(turma);
        processarMaterias(salva, dto);
        return toDTO(salva);
    }

    @CacheEvict(value = {"turmas", "dashboard_stats"}, allEntries = true)
    @Transactional
    public TurmaDTO atualizar(Long id, TurmaDTO dto) {
        validarDatas(dto);

        Turma turma = turmaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Turma não encontrada com id: " + id));

        if (securityService.isEncarregada() && turma.getCurso() != null && turma.getCurso().getEscola() != null
                && !securityService.temAcessoAEscola(turma.getCurso().getEscola().getId())) {
            throw new BusinessException("Acesso negado: você não possui permissão para alterar turmas desta escola.");
        }

        if (!turma.getCodigo().equals(dto.getCodigo())) {
            turmaRepository.findByCodigo(dto.getCodigo()).ifPresent(t -> {
                throw new BusinessException("Já existe uma turma cadastrada com o código: " + dto.getCodigo());
            });
        }

        Curso curso = cursoRepository.findById(dto.getCursoId())
                .orElseThrow(() -> new ResourceNotFoundException("Curso não encontrado com id: " + dto.getCursoId()));

        if (securityService.isEncarregada() && curso.getEscola() != null && !securityService.temAcessoAEscola(curso.getEscola().getId())) {
            throw new BusinessException("Acesso negado: você não possui permissão para vincular esta turma a uma escola não autorizada.");
        }

        turma.setCurso(curso);
        turma.setCodigo(dto.getCodigo());
        turma.setDataAberturaMatricula(dto.getDataAberturaMatricula());
        turma.setDataFechamentoMatricula(dto.getDataFechamentoMatricula());
        turma.setDataInicioAulas(dto.getDataInicioAulas());
        turma.setDataFimAulas(dto.getDataFimAulas());
        turma.setVagasTotais(dto.getVagasTotais());
        turma.setIdadeMinima(dto.getIdadeMinima());
        turma.setIdadeMaxima(dto.getIdadeMaxima());
        turma.setEducadorResponsavel(dto.getEducadorResponsavel());
        turma.setDiasHorariosLocal(dto.getDiasHorariosLocal());
        if (dto.getStatus() != null) {
            turma.setStatus(dto.getStatus());
        }

        // Não substitui matérias caso não tenham sido enviadas no DTO
        boolean temMateriasNoDto = (dto.getMaterias() != null && !dto.getMaterias().isEmpty())
                || (dto.getMateriasNomes() != null && !dto.getMateriasNomes().isEmpty());

        if (temMateriasNoDto) {
            // Garante que matérias com chamadas registradas não sejam apagadas acidentalmente
            if (turma.getMaterias() != null && !turma.getMaterias().isEmpty()) {
                for (TurmaMateria m : turma.getMaterias()) {
                    long totalPresencas = registroPresencaRepository.countByMateriaId(m.getId());
                    if (totalPresencas > 0) {
                        throw new BusinessException("A matéria '" + m.getNome() + "' possui registros de presença e não pode ser reescrita em lote. Gerencie as matérias individualmente.");
                    }
                }
                turmaMateriaRepository.deleteAll(turma.getMaterias());
                turma.getMaterias().clear();
            }
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
                            .professorResponsavel(mDto.getProfessorResponsavel() != null && !mDto.getProfessorResponsavel().isBlank() ? mDto.getProfessorResponsavel().trim() : null)
                            .cargaHoraria(mDto.getCargaHoraria())
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

    @Transactional(readOnly = true)
    public List<TurmaMateriaDTO> listarMaterias(Long turmaId) {
        if (!turmaRepository.existsById(turmaId)) {
            throw new ResourceNotFoundException("Turma não encontrada com id: " + turmaId);
        }
        return turmaMateriaRepository.findByTurmaIdOrderByOrdemAscIdAsc(turmaId).stream()
                .map(m -> TurmaMateriaDTO.builder()
                        .id(m.getId())
                        .turmaId(turmaId)
                        .nome(m.getNome())
                        .duracaoEstimada(m.getDuracaoEstimada())
                        .professorResponsavel(m.getProfessorResponsavel())
                        .cargaHoraria(m.getCargaHoraria())
                        .ordem(m.getOrdem())
                        .build())
                .toList();
    }

    @CacheEvict(value = {"turmas", "dashboard_stats"}, allEntries = true)
    @Transactional
    public TurmaMateriaDTO adicionarMateria(Long turmaId, TurmaMateriaDTO dto) {
        Turma turma = turmaRepository.findById(turmaId)
                .orElseThrow(() -> new ResourceNotFoundException("Turma não encontrada com id: " + turmaId));

        if (securityService.isEncarregada() && turma.getCurso() != null && turma.getCurso().getEscola() != null
                && !securityService.temAcessoAEscola(turma.getCurso().getEscola().getId())) {
            throw new BusinessException("Acesso negado: você não possui permissão para adicionar matérias a turmas desta escola.");
        }

        if (dto.getNome() == null || dto.getNome().trim().isEmpty()) {
            throw new BusinessException("O nome da matéria é obrigatório.");
        }

        int proximaOrdem = (turma.getMaterias() != null ? turma.getMaterias().size() : 0) + 1;
        TurmaMateria nova = TurmaMateria.builder()
                .turma(turma)
                .nome(dto.getNome().trim())
                .duracaoEstimada(dto.getDuracaoEstimada() != null && !dto.getDuracaoEstimada().isBlank() ? dto.getDuracaoEstimada().trim() : null)
                .professorResponsavel(dto.getProfessorResponsavel() != null && !dto.getProfessorResponsavel().isBlank() ? dto.getProfessorResponsavel().trim() : null)
                .cargaHoraria(dto.getCargaHoraria())
                .ordem(dto.getOrdem() != null ? dto.getOrdem() : proximaOrdem)
                .build();

        TurmaMateria salva = turmaMateriaRepository.save(nova);
        if (turma.getMaterias() == null) {
            turma.setMaterias(new ArrayList<>());
        }
        turma.getMaterias().add(salva);

        return TurmaMateriaDTO.builder()
                .id(salva.getId())
                .turmaId(turmaId)
                .nome(salva.getNome())
                .duracaoEstimada(salva.getDuracaoEstimada())
                .professorResponsavel(salva.getProfessorResponsavel())
                .cargaHoraria(salva.getCargaHoraria())
                .ordem(salva.getOrdem())
                .build();
    }

    @CacheEvict(value = {"turmas", "dashboard_stats"}, allEntries = true)
    @Transactional
    public TurmaMateriaDTO atualizarMateria(Long turmaId, Long materiaId, TurmaMateriaDTO dto) {
        TurmaMateria materia = turmaMateriaRepository.findByIdAndTurmaId(materiaId, turmaId)
                .orElseThrow(() -> new ResourceNotFoundException("Matéria não encontrada nesta turma."));

        Turma turma = materia.getTurma();
        if (securityService.isEncarregada() && turma != null && turma.getCurso() != null && turma.getCurso().getEscola() != null
                && !securityService.temAcessoAEscola(turma.getCurso().getEscola().getId())) {
            throw new BusinessException("Acesso negado: você não possui permissão para alterar matérias de turmas desta escola.");
        }

        if (dto.getNome() != null && !dto.getNome().trim().isEmpty()) {
            materia.setNome(dto.getNome().trim());
        }
        if (dto.getDuracaoEstimada() != null) {
            materia.setDuracaoEstimada(dto.getDuracaoEstimada().trim());
        }
        if (dto.getProfessorResponsavel() != null) {
            materia.setProfessorResponsavel(dto.getProfessorResponsavel().trim().isEmpty() ? null : dto.getProfessorResponsavel().trim());
        }
        if (dto.getCargaHoraria() != null) {
            materia.setCargaHoraria(dto.getCargaHoraria());
        }
        if (dto.getOrdem() != null) {
            materia.setOrdem(dto.getOrdem());
        }

        TurmaMateria atualizada = turmaMateriaRepository.save(materia);
        return TurmaMateriaDTO.builder()
                .id(atualizada.getId())
                .turmaId(turmaId)
                .nome(atualizada.getNome())
                .duracaoEstimada(atualizada.getDuracaoEstimada())
                .professorResponsavel(atualizada.getProfessorResponsavel())
                .cargaHoraria(atualizada.getCargaHoraria())
                .ordem(atualizada.getOrdem())
                .build();
    }

    @CacheEvict(value = {"turmas", "dashboard_stats"}, allEntries = true)
    @Transactional
    public void removerMateria(Long turmaId, Long materiaId) {
        TurmaMateria materia = turmaMateriaRepository.findByIdAndTurmaId(materiaId, turmaId)
                .orElseThrow(() -> new ResourceNotFoundException("Matéria não encontrada nesta turma."));

        Turma turma = materia.getTurma();
        if (securityService.isEncarregada() && turma != null && turma.getCurso() != null && turma.getCurso().getEscola() != null
                && !securityService.temAcessoAEscola(turma.getCurso().getEscola().getId())) {
            throw new BusinessException("Acesso negado: você não possui permissão para excluir matérias de turmas desta escola.");
        }

        long totalPresencas = registroPresencaRepository.countByMateriaId(materiaId);
        if (totalPresencas > 0) {
            throw new BusinessException("Esta matéria já possui " + totalPresencas + " registro(s) de chamada realizada no Diário de Classe e não pode ser excluída para preservar o histórico pedagógico dos alunos.");
        }

        if (turma != null && turma.getMaterias() != null) {
            turma.getMaterias().remove(materia);
        }
        turmaMateriaRepository.delete(materia);
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
                        .professorResponsavel(m.getProfessorResponsavel())
                        .cargaHoraria(m.getCargaHoraria())
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
                .status(turma.getStatus())
                .matriculaAberta(turma.isPeriodoMatriculaAberto())
                .educadorResponsavel(turma.getEducadorResponsavel())
                .diasHorariosLocal(turma.getDiasHorariosLocal())
                .materias(materiasDTO)
                .materiasNomes(materiasNomes)
                .build();
    }
}
