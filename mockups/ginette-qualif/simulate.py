#!/usr/bin/env python3
"""Simulation Monte Carlo des Tours 1 et 2 de la Coupe Ginette.

Lit Standing/data/ginette.json (ELO Power Ranking + matchs), joue 10 000 fois
les matchs pas encore joués (les matchs joués gardent leur vrai score) et réécrit
les données intégrées dans mockups/ginette-qualif/index.html.

Modèle (calé sur 2025-2026) :
- probabilité de victoire = formule ELO avec écart doublé et +20 pour l'équipe qui reçoit ;
- converti en probabilité de gagner un échange, puis aléa de forme du jour
  (écart-type 0,05 sur cette probabilité, par match) ;
- sets à 25 (5e set à 15), 2 points d'écart, 3 sets gagnants ;
- classement 3/2/1/0 (défaite serrée = 1 set d'écart), puis set average,
  points average, ordre du tirage (comme la page Classement).

Pur Python (pas de numpy). Usage : python3 mockups/ginette-qualif/simulate.py [--n 10000]
"""

import argparse
import json
import math
import os
import random
import re
import statistics
from bisect import bisect_left
from datetime import datetime

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
GINETTE_JSON = os.path.join(ROOT, "Standing", "data", "ginette.json")
INDEX_HTML = os.path.join(HERE, "index.html")

HOME_ADV = 20
ELO_SCALE = 2.0      # écarts d'ELO doublés
FORM_SIGMA = 0.05    # aléa de forme du jour sur la proba d'échange
REF_ELO = 1700       # équipe de référence pour la note « Tirage »
JEN = "Jen et ses Saints"
N_PRINC, N_CONSO = 16, 32


def elo_win_prob(elo_home, elo_away, home=True):
    d = (elo_home - elo_away + (HOME_ADV if home else -HOME_ADV)) * ELO_SCALE
    return 1.0 / (1.0 + 10 ** (-d / 400.0))


# ── Distribution exacte des scores d'un set pour une proba d'échange r ──
def set_distribution(r, target):
    """Liste de (A gagne ?, points A, points B, proba)."""
    q = 1 - r
    out = []
    for k in range(target - 1):  # target-k, k < target-1
        p = math.comb(target - 1 + k, k)
        out.append((True, target, k, p * r ** target * q ** k))
        out.append((False, k, target, p * q ** target * r ** k))
    deuce = math.comb(2 * target - 2, target - 1) * (r * q) ** (target - 1)
    cont = 2 * r * q
    for j in range(20):
        w = deuce * cont ** j
        out.append((True, target + 1 + j, target - 1 + j, w * r * r))
        out.append((False, target - 1 + j, target + 1 + j, w * q * q))
    tot = sum(x[3] for x in out)
    return [(a, b, c, p / tot) for a, b, c, p in out]


def p_set(r, target):
    return sum(p for a, _, _, p in set_distribution(r, target) if a)


def p_match_from_rally(r):
    s, s5 = p_set(r, 25), p_set(r, 15)
    # 3-0, 3-1, 3-2
    return s ** 3 + 3 * s ** 3 * (1 - s) + 6 * s ** 2 * (1 - s) ** 2 * s5


def rally_from_match(p):
    lo, hi = 0.0, 1.0
    for _ in range(50):
        mid = (lo + hi) / 2
        if p_match_from_rally(mid) < p:
            lo = mid
        else:
            hi = mid
    return (lo + hi) / 2


_SAMPLERS = {}


def sampler(r, target):
    key = (round(min(max(r, 0.02), 0.98), 3), target)
    s = _SAMPLERS.get(key)
    if s is None:
        dist = set_distribution(key[0], target)
        cum, acc = [], 0.0
        for d in dist:
            acc += d[3]
            cum.append(acc)
        s = (dist, cum)
        _SAMPLERS[key] = s
    return s


