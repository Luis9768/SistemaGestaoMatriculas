# Proposta de Projeto: Sistema de Gestão de Matrículas (SIGMA)
**Projeto de Extensão Universitária — Gran Faculdade**

---

## 1. Identificação e Contexto do Projeto
* **Instituição de Ensino:** Gran Faculdade
* **Modalidade:** Atividade Extensionista Curricular
* **Responsável pelo Desenvolvimento:** Luis (Estudante de Graduação)
* **Custo para a Instituição:** **Gratuito (R$ 0,00)** — Sem custos de licença, desenvolvimento ou taxas de uso de software.

---

## 2. Análise Técnica de Infraestrutura e Stack

Para o volume estimado de **~1.500 matrículas/ano** (média de 4 a 5 matrículas/dia, com picos pontuais em períodos de abertura de turmas):

| Componente | Tecnologia Sugerida | Justificativa Técnica |
| :--- | :--- | :--- |
| **Backend** | **Java 21 + Spring Boot** | Robustez corporativa, tipagem estática rigorosa, segurança nativa e facilidade de manutenção a longo prazo. |
| **Frontend** | **Next.js + TypeScript** | Interface rápida, moderna e responsiva. TypeScript elimina erros comuns de tela antes de chegarem à produção. |
| **Banco de Dados** | **PostgreSQL** *(Recomendado sobre MySQL)* | **Por que PostgreSQL?** Controle de concorrência superior (MVCC), bloqueio atômico de vagas (evita sobrematrícula em picos), suporte nativo a JSON (flexibilidade para campos extras de formulários) e excelente compatibilidade com instâncias gratuitas em nuvem (Render, Supabase, Neon). |
| **Hospedagem** | Nuvem Gratuita / Baixo Custo | Frontend na Vercel (gratuita), Backend e Banco em contêiner Docker/Render/VPS básica de baixo consumo. |

---

## 3. Pauta da Reunião de Alinhamento

### Bloco A: Apresentação e Demonstração do MVP (15 min)
1. Contextualizar a atividade extensionista da Gran Faculdade e a entrega gratuita do sistema.
2. Demonstração prática do protótipo: cadastro de cursos/turmas, formulário de inscrição e importação de planilhas.
3. Coleta das primeiras impressões sobre a usabilidade.

---

### Bloco B: Mapeamento de Dores e Processo Atual (15 min)
* Como as matrículas são recebidas hoje? (Papel, balcão, WhatsApp, Google Forms, planilhas Excel)?
* Qual é o maior gargalo atual? (Tempo gasto digitando dados, perda de informações, alunos duplicados, controle manual de vagas)?
* Quem são as pessoas que usarão o sistema no dia a dia? (Secretaria acadêmica, recepcionistas, coordenação)?

---

### Bloco C: Levantamento de Requisitos e Regras (25 min)

#### 1. Requisitos Funcionais (O que o sistema deve fazer)
* [ ] **Canais de Entrada:** Apenas cadastro interno ou formulário público para o próprio aluno preencher?
* [ ] **Gestão de Alunos:** Histórico de cursos já feitos pelo mesmo aluno?
* [ ] **Documentação:** Há necessidade de anexar documentos (RG, CPF, Comprovante de Residência) em PDF/imagem?
* [ ] **Documentos e Assinaturas (Comprovante):** É necessário gerar comprovante/termo de matrícula em PDF para o aluno ou responsável assinar fisicamente?
* [ ] **Canais de Notificação (WhatsApp vs E-mail):** O envio de confirmação deve priorizar e-mail ou integração/links para WhatsApp?
* [ ] **Relatórios:** Quais relatórios a coordenação precisa exportar? (Lista de presença, lista por turma em Excel/PDF).

#### 2. Regras de Negócio (Critérios e Políticas da Instituição)
* [ ] **Menores de Idade e Responsáveis:** Haverá alunos menores de 18 anos? O sistema deve exigir dados e CPF do responsável legal?
* [ ] **Gratuidade ou Cobrança:** Todos os cursos são gratuitos ou haverá controle de taxa de matrícula, material ou mensalidade?
* [ ] **Desistência e Fila de Espera Dinâmica:** Se o aluno faltar nos primeiros dias (ex: 3 dias de falta sem justificativa), a vaga é repassada automaticamente para a fila de reserva?
* [ ] **Critério de Vagas:** Bloqueio imediato ao atingir lotação ou geração de lista de espera?
* [ ] **Cancelamento e Trancamento:** Prazos e regras para liberação de vaga.
* [ ] **Matrículas Múltiplas:** Um aluno pode se matricular em mais de uma oficina simultânea?

#### 3. Requisitos Não Funcionais e LGPD (Segurança e Operação)
* [ ] **Controle de Acesso:** Necessidade de login com diferentes perfis (ex: Administrador vs Atendente)?
* [ ] **Proteção de Dados (LGPD):** Termo de consentimento para tratamento dos dados do aluno.
* [ ] **Dispositivos:** O sistema será acessado principalmente em computadores ou tablets/celulares?

---

### Bloco D: Identidade Visual e Experiência do Usuário (10 min)
* [ ] Definição das cores oficiais da instituição e logotipo a ser aplicado na interface.
* [ ] Preferência de layout: foco em simplicidade e alto contraste para operadores de balcão.

---

## 4. Próximos Passos
1. Consolidação da ata da reunião com os requisitos priorizados.
2. Refinamento do protótipo com os ajustes acordados.
3. Apresentação do cronograma de entregas e testes com a equipe.
