# ESTADO DEL CÓDIGO — HABITATRACK

> Qué se implementó en cada sprint, qué archivos existen y cómo están organizados.

---

## Sprint 1 — Estructura base y CRUD de proyectos

### Lo que se hizo

- Configuración del proyecto: Vite 5, React 18, TypeScript, Tailwind CSS, react-router-dom v6
- Corrección del puerto de desarrollo a `5173` (conflicto con EDB PostgreSQL en puerto 8080)
- Sidebar responsive con overlay mobile, traducido al español
- Topbar con botón hamburger en mobile
- Sistema de rutas base en `App.tsx`
- Página de proyectos (`/proyectos`) con búsqueda por nombre, cantón y provincia
- Formulario de creación y edición de proyectos (`/proyectos/nuevo`, `/proyectos/:id/editar`)
- Detalle del proyecto (`/proyectos/:id`) con historial de cambios de estado
- Cambio de estado con Dialog de confirmación
- `StatusBadge` con colores por estado
- Página 404 en español
- Limpieza de componentes shadcn/ui no usados (45 archivos eliminados)
- Fix de vulnerabilidades npm con `overrides` en `package.json`

### Archivos clave Sprint 1

```
src/App.tsx
src/pages/Index.tsx
src/pages/Projects.tsx
src/pages/ProjectForm.tsx
src/pages/ProjectDetail.tsx
src/pages/NotFound.tsx
src/pages/PlaceholderPage.tsx
src/components/layout/AppLayout.tsx
src/components/layout/Sidebar.tsx
src/components/layout/Topbar.tsx
src/components/StatusBadge.tsx
src/components/Spinner.tsx
src/lib/status.ts              ← constantes de estados y provincias
src/lib/utils.ts               ← cn() para clases Tailwind
src/integrations/supabase/client.ts
src/integrations/supabase/types.ts
```

---

## Sprint 2 — Catálogo público y multimedia

### Lo que se hizo

- Nuevas interfaces en `src/lib/status.ts`: `UnitType`, `FinancingOption`, `AMENITIES_LIST`
- Actualización de `src/integrations/supabase/types.ts` con nuevas columnas y tabla `project_images`
- Componentes del catálogo en `src/components/catalog/`:
  - `ImageUpload.tsx` — drag & drop, sube a Supabase Storage, marca portada, elimina
  - `ImageGallery.tsx` — carrusel embla-carousel con thumbnails + lightbox con teclado (←/→/Escape)
  - `MapEmbed.tsx` — iframe OpenStreetMap con enlace a Google Maps
  - `AmenitiesGrid.tsx` — grid de amenidades con íconos lucide-react
  - `CasaModeloSection.tsx` — cards de modelos de unidades (habitaciones, baños, área, precio)
  - `FinancingSection.tsx` — cards de opciones de financiamiento (banco, tasa, plazo, notas)
- Página catálogo público `src/pages/Catalog.tsx`:
  - Grid 3 columnas con imagen de portada, estado, tipo, nombre, ubicación, precio
  - Filtros: búsqueda por texto, estado, tipo de proyecto
- Página showroom `src/pages/CatalogShowroom.tsx`:
  - Hero con estadísticas rápidas (unidades, área, precio, fecha)
  - Galería de imágenes, ficha técnica, mapa, amenidades, modelos, financiamiento
- Actualización de `ProjectDetail.tsx`: sección de gestión de imágenes con `ImageUpload`
- Actualización de `ProjectForm.tsx`: 5 secciones — Info General, Ubicación/Precios, Amenidades (checkboxes), Modelos de Unidades (manager), Opciones de Financiamiento (manager)
- Rutas nuevas en `App.tsx`: `/catalogo` y `/catalogo/:id`

### Archivos clave Sprint 2

```
src/pages/Catalog.tsx
src/pages/CatalogShowroom.tsx
src/components/catalog/ImageUpload.tsx
src/components/catalog/ImageGallery.tsx
src/components/catalog/MapEmbed.tsx
src/components/catalog/AmenitiesGrid.tsx
src/components/catalog/CasaModeloSection.tsx
src/components/catalog/FinancingSection.tsx
supabase/sprint2_migration.sql
```

---

## Sprint 3 — Autenticación, Roles, Prospectos, Citas

### Lo que se hizo

**Autenticación (PH-48):**
- `src/contexts/AuthContext.tsx` — provee `user`, `session`, `profile`, `loading`, `signIn`, `signOut`
- `src/contexts/LoginModalContext.tsx` — provee `openLoginModal()` globalmente
- `src/components/auth/LoginModal.tsx` — popup de login con X visible, fondo oscuro clickeable, sin página separada
- `src/components/auth/ProtectedRoute.tsx` — redirige a `/catalogo` y abre modal si no hay sesión
- Eliminada la página `/login` — el login es 100% modal
- `App.tsx` actualizado con `AuthProvider` y `LoginModalProvider`

