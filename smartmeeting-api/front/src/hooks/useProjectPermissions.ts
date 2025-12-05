import { useState, useEffect, useCallback } from 'react';
import {
    MemberPermissions,
    PermissionType,
    ProjectRole,
    ProjectPermissionDTO
} from '../types/meetings';
import { meetingsApi } from '../services/meetingsApi';

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
    checkPermission: (personId: string, permissionType: PermissionType) => Promise<boolean>;
    getRoleTemplate: (role: ProjectRole) => Promise<Record<PermissionType, boolean>>;

    // Helpers
    getMemberById: (memberId: string) => MemberPermissions | undefined;
    hasPermission: (memberId: string, permissionType: PermissionType) => boolean;
}

export function useProjectPermissions(projectId: string): UseProjectPermissionsReturn {
    const [members, setMembers] = useState<MemberPermissions[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [availablePermissionTypes, setAvailablePermissionTypes] = useState<ProjectPermissionDTO[]>([]);

    // Load all member permissions for the project
    const loadMembers = useCallback(async () => {
        if (!projectId) return;

        try {
            setLoading(true);
            setError(null);
            const data = await meetingsApi.getAllMemberPermissions(projectId);
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
            const types = await meetingsApi.getAvailablePermissionTypes(projectId);
            setAvailablePermissionTypes(types);
        } catch (err) {
            console.error('Erro ao carregar tipos de permissão:', err);
            // Fallback para os tipos do enum
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

        try {
            setError(null);
            const updated = await meetingsApi.updateMemberPermissions(projectId, memberId, permissions);

            // Update local state
            setMembers(prev => prev.map(m =>
                m.projectMemberId === updated.projectMemberId ? updated : m
            ));

            return updated;
        } catch (err) {
            console.error('Erro ao atualizar permissões:', err);
            setError('Falha ao atualizar permissões');
            return null;
        }
    }, [projectId]);

    // Update member role
    const updateMemberRole = useCallback(async (
        memberId: string,
        role: ProjectRole
    ): Promise<MemberPermissions | null> => {
        if (!projectId) return null;

        try {
            setError(null);
            const updated = await meetingsApi.updateMemberRole(projectId, memberId, role);

            // Update local state
            setMembers(prev => prev.map(m =>
                m.projectMemberId === updated.projectMemberId ? updated : m
            ));

            return updated;
        } catch (err) {
            console.error('Erro ao atualizar role:', err);
            setError('Falha ao atualizar role do membro');
            return null;
        }
    }, [projectId]);

    // Reset member permissions to default
    const resetMemberPermissions = useCallback(async (
        memberId: string
    ): Promise<MemberPermissions | null> => {
        if (!projectId) return null;

        try {
            setError(null);
            const updated = await meetingsApi.resetMemberPermissions(projectId, memberId);

            // Update local state
            setMembers(prev => prev.map(m =>
                m.projectMemberId === updated.projectMemberId ? updated : m
            ));

            return updated;
        } catch (err) {
            console.error('Erro ao resetar permissões:', err);
            setError('Falha ao resetar permissões');
            return null;
        }
    }, [projectId]);

    // Check if person has specific permission
    const checkPermission = useCallback(async (
        personId: string,
        permissionType: PermissionType
    ): Promise<boolean> => {
        if (!projectId) return false;

        try {
            return await meetingsApi.checkPermission(projectId, personId, permissionType);
        } catch (err) {
            console.error('Erro ao verificar permissão:', err);
            return false;
        }
    }, [projectId]);

    // Get role template
    const getRoleTemplate = useCallback(async (
        role: ProjectRole
    ): Promise<Record<PermissionType, boolean>> => {
        if (!projectId) return {} as Record<PermissionType, boolean>;

        try {
            return await meetingsApi.getRolePermissionTemplate(projectId, role);
        } catch (err) {
            console.error('Erro ao buscar template de role:', err);
            return PREDEFINED_ROLE_PERMISSIONS[role] || {};
        }
    }, [projectId]);

    // Helper: Get member by ID
    const getMemberById = useCallback((memberId: string): MemberPermissions | undefined => {
        return members.find(m => String(m.projectMemberId) === memberId);
    }, [members]);

    // Helper: Check if member has permission (from local state)
    const hasPermission = useCallback((memberId: string, permissionType: PermissionType): boolean => {
        const member = members.find(m => String(m.projectMemberId) === memberId);
        if (!member) return false;

        // Check permissionMap first (faster)
        if (member.permissionMap) {
            return member.permissionMap[permissionType] === true;
        }

        // Fallback to permissions array
        return member.permissions.some(p =>
            p.permissionType === permissionType && p.granted
        );
    }, [members]);

    // Load data on mount
    useEffect(() => {
        if (projectId) {
            loadMembers();
            loadAvailableTypes();
        }
    }, [projectId, loadMembers, loadAvailableTypes]);

    return {
        members,
        loading,
        error,
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

// Permission labels in Portuguese
export const PERMISSION_LABELS: Record<PermissionType, string> = {
    // Projeto
    [PermissionType.PROJECT_VIEW]: 'Visualizar Projeto',
    [PermissionType.PROJECT_EDIT]: 'Editar Projeto',
    [PermissionType.PROJECT_DELETE]: 'Excluir Projeto',
    [PermissionType.PROJECT_MANAGE_MEMBERS]: 'Gerenciar Membros',

    // Tarefas
    [PermissionType.TASK_CREATE]: 'Criar Tarefas',
    [PermissionType.TASK_VIEW]: 'Visualizar Tarefas',
    [PermissionType.TASK_EDIT]: 'Editar Tarefas',
    [PermissionType.TASK_DELETE]: 'Excluir Tarefas',
    [PermissionType.TASK_MOVE]: 'Mover Tarefas',
    [PermissionType.TASK_ASSIGN]: 'Atribuir Responsáveis',
    [PermissionType.TASK_COMMENT]: 'Comentar em Tarefas',
    [PermissionType.TASK_ATTACH]: 'Anexar Arquivos',

    // Kanban
    [PermissionType.KANBAN_VIEW]: 'Visualizar Kanban',
    [PermissionType.KANBAN_MANAGE_COLUMNS]: 'Gerenciar Colunas',

    // Reuniões
    [PermissionType.MEETING_CREATE]: 'Criar Reuniões',
    [PermissionType.MEETING_VIEW]: 'Visualizar Reuniões',
    [PermissionType.MEETING_EDIT]: 'Editar Reuniões',
    [PermissionType.MEETING_DELETE]: 'Excluir Reuniões',
    [PermissionType.MEETING_MANAGE_PARTICIPANTS]: 'Gerenciar Participantes',

    // Admin
    [PermissionType.ADMIN_MANAGE_USERS]: 'Gerenciar Usuários',
    [PermissionType.ADMIN_MANAGE_ROLES]: 'Gerenciar Papéis',
    [PermissionType.ADMIN_VIEW_REPORTS]: 'Visualizar Relatórios',
    [PermissionType.ADMIN_SYSTEM_SETTINGS]: 'Configurações do Sistema'
};

// Permission categories for grouping in UI
export const PERMISSION_CATEGORIES: Record<string, PermissionType[]> = {
    'Projeto': [
        PermissionType.PROJECT_VIEW,
        PermissionType.PROJECT_EDIT,
        PermissionType.PROJECT_DELETE,
        PermissionType.PROJECT_MANAGE_MEMBERS
    ],
    'Tarefas': [
        PermissionType.TASK_CREATE,
        PermissionType.TASK_VIEW,
        PermissionType.TASK_EDIT,
        PermissionType.TASK_DELETE,
        PermissionType.TASK_MOVE,
        PermissionType.TASK_ASSIGN,
        PermissionType.TASK_COMMENT,
        PermissionType.TASK_ATTACH
    ],
    'Kanban': [
        PermissionType.KANBAN_VIEW,
        PermissionType.KANBAN_MANAGE_COLUMNS
    ],
    'Reuniões': [
        PermissionType.MEETING_CREATE,
        PermissionType.MEETING_VIEW,
        PermissionType.MEETING_EDIT,
        PermissionType.MEETING_DELETE,
        PermissionType.MEETING_MANAGE_PARTICIPANTS
    ],
    'Administração': [
        PermissionType.ADMIN_MANAGE_USERS,
        PermissionType.ADMIN_MANAGE_ROLES,
        PermissionType.ADMIN_VIEW_REPORTS,
        PermissionType.ADMIN_SYSTEM_SETTINGS
    ]
};

// Role labels
export const ROLE_LABELS: Record<ProjectRole, string> = {
    [ProjectRole.OWNER]: 'Proprietário',
    [ProjectRole.ADMIN]: 'Administrador',
    [ProjectRole.MEMBER_EDITOR]: 'Membro Editor'
};

// Predefined role permissions (fallback if API fails)
export const PREDEFINED_ROLE_PERMISSIONS: Record<ProjectRole, Record<PermissionType, boolean>> = {
    [ProjectRole.OWNER]: Object.values(PermissionType).reduce((acc, type) => {
        acc[type] = true;
        return acc;
    }, {} as Record<PermissionType, boolean>),

    [ProjectRole.ADMIN]: Object.values(PermissionType).reduce((acc, type) => {
        acc[type] = type !== PermissionType.PROJECT_DELETE && type !== PermissionType.ADMIN_SYSTEM_SETTINGS;
        return acc;
    }, {} as Record<PermissionType, boolean>),

    [ProjectRole.MEMBER_EDITOR]: {
        [PermissionType.PROJECT_VIEW]: true,
        [PermissionType.PROJECT_EDIT]: false,
        [PermissionType.PROJECT_DELETE]: false,
        [PermissionType.PROJECT_MANAGE_MEMBERS]: false,
        [PermissionType.TASK_CREATE]: true,
        [PermissionType.TASK_VIEW]: true,
        [PermissionType.TASK_EDIT]: true,
        [PermissionType.TASK_DELETE]: false,
        [PermissionType.TASK_MOVE]: true,
        [PermissionType.TASK_ASSIGN]: false,
        [PermissionType.TASK_COMMENT]: true,
        [PermissionType.TASK_ATTACH]: true,
        [PermissionType.KANBAN_VIEW]: true,
        [PermissionType.KANBAN_MANAGE_COLUMNS]: false,
        [PermissionType.MEETING_CREATE]: true,
        [PermissionType.MEETING_VIEW]: true,
        [PermissionType.MEETING_EDIT]: false,
        [PermissionType.MEETING_DELETE]: false,
        [PermissionType.MEETING_MANAGE_PARTICIPANTS]: false,
        [PermissionType.ADMIN_MANAGE_USERS]: false,
        [PermissionType.ADMIN_MANAGE_ROLES]: false,
        [PermissionType.ADMIN_VIEW_REPORTS]: false,
        [PermissionType.ADMIN_SYSTEM_SETTINGS]: false
    }
};

export default useProjectPermissions;
