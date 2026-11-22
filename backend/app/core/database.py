from sqlmodel import SQLModel, create_engine, Session
from app.core.config import settings

# Importar todos los modelos para que el registro de SQLModel/SQLAlchemy resuelva las relaciones
from app.modules.usuarios.models import Usuario  # noqa: F401
from app.modules.categorias.models import Categoria  # noqa: F401
from app.modules.productos.models import Producto  # noqa: F401
from app.modules.pedidos.models import Pedido, DetallePedido  # noqa: F401

connect_args = {}
if settings.DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(
    settings.DATABASE_URL,
    echo=False,
    connect_args=connect_args
)


def create_all_tables():
    SQLModel.metadata.create_all(engine)


def session_factory() -> Session:
    return Session(engine, expire_on_commit=False)

