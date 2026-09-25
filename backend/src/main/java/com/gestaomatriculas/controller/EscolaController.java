package com.gestaomatriculas.controller;

import com.gestaomatriculas.dto.EscolaDTO;
import com.gestaomatriculas.service.EscolaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/escolas")
@RequiredArgsConstructor
public class EscolaController {

    private final EscolaService escolaService;

    @GetMapping
    public ResponseEntity<List<EscolaDTO>> listarTodas() {
        return ResponseEntity.ok(escolaService.listarTodas());
    }

    @GetMapping("/{id}")
    public ResponseEntity<EscolaDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(escolaService.buscarPorId(id));
    }
}
