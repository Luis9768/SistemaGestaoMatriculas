package com.gestaomatriculas.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TurmaMateriaDTO {
    private Long id;
    private Long turmaId;
    private String nome;
    private String duracaoEstimada;
    private Integer ordem;
}
