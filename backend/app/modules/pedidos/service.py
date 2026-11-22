from datetime import datetime, timezone
from typing import Optional
from app.modules.pedidos.models import Pedido, DetallePedido, get_utc_now
from app.modules.pedidos.schemas import (
    PedidoCreate,
    PedidoRead,
    DetallePedidoRead,
    PedidosPaginados,
    ResumenPedidos,
)
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork
from app.modules.productos.service import ProductoNoEncontrado


class PedidoNoEncontrado(Exception):
    pass


class PedidoAjeno(Exception):
    pass


class StockInsuficiente(Exception):
    pass


class ProductoNoDisponible(Exception):
    pass


class ProductoRepetido(Exception):
    pass


class TransicionInvalida(Exception):
    pass


class ReglaNegocioError(Exception):
    pass


TRANSICIONES_VALIDAS: dict[str, list[str]] = {
    "PENDIENTE": ["EN_PREPARACION", "CANCELADO"],
    "EN_PREPARACION": ["ENTREGADO", "CANCELADO"],
    "ENTREGADO": [],
    "CANCELADO": [],
}


class PedidoService:
    def __init__(self, uow: Optional[PedidoUnitOfWork] = None):
        self.uow = uow or PedidoUnitOfWork()

    def _to_read_schema(self, pedido: Pedido) -> PedidoRead:
        items = [
            DetallePedidoRead(
                producto_id=d.producto_id,
                nombre_producto=d.nombre_producto,
                precio_unitario=d.precio_unitario,
                cantidad=d.cantidad,
                subtotal=d.subtotal,
            )
            for d in pedido.items
        ]
        return PedidoRead(
            id=pedido.id,
            usuario_id=pedido.usuario_id,
            estado=pedido.estado,
            forma_pago=pedido.forma_pago,
            direccion_entrega=pedido.direccion_entrega,
            notas=pedido.notas,
            total=pedido.total,
            created_at=pedido.created_at,
            updated_at=pedido.updated_at,
            items=items,
        )

    def create(self, usuario_id: int, data: PedidoCreate) -> PedidoRead:
        if not data.items:
            raise ReglaNegocioError("El pedido debe contener al menos un producto")

        producto_ids = [item.producto_id for item in data.items]
        if len(producto_ids) != len(set(producto_ids)):
            raise ProductoRepetido("No se permiten productos repetidos en el pedido")

        with self.uow as uow:
            ahora = datetime.now(timezone.utc)
            pedido = Pedido(
                usuario_id=usuario_id,
                estado="PENDIENTE",
                forma_pago=data.forma_pago,
                direccion_entrega=data.direccion_entrega,
                notas=data.notas,
                total=0.0,
                created_at=ahora,
                updated_at=ahora,
            )
            uow.pedidos.add(pedido)
            uow.session.flush()

            total = 0.0
            detalles_creados = []

            for item in data.items:
                producto = uow.productos.get_by_id(item.producto_id)
                if not producto or not producto.activo:
                    raise ProductoNoEncontrado(f"Producto {item.producto_id} no encontrado o dado de baja")

                if not producto.disponible:
                    raise ProductoNoDisponible(f"El producto '{producto.nombre}' no está disponible")

                if producto.stock < item.cantidad:
                    raise StockInsuficiente(
                        f"Stock insuficiente para '{producto.nombre}'. Disponible: {producto.stock}, solicitado: {item.cantidad}"
                    )

                producto.stock -= item.cantidad
                uow.productos.add(producto)

                subtotal = round(producto.precio_base * item.cantidad, 2)
                total += subtotal

                detalle = DetallePedido(
                    pedido_id=pedido.id,
                    producto_id=producto.id,
                    cantidad=item.cantidad,
                    nombre_producto=producto.nombre,
                    precio_unitario=producto.precio_base,
                    subtotal=subtotal,
                )
                uow.session.add(detalle)
                detalles_creados.append(detalle)

            pedido.total = round(total, 2)
            uow.pedidos.add(pedido)
            uow.session.flush()
            uow.session.refresh(pedido)

            return self._to_read_schema(pedido)

    def list_pedidos(
        self,
        usuario_id: Optional[int],
        es_admin: bool,
        skip: int = 0,
        limit: int = 20,
        estado: Optional[str] = None,
    ) -> PedidosPaginados:
        limit = min(limit, 100)
        with self.uow as uow:
            uid = None if es_admin else usuario_id
            total, pedidos = uow.pedidos.list_paginado(
                usuario_id=uid,
                skip=skip,
                limit=limit,
                estado=estado,
            )
            items = [self._to_read_schema(p) for p in pedidos]
            return PedidosPaginados(total=total, items=items)

    def get_by_id(self, pedido_id: int, usuario_id: int, es_admin: bool) -> PedidoRead:
        with self.uow as uow:
            pedido = uow.pedidos.get_by_id(pedido_id)
            if not pedido:
                raise PedidoNoEncontrado(f"Pedido {pedido_id} no encontrado")

            if not es_admin and pedido.usuario_id != usuario_id:
                raise PedidoAjeno("No tiene permiso para ver este pedido")

            return self._to_read_schema(pedido)

    def cambiar_estado_admin(self, pedido_id: int, nuevo_estado: str) -> PedidoRead:
        with self.uow as uow:
            pedido = uow.pedidos.get_by_id(pedido_id)
            if not pedido:
                raise PedidoNoEncontrado(f"Pedido {pedido_id} no encontrado")

            validas = TRANSICIONES_VALIDAS.get(pedido.estado, [])
            if nuevo_estado not in validas:
                raise TransicionInvalida(
                    f"Transición inválida de '{pedido.estado}' a '{nuevo_estado}'"
                )

            if nuevo_estado == "CANCELADO":
                for detalle in pedido.items:
                    prod = uow.productos.get_by_id(detalle.producto_id)
                    if prod:
                        prod.stock += detalle.cantidad
                        uow.productos.add(prod)

            pedido.estado = nuevo_estado
            pedido.updated_at = datetime.now(timezone.utc)
            uow.pedidos.add(pedido)
            uow.session.flush()
            uow.session.refresh(pedido)

            return self._to_read_schema(pedido)

    def cancelar_dueño(self, pedido_id: int, usuario_id: int) -> PedidoRead:
        with self.uow as uow:
            pedido = uow.pedidos.get_by_id(pedido_id)
            if not pedido:
                raise PedidoNoEncontrado(f"Pedido {pedido_id} no encontrado")

            if pedido.usuario_id != usuario_id:
                raise PedidoAjeno("No tiene permiso para cancelar este pedido")

            if pedido.estado != "PENDIENTE":
                raise ReglaNegocioError("Solo se pueden cancelar pedidos en estado PENDIENTE")

            for detalle in pedido.items:
                prod = uow.productos.get_by_id(detalle.producto_id)
                if prod:
                    prod.stock += detalle.cantidad
                    uow.productos.add(prod)

            pedido.estado = "CANCELADO"
            pedido.updated_at = datetime.now(timezone.utc)
            uow.pedidos.add(pedido)
            uow.session.flush()
            uow.session.refresh(pedido)

            return self._to_read_schema(pedido)

    def get_resumen(self) -> ResumenPedidos:
        with self.uow as uow:
            return ResumenPedidos(
                pendientes=uow.pedidos.count_by_estado("PENDIENTE"),
                en_preparacion=uow.pedidos.count_by_estado("EN_PREPARACION"),
                entregados=uow.pedidos.count_by_estado("ENTREGADO"),
                cancelados=uow.pedidos.count_by_estado("CANCELADO"),
                pedidos_hoy=uow.pedidos.count_pedidos_hoy(),
                ingresos_entregados=uow.pedidos.ingresos_entregados(),
            )
