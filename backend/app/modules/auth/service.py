from datetime import datetime
from typing import Optional
from app.core.security import get_password_hash, verify_password
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.schemas import UserCreate, UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork
from app.modules.usuarios.service import UsuarioDuplicado, ReglaNegocioError


class CredencialesInvalidas(Exception):
    pass


class CuentaDesactivada(Exception):
    pass


class AuthService:
    def __init__(self, uow: Optional[UsuarioUnitOfWork] = None):
        self.uow = uow or UsuarioUnitOfWork()

    def register(self, user_in: UserCreate) -> UserPublic:
        with self.uow as uow:
            if uow.usuarios.get_by_username(user_in.username):
                raise UsuarioDuplicado("El nombre de usuario ya está registrado")
            if uow.usuarios.get_by_email(user_in.email):
                raise UsuarioDuplicado("El correo electrónico ya está registrado")

            user = Usuario(
                username=user_in.username,
                full_name=user_in.full_name,
                email=user_in.email,
                hashed_password=get_password_hash(user_in.password),
                role="user",
                disabled=False
            )
            uow.usuarios.add(user)
            return UserPublic.model_validate(user)

    def authenticate(self, username: str, password: str) -> UserPublic:
        with self.uow as uow:
            user = uow.usuarios.get_by_username(username)
            if not user or not verify_password(password, user.hashed_password):
                raise CredencialesInvalidas("Credenciales incorrectas")
            if user.disabled:
                raise CuentaDesactivada("Cuenta de usuario desactivada")
            return UserPublic.model_validate(user)
