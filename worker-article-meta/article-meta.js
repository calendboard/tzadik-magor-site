/**
 * article-meta (worker בשם holy-rice-5df3) - מזריק תגי כותרת ותצוגה מקדימה
 * (title / og / twitter) לכתובת הישנה `article.html?id=X`, כדי שקישורים
 * ישנים ששותפו ברשתות יראו תצוגה מקדימה של הכתבה הנכונה ולא מטא כללי.
 *
 * הכתובות החדשות `/a/<id>.html` כבר נבנות עם מטא מובנה (tools/build_articles.py),
 * וזה נשאר רק לתאימות לאחור.
 *
 * מקור הנתונים: `data/news.json` הציבורי של האתר. אין שום מפתח ואין תלות
 * חיצונית - קודם קרא מ-Supabase שנמחק, ומאז הזריק מטא ריק.
 *
 * הלוגיקה זהה ל-tools/build_articles.py (head_for), כדי שכתובת ישנה וכתובת
 * חדשה יראו אותה תצוגה מקדימה בדיוק.
 */

const BASE = "https://hatzadik-magor.co.il";
const NEWS = BASE + "/data/news.json";
const DEFAULT_IMG = BASE + "/assets/og-image.jpg";
const DEAD_HOST = "wfhgenhmoofyegysysac.supabase.co"; // שרת התמונות הישן, קישור אליו שבור

function clean(text, limit) {
  let t = String(text == null ? "" : text).replace(/<[^>]+>/g, " ");
  t = t.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
       .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, " ");
  t = t.replace(/\s+/g, " ").trim();
  if (limit && t.length > limit) {
    t = t.slice(0, limit).replace(/\s+\S*$/, "").replace(/[ ,.;:\-]+$/, "") + "…";
  }
  return t;
}

function absUrl(u) {
  u = String(u == null ? "" : u).trim();
  if (!u || u.indexOf(DEAD_HOST) !== -1) return null;
  if (u.indexOf("http://") === 0 || u.indexOf("https://") === 0) return u;
  return BASE + "/" + u.replace(/^\/+/, "");
}

function ogImage(a) {
  const img = absUrl(a.image_url);
  if (img) return img;
  const m = String(a.video_url || "").match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/))([\w-]{11})/);
  if (m) return "https://img.youtube.com/vi/" + m[1] + "/hqdefault.jpg";
  return DEFAULT_IMG;
}

class MetaRewriter {
  constructor(a) {
    this.title = clean(a.title) || "כתבה";
    this.desc = clean(a.excerpt || a.body, 160) ||
      "כתבה ועדכון ממרכז הצדיק מעג׳ור - רבי יצחק גברא זצ״ל.";
    this.image = ogImage(a);
    this.url = BASE + "/a/" + a.id + ".html";
  }
  element(el) {
    const k = el.getAttribute("property") || el.getAttribute("name");
    if (k === "og:title" || k === "twitter:title") el.setAttribute("content", this.title);
    else if (k === "og:description" || k === "twitter:description" || k === "description")
      el.setAttribute("content", this.desc);
    else if (k === "og:image" || k === "twitter:image") el.setAttribute("content", this.image);
    else if (k === "og:url") el.setAttribute("content", this.url);
  }
}

export default {
  async fetch(request) {
    /* fetch(request) עובר לשרת המקור (Pages) ולא חוזר דרך ה-worker, אז אין לולאה */
    const resp = await fetch(request);
    const url = new URL(request.url);
    if (!url.pathname.endsWith("/article.html")) return resp;
    const id = url.searchParams.get("id");
    if (!id) return resp;
    if (!(resp.headers.get("content-type") || "").includes("text/html")) return resp;

    let a = null;
    try {
      const r = await fetch(NEWS, { cf: { cacheTtl: 300, cacheEverything: true } });
      const rows = await r.json();
      if (Array.isArray(rows)) a = rows.find((x) => x && x.id === id);
    } catch (e) { /* אם news.json לא נטען - מחזירים את הדף כמו שהוא */ }
    if (!a || a.deleted || a.draft) return resp;

    const mr = new MetaRewriter(a);
    return new HTMLRewriter()
      .on("meta", mr)
      .on("title", { element(el) { el.setInnerContent(mr.title + " · הצדיק מעג׳ור"); } })
      .transform(resp);
  },
};
