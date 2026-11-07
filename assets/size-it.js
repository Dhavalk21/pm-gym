// Size It: a PM Gym game for M6. Mount with SizeIt(element)
(function () {
  var VERDICTS = [
    { id: "sound", name: "Sound estimate" },
    { id: "topdown", name: "Top-down fantasy" },
    { id: "nobuyer", name: "Counts people who won't buy" },
    { id: "double", name: "Double counting" },
    { id: "share", name: "Unrealistic share" }
  ];
  var SLIDES = [
    { co: "A vet-booking app", claim: "The European pet market is worth about €30 billion a year. If we capture just 1%, that's €300 million.", a: "topdown",
      w: "\"1% of a giant market\" says nothing about who pays you. The app sells bookings to clinics, not pet food.",
      fix: "Bottom-up: say 20,000 reachable clinics × €600 a year = €12 million that could actually buy. Winning 10% of those in three years is about €1.2 million a year." },
    { co: "An invoicing app for freelancers", claim: "There are 3 million freelancers in our markets. At €10 a month, our market is €360 million a year.", a: "nobuyer",
      w: "Not every freelancer invoices often, and many already use accounting software that includes invoicing. That number is everyone, not your buyers.",
      fix: "Narrow to who could switch: freelancers who invoice several clients a month and don't yet use accounting software. Interviews and a quick survey tell you the share." },
    { co: "A shift-planning tool for restaurants", claim: "60,000 independent restaurants in our target countries, about 3 managers each, at €40 per manager per month: €86 million a year.", a: "sound",
      w: "Built bottom-up from countable buyers, a realistic number of seats and a real price. It's a total market, so the next question is how much of it you can reach.",
      fix: "Next: which of those restaurants can sales or marketing actually reach in year one, and what share is realistic?" },
    { co: "A reporting tool for agencies", claim: "We charge agencies €200 a month and their staff €15 per user. 5,000 agencies are €12 million, plus their 100,000 staff at €15 are €18 million: €30 million.", a: "double",
      w: "The agencies and their staff are the same buyers paying one bill. Adding both counts the same budget twice.",
      fix: "Pick one unit that matches how customers really pay, for example per agency with seat tiers, and size with that." },
    { co: "A project-management start-up", claim: "Our total market is €2 billion. We'll take 40% of it by the end of year two.", a: "share",
      w: "Established players with years of head start rarely hold 40% of a crowded market. A new entrant planning on it in two years is planning on a miracle.",
      fix: "Build the year-two number from the bottom up: sales capacity × realistic win rate × deal size. It will usually land at a small fraction of a percent." }
  ];
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function vname(id) { return VERDICTS.filter(function (v) { return v.id === id; })[0].name; }

  window.SizeIt = function (root) {
    var s;
    function reset() { s = { i: -1, pick: null, score: 0 }; }
    reset();
    function render() {
      var h = '<div class="rr">';
      if (s.i === -1) {
        h += '<div class="rr-intro"><div><b class="rr-big">Five pitch slides, about 8 minutes</b>' +
          '<p>Each slide makes a market-size claim. Spot what’s wrong with it, or call it sound. Then see how a better estimate is built.</p>' +
          '<p style="font-size:15px">All numbers are illustrative, built to show common mistakes.</p>' +
          '<button type="button" class="btn light solid" data-act="start">Start</button></div></div>';
      } else if (s.i < SLIDES.length) {
        var c = SLIDES[s.i];
        h += '<div class="rr-top"><span>Slide ' + (s.i + 1) + ' of ' + SLIDES.length + '</span><span>Score ' + s.score + '</span></div>' +
          '<div class="rr-main" style="max-width:860px"><div class="si-slide"><small>' + esc(c.co) + ', market size</small><p>' + esc(c.claim) + '</p></div>' +
          '<p class="rr-ask">What’s the verdict?</p><div class="rr-opts rr-4">' +
          VERDICTS.map(function (v) {
            var cls = "rr-opt"; if (s.pick !== null) cls += v.id === c.a ? " ok" : v.id === s.pick ? " no" : " dim";
            return '<button type="button" class="' + cls + '" data-v="' + v.id + '"' + (s.pick !== null ? " disabled" : "") + '>' + v.name + '</button>';
          }).join("") + '</div>';
        if (s.pick !== null) h += '<p class="rr-why"><b>' + (s.pick === c.a ? "Right: " : "It's ") + vname(c.a).toLowerCase() + '.</b> ' + esc(c.w) + '</p><p class="rr-why"><b>Better:</b> ' + esc(c.fix) + '</p>' +
          '<button type="button" class="btn light solid" data-act="next">' + (s.i === SLIDES.length - 1 ? "See my score" : "Next slide") + '</button>';
        h += '</div>';
      } else {
        h += '<div class="rr-main" style="max-width:820px"><b class="rr-big">' + s.score + ' / ' + SLIDES.length * 10 + '</b>' +
          '<p>The habit to keep: start from buyers you can count, at a price they actually pay, then ask what share you can realistically reach.</p>' +
          '<button type="button" class="btn light solid" data-act="again">Play again</button></div>';
      }
      root.innerHTML = h + '</div>';
      root.querySelectorAll("[data-act]").forEach(function (b) {
        b.onclick = function () { var a = b.dataset.act; if (a === "again") reset(); if (a === "next") { s.i++; s.pick = null; } else s.i = 0; render(); var f = root.querySelector(".rr-opt, [data-act]"); if (f) f.focus(); };
      });
      root.querySelectorAll("[data-v]").forEach(function (b) {
        b.onclick = function () { s.pick = b.dataset.v; if (s.pick === SLIDES[s.i].a) s.score += 10; render(); root.querySelector("[data-act]").focus(); };
      });
    }
    render();
  };
})();
