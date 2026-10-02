package com.gestaomatriculas.dto;

import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeclaracaoMatriculaDTO {
    private Long matriculaId;
    private String codigoAutenticidade;

    // Instituição e Escola
    private String instituicaoEnsino;
    private String cnpjInstituicao;
    private String escolaNome;
    private String escolaSigla;
    private String escolaEndereco;

    // Dados do Estudante
    private Long alunoId;
    private String alunoNome;
    private String alunoCpf;
    private LocalDate alunoDataNascimento;
    private Integer alunoIdade;
    private String alunoEnderecoCompleto;
    private String alunoNomeResponsavel;
    private String alunoCpfResponsavel;

    // Vínculo Acadêmico e Percurso Escolar
    private String cursoNome;
    private String turmaCodigo;
    private String modalidadeEnsino;
    private LocalDate dataInicioAulas;
    private LocalDate dataMatricula;
    private String mesAnoInicioExtenso;
    private String dataInicioExtenso;
    private String diasHorarioAulas;
    private Integer cargaHorariaTotal;
    private Double porcentagemFrequenciaAtual;
    private String statusMatricula;
    private Integer anoLetivo;

    // Textos Oficiais e Assinatura
    private String textoDeclaracao;
    private String dataEmissaoFormatada;
    private String responsavelSecretaria;
}
