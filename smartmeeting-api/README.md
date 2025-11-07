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
- **Segurança Robusta:** Autenticação e autorização utilizando JWT e controle de acesso baseado em papéis e permissões.
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
    - `config`: Configurações da aplicação, como segurança e documentação.
    - `controller`: Responsável por expor a API REST, receber as requisições e retornar as respostas.
    - `dto`: Objetos de Transferência de Dados, utilizados para a comunicação entre o cliente e a API.
    - `enums`: Tipos enumerados utilizados no sistema.
    - `exception`: Exceções personalizadas para tratamento de erros específicos da aplicação.
    - `model`: Entidades JPA que representam as tabelas do banco de dados, com relacionamentos bidirecionais.
    - `repository`: Camada de acesso aos dados, utilizando Spring Data JPA.
    - `security`: Classes relacionadas à autenticação e autorização com Spring Security e JWT.
    - `service`: Contém a lógica de negócio da aplicação, organizada em sub-pacotes:
        - `business`: Para a lógica de negócio principal (CRUD, regras de negócio).
        - `scheduling`: Para serviços de agendamento/jobs.
        - `export`: Para serviços de exportação de dados (CSV, iCal).
        - `email`: Para serviços de notificação por e-mail.
            - `template`: Sub-pacote para templates de e-mail.
- **`frontend`:** Contém a aplicação JavaFX, seguindo uma arquitetura MVC:
    - `controller`: Controladores para as telas FXML.
    - `service`: Serviços para comunicação com o backend.
    - `resources`: Arquivos FXML e CSS para a interface gráfica.

## 🚀 Como Executar o Projeto

### Pré-requisitos

- JDK 17 ou superior
- Maven 3.8 ou superior

### Configuração

1.  **Clone o repositório:**
    ```bash
    git clone https://github.com/seu-usuario/smartmeeting-api.git
    cd smartmeeting-api
    ```

2.  **Configure as variáveis de ambiente:**

    No arquivo `backend/src/main/resources/application.properties`, configure as seguintes propriedades:

    - **Segredo do JWT:**
      ```properties
      # É fundamental gerar uma chave segura e única em Base64 (com pelo menos 64 bytes)
      app.jwt.secret=SUA_CHAVE_SECRETA_EM_BASE64
      ```

    - **Configuração de E-mail (Mailtrap para teste):**
      ```properties
      spring.mail.host=sandbox.smtp.mailtrap.io
      spring.mail.port=2525
      spring.mail.username=SEU_USUARIO_MAILTRAP
      spring.mail.password=SUA_SENHA_MAILTRAP
      ```

    Opcionalmente, ajuste a URL do H2 e a porta, se necessário:
    ```properties
    # Banco H2 e porta do servidor (defaults atuais)
    spring.datasource.url=jdbc:h2:file:./data/smartmeeting;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE
    server.port=8080
    ```

3. **Configure o Frontend (URL da API):**

   No arquivo `frontend/src/main/resources/application.properties`, ajuste a URL base da API, se diferente do padrão:
   ```properties
   api.baseUrl=http://localhost:8080
   ```

### Execução

1.  **Compile o projeto:** Na raiz do projeto, execute:
    ```bash
    # Linux/macOS
    ./mvnw clean install
    # Windows
    mvnw.cmd clean install
    ```

2.  **Execute o Backend:** Em um terminal, na pasta `backend`, execute:
    ```bash
    # Linux/macOS (a partir da pasta backend)
    ../mvnw spring-boot:run
    # Windows (a partir da pasta backend)
    ..\mvnw.cmd spring-boot:run
    ```

3.  **Execute o Frontend:** Em outro terminal, na pasta `frontend`, execute:
    ```bash
    # Linux/macOS (a partir da pasta frontend)
    ../mvnw javafx:run
    # Windows (a partir da pasta frontend)
    ..\mvnw.cmd javafx:run
    ```

## 🔐 Segurança

A segurança da API é garantida por um sistema robusto de autenticação e autorização.

- **Autenticação via JWT:** O acesso aos endpoints protegidos requer um token JWT válido, que deve ser enviado no cabeçalho `Authorization`.

- **Autorização Granular:** A autorização é controlada em nível de método usando a anotação `@PreAuthorize`. O sistema utiliza uma combinação de:
    - **Papéis (Roles):** Grupos de permissões amplas, como `hasRole('ADMIN')`. Um papel é uma permissão que começa com o prefixo `ROLE_`.
    - **Permissões (Authorities):** Ações específicas que um usuário pode realizar, como `hasAuthority('CRIAR_REUNIAO')`.

