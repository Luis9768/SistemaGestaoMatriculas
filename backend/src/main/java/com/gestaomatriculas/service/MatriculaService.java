package com.gestaomatriculas.service;

import com.gestaomatriculas.dto.*;
import com.gestaomatriculas.exception.BusinessException;
import com.gestaomatriculas.exception.ResourceNotFoundException;
import com.gestaomatriculas.model.*;
import com.gestaomatriculas.model.enums.CanalOrigem;
import com.gestaomatriculas.model.enums.ModalidadeCurso;
import com.gestaomatriculas.model.enums.StatusMatricula;
import com.gestaomatriculas.model.enums.StatusPresenca;
import com.gestaomatriculas.repository.AlunoRepository;
import com.gestaomatriculas.repository.MatriculaRepository;
import com.gestaomatriculas.repository.RegistroPresencaRepository;
import com.gestaomatriculas.repository.TurmaRepository;
import com.gestaomatriculas.security.SecurityService;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.Period;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MatriculaService {

    private final MatriculaRepository matriculaRepository;
    private final TurmaRepository turmaRepository;
    private final AlunoRepository alunoRepository;
    private final AlunoService alunoService;
    private final RegistroPresencaRepository registroPresencaRepository;
    private final SecurityService securityService;

    @Transactional(readOnly = true)
    public List<MatriculaDTO> listar(Long escolaId, Long turmaId, Long alunoId, CanalOrigem canal, StatusMatricula status) {
        escolaId = securityService.resolverEscolaId(escolaId);
        List<Matricula> matriculas;

        if (escolaId != null) {
            matriculas = matriculaRepository.findByTurmaCursoEscolaId(escolaId);
            if (turmaId != null) {
                matriculas = matriculas.stream().filter(m -> m.getTurma().getId().equals(turmaId)).collect(Collectors.toList());
            }
            if (alunoId != null) {
                matriculas = matriculas.stream().filter(m -> m.getAluno().getId().equals(alunoId)).collect(Collectors.toList());
            }
            if (canal != null) {
                matriculas = matriculas.stream().filter(m -> m.getCanalOrigem() == canal).collect(Collectors.toList());
            }
            if (status != null) {
                matriculas = matriculas.stream().filter(m -> m.getStatus() == status).collect(Collectors.toList());
            }
        } else if (turmaId != null) {
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

    @CacheEvict(value = {"turmas", "dashboard_stats"}, allEntries = true)
    @Transactional
    public MatriculaDTO matricular(MatriculaDTO dto) {
        Aluno aluno = alunoRepository.findById(dto.getAlunoId())
                .orElseThrow(() -> new ResourceNotFoundException("Aluno não encontrado com id: " + dto.getAlunoId()));

        Turma turma = turmaRepository.findByIdWithLock(dto.getTurmaId())
                .orElseThrow(() -> new ResourceNotFoundException("Turma não encontrada com id: " + dto.getTurmaId()));

        if (securityService.isEncarregada() && turma.getCurso() != null && turma.getCurso().getEscola() != null
                && !securityService.temAcessoAEscola(turma.getCurso().getEscola().getId())) {
            throw new BusinessException("Acesso negado: você não possui permissão para realizar matrículas para esta escola.");
        }

        return realizarMatricula(aluno, turma, dto.getCanalOrigem(), dto.getObservacoes());
    }

    @CacheEvict(value = {"turmas", "dashboard_stats"}, allEntries = true)
    @Transactional
    public MatriculaDTO inscrever(InscricaoExternaDTO dto) {
        Turma turma = turmaRepository.findByIdWithLock(dto.getTurmaId())
                .orElseThrow(() -> new ResourceNotFoundException("Turma não encontrada com id: " + dto.getTurmaId()));

        Aluno aluno = alunoService.obterOuCriar(
                dto.getNome(),
                dto.getCpf(),
                dto.getEmail(),
                dto.getTelefone(),
                dto.getDataNascimento(),
                dto.getResponsavelNome(),
                dto.getResponsavelCpf(),
                dto.getResponsavelTelefone(),
                dto.getResponsavelEmail(),
                dto.getResponsavelParentesco(),
                dto.getEndereco(),
                dto.getBairro(),
                dto.getCidade(),
                dto.getCep(),
                dto.getGenero(),
                dto.getNeurodiverso(),
                dto.getNeurodiversoDetalhe(),
                dto.getPcd(),
                dto.getPcdDetalhe(),
                dto.getContatoEmergencia(),
                dto.getConsentimentoLgpdDadosSensiveis(),
                dto.getConsentimentoUsoImagem(),
                dto.getTermoPapelEntregue()
        );

        return realizarMatricula(aluno, turma, dto.getCanalOrigem(), dto.getObservacoes());
    }

    @CacheEvict(value = {"turmas", "dashboard_stats"}, allEntries = true)
    @Transactional
    public MatriculaDTO cancelarMatricula(Long id) {
        Matricula matricula = matriculaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Matrícula não encontrada com id: " + id));

        if (securityService.isEncarregada() && matricula.getTurma() != null && matricula.getTurma().getCurso() != null
                && matricula.getTurma().getCurso().getEscola() != null
                && !securityService.temAcessoAEscola(matricula.getTurma().getCurso().getEscola().getId())) {
            throw new BusinessException("Acesso negado: você não possui permissão para cancelar matrículas desta escola.");
        }

        if (matricula.getStatus() == StatusMatricula.CANCELADA) {
            throw new BusinessException("Esta matrícula já está cancelada.");
        }

        StatusMatricula statusAnterior = matricula.getStatus();
        matricula.setStatus(StatusMatricula.CANCELADA);
        Matricula atualizada = matriculaRepository.save(matricula);

        Turma turma = matricula.getTurma();
        if (statusAnterior == StatusMatricula.CONFIRMADA && turma != null && turma.getVagasOcupadas() > 0) {
            turma.setVagasOcupadas(turma.getVagasOcupadas() - 1);
            turmaRepository.save(turma);
        }

        return toDTO(atualizada);
    }

    @CacheEvict(value = {"turmas", "dashboard_stats"}, allEntries = true)
    @Transactional
    public MatriculaDTO desligarPorFaltas(Long id, String motivo) {
        Matricula matricula = matriculaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Matrícula não encontrada com id: " + id));

        if (matricula.getStatus() == StatusMatricula.DESISTENTE_FALTAS || matricula.getStatus() == StatusMatricula.CANCELADA) {
            throw new BusinessException("Esta matrícula já se encontra inativa ou desligada.");
        }

        StatusMatricula statusAnteriorDesligamento = matricula.getStatus();
        matricula.setStatus(StatusMatricula.DESISTENTE_FALTAS);
        String obsAtual = matricula.getObservacoes() != null ? matricula.getObservacoes() + " | " : "";
        matricula.setObservacoes(obsAtual + (motivo != null ? motivo : "Desligamento por faltas consecutivas confirmado pela secretaria após tentativa de contato prévio via WhatsApp/E-mail."));
        Matricula atualizada = matriculaRepository.save(matricula);

        Turma turma = matricula.getTurma();
        if (statusAnteriorDesligamento == StatusMatricula.CONFIRMADA && turma != null && turma.getVagasOcupadas() > 0) {
            turma.setVagasOcupadas(turma.getVagasOcupadas() - 1);
            turmaRepository.save(turma);
        }

        return toDTO(atualizada);
    }

    @CacheEvict(value = {"turmas", "dashboard_stats"}, allEntries = true)
    @Transactional
    public MatriculaDTO promoverSuplente(Long id) {
        Matricula matricula = matriculaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Matrícula não encontrada com id: " + id));

        Turma turma = matricula.getTurma();
        if (securityService.isEncarregada() && turma != null && turma.getCurso() != null && turma.getCurso().getEscola() != null
                && !securityService.temAcessoAEscola(turma.getCurso().getEscola().getId())) {
            throw new BusinessException("Acesso negado: você não possui permissão para gerenciar suplentes desta escola.");
        }
        if (!turma.isChamadaSuplenciaPermitida()) {
            throw new BusinessException("O prazo limite para convocação de suplentes desta turma foi encerrado ("
                    + turma.getDiasToleranciaSuplencia() + " dias após o início das aulas).");
        }
        if (!turma.temVagasDisponiveis()) {
            throw new BusinessException("Não há vagas disponíveis na turma para promover o suplente.");
        }

        matricula.setStatus(StatusMatricula.CONFIRMADA);
        String obsAtual = matricula.getObservacoes() != null ? matricula.getObservacoes() + " | " : "";
        matricula.setObservacoes(obsAtual + "Promovido da Fila de Espera para Matrícula Confirmada após convocação (WhatsApp/E-mail).");
        Matricula atualizada = matriculaRepository.save(matricula);

        turma.setVagasOcupadas(turma.getVagasOcupadas() + 1);
        turmaRepository.save(turma);

        return toDTO(atualizada);
    }

    private MatriculaDTO realizarMatricula(Aluno aluno, Turma turma, CanalOrigem canal, String observacoes) {
        // Validação de re-matrícula: impede duplicata se houver matrícula ativa
        if (matriculaRepository.existsByAlunoIdAndTurmaIdAndStatusNot(aluno.getId(), turma.getId(), StatusMatricula.CANCELADA)) {
            throw new BusinessException("O aluno " + aluno.getNome() + " já possui matrícula ativa nesta turma (" + turma.getCodigo() + ").");
        }

        // Validação de Faixa Etária
        if (aluno.getDataNascimento() != null) {
            int idade = Period.between(aluno.getDataNascimento(), LocalDate.now()).getYears();
            if (!turma.isIdadePermitida(idade)) {
                String min = turma.getIdadeMinima() != null ? turma.getIdadeMinima() + " anos" : "Livre";
                String max = turma.getIdadeMaxima() != null ? turma.getIdadeMaxima() + " anos" : "Livre";
                throw new BusinessException(String.format("Idade do aluno (%d anos) fora da faixa permitida para esta turma (%s a %s).", idade, min, max));
            }
        }

        if (!turma.isPeriodoMatriculaAberto()) {
            throw new BusinessException("O período de inscrições para a turma " + turma.getCodigo() + " está encerrado ou ainda não abriu.");
        }

        if (!turma.temVagasDisponiveis()) {
            throw new BusinessException("Não há vagas disponíveis para a turma " + turma.getCodigo() + ".");
        }

        // Conforme diretriz da coordenação: a seleção das Formações ocorre externamente pelos professores.
        // O sistema contempla apenas o pós-seleção, portanto a matrícula já ingressa como CONFIRMADA.
        StatusMatricula statusInicial = StatusMatricula.CONFIRMADA;

        Matricula matricula = Matricula.builder()
                .aluno(aluno)
                .turma(turma)
                .canalOrigem(canal != null ? canal : CanalOrigem.SITE)
                .status(statusInicial)
                .observacoes(observacoes)
                .build();

        Matricula salva = matriculaRepository.save(matricula);

        turma.setVagasOcupadas(turma.getVagasOcupadas() + 1);
        turmaRepository.save(turma);

        return toDTO(salva);
    }

    public MatriculaDTO toDTO(Matricula m) {
        Long escolaId = null;
        String escolaNome = null;
        String escolaSigla = null;

        if (m.getTurma().getCurso() != null && m.getTurma().getCurso().getEscola() != null) {
            escolaId = m.getTurma().getCurso().getEscola().getId();
            escolaNome = m.getTurma().getCurso().getEscola().getNome();
            escolaSigla = m.getTurma().getCurso().getEscola().getSigla();
        }

        String respNome = null;
        String respTelefone = null;
        if (m.getAluno().getResponsavel() != null) {
            respNome = m.getAluno().getResponsavel().getNome();
            respTelefone = m.getAluno().getResponsavel().getTelefone();
        }

        return MatriculaDTO.builder()
                .id(m.getId())
                .alunoId(m.getAluno().getId())
                .alunoNome(m.getAluno().getNome())
                .alunoCpf(m.getAluno().getCpf())
                .alunoEmail(m.getAluno().getEmail())
                .alunoTelefone(m.getAluno().getTelefone())
                .alunoMenorDeIdade(m.getAluno().isMenorDeIdade())
                .turmaId(m.getTurma().getId())
                .turmaCodigo(m.getTurma().getCodigo())
                .cursoNome(m.getTurma().getCurso().getNome())
                .escolaId(escolaId)
                .escolaNome(escolaNome)
                .escolaSigla(escolaSigla)
                .responsavelNome(respNome)
                .responsavelTelefone(respTelefone)
                .dataMatricula(m.getDataMatricula())
                .canalOrigem(m.getCanalOrigem())
                .status(m.getStatus())
                .observacoes(m.getObservacoes())
                .build();
    }

    @Transactional
    public MatriculaDTO concluirMatricula(Long id) {
        Matricula matricula = matriculaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Matrícula não encontrada com id: " + id));

        if (matricula.getStatus() == StatusMatricula.CANCELADA || matricula.getStatus() == StatusMatricula.DESISTENTE_FALTAS) {
            throw new BusinessException("Não é possível concluir uma matrícula inativa, cancelada ou desligada por faltas.");
        }

        // Calcula a frequência apurada
        List<RegistroPresenca> presencas = registroPresencaRepository.findByMatriculaIdOrderByDataAulaAsc(id);
        long totalAulas = presencas.size();
        long presencasValidas = presencas.stream()
                .filter(p -> p.getStatus() == StatusPresenca.PRESENTE || p.getStatus() == StatusPresenca.JUSTIFICADA)
                .count();
        double pct = totalAulas > 0 ? ((double) presencasValidas / totalAulas) * 100.0 : 100.0;
        double pctArredondada = Math.round(pct * 10.0) / 10.0;

        // Regra Oficial: Mínimo de 75% de presença para se formar
        if (pctArredondada < 75.0) {
            matricula.setStatus(StatusMatricula.REPROVADA);
            String obsAtual = matricula.getObservacoes() != null ? matricula.getObservacoes() + " | " : "";
            matricula.setObservacoes(obsAtual + String.format(Locale.US,
                    "Reprovado por insuficiência de frequência: %.1f%% apurado (mínimo obrigatório: 75.0%%).", pctArredondada));
            matriculaRepository.save(matricula);
            throw new BusinessException(String.format(Locale.US,
                    "O aluno não atingiu o índice mínimo de 75%% de presença exigido para formatura (Apurado: %.1f%%). Status atualizado para REPROVADA.", pctArredondada));
        }

        matricula.setStatus(StatusMatricula.CONCLUIDA);
        String obsAtual = matricula.getObservacoes() != null ? matricula.getObservacoes() + " | " : "";
        matricula.setObservacoes(obsAtual + String.format(Locale.US,
                "Curso concluído com sucesso e aptidão para certificado de formação (Frequência final: %.1f%%).", pctArredondada));
        Matricula atualizada = matriculaRepository.save(matricula);
        return toDTO(atualizada);
    }

    @Transactional(readOnly = true)
    public CertificadoDTO gerarCertificado(Long id) {
        Matricula matricula = matriculaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Matrícula não encontrada com id: " + id));

        Turma turma = matricula.getTurma();
        Curso curso = turma != null ? turma.getCurso() : null;
        Escola escola = curso != null ? curso.getEscola() : null;
        Aluno aluno = matricula.getAluno();

        List<RegistroPresenca> presencas = registroPresencaRepository.findByMatriculaIdOrderByDataAulaAsc(id);
        long totalAulas = presencas.size();
        long presencasValidas = presencas.stream()
                .filter(p -> p.getStatus() == StatusPresenca.PRESENTE || p.getStatus() == StatusPresenca.JUSTIFICADA)
                .count();
        double pct = totalAulas > 0 ? ((double) presencasValidas / totalAulas) * 100.0 : 100.0;
        double pctArredondada = Math.round(pct * 10.0) / 10.0;

        if (matricula.getStatus() != StatusMatricula.CONCLUIDA) {
            throw new BusinessException("Certificado disponível apenas após a conclusão oficial do curso pela Secretaria.");
        }

        if (pctArredondada < 75.0) {
            throw new BusinessException(String.format(Locale.US,
                    "Não é permitida a emissão de certificado: frequência final de %.1f%% é inferior ao mínimo obrigatório de 75.0%%.", pctArredondada));
        }

        LocalDate dataInicio = turma != null && turma.getDataInicioAulas() != null ? turma.getDataInicioAulas() : matricula.getDataMatricula().toLocalDate();
        LocalDate dataFim = turma != null && turma.getDataFimAulas() != null ? turma.getDataFimAulas() : LocalDate.now();

        DateTimeFormatter dtfExtenso = DateTimeFormatter.ofPattern("d 'de' MMMM 'de' yyyy", Locale.forLanguageTag("pt-BR"));
        String periodo = String.format("%s a %s", dataInicio.format(dtfExtenso), dataFim.format(dtfExtenso));

        int cargaHoraria = (curso != null && curso.getCargaHoraria() != null) ? curso.getCargaHoraria() : 80;
        String cargaExtenso = cargaHoraria + " horas";

        String codigoAutenticidade = String.format("CERT-%s-%d-%05d",
                escola != null ? escola.getSigla() : "SIGMA",
                dataFim.getYear(),
                matricula.getId());

        String numeroRegistroLivro = String.format("Livro %02d • Folha %03d • Registro Geral nº %04d/%d",
                (matricula.getId() / 100) + 1,
                (matricula.getId() % 100) + 1,
                matricula.getId(),
                dataFim.getYear());

        List<TurmaMateriaDTO> materiasDTO = new ArrayList<>();
        if (turma != null && turma.getMaterias() != null) {
            for (TurmaMateria m : turma.getMaterias()) {
                materiasDTO.add(TurmaMateriaDTO.builder()
                        .id(m.getId())
                        .turmaId(turma.getId())
                        .nome(m.getNome())
                        .duracaoEstimada(m.getDuracaoEstimada() != null ? m.getDuracaoEstimada() : (cargaHoraria / Math.max(1, turma.getMaterias().size())) + "h")
                        .ordem(m.getOrdem())
                        .build());
            }
        }

        return CertificadoDTO.builder()
                .matriculaId(matricula.getId())
                .codigoAutenticidade(codigoAutenticidade)
                .numeroRegistroLivro(numeroRegistroLivro)
                .orgaoExpedidor("Prefeitura Municipal de Santo André • Secretaria de Cultura")
                .alunoId(aluno.getId())
                .alunoNome(aluno.getNome())
                .alunoCpf(aluno.getCpf())
                .alunoDataNascimento(aluno.getDataNascimento())
                .escolaNome(escola != null ? escola.getNome() : "Escolas Livres de Santo André")
                .escolaSigla(escola != null ? escola.getSigla() : "EL")
                .escolaCorTema(escola != null ? escola.getCorTema() : "violet")
                .cursoNome(curso != null ? curso.getNome() : "Curso de Formação Artística")
                .cursoModalidade(curso != null && curso.getModalidade() != null ? curso.getModalidade().name() : "LIVRE")
                .cargaHorariaTotal(cargaHoraria)
                .cargaHorariaExtenso(cargaExtenso)
                .turmaCodigo(turma != null ? turma.getCodigo() : "")
                .dataInicioAulas(dataInicio)
                .dataFimAulas(dataFim)
                .periodoRealizacao(periodo)
                .porcentagemFrequencia(pctArredondada)
                .totalAulas((int) totalAulas)
                .presencasConfirmadas((int) presencasValidas)
                .materiasConcluidas(materiasDTO)
                .amparoLegal("Curso Livre de Formação Artística e Cultural, fundamentado no Art. 42 da Lei Federal nº 9.394/1996 (Diretrizes e Bases da Educação Nacional - LDB) e nas deliberações da Secretaria de Cultura de Santo André.")
                .dataExpedicaoFormatada(LocalDate.now().format(dtfExtenso))
                .cidadeUfExpedicao("Santo André - SP")
                .signatarios(List.of(
                        "Direção das Escolas Livres de Cultura",
                        "Coordenação Pedagógica / Artista Orientador",
                        "Secretaria Municipal de Cultura"
                ))
                .build();
    }

    @Transactional(readOnly = true)
    public DeclaracaoTransporteDTO gerarDeclaracaoTransporte(Long id) {
        Matricula matricula = matriculaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Matrícula não encontrada com id: " + id));

        if (matricula.getStatus() != StatusMatricula.CONFIRMADA && matricula.getStatus() != StatusMatricula.CONCLUIDA) {
            throw new BusinessException("A Declaração para CPTM/SPTrans exige matrícula ativa no curso.");
        }

        Turma turma = matricula.getTurma();
        Curso curso = turma != null ? turma.getCurso() : null;
        Escola escola = curso != null ? curso.getEscola() : null;
        Aluno aluno = matricula.getAluno();

        LocalDate dataInicio = (turma != null && turma.getDataInicioAulas() != null)
                ? turma.getDataInicioAulas()
                : (matricula.getDataMatricula() != null ? matricula.getDataMatricula().toLocalDate() : LocalDate.now());

        LocalDate dataLiberacao = dataInicio.plusDays(60);
        LocalDate hoje = LocalDate.now();

        // Regra Oficial da Diretoria: Apenas após 2 meses (60 dias) para garantir que o aluno se firmou no curso
        if (hoje.isBefore(dataLiberacao)) {
            long diasRestantes = ChronoUnit.DAYS.between(hoje, dataLiberacao);
            DateTimeFormatter dtfSimples = DateTimeFormatter.ofPattern("dd/MM/yyyy");
            throw new BusinessException(String.format(Locale.US,
                    "A Declaração de Transporte Estudantil para CPTM e SPTrans só pode ser emitida após 2 meses (60 dias) de curso para confirmação de assiduidade e vínculo estabilizado. Disponível em %s (faltam %d dias).",
                    dataLiberacao.format(dtfSimples), diasRestantes));
        }

        List<RegistroPresenca> presencas = registroPresencaRepository.findByMatriculaIdOrderByDataAulaAsc(id);
        long totalAulas = presencas.size();
        long presencasValidas = presencas.stream()
                .filter(p -> p.getStatus() == StatusPresenca.PRESENTE || p.getStatus() == StatusPresenca.JUSTIFICADA)
                .count();
        double pct = totalAulas > 0 ? ((double) presencasValidas / totalAulas) * 100.0 : 100.0;
        double pctArredondada = Math.round(pct * 10.0) / 10.0;

        DateTimeFormatter dtfExtenso = DateTimeFormatter.ofPattern("d 'de' MMMM 'de' yyyy", Locale.forLanguageTag("pt-BR"));
        long diasCursados = ChronoUnit.DAYS.between(dataInicio, hoje);

        String enderecoCompleto = "";
        if (aluno.getEndereco() != null && !aluno.getEndereco().isBlank()) {
            enderecoCompleto = aluno.getEndereco();
            if (aluno.getBairro() != null && !aluno.getBairro().isBlank()) enderecoCompleto += ", " + aluno.getBairro();
            if (aluno.getCidade() != null && !aluno.getCidade().isBlank()) enderecoCompleto += " — " + aluno.getCidade() + "/SP";
        } else {
            enderecoCompleto = "Residência declarada no Grande ABC / Santo André - SP";
        }

        String escolaEndereco = switch (escola != null && escola.getSigla() != null ? escola.getSigla().toUpperCase() : "") {
            case "ELD" -> "Centro de Dança de Santo André • Rua Dr. Eduardo Monteiro, 410 - Jardim Bela Vista, Santo André - SP";
            case "ELT" -> "Escola Livre de Teatro • Praça Rui Barbosa, 12 - Santa Teresinha, Santo André - SP";
            case "ELCV" -> "Escola Livre de Cinema e Vídeo • Av. Utinga, 136 - Vila Metalúrgica, Santo André - SP";
            case "EMIA" -> "Escola Municipal de Iniciação Artística • Parque Regional da Criança, Av. Itamarati, 536 - Jaçatuba, Santo André - SP";
            default -> "Secretaria de Cultura • Praça IV Centenário, 01 - Centro, Santo André - SP";
        };

        String codigoAutenticidade = String.format("SIGMA-TRANS-%s-%d-%05d",
                escola != null ? escola.getSigla() : "SP",
                hoje.getYear(),
                matricula.getId());

        int cargaHorariaTotal = curso != null && curso.getCargaHoraria() != null ? curso.getCargaHoraria() : 80;
        int cargaSemanal = Math.max(4, cargaHorariaTotal / Math.max(1, (curso != null && curso.getDuracaoMeses() != null ? curso.getDuracaoMeses() * 4 : 48)));

        return DeclaracaoTransporteDTO.builder()
                .matriculaId(matricula.getId())
                .codigoAutenticidade(codigoAutenticidade)
                .instituicaoEnsino("Prefeitura Municipal de Santo André • Secretaria de Cultura")
                .cnpjInstituicao("46.522.942/0001-30")
                .escolaNome(escola != null ? escola.getNome() : "Escola Livre Municipal")
                .escolaSigla(escola != null ? escola.getSigla() : "EL")
                .escolaEndereco(escolaEndereco)
                .alunoId(aluno.getId())
                .alunoNome(aluno.getNome())
                .alunoCpf(aluno.getCpf())
                .alunoDataNascimento(aluno.getDataNascimento())
                .alunoEnderecoCompleto(enderecoCompleto)
                .alunoNomeResponsavel(aluno.getResponsavel() != null ? aluno.getResponsavel().getNome() : null)
                .cursoNome(curso != null ? curso.getNome() : "Formação Artística Regular")
                .turmaCodigo(turma != null ? turma.getCodigo() : "")
                .modalidadeEnsino("Presencial (Aulas em Sede Oficial)")
                .diasSemanaAulas(turma != null && turma.getDiasHorariosLocal() != null ? turma.getDiasHorariosLocal() : "Segunda a Sexta-feira")
                .horarioTurnoAulas(turma != null && turma.getDiasHorariosLocal() != null ? turma.getDiasHorariosLocal() : "Aulas Regulares Presenciais")
                .cargaHorariaTotal(cargaHorariaTotal)
                .cargaHorariaSemanal(cargaSemanal)
                .dataInicioAulas(dataInicio)
                .dataPrevisaoTermino(turma != null ? turma.getDataFimAulas() : dataInicio.plusMonths(12))
                .diasCursadosCumpridos(diasCursados)
                .porcentagemFrequenciaAtual(pctArredondada)
                .statusMatricula("REGULARMENTE MATRICULADO E ATIVO")
                .orgaosDestinatarios("Companhia Paulista de Trens Metropolitanos (CPTM), São Paulo Transporte S/A (SPTrans), EMTU e operadoras do Sistema Integrado Metropolitano de Transporte")
                .finalidade("Concessão e/ou revalidação do benefício tarifário estudantil de transporte público (Passe Escolar / Passe Livre / Meia Tarifa Estudantil).")
                .textoDeclaracao("Declaramos, para os devidos fins de comprovação junto à CPTM e SPTrans, que o(a) estudante acima identificado(a) encontra-se regularmente matriculado(a) e com frequência ativa no curso presencial indicado, mantendo vínculo letivo efetivo e ininterrupto há mais de 60 (sessenta) dias no presente ano letivo, estando apto(a) à fruição dos benefícios de transporte público municipal e metropolitano.")
                .dataEmissaoFormatada(hoje.format(dtfExtenso))
                .validadeDeclaracao("Válida por 30 (trinta) dias a contar da data de sua expedição.")
                .responsavelSecretaria("Secretaria Escolar Central das Escolas Livres de Santo André")
                .build();
    }

    @Transactional(readOnly = true)
    public DeclaracaoMatriculaDTO gerarDeclaracaoMatricula(Long id) {
        Matricula matricula = matriculaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Matrícula não encontrada com id: " + id));

        Turma turma = matricula.getTurma();
        Curso curso = turma != null ? turma.getCurso() : null;
        Escola escola = curso != null ? curso.getEscola() : null;
        Aluno aluno = matricula.getAluno();

        LocalDate hoje = LocalDate.now();
        LocalDate dataInicio = (turma != null && turma.getDataInicioAulas() != null)
                ? turma.getDataInicioAulas()
                : (matricula.getDataMatricula() != null ? matricula.getDataMatricula().toLocalDate() : hoje);

        LocalDate dataMatr = matricula.getDataMatricula() != null ? matricula.getDataMatricula().toLocalDate() : dataInicio;

        List<RegistroPresenca> presencas = registroPresencaRepository.findByMatriculaIdOrderByDataAulaAsc(id);
        long totalAulas = presencas.size();
        long presencasValidas = presencas.stream()
                .filter(p -> p.getStatus() == StatusPresenca.PRESENTE || p.getStatus() == StatusPresenca.JUSTIFICADA)
                .count();
        double pct = totalAulas > 0 ? ((double) presencasValidas / totalAulas) * 100.0 : 100.0;
        double pctArredondada = Math.round(pct * 10.0) / 10.0;

        DateTimeFormatter dtfExtenso = DateTimeFormatter.ofPattern("d 'de' MMMM 'de' yyyy", Locale.forLanguageTag("pt-BR"));
        DateTimeFormatter dtfMesAno = DateTimeFormatter.ofPattern("MMMM 'de' yyyy", Locale.forLanguageTag("pt-BR"));

        String mesAnoInicio = dataInicio.format(dtfMesAno);
        String dataInicioFormatada = dataInicio.format(dtfExtenso);

        Integer idade = null;
        if (aluno.getDataNascimento() != null) {
            idade = Period.between(aluno.getDataNascimento(), hoje).getYears();
        }

        String enderecoCompleto = "";
        if (aluno.getEndereco() != null && !aluno.getEndereco().isBlank()) {
            enderecoCompleto = aluno.getEndereco();
            if (aluno.getBairro() != null && !aluno.getBairro().isBlank()) enderecoCompleto += ", " + aluno.getBairro();
            if (aluno.getCidade() != null && !aluno.getCidade().isBlank()) enderecoCompleto += " — " + aluno.getCidade() + "/SP";
        } else {
            enderecoCompleto = "Residência declarada no Grande ABC / Santo André - SP";
        }

        String escolaEndereco = switch (escola != null && escola.getSigla() != null ? escola.getSigla().toUpperCase() : "") {
            case "ELD" -> "Centro de Dança de Santo André • Rua Dr. Eduardo Monteiro, 410 - Jardim Bela Vista, Santo André - SP";
            case "ELT" -> "Escola Livre de Teatro • Praça Rui Barbosa, 12 - Santa Teresinha, Santo André - SP";
            case "ELCV" -> "Escola Livre de Cinema e Vídeo • Av. Utinga, 136 - Vila Metalúrgica, Santo André - SP";
            case "EMIA" -> "Escola Municipal de Iniciação Artística • Parque Regional da Criança, Av. Itamarati, 536 - Jaçatuba, Santo André - SP";
            default -> "Secretaria de Cultura • Praça IV Centenário, 01 - Centro, Santo André - SP";
        };

        String codigoAutenticidade = String.format("DECL-%d-%s-%05d",
                hoje.getYear(),
                escola != null ? escola.getSigla() : "SA",
                matricula.getId());

        int cargaHorariaTotal = curso != null && curso.getCargaHoraria() != null ? curso.getCargaHoraria() : 80;

        String horarioAulas = turma != null && turma.getDiasHorariosLocal() != null && !turma.getDiasHorariosLocal().isBlank()
                ? turma.getDiasHorariosLocal()
                : "Aulas Regulares Presenciais";

        String modalidade = curso != null && curso.getModalidade() != null
                ? curso.getModalidade().name()
                : "Formação Artística Regular";

        String texto = String.format(
                "Declaramos, para os devidos fins de direito e comprovação a que se fizer necessário, a pedido da parte interessada, que o(a) estudante %s, inscrito(a) no Cadastro de Pessoas Físicas (CPF) sob o nº %s, encontra-se REGULARMENTE MATRICULADO(A) e com FREQUÊNCIA ATIVA nesta instituição pública de ensino no ano letivo de %d, cursando o programa de %s (Turma %s) desde %s.",
                aluno.getNome(),
                aluno.getCpf(),
                hoje.getYear(),
                curso != null ? curso.getNome() : "Curso Regular",
                turma != null ? turma.getCodigo() : "Geral",
                mesAnoInicio
        );

        return DeclaracaoMatriculaDTO.builder()
                .matriculaId(matricula.getId())
                .codigoAutenticidade(codigoAutenticidade)
                .instituicaoEnsino("Prefeitura Municipal de Santo André • Secretaria de Cultura")
                .cnpjInstituicao("46.522.942/0001-30")
                .escolaNome(escola != null ? escola.getNome() : "Escolas Livres de Santo André")
                .escolaSigla(escola != null ? escola.getSigla() : "EL")
                .escolaEndereco(escolaEndereco)
                .alunoId(aluno.getId())
                .alunoNome(aluno.getNome())
                .alunoCpf(aluno.getCpf())
                .alunoDataNascimento(aluno.getDataNascimento())
                .alunoIdade(idade)
                .alunoEnderecoCompleto(enderecoCompleto)
                .alunoNomeResponsavel(aluno.getResponsavel() != null ? aluno.getResponsavel().getNome() : null)
                .alunoCpfResponsavel(aluno.getResponsavel() != null ? aluno.getResponsavel().getCpf() : null)
                .cursoNome(curso != null ? curso.getNome() : "Curso Regular")
                .turmaCodigo(turma != null ? turma.getCodigo() : "")
                .modalidadeEnsino(modalidade)
                .dataInicioAulas(dataInicio)
                .dataMatricula(dataMatr)
                .mesAnoInicioExtenso(mesAnoInicio)
                .dataInicioExtenso(dataInicioFormatada)
                .diasHorarioAulas(horarioAulas)
                .cargaHorariaTotal(cargaHorariaTotal)
                .porcentagemFrequenciaAtual(pctArredondada)
                .statusMatricula("REGULARMENTE MATRICULADO(A) E ATIVO(A)")
                .anoLetivo(hoje.getYear())
                .textoDeclaracao(texto)
                .dataEmissaoFormatada(hoje.format(dtfExtenso))
                .responsavelSecretaria("Secretaria Acadêmica • Rede de Escolas Livres de Santo André")
                .build();
    }
}
