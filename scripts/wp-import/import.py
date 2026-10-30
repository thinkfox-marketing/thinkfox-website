#!/usr/bin/env python3
"""Einmaliger (wiederholbarer) Import der WordPress-Seite thinkfox.de.

Zieht über die WP-REST-API und das gerenderte HTML:
  - Seiten-Fragmente (Elementor-Markup) nach src/legacy/pages/*.json
  - Header/Footer/Popup nach src/legacy/chrome/*.html
  - Templates für Beitrags-Ansichten und Loops nach src/legacy/templates/*.html
  - Projekte und Blogbeiträge als Content-Collections nach src/content/{projekte,blog}/*.md
    (Originalinhalt der Beiträge nach src/legacy/posts/*.html)
  - alle referenzierten Assets nach public/wp-content/** (gleiche Pfade wie im Original)

Nur Python-Standardbibliothek. Aufruf aus dem Repo-Root:
  python3 scripts/wp-import/import.py [--cache .wp-cache] [--offline]
"""
import argparse
import concurrent.futures
import html
import json
import os
import re
import sys
import urllib.parse
import urllib.request

SITE = "https://thinkfox.de"
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
OUT_LEGACY = os.path.join(ROOT, "src", "legacy")
OUT_CONTENT = os.path.join(ROOT, "src", "content")
OUT_PUBLIC = os.path.join(ROOT, "public")

BLOG_CATEGORY = 24
PLATZIERUNGEN = ("startseite", "website", "content-produktion")

ap = argparse.ArgumentParser()
ap.add_argument("--cache", default=os.path.join(ROOT, ".wp-cache"))
ap.add_argument("--offline", action="store_true", help="nur Cache verwenden")
ap.add_argument("--skip-assets", action="store_true")
args = ap.parse_args()
os.makedirs(args.cache, exist_ok=True)


# ---------------------------------------------------------------- fetching

def fetch(url, binary=False):
    key = re.sub(r"[^A-Za-z0-9._-]", "_", url.replace(SITE, ""))[:200] or "index"
    path = os.path.join(args.cache, key)
    if os.path.exists(path):
        data = open(path, "rb").read()
    else:
        if args.offline:
            raise SystemExit(f"offline, nicht im Cache: {url}")
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (thinkfox-import)"})
        data = urllib.request.urlopen(req, timeout=120).read()
        open(path, "wb").write(data)
    return data if binary else data.decode("utf-8")


def api(path):
    return json.loads(fetch(f"{SITE}/wp-json/wp/v2/{path}"))


# ---------------------------------------------------------------- html helpers

def match_element(s, start):
    """Index hinter dem schließenden Tag des Elements, das bei `start` beginnt."""
    tag = re.match(r"<([a-zA-Z0-9]+)", s[start:]).group(1)
    depth = 0
    for m in re.finditer(rf"<(/?){tag}\b[^>]*?(/?)>", s[start:]):
        if m.group(2):
            continue
        depth += -1 if m.group(1) else 1
        if depth == 0:
            return start + m.end()
    raise ValueError(f"kein Ende für <{tag}> bei {start}")


def element_at(s, needle, start=0):
    i = s.find(needle, start)
    if i < 0:
        return None
    b = s.rfind("<", 0, i + 1) if not needle.startswith("<") else i
    return b, match_element(s, b)


def inner_range(s, start):
    """(inner_start, inner_end) eines Elements, das bei `start` beginnt."""
    end = match_element(s, start)
    open_end = s.find(">", start) + 1
    close_start = s.rfind("</", 0, end)
    return open_end, close_start


def localize(s):
    """Absolute thinkfox.de-URLs in Wurzel-relative umschreiben (nur in Body-Markup)."""
    s = s.replace("https:\\/\\/thinkfox.de\\/", "\\/")
    s = re.sub(r"https?://(?:www\.)?thinkfox\.de/", "/", s)
    s = re.sub(r"https?://(?:www\.)?thinkfox\.de(?=[\"'])", "/", s)
    return s


def strip_scripts(s):
    """Entfernt Skripte aus Inhaltsbereichen – außer eigenem Inline-Code (HTML-Widgets) und Trustindex."""
    def keep(m):
        body = m.group(0)
        if "application/ld+json" in body or "tiLoader" in body or "trustindex" in body:
            return body
        if re.search(r"<script\b[^>]*\bsrc=", body) or SCRIPT_BLACKLIST.search(body[:400]):
            return ""
        return body
    return re.sub(r"<script\b[^>]*>.*?</script>", keep, s, flags=re.S)


