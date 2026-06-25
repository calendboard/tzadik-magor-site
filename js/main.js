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
    var count = window.innerWidth < 600 ? 24 : 46;
    for (var i = 0; i < count; i++) {
      var p = document.createElement("i");
      p.style.left = Math.random() * 100 + "%";
      p.style.animationDuration = (6 + Math.random() * 8) + "s";
      p.style.animationDelay = (-Math.random() * 10) + "s";
      var s = 3 + Math.random() * 5;
      p.style.width = p.style.height = s + "px";
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
})();
