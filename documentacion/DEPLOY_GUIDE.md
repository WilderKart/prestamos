# Guía de Despliegue — Mivank

## 🏗 Entorno Local
1. Instalar dependencias: `npm install`
2. Configurar el archivo `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
3. Iniciar el servidor de desarrollo: `npm run dev`

## ☁️ Producción (Vercel)
1. **Conexión de Rama**: Conectar la rama `main` de GitHub a un nuevo proyecto en Vercel.
2. **Variables de Entorno**: Configurar todas las variables de `.env.local` en el panel de configuración de Vercel.
3. **Build**: El comando de construcción es `npm run build`.
4. **Dominio**: Configurar el dominio personalizado con certificados SSL automáticos.

## 🗄 Base de Datos (Supabase)
1. Ejecutar las migraciones SQL proporcionadas en el directorio de migraciones.
2. Configurar las **Políticas de RLS** (Row Level Security) para el rol `anon` y `authenticated`.
3. Habilitar el módulo de **Realtime** en las tablas `pagos` y `prestamos`.
4. Configurar el Auth Provider (Email con confirmación de correo).

## 📁 Almacenamiento (Storage)
1. Crear un bucket llamado `documentos` en Supabase Storage.
2. Establecer la política de acceso: Solo lectura para capitanes de sus propios clientes, y total para el administrador.
