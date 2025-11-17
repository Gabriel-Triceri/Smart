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

    // 🔧 **CORREÇÃO APLICADA AQUI**
    // Evita que o modal de detalhes reabra sozinho após recarregar tarefas
    useEffect(() => {
        setExibirDetalhes(false);
        setTarefaSelecionada(null);
    }, [tarefas]);

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

            setTarefas(prev => prev.map(t => t.id === id ? tarefaAtualizada : t));
            if (tarefaSelecionada?.id === id) {
                setTarefaSelecionada(tarefaAtualizada);
            }

            return tarefaAtualizada;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao atualizar tarefa');
            throw err;
        }
    }, [tarefaSelecionada]);

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
        const tarefa = tarefas.find(t => t.id === tarefaId);
        if (!tarefa) return;

        try {
            const tarefaAtualizada = await meetingsApi.moverTarefa(tarefaId, novoStatus, newPosition);

            setTarefas(prev => prev.map(t =>
                t.id === tarefaId ? tarefaAtualizada : t
            ));

            const movimentacao: MovimentacaoTarefa = {
                tarefaId: Number(tarefaId),
                statusAnterior: tarefa.status ?? StatusTarefa.TODO,
                statusNovo: novoStatus,
                usuarioId: 'current-user',
                usuarioNome: 'Usuário Atual',
                timestamp: new Date().toISOString()
            };

            await meetingsApi.registrarMovimentacao(movimentacao);

            return tarefaAtualizada;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao mover tarefa');
            throw err;
        }
    }, [tarefas]);

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

            setTarefas(prev => prev.map(t => t.id === tarefaId ? tarefaAtualizada : t));

            if (tarefaSelecionada?.id === tarefaId) {
                setTarefaSelecionada(tarefaAtualizada);
            }

            return tarefaAtualizada;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao atribuir tarefa');
            throw err;
        }
    }, [tarefaSelecionada]);

    // Progresso
    const atualizarProgresso = useCallback(async (tarefaId: string, progresso: number) => {
        try {
            const tarefaAtualizada = await meetingsApi.atualizarProgresso(tarefaId, progresso);

            setTarefas(prev => prev.map(t => t.id === tarefaId ? tarefaAtualizada : t));

            if (tarefaSelecionada?.id === tarefaId) {
                setTarefaSelecionada(tarefaAtualizada);
            }

            return tarefaAtualizada;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao atualizar progresso');
            throw err;
        }
    }, [tarefaSelecionada]);

    // Filtros e Busca
    const aplicarFiltros = useCallback(async (novosFiltros: FiltroTarefas) => {
        setFiltros(novosFiltros);

        try {
            setLoading(true);
            const tarefasData = await meetingsApi.getAllTarefas(novosFiltros);
            setTarefas(tarefasData);
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
