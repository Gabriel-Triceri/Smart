import React from 'react';

interface PermissionSkeletonProps {
    count?: number;
}

export const PermissionSkeleton: React.FC<PermissionSkeletonProps> = ({ count = 6 }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: count }).map((_, index) => (
                <div key={index} className="bg-white dark:bg-mono-800 rounded-lg border border-mono-200 dark:border-mono-700 p-6 animate-pulse">
                    {/* Header */}
                    <div className="flex items-start gap-4 mb-4">
                        <div className="p-2.5 bg-mono-200 dark:bg-mono-700 rounded-xl w-12 h-12"></div>
                        <div className="flex-1 min-w-0">
                            <div className="h-5 bg-mono-200 dark:bg-mono-700 rounded w-3/4 mb-2"></div>
                            <div className="h-4 bg-mono-200 dark:bg-mono-700 rounded w-1/2"></div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="px-6 py-4 pt-0 border-t border-mono-100 dark:border-mono-700">
                        <div className="flex gap-2">
                            <div className="flex-1 h-9 bg-mono-100 dark:bg-mono-700 rounded-lg"></div>
                            <div className="flex-1 h-9 bg-mono-100 dark:bg-mono-700 rounded-lg"></div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

interface RoleSkeletonProps {
    count?: number;
}

export const RoleSkeleton: React.FC<RoleSkeletonProps> = ({ count = 6 }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: count }).map((_, index) => (
                <div key={index} className="bg-white dark:bg-mono-800 rounded-lg border border-mono-200 dark:border-mono-700 p-6 animate-pulse">
                    {/* Header */}
                    <div className="flex items-start gap-4 mb-4">
                        <div className="p-2.5 bg-mono-200 dark:bg-mono-700 rounded-xl w-12 h-12"></div>
                        <div className="flex-1 min-w-0">
                            <div className="h-5 bg-mono-200 dark:bg-mono-700 rounded w-3/4 mb-2"></div>
                            <div className="h-4 bg-mono-200 dark:bg-mono-700 rounded w-1/2"></div>
                        </div>
                    </div>

                    {/* Permissions */}
                    <div className="flex flex-wrap gap-2 mb-4">
                        <div className="h-6 bg-mono-100 dark:bg-mono-700 rounded-lg px-2.5 w-20"></div>
                        <div className="h-6 bg-mono-100 dark:bg-mono-700 rounded-lg px-2.5 w-24"></div>
                        <div className="h-6 bg-mono-100 dark:bg-mono-700 rounded-lg px-2.5 w-16"></div>
                    </div>

                    {/* Actions */}
                    <div className="px-6 py-4 pt-0 border-t border-mono-100 dark:border-mono-700">
                        <div className="flex gap-2">
                            <div className="flex-1 h-9 bg-mono-100 dark:bg-mono-700 rounded-lg"></div>
                            <div className="flex-1 h-9 bg-mono-100 dark:bg-mono-700 rounded-lg"></div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

interface UserTableSkeletonProps {
    rows?: number;
}

export const UserTableSkeleton: React.FC<UserTableSkeletonProps> = ({ rows = 5 }) => {
    return (
        <div className="bg-white dark:bg-mono-800 rounded-lg border border-mono-200 dark:border-mono-700 overflow-hidden shadow-sm animate-pulse">
            <table className="w-full">
                <thead className="bg-mono-50 dark:bg-mono-700/30">
                    <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-mono-900 dark:text-mono-100 border-b border-mono-200 dark:border-mono-600">
                            Usuário
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-mono-900 dark:text-mono-100 border-b border-mono-200 dark:border-mono-600">
                            Email
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-mono-900 dark:text-mono-100 border-b border-mono-200 dark:border-mono-600">
                            Roles
                        </th>
                        <th className="px-6 py-4 text-right text-sm font-semibold text-mono-900 dark:text-mono-100 border-b border-mono-200 dark:border-mono-600">
                            Ações
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-mono-200 dark:divide-mono-700">
                    {Array.from({ length: rows }).map((_, index) => (
                        <tr key={index}>
                            <td className="px-6 py-4">
                                <div className="h-4 bg-mono-200 dark:bg-mono-700 rounded w-3/4"></div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="h-4 bg-mono-200 dark:bg-mono-700 rounded w-1/2"></div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex flex-wrap gap-2">
                                    <div className="h-6 bg-mono-100 dark:bg-mono-700 rounded-lg px-2.5 w-16"></div>
                                    <div className="h-6 bg-mono-100 dark:bg-mono-700 rounded-lg px-2.5 w-20"></div>
                                </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                                <div className="h-8 bg-mono-100 dark:bg-mono-700 rounded-lg px-4 w-32 ml-auto"></div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

interface MatrixSkeletonProps {
    roles?: number;
    permissions?: number;
}

export const MatrixSkeleton: React.FC<MatrixSkeletonProps> = ({
    roles = 3,
    permissions = 4
}) => {
    return (
        <div className="bg-white dark:bg-mono-800 rounded-lg border border-mono-200 dark:border-mono-700 overflow-hidden shadow-sm animate-pulse">
            <div className="p-6 border-b border-mono-200 dark:border-mono-700 bg-mono-50/50 dark:bg-mono-800/50">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-mono-200 dark:bg-mono-700 rounded-lg w-10 h-10"></div>
                    <div>
                        <div className="h-6 bg-mono-200 dark:bg-mono-700 rounded w-48 mb-1"></div>
                        <div className="h-4 bg-mono-200 dark:bg-mono-700 rounded w-64"></div>
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-mono-50 dark:bg-mono-700/30">
                        <tr>
                            <th className="sticky left-0 z-10 bg-mono-50 dark:bg-mono-700/30 px-6 py-4 text-left text-sm font-semibold text-mono-900 dark:text-mono-100 border-r border-mono-200 dark:border-mono-600">
                                Role
                            </th>
                            {Array.from({ length: permissions }).map((_, index) => (
                                <th
                                    key={index}
                                    className="px-3 py-4 text-center text-xs font-medium text-mono-700 dark:text-mono-300 min-w-[100px] border-r border-mono-100 dark:border-mono-700 last:border-r-0"
                                >
                                    <div className="transform -rotate-45 origin-left whitespace-nowrap">
                                        <div className="h-3 bg-mono-200 dark:bg-mono-700 rounded w-16 mx-auto"></div>
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-mono-200 dark:divide-mono-700">
                        {Array.from({ length: roles }).map((_, roleIndex) => (
                            <tr key={roleIndex}>
                                <td className="sticky left-0 z-10 bg-white dark:bg-mono-800 px-6 py-4 font-medium text-mono-900 dark:text-mono-100 border-r border-mono-200 dark:border-mono-700">
                                    <div className="h-4 bg-mono-200 dark:bg-mono-700 rounded w-24"></div>
                                </td>
                                {Array.from({ length: permissions }).map((_, permIndex) => (
                                    <td key={permIndex} className="px-3 py-4 text-center border-r border-mono-100 dark:border-mono-700 last:border-r-0">
                                        <div className="w-8 h-8 bg-mono-100 dark:bg-mono-700 rounded-lg mx-auto"></div>
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};