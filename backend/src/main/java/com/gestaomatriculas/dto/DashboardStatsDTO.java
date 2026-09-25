package com.gestaomatriculas.dto;

import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardStatsDTO {
    private long totalGeral;
    private long totalInscricoes;      // INSCRITO + EM_SELECAO + APROVADO
    private long totalMatriculados;    // CONFIRMADA
    private long totalEvasoes;         // DESISTENTE_FALTAS
    private long totalCancelados;      // CANCELADA
    private long totalFormados;        // CONCLUIDA
    private long totalFilaEspera;      // FILA_ESPERA

    private double taxaEvasao;         // %
    private double taxaConclusao;      // %
    private double taxaOcupacaoVagas;  // %

    private long totalVagas;
    private long vagasOcupadas;
    private long totalCursos;
    private long totalTurmas;

    @Builder.Default
    private List<StatusDistribuicaoDTO> distribuicaoStatus = new ArrayList<>();

    @Builder.Default
    private List<CursoStatsDTO> cursosStats = new ArrayList<>();
}
