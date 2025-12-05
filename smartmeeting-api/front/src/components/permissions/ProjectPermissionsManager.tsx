import { useState, useMemo } from 'react';
import {
    Shield,
    Search,
    ChevronRight,
    UserPlus,
    X,
    Loader2,
    AlertCircle,
    Users,
    Crown
} from 'lucide-react';
import { PermissionType, Assignee } from '../../types/meetings';
import { useProjectPermissions, PERMISSION_LABELS, PERMISSION_CATEGORIES, PREDEFINED_ROLES } from '../../hooks/useProjectPermissions';
import { Avatar } from '../common/Avatar';

interface ProjectPermissionsManagerProps {
    projectId: string;
    projectName?: string;
    members: Assignee[];
    onClose?: () => void;
}

export const ProjectPermissionsManager: React.FC<ProjectPermissionsManagerProps> = ({
    projectId,
    projectName,
    members,
    onClose
}) => {
    const {
        loading,
        error,
        grantPermission,
        revokePermission,
        applyRole,
        hasPermission,
        getPermissionsByMember
    } = useProjectPermissions(projectId);

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
    const [applyingRole, setApplyingRole] = useState(false);
    const [selectedRole, setSelectedRole] = useState<string>('');

    // Group members with their permissions
    const membersWithPermissions = useMemo(() => {
        return members.map(member => ({
            ...member,
            permissions: getPermissionsByMember(member.id),
            isAdmin: hasPermission(member.id, PermissionType.ADMIN)
        }));
    }, [members, getPermissionsByMember, hasPermission]);

    // Filter members by search
    const filteredMembers = useMemo(() => {
        if (!searchTerm) return membersWithPermissions;
        const term = searchTerm.toLowerCase();
        return membersWithPermissions.filter(m =>
            m.nome.toLowerCase().includes(term) ||
            m.email?.toLowerCase().includes(term)
        );
    }, [membersWithPermissions, searchTerm]);

    // Get selected member
    const selectedMember = useMemo(() => {
        return membersWithPermissions.find(m => m.id === selectedMemberId);
    }, [membersWithPermissions, selectedMemberId]);

    // Handle permission toggle
    const handlePermissionToggle = async (permissionType: PermissionType) => {
        if (!selectedMemberId) return;

        const memberPerms = getPermissionsByMember(selectedMemberId);
        const existingPerm = memberPerms.find(p => p.permissionType === permissionType);

        if (existingPerm) {
            await revokePermission(existingPerm.id);
        } else {
            await grantPermission(selectedMemberId, permissionType);
        }
    };

    // Handle apply role
    const handleApplyRole = async () => {
        if (!selectedMemberId || !selectedRole) return;

        setApplyingRole(true);
        try {
            await applyRole(selectedMemberId, selectedRole);
            setSelectedRole('');
        } finally {
            setApplyingRole(false);
        }
    };

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-full mb-4">
                    <AlertCircle className="w-8 h-8 text-red-500 dark:text-red-400" />
                </div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Erro ao Carregar</h2>
                <p className="text-slate-500 dark:text-slate-400 max-w-md">{error}</p>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="bg-blue-600 text-white p-2 rounded-lg shadow-sm">
                        <Shield className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                            Permissões do Projeto
                        </h2>
                        {projectName && (
                            <p className="text-sm text-slate-500 dark:text-slate-400">{projectName}</p>
                        )}
                    </div>
                </div>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                )}
            </div>

            {/* Search */}
            <div className="mb-6">
                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Buscar membros..."
                        className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900 dark:text-white shadow-sm"
                    />
                </div>
            </div>

            {/* Content Area */}
            <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
                {/* Members Sidebar */}
                <div className="lg:w-1/3 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            Membros ({members.length})
                        </h3>
                    </div>
                    <div className="overflow-y-auto flex-1 p-2 space-y-1">
                        {loading ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                            </div>
                        ) : filteredMembers.length === 0 ? (
                            <div className="text-center py-8 text-slate-400 text-sm">
                                Nenhum membro encontrado
                            </div>
                        ) : (
                            filteredMembers.map(member => (
                                <button
                                    key={member.id}
                                    onClick={() => setSelectedMemberId(member.id)}
                                    className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-3 transition-all ${
                                        selectedMemberId === member.id
                                            ? 'bg-blue-50 dark:bg-blue-900/20 ring-1 ring-blue-200 dark:ring-blue-800'
                                            : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'
                                    }`}
                                >
                                    <Avatar
                                        src={member.avatar}
                                        name={member.nome}
                                        className="w-8 h-8 text-xs"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className={`text-sm font-medium truncate ${
                                                selectedMemberId === member.id
                                                    ? 'text-blue-700 dark:text-blue-300'
                                                    : 'text-slate-700 dark:text-slate-300'
                                            }`}>
                                                {member.nome}
                                            </span>
                                            {member.isAdmin && (
                                                <Crown className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                                            )}
                                        </div>
                                        <span className="text-xs text-slate-400 truncate block">
                                            {member.permissions.length} permissões
                                        </span>
                                    </div>
                                    {selectedMemberId === member.id && (
                                        <ChevronRight className="w-4 h-4 text-blue-500 flex-shrink-0" />
                                    )}
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Permissions Panel */}
                <div className="flex-1 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col min-h-[400px]">
                    {selectedMember ? (
                        <>
                            {/* Selected Member Header */}
                            <div className="p-6 border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/20">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Avatar
                                            src={selectedMember.avatar}
                                            name={selectedMember.nome}
                                            className="w-10 h-10"
                                        />
                                        <div>
                                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                                {selectedMember.nome}
                                                {selectedMember.isAdmin && (
                                                    <span className="text-xs bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-2 py-0.5 rounded-full">
                                                        Admin
                                                    </span>
                                                )}
                                            </h3>
                                            <p className="text-sm text-slate-500">{selectedMember.email}</p>
                                        </div>
                                    </div>
                                    <div className="text-sm text-slate-500">
                                        {selectedMember.permissions.length} permissões ativas
                                    </div>
                                </div>

                                {/* Quick Role Apply */}
                                <div className="mt-4 flex items-center gap-3">
                                    <select
                                        value={selectedRole}
                                        onChange={(e) => setSelectedRole(e.target.value)}
                                        className="flex-1 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                    >
                                        <option value="">Aplicar perfil predefinido...</option>
                                        {Object.keys(PREDEFINED_ROLES).map(role => (
                                            <option key={role} value={role}>{role}</option>
                                        ))}
                                    </select>
                                    <button
                                        onClick={handleApplyRole}
                                        disabled={!selectedRole || applyingRole}
                                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                                    >
                                        {applyingRole ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <UserPlus className="w-4 h-4" />
                                        )}
                                        Aplicar
                                    </button>
                                </div>
                            </div>

                            {/* Permissions Grid */}
                            <div className="flex-1 overflow-y-auto p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {Object.entries(PERMISSION_CATEGORIES).map(([category, permTypes]) => {
                                        const activeCount = permTypes.filter(pt =>
                                            hasPermission(selectedMember.id, pt)
                                        ).length;

                                        return (
                                            <div
                                                key={category}
                                                className={`border rounded-lg overflow-hidden transition-all ${
                                                    activeCount === permTypes.length
                                                        ? 'border-blue-200 dark:border-blue-900 bg-blue-50/30 dark:bg-blue-900/10'
                                                        : 'border-slate-200 dark:border-slate-700'
                                                }`}
                                            >
                                                <div className="px-4 py-3 bg-slate-50/80 dark:bg-slate-800/80 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                                                    <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-200">
                                                        {category}
                                                    </h4>
                                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                                                        activeCount > 0
                                                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                                                            : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                                                    }`}>
                                                        {activeCount}/{permTypes.length}
                                                    </span>
                                                </div>
                                                <div className="p-3 space-y-2">
                                                    {permTypes.map(permType => {
                                                        const hasPerm = hasPermission(selectedMember.id, permType);
                                                        return (
                                                            <label
                                                                key={permType}
                                                                className="flex items-start gap-3 p-2 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700/30 cursor-pointer transition-colors group"
                                                            >
                                                                <div className="relative flex items-center pt-0.5">
                                                                    <input
                                                                        type="checkbox"
                                                                        className="peer h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600 dark:border-slate-600 dark:bg-slate-700 dark:ring-offset-slate-800"
                                                                        checked={hasPerm}
                                                                        onChange={() => handlePermissionToggle(permType)}
                                                                    />
                                                                </div>
                                                                <div className="text-sm leading-tight">
                                                                    <span className={`font-medium ${
                                                                        hasPerm
                                                                            ? 'text-slate-900 dark:text-white'
                                                                            : 'text-slate-600 dark:text-slate-400'
                                                                    }`}>
                                                                        {PERMISSION_LABELS[permType]}
                                                                    </span>
                                                                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                                                                        {permType}
                                                                    </p>
                                                                </div>
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center p-12">
                            <div className="w-16 h-16 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mb-4">
                                <Shield className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                                Nenhum membro selecionado
                            </h3>
                            <p className="text-slate-500 dark:text-slate-400 max-w-sm mt-1">
                                Selecione um membro na lista lateral para visualizar e editar suas permissões.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProjectPermissionsManager;
