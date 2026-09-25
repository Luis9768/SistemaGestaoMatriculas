package com.gestaomatriculas.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResumoFrequenciaDTO {
    private long totalAulas;
    private long totalPresencas;
    private long totalFaltas;
    private long totalJustificadas;
    private double porcentagemFrequencia;
    private int faltasConsecutivas;
    private boolean riscoDesistencia;
    private boolean atingiuLimiteFaltas;
}
