-- =====================================================
-- SEED DATA - SmartMeeting
-- Script completo com todas as tabelas e colunas - VERSÃO AJUSTADA
-- =====================================================

-- =====================================================
-- 1. Primeiro criar as sequences (se não existirem)
-- =====================================================
CREATE SEQUENCE IF NOT EXISTS SQ_PESSOA START WITH 100;
CREATE SEQUENCE IF NOT EXISTS SQ_SALA START WITH 100;
CREATE SEQUENCE IF NOT EXISTS SQ_REUNIAO START WITH 100;
CREATE SEQUENCE IF NOT EXISTS SQ_PRESENCA START WITH 100;
CREATE SEQUENCE IF NOT EXISTS SQ_TAREFA START WITH 100;
CREATE SEQUENCE IF NOT EXISTS SQ_NOTIFICACAO START WITH 100;
CREATE SEQUENCE IF NOT EXISTS SQ_PERMISSION START WITH 100;
CREATE SEQUENCE IF NOT EXISTS SQ_ROLE START WITH 100;
CREATE SEQUENCE IF NOT EXISTS HIBERNATE_SEQUENCE START WITH 1000;

-- =====================================================
-- 2. PESSOA (IDs 1..10)
-- =====================================================
MERGE INTO PESSOA (ID_PESSOA, NOME_PESSOA, EMAIL_PESSOA, SENHA_PESSOA, CRACHEID_PESSOA, TIPO_USUARIO)
KEY(ID_PESSOA) VALUES
(1, 'Alice Admin', 'alice.admin@smart.com', '{noop}admin123', 'CR001', 'ADMIN'),
(2, 'Otavio Organizador', 'otavio.organizador@smart.com', '{noop}org123', 'CR002', 'ORGANIZADOR'),
(3, 'Paula Participante', 'paula.participante@smart.com', '{noop}part123', 'CR003', 'PARTICIPANTE'),
(4, 'Carlos Convidado', 'carlos.convidado@smart.com', '{noop}conv123', 'CR004', 'PARTICIPANTE'),
(5, 'Daniel Desenvolvedor', 'daniel.dev@smart.com', '{noop}dev123', 'CR005', 'PARTICIPANTE'),
(6, 'Eduarda Engenheira', 'eduarda.eng@smart.com', '{noop}eng123', 'CR006', 'PARTICIPANTE'),
(7, 'Fabio Financeiro', 'fabio.fin@smart.com', '{noop}fin123', 'CR007', 'ORGANIZADOR'),
(8, 'Gabriela Gestora', 'gabriela.gest@smart.com', '{noop}gest123', 'CR008', 'ADMIN'),
(9, 'Hugo HR', 'hugo.hr@smart.com', '{noop}hr123', 'CR009', 'ORGANIZADOR'),
(10, 'Igor Infra', 'igor.infra@smart.com', '{noop}infra123', 'CR010', 'PARTICIPANTE');

-- =====================================================
-- 3. SALA (IDs 1..10)
-- =====================================================
MERGE INTO SALA (ID_SALA, NOME_SALA, CAPACIDADE_SALA, LOCALIZACAO_SALA, STATUS_SALA)
KEY(ID_SALA) VALUES
(1, 'Sala Azul', 8, 'Bloco A - 1o andar', 'LIVRE'),
(2, 'Sala Verde', 12, 'Bloco B - 2o andar', 'OCUPADA'),
(3, 'Sala Amarela', 6, 'Bloco C - Térreo', 'RESERVADA'),
(4, 'Sala Vermelha', 10, 'Bloco A - 2o andar', 'LIVRE'),
(5, 'Sala Laranja', 4, 'Bloco B - Térreo', 'MANUTENCAO'),
(6, 'Sala Roxa', 20, 'Bloco C - 1o andar', 'LIVRE'),
(7, 'Auditório Principal', 50, 'Bloco D - Térreo', 'RESERVADA'),
(8, 'Sala de Brainstorming', 5, 'Bloco A - 3o andar', 'OCUPADA'),
(9, 'Sala Executiva', 8, 'Bloco E - Cobertura', 'LIVRE'),
(10, 'Sala de Treinamento', 15, 'Bloco B - 1o andar', 'LIVRE');

-- =====================================================
-- 4. PERMISSION (Permissões do Sistema)
-- =====================================================
MERGE INTO PERMISSION (ID_PERMISSION, NOME_PERMISSION)
KEY(ID_PERMISSION) VALUES
(1, 'PROJECT_VIEW'),
(2, 'PROJECT_EDIT'),
(3, 'PROJECT_DELETE'),
(4, 'PROJECT_MANAGE_MEMBERS'),
(5, 'TASK_CREATE'),
(6, 'TASK_VIEW'),
(7, 'TASK_EDIT'),
(8, 'TASK_DELETE'),
(9, 'TASK_MOVE'),
(10, 'TASK_ASSIGN'),
(11, 'TASK_COMMENT'),
(12, 'TASK_ATTACH'),
(13, 'KANBAN_VIEW'),
(14, 'KANBAN_MANAGE_COLUMNS'),
(15, 'MEETING_CREATE'),
(16, 'MEETING_VIEW'),
(17, 'MEETING_EDIT'),
(18, 'MEETING_DELETE'),
(19, 'MEETING_MANAGE_PARTICIPANTS'),
(20, 'ADMIN_MANAGE_USERS'),
(21, 'ADMIN_MANAGE_ROLES'),
(22, 'ADMIN_VIEW_REPORTS'),
(23, 'ADMIN_SYSTEM_SETTINGS');

