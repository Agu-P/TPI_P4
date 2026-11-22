import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from '@tanstack/react-form';
import { UserPlus, Lock, User, Mail, AlertCircle, CheckCircle2 } from 'lucide-react';
import { registerApi } from '../api/auth';
import { useAuthStore } from '../../../store/authStore';
import { handleApiError } from '../../../shared/api/handleApiError';
import { Button } from '../../../shared/ui/Button';
import { Input } from '../../../shared/ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../../../shared/ui/Card';

export const RegisterPage: React.FC = () => {
  const { login } = useAuthStore();
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const form = useForm({
    defaultValues: {
      username: '',
      full_name: '',
      email: '',
      password: '',
    },
    onSubmit: async ({ value }) => {
      setErrorMsg(null);
      try {
        await registerApi(value);
        setSuccess(true);
        // Login automático tras registro
        await login(value.username, value.password);
        setTimeout(() => {
          navigate('/');
        }, 800);
      } catch (err) {
        setErrorMsg(handleApiError(err));
      }
    },
  });

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4 py-8">
      <Card className="w-full max-w-md shadow-lg border-slate-200">
        <CardHeader className="text-center pb-2 pt-6">
          <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl mx-auto flex items-center justify-center mb-3">
            <UserPlus className="w-6 h-6" />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-900">Crear Cuenta</CardTitle>
          <p className="text-sm text-slate-500 mt-1">Únete a Food Store para hacer pedidos</p>
        </CardHeader>

        <CardContent className="pt-4">
          {errorMsg && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2 text-sm text-red-700">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-sm text-emerald-700">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>¡Cuenta creada con éxito! Redirigiendo...</span>
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
            className="space-y-3.5"
          >
            <form.Field
              name="username"
              validators={{
                onChange: ({ value }) => {
                  if (!value) return 'El usuario es obligatorio';
                  if (value.length < 3) return 'Mínimo 3 caracteres';
                  return undefined;
                },
              }}
            >
              {(field) => (
                <div className="relative">
                  <Input
                    label="Nombre de usuario"
                    placeholder="usuario123"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    error={field.state.meta.errors?.[0]}
                  />
                  <User className="w-4 h-4 text-slate-400 absolute right-3 top-8 pointer-events-none" />
                </div>
              )}
            </form.Field>

            <form.Field
              name="full_name"
              validators={{
                onChange: ({ value }) => {
                  if (!value) return 'El nombre completo es obligatorio';
                  if (value.length < 2) return 'Mínimo 2 caracteres';
                  return undefined;
                },
              }}
            >
              {(field) => (
                <Input
                  label="Nombre y Apellido"
                  placeholder="Juan Pérez"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  error={field.state.meta.errors?.[0]}
                />
              )}
            </form.Field>

            <form.Field
              name="email"
              validators={{
                onChange: ({ value }) => {
                  if (!value) return 'El email es obligatorio';
                  if (!/^\S+@\S+\.\S+$/.test(value)) return 'Formato de email inválido';
                  return undefined;
                },
              }}
            >
              {(field) => (
                <div className="relative">
                  <Input
                    label="Correo electrónico"
                    type="email"
                    placeholder="juan@ejemplo.com"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    error={field.state.meta.errors?.[0]}
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute right-3 top-8 pointer-events-none" />
                </div>
              )}
            </form.Field>

            <form.Field
              name="password"
              validators={{
                onChange: ({ value }) => {
                  if (!value) return 'La contraseña es obligatoria';
                  if (value.length < 8) return 'Debe tener al menos 8 caracteres';
                  return undefined;
                },
              }}
            >
              {(field) => (
                <div className="relative">
                  <Input
                    label="Contraseña"
                    type="password"
                    placeholder="Mínimo 8 caracteres"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    error={field.state.meta.errors?.[0]}
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute right-3 top-8 pointer-events-none" />
                </div>
              )}
            </form.Field>

            <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
              {([canSubmit, isSubmitting]) => (
                <Button
                  type="submit"
                  className="w-full mt-2"
                  disabled={!canSubmit || success}
                  isLoading={isSubmitting}
                >
                  Crear Cuenta
                </Button>
              )}
            </form.Subscribe>
          </form>
        </CardContent>

        <CardFooter className="justify-center border-t border-slate-100 bg-slate-50/50 py-4 text-sm text-slate-600">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="font-semibold text-amber-600 hover:text-amber-700 ml-1">
            Inicia sesión
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
};
