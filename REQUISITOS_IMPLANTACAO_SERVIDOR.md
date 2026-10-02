REQUISITOS DE SERVIDOR E HOSPEDAGEM
Sistema de Gestão de Matrículas — Escolas Livres de Santo André

1. RESUMO DO SISTEMA
O sistema é uma ferramenta de uso ESTRITAMENTE ADMINISTRATIVO (Backoffice da Secretaria de Cultura e das 4 Escolas Livres: Teatro, Dança, Cinema e Vídeo, e Iniciação Artística).

Importante sobre o fluxo:
- As inscrições públicas iniciais dos munícipes continuam sendo feitas pelos sistemas externos da própria Prefeitura (ex: Cultura AZ / formulários municipais).
- O nosso sistema entra na etapa seguinte: da MATRÍCULA EM DIANTE (importação dos inscritos, formação de turmas, efetivação de matrículas, controle de vagas, gestão da fila de suplência e prontuário do estudante).
- Apenas usuários com login institucional (Coordenação Geral e Encarregadas das Escolas) acessam o sistema. Não há área aberta ao público.

---

2. CONFIGURAÇÃO DA MÁQUINA (SERVIDOR)
Como o sistema é exclusivo para a equipe interna das secretarias (cerca de 20 a 50 usuários simultâneos no máximo) e não receberá picos de milhares de munícipes acessando juntos, o servidor pode ser muito mais leve e econômico:

- Sistema Operacional: Linux (Ubuntu Server 22.04 LTS ou Debian 12).
- Processador (CPU): 2 a 4 núcleos (vCPUs).
- Memória RAM: 4 GB (8 GB caso o banco de dados PostgreSQL rode na mesma máquina com muita folga).
- Armazenamento: 30 a 40 GB em disco SSD.

Nota: Se a TI da Prefeitura já disponibilizar um servidor de banco de dados PostgreSQL corporativo na rede, uma máquina virtual de apenas 4 GB de RAM atende perfeitamente a aplicação.

---

3. PROGRAMAS NECESSÁRIOS NO SERVIDOR

Opção Recomendada (via Docker):
A forma mais prática para subir e atualizar o sistema sem instalar dependências no sistema operacional:
- Docker Engine (versão 24 ou superior)
- Docker Compose (versão 2 ou superior)
- Git (para atualizações do código)

Opção Alternativa (Instalação Direta no Linux):
Caso a política do datacenter municipal não utilize containers:
- Java 21 (OpenJDK 21)
- Node.js 20 LTS (com npm)
- PostgreSQL 16
- Nginx (para funcionar como proxy reverso e gerenciar o certificado HTTPS)
- PM2 (para manter a interface web rodando como serviço)

---

4. REDE, SEGURANÇA E ACESSO

Como é um sistema 100% administrativo, a TI pode optar por maior isolamento de segurança:

Modelo de Publicação:
- Opção A (Intranet / VPN): Acesso liberado apenas dentro da rede da prefeitura ou via VPN municipal para as encarregadas.
- Opção B (Acesso Web Protegido): Publicado na internet via HTTPS na porta 443, com todas as telas blindadas por login e senha institucionais (com token JWT de sessão).

Portas:
- Porta 80 e 443 (HTTP/HTTPS): para acesso das encarregadas pelo navegador.
- Porta 22 (SSH): restrita aos técnicos da TI da prefeitura para manutenção.
- Portas 3000 (Frontend), 8080 (Backend) e 5432 (Banco): rodam exclusivamente em rede local interna, sem exposição externa.

---

5. ENDEREÇO NA INTERNET E CERTIFICADO DIGITAL
- Endereço / Subdomínio: Um endereço da rede municipal apontando para o servidor.
  * Exemplos: matriculas.santoandre.sp.gov.br ou gestaocultura.santoandre.sp.gov.br
- Certificado HTTPS:
  * Certificado institucional da própria prefeitura instalado no Nginx.
  * Ou certificado gratuito via Let's Encrypt (Certbot), com renovação automática.

---

6. SERVIÇO DE E-MAIL (RECUPERAÇÃO DE SENHA)
O sistema dispara e-mails com código de 7 dígitos para redefinição de senha caso uma encarregada ou administrador esqueça a senha de acesso:
- O sistema já possui integração nativa com o serviço Resend.
- Para entrega direta sem filtros de spam, a TI só precisará configurar 3 registros de DNS (SPF, DKIM e DMARC) no domínio municipal.

---

7. BACKUP DO BANCO DE DADOS
Mesmo sendo de uso interno, o sistema guarda dados de munícipes e históricos de matrículas:
- Rotina automatizada noturna via script rodando comando pg_dump compactado (ex: às 03h00).
- Armazenamento em diretório protegido, mantendo retenção de 30 dias para segurança.

---

8. DADOS DE CONFIGURAÇÃO (ARQUIVO .ENV)
Arquivo simples criado no servidor para ligar o sistema:
- Endereço, usuário e senha do banco PostgreSQL criado pela TI
- Chave secreta de autenticação do sistema
- Chave de envio de e-mails (Resend)
- Endereço web oficial definido pela prefeitura
