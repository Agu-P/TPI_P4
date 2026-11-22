from fastapi import APIRouter, Depends, HTTPException, status
from app.core.deps import require_role
from app.modules.usuarios.models import Usuario
from app.modules.categorias.schemas import CategoriaCreate, CategoriaUpdate, CategoriaRead
from app.modules.categorias.service import (
    CategoriaService,
    CategoriaNoEncontrada,
    NombreDuplicado
)

router = APIRouter(prefix="/categorias", tags=["Categorías"])


def get_categoria_service() -> CategoriaService:
    return CategoriaService()


@router.get("", response_model=list[CategoriaRead])
def list_categorias(service: CategoriaService = Depends(get_categoria_service)):
    return service.list_activas()


@router.get("/{id}", response_model=CategoriaRead)
def get_categoria(id: int, service: CategoriaService = Depends(get_categoria_service)):
    try:
        return service.get_by_id(id)
    except CategoriaNoEncontrada as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.post("", response_model=CategoriaRead, status_code=status.HTTP_201_CREATED)
def create_categoria(
    categoria_in: CategoriaCreate,
    service: CategoriaService = Depends(get_categoria_service),
    current_user: Usuario = Depends(require_role(["admin"])),
):
    try:
        return service.create(categoria_in)
    except NombreDuplicado as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))


@router.put("/{id}", response_model=CategoriaRead)
def update_categoria(
    id: int,
    categoria_in: CategoriaUpdate,
    service: CategoriaService = Depends(get_categoria_service),
    current_user: Usuario = Depends(require_role(["admin"])),
):
    try:
        return service.update(id, categoria_in)
    except CategoriaNoEncontrada as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except NombreDuplicado as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_categoria(
    id: int,
    service: CategoriaService = Depends(get_categoria_service),
    current_user: Usuario = Depends(require_role(["admin"])),
):
    try:
        service.delete(id)
        return None
    except CategoriaNoEncontrada as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
