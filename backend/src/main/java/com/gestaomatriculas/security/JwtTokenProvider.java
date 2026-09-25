package com.gestaomatriculas.security;

import com.gestaomatriculas.model.Usuario;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtTokenProvider {

    private final SecretKey key;
    private final long expirationMs;

    public JwtTokenProvider(
            @Value("${jwt.secret:santoandre_cultural_escolas_livres_secret_token_2026_super_secure_sigma_key}") String secret,
            @Value("${jwt.expiration:86400000}") long expirationMs) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expirationMs = expirationMs;
    }

    public String gerarToken(Usuario usuario) {
        Date agora = new Date();
        Date validade = new Date(agora.getTime() + expirationMs);

        var builder = Jwts.builder()
                .subject(usuario.getEmail())
                .claim("userId", usuario.getId())
                .claim("nome", usuario.getNome())
                .claim("role", usuario.getRole().name())
                .issuedAt(agora)
                .expiration(validade);

        if (usuario.getEscola() != null) {
            builder.claim("escolaId", usuario.getEscola().getId());
            builder.claim("escolaNome", usuario.getEscola().getNome());
            builder.claim("escolaSigla", usuario.getEscola().getSigla());
        }

        return builder.signWith(key).compact();
    }

    public boolean validarToken(String token) {
        try {
            Jwts.parser().verifyWith(key).build().parseSignedClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    public String obterEmailDoToken(String token) {
        return obterClaims(token).getSubject();
    }

    public Claims obterClaims(String token) {
        return Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload();
    }
}
