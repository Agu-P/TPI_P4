import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  UtensilsCrossed,
  ShoppingCart,
  Receipt,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  ChevronDown,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';

export const Navbar: React.FC = () => {
  const { usuario, logout } = useAuthStore();
  const { cantidadTotal } = useCartStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [adminDropdownOpen, setAdminDropdownOpen] = useState(false);

  const totalItems = cantidadTotal();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20 group-hover:bg-amber-600 transition-colors">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight text-slate-900 block leading-tight">
                Food<span className="text-amber-600">Store</span>
              </span>
              <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider block">
                Comidas Gourmet
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              to="/"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/')
                  ? 'bg-amber-50 text-amber-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Catálogo
            </Link>

            {usuario && (
              <Link
                to={usuario.role === 'admin' ? '/admin/pedidos' : '/mis-pedidos'}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(usuario.role === 'admin' ? '/admin/pedidos' : '/mis-pedidos')
                    ? 'bg-amber-50 text-amber-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Receipt className="w-4 h-4" />
                {usuario.role === 'admin' ? 'Gestión pedidos' : 'Mis pedidos'}
              </Link>
            )}

            {usuario?.role === 'admin' && (
              <div className="relative">
                <button
                  onClick={() => setAdminDropdownOpen(!adminDropdownOpen)}
                  onBlur={() => setTimeout(() => setAdminDropdownOpen(false), 200)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    location.pathname.startsWith('/admin')
                      ? 'bg-slate-100 text-slate-900 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4 text-amber-600" />
                  Panel Admin
                  <ChevronDown className="w-3.5 h-3.5 ml-0.5 text-slate-400" />
                </button>

                {adminDropdownOpen && (
                  <div className="absolute right-0 mt-1 w-52 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-50 text-sm">
                    <Link
                      to="/admin/resumen"
                      className="block px-4 py-2 text-slate-700 hover:bg-slate-50 hover:text-amber-600 font-medium"
                    >
                      Resumen General
                    </Link>
                    <Link
                      to="/admin/productos"
                      className="block px-4 py-2 text-slate-700 hover:bg-slate-50 hover:text-amber-600 font-medium"
                    >
                      Gestión de Productos
                    </Link>
                    <Link
                      to="/admin/categorias"
                      className="block px-4 py-2 text-slate-700 hover:bg-slate-50 hover:text-amber-600 font-medium"
                    >
                      Gestión de Categorías
                    </Link>
                    <Link
                      to="/admin/usuarios"
                      className="block px-4 py-2 text-slate-700 hover:bg-slate-50 hover:text-amber-600 font-medium"
                    >
                      Gestión de Usuarios
                    </Link>
                  </div>
                )}
              </div>
            )}
          </nav>

          {/* User - Cart controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Cart button */}
            <Link
              to="/carrito"
              className="relative p-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              title="Ver Carrito"
            >
              <ShoppingCart className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-600 text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* User Session */}
            {usuario ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-sm font-semibold text-slate-800 leading-tight">
                    {usuario.full_name || usuario.username}
                  </span>
                  <span className="text-[11px] text-amber-700 font-medium capitalize">
                    {usuario.role === 'admin' ? 'Administrador' : 'Cliente'}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                  title="Cerrar sesión"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  Ingresar
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 rounded-lg text-sm font-medium bg-amber-600 text-white hover:bg-amber-700 transition-colors shadow-xs"
                >
                  Registrarse
                </Link>
              </div>
            )}

            {/* Mobile menu */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-100"
          >
            Catálogo
          </Link>
          {usuario && (
            <Link
              to={usuario.role === 'admin' ? '/admin/pedidos' : '/mis-pedidos'}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-100"
            >
              {usuario.role === 'admin' ? 'Gestión pedidos' : 'Mis pedidos'}
            </Link>
          )}
          {usuario?.role === 'admin' && (
            <div className="pt-2 border-t border-slate-100">
              <span className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Administración
              </span>
              <Link
                to="/admin/resumen"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-1.5 rounded-md text-sm text-slate-700 hover:bg-slate-100"
              >
                Resumen
              </Link>
              <Link
                to="/admin/productos"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-1.5 rounded-md text-sm text-slate-700 hover:bg-slate-100"
              >
                Productos
              </Link>
              <Link
                to="/admin/categorias"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-1.5 rounded-md text-sm text-slate-700 hover:bg-slate-100"
              >
                Categorías
              </Link>
              <Link
                to="/admin/usuarios"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-1.5 rounded-md text-sm text-slate-700 hover:bg-slate-100"
              >
                Usuarios
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
