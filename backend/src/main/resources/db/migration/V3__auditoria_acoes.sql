CREATE TABLE IF NOT EXISTS auditoria_acoes (
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT,
    usuario_nome VARCHAR(150),
    usuario_email VARCHAR(150),
    usuario_role VARCHAR(50),
    escola_id BIGINT,
    escola_sigla VARCHAR(30),
    tipo_acao VARCHAR(50) NOT NULL,
    entidade VARCHAR(100),
    entidade_id VARCHAR(100),
    detalhes VARCHAR(2000),
    ip_origem VARCHAR(50),
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_auditoria_criado_em ON auditoria_acoes(criado_em);
CREATE INDEX IF NOT EXISTS idx_auditoria_usuario_id ON auditoria_acoes(usuario_id);
CREATE INDEX IF NOT EXISTS idx_auditoria_tipo_acao ON auditoria_acoes(tipo_acao);
CREATE INDEX IF NOT EXISTS idx_auditoria_escola_id ON auditoria_acoes(escola_id);
