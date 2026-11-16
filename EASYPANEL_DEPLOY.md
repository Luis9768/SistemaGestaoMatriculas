# 🚀 Guia Oficial de Deploy no Easypanel (SIGMA)

Este guia orienta o deploy completo do **SIGMA (Sistema Integrado de Gestão de Matrículas Artísticas)** no **Easypanel** com **PostgreSQL na nuvem**.

---

## 🏗️ Arquitetura dos Serviços

| Serviço | Tecnologia | Porta Interna | Papel no Sistema |
| :--- | :--- | :--- | :--- |
| **Banco de Dados** | PostgreSQL 16 | `5432` | Armazenamento relacional de todas as tabelas (escolas, turmas, matrículas, usuários). |
| **Backend API** | Spring Boot 3 (Java 21) | `8080` | REST API, regras de negócio, autenticação JWT, integração com PostgreSQL. |
| **Frontend Web** | Next.js 16 (Standalone) | `3000` | Interface visual responsiva, painéis das escolas, chamadas e relatórios. |
| **Cache (Opcional)** | Redis 7 ou Caffeine | `6379` | Cache de alta velocidade. Se não quiser Redis, o backend usa Caffeine em memória automaticamente. |

---

## 🌟 Opção Recomendada: Deploy por Serviços Individuais no Easypanel

No painel do Easypanel, o método mais limpo e fácil de gerenciar é criar **1 Projeto** com **3 Serviços**:

### Passo 1: Criar o Projeto no Easypanel
1. No Easypanel, clique em **"+ Create Project"**.
2. Digite o nome: `sigma` (ou `gestao-matriculas`).

---

### Passo 2: Criar o Banco PostgreSQL 1-Click
1. Dentro do projeto, clique em **"+ Service"** e selecione **"Database" -> "PostgreSQL"**.
2. Defina:
   - **Name:** `postgres`
   - **Version:** `16` (ou `latest`)
   - O Easypanel criará automaticamente usuário, senha e nome do banco.
3. Copie o **Connection String** gerado pelo Easypanel (ou anote o host `postgres`, porta `5432`, usuário e senha).

> [!NOTE]
> O backend do SIGMA possui um adaptador inteligente (`DataSourceConfig.java`) que aceita tanto a URL completa (`DATABASE_URL=postgresql://...`), quanto variáveis separadas (`DB_HOST`, `DB_USER`, `DB_PASSWORD`).

---

### Passo 3: Criar o Serviço Backend (Spring Boot API)
1. Clique em **"+ Service"** e selecione **"App"**.
2. Defina o nome: `backend` (ou `api`).
3. Em **Source**:
   - Conecte seu repositório Git (GitHub ou GitLab).
   - **Branch:** `main` (ou a branch de deploy).
4. Em **Build**:
   - **Build Type:** `Dockerfile`
   - **Context Path:** `/backend`
   - **Dockerfile Path:** `Dockerfile`
5. Em **Ports**:
   - Mapeie a porta interna **`8080`**.
6. Em **Domains**:
   - Adicione seu domínio de API, ex: `api.seudominio.com` (ou use o domínio gratuito gerado pelo Easypanel).
   - O Easypanel gerencia o certificado HTTPS (SSL) automaticamente via Let's Encrypt.
7. Em **Environment (Variáveis de Ambiente)**:
   ```env
   SPRING_PROFILES_ACTIVE=prod
   DATABASE_URL=postgresql://postgres:SUA_SENHA@postgres:5432/gestao_matriculas
   CORS_ALLOWED_ORIGINS=*
   SPRING_CACHE_TYPE=caffeine
   INITIAL_USER_PASSWORD=admin123
   ```
   *(Substitua `DATABASE_URL` pela conexão do serviço Postgres criado no Passo 2. Se usar Redis, defina `SPRING_CACHE_TYPE=redis`).*

8. Clique em **"Deploy"**.
   - O healthcheck nativo consultará `GET /api/health` até o Spring inicializar.
   - O `DataInitializer` criará automaticamente as tabelas e o usuário inicial: `luis@email.com` / `admin123`.

---

### Passo 4: Criar o Serviço Frontend (Next.js 16)
1. Clique em **"+ Service"** e selecione **"App"**.
2. Defina o nome: `frontend` (ou `web`).
3. Em **Source**:
   - Conecte o mesmo repositório Git.
   - **Branch:** `main`.
4. Em **Build**:
   - **Build Type:** `Dockerfile`
   - **Context Path:** `/frontend`
   - **Dockerfile Path:** `Dockerfile`
   - **Build Arguments:**
     ```env
     NEXT_PUBLIC_API_URL=https://api.seudominio.com/api
     ```
     *(Coloque a URL pública HTTPS do seu backend criada no Passo 3, com o sufixo `/api`).*
5. Em **Ports**:
   - Mapeie a porta interna **`3000`**.
6. Em **Domains**:
   - Adicione o domínio público para os usuários acessarem, ex: `matriculas.seudominio.com` (ou o domínio gerado pelo Easypanel).
7. Clique em **"Deploy"**.

---

## 🐳 Opção Alternativa: Deploy via Docker Compose (Tudo em 1 Clique)

Se preferir subir tudo de uma vez só:
1. No Easypanel, clique em **"+ Service"** -> **"Compose"**.
2. Cole o conteúdo de [docker-compose.yml](file:///c:/Users/luis.miguel/Desktop/SistemaGestaoMatriculas/docker-compose.yml).
3. Preencha o arquivo `.env` no Easypanel com base no [.env.example](file:///c:/Users/luis.miguel/Desktop/SistemaGestaoMatriculas/.env.example):
   ```env
   CORS_ALLOWED_ORIGINS=*
   NEXT_PUBLIC_API_URL=https://api.seudominio.com/api
   ```
4. Clique em **"Deploy"**.

---

## 🔒 Credenciais de Primeiro Acesso

Assim que o container backend subir e conectar ao PostgreSQL pela primeira vez, ele semeará os dados essenciais automaticamente:

- **E-mail:** `luis@email.com`
- **Senha Inicial:** `admin123` (ou a definida em `INITIAL_USER_PASSWORD`)
- **Perfil:** Administrador Geral (`ROLE_ADMIN`)

---

## 🛡️ Otimizações de Produção Incluídas

- **Next.js Standalone:** Imagem final ultra-reduzida (~120MB) consumindo menos de 100MB de RAM.
- **Java 21 Container Support:** Flags `-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0` evitam estouro de memória (OOM) na VPS.
- **Health Checks Automáticos:** `/api/health` no backend e `/` no frontend integrados com o Traefik do Easypanel para zero downtime.
- **CORS Flexível:** Suporte a wildcard (`*`) e domínios personalizados via variável `CORS_ALLOWED_ORIGINS`.
