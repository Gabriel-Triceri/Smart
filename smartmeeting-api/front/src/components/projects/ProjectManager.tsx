import { useState, useEffect, useMemo } from 'react';
import {
    Briefcase, Plus, Search, LayoutGrid, List,
    Shield, Calendar, RefreshCw, X, Save, Loader2,
    ChevronRight, Clock
} from 'lucide-react';
import { projectService } from '../../services/projectService';
import { ProjectDTO, PermissionType } from '../../types/meetings';
import { useTheme } from '../../context/ThemeContext';
import { CanDo } from '../permissions/CanDo';
import { ProjectPermissionsModal } from '../permissions/ProjectPermissionsModal';
import { formatDate } from '../../utils/dateHelpers';

type ViewMode = 'grid' | 'list';

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
    ACTIVE:   { label: 'Ativo',     color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
    INACTIVE: { label: 'Inativo',   color: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400' },
    ARCHIVED: { label: 'Arquivado', color: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
};

function getStatusConfig(status?: string) {
    return STATUS_CONFIG[status?.toUpperCase() ?? ''] ?? STATUS_CONFIG['ACTIVE'];
}

function getProjectInitials(name: string) {
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

const AVATAR_COLORS = [
    'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
    'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300',
    'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
    'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300',
];

function getAvatarColor(name: string) {
    const idx = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % AVATAR_COLORS.length;
    return AVATAR_COLORS[idx];
}

interface CreateProjectModalProps {
    onClose: () => void;
    onCreated: () => void;
}

function CreateProjectModal({ onClose, onCreated }: CreateProjectModalProps) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) { setError('Nome é obrigatório'); return; }
        setLoading(true);
        try {
            // FIX #6: chama projectService.createProject diretamente (método agora existe)
            // Antes: await (projectService as any).createProject?.(...) — silenciosamente não fazia nada
            await projectService.createProject({ name: name.trim(), description: description.trim() || undefined });
            onCreated();
        } catch (err: any) {
            setError(err.response?.data?.message ?? 'Erro ao criar projeto');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-600 rounded-lg text-white">
                            <Briefcase className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Novo Projeto</h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Preencha as informações básicas</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                            Nome <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={e => { setName(e.target.value); setError(''); }}
                            placeholder="Ex: Sistema de Pagamentos"
                            className={`w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900 dark:text-white ${error ? 'border-red-500' : 'border-slate-200 dark:border-slate-600'}`}
                            autoFocus
                        />
                        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                            Descrição
                        </label>
                        <textarea
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            rows={3}
                            placeholder="Descreva o objetivo do projeto..."
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none text-slate-900 dark:text-white"
                        />
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose}
                            className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                            Cancelar
                        </button>
                        <button type="submit" disabled={loading}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all disabled:opacity-60">
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            {loading ? 'Criando...' : 'Criar Projeto'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

interface ProjectCardProps {
    project: ProjectDTO;
    onManagePermissions: (project: ProjectDTO) => void;
}

function ProjectCard({ project, onManagePermissions }: ProjectCardProps) {
    const status = getStatusConfig(project.status);
    const avatarColor = getAvatarColor(project.name);

    return (
        <div className="group bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-200 flex flex-col">
            <div className="p-5 flex-1">
                <div className="flex items-start justify-between gap-3 mb-4">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 ${avatarColor}`}>
                        {getProjectInitials(project.name)}
                    </div>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${status.color}`}>
                        {status.label}
                    </span>
                </div>

                <h3 className="font-semibold text-slate-900 dark:text-white text-base leading-tight mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                    {project.name}
                </h3>

                <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-4 min-h-[40px]">
                    {project.description || 'Sem descrição.'}
                </p>

                <div className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Criado em {formatDate(project.createdAt, 'dd/MM/yyyy')}</span>
                </div>
            </div>

            <div className="px-5 py-3.5 bg-slate-50/50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-700 rounded-b-xl flex gap-2">
                <CanDo permission={PermissionType.PROJECT_MANAGE_MEMBERS} projectId={project.id}>
                    <button
                        onClick={() => onManagePermissions(project)}
                        className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 border border-blue-100 dark:border-blue-800 rounded-lg transition-all"
                    >
                        <Shield className="w-3.5 h-3.5" />
                        Permissões
                    </button>
                </CanDo>
                <button
                    onClick={() => onManagePermissions(project)}
                    className="ml-auto flex items-center gap-1 px-3 py-2 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                    Ver detalhes
                    <ChevronRight className="w-3.5 h-3.5" />
                </button>
            </div>
        </div>
    );
}

interface ProjectRowProps {
    project: ProjectDTO;
    onManagePermissions: (project: ProjectDTO) => void;
}

function ProjectRow({ project, onManagePermissions }: ProjectRowProps) {
    const status = getStatusConfig(project.status);
    const avatarColor = getAvatarColor(project.name);

    return (
        <div className="group flex items-center gap-4 px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors border-b border-slate-100 dark:border-slate-700/50 last:border-0">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${avatarColor}`}>
                {getProjectInitials(project.name)}
            </div>

            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                    {project.name}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    {project.description || 'Sem descrição'}
                </p>
            </div>

            <span className={`hidden sm:inline-flex text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${status.color}`}>
                {status.label}
            </span>

            <div className="hidden md:flex items-center gap-1 text-xs text-slate-400 shrink-0">
                <Calendar className="w-3.5 h-3.5" />
                {formatDate(project.createdAt, 'dd/MM/yyyy')}
            </div>

            <div className="flex items-center gap-2 shrink-0">
                <CanDo permission={PermissionType.PROJECT_MANAGE_MEMBERS} projectId={project.id}>
                    <button
                        onClick={() => onManagePermissions(project)}
                        className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        title="Gerenciar permissões"
                    >
                        <Shield className="w-4 h-4" />
                    </button>
                </CanDo>
                <button
                    onClick={() => onManagePermissions(project)}
                    className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}

export function ProjectManager() {
    const { theme } = useTheme();
    const [projects, setProjects] = useState<ProjectDTO[]>([]);
    const [loading, setLoading] = useState(false);
    const [showAll, setShowAll] = useState(false);
    const [viewMode, setViewMode] = useState<ViewMode>('grid');
    const [searchTerm, setSearchTerm] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [permissionsProject, setPermissionsProject] = useState<ProjectDTO | null>(null);

    const fetchProjects = async () => {
        setLoading(true);
        try {
            const data = showAll
                ? await projectService.getAllProjectsAdmin()
                : await projectService.getMyProjects();
            setProjects(data);
        } catch (err) {
            console.error('Erro ao buscar projetos:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchProjects(); }, [showAll]);

    const filtered = useMemo(() => {
        if (!searchTerm.trim()) return projects;
        const term = searchTerm.toLowerCase();
        return projects.filter(p =>
            p.name.toLowerCase().includes(term) ||
            p.description?.toLowerCase().includes(term)
        );
    }, [projects, searchTerm]);

    return (
        <div className={`min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col font-sans ${theme === 'dark' ? 'dark' : ''}`}>

            {/* Header */}
            <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-30">
                <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between gap-4">

                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2.5">
                                <div className="bg-blue-600 text-white p-2 rounded-lg shadow-sm shadow-blue-500/20">
                                    <Briefcase className="w-5 h-5" />
                                </div>
                                <div>
                                    <h1 className="text-lg font-bold text-slate-900 dark:text-white leading-none">Projetos</h1>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                        {loading ? 'Carregando...' : `${filtered.length} projeto${filtered.length !== 1 ? 's' : ''}`}
                                    </p>
                                </div>
                            </div>

                            <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 hidden md:block" />

                            <div className="hidden md:flex bg-slate-100 dark:bg-slate-700/50 p-1 rounded-lg">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-slate-600 text-blue-600 dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}`}
                                >
                                    <LayoutGrid className="w-4 h-4" />
                                    <span className="hidden lg:inline">Grade</span>
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'list' ? 'bg-white dark:bg-slate-600 text-blue-600 dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}`}
                                >
                                    <List className="w-4 h-4" />
                                    <span className="hidden lg:inline">Lista</span>
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 flex-1 justify-end">
                            <div className="hidden md:flex relative group max-w-xs w-full">
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    placeholder="Buscar projetos..."
                                    className="w-full pl-9 pr-4 py-2 bg-slate-100 dark:bg-slate-700/50 border border-transparent focus:bg-white dark:focus:bg-slate-800 focus:border-slate-200 dark:focus:border-slate-600 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-slate-900 dark:text-white placeholder-slate-500"
                                />
                                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            </div>

                            <label className="hidden lg:flex items-center gap-2 cursor-pointer select-none">
                                <div
                                    className={`relative w-8 rounded-full transition-colors ${showAll ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'}`}
                                    style={{ height: '18px' }}
                                    onClick={() => setShowAll(v => !v)}
                                >
                                    <span className={`absolute top-0.5 w-3.5 h-3.5 bg-white rounded-full shadow transition-transform ${showAll ? 'translate-x-4' : 'translate-x-0.5'}`} style={{ left: '2px' }} />
                                </div>
                                <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">Todos</span>
                            </label>

                            <button
                                onClick={fetchProjects}
                                disabled={loading}
                                className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                                title="Atualizar"
                            >
                                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-500' : ''}`} />
                            </button>

                            <CanDo permission={PermissionType.PROJECT_VIEW} global>
                                <button
                                    onClick={() => setShowCreateModal(true)}
                                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm hover:shadow-md transition-all active:scale-95 whitespace-nowrap"
                                >
                                    <Plus className="w-4 h-4" />
                                    <span className="hidden sm:inline">Novo Projeto</span>
                                </button>
                            </CanDo>
                        </div>
                    </div>
                </div>
            </div>

            {/* Conteúdo */}
            <main className="flex-1 max-w-[1600px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-10 w-10 border-2 border-slate-200 border-t-blue-600 mb-4" />
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Carregando projetos...</p>
                    </div>

                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-800 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-4">
                            <Briefcase className="w-8 h-8 text-slate-400 dark:text-slate-500" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                            {searchTerm ? 'Nenhum projeto encontrado' : 'Sem projetos ainda'}
                        </h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm text-center mb-6">
                            {searchTerm
                                ? `Nenhum resultado para "${searchTerm}".`
                                : 'Crie seu primeiro projeto para começar a organizar tarefas e reuniões.'}
                        </p>
                        {!searchTerm && (
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                Criar primeiro projeto
                            </button>
                        )}
                    </div>

                ) : viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                        {filtered.map(project => (
                            <ProjectCard
                                key={project.id}
                                project={project}
                                onManagePermissions={setPermissionsProject}
                            />
                        ))}
                    </div>

                ) : (
                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                        <div className="hidden sm:grid grid-cols-[1fr_120px_140px_88px] gap-4 px-6 py-3 bg-slate-50 dark:bg-slate-900/30 border-b border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                            <span>Projeto</span>
                            <span>Status</span>
                            <span>Criado em</span>
                            <span></span>
                        </div>
                        {filtered.map(project => (
                            <ProjectRow
                                key={project.id}
                                project={project}
                                onManagePermissions={setPermissionsProject}
                            />
                        ))}
                    </div>
                )}
            </main>

            {/* Modais */}
            {showCreateModal && (
                <CreateProjectModal
                    onClose={() => setShowCreateModal(false)}
                    onCreated={() => { setShowCreateModal(false); fetchProjects(); }}
                />
            )}

            {permissionsProject && (
                <ProjectPermissionsModal
                    projectId={permissionsProject.id}
                    projectName={permissionsProject.name}
                    isOpen={true}
                    onClose={() => setPermissionsProject(null)}
                />
            )}
        </div>
    );
}