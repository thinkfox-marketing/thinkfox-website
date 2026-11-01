"""Zerlegt das Elementor-Markup übernommener Beiträge (src/legacy/posts/*.html) in Bausteine.
Python-Gegenstück zu src/lib/zerlegen.ts – Grundlage für umstellen.py (nur Standardbibliothek)."""
import html as htmlmod
import json
import re

ERLAUBT = {'p', 'h2', 'h3', 'h4', 'ul', 'ol', 'li', 'strong', 'b', 'em', 'i', 'a', 'br', 'blockquote'}


def element_ende(s, start):
    tag = re.match(r'<([a-zA-Z0-9]+)', s[start:]).group(1)
    tiefe = 0
    for m in re.compile(r'<(/?)%s\b[^>]*?(/?)>' % tag).finditer(s, start):
        if m.group(2):
            continue
        tiefe += -1 if m.group(1) else 1
        if tiefe == 0:
            return m.end()
    raise ValueError('kein Ende')


def entities(s):
    return (s.replace('&#8211;', '–').replace('&#8222;', '„').replace('&#8220;', '“').replace('&#8217;', '’')
            .replace('&#038;', '&amp;').replace('&nbsp;', ' ').replace(' ', ' '))


def saeubern(h):
    h = entities(h)
    h = re.sub(r'<(script|style|svg)\b[\s\S]*?</\1>', '', h, flags=re.I)
    h = re.sub(r'<!--[\s\S]*?-->', '', h)

    def tag(m):
        zu, t, attrs = m.group(1), m.group(2).lower(), m.group(3)
        if t == 'img' and not zu:
            src = re.search(r'\ssrc="([^"]*)"', attrs)
            alt = re.search(r'\salt="([^"]*)"', attrs)
            return f'<img src="{src.group(1)}" alt="{alt.group(1) if alt else ""}">' if src else ''
        if t not in ERLAUBT:
            return ''
        if zu:
            return f'</{t}>'
        if t == 'a':
            href = re.search(r'\shref="([^"]*)"', attrs)
            if not href:
                return ''
            href = re.sub(r'^https?://(www\.)?thinkfox\.de', '', href.group(1)) or '/'
            return f'<a href="{href}">'
        return f'<{t}>'

    h = re.sub(r'<(/?)([a-zA-Z0-9]+)\b([^>]*)>', tag, h)
    h = h.replace('<b>', '<strong>').replace('</b>', '</strong>').replace('<i>', '<em>').replace('</i>', '</em>')
    h = re.sub(r'<(p|li|h[2-4])>\s*(<br>\s*)*</\1>', '', h)
    h = re.sub(r'<strong>\s*</strong>', '', h)
    h = re.sub(r'[ \t]+', ' ', h)
    h = re.sub(r'\s*\n\s*', '\n', h)
    return h.strip()


def text(h):
    return re.sub(r'\s+', ' ', htmlmod.unescape(re.sub(r'<[^>]+>', ' ', entities(h)))).strip()


def zerlegen(s):
    out = []
    bisher = -1
    for m in re.finditer(r'<div class="elementor-element [^"]*elementor-widget [^"]*"[^>]*data-widget_type="([a-z-]+)\.default"[^>]*>', s):
        if m.start() < bisher:
            continue
        ende = element_ende(s, m.start())
        bisher = ende
        div = s[m.start():ende]
        typ = m.group(1)
        settings = {}
        sm = re.search(r'data-settings="([^"]*)"', m.group(0))
        if sm:
            try:
                settings = json.loads(sm.group(1).replace('&quot;', '"'))
            except ValueError:
                pass
        if typ == 'text-editor':
            h = saeubern(div[len(m.group(0)):])
            if text(h):
                out.append({'typ': 'text', 'html': h})
        elif typ == 'heading':
            t = re.search(r'<(h[1-6]|p|div|span)[^>]*class="elementor-heading-title[^"]*"[^>]*>([\s\S]*?)</\1>', div)
            if t and text(t.group(2)):
                ebene = max(2, int(t.group(1)[1])) if re.match(r'h[1-6]$', t.group(1)) else 3
                out.append({'typ': 'ueberschrift', 'ebene': ebene, 'text': text(t.group(2))})
        elif typ == 'image':
            img = re.search(r'<img\b[^>]*>', div)
            if img:
                src = re.search(r'\ssrc="([^"]+)"', img.group(0))
                alt = re.search(r'\salt="([^"]*)"', img.group(0))
                if src:
                    out.append({'typ': 'bild', 'bild': src.group(1), 'alt': htmlmod.unescape(alt.group(1)) if alt else ''})
        elif typ == 'video':
            url = str(settings.get('youtube_url', '')).replace('\\/', '/')
            if url:
                out.append({'typ': 'video', 'youtube': url})
        elif typ == 'gallery':
            bilder = [{'bild': x.group(1), 'alt': htmlmod.unescape(x.group(2) or '')}
                      for x in re.finditer(r'data-thumbnail="([^"]+)"[^>]*?(?:aria-label="([^"]*)")?', div)]
            if bilder:
                out.append({'typ': 'galerie', 'bilder': bilder})
        elif typ == 'button':
            link = re.search(r'<a\b[^>]*href="([^"]+)"', div)
            t = re.search(r'class="elementor-button-text"[^>]*>([\s\S]*?)</span>', div)
            if link and t:
                out.append({'typ': 'button', 'text': text(t.group(1)),
                            'link': re.sub(r'^https?://(www\.)?thinkfox\.de', '', link.group(1)) or '/'})
        elif typ == 'nested-accordion':
            fragen = []
            for d in re.finditer(r'<details[^>]*class="e-n-accordion-item"[^>]*>([\s\S]*?)</details>', div):
                f = re.search(r'<div class="e-n-accordion-item-title-text">([\s\S]*?)</div>', d.group(1))
                a = saeubern(d.group(1).split('</summary>', 1)[-1])
                if f and text(a):
                    fragen.append({'frage': text(f.group(1)), 'antwort': a})
            if fragen:
                out.append({'typ': 'faq', 'fragen': fragen})
    return out
