import { useState, useEffect, useCallback, useRef } from 'react';
import { Permission } from '../types/permissions';
import { permissionService } from '../services/permissionService';
import { roleService } from '../services/roleService';
import { authService } from '../services/authService';

interface PermissionCache {
    permissions: Permission[];
    roles: import('../types/permissions').Role[];
    userRoles: string[];
    lastUpdated: number;
    isInitialized: boolean;
}

interface UsePermissionCacheReturn extends PermissionCache {
    isLoading: boolean;
    error: string | null;
    refreshAll: () => Promise<void>;
    refreshPermissions: () => Promise<void>;
    refreshRoles: () => Promise<void>;
    refreshUserRoles: () => Promise<void>;
    hasPermission: (permissionName: string) => boolean;
    hasAnyPermission: (permissionNames: string[]) => boolean;
    hasAllPermissions: (permissionNames: string[]) => boolean;
    hasRole: (roleName: string) => boolean;
    hasAnyRole: (roleNames: string[]) => boolean;
}

// Singleton cache state
let globalCache: PermissionCache | null = null;
const subscribers = new Set<(cache: PermissionCache) => void>();


function notifySubscribers() {
    if (globalCache) {
        subscribers.forEach(callback => callback(globalCache!));
    }
}

function notifySubscribersAsync() {
    setTimeout(notifySubscribers, 0);
}

