// Roadmap Remix: a PM Gym game for M16. Mount with RoadmapRemix(element)
(function () {
  var DX = { good: "A good OKR", tasks: "Key results are tasks, not outcomes", vague: "Too vague to measure", many: "Too many to focus on" };
  var OKRS = [
    { o: "Make getting paid effortless for freelancers", kr: ["Launch automatic payment reminders", "Ship the second bank integration", "Release new invoice templates"], a: "tasks",
      w: "These are things to ship, not results. A good key result says what changes for customers: \"Median days to payment from 34 to 20.\" The launches are how you might get there." },
    { o: "Improve the product", kr: ["Increase engagement", "Make users happier"], a: "vague",
      w: "Neither the objective nor the key results can be measured or argued with. Which users, which behaviour, from what to what?" },
    { o: "Get new freelancers to their first paid invoice faster", kr: ["Median days from sign-up to first paid invoice: 21 → 12", "Share of new accounts sending an invoice in week one: 35% → 50%", "Support tickets per 100 new accounts stay below 8"], a: "good",
      w: "A clear, customer-centred objective, measurable outcomes with starting points, and a guardrail (M9). Ambitious but specific." },
    { o: "Win the market", kr: ["Revenue +40%", "NPS +10", "Launch in Spain", "Launch in Italy", "Hire 12 engineers", "Ship a mobile app", "Cut churn by 20%", "Win 3 enterprise deals", "Redesign the website"], a: "many",
      w: "Nine key results, including tasks and things that pull against each other. Three to five outcomes per objective keeps a team focused." }
  ];
  var COLS = { now: "Now", next: "Next", later: "Later" };
  var ITEMS = [
    { t: "Help new users send their first invoice sooner", d: "Problem validated in interviews; design tested with five users.", a: "now", w: "Validated and designed. It's ready to build, so it belongs in Now." },
    { t: "Reduce late payments with automatic reminders", d: "In build. Ships this month.", a: "now", w: "Already in progress. Now is for what the team is working on today." },
    { t: "Let freelancers get paid instantly by card", d: "Bank partner signed. Design not started.", a: "next", w: "A clear opportunity with a partner ready, but it needs discovery and design first. Next." },
    { t: "Help freelancers estimate their yearly taxes", d: "Some interviews hint at the need. Not validated.", a: "later", w: "An interesting signal, but low confidence. Later means \"we're exploring\", not \"we promise\"." },
    { t: "Expand to Spain and Italy", d: "Depends on each country's e-invoicing rules. Research not started.", a: "later", w: "Big, uncertain and dependent on research. It belongs in Later, which shows the direction without fake dates." },
    { t: "Make payment links work with a second bank", d: "Partner contract ready. A two-week job, after reminders ship.", a: "next", w: "Well understood and small, but it follows the reminders work. Next." }
  ];
  var MAX = (OKRS.length + ITEMS.length) * 10;
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  window.RoadmapRemix = function (root) {
    var s;
    function reset() { s = { i: -1, pick: null, score: 0, placed: [] }; }
    reset();
    function board(curIdx) {
      return '<div class="rm-board">' + ["now", "next", "later"].map(function (c) {
        var items = s.placed.map(function (p, x) { return { p: p, x: x }; }).filter(function (o) { return ITEMS[o.x].a === c; });
        return '<div class="rm-col rm-' + c + '"><b>' + COLS[c] + '</b><small>' + (c === "now" ? "Building now, high confidence" : c === "next" ? "Shaping next, medium confidence" : "Exploring, low confidence") + '</small>' +
          (items.length ? items.map(function (o) { return '<span class="' + (o.p === ITEMS[o.x].a ? "ok" : "no") + '">' + esc(ITEMS[o.x].t) + '</span>'; }).join("") : '<em>Empty</em>') + '</div>';
      }).join("") + '</div>';
    }
    function render() {
      var h = '<div class="rr">', N = OKRS.length;
      if (s.i === -1) {
        h += '<div class="rr-intro"><div><b class="rr-big">Two rounds, about 8 minutes</b><p><b>Round 1:</b> an OKR clinic. Diagnose four OKRs. <b>Round 2:</b> turn a feature list into a Now, Next, Later roadmap by placing six items where they honestly belong.</p><button type="button" class="btn light solid" data-act="start">Start</button></div></div>';
      } else if (s.i < N) {
        var k = OKRS[s.i], done = s.pick !== null;
        h += '<div class="rr-top"><span>Round 1: OKR ' + (s.i + 1) + ' of ' + N + '</span><span>Score ' + s.score + ' / ' + MAX + '</span></div><div class="rr-play">' +
          '<div class="rm-okr"><small>Objective</small><b>' + esc(k.o) + '</b><small>Key results</small><ol>' + k.kr.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join("") + '</ol></div>' +
          '<div class="rr-main"><p class="rr-ask" style="margin-top:0">Your diagnosis?</p><div class="rr-opts">' + ["good", "tasks", "vague", "many"].map(function (d) {
            var cls = "rr-opt"; if (done) cls += d === k.a ? " ok" : d === s.pick ? " no" : " dim";
            return '<button type="button" class="' + cls + '" data-d="' + d + '"' + (done ? " disabled" : "") + '>' + DX[d] + '</button>';
          }).join("") + '</div>';
        if (done) h += '<p class="rr-why"><b>' + (s.pick === k.a ? "Right diagnosis. +10" : "It's " + DX[k.a].toLowerCase() + ".") + '</b> ' + esc(k.w) + '</p><button type="button" class="btn light solid" data-act="next">' + (s.i === N - 1 ? "On to round 2" : "Next OKR") + '</button>';
        h += '</div></div>';
      } else if (s.i < N + ITEMS.length) {
        var j = s.i - N, it = ITEMS[j], fin = s.pick !== null;
        h += '<div class="rr-top"><span>Round 2: item ' + (j + 1) + ' of ' + ITEMS.length + '</span><span>Score ' + s.score + ' / ' + MAX + '</span></div>' + board() +
          '<div class="rm-card"><b>' + esc(it.t) + '</b><p>' + esc(it.d) + '</p></div><p class="rr-ask">Where does it go?</p><div class="rr-opts rr-4">' + ["now", "next", "later"].map(function (c) {
            var cls = "rr-opt"; if (fin) cls += c === it.a ? " ok" : c === s.pick ? " no" : " dim";
            return '<button type="button" class="' + cls + '" data-c="' + c + '"' + (fin ? " disabled" : "") + '>' + COLS[c] + '</button>';
          }).join("") + '</div>';
        if (fin) h += '<p class="rr-why"><b>' + (s.pick === it.a ? COLS[it.a] + ". +10" : "Better in " + COLS[it.a] + ".") + '</b> ' + esc(it.w) + '</p><button type="button" class="btn light solid" data-act="next">' + (j === ITEMS.length - 1 ? "See my score" : "Next item") + '</button>';
      } else {
        h += '<div class="rr-main" style="max-width:820px"><b class="rr-big">' + s.score + ' / ' + MAX + '</b><p>A good roadmap shows problems and outcomes, with confidence falling from Now to Later, and no fake dates on things nobody understands yet. Good OKRs turn those outcomes into a few measurable results, so the team can choose the best way to get there.</p><button type="button" class="btn light solid" data-act="again">Play again</button></div>';
      }
      root.innerHTML = h + '</div>';
      root.querySelectorAll("[data-act]").forEach(function (b) {
        b.onclick = function () {
          var a = b.dataset.act;
          if (a === "again") { reset(); s.i = 0; }
          else if (a === "start") s.i = 0;
          else { if (s.i >= OKRS.length) s.placed.push(s.pick); s.i++; s.pick = null; }
          render(); var f = root.querySelector(".rr-opt:not([disabled]), [data-act]"); if (f) f.focus();
        };
      });
      root.querySelectorAll("[data-d]").forEach(function (b) {
        b.onclick = function () { s.pick = b.dataset.d; if (s.pick === OKRS[s.i].a) s.score += 10; render(); root.querySelector("[data-act]").focus(); };
      });
      root.querySelectorAll("[data-c]").forEach(function (b) {
        b.onclick = function () { s.pick = b.dataset.c; if (s.pick === ITEMS[s.i - OKRS.length].a) s.score += 10; render(); root.querySelector("[data-act]").focus(); };
      });
    }
    render();
  };
})();
