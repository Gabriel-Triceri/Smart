import api from './httpClient';

interface LoginResponse {
    token: string;
    roles: string[];
    permissions: string[];
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
};
