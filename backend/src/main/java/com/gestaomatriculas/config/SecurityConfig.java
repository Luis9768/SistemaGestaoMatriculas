package com.gestaomatriculas.config;

import com.gestaomatriculas.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpMethod;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("http://localhost:3000", "http://127.0.0.1:3000"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // 1. Endpoints Públicos Estritos (Login da secretaria e formulário de inscrição do cidadão)
                        .requestMatchers(HttpMethod.POST, "/api/auth/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/matriculas/inscrever").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/escolas/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/cursos/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/turmas/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/importacao/modelo-csv").permitAll()
                        .requestMatchers("/h2-console/**").permitAll()

                        // 2. Proteção LGPD Rigorosa: Dashboard, Alunos, Matrículas e Administração exigem JWT Bearer
                        .requestMatchers("/api/dashboard/**").authenticated()
                        .requestMatchers("/api/alunos/**").authenticated()
                        .requestMatchers("/api/matriculas/**").authenticated()
                        .requestMatchers("/api/importacao/**").authenticated()
                        .requestMatchers("/api/usuarios/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/cursos/**").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/api/cursos/**").authenticated()
                        .requestMatchers(HttpMethod.DELETE, "/api/cursos/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/turmas/**").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/api/turmas/**").authenticated()
                        .requestMatchers(HttpMethod.DELETE, "/api/turmas/**").authenticated()

                        // 3. Qualquer outra requisição deve ser autenticada
                        .anyRequest().authenticated()
                )
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint((request, response, authException) -> {
                            response.setContentType("application/json;charset=UTF-8");
                            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                            response.getWriter().write("{\"status\":401,\"error\":\"Não autorizado\",\"message\":\"Acesso negado (LGPD). É obrigatório estar autenticado com credenciais válidas da Secretaria para visualizar estes dados.\"}");
                        })
                        .accessDeniedHandler((request, response, accessDeniedException) -> {
                            response.setContentType("application/json;charset=UTF-8");
                            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                            response.getWriter().write("{\"status\":403,\"error\":\"Acesso proibido\",\"message\":\"Seu usuário não possui permissão para acessar estes dados escolares.\"}");
                        })
                )
                .headers(headers -> headers.frameOptions(frame -> frame.sameOrigin()))
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}

