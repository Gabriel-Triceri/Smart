import { Navigate, Outlet } from 'react-router-dom';
import React, { ReactNode } from 'react';
import { authService } from '../../services/authService';

/**
 * Componente para proteger rotas que requerem autenticacao (usado com React Router)
 */
export default function ProtectedRoute() {
    const token = localStorage.getItem('authToken');

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
}

interface ProtectedContentProps {
    /**
     * Conteudo a ser exibido se o usuario tiver permissao
     */
    children: ReactNode;

    /**
     * Roles permitidas para acessar este conteudo
     * Se vazio, qualquer usuario autenticado pode acessar
     */
    allowedRoles?: string[];

    /**
     * Permissoes permitidas para acessar este conteudo
     */
    allowedPermissions?: string[];

    /**
     * Conteudo alternativo se o usuario NAO tiver permissao
     */
    fallback?: ReactNode;

    /**
     * Se true, exige TODAS as roles/permissions. Se false, exige QUALQUER uma
     */
    requireAll?: boolean;
}

/**
 * Componente para proteger conteudo baseado em roles e permissoes
 *
 * @example
 * // Apenas ADMIN pode ver
 * <ProtectedContent allowedRoles={['ADMIN']}>
 *   <AdminPanel />
 * </ProtectedContent>
 *
 * @example
 * // ADMIN ou ORGANIZADOR podem ver
 * <ProtectedContent allowedRoles={['ADMIN', 'ORGANIZADOR']}>
 *   <ManagerPanel />
 * </ProtectedContent>
 */
export const ProtectedContent: React.FC<ProtectedContentProps> = ({
    children,
    allowedRoles = [],
    allowedPermissions = [],
    fallback = null,
    requireAll = false
}) => {
    // Verificar se usuario esta autenticado
    if (!authService.isAuthenticated()) {
        return <>{fallback}</>;
    }

    const userRoles = authService.getRoles();
    const userPermissions = authService.getPermissions();

    // Se nao ha restricoes, permite acesso
    if (allowedRoles.length === 0 && allowedPermissions.length === 0) {
        return <>{children}</>;
    }

    // Verificar roles
    const hasRequiredRole = allowedRoles.length === 0 ? true : (
        requireAll
            ? allowedRoles.every(role => userRoles.includes(role))
            : allowedRoles.some(role => userRoles.includes(role))
    );

    // Verificar permissions
    const hasRequiredPermission = allowedPermissions.length === 0 ? true : (
        requireAll
            ? allowedPermissions.every(perm => userPermissions.includes(perm))
            : allowedPermissions.some(perm => userPermissions.includes(perm))
    );

    // Logica de acesso
    if (requireAll) {
        // Precisa ter TODAS as roles E permissions
        if (hasRequiredRole && hasRequiredPermission) {
            return <>{children}</>;
        }
    } else {
        // Precisa ter QUALQUER role OU permission
        if (hasRequiredRole || hasRequiredPermission) {
            return <>{children}</>;
        }
    }

    return <>{fallback}</>;
};

/**
 * Hook para verificar se o usuario tem acesso baseado em roles/permissions
 */
export const useProtectedAccess = (
    allowedRoles: string[] = [],
    allowedPermissions: string[] = [],
    requireAll = false
): boolean => {
    if (!authService.isAuthenticated()) {
        return false;
    }

    const userRoles = authService.getRoles();
    const userPermissions = authService.getPermissions();

    // Se nao ha restricoes, permite acesso
    if (allowedRoles.length === 0 && allowedPermissions.length === 0) {
        return true;
    }

    const hasRequiredRole = allowedRoles.length === 0 ? false : (
        requireAll
            ? allowedRoles.every(role => userRoles.includes(role))
            : allowedRoles.some(role => userRoles.includes(role))
    );

    const hasRequiredPermission = allowedPermissions.length === 0 ? false : (
        requireAll
            ? allowedPermissions.every(perm => userPermissions.includes(perm))
            : allowedPermissions.some(perm => userPermissions.includes(perm))
    );

    if (requireAll) {
        return hasRequiredRole && hasRequiredPermission;
    }

    return hasRequiredRole || hasRequiredPermission;
};

/**
 * Hook para verificar se o usuario e admin
 */
export const useIsAdmin = (): boolean => {
    return authService.hasRole('ADMIN');
};
