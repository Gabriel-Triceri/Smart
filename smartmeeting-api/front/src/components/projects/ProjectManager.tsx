import { useState, useEffect } from 'react';
import { projectService } from '../../services/projectService';
import { ProjectDTO } from '../../types/meetings';
import { PageHeader } from '../common/PageHeader';
import { Briefcase } from 'lucide-react';

export function ProjectManager() {
    const [projects, setProjects] = useState<ProjectDTO[]>([]);
    const [loading, setLoading] = useState(false);
    const [showAll, setShowAll] = useState(false);

    useEffect(() => {
        fetchProjects();
    }, [showAll]);

    const fetchProjects = async () => {
        setLoading(true);
        try {
            const fetchedProjects = showAll
                ? await projectService.getAllProjectsAdmin()
                : await projectService.getMyProjects();
            setProjects(fetchedProjects);
        } catch (error) {
            console.error("Error fetching projects:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300 font-sans">
            <PageHeader
                title="Projetos"
                description="Gerencie seus projetos"
                icon={Briefcase}
                actions={
                    <div className="flex items-center space-x-4">
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={showAll}
                                onChange={() => setShowAll(!showAll)}
                                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Mostrar Todos</span>
                        </label>
                    </div>
                }
            />
            <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {loading ? (
                    <p>Loading...</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {projects.map((project) => (
                            <div key={project.id} className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{project.name}</h3>
                                <p className="text-slate-500 dark:text-slate-400">{project.description}</p>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
