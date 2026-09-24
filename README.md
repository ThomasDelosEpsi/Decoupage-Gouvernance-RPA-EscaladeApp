# Decoupage-Gouvernance-RPA — Escalade humaine

Coded App (React + TypeScript) servant d'interface d'escalade humaine pour un agent UiPath Agent Builder : elle affiche une file de documents/tâches nécessitant une validation ou une décision humaine via Action Center.

## Stack

- React + TypeScript, Vite
- UiPath Coded Apps (intégration Orchestrator / Action Center)

## Usage

```bash
npm install
npm run dev     # serveur de dev local
npm run build   # build de production dans dist/
```

Une configuration (identifiants OAuth, dossier Orchestrator, clé de release de l'agent) est nécessaire avant le premier lancement — voir les fichiers `.env` / `uipath.json` (non versionnés).
