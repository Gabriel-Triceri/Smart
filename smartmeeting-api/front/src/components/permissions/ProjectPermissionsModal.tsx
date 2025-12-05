import { X } from 'lucide-react';
import { ProjectPermissionsManager } from './ProjectPermissionsManager';

interface ProjectPermissionsModalProps {
    projectId: string;
    projectName?: string;
    isOpen: boolean;
    onClose: () => void;
}

export const ProjectPermissionsModal: React.FC<ProjectPermissionsModalProps> = ({
    projectId,
    projectName,
    isOpen,
    onClose
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Panel */}
            <div className="relative w-full max-w-6xl bg-white dark:bg-slate-900 shadow-2xl rounded-2xl flex flex-col h-[90vh] max-h-[800px] animate-in zoom-in-95 duration-200 overflow-hidden border border-slate-200 dark:border-slate-800">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                            Gerenciar Permissões
                        </h2>
                        {projectName && (
                            <p className="text-sm text-slate-500 dark:text-slate-400">{projectName}</p>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    <ProjectPermissionsManager
                        projectId={projectId}
                        projectName={projectName}
                    />
                </div>
            </div>
        </div>
    );
};

export default ProjectPermissionsModal;
