package com.gestaomatriculas.service;

import com.gestaomatriculas.model.*;
import com.gestaomatriculas.model.enums.*;
import com.gestaomatriculas.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class MatriculaSeederService {

    private final MatriculaRepository matriculaRepository;
    private final RegistroPresencaRepository registroPresencaRepository;
    private final AlunoRepository alunoRepository;
    private final ResponsavelRepository responsavelRepository;
    private final TurmaRepository turmaRepository;
    private final CacheManager cacheManager;

    @Transactional
    public Map<String, Object> resetAndSeed() {
        log.info("[SEEDER] Iniciando limpeza total de matrículas e presença para novo seed contextualizado...");

        // 1. Limpeza em cascata respeitando integridade referencial
        registroPresencaRepository.deleteAllInBatch();
        matriculaRepository.deleteAllInBatch();
        alunoRepository.deleteAllInBatch();
        responsavelRepository.deleteAllInBatch();

        log.info("[SEEDER] Banco limpo com sucesso. Criando cenários realistas de alunos e matrículas...");

        List<Matricula> matriculasCriadas = new ArrayList<>();

        // Helper para datas de chamadas das últimas 6 semanas
        LocalDate d1 = LocalDate.of(2026, 10, 6);
        LocalDate d2 = LocalDate.of(2026, 10, 13);
        LocalDate d3 = LocalDate.of(2026, 10, 20);
        LocalDate d4 = LocalDate.of(2026, 10, 27);
        LocalDate d5 = LocalDate.of(2026, 11, 3);
        LocalDate d6 = LocalDate.of(2026, 11, 10);

        // =========================================================================
        // ESCOLA LIVRE DE TEATRO (ELT)
        // =========================================================================
        Turma eltForm = findTurma("ELT-FORM-2026");
        Turma eltRua = findTurma("ELT-NUC-RUA");
        Turma eltDram = findTurma("ELT-NUC-DRAM");
        Turma eltInic = findTurma("ELT-NUC-INIC");
        Turma eltInfanc = findTurma("ELT-NUC-INFANC");

        if (eltForm != null) {
            // Cenário 1: Adulto em Formação Teatral contínua, 100% de frequência
            Aluno a1 = salvarAluno("Marcelo Augusto Ferreira", "318.492.018-72", "marcelo.ferreira@email.com",
                    "(11) 98112-3344", LocalDate.of(1998, 4, 15), null, "Rua das Figueiras, 450", "Vila Assunção", "Santo André", "09030-500", "Masculino", false, null, false, null);
            Matricula m1 = salvarMatricula(a1, eltForm, CanalOrigem.SITE, StatusMatricula.CONFIRMADA, "Estudante assíduo do Núcleo de Formação de Atores.");
            matriculasCriadas.add(m1);
            lancarPresencas(m1, List.of(d1, d2, d3, d4, d5, d6), List.of(StatusPresenca.PRESENTE, StatusPresenca.PRESENTE, StatusPresenca.PRESENTE, StatusPresenca.PRESENTE, StatusPresenca.PRESENTE, StatusPresenca.PRESENTE), null, "Vocalidade, Prontidão Cênica e Expressão Corporal");

            // Cenário 2: Estudante com falta médica justificada
            Aluno a2 = salvarAluno("Bruna Caroline de Souza", "429.583.129-84", "bruna.souza@email.com",
                    "(11) 97223-4455", LocalDate.of(2003, 7, 22), null, "Rua Oratório, 1200", "Parque das Nações", "Santo André", "09210-000", "Feminino", false, null, false, null);
            Matricula m2 = salvarMatricula(a2, eltForm, CanalOrigem.PRESENCIAL, StatusMatricula.CONFIRMADA, "Documentação e atestado de saúde validados na secretaria.");
            matriculasCriadas.add(m2);
            lancarPresencaUnica(m2, d1, StatusPresenca.PRESENTE, null, "Laboratório de Improvisação Cênica");
            lancarPresencaUnica(m2, d2, StatusPresenca.JUSTIFICADA, "Atestado médico de consulta cardiológica anexado", "Laboratório de Improvisação Cênica");
            lancarPresencaUnica(m2, d3, StatusPresenca.PRESENTE, null, "Laboratório de Improvisação Cênica");
            lancarPresencaUnica(m2, d4, StatusPresenca.PRESENTE, null, "Laboratório de Improvisação Cênica");
            lancarPresencaUnica(m2, d5, StatusPresenca.PRESENTE, null, "Laboratório de Improvisação Cênica");
            lancarPresencaUnica(m2, d6, StatusPresenca.PRESENTE, null, "Laboratório de Improvisação Cênica");

            // Cenário 3: Processo Seletivo / Audição em andamento
            Aluno a3 = salvarAluno("Gabriel Nascimento Prado", "530.674.230-95", "gabriel.prado@email.com",
                    "(11) 96334-5566", LocalDate.of(2005, 3, 10), null, "Rua Coronel Oliveira Lima, 210", "Centro", "Santo André", "09010-010", "Masculino", false, null, false, null);
            Matricula m3 = salvarMatricula(a3, eltForm, CanalOrigem.CULTURA_AZ, StatusMatricula.EM_SELECAO, "Convocado para 2ª fase de audição prática e entrevista artística coletiva.");
            matriculasCriadas.add(m3);

            // Cenário 4: Fila de Espera (Suplência)
            Aluno a4 = salvarAluno("Letícia Helena de Toledo", "641.785.341-06", "leticia.toledo@email.com",
                    "(11) 95445-6677", LocalDate.of(2001, 11, 28), null, "Avenida Portugal, 830", "Jardim Bela Vista", "Santo André", "09040-000", "Feminino", false, null, false, null);
            Matricula m4 = salvarMatricula(a4, eltForm, CanalOrigem.SITE, StatusMatricula.FILA_ESPERA, "1ª Suplente na fila de espera para abertura de desistências.");
            matriculasCriadas.add(m4);
        }

        if (eltRua != null) {
            // Cenário 5: Teatro de Rua com artista assíduo da periferia
            Aluno a5 = salvarAluno("Danilo Martins Santos", "215.381.902-61", "danilo.martins@email.com",
                    "(11) 94556-7788", LocalDate.of(1994, 9, 14), null, "Avenida dos Estados, 4100", "Utinga", "Santo André", "09220-570", "Masculino", false, null, false, null);
            Matricula m5 = salvarMatricula(a5, eltRua, CanalOrigem.CULTURA_AZ, StatusMatricula.CONFIRMADA, "Pesquisa em cortejo e intervenção em espaço público.");
            matriculasCriadas.add(m5);
            lancarPresencas(m5, List.of(d1, d2, d3, d4, d5, d6), List.of(StatusPresenca.PRESENTE, StatusPresenca.PRESENTE, StatusPresenca.PRESENTE, StatusPresenca.PRESENTE, StatusPresenca.PRESENTE, StatusPresenca.PRESENTE), null, "Ocupação do Espaço Público e Prontidão de Rua");

            // Cenário 6: Desistente por faltas consecutivas (DESISTENTE_FALTAS)
            Aluno a6 = salvarAluno("Juliana Rocha Mendes", "752.896.452-17", "juliana.mendes@email.com",
                    "(11) 93667-8899", LocalDate.of(2004, 2, 8), null, "Rua Visconde de Mauá, 310", "Camilópolis", "Santo André", "09230-010", "Feminino", false, null, false, null);
            Matricula m6 = salvarMatricula(a6, eltRua, CanalOrigem.PRESENCIAL, StatusMatricula.DESISTENTE_FALTAS, "Desligamento por 5 faltas não justificadas. Sem retorno nas tentativas de busca ativa da coordenação.");
            matriculasCriadas.add(m6);
            lancarPresencaUnica(m6, d1, StatusPresenca.PRESENTE, null, "Introdução ao Teatro de Rua");
            lancarPresencaUnica(m6, d2, StatusPresenca.FALTA, null, "Intervenções Cênicas");
            lancarPresencaUnica(m6, d3, StatusPresenca.FALTA, null, "Intervenções Cênicas");
            lancarPresencaUnica(m6, d4, StatusPresenca.FALTA, null, "Intervenções Cênicas");
            lancarPresencaUnica(m6, d5, StatusPresenca.FALTA, null, "Intervenções Cênicas");
            lancarPresencaUnica(m6, d6, StatusPresenca.FALTA, null, "Intervenções Cênicas");
        }

        if (eltDram != null) {
            // Cenário 7: Dramaturga ativa
            Aluno a7 = salvarAluno("Clarice Antunes Borges", "184.270.891-50", "clarice.borges@email.com",
                    "(11) 92778-9900", LocalDate.of(1986, 6, 17), null, "Rua das Monções, 620", "Vila Gilda", "Santo André", "09090-520", "Feminino", false, null, false, null);
            Matricula m7 = salvarMatricula(a7, eltDram, CanalOrigem.FORMS, StatusMatricula.CONFIRMADA, "Roteiro e dramaturgia para montagens coletivas.");
            matriculasCriadas.add(m7);
            lancarPresencas(m7, List.of(d1, d2, d3, d4, d5, d6), List.of(StatusPresenca.PRESENTE, StatusPresenca.PRESENTE, StatusPresenca.PRESENTE, StatusPresenca.PRESENTE, StatusPresenca.PRESENTE, StatusPresenca.PRESENTE), null, "Escrita Dramática e Estruturação de Cenas");

            // Cenário 8: Concluinte / Formado com certificado emitido (CONCLUIDA)
            Aluno a8 = salvarAluno("Vinicius de Oliveira Moura", "701.000.000-14", "vinicius.moura@email.com",
                    "(11) 91889-0011", LocalDate.of(1997, 10, 18), null, "Rua Gertrudes de Lima, 310", "Centro", "Santo André", "09020-000", "Masculino", false, null, false, null);
            Matricula m8 = salvarMatricula(a8, eltDram, CanalOrigem.PRESENCIAL, StatusMatricula.CONCLUIDA, "Concluinte do ciclo 2025/2026 com aprovação e leitura dramática pública realizada no Teatro Conchita de Moraes.");
            matriculasCriadas.add(m8);
            lancarPresencas(m8, List.of(d1, d2, d3, d4, d5, d6), List.of(StatusPresenca.PRESENTE, StatusPresenca.PRESENTE, StatusPresenca.PRESENTE, StatusPresenca.PRESENTE, StatusPresenca.PRESENTE, StatusPresenca.PRESENTE), null, "Montagem e Apresentação Pública de Dramaturgia Autoral");
        }

        if (eltInic != null) {
            Aluno a9 = salvarAluno("Renan Alcantara Prado", "863.907.563-28", "renan.alcantara@email.com",
                    "(11) 98990-1122", LocalDate.of(2007, 1, 14), null, "Rua Carijós, 1450", "Vila Metalúrgica", "Santo André", "09220-000", "Masculino", false, null, false, null);
            Matricula m9 = salvarMatricula(a9, eltInic, CanalOrigem.SITE, StatusMatricula.CONFIRMADA, "Iniciação ao jogo cênico e expressão dramática.");
            matriculasCriadas.add(m9);
            lancarPresencas(m9, List.of(d1, d2, d3, d4, d5, d6), List.of(StatusPresenca.PRESENTE, StatusPresenca.PRESENTE, StatusPresenca.PRESENTE, StatusPresenca.FALTA, StatusPresenca.PRESENTE, StatusPresenca.PRESENTE), null, "Jogos Teatrais e Consciência Coletiva");
        }

        if (eltInfanc != null) {
            Aluno a10 = salvarAluno("Julia Camargo Ortiz", "415.789.023-11", "julia.ortiz@email.com",
                    "(11) 97001-2233", LocalDate.of(2003, 8, 20), null, "Rua Catequese, 540", "Jardim", "Santo André", "09090-400", "Feminino", false, null, false, null);
            Matricula m10 = salvarMatricula(a10, eltInfanc, CanalOrigem.FORMS, StatusMatricula.CONFIRMADA, "Pesquisa de poéticas teatrais para as infâncias.");
            matriculasCriadas.add(m10);
            lancarPresencas(m10, List.of(d1, d2, d3, d4, d5, d6), List.of(StatusPresenca.PRESENTE, StatusPresenca.PRESENTE, StatusPresenca.PRESENTE, StatusPresenca.PRESENTE, StatusPresenca.PRESENTE, StatusPresenca.PRESENTE), null, "Teatro de Animação e Criação para Infâncias");
        }

        // =========================================================================
        // ESCOLA LIVRE DE DANÇA (ELD)
        // =========================================================================
        Turma eldDancasBr = findTurma("ELD-01-2026");
        Turma eldAfro = findTurma("ELD-POET-AFRO");
        Turma eldContemp = findTurma("ELD-POET-CONTEMP");
        Turma eldPrep1 = findTurma("ELD-DANCA-PREP1");
        Turma eldPratica = findTurma("ELD-NUC1-PINHO");

        if (eldDancasBr != null) {
            // Cenário 11: Idosa / Comunidade participando de Danças Brasileiras
            Aluno a11 = salvarAluno("Dona Iracema dos Santos", "092.169.780-49", "iracema.santos@email.com",
                    "(11) 96112-3344", LocalDate.of(1958, 5, 12), null, "Rua da Estação, 14", "Paranapiacaba", "Santo André", "09440-000", "Feminino", false, null, false, null);
            Matricula m11 = salvarMatricula(a11, eldDancasBr, CanalOrigem.PRESENCIAL, StatusMatricula.CONFIRMADA, "Participação comunitária e valorização da cultura popular tradicional.");
            matriculasCriadas.add(m11);
            lancarPresencas(m11, List.of(d1, d2, d3, d4, d5, d6), List.of(StatusPresenca.PRESENTE, StatusPresenca.PRESENTE, StatusPresenca.PRESENTE, StatusPresenca.PRESENTE, StatusPresenca.PRESENTE, StatusPresenca.PRESENTE), null, "Danças Circulares e Folguedos Brasileiros");

            // Cenário 12: Cancelamento voluntário formal a pedido do aluno
            Aluno a12 = salvarAluno("Natália Souza Guimarães", "974.018.674-39", "natalia.guimaraes@email.com",
                    "(11) 95223-4455", LocalDate.of(1999, 12, 4), null, "Rua Marina, 420", "Bangu", "Santo André", "09210-580", "Feminino", false, null, false, null);
            Matricula m12 = salvarMatricula(a12, eldDancasBr, CanalOrigem.PRESENCIAL, StatusMatricula.CANCELADA, "Cancelamento solicitado formalmente devido a incompatibilidade com novo turno de emprego.");
            matriculasCriadas.add(m12);

            Aluno a13 = salvarAluno("Matheus Vinicius Duarte", "085.129.785-40", "matheus.duarte@email.com",
                    "(11) 94334-5566", LocalDate.of(2002, 6, 29), null, "Rua Giovanni Battista Pirelli, 890", "Casa Branca", "Santo André", "09015-550", "Masculino", false, null, false, null);
            Matricula m13 = salvarMatricula(a13, eldDancasBr, CanalOrigem.SITE, StatusMatricula.CONFIRMADA, "Ritmos e expressões corporais regionais.");
            matriculasCriadas.add(m13);
            lancarPresencas(m13, List.of(d1, d2, d3, d4, d5, d6), List.of(StatusPresenca.PRESENTE, StatusPresenca.PRESENTE, StatusPresenca.PRESENTE, StatusPresenca.PRESENTE, StatusPresenca.PRESENTE, StatusPresenca.PRESENTE), null, "Dança Popular: Maracatu e Frevo");
        }

        if (eldAfro != null) {
            // Cenário 14: Estudante PcD (Deficiência Auditiva / Acessibilidade)
            Aluno a14 = salvarAluno("Yasmin Albuquerque Silva", "196.230.896-51", "yasmin.albuquerque@email.com",
                    "(11) 93445-6677", LocalDate.of(2003, 9, 3), null, "Rua dos Coqueiros, 230", "Jardim Santo André", "Santo André", "09132-000", "Feminino", false, null, true, "Deficiência auditiva moderada bilateral. Suporte pedagógico de vibração rítmica e expressão corporal.");
            Matricula m14 = salvarMatricula(a14, eldAfro, CanalOrigem.PRESENCIAL, StatusMatricula.CONFIRMADA, "Acolhimento com recursos de acessibilidade e integração plena.");
            matriculasCriadas.add(m14);
            lancarPresencas(m14, List.of(d1, d2, d3, d4, d5, d6), List.of(StatusPresenca.PRESENTE, StatusPresenca.PRESENTE, StatusPresenca.PRESENTE, StatusPresenca.PRESENTE, StatusPresenca.PRESENTE, StatusPresenca.PRESENTE), null, "Polirritmias Afro-brasileiras e Consciência Somática");

            Aluno a15 = salvarAluno("Kassio Washington Ribeiro", "307.341.907-62", "kassio.ribeiro@email.com",
                    "(11) 92556-7788", LocalDate.of(2000, 4, 18), null, "Rua Javaés, 110", "Parque Marajoara", "Santo André", "09112-000", "Masculino", false, null, false, null);
            Matricula m15 = salvarMatricula(a15, eldAfro, CanalOrigem.CULTURA_AZ, StatusMatricula.CONFIRMADA, "Pesquisa em poéticas dissidentes e dança contemporânea afro.");
            matriculasCriadas.add(m15);
            lancarPresencas(m15, List.of(d1, d2, d3, d4, d5, d6), List.of(StatusPresenca.PRESENTE, StatusPresenca.PRESENTE, StatusPresenca.PRESENTE, StatusPresenca.PRESENTE, StatusPresenca.PRESENTE, StatusPresenca.PRESENTE), null, "Expressão Rítmica Corporal e Ancestralidade");
        }

        if (eldContemp != null) {
            Aluno a16 = salvarAluno("Amanda Cristina Valente", "418.452.018-73", "amanda.valente@email.com",
                    "(11) 91667-8899", LocalDate.of(2001, 8, 14), null, "Rua das Caneleiras, 510", "Vila Campestre", "Santo André", "09070-220", "Feminino", false, null, false, null);
            Matricula m16 = salvarMatricula(a16, eldContemp, CanalOrigem.SITE, StatusMatricula.CONFIRMADA, "Linguagens corporais contemporâneas.");
            matriculasCriadas.add(m16);
            lancarPresencas(m16, List.of(d1, d2, d3, d4, d5, d6), List.of(StatusPresenca.PRESENTE, StatusPresenca.PRESENTE, StatusPresenca.PRESENTE, StatusPresenca.PRESENTE, StatusPresenca.PRESENTE, StatusPresenca.PRESENTE), null, "Improvisação Coreográfica e Contato");

            // Fila de Espera
            Aluno a17 = salvarAluno("Letícia Barbosa Fontes", "529.563.129-85", "leticia.fontes@email.com",
                    "(11) 98778-9900", LocalDate.of(2004, 11, 2), null, "Rua Andrade Neves, 670", "Vila Pires", "Santo André", "09190-330", "Feminino", false, null, false, null);
            Matricula m17 = salvarMatricula(a17, eldContemp, CanalOrigem.CULTURA_AZ, StatusMatricula.FILA_ESPERA, "1ª Suplente para turma de Poéticas Contemporâneas.");
            matriculasCriadas.add(m17);
        }

        if (eldPrep1 != null) {
            // Menor de idade (15 anos) com Pai Responsável
            Responsavel r1 = salvarResponsavel("Marcos Fagundes Lima", "112.233.445-56", "(11) 97112-3344", "marcos.lima@email.com", "Pai");
            Aluno a18 = salvarAluno("Isabela Fagundes Lima", "630.674.230-96", "isabela.lima@email.com",
                    "(11) 97112-3344", LocalDate.of(2011, 3, 20), r1, "Rua Lauro Muller, 180", "Jardim Bom Pastor", "Santo André", "09051-240", "Feminino", false, null, false, null);
            Matricula m18 = salvarMatricula(a18, eldPrep1, CanalOrigem.FORMS, StatusMatricula.CONFIRMADA, "Dança preparatória para jovens de 13 a 17 anos com autorização paterna.");
            matriculasCriadas.add(m18);
            lancarPresencas(m18, List.of(d1, d2, d3, d4, d5, d6), List.of(StatusPresenca.PRESENTE, StatusPresenca.PRESENTE, StatusPresenca.PRESENTE, StatusPresenca.PRESENTE, StatusPresenca.PRESENTE, StatusPresenca.PRESENTE), null, "Fundamentos de Balé Clássico e Dança Contemporânea");
        }

        if (eldPratica != null) {
            Aluno a19 = salvarAluno("Mariana Albuquerque Rios", "712.345.678-90", "mariana.rios@email.com",
                    "(11) 97889-0012", LocalDate.of(2000, 10, 5), null, "Avenida Industrial, 1500", "Campestre", "Santo André", "09080-500", "Feminino", false, null, false, null);
            Matricula m19 = salvarMatricula(a19, eldPratica, CanalOrigem.SITE, StatusMatricula.CONFIRMADA, "Núcleo de Prática e Pesquisa em Dança.");
            matriculasCriadas.add(m19);
            lancarPresencas(m19, List.of(d1, d2, d3, d4, d5, d6), List.of(StatusPresenca.PRESENTE, StatusPresenca.PRESENTE, StatusPresenca.PRESENTE, StatusPresenca.PRESENTE, StatusPresenca.PRESENTE, StatusPresenca.PRESENTE), null, "Composição Cênica em Dança");
        }

        // =========================================================================
        // ESCOLA LIVRE DE CINEMA E VÍDEO (ELCV)
        // =========================================================================
        Turma elcvForm = findTurma("ELCV-01-2026") != null ? findTurma("ELCV-01-2026") : findTurma("CIN-2026-T1");
        Turma elcvJov = findTurma("ELCV-TAKE-JOV");
        Turma elcvRoteiro = findTurma("ELCV-ROTEIRO");
        Turma elcvAudio = findTurma("ELCV-AUDIO-INIC");
        Turma elcvCineBr = findTurma("ELCV-CINEMA-BR");

        if (elcvForm != null) {
            // Cenário 20: Aluno em Risco de Evasão (3 faltas recentes consecutivas -> ALERTA BUSCA ATIVA)
            Aluno a20 = salvarAluno("Thiago Henrique Lima", "741.785.341-07", "thiago.lima@email.com",
                    "(11) 96990-1122", LocalDate.of(2002, 1, 19), null, "Rua do Café, 120", "Jardim Alzira Franco", "Santo André", "09270-420", "Masculino", false, null, false, null);
            Matricula m20 = salvarMatricula(a20, elcvForm, CanalOrigem.SITE, StatusMatricula.CONFIRMADA, "Risco de evasão: 3 faltas consecutivas recentes. Ação de acolhimento pela secretaria acionada.");
            matriculasCriadas.add(m20);
            lancarPresencaUnica(m20, d1, StatusPresenca.PRESENTE, null, "Direção de Fotografia e Iluminação");
            lancarPresencaUnica(m20, d2, StatusPresenca.PRESENTE, null, "Direção de Fotografia e Iluminação");
            lancarPresencaUnica(m20, d3, StatusPresenca.PRESENTE, null, "Direção de Fotografia e Iluminação");
            lancarPresencaUnica(m20, d4, StatusPresenca.FALTA, null, "Direção de Fotografia e Iluminação");
            lancarPresencaUnica(m20, d5, StatusPresenca.FALTA, null, "Direção de Fotografia e Iluminação");
            lancarPresencaUnica(m20, d6, StatusPresenca.FALTA, null, "Direção de Fotografia e Iluminação");

            // Cenário 21: Aluna com faltas justificadas com atestado
            Aluno a21 = salvarAluno("Larissa Mendes Castro", "852.896.452-18", "larissa.castro@email.com",
                    "(11) 95001-2233", LocalDate.of(2000, 7, 11), null, "Rua das Monções, 1150", "Vila Guiomar", "Santo André", "09090-521", "Feminino", false, null, false, null);
            Matricula m21 = salvarMatricula(a21, elcvForm, CanalOrigem.PRESENCIAL, StatusMatricula.CONFIRMADA, "Formação em Cinema. Frequência regular com apresentação prévia de justificativas.");
            matriculasCriadas.add(m21);
            lancarPresencaUnica(m21, d1, StatusPresenca.PRESENTE, null, "Prática com Câmeras e Lentes");
            lancarPresencaUnica(m21, d2, StatusPresenca.PRESENTE, null, "Prática com Câmeras e Lentes");
            lancarPresencaUnica(m21, d3, StatusPresenca.JUSTIFICADA, "Atestado odontológico cirúrgico", "Prática com Câmeras e Lentes");
            lancarPresencaUnica(m21, d4, StatusPresenca.JUSTIFICADA, "Atestado de recuperação pós-operatória", "Prática com Câmeras e Lentes");
            lancarPresencaUnica(m21, d5, StatusPresenca.PRESENTE, null, "Prática com Câmeras e Lentes");
            lancarPresencaUnica(m21, d6, StatusPresenca.PRESENTE, null, "Prática com Câmeras e Lentes");

            // Cenário 22: Aluno via planilha de migração
            Aluno a22 = salvarAluno("Caio Felipe Morais", "963.907.563-29", "caio.morais@email.com",
                    "(11) 94112-3344", LocalDate.of(1999, 3, 25), null, "Avenida Atlântica, 740", "Valparaíso", "Santo André", "09060-001", "Masculino", false, null, false, null);
            Matricula m22 = salvarMatricula(a22, elcvForm, CanalOrigem.PLANILHA, StatusMatricula.CONFIRMADA, "Importado da lista oficial do processo seletivo 2026.");
            matriculasCriadas.add(m22);
            lancarPresencas(m22, List.of(d1, d2, d3, d4, d5, d6), List.of(StatusPresenca.PRESENTE, StatusPresenca.PRESENTE, StatusPresenca.PRESENTE, StatusPresenca.PRESENTE, StatusPresenca.PRESENTE, StatusPresenca.PRESENTE), null, "Linguagem Audiovisual e Planificação");
        }

        if (elcvJov != null) {
            // Cenário 23: Adolescente (16 anos) com Mãe Responsável no Take Jovem
            Responsavel r2 = salvarResponsavel("Juliana Costa Neves", "223.344.556-67", "(11) 98223-4455", "juliana.costa@email.com", "Mãe");
            Aluno a23 = salvarAluno("Beatriz Costa Neves", "074.018.674-40", "beatriz.neves@email.com",
                    "(11) 98223-4455", LocalDate.of(2010, 8, 14), r2, "Rua dos Alpes, 330", "Camilópolis", "Santo André", "09230-220", "Feminino", false, null, false, null);
            Matricula m23 = salvarMatricula(a23, elcvJov, CanalOrigem.FORMS, StatusMatricula.CONFIRMADA, "Programa Primeiro Take Jovem (13 a 17 anos).");
            matriculasCriadas.add(m23);
            lancarPresencas(m23, List.of(d1, d2, d3, d4, d5, d6), List.of(StatusPresenca.PRESENTE, StatusPresenca.PRESENTE, StatusPresenca.PRESENTE, StatusPresenca.PRESENTE, StatusPresenca.PRESENTE, StatusPresenca.PRESENTE), null, "Introdução ao Audiovisual e Criação de Curtas no Celular");
        }

        if (elcvRoteiro != null) {
            // Cenário 24: Concluinte no Cinema com curta autoral aprovado
            Aluno a24 = salvarAluno("Camila Duarte Peixoto", "701.000.000-15", "camila.peixoto@email.com",
                    "(11) 93223-4455", LocalDate.of(1996, 12, 30), null, "Rua Santo André, 450", "Vila Assunção", "Santo André", "09020-230", "Feminino", false, null, false, null);
            Matricula m24 = salvarMatricula(a24, elcvRoteiro, CanalOrigem.CULTURA_AZ, StatusMatricula.CONCLUIDA, "Formada com apresentação e leitura de roteiro de curta-metragem no Festival das Escolas Livres.");
            matriculasCriadas.add(m24);
            lancarPresencas(m24, List.of(d1, d2, d3, d4, d5, d6), List.of(StatusPresenca.PRESENTE, StatusPresenca.PRESENTE, StatusPresenca.PRESENTE, StatusPresenca.PRESENTE, StatusPresenca.PRESENTE, StatusPresenca.PRESENTE), null, "Estrutura do Argumento e Pitching de Projetos");

            // Cenário 25: Fila de espera na turma concorrida de Roteiro
            Aluno a25 = salvarAluno("Felipe Ramos Silveira", "185.129.785-41", "felipe.silveira@email.com",
                    "(11) 92334-5566", LocalDate.of(1995, 5, 23), null, "Rua Senador Flaquer, 190", "Centro", "Santo André", "09010-160", "Masculino", false, null, false, null);
            Matricula m25 = salvarMatricula(a25, elcvRoteiro, CanalOrigem.SITE, StatusMatricula.FILA_ESPERA, "1º Suplente para a turma noturna de Roteiro Cinematográfico.");
            matriculasCriadas.add(m25);

            Aluno a26 = salvarAluno("Patrícia Meireles Godoy", "296.230.896-52", "patricia.godoy@email.com",
                    "(11) 91445-6677", LocalDate.of(1992, 10, 8), null, "Rua das Goiabeiras, 305", "Vila Valparaíso", "Santo André", "09060-020", "Feminino", false, null, false, null);
            Matricula m26 = salvarMatricula(a26, elcvRoteiro, CanalOrigem.SITE, StatusMatricula.CONFIRMADA, "Desenvolvimento de roteiro para documentário comunitário.");
            matriculasCriadas.add(m26);
            lancarPresencas(m26, List.of(d1, d2, d3, d4, d5, d6), List.of(StatusPresenca.PRESENTE, StatusPresenca.PRESENTE, StatusPresenca.PRESENTE, StatusPresenca.PRESENTE, StatusPresenca.PRESENTE, StatusPresenca.PRESENTE), null, "Construção de Personagens e Diálogos");
        }

        if (elcvAudio != null) {
            Aluno a27 = salvarAluno("Leonardo Barbosa Siqueira", "389.012.345-67", "leonardo.siqueira@email.com",
                    "(11) 97556-7788", LocalDate.of(2001, 2, 17), null, "Avenida Doutor Erasmo, 410", "Vila Assunção", "Santo André", "09030-010", "Masculino", false, null, false, null);
            Matricula m27 = salvarMatricula(a27, elcvAudio, CanalOrigem.PRESENCIAL, StatusMatricula.CONFIRMADA, "Oficina de captação de som direto e edição sonora.");
            matriculasCriadas.add(m27);
            lancarPresencas(m27, List.of(d1, d2, d3, d4, d5, d6), List.of(StatusPresenca.PRESENTE, StatusPresenca.PRESENTE, StatusPresenca.PRESENTE, StatusPresenca.PRESENTE, StatusPresenca.PRESENTE, StatusPresenca.PRESENTE), null, "Microfonação e Captação de Áudio Direto com Boom");
        }

        if (elcvCineBr != null) {
            Aluno a28 = salvarAluno("Rodrigo Faria Peçanha", "490.123.456-78", "rodrigo.pecanha@email.com",
                    "(11) 96667-8899", LocalDate.of(1993, 11, 14), null, "Rua Carijós, 980", "Vila Alzira", "Santo André", "09180-000", "Masculino", false, null, false, null);
            Matricula m28 = salvarMatricula(a28, elcvCineBr, CanalOrigem.CULTURA_AZ, StatusMatricula.CONFIRMADA, "História e estética do cinema brasileiro contemporâneo.");
            matriculasCriadas.add(m28);
            lancarPresencas(m28, List.of(d1, d2, d3, d4, d5, d6), List.of(StatusPresenca.PRESENTE, StatusPresenca.PRESENTE, StatusPresenca.PRESENTE, StatusPresenca.PRESENTE, StatusPresenca.PRESENTE, StatusPresenca.PRESENTE), null, "Cinema Novo e Produção Audiovisual Paulista");
        }

        // =========================================================================
        // ESCOLA MUNICIPAL DE INICIAÇÃO ARTÍSTICA (EMIA ARON FELDMAN)
        // =========================================================================
        Turma emiaMia0 = findTurma("EMIA-MIA0-2026");
        Turma emiaMia1 = findTurma("EMIA-MIA1-2026");
        Turma emiaMia2 = findTurma("EMIA-MIA2-2026");
        Turma emiaMia3 = findTurma("EMIA-MIA3-2026");
        Turma emiaAquarela = findTurma("EMIA-AQUARELA-2026");

        if (emiaMia0 != null) {
            // Criança de 5 anos com Mãe Responsável
            Responsavel r3 = salvarResponsavel("Claudia Mendonça", "334.455.667-78", "(11) 99334-5566", "claudia.mendonca@email.com", "Mãe");
            Aluno a29 = salvarAluno("Sofia Helena Mendonça", "307.341.907-63", "sofia.mendonca@email.com",
                    "(11) 99334-5566", LocalDate.of(2021, 6, 10), r3, "Rua Adolfo Bastos, 650", "Vila Floresta", "Santo André", "09041-000", "Feminino", false, null, false, null);
            Matricula m29 = salvarMatricula(a29, emiaMia0, CanalOrigem.PRESENCIAL, StatusMatricula.CONFIRMADA, "Sensibilização artística na primeira infância (5 a 6 anos). Termos LGPD e uso de imagem assinados.");
            matriculasCriadas.add(m29);
            lancarPresencas(m29, List.of(d1, d2, d3, d4, d5, d6), List.of(StatusPresenca.PRESENTE, StatusPresenca.PRESENTE, StatusPresenca.PRESENTE, StatusPresenca.PRESENTE, StatusPresenca.PRESENTE, StatusPresenca.PRESENTE), null, "Cantigas da Cultura Popular e Modelagem com Argila");

            Responsavel r4 = salvarResponsavel("Fernanda Bezerra Pinto", "445.566.778-89", "(11) 98445-6677", "fernanda.pinto@email.com", "Mãe");
            Aluno a30 = salvarAluno("Arthur Bezerra Pinto", "418.452.018-74", "arthur.pinto@email.com",
                    "(11) 98445-6677", LocalDate.of(2020, 9, 15), r4, "Rua Itatiba, 180", "Parque Jaçatuba", "Santo André", "09290-000", "Masculino", false, null, false, null);
            Matricula m30 = salvarMatricula(a30, emiaMia0, CanalOrigem.SITE, StatusMatricula.CONFIRMADA, "Expressão plástica e jogos musicais.");
            matriculasCriadas.add(m30);
            lancarPresencas(m30, List.of(d1, d2, d3, d4, d5, d6), List.of(StatusPresenca.PRESENTE, StatusPresenca.PRESENTE, StatusPresenca.PRESENTE, StatusPresenca.PRESENTE, StatusPresenca.PRESENTE, StatusPresenca.PRESENTE), null, "Cores Naturais e Brincadeiras Corporais");
        }

        if (emiaMia1 != null) {
            // Cenário 31: Aluno com Neurodiversidade (TEA Nível 1) na EMIA
            Responsavel r5 = salvarResponsavel("Roberto Carlos Silva", "556.677.889-90", "(11) 97556-7788", "roberto.silva@email.com", "Pai");
            Aluno a31 = salvarAluno("Lucas Gabriel Silva", "529.563.129-86", "lucas.silva@email.com",
                    "(11) 97556-7788", LocalDate.of(2019, 4, 28), r5, "Rua das Figueiras, 1920", "Vila Palmares", "Santo André", "09060-000", "Masculino", true, "Transtorno do Espectro Autista (TEA Nível 1). Acolhimento pedagógico em artes visuais e musicalização.", false, null);
            Matricula m31 = salvarMatricula(a31, emiaMia1, CanalOrigem.PRESENCIAL, StatusMatricula.CONFIRMADA, "Integração lúdica com plano de atendimento inclusivo em ateliê.");
            matriculasCriadas.add(m31);
            lancarPresencas(m31, List.of(d1, d2, d3, d4, d5, d6), List.of(StatusPresenca.PRESENTE, StatusPresenca.PRESENTE, StatusPresenca.PRESENTE, StatusPresenca.PRESENTE, StatusPresenca.PRESENTE, StatusPresenca.PRESENTE), null, "Ateliê de Criação: Texturas, Formas e Sons");
        }

        if (emiaMia2 != null) {
            // Tutora Legal (Avó)
            Responsavel r6 = salvarResponsavel("Aparecida Zanin Toledo", "667.788.990-01", "(11) 96667-8899", "aparecida.toledo@email.com", "Tutora Legal");
            Aluno a32 = salvarAluno("Heloísa Zanin Toledo", "630.674.230-97", "heloisa.toledo@email.com",
                    "(11) 96667-8899", LocalDate.of(2018, 1, 19), r6, "Avenida Capitão Mário Toledo de Camargo, 1200", "Jardim do Estádio", "Santo André", "09170-000", "Feminino", false, null, false, null);
            Matricula m32 = salvarMatricula(a32, emiaMia2, CanalOrigem.FORMS, StatusMatricula.CONFIRMADA, "Ciclo de experimentação artística (8 a 9 anos).");
            matriculasCriadas.add(m32);
            lancarPresencas(m32, List.of(d1, d2, d3, d4, d5, d6), List.of(StatusPresenca.PRESENTE, StatusPresenca.PRESENTE, StatusPresenca.PRESENTE, StatusPresenca.PRESENTE, StatusPresenca.PRESENTE, StatusPresenca.PRESENTE), null, "Teatro de Sombras e Narrativas Coletivas");
        }

        if (emiaMia3 != null) {
            Responsavel r7 = salvarResponsavel("Carlos Guimarães", "123.456.789-01", "(11) 97778-8990", "carlos.guimaraes@email.com", "Pai");
            Aluno a33 = salvarAluno("Bernardo Alves Guimarães", "501.234.567-89", "bernardo.guimaraes@email.com",
                    "(11) 97778-8990", LocalDate.of(2015, 3, 22), r7, "Rua Juquiá, 450", "Vila Eldízia", "Santo André", "09180-230", "Masculino", false, null, false, null);
            Matricula m33 = salvarMatricula(a33, emiaMia3, CanalOrigem.PRESENCIAL, StatusMatricula.CONFIRMADA, "Formação artística infanto-juvenil integrada (10 a 12 anos).");
            matriculasCriadas.add(m33);
            lancarPresencas(m33, List.of(d1, d2, d3, d4, d5, d6), List.of(StatusPresenca.PRESENTE, StatusPresenca.PRESENTE, StatusPresenca.PRESENTE, StatusPresenca.PRESENTE, StatusPresenca.PRESENTE, StatusPresenca.PRESENTE), null, "Instalações Visuais e Criação Sonora Coletiva");
        }

        if (emiaAquarela != null) {
            Responsavel r8 = salvarResponsavel("Mariana Vieira", "778.899.001-12", "(11) 95778-8990", "mariana.vieira@email.com", "Mãe");
            Aluno a34 = salvarAluno("Enzo Gabriel Vieira", "741.785.341-08", "enzo.vieira@email.com",
                    "(11) 95778-8990", LocalDate.of(2016, 5, 14), r8, "Rua Carijós, 2800", "Centreville", "Santo André", "09120-000", "Masculino", false, null, false, null);
            Matricula m34 = salvarMatricula(a34, emiaAquarela, CanalOrigem.SITE, StatusMatricula.CONFIRMADA, "Projeto Aquarela Integrado das Artes.");
            matriculasCriadas.add(m34);
            lancarPresencas(m34, List.of(d1, d2, d3, d4, d5, d6), List.of(StatusPresenca.PRESENTE, StatusPresenca.PRESENTE, StatusPresenca.PRESENTE, StatusPresenca.PRESENTE, StatusPresenca.PRESENTE, StatusPresenca.PRESENTE), null, "Expressão Plástica com Aquarela e Movimento");

            Responsavel r9 = salvarResponsavel("Rodrigo Nogueira", "889.900.112-23", "(11) 94889-9001", "rodrigo.nogueira@email.com", "Pai");
            Aluno a35 = salvarAluno("Alice Santos Nogueira", "852.896.452-19", "alice.nogueira@email.com",
                    "(11) 94889-9001", LocalDate.of(2015, 8, 26), r9, "Rua das Hortênsias, 720", "Vila Luzita", "Santo André", "09170-400", "Feminino", false, null, false, null);
            Matricula m35 = salvarMatricula(a35, emiaAquarela, CanalOrigem.CULTURA_AZ, StatusMatricula.CONFIRMADA, "Oficina multidisciplinar de artes e musicalização.");
            matriculasCriadas.add(m35);
            lancarPresencas(m35, List.of(d1, d2, d3, d4, d5, d6), List.of(StatusPresenca.PRESENTE, StatusPresenca.PRESENTE, StatusPresenca.PRESENTE, StatusPresenca.PRESENTE, StatusPresenca.PRESENTE, StatusPresenca.PRESENTE), null, "Pintura Coletiva e Ritmos Populares");

            Responsavel r10 = salvarResponsavel("Tatiana Martins Ferraz", "990.011.223-34", "(11) 93990-0112", "tatiana.ferraz@email.com", "Mãe");
            Aluno a36 = salvarAluno("Gabriela Martins Ferraz", "963.907.563-30", "gabriela.ferraz@email.com",
                    "(11) 93990-0112", LocalDate.of(2016, 2, 9), r10, "Rua Suíça, 340", "Vila Curuçá", "Santo André", "09290-340", "Feminino", false, null, false, null);
            Matricula m36 = salvarMatricula(a36, emiaAquarela, CanalOrigem.SITE, StatusMatricula.FILA_ESPERA, "1ª na lista de espera para o Projeto Aquarela.");
            matriculasCriadas.add(m36);
        }

        // =========================================================================
        // RECALCULO ESTATÍSTICO DE VAGAS OCUPADAS EM TODAS AS TURMAS
        // =========================================================================
        List<Turma> todasTurmas = turmaRepository.findAll();
        for (Turma t : todasTurmas) {
            long confirmadas = matriculaRepository.countByTurmaIdAndStatus(t.getId(), StatusMatricula.CONFIRMADA);
            t.setVagasOcupadas((int) confirmadas);
            turmaRepository.save(t);
        }

        // =========================================================================
        // LIMPEZA E SINCRONIZAÇÃO DE CACHES
        // =========================================================================
        try {
            if (cacheManager != null) {
                cacheManager.getCacheNames().forEach(name -> {
                    Cache c = cacheManager.getCache(name);
                    if (c != null) c.clear();
                });
                log.info("[SEEDER] Caches esvaziados e sincronizados com sucesso.");
            }
        } catch (Exception e) {
            log.warn("[SEEDER] Aviso ao esvaziar cache: {}", e.getMessage());
        }

        long totalMatriculas = matriculaRepository.count();
        long totalPresencas = registroPresencaRepository.count();
        long totalAlunos = alunoRepository.count();

        log.info("[SEEDER] Concluído com sucesso! Alunos: {}, Matrículas: {}, Presenças: {}", totalAlunos, totalMatriculas, totalPresencas);

        Map<String, Object> resultado = new HashMap<>();
        resultado.put("sucesso", true);
        resultado.put("mensagem", "Matrículas resetadas e geradas com contextos realistas e diversificados nas 4 Escolas Livres.");
        resultado.put("totalAlunos", totalAlunos);
        resultado.put("totalMatriculas", totalMatriculas);
        resultado.put("totalPresencas", totalPresencas);
        resultado.put("turmasAtualizadas", todasTurmas.size());
        return resultado;
    }

    private Turma findTurma(String codigo) {
        return turmaRepository.findByCodigo(codigo).orElse(null);
    }

    private Responsavel salvarResponsavel(String nome, String cpf, String telefone, String email, String parentesco) {
        return responsavelRepository.save(Responsavel.builder()
                .nome(nome)
                .cpf(cpf)
                .telefone(telefone)
                .email(email)
                .grauParentesco(parentesco)
                .build());
    }

    private Aluno salvarAluno(String nome, String cpf, String email, String telefone, LocalDate nascimento,
                              Responsavel responsavel, String endereco, String bairro, String cidade, String cep,
                              String genero, boolean neurodiverso, String neuroDetalhe, boolean pcd, String pcdDetalhe) {
        return alunoRepository.save(Aluno.builder()
                .nome(nome)
                .cpf(cpf)
                .email(email)
                .telefone(telefone)
                .dataNascimento(nascimento)
                .responsavel(responsavel)
                .endereco(endereco)
                .bairro(bairro)
                .cidade(cidade)
                .cep(cep)
                .genero(genero)
                .neurodiverso(neurodiverso)
                .neurodiversoDetalhe(neuroDetalhe)
                .pcd(pcd)
                .pcdDetalhe(pcdDetalhe)
                .contatoEmergencia(telefone)
                .consentimentoLgpd(true)
                .consentimentoLgpdDadosSensiveis(true)
                .dataConsentimentoLgpd(LocalDateTime.now())
                .consentimentoUsoImagem(true)
                .termoPapelEntregue(true)
                .build());
    }

    private Matricula salvarMatricula(Aluno aluno, Turma turma, CanalOrigem canal, StatusMatricula status, String observacoes) {
        return matriculaRepository.save(Matricula.builder()
                .aluno(aluno)
                .turma(turma)
                .canalOrigem(canal)
                .status(status)
                .observacoes(observacoes)
                .build());
    }

    private void lancarPresencas(Matricula m, List<LocalDate> datas, List<StatusPresenca> statuses, String justificativa, String conteudo) {
        TurmaMateria materia = (m.getTurma() != null && m.getTurma().getMaterias() != null && !m.getTurma().getMaterias().isEmpty())
                ? m.getTurma().getMaterias().get(0) : null;

        for (int i = 0; i < datas.size(); i++) {
            StatusPresenca st = i < statuses.size() ? statuses.get(i) : StatusPresenca.PRESENTE;
            registroPresencaRepository.save(RegistroPresenca.builder()
                    .matricula(m)
                    .materia(materia)
                    .dataAula(datas.get(i))
                    .status(st)
                    .justificativa(st == StatusPresenca.JUSTIFICADA ? (justificativa != null ? justificativa : "Justificativa anexada") : null)
                    .conteudoMinistrado(conteudo)
                    .responsavelRegistro("Secretaria Escolar")
                    .build());
        }
    }

    private void lancarPresencaUnica(Matricula m, LocalDate data, StatusPresenca status, String justificativa, String conteudo) {
        TurmaMateria materia = (m.getTurma() != null && m.getTurma().getMaterias() != null && !m.getTurma().getMaterias().isEmpty())
                ? m.getTurma().getMaterias().get(0) : null;

        registroPresencaRepository.save(RegistroPresenca.builder()
                .matricula(m)
                .materia(materia)
                .dataAula(data)
                .status(status)
                .justificativa(justificativa)
                .conteudoMinistrado(conteudo)
                .responsavelRegistro("Secretaria Escolar")
                .build());
    }
}
