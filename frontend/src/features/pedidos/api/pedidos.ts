import { axiosInstance } from '../../../shared/api/axiosInstance';
import {
  Pedido,
  PedidoCreate,
  PedidosPaginados,
  CambioEstado,
  ResumenPedidos,
  FiltrosPedidos,
} from '../types/pedido';

export async function createPedidoApi(data: PedidoCreate): Promise<Pedido> {
  const res = await axiosInstance.post<Pedido>('/pedidos', data);
  return res.data;
}

export async function getPedidosApi(filtros?: FiltrosPedidos): Promise<PedidosPaginados> {
  const params = new URLSearchParams();
  if (filtros?.skip !== undefined) params.append('skip', filtros.skip.toString());
  if (filtros?.limit !== undefined) params.append('limit', filtros.limit.toString());
  if (filtros?.estado) params.append('estado', filtros.estado);

  const res = await axiosInstance.get<PedidosPaginados>('/pedidos', { params });
  return res.data;
}

export async function getPedidoByIdApi(id: number): Promise<Pedido> {
  const res = await axiosInstance.get<Pedido>(`/pedidos/${id}`);
  return res.data;
}

export async function cambiarEstadoPedidoApi(id: number, cambio: CambioEstado): Promise<Pedido> {
  const res = await axiosInstance.patch<Pedido>(`/pedidos/${id}/estado`, cambio);
  return res.data;
}

export async function cancelarPedidoApi(id: number): Promise<Pedido> {
  const res = await axiosInstance.patch<Pedido>(`/pedidos/${id}/cancelar`);
  return res.data;
}

export async function getResumenPedidosApi(): Promise<ResumenPedidos> {
  const res = await axiosInstance.get<ResumenPedidos>('/pedidos/resumen');
  return res.data;
}