-- =====================================================
-- 5. ROLE (Perfis de Acesso)
-- =====================================================
MERGE INTO ROLE (ID_ROLE, NOME_ROLE)
KEY(ID_ROLE) VALUES
(1, 'Administrador'),
(2, 'Gerente de Projetos'),
(3, 'Membro'),
(4, 'Visualizador'),
(5, 'Organizador de Reuniões');

-- =====================================================
-- 6. ROLE_PERMISSION (Associação Perfil-Permissão)
-- =====================================================
MERGE INTO ROLE_PERMISSION (ID_ROLE, ID_PERMISSION)
KEY(ID_ROLE, ID_PERMISSION) VALUES
-- Administrador - todas as permissões
(1, 1), (1, 2), (1, 3), (1, 4), (1, 5), (1, 6), (1, 7), (1, 8), (1, 9), (1, 10),
(1, 11), (1, 12), (1, 13), (1, 14), (1, 15), (1, 16), (1, 17), (1, 18), (1, 19),
(1, 20), (1, 21), (1, 22), (1, 23),
-- Gerente de Projetos
(2, 1), (2, 2), (2, 4), (2, 5), (2, 6), (2, 7), (2, 8), (2, 9), (2, 10),
(2, 11), (2, 12), (2, 13), (2, 14), (2, 15), (2, 16), (2, 17), (2, 19), (2, 22),
-- Membro
(3, 1), (3, 5), (3, 6), (3, 7), (3, 9), (3, 11), (3, 12), (3, 13), (3, 16),
-- Visualizador
(4, 1), (4, 6), (4, 13), (4, 16),
-- Organizador de Reuniões
(5, 1), (5, 6), (5, 13), (5, 15), (5, 16), (5, 17), (5, 18), (5, 19);

-- =====================================================
-- 7. PROJECT (Projetos - IDs 1..10)
-- =====================================================
MERGE INTO PROJECT (ID, NAME, DESCRIPTION, START_DATE, END_DATE, STATUS, ID_OWNER)
KEY(ID) VALUES
(1, 'Sistema de Gestão', 'Desenvolvimento do sistema de gestão de reuniões', DATE '2025-10-01', DATE '2025-12-31', 'ACTIVE', 1),
(2, 'Melhoria de Processos', 'Otimização dos processos internos', DATE '2025-11-01', DATE '2026-02-28', 'ACTIVE', 2),
(3, 'Planejamento Estratégico', 'Definição de metas Q4', DATE '2025-11-08', DATE '2025-11-30', 'PLANNING', 8),
(4, 'Migração Cloud', 'Migração para AWS', DATE '2025-09-01', DATE '2026-01-15', 'ACTIVE', 10),
(5, 'App Mobile', 'Desenvolvimento do app Android/iOS', DATE '2025-12-01', DATE '2026-06-30', 'PLANNING', 5),
(6, 'Refatoração Legacy', 'Refatoração do módulo financeiro', DATE '2025-10-15', DATE '2025-12-15', 'PAUSED', 5),
(7, 'Campanha Marketing', 'Campanha de fim de ano', DATE '2025-11-01', DATE '2025-12-25', 'ACTIVE', 7),
(8, 'Auditoria Interna', 'Auditoria de segurança', DATE '2025-11-10', DATE '2025-11-20', 'COMPLETED', 8),
(9, 'Treinamento Equipe', 'Workshop de Agile', DATE '2025-11-05', DATE '2025-11-06', 'COMPLETED', 2),
(10, 'Novo Site Institucional', 'Redesign do site', DATE '2026-01-01', DATE '2026-03-31', 'PLANNING', 9);

