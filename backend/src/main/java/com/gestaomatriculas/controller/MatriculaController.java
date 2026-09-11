package com.gestaomatriculas.controller;

import com.gestaomatriculas.dto.InscricaoExternaDTO;
import com.gestaomatriculas.dto.MatriculaDTO;
import com.gestaomatriculas.model.enums.CanalOrigem;
import com.gestaomatriculas.model.enums.StatusMatricula;
import com.gestaomatriculas.service.MatriculaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/matriculas")
@RequiredArgsConstructor
public class MatriculaController {

    private final MatriculaService matriculaService;

    @GetMapping
    public ResponseEntity<List<MatriculaDTO>> listar(
            @RequestParam(required = false) Long turmaId,
            @RequestParam(required = false) Long alunoId,
            @RequestParam(required = false) CanalOrigem canal,
            @RequestParam(required = false) StatusMatricula status) {
        return ResponseEntity.ok(matriculaService.listar(turmaId, alunoId, canal, status));
    }

    @GetMapping("/{id}")
    public ResponseEntity<MatriculaDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(matriculaService.buscarPorId(id));
    }

    @PostMapping
    public ResponseEntity<MatriculaDTO> matricular(@Valid @RequestBody MatriculaDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(matriculaService.matricular(dto));
    }

    @PostMapping("/inscrever")
    public ResponseEntity<MatriculaDTO> inscreverExterno(@Valid @RequestBody InscricaoExternaDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(matriculaService.inscrever(dto));
    }

    @PatchMapping("/{id}/cancelar")
    public ResponseEntity<MatriculaDTO> cancelar(@PathVariable Long id) {
        return ResponseEntity.ok(matriculaService.cancelarMatricula(id));
    }
}
