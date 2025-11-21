import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await authService.login(email, password);
            navigate('/'); // Redireciona para a página inicial após o login
        } catch (err) {
            setError('Failed to login. Please check your credentials.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-mono-50 dark:bg-mono-900">
            <div className="p-8 bg-white dark:bg-mono-800 rounded-lg shadow-sm border border-mono-200 dark:border-mono-700 w-96">
                <h2 className="text-2xl font-bold mb-6 text-center text-mono-900 dark:text-mono-100">Login</h2>
                <form onSubmit={handleLogin}>
                    <div className="mb-4">
                        <label className="block text-mono-700 dark:text-mono-300 mb-2 font-medium" htmlFor="email">
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-3 py-2.5 border border-mono-300 dark:border-mono-600 rounded-lg bg-white dark:bg-mono-700 text-mono-900 dark:text-mono-100 focus:outline-none focus:ring-1 focus:ring-mono-400 dark:focus:ring-mono-500 focus:border-mono-400 dark:focus:border-mono-500 transition-colors"
                            required
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-mono-700 dark:text-mono-300 mb-2 font-medium" htmlFor="password">
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-3 py-2.5 border border-mono-300 dark:border-mono-600 rounded-lg bg-white dark:bg-mono-700 text-mono-900 dark:text-mono-100 focus:outline-none focus:ring-1 focus:ring-mono-400 dark:focus:ring-mono-500 focus:border-mono-400 dark:focus:border-mono-500 transition-colors"
                            required
                        />
                    </div>
                    {error && <p className="text-red-600 dark:text-red-400 text-center mb-4 text-sm">{error}</p>}
                    <button
                        type="submit"
                        className="w-full bg-accent-500 text-white py-2.5 rounded-lg hover:bg-accent-600 disabled:bg-mono-400 transition-colors font-medium"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Logging in...' : 'Login'}
                    </button>
                </form>
            </div>
        </div>
    );
}
