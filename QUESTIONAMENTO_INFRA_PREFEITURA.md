# Nota Técnica: Infraestrutura e Hospedagem
**Projeto:** SIGMA – Sistema de Gestão de Matrículas (Escolas Livres de Santo André)  
**De:** Equipe de Desenvolvimento  
**Para:** DTI / Infraestrutura – Prefeitura Municipal de Santo André  
**Assunto:** Definição de ambiente para hospedagem da aplicação e banco de dados  
**Data:** Setembro / 2026  

---

## 1. Contexto do Projeto

Estamos finalizando o desenvolvimento do sistema que vai centralizar e digitalizar o processo de inscrições e matrículas das 4 Escolas Livres da Secretaria de Cultura:
- **ELT** (Teatro)
- **ELD** (Dança)
- **ELCV** (Cinema e Vídeo)
- **ELIA** (Iniciação Artística)

Atualmente esse fluxo depende de formulários descentralizados, Cultura AZ e preenchimento manual em planilhas. O sistema foi desenvolvido para ser leve e seguro, mantendo os dados dos munícipes (incluindo crianças e responsáveis) dentro da própria infraestrutura da Prefeitura, em total conformidade com a LGPD.

Este documento tem como objetivo alinhar com a equipe de Infraestrutura/Redes os pré-requisitos para provisionar o ambiente de homologação e produção.

---

## 2. Como a aplicação roda

A solução foi projetada de forma modular e stateless (não grava arquivos em disco local além de logs transitórios):

```
[Munícipe / Internet]           [Secretarias das Escolas / Intranet]
         │                                       │
         ▼                                       ▼
┌─────────────────────────────────────────────────────────────────┐
│        Reverse Proxy / Firewall da Prefeitura (Nginx / F5)       │
│                  Terminação SSL / HTTPS (:443)                  │
└────────────────┬───────────────────────────────┬────────────────┘
                 │ (:80/:3000)                   │ (:8080)
                 ▼                               ▼
      ┌───────────────────────┐       ┌───────────────────────┐
      │   Frontend Web UI     │       │   API Backend         │
      │   Next.js 16 (Node)   │──────▶│   Java 21 / Spring 3  │
      └───────────────────────┘       └──────────┬────────────┘
                                                 │ (:5432)
                                                 ▼
                                      ┌───────────────────────┐
                                      │   PostgreSQL 16+      │
                                      └───────────────────────┘
```

- **Frontend:** Next.js (Node.js 20+). Serve as telas do cidadão e das secretarias.
- **Backend:** Java 21 com Spring Boot 3. API REST protegida por tokens JWT.
- **Banco de Dados:** PostgreSQL 16 (charset `UTF-8`).

---

## 3. Sugestão de Dimensionamento de Servidor

Buscamos manter o consumo de recursos no menor patamar viável para não onerar o pool de VMs da prefeitura.

### Cenário Recomendado (Produção)
Para comportar os primeiros dias de abertura de editais (picos simultâneos de acesso de munícipes):

- **Ambiente:** 1 VM Linux (Ubuntu 22.04 LTS ou Debian 12)
- **Processamento:** 4 vCPUs
- **Memória RAM:** 8 GB
  - *Distribuição estimada:* 3 GB para a JVM do Backend, 1.5 GB para o Node.js, 2 GB para o PostgreSQL (se local), 1.5 GB para o SO e cache de disco.
- **Disco:** 40 GB a 60 GB SSD (com partição de logs monitorada).

> *Observação:* Se a TI já possuir um cluster de PostgreSQL gerenciado para as secretarias, a VM precisa apenas de **4 GB a 6 GB de RAM**, pois o banco roda fora dela.

---

## 4. Pontos de Alinhamento com a TI (Checklist Prático)

Para podermos preparar os scripts de subida e os pacotes de entrega, precisamos definir os seguintes pontos com vocês:

### A. Estratégia de Deploy
1. **Podemos subir tudo via Docker Compose?**  
   Hoje a aplicação já possui `Dockerfile` e `docker-compose.yml` prontos. Subir via Docker isola versões de runtime (Java 21 e Node 20) e facilita eventuais migrações de host.
2. Caso a política da DTI não permita containers na VM: vocês preferem que a gente entregue o `.jar` (para rodar como serviço `systemd`) e a pasta do Next.js?

### B. Banco de Dados e Rotina de Cópia
3. **Instância de PostgreSQL:** Vocês preferem criar uma base e usuário em um servidor PostgreSQL corporativo que vocês já administram, ou preferem que o PostgreSQL suba isolado dentro da VM da aplicação via container?
4. **Política de Backups:** Como funciona a janela de rotina da TI? Precisamos agendar um `cron` interno para despejo de dump noturno (`pg_dump`) ou o próprio backup corporativo da VM/DBA já contempla snapshot diário com retenção?

### C. Publicação Externa, Domínio e Certificado
5. **Subdomínio:** Qual nome podemos reservar no DNS municipal?  
   *Sugestões:* `matriculas.cultura.santoandre.sp.gov.br` ou `escolasculturais.santoandre.sp.gov.br`.
6. **HTTPS / Certificado:** A terminação SSL é feita no proxy reverso/balanceador central da Prefeitura (com certificado Wildcard institucional), ou devemos configurar a renovação automática via Let's Encrypt diretamente na máquina?
7. **Liberação de Portas:** O portal precisa responder publicamente na porta 443 (HTTPS) para que munícipes consigam se inscrever de casa. O acesso administrativo pode ficar restrito à VPN ou aberto sob autenticação?

### D. Disparo de Notificações (E-mail)
8. **Relay de E-mail (SMTP):** O sistema precisa avisar o aluno quando ele for chamado da lista de espera ou quando faltar a 3 aulas consecutivas. A prefeitura possui um servidor de relay SMTP corporativo disponível para configurarmos na aplicação?

### E. Acesso para Manutenção e Atualizações
9. **Como a equipe poderá aplicar correções e novas versões?**
   - Opção 1: Acesso SSH pontual via VPN da prefeitura.
   - Opção 2: Runner local / webhook acionado pelo Git.
   - Opção 3: Entrega de release versionada (pacotes compilados) para o operador da prefeitura subir.

---

## 5. Próximos Passos Sugeridos

1. Agendamento de uma breve conversa técnica (15 a 20 min) com o analista responsável pela infraestrutura para bater os itens da seção 4.
2. Criação da VM de **Homologação** para fazermos o primeiro teste de carga e validação das portas.
3. Criação da base de dados e emissão da URL interna/externa de teste.

---

*Documento elaborado para apoiar a transição digital dos serviços culturais do município de Santo André.*
