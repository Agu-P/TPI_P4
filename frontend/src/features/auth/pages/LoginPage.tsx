import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useForm } from '@tanstack/react-form';
import { LogIn, Lock, User, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../../../store/authStore';
import { handleApiError } from '../../../shared/api/handleApiError';
import { Button } from '../../../shared/ui/Button';
import { Input } from '../../../shared/ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../../../shared/ui/Card';

export const LoginPage: React.FC = () => {
  const { login } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

  const form = useForm({
    defaultValues: {
      username: '',
      password: '',
    },
    onSubmit: async ({ value }) => {
      setErrorMsg(null);
      try {
        await login(value.username, value.password);
        navigate(from, { replace: true });
      } catch (err) {
        setErrorMsg(handleApiError(err));
      }
    },
  });

  return (
    <div className="flex items-center justify-center min-h-[75vh] px-4">
      <Card className="w-full max-w-md shadow-lg border-slate-200">
        <CardHeader className="text-center pb-2 pt-6">
          <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl mx-auto flex items-center justify-center mb-3">
            <LogIn className="w-6 h-6" />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-900">Iniciar Sesión</CardTitle>
          <p className="text-sm text-slate-500 mt-1">Accede a tu cuenta de Food Store</p>
        </CardHeader>

        <CardContent className="pt-4">
          {errorMsg && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2 text-sm text-red-700">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
            className="space-y-4"
          >
            <form.Field
              name="username"
              validators={{
                onChange: ({ value }) => (!value ? 'El nombre de usuario es requerido' : undefined),
              }}
            >
              {(field) => (
                <div className="relative">
                  <Input
                    label="Usuario"
                    placeholder="ej: juanperez"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    error={field.state.meta.errors?.[0]}
                  />
                  <User className="w-4 h-4 text-slate-400 absolute right-3 top-8 pointer-events-none" />
                </div>
              )}
            </form.Field>

            <form.Field
              name="password"
              validators={{
                onChange: ({ value }) => (!value ? 'La contraseña es requerida' : undefined),
              }}
            >
              {(field) => (
                <div className="relative">
                  <Input
                    label="Contraseña"
                    type="password"
                    placeholder="••••••••"
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
                  disabled={!canSubmit}
                  isLoading={isSubmitting}
                >
                  Ingresar
                </Button>
              )}
            </form.Subscribe>
          </form>

          <div className="mt-4 text-center">
            <span className="text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full inline-block">
              Demo: <strong className="text-slate-700">admin / Admin1234!</strong> o <strong className="text-slate-700">cliente / Cliente1234!</strong>
            </span>
          </div>
        </CardContent>

        <CardFooter className="justify-center border-t border-slate-100 bg-slate-50/50 py-4 text-sm text-slate-600">
          ¿No tienes una cuenta?{' '}
          <Link to="/register" className="font-semibold text-amber-600 hover:text-amber-700 ml-1">
            Regístrate aquí
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
};
