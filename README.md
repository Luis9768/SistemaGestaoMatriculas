# Sistema de Gestão de Matrículas (SIGMA)

Sistema web completo para gerenciamento automatizado de matrículas de alunos em instituições de ensino, suportando oficinas de curta duração (2 a 3 meses) e cursos regulares extensivos (até 4 anos), com ingestão automatizada de planilhas e integração multicanal (Site, Forms, Planilha e Presencial).

## 🚀 Tecnologias

- **Backend:** Java 21, Spring Boot 3 / 4, Spring Data JPA, Flyway, Apache POI (leitura de Excel/CSV), Lombok.
- **Frontend:** Next.js (App Router), React, TypeScript, Tailwind CSS, Lucide Icons.
- **Banco de Dados:** PostgreSQL 16 (via Docker Compose ou local na porta 5432).

## 📂 Estrutura do Projeto

```text
gestao-matriculas/
├── backend/          # API REST Spring Boot
├── frontend/         # Interface Web Next.js
├── docker-compose.yml # Infraestrutura PostgreSQL 16
└── README.md
```

## ⚙️ Como Executar

### 1. Iniciar o Banco de Dados (PostgreSQL)
```bash
docker compose up -d
```
*O PostgreSQL subirá na porta padrão `5432` (banco: `gestao_matriculas`, usuário: `matriculas_user`, senha: `matriculas_pass`).*

### 2. Iniciar o Backend (Spring Boot)
```bash
cd backend
./mvnw spring-boot:run
```
*A API estará disponível em: `http://localhost:8080/api`*

### 3. Iniciar o Frontend (Next.js)
```bash
cd frontend
npm run dev
```
*Acesse no navegador: `http://localhost:3000`*

## ✨ Funcionalidades Principais

1. **Gestão de Cursos e Turmas:**
   - Cadastro de oficinas e cursos regulares.
   - Configuração obrigatória de datas: abertura de matrículas, encerramento de matrículas, início de aulas e término de aulas.
   - Bloqueio automático de inscrições fora do prazo e por lotação de vagas.

2. **Automação de Planilhas (Excel e CSV):**
   - Upload em lote de planilhas `.xlsx` ou `.csv`.
   - Criação/vinculação automática de alunos com deduplicação por CPF.
   - Relatório imediato com contagem de sucessos, duplicatas ignoradas e logs de inconsistências.

3. **Multicanais de Entrada:**
   - Inscrições originadas por Site Oficial, Formulários externos (Google Forms / Typeform), Planilhas ou atendimento Presencial.

4. **Cancelamento com Liberação de Vagas:**
   - Controle dinâmico de ocupação de vagas por turma em tempo real.
