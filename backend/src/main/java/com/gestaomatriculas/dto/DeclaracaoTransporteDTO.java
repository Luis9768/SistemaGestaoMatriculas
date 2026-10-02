package com.gestaomatriculas.dto;

import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeclaracaoTransporteDTO {
    private Long matriculaId;
    private String codigoAutenticidade;

    // Instituição de Ensino Mantenedora
    private String instituicaoEnsino;
    private String cnpjInstituicao;
    private String escolaNome;
    private String escolaSigla;
    private String escolaEndereco;

    // Dados Completos do Estudante (Padrão SPTrans/CPTM)
    private Long alunoId;
    private String alunoNome;
    private String alunoCpf;
    private LocalDate alunoDataNascimento;
    private String alunoEnderecoCompleto;
    private String alunoNomeResponsavel;

    // Informações da Matrícula e Percurso Escolar
    private String cursoNome;
    private String turmaCodigo;
    private String modalidadeEnsino; // "Presencial"
    private String diasSemanaAulas;
    private String horarioTurnoAulas;
    private Integer cargaHorariaTotal;
    private Integer cargaHorariaSemanal;
    private LocalDate dataInicioAulas;
    private LocalDate dataPrevisaoTermino;

    // Critério Obrigatório: Mais de 60 dias de curso ativo
    private Long diasCursadosCumpridos;
    private Double porcentagemFrequenciaAtual;
    private String statusMatricula;

    // Finalidade e Textos Oficiais
    private String orgaosDestinatarios;
    private String finalidade;
    private String textoDeclaracao;
    private String dataEmissaoFormatada;
    private String validadeDeclaracao;
    private String responsavelSecretaria;
}
