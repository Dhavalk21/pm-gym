// Nudge or Sludge: a PM Gym game for M4. Mount with NudgeOrSludge(element)
(function () {
  var LEVERS = ["Default", "Loss aversion", "Social proof", "Friction", "Prompt timing", "Anchoring"];
  var CARDS = [
    { t: "A pricing page shows the annual plan as €8 a month, right next to the monthly plan at €10 a month. Both prices are real.", v: "nudge", l: "Anchoring",
      w: "Showing both real prices side by side helps people compare. The €10 sets the reference point that makes €8 feel like a deal, and nothing is hidden." },
    { t: "To cancel, users must phone a support line that's open on weekdays from 9 to 5. Signing up took one click.", v: "sludge", l: "Friction",
      w: "Easy in, hard out. Adding friction only to leaving works against the user. In the EU and US, regulators increasingly treat this as unlawful." },
    { t: "A learner who turned on reminders gets: \"Your 23-day streak ends at midnight. One short lesson keeps it.\"", v: "nudge", l: "Loss aversion",
      w: "Losing something feels worse than gaining it, so the streak pulls people back. They opted in and it supports their own goal, so it's a nudge. Keep it from turning into anxiety." },
    { t: "A flight checkout adds travel insurance with a pre-ticked box. Users must untick it to avoid paying.", v: "sludge", l: "Default",
      w: "A default that charges people for something they didn't choose. EU consumer law doesn't allow pre-ticked boxes for extra payments." },
    { t: "An onboarding screen says: \"1,200 teams like yours started with this template.\" The number is real.", v: "nudge", l: "Social proof",
      w: "People follow what others like them do. True, relevant social proof helps people choose faster." },
    { t: "A hotel site shows \"Only 2 rooms left!\" on every room, whatever the real availability.", v: "sludge", l: "Loss aversion",
      w: "Fake scarcity uses fear of missing out with a false claim. It's deceptive, and consumer regulators in Europe have acted against it." },
    { t: "A language app asks to send reminders right after the user finishes their first lesson, not on first launch.", v: "nudge", l: "Prompt timing",
      w: "The same request lands better when motivation is high and the value is clear. Same ask, better moment." },
    { t: "Employees are enrolled in the company pension by default, and can opt out online in two clicks.", v: "nudge", l: "Default",
      w: "A default in people's long-term interest, with an easy way out. This is the textbook good nudge." },
    { t: "A sign-up form is cut from nine fields to three. The rest is asked later, when it's needed.", v: "nudge", l: "Friction",
      w: "Removing friction from a step people want to complete. Ability goes up, and more people finish." },
    { t: "A free trial quietly turns into a €99 yearly charge, with no reminder before it renews.", v: "sludge", l: "Default",
      w: "Relying on people forgetting is a default working against them. A reminder a few days before costs a little revenue and keeps trust." }
  ];
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  window.NudgeOrSludge = function (root) {
    var s;
    function reset() { s = { i: -1, v: null, l: null, score: 0, vOk: 0, lOk: 0 }; }
    reset();
    function render() {
      var h = '<div class="rr">';
      if (s.i === -1) {
        h += '<div class="rr-intro"><div><b class="rr-big">10 designs, about 10 minutes</b>' +
          '<p>For each design: is it a <b style="color:#F2F3F1">nudge</b>, helping people do what they want, or <b style="color:#F2F3F1">sludge</b>, working against them? Then name the psychological lever behind it.</p>' +
          '<p>Levers: ' + LEVERS.join(", ") + '.</p>' +
          '<button type="button" class="btn light solid" data-act="start">Start</button></div></div>';
      } else if (s.i < CARDS.length) {
        var c = CARDS[s.i];
        h += '<div class="rr-top"><span>Design ' + (s.i + 1) + ' of ' + CARDS.length + '</span><span>Score ' + s.score + '</span></div>' +
          '<div class="rr-main" style="max-width:820px"><p class="rr-idea">' + esc(c.t) + '</p>' +
          '<p class="rr-ask">1. Nudge or sludge?</p><div class="rr-opts rr-4">' +
          [["nudge", "Nudge", "#2C8350"], ["sludge", "Sludge", "#C8232B"]].map(function (o) {
            var cls = "rr-opt"; if (s.v !== null) cls += o[0] === c.v ? " ok" : o[0] === s.v ? " no" : " dim";
            return '<button type="button" class="' + cls + '" data-v="' + o[0] + '"' + (s.v !== null ? " disabled" : "") + '><i style="background:' + o[2] + '"></i>' + o[1] + '</button>';
          }).join("") + '</div>';
        if (s.v !== null) {
          h += '<p class="rr-ask">2. Which lever is it using?</p><div class="rr-opts rr-4">' +
            LEVERS.map(function (l) {
              var cls = "rr-opt"; if (s.l !== null) cls += l === c.l ? " ok" : l === s.l ? " no" : " dim";
              return '<button type="button" class="' + cls + '" data-l="' + esc(l) + '"' + (s.l !== null ? " disabled" : "") + '>' + l + '</button>';
            }).join("") + '</div>';
        }
        if (s.l !== null) {
          h += '<p class="rr-why"><b>' + (c.v === "nudge" ? "Nudge" : "Sludge") + ', using ' + c.l.toLowerCase() + '.</b> ' + esc(c.w) + '</p>' +
            '<button type="button" class="btn light solid" data-act="next">' + (s.i === CARDS.length - 1 ? "See my score" : "Next design") + '</button>';
        }
        h += '</div>';
      } else {
        h += '<div class="rr-main" style="max-width:820px"><b class="rr-big">' + s.score + ' / ' + CARDS.length * 20 + '</b>' +
          '<p>Nudge or sludge: ' + s.vOk + ' of ' + CARDS.length + '. Levers: ' + s.lOk + ' of ' + CARDS.length + '.</p>' +
          '<p>The test to keep: the same lever can help or harm. Ask whether the design serves what the user wants, and whether you’d be comfortable showing them exactly how it works.</p>' +
          '<button type="button" class="btn light solid" data-act="again">Play again</button></div>';
      }
      root.innerHTML = h + '</div>';
      wire();
    }
    function wire() {
      root.querySelectorAll("[data-act]").forEach(function (b) {
        b.onclick = function () {
          var a = b.dataset.act;
          if (a === "start") s.i = 0; else if (a === "again") { reset(); s.i = 0; } else { s.i++; s.v = null; s.l = null; }
          render(); var f = root.querySelector(".rr-opt, [data-act]"); if (f) f.focus();
        };
      });
      root.querySelectorAll("[data-v]").forEach(function (b) {
        b.onclick = function () { s.v = b.dataset.v; if (s.v === CARDS[s.i].v) { s.score += 10; s.vOk++; } render(); var f = root.querySelector("[data-l]"); if (f) f.focus(); };
      });
      root.querySelectorAll("[data-l]").forEach(function (b) {
        b.onclick = function () { s.l = b.dataset.l; if (s.l === CARDS[s.i].l) { s.score += 10; s.lOk++; } render(); root.querySelector("[data-act]").focus(); };
      });
    }
    render();
  };
})();
