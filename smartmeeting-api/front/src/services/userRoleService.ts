import api from './httpClient';

interface PessoaDTO {
    id: number;
    nome: string;
    email: string;
    crachaId: string;
    tipoUsuario: string;
}

export const userRoleService = {
    /**
     * Get all users
     */
    getAllUsers: async (): Promise<PessoaDTO[]> => {
        const response = await api.get<PessoaDTO[]>('/pessoas');
        return response.data;
    },

    /**
     * Get roles for a specific user
     */
    getUserRoles: async (userId: number): Promise<string[]> => {
        const response = await api.get<string[]>(`/pessoas/${userId}/roles`);
        return response.data;
    },

    /**
     * Add role to user
     */
    addRoleToUser: async (userId: number, roleId: number): Promise<void> => {
        await api.post(`/pessoas/${userId}/roles/${roleId}`);
    },

    /**
     * Remove role from user
     */
    removeRoleFromUser: async (userId: number, roleId: number): Promise<void> => {
        await api.delete(`/pessoas/${userId}/roles/${roleId}`);
    }
};
