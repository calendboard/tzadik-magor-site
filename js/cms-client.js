/**
 * cms-client - המנוע שמתחת לדשבורד הכתבות.
 *
 * מחליף את הספרייה של Supabase שהייתה כאן קודם, ומדבר במקומה עם שירות
 * הביניים ב-Cloudflare (worker/cms-relay.js), שהוא היחיד שמחזיק מפתח כתיבה למאגר.
 *
 * הוא חושף בכוונה את אותם שמות פעולות שהדשבורד כבר משתמש בהם
 * (from / select / insert / update / delete / storage.upload), כדי שקוד המסך
 * עצמו לא ישתנה בכלל. מי שקורא את הדשבורד לא צריך לדעת שהמנוע התחלף.
 */
(function () {
  "use strict";

  var RELAY = "https://cms-relay.hatzadikmagor.workers.dev";
  var STORE = "tz_cms_session";
  var MEDIA_DIR = "/assets/news";

  /* ---------- כרטיס הכניסה ---------- */

  function session() {
    try {
      var s = JSON.parse(localStorage.getItem(STORE) || "null");
      if (s && s.token && s.exp > Date.now() / 1000) return s;
    } catch (e) {}
    return null;
  }
  function setSession(s) {
    if (s) localStorage.setItem(STORE, JSON.stringify(s));
    else localStorage.removeItem(STORE);
  }

  function call(path, body) {
    var s = session();
    return fetch(RELAY + path, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Cms-Token": s ? s.token : ""
      },
      body: JSON.stringify(body || {})
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (j) {
        if (!r.ok) {
          if (r.status === 401 && path !== "/login") setSession(null);
          throw new Error(j.error || ("השרת החזיר שגיאה " + r.status));
        }
        return j;
      });
    });
  }

  /* עוטף כל פעולה בצורת התשובה שהדשבורד מצפה לה: {data, error} */
  function wrap(promise) {
    return promise.then(
      function (data) { return { data: data, error: null }; },
      function (err) { return { data: null, error: { message: err.message || String(err) } }; }
    );
  }

  /* ---------- מטמון מקומי של הכתבות ---------- */

  var cache = null;

  function loadRows() {
    if (session()) {
      /* מהמאגר עצמו, כדי לראות שינוי מיד ולא לחכות שהאתר ייבנה מחדש */
      return call("/list", {}).then(function (j) { cache = j.rows || []; return cache; });
    }
    return fetch("/data/news.json?t=" + Date.now())
      .then(function (r) { return r.json(); })
      .then(function (rows) { cache = rows || []; return cache; });
  }

  function sendOps(ops) {
    return call("/articles", { ops: ops }).then(function (j) {
      cache = j.rows || cache;
      return j;
    });
  }

  /* ---------- שאילתה בסגנון שהדשבורד מכיר ---------- */

  function Query(action, fields) {
    this._action = action;      /* select | insert | update | delete */
    this._fields = fields || null;
    this._filters = [];
    this._order = null;
  }

  Query.prototype.select = function () { return this; };

  Query.prototype.eq = function (field, value) {
    this._filters.push({ field: field, value: value });
    return this;
  };

  Query.prototype.order = function (field, opts) {
    this._order = { field: field, asc: !!(opts && opts.ascending) };
    return this;
  };

  Query.prototype._run = function () {
    var self = this;

    if (this._action === "select") {
      return loadRows().then(function (rows) {
        var out = rows.filter(function (a) {
          return self._filters.every(function (f) {
            /* deleted חסר בכתבה ישנה נחשב "לא מחוק" */
            var v = a[f.field];
            if (f.field === "deleted" || f.field === "draft" || f.field === "featured") {
              return !!v === !!f.value;
            }
            return String(v) === String(f.value);
          });
        });
        if (self._order) {
          var k = self._order.field, asc = self._order.asc;
          out = out.slice().sort(function (x, y) {
            var a = x[k], b = y[k];
            if (a === b) return 0;
            return (a > b ? 1 : -1) * (asc ? 1 : -1);
          });
        }
        return out;
      });
    }

    if (this._action === "insert") {
      return sendOps([{ type: "insert", fields: this._fields }]).then(function (j) { return j.rows; });
    }

    if (this._action === "update") {
      var byId = this._filters.filter(function (f) { return f.field === "id"; })[0];
      if (byId) {
        return sendOps([{ type: "patch", id: byId.value, fields: this._fields }])
          .then(function (j) { return j.rows; });
      }
      var f = this._filters[0];
      if (!f) throw new Error("עדכון בלי תנאי נחסם");
      return sendOps([{ type: "patchWhere", field: f.field, value: f.value, fields: this._fields }])
        .then(function (j) { return j.rows; });
    }

    if (this._action === "delete") {
      var d = this._filters.filter(function (f) { return f.field === "id"; })[0];
      if (!d) throw new Error("מחיקה בלי תנאי נחסמה");
      return sendOps([{ type: "delete", id: d.value }]).then(function (j) { return j.rows; });
    }

    return Promise.reject(new Error("פעולה לא מוכרת"));
  };

  /* מאפשר לכתוב .then(...) ישירות על השאילתה, כמו בספרייה הקודמת */
  Query.prototype.then = function (onOk, onErr) {
    var p;
    try { p = wrap(this._run()); }
    catch (e) { p = Promise.resolve({ data: null, error: { message: e.message } }); }
    return p.then(onOk, onErr);
  };
  Query.prototype.catch = function (fn) { return this.then(null, fn); };

  /* ---------- העלאת קבצים ---------- */

  function toBase64(blob) {
    return new Promise(function (resolve, reject) {
      var fr = new FileReader();
      fr.onload = function () { resolve(String(fr.result).split(",")[1] || ""); };
      fr.onerror = reject;
      fr.readAsDataURL(blob);
    });
  }

  var uploadedUrls = {};   /* שם הקובץ -> הכתובת שהשרת החזיר בפועל */

  var storageApi = {
    upload: function (name, blob, opts) {
      return toBase64(blob)
        .then(function (b64) {
          return call("/media", {
            name: name,
            contentType: (opts && opts.contentType) || blob.type || "application/octet-stream",
            data: b64
          });
        })
        .then(function (j) {
          uploadedUrls[name] = j.url;
          return { data: { path: j.url }, error: null };
        })
        .catch(function (err) { return { data: null, error: { message: err.message } }; });
    },
    getPublicUrl: function (name) {
      /* הכתובת שהשרת החזיר בהעלאה היא המקור היחיד לאמת,
         כדי ששינוי בניקוי השמות בצד השרת לא ישבור קישורים כאן. */
      var url = uploadedUrls[name] || (MEDIA_DIR + "/" + String(name).replace(/[^\w.-]/g, "-"));
      return { data: { publicUrl: url } };
    }
  };

  /* ---------- הממשק שהדשבורד מקבל ---------- */

  window.cms = {
    auth: {
      signInWithPassword: function (creds) {
        return call("/login", { password: creds.password })
          .then(function (j) {
            setSession({ token: j.token, exp: Math.floor(Date.now() / 1000) + j.hours * 3600 });
            return { data: { session: session() }, error: null };
          })
          .catch(function (err) { return { data: null, error: { message: err.message } }; });
      },
      signOut: function () { setSession(null); return Promise.resolve({ error: null }); },
      getSession: function () { return Promise.resolve({ data: { session: session() } }); }
    },
    from: function () {
      return {
        select: function () { return new Query("select"); },
        insert: function (rec) { return new Query("insert", rec); },
        update: function (fields) { return new Query("update", fields); },
        delete: function () { return new Query("delete"); }
      };
    },
    storage: { from: function () { return storageApi; } }
  };
})();
