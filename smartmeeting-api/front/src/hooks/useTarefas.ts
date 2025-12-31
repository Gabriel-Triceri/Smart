import { useState, useEffect, useCallback } from 'react';
import {
    Tarefa,
    TarefaFormData,
    FiltroTarefas,
    StatisticsTarefas,
    NotificacaoTarefa,
    Assignee,
    KanbanBoard,
    TemplateTarefa,
    ProjectDTO
} from '../types/meetings';
import { tarefaService } from '../services/tarefaService';
import { kanbanService } from '../services/kanbanService';
import { checklistService } from '../services/checklistService';
import { historyService } from '../services/historyService';
import { notificationService } from '../services/notificationService';
import { projectService } from '../services/projectService';

interface UseTarefasProps {
    reuniaoId?: string;
    projectId?: string;
    filtrosIniciais?: FiltroTarefas;
}

export function useTarefas({ reuniaoId, projectId, filtrosIniciais }: UseTarefasProps = {}) {
    const [tarefas, setTarefas] = useState<Tarefa[]>([]);
    const [kanbanBoard, setKanbanBoard] = useState<KanbanBoard | null>(null);
    const [templates, setTemplates] = useState<TemplateTarefa[]>([]);
    const [assigneesDisponiveis, setAssigneesDisponiveis] = useState<Assignee[]>([]);
    const [projects, setProjects] = useState<ProjectDTO[]>([]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [statistics, setStatistics] = useState<StatisticsTarefas | null>(null);
    const [notificacoes, setNotificacoes] = useState<NotificacaoTarefa[]>([]);
    const [filtros, setFiltros] = useState<FiltroTarefas>(filtrosIniciais || {});

    const [tarefaSelecionada, setTarefaSelecionada] = useState<Tarefa | null>(null);
    const [exibirFormulario, setExibirFormulario] = useState(false);
    const [exibirDetalhes, setExibirDetalhes] = useState(false);
    const [exibirKanban, setExibirKanban] = useState(true);

    useEffect(() => {
        carregarDados();
        carregarNotificacoes();
    }, [reuniaoId, projectId]);

    const carregarDados = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            // Preparar filtros para o backend
            const params: any = { ...filtros };
            if (projectId) {
                params.projectId = projectId;
            } else if (filtros.projectId && filtros.projectId.length > 0) {
                params.projectId = filtros.projectId[0];
            }

            // Fix: Fetch tasks directly from getAllTarefas instead of relying on getKanbanBoard
            // This bypasses the backend issue where getKanbanBoard ignores projectId
            const [
                kanbanData,
                listaTarefas,
                templatesData,
                assigneesData,
                statsData,
                projectsData
            ] = await Promise.all([
                kanbanService.getKanbanBoard(reuniaoId, projectId),
                tarefaService.getAllTarefas(params),
                checklistService.getTemplatesTarefas(),
                checklistService.getAssigneesDisponiveis(),
                historyService.getStatisticsTarefas(),
                projectService.getMyProjects()
            ]);

            setTarefas(listaTarefas);
            setKanbanBoard(kanbanData);
            setTemplates(templatesData);
            setAssigneesDisponiveis(assigneesData);
            setStatistics(statsData);
            setProjects(projectsData);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao carregar tarefas');
        } finally {
            setLoading(false);
        }
    }, [reuniaoId, filtros, projectId]);

    const carregarNotificacoes = useCallback(async () => {
        try {
            const notificacoesData = await notificationService.getNotificacoesTarefas();
            setNotificacoes(notificacoesData);
        } catch (err) {
            console.error('Erro ao carregar notificações:', err);
        }
    }, []);

    const criarTarefa = useCallback(async (data: TarefaFormData) => {
        try {
            const novaTarefa = await tarefaService.createTarefa({
                ...data,
                reuniaoId,
                projectId
            });
            setTarefas(prev => [...prev, novaTarefa]);
            return novaTarefa;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao criar tarefa');
            throw err;
        }
    }, [reuniaoId, projectId]);

    const atualizarTarefa = useCallback(async (id: string, data: Partial<TarefaFormData>) => {
        try {
            const tarefaAtualizada = await tarefaService.updateTarefa(id, data);
            const idStr = String(id);
            const explicitProgressoProvided = typeof (data as any).progresso !== 'undefined';

            const computeTarefaParaState = (prev: Tarefa | undefined): Tarefa => {
                const progressoParaState = explicitProgressoProvided
                    ? (tarefaAtualizada.progresso ?? (prev?.progresso ?? 0))
                    : (prev?.progresso ?? (tarefaAtualizada.progresso ?? 0));
                return { ...tarefaAtualizada, progresso: progressoParaState };
            };

            setTarefas(prevList => {
                const prev = prevList.find(t => String(t.id) === idStr);
                const tarefaParaState = computeTarefaParaState(prev);
                return prevList.map(t => String(t.id) === idStr ? tarefaParaState : t);
            });

            setTarefaSelecionada(prev => {
                if (prev && String(prev.id) === idStr) {
                    return computeTarefaParaState(prev);
                }
                return prev;
            });

            return tarefaAtualizada;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao atualizar tarefa');
            throw err;
        }
    }, []);

    const deletarTarefa = useCallback(async (id: string) => {
        try {
            await tarefaService.deleteTarefa(id);
            setTarefas(prev => prev.filter(t => t.id !== id));
            if (tarefaSelecionada?.id === id) {
                setTarefaSelecionada(null);
                setExibirDetalhes(false);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao deletar tarefa');
            throw err;
        }
    }, [tarefaSelecionada]);

    const moverTarefa = useCallback(async (tarefaId: string, colunaId: string, newPosition?: number) => {
        try {
            if (!colunaId) {
                setError('ID da coluna inválido');
                return;
            }

            console.log('Mover tarefa:', { tarefaId, colunaId, newPosition });

            // Chamada ao backend para mover a tarefa (String diretamente)
            const tarefaAtualizada = await tarefaService.moverTarefa(tarefaId, colunaId, newPosition);

            // Atualiza lista de tarefas no frontend
            setTarefas(prev => prev.map(t =>
                t.id === tarefaAtualizada.id ? tarefaAtualizada : t
            ));

            // Atualiza o Kanban local
            if (kanbanBoard) {
                setKanbanBoard(prev => {
                    if (!prev) return null;

                    const novasColunas = prev.colunas.map(coluna => {
                        // Remove a tarefa da coluna antiga
                        const tarefaNaColuna = coluna.tarefas.find(t => t.id === tarefaId);
                        if (tarefaNaColuna) {
                            return {
                                ...coluna,
                                tarefas: coluna.tarefas.filter(t => t.id !== tarefaId)
                            };
                        }

                        // Adiciona a tarefa na coluna nova
                        if (coluna.id.toString() === colunaId) {
                            const novasTarefas = [...coluna.tarefas];
                            const index = newPosition !== undefined ? newPosition : novasTarefas.length;
                            const tarefaComColumnId = { ...tarefaAtualizada, columnId: colunaId };
                            novasTarefas.splice(index, 0, tarefaComColumnId);
                            return { ...coluna, tarefas: novasTarefas };
                        }

                        return coluna;
                    });

                    return { ...prev, colunas: novasColunas };
                });
            }

            return tarefaAtualizada;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao mover tarefa');
            throw err;
        }
    }, [kanbanBoard]);



    const adicionarComentario = useCallback(async (tarefaId: string, conteudo: string, mencoes?: string[]) => {
        try {
            const comentario = await tarefaService.adicionarComentario(tarefaId, conteudo, mencoes);
            setTarefas(prev => prev.map(t =>
                t.id === tarefaId
                    ? { ...t, comentarios: [...t.comentarios, comentario] }
                    : t
            ));
            if (tarefaSelecionada?.id === tarefaId) {
                setTarefaSelecionada(prev => prev ? { ...prev, comentarios: [...prev.comentarios, comentario] } : null);
            }
            return comentario;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao adicionar comentário');
            throw err;
        }
    }, [tarefaSelecionada]);

    const atualizarComentario = useCallback(async (tarefaId: string, comentarioId: string, conteudo: string) => {
        try {
            const comentarioAtualizado = await tarefaService.atualizarComentario(tarefaId, comentarioId, conteudo);
            setTarefas(prev => prev.map(t => t.id === tarefaId ? { ...t, comentarios: t.comentarios.map(c => c.id === comentarioId ? comentarioAtualizado : c) } : t));
            if (tarefaSelecionada?.id === tarefaId) {
                setTarefaSelecionada(prev => prev ? { ...prev, comentarios: prev.comentarios.map(c => c.id === comentarioId ? comentarioAtualizado : c) } : prev);
            }
            return comentarioAtualizado;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao atualizar comentário');
            throw err;
        }
    }, [tarefaSelecionada]);

    const removerComentario = useCallback(async (tarefaId: string, comentarioId: string) => {
        try {
            await tarefaService.deletarComentario(tarefaId, comentarioId);
            setTarefas(prev => prev.map(t => t.id === tarefaId ? { ...t, comentarios: t.comentarios.filter(c => c.id !== comentarioId) } : t));
            if (tarefaSelecionada?.id === tarefaId) {
                setTarefaSelecionada(prev => prev ? { ...prev, comentarios: prev.comentarios.filter(c => c.id !== comentarioId) } : prev);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao remover comentário');
            throw err;
        }
    }, [tarefaSelecionada]);

    const anexarArquivo = useCallback(async (tarefaId: string, arquivo: File) => {
        try {
            const anexo = await tarefaService.anexarArquivo(tarefaId, arquivo);
            setTarefas(prev => prev.map(t =>
                t.id === tarefaId
                    ? { ...t, anexos: [...t.anexos, anexo] }
                    : t
            ));
            if (tarefaSelecionada?.id === tarefaId) {
                setTarefaSelecionada(prev => prev ? { ...prev, anexos: [...prev.anexos, anexo] } : null);
            }
            return anexo;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao anexar arquivo');
            throw err;
        }
    }, [tarefaSelecionada]);

    const atribuirTarefa = useCallback(async (tarefaId: string, responsavelId: string, principal = false) => {
        try {
            const tarefaAtualizada = await tarefaService.atribuirTarefa(tarefaId, responsavelId, principal);
            const idStr = String(tarefaId);
            let tarefaParaState: Tarefa = tarefaAtualizada;

            setTarefas(prevList => {
                const prev = prevList.find(t => String(t.id) === idStr);
                tarefaParaState = { ...tarefaAtualizada, progresso: tarefaAtualizada.progresso ?? (prev?.progresso ?? 0) };
                return prevList.map(t => String(t.id) === idStr ? tarefaParaState : t);
            });

            setTarefaSelecionada(prev => {
                if (prev && String(prev.id) === idStr) return tarefaParaState;
                return prev;
            });

            return tarefaParaState;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao atribuir tarefa');
            throw err;
        }
    }, []);

    const atualizarProgresso = useCallback(async (tarefaId: string, progresso: number) => {
        try {
            const tarefaAtualizada = await tarefaService.atualizarProgresso(tarefaId, progresso);
            const idStr = String(tarefaId);
            let tarefaParaState: Tarefa = tarefaAtualizada;

            setTarefas(prevList => {
                const prev = prevList.find(t => String(t.id) === idStr);
                const prevStatus = prev?.status;
                tarefaParaState = { ...tarefaAtualizada, status: prevStatus ?? tarefaAtualizada.status };
                return prevList.map(t => String(t.id) === idStr ? tarefaParaState : t);
            });

            setTarefaSelecionada(prev => {
                if (prev && String(prev.id) === idStr) return tarefaParaState;
                return prev;
            });

            return tarefaParaState;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao atualizar progresso');
            throw err;
        }
    }, []);

    const aplicarFiltros = useCallback(async (novosFiltros: FiltroTarefas) => {
        setFiltros(novosFiltros);
        try {
            setLoading(true);
            
            // Preparar filtros para o backend
            const params: any = { ...novosFiltros };
            if (novosFiltros.projectId && novosFiltros.projectId.length > 0) {
                params.projectId = novosFiltros.projectId[0];
            }
            if (novosFiltros.responsaveis && novosFiltros.responsaveis.length > 0) {
                params.responsavelId = novosFiltros.responsaveis[0];
            }

            const tarefasData = await tarefaService.getAllTarefas(params);

            const filteredTarefas = tarefasData.filter(tarefa => {
                if (novosFiltros.responsaveis && novosFiltros.responsaveis.length > 0) {
                    // Fix: Convert r.id to string manually to match filter type
                    const hasAssignee = tarefa.responsaveis.some(r => novosFiltros.responsaveis?.includes(String(r.id)));
                    if (!hasAssignee) return false;
                }
                if (novosFiltros.status && novosFiltros.status.length > 0) {
                    if (!novosFiltros.status.includes(tarefa.status)) return false;
                }
                if (novosFiltros.projectId && novosFiltros.projectId.length > 0) {
                    // Fix: Convert tarefa.projectId to string manually
                    if (!tarefa.projectId || !novosFiltros.projectId.includes(String(tarefa.projectId))) return false;
                }
                if (novosFiltros.prazo_tarefaInicio) {
                    if (!tarefa.prazo_tarefa || tarefa.prazo_tarefa < novosFiltros.prazo_tarefaInicio) return false;
                }
                if (novosFiltros.prazo_tarefaFim) {
                    if (!tarefa.prazo_tarefa || tarefa.prazo_tarefa > novosFiltros.prazo_tarefaFim) return false;
                }
                if (novosFiltros.vencendo) {
                    if (!tarefa.prazo_tarefa) return false;
                    const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
                    const prazo = new Date(tarefa.prazo_tarefa + 'T00:00:00');
                    const diffDays = Math.ceil((prazo.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
                    if (diffDays < 0 || diffDays > 3) return false;
                }
                if (novosFiltros.atrasadas) {
                    if (!tarefa.prazo_tarefa) return false;
                    const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
                    const prazo = new Date(tarefa.prazo_tarefa + 'T00:00:00');
                    if (prazo >= hoje) return false;
                }
                return true;
            });

            setTarefas(filteredTarefas);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao aplicar filtros');
        } finally {
            setLoading(false);
        }
    }, []);

    const buscarTarefas = useCallback(async (termo: string) => {
        try {
            setLoading(true);
            const tarefasData = await tarefaService.buscarTarefas(termo, filtros);
            setTarefas(tarefasData);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro na busca');
        } finally {
            setLoading(false);
        }
    }, [filtros]);

    const criarTarefasPorTemplate = useCallback(async (templateId: string, dados: {
        responsaveisIds?: string[];
        prazo_tarefa?: string[];
    }) => {
        try {
            const novasTarefas = await tarefaService.criarTarefasPorTemplate(templateId, { ...dados, reuniaoId });
            setTarefas(prev => [...prev, ...novasTarefas]);
            return novasTarefas;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao criar tarefas por template');
            throw err;
        }
    }, [reuniaoId]);

    const marcarNotificacaoLida = useCallback(async (notificacaoId: string) => {
        try {
            await tarefaService.marcarNotificacaoLida(notificacaoId);
            setNotificacoes(prev => prev.map(n => n.id === notificacaoId ? { ...n, lida: true } : n));
        } catch (err) {
            console.error('Erro ao marcar notificação como lida:', err);
        }
    }, []);

    const duplicarTarefa = useCallback(async (tarefaId: string, modificacoes?: Partial<TarefaFormData>) => {
        try {
            const novaTarefa = await tarefaService.duplicarTarefa(tarefaId, modificacoes);
            setTarefas(prev => [...prev, novaTarefa]);
            return novaTarefa;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao duplicar tarefa');
            throw err;
        }
    }, []);

    const getTarefasVencendo = useCallback(async (dias = 3) => {
        try {
            return await tarefaService.getTarefasVencendo(dias);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao buscar tarefas vencendo');
            throw err;
        }
    }, []);

    const getMinhasTarefas = useCallback(async () => {
        try {
            const minhasTarefas = await tarefaService.getMinhasTarefas();
            setTarefas(minhasTarefas);
            return minhasTarefas;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao carregar minhas tarefas');
            throw err;
        }
    }, []);

    const atualizarStatistics = useCallback(async () => {
        try {
            const statsData = await tarefaService.getStatisticsTarefas();
            setStatistics(statsData);
        } catch (err) {
            console.error('Erro ao atualizar estatísticas:', err);
        }
    }, []);

    return {
        tarefas,
        kanbanBoard,
        templates,
        assigneesDisponiveis,
        projects,
        loading,
        error,
        statistics,
        notificacoes,
        filtros,
        tarefaSelecionada,
        exibirFormulario,
        exibirDetalhes,
        exibirKanban,


        criarTarefa,
        atualizarTarefa,
        deletarTarefa,
        moverTarefa,
        adicionarComentario,
        atualizarComentario,
        removerComentario,
        anexarArquivo,
        atribuirTarefa,
        atualizarProgresso,
        aplicarFiltros,
        buscarTarefas,
        criarTarefasPorTemplate,
        marcarNotificacaoLida,
        duplicarTarefa,
        getTarefasVencendo,
        getMinhasTarefas,
        atualizarStatistics,

        carregarDados,

        setTarefaSelecionada,
        setExibirFormulario,
        setExibirDetalhes,
        setExibirKanban,
        setFiltros,
        setError
    };
}
