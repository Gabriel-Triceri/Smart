import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const authApi = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
});

interface LoginResponse {
    token: string;
    roles: string[];
    permissions: string[];
}

export const authService = {
    login: async (email: string, password: string): Promise<LoginResponse> => {
        const response = await authApi.post<LoginResponse>('/auth/login', {
            email: email,
            senha: password,
        });

        if (response.data.token) {
            localStorage.setItem('authToken', response.data.token);
            localStorage.setItem('userRoles', JSON.stringify(response.data.roles));
            localStorage.setItem('userPermissions', JSON.stringify(response.data.permissions));
        }

        return response.data;
    },

    logout: () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userRoles');
        localStorage.removeItem('userPermissions');
    },

    getToken: () => {
        return localStorage.getItem('authToken');
    },

    isAuthenticated: () => {
        return !!localStorage.getItem('authToken');
    }
};
