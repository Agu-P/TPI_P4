from typing import Optional, TYPE_CHECKING
from sqlmodel import SQLModel, Field, Relationship

if TYPE_CHECKING:
    from app.modules.categorias.models import Categoria
    from app.modules.pedidos.models import DetallePedido


class Producto(SQLModel, table=True):
    __tablename__ = "producto"

    id: Optional[int] = Field(default=None, primary_key=True)
    categoria_id: int = Field(foreign_key="categoria.id", nullable=False)
    nombre: str = Field(nullable=False)
    descripcion: Optional[str] = Field(default=None, nullable=True)
    precio_base: float = Field(default=0.0, ge=0, nullable=False)
    imagen_url: Optional[str] = Field(default=None, nullable=True)
    stock: int = Field(default=0, ge=0, nullable=False)
    disponible: bool = Field(default=True, nullable=False)
    activo: bool = Field(default=True, nullable=False)

    categoria: Optional["Categoria"] = Relationship(back_populates="productos")
    detalles: list["DetallePedido"] = Relationship(back_populates="producto")
