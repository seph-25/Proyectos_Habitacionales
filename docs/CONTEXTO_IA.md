# CONTEXTO PARA IA — HABITATRACK CRM

> Este archivo está diseñado para ser pegado al inicio de una conversación con Claude u otra IA,
> de modo que el asistente tenga contexto completo del proyecto antes de ayudarte.

---

## ¿Qué es HABITATRACK?

CRM (Customer Relationship Management) para proyectos habitacionales en Costa Rica.
Proyecto académico del curso de Ingeniería en Computación, ITCR Campus San Carlos, I Semestre 2026.

**Equipo:**
- Daniel Salas (`danielsalas@habita.com`) — Administrador, desarrollador principal
- Fabián Vargas (`fabianvargas@habita.com`) — Administrador, colaborador
- Brittany Romero (`britanntromero@habita.com`) — Agente de Ventas
- Joseph Salas (`josephsalas@habita.com`) — Agente de Ventas
- Marvin Campos (`marvincampos@habita.com`) — Gerente Comercial

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | React 18 + TypeScript |
| Build | Vite 5 |
| Estilos | Tailwind CSS (tema personalizado) |
| Routing | react-router-dom v6 |
| Backend / DB | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Storage | Supabase Storage (bucket `project-images`) |
| Gestión de paquetes | **Bun** (NO npm ni yarn — usar siempre `bun install`, `bun run dev`) |
| Mapas | OpenStreetMap iframe (sin API key) |
| Carrusel | embla-carousel-react |
| Íconos | lucide-react |
| Fechas | date-fns con locale `es` |
| Notificaciones | sonner (toasts) |
| Formularios de estado | Estado local con useState (sin React Hook Form ni Zod) |

---

## Arquitectura general

```
/src
├── App.tsx                  # Rutas, providers (Auth, LoginModal, Router)
├── contexts/
│   ├── AuthContext.tsx       # user, session, profile, signIn, signOut
│   └── LoginModalContext.tsx # openLoginModal() — modal global de login
├── components/
│   ├── layout/
│   │   ├── AppLayout.tsx    # Wrapper principal: sidebar + topbar + children
│   │   ├── Sidebar.tsx      # Navegación lateral (diferente si hay sesión o no)
│   │   └── Topbar.tsx       # Barra superior con hamburger (mobile)
│   ├── auth/
│   │   ├── ProtectedRoute.tsx  # Redirige a /catalogo + abre modal si no hay sesión
│   │   └── LoginModal.tsx      # Popup de login con X para cerrar
│   ├── catalog/
│   │   ├── ImageUpload.tsx     # Drag & drop a Supabase Storage
│   │   ├── ImageGallery.tsx    # Carrusel embla + lightbox con teclado
│   │   ├── MapEmbed.tsx        # iframe OpenStreetMap con link a Google Maps
│   │   ├── AmenitiesGrid.tsx   # Grid de amenidades con íconos
│   │   ├── CasaModeloSection.tsx # Cards de modelos de unidades
│   │   └── FinancingSection.tsx  # Cards de opciones de financiamiento
│   ├── StatusBadge.tsx      # Badge de color según estado del proyecto
│   └── Spinner.tsx          # Spinner de carga
├── pages/
│   ├── Index.tsx            # Dashboard (requiere sesión)
│   ├── Projects.tsx         # Lista de proyectos internos (requiere sesión)
│   ├── ProjectForm.tsx      # Crear/editar proyecto (requiere sesión)
│   ├── ProjectDetail.tsx    # Detalle + historial + imágenes (requiere sesión)
│   ├── Catalog.tsx          # Catálogo público (sin sesión)
│   ├── CatalogShowroom.tsx  # Showroom público de un proyecto (sin sesión)
│   ├── Prospectos.tsx       # Lista de prospectos (requiere sesión)
│   ├── ProspectoDetail.tsx  # Perfil + edición + notas (requiere sesión)
│   ├── Citas.tsx            # Agenda de citas (requiere sesión)
│   ├── CitaForm.tsx         # Crear/editar cita (requiere sesión)
│   └── PlaceholderPage.tsx  # Placeholder para Pipeline y Reportes
├── lib/
│   ├── status.ts            # Constantes (estados, tipos, amenidades) e interfaces
│   └── utils.ts             # cn() para clases condicionales de Tailwind
└── integrations/supabase/
    ├── client.ts            # createClient con URL y anon key del .env
    └── types.ts             # Tipos TypeScript de todas las tablas de Supabase
```

