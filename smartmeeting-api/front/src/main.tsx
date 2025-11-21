import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App.tsx';
import LoginPage from './pages/Login.tsx';
import ProtectedRoute from './components/common/ProtectedRoute';
import { ThemeProvider } from './context/ThemeContext.tsx'; // Importa ThemeProvider

import './index.css';

const router = createBrowserRouter(
    [
        {
            path: '/',
            element: <ProtectedRoute />,
            children: [
                {
                    path: '/',
                    element: <App />,
                },
            ],
        },
        {
            path: '/login',
            element: <LoginPage />,
        },
    ]
);



ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <ThemeProvider> {/* Envolve a aplicação com ThemeProvider */}
            <RouterProvider router={router} />
        </ThemeProvider>
    </React.StrictMode>
);
