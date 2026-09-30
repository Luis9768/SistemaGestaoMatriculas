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
public class CadastrarUsuarioDTO {

    @NotBlank(message = "O nome é obrigatório")
    private String nome;

    @NotBlank(message = "O e-mail é obrigatório")
    @Email(message = "E-mail com formato inválido")
    private String email;

    @NotBlank(message = "A senha provisória/inicial é obrigatória")
    private String senha;

    @NotNull(message = "O papel (Role) é obrigatório: ROLE_PROFESSOR ou ROLE_ENCARREGADA")
    private Role role;

    /**
     * Obrigatório se role == ROLE_ENCARREGADA
     */
    private Long escolaId;

    /**
     * Turmas associadas ao professor (pode ser 1 ou mais turmas, inclusive de escolas diferentes)
     */
    private List<Long> turmaIds;
}
