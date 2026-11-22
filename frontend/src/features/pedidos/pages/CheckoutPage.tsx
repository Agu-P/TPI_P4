import React from 'react';
import { CheckoutForm } from '../components/CheckoutForm';

export const CheckoutPage: React.FC = () => {
  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Confirmar Pedido</h1>
        <p className="text-sm text-slate-500 mt-1">
          Ingresa la dirección para recibir tu comida y selecciona el medio de pago
        </p>
      </div>
      <CheckoutForm />
    </div>
  );
};
