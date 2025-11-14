import React, { useState, useEffect } from 'react';
import {
  Calendar, Clock, MapPin, Video, FileText,
  Save, X, Loader2
} from 'lucide-react';
import { ParticipanteAutocomplete } from './ParticipanteAutocomplete';
import { ReuniaoFormData, Participante, Sala, ReuniaoCreateDTO } from '../types/meetings';
import { meetingsApi } from '../services/meetingsApi';

interface MeetingFormProps {
  initialData?: Partial<ReuniaoFormData>;
  onSubmit: (data: ReuniaoCreateDTO) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export const MeetingForm: React.FC<MeetingFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const [formData, setFormData] = useState<ReuniaoFormData>({
    titulo: '',
    descricao: '',
    data: '',
    horaInicio: '',
    horaFim: '',
    salaId: '',
    participantes: [],
    tipo: 'presencial',
    prioridade: 'media',
    // linkReuniao: '', // Removed
    lembretes: true,
    observacoes: '',
    ata: ''
  });

  const [participantesSelecionados, setParticipantesSelecionados] = useState<Participante[]>([]);
  const [salas, setSalas] = useState<Sala[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isValidating, setIsValidating] = useState(false);

  // Carregar dados iniciais
  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({ ...prev, ...initialData }));
      if (initialData.participantes) {
        setParticipantesSelecionados([]);
      }
    }

    loadSalas();
  }, [initialData]);

  const loadSalas = async () => {
    try {
      const salasData = await meetingsApi.getSalasDisponiveis('2025-11-14', '08:00', '18:00');
      setSalas(salasData);
    } catch (error) {
      console.error('Erro ao carregar salas:', error);
    }
  };

  // Validação em tempo real
  const validateField = (name: string, value: any): string => {
    switch (name) {
      case 'titulo':
        return !value.trim() ? 'Título é obrigatório' : '';
      case 'data':
        if (!value) return 'Data é obrigatória';
        const selectedDate = new Date(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return selectedDate < today ? 'Não é possível agendar reuniões no passado' : '';
      case 'horaInicio':
        return !value ? 'Horário de início é obrigatório' : '';
      case 'horaFim':
        if (!value) return 'Horário de fim é obrigatório';
        if (formData.horaInicio && value <= formData.horaInicio) {
          return 'Horário de fim deve ser posterior ao início';
        }
        return '';
      case 'salaId':
        return !value ? 'Selecione uma sala' : '';
      default:
        return '';
    }
  };

  const handleInputChange = (name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));

    setTimeout(() => {
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }, 300);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    Object.keys(formData).forEach(key => {
      const error = validateField(key, (formData as any)[key]);
      if (error) newErrors[key] = error;
    });

    if (formData.horaInicio && formData.horaFim) {
      const inicio = new Date(`${formData.data}T${formData.horaInicio}`);
      const fim = new Date(`${formData.data}T${formData.horaFim}`);
      const duracao = (fim.getTime() - inicio.getTime()) / (1000 * 60);

      if (duracao < 15) {
        newErrors.horaFim = 'Reunião deve ter pelo menos 15 minutos';
      } else if (duracao > 480) {
        newErrors.horaFim = 'Reunião não pode exceder 8 horas';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsValidating(true);
    try {
      const dataHoraInicio = `${formData.data}T${formData.horaInicio}:00`;

      const inicio = new Date(`${formData.data}T${formData.horaInicio}`);
      const fim = new Date(`${formData.data}T${formData.horaFim}`);
      const duracaoMinutos = (fim.getTime() - inicio.getTime()) / (1000 * 60);

      const payload: ReuniaoCreateDTO = {
        pauta: formData.titulo,
        descricao: formData.descricao,
        dataHoraInicio: dataHoraInicio,
        duracaoMinutos: duracaoMinutos,
        salaId: formData.salaId,
        participantes: participantesSelecionados.map(p => p.id),
        tipo: formData.tipo,
        prioridade: formData.prioridade,
        lembretes: formData.lembretes,
        observacoes: formData.observacoes,
        ata: formData.ata,
        status: 'AGENDADA', // Automatically set status to 'agendada'
      };

      await onSubmit(payload);
    } catch (error) {
      console.error('Erro ao salvar reunião:', error);
    } finally {
      setIsValidating(false);
    }
  };

  const selectedSala = salas.find(s => s.id === formData.salaId);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {initialData ? 'Editar Reunião' : 'Nova Reunião'}
        </h2>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Título */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Título da Reunião *
          </label>
          <input
            type="text"
            value={formData.titulo}
            onChange={(e) => handleInputChange('titulo', e.target.value)}
            placeholder="Digite o título da reunião"
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent
                     dark:bg-gray-700 dark:text-white placeholder-gray-500 dark:placeholder-gray-400
                     ${errors.titulo ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}
                     transition-colors`}
          />
          {errors.titulo && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.titulo}</p>
          )}
        </div>

        {/* Descrição */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Descrição
          </label>
          <textarea
            value={formData.descricao}
            onChange={(e) => handleInputChange('descricao', e.target.value)}
            placeholder="Descreva o objetivo da reunião"
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg
                     focus:ring-2 focus:ring-blue-500 focus:border-transparent
                     dark:bg-gray-700 dark:text-white placeholder-gray-500 dark:placeholder-gray-400
                     transition-colors"
          />
        </div>

        {/* Data e Horários */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Calendar className="inline w-4 h-4 mr-1" />
              Data *
            </label>
            <input
              type="date"
              value={formData.data}
              onChange={(e) => handleInputChange('data', e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent
                       dark:bg-gray-700 dark:text-white
                       ${errors.data ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}
                       transition-colors`}
            />
            {errors.data && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.data}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Clock className="inline w-4 h-4 mr-1" />
              Início *
            </label>
            <input
              type="time"
              value={formData.horaInicio}
              onChange={(e) => handleInputChange('horaInicio', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent
                       dark:bg-gray-700 dark:text-white
                       ${errors.horaInicio ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}
                       transition-colors`}
            />
            {errors.horaInicio && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.horaInicio}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Clock className="inline w-4 h-4 mr-1" />
              Fim *
            </label>
            <input
              type="time"
              value={formData.horaFim}
              onChange={(e) => handleInputChange('horaFim', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent
                       dark:bg-gray-700 dark:text-white
                       ${errors.horaFim ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}
                       transition-colors`}
            />
            {errors.horaFim && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.horaFim}</p>
            )}
          </div>
        </div>

        {/* Tipo e Prioridade */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tipo de Reunião
            </label>
            <select
              value={formData.tipo}
              onChange={(e) => handleInputChange('tipo', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg
                       focus:ring-2 focus:ring-blue-500 focus:border-transparent
                       dark:bg-gray-700 dark:text-white transition-colors"
            >
              <option value="presencial">Presencial</option>
              <option value="online">Online</option>
              <option value="hibrida">Híbrida</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Prioridade
            </label>
            <select
              value={formData.prioridade}
              onChange={(e) => handleInputChange('prioridade', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg
                       focus:ring-2 focus:ring-blue-500 focus:border-transparent
                       dark:bg-gray-700 dark:text-white transition-colors"
            >
              <option value="baixa">Baixa</option>
              <option value="media">Média</option>
              <option value="alta">Alta</option>
              <option value="critica">Crítica</option>
            </select>
          </div>
        </div>

        {/* Sala */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <MapPin className="inline w-4 h-4 mr-1" />
            Sala *
          </label>
          <select
            value={formData.salaId}
            onChange={(e) => handleInputChange('salaId', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent
                     dark:bg-gray-700 dark:text-white transition-colors
                     ${errors.salaId ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
          >
            <option value="">Selecione uma sala</option>
            {salas.map((sala) => (
              <option key={sala.id} value={sala.id}>
                {sala.nome} (Capacidade: {sala.capacidade}) - {sala.localizacao}
              </option>
            ))}
          </select>
          {errors.salaId && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.salaId}</p>
          )}
          {selectedSala && (
            <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-1">
                {selectedSala.nome}
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Capacidade: {selectedSala.capacidade} pessoas
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Equipamentos: {selectedSala.equipamentos.join(', ')}
              </p>
            </div>
          )}
        </div>

        {/* Participantes */}
        <div>
          <ParticipanteAutocomplete
            value={participantesSelecionados}
            onChange={setParticipantesSelecionados}
            placeholder="Buscar participantes..."
          />
        </div>

        {/* Lembretes e Observações */}
        <div className="space-y-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="lembretes"
              checked={formData.lembretes}
              onChange={(e) => handleInputChange('lembretes', e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="lembretes" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              Enviar lembretes automáticos
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <FileText className="inline w-4 h-4 mr-1" />
              Observações
            </label>
            <textarea
              value={formData.observacoes}
              onChange={(e) => handleInputChange('observacoes', e.target.value)}
              placeholder="Observações adicionais..."
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg
                       focus:ring-2 focus:ring-blue-500 focus:border-transparent
                       dark:bg-gray-700 dark:text-white placeholder-gray-500 dark:placeholder-gray-400
                       transition-colors"
            />
          </div>

          {/* Ata da Reunião */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <FileText className="inline w-4 h-4 mr-1" />
              Ata da Reunião
            </label>
            <textarea
              value={formData.ata}
              onChange={(e) => handleInputChange('ata', e.target.value)}
              placeholder="Registre a ata da reunião aqui..."
              rows={5}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg
                       focus:ring-2 focus:ring-blue-500 focus:border-transparent
                       dark:bg-gray-700 dark:text-white placeholder-gray-500 dark:placeholder-gray-400
                       transition-colors"
            />
          </div>
        </div>

        {/* Botões */}
        <div className="flex justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700
                     hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isLoading || isValidating}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg
                     transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                     flex items-center gap-2"
          >
            {(isLoading || isValidating) ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {isLoading ? 'Salvando...' : 'Salvar Reunião'}
          </button>
        </div>
      </form>
    </div>
  );
};