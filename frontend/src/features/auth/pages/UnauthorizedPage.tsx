import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { Button } from '../../../shared/ui/Button';

export const UnauthorizedPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="w-16 h-16 bg-red-100 text-red-600 rounded-3xl flex items-center justify-center mb-4">
        <ShieldAlert className="w-8 h-8" />
      </div>
      <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Acceso Denegado</h1>
      <p className="mt-2 text-base text-slate-600 max-w-md">
        No tienes los permisos necesarios para acceder a este panel de administración.
      </p>
      <div className="mt-6">
        <Link to="/">
          <Button variant="primary">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al inicio
          </Button>
        </Link>
      </div>
    </div>
  );
};
