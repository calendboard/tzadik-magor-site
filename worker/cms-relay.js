/**
 * cms-relay - שירות הביניים של דשבורד הכתבות.
 *
 * למה הוא קיים: האתר סטטי, והתוכן שלו יושב במאגר בגיטהאב. הדפדפן לא יכול
 * להחזיק מפתח כתיבה למאגר, כי כל מי שיפתח את קוד הדף יראה אותו. לכן הדשבורד
 * מדבר עם השירות הזה, והשירות הוא היחיד שמחזיק את המפתח.
 *
 * אותה תבנית בדיוק כמו push-relay שכבר רץ באתר.
 *
 * משתנים שצריך להגדיר ב-Cloudflare (Settings → Variables):
 *   CMS_PASSWORD  - סיסמת הצוות (Secret)
 *   CMS_SIGNING   - מחרוזת אקראית לחתימת כרטיסי הכניסה (Secret)
 *   GITHUB_TOKEN  - אסימון fine-grained למאגר הזה בלבד, הרשאת Contents: write (Secret)
 *   GITHUB_REPO   - calendboard/tzadik-magor-site (Variable רגיל)
 * וקישור (Binding) ל-KV בשם RATE - משמש להגבלת ניסיונות כניסה.
 */

const NEWS_PATH = "data/news.json";
const MEDIA_DIR = "assets/news";
const TOKEN_HOURS = 8;
const MAX_ATTEMPTS = 8;          // ניסיונות כניסה כושלים
const ATTEMPT_WINDOW = 15 * 60;  // בתוך רבע שעה, לכל כתובת IP
const MAX_MEDIA_BYTES = 25 * 1024 * 1024;

/* קיר הנרות (JSONBin): הקופסה נעולה לפרטית והשירות הוא היחיד שמחזיק את המפתח.
   כתיבות מהקהל מוגבלות בקצב, וכתיבות ניהוליות דורשות כרטיס כניסה.
   משתנים נוספים ב-Cloudflare:
     JSONBIN_KEY  - X-Master-Key של הקופסה (Secret)
     JSONBIN_BIN  - מזהה הקופסה (Variable רגיל) */
const WALL_KINDS = ["candles", "prayers", "stories", "contacts", "pidyon"];
const WALL_APPEND_KINDS = new Set(["candles", "prayers", "stories", "contacts"]);
const WALL_RATE_MAX = 12;              // כתיבות מהקהל
const WALL_RATE_WINDOW = 10 * 60;      // בתוך 10 דקות, לכל כתובת IP
const WALL_MAX_ITEM_BYTES = 16 * 1024; // תקרת גודל לרשומה בודדת מהקהל
const WALL_MAX_BLOB = 8000;            // תקרת אורך למחרוזת מוצפנת (encb/enc)
/* רק השדות הגלויים המותרים לכל סוג. שדות אישיים חיים מוצפנים ב-encb/enc בלבד. */
const WALL_FIELDS = {
  candles:  { name: 80, family: 60, deathdate: 40, dedication: 60 },
  prayers:  {},
  stories:  { type: 40, public_name: 60, story: 1500 },
  contacts: { topic: 60 },
  pidyon:   {},
};

/* רק סוגי קבצים שהאתר באמת מציג. בלי זה אפשר להעלות דף HTML או קוד
   לתוך הדומיין שלנו, וזו פרצה אמיתית גם למי שיש לו את סיסמת הצוות. */
const ALLOWED_EXT = new Set([
  "jpg", "jpeg", "png", "webp", "gif",
  "mp4", "mov", "m4v", "webm",
  "mp3", "m4a", "ogg", "opus", "wav", "aac",
]);

/** מנקה שם קובץ: בלי נתיבים, בלי סיומת מסוכנת */
function safeFileName(raw) {
  const base = String(raw || "file").split(/[\\/]/).pop();
  const cleaned = base.replace(/[^\w.-]/g, "-").replace(/\.{2,}/g, ".").replace(/^[.-]+/, "").slice(-80);
  const ext = (cleaned.split(".").pop() || "").toLowerCase();
  if (!ALLOWED_EXT.has(ext)) return null;
  return cleaned;
}

const CORS = {
  "Access-Control-Allow-Origin": "https://hatzadik-magor.co.il",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-Cms-Token",
  "Access-Control-Max-Age": "86400",
};

const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", ...CORS },
  });

/* ---------- עזרי הצפנה ---------- */

const enc = new TextEncoder();

/** השוואה בזמן קבוע, כדי שלא יהיה אפשר לנחש סיסמה לפי זמן התגובה */
function safeEqual(a, b) {
  const x = enc.encode(String(a || ""));
  const y = enc.encode(String(b || ""));
  if (x.length !== y.length) return false;
  let diff = 0;
  for (let i = 0; i < x.length; i++) diff |= x[i] ^ y[i];
  return diff === 0;
}

