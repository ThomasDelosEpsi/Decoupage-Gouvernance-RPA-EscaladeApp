export type Decision = 'Confirmer' | 'Modifier le périmètre' | 'Rejeter l\'item';

export const DECISIONS: Decision[] = ['Confirmer', 'Modifier le périmètre', 'Rejeter l\'item'];

/**
 * Shape of the task data as produced by the "Decoupage-Gouvernance-RPA" agent.
 * `getTask().data` is typed `unknown` by the SDK, so this is our own contract
 * with the agent's escalation payload — not something the SDK enforces.
 */
export interface EscaladeInputs {
  question: string;
  passage_cite: string;
  item_bloque: string;
  contexte_gouvernance?: string;
}

export interface EscaladeOutputs {
  reponse: string;
  decision: Decision;
}

export type EscaladeTaskData = EscaladeInputs & Partial<EscaladeOutputs>;

export function isEscaladeInputs(data: unknown): data is EscaladeInputs {
  if (typeof data !== 'object' || data === null) return false;
  const d = data as Record<string, unknown>;
  return (
    typeof d.question === 'string' &&
    typeof d.passage_cite === 'string' &&
    typeof d.item_bloque === 'string' &&
    (d.contexte_gouvernance === undefined || typeof d.contexte_gouvernance === 'string')
  );
}
