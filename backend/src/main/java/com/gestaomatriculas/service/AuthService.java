package com.gestaomatriculas.service;

import com.gestaomatriculas.dto.LoginRequestDTO;
import com.gestaomatriculas.dto.LoginResponseDTO;
import com.gestaomatriculas.dto.UsuarioDTO;
import com.gestaomatriculas.exception.BusinessException;
import com.gestaomatriculas.model.Usuario;
import com.gestaomatriculas.repository.UsuarioRepository;
import com.gestaomatriculas.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    @Transactional(readOnly = true)
    public LoginResponseDTO autenticar(LoginRequestDTO dto) {
        Usuario usuario = usuarioRepository.findByEmail(dto.getEmail().trim().toLowerCase())
                .orElseThrow(() -> new BusinessException("Credenciais inválidas. Verifique seu e-mail e senha."));

        if (!Boolean.TRUE.equals(usuario.getAtivo())) {
            throw new BusinessException("Usuário desativado pelo administrador.");
        }

        if (!passwordEncoder.matches(dto.getSenha(), usuario.getSenha())) {
            throw new BusinessException("Credenciais inválidas. Verifique seu e-mail e senha.");
        }

        String token = jwtTokenProvider.gerarToken(usuario);

        return LoginResponseDTO.builder()
                .token(token)
                .tipo("Bearer")
                .id(usuario.getId())
                .nome(usuario.getNome())
                .email(usuario.getEmail())
                .role(usuario.getRole())
                .escolaId(usuario.getEscola() != null ? usuario.getEscola().getId() : null)
                .escolaNome(usuario.getEscola() != null ? usuario.getEscola().getNome() : "Todas as Escolas (Administrador Geral)")
                .escolaSigla(usuario.getEscola() != null ? usuario.getEscola().getSigla() : "ADMIN")
                .build();
    }

    @Transactional(readOnly = true)
    public UsuarioDTO obterUsuarioPorEmail(String email) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new BusinessException("Usuário não encontrado."));

        return UsuarioDTO.builder()
                .id(usuario.getId())
                .nome(usuario.getNome())
                .email(usuario.getEmail())
                .role(usuario.getRole())
                .escolaId(usuario.getEscola() != null ? usuario.getEscola().getId() : null)
                .escolaNome(usuario.getEscola() != null ? usuario.getEscola().getNome() : "Todas as Escolas")
                .escolaSigla(usuario.getEscola() != null ? usuario.getEscola().getSigla() : "ADMIN")
                .ativo(usuario.getAtivo())
                .build();
    }
}
