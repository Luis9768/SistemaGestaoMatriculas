package com.gestaomatriculas.config;

import com.gestaomatriculas.model.*;
import com.gestaomatriculas.model.enums.*;
import com.gestaomatriculas.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final EscolaRepository escolaRepository;
    private final UsuarioRepository usuarioRepository;
    private final CursoRepository cursoRepository;
    private final TurmaRepository turmaRepository;
    private final TurmaMateriaRepository turmaMateriaRepository;
    private final AlunoRepository alunoRepository;
    private final ResponsavelRepository responsavelRepository;
    private final MatriculaRepository matriculaRepository;
    private final RegistroPresencaRepository registroPresencaRepository;
    private final PasswordEncoder passwordEncoder;
    private final org.springframework.cache.CacheManager cacheManager;

    @org.springframework.beans.factory.annotation.Value("${app.initial.password:${INITIAL_USER_PASSWORD:admin123}}")
    private String initialConfiguredPassword;

    private String resolveInitialPassword() {
        if (initialConfiguredPassword != null && !initialConfiguredPassword.trim().isEmpty()) {
            return initialConfiguredPassword.trim();
        }
        return "admin123";
    }

    @Override
    public void run(String... args) {
        if (escolaRepository.count() == 0) {
            log.info("Inicializando dados padrão das Escolas Livres de Santo André...");

            // 1. As 4 Escolas Culturais
            Escola elt = escolaRepository.save(Escola.builder()
                    .nome("Escola Livre de Teatro")
                    .sigla("ELT")
                    .descricao("Referência nacional na formação teatral pública e processos colaborativos.")
                    .corTema("violet")
                    .ativa(true)
                    .build());

            Escola eld = escolaRepository.save(Escola.builder()
                    .nome("Escola Livre de Dança")
                    .sigla("ELD")
                    .descricao("Formação e pesquisa em dança contemporânea e linguagens corporais.")
                    .corTema("rose")
                    .ativa(true)
                    .build());

            Escola elcv = escolaRepository.save(Escola.builder()
                    .nome("Escola Livre de Cinema e Vídeo")
                    .sigla("ELCV")
                    .descricao("Capacitação audiovisual em roteiro, direção, fotografia, som e montagem.")
                    .corTema("blue")
                    .ativa(true)
                    .build());

            Escola emia = escolaRepository.save(Escola.builder()
                    .nome("Escola Municipal de Iniciação Artística")
                    .sigla("EMIA")
                    .descricao("Desenvolvimento de sensibilidade artística infantil e jovem dividida por faixas etárias.")
                    .corTema("amber")
                    .ativa(true)
                    .build());

            // 2. Usuários da Secretaria (Admin e Encarregadas)
            String defaultInitialPass = resolveInitialPassword();
            String encodedPass = passwordEncoder.encode(defaultInitialPass);

            usuarioRepository.save(Usuario.builder()
                    .nome("Coordenação Geral")
                    .email("admin@santoandre.sp.gov.br")
                    .senha(encodedPass)
                    .role(Role.ROLE_ADMIN)
                    .escola(null) // Acesso global
                    .ativo(true)
                    .build());

            usuarioRepository.save(Usuario.builder()
                    .nome("Luis Miguel")
                    .email("luis@email.com")
                    .senha(encodedPass)
                    .role(Role.ROLE_ADMIN)
                    .escola(null) // Acesso global
                    .ativo(true)
                    .build());

            usuarioRepository.save(Usuario.builder()
                    .nome("Encarregada ELT")
                    .email("encarregada.elt@santoandre.sp.gov.br")
                    .senha(encodedPass)
                    .role(Role.ROLE_ENCARREGADA)
                    .escola(elt)
                    .ativo(true)
                    .build());

            usuarioRepository.save(Usuario.builder()
                    .nome("Encarregada ELD")
                    .email("encarregada.eld@santoandre.sp.gov.br")
                    .senha(encodedPass)
                    .role(Role.ROLE_ENCARREGADA)
                    .escola(eld)
                    .ativo(true)
                    .build());

            usuarioRepository.save(Usuario.builder()
                    .nome("Encarregada ELCV")
                    .email("encarregada.elcv@santoandre.sp.gov.br")
                    .senha(encodedPass)
                    .role(Role.ROLE_ENCARREGADA)
                    .escola(elcv)
                    .ativo(true)
                    .build());

            usuarioRepository.save(Usuario.builder()
                    .nome("Encarregada EMIA")
                    .email("encarregada.emia@santoandre.sp.gov.br")
                    .senha(encodedPass)
                    .role(Role.ROLE_ENCARREGADA)
                    .escola(emia)
                    .ativo(true)
                    .build());

            log.info("================================================================================");
            log.info("[SEGURANÇA] Usuários institucionais cadastrados com sucesso.");
            log.info("[SEGURANÇA] Utilize a variável de ambiente INITIAL_USER_PASSWORD ou a recuperação de senha via e-mail.");
            log.info("================================================================================");

            // 3. Cursos de cada Escola
            // ELT
            Curso cursoTeatroFormacao = cursoRepository.save(Curso.builder()
                    .escola(elt)
                    .nome("Formação em Teatro")
                    .descricao("Curso extensivo de formação de atores e criadores cênicos.")
                    .tipo(TipoCurso.REGULAR)
                    .modalidade(ModalidadeCurso.FORMACAO)
                    .duracaoMeses(36)
                    .cargaHoraria(2400)
                    .ativo(true)
                    .build());

            Curso oficinaDramaturgia = cursoRepository.save(Curso.builder()
                    .escola(elt)
                    .nome("Oficina de Dramaturgia Livre")
                    .descricao("Escrita de textos teatrais e dramaturgia contemporânea.")
                    .tipo(TipoCurso.OFICINA)
                    .modalidade(ModalidadeCurso.OFICINA)
                    .duracaoMeses(3)
                    .cargaHoraria(60)
                    .ativo(true)
                    .build());

            // ELD
            Curso cursoDancaFormacao = cursoRepository.save(Curso.builder()
                    .escola(eld)
                    .nome("Formação em Dança Contemporânea")
                    .descricao("Prática somática, improvisação e composição coreográfica.")
                    .tipo(TipoCurso.REGULAR)
                    .modalidade(ModalidadeCurso.FORMACAO)
                    .duracaoMeses(24)
                    .cargaHoraria(1600)
                    .ativo(true)
                    .build());

            Curso nucleoDancasUrbanas = cursoRepository.save(Curso.builder()
                    .escola(eld)
                    .nome("Núcleo de Danças Urbanas")
                    .descricao("Pesquisa corporal e criação coreográfica em hip-hop e breaking.")
                    .tipo(TipoCurso.OFICINA)
                    .modalidade(ModalidadeCurso.NUCLEO)
                    .duracaoMeses(6)
                    .cargaHoraria(120)
                    .ativo(true)
                    .build());

            // ELCV
            Curso cursoCinemaFormacao = cursoRepository.save(Curso.builder()
                    .escola(elcv)
                    .nome("Formação em Cinema e Realização Audiovisual")
                    .descricao("Formação completa de cineastas com grade curricular dinâmica.")
                    .tipo(TipoCurso.REGULAR)
                    .modalidade(ModalidadeCurso.FORMACAO)
                    .duracaoMeses(24)
                    .cargaHoraria(1800)
                    .ativo(true)
                    .build());

            Curso oficinaFotografia = cursoRepository.save(Curso.builder()
                    .escola(elcv)
                    .nome("Oficina de Direção de Fotografia e Câmera")
                    .descricao("Prática de iluminação, lentes e enquadramento cinematográfico.")
                    .tipo(TipoCurso.OFICINA)
                    .modalidade(ModalidadeCurso.OFICINA)
                    .duracaoMeses(2)
                    .cargaHoraria(40)
                    .ativo(true)
                    .build());

            // EMIA - Cursos por Faixa Etária
            Curso eliaKids = cursoRepository.save(Curso.builder()
                    .escola(emia)
                    .nome("Iniciação Artística Lúdica (5 a 6 anos)")
                    .descricao("Desenvolvimento corporal e visual através da brincadeira.")
                    .tipo(TipoCurso.OFICINA)
                    .modalidade(ModalidadeCurso.OFICINA)
                    .duracaoMeses(4)
                    .cargaHoraria(40)
                    .ativo(true)
                    .build());

            Curso eliaInfantil = cursoRepository.save(Curso.builder()
                    .escola(emia)
                    .nome("Práticas Artísticas Integradas (6 a 10 anos)")
                    .descricao("Teatro de formas animadas, desenho e música para crianças.")
                    .tipo(TipoCurso.OFICINA)
                    .modalidade(ModalidadeCurso.OFICINA)
                    .duracaoMeses(6)
                    .cargaHoraria(60)
                    .ativo(true)
                    .build());

            Curso eliaJuvenil = cursoRepository.save(Curso.builder()
                    .escola(emia)
                    .nome("Ateliê Jovem de Expressão (11 a 16 anos)")
                    .descricao("Experimentação criativa em artes visuais, teatro e corpo.")
                    .tipo(TipoCurso.OFICINA)
                    .modalidade(ModalidadeCurso.NUCLEO)
                    .duracaoMeses(6)
                    .cargaHoraria(80)
                    .ativo(true)
                    .build());

            // 4. Turmas Iniciais com Restrição de Idade e Controle de Vagas
            LocalDate hoje = LocalDate.now();

            Turma turmaCinema = turmaRepository.save(Turma.builder()
                    .curso(cursoCinemaFormacao)
                    .codigo("CIN-2026-T1")
                    .dataAberturaMatricula(hoje.minusDays(10))
                    .dataFechamentoMatricula(hoje.plusDays(20))
                    .dataInicioAulas(hoje.plusDays(25))
                    .dataFimAulas(hoje.plusDays(720))
                    .vagasTotais(35)
                    .vagasOcupadas(1)
                    .idadeMinima(17)
                    .idadeMaxima(99)
                    .status(StatusTurma.ABERTA)
                    .build());

            Turma turmaEliaKids = turmaRepository.save(Turma.builder()
                    .curso(eliaKids)
                    .codigo("ELIA-KIDS-2026")
                    .dataAberturaMatricula(hoje.minusDays(5))
                    .dataFechamentoMatricula(hoje.plusDays(15))
                    .dataInicioAulas(hoje.plusDays(20))
                    .dataFimAulas(hoje.plusDays(120))
                    .vagasTotais(20)
                    .vagasOcupadas(1)
                    .idadeMinima(5)
                    .idadeMaxima(6)
                    .status(StatusTurma.ABERTA)
                    .build());

            Turma turmaTeatro = turmaRepository.save(Turma.builder()
                    .curso(oficinaDramaturgia)
                    .codigo("ELT-DRAM-2026")
                    .dataAberturaMatricula(hoje.minusDays(2))
                    .dataFechamentoMatricula(hoje.plusDays(30))
                    .dataInicioAulas(hoje.plusDays(35))
                    .dataFimAulas(hoje.plusDays(115))
                    .vagasTotais(25)
                    .vagasOcupadas(1)
                    .idadeMinima(16)
                    .idadeMaxima(99)
                    .status(StatusTurma.ABERTA)
                    .build());

            Turma turmaTeatroPassada = turmaRepository.save(Turma.builder()
                    .curso(cursoTeatroFormacao)
                    .codigo("ELT-FORM-2023")
                    .dataAberturaMatricula(hoje.minusYears(2).minusMonths(2))
                    .dataFechamentoMatricula(hoje.minusYears(2).minusMonths(1))
                    .dataInicioAulas(hoje.minusYears(2))
                    .dataFimAulas(hoje.minusMonths(2))
                    .vagasTotais(30)
                    .vagasOcupadas(28)
                    .idadeMinima(17)
                    .idadeMaxima(99)
                    .status(StatusTurma.CONCLUIDA)
                    .build());

            // 5. Aluno Maior, Aluno Menor com Responsável e Aluno com Faltas
            Responsavel mae = responsavelRepository.save(Responsavel.builder()
                    .nome("Fernanda Oliveira")
                    .cpf("45678912300")
                    .telefone("(11) 98111-2233")
                    .email("fernanda.mae@exemplo.com")
                    .grauParentesco("Mãe")
                    .build());

            Aluno alunoMenor = alunoRepository.save(Aluno.builder()
                    .nome("Gabriel Oliveira")
                    .cpf("56789012344")
                    .email("fernanda.mae@exemplo.com")
                    .telefone("(11) 98111-2233")
                    .dataNascimento(LocalDate.now().minusYears(5).minusMonths(6)) // 5 anos e meio
                    .responsavel(mae)
                    .endereco("Rua das Figueiras, 450, Apto 32")
                    .bairro("Jardim")
                    .cidade("Santo André")
                    .cep("09090-000")
                    .genero("Masculino")
                    .contatoEmergencia("Fernanda Oliveira (Mãe) - (11) 98111-2233")
                    .pcd(false)
                    .neurodiverso(false)
                    .consentimentoLgpd(true)
                    .consentimentoLgpdDadosSensiveis(true)
                    .consentimentoUsoImagem(true)
                    .termoPapelEntregue(true)
                    .build());

            Aluno alunoAdulto = alunoRepository.save(Aluno.builder()
                    .nome("Mariana Ribeiro")
                    .cpf("12345678909")
                    .email("mariana.ribeiro@exemplo.com")
                    .telefone("(11) 97222-3344")
                    .dataNascimento(LocalDate.of(1998, 7, 14))
                    .endereco("Av. Portugal, 1120")
                    .bairro("Centro")
                    .cidade("Santo André")
                    .cep("09040-000")
                    .genero("Feminino")
                    .contatoEmergencia("Carlos Ribeiro (Irmão) - (11) 97333-8899")
                    .pcd(false)
                    .neurodiverso(true)
                    .neurodiversoDetalhe("TDAH")
                    .consentimentoLgpd(true)
                    .consentimentoLgpdDadosSensiveis(true)
                    .consentimentoUsoImagem(true)
                    .termoPapelEntregue(true)
                    .build());

            Aluno alunoLucas = alunoRepository.save(Aluno.builder()
                    .nome("Lucas Mendes Santos")
                    .cpf("98765432100")
                    .email("lucas.mendes@exemplo.com")
                    .telefone("(11) 97111-4455")
                    .dataNascimento(LocalDate.of(2001, 5, 10))
                    .endereco("Rua Gertrudes de Lima, 78")
                    .bairro("Centro")
                    .cidade("Santo André")
                    .cep("09020-000")
                    .genero("Masculino")
                    .contatoEmergencia("Helena Santos (Mãe) - (11) 97888-1122")
                    .pcd(false)
                    .neurodiverso(false)
                    .consentimentoLgpd(true)
                    .consentimentoLgpdDadosSensiveis(true)
                    .consentimentoUsoImagem(false)
                    .termoPapelEntregue(true)
                    .build());

            // 6. Matrículas de Exemplo (Histórico + Atuais)
            // Mariana: Formada na ELT (Histórico com êxito)
            Matricula matMarianaFormada = matriculaRepository.save(Matricula.builder()
                    .aluno(alunoAdulto)
                    .turma(turmaTeatroPassada)
                    .canalOrigem(CanalOrigem.PRESENCIAL)
                    .status(StatusMatricula.CONCLUIDA)
                    .observacoes("Formada com êxito no espetáculo de conclusão da ELT.")
                    .build());

            // Mariana: Cursando Cinema na ELCV (Atualmente matriculada)
            Matricula matMarianaCinema = matriculaRepository.save(Matricula.builder()
                    .aluno(alunoAdulto)
                    .turma(turmaCinema)
                    .canalOrigem(CanalOrigem.CULTURA_AZ)
                    .status(StatusMatricula.CONFIRMADA)
                    .observacoes("Inscrita no ciclo de Cinema e Vídeo 2026.")
                    .build());

            // Gabriel: Iniciação Artística na ELIA (Atualmente matriculado)
            Matricula matGabriel = matriculaRepository.save(Matricula.builder()
                    .aluno(alunoMenor)
                    .turma(turmaEliaKids)
                    .canalOrigem(CanalOrigem.PRESENCIAL)
                    .status(StatusMatricula.CONFIRMADA)
                    .observacoes("Inscrição presencial na secretaria com mãe presente.")
                    .build());

            // Lucas: Oficina de Dramaturgia na ELT (Com 2 faltas consecutivas - Risco!)
            Matricula matLucas = matriculaRepository.save(Matricula.builder()
                    .aluno(alunoLucas)
                    .turma(turmaTeatro)
                    .canalOrigem(CanalOrigem.PRESENCIAL)
                    .status(StatusMatricula.CONFIRMADA)
                    .observacoes("Aluno com alerta de frequência na secretaria.")
                    .build());

            // 7. Registro de Presenças
            // Presenças da Mariana no Cinema (80% frequência, 1 falta justificada, 1 falta não justificada)
            registroPresencaRepository.save(RegistroPresenca.builder()
                    .matricula(matMarianaCinema)
                    .dataAula(hoje.minusDays(14))
                    .status(StatusPresenca.PRESENTE)
                    .conteudoMinistrado("Introdução à Direção Cinematográfica e Decupagem")
                    .build());

            registroPresencaRepository.save(RegistroPresenca.builder()
                    .matricula(matMarianaCinema)
                    .dataAula(hoje.minusDays(11))
                    .status(StatusPresenca.PRESENTE)
                    .conteudoMinistrado("Estrutura do Roteiro e Análise Textual")
                    .build());

            registroPresencaRepository.save(RegistroPresenca.builder()
                    .matricula(matMarianaCinema)
                    .dataAula(hoje.minusDays(7))
                    .status(StatusPresenca.JUSTIFICADA)
                    .justificativa("Consulta médica comprovada por atestado")
                    .conteudoMinistrado("Iluminação e Fotografia em Estúdio")
                    .build());

            registroPresencaRepository.save(RegistroPresenca.builder()
                    .matricula(matMarianaCinema)
                    .dataAula(hoje.minusDays(4))
                    .status(StatusPresenca.FALTA)
                    .conteudoMinistrado("Gravação de Planos-Sequência em Externa")
                    .build());

            registroPresencaRepository.save(RegistroPresenca.builder()
                    .matricula(matMarianaCinema)
                    .dataAula(hoje.minusDays(1))
                    .status(StatusPresenca.PRESENTE)
                    .conteudoMinistrado("Montagem e Edição Digital")
                    .build());

            // Presenças do Gabriel na ELIA (100% de presença)
            registroPresencaRepository.save(RegistroPresenca.builder()
                    .matricula(matGabriel)
                    .dataAula(hoje.minusDays(12))
                    .status(StatusPresenca.PRESENTE)
                    .conteudoMinistrado("Expressão Corporal e Jogos Tradicionais")
                    .build());

            registroPresencaRepository.save(RegistroPresenca.builder()
                    .matricula(matGabriel)
                    .dataAula(hoje.minusDays(8))
                    .status(StatusPresenca.PRESENTE)
                    .conteudoMinistrado("Pintura em Papel Kraft e Mistura de Tintas")
                    .build());

            registroPresencaRepository.save(RegistroPresenca.builder()
                    .matricula(matGabriel)
                    .dataAula(hoje.minusDays(4))
                    .status(StatusPresenca.PRESENTE)
                    .conteudoMinistrado("Sons da Cidade e Ritmos Percussivos")
                    .build());

            // Presenças do Lucas (2 faltas consecutivas - Alerta Vermelho de risco!)
            registroPresencaRepository.save(RegistroPresenca.builder()
                    .matricula(matLucas)
                    .dataAula(hoje.minusDays(10))
                    .status(StatusPresenca.PRESENTE)
                    .conteudoMinistrado("História do Teatro Moderno")
                    .build());

            registroPresencaRepository.save(RegistroPresenca.builder()
                    .matricula(matLucas)
                    .dataAula(hoje.minusDays(6))
                    .status(StatusPresenca.FALTA)
                    .conteudoMinistrado("Exercício de Improvisação Coletiva")
                    .build());

            registroPresencaRepository.save(RegistroPresenca.builder()
                    .matricula(matLucas)
                    .dataAula(hoje.minusDays(2))
                    .status(StatusPresenca.FALTA)
                    .conteudoMinistrado("Laboratório de Voz e Dicção")
                    .build());

            log.info("Carga inicial das 4 Escolas, histórico de formatura e registros de presença concluída!");
        }

        // Garante a grade curricular oficial das 4 Escolas Livres e preenchimento com alunos reais
        atualizarCatalogoOficial();

        // Atualiza a senha de todos os usuários para a senha padrão institucional (admin123)
        atualizarSenhasDeTodosUsuarios();

        // Limpa todos os caches para garantir visualização imediata de dados atualizados
        try {
            if (cacheManager != null) {
                cacheManager.getCacheNames().forEach(name -> {
                    org.springframework.cache.Cache c = cacheManager.getCache(name);
                    if (c != null) c.clear();
                });
                log.info("[DATA INITIALIZER] Caches sincronizados e limpos com sucesso.");
            }
        } catch (Exception e) {
            log.warn("[DATA INITIALIZER] Aviso ao limpar caches: {}", e.getMessage());
        }
    }

    private void atualizarSenhasDeTodosUsuarios() {
        try {
            String defaultPass = resolveInitialPassword();
            String encodedPass = passwordEncoder.encode(defaultPass);
            List<Usuario> usuarios = usuarioRepository.findAll();
            for (Usuario u : usuarios) {
                u.setSenha(encodedPass);
                usuarioRepository.save(u);
            }
            log.info("================================================================================");
            log.info("[SENHAS] Senha de todos os {} usuários atualizada com sucesso para: {}", usuarios.size(), defaultPass);
            log.info("================================================================================");
        } catch (Exception e) {
            log.error("[SENHAS] Falha ao atualizar senhas dos usuários: {}", e.getMessage(), e);
        }
    }

    private void atualizarCatalogoOficial() {
        log.info("Sincronizando catálogo oficial e grade curricular das Escolas Livres...");

        Escola elt = escolaRepository.findBySiglaIgnoreCase("ELT").orElse(null);
        Escola eld = escolaRepository.findBySiglaIgnoreCase("ELD").orElse(null);
        Escola elcv = escolaRepository.findBySiglaIgnoreCase("ELCV").orElse(null);
        Escola emia = escolaRepository.findBySiglaIgnoreCase("EMIA")
                .or(() -> escolaRepository.findBySiglaIgnoreCase("ELIA"))
                .orElse(null);

        if (elt == null || eld == null || elcv == null || emia == null) {
            log.warn("Escolas não localizadas para sincronização da grade.");
            return;
        }

        if (!"EMIA".equalsIgnoreCase(emia.getSigla())) {
            emia.setSigla("EMIA");
            emia.setNome("Escola Municipal de Iniciação Artística");
            emia = escolaRepository.save(emia);
        }

        // ==========================================
        // 1. ELD - ESCOLA LIVRE DE DANÇA
        // ==========================================
        Curso eldPratica = obterOuCriarCurso(eld, "Núcleo 1 - Prática e Pesquisa em Dança",
                "Encontros com princípios na prática e experimentação da dança corporal.", TipoCurso.REGULAR, ModalidadeCurso.NUCLEO, 12, 160);
        Curso eldPrep = obterOuCriarCurso(eld, "Núcleo 2 - Dança Preparatória",
                "Formação corporal sensível para crianças e adolescentes.", TipoCurso.OFICINA, ModalidadeCurso.OFICINA, 12, 120);
        Curso eldDissidentes = obterOuCriarCurso(eld, "Núcleo 3 - Poéticas Dissidentes",
                "Pesquisa em danças contemporâneas e afro-diaspóricas.", TipoCurso.OFICINA, ModalidadeCurso.NUCLEO, 12, 140);

        Turma tEld1 = garantirTurma(eldPratica, "ELD-NUC1-BENEGA", "Antônio Benega",
                "Segundas e Quartas-feiras, 09h às 11h - Centro de Dança de Santo André", 25, 17, 99);
        garantirMateria(tEld1, "Consciência Corporal e Pilates", "40h", 1);
        garantirMateria(tEld1, "Elementos Básicos do Movimento", "40h", 2);
        garantirMateria(tEld1, "Pesquisa e Criação Coreográfica", "80h", 3);

        Turma tEld2 = garantirTurma(eldPratica, "ELD-NUC1-BRASILEIRO", "Vinícius Brasileiro",
                "Terças e Quintas-feiras, 19h às 21h - Centro Artístico", 25, 17, 99);
        garantirMateria(tEld2, "Danças Urbanas e Contemporâneas", "50h", 1);
        garantirMateria(tEld2, "Improvisação e Contato", "50h", 2);
        garantirMateria(tEld2, "Composição Cênica Autoral", "60h", 3);

        Turma tEld3 = garantirTurma(eldPratica, "ELD-NUC1-PINHO", "Camila Pinho",
                "Terças e Quintas-feiras, 09h às 11h - Centro de Dança de Santo André", 25, 17, 99);
        garantirMateria(tEld3, "Técnica Clássica Aplicada", "40h", 1);
        garantirMateria(tEld3, "Alinhamento Postural e Barra Solo", "40h", 2);
        garantirMateria(tEld3, "Laboratório de Movimento", "80h", 3);

        Turma tEldPrep0 = garantirTurma(eldPrep, "ELD-PRE-DANCA", "Thais Ribeiro",
                "Segundas e Quartas-feiras, 14h às 15h - Centro de Dança de Santo André", 20, 5, 6);
        garantirMateria(tEldPrep0, "Expressão Lúdica e Ritmo", "30h", 1);
        garantirMateria(tEldPrep0, "Jogos Corporais e Espaço", "30h", 2);

        Turma tEldPrep1 = garantirTurma(eldPrep, "ELD-DANCA-PREP1", "Thais Ribeiro",
                "Segundas e Quartas-feiras, 15h às 16h30 - Centro de Dança de Santo André", 20, 7, 9);
        garantirMateria(tEldPrep1, "Iniciação ao Movimento", "40h", 1);
        garantirMateria(tEldPrep1, "Coordenação Motora e Ritmos", "40h", 2);

        Turma tEldPrep2 = garantirTurma(eldPrep, "ELD-DANCA-PREP2", "Thais Ribeiro",
                "Segundas e Quartas-feiras, 16h30 às 18h - Centro de Dança de Santo André", 20, 10, 12);
        garantirMateria(tEldPrep2, "Fundamentos da Dança Contemporânea", "40h", 1);
        garantirMateria(tEldPrep2, "Criação Coletiva", "40h", 2);

        Turma tEldDiss1 = garantirTurma(eldDissidentes, "ELD-POET-CONTEMP", "Ana Maria Carvalho",
                "Sábados, 10h às 13h - Centro de Dança de Santo André", 25, 17, 99);
        garantirMateria(tEldDiss1, "Danças Contemporâneas Dissidentes", "60h", 1);
        garantirMateria(tEldDiss1, "Corpo, Memória e Território", "60h", 2);

        Turma tEldDiss2 = garantirTurma(eldDissidentes, "ELD-POET-AFRO", "Silvana de Jesus",
                "Sábados, 14h às 17h - Centro de Dança de Santo André", 25, 17, 99);
        garantirMateria(tEldDiss2, "Matrizes Afro-Brasileiras", "60h", 1);
        garantirMateria(tEldDiss2, "Dança Ancestral e Rítmica", "60h", 2);

        // ==========================================
        // 2. ELCV - ESCOLA LIVRE DE CINEMA E VÍDEO
        // ==========================================
        Curso elcvTake = obterOuCriarCurso(elcv, "Programa Primeiro Take",
                "Iniciação audiovisual infanto-juvenil.", TipoCurso.OFICINA, ModalidadeCurso.OFICINA, 6, 80);
        Curso elcvModulos = obterOuCriarCurso(elcv, "Oficinas Modulares de Cinema",
                "Módulos semestrais livres de capacitação audiovisual.", TipoCurso.OFICINA, ModalidadeCurso.OFICINA, 4, 60);

        Turma tElcv1 = garantirTurma(elcvTake, "ELCV-TAKE-INF", "Equipe ELCV",
                "Quartas-feiras, 14h às 16h - Estúdio ELCV", 20, 8, 12);
        garantirMateria(tElcv1, "Stop Motion e Animação", "30h", 1);
        garantirMateria(tElcv1, "Brincando de Fazer Cinema", "30h", 2);

        Turma tElcv2 = garantirTurma(elcvTake, "ELCV-TAKE-JOV", "Equipe ELCV",
                "Quartas-feiras, 16h30 às 18h30 - Estúdio ELCV", 25, 13, 17);
        garantirMateria(tElcv2, "Linguagem Audiovisual e Câmera", "35h", 1);
        garantirMateria(tElcv2, "Edição no Celular e Redes", "35h", 2);

        Turma tElcv3 = garantirTurma(elcvModulos, "ELCV-AUDIO-INIC", "Equipe ELCV",
                "Sábados, 09h às 13h - Estúdio ELCV", 30, 18, 99);
        garantirMateria(tElcv3, "Introdução à Câmera e Iluminação", "30h", 1);
        garantirMateria(tElcv3, "Captação de Áudio Direto", "20h", 2);
        garantirMateria(tElcv3, "Montagem e Edição Digital", "30h", 3);

        Turma tElcv4 = garantirTurma(elcvModulos, "ELCV-CINEMA-BR", "Equipe ELCV",
                "Segundas-feiras, 19h às 22h - Sala de Projeção ELCV", 30, 18, 99);
        garantirMateria(tElcv4, "História e Estética do Cinema Nacional", "30h", 1);
        garantirMateria(tElcv4, "Análise Crítica e Debate Fílmico", "30h", 2);

        Turma tElcv5 = garantirTurma(elcvModulos, "ELCV-INTERP", "Equipe ELCV",
                "Terças e Quintas-feiras, 19h às 22h - Estúdio ELCV", 25, 18, 99);
        garantirMateria(tElcv5, "O Ator Diante da Câmera", "40h", 1);
        garantirMateria(tElcv5, "Jogo Cênico e Planos Cinematográficos", "40h", 2);

        Turma tElcv6 = garantirTurma(elcvModulos, "ELCV-ROTEIRO", "Equipe ELCV",
                "Terças-feiras, 19h às 22h - Laboratório ELCV", 25, 18, 99);
        garantirMateria(tElcv6, "Estrutura Dramática e Argumento", "30h", 1);
        garantirMateria(tElcv6, "Diálogos e Formatação de Roteiro", "30h", 2);

        Turma tElcv7 = garantirTurma(elcvModulos, "ELCV-VER-FILME", "Equipe ELCV",
                "Quintas-feiras, 19h às 22h - Cineclube ELCV", 35, 18, 99);
        garantirMateria(tElcv7, "Decupagem e Linguagem Fílmica", "25h", 1);
        garantirMateria(tElcv7, "Gêneros e Movimentos Cinematográficos", "25h", 2);

        // ==========================================
        // 3. EMIA - ESCOLA MUNICIPAL DE INICIAÇÃO ARTÍSTICA
        // ==========================================
        Curso emiaAnual = obterOuCriarCurso(emia, "Cursos Anuais Integrados EMIA",
                "Iniciação artística com vivências em artes visuais, música, dança e teatro.", TipoCurso.REGULAR, ModalidadeCurso.NUCLEO, 12, 200);

        Turma tEmia0 = garantirTurma(emiaAnual, "EMIA-MIA0-2026", "Educadores EMIA",
                "Terças e Quintas, 14h às 16h - Ateliê Integrado EMIA", 20, 5, 6);
        garantirMateria(tEmia0, "Música e Sonoridades", "30h", 1);
        garantirMateria(tEmia0, "Artes Visuais e Texturas", "30h", 2);
        garantirMateria(tEmia0, "Teatro e Faz de Conta", "30h", 3);
        garantirMateria(tEmia0, "Dança e Brincadeiras", "30h", 4);

        Turma tEmia1 = garantirTurma(emiaAnual, "EMIA-MIA1-2026", "Educadores EMIA",
                "Segundas e Quartas, 14h às 16h30 - Ateliê Integrado EMIA", 20, 7, 9);
        garantirMateria(tEmia1, "Percepção Sonora e Canto", "35h", 1);
        garantirMateria(tEmia1, "Pintura e Modelagem", "35h", 2);
        garantirMateria(tEmia1, "Jogos Dramáticos", "35h", 3);
        garantirMateria(tEmia1, "Expressão Corporal", "35h", 4);

        Turma tEmia2 = garantirTurma(emiaAnual, "EMIA-MIA2-2026", "Educadores EMIA",
                "Terças e Quintas, 09h às 11h30 - Ateliê Integrado EMIA", 25, 10, 12);
        garantirMateria(tEmia2, "Prática Musical Coletiva", "40h", 1);
        garantirMateria(tEmia2, "Desenho e Gravura", "40h", 2);
        garantirMateria(tEmia2, "Criação de Cenas", "40h", 3);
        garantirMateria(tEmia2, "Dança Contemporânea", "40h", 4);

        Turma tEmia3 = garantirTurma(emiaAnual, "EMIA-MIA3-2026", "Educadores EMIA",
                "Sextas-feiras, 14h às 17h30 - Ateliê Integrado EMIA", 25, 13, 16);
        garantirMateria(tEmia3, "Projetos Interdisciplinares", "50h", 1);
        garantirMateria(tEmia3, "Laboratório Multilinguagens", "50h", 2);
        garantirMateria(tEmia3, "Poéticas Urbanas", "40h", 3);

        Turma tEmiaAdultos = garantirTurma(emiaAnual, "EMIA-AQUARELA-2026", "Educadores EMIA",
                "Sábados, 09h às 12h - Ateliê de Artes Visuais EMIA", 25, 17, 99);
        garantirMateria(tEmiaAdultos, "Pigmentos e Transparências", "30h", 1);
        garantirMateria(tEmiaAdultos, "Teoria da Cor e Mistura", "30h", 2);
        garantirMateria(tEmiaAdultos, "Composição em Aquarela", "40h", 3);

        // ==========================================
        // 4. ELT - ESCOLA LIVRE DE TEATRO
        // ==========================================
        Curso eltFormacao = obterOuCriarCurso(elt, "Núcleo de Formação de Atores",
                "Curso modular e extensivo de 4 anos com processo colaborativo.", TipoCurso.REGULAR, ModalidadeCurso.FORMACAO, 48, 3200);
        Curso eltPesquisa = obterOuCriarCurso(elt, "Núcleos de Pesquisa Teatral",
                "Núcleos anuais livres de aprofundamento e prática de 20 vagas.", TipoCurso.OFICINA, ModalidadeCurso.NUCLEO, 12, 180);

        Turma tEltForm = garantirTurma(eltFormacao, "ELT-FORM-2026", "Coordenação Pedagógica ELT",
                "Segunda a Sexta, 19h às 22h30 - Teatro Conchita de Moraes", 35, 17, 99);
        garantirMateria(tEltForm, "Trabalho do Ator sobre Si Mesmo", "80h", 1);
        garantirMateria(tEltForm, "Voz e Dicção Cênica", "80h", 2);
        garantirMateria(tEltForm, "Dramaturgia e Texto Teatral", "80h", 3);
        garantirMateria(tEltForm, "Montagem de Espetáculo", "120h", 4);

        Turma tElt1 = garantirTurma(eltPesquisa, "ELT-NUC-RUA", "Coordenação ELT", "Segundas e Quartas, 19h às 22h", 20, 17, 99);
        garantirMateria(tElt1, "A Cidade como Palco", "60h", 1);
        garantirMateria(tElt1, "Intervenção Urbana e Performance", "60h", 2);

        Turma tElt2 = garantirTurma(eltPesquisa, "ELT-NUC-INIC", "Coordenação ELT", "Terças e Quintas, 19h às 22h", 20, 16, 99);
        garantirMateria(tElt2, "Jogos Teatrais e Improvisação", "50h", 1);
        garantirMateria(tElt2, "Criação de Personagens", "50h", 2);

        Turma tElt3 = garantirTurma(eltPesquisa, "ELT-NUC-DIREC", "Coordenação ELT", "Quartas e Sextas, 19h às 22h", 20, 18, 99);
        garantirMateria(tElt3, "Encenação Teatral Contemporânea", "60h", 1);
        garantirMateria(tElt3, "Direção de Atores", "60h", 2);

        Turma tElt4 = garantirTurma(eltPesquisa, "ELT-NUC-PEDAG", "Coordenação ELT", "Sábados, 09h às 13h", 20, 18, 99);
        garantirMateria(tElt4, "Teatro-Educação e Metodologias", "60h", 1);
        garantirMateria(tElt4, "Mediação Cultural", "40h", 2);

        Turma tElt5 = garantirTurma(eltPesquisa, "ELT-NUC-DRAM", "Coordenação ELT", "Segundas-feiras, 19h às 22h", 20, 16, 99);
        garantirMateria(tElt5, "Escrita Dramática Contemporânea", "50h", 1);
        garantirMateria(tElt5, "Laboratório de Textos", "50h", 2);

        Turma tElt6 = garantirTurma(eltPesquisa, "ELT-NUC-MASC", "Coordenação ELT", "Terças e Quintas, 14h às 17h", 20, 17, 99);
        garantirMateria(tElt6, "Máscaras Neutras e Expressivas", "50h", 1);
        garantirMateria(tElt6, "Commedia dell'Arte e Criação", "50h", 2);

        Turma tElt7 = garantirTurma(eltPesquisa, "ELT-NUC-PODER", "Coordenação ELT", "Quartas-feiras, 19h às 22h", 20, 17, 99);
        garantirMateria(tElt7, "Teatro Político e Democracia", "50h", 1);
        garantirMateria(tElt7, "Debate Estético e Cidadania", "50h", 2);

        Turma tElt8 = garantirTurma(eltPesquisa, "ELT-NUC-CIRCO", "Coordenação ELT", "Sábados, 14h às 18h", 20, 16, 99);
        garantirMateria(tElt8, "Acrobacia Cênica e Paradas", "60h", 1);
        garantirMateria(tElt8, "Dramaturgia do Circo", "60h", 2);

        Turma tElt9 = garantirTurma(eltPesquisa, "ELT-NUC-INFANC", "Coordenação ELT", "Terças e Quintas, 09h às 12h", 20, 17, 99);
        garantirMateria(tElt9, "Teatro para Infâncias e Juventudes", "50h", 1);
        garantirMateria(tElt9, "Dramaturgias da Infância", "50h", 2);

        Turma tElt10 = garantirTurma(eltPesquisa, "ELT-NUC-PALHAC", "Coordenação ELT", "Sextas-feiras, 19h às 22h", 20, 16, 99);
        garantirMateria(tElt10, "O Menor Clave do Mundo: Nariz Vermelho", "50h", 1);
        garantirMateria(tElt10, "Gags, Entradas e Improvisação", "50h", 2);

        // Preenche com alunos matriculados para garantir turmas ativas e prontas para uso
        preencherTurmasComAlunos();
        semearCenariosRealistasDiversificados();
        log.info("Catálogo oficial sincronizado com sucesso!");
    }

    private Curso obterOuCriarCurso(Escola escola, String nome, String desc, TipoCurso tipo, ModalidadeCurso mod, int duracaoMeses, int cargaHoraria) {
        return cursoRepository.findByEscolaId(escola.getId()).stream()
                .filter(c -> c.getNome().equalsIgnoreCase(nome))
                .findFirst()
                .orElseGet(() -> cursoRepository.save(Curso.builder()
                        .escola(escola)
                        .nome(nome)
                        .descricao(desc)
                        .tipo(tipo)
                        .modalidade(mod)
                        .duracaoMeses(duracaoMeses)
                        .cargaHoraria(cargaHoraria)
                        .ativo(true)
                        .build()));
    }

    private Turma garantirTurma(Curso curso, String codigo, String educador, String diasHorariosLocal, int vagas, int idadeMin, int idadeMax) {
        Turma turma = turmaRepository.findByCodigo(codigo).orElseGet(() -> {
            LocalDate hoje = LocalDate.now();
            return Turma.builder()
                    .curso(curso)
                    .codigo(codigo)
                    .dataAberturaMatricula(hoje.minusDays(20))
                    .dataFechamentoMatricula(hoje.plusDays(40))
                    .dataInicioAulas(hoje.minusDays(5))
                    .dataFimAulas(hoje.plusDays(320))
                    .vagasTotais(vagas)
                    .vagasOcupadas(0)
                    .status(StatusTurma.ABERTA)
                    .build();
        });
        turma.setEducadorResponsavel(educador);
        turma.setDiasHorariosLocal(diasHorariosLocal);
        turma.setIdadeMinima(idadeMin);
        turma.setIdadeMaxima(idadeMax);
        return turmaRepository.save(turma);
    }

    private void garantirMateria(Turma turma, String nomeMateria, String duracao, int ordem) {
        boolean existe = turmaMateriaRepository.findByTurmaIdOrderByOrdemAscIdAsc(turma.getId())
                .stream().anyMatch(m -> m.getNome().equalsIgnoreCase(nomeMateria));
        if (!existe) {
            turmaMateriaRepository.save(TurmaMateria.builder()
                    .turma(turma)
                    .nome(nomeMateria)
                    .duracaoEstimada(duracao)
                    .ordem(ordem)
                    .build());
        }
    }

    private void preencherTurmasComAlunos() {
        List<Turma> turmas = turmaRepository.findAll();
        String[] bairrosSA = {"Centro", "Vila Assunção", "Campestre", "Jardim", "Vila Pires", "Utinga", "Parque das Nações", "Santa Teresinha", "Vila Luzita"};

        for (Turma t : turmas) {
            long totalMatriculas = matriculaRepository.findByTurmaId(t.getId()).stream()
                    .filter(m -> m.getStatus() == StatusMatricula.CONFIRMADA)
                    .count();

            if (totalMatriculas < 15) {
                int aCadastrar = (int) (15 - totalMatriculas);
                for (int i = 0; i < aCadastrar; i++) {
                    int seq = (int) (alunoRepository.count() + 1);
                    String cpf = String.format("%011d", 10000000000L + seq);
                    String nome = "Aluno " + seq + " " + t.getCodigo().replace("-", " ");
                    String email = "aluno" + seq + "@santoandre.edu.br";
                    String bairro = bairrosSA[seq % bairrosSA.length];

                    int idadeBase = (t.getIdadeMinima() != null && t.getIdadeMinima() > 0) ? t.getIdadeMinima() : 20;
                    LocalDate nasc = LocalDate.now().minusYears(idadeBase).minusMonths(seq % 12);

                    Responsavel resp = null;
                    if (idadeBase < 18) {
                        resp = responsavelRepository.save(Responsavel.builder()
                                .nome("Responsável de " + nome)
                                .cpf(String.format("%011d", 90000000000L + seq))
                                .telefone("(11) 98" + String.format("%07d", seq))
                                .email("resp" + seq + "@email.com")
                                .grauParentesco("Mãe")
                                .build());
                    }

                    Aluno aluno = alunoRepository.save(Aluno.builder()
                            .nome(nome)
                            .cpf(cpf)
                            .email(email)
                            .telefone("(11) 97" + String.format("%07d", seq))
                            .dataNascimento(nasc)
                            .endereco("Rua das Artes, " + (seq * 10))
                            .bairro(bairro)
                            .cidade("Santo André")
                            .cep("090" + String.format("%02d", 10 + (seq % 80)) + "-000")
                            .genero(seq % 2 == 0 ? "Feminino" : "Masculino")
                            .neurodiverso(seq % 7 == 0)
                            .neurodiversoDetalhe(seq % 7 == 0 ? "TDAH e Altas Habilidades" : null)
                            .pcd(seq % 9 == 0)
                            .pcdDetalhe(seq % 9 == 0 ? "Baixa Visão" : null)
                            .contatoEmergencia("Familiar: (11) 99" + String.format("%07d", seq))
                            .responsavel(resp)
                            .consentimentoLgpd(true)
                            .consentimentoLgpdDadosSensiveis(true)
                            .dataConsentimentoLgpd(java.time.LocalDateTime.now())
                            .consentimentoUsoImagem(seq % 2 == 0)
                            .termoPapelEntregue(true)
                            .build());

                    matriculaRepository.save(Matricula.builder()
                            .aluno(aluno)
                            .turma(t)
                            .canalOrigem(CanalOrigem.PRESENCIAL)
                            .status(StatusMatricula.CONFIRMADA)
                            .observacoes("Matrícula confirmada no início do período letivo.")
                            .build());
                }

                t.setVagasOcupadas(Math.toIntExact(matriculaRepository.findByTurmaId(t.getId()).stream()
                        .filter(m -> m.getStatus() == StatusMatricula.CONFIRMADA)
                        .count()));
                turmaRepository.save(t);
            }
        }
    }

    private void semearCenariosRealistasDiversificados() {
        // Garante que nenhuma matrícula com fila de espera ou inscrição permaneça no sistema
        List<Matricula> paraRemoverOuAjustar = matriculaRepository.findAll().stream()
                .filter(m -> m.getStatus() == StatusMatricula.FILA_ESPERA ||
                             m.getStatus() == StatusMatricula.INSCRITO ||
                             m.getStatus() == StatusMatricula.EM_SELECAO ||
                             m.getStatus() == StatusMatricula.PENDENTE)
                .toList();

        for (Matricula m : paraRemoverOuAjustar) {
            registroPresencaRepository.findByMatriculaIdOrderByDataAulaAsc(m.getId())
                    .forEach(registroPresencaRepository::delete);
            matriculaRepository.delete(m);
            if (m.getAluno() != null && m.getAluno().getCpf() != null && m.getAluno().getCpf().startsWith("701000000")) {
                alunoRepository.delete(m.getAluno());
            }
        }

        if (alunoRepository.existsByCpf("70100000001")) {
            log.info("Cenários diversificados de estudantes já semeados anteriormente.");
            return;
        }

        log.info("Semeando estudantes em cenários diversificados (muita falta, evasão, cancelamentos, menores)...");
        LocalDate hoje = LocalDate.now();

        // 1. Aluno com 2 Faltas Consecutivas (Alerta Amarelo / Risco Crítico / Busca Ativa)
        // Thiago Rocha Albuquerque na turma ELT-NUC-INIC
        turmaRepository.findByCodigo("ELT-NUC-INIC").ifPresent(turma -> {
            Aluno a = alunoRepository.save(Aluno.builder()
                    .nome("Thiago Rocha Albuquerque")
                    .cpf("70100000001")
                    .email("thiago.rocha@email.com")
                    .telefone("(11) 98111-2233")
                    .dataNascimento(LocalDate.of(1998, 4, 15))
                    .endereco("Rua das Figueiras, 450")
                    .bairro("Jardim")
                    .cidade("Santo André")
                    .cep("09080-300")
                    .genero("Masculino")
                    .consentimentoLgpd(true)
                    .consentimentoLgpdDadosSensiveis(true)
                    .termoPapelEntregue(true)
                    .build());

            Matricula m = matriculaRepository.save(Matricula.builder()
                    .aluno(a)
                    .turma(turma)
                    .canalOrigem(CanalOrigem.PRESENCIAL)
                    .status(StatusMatricula.CONFIRMADA)
                    .observacoes("Aluno com alerta de 2 faltas consecutivas - Busca ativa acionada.")
                    .build());

            salvarPresenca(m, hoje.minusDays(12), StatusPresenca.PRESENTE, "Jogos de Improvisação e Aquecimento Vocal");
            salvarPresenca(m, hoje.minusDays(9), StatusPresenca.PRESENTE, "Construção de Máscaras e Personagens");
            salvarPresenca(m, hoje.minusDays(6), StatusPresenca.FALTA, "Jogo Cênico em Espaço Aberto");
            salvarPresenca(m, hoje.minusDays(2), StatusPresenca.FALTA, "Leitura e Ensaio de Cenas Curtas");
        });

        // 2. Aluna com 2 Faltas Consecutivas na ELD (Dança Contemporânea)
        // Beatriz Lima Silveira na turma ELD-POET-CONTEMP
        turmaRepository.findByCodigo("ELD-POET-CONTEMP").ifPresent(turma -> {
            Aluno a = alunoRepository.save(Aluno.builder()
                    .nome("Beatriz Lima Silveira")
                    .cpf("70100000002")
                    .email("beatriz.silveira@email.com")
                    .telefone("(11) 97222-3344")
                    .dataNascimento(LocalDate.of(2002, 9, 20))
                    .endereco("Av. Portugal, 890")
                    .bairro("Centro")
                    .cidade("Santo André")
                    .cep("09040-000")
                    .genero("Feminino")
                    .neurodiverso(true)
                    .neurodiversoDetalhe("TDAH")
                    .consentimentoLgpd(true)
                    .consentimentoLgpdDadosSensiveis(true)
                    .termoPapelEntregue(true)
                    .build());

            Matricula m = matriculaRepository.save(Matricula.builder()
                    .aluno(a)
                    .turma(turma)
                    .canalOrigem(CanalOrigem.CULTURA_AZ)
                    .status(StatusMatricula.CONFIRMADA)
                    .observacoes("Aluna notificada por e-mail sobre risco de perda da vaga.")
                    .build());

            salvarPresenca(m, hoje.minusDays(14), StatusPresenca.PRESENTE, "Aquecimento Corporal e Alongamento");
            salvarPresenca(m, hoje.minusDays(10), StatusPresenca.JUSTIFICADA, "Atestado médico de fisioterapia", "Alinhamento e Postura");
            salvarPresenca(m, hoje.minusDays(6), StatusPresenca.FALTA, "Pesquisa de Movimento no Chão");
            salvarPresenca(m, hoje.minusDays(2), StatusPresenca.FALTA, "Laboratório Coreográfico Coletivo");
        });

        // 3. Aluno com 3 Faltas Consecutivas (Alerta Vermelho / Limite Excedido)
        // Rodrigo Antunes de Souza na turma ELCV-AUDIO-INIC
        turmaRepository.findByCodigo("ELCV-AUDIO-INIC").ifPresent(turma -> {
            Aluno a = alunoRepository.save(Aluno.builder()
                    .nome("Rodrigo Antunes de Souza")
                    .cpf("70100000003")
                    .email("rodrigo.antunes@email.com")
                    .telefone("(11) 99333-4455")
                    .dataNascimento(LocalDate.of(1995, 12, 5))
                    .endereco("Rua Coronel Fernando Prestes, 320")
                    .bairro("Vila Assunção")
                    .cidade("Santo André")
                    .cep("09020-110")
                    .genero("Masculino")
                    .consentimentoLgpd(true)
                    .consentimentoLgpdDadosSensiveis(true)
                    .termoPapelEntregue(true)
                    .build());

            Matricula m = matriculaRepository.save(Matricula.builder()
                    .aluno(a)
                    .turma(turma)
                    .canalOrigem(CanalOrigem.PRESENCIAL)
                    .status(StatusMatricula.CONFIRMADA)
                    .observacoes("Limite de 3 faltas atingido. Processo de desligamento regimental aguardando deliberação.")
                    .build());

            salvarPresenca(m, hoje.minusDays(16), StatusPresenca.PRESENTE, "Introdução à Câmera Blackmagic");
            salvarPresenca(m, hoje.minusDays(12), StatusPresenca.FALTA, "Configuração de ISO, Shutter e Diafragma");
            salvarPresenca(m, hoje.minusDays(8), StatusPresenca.FALTA, "Captação de Áudio com Microfone Direcional Boom");
            salvarPresenca(m, hoje.minusDays(4), StatusPresenca.FALTA, "Gravação Prática de Cena Externa");
        });

        // 4. Aluna com 3 Faltas Consecutivas na Formação Teatral da ELT
        // Isabela Camargo Fontana na turma ELT-FORM-2026
        turmaRepository.findByCodigo("ELT-FORM-2026").ifPresent(turma -> {
            Aluno a = alunoRepository.save(Aluno.builder()
                    .nome("Isabela Camargo Fontana")
                    .cpf("70100000004")
                    .email("isabela.fontana@email.com")
                    .telefone("(11) 98444-5566")
                    .dataNascimento(LocalDate.of(2000, 3, 28))
                    .endereco("Rua Senador Flaquer, 180")
                    .bairro("Vila Bastos")
                    .cidade("Santo André")
                    .cep("09041-000")
                    .genero("Feminino")
                    .consentimentoLgpd(true)
                    .consentimentoLgpdDadosSensiveis(true)
                    .termoPapelEntregue(true)
                    .build());

            Matricula m = matriculaRepository.save(Matricula.builder()
                    .aluno(a)
                    .turma(turma)
                    .canalOrigem(CanalOrigem.CULTURA_AZ)
                    .status(StatusMatricula.CONFIRMADA)
                    .observacoes("Acumulou 3 faltas consecutivas recentes. Aluno em processo de notificação e desligamento por evasão escolar.")
                    .build());

            salvarPresenca(m, hoje.minusDays(18), StatusPresenca.PRESENTE, "O Ator sobre Si Mesmo - Memória Sensorial");
            salvarPresenca(m, hoje.minusDays(15), StatusPresenca.PRESENTE, "Respiração Diafragmática e Ressonadores");
            salvarPresenca(m, hoje.minusDays(12), StatusPresenca.PRESENTE, "Partitura de Ações Físicas");
            salvarPresenca(m, hoje.minusDays(9), StatusPresenca.FALTA, "Trabalho de Coro e Contato");
            salvarPresenca(m, hoje.minusDays(6), StatusPresenca.FALTA, "Criação Coletiva de Cenas");
            salvarPresenca(m, hoje.minusDays(3), StatusPresenca.FALTA, "Laboratório de Iluminação e Espaço Cênico");
        });

        // 5. Aluno Efetivamente Desligado por Evasão / Infrequência (DESISTENTE_FALTAS)
        // Cauã Moreira Rezende na turma ELT-NUC-RUA
        turmaRepository.findByCodigo("ELT-NUC-RUA").ifPresent(turma -> {
            Aluno a = alunoRepository.save(Aluno.builder()
                    .nome("Cauã Moreira Rezende")
                    .cpf("70100000005")
                    .email("caua.rezende@email.com")
                    .telefone("(11) 97555-6677")
                    .dataNascimento(LocalDate.of(1997, 8, 14))
                    .endereco("Rua Catequese, 510")
                    .bairro("Bairro Jardim")
                    .cidade("Santo André")
                    .cep("09090-400")
                    .genero("Masculino")
                    .consentimentoLgpd(true)
                    .consentimentoLgpdDadosSensiveis(true)
                    .termoPapelEntregue(true)
                    .build());

            Matricula m = matriculaRepository.save(Matricula.builder()
                    .aluno(a)
                    .turma(turma)
                    .canalOrigem(CanalOrigem.PRESENCIAL)
                    .status(StatusMatricula.DESISTENTE_FALTAS)
                    .observacoes("Desligamento administrativo confirmado pela Secretaria por evasão (Portaria Regimental nº 04/2026).")
                    .build());

            salvarPresenca(m, hoje.minusDays(25), StatusPresenca.PRESENTE, "Mapeamento Urbano e Territorial");
            salvarPresenca(m, hoje.minusDays(21), StatusPresenca.FALTA, "Intervenção Cênica na Praça do Carmo");
            salvarPresenca(m, hoje.minusDays(18), StatusPresenca.FALTA, "Corpo Político e Performance Pública");
            salvarPresenca(m, hoje.minusDays(14), StatusPresenca.FALTA, "Debate com a Comunidade Local");
        });

        // 6. Aluna Desligada por Evasão na Dança (DESISTENTE_FALTAS)
        // Yasmin Ribeiro Fagundes na turma ELD-NUC1-BRASILEIRO
        turmaRepository.findByCodigo("ELD-NUC1-BRASILEIRO").ifPresent(turma -> {
            Aluno a = alunoRepository.save(Aluno.builder()
                    .nome("Yasmin Ribeiro Fagundes")
                    .cpf("70100000006")
                    .email("yasmin.fagundes@email.com")
                    .telefone("(11) 98666-7788")
                    .dataNascimento(LocalDate.of(2003, 11, 2))
                    .endereco("Rua Oratório, 1200")
                    .bairro("Parque das Nações")
                    .cidade("Santo André")
                    .cep("09210-000")
                    .genero("Feminino")
                    .consentimentoLgpd(true)
                    .consentimentoLgpdDadosSensiveis(true)
                    .termoPapelEntregue(true)
                    .build());

            Matricula m = matriculaRepository.save(Matricula.builder()
                    .aluno(a)
                    .turma(turma)
                    .canalOrigem(CanalOrigem.CULTURA_AZ)
                    .status(StatusMatricula.DESISTENTE_FALTAS)
                    .observacoes("Evasão escolar homologada após contato telefônico sem retorno.")
                    .build());

            salvarPresenca(m, hoje.minusDays(22), StatusPresenca.FALTA, "Dança Urbana - Hip Hop Freestyle");
            salvarPresenca(m, hoje.minusDays(18), StatusPresenca.FALTA, "House Dance e Footwork");
            salvarPresenca(m, hoje.minusDays(14), StatusPresenca.FALTA, "Composição Coreográfica em Grupo");
        });

        // 7. Cancelamento Voluntário no Cinema (CANCELADA)
        // Felipe Vasconcelos Prado na turma ELCV-CINEMA-BR
        turmaRepository.findByCodigo("ELCV-CINEMA-BR").ifPresent(turma -> {
            Aluno a = alunoRepository.save(Aluno.builder()
                    .nome("Felipe Vasconcelos Prado")
                    .cpf("70100000007")
                    .email("felipe.prado@email.com")
                    .telefone("(11) 99777-8899")
                    .dataNascimento(LocalDate.of(1993, 1, 19))
                    .endereco("Rua Marina, 640")
                    .bairro("Campestre")
                    .cidade("Santo André")
                    .cep("09070-510")
                    .genero("Masculino")
                    .consentimentoLgpd(true)
                    .consentimentoLgpdDadosSensiveis(true)
                    .termoPapelEntregue(true)
                    .build());

            matriculaRepository.save(Matricula.builder()
                    .aluno(a)
                    .turma(turma)
                    .canalOrigem(CanalOrigem.PRESENCIAL)
                    .status(StatusMatricula.CANCELADA)
                    .observacoes("Cancelamento formal solicitado pelo próprio estudante devido a incompatibilidade com novo emprego.")
                    .build());
        });

        // 8. Cancelamento Voluntário na EMIA (CANCELADA)
        // Larissa Prado Nogueira na turma EMIA-AQUARELA-2026
        turmaRepository.findByCodigo("EMIA-AQUARELA-2026").ifPresent(turma -> {
            Aluno a = alunoRepository.save(Aluno.builder()
                    .nome("Larissa Prado Nogueira")
                    .cpf("70100000008")
                    .email("larissa.nogueira@email.com")
                    .telefone("(11) 98888-9900")
                    .dataNascimento(LocalDate.of(1989, 7, 7))
                    .endereco("Av. Dom Pedro II, 1420")
                    .bairro("Jardim")
                    .cidade("Santo André")
                    .cep("09080-001")
                    .genero("Feminino")
                    .consentimentoLgpd(true)
                    .consentimentoLgpdDadosSensiveis(true)
                    .termoPapelEntregue(true)
                    .build());

            matriculaRepository.save(Matricula.builder()
                    .aluno(a)
                    .turma(turma)
                    .canalOrigem(CanalOrigem.CULTURA_AZ)
                    .status(StatusMatricula.CANCELADA)
                    .observacoes("Trancamento voluntário comunicado por escrito.")
                    .build());
        });



        // 13. Menor de Idade com Mãe Responsável e 100% Presença (Declaração Pronta!)
        // Manuela Duarte Ferraz na turma EMIA-MIA1-2026
        turmaRepository.findByCodigo("EMIA-MIA1-2026").ifPresent(turma -> {
            Responsavel mae = responsavelRepository.save(Responsavel.builder()
                    .nome("Renata Duarte Ferraz")
                    .cpf("90100000013")
                    .telefone("(11) 98334-5566")
                    .email("renata.mae@email.com")
                    .grauParentesco("Mãe")
                    .build());

            Aluno a = alunoRepository.save(Aluno.builder()
                    .nome("Manuela Duarte Ferraz")
                    .cpf("70100000013")
                    .email("manuela.ferraz@email.com")
                    .telefone("(11) 98334-5566")
                    .dataNascimento(LocalDate.of(2017, 5, 20))
                    .endereco("Rua Vitória Régia, 340")
                    .bairro("Campestre")
                    .cidade("Santo André")
                    .cep("09070-120")
                    .genero("Feminino")
                    .responsavel(mae)
                    .contatoEmergencia("Mãe: Renata - (11) 98334-5566")
                    .consentimentoLgpd(true)
                    .consentimentoLgpdDadosSensiveis(true)
                    .termoPapelEntregue(true)
                    .build());

            Matricula m = matriculaRepository.save(Matricula.builder()
                    .aluno(a)
                    .turma(turma)
                    .canalOrigem(CanalOrigem.PRESENCIAL)
                    .status(StatusMatricula.CONFIRMADA)
                    .observacoes("Estudante assídua, frequência exemplar de 100%.")
                    .build());

            salvarPresenca(m, hoje.minusDays(15), StatusPresenca.PRESENTE, "Percepção Sonora e Cantigas Tradicionais");
            salvarPresenca(m, hoje.minusDays(11), StatusPresenca.PRESENTE, "Modelagem com Argila e Texturas");
            salvarPresenca(m, hoje.minusDays(8), StatusPresenca.PRESENTE, "Jogos Dramáticos e Expressão Cênica");
            salvarPresenca(m, hoje.minusDays(4), StatusPresenca.PRESENTE, "Dança Lúdica e Ritmos Brasileiros");
        });

        // 14. Aluno Concluinte / Formado com Êxito (CONCLUIDA)
        // Vinicius de Oliveira Moura na turma ELT-NUC-DRAM
        turmaRepository.findByCodigo("ELT-NUC-DRAM").ifPresent(turma -> {
            Aluno a = alunoRepository.save(Aluno.builder()
                    .nome("Vinicius de Oliveira Moura")
                    .cpf("70100000014")
                    .email("vinicius.moura@email.com")
                    .telefone("(11) 98445-6677")
                    .dataNascimento(LocalDate.of(1996, 10, 18))
                    .endereco("Rua Gertrudes de Lima, 310")
                    .bairro("Centro")
                    .cidade("Santo André")
                    .cep("09020-000")
                    .genero("Masculino")
                    .consentimentoLgpd(true)
                    .consentimentoLgpdDadosSensiveis(true)
                    .termoPapelEntregue(true)
                    .build());

            matriculaRepository.save(Matricula.builder()
                    .aluno(a)
                    .turma(turma)
                    .canalOrigem(CanalOrigem.PRESENCIAL)
                    .status(StatusMatricula.CONCLUIDA)
                    .observacoes("Concluinte do ciclo 2025/2026 com aprovação e leitura dramática pública.")
                    .build());
        });

        // 15. Aluna Concluinte no Cinema (CONCLUIDA)
        // Camila Duarte Peixoto na turma ELCV-ROTEIRO
        turmaRepository.findByCodigo("ELCV-ROTEIRO").ifPresent(turma -> {
            Aluno a = alunoRepository.save(Aluno.builder()
                    .nome("Camila Duarte Peixoto")
                    .cpf("70100000015")
                    .email("camila.peixoto@email.com")
                    .telefone("(11) 98556-7788")
                    .dataNascimento(LocalDate.of(1994, 12, 30))
                    .endereco("Rua Santo André, 450")
                    .bairro("Vila Assunção")
                    .cidade("Santo André")
                    .cep("09020-230")
                    .genero("Feminino")
                    .consentimentoLgpd(true)
                    .consentimentoLgpdDadosSensiveis(true)
                    .termoPapelEntregue(true)
                    .build());

            matriculaRepository.save(Matricula.builder()
                    .aluno(a)
                    .turma(turma)
                    .canalOrigem(CanalOrigem.CULTURA_AZ)
                    .status(StatusMatricula.CONCLUIDA)
                    .observacoes("Formada com apresentação de curta-metragem autoral.")
                    .build());
        });

        // Recalcular vagas ocupadas das turmas com matrículas confirmadas
        List<Turma> todasTurmas = turmaRepository.findAll();
        for (Turma t : todasTurmas) {
            long confirmadas = matriculaRepository.findByTurmaId(t.getId()).stream()
                    .filter(m -> m.getStatus() == StatusMatricula.CONFIRMADA)
                    .count();
            t.setVagasOcupadas((int) confirmadas);
            turmaRepository.save(t);
        }

        log.info("Cenários de estudantes diversificados semeados com absoluto sucesso!");
    }

    private void salvarPresenca(Matricula m, LocalDate data, StatusPresenca status, String justificativa, String conteudo) {
        registroPresencaRepository.save(RegistroPresenca.builder()
                .matricula(m)
                .dataAula(data)
                .status(status)
                .justificativa(justificativa)
                .conteudoMinistrado(conteudo)
                .responsavelRegistro("Secretaria Escolar")
                .build());
    }

    private void salvarPresenca(Matricula m, LocalDate data, StatusPresenca status, String conteudo) {
        salvarPresenca(m, data, status, null, conteudo);
    }
}

