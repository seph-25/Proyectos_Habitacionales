# ESTADO DE SUPABASE — HABITATRACK

> Referencia de todo lo que existe actualmente en el proyecto de Supabase,
> organizado por sprint. Proyecto académico ITCR San Carlos, I Semestre 2026.

---

## Proyecto Supabase

- **URL**: en el archivo `.env` como `VITE_SUPABASE_URL`
- **Anon Key**: en el archivo `.env` como `VITE_SUPABASE_ANON_KEY`
- **Script de cada sprint**: carpeta `supabase/` en la raíz del proyecto

---

## Sprint 1 — Base de datos inicial

> Script: no hubo migration file (tablas creadas directamente en el dashboard de Lovable/Supabase)

### Tabla: `projects`

| Columna | Tipo | Descripción |
|---|---|---|
| `id` | uuid (PK) | Generado automáticamente |
| `name` | text NOT NULL | Nombre del proyecto |
| `province` | text NOT NULL | Provincia de Costa Rica |
| `canton` | text NOT NULL | Cantón |
| `description` | text | Descripción larga |
| `project_type` | text | Residencial / Condominio / Apartamentos / Mixto |
| `units` | integer | Número de unidades |
| `start_date` | date | Fecha de inicio |
| `status` | text NOT NULL | Estado actual del proyecto |
| `created_at` | timestamptz | Auto |

### Tabla: `status_history`

| Columna | Tipo | Descripción |
|---|---|---|
| `id` | uuid (PK) | Auto |
| `project_id` | uuid (FK → projects) | Proyecto al que pertenece |
| `previous_status` | text | Estado anterior (null si es el primero) |
| `new_status` | text NOT NULL | Nuevo estado |
| `changed_by` | text | Nombre del usuario autenticado que hizo el cambio |
| `changed_at` | timestamptz | Auto |

> ⚠️ `changed_by` es texto plano, no FK. Desde Sprint 3 se usa `profile.full_name` del usuario autenticado automáticamente.

### RLS Sprint 1
Las tablas usaban políticas permisivas por defecto de Lovable. Se refinaron en sprints posteriores.

---

## Sprint 2 — Catálogo y multimedia

> Script: `supabase/sprint2_migration.sql`

### Columnas nuevas en `projects`

| Columna | Tipo | Descripción |
|---|---|---|
| `address` | text | Dirección exacta del proyecto |
| `coordinates` | text | Formato `"lat,lng"` (ej. `9.9281,-84.0907`) |
| `price_from` | bigint | Precio mínimo en CRC (colones) |
| `area_m2_from` | integer | Área mínima en m² |
| `amenities` | text[] | Array de strings (ej. `["Piscina", "Gimnasio"]`) |
| `financing_options` | jsonb | Array de objetos `{banco, tasa, plazo_anos, notas}` |
| `unit_types` | jsonb | Array de objetos `{nombre, habitaciones, banos, area_m2, precio}` |

### Tabla nueva: `project_images`

| Columna | Tipo | Descripción |
|---|---|---|
| `id` | uuid (PK) | Auto |
| `project_id` | uuid (FK → projects, CASCADE) | Proyecto dueño |
| `url` | text NOT NULL | URL pública en Supabase Storage |
| `caption` | text | Texto descriptivo opcional |
| `image_type` | text | `cover` / `gallery` / `modelo` / `amenity` |
| `display_order` | integer | Orden de visualización |
| `created_at` | timestamptz | Auto |

### RLS Sprint 2

```sql
-- project_images
Lectura pública (SELECT): USING (true)
Escritura autenticados (ALL): USING (auth.role() = 'authenticated')
```

### Supabase Storage

- **Bucket**: `project-images`
- **Tipo**: Público (cualquiera puede leer las URLs)
- **Path de archivos**: `{project_id}/{timestamp}-{random}.{ext}`
- **RLS Storage**: requiere autenticación para subir y eliminar. Por eso la subida de imágenes solo funciona cuando el usuario está logueado.

---

## Sprint 3 — Autenticación, Roles, Prospectos, Citas

> Script: `supabase/sprint3_migration.sql`

### Supabase Auth

- Sistema de autenticación nativo de Supabase (correo + contraseña)
- Las cuentas las crea el administrador manualmente en Dashboard → Authentication → Users
- **No hay registro público** — acceso exclusivo para el equipo interno

### Usuarios creados

