/* ============================================================
   הצדיק מעג׳ור — סקריפט ראשי
   אנימציות, תפריט נייד, מונים, ספירה לאחור וטפסים
   ============================================================ */
(function () {
  "use strict";

  /* ---------- הגדרות פנייה (מקום אחד לכל הטפסים) ----------
     כתובת המייל שאליה מגיעות כל הפניות (צור-קשר + ארכיון) + מספר וואטסאפ.
     ★ כתובת לקבלת כל הפניות (להחלפה: שנו רק את SITE_EMAIL כאן) — זה משפיע על כל הטפסים.
     שירות השליחה = FormSubmit (חינמי, ללא שרת). בפעם הראשונה הוא ישלח לכתובת
     הזו מייל אישור חד-פעמי שצריך ללחוץ עליו פעם אחת כדי להפעיל. */
  var SITE_EMAIL = "hatzadikmagor@gmail.com";
  var SITE_WA = "97226597098";

  /* זיהוי מגדר מתוך השם: "… בת …" = נקבה, "… בן …" = זכר. ריק = לא ידוע. */
  function nameGender(s) {
    s = " " + String(s || "").replace(/[׳'״"]/g, "") + " ";
    if (/\sבת\s/.test(s)) return "f";
    if (/\sבן\s/.test(s)) return "m";
    return "";
  }
  /* ממלא אלמנטים עם data-g="זכר|נקבה" לפי המגדר (ברירת מחדל = זכר). */
  function applyGender(root, gender) {
    if (!root) return;
    root.querySelectorAll("[data-g]").forEach(function (ge) {
      var parts = ge.getAttribute("data-g").split("|");
      ge.textContent = (gender === "f" && parts[1]) ? parts[1] : parts[0];
    });
  }

  /* אימות מייל וטלפון — לידים תקינים בלבד */
  function validEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(v).trim()); }
  function validPhone(v) {
    var d = String(v).replace(/[^\d]/g, "");
    return d.length >= 9 && d.length <= 15;
  }
  /* בודק שדות מייל/טלפון בטופס; מחזיר אלמנט שגוי או null */
  function badContactField(form) {
    var em = form.querySelector('input[type="email"]');
    if (em && em.value.trim() && !validEmail(em.value)) return { el: em, msg: "כתובת האימייל אינה תקינה — נא לבדוק 🙏" };
    var ph = form.querySelector('input[type="tel"]');
    if (ph && ph.value.trim() && !validPhone(ph.value)) return { el: ph, msg: "מספר הטלפון אינו תקין — נא להזין מספר מלא 🙏" };
    return null;
  }

  /* שליחת פנייה דרך FormSubmit; מחזיר Promise. */
  function sendLead(data) {
    return fetch("https://formsubmit.co/ajax/" + SITE_EMAIL, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify(data)
    }).then(function (r) { return r.json(); });
  }

  /* מנגנון טופס-ליד גנרי (שם לתפילה / נר לעילוי נשמה / כל טופס איסוף פרטים).
     הטופס צריך: class="lead-form" + data-subject="כותרת המייל".
     כל שדה: name + (data-label="תווית בעברית"). שדות חובה: required.
     אופציונלי: אלמנט אחים ".lead-success" (מוסתר) שיוצג אחרי שליחה,
     ובתוכו אלמנט [data-fill="#שדה"] שימולא בערך מהשדה (למשל שם הנפטר). */
  function setupLeadForm(form) {
    if (!form) return;
    var status = form.querySelector(".form-status");
    var btn = form.querySelector('button[type="submit"]');
    var success = form.parentNode ? form.parentNode.querySelector(".lead-success") : null;
    var subject = form.getAttribute("data-subject") || "פנייה מאתר הצדיק מעג׳ור";

    function setStatus(msg, ok) {
      if (!status) return;
      status.innerHTML = msg;
      status.style.color = ok === false ? "#f0b8b8" : "var(--gold-2)";
    }
    function fallbackWA() {
      if (btn) btn.disabled = false;
      var lines = "בס\"ד, פנייה מאתר הצדיק מעג׳ור:%0A%0A";
      form.querySelectorAll("[name]").forEach(function (f) {
        if (f.value && f.value.trim()) lines += encodeURIComponent((f.getAttribute("data-label") || f.name) + ": " + f.value.trim()) + "%0A";
      });
      var url = "https://wa.me/" + SITE_WA + "?text=" + lines;
      setStatus('לשליחה, לחצו לוואטסאפ: <a href="' + url + '" target="_blank" rel="noopener" style="color:var(--gold-2);font-weight:700">פתיחת וואטסאפ »</a>');
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var req = form.querySelectorAll("[required]");
      for (var i = 0; i < req.length; i++) {
        if (!req[i].value.trim()) { setStatus("נא למלא את כל שדות החובה 🙏", false); req[i].focus(); return; }
      }
      var bad = badContactField(form);
      if (bad) { setStatus(bad.msg, false); bad.el.focus(); return; }
      if (btn) btn.disabled = true;
      setStatus("שולח… 🕯️");

      var data = { _subject: subject, _captcha: "false", _template: "table" };
      form.querySelectorAll("[name]").forEach(function (f) {
        if (f.value && f.value.trim()) data[f.getAttribute("data-label") || f.name] = f.value.trim();
      });

      sendLead(data).then(function (j) {
        if (j && (j.success === "true" || j.success === true)) {
          if (form.getAttribute("data-candle") === "1") {
            var g = function (s) { var el = form.querySelector(s); return el ? el.value.trim() : ""; };
            if (g("[name=deceased]")) appendCandle({ name: g("[name=deceased]"), family: g("[name=family]"), deathdate: g("[name=deathdate]"), dedication: g("[name=dedication]") });
          }
          if (form.getAttribute("data-prayer") === "1") {
            var gp = function (s) { var el = form.querySelector(s); return el ? el.value.trim() : ""; };
            if (gp("[name=pray_name]")) appendPrayer({ name: gp("[name=pray_name]"), request: gp("[name=request]") });
          }
          if (success) {
            var fill = success.querySelector("[data-fill]");
            var srcVal = "";
            if (fill) { var src = form.querySelector(fill.getAttribute("data-fill")); srcVal = src ? src.value.trim() : ""; fill.textContent = srcVal; }
            applyGender(success, nameGender(srcVal));
            form.style.display = "none";
            success.hidden = false;
            success.scrollIntoView({ behavior: "smooth", block: "center" });
          } else {
            setStatus("התקבל בהצלחה! תודה 🕯️", true);
            form.reset();
          }
          if (btn) btn.disabled = false;
        } else { fallbackWA(); }
      }).catch(function () { fallbackWA(); });
    });
  }

  /* ---------- קיר הנרות (זיכרון משותף ציבורי דרך JSONBin) ---------- */
  var CANDLE_API = "https://api.jsonbin.io/v3/b/6a40f90fda38895dfe0b10e7";
  /* מוסיף פריט למערך בקופסה (candles/prayers) תוך שמירה על שאר המבנה */
  function appendToBin(key, item, after) {
    fetch(CANDLE_API + "/latest", { headers: { "X-Bin-Meta": "false" } })
      .then(function (r) { return r.json(); })
      .then(function (rec) {
        rec = rec || {};
        if (!Array.isArray(rec.candles)) rec.candles = [];
        if (!Array.isArray(rec.prayers)) rec.prayers = [];
        rec[key].push(item);
        return fetch(CANDLE_API, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(rec) });
      })
      .then(function () { if (after) after(); })
      .catch(function () {});
  }
  function appendCandle(c) {
    c = c || {};
    appendToBin("candles", {
      name: String(c.name || "").substring(0, 80),
      family: String(c.family || "").substring(0, 60),
      deathdate: String(c.deathdate || "").substring(0, 40),
      dedication: String(c.dedication || "").substring(0, 60),
      date: new Date().toISOString().slice(0, 10)
    }, loadCandleWall);
  }
  function appendPrayer(p) {
    p = p || {};
    appendToBin("prayers", {
      name: String(p.name || "").substring(0, 80),
      request: String(p.request || "").substring(0, 40),
      date: new Date().toISOString().slice(0, 10)
    });
  }
  var _candles = [];
  function fmtDate(d) {
    if (!d) return "";
    var p = String(d).slice(0, 10).split("-");
    return p.length === 3 ? p[2] + "." + p[1] + "." + p[0] : "";
  }
  function renderWall(filter) {
    var wall = document.getElementById("candleWall");
    if (!wall) return;
    var list = _candles.slice().reverse();
    filter = (filter || "").trim();
    if (filter) list = list.filter(function (c) { return (c.name || "").indexOf(filter) !== -1; });
    if (!list.length) {
      wall.innerHTML = '<p class="cw-empty">' + (filter ? "לא נמצא נר בשם זה." : "עדיין לא הודלקו נרות — היו הראשונים להאיר 🕯️") + "</p>";
      return;
    }
    wall.innerHTML = "";
    list.slice(0, 400).forEach(function (c) {
      var el = document.createElement("figure");
      el.className = "wall-cell reveal in";
      el.innerHTML =
        '<div class="wall-candle" aria-hidden="true">' +
          '<span class="wc-glow"></span><span class="wc-flame"></span>' +
          '<span class="wc-wick"></span><span class="wc-wax"></span>' +
        '</div>' +
        '<figcaption class="wall-name"></figcaption>' +
        '<div class="wall-family"></div>' +
        '<div class="wall-death"></div>' +
        '<div class="wall-ded"></div>';
      el.querySelector(".wall-name").textContent = c.name || "";
      var fam = el.querySelector(".wall-family"); if (c.family) fam.textContent = "למשפחת " + c.family; else fam.remove();
      var dth = el.querySelector(".wall-death"); if (c.deathdate) dth.textContent = c.deathdate; else dth.remove();
      var ded = el.querySelector(".wall-ded"); if (c.dedication) ded.textContent = c.dedication; else ded.remove();
      wall.appendChild(el);
    });
  }
  function loadCandleWall() {
    var wall = document.getElementById("candleWall");
    if (!wall) return;
    fetch(CANDLE_API + "/latest", { headers: { "X-Bin-Meta": "false" } })
      .then(function (r) { return r.json(); })
      .then(function (rec) {
        _candles = (rec && rec.candles) || [];
        var countEl = document.getElementById("candleCount");
        if (countEl) countEl.textContent = _candles.length.toLocaleString("he-IL");
        var search = document.getElementById("candleSearch");
        renderWall(search ? search.value : "");
      })
      .catch(function () {
        if (wall && !wall.children.length) wall.innerHTML = '<p class="cw-empty">לא ניתן לטעון את הקיר כרגע. נסו לרענן 🙏</p>';
      });
    var search = document.getElementById("candleSearch");
    if (search && !search._wired) { search._wired = true; search.addEventListener("input", function () { renderWall(search.value); }); }
  }
  loadCandleWall();

  /* ---------- דף הרשימות (admin): כל השמות לתפילה + כל הנרות ---------- */
  function loadAdminLists() {
    var pWrap = document.getElementById("prayerList");
    var cWrap = document.getElementById("candleList");
    if (!pWrap && !cWrap) return;
    fetch(CANDLE_API + "/latest", { headers: { "X-Bin-Meta": "false" } })
      .then(function (r) { return r.json(); })
      .then(function (rec) {
        rec = rec || {};
        var prayers = rec.prayers || [], candles = rec.candles || [];
        var pc = document.getElementById("prayerCount"); if (pc) pc.textContent = prayers.length;
        var clc = document.getElementById("candleListCount"); if (clc) clc.textContent = candles.length;
        if (pWrap) {
          pWrap.innerHTML = "";
          if (!prayers.length) pWrap.innerHTML = '<li class="adm-empty">אין עדיין שמות לתפילה.</li>';
          prayers.slice().reverse().forEach(function (p) {
            var li = document.createElement("li");
            li.innerHTML = '<b></b><span class="adm-req"></span>';
            li.querySelector("b").textContent = p.name || "";
            li.querySelector(".adm-req").textContent = p.request ? " — " + p.request : "";
            pWrap.appendChild(li);
          });
        }
        if (cWrap) {
          cWrap.innerHTML = "";
          if (!candles.length) cWrap.innerHTML = '<li class="adm-empty">אין עדיין נרות.</li>';
          candles.slice().reverse().forEach(function (c) {
            var li = document.createElement("li");
            var t = c.name || "";
            if (c.family) t += " · למשפחת " + c.family;
            if (c.deathdate) t += " · " + c.deathdate;
            if (c.dedication) t += " · " + c.dedication;
            li.textContent = t;
            cWrap.appendChild(li);
          });
        }
      })
      .catch(function () {
        if (pWrap) pWrap.innerHTML = '<li class="adm-empty">לא ניתן לטעון כעת. נסו לרענן.</li>';
      });
  }
  loadAdminLists();

  $all_leadForms();
  function $all_leadForms() {
    document.querySelectorAll(".lead-form").forEach(function (f) { setupLeadForm(f); });
  }

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
      var topic = form.querySelector("#cTopic");
      var msg = form.querySelector("#cMsg");
      if (!name.value.trim() || !phone.value.trim()) {
        if (status) { status.textContent = "נא למלא שם וטלפון 🙏"; status.style.color = "#f0b8b8"; }
        return;
      }
      var badC = badContactField(form);
      if (badC) { if (status) { status.textContent = badC.msg; status.style.color = "#f0b8b8"; } badC.el.focus(); return; }
      var btn = form.querySelector('button[type="submit"]');
      if (btn) { btn.disabled = true; }
      if (status) { status.style.color = "var(--gold-2)"; status.textContent = "שולח… 🕯️"; }

      function contactWaFallback() {
        if (btn) { btn.disabled = false; }
        var t = "בס\"ד, פנייה מאתר הצדיק מעג׳ור:%0A%0A" +
          "שם: " + encodeURIComponent(name.value.trim()) + "%0A" +
          "נושא: " + encodeURIComponent((topic || {}).value || "") + "%0A%0A" +
          encodeURIComponent((msg || {}).value || "");
        var url = "https://wa.me/" + SITE_WA + "?text=" + t;
        if (status) {
          status.innerHTML = 'לשליחת הפנייה, לחצו לשליחה בוואטסאפ: ' +
            '<a href="' + url + '" target="_blank" rel="noopener" style="color:var(--gold-2);font-weight:700">פתיחת וואטסאפ »</a>';
          status.style.color = "var(--gold-2)";
        }
      }

      sendLead({
        _subject: "✉️ צור קשר — אתר הצדיק מעג׳ור",
        _captcha: "false",
        _template: "table",
        "שם מלא": name.value.trim(),
        "טלפון": phone.value.trim(),
        "נושא הפנייה": (topic || {}).value || "",
        "הודעה": (msg || {}).value.trim() || "(ללא)"
      }).then(function (j) {
        if (j && (j.success === "true" || j.success === true)) {
          if (status) { status.style.color = ""; status.textContent = "תודה! פנייתכם נשלחה ונחזור אליכם בהקדם. שתזכו לישועות! 🕯️"; }
          form.reset();
          if (btn) { btn.disabled = false; }
        } else {
          contactWaFallback();
        }
      }).catch(function () { contactWaFallback(); });
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
  var storyGrid = document.getElementById("storyGrid");
  if (yshTrack || storyGrid) {
    var STORIES = [
      { tag: "גילוי הציון", img: "assets/hilula/ziyon-night.jpg",
        title: "החלום שגילה את הציון",
        sum: "זקנה חלמה — ונתגלה מקום הקבר",
        full: "במשך שנים לא ידעו היכן טמון הצדיק. אישה זקנה שגרה סמוך לעץ החרוב חלמה חלום, ובו נגלה אליה רבי יצחק גברא ואמר לה: „שמי רבי יצחק גברא, אני קבור תחת עץ החרוב הסמוך לביתך… למה בני אינם באים אליי?”. הוא ביקש ממנה להעביר את הדברים לשלושה רבנים — וכך נתגלה מקום הציון הקדוש, ומאז פוקדים אותו רבים.",
        source: "מקור: ״שחרית״, עמ׳ 18 · מסורת מקומית" },
      { tag: "פרי בטן", img: "assets/segulot/pri.jpg",
        title: "האברך שנפקד",
        sum: "שנים ללא ילדים — ונפקד",
        full: "אברך שלא נפקד בילדים נסע אל הציון בחבורה אחת וביקש על בנים. לפי הסיפור — נפקד בילדים.",
        source: "מקור: ״שחרית״, עמ׳ 18" },
      { tag: "רפואה", img: "assets/segulot/refua.jpg",
        title: "הנער שהחלים",
        sum: "נער חולה במחלה קשה — והבריא",
        full: "נער שחלה במחלה קשה עלה אל הציון עם אותה חבורה, ושפכו עליו תפילה. לפי הסיפור — הנער החלים.",
        source: "מקור: ״שחרית״, עמ׳ 18" },
      { tag: "פרנסה", img: "assets/segulot/parnasa.jpg",
        title: "מצא פרנסה",
        sum: "חיפש עבודה — והתקבל לעבודה טובה",
        full: "בחור שחיפש עבודה הצטרף לנסיעה אל הציון וביקש על פרנסתו. לפי הסיפור — התקבל לעבודה טובה.",
        source: "מקור: ״שחרית״, עמ׳ 18" },
      { tag: "זיווג", img: "assets/hilula/tent-night.jpg",
        title: "התארס בליל ההילולה",
        sum: "רווק מבוגר — והתארס בליל ההילולה",
        full: "רווק מבוגר שנסע עם החבורה אל הציון ביקש על זיווגו. לפי הסיפור — התארס בליל ההילולה עצמו.",
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
        source: "מקור: ״שחרית״, עמ׳ 17–18 · ״אביר " },
      { tag: `פרי בטן`, img: `assets/segulot/pri.jpg`,
        title: `שתי יולדות — ושני בנים בשם יצחק`,
        sum: `חלו בקורונה — ונולדו שני בנים בריאים`,
        full: `בתקופת מגפת הקורונה חלו שתי נשים בהיריון, ומצבן הרפואי הידרדר מאוד. בני המשפחה ארגנו מניין לתפילה על ציון הצדיק בעג׳ור, וקיבלו על עצמם שאם שתי הנשים תבראנה ותלדנה בנים בריאים — ייקראו הילדים על שם הצדיק, "יצחק". כנגד כל הסיכויים שתיהן החלימו ללא כל סימן למחלה, ההיריון נמשך כשורה, ושתיהן ילדו בנים בריאים — וכל אחד נקרא יצחק. בעקבות הנס נפתח כולל אברכים על שם הצדיק.`,
        source: `מקור: ארכיון המאורות · "פועל הישועות מעגור"` },
      { tag: `זיווג`, img: `assets/segulot/zivug.jpg`,
        title: `השידוך שנקשר בערב יום כיפור`,
        sum: `התחייב לסעודה — והבן התארס`,
        full: `אב שבנו הבוגר טרם זכה להינשא עלה לציון הצדיק בתשעה באב, וקיבל על עצמו שאם בנו יתארס לפני יום ההילולא של הרבנית — יערוך סעודה לכבוד הצדיק ולעילוי נשמתו. סמוך לאחר מכן, בערב יום הכיפורים, נקשר השידוך והבן התארס בשעה טובה.`,
        source: `מקור: ארכיון המאורות · "פועל הישועות מעגור"` },
      { tag: `ישועה`, img: `assets/segulot/hatzlacha.jpg`,
        title: `החוב שנעלם מהמחשב`,
        sum: `הניחה מסמכיה על הציון — והחוב נמחק`,
        full: `אישה שעמדה בפני תביעה מהעירייה בגין חוב גדול שהצטבר הביאה את כל מסמכיה לציון. בתמימות הניחה את הניירות על הציון וביקשה מהצדיק שיהיה לה לפרקליט. כשהגיעה למשרדי העירייה כדי לשלם — בדק הפקיד במחשב ולא מצא כל רישום של חוב על שמה, אף שהמסמכים שבידה הראו אחרת.`,
        source: `מקור: ארכיון המאורות · "פועל הישועות מעגור"` },
      { tag: `עדות`, img: `assets/hilula/ziyon-prayer.jpg`,
        title: `פתח בענני השמים`,
        sum: `חלון נפתח בעננים — בדיוק בזמן התפילה`,
        full: `מספר הרב ק׳, מפעילי הקהילה בבית שמש: "חיי השתנו מאז שזכיתי לגלות את המקום הקדוש הזה. בתפילת מנחה ביום מעונן הצטערתי שכאילו ננעלו השמים בפני תפילתנו. אך כשהתחלנו, נשאתי עיניי ולמעלה ראיתי פתח רחב בעננים — כמו חלון ממש מולנו. כולם השתוממו. וברגע שהסתיימה התפילה — נסגר הפתח, והשמים נחתמו שוב." המראה ריגש את כל הנוכחים, מכל החוגים.`,
        source: `מקור: ארכיון המאורות · "פועל הישועות מעגור"` },
      { tag: `מעלת הצדיק`, img: `assets/hilula/elder-prayer.jpg`,
        title: `צדיק ביקש — תזכיר אותי שם`,
        sum: `רב גדול התחנן שיזכירו אותו על הציון`,
        full: `אותו מספר נכנס פעם לקבל ברכה מרב גדול. מבין רבים שהמתינו, הצביע עליו הרב לפתע ושאל על מעשיו. כששמע שהוא פוקד את רבי גברא בעג׳ור כמעט מדי יום, התרגש עד עומק נשמתו ואמר: "אילו ידעו האנשים את כוחו ומעלתו של הצדיק מעג׳ור — לא היו עוזבים את המקום לעולם!" ואז ביקש בלב נשבר: "אני מתחנן אליך — הזכר אותי שם, בכל פעם שאתה עולה!" וכתב את שמו ושם משפחתו על פתק.`,
        source: `מקור: ארכיון המאורות · "פועל הישועות מעגור"` },
      { tag: `רפואה`, img: `assets/hilula/ziyon-interior.jpg`,
        title: `המקל שנשאר בציון`,
        sum: `נכנס על מקל הליכה — ויצא בלעדיו`,
        full: `בחור צעיר, ספורטאי לשעבר, נכנס לציון כשהוא נשען על מקל הליכה. ליד הציון פרץ בבכי: "רבי יצחק! ראה מה עלה בגורלי — הייתי אלוף בכוחי, ואחרי תאונה וניתוחים אני שבור וצולע!" לאחר כמה דקות של שפיכת הלב קם, השליך את המקל, ויצא בלעדיו. כעבור חודשים שב והעיד: "אחרי התפילה הרגשתי תחושות חדשות ברגל, ניסיתי ללכת בלי המקל — וזה לא כאב! תוך ימים ספורים החלמתי לגמרי. וגם זכיתי להתחיל לחזור בתשובה."`,
        source: `מקור: ארכיון המאורות · "פועל הישועות מעגור"` }
    ];

    function yshBall(s) {
      var b = document.createElement("button");
      b.className = "ysh-ball";
      b.type = "button";
      b.setAttribute("aria-label", s.title + " — לחצו לקריאת הסיפור");
      b.innerHTML =
        '<span class="ysh-in">' +
          '<span class="ysh-deco" aria-hidden="true"></span>' +
          '<span class="ysh-tag">' + s.tag + '</span>' +
          '<span class="ysh-t">' + s.title + '</span>' +
          '<span class="ysh-s">' + s.sum + '</span>' +
          '<span class="ysh-cta">לחץ כאן ›</span>' +
        '</span>';
      b.addEventListener("click", function () { yshOpen(s); });
      return b;
    }
    if (yshTrack) {
      for (var rep = 0; rep < 2; rep++) {
        STORIES.forEach(function (s) { yshTrack.appendChild(yshBall(s)); });
      }
    }
    if (storyGrid) {
      STORIES.forEach(function (s) { storyGrid.appendChild(yshBall(s)); });
    }

    // מודאל
    var ym = document.createElement("div");
    ym.className = "ysh-modal";
    ym.innerHTML =
      '<div class="ysh-modal-ov"></div>' +
      '<div class="ysh-panel" role="dialog" aria-modal="true" aria-label="סיפור ישועה">' +
        '<button class="ysh-close" type="button" aria-label="סגירה">×</button>' +
        '<span class="ym-tag"></span>' +
        '<h3 class="ym-t"></h3>' +
        '<div class="ym-body"></div>' +
      '</div>';
    document.body.appendChild(ym);
    var ymTag = ym.querySelector(".ym-tag"),
        ymT = ym.querySelector(".ym-t"),
        ymBody = ym.querySelector(".ym-body");
    function yshOpen(s) {
      ymTag.textContent = s.tag; ymT.textContent = s.title;
      ymBody.textContent = s.full;
      ym.classList.add("open"); document.body.style.overflow = "hidden";
    }
    function yshClose() { ym.classList.remove("open"); document.body.style.overflow = ""; }
    ym.querySelector(".ysh-close").addEventListener("click", yshClose);
    ym.querySelector(".ysh-modal-ov").addEventListener("click", yshClose);
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") yshClose(); });
  }

  /* ---------- חדשות ועדכוני המרכז (כרטיסים + מודאל כתבה) ---------- */
  var newsGrid = document.getElementById("newsGrid");
  var newsTeaser = document.getElementById("newsTeaser");
  if (newsGrid || newsTeaser) {
    /* === להוספת כתבה: הוסיפו אובייקט בראש הרשימה (החדש ביותר ראשון) === */
    var NEWS = [
      { date: "תמוז תשפ״ו", cat: "הילולא", img: "assets/hilula/crowd-night.jpg",
        title: "לקראת ההילולא הקדושה — כ״א בתמוז",
        excerpt: "מתקרבים ימי ההילולא של פועל הישועות. הפרטים על המעמד, התפילות וההשתתפות.",
        body: [
          "מדי שנה, בכ״א בתמוז, נאספים אלפי יהודים מכל קצוות הארץ אל ציון הצדיק רבי יצחק גברא זצ״ל בעג׳ור — להשתטח, להדליק נרות, לומר תהילים ולבקש ישועה.",
          "השנה תחול ההילולא ביום שני, כ״א בתמוז תשפ״ו (6 ביולי 2026). במהלך היום יתקיימו הדלקה מרכזית, תפילות, אמירת תהילים וסעודת מצווה.",
          "מי שאינו יכול להגיע מוזמן למסור שם לתפילה ולהיות שותף בהוצאות ההילולא — וזכות הצדיק תגן עליו ועל בני ביתו."
        ] },
      { date: "סיון תשפ״ו", cat: "מהמרכז", img: "assets/hilula/ziyon-prayer.jpg",
        title: "מסירת שמות לתפילה על הציון",
        excerpt: "ניתן למסור שם לתפילה ולהדליק נר נשמה על ציון הצדיק — מכל מקום בארץ.",
        body: [
          "מרכז ״הצדיק מעג׳ור״ מאפשר לכל יהודי למסור שם לתפילה על הציון הקדוש, גם למי שאינו יכול להגיע בעצמו.",
          "השמות נמסרים לתפילה על הציון לישועה, רפואה, זיווג, פרנסה ופרי בטן. ניתן גם להדליק נר נשמה ולהקדיש לעילוי נשמת יקיריכם.",
          "למסירת שם ולפרטים נוספים — צרו קשר, או היכנסו לעמוד התרומה וההקדשה."
        ] },
      { date: "אייר תשפ״ו", cat: "עדכון", img: "assets/hilula/ziyon-night.jpg",
        title: "ברוכים הבאים לאתר הרשמי של המרכז",
        excerpt: "השקנו את האתר הרשמי — תולדות הצדיק, סגולות, סיפורי ישועה, גלריה ועוד.",
        body: [
          "בשעה טובה ומוצלחת אנו שמחים להשיק את האתר הרשמי של מרכז ״הצדיק מעג׳ור״ — רבי יצחק בן יצחק גברא זצ״ל, פועל הישועות.",
          "באתר תמצאו את תולדות חייו של הצדיק, סגולותיו, סיפורי מופת וישועות, גלריית תמונות מההילולות, תפילות ותהילים — הכל במקום אחד.",
          "מדור החדשות יתעדכן באופן שוטף בכל הנעשה במרכז ובהכנות לקראת ההילולא. שתזכו לישועות בזכות הצדיק!"
        ] }
    ];

    function newsCard(a) {
      var c = document.createElement("article");
      c.className = "news-card";
      c.innerHTML =
        '<div class="nc-img" style="background-image:url(\'' + a.img + '\')"></div>' +
        '<div class="nc-body">' +
          '<div class="nc-meta"><span class="nc-cat">' + a.cat + '</span><span class="nc-date">' + a.date + '</span></div>' +
          '<h3 class="nc-title">' + a.title + '</h3>' +
          '<p class="nc-excerpt">' + a.excerpt + '</p>' +
          '<button class="nc-more" type="button">קרא עוד ›</button>' +
        '</div>';
      c.querySelector(".nc-more").addEventListener("click", function () { newsOpen(a); });
      return c;
    }
    if (newsGrid) { NEWS.forEach(function (a) { newsGrid.appendChild(newsCard(a)); }); }
    if (newsTeaser) { NEWS.slice(0, 3).forEach(function (a) { newsTeaser.appendChild(newsCard(a)); }); }

    var nm = document.createElement("div");
    nm.className = "ysh-modal";
    nm.innerHTML =
      '<div class="ysh-modal-ov"></div>' +
      '<div class="ysh-panel" role="dialog" aria-modal="true" aria-label="כתבה">' +
        '<button class="ysh-close" type="button" aria-label="סגירה">×</button>' +
        '<img class="ym-img nm-img" alt="" />' +
        '<span class="ym-tag nm-tag"></span>' +
        '<h3 class="ym-t nm-t"></h3>' +
        '<div class="ym-body nm-body"></div>' +
      '</div>';
    document.body.appendChild(nm);
    var nmImg = nm.querySelector(".nm-img"), nmTag = nm.querySelector(".nm-tag"),
        nmT = nm.querySelector(".nm-t"), nmBody = nm.querySelector(".nm-body");
    function newsOpen(a) {
      nmImg.src = a.img; nmTag.textContent = a.cat + " · " + a.date; nmT.textContent = a.title;
      nmBody.innerHTML = "";
      a.body.forEach(function (p) { var el = document.createElement("p"); el.textContent = p; nmBody.appendChild(el); });
      nm.classList.add("open"); document.body.style.overflow = "hidden";
    }
    function newsClose() { nm.classList.remove("open"); document.body.style.overflow = ""; }
    nm.querySelector(".ysh-close").addEventListener("click", newsClose);
    nm.querySelector(".ysh-modal-ov").addEventListener("click", newsClose);
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") newsClose(); });
  }

  /* ---------- ארכיון הישועות המאומת (תצוגת עדויות + טופס שליחה) ---------- */
  /* כתובת היעד + וואטסאפ מוגדרים פעם אחת בראש הקובץ (SITE_EMAIL / SITE_WA). */

  /* === עדויות שאומתו ואושרו לפרסום ===
     מתחיל ריק בכוונה – לא ממציאים עדויות. כשמגיעה עדות אמיתית ומאומתת,
     מוסיפים כאן אובייקט: { tag, body, by, place }  (by = שם לפרסום, אפשר ראשי תיבות). */
  var ARCHIVE = [
    // דוגמה למבנה (מוסתר – הסירו את ה-// כשמוסיפים עדות אמיתית):
    // { tag: "רפואה", body: "כאן הסיפור כפי שנמסר…", by: "מ. כהן", place: "ירושלים" },
  ];

  var archGrid = document.getElementById("archiveGrid");
  if (archGrid) {
    if (ARCHIVE.length === 0) {
      archGrid.innerHTML =
        '<div class="arch-empty">' +
          '<span class="ico" aria-hidden="true">🕯️</span>' +
          '<h3>הארכיון נפתח עכשיו</h3>' +
          '<p>כאן יתפרסמו עדויות הישועה שתשלחו — לאחר אימות ובאישורכם. ' +
          'היו הראשונים לשתף ולחזק את כלל ישראל בכוח הצדיק.</p>' +
        '</div>';
    } else {
      ARCHIVE.forEach(function (t) {
        var c = document.createElement("figure");
        c.className = "testimony-card";
        c.innerHTML =
          (t.tag ? '<span class="tc-tag">' + t.tag + '</span>' : '') +
          '<blockquote class="tc-body"></blockquote>' +
          '<figcaption class="tc-by"><b></b><span></span></figcaption>';
        c.querySelector(".tc-body").textContent = t.body || "";
        c.querySelector(".tc-by b").textContent = t.by || "מתפלל/ת";
        c.querySelector(".tc-by span").textContent = t.place || "";
        archGrid.appendChild(c);
      });
    }
  }

  /* טופס שליחת עדות */
  var archForm = document.getElementById("archiveForm");
  var archStatus = document.getElementById("archiveStatus");
  if (archForm) {
    function setStatus(msg, ok) {
      if (!archStatus) return;
      archStatus.textContent = msg;
      archStatus.style.color = ok === true ? "" : ok === false ? "#f0b8b8" : "var(--gold-2)";
    }
    archForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = archForm.querySelector("#aName");
      var phone = archForm.querySelector("#aPhone");
      var story = archForm.querySelector("#aStory");
      var consent = archForm.querySelector("#aConsent");
      if (!name.value.trim() || !phone.value.trim() || !story.value.trim()) {
        setStatus("נא למלא שם, טלפון וסיפור הישועה 🙏", false); return;
      }
      if (consent && !consent.checked) {
        setStatus("נא לאשר את הפרסום באתר (אפשר בעילום שם) 🙏", false); return;
      }
      var badA = badContactField(archForm);
      if (badA) { setStatus(badA.msg, false); badA.el.focus(); return; }
      var btn = archForm.querySelector('button[type="submit"]');
      if (btn) { btn.disabled = true; }
      setStatus("שולח… 🕯️");

      function showWaFallback() {
        if (btn) { btn.disabled = false; }
        var waText = "בס\"ד, אני רוצה לשתף עדות ישועה בזכות הצדיק מעג׳ור:%0A%0A" +
          "שם: " + encodeURIComponent(name.value.trim()) + "%0A" +
          "סוג הישועה: " + encodeURIComponent((archForm.querySelector("#aType") || {}).value || "") + "%0A%0A" +
          encodeURIComponent(story.value.trim());
        var waUrl = "https://wa.me/" + SITE_WA + "?text=" + waText;
        archStatus.innerHTML = 'לשליחת העדות, לחצו לשליחה בוואטסאפ: ' +
          '<a href="' + waUrl + '" target="_blank" rel="noopener" style="color:var(--gold-2);font-weight:700">פתיחת וואטסאפ »</a>';
        archStatus.style.color = "var(--gold-2)";
      }

      var data = {
        _subject: "📜 עדות לארכיון הישועות — אתר הצדיק מעג׳ור",
        _captcha: "false",
        _template: "table",
        "שם מלא": name.value.trim(),
        "טלפון": phone.value.trim(),
        "סוג הישועה": (archForm.querySelector("#aType") || {}).value || "",
        "שם לפרסום": (archForm.querySelector("#aPublic") || {}).value.trim() || "(לא צוין)",
        "הסיפור": story.value.trim(),
        "אישור פרסום": consent && consent.checked ? "כן" : "לא"
      };

      sendLead(data).then(function (j) {
        if (j && (j.success === "true" || j.success === true)) {
          setStatus("תודה מקרב לב! עדותכם התקבלה ותיבדק לפני הפרסום. שתזכו להמשך ישועות! 🕯️", true);
          archForm.reset();
          if (btn) { btn.disabled = false; }
        } else {
          // היעד עדיין לא הופעל / השליחה לא אושרה – מפנים לוואטסאפ (נתיב שעובד תמיד)
          showWaFallback();
        }
      }).catch(function () {
        // נפילה אלגנטית: אם השליחה נחסמה (למשל אינטרנט מסונן) – מציעים וואטסאפ
        showWaFallback();
      });
    });
  }
})();
