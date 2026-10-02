package com.gestaomatriculas.dto;

import lombok.*;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChamadaDetalheDTO {
    private Long turmaId;
    private String turmaCodigo;
    private String cursoNome;
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
    private List<ChamadaItemDTO> itens;
}
