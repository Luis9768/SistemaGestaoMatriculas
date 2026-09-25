package com.gestaomatriculas.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StatusDistribuicaoDTO {
    private String status;
    private String label;
    private long quantidade;
    private double percentual;
    private String cor;
}
