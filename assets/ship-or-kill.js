// Ship or Kill: a PM Gym game for M11. Mount with ShipOrKill(element)
(function () {
  var D = { ship: "Ship it", kill: "Kill it", wait: "Keep it running", fix: "Don't trust it: fix the test" };
  // Each test: a result card (rows), the right decision, which row decides it, and why.
  var TESTS = [
    { name: "Checkout button: \"Pay now\" instead of \"Continue\"",
      rows: [["Hypothesis", "Clearer wording reduces hesitation at the last step"], ["Primary metric", "Checkout completion: +4.1%"], ["95% confidence interval", "+2.0% to +6.2%"], ["Run time", "14 days, as planned (two full weeks)"], ["Users per group", "120,400 and 120,150 (planned 50/50)"], ["Guardrails", "Refunds and support contacts: no change"]],
      a: "ship", e: 2, w: "The whole confidence interval is above zero, it ran its planned two full weeks, the groups are balanced, and guardrails are flat. This is what a trustworthy win looks like." },
    { name: "New onboarding checklist",
      rows: [["Hypothesis", "A checklist helps new users reach their first invoice faster"], ["Primary metric", "First invoice within 7 days: +9%"], ["p-value", "0.04"], ["Run time", "3 days of a planned 14"], ["Users per group", "2,100 and 2,080 (planned 50/50)"], ["Team says", "\"It's significant already. Can we stop and ship?\""]],
      a: "wait", e: 3, w: "Checking early and stopping as soon as p dips under 0.05 is called peeking, and it makes false wins far more likely. Early results also over-represent eager, early users. Let it run the planned two weeks." },
    { name: "Upgrade pop-up on every login",
      rows: [["Hypothesis", "Reminding free users of Pro features raises upgrades"], ["Primary metric", "Upgrades to Pro: +12%"], ["95% confidence interval", "+7% to +17%"], ["Run time", "21 days, as planned"], ["Guardrail: refunds within 14 days", "+41%"], ["Guardrail: 1-star app reviews", "+3x, mostly about the pop-up"]],
      a: "kill", e: 4, w: "The primary metric won, but a guardrail broke badly: many \"upgrades\" are people who feel pushed and then ask for refunds. Kill this version. A gentler, contextual prompt is worth a new test." },
    { name: "AI-powered \"similar items\" widget",
      rows: [["Hypothesis", "Personalised recommendations raise items per order"], ["Primary metric", "Items per order: -0.3%"], ["95% confidence interval", "-2.1% to +1.5%"], ["Power", "Sized to detect a 2% change; reached full sample"], ["Cost", "Adds about €18,000 a month in compute"], ["Guardrails", "No change"]],
      a: "kill", e: 2, w: "The test was big enough to spot a 2% lift and found nothing: the interval sits around zero. With no evidence of benefit and a real monthly cost, don't ship it. Learn from it and move on." },
    { name: "Simplified pricing page",
      rows: [["Hypothesis", "Fewer plans make choosing easier"], ["Primary metric", "Trial starts: +6%"], ["p-value", "0.01"], ["Run time", "14 days, as planned"], ["Users per group", "50,000 and 46,200 (planned 50/50)"], ["Note", "Variant page loads a new script"]],
      a: "fix", e: 4, w: "A 50/50 split that ends 50,000 to 46,200 is a sample ratio mismatch: far too big to be chance. Something, maybe the new script, dropped users from one group. Any result is suspect until you find and fix the cause." },
    { name: "New home feed layout",
      rows: [["Hypothesis", "A denser layout helps people find more to read"], ["Primary metric, overall", "Articles read: +0.4%, not significant"], ["Metrics checked", "40 metrics across 12 segments"], ["Team found", "+18% for Android users in Austria on weekends"], ["Run time", "14 days, as planned"], ["Team says", "\"Let's ship it for Austrian Android users.\""]],
      a: "fix", e: 2, w: "Check 480 metric and segment combinations and some will look like big wins by pure chance. Treat the Austria finding as a new hypothesis and test it on its own, with a fresh sample. Don't ship on a fishing trip." },
    { name: "\"Trending now\" badges on articles",
      rows: [["Hypothesis", "Badges help readers find popular stories"], ["Primary metric", "Article clicks: +15% in week 1"], ["Week 2", "+6%"], ["Week 3", "+2%, still falling"], ["Run time", "3 of a planned 6 weeks"], ["Guardrails", "No change"]],
      a: "wait", e: 3, w: "The lift is shrinking every week. That's a novelty effect: people click because it's new. Keep it running to the planned six weeks and see where it settles before you decide." }
  ];
  var MAX = TESTS.length * 20;
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  window.ShipOrKill = function (root) {
    var s;
    function reset() { s = { i: -1, d: null, e: null, score: 0 }; }
    reset();
    function render() {
      var h = '<div class="rr">';
      if (s.i === -1) {
        h += '<div class="rr-intro"><div><b class="rr-big">Seven tests, about 10 minutes</b><p>Seven A/B test results land on your desk. For each one, decide: ship it, kill it, keep it running, or don\'t trust it. Then tap the line on the result card that decided it. 10 points for each.</p><button type="button" class="btn light solid" data-act="start">Start</button></div></div>';
      } else if (s.i < TESTS.length) {
        var T = TESTS[s.i], step = s.d === null ? 1 : s.e === null ? 2 : 3;
        h += '<div class="rr-top"><span>Test ' + (s.i + 1) + ' of ' + TESTS.length + '</span><span>Score ' + s.score + ' / ' + MAX + '</span></div><div class="rr-play">' +
          '<div class="sk-card"><small>A/B test result</small><b>' + esc(T.name) + '</b><dl>' +
          T.rows.map(function (r, j) {
            var cls = "sk-row"; if (step === 3) cls += j === T.e ? " ok" : j === s.e ? " no" : "";
            var inner = '<dt>' + esc(r[0]) + '</dt><dd>' + esc(r[1]) + '</dd>';
            return step === 2 ? '<button type="button" class="' + cls + ' pick" data-e="' + j + '">' + inner + '</button>' : '<div class="' + cls + '">' + inner + '</div>';
          }).join("") + '</dl></div><div class="rr-main">';
        if (step === 1) {
          h += '<p class="rr-ask" style="margin-top:0">Your call?</p><div class="rr-opts">' + ["ship", "kill", "wait", "fix"].map(function (k) { return '<button type="button" class="rr-opt" data-d="' + k + '">' + D[k] + '</button>'; }).join("") + '</div>';
        } else {
          h += '<p class="rr-why" style="margin-top:0"><b>' + (s.d === T.a ? "Right call: " + D[T.a].toLowerCase() + ". +10" : "The better call: " + D[T.a].toLowerCase() + ".") + '</b></p>';
          if (step === 2) h += '<p class="rr-ask">Now tap the line on the card that decides it.</p>';
          else h += '<p class="rr-why"><b>' + (s.e === T.e ? "That's the line. +10" : "The deciding line: " + esc(T.rows[T.e][0]).toLowerCase() + ".") + '</b> ' + esc(T.w) + '</p><button type="button" class="btn light solid" data-act="next">' + (s.i === TESTS.length - 1 ? "See my score" : "Next test") + '</button>';
        }
        h += '</div></div>';
      } else {
        h += '<div class="rr-main" style="max-width:820px"><b class="rr-big">' + s.score + ' / ' + MAX + '</b><p>Before trusting any result, check four things: did it run as planned, are the groups balanced, does the interval clear zero by enough to matter, and did any guardrail break? Most failed tests aren\'t bad luck; they\'re a broken test or an early peek.</p><button type="button" class="btn light solid" data-act="again">Play again</button></div>';
      }
      root.innerHTML = h + '</div>';
      root.querySelectorAll("[data-act]").forEach(function (b) {
        b.onclick = function () { var a = b.dataset.act; if (a === "again") reset(); if (a === "next") { s.i++; s.d = null; s.e = null; } else s.i = 0; render(); var f = root.querySelector("[data-d], [data-act]"); if (f) f.focus(); };
      });
      root.querySelectorAll("[data-d]").forEach(function (b) {
        b.onclick = function () { s.d = b.dataset.d; if (s.d === TESTS[s.i].a) s.score += 10; render(); var f = root.querySelector("[data-e]"); if (f) f.focus(); };
      });
      root.querySelectorAll("[data-e]").forEach(function (b) {
        b.onclick = function () { s.e = +b.dataset.e; if (s.e === TESTS[s.i].e) s.score += 10; render(); root.querySelector("[data-act]").focus(); };
      });
    }
    render();
  };
})();
