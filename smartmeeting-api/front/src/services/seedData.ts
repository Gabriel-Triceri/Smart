import { meetingsApi } from './meetingsApi';
import type {
    ReuniaoFormData,
    Sala,
    TarefaFormData
} from '../types/meetings';
import { PrioridadeTarefa } from '../types/meetings';


/**
 * Serviço de importação de dados iniciais
 * Popula as tabelas com 5 registros cada quando o programa inicia
 */

// Dados de salas para importar
const salasParaImportar: Partial<Sala>[] = [
    {
        nome: 'Sala Executiva A',
        capacidade: 20,
        localizacao: 'Andar 10 - Ala Norte',
        equipamentos: ['Projetor 4K', 'Videoconferência', 'Quadro Interativo', 'Sistema de Som'],
        categoria: 'executiva',
        cor: '#3b82f6',
        andar: '10'
    },
    {
        nome: 'Sala de Reuniões B',
        capacidade: 12,
        localizacao: 'Andar 8 - Ala Sul',
        equipamentos: ['Televisão Smart', 'Videoconferência', 'Flip Chart'],
        categoria: 'reuniao',
        cor: '#10b981',
        andar: '8'
    },
    {
        nome: 'Sala de Brainstorm',
        capacidade: 8,
        localizacao: 'Andar 7 - Centro',
        equipamentos: ['Quadro Branco', 'Post-its', 'Marcadores', 'Café'],
        categoria: 'pequena',
        cor: '#f59e0b',
        andar: '7'
    },
    {
        nome: 'Auditório Principal',
        capacidade: 100,
        localizacao: 'Térreo',
        equipamentos: ['Palco', 'Sistema de Som Profissional', 'Projetor Cinema', 'Microfones', 'Iluminação'],
        categoria: 'auditorio',
        cor: '#8b5cf6',
        andar: '0'
    },
    {
        nome: 'Sala de Treinamento',
        capacidade: 30,
        localizacao: 'Andar 5 - Ala Leste',
        equipamentos: ['Computadores', 'Projetor', 'Quadro Branco', 'Mesas Modulares'],
        categoria: 'treinamento',
        cor: '#06b6d4',
        andar: '5'
    }
];

// Dados de participantes para importar
// const participantesParaImportar: Partial<Participante>[] = [
//     {
//         nome: 'Ana Silva',
//         email: 'ana.silva@empresa.com',
//         tipoUsuario: 'Gerente',
//         organizacao: 'Empresa',
//         departamento: 'TI',
//         status: 'confirmado'
//     },
//     {
//         nome: 'Carlos Santos',
//         email: 'carlos.santos@empresa.com',
//         tipoUsuario: 'Desenvolvedor',
//         organizacao: 'Empresa',
//         departamento: 'Desenvolvimento',
//         status: 'confirmado'
//     },
//     {
//         nome: 'Maria Oliveira',
//         email: 'maria.oliveira@empresa.com',
//         tipoUsuario: 'Designer',
//         organizacao: 'Empresa',
//         departamento: 'Design',
//         status: 'confirmado'
//     },
//     {
//         nome: 'Pedro Costa',
//         email: 'pedro.costa@empresa.com',
//         tipoUsuario: 'Analista',
//         organizacao: 'Empresa',
//         departamento: 'Produto',
//         status: 'confirmado'
//     },
//     {
//         nome: 'Julia Fernandes',
//         email: 'julia.fernandes@empresa.com',
//         tipoUsuario: 'Scrum Master',
//         organizacao: 'Empresa',
//         departamento: 'Agile',
//         status: 'confirmado'
//     }
// ];

// Função para gerar uma data e hora específica
function gerarDataHora(diasAFrente: number, hora: number = 9, minuto: number = 0): { data: string; horaInicio: string; horaFim: string } {
    const data = new Date();
    data.setDate(data.getDate() + diasAFrente);

    const dataStr = data.toISOString().split('T')[0]; // YYYY-MM-DD
    const horaInicio = `${String(hora).padStart(2, '0')}:${String(minuto).padStart(2, '0')}`;
    const horaFim = `${String(hora + 1).padStart(2, '0')}:${String(minuto).padStart(2, '0')}`;

    return { data: dataStr, horaInicio, horaFim };
}

