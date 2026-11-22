import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../ui/Button';

interface PaginacionProps {
  paginaActual: number;
  totalPaginas: number;
  onCambiarPagina: (nuevaPagina: number) => void;
  className?: string;
}

export const Paginacion: React.FC<PaginacionProps> = ({
  paginaActual,
  totalPaginas,
  onCambiarPagina,
  className = '',
}) => {
  if (totalPaginas <= 1) return null;

  return (
    <div className={`flex items-center justify-between gap-4 py-4 ${className}`}>
      <div className="text-sm text-slate-500">
        Página <span className="font-medium text-slate-800">{paginaActual + 1}</span> de{' '}
        <span className="font-medium text-slate-800">{totalPaginas}</span>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={paginaActual === 0}
          onClick={() => onCambiarPagina(paginaActual - 1)}
        >
          <ChevronLeft className="w-4 h-4" />
          Anterior
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={paginaActual >= totalPaginas - 1}
          onClick={() => onCambiarPagina(paginaActual + 1)}
        >
          Siguiente
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
