import React from 'react';
import { Calendar, Clock, Users, DoorOpen, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { TimelineItem } from '../../types/dashboard';
import { StatusReuniao } from '../../types/meetings';

interface DailyTimelineProps {
    timeline: TimelineItem[];
    getStatusColor: (status: StatusReuniao) => string;
}

export const DailyTimeline: React.FC<DailyTimelineProps> = ({ timeline, getStatusColor }) => {
    const navigate = useNavigate();

    return (
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-600" />
                    Timeline do Dia
                </h2>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                    {timeline.length} reuniões
                </span>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto">
                {timeline.length === 0 ? (
                    <div className="text-center py-12">
                        <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-500 dark:text-gray-400">Nenhuma reunião agendada para hoje</p>
                    </div>
                ) : (
                    timeline.map((item, index) => (
                        <div
                            key={item.id}
                            className="flex items-start gap-4 group hover:bg-gray-50 dark:hover:bg-gray-700/50 p-3 rounded-lg transition-colors cursor-pointer"
                            onClick={() => navigate(`/meetings/${item.id}`)}
                        >
                            <div className="flex flex-col items-center">
                                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                    {item.hora}
                                </span>
                                <div className="flex flex-col items-center my-2">
                                    <div className={`w-3 h-3 rounded-full ${getStatusColor(item.status)}`}></div>
                                    {index < timeline.length - 1 && (
                                        <div className="w-0.5 h-12 bg-gray-200 dark:bg-gray-700 mt-1"></div>
                                    )}
                                </div>
                            </div>

                            <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                                    {item.titulo}
                                </h3>
                                <div className="flex items-center gap-4 mt-1">
                                    <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                                        <DoorOpen className="w-4 h-4" />
                                        {item.sala}
                                    </span>
                                    <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                                        <Users className="w-4 h-4" />
                                        {item.participantes}
                                    </span>
                                </div>
                            </div>

                            <button className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <ChevronRight className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
