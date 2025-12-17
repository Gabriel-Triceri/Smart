import { useState, useEffect, useCallback } from 'react';
import { Sala, FiltroSalas, DisponibilidadeSala } from '../types/meetings';
import { salaService } from '../services/salaService';

export function useSalas() {
    const [salas, setSalas] = useState<Sala[]>([]);
    const [salasFiltradas, setSalasFiltradas] = useState<Sala[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filtros, setFiltros] = useState<FiltroSalas>({});
    const [estatisticas, setEstatisticas] = useState<{
        total: number;
        disponiveis: number;
        ocupadas: number;
        manutencao: number;
        utilizacaoMedia: number;
    } | null>(null);

    // Carregar salas
    const loadSalas = useCallback(async (filtrosAtuais?: FiltroSalas) => {
        try {
            setLoading(true);
            setError(null);

            const salasData = await salaService.getAllSalas(filtrosAtuais || filtros);
            setSalas(salasData);
            setSalasFiltradas(salasData);
        } catch (err) {
            setError('Erro ao carregar salas');
            console.error('Erro ao carregar salas:', err);
        } finally {
            setLoading(false);
        }
    }, [filtros]);

    // Carregar estatísticas
    const loadEstatisticas = useCallback(async () => {
        try {
            const stats = await salaService.getStatisticsSalas();
            setEstatisticas(stats);
        } catch (err) {
            console.error('Erro ao carregar estatísticas:', err);
        }
    }, []);

    // Filtrar salas
    const filtrarSalas = useCallback((novosFiltros: FiltroSalas) => {
        setFiltros(novosFiltros);

        let result = [...salas];

        if (novosFiltros.capacidade) {
            result = result.filter(sala => sala.capacidade >= novosFiltros.capacidade!);
        }

        if (novosFiltros.categoria) {
            result = result.filter(sala => sala.categoria === novosFiltros.categoria);
        }

        if (novosFiltros.status) {
            result = result.filter(sala => sala.status === novosFiltros.status);
        }

        if (novosFiltros.disponivel !== undefined) {
            result = result.filter(sala => sala.disponibilidade === novosFiltros.disponivel);
        }

        if (novosFiltros.andares && novosFiltros.andares.length > 0) {
            result = result.filter(sala =>
                novosFiltros.andares!.includes(sala.andar || 'Térreo')
            );
        }

        if (novosFiltros.recursos && novosFiltros.recursos.length > 0) {
            result = result.filter(sala =>
                novosFiltros.recursos!.some(recurso =>
                    sala.equipamentos?.some(equipamento =>
                        equipamento.toLowerCase().includes(recurso.toLowerCase())
                    )
                )
            );
        }

        setSalasFiltradas(result);
    }, [salas]);

    // Criar sala
    const criarSala = useCallback(async (data: Partial<Sala>) => {
        try {
            const novaSala = await salaService.createSala(data);
            setSalas(prev => [...prev, novaSala]);
            setSalasFiltradas(prev => [...prev, novaSala]);
            await loadEstatisticas();
            return novaSala;
        } catch (err) {
            setError('Erro ao criar sala');
            throw err;
        }
    }, []);

    // Atualizar sala
    const atualizarSala = useCallback(async (id: number, data: Partial<Sala>) => {
        try {
            const salaAtualizada = await salaService.updateSala(String(id), data);
            setSalas(prev => prev.map(sala =>
                sala.id === id ? salaAtualizada : sala
            ));
            setSalasFiltradas(prev => prev.map(sala =>
                sala.id === id ? salaAtualizada : sala
            ));
            await loadEstatisticas();
            return salaAtualizada;
        } catch (err) {
            setError('Erro ao atualizar sala');
            throw err;
        }
    }, []);

    // Deletar sala
    const deletarSala = useCallback(async (id: number) => {
        try {
            await salaService.deleteSala(String(id));
            setSalas(prev => prev.filter(sala => sala.id !== id));
            setSalasFiltradas(prev => prev.filter(sala => sala.id !== id));
            await loadEstatisticas();
        } catch (err) {
            setError('Erro ao deletar sala');
            throw err;
        }
    }, []);

    // Atualizar status da sala
    const atualizarStatusSala = useCallback(async (id: number, status: Sala['status']) => {
        try {
            const salaAtualizada = await salaService.atualizarStatusSala(String(id), status);
            setSalas(prev => prev.map(sala =>
                sala.id === id ? { ...sala, status } : sala
            ));
            setSalasFiltradas(prev => prev.map(sala =>
                sala.id === id ? { ...sala, status } : sala
            ));
            await loadEstatisticas();
            return salaAtualizada;
        } catch (err) {
            setError('Erro ao atualizar status da sala');
            throw err;
        }
    }, []);

    // Buscar disponibilidade
    const buscarDisponibilidade = useCallback(async (salaId: number, data: string): Promise<DisponibilidadeSala | null> => {
        try {
            return await salaService.getDisponibilidadeSala(String(salaId), data);
        } catch (err) {
            console.error('Erro ao buscar disponibilidade:', err);
            return null;
        }
    }, []);

    // Reservar sala
    const reservarSala = useCallback(async (salaId: number, inicio: string, fim: string, motivo?: string) => {
        try {
            await salaService.reservarSala(String(salaId), inicio, fim, motivo);
            // Recarregar salas para atualizar status
            await loadSalas();
        } catch (err) {
            setError('Erro ao reservar sala');
            throw err;
        }
    }, [loadSalas]);

    // Cancelar reserva
    const cancelarReserva = useCallback(async (salaId: number, reservaId: string) => {
        try {
            await salaService.cancelarReservaSala(String(salaId), reservaId);
            await loadSalas();
        } catch (err) {
            setError('Erro ao cancelar reserva');
            throw err;
        }
    }, [loadSalas]);

    // Buscar salas
    const buscarSalas = useCallback(async (query: string) => {
        try {
            const resultados = await salaService.buscarSalasPorTexto(query);
            setSalasFiltradas(resultados);
            return resultados;
        } catch (err) {
            console.error('Erro ao buscar salas:', err);
            return [];
        }
    }, []);

    // Atualizar recursos da sala
    const atualizarRecursos = useCallback(async (salaId: number, recursos: any[]) => {
        try {
            const salaAtualizada = await salaService.updateRecursosSala(String(salaId), recursos);
            setSalas(prev => prev.map(sala =>
                sala.id === salaId ? salaAtualizada : sala
            ));
            setSalasFiltradas(prev => prev.map(sala =>
                sala.id === salaId ? salaAtualizada : sala
            ));
            return salaAtualizada;
        } catch (err) {
            setError('Erro ao atualizar recursos da sala');
            throw err;
        }
    }, []);

    // Limpar filtros
    const limparFiltros = useCallback(() => {
        setFiltros({});
        setSalasFiltradas(salas);
    }, [salas]);

    // Obter categorias disponíveis
    const getCategorias = useCallback(async () => {
        try {
            return await salaService.getCategoriasSalas();
        } catch (err) {
            console.error('Erro ao buscar categorias:', err);
            return [];
        }
    }, []);

    // Carregar dados iniciais
    useEffect(() => {
        loadSalas();
        loadEstatisticas();
    }, []);

    // Atualizar salas filtradas quando salas mudarem
    useEffect(() => {
        setSalasFiltradas(salas);
    }, [salas]);

    return {
        // Estado
        salas,
        salasFiltradas,
        loading,
        error,
        filtros,
        estatisticas,

        // Ações
        loadSalas,
        loadEstatisticas,
        filtrarSalas,
        criarSala,
        atualizarSala,
        deletarSala,
        atualizarStatusSala,
        buscarDisponibilidade,
        reservarSala,
        cancelarReserva,
        buscarSalas,
        atualizarRecursos,
        limparFiltros,
        getCategorias,

        // Utilitários
        setError: (msg: string | null) => setError(msg)
    };
}