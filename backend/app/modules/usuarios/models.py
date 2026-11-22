from datetime import datetime, timezone
from typing import Optional, TYPE_CHECKING
from sqlmodel import SQLModel, Field, Relationship

if TYPE_CHECKING:
    from app.modules.pedidos.models import Pedido


def get_utc_now() -> datetime:
    return datetime.now(timezone.utc)


class Usuario(SQLModel, table=True):
    __tablename__ = "usuario"

    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(unique=True, index=True, nullable=False)
    full_name: str = Field(nullable=False)
    email: str = Field(unique=True, index=True, nullable=False)
    hashed_password: str = Field(nullable=False)
    role: str = Field(default="user", nullable=False)
    disabled: bool = Field(default=False, nullable=False)
    created_at: datetime = Field(default_factory=get_utc_now, nullable=False)

    pedidos: list["Pedido"] = Relationship(back_populates="usuario")