def slug_of(link):
    p = urllib.parse.urlparse(link).path.strip("/")
    return p or "index"


def text(s):
    return html.unescape(re.sub(r"<[^>]+>", "", s)).strip()


# ---------------------------------------------------------------- data

pages = api("pages?per_page=100")
posts = api("posts?per_page=100")
cats = api("categories?per_page=100")
tags = api("tags?per_page=100")
cat_slug = {c["id"]: c["slug"] for c in cats}
tag_slug = {t["id"]: t["slug"] for t in tags}

media_ids = sorted({p["featured_media"] for p in posts if p.get("featured_media")})
media = {}
for i in range(0, len(media_ids), 50):
    chunk = ",".join(map(str, media_ids[i:i + 50]))
    for m in api(f"media?per_page=100&include={chunk}"):
        media[m["id"]] = m


def rendered(link):
    return fetch(link)


# ---------------------------------------------------------------- page anatomy

def anatomy(doc):
    head = doc[doc.find("<head>") + 6: doc.find("</head>")]
    body_open = re.search(r"<body([^>]*)>", doc)
    body_class = re.search(r'class="([^"]*)"', body_open.group(1)).group(1)
    body = doc[body_open.end(): doc.rfind("</body>")]

    hdr = element_at(body, '<header data-elementor-type="header"')
    ftr = element_at(body, '<footer data-elementor-type="footer"')
    canvas = hdr is None  # Elementor-Canvas-Seiten haben weder Header noch Footer
    if canvas:
        wrap = element_at(body, '<div data-elementor-type="wp-page"')
        hb = he = wrap[0]
        fb = fe = wrap[1]
    else:
        (hb, he), (fb, fe) = hdr, ftr
    pop = element_at(body, '<div data-elementor-type="popup"')
    return {
        "head": head,
        "bodyClass": body_class,
        "header": body[hb:he],
        "main": body[he:fb],
        "footer": body[fb:fe],
        "after": body[fe:],
        "popup": body[pop[0]:pop[1]] if pop else "",
        "canvas": canvas,
    }


def styles_in_order(doc):
    """Alle Stylesheet-Links und Inline-Styles außerhalb der Inhaltsbereiche, in Dokument-Reihenfolge."""
    a = anatomy(doc)
    out = []
    for region in (a["head"], a["after"]):
        for m in re.finditer(r"<link\b[^>]*rel=['\"]stylesheet['\"][^>]*>|<style\b[^>]*>.*?</style>", region, re.S):
            tag = m.group(0)
            if "fonts.bunny.net" in tag:
                continue
            if tag.startswith("<link"):
                href = html.unescape(re.search(r"href=['\"]([^'\"]+)", tag).group(1))
                href = localize(href.split("?")[0])
                tid = re.search(r"id=['\"]([^'\"]+)", tag)
                out.append({"type": "link", "href": href, "id": tid.group(1) if tid else None})
            else:
                out.append({"type": "style", "css": localize(tag)})
    return out


# Skripte, die das neue System selbst bereitstellt (Tracking/Consent in Tracking.astro)
# oder die ein WordPress-Backend voraussetzen.
SCRIPT_BLACKLIST = re.compile(
    r"googletagmanager|google_gtagjs|usercentrics|fbq\(|burst|wp-consent-api|consent_api|googlesitekit"
    r"|speculationrules|application/ld\+json|sbiajaxurl"
)


def scripts_in_order(doc):
    """Skripte aus Head und Footer in Original-Reihenfolge (ohne Inhaltsbereiche)."""
    a = anatomy(doc)
    out = []
    for where, region in (("head", a["head"]), ("body", a["after"])):
        for m in re.finditer(r"<script\b([^>]*)>(.*?)</script>", region, re.S):
            attrs, body = m.group(1), m.group(2)
            if SCRIPT_BLACKLIST.search(attrs) or SCRIPT_BLACKLIST.search(body[:400]):
                continue
            src = re.search(r"src=['\"]([^'\"]+)", attrs)
            sid = re.search(r"id=['\"]([^'\"]+)", attrs)
            typ = re.search(r"type=['\"]([^'\"]+)", attrs)
            item = {"where": where, "id": sid.group(1) if sid else None, "type": typ.group(1) if typ else None}
            if src:
                url = html.unescape(src.group(1))
                if "thinkfox.de" not in url and not url.startswith("/"):
                    item["src"] = url  # externe Skripte (z. B. Trustindex)
                else:
                    item["src"] = localize(url.split("?")[0])
                item["async"] = " async" in attrs
                item["defer"] = " defer" in attrs
            else:
                item["inline"] = localize(body)
            out.append(item)
    return out


