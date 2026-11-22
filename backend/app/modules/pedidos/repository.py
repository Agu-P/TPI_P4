from datetime import datetime, date, time, timezone
from typing import Optional, Sequence
from sqlmodel import select, func, Session
from app.core.base_repository import BaseRepository
from app.modules.pedidos.models import Pedido


class PedidoRepository(BaseRepository[Pedido]):
    def __init__(self, session: Session):
        super().__init__(Pedido, session)

    def list_paginado(
        self,
        usuario_id: Optional[int] = None,
        skip: int = 0,
        limit: int = 20,
        estado: Optional[str] = None,
    ) -> tuple[int, Sequence[Pedido]]:
        query = select(Pedido)
        count_query = select(func.count(Pedido.id))

        if usuario_id is not None:
            query = query.where(Pedido.usuario_id == usuario_id)
            count_query = count_query.where(Pedido.usuario_id == usuario_id)

        if estado is not None:
            query = query.where(Pedido.estado == estado)
            count_query = count_query.where(Pedido.estado == estado)

        total = self.session.exec(count_query).one()
        items = self.session.exec(
            query.order_by(Pedido.created_at.desc()).offset(skip).limit(limit)
        ).all()
        return total, items

    def count_by_estado(self, estado: str) -> int:
        statement = select(func.count(Pedido.id)).where(Pedido.estado == estado)
        return self.session.exec(statement).one() or 0

    def count_pedidos_hoy(self) -> int:
        hoy_inicio = datetime.combine(date.today(), time.min, tzinfo=timezone.utc)
        statement = select(func.count(Pedido.id)).where(Pedido.created_at >= hoy_inicio)
        return self.session.exec(statement).one() or 0

    def ingresos_entregados(self) -> float:
        statement = select(func.sum(Pedido.total)).where(Pedido.estado == "ENTREGADO")
        resultado = self.session.exec(statement).one()
        return float(resultado or 0.0)
