import React, { useState } from 'react';
import {
    MapPin, Users, ZoomIn, ZoomOut, RotateCcw,
    Home, Building, ChevronUp, ChevronDown
} from 'lucide-react';
import { Sala, SalaStatus } from '../types/meetings';

interface MapaSalasProps {
    salas: Sala[];
    onSalaClick: (sala: Sala) => void;
    salaSelecionada?: Sala;
    zoom?: number;
    onZoomChange?: (zoom: number) => void;
}

interface Andar {
    nome: string;
    nivel: number;
    salas: Sala[];
}

export const MapaSalas: React.FC<MapaSalasProps> = ({
                                                        salas,
                                                        onSalaClick,
                                                        salaSelecionada,
                                                        zoom: zoomProp = 1,
                                                        onZoomChange
                                                    }) => {
    const [zoom, setZoom] = useState(zoomProp);
    const [andarAtivo, setAndarAtivo] = useState(0);
    const [posicao, setPosicao] = useState({ x: 0, y: 0 });

    // Organizar salas por andar
    const andares: Andar[] = React.useMemo(() => {
        const andaresMap = new Map<string, { nome: string; nivel: number; salas: Sala[] }>();

        salas.forEach(sala => {
            const andarKey = sala.andar || 'Térreo';
            if (!andaresMap.has(andarKey)) {
                andaresMap.set(andarKey, {
                    nome: andarKey,
                    nivel: getNivelAndar(andarKey),
                    salas: []
                });
            }
            andaresMap.get(andarKey)!.salas.push(sala);
        });

        return Array.from(andaresMap.values()).sort((a, b) => a.nivel - b.nivel);
    }, [salas]);

    function getNivelAndar(andar: string): number {
        if (andar.toLowerCase().includes('térreo') || andar.toLowerCase().includes('ground')) return 0;
        if (andar.toLowerCase().includes('1º') || andar.toLowerCase().includes('primeiro')) return 1;
        if (andar.toLowerCase().includes('2º') || andar.toLowerCase().includes('segundo')) return 2;
        if (andar.toLowerCase().includes('3º') || andar.toLowerCase().includes('terceiro')) return 3;
        return 0;
    }

    // Gerar coordenadas para as salas baseado na categoria
    const gerarCoordenadas = (sala: Sala, index: number): { x: number; y: number } => {
        // Se já tem coordenadas, usar elas
        if (sala.coordenadas) {
            return sala.coordenadas;
        }

        // Layout padrão do andar
        const colunas = 4;
        const espacamento = 120;
        const linha = Math.floor(index / colunas);
        const coluna = index % colunas;

        return {
            x: coluna * espacamento + 50,
            y: linha * espacamento + 50
        };
    };

    const getStatusColor = (status: Sala['status']) => {
        switch (status) {
            case SalaStatus.LIVRE:
                return '#10B981'; // green-500
            case SalaStatus.OCUPADA:
                return '#EF4444'; // red-500
            case SalaStatus.MANUTENCAO:
                return '#F59E0B'; // yellow-500
            case SalaStatus.RESERVADA:
                return '#3B82F6'; // blue-500
            default:
                return '#6B7280'; // gray-500
        }
    };

    const handleZoomIn = () => {
        const newZoom = Math.min(zoom + 0.2, 2);
        setZoom(newZoom);
        onZoomChange?.(newZoom);
    };

    const handleZoomOut = () => {
        const newZoom = Math.max(zoom - 0.2, 0.5);
        setZoom(newZoom);
        onZoomChange?.(newZoom);
    };

    const resetView = () => {
        setZoom(1);
        setPosicao({ x: 0, y: 0 });
        onZoomChange?.(1);
    };

    const isSelected = (sala: Sala) => {
        return salaSelecionada?.id === sala.id;
    };

    if (andares.length === 0) {
        return (
            <div className="h-96 bg-gray-50 rounded-lg flex items-center justify-center">
                <div className="text-center">
                    <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma sala cadastrada</h3>
                    <p className="text-gray-500">Adicione salas para visualizá-las no mapa</p>
                </div>
            </div>
        );
    }

    const andarAtual = andares[andarAtivo];

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {/* Cabeçalho do mapa */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div className="flex items-center gap-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                        Mapa da Empresa
                    </h3>

                    {/* Navegação de andares */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setAndarAtivo(Math.max(0, andarAtivo - 1))}
                            disabled={andarAtivo === 0}
                            className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronUp className="w-4 h-4" />
                        </button>

                        <div className="flex items-center gap-2">
                            <Home className="w-4 h-4 text-gray-500" />
                            <span className="text-sm font-medium text-gray-700">
                {andarAtual.nome}
              </span>
                        </div>

                        <button
                            onClick={() => setAndarAtivo(Math.min(andares.length - 1, andarAtivo + 1))}
                            disabled={andarAtivo === andares.length - 1}
                            className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronDown className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Controles de zoom */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleZoomOut}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Zoom out"
                    >
                        <ZoomOut className="w-4 h-4" />
                    </button>

                    <span className="text-sm text-gray-600 min-w-12 text-center">
            {Math.round(zoom * 100)}%
          </span>

                    <button
                        onClick={handleZoomIn}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Zoom in"
                    >
                        <ZoomIn className="w-4 h-4" />
                    </button>

                    <button
                        onClick={resetView}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Reset view"
                    >
                        <RotateCcw className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Mapa/Canvas */}
            <div className="relative h-96 bg-gray-50 overflow-hidden">
                <div
                    className="absolute inset-0"
                    style={{
                        transform: `translate(${posicao.x}px, ${posicao.y}px) scale(${zoom})`,
                        transformOrigin: '0 0'
                    }}
                >
                    {/* Grade de fundo */}
                    <div
                        className="absolute inset-0 opacity-20"
                        style={{
                            backgroundImage: `
                linear-gradient(to right, #e5e7eb 1px, transparent 1px),
                linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)
              `,
                            backgroundSize: '40px 40px'
                        }}
                    />

                    {/* Desenho do andar (layout básico) */}
                    <div className="relative w-full h-full min-w-96 min-h-96">
                        {/* Paredes do andar */}
                        <div className="absolute inset-4 border-2 border-gray-300 rounded-lg bg-white/50" />

                        {/* Áreas comuns */}
                        <div className="absolute top-6 left-6 w-32 h-20 bg-blue-100 rounded border-2 border-blue-300 opacity-60">
                            <div className="p-2 text-xs text-blue-700 font-medium">Recepção</div>
                        </div>

                        <div className="absolute bottom-6 right-6 w-24 h-16 bg-green-100 rounded border-2 border-green-300 opacity-60">
                            <div className="p-2 text-xs text-green-700 font-medium">WC</div>
                        </div>

                        {/* Salas */}
                        {andarAtual.salas.map((sala, index) => {
                            const coords = gerarCoordenadas(sala, index);
                            const statusColor = getStatusColor(sala.status);

                            return (
                                <div
                                    key={sala.id}
                                    className={`
                    absolute cursor-pointer transition-all duration-200 hover:scale-105
                    ${isSelected(sala) ? 'scale-110 z-10' : 'hover:z-10'}
                  `}
                                    style={{
                                        left: coords.x,
                                        top: coords.y,
                                        width: 80,
                                        height: 60
                                    }}
                                    onClick={() => onSalaClick(sala)}
                                >
                                    {/* Sala */}
                                    <div
                                        className={`
                      w-full h-full border-2 rounded-lg shadow-sm transition-all
                      ${isSelected(sala) ? 'border-blue-500 shadow-lg' : 'border-gray-300'}
                      hover:border-gray-400
                    `}
                                        style={{
                                            backgroundColor: `${sala.cor}20`,
                                            borderColor: isSelected(sala) ? '#3B82F6' : sala.cor
                                        }}
                                    >
                                        {/* Nome da sala */}
                                        <div className="p-1 text-xs font-medium text-gray-800 truncate">
                                            {sala.nome}
                                        </div>

                                        {/* Capacidade e status */}
                                        <div className="absolute bottom-1 left-1 right-1 flex items-center justify-between">
                                            <div className="flex items-center gap-1">
                                                <Users className="w-3 h-3 text-gray-500" />
                                                <span className="text-xs text-gray-600">{sala.capacidade}</span>
                                            </div>

                                            {/* Indicador de status */}
                                            <div
                                                className="w-3 h-3 rounded-full border-2 border-white"
                                                style={{ backgroundColor: statusColor }}
                                                title={`Status: ${sala.status}`}
                                            />
                                        </div>
                                    </div>

                                    {/* Tooltip */}
                                    {isSelected(sala) && (
                                        <div className="absolute top-full left-0 mt-2 p-3 bg-white border border-gray-200 rounded-lg shadow-lg min-w-48 z-20">
                                            <h4 className="font-medium text-gray-900 mb-2">{sala.nome}</h4>
                                            <div className="space-y-1 text-sm text-gray-600">
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="w-3 h-3" />
                                                    <span>{sala.localizacao}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Users className="w-3 h-3" />
                                                    <span>{sala.capacidade} pessoas</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div
                                                        className="w-3 h-3 rounded-full"
                                                        style={{ backgroundColor: statusColor }}
                                                    />
                                                    <span className="capitalize">{sala.status}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Legenda */}
            <div className="p-4 border-t border-gray-200 bg-gray-50">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Status das Salas</h4>
                <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                        <span className="text-sm text-gray-600">Disponível</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                        <span className="text-sm text-gray-600">Ocupada</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-yellow-500" />
                        <span className="text-sm text-gray-600">Manutenção</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500" />
                        <span className="text-sm text-gray-600">Reservada</span>
                    </div>
                </div>

                <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
                    <Building className="w-4 h-4" />
                    <span>{andarAtual.salas.length} salas neste andar</span>
                    <span>•</span>
                    <span>Total: {salas.length} salas</span>
                </div>
            </div>
        </div>
    );
};