# GenAcademia

An interactive learning platform for building intelligent contracts on [GenLayer](https://genlayer.com). 30 hands-on lessons across 5 real project paths — write, deploy, and verify contracts directly in the browser.

## What it is

GenLayer introduces **intelligent contracts**: smart contracts with built-in AI reasoning via the Optimistic Simulator consensus model. GenAcademia teaches the full programming model — from `@gl.public.view` fundamentals through non-deterministic execution, LLM equivalence checks, and cross-contract calls — by having you build an actual project from scratch.

**5 project paths** (pick one at onboarding, progress tracked separately):
- Prediction Market
- Freelance Escrow
- DAO
- Developer Reputation
- Insurance

**30 lessons across 6 groups:**
1. Fundamentals
2. Intelligent Features
3. Collections & State
4. Advanced Non-Determinism
5. Value & Integration
6. Production Readiness

Each lesson: read the concept, write Python contract code in the browser editor, deploy to GenLayer Studionet via MetaMask, and hit a verification endpoint that calls your deployed contract to confirm it works.

## Stack

- **Next.js 14** (App Router, static lesson pages)
- **Prisma 7** + Supabase PostgreSQL
- **NextAuth v4** with SIWE (Sign-In with Ethereum)
- **wagmi v2** + MetaMask (EIP-6963)
- **genlayer-js** for contract deployment and reads
- **Monaco Editor** for in-browser code editing
- Deployed on Vercel

## Local dev

```bash
npm install
cp .env.example .env.local   # fill in your Supabase + NextAuth vars
npm run dev
```

Requires a Supabase project and MetaMask. Set `NEXT_PUBLIC_STUDIONET_RPC` to `https://studio.genlayer.com/api` for Studionet access.
