package com.gestaomatriculas.model.enums;

public enum TipoAcaoAuditoria {
    LOGIN("Login no Sistema"),
    CRIACAO_MATRICULA("Matrícula Realizada"),
    CANCELAMENTO_MATRICULA("Matrícula Cancelada"),
    DESLIGAMENTO_MATRICULA("Desligamento por Faltas"),
    INSCRICAO_EXTERNA("Inscrição Pública"),
    REGISTRO_CHAMADA("Registro de Chamada"),
    EDICAO_CHAMADA("Edição de Chamada"),
    CRIACAO_TURMA("Criação de Turma"),
    ATUALIZACAO_TURMA("Edição de Turma"),
    CRIACAO_MATERIA("Criação de Disciplina"),
    CADASTRO_USUARIO("Cadastro de Usuário"),
    ATUALIZACAO_USUARIO("Atualização de Usuário"),
    ATUALIZACAO_ALUNO("Atualização de Aluno"),
    IMPORTACAO_LOTE("Importação em Lote");

    private final String descricao;

    TipoAcaoAuditoria(String descricao) {
        this.descricao = descricao;
    }

    public String getDescricao() {
        return descricao;
    }
}
