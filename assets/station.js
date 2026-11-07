// Shared behaviour for station pages. Reads <body data-station="m1" data-lessons="4">.
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var station = document.body.dataset.station || "station";
  var store = {
    get: function (k) { try { return JSON.parse(localStorage.getItem(k) || "null"); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } }
  };

  // Step bar: interval heights, highlights the section in view
  var steps = [["warmup", "Warm-up", 5, 30], ["lessons", "Lessons", 30, 50], ["cases", "Cases", 10, 45], ["game", "Game", 20, 75], ["apply", "Apply", 30, 100], ["teach", "Teach", 20, 65], ["check", "Check", 10, 55]];
  var nav = $("stepnav");
  if (nav) {
    nav.innerHTML = steps.map(function (s) {
      return '<a href="#' + s[0] + '" data-id="' + s[0] + '" style="flex:' + s[2] + ' 1 0"><i style="height:' + Math.round(s[3] * 0.36) + 'px"></i>' + s[1] + '</a>';
    }).join("");
    var links = nav.querySelectorAll("a");
    var mark = function (id) { links.forEach(function (a) { a.setAttribute("aria-current", a.dataset.id === id ? "step" : "false"); }); };
    mark("warmup");
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) mark(e.target.id); }); }, { rootMargin: "-35% 0px -60% 0px" });
      steps.forEach(function (s) { if ($(s[0])) io.observe($(s[0])); });
    }
  }

  // Forms with data-persist="name" keep their textareas in this browser
  document.querySelectorAll("form[data-persist]").forEach(function (f) {
    var key = "pmgym-" + station + "-" + f.dataset.persist, saved = store.get(key) || {};
    var fields = f.querySelectorAll("textarea, input[type=text]");
    fields.forEach(function (el) { if (saved[el.name]) el.value = saved[el.name]; });
    var msg = f.querySelector("[role=status]");
    f.addEventListener("submit", function (e) {
      e.preventDefault(); var d = {}; fields.forEach(function (el) { d[el.name] = el.value; });
      if (msg) msg.textContent = store.set(key, d) ? "Saved in this browser." : "Couldn't save here. Copy your notes somewhere safe.";
    });
  });

  // Lesson progress
  var lessons = document.querySelectorAll("details.lesson"), lkey = "pmgym-" + station + "-lessons";
  var done = store.get(lkey) || {};
  function paintLessons() {
    var n = 0;
    lessons.forEach(function (d) {
      var id = d.dataset.lesson, isDone = !!done[id]; if (isDone) n++;
      var lab = d.querySelector("[data-done-label]"); if (lab) lab.textContent = isDone ? "Done" : "";
      var b = d.querySelector("[data-mark]"); if (b) b.textContent = isDone ? "Done. Mark as not done" : "Mark lesson " + id + " done";
    });
    if ($("lprog")) $("lprog").textContent = n + " of " + lessons.length + " lessons done";
  }
  document.querySelectorAll("[data-mark]").forEach(function (b) {
    b.onclick = function () {
      var id = b.dataset.mark; done[id] = !done[id]; store.set(lkey, done); paintLessons();
      if (done[id]) {
        b.closest("details").open = false;
        var next = document.querySelector('details.lesson[data-lesson="' + (+id + 1) + '"]');
        if (next) { next.open = true; next.querySelector("summary").focus(); }
      }
    };
  });
  paintLessons();

  // Quick checks: <div class="check" data-answer="i"> with .opt buttons and a .cfb paragraph
  function updateMastery() {
    var box = $("mastery"); if (!box) return;
    var qs = box.querySelectorAll(".check"), answered = 0, right = 0;
    qs.forEach(function (c) { if (c.dataset.picked !== undefined) { answered++; if (c.dataset.picked === c.dataset.answer) right++; } });
    if (answered === qs.length && $("mscore")) {
      var pass = right >= Math.ceil(qs.length * 0.8);
      $("mscore").textContent = right + " of " + qs.length + " right. " + (pass ? "Station passed." : "Revisit the lessons you missed, then come back tomorrow.");
      store.set("pmgym-" + station + "-mastery", { right: right, of: qs.length, at: new Date().toISOString() });
    }
  }
  document.querySelectorAll(".check").forEach(function (c) {
    var btns = c.querySelectorAll(".opt"), fb = c.querySelector(".cfb"), ans = +c.dataset.answer;
    btns.forEach(function (b, i) {
      b.onclick = function () {
        c.dataset.picked = String(i);
        btns.forEach(function (x, j) { x.disabled = true; x.classList.add(j === ans ? "right" : j === i ? "wrong" : "dim"); });
        if (fb) fb.innerHTML = '<strong style="color:' + (i === ans ? "#2C8350" : "#B0202A") + '">' + (i === ans ? "Yes." : "Not quite.") + "</strong> " + (i === ans ? fb.dataset.ok : fb.dataset.no);
        if (c.closest("#mastery")) updateMastery();
      };
    });
  });

})();
