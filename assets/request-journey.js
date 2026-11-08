// Request Journey: a PM Gym game for M8. Mount with RequestJourney(element)
(function () {
  var STEPS = [
    "The app sends the order to your server",
    "Your server checks the user is logged in and the basket is valid",
    "Your server asks the payment provider's API to charge €42",
    "The payment provider replies: approved",
    "Your server saves the order in the database",
    "The app shows “Order confirmed”"
  ];
  var PARTS = [
    { id: "app", name: "The app or browser" },
    { id: "server", name: "Your server" },
    { id: "db", name: "The database" },
    { id: "api", name: "A third-party API" },
    { id: "network", name: "The network" }
  ];
  var INCIDENTS = [
    { t: "Since this morning, every payment fails with “provider unavailable”. Nothing else on the site is broken.", a: "api",
      w: "Only the step that calls the payment provider fails. Check the provider's status page first, then show a clear message and let people retry." },
    { t: "Customers on one old Android version see a blank screen after tapping Pay. Everyone else is fine.", a: "app",
      w: "One device type, everything else working: that points at the app. The request may never even reach your server." },
    { t: "Payments are approved by the provider, but some orders never appear in the customer's history.", a: "db",
      w: "The charge worked, so the break is after it: saving the order. That's the scary one, because people paid for something you didn't record." },
    { t: "Every page, not just checkout, takes 20 seconds to load for users in one country.", a: "network",
      w: "All pages, one region: that's about how traffic reaches you, not about one feature. Look at the network or content delivery setup for that region." },
    { t: "During a big sale, checkout slows down and some requests time out, while the provider reports no problems.", a: "server",
      w: "The provider is fine and it only happens under heavy load. Your server is struggling with the traffic; this is a scaling question." }
  ];
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function pname(id) { return PARTS.filter(function (p) { return p.id === id; })[0].name; }
  var ORDER = [3, 0, 5, 2, 4, 1]; // shuffled display order

  window.RequestJourney = function (root) {
    var s;
    function reset() { s = { phase: "intro", seq: [], wrong: 0, i: 0, pick: null, score: 0 }; }
    reset();
    function render() {
      var h = '<div class="rr">';
      if (s.phase === "intro") {
        h += '<div class="rr-intro"><div><b class="rr-big">One click, two rounds, about 8 minutes</b>' +
          '<p><b style="color:#F2F3F1">Round 1, trace it.</b> A customer taps “Pay €42”. Put the six steps in the right order.</p>' +
          '<p><b style="color:#F2F3F1">Round 2, diagnose it.</b> Five incidents. Decide where to look first.</p>' +
          '<button type="button" class="btn light solid" data-act="start">Start</button></div></div>';
      } else if (s.phase === "order") {
        var done = s.seq.length === STEPS.length;
        h += '<div class="rr-top"><span>Round 1: tap the steps in order</span><span>Score ' + s.score + '</span></div>' +
          '<div class="rj-grid"><div><p class="rr-ask" style="margin-top:0">Steps</p><div class="rr-opts">' +
          ORDER.map(function (k) {
            var used = s.seq.indexOf(k) !== -1;
            return '<button type="button" class="rr-opt' + (used ? " ok" : "") + '" data-step="' + k + '"' + (used || done ? " disabled" : "") + '>' + esc(STEPS[k]) + '</button>';
          }).join("") + '</div>' + (s.flash ? '<p class="rr-why"><b>Not yet.</b> ' + esc(s.flash) + '</p>' : '') + '</div>' +
          '<div><p class="rr-ask" style="margin-top:0">The journey</p><ol class="rj-path">' +
          STEPS.map(function (_, k) { return '<li class="' + (k < s.seq.length ? "on" : "") + '">' + (k < s.seq.length ? esc(STEPS[s.seq[k]]) : " ") + '</li>'; }).join("") + '</ol></div></div>';
        if (done) h += '<p class="rr-why"><b>' + (s.wrong === 0 ? "Perfect order." : "Done, with " + s.wrong + " wrong tap" + (s.wrong === 1 ? "" : "s") + ".") + '</b> Notice the order: the money moves before the order is saved. That’s why a failure at step 5 is the one that keeps engineers up at night.</p><button type="button" class="btn light solid" data-act="round2">On to round 2</button>';
      } else if (s.phase === "diag") {
        var c = INCIDENTS[s.i];
        h += '<div class="rr-top"><span>Round 2, incident ' + (s.i + 1) + ' of ' + INCIDENTS.length + '</span><span>Score ' + s.score + '</span></div>' +
          '<div class="rr-main" style="max-width:860px"><p class="rr-idea">' + esc(c.t) + '</p><p class="rr-ask">Where do you look first?</p><div class="rr-opts rr-4">' +
          PARTS.map(function (p) {
            var cls = "rr-opt"; if (s.pick !== null) cls += p.id === c.a ? " ok" : p.id === s.pick ? " no" : " dim";
            return '<button type="button" class="' + cls + '" data-p="' + p.id + '"' + (s.pick !== null ? " disabled" : "") + '>' + p.name + '</button>';
          }).join("") + '</div>';
        if (s.pick !== null) h += '<p class="rr-why"><b>' + (s.pick === c.a ? "Right place." : "Start with " + pname(c.a).toLowerCase() + ".") + '</b> ' + esc(c.w) + '</p><button type="button" class="btn light solid" data-act="next">' + (s.i === INCIDENTS.length - 1 ? "See my score" : "Next incident") + '</button>';
        h += '</div>';
      } else {
        h += '<div class="rr-main" style="max-width:820px"><b class="rr-big">' + s.score + ' / ' + (60 + INCIDENTS.length * 10) + '</b><p>You don’t need to write code to be useful in an incident. Knowing the path a request takes lets you ask the right first question.</p><button type="button" class="btn light solid" data-act="again">Play again</button></div>';
      }
      root.innerHTML = h + '</div>';
      root.querySelectorAll("[data-act]").forEach(function (b) {
        b.onclick = function () {
          var a = b.dataset.act;
          if (a === "start" || a === "again") { reset(); s.phase = "order"; }
          else if (a === "round2") { s.phase = "diag"; s.i = 0; s.pick = null; }
          else if (a === "next") { if (s.i === INCIDENTS.length - 1) s.phase = "end"; else { s.i++; s.pick = null; } }
          render(); var f = root.querySelector(".rr-opt:not([disabled]), [data-act]"); if (f) f.focus();
        };
      });
      root.querySelectorAll("[data-step]").forEach(function (b) {
        b.onclick = function () {
          var k = +b.dataset.step;
          if (k === s.seq.length) { s.seq.push(k); s.flash = null; s.score += 10; }
          else { s.wrong++; s.score = Math.max(0, s.score - 5); s.flash = "Think about what has to happen before that step can run."; }
          render(); var f = root.querySelector(".rr-opt:not([disabled]), [data-act]"); if (f) f.focus();
        };
      });
      root.querySelectorAll("[data-p]").forEach(function (b) {
        b.onclick = function () { s.pick = b.dataset.p; if (s.pick === INCIDENTS[s.i].a) s.score += 10; render(); root.querySelector("[data-act]").focus(); };
      });
    }
    render();
  };
})();