-- =====================================================
-- 8. PROJECT_MEMBER (Membros dos Projetos)
-- =====================================================
MERGE INTO PROJECT_MEMBER (ID, ID_PROJECT, ID_PERSON, ROLE, JOINED_AT)
KEY(ID) VALUES
-- Projeto 1: Sistema de Gestão
(1, 1, 1, 'OWNER', TIMESTAMP '2025-10-01 09:00:00'),
(2, 1, 2, 'ADMIN', TIMESTAMP '2025-10-01 09:00:00'),
(3, 1, 3, 'MEMBER_EDITOR', TIMESTAMP '2025-10-02 10:00:00'),
(4, 1, 5, 'MEMBER_EDITOR', TIMESTAMP '2025-10-02 10:00:00'),
(5, 1, 6, 'MEMBER_EDITOR', TIMESTAMP '2025-10-03 11:00:00'),
-- Projeto 2: Melhoria de Processos
(6, 2, 2, 'OWNER', TIMESTAMP '2025-11-01 09:00:00'),
(7, 2, 3, 'ADMIN', TIMESTAMP '2025-11-01 09:00:00'),
(8, 2, 4, 'MEMBER_EDITOR', TIMESTAMP '2025-11-02 10:00:00'),
-- Projeto 3: Planejamento Estratégico
(9, 3, 8, 'OWNER', TIMESTAMP '2025-11-08 09:00:00'),
(10, 3, 1, 'ADMIN', TIMESTAMP '2025-11-08 09:00:00'),
(11, 3, 2, 'MEMBER_EDITOR', TIMESTAMP '2025-11-08 10:00:00'),
-- Projeto 4: Migração Cloud
(12, 4, 10, 'OWNER', TIMESTAMP '2025-09-01 09:00:00'),
(13, 4, 5, 'ADMIN', TIMESTAMP '2025-09-01 09:00:00'),
(14, 4, 6, 'MEMBER_EDITOR', TIMESTAMP '2025-09-02 10:00:00'),
-- Projeto 5: App Mobile
(15, 5, 5, 'OWNER', TIMESTAMP '2025-12-01 09:00:00'),
(16, 5, 6, 'ADMIN', TIMESTAMP '2025-12-01 09:00:00'),
-- Projeto 7: Campanha Marketing
(17, 7, 7, 'OWNER', TIMESTAMP '2025-11-01 09:00:00'),
(18, 7, 9, 'MEMBER_EDITOR', TIMESTAMP '2025-11-01 10:00:00');

-- =====================================================
-- 9. PROJECT_PERMISSION (Permissões por Membro do Projeto)
-- =====================================================
MERGE INTO PROJECT_PERMISSION (ID, ID_PROJECT_MEMBER, PERMISSION_TYPE, GRANTED)
KEY(ID) VALUES
-- Alice (Owner do Projeto 1) - Todas as permissões de projeto
(1, 1, 'PROJECT_VIEW', TRUE),
(2, 1, 'PROJECT_EDIT', TRUE),
(3, 1, 'PROJECT_DELETE', TRUE),
(4, 1, 'PROJECT_MANAGE_MEMBERS', TRUE),
(5, 1, 'TASK_CREATE', TRUE),
(6, 1, 'TASK_VIEW', TRUE),
(7, 1, 'TASK_EDIT', TRUE),
(8, 1, 'TASK_DELETE', TRUE),
(9, 1, 'TASK_MOVE', TRUE),
(10, 1, 'TASK_ASSIGN', TRUE),
(11, 1, 'KANBAN_MANAGE_COLUMNS', TRUE),
-- Otavio (Admin do Projeto 1)
(12, 2, 'PROJECT_VIEW', TRUE),
(13, 2, 'PROJECT_EDIT', TRUE),
(14, 2, 'PROJECT_MANAGE_MEMBERS', TRUE),
(15, 2, 'TASK_CREATE', TRUE),
(16, 2, 'TASK_VIEW', TRUE),
(17, 2, 'TASK_EDIT', TRUE),
(18, 2, 'TASK_MOVE', TRUE),
-- Paula (Membro do Projeto 1)
(19, 3, 'PROJECT_VIEW', TRUE),
(20, 3, 'TASK_CREATE', TRUE),
(21, 3, 'TASK_VIEW', TRUE),
(22, 3, 'TASK_EDIT', TRUE),
(23, 3, 'TASK_MOVE', TRUE),
-- Daniel (Membro do Projeto 1)
(24, 4, 'PROJECT_VIEW', TRUE),
(25, 4, 'TASK_CREATE', TRUE),
(26, 4, 'TASK_VIEW', TRUE),
(27, 4, 'TASK_EDIT', TRUE),
(28, 4, 'TASK_MOVE', TRUE),
(29, 4, 'TASK_COMMENT', TRUE);

-- =====================================================
-- 10. REUNIAO (Reuniões - IDs 1..10)
-- =====================================================
MERGE INTO REUNIAO (
  ID_REUNIAO, TITULO_REUNIAO, DATAHORAINICIO_REUNIAO, DURACAOMINUTOS_REUNIAO, PAUTA_REUNIAO, ATA_REUNIAO, STATUS_REUNIAO,
  ORGANIZADOR_ID, SALA_ID, ID_PROJECT, VERSION
)
KEY(ID_REUNIAO) VALUES
(1, 'Kickoff do Projeto', TIMESTAMP '2025-11-07 09:00:00', 60, 'Discussão inicial', 'Ata inicial', 'AGENDADA', 2, 1, 1, 0),
(2, 'Revisão de Sprint', TIMESTAMP '2025-11-07 11:00:00', 45, 'Review sprint 12', 'Ata sprint 12', 'EM_ANDAMENTO', 1, 2, 1, 0),
(3, 'Planejamento Trimestral', TIMESTAMP '2025-11-08 15:30:00', 90, 'Metas Q4', 'Ata Q4', 'FINALIZADA', 8, 3, 3, 0),
(4, 'Daily Standup', TIMESTAMP '2025-11-09 10:00:00', 15, 'Status diário', 'N/A', 'AGENDADA', 5, 4, 5, 0),
(5, 'Reunião de Arquitetura', TIMESTAMP '2025-11-10 14:00:00', 120, 'Definição arquitetural', 'Decisões técnicas', 'AGENDADA', 10, 6, 4, 0),
(6, 'Alinhamento Marketing', TIMESTAMP '2025-11-11 09:30:00', 60, 'Campanha Natal', 'Ações definidas', 'AGENDADA', 7, 1, 7, 0),
(7, 'Apresentação Resultados', TIMESTAMP '2025-11-12 16:00:00', 60, 'Resultados Q3', 'Slides apresentados', 'AGENDADA', 8, 7, 3, 0),
(8, 'Workshop Inovação', TIMESTAMP '2025-11-13 13:00:00', 240, 'Ideação', 'Lista de ideias', 'AGENDADA', 2, 8, 2, 0),
(9, 'Entrevista Candidato', TIMESTAMP '2025-11-14 10:00:00', 60, 'Entrevista técnica', 'Feedback RH', 'AGENDADA', 9, 9, 2, 0),
(10, 'Fechamento Mensal', TIMESTAMP '2025-11-30 17:00:00', 60, 'Fechamento contábil', 'Relatório final', 'AGENDADA', 7, 10, 1, 0);

