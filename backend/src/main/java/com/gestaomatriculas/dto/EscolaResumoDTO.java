package com.gestaomatriculas.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EscolaResumoDTO {
    private Long id;
    private String sigla;
    private String nome;
    private String corTema;
}
