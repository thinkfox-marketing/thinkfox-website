"""Überführt die übernommenen WordPress-Beiträge in die Felder des einheitlichen Layouts
(src/lib/beitrag.ts): Projekte → Steckbrief, Aufgabe/Lösung/Ergebnis, Medien; Blog → Text, FAQ, Anfrage.

Aufruf:  python3 scripts/umstellung/umstellen.py            (schreibt src/content/*/*.md)
         python3 scripts/umstellung/umstellen.py --probe    (zeigt nur, was entstehen würde)

Bereits von Hand gepflegte Felder (z. B. aufgabe) werden nicht überschrieben. Nur Standardbibliothek."""
import glob
import json
import os
import re
import sys

sys.path.insert(0, os.path.dirname(__file__))
from bausteine import text, zerlegen  # noqa: E402

PROBE = '--probe' in sys.argv
WURZEL = os.path.join(os.path.dirname(__file__), '..', '..')
KATEGORIEN = {k['slug']: k['name'] for k in json.load(open(os.path.join(WURZEL, 'src/legacy/taxonomies.json')))['kategorien']}


# ------------------------------------------------------------------ HTML → Markdown

def inline_md(h):
    h = re.sub(r'<a href="([^"]*)">([\s\S]*?)</a>', lambda m: f'[{inline_md(m.group(2)).strip()}]({m.group(1)})', h)
    h = re.sub(r'<strong>([\s\S]*?)</strong>', lambda m: f'**{m.group(1).strip()}**' if text(m.group(1)) else '', h)
    h = re.sub(r'<em>([\s\S]*?)</em>', lambda m: f'*{m.group(1).strip()}*' if text(m.group(1)) else '', h)
    h = re.sub(r'<br>', '  \n', h)
    h = re.sub(r'<img src="([^"]*)" alt="([^"]*)">', r'![\2](\1)', h)
    h = re.sub(r'<[^>]+>', '', h)
    import html as htmlmod
    h = htmlmod.unescape(h)
    h = re.sub(r'\*\*\s*\*\*', '', h)
    h = re.sub(r'[ \t]+', ' ', h)
    return h.strip()


def elemente(h):
    """Oberste Elemente eines gesäuberten HTML-Blocks in Dokument-Reihenfolge: [(tag, inneres)].
    Text ohne umschließendes Tag wird als Absatz übernommen (an Zeilenumbrüchen getrennt)."""
    out, pos = [], 0
    for m in re.finditer(r'<(p|ul|ol|h2|h3|h4|blockquote)>([\s\S]*?)</\1>', h):
        davor = h[pos:m.start()]
        for teil in re.split(r'\n|<br>', davor):
            if text(teil):
                out.append(('p', teil))
        out.append((m.group(1), m.group(2)))
        pos = m.end()
    for teil in re.split(r'\n|<br>', h[pos:]):
        if text(teil):
            out.append(('p', teil))
    return out


def md(elem, ueberschrift='###'):
    teile = []
    for tag, inner in elem:
        if tag == 'p':
            t = inline_md(inner)
            if t:
                teile.append(t)
        elif tag in ('ul', 'ol'):
            items = [inline_md(li) for li in re.findall(r'<li>([\s\S]*?)</li>', inner)]
            teile.append('\n'.join((f'{i + 1}. ' if tag == 'ol' else '- ') + x for i, x in enumerate(items) if x))
        elif tag in ('h2', 'h3', 'h4'):
            ebene = {'h2': '##', 'h3': '###', 'h4': '####'}[tag] if ueberschrift == '##' else ('###' if tag != 'h4' else '####')
            teile.append(f'{ebene} {inline_md(inner)}')
        elif tag == 'blockquote':
            teile.append('> ' + inline_md(inner))
    return '\n\n'.join(t for t in teile if t.strip())


# ------------------------------------------------------------------ Frontmatter

