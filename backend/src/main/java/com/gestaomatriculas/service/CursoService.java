package com.gestaomatriculas.service;

import com.gestaomatriculas.dto.CursoDTO;
import com.gestaomatriculas.exception.ResourceNotFoundException;
import com.gestaomatriculas.model.Curso;
import com.gestaomatriculas.model.enums.TipoCurso;
import com.gestaomatriculas.repository.CursoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CursoService {

    private final CursoRepository cursoRepository;

    @Transactional(readOnly = true)
    public List<CursoDTO> listarTodos(TipoCurso tipo) {
        List<Curso> cursos = (tipo != null) ? cursoRepository.findByTipo(tipo) : cursoRepository.findAll();
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
        Curso curso = Curso.builder()
                .nome(dto.getNome())
                .descricao(dto.getDescricao())
                .tipo(dto.getTipo())
                .duracaoMeses(dto.getDuracaoMeses())
                .cargaHoraria(dto.getCargaHoraria())
                .ativo(dto.getAtivo() == null ? true : dto.getAtivo())
                .build();

        Curso salvo = cursoRepository.save(curso);
        return toDTO(salvo);
    }

    @Transactional
    public CursoDTO atualizar(Long id, CursoDTO dto) {
        Curso curso = cursoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Curso não encontrado com id: " + id));

        curso.setNome(dto.getNome());
        curso.setDescricao(dto.getDescricao());
        curso.setTipo(dto.getTipo());
        curso.setDuracaoMeses(dto.getDuracaoMeses());
        curso.setCargaHoraria(dto.getCargaHoraria());
        if (dto.getAtivo() != null) {
            curso.setAtivo(dto.getAtivo());
        }

        Curso atualizado = cursoRepository.save(curso);
        return toDTO(atualizado);
    }

    @Transactional
    public void deletar(Long id) {
        if (!cursoRepository.existsById(id)) {
            throw new ResourceNotFoundException("Curso não encontrado com id: " + id);
        }
        cursoRepository.deleteById(id);
    }

    public CursoDTO toDTO(Curso curso) {
        return CursoDTO.builder()
                .id(curso.getId())
                .nome(curso.getNome())
                .descricao(curso.getDescricao())
                .tipo(curso.getTipo())
                .duracaoMeses(curso.getDuracaoMeses())
                .cargaHoraria(curso.getCargaHoraria())
                .ativo(curso.getAtivo())
                .build();
    }
}
