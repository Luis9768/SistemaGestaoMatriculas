package com.gestaomatriculas.service;

import com.gestaomatriculas.dto.InscricaoExternaDTO;
import com.gestaomatriculas.dto.MatriculaDTO;
import com.gestaomatriculas.exception.BusinessException;
import com.gestaomatriculas.exception.ResourceNotFoundException;
import com.gestaomatriculas.model.Aluno;
import com.gestaomatriculas.model.Matricula;
import com.gestaomatriculas.model.Turma;
import com.gestaomatriculas.model.enums.CanalOrigem;
import com.gestaomatriculas.model.enums.ModalidadeCurso;
import com.gestaomatriculas.model.enums.StatusMatricula;
import com.gestaomatriculas.repository.AlunoRepository;
import com.gestaomatriculas.repository.MatriculaRepository;
import com.gestaomatriculas.repository.TurmaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.Period;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MatriculaService {

    private final MatriculaRepository matriculaRepository;
    private final TurmaRepository turmaRepository;
    private final AlunoRepository alunoRepository;
    private final AlunoService alunoService;

    @Transactional(readOnly = true)
    public List<MatriculaDTO> listar(Long escolaId, Long turmaId, Long alunoId, CanalOrigem canal, StatusMatricula status) {
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

    @Transactional
    public MatriculaDTO matricular(MatriculaDTO dto) {
        Aluno aluno = alunoRepository.findById(dto.getAlunoId())
                .orElseThrow(() -> new ResourceNotFoundException("Aluno não encontrado com id: " + dto.getAlunoId()));

        Turma turma = turmaRepository.findById(dto.getTurmaId())
                .orElseThrow(() -> new ResourceNotFoundException("Turma não encontrada com id: " + dto.getTurmaId()));

        return realizarMatricula(aluno, turma, dto.getCanalOrigem(), dto.getObservacoes());
    }

    @Transactional
    public MatriculaDTO inscrever(InscricaoExternaDTO dto) {
        Turma turma = turmaRepository.findById(dto.getTurmaId())
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
                dto.getResponsavelParentesco()
        );

        return realizarMatricula(aluno, turma, dto.getCanalOrigem(), dto.getObservacoes());
    }

    @Transactional
    public MatriculaDTO cancelarMatricula(Long id) {
        Matricula matricula = matriculaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Matrícula não encontrada com id: " + id));

        if (matricula.getStatus() == StatusMatricula.CANCELADA) {
            throw new BusinessException("Esta matrícula já está cancelada.");
        }

        matricula.setStatus(StatusMatricula.CANCELADA);
        Matricula atualizada = matriculaRepository.save(matricula);

        Turma turma = matricula.getTurma();
        if (turma.getVagasOcupadas() > 0) {
            turma.setVagasOcupadas(turma.getVagasOcupadas() - 1);
            turmaRepository.save(turma);
        }

        return toDTO(atualizada);
    }

    @Transactional
    public MatriculaDTO desligarPorFaltas(Long id, String motivo) {
        Matricula matricula = matriculaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Matrícula não encontrada com id: " + id));

        if (matricula.getStatus() == StatusMatricula.DESISTENTE_FALTAS || matricula.getStatus() == StatusMatricula.CANCELADA) {
            throw new BusinessException("Esta matrícula já se encontra inativa ou desligada.");
        }

        matricula.setStatus(StatusMatricula.DESISTENTE_FALTAS);
        String obsAtual = matricula.getObservacoes() != null ? matricula.getObservacoes() + " | " : "";
        matricula.setObservacoes(obsAtual + (motivo != null ? motivo : "Desligamento por faltas consecutivas confirmado pela secretaria após tentativa de contato prévio via WhatsApp/E-mail."));
        Matricula atualizada = matriculaRepository.save(matricula);

        Turma turma = matricula.getTurma();
        if (turma.getVagasOcupadas() > 0) {
            turma.setVagasOcupadas(turma.getVagasOcupadas() - 1);
            turmaRepository.save(turma);
        }

        return toDTO(atualizada);
    }

    @Transactional
    public MatriculaDTO promoverSuplente(Long id) {
        Matricula matricula = matriculaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Matrícula não encontrada com id: " + id));

        Turma turma = matricula.getTurma();
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
}
