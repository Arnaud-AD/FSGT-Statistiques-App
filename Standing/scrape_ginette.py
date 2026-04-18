#!/usr/bin/env python3
"""
Scraper Ginette FSGT94 — Extrait les résultats depuis volley-fsgt94.fr/ginette/
Puis lance ginette_elo.py pour recalculer le classement ELO.

Usage:
    python3 scrape_ginette.py              # Scrape et affiche les résultats
    python3 scrape_ginette.py --update     # Scrape, met à jour ginette_elo.py et régénère ginette.json
    python3 scrape_ginette.py --file=X     # Utilise un fichier HTML local
"""

import html as html_module
import json
import os
import re
import ssl
import sys
import urllib.request
from datetime import datetime

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
GINETTE_URL = "https://volley-fsgt94.fr/ginette/"
GINETTE_ELO_PY = os.path.join(SCRIPT_DIR, "ginette_elo.py")


# ── Fetch ────────────────────────────────────────────────────────────────────

def fetch_html(local_file=None):
    """Télécharge la page Ginette ou lit un fichier local."""
    if local_file:
        with open(local_file, "r", encoding="utf-8") as f:
            return f.read()
    import time
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    req = urllib.request.Request(GINETTE_URL, headers={"User-Agent": "Mozilla/5.0"})
    for attempt in range(3):
        try:
            print(f"Téléchargement de {GINETTE_URL}...")
            with urllib.request.urlopen(req, context=ctx, timeout=30) as resp:
                html = resp.read().decode("utf-8")
                print(f"Page récupérée ({len(html)} caractères)")
                return html
        except (urllib.error.HTTPError, urllib.error.URLError, TimeoutError) as e:
            code = getattr(e, "code", None)
            if attempt < 2:
                wait = (attempt + 1) * 5
                err_msg = f"{code}" if code else str(e)[:50]
                print(f"  ⚠ {err_msg} - retry dans {wait}s...", file=sys.stderr)
                time.sleep(wait)
            else:
                raise


# ── Parse ────────────────────────────────────────────────────────────────────

def clean(text):
    """Nettoie le HTML et les espaces."""
    text = html_module.unescape(text)
    text = re.sub(r"<[^>]+>", "", text)
    return text.strip()


def parse_matches_from_section(section_html):
    """
    Parse les matchs depuis une section HTML de la page Ginette.
    Retourne une liste de dicts avec home, away, home_sets, away_sets, home_scores, away_scores.
    """
    matches = []

    # Extraire UNIQUEMENT la table desktop (d-none d-sm-block) pour éviter les doublons mobile
    desktop_match = re.search(
        r'<table class="table[^"]*d-none d-sm-block">(.*?)</table>',
        section_html, re.S
    )
    if not desktop_match:
        # Fallback: utiliser tout le HTML
        table_html = section_html
    else:
        table_html = desktop_match.group(1)

    rows = re.split(r"<tr[^>]*>", table_html)

    for row in rows:
        # Chercher "Team1 VS Team2"
        vs_match = re.search(r"([^<\n]+?)\s+VS\s+([^<\n]+)", row)
        if not vs_match:
            continue

        home = clean(vs_match.group(1))
        away = clean(vs_match.group(2))

        # Chercher le score total (X - Y) — dans le div text-center, après la balise <i>
        # Le score est sur une ligne seule type "3 - 2" après </i>
        total_match = re.search(
            r'</i>\s*(\d+)\s*-\s*(\d+)',
            row, re.S
        )

        if not total_match:
            # Match pas encore joué (N/C)
            continue

        home_sets = int(total_match.group(1))
        away_sets = int(total_match.group(2))

        # Chercher les scores détaillés par set
        # Pattern: "Set N:" suivi de "XX - YY" (avec possibles <span>)
        set_scores = re.findall(
            r"Set\s*\d+:\s*</div>\s*<div>.*?(\d+).*?-.*?(\d+)",
            row, re.S
        )

        home_scores = [int(s[0]) for s in set_scores]
        away_scores = [int(s[1]) for s in set_scores]

        # Vérifier la cohérence
        if not home_scores:
            # Pas de détail — scores inconnus, on met des placeholders
            # Forfait probable si 3-0 avec 25-0
            if (home_sets == 3 and away_sets == 0) or (home_sets == 0 and away_sets == 3):
                if home_sets == 3:
                    home_scores = [25, 25, 25]
                    away_scores = [0, 0, 0]
                else:
                    home_scores = [0, 0, 0]
                    away_scores = [25, 25, 25]

        matches.append({
            "home": home,
            "away": away,
            "home_sets": home_sets,
            "away_sets": away_sets,
            "home_scores": home_scores,
            "away_scores": away_scores,
        })

    return matches