-- =====================================================
-- 11. REUNIAO_PARTICIPANTES (Join Table)
-- =====================================================
MERGE INTO REUNIAO_PARTICIPANTES (REUNIAO_ID, PESSOA_ID)
KEY(REUNIAO_ID, PESSOA_ID) VALUES
(1, 1), (1, 3), (1, 5),
(2, 2), (2, 3), (2, 4),
(3, 1), (3, 2), (3, 8),
(4, 5), (4, 6),
(5, 10), (5, 5), (5, 6),
(6, 7), (6, 9),
(7, 8), (7, 1), (7, 2), (7, 3), (7, 4), (7, 5),
(8, 2), (8, 3), (8, 4), (8, 5),
(9, 9), (9, 8),
(10, 7), (10, 8);

-- =====================================================
-- 12. PRESENCA (IDs 1..10)
-- =====================================================
MERGE INTO PRESENCA (ID_PRESENCA, HORA_ENTRADA, VALIDOPORCRACHA_PRESENCA, PARTICIPANTE_ID, REUNIAO)
KEY(ID_PRESENCA) VALUES
(1, TIMESTAMP '2025-11-07 08:55:00', TRUE, 1, 1),
(2, TIMESTAMP '2025-11-07 11:05:00', FALSE, 3, 2),
(3, TIMESTAMP '2025-11-08 15:25:00', TRUE, 2, 3),
(4, TIMESTAMP '2025-11-09 09:59:00', TRUE, 5, 4),
(5, TIMESTAMP '2025-11-10 14:05:00', FALSE, 10, 5),
(6, TIMESTAMP '2025-11-11 09:35:00', TRUE, 7, 6),
(7, TIMESTAMP '2025-11-12 15:50:00', TRUE, 8, 7),
(8, TIMESTAMP '2025-11-13 13:10:00', FALSE, 2, 8),
(9, TIMESTAMP '2025-11-14 09:55:00', TRUE, 9, 9),
(10, TIMESTAMP '2025-11-30 17:00:00', TRUE, 7, 10);

-- =====================================================
-- 13. KANBAN_COLUMNS (Colunas Padrão)
-- =====================================================
MERGE INTO KANBAN_COLUMNS (STATUS, TITLE)
KEY(STATUS) VALUES
('TODO', 'Não Iniciado'),
('IN_PROGRESS', 'Em Andamento'),
('REVIEW', 'Em Revisão'),
('DONE', 'Concluído');

-- =====================================================
-- 14. KANBAN_COLUMN_DYNAMIC (Colunas Dinâmicas por Projeto)
-- =====================================================
MERGE INTO KANBAN_COLUMN_DYNAMIC (ID, ID_PROJECT, COLUMN_KEY, TITLE, DESCRIPTION, COLOR, ORDEM, WIP_LIMIT, IS_DEFAULT, IS_DONE_COLUMN, IS_ACTIVE, CREATED_AT, UPDATED_AT)
KEY(ID) VALUES
-- Projeto 1: Sistema de Gestão (IDs 1-6)
(1, 1, 'backlog', 'Backlog', 'Itens aguardando priorização', '#64748b', 0, NULL, TRUE, FALSE, TRUE, TIMESTAMP '2025-10-01 09:00:00', NULL),
(2, 1, 'todo', 'A Fazer', 'Tarefas prontas para iniciar', '#3b82f6', 1, 10, TRUE, FALSE, TRUE, TIMESTAMP '2025-10-01 09:00:00', NULL),
(3, 1, 'in_progress', 'Em Progresso', 'Tarefas em desenvolvimento', '#8b5cf6', 2, 5, TRUE, FALSE, TRUE, TIMESTAMP '2025-10-01 09:00:00', NULL),
(4, 1, 'code_review', 'Code Review', 'Aguardando revisão de código', '#f59e0b', 3, 3, FALSE, FALSE, TRUE, TIMESTAMP '2025-10-01 09:00:00', NULL),
(5, 1, 'testing', 'Em Testes', 'Em fase de testes', '#10b981', 4, 5, FALSE, FALSE, TRUE, TIMESTAMP '2025-10-01 09:00:00', NULL),
(6, 1, 'done', 'Concluído', 'Tarefas finalizadas', '#22c55e', 5, NULL, TRUE, TRUE, TRUE, TIMESTAMP '2025-10-01 09:00:00', NULL),
-- Projeto 4: Migração Cloud (IDs 7-10)
(7, 4, 'planning', 'Planejamento', 'Fase de planejamento', '#64748b', 0, NULL, FALSE, FALSE, TRUE, TIMESTAMP '2025-09-01 09:00:00', NULL),
(8, 4, 'in_progress', 'Executando', 'Em execução', '#3b82f6', 1, NULL, TRUE, FALSE, TRUE, TIMESTAMP '2025-09-01 09:00:00', NULL),
(9, 4, 'validation', 'Validação', 'Aguardando validação', '#f59e0b', 2, NULL, FALSE, FALSE, TRUE, TIMESTAMP '2025-09-01 09:00:00', NULL),
(10, 4, 'deployed', 'Deployed', 'Implantado em produção', '#22c55e', 3, NULL, TRUE, TRUE, TRUE, TIMESTAMP '2025-09-01 09:00:00', NULL);