def lesen(pfad):
    s = open(pfad, encoding='utf-8').read()
    m = re.match(r'---\n([\s\S]*?)\n---\n?([\s\S]*)$', s)
    return m.group(1), m.group(2)


def hat(fm, feld):
    return re.search(rf'^{feld}:', fm, re.M) is not None


def yaml_wert(v, einzug=''):
    if isinstance(v, str) and '\n' in v:
        return '|\n' + '\n'.join((einzug + '  ' + z) if z else '' for z in v.split('\n'))
    return json.dumps(v, ensure_ascii=False)


def setzen(fm, felder):
    for k, v in felder.items():
        if v in (None, '', [], {}):
            continue
        if isinstance(v, list) and v and isinstance(v[0], dict):
            zeilen = [f'{k}:']
            for e in v:
                erst = True
                for ek, ev in e.items():
                    zeilen.append(f"  {'- ' if erst else '  '}{ek}: {yaml_wert(ev, '    ')}")
                    erst = False
            neu = '\n'.join(zeilen)
        elif isinstance(v, dict):
            neu = f'{k}:\n' + '\n'.join(f'  {ek}: {yaml_wert(ev, "  ")}' for ek, ev in v.items())
        else:
            neu = f'{k}: {yaml_wert(v)}'
        if hat(fm, k):
            continue  # von Hand gepflegt – nicht überschreiben
        fm = fm.rstrip('\n') + '\n' + neu
    return fm


def legacy_aus(fm):
    return re.sub(r'^legacy: true$', 'legacy: false', fm, flags=re.M)


# ------------------------------------------------------------------ Projekte

def liste(t):
    """Komma-getrennte Leistungen (Kommas in Klammern bleiben)."""
    teile, tiefe, akt = [], 0, ''
    for z in t:
        tiefe += (z == '(') - (z == ')')
        if z == ',' and tiefe == 0:
            teile.append(akt); akt = ''
        else:
            akt += z
    teile.append(akt)
    return [x.strip(' .') for x in teile if x.strip(' .')]


def ist_liste(t):
    teile = liste(t)
    return len(teile) >= 2 and all(len(x.split()) <= 12 for x in teile)


LABEL = re.compile(r'^(AUFGABE|UMSETZUNG|ERGEBNIS|PROJEKT|LEISTUNGEN|KUNDE)\b', re.I)


def abschnitt(label):
    l = label.upper()
    if 'AUFGABE' in l and ('UMSETZUNG' in l or 'ERGEBNIS' in l):
        return 'kombiniert'
    if l.startswith('AUFGABE'):
        return 'aufgabe'
    if 'UMSETZUNG' in l and 'ERGEBNIS' in l:
        return 'kombiniert'
    if l.startswith('ERGEBNIS'):
        return 'ergebnis'
    return 'loesung'  # UMSETZUNG, PROJEKT, LEISTUNGEN (Beschreibung)


ERGEBNIS_START = re.compile(r'^(\*\*)?(Das Ergebnis|Ergebnis|Entstanden|Entstanden sind|Heute|Damit|Das Resultat|So entstand|So ist|Mit der neuen|Die neue Website|Durch die)', re.I)


