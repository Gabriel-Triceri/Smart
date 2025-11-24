import React, { useState } from 'react';

interface AvatarProps {
    src?: string;
    name: string;
    className?: string;
    title?: string;
}

const getInitials = (name: string) => {
    if (!name) return '';
    return name
        .split(' ')
        .map(n => n.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2);
};

const getAvatarStyles = (name: string) => {
    if (!name) return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';

    const colors = [
        'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300',
        'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300',
        'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300',
        'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300',
        'bg-teal-100 text-teal-700 dark:bg-teal-500/20 dark:text-teal-300',
        'bg-cyan-100 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-300',
        'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300',
        'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300',
        'bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300',
        'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300',
        'bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-500/20 dark:text-fuchsia-300',
        'bg-pink-100 text-pink-700 dark:bg-pink-500/20 dark:text-pink-300',
        'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300',
    ];

    const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
};

export const Avatar: React.FC<AvatarProps> = ({ src, name, className = 'w-8 h-8', title }) => {
    const [hasError, setHasError] = useState(false);
    const showImage = src && !hasError;

    return (
        <div
            title={title || name}
            className={`
                relative flex items-center justify-center rounded-full shrink-0 overflow-hidden select-none
                text-xs font-bold uppercase ring-1 ring-white dark:ring-slate-900
                ${!showImage ? getAvatarStyles(name) : 'bg-slate-200 dark:bg-slate-700'}
                ${className}
            `}
        >
            {showImage ? (
                <img
                    src={src}
                    alt={name}
                    className="w-full h-full object-cover"
                    onError={() => setHasError(true)}
                />
            ) : (
                <span>{getInitials(name)}</span>
            )}
        </div>
    );
};