from sqlmodel import SQLModel


class LoginResponse(SQLModel):
    message: str = "Login exitoso"


class MessageResponse(SQLModel):
    message: str
