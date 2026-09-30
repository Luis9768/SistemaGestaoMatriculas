package com.gestaomatriculas.dto;

import com.gestaomatriculas.model.enums.Role;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UsuarioDTO {
    private Long id;
    private String nome;
    private String email;
    private Role role;
    private Long escolaId;
    private String escolaNome;
    private String escolaSigla;
    private Boolean ativo;
    private java.util.List<Long> turmaIds;
    private java.util.List<String> turmasNomes;
}
