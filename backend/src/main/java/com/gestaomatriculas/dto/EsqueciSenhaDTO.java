package com.gestaomatriculas.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EsqueciSenhaDTO {

    @NotBlank(message = "O e-mail institucional é obrigatório")
    @Email(message = "Formato de e-mail inválido")
    private String email;
}