def projekt(slug, fm):
    b = zerlegen(open(os.path.join(WURZEL, f'src/legacy/posts/{slug}.html'), encoding='utf-8').read())
    kunde = veroeff = None
    leistungen, link = [], None
    sektionen = {'aufgabe': [], 'loesung': [], 'ergebnis': [], 'kombiniert': []}
    medien = []
    aktuell = 'kombiniert'
    im_steckbrief = True
    modus = None  # innerhalb des Steckbriefs: 'kunde' | 'leistungen'
    for i, x in enumerate(b):
        if x['typ'] in ('bild', 'video', 'galerie'):
            medien.append({k: v for k, v in x.items()})
            continue
        if x['typ'] == 'ueberschrift':
            nach = b[i + 1] if i + 1 < len(b) else None
            t = x['text']
            if LABEL.match(t) or re.match(r'^Umsetzung', t, re.I):
                if t.upper().startswith('KUNDE'):
                    modus = 'kunde'
                    continue
                aktuell = abschnitt(t)
                im_steckbrief = False
                continue
            if im_steckbrief and modus == 'kunde' and not kunde:
                kunde = t
                modus = None
                continue
            if im_steckbrief and modus == 'leistungen' and ist_liste(t + ','):
                leistungen += liste(t)
                continue
            if nach and nach['typ'] in ('bild', 'video', 'galerie'):
                continue  # Bildunterschrift-artige Überschrift vor Medien
            sektionen[aktuell].append(('h3', t))
            continue
        if x['typ'] != 'text':
            continue
        for tag, inner in elemente(x['html']):
            t = text(inner)
            if not t:
                continue
            if im_steckbrief:
                if re.fullmatch(r'KUNDE:?', t, re.I):
                    modus = 'kunde'
                    continue
                if modus == 'kunde' and not kunde:
                    kunde = t
                    modus = None
                    continue
                vm = re.match(r'^Veröffentlichung:?\s*(.+)$', t, re.I)
                if vm:
                    veroeff = vm.group(1).strip()
                    continue
                lm = re.match(r'^LEISTUNGEN:?\s*(.*)$', t, re.I)
                if lm and (not lm.group(1) or ist_liste(lm.group(1))):
                    modus = 'leistungen'
                    if lm.group(1):
                        leistungen += liste(lm.group(1))
                    continue
                a = re.search(r'<a href="([^"]*)">([\s\S]*?)</a>', inner)
                if a and len(t) < 80 and tag in ('p', 'h3', 'h4') and not LABEL.match(t):
                    link = {'text': t, 'url': a.group(1)}
                    continue
                if modus == 'leistungen':
                    if tag in ('ul', 'ol'):
                        leistungen += [text(li).strip(' .') for li in re.findall(r'<li>([\s\S]*?)</li>', inner)]
                        continue
                    if tag == 'p' and ist_liste(t) and not LABEL.match(t):
                        leistungen += liste(t)
                        continue
                    if tag == 'p' and len(t.split()) <= 6 and not LABEL.match(t):
                        leistungen.append(t.strip(' .'))
                        continue
            if tag in ('h2', 'h3', 'h4') and re.match(r'^(Das )?Ergebnis\b', t, re.I):
                aktuell = 'ergebnis'; im_steckbrief = False; modus = None
                continue
            lab = re.match(r'^(AUFGABE[^a-z]*|UMSETZUNG[^a-z]*|ERGEBNIS[^a-z]*|PROJEKT|LEISTUNGEN:?)(\s+|$)', t)
            if lab and tag in ('p', 'h3', 'h2', 'h4') and lab.group(1).strip().upper() == lab.group(1).strip():
                aktuell = abschnitt(lab.group(1))
                im_steckbrief = False
                modus = None
                rest = t[lab.end():].strip()
                if rest:
                    # Label und Text im selben Absatz („LEISTUNGEN Thinkfox konzipierte …“)
                    inner = re.sub(r'^\s*(<strong>)?\s*' + re.escape(lab.group(1).strip()) + r'\s*(</strong>)?:?\s*', '', inner)
                    sektionen[aktuell].append((tag, inner))
                continue
            im_steckbrief = False
            modus = None
            sektionen[aktuell].append((tag, inner))

    # kombinierten Teil aufteilen: Ziel-Absatz → Aufgabe, Ergebnis-Absätze → Ergebnis, Rest → Lösung
    komb = sektionen['kombiniert']
    if komb:
        absaetze = [i for i, (tag, _) in enumerate(komb) if tag == 'p']
        if not sektionen['aufgabe'] and absaetze:
            erster = absaetze[0]
            if len(absaetze) >= 2 or re.search(r'\bZiel\b', text(komb[erster][1])):
                sektionen['aufgabe'].append(komb[erster])
                komb = komb[:erster] + komb[erster + 1:]
        if not sektionen['ergebnis']:
            treffer = [i for i, (tag, inner) in enumerate(komb) if tag == 'p' and ERGEBNIS_START.match(inline_md(inner))]
            if treffer:
                start = treffer[0]
            else:
                ps = [i for i, (tag, _) in enumerate(komb) if tag == 'p']
                start = ps[-1] if len(ps) >= 3 else None
            if start is not None:
                sektionen['ergebnis'] = komb[start:]
                komb = komb[:start]
        sektionen['loesung'] = sektionen['loesung'] + komb

    if not leistungen:
        cats = re.search(r'^kategorien:\s*(\[.*\])', fm, re.M)
        leistungen = [KATEGORIEN.get(k, k) for k in json.loads(cats.group(1))] if cats else []
    bild = re.search(r'^bild:\s*"([^"]*)"', fm, re.M)
    medien = [m for m in medien if not (m['typ'] == 'bild' and bild and m['bild'] == bild.group(1))]
    for m in medien:
        if m['typ'] == 'video':
            m['youtube'] = re.sub(r'\?si=[^&]*$', '', m['youtube'])
    ergebnis = {
        'kunde': kunde, 'veroeffentlichung': veroeff,
        'leistungen': [l for l in dict.fromkeys(leistungen) if l],
        'projektLink': link,
        'aufgabe': md(sektionen['aufgabe']), 'loesung': md(sektionen['loesung']), 'ergebnis': md(sektionen['ergebnis']),
        'medien': medien,
    }
    # Zeilen, die nur aus einem Link bestehen („### [kkd-gmbh.de](…)“) → Projektlink
    for k in ('aufgabe', 'loesung', 'ergebnis'):
        zeilen = []
        for z in ergebnis[k].split('\n\n'):
            lm = re.fullmatch(r'(#+ )?\[([^\]]+)\]\((https?://[^)]+)\)', z.strip())
            if lm:
                ergebnis['projektLink'] = ergebnis['projektLink'] or {'text': lm.group(2), 'url': lm.group(3)}
                continue
            zeilen.append(z)
        ergebnis[k] = '\n\n'.join(zeilen).strip()
    for k, v in KORREKTUREN.get(slug, {}).items():
        ergebnis[k] = v(ergebnis) if callable(v) else v
    return ergebnis


