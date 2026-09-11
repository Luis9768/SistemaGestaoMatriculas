-- Inserção de Cursos (Oficinas e Cursos Regulares)
INSERT INTO cursos (id, nome, descricao, tipo, duracao_meses, carga_horaria, ativo) VALUES
(1, 'Oficina de Robótica Básica', 'Introdução à robótica e automação com Arduino', 'OFICINA', 2, 40, true),
(2, 'Oficina de Fotografia Digital', 'Composição, iluminação e edição fotográfica básica', 'OFICINA', 3, 60, true),
(3, 'Curso Técnico em Desenvolvimento de Sistemas', 'Formação completa em programação e engenharia de software', 'REGULAR', 24, 1200, true),
(4, 'Bacharelado em Administração', 'Graduação em gestão, processos e negócios', 'REGULAR', 48, 3200, true);

-- Inserção de Turmas / Ofertas com diferentes períodos
INSERT INTO turmas (id, curso_id, codigo, data_abertura_matricula, data_fechamento_matricula, data_inicio_aulas, data_fim_aulas, vagas_totais, vagas_ocupadas, status) VALUES
(1, 1, 'ROB-2026-T1', '2026-09-01', '2026-09-30', '2026-10-05', '2026-12-05', 30, 2, 'ABERTA'),
(2, 2, 'FOT-2026-T1', '2026-09-01', '2026-10-15', '2026-10-20', '2027-01-20', 25, 1, 'ABERTA'),
(3, 3, 'DEV-2027-1', '2026-10-01', '2026-12-20', '2027-02-01', '2029-02-01', 40, 0, 'ABERTA'),
(4, 4, 'ADM-2027-1', '2026-10-01', '2026-12-20', '2027-02-01', '2031-02-01', 50, 0, 'ABERTA');

-- Inserção de Alunos de Exemplo
INSERT INTO alunos (id, nome, cpf, email, telefone, data_nascimento) VALUES
(1, 'Lucas Silva', '123.456.789-01', 'lucas.silva@exemplo.com', '(11) 98765-4321', '2004-05-12'),
(2, 'Mariana Souza', '234.567.890-12', 'mariana.souza@exemplo.com', '(11) 97654-3210', '2002-11-23'),
(3, 'Carlos Eduardo', '345.678.901-23', 'carlos.eduardo@exemplo.com', '(11) 96543-2109', '1999-03-08');

-- Inserção de Matrículas Iniciais (diversos canais de origem)
INSERT INTO matriculas (id, aluno_id, turma_id, data_matricula, canal_origem, status, observacoes) VALUES
(1, 1, 1, '2026-09-02 10:30:00', 'SITE', 'CONFIRMADA', 'Inscrição realizada pelo portal web'),
(2, 2, 1, '2026-09-05 14:15:00', 'FORMS', 'CONFIRMADA', 'Importado do formulário de oficinas'),
(3, 3, 2, '2026-09-08 16:45:00', 'PRESENCIAL', 'CONFIRMADA', 'Matrícula realizada na secretaria');
