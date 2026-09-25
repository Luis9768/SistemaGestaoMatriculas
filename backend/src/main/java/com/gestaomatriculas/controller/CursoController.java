package com.gestaomatriculas.controller;

import com.gestaomatriculas.dto.CursoDTO;
import com.gestaomatriculas.dto.DisciplinaDTO;
import com.gestaomatriculas.model.enums.TipoCurso;
import com.gestaomatriculas.service.CursoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cursos")
@RequiredArgsConstructor
public class CursoController {

    private final CursoService cursoService;

    @GetMapping
    public ResponseEntity<List<CursoDTO>> listar(
            @RequestParam(required = false) Long escolaId,
            @RequestParam(required = false) TipoCurso tipo) {
        return ResponseEntity.ok(cursoService.listarTodos(escolaId, tipo));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CursoDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(cursoService.buscarPorId(id));
    }

    @PostMapping
    public ResponseEntity<CursoDTO> criar(@Valid @RequestBody CursoDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(cursoService.criar(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CursoDTO> atualizar(@PathVariable Long id, @Valid @RequestBody CursoDTO dto) {
        return ResponseEntity.ok(cursoService.atualizar(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        cursoService.deletar(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/disciplinas")
    public ResponseEntity<List<DisciplinaDTO>> listarDisciplinas(@PathVariable Long id) {
        return ResponseEntity.ok(cursoService.listarDisciplinas(id));
    }

    @PostMapping("/{id}/disciplinas")
    public ResponseEntity<DisciplinaDTO> adicionarDisciplina(
            @PathVariable Long id,
            @Valid @RequestBody DisciplinaDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(cursoService.adicionarDisciplina(id, dto));
    }

    @DeleteMapping("/{id}/disciplinas/{disciplinaId}")
    public ResponseEntity<Void> removerDisciplina(
            @PathVariable Long id,
            @PathVariable Long disciplinaId) {
        cursoService.removerDisciplina(id, disciplinaId);
        return ResponseEntity.noContent().build();
    }
}
