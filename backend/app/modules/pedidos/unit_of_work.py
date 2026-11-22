from typing import Optional, Callable
from sqlmodel import Session
from app.core.unit_of_work import UnitOfWork
from app.modules.pedidos.repository import PedidoRepository
from app.modules.productos.repository import ProductoRepository


class PedidoUnitOfWork(UnitOfWork):
    def __init__(self, session_creator: Optional[Callable[[], Session]] = None):
        super().__init__(session_creator)
        self.pedidos: Optional[PedidoRepository] = None
        self.productos: Optional[ProductoRepository] = None

    def __enter__(self):
        super().__enter__()
        self.pedidos = PedidoRepository(self.session)
        self.productos = ProductoRepository(self.session)
        return self
