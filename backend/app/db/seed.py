from datetime import datetime, timezone
from sqlmodel import select, Session
from app.core.database import engine, create_all_tables
from app.core.security import get_password_hash
from app.modules.usuarios.models import Usuario
from app.modules.categorias.models import Categoria
from app.modules.productos.models import Producto


def seed_database():
    create_all_tables()
    with Session(engine) as session:
        # 1. Admin user
        admin = session.exec(select(Usuario).where(Usuario.username == "admin")).first()
        if not admin:
            admin = Usuario(
                username="admin",
                full_name="Administrador General",
                email="admin@foodstore.com",
                hashed_password=get_password_hash("Admin1234!"),
                role="admin",
                disabled=False,
                created_at=datetime.now(timezone.utc)
            )
            session.add(admin)
            print("Usuario admin creado: admin / Admin1234!")
        else:
            print("Usuario admin ya existe.")

        # 1.1 Usuario cliente de prueba
        cliente = session.exec(select(Usuario).where(Usuario.username == "cliente")).first()
        if not cliente:
            cliente = Usuario(
                username="cliente",
                full_name="Cliente de Prueba",
                email="cliente@foodstore.com",
                hashed_password=get_password_hash("Cliente1234!"),
                role="user",
                disabled=False,
                created_at=datetime.now(timezone.utc)
            )
            session.add(cliente)
            print("Usuario cliente creado: cliente / Cliente1234!")
        else:
            print("Usuario cliente ya existe.")

        session.commit()

        # 2. Categorías (al menos 3)
        categorias_data = [
            {"nombre": "Hamburguesas", "descripcion": "Hamburguesas artesanales de carne vacuna y pollo"},
            {"nombre": "Pizzas", "descripcion": "Pizzas a la piedra con masa madre e ingredientes frescos"},
            {"nombre": "Empanadas", "descripcion": "Empanadas tradicionales horneadas y fritas"},
            {"nombre": "Bebidas", "descripcion": "Gaseosas, aguas y cervezas artesanales bien frías"},
        ]

        categorias_map = {}
        for cat_info in categorias_data:
            cat = session.exec(select(Categoria).where(Categoria.nombre == cat_info["nombre"])).first()
            if not cat:
                cat = Categoria(
                    nombre=cat_info["nombre"],
                    descripcion=cat_info["descripcion"],
                    activo=True
                )
                session.add(cat)
                session.flush()
                session.refresh(cat)
                print(f"Categoría creada: {cat.nombre}")
            else:
                print(f"Categoría ya existe: {cat.nombre}")
            categorias_map[cat.nombre] = cat

        session.commit()

        # 3. Productos (al menos 8 con stock)
        productos_data = [
            {
                "nombre": "Hamburguesa Clásica Doble",
                "descripcion": "Doble medallón de carne, queso cheddar, lechuga, tomate y salsa especial de la casa",
                "precio_base": 6500.0,
                "imagen_url": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80",
                "stock": 25,
                "disponible": True,
                "categoria": "Hamburguesas",
            },
            {
                "nombre": "Hamburguesa Bacon & Blue",
                "descripcion": "Medallón 200g, panceta crocante, queso azul, cebolla caramelizada y rúcula",
                "precio_base": 7800.0,
                "imagen_url": "https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&auto=format&fit=crop&q=80",
                "stock": 20,
                "disponible": True,
                "categoria": "Hamburguesas",
            },
            {
                "nombre": "Pizza Muzzarella Especial",
                "descripcion": "Salsa de tomates naturales, muzzarella abundante, aceitunas verdes y orégano",
                "precio_base": 8500.0,
                "imagen_url": "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80",
                "stock": 15,
                "disponible": True,
                "categoria": "Pizzas",
            },
            {
                "nombre": "Pizza Napolitana",
                "descripcion": "Muzzarella, rodajas finas de tomate fresco, ajo picado, albahaca y oliva",
                "precio_base": 9200.0,
                "imagen_url": "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&auto=format&fit=crop&q=80",
                "stock": 18,
                "disponible": True,
                "categoria": "Pizzas",
            },
            {
                "nombre": "Docena de Empanadas de Carne",
                "descripcion": "Carne cortada a cuchillo con cebolla, huevo duro, morrón y especias criollas",
                "precio_base": 11000.0,
                "imagen_url": "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=600&auto=format&fit=crop&q=80",
                "stock": 30,
                "disponible": True,
                "categoria": "Empanadas",
            },
            {
                "nombre": "Docena de Empanadas Jamón y Queso",
                "descripcion": "Jamón cocido de primera calidad y muzzarella fundida en masa hojaldrada",
                "precio_base": 10500.0,
                "imagen_url": "https://images.unsplash.com/photo-1608897013039-887f21d8c804?w=600&auto=format&fit=crop&q=80",
                "stock": 25,
                "disponible": True,
                "categoria": "Empanadas",
            },
            {
                "nombre": "Cerveza Artesanal IPA 500ml",
                "descripcion": "India Pale Ale lupulada y refrescante, notas cítricas",
                "precio_base": 3200.0,
                "imagen_url": "https://images.unsplash.com/photo-1608270586620-248524c67de9?w=600&auto=format&fit=crop&q=80",
                "stock": 50,
                "disponible": True,
                "categoria": "Bebidas",
            },
            {
                "nombre": "Gaseosa Cola 1.5L",
                "descripcion": "Botella clásica de gaseosa cola retornable y bien helada",
                "precio_base": 2400.0,
                "imagen_url": "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600&auto=format&fit=crop&q=80",
                "stock": 40,
                "disponible": True,
                "categoria": "Bebidas",
            },
        ]

        for p_info in productos_data:
            prod = session.exec(select(Producto).where(Producto.nombre == p_info["nombre"])).first()
            if not prod:
                cat = categorias_map[p_info["categoria"]]
                prod = Producto(
                    nombre=p_info["nombre"],
                    descripcion=p_info["descripcion"],
                    precio_base=p_info["precio_base"],
                    imagen_url=p_info["imagen_url"],
                    stock=p_info["stock"],
                    disponible=p_info["disponible"],
                    activo=True,
                    categoria_id=cat.id,
                )
                session.add(prod)
                print(f"Producto creado: {prod.nombre}")
            else:
                print(f"Producto ya existe: {prod.nombre}")

        session.commit()
        print("Seed completado exitosamente.")


if __name__ == "__main__":
    seed_database()
