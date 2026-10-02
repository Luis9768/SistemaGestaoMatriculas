package com.gestaomatriculas.dto;

import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChamadaResumoDTO {
    private Long turmaId;
    private String turmaCodigo;
    private Long materiaId;
    private String materiaNome;
    private LocalDate dataAula;
    private String responsavelRegistro;
    private String conteudoMinistrado;
    private int totalAlunos;
    private int totalPresentes;
    private int totalFaltas;
    private int totalJustificadas;
    private double percentualPresenca;
}
