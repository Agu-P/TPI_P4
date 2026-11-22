from typing import Optional, TYPE_CHECKING
from sqlmodel import SQLModel, Field, Relationship

if TYPE_CHECKING:
    from app.modules.productos.models import Producto


class Categoria(SQLModel, table=True):
    __tablename__ = "categoria"

    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str = Field(unique=True, index=True, min_length=2, max_length=100, nullable=False)
    descripcion: Optional[str] = Field(default=None, nullable=True)
    activo: bool = Field(default=True, nullable=False)

    productos: list["Producto"] = Relationship(back_populates="categoria")
