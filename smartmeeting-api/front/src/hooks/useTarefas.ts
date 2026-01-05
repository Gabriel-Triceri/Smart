import { useState, useEffect, useCallback, useRef } from 'react';
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

/* --------------------
   Helper: normaliza um objeto Tarefa vindo da API
---------------------*/
function normalizeTarefa(raw: any): Tarefa {
    if (!raw) return {} as Tarefa;

    // Garante que arrays nunca sejam nulos
    const responsaveis = Array.isArray(raw.responsaveis) ? raw.responsaveis : [];
    const comentarios = Array.isArray(raw.comentarios) ? raw.comentarios : [];
    const anexos = Array.isArray(raw.anexos) ? raw.anexos : [];
    const checklist = Array.isArray(raw.checklist) ? raw.checklist : [];

    const normalized: Tarefa = {
        ...(raw as object) as Tarefa,
        id: String(raw.id || ''),
        progresso: raw.progresso !== undefined && raw.progresso !== null ? Number(raw.progresso) : 0,
        responsaveis,
        comentarios,
        anexos,
        checklist,
    };

    return normalized;
}


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

    // Cache refs to avoid redundant API calls for static/long-lived data
    const cacheRef = useRef<{
        templates?: TemplateTarefa[];
        assignees?: Assignee[];
        projects?: ProjectDTO[];
        lastFetch?: number;
    }>({});

    const carregarDados = useCallback(async (forceRefresh = false, filtrosAtuais?: FiltroTarefas) => {
        setLoading(true);
        setError(null);

        try {
            // Preparar filtros para o backend
            const filtrosParaUsar = filtrosAtuais || filtros;
            const params: any = { ...filtrosParaUsar };

            if (projectId) {
                params.projectId = projectId;
            } else if (filtrosParaUsar.projectId && filtrosParaUsar.projectId.length > 0) {
                params.projectId = filtrosParaUsar.projectId[0];
            }

            const now = Date.now();
            const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
            const isCacheValid = cacheRef.current.lastFetch && (now - cacheRef.current.lastFetch < CACHE_TTL);

            // Fetch dynamic data (tasks and board) always
            const dynamicPromises = [
                kanbanService.getKanbanBoard(reuniaoId, projectId),
                tarefaService.getAllTarefas(params),
                historyService.getStatisticsTarefas(),
            ];

            // Fetch static data only if not cached or forced
            const staticPromises = [];
            if (forceRefresh || !isCacheValid || !cacheRef.current.templates) {
                staticPromises.push(checklistService.getTemplatesTarefas());
            } else {
                staticPromises.push(Promise.resolve(cacheRef.current.templates || []));
            }

            if (forceRefresh || !isCacheValid || !cacheRef.current.assignees) {
                staticPromises.push(checklistService.getAssigneesDisponiveis());
            } else {
                staticPromises.push(Promise.resolve(cacheRef.current.assignees || []));
            }

            if (forceRefresh || !isCacheValid || !cacheRef.current.projects) {
                staticPromises.push(projectService.getMyProjects());
            } else {
                staticPromises.push(Promise.resolve(cacheRef.current.projects || []));
            }

            const [
                kanbanData,
                listaTarefas,
                statsData,
                templatesData,
                assigneesData,
                projectsData
            ] = await Promise.all([
                ...dynamicPromises,
                ...staticPromises
            ]);

            // Update state
            const normalizedTarefas = Array.isArray(listaTarefas) ? listaTarefas.map(normalizeTarefa) : [];
            setTarefas(normalizedTarefas);

            setKanbanBoard(kanbanData);
            setStatistics(statsData);
            setTemplates(templatesData);
            setAssigneesDisponiveis(assigneesData);
            setProjects(projectsData);

            // Update cache
            cacheRef.current = {
                templates: templatesData,
                assignees: assigneesData,
                projects: projectsData,
                lastFetch: now
            };
        } catch (err) {
            const errorMsg = 'Erro ao carregar dados das tarefas';
            setError(errorMsg);
            console.error(errorMsg, err);
        } finally {
            setLoading(false);
        }
    }, [reuniaoId, filtros, projectId]);

    useEffect(() => {
        carregarDados();
        carregarNotificacoes();
    }, [carregarDados]);


    const carregarNotificacoes = useCallback(async () => {
        try {
            const notificacoesData = await notificationService.getNotificacoesTarefas();
            setNotificacoes(notificacoesData);
        } catch (err) {
            // Silenciosamente loga o erro sem impactar a UI principal
            console.error('Falha ao carregar notificações em background:', err);
        }
    }, []);

    const criarTarefa = useCallback(async (data: TarefaFormData) => {
        setLoading(true);
        setError(null);
        try {
            const rawNovaTarefa = await tarefaService.createTarefa({
                ...data,
                reuniaoId,
                projectId
            });
            const novaTarefa = normalizeTarefa(rawNovaTarefa);
            setTarefas(prev => [...prev, novaTarefa]);
            return novaTarefa;
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Erro ao criar tarefa';
            setError(errorMsg);
            console.error('Erro ao criar tarefa:', err);
            throw err; // Relança o erro para o componente
        } finally {
            setLoading(false);
        }
    }, [reuniaoId, projectId]);

    const atualizarTarefa = useCallback(async (id: string, data: Partial<TarefaFormData>) => {
        setLoading(true);
        setError(null);
        try {
            const rawTarefaAtualizada = await tarefaService.updateTarefa(id, data);
            const tarefaAtualizada = normalizeTarefa(rawTarefaAtualizada);

            setTarefas(prevList =>
                prevList.map(t => (t.id === id ? tarefaAtualizada : t))
            );

            setTarefaSelecionada(prev =>
                prev && prev.id === id ? tarefaAtualizada : prev
            );

            return tarefaAtualizada;
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Erro ao atualizar tarefa';
            setError(errorMsg);
            console.error('Erro ao atualizar tarefa:', err);
            throw err; // Relança o erro
        } finally {
            setLoading(false);
        }
    }, []);

    const deletarTarefa = useCallback(async (id: string) => {
        setLoading(true);
        setError(null);
        try {
            await tarefaService.deleteTarefa(id);
            setTarefas(prev => prev.filter(t => t.id !== id));
            if (tarefaSelecionada?.id === id) {
                setTarefaSelecionada(null);
                setExibirDetalhes(false);
            }
            return true;
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Erro ao deletar tarefa';
            setError(errorMsg);
            console.error('Erro ao deletar tarefa:', err);
            throw err; // Relança o erro
        } finally {
            setLoading(false);
        }
    }, [tarefaSelecionada]);

    const moverTarefa = useCallback(async (tarefaId: string, colunaId: string, newPosition?: number) => {
        setLoading(true);
        setError(null);

        // Otimistic UI update
        let originalTarefas: Tarefa[] = [];
        setTarefas(prev => {
            originalTarefas = [...prev];
            const tarefa = prev.find(t => t.id === tarefaId);
            if (!tarefa) return prev;

            const outrasTarefas = prev.filter(t => t.id !== tarefaId);
            const tarefaAtualizada = { ...tarefa, status: colunaId }; // Assume-se que colunaId é o novo status
            outrasTarefas.splice(newPosition ?? outrasTarefas.length, 0, tarefaAtualizada);
            return outrasTarefas;
        });


        try {
            const rawTarefaAtualizada = await tarefaService.moverTarefa(tarefaId, colunaId, newPosition);
            const tarefaAtualizada = normalizeTarefa(rawTarefaAtualizada);

            // Confirma a atualização com dados do servidor
            setTarefas(prev => prev.map(t => t.id === tarefaId ? tarefaAtualizada : t));
            return tarefaAtualizada;

        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Erro ao mover tarefa';
            setError(errorMsg);
            console.error('Erro ao mover tarefa:', err);
            // Reverte a UI em caso de erro
            setTarefas(originalTarefas);
            throw err; // Relança o erro
        } finally {
            setLoading(false);
        }
    }, []);


    const adicionarComentario = useCallback(async (tarefaId: string, conteudo: string, mencoes?: string[]) => {
        setLoading(true);
        setError(null);
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
            const errorMsg = err instanceof Error ? err.message : 'Erro ao adicionar comentário';
            setError(errorMsg);
            console.error('Erro ao adicionar comentário:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [tarefaSelecionada]);

    const atualizarComentario = useCallback(async (tarefaId: string, comentarioId: string, conteudo: string) => {
        setLoading(true);
        setError(null);
        try {
            const comentarioAtualizado = await tarefaService.atualizarComentario(tarefaId, comentarioId, conteudo);
            setTarefas(prev => prev.map(t => t.id === tarefaId ? { ...t, comentarios: t.comentarios.map(c => c.id === comentarioId ? comentarioAtualizado : c) } : t));
            if (tarefaSelecionada?.id === tarefaId) {
                setTarefaSelecionada(prev => prev ? { ...prev, comentarios: prev.comentarios.map(c => c.id === comentarioId ? comentarioAtualizado : c) } : prev);
            }
            return comentarioAtualizado;
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Erro ao atualizar comentário';
            setError(errorMsg);
            console.error('Erro ao atualizar comentário:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [tarefaSelecionada]);

    const removerComentario = useCallback(async (tarefaId: string, comentarioId: string) => {
        setLoading(true);
        setError(null);
        try {
            await tarefaService.deletarComentario(tarefaId, comentarioId);
            setTarefas(prev => prev.map(t => t.id === tarefaId ? { ...t, comentarios: t.comentarios.filter(c => c.id !== comentarioId) } : t));
            if (tarefaSelecionada?.id === tarefaId) {
                setTarefaSelecionada(prev => prev ? { ...prev, comentarios: prev.comentarios.filter(c => c.id !== comentarioId) } : prev);
            }
            return true;
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Erro ao remover comentário';
            setError(errorMsg);
            console.error('Erro ao remover comentário:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [tarefaSelecionada]);

    const anexarArquivo = useCallback(async (tarefaId: string, arquivo: File) => {
        setLoading(true);
        setError(null);
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
            const errorMsg = err instanceof Error ? err.message : 'Erro ao anexar arquivo';
            setError(errorMsg);
            console.error('Erro ao anexar arquivo:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [tarefaSelecionada]);

    const atribuirTarefa = useCallback(async (tarefaId: string, responsavelId: string, principal = false) => {
        setLoading(true);
        setError(null);
        try {
            const rawTarefa = await tarefaService.atribuirTarefa(tarefaId, responsavelId, principal);
            const tarefaAtualizada = normalizeTarefa(rawTarefa);

            setTarefas(prevList =>
                prevList.map(t => (t.id === tarefaId ? tarefaAtualizada : t))
            );

            setTarefaSelecionada(prev =>
                prev && prev.id === tarefaId ? tarefaAtualizada : prev
            );

            return tarefaAtualizada;
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Erro ao atribuir tarefa';
            setError(errorMsg);
            console.error('Erro ao atribuir tarefa:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const aplicarFiltros = useCallback((novosFiltros: FiltroTarefas) => {
        setFiltros(novosFiltros);
        carregarDados(false, novosFiltros);
    }, [carregarDados]);


    const buscarTarefas = useCallback(async (termo: string) => {
        setLoading(true);
        setError(null);
        try {
            const tarefasData = await tarefaService.searchTarefas(termo);
            const normalized = Array.isArray(tarefasData) ? tarefasData.map(normalizeTarefa) : [];
            setTarefas(normalized);
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Erro ao buscar tarefas';
            setError(errorMsg);
            console.error('Erro ao buscar tarefas:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const atualizarProgresso = useCallback(async (tarefaId: string, progresso: number) => {
        setLoading(true);
        setError(null);
        try {
            const rawTarefa = await tarefaService.updateProgresso(tarefaId, progresso);
            const tarefaAtualizada = normalizeTarefa(rawTarefa);
            setTarefas(prev => prev.map(t => t.id === tarefaId ? tarefaAtualizada : t));
            if (tarefaSelecionada?.id === tarefaId) {
                setTarefaSelecionada(prev => prev ? tarefaAtualizada : null);
            }
            return tarefaAtualizada;
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Erro ao atualizar progresso';
            setError(errorMsg);
            console.error('Erro ao atualizar progresso:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [tarefaSelecionada]);

    return {
        tarefas,
        loading,
        error,
        statistics,
        notificacoes,
        filtros,
        tarefaSelecionada,
        exibirFormulario,
        exibirDetalhes,
        exibirKanban,
        kanbanBoard,
        templates,
        assigneesDisponiveis,
        projects,
        setFiltros,
        setTarefaSelecionada,
        setExibirFormulario,
        setExibirDetalhes,
        setExibirKanban,
        carregarDados,
        criarTarefa,
        atualizarTarefa,
        deletarTarefa,
        moverTarefa,
        adicionarComentario,
        atualizarComentario,
        removerComentario,
        anexarArquivo,
        atribuirTarefa,
        aplicarFiltros,
        buscarTarefas,
        atualizarProgresso
    };
}
