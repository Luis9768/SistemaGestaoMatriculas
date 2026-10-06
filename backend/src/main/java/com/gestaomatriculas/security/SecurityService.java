package com.gestaomatriculas.security;

import com.gestaomatriculas.model.Escola;
import com.gestaomatriculas.model.Usuario;
import com.gestaomatriculas.model.enums.Role;
import com.gestaomatriculas.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.Optional;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
public class SecurityService {

    private final UsuarioRepository usuarioRepository;

    public Optional<Usuario> getUsuarioAutenticado() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return Optional.empty();
        }
        String email = auth.getName();
        return usuarioRepository.findByEmail(email).filter(Usuario::getAtivo);
    }

    /**
     * Retorna a escola apropriada para o usuário autenticado.
     * Se for ROLE_ENCARREGADA:
     * - Se o usuário solicitou uma escola para a qual tem permissão, retorna ela.
     * - Se solicitou uma escola sem permissão (ou nulo), redireciona para a primeira escola permitida.
     * Se for ROLE_ADMIN:
     * - Respeita o escolaId solicitado (podendo ser nulo para visão global de todas as escolas).
     */
    public Long resolverEscolaId(Long escolaIdSolicitado) {
        Optional<Usuario> usuarioOpt = getUsuarioAutenticado();
        if (usuarioOpt.isPresent()) {
            Usuario usuario = usuarioOpt.get();
            if (usuario.getRole() == Role.ROLE_ENCARREGADA) {
                Set<Escola> permitidas = usuario.getTodasEscolas();
                if (!permitidas.isEmpty()) {
                    if (escolaIdSolicitado != null && usuario.temAcessoAEscola(escolaIdSolicitado)) {
                        return escolaIdSolicitado;
                    }
                    Long primeiraPermitida = permitidas.iterator().next().getId();
                    if (escolaIdSolicitado != null) {
                        log.warn("[SEGURANÇA] Encarregada {} tentou acessar escolaId={}. Redirecionada para sua unidade permitida (escolaId={}).",
                                usuario.getEmail(), escolaIdSolicitado, primeiraPermitida);
                    }
                    return primeiraPermitida;
                }
            }
        }
        return escolaIdSolicitado;
    }

    public boolean isEncarregada() {
        return getUsuarioAutenticado()
                .map(u -> u.getRole() == Role.ROLE_ENCARREGADA)
                .orElse(false);
    }

    public boolean temAcessoAEscola(Long escolaId) {
        return getUsuarioAutenticado()
                .map(u -> u.temAcessoAEscola(escolaId))
                .orElse(false);
    }

    public Long getEscolaIdEncarregada() {
        Optional<Usuario> usuarioOpt = getUsuarioAutenticado();
        if (usuarioOpt.isPresent()) {
            Usuario u = usuarioOpt.get();
            if (u.getRole() == Role.ROLE_ENCARREGADA) {
                Set<Escola> todas = u.getTodasEscolas();
                if (!todas.isEmpty()) {
                    return todas.iterator().next().getId();
                }
            }
        }
        return null;
    }
}
