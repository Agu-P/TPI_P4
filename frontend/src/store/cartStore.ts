import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  producto_id: number;
  nombre: string;
  precio_unitario: number;
  imagen_url?: string | null;
  cantidad: number;
  stock_maximo: number;
}

interface CartState {
  items: CartItem[];
  agregar: (item: Omit<CartItem, 'cantidad'>, cantidad?: number) => void;
  quitar: (producto_id: number) => void;
  cambiarCantidad: (producto_id: number, cantidad: number) => void;
  vaciar: () => void;
  total: () => number;
  cantidadTotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      agregar: (item, cantidad = 1) => {
        const items = get().items;
        const index = items.findIndex((i) => i.producto_id === item.producto_id);

        if (index > -1) {
          const nuevaCantidad = Math.min(
            items[index].cantidad + cantidad,
            item.stock_maximo
          );
          const nuevosItems = [...items];
          nuevosItems[index] = { ...items[index], cantidad: nuevaCantidad };
          set({ items: nuevosItems });
        } else {
          const cantidadFinal = Math.min(cantidad, item.stock_maximo);
          if (cantidadFinal > 0) {
            set({ items: [...items, { ...item, cantidad: cantidadFinal }] });
          }
        }
      },

      quitar: (producto_id: number) => {
        set({ items: get().items.filter((i) => i.producto_id !== producto_id) });
      },

      cambiarCantidad: (producto_id: number, cantidad: number) => {
        if (cantidad <= 0) {
          get().quitar(producto_id);
          return;
        }
        const nuevos = get().items.map((i) => {
          if (i.producto_id === producto_id) {
            return { ...i, cantidad: Math.min(cantidad, i.stock_maximo) };
          }
          return i;
        });
        set({ items: nuevos });
      },

      vaciar: () => set({ items: [] }),

      total: () => {
        return Math.round(
          get().items.reduce((acc, i) => acc + i.precio_unitario * i.cantidad, 0) * 100
        ) / 100;
      },

      cantidadTotal: () => {
        return get().items.reduce((acc, i) => acc + i.cantidad, 0);
      },
    }),
    {
      name: 'foodstore-cart',
    }
  )
);
