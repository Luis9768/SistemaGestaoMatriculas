package com.gestaomatriculas.service;

import com.gestaomatriculas.dto.*;
import com.gestaomatriculas.exception.ResourceNotFoundException;
import com.gestaomatriculas.model.*;
import com.gestaomatriculas.model.enums.StatusMatricula;
import com.gestaomatriculas.model.enums.StatusPresenca;
import com.gestaomatriculas.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final MatriculaRepository matriculaRepository;
    private final TurmaRepository turmaRepository;
    private final CursoRepository cursoRepository;
    private final RegistroPresencaRepository registroPresencaRepository;

    @Cacheable(value = "dashboard_stats", key = "'stats_' + (#escolaId != null ? #escolaId : 'todas')")
    @Transactional(readOnly = true)
    public DashboardStatsDTO obterStatsGerais(Long escolaId) {
        List<Matricula> matriculas = escolaId != null
                ? matriculaRepository.findByTurmaCursoEscolaId(escolaId)
                : matriculaRepository.findAll();

        List<Turma> turmas = escolaId != null
                ? turmaRepository.findByCursoEscolaId(escolaId)
                : turmaRepository.findAll();

        List<Curso> cursos = escolaId != null
                ? cursoRepository.findByEscolaId(escolaId)
                : cursoRepository.findAll();

        long totalGeral = matriculas.size();

        long totalMatriculados = matriculas.stream()
                .filter(m -> m.getStatus() == StatusMatricula.CONFIRMADA)
                .count();

        long totalInscricoes = matriculas.stream()
                .filter(m -> m.getStatus() == StatusMatricula.INSCRITO ||
                             m.getStatus() == StatusMatricula.EM_SELECAO ||
                             m.getStatus() == StatusMatricula.APROVADO ||
                             m.getStatus() == StatusMatricula.PENDENTE)
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

        long totalFilaEspera = matriculas.stream()
                .filter(m -> m.getStatus() == StatusMatricula.FILA_ESPERA)
                .count();

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

        // Distribuição para o Gráfico de Pizza / Rosca
        List<StatusDistribuicaoDTO> distribuicao = new ArrayList<>();
        if (totalGeral > 0) {
            adicionarFatia(distribuicao, "CONFIRMADA", "Matriculados (Ativos)", totalMatriculados, totalGeral, "#10b981");
            adicionarFatia(distribuicao, "INSCRITO", "Inscrições / Seleção", totalInscricoes, totalGeral, "#3b82f6");
            adicionarFatia(distribuicao, "DESISTENTE_FALTAS", "Evasões (3 Faltas)", totalEvasoes, totalGeral, "#ef4444");
            adicionarFatia(distribuicao, "CANCELADA", "Cancelamentos Voluntários", totalCancelados, totalGeral, "#64748b");
            adicionarFatia(distribuicao, "CONCLUIDA", "Formados / Concluídos", totalFormados, totalGeral, "#f59e0b");
            adicionarFatia(distribuicao, "FILA_ESPERA", "Fila de Espera", totalFilaEspera, totalGeral, "#8b5cf6");
        }

        // Estatísticas por Curso para o Gráfico de Barras / Torres
        List<CursoStatsDTO> cursosStats = new ArrayList<>();
        for (Curso curso : cursos) {
            List<Matricula> matsDoCurso = matriculas.stream()
                    .filter(m -> m.getTurma() != null && m.getTurma().getCurso() != null && m.getTurma().getCurso().getId().equals(curso.getId()))
                    .collect(Collectors.toList());

            long inscricoesCurso = matsDoCurso.stream().filter(m -> m.getStatus() == StatusMatricula.INSCRITO || m.getStatus() == StatusMatricula.EM_SELECAO || m.getStatus() == StatusMatricula.APROVADO).count();
            long matriculasCurso = matsDoCurso.stream().filter(m -> m.getStatus() == StatusMatricula.CONFIRMADA).count();
            long evasoesCurso = matsDoCurso.stream().filter(m -> m.getStatus() == StatusMatricula.DESISTENTE_FALTAS).count();
            long concluidosCurso = matsDoCurso.stream().filter(m -> m.getStatus() == StatusMatricula.CONCLUIDA).count();
            long totalCurso = matsDoCurso.size();

            double taxaEvasaoCurso = totalCurso > 0
                    ? Math.round((evasoesCurso * 100.0 / totalCurso) * 10.0) / 10.0
                    : 0.0;

            cursosStats.add(CursoStatsDTO.builder()
                    .cursoId(curso.getId())
                    .cursoNome(curso.getNome())
                    .escolaSigla(curso.getEscola() != null ? curso.getEscola().getSigla() : "")
                    .escolaCorTema(curso.getEscola() != null ? curso.getEscola().getCorTema() : "blue")
                    .modalidade(curso.getModalidade() != null ? curso.getModalidade().name() : "LIVRE")
                    .totalInscricoes(inscricoesCurso)
                    .totalMatriculas(matriculasCurso)
                    .totalEvasoes(evasoesCurso)
                    .totalConcluidos(concluidosCurso)
                    .taxaEvasao(taxaEvasaoCurso)
                    .build());
        }

        return DashboardStatsDTO.builder()
                .totalGeral(totalGeral)
                .totalInscricoes(totalInscricoes)
                .totalMatriculados(totalMatriculados)
                .totalEvasoes(totalEvasoes)
                .totalCancelados(totalCancelados)
                .totalFormados(totalFormados)
                .totalFilaEspera(totalFilaEspera)
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

    @Cacheable(value = "dashboard_stats", key = "'turma_' + #turmaId")
    @Transactional(readOnly = true)
    public TurmaDashboardDTO obterDashboardTurma(Long turmaId) {
        Turma turma = turmaRepository.findById(turmaId)
                .orElseThrow(() -> new ResourceNotFoundException("Turma não encontrada com id: " + turmaId));

        Curso curso = turma.getCurso();
        Escola escola = curso != null ? curso.getEscola() : null;

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
                    .alunoCpf(aluno != null ? aluno.getCpf() : "")
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
                .modalidade(curso != null && curso.getModalidade() != null ? curso.getModalidade().name() : "LIVRE")
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
