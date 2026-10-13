package com.gestaomatriculas.controller;

import com.gestaomatriculas.dto.AuditoriaAcaoDTO;
import com.gestaomatriculas.model.enums.TipoAcaoAuditoria;
import com.gestaomatriculas.service.AuditoriaService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/auditoria")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AuditoriaController {

    private final AuditoriaService auditoriaService;

    @GetMapping
    public ResponseEntity<Page<AuditoriaAcaoDTO>> listar(
            @RequestParam(required = false) TipoAcaoAuditoria tipoAcao,
            @RequestParam(required = false) Long escolaId,
            @RequestParam(required = false) Long usuarioId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dataInicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dataFim,
            @RequestParam(required = false) String termo,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, Math.min(size, 100), Sort.by(Sort.Direction.DESC, "criadoEm"));
        return ResponseEntity.ok(auditoriaService.listarPaginado(
                tipoAcao,
                escolaId,
                usuarioId,
                dataInicio,
                dataFim,
                termo,
                pageable
        ));
    }
}