def seo_head(head):
    """Rank-Math-Block (Title, Meta, OG, JSON-LD) unverändert übernehmen."""
    m = re.search(r"<!-- Suchmaschinen-Optimierung durch Rank Math.*?<!-- /Rank Math.*?-->", head, re.S)
    block = m.group(0) if m else ""
    return block


def seo_fields(head):
    def meta(attr, name):
        m = re.search(rf'<meta {attr}="{re.escape(name)}" content="([^"]*)"', head)
        return html.unescape(m.group(1)) if m else ""
    t = re.search(r"<title>(.*?)</title>", head, re.S)
    kw = re.search(r'"keywords":"([^"]*)"', head)
    return {
        "titel": html.unescape(t.group(1)) if t else "",
        "beschreibung": meta("name", "description"),
        "fokusKeyword": json.loads(f'"{kw.group(1)}"') if kw else "",
        "lesedauer": meta("name", "twitter:data2"),
    }


# ---------------------------------------------------------------- loops

LOOP_WIDGETS = {
    "loop-carousel.post": r'<div class="swiper-wrapper"',
    "loop-grid.post": r'<div class="elementor-loop-container',
    "posts.classic": r'<div class="elementor-posts-container',
}
ITEM_START = re.compile(r'<style id="loop-dynamic-\d+">|<div data-elementor-type="loop-item"|<article class="elementor-post ')


def split_items(inner):
    """Zerlegt den Inhalt eines Loop-Containers in (template_style, [items])."""
    template_style = ""
    m = re.search(r'<style id="loop-\d+">.*?</style>', inner, re.S)
    if m:
        template_style = m.group(0)
        inner = inner[:m.start()] + inner[m.end():]
    items, pos = [], 0
    while True:
        m = ITEM_START.search(inner, pos)
        if not m:
            break
        start = m.start()
        if m.group(0).startswith("<style"):
            style_end = inner.find("</style>", start) + 8
            el = inner.find("<", style_end)
            while inner.startswith("<style", el):
                el = inner.find("<", inner.find("</style>", el) + 8)
            end = match_element(inner, el)
        else:
            end = match_element(inner, start)
        items.append(inner[start:end])
        pos = end
    return template_style, items


def templatize_item(item, post):
    """Ersetzt postspezifische Werte eines gerenderten Loop-Items durch Platzhalter."""
    pid = str(post["id"])
    link = localize(post["link"])
    t = item
    t = re.sub(r'<img\b[^>]*>', "{{IMG}}", t, count=1)
    t = re.sub(r'url\("/wp-content/uploads/[^"]+"\)', 'url("{{IMG_URL}}")', t)
    t = t.replace(link, "{{URL}}")
    # Post-Klassen (post-123 post type-post ... category-x tag-y)
    t = re.sub(r'(e-loop-item-)' + pid + r' post-' + pid + r' post type-post[^"]*', r"\1{{ID}} {{POST_CLASSES}}", t)
    t = re.sub(r'(elementor-post elementor-grid-item )post-' + pid + r' post type-post[^"]*', r"\1{{POST_CLASSES}}", t)
    t = t.replace(f"e-loop-item-{pid}", "e-loop-item-{{ID}}")
    title_html = post["title"]["rendered"]
    for variant in {title_html, html.escape(html.unescape(title_html), quote=False)}:
        t = t.replace(variant, "{{TITLE}}")
    t = re.sub(r'aria-label="Mehr über [^"]*"', 'aria-label="Mehr über {{TITLE_ATTR}}"', t)
    # Excerpt (Wortanzahl merken, damit neue Beiträge identisch gekürzt werden)
    words = None
    for pat in (r'(<div class="elementor-post__excerpt">\s*<p>)(.*?)(</p>)',
                r'(data-widget_type="theme-post-excerpt.default">\s*<p>)(.*?)(\s*</div>)'):
        m = re.search(pat, t, re.S)
        if m:
            words = len(text(m.group(2)).split())
            t = t[:m.start(2)] + "{{EXCERPT}}" + t[m.end(2):]
    # Datum (post-info) samt Datums-Archiv-Link, Autor-Link
    t = re.sub(r'(elementor-post-info__item--type-date">\s*(?:<time>)?)\s*[^<]+', r"\1{{DATE}}", t)
    t = re.sub(r'href="/\d{4}/\d{2}/\d{2}/"', 'href="/blog/"', t)
    t = t.replace('href="/author/thinkfox/"', 'href="/blog/"')
    if words is not None:
        t = f"<!--excerptWords:{words}-->" + t
    return t


