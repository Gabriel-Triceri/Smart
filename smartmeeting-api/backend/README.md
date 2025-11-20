# SmartMeeting API - Backend

## 1. Descrição do Projeto
Este é o backend da aplicação SmartMeeting, responsável por gerenciar reuniões, projetos, usuários e outras funcionalidades essenciais. Desenvolvido com Spring Boot, oferece uma API RESTful para interação com o frontend e outros serviços.

## 2. Tecnologias Utilizadas
*   **Java 17**
*   **Spring Boot** (versão a ser especificada)
*   **Spring Data JPA**
*   **Maven**
*   **PostgreSQL** (ou outro banco de dados configurado)
*   **Lombok** (para reduzir boilerplate code)
*   **JWT** (JSON Web Tokens para autenticação e autorização)
*   **Swagger/OpenAPI** (para documentação da API)

## 3. Como Começar

### 3.1. Pré-requisitos
*   JDK 17 instalado
*   Maven instalado
*   Um servidor de banco de dados PostgreSQL (ou outro) em execução
*   Git

### 3.2. Configuração do Banco de Dados
1.  Crie um banco de dados PostgreSQL (ex: `smartmeeting_db`).
2.  Atualize o arquivo `src/main/resources/application.properties` (ou `application.yml`) com as credenciais do seu banco de dados:
    ```properties
    spring.datasource.url=jdbc:postgresql://localhost:5432/smartmeeting_db
    spring.datasource.username=seu_usuario
    spring.datasource.password=sua_senha
    spring.jpa.hibernate.ddl-auto=update # ou create, create-drop, none
    spring.jpa.show-sql=true
    ```

### 3.3. Executando o Backend
1.  Clone o repositório:
    ```bash
    git clone <URL_DO_REPOSITORIO>
    cd smartmeeting-api/backend
    ```
2.  Compile o projeto usando Maven:
    ```bash
    mvn clean install
    ```
3.  Execute a aplicação Spring Boot:
    ```bash
    mvn spring-boot:run
    ```
    A aplicação estará disponível em `http://localhost:8080` (ou a porta configurada).

## 4. Estrutura do Projeto
```
backend/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/smartmeeting/
│   │   │       ├── SmartmeetingApplication.java  # Ponto de entrada da aplicação
│   │   │       ├── config/                     # Classes de configuração
│   │   │       ├── controller/                 # Endpoints da API REST
│   │   │       ├── dto/                        # Objetos de Transferência de Dados
│   │   │       ├── enums/                      # Enumerações
│   │   │       ├── exception/                  # Classes de exceção personalizadas
│   │   │       ├── model/                      # Entidades do banco de dados
│   │   │       ├── repository/                 # Interfaces de repositório JPA
│   │   │       └── service/                    # Lógica de negócio
│   │   └── resources/
│   │       ├── application.properties          # Configurações da aplicação
│   │       └── application.yml                 # (Opcional) Configurações da aplicação
│   └── test/                                   # Testes unitários e de integração
├── pom.xml                                     # Configurações do Maven
└── README.md                                   # Este arquivo
```

## 5. Documentação da API

A documentação **completa e interativa** de todos os endpoints da API, incluindo detalhes de requisição, resposta, modelos de dados e autenticação, pode ser acessada via **Swagger UI** após a execução da aplicação em:
`http://localhost:8080/swagger-ui.html`

Recomenda-se fortemente utilizar o Swagger UI para explorar a API em detalhes, pois ele fornece a documentação mais atualizada diretamente do código-fonte. Abaixo, fornecemos uma visão geral dos principais controladores e um exemplo detalhado de um endpoint para ilustrar a estrutura da documentação.

### 5.1. Visão Geral dos Controladores
*   **`AuthController`**: Gerencia a autenticação de usuários, incluindo registro e login, e a emissão de tokens JWT.
*   **`ProjectController`**: Responsável por todas as operações relacionadas a projetos, como criação, listagem, atualização, exclusão e gerenciamento de membros do projeto.
*   **`PessoaController`**: Gerencia as informações dos usuários (pessoas) do sistema.
*   **`ReuniaoController`**: Lida com a criação, agendamento e gerenciamento de reuniões.
*   **`TarefaController`**: Gerencia as tarefas associadas a projetos ou reuniões.
*   **`SalaController`**: Gerencia a disponibilidade e informações das salas de reunião.
*   **`PermissionController`**: Controla as permissões de acesso a diferentes recursos da aplicação.
*   **`RoleController`**: Gerencia os papéis (roles) dos usuários no sistema.
*   **`DashboardController`**: Fornece dados agregados para exibição em dashboards.
*   **`RelatorioController`**: Gera relatórios diversos com base nos dados da aplicação.
*   **`CalendarioController`**: Oferece funcionalidades relacionadas a calendários e agendamentos.
*   **`NotificacaoController`**: Gerencia o envio e a visualização de notificações para os usuários.
*   **`PresencaController`**: Registra e gerencia a presença de participantes em reuniões.

### 5.2. Exemplo Detalhado de Endpoint: Criar um Novo Projeto (`ProjectController`)

#### 5.2.1. Endpoint: `POST /api/projects`

