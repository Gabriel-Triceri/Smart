import APP_CONSTANTS from "../config/constants";
import axios, {
    InternalAxiosRequestConfig,
    AxiosError,
    AxiosResponse
} from "axios";

const api = axios.create({
    baseURL: APP_CONSTANTS.API_BASE_URL,
    timeout: APP_CONSTANTS.API_TIMEOUT,
    headers: {
        "Content-Type": "application/json",
    },
});

// Interceptor para adicionar token automaticamente
api.interceptors.request.use(
    (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
        const token = localStorage.getItem("authToken");

        // Axios 1.6+ precisa garantir que headers exista
        config.headers = config.headers ?? {};

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error: AxiosError) => Promise.reject(error)
);

// Interceptor de resposta (tratamento de erros)
api.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error: AxiosError) => {
        if (error.response?.status === 401) {
            localStorage.removeItem("authToken");
            localStorage.removeItem("userRoles");
            localStorage.removeItem("userPermissions");
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

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
            const response = await api.post("/auth/refresh");

            if (response.data.token) {
                localStorage.setItem("authToken", response.data.token);
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

export default api;
