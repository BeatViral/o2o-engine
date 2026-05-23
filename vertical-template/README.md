# O2O Vertical Template

This folder is the reusable blueprint for launching standalone O2O vertical apps.

Current live spearhead:
- O2O for Recruiters

Future standalone apps can be cloned from this template:
- O2O for Mining
- O2O for Construction
- O2O for Migration Officers
- O2O for Hospitality
- O2O for Logistics
- O2O for Healthcare
- O2O for Education
- O2O for Government
- O2O for Founders
- O2O for Consultants

## Why this template exists

Vertical AI wins when the blind-spot engine is industry specific.
This template preserves the architecture while swapping domain logic.

## Clone Workflow

1. Copy `vertical-app-template.json` into a new vertical folder.
2. Set `vertical_id`, product naming, and homepage copy.
3. Define industry-specific blind spot diagnosis fields and fallback content.
4. Update system prompt constraints for that domain.
5. Replace demo scenario with one realistic weak input for that industry.
6. Replace testimonials with that industry's language and buying triggers.
7. Keep shared infrastructure unchanged:
   - account/auth/access flows
   - usage quotas
   - system memory and versioning
   - conflict-safe refine
   - markdown/PDF export

## Non-negotiables across all verticals

- Diagnose first, generate second.
- Surface hidden flaw before execution plan.
- Return corrected thesis before downstream artifacts.
- Keep strict schema contract and conflict-safe refine.
- Keep deterministic identity and persistent system memory.

## Output Order Pattern

1. System card
2. Blind spot diagnosis
3. Corrected thesis
4. Operating system artifacts
5. 21-day execution sprint
6. Next actions

## Files to tune per vertical

- `frontend/index.html` (positioning, sections, testimonials, demo)
- `frontend/app.js` (demo seed data, preview wording)
- `worker/src/worker.js`:
  - output schema for the vertical contract
  - SYSTEM_PROMPT vertical instructions
  - fallback generators
  - markdown export headings

See `recruiters-reference.md` for the current baseline implementation.
