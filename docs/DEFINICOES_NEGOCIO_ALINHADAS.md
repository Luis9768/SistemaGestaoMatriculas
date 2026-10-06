# Definições de Negócio Alinhadas — SIGMA Santo André
**Sistema Integrado de Gestão de Matrículas e Frequência**  
**Instituição:** Escolas Livres de Santo André (ELT, ELD, ELCV, ELIA) • Secretaria de Cultura  
**Status:** Alinhado e Implementado no Sistema  

---

## 📋 Resumo das Decisões de Regra de Negócio

### 1. Processo Seletivo das Formações (2 a 3 anos)
- **Como funciona**: A seleção dos alunos para as Formações de longa duração é realizada internamente através de **processo avaliativo da banca de professores**.
- **Comportamento no Sistema**: O sistema contempla **exclusivamente o pós-seleção**. A secretaria insere no sistema (manualmente ou via importação de planilha) apenas os alunos já aprovados. A matrícula já ingressa diretamente como `CONFIRMADA` (Matriculado), sem necessidade de etapas intermediárias de teste/prova no software.

---

### 2. Convocação de Suplentes e Prazo Limite
- **Canais de Convocação**: A secretaria convoca os alunos suplentes da Lista de Espera através de **E-mail e WhatsApp**.
- **Prazo Limite para Chamar Suplentes**:
  - Prazo estipulado padrão no sistema: **até 2 meses (60 dias)** após o início das aulas.
  - O prazo permanece flexível e configurável por turma (caso especial da **ELT**, que possui processo seletivo no meio do semestre).
  - Após esse período, o sistema bloqueia chamadas tardias para proteger o aluno do prejuízo de conteúdo pedagógico já ministrado.
- **Ferramentas no Sistema**:
  - Botão de convocação direta por WhatsApp com mensagem oficial pré-formatada.
  - Botão de convocação via e-mail (`mailto:`).
  - Botão de promoção de suplente: `Promover`, que transfere o candidato da `FILA_ESPERA` para `CONFIRMADA` e atualiza a contagem de vagas.

---

### 3. Frequência e Regra das 3 Faltas
- **Desligamento Não Automático**: O desligamento por 3 faltas consecutivas injustificadas **NÃO é automático**. A coordenação e secretaria realizam contato prévio com o munícipe antes de qualquer perda de vaga.
- **Tolerância por Escola**: Conforme a escola, sem regra rígida única.
- **Comportamento no Sistema**:
  - O acúmulo de 3 faltas consecutivas ativa um **Alerta Pedagógico de Evasão**.
  - O aluno permanece com status ativo até intervenção humana.
  - Ações rápidas disponibilizadas no perfil e no dashboard da turma:
    - 💬 **WhatsApp**: Dispara mensagem de acolhimento pedagógico e verificação de apoio.
    - ✉️ **E-mail**: Dispara comunicado formal de frequência.
    - ❌ **Desligar Aluno (Após Contato Sem Retorno)**: Endpoint `@PatchMapping("/{id}/desligar-faltas")` acionado manualmente pela secretaria, liberando a vaga para a fila de espera.

---

### 4. Menores de Idade, Documentos e Residência
- **Termos de Responsabilidade para Menores**: Mantidos no **formato físico em papel**, assinados pelo responsável legal e arquivados na secretaria da escola.
  - O sistema registra e valida todos os dados do responsável (Nome, CPF com máscara, telefone, grau de parentesco).
  - Exibe no prontuário o selo: `📄 Termo Físico em Papel (Arquivado)`.
  - O sistema oferece botão de impressão em PDF para gerar a ficha/termo para assinatura física.
- **Região de Residência**: Inscrições **abertas a qualquer pessoa, independente da região** (Santo André, cidades vizinhas do Grande ABC, capital ou outras localidades). Sem trava restritiva de CEP.

---

### 5. Matrículas Simultâneas
- **Cursos Concomitantes**: Sem limite de inscrição. Um mesmo munícipe pode cursar quantos cursos desejar simultaneamente (ex: Formação em Cinema na ELCV e Oficina de Dança na ELD).
- **Comportamento no Sistema**: O CPF do aluno é compartilhado globalmente entre as escolas, permitindo que a secretaria visualize na aba "Cursos Atuais" do prontuário todo o histórico em tempo real de cada matrícula e assiduidade por turma.
