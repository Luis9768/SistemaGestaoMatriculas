package com.gestaomatriculas.dto;

import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RelatorioPrefeituraDTO {

    private long totalRedeFormacao;
    private long totalRedeNucleo;
    private long totalRedeOficina;
    private long totalRedeMatriculadosAtivos;
    private long totalRedeDesistencias;
    private double taxaRedeDesistencia;

    @Builder.Default
    private List<EscolaPrefeituraItemDTO> escolas = new ArrayList<>();

    @Builder.Default
    private List<AlunoAtivoPrefeituraDTO> alunosAtivos = new ArrayList<>();

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class EscolaPrefeituraItemDTO {
        private Long escolaId;
        private String escolaSigla;
        private String escolaNome;
        private long matriculadosFormacao;
        private long matriculadosNucleo;
        private long matriculadosOficina;
        private long totalMatriculadosAtivos;
        private long evasoesFaltas;
        private long cancelamentosVoluntarios;
        private long totalDesistencias;
        private double taxaDesistencia;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AlunoAtivoPrefeituraDTO {
        private Long matriculaId;
        private Long alunoId;
        private String alunoNome;
        private String alunoCpf;
        private Long escolaId;
        private String escolaSigla;
        private String escolaNome;
        private String cursoNome;
        private String modalidade;
        private String turmaCodigo;
        private String dataMatricula;
    }
}
