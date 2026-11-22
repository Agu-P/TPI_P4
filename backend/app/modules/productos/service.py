from typing import Optional
from app.modules.productos.models import Producto
from app.modules.productos.schemas import (
    ProductoCreate,
    ProductoUpdate,
    ProductoStockUpdate,
    ProductoRead,
    ProductosPaginados
)
from app.modules.productos.unit_of_work import ProductoUnitOfWork
from app.modules.categorias.service import CategoriaNoEncontrada


class ProductoNoEncontrado(Exception):
    pass


class ProductoService:
    def __init__(self, uow: Optional[ProductoUnitOfWork] = None):
        self.uow = uow or ProductoUnitOfWork()

    def list_activos(
        self,
        skip: int = 0,
        limit: int = 20,
        search: Optional[str] = None,
        categoria_id: Optional[int] = None,
        disponible: Optional[bool] = None
    ) -> ProductosPaginados:
        limit = min(limit, 100)
        with self.uow as uow:
            total, items = uow.productos.search(
                skip=skip,
                limit=limit,
                search_term=search,
                categoria_id=categoria_id,
                disponible=disponible,
                solo_activos=True
            )
            # Validar con relación de categoría antes de salir del bloque
            read_items = []
            for item in items:
                read_items.append(ProductoRead.model_validate(item))
            return ProductosPaginados(total=total, items=read_items)

    def get_by_id(self, prod_id: int) -> ProductoRead:
        with self.uow as uow:
            prod = uow.productos.get_by_id(prod_id)
            if not prod or not prod.activo:
                raise ProductoNoEncontrado(f"Producto {prod_id} no encontrado")
            return ProductoRead.model_validate(prod)

    def create(self, data: ProductoCreate) -> ProductoRead:
        with self.uow as uow:
            cat = uow.categorias.get_by_id(data.categoria_id)
            if not cat or not cat.activo:
                raise CategoriaNoEncontrada(f"Categoría {data.categoria_id} inexistente o inactiva")

            prod = Producto(
                nombre=data.nombre,
                descripcion=data.descripcion,
                precio_base=data.precio_base,
                imagen_url=data.imagen_url,
                stock=data.stock,
                disponible=data.disponible,
                activo=True,
                categoria_id=data.categoria_id
            )
            uow.productos.add(prod)
            uow.session.flush()
            uow.session.refresh(prod)
            return ProductoRead.model_validate(prod)

    def update(self, prod_id: int, data: ProductoUpdate) -> ProductoRead:
        with self.uow as uow:
            prod = uow.productos.get_by_id(prod_id)
            if not prod or not prod.activo:
                raise ProductoNoEncontrado(f"Producto {prod_id} no encontrado")

            if data.categoria_id is not None:
                cat = uow.categorias.get_by_id(data.categoria_id)
                if not cat or not cat.activo:
                    raise CategoriaNoEncontrada(f"Categoría {data.categoria_id} inexistente o inactiva")
                prod.categoria_id = data.categoria_id

            if data.nombre is not None:
                prod.nombre = data.nombre
            if data.descripcion is not None:
                prod.descripcion = data.descripcion
            if data.precio_base is not None:
                prod.precio_base = data.precio_base
            if data.imagen_url is not None:
                prod.imagen_url = data.imagen_url
            if data.stock is not None:
                prod.stock = data.stock
            if data.disponible is not None:
                prod.disponible = data.disponible

            uow.productos.add(prod)
            uow.session.flush()
            uow.session.refresh(prod)
            return ProductoRead.model_validate(prod)

    def update_stock(self, prod_id: int, data: ProductoStockUpdate) -> ProductoRead:
        with self.uow as uow:
            prod = uow.productos.get_by_id(prod_id)
            if not prod or not prod.activo:
                raise ProductoNoEncontrado(f"Producto {prod_id} no encontrado")

            prod.stock = data.stock
            prod.disponible = data.disponible

            uow.productos.add(prod)
            uow.session.flush()
            uow.session.refresh(prod)
            return ProductoRead.model_validate(prod)

    def delete(self, prod_id: int) -> None:
        with self.uow as uow:
            prod = uow.productos.get_by_id(prod_id)
            if not prod or not prod.activo:
                raise ProductoNoEncontrado(f"Producto {prod_id} no encontrado")
            prod.activo = False
            uow.productos.add(prod)
