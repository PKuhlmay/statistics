# statistic-learning — CLAUDE.md

## Project Goal

An interactive, visually polished web app for learning statistics — built on top of the concepts documented in the Obsidian vault at `~/.dotfiles/obsidian/Mein Gehirn/04 Ressourcen/MESSDAS/Statistik/`. The app should make abstract statistical concepts tangible through live-editable examples and interactive tools.

Context: The statistics knowledge here is rooted in **energy management** (Energieverbrauch, Heizgradtage, MESSDAS). Examples should reflect that domain wherever they appear in theory pages — but the tools should work with any data.

---

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | **Nuxt 3** (Vue 3 + SSR/SSG capable, file-based routing) |
| Language | TypeScript strict |
| Styling | **Tailwind CSS v4** |
| Charts / Viz | **Chart.js** via `vue-chartjs` |
| Math rendering | **KaTeX** (render LaTeX formulas from the Obsidian notes) |
| Package manager | `pnpm` |
| Linting | ESLint + `@nuxt/eslint` |

No UI component library — design from scratch with Tailwind.

---

## Dev Commands

```bash
pnpm dev          # Dev server (http://localhost:3000)
pnpm build        # Production build
pnpm preview      # Preview production build
pnpm lint         # ESLint
pnpm typecheck    # vue-tsc
```

---

## Directory Structure

```
statistic-learning/
├── app/
│   ├── pages/                  # File-based routes
│   │   ├── index.vue           # Dashboard / topic overview
│   │   ├── grundlagen/         # Statistical fundamentals
│   │   │   ├── index.vue
│   │   │   ├── lagemaße.vue
│   │   │   ├── streuung.vue
│   │   │   ├── verteilungen.vue
│   │   │   └── korrelation.vue
│   │   ├── regression/         # Linear regression
│   │   │   ├── index.vue
│   │   │   ├── einfach.vue     # Simple linear regression
│   │   │   └── multipel.vue    # Multiple regression
│   │   ├── tests/              # Statistical tests
│   │   │   ├── index.vue
│   │   │   ├── t-test.vue
│   │   │   ├── f-test.vue
│   │   │   ├── grubbs.vue
│   │   │   ├── p-wert.vue
│   │   │   └── vif.vue
│   │   └── modelle/            # ML/Forecast models overview
│   │       └── index.vue
│   ├── components/
│   │   ├── ui/                 # Generic reusable UI
│   │   ├── charts/             # Chart.js wrappers
│   │   └── tools/              # Interactive calculator tools
│   ├── composables/            # Shared logic (useRegression, useStats, etc.)
│   ├── utils/
│   │   └── stats.ts            # Pure statistical computation functions
│   └── assets/css/
│       └── main.css
├── nuxt.config.ts
├── tailwind.config.ts
└── CLAUDE.md
```

---

## Content Coverage

The learning content maps directly to the Obsidian notes. Priority order:

### Phase 1 — Grundlagen
- Lagemaße: Mittelwert, Median, Modus
- Streuungsmaße: Spannweite, Standardabweichung, IQR
- Verteilungen: Normalverteilung, Histogramme, schiefe Verteilungen
- Korrelation: Pearson r, Streudiagramm
- Konfidenzintervalle, Hypothesentests, p-Wert

### Phase 2 — Regression
- Einfache lineare Regression (OLS, Gerade, R²)
- Multiple lineare Regression (adjustiertes R², Koeffizienteninterpretation)
- Voraussetzungen: LINE-Prinzip, Residuenanalyse
- Regularisierung (Ridge, Lasso, Elastic Net) — Theorie-Überblick

### Phase 3 — Statistische Tests
- T-Test, F-Test, Grubbs-Test, VIF, Beta-Faktor
- Mit jeweils: Erklärung, Formel (KaTeX), interaktivem Rechner

### Phase 4 — ML-Modellübersicht
- Überblick der MESSDAS-Forecast-Modelle (ExtraTrees, RandomForest, Prophet, BlockRNN, LinearRegression)
- Kein eigenes Training — nur Konzeptvermittlung und Vergleichstabelle

---

## Interactive Tools (must-haves)

Every major topic gets at least one interactive tool:

| Tool | Description |
|------|-------------|
| **Regression Sandbox** | Drag points on a scatter plot → see OLS line + R² update live |
| **Distribution Explorer** | Adjust μ and σ → see normal distribution shift |
| **Correlation Slider** | Slide r from −1 to +1 → scatter plot updates |
| **Outlier Effect** | Add/remove outliers → see effect on mean vs. median |
| **Hypothesis Test Calculator** | Enter sample data → get t-statistic, p-value |
| **Grubbs-Test Tool** | Enter dataset → highlights outliers with explanation |
| **VIF Calculator** | Input correlation matrix → shows VIF per variable |

---

## Design Principles

- Dark-mode-first design with subtle gradients and a monospace feel for formulas
- Each topic page follows a fixed layout:
  1. **Concept** — plain-language explanation with energy-domain example
  2. **Formula** — rendered with KaTeX
  3. **Interactive tool** — hands-on experiment
  4. **Summary / Takeaway** — one-sentence rule
- Navigation: left sidebar (topic tree) + breadcrumbs
- Mobile-friendly but desktop-first

---

## Statistical Computation

All computation happens client-side in pure TypeScript (`app/utils/stats.ts`). No external stats libraries — implement the formulas directly so the learning value is transparent. Functions to implement:

```ts
mean(data: number[]): number
median(data: number[]): number
standardDeviation(data: number[], population?: boolean): number
iqr(data: number[]): number
pearsonR(x: number[], y: number[]): number
olsRegression(x: number[], y: number[]): { beta0: number; beta1: number; r2: number }
tTest(sample: number[], mu0: number): { tStat: number; pValue: number }
grubbs(data: number[]): { outlier: number; gStat: number; critical: number }
vif(predictors: number[][]): number[]
```

---

## Jira

No Jira project linked — omit ticket from commit messages.

Commit format:
```
[TASK] - Set up Nuxt 3 project structure
[FEATURE] - Add linear regression interactive sandbox
[BUGFIX] - Fix OLS calculation for single-point edge case
```

---

## Workflow

- Nach Abschluss jedes TODO-Punkts: den Punkt in `TODO.md` abhaken (`- [x]`)