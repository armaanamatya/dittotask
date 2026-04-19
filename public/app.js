import { analyzeProfile, buildPreviewSubtitle } from "../shared/profileEngine.js";

const defaultProfile = {
  name: "Jordan",
  age: "29",
  city: "Chicago",
  intent: "long_term",
  pace: "steady",
  communication: "balanced",
  firstDate: "museum",
  availability: "weekends",
  boundary: "public_first",
  greenFlags: ["consistency", "curiosity", "kindness"],
  about:
    "I'm building a life with real momentum and would love a relationship that feels warm, grounded, and a little playful. My best weeks include a dinner party, a long run by the lake, and one very opinionated movie recommendation.",
  sunday:
    "Coffee, a walk with a podcast, grocery shopping for something ambitious, and family dinner if I can make it happen.",
  geekOut:
    "Transit maps, restaurant spreadsheets, and why some cities feel instantly more alive than others.",
  dealbreaker:
    "I lose interest fast when communication is inconsistent or plans stay hypothetical.",
};

const optionLabels = {
  intent: {
    long_term: "Long-term relationship",
    figuring_it_out: "Figuring it out intentionally",
    short_term: "Short-term dating",
    new_to_city: "New to the city, open to connection",
    new_friends: "Friends first",
  },
  pace: {
    slow_burn: "Slow burn",
    steady: "Intentional and steady",
    go_with_flow: "See where it goes",
    this_week: "Ready to meet this week",
  },
  communication: {
    consistent: "Consistent texter",
    balanced: "Thoughtful, not constant",
    plans_first: "Prefers plans over chatting all day",
    light: "Light and playful",
  },
  firstDate: {
    coffee_walk: "Coffee and a walk",
    museum: "Museum or gallery",
    bookstore: "Bookstore and tea",
    food_crawl: "Food crawl",
    farmer_market: "Farmer's market",
    live_music: "Live music",
    dinner: "Dinner reservation",
  },
  availability: {
    weekday_evenings: "Mostly weeknights",
    weekends: "Mostly weekends",
    flexible: "Flexible most weeks",
  },
  boundary: {
    public_first: "I prefer meeting in a public place first.",
    video_first: "I like a quick video call before meeting up.",
    daytime_first: "I prefer a daytime first date.",
    slow_messages: "I like messaging a bit before we meet.",
  },
  greenFlags: {
    consistency: "Consistency",
    kindness: "Kindness",
    curiosity: "Curiosity",
    communication: "Communication",
    humor: "Humor",
    community: "Close friendships",
    ambition: "Ambition",
    adventure: "Adventure",
  },
};

const greenFlags = Object.entries(optionLabels.greenFlags);
const form = document.querySelector("#profileForm");
const greenFlagsGroup = document.querySelector("#greenFlagsGroup");

const totalScore = document.querySelector("#totalScore");
const scoreBreakdown = document.querySelector("#scoreBreakdown");
const strengthList = document.querySelector("#strengthList");
const suggestionList = document.querySelector("#suggestionList");
const previewName = document.querySelector("#previewName");
const previewSubtitle = document.querySelector("#previewSubtitle");
const previewBadges = document.querySelector("#previewBadges");
const previewAbout = document.querySelector("#previewAbout");
const previewSunday = document.querySelector("#previewSunday");
const previewGeekOut = document.querySelector("#previewGeekOut");
const previewBoundary = document.querySelector("#previewBoundary");
const avatarInitial = document.querySelector("#avatarInitial");
const matchCards = document.querySelector("#matchCards");

greenFlagsGroup.innerHTML = greenFlags
  .map(
    ([value, label]) => `
      <label class="chip-option">
        <input type="checkbox" name="greenFlags" value="${value}" />
        <span>${label}</span>
      </label>
    `,
  )
  .join("");

function hydrateForm(profile) {
  for (const [key, value] of Object.entries(profile)) {
    if (key === "greenFlags") {
      const selected = new Set(value);
      document
        .querySelectorAll('input[name="greenFlags"]')
        .forEach((input) => (input.checked = selected.has(input.value)));
      continue;
    }

    const field = form.elements.namedItem(key);
    if (field) field.value = value;
  }
}

