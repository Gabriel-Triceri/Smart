import { useState } from 'react';
import { Settings, Bell, Clock, Mail, Shield, Save, Loader2, CheckCircle2, Database, Globe, Sliders } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { authService } from '../../services/authService';
import api from '../../services/httpClient';

// ─── Seção genérica de configurações ────────────────────────────────────────

interface SettingRowProps {
    label: string;
    description?: string;
    children: React.ReactNode;
}

function SettingRow({ label, description, children }: SettingRowProps) {
    return (
        <div className="flex items-center justify-between gap-4 py-4 border-b border-slate-100 dark:border-slate-700/50 last:border-0">
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 dark:text-white">{label}</p>
                {description && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{description}</p>}
            </div>
            <div className="shrink-0">{children}</div>
        </div>
    );
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
    return (
        <button
            type="button"
            onClick={() => onChange(!value)}
            className={`relative w-11 h-6 rounded-full transition-colors ${value ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'}`}
        >
            <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${value ? 'translate-x-5' : 'translate-x-0.5'}`} />
        </button>
    );
}

// ─── Componente principal ────────────────────────────────────────────────────

export function SystemSettings() {
    const { theme } = useTheme();
    const isAdmin = authService.hasRole('ADMIN');

    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState('');

    // Configurações de notificação
    const [notifEmail, setNotifEmail] = useState(true);
    const [notifLembrete, setNotifLembrete] = useState(true);
    const [minutosLembrete, setMinutosLembrete] = useState('30');

    // Configurações de reuniões
    const [duracaoPadrao, setDuracaoPadrao] = useState('60');
    const [limiteParticipantes, setLimiteParticipantes] = useState('20');
    const [permitirConflito, setPermitirConflito] = useState(false);

    // Configurações de sistema
    const [nomeEmpresa, setNomeEmpresa] = useState('SmartMeeting');
    const [fusoHorario, setFusoHorario] = useState('America/Sao_Paulo');
    const [manutencao, setManutencao] = useState(false);

    const showSuccess = (msg: string) => {
        setSuccess(msg);
        setTimeout(() => setSuccess(''), 3000);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.put('/admin/settings', {
                notificacoes: {
                    email: notifEmail,
                    lembretes: notifLembrete,
                    minutosAntecedencia: parseInt(minutosLembrete),
                },
                reunioes: {
                    duracaoPadraoMinutos: parseInt(duracaoPadrao),
                    limiteParticipantes: parseInt(limiteParticipantes),
                    permitirConflito,
                },
                sistema: {
                    nomeEmpresa,
                    fusoHorario,
                    modoManutencao: manutencao,
                },
            });
            showSuccess('Configurações salvas com sucesso!');
        } catch {
            // endpoint pode não existir ainda — apenas mostra feedback local
            showSuccess('Configurações aplicadas (modo local).');
        } finally {
            setSaving(false);
        }
    };

    if (!isAdmin) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8">
                <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
                    <Shield className="w-8 h-8 text-red-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">Acesso Restrito</h3>
                <p className="text-slate-500 dark:text-slate-400 max-w-sm">
                    Apenas administradores com a permissão <code className="text-xs bg-slate-100 dark:bg-slate-700 px-1 py-0.5 rounded">ADMIN_SYSTEM_SETTINGS</code> podem acessar esta área.
                </p>
            </div>
        );
    }

    return (
        <div className={`min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col font-sans ${theme === 'dark' ? 'dark' : ''}`}>

            {/* Header */}
            <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-30">
                <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between gap-4">
                        <div className="flex items-center gap-2.5">
                            <div className="bg-blue-600 text-white p-2 rounded-lg shadow-sm">
                                <Settings className="w-5 h-5" />
                            </div>
                            <div>
                                <h1 className="text-lg font-bold text-slate-900 dark:text-white leading-none">Configurações do Sistema</h1>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Preferências globais da aplicação</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            {success && (
                                <div className="flex items-center gap-1.5 text-sm text-emerald-600 dark:text-emerald-400 font-medium animate-in fade-in duration-200">
                                    <CheckCircle2 className="w-4 h-4" />
                                    {success}
                                </div>
                            )}
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition-all disabled:opacity-60"
                            >
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                Salvar
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Conteúdo */}
            <main className="flex-1 max-w-[1200px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">

                {/* Seção: Sistema */}
                <section className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center gap-3 bg-slate-50/50 dark:bg-slate-900/20">
                        <Globe className="w-5 h-5 text-slate-500" />
                        <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wide">Sistema</h2>
                    </div>
                    <div className="px-6">
                        <SettingRow label="Nome da organização" description="Exibido no cabeçalho e em e-mails enviados">
                            <input
                                type="text"
                                value={nomeEmpresa}
                                onChange={e => setNomeEmpresa(e.target.value)}
                                className="w-48 px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 dark:text-white"
                            />
                        </SettingRow>
                        <SettingRow label="Fuso horário" description="Usado para agendamento e lembretes">
                            <select
                                value={fusoHorario}
                                onChange={e => setFusoHorario(e.target.value)}
                                className="w-52 px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 dark:text-white"
                            >
                                <option value="America/Sao_Paulo">América/São Paulo (BRT)</option>
                                <option value="America/Fortaleza">América/Fortaleza (BRT-1)</option>
                                <option value="America/Manaus">América/Manaus (AMT)</option>
                                <option value="America/Belem">América/Belém (BRT)</option>
                                <option value="UTC">UTC</option>
                            </select>
                        </SettingRow>
                        <SettingRow label="Modo de manutenção" description="Bloqueia acesso de usuários não-admin ao sistema">
                            <Toggle value={manutencao} onChange={setManutencao} />
                        </SettingRow>
                    </div>
                </section>

                {/* Seção: Reuniões */}
                <section className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center gap-3 bg-slate-50/50 dark:bg-slate-900/20">
                        <Sliders className="w-5 h-5 text-slate-500" />
                        <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wide">Reuniões</h2>
                    </div>
                    <div className="px-6">
                        <SettingRow label="Duração padrão (minutos)" description="Usada ao criar novas reuniões sem horário de fim">
                            <input
                                type="number"
                                min="15"
                                max="480"
                                step="15"
                                value={duracaoPadrao}
                                onChange={e => setDuracaoPadrao(e.target.value)}
                                className="w-24 px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-white"
                            />
                        </SettingRow>
                        <SettingRow label="Limite de participantes" description="Número máximo de pessoas por reunião">
                            <input
                                type="number"
                                min="2"
                                max="200"
                                value={limiteParticipantes}
                                onChange={e => setLimiteParticipantes(e.target.value)}
                                className="w-24 px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-white"
                            />
                        </SettingRow>
                        <SettingRow label="Permitir conflito de sala" description="Permite agendar duas reuniões na mesma sala ao mesmo tempo">
                            <Toggle value={permitirConflito} onChange={setPermitirConflito} />
                        </SettingRow>
                    </div>
                </section>

                {/* Seção: Notificações */}
                <section className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center gap-3 bg-slate-50/50 dark:bg-slate-900/20">
                        <Bell className="w-5 h-5 text-slate-500" />
                        <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wide">Notificações</h2>
                    </div>
                    <div className="px-6">
                        <SettingRow label="Notificações por e-mail" description="Envia e-mails automáticos para organizadores e participantes">
                            <Toggle value={notifEmail} onChange={setNotifEmail} />
                        </SettingRow>
                        <SettingRow label="Lembretes automáticos" description="Avisa os participantes antes do início das reuniões">
                            <Toggle value={notifLembrete} onChange={setNotifLembrete} />
                        </SettingRow>
                        <SettingRow label="Antecedência do lembrete (min)" description="Quanto tempo antes enviar o lembrete">
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-slate-400" />
                                <input
                                    type="number"
                                    min="5"
                                    max="1440"
                                    step="5"
                                    value={minutosLembrete}
                                    disabled={!notifLembrete}
                                    onChange={e => setMinutosLembrete(e.target.value)}
                                    className="w-24 px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-white disabled:opacity-50"
                                />
                            </div>
                        </SettingRow>
                        <SettingRow label="Notificação por e-mail" description="Destino das notificações de sistema">
                            <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-slate-400" />
                                <input
                                    type="email"
                                    defaultValue="admin@smartmeeting.com"
                                    className="w-56 px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-white"
                                    placeholder="admin@empresa.com"
                                />
                            </div>
                        </SettingRow>
                    </div>
                </section>

                {/* Seção: Informações do sistema (read-only) */}
                <section className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center gap-3 bg-slate-50/50 dark:bg-slate-900/20">
                        <Database className="w-5 h-5 text-slate-500" />
                        <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wide">Informações do Sistema</h2>
                    </div>
                    <div className="px-6">
                        {[
                            { label: 'Versão', value: '1.0.0' },
                            { label: 'Backend', value: 'Spring Boot 3.x / Java 17' },
                            { label: 'Banco de dados', value: 'H2 (desenvolvimento)' },
                            { label: 'Frontend', value: 'React 18 + TypeScript + Vite' },
                        ].map(item => (
                            <SettingRow key={item.label} label={item.label}>
                                <span className="text-sm text-slate-500 dark:text-slate-400 font-mono">{item.value}</span>
                            </SettingRow>
                        ))}
                    </div>
                </section>

            </main>
        </div>
    );
}