async function hmac(secret, msg) {
  const key = await crypto.subtle.importKey(
    "raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(msg));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function makeToken(env) {
  const exp = Math.floor(Date.now() / 1000) + TOKEN_HOURS * 3600;
  return `${exp}.${await hmac(env.CMS_SIGNING, String(exp))}`;
}

async function validToken(env, token) {
  const [exp, sig] = String(token || "").split(".");
  if (!exp || !sig) return false;
  if (Number(exp) < Math.floor(Date.now() / 1000)) return false;
  return safeEqual(sig, await hmac(env.CMS_SIGNING, exp));
}

/* ---------- הגבלת ניסיונות כניסה ---------- */

async function tooManyAttempts(env, ip) {
  const n = Number((await env.RATE.get(`login:${ip}`)) || 0);
  return n >= MAX_ATTEMPTS;
}

async function noteFailure(env, ip) {
  const k = `login:${ip}`;
  const n = Number((await env.RATE.get(k)) || 0) + 1;
  await env.RATE.put(k, String(n), { expirationTtl: ATTEMPT_WINDOW });
}

/* ---------- גיטהאב ---------- */

function gh(env, path, init = {}) {
  return fetch(`https://api.github.com/repos/${env.GITHUB_REPO}/contents/${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${env.GITHUB_TOKEN}`,
      Accept: "application/vnd.github+json",
      "User-Agent": "tzadik-cms-relay",
      "X-GitHub-Api-Version": "2022-11-28",
      ...(init.headers || {}),
    },
  });
}

function b64encode(bytes) {
  let s = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    s += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
  }
  return btoa(s);
}

async function readNews(env) {
  const r = await gh(env, `${NEWS_PATH}?ref=main`);
  if (!r.ok) throw new Error(`קריאת הכתבות נכשלה (${r.status})`);
  const meta = await r.json();
  const bytes = Uint8Array.from(atob(meta.content.replace(/\n/g, "")), (c) => c.charCodeAt(0));
  return { sha: meta.sha, rows: JSON.parse(new TextDecoder().decode(bytes)) };
}

async function writeFile(env, path, bytes, message, sha) {
  const r = await gh(env, path, {
    method: "PUT",
    body: JSON.stringify({
      message,
      content: b64encode(bytes),
      branch: "main",
      ...(sha ? { sha } : {}),
    }),
  });
  if (!r.ok) throw new Error(`כתיבה למאגר נכשלה (${r.status}): ${(await r.text()).slice(0, 200)}`);
  return r.json();
}

/* ---------- קיר הנרות ---------- */

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const wallUid = () => Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 9);
const cap = (v, n) => String(v == null ? "" : v).slice(0, n);

/* קריאה/כתיבה לקופסת JSONBin. User-Agent מוגדר במפורש כי JSONBin חוסם
   בקשות בלי כותרת כזו. X-Bin-Meta:false מחזיר את הרשומה עצמה בלי עטיפה. */
function jb(env, method, path, body) {
  return fetch("https://api.jsonbin.io/v3" + path, {
    method,
    headers: {
      "X-Master-Key": env.JSONBIN_KEY,
      "X-Bin-Meta": "false",
      "Content-Type": "application/json",
      "User-Agent": "tzadik-cms-relay",
    },
    ...(body != null ? { body: JSON.stringify(body) } : {}),
  });
}

function normalizeWall(rec) {
  rec = rec && typeof rec === "object" && !Array.isArray(rec) ? rec : {};
  for (const k of WALL_KINDS) if (!Array.isArray(rec[k])) rec[k] = [];
  return rec;
}

/* מוודא שלכל רשומה יש מזהה, כדי שעריכה ומחיקה יעבדו לפי _id */
function ensureWallIds(rec) {
  for (const k of WALL_KINDS) for (const it of rec[k]) if (it && !it._id) it._id = wallUid();
}

async function readWall(env) {
  const r = await jb(env, "GET", `/b/${env.JSONBIN_BIN}/latest`);
  if (!r.ok) throw new Error(`קריאת קיר הנרות נכשלה (${r.status})`);
  return normalizeWall(await r.json());
}

async function writeWall(env, rec) {
  const r = await jb(env, "PUT", `/b/${env.JSONBIN_BIN}`, rec);
  if (!r.ok) throw new Error(`כתיבה לקיר הנרות נכשלה (${r.status})`);
  return true;
}

/* מנקה רשומה שמגיעה מהקהל: רק שדות מותרים, אורכים תחומים, מזהה ותאריך
   נקבעים בשרת, וסטטוס ישועה נכפה ל-pending כדי שאי אפשר לפרסם באתר לבד. */
