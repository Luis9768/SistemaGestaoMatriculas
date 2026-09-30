package com.gestaomatriculas.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AtualizarContatoDTO {

    @Email(message = "E-mail do estudante inválido")
    @Size(max = 120, message = "E-mail pode ter no máximo 120 caracteres")
    private String email;

    @Size(max = 30, message = "Telefone pode ter no máximo 30 caracteres")
    private String telefone;

    @Size(max = 100, message = "Nome do responsável pode ter no máximo 100 caracteres")
    private String responsavelNome;

    @Size(max = 30, message = "Telefone do responsável pode ter no máximo 30 caracteres")
    private String responsavelTelefone;

    @Email(message = "E-mail do responsável inválido")
    @Size(max = 120, message = "E-mail do responsável pode ter no máximo 120 caracteres")
    private String responsavelEmail;
}