// Função para gerar reuniões baseadas em salas e participantes existentes
function gerarReunioes(salaIds: number[], participanteIds: number[]): ReuniaoFormData[] {
    const titulos = [
        'Sprint Planning - Q1 2025',
        'Revisão de Arquitetura do Sistema',
        'Alinhamento de Produto',
        'Workshop de Inovação',
        'Reunião de Status do Projeto'
    ];

    const pautas = [
        'Planejamento das sprints do primeiro trimestre com definição de metas e objetivos.',
        'Análise e revisão da arquitetura atual do sistema, identificando melhorias.',
        'Discussão sobre roadmap de produto e priorização de features.',
        'Sessão colaborativa para geração de ideias e soluções inovadoras.',
        'Atualização sobre andamento dos projetos em desenvolvimento.'
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
            participantes: participanteIds.slice(0, Math.min(index + 2, participanteIds.length)),
            tipo: (index % 2 === 0 ? 'presencial' : 'online') as 'presencial' | 'online' | 'hibrida',
            prioridade: (index === 0 ? 'alta' : index === 1 ? 'media' : 'baixa') as 'baixa' | 'media' | 'alta' | 'critica',
            lembretes: true,
            observacoes: `Reunião ${index + 1} do sistema`
        };
    });
}

// Função para gerar tarefas baseadas em reuniões existentes
function gerarTarefas(): TarefaFormData[] {
    const titulos = [
        'Preparar documentação técnica',
        'Revisar protótipos de UI',
        'Implementar feedback do cliente',
        'Configurar ambiente de testes',
        'Atualizar roadmap do produto'
    ];

    const descricoes = [
        'Documentar decisões arquiteturais e padrões de design.',
        'Analisar e validar os protótipos criados pela equipe de design.',
        'Incorporar sugestões e melhorias solicitadas pelo cliente.',
        'Preparar infraestrutura para testes de aceitação.',
        'Revisar e atualizar o planejamento de lançamentos.'
    ];

    const prioridades: PrioridadeTarefa[] = [
        PrioridadeTarefa.ALTA,
        PrioridadeTarefa.MEDIA,
        PrioridadeTarefa.ALTA,
        PrioridadeTarefa.MEDIA,
        PrioridadeTarefa.BAIXA
    ];

    return titulos.map((titulo, index) => {
        const data = new Date();
        data.setDate(data.getDate() + (7 + index * 2));

        return {
            titulo,
            descricao: descricoes[index],
            responsavelPrincipalId: `user-${index + 1}`,
            responsaveisIds: [`user-${index + 1}`],
            prazo_tarefa: data.toISOString().split('T')[0],
            prioridade: prioridades[index],
            tags: ['importado', `prioridade-${prioridades[index]}`],
            estimadoHoras: 4 + index * 2
        };
    });
}

/**
 * Importa dados iniciais em todas as tabelas
 * Retorna true se bem-sucedido, false caso contrário
 */
