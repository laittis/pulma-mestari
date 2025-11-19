# Kids Problem Solving App

- Just quick PoC

## Design notes

- Levels (1–6) drive difficulty:
  - Level 1: addition only
  - Level 2: addition + subtraction
  - Level 3: add/sub with some missing operands
  - Level 4+: add/sub/mul (and div at 6), ranges grow gradually
- Open “Asetukset” to change level and round length or reset to level 1/2.
- Game state is reducer-driven for predictable transitions and future extensibility.

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
