# Life Memory — Design System & Screen Contract

This document is the implementation contract referenced by `PRD.md`, `ARCHITECTURE.md`, and `SPRINT.md`.

## Tokens

| Role | Light | Dark |
|---|---|---|
| Canvas | `#f4f1ea` | `#111318` |
| Surface | `#fffdf8` | `#191c22` |
| Foreground | `#1b1c1d` | `#f3f0e8` |
| Muted | `#6f716f` | `#a8aaa8` |
| Brand | warm amber/indigo token from `app/globals.css` | same semantic token |

Typography uses Inter for interface labels, Newsreader for reflective copy, and a monospace face for dates, states, and evidence identifiers. Cards use 16–24px radii, one-pixel hairlines, and a restrained paper surface. Interactive targets are at least 44px high and expose visible focus rings.

## Implemented screen contract

1. `/` — public cinematic archive landing with registration and demo CTAs.
2. `/login` — email/password and Google OAuth sign-in, callback error state, demo link.
3. `/register` — email/password and Google OAuth registration, confirmation guidance.
4. `/dashboard` — authenticated archive summary, quick logger, metrics, recent timeline.
5. `/dashboard?demo=jimmy` — anonymous read-only demo preview with deterministic S-14 candidate.
6. `/timeline` — chronological cards with search, category filters, and inline category/entity removal.

## Planned screens

People, places, topics, insights/evidence drawer, monthly reflection, forgotten-memory detail, and settings remain Sprint 5–9 work. Their visual language must reuse the tokens and card anatomy above; they must not introduce a second design system.

## Interaction rules

- Quick Logger clears immediately after the pending insert returns and never waits for Gemini to render the optimistic card.
- `PENDING`, `RESOLVED`, and `FAILED` remain visible states; extraction errors provide a retry path without deleting the raw note.
- `planned` and `cancelled` activity details remain searchable but are excluded from completed-only statistics and dormancy calculations.
- Reduced motion keeps the content order and removes nonessential transitions. Demo copy must disclose that it uses fictional data.
