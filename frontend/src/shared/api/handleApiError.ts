export function handleApiError(error: unknown): string {
  if (!error) return 'Ha ocurrido un error inesperado';

  const err = error as {
    response?: {
      data?: {
        detail?: string | Array<{ msg?: string; loc?: string[] }>;
      };
      status?: number;
    };
    message?: string;
  };

  const detail = err.response?.data?.detail;

  if (typeof detail === 'string') {
    return detail;
  }

  if (Array.isArray(detail)) {
    return detail.map((d) => d.msg || JSON.stringify(d)).join(', ');
  }

  if (err.message) {
    return err.message;
  }

  return 'Error de conexión con el servidor';
}
