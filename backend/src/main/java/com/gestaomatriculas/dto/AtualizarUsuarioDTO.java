package com.gestaomatriculas.dto;

import com.gestaomatriculas.model.enums.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AtualizarUsuarioDTO {

    @NotBlank(message = "O nome é obrigatório")
    private String nome;

    @NotBlank(message = "O e-mail é obrigatório")
    @Email(message = "E-mail com formato inválido")
    private String email;

    @NotNull(message = "O papel (Role) é obrigatório")
    private Role role;

    private List<Long> escolasIds;

    /**
     * Opcional: preenchido somente se a administração desejar alterar a senha do usuário
     */
    private String senha;

    /**
     * Define se o usuário está ativo ou inativo para login
     */
    private Boolean ativo;
}