# ---------------------------------------------------------------- run

def write(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)


all_posts_by_id = {p["id"]: p for p in posts}
loops = {}
page_index = []
assets = set()


def collect_assets(s):
    s = html.unescape(s).replace("\\/", "/")
    for u in re.findall(r"(?:https?://thinkfox\.de)?(/wp-(?:content|includes)/[^\s\"'\)<>,]+)", s):
        u = u.split("?")[0].split("#")[0]
        if not u.endswith("/") and "*" not in u:
            assets.add(u)


def process_loops(main, page_slug):
    """Ersetzt Loop-Inhalte durch {{LOOP:name}} und merkt sich Query + Template."""
    n = 0
    for widget, container_start in LOOP_WIDGETS.items():
        search_from = 0
        while True:
            w = main.find(f'data-widget_type="{widget}"', search_from)
            if w < 0:
                break
            c = re.compile(container_start).search(main, w)
            ib, ie = inner_range(main, c.start())
            inner = main[ib:ie]
            tstyle, items = split_items(inner)
            ids = [int(re.search(r"post-(\d+)", it).group(1)) for it in items]
            first = all_posts_by_id[ids[0]]
            name = f"{page_slug}-{n}"
            loops[name] = {
                "widget": widget,
                "templateStyle": tstyle,
                "itemTemplate": templatize_item(items[0], first),
                "ids": ids,
            }
            placeholder = "{{LOOP:" + name + "}}"
            main = main[:ib] + placeholder + main[ie:]
            search_from = ib + len(placeholder)
            n += 1
    return main


chrome_written = False
for p in pages:
    doc = rendered(p["link"])
    collect_assets(doc)
    a = anatomy(doc)
    slug = slug_of(p["link"])
    main = localize(strip_scripts(a["main"]))
    main = process_loops(main, slug.replace("/", "__"))
    if not chrome_written and not a["canvas"]:
        write(os.path.join(OUT_LEGACY, "chrome", "header.html"), localize(strip_scripts(a["header"])))
        write(os.path.join(OUT_LEGACY, "chrome", "footer.html"), localize(strip_scripts(a["footer"])))
        write(os.path.join(OUT_LEGACY, "chrome", "popup.html"), localize(strip_scripts(a["popup"])))
        chrome_written = True
    write(os.path.join(OUT_LEGACY, "pages", slug.replace("/", "__") + ".json"), json.dumps({
        "path": "/" if slug == "index" else f"/{slug}/",
        "wpId": p["id"],
        "seo": seo_head(a["head"]),
        "styles": styles_in_order(doc),
        "scripts": scripts_in_order(doc),
        "bodyClass": a["bodyClass"],
        "canvas": a["canvas"],
        "main": main,
    }, ensure_ascii=False, indent=1))
    page_index.append(slug)


# Beiträge: Single-Templates + Content-Collections

def featured(post):
    m = media.get(post.get("featured_media"))
    if not m:
        return None, ""
    return localize(m["source_url"]), m.get("alt_text") or ""


def frontmatter(d):
    return "---\n" + "\n".join(f"{k}: {json.dumps(v, ensure_ascii=False)}" for k, v in d.items()) + "\n---\n"