-- =====================================================
-- 15. TAREFA (Tarefas - IDs 1..10)
-- STATUS_TAREFA REMOVIDO
-- =====================================================
MERGE INTO TAREFA (
  ID_TAREFA,
  DESCRICAO_TAREFA,
  PRAZO_TAREFA,
  CONCLUIDA_TAREFA,
  PRIORIDADE_TAREFA,
  DATA_INICIO_TAREFA,
  ESTIMADO_HORAS_TAREFA,
  ID_RESPONSAVEL,
  ID_REUNIAO,
  ID_PROJECT,
  PROGRESSO_TAREFA
)
KEY(ID_TAREFA) VALUES
(1, 'Preparar apresentação', DATE '2025-11-10', FALSE, 'ALTA', DATE '2025-11-05', 4.0, 1, 1, 1, 0),
(2, 'Coletar métricas', DATE '2025-11-12', FALSE, 'MEDIA', DATE '2025-11-06', 2.5, 3, 2, 1, 30),
(3, 'Revisar documentação', DATE '2025-11-15', FALSE, 'ALTA', DATE '2025-11-08', 6.0, 2, 1, 1, 80),
(4, 'Implementar nova funcionalidade', DATE '2025-11-20', FALSE, 'CRITICA', DATE '2025-11-10', 16.0, 5, 2, 1, 45),
(5, 'Fechar ata e enviar', DATE '2025-11-09', TRUE, 'BAIXA', DATE '2025-11-08', 1.0, 2, 3, 3, 100),
(6, 'Configurar servidor', DATE '2025-11-18', FALSE, 'ALTA', DATE '2025-11-12', 8.0, 10, 5, 4, 0),
(7, 'Criar wireframes', DATE '2025-12-05', FALSE, 'MEDIA', DATE '2025-11-20', 12.0, 5, 4, 5, 0),
(8, 'Aprovar orçamento', DATE '2025-11-25', FALSE, 'CRITICA', DATE '2025-11-15', 3.0, 8, 3, 3, 0),
(9, 'Contratar buffet', DATE '2025-12-10', FALSE, 'BAIXA', DATE '2025-11-25', 2.0, 9, 6, 7, 0),
(10, 'Atualizar planilha financeira', DATE '2025-11-30', FALSE, 'MEDIA', DATE '2025-11-20', 4.5, 7, 10, 1, 0);

-- =====================================================
-- 16. CHECKLIST_ITEM (Itens de Checklist das Tarefas)
-- =====================================================
MERGE INTO CHECKLIST_ITEM (ID, ID_TAREFA, DESCRICAO, CONCLUIDO, ORDEM, ID_RESPONSAVEL, DATA_CONCLUSAO, ID_CONCLUIDO_POR, CREATED_AT, UPDATED_AT)
KEY(ID) VALUES
-- Tarefa 1: Preparar apresentação
(1, 1, 'Definir estrutura dos slides', TRUE, 0, 1, TIMESTAMP '2025-11-06 10:00:00', 1, TIMESTAMP '2025-11-05 09:00:00', TIMESTAMP '2025-11-06 10:00:00'),
(2, 1, 'Coletar dados de métricas', FALSE, 1, 3, NULL, NULL, TIMESTAMP '2025-11-05 09:00:00', NULL),
(3, 1, 'Criar gráficos', FALSE, 2, 1, NULL, NULL, TIMESTAMP '2025-11-05 09:00:00', NULL),
(4, 1, 'Revisar com gestor', FALSE, 3, 8, NULL, NULL, TIMESTAMP '2025-11-05 09:00:00', NULL),
-- Tarefa 4: Implementar nova funcionalidade
(5, 4, 'Criar branch feature', TRUE, 0, 5, TIMESTAMP '2025-11-10 11:00:00', 5, TIMESTAMP '2025-11-10 09:00:00', TIMESTAMP '2025-11-10 11:00:00'),
(6, 4, 'Implementar backend', TRUE, 1, 5, TIMESTAMP '2025-11-11 17:00:00', 5, TIMESTAMP '2025-11-10 09:00:00', TIMESTAMP '2025-11-11 17:00:00'),
(7, 4, 'Implementar frontend', FALSE, 2, 6, NULL, NULL, TIMESTAMP '2025-11-10 09:00:00', NULL),
(8, 4, 'Escrever testes unitários', FALSE, 3, 5, NULL, NULL, TIMESTAMP '2025-11-10 09:00:00', NULL),
(9, 4, 'Code review', FALSE, 4, 10, NULL, NULL, TIMESTAMP '2025-11-10 09:00:00', NULL),
(10, 4, 'Deploy em staging', FALSE, 5, 10, NULL, NULL, TIMESTAMP '2025-11-10 09:00:00', NULL),
-- Tarefa 6: Configurar servidor
(11, 6, 'Provisionar instância EC2', FALSE, 0, 10, NULL, NULL, TIMESTAMP '2025-11-12 09:00:00', NULL),
(12, 6, 'Instalar Docker', FALSE, 1, 10, NULL, NULL, TIMESTAMP '2025-11-12 09:00:00', NULL),
(13, 6, 'Configurar nginx', FALSE, 2, 10, NULL, NULL, TIMESTAMP '2025-11-12 09:00:00', NULL),
(14, 6, 'Configurar SSL', FALSE, 3, 10, NULL, NULL, TIMESTAMP '2025-11-12 09:00:00', NULL);

