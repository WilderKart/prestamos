# Historial de Cambios — Mivank

## [2.0.0] - 2026-04-07
### ✨ Nuevo: Rediseño Premium Chation
- Implementación de estética **Glassmorphism**.
- Nueva paleta de colores: Negro, Dorado, Blanco, Gris Premium.
- Layouts de Capitán y Admin unificados con navegación global.
- Header y BottomNav (estilo píldora) dinámicos para móvil y escritorio.
- KPIs interactivos con sombras premium y rotación de contenedores.
- Sistema de diseño basado en utilidades de `theme.css`.

### ⚡️ Mejoras
- Refactorización de `DashboardCharts` para corregir errores de tipos.
- Limpieza profunda de `globals.css` eliminando residuos de temas oscuros.
- Mejora de los estados vacíos y carga en las vistas principales.
- Unificación de la iconografía con Lucide React.
- Sistema de logout centralizado en el Header Global.

### 🛡 Seguridad
- Auditoría de políticas de RLS.
- Implementación de logs para cada acción administrativa.
- Validación de roles en middleware y layouts del servidor.

### 🐛 Correcciones
- Solucionado error de matching en la página de Clientes.
- Ajustado espaciado inferior para evitar solapamiento con el BottomNav.
- Corregido el esquema de colores de los gráficos de Recharts para modo claro.
