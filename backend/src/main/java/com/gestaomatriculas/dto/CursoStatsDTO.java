package com.gestaomatriculas.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CursoStatsDTO {
    private Long cursoId;
    private String cursoNome;
    private String escolaSigla;
    private String escolaCorTema;
    private String modalidade;
    private long totalInscricoes;
    private long totalMatriculas;
    private long totalEvasoes;
    private long totalConcluidos;
    private double taxaEvasao;
}
