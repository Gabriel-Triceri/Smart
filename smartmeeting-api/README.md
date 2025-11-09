# 🗓️ SmartMeeting API - Sistema de Gestão de Reuniões

## 📋 Descrição

O SmartMeeting API é um sistema inteligente para a gestão de reuniões presenciais, focado em otimizar o tempo, controlar o acesso e gerenciar tarefas de forma eficiente. Desenvolvido com as melhores práticas de mercado, utilizando Java 17 e o ecossistema Spring Boot.

## ✨ Funcionalidades Principais

- **Gestão Completa:** CRUD para Pessoas, Salas, Reuniões e Tarefas.
- **Controle de Acesso:** Registro de presença em reuniões.
- **Gestão de Tarefas:** Acompanhamento de tarefas, com status de conclusão.
- **Notificações:** Envio de e-mails para convites, lembretes e alertas.
- **Agendamento:** Tarefas automáticas para verificação de pendências e envio de alertas.
- **Dashboard e Métricas:** Fornece um conjunto abrangente de métricas e estatísticas sobre o uso do sistema, incluindo uso de salas, taxas de presença e produtividade.
- **Relatórios Avançados:** Geração de relatórios sobre o uso de salas, conclusão de tarefas, presença e produtividade, com filtros de data e exportação para CSV.
- **Segurança Robusta:** Autenticação e autorização utilizando JWT e um modelo flexível de controle de acesso baseado em papéis e permissões (RBAC), com endpoints para gerenciamento.
- **Tratamento de Erros Padronizado:** Respostas de erro claras e consistentes para o cliente da API.
- **Frontend JavaFX:** Interface gráfica para interação com a API.

## 🔧 Tecnologias Utilizadas

- **Java 17**
- **Spring Boot 3.3**
- **Spring Web**
- **Spring Data JPA**
- **Spring Security** (com JWT)
- **Spring Mail**
- **Jakarta Validation** (Bean Validation)
- **H2 Database** (para desenvolvimento)
- **Lombok**
- **Swagger/OpenAPI** (para documentação da API)
- **Apache Commons Text** (para escape de XSS)
- **JavaFX 21**
- **OkHttp** (para cliente HTTP no frontend)
- **Jackson** (para JSON no frontend)

## 🏗️ Estrutura do Projeto

O projeto é um Maven multi-módulo, dividido em `backend` e `frontend`:

- **`backend`:** Contém a API Spring Boot, seguindo uma arquitetura em camadas:
    - `config`: Configurações da aplicação, como segurança, documentação e seeding de dados.
    - `controller`: Responsável por expor a API REST, receber as requisições e retornar as respostas.
    - `dto`: Objetos de Transferência de Dados, utilizados para a comunicação entre o cliente e a API.
    - `enums`: Tipos enumerados utilizados no sistema.
    - `exception`: Exceções personalizadas para tratamento de erros específicos da aplicação.
    - `model`: Entidades JPA que representam as tabelas do banco de dados (`Pessoa`, `Role`, `Permission`, etc.).
    - `repository`: Camada de acesso aos dados, utilizando Spring Data JPA.
    - `security`: Classes relacionadas à autenticação e autorização com Spring Security e JWT.
    - `service`: Contém a lógica de negócio da aplicação.
- **`frontend`:** Contém a aplicação JavaFX, seguindo uma arquitetura MVC.

## 🚀 Como Executar o Projeto

... (seções de execução e configuração permanecem as mesmas) ...

## 🔐 Segurança e Controle de Acesso (RBAC)

A segurança da API é garantida por um sistema robusto de **Controle de Acesso Baseado em Papéis (RBAC)**, implementado com Spring Security e JWT.

### Modelo de Dados de Segurança

O controle de acesso é baseado em três entidades principais:

1.  **`Permission` (Permissão):** Representa uma ação atômica no sistema, como `CRIAR_REUNIAO` ou `GERENCIAR_USUARIOS`.
2.  **`Role` (Papel):** Um agrupamento de permissões. Por exemplo, o papel `ORGANIZADOR` agrupa as permissões necessárias para criar e gerenciar reuniões.
3.  **`Pessoa` (Usuário):** Um usuário do sistema, que pode ter um ou mais papéis associados.