single_templates = {}
for p in posts:
    doc = rendered(p["link"])
    collect_assets(doc)
    a = anatomy(doc)
    slug = slug_of(p["link"])
    kind = "blog" if p["categories"] == [BLOG_CATEGORY] else "projekte"
    main = localize(strip_scripts(a["main"]))

    cb = element_at(main, '<div data-elementor-type="wp-post"')
    content = main[cb[0]:cb[1]]
    template = main[:cb[0]] + "{{CONTENT}}" + main[cb[1]:]
    tm = re.search(r'data-elementor-type="single-post" data-elementor-id="(\d+)"', template)
    template_id = tm.group(1) if tm else "none"
    title_html = p["title"]["rendered"]
    template = re.sub(r'(<h1 class="elementor-heading-title[^"]*">)(.*?)(</h1>)', r"\1{{TITLE}}\3", template, count=1, flags=re.S)
    template = re.sub(r'(elementor-widget-theme-post-featured-image.*?)<img\b[^>]*>', r"\1{{IMG}}", template, count=1, flags=re.S)
    template = template.replace(f"elementor-{p['id']}", "elementor-{{ID}}")
    template = re.sub(rf'post-{p["id"]} post type-post[^"]*', "{{POST_CLASSES}}", template)
    single_templates.setdefault(template_id, {"template": template, "example": slug,
                                              "styles": styles_in_order(doc), "scripts": scripts_in_order(doc),
                                              "bodyClass": a["bodyClass"],
                                              "wpId": p["id"]})

    img, alt = featured(p)
    fm = {
        "title": html.unescape(text(title_html)),
        "date": p["date"],
        "modified": p["modified"],
        "kategorien": [cat_slug[c] for c in p["categories"]],
        "schlagworte": [tag_slug[t] for t in p["tags"]],
        # steuert die Projekt-Slider (im Original über diese Schlagworte abgefragt)
        "platzierung": [tag_slug[t] for t in p["tags"] if tag_slug[t] in PLATZIERUNGEN],
        "bild": img,
        "bildAlt": alt,
        "auszug": re.sub(r"\s*\[…\]\s*$", "", html.unescape(text(p["excerpt"]["rendered"])).replace("\xa0", " ")),
        "seo": seo_fields(a["head"]),
        "wpId": p["id"],
        "template": template_id,
        "legacy": True,
    }
    write(os.path.join(OUT_CONTENT, kind, f"{slug}.md"), frontmatter(fm))
    write(os.path.join(OUT_LEGACY, "posts", f"{slug}.html"), content)
    # post-spezifisches Stylesheet + Body-Klassen merken
    write(os.path.join(OUT_LEGACY, "posts", f"{slug}.json"), json.dumps({
        "styles": styles_in_order(doc), "scripts": scripts_in_order(doc), "bodyClass": a["bodyClass"],
    }, ensure_ascii=False, indent=1))

for tid, t in single_templates.items():
    write(os.path.join(OUT_LEGACY, "templates", f"single-{tid}.json"), json.dumps(t, ensure_ascii=False, indent=1))

write(os.path.join(OUT_LEGACY, "loops.json"), json.dumps(loops, ensure_ascii=False, indent=1))

# Kategorie-Archive (Hello-Theme-Standard)
cat_doc = rendered(f"{SITE}/category/website/")
a = anatomy(cat_doc)
main = localize(strip_scripts(a["main"]))
pc = element_at(main, '<div class="page-content">')
ib, ie = inner_range(main, pc[0])
inner = main[ib:ie]
arts = re.findall(r"<article class=\"post\">.*?</article>", inner, re.S)
first_link = re.search(r'href="([^"]+)"', arts[0]).group(1)
first_post = next(p for p in posts if localize(p["link"]) == first_link)
art_t = templatize_item(arts[0], first_post)
art_t = re.sub(r"<p>.*?</p>", "<p>{{EXCERPT}}</p>", art_t, flags=re.S)
rest = inner[inner.rfind("</article>") + len("</article>"):]
archive = main[:ib] + "{{ITEMS}}" + rest + main[ie:]
archive = re.sub(r"(Kategorie: <span>)[^<]*(</span>)", r"\1{{CATEGORY}}\2", archive)
archive = re.sub(r'\s*<nav class="pagination">.*?</nav>', "{{PAGINATION}}", archive, flags=re.S)
write(os.path.join(OUT_LEGACY, "templates", "archive.json"), json.dumps({
    "template": archive, "item": art_t, "styles": styles_in_order(cat_doc), "scripts": scripts_in_order(cat_doc),
    "bodyClass": a["bodyClass"],
}, ensure_ascii=False, indent=1))

