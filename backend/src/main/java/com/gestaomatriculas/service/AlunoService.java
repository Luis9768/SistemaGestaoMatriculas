package com.gestaomatriculas.service;

import com.gestaomatriculas.dto.*;
import com.gestaomatriculas.exception.BusinessException;
import com.gestaomatriculas.exception.ResourceNotFoundException;
import com.gestaomatriculas.model.*;
import com.gestaomatriculas.model.enums.StatusMatricula;
import com.gestaomatriculas.model.enums.StatusPresenca;
import com.gestaomatriculas.repository.AlunoRepository;
import com.gestaomatriculas.repository.MatriculaRepository;
import com.gestaomatriculas.repository.RegistroPresencaRepository;
import com.gestaomatriculas.repository.ResponsavelRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.Period;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AlunoService {

    private final AlunoRepository alunoRepository;
    private final ResponsavelRepository responsavelRepository;
    private final MatriculaRepository matriculaRepository;
    private final RegistroPresencaRepository registroPresencaRepository;

    @Transactional(readOnly = true)
    public List<AlunoDTO> listarTodos() {
        return alunoRepository.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    /**
     * Consulta paginada com suporte a pesquisa global ou por escola, e filtros por termo ou campos individuais.
     */
    @Transactional(readOnly = true)
    public Page<AlunoDTO> listarPaginado(Long escolaId, String busca, String nome, String email, String cpf, Pageable pageable) {
        Page<Aluno> pagina;

        if (busca != null && !busca.trim().isEmpty()) {
            pagina = alunoRepository.buscarAlunosPaginado(escolaId, busca.trim(), pageable);
        } else if ((nome != null && !nome.trim().isEmpty()) ||
                   (email != null && !email.trim().isEmpty()) ||
                   (cpf != null && !cpf.trim().isEmpty())) {
            pagina = alunoRepository.buscarAlunosFiltro(
                    escolaId,
                    nome != null ? nome.trim() : null,
                    email != null ? email.trim() : null,
                    cpf != null ? limparCpf(cpf) : null,
                    pageable
            );
        } else {
            pagina = alunoRepository.buscarAlunosPaginado(escolaId, null, pageable);
        }

        return pagina.map(this::toDTO);
    }

    @Transactional(readOnly = true)
    public AlunoDTO buscarPorId(Long id) {
        Aluno aluno = alunoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Aluno não encontrado com id: " + id));
        return toDTO(aluno);
    }

    /**
     * Retorna o perfil completo do aluno: dados cadastrais, cursos ativos, histórico escolar
     * (indicando se formou ou não) e resumo de presenças/faltas do curso atual.
     */
    @Transactional(readOnly = true)
    public PerfilAlunoDTO obterPerfilAluno(Long alunoId) {
        Aluno aluno = alunoRepository.findById(alunoId)
                .orElseThrow(() -> new ResourceNotFoundException("Aluno não encontrado com id: " + alunoId));

        List<Matricula> matriculas = matriculaRepository.findByAlunoId(alunoId);

        List<MatriculaItemPerfilDTO> cursosAtuais = new ArrayList<>();
        List<MatriculaItemPerfilDTO> historicoCursos = new ArrayList<>();

        for (Matricula m : matriculas) {
            MatriculaItemPerfilDTO item = toMatriculaItemPerfilDTO(m);
            boolean isHistorico = m.getStatus() == StatusMatricula.CONCLUIDA ||
                                  m.getStatus() == StatusMatricula.CANCELADA ||
                                  m.getStatus() == StatusMatricula.DESISTENTE_FALTAS ||
                                  m.getStatus() == StatusMatricula.REPROVADA;

            if (isHistorico) {
                historicoCursos.add(item);
            } else {
                cursosAtuais.add(item);
            }
        }

        long totalConcluidos = historicoCursos.stream().filter(MatriculaItemPerfilDTO::isFormado).count();

        return PerfilAlunoDTO.builder()
                .aluno(toDTO(aluno))
                .cursosAtuais(cursosAtuais)
                .historicoCursos(historicoCursos)
                .totalCursosConcluidos(totalConcluidos)
                .totalCursosAtivos(cursosAtuais.size())
                .build();
    }

    private MatriculaItemPerfilDTO toMatriculaItemPerfilDTO(Matricula matricula) {
        List<RegistroPresenca> presencas = registroPresencaRepository.findByMatriculaIdOrderByDataAulaAsc(matricula.getId());

        long totalAulas = presencas.size();
        long totalPresencas = presencas.stream().filter(p -> p.getStatus() == StatusPresenca.PRESENTE).count();
        long totalFaltas = presencas.stream().filter(p -> p.getStatus() == StatusPresenca.FALTA).count();
        long totalJustificadas = presencas.stream().filter(p -> p.getStatus() == StatusPresenca.JUSTIFICADA).count();

        double porcentagem = totalAulas > 0
                ? Math.round(((totalPresencas + totalJustificadas) * 100.0 / totalAulas) * 10.0) / 10.0
                : 100.0;

        int faltasConsecutivas = 0;
        for (int i = presencas.size() - 1; i >= 0; i--) {
            if (presencas.get(i).getStatus() == StatusPresenca.FALTA) {
                faltasConsecutivas++;
            } else {
                break;
            }
        }

        ResumoFrequenciaDTO freqDTO = ResumoFrequenciaDTO.builder()
                .totalAulas(totalAulas)
                .totalPresencas(totalPresencas)
                .totalFaltas(totalFaltas)
                .totalJustificadas(totalJustificadas)
                .porcentagemFrequencia(porcentagem)
                .faltasConsecutivas(faltasConsecutivas)
                .riscoDesistencia(faltasConsecutivas >= 2)
                .atingiuLimiteFaltas(faltasConsecutivas >= 3)
                .build();

        List<RegistroPresencaDTO> presencasDTO = presencas.stream().map(p -> RegistroPresencaDTO.builder()
                .id(p.getId())
                .matriculaId(matricula.getId())
                .dataAula(p.getDataAula())
                .status(p.getStatus())
                .justificativa(p.getJustificativa())
                .conteudoMinistrado(p.getConteudoMinistrado())
                .build()).collect(Collectors.toList());

        Turma turma = matricula.getTurma();
        Curso curso = turma != null ? turma.getCurso() : null;
        Escola escola = curso != null ? curso.getEscola() : null;

        return MatriculaItemPerfilDTO.builder()
                .matriculaId(matricula.getId())
                .turmaId(turma != null ? turma.getId() : null)
                .turmaNome(turma != null && curso != null ? turma.getCodigo() + " - " + curso.getNome() : (turma != null ? turma.getCodigo() : ""))
                .turmaCodigo(turma != null ? turma.getCodigo() : "")
                .cursoNome(curso != null ? curso.getNome() : "")
                .modalidade(curso != null ? curso.getModalidade() : null)
                .escolaNome(escola != null ? escola.getNome() : "")
                .escolaSigla(escola != null ? escola.getSigla() : "")
                .escolaCorTema(escola != null ? escola.getCorTema() : "blue")
                .dataMatricula(matricula.getDataMatricula())
                .dataInicio(turma != null ? turma.getDataInicioAulas() : null)
                .dataTermino(turma != null ? turma.getDataFimAulas() : null)
                .horario("Aulas regulares")
                .diasSemana("Seg a Sex")
                .status(matricula.getStatus())
                .formado(matricula.getStatus() == StatusMatricula.CONCLUIDA)
                .desistenteFaltas(matricula.getStatus() == StatusMatricula.DESISTENTE_FALTAS)
                .frequencia(freqDTO)
                .presencas(presencasDTO)
                .build();
    }

    @Transactional
    public RegistroPresencaDTO registrarPresenca(Long matriculaId, RegistroPresencaDTO dto) {
        Matricula matricula = matriculaRepository.findById(matriculaId)
                .orElseThrow(() -> new ResourceNotFoundException("Matrícula não encontrada com id: " + matriculaId));

        RegistroPresenca presenca = RegistroPresenca.builder()
                .matricula(matricula)
                .dataAula(dto.getDataAula() != null ? dto.getDataAula() : LocalDate.now())
                .status(dto.getStatus() != null ? dto.getStatus() : StatusPresenca.PRESENTE)
                .justificativa(dto.getJustificativa())
                .conteudoMinistrado(dto.getConteudoMinistrado())
                .build();

        RegistroPresenca salva = registroPresencaRepository.save(presenca);

        // Conforme diretriz da coordenação das Escolas Livres, o acúmulo de 3 faltas consecutivas
        // gera alerta pedagógico no sistema para a secretaria entrar em contato prévio (WhatsApp/E-mail)
        // antes de qualquer desligamento manual da vaga, evitando cancelamentos indevidos.

        return RegistroPresencaDTO.builder()
                .id(salva.getId())
                .matriculaId(matricula.getId())
                .dataAula(salva.getDataAula())
                .status(salva.getStatus())
                .justificativa(salva.getJustificativa())
                .conteudoMinistrado(salva.getConteudoMinistrado())
                .build();
    }

    @Transactional
    public AlunoDTO criar(AlunoDTO dto) {
        String cpfLimpo = limparCpf(dto.getCpf());
        if (alunoRepository.existsByCpf(cpfLimpo)) {
            throw new BusinessException("Já existe um aluno cadastrado com o CPF: " + dto.getCpf());
        }

        Responsavel responsavel = null;
        if (isMenor(dto.getDataNascimento())) {
            if (dto.getResponsavel() == null || dto.getResponsavel().getNome() == null || dto.getResponsavel().getCpf() == null) {
                throw new BusinessException("Para alunos menores de 18 anos, os dados do responsável legal são obrigatórios.");
            }
            responsavel = obterOuCriarResponsavel(dto.getResponsavel());
        }

        Aluno aluno = Aluno.builder()
                .nome(dto.getNome())
                .cpf(cpfLimpo)
                .email(dto.getEmail())
                .telefone(dto.getTelefone())
                .dataNascimento(dto.getDataNascimento())
                .responsavel(responsavel)
                .consentimentoLgpd(true)
                .dataConsentimentoLgpd(java.time.LocalDateTime.now())
                .consentimentoUsoImagem(dto.getConsentimentoUsoImagem() != null ? dto.getConsentimentoUsoImagem() : false)
                .build();

        return toDTO(alunoRepository.save(aluno));
    }

    @Transactional
    public Aluno obterOuCriar(String nome, String cpf, String email, String telefone, LocalDate dataNascimento,
                              String respNome, String respCpf, String respTelefone, String respEmail, String respParentesco) {
        String cpfLimpo = limparCpf(cpf);

        return alunoRepository.findByCpf(cpfLimpo).orElseGet(() -> {
            Responsavel responsavel = null;
            if (isMenor(dataNascimento)) {
                if (respNome == null || respNome.isBlank() || respCpf == null || respCpf.isBlank()) {
                    throw new BusinessException("Para alunos menores de 18 anos, o nome e o CPF do responsável legal são obrigatórios.");
                }
                ResponsavelDTO respDTO = ResponsavelDTO.builder()
                        .nome(respNome.trim())
                        .cpf(respCpf.trim())
                        .telefone(respTelefone)
                        .email(respEmail)
                        .grauParentesco(respParentesco != null && !respParentesco.isBlank() ? respParentesco : "Responsável Legal")
                        .build();
                responsavel = obterOuCriarResponsavel(respDTO);
            }

            Aluno novo = Aluno.builder()
                    .nome(nome)
                    .cpf(cpfLimpo)
                    .email(email)
                    .telefone(telefone)
                    .dataNascimento(dataNascimento)
                    .responsavel(responsavel)
                    .consentimentoLgpd(true)
                    .dataConsentimentoLgpd(java.time.LocalDateTime.now())
                    .consentimentoUsoImagem(false)
                    .termoPapelEntregue(true)
                    .build();
            return alunoRepository.save(novo);
        });
    }

    @Transactional
    public Responsavel obterOuCriarResponsavel(ResponsavelDTO dto) {
        String cpfLimpo = limparCpf(dto.getCpf());
        if (!cpfLimpo.isEmpty()) {
            return responsavelRepository.findByCpf(cpfLimpo).orElseGet(() -> {
                Responsavel r = Responsavel.builder()
                        .nome(dto.getNome())
                        .cpf(cpfLimpo)
                        .telefone(dto.getTelefone())
                        .email(dto.getEmail())
                        .grauParentesco(dto.getGrauParentesco() != null ? dto.getGrauParentesco() : "Responsável Legal")
                        .build();
                return responsavelRepository.save(r);
            });
        }

        Responsavel r = Responsavel.builder()
                .nome(dto.getNome())
                .cpf(cpfLimpo)
                .telefone(dto.getTelefone())
                .email(dto.getEmail())
                .grauParentesco(dto.getGrauParentesco() != null ? dto.getGrauParentesco() : "Responsável Legal")
                .build();
        return responsavelRepository.save(r);
    }

    private boolean isMenor(LocalDate dataNascimento) {
        if (dataNascimento == null) return false;
        return Period.between(dataNascimento, LocalDate.now()).getYears() < 18;
    }

    public String limparCpf(String cpf) {
        return cpf != null ? cpf.replaceAll("\\D", "") : "";
    }

    public AlunoDTO toDTO(Aluno aluno) {
        ResponsavelDTO respDTO = null;
        if (aluno.getResponsavel() != null) {
            respDTO = ResponsavelDTO.builder()
                    .id(aluno.getResponsavel().getId())
                    .nome(aluno.getResponsavel().getNome())
                    .cpf(aluno.getResponsavel().getCpf())
                    .telefone(aluno.getResponsavel().getTelefone())
                    .email(aluno.getResponsavel().getEmail())
                    .grauParentesco(aluno.getResponsavel().getGrauParentesco())
                    .build();
        }

        return AlunoDTO.builder()
                .id(aluno.getId())
                .nome(aluno.getNome())
                .cpf(aluno.getCpf())
                .email(aluno.getEmail())
                .telefone(aluno.getTelefone())
                .dataNascimento(aluno.getDataNascimento())
                .menorDeIdade(aluno.isMenorDeIdade())
                .responsavel(respDTO)
                .consentimentoLgpd(aluno.getConsentimentoLgpd())
                .dataConsentimentoLgpd(aluno.getDataConsentimentoLgpd())
                .consentimentoUsoImagem(aluno.getConsentimentoUsoImagem())
                .termoPapelEntregue(aluno.getTermoPapelEntregue() != null ? aluno.getTermoPapelEntregue() : true)
                .build();
    }
}
