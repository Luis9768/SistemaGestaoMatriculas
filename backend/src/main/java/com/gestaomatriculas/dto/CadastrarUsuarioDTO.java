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

    @NotNull(message = "O papel (Role) é obrigatório: ROLE_ENCARREGADA ou ROLE_ADMIN")
    private Role role;

    /**
     * Obrigatório se role == ROLE_ENCARREGADA (pode ser o ID único ou a lista de IDs)
     */
    private Long escolaId;

    /**
     * Lista de escolas às quais a encarregada terá acesso
     */
    private List<Long> escolasIds;

    /**
     * Foto de perfil do usuário (URL ou imagem em Base64 Data URI)
     */
    private String fotoUrl;
}
