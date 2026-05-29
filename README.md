# SpanX — Measure Your Attention Span

SpanX is a free, sign-up-free web app that estimates different dimensions of your
attention using four cognitive tasks adapted from established psychology paradigms.
You run a ~6-minute battery, get a percentile profile, and can share or download
your results.

**Live:** https://www.kabyik.dev/SpanX/

> Results are for educational and self-tracking purposes only and do **not**
> constitute a clinical diagnosis.

---

## The tests

| Test | Paradigm | Measures | What it reports |
|------|----------|----------|-----------------|
| **Reaction Time** | Psychomotor Vigilance Task (PVT) | Raw processing speed / alertness | Median & mean RT over 5 trials |
| **Stroop** | Color–Word Interference | Selective attention, response inhibition | Accuracy, mean RT, congruent vs. incongruent RT |
| **Sustained Attention** | Continuous Performance Test (CPT) | Vigilance over time, impulse control | Hits, misses, false alarms, avg RT, sensitivity (d′) |
| **Sequence Memory** | Corsi Block-Tapping | Visuospatial working-memory span | Maximum sequence length reached |

### Why these four?

- **PVT** is a standard measure of behavioral alertness; lapses (slow responses) and
  false starts are its primary outcomes. The full task runs 10 minutes, but brief
  versions remain valid — SpanX uses a short 5-trial version for quick self-testing.
- **Stroop** captures the interference between automatic reading and deliberate color
  naming; incongruent trials are reliably slower (~85–170 ms in the literature).
- **CPT** requires watching a stream of stimuli and responding only to a target. Misses
  reflect inattention; false alarms reflect impulsivity. SpanX summarizes both with
  **d′** (signal-detection sensitivity), computed as `z(hit rate) − z(false-alarm rate)`
  with a log-linear correction so perfect/zero rates stay finite.
- **Corsi** measures visuospatial span; healthy adults typically reach around 5–6.

## Scoring

Each completed test is mapped to a **percentile** (the share of people you'd score
higher than) using lookup tables estimated from published normative data. The
**Overall Attention Score** is the average of the completed percentiles, bucketed into
a rating from *Needs Improvement* to *Exceptional*.

All scoring is pure and unit-tested — see [`src/lib/scoring.ts`](src/lib/scoring.ts)
and [`src/lib/scoring.test.ts`](src/lib/scoring.test.ts).

### A note on timing accuracy

SpanX runs entirely in your browser with no backend, so **network speed and ping do
not affect your reaction times** — they only influence the one-time page load. What
*is* measured is handled carefully (see [`src/lib/timing.ts`](src/lib/timing.ts)):

- **Stimulus onset is timestamped at paint, not at code execution.** A stimulus is
  timed with a `requestAnimationFrame` callback fired after the browser paints it,
  rather than when JavaScript decided to show it — removing a systematic frame of bias
  that otherwise inflates every reaction time.
- **Responses use the event's own timestamp.** Each tap/keypress is measured from the
  browser-supplied `event.timeStamp` (set when the input occurred), not from
  `performance.now()` read inside the handler, which would add event-dispatch latency.
- **Anticipations are rejected.** Responses faster than 100 ms can't be genuine
  reactions, so they're discarded as false starts (standard PVT convention).
- **Scoring leans on the median.** The reaction-time percentile uses your median trial,
  which shrugs off the occasional attention lapse instead of letting one slow trial tank
  your score.

Browsers still cap real precision at ~1–2 ms and add small security jitter, and each
device's display and input pipeline adds a fixed latency offset. So absolute times are
**not** lab-grade — but because that per-device offset is roughly constant, it cancels
out when you compare yourself over time or compare your four tasks against each other.

## Tech stack

- **React 18** + **TypeScript** + **Vite**
- **Tailwind CSS** + **shadcn/ui** (Radix primitives)
- **React Router** for navigation, **next-themes** for light/dark mode
- Results persist in **localStorage**; no backend, no accounts, no tracking
- **Vitest** + **Testing Library** for tests

## Getting started

```bash
# install dependencies
npm install

# start the dev server (http://localhost:8080)
npm run dev

# run the test suite
npm run test          # or: npm run test:watch

# lint
npm run lint

# production build + preview
npm run build
npm run preview
```

## Project structure

```
src/
├── components/
│   ├── tests/          # the four test implementations
│   ├── ui/             # shadcn/ui primitives
│   ├── ShareResults.tsx
│   ├── ThemeToggle.tsx
│   └── TestLayout.tsx
├── context/
│   └── ResultsContext.tsx   # results state + localStorage persistence
├── lib/
│   └── scoring.ts           # percentiles, d′, median (pure, tested)
├── pages/                   # one page per route
└── App.tsx                  # providers + routes
```

## Deployment

Pushing to `main` triggers the [GitHub Actions workflow](.github/workflows/deploy.yml),
which builds the app and publishes `dist/` to GitHub Pages. The production build is
served under the `/SpanX/` base path (configured in
[`vite.config.ts`](vite.config.ts)).

## Disclaimer

These tests are based on established cognitive-psychology paradigms but are simplified
for the web. They are intended for education and personal curiosity, and are not a
substitute for professional assessment.

## License

See the repository for license details. Built by [Kabyik Kayal](https://www.kabyik.dev/).
