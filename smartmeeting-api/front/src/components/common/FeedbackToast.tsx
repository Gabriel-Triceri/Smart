import { AlertCircle, CheckCircle2, X } from 'lucide-react';

export type FeedbackTone = 'error' | 'success';

interface FeedbackToastProps {
    message: string;
    tone?: FeedbackTone;
    onClose: () => void;
}

const TONE_STYLES: Record<FeedbackTone, { wrapper: string; text: string; icon: typeof AlertCircle }> = {
    error: {
        wrapper: 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800',
        text: 'text-red-700 dark:text-red-300',
        icon: AlertCircle,
    },
    success: {
        wrapper: 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800',
        text: 'text-emerald-700 dark:text-emerald-300',
        icon: CheckCircle2,
    },
};

/**
 * Aviso não-bloqueante, no lugar dos alert() nativos que travavam a interface
 * e destoavam do resto da UI.
 */
export function FeedbackToast({ message, tone = 'error', onClose }: FeedbackToastProps) {
    if (!message) return null;

    const style = TONE_STYLES[tone];
    const Icon = style.icon;

    return (
        <div
            role="status"
            className={`fixed bottom-4 right-4 z-[60] max-w-sm flex items-start gap-3 px-4 py-3 border rounded-lg shadow-lg ${style.wrapper}`}
        >
            <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${style.text}`} />
            <span className={`text-sm ${style.text}`}>{message}</span>
            <button
                onClick={onClose}
                aria-label="Fechar aviso"
                className={`shrink-0 p-0.5 rounded hover:bg-black/5 dark:hover:bg-white/10 transition-colors ${style.text}`}
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
}

export default FeedbackToast;
