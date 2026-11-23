from sqlmodel import SQLModel, create_engine, Session
from app.core.config import settings

from app.modules.usuarios.models import Usuario  
from app.modules.categorias.models import Categoria  
from app.modules.productos.models import Producto  
from app.modules.pedidos.models import Pedido, DetallePedido 

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
    migrate_producto_categoria_nullable()


def migrate_producto_categoria_nullable():
    if not settings.DATABASE_URL.startswith("sqlite"):
        return

    with engine.begin() as connection:
        table_info = connection.exec_driver_sql("PRAGMA table_info(producto)").all()
        categoria_column = next((column for column in table_info if column[1] == "categoria_id"), None)
        if categoria_column is None or categoria_column[3] == 0:
            return

        connection.exec_driver_sql("PRAGMA foreign_keys=OFF")
        connection.exec_driver_sql(
            """
            CREATE TABLE producto_new (
                id INTEGER PRIMARY KEY,
                categoria_id INTEGER,
                nombre VARCHAR NOT NULL,
                descripcion VARCHAR,
                precio_base FLOAT NOT NULL,
                imagen_url VARCHAR,
                stock INTEGER NOT NULL,
                disponible BOOLEAN NOT NULL,
                activo BOOLEAN NOT NULL,
                FOREIGN KEY(categoria_id) REFERENCES categoria (id)
            )
            """
        )
        connection.exec_driver_sql(
            """
            INSERT INTO producto_new (
                id, categoria_id, nombre, descripcion, precio_base,
                imagen_url, stock, disponible, activo
            )
            SELECT
                id, categoria_id, nombre, descripcion, precio_base,
                imagen_url, stock, disponible, activo
            FROM producto
            """
        )
        connection.exec_driver_sql("DROP TABLE producto")
        connection.exec_driver_sql("ALTER TABLE producto_new RENAME TO producto")
        connection.exec_driver_sql("PRAGMA foreign_keys=ON")


def session_factory() -> Session:
    return Session(engine, expire_on_commit=False)

