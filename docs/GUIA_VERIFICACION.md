# GUÍA DE VERIFICACIÓN — HABITATRACK

> Checklist de lo que debe funcionar al final de cada sprint.
> Para verificar: ejecutar `bun run dev` y probar cada punto en el navegador.

---

## Antes de iniciar cualquier verificación

```bash
# Siempre usar Bun, nunca npm
bun install
bun run dev
# Abrir http://localhost:5173
```

---

## ✅ Sprint 1 — Base de la aplicación

### Lo que debe funcionar

- [ ] Al abrir `http://localhost:5173` sin sesión → redirige al catálogo (`/catalogo`)
- [ ] El sidebar aparece correctamente en desktop y se abre/cierra con hamburger en mobile
- [ ] `/proyectos` muestra la lista de proyectos (requiere sesión)
- [ ] El buscador filtra por nombre, cantón y provincia simultáneamente
- [ ] `/proyectos/nuevo` permite crear un proyecto con validaciones en todos los campos requeridos
- [ ] Al guardar, aparece el toast "Proyecto guardado exitosamente" y redirige a `/proyectos`
- [ ] `/proyectos/:id` muestra la ficha del proyecto con todos sus datos
- [ ] El botón "Cambiar Estado" abre un Dialog y al confirmar actualiza el estado + agrega al historial
- [ ] El historial de cambios de estado muestra la línea de tiempo correctamente
- [ ] `/proyectos/:id/editar` carga los datos actuales del proyecto para editar

---

## ✅ Sprint 2 — Catálogo y multimedia

### Lo que debe funcionar

**Catálogo público:**
- [ ] `/catalogo` es accesible sin iniciar sesión
- [ ] Muestra las tarjetas de proyectos con imagen de portada, estado, tipo y precio
- [ ] El buscador y los filtros de estado y tipo funcionan
- [ ] Al hacer clic en una tarjeta navega a `/catalogo/:id`

**Showroom:**
- [ ] `/catalogo/:id` muestra toda la información pública del proyecto
- [ ] La galería de imágenes funciona (si hay imágenes cargadas): carrusel, thumbnails, lightbox
- [ ] En el lightbox, las teclas ← → navegan entre imágenes y Escape lo cierra
- [ ] El mapa muestra la ubicación correcta si hay coordenadas en formato `lat,lng`
- [ ] Las amenidades, modelos de unidades y opciones de financiamiento aparecen si están registrados

**Formulario de proyecto (admin):**
- [ ] El formulario de nuevo/editar proyecto tiene 5 secciones: Info General, Ubicación y Precios, Amenidades, Modelos de Unidades, Financiamiento
- [ ] Las amenidades se seleccionan con checkboxes
- [ ] Se pueden agregar y eliminar modelos de unidades y opciones de financiamiento
- [ ] Las coordenadas validan el formato `lat,lng` antes de guardar

**Gestión de imágenes (admin, requiere sesión):**
- [ ] En `/proyectos/:id` aparece la sección "Imágenes del Proyecto"
- [ ] **NOTA**: La subida de imágenes requiere sesión activa por las políticas RLS de Supabase Storage. Verificar logueado.
- [ ] La primera imagen subida se marca automáticamente como portada (`cover`)
- [ ] El link "Ver showroom público" navega a `/catalogo/:id`

---

## ✅ Sprint 3 — Autenticación, Roles, Prospectos, Citas

### Prerequisitos Supabase

Antes de verificar Sprint 3, confirmar en el dashboard de Supabase:
- [ ] El script `supabase/sprint3_migration.sql` fue ejecutado exitosamente
- [ ] Existen las tablas: `profiles`, `prospectos`, `prospecto_notas`, `citas`
- [ ] Los 5 usuarios fueron creados en Authentication → Users
- [ ] El script `supabase/setup_users.sql` fue ejecutado para asignar roles y nombres
- [ ] En Table Editor → `profiles` aparecen los 5 usuarios con nombres y roles correctos

### Lo que debe funcionar

**Flujo de cliente (sin sesión):**
- [ ] Al abrir la app → llega al catálogo, NO a una página de login
- [ ] El sidebar solo muestra "Catálogo" y el botón "Iniciar Sesión" al fondo
- [ ] No aparece avatar, ni nombre de usuario, ni "Cerrar Sesión"
- [ ] Al hacer clic en "Iniciar Sesión" → aparece el modal de login (popup)
- [ ] El modal tiene una X visible arriba a la derecha
- [ ] Hacer clic fuera del modal (en el fondo oscuro) lo cierra
- [ ] El catálogo sigue siendo accesible sin necesidad de cerrar el modal

