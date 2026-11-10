// Metric Detective: a PM Gym game for M10. Mount with MetricDetective(element)
(function () {
  // Each case: an alarm, a set of data cuts (each reveals a small chart and a hint), and four possible diagnoses.
  // Rows: [label, value shown, bar width 0-100, highlight?]
  var CASES = [
    { title: "Sign-ups down 18%", alarm: "The dashboard shows sign-ups down 18% since Monday. The team shipped iOS app version 5.2 on Monday. Your manager wants to roll back the new onboarding design.",
      cuts: [
        { k: "Sign-ups by platform", rows: [["Web", "-1%", 50], ["Android", "+2%", 52], ["iOS", "-61%", 18, 1]], hint: "The whole drop is on iOS. Web and Android are flat." },
        { k: "Sign-ups by app version (iOS)", rows: [["5.1", "1,420 a day", 70], ["5.2", "12 a day", 2, 1]], hint: "Version 5.2 barely reports any sign-ups at all, even though most iOS users have updated." },
        { k: "New accounts in the database", rows: [["Last week", "4,980", 80], ["This week", "4,910", 79]], hint: "The database says new accounts are flat. People are signing up; the dashboard isn't counting them." },
        { k: "Sign-ups by country", rows: [["Germany", "-18%", 40, 1], ["France", "-17%", 38, 1], ["Spain", "-19%", 36, 1]], hint: "Every country is down by the same amount. That points to something technical, not market-specific." }
      ],
      dx: [
        { t: "A tracking bug: iOS 5.2 stopped sending the sign-up event", ok: true },
        { t: "iOS users dislike the new onboarding design" },
        { t: "A competitor launched a big campaign" },
        { t: "Normal seasonal dip" }
      ],
      w: "Real sign-ups never dropped. Version 5.2 stopped sending the sign_up event, so the dashboard missed them. Rolling back the design would have changed nothing. Always check that the data is real before you check the product." },
    { title: "Checkout conversion down", alarm: "Checkout conversion fell from 3.1% to 2.5% this week. Nothing was released. The marketing team mentions a video about the brand went viral on social media.",
      cuts: [
        { k: "Visitors by traffic source", rows: [["Search", "41% of visits", 41], ["Direct", "24% of visits", 24], ["Social", "35% of visits (was 8%)", 35, 1]], hint: "Social traffic jumped from 8% to 35% of all visits." },
        { k: "Conversion by visitor type", rows: [["Returning visitors", "5.8% (was 5.8%)", 58], ["New visitors", "1.4% (was 1.4%)", 14]], hint: "Neither group converts worse than before. The mix changed, not the rate." },
        { k: "Total orders", rows: [["Last week", "9,300", 70], ["This week", "10,400", 78]], hint: "Orders are actually up 12%." },
        { k: "Page load time", rows: [["Last week", "1.9 s", 38], ["This week", "1.9 s", 38]], hint: "No change in speed." }
      ],
      dx: [
        { t: "Mix shift: lots of new, curious visitors from social. Nothing broke.", ok: true },
        { t: "The checkout page got worse" },
        { t: "Prices are too high" },
        { t: "The site got slower" }
      ],
      w: "Every group converts exactly as before, and orders are up. The average fell only because a flood of new visitors, who always convert less, joined the mix. Before you fix a rate, check whether the mix of people behind it changed." },
    { title: "Retention drop for the March sign-ups", alarm: "Week-four retention for people who signed up in March is 35%. For January and February it was 42%. Marketing ran a 50%-off campaign in March.",
      cuts: [
        { k: "March retention by acquisition channel", rows: [["Organic and referral", "43%", 43], ["Search ads", "41%", 41], ["50%-off campaign", "24%", 24, 1]], hint: "Only people from the discount campaign stick around less. Everyone else is normal." },
        { k: "Week-four retention by sign-up month", rows: [["January", "42%", 42], ["February", "41%", 41], ["March, without campaign", "42%", 42], ["March, campaign only", "24%", 24, 1]], hint: "Take the campaign out and March looks like every other month." },
        { k: "Product releases in March", rows: [["Releases", "2 small bug fixes", 10]], hint: "Nothing that would change the experience." },
        { k: "Retention by platform", rows: [["Web", "36%", 36], ["iOS", "35%", 35], ["Android", "34%", 34]], hint: "Every platform shows the same small dip, so it's not a platform problem." }
      ],
      dx: [
        { t: "The discount campaign brought in people who weren't a good fit", ok: true },
        { t: "The product got worse in March" },
        { t: "A tracking error in the retention report" },
        { t: "Android users are churning" }
      ],
      w: "Cohort analysis by channel shows it: organic users retain as well as ever, while bargain-hunters from the 50%-off campaign leave. The product is fine; the campaign is the question. Compare cohorts, not just averages." },
    { title: "Delivery ratings fall in Berlin", alarm: "The average delivery rating in Berlin fell from 4.6 to 4.3 stars over two weeks. Ratings in other cities are steady. It has rained a lot this month.",
      cuts: [
        { k: "Rating by Berlin district", rows: [["Mitte", "4.6", 92], ["Prenzlauer Berg", "4.6", 92], ["Kreuzberg", "3.6", 72, 1], ["Charlottenburg", "4.5", 90]], hint: "The drop is almost all in one district: Kreuzberg." },
        { k: "Kreuzberg delivery time by time of day", rows: [["Lunch", "28 min", 47], ["Afternoon", "26 min", 43], ["Dinner rush", "47 min (was 33)", 78, 1]], hint: "Dinner deliveries in Kreuzberg got 14 minutes slower." },
        { k: "Recent changes in Berlin", rows: [["Courier batching pilot", "Kreuzberg only, started two weeks ago", 60, 1]], hint: "A pilot lets couriers carry three orders at once, in Kreuzberg only." },
        { k: "Rating by weather", rows: [["Dry days", "4.3", 86], ["Rainy days", "4.3", 86]], hint: "Rain makes no difference to ratings." }
      ],
      dx: [
        { t: "The batching pilot slows down dinner deliveries in Kreuzberg", ok: true },
        { t: "The rainy weather" },
        { t: "Worse food from Kreuzberg restaurants" },
        { t: "Customers rate more harshly in winter" }
      ],
      w: "The drop is in one district, at one time of day, and it started with a change made only there. Rain would affect every district. Narrow down where and when, then look at what changed at that place and time." }
  ];
  var CUTS_FREE = 2, MAXC = 40;
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function shuffle(a, seed) { var r = a.slice(), x = seed; for (var i = r.length - 1; i > 0; i--) { x = (x * 9301 + 49297) % 233280; var j = Math.floor(x / 233280 * (i + 1)); var t = r[i]; r[i] = r[j]; r[j] = t; } return r; }

  window.MetricDetective = function (root) {
    var s;
    function reset() { s = { c: -1, open: [], pick: null, score: 0, round: 0 }; }
    reset();
    function chart(cut) {
      return '<div class="md-chart"><b>' + esc(cut.k) + '</b>' + cut.rows.map(function (r) {
        return '<div class="md-row' + (r[3] ? " hi" : "") + '"><span class="md-l">' + esc(r[0]) + '</span><span class="md-bar"><i style="width:' + Math.max(2, r[2]) + '%"></i></span><span class="md-v">' + esc(r[1]) + '</span></div>';
      }).join("") + '<p>' + esc(cut.hint) + '</p></div>';
    }
    function render() {
      var h = '<div class="rr">';
      if (s.c === -1) {
        h += '<div class="rr-intro"><div><b class="rr-big">Four cases, about 10 minutes</b><p>A number on the dashboard moved. Pick which data to look at, then name the cause. Each correct diagnosis is worth 30 points, plus 10 if you solve it with two cuts of data or fewer. Good analysts find the cause without looking at everything.</p><button type="button" class="btn light solid" data-act="start">Start</button></div></div>';
      } else if (s.c < CASES.length) {
        var C = CASES[s.c], solved = s.pick !== null;
        h += '<div class="rr-top"><span>Case ' + (s.c + 1) + ' of ' + CASES.length + ': ' + esc(C.title) + '</span><span>Score ' + s.score + ' / ' + CASES.length * MAXC + '</span></div>' +
          '<div class="md-alarm"><small>The alarm</small><p>' + esc(C.alarm) + '</p></div>' +
          '<div class="md-grid"><div><p class="rr-ask">Look at the data <span class="md-count">' + s.open.length + ' cut' + (s.open.length === 1 ? "" : "s") + ' used' + (s.open.length <= CUTS_FREE ? ", bonus still on" : ", no bonus") + '</span></p><div class="rr-opts">' +
          C.cuts.map(function (cut, i) {
            var o = s.open.indexOf(i) > -1;
            return '<button type="button" class="rr-opt' + (o ? " seen" : "") + '" data-cut="' + i + '"' + (o || solved ? " disabled" : "") + '>' + (o ? "Opened: " : "") + esc(cut.k) + '</button>';
          }).join("") + '</div>' + s.open.map(function (i) { return chart(C.cuts[i]); }).join("") + '</div>' +
          '<div><p class="rr-ask">What&rsquo;s the cause?</p><div class="rr-opts">' +
          shuffle(C.dx.map(function (d, i) { return i; }), s.c + 7).map(function (i) {
            var d = C.dx[i], cls = "rr-opt";
            if (solved) cls += d.ok ? " ok" : i === s.pick ? " no" : " dim";
            return '<button type="button" class="' + cls + '" data-dx="' + i + '"' + (solved || !s.open.length ? " disabled" : "") + '>' + esc(d.t) + '</button>';
          }).join("") + '</div>' + (!s.open.length ? '<p class="md-note">Open at least one cut of data first.</p>' : "");
        if (solved) {
          var right = C.dx[s.pick].ok;
          h += '<p class="rr-why"><b>' + (right ? "Solved. +30" + (s.open.length <= CUTS_FREE ? " and +10 for using only " + s.open.length + (s.open.length === 1 ? " cut." : " cuts.") : ".") : "Not this time.") + '</b> ' + esc(C.w) + '</p>' +
            '<button type="button" class="btn light solid" data-act="next">' + (s.c === CASES.length - 1 ? "See my score" : "Next case") + '</button>';
        }
        h += '</div></div>';
      } else {
        h += '<div class="rr-main" style="max-width:820px"><b class="rr-big">' + s.score + ' / ' + CASES.length * MAXC + '</b><p>The order that solves most cases: first check the data is real, then find when it started and what changed then, then narrow down where it happens, and finally ask whether the rate changed or just the mix of people.</p><button type="button" class="btn light solid" data-act="again">Play again</button></div>';
      }
      root.innerHTML = h + '</div>';
      root.querySelectorAll("[data-act]").forEach(function (b) {
        b.onclick = function () { var a = b.dataset.act; if (a === "again") reset(); if (a === "next") { s.c++; s.open = []; s.pick = null; } else s.c = 0; render(); var f = root.querySelector(".rr-opt:not([disabled]), [data-act]"); if (f) f.focus(); };
      });
      root.querySelectorAll("[data-cut]").forEach(function (b) {
        b.onclick = function () { s.open.push(+b.dataset.cut); render(); var f = root.querySelector("[data-cut]:not([disabled]), [data-dx]:not([disabled])"); if (f) f.focus(); };
      });
      root.querySelectorAll("[data-dx]").forEach(function (b) {
        b.onclick = function () { s.pick = +b.dataset.dx; if (CASES[s.c].dx[s.pick].ok) s.score += 30 + (s.open.length <= CUTS_FREE ? 10 : 0); render(); root.querySelector("[data-act]").focus(); };
      });
    }
    render();
  };
})();
