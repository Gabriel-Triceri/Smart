import { useState, useMemo } from 'react';
import {
    Shield,
    Search,
    ChevronRight,
    RotateCcw,
    X,
    Loader2,
    AlertCircle,
    Users,
    Crown
} from 'lucide-react';
import { PermissionType, ProjectRole, MemberPermissions } from '../../types/meetings';
import {
    useProjectPermissions,
    PERMISSION_LABELS,
    PERMISSION_CATEGORIES,
    ROLE_LABELS
} from '../../hooks/useProjectPermissions';
import { Avatar } from '../common/Avatar';

interface ProjectPermissionsManagerProps {
    projectId: string;
    projectName?: string;
    onClose?: () => void;
}

export const ProjectPermissionsManager: React.FC<ProjectPermissionsManagerProps> = ({
    projectId,
    projectName,
    onClose
}) => {
    const {
        members,
        loading,
        error,
        updatePermissions,
        updateMemberRole,
        resetMemberPermissions,
        hasPermission
    } = useProjectPermissions(projectId);

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);
    const [savingPermissions, setSavingPermissions] = useState(false);
    const [changingRole, setChangingRole] = useState(false);
    const [selectedRole, setSelectedRole] = useState<ProjectRole | ''>('');

    // Filter members by search
    const filteredMembers = useMemo(() => {
        if (!searchTerm) return members;
        const term = searchTerm.toLowerCase();
        return members.filter(m =>
            m.personName.toLowerCase().includes(term) ||
            m.personEmail?.toLowerCase().includes(term)
        );
    }, [members, searchTerm]);

    // Get selected member
    const selectedMember = useMemo((): MemberPermissions | undefined => {
        return members.find(m => m.projectMemberId === selectedMemberId);
    }, [members, selectedMemberId]);

    // Check if member is owner
    const isOwner = (member: MemberPermissions) => member.role === ProjectRole.OWNER;

    // Count active permissions for a member
    const getActivePermissionCount = (member: MemberPermissions): number => {
        return member.permissions.filter(p => p.granted).length;
    };

    // Handle permission toggle
    const handlePermissionToggle = async (permissionType: PermissionType) => {
        if (!selectedMember || isOwner(selectedMember)) return;

        setSavingPermissions(true);
        try {
            // Get current permissions state and toggle the selected one
            const currentPermissions = { ...selectedMember.permissionMap } as Record<PermissionType, boolean>;
            currentPermissions[permissionType] = !currentPermissions[permissionType];

            // Send only the changed permission
            await updatePermissions(String(selectedMember.projectMemberId), {
                [permissionType]: currentPermissions[permissionType]
            } as Record<PermissionType, boolean>);
        } finally {
            setSavingPermissions(false);
        }
    };

    // Handle role change
    const handleRoleChange = async () => {
        if (!selectedMember || !selectedRole || isOwner(selectedMember)) return;

        setChangingRole(true);
        try {
            await updateMemberRole(String(selectedMember.projectMemberId), selectedRole);
            setSelectedRole('');
        } finally {
            setChangingRole(false);
        }
    };

    // Handle reset permissions
    const handleResetPermissions = async () => {
        if (!selectedMember || isOwner(selectedMember)) return;

        setSavingPermissions(true);
        try {
            await resetMemberPermissions(String(selectedMember.projectMemberId));
        } finally {
            setSavingPermissions(false);
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
                                    key={member.projectMemberId}
                                    onClick={() => setSelectedMemberId(member.projectMemberId)}
                                    className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-3 transition-all ${
                                        selectedMemberId === member.projectMemberId
                                            ? 'bg-blue-50 dark:bg-blue-900/20 ring-1 ring-blue-200 dark:ring-blue-800'
                                            : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'
                                    }`}
                                >
                                    <Avatar
                                        name={member.personName}
                                        className="w-8 h-8 text-xs"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className={`text-sm font-medium truncate ${
                                                selectedMemberId === member.projectMemberId
                                                    ? 'text-blue-700 dark:text-blue-300'
                                                    : 'text-slate-700 dark:text-slate-300'
                                            }`}>
                                                {member.personName}
                                            </span>
                                            {isOwner(member) && (
                                                <Crown className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                                            )}
                                        </div>
                                        <span className="text-xs text-slate-400 truncate block">
                                            {ROLE_LABELS[member.role]} • {getActivePermissionCount(member)} permissões
                                        </span>
                                    </div>
                                    {selectedMemberId === member.projectMemberId && (
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
                                            name={selectedMember.personName}
                                            className="w-10 h-10"
                                        />
                                        <div>
                                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                                {selectedMember.personName}
                                                {isOwner(selectedMember) && (
                                                    <span className="text-xs bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-2 py-0.5 rounded-full">
                                                        Proprietário
                                                    </span>
                                                )}
                                            </h3>
                                            <p className="text-sm text-slate-500">{selectedMember.personEmail}</p>
                                        </div>
                                    </div>
                                    <div className="text-sm text-slate-500">
                                        {getActivePermissionCount(selectedMember)} permissões ativas
                                    </div>
                                </div>

                                {/* Role Change & Reset */}
                                {!isOwner(selectedMember) && (
                                    <div className="mt-4 flex items-center gap-3">
                                        <select
                                            value={selectedRole}
                                            onChange={(e) => setSelectedRole(e.target.value as ProjectRole)}
                                            className="flex-1 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                        >
                                            <option value="">Alterar papel...</option>
                                            {Object.values(ProjectRole)
                                                .filter(role => role !== ProjectRole.OWNER)
                                                .map(role => (
                                                    <option key={role} value={role}>
                                                        {ROLE_LABELS[role]}
                                                    </option>
                                                ))
                                            }
                                        </select>
                                        <button
                                            onClick={handleRoleChange}
                                            disabled={!selectedRole || changingRole}
                                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                                        >
                                            {changingRole && <Loader2 className="w-4 h-4 animate-spin" />}
                                            Aplicar
                                        </button>
                                        <button
                                            onClick={handleResetPermissions}
                                            disabled={savingPermissions}
                                            className="px-3 py-2 text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                                            title="Resetar para permissões padrão do papel"
                                        >
                                            <RotateCcw className="w-4 h-4" />
                                            Resetar
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Permissions Grid */}
                            <div className="flex-1 overflow-y-auto p-6">
                                {isOwner(selectedMember) ? (
                                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 text-center">
                                        <Crown className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                                        <p className="text-amber-700 dark:text-amber-300 font-medium">
                                            O proprietário tem todas as permissões
                                        </p>
                                        <p className="text-amber-600 dark:text-amber-400 text-sm mt-1">
                                            Não é possível alterar as permissões do proprietário do projeto.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {Object.entries(PERMISSION_CATEGORIES).map(([category, permTypes]) => {
                                            const activeCount = permTypes.filter(pt =>
                                                hasPermission(String(selectedMember.projectMemberId), pt)
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
                                                            const hasPerm = hasPermission(String(selectedMember.projectMemberId), permType);
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
                                                                            disabled={savingPermissions}
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
                                )}
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
