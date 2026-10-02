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
    private final AlunoRepository alunoRepository;
    private final ResponsavelRepository responsavelRepository;
    private final MatriculaRepository matriculaRepository;
    private final RegistroPresencaRepository registroPresencaRepository;
    private final PasswordEncoder passwordEncoder;

    @org.springframework.beans.factory.annotation.Value("${app.initial.password:${INITIAL_USER_PASSWORD:}}")
    private String initialConfiguredPassword;

    private String resolveInitialPassword() {
        if (initialConfiguredPassword != null && !initialConfiguredPassword.trim().isEmpty()) {
            return initialConfiguredPassword.trim();
        }
        // Gera senha inicial dinâmica sem armazenar qualquer string estática no código-fonte
        return java.util.UUID.randomUUID().toString().replace("-", "").substring(0, 10);
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
                    .senha(passwordEncoder.encode("12346"))
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
                    .diasToleranciaSuplencia(15)
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
                    .diasToleranciaSuplencia(7)
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
                    .diasToleranciaSuplencia(10)
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
                    .diasToleranciaSuplencia(15)
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
                    .build());

            Aluno alunoAdulto = alunoRepository.save(Aluno.builder()
                    .nome("Mariana Ribeiro")
                    .cpf("12345678909")
                    .email("mariana.ribeiro@exemplo.com")
                    .telefone("(11) 97222-3344")
                    .dataNascimento(LocalDate.of(1998, 7, 14))
                    .build());

            Aluno alunoLucas = alunoRepository.save(Aluno.builder()
                    .nome("Lucas Mendes Santos")
                    .cpf("98765432100")
                    .email("lucas.mendes@exemplo.com")
                    .telefone("(11) 97111-4455")
                    .dataNascimento(LocalDate.of(2001, 5, 10))
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
    }
}
