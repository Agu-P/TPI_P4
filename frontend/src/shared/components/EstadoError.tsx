import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '../ui/Button';

interface EstadoErrorProps {
  mensaje: string;
  onReintentar?: () => void;
  className?: string;
}

export const EstadoError: React.FC<EstadoErrorProps> = ({
  mensaje,
  onReintentar,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-6 text-center rounded-xl bg-red-50/70 border border-red-200 text-red-800 ${className}`}
    >
      <AlertCircle className="w-8 h-8 text-red-500 mb-2" />
      <h4 className="font-semibold text-sm">Ocurrió un error</h4>
      <p className="text-sm text-red-600 mt-1 max-w-md">{mensaje}</p>
      {onReintentar && (
        <Button
          variant="outline"
          size="sm"
          className="mt-3 bg-white border-red-300 text-red-700 hover:bg-red-50"
          onClick={onReintentar}
        >
          <RefreshCw className="w-4 h-4 mr-1.5" />
          Reintentar
        </Button>
      )}
    </div>
  );
};