def play_match(r_base, rng):
    r = r_base + rng.gauss(0, FORM_SIGMA)
    sa = sb = pa = pb = 0
    n = 0
    while sa < 3 and sb < 3:
        n += 1
        dist, cum = sampler(r, 15 if n == 5 else 25)
        i = bisect_left(cum, rng.random() * cum[-1])
        a, x, y, _ = dist[min(i, len(dist) - 1)]
        pa += x
        pb += y
        if a:
            sa += 1
        else:
            sb += 1
    return sa, sb, pa, pb


def match_points(sa, sb, forfeit=False):
    if forfeit:
        return (3, 0) if sa > sb else (0, 3)
    if sa > sb:
        return 3, (2 if sa - sb == 1 else 1)
    return (2 if sb - sa == 1 else 1), 3


def real_result(m):
    """(setsHome, setsAway, ptsHome, ptsAway, forfeit) ou None si pas joué."""
    if m.get("homeSets") is None or m.get("awaySets") is None:
        return None
    hs, as_ = int(m["homeSets"]), int(m["awaySets"])
    if m.get("forfeit"):
        return (hs, as_, 75 if hs > as_ else 0, 75 if as_ > hs else 0, True)
    ph = sum(int(x) for x in (m.get("homeScores") or []))
    pa = sum(int(x) for x in (m.get("awayScores") or []))
    return (hs, as_, ph, pa, False)


