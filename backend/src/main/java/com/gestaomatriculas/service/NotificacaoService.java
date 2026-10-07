package com.gestaomatriculas.service;

import com.gestaomatriculas.dto.NotificacaoDTO;
import com.gestaomatriculas.model.*;
import com.gestaomatriculas.model.enums.StatusMatricula;
import com.gestaomatriculas.model.enums.StatusPresenca;
import com.gestaomatriculas.repository.MatriculaRepository;
import com.gestaomatriculas.repository.RegistroPresencaRepository;
import com.gestaomatriculas.repository.TurmaRepository;
import com.gestaomatriculas.security.SecurityService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor
public class NotificacaoService {

    private final MatriculaRepository matriculaRepository;
    private final RegistroPresencaRepository registroPresencaRepository;
    private final TurmaRepository turmaRepository;
    private final SecurityService securityService;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    @Transactional(readOnly = true)
    public List<NotificacaoDTO> listarNotificacoes(Long escolaId) {
        return listarNotificacoes(escolaId, null);
    }

    @Transactional(readOnly = true)
    public List<NotificacaoDTO> listarNotificacoes(Long escolaId, Long turmaId) {
        escolaId = securityService.resolverEscolaId(escolaId);
        List<NotificacaoDTO> notificacoes = new ArrayList<>();

        List<Matricula> matriculas;
        if (turmaId != null) {
            matriculas = matriculaRepository.findByTurmaId(turmaId);
        } else if (escolaId != null) {
            matriculas = matriculaRepository.findByTurmaCursoEscolaId(escolaId);
        } else {
            matriculas = matriculaRepository.findAll();
        }

        // Filtrar apenas matrículas confirmadas para processamento de faltas
        List<Matricula> confirmadas = matriculas.stream()
                .filter(m -> m.getStatus() == StatusMatricula.CONFIRMADA)
                .toList();

        List<Long> confirmadasIds = confirmadas.stream()
                .map(Matricula::getId)
                .toList();

        // 1. OTIMIZAÇÃO DE PERFORMANCE (Elimina o problema N+1): Carregar presenças em lote
        Map<Long, List<RegistroPresenca>> presencasPorMatricula = new HashMap<>();
        if (!confirmadasIds.isEmpty()) {
            List<RegistroPresenca> todasPresencas = registroPresencaRepository
                    .findByMatriculaIdInOrderByDataAulaAsc(confirmadasIds);
            for (RegistroPresenca rp : todasPresencas) {
                if (rp.getMatricula() != null && rp.getMatricula().getId() != null) {
                    presencasPorMatricula
                            .computeIfAbsent(rp.getMatricula().getId(), k -> new ArrayList<>())
                            .add(rp);
                }
            }
        }

        // 2. Notificações de Risco de Infrequência e Cancelamento
        for (Matricula m : confirmadas) {
            Aluno aluno = m.getAluno();
            Turma turma = m.getTurma();
            if (aluno == null || turma == null) continue;

            Curso curso = turma.getCurso();
            Escola escola = curso != null ? curso.getEscola() : null;
            String escolaSigla = escola != null ? escola.getSigla() : "";
            Long escId = escola != null ? escola.getId() : null;
            String turmaDescricao = turma.getCodigo() + (curso != null ? " - " + curso.getNome() : "");

            List<RegistroPresenca> presencas = presencasPorMatricula.getOrDefault(m.getId(), Collections.emptyList());

            int faltasConsecutivas = 0;
            LocalDate dataUltimaFalta = null;
            for (int i = presencas.size() - 1; i >= 0; i--) {
                if (presencas.get(i).getStatus() == StatusPresenca.FALTA) {
                    faltasConsecutivas++;
                    if (dataUltimaFalta == null) {
                        dataUltimaFalta = presencas.get(i).getDataAula();
                    }
                } else {
                    break;
                }
            }

            String dataHoraEvento = dataUltimaFalta != null
                    ? dataUltimaFalta.format(DATE_FORMATTER) + " (Última aula)"
                    : LocalDate.now().format(DATE_FORMATTER);

            // Aluno com exatamente 2 faltas consecutivas -> Risco crítico
            if (faltasConsecutivas == 2) {
                notificacoes.add(NotificacaoDTO.builder()
                        .id("RISCO-FALTA-2-" + m.getId())
                        .tipo("RISCO_FALTAS")
                        .nivel("URGENTE")
                        .titulo("Risco de Perda de Vaga (2 Faltas)")
                        .mensagem(String.format("O estudante %s atingiu 2 faltas consecutivas na turma %s (%s). A próxima falta implicará no cancelamento automático da vaga conforme o regimento escolar.",
                                aluno.getNome(), turmaDescricao, escolaSigla))
                        .escolaId(escId)
                        .escolaSigla(escolaSigla)
                        .alunoId(aluno.getId())
                        .alunoNome(aluno.getNome())
                        .turmaId(turma.getId())
                        .turmaNome(turmaDescricao)
                        .matriculaId(m.getId())
                        .acaoRotulo("Ver Dossiê do Aluno")
                        .acaoTipo("ABRIR_PERFIL")
                        .dataHora(dataHoraEvento)
                        .build());
            } else if (faltasConsecutivas >= 3) {
                notificacoes.add(NotificacaoDTO.builder()
                        .id("LIMITE-FALTA-" + m.getId())
                        .tipo("LIMITE_FALTAS")
                        .nivel("URGENTE")
                        .titulo(String.format("Limite de Faltas Excedido (%d Faltas)", faltasConsecutivas))
                        .mensagem(String.format("O estudante %s acumulou %d faltas consecutivas na turma %s (%s). Vaga sujeita a cancelamento por infrequência regimental.",
                                aluno.getNome(), faltasConsecutivas, turmaDescricao, escolaSigla))
                        .escolaId(escId)
                        .escolaSigla(escolaSigla)
                        .alunoId(aluno.getId())
                        .alunoNome(aluno.getNome())
                        .turmaId(turma.getId())
                        .turmaNome(turmaDescricao)
                        .matriculaId(m.getId())
                        .acaoRotulo("Ver Dossiê do Aluno")
                        .acaoTipo("ABRIR_PERFIL")
                        .dataHora(dataHoraEvento)
                        .build());
            }
        }

        // 3. Notificações de Declaração de Matrícula (Estudantes com frequência regular confirmada)
        for (Matricula m : confirmadas) {
            Aluno aluno = m.getAluno();
            Turma turma = m.getTurma();
            if (aluno == null || turma == null) continue;

            List<RegistroPresenca> presencas = presencasPorMatricula.getOrDefault(m.getId(), Collections.emptyList());
            // Só exibe notificação se houver ao menos 1 registro de presença com assiduidade saudável
            if (presencas.isEmpty()) continue;

            Curso curso = turma.getCurso();
            Escola escola = curso != null ? curso.getEscola() : null;
            String escolaSigla = escola != null ? escola.getSigla() : "";
            Long escId = escola != null ? escola.getId() : null;
            String turmaDescricao = turma.getCodigo() + (curso != null ? " - " + curso.getNome() : "");

            notificacoes.add(NotificacaoDTO.builder()
                    .id("DECLARACAO-PRONTA-" + m.getId())
                    .tipo("DECLARACAO_PRONTA")
                    .nivel("INFO")
                    .titulo("Declaração Escolar Pronta")
                    .mensagem(String.format("A declaração oficial de estudante e comprovante de frequência de %s (%s) está gerada e pronta para emissão.",
                            aluno.getNome(), turmaDescricao))
                    .escolaId(escId)
                    .escolaSigla(escolaSigla)
                    .alunoId(aluno.getId())
                    .alunoNome(aluno.getNome())
                    .turmaId(turma.getId())
                    .turmaNome(turmaDescricao)
                    .matriculaId(m.getId())
                    .acaoRotulo("Emitir Declaração")
                    .acaoTipo("EMITIR_DECLARACAO")
                    .dataHora("Disponível")
                    .build());
        }

        // 4. Notificações de Vagas & Fila de Suplência das Turmas
        List<Turma> turmas;
        if (turmaId != null) {
            turmas = turmaRepository.findById(turmaId).map(List::of).orElse(Collections.emptyList());
        } else if (escolaId != null) {
            turmas = turmaRepository.findByCursoEscolaId(escolaId);
        } else {
            turmas = turmaRepository.findAll();
        }

        for (Turma t : turmas) {
            long matriculados = matriculaRepository.countByTurmaIdAndStatus(t.getId(), StatusMatricula.CONFIRMADA);
            long emEspera = matriculaRepository.countByTurmaIdAndStatus(t.getId(), StatusMatricula.FILA_ESPERA);
            int vagasTotais = t.getVagasTotais() != null ? t.getVagasTotais() : 0;
            long vagasAbertas = Math.max(0, vagasTotais - matriculados);

            Curso curso = t.getCurso();
            Escola escola = curso != null ? curso.getEscola() : null;
            String sigla = escola != null ? escola.getSigla() : "";
            Long escId = escola != null ? escola.getId() : null;
            String turmaDescricao = t.getCodigo() + (curso != null ? " - " + curso.getNome() : "");

            if (vagasAbertas >= 5) {
                // Vagas abertas disponíveis para novas matrículas
                notificacoes.add(NotificacaoDTO.builder()
                        .id("VAGA-ABERTA-" + t.getId())
                        .tipo("VAGA_DISPONIVEL")
                        .nivel("INFO")
                        .titulo(String.format("Vagas Disponíveis (%d Vagas Livres)", vagasAbertas))
                        .mensagem(String.format("A turma %s (%s) possui %d vaga(s) livre(s) de um total de %d vagas ofertadas para matrícula.",
                                turmaDescricao, sigla, vagasAbertas, vagasTotais))
                        .escolaId(escId)
                        .escolaSigla(sigla)
                        .turmaId(t.getId())
                        .turmaNome(turmaDescricao)
                        .acaoRotulo("Ver Turma")
                        .acaoTipo("ABRIR_TURMA")
                        .dataHora("Tempo real")
                        .build());
            }
        }

        // Ordenar: URGENTE primeiro, depois ALERTA, depois INFO
        notificacoes.sort((a, b) -> {
            int pesoA = "URGENTE".equals(a.getNivel()) ? 0 : ("ALERTA".equals(a.getNivel()) ? 1 : 2);
            int pesoB = "URGENTE".equals(b.getNivel()) ? 0 : ("ALERTA".equals(b.getNivel()) ? 1 : 2);
            return Integer.compare(pesoA, pesoB);
        });

        return notificacoes;
    }
}