Essa estrutura permite uma gestão de permissões extremamente flexível e granular, que pode ser administrada via API.

### Mecanismo de Autorização

1.  **Autenticação:** O usuário se autentica via `POST /auth/login` e recebe um token JWT.
2.  **Coleta de Autoridades:** A cada requisição, o token é validado e o sistema carrega o `UserPrincipal`. Neste momento, todos os papéis e permissões do usuário são coletados e transformados em `GrantedAuthority` para o Spring Security.
    - **Papéis** são prefixados com `ROLE_` (ex: `ROLE_ADMIN`).
    - **Permissões** são usadas diretamente (ex: `CRIAR_REUNIAO`).
3.  **Verificação de Acesso:** Nos controllers, a anotação `@PreAuthorize` verifica se o usuário autenticado possui a `role` ou `authority` necessária para executar a ação.
    - `hasRole('ADMIN')` verifica se o usuário tem o papel de Administrador.
    - `hasAuthority('CRIAR_REUNIAO')` verifica se o usuário tem a permissão específica para criar uma reunião.

### Papéis e Permissões Padrão

O sistema é inicializado com os seguintes papéis e permissões:

-   **Papel `ADMIN`:** Possui todas as permissões do sistema.
-   **Papel `ORGANIZADOR`:**
    - `CRIAR_REUNIAO`
    - `EDITAR_REUNIAO`
    - `VISUALIZAR_REUNIAO`
-   **Papel `PARTICIPANTE` / `CONVIDADO`:**
    - `VISUALIZAR_REUNIAO`

### Outros Mecanismos de Segurança

- **Endpoints Públicos:** Acesso livre para `/auth/**`, documentação da API (`/swagger-ui/**`) e console H2 (`/h2-console/**`).
- **Gerenciamento de Senhas:** Utiliza `DelegatingPasswordEncoder`, permitindo senhas em `{noop}` para testes e `BCrypt` para produção.
- **CORS:** Configurado para permitir requisições de origens específicas (ex: `http://localhost:3000`).

## 🧪 Testes

... (seção de testes permanece a mesma) ...

## 📊 Dashboard e Métricas

... (seção de dashboard permanece a mesma) ...

## 👤 Usuários de exemplo (semente de dados)

... (seção de usuários permanece a mesma) ...

## 🚨 Tratamento de Erros Padronizado

... (seção de tratamento de erros permanece a mesma) ...

## 📚 Documentação da API (Swagger)

... (seção de documentação permanece a mesma) ...

## 🌐 Endpoints da API

*Todos os endpoints não marcados como públicos requerem autenticação.*

### Autenticação (Público)
- `POST /auth/login`: Autentica um usuário e retorna um token JWT.
- `POST /auth/registro`: Registra um novo usuário.

### Gerenciamento de Segurança (Requer: Papel `ADMIN`)
- `GET /roles`, `POST /roles`, `PUT /roles/{id}`, `DELETE /roles/{id}`: Gerenciamento completo de papéis.
- `POST /roles/{id}/permissions/{permissionId}`: Associa uma permissão a um papel.
- `DELETE /roles/{id}/permissions/{permissionId}`: Desassocia uma permissão de um papel.
- `GET /permissions`, `POST /permissions`, `PUT /permissions/{id}`, `DELETE /permissions/{id}`: Gerenciamento completo de permissões.

### Pessoas
- `GET /pessoas`: Lista todas as pessoas.
- `GET /pessoas/{id}`: Busca uma pessoa específica por ID.
- `POST /pessoas`: Cria uma nova pessoa.
- `PUT /pessoas/{id}`: Atualiza uma pessoa existente.
- `DELETE /pessoas/{id}`: Remove uma pessoa. **(Requer: Papel `ADMIN`)**
- `GET /pessoas/{id}/roles`: Lista os papéis de uma pessoa. **(Requer: Papel `ADMIN`)**
- `POST /pessoas/{id}/roles/{roleId}`: Adiciona um papel a uma pessoa. **(Requer: Papel `ADMIN`)**
- `DELETE /pessoas/{id}/roles/{roleId}`: Remove um papel de uma pessoa. **(Requer: Papel `ADMIN`)**

