package com.gestaomatriculas.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.cache.Cache;
import org.springframework.cache.annotation.CachingConfigurer;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.cache.interceptor.CacheErrorHandler;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.RedisSerializer;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.TimeUnit;

/**
 * Configuração de Cache de Altíssimo Desempenho e Resiliência da Aplicação.
 * 
 * - Em Produção e Docker: Utiliza Redis 7 distribuído com serialização JSON e TTLs customizados.
 * - Em Desenvolvimento Local / Testes H2: Utiliza Caffeine em memória de latência quase zero.
 * - Resiliência (Fail-Open): Se o Redis estiver temporariamente indisponível, o CacheErrorHandler
 *   redireciona a consulta transparentemente ao banco de dados sem quebrar a requisição do usuário.
 */
@Slf4j
@Configuration
@EnableCaching
public class CacheConfig implements CachingConfigurer {

    public static final String CACHE_ESCOLAS = "escolas";
    public static final String CACHE_CURSOS = "cursos";
    public static final String CACHE_TURMAS = "turmas";
    public static final String CACHE_DASHBOARD = "dashboard_stats";

    /**
     * Tratador de Erros de Cache Resiliente (Circuit Breaker / Fail-Open).
     * Evita que indisponibilidade ou timeout no Redis lance HTTP 500 para os usuários.
     */
    @Override
    public CacheErrorHandler errorHandler() {
        return new CacheErrorHandler() {
            @Override
            public void handleCacheGetError(RuntimeException exception, Cache cache, Object key) {
                log.warn("[CACHE RESILIÊNCIA] Falha ao recuperar chave '{}' no cache '{}': {}. Fallback direto ao banco.",
                        key, cache.getName(), exception.getMessage());
            }

            @Override
            public void handleCachePutError(RuntimeException exception, Cache cache, Object key, Object value) {
                log.warn("[CACHE RESILIÊNCIA] Falha ao gravar chave '{}' no cache '{}': {}.",
                        key, cache.getName(), exception.getMessage());
            }

            @Override
            public void handleCacheEvictError(RuntimeException exception, Cache cache, Object key) {
                log.warn("[CACHE RESILIÊNCIA] Falha ao invalidar chave '{}' no cache '{}': {}.",
                        key, cache.getName(), exception.getMessage());
            }

            @Override
            public void handleCacheClearError(RuntimeException exception, Cache cache) {
                log.warn("[CACHE RESILIÊNCIA] Falha ao limpar cache '{}': {}.",
                        cache.getName(), exception.getMessage());
            }
        };
    }

    /**
     * Gerenciador de Cache Redis com TTLs por domínio e serialização JSON limpa via RedisSerializer.json().
     */
    @Bean
    @ConditionalOnProperty(name = "spring.cache.type", havingValue = "redis", matchIfMissing = true)
    public RedisCacheManager redisCacheManager(RedisConnectionFactory connectionFactory) {
        log.info("[CACHE] Configurando RedisCacheManager distribuído com TTLs dedicados.");

        RedisSerializer<Object> jsonSerializer = RedisSerializer.json();

        RedisCacheConfiguration configPadrao = RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(Duration.ofMinutes(10))
                .disableCachingNullValues()
                .serializeKeysWith(RedisSerializationContext.SerializationPair.fromSerializer(new StringRedisSerializer()))
                .serializeValuesWith(RedisSerializationContext.SerializationPair.fromSerializer(jsonSerializer));

        Map<String, RedisCacheConfiguration> configuracoesPorCache = new HashMap<>();
        // Escolas são praticamente estáticas: 60 minutos
        configuracoesPorCache.put(CACHE_ESCOLAS, configPadrao.entryTtl(Duration.ofMinutes(60)));
        // Cursos e Matrizes mudam com pouca frequência: 30 minutos
        configuracoesPorCache.put(CACHE_CURSOS, configPadrao.entryTtl(Duration.ofMinutes(30)));
        // Turmas e ofertas de vagas: 5 minutos
        configuracoesPorCache.put(CACHE_TURMAS, configPadrao.entryTtl(Duration.ofMinutes(5)));
        // Estatísticas e Analytics de Dashboard: 3 minutos
        configuracoesPorCache.put(CACHE_DASHBOARD, configPadrao.entryTtl(Duration.ofMinutes(3)));

        return RedisCacheManager.builder(connectionFactory)
                .cacheDefaults(configPadrao)
                .withInitialCacheConfigurations(configuracoesPorCache)
                .build();
    }

    /**
     * Cache Caffeine de altíssima performance para perfis locais ou de testes H2.
     */
    @Bean
    @ConditionalOnProperty(name = "spring.cache.type", havingValue = "caffeine")
    public CaffeineCacheManager caffeineCacheManager() {
        log.info("[CACHE] Inicializando gerenciador Caffeine em memória para desenvolvimento de alta performance.");
        CaffeineCacheManager cacheManager = new CaffeineCacheManager(
                CACHE_ESCOLAS, CACHE_CURSOS, CACHE_TURMAS, CACHE_DASHBOARD
        );
        cacheManager.setCaffeine(Caffeine.newBuilder()
                .expireAfterWrite(10, TimeUnit.MINUTES)
                .maximumSize(2000)
                .recordStats());
        return cacheManager;
    }

    /**
     * RedisTemplate genérico com serialização JSON para operações avançadas se necessário.
     */
    @Bean
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory connectionFactory) {
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(connectionFactory);

        RedisSerializer<Object> serializer = RedisSerializer.json();

        template.setKeySerializer(new StringRedisSerializer());
        template.setValueSerializer(serializer);
        template.setHashKeySerializer(new StringRedisSerializer());
        template.setHashValueSerializer(serializer);
        template.afterPropertiesSet();
        return template;
    }
}
