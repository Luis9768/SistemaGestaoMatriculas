package com.gestaomatriculas.dto;

import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TurmaDashboardDTO {
    private Long turmaId;
    private String turmaCodigo;
    private String cursoNome;
    private String modalidade;
    private String escolaNome;
    private String escolaSigla;
    private String escolaCorTema;
    private int vagasTotais;
    private int vagasOcupadas;
    private double taxaOcupacao;

    // Métricas Agregadas de Frequência da Turma (Soma e Médias)
    private long totalAulasRegistradas;
    private long somaPresencas;
    private long somaFaltas;
    private long somaJustificadas;
    private long totalRegistrosPresenca;
    private double taxaAssiduidadeTurma;

    private long totalAlunos;
    private long alunosEmRiscoFaltas;
    private long alunosDesistentes;

    @Builder.Default
    private List<AlunoTurmaFrequenciaDTO> alunos = new ArrayList<>();
}
