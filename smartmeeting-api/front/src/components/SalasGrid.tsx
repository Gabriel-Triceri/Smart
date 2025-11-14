import React from 'react';
import {
    Users, Monitor, Wifi, Phone, Video,
    MapPin, Clock, Settings, AlertTriangle,
    CheckCircle, XCircle, Wrench
} from 'lucide-react';
import { Sala } from '../types/meetings';

interface SalasGridProps {
    salas: Sala[];
    onSalaClick: (sala: Sala) => void;
    onEditSala: (sala: Sala) => void;
    onBookingSala?: (sala: Sala) => void;
    filtros?: {
        categoria?: string;
        status?: string;
        capacidade?: number;
    };
}

const getStatusIcon = (status: Sala['status']) => {
    switch (status) {
        case 'disponivel':
            return <CheckCircle className="w-5 h-5 text-green-500" />;
        case 'ocupada':
            return <Users className="w-5 h-5 text-red-500" />;
        case 'manutencao':
            return <Wrench className="w-5 h-5 text-yellow-500" />;
        case 'reservada':
            return <Clock className="w-5 h-5 text-blue-500" />;
        default:
            return <AlertTriangle className="w-5 h-5 text-gray-500" />;
    }
};

const getStatusColor = (status: Sala['status']) => {
    switch (status) {
        case 'disponivel':
            return 'bg-green-50 border-green-200 text-green-800';
        case 'ocupada':
            return 'bg-red-50 border-red-200 text-red-800';
        case 'manutencao':
            return 'bg-yellow-50 border-yellow-200 text-yellow-800';
        case 'reservada':
            return 'bg-blue-50 border-blue-200 text-blue-800';
        default:
            return 'bg-gray-50 border-gray-200 text-gray-800';
    }
};

const getCategoriaCor = (categoria: Sala['categoria']) => {
    switch (categoria) {
        case 'executiva':
            return 'bg-purple-100 text-purple-800';
        case 'reuniao':
            return 'bg-blue-100 text-blue-800';
        case 'treinamento':
            return 'bg-green-100 text-green-800';
        case 'auditorio':
            return 'bg-orange-100 text-orange-800';
        case 'pequena':
            return 'bg-pink-100 text-pink-800';
        default:
            return 'bg-gray-100 text-gray-800';
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
                                                        onBookingSala,
                                                        filtros
                                                    }) => {
    const salasFiltradas = salas.filter(sala => {
        if (filtros?.categoria && sala.categoria !== filtros.categoria) return false;
        if (filtros?.status && sala.status !== filtros.status) return false;
        if (filtros?.capacidade && sala.capacidade < filtros.capacidade) return false;
        return true;
    });

    if (salasFiltradas.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="text-gray-400 text-lg mb-2">
                    <MapPin className="w-12 h-12 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma sala encontrada</h3>
                <p className="text-gray-500">
                    Tente ajustar os filtros ou adicionar uma nova sala.
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {salasFiltradas.map((sala) => (
                <div
                    key={sala.id}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer group"
                    onClick={() => onSalaClick(sala)}
                >
                    {/* Cabeçalho da sala */}
                    <div className="p-4 border-b border-gray-100">
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                                <h3 className="font-semibold text-gray-900 text-lg group-hover:text-blue-600 transition-colors">
                                    {sala.nome}
                                </h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <MapPin className="w-4 h-4 text-gray-400" />
                                    <span className="text-sm text-gray-500">{sala.localizacao}</span>
                                    {sala.andar && (
                                        <span className="text-xs text-gray-400">• {sala.andar}</span>
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
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                                <Users className="w-4 h-4" />
                                <span>{sala.capacidade} pessoas</span>
                            </div>
                        </div>

                        {/* Status da sala */}
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(sala.status)}`}>
                            {sala.status === 'disponivel' && 'Disponível'}
                            {sala.status === 'ocupada' && 'Ocupada'}
                            {sala.status === 'manutencao' && 'Manutenção'}
                            {sala.status === 'reservada' && 'Reservada'}
                        </div>
                    </div>

                    {/* Equipamentos principais */}
                    <div className="p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="text-sm font-medium text-gray-700">Equipamentos:</span>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-3">
                            {(sala.equipamentos ?? []).slice(0, 3).map((equipamento, index) => (
                                <div
                                    key={index}
                                    className="flex items-center gap-1 px-2 py-1 bg-gray-50 rounded text-xs text-gray-600"
                                >
                                    {getEquipmentIcon(equipamento)}
                                    <span className="truncate max-w-20">{equipamento}</span>
                                </div>
                            ))}
                            {sala.equipamentos && sala.equipamentos.length > 3 && (
                                <span className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-500">
                  +{sala.equipamentos.length - 3} mais
                </span>
                            )}
                        </div>

                        {/* Recursos especiais */}
                        {sala.recursos && sala.recursos.some(r => r.tipo === 'video' || r.tipo === 'audio') && (
                            <div className="flex items-center gap-1 mb-3">
                                <Video className="w-4 h-4 text-blue-500" />
                                <span className="text-xs text-blue-600 font-medium">
                  Sala com videoconferência
                </span>
                            </div>
                        )}
                    </div>

                    {/* Ações */}
                    <div className="p-4 pt-0 flex gap-2">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onEditSala(sala);
                            }}
                            className="flex-1 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                        >
                            Editar
                        </button>
                        {onBookingSala && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onBookingSala(sala);
                                }}
                                className="flex-1 px-3 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                                disabled={sala.status === 'ocupada' || sala.status === 'manutencao'}
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