import { useState, useEffect, useCallback } from 'react';
import {
    MemberPermissions,
    PermissionType,
    ProjectRole,
    ProjectPermissionDTO
} from '../types/meetings';
import { projectService } from '../services/projectService';
import { usePermissionCache } from './usePermissionCache';

interface UseProjectPermissionsReturn {
    members: MemberPermissions[];
    loading: boolean;
    error: string | null;
    availablePermissionTypes: ProjectPermissionDTO[];

    // Actions
    loadMembers: () => Promise<void>;
    updatePermissions: (memberId: string, permissions: Record<PermissionType, boolean>) => Promise<MemberPermissions | null>;
    updateMemberRole: (memberId: string, role: ProjectRole) => Promise<MemberPermissions | null>;
    resetMemberPermissions: (memberId: string) => Promise<MemberPermissions | null>;
    checkPermission: (personId: string | undefined, permissionType: PermissionType) => Promise<boolean>;
    getRoleTemplate: (role: ProjectRole) => Promise<Record<PermissionType, boolean>>;

    // Helpers
    getMemberById: (memberId: string) => MemberPermissions | undefined;
    hasPermission: (memberId: string | undefined, permissionType: PermissionType) => boolean;
}

export function useProjectPermissions(projectId: string): UseProjectPermissionsReturn {
    const permissionCache = usePermissionCache();
    const [members, setMembers] = useState<MemberPermissions[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [availablePermissionTypes, setAvailablePermissionTypes] = useState<ProjectPermissionDTO[]>([]);

    // Check if user has admin role (bypasses project permission checks)
    const isGlobalAdmin = useCallback(() => {
        return permissionCache.hasRole('ADMIN') || permissionCache.hasRole('ROLE_ADMIN');
    }, [permissionCache]);

    // Load all member permissions for the project
    const loadMembers = useCallback(async () => {
        if (!projectId) return;

        setLoading(true);
        setError(null);

        try {
            const data = await projectService.getAllMemberPermissions(projectId);
            setMembers(data);
        } catch (err) {
            console.error('Erro ao carregar permissões:', err);
            setError('Falha ao carregar permissões do projeto');
        } finally {
            setLoading(false);
        }
    }, [projectId]);

    // Load available permission types
    const loadAvailableTypes = useCallback(async () => {
        if (!projectId) return;

        try {
            const types = await projectService.getAvailablePermissionTypes(projectId);
            setAvailablePermissionTypes(types);
        } catch (err) {
            console.error('Erro ao carregar tipos de permissão:', err);
            // Fallback to enum values
            const fallbackTypes: ProjectPermissionDTO[] = Object.values(PermissionType).map(type => ({
                projectMemberId: 0,
                permissionType: type,
                permissionDescription: PERMISSION_LABELS[type] || type,
                granted: false
            }));
            setAvailablePermissionTypes(fallbackTypes);
        }
    }, [projectId]);

    // Update permissions for a member
    const updatePermissions = useCallback(async (
        memberId: string,
        permissions: Record<PermissionType, boolean>
    ): Promise<MemberPermissions | null> => {
        if (!projectId) return null;

        setLoading(true);
        setError(null);

        try {
            const updated = await projectService.updateMemberPermissions(projectId, memberId, permissions);

            // Update local state
            setMembers(prev => prev.map(m =>
                m.projectMemberId === updated.projectMemberId ? updated : m
            ));

            return updated;
        } catch (err) {
            console.error('Erro ao atualizar permissões:', err);
            setError('Falha ao atualizar permissões');
            return null;
        } finally {
            setLoading(false);
        }
    }, [projectId]);

    // Update member role
    const updateMemberRole = useCallback(async (
        memberId: string,
        role: ProjectRole
    ): Promise<MemberPermissions | null> => {
        if (!projectId) return null;

        setLoading(true);
        setError(null);

        try {
            const updated = await projectService.updateMemberRole(projectId, memberId, role);

            // Update local state
            setMembers(prev => prev.map(m =>
                m.projectMemberId === updated.projectMemberId ? updated : m
            ));

            return updated;
        } catch (err) {
            console.error('Erro ao atualizar role:', err);
            setError('Falha ao atualizar role do membro');
            return null;
        } finally {
            setLoading(false);
        }
    }, [projectId]);

    // Reset member permissions to default
    const resetMemberPermissions = useCallback(async (
        memberId: string
    ): Promise<MemberPermissions | null> => {
        if (!projectId) return null;

        setLoading(true);
        setError(null);

        try {
            const updated = await projectService.resetMemberPermissions(projectId, memberId);

            // Update local state
            setMembers(prev => prev.map(m =>
                m.projectMemberId === updated.projectMemberId ? updated : m
            ));

            return updated;
        } catch (err) {
            console.error('Erro ao resetar permissões:', err);
            setError('Falha ao resetar permissões');
            return null;
        } finally {
            setLoading(false);
        }
    }, [projectId]);

    // Check if person has specific permission (only if not cached locally)
    const checkPermission = useCallback(async (
        personId: string | undefined,
        permissionType: PermissionType
    ): Promise<boolean> => {
        if (!projectId) return false;

        // If personId is current user and we have admin, return true
        const userInfo = (permissionCache as any)['userInfo'] || (permissionCache as any).authService?.getUserInfo?.();
        if (personId === undefined || personId === userInfo?.id) {
            if (isGlobalAdmin()) {
                return true;
            }
        }

        // Use cached data if available for current user
        if (personId === undefined || personId === userInfo?.id) {
            const currentUserId = String(userInfo?.id);
            const currentMember = members.find(m => String(m.personId) === currentUserId);
            
            if (currentMember) {
                // Check from local state first (from cache)
                if (currentMember.permissionMap) {
                    const granted = currentMember.permissionMap[permissionType];
                    if (granted !== undefined) {
                        return granted;
                    }
                }
            }
        }

        // Fall back to API call if not in cache
        try {
            return await projectService.checkPermission(projectId, personId, permissionType);
        } catch (err) {
            console.error('Erro ao verificar permissão:', err);
            return false;
        }
    }, [projectId, members, isGlobalAdmin]);

    // Get role template
    const getRoleTemplate = useCallback(async (
        role: ProjectRole
    ): Promise<Record<PermissionType, boolean>> => {
        if (!projectId) return {} as Record<PermissionType, boolean>;

        try {
            return await projectService.getRolePermissionTemplate(projectId, role);
        } catch (err) {
            console.error('Erro ao buscar template de role:', err);
            return PREDEFINED_ROLE_PERMISSIONS[role] || {};
        }
    }, [projectId]);

    // Helper: Get member by ID
    const getMemberById = useCallback((memberId: string): MemberPermissions | undefined => {
        return members.find(m => String(m.projectMemberId) === memberId);
    }, [members]);

    // Helper: Check if member has permission (from local state - cached)
    const hasPermission = useCallback((memberId: string | undefined, permissionType: PermissionType): boolean => {
        // Admin bypass
        if (isGlobalAdmin()) {
            return true;
        }

        if (!memberId) return false;

        const member = members.find(m => String(m.projectMemberId) === memberId);
        if (!member) return false;

        // Check permissionMap first (from cache)
        if (member.permissionMap) {
            return member.permissionMap[permissionType] === true;
        }

        // Fallback to permissions array
        return member.permissions.some(p =>
            p.permissionType === permissionType && p.granted
        );
    }, [members, isGlobalAdmin]);

    // Load data on mount and when cache is updated
    useEffect(() => {
        if (projectId) {
            loadMembers();
            loadAvailableTypes();
        }
    }, [projectId, loadMembers, loadAvailableTypes]);

    return {
        members,
        loading: loading || permissionCache.isLoading,
        error: error || permissionCache.error,
        availablePermissionTypes,
        loadMembers,
        updatePermissions,
        updateMemberRole,
        resetMemberPermissions,
        checkPermission,
        getRoleTemplate,
        getMemberById,
        hasPermission
    };
}

export const PERMISSION_LABELS: Partial<Record<PermissionType, string>> = {
    [PermissionType.PROJECT_VIEW]: 'Visualizar Projeto',
    [PermissionType.PROJECT_EDIT]: 'Editar Projeto',
    [PermissionType.PROJECT_DELETE]: 'Excluir Projeto',
    [PermissionType.PROJECT_MANAGE_MEMBERS]: 'Gerenciar Membros',
    [PermissionType.TASK_CREATE]: 'Criar Tarefas',
    [PermissionType.TASK_VIEW]: 'Visualizar Tarefas',
    [PermissionType.TASK_EDIT]: 'Editar Tarefas',
    [PermissionType.TASK_DELETE]: 'Excluir Tarefas',
    [PermissionType.TASK_MOVE]: 'Mover Tarefas',
    [PermissionType.TASK_ASSIGN]: 'Atribuir Responsáveis',
    [PermissionType.TASK_COMMENT]: 'Comentar em Tarefas',
    [PermissionType.TASK_ATTACH]: 'Anexar Arquivos',
    [PermissionType.KANBAN_VIEW]: 'Visualizar Kanban',
    [PermissionType.KANBAN_MANAGE_COLUMNS]: 'Gerenciar Colunas',
    [PermissionType.MEETING_CREATE]: 'Criar Reuniões',
    [PermissionType.MEETING_VIEW]: 'Visualizar Reuniões',
    [PermissionType.MEETING_EDIT]: 'Editar Reuniões',
    [PermissionType.MEETING_DELETE]: 'Excluir Reuniões',
    [PermissionType.MEETING_MANAGE_PARTICIPANTS]: 'Gerenciar Participantes',
    [PermissionType.ADMIN_MANAGE_USERS]: 'Gerenciar Usuários',
    [PermissionType.ADMIN_MANAGE_ROLES]: 'Gerenciar Papéis',
    [PermissionType.ADMIN_VIEW_REPORTS]: 'Visualizar Relatórios',
    [PermissionType.ADMIN_SYSTEM_SETTINGS]: 'Configurações do Sistema'
};

export const PERMISSION_CATEGORIES: Record<string, PermissionType[]> = {
    'Projeto': [PermissionType.PROJECT_VIEW, PermissionType.PROJECT_EDIT, PermissionType.PROJECT_DELETE, PermissionType.PROJECT_MANAGE_MEMBERS],
    'Tarefas': [PermissionType.TASK_CREATE, PermissionType.TASK_VIEW, PermissionType.TASK_EDIT, PermissionType.TASK_DELETE, PermissionType.TASK_MOVE, PermissionType.TASK_ASSIGN, PermissionType.TASK_COMMENT, PermissionType.TASK_ATTACH],
    'Kanban': [PermissionType.KANBAN_VIEW, PermissionType.KANBAN_MANAGE_COLUMNS],
    'Reuniões': [PermissionType.MEETING_CREATE, PermissionType.MEETING_VIEW, PermissionType.MEETING_EDIT, PermissionType.MEETING_DELETE, PermissionType.MEETING_MANAGE_PARTICIPANTS],
    'Administração': [PermissionType.ADMIN_MANAGE_USERS, PermissionType.ADMIN_MANAGE_ROLES, PermissionType.ADMIN_VIEW_REPORTS, PermissionType.ADMIN_SYSTEM_SETTINGS]
};

export const ROLE_LABELS: Record<ProjectRole, string> = {
    [ProjectRole.OWNER]: 'Proprietário',
    [ProjectRole.ADMIN]: 'Administrador',
    [ProjectRole.MEMBER_EDITOR]: 'Membro Editor'
};

// Predefined role permissions (fallback if API fails)
const PREDEFINED_ROLE_PERMISSIONS: Record<ProjectRole, Record<PermissionType, boolean>> = {
    [ProjectRole.OWNER]: Object.values(PermissionType).reduce((acc, type) => {
        acc[type] = true;
        return acc;
    }, {} as Record<PermissionType, boolean>),

    [ProjectRole.ADMIN]: Object.values(PermissionType).reduce((acc, type) => {
        acc[type] = type !== PermissionType.PROJECT_DELETE && type !== PermissionType.ADMIN_SYSTEM_SETTINGS;
        return acc;
    }, {} as Record<PermissionType, boolean>),

    [ProjectRole.MEMBER_EDITOR]: Object.values(PermissionType).reduce((acc, type) => {
        acc[type] = false;
        if ([
            PermissionType.PROJECT_VIEW,
            PermissionType.TASK_CREATE,
            PermissionType.TASK_VIEW,
            PermissionType.TASK_EDIT,
            PermissionType.TASK_MOVE,
            PermissionType.TASK_COMMENT,
            PermissionType.TASK_ATTACH,
            PermissionType.KANBAN_VIEW,
            PermissionType.MEETING_CREATE,
            PermissionType.MEETING_VIEW
        ].includes(type)) {
            acc[type] = true;
        }
        return acc;
    }, {} as Record<PermissionType, boolean>)
};

export default useProjectPermissions;
