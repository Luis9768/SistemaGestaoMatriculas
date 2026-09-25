package com.gestaomatriculas.controller;

import com.gestaomatriculas.dto.TurmaDTO;
import com.gestaomatriculas.service.TurmaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/turmas")
@RequiredArgsConstructor
public class TurmaController {

    private final TurmaService turmaService;

    @GetMapping
    public ResponseEntity<List<TurmaDTO>> listar(
            @RequestParam(required = false) Long cursoId,
            @RequestParam(required = false) Long escolaId,
            @RequestParam(required = false) Boolean apenasAbertas) {
        return ResponseEntity.ok(turmaService.listarTodas(cursoId, escolaId, apenasAbertas));
    }


    @GetMapping("/{id}")
    public ResponseEntity<TurmaDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(turmaService.buscarPorId(id));
    }

    @PostMapping
    public ResponseEntity<TurmaDTO> criar(@Valid @RequestBody TurmaDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(turmaService.criar(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TurmaDTO> atualizar(@PathVariable Long id, @Valid @RequestBody TurmaDTO dto) {
        return ResponseEntity.ok(turmaService.atualizar(id, dto));
    }
}
