import api from './httpClient';

interface LoginResponse {
    token: string;
    roles: string[];
    permissions: string[];
}

export interface UserInfo {
    id: string | null;
    name: string | null;
    email: string | null;
    roles: string[];
}

export const authService = {
    login: async (email: string, password: string): Promise<LoginResponse> => {
        try {
            const response = await api.post<LoginResponse>("/auth/login", {
                email,
                senha: password,
            });

            if (response.data.token) {
                localStorage.setItem("authToken", response.data.token);
                localStorage.setItem("userRoles", JSON.stringify(response.data.roles));
                localStorage.setItem("userPermissions", JSON.stringify(response.data.permissions));
            }

            return response.data;
        } catch (error) {
            console.error("Erro no login:", error);
            throw error;
        }
    },

    logout: (): void => {
        localStorage.removeItem("authToken");
        localStorage.removeItem("userRoles");
        localStorage.removeItem("userPermissions");
    },

    getToken: (): string | null => {
        return localStorage.getItem("authToken");
    },

    getRoles: (): string[] => {
        const roles = localStorage.getItem("userRoles");
        return roles ? JSON.parse(roles) : [];
    },

    getPermissions: (): string[] => {
        const permissions = localStorage.getItem("userPermissions");
        return permissions ? JSON.parse(permissions) : [];
    },

    isAuthenticated: (): boolean => {
        return !!localStorage.getItem("authToken");
    },

    hasRole(role: string): boolean {
        return authService.getRoles().includes(role);
    },

    hasPermission(permission: string): boolean {
        return authService.getPermissions().includes(permission);
    },

    refreshToken: async (): Promise<boolean> => {
        try {
            const currentToken = localStorage.getItem("authToken");

            if (!currentToken) {
                console.error("Token atual não encontrado");
                authService.logout();
                return false;
            }

            const response = await api.post("/auth/refresh", {
                token: currentToken
            });

            if (response.data.token) {
                localStorage.setItem("authToken", response.data.token);

                // Atualizar roles e permissions se retornados
                if (response.data.roles) {
                    localStorage.setItem("userRoles", JSON.stringify(response.data.roles));
                }
                if (response.data.permissions) {
                    localStorage.setItem("userPermissions", JSON.stringify(response.data.permissions));
                }

                return true;
            }

            return false;
        } catch (error) {
            console.error("Erro ao renovar token:", error);
            authService.logout();
            return false;
        }
    },

    /**
     * Extrai informações do usuário do token JWT
     */
    getUserInfo: (): UserInfo => {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                return { id: null, name: null, email: null, roles: [] };
            }

            const parts = token.split('.');
            if (parts.length < 2) {
                return { id: null, name: null, email: null, roles: [] };
            }

            // Decodificar payload do JWT (base64)
            const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));

            return {
                id: payload.sub || payload.usuarioId || payload.id || null,
                name: payload.name || payload.nome || payload.usuarioNome || payload.fullName || null,
                email: payload.email || payload.preferred_username || null,
                roles: authService.getRoles()
            };
        } catch (error) {
            console.error('Erro ao extrair informações do usuário do token:', error);
            return { id: null, name: null, email: null, roles: [] };
        }
    },

    /**
     * Retorna as iniciais do nome do usuário para avatar
     */
    getUserInitials: (): string => {
        const userInfo = authService.getUserInfo();
        if (userInfo.name) {
            const parts = userInfo.name.split(' ').filter(Boolean);
            if (parts.length >= 2) {
                return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
            }
            return userInfo.name.substring(0, 2).toUpperCase();
        }
        if (userInfo.email) {
            return userInfo.email.substring(0, 2).toUpperCase();
        }
        return 'US';
    },
};
