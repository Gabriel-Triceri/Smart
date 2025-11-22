import { useState, useEffect, useCallback } from 'react';
import { Role } from '../types/permissions';
import { roleService } from '../services/roleService';

interface UseRolesReturn {
    roles: Role[];
    isLoading: boolean;
    error: string | null;
    createRole: (nome: string) => Promise<Role | null>;
    updateRole: (id: number, nome: string) => Promise<Role | null>;
    addPermissionToRole: (roleId: number, permissionId: number) => Promise<boolean>;
    removePermissionFromRole: (roleId: number, permissionId: number) => Promise<boolean>;
    refreshRoles: () => Promise<void>;
}

export const useRoles = (): UseRolesReturn => {
    const [roles, setRoles] = useState<Role[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchRoles = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await roleService.getAllRoles();
            setRoles(data);
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Erro ao carregar roles';
            setError(errorMessage);
            console.error('Error fetching roles:', err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRoles();
    }, [fetchRoles]);

    const createRole = async (nome: string): Promise<Role | null> => {
        setIsLoading(true);
        setError(null);
        try {
            const newRole = await roleService.createRole({ nome });
            setRoles(prev => [...prev, newRole]);
            return newRole;
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Erro ao criar role';
            setError(errorMessage);
            console.error('Error creating role:', err);
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    const updateRole = async (id: number, nome: string): Promise<Role | null> => {
        setIsLoading(true);
        setError(null);
        try {
            const updated = await roleService.updateRole(id, { nome });
            setRoles(prev => prev.map(r => r.id === id ? updated : r));
            return updated;
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Erro ao atualizar role';
            setError(errorMessage);
            console.error('Error updating role:', err);
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    const addPermissionToRole = async (roleId: number, permissionId: number): Promise<boolean> => {
        setIsLoading(true);
        setError(null);
        try {
            const updated = await roleService.addPermissionToRole(roleId, permissionId);
            setRoles(prev => prev.map(r => r.id === roleId ? updated : r));
            return true;
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Erro ao adicionar permissão';
            setError(errorMessage);
            console.error('Error adding permission to role:', err);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const removePermissionFromRole = async (roleId: number, permissionId: number): Promise<boolean> => {
        setIsLoading(true);
        setError(null);
        try {
            const updated = await roleService.removePermissionFromRole(roleId, permissionId);
            setRoles(prev => prev.map(r => r.id === roleId ? updated : r));
            return true;
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Erro ao remover permissão';
            setError(errorMessage);
            console.error('Error removing permission from role:', err);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    return {
        roles,
        isLoading,
        error,
        createRole,
        updateRole,
        addPermissionToRole,
        removePermissionFromRole,
        refreshRoles: fetchRoles
    };
};
