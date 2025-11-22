import api from './httpClient';
import { Role, RoleDTO } from '../types/permissions';

export const roleService = {
    /**
     * Get all roles
     */
    getAllRoles: async (): Promise<Role[]> => {
        const response = await api.get<RoleDTO[]>('/roles');
        return response.data.map(dto => ({
            id: dto.id!,
            nome: dto.nome,
            permissions: dto.permissions || []
        }));
    },

    /**
     * Get role by ID
     */
    getRoleById: async (id: number): Promise<Role> => {
        const response = await api.get<RoleDTO>(`/roles/${id}`);
        return {
            id: response.data.id!,
            nome: response.data.nome,
            permissions: response.data.permissions || []
        };
    },

    /**
     * Create new role
     */
    createRole: async (data: { nome: string }): Promise<Role> => {
        const response = await api.post<RoleDTO>('/roles', data);
        return {
            id: response.data.id!,
            nome: response.data.nome,
            permissions: response.data.permissions || []
        };
    },

    /**
     * Update existing role
     */
    updateRole: async (id: number, data: { nome: string }): Promise<Role> => {
        const response = await api.put<RoleDTO>(`/roles/${id}`, data);
        return {
            id: response.data.id!,
            nome: response.data.nome,
            permissions: response.data.permissions || []
        };
    },

    /**
     * Add permission to role
     */
    addPermissionToRole: async (roleId: number, permissionId: number): Promise<Role> => {
        const response = await api.post<RoleDTO>(`/roles/${roleId}/permissions/${permissionId}`);
        return {
            id: response.data.id!,
            nome: response.data.nome,
            permissions: response.data.permissions || []
        };
    },

    /**
     * Remove permission from role
     */
    removePermissionFromRole: async (roleId: number, permissionId: number): Promise<Role> => {
        const response = await api.delete<RoleDTO>(`/roles/${roleId}/permissions/${permissionId}`);
        return {
            id: response.data.id!,
            nome: response.data.nome,
            permissions: response.data.permissions || []
        };
    }
};
