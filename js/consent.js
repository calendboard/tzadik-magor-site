/* ============================================================
   הצדיק מעג׳ור — ניהול הסכמה לעוגיות (Cookie consent)
   ------------------------------------------------------------
   • מציג פס עוגיות עד שהמבקר בוחר.
   • "אישור"   → מפעיל Google Analytics + Meta Pixel.
   • "רק הכרחי" → לא מפעיל שום מעקב (רק עוגיות תפעוליות).
   • הבחירה נשמרת בדפדפן (localStorage) ל-12 חודשים.
   מזהי המעקב מרוכזים כאן במקום אחד:
   ============================================================ */
(function () {
  "use strict";

  var GA_ID   = "G-X76DGFH24J";        // Google Analytics
  var PIXEL_ID = "1744112086942113";   // Meta (Facebook) Pixel
  var STORE_KEY = "tz_cookie_consent";
  var MAX_AGE_DAYS = 365;              // אחרי שנה נשאל שוב

  /* ---------- קריאה/כתיבה של הבחירה ---------- */
  function readChoice() {
    try {
      var raw = localStorage.getItem(STORE_KEY);
      if (!raw) return null;
      var obj = JSON.parse(raw);
      var ageDays = (Date.now() - (obj.t || 0)) / 86400000;
      if (ageDays > MAX_AGE_DAYS) return null; // פג תוקף → נשאל מחדש
      return obj.v; // "all" | "essential"
    } catch (e) { return null; }
  }
  function saveChoice(v) {
    try { localStorage.setItem(STORE_KEY, JSON.stringify({ v: v, t: Date.now() })); }
    catch (e) {}
  }

  /* ---------- הפעלת המעקב (רק אחרי אישור) ---------- */
  function grantGoogle() {
    if (typeof window.gtag === "function") {
      window.gtag("consent", "update", {
        ad_storage: "granted",
        analytics_storage: "granted",
        ad_user_data: "granted",
        ad_personalization: "granted"
      });
    }
  }
  function loadMetaPixel() {
    if (window._tzPixelLoaded) return;
    window._tzPixelLoaded = true;
    !function (f, b, e, v, n, t, s) {
      if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
      if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = "2.0"; n.queue = [];
      t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
    }(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
    window.fbq("init", PIXEL_ID);
    window.fbq("track", "PageView");
  }
  function enableAll() { grantGoogle(); loadMetaPixel(); }

  /* ---------- עיצוב הפס (מוזרק פעם אחת) ---------- */
  function injectStyle() {
    if (document.getElementById("tz-consent-style")) return;
    var css =
      '.tz-consent{position:fixed;inset:auto 0 0 0;z-index:9999;' +
      'background:var(--panel,#3a2e1d);color:var(--muted,#cdbf9e);' +
      'border-top:1px solid var(--line-2,rgba(216,179,73,.44));' +
      'box-shadow:0 -14px 40px rgba(0,0,0,.4);' +
      'font-family:inherit;direction:rtl;' +
      'transform:translateY(110%);transition:transform .45s cubic-bezier(.2,.7,.3,1)}' +
      '.tz-consent.tz-show{transform:translateY(0)}' +
      '.tz-consent-in{max-width:1040px;margin:0 auto;padding:16px 20px;' +
      'display:flex;align-items:center;gap:18px;flex-wrap:wrap;justify-content:center}' +
      '.tz-consent-txt{flex:1 1 380px;min-width:260px;font-size:.98rem;line-height:1.6}' +
      '.tz-consent-txt b{color:var(--gold-2,#f7e7a3);font-weight:700}' +
      '.tz-consent-txt a{color:var(--gold,#d8b349);text-decoration:underline;white-space:nowrap}' +
      '.tz-consent-btns{display:flex;gap:10px;flex:0 0 auto}' +
      '.tz-btn{cursor:pointer;border:0;border-radius:12px;padding:11px 22px;' +
      'font-family:inherit;font-size:.98rem;font-weight:700;transition:filter .2s,transform .1s}' +
      '.tz-btn:active{transform:translateY(1px)}' +
      '.tz-btn-yes{background:var(--gold-grad,linear-gradient(135deg,#f7e7a3,#d8b349 45%,#b4842a));color:#1a1206}' +
      '.tz-btn-yes:hover{filter:brightness(1.06)}' +
      '.tz-btn-no{background:transparent;color:var(--muted,#cdbf9e);' +
      'border:1px solid var(--line-2,rgba(216,179,73,.44))}' +
      '.tz-btn-no:hover{color:var(--gold-2,#f7e7a3);border-color:var(--gold,#d8b349)}' +
      '@media(max-width:560px){.tz-consent-in{padding:14px}.tz-consent-btns{width:100%}.tz-btn{flex:1}}';
    var st = document.createElement("style");
    st.id = "tz-consent-style";
    st.textContent = css;
    document.head.appendChild(st);
  }

  /* ---------- בניית הפס והצגתו ---------- */
  function showBanner() {
    injectStyle();
    var bar = document.createElement("div");
    bar.className = "tz-consent";
    bar.setAttribute("role", "dialog");
    bar.setAttribute("aria-label", "הודעת עוגיות");
    bar.innerHTML =
      '<div class="tz-consent-in">' +
        '<div class="tz-consent-txt">🍪 <b>אתר הצדיק מעג׳ור משתמש בעוגיות (cookies)</b> כדי לשפר את חוויית הגלישה שלכם. ' +
        'אפשר לאשר הכל, או לדחות. ' +
        '<a href="privacy.html">מדיניות הפרטיות</a></div>' +
        '<div class="tz-consent-btns">' +
          '<button type="button" class="tz-btn tz-btn-no" id="tzCookieNo">דחיית הכל</button>' +
          '<button type="button" class="tz-btn tz-btn-yes" id="tzCookieYes">אישור הכל</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(bar);
    requestAnimationFrame(function () { bar.classList.add("tz-show"); });

    function close() { bar.classList.remove("tz-show"); setTimeout(function () { bar.remove(); }, 450); }
    document.getElementById("tzCookieYes").addEventListener("click", function () {
      saveChoice("all"); enableAll(); close();
    });
    document.getElementById("tzCookieNo").addEventListener("click", function () {
      saveChoice("essential"); close();
    });
  }

  /* ---------- הפעלה ---------- */
  function start() {
    var choice = readChoice();
    if (choice === "all") { enableAll(); return; }   // כבר אישר בעבר
    if (choice === "essential") { return; }          // בחר הכרחי בלבד
    showBanner();                                    // עדיין לא בחר
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else { start(); }
})();
