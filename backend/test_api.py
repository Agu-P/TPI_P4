from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def run_tests():
    print("Iniciando pruebas de la API...")

    # 1. Login Admin
    login_res = client.post(
        "/api/v1/auth/token",
        data={"username": "admin", "password": "Admin1234!"}
    )
    assert login_res.status_code == 200, f"Login admin falló: {login_res.text}"
    admin_cookies = login_res.cookies
    assert "access_token" in admin_cookies, "Cookie access_token no encontrada"
    print("✓ Login admin exitoso con cookie HttpOnly")

    # 2. Login Cliente
    login_cli = client.post(
        "/api/v1/auth/token",
        data={"username": "cliente", "password": "Cliente1234!"}
    )
    assert login_cli.status_code == 200, f"Login cliente falló: {login_cli.text}"
    cliente_cookies = login_cli.cookies
    print("✓ Login cliente exitoso")

    # 3. GET /auth/me
    me_res = client.get("/api/v1/auth/me", cookies=cliente_cookies)
    assert me_res.status_code == 200, me_res.text
    assert me_res.json()["username"] == "cliente"
    print("✓ GET /auth/me correcto")

    # 4. Categorías públicas y creación con admin
    cats_res = client.get("/api/v1/categorias")
    assert cats_res.status_code == 200
    cats = cats_res.json()
    assert len(cats) >= 3
    print(f"✓ GET /categorias devolvió {len(cats)} categorías activas")

    # 5. Productos públicos
    prods_res = client.get("/api/v1/productos?skip=0&limit=5")
    assert prods_res.status_code == 200
    prods_data = prods_res.json()
    assert prods_data["total"] >= 8
    assert len(prods_data["items"]) == 5
    first_prod = prods_data["items"][0]
    stock_original = first_prod["stock"]
    prod_id = first_prod["id"]
    print(f"✓ GET /productos paginado: total {prods_data['total']}, primer producto '{first_prod['nombre']}' con stock {stock_original}")

    # 6. Crear Pedido (RN-01, RN-06)
    pedido_payload = {
        "items": [
            {"producto_id": prod_id, "cantidad": 2}
        ],
        "forma_pago": "EFECTIVO",
        "direccion_entrega": "Av. Siempreviva 742",
        "notas": "Tocar timbre blanco"
    }
    crear_res = client.post("/api/v1/pedidos", json=pedido_payload, cookies=cliente_cookies)
    assert crear_res.status_code == 201, f"Crear pedido falló: {crear_res.text}"
    pedido = crear_res.json()
    pedido_id = pedido["id"]
    assert pedido["estado"] == "PENDIENTE"
    assert pedido["total"] == round(first_prod["precio_base"] * 2, 2)
    assert len(pedido["items"]) == 1
    assert pedido["items"][0]["nombre_producto"] == first_prod["nombre"]
    print(f"✓ RN-01: Pedido {pedido_id} creado correctamente en PENDIENTE. Total: {pedido['total']}")

    # 7. Verificar que el stock se descontó
    prod_despues = client.get(f"/api/v1/productos/{prod_id}").json()
    assert prod_despues["stock"] == stock_original - 2, f"Stock no se descontó correctamente: {prod_despues['stock']}"
    print(f"✓ RN-01: Stock descontado exitosamente de {stock_original} a {prod_despues['stock']}")

    # 8. Cancelar pedido por el dueño (RN-03, RN-04)
    canc_res = client.patch(f"/api/v1/pedidos/{pedido_id}/cancelar", cookies=cliente_cookies)
    assert canc_res.status_code == 200, f"Cancelar falló: {canc_res.text}"
    assert canc_res.json()["estado"] == "CANCELADO"
    print("✓ RN-03/04: Pedido cancelado por el cliente dueño")

    # 9. Verificar que el stock se restituyó (RN-03)
    prod_restituido = client.get(f"/api/v1/productos/{prod_id}").json()
    assert prod_restituido["stock"] == stock_original, f"Stock no se restituyó: {prod_restituido['stock']}"
    print(f"✓ RN-03: Stock restituido exitosamente a {stock_original}")

    # 10. Probar validación de producto repetido (RN-01)
    rep_res = client.post(
        "/api/v1/pedidos",
        json={
            "items": [
                {"producto_id": prod_id, "cantidad": 1},
                {"producto_id": prod_id, "cantidad": 2}
            ],
            "forma_pago": "TRANSFERENCIA",
            "direccion_entrega": "Calle Falsa 123"
        },
        cookies=cliente_cookies
    )
    assert rep_res.status_code == 400, "Debió rechazar productos repetidos"
    print("✓ RN-01: Productos repetidos rechazados con 400")

    # 11. Probar validación de stock insuficiente (RN-01)
    exceso_res = client.post(
        "/api/v1/pedidos",
        json={
            "items": [
                {"producto_id": prod_id, "cantidad": 99999}
            ],
            "forma_pago": "TRANSFERENCIA",
            "direccion_entrega": "Calle Falsa 123"
        },
        cookies=cliente_cookies
    )
    assert exceso_res.status_code == 400, "Debió rechazar stock insuficiente"
    print("✓ RN-01: Stock insuficiente rechazado con 400")

    # 12. Máquina de estados (RN-02)
    nuevo_pedido = client.post(
        "/api/v1/pedidos",
        json={
            "items": [{"producto_id": prod_id, "cantidad": 1}],
            "forma_pago": "EFECTIVO",
            "direccion_entrega": "Calle 10 Nro 500"
        },
        cookies=cliente_cookies
    ).json()
    np_id = nuevo_pedido["id"]

    # Admin avanza a EN_PREPARACION
    avanza_res = client.patch(
        f"/api/v1/pedidos/{np_id}/estado",
        json={"estado": "EN_PREPARACION"},
        cookies=admin_cookies
    )
    assert avanza_res.status_code == 200
    assert avanza_res.json()["estado"] == "EN_PREPARACION"
    print("✓ RN-02: Transición a EN_PREPARACION exitosa")

    # Cliente intenta cancelar en EN_PREPARACION -> debe dar 400 (RN-04)
    cli_canc_fail = client.patch(f"/api/v1/pedidos/{np_id}/cancelar", cookies=cliente_cookies)
    assert cli_canc_fail.status_code == 400, "Cliente no debe cancelar si no está en PENDIENTE"
    print("✓ RN-04: Cliente no puede cancelar en EN_PREPARACION (400)")

    # Admin avanza a ENTREGADO
    avanza_entregado = client.patch(
        f"/api/v1/pedidos/{np_id}/estado",
        json={"estado": "ENTREGADO"},
        cookies=admin_cookies
    )
    assert avanza_entregado.status_code == 200
    assert avanza_entregado.json()["estado"] == "ENTREGADO"
    print("✓ RN-02: Transición a ENTREGADO exitosa")

    # Transición desde ENTREGADO (terminal) debe dar 400
    invalida = client.patch(
        f"/api/v1/pedidos/{np_id}/estado",
        json={"estado": "CANCELADO"},
        cookies=admin_cookies
    )
    assert invalida.status_code == 400
    print("✓ RN-02: Transición desde estado terminal rechazada con 400")

    # 13. Resumen de pedidos para Admin
    resumen_res = client.get("/api/v1/pedidos/resumen", cookies=admin_cookies)
    assert resumen_res.status_code == 200
    resumen = resumen_res.json()
    assert resumen["entregados"] >= 1
    assert resumen["cancelados"] >= 1
    assert resumen["ingresos_entregados"] > 0
    print(f"✓ GET /pedidos/resumen: entregados={resumen['entregados']}, ingresos={resumen['ingresos_entregados']}")

    # 14. Admin usuarios: listar, activar, desactivar (y regla no autodesactivarse)
    users_res = client.get("/api/v1/admin/usuarios", cookies=admin_cookies)
    assert users_res.status_code == 200
    assert len(users_res.json()) >= 2

    admin_user = [u for u in users_res.json() if u["username"] == "admin"][0]
    cli_user = [u for u in users_res.json() if u["username"] == "cliente"][0]

    # Admin intenta desactivarse a sí mismo -> 400
    self_desact = client.post(f"/api/v1/admin/usuarios/{admin_user['id']}/desactivar", cookies=admin_cookies)
    assert self_desact.status_code == 400
    print("✓ Admin no puede desactivarse a sí mismo (400)")

    # Admin desactiva cliente
    desact_cli = client.post(f"/api/v1/admin/usuarios/{cli_user['id']}/desactivar", cookies=admin_cookies)
    assert desact_cli.status_code == 200
    assert desact_cli.json()["disabled"] is True
    print("✓ Admin desactivó a usuario cliente")

    # Cliente desactivado intenta login -> 400 Cuenta de usuario desactivada
    cli_login_desact = client.post(
        "/api/v1/auth/token",
        data={"username": "cliente", "password": "Cliente1234!"}
    )
    assert cli_login_desact.status_code == 400
    assert "Cuenta de usuario desactivada" in cli_login_desact.json()["detail"]
    print("✓ Cliente desactivado rechazado en login con 'Cuenta de usuario desactivada' (400)")

    # Admin reactiva cliente
    react_cli = client.post(f"/api/v1/admin/usuarios/{cli_user['id']}/activar", cookies=admin_cookies)
    assert react_cli.status_code == 200
    assert react_cli.json()["disabled"] is False
    print("✓ Admin reactivó al usuario cliente exitosamente")

    print("\n==========================================")
    print("¡TODAS LAS PRUEBAS DEL BACKEND PASARON CON ÉXITO!")
    print("==========================================\n")


if __name__ == "__main__":
    run_tests()
