// Backlog Triage: a PM Gym game for M15. Mount with BacklogTriage(element)
(function () {
  var CAP = 12;
  var STRAT = "Ledgerly's strategy: serve EU freelancers and win on getting them paid faster. No enterprise features.";
  // in: whether the best plan includes it. tag: the pressure behind it.
  var ITEMS = [
    { t: "E-invoicing format required by German law for many B2B invoices from 2027", wk: 4, tag: "Legal deadline", reach: "Most German customers", in: true, w: "A hard deadline with a huge cost of delay: miss it and customers legally can't use Ledgerly for those invoices." },
    { t: "Automatic, friendly payment reminders", wk: 3, tag: "Top customer problem", reach: "All 12,000 customers", in: true, w: "Straight at the strategy: getting paid faster. High reach, and a prototype test showed clients paid 9 days sooner." },
    { t: "Fix: some invoices are occasionally sent twice", wk: 1, tag: "Bug, 40 tickets a month", reach: "About 2% of invoices", in: true, w: "Small effort, big trust problem. Duplicate invoices embarrass freelancers in front of their clients." },
    { t: "Import clients from a spreadsheet during onboarding", wk: 2, tag: "Activation", reach: "Every new sign-up", in: true, w: "New users who add clients in week one are far more likely to stay (M12). Cheap and on-strategy." },
    { t: "Payment links through a second digital bank", wk: 2, tag: "Partner request", reach: "About a third of customers", in: true, w: "Gets more invoices paid online, which feeds the North Star directly." },
    { t: "Approval workflows for large finance teams", wk: 5, tag: "€40,000 deal, CEO asking", reach: "One prospect", in: false, w: "Real money, but it's an enterprise feature the strategy rules out, and it would push back work for all 12,000 customers." },
    { t: "Dark mode", wk: 2, tag: "Most-voted request (300 votes)", reach: "Nice to have for many", in: false, w: "Popular, but it doesn't help anyone get paid. Votes measure enthusiasm, not value. Worth revisiting when there's slack." },
    { t: "Expense tracking", wk: 6, tag: "A competitor has it", reach: "Unclear", in: false, w: "Copying a competitor isn't a reason on its own. It's off-strategy and the most expensive item on the list." }
  ];
  var NO = [
    { who: "The CEO, about the €40,000 approval-workflow deal", o: [
      "\"Sorry, no. It's not on the roadmap.\"",
      "\"That deal matters. But approval workflows are 5 weeks of enterprise work our strategy rules out, and they'd delay reminders for all 12,000 customers. Could they use our export to their own approval tool? If three more prospects ask, we'll revisit.\"",
      "\"Sure, we'll squeeze it in somehow.\""], a: 1, w: "It respects the request, shows the trade-off with numbers, offers a workaround and sets a clear condition for revisiting." },
    { who: "The 300 customers who voted for dark mode", o: [
      "Ignore the votes; they'll forget.",
      "\"We've put dark mode on hold.\" No reason given.",
      "\"Thanks for 300 votes! This quarter we're focused on getting you paid faster: reminders and more payment options. Dark mode is next in line once those ship.\""], a: 2, w: "Thank people, explain the focus in terms they care about, and say what happens next. Honest \"not now\" builds trust." }
  ];
  var MAX = ITEMS.length * 10 + NO.length * 10;
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  window.BacklogTriage = function (root) {
    var s;
    function reset() { s = { stage: 0, sel: {}, n: 0, pick: null, score: 0 }; }
    reset();
    function used() { var u = 0; ITEMS.forEach(function (it, i) { if (s.sel[i]) u += it.wk; }); return u; }
    function render() {
      var h = '<div class="rr">', u = used();
      if (s.stage === 0) {
        h += '<div class="rr-intro"><div><b class="rr-big">Two rounds, about 8 minutes</b><p><b>Round 1:</b> your team has 12 weeks this quarter and eight things competing for them. Pick what goes in. <b>Round 2:</b> say no to two of the things you left out, well.</p><button type="button" class="btn light solid" data-act="start">Start</button></div></div>';
      } else if (s.stage === 1 || s.stage === 2) {
        var rev = s.stage === 2;
        h += '<div class="rr-top"><span>Round 1: plan the quarter</span><span>Score ' + s.score + ' / ' + MAX + '</span></div><p class="bt-strat">' + esc(STRAT) + '</p>' +
          '<div class="bt-cap"><span>Team time used</span><div class="bt-meter"><i style="width:' + Math.min(100, u / CAP * 100) + '%" class="' + (u > CAP ? "over" : "") + '"></i></div><b>' + u + ' of ' + CAP + ' weeks</b></div><div class="bt-list">' +
          ITEMS.map(function (it, i) {
            var on = !!s.sel[i], cls = "bt-item" + (on ? " on" : "");
            if (rev) cls += (on === it.in) ? " right" : " wrong";
            return '<button type="button" class="' + cls + '" data-i="' + i + '"' + (rev ? " disabled" : "") + ' aria-pressed="' + on + '"><span class="bt-check" aria-hidden="true">' + (on ? "✓" : "") + '</span><span class="bt-body"><b>' + esc(it.t) + '</b><span class="bt-meta"><em>' + esc(it.tag) + '</em> · ' + esc(it.reach) + '</span>' +
              (rev ? '<span class="bt-why"><strong>' + (it.in ? "In the best plan." : "Leave it out.") + '</strong> ' + esc(it.w) + '</span>' : '') + '</span><span class="bt-wk">' + it.wk + ' wk</span></button>';
          }).join("") + '</div>';
        if (!rev) h += '<button type="button" class="btn light solid" data-act="commit"' + (u > CAP ? " disabled" : "") + '>' + (u > CAP ? "Over capacity: drop something" : "Commit this plan") + '</button>';
        else h += '<p class="rr-why"><b>' + ITEMS.filter(function (it, i) { return !!s.sel[i] === it.in; }).length + ' of ' + ITEMS.length + ' calls matched the best plan.</b> The best plan fills all 12 weeks with work that serves the strategy, including the dull but urgent items. The loud requests are exactly the ones it leaves out.</p><button type="button" class="btn light solid" data-act="r2">On to round 2</button>';
      } else if (s.stage === 3) {
        var c = NO[s.n], done = s.pick !== null;
        h += '<div class="rr-top"><span>Round 2: say no well, ' + (s.n + 1) + ' of ' + NO.length + '</span><span>Score ' + s.score + ' / ' + MAX + '</span></div><p class="rr-ask" style="margin-top:0">Your reply to: ' + esc(c.who) + '</p><div class="rr-opts">' +
          c.o.map(function (t, j) { var cls = "rr-opt"; if (done) cls += j === c.a ? " ok" : j === s.pick ? " no" : " dim"; return '<button type="button" class="' + cls + '" data-o="' + j + '"' + (done ? " disabled" : "") + '>' + esc(t) + '</button>'; }).join("") + '</div>';
        if (done) h += '<p class="rr-why"><b>' + (s.pick === c.a ? "Well said. +10" : "A better reply is highlighted.") + '</b> ' + esc(c.w) + '</p><button type="button" class="btn light solid" data-act="next">' + (s.n === NO.length - 1 ? "See my score" : "Next one") + '</button>';
      } else {
        h += '<div class="rr-main" style="max-width:820px"><b class="rr-big">' + s.score + ' / ' + MAX + '</b><p>Use the strategy as the first filter, then weigh value, cost of delay and effort. The loudest request, the biggest deal and the competitor\'s feature are often the ones to leave out. And a clear, kind \"not now\" keeps trust when you do.</p><button type="button" class="btn light solid" data-act="again">Play again</button></div>';
      }
      root.innerHTML = h + '</div>';
      root.querySelectorAll("[data-act]").forEach(function (b) {
        b.onclick = function () {
          var a = b.dataset.act;
          if (a === "start") s.stage = 1;
          else if (a === "commit") { ITEMS.forEach(function (it, i) { if (!!s.sel[i] === it.in) s.score += 10; }); s.stage = 2; }
          else if (a === "r2") { s.stage = 3; s.n = 0; s.pick = null; }
          else if (a === "next") { if (s.n === NO.length - 1) s.stage = 4; else { s.n++; s.pick = null; } }
          else if (a === "again") { reset(); s.stage = 1; }
          render(); var f = root.querySelector(".bt-item:not([disabled]), .rr-opt:not([disabled]), [data-act]"); if (f) f.focus();
        };
      });
      root.querySelectorAll("[data-i]").forEach(function (b) {
        b.onclick = function () { var i = +b.dataset.i; s.sel[i] = !s.sel[i]; render(); var f = root.querySelector('[data-i="' + i + '"]'); if (f) f.focus(); };
      });
      root.querySelectorAll("[data-o]").forEach(function (b) {
        b.onclick = function () { s.pick = +b.dataset.o; if (s.pick === NO[s.n].a) s.score += 10; render(); root.querySelector("[data-act]").focus(); };
      });
    }
    render();
  };
})();
