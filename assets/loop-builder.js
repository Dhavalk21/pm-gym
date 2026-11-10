// Loop Builder: a PM Gym game for M12. Mount with LoopBuilder(element)
(function () {
  var TYPES = { viral: "Viral loop: users bring users", content: "Content loop: users create what search finds", paid: "Paid loop: profit funds more ads" };
  // Each product: the loop that fits, its steps with numbers, and three levers. k() computes loop strength from the numbers.
  var P = [
    { name: "Slotly", what: "Free booking links for freelancers. Clients pick a time without back-and-forth emails.", type: "viral",
      typeWhy: "Every booking link is seen by people who don't use Slotly yet. The product spreads by being used.",
      steps: ["A user shares their booking link", "{a} people a month book through it", "{b}% of them sign up for their own link", "Each new user shares their link"],
      n: { a: 8, b: 5 }, k: function (n) { return n.a * n.b / 100; }, unit: "users",
      levers: [
        { t: "Add \"Get your own free link\" to the booking confirmation page", ch: { b: 9 }, w: "The people who just booked have seen the product work. A clear offer at that moment lifts sign-ups from 5% to 9%." },
        { t: "Remind users to share their link more often", ch: { a: 9 }, w: "People share links when they need meetings, not because you remind them. It barely moves." },
        { t: "Double the advertising budget", ch: {}, w: "Ads add users from outside the loop, but don't make the loop itself any stronger." }
      ], best: 0 },
    { name: "Fixly", what: "A free community where people ask and answer home-repair questions.", type: "content",
      typeWhy: "Every answer becomes a public page. Search engines send people with the same problem, and some of them join and answer too.",
      steps: ["A member answers questions", "Each member writes {a} answers", "Each answer page brings {c} visitors from search", "{b}% of visitors join and write answers"],
      n: { a: 2, c: 30, b: 1 }, k: function (n) { return n.a * n.c * n.b / 100; }, unit: "members",
      levers: [
        { t: "Make answer pages faster, with clearer titles and photos", ch: { c: 45 }, w: "Better pages rank higher, so each answer brings 45 visitors instead of 30. Loop strength rises from 0.6 to 0.9." },
        { t: "Pay members €1 for every answer", ch: { a: 2.5 }, w: "A bit more content, but paid answers tend to be thinner, and the cost grows with every answer." },
        { t: "Show visitors a sign-up pop-up straight away", ch: { b: 1.2 }, w: "A few more sign-ups, but pop-ups annoy people who just wanted the answer, and can hurt search rankings." }
      ], best: 0 },
    { name: "Brewbox", what: "A monthly coffee subscription, sold through online ads.", type: "paid",
      typeWhy: "Coffee isn't shared or searched like a tool or an answer page. Growth comes from ads, so the loop only works if each customer earns back more than they cost to win.",
      steps: ["Spend on ads", "Winning one customer costs €{cac}", "They stay {m} months, earning €{p} profit a month", "Profit is spent on more ads"],
      n: { cac: 60, m: 4, p: 12 }, k: function (n) { return n.m * n.p / n.cac; }, unit: "euros back per euro",
      levers: [
        { t: "Improve retention: let people pause instead of cancelling", ch: { m: 6 }, w: "Customers stay 6 months instead of 4. Each euro of ads now earns back €1.20, so the loop pays for itself." },
        { t: "Cut the price by 15% to win more customers", ch: { cac: 54, p: 9.3 }, w: "Customers get a bit cheaper to win, but each one earns much less. Every euro now returns only about €0.69." },
        { t: "Spend twice as much on ads", ch: {}, w: "Each euro still returns only €0.80. Spending more just loses money faster." }
      ], best: 0 }
  ];
  var MAX = P.length * 20;
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function fill(t, n) { return t.replace(/\{(\w+)\}/g, function (_, k) { return n[k]; }); }
  function merge(a, b) { var r = {}; for (var k in a) r[k] = a[k]; for (var j in b) r[j] = b[j]; return r; }
  function shuffle(a, seed) { var r = a.slice(), x = seed; for (var i = r.length - 1; i > 0; i--) { x = (x * 9301 + 49297) % 233280; var j = Math.floor(x / 233280 * (i + 1)); var t = r[i]; r[i] = r[j]; r[j] = t; } return r; }
  function sim(k) { var out = [], prev = 0, tot = 0; for (var t = 0; t < 6; t++) { var nw = 1000 + k * prev; tot += nw; out.push(tot); prev = nw; } return out; }

  window.LoopBuilder = function (root) {
    var s;
    function reset() { s = { i: -1, type: null, lever: null, score: 0 }; }
    reset();
    function loop(p, n) {
      return '<div class="lb-loop">' + p.steps.map(function (st, j) { return '<div class="lb-step"><i>' + (j + 1) + '</i>' + esc(fill(st, n)) + '</div>'; }).join("") +
        '<div class="lb-k"><small>Loop strength</small><b>' + p.k(n).toFixed(2) + '</b><span>' + (p.type === "paid" ? "euros back for every euro spent" : "new " + p.unit + " for every new one") + '</span></div></div>';
    }
    function chart(p, k0, k1) {
      var a = sim(k0), b = sim(k1), max = Math.max(a[5], b[5]);
      return '<div class="lb-chart"><b>' + (p.type === "paid" ? "Customers won over six rounds: the same ad budget each round, plus whatever earlier customers earned back" : "Total " + p.unit + " after six cycles, with 1,000 a cycle from other channels") + '</b><div class="lb-bars">' +
        a.map(function (v, t) { return '<div class="lb-col"><span class="lb-b0" style="height:' + (v / max * 100) + '%"></span><span class="lb-b1" style="height:' + (b[t] / max * 100) + '%"></span><small>' + (t + 1) + '</small></div>'; }).join("") +
        '</div><p><i class="lb-key0"></i>Before: ' + Math.round(a[5]).toLocaleString("en-GB") + ' <i class="lb-key1"></i>With your change: ' + Math.round(b[5]).toLocaleString("en-GB") + '</p></div>';
    }
    function render() {
      var h = '<div class="rr">';
      if (s.i === -1) {
        h += '<div class="rr-intro"><div><b class="rr-big">Three products, about 10 minutes</b><p>Funnels end; loops feed themselves. For each product, pick the growth loop that fits. Then read the loop\'s numbers and choose the change that makes it strongest. You\'ll see how far a small change compounds.</p><button type="button" class="btn light solid" data-act="start">Start</button></div></div>';
      } else if (s.i < P.length) {
        var p = P[s.i];
        h += '<div class="rr-top"><span>Product ' + (s.i + 1) + ' of ' + P.length + ': ' + esc(p.name) + '</span><span>Score ' + s.score + ' / ' + MAX + '</span></div><p class="mt-what"><b>' + esc(p.name) + '.</b> ' + esc(p.what) + '</p>';
        if (s.type === null) {
          h += '<p class="rr-ask">Step 1. Which growth loop fits best?</p><div class="rr-opts">' + ["viral", "content", "paid"].map(function (k) { return '<button type="button" class="rr-opt" data-t="' + k + '">' + TYPES[k] + '</button>'; }).join("") + '</div>';
        } else {
          h += '<p class="rr-why" style="margin-top:0"><b>' + (s.type === p.type ? "Right loop. +10" : "Better fit: " + TYPES[p.type].toLowerCase() + ".") + '</b> ' + esc(p.typeWhy) + '</p><div class="rr-play" style="margin-top:16px">' + loop(p, p.n) + '<div class="rr-main">';
          var order = shuffle([0, 1, 2], s.i + 2);
          if (s.lever === null) {
            h += '<p class="rr-ask" style="margin-top:0">Step 2. Which change makes the loop strongest?</p><div class="rr-opts">' + order.map(function (j) { return '<button type="button" class="rr-opt" data-l="' + j + '">' + esc(p.levers[j].t) + '</button>'; }).join("") + '</div>';
          } else {
            var L = p.levers[s.lever], kb = p.k(merge(p.n, p.levers[p.best].ch)), k0 = p.k(p.n), k1 = p.k(merge(p.n, L.ch));
            h += '<div class="rr-opts">' + order.map(function (j) { var cls = "rr-opt " + (j === p.best ? "ok" : j === s.lever ? "no" : "dim"); return '<button type="button" class="' + cls + '" disabled>' + esc(p.levers[j].t) + ' <em class="lb-new">→ ' + p.k(merge(p.n, p.levers[j].ch)).toFixed(2) + '</em></button>'; }).join("") + '</div>' +
              '<p class="rr-why"><b>' + (s.lever === p.best ? "Strongest change. +10" : "The strongest change gets to " + kb.toFixed(2) + ".") + '</b> ' + esc(L.w) + '</p>' + chart(p, k0, k1) +
              '<button type="button" class="btn light solid" data-act="next">' + (s.i === P.length - 1 ? "See my score" : "Next product") + '</button>';
          }
          h += '</div></div>';
        }
      } else {
        h += '<div class="rr-main" style="max-width:820px"><b class="rr-big">' + s.score + ' / ' + MAX + '</b><p>Loops rarely run on their own: a strength above 1 is rare and short-lived. But every step you strengthen multiplies everything you bring in from other channels. And none of it works if people don\'t stay: retention is the base of every loop.</p><button type="button" class="btn light solid" data-act="again">Play again</button></div>';
      }
      root.innerHTML = h + '</div>';
      root.querySelectorAll("[data-act]").forEach(function (b) {
        b.onclick = function () { var a = b.dataset.act; if (a === "again") reset(); if (a === "next") { s.i++; s.type = null; s.lever = null; } else s.i = 0; render(); var f = root.querySelector(".rr-opt:not([disabled]), [data-act]"); if (f) f.focus(); };
      });
      root.querySelectorAll("[data-t]").forEach(function (b) {
        b.onclick = function () { s.type = b.dataset.t; if (s.type === P[s.i].type) s.score += 10; render(); var f = root.querySelector("[data-l]"); if (f) f.focus(); };
      });
      root.querySelectorAll("[data-l]").forEach(function (b) {
        b.onclick = function () { s.lever = +b.dataset.l; if (s.lever === P[s.i].best) s.score += 10; render(); root.querySelector("[data-act]").focus(); };
      });
    }
    render();
  };
})();
