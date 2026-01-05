import React, { ReactNode, useMemo, useState, useEffect } from 'react';
import { PermissionType } from '../../types/meetings';
import { authService } from '../../services/authService';
import { projectService } from '../../services/projectService';


interface CanDoProps {
    /**
     * Permissão necessária para exibir o conteúdo
     */
    permission: PermissionType;

    /**
     * ID do projeto (obrigatório para permissões de projeto)
     */
    projectId?: string;

    /**
     * Conteúdo a ser exibido se o usuário tiver permissão
     */
    children: ReactNode;

    /**
     * Conteúdo alternativo se o usuário NÃO tiver permissão
     */
    fallback?: ReactNode;

    /**
     * Se true, inverte a lógica (exibe se NÃO tiver permissão)
     */
    negate?: boolean;

    /**
     * Se true, verifica permissão global do usuário ao invés de projeto
     */
    global?: boolean;
}

/**
 * Componente para renderização condicional baseada em permissões
 *
 * @example
 * // Permissão de projeto
 * <CanDo permission={PermissionType.TASK_CREATE} projectId={projectId}>
 *   <button>Criar Tarefa</button>
 * </CanDo>
 *
 * @example
 * // Permissão global
 * <CanDo permission={PermissionType.ADMIN} global>
 *   <AdminPanel />
 * </CanDo>
 *
 * @example
 * // Com fallback
 * <CanDo
 *   permission={PermissionType.TASK_DELETE}
 *   projectId={projectId}
 *   fallback={<span>Sem permissão</span>}
 * >
 *   <button>Excluir</button>
 * </CanDo>
 */
export const CanDo: React.FC<CanDoProps> = ({
    permission,
    projectId,
    children,
    fallback = null,
    negate = false,
    global = false
}) => {
    const [hasProjectPermission, setHasProjectPermission] = useState<boolean | null>(null);

    // Para permissões de projeto, verificar via API
    useEffect(() => {
        if (!global && projectId) {
            // Verificar permissão via API (sem personId, usa usuário atual)
            projectService.checkPermission(projectId, undefined, permission)
                .then(result => setHasProjectPermission(result))
                .catch(() => setHasProjectPermission(false));
        }
    }, [global, projectId, permission]);

    const hasPermission = useMemo(() => {
        if (global) {
            return authService.hasPermission(permission);
        }

        if (!projectId) {
            // Sem projectId, não pode verificar permissão de projeto
            // Retorna false por segurança (deny by default)
            return false;
        }

        // Usar estado da verificação de projeto
        return hasProjectPermission === true;
    }, [global, projectId, permission, hasProjectPermission]);

    // Aplica negação se necessário
    const shouldRender = negate ? !hasPermission : hasPermission;

    // Enquanto carrega permissão de projeto, não renderiza (evita flash)
    if (!global && projectId && hasProjectPermission === null) {
        return null;
    }

    return shouldRender ? <>{children}</> : <>{fallback}</>;
};

/**
 * Hook para verificar permissão programaticamente
 */
export const useCanDo = (permission: PermissionType, projectId?: string, global = false): boolean => {
    const [hasProjectPermission, setHasProjectPermission] = useState<boolean>(false);


    useEffect(() => {
        if (!global && projectId) {
            projectService.checkPermission(projectId, undefined, permission)
                .then(result => {
                    setHasProjectPermission(result);
                })
                .catch(() => {
                    setHasProjectPermission(false);
                });
        }
    }, [global, projectId, permission]);

    return useMemo(() => {
        if (global) {
            return authService.hasPermission(permission);
        }

        if (!projectId) {
            // Sem projectId, retorna false por segurança (deny by default)
            return false;
        }

        return hasProjectPermission;
    }, [global, permission, projectId, hasProjectPermission]);
};

/**
 * Hook para verificar múltiplas permissões
 */
export const useCanDoAny = (permissions: PermissionType[], projectId?: string, global = false): boolean => {
    const results = permissions.map(p => useCanDo(p, projectId, global));
    return results.some(r => r);
};

/**
 * Hook para verificar se tem TODAS as permissões
 */
export const useCanDoAll = (permissions: PermissionType[], projectId?: string, global = false): boolean => {
    const results = permissions.map(p => useCanDo(p, projectId, global));
    return results.every(r => r);
};

export default CanDo;
