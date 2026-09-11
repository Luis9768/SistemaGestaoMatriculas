package com.gestaomatriculas.dto;

import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ImportacaoResultadoDTO {
    private int totalLinhas;
    private int sucesso;
    private int ignoradas;
    private int falhas;

    @Builder.Default
    private List<String> logs = new ArrayList<>();
}
