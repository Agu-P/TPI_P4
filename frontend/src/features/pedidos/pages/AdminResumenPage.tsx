import React from 'react';
import {
  Clock,
  ChefHat,
  CheckCircle2,
  XCircle,
  CalendarDays,
  DollarSign,
  TrendingUp,
} from 'lucide-react';
import { useResumenPedidos } from '../hooks/useResumenPedidos';
import { TarjetaResumen } from '../components/TarjetaResumen';
import { Skeleton } from '../../../shared/components/Skeleton';
import { EstadoError } from '../../../shared/components/EstadoError';
import { handleApiError } from '../../../shared/api/handleApiError';

export const AdminResumenPage: React.FC = () => {
  const { data: resumen, isLoading, isError, error, refetch } = useResumenPedidos();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (isError || !resumen) {
    return (
      <div className="py-8">
        <EstadoError
          mensaje={handleApiError(error)}
          onReintentar={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-amber-500" />
          Resumen del Negocio
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Indicadores clave del negocio, estado de pedidos y facturación acumulada
        </p>
      </div>

      {/* Grid de Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Ingresos Entregados */}
        <TarjetaResumen
          titulo="Ingresos Entregados"
          valor={`$${resumen.ingresos_entregados.toLocaleString('es-AR')}`}
          subtitulo="Facturación cobrada de pedidos completados"
          icono={<DollarSign className="w-6 h-6" />}
          color="emerald"
        />

        {/* Pedidos Hoy */}
        <TarjetaResumen
          titulo="Pedidos Hoy"
          valor={resumen.pedidos_hoy}
          subtitulo="Nuevas órdenes registradas en el día"
          icono={<CalendarDays className="w-6 h-6" />}
          color="amber"
        />

        {/* Pendientes */}
        <TarjetaResumen
          titulo="Pendientes"
          valor={resumen.pendientes}
          subtitulo="Aguardando confirmación de cocina"
          icono={<Clock className="w-6 h-6" />}
          color="amber"
        />

        {/* En Preparación */}
        <TarjetaResumen
          titulo="En Preparación"
          valor={resumen.en_preparacion}
          subtitulo="Elaborándose en cocina"
          icono={<ChefHat className="w-6 h-6" />}
          color="blue"
        />

        {/* Entregados */}
        <TarjetaResumen
          titulo="Entregados"
          valor={resumen.entregados}
          subtitulo="Órdenes completadas con éxito"
          icono={<CheckCircle2 className="w-6 h-6" />}
          color="emerald"
        />

        {/* Cancelados */}
        <TarjetaResumen
          titulo="Cancelados"
          valor={resumen.cancelados}
          subtitulo="Órdenes dadas de baja con stock restituido"
          icono={<XCircle className="w-6 h-6" />}
          color="rose"
        />
      </div>
    </div>
  );
};
