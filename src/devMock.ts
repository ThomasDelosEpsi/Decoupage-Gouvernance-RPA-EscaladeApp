import { Theme, TaskStatus } from '@uipath/coded-action-app';
import type { Task } from '@uipath/coded-action-app';
import type { EscaladeInputs } from './types';

/**
 * Used only when running `npm run dev` outside of Action Center (no parent
 * frame to answer getTask()), so the UI can be previewed locally.
 * Never bundled into behavior outside of import.meta.env.DEV.
 */
export const MOCK_INPUTS: EscaladeInputs = {
  question:
    "Le passage cité mentionne un seuil de 4 semaines pour la Warranty Period, mais aucune volumétrie n'est précisée pour ce sujet. Dois-je retenir la durée par défaut ou la considérer comme non tranchée ?",
  passage_cite:
    "« Durée : Ex. 4 semaines calendaires après le go-live (à caler selon la volumétrie du process). »",
  item_bloque: '08 · Warranty Period — durée applicable au sujet',
  contexte_gouvernance:
    "Principe P4 · Clarifier avant d'estimer : un sujet flou n'est jamais tranché seul par l'agent, il doit remonter à un humain.",
};

export const MOCK_TASK: Task = {
  taskId: 0,
  title: 'Aperçu local (dev)',
  status: TaskStatus.Pending,
  isReadOnly: false,
  action: null,
  data: MOCK_INPUTS,
  folderId: 0,
  folderName: 'Preview',
  theme: Theme.AutoTheme,
};
