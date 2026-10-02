package com.gestaomatriculas.dto;

import com.gestaomatriculas.model.enums.CanalOrigem;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InscricaoExternaDTO {

    @NotBlank(message = "O nome é obrigatório")
    private String nome;

    @NotBlank(message = "O CPF é obrigatório")
    private String cpf;

    @NotBlank(message = "O e-mail é obrigatório")
    @Email(message = "E-mail inválido")
    private String email;

    private String telefone;
    private LocalDate dataNascimento;

    // Campos do Responsável Legal (Obrigatórios se dataNascimento indicar menor de 18 anos)
    private String responsavelNome;
    private String responsavelCpf;
    private String responsavelTelefone;
    private String responsavelEmail;
    private String responsavelParentesco;

    // Ficha Cadastral e Inclusão
    private String endereco;
    private String bairro;
    private String cidade;
    private String genero;
    private Boolean neurodiverso;
    private String neurodiversoDetalhe;
    private Boolean pcd;
    private String pcdDetalhe;
    private String contatoEmergencia;

    @NotNull(message = "O ID da turma é obrigatório")
    private Long turmaId;

    @NotNull(message = "O canal de origem é obrigatório (ex: FORMS, SITE, PRESENCIAL, PLANILHA, CULTURA_AZ)")
    private CanalOrigem canalOrigem;

    private String observacoes;

    @Builder.Default
    private Boolean consentimentoLgpdGeral = true;

    @Builder.Default
    private Boolean consentimentoLgpdAluno = true;

    @Builder.Default
    private Boolean consentimentoLgpdDadosSensiveis = true;

    @Builder.Default
    private Boolean consentimentoUsoImagem = false;

    @Builder.Default
    private Boolean termoPapelEntregue = true;
}

