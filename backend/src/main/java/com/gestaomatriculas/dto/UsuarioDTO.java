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
    private java.util.List<Long> escolasIds;
    private java.util.List<EscolaResumoDTO> escolas;
    private Boolean ativo;
}
