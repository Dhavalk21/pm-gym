// Price It: a PM Gym game for M13. Mount with PriceIt(element)
(function () {
  // Round 1: choose the value metric, the thing the price should grow with.
  var VM = [
    { name: "Ledgerly", what: "Invoicing software for freelancers. Almost every account has one user. Freelancers with more clients send more invoices and get more value.",
      o: ["Per user seat", "Tiers by invoices sent per month", "A one-off licence fee"], a: 1,
      w: "Seats don't fit: nearly everyone is a single user. Invoice volume grows with the value a freelancer gets, so tiers by invoices let price grow with the customer." },
    { name: "Huddle", what: "A team chat app. The more people in a company use it, the more valuable it becomes.",
      o: ["Per message sent", "One flat fee per company", "Per active user each month"], a: 2,
      w: "Value grows with each person using it. Charging only for active users feels fair, which is why Slack credits companies for members who stop using it. Per-message pricing would make people hesitate to use the product." },
    { name: "Scribe", what: "An AI transcription service for developers. Each minute of audio costs Scribe real money in computing.",
      o: ["Per minute of audio transcribed", "Unlimited use for a flat monthly fee", "Per developer seat"], a: 0,
      w: "Costs grow with every minute, and so does value. Usage-based pricing keeps margins safe; a flat unlimited plan would lose money on the heaviest users." }
  ];
  // Round 2: unit economics. arpu = revenue per customer per month, gm = gross margin, churn = share cancelling per month.
  var UE = [
    { name: "TeamBoard", what: "A project tool for small agencies.", arpu: 30, gm: 0.8, churn: 0.02, cac: 300, a: 0,
      w: "Each customer earns about €1,200 of gross profit over their lifetime, four times what they cost to win, and pays that back in about a year. Healthy: invest in growth." },
    { name: "SnapFit", what: "A fitness app sold through social media ads.", arpu: 20, gm: 0.7, churn: 0.10, cac: 200, a: 1,
      w: "One in ten customers leaves every month, so a customer earns only about €140 of gross profit, less than the €200 it costs to win them. Every new customer loses money. Fix retention before buying more growth." },
    { name: "DraftAI", what: "An AI writing assistant with a big model behind every request.", arpu: 15, gm: 0.30, churn: 0.03, cac: 100, a: 2,
      w: "Customers stay well, but AI costs eat 70% of revenue, so lifetime gross profit is only about €150. Cut cost per request (AI-2): smaller models for easy tasks, caching, usage limits, or usage-based pricing." }
  ];
  var VERDICT = ["Healthy: invest in growth", "Losing money per customer: fix retention", "Thin margins: fix the cost to serve"];
  var MAX = (VM.length + UE.length) * 10;
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function eur(n) { return "€" + Math.round(n).toLocaleString("en-GB"); }

  window.PriceIt = function (root) {
    var s;
    function reset() { s = { i: -1, pick: null, score: 0 }; }
    reset();
    function render() {
      var h = '<div class="rr">', N = VM.length;
      if (s.i === -1) {
        h += '<div class="rr-intro"><div><b class="rr-big">Two rounds, about 8 minutes</b><p><b>Round 1:</b> for three products, choose what the price should grow with. <b>Round 2:</b> read three businesses\' unit economics and diagnose what to fix. No calculator needed, but you may want one.</p><button type="button" class="btn light solid" data-act="start">Start</button></div></div>';
      } else if (s.i < N) {
        var v = VM[s.i], done = s.pick !== null;
        h += '<div class="rr-top"><span>Round 1, product ' + (s.i + 1) + ' of ' + N + '</span><span>Score ' + s.score + ' / ' + MAX + '</span></div><p class="mt-what"><b>' + esc(v.name) + '.</b> ' + esc(v.what) + '</p>' +
          '<p class="rr-ask">What should the price grow with?</p><div class="rr-opts">' + v.o.map(function (t, j) {
            var cls = "rr-opt"; if (done) cls += j === v.a ? " ok" : j === s.pick ? " no" : " dim";
            return '<button type="button" class="' + cls + '" data-p="' + j + '"' + (done ? " disabled" : "") + '>' + esc(t) + '</button>';
          }).join("") + '</div>';
        if (done) h += '<p class="rr-why"><b>' + (s.pick === v.a ? "Right value metric. +10" : "Better: " + esc(v.o[v.a]).toLowerCase() + ".") + '</b> ' + esc(v.w) + '</p><button type="button" class="btn light solid" data-act="next">' + (s.i === N - 1 ? "On to round 2" : "Next product") + '</button>';
      } else if (s.i < N + UE.length) {
        var u = UE[s.i - N], fin = s.pick !== null, gp = u.arpu * u.gm, ltv = gp / u.churn;
        h += '<div class="rr-top"><span>Round 2, business ' + (s.i - N + 1) + ' of ' + UE.length + '</span><span>Score ' + s.score + ' / ' + MAX + '</span></div><div class="rr-play">' +
          '<div class="pi-card"><small>Unit economics</small><b>' + esc(u.name) + '</b><p>' + esc(u.what) + '</p><dl>' +
          '<div><dt>Revenue per customer per month</dt><dd>' + eur(u.arpu) + '</dd></div><div><dt>Gross margin</dt><dd>' + Math.round(u.gm * 100) + '%</dd></div>' +
          '<div><dt>Customers cancelling each month</dt><dd>' + Math.round(u.churn * 100) + '%</dd></div><div><dt>Cost to win one customer</dt><dd>' + eur(u.cac) + '</dd></div>' +
          (fin ? '<div class="pi-calc"><dt>Gross profit per month</dt><dd>' + eur(gp) + '</dd></div><div class="pi-calc"><dt>Lifetime value (÷ monthly churn)</dt><dd>' + eur(ltv) + '</dd></div><div class="pi-calc"><dt>Lifetime value ÷ cost to win</dt><dd>' + (ltv / u.cac).toFixed(1) + ' to 1</dd></div><div class="pi-calc"><dt>Months to earn back the cost to win</dt><dd>' + (u.cac / gp).toFixed(1) + '</dd></div>' : '') +
          '</dl></div><div class="rr-main"><p class="rr-ask" style="margin-top:0">What\'s your diagnosis?</p><div class="rr-opts">' + VERDICT.map(function (t, j) {
            var cls = "rr-opt"; if (fin) cls += j === u.a ? " ok" : j === s.pick ? " no" : " dim";
            return '<button type="button" class="' + cls + '" data-p="' + j + '"' + (fin ? " disabled" : "") + '>' + t + '</button>';
          }).join("") + '</div>';
        if (fin) h += '<p class="rr-why"><b>' + (s.pick === u.a ? "Right diagnosis. +10" : "The numbers say: " + VERDICT[u.a].toLowerCase() + ".") + '</b> ' + esc(u.w) + '</p><button type="button" class="btn light solid" data-act="next">' + (s.i === N + UE.length - 1 ? "See my score" : "Next business") + '</button>';
        h += '</div></div>';
      } else {
        h += '<div class="rr-main" style="max-width:820px"><b class="rr-big">' + s.score + ' / ' + MAX + '</b><p>Price on the value customers get, and let it grow with a value metric they understand. Then check the unit economics: a customer should earn back what they cost to win, comfortably and within about a year. If not, fix retention or margin before you scale.</p><button type="button" class="btn light solid" data-act="again">Play again</button></div>';
      }
      root.innerHTML = h + '</div>';
      root.querySelectorAll("[data-act]").forEach(function (b) {
        b.onclick = function () { var a = b.dataset.act; if (a === "again") reset(); if (a === "next") { s.i++; s.pick = null; } else s.i = 0; render(); var f = root.querySelector(".rr-opt:not([disabled]), [data-act]"); if (f) f.focus(); };
      });
      root.querySelectorAll("[data-p]").forEach(function (b) {
        b.onclick = function () { s.pick = +b.dataset.p; var ok = s.i < VM.length ? VM[s.i].a : UE[s.i - VM.length].a; if (s.pick === ok) s.score += 10; render(); root.querySelector("[data-act]").focus(); };
      });
    }
    render();
  };
})();
