from typing import Optional
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork
from app.modules.usuarios.schemas import UserPublic


class UsuarioNoEncontrado(Exception):
    pass


class UsuarioDuplicado(Exception):
    pass


class ReglaNegocioError(Exception):
    pass


class UsuarioService:
    def __init__(self, uow: Optional[UsuarioUnitOfWork] = None):
        self.uow = uow or UsuarioUnitOfWork()

    def list_all(self) -> list[UserPublic]:
        with self.uow as uow:
            users = uow.usuarios.get_all(skip=0, limit=1000)
            return [UserPublic.model_validate(u) for u in users]

    def activar(self, user_id: int) -> UserPublic:
        with self.uow as uow:
            user = uow.usuarios.get_by_id(user_id)
            if not user:
                raise UsuarioNoEncontrado("Usuario inexistente")
            user.disabled = False
            uow.usuarios.add(user)
            return UserPublic.model_validate(user)

    def desactivar(self, user_id: int, current_admin_id: int) -> UserPublic:
        if user_id == current_admin_id:
            raise ReglaNegocioError("El administrador no puede desactivarse a sí mismo")
        with self.uow as uow:
            user = uow.usuarios.get_by_id(user_id)
            if not user:
                raise UsuarioNoEncontrado("Usuario inexistente")
            user.disabled = True
            uow.usuarios.add(user)
            return UserPublic.model_validate(user)
