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

        // 1. Regra dos 75% de Presença Mínima para Formatura e Certificado
        boolean frequenciaMinima75 = freqDTO.getPorcentagemFrequencia() >= 75.0;
        boolean formado = matricula.getStatus() == StatusMatricula.CONCLUIDA && frequenciaMinima75;
        boolean aptoCertificado = formado;
        String motivoInaptidaoCertificado = null;

        if (!aptoCertificado) {
            if (matricula.getStatus() != StatusMatricula.CONCLUIDA) {
                motivoInaptidaoCertificado = "Certificado disponível apenas após a conclusão oficial do curso com no mínimo 75% de presença.";
            } else if (!frequenciaMinima75) {
                motivoInaptidaoCertificado = String.format(java.util.Locale.US,
                        "Frequência final de %.1f%% é insuficiente (mínimo obrigatório de 75.0%%).",
                        freqDTO.getPorcentagemFrequencia());
            }
        }

        // 2. Regra dos 2 Meses (60 Dias) de Curso Ativo para Declaração CPTM / SPTrans
        LocalDate dataRefInicio = (turma != null && turma.getDataInicioAulas() != null)
                ? turma.getDataInicioAulas()
                : (matricula.getDataMatricula() != null ? matricula.getDataMatricula().toLocalDate() : LocalDate.now());
        LocalDate dataLiberacaoTransporte = dataRefInicio.plusDays(60);
        LocalDate hoje = LocalDate.now();
        long diasRestantesTransporte = java.time.temporal.ChronoUnit.DAYS.between(hoje, dataLiberacaoTransporte);
        boolean cursoAtivo = matricula.getStatus() == StatusMatricula.CONFIRMADA || matricula.getStatus() == StatusMatricula.CONCLUIDA;
        boolean atingiuDoisMeses = !hoje.isBefore(dataLiberacaoTransporte);
        boolean aptoDeclaracaoTransporte = cursoAtivo && atingiuDoisMeses;
        String motivoInaptidaoTransporte = null;

        if (!cursoAtivo) {
            motivoInaptidaoTransporte = "Declaração de transporte indisponível para matrícula inativa, cancelada ou desligada.";
        } else if (!atingiuDoisMeses) {
            motivoInaptidaoTransporte = String.format(java.util.Locale.US,
                    "Disponível apenas após 2 meses (60 dias) de curso para comprovação de vínculo estabilizado (liberação em %s — faltam %d dias).",
                    dataLiberacaoTransporte.format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy")),
                    Math.max(1, diasRestantesTransporte));
        }

        Integer cargaHorariaTotal = curso != null ? curso.getCargaHoraria() : null;
        String codigoRegistroLivro = String.format("Livro %02d, Fls. %03d, Reg. %04d/%d",
                (matricula.getId() / 100) + 1,
                (matricula.getId() % 100) + 1,
                matricula.getId(),
                dataRefInicio.getYear());

        String horarioFormatado = (turma != null && turma.getDiasHorariosLocal() != null && !turma.getDiasHorariosLocal().isBlank())
                ? turma.getDiasHorariosLocal()
                : "Aulas regulares";

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
                .horario(horarioFormatado)
                .diasSemana("Presencial")
                .status(matricula.getStatus())
                .formado(formado)
                .desistenteFaltas(matricula.getStatus() == StatusMatricula.DESISTENTE_FALTAS)
                .frequencia(freqDTO)
                .presencas(presencasDTO)
                .aptoCertificado(aptoCertificado)
                .motivoInaptidaoCertificado(motivoInaptidaoCertificado)
                .aptoDeclaracaoTransporte(aptoDeclaracaoTransporte)
                .dataLiberacaoDeclaracaoTransporte(dataLiberacaoTransporte)
                .diasRestantesDeclaracaoTransporte(Math.max(0, diasRestantesTransporte))
                .motivoInaptidaoDeclaracaoTransporte(motivoInaptidaoTransporte)
                .cargaHorariaTotal(cargaHorariaTotal)
                .codigoRegistroLivro(codigoRegistroLivro)
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
                .endereco(dto.getEndereco())
                .bairro(dto.getBairro())
                .cidade(dto.getCidade())
                .cep(dto.getCep())
                .genero(dto.getGenero())
                .neurodiverso(dto.getNeurodiverso() != null ? dto.getNeurodiverso() : false)
                .neurodiversoDetalhe(dto.getNeurodiversoDetalhe())
                .pcd(dto.getPcd() != null ? dto.getPcd() : false)
                .pcdDetalhe(dto.getPcdDetalhe())
                .contatoEmergencia(dto.getContatoEmergencia())
                .consentimentoLgpd(dto.getConsentimentoLgpd() != null ? dto.getConsentimentoLgpd() : true)
                .consentimentoLgpdDadosSensiveis(dto.getConsentimentoLgpdDadosSensiveis() != null ? dto.getConsentimentoLgpdDadosSensiveis() : true)
                .dataConsentimentoLgpd(java.time.LocalDateTime.now())
                .consentimentoUsoImagem(dto.getConsentimentoUsoImagem() != null ? dto.getConsentimentoUsoImagem() : false)
                .termoPapelEntregue(dto.getTermoPapelEntregue() != null ? dto.getTermoPapelEntregue() : true)
                .build();

        return toDTO(alunoRepository.save(aluno));
    }

    @Transactional
    public AlunoDTO atualizar(Long id, AlunoDTO dto) {
        Aluno aluno = alunoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Aluno não encontrado com id: " + id));

        if (dto.getNome() != null && !dto.getNome().isBlank()) {
            aluno.setNome(dto.getNome().trim());
        }
        if (dto.getEmail() != null && !dto.getEmail().isBlank()) {
            aluno.setEmail(dto.getEmail().trim());
        }
        if (dto.getTelefone() != null) {
            aluno.setTelefone(dto.getTelefone().trim());
        }
        if (dto.getDataNascimento() != null) {
            aluno.setDataNascimento(dto.getDataNascimento());
        }
        if (dto.getEndereco() != null) aluno.setEndereco(dto.getEndereco().trim());
        if (dto.getBairro() != null) aluno.setBairro(dto.getBairro().trim());
        if (dto.getCidade() != null) aluno.setCidade(dto.getCidade().trim());
        if (dto.getCep() != null) aluno.setCep(dto.getCep().trim());
        if (dto.getGenero() != null) aluno.setGenero(dto.getGenero().trim());
        if (dto.getNeurodiverso() != null) aluno.setNeurodiverso(dto.getNeurodiverso());
        if (dto.getNeurodiversoDetalhe() != null) aluno.setNeurodiversoDetalhe(dto.getNeurodiversoDetalhe().trim());
        if (dto.getPcd() != null) aluno.setPcd(dto.getPcd());
        if (dto.getPcdDetalhe() != null) aluno.setPcdDetalhe(dto.getPcdDetalhe().trim());
        if (dto.getContatoEmergencia() != null) aluno.setContatoEmergencia(dto.getContatoEmergencia().trim());
        if (dto.getConsentimentoUsoImagem() != null) aluno.setConsentimentoUsoImagem(dto.getConsentimentoUsoImagem());
        if (dto.getTermoPapelEntregue() != null) aluno.setTermoPapelEntregue(dto.getTermoPapelEntregue());
        if (dto.getConsentimentoLgpdDadosSensiveis() != null) aluno.setConsentimentoLgpdDadosSensiveis(dto.getConsentimentoLgpdDadosSensiveis());

        if (dto.getResponsavel() != null && dto.getResponsavel().getNome() != null && !dto.getResponsavel().getNome().isBlank()) {
            Responsavel r = aluno.getResponsavel();
            if (r == null) {
                r = obterOuCriarResponsavel(dto.getResponsavel());
                aluno.setResponsavel(r);
            } else {
                r.setNome(dto.getResponsavel().getNome().trim());
                if (dto.getResponsavel().getCpf() != null) r.setCpf(limparCpf(dto.getResponsavel().getCpf()));
                if (dto.getResponsavel().getTelefone() != null) r.setTelefone(dto.getResponsavel().getTelefone().trim());
                if (dto.getResponsavel().getEmail() != null) r.setEmail(dto.getResponsavel().getEmail().trim());
                if (dto.getResponsavel().getGrauParentesco() != null) r.setGrauParentesco(dto.getResponsavel().getGrauParentesco().trim());
                responsavelRepository.save(r);
            }
        }

        return toDTO(alunoRepository.save(aluno));
    }

    @Transactional
    public AlunoDTO atualizarContato(Long id, AtualizarContatoDTO dto) {
        Aluno aluno = alunoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Aluno não encontrado com id: " + id));

        if (dto.getEmail() != null && !dto.getEmail().isBlank()) {
            aluno.setEmail(dto.getEmail().trim());
        }
        if (dto.getTelefone() != null) {
            aluno.setTelefone(dto.getTelefone().trim());
        }
        if (aluno.getResponsavel() != null) {
            Responsavel r = aluno.getResponsavel();
            if (dto.getResponsavelNome() != null && !dto.getResponsavelNome().isBlank()) {
                r.setNome(dto.getResponsavelNome().trim());
            }
            if (dto.getResponsavelTelefone() != null) {
                r.setTelefone(dto.getResponsavelTelefone().trim());
            }
            if (dto.getResponsavelEmail() != null) {
                r.setEmail(dto.getResponsavelEmail().trim());
            }
            responsavelRepository.save(r);
        }

        return toDTO(alunoRepository.save(aluno));
    }

    @Transactional
    public Aluno obterOuCriar(AlunoDTO dto) {
        String cpfLimpo = limparCpf(dto.getCpf());

        return alunoRepository.findByCpf(cpfLimpo).map(existente -> {
            if (dto.getEndereco() != null && !dto.getEndereco().isBlank()) existente.setEndereco(dto.getEndereco());
            if (dto.getBairro() != null && !dto.getBairro().isBlank()) existente.setBairro(dto.getBairro());
            if (dto.getCidade() != null && !dto.getCidade().isBlank()) existente.setCidade(dto.getCidade());
            if (dto.getCep() != null && !dto.getCep().isBlank()) existente.setCep(dto.getCep());
            if (dto.getGenero() != null && !dto.getGenero().isBlank()) existente.setGenero(dto.getGenero());
            if (dto.getNeurodiverso() != null) existente.setNeurodiverso(dto.getNeurodiverso());
            if (dto.getNeurodiversoDetalhe() != null) existente.setNeurodiversoDetalhe(dto.getNeurodiversoDetalhe());
            if (dto.getPcd() != null) existente.setPcd(dto.getPcd());
            if (dto.getPcdDetalhe() != null) existente.setPcdDetalhe(dto.getPcdDetalhe());
            if (dto.getContatoEmergencia() != null) existente.setContatoEmergencia(dto.getContatoEmergencia());
            if (dto.getConsentimentoUsoImagem() != null) existente.setConsentimentoUsoImagem(dto.getConsentimentoUsoImagem());
            if (dto.getTermoPapelEntregue() != null) existente.setTermoPapelEntregue(dto.getTermoPapelEntregue());
            if (dto.getConsentimentoLgpdDadosSensiveis() != null) existente.setConsentimentoLgpdDadosSensiveis(dto.getConsentimentoLgpdDadosSensiveis());
            return alunoRepository.save(existente);
        }).orElseGet(() -> {
            Responsavel responsavel = null;
            if (isMenor(dto.getDataNascimento())) {
                ResponsavelDTO respDTO = dto.getResponsavel();
                if (respDTO == null || respDTO.getNome() == null || respDTO.getNome().isBlank()
                        || respDTO.getCpf() == null || respDTO.getCpf().isBlank()) {
                    throw new BusinessException("Para alunos menores de 18 anos, o nome e o CPF do responsável legal são obrigatórios conforme Art. 14 da LGPD.");
                }
                responsavel = obterOuCriarResponsavel(respDTO);
            }

            Aluno novo = Aluno.builder()
                    .nome(dto.getNome())
                    .cpf(cpfLimpo)
                    .email(dto.getEmail())
                    .telefone(dto.getTelefone())
                    .dataNascimento(dto.getDataNascimento())
                    .responsavel(responsavel)
                    .endereco(dto.getEndereco())
                    .bairro(dto.getBairro())
                    .cidade(dto.getCidade())
                    .cep(dto.getCep())
                    .genero(dto.getGenero())
                    .neurodiverso(dto.getNeurodiverso() != null ? dto.getNeurodiverso() : false)
                    .neurodiversoDetalhe(dto.getNeurodiversoDetalhe())
                    .pcd(dto.getPcd() != null ? dto.getPcd() : false)
                    .pcdDetalhe(dto.getPcdDetalhe())
                    .contatoEmergencia(dto.getContatoEmergencia())
                    .consentimentoLgpd(true)
                    .consentimentoLgpdDadosSensiveis(dto.getConsentimentoLgpdDadosSensiveis() != null ? dto.getConsentimentoLgpdDadosSensiveis() : true)
                    .dataConsentimentoLgpd(java.time.LocalDateTime.now())
                    .consentimentoUsoImagem(dto.getConsentimentoUsoImagem() != null ? dto.getConsentimentoUsoImagem() : false)
                    .termoPapelEntregue(dto.getTermoPapelEntregue() != null ? dto.getTermoPapelEntregue() : true)
                    .build();
            return alunoRepository.save(novo);
        });
    }

    @Transactional
    public Aluno obterOuCriar(String nome, String cpf, String email, String telefone, LocalDate dataNascimento,
                              String respNome, String respCpf, String respTelefone, String respEmail, String respParentesco) {
        return obterOuCriar(nome, cpf, email, telefone, dataNascimento, respNome, respCpf, respTelefone, respEmail, respParentesco,
                null, null, null, null, null, false, null, false, null, null, true, false, true);
    }

    @Transactional
    public Aluno obterOuCriar(String nome, String cpf, String email, String telefone, LocalDate dataNascimento,
                              String respNome, String respCpf, String respTelefone, String respEmail, String respParentesco,
                              String endereco, String bairro, String cidade, String genero,
                              Boolean neurodiverso, String neurodiversoDetalhe,
                              Boolean pcd, String pcdDetalhe, String contatoEmergencia,
                              Boolean consentimentoLgpdDadosSensiveis, Boolean consentimentoUsoImagem, Boolean termoPapelEntregue) {
        return obterOuCriar(nome, cpf, email, telefone, dataNascimento, respNome, respCpf, respTelefone, respEmail, respParentesco,
                endereco, bairro, cidade, null, genero, neurodiverso, neurodiversoDetalhe, pcd, pcdDetalhe, contatoEmergencia,
                consentimentoLgpdDadosSensiveis, consentimentoUsoImagem, termoPapelEntregue);
    }

    @Transactional
    public Aluno obterOuCriar(String nome, String cpf, String email, String telefone, LocalDate dataNascimento,
                              String respNome, String respCpf, String respTelefone, String respEmail, String respParentesco,
                              String endereco, String bairro, String cidade, String cep, String genero,
                              Boolean neurodiverso, String neurodiversoDetalhe,
                              Boolean pcd, String pcdDetalhe, String contatoEmergencia,
                              Boolean consentimentoLgpdDadosSensiveis, Boolean consentimentoUsoImagem, Boolean termoPapelEntregue) {
        ResponsavelDTO respDTO = null;
        if (respNome != null || respCpf != null) {
            respDTO = ResponsavelDTO.builder()
                    .nome(respNome)
                    .cpf(respCpf)
                    .telefone(respTelefone)
                    .email(respEmail)
                    .grauParentesco(respParentesco)
                    .build();
        }
        AlunoDTO dto = AlunoDTO.builder()
                .nome(nome)
                .cpf(cpf)
                .email(email)
                .telefone(telefone)
                .dataNascimento(dataNascimento)
                .responsavel(respDTO)
                .endereco(endereco)
                .bairro(bairro)
                .cidade(cidade)
                .cep(cep)
                .genero(genero)
                .neurodiverso(neurodiverso)
                .neurodiversoDetalhe(neurodiversoDetalhe)
                .pcd(pcd)
                .pcdDetalhe(pcdDetalhe)
                .contatoEmergencia(contatoEmergencia)
                .consentimentoLgpdDadosSensiveis(consentimentoLgpdDadosSensiveis)
                .consentimentoUsoImagem(consentimentoUsoImagem)
                .termoPapelEntregue(termoPapelEntregue)
                .build();
        return obterOuCriar(dto);
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
                .endereco(aluno.getEndereco())
                .bairro(aluno.getBairro())
                .cidade(aluno.getCidade())
                .cep(aluno.getCep())
                .genero(aluno.getGenero())
                .neurodiverso(aluno.getNeurodiverso())
                .neurodiversoDetalhe(aluno.getNeurodiversoDetalhe())
                .pcd(aluno.getPcd())
                .pcdDetalhe(aluno.getPcdDetalhe())
                .contatoEmergencia(aluno.getContatoEmergencia())
                .consentimentoLgpd(aluno.getConsentimentoLgpd())
                .consentimentoLgpdDadosSensiveis(aluno.getConsentimentoLgpdDadosSensiveis())
                .dataConsentimentoLgpd(aluno.getDataConsentimentoLgpd())
                .consentimentoUsoImagem(aluno.getConsentimentoUsoImagem())
                .termoPapelEntregue(aluno.getTermoPapelEntregue() != null ? aluno.getTermoPapelEntregue() : true)
                .build();
    }
}
