import React, { useState } from 'react';
import { useForm } from '@tanstack/react-form';
import { useNavigate } from 'react-router-dom';
import { MapPin, CreditCard, FileText, AlertCircle, ShoppingBag } from 'lucide-react';
import { useCrearPedido } from '../hooks/useCrearPedido';
import { useCartStore } from '../../../store/cartStore';
import { FormaPago } from '../types/pedido';
import { handleApiError } from '../../../shared/api/handleApiError';
import { Button } from '../../../shared/ui/Button';
import { Input } from '../../../shared/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '../../../shared/ui/Card';

export const CheckoutForm: React.FC = () => {
  const { items, total, vaciar } = useCartStore();
  const crearPedidoMutation = useCrearPedido();
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const cartTotal = total();

  const form = useForm({
    defaultValues: {
      direccion_entrega: '',
      forma_pago: 'EFECTIVO' as FormaPago,
      notas: '',
    },
    onSubmit: async ({ value }) => {
      if (items.length === 0) {
        setErrorMsg('El carrito está vacío. Agrega productos antes de confirmar.');
        return;
      }

      setErrorMsg(null);
      try {
        const payload = {
          items: items.map((i) => ({
            producto_id: i.producto_id,
            cantidad: i.cantidad,
          })),
          forma_pago: value.forma_pago,
          direccion_entrega: value.direccion_entrega,
          notas: value.notas || null,
        };

        await crearPedidoMutation.mutateAsync(payload);
        // Vaciar carrito tras confirmación exitosa
        vaciar();
        // Redirigir a mis pedidos
        navigate('/mis-pedidos');
      } catch (err) {
        setErrorMsg(handleApiError(err));
      }
    },
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Formulario de envío y pago */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-amber-500" />
              Datos de Entrega y Pago
            </CardTitle>
          </CardHeader>
          <CardContent>
            {errorMsg && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-sm text-red-700">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                form.handleSubmit();
              }}
              className="space-y-5"
            >
              {/* Dirección de entrega (5 a 200 caracteres) */}
              <form.Field
                name="direccion_entrega"
                validators={{
                  onChange: ({ value }) => {
                    if (!value || value.trim().length < 5) {
                      return 'La dirección debe tener al menos 5 caracteres';
                    }
                    if (value.length > 200) {
                      return 'La dirección no puede superar los 200 caracteres';
                    }
                    return undefined;
                  },
                }}
              >
                {(field) => (
                  <div className="relative">
                    <Input
                      label="Dirección de entrega"
                      placeholder="Calle, número, piso/depto, entre calles..."
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      error={field.state.meta.errors?.[0]}
                    />
                    <MapPin className="w-4 h-4 text-slate-400 absolute right-3 top-8 pointer-events-none" />
                  </div>
                )}
              </form.Field>

              {/* Forma de pago */}
              <form.Field name="forma_pago">
                {(field) => (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Forma de pago
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <label
                        className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-colors ${
                          field.state.value === 'EFECTIVO'
                            ? 'border-amber-500 bg-amber-50/50 text-amber-900 font-semibold'
                            : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <input
                          type="radio"
                          name="forma_pago"
                          value="EFECTIVO"
                          checked={field.state.value === 'EFECTIVO'}
                          onChange={() => field.handleChange('EFECTIVO')}
                          className="w-4 h-4 text-amber-600 focus:ring-amber-500"
                        />
                        <CreditCard className="w-4 h-4 text-amber-600" />
                        <div>
                          <span className="block text-sm">Efectivo al recibir</span>
                          <span className="text-xs text-slate-500 font-normal">
                            Abona contra entrega al repartidor
                          </span>
                        </div>
                      </label>

                      <label
                        className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-colors ${
                          field.state.value === 'TRANSFERENCIA'
                            ? 'border-amber-500 bg-amber-50/50 text-amber-900 font-semibold'
                            : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <input
                          type="radio"
                          name="forma_pago"
                          value="TRANSFERENCIA"
                          checked={field.state.value === 'TRANSFERENCIA'}
                          onChange={() => field.handleChange('TRANSFERENCIA')}
                          className="w-4 h-4 text-amber-600 focus:ring-amber-500"
                        />
                        <CreditCard className="w-4 h-4 text-amber-600" />
                        <div>
                          <span className="block text-sm">Transferencia bancaria</span>
                          <span className="text-xs text-slate-500 font-normal">
                            Alias / CBU informado al confirmar
                          </span>
                        </div>
                      </label>
                    </div>
                  </div>
                )}
              </form.Field>

              {/* Notas opcionales */}
              <form.Field name="notas">
                {(field) => (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Notas especiales o aclaraciones (opcional)
                    </label>
                    <div className="relative">
                      <textarea
                        className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                        rows={2}
                        placeholder="ej: Timbre no funciona, dejar en conserjería..."
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                      <FileText className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                    </div>
                  </div>
                )}
              </form.Field>

              <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
                {([canSubmit, isSubmitting]) => (
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full mt-4"
                    disabled={!canSubmit || items.length === 0}
                    isLoading={isSubmitting || crearPedidoMutation.isPending}
                  >
                    Confirmar y Crear Pedido (${cartTotal.toLocaleString('es-AR')})
                  </Button>
                )}
              </form.Subscribe>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Resumen del Carrito */}
      <div>
        <Card className="sticky top-24">
          <CardHeader className="bg-slate-50/50">
            <CardTitle className="text-base">Resumen del Carrito</CardTitle>
          </CardHeader>
          <CardContent className="divide-y divide-slate-100">
            <div className="space-y-3 pb-4">
              {items.map((i) => (
                <div key={i.producto_id} className="flex justify-between items-start text-sm">
                  <div>
                    <span className="font-semibold text-slate-800 block">{i.nombre}</span>
                    <span className="text-xs text-slate-500">
                      {i.cantidad} x ${i.precio_unitario.toLocaleString('es-AR')}
                    </span>
                  </div>
                  <span className="font-bold text-slate-900 font-mono">
                    ${(i.cantidad * i.precio_unitario).toLocaleString('es-AR')}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-4 space-y-2 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span>${cartTotal.toLocaleString('es-AR')}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Envío</span>
                <span className="text-emerald-600 font-medium">Gratis</span>
              </div>
              <div className="flex justify-between text-base font-black text-slate-900 pt-2 border-t border-slate-200">
                <span>Total a Pagar</span>
                <span className="text-amber-600 font-mono">
                  ${cartTotal.toLocaleString('es-AR')}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