- **Endpoints Públicos:** Os seguintes endpoints são acessíveis sem autenticação:
    - `/auth/**` (login e registro)
    - `/v3/api-docs/**` e `/swagger-ui/**` (documentação da API)
    - `/h2-console/**` (console do banco de dados de desenvolvimento)

- **Endpoints Protegidos:** Todos os outros endpoints requerem, no mínimo, um token de autenticação válido. Endpoints que modificam dados sensíveis ou realizam ações administrativas são protegidos por regras de autorização específicas (veja a seção "Endpoints da API").

- **Gerenciamento de Senhas:** O sistema utiliza `DelegatingPasswordEncoder`, que permite o uso de senhas sem criptografia (`{noop}`) para os dados de seed (teste), enquanto as senhas de novos usuários são armazenadas com hash BCrypt, garantindo a segurança.

- **CORS:** A configuração de Cross-Origin Resource Sharing (CORS) está habilitada para permitir requisições de origens específicas, como `http://localhost:3000`.

## 🧪 Testes

A camada de testes foi aprimorada para garantir a robustez e a corretude da aplicação.

- **Testes de Autorização:** Foram implementados testes de segurança para validar as regras de autorização baseadas em papéis. Para garantir que o contexto completo do Spring Boot seja carregado, os testes de integração utilizam a anotação `@SpringBootTest(classes = SmartmeetingApiApplication.class)`, especificando explicitamente a classe de configuração principal. Isso resolve problemas comuns em que o teste não consegue localizar a configuração da aplicação.

## 📊 Dashboard e Métricas

A API oferece um serviço de dashboard que consolida dados de várias partes do sistema para fornecer uma visão geral e métricas de desempenho.

- **Estatísticas Gerais:** Números totais de reuniões (agendadas, finalizadas, canceladas), salas (total e disponíveis), pessoas e tarefas (pendentes e concluídas).
- **Uso de Salas:** Taxa de ocupação, total de reuniões e minutos de uso por sala.
- **Taxas de Presença:** Percentual de presença de cada participante em relação às reuniões para as quais foi convidado.
- **Produtividade dos Organizadores:** Métricas sobre as reuniões organizadas, incluindo taxa de sucesso e média de participantes.
- **Métricas de Reuniões:** Duração média, mínima e máxima das reuniões finalizadas.

## 👤 Usuários de exemplo (semente de dados)

O arquivo `backend/src/main/resources/data.sql` popula dados iniciais (idempotente) com usuários e senhas para testes:

- **ADMIN**: `alice.admin@smart.com` / `admin123`
- **ORGANIZADOR**: `otavio.organizador@smart.com` / `org123`
- **PARTICIPANTE**: `paula.participante@smart.com` / `part123`

Observações:
- As senhas de seed usam `{noop}` para facilitar testes. Novos cadastros são salvos com hashing (BCrypt) via `PasswordEncoder` padrão.
- Endpoints públicos incluem `/auth/**`, `/swagger-ui/**`, `/v3/api-docs/**`, `/h2-console/**`.

## 🚨 Tratamento de Erros Padronizado

A API implementa um tratamento de erros centralizado e padronizado para fornecer respostas claras e consistentes aos clientes. Isso é feito através de:

- **Exceções Personalizadas:**
    - `ResourceNotFoundException` (HTTP 404): Para recursos não encontrados.
    - `BadRequestException` (HTTP 400): Para requisições mal formatadas ou violações de regras de negócio.
    - `ConflictException` (HTTP 409): Para conflitos de dados (ex: e-mail já em uso, falha de concorrência).
- **`ErrorResponse` DTO:** Um objeto padrão para formatar as respostas de erro, incluindo timestamp, status, mensagem, path e detalhes específicos (para erros de validação).
- **`GlobalExceptionHandler`:** Um `@ControllerAdvice` que intercepta e trata diversas exceções do Spring Framework e as exceções personalizadas, mapeando-as para respostas HTTP apropriadas e mensagens amigáveis.

## 📊 Modelo de Dados e Relacionamentos (JPA)

O modelo de dados foi aprimorado com relacionamentos bidirecionais entre as entidades, permitindo uma navegação mais natural e eficiente pelos dados. As anotações `@JsonManagedReference` e `@JsonBackReference` são utilizadas para gerenciar a serialização JSON desses relacionamentos, prevenindo loops infinitos.

## 📚 Documentação da API (Swagger)

A documentação completa e interativa da API está disponível através do Swagger UI.