function collectProfile() {
  const data = new FormData(form);
  return {
    name: String(data.get("name") || "").trim(),
    age: String(data.get("age") || "").trim(),
    city: String(data.get("city") || "").trim(),
    intent: String(data.get("intent") || ""),
    pace: String(data.get("pace") || ""),
    communication: String(data.get("communication") || ""),
    firstDate: String(data.get("firstDate") || ""),
    availability: String(data.get("availability") || ""),
    boundary: String(data.get("boundary") || ""),
    greenFlags: data.getAll("greenFlags").map(String),
    about: String(data.get("about") || "").trim(),
    sunday: String(data.get("sunday") || "").trim(),
    geekOut: String(data.get("geekOut") || "").trim(),
    dealbreaker: String(data.get("dealbreaker") || "").trim(),
  };
}

function fillList(target, items, className) {
  target.innerHTML = items.map((item) => `<li class="${className}">${item}</li>`).join("");
}

function renderBreakdown(breakdown) {
  const rows = [
    ["Intent", breakdown.intent],
    ["Specificity", breakdown.specificity],
    ["Authenticity", breakdown.authenticity],
    ["Safety", breakdown.safety],
  ];

  scoreBreakdown.innerHTML = rows
    .map(
      ([label, value]) => `
        <div class="breakdown-row">
          <strong>${label}</strong>
          <div class="meter"><div class="meter-fill" style="width:${(value / 25) * 100}%"></div></div>
          <span>${value}/25</span>
        </div>
      `,
    )
    .join("");
}

function renderPreview(profile) {
  const name = profile.name || "Your name";
  const age = profile.age ? `, ${profile.age}` : "";
  avatarInitial.textContent = name.slice(0, 1).toUpperCase() || "Y";
  previewName.textContent = `${name}${age}`;
  previewSubtitle.textContent =
    buildPreviewSubtitle({
      city: profile.city || "Your city",
      intentLabel: optionLabels.intent[profile.intent],
      communicationLabel: optionLabels.communication[profile.communication],
    }) || "Complete a few inputs to see the live profile card";

  const badges = [
    optionLabels.pace[profile.pace],
    optionLabels.firstDate[profile.firstDate],
    optionLabels.availability[profile.availability],
  ].filter(Boolean);

  previewBadges.innerHTML = badges.map((badge) => `<span class="badge">${badge}</span>`).join("");
  previewAbout.textContent =
    profile.about || "Add a short bio so matches can understand your energy and priorities.";
  previewSunday.textContent =
    profile.sunday || "Share a routine that makes your life feel real and specific.";
  previewGeekOut.textContent =
    profile.geekOut || "A niche enthusiasm gives people an easy, playful way to message first.";
  previewBoundary.textContent =
    optionLabels.boundary[profile.boundary] ||
    "A first-date boundary helps set expectations and builds trust early.";
}

function renderMatches(matches) {
  matchCards.innerHTML = matches
    .map(
      (match) => `
        <article class="match-card">
          <header>
            <h4>${match.name}</h4>
            <span class="score-chip">${match.fit}% fit</span>
          </header>
          <p>${match.summary}</p>
        </article>
      `,
    )
    .join("");
}

function render() {
  const profile = collectProfile();
  const analysis = analyzeProfile(profile);

  totalScore.textContent = String(analysis.total);
  renderBreakdown(analysis.breakdown);
  fillList(strengthList, analysis.strengths.length ? analysis.strengths : ["Add more detail to generate strengths."], "strength");
  fillList(suggestionList, analysis.suggestions, "suggestion");
  renderPreview(profile);
  renderMatches(analysis.matches);

  localStorage.setItem("ditto-intent-profile", JSON.stringify(profile));
}

const savedProfile = (() => {
  try {
    return JSON.parse(localStorage.getItem("ditto-intent-profile") || "null");
  } catch {
    return null;
  }
})();

hydrateForm(savedProfile || defaultProfile);
render();
form.addEventListener("input", render);
