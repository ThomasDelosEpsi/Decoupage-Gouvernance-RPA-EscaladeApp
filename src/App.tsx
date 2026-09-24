import { useEffect, useMemo, useState } from 'react';
import { CodedActionAppService, MessageSeverity, Theme } from '@uipath/coded-action-app';
import type { Task } from '@uipath/coded-action-app';
import { DECISIONS, isEscaladeInputs, type Decision, type EscaladeInputs } from './types';
import { MOCK_TASK } from './devMock';

const service = new CodedActionAppService();

type LoadState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; task: Task; inputs: EscaladeInputs };

export default function App() {
  const [state, setState] = useState<LoadState>({ status: 'loading' });
  const [reponse, setReponse] = useState('');
  const [decision, setDecision] = useState<Decision | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    service
      .getTask()
      .then((task) => {
        if (cancelled) return;
        if (!isEscaladeInputs(task.data)) {
          setState({
            status: 'error',
            message:
              "La tâche reçue ne correspond pas au schéma attendu (question / passage_cite / item_bloque manquants).",
          });
          return;
        }
        setState({ status: 'ready', task, inputs: task.data });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        // No Action Center host to answer getTask() when running `npm run dev`
        // standalone in a browser tab: fall back to mock data so the UI is
        // previewable. Never happens in a production build.
        if (import.meta.env.DEV) {
          setState({ status: 'ready', task: MOCK_TASK, inputs: MOCK_TASK.data as EscaladeInputs });
          return;
        }
        const message =
          err instanceof Error ? err.message : "Impossible de récupérer la tâche depuis Action Center.";
        setState({ status: 'error', message });
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Reflect the Action Center theme on the document root so CSS can adapt.
  useEffect(() => {
    if (state.status !== 'ready') return;
    const theme = state.task.theme;
    const isDark = theme === Theme.Dark || theme === Theme.DarkHighContrast;
    document.documentElement.dataset.theme = isDark ? 'dark' : 'light';
  }, [state]);

  const canSubmit = useMemo(
    () => reponse.trim().length > 0 && decision !== null,
    [reponse, decision],
  );

  if (state.status === 'loading') {
    return (
      <div className="page page--centered">
        <p className="muted">Chargement de la tâche…</p>
      </div>
    );
  }

  if (state.status === 'error') {
    return (
      <div className="page page--centered">
        <div className="error-box">
          <strong>Erreur de chargement</strong>
          <p>{state.message}</p>
        </div>
      </div>
    );
  }

  const { task, inputs } = state;
  const readOnly = task.isReadOnly || submitting;

  async function handleSubmit() {
    if (!canSubmit || decision === null) return;
    setSubmitting(true);

    const outputData = { ...inputs, reponse: reponse.trim(), decision };

    try {
      service.setTaskData(outputData);
      const result = await service.completeTask(decision, outputData);

      if (!result.success) {
        service.showMessage(
          result.errorMessage ?? "Échec de l'envoi de la réponse.",
          MessageSeverity.Error,
        );
        setSubmitting(false);
        return;
      }

      service.showMessage('Réponse envoyée à l’agent.', MessageSeverity.Success);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Échec de l'envoi de la réponse.";
      service.showMessage(message, MessageSeverity.Error);
      setSubmitting(false);
    }
  }

  return (
    <div className="page">
      <header className="header">
        <span className="eyebrow">Escalade humaine · Decoupage-Gouvernance-RPA</span>
        <h1>Décision requise</h1>
      </header>

      <section className="field-block">
        <span className="label">Item de découpage bloqué</span>
        <p className="value value--strong">{inputs.item_bloque}</p>
      </section>

      <section className="field-block">
        <span className="label">Question de l'agent</span>
        <p className="value">{inputs.question}</p>
      </section>

      {inputs.contexte_gouvernance && (
        <section className="field-block">
          <span className="label">Règle de gouvernance concernée</span>
          <p className="value value--muted">{inputs.contexte_gouvernance}</p>
        </section>
      )}

      <section className="field-block">
        <span className="label">Passage cité</span>
        <blockquote className="quote">{inputs.passage_cite}</blockquote>
      </section>

      <section className="field-block">
        <label className="label" htmlFor="reponse">
          Votre réponse <span className="required">*</span>
        </label>
        <textarea
          id="reponse"
          className="textarea"
          rows={6}
          value={reponse}
          onChange={(e) => setReponse(e.target.value)}
          disabled={readOnly}
          placeholder="Rédigez votre réponse à la question posée par l'agent…"
        />
      </section>

      <section className="field-block">
        <span className="label">
          Décision <span className="required">*</span>
        </span>
        <div className="decision-group" role="radiogroup" aria-label="Décision">
          {DECISIONS.map((d) => (
            <button
              key={d}
              type="button"
              role="radio"
              aria-checked={decision === d}
              className={`decision-btn${decision === d ? ' decision-btn--selected' : ''}`}
              onClick={() => setDecision(d)}
              disabled={readOnly}
            >
              {d}
            </button>
          ))}
        </div>
      </section>

      <footer className="footer">
        <button
          type="button"
          className="submit-btn"
          disabled={!canSubmit || readOnly}
          onClick={handleSubmit}
        >
          {submitting ? 'Envoi…' : 'Envoyer la réponse'}
        </button>
      </footer>
    </div>
  );
}
