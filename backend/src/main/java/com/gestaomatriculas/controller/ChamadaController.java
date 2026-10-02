package com.gestaomatriculas.controller;

import com.gestaomatriculas.dto.ChamadaDetalheDTO;
import com.gestaomatriculas.dto.ChamadaItemDTO;
import com.gestaomatriculas.dto.ChamadaResumoDTO;
import com.gestaomatriculas.dto.SalvarChamadaDTO;
import com.gestaomatriculas.service.ChamadaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/chamadas")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'PROFESSOR')")
public class ChamadaController {

    private final ChamadaService chamadaService;

    @GetMapping("/turma/{turmaId}/materia/{materiaId}/alunos")
    public ResponseEntity<List<ChamadaItemDTO>> obterAlunosParaChamada(
            @PathVariable Long turmaId,
            @PathVariable Long materiaId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate data) {
        return ResponseEntity.ok(chamadaService.obterAlunosParaChamada(turmaId, materiaId, data));
    }

    @GetMapping("/turma/{turmaId}/materia/{materiaId}")
    public ResponseEntity<List<ChamadaResumoDTO>> listarChamadas(
            @PathVariable Long turmaId,
            @PathVariable Long materiaId) {
        return ResponseEntity.ok(chamadaService.listarChamadas(turmaId, materiaId));
    }

    @GetMapping("/materia/{materiaId}/detalhe")
    public ResponseEntity<ChamadaDetalheDTO> obterDetalheChamada(
            @PathVariable Long materiaId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate data) {
        return ResponseEntity.ok(chamadaService.obterDetalheChamada(materiaId, data));
    }

    @PostMapping
    public ResponseEntity<ChamadaDetalheDTO> salvarChamada(@Valid @RequestBody SalvarChamadaDTO dto) {
        return ResponseEntity.ok(chamadaService.salvarChamada(dto));
    }
}
