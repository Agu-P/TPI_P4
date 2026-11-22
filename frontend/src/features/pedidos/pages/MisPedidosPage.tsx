import React, { useState } from 'react';
import { Receipt, PackageX } from 'lucide-react';
import { usePedidos } from '../hooks/usePedidos';
import { TablaPedidos } from '../components/TablaPedidos';
import { Paginacion } from '../../../shared/components/Paginacion';
import { Skeleton } from '../../../shared/components/Skeleton';
import { EstadoVacio } from '../../../shared/components/EstadoVacio';
import { EstadoError } from '../../../shared/components/EstadoError';
import { Card, CardHeader, CardTitle, CardContent } from '../../../shared/ui/Card';
import { handleApiError } from '../../../shared/api/handleApiError';
import { EstadoPedido } from '../types/pedido';

const ITEMS_POR_PAGINA = 10;

export const MisPedidosPage: React.FC = () => {
  const [pagina, setPagina] = useState(0);
  const [filtroEstado, setFiltroEstado] = useState<EstadoPedido | undefined>(undefined);

  const { data, isLoading, isError, error, refetch } = usePedidos({
    skip: pagina * ITEMS_POR_PAGINA,
    limit: ITEMS_POR_PAGINA,
    estado: filtroEstado,
  });

  const total = data?.total || 0;
  const totalPaginas = Math.ceil(total / ITEMS_POR_PAGINA);

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Receipt className="w-6 h-6 text-amber-500" />
            Mis Pedidos
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Historial de pedidos realizados, estado en vivo y opciones de cancelación
          </p>
        </div>

        {/* Filtros de estado */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {(['TODOS', 'PENDIENTE', 'EN_PREPARACION', 'ENTREGADO', 'CANCELADO'] as const).map(
            (est) => (
              <button
                key={est}
                onClick={() => {
                  setFiltroEstado(est === 'TODOS' ? undefined : (est as EstadoPedido));
                  setPagina(0);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  (est === 'TODOS' && filtroEstado === undefined) || filtroEstado === est
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {est === 'TODOS'
                  ? 'Todos'
                  : est === 'EN_PREPARACION'
                  ? 'En Prep.'
                  : est.charAt(0) + est.slice(1).toLowerCase()}
              </button>
            )
          )}
        </div>
      </div>

      <Card>
        <CardHeader className="bg-slate-50/50">
          <CardTitle className="text-base">Historial</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : isError ? (
            <div className="p-6">
              <EstadoError
                mensaje={handleApiError(error)}
                onReintentar={() => refetch()}
              />
            </div>
          ) : !data || data.items.length === 0 ? (
            <div className="p-8">
              <EstadoVacio
                titulo="No tienes pedidos registrados"
                descripcion={
                  filtroEstado
                    ? 'No hay pedidos con el estado seleccionado.'
                    : 'Aún no has realizado ninguna compra en Food Store.'
                }
                icono={<PackageX className="w-8 h-8" />}
              />
            </div>
          ) : (
            <>
              <TablaPedidos pedidos={data.items} esAdmin={false} />
              <div className="px-6 border-t border-slate-100">
                <Paginacion
                  paginaActual={pagina}
                  totalPaginas={totalPaginas}
                  onCambiarPagina={(p) => setPagina(p)}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
