// src/hooks/useMeetings.ts
import { useState, useEffect, useCallback, useMemo } from "react";
import {
    Reuniao,
    ReuniaoFormData,
    FiltroReunioes,
    StatisticsReunioes
} from "../types/meetings";
import { meetingsApi } from "../services/meetingsApi";

/**
 * Tipo local para as reuniões que a UI espera (Reuniao + campos "data", "horaInicio", "horaFim")
 */
type EnrichedReuniao = Reuniao & {
    data: string;
    horaInicio: string;
    horaFim: string;
};

/* --------------------
   Helper: normaliza um objeto Reunião vindo da API
   Garante: salaId = number, participantesIds = number[], duracaoMinutos = number, dataHoraInicio = string
---------------------*/
function normalizeReuniao(raw: any): Reuniao {
    if (!raw) return {} as Reuniao;

    const salaIdNum = raw.salaId !== undefined && raw.salaId !== null ? Number(raw.salaId) : undefined;
    const duracao = raw.duracaoMinutos !== undefined && raw.duracaoMinutos !== null
        ? Number(raw.duracaoMinutos)
        : 0;

    // Tentativas de extrair participantesIds:
    let participantesIds: number[] | undefined = undefined;

    if (Array.isArray(raw.participantesIds) && raw.participantesIds.length > 0) {
        participantesIds = raw.participantesIds
            .filter((p: any) => p !== null && p !== undefined)
            .map((p: any) => Number(p))
            .filter((n: number) => !isNaN(n));
    } else if (Array.isArray(raw.participantes) && raw.participantes.length > 0) {
        // se a API retornou objetos participantes, extrai id
        participantesIds = raw.participantes
            .filter((p: any) => p !== null && p !== undefined)
            .map((p: any) => {
                if (typeof p === 'object' && p !== null && ('id' in p)) return Number(p.id);
                return Number(p);
            })
            .filter((n: number) => !isNaN(n));
    } else if (Array.isArray(raw.participantesIdsString) && raw.participantesIdsString.length > 0) {
        // fallback: nomes diferentes
        participantesIds = raw.participantesIdsString
            .filter((p: any) => p !== null && p !== undefined)
            .map((p: any) => Number(p))
            .filter((n: number) => !isNaN(n));
    } else {
        participantesIds = [];
    }

    const normalized: Reuniao = {
        // Copia tudo o que existir — iremos sobrescrever campos importantes abaixo.
        ...(raw as object) as Reuniao,
        salaId: salaIdNum,
        duracaoMinutos: duracao,
        participantesIds: participantesIds,
        // garante formato string ISO para dataHoraInicio, se existir
        dataHoraInicio: raw.dataHoraInicio ? String(raw.dataHoraInicio) : (raw.data ? String(raw.data) : '')
    } as Reuniao;

    return normalized;
}

/* --------------------
   Helper pequeno para evitar crash quando backend retorna inesperado
--------------------*/
function novaReunhaoOrFallback(r: any): Reuniao {
    if (!r) return {} as Reuniao;
    return normalizeReuniao(r);
}

const initialStatistics: StatisticsReunioes = {
    totalReunioes: 0,
    reunioesAgendadas: 0,
    reunioesEmAndamento: 0,
    reunioesFinalizadas: 0,
    reunioesCanceladas: 0,
    proximasReunioes: 0,
    salaMaisUsada: '',
    salasEmUso: 0,
    taxaParticipacao: 0,
    proximasReunioesList: [],
};

