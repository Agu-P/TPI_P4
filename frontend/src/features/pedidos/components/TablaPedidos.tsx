import React, { useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';
import { Eye, XCircle, ArrowRight, Calendar, User } from 'lucide-react';
import { Pedido, EstadoPedido } from '../types/pedido';
import { BadgeEstado } from '../../../shared/ui/BadgeEstado';
import { Button } from '../../../shared/ui/Button';
import { DetallePedidoModal } from './DetallePedidoModal';
import { useCambiarEstadoPedido, useCancelarPedido } from '../hooks/usePedidoMutations';
import { handleApiError } from '../../../shared/api/handleApiError';

const columnHelper = createColumnHelper<Pedido>();

interface TablaPedidosProps {
  pedidos: Pedido[];
  esAdmin?: boolean;
}

export const TablaPedidos: React.FC<TablaPedidosProps> = ({ pedidos, esAdmin = false }) => {
  const [selectedPedido, setSelectedPedido] = useState<Pedido | null>(null);

  const cambiarEstadoMutation = useCambiarEstadoPedido();
  const cancelarMutation = useCancelarPedido();

  const handleCancelar = async (pedido: Pedido) => {
    if (confirm(`¿Seguro que deseas cancelar el pedido #${pedido.id}? Se restituirá el stock automáticamente.`)) {
      try {
        if (esAdmin) {
          await cambiarEstadoMutation.mutateAsync({
            id: pedido.id,
            cambio: { estado: 'CANCELADO' },
          });
        } else {
          await cancelarMutation.mutateAsync(pedido.id);
        }
      } catch (err) {
        alert(handleApiError(err));
      }
    }
  };

  const handleAvanzar = async (pedido: Pedido) => {
    let siguienteEstado: EstadoPedido | null = null;
    if (pedido.estado === 'PENDIENTE') siguienteEstado = 'EN_PREPARACION';
    else if (pedido.estado === 'EN_PREPARACION') siguienteEstado = 'ENTREGADO';

    if (!siguienteEstado) return;

    try {
      await cambiarEstadoMutation.mutateAsync({
        id: pedido.id,
        cambio: { estado: siguienteEstado },
      });
    } catch (err) {
      alert(handleApiError(err));
    }
  };

  const columns = [
    columnHelper.accessor('id', {
      header: 'Pedido',
      cell: (info) => (
        <span className="font-mono text-xs font-bold text-slate-900">
          #{info.getValue()}
        </span>
      ),
    }),
    columnHelper.accessor('created_at', {
      header: 'Fecha',
      cell: (info) => (
        <span className="text-xs text-slate-500 flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          {new Date(info.getValue()).toLocaleDateString('es-AR', {
            day: '2-digit',
            month: '2-digit',
            year: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      ),
    }),
    ...(esAdmin
      ? [
          columnHelper.accessor('usuario_id', {
            header: 'Cliente',
            cell: (info) => (
              <span className="text-xs text-slate-600 flex items-center gap-1">
                <User className="w-3 h-3 text-slate-400" />
                ID #{info.getValue()}
              </span>
            ),
          }),
        ]
      : []),
    columnHelper.accessor('total', {
      header: 'Total',
      cell: (info) => (
        <span className="font-bold text-slate-900 font-mono text-sm">
          ${info.getValue().toLocaleString('es-AR')}
        </span>
      ),
    }),
    columnHelper.accessor('forma_pago', {
      header: 'Pago',
      cell: (info) => <span className="text-xs text-slate-600">{info.getValue()}</span>,
    }),
    columnHelper.accessor('estado', {
      header: 'Estado',
      cell: (info) => <BadgeEstado estado={info.getValue()} />,
    }),
    columnHelper.display({
      id: 'acciones',
      header: 'Acciones',
      cell: (info) => {
        const p = info.row.original;
        const puedeCancelarCliente = !esAdmin && p.estado === 'PENDIENTE';
        const puedeCancelarAdmin =
          esAdmin && (p.estado === 'PENDIENTE' || p.estado === 'EN_PREPARACION');
        const puedeAvanzar =
          esAdmin && (p.estado === 'PENDIENTE' || p.estado === 'EN_PREPARACION');

        return (
          <div className="flex items-center gap-1.5 justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedPedido(p)}
              title="Ver detalle de productos"
            >
              <Eye className="w-3.5 h-3.5 mr-1" />
              Detalle
            </Button>

            {/* Avanzar pedido (Admin) */}
            {puedeAvanzar && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleAvanzar(p)}
                isLoading={cambiarEstadoMutation.isPending}
                title={
                  p.estado === 'PENDIENTE'
                    ? 'Avanzar a En Preparación'
                    : 'Avanzar a Entregado'
                }
              >
                <ArrowRight className="w-3.5 h-3.5 mr-1" />
                {p.estado === 'PENDIENTE' ? 'Preparar' : 'Entregar'}
              </Button>
            )}

            {/* Cancelar pedido */}
            {(puedeCancelarCliente || puedeCancelarAdmin) && (
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleCancelar(p)}
                isLoading={cancelarMutation.isPending || cambiarEstadoMutation.isPending}
                title="Cancelar pedido y restituir stock"
              >
                <XCircle className="w-3.5 h-3.5 mr-1" />
                Cancelar
              </Button>
            )}
          </div>
        );
      },
    }),
  ];

  const table = useReactTable({
    data: pedidos,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-slate-200 bg-slate-50/75">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-6 py-3.5 text-xs font-semibold text-slate-600 uppercase tracking-wider"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-slate-100">
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-6 py-4 text-sm">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <DetallePedidoModal
        pedido={selectedPedido}
        isOpen={!!selectedPedido}
        onClose={() => setSelectedPedido(null)}
      />
    </>
  );
};
