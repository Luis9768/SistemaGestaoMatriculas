package com.gestaomatriculas.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DisciplinaDTO {
    private Long id;
    private Long cursoId;

    @NotBlank(message = "O nome da disciplina é obrigatório")
    private String nome;

    @NotNull(message = "A carga horária da disciplina é obrigatória")
    @Min(value = 1, message = "A carga horária deve ser de pelo menos 1 hora")
    private Integer cargaHoraria;

    private String descricao;
    private String professorResponsavel;
}