export const useMeetings = () => {
    const [reunioes, setReunioes] = useState<Reuniao[]>([]);
    const [statistics, setStatistics] = useState<StatisticsReunioes>(initialStatistics);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [filtros, setFiltros] = useState<FiltroReunioes>({});

    /* -------------------- CARREGAR REUNIÕES -------------------- */
    const loadReunioes = useCallback(async (filtrosAtuais?: FiltroReunioes) => {
        setIsLoading(true);
        setError(null);

        try {
            const filtrosParaUsar = filtrosAtuais || filtros;
            const data = await meetingsApi.getAllReunioes(filtrosParaUsar);

            // Normaliza cada reunião antes de colocar no estado
            const normalized = Array.isArray(data) ? data.map(normalizeReuniao) : [];
            setReunioes(normalized);
        } catch (err) {
            setError("Erro ao carregar reuniões");
            console.error("Erro ao carregar reuniões:", err);
        } finally {
            setIsLoading(false);
        }
    }, [filtros]);

    /* -------------------- CARREGAR ESTATÍSTICAS -------------------- */
    const loadStatistics = useCallback(async () => {
        try {
            const stats = await meetingsApi.getStatisticsReunioes();
            setStatistics(stats);
        } catch (err) {
            console.error("Erro ao carregar estatísticas:", err);
        }
    }, []);

    useEffect(() => {
        loadReunioes();
        loadStatistics();

        const interval = setInterval(() => {
            loadReunioes();
            loadStatistics();
        }, 5 * 60 * 1000);

        return () => clearInterval(interval);
    }, [loadReunioes, loadStatistics]);

    /* -------------------- CRIAR REUNIÃO --------------------
       Observação: UI trabalha com ReuniaoFormData (participantes como string[]),
       mas o backend espera participantes como number[] e salaId como number.
       Aqui normalizamos e enviamos o payload adequado ao backend.
    */
    const createReuniao = useCallback(
        async (data: ReuniaoFormData) => {
            setIsLoading(true);
            setError(null);

            try {
                // Normaliza para envio ao backend:
                const payloadForApi = {
                    ...data,
                    salaId: typeof data.salaId === "string" ? Number(data.salaId) : data.salaId,
                    participantes: (data.participantes || []).map(p => Number(p))
                };

                // cast to any se o meetingsApi estiver tipado estritamente
                const novaReuniaoRaw = await meetingsApi.createReuniao(payloadForApi as any);
                const novaReuniao = normalizeReuniao(novaReuniaoRaw);

                // garante participantesIds como number[]
                novaReuniao.participantesIds = (novaReuniao.participantesIds || []).map(n => Number(n));

                setReunioes((prev) => [novaReunhaoOrFallback(novaReuniao), ...prev]);
                loadStatistics();

                return novaReuniao;
            } catch (err) {
                setError("Erro ao criar reunião");
                console.error("Erro ao criar reunião:", err);
                return null;
            } finally {
                setIsLoading(false);
            }
        },
        [loadStatistics]
    );

    /* -------------------- ATUALIZAR REUNIÃO --------------------
       Monta um ReuniaoFormData completo a partir do Partial recebido
       e da reunião existente, e envia ao backend convertendo participantes → number[].
    */
    const updateReuniao = useCallback(
        async (id: number, data: Partial<ReuniaoFormData>) => {
            setIsLoading(true);
            setError(null);

            const reuniaoExistente = reunioes.find((r) => r.id === id);
            if (!reuniaoExistente) {
                setError("Reunião não encontrada para atualização.");
                setIsLoading(false);
                return null;
            }

            try {
                // Reconstruir data/hora existentes
                const inicioExistente = new Date(reuniaoExistente.dataHoraInicio);
                const fimExistente = new Date(inicioExistente.getTime() + reuniaoExistente.duracaoMinutos * 60000);

                const formDataCompleto: ReuniaoFormData = {
                    titulo: data.titulo ?? reuniaoExistente.titulo,
                    pauta: data.pauta ?? reuniaoExistente.pauta,

                    // data (YYYY-MM-DD)
                    data: data.data ?? reuniaoExistente.dataHoraInicio.split("T")[0],

                    // horaInicio (HH:mm)
                    horaInicio:
                        data.horaInicio ??
                        reuniaoExistente.dataHoraInicio.split("T")[1].substring(0, 5),

                    // horaFim (HH:mm)
                    horaFim:
                        data.horaFim ??
                        `${String(fimExistente.getHours()).padStart(2, "0")}:${String(
                            fimExistente.getMinutes()
                        ).padStart(2, "0")}`,

                    // garantir salaId como number (UI pode ter string)
                    salaId: typeof data.salaId === "string"
                        ? Number(data.salaId)
                        : (data.salaId ?? reuniaoExistente.salaId ?? 0),

                    // participantes como string[] para UI (manter formato interno)
                    participantes:
                        (data.participantes ?? reuniaoExistente.participantesIds?.map(pid => String(pid)) ?? []).map(String),

                    tipo: data.tipo ?? reuniaoExistente.tipo,
                    prioridade: data.prioridade ?? reuniaoExistente.prioridade,
                    lembretes: data.lembretes ?? reuniaoExistente.lembretes,
                    observacoes: data.observacoes ?? reuniaoExistente.observacoes,
                    ata: data.ata ?? reuniaoExistente.ata,
                    linkReuniao: data.linkReuniao ?? reuniaoExistente.linkReuniao
                };

                // Payload para API: converte participantes → number[]
                const payloadForApi = {
                    ...formDataCompleto,
                    salaId: typeof formDataCompleto.salaId === "string"
                        ? Number(formDataCompleto.salaId)
                        : formDataCompleto.salaId,
                    participantes: (formDataCompleto.participantes || []).map(p => Number(p))
                };

                const reuniaoAtualizadaRaw = await meetingsApi.updateReuniao(String(id), payloadForApi as any);
                const reuniaoAtualizada = normalizeReuniao(reuniaoAtualizadaRaw);

                // garante participantesIds number[]
                reuniaoAtualizada.participantesIds = (reuniaoAtualizada.participantesIds || []).map(n => Number(n));

                setReunioes((prev) =>
                    prev.map((r) => (r.id === id ? reuniaoAtualizada : r))
                );

                loadStatistics();
                return reuniaoAtualizada;
            } catch (err) {
                setError("Erro ao atualizar reunião");
                console.error("Erro ao atualizar reunião:", err);
                return null;
            } finally {
                setIsLoading(false);
            }
        },
        [reunioes, loadStatistics]
    );

    /* -------------------- EXCLUIR -------------------- */
    const deleteReuniao = useCallback(
        async (id: number) => {
            setIsLoading(true);
            setError(null);

            try {
                await meetingsApi.deleteReuniao(String(id));

                setReunioes((prev) => prev.filter((r) => r.id !== id));
                loadStatistics();

                return true;
            } catch (err) {
                setError("Erro ao excluir reunião");
                console.error("Erro ao excluir reunião:", err);
                return false;
            } finally {
                setIsLoading(false);
            }
        },
        [loadStatistics]
    );

    /* -------------------- OBTER POR ID -------------------- */
    const getReuniaoById = useCallback(async (id: number) => {
        try {
            const raw = await meetingsApi.getReuniaoById(String(id));
            return normalizeReuniao(raw);
        } catch (err) {
            console.error("Erro ao carregar reunião:", err);
            return null;
        }
    }, []);

    /* -------------------- PARTICIPANTES -------------------- */
    const searchParticipantes = useCallback(async (query: string) => {
        try {
            return await meetingsApi.searchParticipantes(query);
        } catch (err) {
            console.error("Erro ao buscar participantes:", err);
            return [];
        }
    }, []);

    /* -------------------- SALAS -------------------- */
    const getSalasDisponiveis = useCallback(
        async (data: string, horaInicio: string, horaFim: string) => {
            try {
                return await meetingsApi.getSalasDisponiveis(data, horaInicio, horaFim);
            } catch (err) {
                console.error("Erro ao buscar salas:", err);
                return [];
            }
        },
        []
    );

    /* -------------------- FILTROS -------------------- */
    const applyFilters = useCallback(
        (novosFiltros: FiltroReunioes) => {
            setFiltros(novosFiltros);
            loadReunioes(novosFiltros);
        },
        [loadReunioes]
    );

    const clearFilters = useCallback(() => {
        setFiltros({});
        loadReunioes({});
    }, [loadReunioes]);

    /* -------------------------------------------------------
       RECONSTRUIR CAMPOS DATA/HORA PARA UI
    --------------------------------------------------------*/
    const enrichReunioes = useMemo((): EnrichedReuniao[] => {
        return reunioes.map((r) => {
            const inicio = new Date(r.dataHoraInicio);
            const fim = new Date(inicio.getTime() + (r.duracaoMinutos || 0) * 60000);

            return {
                ...r,
                // 🔥 Garantia: participantesIds SEMPRE será number[] com validação defensiva
                participantesIds: Array.isArray(r.participantesIds) 
                    ? r.participantesIds
                        .filter((p: any) => p !== null && p !== undefined)
                        .map((p: any) => Number(p))
                        .filter((n: number) => !isNaN(n))
                    : [],

                data: (r.dataHoraInicio || '').split("T")[0],
                horaInicio: (r.dataHoraInicio || '').split("T")[1]?.substring(0, 5) ?? '',
                horaFim: `${String(fim.getHours()).padStart(2, "0")}:${String(
                    fim.getMinutes()
                ).padStart(2, "0")}`
            };
        });
    }, [reunioes]);

    return {
        reunioes: enrichReunioes,
        statistics,
        isLoading,
        error,
        filtros,

        loadReunioes,
        loadStatistics,
        createReuniao,
        updateReuniao,
        deleteReuniao,
        getReuniaoById,
        searchParticipantes,
        getSalasDisponiveis,
        applyFilters,
        clearFilters
    };
};
