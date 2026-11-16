package com.gestaomatriculas.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Map;

/**
 * Endpoint de Verificação de Saúde (Health Check) para Docker, Easypanel, Traefik e Nuvem.
 * Acessível publicamente sem exigência de JWT para monitoramento contínuo de disponibilidade.
 */
@RestController
@RequestMapping("/api/health")
public class HealthController {

    @GetMapping
    public ResponseEntity<Map<String, Object>> checkHealth() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "service", "SIGMA - Sistema Integrado de Gestão de Matrículas Artísticas",
                "timestamp", Instant.now().toString()
        ));
    }
}
