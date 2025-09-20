
# 🗓️ SmartMeeting API - Sistema de Gestão de Reuniões

## 📋 Descrição
Sistema inteligente para reuniões presenciais com controle de acesso e gestão de tarefas. Desenvolvido com Spring Boot e Java 17.

## 🔧 Tecnologias Utilizadas
- Java 17
- Spring Boot 3.5.3
- Spring Data JPA
- Spring Web
- Spring Mail
- MySQL
- Lombok
- Jakarta Persistence API
- Hibernate Validator

## 🏗️ Estrutura do Projeto

### 📦 Entidades JPA
- **Pessoa**: id, nome, email, crachaRFID, papel (enum TipoUsuario)
- **Sala**: id, nome, capacidade, recursos, status (enum SalaStatus)
- **Reunião**: id, dataHoraInicio, duracao, pauta, status (enum StatusReuniao), sala_id, organizador_id
- **Tarefa**: id, descrição, status (enum StatusTarefa), tipo, reuniao_id, responsavel_id, prazo
- **Presença**: id, reuniao_id, pessoa_id, horaEntrada
- **Notificação**: id, tipo (enum TipoNotificacao), remetente, destinatario, mensagem, dataEnvio

### 🔄 Enums

#### StatusReuniao
- **Valores**: 
  - `AGENDADA`: Reunião agendada e aguardando início
  - `EM_ANDAMENTO`: Reunião em andamento
  - `FINALIZADA`: Reunião finalizada com sucesso
  - `CANCELADA`: Reunião cancelada
- **Métodos**: 
  - `getDescricao()`: Retorna a descrição do status
  - `isAtiva()`: Verifica se a reunião está em um estado ativo (agendada ou em andamento)
  - `isFinalizada()`: Verifica se a reunião está em um estado finalizado (finalizada ou cancelada)

#### StatusTarefa
- **Valores**: 
  - `PRE_REUNIAO`: Tarefa a ser realizada antes da reunião
  - `POS_REUNIAO`: Tarefa a ser realizada após a reunião
- **Métodos**: 
  - `getDescricao()`: Retorna a descrição do status
  - `isPreReuniao()`: Verifica se a tarefa deve ser realizada antes da reunião
  - `isPosReuniao()`: Verifica se a tarefa deve ser realizada após a reunião

#### SalaStatus
- **Valores**: 
  - `LIVRE`: Sala disponível para uso
  - `OCUPADA`: Sala em uso no momento
  - `RESERVADA`: Sala reservada para uso futuro
- **Métodos**: 
  - `getDescricao()`: Retorna a descrição do status
  - `isDisponivel()`: Verifica se a sala está disponível para uso imediato
  - `isIndisponivel()`: Verifica se a sala está indisponível para uso imediato

#### TipoUsuario
- **Valores**: 
  - `ADMIN`: Administrador do sistema
  - `ORGANIZADOR`: Organizador de reuniões
  - `PARTICIPANTE`: Participante de reuniões
- **Métodos**: 
  - `getDescricao()`: Retorna a descrição do tipo
  - `podeCriarReuniao()`: Verifica se o usuário pode criar reuniões
  - `podeGerenciarUsuarios()`: Verifica se o usuário pode gerenciar outros usuários
  - `isAdmin()`: Verifica se o usuário é administrador

#### TipoNotificacao
- **Valores**: 
  - `EMAIL`: Notificação por e-mail
  - `CONSOLE`: Notificação no console da aplicação
  - `PUSH`: Notificação push para dispositivos móveis
- **Métodos**: 
  - `getDescricao()`: Retorna a descrição do tipo
  - `isEnvioExterno()`: Verifica se a notificação é enviada para um sistema externo
  - `isEmail()`: Verifica se a notificação é do tipo e-mail
  - `isPush()`: Verifica se a notificação é do tipo push

#### TipoAcesso
- **Valores**: 
  - `TOTAL`: Acesso total ao sistema
  - `LEITURA_ESCRITA`: Acesso de leitura e escrita
  - `SOMENTE_LEITURA`: Acesso somente de leitura
  - `RESTRITO`: Acesso restrito a funcionalidades específicas
