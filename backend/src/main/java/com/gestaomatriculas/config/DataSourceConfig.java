package com.gestaomatriculas.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.core.env.Environment;

import javax.sql.DataSource;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;

/**
 * Adaptador de Conexão com Banco de Dados para Nuvem (Easypanel, Railway, Render, Docker e Local).
 * 
 * Trata automaticamente variações comuns de variáveis de ambiente em provedores de nuvem:
 * - DATABASE_URL / POSTGRES_URL / DB_URL (ex: postgresql://user:pass@host:5432/db?sslmode=disable)
 * - SPRING_DATASOURCE_URL (inclusive se passada sem o prefixo 'jdbc:')
 * - Componentes separados: DB_HOST/PGHOST, DB_PORT/PGPORT, DB_NAME/PGDATABASE, DB_USER/PGUSER, DB_PASSWORD/PGPASSWORD
 * - Profile local de testes em memória (H2)
 */
@Slf4j
@Configuration
public class DataSourceConfig {

    @Bean
    @Primary
    public DataSource dataSource(Environment env) {
        HikariConfig config = new HikariConfig();

        String rawUrl = firstNonEmpty(
                getVar(env, "DATABASE_URL"),
                getVar(env, "POSTGRES_URL"),
                getVar(env, "DB_URL")
        );

        String springDatasourceUrl = getVar(env, "SPRING_DATASOURCE_URL");
        if (rawUrl == null && springDatasourceUrl != null && !springDatasourceUrl.startsWith("jdbc:")) {
            rawUrl = springDatasourceUrl;
        }

        // 1. Caso haja URL de nuvem (postgres://, postgresql:// ou jdbc:postgresql:// em DATABASE_URL)
        if (rawUrl != null) {
            log.info("[DATABASE CONFIG] Detectada URL de banco na nuvem. Configurando DataSource PostgreSQL...");
            if (configureFromUrl(config, rawUrl, env)) {
                log.info("[DATABASE CONFIG] Conectando via JDBC em: {} (usuário: {})", config.getJdbcUrl(), config.getUsername());
                return new HikariDataSource(config);
            }
        }

        // 2. Verifica variáveis separadas (PG* / DB_* / POSTGRES_* / spring.datasource.*)
        String configuredSpringUrl = env.getProperty("spring.datasource.url");
        if (configuredSpringUrl != null && configuredSpringUrl.startsWith("jdbc:h2:")) {
            // Modo H2 local
            config.setJdbcUrl(configuredSpringUrl);
            config.setUsername(firstNonEmpty(env.getProperty("spring.datasource.username"), "sa"));
            config.setPassword(env.getProperty("spring.datasource.password", ""));
            config.setDriverClassName(firstNonEmpty(env.getProperty("spring.datasource.driver-class-name"), "org.h2.Driver"));
            log.info("[DATABASE CONFIG] Modo H2 local ativo: {}", config.getJdbcUrl());
            return new HikariDataSource(config);
        }

        // 3. Fallback robusto para PostgreSQL via componentes separados ou padrão do Spring Boot
        String host = firstNonEmpty(getVar(env, "DB_HOST"), getVar(env, "PGHOST"), "localhost");
        String port = firstNonEmpty(getVar(env, "DB_PORT"), getVar(env, "PGPORT"), "5432");
        String dbName = firstNonEmpty(getVar(env, "DB_NAME"), getVar(env, "PGDATABASE"), getVar(env, "POSTGRES_DB"), "gestao_matriculas");

        String defaultJdbc = String.format("jdbc:postgresql://%s:%s/%s", host, port, dbName);
        String jdbcUrl = firstNonEmpty(springDatasourceUrl, configuredSpringUrl, defaultJdbc);

        String username = firstNonEmpty(
                getVar(env, "SPRING_DATASOURCE_USERNAME"),
                getVar(env, "DB_USER"),
                getVar(env, "PGUSER"),
                getVar(env, "POSTGRES_USER"),
                env.getProperty("spring.datasource.username"),
                "matriculas_user"
        );
        String password = firstNonEmpty(
                getVar(env, "SPRING_DATASOURCE_PASSWORD"),
                getVar(env, "DB_PASSWORD"),
                getVar(env, "PGPASSWORD"),
                getVar(env, "POSTGRES_PASSWORD"),
                env.getProperty("spring.datasource.password"),
                "matriculas_pass"
        );
        String driver = firstNonEmpty(env.getProperty("spring.datasource.driver-class-name"), "org.postgresql.Driver");

        config.setJdbcUrl(jdbcUrl);
        config.setUsername(username);
        config.setPassword(password);
        config.setDriverClassName(driver);

        log.info("[DATABASE CONFIG] Conectando via JDBC em: {} (usuário: {})", config.getJdbcUrl(), config.getUsername());
        return new HikariDataSource(config);
    }