---

## Rutas de la aplicación

| Ruta | Pública | Descripción |
|---|---|---|
| `/` | No | Dashboard. Si no hay sesión → redirige a `/catalogo` |
| `/catalogo` | Sí | Listado público de proyectos con filtros |
| `/catalogo/:id` | Sí | Showroom público de un proyecto |
| `/proyectos` | No | Lista interna de proyectos (CRUD) |
| `/proyectos/nuevo` | No | Formulario de nuevo proyecto |
| `/proyectos/:id` | No | Detalle del proyecto + gestión de imágenes |
| `/proyectos/:id/editar` | No | Formulario de edición del proyecto |
| `/prospectos` | No | Lista de prospectos con búsqueda y filtros |
| `/prospectos/:id` | No | Perfil del prospecto + edición + notas |
| `/citas` | No | Agenda de citas con filtros |
| `/citas/nueva` | No | Formulario nueva cita |
| `/citas/:id/editar` | No | Formulario editar cita |
| `/pipeline` | No | Placeholder — Sprint futuro |
| `/reportes` | No | Placeholder — Sprint futuro |

---

## Roles del sistema

| Rol | Descripción |
|---|---|
| `Administrador` | Acceso total al sistema |
| `Agente de Ventas` | Gestiona sus propios prospectos y citas |
| `Gerente Comercial` | Vista de supervisión — lectura de todo, sin modificar |

---

## Decisiones importantes del proyecto

- **Bun como package manager**: el proyecto usa `bun.lock`. Nunca usar `npm install`.
- **Puerto de desarrollo**: configurado en `5173` (el 8080 conflictuaba con EDB PostgreSQL local).
- **Login como modal**: no existe ruta `/login`. El login es un popup global accesible desde el sidebar.
- **Catálogo siempre público**: `/catalogo` y `/catalogo/:id` no requieren autenticación.
- **`changed_by` en historial**: usa `profile.full_name` del usuario autenticado, no texto hardcodeado.
- **Imágenes**: se suben a Supabase Storage (bucket `project-images`, público). La primera imagen se marca automáticamente como `cover`. Las políticas RLS del bucket requieren autenticación para subir/eliminar.
- **Coordenadas**: se guardan como texto `"lat,lng"` (ej. `9.9281,-84.0907`) en la columna `coordinates` de la tabla `projects`.
- **JSONB**: `financing_options` y `unit_types` en `projects` son columnas JSONB que almacenan arrays de objetos TypeScript.
- **shadcn/ui**: se usa `Dialog` para modales y algunos componentes de UI. Si se necesita agregar uno eliminado, usar `npx shadcn@latest add <componente>`.

---

## Variables de entorno requeridas (`.env`)

```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

---

## Comandos útiles

```bash
bun install          # Instalar dependencias
bun run dev          # Servidor de desarrollo (http://localhost:5173)
bun run build        # Build de producción
```

---

## Estado del proyecto por sprint

| Sprint | Estado | Tareas completadas |
|---|---|---|
| Sprint 1 | ✅ Completo | PH-21, PH-22, PH-23, PH-24 |
| Sprint 2 | ✅ Completo | PH-32, PH-33, PH-34, PH-35, PH-36, PH-37, PH-38 |
| Sprint 3 | ✅ Completo | PH-48, PH-49, PH-50, PH-51, PH-52, PH-53 |
| Sprint 4 | 🔲 Pendiente | Pipeline, Reportes y más |
