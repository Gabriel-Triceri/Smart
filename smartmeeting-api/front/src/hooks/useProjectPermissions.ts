import { useState, useEffect, useCallback } from 'react';
import { ProjectPermission, PermissionType } from '../types/meetings';
import { meetingsApi } from '../services/meetingsApi';

interface UseProjectPermissionsReturn {
    permissions: ProjectPermission[];
    loading: boolean;
    error: string | null;
    availableTypes: PermissionType[];

    // Actions
    loadPermissions: () => Promise<void>;
    grantPermission: (memberId: string, permissionType: PermissionType) => Promise<ProjectPermission | null>;
    revokePermission: (permissionId: string) => Promise<boolean>;
    checkPermission: (memberId: string, permissionType: PermissionType) => Promise<boolean>;
    applyRole: (memberId: string, roleName: string) => Promise<ProjectPermission[]>;
    getMemberPermissions: (memberId: string) => Promise<ProjectPermission[]>;

    // Helpers
    hasPermission: (memberId: string, permissionType: PermissionType) => boolean;
    getPermissionsByMember: (memberId: string) => ProjectPermission[];
}

export function useProjectPermissions(projectId: string): UseProjectPermissionsReturn {
    const [permissions, setPermissions] = useState<ProjectPermission[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [availableTypes, setAvailableTypes] = useState<PermissionType[]>([]);

    // Load all permissions for the project
    const loadPermissions = useCallback(async () => {
        if (!projectId) return;

        try {
            setLoading(true);
            setError(null);
            const data = await meetingsApi.getProjectPermissions(projectId);
            setPermissions(data);
        } catch (err) {
            console.error('Erro ao carregar permissões:', err);
            setError('Falha ao carregar permissões do projeto');
        } finally {
            setLoading(false);
        }
    }, [projectId]);

    // Load available permission types
    const loadAvailableTypes = useCallback(async () => {
        try {
            const types = await meetingsApi.getAvailablePermissionTypes();
            setAvailableTypes(types);
        } catch (err) {
            console.error('Erro ao carregar tipos de permissão:', err);
            setAvailableTypes(Object.values(PermissionType));
        }
    }, []);

    // Grant a permission to a member
    const grantPermission = useCallback(async (
        memberId: string,
        permissionType: PermissionType
    ): Promise<ProjectPermission | null> => {
        if (!projectId) return null;

        try {
            setError(null);
            const newPermission = await meetingsApi.grantPermission(projectId, memberId, permissionType);
            setPermissions(prev => [...prev, newPermission]);
            return newPermission;
        } catch (err) {
            console.error('Erro ao conceder permissão:', err);
            setError('Falha ao conceder permissão');
            return null;
        }
    }, [projectId]);

    // Revoke a permission
    const revokePermission = useCallback(async (permissionId: string): Promise<boolean> => {
        if (!projectId) return false;

        try {
            setError(null);
            await meetingsApi.revokePermission(projectId, permissionId);
            setPermissions(prev => prev.filter(p => p.id !== permissionId));
            return true;
        } catch (err) {
            console.error('Erro ao revogar permissão:', err);
            setError('Falha ao revogar permissão');
            return false;
        }
    }, [projectId]);

    // Check if a member has a specific permission
    const checkPermission = useCallback(async (
        memberId: string,
        permissionType: PermissionType
    ): Promise<boolean> => {
        if (!projectId) return false;

        try {
            return await meetingsApi.checkPermission(projectId, memberId, permissionType);
        } catch (err) {
            console.error('Erro ao verificar permissão:', err);
            return false;
        }
    }, [projectId]);

    // Apply a role's permissions to a member
    const applyRole = useCallback(async (
        memberId: string,
        roleName: string
    ): Promise<ProjectPermission[]> => {
        if (!projectId) return [];

        try {
            setError(null);
            const newPermissions = await meetingsApi.applyRolePermissions(projectId, memberId, roleName);
            setPermissions(prev => {
                const otherPermissions = prev.filter(p => p.memberId !== memberId);
                return [...otherPermissions, ...newPermissions];
            });
            return newPermissions;
        } catch (err) {
            console.error('Erro ao aplicar role:', err);
            setError('Falha ao aplicar role');
            return [];
        }
    }, [projectId]);

    // Get permissions for a specific member from API
    const getMemberPermissions = useCallback(async (memberId: string): Promise<ProjectPermission[]> => {
        if (!projectId) return [];

        try {
            return await meetingsApi.getMemberPermissions(projectId, memberId);
        } catch (err) {
            console.error('Erro ao buscar permissões do membro:', err);
            return [];
        }
    }, [projectId]);

    // Helper: Check if member has permission (from local state)
    const hasPermission = useCallback((memberId: string, permissionType: PermissionType): boolean => {
        return permissions.some(
            p => p.memberId === memberId &&
                (p.permissionType === permissionType || p.permissionType === PermissionType.ADMIN)
        );
    }, [permissions]);

    // Helper: Get all permissions for a member (from local state)
    const getPermissionsByMember = useCallback((memberId: string): ProjectPermission[] => {
        return permissions.filter(p => p.memberId === memberId);
    }, [permissions]);

    // Load permissions on mount
    useEffect(() => {
        if (projectId) {
            loadPermissions();
            loadAvailableTypes();
        }
    }, [projectId, loadPermissions, loadAvailableTypes]);

    return {
        permissions,
        loading,
        error,
        availableTypes,
        loadPermissions,
        grantPermission,
        revokePermission,
        checkPermission,
        applyRole,
        getMemberPermissions,
        hasPermission,
        getPermissionsByMember
    };
}

// Permission labels in Portuguese
export const PERMISSION_LABELS: Record<PermissionType, string> = {
    [PermissionType.VIEW_PROJECT]: 'Visualizar Projeto',
    [PermissionType.EDIT_PROJECT]: 'Editar Projeto',
    [PermissionType.DELETE_PROJECT]: 'Excluir Projeto',
    [PermissionType.MANAGE_MEMBERS]: 'Gerenciar Membros',
    [PermissionType.CREATE_TASK]: 'Criar Tarefas',
    [PermissionType.EDIT_TASK]: 'Editar Tarefas',
    [PermissionType.DELETE_TASK]: 'Excluir Tarefas',
    [PermissionType.ASSIGN_TASK]: 'Atribuir Tarefas',
    [PermissionType.MOVE_TASK]: 'Mover Tarefas',
    [PermissionType.COMMENT_TASK]: 'Comentar em Tarefas',
    [PermissionType.VIEW_REPORTS]: 'Visualizar Relatórios',
    [PermissionType.EXPORT_DATA]: 'Exportar Dados',
    [PermissionType.MANAGE_COLUMNS]: 'Gerenciar Colunas',
    [PermissionType.MANAGE_AUTOMATIONS]: 'Gerenciar Automações',
    [PermissionType.MANAGE_INTEGRATIONS]: 'Gerenciar Integrações',
    [PermissionType.VIEW_HISTORY]: 'Visualizar Histórico',
    [PermissionType.MANAGE_CHECKLIST]: 'Gerenciar Checklist',
    [PermissionType.UPLOAD_ATTACHMENTS]: 'Enviar Anexos',
    [PermissionType.DELETE_ATTACHMENTS]: 'Excluir Anexos',
    [PermissionType.MANAGE_LABELS]: 'Gerenciar Etiquetas',
    [PermissionType.SET_DUE_DATES]: 'Definir Prazos',
    [PermissionType.CHANGE_PRIORITY]: 'Alterar Prioridade',
    [PermissionType.BULK_ACTIONS]: 'Ações em Massa',
    [PermissionType.ADMIN]: 'Administrador'
};

// Permission categories for grouping in UI
export const PERMISSION_CATEGORIES: Record<string, PermissionType[]> = {
    'Projeto': [
        PermissionType.VIEW_PROJECT,
        PermissionType.EDIT_PROJECT,
        PermissionType.DELETE_PROJECT,
        PermissionType.MANAGE_MEMBERS
    ],
    'Tarefas': [
        PermissionType.CREATE_TASK,
        PermissionType.EDIT_TASK,
        PermissionType.DELETE_TASK,
        PermissionType.ASSIGN_TASK,
        PermissionType.MOVE_TASK,
        PermissionType.COMMENT_TASK
    ],
    'Dados e Relatórios': [
        PermissionType.VIEW_REPORTS,
        PermissionType.EXPORT_DATA,
        PermissionType.VIEW_HISTORY
    ],
    'Configurações': [
        PermissionType.MANAGE_COLUMNS,
        PermissionType.MANAGE_AUTOMATIONS,
        PermissionType.MANAGE_INTEGRATIONS,
        PermissionType.MANAGE_LABELS
    ],
    'Anexos e Checklist': [
        PermissionType.MANAGE_CHECKLIST,
        PermissionType.UPLOAD_ATTACHMENTS,
        PermissionType.DELETE_ATTACHMENTS
    ],
    'Outros': [
        PermissionType.SET_DUE_DATES,
        PermissionType.CHANGE_PRIORITY,
        PermissionType.BULK_ACTIONS
    ],
    'Especial': [
        PermissionType.ADMIN
    ]
};

// Predefined roles with their permissions
export const PREDEFINED_ROLES: Record<string, PermissionType[]> = {
    'Visualizador': [
        PermissionType.VIEW_PROJECT,
        PermissionType.VIEW_REPORTS,
        PermissionType.VIEW_HISTORY
    ],
    'Membro': [
        PermissionType.VIEW_PROJECT,
        PermissionType.CREATE_TASK,
        PermissionType.EDIT_TASK,
        PermissionType.MOVE_TASK,
        PermissionType.COMMENT_TASK,
        PermissionType.VIEW_REPORTS,
        PermissionType.VIEW_HISTORY,
        PermissionType.MANAGE_CHECKLIST,
        PermissionType.UPLOAD_ATTACHMENTS,
        PermissionType.SET_DUE_DATES
    ],
    'Colaborador': [
        PermissionType.VIEW_PROJECT,
        PermissionType.CREATE_TASK,
        PermissionType.EDIT_TASK,
        PermissionType.DELETE_TASK,
        PermissionType.ASSIGN_TASK,
        PermissionType.MOVE_TASK,
        PermissionType.COMMENT_TASK,
        PermissionType.VIEW_REPORTS,
        PermissionType.VIEW_HISTORY,
        PermissionType.MANAGE_CHECKLIST,
        PermissionType.UPLOAD_ATTACHMENTS,
        PermissionType.DELETE_ATTACHMENTS,
        PermissionType.SET_DUE_DATES,
        PermissionType.CHANGE_PRIORITY
    ],
    'Gerente': [
        PermissionType.VIEW_PROJECT,
        PermissionType.EDIT_PROJECT,
        PermissionType.MANAGE_MEMBERS,
        PermissionType.CREATE_TASK,
        PermissionType.EDIT_TASK,
        PermissionType.DELETE_TASK,
        PermissionType.ASSIGN_TASK,
        PermissionType.MOVE_TASK,
        PermissionType.COMMENT_TASK,
        PermissionType.VIEW_REPORTS,
        PermissionType.EXPORT_DATA,
        PermissionType.MANAGE_COLUMNS,
        PermissionType.VIEW_HISTORY,
        PermissionType.MANAGE_CHECKLIST,
        PermissionType.UPLOAD_ATTACHMENTS,
        PermissionType.DELETE_ATTACHMENTS,
        PermissionType.MANAGE_LABELS,
        PermissionType.SET_DUE_DATES,
        PermissionType.CHANGE_PRIORITY,
        PermissionType.BULK_ACTIONS
    ],
    'Administrador': [
        PermissionType.ADMIN
    ]
};

export default useProjectPermissions;
