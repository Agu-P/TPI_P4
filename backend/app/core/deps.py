from typing import Optional, Callable
from fastapi import Request, HTTPException, status, Depends
from sqlmodel import select, Session
from app.core.database import session_factory
from app.core.security import decode_access_token
from app.modules.usuarios.models import Usuario


def get_current_user(request: Request) -> Usuario:
    token: Optional[str] = request.cookies.get("access_token")
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No autenticado",
            headers={"WWW-Authenticate": "Bearer"},
        )

    payload = decode_access_token(token)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido o expirado",
            headers={"WWW-Authenticate": "Bearer"},
        )

    username: Optional[str] = payload.get("sub")
    if username is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido o expirado",
            headers={"WWW-Authenticate": "Bearer"},
        )

    with session_factory() as session:
        statement = select(Usuario).where(Usuario.username == username)
        user = session.exec(statement).first()
        if user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Usuario no encontrado",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return user


def get_current_active_user(current_user: Usuario = Depends(get_current_user)) -> Usuario:
    if current_user.disabled:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cuenta de usuario desactivada"
        )
    return current_user


def require_role(allowed_roles: list[str]) -> Callable[[Usuario], Usuario]:
    def role_checker(current_user: Usuario = Depends(get_current_active_user)) -> Usuario:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tiene permisos suficientes"
            )
        return current_user
    return role_checker