**Flujo de agente (con sesión):**
- [ ] Ingresar con `danielsalas@habita.com` / `dani12345`
- [ ] El modal se cierra y redirige al dashboard `/`
- [ ] El sidebar muestra todos los links del menú
- [ ] Al fondo del sidebar aparece el nombre "Daniel Salas" y el rol "Administrador"
- [ ] "Cerrar Sesión" cierra la sesión y vuelve al catálogo con el sidebar simplificado

**Rutas protegidas:**
- [ ] Escribir `/proyectos` en el navegador sin sesión → redirige al catálogo Y abre el modal de login automáticamente
- [ ] Lo mismo para `/prospectos`, `/citas`, etc.

**Prospectos:**
- [ ] `/prospectos` muestra la lista de prospectos (vacía si no hay datos)
- [ ] El botón "Nuevo Prospecto" abre un modal de creación rápida
- [ ] El modal requiere Nombre y Apellidos como mínimo
- [ ] Al guardar, el prospecto aparece en la lista
- [ ] Hacer clic en el nombre del prospecto navega a `/prospectos/:id`
- [ ] En el detalle se pueden editar todos los campos
- [ ] El botón "Guardar cambios" actualiza los datos con un toast de confirmación
- [ ] Las notas de seguimiento se pueden agregar y eliminar
- [ ] Cada nota muestra la fecha y el nombre del autor

**Citas:**
- [ ] `/citas` muestra la agenda de citas (vacía si no hay datos)
- [ ] El botón "Nueva Cita" navega a `/citas/nueva`
- [ ] El formulario requiere seleccionar un prospecto y una fecha/hora
- [ ] Al guardar, la cita aparece en la lista
- [ ] Las citas pasadas con estado "Pendiente" muestran el badge "Vencida" en amarillo
- [ ] El botón "Cancelar" cambia el estado a "Cancelada" directamente desde la lista
- [ ] El botón "Editar" navega al formulario de edición

**Historial de estado (fix changed_by):**
- [ ] Cambiar el estado de un proyecto mientras estás logueado
- [ ] En el historial aparece tu nombre real (del perfil) y no "Daniel Salas" hardcodeado

---

## ⚠️ Puntos importantes a tener en cuenta

### Subida de imágenes
La subida solo funciona con sesión activa. Sin login, el componente `ImageUpload` fallará silenciosamente por las políticas RLS del bucket. Esto es comportamiento esperado y correcto.

### Usuarios en historial de estado
Los registros de `status_history` creados antes del Sprint 3 tienen `changed_by` como texto plano ("Daniel Salas", "Fabián Vargas"). Los nuevos registros usan el nombre real del perfil autenticado. Para normalizar los históricos, ejecutar `supabase/setup_users.sql`.

### El catálogo NO requiere login
`/catalogo` y `/catalogo/:id` son 100% públicas. Si ves que piden login, hay un bug en la configuración de rutas en `App.tsx`.

### Bun vs npm
Si alguien ejecuta `npm install` en este proyecto, puede generar un `package-lock.json` que causa conflictos con `bun.lock`. Eliminar `package-lock.json` y `node_modules/` y volver a ejecutar `bun install` si esto ocurre.

---

## 🔲 Sprint 4 — Pendiente

### Lo que falta implementar

- **Pipeline de ventas**: vista Kanban con los prospectos organizados por etapa del proceso de venta
- **Reportes y métricas**: dashboard con gráficos de prospectos por estado, citas por agente, proyectos más visitados
- **Asignación de agente a prospectos**: que desde la lista de prospectos se pueda asignar el agente directamente
- **Filtro por agente en citas y prospectos**: que cada agente solo vea sus propios registros

### Punto deseable al finalizar el proyecto

- Todos los PlaceholderPage reemplazados por páginas funcionales
- RLS granular por rol (agentes solo ven sus prospectos, gerentes ven todo en lectura)
- Al menos 5 proyectos con imágenes, coordenadas, amenidades, modelos y financiamiento cargados
- Al menos 3 prospectos con notas de seguimiento registradas
- Al menos 2 citas en distintos estados para demostrar el flujo completo
