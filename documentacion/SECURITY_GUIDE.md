# Políticas de Seguridad — Mivank Zero Trust

## 🛡 Arquitectura Zero Trust
Mivank se rige por el principio de **Nunca Confiar, Siempre Verificar**. Cada solicitud de datos es validada por múltiples capas de seguridad.

## 🔑 Autenticación y Sesiones
- **Supabase Auth**: Manejo de identidad robusto con JWT.
- **Middleware**: Intercepta cada solicitud de Next.js para asegurar que el usuario esté autenticado y posea el rol necesario (`ADMIN` o `CAPITAN`).
- **Expiración**: Sesiones con tiempos de vida controlados para minimizar exposición por robo de tokens.

## 🗄 Seguridad de Base de Datos (RLS)
- **Row Level Security (RLS)**: Habilitado en todas las tablas (`usuarios`, `clientes`, `prestamos`, `pagos`, etc.).
- **Políticas Basadas en Roles**:
  - `Capitán`: Solo puede realizar SELECT/INSERT/UPDATE en registros donde su `usuario_id` o `capitan_id` coincida con el `auth.uid()`.
  - `Admin`: Permisos amplios protegidos por el mismo rol en la base de datos de Auth.
- **Sanitización**: Consultas preparadas automáticamente por PostgREST para prevenir Inyección SQL.

## 📁 Almacenamiento Seguro
- **Buckets Privados**: Los documentos de identidad y contratos residen en buckets configurados como `private`.
- **URLs Firmadas**: Solo se generan enlaces temporales para la visualización de archivos críticos, evitando exposición directa.

## 📜 Auditoría y Transparencia
- **Logs de Seguridad**: Cada cambio de estado en un préstamo o validación de pago queda registrado con un timestamp y el ID del responsable.
- **Módulo de Auditoría**: El Administrador puede revisar la trazabilidad total desde el panel `/admin/logs`.

## 🔒 Estándares Aplicados
- **OWASP Top 10**: Mitigación activa de vulnerabilidades comunes en web apps.
- **Encrypt-at-rest**: Datos cifrados en el servidor de Supabase.
- **HTTPS**: TLS 1.3 forzado en toda la comunicación.
