import { createBrowserRouter, Navigate } from 'react-router';
import { MainLayout } from './components/MainLayout';
import { Dashboard } from './pages/Dashboard';
import { FluxoCaixa } from './pages/FluxoCaixa';
import { ContasReceber } from './pages/ContasReceber';
import { ContasPagar } from './pages/ContasPagar';
import { ContasBancarias } from './pages/ContasBancarias';
import { Clientes } from './pages/Clientes';
import { Categorias } from './pages/Categorias';
import { DRE } from './pages/DRE';
import { Historico } from './pages/Historico';
import { ScoreFinanceiro } from './pages/ScoreFinanceiro';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { useAuth } from './context/AuthContext';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/register',
    element: <Register />,
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <MainLayout><Dashboard /></MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/fluxo-caixa',
    element: (
      <ProtectedRoute>
        <MainLayout><FluxoCaixa /></MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/contas-receber',
    element: (
      <ProtectedRoute>
        <MainLayout><ContasReceber /></MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/contas-pagar',
    element: (
      <ProtectedRoute>
        <MainLayout><ContasPagar /></MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/contas-bancarias',
    element: (
      <ProtectedRoute>
        <MainLayout><ContasBancarias /></MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/clientes',
    element: (
      <ProtectedRoute>
        <MainLayout><Clientes /></MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/categorias',
    element: (
      <ProtectedRoute>
        <MainLayout><Categorias /></MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/dre',
    element: (
      <ProtectedRoute>
        <MainLayout><DRE /></MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/historico',
    element: (
      <ProtectedRoute>
        <MainLayout><Historico /></MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/score',
    element: (
      <ProtectedRoute>
        <MainLayout><ScoreFinanceiro /></MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '*',
    element: <Navigate to="/dashboard" replace />,
  },
]);