*   **Descrição**: Cria um novo projeto no sistema. Requer autenticação e que o usuário autenticado seja o proprietário (`owner`) do projeto ou tenha permissão para criar projetos.
*   **Método HTTP**: `POST`
*   **URL**: `/api/projects`
*   **Autenticação**: Necessária. O token JWT deve ser enviado no cabeçalho `Authorization` no formato `Bearer <token>`.

#### 5.2.2. Corpo da Requisição (Request Body)

**`CreateProjectDTO`** - Objeto JSON contendo os detalhes do novo projeto.
| Campo       | Tipo      | Obrigatório | Descrição                                                              | Exemplo                     |
| :---------- | :-------- | :---------- | :--------------------------------------------------------------------- | :-------------------------- |
| `name`      | `String`  | Sim         | Nome do projeto.                                                       | `"Nome do Novo Projeto"`    |
| `description` | `String`  | Não         | Descrição detalhada do projeto.                                        | `"Descrição detalhada..."`  |
| `startDate` | `String`  | Sim         | Data e hora de início do projeto (formato ISO 8601: `yyyy-MM-dd'T'HH:mm:ss`).                   | `"2023-10-26T09:00:00"`     |
| `endDate`   | `String`  | Não         | Data e hora de término do projeto (formato ISO 8601: `yyyy-MM-dd'T'HH:mm:ss`).                  | `"2024-03-15T17:00:00"`     |
| `ownerId`   | `Long`    | Sim         | ID do usuário (Pessoa) que será o proprietário e criador do projeto.   | `1`                         |

```json
{
  "name": "Nome do Novo Projeto",
  "description": "Descrição detalhada do novo projeto.",
  "startDate": "2023-10-26T09:00:00",
  "endDate": "2024-03-15T17:00:00",
  "ownerId": 1
}
```

#### 5.2.3. Resposta de Sucesso (Status: 201 Created)

**`ProjectDTO`** - Objeto JSON representando o projeto recém-criado.
| Campo       | Tipo      | Descrição                                                              | Exemplo                     |
| :---------- | :-------- | :--------------------------------------------------------------------- | :-------------------------- |
| `id`        | `Long`    | ID único do projeto.                                                   | `101`                       |
| `name`      | `String`  | Nome do projeto.                                                       | `"Nome do Novo Projeto"`    |
| `description` | `String`  | Descrição detalhada do projeto.                                        | `"Descrição detalhada..."`  |
| `startDate` | `String`  | Data e hora de início do projeto (formato ISO 8601: `yyyy-MM-dd'T'HH:mm:ss`).                   | `"2023-10-26T09:00:00"`     |
| `endDate`   | `String`  | Data e hora de término do projeto (formato ISO 8601: `yyyy-MM-dd'T'HH:mm:ss`).                  | `"2024-03-15T17:00:00"`     |
| `status`    | `String`  | Status atual do projeto (ex: `PLANNING`, `IN_PROGRESS`, `COMPLETED`).  | `"PLANNING"`                |
| `owner`     | `PessoaDTO` | Objeto representando o proprietário do projeto. Contém `id`, `nome`, `email`, etc. | `{ "id": 1, "nome": "...", "email": "..." }` |
| `members`   | `List<ProjectMemberDTO>` | Lista de membros associados ao projeto. Inicialmente pode conter apenas o proprietário. Cada `ProjectMemberDTO` contém `id`, `projectId`, `person` (PessoaDTO), `role` (ProjectRole), `joinedAt`. | `[]` ou `[{ "id": ..., "projectId": ..., "person": {...}, "role": "OWNER", "joinedAt": "..." }]` |

```json
{
  "id": 101,
  "name": "Nome do Novo Projeto",
  "description": "Descrição detalhada do novo projeto.",
  "startDate": "2023-10-26T09:00:00",
  "endDate": "2024-03-15T17:00:00",
  "status": "PLANNING",
  "owner": {
    "id": 1,
    "nome": "Nome do Proprietário",
    "email": "proprietario@example.com"
    // Outros campos do PessoaDTO
  },
  "members": []
}
```

#### 5.2.4. Respostas de Erro

*   **400 Bad Request**: Ocorre quando os dados da requisição são inválidos ou incompletos.
    *   **Causa Comum**: `ownerId` não corresponde a um usuário existente, campos obrigatórios ausentes, formato de data inválido.
    ```json
    {
      "timestamp": "2023-10-26T10:30:00.000+00:00",
      "status": 400,
      "error": "Bad Request",
      "message": "Pessoa com id 1 não encontrada.",
      "path": "/api/projects"
    }
    ```
*   **401 Unauthorized**: Ocorre quando a requisição não contém um token JWT válido ou o token está ausente.
    *   **Causa Comum**: Usuário não autenticado.
*   **403 Forbidden**: Ocorre quando o usuário autenticado não possui as permissões necessárias para realizar a operação (ex: não tem permissão para criar projetos).
    *   **Causa Comum**: Falha na autorização.

## 6. Contribuindo
1.  Faça um fork do projeto.
2.  Crie uma nova branch (`git checkout -b feature/sua-feature`).
3.  Faça suas alterações e commit (`git commit -m 'Adiciona nova feature'`).
4.  Envie para a branch original (`git push origin feature/sua-feature`).
5.  Abra um Pull Request.

## 7. Licença
Este projeto está licenciado sob a Licença MIT. Veja o arquivo `LICENSE` para mais detalhes.
