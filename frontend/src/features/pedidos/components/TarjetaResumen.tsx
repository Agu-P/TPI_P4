import React from 'react';
import { Card } from '../../../shared/ui/Card';

interface TarjetaResumenProps {
  titulo: string;
  valor: string | number;
  subtitulo?: string;
  icono: React.ReactNode;
  color?: 'amber' | 'blue' | 'emerald' | 'rose' | 'slate';
}

export const TarjetaResumen: React.FC<TarjetaResumenProps> = ({
  titulo,
  valor,
  subtitulo,
  icono,
  color = 'amber',
}) => {
  const colorStyles = {
    amber: 'bg-amber-50 text-amber-600 border-amber-200',
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    rose: 'bg-rose-50 text-rose-600 border-rose-200',
    slate: 'bg-slate-100 text-slate-600 border-slate-200',
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {titulo}
          </p>
          <p className="text-2xl font-black text-slate-900 mt-1">{valor}</p>
          {subtitulo && <p className="text-xs text-slate-400 mt-1">{subtitulo}</p>}
        </div>
        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${colorStyles[color]} shadow-xs`}
        >
          {icono}
        </div>
      </div>
    </Card>
  );
};