write(os.path.join(OUT_LEGACY, "taxonomies.json"), json.dumps({
    "kategorien": [{"slug": c["slug"], "name": html.unescape(c["name"]), "id": c["id"]} for c in cats],
    "schlagworte": [{"slug": t["slug"], "name": html.unescape(t["name"]), "id": t["id"]} for t in tags],
}, ensure_ascii=False, indent=1))

# Referenzen (Kundenlogos aus dem Logo-Karussell der Startseite)
home = json.load(open(os.path.join(OUT_LEGACY, "pages", "index.json")))["main"]
lc = home.find('data-widget_type="eael-logo-carousel.default"')
lc_end = home.find("data-widget_type=", lc + 50)
for n, (src, alt) in enumerate(re.findall(r'<img[^>]*class="eael-lc-img-src" src="([^"]+)" alt="([^"]*)"', home[lc:lc_end])):
    slug = re.sub(r"[^a-z0-9]+", "-", alt.lower().replace("ä", "ae").replace("ö", "oe").replace("ü", "ue").replace("ß", "ss")).strip("-")
    write(os.path.join(OUT_CONTENT, "referenzen", f"{slug}.md"), frontmatter({
        "name": html.unescape(alt), "logo": src, "reihenfolge": (n + 1) * 10,
    }))

# Instagram-Feed: Snapshot der Beiträge (Bilder lokal), Markup-Vorlage für ein Item
IG_DIR = os.path.join(OUT_PUBLIC, "wp-content", "uploads", "sb-instagram-feed-images")
os.makedirs(IG_DIR, exist_ok=True)


def ig_download(path):
    """Lädt eine vom Instagram-Plugin lokal zwischengespeicherte Bilddatei."""
    name = path.rsplit("/", 1)[-1]
    dest = os.path.join(IG_DIR, name)
    if not os.path.exists(dest):
        open(dest, "wb").write(fetch(f"{SITE}/wp-content/uploads/sb-instagram-feed-images/{name}", binary=True))
    return f"/wp-content/uploads/sb-instagram-feed-images/{name}"


def ig_base(cdn_url):
    return re.search(r"/([^/?]+)\.(?:jpg|webp|png)", html.unescape(cdn_url)).group(1)


resized_attr = re.search(r'data-resized="([^"]+)"', home)
resized = json.loads(html.unescape(resized_attr.group(1))) if resized_attr else {}
sbi_start = home.find('<div id="sbi_images"')
sbi_inner = home[home.find(">", sbi_start) + 1:home.rfind("</div>", 0, match_element(home, sbi_start))]
ig_items = []
ig_templates = {}
for m in re.finditer(r'<div class="sbi_item', sbi_inner):
    item = sbi_inner[m.start():match_element(sbi_inner, m.start())]
    iid = re.search(r'id="sbi_(\d+)"', item).group(1)
    srcset = json.loads(html.unescape(re.search(r'data-img-src-set="([^"]+)"', item).group(1)))
    info = resized.get(iid, {})
    base = info.get("id") or ig_base(srcset.get("d") or next(iter(srcset.values())))
    alt = html.unescape(re.search(r'<img[^>]*alt="([^"]*)"', item, re.S).group(1))
    ig_items.append({
        "id": iid,
        "datum": int(re.search(r'data-date="(\d+)"', item).group(1)),
        "typ": re.search(r'sbi_type_(\w+)', item).group(1),
        "link": re.search(r'class="sbi_photo" href="([^"]+)"', item).group(1),
        "basis": base,
        "seitenverhaeltnis": info.get("ratio", "1"),
        "bild": ig_download(f"{base}full.webp"),
        "bildKlein": ig_download(f"{base}low.webp"),
        "text": alt,
    })
    typ = re.search(r'sbi_type_(\w+)', item).group(1)
    if typ not in ig_templates:
        t = re.sub(r'id="sbi_\d+" data-date="\d+"', 'id="sbi_{{ID}}" data-date="{{DATUM}}"', item)
        t = re.sub(r'sbi_type_\w+', "sbi_type_{{TYP}}", t, count=1)
        t = re.sub(r'(class="sbi_photo" href=")[^"]+', r"\1{{LINK}}", t)
        t = re.sub(r'data-full-res="[^"]+"', 'data-full-res="{{BILD}}"', t)
        t = re.sub(r'data-img-src-set="[^"]+"', 'data-img-src-set="{{SRCSET}}"', t)
        t = re.sub(r'(<span class="sbi-screenreader">)[^<]*', r"\1{{KURZTEXT}}", t)
        t = re.sub(r'(<img[^>]*alt=")[^"]*(")', r"\1{{TEXT}}\2", t, flags=re.S)
        t = re.sub(r'title="[^"]*"', 'title="{{TITEL}}"', t)
        ig_templates[typ] = t
