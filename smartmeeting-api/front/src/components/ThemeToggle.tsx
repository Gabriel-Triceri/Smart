import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext'; // Importa o hook useTheme

export default function ThemeToggle() {
    const { theme, toggleTheme } = useTheme(); // Usa o hook para obter o tema e a função de alternância

    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            aria-label="Toggle theme"
        >
            {theme === 'dark' ? (
                <Sun className="h-5 w-5 text-gray-700 dark:text-gray-300" />
            ) : (
                <Moon className="h-5 w-5 text-gray-700 dark:text-gray-300" />
            )}
        </button>
    );
}
