import api from './httpClient';
import { Permission, PermissionDTO } from '../types/permissions';

export const permissionService = {
    /**
     * Get all permissions
     */
    getAllPermissions: async (): Promise<Permission[]> => {
        const response = await api.get<PermissionDTO[]>('/permissions');
        return response.data.map(dto => ({
            id: dto.id!,
            nome: dto.nome
        }));
    },

    /**
     * Get permission by ID
     */
    getPermissionById: async (id: number): Promise<Permission> => {
        const response = await api.get<PermissionDTO>(`/permissions/${id}`);
        return {
            id: response.data.id!,
            nome: response.data.nome
        };
    },

    /**
     * Create new permission
     */
    createPermission: async (data: { nome: string }): Promise<Permission> => {
        const response = await api.post<PermissionDTO>('/permissions', data);
        return {
            id: response.data.id!,
            nome: response.data.nome
        };
    },

    /**
     * Update existing permission
     */
    updatePermission: async (id: number, data: { nome: string }): Promise<Permission> => {
        const response = await api.put<PermissionDTO>(`/permissions/${id}`, data);
        return {
            id: response.data.id!,
            nome: response.data.nome
        };
    },

    /**
     * Delete permission
     */
    deletePermission: async (id: number): Promise<void> => {
        await api.delete(`/permissions/${id}`);
    }
};
