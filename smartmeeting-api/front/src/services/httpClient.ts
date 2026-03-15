import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import APP_CONSTANTS from '../config/constants';

const httpClient = axios.create({
    baseURL: APP_CONSTANTS.API_BASE_URL,
    timeout: APP_CONSTANTS.API_TIMEOUT,
    headers: {
        'Content-Type': 'application/json',
    },
});

httpClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers = {
                ...config.headers,
                Authorization: `Bearer ${token}`,
            } as any;
        }
        return config;
    },
    (error: AxiosError) => Promise.reject(error),
);

// Controle para evitar loop de refresh
let isRefreshing = false;
let refreshQueue: Array<(token: string) => void> = [];

const processQueue = (token: string) => {
    refreshQueue.forEach(cb => cb(token));
    refreshQueue = [];
};

httpClient.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as any;

        // Não tentar refresh na própria rota de auth
        const isAuthRoute = originalRequest?.url?.includes('/auth/');

        if (error.response?.status === 401 && !originalRequest._retry && !isAuthRoute) {
            if (isRefreshing) {
                // Aguardar o refresh em andamento
                return new Promise((resolve) => {
                    refreshQueue.push((newToken: string) => {
                        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
                        resolve(httpClient(originalRequest));
                    });
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const currentToken = localStorage.getItem('authToken');
                const response = await httpClient.post('/auth/refresh', { token: currentToken });
                const { token, roles, permissions } = response.data;

                localStorage.setItem('authToken', token);
                if (roles) localStorage.setItem('userRoles', JSON.stringify(roles));
                if (permissions) localStorage.setItem('userPermissions', JSON.stringify(permissions));

                processQueue(token);
                originalRequest.headers['Authorization'] = `Bearer ${token}`;
                return httpClient(originalRequest);
            } catch {
                // Refresh falhou — limpar sessão e redirecionar
                localStorage.removeItem('authToken');
                localStorage.removeItem('userRoles');
                localStorage.removeItem('userPermissions');
                if (window.location.pathname !== '/login') {
                    window.location.href = '/login';
                }
            } finally {
                isRefreshing = false;
            }
        }

        // Outros 401 (ex: login inválido) — só limpar e redirecionar
        if (error.response?.status === 401 && isAuthRoute) {
            localStorage.removeItem('authToken');
            localStorage.removeItem('userRoles');
            localStorage.removeItem('userPermissions');
        }

        return Promise.reject(error);
    },
);

export default httpClient;