function sanitizeWallItem(kind, raw) {
  raw = raw && typeof raw === "object" ? raw : {};
  const out = {};
  const spec = WALL_FIELDS[kind] || {};
  for (const f in spec) if (raw[f] != null) out[f] = cap(raw[f], spec[f]);
  if (typeof raw.encb === "string") out.encb = raw.encb.slice(0, WALL_MAX_BLOB);
  if (typeof raw.enc === "string") out.enc = raw.enc.slice(0, WALL_MAX_BLOB);
  out._id = wallUid();
  out.date = new Date().toISOString().slice(0, 10);
  out.ts = new Date().toISOString();
  if (kind === "stories") out.status = "pending";
  return out;
}

/* הוספה מהקהל, עמידה לכתיבות מקבילות: קורא טרי, מוסיף לפי _id, כותב, מאמת */
async function appendWall(env, kind, rawItem) {
  const item = sanitizeWallItem(kind, rawItem);
  for (let t = 0; t < 5; t++) {
    const rec = await readWall(env);
    ensureWallIds(rec);
    if (!rec[kind].some((x) => x && x._id === item._id)) rec[kind].push(item);
    await writeWall(env, rec);
    const check = await readWall(env);
    if ((check[kind] || []).some((x) => x && x._id === item._id)) return item;
    await sleep(120 + Math.floor(Math.random() * 400));
  }
  throw new Error("שמירה נכשלה עקב עומס. נסו שוב.");
}

/* פעולת ניהול על הקיר (מאומתת בכרטיס כניסה): עריכה, מחיקה או הוספה ידנית */
function applyWallOp(rec, op) {
  if (!WALL_KINDS.includes(op.kind)) throw new Error("סוג לא מוכר");
  const list = rec[op.kind];
  if (op.type === "edit") {
    const it = list.find((x) => x && x._id === op.id);
    if (!it) throw new Error("הרשומה לא נמצאה");
    Object.assign(it, op.fields || {});
    return `עדכון ${op.kind}`;
  }
  if (op.type === "delete") {
    const before = list.length;
    rec[op.kind] = list.filter((x) => !(x && x._id === op.id));
    if (rec[op.kind].length === before) throw new Error("הרשומה לא נמצאה");
    return `מחיקת ${op.kind}`;
  }
  if (op.type === "insert") {
    const it = op.item && typeof op.item === "object" ? { ...op.item } : {};
    if (!it._id) it._id = wallUid();
    if (!it.date) it.date = new Date().toISOString().slice(0, 10);
    if (!it.ts) it.ts = new Date().toISOString();
    list.push(it);
    return `הוספת ${op.kind}`;
  }
  throw new Error("פעולה לא מוכרת");
}

async function wallRateLimited(env, ip) {
  if (!env.RATE) return false;
  return Number((await env.RATE.get(`wall:${ip}`)) || 0) >= WALL_RATE_MAX;
}
async function noteWallWrite(env, ip) {
  if (!env.RATE) return;
  const k = `wall:${ip}`;
  const n = Number((await env.RATE.get(k)) || 0) + 1;
  await env.RATE.put(k, String(n), { expirationTtl: WALL_RATE_WINDOW });
}

/* ---------- החלת פעולה על רשימת הכתבות ---------- */

function applyOp(rows, op) {
  const idx = op.id ? rows.findIndex((a) => String(a.id) === String(op.id)) : -1;

  if (op.type === "insert") {
    const rec = { ...op.fields };
    if (!rec.id) rec.id = crypto.randomUUID();
    if (!rec.created_at) rec.created_at = new Date().toISOString();
    if (rec.sort == null) rec.sort = Date.now();
    rec.deleted = !!rec.deleted;
    rows.unshift(rec);
    return `כתבה חדשה: ${rec.title || rec.id}`;
  }

  if (op.type === "patch") {
    if (idx < 0) throw new Error("הכתבה לא נמצאה");
    rows[idx] = { ...rows[idx], ...op.fields };
    return `עדכון כתבה: ${rows[idx].title || rows[idx].id}`;
  }

  if (op.type === "patchWhere") {
    // משמש לניקוי סימון "כתבה מובילה" מכל השאר
    let n = 0;
    rows.forEach((a, i) => {
      if (String(a[op.field]) === String(op.value)) { rows[i] = { ...a, ...op.fields }; n++; }
    });
    return `עדכון ${n} כתבות`;
  }

  if (op.type === "delete") {
    if (idx < 0) throw new Error("הכתבה לא נמצאה");
    const t = rows[idx].title || rows[idx].id;
    rows.splice(idx, 1);
    return `מחיקת כתבה: ${t}`;
  }

  throw new Error("פעולה לא מוכרת");
}

