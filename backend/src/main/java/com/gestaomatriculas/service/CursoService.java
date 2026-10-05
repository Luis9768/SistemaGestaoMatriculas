package com.gestaomatriculas.service;

import com.gestaomatriculas.dto.CursoDTO;
import com.gestaomatriculas.dto.DisciplinaDTO;
import com.gestaomatriculas.exception.ResourceNotFoundException;
import com.gestaomatriculas.model.Curso;
import com.gestaomatriculas.model.Disciplina;
import com.gestaomatriculas.model.Escola;
import com.gestaomatriculas.model.enums.ModalidadeCurso;
import com.gestaomatriculas.model.enums.TipoCurso;
import com.gestaomatriculas.repository.CursoRepository;
import com.gestaomatriculas.repository.DisciplinaRepository;
import com.gestaomatriculas.repository.EscolaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CursoService {

    private final CursoRepository cursoRepository;
    private final EscolaRepository escolaRepository;
    private final DisciplinaRepository disciplinaRepository;

    @Transactional(readOnly = true)
    public List<CursoDTO> listarTodos(Long escolaId, TipoCurso tipo) {
        List<Curso> cursos;
        if (escolaId != null && tipo != null) {
            cursos = cursoRepository.findByEscolaIdAndTipo(escolaId, tipo);
        } else if (escolaId != null) {
            cursos = cursoRepository.findByEscolaId(escolaId);
        } else if (tipo != null) {
            cursos = cursoRepository.findByTipo(tipo);
        } else {
            cursos = cursoRepository.findAll();
        }
        return cursos.stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CursoDTO buscarPorId(Long id) {
        Curso curso = cursoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Curso não encontrado com id: " + id));
        return toDTO(curso);
    }

    @Transactional
    public CursoDTO criar(CursoDTO dto) {
        Escola escola = null;
        if (dto.getEscolaId() != null) {
            escola = escolaRepository.findById(dto.getEscolaId())
                    .orElseThrow(() -> new ResourceNotFoundException("Escola não encontrada com id: " + dto.getEscolaId()));
        } else {
            escola = escolaRepository.findAll().stream().findFirst().orElse(null);
        }

        ModalidadeCurso modalidade = dto.getModalidade();
        if (modalidade == null) {
            modalidade = (dto.getTipo() == TipoCurso.REGULAR) ? ModalidadeCurso.FORMACAO : ModalidadeCurso.OFICINA;
        }

        // Calcula carga horária total somando as disciplinas, se fornecidas
        int cargaCalculada = (dto.getCargaHoraria() != null && dto.getCargaHoraria() > 0) ? dto.getCargaHoraria() : 0;
        if (dto.getDisciplinas() != null && !dto.getDisciplinas().isEmpty()) {
            int somaDisciplinas = dto.getDisciplinas().stream()
                    .mapToInt(d -> d.getCargaHoraria() != null ? d.getCargaHoraria() : 0)
                    .sum();
            if (somaDisciplinas > 0) {
                cargaCalculada = Math.max(cargaCalculada, somaDisciplinas);
            }
        }
        if (cargaCalculada == 0) {
            cargaCalculada = 40; // Default razoável caso não informado
        }

        Curso curso = Curso.builder()
                .nome(dto.getNome())
                .descricao(dto.getDescricao())
                .escola(escola)
                .tipo(dto.getTipo() != null ? dto.getTipo() : TipoCurso.OFICINA)
                .modalidade(modalidade)
                .duracaoMeses(dto.getDuracaoMeses() != null ? dto.getDuracaoMeses() : 2)
                .duracaoEstimada(dto.getDuracaoEstimada() != null && !dto.getDuracaoEstimada().isBlank() ? dto.getDuracaoEstimada().trim() : null)
                .cargaHoraria(cargaCalculada)
                .ativo(dto.getAtivo() == null ? true : dto.getAtivo())
                .disciplinas(new ArrayList<>())
                .build();

        Curso salvo = cursoRepository.save(curso);

        // Salva as disciplinas cadastradas pelas professoras
        if (dto.getDisciplinas() != null && !dto.getDisciplinas().isEmpty()) {
            for (DisciplinaDTO discDto : dto.getDisciplinas()) {
                if (discDto.getNome() != null && !discDto.getNome().trim().isEmpty()) {
                    Disciplina d = Disciplina.builder()
                            .nome(discDto.getNome().trim())
                            .cargaHoraria(discDto.getCargaHoraria() != null && discDto.getCargaHoraria() > 0 ? discDto.getCargaHoraria() : 20)
                            .descricao(discDto.getDescricao())
                            .professorResponsavel(discDto.getProfessorResponsavel())
                            .curso(salvo)
                            .build();
                    disciplinaRepository.save(d);
                    salvo.getDisciplinas().add(d);
                }
            }
        }

        return toDTO(salvo);
    }

    @Transactional
    public CursoDTO atualizar(Long id, CursoDTO dto) {
        Curso curso = cursoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Curso não encontrado com id: " + id));

        curso.setNome(dto.getNome());
        curso.setDescricao(dto.getDescricao());
        curso.setTipo(dto.getTipo());
        if (dto.getModalidade() != null) {
            curso.setModalidade(dto.getModalidade());
        }
        curso.setDuracaoMeses(dto.getDuracaoMeses());

        if (dto.getAtivo() != null) {
            curso.setAtivo(dto.getAtivo());
        }
        if (dto.getEscolaId() != null) {
            Escola escola = escolaRepository.findById(dto.getEscolaId())
                    .orElseThrow(() -> new ResourceNotFoundException("Escola não encontrada com id: " + dto.getEscolaId()));
            curso.setEscola(escola);
        }

        // Se disciplinas foram enviadas, atualiza a lista
        if (dto.getDisciplinas() != null) {
            curso.getDisciplinas().clear();
            int soma = 0;
            for (DisciplinaDTO discDto : dto.getDisciplinas()) {
                if (discDto.getNome() != null && !discDto.getNome().trim().isEmpty()) {
                    int ch = discDto.getCargaHoraria() != null && discDto.getCargaHoraria() > 0 ? discDto.getCargaHoraria() : 20;
                    soma += ch;
                    Disciplina d = Disciplina.builder()
                            .nome(discDto.getNome().trim())
                            .cargaHoraria(ch)
                            .descricao(discDto.getDescricao())
                            .professorResponsavel(discDto.getProfessorResponsavel())
                            .curso(curso)
                            .build();
                    curso.getDisciplinas().add(d);
                }
            }
            if (soma > 0) {
                curso.setCargaHoraria(soma);
            } else if (dto.getCargaHoraria() != null) {
                curso.setCargaHoraria(dto.getCargaHoraria());
            }
        } else if (dto.getCargaHoraria() != null) {
            curso.setCargaHoraria(dto.getCargaHoraria());
        }

        Curso atualizado = cursoRepository.save(curso);
        return toDTO(atualizado);
    }

    @Transactional
    public DisciplinaDTO adicionarDisciplina(Long cursoId, DisciplinaDTO discDto) {
        Curso curso = cursoRepository.findById(cursoId)
                .orElseThrow(() -> new ResourceNotFoundException("Curso não encontrado com id: " + cursoId));

        Disciplina d = Disciplina.builder()
                .nome(discDto.getNome().trim())
                .cargaHoraria(discDto.getCargaHoraria() != null && discDto.getCargaHoraria() > 0 ? discDto.getCargaHoraria() : 20)
                .descricao(discDto.getDescricao())
                .professorResponsavel(discDto.getProfessorResponsavel())
                .curso(curso)
                .build();

        Disciplina salva = disciplinaRepository.save(d);
        curso.getDisciplinas().add(salva);

        // Recalcula carga horária do curso
        int total = curso.getDisciplinas().stream().mapToInt(Disciplina::getCargaHoraria).sum();
        curso.setCargaHoraria(total);
        cursoRepository.save(curso);

        return toDisciplinaDTO(salva);
    }

    @Transactional
    public void removerDisciplina(Long cursoId, Long disciplinaId) {
        Curso curso = cursoRepository.findById(cursoId)
                .orElseThrow(() -> new ResourceNotFoundException("Curso não encontrado com id: " + cursoId));
        Disciplina disc = disciplinaRepository.findById(disciplinaId)
                .orElseThrow(() -> new ResourceNotFoundException("Disciplina não encontrada com id: " + disciplinaId));

        curso.getDisciplinas().remove(disc);
        disciplinaRepository.delete(disc);

        int total = curso.getDisciplinas().stream().mapToInt(Disciplina::getCargaHoraria).sum();
        curso.setCargaHoraria(total > 0 ? total : 40);
        cursoRepository.save(curso);
    }

    @Transactional(readOnly = true)
    public List<DisciplinaDTO> listarDisciplinas(Long cursoId) {
        return disciplinaRepository.findByCursoIdOrderByNomeAsc(cursoId).stream()
                .map(this::toDisciplinaDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deletar(Long id) {
        Curso curso = cursoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Curso não encontrado com id: " + id));
        curso.setAtivo(false);
        cursoRepository.save(curso);
    }

    public CursoDTO toDTO(Curso curso) {
        List<DisciplinaDTO> discDtos = new ArrayList<>();
        if (curso.getDisciplinas() != null) {
            discDtos = curso.getDisciplinas().stream()
                    .map(this::toDisciplinaDTO)
                    .collect(Collectors.toList());
        }

        return CursoDTO.builder()
                .id(curso.getId())
                .nome(curso.getNome())
                .descricao(curso.getDescricao())
                .escolaId(curso.getEscola() != null ? curso.getEscola().getId() : null)
                .escolaNome(curso.getEscola() != null ? curso.getEscola().getNome() : null)
                .escolaSigla(curso.getEscola() != null ? curso.getEscola().getSigla() : null)
                .tipo(curso.getTipo())
                .modalidade(curso.getModalidade())
                .duracaoMeses(curso.getDuracaoMeses())
                .duracaoEstimada(curso.getDuracaoEstimada())
                .cargaHoraria(curso.getCargaHoraria())
                .ativo(curso.getAtivo())
                .disciplinas(discDtos)
                .build();
    }

    public DisciplinaDTO toDisciplinaDTO(Disciplina d) {
        return DisciplinaDTO.builder()
                .id(d.getId())
                .cursoId(d.getCurso() != null ? d.getCurso().getId() : null)
                .nome(d.getNome())
                .cargaHoraria(d.getCargaHoraria())
                .descricao(d.getDescricao())
                .professorResponsavel(d.getProfessorResponsavel())
                .build();
    }
}
