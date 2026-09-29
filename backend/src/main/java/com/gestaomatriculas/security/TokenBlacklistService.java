package com.gestaomatriculas.security;

import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Serviço de revogação/invalidação de Tokens JWT no Logout (Token Blacklist).
 * Impede que tokens já encerrados pelo usuário continuem sendo aceitos pelo servidor.
 */
@Service
public class TokenBlacklistService {

    private final Map<String, Date> blacklist = new ConcurrentHashMap<>();

    public void revogarToken(String token, Date expiracao) {
        if (token != null && !token.trim().isEmpty()) {
            blacklist.put(token.trim(), expiracao != null ? expiracao : new Date(System.currentTimeMillis() + 7200000));
            limparExpirados();
        }
    }

    public boolean isRevogado(String token) {
        if (token == null || token.trim().isEmpty()) {
            return false;
        }
        Date expiracao = blacklist.get(token.trim());
        if (expiracao == null) {
            return false;
        }
        // Se a data de validade original do token já passou, remove da memória
        if (expiracao.before(new Date())) {
            blacklist.remove(token.trim());
            return false;
        }
        return true;
    }

    private void limparExpirados() {
        Date agora = new Date();
        blacklist.entrySet().removeIf(entry -> entry.getValue().before(agora));
    }
}
