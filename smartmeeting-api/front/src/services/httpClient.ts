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

httpClient.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error: AxiosError) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('authToken');
            localStorage.removeItem('userRoles');
            localStorage.removeItem('userPermissions');
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    },
);

export default httpClient;

