package com.gestaomatriculas.security;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Date;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Serviço de revogação/invalidação de Tokens JWT no Logout (Token Blacklist).
 * Opera com Redis distribuído se disponível ou fallback transparente para memória RAM.
 */
@Slf4j
@Service
public class TokenBlacklistService {

    private static final String REDIS_PREFIX = "sigma:blacklist:";
    private final Map<String, Date> localBlacklist = new ConcurrentHashMap<>();
    private final StringRedisTemplate redisTemplate;

    @Autowired
    public TokenBlacklistService(Optional<StringRedisTemplate> redisTemplate) {
        this.redisTemplate = redisTemplate.orElse(null);
    }

    public void revogarToken(String token, Date expiracao) {
        if (token == null || token.trim().isEmpty()) {
            return;
        }
        String limpo = token.trim();
        long agora = System.currentTimeMillis();
        long expMillis = expiracao != null ? expiracao.getTime() : (agora + 7200000);
        long ttlMillis = Math.max(expMillis - agora, 1000);

        if (redisTemplate != null) {
            try {
                redisTemplate.opsForValue().set(REDIS_PREFIX + limpo, "REVOGADO", Duration.ofMillis(ttlMillis));
                log.info("[TOKEN BLACKLIST] Token revogado no Redis com TTL de {} segundos.", ttlMillis / 1000);
                return;
            } catch (Exception e) {
                log.warn("[TOKEN BLACKLIST] Falha ao comunicar com Redis ({}), utilizando fallback em memória.", e.getMessage());
            }
        }

        localBlacklist.put(limpo, new Date(expMillis));
        limparExpiradosLocais();
    }

    public boolean isRevogado(String token) {
        if (token == null || token.trim().isEmpty()) {
            return false;
        }
        String limpo = token.trim();

        if (redisTemplate != null) {
            try {
                Boolean existe = redisTemplate.hasKey(REDIS_PREFIX + limpo);
                if (Boolean.TRUE.equals(existe)) {
                    return true;
                }
            } catch (Exception e) {
                log.warn("[TOKEN BLACKLIST] Erro ao consultar Redis ({}), verificando cache em memória.", e.getMessage());
            }
        }

        Date expiracao = localBlacklist.get(limpo);
        if (expiracao == null) {
            return false;
        }
        if (expiracao.before(new Date())) {
            localBlacklist.remove(limpo);
            return false;
        }
        return true;
    }

    private void limparExpiradosLocais() {
        Date agora = new Date();
        localBlacklist.entrySet().removeIf(entry -> entry.getValue().before(agora));
    }
}
