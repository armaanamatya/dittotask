import assert from "node:assert/strict";

import { analyzeProfile } from "../shared/profileEngine.js";

const tests = [
  {
    name: "rewards clear, detailed profiles",
    run() {
      const result = analyzeProfile({
        intent: "long_term",
        pace: "steady",
        communication: "balanced",
        firstDate: "museum",
        availability: "weekends",
        boundary: "public_first",
        greenFlags: ["consistency", "kindness", "curiosity"],
        about:
          "I'm at my best around thoughtful people, good food, and projects with a little ambition behind them.",
        sunday:
          "Coffee, a workout, an ambitious recipe, and catching up with family before the week starts.",
        geekOut:
          "Urban design, restaurant spreadsheets, and the small details that make a place memorable.",
        dealbreaker: "Mixed signals and last-minute planning.",
      });

      assert.ok(result.total >= 80);
      assert.ok(result.strengths.includes("Clear dating intent"));
      assert.equal(result.matches[0].name, "Intentional Planner");
    },
  },
  {
    name: "surfaces suggestions for incomplete profiles",
    run() {
      const result = analyzeProfile({
        intent: "",
        pace: "",
        communication: "",
        firstDate: "",
        availability: "",
        boundary: "",
        greenFlags: [],
        about: "Fun person.",
        sunday: "",
        geekOut: "",
        dealbreaker: "",
      });

      assert.ok(result.total < 30);
      assert.ok(result.suggestions.some((suggestion) => suggestion.includes("intent")));
      assert.ok(result.suggestions.some((suggestion) => suggestion.includes("specific")));
    },
  },
];

let failures = 0;

for (const test of tests) {
  try {
    test.run();
    console.log(`PASS ${test.name}`);
  } catch (error) {
    failures += 1;
    console.error(`FAIL ${test.name}`);
    console.error(error);
  }
}

if (failures > 0) {
  process.exitCode = 1;
} else {
  console.log(`All ${tests.length} tests passed.`);
}
