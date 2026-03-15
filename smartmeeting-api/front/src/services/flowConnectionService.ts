import httpClient from './httpClient';

export interface FlowConnectionFieldMapDTO {
    id?: number;
    sourceField: string;
    targetField: string;
}

export interface FlowConnectionDTO {
    id: number;
    name: string;
    sourceColumnId: number;
    sourceColumnTitle: string;
    sourceProjectId: number;
    sourceProjectName: string;
    targetColumnId: number;
    targetColumnTitle: string;
    targetProjectId: number;
    targetProjectName: string;
    avoidDuplicates: boolean;
    active: boolean;
    fieldMappings: FlowConnectionFieldMapDTO[];
    createdAt: string;
}

export interface CreateFlowConnectionRequest {
    name: string;
    sourceColumnId: number;
    targetColumnId: number;
    avoidDuplicates: boolean;
    active: boolean;
    fieldMappings: FlowConnectionFieldMapDTO[];
}

export interface KanbanColumnOption {
    id: number;
    title: string;
    color: string;
    projectId: number;
    projectName: string;
}

export const FLOW_MAPPABLE_FIELDS = [
    { value: 'titulo',        label: 'Título' },
    { value: 'descricao',     label: 'Descrição' },
    { value: 'prioridade',    label: 'Prioridade' },
    { value: 'prazo',         label: 'Prazo' },
    { value: 'tags',          label: 'Tags' },
    { value: 'cor',           label: 'Cor' },
    { value: 'responsavel',   label: 'Responsável' },
    { value: 'estimadoHoras', label: 'Horas estimadas' },
];

const flowConnectionService = {
    listByProject: (projectId: number): Promise<FlowConnectionDTO[]> =>
        httpClient.get(`/projects/${projectId}/flow-connections`).then(r => r.data),

    getById: (projectId: number, id: number): Promise<FlowConnectionDTO> =>
        httpClient.get(`/projects/${projectId}/flow-connections/${id}`).then(r => r.data),

    create: (projectId: number, data: CreateFlowConnectionRequest): Promise<FlowConnectionDTO> =>
        httpClient.post(`/projects/${projectId}/flow-connections`, data).then(r => r.data),

    toggleActive: (projectId: number, id: number, active: boolean): Promise<FlowConnectionDTO> =>
        httpClient.patch(`/projects/${projectId}/flow-connections/${id}/active`, null, {
            params: { active },
        }).then(r => r.data),

    delete: (projectId: number, id: number): Promise<void> =>
        httpClient.delete(`/projects/${projectId}/flow-connections/${id}`).then(() => undefined),

    /** Busca colunas ativas de um projeto para usar nos selects */
    getColumns: (projectId: number): Promise<KanbanColumnOption[]> =>
        httpClient.get(`/tarefas/kanbanColumns`, { params: { projectId } }).then(r =>
            (r.data as any[]).map(col => ({
                id: col.id,
                title: col.title,
                color: col.color ?? '#64748b',
                projectId,
                projectName: '',
            }))
        ),
};

export default flowConnectionService;