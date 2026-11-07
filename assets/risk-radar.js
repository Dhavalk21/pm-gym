// Risk Radar: a PM Gym game for M1. Mount with RiskRadar(document.getElementById("..."))
(function () {
  var RISKS = [
    { id: "value", name: "Value", q: "Will people want it, choose it, pay for it?", color: "#C8232B" },
    { id: "usability", name: "Usability", q: "Can people figure out how to use it?", color: "#E3A300" },
    { id: "feasibility", name: "Feasibility", q: "Can we build it, with our time, skills and tech?", color: "#1F57B0" },
    { id: "viability", name: "Viability", q: "Does it work for the business: legal, finance, sales, brand?", color: "#2C8350" }
  ];
  var IDEAS = [
    { t: "A smart-fridge camera that tells you what's inside, sold as a €9 monthly subscription.", r: "value",
      rw: "Cameras in fridges are buildable and the app can be simple. The open question is whether anyone will pay every month to know what's in their own fridge.",
      tests: ["Build a working camera prototype and test it in 10 homes", "Put up a landing page with the price and a pre-order button, and drive some traffic to it", "Run a usability test of the companion app"], a: 1,
      tw: "A pre-order page tests willingness to pay in days, for almost nothing. A prototype answers feasibility, which isn't the question." },
    { t: "A bank app that instantly approves any card dispute under €50, with no human review.", r: "viability",
      rw: "Customers will love it and it's easy to build. The risk is the business: fraud losses, chargeback rules and compliance.",
      tests: ["Ask 20 customers if they'd like instant approvals", "Replay last year's disputes under the new rule with the fraud and finance teams", "Prototype the dispute flow and test it with 5 users"], a: 1,
      tw: "Replaying real disputes puts a number on fraud losses before a single line ships. Customers saying yes tells you nothing new." },
    { t: "A video-doctor app designed for people aged 75 and over.", r: "usability",
      rw: "The need is real and video calls are solved technology. Whether this audience can get through login, camera permissions and a call without help is the open question.",
      tests: ["Watch 5 people over 75 try a clickable prototype", "Survey 500 people over 75 about telehealth", "Launch in one city and measure sign-ups"], a: 0,
      tw: "Five sessions with the real audience shows where they get stuck, in an afternoon. A survey can't show you someone failing to find a button." },
    { t: "Real-time voice translation across 30 languages inside video calls, under 300 ms delay, built in-house.", r: "feasibility",
      rw: "People clearly want this. Whether your team can hit that quality and latency across 30 languages is the real unknown.",
      tests: ["Interview 15 users about translation needs", "A one-week engineering spike on 3 hard language pairs, measuring delay and accuracy", "A fake-door button in the current app"], a: 1,
      tw: "A short spike on the hardest cases answers 'can we build it' directly. Demand tests answer a question you already know the answer to." },
    { t: "A B2B tool adds a free plan with unlimited users to grow faster.", r: "viability",
      rw: "Teams will happily take free seats. The risk is whether paying customers downgrade and whether support costs explode.",
      tests: ["Model it on current accounts with finance: who would downgrade, what support would cost", "Launch it and watch sign-ups", "A/B test the pricing page wording"], a: 0,
      tw: "Your own usage data shows who sits inside the free limits today. That's the downgrade risk, modelled before you commit." },
    { t: "A banking app replaces its settings menus with a single AI chat: just ask for what you want.", r: "usability",
      rw: "It's buildable, and simpler on paper. Whether people can find and finish everyday tasks without menus is the open question.",
      tests: ["Give 5 users 3 everyday tasks on a prototype and watch", "Ask users if they like chatbots", "Measure how often settings are used today"], a: 0,
      tw: "Task-based tests show if people succeed, not if they like the idea. Opinions about chatbots predict little." },
    { t: "An online pharmacy starts shipping prescription medicine to five more EU countries.", r: "viability",
      rw: "Demand and logistics are proven in the home market. Prescription rules differ by country, and that can block the whole plan.",
      tests: ["Launch in one country and see what happens", "A legal review of prescription and shipping rules in the five countries", "Survey customers in those countries"], a: 1,
      tw: "A legal review is cheap compared with launching into a ban. Never run a live experiment on a legal question." },
    { t: "A courier promises live parcel tracking accurate to the minute, but its vans have no GPS.", r: "feasibility",
      rw: "Customers want it and the screen is simple. Whether you can predict arrival to the minute from the data you actually have is the risk.",
      tests: ["Mock up the tracking screen and test it", "Back-test an arrival prediction on last month's delivery scans", "Ask customers how accurate tracking should be"], a: 1,
      tw: "Back-testing on real historical scans tells you how accurate you can be today, without building anything customers see." },
    { t: "A neighbourhood app where people rent out their power tools to each other.", r: "value",
      rw: "Listing and booking are simple to build. Whether neighbours will actually lend and rent, and trust each other, is the question.",
      tests: ["Build the full app with payments and insurance", "Hand-post 20 tool listings in one neighbourhood and see if anyone books", "Run a usability test of the listing flow"], a: 1,
      tw: "Faking the supply by hand tests real demand in one street, in two weeks. The full app comes after people actually book." },
    { t: "The meal-kit app from the warm-up: AI-generated weekly meal plans, because a competitor launched them.", r: "value",
      rw: "A competitor shipping it proves nothing about your customers. The first question is whether your subscribers want plans made for them, or enjoy choosing.",
      tests: ["Have a nutritionist hand-make plans for 50 subscribers for 3 weeks and track skipped weeks", "Build the AI planner in a quarter as the CEO asked", "Benchmark the competitor's feature"], a: 0,
      tw: "A 'Wizard of Oz' test fakes the AI with a human. If hand-made plans don't reduce skipped weeks, the AI version won't either." }
  ];

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function riskOf(id) { return RISKS.filter(function (r) { return r.id === id; })[0]; }

  window.RiskRadar = function (root) {
    var s;
    function reset() { s = { i: -1, risk: null, test: null, log: [] }; }
    reset();

    function radar() {
      var dots = s.log.map(function (l, k) {
        var qi = ["value", "viability", "feasibility", "usability"].indexOf(l.pick);
        var ang = (-90 + qi * 90 + 20 + (k % 3) * 25) * Math.PI / 180, rad = 30 + (k % 4) * 14;
        var x = 100 + Math.cos(ang) * rad, y = 100 + Math.sin(ang) * rad;
        return '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="6" fill="' + (l.riskOk ? "#2C8350" : "#C8232B") + '" stroke="#17202A" stroke-width="1.5"/>';
      }).join("");
      return '<svg viewBox="0 0 200 200" width="180" height="180" role="img" aria-label="Radar of your answers so far: ' + s.log.filter(function (l) { return l.riskOk; }).length + ' right out of ' + s.log.length + '">' +
        '<circle cx="100" cy="100" r="90" fill="none" stroke="#5F6975"/><circle cx="100" cy="100" r="60" fill="none" stroke="#3E4A57"/><circle cx="100" cy="100" r="30" fill="none" stroke="#3E4A57"/>' +
        '<line x1="10" y1="100" x2="190" y2="100" stroke="#3E4A57"/><line x1="100" y1="10" x2="100" y2="190" stroke="#3E4A57"/>' +
        '<text x="104" y="22" fill="#C3C9D0" font-size="11">Value</text><text x="140" y="94" fill="#C3C9D0" font-size="11">Viability</text>' +
        '<text x="104" y="186" fill="#C3C9D0" font-size="11">Feasibility</text><text x="14" y="94" fill="#C3C9D0" font-size="11">Usability</text>' + dots + '</svg>';
    }
    function score() { return s.log.reduce(function (a, l) { return a + (l.riskOk ? 10 : 0) + (l.testOk ? 10 : 0); }, 0); }

    function render() {
      var h = '<div class="rr">';
      if (s.i === -1) {
        h += '<div class="rr-intro">' + radar() + '<div><b class="rr-big">10 ideas, 4 risks</b>' +
          '<p>For each product idea, pick the risk most likely to kill it. Then pick the cheapest test that would answer it. 10 points for each. Scored on judgement, not speed.</p>' +
          '<ul class="rr-key">' + RISKS.map(function (r) { return '<li><i style="background:' + r.color + '"></i><b>' + r.name + '</b> ' + r.q + '</li>'; }).join("") + '</ul>' +
          '<button type="button" class="btn light solid" data-act="start">Start Risk Radar</button></div></div>';
      } else if (s.i >= IDEAS.length) {
        var by = {}; RISKS.forEach(function (r) { by[r.id] = { n: 0, ok: 0 }; });
        s.log.forEach(function (l) { by[l.r].n++; if (l.riskOk) by[l.r].ok++; });
        var worst = RISKS.slice().sort(function (a, b) { return (by[a.id].ok / by[a.id].n) - (by[b.id].ok / by[b.id].n); })[0];
        var sc = score();
        var line = sc >= 170 ? "Sharp. You see where ideas really break." : sc >= 120 ? "Solid. A couple of blind spots worth training." : "Good start. The lessons above are worth a second pass.";
        h += '<div class="rr-intro">' + radar() + '<div><b class="rr-big">' + sc + ' / 200</b><p>' + line + '</p>' +
          '<div class="rr-breakdown">' + RISKS.map(function (r) { return '<div style="border-color:' + r.color + '"><small>' + r.name + '</small><b>' + by[r.id].ok + ' of ' + by[r.id].n + '</b></div>'; }).join("") + '</div>' +
          (by[worst.id].ok < by[worst.id].n ? '<p>Blind spot to train: <b>' + worst.name + '</b> risk. ' + worst.q + '</p>' : '<p>No blind spots on risk types this round.</p>') +
          '<div class="rr-actions"><button type="button" class="btn light solid" data-act="again">Play again</button></div></div></div>';
      } else {
        var idea = IDEAS[s.i], step = s.risk === null ? 1 : s.test === null ? 2 : 3;
        h += '<div class="rr-top"><span>Idea ' + (s.i + 1) + ' of ' + IDEAS.length + '</span><span>Score ' + score() + '</span></div>' +
          '<div class="rr-play"><div class="rr-radar">' + radar() + '</div><div class="rr-main">' +
          '<p class="rr-idea">' + esc(idea.t) + '</p>' +
          '<p class="rr-ask">1. Which risk is most likely to kill this?</p><div class="rr-opts rr-4">' +
          RISKS.map(function (r) {
            var cls = "rr-opt"; if (s.risk !== null) cls += r.id === idea.r ? " ok" : r.id === s.risk ? " no" : " dim";
            return '<button type="button" class="' + cls + '" data-risk="' + r.id + '"' + (s.risk !== null ? " disabled" : "") + '><i style="background:' + r.color + '"></i>' + r.name + '</button>';
          }).join("") + '</div>';
        if (step >= 2) {
          h += '<p class="rr-why"><b>' + (s.risk === idea.r ? "Right." : "The bigger risk is " + riskOf(idea.r).name.toLowerCase() + ".") + '</b> ' + esc(idea.rw) + '</p>' +
            '<p class="rr-ask">2. What’s the cheapest test that answers it?</p><div class="rr-opts">' +
            idea.tests.map(function (t, k) {
              var cls = "rr-opt"; if (s.test !== null) cls += k === idea.a ? " ok" : k === s.test ? " no" : " dim";
              return '<button type="button" class="' + cls + '" data-test="' + k + '"' + (s.test !== null ? " disabled" : "") + '>' + esc(t) + '</button>';
            }).join("") + '</div>';
        }
        if (step === 3) {
          h += '<p class="rr-why"><b>' + (s.test === idea.a ? "Right." : "Cheaper and sharper:") + '</b> ' + esc(idea.tw) + '</p>' +
            '<button type="button" class="btn light solid" data-act="next">' + (s.i === IDEAS.length - 1 ? "See my score" : "Next idea") + '</button>';
        }
        h += '</div></div>';
      }
      root.innerHTML = h + '</div>';
      wire();
    }

    function wire() {
      root.querySelectorAll("[data-act]").forEach(function (b) {
        b.onclick = function () {
          var a = b.dataset.act;
          if (a === "start") { s.i = 0; }
          else if (a === "again") { reset(); s.i = 0; }
          else if (a === "next") { s.i++; s.risk = null; s.test = null; }
          render(); focusFirst();
        };
      });
      root.querySelectorAll("[data-risk]").forEach(function (b) {
        b.onclick = function () { s.risk = b.dataset.risk; render(); var t = root.querySelector("[data-test]"); if (t) t.focus(); };
      });
      root.querySelectorAll("[data-test]").forEach(function (b) {
        b.onclick = function () {
          var idea = IDEAS[s.i]; s.test = +b.dataset.test;
          s.log.push({ r: idea.r, pick: s.risk, riskOk: s.risk === idea.r, testOk: s.test === idea.a });
          render(); var n = root.querySelector('[data-act="next"]'); if (n) n.focus();
        };
      });
    }
    function focusFirst() { var f = root.querySelector(".rr-opt, [data-act]"); if (f) f.focus(); }
    render();
  };
})();
