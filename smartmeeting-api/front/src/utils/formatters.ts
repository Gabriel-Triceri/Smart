import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const formatDate = (dateStr: string, formatStr: string = "dd 'de' MMMM 'às' HH:mm") => {
    if (!dateStr) return '';
    try {
        return format(new Date(dateStr), formatStr, { locale: ptBR });
    } catch (error) {
        console.error("Error formatting date:", dateStr, error);
        return dateStr;
    }
};

export const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};