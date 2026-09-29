CREATE TABLE IF NOT EXISTS cursos (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    tipo VARCHAR(50) NOT NULL,
    duracao_meses INT NOT NULL,
    carga_horaria INT NOT NULL,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS turmas (
    id BIGSERIAL PRIMARY KEY,
    curso_id BIGINT NOT NULL,
    codigo VARCHAR(50) NOT NULL UNIQUE,
    data_abertura_matricula DATE NOT NULL,
    data_fechamento_matricula DATE NOT NULL,
    data_inicio_aulas DATE NOT NULL,
    data_fim_aulas DATE NOT NULL,
    vagas_totais INT NOT NULL,
    vagas_ocupadas INT NOT NULL DEFAULT 0,
    status VARCHAR(50) NOT NULL DEFAULT 'ABERTA',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_turma_curso FOREIGN KEY (curso_id) REFERENCES cursos(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS alunos (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    cpf VARCHAR(14) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL,
    telefone VARCHAR(20),
    data_nascimento DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS matriculas (
    id BIGSERIAL PRIMARY KEY,
    aluno_id BIGINT NOT NULL,
    turma_id BIGINT NOT NULL,
    data_matricula TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    canal_origem VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'CONFIRMADA',
    observacoes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_matricula_aluno FOREIGN KEY (aluno_id) REFERENCES alunos(id) ON DELETE RESTRICT,
    CONSTRAINT fk_matricula_turma FOREIGN KEY (turma_id) REFERENCES turmas(id) ON DELETE RESTRICT,
    CONSTRAINT uk_aluno_turma UNIQUE (aluno_id, turma_id)
);
