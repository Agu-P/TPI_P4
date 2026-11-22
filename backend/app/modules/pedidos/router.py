from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from app.core.deps import get_current_active_user, require_role
from app.modules.usuarios.models import Usuario
from app.modules.pedidos.schemas import (
    PedidoCreate,
    PedidoRead,
    PedidosPaginados,
    CambioEstado,
    ResumenPedidos,
)
from app.modules.pedidos.service import (
    PedidoService,
    PedidoNoEncontrado,
    PedidoAjeno,
    StockInsuficiente,
    ProductoNoDisponible,
    ProductoRepetido,
    TransicionInvalida,
    ReglaNegocioError,
)
from app.modules.productos.service import ProductoNoEncontrado

router = APIRouter(prefix="/pedidos", tags=["Pedidos"])


def get_pedido_service() -> PedidoService:
    return PedidoService()


@router.post("", response_model=PedidoRead, status_code=status.HTTP_201_CREATED)
def create_pedido(
    pedido_in: PedidoCreate,
    service: PedidoService = Depends(get_pedido_service),
    current_user: Usuario = Depends(get_current_active_user),
):
    try:
        return service.create(current_user.id, pedido_in)
    except ProductoNoEncontrado as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except (StockInsuficiente, ProductoNoDisponible, ProductoRepetido, ReglaNegocioError) as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("", response_model=PedidosPaginados)
def list_pedidos(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
    estado: Optional[str] = Query(default=None),
    service: PedidoService = Depends(get_pedido_service),
    current_user: Usuario = Depends(get_current_active_user),
):
    es_admin = current_user.role == "admin"
    return service.list_pedidos(
        usuario_id=current_user.id,
        es_admin=es_admin,
        skip=skip,
        limit=limit,
        estado=estado,
    )


@router.get("/resumen", response_model=ResumenPedidos)
def get_resumen(
    service: PedidoService = Depends(get_pedido_service),
    current_user: Usuario = Depends(require_role(["admin"])),
):
    return service.get_resumen()


@router.get("/{id}", response_model=PedidoRead)
def get_pedido(
    id: int,
    service: PedidoService = Depends(get_pedido_service),
    current_user: Usuario = Depends(get_current_active_user),
):
    es_admin = current_user.role == "admin"
    try:
        return service.get_by_id(id, current_user.id, es_admin)
    except PedidoNoEncontrado as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except PedidoAjeno as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))


@router.patch("/{id}/estado", response_model=PedidoRead)
def cambiar_estado(
    id: int,
    cambio: CambioEstado,
    service: PedidoService = Depends(get_pedido_service),
    current_user: Usuario = Depends(require_role(["admin"])),
):
    try:
        return service.cambiar_estado_admin(id, cambio.estado)
    except PedidoNoEncontrado as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except TransicionInvalida as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.patch("/{id}/cancelar", response_model=PedidoRead)
def cancelar_pedido(
    id: int,
    service: PedidoService = Depends(get_pedido_service),
    current_user: Usuario = Depends(get_current_active_user),
):
    try:
        return service.cancelar_dueño(id, current_user.id)
    except PedidoNoEncontrado as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except PedidoAjeno as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))
    except ReglaNegocioError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
