import React from 'react';
import {
    Users, Monitor, Wifi, Phone, Video, Trash2,
    MapPin, Clock, Settings, AlertTriangle,
    CheckCircle, Wrench
} from 'lucide-react';
import { Sala, SalaStatus } from '../types/meetings';

interface SalasGridProps {
    salas: Sala[];
    onSalaClick: (sala: Sala) => void;
    onEditSala: (sala: Sala) => void;
    onDeleteSala: (sala: Sala) => void;
    onBookingSala?: (sala: Sala) => void;
}

const getStatusIcon = (status: Sala['status']) => {
    switch (status) {
        case SalaStatus.LIVRE:
            return <CheckCircle className="w-5 h-5 text-green-500" />;
        case SalaStatus.OCUPADA:
            return <Users className="w-5 h-5 text-red-500" />;
        case SalaStatus.MANUTENCAO:
            return <Wrench className="w-5 h-5 text-yellow-500" />;
        case SalaStatus.RESERVADA:
            return <Clock className="w-5 h-5 text-blue-500" />;
        default:
            return <AlertTriangle className="w-5 h-5 text-gray-500" />;
    }
};

const getStatusColor = (status: Sala['status']) => {
    switch (status) {
        case SalaStatus.LIVRE:
            return 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300';
        case SalaStatus.OCUPADA:
            return 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300';
        case SalaStatus.MANUTENCAO:
            return 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-300';
        case SalaStatus.RESERVADA:
            return 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300';
        default:
            return 'bg-gray-50 border-gray-200 text-gray-800 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300';
    }
};

const getCategoriaCor = (categoria: Sala['categoria']) => {
    switch (categoria) {
        case 'executiva':
            return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
        case 'reuniao':
            return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
        case 'treinamento':
            return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
        case 'auditorio':
            return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
        case 'pequena':
            return 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300';
        default:
            return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
};

const getCategoriaLabel = (categoria: Sala['categoria']) => {
    switch (categoria) {
        case 'executiva':
            return 'Executiva';
        case 'reuniao':
            return 'Reunião';
        case 'treinamento':
            return 'Treinamento';
        case 'auditorio':
            return 'Auditório';
        case 'pequena':
            return 'Pequena';
        default:
            return categoria;
    }
};

const getEquipmentIcon = (equipamento: string) => {
    if (equipamento.toLowerCase().includes('projetor') || equipamento.toLowerCase().includes('tv')) {
        return <Monitor className="w-3 h-3" />;
    }
    if (equipamento.toLowerCase().includes('wifi') || equipamento.toLowerCase().includes('internet')) {
        return <Wifi className="w-3 h-3" />;
    }
    if (equipamento.toLowerCase().includes('telefone') || equipamento.toLowerCase().includes('video')) {
        return <Phone className="w-3 h-3" />;
    }
    return <Settings className="w-3 h-3" />;
};

export const SalasGrid: React.FC<SalasGridProps> = ({
                                                        salas,
                                                        onSalaClick,
                                                        onEditSala,
                                                        onDeleteSala,
                                                        onBookingSala
                                                    }) => {
    if (salas.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="text-gray-400 dark:text-gray-500 text-lg mb-2">
                    <MapPin className="w-12 h-12 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Nenhuma sala encontrada</h3>
                <p className="text-gray-500 dark:text-gray-400">
                    Tente ajustar os filtros ou adicionar uma nova sala.
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {salas.map((sala) => (
                <div
                    key={sala.id}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:border-blue-500 transition-shadow cursor-pointer group"
                    onClick={() => onSalaClick(sala)}
                >
                    {/* Cabeçalho da sala */}
                    <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                                <h3 className="font-semibold text-gray-900 dark:text-white text-lg group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                    {sala.nome}
                                </h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <MapPin className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                                    <span className="text-sm text-gray-500 dark:text-gray-400">{sala.localizacao}</span>
                                    {sala.andar && (
                                        <span className="text-xs text-gray-400 dark:text-gray-500">• {sala.andar}</span>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {getStatusIcon(sala.status)}
                            </div>
                        </div>

                        {/* Categoria e capacidade */}
                        <div className="flex items-center justify-between mb-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoriaCor(sala.categoria)}`}>
                                {getCategoriaLabel(sala.categoria)}
                            </span>
                            <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300">
                                <Users className="w-4 h-4" />
                                <span>{sala.capacidade} pessoas</span>
                            </div>
                        </div>

                        {/* Status da sala */}
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(sala.status)}`}>
                            {sala.status === SalaStatus.LIVRE && 'Disponível'}
                            {sala.status === SalaStatus.OCUPADA && 'Ocupada'}
                            {sala.status === SalaStatus.MANUTENCAO && 'Manutenção'}
                            {sala.status === SalaStatus.RESERVADA && 'Reservada'}
                        </div>
                    </div>

                    {/* Equipamentos principais */}
                    <div className="p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Equipamentos:</span>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-3">
                            {(sala.equipamentos ?? []).slice(0, 3).map((equipamento, index) => (
                                <div
                                    key={index}
                                    className="flex items-center gap-1 px-2 py-1 bg-gray-50 dark:bg-gray-700 rounded text-xs text-gray-600 dark:text-gray-300"
                                >
                                    {getEquipmentIcon(equipamento)}
                                    <span className="truncate max-w-20">{equipamento}</span>
                                </div>
                            ))}
                            {sala.equipamentos && sala.equipamentos.length > 3 && (
                                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-600 rounded text-xs text-gray-500 dark:text-gray-400">
                                    +{sala.equipamentos.length - 3} mais
                                </span>
                            )}
                        </div>

                        {/* Recursos especiais */}
                        {sala.recursos && sala.recursos.some(r => r.tipo === 'video' || r.tipo === 'audio') && (
                            <div className="flex items-center gap-1 mb-3">
                                <Video className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                                <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                                    Sala com videoconferência
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Ações */}
                    <div className="p-4 pt-0 flex items-center gap-2">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onEditSala(sala);
                            }}
                            className="flex-1 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50"
                        >
                            Editar
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onDeleteSala(sala);
                            }}
                            className="p-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/50"
                            title="Excluir sala"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                        {onBookingSala && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onBookingSala(sala);
                                }}
                                className="flex-1 px-3 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                                disabled={sala.status === SalaStatus.OCUPADA || sala.status === SalaStatus.MANUTENCAO}
                            >
                                Reservar
                            </button>
                        )}
                    </div>

                    {/* Indicador visual de cor */}
                    {sala.cor && (
                        <div
                            className="h-1 rounded-b-lg"
                            style={{ backgroundColor: sala.cor }}
                        />
                    )}
                </div>
            ))}
        </div>
    );
};
