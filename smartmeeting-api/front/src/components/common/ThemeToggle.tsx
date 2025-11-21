import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext'; // Importa o hook useTheme

export default function ThemeToggle() {
    const { theme, toggleTheme } = useTheme(); // Usa o hook para obter o tema e a função de alternância

    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-mono-50 dark:bg-mono-700 hover:bg-mono-100 dark:hover:bg-mono-600 transition-colors border border-mono-200 dark:border-mono-600"
            aria-label="Toggle theme"
        >
            {theme === 'dark' ? (
                <Sun className="h-5 w-5 text-mono-700 dark:text-mono-300" />
            ) : (
                <Moon className="h-5 w-5 text-mono-700 dark:text-mono-300" />
            )}
        </button>
    );
}
