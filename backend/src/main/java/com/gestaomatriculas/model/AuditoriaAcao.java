package com.gestaomatriculas.model;

import com.gestaomatriculas.model.enums.TipoAcaoAuditoria;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "auditoria_acoes", indexes = {
        @Index(name = "idx_auditoria_criado_em", columnList = "criado_em"),
        @Index(name = "idx_auditoria_usuario_id", columnList = "usuario_id"),
        @Index(name = "idx_auditoria_tipo_acao", columnList = "tipo_acao"),
        @Index(name = "idx_auditoria_escola_id", columnList = "escola_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditoriaAcao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "usuario_id")
    private Long usuarioId;

    @Column(name = "usuario_nome", length = 150)
    private String usuarioNome;

    @Column(name = "usuario_email", length = 150)
    private String usuarioEmail;

    @Column(name = "usuario_role", length = 50)
    private String usuarioRole;

    @Column(name = "escola_id")
    private Long escolaId;

    @Column(name = "escola_sigla", length = 30)
    private String escolaSigla;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_acao", nullable = false, length = 50)
    private TipoAcaoAuditoria tipoAcao;

    @Column(name = "entidade", length = 100)
    private String entidade;

    @Column(name = "entidade_id", length = 100)
    private String entidadeId;

    @Column(name = "detalhes", length = 2000)
    private String detalhes;

    @Column(name = "ip_origem", length = 50)
    private String ipOrigem;

    @Column(name = "criado_em", nullable = false)
    private LocalDateTime criadoEm;

    @PrePersist
    public void prePersist() {
        if (this.criadoEm == null) {
            this.criadoEm = LocalDateTime.now();
        }
    }
}
