# Termo Geral de Privacidade e Proteção de Dados Pessoais (LGPD Geral)
### Prefeitura Municipal de Santo André — Secretaria de Cultura
### Sistema de Gestão de Matrículas (SIGMA)

---

## 1. Identificação do Controlador e Encarregado de Dados (DPO)

- **Controlador dos Dados:**  
  Prefeitura Municipal de Santo André — CNPJ nº 46.522.942/0001-30  
  Secretaria de Cultura — Praça IV Centenário, s/nº, Prédio Executivo, Santo André/SP.
- **Encarregado pelo Tratamento de Dados Pessoais (DPO):**  
  Encarregado de Proteção de Dados da Prefeitura Municipal de Santo André  
  Canal oficial de atendimento: `privacidade.cultura@santoandre.sp.gov.br`  
  Portal da Transparência e Ouvidoria Municipal: `https://www.santoandre.sp.gov.br`

---

## 2. Finalidade e Escopo da Plataforma SIGMA

O **SIGMA (Sistema de Gestão de Matrículas)** tem por objetivo institucional e exclusivo operacionalizar o processo de inscrição, seleção, matrícula, enturmação, registro de presença/frequência e emissão de certificados das **4 Escolas Livres de Cultura de Santo André**:
1. **ELT** — Escola Livre de Teatro;
2. **ELD** — Escola Livre de Dança;
3. **ELCV** — Escola Livre de Cinema e Vídeo;
4. **ELIA** — Escola Livre de Iniciação Artística (Público Infantil e Juvenil).

O tratamento de dados é realizado no estrito cumprimento da finalidade pública e pedagógica das escolas.

---

## 3. Bases Legais do Tratamento (Art. 7º da Lei Federal nº 13.709/2018)

O tratamento de dados pessoais no SIGMA fundamenta-se nas seguintes hipóteses legais da LGPD:
- **Art. 7º, Inciso III — Cumprimento de Políticas Públicas:** Para o planejamento, execução, controle de vagas, assiduidade e certificação dos programas públicos de formação cultural mantidos pelo Município de Santo André;
- **Art. 7º, Inciso I — Consentimento do Titular:** Mediante manifestação livre, informada e inequívoca do titular ou de seu representante legal no ato de inscrição e matrícula;
- **Art. 7º, Inciso II — Cumprimento de Obrigação Legal ou Regulatória:** Atendimento a exigências do Tribunal de Contas, órgãos de controle e diretrizes da administração pública municipal.

---

## 4. Categorias de Dados Coletados no SIGMA

### 4.1. Dados de Munícipes / Alunos:
- Nome completo;
- Cadastro de Pessoas Físicas (CPF);
- Endereço de e-mail institucional ou pessoal;
- Telefone / WhatsApp para comunicados da secretaria;
- Data de nascimento (para validação de faixa etária e menoridade);
- Histórico acadêmico de turmas, registros de presenças, faltas e certificação.

### 4.2. Dados de Pais ou Responsáveis Legais (Obrigatório para Menores de 18 anos):
- Nome completo do responsável legal;
- CPF do responsável legal;
- Grau de parentesco (mãe, pai, avô/avó, tutor legal);
- Telefone e e-mail para contato pedagógico e de emergência.

### 4.3. Dados de Acesso dos Servidores da Secretaria:
- E-mail institucional `@santoandre.sp.gov.br`;
- Perfil de acesso administrativo (*ROLE_ADMIN* para Coordenação Geral ou *ROLE_ENCARREGADA* vinculada a uma escola específica);
- Credenciais criptografadas e logs de operações.

---

## 5. Medidas de Segurança da Informação e Salvaguardas Técnicas

A Secretaria de Cultura e o Departamento de TI da Prefeitura adotam padrões rígidos de segurança para mitigar qualquer risco de vazamento ou acesso indevido:
1. **Autenticação Segura JWT (JSON Web Tokens):** Todo acesso ao banco de dados e APIs exige cabeçalho criptografado com expiração automática de sessão;
2. **Criptografia de Senhas com BCrypt:** Senhas de operadores são armazenadas com hash unidirecional irreversível de alta entropia;
3. **Controle de Acesso Baseado em Papéis (RBAC):** Encarregadas de uma escola não possuem permissão para modificar dados ou turmas de outras escolas;
4. **Mascaramento Automático de Dados Sensíveis:** Em telas de visualização e dashboards, números de CPF são exibidos mascarados (`123.***.***-09`) para impedir captura visual indevida em reuniões ou compartilhamento de tela;
5. **Proteção contra Acesso Anônimo (HTTP 401/403):** Endpoints de relatórios, presenças e cadastros de alunos recusam automaticamente conexões sem autenticação institucional válida;
6. **Banco de Dados Relacional Seguro (PostgreSQL 16):** Ambientes locais e de produção utilizam isolamento de rede, backups diários e permissões estritas de usuário.

---

## 6. Compartilhamento de Dados

A Prefeitura Municipal de Santo André **NÃO comercializa, NÃO licencia e NÃO compartilha** os dados pessoais cadastrados no SIGMA com empresas de publicidade, instituições privadas ou terceiros não autorizados.

O compartilhamento poderá ocorrer estritamente quando:
- Exigido por lei, requisição judicial ou determinação do Ministério Público / Tribunal de Contas;
- Entre secretarias municipais para fins de políticas públicas integradas da Prefeitura de Santo André, resguardadas as diretrizes da LGPD.

---

## 7. Prazo de Armazenamento e Retenção

- **Dados de Inscrição em Seleção (não matriculados):** Retidos pelo período de vigência do edital e chamada de suplência (até 1 ano), sendo arquivados após o término do ciclo;
- **Registros Escolares e Frequência de Matriculados:** Mantidos como **arquivo permanente da Secretaria de Cultura** para comprovação de histórico escolar, expedição de declarações e segundas vias de certificados de conclusão;
- **Logs de Auditoria:** Mantidos pelo prazo mínimo legal de 6 meses (Marco Civil da Internet, Lei nº 12.965/2014).

---

## 8. Direitos dos Titulares de Dados (Art. 18 da LGPD)

O munícipe ou seu responsável legal tem o direito de, a qualquer momento, mediante requisição:
1. **Confirmar** a existência de tratamento de seus dados na plataforma;
2. **Acessar** integralmente seus dados escolares cadastrados;
3. **Corrigir** dados incompletos, inexatos ou desatualizados (ex: alteração de telefone ou e-mail);
4. **Solicitar** informações sobre com quais entidades públicas seus dados foram compartilhados;
5. **Revogar** o consentimento de inscrições em andamento (quando não houver dever legal de retenção do histórico escolar).

As solicitações devem ser protocoladas junto à Secretaria de Cultura de Santo André ou pela Ouvidoria Municipal.

---

## 9. Atualizações deste Termo

Este Termo Geral poderá ser revisado periodicamente para manter plena conformidade com as diretrizes da Autoridade Nacional de Proteção de Dados (ANPD) e normativas municipais vigentes.
