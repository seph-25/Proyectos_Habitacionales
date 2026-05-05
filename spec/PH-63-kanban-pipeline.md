# SPEC: PH-63 — Vista Kanban del Pipeline de Ventas

## 1. Concept & Vision

Tablero Kanban visual para gestionar el flujo de oportunidades de venta. Cada oportunidad avanza por las etapas del pipeline y se presenta como una tarjeta con la información clave del cliente y su proyecto de interés. El tablero permite ver de un vistazo en qué etapa se encuentra cada prospecto y cuánto tiempo lleva ahí.

## 2. Design Language

- **Aesthetic**: Consistente con la app (shadcn/ui, Tailwind, diseño corporativo profesional)
- **Palette**: Etapas con colores diferenciados pero discretos:
  - Prospección: `bg-blue-50 border-blue-200` / header: `bg-blue-600`
  - Presentación: `bg-indigo-50 border-indigo-200` / header: `bg-indigo-600`
  - Negociación: `bg-amber-50 border-amber-200` / header: `bg-amber-600`
  - Formalización: `bg-purple-50 border-purple-200` / header: `bg-purple-600`
  - Cerrada: `bg-green-50 border-green-200` / header: `bg-green-600`
- **Typography**: System font stack, headings bold
- **Motion**: Transiciones suaves en hover de tarjetas (150ms)

## 3. Layout & Structure

- Page full-width con header de título y contador total de oportunidades
- 5 columnas en scroll horizontal en desktop, scroll en mobile
- Columnas de ancho fijo (~280px), altura viewport con scroll vertical interno
- Header sticky de columna con nombre de etapa + badge de cantidad
- Tarjetas con padding consistente, stack vertical

## 4. Features & Interactions

### Columnas del Pipeline
Etapas fijas (orden): Prospección → Presentación → Negociación → Formalización → Cerrada

### Tarjeta de Oportunidad
Cada tarjeta muestra:
- **Nombre del cliente**: `{nombre} {apellidos}` en negrita
- **Proyecto de interés**: nombre del proyecto o "Sin proyecto asignado"
- **Tiempo en etapa**: `{n}d` o `{n}h` desde la última transición de status (calculado con `status_history`)
- ** Badge de estado**: chip con color según etapa

### Cálculo de Tiempo en Etapa
- Consultar `status_history` para cada prospecto filtrado por el status actual
- `tiempo = now - changed_at` del registro más reciente con `new_status = status actual`
- Mostrar en días (`d`) si ≥1 día, si no horas (`h`)

### Datos
- Fetch a `prospectos` con join a `projects(name)` y `status_history`
- Filtrar por `status` según la columna
- Mostrar spinner mientras carga, empty state si no hay prospectos en una etapa

## 5. Component Inventory

### `Pipeline.tsx` (page)
- Estado: `loading`, `prospectos`, `staleTimes` (mapa prospecto_id → tiempo formateado)
- Efecto: fetch prospectos + status_history, calcular tiempos
- Render: título + 5 columnas Kanban

### `KanbanColumn`
Props: `title`, `color`, `prospectos`, `staleTimes`
- Header sticky: título + badge cantidad
- Lista de `KanbanCard` vertically stacked
- Empty placeholder si no hay tarjetas

### `KanbanCard`
Props: `prospecto`, `staleTime`
- Nombre completo
- Proyecto de interés (o "Sin proyecto")
- Badge tiempo en etapa
- Hover: sombra elevada, escala sutil

## 6. Technical Approach

- **Stack**: React + TanStack Query + Supabase
- **Routing**: Nueva ruta `/pipeline` (reemplaza PlaceholderPage en App.tsx)
- **API**: Supabase queries — prospectos + status_history para tiempo en etapa
- **Data shape**: `Prospecto` con `proyecto_nombre` y sin `staleTime` calculado lógicamente