**Sidebar inteligente (PH-48/49):**
- Sin sesión: solo muestra "Catálogo" + botón "Iniciar Sesión"
- Con sesión: muestra todos los links + nombre/rol del usuario + "Cerrar Sesión"
- El avatar y "Cerrar Sesión" están completamente ocultos si no hay sesión

**Roles (PH-49):**
- Trigger automático en PostgreSQL crea el perfil al registrar cada usuario
- Script `supabase/setup_users.sql` corrige nombres y roles de los 5 usuarios del equipo

**Prospectos (PH-50/51):**
- `src/pages/Prospectos.tsx` — lista con tabla, búsqueda, filtro por estado, modal de creación rápida
- `src/pages/ProspectoDetail.tsx` — perfil completo con edición inline (datos personales, interés, estado) + panel de notas de seguimiento (agregar/eliminar)

**Citas (PH-52/53):**
- `src/pages/Citas.tsx` — lista con cards por fecha, filtros por estado y tipo, cancelación directa, badge "Vencida" para citas pasadas pendientes
- `src/pages/CitaForm.tsx` — formulario de crear/editar cita (prospecto, proyecto, fecha/hora, tipo, estado, notas)

**Fix de `changed_by` (sin tarea Jira):**
- `ProjectDetail.tsx` ahora usa `profile?.full_name` del usuario autenticado en lugar de texto hardcodeado "Daniel Salas"

### Archivos clave Sprint 3

```
src/contexts/AuthContext.tsx
src/contexts/LoginModalContext.tsx
src/components/auth/ProtectedRoute.tsx
src/components/auth/LoginModal.tsx
src/pages/Prospectos.tsx
src/pages/ProspectoDetail.tsx
src/pages/Citas.tsx
src/pages/CitaForm.tsx
supabase/sprint3_migration.sql
supabase/setup_users.sql
```

---

## Estado actual de rutas en App.tsx

```tsx
// Públicas (sin sesión)
/                    → RootRoute: redirige a /catalogo si no hay sesión
/catalogo            → Catalog
/catalogo/:id        → CatalogShowroom

// Protegidas (abren modal si no hay sesión)
/proyectos           → Projects
/proyectos/nuevo     → ProjectForm
/proyectos/:id       → ProjectDetail
/proyectos/:id/editar→ ProjectForm
/prospectos          → Prospectos
/prospectos/:id      → ProspectoDetail
/citas               → Citas
/citas/nueva         → CitaForm
/citas/:id/editar    → CitaForm
/pipeline            → PlaceholderPage
/reportes            → PlaceholderPage
*                    → NotFound
```

---

## Constantes en `src/lib/status.ts`

```typescript
PROJECT_STATUSES  // ["En gestación", "En construcción", "Parcialmente terminado", "Terminado", "En gestión de venta"]
PROJECT_TYPES     // ["Residencial", "Condominio", "Apartamentos", "Mixto"]
PROVINCES         // 7 provincias de Costa Rica
AMENITIES_LIST    // 20 amenidades predefinidas
STATUS_STYLES     // Colores Tailwind por estado (bg, text, dot)

interface UnitType        { nombre, habitaciones, banos, area_m2, precio }
interface FinancingOption { banco, tasa, plazo_anos, notas }
```

---

## Patrones de código usados en el proyecto

- **Fetch de datos**: IIFE async dentro de `useEffect`, sin React Query para datos de Supabase
- **Formularios**: `useState` con objeto de estado, validación manual antes del submit
- **Rutas protegidas**: componente `<ProtectedRoute>` que envuelve cada ruta
- **Notificaciones**: `toast.success()` / `toast.error()` de sonner
- **Clases condicionales**: función `cn()` de `@/lib/utils`
- **Formateo de moneda**: `Intl.NumberFormat("es-CR", { style: "currency", currency: "CRC" })`
- **Formateo de fechas**: `date-fns` con `{ locale: es }`
- **Alias de imports**: `@/` apunta a `src/` (configurado en `vite.config.ts` y `tsconfig`)

---

## Lo que NO se ha implementado aún

| Funcionalidad | Sprint previsto |
|---|---|
| Pipeline de ventas (Kanban) | Sprint 4 |
| Reportes y métricas | Sprint 4 |
| Gestión de usuarios desde la app (sin ir a Supabase) | Sprint futuro |
| Filtros por agente asignado en prospectos/citas | Sprint futuro |
| Notificaciones de citas próximas | Sprint futuro |
| Exportar reportes a PDF/Excel | Sprint futuro |
| RLS por rol (agente solo ve sus prospectos) | Sprint futuro |
