import { useState, useEffect, useCallback } from 'react';
import {
    Tarefa,
    TarefaFormData,
    FiltroTarefas,
    StatisticsTarefas,
    NotificacaoTarefa,
    Assignee,
    StatusTarefa,
    KanbanBoard,
    TemplateTarefa,
    MovimentacaoTarefa
} from '../types/meetings';
import { meetingsApi } from '../services/meetingsApi';

interface UseTarefasProps {
    reuniaoId?: string;
    filtrosIniciais?: FiltroTarefas;
}

export function useTarefas({ reuniaoId, filtrosIniciais }: UseTarefasProps = {}) {
    // Estados principais
    const [tarefas, setTarefas] = useState<Tarefa[]>([]);
    const [kanbanBoard, setKanbanBoard] = useState<KanbanBoard | null>(null);
    const [templates, setTemplates] = useState<TemplateTarefa[]>([]);
    const [assigneesDisponiveis, setAssigneesDisponiveis] = useState<Assignee[]>([]);

    // Estados de controle
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [statistics, setStatistics] = useState<StatisticsTarefas | null>(null);
    const [notificacoes, setNotificacoes] = useState<NotificacaoTarefa[]>([]);
    const [filtros, setFiltros] = useState<FiltroTarefas>(filtrosIniciais || {});

    // Estados UI
    const [tarefaSelecionada, setTarefaSelecionada] = useState<Tarefa | null>(null);
    const [exibirFormulario, setExibirFormulario] = useState(false);
    const [exibirDetalhes, setExibirDetalhes] = useState(false);
    const [exibirKanban, setExibirKanban] = useState(true);

    // Carregar dados iniciais
    useEffect(() => {
        carregarDados();
        carregarNotificacoes();
    }, [reuniaoId]);

    const carregarDados = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const [
                tarefasData,
                kanbanData,
                templatesData,
                assigneesData,
                statsData
            ] = await Promise.all([
                reuniaoId
                    ? meetingsApi.getTarefasPorReuniao(reuniaoId)
                    : meetingsApi.getAllTarefas(),
                meetingsApi.getKanbanBoard(reuniaoId),
                meetingsApi.getTemplatesTarefas(),
                meetingsApi.getAssigneesDisponiveis(),
                meetingsApi.getStatisticsTarefas()
            ]);

            console.log('🔍 DEBUG - Primeira tarefa:', tarefasData[0]);
            console.log('🔍 DEBUG - Project ID:', tarefasData[0]?.projectId);
            console.log('🔍 DEBUG - Project Name:', tarefasData[0]?.projectName);

            setTarefas(tarefasData);
            setKanbanBoard(kanbanData);
            setTemplates(templatesData);
            setAssigneesDisponiveis(assigneesData);
            setStatistics(statsData);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao carregar tarefas');
        } finally {
            setLoading(false);
        }
    }, [reuniaoId, filtros]);

    const carregarNotificacoes = useCallback(async () => {
        try {
            const notificacoesData = await meetingsApi.getNotificacoesTarefas();
            setNotificacoes(notificacoesData);
        } catch (err) {
            console.error('Erro ao carregar notificações:', err);
        }
    }, []);

    // CRUD de Tarefas
    const criarTarefa = useCallback(async (data: TarefaFormData) => {
        try {
            const novaTarefa = await meetingsApi.createTarefa({
                ...data,
                reuniaoId
            });

            setTarefas(prev => [...prev, novaTarefa]);
            return novaTarefa;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao criar tarefa');
            throw err;
        }
    }, [reuniaoId]);

    const atualizarTarefa = useCallback(async (id: string, data: Partial<TarefaFormData>) => {
        try {
            const tarefaAtualizada = await meetingsApi.updateTarefa(id, data);
            const idStr = String(id);

            // Preserve progresso unless the caller explicitly provided a progresso in the update data.
            const explicitProgressoProvided = typeof (data as any).progresso !== 'undefined';

            // Helper function para calcular o estado final da tarefa
            const computeTarefaParaState = (prev: Tarefa | undefined): Tarefa => {
                const progressoParaState = explicitProgressoProvided
                    ? (tarefaAtualizada.progresso ?? (prev?.progresso ?? 0))
                    : (prev?.progresso ?? (tarefaAtualizada.progresso ?? 0));
                return { ...tarefaAtualizada, progresso: progressoParaState };
            };

            // Atualizar lista de tarefas
            setTarefas(prevList => {
                const prev = prevList.find(t => String(t.id) === idStr);
                const tarefaParaState = computeTarefaParaState(prev);
                return prevList.map(t => String(t.id) === idStr ? tarefaParaState : t);
            });

            // Atualizar tarefaSelecionada independentemente (recalcula o estado)
            setTarefaSelecionada(prev => {
                console.log('🔄 [useTarefas] setTarefaSelecionada callback:', {
                    prevId: prev?.id,
                    idStr,
                    match: prev && String(prev.id) === idStr,
                    newResponsaveis: tarefaAtualizada.responsaveis,
                    newResponsavelPrincipalId: tarefaAtualizada.responsavelPrincipalId
                });
                if (prev && String(prev.id) === idStr) {
                    const updated = computeTarefaParaState(prev);
                    console.log('✅ [useTarefas] Atualizando tarefaSelecionada:', {
                        responsaveis: updated.responsaveis,
                        responsavelPrincipalId: updated.responsavelPrincipalId
                    });
                    return updated;
                }
                return prev;
            });

            // Retornar a tarefa atualizada (sem preservar progresso antigo para o retorno)
            return tarefaAtualizada;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao atualizar tarefa');
            throw err;
        }
    }, []);

    const deletarTarefa = useCallback(async (id: string) => {
        try {
            await meetingsApi.deleteTarefa(id);
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

    // Movimentação no Kanban
    const moverTarefa = useCallback(async (tarefaId: string, novoStatus: StatusTarefa, newPosition?: number) => {
        const idStr = String(tarefaId);

        // Buscar tarefa atual para validação (usando ref para evitar stale closure)
        let tarefaAnterior: Tarefa | undefined;
        setTarefas(prevList => {
            tarefaAnterior = prevList.find(t => String(t.id) === idStr);
            return prevList; // Não altera ainda
        });

        if (!tarefaAnterior) return;

        try {
            const tarefaAtualizada = await meetingsApi.moverTarefa(tarefaId, novoStatus, newPosition);

            let tarefaParaState: Tarefa = tarefaAtualizada;

            // Atualizar lista de tarefas usando functional update
            setTarefas(prevList => {
                const prev = prevList.find(t => String(t.id) === idStr);
                const prevProgress = prev?.progresso ?? 0;
                tarefaParaState = { ...tarefaAtualizada, progresso: tarefaAtualizada.progresso ?? prevProgress };
                return prevList.map(t => String(t.id) === idStr ? tarefaParaState : t);
            });

            // Registrar movimentação
            const movimentacao: MovimentacaoTarefa = {
                tarefaId: Number(tarefaId),
                statusAnterior: tarefaAnterior.status ?? StatusTarefa.TODO,
                statusNovo: novoStatus,
                usuarioId: 'current-user',
                usuarioNome: 'Usuário Atual',
                timestamp: new Date().toISOString()
            };

            await meetingsApi.registrarMovimentacao(movimentacao);

            return tarefaParaState;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao mover tarefa');
            throw err;
        }
    }, []);

    // Comentários
    const adicionarComentario = useCallback(async (tarefaId: string, conteudo: string, mencoes?: string[]) => {
        try {
            const comentario = await meetingsApi.adicionarComentario(tarefaId, conteudo, mencoes);

            setTarefas(prev => prev.map(t =>
                t.id === tarefaId
                    ? { ...t, comentarios: [...t.comentarios, comentario] }
                    : t
            ));

            if (tarefaSelecionada?.id === tarefaId) {
                setTarefaSelecionada(prev => prev ? {
                    ...prev,
                    comentarios: [...prev.comentarios, comentario]
                } : null);
            }

            return comentario;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao adicionar comentário');
            throw err;
        }
    }, [tarefaSelecionada]);

    const atualizarComentario = useCallback(async (tarefaId: string, comentarioId: string, conteudo: string) => {
        try {
            const comentarioAtualizado = await meetingsApi.atualizarComentario(tarefaId, comentarioId, conteudo);
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
            await meetingsApi.deletarComentario(tarefaId, comentarioId);
            setTarefas(prev => prev.map(t => t.id === tarefaId ? { ...t, comentarios: t.comentarios.filter(c => c.id !== comentarioId) } : t));
            if (tarefaSelecionada?.id === tarefaId) {
                setTarefaSelecionada(prev => prev ? { ...prev, comentarios: prev.comentarios.filter(c => c.id !== comentarioId) } : prev);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao remover comentário');
            throw err;
        }
    }, [tarefaSelecionada]);

    // Anexos
    const anexarArquivo = useCallback(async (tarefaId: string, arquivo: File) => {
        try {
            const anexo = await meetingsApi.anexarArquivo(tarefaId, arquivo);

            setTarefas(prev => prev.map(t =>
                t.id === tarefaId
                    ? { ...t, anexos: [...t.anexos, anexo] }
                    : t
            ));

            if (tarefaSelecionada?.id === tarefaId) {
                setTarefaSelecionada(prev => prev ? {
                    ...prev,
                    anexos: [...prev.anexos, anexo]
                } : null);
            }

            return anexo;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao anexar arquivo');
            throw err;
        }
    }, [tarefaSelecionada]);

    // Responsáveis
    const atribuirTarefa = useCallback(async (tarefaId: string, responsavelId: string, principal = false) => {
        try {
            const tarefaAtualizada = await meetingsApi.atribuirTarefa(tarefaId, responsavelId, principal);
            const idStr = String(tarefaId);

            let tarefaParaState: Tarefa = tarefaAtualizada;

            // Atualizar lista de tarefas usando functional update
            setTarefas(prevList => {
                const prev = prevList.find(t => String(t.id) === idStr);
                tarefaParaState = { ...tarefaAtualizada, progresso: tarefaAtualizada.progresso ?? (prev?.progresso ?? 0) };
                return prevList.map(t => String(t.id) === idStr ? tarefaParaState : t);
            });

            // Usar functional update para atualizar tarefaSelecionada
            setTarefaSelecionada(prev => {
                if (prev && String(prev.id) === idStr) {
                    return tarefaParaState;
                }
                return prev;
            });

            return tarefaParaState;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao atribuir tarefa');
            throw err;
        }
    }, []);

    // Progresso
    const atualizarProgresso = useCallback(async (tarefaId: string, progresso: number) => {
        try {
            const tarefaAtualizada = await meetingsApi.atualizarProgresso(tarefaId, progresso);
            const idStr = String(tarefaId);

            let tarefaParaState: Tarefa = tarefaAtualizada;

            // Atualizar lista de tarefas usando functional update
            setTarefas(prevList => {
                // Preserve the current status locally: some backends may change status when progresso reaches 100%
                const prev = prevList.find(t => String(t.id) === idStr);
                const prevStatus = prev?.status;
                // If backend modified status, keep the previous status in the local state
                tarefaParaState = { ...tarefaAtualizada, status: prevStatus ?? tarefaAtualizada.status };
                return prevList.map(t => String(t.id) === idStr ? tarefaParaState : t);
            });

            // Usar functional update para atualizar tarefaSelecionada
            setTarefaSelecionada(prev => {
                if (prev && String(prev.id) === idStr) {
                    return tarefaParaState;
                }
                return prev;
            });

            return tarefaParaState;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao atualizar progresso');
            throw err;
        }
    }, []);

    // Filtros e Busca
    const aplicarFiltros = useCallback(async (novosFiltros: FiltroTarefas) => {
        setFiltros(novosFiltros);

        try {
            setLoading(true);
            const tarefasData = await meetingsApi.getAllTarefas(novosFiltros);

            // Client-side filtering fallback
            const filteredTarefas = tarefasData.filter(tarefa => {
                // Filter by Assignee
                if (novosFiltros.responsaveis && novosFiltros.responsaveis.length > 0) {
                    const hasAssignee = tarefa.responsaveis.some(r => novosFiltros.responsaveis?.includes(r.id));
                    if (!hasAssignee) return false;
                }

                // Filter by Status
                if (novosFiltros.status && novosFiltros.status.length > 0) {
                    if (!novosFiltros.status.includes(tarefa.status)) return false;
                }

                // Filter by Project
                if (novosFiltros.projectName && novosFiltros.projectName.length > 0) {
                    if (!tarefa.projectName || !novosFiltros.projectName.includes(tarefa.projectName)) return false;
                }

                // Filter by Date Range
                if (novosFiltros.prazo_tarefaInicio) {
                    if (!tarefa.prazo_tarefa || tarefa.prazo_tarefa < novosFiltros.prazo_tarefaInicio) return false;
                }
                if (novosFiltros.prazo_tarefaFim) {
                    if (!tarefa.prazo_tarefa || tarefa.prazo_tarefa > novosFiltros.prazo_tarefaFim) return false;
                }

                // Filter by "Vencendo" (Due in 3 days)
                if (novosFiltros.vencendo) {
                    if (!tarefa.prazo_tarefa) return false;
                    const hoje = new Date();
                    hoje.setHours(0, 0, 0, 0);
                    const prazo = new Date(tarefa.prazo_tarefa + 'T00:00:00');
                    const diffTime = prazo.getTime() - hoje.getTime();
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    if (diffDays < 0 || diffDays > 3) return false;
                }

                // Filter by "Atrasadas"
                if (novosFiltros.atrasadas) {
                    if (!tarefa.prazo_tarefa) return false;
                    const hoje = new Date();
                    hoje.setHours(0, 0, 0, 0);
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
            const tarefasData = await meetingsApi.buscarTarefas(termo, filtros);
            setTarefas(tarefasData);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro na busca');
        } finally {
            setLoading(false);
        }
    }, [filtros]);

    // Templates
    const criarTarefasPorTemplate = useCallback(async (templateId: string, dados: {
        responsaveisIds?: string[];
        prazo_tarefa?: string[];
    }) => {
        try {
            const novasTarefas = await meetingsApi.criarTarefasPorTemplate(templateId, {
                ...dados,
                reuniaoId
            });

            setTarefas(prev => [...prev, ...novasTarefas]);
            return novasTarefas;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao criar tarefas por template');
            throw err;
        }
    }, [reuniaoId]);

    // Notificações
    const marcarNotificacaoLida = useCallback(async (notificacaoId: string) => {
        try {
            await meetingsApi.marcarNotificacaoLida(notificacaoId);
            setNotificacoes(prev => prev.map(n =>
                n.id === notificacaoId ? { ...n, lida: true } : n
            ));
        } catch (err) {
            console.error('Erro ao marcar notificação como lida:', err);
        }
    }, []);

    // Utilitários
    const duplicarTarefa = useCallback(async (tarefaId: string, modificacoes?: Partial<TarefaFormData>) => {
        try {
            const novaTarefa = await meetingsApi.duplicarTarefa(tarefaId, modificacoes);
            setTarefas(prev => [...prev, novaTarefa]);
            return novaTarefa;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao duplicar tarefa');
            throw err;
        }
    }, []);

    const getTarefasVencendo = useCallback(async (dias = 3) => {
        try {
            return await meetingsApi.getTarefasVencendo(dias);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao buscar tarefas vencendo');
            throw err;
        }
    }, []);

    const getMinhasTarefas = useCallback(async () => {
        try {
            const minhasTarefas = await meetingsApi.getMinhasTarefas();
            setTarefas(minhasTarefas);
            return minhasTarefas;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao carregar minhas tarefas');
            throw err;
        }
    }, []);

    // Estatísticas em tempo real
    const atualizarStatistics = useCallback(async () => {
        try {
            const statsData = await meetingsApi.getStatisticsTarefas();
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

        // Controles UI
        setTarefaSelecionada,
        setExibirFormulario,
        setExibirDetalhes,
        setExibirKanban,
        setFiltros,
        setError
    };
}
