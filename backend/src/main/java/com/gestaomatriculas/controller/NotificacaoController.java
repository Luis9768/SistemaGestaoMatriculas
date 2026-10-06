package com.gestaomatriculas.controller;

import com.gestaomatriculas.dto.NotificacaoDTO;
import com.gestaomatriculas.service.NotificacaoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notificacoes")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'ENCARREGADA')")
public class NotificacaoController {

    private final NotificacaoService notificacaoService;

    @GetMapping
    public ResponseEntity<List<NotificacaoDTO>> listar(
            @RequestParam(required = false) Long escolaId,
            @RequestParam(required = false) Long turmaId) {
        return ResponseEntity.ok(notificacaoService.listarNotificacoes(escolaId, turmaId));
    }
}
