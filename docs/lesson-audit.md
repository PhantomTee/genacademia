# GenAcademia Lesson Audit

Date: 2026-05-16

## Scope

This audit covers the project lessons in `src/content/lessons`.

It classifies each lesson by the evidence available in the lesson file:

- `complete`: has a non-empty task and an `expectedCode` snippet.
- `scaffolded`: has a non-empty task and starter code, but no explicit `expectedCode` snippet. These can still be valid teaching lessons, especially checklist, review, and capstone lessons.
- `blank`: missing a usable task.

## Current Result

- Total project lessons: 150
- Complete lessons with `expectedCode`: 37
- Scaffolded lessons: 113
- Blank lessons: 0
- Placeholder/chat artifacts found in lesson files: 0
- Learner-facing `stub` wording found in lesson files: 0

## Fixed In This Pass

The following lessons had blank tasks and now have concrete student instructions and usable hints:

- `lesson-29-INSURANCE.ts`
- `lesson-30-INSURANCE.ts`
- `lesson-30-PREDICTION_MARKET.ts`

The following final capstone lessons contained pasted planning/chat text inside `starterCode`; that non-code material was removed:

- `lesson-30-INSURANCE.ts`
- `lesson-30-PREDICTION_MARKET.ts`

The following lessons used "stub" wording in learner-facing tasks and now describe the work as first-version contract methods:

- `lesson-07-DEVELOPER_REPUTATION.ts`
- `lesson-07-FREELANCE_ESCROW.ts`
- `lesson-07-PREDICTION_MARKET.ts`
- `lesson-08-DEVELOPER_REPUTATION.ts`
- `lesson-08-FREELANCE_ESCROW.ts`
- `lesson-09-DAO.ts`
- `lesson-09-DEVELOPER_REPUTATION.ts`
- `lesson-09-FREELANCE_ESCROW.ts`

## Remaining Content Risk

Most lessons are still classified as `scaffolded` because they do not include `expectedCode`. That is not automatically wrong, but it means the lesson is harder to verify and less self-contained.

Recommended next improvement: add structured verification specs or expected snippets for the 113 scaffolded lessons, starting with capstone and payment/AI lessons where correctness matters most.

## Repeatable Audit Commands

Full per-file lesson classification:

```powershell
node scripts/audit-lessons.mjs
```

Blank or placeholder scan:

```powershell
rg -n '\bstub\b|task:\s*``|Final expected platform verification|Thought for|Tell Claude|Continue building your contract|TODO|placeholder' src\content\lessons -g '*.ts'
```

TypeScript and app verification:

```powershell
npx tsc --noEmit --pretty false
npm run lint
npm run build
```
