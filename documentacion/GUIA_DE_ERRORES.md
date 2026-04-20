# Guía de Errores Técnicos - Mivank

Esta guía proporciona una referencia para entender y solucionar los errores del sistema. Los códigos de error aparecen en la consola del navegador y en los logs del servidor.

## Diccionario de Errores

| Código | Descripción | Acción Recomendada |
| :--- | :--- | :--- |
| `AUTH_REQUIRED` | El usuario no ha iniciado sesión o su sesión expiró. | Redirigir al Login. |
| `AUTH_USER_EXISTS` | El email ya existe en la base de datos de autenticación. | Si el perfil no aparece, usar la función `get_user_id_by_email` para vincularlo. |
| `AUTH_CREATION_FAILED` | Fallo crítico al crear el registro en Supabase Auth. | Revisar logs de Auth en el Dashboard de Supabase. |
| `DB_PROFILE_ERROR` | Error al insertar o actualizar en la tabla `public.usuarios`. | Verificar restricciones de la tabla y políticas RLS. |
| `DB_CLIENT_CREATE_ERROR`| Error al insertar en la tabla `clientes`. | Verificar duplicidad de cédula o integridad referencial. |
| `STORAGE_UPLOAD_ERROR` | El archivo no se pudo subir al bucket `documentos`. | Verificar existencia del bucket y permisos de escritura. |
| `VALIDATION_MANDATORY_FIELD` | Faltan datos requeridos por la lógica de negocio. | Revisar que el formulario esté enviando todos los campos. |
| `PERMISSION_DENIED` | El usuario intenta realizar una acción fuera de su rol o empresa. | Verificar `empresa_id` en la sesión del usuario. |
| `INTERNAL_ERROR` | Error genérico no controlado. | Revisar la traza (stack trace) en la terminal del servidor. |

## Cómo Debugear

1. **Consola del Navegador**: Busca el bloque `[Mivank Technical Error Check]`. Ahí verás el objeto `details` con el mensaje original del sistema.
2. **Terminal del Servidor**: Si el error ocurre en una Server Action, la terminal de VS Code mostrará el error completo.
3. **RPC Helpers**: Si tienes problemas de desincronización de usuarios, puedes ejecutar:
   ```sql
   SELECT get_user_id_by_email('email@ejemplo.com');
   ```
   para verificar si el usuario existe en el sistema de autenticación.

---
*Mivank System - Zero Trust Architecture*
