#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
בונה דף קבוע לכל כתבה תחת a/<id>.html.

למה: האתר הוא אתר סטטי, ולכן קובץ אחד (article.html) לא יכול להציג כותרת
שונה לכל כתבה. עד עכשיו שירות ב-Cloudflare הזריק את הכותרת בזמן אמת מ-Supabase,
ומאז ש-Supabase נמחק כל הכתבות קיבלו את אותה תצוגה מקדימה בוואטסאפ ובפייסבוק.
דף קבוע לכל כתבה פותר את זה בלי שום תלות בשרת חיצוני.

התוכן עצמו עדיין נטען מ-data/news.json, בדיוק כמו קודם.
רק תגיות הכותרת והתצוגה המקדימה נכתבות מראש לתוך כל דף.

הרצה:  python3 tools/build_articles.py
"""

import html
import json
import os
import re
import shutil

BASE = "https://hatzadik-magor.co.il"
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_DIR = os.path.join(ROOT, "a")
DEFAULT_IMG = BASE + "/assets/og-image.jpg"

# שרת התמונות הישן נמחק. קישור אליו שבור, ולכן לא נכנס לתצוגה המקדימה.
DEAD_HOST = "wfhgenhmoofyegysysac.supabase.co"


def clean(text, limit=None):
    """מנקה תגיות ורווחים מיותרים, ומקצר לאורך מבוקש."""
    t = re.sub(r"<[^>]+>", " ", str(text or ""))
    t = html.unescape(t)
    t = re.sub(r"\s+", " ", t).strip()
    if limit and len(t) > limit:
        t = t[:limit].rsplit(" ", 1)[0].rstrip(" ,.;:-") + "…"
    return t


def abs_url(u):
    u = str(u or "").strip()
    if not u or DEAD_HOST in u:
        return None
    if u.startswith("http://") or u.startswith("https://"):
        return u
    return BASE + "/" + u.lstrip("/")


def og_image(a):
    """התמונה לתצוגה המקדימה: תמונת הכתבה, ואם אין או שהיא שבורה - סמל האתר."""
    img = abs_url(a.get("image_url"))
    if img:
        return img
    vid = str(a.get("video_url") or "")
    m = re.search(r"(?:youtu\.be/|youtube\.com/(?:watch\?v=|embed/|shorts/|live/))([\w-]{11})", vid)
    if m:
        return "https://img.youtube.com/vi/%s/hqdefault.jpg" % m.group(1)
    return DEFAULT_IMG


def head_for(a):
    aid = a["id"]
    title = clean(a.get("title")) or "כתבה"
    desc = clean(a.get("excerpt") or a.get("body"), 160) or \
        "כתבה ועדכון ממרכז הצדיק מעג׳ור - רבי יצחק גברא זצ״ל."
    url = "%s/a/%s.html" % (BASE, aid)
    e = html.escape
    full_title = "%s · הצדיק מעג׳ור" % title

    return "\n".join([
        '  <title>%s</title>' % e(full_title),
        '  <meta name="description" content="%s" />' % e(desc, quote=True),
        '  <link rel="canonical" href="%s" />' % e(url, quote=True),
        '  <meta property="og:type" content="article" />',
        '  <meta property="og:site_name" content="הצדיק מעג׳ור" />',
        '  <meta property="og:title" content="%s" />' % e(title, quote=True),
        '  <meta property="og:description" content="%s" />' % e(desc, quote=True),
        '  <meta property="og:image" content="%s" />' % e(og_image(a), quote=True),
        '  <meta property="og:url" content="%s" />' % e(url, quote=True),
        '  <meta property="og:locale" content="he_IL" />',
        '  <meta name="twitter:card" content="summary_large_image" />',
        '  <meta name="twitter:title" content="%s" />' % e(title, quote=True),
        '  <meta name="twitter:description" content="%s" />' % e(desc, quote=True),
        '  <meta name="twitter:image" content="%s" />' % e(og_image(a), quote=True),
    ])


# תגיות ה-head של article.html שמוחלפות בגרסה הייחודית של כל כתבה
DROP = re.compile(
    r'^[ \t]*<(?:title>.*?</title|'
    r'meta\s+(?:name="description"|name="twitter:[^"]*"|property="og:[^"]*")[^>]*/?|'
    r'link\s+rel="canonical"[^>]*/?)>[ \t]*\n',
    re.MULTILINE | re.DOTALL)


def build():
    tpl_path = os.path.join(ROOT, "article.html")
    tpl = open(tpl_path, encoding="utf-8").read()

    with open(os.path.join(ROOT, "data", "news.json"), encoding="utf-8") as fh:
        items = json.load(fh)
    live = [a for a in items if a.get("id") and not a.get("deleted") and not a.get("draft")]

    if os.path.isdir(OUT_DIR):
        shutil.rmtree(OUT_DIR)
    os.makedirs(OUT_DIR)

    for a in live:
        page = DROP.sub("", tpl)
        # <base> כדי שכל הקישורים היחסיים יעבדו גם מתוך תיקיית a/
        page = page.replace(
            "<head>",
            '<head>\n  <base href="/" />\n  <script>window.__ARTICLE_ID=%s;</script>' % json.dumps(a["id"]),
            1)
        page = page.replace(
            '<meta name="viewport" content="width=device-width, initial-scale=1.0" />',
            '<meta name="viewport" content="width=device-width, initial-scale=1.0" />\n' + head_for(a),
            1)
        with open(os.path.join(OUT_DIR, "%s.html" % a["id"]), "w", encoding="utf-8") as fh:
            fh.write(page)

    print("נבנו %d דפי כתבות בתיקייה a/" % len(live))
    return len(live)


if __name__ == "__main__":
    build()
