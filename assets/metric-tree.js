// Metric Tree Builder: a PM Gym game for M9. Mount with MetricTree(element)
(function () {
  var KIND = { input: "Input metric", guard: "Guardrail", vanity: "Vanity metric" };
  var KIND_HELP = { input: "Moves the North Star, and a team can act on it", guard: "Must not get worse while we push", vanity: "Looks good, decides nothing" };
  var PRODUCTS = [
    { name: "Lingo", what: "A language-learning app with a monthly subscription.",
      ns: [
        { t: "Learners who complete 3 or more lessons a week", ok: true, w: "It counts value delivered: people actually learning, often enough to make progress. Revenue follows from it." },
        { t: "App downloads", w: "Downloads say nothing about whether anyone learns. Most downloaded apps are barely opened." },
        { t: "Monthly revenue", w: "Revenue matters, but it lags: it tells you what happened, not what to do. A North Star should capture the value that leads to revenue." },
        { t: "Minutes spent in the app", w: "Easy to inflate by making lessons slower. More minutes isn't more learning." }
      ],
      m: [
        { t: "Share of new users who finish their first lesson on day one", k: "input", w: "Activation: people who start well are far more likely to keep learning." },
        { t: "Lessons completed per active learner per week", k: "input", w: "Depth: it feeds the North Star directly, and teams can improve it." },
        { t: "Users who turn off notifications", k: "guard", w: "If you push streak reminders harder, watch this. Nagging can raise lessons this month and lose people for good." },
        { t: "Total registered accounts, all time", k: "vanity", w: "It only ever goes up. It can't tell you whether this week was better than last." }
      ] },
    { name: "Stayly", what: "A marketplace where guests book holiday homes from hosts.",
      ns: [
        { t: "Nights booked", ok: true, w: "It captures value for both sides: a guest got a stay and a host got paid. Airbnb reports nights booked as a headline number for the same reason." },
        { t: "Number of listings", w: "Supply matters, but listings nobody books add nothing. This is an input at best." },
        { t: "Website visits", w: "Visits can rise while bookings fall. It's top-of-funnel noise." },
        { t: "Searches per visitor", w: "More searches can mean people can't find what they want. Ambiguous, and easy to inflate." }
      ],
      m: [
        { t: "Share of searches that end in a booking", k: "input", w: "Conversion: better search and trust signals move it, and it feeds nights booked directly." },
        { t: "New listings in cities where demand beats supply", k: "input", w: "Targeted supply growth. Adding listings where guests already struggle to find a place is what moves bookings." },
        { t: "Guest refunds and complaints per 1,000 stays", k: "guard", w: "If you push bookings with looser host rules, quality can drop. This catches it." },
        { t: "Instagram followers", k: "vanity", w: "Nice for the brand team, but it doesn't tell a product team what to change." }
      ] },
    { name: "Ledgerly", what: "Invoicing software for freelancers, paid monthly.",
      ns: [
        { t: "Invoices paid through Ledgerly each week", ok: true, w: "Freelancers come to get paid, not to create invoices. Paid invoices capture that value, and they're what keeps people subscribed." },
        { t: "Invoices created each week", w: "Close, but a created invoice that never gets paid didn't help anyone. The value is in getting paid." },
        { t: "Sign-ups", w: "Sign-ups measure marketing, not value. Many never send a single invoice." },
        { t: "Features used per account", w: "More features used can mean the product is confusing. It isn't the value people pay for." }
      ],
      m: [
        { t: "Share of new accounts that send a first invoice within 7 days", k: "input", w: "Activation: the earliest sign someone will get value." },
        { t: "Share of invoices sent with an online payment link", k: "input", w: "Payment links get invoices paid faster, so this feeds the North Star and a team can work on it." },
        { t: "Support tickets per 100 active accounts", k: "guard", w: "If a push to add payment links confuses people, tickets rise. A guardrail keeps the trade-off visible." },
        { t: "Features shipped this quarter", k: "vanity", w: "That's output, not outcome (M1). Shipping more doesn't mean customers got more value." }
      ] }
  ];
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function shuffle(a, seed) { var r = a.slice(), x = seed; for (var i = r.length - 1; i > 0; i--) { x = (x * 9301 + 49297) % 233280; var j = Math.floor(x / 233280 * (i + 1)); var t = r[i]; r[i] = r[j]; r[j] = t; } return r; }
  var MAX = PRODUCTS.length * (20 + 4 * 10);

  window.MetricTree = function (root) {
    var s;
    function reset() { s = { p: -1, nsPick: null, picks: {}, score: 0 }; }
    reset();
    function tree(P, showAll) {
      var ns = P.ns.filter(function (x) { return x.ok; })[0];
      var placed = function (k) { return P.m.filter(function (m, i) { return (showAll || s.picks[i] !== undefined) && m.k === k; }); };
      var box = function (arr, empty) { return arr.length ? arr.map(function (m) { return '<span>' + esc(m.t) + '</span>'; }).join("") : '<em>' + empty + '</em>'; };
      return '<div class="mt-tree" aria-label="Metric tree for ' + esc(P.name) + '">' +
        '<div class="mt-ns' + (s.nsPick === null && !showAll ? " empty" : "") + '"><small>North Star</small><b>' + (s.nsPick === null && !showAll ? "Pick it first" : esc(ns.t)) + '</b></div>' +
        '<div class="mt-lines" aria-hidden="true"></div>' +
        '<div class="mt-row"><div class="mt-in"><small>Input metrics</small>' + box(placed("input"), "None yet") + '</div>' +
        '<div class="mt-gd"><small>Guardrails</small>' + box(placed("guard"), "None yet") + '</div></div>' +
        '<div class="mt-bin"><small>Left off the tree</small>' + box(placed("vanity"), "Nothing yet") + '</div></div>';
    }
    function render() {
      var h = '<div class="rr">';
      if (s.p === -1) {
        h += '<div class="rr-intro"><div><b class="rr-big">Three products, about 10 minutes</b><p>For each product, pick the North Star: the one number that best captures the value customers get. Then sort four metrics: inputs that drive it, guardrails that must not get worse, and vanity metrics that look good but decide nothing.</p><button type="button" class="btn light solid" data-act="start">Start</button></div></div>';
      } else if (s.p < PRODUCTS.length) {
        var P = PRODUCTS[s.p], done = Object.keys(s.picks).length === P.m.length;
        h += '<div class="rr-top"><span>Product ' + (s.p + 1) + ' of ' + PRODUCTS.length + ': ' + esc(P.name) + '</span><span>Score ' + s.score + ' / ' + MAX + '</span></div>' +
          '<div class="rr-play"><div class="mt-side"><p class="mt-what"><b>' + esc(P.name) + '.</b> ' + esc(P.what) + '</p>' + tree(P, false) + '</div><div class="rr-main">';
        if (s.nsPick === null) {
          h += '<p class="rr-ask" style="margin-top:0">Step 1. Which is the best North Star?</p><div class="rr-opts">' +
            shuffle(P.ns.map(function (x, i) { return i; }), s.p + 5).map(function (i) { return '<button type="button" class="rr-opt" data-ns="' + i + '">' + esc(P.ns[i].t) + '</button>'; }).join("") + '</div>';
        } else {
          var picked = P.ns[s.nsPick];
          h += '<p class="rr-why" style="margin-top:0"><b>' + (picked.ok ? "Good pick. +20" : "Not quite. The North Star is “" + esc(P.ns.filter(function (x) { return x.ok; })[0].t) + "”.") + '</b> ' + esc(picked.ok ? picked.w : picked.w + " " + P.ns.filter(function (x) { return x.ok; })[0].w) + '</p>' +
            '<p class="rr-ask">Step 2. Where does each metric belong?</p><div class="mt-cards">' +
            P.m.map(function (m, i) {
              var pk = s.picks[i];
              var out = '<div class="mt-card' + (pk !== undefined ? (pk === m.k ? " ok" : " no") : "") + '"><p>' + esc(m.t) + '</p>';
              if (pk === undefined) out += '<div class="mt-kinds">' + ["input", "guard", "vanity"].map(function (k) { return '<button type="button" class="rr-opt" data-m="' + i + '" data-k="' + k + '" title="' + esc(KIND_HELP[k]) + '">' + KIND[k] + '</button>'; }).join("") + '</div>';
              else out += '<p class="mt-res"><b>' + (pk === m.k ? KIND[m.k] + ". +10" : "It's " + (m.k === "input" ? "an " : "a ") + KIND[m.k].toLowerCase() + ".") + '</b> ' + esc(m.w) + '</p>';
              return out + '</div>';
            }).join("") + '</div>';
          if (done) h += '<button type="button" class="btn light solid" data-act="next" style="margin-top:16px">' + (s.p === PRODUCTS.length - 1 ? "See my score" : "Next product") + '</button>';
        }
        h += '</div></div>';
      } else {
        h += '<div class="rr-main" style="max-width:820px"><b class="rr-big">' + s.score + ' / ' + MAX + '</b><p>A good tree has one North Star that captures customer value, a few inputs teams can actually move, and a guardrail for every push that could backfire. Everything else is a vanity metric, however nice it looks on a slide.</p><button type="button" class="btn light solid" data-act="again">Play again</button></div>';
      }
      root.innerHTML = h + '</div>';
      root.querySelectorAll("[data-act]").forEach(function (b) {
        b.onclick = function () { var a = b.dataset.act; if (a === "again") reset(); if (a === "next") { s.p++; s.nsPick = null; s.picks = {}; } else s.p = 0; render(); var f = root.querySelector(".rr-opt, [data-act]"); if (f) f.focus(); };
      });
      root.querySelectorAll("[data-ns]").forEach(function (b) {
        b.onclick = function () { s.nsPick = +b.dataset.ns; if (PRODUCTS[s.p].ns[s.nsPick].ok) s.score += 20; render(); var f = root.querySelector("[data-m]"); if (f) f.focus(); };
      });
      root.querySelectorAll("[data-m]").forEach(function (b) {
        b.onclick = function () { var i = +b.dataset.m; s.picks[i] = b.dataset.k; if (b.dataset.k === PRODUCTS[s.p].m[i].k) s.score += 10; render(); var f = root.querySelector("[data-m], [data-act]"); if (f) f.focus(); };
      });
    }
    render();
  };
})();
