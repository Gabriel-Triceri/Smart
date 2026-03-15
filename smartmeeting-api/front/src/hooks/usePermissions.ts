import { useState, useEffect, useCallback } from 'react';
import { Permission } from '../types/permissions';
import { permissionService } from '../services/permissionService';
import { usePermissionCache } from './usePermissionCache';

interface UsePermissionsReturn {
    permissions: Permission[];
    isLoading: boolean;
    error: string | null;
    createPermission: (nome: string) => Promise<Permission | null>;
    updatePermission: (id: number, nome: string) => Promise<Permission | null>;
    deletePermission: (id: number) => Promise<boolean>;
    refreshPermissions: () => Promise<void>;
    hasPermission: (permissionName: string) => boolean;
}

export const usePermissions = (): UsePermissionsReturn => {
    const permissionCache = usePermissionCache();
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Sync with cache
    useEffect(() => {
        setPermissions(permissionCache.permissions);
    }, [permissionCache.permissions]);

    const fetchPermissions = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await permissionService.getAllPermissions();
            setPermissions(data);
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Erro ao carregar permissões';
            setError(errorMessage);
            console.error('Error fetching permissions:', err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Load initial data if cache is empty
    useEffect(() => {
        if (!permissionCache.isInitialized && !permissionCache.isLoading) {
            fetchPermissions();
        }
    }, [permissionCache.isInitialized, permissionCache.isLoading, fetchPermissions]);

    const createPermission = async (nome: string): Promise<Permission | null> => {
        setIsLoading(true);
        setError(null);
        try {
            const newPermission = await permissionService.createPermission({ nome });
            
            // Update local state
            setPermissions(prev => [...prev, newPermission]);
            
            // Update cache
            permissionCache.refreshPermissions();
            
            return newPermission;
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Erro ao criar permissão';
            setError(errorMessage);
            console.error('Error creating permission:', err);
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    const updatePermission = async (id: number, nome: string): Promise<Permission | null> => {
        setIsLoading(true);
        setError(null);
        try {
            const updated = await permissionService.updatePermission(id, { nome });
            
            // Update local state
            setPermissions(prev => prev.map(p => p.id === id ? updated : p));
            
            // Update cache
            permissionCache.refreshPermissions();
            
            return updated;
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Erro ao atualizar permissão';
            setError(errorMessage);
            console.error('Error updating permission:', err);
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    const deletePermission = async (id: number): Promise<boolean> => {
        setIsLoading(true);
        setError(null);
        try {
            await permissionService.deletePermission(id);
            
            // Update local state
            setPermissions(prev => prev.filter(p => p.id !== id));
            
            // Update cache
            permissionCache.refreshPermissions();
            
            return true;
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Erro ao deletar permissão';
            setError(errorMessage);
            console.error('Error deleting permission:', err);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    return {
        permissions: permissions.length > 0 ? permissions : permissionCache.permissions,
        isLoading: isLoading || permissionCache.isLoading,
        error: error || permissionCache.error,
        createPermission,
        updatePermission,
        deletePermission,
        refreshPermissions: () => {
            fetchPermissions();
            return permissionCache.refreshPermissions();
        },
        hasPermission: permissionCache.hasPermission
    };
};
