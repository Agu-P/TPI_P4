import { axiosInstance } from '../../../shared/api/axiosInstance';
import { Categoria, CategoriaCreate, CategoriaUpdate } from '../types/categoria';

export async function getCategoriasApi(): Promise<Categoria[]> {
  const res = await axiosInstance.get<Categoria[]>('/categorias');
  return res.data;
}

export async function getCategoriaByIdApi(id: number): Promise<Categoria> {
  const res = await axiosInstance.get<Categoria>(`/categorias/${id}`);
  return res.data;
}

export async function createCategoriaApi(data: CategoriaCreate): Promise<Categoria> {
  const res = await axiosInstance.post<Categoria>('/categorias', data);
  return res.data;
}

export async function updateCategoriaApi(id: number, data: CategoriaUpdate): Promise<Categoria> {
  const res = await axiosInstance.put<Categoria>(`/categorias/${id}`, data);
  return res.data;
}

export async function deleteCategoriaApi(id: number): Promise<void> {
  await axiosInstance.delete(`/categorias/${id}`);
}
