import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App.tsx';
import LoginPage from './pages/Login.tsx';
import NotFoundPage from './pages/NotFoundPage.tsx';   // FIX #11
import ProtectedRoute from './components/common/ProtectedRoute';
import { ThemeProvider } from './context/ThemeContext.tsx';

import './index.css';

const router = createBrowserRouter([
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
    // FIX #11: rota catch-all — qualquer URL não reconhecida exibe a página 404
    {
        path: '*',
        element: <NotFoundPage />,
    },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <ThemeProvider>
            <RouterProvider router={router} />
        </ThemeProvider>
    </React.StrictMode>
);