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

  /* ---------- כפתורי צף ליצירת קשר (מוקד + וואטסאפ + מייל) ---------- */
  (function () {
    if (document.querySelector(".float-contact")) return;
    var wrap = document.createElement("div");
    wrap.className = "float-contact";
    var ph = document.createElement("a");
    ph.className = "fc-btn fc-phone"; ph.href = "tel:+" + SITE_WA;
    ph.setAttribute("aria-label", "מוקד הצדיק"); ph.title = "מוקד הצדיק — חיוג";
    ph.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="#fff"><path d="M6.62 10.79c1.44 2.83 3.76 5.15 6.59 6.59l2.2-2.2a1 1 0 0 1 1.02-.24c1.12.37 2.33.57 3.57.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1.02l-2.2 2.2z"/></svg>';
    var wa = document.createElement("a");
    wa.className = "fc-btn fc-wa"; wa.href = "https://wa.me/" + SITE_WA;
    wa.target = "_blank"; wa.rel = "noopener"; wa.setAttribute("aria-label", "וואטסאפ"); wa.title = "וואטסאפ";
    wa.innerHTML = '<svg viewBox="0 0 32 32" aria-hidden="true"><path fill="#fff" d="M16 .4C7.4.4.5 7.3.5 15.9c0 2.8.7 5.4 2 7.8L.4 31.6l8.1-2.1c2.3 1.2 4.8 1.9 7.5 1.9 8.6 0 15.5-6.9 15.5-15.5S24.6.4 16 .4zm0 28.4c-2.4 0-4.7-.6-6.7-1.8l-.5-.3-5 1.3 1.3-4.9-.3-.5c-1.3-2.1-2-4.5-2-7 0-7.2 5.9-13.1 13.1-13.1S29.1 8.7 29.1 15.9 23.2 28.8 16 28.8z"/><path fill="#fff" d="M23.2 19.3c-.4-.2-2.3-1.1-2.7-1.3-.4-.1-.6-.2-.9.2-.3.4-1 1.3-1.2 1.5-.2.2-.4.3-.8.1-.4-.2-1.7-.6-3.2-2-1.2-1-2-2.3-2.2-2.7-.2-.4 0-.6.2-.8.2-.2.4-.4.5-.7.2-.2.2-.4.4-.6.1-.2.1-.5 0-.7-.1-.2-.9-2.1-1.2-2.9-.3-.7-.6-.6-.9-.6h-.7c-.2 0-.6.1-1 .5-.3.4-1.3 1.3-1.3 3.1s1.3 3.6 1.5 3.9c.2.2 2.6 4 6.3 5.6.9.4 1.6.6 2.1.8.9.3 1.7.2 2.3.2.7-.1 2.3-.9 2.6-1.8.3-.9.3-1.7.2-1.8-.1-.2-.3-.3-.7-.5z"/></svg>';
    var ml = document.createElement("a");
    ml.className = "fc-btn fc-mail"; ml.href = "mailto:" + SITE_EMAIL;
    ml.setAttribute("aria-label", "אימייל"); ml.title = "שליחת אימייל";
    ml.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2.5" y="4.5" width="19" height="15" rx="2.5"/><path d="M3 7l9 6 9-6"/></svg>';
    var dn = document.createElement("a");
    dn.className = "fc-btn fc-donate"; dn.href = "donate.html";
    dn.setAttribute("aria-label", "תרומה"); dn.title = "לתרומה והקדשה";
    dn.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="#fff"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>';
    wrap.appendChild(ph); wrap.appendChild(wa); wrap.appendChild(dn); wrap.appendChild(ml);
    (document.body || document.documentElement).appendChild(wrap);
  })();

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

  /* ---------- הצפנת פרטי קשר (מפתח ציבורי; פענוח רק עם הקוד הסודי) ---------- */
  var PUBKEY_JWK = {"key_ops":["encrypt"],"ext":true,"kty":"RSA","n":"wtC4YbysgYiRERjhb9aO_BIN2RNBb6DHRW3Knq6dtLQ6ah5muAFjO-WMNo6PAR1CF37teyVgddoF9R1gxQquS5Gxg6ADh3HI_cfITB7jwelzwHF2evhBhvwM0JBGACCJMY7UlsRORixpW_2qK9oLQpTlyjm0jJJ6ZDg7ag87mqDIhWvGNJ3Tj6oIY3I-ZNsXQEIo39EnTgMg7KOfa4d_89Ve2wR47OwrqlqdWOKayU3YWypdtcD9TJYQHIK2JvckDAlIfP2sLLU-v4FEYnvSzNuLfoNCTuTRFqv-ffgpZgjS9EJGja68M8IaeKd67IPFGnBusCWrVO07xJ5MR4Tt2w","e":"AQAB","alg":"RSA-OAEP-256"};
  var _pubKeyP = null;
  function _cryptoOk() { return !!(window.crypto && window.crypto.subtle && window.TextEncoder); }
  function _b64(buf) { var b = new Uint8Array(buf), s = ""; for (var i = 0; i < b.length; i++) s += String.fromCharCode(b[i]); return btoa(s); }
  function _unb64(s) { return Uint8Array.from(atob(s), function (c) { return c.charCodeAt(0); }); }
  function encryptContact(obj) {
    if (!_cryptoOk()) return Promise.resolve("");
    if (!_pubKeyP) _pubKeyP = crypto.subtle.importKey("jwk", PUBKEY_JWK, { name: "RSA-OAEP", hash: "SHA-256" }, false, ["encrypt"]);
    var data = new TextEncoder().encode(JSON.stringify(obj));
    return _pubKeyP.then(function (k) { return crypto.subtle.encrypt({ name: "RSA-OAEP" }, k, data); }).then(_b64).catch(function () { return ""; });
  }
  /* הצפנה היברידית (AES-GCM + RSA) — לטקסט ארוך כמו הודעת צור-קשר.
     פורמט: "rsa(aesKey).iv.aes(data)" (base64, מופרד בנקודות). מחזיר "" בכישלון. */
  function encryptBig(obj) {
    if (!_cryptoOk()) return Promise.resolve("");
    if (!_pubKeyP) _pubKeyP = crypto.subtle.importKey("jwk", PUBKEY_JWK, { name: "RSA-OAEP", hash: "SHA-256" }, false, ["encrypt"]);
    var data = new TextEncoder().encode(JSON.stringify(obj));
    var iv = crypto.getRandomValues(new Uint8Array(12)), aesKey;
    return crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, true, ["encrypt", "decrypt"])
      .then(function (k) { aesKey = k; return crypto.subtle.encrypt({ name: "AES-GCM", iv: iv }, k, data); })
      .then(function (ct) {
        return crypto.subtle.exportKey("raw", aesKey).then(function (rawKey) {
          return _pubKeyP.then(function (pub) { return crypto.subtle.encrypt({ name: "RSA-OAEP" }, pub, rawKey); })
            .then(function (encKey) { return _b64(encKey) + "." + _b64(iv) + "." + _b64(ct); });
        });
      }).catch(function () { return ""; });
  }
  /* פענוח היברידי — דורש שמפתח הפיענוח (_admKey) טעון. מחזיר אובייקט או null. */
  function decryptBig(blob) {
    if (!_admKey || !blob || typeof blob !== "string" || blob.split(".").length !== 3) return Promise.resolve(null);
    var p = blob.split("."), encKey, iv, ct;
    try { encKey = _unb64(p[0]); iv = _unb64(p[1]); ct = _unb64(p[2]); } catch (e) { return Promise.resolve(null); }
    return crypto.subtle.decrypt({ name: "RSA-OAEP" }, _admKey, encKey)
      .then(function (rawKey) { return crypto.subtle.importKey("raw", rawKey, { name: "AES-GCM" }, false, ["decrypt"]); })
      .then(function (aesKey) { return crypto.subtle.decrypt({ name: "AES-GCM", iv: iv }, aesKey, ct); })
      .then(function (buf) { return JSON.parse(new TextDecoder().decode(buf)); })
      .catch(function () { return null; });
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

    /* כפתור "עוד פעם" במסך ההצלחה — מאפס וחוזר לטופס */
    if (success) {
      var again = success.querySelector(".ls-again");
      if (again && !again._wired) {
        again._wired = true;
        again.addEventListener("click", function () {
          form.reset();
          form.style.display = "";
          success.hidden = true;
          if (status) status.textContent = "";
          if (btn) btn.disabled = false;
          form.scrollIntoView({ behavior: "smooth", block: "center" });
          var f0 = form.querySelector("input, textarea, select"); if (f0) f0.focus();
        });
      }
    }

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
            if (g("[name=deceased]")) appendCandle({ name: g("[name=deceased]"), family: g("[name=family]"), deathdate: g("[name=deathdate]"), dedication: g("[name=dedication]"), by: g("[name=name]"), phone: g("[name=phone]"), email: g("[name=email]") });
          }
          if (form.getAttribute("data-prayer") === "1") {
            var gp = function (s) { var el = form.querySelector(s); return el ? el.value.trim() : ""; };
            if (gp("[name=pray_name]")) appendPrayer({ name: gp("[name=pray_name]"), request: gp("[name=request]"), by: gp("[name=name]"), phone: gp("[name=phone]"), email: gp("[name=email]") });
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
  /* מזהה ייחודי לכל פריט — מאפשר זיהוי כפילויות ואימות אחרי כתיבה */
  function uid() { return Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 9); }
  /* מוסיף פריט למערך בקופסה (candles/prayers) תוך שמירה על שאר המבנה.
     עמיד ל"lost update": קורא טרי לפני כל כתיבה, מאמת שהפריט נשמר,
     ואם נדרס ע"י כתיבה מקבילה — מנסה שוב עם השהיה אקראית (עד 5 פעמים). */
  function appendToBin(key, item, after, _try) {
    _try = _try || 0;
    if (!item._id) item._id = uid();
    fetch(CANDLE_API + "/latest", { headers: { "X-Bin-Meta": "false" }, cache: "no-store" })
      .then(function (r) { return r.json(); })
      .then(function (rec) {
        rec = rec || {};
        if (!Array.isArray(rec.candles)) rec.candles = [];
        if (!Array.isArray(rec.prayers)) rec.prayers = [];
        if (!Array.isArray(rec.contacts)) rec.contacts = [];
        if (!Array.isArray(rec.stories)) rec.stories = [];
        var exists = rec[key].some(function (x) { return x && x._id === item._id; });
        if (!exists) rec[key].push(item);
        return fetch(CANDLE_API, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(rec) });
      })
      .then(function () {
        /* אימות: לקרוא שוב ולוודא שהפריט באמת שם */
        return fetch(CANDLE_API + "/latest", { headers: { "X-Bin-Meta": "false" }, cache: "no-store" }).then(function (r) { return r.json(); });
      })
      .then(function (rec) {
        var ok = rec && Array.isArray(rec[key]) && rec[key].some(function (x) { return x && x._id === item._id; });
        if (ok) { if (after) after(); return; }
        if (_try < 5) { setTimeout(function () { appendToBin(key, item, after, _try + 1); }, 250 + Math.floor(Math.random() * 600)); }
        else if (after) after();
      })
      .catch(function () {
        if (_try < 5) { setTimeout(function () { appendToBin(key, item, after, _try + 1); }, 250 + Math.floor(Math.random() * 600)); }
      });
  }
  function appendCandle(c) {
    c = c || {};
    encryptContact({ by: c.by || "", phone: c.phone || "", email: c.email || "" }).then(function (enc) {
      appendToBin("candles", {
        name: String(c.name || "").substring(0, 80),
        family: String(c.family || "").substring(0, 60),
        deathdate: String(c.deathdate || "").substring(0, 40),
        dedication: String(c.dedication || "").substring(0, 60),
        date: new Date().toISOString().slice(0, 10),
        enc: enc
      }, loadCandleWall);
    });
  }
  function appendPrayer(p) {
    p = p || {};
    encryptContact({ by: p.by || "", phone: p.phone || "", email: p.email || "" }).then(function (enc) {
      appendToBin("prayers", {
        name: String(p.name || "").substring(0, 80),
        request: String(p.request || "").substring(0, 40),
        date: new Date().toISOString().slice(0, 10),
        enc: enc
      });
    });
  }
  /* שמירת ישועה אישית לדשבורד — ממתינה לאישור. פרטי המוסר (שם/טלפון) מוצפנים;
     שדות הפרסום (סוג, שם לפרסום, הסיפור) גלויים כי הם מיועדים לפרסום לאחר אישור. */
  function appendStory(s) {
    s = s || {};
    encryptBig({ name: s.name || "", phone: s.phone || "" }).then(function (encb) {
      appendToBin("stories", {
        type: String(s.type || "").substring(0, 40),
        public_name: String(s.public_name || "").substring(0, 60),
        story: String(s.story || "").substring(0, 1500),
        status: "pending",
        date: new Date().toISOString().slice(0, 10),
        ts: new Date().toISOString(),
        encb: encb
      });
    });
  }
  /* שמירת פניית "צור קשר" לדשבורד — מוצפן היברידי (כל הפרטים + הודעה מלאה) */
  function appendContact(c) {
    c = c || {};
    encryptBig({ name: c.name || "", phone: c.phone || "", topic: c.topic || "", message: c.message || "" }).then(function (encb) {
      appendToBin("contacts", {
        topic: String(c.topic || "").substring(0, 60),
        date: new Date().toISOString().slice(0, 10),
        ts: new Date().toISOString(),
        encb: encb
      });
    });
  }
  var _candles = [];
  function fmtDate(d) {
    if (!d) return "";
    var p = String(d).slice(0, 10).split("-");
    return p.length === 3 ? p[2] + "." + p[1] + "." + p[0] : "";
  }
  /* המרת מספר לגימטריה עברית (עם גרש/גרשיים, וטיפול ב-ט״ו/ט״ז) */
  function _gem(num) {
    var L = [[400, "ת"], [300, "ש"], [200, "ר"], [100, "ק"], [90, "צ"], [80, "פ"], [70, "ע"], [60, "ס"], [50, "נ"], [40, "מ"], [30, "ל"], [20, "כ"], [10, "י"], [9, "ט"], [8, "ח"], [7, "ז"], [6, "ו"], [5, "ה"], [4, "ד"], [3, "ג"], [2, "ב"], [1, "א"]];
    var n = num, s = "";
    for (var i = 0; i < L.length; i++) { while (n >= L[i][0]) { s += L[i][1]; n -= L[i][0]; } }
    s = s.replace("יה", "טו").replace("יו", "טז");
    if (s.length === 1) return s + "׳";
    return s.slice(0, -1) + "״" + s.slice(-1);
  }
  /* תאריך עברי בגימטריה: ט״ו בתמוז תשפ״ו */
  function _hebDate(dt) {
    try {
      var parts = new Intl.DateTimeFormat("he-u-ca-hebrew-nu-latn", { day: "numeric", month: "long", year: "numeric" }).formatToParts(dt);
      var day, month, year;
      parts.forEach(function (p) { if (p.type === "day") day = parseInt(p.value, 10); else if (p.type === "month") month = p.value; else if (p.type === "year") year = parseInt(p.value, 10); });
      if (!day || !month || !year) return "";
      return _gem(day) + " ב" + month.replace(/^ב/, "") + " " + _gem(year % 1000);
    } catch (e) { return ""; }
  }
  /* תאריך מלא לדשבורד: יום בשבוע · לועזי · עברי */
  function fmtFullDate(d) {
    if (!d) return "";
    var dt = new Date(String(d).slice(0, 10) + "T12:00:00");
    if (isNaN(dt)) return fmtDate(d);
    var parts = [];
    try { parts.push(new Intl.DateTimeFormat("he-IL", { weekday: "long" }).format(dt)); } catch (e) {}
    var g = fmtDate(d); if (g) parts.push(g);
    var h = _hebDate(dt); if (h) parts.push(h);
    return parts.join(" · ");
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

  /* ---------- ישועות מהקהל (מאושרות) בדף הישועות ---------- */
  function loadUserStories() {
    var box = document.getElementById("userStories");
    if (!box) return;
    fetch(CANDLE_API + "/latest", { headers: { "X-Bin-Meta": "false" } })
      .then(function (r) { return r.json(); })
      .then(function (rec) {
        var list = (((rec && rec.stories) || []).filter(function (s) { return s && s.status === "approved"; })).reverse();
        var head = document.getElementById("userStoriesHead");
        if (!list.length) { box.style.display = "none"; if (head) head.style.display = "none"; return; }
        box.style.display = ""; if (head) head.style.display = "";
        box.innerHTML = "";
        list.slice(0, 200).forEach(function (s) {
          var f = document.createElement("figure"); f.className = "testimony-card";
          f.innerHTML = '<span class="tc-tag"></span><blockquote class="tc-body"></blockquote><figcaption class="tc-by"><b></b></figcaption>';
          f.querySelector(".tc-tag").textContent = s.type || "ישועה";
          f.querySelector(".tc-body").textContent = s.story || "";
          f.querySelector(".tc-by b").textContent = s.public_name || "מתפלל/ת (בעילום שם)";
          box.appendChild(f);
        });
      })
      .catch(function () { box.style.display = "none"; });
  }
  loadUserStories();

  /* ---------- דף הרשימות (admin): שמות לתפילה + נרות, עם תאריך וסינון ---------- */
  var _admData = null, _admDays = null, _admDate = "";
  function withinDays(dateStr, days) {
    if (days == null) return true;
    var d = new Date(String(dateStr).slice(0, 10) + "T00:00:00");
    if (isNaN(d)) return true;
    var t = new Date(); t.setHours(0, 0, 0, 0);
    var diff = Math.floor((t - d) / 86400000);
    return diff >= 0 && diff <= days;
  }
  /* מסנן רשומה: אם נבחר יום מהלוח — בדיוק היום הזה; אחרת לפי טווח הימים */
  function admPass(dateStr) {
    if (_admDate) return String(dateStr || "").slice(0, 10) === _admDate;
    return withinDays(dateStr, _admDays);
  }
  function admLine(c) {
    var t = c.name || "";
    if (c.family) t += " · למשפחת " + c.family;
    if (c.deathdate) t += " · " + c.deathdate;
    if (c.dedication) t += " · " + c.dedication;
    return t;
  }
  var _admKey = null;
  function admContact(span, enc) {
    if (!span || !_admKey || !enc) return;
    var raw; try { raw = _unb64(enc); } catch (e) { return; }
    crypto.subtle.decrypt({ name: "RSA-OAEP" }, _admKey, raw)
      .then(function (buf) {
        var ct = JSON.parse(new TextDecoder().decode(buf)), parts = [];
        if (ct.phone) parts.push("📞 " + ct.phone);
        if (ct.email) parts.push("✉ " + ct.email);
        if (ct.by) parts.push("(" + ct.by + ")");
        span.textContent = parts.length ? "  ·  " + parts.join("   ") : "";
        span.className = "adm-contact show";
      }).catch(function () {});
  }
  /* בונה שורה אחת (תפילה/נר) עם תצוגה + כפתורי עריכה/מחיקה (רק כשפתוח עם קוד) */
  function admRow(kind, item) {
    var li = document.createElement("li");
    var wrap = document.createElement("div"); wrap.className = "adm-rowwrap";
    var view = document.createElement("span"); view.className = "adm-view";
    if (kind === "prayers") {
      view.innerHTML = '<b></b><span class="adm-req"></span><span class="adm-date"></span><span class="adm-contact"></span>';
      view.querySelector("b").textContent = item.name || "";
      view.querySelector(".adm-req").textContent = item.request ? " — " + item.request : "";
      view.querySelector(".adm-date").textContent = item.date ? fmtFullDate(item.date) : "";
      admContact(view.querySelector(".adm-contact"), item.enc);
    } else {
      view.innerHTML = '<span class="adm-main"></span><span class="adm-date"></span><span class="adm-contact"></span>';
      view.querySelector(".adm-main").textContent = admLine(item);
      view.querySelector(".adm-date").textContent = item.date ? fmtFullDate(item.date) : "";
      admContact(view.querySelector(".adm-contact"), item.enc);
    }
    wrap.appendChild(view);
    if (_admKey) {
      var acts = document.createElement("span"); acts.className = "adm-acts";
      var ed = document.createElement("button"); ed.type = "button"; ed.className = "adm-btn"; ed.textContent = "✏️"; ed.title = "עריכה";
      ed.onclick = function () { admOpenEdit(wrap, kind, item); };
      var del = document.createElement("button"); del.type = "button"; del.className = "adm-btn adm-del"; del.textContent = "🗑️"; del.title = "מחיקה";
      del.onclick = function () { if (confirm("למחוק את הרשומה?\n" + (kind === "prayers" ? (item.name || "") : admLine(item)))) admDelete(kind, item._id); };
      acts.appendChild(ed); acts.appendChild(del);
      wrap.appendChild(acts);
    }
    li.appendChild(wrap);
    return li;
  }
  /* בונה טופס עם השדות המתאימים (משמש גם לעריכה וגם להוספה) */
  function admFormEl(kind, item, onSave) {
    var form = document.createElement("div"); form.className = "adm-edit";
    function fld(label, key, val) {
      var w = document.createElement("label"); w.className = "adm-fld";
      var s = document.createElement("span"); s.textContent = label;
      var inp = document.createElement("input"); inp.type = "text"; inp.value = val || ""; inp.setAttribute("data-key", key);
      w.appendChild(s); w.appendChild(inp); return w;
    }
    function area(label, key, val) {
      var w = document.createElement("label"); w.className = "adm-fld";
      var s = document.createElement("span"); s.textContent = label;
      var inp = document.createElement("textarea"); inp.rows = 5; inp.value = val || ""; inp.setAttribute("data-key", key);
      w.appendChild(s); w.appendChild(inp); return w;
    }
    if (kind === "prayers") {
      form.appendChild(fld("שם לתפילה", "name", item.name));
      form.appendChild(fld("בקשה", "request", item.request));
      form.appendChild(fld("תאריך (YYYY-MM-DD)", "date", item.date));
    } else if (kind === "stories") {
      form.appendChild(fld("סוג הישועה", "type", item.type));
      form.appendChild(fld("שם לפרסום", "public_name", item.public_name));
      form.appendChild(area("הסיפור", "story", item.story));
      form.appendChild(fld("תאריך (YYYY-MM-DD)", "date", item.date));
    } else {
      form.appendChild(fld("שם הנפטר/ת", "name", item.name));
      form.appendChild(fld("למשפחת", "family", item.family));
      form.appendChild(fld("תאריך פטירה", "deathdate", item.deathdate));
      form.appendChild(fld("הקדשה", "dedication", item.dedication));
      form.appendChild(fld("תאריך (YYYY-MM-DD)", "date", item.date));
    }
    var bar = document.createElement("div"); bar.className = "adm-editbar";
    var save = document.createElement("button"); save.type = "button"; save.className = "adm-btn adm-save"; save.textContent = "💾 שמירה";
    var cancel = document.createElement("button"); cancel.type = "button"; cancel.className = "adm-btn"; cancel.textContent = "ביטול";
    save.onclick = function () {
      var fields = {};
      form.querySelectorAll("[data-key]").forEach(function (inp) { fields[inp.getAttribute("data-key")] = inp.value.trim(); });
      if (kind === "stories") { if (!fields.story) { alert("חובה למלא את הסיפור 🙏"); return; } }
      else if (!fields.name) { alert("חובה למלא שם 🙏"); return; }
      save.disabled = true; save.textContent = "שומר…";
      onSave(fields);
    };
    cancel.onclick = function () { renderAdmin(); };
    bar.appendChild(save); bar.appendChild(cancel);
    form.appendChild(bar);
    return form;
  }
  /* טופס עריכה inline בתוך השורה */
  function admOpenEdit(wrap, kind, item) {
    var form = admFormEl(kind, item, function (fields) { admEdit(kind, item._id, fields); });
    wrap.innerHTML = ""; wrap.appendChild(form);
    var f0 = form.querySelector("input"); if (f0) f0.focus();
  }
  /* הוספת רשומה חדשה (נר/תפילה/ישועה) ידנית מהדשבורד */
  function admAdd(kind) {
    if (!_admKey) return;
    var listId = kind === "prayers" ? "prayerList" : kind === "stories" ? "storyAdminList" : "candleList";
    var listEl = document.getElementById(listId);
    if (!listEl) return;
    if (listEl.querySelector(".adm-newrow")) return;
    var today = new Date().toISOString().slice(0, 10);
    var li = document.createElement("li"); li.className = "adm-newrow";
    var form = admFormEl(kind, { date: today }, function (fields) {
      fields.date = fields.date || today;
      fields._id = uid();
      if (kind === "stories") fields.status = "approved";
      admPersist(function (rec) { rec[kind].push(fields); }, function (ok) { if (!ok) alert("ההוספה נכשלה, נסו שוב 🙏"); });
    });
    li.appendChild(form);
    listEl.insertBefore(li, listEl.firstChild);
    var f0 = form.querySelector("input, textarea"); if (f0) f0.focus();
  }
  /* קריאה טרייה → שינוי לפי _id → כתיבה → אימות → רענון התצוגה */
  function admPersist(mutator, after) {
    fetch(CANDLE_API + "/latest", { headers: { "X-Bin-Meta": "false" }, cache: "no-store" })
      .then(function (r) { return r.json(); })
      .then(function (rec) {
        rec = rec || {};
        if (!Array.isArray(rec.candles)) rec.candles = [];
        if (!Array.isArray(rec.prayers)) rec.prayers = [];
        if (!Array.isArray(rec.contacts)) rec.contacts = [];
        if (!Array.isArray(rec.stories)) rec.stories = [];
        mutator(rec);
        return fetch(CANDLE_API, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(rec) })
          .then(function () { return fetch(CANDLE_API + "/latest", { headers: { "X-Bin-Meta": "false" }, cache: "no-store" }); })
          .then(function (r) { return r.json(); })
          .then(function (rec2) { _admData = rec2 || {}; renderAdmin(); if (after) after(true); });
      })
      .catch(function () { if (after) after(false); });
  }
  function admEdit(kind, id, fields) {
    admPersist(function (rec) {
      (rec[kind] || []).forEach(function (it) { if (it && it._id === id) { for (var k in fields) it[k] = fields[k]; } });
    }, function (ok) { if (!ok) { alert("השמירה נכשלה, נסו שוב 🙏"); renderAdmin(); } });
  }
  function admDelete(kind, id) {
    admPersist(function (rec) {
      rec[kind] = (rec[kind] || []).filter(function (x) { return !(x && x._id === id); });
    }, function (ok) { if (!ok) alert("המחיקה נכשלה, נסו שוב 🙏"); });
  }
  /* שורת פניית "צור קשר" — מפוענחת רק כשהקוד מוזן */
  function admContactRow(item) {
    var li = document.createElement("li");
    var wrap = document.createElement("div"); wrap.className = "adm-rowwrap";
    var view = document.createElement("span"); view.className = "adm-view";
    view.innerHTML = '<b class="adm-cname"></b><span class="adm-cphone adm-contact"></span><span class="adm-ctopic"></span><div class="adm-cmsg"></div><span class="adm-date"></span>';
    view.querySelector(".adm-ctopic").textContent = item.topic ? (" · " + item.topic) : "";
    view.querySelector(".adm-date").textContent = item.date ? fmtFullDate(item.date) : "";
    if (_admKey) {
      view.querySelector(".adm-cname").textContent = "מפענח…";
      decryptBig(item.encb).then(function (o) {
        if (o) {
          view.querySelector(".adm-cname").textContent = o.name || "(ללא שם)";
          view.querySelector(".adm-cphone").textContent = o.phone ? ("  📞 " + o.phone) : "";
          view.querySelector(".adm-cmsg").textContent = o.message || "";
        } else { view.querySelector(".adm-cname").textContent = "(שגיאת פענוח)"; }
      });
    } else {
      view.querySelector(".adm-cname").textContent = "🔒 פנייה";
      view.querySelector(".adm-cmsg").textContent = "הזינו את הקוד לצפייה בפרטים";
    }
    wrap.appendChild(view);
    if (_admKey) {
      var acts = document.createElement("span"); acts.className = "adm-acts";
      var del = document.createElement("button"); del.type = "button"; del.className = "adm-btn adm-del"; del.textContent = "🗑️"; del.title = "מחיקה";
      del.onclick = function () { if (confirm("למחוק את הפנייה?")) admDelete("contacts", item._id); };
      acts.appendChild(del); wrap.appendChild(acts);
    }
    li.appendChild(wrap);
    return li;
  }
  /* שורת ישועה אישית בדשבורד — עם אישור/הסתרה/עריכה/מחיקה */
  function admStoryRow(item) {
    var li = document.createElement("li");
    var wrap = document.createElement("div"); wrap.className = "adm-rowwrap";
    var approved = item.status === "approved";
    var view = document.createElement("span"); view.className = "adm-view";
    view.innerHTML = '<b class="adm-cname"></b><span class="adm-status"></span><span class="adm-ctopic"></span><div class="adm-cmsg"></div><span class="adm-cphone adm-contact"></span><span class="adm-date"></span>';
    view.querySelector(".adm-cname").textContent = item.public_name || "(ללא שם פרסום)";
    var st = view.querySelector(".adm-status"); st.textContent = approved ? "✓ מפורסם" : "⏳ ממתין"; st.className = "adm-status " + (approved ? "st-approved" : "st-pending");
    view.querySelector(".adm-ctopic").textContent = item.type ? (" · " + item.type) : "";
    view.querySelector(".adm-cmsg").textContent = item.story || "";
    view.querySelector(".adm-date").textContent = item.date ? fmtFullDate(item.date) : "";
    if (_admKey) { decryptBig(item.encb).then(function (o) { if (o) view.querySelector(".adm-cphone").textContent = "  (" + (o.name || "") + (o.phone ? " · 📞 " + o.phone : "") + ")"; }); }
    wrap.appendChild(view);
    if (_admKey) {
      var acts = document.createElement("span"); acts.className = "adm-acts";
      var ap = document.createElement("button"); ap.type = "button"; ap.className = "adm-btn adm-approve"; ap.textContent = approved ? "↩️ הסתרה" : "✓ אישור";
      ap.onclick = function () { admSetStoryStatus(item._id, approved ? "pending" : "approved"); };
      var ed = document.createElement("button"); ed.type = "button"; ed.className = "adm-btn"; ed.textContent = "✏️"; ed.title = "עריכה";
      ed.onclick = function () { admOpenEdit(wrap, "stories", item); };
      var del = document.createElement("button"); del.type = "button"; del.className = "adm-btn adm-del"; del.textContent = "🗑️"; del.title = "מחיקה";
      del.onclick = function () { if (confirm("למחוק את הישועה?")) admDelete("stories", item._id); };
      acts.appendChild(ap); acts.appendChild(ed); acts.appendChild(del);
      wrap.appendChild(acts);
    }
    li.appendChild(wrap);
    return li;
  }
  function admSetStoryStatus(id, status) {
    admPersist(function (rec) { (rec.stories || []).forEach(function (it) { if (it && it._id === id) it.status = status; }); },
      function (ok) { if (!ok) alert("הפעולה נכשלה, נסו שוב 🙏"); });
  }
  function renderAdmin() {
    if (!_admData) return;
    var pWrap = document.getElementById("prayerList");
    var cWrap = document.getElementById("candleList");
    var ctWrap = document.getElementById("contactList");
    var saWrap = document.getElementById("storyAdminList");
    var prayers = (_admData.prayers || []).slice().reverse().filter(function (p) { return admPass(p.date); });
    var candles = (_admData.candles || []).slice().reverse().filter(function (c) { return admPass(c.date); });
    var contacts = (_admData.contacts || []).slice().reverse().filter(function (c) { return admPass(c.date); });
    var stories = (_admData.stories || []).slice().reverse().filter(function (s) { return admPass(s.date); });
    var pc = document.getElementById("prayerCount"); if (pc) pc.textContent = prayers.length;
    var clc = document.getElementById("candleListCount"); if (clc) clc.textContent = candles.length;
    var ctc = document.getElementById("contactCount"); if (ctc) ctc.textContent = contacts.length;
    var sac = document.getElementById("storyAdminCount"); if (sac) sac.textContent = stories.filter(function (s) { return s.status !== "approved"; }).length;
    if (saWrap) {
      saWrap.innerHTML = stories.length ? "" : '<li class="adm-empty">אין ישועות בטווח זה.</li>';
      stories.forEach(function (s) { saWrap.appendChild(admStoryRow(s)); });
    }
    if (pWrap) {
      pWrap.innerHTML = prayers.length ? "" : '<li class="adm-empty">אין רשומות בטווח זה.</li>';
      prayers.forEach(function (p) { pWrap.appendChild(admRow("prayers", p)); });
    }
    if (cWrap) {
      cWrap.innerHTML = candles.length ? "" : '<li class="adm-empty">אין רשומות בטווח זה.</li>';
      candles.forEach(function (c) { cWrap.appendChild(admRow("candles", c)); });
    }
    if (ctWrap) {
      ctWrap.innerHTML = contacts.length ? "" : '<li class="adm-empty">אין פניות בטווח זה.</li>';
      contacts.forEach(function (c) { ctWrap.appendChild(admContactRow(c)); });
    }
  }
  function admSetKey(jwkStr, after) {
    if (!_cryptoOk()) { if (after) after(false); return; }
    var jwk; try { jwk = JSON.parse(jwkStr); } catch (e) { if (after) after(false); return; }
    crypto.subtle.importKey("jwk", jwk, { name: "RSA-OAEP", hash: "SHA-256" }, false, ["decrypt"])
      .then(function (k) { _admKey = k; if (after) after(true); })
      .catch(function () { if (after) after(false); });
  }
  function admUpdLock() {
    var lk = document.getElementById("admLockState");
    if (lk) lk.textContent = _admKey ? "🔓 פתוח — אפשר לערוך, להוסיף ולראות פרטי קשר" : "🔒 הזינו את הקוד הסודי כדי לערוך ולהוסיף";
    var lb = document.getElementById("admLock"); if (lb) lb.hidden = !_admKey;
    var addP = document.getElementById("addPrayer"); if (addP) addP.classList.toggle("hidden", !_admKey);
    var addC = document.getElementById("addCandle"); if (addC) addC.classList.toggle("hidden", !_admKey);
    var addS = document.getElementById("addStory"); if (addS) addS.classList.toggle("hidden", !_admKey);
  }
  function loadAdminLists() {
    if (!document.getElementById("prayerList") && !document.getElementById("candleList")) return;
    function fetchAndRender() {
      fetch(CANDLE_API + "/latest", { headers: { "X-Bin-Meta": "false" }, cache: "no-store" })
        .then(function (r) { return r.json(); })
        .then(function (rec) {
          rec = rec || {};
          var changed = false;
          ["candles", "prayers", "contacts", "stories"].forEach(function (k) {
            if (!Array.isArray(rec[k])) rec[k] = [];
            rec[k].forEach(function (it) { if (it && !it._id) { it._id = uid(); changed = true; } });
          });
          _admData = rec; renderAdmin();
          if (changed) { fetch(CANDLE_API, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(rec) }).catch(function () {}); }
        })
        .catch(function () { var p = document.getElementById("prayerList"); if (p) p.innerHTML = '<li class="adm-empty">לא ניתן לטעון כעת. נסו לרענן.</li>'; });
    }
    var saved = null; try { saved = localStorage.getItem("admKey"); } catch (e) {}
    if (saved) admSetKey(saved, function () { admUpdLock(); fetchAndRender(); });
    else { admUpdLock(); fetchAndRender(); }
    var unlock = document.getElementById("admUnlock");
    if (unlock && !unlock._wired) {
      unlock._wired = true;
      unlock.addEventListener("click", function () {
        var inp = document.getElementById("admCode"), code = inp ? inp.value.trim() : "";
        if (!code) return;
        admSetKey(code, function (ok) {
          if (!ok) { alert("הקוד אינו תקין. ודאו שהדבקתם את הקוד המלא."); return; }
          try { localStorage.setItem("admKey", code); } catch (e) {}
          if (inp) inp.value = "";
          admUpdLock(); renderAdmin();
        });
      });
    }
    var lockBtn = document.getElementById("admLock");
    if (lockBtn && !lockBtn._wired) {
      lockBtn._wired = true;
      lockBtn.addEventListener("click", function () {
        _admKey = null;
        try { localStorage.removeItem("admKey"); } catch (e) {}
        admUpdLock(); renderAdmin();
      });
    }
    var addP = document.getElementById("addPrayer");
    if (addP && !addP._wired) { addP._wired = true; addP.addEventListener("click", function () { admAdd("prayers"); }); }
    var addC = document.getElementById("addCandle");
    if (addC && !addC._wired) { addC._wired = true; addC.addEventListener("click", function () { admAdd("candles"); }); }
    var addS = document.getElementById("addStory");
    if (addS && !addS._wired) { addS._wired = true; addS.addEventListener("click", function () { admAdd("stories"); }); }
    var fb = document.getElementById("admFilter");
    if (fb && !fb._wired) {
      fb._wired = true;
      fb.addEventListener("click", function (e) {
        var b = e.target.closest("[data-days]"); if (!b) return;
        var v = b.getAttribute("data-days");
        _admDays = (v === "" || v == null) ? null : parseInt(v, 10);
        _admDate = "";
        var dp = document.getElementById("admDatePick"); if (dp) dp.value = "";
        fb.querySelectorAll("[data-days]").forEach(function (x) { x.classList.toggle("active", x === b); });
        renderAdmin();
      });
    }
    var dpick = document.getElementById("admDatePick");
    if (dpick && !dpick._wired) {
      dpick._wired = true;
      dpick.addEventListener("change", function () {
        _admDate = dpick.value || "";
        if (_admDate && fb) fb.querySelectorAll("[data-days]").forEach(function (x) { x.classList.remove("active"); });
        renderAdmin();
      });
    }
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

      /* שמירה לדשבורד (מוצפן) — בנוסף למייל */
      appendContact({ name: name.value.trim(), phone: phone.value.trim(), topic: (topic || {}).value || "", message: (msg || {}).value.trim() });

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
    var site = location.origin + "/";
    var msg = "🕯️ *הצדיק מעג׳ור — רבי יצחק גברא זצ״ל*\nפועל הישועות\n\n" +
      "תולדות חייו, סגולות, סיפורי מופת, הדלקת נר נשמה ומסירת שם לתפילה על הציון 👇\n" +
      site + "\n\nשתפו ותזכו לזכות הצדיק!";
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
      { tag: "גילוי הציון", img: "assets/stories/01_discovery.jpg",
        title: "החלום שגילה את הציון",
        sum: "זקנה חלמה — ונתגלה מקום הקבר",
        full: "במשך שנים לא ידעו היכן טמון הצדיק. אישה זקנה שגרה סמוך לעץ החרוב חלמה חלום, ובו נגלה אליה רבי יצחק גברא ואמר לה: “שמי רבי יצחק גברא, אני קבור תחת עץ החרוב הסמוך לביתך… למה בני אינם באים אליי?”. הוא ביקש ממנה להעביר את הדברים לשלושה רבנים — וכך נתגלה מקום הציון הקדוש, ומאז פוקדים אותו רבים.",
        source: "מקור: ״שחרית״, עמ׳ 18 · מסורת מקומית" },
      { tag: "פרי בטן", img: "assets/stories/02_baby.jpg",
        title: "האברך שנפקד",
        sum: "שנים ללא ילדים — ונפקד",
        full: "אברך שלא נפקד בילדים שנים רבות עלה אל ציון הצדיק, שפך את לבו בתפילה ובבכי, וביקש שיפקדהו בזרע של קיימא. כעבור זמן לא רב נפקד בבן וזכה לראות ישועה.",
        source: "מקור: ״שחרית״, עמ׳ 18" },
      { tag: "רפואה", img: "assets/stories/03_heal.jpg",
        title: "הנער שהחלים",
        sum: "נער חולה במחלה קשה — והבריא",
        full: "נער שחלה במחלה קשה הובא אל ציון הצדיק, ובני משפחתו שפכו עליו תפילה ובקשת רחמים. בתוך זמן קצר חלה תפנית במצבו, והנער החלים והבריא.",
        source: "מקור: ״שחרית״, עמ׳ 18" },
      { tag: "פרנסה", img: "assets/stories/04_parnasa.jpg",
        title: "מצא פרנסה",
        sum: "חיפש עבודה — והתקבל לעבודה טובה",
        full: "בחור שחיפש עבודה זמן רב עלה אל ציון הצדיק וביקש שייפתחו לו שערי פרנסה. עוד באותם ימים נפתחה לפניו דלת, והוא התקבל לעבודה טובה ומכובדת.",
        source: "מקור: ״שחרית״, עמ׳ 18" },
      { tag: "זיווג", img: "assets/stories/05_engage.jpg",
        title: "התארס בליל ההילולה",
        sum: "רווק מבוגר — והתארס בליל ההילולה",
        full: "רווק מבוגר שהתקשה שנים למצוא את זיווגו עלה אל ציון הצדיק בימי ההילולא, שפך את לבו וביקש על זיווגו ההגון. עוד באותו הלילה, ליל ההילולא, נקשר שידוכו והוא התארס בשעה טובה ומוצלחת.",
        source: "מקור: ״שחרית״, עמ׳ 18" },
      { tag: "רפואה", img: "assets/stories/06_heart.jpg",
        title: "המום שבלב — שנעלם",
        sum: "התפלל על נכדו — והניתוח התבטל",
        full: "נהג מונית שהסיע נוסעים לציון התפלל שם על נכדו הקטן, שעמד לפני ניתוח לב. בעודו יוצא מן הציון קיבל טלפון מבני המשפחה: הבעיה “נפתרה מאליה”, והרופאים הודיעו שאין עוד צורך בניתוח.",
        source: "מקור: ״שחרית״, עמ׳ 18" },
      { tag: "שלום בית", img: "assets/stories/07_shalombayit.jpg",
        title: "שלום בית אחרי שבע שנים",
        sum: "התפללה בבכי — ולמחרת צלצלה הבת",
        full: "אם התפללה בבכי על הציון שיחזור השלום בינה לבין בתה, לאחר נתק של שבע שנים. למחרת בבוקר צלצלה הבת מחוץ לארץ ואמרה: “אמא, התגעגעתי אלייך”. הסכסוך הישן הוסדר, והשלום שב לבית.",
        source: "מקור: ״שחרית״, עמ׳ 18" },
      { tag: "זיווג", img: "assets/stories/08_zivug.jpg",
        title: "הזיווג שנפתח",
        sum: "בחור התקשה בשידוך — וראה ישועה",
        full: "בחור שהתקשה שנים למצוא את זיווגו השתטח על הציון וביקש ישועה. סמוך לאחר מכן נפתח שידוכו ומצא את בת זוגו. סיפורי זיווג רבים נקשרים סביב הציון, ורבים מבקשים עליו לזיווג הגון.",
        source: "מקור: ״אביר יעקב״ · מסורת" },
      { tag: "הצלה", img: "assets/stories/09_book.jpg",
        title: "נפל מהגמל — ונמצא לומד",
        sum: "הגמל התרסק בוואדי — והוא יושב כרגיל",
        full: "בעת מסע על גבי גמל נפל הגמל אל תוך ואדי עמוק. כשירדו לחפש, מצאו את חלקי הגמל מפוזרים — ואת רבי יצחק יושב בשלום בתחתית הוואדי ולומד כדרכו, כאילו לא אירע דבר.",
        source: "מקור: ערוץ 2000, בשם הרב שמעון פוקס" },
      { tag: "נבואה", img: "assets/stories/10_rain.jpg",
        title: "גשם בתמוז — כאות",
        sum: "ניבא שירד גשם בקבורתו — וכך היה",
        full: "רבי יצחק ביקש להיקבר תחת עץ החרוב שמול ביתו, ואמר שזה יהיה הסימן. עוד הוסיף וניבא שייקבר בערב שבת, ושביום קבורתו — אף שהוא בתקופת תמוז שאין בה גשמים — ירד גשם. וכך אכן היה: בשעת ההלוויה ירדו גשם וזלעפות, וקוימו דבריו.",
        source: "מקור: ״אביר יעקב״ · JDN · מסורת משפחתית" },
      { tag: "קדושת המקום", img: "assets/stories/11_stone.jpg",
        title: "הטרקטור שלא הצליח",
        sum: "ניסו להזיז את הציון — ולא עלתה בידם",
        full: "לאורך השנים נעשו ניסיונות לפנות או להזיז את הציון. באחד מהם, פועלים שניסו לישר את הקרקע סמוך לציון שמעו קול הקורא בשמם; וכשהמשיכו — הטרקטור התהפך. בניסיון אחר הוסטה ידו של מי שהניף את הכלי והוא נחבל. מאז חדלו, והציון נותר על מקומו.",
        source: "מקור: ״שחרית״, עמ׳ 17–18 · ״אביר " },
      { tag: `פרי בטן`, img: `assets/stories/12_twins.jpg`,
        title: `שתי יולדות — ושני בנים בשם יצחק`,
        sum: `חלו בקורונה — ונולדו שני בנים בריאים`,
        full: `בתקופת מגפת הקורונה חלו שתי נשים בהיריון, ומצבן הרפואי הידרדר מאוד. בני המשפחה ארגנו מניין לתפילה על ציון הצדיק בעג׳ור, וקיבלו על עצמם שאם שתי הנשים תבראנה ותלדנה בנים בריאים — ייקראו הילדים על שם הצדיק, "יצחק". כנגד כל הסיכויים שתיהן החלימו ללא כל סימן למחלה, ההיריון נמשך כשורה, ושתיהן ילדו בנים בריאים — וכל אחד נקרא יצחק. בעקבות הנס נפתח כולל אברכים על שם הצדיק.`,
        source: `מקור: ארכיון המאורות · "פועל הישועות מעגור"` },
      { tag: `זיווג`, img: `assets/stories/13_bouquet.jpg`,
        title: `השידוך שנקשר בערב יום כיפור`,
        sum: `התחייב לסעודה — והבן התארס`,
        full: `אב שבנו הבוגר טרם זכה להינשא עלה לציון הצדיק בתשעה באב, וקיבל על עצמו שאם בנו יתארס לפני יום ההילולא של הצדיק — יערוך סעודה לכבוד הצדיק ולעילוי נשמתו. סמוך לאחר מכן, בערב יום הכיפורים, נקשר השידוך והבן התארס בשעה טובה.`,
        source: `מקור: ארכיון המאורות · "פועל הישועות מעגור"` },
      { tag: `ישועה`, img: `assets/stories/14_computer.jpg`,
        title: `החוב שנעלם מהמחשב`,
        sum: `הניחה מסמכיה על הציון — והחוב נמחק`,
        full: `אישה שעמדה בפני תביעה מהעירייה בגין חוב גדול שהצטבר הביאה את כל מסמכיה לציון. בתמימות הניחה את הניירות על הציון וביקשה מהצדיק שיהיה לה לפרקליט. כשהגיעה למשרדי העירייה כדי לשלם — בדק הפקיד במחשב ולא מצא כל רישום של חוב על שמה, אף שהמסמכים שבידה הראו אחרת.`,
        source: `מקור: ארכיון המאורות · "פועל הישועות מעגור"` },
      { tag: `מעלת הצדיק`, img: `assets/stories/15_pray.jpg`,
        title: `צדיק ביקש — תזכיר אותי שם`,
        sum: `רב גדול התחנן שיזכירו אותו על הציון`,
        full: `יהודי המרבה לפקוד את הציון נכנס פעם לקבל ברכה מרב גדול. מבין הרבים שהמתינו הצביע עליו הרב לפתע ושאל על מעשיו, וכששמע שהלה פוקד את ציון רבי יצחק גברא בעג׳ור כמעט מדי יום — התרגש עד עומק נשמתו ואמר: "אילו ידעו האנשים את כוחו ומעלתו של הצדיק מעג׳ור, לא היו עוזבים את המקום לעולם!". ואז הוסיף בלב נשבר: "אני מתחנן אליך — הזכר אותי שם בכל פעם שאתה עולה", וכתב את שמו ושם משפחתו על פתק.`,
        source: `מקור: ארכיון המאורות · "פועל הישועות מעגור"` },
      { tag: `רפואה`, img: `assets/stories/16_cane.jpg`,
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
        '<span class="ysh-photo"><img src="' + s.img + '?v=665" alt="" loading="lazy"></span>' +
        '<span class="ysh-cap">' +
          '<span class="ysh-tag">' + s.tag + '</span>' +
          '<span class="ysh-t">' + s.title + '</span>' +
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
        '<img class="ym-photo" alt="" />' +
        '<span class="ym-tag"></span>' +
        '<h3 class="ym-t"></h3>' +
        '<div class="ym-body"></div>' +
      '</div>';
    document.body.appendChild(ym);
    var ymPhoto = ym.querySelector(".ym-photo"),
        ymTag = ym.querySelector(".ym-tag"),
        ymT = ym.querySelector(".ym-t"),
        ymBody = ym.querySelector(".ym-body");
    function yshOpen(s) {
      ymPhoto.src = s.img + "?v=665"; ymTag.textContent = s.tag; ymT.textContent = s.title;
      ymBody.textContent = s.full;
      ym.classList.add("open"); document.body.style.overflow = "hidden";
    }
    function yshClose() { ym.classList.remove("open"); document.body.style.overflow = ""; }
    ym.querySelector(".ysh-close").addEventListener("click", yshClose);
    ym.querySelector(".ysh-modal-ov").addEventListener("click", yshClose);
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") yshClose(); });
  }

  /* ---------- חדשות ועדכוני המרכז (כרטיסים + מודאל כתבה) — נטען מ-Supabase ---------- */
  var newsGrid = document.getElementById("newsGrid");
  var newsTeaser = document.getElementById("newsTeaser");
  if (newsGrid || newsTeaser) {
    var SB_URL = "https://wfhgenhmoofyegysysac.supabase.co";
    var SB_KEY = "sb_publishable_XbSp3aL_Y_O3m8yzZ_qmOQ_vp5W3EYn";

    function ytId(url) {
      var m = String(url || "").match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/))([\w-]{11})/);
      return m ? m[1] : null;
    }

    function newsCard(a) {
      var c = document.createElement("a");
      c.className = "news-card";
      c.href = "article.html?id=" + encodeURIComponent(a.id);
      c.innerHTML =
        '<div class="nc-img"></div>' +
        '<div class="nc-body">' +
          '<div class="nc-meta"><span class="nc-cat"></span><span class="nc-date"></span></div>' +
          '<h3 class="nc-title"></h3>' +
          '<p class="nc-excerpt"></p>' +
          '<span class="nc-more">קרא עוד ›</span>' +
        '</div>';
      var ncImg = c.querySelector(".nc-img");
      var thumb = a.img || (ytId(a.video) ? "https://img.youtube.com/vi/" + ytId(a.video) + "/hqdefault.jpg" : "");
      if (thumb) { ncImg.style.backgroundImage = "url('" + thumb + "')"; }
      else if (a.video) {
        var vt = document.createElement("video"); vt.className = "nc-vthumb";
        vt.src = a.video + "#t=0.1"; vt.muted = true; vt.preload = "metadata"; vt.setAttribute("playsinline", "");
        ncImg.appendChild(vt);
      }
      c.querySelector(".nc-cat").textContent = a.cat;
      c.querySelector(".nc-date").textContent = a.date;
      c.querySelector(".nc-title").textContent = a.title;
      c.querySelector(".nc-excerpt").textContent = a.excerpt;
      if (a.video) { var pb = document.createElement("span"); pb.className = "nc-play"; pb.setAttribute("aria-hidden", "true"); pb.textContent = "▶"; ncImg.appendChild(pb); }
      return c;
    }

    function renderNews(NEWS) {
      if (newsGrid) { newsGrid.innerHTML = ""; NEWS.forEach(function (a) { newsGrid.appendChild(newsCard(a)); }); }
      if (newsTeaser) { newsTeaser.innerHTML = ""; NEWS.slice(0, 6).forEach(function (a) { newsTeaser.appendChild(newsCard(a)); }); }
    }

    var activeTag = new URLSearchParams(location.search).get("tag");

    fetch(SB_URL + "/rest/v1/articles?select=*&order=sort.desc", { headers: { apikey: SB_KEY, Authorization: "Bearer " + SB_KEY } })
      .then(function (r) { return r.json(); })
      .then(function (rows) {
        var NEWS = (rows || []).filter(function (a) { return !a.deleted; }).map(function (a) {
          return { id: a.id, date: a.date || "", cat: a.cat || "", img: a.image_url || "", video: a.video_url || "",
            title: a.title || "", excerpt: a.excerpt || "", tags: a.tags || "" };
        });
        if (activeTag && newsGrid) {
          NEWS = NEWS.filter(function (a) { return String(a.tags).toLowerCase().indexOf(String(activeTag).toLowerCase()) > -1; });
          var hero = document.querySelector(".stories-hero .section-title");
          if (hero) hero.textContent = "כתבות בנושא: " + activeTag;
          var lead = document.querySelector(".stories-hero .section-lead");
          if (lead) {
            lead.textContent = 'מציג כתבות המתויגות “' + activeTag + '”. ';
            var bk = document.createElement("a"); bk.href = "news.html"; bk.textContent = "‹ לכל הכתבות"; bk.style.color = "var(--gold-2)";
            lead.appendChild(bk);
          }
        }
        renderNews(NEWS);
        if (activeTag && newsGrid && !NEWS.length) newsGrid.innerHTML = '<p style="color:var(--muted);text-align:center;grid-column:1/-1">אין עדיין כתבות בנושא זה.</p>';
      })
      .catch(function () {
        if (newsGrid) newsGrid.innerHTML = '<p style="color:var(--muted);text-align:center;grid-column:1/-1">לא ניתן לטעון כעת את הכתבות. נסו לרענן.</p>';
      });
  }

  /* ---------- ארכיון הישועות המאומת (תצוגת עדויות + טופס שליחה) ---------- */
  /* כתובת היעד + וואטסאפ מוגדרים פעם אחת בראש הקובץ (SITE_EMAIL / SITE_WA). */

  /* === סיפורי ישועה שאושרו לפרסום ===
     מתחיל ריק בכוונה – לא ממציאים סיפורים. כשמגיע סיפור אמיתי ומאושר לפרסום,
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
          '<p>כאן יתפרסמו סיפורי הישועה שתשלחו — אמיתיים, באישורכם, ואפשר בעילום שם. ' +
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

  /* טופס שיתוף ישועה — זרימה: מילוי → תצוגה מקדימה → אישור → תודה */
  var archForm = document.getElementById("archiveForm");
  if (archForm) {
    var archStep1 = document.getElementById("archStep1");
    var archStep2 = document.getElementById("archStep2");
    var archStep3 = document.getElementById("archStep3");
    var archPreview = document.getElementById("archPreview");
    var archStatus = document.getElementById("archiveStatus");
    var archStatus2 = document.getElementById("archiveStatus2");
    var archEdit = document.getElementById("archEdit");
    var archConfirm = document.getElementById("archConfirm");

    function aVal(sel) { var el = archForm.querySelector(sel); return el ? el.value.trim() : ""; }
    function archSet(el, msg, ok) {
      if (!el) return;
      el.textContent = msg;
      el.style.color = ok === true ? "" : ok === false ? "#f0b8b8" : "var(--gold-2)";
    }
    function archScrollTo(el) {
      if (!el) return;
      window.scrollTo({ top: el.getBoundingClientRect().top + window.pageYOffset - 90, behavior: "smooth" });
    }
    function buildPreview() {
      var type = aVal("#aType");
      var by = aVal("#aPublic") || "מתפלל/ת (בעילום שם)";
      archPreview.innerHTML = "";
      var c = document.createElement("figure");
      c.className = "testimony-card";
      c.innerHTML =
        '<span class="tc-tag"></span>' +
        '<blockquote class="tc-body"></blockquote>' +
        '<figcaption class="tc-by"><b></b><span></span></figcaption>';
      c.querySelector(".tc-tag").textContent = type;
      c.querySelector(".tc-body").textContent = aVal("#aStory");
      c.querySelector(".tc-by b").textContent = by;
      archPreview.appendChild(c);
    }

    /* שלב 1 → תצוגה מקדימה */
    archForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = archForm.querySelector("#aName");
      var phone = archForm.querySelector("#aPhone");
      var story = archForm.querySelector("#aStory");
      var consent = archForm.querySelector("#aConsent");
      if (!name.value.trim() || !phone.value.trim() || !story.value.trim()) {
        archSet(archStatus, "נא למלא שם, טלפון וסיפור הישועה 🙏", false); return;
      }
      if (consent && !consent.checked) {
        archSet(archStatus, "נא לאשר את הפרסום באתר (אפשר בעילום שם) 🙏", false); return;
      }
      var badA = badContactField(archForm);
      if (badA) { archSet(archStatus, badA.msg, false); badA.el.focus(); return; }
      archSet(archStatus, "");
      buildPreview();
      if (archStep1) archStep1.hidden = true;
      if (archStep2) archStep2.hidden = false;
      archScrollTo(archStep2);
    });

    /* חזרה לעריכה */
    if (archEdit) archEdit.addEventListener("click", function () {
      if (archStep2) archStep2.hidden = true;
      if (archStep1) archStep1.hidden = false;
      archSet(archStatus2, "");
      archScrollTo(archStep1);
    });

    /* אישור ושליחה */
    if (archConfirm) archConfirm.addEventListener("click", function () {
      archConfirm.disabled = true; if (archEdit) archEdit.disabled = true;
      archSet(archStatus2, "שולח… 🕯️");

      function showWaFallback() {
        archConfirm.disabled = false; if (archEdit) archEdit.disabled = false;
        var waText = "בס\"ד, אני רוצה לשתף סיפור ישועה בזכות הצדיק מעג׳ור:%0A%0A" +
          "שם: " + encodeURIComponent(aVal("#aName")) + "%0A" +
          "סוג הישועה: " + encodeURIComponent(aVal("#aType")) + "%0A%0A" +
          encodeURIComponent(aVal("#aStory"));
        var waUrl = "https://wa.me/" + SITE_WA + "?text=" + waText;
        archStatus2.innerHTML = 'לשליחה, לחצו: <a href="' + waUrl +
          '" target="_blank" rel="noopener" style="color:var(--gold-2);font-weight:700">שליחה בוואטסאפ »</a>';
        archStatus2.style.color = "var(--gold-2)";
      }

      var data = {
        _subject: "📜 סיפור ישועה לפרסום — אתר הצדיק מעג׳ור",
        _captcha: "false",
        _template: "table",
        "שם מלא": aVal("#aName"),
        "טלפון": aVal("#aPhone"),
        "סוג הישועה": aVal("#aType"),
        "שם לפרסום": aVal("#aPublic") || "(לא צוין)",
        "הסיפור": aVal("#aStory"),
        "אישור פרסום": "כן"
      };

      /* שמירה לדשבורד כ"ממתין לאישור" — בנוסף למייל */
      appendStory({ name: aVal("#aName"), phone: aVal("#aPhone"), type: aVal("#aType"), public_name: aVal("#aPublic"), story: aVal("#aStory") });

      sendLead(data).then(function (j) {
        if (j && (j.success === "true" || j.success === true)) {
          if (archStep2) archStep2.hidden = true;
          if (archStep3) archStep3.hidden = false;
          archForm.reset();
          archScrollTo(archStep3);
        } else { showWaFallback(); }
      }).catch(showWaFallback);
    });
  }
})();
