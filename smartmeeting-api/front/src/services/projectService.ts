import {
    KanbanColumnDynamic,
    CreateKanbanColumnRequest,
    UpdateKanbanColumnRequest,
    MemberPermissions,
    ProjectRole,
    PermissionType,
    UpdatePermissionsRequest,
    ProjectPermissionDTO,
    ProjectPermission,
    ProjectDTO
} from '../types/meetings';

import api from './httpClient';
import { IdValidation } from '../utils/validation';

/** Cache curto das verificações de permissão por projeto — ver checkPermission. */
const PERMISSION_CHECK_TTL_MS = 5000;
const permissionCheckCache = new Map<string, { promessa: Promise<boolean>; expiraEm: number }>();

export const projectService = {

    // ===========================================
    // PROJETOS
    // ===========================================

    async getMyProjects(): Promise<ProjectDTO[]> {
        const response = await api.get('/projects');
        return response.data ?? [];
    },

    async getAllProjectsAdmin(): Promise<ProjectDTO[]> {
        const response = await api.get('/projects/all');
        return response.data ?? [];
    },

    /**
     * FIX #6: Método createProject estava ausente — o ProjectManager chamava
     * (projectService as any).createProject?.() que silenciosamente não fazia nada.
     */
    async createProject(data: { name: string; description?: string }): Promise<ProjectDTO> {
        const response = await api.post('/projects', data);
        return response.data;
    },

    async updateProject(
        projectId: string,
        data: { name?: string; description?: string; status?: string }
    ): Promise<ProjectDTO> {
        if (!IdValidation.isValidId(projectId)) {
            throw new Error('ID do projeto inválido');
        }
        const response = await api.put(`/projects/${projectId}`, data);
        return response.data;
    },

    async deleteProject(projectId: string): Promise<void> {
        if (!IdValidation.isValidId(projectId)) {
            throw new Error('ID do projeto inválido');
        }
        await api.delete(`/projects/${projectId}`);
    },

    // ===========================================
    // COLUNAS KANBAN DINÂMICAS (por projeto)
    // ===========================================

    async getKanbanColumnsByProject(projectId: string): Promise<KanbanColumnDynamic[]> {
        if (!projectId || (typeof projectId === 'string' && projectId.trim() === '')) {
            throw new Error('ID do projeto é obrigatório');
        }
        const response = await api.get(`/projects/${projectId}/kanban/columns`);
        if (!response.data || response.data.length === 0) {
            console.error(`Error: No Kanban columns returned for project ${projectId} from /projects/${projectId}/kanban/columns endpoint.`);
        }
        return response.data ?? [];
    },

    async createKanbanColumnDynamic(data: CreateKanbanColumnRequest): Promise<KanbanColumnDynamic> {
        if (!data.projectId || (typeof data.projectId === 'string' && data.projectId.trim() === '')) {
            throw new Error('ID do projeto é obrigatório');
        }

        const isValidId = (() => {
            if (typeof data.projectId === 'number') return data.projectId > 0;
            if (typeof data.projectId === 'string') {
                return data.projectId.trim().length > 0 && (
                    /^\d+$/.test(data.projectId.trim()) ||
                    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(data.projectId.trim())
                );
            }
            return false;
        })();

        if (!isValidId) throw new Error('ID do projeto inválido');

        const response = await api.post(`/projects/${data.projectId}/kanban/columns`, data);
        return response.data;
    },

    async updateKanbanColumnDynamic(projectId: string, columnId: string, data: UpdateKanbanColumnRequest): Promise<KanbanColumnDynamic> {
        if (!projectId || !columnId) throw new Error('IDs são obrigatórios');
        const response = await api.put(`/projects/${projectId}/kanban/columns/${columnId}`, data);
        return response.data;
    },

    async deleteKanbanColumnDynamic(projectId: string, columnId: string): Promise<void> {
        if (!projectId || !columnId) throw new Error('IDs são obrigatórios');
        await api.delete(`/projects/${projectId}/kanban/columns/${columnId}`);
    },

    async reorderKanbanColumns(projectId: string, columnIds: string[]): Promise<KanbanColumnDynamic[]> {
        if (!projectId) throw new Error('ID do projeto é obrigatório');
        const response = await api.post(`/projects/${projectId}/kanban/columns/reorder`, columnIds);
        return response.data ?? [];
    },

    // ===========================================
    // PERMISSÕES DE PROJETO
    // ===========================================

    async getAllMemberPermissions(projectId: string): Promise<MemberPermissions[]> {
        if (!IdValidation.isValidId(projectId)) throw new Error('ID do projeto inválido');
        const response = await api.get(`/projects/${projectId}/permissions`);
        return response.data ?? [];
    },

    async getMemberPermissions(projectId: string, memberId: string): Promise<MemberPermissions> {
        if (!IdValidation.isValidId(projectId) || !IdValidation.isValidId(memberId)) throw new Error('IDs inválidos');
        const response = await api.get(`/projects/${projectId}/permissions/members/${memberId}`);
        return response.data;
    },

    async getPersonPermissions(projectId: string, personId: string): Promise<MemberPermissions> {
        if (!IdValidation.isValidId(projectId) || !IdValidation.isValidId(personId)) throw new Error('IDs inválidos');
        const response = await api.get(`/projects/${projectId}/permissions/person/${personId}`);
        return response.data;
    },

    async updateMemberPermissions(
        projectId: string,
        memberId: string,
        permissions: Record<PermissionType, boolean>
    ): Promise<MemberPermissions> {
        if (!IdValidation.isValidId(projectId) || !IdValidation.isValidId(memberId)) throw new Error('IDs inválidos');
        const request: UpdatePermissionsRequest = { projectMemberId: Number(memberId), permissions };
        const response = await api.put(`/projects/${projectId}/permissions/members/${memberId}`, request);
        return response.data;
    },

    async updateMemberRole(projectId: string, memberId: string, role: ProjectRole): Promise<MemberPermissions> {
        if (!IdValidation.isValidId(projectId) || !IdValidation.isValidId(memberId)) throw new Error('IDs inválidos');
        const response = await api.put(`/projects/${projectId}/permissions/members/${memberId}/role`, { role });
        return response.data;
    },

    async resetMemberPermissions(projectId: string, memberId: string): Promise<MemberPermissions> {
        if (!IdValidation.isValidId(projectId) || !IdValidation.isValidId(memberId)) throw new Error('IDs inválidos');
        const response = await api.post(`/projects/${projectId}/permissions/members/${memberId}/reset`);
        return response.data;
    },

    /**
     * Verifica uma permissão no projeto, com deduplicação de requisições.
     *
     * Cada `<CanDo>` por projeto dispara esta chamada ao montar. Numa lista de 20 projetos
     * com 3 gates por card eram 60 requisições paralelas, e o modal de detalhes de tarefa
     * disparava 9 chamadas idênticas de uma vez. Aqui promessas em voo para a mesma chave
     * são compartilhadas e o resultado fica em cache por alguns segundos, o que colapsa a
     * rajada de montagem numa requisição por combinação sem segurar o valor tempo demais.
     */
    async checkPermission(projectId: string, personId: string | undefined, permissionType: PermissionType): Promise<boolean> {
        if (!IdValidation.isValidId(projectId)) throw new Error('ID do projeto inválido');
        if (personId !== undefined && !IdValidation.isValidId(personId)) throw new Error('ID da pessoa inválido');

        const chave = `${projectId}|${personId ?? 'eu'}|${permissionType}`;

        const emCache = permissionCheckCache.get(chave);
        if (emCache && Date.now() < emCache.expiraEm) {
            return emCache.promessa;
        }

        const promessa = (async () => {
            try {
                const params: Record<string, string> = { permission: permissionType };
                if (personId) params.personId = personId;
                const response = await api.get(`/projects/${projectId}/permissions/check`, { params });
                return response.data?.hasPermission ?? false;
            } catch {
                permissionCheckCache.delete(chave); // erro não fica em cache
                return false;
            }
        })();

        permissionCheckCache.set(chave, { promessa, expiraEm: Date.now() + PERMISSION_CHECK_TTL_MS });
        return promessa;
    },

    /** Descarta o cache de verificações — usar quando permissões mudam. */
    invalidatePermissionChecks(): void {
        permissionCheckCache.clear();
    },

    async getAvailablePermissionTypes(projectId: string): Promise<ProjectPermissionDTO[]> {
        if (!IdValidation.isValidId(projectId)) throw new Error('ID do projeto inválido');
        const response = await api.get(`/projects/${projectId}/permissions/types`);
        return response.data ?? [];
    },

    async getRolePermissionTemplate(projectId: string, role: ProjectRole): Promise<Record<PermissionType, boolean>> {
        if (!IdValidation.isValidId(projectId)) throw new Error('ID do projeto inválido');
        const response = await api.get(`/projects/${projectId}/permissions/templates/${role}`);
        return response.data ?? {};
    },

    /** @deprecated Use getAllMemberPermissions instead */
    async getProjectPermissions(projectId: string): Promise<ProjectPermission[]> {
        console.warn('getProjectPermissions is deprecated. Use getAllMemberPermissions instead.');
        const members = await this.getAllMemberPermissions(projectId);
        const permissions: ProjectPermission[] = [];
        members.forEach(member => {
            member.permissions.forEach(perm => {
                if (perm.granted) {
                    permissions.push({
                        id: String(perm.id ?? 0),
                        projectId: String(member.projectId),
                        memberId: String(member.projectMemberId),
                        memberNome: member.personName,
                        memberEmail: member.personEmail,
                        permissionType: perm.permissionType,
                        grantedBy: '',
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    });
                }
            });
        });
        return permissions;
    }
};