# Einzelfälle, die sich nicht sauber automatisch zuordnen lassen (Texte aus dem Original)
KORREKTUREN = {
    'karriereseiten-relaunch-fuer-deutsche-rentenversicherung-kliniken': {
        'kunde': 'Deutsche Rentenversicherung Oldenburg-Bremen',
        'aufgabe': lambda e: 'Umgesetzt für drei Häuser: Montanus-Klinik, Rheumaklinik Bad Wildungen und Marbachtalklinik.\n\n' + e['aufgabe'],
    },
    'website-relaunch-wirtschaftsfoerderung-waldeck-frankenberg': {
        'kunde': 'Wirtschaftsförderung und Regionalmanagement Waldeck-Frankenberg GmbH',
        'veroeffentlichung': '2025',
        'leistungen': ['Konzeption & Re-Design', 'Umstieg auf ein CMS', 'Strukturelle Vereinfachung',
                       'Flächen- und Objektverzeichnis', 'Nutzerführung & Auffindbarkeit'],
        'aufgabe': lambda e: e['ergebnis'],
        'loesung': lambda e: e['loesung'].split('\n\n')[-1],
        'ergebnis': '',
    },
    'edlake-das-erlebnismagazin-fuer-das-sauerland-und-nordhessen': {
        'loesung': lambda e: e['aufgabe'] + '\n\n' + e['loesung'],
        'aufgabe': '',
    },
    'markus-krebs-video-podcast-comedykation': {
        'leistungen': ['Videoproduktion (Kamera, Ton, Licht)', 'Postproduktion', 'Optimierung für YouTube & Social Media'],
    },
    'mitarbeitershooting-steuerkanzlei-hentschke-kohl-pflug': {
        'aufgabe': 'Fotoshooting der Mitarbeiterinnen und Mitarbeiter der Führungsebene.',
    },
}


