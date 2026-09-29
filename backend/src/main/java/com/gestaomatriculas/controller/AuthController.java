package com.gestaomatriculas.controller;

import com.gestaomatriculas.dto.EsqueciSenhaDTO;
import com.gestaomatriculas.dto.LoginRequestDTO;
import com.gestaomatriculas.dto.LoginResponseDTO;
import com.gestaomatriculas.dto.RecuperacaoRespostaDTO;
import com.gestaomatriculas.dto.RedefinirSenhaDTO;
import com.gestaomatriculas.dto.UsuarioDTO;
import com.gestaomatriculas.dto.ValidarCodigoDTO;
import com.gestaomatriculas.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

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

    @PostMapping("/esqueci-senha")
    public ResponseEntity<RecuperacaoRespostaDTO> solicitarRecuperacao(@Valid @RequestBody EsqueciSenhaDTO dto) {
        return ResponseEntity.ok(authService.solicitarCodigoRecuperacao(dto.getEmail()));
    }

    @PostMapping("/validar-codigo")
    public ResponseEntity<Map<String, Object>> validarCodigo(@Valid @RequestBody ValidarCodigoDTO dto) {
        boolean valido = authService.validarCodigoRecuperacao(dto.getEmail(), dto.getCodigo());
        return ResponseEntity.ok(Map.of("valido", valido, "mensagem", "Código validado com sucesso."));
    }

    @PostMapping("/redefinir-senha")
    public ResponseEntity<Map<String, Object>> redefinirSenha(@Valid @RequestBody RedefinirSenhaDTO dto) {
        authService.redefinirSenha(dto);
        return ResponseEntity.ok(Map.of("sucesso", true, "mensagem", "Senha redefinida com sucesso! Você já pode entrar com sua nova senha."));
    }
}