| Correo | Nombre | Rol |
|---|---|---|
| `fabianvargas@habita.com` | Fabián Vargas | Administrador |
| `britanntromero@habita.com` | Brittany Romero | Agente de Ventas |
| `danielsalas@habita.com` | Daniel Salas | Administrador |
| `josephsalas@habita.com` | Joseph Salas | Agente de Ventas |
| `marvincampos@habita.com` | Marvin Campos | Gerente Comercial |

> Contraseñas en el documento de credenciales del equipo. Script para asignar roles y nombres correctos: `supabase/setup_users.sql`.

### Tabla nueva: `profiles`

| Columna | Tipo | Descripción |
|---|---|---|
| `id` | uuid (PK = FK → auth.users, CASCADE) | Mismo UUID que el usuario en Auth |
| `full_name` | text NOT NULL | Nombre completo del usuario |
| `role` | text NOT NULL | `Administrador` / `Agente de Ventas` / `Gerente Comercial` |
| `created_at` | timestamptz | Auto |

> Se crea automáticamente al registrar un usuario gracias al trigger `on_auth_user_created`.

### Tabla nueva: `prospectos`

| Columna | Tipo | Descripción |
|---|---|---|
| `id` | uuid (PK) | Auto |
| `nombre` | text NOT NULL | Nombre del prospecto |
| `apellidos` | text NOT NULL | Apellidos |
| `correo` | text | Correo electrónico |
| `telefono` | text | Teléfono |
| `cedula` | text | Cédula o identificación |
| `proyecto_id` | uuid (FK → projects) | Proyecto de interés |
| `presupuesto` | bigint | Presupuesto en CRC |
| `tipo_unidad_buscada` | text | Ej. "Casa 3 habitaciones" |
| `status` | text NOT NULL | `Nuevo` / `Contactado` / `Calificado` / `Negociando` / `Cerrado` / `Perdido` |
| `agente_id` | uuid (FK → profiles) | Agente asignado |
| `created_at` | timestamptz | Auto |
| `updated_at` | timestamptz | Se actualiza automáticamente con trigger |

### Tabla nueva: `prospecto_notas`

| Columna | Tipo | Descripción |
|---|---|---|
| `id` | uuid (PK) | Auto |
| `prospecto_id` | uuid (FK → prospectos, CASCADE) | Prospecto dueño |
| `contenido` | text NOT NULL | Texto de la nota |
| `autor_id` | uuid (FK → profiles) | Usuario que escribió la nota |
| `created_at` | timestamptz | Auto |

### Tabla nueva: `citas`

| Columna | Tipo | Descripción |
|---|---|---|
| `id` | uuid (PK) | Auto |
| `prospecto_id` | uuid (FK → prospectos, CASCADE) | Prospecto de la cita |
| `agente_id` | uuid (FK → profiles) | Agente responsable |
| `proyecto_id` | uuid (FK → projects) | Proyecto relacionado |
| `fecha_hora` | timestamptz NOT NULL | Fecha y hora de la cita |
| `tipo` | text NOT NULL | `Visita` / `Llamada` / `Virtual` |
| `status` | text NOT NULL | `Pendiente` / `Confirmada` / `Realizada` / `Cancelada` |
| `notas` | text | Notas adicionales |
| `created_at` | timestamptz | Auto |

### RLS Sprint 3

Todas las tablas nuevas usan la misma política:
```sql
-- Solo usuarios autenticados pueden leer y escribir
FOR ALL USING (auth.role() = 'authenticated')
```

---

## Resumen de tablas actuales

| Tabla | Sprint | Propósito |
|---|---|---|
| `projects` | 1 + 2 | Proyectos habitacionales |
| `status_history` | 1 | Historial de cambios de estado |
| `project_images` | 2 | Imágenes de proyectos |
| `profiles` | 3 | Perfiles y roles de usuarios |
| `prospectos` | 3 | Clientes potenciales |
| `prospecto_notas` | 3 | Notas de seguimiento de prospectos |
| `citas` | 3 | Agenda de visitas y llamadas |

---

## Scripts SQL disponibles

| Archivo | Cuándo ejecutar |
|---|---|
| `supabase/sprint2_migration.sql` | Una vez, antes de usar Sprint 2 |
| `supabase/sprint3_migration.sql` | Una vez, antes de usar Sprint 3 |
| `supabase/setup_users.sql` | Una vez, DESPUÉS de crear los 5 usuarios en Authentication |

> Todos los scripts usan `BEGIN` / `COMMIT` — si algo falla, se revierte todo automáticamente.
