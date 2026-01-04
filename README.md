# BundestagAI - Protocol Analyst

<div align="center">

![BundestagAI Logo](https://img.shields.io/badge/BundestagAI-Protocol%20Analyst-0066b3?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0iI2ZmZiIgZD0iTTEyIDJDNi40OCAyIDIgNi40OCAyIDEyczQuNDggMTAgMTAgMTAgMTAtNC40OCAxMC0xMFMxNy41MiAyIDEyIDJ6bTAgMThjLTQuNDEgMC04LTMuNTktOC04czMuNTktOCA4LTggOCAzLjU5IDggOC0zLjU5IDgtOCA4eiIvPjwvc3ZnPg==)

**Professionelle KI-gestützte Analyse von Plenarprotokollen des Deutschen Bundestages**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-blue?logo=react&logoColor=white)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0-purple?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-blue?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Gemini AI](https://img.shields.io/badge/Gemini%20AI-2.5-green?logo=google&logoColor=white)](https://ai.google.dev/)

</div>

---

## Funktionen

### Kernfunktionen

- **Protokollsuche**: Durchsuchen Sie alle Plenarprotokolle des Deutschen Bundestages nach Wahlperiode, Datum und Thema
- **Executive Summary**: Schnelle KI-generierte Zusammenfassung der wichtigsten Themen und Beschlüsse
- **Tiefenanalyse**: Wissenschaftliche Diskursanalyse mit Rhetorik-, Framing- und Konfliktlinien-Untersuchung
- **Investigator-Modus**: Stellen Sie interaktive Fragen an das Protokoll und erhalten Sie präzise Antworten

### Technische Features

- **Moderne Architektur**: React 18 mit TypeScript, Zustand für State Management
- **Responsive Design**: Vollständig anpassbar für Desktop, Tablet und Mobile
- **Dark Mode**: Automatische Erkennung der Systemeinstellung oder manuell einstellbar
- **Lokaler Cache**: Analyseergebnisse werden gespeichert, um Tokens zu sparen
- **Barrierefreiheit**: Vollständige Keyboard-Navigation und ARIA-Labels
- **Keyboard Shortcuts**: Effiziente Steuerung über Tastenkürzel

## Schnellstart

### Voraussetzungen

- Node.js 18.0 oder höher
- npm, yarn oder pnpm

### Installation

```bash
# Repository klonen
git clone <repository-url>
cd bundestag-ai-analyst

# Abhängigkeiten installieren
npm install

# Entwicklungsserver starten
npm run dev
```

Die Anwendung ist nun unter `http://localhost:3000` verfügbar.

### Konfiguration

1. **Gemini API-Key** (erforderlich für KI-Funktionen):
   - Besuchen Sie [Google AI Studio](https://aistudio.google.com/apikey)
   - Erstellen Sie einen neuen API-Key
   - Tragen Sie den Key in den Einstellungen der Anwendung ein

2. **Bundestag API-Key** (optional):
   - Ein öffentlicher Key ist bereits voreingestellt (gültig bis 05/2026)
   - Für höhere Limits können Sie einen persönlichen Key bei `parlamentsdokumentation@bundestag.de` beantragen

### Umgebungsvariablen (optional)

Erstellen Sie eine `.env.local` Datei:

```env
GEMINI_API_KEY=your_gemini_api_key_here
BUNDESTAG_API_KEY=your_bundestag_api_key_here
```

## Nutzung

### Protokolle suchen

1. Wählen Sie die gewünschte Wahlperiode (aktuell: 21. WP)
2. Optional: Filtern Sie nach Datum oder Suchbegriff
3. Klicken Sie auf "Protokolle laden"
4. Wählen Sie ein Protokoll aus der Liste

### KI-Analyse

1. **Executive Summary**: Klicken Sie auf "Zusammenfassung generieren" für eine schnelle Übersicht
2. **Tiefenanalyse**: Klicken Sie auf "Analyse starten" für eine detaillierte Diskursanalyse
3. **Investigator**: Wechseln Sie zum Investigator-Tab und stellen Sie Ihre Fragen

### Keyboard Shortcuts

| Tastenkürzel | Aktion |
|--------------|--------|
| `/` | Suche fokussieren |
| `Ctrl + ,` | Einstellungen öffnen |
| `Ctrl + T` | Theme wechseln |
| `j` | Nächstes Protokoll |
| `k` | Vorheriges Protokoll |
| `Escape` | Dialog schließen |

## Technologie-Stack

### Frontend
- **React 18** - UI-Framework
- **TypeScript 5.7** - Typsicherheit
- **Vite 6** - Build-Tool
- **Tailwind CSS 3.4** - Styling
- **Zustand 5** - State Management
- **Lucide React** - Icons

### APIs
- **Bundestag DIP API** - Plenarprotokolle und Drucksachen
- **Google Gemini API** - KI-Analyse (Gemini 2.0 Flash, 2.5 Flash, 2.5 Pro)

### Verfügbare Gemini-Modelle

| Modell | Beschreibung | Thinking |
|--------|--------------|----------|
| Gemini 2.0 Flash | Schnellstes Modell | Nein |
| Gemini 2.5 Flash | Ausgewogene Balance | Ja |
| Gemini 2.5 Pro | Höchste Qualität | Ja |

## Projektstruktur

```
src/
├── components/          # React-Komponenten
│   ├── ui/             # Basis-UI-Komponenten
│   ├── AnalysisPanel/  # Analyse-Interface
│   ├── ChatPanel/      # Investigator-Chat
│   └── ...
├── config/             # Konstanten und Konfiguration
├── hooks/              # Custom React Hooks
├── services/           # API-Services
├── store/              # Zustand State Management
├── styles/             # CSS und Tailwind
└── types/              # TypeScript-Typdefinitionen
```

## Einstellungen

Die Anwendung bietet umfangreiche Konfigurationsmöglichkeiten:

### API-Keys
- Gemini API-Key mit Validierung
- Bundestag API-Key mit Fallback

### KI-Modell
- Modellauswahl (Flash/Pro)
- Thinking Budget (1K - 16K Tokens)
- Gedankenprozess-Anzeige

### Darstellung
- Theme (Hell/Dunkel/System)
- Schriftgröße (Klein/Normal/Groß)
- Kompaktmodus

### Erweitert
- Cache-Verwaltung
- Auto-Zusammenfassung
- Caching aktivieren/deaktivieren

## Entwicklung

### Scripts

```bash
# Entwicklung
npm run dev

# Typen prüfen
npm run type-check

# Build für Produktion
npm run build

# Produktions-Preview
npm run preview
```

### Code-Qualität

- TypeScript Strict Mode
- ESLint-Konfiguration
- Barrierefreie Komponenten

## Datenquellen

### Bundestag DIP API

Die Anwendung nutzt die offizielle [Bundestag DIP API](https://dip.bundestag.de):

- **Basis-URL**: `https://search.dip.bundestag.de/api/v1`
- **Dokumentation**: [OpenAPI Spec](https://dip.bundestag.api.bund.dev/)
- **Endpunkte**: `plenarprotokoll-text`, `plenarprotokoll`, `drucksache`, `person`

### Verfügbare Daten

- Plenarprotokolle ab der 8. Wahlperiode (1976)
- Volltext-Suche in allen Dokumenten
- Metadaten wie Datum, Herausgeber, Wahlperiode

## Lizenz

Dieses Projekt ist unter der MIT-Lizenz lizenziert.

## Danksagungen

- [Deutscher Bundestag](https://www.bundestag.de/) für die Bereitstellung der offenen DIP API
- [Google](https://ai.google.dev/) für die Gemini AI API
- Alle Open-Source-Projekte, die dieses Projekt ermöglichen

---

<div align="center">

**Entwickelt mit Sorgfalt für die demokratische Transparenz**

</div>
