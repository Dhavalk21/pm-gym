// AI or Not?: a PM Gym game for AI-1. Mount with AIOrNot(element)
(function () {
  var FITS = [
    { id: "llm", name: "Language model" },
    { id: "human", name: "Language model, human checks" },
    { id: "rules", name: "Rules or regular code" }
  ];
  var NEEDS = [
    { id: "prompt", name: "A clear prompt with examples" },
    { id: "rag", name: "Our own documents, retrieved (RAG)" },
    { id: "tools", name: "Live data through tools" }
  ];
  var TASKS = [
    { t: "Group 2,000 support tickets a week into themes for the product team.", f: "llm", n: "prompt",
      w: "Fuzzy language, high volume, and an occasional mislabel doesn't hurt much. A clear prompt with a few labelled examples does the job." },
    { t: "Calculate VAT on every invoice.", f: "rules", n: null,
      w: "Exact, rule-based and legally binding. A language model can get arithmetic and rates wrong; ordinary code never should." },
    { t: "Answer employees' questions about the company's own HR policies.", f: "llm", n: "rag",
      w: "The model has never seen your policies. Retrieve the relevant policy text and let it answer from that, with the source linked." },
    { t: "Draft replies to customer emails, which agents review and edit before sending.", f: "human", n: "rag",
      w: "Drafting is a great fit, but replies go to customers, so a person stays in the loop. Grounding drafts in your help-centre articles keeps them accurate." },
    { t: "Check that a new password has at least 12 characters and a number.", f: "rules", n: null,
      w: "A one-line rule. Using a model here adds cost, delay and the chance of a wrong answer, for nothing." },
    { t: "Tell a customer in plain words where their parcel is right now.", f: "llm", n: "tools",
      w: "The wording suits a model, but the facts change by the minute. It must look up the live tracking data through a tool call, not guess." },
    { t: "Automatically approve or reject consumer loan applications.", f: "rules", n: null,
      w: "High stakes and regulated: decisions must be consistent and explainable. Under the EU AI Act, credit scoring of people counts as high-risk. Use well-governed models and rules, with human review, not a chatbot." },
    { t: "Suggest a category for each of a marketplace's one million product listings from the title and photo.", f: "llm", n: "prompt",
      w: "Messy, high-volume, and a wrong category is easy to fix. A multimodal model with a clear category list and examples fits well." },
    { t: "Translate the app's interface into 12 languages before a release.", f: "human", n: "prompt",
      w: "Models translate well, but tone, length and terminology matter in a product. Give it a glossary and context, then have a native speaker review." },
    { t: "Send each incoming support email to the right team: billing, technical or sales.", f: "llm", n: "prompt",
      w: "Classic classification of messy text. A prompt with clear definitions and examples works; route the uncertain ones to a person." }
  ];
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function nm(list, id) { return list.filter(function (x) { return x.id === id; })[0].name; }

  window.AIOrNot = function (root) {
    var s;
    function reset() { s = { i: -1, f: null, n: null, score: 0, max: 0 }; }
    reset();
    function render() {
      var h = '<div class="rr">';
      if (s.i === -1) {
        h += '<div class="rr-intro"><div><b class="rr-big">Ten tasks, about 10 minutes</b>' +
          '<p>For each product task, decide: a language model on its own, a language model with a person checking, or plain rules and code? If a model fits, choose what it needs to do the job well.</p>' +
          '<button type="button" class="btn light solid" data-act="start">Start</button></div></div>';
      } else if (s.i < TASKS.length) {
        var c = TASKS[s.i], needsStep = s.f !== null && s.f !== "rules", finished = s.f !== null && (s.f === "rules" || s.n !== null);
        h += '<div class="rr-top"><span>Task ' + (s.i + 1) + ' of ' + TASKS.length + '</span><span>Score ' + s.score + '</span></div>' +
          '<div class="rr-main" style="max-width:860px"><p class="rr-idea">' + esc(c.t) + '</p><p class="rr-ask">1. What should handle it?</p><div class="rr-opts rr-4">' +
          FITS.map(function (o) {
            var cls = "rr-opt"; if (s.f !== null) cls += o.id === c.f ? " ok" : o.id === s.f ? " no" : " dim";
            return '<button type="button" class="' + cls + '" data-f="' + o.id + '"' + (s.f !== null ? " disabled" : "") + '>' + o.name + '</button>';
          }).join("") + '</div>';
        if (needsStep) {
          h += '<p class="rr-ask">2. What does the model need to do it well?</p><div class="rr-opts rr-4">' +
            NEEDS.map(function (o) {
              var cls = "rr-opt"; if (s.n !== null) cls += o.id === c.n ? " ok" : o.id === s.n ? " no" : " dim";
              return '<button type="button" class="' + cls + '" data-n="' + o.id + '"' + (s.n !== null ? " disabled" : "") + '>' + o.name + '</button>';
            }).join("") + '</div>';
        }
        if (finished) {
          h += '<p class="rr-why"><b>' + nm(FITS, c.f) + (c.n ? ", with " + nm(NEEDS, c.n).charAt(0).toLowerCase() + nm(NEEDS, c.n).slice(1) : "") + '.</b> ' + esc(c.w) + '</p>' +
            '<button type="button" class="btn light solid" data-act="next">' + (s.i === TASKS.length - 1 ? "See my score" : "Next task") + '</button>';
        }
        h += '</div>';
      } else {
        h += '<div class="rr-main" style="max-width:820px"><b class="rr-big">' + s.score + ' / ' + s.max + '</b>' +
          '<p>The question to keep asking: what does a wrong answer cost here, and who catches it? Use models where language is messy and mistakes are cheap or checked; use code where the answer must be exact.</p>' +
          '<button type="button" class="btn light solid" data-act="again">Play again</button></div>';
      }
      root.innerHTML = h + '</div>';
      root.querySelectorAll("[data-act]").forEach(function (b) {
        b.onclick = function () { var a = b.dataset.act; if (a === "again") reset(); if (a === "next") { s.i++; s.f = null; s.n = null; } else s.i = 0; render(); var f = root.querySelector(".rr-opt, [data-act]"); if (f) f.focus(); };
      });
      root.querySelectorAll("[data-f]").forEach(function (b) {
        b.onclick = function () {
          var c = TASKS[s.i]; s.f = b.dataset.f; s.max += 10; if (s.f === c.f) s.score += 10;
          if (s.f !== "rules" && c.n) s.max += 10;
          render(); var f = root.querySelector("[data-n]:not([disabled]), [data-act]"); if (f) f.focus();
        };
      });
      root.querySelectorAll("[data-n]").forEach(function (b) {
        b.onclick = function () { var c = TASKS[s.i]; s.n = b.dataset.n; if (c.n && s.n === c.n) s.score += 10; render(); root.querySelector("[data-act]").focus(); };
      });
    }
    render();
  };
})();
