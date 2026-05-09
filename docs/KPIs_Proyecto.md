# KPIs del Proyecto — HABITATRACK
**Proyecto:** Sistema de Gestión de Proyectos Habitacionales  
**Equipo:** Daniel Salas — Brittany Romero — Fabián Vargas  
**Curso:** Administración de Proyectos — I Semestre 2026

---

## Clasificación

Los KPIs del proyecto se dividen en dos categorías según su naturaleza:

- **Adelantados:** predicen tendencias y permiten tomar acción antes de que ocurran problemas.
- **Rezagados:** miden resultados ya ocurridos, basados en entregables y eventos completados.

---

## KPIs Adelantados

### KPI 1 — Velocidad del Equipo por Sprint

**Definición:** Mide la cantidad de story points completados versus los planificados en cada sprint. Permite predecir si el equipo tiene capacidad suficiente para el siguiente sprint o si existe riesgo de incumplimiento.

**Desglose por integrante:**

#### Sprint 1 — Planificado: 41 pts | Completado: 41 pts | Velocidad: 100%

| Integrante | 1 pt | 2 pts | 3 pts | Planificado | Completado |
|---|---|---|---|---|---|
| Daniel Salas | 3×1 = 3 | 4×2 = 8 | 2×3 = 6 | 17 pts | 17 pts |
| Brittany Romero | 4×1 = 4 | 3×2 = 6 | 0×3 = 0 | 10 pts | 10 pts |
| Fabián Vargas | 2×1 = 2 | 3×2 = 6 | 2×3 = 6 | 14 pts | 14 pts |

#### Sprint 2 — Planificado: 29 pts | Completado: 29 pts | Velocidad: 100%

| Integrante | 1 pt | 2 pts | 3 pts | Planificado | Completado |
|---|---|---|---|---|---|
| Daniel Salas | 5×1 = 5 | 2×2 = 4 | 2×3 = 6 | 15 pts | 15 pts |
| Brittany Romero | 2×1 = 2 | 1×2 = 2 | 0×3 = 0 | 4 pts | 4 pts |
| Fabián Vargas | 0×1 = 0 | 2×2 = 4 | 2×3 = 6 | 10 pts | 10 pts |

#### Sprint 3 — Planificado: 22 pts | Completado: 15 pts | Velocidad: 68.2%

| Integrante | 1 pt | 2 pts | 3 pts | Planificado | Completado |
|---|---|---|---|---|---|
| Daniel Salas | 4×1 = 4 | 0×2 = 0 | 2×3 = 6 | 10 pts | 6 pts |
| Brittany Romero | 2×1 = 2 | 0×2 = 0 | 0×3 = 0 | 2 pts | 0 pts |
| Fabián Vargas | 1×1 = 1 | 3×2 = 6 | 1×3 = 3 | 10 pts | 9 pts |

#### Sprint 4 — Planificado: 32 pts | Completado: 32 pts | Velocidad: 100%

| Integrante | 1 pt | 2 pts | 3 pts | 5 pts | Planificado | Completado |
|---|---|---|---|---|---|---|
| Daniel Salas | 5×1 = 5 | 1×2 = 2 | 1×3 = 3 | — | 10 pts | 10 pts |
| Brittany Romero | 5×1 = 5 | 2×2 = 4 | 1×3 = 3 | — | 12 pts | 12 pts |
| Fabián Vargas | 0×1 = 0 | 1×2 = 2 | 1×3 = 3 | 1×5 = 5 | 10 pts | 10 pts |

#### Resumen de velocidad

| Sprint | Planificado | Completado | Velocidad |
|---|---|---|---|
| S1 | 41 pts | 41 pts | 100% |
| S2 | 29 pts | 29 pts | 100% |
| S3 | 22 pts | 15 pts | 68.2% |
| S4 | 32 pts | 32 pts | 100% |
| **Promedio** | **31 pts** | **29.25 pts** | **92%** |

**Análisis:** La caída en S3 se explica por incumplimiento de tareas de un integrante del equipo. Los sprints S1, S2 y S4 mantuvieron velocidad perfecta. La velocidad promedio de 29.25 pts sirve como referencia para la planificación de S5.

---

### KPI 2 — Porcentaje de Tareas en Progreso al Mid-Sprint

**Definición:** Mide cuántas tareas están simultáneamente abiertas y sin terminar a mitad del sprint. Un valor alto predice acumulación de trabajo al cierre del sprint.

**Estado:** Este KPI fue identificado por el equipo durante la retrospectiva del Sprint 4 como indicador relevante. No se llevó registro histórico en sprints anteriores. Se implementará formalmente en Sprint 5 con seguimiento en Jira al día intermedio del sprint.

**Meta definida para S5:** máximo 40% de tareas en estado "En progreso" al mid-sprint.

---

### KPI 3 — Número de Dependencias Bloqueadas entre Desarrolladores

