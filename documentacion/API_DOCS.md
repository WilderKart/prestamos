# Documentación de APIs y Servicios — Mivank

## 🏗 Arquitectura de Datos
Mivank utiliza **Supabase** como su motor principal para la Base de Datos, Autenticación y Almacenamiento.

### 1. Modelos de Datos (PostgreSQL)
- **usuarios**: Perfil base con roles (ADMIN, CAPITAN).
- **clientes**: Información personal, financiera y de contacto.
- **fiadores**: Garantes asociados a los préstamos.
- **prestamos**: Contratos de crédito con estados (ACTIVO, LIQUIDADO, EN_MORA).
- **pagos**: Transacciones reportadas y validadas por el sistema.
- **amortizaciones**: Cronograma de pagos detallado.

### 2. Funciones RPC (Supabase Edge Functions)
- `get_user_role()`: Recupera el rol del usuario autenticado de forma segura.
- `aprobar_pago(pago_id)`: Procesa el pago y actualiza el saldo del préstamo.
- `rechazar_pago(pago_id, motivo)`: Marca pago como RECHAZADO y notifica al cliente.

### 3. Seguridad (RLS Policies)
- **Zero Trust**: Ningún usuario puede ver datos ajenos a su rol o propiedad.
- **Capitanes**: Solo ven sus propios clientes y préstamos.
- **Admin**: Acceso total de lectura y gestión de configuración.

### 4. Real-time Subscription
El sistema utiliza Canales nativos de WebSocket de Supabase para:
- Actualización automática de dashboards al registrar un pago.
- Sincronización de estados de préstamos en vivo.

### 5. Documentación Externa
Para detalles de endpoints REST generados automáticamente por PostgREST, consulte el panel de Supabase en `https://app.supabase.com/project/{project_ref}/api`.
