import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, ChevronDown, Shield } from 'lucide-react';
import { authService } from '../../services/authService';

interface UserMenuProps {
    className?: string;
}

export function UserMenu({ className = '' }: UserMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    const userInfo = authService.getUserInfo();
    const userInitials = authService.getUserInitials();
    const isAdmin = authService.hasRole('ADMIN');

    // Fechar menu ao clicar fora
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    // Determinar o que exibir como nome
    const displayName = userInfo.name || userInfo.email || 'Usuário';
    const displayRole = userInfo.roles.length > 0 ? userInfo.roles[0] : 'Usuário';

    return (
        <div ref={menuRef} className={`relative ${className}`}>
            {/* Botão do menu */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-mono-100 dark:hover:bg-mono-700 transition-colors"
            >
                {/* Avatar */}
                <div className="w-8 h-8 rounded-full bg-accent-500 dark:bg-accent-600 flex items-center justify-center text-white text-sm font-semibold shadow-sm">
                    {userInitials}
                </div>

                {/* Info do usuário (escondido em mobile) */}
                <div className="hidden sm:flex flex-col items-start">
                    <span className="text-sm font-medium text-mono-900 dark:text-mono-100 max-w-[120px] truncate">
                        {displayName}
                    </span>
                    <span className="text-xs text-mono-500 dark:text-mono-400 flex items-center gap-1">
                        {isAdmin && <Shield className="w-3 h-3" />}
                        {displayRole}
                    </span>
                </div>

                <ChevronDown className={`w-4 h-4 text-mono-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown menu */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-mono-800 rounded-xl shadow-lg border border-mono-200 dark:border-mono-700 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* Header do menu */}
                    <div className="px-4 py-3 border-b border-mono-100 dark:border-mono-700">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-accent-500 dark:bg-accent-600 flex items-center justify-center text-white font-semibold">
                                {userInitials}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-mono-900 dark:text-mono-100 truncate">
                                    {displayName}
                                </p>
                                {userInfo.email && (
                                    <p className="text-xs text-mono-500 dark:text-mono-400 truncate">
                                        {userInfo.email}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Badges de roles */}
                        {userInfo.roles.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                                {userInfo.roles.map((role) => (
                                    <span
                                        key={role}
                                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${role === 'ADMIN'
                                                ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                                                : role === 'ORGANIZADOR'
                                                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                                                    : 'bg-mono-100 text-mono-600 dark:bg-mono-700 dark:text-mono-300'
                                            }`}
                                    >
                                        {role === 'ADMIN' && <Shield className="w-3 h-3" />}
                                        {role}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Opções do menu */}
                    <div className="py-1">
                        <button
                            onClick={() => {
                                setIsOpen(false);
                                // Aqui poderia navegar para página de perfil
                            }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-mono-700 dark:text-mono-300 hover:bg-mono-50 dark:hover:bg-mono-700 transition-colors"
                        >
                            <User className="w-4 h-4" />
                            Meu Perfil
                        </button>
                    </div>

                    {/* Separador */}
                    <div className="border-t border-mono-100 dark:border-mono-700 my-1"></div>

                    {/* Logout */}
                    <div className="py-1">
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            Sair
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default UserMenu;
