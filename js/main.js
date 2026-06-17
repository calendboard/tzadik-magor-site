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
    var count = window.innerWidth < 600 ? 14 : 26;
    for (var i = 0; i < count; i++) {
      var p = document.createElement("i");
      p.style.left = Math.random() * 100 + "%";
      p.style.animationDuration = (6 + Math.random() * 8) + "s";
      p.style.animationDelay = (-Math.random() * 10) + "s";
      var s = 2 + Math.random() * 3;
      p.style.width = p.style.height = s + "px";
      particles.appendChild(p);
    }
  }

  /* ---------- ספירה לאחור להילולא ----------
     אם לא הוגדר תאריך ב-data-date, נחשב את ה-1 בחודש הבא כברירת מחדל זמנית. */
  var cd = document.getElementById("countdown");
  if (cd) {
    var dateStr = cd.getAttribute("data-date");
    var target;
    if (dateStr) {
      target = new Date(dateStr).getTime();
    } else {
      var now = new Date();
      target = new Date(now.getFullYear(), now.getMonth() + 1, 1, 18, 0, 0).getTime();
    }
    var elDays = cd.querySelector('[data-cd="days"]');
    var elHours = cd.querySelector('[data-cd="hours"]');
    var elMins = cd.querySelector('[data-cd="mins"]');
    var elSecs = cd.querySelector('[data-cd="secs"]');
    function pad(n) { return String(n).padStart(2, "0"); }
    function tick() {
      var diff = target - Date.now();
      if (diff < 0) diff = 0;
      var d = Math.floor(diff / 86400000);
      var h = Math.floor((diff % 86400000) / 3600000);
      var m = Math.floor((diff % 3600000) / 60000);
      var s = Math.floor((diff % 60000) / 1000);
      if (elDays) elDays.textContent = pad(d);
      if (elHours) elHours.textContent = pad(h);
      if (elMins) elMins.textContent = pad(m);
      if (elSecs) elSecs.textContent = pad(s);
    }
    tick();
    setInterval(tick, 1000);
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
})();