def find_section(html, section_id):
    """Extrait le HTML d'une section accordion collapse."""
    pattern = rf'id="{re.escape(section_id)}"[^>]*>'
    match = re.search(pattern, html)
    if not match:
        return ""

    start = match.end()
    # Trouver la fin de cette section (prochain accordion-item ou fin d'accordion)
    depth = 1
    pos = start
    while depth > 0 and pos < len(html):
        open_div = html.find("<div", pos)
        close_div = html.find("</div>", pos)
        if close_div < 0:
            break
        if open_div >= 0 and open_div < close_div:
            depth += 1
            pos = open_div + 4
        else:
            depth -= 1
            pos = close_div + 6
            if depth == 0:
                return html[start:close_div]

    return html[start:start + 20000]


def find_tab_pane(html, tab_id):
    """Extrait le HTML d'un tab-pane."""
    pattern = rf'id="{re.escape(tab_id)}"[^>]*>'
    match = re.search(pattern, html)
    if not match:
        return ""

    start = match.end()
    # Find end by looking for next tab-pane or end of container
    next_tab = re.search(r'class="tab-pane\s', html[start:])
    if next_tab:
        return html[start:start + next_tab.start()]
    return html[start:start + 50000]


def parse_ginette_page(html):
    """Parse la page Ginette complète. Retourne un dict {round_name: [matches]}."""
    rounds = {}

    # ── Tab-pane IDs connus ──
    # v-tabs-premier-tour, v-tabs-deuxieme-tour : matchs de poule directement dans le pane
    # v-tabs-8-finale : accordion avec Principale/Consolante
    # v-tabs-4-finale : accordion avec Principale/Consolante
    # v-tabs-2-finale : demi-finales
    # v-tabs-finale : finale

    # Tours de poule
    for pane_id, round_name in [
        ("v-tabs-premier-tour", "Tour 1"),
        ("v-tabs-deuxieme-tour", "Tour 2"),
    ]:
        pane_html = find_tab_pane(html, pane_id)
        if pane_html:
            matches = parse_matches_from_section(pane_html)
            if matches:
                rounds[round_name] = matches

    # Rounds à élimination directe (avec accordion Principale/Consolante)
    KNOCKOUT_ROUNDS = [
        ("v-tabs-8-finale", "huitiem_final_accordion", "1/8"),
        ("v-tabs-4-finale", "quart_final_accordion", "1/4"),
        ("v-tabs-2-finale", "demi_final_accordion", "1/2"),
    ]

    for pane_id, accordion_id, round_prefix in KNOCKOUT_ROUNDS:
        pane_html = find_tab_pane(html, pane_id)
        if not pane_html:
            continue

        for suffix, poule_name in [("_collapse_1", "Principale"), ("_collapse_2", "Consolante")]:
            section = find_section(pane_html, accordion_id + suffix)
            if section:
                matches = parse_matches_from_section(section)
                if matches:
                    rounds[f"{round_prefix} {poule_name}"] = matches

    # Finale
    finale_html = find_tab_pane(html, "v-tabs-finale")
    if finale_html:
        matches = parse_matches_from_section(finale_html)
        if matches:
            rounds["Finale"] = matches

    return rounds


# ── Affichage ────────────────────────────────────────────────────────────────

def is_forfeit(home_scores, away_scores):
    """Détecte un forfait (25-0 ou 0-25)."""
    for h, a in zip(home_scores, away_scores):
        if (h == 25 and a == 0) or (h == 0 and a == 25):
            return True
    return False


def print_results(rounds):
    """Affiche les résultats scrappés."""
    total = 0
    for round_name in ["Tour 1", "Tour 2", "1/8 Principale", "1/8 Consolante",
                         "1/4 Principale", "1/4 Consolante",
                         "1/2 Principale", "1/2 Consolante",
                         "Finale Principale", "Finale Consolante"]:
        if round_name not in rounds:
            continue
        matches = rounds[round_name]
        total += len(matches)
        print(f"\n{'=' * 60}")
        print(f"  {round_name} ({len(matches)} matchs)")
        print(f"{'=' * 60}")
        for m in matches:
            forfeit = is_forfeit(m["home_scores"], m["away_scores"])
            f_tag = " [FORFAIT]" if forfeit else ""
            scores_str = ""
            if m["home_scores"]:
                scores_str = "  [" + " | ".join(
                    f"{h}-{a}" for h, a in zip(m["home_scores"], m["away_scores"])
                ) + "]"
            print(f"  {m['home']:30s} {m['home_sets']}-{m['away_sets']} {m['away']}{scores_str}{f_tag}")

    print(f"\n{'=' * 60}")
    print(f"  TOTAL: {total} matchs joués")
    print(f"{'=' * 60}")
    return total


# ── Mise à jour de ginette_elo.py ────────────────────────────────────────────

def format_match_tuple(m):
    """Formate un match en tuple Python pour ginette_elo.py."""
    home = m["home"]
    away = m["away"]
    hs = m["home_sets"]
    as_ = m["away_sets"]
    h_scores = m["home_scores"]
    a_scores = m["away_scores"]

    forfeit = is_forfeit(h_scores, a_scores)
    comment = "  # forfait" if forfeit else ""

    return f'    ("{home}", "{away}", {hs}, {as_}, {h_scores}, {a_scores}),{comment}'


