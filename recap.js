/* ============================================================
   recap.js — Résumé de l'année (« Wrapped » / Twitch Recap)
   ------------------------------------------------------------
   Surcouche immersive plein écran ouverte par-dessus historique
   quand l'URL contient ?recap=1 (carte admin de l'accueil).

   RÉUTILISE le moteur de stats déjà chargé par historique.js
   (objets top-level const partagés dans le scope global du même
   document) : SeasonSelector, StatsAggregator, BilanView,
   ProgressionView, Storage. AUCUNE logique de stats n'est
   redupliquée — les chiffres sont donc identiques à l'onglet « Année ».

   Chargé APRÈS historique.js dans historique.html.
   ============================================================ */
(function () {
    'use strict';

    var STORY_DURATION = 5200; // ms par diapositive avant avance auto

    // Palette de dégradés tournants pour les diapositives
    var PALETTE = [
        'linear-gradient(160deg,#7c3aed 0%,#4f46e5 100%)',
        'linear-gradient(160deg,#0ea5e9 0%,#2563eb 100%)',
        'linear-gradient(160deg,#f59e0b 0%,#ef4444 100%)',
        'linear-gradient(160deg,#10b981 0%,#0f766e 100%)',
        'linear-gradient(160deg,#ec4899 0%,#8b5cf6 100%)',
        'linear-gradient(160deg,#06b6d4 0%,#3b82f6 100%)',
        'linear-gradient(160deg,#ef4444 0%,#9333ea 100%)'
    ];
    var ROLE_GRAD = {
        'Passeur': 'linear-gradient(160deg,#8b5cf6 0%,#5b21b6 100%)',
        'R4':      'linear-gradient(160deg,#3b82f6 0%,#1e40af 100%)',
        'Centre':  'linear-gradient(160deg,#ef4444 0%,#991b1b 100%)',
        'Pointu':  'linear-gradient(160deg,#22c55e 0%,#15803d 100%)'
    };
    var ROLE_EMOJI = { 'Passeur': '🤲', 'R4': '🏐', 'Centre': '🧱', 'Pointu': '💥' };

    function esc(s) {
        if (s === null || s === undefined) return '';
        var d = document.createElement('div');
        d.textContent = String(s);
        return d.innerHTML;
    }

    function fmtDate(match) {
        var raw = match && (match.date || match.completedAt);
        if (!raw) return '';
        var d = (typeof raw === 'number') ? new Date(raw)
            : /^\d{4}-\d{2}-\d{2}/.test(raw) ? new Date(raw + 'T12:00:00') : new Date(raw);
        if (isNaN(d.getTime())) return '';
        try { return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }); }
        catch (e) { return ''; }
    }

    var RecapView = {
        _overlay: null,
        _season: null,    // cache des calculs saison
        _story: null,     // état de la story en cours

        // ---------- Détection / cycle de vie ----------
        isRequested: function () {
            try {
                var p = new URLSearchParams(window.location.search);
                return p.has('recap') || window.location.hash === '#recap';
            } catch (e) { return false; }
        },

        open: function () {
            this._ensureOverlay();
            this._overlay.style.display = 'block';
            document.body.style.overflow = 'hidden';
            try { this._season = this._computeSeason(); }
            catch (e) { console.error('[Recap] calcul saison échoué', e); this._season = null; }
            this._showLanding();
        },

        close: function () {
            this._stopStory();
            document.body.style.overflow = '';
            // Retour au menu (point d'entrée = carte de l'accueil)
            window.location.href = 'index.html';
        },

        _ensureOverlay: function () {
            if (this._overlay) return;
            var o = document.createElement('div');
            o.className = 'recap-overlay';
            o.id = 'recapOverlay';
            document.body.appendChild(o);
            this._overlay = o;
        },

        // ================= CALCULS SAISON =================
        _completedSets: function (m) {
            return (m.sets || []).filter(function (s) { return s.completed; });
        },

        _computeSeason: function () {
            var matches = (typeof SeasonSelector !== 'undefined' ? SeasonSelector.getFilteredMatches() : [])
                || [];
            matches = matches.filter(function (m) {
                return m && (m.sets || []).some(function (s) { return s.completed; });
            });

            var seasonLabel = (typeof SeasonSelector !== 'undefined' && SeasonSelector.current) || '';

            var statsMap = {};        // name -> stats agrégées saison
            var presence = {};        // name -> { matches, sets, wins, losses }
            var teamRecord = { wins: 0, losses: 0, draws: 0, matches: matches.length };
            var setsWon = 0, setsPlayed = 0;
            var pointsFor = 0, pointsAgainst = 0;
            var biggestWin = null;

            var self = this;
            matches.forEach(function (m) {
                var sets = self._completedSets(m);
                if (!sets.length) return;

                // Stats joueurs (réutilise le moteur)
                var totals = {};
                try { totals = StatsAggregator.aggregateStats(sets, 'home') || {}; }
                catch (e) { totals = {}; }

                Object.keys(totals).forEach(function (name) {
                    var st = totals[name];
                    var played = ['service', 'reception', 'pass', 'attack', 'relance', 'defense', 'block']
                        .some(function (c) { return st[c] && st[c].tot > 0; });
                    if (!played) return;
                    if (!statsMap[name]) statsMap[name] = StatsAggregator.initPlayerStats();
                    BilanView._mergePlayerStats(statsMap[name], st);
                    if (!presence[name]) presence[name] = { matches: 0, sets: 0, wins: 0, losses: 0 };
                    presence[name].matches++;
                    if (m.result === 'win') presence[name].wins++;
                    else if (m.result === 'loss') presence[name].losses++;
                });

                // Sets joués par joueur (depuis les lineups)
                sets.forEach(function (s) {
                    var seen = {};
                    [s.initialHomeLineup, s.homeLineup].forEach(function (L) {
                        if (!L) return;
                        Object.keys(L).forEach(function (pos) { if (L[pos]) seen[L[pos]] = true; });
                    });
                    Object.keys(seen).forEach(function (name) {
                        if (presence[name]) presence[name].sets++;
                    });
                });

                // Bilan équipe
                if (m.result === 'win') teamRecord.wins++;
                else if (m.result === 'loss') teamRecord.losses++;
                else teamRecord.draws++;

                var score = (typeof Storage !== 'undefined') ? Storage.getSetScore(m) : null;
                var hw = score ? score.homeWins : 0;
                var aw = score ? score.awayWins : 0;
                setsWon += hw;
                setsPlayed += sets.length;

                var mFor = 0, mAgainst = 0;
                sets.forEach(function (s) {
                    mFor += (s.finalHomeScore != null ? s.finalHomeScore : (s.homeScore || 0));
                    mAgainst += (s.finalAwayScore != null ? s.finalAwayScore : (s.awayScore || 0));
                });
                pointsFor += mFor;
                pointsAgainst += mAgainst;

                if (m.result === 'win') {
                    var diff = (hw - aw) * 1000 + (mFor - mAgainst);
                    if (!biggestWin || diff > biggestWin._diff) {
                        biggestWin = {
                            opponent: m.opponent || 'Adversaire',
                            score: hw + '–' + aw,
                            date: fmtDate(m),
                            _diff: diff
                        };
                    }
                }
            });

            // Rôles saison + IP par joueur (moteur historique)
            var roles = {};
            try { roles = (typeof BilanView !== 'undefined') ? BilanView.getPlayerRolesYear(matches, 'home') : {}; }
            catch (e) { roles = {}; }

            var players = Object.keys(statsMap);
            var ip = {};
            players.forEach(function (name) {
                var role = (roles[name] && roles[name].primaryRole) || 'R4';
                try { ip[name] = BilanView.computeIPForPlayer(matches, name, 'home', role) || 0; }
                catch (e) { ip[name] = 0; }
            });

            // Temps de jeu (réutilise le calcul de l'onglet T.Jeu : sets joués prorata + titularisations)
            var playingTime = {};
            var playingTimeList = [];
            try {
                playingTimeList = (typeof SetsPlayedView !== 'undefined')
                    ? (SetsPlayedView.computePlayingTime(matches, roles) || []) : [];
                playingTimeList.forEach(function (p) { playingTime[p.name] = p; });
            } catch (e) { playingTimeList = []; }

            // Total équipe (somme des joueurs)
            var teamStats = StatsAggregator.initPlayerStats();
            players.forEach(function (name) { BilanView._mergePlayerStats(teamStats, statsMap[name]); });

            // Distinctions officielles de l'année (moteur historique, MVP retiré).
            // On garde des chiffres identiques à la modale « Distinctions ».
            var distinctions = [];
            try {
                distinctions = (BilanView.computeYearDistinctions(matches) || [])
                    .filter(function (d) { return d && d.label !== 'MVP' && d.name; });
            } catch (e) { distinctions = []; }

            // Palmarès par joueur : quelles distinctions chaque joueur détient
            var honorsByPlayer = {};
            distinctions.forEach(function (d) {
                if (!honorsByPlayer[d.name]) honorsByPlayer[d.name] = [];
                honorsByPlayer[d.name].push(d);
            });

            return {
                label: seasonLabel,
                matches: matches,
                statsMap: statsMap,
                presence: presence,
                roles: roles,
                ip: ip,
                players: players,
                playingTime: playingTime,
                playingTimeList: playingTimeList,
                teamStats: teamStats,
                teamRecord: teamRecord,
                setsWon: setsWon,
                setsPlayed: setsPlayed,
                pointsFor: pointsFor,
                pointsAgainst: pointsAgainst,
                biggestWin: biggestWin,
                distinctions: distinctions,
                honorsByPlayer: honorsByPlayer
            };
        },

        // Libellé court d'une distinction pour les listes (retire "Meilleur·e"/"Joueur")
        _shortDistLabel: function (label) {
            return String(label || '')
                .replace(/^Meilleure?\s+/i, '')
                .replace(/^Joueur\s+/i, '')
                .replace(/^Plus\s+/i, '');
        },

        _playerColor: function (name, role) {
            var c = (typeof ProgressionView !== 'undefined' && ProgressionView.PLAYER_COLORS
                && ProgressionView.PLAYER_COLORS[name]);
            if (c) return c;
            return (typeof BilanView !== 'undefined' && BilanView.ROLE_COLORS
                && BilanView.ROLE_COLORS[role]) || '#8b5cf6';
        },

        _ipBand: function (ip) {
            if (ip >= 72) return { label: 'Niveau Élite', emoji: '🌟' };
            if (ip >= 58) return { label: 'Très solide', emoji: '🔥' };
            if (ip >= 44) return { label: 'Une vraie valeur sûre', emoji: '💪' };
            if (ip >= 30) return { label: 'En pleine progression', emoji: '📈' };
            return { label: 'La saison des débuts', emoji: '🌱' };
        },

        // ================= HEATMAPS (zones, façon onglet Data) =================
        _HEAT_PALETTE: [[0, 0, 200], [0, 160, 255], [0, 220, 80], [255, 240, 0], [255, 120, 0], [255, 0, 0]],

        // Récolte les positions normalisées (caméra) d'un joueur sur la saison.
        // Réutilise StatsVisuellesView._normalizePos + PassAttackAnalyzer._effectiveCameraSide
        // (purs, sans dépendance au DOM). Points {fx,fy} ∈ [0,1], filet en haut.
        _collectZones: function (name) {
            var rec = { start: [], end: [] }, def = { start: [], end: [] }, att = { end: [] };
            var SV = (typeof StatsVisuellesView !== 'undefined') ? StatsVisuellesView : null;
            var PA = (typeof PassAttackAnalyzer !== 'undefined') ? PassAttackAnalyzer : null;
            if (!SV || !PA || !this._season) return { rec: rec, def: def, att: att };
            function c01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
            function mapHome(pos) {
                if (!pos) return null;
                if (pos.courtSide !== 'bottom' && pos.courtSide !== 'service_bottom') return null;
                return { fx: c01(pos.x / 100), fy: c01(pos.y / 100) };
            }
            // Attaque : terrain adverse vu par l'attaquant → filet EN BAS (fy=1),
            // ligne de fond adverse en haut (fy=0). pos.y=100 = filet, pos.y=0 = fond.
            function mapAway(pos) {
                if (!pos) return null;
                if (pos.courtSide !== 'top' && pos.courtSide !== 'service_top') return null;
                return { fx: c01(pos.x / 100), fy: c01(pos.y / 100) };
            }
            this._season.matches.forEach(function (m) {
                (m.sets || []).forEach(function (set) {
                    if (!set.completed || !set.points) return;
                    set.points.forEach(function (point, pIdx) {
                        if (!point.rally) return;
                        var cam = PA._effectiveCameraSide(set, pIdx);
                        point.rally.forEach(function (a) {
                            if (a.team !== 'home' || a.player !== name) return;
                            if (a.type === 'reception') {
                                if (a.startPos) { var s1 = mapHome(SV._normalizePos(a.startPos, cam)); if (s1) rec.start.push(s1); }
                                if (a.endPos) { var e1 = mapHome(SV._normalizePos(a.endPos, cam)); if (e1) rec.end.push(e1); }
                            } else if (a.type === 'defense') {
                                if (a.startPos) { var s2 = mapHome(SV._normalizePos(a.startPos, cam)); if (s2) def.start.push(s2); }
                                if (a.endPos) { var e2 = mapHome(SV._normalizePos(a.endPos, cam)); if (e2) def.end.push(e2); }
                            } else if (a.type === 'attack' && a.attackType !== 'relance') {
                                if (a.endPos) { var e3 = mapAway(SV._normalizePos(a.endPos, cam)); if (e3) att.end.push(e3); }
                            }
                        });
                    });
                });
            });
            return { rec: rec, def: def, att: att };
        },

        // Dessine un demi-terrain + heatmap de densité (même technique que l'onglet Data)
        // opts.netBottom : place le filet en bas (vue attaquant) au lieu d'en haut
        _drawCourtHeat: function (canvas, points, opts) {
            if (!canvas) return;
            var netBottom = !!(opts && opts.netBottom);
            var cssW = canvas.clientWidth || 140;
            var cssH = canvas.clientHeight || 184;
            var dpr = window.devicePixelRatio || 1;
            var w = Math.round(cssW * dpr), h = Math.round(cssH * dpr);
            canvas.width = w; canvas.height = h;
            var ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, w, h);
            ctx.fillStyle = 'rgba(255,255,255,0.04)';
            ctx.fillRect(0, 0, w, h);

            if (points && points.length) {
                var radius = Math.round(w * 0.20);
                var density = new Float32Array(w * h);
                var r2 = radius * radius;
                points.forEach(function (p) {
                    var cx = Math.round(p.fx * w), cy = Math.round(p.fy * h);
                    var x0 = Math.max(0, cx - radius), x1 = Math.min(w - 1, cx + radius);
                    var y0 = Math.max(0, cy - radius), y1 = Math.min(h - 1, cy + radius);
                    for (var y = y0; y <= y1; y++) {
                        var dy = y - cy, dy2 = dy * dy;
                        for (var x = x0; x <= x1; x++) {
                            var dx = x - cx, dist2 = dx * dx + dy2;
                            if (dist2 <= r2) { var t = 1 - dist2 / r2; density[y * w + x] += t * t; }
                        }
                    }
                });
                var maxD = 0;
                for (var i = 0; i < density.length; i++) if (density[i] > maxD) maxD = density[i];
                if (maxD > 0) {
                    var img = ctx.getImageData(0, 0, w, h);
                    var data = img.data;
                    var pal = RecapView._HEAT_PALETTE;
                    for (var j = 0; j < density.length; j++) {
                        if (density[j] <= 0) continue;
                        var tt = density[j] / maxD;
                        var scaled = tt * (pal.length - 1);
                        var idx = Math.floor(scaled); if (idx >= pal.length - 1) idx = pal.length - 2;
                        var fr = scaled - idx;
                        var a = pal[idx], b = pal[idx + 1];
                        var pi = j * 4;
                        data[pi] = a[0] + (b[0] - a[0]) * fr;
                        data[pi + 1] = a[1] + (b[1] - a[1]) * fr;
                        data[pi + 2] = a[2] + (b[2] - a[2]) * fr;
                        data[pi + 3] = Math.round(Math.pow(tt, 0.65) * 235);
                    }
                    ctx.putImageData(img, 0, 0);
                }
            }

            // Lignes du terrain : contour, filet (épais), ligne des 3m (pointillés).
            // Filet en haut par défaut ; en bas pour l'attaque (vue attaquant).
            ctx.strokeStyle = 'rgba(255,255,255,0.8)';
            var bw = Math.max(2, Math.round(2 * dpr));
            ctx.lineWidth = bw;
            ctx.strokeRect(bw / 2, bw / 2, w - bw, h - bw);
            var netLw = Math.max(3, Math.round(3.5 * dpr));
            ctx.lineWidth = netLw;
            var netY = netBottom ? (h - netLw / 2) : (netLw / 2);
            ctx.beginPath(); ctx.moveTo(0, netY); ctx.lineTo(w, netY); ctx.stroke();
            ctx.lineWidth = Math.max(1, Math.round(dpr));
            ctx.setLineDash([6 * dpr, 5 * dpr]);
            var lineY = netBottom ? (h * 0.66) : (h * 0.34);
            ctx.beginPath(); ctx.moveTo(0, lineY); ctx.lineTo(w, lineY); ctx.stroke();
            ctx.setLineDash([]);
        },

        // ================= LANDING =================
        _showLanding: function () {
            this._stopStory();
            var s = this._season;
            var o = this._overlay;

            if (!s || s.players.length === 0) {
                o.innerHTML =
                    '<button class="recap-iconbtn recap-close" id="recapCloseBtn" aria-label="Fermer">✕</button>' +
                    '<div class="recap-landing"><div class="recap-landing-inner">' +
                    '<div class="recap-empty"><div class="recap-empty-emoji">📭</div>' +
                    '<div style="font-size:18px;font-weight:600;margin-bottom:6px;">Pas encore de résumé</div>' +
                    '<div>Aucun match terminé pour cette saison.<br>Reviens après quelques matchs !</div></div>' +
                    '</div></div>';
                document.getElementById('recapCloseBtn').onclick = this.close.bind(this);
                return;
            }

            // Trier les joueurs par IP décroissant (les plus impactants d'abord)
            var players = s.players.slice().sort(function (a, b) {
                return (s.ip[b] || 0) - (s.ip[a] || 0) || a.localeCompare(b);
            });

            var winRate = s.teamRecord.matches
                ? Math.round(s.teamRecord.wins / s.teamRecord.matches * 100) : 0;

            var tilesHtml = players.map(function (name) {
                var role = (s.roles[name] && s.roles[name].primaryRole) || '';
                var color = RecapView._playerColor(name, role);
                var ip = s.ip[name] || 0;
                var pres = s.presence[name] || { matches: 0 };
                return '<div class="recap-tile" data-recap-player="' + esc(name) + '" style="--tile-accent:' + color + '">' +
                    '<div class="recap-tile-top">' +
                        '<span class="recap-dot" style="background:' + color + '"></span>' +
                        '<span class="recap-tile-role">' + esc(role || 'Joueur') + '</span>' +
                    '</div>' +
                    '<div class="recap-tile-name">' + esc(name) + '</div>' +
                    '<div class="recap-tile-foot">' +
                        '<span class="recap-tile-meta">' + pres.matches + ' match' + (pres.matches > 1 ? 's' : '') + '</span>' +
                        '<span class="recap-tile-ip">IP ' + ip + '</span>' +
                    '</div>' +
                '</div>';
            }).join('');

            o.innerHTML =
                '<button class="recap-iconbtn recap-close" id="recapCloseBtn" aria-label="Fermer">✕</button>' +
                '<div class="recap-landing"><div class="recap-landing-inner">' +
                    '<div class="recap-landing-kicker">Résumé de l\'année</div>' +
                    '<div class="recap-landing-title">Saison ' + esc(s.label) + '</div>' +
                    '<div class="recap-landing-sub">Tape sur l\'équipe ou sur un joueur pour dérouler son résumé 🎬</div>' +

                    '<div class="recap-hero" data-recap-team="1">' +
                        '<div class="recap-hero-badge">🏐 Toute l\'équipe</div>' +
                        '<div class="recap-hero-title">Jen et ses Saints</div>' +
                        '<div class="recap-hero-sub">Le bilan collectif de la saison</div>' +
                        '<div class="recap-hero-stats">' +
                            '<div><div class="recap-hero-stat-v">' + s.teamRecord.wins + '–' + s.teamRecord.losses + '</div><div class="recap-hero-stat-l">Bilan</div></div>' +
                            '<div><div class="recap-hero-stat-v">' + winRate + '%</div><div class="recap-hero-stat-l">Victoires</div></div>' +
                            '<div><div class="recap-hero-stat-v">' + players.length + '</div><div class="recap-hero-stat-l">Joueurs</div></div>' +
                        '</div>' +
                        '<div class="recap-hero-cta">Voir le résumé ›</div>' +
                    '</div>' +

                    '<div class="recap-section-label">Les joueur·euses</div>' +
                    '<div class="recap-grid">' + tilesHtml + '</div>' +
                '</div></div>';

            document.getElementById('recapCloseBtn').onclick = this.close.bind(this);
            o.querySelector('[data-recap-team]').onclick = function () { RecapView._playStory(RecapView._buildTeamSlides()); };
            o.querySelectorAll('[data-recap-player]').forEach(function (el) {
                el.onclick = function () { RecapView._playStory(RecapView._buildPlayerSlides(el.dataset.recapPlayer)); };
            });
        },

        // ================= CONSTRUCTION DES DIAPOS =================
        _buildPlayerSlides: function (name) {
            var s = this._season;
            var st = s.statsMap[name];
            if (!st) return [];
            var role = (s.roles[name] && s.roles[name].primaryRole) || 'R4';
            var rolesObj = (s.roles[name] && s.roles[name].roles) || {};
            var color = this._playerColor(name, role);
            var pres = s.presence[name] || { matches: 0, sets: 0, wins: 0, losses: 0 };
            var ip = s.ip[name] || 0;
            var zones = this._collectZones(name);
            var slides = [];

            // 1. Cover
            slides.push({
                bg: ROLE_GRAD[role] || PALETTE[0],
                emoji: '👋',
                kicker: 'Ton résumé · Saison ' + s.label,
                headline: name,
                lines: ['<span class="strong">' + esc(role) + '</span> · Jen et ses Saints'],
                hint: 'Tape pour dérouler →'
            });

            // 2. Présence
            slides.push({
                bg: PALETTE[1],
                emoji: '📅',
                kicker: 'Ta présence',
                stat: { value: pres.matches }, statLabel: 'matchs disputés',
                lines: [
                    'Bilan : <span class="strong">' + pres.wins + 'V – ' + pres.losses + 'D</span> avec toi sur le terrain'
                ]
            });

            // 2b. Temps de jeu (réutilise l'onglet T.Jeu)
            var pt = s.playingTime[name];
            if (pt && pt.setsPlayed > 0) {
                var totalSeasonSets = s.setsPlayed || 0;
                var pctSeason = totalSeasonSets > 0 ? Math.round(pt.setsPlayed / totalSeasonSets * 100) : 0;
                var ptSorted = (s.playingTimeList || []).slice().sort(function (a, b) { return b.setsPlayed - a.setsPlayed; });
                var rank = ptSorted.findIndex(function (p) { return p.name === name; }) + 1;
                var ptLines = ['<span class="strong">' + pctSeason + '%</span> du temps de jeu de la saison'];
                if (pt.matchesPresent > 0) {
                    ptLines.push('Titulaire <span class="strong">' + pt.matchesStarting + '/' + pt.matchesPresent + '</span> match' + (pt.matchesPresent > 1 ? 's' : ''));
                }
                if (rank > 0) {
                    ptLines.push('<span class="strong">' + (rank === 1 ? '1er' : rank + 'e') + '</span> temps de jeu de l\'équipe');
                }
                slides.push({
                    bg: 'linear-gradient(160deg,#14b8a6 0%,#0f766e 100%)',
                    emoji: '⏱️',
                    kicker: 'Ton temps de jeu',
                    stat: { value: Math.round(pt.setsPlayed) }, statLabel: 'sets joués',
                    lines: ptLines
                });
            }

            // 3. Poste de prédilection
            var roleKeys = Object.keys(rolesObj).sort(function (a, b) { return rolesObj[b] - rolesObj[a]; });
            var roleLine = roleKeys.length > 1
                ? 'Tu as aussi dépanné en <span class="strong">' + esc(roleKeys.slice(1).join(', ')) + '</span>'
                : 'Fidèle à ton poste toute la saison 💯';
            slides.push({
                bg: ROLE_GRAD[role] || PALETTE[4],
                emoji: ROLE_EMOJI[role] || '🏐',
                kicker: 'Ton poste',
                headline: role,
                lines: [roleLine]
            });

            // 4. Service
            if (st.service.tot >= 3) {
                slides.push({
                    bg: PALETTE[2],
                    emoji: '🎯',
                    kicker: 'Au service',
                    stat: { value: st.service.ace }, statLabel: st.service.ace > 1 ? 'aces' : 'ace',
                    lines: [
                        '<span class="strong">' + st.service.splus + '</span> services qui forcent la faute adverse',
                        'sur <span class="strong">' + st.service.tot + '</span> services tentés'
                    ]
                });
            }

            // 5. Attaque
            if (st.attack.tot >= 3) {
                var attEff = Math.round(st.attack.attplus / st.attack.tot * 100);
                slides.push({
                    bg: PALETTE[6],
                    emoji: '💥',
                    kicker: 'À l\'attaque',
                    stat: { value: st.attack.attplus }, statLabel: 'attaques gagnantes',
                    lines: [
                        '<span class="strong">' + attEff + '%</span> d\'efficacité',
                        'sur <span class="strong">' + st.attack.tot + '</span> attaques'
                    ]
                });
            }

            // 5b. Attaque — heatmap zone d'arrivée (uniquement si la personne attaque)
            if (zones.att.end.length > 0) {
                slides.push({
                    kind: 'courts', bg: PALETTE[6], emoji: '🎯',
                    kicker: 'Attaque · zone d\'arrivée',
                    headline: 'Où atterrissent tes attaques',
                    courts: [{ label: 'Arrivée', points: zones.att.end, netBottom: true }]
                });
            }

            // 6. Réception
            if (st.reception.tot >= 3) {
                var recPos = st.reception.r4 + st.reception.r3;
                var recRate = Math.round(recPos / st.reception.tot * 100);
                slides.push({
                    bg: PALETTE[5],
                    emoji: '🛬',
                    kicker: 'En réception',
                    stat: { value: st.reception.tot }, statLabel: 'réceptions',
                    lines: [
                        '<span class="strong">' + st.reception.r4 + '</span> réceptions parfaites',
                        '<span class="strong">' + recRate + '%</span> de réceptions positives'
                    ]
                });
            }

            // 6b. Réception — heatmaps zone de départ + zone d'arrivée
            if (zones.rec.start.length + zones.rec.end.length > 0) {
                slides.push({
                    kind: 'courts', bg: PALETTE[5], emoji: '🛬',
                    kicker: 'Réception · tes zones',
                    headline: 'Départ et arrivée de tes réceptions',
                    courts: [
                        { label: 'Départ', points: zones.rec.start },
                        { label: 'Arrivée', points: zones.rec.end }
                    ]
                });
            }

            // 7. Défense
            if (st.defense.tot >= 2 && st.defense.defplus > 0) {
                slides.push({
                    bg: PALETTE[3],
                    emoji: '🛡️',
                    kicker: 'En défense',
                    stat: { value: st.defense.defplus }, statLabel: 'défenses décisives',
                    lines: ['<span class="strong">' + st.defense.tot + '</span> ballons défendus au total']
                });
            }

            // 7b. Défense — heatmaps zone de départ + zone d'arrivée
            if (zones.def.start.length + zones.def.end.length > 0) {
                slides.push({
                    kind: 'courts', bg: PALETTE[3], emoji: '🛡️',
                    kicker: 'Défense · tes zones',
                    headline: 'Départ et arrivée de tes défenses',
                    courts: [
                        { label: 'Départ', points: zones.def.start },
                        { label: 'Arrivée', points: zones.def.end }
                    ]
                });
            }

            // 8. Bloc
            if (st.block.tot >= 1 && st.block.blcplus > 0) {
                slides.push({
                    bg: PALETTE[0],
                    emoji: '🧱',
                    kicker: 'Au bloc',
                    stat: { value: st.block.blcplus }, statLabel: st.block.blcplus > 1 ? 'blocs gagnants' : 'bloc gagnant',
                    lines: ['Le mur, c\'est toi 🧱']
                });
            }

            // 9. Match référence
            var ref = this._signatureMatch(name);
            if (ref) {
                slides.push({
                    bg: PALETTE[4],
                    emoji: '⭐',
                    kicker: 'Ton match référence',
                    headline: 'vs ' + ref.opponent,
                    lines: [
                        ref.date ? ('<span class="strong">' + esc(ref.date) + '</span> · ' + esc(ref.score)) : esc(ref.score),
                        ref.detail
                    ]
                });
            }

            // 10. Distinctions de l'année du joueur (toutes les catégories remportées)
            var mine = s.honorsByPlayer[name] || [];
            if (mine.length === 1) {
                var h0 = mine[0];
                slides.push({
                    bg: 'linear-gradient(160deg,#f59e0b 0%,#b45309 100%)',
                    emoji: h0.emoji,
                    kicker: 'Distinction de l\'année',
                    headline: h0.label,
                    lines: [
                        '<span class="strong">' + esc(h0.highlight) + '</span>',
                        h0.detail ? esc(h0.detail) : ''
                    ].filter(Boolean),
                    badge: '🏆 Top de l\'équipe'
                });
            } else if (mine.length > 1) {
                slides.push({
                    bg: 'linear-gradient(160deg,#f59e0b 0%,#b45309 100%)',
                    emoji: '🏆',
                    kicker: 'Tes distinctions de l\'année',
                    headline: mine.length + ' titres cette saison !',
                    list: mine.map(function (d) {
                        return { left: d.emoji, name: RecapView._shortDistLabel(d.label), val: d.highlight };
                    })
                });
            }

            // 11. IP
            var band = this._ipBand(ip);
            slides.push({
                bg: PALETTE[1],
                emoji: band.emoji,
                kicker: 'Impact Performance',
                stat: { value: ip, suffix: '/100' }, statLabel: band.label,
                lines: ['Ton indice global d\'impact sur la saison']
            });

            // 12. Outro
            slides.push({
                bg: ROLE_GRAD[role] || PALETTE[4],
                emoji: '🙌',
                kicker: 'Voilà ta saison',
                headline: 'Quelle saison, ' + name + ' !',
                lines: ['Merci d\'avoir tout donné 💜', 'Saison ' + esc(s.label) + ' · Jen et ses Saints'],
                hint: 'Tape pour revenir à la liste'
            });

            return slides;
        },

        _signatureMatch: function (name) {
            var s = this._season;
            var best = null;
            var self = this;
            s.matches.forEach(function (m) {
                var sets = self._completedSets(m);
                if (!sets.length) return;
                var totals;
                try { totals = StatsAggregator.aggregateStats(sets, 'home') || {}; } catch (e) { return; }
                var st = totals[name];
                if (!st) return;
                var punch = (st.service.ace || 0) + (st.service.splus || 0) * 0.5
                    + (st.attack.attplus || 0) + (st.block.blcplus || 0)
                    + (st.defense.defplus || 0) * 0.5 + (st.reception.r4 || 0) * 0.5;
                if (punch <= 0) return;
                if (!best || punch > best.punch) {
                    var score = (typeof Storage !== 'undefined') ? Storage.getSetScore(m) : { homeWins: 0, awayWins: 0 };
                    var det = [];
                    if (st.attack.attplus) det.push(st.attack.attplus + ' attaques');
                    if (st.service.ace) det.push(st.service.ace + ' aces');
                    if (st.block.blcplus) det.push(st.block.blcplus + ' blocs');
                    if (st.defense.defplus && det.length < 2) det.push(st.defense.defplus + ' défenses');
                    best = {
                        punch: punch,
                        opponent: m.opponent || 'Adversaire',
                        score: score.homeWins + '–' + score.awayWins,
                        date: fmtDate(m),
                        detail: det.slice(0, 3).join(' · ') || 'Un grand match'
                    };
                }
            });
            return best;
        },

        _buildTeamSlides: function () {
            var s = this._season;
            var ts = s.teamStats;
            var rec = s.teamRecord;
            var winRate = rec.matches ? Math.round(rec.wins / rec.matches * 100) : 0;
            var slides = [];

            slides.push({
                bg: 'linear-gradient(160deg,#ff6b35 0%,#b91d73 55%,#6d28d9 100%)',
                emoji: '🏐',
                kicker: 'Résumé de l\'équipe',
                headline: 'Jen et ses Saints',
                lines: ['Saison <span class="strong">' + esc(s.label) + '</span>'],
                hint: 'Tape pour dérouler →'
            });

            slides.push({
                bg: PALETTE[3],
                emoji: '📊',
                kicker: 'Le bilan',
                stat: { value: rec.wins }, statLabel: rec.wins > 1 ? 'victoires' : 'victoire',
                lines: [
                    '<span class="strong">' + rec.losses + '</span> défaite' + (rec.losses > 1 ? 's' : '') +
                        (rec.draws ? ' · ' + rec.draws + ' nul' + (rec.draws > 1 ? 's' : '') : ''),
                    '<span class="strong">' + winRate + '%</span> de victoires sur ' + rec.matches + ' matchs'
                ]
            });

            slides.push({
                bg: PALETTE[1],
                emoji: '🎽',
                kicker: 'Les sets',
                stat: { value: s.setsWon }, statLabel: 'sets remportés',
                lines: ['sur <span class="strong">' + s.setsPlayed + '</span> sets joués cette saison']
            });

            var diff = s.pointsFor - s.pointsAgainst;
            slides.push({
                bg: PALETTE[2],
                emoji: '🔥',
                kicker: 'Au score',
                stat: { value: s.pointsFor }, statLabel: 'points marqués',
                lines: [
                    '<span class="strong">' + s.pointsAgainst + '</span> points encaissés',
                    'Différentiel : <span class="strong">' + (diff >= 0 ? '+' : '') + diff + '</span>'
                ]
            });

            if (s.biggestWin) {
                slides.push({
                    bg: PALETTE[6],
                    emoji: '💪',
                    kicker: 'Plus belle victoire',
                    headline: 'vs ' + s.biggestWin.opponent,
                    lines: [
                        '<span class="strong">' + esc(s.biggestWin.score) + '</span>' +
                            (s.biggestWin.date ? ' · ' + esc(s.biggestWin.date) : '')
                    ]
                });
            }

            slides.push({
                bg: PALETTE[5],
                emoji: '🎯',
                kicker: 'Au service',
                stat: { value: ts.service.ace }, statLabel: 'aces collectifs',
                lines: ['<span class="strong">' + ts.service.splus + '</span> services gagnants en plus']
            });

            slides.push({
                bg: PALETTE[0],
                emoji: '💥',
                kicker: 'À l\'attaque',
                stat: { value: ts.attack.attplus }, statLabel: 'attaques gagnantes',
                lines: ['La force de frappe de la saison']
            });

            // Temps de jeu collectif — classement par sets joués (réutilise l'onglet T.Jeu)
            var ptList = (s.playingTimeList || []).slice()
                .filter(function (p) { return p.setsPlayed > 0; })
                .sort(function (a, b) { return b.setsPlayed - a.setsPlayed; });
            if (ptList.length) {
                var totSets = s.setsPlayed || 0;
                slides.push({
                    bg: 'linear-gradient(160deg,#14b8a6 0%,#0f766e 100%)',
                    emoji: '⏱️',
                    kicker: 'Le temps de jeu',
                    headline: totSets + ' sets disputés',
                    list: ptList.slice(0, 12).map(function (p, i) {
                        var pct = totSets > 0 ? Math.round(p.setsPlayed / totSets * 100) : 0;
                        return { rank: i + 1, name: p.name, val: Math.round(p.setsPlayed) + ' · ' + pct + '%' };
                    })
                });
            }

            // Distinctions de l'année — toutes les catégories (MVP retiré), par paquets
            var dist = s.distinctions || [];
            var perSlide = 5;
            var nChunks = Math.ceil(dist.length / perSlide);
            for (var di = 0; di < dist.length; di += perSlide) {
                var chunk = dist.slice(di, di + perSlide);
                var part = nChunks > 1 ? ' ' + (di / perSlide + 1) + '/' + nChunks : '';
                slides.push({
                    bg: PALETTE[4],
                    emoji: '🏅',
                    kicker: 'Distinctions de l\'année' + part,
                    list: chunk.map(function (d) {
                        return { left: d.emoji + ' ' + RecapView._shortDistLabel(d.label), name: d.name, val: d.highlight };
                    })
                });
            }

            // Effectif
            var squad = s.players.slice().sort(function (a, b) {
                return (s.presence[b].matches - s.presence[a].matches) || a.localeCompare(b);
            });
            slides.push({
                bg: PALETTE[1],
                emoji: '🤝',
                kicker: 'L\'effectif',
                headline: s.players.length + ' joueur·euses',
                list: squad.slice(0, 9).map(function (n, i) {
                    return { rank: (i + 1), name: n, val: s.presence[n].matches + ' m.' };
                })
            });

            slides.push({
                bg: 'linear-gradient(160deg,#ff6b35 0%,#b91d73 55%,#6d28d9 100%)',
                emoji: '🏆',
                kicker: 'Saison ' + esc(s.label),
                headline: 'Merci pour cette saison !',
                lines: ['Vivement la prochaine 🙌', 'Jen et ses Saints'],
                hint: 'Tape pour revenir à la liste'
            });

            return slides;
        },

        // ================= LECTEUR DE STORY =================
        _playStory: function (slides) {
            if (!slides || !slides.length) { this._showLanding(); return; }
            this._stopStory();
            var o = this._overlay;

            var segs = slides.map(function () {
                return '<div class="recap-progress-seg"><span class="recap-progress-fill"></span></div>';
            }).join('');

            o.innerHTML =
                '<div class="recap-story" id="recapStory">' +
                    '<div class="recap-progress" id="recapProgress">' + segs + '</div>' +
                    '<button class="recap-iconbtn recap-home" id="recapHomeBtn" aria-label="Retour">‹</button>' +
                    '<button class="recap-iconbtn recap-close" id="recapCloseBtn2" aria-label="Fermer">✕</button>' +
                    '<div class="recap-tapzone recap-tap-prev" id="recapTapPrev"></div>' +
                    '<div class="recap-tapzone recap-tap-next" id="recapTapNext"></div>' +
                    '<div class="recap-slide" id="recapSlide"></div>' +
                    '<div class="recap-hint" id="recapHint"></div>' +
                '</div>';

            var story = {
                slides: slides,
                idx: 0,
                fills: Array.prototype.slice.call(o.querySelectorAll('.recap-progress-fill')),
                slideEl: document.getElementById('recapSlide'),
                storyEl: document.getElementById('recapStory'),
                hintEl: document.getElementById('recapHint'),
                raf: null,
                countRaf: null,
                startTs: 0,
                elapsed: 0,
                paused: false,
                longPress: false,
                pressTimer: null
            };
            this._story = story;

            document.getElementById('recapCloseBtn2').onclick = this.close.bind(this);
            document.getElementById('recapHomeBtn').onclick = this._showLanding.bind(this);
            document.getElementById('recapTapPrev').onclick = function () { if (!story.longPress) RecapView._prevSlide(); };
            document.getElementById('recapTapNext').onclick = function () { if (!story.longPress) RecapView._nextSlide(); };

            // Maintien appuyé = pause
            var onDown = function () {
                story.longPress = false;
                story.pressTimer = setTimeout(function () { story.longPress = true; RecapView._pause(); }, 230);
            };
            var onUp = function () {
                clearTimeout(story.pressTimer);
                if (story.longPress) RecapView._resume();
            };
            story.storyEl.addEventListener('pointerdown', onDown);
            story.storyEl.addEventListener('pointerup', onUp);
            story.storyEl.addEventListener('pointercancel', onUp);
            story.storyEl.addEventListener('pointerleave', onUp);

            this._renderSlide(0);
        },

        _renderSlide: function (idx) {
            var story = this._story;
            if (!story) return;
            if (idx < 0) idx = 0;
            if (idx >= story.slides.length) { this._showLanding(); return; }
            story.idx = idx;
            var sl = story.slides[idx];

            // Barres de progression
            story.fills.forEach(function (f, i) {
                f.style.transition = 'none';
                f.style.width = i < idx ? '100%' : (i > idx ? '0%' : '0%');
            });

            // Fond
            story.storyEl.style.background = sl.bg || '#111';

            // Contenu
            var html = '<div class="recap-slide-inner">';
            html += '<div class="recap-slide-emoji">' + (sl.emoji || '🏐') + '</div>';
            if (sl.kicker) html += '<div class="recap-kicker">' + esc(sl.kicker) + '</div>';
            if (sl.stat) {
                html += '<div class="recap-statwrap"><span class="recap-stat-value" data-count="' + sl.stat.value + '">0</span>' +
                    (sl.stat.suffix ? '<span class="recap-stat-suffix">' + esc(sl.stat.suffix) + '</span>' : '') + '</div>';
                if (sl.statLabel) html += '<div class="recap-headline">' + esc(sl.statLabel) + '</div>';
            } else if (sl.headline) {
                html += '<div class="recap-headline">' + sl.headline.replace(/</g, '&lt;') + '</div>';
            }
            if (sl.list) {
                html += '<div class="recap-list">';
                html += sl.list.map(function (row) {
                    return '<div class="recap-list-row">' +
                        (row.rank ? '<span class="recap-list-rank">' + row.rank + '</span>' : (row.left ? '<span class="recap-list-rank" style="width:auto">' + row.left + '</span>' : '')) +
                        '<span class="recap-list-name">' + esc(row.name) + '</span>' +
                        (row.val ? '<span class="recap-list-val">' + esc(row.val) + '</span>' : '') +
                        '</div>';
                }).join('');
                html += '</div>';
            }
            if (sl.courts) {
                html += '<div class="recap-courts">';
                html += sl.courts.map(function (c, ci) {
                    return '<div class="recap-court-wrap">' +
                        '<canvas class="recap-court-canvas" data-court="' + ci + '"></canvas>' +
                        '<div class="recap-court-label">' + esc(c.label) +
                        ' <span class="recap-court-count">' + (c.points ? c.points.length : 0) + '</span></div>' +
                        '</div>';
                }).join('');
                html += '</div>';
            }
            if (sl.lines && sl.lines.length) {
                html += '<div class="recap-lines">' + sl.lines.map(function (l) { return '<p>' + l + '</p>'; }).join('') + '</div>';
            }
            if (sl.badge) html += '<div class="recap-badge-pill">' + esc(sl.badge) + '</div>';
            html += '</div>';
            story.slideEl.innerHTML = html;

            story.hintEl.textContent = sl.hint || '';

            // Animation du grand nombre
            var countEl = story.slideEl.querySelector('[data-count]');
            if (countEl) this._countUp(countEl, parseFloat(countEl.getAttribute('data-count')) || 0);

            // Heatmaps (dessinées après layout pour avoir les dimensions réelles)
            if (sl.courts) {
                requestAnimationFrame(function () {
                    story.slideEl.querySelectorAll('.recap-court-canvas').forEach(function (cv) {
                        var ci = parseInt(cv.getAttribute('data-court'), 10);
                        var c = sl.courts[ci];
                        RecapView._drawCourtHeat(cv, c && c.points, c);
                    });
                });
            }

            // Démarrer le minuteur d'avance auto
            story.elapsed = 0;
            story.paused = false;
            this._startTimer();
        },

        _countUp: function (el, target) {
            var story = this._story;
            if (story && story.countRaf) cancelAnimationFrame(story.countRaf);
            var dur = 1100;
            var start = null;
            var decimals = (target % 1 !== 0) ? 1 : 0;
            function frame(ts) {
                if (!start) start = ts;
                var p = Math.min((ts - start) / dur, 1);
                var eased = 1 - Math.pow(1 - p, 3);
                var val = target * eased;
                el.textContent = decimals ? val.toFixed(1) : Math.round(val).toString();
                if (p < 1 && story) { story.countRaf = requestAnimationFrame(frame); }
                else { el.textContent = decimals ? target.toFixed(1) : Math.round(target).toString(); }
            }
            if (story) story.countRaf = requestAnimationFrame(frame);
        },

        _startTimer: function () {
            var story = this._story;
            if (!story) return;
            if (story.raf) cancelAnimationFrame(story.raf);
            story.elapsed = 0;
            story.lastTs = null;
            var fill = story.fills[story.idx];
            function step(ts) {
                if (!story || RecapView._story !== story) return;
                if (story.paused) {
                    // figé : on garde lastTs frais pour que le delta soit ~0 à la reprise
                    story.lastTs = ts;
                    story.raf = requestAnimationFrame(step);
                    return;
                }
                if (story.lastTs == null) story.lastTs = ts;
                story.elapsed += (ts - story.lastTs);
                story.lastTs = ts;
                var p = Math.min(story.elapsed / STORY_DURATION, 1);
                if (fill) fill.style.width = (p * 100) + '%';
                if (p >= 1) { RecapView._nextSlide(); return; }
                story.raf = requestAnimationFrame(step);
            }
            story.raf = requestAnimationFrame(step);
        },

        _pause: function () { if (this._story) this._story.paused = true; },
        _resume: function () { if (this._story) this._story.paused = false; },

        _nextSlide: function () {
            if (!this._story) return;
            this._renderSlide(this._story.idx + 1);
        },
        _prevSlide: function () {
            if (!this._story) return;
            if (this._story.idx === 0) { this._showLanding(); return; }
            this._renderSlide(this._story.idx - 1);
        },

        _stopStory: function () {
            var story = this._story;
            if (!story) return;
            if (story.raf) cancelAnimationFrame(story.raf);
            if (story.countRaf) cancelAnimationFrame(story.countRaf);
            this._story = null;
        }
    };

    // Pause auto si l'onglet passe en arrière-plan
    document.addEventListener('visibilitychange', function () {
        if (!RecapView._story) return;
        if (document.hidden) RecapView._pause(); else RecapView._resume();
    });

    window.RecapView = RecapView;
})();
