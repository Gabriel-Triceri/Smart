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

    async checkPermission(projectId: string, personId: string | undefined, permissionType: PermissionType): Promise<boolean> {
        if (!IdValidation.isValidId(projectId)) throw new Error('ID do projeto inválido');
        if (personId !== undefined && !IdValidation.isValidId(personId)) throw new Error('ID da pessoa inválido');
        try {
            const params: Record<string, string> = { permission: permissionType };
            if (personId) params.personId = personId;
            const response = await api.get(`/projects/${projectId}/permissions/check`, { params });
            return response.data?.hasPermission ?? false;
        } catch {
            return false;
        }
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