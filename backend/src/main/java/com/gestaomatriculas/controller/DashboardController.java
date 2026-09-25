package com.gestaomatriculas.controller;

import com.gestaomatriculas.dto.DashboardStatsDTO;
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

    /**
     * Retorna indicadores globais ou filtrados por escola: evasões, matrículas,
     * inscrições, desistências e dados para gráficos de pizza e torre.
     */
    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsDTO> obterStats(@RequestParam(required = false) Long escolaId) {
        return ResponseEntity.ok(dashboardService.obterStatsGerais(escolaId));
    }

    /**
     * Retorna o dashboard detalhado de uma turma específica, somando todas as presenças,
     * faltas, assiduidade geral e alunos em risco de evasão.
     */
    @GetMapping("/turma/{turmaId}")
    public ResponseEntity<TurmaDashboardDTO> obterDashboardTurma(@PathVariable Long turmaId) {
        return ResponseEntity.ok(dashboardService.obterDashboardTurma(turmaId));
    }
}