    private boolean configureFromUrl(HikariConfig config, String rawUrl, Environment env) {
        try {
            String clean = rawUrl.trim();
            if (clean.startsWith("jdbc:")) {
                config.setJdbcUrl(clean);
                config.setUsername(firstNonEmpty(
                        getVar(env, "SPRING_DATASOURCE_USERNAME"),
                        getVar(env, "DB_USER"),
                        getVar(env, "POSTGRES_USER"),
                        env.getProperty("spring.datasource.username"),
                        "postgres"
                ));
                config.setPassword(firstNonEmpty(
                        getVar(env, "SPRING_DATASOURCE_PASSWORD"),
                        getVar(env, "DB_PASSWORD"),
                        getVar(env, "POSTGRES_PASSWORD"),
                        env.getProperty("spring.datasource.password"),
                        ""
                ));
                config.setDriverClassName("org.postgresql.Driver");
                return true;
            }

            // Remove prefixos postgres:// ou postgresql://
            String withoutProto = clean.replaceFirst("^(postgresql|postgres)://", "");

            // Separa query string (?sslmode=disable etc.)
            String query = null;
            int qIdx = withoutProto.indexOf('?');
            if (qIdx >= 0) {
                query = withoutProto.substring(qIdx + 1);
                withoutProto = withoutProto.substring(0, qIdx);
            }

            // Usa lastIndexOf('@') para suportar senhas contendo '@'
            String userInfoPart = null;
            String hostPathPart = withoutProto;
            int atIdx = withoutProto.lastIndexOf('@');
            if (atIdx >= 0) {
                userInfoPart = withoutProto.substring(0, atIdx);
                hostPathPart = withoutProto.substring(atIdx + 1);
            }

            String hostPortPart = hostPathPart;
            String dbName = "gestao_matriculas";
            int slashIdx = hostPathPart.indexOf('/');
            if (slashIdx >= 0) {
                hostPortPart = hostPathPart.substring(0, slashIdx);
                String pathDb = hostPathPart.substring(slashIdx + 1).trim();
                if (!pathDb.isEmpty()) {
                    dbName = pathDb;
                }
            }

            String host = hostPortPart;
            String port = "5432";
            int colonIdx = hostPortPart.lastIndexOf(':');
            if (colonIdx >= 0) {
                host = hostPortPart.substring(0, colonIdx);
                String p = hostPortPart.substring(colonIdx + 1).trim();
                if (!p.isEmpty()) {
                    port = p;
                }
            }

            StringBuilder jdbc = new StringBuilder("jdbc:postgresql://")
                    .append(host)
                    .append(':')
                    .append(port)
                    .append('/')
                    .append(dbName);
            if (query != null && !query.isEmpty()) {
                jdbc.append('?').append(query);
            }

            config.setJdbcUrl(jdbc.toString());
            config.setDriverClassName("org.postgresql.Driver");

            if (userInfoPart != null && !userInfoPart.isEmpty()) {
                int userSep = userInfoPart.indexOf(':');
                if (userSep >= 0) {
                    config.setUsername(safeUrlDecode(userInfoPart.substring(0, userSep)));
                    config.setPassword(safeUrlDecode(userInfoPart.substring(userSep + 1)));
                } else {
                    config.setUsername(safeUrlDecode(userInfoPart));
                    config.setPassword(firstNonEmpty(getVar(env, "DB_PASSWORD"), getVar(env, "POSTGRES_PASSWORD"), ""));
                }
            } else {
                config.setUsername(firstNonEmpty(getVar(env, "DB_USER"), getVar(env, "POSTGRES_USER"), "postgres"));
                config.setPassword(firstNonEmpty(getVar(env, "DB_PASSWORD"), getVar(env, "POSTGRES_PASSWORD"), ""));
            }

            return true;
        } catch (Exception e) {
            log.error("[DATABASE CONFIG] Erro ao interpretar URL de banco ({}). Aplicando fallback padrão.", e.getMessage());
            return false;
        }
    }

    private String safeUrlDecode(String value) {
        if (value == null) return "";
        try {
            return URLDecoder.decode(value, StandardCharsets.UTF_8);
        } catch (IllegalArgumentException ex) {
            // Caso a senha tenha '%' literal não codificado, preserva valor bruto
            return value;
        }
    }

    private String getVar(Environment env, String key) {
        String val = env.getProperty(key);
        if (val == null || val.trim().isEmpty()) {
            val = System.getenv(key);
        }
        return (val != null && !val.trim().isEmpty()) ? val.trim() : null;
    }

    private String firstNonEmpty(String... values) {
        for (String v : values) {
            if (v != null && !v.trim().isEmpty()) {
                return v.trim();
            }
        }
        return null;
    }
}
