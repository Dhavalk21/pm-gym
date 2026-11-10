// Stakeholder Chess: a PM Gym game for M18. Mount with StakeholderChess(element)
(function () {
  var Q = { close: "Manage closely", satisfy: "Keep satisfied", inform: "Keep informed", monitor: "Monitor" };
  var NEWS = "Instant card payouts will launch about six weeks late, in mid-July instead of early June, because the bank partner's system failed our security review.";
  var PEOPLE = [
    { who: "Head of Sales", d: "Has promised instant payouts to three big prospects. Can escalate to the CEO.", p: "high", i: "high", a: "close", w: "High power and high interest: involve them early, tell them before anyone else does, and work out the prospect messages together." },
    { who: "Chief Financial Officer", d: "Approves budgets. Cares about the revenue forecast, not the feature details.", p: "high", i: "low", a: "satisfy", w: "High power, lower interest: keep them satisfied with short, clear updates on impact. Don't flood them with detail." },
    { who: "Support team lead", d: "Their team will answer customer questions about the delay. Little say over the roadmap.", p: "low", i: "high", a: "inform", w: "Low power, high interest: keep them well informed, early, with what to tell customers. They'll feel it first." },
    { who: "Office manager", d: "Not affected by the launch.", p: "low", i: "low", a: "monitor", w: "Low power, low interest: no special effort needed. They'll hear in the regular company update." }
  ];
  var MSGS = [
    { to: "The CEO, who asked for a quick update", o: [
      "\"So, back in March we started integrating with the bank, and in May their security documentation arrived, and our team found several issues in how tokens were stored, which led to...\"",
      "\"Instant payouts move from early June to mid-July: the bank's system failed our security review. Revenue impact about €20,000 this quarter. No decision needed from you. Next update Friday.\"",
      "\"There might be some small delays on instant payouts. We're looking into it.\""], a: 1, w: "Answer first: what changed, the impact, whether a decision is needed, and when they'll hear next. The history can come later, if they ask." },
    { to: "The support team", o: [
      "\"Instant payouts are delayed. More info later.\"",
      "A link to the 12-page security review.",
      "\"Instant payouts now launch in mid-July. If customers ask: 'We're making sure it meets our security standards. We'll email you the day it's ready.' Reply template attached. Questions to me.\""], a: 2, w: "Support needs what customers will ask and exactly what to say, with a template. Technical depth doesn't help them." },
    { to: "The engineering team", o: [
      "\"The bank failed our security review on how card tokens are stored. They need about four weeks to fix it, then we retest. Until then we'll finish the reminders work. Questions in tomorrow's stand-up.\"",
      "\"Delay. Please be flexible.\"",
      "\"Revenue impact €20,000, CEO informed.\""], a: 0, w: "Engineers need the real reason, what changes in their work now, and where to ask questions." }
  ];
  var INF = { sit: "The design lead disagrees with your plan to put payment reminders on by default. You don't manage them, and you need their team's work to ship it.", o: [
      "Escalate to their manager so the plan goes ahead",
      "Ask what they see that you don't, agree on the shared goal, and propose a small test of both versions",
      "Ship your version without their team"], a: 1,
    w: "Influence without authority starts with listening. Maybe they know reminders feel pushy to some users. A shared goal and a cheap test turn a standoff into learning, and you keep the relationship." };
  var MAX = (PEOPLE.length + MSGS.length + 1) * 10;
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  window.StakeholderChess = function (root) {
    var s;
    function reset() { s = { i: -1, pick: null, score: 0, placed: [] }; }
    reset();
    function grid() {
      var cell = function (k, label) {
        var names = s.placed.map(function (p, x) { return { p: p, x: x }; }).filter(function (o) { return PEOPLE[o.x].a === k; });
        return '<div class="sc-cell sc-' + k + '"><small>' + label + '</small>' + names.map(function (o) { return '<span class="' + (o.p === k ? "ok" : "no") + '">' + esc(PEOPLE[o.x].who) + '</span>'; }).join("") + '</div>';
      };
      return '<div class="sc-grid"><div class="sc-axis-y">Power ↑</div>' + cell("satisfy", Q.satisfy) + cell("close", Q.close) + cell("monitor", Q.monitor) + cell("inform", Q.inform) + '<div class="sc-axis-x">Interest →</div></div>';
    }
    function opts(list, a, dataKey) {
      return '<div class="rr-opts">' + list.map(function (t, j) { var cls = "rr-opt"; if (s.pick !== null) cls += j === a ? " ok" : j === s.pick ? " no" : " dim"; return '<button type="button" class="' + cls + '" data-' + dataKey + '="' + j + '"' + (s.pick !== null ? " disabled" : "") + '>' + esc(t) + '</button>'; }).join("") + '</div>';
    }
    function render() {
      var h = '<div class="rr">', P = PEOPLE.length, M = MSGS.length;
      if (s.i === -1) {
        h += '<div class="rr-intro"><div><b class="rr-big">Three rounds, about 8 minutes</b><p>The news: ' + esc(NEWS) + ' <b>Round 1:</b> map who needs what. <b>Round 2:</b> tell three audiences. <b>Round 3:</b> win over someone you don\'t manage.</p><button type="button" class="btn light solid" data-act="start">Start</button></div></div>';
      } else if (s.i < P) {
        var pp = PEOPLE[s.i], done = s.pick !== null;
        h += '<div class="rr-top"><span>Round 1: map the stakeholders, ' + (s.i + 1) + ' of ' + P + '</span><span>Score ' + s.score + ' / ' + MAX + '</span></div><div class="rr-play">' + grid() +
          '<div class="rr-main"><div class="rm-card"><b>' + esc(pp.who) + '</b><p>' + esc(pp.d) + '</p></div><p class="rr-ask">How do you manage them?</p><div class="rr-opts">' +
          ["close", "satisfy", "inform", "monitor"].map(function (k) { var cls = "rr-opt"; if (done) cls += k === pp.a ? " ok" : k === s.pick ? " no" : " dim"; return '<button type="button" class="' + cls + '" data-q="' + k + '"' + (done ? " disabled" : "") + '>' + Q[k] + '</button>'; }).join("") + '</div>';
        if (done) h += '<p class="rr-why"><b>' + (s.pick === pp.a ? "Right. +10" : "Better: " + Q[pp.a].toLowerCase() + ".") + '</b> ' + esc(pp.w) + '</p><button type="button" class="btn light solid" data-act="next">' + (s.i === P - 1 ? "On to round 2" : "Next person") + '</button>';
        h += '</div></div>';
      } else if (s.i < P + M) {
        var m = MSGS[s.i - P], fin = s.pick !== null;
        h += '<div class="rr-top"><span>Round 2: same news, three audiences, ' + (s.i - P + 1) + ' of ' + M + '</span><span>Score ' + s.score + ' / ' + MAX + '</span></div><p class="bt-strat">' + esc(NEWS) + '</p><p class="rr-ask">Best message to: ' + esc(m.to) + '</p>' + opts(m.o, m.a, "o");
        if (fin) h += '<p class="rr-why"><b>' + (s.pick === m.a ? "Well tailored. +10" : "A better message is highlighted.") + '</b> ' + esc(m.w) + '</p><button type="button" class="btn light solid" data-act="next">' + (s.i === P + M - 1 ? "On to round 3" : "Next audience") + '</button>';
      } else if (s.i === P + M) {
        h += '<div class="rr-top"><span>Round 3: influence without authority</span><span>Score ' + s.score + ' / ' + MAX + '</span></div><p class="bt-strat">' + esc(INF.sit) + '</p><p class="rr-ask">What do you do?</p>' + opts(INF.o, INF.a, "o");
        if (s.pick !== null) h += '<p class="rr-why"><b>' + (s.pick === INF.a ? "That's influence. +10" : "A better move is highlighted.") + '</b> ' + esc(INF.w) + '</p><button type="button" class="btn light solid" data-act="next">See my score</button>';
      } else {
        h += '<div class="rr-main" style="max-width:820px"><b class="rr-big">' + s.score + ' / ' + MAX + '</b><p>Know who needs what, lead with the answer, tailor the same news to each audience, and win people over by listening and finding a shared goal, not by pulling rank you don\'t have.</p><button type="button" class="btn light solid" data-act="again">Play again</button></div>';
      }
      root.innerHTML = h + '</div>';
      root.querySelectorAll("[data-act]").forEach(function (b) {
        b.onclick = function () { var a = b.dataset.act; if (a === "again") { reset(); s.i = 0; } else if (a === "start") s.i = 0; else { if (s.i < PEOPLE.length) s.placed.push(s.pick); s.i++; s.pick = null; } render(); var f = root.querySelector(".rr-opt:not([disabled]), [data-act]"); if (f) f.focus(); };
      });
      root.querySelectorAll("[data-q]").forEach(function (b) {
        b.onclick = function () { s.pick = b.dataset.q; if (s.pick === PEOPLE[s.i].a) s.score += 10; render(); root.querySelector("[data-act]").focus(); };
      });
      root.querySelectorAll("[data-o]").forEach(function (b) {
        b.onclick = function () { s.pick = +b.dataset.o; var ok = s.i < PEOPLE.length + MSGS.length ? MSGS[s.i - PEOPLE.length].a : INF.a; if (s.pick === ok) s.score += 10; render(); root.querySelector("[data-act]").focus(); };
      });
    }
    render();
  };
})();
