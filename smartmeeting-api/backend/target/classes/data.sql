-- PESSOA (IDs 1..10)
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

-- SALA (IDs 1..10)
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

-- PROJECT (IDs 1..10)
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

-- REUNIAO (IDs 1..10)
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

-- REUNIAO_PARTICIPANTES (JOIN TABLE)
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

-- PRESENCA (IDs 1..10)
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

-- TAREFA (IDs 1..10)
MERGE INTO TAREFA (ID_TAREFA, DESCRICAO_TAREFA, PRAZO_TAREFA, CONCLUIDA_TAREFA, STATUS_TAREFA, PRIORIDADE_TAREFA, DATA_INICIO_TAREFA, ESTIMADO_HORAS_TAREFA, ID_RESPONSAVEL, ID_REUNIAO, ID_PROJECT)
KEY(ID_TAREFA) VALUES
(1, 'Preparar apresentação', DATE '2025-11-10', FALSE, 'TODO', 'ALTA', DATE '2025-11-05', 4.0, 1, 1, 1),
(2, 'Coletar métricas', DATE '2025-11-12', FALSE, 'IN_PROGRESS', 'MEDIA', DATE '2025-11-06', 2.5, 3, 2, 1),
(3, 'Revisar documentação', DATE '2025-11-15', FALSE, 'REVIEW', 'ALTA', DATE '2025-11-08', 6.0, 2, 1, 1),
(4, 'Implementar nova funcionalidade', DATE '2025-11-20', FALSE, 'IN_PROGRESS', 'CRITICA', DATE '2025-11-10', 16.0, 5, 2, 1),
(5, 'Fechar ata e enviar', DATE '2025-11-09', TRUE, 'DONE', 'BAIXA', DATE '2025-11-08', 1.0, 2, 3, 3),
(6, 'Configurar servidor', DATE '2025-11-18', FALSE, 'TODO', 'ALTA', DATE '2025-11-12', 8.0, 10, 5, 4),
(7, 'Criar wireframes', DATE '2025-12-05', FALSE, 'TODO', 'MEDIA', DATE '2025-11-20', 12.0, 5, 4, 5),
(8, 'Aprovar orçamento', DATE '2025-11-25', FALSE, 'TODO', 'CRITICA', DATE '2025-11-15', 3.0, 8, 3, 3),
(9, 'Contratar buffet', DATE '2025-12-10', FALSE, 'TODO', 'BAIXA', DATE '2025-11-25', 2.0, 9, 6, 7),
(10, 'Atualizar planilha financeira', DATE '2025-11-30', FALSE, 'TODO', 'MEDIA', DATE '2025-11-20', 4.5, 7, 10, 1);

-- NOTIFICACAO (IDs 1..10)
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

-- Sequências
CREATE SEQUENCE IF NOT EXISTS SQ_PESSOA START WITH 100;
CREATE SEQUENCE IF NOT EXISTS SQ_SALA START WITH 100;
CREATE SEQUENCE IF NOT EXISTS SQ_REUNIAO START WITH 100;
CREATE SEQUENCE IF NOT EXISTS SQ_PRESENCA START WITH 100;
CREATE SEQUENCE IF NOT EXISTS SQ_TAREFA START WITH 100;
CREATE SEQUENCE IF NOT EXISTS SQ_NOTIFICACAO START WITH 100;
ALTER SEQUENCE SQ_PESSOA RESTART WITH 100;
ALTER SEQUENCE SQ_SALA RESTART WITH 100;
ALTER SEQUENCE SQ_REUNIAO RESTART WITH 100;
ALTER SEQUENCE SQ_PRESENCA RESTART WITH 100;
ALTER SEQUENCE SQ_TAREFA RESTART WITH 100;
ALTER SEQUENCE SQ_NOTIFICACAO RESTART WITH 100;
