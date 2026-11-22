import React, { useState } from 'react';
import { Package } from 'lucide-react';
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

export const AdminPedidosPage: React.FC = () => {
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
            <Package className="w-6 h-6 text-amber-500" />
            Gestión de Pedidos
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Visualiza todos los pedidos y avanza o cancela según los estados
          </p>
        </div>

        {/* Filtros por estado */}
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
                  ? 'En Preparación'
                  : est.charAt(0) + est.slice(1).toLowerCase()}
              </button>
            )
          )}
        </div>
      </div>

      <Card>
        <CardHeader className="bg-slate-50/50 flex flex-row items-center justify-between">
          <CardTitle className="text-base">Listado de Pedidos</CardTitle>
          <span className="text-xs text-slate-500">
            Total registrados: <strong>{total}</strong>
          </span>
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
                titulo="No se encontraron pedidos"
                descripcion={
                  filtroEstado
                    ? 'No hay pedidos en el estado seleccionado.'
                    : 'Aún no se ha creado ningún pedido en la tienda.'
                }
              />
            </div>
          ) : (
            <>
              <TablaPedidos pedidos={data.items} esAdmin={true} />
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
