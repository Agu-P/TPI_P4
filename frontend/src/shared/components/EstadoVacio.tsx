import React from 'react';
import { PackageOpen } from 'lucide-react';
import { Button } from '../ui/Button';

interface EstadoVacioProps {
  titulo: string;
  descripcion?: string;
  icono?: React.ReactNode;
  accionTexto?: string;
  onAccion?: () => void;
  className?: string;
}

export const EstadoVacio: React.FC<EstadoVacioProps> = ({
  titulo,
  descripcion,
  icono,
  accionTexto,
  onAccion,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 text-center rounded-xl border border-dashed border-slate-200 bg-white/50 ${className}`}
    >
      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
        {icono || <PackageOpen className="w-6 h-6" />}
      </div>
      <h3 className="text-base font-semibold text-slate-800">{titulo}</h3>
      {descripcion && (
        <p className="mt-1 text-sm text-slate-500 max-w-sm">{descripcion}</p>
      )}
      {accionTexto && onAccion && (
        <div className="mt-4">
          <Button variant="outline" size="sm" onClick={onAccion}>
            {accionTexto}
          </Button>
        </div>
      )}
    </div>
  );
};
