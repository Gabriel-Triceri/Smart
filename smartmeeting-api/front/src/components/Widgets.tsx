import { Calendar, Clock, Users, MapPin, AlertCircle, CheckCircle, XCircle, Info } from 'lucide-react';
import type { ReuniaoHoje, ProximaReuniao, Alerta } from '../types/dashboard';

interface TodayMeetingsWidgetProps {
  meetings: ReuniaoHoje[];
  loading?: boolean;
}

export function TodayMeetingsWidget({ meetings, loading }: TodayMeetingsWidgetProps) {
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Reuniões de Hoje
        </h3>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse">
              <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const statusColors = {
    agendada: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    'em-andamento': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    concluida: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400',
    cancelada: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  };

  const statusLabels = {
    agendada: 'Agendada',
    'em-andamento': 'Em Andamento',
    concluida: 'Concluída',
    cancelada: 'Cancelada',
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Reuniões de Hoje
        </h3>
        <Calendar className="h-5 w-5 text-gray-400" />
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {meetings.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            Nenhuma reunião agendada para hoje
          </p>
        ) : (
          meetings.map(meeting => (
            <div
              key={meeting.id}
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-gray-900 dark:text-white">
                  {meeting.titulo}
                </h4>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[meeting.status]}`}>
                  {statusLabels[meeting.status]}
                </span>
              </div>
              
              <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{meeting.horario}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>{meeting.sala}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>{meeting.participantes} participantes</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

interface UpcomingMeetingsWidgetProps {
  meetings: ProximaReuniao[];
  loading?: boolean;
}

export function UpcomingMeetingsWidget({ meetings, loading }: UpcomingMeetingsWidgetProps) {
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Próximas Reuniões
        </h3>
        <div className="space-y-3">
          {[1, 2].map(i => (
            <div key={i} className="animate-pulse">
              <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Próximas Reuniões
        </h3>
        <Clock className="h-5 w-5 text-gray-400" />
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {meetings.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            Nenhuma reunião próxima
          </p>
        ) : (
          meetings.map(meeting => (
            <div
              key={meeting.id}
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-purple-300 dark:hover:border-purple-600 transition-colors"
            >
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                {meeting.titulo}
              </h4>
              
              <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(meeting.dataHora).toLocaleDateString('pt-BR')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{meeting.horario}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>{meeting.sala}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>{meeting.participantes} participantes • {meeting.organizador}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

interface AlertsWidgetProps {
  alerts: Alerta[];
  loading?: boolean;
}

export function AlertsWidget({ alerts, loading }: AlertsWidgetProps) {
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Alertas
        </h3>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse">
              <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const alertIcons = {
    info: Info,
    warning: AlertCircle,
    error: XCircle,
    success: CheckCircle,
  };

  const alertColors = {
    info: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    warning: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    error: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    success: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  };

  const unreadAlerts = alerts.filter(a => !a.lido);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Alertas
        </h3>
        {unreadAlerts.length > 0 && (
          <span className="px-2 py-1 bg-red-500 text-white text-xs font-medium rounded-full">
            {unreadAlerts.length}
          </span>
        )}
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {alerts.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            Nenhum alerta no momento
          </p>
        ) : (
          alerts.map(alert => {
            const Icon = alertIcons[alert.tipo];
            return (
              <div
                key={alert.id}
                className={`p-3 rounded-lg ${alertColors[alert.tipo]} ${!alert.lido ? 'ring-2 ring-offset-2 ring-blue-500' : ''}`}
              >
                <div className="flex items-start gap-3">
                  <Icon className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{alert.mensagem}</p>
                    <p className="text-xs opacity-75 mt-1">
                      {new Date(alert.timestamp).toLocaleString('pt-BR')}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
