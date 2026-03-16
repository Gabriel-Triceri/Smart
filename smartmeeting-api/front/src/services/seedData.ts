import { reuniaoService } from './reuniaoService';
import { salaService } from './salaService';
import tarefaService from './tarefaService';
import api from './httpClient';
import type { ReuniaoFormData, Sala, TarefaFormData } from '../types/meetings';
import { PrioridadeTarefa } from '../types/meetings';

// Dados de salas para importar
const salasParaImportar: Partial<Sala>[] = [
    {
        nome: 'Sala Executiva A',
        capacidade: 20,
        localizacao: 'Andar 10 - Ala Norte',
        equipamentos: ['Projetor 4K', 'Videoconferência', 'Quadro Interativo', 'Sistema de Som'],
        categoria: 'executiva',
        cor: '#3b82f6',
        andar: '10',
    },
    {
        nome: 'Sala de Reuniões B',
        capacidade: 12,
        localizacao: 'Andar 8 - Ala Sul',
        equipamentos: ['Televisão Smart', 'Videoconferência', 'Flip Chart'],
        categoria: 'reuniao',
        cor: '#10b981',
        andar: '8',
    },
    {
        nome: 'Sala de Brainstorm',
        capacidade: 8,
        localizacao: 'Andar 7 - Centro',
        equipamentos: ['Quadro Branco', 'Post-its', 'Marcadores', 'Café'],
        categoria: 'pequena',
        cor: '#f59e0b',
        andar: '7',
    },
    {
        nome: 'Auditório Principal',
        capacidade: 100,
        localizacao: 'Térreo',
        equipamentos: ['Palco', 'Sistema de Som Profissional', 'Projetor Cinema', 'Microfones', 'Iluminação'],
        categoria: 'auditorio',
        cor: '#8b5cf6',
        andar: '0',
    },
    {
        nome: 'Sala de Treinamento',
        capacidade: 30,
        localizacao: 'Andar 5 - Ala Leste',
        equipamentos: ['Computadores', 'Projetor', 'Quadro Branco', 'Mesas Modulares'],
        categoria: 'treinamento',
        cor: '#06b6d4',
        andar: '5',
    },
];

function gerarDataHora(diasAFrente: number, hora: number = 9, minuto: number = 0) {
    const data = new Date();
    data.setDate(data.getDate() + diasAFrente);
    const dataStr = data.toISOString().split('T')[0];
    const horaInicio = `${String(hora).padStart(2, '0')}:${String(minuto).padStart(2, '0')}`;
    const horaFim = `${String(hora + 1).padStart(2, '0')}:${String(minuto).padStart(2, '0')}`;
    return { data: dataStr, horaInicio, horaFim };
}

function gerarReunioes(salaIds: number[], participanteIds: number[]): ReuniaoFormData[] {
    const titulos = [
        'Sprint Planning - Q1 2025',
        'Revisão de Arquitetura do Sistema',
        'Alinhamento de Produto',
        'Workshop de Inovação',
        'Reunião de Status do Projeto',
    ];
    const pautas = [
        'Planejamento das sprints do primeiro trimestre com definição de metas e objetivos.',
        'Análise e revisão da arquitetura atual do sistema, identificando melhorias.',
        'Discussão sobre roadmap de produto e priorização de features.',
        'Sessão colaborativa para geração de ideias e soluções inovadoras.',
        'Atualização sobre andamento dos projetos em desenvolvimento.',
    ];

    return titulos.map((titulo, index) => {
        const { data, horaInicio, horaFim } = gerarDataHora(index + 1, 9 + index);
        return {
            titulo,
            pauta: pautas[index],
            data,
            horaInicio,
            horaFim,
            salaId: salaIds[index % salaIds.length],
            // FIX #5: participanteIds agora são IDs reais vindos do backend
            participantes: participanteIds.slice(0, Math.min(index + 2, participanteIds.length)),
            tipo: (index % 2 === 0 ? 'presencial' : 'online') as 'presencial' | 'online' | 'hibrida',
            prioridade: (index === 0 ? 'alta' : index === 1 ? 'media' : 'baixa') as 'baixa' | 'media' | 'alta' | 'critica',
            lembretes: true,
            observacoes: `Reunião ${index + 1} do sistema`,
        };
    });
}

function gerarTarefas(): TarefaFormData[] {
    const titulos = [
        'Preparar documentação técnica',
        'Revisar protótipos de UI',
        'Implementar feedback do cliente',
        'Configurar ambiente de testes',
        'Atualizar roadmap do produto',
    ];
    const descricoes = [
        'Documentar decisões arquiteturais e padrões de design.',
        'Analisar e validar os protótipos criados pela equipe de design.',
        'Incorporar sugestões e melhorias solicitadas pelo cliente.',
        'Preparar infraestrutura para testes de aceitação.',
        'Revisar e atualizar o planejamento de lançamentos.',
    ];
    const prioridades: PrioridadeTarefa[] = [
        PrioridadeTarefa.ALTA,
        PrioridadeTarefa.MEDIA,
        PrioridadeTarefa.ALTA,
        PrioridadeTarefa.MEDIA,
        PrioridadeTarefa.BAIXA,
    ];

    return titulos.map((titulo, index) => {
        const data = new Date();
        data.setDate(data.getDate() + (7 + index * 2));
        return {
            titulo,
            descricao: descricoes[index],
            // sem responsavelPrincipalId — o backend deve tratar como opcional
            responsavelPrincipalId: '',
            responsaveisIds: [],
            prazo_tarefa: data.toISOString().split('T')[0],
            prioridade: prioridades[index],
            tags: ['importado', `prioridade-${prioridades[index]}`],
            estimadoHoras: 4 + index * 2,
        };
    });
}

