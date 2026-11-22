from typing import Optional
from app.modules.categorias.models import Categoria
from app.modules.categorias.schemas import CategoriaCreate, CategoriaUpdate, CategoriaRead
from app.modules.categorias.unit_of_work import CategoriaUnitOfWork


class CategoriaNoEncontrada(Exception):
    pass


class NombreDuplicado(Exception):
    pass


class CategoriaService:
    def __init__(self, uow: Optional[CategoriaUnitOfWork] = None):
        self.uow = uow or CategoriaUnitOfWork()

    def list_activas(self) -> list[CategoriaRead]:
        with self.uow as uow:
            cats = uow.categorias.get_all_activas()
            return [CategoriaRead.model_validate(c) for c in cats]

    def get_by_id(self, cat_id: int) -> CategoriaRead:
        with self.uow as uow:
            cat = uow.categorias.get_by_id(cat_id)
            if not cat or not cat.activo:
                raise CategoriaNoEncontrada(f"Categoría {cat_id} no encontrada")
            return CategoriaRead.model_validate(cat)

    def create(self, data: CategoriaCreate) -> CategoriaRead:
        with self.uow as uow:
            existente = uow.categorias.get_by_nombre(data.nombre)
            if existente:
                raise NombreDuplicado(f"Ya existe una categoría con el nombre '{data.nombre}'")
            cat = Categoria(
                nombre=data.nombre,
                descripcion=data.descripcion,
                activo=True
            )
            uow.categorias.add(cat)
            uow.session.flush()
            uow.session.refresh(cat)
            return CategoriaRead.model_validate(cat)

    def update(self, cat_id: int, data: CategoriaUpdate) -> CategoriaRead:
        with self.uow as uow:
            cat = uow.categorias.get_by_id(cat_id)
            if not cat or not cat.activo:
                raise CategoriaNoEncontrada(f"Categoría {cat_id} no encontrada")

            if data.nombre is not None and data.nombre != cat.nombre:
                existente = uow.categorias.get_by_nombre(data.nombre)
                if existente and existente.id != cat.id:
                    raise NombreDuplicado(f"Ya existe otra categoría con el nombre '{data.nombre}'")
                cat.nombre = data.nombre

            if data.descripcion is not None:
                cat.descripcion = data.descripcion

            uow.categorias.add(cat)
            uow.session.flush()
            uow.session.refresh(cat)
            return CategoriaRead.model_validate(cat)

    def delete(self, cat_id: int) -> None:
        with self.uow as uow:
            cat = uow.categorias.get_by_id(cat_id)
            if not cat or not cat.activo:
                raise CategoriaNoEncontrada(f"Categoría {cat_id} no encontrada")
            cat.activo = False
            uow.categorias.add(cat)
