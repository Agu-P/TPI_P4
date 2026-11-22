import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

interface ProtectedRouteProps {
  allowedRoles?: Array<'user' | 'admin'>;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { usuario, cargando } = useAuthStore();
  const location = useLocation();

  if (cargando) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-8 h-8 border-3 border-amber-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-semibold text-slate-500">Verificando sesión...</p>
      </div>
    );
  }

  // Sin sesión -> redirige a login
  if (!usuario) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Sin rol requerido -> redirige a unauthorized
  if (allowedRoles && !allowedRoles.includes(usuario.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};
