// Stage order for pipeline - must match PIPELINE_STAGES in Pipeline.tsx
export const STAGE_ORDER = [
  "Nuevo",
  "Contactado",
  "Calificado",
  "Negociando",
  "Cerrado",
  "Perdido",
] as const;

export { STAGE_ORDER as PIPELINE_STAGES };

export const PROSPECTO_TERMINAL_STATES = new Set(["Cerrado", "Perdido"]);

/**
 * Check if a status is a terminal state (no further advancement possible)
 */
export function isTerminalStatus(status: string): boolean {
  return PROSPECTO_TERMINAL_STATES.has(status);
}

/**
 * Get the next stage in the pipeline order
 * @returns The next stage name, or null if current stage is terminal or not found
 */
export function getNextStage(currentStatus: string): string | null {
  const index = STAGE_ORDER.indexOf(currentStatus as typeof STAGE_ORDER[number]);
  if (index === -1) return null;
  if (index >= STAGE_ORDER.length - 1) return null;
  return STAGE_ORDER[index + 1];
}

/**
 * Check if a stage can be advanced to the next stage
 */
export function canAdvance(currentStatus: string): boolean {
  return !isTerminalStatus(currentStatus) && getNextStage(currentStatus) !== null;
}

/**
 * Get comprehensive advance info for UI rendering
 */
export function getAdvanceInfo(prospectoStatus: string): {
  canAdvance: boolean;
  nextStage: string | null;
  currentStage: string;
} {
  return {
    canAdvance: canAdvance(prospectoStatus),
    nextStage: getNextStage(prospectoStatus),
    currentStage: prospectoStatus,
  };
}