/* ---------- נקודות הקצה ---------- */

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });
    if (request.method !== "POST") return json({ error: "POST בלבד" }, 405);

    const url = new URL(request.url);
    const ip = request.headers.get("CF-Connecting-IP") || "unknown";

    let body;
    try { body = await request.json(); }
    catch { return json({ error: "בקשה לא תקינה" }, 400); }

    /* כניסה: בודקים סיסמה ומחזירים כרטיס זמני, כדי שהסיסמה לא תישלח בכל פעולה */
    if (url.pathname === "/login") {
      if (await tooManyAttempts(env, ip)) {
        return json({ error: "יותר מדי ניסיונות כניסה. נסו שוב בעוד רבע שעה." }, 429);
      }
      if (!safeEqual(body.password, env.CMS_PASSWORD)) {
        await noteFailure(env, ip);
        return json({ error: "סיסמה שגויה" }, 401);
      }
      return json({ token: await makeToken(env), hours: TOKEN_HOURS });
    }

    /* קיר הנרות: קריאה והוספה ציבוריות (בלי סיסמה). ההוספה מוגבלת בקצב,
       השרת מקצה מזהה ותאריך, וכופה status=pending לישועות. */
    if (url.pathname === "/wall/list") {
      try { return json({ rec: await readWall(env) }); }
      catch (e) { return json({ error: String(e.message || e) }, 502); }
    }
    if (url.pathname === "/wall/append") {
      if (!WALL_APPEND_KINDS.has(body.kind)) return json({ error: "סוג לא מוכר" }, 400);
      if (JSON.stringify(body.item || {}).length > WALL_MAX_ITEM_BYTES) {
        return json({ error: "הרשומה גדולה מדי" }, 413);
      }
      if (await wallRateLimited(env, ip)) {
        return json({ error: "יותר מדי בקשות. נסו שוב בעוד מספר דקות." }, 429);
      }
      await noteWallWrite(env, ip);
      try { return json({ ok: true, item: await appendWall(env, body.kind, body.item) }); }
      catch (e) { return json({ error: String(e.message || e) }, 502); }
    }

    /* מכאן והלאה חובה כרטיס תקף */
    if (!(await validToken(env, request.headers.get("X-Cms-Token")))) {
      return json({ error: "הכניסה פגה. היכנסו שוב." }, 401);
    }

    try {
      /* העלאת תמונה, סרטון או הקלטה */
      if (url.pathname === "/media") {
        const raw = String(body.data || "");
        const bytes = Uint8Array.from(atob(raw), (c) => c.charCodeAt(0));
        if (bytes.length > MAX_MEDIA_BYTES) {
          return json({ error: "הקובץ גדול מ-25 מגה. העלו סרטון ליוטיוב והדביקו קישור." }, 413);
        }
        const safe = safeFileName(body.name);
        if (!safe) {
          return json({ error: "סוג הקובץ הזה לא נתמך. אפשר תמונות, סרטונים והקלטות." }, 415);
        }
        const path = `${MEDIA_DIR}/${safe}`;
        let sha;
        const head = await gh(env, `${path}?ref=main`);
        if (head.ok) sha = (await head.json()).sha;
        await writeFile(env, path, bytes, `דשבורד: העלאת ${safe}`, sha);
        return json({ url: `/${path}` });
      }

      /* שמירה, עריכה או מחיקה של כתבה */
      if (url.pathname === "/articles") {
        const ops = Array.isArray(body.ops) ? body.ops : [body.op];
        const { sha, rows } = await readNews(env);
        const notes = ops.map((op) => applyOp(rows, op));
        const out = enc.encode(JSON.stringify(rows, null, 2) + "\n");
        await writeFile(env, NEWS_PATH, out, `דשבורד: ${notes.join(" · ")}`, sha);
        return json({ ok: true, rows, message: notes.join(" · ") });
      }

      /* קיר הנרות: עריכה, מחיקה, הוספה ידנית ואישור ישועה - דורש כרטיס כניסה */
      if (url.pathname === "/wall/admin") {
        const ops = Array.isArray(body.ops) ? body.ops : [body.op];
        const rec = await readWall(env);
        ensureWallIds(rec);
        ops.forEach((op) => applyWallOp(rec, op));
        await writeWall(env, rec);
        return json({ ok: true, rec });
      }

      /* קריאה: מהמאגר עצמו, כדי לראות שינויים מיד ולא לחכות לפריסה */
      if (url.pathname === "/list") {
        const { rows } = await readNews(env);
        return json({ rows });
      }

      return json({ error: "כתובת לא מוכרת" }, 404);
    } catch (e) {
      return json({ error: String(e.message || e) }, 500);
    }
  },
};
