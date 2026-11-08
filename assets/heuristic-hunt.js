// Heuristic Hunt: a PM Gym game for M7. Mount with HeuristicHunt(element)
(function () {
  var H = {
    status: "Show what's happening",
    world: "Speak the user's language",
    control: "Let people undo and leave",
    consistency: "Keep things consistent",
    prevent: "Prevent errors",
    recognise: "Show, don't make people remember",
    minimal: "Cut the clutter",
    recover: "Explain errors and how to fix them"
  };
  // Each screen: a tiny mock-up (HTML), the right heuristic, three distractors, and why.
  var SCREENS = [
    { title: "Uploading a 2 GB video", mock: '<div class="hh-card"><b>Upload</b><div class="hh-drop">my-video.mp4</div><div class="hh-muted">Please wait…</div></div>', note: "No progress, no time estimate. It stays like this for six minutes.",
      a: "status", d: ["minimal", "consistency", "world"], w: "People need to see that something is happening and roughly how long it will take. A progress bar and an estimate stop them refreshing and losing the upload." },
    { title: "Saving a form", mock: '<div class="hh-card"><b>Billing details</b><div class="hh-field">VAT ID <span>DE12345</span></div><div class="hh-error">Error 0x83: validation failed</div></div>', note: "That's the only message the user sees.",
      a: "recover", d: ["status", "minimal", "control"], w: "Say what went wrong in plain words and how to fix it: \"German VAT IDs have 9 digits after DE. Yours has 5.\"" },
    { title: "Deleting a project", mock: '<div class="hh-card"><b>Project: Q3 launch</b><div class="hh-row"><span class="hh-btn danger">Delete</span></div></div>', note: "One click deletes the project and all its files, immediately, with no way back.",
      a: "control", d: ["status", "world", "recognise"], w: "Big, irreversible actions need a way out: undo for a few seconds, or a trash folder. People make mistakes; let them recover." },
    { title: "A toolbar", mock: '<div class="hh-card"><div class="hh-row hh-icons"><span>▢</span><span>◇</span><span>△</span><span>⊙</span><span>☰</span><span>✦</span></div></div>', note: "Six icons, no labels, no tooltips. New users don't know which one exports.",
      a: "recognise", d: ["minimal", "prevent", "status"], w: "Don't make people memorise what an unfamiliar icon means. Add labels, or at least tooltips, for anything that isn't universally understood." },
    { title: "Checkout for a German shop", mock: '<div class="hh-card"><b>Delivery date</b><div class="hh-field">MM/DD/YYYY <span>11/12/2026</span></div><div class="hh-field">Postcode <span>ZIP code</span></div></div>', note: "Users in Germany read 11/12 as the 11th of December.",
      a: "world", d: ["consistency", "recover", "minimal"], w: "Use the formats and words your users use. In Germany that's DD.MM.YYYY and \"Postleitzahl\", not US formats." },
    { title: "Three screens of one app", mock: '<div class="hh-card hh-row"><span class="hh-btn">Save</span><span class="hh-btn alt">Submit</span><span class="hh-btn ghost">Apply changes</span></div>', note: "The same action has a different label, colour and position on each screen.",
      a: "consistency", d: ["world", "recognise", "status"], w: "The same action should look and read the same everywhere, so people don't have to wonder whether it does something different." },
    { title: "Booking a meeting room", mock: '<div class="hh-card"><b>Book a room</b><div class="hh-field">Date <span>type a date</span></div><div class="hh-field">Time <span>type a time</span></div></div>', note: "Free-text fields. People type \"tmrw 3pm\" and book the wrong day.",
      a: "prevent", d: ["recover", "control", "minimal"], w: "Better to stop the mistake than to explain it afterwards: a date picker and a list of free times make the wrong booking impossible." },
    { title: "A dashboard home screen", mock: '<div class="hh-card hh-grid">' + new Array(12).join('<span class="hh-tile"></span>') + '</div>', note: "Fourteen equally loud buttons, five charts and three banners. People can't find the one thing they came for.",
      a: "minimal", d: ["consistency", "status", "world"], w: "Every extra element competes with the important ones. Lead with the one or two things most people come for; tuck the rest away." }
  ];
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function shuffle(a, seed) { var r = a.slice(), x = seed; for (var i = r.length - 1; i > 0; i--) { x = (x * 9301 + 49297) % 233280; var j = Math.floor(x / 233280 * (i + 1)); var t = r[i]; r[i] = r[j]; r[j] = t; } return r; }

  window.HeuristicHunt = function (root) {
    var s;
    function reset() { s = { i: -1, pick: null, score: 0 }; }
    reset();
    function render() {
      var h = '<div class="rr">';
      if (s.i === -1) {
        h += '<div class="rr-intro"><div><b class="rr-big">Eight screens, about 8 minutes</b><p>Each mock-up breaks one well-known usability rule, based on Jakob Nielsen’s ten usability heuristics. Spot which one, then see the fix.</p><button type="button" class="btn light solid" data-act="start">Start</button></div></div>';
      } else if (s.i < SCREENS.length) {
        var c = SCREENS[s.i], opts = shuffle([c.a].concat(c.d), s.i + 3);
        h += '<div class="rr-top"><span>Screen ' + (s.i + 1) + ' of ' + SCREENS.length + '</span><span>Score ' + s.score + '</span></div>' +
          '<div class="rr-play"><div class="hh-mock" aria-label="Mock-up: ' + esc(c.title) + '"><small>' + esc(c.title) + '</small>' + c.mock + '</div><div class="rr-main">' +
          '<p class="rr-idea">' + esc(c.note) + '</p><p class="rr-ask">Which rule does it break?</p><div class="rr-opts">' +
          opts.map(function (id) {
            var cls = "rr-opt"; if (s.pick !== null) cls += id === c.a ? " ok" : id === s.pick ? " no" : " dim";
            return '<button type="button" class="' + cls + '" data-h="' + id + '"' + (s.pick !== null ? " disabled" : "") + '>' + esc(H[id]) + '</button>';
          }).join("") + '</div>';
        if (s.pick !== null) h += '<p class="rr-why"><b>' + (s.pick === c.a ? "Spotted." : "It's “" + esc(H[c.a]).toLowerCase() + "”.") + '</b> ' + esc(c.w) + '</p><button type="button" class="btn light solid" data-act="next">' + (s.i === SCREENS.length - 1 ? "See my score" : "Next screen") + '</button>';
        h += '</div></div>';
      } else {
        h += '<div class="rr-main" style="max-width:820px"><b class="rr-big">' + s.score + ' / ' + SCREENS.length * 10 + '</b><p>A heuristic review like this finds problems fast. It doesn’t replace watching real people use the product, which finds the ones experts miss.</p><button type="button" class="btn light solid" data-act="again">Play again</button></div>';
      }
      root.innerHTML = h + '</div>';
      root.querySelectorAll("[data-act]").forEach(function (b) {
        b.onclick = function () { var a = b.dataset.act; if (a === "again") reset(); if (a === "next") { s.i++; s.pick = null; } else s.i = 0; render(); var f = root.querySelector(".rr-opt, [data-act]"); if (f) f.focus(); };
      });
      root.querySelectorAll("[data-h]").forEach(function (b) {
        b.onclick = function () { s.pick = b.dataset.h; if (s.pick === SCREENS[s.i].a) s.score += 10; render(); root.querySelector("[data-act]").focus(); };
      });
    }
    render();
  };
})();
