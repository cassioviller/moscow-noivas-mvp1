---
target: app shell and dashboard
total_score: 29
p0_count: 0
p1_count: 0
timestamp: 2026-05-24T23-45-18Z
slug: d-src-app-tsx-frontend-src-pages-dashboardpage-tsx
---
# Impeccable Critique: App Shell + Dashboard

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Primary counts and operational signals are visible. |
| 2 | Match System / Real World | 3 | Uses agenda, noivas, locacoes and financeiro language. |
| 3 | User Control and Freedom | 3 | Sidebar navigation and dashboard quick actions support route changes. |
| 4 | Consistency and Standards | 3 | Tokens, buttons, cards and navigation are more aligned. |
| 5 | Error Prevention | 3 | Availability work supports prevention; dashboard remains mostly informational. |
| 6 | Recognition Rather Than Recall | 4 | Grouped menu labels and direct dashboard actions reduce memory burden. |
| 7 | Flexibility and Efficiency | 3 | Quick actions improve flow for vendedora, gerente and financeiro. |
| 8 | Aesthetic and Minimalist Design | 3 | Reduced repeated metric grid; still room for richer list-level actions. |
| 9 | Error Recovery | 2 | Session renewal exists, but the copy can still become warmer and clearer. |
| 10 | Help and Documentation | 2 | Empty states help, but dashboard has limited inline guidance. |
| Total | | 29/40 | Better product UI, closer to operational console. |

## Anti-Patterns Verdict

LLM assessment: The shell now reads as a restrained product interface for a bridal atelier, not a generic dark admin. The previous wall of metric cards was the clearest AI-template smell; polish reduced that by keeping only the three top indicators as cards and converting secondary values to compact operational signals.

Deterministic scan: `detect.mjs --json frontend/src` returned no findings.

Visual evidence: Browser inspection confirmed three `.metric-card` items, six `.compact-signal` items, three dashboard actions, and working main scroll.

## Priority Issues

[P2] Dashboard lists still lack row-level actions.
Why it matters: Users can navigate faster from the hero, but list rows still require extra navigation to act.
Fix: Add safe contextual actions on agenda, tarefas and financeiro rows.
Suggested command: $impeccable shape dashboard quick actions

[P2] Session expiry copy remains too mechanical.
Why it matters: Login/session failure is a trust moment.
Fix: Rewrite the error state with calmer copy and recovery guidance.
Suggested command: $impeccable clarify session and error states

[P3] The dashboard still has many sections below the fold.
Why it matters: Managers may scan too much before finding priority.
Fix: Distill lower dashboard sections into role-based tabs or a priority lane.
Suggested command: $impeccable distill the dashboard lower sections

## Persona Red Flags

Vendedora: Better quick start through Novo atendimento and Abrir agenda, but row actions still need follow-up.
Gerente: Priority is clearer, but lower sections still compete after the first fold.
Financeiro: Ver financeiro is now direct, but receivable rows are not actionable from the dashboard.

## Minor Observations

The new compact operational strip is a better fit for product UI than another card grid. Main scroll remains functional. Detector is clean.

## Questions to Consider

Should dashboard rows become actionable, or should the dashboard stay an overview with only top-level navigation?
Should the first screen default more toward vendedora, gerente, or financeiro?
