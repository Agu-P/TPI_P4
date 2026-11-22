from fastapi import APIRouter, Depends, HTTPException, status
from app.core.deps import require_role
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.service import (
    UsuarioService,
    UsuarioNoEncontrado,
    ReglaNegocioError
)

router = APIRouter(prefix="/admin/usuarios", tags=["Admin - Usuarios"])


def get_usuario_service() -> UsuarioService:
    return UsuarioService()


@router.get("", response_model=list[UserPublic])
def list_usuarios(
    service: UsuarioService = Depends(get_usuario_service),
    current_user: Usuario = Depends(require_role(["admin"])),
):
    return service.list_all()


@router.post("/{id}/activar", response_model=UserPublic)
def activar_usuario(
    id: int,
    service: UsuarioService = Depends(get_usuario_service),
    current_user: Usuario = Depends(require_role(["admin"])),
):
    try:
        return service.activar(id)
    except UsuarioNoEncontrado as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.post("/{id}/desactivar", response_model=UserPublic)
def desactivar_usuario(
    id: int,
    service: UsuarioService = Depends(get_usuario_service),
    current_user: Usuario = Depends(require_role(["admin"])),
):
    try:
        return service.desactivar(id, current_user.id)
    except UsuarioNoEncontrado as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except ReglaNegocioError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
