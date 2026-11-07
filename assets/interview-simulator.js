// Interview Simulator: a PM Gym game for M5. Mount with InterviewSimulator(element)
(function () {
  var PERSONA = { name: "Lena", about: "Freelance UX designer in Cologne. Works with four clients at a time." };
  // Each turn: three questions. good: true earns points and an insight.
  var TURNS = [
    [
      { q: "Would you use an app that automates your invoices?", good: false, kind: "Pitch about the future", a: "Sure, that sounds useful! I'd probably try it." },
      { q: "Tell me about the last time you sent an invoice.", good: true, kind: "A specific past moment", a: "Last Friday. I made it in Word from an old template, exported a PDF and emailed it. Took about 20 minutes, mostly working out the hours.", ins: "Creating the invoice is quick. Working out the hours is the slow part." },
      { q: "Invoicing is really annoying, isn't it?", good: false, kind: "Leading", a: "Yeah, I guess. All admin is annoying." }
    ],
    [
      { q: "How do you keep track of the hours you work for each client?", good: true, kind: "Digging into her process", a: "Honestly, not as I go. At the end of the month I scroll through my calendar and Slack. Some weeks I forget things, so I'm sure I under-bill.", ins: "She under-bills when hours aren't captured. That's real money lost." },
      { q: "What features would you want in an invoicing tool?", good: false, kind: "Asking the user to design", a: "Hmm. Templates? Reminders? Maybe dark mode?" },
      { q: "How much would you pay for an invoicing tool?", good: false, kind: "Hypothetical price", a: "Maybe ten euros a month? Hard to say." }
    ],
    [
      { q: "So would automatic reminders help?", good: false, kind: "Leading", a: "Yes, definitely!" },
      { q: "What happens after you send an invoice?", good: true, kind: "Walking through the story", a: "I wait. Two clients always pay late. I chase them after a month, and it feels awkward every time.", ins: "Chasing late payers is slow and socially awkward." },
      { q: "Do you think other freelancers have the same problem?", good: false, kind: "Speculating about others", a: "Probably. My friends complain about it too." }
    ],
    [
      { q: "Our app does reminders and time tracking. Want to see it?", good: false, kind: "Pitching", a: "Sure, send me a link." },
      { q: "Is it a big problem for you?", good: false, kind: "Generic", a: "Kind of, yeah." },
      { q: "Have you tried any tools or tricks to make invoicing easier?", good: true, kind: "Past attempts", a: "I tried a free invoicing app last year and stopped after a month. It couldn't handle the German VAT details my clients need.", ins: "She already tried a tool and quit over VAT handling. Correct VAT is a must-have." }
    ],
    [
      { q: "Roughly what did forgotten hours and late payments cost you last quarter?", good: true, kind: "Putting a number on the past", a: "I checked once: about €1,400 in hours I never billed. And one invoice is still unpaid after 60 days.", ins: "About €1,400 in un-billed hours last quarter: lost hours hurt more than late payments." },
      { q: "Wouldn't it be great never to think about invoices again?", good: false, kind: "Leading", a: "Ha, of course." },
      { q: "What would your dream invoicing tool look like?", good: false, kind: "Asking the user to design", a: "Something simple and pretty, I suppose. Like the apps I design!" }
    ]
  ];
  var FINAL = {
    q: "Interview over. Which opportunity is best supported by what you heard?",
    o: ["Freelancers want nicer invoice templates", "Freelancers lose billable hours because time isn't captured as they work", "Freelancers want a dark-mode invoicing app", "Freelancers need a cheaper invoicing tool"],
    a: 1,
    w: "Her strongest evidence is about un-billed hours: a specific story, an attempted workaround, and a number. Templates, dark mode and price came only from questions that asked her to guess."
  };
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  window.InterviewSimulator = function (root) {
    var s;
    function reset() { s = { t: -1, log: [], insights: [], score: 0, fin: null }; }
    reset();
    function render() {
      var h = '<div class="rr">';
      if (s.t === -1) {
        h += '<div class="rr-intro"><div><b class="rr-big">One interview, five questions</b>' +
          '<p>You’re interviewing ' + PERSONA.name + ': ' + esc(PERSONA.about) + ' You want to learn about her invoicing, without pitching or leading her.</p>' +
          '<p>Each turn, pick your next question. Good questions unlock insights for your notebook. Weak ones get polite, useless answers. At the end, choose which opportunity the evidence supports.</p>' +
          '<button type="button" class="btn light solid" data-act="start">Start the interview</button></div></div>';
      } else {
        var done = s.t >= TURNS.length;
        h += '<div class="rr-top"><span>' + (done ? "Interview finished" : "Question " + (s.t + 1) + " of " + TURNS.length) + '</span><span>Score ' + s.score + '</span></div>' +
          '<div class="rr-play"><div class="rr-main">' +
          '<div class="is-chat" aria-live="polite">' + s.log.map(function (m) {
            return '<div class="is-q"><small>You</small>' + esc(m.q) + '</div><div class="is-a"><small>' + PERSONA.name + '</small>' + esc(m.a) +
              '</div><div class="is-tag ' + (m.good ? "good" : "weak") + '">' + (m.good ? "Good question: " : "Weak question: ") + esc(m.kind.toLowerCase()) + '</div>';
          }).join("") + '</div>';
        if (!done) {
          h += '<p class="rr-ask">Your next question:</p><div class="rr-opts">' +
            TURNS[s.t].map(function (o, k) { return '<button type="button" class="rr-opt" data-q="' + k + '">' + esc(o.q) + '</button>'; }).join("") + '</div>';
        } else if (s.fin === null) {
          h += '<p class="rr-ask">' + esc(FINAL.q) + '</p><div class="rr-opts">' +
            FINAL.o.map(function (o, k) { return '<button type="button" class="rr-opt" data-f="' + k + '">' + esc(o) + '</button>'; }).join("") + '</div>';
        } else {
          var good = s.log.filter(function (m) { return m.good; }).length;
          h += '<p class="rr-why"><b>' + (s.fin === FINAL.a ? "Right call." : "The evidence points elsewhere.") + '</b> ' + esc(FINAL.w) + '</p>' +
            '<b class="rr-big" style="margin-top:18px">' + s.score + ' / ' + (TURNS.length * 10 + 10) + '</b>' +
            '<p>' + good + ' of ' + TURNS.length + ' questions were about real, past behaviour. ' + (good === TURNS.length ? "Textbook interviewing." : "Every weak question cost you an insight you can't get back in this interview.") + '</p>' +
            '<button type="button" class="btn light solid" data-act="again">Interview again</button>';
        }
        h += '</div><div class="is-notes"><b>Your notebook</b>' +
          (s.insights.length ? '<ol>' + s.insights.map(function (i) { return '<li>' + esc(i) + '</li>'; }).join("") + '</ol>' : '<p>No insights yet. Ask about specific things she has done.</p>') +
          '</div></div>';
      }
      root.innerHTML = h + '</div>';
      wire();
    }
    function wire() {
      root.querySelectorAll("[data-act]").forEach(function (b) {
        b.onclick = function () { if (b.dataset.act === "again") reset(); s.t = 0; render(); var f = root.querySelector(".rr-opt"); if (f) f.focus(); };
      });
      root.querySelectorAll("[data-q]").forEach(function (b) {
        b.onclick = function () {
          var o = TURNS[s.t][+b.dataset.q];
          s.log.push(o); if (o.good) { s.score += 10; s.insights.push(o.ins); }
          s.t++; render(); var f = root.querySelector(".rr-opt, [data-act]"); if (f) f.focus();
        };
      });
      root.querySelectorAll("[data-f]").forEach(function (b) {
        b.onclick = function () { s.fin = +b.dataset.f; if (s.fin === FINAL.a) s.score += 10; render(); var f = root.querySelector("[data-act]"); if (f) f.focus(); };
      });
    }
    render();
  };
})();