/**
 * FIX #5: Busca os IDs reais dos participantes cadastrados no backend.
 * Antes, eram usados IDs fixos [1,2,3,4,5] que provavelmente não existiam.
 */
async function buscarParticipantesReais(): Promise<number[]> {
    try {
        const response = await api.get('/pessoas', { params: { size: 10 } });
        const pessoas = Array.isArray(response.data)
            ? response.data
            : response.data?.content ?? [];   // suporta resposta paginada

        const ids: number[] = pessoas
            .filter((p: any) => p?.id !== undefined && p?.id !== null)
            .map((p: any) => Number(p.id))
            .filter((id: number) => !isNaN(id) && id > 0);

        return ids;
    } catch (err) {
        console.warn('⚠️ Não foi possível buscar participantes reais. Reuniões serão criadas sem participantes.');
        return [];
    }
}

export async function importarDadosIniciais(): Promise<boolean> {
    try {
        console.log('🚀 Iniciando importação de dados...');

        // 1. Importar Salas
        console.log('📍 Importando salas...');
        const salasImportadas = [];
        for (const sala of salasParaImportar) {
            try {
                const salaImportada = await salaService.createSala(sala);
                salasImportadas.push(salaImportada);
                console.log(`✅ Sala "${sala.nome}" importada`);
            } catch {
                console.warn(`⚠️ Sala "${sala.nome}" já existe ou erro ao importar`);
            }
        }

        await new Promise(resolve => setTimeout(resolve, 500));

        const salas = await salaService.getAllSalas();
        if (salas.length === 0) {
            console.warn('⚠️ Nenhuma sala disponível para criar reuniões');
            return salasImportadas.length > 0;
        }
        const salaIds = salas.slice(0, 5).map(s => s.id);

        // 2. FIX #5: buscar participantes reais em vez de IDs fixos
        console.log('👥 Buscando participantes cadastrados...');
        const participanteIds = await buscarParticipantesReais();
        if (participanteIds.length === 0) {
            console.warn('⚠️ Nenhum participante encontrado — reuniões serão criadas sem participantes');
        } else {
            console.log(`✅ ${participanteIds.length} participante(s) encontrado(s): ${participanteIds.join(', ')}`);
        }

        // 3. Importar Reuniões
        console.log('📅 Importando reuniões...');
        const reunioesParaImportar = gerarReunioes(salaIds, participanteIds);
        let reunioesImportadas = 0;
        for (const reuniao of reunioesParaImportar) {
            try {
                await reuniaoService.createReuniao(reuniao);
                reunioesImportadas++;
                console.log(`✅ Reunião "${reuniao.titulo}" importada`);
            } catch (err) {
                console.warn(`⚠️ Reunião "${reuniao.titulo}" erro:`, err);
            }
        }

        // 4. Importar Tarefas
        console.log('✅ Importando tarefas...');
        const tarefasParaImportar = gerarTarefas();
        let tarefasImportadas = 0;
        for (const tarefa of tarefasParaImportar) {
            try {
                await tarefaService.createTarefa(tarefa);
                tarefasImportadas++;
                console.log(`✅ Tarefa "${tarefa.titulo}" importada`);
            } catch (err) {
                console.warn(`⚠️ Tarefa "${tarefa.titulo}" erro:`, err);
            }
        }

        console.log('🎉 Importação concluída!');
        console.log(`📊 Resumo: ${salasImportadas.length} salas, ${reunioesImportadas} reuniões, ${tarefasImportadas} tarefas`);
        return true;
    } catch (err) {
        console.error('❌ Erro ao importar dados iniciais:', err);
        return false;
    }
}

export async function verificarDadosExistentes(): Promise<boolean> {
    try {
        const [salas, reunioes, tarefas] = await Promise.all([
            salaService.getAllSalas(),
            reuniaoService.getAllReunioes(),
            tarefaService.getAllTarefas(),
        ]);
        const total = salas.length + reunioes.length + tarefas.length;
        console.log(`📊 Total de registros existentes: ${total}`);
        return total > 0;
    } catch {
        return false;
    }
}

export async function inicializarDados(): Promise<void> {
    try {
        const SEED_KEY = 'smartmeeting-seed-executado';
        if (localStorage.getItem(SEED_KEY) === 'true') {
            console.log('✅ Seed já executado anteriormente');
            return;
        }
        console.log('🔍 Verificando dados existentes...');
        const existemDados = await verificarDadosExistentes();
        if (!existemDados) {
            console.log('📦 Nenhum dado encontrado. Importando...');
            const sucesso = await importarDadosIniciais();
            if (sucesso) localStorage.setItem(SEED_KEY, 'true');
        } else {
            console.log('✅ Sistema já possui dados. Importação não necessária');
            localStorage.setItem(SEED_KEY, 'true');
        }
    } catch (err) {
        console.error('❌ Erro ao inicializar dados:', err);
    }
}