- **URL da Documentação:** `http://localhost:8080/swagger-ui.html`

## 🌐 Endpoints da API

*Todos os endpoints não marcados como públicos requerem autenticação.*

### Autenticação (Público)
- `POST /auth/login`: Autentica um usuário e retorna um token JWT.
- `POST /auth/registro`: Registra um novo usuário.

### Pessoas
- `GET /pessoas`: Lista todas as pessoas.
- `GET /pessoas/{id}`: Busca uma pessoa específica por ID.
- `POST /pessoas`: Cria uma nova pessoa.
- `PUT /pessoas/{id}`: Atualiza uma pessoa existente.
- `DELETE /pessoas/{id}`: Remove uma pessoa. **(Requer: ADMIN)**
- `GET /pessoas/{id}/roles`: Lista os papéis de uma pessoa. **(Requer: ADMIN)**
- `POST /pessoas/{id}/roles/{roleId}`: Adiciona um papel a uma pessoa. **(Requer: ADMIN)**
- `DELETE /pessoas/{id}/roles/{roleId}`: Remove um papel de uma pessoa. **(Requer: ADMIN)**

### Salas
- `GET /salas`: Lista todas as salas.
- `GET /salas/{id}`: Busca uma sala específica por ID.
- `POST /salas`: Cria uma nova sala.
- `PUT /salas/{id}`: Atualiza uma sala existente.
- `DELETE /salas/{id}`: Remove uma sala.

### Reuniões
- `GET /reunioes`: Lista todas as reuniões.
- `GET /reunioes/{id}`: Busca uma reunião específica por ID.
- `POST /reunioes`: Cria uma nova reunião. **(Requer: Permissão 'CRIAR_REUNIAO')**
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

Para continuar aprimorando o projeto SmartMeeting API, os seguintes passos são considerados importantes:

### Qualidade e Testes
1.  **Implementar Testes Unitários:** Cobrir a lógica de negócio dos serviços com JUnit e Mockito.
2.  **Implementar Testes de Integração:** Utilizar Testcontainers para testar a interação com o banco de dados e outros serviços externos.
3.  **Testes de Performance/Carga:** Avaliar o desempenho da API sob diferentes cargas de trabalho.
4.  **Análise de Cobertura de Código:** Garantir uma boa cobertura de testes para as partes críticas do sistema.

### Funcionalidades e Melhorias
5.  **Reorganização do Pacote `service`:** Mover classes para sub-pacotes (`business`, `scheduling`, `export`, `notification`) para maior clareza e organização.
6.  **Exportação de Relatórios para PDF:** Adicionar a funcionalidade de exportar relatórios para o formato PDF.
7.  **Notificações em Tempo Real:** Implementar WebSockets (ex: Spring WebFlux) para notificações em tempo real (ex: reunião começando, tarefa atribuída).
8.  **Gestão de Recursos da Sala:** Adicionar CRUD para recursos (projetor, quadro interativo) e associá-los às salas.
9.  **Disponibilidade de Salas:** Implementar lógica para verificar a disponibilidade de salas em um determinado período.
10. **Auditoria de Versões com Hibernate Envers:** Implementar o Hibernate Envers para rastrear todas as versões das entidades e permitir a consulta do histórico completo.
11. **Internacionalização (i18n):** Suporte a múltiplos idiomas para mensagens de erro e textos da API.
12. **Otimização de Consultas JPA:** Revisar e otimizar consultas complexas para evitar problemas de N+1 e melhorar o desempenho.

### Segurança e Operações
13. **Configuração de HTTPS:** Garantir que a API seja servida via HTTPS em ambientes de produção.
14. **Rate Limiting:** Implementar limitação de requisições para proteger a API contra ataques de força bruta ou uso excessivo.
15. **Monitoramento e Alertas:** Configurar ferramentas de monitoramento (ex: Prometheus, Grafana) para a saúde da aplicação e alertas.
16. **Centralização de Logs:** Enviar logs para um sistema centralizado (ex: ELK Stack) para facilitar a análise.
17. **Dockerização:** Criar imagens Docker para a aplicação e o banco de dados para facilitar o deploy.
18. **CI/CD:** Implementar um pipeline de Integração Contínua e Entrega Contínua (CI/CD) para automatizar o build, teste e deploy.
19. **Backup e Restauração de Dados:** Definir e implementar uma estratégia de backup e restauração para o banco de dados.
20. **Análise de Vulnerabilidades:** Realizar varreduras de segurança (SAST/DAST) para identificar e corrigir possíveis vulnerabilidades.
