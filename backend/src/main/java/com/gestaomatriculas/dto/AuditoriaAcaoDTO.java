package com.gestaomatriculas.dto;

import com.gestaomatriculas.model.enums.TipoAcaoAuditoria;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditoriaAcaoDTO {
    private Long id;
    private Long usuarioId;
    private String usuarioNome;
    private String usuarioEmail;
    private String usuarioRole;
    private Long escolaId;
    private String escolaSigla;
    private TipoAcaoAuditoria tipoAcao;
    private String tipoAcaoDescricao;
    private String entidade;
    private String entidadeId;
    private String detalhes;
    private String ipOrigem;
    private LocalDateTime criadoEm;
}
