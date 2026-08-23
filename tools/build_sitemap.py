#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
בונה מחדש את sitemap.xml של אתר הצדיק מעג׳ור.

הדפים הקבועים רשומים למטה ברשימת PAGES.
דפי הכתבות נמשכים אוטומטית מ-data/news.json (אותו קובץ שדשבורד הכתבות מסנכרן),
בלי כתבות שנמחקו ובלי טיוטות.

הרצה:  python3 tools/build_sitemap.py
"""

import json
import os
from xml.sax.saxutils import escape

BASE = "https://hatzadik-magor.co.il"
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# דפים ציבוריים קבועים. דפי הקמפיין הנסתרים (yeshua, daf-chadash),
# קיצורי השיתוף (fb/ig/wa/kikar/meorot) והדפים הסגורים (dashboard, lists)
# מסומנים noindex בכוונה ולכן לא נכנסים לכאן.
PAGES = [
    ("/",              "weekly",  "1.0"),
    ("/donate.html",   "weekly",  "0.9"),
    ("/ner.html",      "monthly", "0.9"),
    ("/tefila.html",   "monthly", "0.9"),
    ("/wall.html",     "weekly",  "0.8"),
    ("/stories.html",  "weekly",  "0.8"),
    ("/archive.html",  "weekly",  "0.8"),
    ("/gallery.html",  "monthly", "0.8"),
    ("/news.html",     "weekly",  "0.7"),
    ("/tehillim.html", "monthly", "0.7"),
    ("/privacy.html",  "yearly",  "0.3"),
]


def articles():
    path = os.path.join(ROOT, "data", "news.json")
    with open(path, encoding="utf-8") as fh:
        items = json.load(fh)
    out = []
    for a in items:
        if a.get("deleted") or a.get("draft"):
            continue
        aid = a.get("id")
        if not aid:
            continue
        lastmod = (a.get("created_at") or "")[:10] or None
        out.append((aid, lastmod, a.get("sort") or 0))
    out.sort(key=lambda r: r[2], reverse=True)
    return out


def build():
    rows = ['<?xml version="1.0" encoding="UTF-8"?>',
            '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']

    for path, freq, prio in PAGES:
        rows += ["  <url>",
                 f"    <loc>{BASE}{path}</loc>",
                 f"    <changefreq>{freq}</changefreq>",
                 f"    <priority>{prio}</priority>",
                 "  </url>"]

    arts = articles()
    for aid, lastmod, _ in arts:
        loc = escape(f"{BASE}/a/{aid}.html")
        rows.append("  <url>")
        rows.append(f"    <loc>{loc}</loc>")
        if lastmod:
            rows.append(f"    <lastmod>{lastmod}</lastmod>")
        rows += ["    <changefreq>monthly</changefreq>",
                 "    <priority>0.6</priority>",
                 "  </url>"]

    rows.append("</urlset>")
    xml = "\n".join(rows) + "\n"

    with open(os.path.join(ROOT, "sitemap.xml"), "w", encoding="utf-8") as fh:
        fh.write(xml)

    print(f"sitemap.xml נבנה: {len(PAGES)} דפים קבועים + {len(arts)} כתבות = {len(PAGES) + len(arts)} כתובות")


if __name__ == "__main__":
    build()