- **Métodos**: 
  - `getDescricao()`: Retorna a descrição do tipo
  - `podeLer()`: Verifica se o tipo de acesso permite leitura
  - `podeEscrever()`: Verifica se o tipo de acesso permite escrita
  - `podeAdministrar()`: Verifica se o tipo de acesso permite administração
  - `isAcessoTotal()`: Verifica se o tipo de acesso é total

### 🌐 APIs REST
#### PessoaController
- `GET /pessoas` - Lista todas as pessoas
- `POST /pessoas` - Cria uma nova pessoa
- `PUT /pessoas/{id}` - Atualiza uma pessoa existente
- `DELETE /pessoas/{id}` - Remove uma pessoa

#### SalaController
- `GET /salas` - Lista todas as salas
- `POST /salas` - Cria uma nova sala
- `PUT /salas/{id}` - Atualiza uma sala existente
- `DELETE /salas/{id}` - Remove uma sala

#### ReuniaoController
- `GET /reunioes` - Lista todas as reuniões
- `POST /reunioes` - Cria uma nova reunião
- `PUT /reunioes/{id}` - Atualiza uma reunião existente
- `DELETE /reunioes/{id}` - Remove uma reunião

#### TarefaController
- `GET /tarefas` - Lista todas as tarefas
- `POST /tarefas` - Cria uma nova tarefa
- `PUT /tarefas/{id}` - Atualiza uma tarefa existente
- `DELETE /tarefas/{id}` - Remove uma tarefa

#### PresencaController
- `POST /reunioes/{id}/presenca` - Registra presença com ID do crachá

#### RelatorioController
- `GET /relatorios/reunioes-por-sala` - Relatório de reuniões por sala
- `GET /relatorios/tarefas-concluidas` - Relatório de tarefas concluídas
- `GET /relatorios/presenca-pessoa` - Relatório de presenças por pessoa
- `GET /relatorios/duracao-reunioes` - Relatório de duração das reuniões

### 📧 Serviço de Email
Implementação de serviço para envio de emails utilizando Spring Mail:
- Convites para reuniões
- Lembretes de tarefas
- Alertas de presença atrasada

### ⏱️ Agendamento
Implementação de tarefas agendadas com Spring Scheduler:
- Alertas de pauta 48h antes da reunião
- Alertas de checklist 24h antes da reunião
- Checagem de pendências 1h antes da reunião

### 🔐 Autenticação e Autorização
- Autenticação JWT (geração e validação de tokens)
- Endpoint `POST /auth/login`
- Controle de acesso por roles (ADMIN, ORGANIZADOR, PARTICIPANTE)

## 📊 Funcionalidades Implementadas
- ✅ CRUD completo para todas as entidades
- ✅ Registro de presença com validação de participantes
- ✅ Gerenciamento de tarefas pré e pós-reunião
- ✅ Envio de emails para notificações
- ✅ Agendamento de lembretes automáticos
- ✅ Finalização de reunião com geração de ata
- ✅ Autenticação e autorização com JWT
- ✅ Enums melhorados com descrições e métodos úteis
- ✅ Documentação de endpoints com Swagger (springdoc-openapi)

## 📝 Documentação da API

### 🔐 Autenticação JWT
O sistema utiliza autenticação baseada em tokens JWT (JSON Web Token):

- **Endpoint de Login**: `POST /auth/login`
  - Corpo da requisição: `{ "email": "seu@email.com", "senha": "suasenha" }`
  - Resposta: `{ "token": "seu-token-jwt" }`

- **Uso do Token**: Adicione o token recebido no header de suas requisições:
  - Header: `Authorization: Bearer seu-token-jwt`

- **Configurações JWT**:
  - Tempo de expiração: 24 horas (86400000 ms)
  - Secret Key: Configurada no application.properties

### 📚 Swagger/OpenAPI
A documentação completa da API está disponível através do Swagger UI:

- **URL da Documentação**: `/swagger-ui.html`
- **URL do JSON OpenAPI**: `/v3/api-docs`

A documentação inclui todos os endpoints, modelos de dados, parâmetros necessários e esquemas de segurança (JWT).

## 🚧 Próximos Passos
- Testes unitários com JUnit + Mockito
- Testes de integração com H2
