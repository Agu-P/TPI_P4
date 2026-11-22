import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createPedidoApi,
  cambiarEstadoPedidoApi,
  cancelarPedidoApi,
  getResumenPedidosApi,
} from '../api/pedidos';
import { PedidoCreate, CambioEstado } from '../types/pedido';
import { useQuery } from '@tanstack/react-query';

export function useCrearPedido() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: PedidoCreate) => createPedidoApi(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pedidos'] });
      queryClient.invalidateQueries({ queryKey: ['productos'] });
    },
  });
}

export function useCambiarEstadoPedido() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, cambio }: { id: number; cambio: CambioEstado }) =>
      cambiarEstadoPedidoApi(id, cambio),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pedidos'] });
      queryClient.invalidateQueries({ queryKey: ['pedidos-resumen'] });
      queryClient.invalidateQueries({ queryKey: ['productos'] });
    },
  });
}

export function useCancelarPedido() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => cancelarPedidoApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pedidos'] });
      queryClient.invalidateQueries({ queryKey: ['pedidos-resumen'] });
      queryClient.invalidateQueries({ queryKey: ['productos'] });
    },
  });
}

export function useResumenPedidos() {
  return useQuery({
    queryKey: ['pedidos-resumen'],
    queryFn: getResumenPedidosApi,
  });
}
