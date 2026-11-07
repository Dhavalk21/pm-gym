// Segment Sorter: a PM Gym game for M3. Mount with SegmentSorter(element)
(function () {
  var ROUNDS = [
    { ctx: "A project-management tool. Monthly churn is 6%. Which way of splitting users best explains who leaves?", metric: "Monthly churn",
      cuts: [
        { name: "Company size", bars: [["1 to 10 people", 6.1], ["11 to 50", 5.8], ["51 or more", 5.5]] },
        { name: "Country", bars: [["Germany", 5.9], ["UK", 5.7], ["US", 6.0]] },
        { name: "Invited a teammate in week one", bars: [["Yes", 2.1], ["No", 9.8]] }
      ], a: 2, w: "The behavioural cut separates users almost five to one, and it's actionable: you can design onboarding to get that invite. Size and country barely move churn." },
    { ctx: "A meal-kit subscription. 37% of subscribers skip at least one week a month. Who skips?", metric: "Skip a week each month",
      cuts: [
        { name: "Age", bars: [["25 to 34", 38], ["35 to 44", 36], ["45 and over", 35]] },
        { name: "How they build the box", bars: [["Picks recipes", 22], ["Takes the default box", 51]] },
        { name: "City size", bars: [["Big city", 37], ["Small town", 36]] }
      ], a: 1, w: "Demographics look alike. Behaviour splits sharply: people on the default box skip far more, which points at a real problem: the default isn't what they want." },
    { ctx: "A fitness app. 6% of free users upgrade to paid within 30 days. Who upgrades?", metric: "Upgrade within 30 days",
      cuts: [
        { name: "Gender", bars: [["Women", 6.2], ["Men", 5.9]] },
        { name: "Goal chosen at sign-up", bars: [["Lose weight", 4], ["Train for an event", 14], ["Stay active", 3]] },
        { name: "Phone", bars: [["iPhone", 6.6], ["Android", 5.4]] }
      ], a: 1, w: "A needs-based cut wins: people training for an event have a deadline and a reason to pay. That's a segment you can build for and market to." }
  ];
  var BEACH = {
    ctx: "Final round. A new language-learning app needs one first segment to serve brilliantly. Scores are 1 to 5 on what makes a good beachhead.",
    crit: ["Pain", "Easy to reach", "Will pay or engage", "Refer each other"],
    opts: [
      { name: "Casual hobby learners", s: [2, 3, 2, 2] },
      { name: "People moving abroad in the next six months", s: [5, 4, 4, 4] },
      { name: "University students", s: [2, 4, 1, 4] },
      { name: "Frequent business travellers", s: [3, 2, 4, 2] }
    ], a: 1,
    w: "People about to move abroad have a deadline and real pain, gather in the same relocation and expat groups, and recommend what worked for them. Hobby learners and students are easy to find but rarely stick or pay."
  };

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  window.SegmentSorter = function (root) {
    var s;
    function reset() { s = { r: -1, pick: null, score: 0, bpick: null }; }
    reset();

    function bars(cut, max, unit, dec) {
      return '<div class="ss-bars">' + cut.bars.map(function (b) {
        return '<div class="ss-bar"><span class="ss-lab">' + esc(b[0]) + '</span><span class="ss-track"><span style="width:' + (b[1] / max * 100).toFixed(1) + '%"></span></span><span class="ss-val">' + (dec ? b[1].toFixed(1) : b[1]) + unit + '</span></div>';
      }).join("") + '</div>';
    }

    function render() {
      var h = '<div class="rr">';
      if (s.r === -1) {
        h += '<div class="rr-intro"><div><b class="rr-big">Four rounds, about 15 minutes</b>' +
          '<p>Each round shows the same users split three ways. Pick the split that best predicts what people do, and that you could act on. The last round asks you to choose a beachhead.</p>' +
          '<p style="font-size:15px">The data is illustrative, built to show real patterns.</p>' +
          '<button type="button" class="btn light solid" data-act="start">Start</button></div></div>';
      } else if (s.r < ROUNDS.length) {
        var R = ROUNDS[s.r], max = 0;
        R.cuts.forEach(function (c) { c.bars.forEach(function (b) { if (b[1] > max) max = b[1]; }); });
        var unit = "%", dec = R.cuts.some(function (c) { return c.bars.some(function (b) { return b[1] % 1 !== 0; }); });
        h += '<div class="rr-top"><span>Round ' + (s.r + 1) + ' of ' + (ROUNDS.length + 1) + '</span><span>Score ' + s.score + '</span></div>' +
          '<p class="rr-idea" style="max-width:820px">' + esc(R.ctx) + '</p><p style="margin:6px 0 0;font-size:15px">Bars show: ' + R.metric.toLowerCase() + '.</p>' +
          '<div class="ss-cuts">' + R.cuts.map(function (c, k) {
            var cls = "ss-cut"; if (s.pick !== null) cls += k === R.a ? " ok" : k === s.pick ? " no" : " dim";
            return '<button type="button" class="' + cls + '" data-cut="' + k + '"' + (s.pick !== null ? " disabled" : "") + '><b>' + esc(c.name) + '</b>' + bars(c, max, unit, dec) + '</button>';
          }).join("") + '</div>';
        if (s.pick !== null) h += '<p class="rr-why" style="max-width:820px"><b>' + (s.pick === R.a ? "Right." : "Look at the spread:") + '</b> ' + esc(R.w) + '</p>' +
          '<button type="button" class="btn light solid" data-act="next">Next round</button>';
      } else if (s.r === ROUNDS.length) {
        h += '<div class="rr-top"><span>Round ' + (s.r + 1) + ' of ' + (ROUNDS.length + 1) + '</span><span>Score ' + s.score + '</span></div>' +
          '<p class="rr-idea" style="max-width:820px">' + esc(BEACH.ctx) + '</p><div class="ss-cuts">' +
          BEACH.opts.map(function (o, k) {
            var cls = "ss-cut"; if (s.bpick !== null) cls += k === BEACH.a ? " ok" : k === s.bpick ? " no" : " dim";
            return '<button type="button" class="' + cls + '" data-beach="' + k + '"' + (s.bpick !== null ? " disabled" : "") + '><b>' + esc(o.name) + '</b><div class="ss-bars">' +
              BEACH.crit.map(function (c, j) { return '<div class="ss-bar"><span class="ss-lab">' + c + '</span><span class="ss-dots" aria-label="' + o.s[j] + ' of 5">' + [1, 2, 3, 4, 5].map(function (d) { return '<i class="' + (d <= o.s[j] ? "on" : "") + '"></i>'; }).join("") + '</span></div>'; }).join("") +
              '</div></button>';
          }).join("") + '</div>';
        if (s.bpick !== null) h += '<p class="rr-why" style="max-width:820px"><b>' + (s.bpick === BEACH.a ? "That's the pick." : "The strongest beachhead is people moving abroad.") + '</b> ' + esc(BEACH.w) + '</p>' +
          '<button type="button" class="btn light solid" data-act="next">See my score</button>';
      } else {
        var max2 = (ROUNDS.length + 1) * 10;
        h += '<div class="rr-main" style="max-width:820px"><b class="rr-big">' + s.score + ' / ' + max2 + '</b>' +
          '<p>' + (s.score === max2 ? "Clean. You look for splits that change behaviour, not ones that just describe people." : "The pattern to remember: demographics describe people; behaviour and needs predict what they do.") + '</p>' +
          '<button type="button" class="btn light solid" data-act="again">Play again</button></div>';
      }
      root.innerHTML = h + '</div>';
      wire();
    }
    function wire() {
      root.querySelectorAll("[data-act]").forEach(function (b) {
        b.onclick = function () {
          var a = b.dataset.act;
          if (a === "start") s.r = 0; else if (a === "again") { reset(); s.r = 0; } else { s.r++; s.pick = null; }
          render(); var f = root.querySelector(".ss-cut, [data-act]"); if (f) f.focus();
        };
      });
      root.querySelectorAll("[data-cut]").forEach(function (b) {
        b.onclick = function () { s.pick = +b.dataset.cut; if (s.pick === ROUNDS[s.r].a) s.score += 10; render(); root.querySelector("[data-act]").focus(); };
      });
      root.querySelectorAll("[data-beach]").forEach(function (b) {
        b.onclick = function () { s.bpick = +b.dataset.beach; if (s.bpick === BEACH.a) s.score += 10; render(); root.querySelector("[data-act]").focus(); };
      });
    }
    render();
  };
})();
