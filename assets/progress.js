// PM Gym: the learner's own progress, saved in this browser only.
// A station counts as done when its mastery check is passed (4 of 5 or better)
// or when the learner marks it complete. "You are here" is the last station
// opened that isn't done yet, otherwise the first station not done.
(function () {
  var KEY = "pmgym-progress";
  function load() { try { return JSON.parse(localStorage.getItem(KEY) || "null") || { done: {}, last: null }; } catch (e) { return { done: {}, last: null }; } }
  function save(p) { try { localStorage.setItem(KEY, JSON.stringify(p)); return true; } catch (e) { return false; } }
  // Learners who passed a mastery check before progress tracking existed get that station marked done.
  (function backfill() {
    try {
      var p = load();
      if (p.backfilled) return;
      Object.keys(localStorage).forEach(function (k) {
        var m = k.match(/^pmgym-(.+)-mastery$/); if (!m) return;
        var code = m[1].toUpperCase(), r = JSON.parse(localStorage.getItem(k) || "null");
        if (r && r.of && r.right / r.of >= 0.8 && !p.done[code]) { p.done[code] = { at: r.at || new Date().toISOString(), how: "mastery" }; }
      });
      p.backfilled = true; save(p);
    } catch (e) {}
  })();
  function mastery(code) { try { return JSON.parse(localStorage.getItem("pmgym-" + code.toLowerCase() + "-mastery") || "null"); } catch (e) { return null; } }
  window.PMGYM_PROGRESS = {
    isDone: function (code) { return !!load().done[code]; },
    doneAt: function (code) { var d = load().done[code]; return d ? d.at : null; },
    how: function (code) { var d = load().done[code]; return d ? d.how : null; },
    mastery: mastery,
    markDone: function (code, how) { var p = load(); p.done[code] = { at: new Date().toISOString(), how: how || "marked" }; return save(p); },
    unmark: function (code) { var p = load(); delete p.done[code]; return save(p); },
    visit: function (code) { var p = load(); p.last = code; save(p); },
    count: function () { return Object.keys(load().done).length; },
    current: function (modules) {
      var p = load(), last = modules.filter(function (m) { return m.code === p.last && !p.done[m.code]; })[0];
      return last || modules.filter(function (m) { return !p.done[m.code]; })[0] || null;
    },
    reset: function () { try { Object.keys(localStorage).forEach(function (k) { if (k.indexOf("pmgym-") === 0) localStorage.removeItem(k); }); } catch (e) {} }
  };
})();
