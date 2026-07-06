/* Cloudflare Worker - ממסר שליחת פוש ל-OneSignal + רענון מיידי של האתר
 * רץ ב-Cloudflare (שרת), לא בדפדפן. הסודות ב-Settings → Variables:
 *   ONESIGNAL_KEY = ה-API Key מ-OneSignal (סודי)
 *   PUSH_TOKEN    = סיסמה שאתה בוחר, שהדשבורד שולח כהוכחה (סודי)
 *   GITHUB_TOKEN  = טוקן GitHub (Contents: write) - לרענון מיידי אחרי פרסום כתבה (סודי)
 * תומך גם במפתח החדש (Key / api.onesignal.com) וגם בישן (Basic / v1).
 */
const ONESIGNAL_APP_ID = "249c32f4-8a1f-4fc7-877d-944ea4c59556";
const ALLOW_ORIGIN = "https://hatzadik-magor.co.il";
const SEGMENTS = ["Total Subscriptions", "Active Subscriptions", "Subscribed Users"];
const GH_REPO = "calendboard/tzadik-magor-site";

export default {
  async fetch(request, env) {
    const cors = {
      "Access-Control-Allow-Origin": ALLOW_ORIGIN,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, X-Push-Token",
    };
    if (request.method === "OPTIONS") return new Response(null, { headers: cors });
    if (request.method !== "POST") return json({ ok: false, error: "method" }, 405, cors);

    const token = request.headers.get("X-Push-Token") || "";
    if (!env.PUSH_TOKEN || token !== env.PUSH_TOKEN) return json({ ok: false, error: "unauthorized" }, 401, cors);

    let data;
    try { data = await request.json(); } catch (e) { return json({ ok: false, error: "bad json" }, 400, cors); }

    /* פעולת רענון מיידי: דוחף ל-GitHub פקודה לבנות מחדש את news.json (repository_dispatch) */
    if (data.action === "sync") {
      if (!env.GITHUB_TOKEN) return json({ ok: false, error: "no github token" }, 200, cors);
      const gh = await fetch("https://api.github.com/repos/" + GH_REPO + "/dispatches", {
        method: "POST",
        headers: {
          "Authorization": "Bearer " + env.GITHUB_TOKEN,
          "Accept": "application/vnd.github+json",
          "Content-Type": "application/json",
          "User-Agent": "tzadik-sync-relay",
        },
        body: JSON.stringify({ event_type: "sync-news" }),
      });
      if (gh.status === 204) return json({ ok: true, synced: true }, 200, cors);
      const t = await gh.text().catch(() => "");
      return json({ ok: false, error: "github " + gh.status + " " + t.slice(0, 140) }, 200, cors);
    }

    const title = (data.title || "").trim();
    const body = (data.body || "").trim();
    const url = (data.url || "").trim();
    if (!title || !body) return json({ ok: false, error: "missing title/body" }, 400, cors);

    const ATTEMPTS = [
      { url: "https://api.onesignal.com/notifications", auth: "Key " + env.ONESIGNAL_KEY, extra: { target_channel: "push" } },
      { url: "https://onesignal.com/api/v1/notifications", auth: "Basic " + env.ONESIGNAL_KEY, extra: {} },
    ];

    let lastErr = "send failed";
    for (const at of ATTEMPTS) {
      let authBad = false;
      for (const seg of SEGMENTS) {
        const payload = Object.assign({ app_id: ONESIGNAL_APP_ID, included_segments: [seg], headings: { en: title }, contents: { en: body }, priority: 10 }, at.extra);
        if (url) payload.url = url;
        let r, j;
        try {
          r = await fetch(at.url, { method: "POST", headers: { "Content-Type": "application/json; charset=utf-8", "Authorization": at.auth }, body: JSON.stringify(payload) });
          j = await r.json().catch(() => ({}));
        } catch (e) { lastErr = "network: " + e.message; break; }
        const errStr = j && j.errors ? (Array.isArray(j.errors) ? j.errors.join(" · ") : JSON.stringify(j.errors)) : "";
        if (r.ok && j.id && !(j.errors)) return json({ ok: true, id: j.id, recipients: (j.recipients != null ? j.recipients : null) }, 200, cors);
        if (/segment|not subscribed|no (recipients|subscribers|players|devices)/i.test(errStr)) { lastErr = errStr; continue; }
        if (r.status === 401 || r.status === 403 || /invalid|authorization|api key|unauthorized/i.test(errStr)) { authBad = true; lastErr = errStr || ("auth " + r.status); break; }
        lastErr = errStr || ("error " + r.status); break;
      }
      if (!authBad) break;
    }
    return json({ ok: false, error: lastErr }, 200, cors);
  },
};

function json(obj, status, cors) {
  return new Response(JSON.stringify(obj), { status, headers: Object.assign({ "Content-Type": "application/json" }, cors) });
}
