---
target: app shell and dashboard
total_score: 28
p0_count: 0
p1_count: 1
timestamp: 2026-05-24T23-32-15Z
slug: d-src-app-tsx-frontend-src-pages-dashboardpage-tsx
---
# Impeccable Critique: App Shell + Dashboard

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Dashboard communicates current counts, loading state improved. |
| 2 | Match System / Real World | 3 | Uses agenda, noivas, locacoes and financeiro language. |
| 3 | User Control and Freedom | 3 | Sidebar navigation is clear; collapse remains available. |
| 4 | Consistency and Standards | 3 | Tokens and component states are more consistent after polish. |
| 5 | Error Prevention | 3 | Agenda availability is stronger; shell/dashboard mostly informational. |
| 6 | Recognition Rather Than Recall | 3 | Grouped navigation and visible labels reduce memory burden. |
| 7 | Flexibility and Efficiency | 3 | Dense dashboard supports quick scanning. |
| 8 | Aesthetic and Minimalist Design | 3 | More atelier-like, still room to reduce repeated metric cards. |
| 9 | Error Recovery | 2 | Session renewal exists, but copy can be more polished. |
| 10 | Help and Documentation | 2 | Empty states help, but dashboard has no embedded guidance. |
| Total | | 28/40 | Solid MVP product UI, improved but not flagship yet. |

## Anti-Patterns Verdict

LLM assessment: The prior version still felt too close to a generic admin because the sidebar and metric grid did not establish a strong product identity. After polish, the app shell reads more like a restrained boutique product interface, with clearer grouping and better hierarchy.

Deterministic scan: Initial scan found one warning for overused font usage in frontend/src/styles/app.css. Polish removed Inter from the primary stack and converted key tokens to OKLCH. Follow-up scan returned no findings.

Visual overlays: Browser mutation/injection was not used because the Codex browser evaluate surface is read-only in this environment. Manual browser evidence confirmed the sidebar, dashboard and scroll behavior after reload.

## Priority Issues

[P1] Metric grid still repeats too much below the hero.
Why it matters: Operators need agenda and pendencies first, not nine cards with similar visual weight.
Fix: Continue converting secondary metrics into compact rows or grouped operational summaries.
Suggested command: $impeccable distill the dashboard metrics

[P2] Session error copy is functional but not brand-polished.
Why it matters: A session expiry is a high-friction moment; the message should reassure and recover quickly.
Fix: Rewrite as a calm operational message with one clear action.
Suggested command: $impeccable clarify session and error states

[P2] Dashboard lacks direct actions from lists.
Why it matters: Vendedoras and managers see what matters, but cannot act directly from the central view.
Fix: Add contextual actions such as abrir agenda, ver noiva, registrar pagamento where safe.
Suggested command: $impeccable shape dashboard quick actions

## Persona Red Flags

Vendedora: Agenda is visible, but follow-up actions still require navigation. Risk: more clicks during active atendimento.
Gerente: Pendencies are visible, but categories compete with equal card weight. Risk: slower priority judgment.
Financeiro: Receivables appear, but dashboard does not yet expose direct payment action. Risk: extra navigation for routine work.

## Minor Observations

The light sidebar now matches the boutique direction better. The product register is now explicit in PRODUCT.md. Scroll behavior on the homepage is fixed.

## Questions to Consider

Should the dashboard become a true action console, or stay a read-only overview?
Which role should own the dashboard default: vendedora, gerente, or financeiro?
