import { useState, useEffect } from 'react';
import { X, User, Mail, Lock, Save, Loader2, Eye, EyeOff, Shield, CheckCircle2 } from 'lucide-react';
import { authService } from '../../services/authService';
import api from '../../services/httpClient';

interface ProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface ProfileFormData {
    nome: string;
    email: string;
}

interface PasswordFormData {
    senhaAtual: string;
    novaSenha: string;
    confirmarSenha: string;
}

type Tab = 'perfil' | 'senha';

export function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
    const [tab, setTab] = useState<Tab>('perfil');
    const [loadingProfile, setLoadingProfile] = useState(false);
    const [loadingPassword, setLoadingPassword] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const userInfo = authService.getUserInfo();

    const [profileData, setProfileData] = useState<ProfileFormData>({
        nome: userInfo.name ?? '',
        email: userInfo.email ?? '',
    });

    const [passwordData, setPasswordData] = useState<PasswordFormData>({
        senhaAtual: '',
        novaSenha: '',
        confirmarSenha: '',
    });

    const [showSenhaAtual, setShowSenhaAtual] = useState(false);
    const [showNovaSenha, setShowNovaSenha] = useState(false);
    const [showConfirmar, setShowConfirmar] = useState(false);

    useEffect(() => {
        if (isOpen) {
            const info = authService.getUserInfo();
            setProfileData({ nome: info.name ?? '', email: info.email ?? '' });
            setPasswordData({ senhaAtual: '', novaSenha: '', confirmarSenha: '' });
            setSuccessMessage('');
            setErrorMessage('');
        }
    }, [isOpen]);

    const showFeedback = (msg: string, isError = false) => {
        if (isError) setErrorMessage(msg);
        else setSuccessMessage(msg);
        setTimeout(() => { setSuccessMessage(''); setErrorMessage(''); }, 3500);
    };

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!profileData.nome.trim()) { showFeedback('Nome é obrigatório', true); return; }
        setLoadingProfile(true);
        try {
            await api.put(`/pessoas/${userInfo.id}`, {
                nome: profileData.nome.trim(),
                email: profileData.email.trim(),
            });
            showFeedback('Perfil atualizado com sucesso!');
        } catch (err: any) {
            showFeedback(err.response?.data?.message ?? 'Erro ao atualizar perfil', true);
        } finally {
            setLoadingProfile(false);
        }
    };

    const handleSavePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!passwordData.senhaAtual) { showFeedback('Senha atual é obrigatória', true); return; }
        if (passwordData.novaSenha.length < 6) { showFeedback('Nova senha deve ter pelo menos 6 caracteres', true); return; }
        if (passwordData.novaSenha !== passwordData.confirmarSenha) { showFeedback('As senhas não coincidem', true); return; }
        setLoadingPassword(true);
        try {
            await api.put('/auth/change-password', {
                senhaAtual: passwordData.senhaAtual,
                novaSenha: passwordData.novaSenha,
            });
            setPasswordData({ senhaAtual: '', novaSenha: '', confirmarSenha: '' });
            showFeedback('Senha alterada com sucesso!');
        } catch (err: any) {
            showFeedback(err.response?.data?.message ?? 'Erro ao alterar senha', true);
        } finally {
            setLoadingPassword(false);
        }
    };

    if (!isOpen) return null;

    const initials = authService.getUserInitials();
    const roles = userInfo.roles;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-lg bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-accent-500 dark:bg-accent-600 flex items-center justify-center text-white text-lg font-bold shadow-md">
                            {initials}
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Meu Perfil</h2>
                            <div className="flex flex-wrap gap-1 mt-0.5">
                                {roles.map(role => (
                                    <span key={role} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                                        {role === 'ADMIN' && <Shield className="w-3 h-3" />}
                                        {role}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-slate-100 dark:border-slate-700 px-6">
                    {([
                        { id: 'perfil', label: 'Dados Pessoais', icon: User },
                        { id: 'senha', label: 'Alterar Senha', icon: Lock },
                    ] as { id: Tab; label: string; icon: React.ElementType }[]).map(t => (
                        <button
                            key={t.id}
                            onClick={() => { setTab(t.id); setSuccessMessage(''); setErrorMessage(''); }}
                            className={`flex items-center gap-2 py-3 px-1 mr-6 text-sm font-medium border-b-2 transition-colors ${tab === t.id ? 'border-blue-600 text-blue-600 dark:text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
                        >
                            <t.icon className="w-4 h-4" />
                            {t.label}
                        </button>
                    ))}
                </div>

                {/* Feedback */}
                {(successMessage || errorMessage) && (
                    <div className={`mx-6 mt-4 px-4 py-3 rounded-lg flex items-center gap-2 text-sm font-medium ${successMessage ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400' : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'}`}>
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        {successMessage || errorMessage}
                    </div>
                )}

                {/* Tab: Perfil */}
                {tab === 'perfil' && (
                    <form onSubmit={handleSaveProfile} className="p-6 space-y-5">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                Nome completo <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    value={profileData.nome}
                                    onChange={e => setProfileData(p => ({ ...p, nome: e.target.value }))}
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900 dark:text-white"
                                    placeholder="Seu nome completo"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                E-mail
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="email"
                                    value={profileData.email}
                                    onChange={e => setProfileData(p => ({ ...p, email: e.target.value }))}
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900 dark:text-white"
                                    placeholder="seu@email.com"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end pt-2">
                            <button
                                type="submit"
                                disabled={loadingProfile}
                                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium shadow-sm transition-all disabled:opacity-60"
                            >
                                {loadingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                Salvar Alterações
                            </button>
                        </div>
                    </form>
                )}

                {/* Tab: Senha */}
                {tab === 'senha' && (
                    <form onSubmit={handleSavePassword} className="p-6 space-y-5">
                        {[
                            { key: 'senhaAtual', label: 'Senha atual', show: showSenhaAtual, toggle: () => setShowSenhaAtual(v => !v) },
                            { key: 'novaSenha', label: 'Nova senha', show: showNovaSenha, toggle: () => setShowNovaSenha(v => !v) },
                            { key: 'confirmarSenha', label: 'Confirmar nova senha', show: showConfirmar, toggle: () => setShowConfirmar(v => !v) },
                        ].map(field => (
                            <div key={field.key}>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                    {field.label} <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type={field.show ? 'text' : 'password'}
                                        value={(passwordData as any)[field.key]}
                                        onChange={e => setPasswordData(p => ({ ...p, [field.key]: e.target.value }))}
                                        className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900 dark:text-white"
                                        placeholder="••••••••"
                                    />
                                    <button type="button" onClick={field.toggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                                        {field.show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                        ))}

                        <p className="text-xs text-slate-500 dark:text-slate-400">A nova senha deve ter pelo menos 6 caracteres.</p>

                        <div className="flex justify-end pt-2">
                            <button
                                type="submit"
                                disabled={loadingPassword}
                                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium shadow-sm transition-all disabled:opacity-60"
                            >
                                {loadingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                Alterar Senha
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}