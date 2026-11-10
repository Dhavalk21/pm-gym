// PM Gym: single source of truth for the plan and progress.
// To update progress: set a module's status to "done" or "now" (one "now" at a time),
// and set page to its station page once it exists.
window.PMGYM = {
  colors: ["#E3A82B", "#2A9D8F", "#4C7BD9", "#6BA368", "#9B6BB0", "#D07A45"],
  onColors: ["#17202A", "#17202A", "#17202A", "#17202A", "#17202A", "#17202A"],
  zones: ["Understand", "Design and build", "Measure", "Grow", "Decide", "Ship and lead"],
  setup: { code: "M0", name: "Setup", status: "done" },
  modules: [
    { code: "M1", zone: 0, name: "Product thinking basics", short: "Thinking basics", desc: "Outcomes over outputs, the four risks every idea carries, and which decisions you can take back.", game: "Risk Radar", status: "now", page: "m1/" },
    { code: "M2", zone: 0, name: "Problem framing", short: "Problem framing", desc: "Separate problems from symptoms, write sharp problem statements, and use jobs to be done.", game: "Symptom or Problem?", page: "m2/" },
    { code: "M3", zone: 0, name: "Users and segmentation", short: "Segmentation", desc: "Segments that predict behaviour, personas and their limits, and picking who to serve first.", game: "Segment Sorter", page: "m3/" },
    { code: "M4", zone: 0, name: "Behavioural psychology", short: "Behaviour", desc: "Motivation, habits and biases, and the line where a nudge becomes a dark pattern.", game: "Nudge or Sludge", page: "m4/" },
    { code: "M5", zone: 0, name: "Product discovery", short: "Discovery", desc: "Interviews without leading questions, opportunity solution trees, and cheap tests of risky assumptions.", game: "Interview Simulator", page: "m5/" },
    { code: "M6", zone: 0, name: "Market and competition", short: "Market", desc: "Sizing a market both ways, mapping competitors, and positioning.", game: "Size It", page: "m6/" },
    { code: "AI-1", zone: 0, name: "AI foundations for PMs", short: "AI basics", desc: "How LLMs work, context and retrieval, choosing a model, and when not to use AI.", game: "AI or Not?", page: "ai-1/" },
    { code: "M7", zone: 1, name: "UX and design basics", short: "UX basics", desc: "User flows, usability heuristics, quick prototypes and testing with real people.", game: "Heuristic Hunt", page: "m7/" },
    { code: "M8", zone: 1, name: "Technical foundations", short: "Tech basics", desc: "APIs, data models, latency, tech debt, and build versus buy.", game: "Request Journey", page: "m8/" },
    { code: "M9", zone: 2, name: "Metrics and North Star", short: "Metrics", desc: "North Star and input metrics, metric trees, guardrails, and how targets get gamed.", game: "Metric Tree Builder", page: "m9/" },
    { code: "M10", zone: 2, name: "Instrumentation and data analysis", short: "Data analysis", desc: "Tracking plans, funnels, cohorts, and diagnosing a metric drop.", game: "Metric Detective", page: "m10/" },
    { code: "M11", zone: 2, name: "Experimentation", short: "Experiments", desc: "Designing, reading and deciding on A/B tests, and when not to run one.", game: "Ship or Kill", page: "m11/" },
    { code: "AI-2", zone: 2, name: "Evals and AI economics", short: "Evals", desc: "Measuring AI quality, handling hallucinations, and trading off cost and latency.", game: "Eval Arena", page: "ai-2/" },
    { code: "M12", zone: 3, name: "Growth", short: "Growth", desc: "Activation, retention, growth loops and product-led growth.", game: "Loop Builder", page: "m12/" },
    { code: "M13", zone: 3, name: "Business models and pricing", short: "Pricing", desc: "Business models, pricing and packaging, and unit economics.", game: "Price It", page: "m13/" },
    { code: "M14", zone: 4, name: "Vision and strategy", short: "Strategy", desc: "Diagnosis, guiding policy, coherent action, and real trade-offs.", game: "Strategy or Wishlist?", page: "m14/" },
    { code: "M15", zone: 4, name: "Prioritisation", short: "Prioritisation", desc: "Scoring methods and their limits, cost of delay, and saying no.", game: "Backlog Triage", page: "m15/" },
    { code: "M16", zone: 4, name: "Roadmaps and OKRs", short: "Roadmaps", desc: "Now, next and later roadmaps, outcome goals, and showing uncertainty honestly.", game: "Roadmap Remix", page: "m16/" },
    { code: "M17", zone: 5, name: "Execution and delivery", short: "Execution", desc: "Specs, launch plans, go-to-market, and post-launch reviews.", game: "Launch Day", page: "m17/" },
    { code: "M18", zone: 5, name: "Communication and influence", short: "Influence", desc: "Memos, stories with data, stakeholders, and influence without authority.", game: "Stakeholder Chess" },
    { code: "AI-3", zone: 5, name: "Agents and responsible AI", short: "Agents", desc: "Agents and tool use, guardrails, trust in AI interfaces, privacy and the EU AI Act.", game: "Agent Builder" }
  ],
  capstone: { code: "Cap", zone: 5, name: "Capstone", desc: "Ship an AI feature end to end, with an eval, a cost model and metrics.", game: "The real thing" }
};
