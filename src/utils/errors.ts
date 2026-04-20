/**
 * Mivank Financial System: Error Handling Module
 * Consistent with Zero Trust principles and provides technical clarity for developers.
 */

export type MivankErrorCode = 
  | 'AUTH_REQUIRED'
  | 'AUTH_USER_EXISTS'
  | 'AUTH_CREATION_FAILED'
  | 'DB_PROFILE_ERROR'
  | 'DB_CLIENT_CREATE_ERROR'
  | 'STORAGE_UPLOAD_ERROR'
  | 'VALIDATION_MANDATORY_FIELD'
  | 'PERMISSION_DENIED'
  | 'INTERNAL_ERROR';

interface MivankErrorResponse {
  error: string;
  code: MivankErrorCode;
  details?: any;
}

const ERROR_MESSAGES: Record<MivankErrorCode, string> = {
  AUTH_REQUIRED: 'Autenticación requerida. Por favor, inicia sesión.',
  AUTH_USER_EXISTS: 'Este correo electrónico ya está registrado en el sistema.',
  AUTH_CREATION_FAILED: 'Error crítico al crear el usuario de acceso.',
  DB_PROFILE_ERROR: 'No se pudo sincronizar el perfil de usuario en la base de datos.',
  DB_CLIENT_CREATE_ERROR: 'Error al registrar los datos finales del cliente.',
  STORAGE_UPLOAD_ERROR: 'No se pudo subir el documento al almacenamiento seguro.',
  VALIDATION_MANDATORY_FIELD: 'Falta un campo obligatorio necesario para continuar.',
  PERMISSION_DENIED: 'No tienes permisos suficientes para realizar esta acción.',
  INTERNAL_ERROR: 'Ocurrió un error inesperado en el servidor.',
};

/**
 * Handles errors on the server side, logs technical details to the console
 * and returns a user-friendly object for the UI.
 */
export function handleMivankError(
  action: string,
  error: any,
  code: MivankErrorCode = 'INTERNAL_ERROR',
  customMessage?: string
): MivankErrorResponse {
  const technicalDetails = {
    action,
    code,
    message: error?.message || error,
    originalError: error,
    timestamp: new Date().toISOString()
  };

  // LOG TÉCNICO PARA CONSOLA/TERMINAL (Visible para el desarrollador)
  console.error(`\n[Mivank Technical Error Check] -----------------`);
  console.error(`ACTION: ${action}`);
  console.error(`CODE: ${code}`);
  console.error(`DETAILS:`, JSON.stringify(technicalDetails, null, 2));
  console.error(`----------------------------------------------\n`);

  return {
    error: (customMessage || ERROR_MESSAGES[code] || ERROR_MESSAGES.INTERNAL_ERROR).toUpperCase(),
    code,
    details: process.env.NODE_ENV === 'development' ? technicalDetails : undefined
  };
}