avatar = re.search(r'data-avatar-url="([^"]+)"', home)
write(os.path.join(OUT_LEGACY, "instagram-items.json"), json.dumps(ig_templates, ensure_ascii=False, indent=1))
write(os.path.join(ROOT, "src", "data", "instagram.json"), json.dumps({
    "avatar": ig_download("thinkfox.marketing.webp"),
    "beitraege": ig_items,
}, ensure_ascii=False, indent=1))

# Formulare: Feldbeschriftungen für den Mail-Versand (public/api/forms.json)
forms = {}
for pj in sorted(os.listdir(os.path.join(OUT_LEGACY, "pages"))):
    pmain = json.load(open(os.path.join(OUT_LEGACY, "pages", pj)))["main"]
    for fm_ in re.finditer(r'<form\s+id="forminator-module-(\d+)"', pmain):
        fid = fm_.group(1)
        form = pmain[fm_.start():match_element(pmain, fm_.start())]
        fields = {}
        for fld in re.finditer(r'<div id="([a-z]+-\d+)" class="forminator-field-', form):
            block = form[fld.start():match_element(form, fld.start())]
            lab = re.search(r'class="forminator-label"[^>]*>(.*?)</(?:label|span)>', block, re.S)
            label = re.sub(r"\s*\*\s*$", "", text(lab.group(1))) if lab else fld.group(1)
            fields[fld.group(1)] = label
        forms[fid] = {"seite": pj[:-5], "felder": fields}
write(os.path.join(OUT_PUBLIC, "api", "forms.json"), json.dumps(forms, ensure_ascii=False, indent=1))

# Vorlagen-CSS für neue Beiträge: Element-Styles der Referenzbeiträge, auf eine feste Klasse umgeschrieben
# (Projekt: Waldeck für Text/Bild/Video, Mitarbeitershooting für die Galerie)
VORLAGEN = {"projekt": [13489, 14148], "blog": [16025]}
for name, wp_ids in VORLAGEN.items():
    css = ""
    for wp_id in wp_ids:
        src = os.path.join(OUT_PUBLIC, "wp-content", "uploads", "elementor", "css", f"post-{wp_id}.css")
        if os.path.exists(src):
            css += open(src, encoding="utf-8").read().replace(f".elementor-{wp_id} ", f".elementor-vorlage-{name} ") + "\n"
    write(os.path.join(OUT_PUBLIC, "css", f"vorlage-{name}.css"), css)

print(f"{len(page_index)} Seiten, {len(posts)} Beiträge, {len(loops)} Loops, {len(single_templates)} Single-Templates")


# ---------------------------------------------------------------- assets

if args.skip_assets:
    sys.exit(0)


def download(path):
    dest = os.path.join(OUT_PUBLIC, path.lstrip("/"))
    if os.path.exists(dest) and os.path.getsize(dest) > 0:
        return None
    try:
        data = fetch(SITE + urllib.parse.quote(path), binary=True)
    except Exception as e:  # noqa: BLE001
        return f"{path}: {e}"
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    open(dest, "wb").write(data)


def css_refs(path):
    dest = os.path.join(OUT_PUBLIC, path.lstrip("/"))
    if not path.endswith(".css") or not os.path.exists(dest):
        return set()
    css = open(dest, encoding="utf-8", errors="ignore").read()
    local = localize(css)
    if local != css:
        open(dest, "w", encoding="utf-8").write(local)
    out = set()
    for u in re.findall(r"url\(\s*[\"']?([^\"')]+)[\"']?\s*\)", local):
        if u.startswith(("data:", "http")):
            continue
        out.add(urllib.parse.urljoin(path, u).split("?")[0].split("#")[0])
    return out


pending = set(assets)
done = set()
while pending:
    with concurrent.futures.ThreadPoolExecutor(16) as ex:
        for err in ex.map(download, sorted(pending)):
            if err:
                print("FEHLER", err)
    done |= pending
    nxt = set()
    for pth in pending:
        nxt |= css_refs(pth)
    pending = nxt - done
print(f"{len(done)} Assets")