export async function importarDadosIniciais(): Promise<boolean> {
    try {
        console.log('🚀 Iniciando importação de dados...');

        // 1. Importar Salas
        console.log('📍 Importando salas...');
        const salasImportadas = [];
        for (const sala of salasParaImportar) {
            try {
                const salaImportada = await meetingsApi.createSala(sala);
                salasImportadas.push(salaImportada);
                console.log(`✅ Sala "${sala.nome}" importada com sucesso`);
            } catch (error) {
                console.warn(`⚠️ Sala "${sala.nome}" já existe ou erro ao importar:`, error);
            }
        }

        // 2. Importar Participantes
        console.log('👥 Importando participantes...');
        // const participantesImportados = [];

        // Nota: A API não tem um endpoint de criar participantes isoladamente
        // Os participantes são criados automaticamente ao criar reuniões
        // Então vamos apenas armazenar os dados para usar depois
        console.log('ℹ️ Participantes serão associados às reuniões automaticamente');

        // Aguardar um momento para garantir que os IDs foram persistidos
        await new Promise(resolve => setTimeout(resolve, 500));

        // 3. Buscar IDs das salas criadas
        const salas = await meetingsApi.getAllSalas();

        if (salas.length === 0) {
            console.warn('⚠️ Não há salas suficientes para criar reuniões');
            return salasImportadas.length > 0;
        }

        const salaIds = salas.slice(0, 5).map(s => s.id);

        // Como não temos participantes criados separadamente, vamos usar IDs fictícios
        // ou criar reuniões sem participantes específicos
        const participanteIds = [1, 2, 3, 4, 5]; // IDs fictícios que o backend pode criar

        // 4. Importar Reuniões
        console.log('📅 Importando reuniões...');
        const reunioesParaImportar = gerarReunioes(salaIds, participanteIds);
        const reunioesImportadas = [];

        for (const reuniao of reunioesParaImportar) {
            try {
                const reuniaoImportada = await meetingsApi.createReuniao(reuniao);
                reunioesImportadas.push(reuniaoImportada);
                console.log(`✅ Reunião "${reuniao.titulo}" importada com sucesso`);
            } catch (error) {
                console.warn(`⚠️ Reunião "${reuniao.titulo}" erro ao importar:`, error);
            }
        }

        // 5. Importar Tarefas (sem vínculos com reunião específica)
        console.log('✅ Importando tarefas...');
        const tarefasParaImportar = gerarTarefas();
        let tarefasImportadas = 0;

        for (const tarefa of tarefasParaImportar) {
            try {
                await meetingsApi.createTarefa(tarefa);
                tarefasImportadas++;
                console.log(`✅ Tarefa "${tarefa.titulo}" importada com sucesso`);
            } catch (error) {
                console.warn(`⚠️ Tarefa "${tarefa.titulo}" erro ao importar:`, error);
            }
        }

        console.log('🎉 Importação de dados concluída com sucesso!');
        console.log(`📊 Resumo: ${salasImportadas.length} salas, ${reunioesImportadas.length} reuniões e ${tarefasImportadas} tarefas importadas`);

        return true;
    } catch (error) {
        console.error('❌ Erro ao importar dados iniciais:', error);
        return false;
    }
}

/**
 * Verifica se já existem dados no sistema
 */
export async function verificarDadosExistentes(): Promise<boolean> {
    try {
        const [salas, reunioes, tarefas] = await Promise.all([
            meetingsApi.getAllSalas(),
            meetingsApi.getAllReunioes(),
            meetingsApi.getAllTarefas()
        ]);

        const totalRegistros = salas.length + reunioes.length + tarefas.length;
        console.log(`📊 Total de registros existentes: ${totalRegistros}`);

        return totalRegistros > 0;
    } catch (error) {
        console.error('❌ Erro ao verificar dados existentes:', error);
        return false;
    }
}

/**
 * Função principal para inicializar dados
 * Verifica se há dados e importa apenas se necessário
 */
export async function inicializarDados(): Promise<void> {
    try {
        const SEED_EXECUTADO_KEY = 'smartmeeting-seed-executado';
        const seedJaExecutado = localStorage.getItem(SEED_EXECUTADO_KEY);

        if (seedJaExecutado === 'true') {
            console.log('✅ Dados iniciais já foram importados anteriormente');
            return;
        }

        console.log('🔍 Verificando dados existentes...');
        const existemDados = await verificarDadosExistentes();

        if (!existemDados) {
            console.log('📦 Nenhum dado encontrado. Iniciando importação...');
            const sucesso = await importarDadosIniciais();

            if (sucesso) {
                localStorage.setItem(SEED_EXECUTADO_KEY, 'true');
                console.log('✅ Dados iniciais importados e marcados como executados');
            }
        } else {
            console.log('✅ Sistema já possui dados. Importação não necessária');
            localStorage.setItem(SEED_EXECUTADO_KEY, 'true');
        }
    } catch (error) {
        console.error('❌ Erro ao inicializar dados:', error);
    }
}