export function usePermissionCache(): UsePermissionCacheReturn {
    const [cache, setCache] = useState<PermissionCache>({
        permissions: [],
        roles: [],
        userRoles: [],
        lastUpdated: 0,
        isInitialized: false
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const initializationRef = useRef(false);

    // Initialize cache from global state
    useEffect(() => {
        if (globalCache) {
            setCache(globalCache);
        }
    }, []);

    // Subscribe to cache updates
    useEffect(() => {
        const handleUpdate = (newCache: PermissionCache) => {
            setCache(newCache);
        };
        subscribers.add(handleUpdate);
        return () => {
            subscribers.delete(handleUpdate);
        };
    }, []);

    // Load all data on mount
    useEffect(() => {
        if (initializationRef.current) return;
        initializationRef.current = true;

        const loadAll = async () => {
            setIsLoading(true);
            setError(null);
            try {
                await refreshAll();
            } catch (err: any) {
                const errorMessage = err.response?.data?.message || 'Erro ao inicializar cache de permissões';
                setError(errorMessage);
            } finally {
                setIsLoading(false);
            }
        };

        loadAll();
    }, []);

    const updateCache = useCallback((updates: Partial<PermissionCache>) => {
        if (!globalCache) {
            globalCache = {
                permissions: [],
                roles: [],
                userRoles: [],
                lastUpdated: Date.now(),
                isInitialized: true,
                ...updates
            };
        } else {
            globalCache = {
                ...globalCache,
                ...updates,
                lastUpdated: Date.now(),
                isInitialized: true
            };
        }
        setCache(globalCache);
        notifySubscribersAsync();
    }, []);

    const refreshAll = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const userInfo = authService.getUserInfo();

            const [permissionsData, rolesData] = await Promise.all([
                permissionService.getAllPermissions().catch(() => []),
                roleService.getAllRoles().catch(() => [])
            ]);

            let userRoles: string[] = [];
            if (userInfo.id) {
                try {
                    userRoles = await roleService.getUserRoles(Number(userInfo.id));
                } catch {
                    userRoles = [];
                }
            }

            updateCache({
                permissions: permissionsData,
                roles: rolesData,
                userRoles
            });
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Erro ao atualizar cache de permissões';
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [updateCache]);

    const refreshPermissions = useCallback(async () => {
        try {
            const permissionsData = await permissionService.getAllPermissions();
            updateCache({ permissions: permissionsData });
        } catch (err: any) {
            setError(err.response?.data?.message || 'Erro ao atualizar permissões');
            throw err;
        }
    }, [updateCache]);

    const refreshRoles = useCallback(async () => {
        try {
            const rolesData = await roleService.getAllRoles();
            updateCache({ roles: rolesData });
        } catch (err: any) {
            setError(err.response?.data?.message || 'Erro ao atualizar papéis');
            throw err;
        }
    }, [updateCache]);

    const refreshUserRoles = useCallback(async () => {
        try {
            const userInfo = authService.getUserInfo();
            if (!userInfo.id) {
                updateCache({ userRoles: [] });
                return;
            }

            const userRoles = await roleService.getUserRoles(Number(userInfo.id));
            updateCache({ userRoles });
        } catch (err: any) {
            setError(err.response?.data?.message || 'Erro ao atualizar papéis do usuário');
            throw err;
        }
    }, [updateCache]);

    const hasPermission = useCallback((permissionName: string): boolean => {
        const normalizedName = normalizePermission(permissionName);
        
        // Check direct match
        if (cache.permissions.some(p => p.nome === normalizedName)) {
            return true;
        }

        // Check if any user role has this permission
        for (const role of cache.roles) {
            if (cache.userRoles.includes(role.nome)) {
                if (role.permissions.includes(normalizedName)) {
                    return true;
                }
            }
        }

        // Check admin role
        if (cache.userRoles.includes('ADMIN') || cache.userRoles.includes('ROLE_ADMIN')) {
            return true;
        }

        return false;
    }, [cache]);

    const hasAnyPermission = useCallback((permissionNames: string[]): boolean => {
        return permissionNames.some(name => hasPermission(name));
    }, [hasPermission]);

    const hasAllPermissions = useCallback((permissionNames: string[]): boolean => {
        return permissionNames.every(name => hasPermission(name));
    }, [hasPermission]);

    const hasRole = useCallback((roleName: string): boolean => {
        return cache.userRoles.some(r => 
            r === roleName || r === `ROLE_${roleName}` || r === roleName.replace('ROLE_', '')
        );
    }, [cache.userRoles]);

    const hasAnyRole = useCallback((roleNames: string[]): boolean => {
        return roleNames.some(name => hasRole(name));
    }, [hasRole]);

    return {
        ...cache,
        isLoading,
        error,
        refreshAll,
        refreshPermissions,
        refreshRoles,
        refreshUserRoles,
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
        hasRole,
        hasAnyRole
    };
}

// Legacy permission normalization
const LEGACY_PERMISSION_MAP: Record<string, string> = {
    // Projeto
    'VIEW_PROJECT': 'PROJECT_VIEW',
    'EDIT_PROJECT': 'PROJECT_EDIT',
    'DELETE_PROJECT': 'PROJECT_DELETE',
    'MANAGE_MEMBERS': 'PROJECT_MANAGE_MEMBERS',

    // Tarefas
    'CREATE_TASK': 'TASK_CREATE',
    'VIEW_TASK': 'TASK_VIEW',
    'EDIT_TASK': 'TASK_EDIT',
    'DELETE_TASK': 'TASK_DELETE',
    'MOVE_TASK': 'TASK_MOVE',
    'ASSIGN_TASK': 'TASK_ASSIGN',
    'COMMENT_TASK': 'TASK_COMMENT',

    // Kanban
    'MANAGE_COLUMNS': 'KANBAN_MANAGE_COLUMNS',

    // Admin
    'ADMIN': 'ADMIN_MANAGE_USERS',
    'VIEW_REPORTS': 'ADMIN_VIEW_REPORTS'
};

export function normalizePermission(permissionName: string): string {
    if (!permissionName) return '';
    
    const normalized = permissionName.toUpperCase().trim();
    
    // Check if already modern
    if (LEGACY_PERMISSION_MAP[normalized] || isModernPermission(normalized)) {
        return normalized;
    }
    
    // Convert legacy to modern
    return LEGACY_PERMISSION_MAP[normalized] || permissionName;
}

function isModernPermission(name: string): boolean {
    const modernPermissions = [
        'PROJECT_VIEW', 'PROJECT_EDIT', 'PROJECT_DELETE', 'PROJECT_MANAGE_MEMBERS',
        'TASK_CREATE', 'TASK_VIEW', 'TASK_EDIT', 'TASK_DELETE', 'TASK_MOVE', 
        'TASK_ASSIGN', 'TASK_COMMENT', 'TASK_ATTACH',
        'KANBAN_VIEW', 'KANBAN_MANAGE_COLUMNS',
        'MEETING_CREATE', 'MEETING_VIEW', 'MEETING_EDIT', 'MEETING_DELETE', 'MEETING_MANAGE_PARTICIPANTS',
        'ADMIN_MANAGE_USERS', 'ADMIN_MANAGE_ROLES', 'ADMIN_VIEW_REPORTS', 'ADMIN_SYSTEM_SETTINGS'
    ];
    return modernPermissions.includes(name);
}

export default usePermissionCache;
