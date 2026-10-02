package com.gestaomatriculas.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AlunoDTO {
    private Long id;

    @NotBlank(message = "O nome do aluno é obrigatório")
    private String nome;

    @NotBlank(message = "O CPF é obrigatório")
    private String cpf;

    @NotBlank(message = "O e-mail é obrigatório")
    @Email(message = "E-mail inválido")
    private String email;

    private String telefone;
    private LocalDate dataNascimento;
    private Boolean menorDeIdade;
    private ResponsavelDTO responsavel;

    private String endereco;
    private String bairro;
    private String cidade;
    private String genero;
    private Boolean neurodiverso;
    private String neurodiversoDetalhe;
    private Boolean pcd;
    private String pcdDetalhe;
    private String contatoEmergencia;

    private Boolean consentimentoLgpd;
    private Boolean consentimentoLgpdDadosSensiveis;
    private java.time.LocalDateTime dataConsentimentoLgpd;
    private Boolean consentimentoUsoImagem;
    private Boolean termoPapelEntregue;
}

