// Strategy or Wishlist?: a PM Gym game for M14. Mount with StrategyOrWishlist(element)
(function () {
  var K = { real: "A real strategy", goal: "A goal, not a strategy", fluff: "Fluff with no real choices", ignore: "Ignores the real problem" };
  var ITEMS = [
    { co: "A payments start-up", t: "Our strategy is to grow revenue by 40% next year.", a: "goal", w: "It's a target, not a plan. It says nothing about the obstacle in the way or how to overcome it. Goals matter, but they're the scoreboard, not the game plan." },
    { co: "A software company", t: "We will leverage synergistic, customer-centric innovation to become the world's leading platform.", a: "fluff", w: "Big words, no substance. Nothing here tells a team what to do on Monday, or what to stop doing." },
    { co: "Ledgerly", t: "Freelancers lose hours chasing late payments, and big banks ignore them. We'll serve only freelancers in the EU and win on getting them paid faster: payment links on every invoice, automatic reminders, and partnerships with two digital banks. No enterprise features.", a: "real", w: "A clear diagnosis, a guiding policy (focus on EU freelancers, win on getting paid), coherent actions, and an explicit no." },
    { co: "A meditation app", t: "Our biggest problem is that people leave after the free trial. Our strategy: launch in five new countries, build a smartwatch app and refresh the brand.", a: "ignore", w: "The diagnosis is right, but none of the actions address it. New countries just bring more people who'll leave after the trial." },
    { co: "A grocery delivery company", t: "Fast grocery delivery is a low-margin race in every city. We'll stop competing everywhere and focus on three dense cities where each order can be profitable: fewer warehouses, bigger baskets, and a family subscription.", a: "real", w: "It faces the real challenge (margins), makes a hard choice (three cities), and the actions reinforce each other." },
    { co: "A travel site", t: "We'll be the cheapest, the fastest, the most premium and the most personal travel site in the world.", a: "fluff", w: "Cheapest and most premium pull in opposite directions. Trying to win on everything is the same as having no strategy." }
  ];
  var KERNEL = {
    intro: "Stayly, a small holiday-home marketplace, keeps losing listings and guests to much bigger platforms. Build its strategy kernel.",
    parts: [
      { k: "Diagnosis", q: "What's the real challenge?", o: ["Big platforms win in cities, but family homes in rural Europe are badly listed and hard to trust", "We need more marketing", "Our logo looks old-fashioned"], a: 0, w: "A good diagnosis names the obstacle and finds the opening: an underserved niche where the giants are weak." },
      { k: "Guiding policy", q: "What's the overall approach?", o: ["Match the biggest platform feature by feature", "Become the most trusted place to book family holiday homes in rural Europe", "Be everything to everyone"], a: 1, w: "The guiding policy follows from the diagnosis and rules things out: no city lofts, no business travel." },
      { k: "Coherent actions", q: "Which set of actions fits?", o: ["Cut prices by 30% everywhere", "Launch business travel, luxury villas and city lofts at once", "Check every home in person, add family filters like fenced gardens, and partner with regional tourism offices"], a: 2, w: "Each action supports the others and the policy: trust (checks), families (filters) and rural supply (local partners)." }
    ]
  };
  var MAX = (ITEMS.length + KERNEL.parts.length) * 10;
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  window.StrategyOrWishlist = function (root) {
    var s;
    function reset() { s = { i: -1, pick: null, score: 0, kp: [] }; }
    reset();
    function render() {
      var h = '<div class="rr">', N = ITEMS.length;
      if (s.i === -1) {
        h += '<div class="rr-intro"><div><b class="rr-big">Two rounds, about 8 minutes</b><p><b>Round 1:</b> six statements that companies call their strategy. Sort the real ones from the goals, the fluff and the ones that dodge the problem. <b>Round 2:</b> build a real strategy, step by step, using Richard Rumelt\'s kernel: diagnosis, guiding policy, coherent actions.</p><button type="button" class="btn light solid" data-act="start">Start</button></div></div>';
      } else if (s.i < N) {
        var it = ITEMS[s.i], done = s.pick !== null;
        h += '<div class="rr-top"><span>Round 1, statement ' + (s.i + 1) + ' of ' + N + '</span><span>Score ' + s.score + ' / ' + MAX + '</span></div><div class="rr-play">' +
          '<blockquote class="sw-quote"><small>' + esc(it.co) + '</small>' + esc(it.t) + '</blockquote><div class="rr-main"><p class="rr-ask" style="margin-top:0">What is it really?</p><div class="rr-opts">' +
          ["real", "goal", "fluff", "ignore"].map(function (k) {
            var cls = "rr-opt"; if (done) cls += k === it.a ? " ok" : k === s.pick ? " no" : " dim";
            return '<button type="button" class="' + cls + '" data-k="' + k + '"' + (done ? " disabled" : "") + '>' + K[k] + '</button>';
          }).join("") + '</div>';
        if (done) h += '<p class="rr-why"><b>' + (s.pick === it.a ? "Spot on. +10" : "It's " + K[it.a].toLowerCase() + ".") + '</b> ' + esc(it.w) + '</p><button type="button" class="btn light solid" data-act="next">' + (s.i === N - 1 ? "On to round 2" : "Next statement") + '</button>';
        h += '</div></div>';
      } else if (s.i === N) {
        var j = s.kp.length, P = KERNEL.parts, cur = P[Math.min(j, P.length - 1)], answered = s.pick !== null;
        h += '<div class="rr-top"><span>Round 2: build the kernel</span><span>Score ' + s.score + ' / ' + MAX + '</span></div><p class="mt-what">' + esc(KERNEL.intro) + '</p><div class="rr-play"><div class="sw-kernel">' +
          P.map(function (p, x) {
            var got = x < j || (x === j && answered), pick = x < j ? s.kp[x] : s.pick;
            return '<div class="sw-part' + (got ? (pick === p.a ? " ok" : " no") : x === j ? " now" : "") + '"><small>' + (x + 1) + '. ' + p.k + '</small><p>' + (got ? esc(p.o[p.a]) : x === j ? "Choose below" : "Still to come") + '</p></div>';
          }).join("") + '</div><div class="rr-main">';
        if (j < P.length) {
          h += '<p class="rr-ask" style="margin-top:0">' + esc(cur.k) + ': ' + esc(cur.q) + '</p><div class="rr-opts">' + cur.o.map(function (t, x) {
            var cls = "rr-opt"; if (answered) cls += x === cur.a ? " ok" : x === s.pick ? " no" : " dim";
            return '<button type="button" class="' + cls + '" data-o="' + x + '"' + (answered ? " disabled" : "") + '>' + esc(t) + '</button>';
          }).join("") + '</div>';
          if (answered) h += '<p class="rr-why"><b>' + (s.pick === cur.a ? "Coherent. +10" : "Not quite.") + '</b> ' + esc(cur.w) + '</p><button type="button" class="btn light solid" data-act="kn">' + (j === P.length - 1 ? "See my score" : "Next part") + '</button>';
        }
        h += '</div></div>';
      } else {
        h += '<div class="rr-main" style="max-width:820px"><b class="rr-big">' + s.score + ' / ' + MAX + '</b><p>A real strategy names the challenge, chooses an approach that rules things out, and backs it with actions that reinforce each other. If a strategy doesn\'t tell people what to stop doing, it\'s probably a wishlist.</p><button type="button" class="btn light solid" data-act="again">Play again</button></div>';
      }
      root.innerHTML = h + '</div>';
      root.querySelectorAll("[data-act]").forEach(function (b) {
        b.onclick = function () {
          var a = b.dataset.act;
          if (a === "again") { reset(); s.i = 0; }
          else if (a === "start") s.i = 0;
          else if (a === "next") { s.i++; s.pick = null; }
          else if (a === "kn") { s.kp.push(s.pick); s.pick = null; if (s.kp.length === KERNEL.parts.length) s.i++; }
          render(); var f = root.querySelector(".rr-opt:not([disabled]), [data-act]"); if (f) f.focus();
        };
      });
      root.querySelectorAll("[data-k]").forEach(function (b) {
        b.onclick = function () { s.pick = b.dataset.k; if (s.pick === ITEMS[s.i].a) s.score += 10; render(); root.querySelector("[data-act]").focus(); };
      });
      root.querySelectorAll("[data-o]").forEach(function (b) {
        b.onclick = function () { s.pick = +b.dataset.o; if (s.pick === KERNEL.parts[s.kp.length].a) s.score += 10; render(); root.querySelector("[data-act]").focus(); };
      });
    }
    render();
  };
})();
