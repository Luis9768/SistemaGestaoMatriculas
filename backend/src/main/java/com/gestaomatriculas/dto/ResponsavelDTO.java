package com.gestaomatriculas.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResponsavelDTO {
    private Long id;

    @NotBlank(message = "O nome do responsável é obrigatório")
    private String nome;

    @NotBlank(message = "O CPF do responsável é obrigatório")
    private String cpf;

    private String telefone;
    private String email;
    private String grauParentesco;
}