### Salas
- `GET /salas`: Lista todas as salas.
- `GET /salas/{id}`: Busca uma sala específica por ID.
- `POST /salas`: Cria uma nova sala.
- `PUT /salas/{id}`: Atualiza uma sala existente.
- `DELETE /salas/{id}`: Remove uma sala.

### Reuniões
- `GET /reunioes`: Lista todas as reuniões.
- `GET /reunioes/{id}`: Busca uma reunião específica por ID.
- `POST /reunioes`: Cria uma nova reunião. **(Requer: Permissão `CRIAR_REUNIAO`)**
- `PUT /reunioes/{id}`: Atualiza uma reunião existente.
- `POST /reunioes/{id}/encerrar`: Encerra uma reunião.
- `DELETE /reunioes/{id}`: Remove uma reunião.

### Tarefas
- `GET /tarefas`: Lista todas as tarefas.
- `GET /tarefas/{id}`: Busca uma tarefa específica por ID.
- `POST /tarefas`: Cria uma nova tarefa.
- `PUT /tarefas/{id}`: Atualiza uma tarefa existente.
- `DELETE /tarefas/{id}`: Remove uma tarefa.
- `GET /tarefas/reuniao/{idReuniao}/pendencias`: Verifica tarefas pendentes para uma reunião específica.

### Presenças
- `POST /reunioes/{id}/presenca`: Registra a presença de um participante em uma reunião.

### Notificações
- `GET /notificacoes`: Lista todas as notificações.
- `GET /notificacoes/{id}`: Busca uma notificação específica por ID.
- `POST /notificacoes`: Cria uma nova notificação.
- `PUT /notificacoes/{id}`: Atualiza uma notificação existente.
- `DELETE /notificacoes/{id}`: Remove uma notificação.

### Dashboard
- `GET /dashboard`: Retorna o dashboard completo com todas as métricas.
- `GET /dashboard/estatisticas-gerais`: Retorna as estatísticas gerais.
- `GET /dashboard/uso-salas`: Retorna as métricas de uso de salas.
- `GET /dashboard/taxas-presenca`: Retorna as taxas de presença dos participantes.
- `GET /dashboard/produtividade-organizadores`: Retorna as métricas de produtividade dos organizadores.
- `GET /dashboard/metricas-reunioes`: Retorna as métricas gerais de reuniões.

### Relatórios
- `GET /relatorios/reunioes-por-sala`: Relatório de reuniões por sala.
- `GET /relatorios/reunioes-por-sala/csv`: Exporta relatório de reuniões por sala para CSV.
- `GET /relatorios/tarefas-concluidas`: Relatório de tarefas concluídas.
- `GET /relatorios/tarefas-concluidas/csv`: Exporta relatório de tarefas concluídas para CSV.
- `GET /relatorios/presenca-pessoa`: Relatório de presenças por pessoa.
- `GET /relatorios/duracao-reunioes`: Relatório de duração das reuniões.
- `GET /relatorios/duracao-reunioes/csv`: Exporta relatório de duração das reuniões para CSV.
- `GET /relatorios/produtividade-participante`: Relatório de produtividade por participante.
- `GET /relatorios/produtividade-participante/csv`: Exporta relatório de produtividade por participante para CSV.

### Calendário (iCal)
- `GET /calendario/reuniao/{id}/ical`: Exporta uma reunião específica para iCal.
- `GET /calendario/pessoa/{pessoaId}/ical`: Exporta reuniões de uma pessoa para iCal.
- `GET /calendario/todas/ical`: Exporta todas as reuniões para iCal.

## 🚧 Próximos Passos (Roadmap)

... (seção de próximos passos permanece a mesma) ...
