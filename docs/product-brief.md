# Intent Profile Builder

## Product thesis

If I were founding a modern dating platform, I would start with one narrow promise:

> Help people have fewer, better conversations by making profiles more honest, specific, and safe.

The first version would not try to outcompete incumbents on sheer inventory or endless swiping. It would aim to win with better match quality for a focused early user segment:

- urban professionals who are exhausted by low-effort profiles
- users who care about intent clarity and emotional maturity
- people who want safety and boundaries normalized without killing the vibe

## Customer research approach

I did not run live interviews for this take-home, so I treated this as a product hypothesis grounded in a lightweight research plan:

- interview 8 to 10 active dating app users across 24 to 34
- ask them to show their current profile and last 5 opening chats
- identify where mismatch starts: unclear intent, low-signal prompts, safety ambiguity, or poor message quality
- measure success by first-message quality, reply rate, and percentage of users who schedule a first date

The working hypothesis is that profile quality is the highest-leverage place to begin because it improves several downstream systems at once:

- better messaging
- better ranking and compatibility inputs
- better trust and safety signals
- better onboarding completion quality

## Why this feature first

The **Intent Profile Builder** is the first feature because it helps solve the cold-start problem on both sides of the marketplace:

- users get guided help creating a stronger profile
- the product gets structured data for matching
- new matches get clearer context for starting a conversation

This is especially attractive for an MVP because it is valuable before a sophisticated recommendation system exists.

## What shipped

The prototype includes:

- a guided onboarding form for intent, pace, communication style, and first-date preferences
- green-flag selection and boundary capture
- a live signal score with breakdown by intent, specificity, authenticity, and safety
- a rendered profile preview
- compatibility archetypes that show how structured profile data can feed future matching logic
- unit tests around the scoring engine

## Engineering choices

- **Zero runtime dependencies**: easy to run, easy to inspect, low setup burden
- **Shared scoring engine**: business logic lives outside the UI, which keeps it testable
- **Static frontend + tiny Node server**: enough infrastructure to show delivery discipline without overbuilding

## Iteration plan

If I kept building, my next iterations would be:

1. measure whether guided profiles improve reply rate versus a freeform control
2. add profile coaching based on real message outcomes, not just heuristics
3. connect the structured fields to ranking and recommendation experiments
4. layer in trust features such as verification and safer first-date preferences

## Suggested video outline

1. Start with the product thesis: dating apps have a signal problem, not just a discovery problem.
2. Explain why profile quality is the first leverage point in an MVP.
3. Walk through the form and show how the score changes in real time.
4. Open the scoring logic and tests to show how product thinking translated into code.
5. Close with what you would measure and iterate on next.
