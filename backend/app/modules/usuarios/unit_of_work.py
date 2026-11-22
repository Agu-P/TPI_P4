from typing import Optional, Callable
from sqlmodel import Session
from app.core.unit_of_work import UnitOfWork
from app.modules.usuarios.repository import UsuarioRepository


class UsuarioUnitOfWork(UnitOfWork):
    def __init__(self, session_creator: Optional[Callable[[], Session]] = None):
        super().__init__(session_creator)
        self.usuarios: Optional[UsuarioRepository] = None

    def __enter__(self):
        super().__enter__()
        self.usuarios = UsuarioRepository(self.session)
        return self
