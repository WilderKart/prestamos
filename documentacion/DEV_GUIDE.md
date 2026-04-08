# Guía de Desarrollo Interno — Mivank

## 🏗 Convenciones de Código
1. **TypeScript**: Uso de tipado estricto en todos los componentes y funciones.
2. **Componentes**: Deben ser funcionales y seguir la convención del App Router de Next.js.
3. **Estilos**: Utilización de clases utilitarias de **Tailwind CSS**. Evitar clases personalizadas (`mivank-*`) en favor de las utilidades de diseño definidas en `theme.css` (`glass-card`, `header-chation`, etc.).
4. **Icons**: Siempre usar la librería **Lucide React**.

## 🎨 Sistema de Diseño "Chation"
- **Tematización**: Basada en variables de CSS en `globals.css` y `theme.css`.
- **Spacing**: Seguir múltiplos de 4px para paddings y margins (p-4, p-8, etc.).
- **Hierarchy**: Títulos con `font-black`, subtítulos con `font-bold` y tracking-tight.

## 🔗 Integración con Supabase
- **Client Side**: Usar `createClient` de `@/utils/supabase/client`.
- **Server Side**: Usar `createClient` de `@/utils/supabase/server`.
- **Middleware**: Gestiona la redirección automática según el estado de la sesión y el rol.

## 🧪 Pruebas
- Realizar pruebas manuales de navegación después de cada cambio en los layouts.
- Verificar que el `Header` y `BottomNav` no se superpongan con el contenido principal.
- Validar las políticas de RLS al realizar cambios en el esquema de la base de datos.
