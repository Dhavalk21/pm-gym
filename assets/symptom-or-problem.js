// Symptom or Problem?: a PM Gym game for M2. Mount with SymptomOrProblem(element)
(function () {
  var BINS = [
    { id: "symptom", name: "Symptom", hint: "What you can see: a signal, a number, a complaint", color: "#E3A300" },
    { id: "problem", name: "Problem", hint: "Why it happens: a cause you can work on", color: "#C8232B" },
    { id: "solution", name: "Solution in disguise", hint: "An answer dressed up as a problem", color: "#1F57B0" }
  ];
  var CARDS = [
    { t: "Support tickets about late deliveries doubled last month.", a: "symptom", w: "A signal that something is wrong. It doesn't say why deliveries are late." },
    { t: "We need a live chat button on every page.", a: "solution", w: "This names a fix. The problem behind it, maybe people can't find answers, is still unstated." },
    { t: "Riders can't find building entrances in new-build areas, so deliveries arrive about 10 minutes late.", a: "problem", w: "A specific cause, for specific people, that you could work on." },
    { t: "Conversion on the pricing page fell 12%.", a: "symptom", w: "A number moving. It's where to start digging, not what to fix." },
    { t: "Users want a dashboard.", a: "solution", w: "A classic one. Ask what decision they're trying to make; the dashboard is one possible answer." },
    { t: "Trial users don't connect a data source in week one, so they never see a report.", a: "problem", w: "It names who, what blocks them, and the consequence. You can work on that directly." },
    { t: "Customers say the app is 'confusing'.", a: "symptom", w: "Real, but vague. Confusing where, for whom, doing what? That's the problem you still need to find." },
    { t: "Finance teams can't reconcile invoices because exports leave out tax IDs.", a: "problem", w: "Specific users, a specific job, a specific blocker." },
    { t: "Let's add AI to onboarding.", a: "solution", w: "A technology looking for a problem. What's failing in onboarding today?" }
  ];
  var CHAIN = {
    start: "Monthly churn for a team-chat app rose from 3% to 5% over two months.",
    levels: [
      { q: "Why? Pick the most useful next step.", o: ["The market is getting tougher", "Churn is concentrated in teams that signed up in the last two months", "A competitor cut its prices"], a: 1, w: "Narrow it with data before you explain it. 'Where exactly is it happening?' beats a plausible story." },
      { q: "Why are those newer teams leaving?", o: ["Most of them never invited more than two colleagues", "They didn't like the new logo", "Small teams always churn more"], a: 0, w: "A team-chat app with two people in it isn't much use. That's a behaviour you can see and check." },
      { q: "Why didn't they invite colleagues?", o: ["People are too busy to invite anyone", "The new onboarding, shipped two months ago, moved the invite step into settings", "Email is easier than chat"], a: 1, w: "There's the root cause: a change you made, which matches the timing, and which you can reverse." }
    ],
    end: "Root problem: the onboarding redesign hid the invite step, so new teams stay too small to get value. Fix that, not 'churn'."
  };

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  window.SymptomOrProblem = function (root) {
    var s;
    function reset() { s = { phase: "intro", i: 0, pick: null, sortScore: 0, lvl: 0, cpick: null, chainScore: 0, log: [] }; }
    reset();
    function bin(id) { return BINS.filter(function (b) { return b.id === id; })[0]; }

    function render() {
      var h = '<div class="rr">';
      if (s.phase === "intro") {
        h += '<div class="rr-intro"><div><b class="rr-big">Two rounds, about 10 minutes</b>' +
          '<p><b style="color:#F2F3F1">Round 1, Sort.</b> Nine statements from real-looking product teams. Is each one a symptom, a problem, or a solution in disguise?</p>' +
          '<p><b style="color:#F2F3F1">Round 2, Ask why.</b> Follow one churn spike down to its root cause, one "why" at a time.</p>' +
          '<ul class="rr-key">' + BINS.map(function (b) { return '<li><i style="background:' + b.color + '"></i><b>' + b.name + '</b> ' + b.hint + '</li>'; }).join("") + '</ul>' +
          '<button type="button" class="btn light solid" data-act="start">Start round 1</button></div></div>';
      } else if (s.phase === "sort") {
        var c = CARDS[s.i];
        h += '<div class="rr-top"><span>Round 1, statement ' + (s.i + 1) + ' of ' + CARDS.length + '</span><span>Score ' + (s.sortScore + s.chainScore) + '</span></div>' +
          '<div class="rr-main" style="max-width:820px"><p class="rr-idea">“' + esc(c.t) + '”</p><p class="rr-ask">Symptom, problem, or solution in disguise?</p><div class="rr-opts rr-4">' +
          BINS.map(function (b) {
            var cls = "rr-opt"; if (s.pick !== null) cls += b.id === c.a ? " ok" : b.id === s.pick ? " no" : " dim";
            return '<button type="button" class="' + cls + '" data-bin="' + b.id + '"' + (s.pick !== null ? " disabled" : "") + '><i style="background:' + b.color + '"></i>' + b.name + '</button>';
          }).join("") + '</div>';
        if (s.pick !== null) h += '<p class="rr-why"><b>' + (s.pick === c.a ? "Right." : "It's " + (c.a === "solution" ? "a solution in disguise" : "a " + bin(c.a).name.toLowerCase()) + ".") + '</b> ' + esc(c.w) + '</p>' +
          '<button type="button" class="btn light solid" data-act="next">' + (s.i === CARDS.length - 1 ? "On to round 2" : "Next statement") + '</button>';
        h += '</div>';
      } else if (s.phase === "chain") {
        var L = CHAIN.levels[s.lvl];
        h += '<div class="rr-top"><span>Round 2, why ' + (s.lvl + 1) + ' of ' + CHAIN.levels.length + '</span><span>Score ' + (s.sortScore + s.chainScore) + '</span></div>' +
          '<div class="rr-main" style="max-width:820px"><div class="sp-chain"><div class="sp-node">' + esc(CHAIN.start) + '</div>' +
          s.log.map(function (t) { return '<div class="sp-node">' + esc(t) + '</div>'; }).join("") + '</div>' +
          '<p class="rr-ask">' + esc(L.q) + '</p><div class="rr-opts">' +
          L.o.map(function (o, k) {
            var cls = "rr-opt"; if (s.cpick !== null) cls += k === L.a ? " ok" : k === s.cpick ? " no" : " dim";
            return '<button type="button" class="' + cls + '" data-why="' + k + '"' + (s.cpick !== null ? " disabled" : "") + '>' + esc(o) + '</button>';
          }).join("") + '</div>';
        if (s.cpick !== null) h += '<p class="rr-why"><b>' + (s.cpick === L.a ? "Good why." : "Stronger:") + '</b> ' + esc(L.w) + '</p>' +
          '<button type="button" class="btn light solid" data-act="nextwhy">' + (s.lvl === CHAIN.levels.length - 1 ? "See the root cause" : "Ask why again") + '</button>';
        h += '</div>';
      } else {
        var total = s.sortScore + s.chainScore, max = CARDS.length * 10 + CHAIN.levels.length * 10;
        h += '<div class="rr-main" style="max-width:820px"><b class="rr-big">' + total + ' / ' + max + '</b>' +
          '<p>Sorting: ' + s.sortScore / 10 + ' of ' + CARDS.length + '. Asking why: ' + s.chainScore / 10 + ' of ' + CHAIN.levels.length + '.</p>' +
          '<div class="sp-chain"><div class="sp-node">' + esc(CHAIN.start) + '</div>' + CHAIN.levels.map(function (l) { return '<div class="sp-node">' + esc(l.o[l.a]) + '</div>'; }).join("") + '</div>' +
          '<p class="rr-why"><b>' + esc(CHAIN.end) + '</b></p>' +
          '<button type="button" class="btn light solid" data-act="again">Play again</button></div>';
      }
      root.innerHTML = h + '</div>';
      wire();
    }

    function wire() {
      root.querySelectorAll("[data-act]").forEach(function (b) {
        b.onclick = function () {
          var a = b.dataset.act;
          if (a === "start") s.phase = "sort";
          else if (a === "again") { reset(); s.phase = "sort"; }
          else if (a === "next") { if (s.i === CARDS.length - 1) s.phase = "chain"; else s.i++; s.pick = null; }
          else if (a === "nextwhy") { var L = CHAIN.levels[s.lvl]; s.log.push(L.o[L.a]); if (s.lvl === CHAIN.levels.length - 1) s.phase = "end"; else s.lvl++; s.cpick = null; }
          render(); var f = root.querySelector(".rr-opt, [data-act]"); if (f) f.focus();
        };
      });
      root.querySelectorAll("[data-bin]").forEach(function (b) {
        b.onclick = function () { s.pick = b.dataset.bin; if (s.pick === CARDS[s.i].a) s.sortScore += 10; render(); root.querySelector("[data-act]").focus(); };
      });
      root.querySelectorAll("[data-why]").forEach(function (b) {
        b.onclick = function () { s.cpick = +b.dataset.why; if (s.cpick === CHAIN.levels[s.lvl].a) s.chainScore += 10; render(); root.querySelector("[data-act]").focus(); };
      });
    }
    render();
  };
})();
