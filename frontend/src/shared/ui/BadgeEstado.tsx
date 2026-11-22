import React from 'react';

export type EstadoPedido = 'PENDIENTE' | 'EN_PREPARACION' | 'ENTREGADO' | 'CANCELADO';

interface BadgeEstadoProps {
  estado: EstadoPedido | string;
  className?: string;
}

export const BadgeEstado: React.FC<BadgeEstadoProps> = ({ estado, className = '' }) => {
  const getBadgeConfig = (est: string) => {
    switch (est) {
      case 'PENDIENTE':
        return {
          label: 'Pendiente',
          styles: 'bg-amber-50 text-amber-700 border-amber-200/80',
          dot: 'bg-amber-500',
        };
      case 'EN_PREPARACION':
        return {
          label: 'En Preparación',
          styles: 'bg-blue-50 text-blue-700 border-blue-200/80',
          dot: 'bg-blue-500',
        };
      case 'ENTREGADO':
        return {
          label: 'Entregado',
          styles: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
          dot: 'bg-emerald-500',
        };
      case 'CANCELADO':
        return {
          label: 'Cancelado',
          styles: 'bg-rose-50 text-rose-700 border-rose-200/80',
          dot: 'bg-rose-500',
        };
      default:
        return {
          label: est,
          styles: 'bg-slate-50 text-slate-700 border-slate-200',
          dot: 'bg-slate-400',
        };
    }
  };

  const config = getBadgeConfig(estado);

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config.styles} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
};
