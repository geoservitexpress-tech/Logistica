import type { FieldErrors } from './validators';

function formatApiMessage(message: unknown): string | undefined {
  if (typeof message === 'string') {
    return message;
  }
  if (Array.isArray(message)) {
    return message.filter((item) => typeof item === 'string').join('. ');
  }
  return undefined;
}

export function getApiErrorMessage(
  error: unknown,
  fallback = 'Ocurrió un error. Intenta de nuevo.',
): string {
  const err = error as {
    code?: string;
    response?: { status?: number; data?: { message?: unknown } };
    message?: string;
  };

  if (err?.response?.status === 403) {
    return 'Tu cuenta no tiene rol de repartidor. Cierra sesión e ingresa con un usuario repartidor.';
  }

  if (err?.response?.status === 401) {
    return 'Tu sesión expiró. Vuelve a iniciar sesión.';
  }

  const apiMessage = formatApiMessage(err?.response?.data?.message);
  if (apiMessage) {
    if (apiMessage === 'Invalid login credentials') {
      return 'Correo o contraseña incorrectos.';
    }
    return apiMessage;
  }

  const rawMessage = err?.message ?? '';
  if (
    err?.code === 'ECONNABORTED'
    || rawMessage.includes('timeout')
    || rawMessage === 'Network Error'
  ) {
    return 'No se pudo conectar al servidor. Verifica tu internet o intenta de nuevo en unos segundos.';
  }

  return rawMessage || fallback;
}

export function clearFieldError(errors: FieldErrors, field: string): FieldErrors {
  if (!errors[field]) {
    return errors;
  }
  const next = { ...errors };
  delete next[field];
  return next;
}

export function countFieldErrors(errors: FieldErrors): number {
  return Object.keys(errors).length;
}