def ratio(a, b):
    return a / b if b else (math.inf if a else 0.0)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--n", type=int, default=10000)
    ap.add_argument("--seed", type=int, default=2026)
    ap.add_argument("--ginette", default=GINETTE_JSON)
    ap.add_argument("--html", default=INDEX_HTML)
    ap.add_argument("--dry-run", action="store_true", help="n'écrit pas index.html")
    args = ap.parse_args()
    rng = random.Random(args.seed)

    g = json.load(open(args.ginette, encoding="utf-8"))
    elo = {r["name"]: r["elo"] for r in g["ranking"]}
    div = {r["name"]: r["divSlug"] for r in g["ranking"]}
    matches = [m for m in g["matches"] if m["round"] in ("Tour 1", "Tour 2")]
    teams = []
    for m in matches:  # ordre du tirage
        for t in (m["home"], m["away"]):
            if t not in teams:
                teams.append(t)
    idx = {t: i for i, t in enumerate(teams)}
    T = len(teams)
    penalties = g.get("penalties") or {}

    minfo = []
    for m in matches:
        res = real_result(m)
        ph = elo_win_prob(elo[m["home"]], elo[m["away"]])
        minfo.append({"m": m, "res": res, "r": rally_from_match(ph),
                      "h": idx[m["home"]], "a": idx[m["away"]],
                      "rnd": 1 if m["round"] == "Tour 1" else 2})
    played = sum(1 for x in minfo if x["res"])

    # Accumulateurs
    cnt_p = [0] * T
    cnt_c = [0] * T
    sum_pts = [0] * T
    ranks = [[] for _ in range(T)]
    pts_hist = {}  # pts -> [total, princ]
    div_princ = {}
    M = len(minfo)
    hw = [0] * M
    s30 = [0] * M
    s03 = [0] * M
    princ_hw = [[0, 0] for _ in range(M)]  # home en principale | home gagne / perd
    princ_aw = [[0, 0] for _ in range(M)]  # away en principale | home gagne / perd
    jen_i = idx.get(JEN)
    jen_ms = [k for k, x in enumerate(minfo) if jen_i in (x["h"], x["a"])]
    jen_sc = {}
    jen_30 = [0, 0]
    two_wins = [0] * T
    two_wins_1set = [0] * T

    for _ in range(args.n):
        P = [0] * T
        SP = [0] * T
        SM = [0] * T
        PP = [0] * T
        PM = [0] * T
        W = [0] * T
        L = [0] * T
        outcome = []
        for k, x in enumerate(minfo):
            if x["res"]:
                sa, sb, pa, pb, ff = x["res"]
            else:
                sa, sb, pa, pb = play_match(x["r"], rng)
                ff = False
            h, a = x["h"], x["a"]
            mh, ma = match_points(sa, sb, ff)
            P[h] += mh; P[a] += ma
            SP[h] += sa; SM[h] += sb; SP[a] += sb; SM[a] += sa
            PP[h] += pa; PM[h] += pb; PP[a] += pb; PM[a] += pa
            if sa > sb:
                W[h] += 1
            else:
                W[a] += 1
            outcome.append((sa, sb))
        for t, pen in penalties.items():
            if t in idx:
                P[idx[t]] -= pen
        order = sorted(range(T), key=lambda i: (-P[i], -ratio(SP[i], SM[i]), -ratio(PP[i], PM[i]), i))
        rank = [0] * T
        for r_, i in enumerate(order):
            rank[i] = r_ + 1
        dp = {}
        for i in range(T):
            rk = rank[i]
            ranks[i].append(rk)
            sum_pts[i] += P[i]
            h = pts_hist.setdefault(P[i], [0, 0])
            h[0] += 1
            if rk <= N_PRINC:
                cnt_p[i] += 1
                h[1] += 1
                dp[div[teams[i]]] = dp.get(div[teams[i]], 0) + 1
            elif rk <= N_CONSO:
                cnt_c[i] += 1
            if W[i] == 2:
                two_wins[i] += 1
                if SM[i] <= 1:
                    two_wins_1set[i] += 1
        for d_, c_ in dp.items():
            div_princ[d_] = div_princ.get(d_, 0) + c_
        for k, x in enumerate(minfo):
            sa, sb = outcome[k]
            homewin = sa > sb
            if homewin:
                hw[k] += 1
            if sa == 3 and sb == 0:
                s30[k] += 1
            if sb == 3 and sa == 0:
                s03[k] += 1
            col = 0 if homewin else 1
            if rank[x["h"]] <= N_PRINC:
                princ_hw[k][col] += 1
            if rank[x["a"]] <= N_PRINC:
                princ_aw[k][col] += 1
        if jen_i is not None and len(jen_ms) == 2:
            res = []
            for k in sorted(jen_ms, key=lambda k: minfo[k]["rnd"]):
                sa, sb = outcome[k]
                res.append((sa > sb) if minfo[k]["h"] == jen_i else (sb > sa))
            key = (res[0], res[1])
            e = jen_sc.setdefault(key, [0, 0, 0])
            e[0] += 1
            if rank[jen_i] <= N_PRINC:
                e[1] += 1
            elif rank[jen_i] <= N_CONSO:
                e[2] += 1
            if all(outcome[k] in ((3, 0), (0, 3)) and ((outcome[k][0] == 3) == (minfo[k]["h"] == jen_i)) for k in jen_ms):
                jen_30[0] += 1
                if rank[jen_i] <= N_PRINC:
                    jen_30[1] += 1

    N = args.n
    pc = lambda v: round(100.0 * v / N, 1)
    team_out = []
    for i, t in enumerate(teams):
        p, c = pc(cnt_p[i]), pc(cnt_c[i])
        team_out.append({"team": t, "div": div[t], "elo": round(elo[t]), "p": p, "c": c,
                         "e": round(100 - p - c, 1), "pts": round(sum_pts[i] / N, 2),
                         "rankMed": int(statistics.median(ranks[i]))})
    match_out = []
    for k, x in enumerate(minfo):
        m = x["m"]
        nh = hw[k]
        nl = N - nh
        ph_w = 100.0 * princ_hw[k][0] / nh if nh else 0.0
        ph_l = 100.0 * princ_hw[k][1] / nl if nl else 0.0
        pa_w = 100.0 * princ_aw[k][1] / nl if nl else 0.0   # away gagne = home perd
        pa_l = 100.0 * princ_aw[k][0] / nh if nh else 0.0
        swH = (ph_w - ph_l) if nh and nl else 0.0
        swA = (pa_w - pa_l) if nh and nl else 0.0
        o = {"round": x["rnd"], "home": m["home"], "away": m["away"],
             "hdiv": div[m["home"]], "adiv": div[m["away"]],
             "helo": round(elo[m["home"]]), "aelo": round(elo[m["away"]]),
             "ph": pc(nh), "swingH": round(swH, 1), "swingA": round(swA, 1),
             "stake": round(swH + swA, 1), "s30": pc(s30[k]), "s03": pc(s03[k]),
             "date": m.get("date"), "venue": m.get("venue")}
        if x["res"]:
            o["played"] = True
            o["score"] = "%d-%d" % (x["res"][0], x["res"][1])
        match_out.append(o)
    jen_out = []
    for key in [(True, True), (True, False), (False, True), (False, False)]:
        e = jen_sc.get(key, [0, 0, 0])
        jen_out.append({"t1": key[0], "t2": key[1], "prob": pc(e[0]),
                        "p": round(100.0 * e[1] / e[0], 1) if e[0] else 0.0,
                        "c": round(100.0 * e[2] / e[0], 1) if e[0] else 0.0})
    jen_out.append({"label": "2 victoires 3-0", "prob": pc(jen_30[0]),
                    "p": round(100.0 * jen_30[1] / jen_30[0], 1) if jen_30[0] else 0.0})
    pts_out = {str(k): round(100.0 * v[1] / v[0], 1) for k, v in sorted(pts_hist.items(), reverse=True) if k in (6, 5, 4)}
    n_div = {}
    for t in teams:
        n_div[div[t]] = n_div.get(div[t], 0) + 1
    div_out = {d_: [round(div_princ.get(d_, 0) / N, 1), n_] for d_, n_ in n_div.items()}

    # Difficulté du parcours
    diff_out = []
    for i, t in enumerate(teams):
        ms = sorted([x for x in minfo if i in (x["h"], x["a"])], key=lambda x: x["rnd"])
        opp, pref = [], 1.0
        for x in ms:
            home = x["h"] == i
            o = teams[x["a"] if home else x["h"]]
            opp.append([o, div[o], elo[o], "dom" if home else "ext"])
            pref *= elo_win_prob(REF_ELO, elo[o], home)
        diff_out.append({"team": t, "div": div[t], "elo": elo[t], "diff": round(100 * (1 - pref)),
                         "opp": opp, "p": team_out[i]["p"],
                         "own2v": round(100.0 * two_wins[i] / N),
                         "own": round(100 - 100.0 * two_wins_1set[i] / N)})

    data = {"meta": {"updated": g["meta"].get("lastUpdated") or datetime.now().isoformat(timespec="seconds"),
                     "simulated": datetime.now().isoformat(timespec="seconds"),
                     "n": N, "played": played, "total": M},
            "base": {"teams": team_out, "matches": match_out, "jen": jen_out,
                     "ptsToPrincipale": pts_out, "divExpected": div_out}}

    jt = next((t for t in team_out if t["team"] == JEN), None)
    print("%d simulations, %d/%d matchs déjà joués. Jen : principale %s %%, consolante %s %%" % (
        N, played, M, jt and jt["p"], jt and jt["c"]))
    if args.dry_run:
        json.dump(data, open("/tmp/ginette_sim_test.json", "w"), ensure_ascii=False)
        return
    html = open(args.html, encoding="utf-8").read()
    dump = lambda o: json.dumps(o, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/")
    html, n1 = re.subn(r'(<script id="data" type="application/json">).*?(</script>)',
                       lambda mm: mm.group(1) + dump(data) + mm.group(2), html, count=1, flags=re.S)
    html, n2 = re.subn(r'(<script id="diffdata" type="application/json">).*?(</script>)',
                       lambda mm: mm.group(1) + dump(diff_out) + mm.group(2), html, count=1, flags=re.S)
    if n1 != 1 or n2 != 1:
        raise SystemExit("blocs de données introuvables dans index.html")
    open(args.html, "w", encoding="utf-8").write(html)
    print("index.html mis à jour")


if __name__ == "__main__":
    main()
