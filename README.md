# Kids Problem Solving App

- Just quick PoC

## Design notes

- Config‑driven levels
  - Defined in `src/features/math/levels/config.json`. You can add many micro‑levels to keep steps small and kid‑friendly.
  - Each level includes ops, number ranges, optional total caps (to keep mental math within bounds), target weights, and expression patterns.
  - Engine clamps the requested level to the nearest available.

- Task types (math feature)
  - BinaryTask (legacy): two operands and one operator. Answer can be the result or a missing operand.
  - ExpressionTask: multi‑term expressions rendered from tokens with exactly one hole (either result or one operand). Examples:
    - `1 + 2 + 3 + 4 + 5 = ?`
    - `1 + ? + 3 + 4 = 8`
  - Both task kinds carry a unified `answer` spec:
    - `{ kind: 'result' }` or `{ kind: 'operand', operandIndex }`.

- Level strategy
  - Levels 1–2: addition within 10, result only; introduce 3‑term sums gently.
  - Levels 3–5: addition within 20, then introduce subtraction (non‑negative totals), result only.
  - Levels 6–8: add/sub within 50→100; introduce missing operand holes gradually; allow simple expressions with 2–4 terms.
  - Levels 9–12: introduce small multiplication (× up to 5 then 10) mixed with add/sub; keep division for later.
  - Keep totals capped (e.g., totalMax) to match mental arithmetic spans; avoid negatives early.

- Core
  - Reducer‑driven game state under `src/core/state.ts`.
  - Progress/level up/down under `src/core/progress.ts`.
  - Stats via localStorage (`/stats`).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
