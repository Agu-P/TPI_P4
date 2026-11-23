from typing import Optional, Sequence
from sqlmodel import select, Session
from app.core.base_repository import BaseRepository
from app.modules.categorias.models import Categoria


class CategoriaRepository(BaseRepository[Categoria]):
    def __init__(self, session: Session):
        super().__init__(Categoria, session)

    def get_by_nombre(self, nombre: str) -> Optional[Categoria]:
        statement = select(Categoria).where(
            Categoria.nombre == nombre,
            Categoria.activo == True
        )
        return self.session.exec(statement).first()

    def get_by_nombre_incluyendo_inactivas(self, nombre: str) -> Optional[Categoria]:
        statement = select(Categoria).where(Categoria.nombre == nombre)
        return self.session.exec(statement).first()

    def get_all_activas(self) -> Sequence[Categoria]:
        statement = select(Categoria).where(Categoria.activo == True).order_by(Categoria.nombre)
        return self.session.exec(statement).all()
