from typing import Optional, Callable
from sqlmodel import Session
from app.core.unit_of_work import UnitOfWork
from app.modules.productos.repository import ProductoRepository
from app.modules.categorias.repository import CategoriaRepository


class ProductoUnitOfWork(UnitOfWork):
    def __init__(self, session_creator: Optional[Callable[[], Session]] = None):
        super().__init__(session_creator)
        self.productos: Optional[ProductoRepository] = None
        self.categorias: Optional[CategoriaRepository] = None

    def __enter__(self):
        super().__enter__()
        self.productos = ProductoRepository(self.session)
        self.categorias = CategoriaRepository(self.session)
        return self
