package com.gestaomatriculas.dto;

import com.gestaomatriculas.model.enums.CanalOrigem;
import com.gestaomatriculas.model.enums.StatusMatricula;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MatriculaDTO {
    private Long id;

    @NotNull(message = "O ID do aluno é obrigatório")
    private Long alunoId;
    private String alunoNome;
    private String alunoCpf;
    private String alunoEmail;

    @NotNull(message = "O ID da turma é obrigatório")
    private Long turmaId;
    private String turmaCodigo;
    private String cursoNome;

    private LocalDateTime dataMatricula;

    @NotNull(message = "O canal de origem é obrigatório")
    private CanalOrigem canalOrigem;

    private StatusMatricula status;
    private String observacoes;
}
