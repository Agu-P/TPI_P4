from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from app.core.deps import require_role
from app.modules.usuarios.models import Usuario
from app.modules.productos.schemas import (
    ProductoCreate,
    ProductoUpdate,
    ProductoStockUpdate,
    ProductoRead,
    ProductosPaginados,
)
from app.modules.productos.service import ProductoService, ProductoNoEncontrado
from app.modules.categorias.service import CategoriaNoEncontrada

router = APIRouter(prefix="/productos", tags=["Productos"])


def get_producto_service() -> ProductoService:
    return ProductoService()


@router.get("", response_model=ProductosPaginados)
def list_productos(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
    search: Optional[str] = Query(default=None),
    categoria_id: Optional[int] = Query(default=None),
    disponible: Optional[bool] = Query(default=None),
    service: ProductoService = Depends(get_producto_service),
):
    return service.list_activos(
        skip=skip,
        limit=limit,
        search=search,
        categoria_id=categoria_id,
        disponible=disponible,
    )


@router.get("/{id}", response_model=ProductoRead)
def get_producto(id: int, service: ProductoService = Depends(get_producto_service)):
    try:
        return service.get_by_id(id)
    except ProductoNoEncontrado as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.post("", response_model=ProductoRead, status_code=status.HTTP_201_CREATED)
def create_producto(
    producto_in: ProductoCreate,
    service: ProductoService = Depends(get_producto_service),
    current_user: Usuario = Depends(require_role(["admin"])),
):
    try:
        return service.create(producto_in)
    except CategoriaNoEncontrada as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.put("/{id}", response_model=ProductoRead)
def update_producto(
    id: int,
    producto_in: ProductoUpdate,
    service: ProductoService = Depends(get_producto_service),
    current_user: Usuario = Depends(require_role(["admin"])),
):
    try:
        return service.update(id, producto_in)
    except ProductoNoEncontrado as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except CategoriaNoEncontrada as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.patch("/{id}/stock", response_model=ProductoRead)
def update_stock(
    id: int,
    stock_in: ProductoStockUpdate,
    service: ProductoService = Depends(get_producto_service),
    current_user: Usuario = Depends(require_role(["admin"])),
):
    try:
        return service.update_stock(id, stock_in)
    except ProductoNoEncontrado as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_producto(
    id: int,
    service: ProductoService = Depends(get_producto_service),
    current_user: Usuario = Depends(require_role(["admin"])),
):
    try:
        service.delete(id)
        return None
    except ProductoNoEncontrado as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
