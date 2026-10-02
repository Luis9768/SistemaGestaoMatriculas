package com.gestaomatriculas.dto;

import lombok.*;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CertificadoDTO {
    private Long matriculaId;
    private String codigoAutenticidade;
    private String numeroRegistroLivro;
    private String orgaoExpedidor;

    // Dados do Aluno Concluinte
    private Long alunoId;
    private String alunoNome;
    private String alunoCpf;
    private LocalDate alunoDataNascimento;

    // Dados do Curso e da Escola
    private String escolaNome;
    private String escolaSigla;
    private String escolaCorTema;
    private String cursoNome;
    private String cursoModalidade;
    private Integer cargaHorariaTotal;
    private String cargaHorariaExtenso;
    private String turmaCodigo;
    private LocalDate dataInicioAulas;
    private LocalDate dataFimAulas;
    private String periodoRealizacao;

    // Frequência e Aproveitamento (Mínimo de 75% exigido)
    private Double porcentagemFrequencia;
    private Integer totalAulas;
    private Integer presencasConfirmadas;

    // Conteúdo Programático / Matérias Concluídas
    private List<TurmaMateriaDTO> materiasConcluidas;

    // Amparo Legal e Autenticidade
    private String amparoLegal;
    private String dataExpedicaoFormatada;
    private String cidadeUfExpedicao;
    private List<String> signatarios;
}
