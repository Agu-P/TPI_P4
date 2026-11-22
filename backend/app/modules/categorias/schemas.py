from typing import Optional
from sqlmodel import SQLModel, Field


class CategoriaBase(SQLModel):
    nombre: str = Field(min_length=2, max_length=100)
    descripcion: Optional[str] = Field(default=None)


class CategoriaCreate(CategoriaBase):
    pass


class CategoriaUpdate(SQLModel):
    nombre: Optional[str] = Field(default=None, min_length=2, max_length=100)
    descripcion: Optional[str] = Field(default=None)


class CategoriaRead(CategoriaBase):
    id: int
    activo: bool
