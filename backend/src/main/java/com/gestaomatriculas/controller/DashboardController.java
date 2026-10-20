package com.gestaomatriculas.controller;

import com.gestaomatriculas.dto.DashboardStatsDTO;
import com.gestaomatriculas.dto.RelatorioPrefeituraDTO;
import com.gestaomatriculas.dto.TurmaDashboardDTO;
import com.gestaomatriculas.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsDTO> obterStats(@RequestParam(required = false) Long escolaId) {
        return ResponseEntity.ok(dashboardService.obterStatsGerais(escolaId));
    }

    @GetMapping("/relatorio-prefeitura")
    public ResponseEntity<RelatorioPrefeituraDTO> obterRelatorioPrefeitura(@RequestParam(required = false) Long escolaId) {
        return ResponseEntity.ok(dashboardService.obterRelatorioPrefeitura(escolaId));
    }

    @GetMapping("/turma/{turmaId}")
    public ResponseEntity<TurmaDashboardDTO> obterDashboardTurma(@PathVariable Long turmaId) {
        return ResponseEntity.ok(dashboardService.obterDashboardTurma(turmaId));
    }
}
