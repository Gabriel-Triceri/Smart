import React, { useState, useEffect, useMemo, useCallback } from 'react';
import ErrorBoundary from './components/common/ErrorBoundary';
import { HomeDashboard } from './pages/HomeDashboard';
import { MeetingManager } from './components/meetings/MeetingManager';
import { SalaManager } from './components/salas/SalaManager';
import { TaskManager } from './components/tasks/TaskManager';
import { PermissionManager } from './components/permissions/PermissionManager';
import { ProjectManager } from './components/projects/ProjectManager';
import LoadingSkeleton from './components/common/LoadingSkeleton';
import ThemeToggle from './components/common/ThemeToggle';
import UserMenu from './components/common/UserMenu';
import { BarChart3, Calendar, Building, CheckSquare, Shield, Menu, X, Briefcase } from 'lucide-react';
import { inicializarDados } from './services/seedData';
import { authService } from './services/authService';
import { usePermissionWebSocket } from './hooks/usePermissionWebSocket';

type ActiveView = 'dashboard' | 'meetings' | 'salas' | 'tarefas' | 'permissions' | 'projects';

interface NavigationItem {
    id: ActiveView;
    label: string;
    description: string;
    icon: React.FC<{ className?: string }>;
    /** Roles permitidas para ver este item de navegacao */
    allowedRoles?: string[];
    /** Permissoes permitidas para ver este item de navegacao */
    allowedPermissions?: string[];
}

interface NavigationProps {
    activeView: ActiveView;
    setActiveView: (view: ActiveView) => void;
    items: NavigationItem[];
    showMobile?: boolean;
    setShowMobile?: (state: boolean) => void;
}


function Navigation({ activeView, setActiveView, items, showMobile = false, setShowMobile }: NavigationProps) {
    const userRoles = authService.getRoles();

    // Filtrar itens baseado nas roles e permissoes do usuario
    const visibleItems = items.filter(item => {
        const userPermissions = authService.getPermissions();

        // Se tiver roles especificas, verifica
        const roleMatch = !item.allowedRoles ||
            item.allowedRoles.length === 0 ||
            item.allowedRoles.some(role => userRoles.includes(role));

        // Se tiver permissoes especificas, verifica
        const permissionMatch = !item.allowedPermissions ||
            item.allowedPermissions.length === 0 ||
            item.allowedPermissions.some(perm => userPermissions.includes(perm));

        return roleMatch && permissionMatch;
    });

    return (
        <nav className={`${showMobile ? 'space-y-2 py-4 border-t border-mono-200 dark:border-mono-700 md:hidden' : 'hidden md:flex items-center space-x-1'}`}>
            {visibleItems.map(item => {

                const Icon = item.icon;
                const isActive = activeView === item.id;

                const buttonClasses = isActive
                    ? 'bg-mono-100 dark:bg-mono-800 text-mono-900 dark:text-mono-100'
                    : 'text-mono-600 dark:text-mono-400 hover:text-mono-900 dark:hover:text-mono-100 hover:bg-mono-50 dark:hover:bg-mono-700';

                return (
                    <button
                        key={item.id}
                        onClick={() => {
                            setActiveView(item.id);
                            if (showMobile && setShowMobile) setShowMobile(false);
                            localStorage.setItem('smartmeeting-active-view', item.id);
                        }}
                        className={`flex ${showMobile ? 'w-full text-left gap-3 px-4 py-3' : 'items-center gap-2 px-4 py-2'} rounded-lg transition-colors font-medium text-sm ${buttonClasses}`}
                        aria-label={item.label}
                    >
                        <Icon className={`${showMobile ? 'w-5 h-5' : 'w-4 h-4'}`} />
                        <div>
                            <div className="font-medium">{item.label}</div>
                            {showMobile && <div className="text-xs opacity-75">{item.description}</div>}
                        </div>
                    </button>
                );
            })}
        </nav>
    );
}

