import React from 'react';

interface PermissionSkeletonProps {
    count?: number;
}

export const PermissionSkeleton: React.FC<PermissionSkeletonProps> = ({ count = 6 }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: count }).map((_, index) => (
                <div key={index} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 animate-pulse">
                    <div className="flex items-start gap-4 mb-4">
                        <div className="bg-slate-200 dark:bg-slate-700 rounded-lg w-10 h-10 shrink-0"></div>
                        <div className="flex-1 space-y-2">
                            <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
                        </div>
                    </div>
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-700 flex gap-3">
                        <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded-lg flex-1"></div>
                        <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded-lg flex-1"></div>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: count }).map((_, index) => (
                <div key={index} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 animate-pulse">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="bg-slate-200 dark:bg-slate-700 rounded-full w-12 h-12"></div>
                        <div className="flex-1 space-y-2">
                            <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
                            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div>
                        </div>
                    </div>
                    <div className="space-y-2 mb-6">
                        <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
                        <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded w-5/6"></div>
                    </div>
                    <div className="flex gap-2">
                        <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded-lg w-20"></div>
                        <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded-lg w-20"></div>
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
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm animate-pulse">
            <div className="h-12 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 w-full"></div>
            <div className="divide-y divide-slate-100 dark:divide-slate-700">
                {Array.from({ length: rows }).map((_, index) => (
                    <div key={index} className="p-4 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700"></div>
                        <div className="flex-1 space-y-2">
                            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
                            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div>
                        </div>
                        <div className="w-24 h-8 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
                    </div>
                ))}
            </div>
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
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm animate-pulse flex flex-col h-full">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                <div className="flex gap-4">
                    <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-32"></div>
                    <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-32"></div>
                </div>
            </div>
            <div className="flex-1 p-6 space-y-6">
                {Array.from({ length: permissions }).map((_, i) => (
                    <div key={i} className="flex gap-4">
                        <div className="w-1/4 h-6 bg-slate-200 dark:bg-slate-700 rounded"></div>
                        <div className="flex-1 flex justify-between gap-4">
                            {Array.from({ length: roles }).map((_, j) => (
                                <div key={j} className="w-12 h-6 bg-slate-200 dark:bg-slate-700 rounded"></div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};