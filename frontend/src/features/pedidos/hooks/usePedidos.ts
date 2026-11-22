import { useQuery } from '@tanstack/react-query';
import { getPedidosApi, getPedidoByIdApi } from '../api/pedidos';
import { FiltrosPedidos } from '../types/pedido';

export function usePedidos(filtros?: FiltrosPedidos) {
  return useQuery({
    queryKey: ['pedidos', filtros],
    queryFn: () => getPedidosApi(filtros),
  });
}

export function usePedido(id: number) {
  return useQuery({
    queryKey: ['pedidos', id],
    queryFn: () => getPedidoByIdApi(id),
    enabled: !!id,
  });
}