function App() {
    const [mounted, setMounted] = useState(false);
    const [activeView, setActiveView] = useState<ActiveView>('meetings');
    const [showNavigation, setShowNavigation] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    // Callback quando permissoes sao atualizadas via WebSocket
    const handlePermissionsUpdated = useCallback((_projectId: number) => {
        // Incrementa a key para forcar re-render dos componentes filhos
        setRefreshKey(prev => prev + 1);
    }, []);

    // Conectar ao WebSocket de permissoes
    usePermissionWebSocket({
        onPermissionsUpdated: handlePermissionsUpdated,
    });

    useEffect(() => {
        setMounted(true);
        const savedView = localStorage.getItem('smartmeeting-active-view') as ActiveView;
        if (savedView && ['dashboard', 'meetings', 'salas', 'tarefas', 'permissions', 'projects'].includes(savedView)) {
            setActiveView(savedView);
        }

        // Inicializar dados após login
        inicializarDados().catch(err => {
            console.error('Erro ao inicializar dados:', err);
        });
    }, []);

    const navigationItems = useMemo<NavigationItem[]>(() => [
        {
            id: 'dashboard',
            label: 'Dashboard',
            description: 'Metricas e indicadores',
            icon: BarChart3,
            allowedPermissions: ['ADMIN_VIEW_REPORTS']
        },
        {
            id: 'meetings',
            label: 'Reunioes',
            description: 'Calendario e organizacao',
            icon: Calendar,
            allowedPermissions: ['MEETING_VIEW']
        },
        {
            id: 'salas',
            label: 'Salas',
            description: 'Salas e recursos',
            icon: Building,
            allowedPermissions: ['ADMIN_SYSTEM_SETTINGS']
        },
        {
            id: 'tarefas',
            label: 'Tarefas',
            description: 'Kanban e produtividade',
            icon: CheckSquare,
            allowedPermissions: ['TASK_VIEW', 'KANBAN_VIEW']
        },
        {
            id: 'projects',
            label: 'Projetos',
            description: 'Gerencie seus projetos',
            icon: Briefcase,
            allowedPermissions: ['PROJECT_VIEW']
        },
        // Gestao de Permissoes - Requer permissao ADMIN_MANAGE_ROLES
        {
            id: 'permissions',
            label: 'Permissoes',
            description: 'Permissoes, roles e usuarios',
            icon: Shield,
            allowedPermissions: ['ADMIN_MANAGE_ROLES']
        }
    ], []);

    // Os componentes usam refreshKey para re-renderizar quando permissoes mudam
    const viewComponents: Record<ActiveView, React.ReactNode> = {
        dashboard: <HomeDashboard key={`dashboard-${refreshKey}`} />,
        meetings: <MeetingManager key={`meetings-${refreshKey}`} />,
        salas: <SalaManager key={`salas-${refreshKey}`} />,
        tarefas: <TaskManager key={`tarefas-${refreshKey}`} />,
        permissions: <PermissionManager key={`permissions-${refreshKey}`} />,
        projects: <ProjectManager key={`projects-${refreshKey}`} />
    };

    if (!mounted) return <LoadingSkeleton />;

    return (
        <ErrorBoundary>
            {/* Removido: <ThemeProvider> */}
            <div className="min-h-screen bg-mono-50 dark:bg-mono-900 transition-colors duration-300">
                {/* Cabeçalho */}
                <header className="bg-white dark:bg-mono-800 shadow-sm border-b border-mono-200 dark:border-mono-700 sticky top-0 z-30">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between h-16">
                            {/* Logo e título */}
                            <div className="flex items-center gap-4">
                                <Calendar className="w-8 h-8 text-accent-500 dark:text-accent-400" />
                                <div>
                                    <h1 className="text-xl font-bold text-mono-900 dark:text-mono-100">
                                        SmartMeeting
                                    </h1>
                                    <p className="text-xs text-mono-500 dark:text-mono-400 hidden sm:block">
                                        Sistema Integrado de Gestão de Reuniões
                                    </p>
                                </div>
                            </div>

                            {/* Navegação desktop */}
                            <Navigation activeView={activeView} setActiveView={setActiveView} items={navigationItems} />

                            {/* Botão de tema, menu do usuário e menu mobile */}
                            <div className="flex items-center gap-2">
                                <ThemeToggle />

                                {/* Menu do usuário logado */}
                                <UserMenu />

                                <button
                                    onClick={() => setShowNavigation(!showNavigation)}
                                    className="md:hidden p-2 text-mono-600 dark:text-mono-400 hover:text-mono-900 dark:hover:text-mono-100 hover:bg-mono-50 dark:hover:bg-mono-700 rounded-lg transition-colors"
                                    aria-label="Toggle navigation menu"
                                >
                                    {showNavigation ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                                </button>
                            </div>
                        </div>

                        {/* Navegação mobile */}
                        {showNavigation && (
                            <Navigation activeView={activeView} setActiveView={setActiveView} items={navigationItems} showMobile setShowMobile={setShowNavigation} />
                        )}
                    </div>
                </header>

                {/* Conteúdo principal */}
                <main className="flex-1">
                    {viewComponents[activeView]}
                </main>

                {/* Rodapé */}
                <footer className="bg-white dark:bg-mono-800 border-t border-mono-200 dark:border-mono-700 py-6">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 text-sm text-mono-600 dark:text-mono-400">
                                <span>© 2025 SmartMeeting</span>
                                <span>•</span>
                                <span>Sistema de Gestão de Reuniões</span>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-mono-500 dark:text-mono-500">
                                <span>Desenvolvido por MiniMax Agent</span>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </ErrorBoundary>
    );

}

export default App;
