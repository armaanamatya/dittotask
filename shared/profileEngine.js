const archetypes = [
  {
    id: "intentional-planner",
    name: "Intentional Planner",
    summary: "Shows up with clear goals, books the reservation, and follows through.",
    intents: ["long_term", "new_to_city"],
    paces: ["steady", "this_week"],
    communications: ["consistent", "balanced"],
    dates: ["museum", "dinner", "coffee_walk"],
    greenFlags: ["consistency", "kindness", "curiosity"],
  },
  {
    id: "easygoing-explorer",
    name: "Easygoing Explorer",
    summary: "Keeps things playful, social, and low pressure while staying open-minded.",
    intents: ["short_term", "figuring_it_out", "new_friends"],
    paces: ["go_with_flow", "this_week"],
    communications: ["light", "balanced"],
    dates: ["food_crawl", "live_music", "coffee_walk"],
    greenFlags: ["humor", "curiosity", "adventure"],
  },
  {
    id: "calm-communicator",
    name: "Calm Communicator",
    summary: "Prefers emotional steadiness, directness, and no mixed signals.",
    intents: ["long_term", "figuring_it_out"],
    paces: ["steady", "slow_burn"],
    communications: ["consistent", "plans_first"],
    dates: ["bookstore", "museum", "coffee_walk"],
    greenFlags: ["consistency", "communication", "kindness"],
  },
  {
    id: "community-builder",
    name: "Community Builder",
    summary: "Wants romance to feel integrated into real life, friends, and routines.",
    intents: ["long_term", "new_to_city", "new_friends"],
    paces: ["steady", "go_with_flow"],
    communications: ["balanced", "plans_first"],
    dates: ["farmer_market", "food_crawl", "museum"],
    greenFlags: ["community", "kindness", "curiosity"],
  },
];

const detailThresholds = [
  { limit: 8, score: 0 },
  { limit: 18, score: 3 },
  { limit: 30, score: 6 },
  { limit: Infinity, score: 8 },
];

function wordCount(value = "") {
  return value.trim().split(/\s+/).filter(Boolean).length;
}

function scoreByWords(value, thresholds = detailThresholds) {
  const words = wordCount(value);
  return thresholds.find((entry) => words <= entry.limit)?.score ?? 0;
}

function uniqueSelections(items = []) {
  return [...new Set(items.filter(Boolean))];
}

function scoreIntent(profile) {
  let score = 0;
  if (profile.intent) score += 9;
  if (profile.pace) score += 6;
  if (profile.communication) score += 5;
  if (profile.availability) score += 5;
  return score;
}

function scoreSpecificity(profile) {
  let score = 0;
  if (profile.firstDate) score += 6;
  score += Math.min(uniqueSelections(profile.greenFlags).length, 3) * 3;
  score += Math.min(scoreByWords(profile.about), 6);
  score += Math.min(scoreByWords(profile.sunday), 4);
  score += Math.min(scoreByWords(profile.geekOut), 4);
  return Math.min(score, 25);
}

function scoreAuthenticity(profile) {
  let score = 0;
  const totalWords =
    wordCount(profile.about) + wordCount(profile.sunday) + wordCount(profile.geekOut);

  if (totalWords >= 30) score += 10;
  else if (totalWords >= 18) score += 7;
  else if (totalWords >= 10) score += 4;

  const categoriesFilled = [profile.about, profile.sunday, profile.geekOut].filter(
    (entry) => wordCount(entry) >= 5,
  ).length;
  score += categoriesFilled * 4;

  if (profile.about.includes("I ") || profile.about.includes("I'm")) score += 3;
  return Math.min(score, 25);
}

function scoreSafety(profile) {
  let score = 0;
  if (profile.boundary) score += 8;
  if (scoreByWords(profile.dealbreaker) >= 3) score += 7;
  if (profile.availability) score += 4;
  if (uniqueSelections(profile.greenFlags).includes("communication")) score += 3;
  if (uniqueSelections(profile.greenFlags).includes("consistency")) score += 3;
  return Math.min(score, 25);
}

function compatibilityScore(profile, archetype) {
  let score = 40;
  if (archetype.intents.includes(profile.intent)) score += 20;
  if (archetype.paces.includes(profile.pace)) score += 12;
  if (archetype.communications.includes(profile.communication)) score += 12;
  if (archetype.dates.includes(profile.firstDate)) score += 8;

  const overlap = uniqueSelections(profile.greenFlags).filter((flag) =>
    archetype.greenFlags.includes(flag),
  ).length;
  score += overlap * 4;
  return Math.min(score, 98);
}

function buildStrengths(breakdown) {
  const strengths = [];
  if (breakdown.intent >= 20) strengths.push("Clear dating intent");
  if (breakdown.specificity >= 18) strengths.push("Concrete details that start conversations");
  if (breakdown.authenticity >= 18) strengths.push("Strong personal voice");
  if (breakdown.safety >= 18) strengths.push("Healthy boundaries and expectations");
  return strengths;
}

function buildSuggestions(profile, breakdown) {
  const suggestions = [];

  if (breakdown.intent < 18) {
    suggestions.push("Add clearer intent and pacing so matches know what kind of connection you want.");
  }
  if (breakdown.specificity < 18) {
    suggestions.push("Mention one or two very specific routines or date ideas to make opening messages easier.");
  }
  if (breakdown.authenticity < 18) {
    suggestions.push("Expand the written prompts with more personal texture so your profile sounds like you.");
  }
  if (breakdown.safety < 18) {
    suggestions.push("Add a boundary or dealbreaker to reduce mismatched conversations early.");
  }
  if (!profile.dealbreaker) {
    suggestions.push("A short dealbreaker line can save time without making the profile feel negative.");
  }

  return suggestions.slice(0, 3);
}

export function analyzeProfile(profile) {
  const breakdown = {
    intent: scoreIntent(profile),
    specificity: scoreSpecificity(profile),
    authenticity: scoreAuthenticity(profile),
    safety: scoreSafety(profile),
  };

  const total = Object.values(breakdown).reduce((sum, value) => sum + value, 0);
  const strengths = buildStrengths(breakdown);
  const suggestions = buildSuggestions(profile, breakdown);
  const matches = archetypes
    .map((archetype) => ({
      ...archetype,
      fit: compatibilityScore(profile, archetype),
    }))
    .sort((left, right) => right.fit - left.fit)
    .slice(0, 3);

  return {
    total,
    breakdown,
    strengths,
    suggestions,
    matches,
  };
}

export function buildPreviewSubtitle(profile) {
  const pieces = [profile.city, profile.intentLabel, profile.communicationLabel].filter(Boolean);
  return pieces.join(" • ");
}