**Definición:** Registra cuántas veces en un sprint un integrante no pudo avanzar en sus tareas porque dependía de que otro terminara primero. Predice riesgos de coordinación y retrasos en cadena.

| Sprint | Bloqueos registrados | Detalle |
|---|---|---|
| S1 | 0 | Trabajo independiente, sin dependencias entre integrantes |
| S2 | 0 | Trabajo independiente, sin dependencias entre integrantes |
| S3 | 1 | Fabián Vargas bloqueado esperando entregables de Daniel Salas |
| S4 | 1 | Fabián Vargas bloqueado esperando finalización de PH-62 por Daniel Salas |

**Análisis:** Los bloqueos en S3 y S4 se deben a la naturaleza secuencial del módulo de ventas y pipeline, donde las tareas de un desarrollador son prerequisito directo de las del siguiente. Este patrón era predecible desde la planificación y se mitiga en S5 al ser el último sprint con un único módulo independiente (Reportes).

---

## KPIs Rezagados

### KPI 4 — SPI y CPI por Sprint (EVM)

**Definición:** El SPI (Schedule Performance Index) mide si el equipo va adelantado o atrasado respecto al cronograma planificado. El CPI (Cost Performance Index) mide la eficiencia del esfuerzo invertido respecto al valor entregado. Ambos se calculan mediante la técnica de Valor Ganado (Earned Value Management).

**Estado:** Estos indicadores se calcularon formalmente por primera vez al cierre del Sprint 4 como parte del Informe de Avance 2. No se registraron en sprints anteriores. Se mantendrán en S5 como cierre del proyecto.

| Sprint | SPI | CPI | Interpretación |
|---|---|---|---|
| S1 | Sin dato | Sin dato | No medido |
| S2 | Sin dato | Sin dato | No medido |
| S3 | Sin dato | Sin dato | No medido |
| S4 | 0.85 | 0.89 | Retraso moderado en cronograma, ligera ineficiencia en esfuerzo |

**Meta para S5:** SPI ≥ 0.90 y CPI ≥ 0.90 según los indicadores de desempeño definidos en el Plan de Gestión del Proyecto.

---

### KPI 5 — Porcentaje de Historias de Usuario Aceptadas sin Retrabajo

**Definición:** Mide cuántas historias de usuario pasaron la revisión a la primera, sin necesidad de correcciones después de darse por terminadas. Un valor bajo indica problemas de coordinación, comunicación de requerimientos o calidad del entregable.

| Sprint | HU completadas | HU con retrabajo | % sin retrabajo |
|---|---|---|---|
| S1 | Sin dato | 0 | 100% |
| S2 | Sin dato | 0 | 100% |
| S3 | Sin dato | 0 | 100% |
| S4 | 18 | 2 (PH-62, PH-64) | 88.9% |

**Análisis:** El retrabajo en S4 se originó por una desalineación entre los requerimientos técnicos implementados por un desarrollador y la arquitectura base definida por otro. Las tareas PH-62 y PH-64 requirieron corrección por conflicto de integración entre desarrolladores. Este caso se documentó formalmente como lección aprendida del sprint.

**Meta para S5:** ≥ 95% de historias aceptadas sin retrabajo.

---

### KPI 6 — Porcentaje de Módulos del MVP Completados

**Definición:** Mide el avance acumulado del prototipo funcional respecto a los cuatro módulos definidos en la WBS del proyecto. Es el indicador de mayor visibilidad para el patrocinador y el área comercial.

| Módulo | Estado al cierre S4 |
|---|---|
| 1. Gestión de Proyectos | ✅ Completo |
| 2. Catálogo y Showroom Virtual | ✅ Completo |
| 3. Proceso de Ventas y Pipeline | ✅ Completo |
| 4. Reportes y Analítica | ⏳ Pendiente — Sprint 5 |
| **Total MVP** | **75% completado** |

**Análisis:** El equipo completa el último módulo en S5, lo que permitirá entregar el prototipo funcional completo en la fecha establecida del 12 de mayo de 2026, cumpliendo con el hito H5 definido en el Project Charter.

---

## Resumen Ejecutivo de KPIs

| # | KPI | Tipo | Estado actual |
|---|---|---|---|
| 1 | Velocidad del equipo por sprint | Adelantado | Promedio 92% — S3 fue el sprint crítico |
| 2 | Tareas en progreso al mid-sprint | Adelantado | Sin historial — se implementa en S5 |
| 3 | Dependencias bloqueadas | Adelantado | 2 bloqueos en S3 y S4 |
| 4 | SPI y CPI (EVM) | Rezagado | Solo S4: SPI 0.85 / CPI 0.89 |
| 5 | HU aceptadas sin retrabajo | Rezagado | 88.9% en S4 |
| 6 | Módulos MVP completados | Rezagado | 75% — 3 de 4 módulos |
