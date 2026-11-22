import { axiosInstance } from '../../../shared/api/axiosInstance';
import {
  Producto,
  ProductoCreate,
  ProductoUpdate,
  ProductoStockUpdate,
  ProductosPaginados,
  FiltrosProductos,
} from '../types/producto';

export async function getProductosApi(filtros?: FiltrosProductos): Promise<ProductosPaginados> {
  const params = new URLSearchParams();
  if (filtros?.skip !== undefined) params.append('skip', filtros.skip.toString());
  if (filtros?.limit !== undefined) params.append('limit', filtros.limit.toString());
  if (filtros?.search) params.append('search', filtros.search);
  if (filtros?.categoria_id !== undefined) params.append('categoria_id', filtros.categoria_id.toString());
  if (filtros?.disponible !== undefined) params.append('disponible', filtros.disponible.toString());

  const res = await axiosInstance.get<ProductosPaginados>('/productos', { params });
  return res.data;
}

export async function getProductoByIdApi(id: number): Promise<Producto> {
  const res = await axiosInstance.get<Producto>(`/productos/${id}`);
  return res.data;
}

export async function createProductoApi(data: ProductoCreate): Promise<Producto> {
  const res = await axiosInstance.post<Producto>('/productos', data);
  return res.data;
}

export async function updateProductoApi(id: number, data: ProductoUpdate): Promise<Producto> {
  const res = await axiosInstance.put<Producto>(`/productos/${id}`, data);
  return res.data;
}

export async function updateProductoStockApi(
  id: number,
  data: ProductoStockUpdate
): Promise<Producto> {
  const res = await axiosInstance.patch<Producto>(`/productos/${id}/stock`, data);
  return res.data;
}

export async function deleteProductoApi(id: number): Promise<void> {
  await axiosInstance.delete(`/productos/${id}`);
}
