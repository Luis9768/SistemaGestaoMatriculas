package com.gestaomatriculas.dto;

import com.gestaomatriculas.model.enums.StatusMatricula;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AlunoTurmaFrequenciaDTO {
    private Long alunoId;
    private Long matriculaId;
    private String alunoNome;
    private String alunoCpf;
    private boolean menorDeIdade;
    private StatusMatricula statusMatricula;
    private long totalAulas;
    private long presencas;
    private long faltas;
    private long justificadas;
    private double porcentagemPresenca;
    private int faltasConsecutivas;
    private boolean riscoDesistencia;
    private boolean atingiuLimiteFaltas;
}
