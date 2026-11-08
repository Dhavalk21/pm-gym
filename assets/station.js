// Shared behaviour for station pages. Reads <body data-station="m1">.
// Lessons, mastery check and takeaways are built from the page's own markup;
// Apply ("Build your card") and Teach read JSON from <script type="application/json"> blocks.
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var station = document.body.dataset.station || "station";
  var store = {
    get: function (k) { try { return JSON.parse(localStorage.getItem(k) || "null"); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } }
  };
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function copyText(text, out) {
    if (navigator.clipboard) navigator.clipboard.writeText(text).then(function () { out.textContent = "Copied."; }, function () { out.textContent = "Select the text and copy it manually."; });
    else out.textContent = "Select the text and copy it manually.";
  }
  var CHEV = '<svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><path d="M5 2l5 5-5 5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  /* ---------- Step bar at the top of the page ---------- */
  var steps = [["warmup", "Warm-up", 5, 30], ["lessons", "Lessons", 30, 50], ["cases", "Cases", 10, 45], ["game", "Game", 20, 75], ["apply", "Apply", 30, 100], ["teach", "Teach", 20, 65], ["check", "Check", 10, 55]];
  var nav = $("stepnav");
  if (nav) {
    nav.innerHTML = steps.map(function (s) {
      return '<a href="#' + s[0] + '" data-id="' + s[0] + '" style="flex:' + s[2] + ' 1 0"><i style="height:' + Math.round(s[3] * 0.36) + 'px"></i>' + s[1] + '</a>';
    }).join("");
    var links = nav.querySelectorAll("a");
    var markNav = function (id) { links.forEach(function (a) { a.setAttribute("aria-current", a.dataset.id === id ? "step" : "false"); }); };
    markNav("warmup");
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) markNav(e.target.id); }); }, { rootMargin: "-35% 0px -60% 0px" });
      steps.forEach(function (s) { if ($(s[0])) io.observe($(s[0])); });
    }
  }

  /* ---------- Forms with data-persist keep their text in this browser ---------- */
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

  /* ---------- Quick checks ---------- */
  function wireCheck(c, onAnswer) {
    if (c.dataset.wired) return; c.dataset.wired = "1";
    var btns = c.querySelectorAll(".opt"), fb = c.querySelector(".cfb"), ans = +c.dataset.answer;
    btns.forEach(function (b, i) {
      b.onclick = function () {
        c.dataset.picked = String(i);
        btns.forEach(function (x, j) { x.disabled = true; x.classList.add(j === ans ? "right" : j === i ? "wrong" : "dim"); });
        if (fb) fb.innerHTML = '<strong class="' + (i === ans ? "t-ok" : "t-no") + '">' + (i === ans ? "Yes." : "Not quite.") + "</strong> " + (i === ans ? fb.dataset.ok : fb.dataset.no);
        if (onAnswer) onAnswer(i === ans);
      };
    });
  }

  /* ---------- Takeaway lines become each lesson's "In one line" card ---------- */
  var takeawayLines = Array.prototype.map.call(document.querySelectorAll(".takeaways li"), function (li) {
    var b = li.querySelector("b"); return (b ? b.textContent : li.textContent).trim();
  });

  /* ---------- Lessons: clickable cards, five steps each ---------- */
  var lkey = "pmgym-" + station + "-lessons", done = store.get(lkey) || {};
  var lessonEls = Array.prototype.slice.call(document.querySelectorAll("details.lesson"));
  var lessonsBox = lessonEls.length ? lessonEls[0].parentNode : null;
  var lessons = lessonEls.map(function (d, idx) {
    var id = d.dataset.lesson;
    var title = d.querySelector(".lt b").textContent, sub = d.querySelector(".lt span").textContent, min = d.querySelector(".lmin").textContent;
    var parts = Array.prototype.slice.call(d.querySelectorAll(".lbody > .part"));
    var stepNames = parts.map(function (p) {
      var t = (p.querySelector("h4") || {}).textContent || "";
      if (/^drill/i.test(t)) return "Drill";
      if (/framework/i.test(t)) return "Framework";
      if (/example/i.test(t)) return "Example";
      return t;
    });
    var card = document.createElement("div");
    card.className = "lsn"; card.dataset.lesson = id;
    card.innerHTML = '<button type="button" class="lsn-head" aria-expanded="false"><span class="lsn-n"></span><span class="lsn-t"><span class="upnext">Up next</span><b></b><span class="lsn-s"></span></span>' +
      '<span class="lsn-meta"></span><span class="lsn-cta"><span class="lsn-cta-t"></span>' + CHEV + '</span></button>' +
      '<div class="lsn-body" hidden><div class="steps-bar"></div><div class="panel"><div class="panel-main"></div><aside class="oneline"><small>In one line</small><p></p></aside></div><div class="panel-nav"></div></div>';
    card.querySelector(".lsn-t b").textContent = title;
    card.querySelector(".lsn-s").textContent = sub;
    card.querySelector(".lsn-meta").textContent = min.replace("min", "minutes") + ", " + parts.length + " steps";
    card.querySelector(".oneline p").textContent = takeawayLines[idx] || sub;
    var main = card.querySelector(".panel-main");
    parts.forEach(function (p) { p.hidden = true; main.appendChild(p); });
    var bar = card.querySelector(".steps-bar");
    bar.innerHTML = stepNames.map(function (n, k) { return '<button type="button" data-step="' + k + '"><i></i>' + (k + 1) + ". " + esc(n) + "</button>"; }).join("");
    d.parentNode.replaceChild(card, d);
    return { id: id, card: card, parts: parts, names: stepNames, step: 0 };
  });

  function paintLessons() {
    var n = 0, nextIdx = -1;
    lessons.forEach(function (L, i) { if (done[L.id]) n++; else if (nextIdx === -1) nextIdx = i; });
    lessons.forEach(function (L, i) {
      var open = L.card.classList.contains("open"), isDone = !!done[L.id];
      L.card.classList.toggle("done", isDone);
      L.card.classList.toggle("next", i === nextIdx);
      L.card.querySelector(".lsn-n").textContent = isDone ? "✓" : String(i + 1);
      L.card.querySelector(".lsn-cta-t").textContent = open ? "Close" : isDone ? "Review" : L.started ? "Continue" : "Start lesson";
      L.card.querySelector(".lsn-head").setAttribute("aria-expanded", open);
    });
    if ($("lprog")) $("lprog").textContent = n + " of " + lessons.length + " lessons done";
  }
  function showStep(L, k) {
    L.step = k;
    L.parts.forEach(function (p, j) { p.hidden = j !== k; });
    var isDrill = L.names[k] === "Drill";
    L.card.querySelector(".panel").classList.toggle("full", isDrill);
    L.card.querySelector(".oneline").hidden = isDrill;
    L.card.querySelectorAll(".steps-bar button").forEach(function (b, j) {
      b.setAttribute("aria-current", j === k ? "step" : "false"); b.classList.toggle("seen", j < k);
    });
    var last = k === L.parts.length - 1, isDone = !!done[L.id];
    L.card.querySelector(".panel-nav").innerHTML = (k > 0 ? '<button type="button" class="btn" data-nav="-1">Back</button>' : "<span></span>") +
      (last ? '<button type="button" class="btn solid" data-finish>' + (isDone ? "Done. Mark as not done" : "Finish lesson " + L.id) + "</button>"
            : '<button type="button" class="btn solid" data-nav="1">Next: ' + esc(L.names[k + 1]) + "</button>");
    L.card.querySelectorAll("[data-nav]").forEach(function (b) {
      b.onclick = function () { showStep(L, L.step + +b.dataset.nav); L.card.querySelector('.steps-bar [aria-current="step"]').focus(); };
    });
    var fin = L.card.querySelector("[data-finish]");
    if (fin) fin.onclick = function () {
      done[L.id] = !done[L.id]; store.set(lkey, done);
      if (done[L.id]) {
        toggle(L, false);
        var nxt = lessons[lessons.indexOf(L) + 1];
        if (nxt && !done[nxt.id]) { toggle(nxt, true); nxt.card.querySelector(".lsn-head").focus(); }
      } else showStep(L, L.step);
      paintLessons();
    };
  }
  function toggle(L, open) {
    L.card.classList.toggle("open", open);
    L.card.querySelector(".lsn-body").hidden = !open;
    if (open) { L.started = true; showStep(L, 0); }
    paintLessons();
  }
  lessons.forEach(function (L) {
    L.card.querySelector(".lsn-head").onclick = function () { toggle(L, !L.card.classList.contains("open")); };
    L.card.querySelectorAll(".steps-bar button").forEach(function (b) { b.onclick = function () { showStep(L, +b.dataset.step); }; });
    L.parts.forEach(function (p) { p.querySelectorAll(".check").forEach(function (c) { wireCheck(c); }); });
  });
  paintLessons();

  /* ---------- Apply: build your card ---------- */
  var applyCfgEl = $("apply-config");
  if (applyCfgEl) {
    var A = JSON.parse(applyCfgEl.textContent), akey = "pmgym-" + station + "-card", vals = store.get(akey) || {};
    var RISKS = [["Value", "#E3A82B"], ["Usability", "#2A9D8F"], ["Feasibility", "#4C7BD9"], ["Viability", "#2C8350"]];
    var TESTS = { Value: "A fake door, a pre-order page or a hand-run pilot with a few customers.", Usability: "Watch five target users try a clickable prototype.", Feasibility: "A one-week engineering spike on the hardest part.", Viability: "A short review with legal or finance, using real numbers." };
    var host = $("builder");
    host.innerHTML = '<div>' + A.fields.map(function (f, i) {
      var inner;
      if (f.type === "risk") {
        inner = '<div class="riskpick">' + RISKS.map(function (r) { return '<button type="button" data-risk="' + r[0] + '" aria-pressed="false"><i style="background:' + r[1] + '"></i>' + r[0] + "</button>"; }).join("") + "</div>" +
          '<input type="text" id="bf-' + f.id + '-note" placeholder="' + esc(f.placeholder) + '" style="margin-top:10px">';
      } else {
        inner = '<input type="text" id="bf-' + f.id + '" placeholder="' + esc(f.placeholder) + '">' +
          (f.chips ? '<div class="chips">' + f.chips.map(function (c) { return '<button type="button" class="chip-btn" data-fill="' + f.id + '">' + esc(c) + "</button>"; }).join("") + "</div>" : "");
      }
      return '<div class="bstep"><label for="bf-' + f.id + (f.type === "risk" ? "-note" : "") + '">' + (i + 1) + ". " + esc(f.label) + "</label>" + inner + "</div>";
    }).join("") + "</div>" +
      '<div class="card-out" aria-live="polite"><small>' + esc(A.title) + '</small><div class="big"></div><div class="rows"></div>' +
      '<div class="actions"><button type="button" class="btn light solid" id="copycard">Copy card</button><button type="button" class="btn light" id="clearcard">Clear</button><span class="copied" id="cardmsg"></span></div></div>';

    function val(id) { return (vals[id] || "").trim(); }
    function fill(tpl) {
      return esc(tpl).replace(/\{(\w+)\}/g, function (_, id) {
        var f = A.fields.filter(function (x) { return x.id === id; })[0], v = val(id);
        return '<em class="' + (v ? "filled" : "") + '">' + esc(v || (f ? f.blank : id)) + "</em>";
      });
    }
    function paintCard() {
      var card = host.querySelector(".card-out");
      card.querySelector(".big").innerHTML = fill(A.sentence);
      card.querySelector(".rows").innerHTML = (A.rows || []).map(function (r) { return '<div class="row"><b>' + esc(r.label) + ":</b> " + fill(r.text) + "</div>"; }).join("") +
        (A.fields.some(function (f) { return f.type === "risk"; }) ? '<div class="row"><b>Riskiest assumption:</b> ' + (vals.risk ? esc(vals.risk) + (val("risk_note") ? ": " + esc(val("risk_note")) : "") : '<em>not chosen yet</em>') + "</div>" +
          '<div class="row"><b>Cheapest test:</b> ' + (vals.risk ? esc(TESTS[vals.risk]) : "<em>pick a risk to see a suggestion</em>") + "</div>" : "");
      host.querySelectorAll("[data-risk]").forEach(function (b) { b.setAttribute("aria-pressed", b.dataset.risk === vals.risk); });
    }
    function save() { store.set(akey, vals); }
    A.fields.forEach(function (f) {
      var inp = $(f.type === "risk" ? "bf-" + f.id + "-note" : "bf-" + f.id), key = f.type === "risk" ? "risk_note" : f.id;
      if (vals[key]) inp.value = vals[key];
      inp.addEventListener("input", function () { vals[key] = inp.value; save(); paintCard(); });
    });
    host.querySelectorAll("[data-fill]").forEach(function (b) { b.onclick = function () { var inp = $("bf-" + b.dataset.fill); inp.value = b.textContent; vals[b.dataset.fill] = b.textContent; save(); paintCard(); }; });
    host.querySelectorAll("[data-risk]").forEach(function (b) { b.onclick = function () { vals.risk = b.dataset.risk; save(); paintCard(); }; });
    $("copycard").onclick = function () { copyText(A.title + "\n" + host.querySelector(".card-out .big").innerText + "\n" + host.querySelector(".card-out .rows").innerText, $("cardmsg")); };
    $("clearcard").onclick = function () { vals = {}; save(); host.querySelectorAll("input[type=text]").forEach(function (i) { i.value = ""; }); paintCard(); $("cardmsg").textContent = ""; };
    paintCard();
  }

  /* ---------- Teach: pick the best explanation, then write your own ---------- */
  var teachCfgEl = $("teach-config");
  if (teachCfgEl) {
    var T = JSON.parse(teachCfgEl.textContent), tkey = "pmgym-" + station + "-teach", saved = store.get(tkey) || {};
    $("teach-ui").innerHTML = '<div class="tbox"><h3>1. Which would you send?</h3><p class="tq">' + esc(T.ask) + '</p>' +
      '<div class="check stack" data-answer="' + T.best + '"><div class="opts">' + T.options.map(function (o) { return '<button type="button" class="opt">' + esc(o) + "</button>"; }).join("") + '</div>' +
      '<p class="cfb" data-ok="' + esc(T.ok) + '" data-no="' + esc(T.no) + '"></p></div></div>' +
      '<div class="tbox"><h3>2. Now say it your way</h3><label for="tw" class="tq">' + esc(T.prompt) + '</label>' +
      '<textarea id="tw" rows="5"></textarea><div class="counter" id="twc">0 / 280</div>' +
      '<ul class="ticks" id="ticks">' + T.checks.map(function (c) { return '<li data-k="' + esc(c.k) + '"><i></i>' + esc(c.label) + "</li>"; }).join("") + "</ul>" +
      '<p class="tnote">The checklist only looks for key words. It doesn’t grade your explanation.</p></div>';
    wireCheck($("teach-ui").querySelector(".check"));
    var tw = $("tw");
    function paintTeach() {
      var t = tw.value, n = t.length;
      $("twc").textContent = n + " / 280"; $("twc").className = "counter" + (n > 280 ? " over" : "");
      $("ticks").querySelectorAll("li").forEach(function (li) { li.classList.toggle("on", new RegExp(li.dataset.k, "i").test(t)); });
    }
    if (saved.t) tw.value = saved.t;
    tw.addEventListener("input", function () { store.set(tkey, { t: tw.value }); paintTeach(); });
    paintTeach();
  }

  /* ---------- Warm-up: predict, rate confidence, lock in ---------- */
  var wcfgEl = $("warmup-config"), wkey = "pmgym-" + station + "-predict", W = null, ws = null;
  if (wcfgEl) {
    W = JSON.parse(wcfgEl.textContent);
    ws = store.get(wkey) || { picks: {}, conf: {}, locked: false, reveal: false };
    var wroot = $("warmup-ui");
    var renderWarm = function () {
      var ready = W.questions.every(function (_, i) { return ws.picks[i] !== undefined && ws.conf[i]; });
      var h = W.questions.map(function (q, i) {
        var p = ws.picks[i];
        return '<div class="pq"><div class="qh"><span>Prediction ' + (i + 1) + " of " + W.questions.length + "</span>" + (ws.locked ? "<span>" + esc(ws.conf[i] || "") + "</span>" : "") + '</div><p class="q">' + esc(q.q) + '</p><div class="choices">' +
          q.o.map(function (o, k) {
            var cls = "choice"; if (ws.reveal) cls += k === q.a ? " right" : k === p ? " wrong" : "";
            return '<button type="button" class="' + cls + '" data-q="' + i + '" data-k="' + k + '" aria-pressed="' + (p === k) + '"' + (ws.locked ? " disabled" : "") + ">" + esc(o) + "</button>";
          }).join("") + "</div>" +
          (ws.locked ? (ws.reveal ? '<p class="why"><b>' + (p === q.a ? "You predicted it." : "Not this time.") + "</b> " + esc(q.why) + "</p>" : "") :
            '<div class="conf"><span>How sure are you?</span><div class="seg" role="group" aria-label="Confidence for prediction ' + (i + 1) + '">' + ["Guessing", "Fairly sure", "Certain"].map(function (c) {
              return '<button type="button" data-cq="' + i + '" data-c="' + c + '" aria-pressed="' + (ws.conf[i] === c) + '">' + c + "</button>";
            }).join("") + "</div></div>") + "</div>";
      }).join("");
      if (!ws.locked) h += '<div class="lockbar"><p>' + (ready ? "All set. Lock in your predictions and go to the lessons." : "Pick an answer and how sure you are for each prediction.") + '</p><button type="button" class="btn solid" id="wlock"' + (ready ? "" : " disabled") + ">Lock in and start lessons</button></div>";
      else if (!ws.reveal) h += '<div class="locked"><b>Predictions locked in.</b><p>The lessons answer all three. You’ll see how you did at the end of the station, next to your mastery check.</p><div class="row-actions"><a class="btn solid" href="#lessons">Go to the lessons</a><button type="button" class="btn" id="wreveal">Reveal answers now</button></div></div>';
      else h += '<div class="locked"><b>Answers revealed.</b><p>Your predictions will still be compared with your mastery check at the end.</p><button type="button" class="btn" id="wreset">Start the warm-up again</button></div>';
      wroot.innerHTML = h;
      wroot.querySelectorAll("[data-q]").forEach(function (b) { b.onclick = function () { ws.picks[+b.dataset.q] = +b.dataset.k; store.set(wkey, ws); renderWarm(); }; });
      wroot.querySelectorAll("[data-cq]").forEach(function (b) { b.onclick = function () { ws.conf[+b.dataset.cq] = b.dataset.c; store.set(wkey, ws); renderWarm(); }; });
      var l = $("wlock"); if (l) l.onclick = function () { ws.locked = true; store.set(wkey, ws); renderWarm(); var lt = $("lessons"); if (lt) lt.scrollIntoView({ behavior: "smooth" }); };
      var r = $("wreveal"); if (r) r.onclick = function () { ws.reveal = true; store.set(wkey, ws); renderWarm(); };
      var z = $("wreset"); if (z) z.onclick = function () { ws = { picks: {}, conf: {}, locked: false, reveal: false }; store.set(wkey, ws); renderWarm(); };
    };
    renderWarm();
  }
  function warmCompare(masteryRight, masteryOf) {
    if (!W || !ws || !ws.locked) return '<div class="compare"><div class="cmp"><small>Warm-up</small><p>Make your three predictions before the lessons next time, and you’ll see how much you moved.</p></div></div>';
    var n = W.questions.length, right = 0, sure = 0, sureRight = 0, guess = 0, guessRight = 0;
    W.questions.forEach(function (q, i) {
      var ok = ws.picks[i] === q.a; if (ok) right++;
      if (ws.conf[i] === "Guessing") { guess++; if (ok) guessRight++; } else { sure++; if (ok) sureRight++; }
    });
    var cal, calText;
    if (sure && sureRight / sure < 0.67) { cal = "A bit overconfident"; calText = "You were sure about " + sure + " and got " + sureRight + " of those right. Worth noticing."; }
    else if (guess && guessRight / guess >= 0.67) { cal = "A bit underconfident"; calText = "You guessed on " + guess + " and got " + guessRight + " right. You knew more than you thought."; }
    else { cal = "Well calibrated"; calText = "Your confidence matched your answers. That's a real skill."; }
    var delta = masteryRight / masteryOf - right / n;
    return '<div class="compare"><div class="cmp"><small>Warm-up, before the lessons</small><b>' + right + " of " + n + "</b><p>" + (right === n ? "You knew this already." : "Your first instincts.") + "</p></div>" +
      '<div class="cmp"><small>Mastery check, after</small><b>' + masteryRight + " of " + masteryOf + "</b><p>" + (delta > 0.15 ? "A clear jump. The lessons landed." : delta >= -0.15 ? "About the same as your instincts." : "Lower than your warm-up. Worth a second pass.") + "</p></div>" +
      '<div class="cmp cal"><small>Calibration</small><b>' + cal + "</b><p>" + calText + "</p></div></div>";
  }

  /* ---------- Mastery check: one question at a time ---------- */
  var mbox = $("mastery");
  if (mbox) {
    var qs = Array.prototype.slice.call(mbox.querySelectorAll(".check"));
    var picks = {}, cur = 0, retry = null;
    qs.forEach(function (c) { var q = c.querySelector(".cq"); if (q) q.textContent = q.textContent.replace(/^\d+\.\s*/, ""); });
    var top = document.createElement("div"); top.className = "mq-top"; mbox.insertBefore(top, mbox.firstChild);
    var navEl = document.createElement("div"); navEl.className = "mq-nav"; mbox.appendChild(navEl);
    var result = document.createElement("div"); result.className = "mq-result"; result.hidden = true; mbox.appendChild(result);
    if ($("mscore")) $("mscore").hidden = true;
    function order() { return retry || qs.map(function (_, i) { return i; }); }
    function dots() {
      return '<div class="dots" aria-hidden="true">' + qs.map(function (c, i) {
        var p = picks[i]; return '<i class="' + (p === undefined ? (i === cur ? "cur" : "") : (p ? "ok" : "no")) + '"></i>';
      }).join("") + "</div>";
    }
    function show() {
      var finished = cur === -1;
      qs.forEach(function (c, i) { c.hidden = finished || i !== cur; });
      result.hidden = !finished;
      top.innerHTML = '<span>' + (finished ? "Result" : "Question " + (cur + 1) + " of " + qs.length) + "</span>" + dots();
      navEl.innerHTML = "";
      if (finished) {
        var right = qs.filter(function (_, i) { return picks[i]; }).length, pct = right / qs.length, C = 2 * Math.PI * 50, pass = pct >= 0.8;
        result.innerHTML = '<svg class="ring" viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="50" fill="none" stroke="#E4E7EA" stroke-width="12"/><circle cx="60" cy="60" r="50" fill="none" stroke="' + (pass ? "#2E7D4F" : "#155E63") + '" stroke-width="12" stroke-linecap="round" stroke-dasharray="' + (C * pct).toFixed(1) + " " + C.toFixed(1) + '" transform="rotate(-90 60 60)"/><text x="60" y="68" text-anchor="middle" font-family="Barlow Condensed, sans-serif" font-weight="800" font-size="30" fill="#17202A">' + right + "/" + qs.length + "</text></svg>" +
          '<div><b>' + (pass ? "Station passed" : "Not yet") + '</b><p>' + (pass ? "These questions come back, mixed in, at later stations." : "Retry the ones you missed, or revisit those lessons first.") + "</p>" +
          (right < qs.length ? '<button type="button" class="btn solid" id="mretry">Retry the ones I missed</button>' : "") + "</div>" + warmCompare(right, qs.length);
        store.set("pmgym-" + station + "-mastery", { right: right, of: qs.length, at: new Date().toISOString() });
        var r = $("mretry");
        if (r) r.onclick = function () {
          retry = qs.map(function (_, i) { return i; }).filter(function (i) { return !picks[i]; });
          retry.forEach(function (i) { delete picks[i]; resetCheck(qs[i]); });
          cur = retry[0]; show(); var f = qs[cur].querySelector(".opt"); if (f) f.focus();
        };
        return;
      }
      if (picks[cur] !== undefined) {
        var o = order(), pos = o.indexOf(cur), nextI = -1;
        for (var k = pos + 1; k < o.length; k++) if (picks[o[k]] === undefined) { nextI = o[k]; break; }
        navEl.innerHTML = '<button type="button" class="btn solid" id="mnext">' + (nextI === -1 ? "See result" : "Next question") + "</button>";
        $("mnext").onclick = function () { cur = nextI; show(); var f = cur === -1 ? result.querySelector("button") : qs[cur].querySelector(".opt"); if (f) f.focus(); };
      }
    }
    function resetCheck(c) {
      delete c.dataset.picked; delete c.dataset.wired;
      c.querySelectorAll(".opt").forEach(function (b) { b.disabled = false; b.className = "opt"; });
      var fb = c.querySelector(".cfb"); if (fb) fb.innerHTML = "";
      wire(qs.indexOf(c));
    }
    function wire(i) { wireCheck(qs[i], function (ok) { picks[i] = ok; show(); var n = $("mnext"); if (n) n.focus(); }); }
    qs.forEach(function (_, i) { wire(i); });
    show();
  }

  /* ---------- Key takeaways: plates load when the section comes into view ---------- */
  var tk = document.querySelector(".takeaways");
  if (tk) {
    var colors = ["#E3A82B", "#2A9D8F", "#4C7BD9", "#6BA368", "#9B6BB0"];
    var items = tk.querySelectorAll("li");
    items.forEach(function (li, i) {
      li.style.transitionDelay = (0.15 + i * 0.15) + "s";
      var pl = document.createElement("span"); pl.className = "pl"; pl.style.background = colors[i % colors.length]; pl.setAttribute("aria-hidden", "true");
      var wrap = document.createElement("div"); while (li.firstChild) wrap.appendChild(li.firstChild);
      li.appendChild(pl); li.appendChild(wrap);
    });
    var h3 = tk.querySelector("h3"), head = document.createElement("div"); head.className = "tk-head";
    tk.insertBefore(head, h3); head.appendChild(h3);
    var plates = "";
    [[52, 6, 14, 68, 0], [154, 6, 14, 68, 0], [36, 12, 12, 56, 1], [172, 12, 12, 56, 1], [22, 18, 10, 44, 2], [188, 18, 10, 44, 2], [10, 24, 8, 32, 3], [202, 24, 8, 32, 3]].slice(0, items.length * 2).forEach(function (p, k) {
      plates += '<rect class="plate-anim" style="transition-delay:' + (0.1 + k * 0.12) + 's" x="' + p[0] + '" y="' + p[1] + '" width="' + p[2] + '" height="' + p[3] + '" rx="3" fill="' + colors[p[4]] + '"/>';
    });
    head.insertAdjacentHTML("beforeend", '<svg viewBox="0 0 220 80" aria-hidden="true"><rect x="0" y="37" width="220" height="6" rx="3" fill="#8A939D"/><rect x="70" y="30" width="6" height="20" rx="2" fill="#5F6975"/><rect x="144" y="30" width="6" height="20" rx="2" fill="#5F6975"/>' + plates + "</svg>");
    tk.insertAdjacentHTML("beforeend", '<div class="tk-actions"><button type="button" class="btn light solid" id="copytk">Copy takeaways</button><span class="copied" id="copiedtk"></span></div>');
    $("copytk").onclick = function () { copyText(Array.prototype.map.call(items, function (li, i) { return (i + 1) + ". " + li.innerText.replace(/\s+/g, " ").trim(); }).join("\n"), $("copiedtk")); };
    if ("IntersectionObserver" in window) {
      var tio = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { tk.classList.add("in"); tio.disconnect(); } }); }, { threshold: 0.3 });
      tio.observe(tk);
    } else tk.classList.add("in");
  }
})();
