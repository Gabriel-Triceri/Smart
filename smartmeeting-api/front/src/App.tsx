import { useState, useEffect } from 'react';
import ErrorBoundary from './components/ErrorBoundary';
import Dashboard from './components/Dashboard';
import { MeetingManager } from './components/MeetingManager';
import LoadingSkeleton from './components/LoadingSkeleton';
import { ThemeProvider } from './contexts/ThemeContext';
import { BarChart3, Calendar, Menu, X } from 'lucide-react';

type ActiveView = 'dashboard' | 'meetings';

function App() {
  const [mounted, setMounted] = useState(false);
  const [activeView, setActiveView] = useState<ActiveView>('meetings');
  const [showNavigation, setShowNavigation] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Verificar se há uma preferência salva
    const savedView = localStorage.getItem('smartmeeting-active-view') as ActiveView;
    if (savedView && ['dashboard', 'meetings'].includes(savedView)) {
      setActiveView(savedView);
    }
  }, []);

  const handleViewChange = (view: ActiveView) => {
    setActiveView(view);
    setShowNavigation(false);
    localStorage.setItem('smartmeeting-active-view', view);
  };

  if (!mounted) {
    return <LoadingSkeleton />;
  }

  const navigationItems = [
    {
      id: 'dashboard' as ActiveView,
      label: 'Dashboard Executivo',
      icon: BarChart3,
      description: 'Métricas e indicadores'
    },
    {
      id: 'meetings' as ActiveView,
      label: 'Gestão de Reuniões',
      icon: Calendar,
      description: 'Calendário e organização'
    }
  ];

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
          {/* Cabeçalho com navegação */}
          <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                {/* Logo e título */}
                <div className="flex items-center gap-4">
                  <Calendar className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  <div>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                      SmartMeeting
                    </h1>
                    <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
                      Sistema Integrado de Gestão de Reuniões
                    </p>
                  </div>
                </div>

                {/* Navegação desktop */}
                <nav className="hidden md:flex items-center space-x-1">
                  {navigationItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeView === item.id;
                    
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleViewChange(item.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          isActive
                            ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {item.label}
                      </button>
                    );
                  })}
                </nav>

                {/* Botão do menu mobile */}
                <button
                  onClick={() => setShowNavigation(!showNavigation)}
                  className="md:hidden p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  {showNavigation ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              </div>

              {/* Navegação mobile */}
              {showNavigation && (
                <div className="md:hidden border-t border-gray-200 dark:border-gray-700 py-4">
                  <nav className="space-y-2">
                    {navigationItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeView === item.id;
                      
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleViewChange(item.id)}
                          className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                            isActive
                              ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                          <div>
                            <div className="font-medium">{item.label}</div>
                            <div className="text-xs opacity-75">{item.description}</div>
                          </div>
                        </button>
                      );
                    })}
                  </nav>
                </div>
              )}
            </div>
          </header>

          {/* Conteúdo principal */}
          <main className="flex-1">
            {activeView === 'dashboard' ? (
              <Dashboard />
            ) : (
              <MeetingManager />
            )}
          </main>

          {/* Rodapé */}
          <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <span>© 2025 SmartMeeting</span>
                  <span>•</span>
                  <span>Sistema de Gestão de Reuniões</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-500">
                  <span>Desenvolvido por MiniMax Agent</span>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;