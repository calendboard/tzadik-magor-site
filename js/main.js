/* ============================================================
   הצדיק מעג׳ור — סקריפט ראשי
   אנימציות, תפריט נייד, מונים, ספירה לאחור וטפסים
   ============================================================ */
(function () {
  "use strict";

  /* ---------- שנה נוכחית בפוטר ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- כותרת דביקה בגלילה ---------- */
  var header = document.getElementById("siteHeader");
  function onScroll() {
    if (!header) return;
    header.classList.toggle("scrolled", window.scrollY > 40);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- תפריט נייד ---------- */
  var toggle = document.getElementById("navToggle");
  var nav = document.getElementById("mainNav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.classList.toggle("open", open);
      toggle.setAttribute("aria-expanded", String(open));
    });
    nav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        nav.classList.remove("open");
        toggle.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------- אנימציית כניסה לאלמנטים ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- מונים (ספירה כלפי מעלה) ---------- */
  function animateCount(el) {
    var target = parseInt(el.getAttribute("data-count"), 10) || 0;
    var dur = 1800, start = null;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      el.textContent = Math.floor(eased * target).toLocaleString("he-IL");
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = target.toLocaleString("he-IL");
    }
    requestAnimationFrame(step);
  }
  var counters = document.querySelectorAll(".stat-num");
  if ("IntersectionObserver" in window && counters.length) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { animateCount(e.target); cio.unobserve(e.target); }
      });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { cio.observe(el); });
  } else {
    counters.forEach(animateCount);
  }

  /* ---------- חלקיקי אור ב-HERO ---------- */
  var particles = document.getElementById("heroParticles");
  if (particles && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    var count = window.innerWidth < 600 ? 16 : 32;
    for (var i = 0; i < count; i++) {
      var p = document.createElement("i");
      p.style.left = Math.random() * 100 + "%";
      p.style.animationDuration = (7 + Math.random() * 9) + "s";
      p.style.animationDelay = (-Math.random() * 12) + "s";
      p.style.setProperty("--c", (0.7 + Math.random() * 0.9).toFixed(2));
      particles.appendChild(p);
    }
  }

  /* ---------- ספירה לאחור להילולא (סקשן בדף הבית + באנר צף בכל הדפים) ---------- */
  var HILULA_TARGET = "2026-07-05T19:30:00"; // ליל כ״א בתמוז תשפ״ו
  function pad2(n) { return String(n).padStart(2, "0"); }
  function setupCountdown(root) {
    if (!root) return;
    var target = new Date(root.getAttribute("data-date") || HILULA_TARGET).getTime();
    var elD = root.querySelector('[data-cd="days"]'),
        elH = root.querySelector('[data-cd="hours"]'),
        elM = root.querySelector('[data-cd="mins"]'),
        elS = root.querySelector('[data-cd="secs"]');
    function tick() {
      var diff = target - Date.now();
      if (diff <= 0) {
        diff = 0;
        // לאחר ההילולא — מסתירים את הבאנר הצף כדי לא להציג אפסים
        var bar = document.getElementById("hilulaBar");
        if (root.id === "floatCountdown" && bar) bar.classList.add("hidden");
      }
      if (elD) elD.textContent = pad2(Math.floor(diff / 86400000));
      if (elH) elH.textContent = pad2(Math.floor((diff % 86400000) / 3600000));
      if (elM) elM.textContent = pad2(Math.floor((diff % 3600000) / 60000));
      if (elS) elS.textContent = pad2(Math.floor((diff % 60000) / 1000));
    }
    tick();
    setInterval(tick, 1000);
  }
  setupCountdown(document.getElementById("countdown"));
  setupCountdown(document.getElementById("floatCountdown"));

  /* ---------- סגירת הבאנר הצף (נשמר לזמן הביקור) ---------- */
  var hilulaBar = document.getElementById("hilulaBar");
  var hilulaClose = document.getElementById("hilulaClose");
  try {
    if (hilulaBar && sessionStorage.getItem("hilulaBarClosed") === "1") hilulaBar.classList.add("hidden");
  } catch (e) {}
  if (hilulaClose) {
    hilulaClose.addEventListener("click", function () {
      if (hilulaBar) hilulaBar.classList.add("hidden");
      try { sessionStorage.setItem("hilulaBarClosed", "1"); } catch (e) {}
    });
  }

  /* ---------- טופס יצירת קשר ---------- */
  var form = document.getElementById("contactForm");
  var status = document.getElementById("contactStatus");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = form.querySelector("#cName");
      var phone = form.querySelector("#cPhone");
      if (!name.value.trim() || !phone.value.trim()) {
        if (status) { status.textContent = "נא למלא שם וטלפון 🙏"; status.style.color = "#f0b8b8"; }
        return;
      }
      // ====== נקודת חיבור: כאן מחברים שליחה אמיתית (אימייל / וואטסאפ / שרת) ======
      if (status) {
        status.style.color = "";
        status.textContent = "תודה! פנייתכם נשלחה ונחזור אליכם בהקדם. שתזכו לישועות! 🕯️";
      }
      form.reset();
    });
  }

  /* ---------- גלילה רכה לקישורי עוגן ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var id = a.getAttribute("href");
      if (id.length < 2) return;
      var el = document.querySelector(id);
      if (el) {
        e.preventDefault();
        var y = el.getBoundingClientRect().top + window.scrollY - 70;
        window.scrollTo({ top: y, behavior: "smooth" });
      }
    });
  });

  /* ---------- לייטבוקס לגלריה ---------- */
  var galLinks = Array.prototype.slice.call(document.querySelectorAll("a.gallery-item"));
  if (galLinks.length) {
    var lbItems = galLinks.map(function (a) {
      var img = a.querySelector("img"), cap = a.querySelector(".gallery-cap");
      return { src: a.getAttribute("href"), alt: (img && img.alt) || "", cap: (cap && cap.textContent) || "" };
    });
    var lb = document.createElement("div");
    lb.className = "lightbox";
    lb.innerHTML =
      '<button class="lb-close" aria-label="סגירה">×</button>' +
      '<button class="lb-nav lb-prev" aria-label="הקודם">‹</button>' +
      '<figure class="lb-fig"><img alt="" /><figcaption></figcaption></figure>' +
      '<button class="lb-nav lb-next" aria-label="הבא">›</button>';
    document.body.appendChild(lb);
    var lbImg = lb.querySelector("img"), lbCap = lb.querySelector("figcaption"), idx = 0;
    function show(i) { idx = (i + lbItems.length) % lbItems.length; lbImg.src = lbItems[idx].src; lbImg.alt = lbItems[idx].alt; lbCap.textContent = lbItems[idx].cap; }
    function openLb(i) { show(i); lb.classList.add("open"); document.body.style.overflow = "hidden"; }
    function closeLb() { lb.classList.remove("open"); document.body.style.overflow = ""; }
    galLinks.forEach(function (a, i) { a.addEventListener("click", function (e) { e.preventDefault(); openLb(i); }); });
    lb.querySelector(".lb-close").addEventListener("click", closeLb);
    lb.querySelector(".lb-next").addEventListener("click", function (e) { e.stopPropagation(); show(idx + 1); });
    lb.querySelector(".lb-prev").addEventListener("click", function (e) { e.stopPropagation(); show(idx - 1); });
    lb.addEventListener("click", function (e) { if (e.target === lb || e.target.classList.contains("lb-fig")) closeLb(); });
    document.addEventListener("keydown", function (e) {
      if (!lb.classList.contains("open")) return;
      if (e.key === "Escape") closeLb();
      else if (e.key === "ArrowRight") show(idx - 1);
      else if (e.key === "ArrowLeft") show(idx + 1);
    });
  }

  /* ---------- שיתוף בוואטסאפ (כתובת חיה לפי הדומיין) ---------- */
  var waShare = document.querySelectorAll(".wa-share");
  if (waShare.length) {
    var base = location.origin + location.pathname.replace(/[^/]*$/, "");
    var msg = "בזכות הצדיק מעג׳ור — רבי יצחק גברא זצ״ל 🕯️ ישועות, סגולות והדלקת נר נשמה: " + base;
    var href = "https://wa.me/?text=" + encodeURIComponent(msg);
    Array.prototype.forEach.call(waShare, function (el) { el.setAttribute("href", href); el.setAttribute("target", "_blank"); el.setAttribute("rel", "noopener"); });
  }

  /* ---------- כפתור "חזרה למעלה" ---------- */
  var toTop = document.createElement("button");
  toTop.className = "to-top"; toTop.id = "toTop"; toTop.type = "button";
  toTop.setAttribute("aria-label", "חזרה למעלה");
  toTop.innerHTML = "↑";
  document.body.appendChild(toTop);
  window.addEventListener("scroll", function () {
    toTop.classList.toggle("show", window.scrollY > 560);
  }, { passive: true });
  toTop.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  /* ---------- כדורי ישועה צפים + מודאל סיפור מלא ---------- */
  var yshTrack = document.getElementById("yshTrack");
  if (yshTrack) {
    var STORIES = [
      { tag: "גילוי הציון", img: "assets/hilula/ziyon-night.jpg",
        title: "החלום שגילה את הציון",
        sum: "זקנה חלמה — ונתגלה מקום הקבר",
        full: "במשך שנים לא ידעו היכן טמון הצדיק. אישה זקנה שגרה סמוך לעץ החרוב חלמה חלום, ובו נגלה אליה רבי יצחק גברא ואמר לה: „שמי רבי יצחק גברא, אני קבור תחת עץ החרוב הסמוך לביתך… למה בני אינם באים אליי?”. הוא ביקש ממנה להעביר את הדברים לשלושה רבנים — וכך נתגלה מקום הציון הקדוש, ומאז פוקדים אותו רבים.",
        source: "מקור: ״שחרית״, עמ׳ 18 · מסורת מקומית" },
      { tag: "ישועה", img: "assets/hilula/candles.jpg",
        title: "ארבעה נסעו — וכולם נושעו",
        sum: "אברך, חולה, מובטל ורווק — כולם נושעו",
        full: "מסופר על נסיעה משותפת לציון של ארבעה אנשים: אברך שלא נפקד בילדים, נער שחלה במחלה קשה, בחור שחיפש עבודה, ורווק מבוגר. כל אחד מהם פרש את משאלתו על הציון. לפי הסיפור — האברך נפקד בילדים, הנער החלים, מחפש העבודה התקבל לעבודה טובה, והרווק התארס בליל ההילולה עצמו. ארבעתם ראו ישועה.",
        source: "מקור: ״שחרית״, עמ׳ 18" },
      { tag: "רפואה", img: "assets/segulot/refua.jpg",
        title: "המום שבלב — שנעלם",
        sum: "התפלל על נכדו — והניתוח התבטל",
        full: "נהג מונית שהסיע נוסעים לציון התפלל שם על נכדו הקטן, שעמד לפני ניתוח לב. בעודו יוצא מן הציון קיבל טלפון מבני המשפחה: הבעיה „נפתרה מאליה”, והרופאים הודיעו שאין עוד צורך בניתוח.",
        source: "מקור: ״שחרית״, עמ׳ 18" },
      { tag: "שלום בית", img: "assets/hilula/candle-lighting.jpg",
        title: "שלום בית אחרי שבע שנים",
        sum: "התפללה בבכי — ולמחרת צלצלה הבת",
        full: "אם התפללה בבכי על הציון שיחזור השלום בינה לבין בתה, לאחר נתק של שבע שנים. למחרת בבוקר צלצלה הבת מחוץ לארץ ואמרה: „אמא, התגעגעתי אלייך”. הסכסוך הישן הוסדר, והשלום שב לבית.",
        source: "מקור: ״שחרית״, עמ׳ 18" },
      { tag: "זיווג", img: "assets/segulot/zivug.jpg",
        title: "הזיווג שנפתח",
        sum: "בחור התקשה בשידוך — וראה ישועה",
        full: "בחור שהתקשה שנים למצוא את זיווגו השתטח על הציון וביקש ישועה. סמוך לאחר מכן נפתח שידוכו ומצא את בת זוגו. סיפורי זיווג רבים נקשרים סביב הציון, ורבים מבקשים עליו לזיווג הגון.",
        source: "מקור: ״אביר יעקב״ · מסורת" },
      { tag: "שמירה", img: "assets/segulot/shmira.jpg",
        title: "לבדו מול השודדים",
        sum: "כל הכפר ברח — והוא יצא לבדו",
        full: "מסופר שכאשר באו שודדים אל כפר עג׳ור, נמלטו כל התושבים והסתתרו. רבי יצחק לבדו יצא כנגדם ועמד מולם, עד שהשודדים נסוגו ונמלטו מן הכפר. כוח קדושתו הגן על כל בני המקום.",
        source: "מקור: ״שחרית״, עמ׳ 16 · מסורת משפחתית" },
      { tag: "הצלה", img: "assets/hilula/road.jpg",
        title: "נפל מהגמל — ונמצא לומד",
        sum: "הגמל התרסק בוואדי — והוא יושב כרגיל",
        full: "בעת מסע על גבי גמל נפל הגמל אל תוך ואדי עמוק. כשירדו לחפש, מצאו את חלקי הגמל מפוזרים — ואת רבי יצחק יושב בשלום בתחתית הוואדי ולומד כדרכו, כאילו לא אירע דבר.",
        source: "מקור: ערוץ 2000, בשם הרב שמעון פוקס" },
      { tag: "נבואה", img: "assets/hilula/grounds.jpg",
        title: "גשם בתמוז — כאות",
        sum: "ניבא שירד גשם בקבורתו — וכך היה",
        full: "רבי יצחק ביקש להיקבר תחת עץ החרוב שמול ביתו, ואמר שזה יהיה הסימן. עוד הוסיף וניבא שייקבר בערב שבת, ושביום קבורתו — אף שהוא בתקופת תמוז שאין בה גשמים — ירד גשם. וכך אכן היה: בשעת ההלוויה ירדו גשם וזלעפות, וקוימו דבריו.",
        source: "מקור: ״אביר יעקב״ · JDN · מסורת משפחתית" },
      { tag: "קדושת המקום", img: "assets/hilula/grounds-2.jpg",
        title: "הטרקטור שלא הצליח",
        sum: "ניסו להזיז את הציון — ולא עלתה בידם",
        full: "לאורך השנים נעשו ניסיונות לפנות או להזיז את הציון. באחד מהם, פועלים שניסו לישר את הקרקע סמוך לציון שמעו קול הקורא בשמם; וכשהמשיכו — הטרקטור התהפך. בניסיון אחר הוסטה ידו של מי שהניף את הכלי והוא נחבל. מאז חדלו, והציון נותר על מקומו.",
        source: "מקור: ״שחרית״, עמ׳ 17–18 · ״אביר יעקב״" }
    ];

    function yshBall(s) {
      var b = document.createElement("button");
      b.className = "ysh-ball";
      b.type = "button";
      b.setAttribute("aria-label", s.title + " — לחצו לקריאת הסיפור");
      b.innerHTML =
        '<span class="ysh-bg" style="background-image:url(\'' + s.img + '\')"></span>' +
        '<span class="ysh-in">' +
          '<span class="ysh-tag">' + s.tag + '</span>' +
          '<span class="ysh-t">' + s.title + '</span>' +
          '<span class="ysh-s">' + s.sum + '</span>' +
          '<span class="ysh-cta">לחץ כאן ›</span>' +
        '</span>';
      b.addEventListener("click", function () { yshOpen(s); });
      return b;
    }
    // שתי חזרות לריצה אינסופית חלקה
    for (var rep = 0; rep < 2; rep++) {
      STORIES.forEach(function (s) { yshTrack.appendChild(yshBall(s)); });
    }

    // מודאל
    var ym = document.createElement("div");
    ym.className = "ysh-modal";
    ym.innerHTML =
      '<div class="ysh-modal-ov"></div>' +
      '<div class="ysh-panel" role="dialog" aria-modal="true" aria-label="סיפור ישועה">' +
        '<button class="ysh-close" type="button" aria-label="סגירה">×</button>' +
        '<img class="ym-img" alt="" />' +
        '<span class="ym-tag"></span>' +
        '<h3 class="ym-t"></h3>' +
        '<div class="ym-body"></div>' +
        '<p class="ym-src"></p>' +
      '</div>';
    document.body.appendChild(ym);
    var ymImg = ym.querySelector(".ym-img"),
        ymTag = ym.querySelector(".ym-tag"),
        ymT = ym.querySelector(".ym-t"),
        ymBody = ym.querySelector(".ym-body"),
        ymSrc = ym.querySelector(".ym-src");
    function yshOpen(s) {
      ymImg.src = s.img; ymTag.textContent = s.tag; ymT.textContent = s.title;
      ymBody.textContent = s.full; ymSrc.textContent = s.source;
      ym.classList.add("open"); document.body.style.overflow = "hidden";
    }
    function yshClose() { ym.classList.remove("open"); document.body.style.overflow = ""; }
    ym.querySelector(".ysh-close").addEventListener("click", yshClose);
    ym.querySelector(".ysh-modal-ov").addEventListener("click", yshClose);
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") yshClose(); });
  }
})();
