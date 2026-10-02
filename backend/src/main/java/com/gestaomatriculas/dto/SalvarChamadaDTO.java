package com.gestaomatriculas.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SalvarChamadaDTO {

    @NotNull(message = "ID da turma é obrigatório")
    private Long turmaId;

    @NotNull(message = "ID da matéria é obrigatório")
    private Long materiaId;

    @NotNull(message = "Data da aula é obrigatória")
    private LocalDate dataAula;

    @NotBlank(message = "O nome do responsável pelo registro da chamada é obrigatório")
    @Size(max = 150, message = "O nome do responsável não pode exceder 150 caracteres")
    private String responsavelRegistro;

    @Size(max = 500, message = "O conteúdo ministrado não pode exceder 500 caracteres")
    private String conteudoMinistrado;

    @NotEmpty(message = "A chamada deve conter pelo menos um aluno")
    @Valid
    private List<ChamadaItemDTO> itens;
}
