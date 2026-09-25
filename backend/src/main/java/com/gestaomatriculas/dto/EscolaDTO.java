package com.gestaomatriculas.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EscolaDTO {
    private Long id;
    private String nome;
    private String sigla;
    private String descricao;
    private String corTema;
    private Boolean ativa;
}
