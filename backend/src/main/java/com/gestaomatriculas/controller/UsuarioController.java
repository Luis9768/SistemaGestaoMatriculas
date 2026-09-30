package com.gestaomatriculas.controller;

import com.gestaomatriculas.dto.CadastrarUsuarioDTO;
import com.gestaomatriculas.dto.TurmaDTO;
import com.gestaomatriculas.dto.UsuarioDTO;
import com.gestaomatriculas.model.enums.Role;
import com.gestaomatriculas.service.UsuarioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor
public class UsuarioController {

    private final UsuarioService usuarioService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'ENCARREGADA')")
    public ResponseEntity<List<UsuarioDTO>> listar(@RequestParam(required = false) Role role) {
        return ResponseEntity.ok(usuarioService.listar(role));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ENCARREGADA')")
    public ResponseEntity<UsuarioDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(usuarioService.buscarPorId(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UsuarioDTO> cadastrar(@Valid @RequestBody CadastrarUsuarioDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(usuarioService.cadastrar(dto));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UsuarioDTO> alternarStatus(@PathVariable Long id) {
        return ResponseEntity.ok(usuarioService.alternarStatus(id));
    }

    @GetMapping("/me/turmas")
    @PreAuthorize("hasRole('PROFESSOR')")
    public ResponseEntity<List<TurmaDTO>> obterTurmasDoProfessor(@AuthenticationPrincipal String email) {
        return ResponseEntity.ok(usuarioService.obterTurmasDoProfessorLogado(email));
    }
}
