package com.gestaomatriculas.config;

import com.gestaomatriculas.model.Escola;
import com.gestaomatriculas.model.Usuario;
import com.gestaomatriculas.model.enums.Role;
import com.gestaomatriculas.repository.EscolaRepository;
import com.gestaomatriculas.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final EscolaRepository escolaRepository;
    private final UsuarioRepository usuarioRepository;
    private final com.gestaomatriculas.repository.MatriculaRepository matriculaRepository;
    private final com.gestaomatriculas.service.MatriculaSeederService matriculaSeederService;
    private final PasswordEncoder passwordEncoder;
    private final org.springframework.cache.CacheManager cacheManager;

    @org.springframework.beans.factory.annotation.Value("${app.initial.password:${INITIAL_USER_PASSWORD:admin123}}")
    private String initialConfiguredPassword;

    private String resolveInitialPassword() {
        if (initialConfiguredPassword != null && !initialConfiguredPassword.trim().isEmpty()) {
            return initialConfiguredPassword.trim();
        }
        return "admin123";
    }

    @Override
    public void run(String... args) {
        // 1. Inicializa apenas a estrutura das 4 Escolas Livres de Santo André se o banco estiver vazio
        if (escolaRepository.count() == 0) {
            log.info("Inicializando as 4 Escolas Livres de Santo André...");

            escolaRepository.save(Escola.builder()
                    .nome("Escola Livre de Teatro")
                    .sigla("ELT")
                    .descricao("Referência nacional na formação teatral pública e processos colaborativos.")
                    .corTema("violet")
                    .ativa(true)
                    .build());

            escolaRepository.save(Escola.builder()
                    .nome("Escola Livre de Dança")
                    .sigla("ELD")
                    .descricao("Formação e pesquisa em dança contemporânea e linguagens corporais.")
                    .corTema("rose")
                    .ativa(true)
                    .build());

            escolaRepository.save(Escola.builder()
                    .nome("Escola Livre de Cinema e Vídeo")
                    .sigla("ELCV")
                    .descricao("Capacitação audiovisual em roteiro, direção, fotografia, som e montagem.")
                    .corTema("blue")
                    .ativa(true)
                    .build());

            escolaRepository.save(Escola.builder()
                    .nome("Escola Municipal de Iniciação Artística")
                    .sigla("EMIA")
                    .descricao("Desenvolvimento de sensibilidade artística infantil e jovem dividida por faixas etárias.")
                    .corTema("amber")
                    .ativa(true)
                    .build());
        }

        // 2. Garante estritamente o usuário do administrador Luis
        if (usuarioRepository.findByEmail("luis@email.com").isEmpty()) {
            usuarioRepository.save(Usuario.builder()
                    .nome("Luis Admin")
                    .email("luis@email.com")
                    .senha(passwordEncoder.encode(resolveInitialPassword()))
                    .role(Role.ROLE_ADMIN)
                    .escola(null) // Acesso global
                    .ativo(true)
                    .build());
            log.info("[SEGURANÇA] Usuário administrador luis@email.com inicializado com sucesso.");
        }

        // 3. Inicializa cenários de matrículas se o banco estiver vazio
        if (matriculaRepository.count() == 0) {
            log.info("[DATA INITIALIZER] Nenhuma matrícula encontrada. Semeando cenários contextuais...");
            matriculaSeederService.resetAndSeed();
        }

        // 4. Limpa todos os caches
        try {
            if (cacheManager != null) {
                cacheManager.getCacheNames().forEach(name -> {
                    org.springframework.cache.Cache c = cacheManager.getCache(name);
                    if (c != null) c.clear();
                });
                log.info("[DATA INITIALIZER] Caches sincronizados e limpos com sucesso.");
            }
        } catch (Exception e) {
            log.warn("[DATA INITIALIZER] Aviso ao limpar caches: {}", e.getMessage());
        }
    }
}
