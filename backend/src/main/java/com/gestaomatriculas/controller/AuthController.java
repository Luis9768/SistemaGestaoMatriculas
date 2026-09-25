package com.gestaomatriculas.controller;

import com.gestaomatriculas.dto.LoginRequestDTO;
import com.gestaomatriculas.dto.LoginResponseDTO;
import com.gestaomatriculas.dto.UsuarioDTO;
import com.gestaomatriculas.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(@Valid @RequestBody LoginRequestDTO dto) {
        return ResponseEntity.ok(authService.autenticar(dto));
    }

    @GetMapping("/me")
    public ResponseEntity<UsuarioDTO> obterUsuarioLogado(@AuthenticationPrincipal String email) {
        if (email == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(authService.obterUsuarioPorEmail(email));
    }
}
