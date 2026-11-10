// Launch Day: a PM Gym game for M17. Mount with LaunchDay(element)
(function () {
  var STEPS = [
    { time: "Day before", title: "Final launch review",
      sit: "The plan: switch the new invoice editor on for all 12,000 customers at 9:00 tomorrow. Goal and success metric are agreed. An error dashboard exists. Support has seen a short demo.",
      o: ["There's no gradual rollout and no quick way to switch it off", "The announcement email isn't designed yet", "There's no launch party planned"], a: 0,
      w: "Everyone at once, with no off switch, means any bug hits every customer before you can react. The team adds a feature flag: 5%, then 25%, then 100%, with a one-click off switch." },
    { time: "09:20", title: "Rollout at 5%",
      sit: "Twenty minutes in, the error rate for the 5% group jumps from 0.2% to 3%. Some invoices fail to save.",
      o: ["Push to 100% to get more data faster", "Switch the flag off, tell the team, then investigate", "Wait until tomorrow to see if it settles"], a: 1,
      w: "Stop the harm first, then find the cause. With a flag, rolling back takes a minute and only 5% of customers were ever affected. Engineering finds a timezone bug and fixes it by 11:00." },
    { time: "11:30", title: "Rollout at 25%",
      sit: "Support receives 40 tickets in an hour: \"Where did the export button go?\" It moved into a new menu.",
      o: ["Add a short in-app hint and a help article, and give support a ready reply", "Bring the old button back immediately", "Ignore it; people will get used to it"], a: 0,
      w: "It's a findability problem, not a bug. Point people to the new place and equip support. Note it for the next design review: maybe the menu wasn't obvious enough." },
    { time: "13:00", title: "Marketing wants to announce",
      sit: "Marketing asks to send the \"Meet the new editor\" email to all 12,000 customers now. Only 25% have the new editor so far.",
      o: ["Send it now; it's ready", "Cancel the email completely", "Wait until everyone has it, or send it only to customers who already do"], a: 2,
      w: "An announcement for a feature most people can't see creates confusion and tickets. Time messages to the rollout." },
    { time: "16:00", title: "Early numbers",
      sit: "The dashboard shows invoices sent per user up 4% in the new-editor group. It's day one, and the group is small.",
      o: ["Announce a 4% win to the whole company", "Keep rolling out as planned, and judge on the agreed metric after two weeks", "Roll back, because 4% is too small"], a: 1,
      w: "Day-one numbers are noisy and full of novelty effects (M11). Stick to the plan and the agreed measurement window." },
    { time: "Two weeks later", title: "Post-launch review",
      sit: "Rollout finished. The main metric is up. There was the error spike on day one and the confusion about the export button.",
      o: ["Skip the review; it went fine", "Find out who caused the error spike", "Hold a blameless review: what happened, what we learned, what we'll change"], a: 2,
      w: "Blameless reviews make people share what really happened, so the system improves: here, a timezone test case, and a check of moved buttons in design reviews." }
  ];
  var MAX = STEPS.length * 10;
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function shuffle(a, seed) { var r = a.slice(), x = seed; for (var i = r.length - 1; i > 0; i--) { x = (x * 9301 + 49297) % 233280; var j = Math.floor(x / 233280 * (i + 1)); var t = r[i]; r[i] = r[j]; r[j] = t; } return r; }

  window.LaunchDay = function (root) {
    var s;
    function reset() { s = { i: -1, pick: null, score: 0, res: [] }; }
    reset();
    function timeline() {
      return '<ol class="ld-tl">' + STEPS.map(function (st, j) {
        var cls = j < s.res.length ? (s.res[j] ? "ok" : "no") : j === s.i ? "now" : "";
        return '<li class="' + cls + '"><small>' + esc(st.time) + '</small><span>' + esc(st.title) + '</span></li>';
      }).join("") + '</ol>';
    }
    function render() {
      var h = '<div class="rr">';
      if (s.i === -1) {
        h += '<div class="rr-intro"><div><b class="rr-big">One launch, about 7 minutes</b><p>Ledgerly is launching a new invoice editor to 12,000 customers. You\'re the PM. Six moments, from the day before to two weeks after: make the call at each one.</p><button type="button" class="btn light solid" data-act="start">Start</button></div></div>';
      } else if (s.i < STEPS.length) {
        var st = STEPS[s.i], done = s.pick !== null;
        h += '<div class="rr-top"><span>Launch Day</span><span>Score ' + s.score + ' / ' + MAX + '</span></div><div class="rr-play">' + timeline() +
          '<div class="rr-main"><div class="ld-sit"><small>' + esc(st.time) + ' · ' + esc(st.title) + '</small><p>' + esc(st.sit) + '</p></div><p class="rr-ask">' + (s.i === 0 ? "What's the biggest gap?" : "What do you do?") + '</p><div class="rr-opts">' +
          shuffle([0, 1, 2], s.i + 11).map(function (j) {
            var cls = "rr-opt"; if (done) cls += j === st.a ? " ok" : j === s.pick ? " no" : " dim";
            return '<button type="button" class="' + cls + '" data-o="' + j + '"' + (done ? " disabled" : "") + '>' + esc(st.o[j]) + '</button>';
          }).join("") + '</div>';
        if (done) h += '<p class="rr-why"><b>' + (s.pick === st.a ? "Good call. +10" : "A better call is highlighted.") + '</b> ' + esc(st.w) + '</p><button type="button" class="btn light solid" data-act="next">' + (s.i === STEPS.length - 1 ? "See my score" : "Next moment") + '</button>';
        h += '</div></div>';
      } else {
        h += '<div class="rr-main" style="max-width:820px"><b class="rr-big">' + s.score + ' / ' + MAX + '</b><p>Safe launches share a pattern: roll out gradually behind a switch, watch the right numbers, stop the harm first, keep support and marketing in step, judge on the agreed metric, and review without blame.</p><button type="button" class="btn light solid" data-act="again">Play again</button></div>';
      }
      root.innerHTML = h + '</div>';
      root.querySelectorAll("[data-act]").forEach(function (b) {
        b.onclick = function () { var a = b.dataset.act; if (a === "again") { reset(); s.i = 0; } else if (a === "start") s.i = 0; else { s.res.push(s.pick === STEPS[s.i].a); s.i++; s.pick = null; } render(); var f = root.querySelector(".rr-opt:not([disabled]), [data-act]"); if (f) f.focus(); };
      });
      root.querySelectorAll("[data-o]").forEach(function (b) {
        b.onclick = function () { s.pick = +b.dataset.o; if (s.pick === STEPS[s.i].a) s.score += 10; render(); root.querySelector("[data-act]").focus(); };
      });
    }
    render();
  };
})();
