# MVP Tech Architecture

## Stack
- Next.js App Router
- TypeScript
- Tailwind CSS
- local JSON seed data for MVP content
- optional Supabase integration later

## App modules
- marketing pages
- onboarding flow
- assessment engine
- scoring engine
- report generator
- consultation lead capture

## Architectural principles
- keep all logic explainable;
- start with local content and deterministic scoring;
- avoid external dependency on LLM for core results;
- structure code so content can move to database later.

## Data flow
User input -> assessment answers -> scoring engine -> profile summary -> profession match -> subjects/directions -> report view
