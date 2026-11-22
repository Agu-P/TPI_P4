from fastapi import APIRouter, Depends, HTTPException, Response, status
from fastapi.security import OAuth2PasswordRequestForm
from app.core.config import settings
from app.core.security import create_access_token
from app.core.deps import get_current_active_user
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.schemas import UserCreate, UserPublic
from app.modules.usuarios.service import UsuarioDuplicado
from app.modules.auth.schemas import LoginResponse, MessageResponse
from app.modules.auth.service import AuthService, CredencialesInvalidas, CuentaDesactivada

router = APIRouter(prefix="/auth", tags=["Auth"])


def get_auth_service() -> AuthService:
    return AuthService()


@router.post("/register", response_model=UserPublic, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, service: AuthService = Depends(get_auth_service)):
    try:
        return service.register(user_in)
    except UsuarioDuplicado as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))


@router.post("/token", response_model=LoginResponse)
def login(
    response: Response,
    form_data: OAuth2PasswordRequestForm = Depends(),
    service: AuthService = Depends(get_auth_service)
):
    try:
        user: UserPublic = service.authenticate(form_data.username, form_data.password)
    except CredencialesInvalidas as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
            headers={"WWW-Authenticate": "Bearer"},
        )
    except CuentaDesactivada as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    access_token = create_access_token(data={"sub": user.username, "role": user.role})
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        samesite="lax",
        secure=False,
        path="/"
    )
    return LoginResponse(message="Login exitoso")


@router.post("/logout", response_model=MessageResponse)
def logout(response: Response):
    response.delete_cookie(key="access_token", path="/")
    return MessageResponse(message="Logout exitoso")


@router.get("/me", response_model=UserPublic)
def get_me(current_user: Usuario = Depends(get_current_active_user)):
    return UserPublic.model_validate(current_user)