# ------------------------------------------------------------------ Blog

def blog(slug):
    b = zerlegen(open(os.path.join(WURZEL, f'src/legacy/posts/{slug}.html'), encoding='utf-8').read())
    teile, faq, cta = [], None, None
    i = 0
    while i < len(b):
        x = b[i]
        nach = b[i + 1] if i + 1 < len(b) else None
        if x['typ'] == 'ueberschrift' and nach and nach['typ'] == 'faq':
            faq = {'titel': x['text'], 'fragen': [{'frage': f['frage'], 'antwort': md(elemente(f['antwort']))} for f in nach['fragen']]}
            i += 2
            continue
        if x['typ'] == 'faq':
            faq = {'titel': 'Häufige Fragen', 'fragen': [{'frage': f['frage'], 'antwort': md(elemente(f['antwort']))} for f in x['fragen']]}
        elif x['typ'] == 'text' and nach and nach['typ'] == 'button' and i + 2 >= len(b) and len(text(x['html']).split()) <= 80:
            cta = {'text': md(elemente(x['html']), '###'), 'button': nach['text'], 'link': nach['link']}
            i += 2
            continue
        elif x['typ'] == 'text':
            teile.append(md(elemente(x['html']), '##'))
        elif x['typ'] == 'ueberschrift':
            teile.append(('#' * x['ebene']) + ' ' + x['text'])
        elif x['typ'] == 'bild':
            teile.append(f"![{x['alt']}]({x['bild']})")
        elif x['typ'] == 'video':
            teile.append(re.sub(r'\?si=[^&]*$', '', x['youtube']))  # eigene Zeile → 2-Klick-Video
        elif x['typ'] == 'galerie':
            teile.append('\n\n'.join(f"![{g['alt']}]({g['bild']})" for g in x['bilder']))
        elif x['typ'] == 'button':
            teile.append(f"[{x['text']}]({x['link']})")
        i += 1
    return '\n\n'.join(t for t in teile if t.strip()), faq, cta


# ------------------------------------------------------------------ Lauf

for pfad in sorted(glob.glob(os.path.join(WURZEL, 'src/content/projekte/*.md'))):
    slug = os.path.basename(pfad)[:-3]
    fm, body = lesen(pfad)
    if not re.search(r'^legacy: true$', fm, re.M):
        continue
    f = projekt(slug, fm)
    if PROBE:
        print(f'===== {slug}\n  Kunde: {f["kunde"]} | Jahr: {f["veroeffentlichung"]} | Leistungen: {f["leistungen"]} | Link: {f["projektLink"]}')
        for k in ('aufgabe', 'loesung', 'ergebnis'):
            print(f'  {k.upper()}: {f[k][:220]!r}')
        print(f'  MEDIEN: {[m["typ"] for m in f["medien"]]}')
        continue
    open(pfad, 'w', encoding='utf-8').write(f'---\n{legacy_aus(setzen(fm, f))}\n---\n{body}')

for pfad in sorted(glob.glob(os.path.join(WURZEL, 'src/content/blog/*.md'))):
    slug = os.path.basename(pfad)[:-3]
    fm, body = lesen(pfad)
    if not re.search(r'^legacy: true$', fm, re.M):
        continue
    text_md, faq, cta = blog(slug)
    if PROBE:
        print(f'===== BLOG {slug}: {len(text_md)} Zeichen, FAQ {len(faq["fragen"]) if faq else 0}, CTA {bool(cta)}')
        continue
    fm = setzen(fm, {'faq': faq, 'cta': cta})
    open(pfad, 'w', encoding='utf-8').write(f'---\n{legacy_aus(fm)}\n---\n{text_md}\n')
