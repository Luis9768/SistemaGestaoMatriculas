package com.gestaomatriculas.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificacaoDTO {
    private String id;
    private String tipo;        // RISCO_FALTAS, LIMITE_FALTAS, DECLARACAO_PRONTA, VAGA_DISPONIVEL, AVISO_SISTEMA
    private String nivel;       // URGENTE, ALERTA, INFO
    private String titulo;
    private String mensagem;
    private Long escolaId;
    private String escolaSigla;
    private Long alunoId;
    private String alunoNome;
    private Long turmaId;
    private String turmaNome;
    private Long matriculaId;
    private String acaoRotulo;
    private String acaoTipo;     // ABRIR_PERFIL, ABRIR_TURMA, EMITIR_DECLARACAO
    private String dataHora;
}
