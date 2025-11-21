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

const getAvatarColor = (name: string) => {
    if (!name) return 'bg-gray-500';
    const colors = [
        'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500',
        'bg-indigo-500', 'bg-yellow-500', 'bg-red-500', 'bg-teal-500'
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
};

export const Avatar: React.FC<AvatarProps> = ({ src, name, className = 'w-8 h-8', title }) => {
    const [hasError, setHasError] = useState(false);

    const showImage = src && !hasError;

    return (
        <div
            title={title || name}
            className={`rounded-full flex items-center justify-center text-white text-sm font-medium ${!showImage ? getAvatarColor(name) : ''} ${className}`}
        >
            {showImage ? (
                <img src={src} alt={name} className="w-full h-full rounded-full object-cover" onError={() => setHasError(true)} />
            ) : (
                getInitials(name)
            )}
        </div>
    );
};