def generate_round_block(var_name, comment, matches):
    """Génère un bloc Python pour un round."""
    lines = [f"# {comment}"]
    lines.append(f"{var_name} = [")
    for m in matches:
        lines.append(format_match_tuple(m))
    lines.append("]")
    return "\n".join(lines)


def update_ginette_elo(rounds):
    """Met à jour ginette_elo.py avec les résultats scrappés, puis régénère ginette.json."""

    with open(GINETTE_ELO_PY, "r", encoding="utf-8") as f:
        content = f.read()

    # Mapping round_name → (variable_name, comment)
    ROUND_VARS = {
        "Tour 1": ("TOUR1_MATCHES", "Tour 1 - Novembre 2025"),
        "Tour 2": ("TOUR2_MATCHES", "Tour 2 - Décembre 2025 / Janvier 2026"),
        "1/8 Principale": ("HUITIEME_PRINCIPALE", "1/8e de finale - Poule principale - Février 2026"),
        "1/8 Consolante": ("HUITIEME_CONSOLANTE", "1/8e de finale - Poule consolante - Février 2026"),
        "1/4 Principale": ("QUART_PRINCIPALE", "1/4 de finale - Poule principale - Mars 2026"),
        "1/4 Consolante": ("QUART_CONSOLANTE", "1/4 de finale - Poule consolante - Mars 2026"),
        "1/2 Principale": ("DEMI_PRINCIPALE", "1/2 finale - Poule principale"),
        "1/2 Consolante": ("DEMI_CONSOLANTE", "1/2 finale - Poule consolante"),
    }

    # ── Stratégie : réécrire toute la section matchs entre les deux marqueurs ──
    START_MARKER = "# ── Matchs Ginette (chronologiques) ────────────────────────────────────────\n"
    END_MARKER = "\ndef load_division_elos():"

    start_idx = content.find(START_MARKER)
    end_idx = content.find(END_MARKER)
    if start_idx < 0 or end_idx < 0:
        print("  ⚠ Marqueurs non trouvés dans ginette_elo.py")
        return

    # Construire la nouvelle section matchs
    section_lines = [START_MARKER]

    for round_name, (var_name, comment) in ROUND_VARS.items():
        if round_name not in rounds or not rounds[round_name]:
            continue
        section_lines.append("")
        section_lines.append(generate_round_block(var_name, comment, rounds[round_name]))

    section_lines.append("")
    new_section = "\n".join(section_lines)

    content = content[:start_idx] + new_section + content[end_idx:]

    # ── Mettre à jour all_matches dans run_ginette_elo() ──
    active_rounds = []
    for rn, (vn, _) in ROUND_VARS.items():
        if rn in rounds and rounds[rn]:
            active_rounds.append((rn, vn))

    all_matches_lines = "    all_matches = (\n"
    for i, (rn, vn) in enumerate(active_rounds):
        sep = " +" if i < len(active_rounds) - 1 else ""
        all_matches_lines += f'        [("{rn}", m) for m in {vn}]{sep}\n'
    all_matches_lines += "    )"

    # Remplacer all_matches entre "all_matches = (" et la ligne "    )" qui suit
    am_pattern = r"(    all_matches = \()\n(?:        \[.*\n)*    \)"
    content = re.sub(am_pattern, all_matches_lines, content, count=1)

    # Mettre à jour la liste des rounds dans meta
    rounds_str = ", ".join(f'"{rn}"' for rn, _ in active_rounds)
    content = re.sub(
        r'"rounds":\s*\[[^\]]*\]',
        f'"rounds": [{rounds_str}]',
        content
    )

    with open(GINETTE_ELO_PY, "w", encoding="utf-8") as f:
        f.write(content)

    active_names = [rn for rn, _ in active_rounds]
    print(f"\n✅ ginette_elo.py mis à jour ({', '.join(active_names)})")

    # Régénérer ginette.json
    print("Régénération de ginette.json...")
    import importlib.util
    spec = importlib.util.spec_from_file_location("ginette_elo", GINETTE_ELO_PY)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    teams, match_results, division_elos = mod.run_ginette_elo(verbose=True)
    data = mod.build_json(teams, match_results, division_elos)
    mod.export_json(data)


# ── Main ─────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    local_file = None
    do_update = "--update" in sys.argv

    for arg in sys.argv[1:]:
        if arg.startswith("--file="):
            local_file = arg.split("=", 1)[1]

    html = fetch_html(local_file)
    rounds = parse_ginette_page(html)
    total = print_results(rounds)

    if do_update:
        update_ginette_elo(rounds)
    else:
        print("\n💡 Utilise --update pour mettre à jour ginette_elo.py et ginette.json")
