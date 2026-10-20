package com.gestaomatriculas.service;

import com.gestaomatriculas.dto.*;
import com.gestaomatriculas.exception.BusinessException;
import com.gestaomatriculas.exception.ResourceNotFoundException;
import com.gestaomatriculas.model.*;
import com.gestaomatriculas.model.enums.ModalidadeCurso;
import com.gestaomatriculas.model.enums.StatusMatricula;
import com.gestaomatriculas.model.enums.StatusPresenca;
import com.gestaomatriculas.model.enums.StatusTurma;
import com.gestaomatriculas.repository.*;
import com.gestaomatriculas.security.SecurityService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final MatriculaRepository matriculaRepository;
    private final TurmaRepository turmaRepository;
    private final CursoRepository cursoRepository;
    private final EscolaRepository escolaRepository;
    private final RegistroPresencaRepository registroPresencaRepository;
    private final SecurityService securityService;

    private String mascararCpf(String cpf) {
        if (cpf == null || cpf.isBlank()) {
            return "";
        }
        String digitos = cpf.replaceAll("\\D", "");
        if (digitos.length() != 11) {
            return "***.***.***-**";
        }
        return String.format("***.%s.%s-**", digitos.substring(3, 6), digitos.substring(6, 9));
    }

    @Transactional(readOnly = true)
    public DashboardStatsDTO obterStatsGerais(Long escolaId) {
        escolaId = securityService.resolverEscolaId(escolaId);

        List<Matricula> matriculas = escolaId != null
                ? matriculaRepository.findByTurmaCursoEscolaId(escolaId)
                : matriculaRepository.findAll();

        List<Turma> turmas = escolaId != null
                ? turmaRepository.findByCursoEscolaId(escolaId)
                : turmaRepository.findAll();

        List<Curso> cursos = escolaId != null
                ? cursoRepository.findByEscolaId(escolaId)
                : cursoRepository.findAll();

        if (securityService.isEncarregada() && escolaId == null) {
            matriculas = matriculas.stream()
                    .filter(m -> m.getTurma() != null
                            && m.getTurma().getCurso() != null
                            && m.getTurma().getCurso().getEscola() != null
                            && securityService.temAcessoAEscola(m.getTurma().getCurso().getEscola().getId()))
                    .toList();
            turmas = turmas.stream()
                    .filter(t -> t.getCurso() != null
                            && t.getCurso().getEscola() != null
                            && securityService.temAcessoAEscola(t.getCurso().getEscola().getId()))
                    .toList();
            cursos = cursos.stream()
                    .filter(c -> c.getEscola() != null && securityService.temAcessoAEscola(c.getEscola().getId()))
                    .toList();
        }

        long totalMatriculados = matriculas.stream()
                .filter(m -> m.getStatus() == StatusMatricula.CONFIRMADA)
                .count();

        long totalEvasoes = matriculas.stream()
                .filter(m -> m.getStatus() == StatusMatricula.DESISTENTE_FALTAS)
                .count();

        long totalCancelados = matriculas.stream()
                .filter(m -> m.getStatus() == StatusMatricula.CANCELADA)
                .count();

        long totalFormados = matriculas.stream()
                .filter(m -> m.getStatus() == StatusMatricula.CONCLUIDA)
                .count();

        long totalGeral = totalMatriculados + totalEvasoes + totalCancelados + totalFormados;

        double taxaEvasao = totalGeral > 0
                ? Math.round((totalEvasoes * 100.0 / totalGeral) * 10.0) / 10.0
                : 0.0;

        double taxaConclusao = totalGeral > 0
                ? Math.round((totalFormados * 100.0 / totalGeral) * 10.0) / 10.0
                : 0.0;

        long totalVagas = turmas.stream().mapToLong(t -> t.getVagasTotais() != null ? t.getVagasTotais() : 0).sum();
        long vagasOcupadas = turmas.stream().mapToLong(t -> t.getVagasOcupadas() != null ? t.getVagasOcupadas() : 0).sum();
        double taxaOcupacao = totalVagas > 0
                ? Math.round((vagasOcupadas * 100.0 / totalVagas) * 10.0) / 10.0
                : 0.0;

        List<StatusDistribuicaoDTO> distribuicao = new ArrayList<>();
        if (totalGeral > 0) {
            adicionarFatia(distribuicao, "CONFIRMADA", "Matriculados (Ativos)", totalMatriculados, totalGeral, "#10b981");
            adicionarFatia(distribuicao, "DESISTENTE_FALTAS", "Evasões (3 Faltas)", totalEvasoes, totalGeral, "#ef4444");
            adicionarFatia(distribuicao, "CONCLUIDA", "Formados / Concluídos", totalFormados, totalGeral, "#f59e0b");
            adicionarFatia(distribuicao, "CANCELADA", "Cancelamentos Voluntários", totalCancelados, totalGeral, "#64748b");
        }

        List<CursoStatsDTO> cursosStats = new ArrayList<>();
        for (Curso curso : cursos) {
            List<Matricula> matsDoCurso = matriculas.stream()
                    .filter(m -> m.getTurma() != null && m.getTurma().getCurso() != null && m.getTurma().getCurso().getId().equals(curso.getId()))
                    .collect(Collectors.toList());

            long matriculasCurso = matsDoCurso.stream().filter(m -> m.getStatus() == StatusMatricula.CONFIRMADA).count();
            long evasoesCurso = matsDoCurso.stream().filter(m -> m.getStatus() == StatusMatricula.DESISTENTE_FALTAS).count();
            long concluidosCurso = matsDoCurso.stream().filter(m -> m.getStatus() == StatusMatricula.CONCLUIDA).count();
            long totalCurso = matriculasCurso + evasoesCurso + concluidosCurso;

            double taxaEvasaoCurso = totalCurso > 0
                    ? Math.round((evasoesCurso * 100.0 / totalCurso) * 10.0) / 10.0
                    : 0.0;

            cursosStats.add(CursoStatsDTO.builder()
                    .cursoId(curso.getId())
                    .cursoNome(curso.getNome())
                    .escolaSigla(curso.getEscola() != null ? curso.getEscola().getSigla() : "")
                    .escolaCorTema(curso.getEscola() != null ? curso.getEscola().getCorTema() : "blue")
                    .modalidade(curso.getModalidade() != null ? curso.getModalidade().name() : "OFICINA")
                    .totalInscricoes(0L)
                    .totalMatriculas(matriculasCurso)
                    .totalEvasoes(evasoesCurso)
                    .totalConcluidos(concluidosCurso)
                    .taxaEvasao(taxaEvasaoCurso)
                    .build());
        }

        return DashboardStatsDTO.builder()
                .totalGeral(totalGeral)
                .totalInscricoes(0L)
                .totalMatriculados(totalMatriculados)
                .totalEvasoes(totalEvasoes)
                .totalCancelados(totalCancelados)
                .totalFormados(totalFormados)
                .totalFilaEspera(0L)
                .taxaEvasao(taxaEvasao)
                .taxaConclusao(taxaConclusao)
                .taxaOcupacaoVagas(taxaOcupacao)
                .totalVagas(totalVagas)
                .vagasOcupadas(vagasOcupadas)
                .totalCursos(cursos.size())
                .totalTurmas(turmas.size())
                .distribuicaoStatus(distribuicao)
                .cursosStats(cursosStats)
                .build();
    }

    /**
     * Relatório Institucional para a Prefeitura de Santo André.
     * Contabiliza estritamente alunos ATUALMENTE matriculados (StatusMatricula.CONFIRMADA),
     * excluindo formandos (CONCLUIDA), detalhando por Oficina, Formação e Núcleo, além da Taxa de Desistências.
     */
    @Transactional(readOnly = true)
    public RelatorioPrefeituraDTO obterRelatorioPrefeitura(Long escolaId) {
        final Long escolaFiltro = securityService.resolverEscolaId(escolaId);
        List<Escola> todasEscolas = escolaRepository.findAll();

        // Se for Encarregada, restringe às escolas que ela tem acesso
        if (securityService.isEncarregada()) {
            todasEscolas = todasEscolas.stream()
                    .filter(e -> securityService.temAcessoAEscola(e.getId()))
                    .collect(Collectors.toList());
        }

        if (escolaFiltro != null) {
            todasEscolas = todasEscolas.stream()
                    .filter(e -> e.getId().equals(escolaFiltro))
                    .collect(Collectors.toList());
        }

        List<Matricula> todasMatriculas = escolaFiltro != null
                ? matriculaRepository.findByTurmaCursoEscolaId(escolaFiltro)
                : matriculaRepository.findAll();
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("dd/MM/yyyy");

        List<RelatorioPrefeituraDTO.EscolaPrefeituraItemDTO> itensEscola = new ArrayList<>();
        List<RelatorioPrefeituraDTO.AlunoAtivoPrefeituraDTO> alunosAtivos = new ArrayList<>();

        long somaRedeFormacao = 0;
        long somaRedeNucleo = 0;
        long somaRedeOficina = 0;
        long somaRedeAtivos = 0;
        long somaRedeDesistencias = 0;

        for (Escola esc : todasEscolas) {
            List<Matricula> matsDaEscola = todasMatriculas.stream()
                    .filter(m -> m.getTurma() != null
                            && m.getTurma().getStatus() != StatusTurma.CONCLUIDA
                            && m.getTurma().getCurso() != null
                            && m.getTurma().getCurso().getEscola() != null
                            && m.getTurma().getCurso().getEscola().getId().equals(esc.getId()))
                    .toList();

            // Apenas alunos ATUALMENTE matriculados (CONFIRMADA) — SEM formandos (CONCLUIDA)!
            List<Matricula> ativas = matsDaEscola.stream()
                    .filter(m -> m.getStatus() == StatusMatricula.CONFIRMADA)
                    .toList();

            long matFormacao = ativas.stream()
                    .filter(m -> m.getTurma().getCurso().getModalidade() == ModalidadeCurso.FORMACAO)
                    .count();

            long matNucleo = ativas.stream()
                    .filter(m -> m.getTurma().getCurso().getModalidade() == ModalidadeCurso.NUCLEO)
                    .count();

            long matOficina = ativas.stream()
                    .filter(m -> {
                        ModalidadeCurso mod = m.getTurma().getCurso().getModalidade();
                        return mod == ModalidadeCurso.OFICINA || mod == null;
                    })
                    .count();

            long totalAtivosEscola = ativas.size();

            long evasoesFaltas = matsDaEscola.stream()
                    .filter(m -> m.getStatus() == StatusMatricula.DESISTENTE_FALTAS)
                    .count();

            long cancelamentos = matsDaEscola.stream()
                    .filter(m -> m.getStatus() == StatusMatricula.CANCELADA)
                    .count();

            long totalDesistenciasEscola = evasoesFaltas + cancelamentos;
            long universoCicloAtual = totalAtivosEscola + totalDesistenciasEscola;

            double taxaDesistencia = universoCicloAtual > 0
                    ? Math.round((totalDesistenciasEscola * 100.0 / universoCicloAtual) * 10.0) / 10.0
                    : 0.0;

            itensEscola.add(RelatorioPrefeituraDTO.EscolaPrefeituraItemDTO.builder()
                    .escolaId(esc.getId())
                    .escolaSigla(esc.getSigla())
                    .escolaNome(esc.getNome())
                    .matriculadosFormacao(matFormacao)
                    .matriculadosNucleo(matNucleo)
                    .matriculadosOficina(matOficina)
                    .totalMatriculadosAtivos(totalAtivosEscola)
                    .evasoesFaltas(evasoesFaltas)
                    .cancelamentosVoluntarios(cancelamentos)
                    .totalDesistencias(totalDesistenciasEscola)
                    .taxaDesistencia(taxaDesistencia)
                    .build());

            somaRedeFormacao += matFormacao;
            somaRedeNucleo += matNucleo;
            somaRedeOficina += matOficina;
            somaRedeAtivos += totalAtivosEscola;
            somaRedeDesistencias += totalDesistenciasEscola;

            for (Matricula m : ativas) {
                Aluno a = m.getAluno();
                Curso c = m.getTurma().getCurso();
                ModalidadeCurso mod = c.getModalidade() != null ? c.getModalidade() : ModalidadeCurso.OFICINA;
                alunosAtivos.add(RelatorioPrefeituraDTO.AlunoAtivoPrefeituraDTO.builder()
                        .matriculaId(m.getId())
                        .alunoId(a != null ? a.getId() : null)
                        .alunoNome(a != null ? a.getNome() : "Sem Nome")
                        .alunoCpf(a != null ? mascararCpf(a.getCpf()) : "")
                        .escolaId(esc.getId())
                        .escolaSigla(esc.getSigla())
                        .escolaNome(esc.getNome())
                        .cursoNome(c.getNome())
                        .modalidade(mod.name())
                        .turmaCodigo(m.getTurma().getCodigo())
                        .dataMatricula(m.getDataMatricula() != null ? m.getDataMatricula().format(fmt) : "")
                        .build());
            }
        }

        alunosAtivos.sort(Comparator.comparing(RelatorioPrefeituraDTO.AlunoAtivoPrefeituraDTO::getEscolaSigla)
                .thenComparing(RelatorioPrefeituraDTO.AlunoAtivoPrefeituraDTO::getModalidade)
                .thenComparing(RelatorioPrefeituraDTO.AlunoAtivoPrefeituraDTO::getAlunoNome));

        long universoRede = somaRedeAtivos + somaRedeDesistencias;
        double taxaRedeDesistencia = universoRede > 0
                ? Math.round((somaRedeDesistencias * 100.0 / universoRede) * 10.0) / 10.0
                : 0.0;

        return RelatorioPrefeituraDTO.builder()
                .totalRedeFormacao(somaRedeFormacao)
                .totalRedeNucleo(somaRedeNucleo)
                .totalRedeOficina(somaRedeOficina)
                .totalRedeMatriculadosAtivos(somaRedeAtivos)
                .totalRedeDesistencias(somaRedeDesistencias)
                .taxaRedeDesistencia(taxaRedeDesistencia)
                .escolas(itensEscola)
                .alunosAtivos(alunosAtivos)
                .build();
    }

    @Transactional(readOnly = true)
    public TurmaDashboardDTO obterDashboardTurma(Long turmaId) {
        Turma turma = turmaRepository.findById(turmaId)
                .orElseThrow(() -> new ResourceNotFoundException("Turma não encontrada com id: " + turmaId));

        Curso curso = turma.getCurso();
        Escola escola = curso != null ? curso.getEscola() : null;

        if (securityService.isEncarregada() && escola != null && !securityService.temAcessoAEscola(escola.getId())) {
            throw new BusinessException("Acesso negado: você não possui permissão para consultar dados desta unidade escolar.");
        }

        List<Matricula> matriculas = matriculaRepository.findByTurmaId(turmaId);
        List<Long> matriculaIds = matriculas.stream().map(Matricula::getId).toList();
        Map<Long, List<RegistroPresenca>> presencasPorMatricula = matriculaIds.isEmpty()
                ? Collections.emptyMap()
                : registroPresencaRepository.findByMatriculaIdInOrderByDataAulaAsc(matriculaIds)
                        .stream().collect(Collectors.groupingBy(p -> p.getMatricula().getId()));

        List<AlunoTurmaFrequenciaDTO> alunosDTO = new ArrayList<>();
        long somaPresencas = 0;
        long somaFaltas = 0;
        long somaJustificadas = 0;
        long maxAulasTurma = 0;
        long alunosEmRisco = 0;
        long alunosDesistentes = 0;

        for (Matricula m : matriculas) {
            Aluno aluno = m.getAluno();
            List<RegistroPresenca> presencas = presencasPorMatricula.getOrDefault(m.getId(), Collections.emptyList());

            long totalAulas = presencas.size();
            if (totalAulas > maxAulasTurma) maxAulasTurma = totalAulas;

            long pCount = presencas.stream().filter(p -> p.getStatus() == StatusPresenca.PRESENTE).count();
            long fCount = presencas.stream().filter(p -> p.getStatus() == StatusPresenca.FALTA).count();
            long jCount = presencas.stream().filter(p -> p.getStatus() == StatusPresenca.JUSTIFICADA).count();

            somaPresencas += pCount;
            somaFaltas += fCount;
            somaJustificadas += jCount;

            double pct = totalAulas > 0
                    ? Math.round(((pCount + jCount) * 100.0 / totalAulas) * 10.0) / 10.0
                    : 100.0;

            int consecutivas = 0;
            for (int i = presencas.size() - 1; i >= 0; i--) {
                if (presencas.get(i).getStatus() == StatusPresenca.FALTA) {
                    consecutivas++;
                } else {
                    break;
                }
            }

            boolean risco = consecutivas == 2;
            boolean limite = consecutivas >= 3 || m.getStatus() == StatusMatricula.DESISTENTE_FALTAS;

            if (risco) alunosEmRisco++;
            if (limite) alunosDesistentes++;

            alunosDTO.add(AlunoTurmaFrequenciaDTO.builder()
                    .alunoId(aluno != null ? aluno.getId() : null)
                    .matriculaId(m.getId())
                    .alunoNome(aluno != null ? aluno.getNome() : "Sem nome")
                    .alunoCpf(aluno != null ? mascararCpf(aluno.getCpf()) : "")
                    .menorDeIdade(aluno != null && aluno.isMenorDeIdade())
                    .statusMatricula(m.getStatus())
                    .totalAulas(totalAulas)
                    .presencas(pCount)
                    .faltas(fCount)
                    .justificadas(jCount)
                    .porcentagemPresenca(pct)
                    .faltasConsecutivas(consecutivas)
                    .riscoDesistencia(risco)
                    .atingiuLimiteFaltas(limite)
                    .build());
        }

        long totalRegistros = somaPresencas + somaFaltas + somaJustificadas;
        double taxaAssiduidade = totalRegistros > 0
                ? Math.round(((somaPresencas + somaJustificadas) * 100.0 / totalRegistros) * 10.0) / 10.0
                : 100.0;

        int vagasTotais = turma.getVagasTotais() != null ? turma.getVagasTotais() : 0;
        int vagasOcupadas = turma.getVagasOcupadas() != null ? turma.getVagasOcupadas() : 0;
        double taxaOcupacao = vagasTotais > 0
                ? Math.round((vagasOcupadas * 100.0 / vagasTotais) * 10.0) / 10.0
                : 0.0;

        return TurmaDashboardDTO.builder()
                .turmaId(turma.getId())
                .turmaCodigo(turma.getCodigo())
                .cursoNome(curso != null ? curso.getNome() : "")
                .modalidade(curso != null && curso.getModalidade() != null ? curso.getModalidade().name() : "OFICINA")
                .escolaNome(escola != null ? escola.getNome() : "")
                .escolaSigla(escola != null ? escola.getSigla() : "")
                .escolaCorTema(escola != null ? escola.getCorTema() : "blue")
                .vagasTotais(vagasTotais)
                .vagasOcupadas(vagasOcupadas)
                .taxaOcupacao(taxaOcupacao)
                .totalAulasRegistradas(maxAulasTurma)
                .somaPresencas(somaPresencas)
                .somaFaltas(somaFaltas)
                .somaJustificadas(somaJustificadas)
                .totalRegistrosPresenca(totalRegistros)
                .taxaAssiduidadeTurma(taxaAssiduidade)
                .totalAlunos(matriculas.size())
                .alunosEmRiscoFaltas(alunosEmRisco)
                .alunosDesistentes(alunosDesistentes)
                .alunos(alunosDTO)
                .build();
    }

    private void adicionarFatia(List<StatusDistribuicaoDTO> lista, String status, String label, long qtd, long total, String cor) {
        if (qtd > 0) {
            double pct = Math.round((qtd * 100.0 / total) * 10.0) / 10.0;
            lista.add(StatusDistribuicaoDTO.builder()
                    .status(status)
                    .label(label)
                    .quantidade(qtd)
                    .percentual(pct)
                    .cor(cor)
                    .build());
        }
    }
}
