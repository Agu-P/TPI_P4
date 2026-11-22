import React from 'react';
import { Modal } from '../../../shared/ui/Modal';
import { BadgeEstado } from '../../../shared/ui/BadgeEstado';
import { Pedido } from '../types/pedido';
import { MapPin, CreditCard, FileText, Calendar } from 'lucide-react';

interface DetallePedidoModalProps {
  pedido: Pedido | null;
  isOpen: boolean;
  onClose: () => void;
}

export const DetallePedidoModal: React.FC<DetallePedidoModalProps> = ({
  pedido,
  isOpen,
  onClose,
}) => {
  if (!pedido) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Detalle del Pedido #${pedido.id}`}
      maxWidth="lg"
    >
      <div className="space-y-6">
        {/* Encabezado con estado y fecha */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-3.5 bg-slate-50 rounded-xl border border-slate-100">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span>
              {new Date(pedido.created_at).toLocaleString('es-AR', {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}
            </span>
          </div>
          <BadgeEstado estado={pedido.estado} />
        </div>

        {/* Datos de Entrega y Pago */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div className="p-3 rounded-lg border border-slate-100 bg-white">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 mb-1">
              <MapPin className="w-3.5 h-3.5 text-amber-500" />
              Dirección de Entrega
            </span>
            <p className="font-medium text-slate-800">{pedido.direccion_entrega}</p>
          </div>

          <div className="p-3 rounded-lg border border-slate-100 bg-white">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 mb-1">
              <CreditCard className="w-3.5 h-3.5 text-amber-500" />
              Forma de Pago
            </span>
            <p className="font-medium text-slate-800">{pedido.forma_pago}</p>
          </div>
        </div>

        {pedido.notas && (
          <div className="p-3 rounded-lg bg-amber-50/60 border border-amber-100 text-xs text-amber-900">
            <span className="font-bold flex items-center gap-1 mb-0.5">
              <FileText className="w-3.5 h-3.5 text-amber-600" />
              Notas del cliente:
            </span>
            <p>{pedido.notas}</p>
          </div>
        )}

        {/* Tabla de Productos */}
        <div>
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Productos en el pedido
          </h4>
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-sm border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600">
                <tr>
                  <th className="px-4 py-2.5">Producto</th>
                  <th className="px-4 py-2.5 text-center">Cant.</th>
                  <th className="px-4 py-2.5 text-right">Unitario</th>
                  <th className="px-4 py-2.5 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pedido.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-medium text-slate-800">
                      {item.nombre_producto}
                    </td>
                    <td className="px-4 py-3 text-center text-slate-600 font-mono text-xs">
                      x{item.cantidad}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-600 font-mono text-xs">
                      ${item.precio_unitario.toLocaleString('es-AR')}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-slate-900 font-mono">
                      ${item.subtotal.toLocaleString('es-AR')}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-50/80 border-t border-slate-200">
                <tr>
                  <td colSpan={3} className="px-4 py-3 font-bold text-slate-700 text-right">
                    Total del Pedido:
                  </td>
                  <td className="px-4 py-3 font-black text-amber-600 text-base text-right font-mono">
                    ${pedido.total.toLocaleString('es-AR')}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </Modal>
  );
};
