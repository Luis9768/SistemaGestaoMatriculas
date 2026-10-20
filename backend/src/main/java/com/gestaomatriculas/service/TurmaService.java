package com.gestaomatriculas.service;

import com.gestaomatriculas.dto.TurmaDTO;
import com.gestaomatriculas.dto.TurmaMateriaDTO;
import com.gestaomatriculas.exception.BusinessException;
import com.gestaomatriculas.exception.ResourceNotFoundException;
import com.gestaomatriculas.model.Curso;
import com.gestaomatriculas.model.Turma;
import com.gestaomatriculas.model.TurmaMateria;
import com.gestaomatriculas.model.enums.ModalidadeCurso;
import com.gestaomatriculas.model.enums.StatusTurma;
import com.gestaomatriculas.model.enums.TipoAcaoAuditoria;
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
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TurmaService {

    private final TurmaRepository turmaRepository;
    private final CursoRepository cursoRepository;
    private final TurmaMateriaRepository turmaMateriaRepository;
    private final RegistroPresencaRepository registroPresencaRepository;
    private final SecurityService securityService;
    private final AuditoriaService auditoriaService;

    private static final java.time.ZoneId ZONE_SP = java.time.ZoneId.of("America/Sao_Paulo");

    private void validarAcessoEscolaCurso(Curso curso, String mensagemErro) {
        if (securityService.isEncarregada() && curso != null && curso.getEscola() != null
                && !securityService.temAcessoAEscola(curso.getEscola().getId())) {
            throw new BusinessException(mensagemErro);
        }
    }

    private TurmaMateriaDTO toMateriaDTO(TurmaMateria m, Long turmaId) {
        return TurmaMateriaDTO.builder()
                .id(m.getId())
                .turmaId(turmaId)
                .nome(m.getNome())
                .duracaoEstimada(m.getDuracaoEstimada())
                .professorResponsavel(m.getProfessorResponsavel())
                .cargaHoraria(m.getCargaHoraria())
                .ordem(m.getOrdem())
                .build();
    }

    @Transactional(readOnly = true)
    public List<TurmaDTO> listarTodas(Long cursoId, Long escolaId, Boolean apenasAbertas) {
        escolaId = securityService.resolverEscolaId(escolaId);
        List<Turma> turmas;
        LocalDate hoje = LocalDate.now(ZONE_SP);

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

        if (securityService.isEncarregada()) {
            turmas = turmas.stream()
                    .filter(t -> t.getCurso() != null
                            && t.getCurso().getEscola() != null
                            && securityService.temAcessoAEscola(t.getCurso().getEscola().getId()))
                    .toList();
        }

        return turmas.stream()
                .sorted((a, b) -> Long.compare(
                        b.getId() != null ? b.getId() : 0L,
                        a.getId() != null ? a.getId() : 0L
                ))
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Cacheable(value = "turmas", key = "#id")
    @Transactional(readOnly = true)
    public TurmaDTO buscarPorId(Long id) {
        Turma turma = turmaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Turma não encontrada com id: " + id));
        validarAcessoEscolaCurso(turma.getCurso(), "Acesso negado: você não possui permissão para visualizar turmas desta escola.");
        return toDTO(turma);
    }

    @Transactional(readOnly = true)
    public String gerarProximoCodigo(Long cursoId) {
        Curso curso = cursoRepository.findById(cursoId)
                .orElseThrow(() -> new ResourceNotFoundException("Curso não encontrado com id: " + cursoId));
        validarAcessoEscolaCurso(curso, "Acesso negado: você não possui permissão para abrir turmas nesta escola.");
        return gerarProximoCodigoParaEscola(curso);
    }

    private synchronized String gerarProximoCodigoParaEscola(Curso curso) {
        String sigla = (curso.getEscola() != null && curso.getEscola().getSigla() != null && !curso.getEscola().getSigla().isBlank())
                ? curso.getEscola().getSigla().trim().toUpperCase()
                : "TURMA";
        int anoAtual = LocalDate.now(ZONE_SP).getYear();

        Pattern padrao = Pattern.compile("^" + Pattern.quote(sigla) + "-(\\d+)-" + anoAtual + "$", Pattern.CASE_INSENSITIVE);
        List<Turma> turmasEscola = (curso.getEscola() != null && curso.getEscola().getId() != null)
                ? turmaRepository.findByCursoEscolaId(curso.getEscola().getId())
                : turmaRepository.findAll();
        int maxSeq = 0;

        for (Turma t : turmasEscola) {
            if (t.getCodigo() != null) {
                Matcher matcher = padrao.matcher(t.getCodigo().trim());
                if (matcher.matches()) {
                    try {
                        int num = Integer.parseInt(matcher.group(1));
                        if (num > maxSeq) {
                            maxSeq = num;
                        }
                    } catch (NumberFormatException ignored) {
                    }
                }
            }
        }

        int proximoNumero = maxSeq + 1;
        String codigoGerado = String.format("%s-%02d-%d", sigla, proximoNumero, anoAtual);
        while (turmaRepository.findByCodigo(codigoGerado).isPresent()) {
            proximoNumero++;
            codigoGerado = String.format("%s-%02d-%d", sigla, proximoNumero, anoAtual);
        }
        return codigoGerado;
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

        // Geração automática do código da turma (ex: ELT-01-2026, ELT-02-2026)
        String codigoGerado = gerarProximoCodigoParaEscola(curso);

        Turma turma = Turma.builder()
                .curso(curso)
                .codigo(codigoGerado)
                .dataAberturaMatricula(dto.getDataAberturaMatricula())
                .dataFechamentoMatricula(dto.getDataFechamentoMatricula())
                .dataInicioSuplencia(dto.getDataInicioSuplencia())
                .dataFimSuplencia(dto.getDataFimSuplencia())
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

        String siglaEscolaCriada = (salva.getCurso() != null && salva.getCurso().getEscola() != null)
                ? salva.getCurso().getEscola().getSigla() : null;
        Long idEscolaCriada = (salva.getCurso() != null && salva.getCurso().getEscola() != null)
                ? salva.getCurso().getEscola().getId() : null;

        auditoriaService.registrarAcao(
                TipoAcaoAuditoria.CRIACAO_TURMA,
                "Turma",
                salva.getCodigo(),
                String.format("Turma %s criada com %d vagas para o curso %s [%s]",
                        salva.getCodigo(), salva.getVagasTotais(), curso.getNome(), siglaEscolaCriada != null ? siglaEscolaCriada : "REDE"),
                idEscolaCriada,
                siglaEscolaCriada
        );

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

        if (dto.getCodigo() != null && !dto.getCodigo().isBlank() && !turma.getCodigo().equals(dto.getCodigo())) {
            turmaRepository.findByCodigo(dto.getCodigo()).ifPresent(t -> {
                throw new BusinessException("Já existe uma turma cadastrada com o código: " + dto.getCodigo());
            });
            turma.setCodigo(dto.getCodigo());
        }

        Curso curso = cursoRepository.findById(dto.getCursoId())
                .orElseThrow(() -> new ResourceNotFoundException("Curso não encontrado com id: " + dto.getCursoId()));

        if (securityService.isEncarregada() && curso.getEscola() != null && !securityService.temAcessoAEscola(curso.getEscola().getId())) {
            throw new BusinessException("Acesso negado: você não possui permissão para vincular esta turma a uma escola não autorizada.");
        }

        turma.setCurso(curso);
        turma.setDataAberturaMatricula(dto.getDataAberturaMatricula());
        turma.setDataFechamentoMatricula(dto.getDataFechamentoMatricula());
        turma.setDataInicioSuplencia(dto.getDataInicioSuplencia());
        turma.setDataFimSuplencia(dto.getDataFimSuplencia());
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

        // Apenas cursos da modalidade FORMACAO podem ter matérias customizadas
        boolean isFormacao = curso.getModalidade() == ModalidadeCurso.FORMACAO;
        boolean temMateriasNoDto = isFormacao && ((dto.getMaterias() != null && !dto.getMaterias().isEmpty())
                || (dto.getMateriasNomes() != null && !dto.getMateriasNomes().isEmpty()));

        if (temMateriasNoDto) {
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

        String siglaEscolaAtu = (atualizada.getCurso() != null && atualizada.getCurso().getEscola() != null)
                ? atualizada.getCurso().getEscola().getSigla() : null;
        Long idEscolaAtu = (atualizada.getCurso() != null && atualizada.getCurso().getEscola() != null)
                ? atualizada.getCurso().getEscola().getId() : null;

        auditoriaService.registrarAcao(
                TipoAcaoAuditoria.ATUALIZACAO_TURMA,
                "Turma",
                atualizada.getCodigo(),
                String.format("Turma %s atualizada (Vagas: %d, Status: %s) [%s]",
                        atualizada.getCodigo(), atualizada.getVagasTotais(), atualizada.getStatus(), siglaEscolaAtu != null ? siglaEscolaAtu : "REDE"),
                idEscolaAtu,
                siglaEscolaAtu
        );

        return toDTO(atualizada);
    }

    private void processarMaterias(Turma turma, TurmaDTO dto) {
        Curso curso = turma.getCurso();
        ModalidadeCurso mod = curso != null ? curso.getModalidade() : null;

        // Núcleos e Oficinas não possuem adição de matérias: cria 1 registro base interno com o nome do curso para suporte ao Diário de Chamadas
        if (mod != ModalidadeCurso.FORMACAO) {
            String nomeBase = curso != null && curso.getNome() != null ? curso.getNome() : "Aula Regular";
            TurmaMateria base = TurmaMateria.builder()
                    .turma(turma)
                    .nome(nomeBase)
                    .cargaHoraria(curso != null ? curso.getCargaHoraria() : null)
                    .professorResponsavel(turma.getEducadorResponsavel())
                    .ordem(1)
                    .build();
            TurmaMateria salva = turmaMateriaRepository.save(base);
            if (turma.getMaterias() == null) {
                turma.setMaterias(new ArrayList<>());
            } else {
                turma.getMaterias().clear();
            }
            turma.getMaterias().add(salva);
            return;
        }

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
        } else if (curso.getDisciplinas() != null && !curso.getDisciplinas().isEmpty()) {
            int ordem = 1;
            for (var disc : curso.getDisciplinas()) {
                novasMaterias.add(TurmaMateria.builder()
                        .turma(turma)
                        .nome(disc.getNome())
                        .cargaHoraria(disc.getCargaHoraria())
                        .professorResponsavel(disc.getProfessorResponsavel())
                        .ordem(ordem++)
                        .build());
            }
        } else {
            novasMaterias.add(TurmaMateria.builder()
                    .turma(turma)
                    .nome(curso.getNome())
                    .cargaHoraria(curso.getCargaHoraria())
                    .professorResponsavel(turma.getEducadorResponsavel())
                    .ordem(1)
                    .build());
        }

        if (!novasMaterias.isEmpty()) {
            turmaMateriaRepository.saveAll(novasMaterias);
            if (turma.getMaterias() == null) {
                turma.setMaterias(new ArrayList<>());
            } else {
                turma.getMaterias().clear();
            }
            turma.getMaterias().addAll(novasMaterias);
        }
    }

    private void validarDatas(TurmaDTO dto) {
        if (dto.getDataAberturaMatricula().isAfter(dto.getDataFechamentoMatricula())) {
            throw new BusinessException("A data de início das inscrições deve ser anterior ou igual ao fim das inscrições.");
        }
        if (dto.getDataInicioSuplencia() != null && dto.getDataFimSuplencia() != null) {
            if (dto.getDataInicioSuplencia().isAfter(dto.getDataFimSuplencia())) {
                throw new BusinessException("A data de início das suplências deve ser anterior ou igual ao fim das suplências.");
            }
            if (dto.getDataInicioSuplencia().isBefore(dto.getDataAberturaMatricula())) {
                throw new BusinessException("O início das suplências não pode ocorrer antes do início das inscrições.");
            }
            if (dto.getDataFimSuplencia().isAfter(dto.getDataFimAulas())) {
                throw new BusinessException("O fim das suplências não pode ocorrer após o término das aulas.");
            }
        }
        if (dto.getDataInicioAulas().isAfter(dto.getDataFimAulas())) {
            throw new BusinessException("A data de início das aulas deve ser anterior à data de término das aulas.");
        }
        if (dto.getDataFechamentoMatricula().isAfter(dto.getDataFimAulas())) {
            throw new BusinessException("O fim das inscrições não pode ocorrer após o término das aulas.");
        }
    }

    @Transactional
    public List<TurmaMateriaDTO> listarMaterias(Long turmaId) {
        Turma turma = turmaRepository.findById(turmaId)
                .orElseThrow(() -> new ResourceNotFoundException("Turma não encontrada com id: " + turmaId));

        validarAcessoEscolaCurso(turma.getCurso(), "Acesso negado: você não possui permissão para consultar matérias desta escola.");

        List<TurmaMateria> lista = turmaMateriaRepository.findByTurmaIdOrderByOrdemAscIdAsc(turmaId);
        if (lista.isEmpty()) {
            Curso c = turma.getCurso();
            TurmaMateria padrao = turmaMateriaRepository.save(TurmaMateria.builder()
                    .turma(turma)
                    .nome(c != null && c.getNome() != null ? c.getNome() : "Aula Regular")
                    .cargaHoraria(c != null ? c.getCargaHoraria() : null)
                    .professorResponsavel(turma.getEducadorResponsavel())
                    .ordem(1)
                    .build());
            lista = List.of(padrao);
        }

        // Para Núcleos e Oficinas, retorna apenas a matéria única base (não há subdivisão de matérias)
        if (turma.getCurso() != null && turma.getCurso().getModalidade() != ModalidadeCurso.FORMACAO && lista.size() > 1) {
            lista = List.of(lista.get(0));
        }

        return lista.stream()
                .map(m -> toMateriaDTO(m, turmaId))
                .toList();
    }

    @CacheEvict(value = {"turmas", "dashboard_stats"}, allEntries = true)
    @Transactional
    public TurmaMateriaDTO adicionarMateria(Long turmaId, TurmaMateriaDTO dto) {
        Turma turma = turmaRepository.findById(turmaId)
                .orElseThrow(() -> new ResourceNotFoundException("Turma não encontrada com id: " + turmaId));

        if (turma.getCurso() != null && turma.getCurso().getModalidade() != ModalidadeCurso.FORMACAO) {
            throw new BusinessException("Apenas cursos da modalidade Formação possuem adição e edição de matérias. Núcleos e Oficinas são de curta duração.");
        }

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

        String siglaEscolaMat = (turma.getCurso() != null && turma.getCurso().getEscola() != null)
                ? turma.getCurso().getEscola().getSigla() : null;
        Long idEscolaMat = (turma.getCurso() != null && turma.getCurso().getEscola() != null)
                ? turma.getCurso().getEscola().getId() : null;

        auditoriaService.registrarAcao(
                TipoAcaoAuditoria.CRIACAO_MATERIA,
                "Disciplina",
                String.valueOf(salva.getId()),
                String.format("Disciplina %s adicionada à turma %s [%s]",
                        salva.getNome(), turma.getCodigo(), siglaEscolaMat != null ? siglaEscolaMat : "REDE"),
                idEscolaMat,
                siglaEscolaMat
        );

        return toMateriaDTO(salva, turmaId);
    }

    @CacheEvict(value = {"turmas", "dashboard_stats"}, allEntries = true)
    @Transactional
    public TurmaMateriaDTO atualizarMateria(Long turmaId, Long materiaId, TurmaMateriaDTO dto) {
        TurmaMateria materia = turmaMateriaRepository.findByIdAndTurmaId(materiaId, turmaId)
                .orElseThrow(() -> new ResourceNotFoundException("Matéria não encontrada nesta turma."));

        Turma turma = materia.getTurma();
        if (turma != null && turma.getCurso() != null && turma.getCurso().getModalidade() != ModalidadeCurso.FORMACAO) {
            throw new BusinessException("Apenas cursos da modalidade Formação possuem edição de matérias. Núcleos e Oficinas são de curta duração.");
        }

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
        return toMateriaDTO(atualizada, turmaId);
    }

    @CacheEvict(value = {"turmas", "dashboard_stats"}, allEntries = true)
    @Transactional
    public void removerMateria(Long turmaId, Long materiaId) {
        TurmaMateria materia = turmaMateriaRepository.findByIdAndTurmaId(materiaId, turmaId)
                .orElseThrow(() -> new ResourceNotFoundException("Matéria não encontrada nesta turma."));

        Turma turma = materia.getTurma();
        if (turma != null && turma.getCurso() != null && turma.getCurso().getModalidade() != ModalidadeCurso.FORMACAO) {
            throw new BusinessException("Apenas cursos da modalidade Formação possuem gerenciamento de matérias. Núcleos e Oficinas são de curta duração.");
        }

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
        ModalidadeCurso cursoModalidade = null;

        if (turma.getCurso() != null) {
            cursoModalidade = turma.getCurso().getModalidade();
            if (turma.getCurso().getEscola() != null) {
                escolaId = turma.getCurso().getEscola().getId();
                escolaNome = turma.getCurso().getEscola().getNome();
                escolaSigla = turma.getCurso().getEscola().getSigla();
            }
        }

        List<TurmaMateriaDTO> materiasDTO = new ArrayList<>();
        List<String> materiasNomes = new ArrayList<>();
        if (turma.getMaterias() != null && !turma.getMaterias().isEmpty()) {
            List<TurmaMateria> sourceList = (cursoModalidade != ModalidadeCurso.FORMACAO && turma.getMaterias().size() > 1)
                    ? List.of(turma.getMaterias().get(0))
                    : turma.getMaterias();
            for (TurmaMateria m : sourceList) {
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

        LocalDate inicioSuplencia = turma.getDataInicioSuplencia() != null
                ? turma.getDataInicioSuplencia()
                : (turma.getDataFechamentoMatricula() != null ? turma.getDataFechamentoMatricula().plusDays(1) : null);
        LocalDate fimSuplencia = turma.getDataFimSuplencia() != null
                ? turma.getDataFimSuplencia()
                : (inicioSuplencia != null ? inicioSuplencia.plusDays(7) : null);

        return TurmaDTO.builder()
                .id(turma.getId())
                .cursoId(turma.getCurso().getId())
                .cursoNome(turma.getCurso().getNome())
                .cursoModalidade(cursoModalidade)
                .escolaId(escolaId)
                .escolaNome(escolaNome)
                .escolaSigla(escolaSigla)
                .codigo(turma.getCodigo())
                .dataAberturaMatricula(turma.getDataAberturaMatricula())
                .dataFechamentoMatricula(turma.getDataFechamentoMatricula())
                .dataInicioSuplencia(inicioSuplencia)
                .dataFimSuplencia(fimSuplencia)
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
