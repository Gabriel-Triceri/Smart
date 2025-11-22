import React from 'react';
import { Check, Grid3x3 } from 'lucide-react';
import { useRoles } from '../../hooks/useRoles';
import { usePermissions } from '../../hooks/usePermissions';
import { MatrixSkeleton } from './PermissionSkeleton';

export const PermissionMatrix: React.FC = () => {
    const { roles, isLoading: rolesLoading, addPermissionToRole, removePermissionFromRole } = useRoles();
    const { permissions, isLoading: permissionsLoading } = usePermissions();

    const isLoading = rolesLoading || permissionsLoading;

    const hasPermission = (rolePermissions: string[] = [], permissionName: string) => {
        return rolePermissions.includes(permissionName);
    };

    const abbreviatePermission = (name: string) => {
        // usado apenas para exibir rótulo compacto na célula
        if (name.length > 14) return name.substring(0, 11) + '…';
        return name;
    };

    const handleToggle = async (roleId: number, permissionName: string, currentlyHas: boolean) => {
        const permission = permissions.find(p => p.nome === permissionName);
        if (!permission) return;
        if (currentlyHas) {
            await removePermissionFromRole(roleId, permission.id);
        } else {
            await addPermissionToRole(roleId, permission.id);
        }
    };

    if (isLoading) {
        return <MatrixSkeleton roles={3} permissions={4} />;
    }

    if (!roles.length || !permissions.length) {
        return (
            <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-accent-100 to-accent-50 dark:from-accent-900/20 dark:to-accent-900/10 rounded-2xl mb-6 shadow">
                    <Grid3x3 className="w-10 h-10 text-accent-600 dark:text-accent-400" />
                </div>
                <h3 className="text-xl font-semibold text-mono-900 dark:text-mono-100 mb-2">Dados Insuficientes</h3>
                <p className="text-mono-600 dark:text-mono-400 mb-8 max-w-lg mx-auto">
                    Crie roles e permissões no sistema para visualizar a matriz de permissões e gerenciar os acessos de forma visual.
                </p>
            </div>
        );
    }

    // layout grid: primeira coluna fixa (rolesWidth), demais colunas: min 48px e crescente
    const rolesWidth = 220;
    const permissionMin = 48; // reduzido para prevenir overflow lateral

    return (
        <div className="bg-white dark:bg-mono-900 rounded-2xl border border-mono-200 dark:border-mono-700 overflow-hidden shadow-sm">
            {/* Header */}
            <div className="p-5 sm:p-6 border-b border-mono-200 dark:border-mono-700 bg-mono-50/60 dark:bg-mono-900/30">
                <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-accent-100 dark:bg-accent-900/25">
                        <Grid3x3 className="w-6 h-6 text-accent-600 dark:text-accent-300" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-lg sm:text-xl font-semibold text-mono-900 dark:text-mono-100">Matriz de Permissões</h3>
                        <p className="text-sm text-mono-600 dark:text-mono-400">Visualize e gerencie todas as permissões com uma interface clara e responsiva.</p>
                    </div>
                </div>
            </div>

            {/* Grid principal: scroll vertical apenas */}
            <div className="overflow-y-auto max-h-[70vh]">
                <div
                    // wrapper responsivo com grid
                    className="w-full"
                    style={{
                        display: 'grid',
                        gridTemplateColumns: ` ${rolesWidth}px repeat(${permissions.length}, minmax(${permissionMin}px, 1fr))`,
                        // gap e alinhamentos visuais
                        alignItems: 'center'
                    }}
                >
                    {/* Cabeçalho fixo (linha superior) */}
                    <div
                        className="sticky left-0 top-0 z-30 bg-white dark:bg-mono-900 px-4 py-3 border-b border-r border-mono-200 dark:border-mono-700 flex items-center"
                        style={{ height: 64 }}
                    >
                        <div className="text-sm font-semibold">Role</div>
                    </div>

                    {permissions.map((perm) => (
                        <div
                            key={perm.id}
                            className="px-2 py-3 border-b text-center text-xs font-semibold text-mono-800 dark:text-mono-100 bg-mono-50 dark:bg-mono-800/40 truncate"
                            title={perm.nome}
                            style={{ height: 64 }}
                        >
                            {/* Em telas pequenas o texto gira levemente para caber melhor.
                                Usamos title para tooltip nativo. */}
                            <span className="inline-block transform -rotate-0 sm:rotate-0 md:-rotate-0 lg:rotate-0">
                                {abbreviatePermission(perm.nome)}
                            </span>
                        </div>
                    ))}

                    {/* Linhas: para cada permission, renderizamos a célula da coluna "permission name" + a sequência de roles */}
                    {permissions.map((perm) => (
                        // cada perm já tem seu header; aqui apenas células vazias para manter o grid alinhado
                        <React.Fragment key={`hdr-placeholder-${perm.id}`} />
                    ))}

                    {/* Agora percorremos roles para construir cada linha (role + seus permission toggles).
                       Para manter o grid simples, renderizamos role cell seguido pelas permissões (cells). */}
                    {roles.map((role) => (
                        <React.Fragment key={role.id}>
                            {/* Role cell */}
                            <div
                                className="sticky left-0 z-20 bg-white dark:bg-mono-900 px-4 py-4 border-r border-b border-mono-200 dark:border-mono-700 flex items-center gap-3"
                                style={{ minHeight: 56 }}
                            >
                                <div className="flex-shrink-0 w-8 h-8 rounded-md bg-mono-100 dark:bg-mono-800 flex items-center justify-center text-sm font-semibold text-mono-700 dark:text-mono-200">
                                    {role.nome?.substring(0, 2).toUpperCase()}
                                </div>
                                <div className="truncate text-sm font-medium">{role.nome}</div>
                            </div>

                            {/* Permission toggles for this role */}
                            {permissions.map((perm) => {
                                const has = hasPermission(role.permissions, perm.nome);
                                return (
                                    <div
                                        key={`${role.id}-${perm.id}`}
                                        className="px-2 py-4 border-b border-mono-200 dark:border-mono-700 flex items-center justify-center"
                                        style={{ minHeight: 56 }}
                                    >
                                        <button
                                            onClick={() => handleToggle(role.id, perm.nome, has)}
                                            aria-pressed={has}
                                            aria-label={has ? `Remover ${perm.nome} de ${role.nome}` : `Adicionar ${perm.nome} a ${role.nome}`}
                                            className={`inline-flex items-center justify-center w-9 h-9 rounded-md transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent-300
                                                ${has ? 'bg-accent-600 text-white shadow' : 'border border-mono-300 dark:border-mono-600 bg-transparent hover:bg-mono-50 dark:hover:bg-mono-800/40'}`}
                                        >
                                            {has ? <Check className="w-4 h-4" /> : <div className="w-3 h-3 rounded-sm bg-mono-300 dark:bg-mono-600" />}
                                        </button>
                                    </div>
                                );
                            })}
                        </React.Fragment>
                    ))}
                </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-mono-200 dark:border-mono-700 bg-mono-50/40 dark:bg-mono-900/20 text-xs text-mono-500">
                Dica: clique nos botões para alternar permissões. Alterações são aplicadas imediatamente.
            </div>
        </div>
    );
};

export default PermissionMatrix;
