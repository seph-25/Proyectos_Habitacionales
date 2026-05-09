# Prompt — Módulo de Reportes (PH-76, PH-77, PH-78)

## Antes de escribir cualquier código

Lee los siguientes archivos para entender los patrones, convenciones y contexto del proyecto. No escribas nada hasta haber leído todos:

- `package.json` — para conocer las dependencias disponibles, el gestor de paquetes (bun) y los scripts.
- `src/integrations/supabase/types.ts` — para saber qué tablas tienen tipos generados y cuáles no.
- `src/integrations/supabase/client.ts` — para saber cómo se importa y usa el cliente de Supabase.
- `src/App.tsx` — para entender el sistema de rutas y cómo está registrada actualmente `/reportes`.
- `src/components/layout/AppLayout.tsx` — para entender cómo se estructura el layout de todas las páginas.
- `src/pages/Projects.tsx` — referencia de una página con tabla, filtros y badges de estado.
- `src/pages/Oportunidades.tsx` — referencia de cómo se hacen queries a tablas que no están en `types.ts` y cómo se maneja el tipado en ese caso.
- `src/pages/PlaceholderPage.tsx` — página que actualmente ocupa la ruta `/reportes` y que será reemplazada.
- `src/components/layout/Sidebar.tsx` — para verificar cómo está registrado el link a `/reportes` en la navegación.

---

## Contexto de negocio

HABITATRACK es un CRM para proyectos habitacionales. El módulo de Reportes es el último módulo del MVP y vive en la ruta `/reportes`. Actualmente esa ruta muestra un `PlaceholderPage`. El objetivo de este sprint es reemplazarlo con un módulo funcional de dos reportes.

---

## Paso 0 — Dependencias

El proyecto usa **bun** como gestor de paquetes. Nunca usar npm ni npx.

Verificar en `package.json` si `jspdf` y `html2canvas` ya están instaladas. Si no lo están, instalarlas con:

```
bun add jspdf html2canvas
```

Luego agregar al final de `README.md`, sin modificar nada más del archivo, una nota que indique a otros integrantes del equipo que después de hacer `git pull` deben correr `bun install`, y que explique para qué sirven las nuevas dependencias.

---

## Tarea 1 — Reporte de inventario por proyecto y estado (PH-76)

### Qué debe lograr

El usuario autenticado puede navegar a `/reportes`, seleccionar el tab "Inventario" y ver un reporte del inventario actual de proyectos habitacionales.

El reporte debe mostrar:

- Un resumen en cards con: total de proyectos registrados, total de unidades entre todos los proyectos, y desglose de cuántos proyectos hay en cada estado.
- Una tabla detallada con la información relevante de cada proyecto: nombre, ubicación, estado, cantidad de unidades y precio desde.
- Un filtro que permita ver todos los proyectos o filtrar por estado.
- Badges de color para identificar visualmente el estado de cada proyecto.

Los datos vienen de la tabla `projects`. Revisá `types.ts` para conocer exactamente qué columnas existen antes de definir la query.

El componente debe tener un `id` en su contenedor raíz para que la exportación a PDF (Tarea 3) pueda identificarlo.

---

## Tarea 2 — Reporte de métricas de oportunidades con gráficos (PH-78)

### Qué debe lograr

El usuario autenticado puede seleccionar el tab "Métricas de Ventas" y ver métricas del pipeline de oportunidades con visualizaciones gráficas.

El reporte debe mostrar:

- Cards de resumen: total de oportunidades, valor estimado total del pipeline activo, y tasa de cierre calculada sobre el total.
- Un gráfico de distribución de oportunidades por etapa.
- Un gráfico de valor estimado acumulado por etapa.

Para los gráficos, usar **recharts** (confirmar primero que está en `package.json`). Elegir los tipos de gráfico más adecuados para cada visualización basándose en la naturaleza de los datos.

Los datos vienen de la tabla `oportunidades`. Esta tabla **no está tipada en `types.ts`**. Revisá cómo `Oportunidades.tsx` resuelve este problema y usá el mismo patrón para mantener consistencia.

Antes de definir la query, revisá `Oportunidades.tsx` para conocer las etapas existentes y la estructura real de los datos que devuelve esa tabla.

El componente debe tener un `id` en su contenedor raíz para que la exportación a PDF (Tarea 3) pueda identificarlo.

---

## Tarea 3 — Exportación a PDF (PH-77)

### Qué debe lograr

El usuario puede hacer clic en un botón "Exportar PDF" visible en la página de Reportes y descargar un PDF con el contenido del reporte que está viendo en ese momento.

- Si el tab activo es "Inventario", el PDF contiene el reporte de inventario.
- Si el tab activo es "Métricas de Ventas", el PDF contiene las métricas y gráficos.

Implementar la lógica de exportación usando `jspdf` y `html2canvas`. Encapsular esta lógica de forma que sea reutilizable (por ejemplo, un hook o una función utilitaria), siguiendo el patrón de organización que ya usa el proyecto para lógica compartida.

---

## Página principal — `src/pages/Reportes.tsx`

Crear la página que orqueste las dos tareas anteriores. Debe:

- Usar el mismo sistema de layout que todas las demás páginas del proyecto.
- Tener dos tabs: uno para cada reporte.
- Mostrar el botón de exportación a PDF que actúe sobre el tab activo.
- Seguir el mismo patrón visual y de código que las páginas existentes.

---

## Integración en el router

Modificar `src/App.tsx` para que la ruta `/reportes` cargue la nueva página `Reportes` en lugar del `PlaceholderPage` actual. Revisar si `PlaceholderPage` sigue siendo usado en alguna otra ruta antes de decidir si eliminar o mantener su import.

---

## Criterios de aceptación

- `bun run build` finaliza sin errores de TypeScript ni de compilación.
- La ruta `/reportes` carga la nueva página con los dos tabs.
- Ambos reportes muestran datos reales obtenidos de Supabase, sin datos hardcodeados.
- El botón de exportación descarga un PDF con el contenido del reporte activo.
- El código nuevo es visualmente consistente con el resto de la aplicación: mismas clases, mismos patrones de carga y de estados vacíos.
- No se modificó ningún archivo que no esté mencionado en este prompt, salvo `README.md` y `src/App.tsx`.


## Al final entregas un archivo .md con informe detallado de lo que has hecho para que el proximo en trabajar tenga todo el contexto