-- =====================================================
-- 17. TAREFA_COMENTARIO (Comentários nas Tarefas)
-- =====================================================
MERGE INTO TAREFA_COMENTARIO (ID_COMENTARIO, TEXTO_COMENTARIO, DATA_CRIACAO, ID_TAREFA, ID_AUTOR)
KEY(ID_COMENTARIO) VALUES
(1, 'Iniciando a preparação da apresentação. Vou seguir o modelo do último trimestre.', TIMESTAMP '2025-11-05 10:00:00', 1, 1),
(2, 'Preciso de acesso ao dashboard de métricas para coletar os dados.', TIMESTAMP '2025-11-06 14:30:00', 2, 3),
(3, '@alice.admin pode me dar acesso?', TIMESTAMP '2025-11-06 14:35:00', 2, 3),
(4, 'Acesso concedido!', TIMESTAMP '2025-11-06 15:00:00', 2, 1),
(5, 'Documentação atualizada conforme feedback da reunião.', TIMESTAMP '2025-11-08 16:00:00', 3, 2),
(6, 'Encontrei um bug durante a implementação. Abrindo issue.', TIMESTAMP '2025-11-11 11:00:00', 4, 5),
(7, 'Bug corrigido! Podemos seguir.', TIMESTAMP '2025-11-11 15:00:00', 4, 5),
(8, 'Ata enviada para todos os participantes.', TIMESTAMP '2025-11-09 10:00:00', 5, 2),
(9, 'Qual região da AWS vamos usar?', TIMESTAMP '2025-11-12 10:00:00', 6, 5),
(10, 'Vamos usar us-east-1 conforme política de custos.', TIMESTAMP '2025-11-12 10:30:00', 6, 10);

