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

    @NotNull(message = "O ID da turma é obrigatório")
    private Long turmaId;

    @NotNull(message = "O canal de origem é obrigatório (ex: FORMS, SITE, PRESENCIAL, PLANILHA)")
    private CanalOrigem canalOrigem;

    private String observacoes;
}
