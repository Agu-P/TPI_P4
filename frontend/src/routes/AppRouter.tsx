import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from '../shared/layout/MainLayout';
import { ProtectedRoute } from './ProtectedRoute';

// Public pages
import { CatalogoPage } from '../features/productos/pages/CatalogoPage';
import { CarritoPage } from '../features/pedidos/pages/CarritoPage';
import { LoginPage } from '../features/auth/pages/LoginPage';
import { RegisterPage } from '../features/auth/pages/RegisterPage';
import { UnauthorizedPage } from '../features/auth/pages/UnauthorizedPage';

// Client session pages
import { CheckoutPage } from '../features/pedidos/pages/CheckoutPage';
import { MisPedidosPage } from '../features/pedidos/pages/MisPedidosPage';

// Admin pages
import { AdminResumenPage } from '../features/pedidos/pages/AdminResumenPage';
import { AdminPedidosPage } from '../features/pedidos/pages/AdminPedidosPage';
import { AdminProductosPage } from '../features/productos/pages/AdminProductosPage';
import { AdminCategoriasPage } from '../features/categorias/pages/AdminCategoriasPage';
import { AdminUsuariosPage } from '../features/usuarios/pages/AdminUsuariosPage';

export const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          {/* Rutas Públicas */}
          <Route path="/" element={<CatalogoPage />} />
          <Route path="/carrito" element={<CarritoPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          {/* Rutas Protegidas - Cliente con Sesión (user o admin) */}
          <Route element={<ProtectedRoute allowedRoles={['user', 'admin']} />}>
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/mis-pedidos" element={<MisPedidosPage />} />
          </Route>

          {/* Rutas Protegidas - Solo Administrador */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/admin/resumen" element={<AdminResumenPage />} />
            <Route path="/admin/pedidos" element={<AdminPedidosPage />} />
            <Route path="/admin/productos" element={<AdminProductosPage />} />
            <Route path="/admin/categorias" element={<AdminCategoriasPage />} />
            <Route path="/admin/usuarios" element={<AdminUsuariosPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