-- =====================================================
-- 18. TAREFA_ANEXO (Anexos das Tarefas)
-- =====================================================
MERGE INTO TAREFA_ANEXO (ID_ANEXO, NOME_ARQUIVO, TIPO_ARQUIVO, TAMANHO_ARQUIVO, URL_ARQUIVO, DATA_UPLOAD, ID_TAREFA, ID_AUTOR)
KEY(ID_ANEXO) VALUES
(1, 'apresentacao_q4.pptx', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 2457600, '/uploads/tarefa/1/apresentacao_q4.pptx', TIMESTAMP '2025-11-05 11:00:00', 1, 1),
(2, 'metricas_outubro.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 524288, '/uploads/tarefa/2/metricas_outubro.xlsx', TIMESTAMP '2025-11-06 16:00:00', 2, 3),
(3, 'documentacao_v2.pdf', 'application/pdf', 1048576, '/uploads/tarefa/3/documentacao_v2.pdf', TIMESTAMP '2025-11-08 17:00:00', 3, 2),
(4, 'arquitetura_sistema.png', 'image/png', 256000, '/uploads/tarefa/4/arquitetura_sistema.png', TIMESTAMP '2025-11-10 14:00:00', 4, 5),
(5, 'diagrama_fluxo.drawio', 'application/xml', 128000, '/uploads/tarefa/4/diagrama_fluxo.drawio', TIMESTAMP '2025-11-10 14:30:00', 4, 5),
(6, 'ata_planejamento_q4.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 102400, '/uploads/tarefa/5/ata_planejamento_q4.docx', TIMESTAMP '2025-11-09 10:00:00', 5, 2),
(7, 'servidor_config.yaml', 'application/x-yaml', 4096, '/uploads/tarefa/6/servidor_config.yaml', TIMESTAMP '2025-11-12 11:00:00', 6, 10),
(8, 'wireframe_home.fig', 'application/octet-stream', 512000, '/uploads/tarefa/7/wireframe_home.fig', TIMESTAMP '2025-11-20 15:00:00', 7, 5);

-- =====================================================
-- 19. TAREFA_HISTORY (Histórico de Alterações das Tarefas)
-- =====================================================
MERGE INTO TAREFA_HISTORY (ID, ID_TAREFA, ID_USUARIO, ACTION_TYPE, FIELD_NAME, OLD_VALUE, NEW_VALUE, DESCRIPTION, CREATED_AT)
KEY(ID) VALUES
-- Tarefa 1
(1, 1, 1, 'CREATED', NULL, NULL, NULL, 'Tarefa criada', TIMESTAMP '2025-11-05 09:00:00'),
(2, 1, 1, 'CHECKLIST_ITEM_ADDED', NULL, NULL, 'Definir estrutura dos slides', 'Item de checklist adicionado', TIMESTAMP '2025-11-05 09:05:00'),
(3, 1, 1, 'CHECKLIST_ITEM_COMPLETED', NULL, NULL, 'Definir estrutura dos slides', 'Item de checklist concluído', TIMESTAMP '2025-11-06 10:00:00'),
-- Tarefa 2
(4, 2, 3, 'CREATED', NULL, NULL, NULL, 'Tarefa criada', TIMESTAMP '2025-11-06 08:00:00'),
(5, 2, 3, 'STATUS_CHANGED', 'status', 'TODO', 'IN_PROGRESS', 'Status alterado', TIMESTAMP '2025-11-06 09:00:00'),
(6, 2, 3, 'PROGRESS_UPDATED', 'progresso', '0', '30', 'Progresso atualizado para 30%', TIMESTAMP '2025-11-07 15:00:00'),
-- Tarefa 3
(7, 3, 2, 'CREATED', NULL, NULL, NULL, 'Tarefa criada', TIMESTAMP '2025-11-08 08:00:00'),
(8, 3, 2, 'STATUS_CHANGED', 'status', 'TODO', 'IN_PROGRESS', 'Status alterado', TIMESTAMP '2025-11-08 09:00:00'),
(9, 3, 2, 'STATUS_CHANGED', 'status', 'IN_PROGRESS', 'REVIEW', 'Status alterado', TIMESTAMP '2025-11-09 17:00:00'),
(10, 3, 2, 'PROGRESS_UPDATED', 'progresso', '0', '80', 'Progresso atualizado para 80%', TIMESTAMP '2025-11-09 17:00:00'),
-- Tarefa 4
(11, 4, 5, 'CREATED', NULL, NULL, NULL, 'Tarefa criada', TIMESTAMP '2025-11-10 08:00:00'),
(12, 4, 5, 'STATUS_CHANGED', 'status', 'TODO', 'IN_PROGRESS', 'Status alterado', TIMESTAMP '2025-11-10 09:00:00'),
(13, 4, 5, 'CHECKLIST_ITEM_COMPLETED', NULL, NULL, 'Criar branch feature', 'Item de checklist concluído', TIMESTAMP '2025-11-10 11:00:00'),
(14, 4, 5, 'CHECKLIST_ITEM_COMPLETED', NULL, NULL, 'Implementar backend', 'Item de checklist concluído', TIMESTAMP '2025-11-11 17:00:00'),
(15, 4, 5, 'PROGRESS_UPDATED', 'progresso', '0', '45', 'Progresso atualizado para 45%', TIMESTAMP '2025-11-11 17:00:00'),
-- Tarefa 5
(16, 5, 2, 'CREATED', NULL, NULL, NULL, 'Tarefa criada', TIMESTAMP '2025-11-08 14:00:00'),
(17, 5, 2, 'STATUS_CHANGED', 'status', 'TODO', 'DONE', 'Status alterado', TIMESTAMP '2025-11-09 10:00:00'),
(18, 5, 2, 'PROGRESS_UPDATED', 'progresso', '0', '100', 'Progresso atualizado para 100%', TIMESTAMP '2025-11-09 10:00:00');

-- =====================================================
-- 20. NOTIFICACAO (Notificações Gerais - IDs 1..10)
-- =====================================================
MERGE INTO NOTIFICACAO (ID_NOTIFICACAO, MENSAGEM_NOTIFICACAO, TIPO_NOTIFICACAO, ID_DESTINATARIO)
KEY(ID_NOTIFICACAO) VALUES
(1, 'Sua reunião vai começar em 10 minutos', 'EMAIL', 1),
(2, 'Você foi adicionado à reunião de revisão', 'CONSOLE', 3),
(3, 'Tarefa concluída com sucesso', 'PUSH', 2),
(4, 'Novo projeto criado', 'EMAIL', 8),
(5, 'Lembrete de daily', 'PUSH', 5),
(6, 'Ata disponível para leitura', 'EMAIL', 10),
(7, 'Alteração na sala da reunião', 'PUSH', 7),
(8, 'Convite para workshop', 'EMAIL', 4),
(9, 'Feedback da entrevista pendente', 'CONSOLE', 9),
(10, 'Relatório mensal gerado', 'EMAIL', 8);

-- =====================================================
-- 21. NOTIFICACOES_TAREFA (Notificações de Tarefas)
-- =====================================================
MERGE INTO notificacoes_tarefa (id, tarefa_id, usuario_id, tipo, titulo, mensagem, lida, created_at, agendada_para)
KEY(id) VALUES
(1, 1, 1, 'VENCENDO', 'Prazo se aproximando', 'A tarefa "Preparar apresentação" vence em 2 dias', FALSE, TIMESTAMP '2025-11-08 08:00:00', NULL),
(2, 4, 5, 'ATRIBUICAO', 'Nova tarefa atribuída', 'Você foi atribuído à tarefa "Implementar nova funcionalidade"', TRUE, TIMESTAMP '2025-11-10 09:00:00', NULL),
(3, 2, 3, 'COMENTARIO', 'Novo comentário', 'Alice Admin comentou na tarefa "Coletar métricas"', TRUE, TIMESTAMP '2025-11-06 15:00:00', NULL),
(4, 3, 2, 'COMENTARIO', 'Status alterado', 'A tarefa "Revisar documentação" foi movida para "Em Revisão"', TRUE, TIMESTAMP '2025-11-09 17:00:00', NULL),
(5, 6, 10, 'VENCENDO', 'Prazo se aproximando', 'A tarefa "Configurar servidor" vence em 5 dias', FALSE, TIMESTAMP '2025-11-13 08:00:00', NULL),
(6, 8, 8, 'ATRIBUICAO', 'Nova tarefa atribuída', 'Você foi atribuído à tarefa "Aprovar orçamento"', FALSE, TIMESTAMP '2025-11-15 09:00:00', NULL),
(7, 5, 2, 'COMENTARIO', 'Tarefa concluída', 'A tarefa "Fechar ata e enviar" foi concluída', TRUE, TIMESTAMP '2025-11-09 10:00:00', NULL),
(8, 4, 6, 'COMENTARIO', 'Você foi mencionado', 'Daniel Desenvolvedor mencionou você em um comentário', FALSE, TIMESTAMP '2025-11-11 12:00:00', NULL);

-- =====================================================
-- 22. TEMPLATE_TAREFAS (Templates de Tarefas)
-- =====================================================
MERGE INTO TEMPLATE_TAREFAS (ID, TITULO, DESCRICAO, PRIORIDADE, ESTIMADA_HORAS)
KEY(ID) VALUES
(1, 'Bug Fix', 'Template para correção de bugs', 'ALTA', 4),
(2, 'Nova Feature', 'Template para desenvolvimento de novas funcionalidades', 'MEDIA', 16),
(3, 'Documentação', 'Template para criação/atualização de documentação', 'BAIXA', 8),
(4, 'Code Review', 'Template para revisão de código', 'MEDIA', 2),
(5, 'Reunião de Alinhamento', 'Template para preparação de reuniões', 'BAIXA', 1),
(6, 'Deploy', 'Template para processo de deploy', 'CRITICA', 4),
(7, 'Análise de Requisitos', 'Template para análise e levantamento de requisitos', 'ALTA', 8),
(8, 'Testes', 'Template para criação de testes automatizados', 'MEDIA', 6);

-- =====================================================
-- 23. TEMPLATE_TAREFA_TAGS (Tags dos Templates)
-- =====================================================
MERGE INTO TEMPLATE_TAREFA_TAGS (TEMPLATE_TAREFA_ID, TAG)
KEY(TEMPLATE_TAREFA_ID, TAG) VALUES
(1, 'bug'), (1, 'fix'), (1, 'urgent'),
(2, 'feature'), (2, 'development'), (2, 'new'),
(3, 'docs'), (3, 'documentation'),
(4, 'review'), (4, 'code-quality'),
(5, 'meeting'), (5, 'planning'),
(6, 'deploy'), (6, 'production'), (6, 'devops'),
(7, 'analysis'), (7, 'requirements'),
(8, 'tests'), (8, 'qa'), (8, 'automation');

-- =====================================================
-- 24. TEMPLATE_TAREFA_DEPENDENCIAS (Dependências dos Templates)
-- =====================================================
MERGE INTO TEMPLATE_TAREFA_DEPENDENCIAS (TEMPLATE_TAREFA_ID, DEPENDENCIA)
KEY(TEMPLATE_TAREFA_ID, DEPENDENCIA) VALUES
(2, 'Análise de Requisitos'),
(4, 'Implementação'),
(6, 'Code Review'), (6, 'Testes'),
(8, 'Implementação');

-- =====================================================
-- 25. REINICIAR SEQUENCES para valores altos
-- =====================================================
ALTER SEQUENCE SQ_PESSOA RESTART WITH 100;
ALTER SEQUENCE SQ_SALA RESTART WITH 100;
ALTER SEQUENCE SQ_REUNIAO RESTART WITH 100;
ALTER SEQUENCE SQ_PRESENCA RESTART WITH 100;
ALTER SEQUENCE SQ_TAREFA RESTART WITH 100;
ALTER SEQUENCE SQ_NOTIFICACAO RESTART WITH 100;
ALTER SEQUENCE SQ_PERMISSION RESTART WITH 100;
ALTER SEQUENCE SQ_ROLE RESTART WITH 100;
ALTER SEQUENCE HIBERNATE_SEQUENCE RESTART WITH 1000;
