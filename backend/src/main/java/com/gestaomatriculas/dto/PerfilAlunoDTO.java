package com.gestaomatriculas.dto;

import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PerfilAlunoDTO {
    private AlunoDTO aluno;

    @Builder.Default
    private List<MatriculaItemPerfilDTO> cursosAtuais = new ArrayList<>();

    @Builder.Default
    private List<MatriculaItemPerfilDTO> historicoCursos = new ArrayList<>();

    private long totalCursosConcluidos;
    private long totalCursosAtivos;
}
