'use strict';

// ==================== PASS GRIDS FALLBACK ====================
// Copie des grilles hardcodées de match-live-helpers.js pour le cas où localStorage est vide
// (ex: téléphone connecté au deploy sans calibration locale)
const PASS_GRIDS_FALLBACK = {
    'R4': {
        'confort': [
            [1,1,1,2,4,4,4,3,2,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,1,1,3,4,4,4,3,2,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,1,1,3,3,3,3,3,2,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,1,1,2,2,2,2,2,2,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,2,2,2,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
        ],
        'contraint': [
            [1,1,1,3,4,4,4,4,3,2,2,1,1,1,1,1,1,1,1,1,1,1],
            [1,1,2,3,4,4,4,4,3,2,2,1,1,1,1,1,1,1,1,1,1,1],
            [1,1,2,3,4,4,4,4,3,2,2,1,1,1,1,1,1,1,1,1,1,1],
            [1,1,2,3,3,3,3,3,3,2,2,1,1,1,1,1,1,1,1,1,1,1],
            [1,1,1,1,2,2,2,2,2,2,2,1,1,1,1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,2,2,2,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
        ],
        'transition': [
            [1,1,2,3,4,4,4,4,4,3,2,1,1,1,1,1,1,1,1,1,1,1],
            [1,1,2,3,4,4,4,4,4,3,2,1,1,1,1,1,1,1,1,1,1,1],
            [1,1,2,3,4,4,4,4,4,3,2,1,1,1,1,1,1,1,1,1,1,1],
            [1,1,2,3,3,3,3,3,3,3,2,1,1,1,1,1,1,1,1,1,1,1],
            [1,1,2,2,2,2,3,3,3,3,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,1,1,1,2,2,2,2,2,2,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
        ]
    },
    'Centre': {
        'confort': [
            [1,1,1,1,1,2,3,4,4,4,4,3,2,1,1,1,1,1],
            [1,1,1,1,1,2,3,3,3,3,3,3,2,1,1,1,1,1],
            [1,1,1,1,1,2,2,2,2,2,2,2,2,1,1,1,1,1],
            [1,1,1,1,1,1,1,2,2,2,2,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
        ],
        'contraint': [
            [1,1,1,1,1,3,4,4,4,4,4,4,3,1,1,1,1,1],
            [1,1,1,1,1,3,3,4,4,4,4,3,3,1,1,1,1,1],
            [1,1,1,1,1,2,3,3,3,3,3,3,2,1,1,1,1,1],
            [1,1,1,1,1,1,2,2,2,2,2,2,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,2,2,2,2,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
        ],
        'transition': [
            [1,1,1,1,1,3,4,4,4,4,4,4,3,1,1,1,1,1],
            [1,1,1,1,1,3,3,4,4,4,4,3,3,1,1,1,1,1],
            [1,1,1,1,1,2,3,4,4,4,4,3,2,1,1,1,1,1],
            [1,1,1,1,1,2,3,3,3,3,3,3,2,1,1,1,1,1],
            [1,1,1,1,1,1,2,2,2,2,2,2,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,2,2,2,2,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
        ]
    },
    'Pointu': {
        'confort': [
            [1,1,1,1,1,1,1,1,1,1,1,1,1,3,4,4,4,4,2,1,1,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,3,4,4,4,4,3,1,1,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,3,3,3,3,3,3,1,1,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,2,2,2,3,3,2,1,1,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,2,2,2,1,1,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
        ],
        'contraint': [
            [1,1,1,1,1,1,1,1,1,1,1,1,1,3,4,4,4,4,3,1,1,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,3,4,4,4,4,3,2,1,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,3,4,4,4,4,3,2,1,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,3,3,3,3,3,3,2,1,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,2,2,2,2,2,2,2,1,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,2,2,1,1,1,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
        ],
        'transition': [
            [1,1,1,1,1,1,1,1,1,1,1,2,3,4,4,4,4,4,3,2,1,1],
            [1,1,1,1,1,1,1,1,1,1,1,2,3,4,4,4,4,4,3,2,1,1],
            [1,1,1,1,1,1,1,1,1,1,1,2,3,4,4,4,4,4,3,2,1,1],
            [1,1,1,1,1,1,1,1,1,1,1,2,3,3,3,3,3,3,3,2,1,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,2,2,3,3,3,3,3,2,1,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,2,2,2,2,2,2,2,2,1,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
        ]
    }
};

// ==================== UTILITIES ====================
const Utils = {
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    formatDate(timestamp) {
        const d = new Date(timestamp);
        return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
    },

    formatPercent(value, total) {
        if (!total || total === 0) return '-';
        return Math.round(value / total * 100) + '%';
    }
};

// ==================== DATA LAYER ====================
const HistoriqueData = {
    _cache: null,
    _firebaseLoaded: false,

    /**
     * Retourne les matchs complétés (synchrone, utilise le cache).
     * Au premier appel avant le chargement Firebase, retourne les données locales.
     * Après loadFromFirebase(), retourne les données mergées local+Firebase.
     */
    getCompletedMatches() {
        if (!this._cache) {
            this._cache = Storage.getAllMatches().filter(m => m.status === 'completed');
        }
        return this._cache;
    },

    /**
     * Charge les matchs depuis Firebase et les merge avec les locaux.
     * Pré-remplit le cache — les appels synchrones suivants utiliseront les données mergées.
     * @returns {Promise<boolean>} true si des données Firebase ont été chargées
     */
    async loadFromFirebase() {
        if (typeof FirebaseSync === 'undefined' || !FirebaseSync.isConfigured()) return false;

        try {
            const local = Storage.getAllMatches().filter(m => m.status === 'completed');
            const remote = await FirebaseSync.getCompletedMatches();
            this._cache = FirebaseSync.mergeMatches(local, remote);
            this._firebaseLoaded = true;
            return remote.length > 0;
        } catch (err) {
            console.warn('[Historique] Firebase indisponible, données locales uniquement :', err.message);
            return false;
        }
    },

    invalidateCache() {
        this._cache = null;
        this._firebaseLoaded = false;
    },

    async deleteMatch(id) {
        // Vérifier que c'est bien l'admin (propriétaire)
        if (typeof FirebaseSync === 'undefined' || !FirebaseSync.isAdmin()) {
            throw new Error('Seul le propriétaire peut supprimer un match.');
        }

        var firebaseOk = false;

        // Supprimer de Firebase EN PREMIER (si échec réseau, on ne supprime pas du local)
        if (typeof FirebaseSync !== 'undefined' && FirebaseSync.isConfigured()) {
            try {
                await FirebaseSync.deleteMatch(id);
                firebaseOk = true;
            } catch (err) {
                console.warn('[Historique] Suppression Firebase échouée :', err.message);
            }
        }

        // Supprimer du localStorage
        Storage.deleteMatch(id);

        // Si Firebase a échoué, stocker un tombstone pour empêcher la restauration au prochain merge
        if (!firebaseOk) {
            var tombstones = JSON.parse(localStorage.getItem('volleyball_deleted_matches') || '[]');
            if (tombstones.indexOf(id) === -1) tombstones.push(id);
            localStorage.setItem('volleyball_deleted_matches', JSON.stringify(tombstones));
        }

        this.invalidateCache();
    }
};

// ==================== SEASON SELECTOR ====================
const SeasonSelector = {
    current: '2025-2026',

    init() {
        var saved = sessionStorage.getItem('historique_season');
        if (saved) {
            this.current = saved;
            this._updateButtons();
            this._updateTabs();
        }
    },

    switchTo(season) {
        this.current = season;
        sessionStorage.setItem('historique_season', season);
        this._updateButtons();

        // Force re-render de toutes les vues
        MatchStatsView._rendered = false;
        MatchStatsView.selectedMatchIndex = null;
        MatchStatsView.currentMatch = null;
        YearStatsView._rendered = false;
        SetsPlayedView._rendered = false;
        RankingView._rendered = false;
        ProgressionView._rendered = false;
        StatsVisuellesView._container = null; // forcer re-render stats visuelles
        ImpactView._seasonRoster = null; // invalider le cache roster
        ImpactView._seasonDirPerSet = null;

        // Adapter les onglets selon la saison
        this._updateTabs();

        // Si on est en ALL et l'onglet actif est matchStats, basculer sur yearStats
        if (season === 'ALL' && TabNav.currentTab === 'matchStats') {
            TabNav.switchTo('yearStats');
        } else {
            TabNav.switchTo(TabNav.currentTab);
        }

        // Footer dynamique
        this._updateFooter();
    },

    getFilteredMatches() {
        var all = HistoriqueData.getCompletedMatches();
        if (this.current === 'ALL') return all;
        return all.filter(function(m) {
            // Matchs sans champ season = legacy 2025-2026
            var matchSeason = m.season || '2025-2026';
            return matchSeason === this.current;
        }.bind(this));
    },

    getLabel() {
        if (this.current === 'ALL') return 'Saisons ALL';
        return 'Saison ' + this.current;
    },

    _updateButtons() {
        document.querySelectorAll('.season-btn').forEach(function(btn) {
            btn.classList.toggle('active', btn.dataset.season === this.current);
        }.bind(this));
    },

    _updateTabs() {
        var isAll = this.current === 'ALL';
        // Masquer/afficher Stats Matchs
        var matchStatsBtn = document.querySelector('.tab-btn[data-tab="matchStats"]');
        if (matchStatsBtn) matchStatsBtn.style.display = isAll ? 'none' : '';
        // Renommer Année / Années
        var yearStatsBtn = document.querySelector('.tab-btn[data-tab="yearStats"]');
        if (yearStatsBtn) yearStatsBtn.textContent = isAll ? 'Années' : 'Année';
    },

    _updateFooter() {
        var footer = document.querySelector('.footer');
        if (footer) {
            footer.textContent = 'FSGT 4\u00d74 \u2022 ' + this.getLabel();
        }
    }
};

// ==================== SIDE OUT / BREAK OUT ANALYSIS ====================
const SideOutAnalysis = {

    /**
     * Classifie un point comme 'sideout' ou 'breakout'.
     * Side Out = l'equipe en reception a marque.
     * Break Out = l'equipe au service a marque.
     */
    classifyPoint(point, prevPoint, initialHomeScore, initialAwayScore) {
        initialHomeScore = initialHomeScore || 0;
        initialAwayScore = initialAwayScore || 0;
        const prevHome = prevPoint ? prevPoint.homeScore : initialHomeScore;
        const scorer = point.homeScore > prevHome ? 'home' : 'away';
        return scorer !== point.servingTeam ? 'sideout' : 'breakout';
    },

    /**
     * Calcule les stats Side Out % et Break Out % par equipe pour un set.
     */
    calculateSideOutStats(points, initialHomeScore, initialAwayScore) {
        initialHomeScore = initialHomeScore || 0;
        initialAwayScore = initialAwayScore || 0;

        const result = {
            home: { soTotal: 0, soWon: 0, brkTotal: 0, brkWon: 0 },
            away: { soTotal: 0, soWon: 0, brkTotal: 0, brkWon: 0 }
        };

        for (let i = 0; i < points.length; i++) {
            const point = points[i];
            const prevPoint = i > 0 ? points[i - 1] : null;
            const prevHome = prevPoint ? prevPoint.homeScore : initialHomeScore;
            const scorer = point.homeScore > prevHome ? 'home' : 'away';
            const servingTeam = point.servingTeam;
            const receivingTeam = servingTeam === 'home' ? 'away' : 'home';

            // Pour l'equipe en reception : opportunite de side out
            result[receivingTeam].soTotal++;
            if (scorer === receivingTeam) {
                result[receivingTeam].soWon++;
            }

            // Pour l'equipe au service : opportunite de break out
            result[servingTeam].brkTotal++;
            if (scorer === servingTeam) {
                result[servingTeam].brkWon++;
            }
        }

        // Calculer les pourcentages
        for (const team of ['home', 'away']) {
            result[team].soPercent = result[team].soTotal > 0
                ? Math.round(result[team].soWon / result[team].soTotal * 100)
                : null;
            result[team].brkPercent = result[team].brkTotal > 0
                ? Math.round(result[team].brkWon / result[team].brkTotal * 100)
                : null;
        }

        return result;
    },

    /**
     * Agregation des stats Side Out sur plusieurs sets.
     */
    aggregateSideOutStats(sets) {
        const agg = {
            home: { soTotal: 0, soWon: 0, brkTotal: 0, brkWon: 0 },
            away: { soTotal: 0, soWon: 0, brkTotal: 0, brkWon: 0 }
        };

        for (const set of sets) {
            const setStats = this.calculateSideOutStats(
                set.points || [],
                set.initialHomeScore || 0,
                set.initialAwayScore || 0
            );
            for (const team of ['home', 'away']) {
                agg[team].soTotal += setStats[team].soTotal;
                agg[team].soWon += setStats[team].soWon;
                agg[team].brkTotal += setStats[team].brkTotal;
                agg[team].brkWon += setStats[team].brkWon;
            }
        }

        for (const team of ['home', 'away']) {
            agg[team].soPercent = agg[team].soTotal > 0
                ? Math.round(agg[team].soWon / agg[team].soTotal * 100) : null;
            agg[team].brkPercent = agg[team].brkTotal > 0
                ? Math.round(agg[team].brkWon / agg[team].brkTotal * 100) : null;
        }

        return agg;
    }
};

// ==================== STATS REPAIR (V20.287) ====================
// Recalcule les stats d'un set depuis les rallies quand des joueurs sont manquants
const StatsRepair = {

    // Detecte si un set a des stats manquantes (joueurs avec actions mais sans entree stats)
    needsRepair(set) {
        if (!set || !set.points || set.points.length === 0) return false;
        if (!set.stats) return true;
        var stats = set.stats;
        for (var pi = 0; pi < set.points.length; pi++) {
            var rally = set.points[pi].rally;
            if (!rally) continue;
            for (var ri = 0; ri < rally.length; ri++) {
                var a = rally[ri];
                if (a.team && a.player) {
                    if (!stats[a.team] || !stats[a.team][a.player]) return true;
                }
            }
        }
        // Detecter ventilation passe manquante (match pre-V19.2)
        var teams = ['home', 'away'];
        for (var ti = 0; ti < teams.length; ti++) {
            var teamStats = stats[teams[ti]];
            if (!teamStats) continue;
            var names = Object.keys(teamStats);
            for (var ni = 0; ni < names.length; ni++) {
                var p = teamStats[names[ni]] && teamStats[names[ni]].pass;
                if (p && p.tot > 0) {
                    var ventilTot = (p.passeur ? p.passeur.tot : 0) + (p.autre ? p.autre.tot : 0);
                    if (ventilTot === 0) return true;
                }
            }
        }
        return false;
    },

    // Recalcule entierement les stats d'un set depuis les rallies
    repairSetStats(set) {
        if (!set || !set.points || set.points.length === 0) return;

        // Sauvegarder les stats passe originales (evaluees avec les grilles)
        // pour les restaurer apres recalcul (la reparation ne peut pas evaluer P4/P3/P2/P1)
        var originalPassStats = {};
        if (set.stats) {
            ['home', 'away'].forEach(function(team) {
                if (!set.stats[team]) return;
                Object.keys(set.stats[team]).forEach(function(name) {
                    var data = set.stats[team][name];
                    if (data && data.pass && data.pass.tot > 0) {
                        originalPassStats[team + ':' + name] = JSON.parse(JSON.stringify(data.pass));
                    }
                });
            });
        }

        // Construire un setStats vierge avec tous les joueurs
        var repaired = { home: {}, away: {} };
        var self = this;

        // 1. Joueurs des lineups (initial + actuel)
        ['home', 'away'].forEach(function(team) {
            var lineupKey = team === 'home' ? 'homeLineup' : 'awayLineup';
            var initialKey = team === 'home' ? 'initialHomeLineup' : 'initialAwayLineup';
            [initialKey, lineupKey].forEach(function(k) {
                var lu = set[k];
                if (!lu) return;
                Object.values(lu).forEach(function(name) {
                    if (name && !repaired[team][name]) {
                        repaired[team][name] = StatsAggregator.initPlayerStats();
                    }
                });
            });
        });

        // 2. Joueurs des substitutions
        if (set.substitutions) {
            set.substitutions.forEach(function(sub) {
                if (sub.playerOut && !repaired[sub.team][sub.playerOut]) {
                    repaired[sub.team][sub.playerOut] = StatsAggregator.initPlayerStats();
                }
                if (sub.playerIn && !repaired[sub.team][sub.playerIn]) {
                    repaired[sub.team][sub.playerIn] = StatsAggregator.initPlayerStats();
                }
            });
        }

        // 3. Joueurs des rallies (filet de securite)
        set.points.forEach(function(point) {
            if (!point.rally) return;
            point.rally.forEach(function(a) {
                if (a.team && a.player && !repaired[a.team][a.player]) {
                    repaired[a.team][a.player] = StatsAggregator.initPlayerStats();
                }
            });
        });

        // 4. Traiter chaque rally (passer set pour ventilation passe)
        set.points.forEach(function(point) {
            if (!point.rally) return;
            self._processRally(point.rally, repaired, set);
        });

        // 5. Restaurer les stats passe originales (avec P4/P3/P2/P1 evaluees par grille)
        // SAUF si la ventilation originale est absente (match pre-V19.2)
        ['home', 'away'].forEach(function(team) {
            Object.keys(repaired[team]).forEach(function(name) {
                var key = team + ':' + name;
                if (originalPassStats[key]) {
                    var orig = originalPassStats[key];
                    var ventilOK = orig.tot === 0 ||
                        ((orig.passeur ? orig.passeur.tot : 0) + (orig.autre ? orig.autre.tot : 0)) > 0;
                    if (ventilOK) {
                        // Ventilation originale coherente — restaurer (P4/P3/P2/P1 calibrees)
                        repaired[team][name].pass = orig;
                    } else {
                        // Ventilation absente — garder le recalcul (tot+fp+ventilation)
                        // mais copier les P4/P3/P2/P1 de l'original si disponibles
                        var rec = repaired[team][name].pass;
                        if (orig.p4) rec.p4 = orig.p4;
                        if (orig.p3) rec.p3 = orig.p3;
                        if (orig.p2) rec.p2 = orig.p2;
                        if (orig.p1) rec.p1 = orig.p1;
                    }
                }
            });
        });

        // 6. Ecraser les stats du set
        set.stats = repaired;
    },

    // --- Helpers ---

    // Determine le role d'un joueur dans un set (depuis le lineup actuel ou initial)
    _getPlayerRole(player, team, set) {
        if (!set || !player) return null;
        var lineupKey = team === 'home' ? 'homeLineup' : 'awayLineup';
        var initialKey = team === 'home' ? 'initialHomeLineup' : 'initialAwayLineup';
        // Chercher dans le lineup actuel puis initial
        var lineups = [set[lineupKey], set[initialKey]];
        for (var li = 0; li < lineups.length; li++) {
            var lu = lineups[li];
            if (!lu) continue;
            var positions = Object.keys(lu);
            for (var pi = 0; pi < positions.length; pi++) {
                if (lu[positions[pi]] === player) {
                    // Position → role via POSITION_ROLES
                    var posRoles = team === 'home'
                        ? { 1: 'Passeur', 2: 'R4', 3: 'Centre', 4: 'Pointu' }
                        : { 4: 'Passeur', 1: 'R4', 2: 'Centre', 3: 'Pointu' };
                    return posRoles[positions[pi]] || null;
                }
            }
        }
        return null;
    },

    // Port simplifie de getPassContext pour la reparation
    _getPassContextForRepair(rally, passIndex, passerRole) {
        var isPasseur = (passerRole === 'Passeur');
        var playerType = isPasseur ? 'Passeur' : 'Autre';
        var passAction = rally[passIndex];
        var team = passAction.team;
        // Chercher la derniere reception ou defense de la meme equipe avant la passe
        for (var i = passIndex - 1; i >= 0; i--) {
            var a = rally[i];
            if (a.team !== team) continue;
            if (a.type === 'reception') {
                var score = a.quality ? (typeof a.quality.score === 'number' ? a.quality.score : 2) : 2;
                if (isPasseur) {
                    return { playerType: playerType, context: score === 4 ? 'confort' : 'contraint' };
                } else {
                    return { playerType: playerType, context: score >= 3 ? 'transition' : 'contraint' };
                }
            }
            if (a.type === 'defense') {
                var defQ = a.defenseQuality || 'negative';
                return { playerType: playerType, context: defQ === 'positive' ? 'contraint' : 'transition' };
            }
        }
        return { playerType: playerType, context: 'transition' };
    },

    _recQualityToNote(quality) {
        if (!quality || !quality.label) return null;
        switch (quality.label) {
            case 'Excellente': return 4;
            case 'Positive':   return 3;
            case 'Jouable':    return 2;
            case 'Négative':   return 1;
            case 'Faute':      return 0;
            default: return (typeof quality.score === 'number') ? quality.score : null;
        }
    },

    _findNext(rally, afterIndex, type) {
        for (var i = afterIndex + 1; i < rally.length; i++) {
            if (rally[i].type === type) return { action: rally[i], index: i };
        }
        return null;
    },

    _analyzeAfterDefended(rally, afterIndex, oppositeTeam) {
        var attackingTeam = oppositeTeam === 'home' ? 'away' : 'home';
        for (var i = afterIndex + 1; i < rally.length; i++) {
            var a = rally[i];
            if (a.team === oppositeTeam) {
                if (a.type === 'defense' && a.result === 'fault') continue;
                if (a.type === 'block' && a.passThrough) continue;
                if (a.type === 'block') {
                    for (var j = i + 1; j < rally.length; j++) {
                        if (rally[j].team === attackingTeam) {
                            if (rally[j].type === 'defense' && rally[j].result === 'fault') return 'blocked';
                            return 'continued';
                        }
                        if (rally[j].team === oppositeTeam && rally[j].type === 'defense' && rally[j].result === 'fault') return 'ended';
                    }
                    return 'blocked';
                }
                return 'continued';
            }
        }
        return 'ended';
    },

    _isDirectReturnExploited(rally, index, team) {
        var oppositeTeam = team === 'home' ? 'away' : 'home';
        for (var j = index + 1; j < rally.length; j++) {
            var a = rally[j];
            if (a.team === team && (a.type === 'pass' || a.type === 'attack')) return false;
            if (a.team === oppositeTeam && a.type === 'pass') return false;
            if (a.team === oppositeTeam && a.type === 'attack' && (a.result === 'point' || a.result === 'bloc_out')) return true;
            if (a.team === team && a.type === 'defense' && a.result === 'fault') return true;
        }
        return false;
    },

    // --- Traitement d'un rally complet ---
    _processRally(rally, setStats, set) {
        if (!rally || rally.length === 0) return;
        var self = this;

        for (var i = 0; i < rally.length; i++) {
            var action = rally[i];
            var team = action.team;
            var player = action.player;
            if (!team || !player) continue;

            var stats = setStats[team] && setStats[team][player];
            if (!stats) continue;

            switch (action.type) {
                case 'service':
                    stats.service.tot++;
                    if (action.result === 'ace') {
                        stats.service.ace++;
                        var recAce = self._findNext(rally, i, 'reception');
                        if (recAce) {
                            var noteAce = self._recQualityToNote(recAce.action.quality);
                            if (noteAce !== null) {
                                stats.service.recSumAdv += noteAce;
                                stats.service.recCountAdv++;
                            }
                        }
                    } else if (action.result === 'fault' || action.result === 'fault_out' || action.result === 'fault_net') {
                        stats.service.fser++;
                    } else {
                        var recAction = self._findNext(rally, i, 'reception');
                        if (recAction) {
                            var rec = recAction.action;
                            var note = self._recQualityToNote(rec.quality);
                            if (note !== null) {
                                if (rec.isDirectReturnWinner) {
                                    note = 0;
                                } else if (rec.isDirectReturn && !rec.isDirectReturnWinner) {
                                    if (self._isDirectReturnExploited(rally, recAction.index, rec.team)) note = 0;
                                }
                                stats.service.recSumAdv += note;
                                stats.service.recCountAdv++;
                                if (note === 0) stats.service.splus++;
                            }
                        }
                    }
                    break;

                case 'reception':
                    stats.reception.tot++;
                    var recExploited = action.isDirectReturn && !action.isDirectReturnWinner
                        && self._isDirectReturnExploited(rally, i, action.team);
                    if (recExploited) {
                        stats.reception.frec++;
                    } else if (action.quality) {
                        switch (action.quality.label) {
                            case 'Excellente': stats.reception.r4++; break;
                            case 'Positive':   stats.reception.r3++; break;
                            case 'Jouable':    stats.reception.r2++; break;
                            case 'Négative':   stats.reception.r1++; break;
                            case 'Faute':      stats.reception.frec++; break;
                            default:
                                if (action.quality.score === 0) stats.reception.frec++;
                                break;
                        }
                    }
                    break;

                case 'pass':
                    if (action.passType === 'relance') {
                        if (action.result === 'out') break;
                        // Retrograder reception/defense precedente
                        for (var j = i - 1; j >= 0; j--) {
                            var prev = rally[j];
                            if (prev.team !== action.team) continue;
                            var prevPlayer = prev.player;
                            if (!prevPlayer) continue;
                            var prevStats = setStats[team] && setStats[team][prevPlayer];
                            if (!prevStats) break;
                            if (prev.type === 'reception' && prev.quality) {
                                switch (prev.quality.label) {
                                    case 'Excellente': prevStats.reception.r4--; break;
                                    case 'Positive':   prevStats.reception.r3--; break;
                                    case 'Jouable':    prevStats.reception.r2--; break;
                                    case 'Négative':   break;
                                    case 'Faute':      prevStats.reception.frec--; break;
                                }
                                if (prev.quality.label !== 'Négative') prevStats.reception.r1++;
                                break;
                            }
                            if (prev.type === 'defense') {
                                if (prev.defenseQuality === 'positive') {
                                    prevStats.defense.defplus--;
                                    prevStats.defense.defneutral++;
                                }
                                break;
                            }
                        }
                        break;
                    }

                    // Passe normale — compter tot + FP + ventilation passeur/autre
                    var isFP = false;
                    if (action.isDirectReturn) {
                        if (!action.isDirectReturnWinner) {
                            if (self._isDirectReturnExploited(rally, i, action.team)) {
                                stats.pass.tot++;
                                stats.pass.fp++;
                                isFP = true;
                            } else {
                                break;
                            }
                        } else {
                            break;
                        }
                    } else if (!action.endPos || action.endPos.courtSide === 'net') {
                        stats.pass.tot++;
                        stats.pass.fp++;
                        isFP = true;
                    } else {
                        // Passe normale valide — tot seulement (qualite P4/P3/P2/P1 non evaluable sans grille)
                        stats.pass.tot++;
                    }
                    // Ventilation passeur/autre si set disponible
                    if (set) {
                        var role = action.role || self._getPlayerRole(player, team, set);
                        var ctx = self._getPassContextForRepair(rally, i, role);
                        var bucket = ctx.playerType === 'Passeur' ? stats.pass.passeur : stats.pass.autre;
                        if (bucket) {
                            bucket.tot++;
                            if (isFP) bucket.fp++;
                            var ctxBucket = bucket[ctx.context];
                            if (ctxBucket) {
                                ctxBucket.tot++;
                                if (isFP) ctxBucket.fp++;
                            }
                        }
                    }
                    break;

                case 'attack':
                    var isRelance = action.attackType === 'relance';
                    var oppTeam = team === 'home' ? 'away' : 'home';

                    if (isRelance) {
                        if (action.result === 'point' || action.result === 'bloc_out') {
                            stats.relance.tot++;
                            stats.relance.relplus++;
                        } else if (action.attackType === 'faute' || action.result === 'fault_net' || action.result === 'out') {
                            stats.relance.tot++;
                            stats.relance.frel++;
                        } else if (action.result === 'blocked') {
                            stats.relance.tot++;
                            stats.relance.relminus++;
                        }
                        break;
                    }

                    stats.attack.tot++;
                    if (action.attackType === 'faute' || action.result === 'fault_net' || action.result === 'out') {
                        stats.attack.fatt++;
                    } else if (action.result === 'point') {
                        stats.attack.attplus++;
                    } else if (action.result === 'bloc_out') {
                        stats.attack.attplus++;
                    } else if (action.result === 'blocked') {
                        stats.attack.bp++;
                    } else if (action.result === 'defended') {
                        var outcome = self._analyzeAfterDefended(rally, i, oppTeam);
                        if (outcome === 'continued') stats.attack.attminus++;
                        else if (outcome === 'blocked') stats.attack.bp++;
                        else stats.attack.attplus++;
                    }
                    break;

                case 'defense':
                    var blockBeforeType = null;
                    for (var bj = i - 1; bj >= 0; bj--) {
                        if (rally[bj].type === 'block' && rally[bj].team === team) {
                            blockBeforeType = rally[bj].result === 'bloc_out' ? 'bloc_out' : 'normal';
                            break;
                        }
                        if (rally[bj].type === 'pass' && rally[bj].team === team) break;
                        if (rally[bj].type === 'attack' && rally[bj].team === team) break;
                    }
                    if (blockBeforeType === 'bloc_out') break;

                    var oppTeamDef = team === 'home' ? 'away' : 'home';
                    var isDefAfterRelance = false;
                    for (var dj = i - 1; dj >= 0; dj--) {
                        if (rally[dj].type === 'attack' && rally[dj].team === oppTeamDef) {
                            isDefAfterRelance = rally[dj].attackType === 'relance';
                            break;
                        }
                        if (rally[dj].type === 'pass' && rally[dj].team === oppTeamDef
                            && rally[dj].passType === 'relance' && rally[dj].isDirectReturn) {
                            isDefAfterRelance = true;
                            break;
                        }
                        if (rally[dj].type === 'block' || (rally[dj].type === 'defense' && rally[dj].team === team)) break;
                    }

                    if (isDefAfterRelance) {
                        stats.relance.tot++;
                        var relExploited = action.isDirectReturn && !action.isDirectReturnWinner
                            && self._isDirectReturnExploited(rally, i, action.team);
                        if (relExploited) {
                            stats.relance.frel++;
                        } else if (action.isDirectReturn) {
                            stats.relance.relminus++;
                        } else if (action.result === 'fault') {
                            if (blockBeforeType === 'normal') stats.relance.relminus++;
                            else stats.relance.frel++;
                        } else {
                            if (action.defenseQuality === 'positive') stats.relance.relplus++;
                            else stats.relance.relminus++;
                        }
                    } else {
                        stats.defense.tot++;
                        if (action.untouched) {
                            if (blockBeforeType === 'normal') stats.defense.defminus++;
                            else stats.defense.fdef++;
                        } else {
                            var defExploited = action.isDirectReturn && !action.isDirectReturnWinner
                                && self._isDirectReturnExploited(rally, i, action.team);
                            if (defExploited) {
                                stats.defense.defminus++;
                            } else if (action.isDirectReturn) {
                                stats.defense.defneutral++;
                            } else if (action.result === 'fault') {
                                stats.defense.defminus++;
                            } else {
                                if (action.defenseQuality === 'positive') stats.defense.defplus++;
                                else if (action.defenseQuality === 'negative') stats.defense.defneutral++;
                                else stats.defense.defplus++;
                            }
                        }
                    }
                    break;

                case 'block':
                    stats.block.tot++;
                    if (action.result === 'bloc_out') {
                        stats.block.fblc++;
                    } else if (action.result === 'kill' || action.result === 'point') {
                        stats.block.blcplus++;
                    } else if (action.passThrough) {
                        stats.block.blcminus++;
                    } else {
                        var isBlockKill = false;
                        for (var bk = i + 1; bk < rally.length; bk++) {
                            if (rally[bk].type === 'defense') {
                                if (rally[bk].result === 'fault' && rally[bk].team !== team) isBlockKill = true;
                                break;
                            }
                            if (rally[bk].type === 'pass' || rally[bk].type === 'attack') break;
                        }
                        stats.block[isBlockKill ? 'blcplus' : 'blcminus']++;
                    }
                    break;
            }
        }
    }
};

// ==================== REPAIR FIREBASE (admin console) ====================
// Fonction manuelle pour reparer les stats Firebase en une seule fois.
// Usage : ouvrir la console sur historique.html (admin connecte) et taper :
//   await repairFirebaseStats()      → repare et pousse vers Firebase
//   await repairFirebaseStats(true)  → dry-run, ne modifie rien
window.repairFirebaseStats = async function(dryRun) {
    if (typeof FirebaseSync === 'undefined' || !FirebaseSync.isConfigured()) {
        console.error('[Repair] Firebase non configure');
        return;
    }
    if (!dryRun && !FirebaseSync.isAdmin()) {
        console.error('[Repair] Vous devez etre connecte en admin pour ecrire dans Firebase');
        return;
    }

    console.log('[Repair] Chargement des matchs depuis Firebase...');
    var snapshot = await db.collection('matches').where('status', '==', 'completed').get();
    var matches = [];
    snapshot.forEach(function(doc) { matches.push(doc.data()); });
    console.log('[Repair] ' + matches.length + ' matchs completed trouves');

    var repairedCount = 0;
    for (var mi = 0; mi < matches.length; mi++) {
        var match = matches[mi];
        if (!match.sets) continue;
        var matchRepaired = false;
        match.sets.forEach(function(set) {
            if (StatsRepair.needsRepair(set)) {
                StatsRepair.repairSetStats(set);
                matchRepaired = true;
            }
        });
        if (matchRepaired) {
            repairedCount++;
            if (dryRun) {
                console.log('[Repair DRY-RUN] A reparer :', match.opponent, '(' + match.id + ')');
            } else {
                await FirebaseSync.saveMatchAny(match);
                console.log('[Repair] Repare et pousse :', match.opponent, '(' + match.id + ')');
            }
        }
    }
    console.log('[Repair] Termine : ' + repairedCount + '/' + matches.length + ' match(s) ' + (dryRun ? 'a reparer' : 'repare(s)'));
    return repairedCount;
};

// Fonction pour exporter un backup Firebase depuis la console.
// Usage : await exportFirebaseBackup()
window.exportFirebaseBackup = async function() {
    if (typeof db === 'undefined') { console.error('Firebase non disponible'); return; }
    var snapshot = await db.collection('matches').get();
    var matches = [];
    snapshot.forEach(function(doc) { matches.push(doc.data()); });
    var json = JSON.stringify(matches, null, 2);
    var blob = new Blob([json], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    var ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    a.download = 'firestore_backup_' + ts + '.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    console.log('[Backup] Exporte ' + matches.length + ' matchs (' + json.length + ' bytes)');
};

// ==================== IMPACT +/- CALCULATOR ====================
const PlusMinusCalculator = {

    _initRecord() {
        return {
            ptsPlayed: 0, setsPlayed: 0, proratedSets: 0, teamScored: 0, teamConceded: 0, plusMinus: 0,
            offPtsPlayed: 0, offTeamScored: 0, offTeamConceded: 0,
            ace: 0, attplus: 0, blcplus: 0, defplus: 0,
            fser: 0, fatt: 0, bp: 0, frec: 0, fdef: 0, defminus: 0, fblc: 0, fp: 0,
            recWinner: 0, passWinner: 0, defWinner: 0,
            // Champs qualite extraits de set.stats
            splus: 0, r4: 0, r3: 0, r2: 0, r1: 0, p4: 0, p3: 0, p1: 0,
            relplus: 0, relminus: 0, frel: 0, blcminus: 0,
            servTot: 0, recSumAdv: 0, recCountAdv: 0, defTot: 0, neutralDef: 0,
            // Derives
            dirPlus: 0, dirMinus: 0, direct: 0, indirect: 0, servBonus: 0,
            roster: 0, onOff: null, influence: null,
            techServ: 0, techRec: 0, techPasse: 0, techAtt: 0, techRel: 0, techDef: 0, techBlc: 0, techDefBlc: 0,
            servImpact: 0, recImpact: 0, pasImpact: 0,
            attImpact: 0, defImpact: 0, blcImpact: 0
        };
    },

    compute(sets, team) {
        var self = this;
        var results = {};

        // Pre-collecter tous les joueurs de tous les sets (pour off-court tracking)
        var allPlayersMap = {};
        var lineupCache = [];
        sets.forEach(function(set) {
            if (!set.points || set.points.length === 0) {
                lineupCache.push(null);
                return;
            }
            var lineups = self._getLineupAtEachPoint(set, team);
            lineupCache.push(lineups);
            lineups.forEach(function(lineup) {
                if (lineup) lineup.forEach(function(name) { allPlayersMap[name] = true; });
            });
        });
        var allPlayerNames = Object.keys(allPlayersMap);
        // Initialiser les records pour tous les joueurs
        allPlayerNames.forEach(function(name) {
            if (!results[name]) results[name] = self._initRecord();
        });

        sets.forEach(function(set, setIdx) {
            if (!set.points || set.points.length === 0) return;

            var lineups = lineupCache[setIdx];

            // Tracker qui a joue dans ce set (pour setsPlayed)
            var playedInSet = {};

            set.points.forEach(function(point, pi) {
                var onCourt = lineups[pi];
                if (!onCourt || onCourt.length === 0) return;

                // Qui a marque ce point ? (tenir compte des points de mixite initiaux)
                var prevHome = pi > 0 ? set.points[pi - 1].homeScore : (set.initialHomeScore || 0);
                var prevAway = pi > 0 ? set.points[pi - 1].awayScore : (set.initialAwayScore || 0);
                var homeScored = point.homeScore > prevHome;
                var teamScored = (team === 'home') ? homeScored : !homeScored;

                // Maj ptsPlayed / teamScored / teamConceded pour chaque joueur sur le terrain
                onCourt.forEach(function(name) {
                    if (!results[name]) results[name] = self._initRecord();
                    var r = results[name];
                    r.ptsPlayed++;
                    if (teamScored) r.teamScored++;
                    else r.teamConceded++;
                    playedInSet[name] = true;
                });

                // Off-court : joueurs du match qui sont sur le banc
                allPlayerNames.forEach(function(name) {
                    if (onCourt.indexOf(name) === -1) {
                        var r = results[name];
                        r.offPtsPlayed++;
                        if (teamScored) r.offTeamScored++;
                        else r.offTeamConceded++;
                    }
                });

                // Contributions directes depuis le rally
                var contribs = self._scanRally(point.rally || [], team, teamScored);
                Object.keys(contribs).forEach(function(name) {
                    if (!results[name]) results[name] = self._initRecord();
                    var r = results[name];
                    var c = contribs[name];
                    var fields = ['ace', 'attplus', 'blcplus', 'defplus', 'fser', 'fatt', 'bp', 'frec', 'fdef', 'defminus', 'fblc', 'fp', 'recWinner', 'passWinner', 'defWinner'];
                    fields.forEach(function(k) { r[k] += (c[k] || 0); });
                });
            });

            // Incrementer setsPlayed pour chaque joueur ayant joue dans ce set
            Object.keys(playedInSet).forEach(function(name) {
                if (results[name]) results[name].setsPlayed++;
            });

            // Extraire stats qualite depuis set.stats (champs non couverts par _scanRally)
            var totalPtsInSet = set.points.length;
            if (totalPtsInSet >= 20) {
                var teamStats = (set.stats && set.stats[team]) || {};
                Object.keys(playedInSet).forEach(function(name) {
                    var r = results[name];
                    var ps = teamStats[name];
                    if (!ps) return;
                    // Compter les points joues dans ce set par ce joueur (pour prorata)
                    var ptsInSet = 0;
                    for (var pp = 0; pp < totalPtsInSet; pp++) {
                        if (lineups[pp] && lineups[pp].indexOf(name) >= 0) ptsInSet++;
                    }
                    r.proratedSets += ptsInSet / totalPtsInSet;
                    // Service : splus, servTot, recSumAdv, recCountAdv
                    r.splus += (ps.service && ps.service.splus) || 0;
                    r.servTot += (ps.service && ps.service.tot) || 0;
                    r.recSumAdv += (ps.service && ps.service.recSumAdv) || 0;
                    r.recCountAdv += (ps.service && ps.service.recCountAdv) || 0;
                    // Reception : r4, r3, r2, r1
                    r.r4 += (ps.reception && ps.reception.r4) || 0;
                    r.r3 += (ps.reception && ps.reception.r3) || 0;
                    r.r2 += (ps.reception && ps.reception.r2) || 0;
                    r.r1 += (ps.reception && ps.reception.r1) || 0;
                    // Passe : p4, p3, p1
                    r.p4 += (ps.pass && ps.pass.p4) || 0;
                    r.p3 += (ps.pass && ps.pass.p3) || 0;
                    r.p1 += (ps.pass && ps.pass.p1) || 0;
                    // Relance : relplus, relminus, frel
                    r.relplus += (ps.relance && ps.relance.relplus) || 0;
                    r.relminus += (ps.relance && ps.relance.relminus) || 0;
                    r.frel += (ps.relance && ps.relance.frel) || 0;
                    // Bloc : blcminus
                    r.blcminus += (ps.block && ps.block.blcminus) || 0;
                    // Defense : defplus, defminus, fdef, defTot (source de verite = set.stats)
                    r.defplus += (ps.defense && ps.defense.defplus) || 0;
                    r.defminus += (ps.defense && ps.defense.defminus) || 0;
                    r.fdef += (ps.defense && ps.defense.fdef) || 0;
                    r.defTot += (ps.defense && ps.defense.tot) || 0;
                });
            }
        });

        // Calcul des derives
        Object.keys(results).forEach(function(name) {
            var r = results[name];
            r.plusMinus = r.teamScored - r.teamConceded;
            // Defense neutre
            r.neutralDef = Math.max(0, r.defTot - r.defplus - r.defminus - r.fdef);
            // New Direct
            r.dirPlus = (r.ace + r.splus) + r.attplus + r.blcplus;
            r.dirMinus = r.fser + (r.fatt + r.bp) + r.fblc;
            r.direct = r.dirPlus - r.dirMinus;
            // Service bonus
            var moyRecAdv = (r.recCountAdv + r.ace) > 0 ? r.recSumAdv / (r.recCountAdv + r.ace) : 3;
            r.servBonus = r.servTot > 0 ? r.servTot * (3 - moyRecAdv) / 19 : 0;
            // New Indirect (passe /3, R2 negatif, D neutre = 0)
            var indPlus = (r.r4 + r.r3) + (r.p4 + r.p3) / 3 + r.relplus + r.relminus + r.defplus + r.blcminus;
            var indMinus = r.r2 + r.r1 + r.frec + (r.p1 + r.fp) / 3 + r.frel + r.defminus + r.fdef;
            r.indirect = indPlus - indMinus + r.servBonus;
            // Impact Technique
            r.techServ = (r.ace + r.splus - r.fser) + r.servBonus;
            r.techRec = r.r4 + r.r3 - r.r2 - r.r1 - r.frec;
            r.techPasse = r.p4 + r.p3 - r.p1 - r.fp;
            r.techAtt = r.attplus - r.fatt - r.bp;
            r.techRel = r.relplus + r.relminus - r.frel;
            r.techDef = (r.relplus + r.relminus - r.frel) + (r.defplus - r.defminus - r.fdef);
            r.techBlc = r.blcplus + r.blcminus - r.fblc;
            r.techDefBlc = r.techDef + r.techBlc;
            // On/Off (conserve pour backward compat)
            if (r.offPtsPlayed > 0 && r.ptsPlayed > 0) {
                var offRate = (r.offTeamScored - r.offTeamConceded) / r.offPtsPlayed;
                r.onOff = r.plusMinus - offRate * r.ptsPlayed;
                r.influence = r.onOff - 0.5 * (r.dirPlus - r.dirMinus);
            } else {
                r.onOff = null;
                r.influence = null;
            }
            r.servImpact = r.ace - r.fser;
            r.recImpact = r.recWinner - r.frec;
            r.pasImpact = r.passWinner - r.fp;
            r.attImpact = r.attplus - r.fatt - r.bp;
            r.defImpact = r.defplus + r.defWinner - r.fdef - r.defminus;
            r.blcImpact = r.blcplus - r.fblc;
        });

        return results;
    },

    _getLineupAtEachPoint(set, team) {
        var lineupKey = (team === 'home') ? 'initialHomeLineup' : 'initialAwayLineup';
        var fallbackKey = (team === 'home') ? 'homeLineup' : 'awayLineup';
        var initialLineup = set[lineupKey] || set[fallbackKey] || {};
        var initialPlayers = Object.values(initialLineup).filter(function(p) { return p !== null && p !== undefined; });

        var subs = (set.substitutions || []).filter(function(s) { return s.team === team; });
        subs.sort(function(a, b) { return a.pointIndex - b.pointIndex; });

        var totalPoints = (set.points || []).length;
        if (totalPoints === 0) return [];

        // Detecter les joueurs non enregistres dans les subs mais presents dans les rallies
        // (meme pattern que PlayingTimeView fallback)
        var registeredPlayers = {};
        initialPlayers.forEach(function(p) { registeredPlayers[p] = true; });
        subs.forEach(function(s) { registeredPlayers[s.playerIn] = true; registeredPlayers[s.playerOut] = true; });

        // Joueurs dans le lineup final (source de verite pour les subs non enregistrees)
        var finalLineup = set[fallbackKey] || {};
        var finalPlayers = {};
        Object.values(finalLineup).forEach(function(p) { if (p) finalPlayers[p] = true; });

        var unregistered = {}; // name -> { firstPt, lastPt, count }
        (set.points || []).forEach(function(pt, pi) {
            (pt.rally || []).forEach(function(a) {
                if (a.team === team && a.player && !registeredPlayers[a.player]) {
                    if (!unregistered[a.player]) unregistered[a.player] = { firstPt: pi, lastPt: pi, count: 1 };
                    else { unregistered[a.player].lastPt = pi; unregistered[a.player].count++; }
                }
            });
        });

        // Filtrer : garder uniquement les joueurs dans le lineup final OU avec 3+ actions
        // (exclut les joueurs adverses avec 1 action mal taguee)
        Object.keys(unregistered).forEach(function(name) {
            if (!finalPlayers[name] && unregistered[name].count < 3) {
                delete unregistered[name];
            }
        });

        // Convertir en subs inferees : entree au firstPt, et chercher qui a ete remplace
        var inferredSubs = [];
        Object.keys(unregistered).forEach(function(name) {
            var info = unregistered[name];
            // Trouver qui ce joueur a remplace : chercher un joueur initial absent des rallies apres firstPt
            var replacedPlayer = null;
            var bestScore = -1;
            initialPlayers.forEach(function(ip) {
                if (registeredPlayers[ip] && !unregistered[ip]) {
                    // Compter les actions de ce joueur initial APRES le firstPt du non-enregistre
                    var actionsAfter = 0;
                    for (var p = info.firstPt; p < totalPoints; p++) {
                        (set.points[p].rally || []).forEach(function(a) {
                            if (a.team === team && a.player === ip) actionsAfter++;
                        });
                    }
                    // Le joueur initial avec le moins d'actions apres est probablement celui remplace
                    if (replacedPlayer === null || actionsAfter < bestScore) {
                        bestScore = actionsAfter;
                        replacedPlayer = ip;
                    }
                }
            });
            inferredSubs.push({ pointIndex: info.firstPt, playerIn: name, playerOut: replacedPlayer || '' });
        });

        // Fusionner subs enregistrees + inferees, trier par pointIndex
        var allSubs = subs.concat(inferredSubs);
        allSubs.sort(function(a, b) { return a.pointIndex - b.pointIndex; });

        // Construire le lineup a chaque point
        var currentOnCourt = initialPlayers.slice();
        var lineups = [];
        var subIdx = 0;

        for (var pi = 0; pi < totalPoints; pi++) {
            while (subIdx < allSubs.length && allSubs[subIdx].pointIndex <= pi) {
                var sub = allSubs[subIdx];
                var idx = currentOnCourt.indexOf(sub.playerOut);
                if (idx >= 0) {
                    currentOnCourt[idx] = sub.playerIn;
                } else {
                    currentOnCourt.push(sub.playerIn);
                }
                subIdx++;
            }
            lineups[pi] = currentOnCourt.slice();
        }

        return lineups;
    },

    _scanRally(rally, team, teamWonPoint) {
        var contribs = {};
        var self = this;

        function ensure(name) {
            if (!contribs[name]) contribs[name] = {
                ace: 0, attplus: 0, blcplus: 0, defplus: 0,
                fser: 0, fatt: 0, bp: 0, frec: 0, fdef: 0, defminus: 0, fblc: 0, fp: 0,
                recWinner: 0, passWinner: 0, defWinner: 0
            };
            return contribs[name];
        }

        for (var i = 0; i < rally.length; i++) {
            var action = rally[i];
            if (action.team !== team || !action.player) continue;
            var c = ensure(action.player);

            switch (action.type) {
                case 'service':
                    if (action.result === 'ace') c.ace++;
                    else if (action.result === 'fault' || action.result === 'fault_out' || action.result === 'fault_net') c.fser++;
                    break;

                case 'reception':
                    if (action.isDirectReturnWinner) {
                        c.recWinner++;
                    } else if (action.quality && (action.quality.label === 'Faute' || action.quality.score === 0)) {
                        c.frec++;
                    } else if (action.isDirectReturn && !action.isDirectReturnWinner) {
                        if (StatsRepair._isDirectReturnExploited(rally, i, action.team)) c.frec++;
                    }
                    break;

                case 'pass':
                    if (action.attackType === 'relance' || action.passType === 'relance') break;
                    if (action.isDirectReturnWinner) {
                        c.passWinner++;
                    } else if (action.isDirectReturn) {
                        if (StatsRepair._isDirectReturnExploited(rally, i, action.team)) {
                            c.fp++;
                        } else if (teamWonPoint && self._isLastTeamAction(rally, i, team)) {
                            c.passWinner++;
                        }
                    } else if (!action.endPos || action.endPos.courtSide === 'net') {
                        c.fp++;
                    }
                    break;

                case 'attack':
                    if (action.attackType === 'relance') break;
                    if (action.attackType === 'faute' || action.result === 'fault_net' || action.result === 'out') {
                        c.fatt++;
                    } else if (action.result === 'point' || action.result === 'bloc_out') {
                        c.attplus++;
                    } else if (action.result === 'blocked') {
                        c.bp++;
                    } else if (action.result === 'defended') {
                        var oppTeam = team === 'home' ? 'away' : 'home';
                        var outcome = StatsRepair._analyzeAfterDefended(rally, i, oppTeam);
                        if (outcome === 'blocked') c.bp++;
                        else if (outcome !== 'continued') c.attplus++;
                    }
                    break;

                case 'defense': {
                    // defplus/defminus/fdef sont extraits de set.stats (source de verite)
                    // _scanRally ne compte que defWinner (retour direct gagnant)
                    if (action.isDirectReturnWinner) {
                        c.defWinner++;
                    }
                    break;
                }

                case 'block':
                    if (action.result === 'bloc_out') {
                        c.fblc++;
                    } else if (action.result === 'kill' || action.result === 'point') {
                        c.blcplus++;
                    } else if (!action.passThrough) {
                        var isBlockKill = false;
                        for (var bk = i + 1; bk < rally.length; bk++) {
                            if (rally[bk].type === 'defense') {
                                if (rally[bk].result === 'fault' && rally[bk].team !== team) isBlockKill = true;
                                break;
                            }
                            if (rally[bk].type === 'pass' || rally[bk].type === 'attack') break;
                        }
                        if (isBlockKill) c.blcplus++;
                    }
                    break;
            }
        }

        return contribs;
    },

    _isLastTeamAction(rally, index, team) {
        for (var i = index + 1; i < rally.length; i++) {
            if (rally[i].team === team && rally[i].player) return false;
        }
        return true;
    },

    aggregateAcrossMatches(matches, team) {
        var self = this;
        var combined = {};

        // Filtrer les matchs sans rallies (0 points total)
        var validMatches = matches.filter(function(m) {
            var totalRallies = 0;
            (m.sets || []).forEach(function(s) {
                if (s.completed && s.points) totalRallies += s.points.length;
            });
            return totalRallies > 0;
        });

        validMatches.forEach(function(match) {
            var completedSets = (match.sets || []).filter(function(s) { return s.completed; });
            if (completedSets.length === 0) return;

            var matchData = self.compute(completedSets, team);
            Object.keys(matchData).forEach(function(name) {
                if (!combined[name]) combined[name] = self._initRecord();
                var dst = combined[name];
                var src = matchData[name];
                var rawFields = ['ptsPlayed', 'setsPlayed', 'proratedSets', 'teamScored', 'teamConceded',
                    'offPtsPlayed', 'offTeamScored', 'offTeamConceded',
                    'ace', 'attplus', 'blcplus', 'defplus', 'fser', 'fatt', 'bp', 'frec', 'fdef', 'defminus', 'fblc', 'fp',
                    'recWinner', 'passWinner', 'defWinner',
                    'splus', 'r4', 'r3', 'r2', 'r1', 'p4', 'p3', 'p1',
                    'relplus', 'relminus', 'frel', 'blcminus',
                    'servTot', 'recSumAdv', 'recCountAdv', 'defTot'];
                rawFields.forEach(function(k) { dst[k] += src[k]; });
            });
        });

        // Recalcul des derives
        Object.keys(combined).forEach(function(name) {
            var r = combined[name];
            r.plusMinus = r.teamScored - r.teamConceded;
            r.neutralDef = Math.max(0, r.defTot - r.defplus - r.defminus - r.fdef);
            // New Direct
            r.dirPlus = (r.ace + r.splus) + r.attplus + r.blcplus;
            r.dirMinus = r.fser + (r.fatt + r.bp) + r.fblc;
            r.direct = r.dirPlus - r.dirMinus;
            // Service bonus
            var moyRecAdv = (r.recCountAdv + r.ace) > 0 ? r.recSumAdv / (r.recCountAdv + r.ace) : 3;
            r.servBonus = r.servTot > 0 ? r.servTot * (3 - moyRecAdv) / 19 : 0;
            // New Indirect (passe /3, R2 negatif, D neutre = 0)
            var indPlus = (r.r4 + r.r3) + (r.p4 + r.p3) / 3 + r.relplus + r.relminus + r.defplus + r.blcminus;
            var indMinus = r.r2 + r.r1 + r.frec + (r.p1 + r.fp) / 3 + r.frel + r.defminus + r.fdef;
            r.indirect = indPlus - indMinus + r.servBonus;
            // Impact Technique
            r.techServ = (r.ace + r.splus - r.fser) + r.servBonus;
            r.techRec = r.r4 + r.r3 - r.r2 - r.r1 - r.frec;
            r.techPasse = r.p4 + r.p3 - r.p1 - r.fp;
            r.techAtt = r.attplus - r.fatt - r.bp;
            r.techRel = r.relplus + r.relminus - r.frel;
            r.techDef = (r.relplus + r.relminus - r.frel) + (r.defplus - r.defminus - r.fdef);
            r.techBlc = r.blcplus + r.blcminus - r.fblc;
            r.techDefBlc = r.techDef + r.techBlc;
            // On/Off (conserve pour backward compat)
            if (r.offPtsPlayed > 0 && r.ptsPlayed > 0) {
                var offRate = (r.offTeamScored - r.offTeamConceded) / r.offPtsPlayed;
                r.onOff = r.plusMinus - offRate * r.ptsPlayed;
                r.influence = r.onOff - 0.5 * (r.dirPlus - r.dirMinus);
            } else {
                r.onOff = null;
                r.influence = null;
            }
            r.servImpact = r.ace - r.fser;
            r.recImpact = r.recWinner - r.frec;
            r.pasImpact = r.passWinner - r.fp;
            r.attImpact = r.attplus - r.fatt - r.bp;
            r.defImpact = r.defplus + r.defWinner - r.fdef - r.defminus;
            r.blcImpact = r.blcplus - r.fblc;
        });

        // --- Roster saisonnier : force des coequipiers point-par-point ---
        // Phase 1 : seasonDirectPerSet pour chaque joueur
        var seasonDirPerSet = {};
        Object.keys(combined).forEach(function(name) {
            var r = combined[name];
            seasonDirPerSet[name] = r.proratedSets > 0 ? r.direct / r.proratedSets : 0;
        });

        // Phase 2 : parcourir chaque match > set > point pour accumuler co-players' strength
        var rosterSum = {};  // name -> sum of co-players' seasonDirPerSet
        var rosterWeight = {};  // name -> total co-player count
        Object.keys(combined).forEach(function(name) { rosterSum[name] = 0; rosterWeight[name] = 0; });

        validMatches.forEach(function(match) {
            var completedSets = (match.sets || []).filter(function(s) { return s.completed; });
            completedSets.forEach(function(set) {
                if (!set.points || set.points.length < 20) return;
                var lineups = self._getLineupAtEachPoint(set, team);
                for (var pi = 0; pi < lineups.length; pi++) {
                    var onCourt = lineups[pi];
                    if (!onCourt || onCourt.length < 2) continue;
                    onCourt.forEach(function(name) {
                        if (!combined[name]) return;
                        onCourt.forEach(function(coPlayer) {
                            if (coPlayer !== name && seasonDirPerSet[coPlayer] !== undefined) {
                                rosterSum[name] += seasonDirPerSet[coPlayer];
                                rosterWeight[name]++;
                            }
                        });
                    });
                }
            });
        });

        // Phase 3 : roster = weighted average
        Object.keys(combined).forEach(function(name) {
            combined[name].roster = rosterWeight[name] > 0 ? rosterSum[name] / rosterWeight[name] : 0;
        });

        return combined;
    }
};

// ==================== RELATION PASSE/ATTAQUE (V23) ====================
const PassAttackAnalyzer = {

    // Couleurs des zones d'attaque (2 zones en 4v4 : pas de centre)
    ZONE_COLORS: { 'R4': '#3b82f6', 'Pointu': '#10b981' },

    // Etat du toggle contexte (Recep / Def / Tot)
    _contextFilter: 'all', // 'reception' | 'defense' | 'all'

    // --- Helpers portes depuis match-live-helpers.js ---

    _getCourtSide(team, cameraSide) {
        if (cameraSide === 'home') {
            return team === 'home' ? 'bottom' : 'top';
        } else {
            return team === 'home' ? 'top' : 'bottom';
        }
    },

    _getPassZone(endPos, team, cameraSide) {
        if (!endPos || endPos.x === undefined) return null;
        var courtSide = this._getCourtSide(team, cameraSide);
        var x = endPos.x;
        // 2 zones seulement en 4v4 (pas d'attaque centrale)
        if (courtSide === 'bottom') {
            return x < 50 ? 'R4' : 'Pointu';
        } else {
            return x < 50 ? 'Pointu' : 'R4';
        }
    },

    // 3 zones pour le renversement : R4 (40%) | Centre (20%) | Pointu (40%)
    // Le centre est une zone neutre = passe classique
    _getReversalZone(endPos, team, cameraSide) {
        if (!endPos || endPos.x === undefined) return null;
        var courtSide = this._getCourtSide(team, cameraSide);
        var x = endPos.x;
        if (courtSide === 'bottom') {
            if (x < 40) return 'R4';
            if (x > 60) return 'Pointu';
            return 'Centre';
        } else {
            if (x < 40) return 'Pointu';
            if (x > 60) return 'R4';
            return 'Centre';
        }
    },

    // Port simplifie de evaluatePassQuality (match-live-helpers.js)
    // Retourne un score 1-4 (P1-P4) ou null si pas de grilles
    _evaluatePassScore(endPos, zone, context, team, cameraSide) {
        if (!endPos || endPos.x === undefined || endPos.y === undefined) return null;
        // Charger grilles depuis localStorage (cache), fallback sur grilles hardcodées
        if (!this._passGrids) {
            try {
                this._passGrids = JSON.parse(localStorage.getItem('volleyball_pass_grids') || 'null');
            } catch(e) { this._passGrids = null; }
            if (!this._passGrids) {
                this._passGrids = PASS_GRIDS_FALLBACK;
            }
        }
        if (!this._passGrids) return null;

        var grid = this._passGrids[zone] && this._passGrids[zone][context];
        if (!grid || !grid[0]) return null;

        var courtSide = this._getCourtSide(team, cameraSide);
        // Distance depuis le filet (0% = filet, 100% = fond)
        var distFromNet = courtSide === 'bottom' ? endPos.y : (100 - endPos.y);
        var GRID_DEPTH = 44; // % du demi-terrain couvert
        var GRID_ROWS = 8;
        var GRID_OVERFLOW = 22.22;

        // Au-dela de la zone de detail → P1
        if (distFromNet > GRID_DEPTH) return 1;

        var totalCols = grid[0].length; // 22 pour R4/Pointu, 18 pour Centre
        var row = Math.min(GRID_ROWS - 1, Math.max(0, Math.floor(distFromNet / GRID_DEPTH * GRID_ROWS)));

        var col;
        if (zone === 'R4' || zone === 'Pointu') {
            var totalWidth = 100 + GRID_OVERFLOW;
            var overflowLeft = (zone === 'R4' && courtSide === 'bottom') || (zone === 'Pointu' && courtSide === 'top');
            var xShifted = overflowLeft ? endPos.x + GRID_OVERFLOW : endPos.x;
            col = Math.min(totalCols - 1, Math.max(0, Math.floor(xShifted / totalWidth * totalCols)));
        } else {
            col = Math.min(totalCols - 1, Math.max(0, Math.floor(endPos.x / 100 * totalCols)));
        }

        // Miroir top court
        if (courtSide === 'top') col = totalCols - 1 - col;

        return (grid[row] && grid[row][col]) || 1;
    },

    // Port de analyzeAfterDefended (match-live.html)
    // Retourne : 'continued' (A-), 'blocked' (BP), 'ended' (A+)
    _analyzeAfterDefended(rally, afterIndex, oppositeTeam) {
        var attackingTeam = oppositeTeam === 'home' ? 'away' : 'home';
        for (var i = afterIndex + 1; i < rally.length; i++) {
            var a = rally[i];
            if (a.team === oppositeTeam) {
                // Defense fault = l'adversaire rate sa defense → l'attaque a force le point
                if (a.type === 'defense' && a.result === 'fault') continue;
                // Block pass-through : la balle traverse le bloc, continuer l'analyse
                if (a.type === 'block' && a.passThrough) continue;
                // Block (non pass-through) : analyser ou va la balle apres
                if (a.type === 'block') {
                    for (var j = i + 1; j < rally.length; j++) {
                        if (rally[j].team === attackingTeam) {
                            // Balle cote attaquant : l'attaquant doit defendre
                            if (rally[j].type === 'defense' && rally[j].result === 'fault') {
                                return 'blocked'; // Defense fault cote attaquant = BP
                            }
                            return 'continued'; // L'equipe recupere le block → A-
                        }
                        // Si la defense du bloqueur rate, balle allee cote adverse → A+
                        if (rally[j].team === oppositeTeam && rally[j].type === 'defense' && rally[j].result === 'fault') {
                            return 'ended';
                        }
                    }
                    return 'blocked'; // Personne ne recupere → BP
                }
                // Toute autre action adverse (pass, attack, defense reussie) = jeu continue
                return 'continued';
            }
        }
        return 'ended';
    },

    // --- Extraction donnees rallies ---

    analyzeSet(set, team) {
        var self = this;
        var cameraSide = set.cameraSide || 'home';
        var points = set.points || [];
        var sequences = [];

        points.forEach(function(point, pointIndex) {
            var rally = point.rally;
            if (!rally || rally.length === 0) return;

            for (var i = 0; i < rally.length; i++) {
                var action = rally[i];
                // Passes de l'equipe (pas relance)
                if (action.type !== 'pass' || action.team !== team) continue;
                if (action.passType === 'relance') continue;

                // Zone de la passe
                var zone = action.endPos
                    ? self._getPassZone(action.endPos, team, cameraSide)
                    : null;

                // Qualite de passe (score 1-4 via grilles calibrees)
                var passScore = null;
                if (zone && action.endPos) {
                    // Contexte simplifie : on utilise 'confort' pour Passeur, 'transition' pour autres
                    var passContext = (action.role === 'Passeur') ? 'confort' : 'transition';
                    passScore = self._evaluatePassScore(action.endPos, zone, passContext, team, cameraSide);
                }

                // Chercher l'attaque suivante (meme equipe, pas le passeur lui-meme)
                var attackAction = null;
                for (var j = i + 1; j < rally.length; j++) {
                    if (rally[j].team === team && rally[j].type === 'attack') {
                        if (rally[j].player === action.player) continue; // Ignorer passe vers soi-meme (override errone)
                        attackAction = rally[j];
                        break;
                    }
                    if (rally[j].team !== team && rally[j].type !== 'block') break;
                }

                // Contexte amont : reception ou defense ?
                var contextAction = null;
                var contextType = null;
                for (var k = i - 1; k >= 0; k--) {
                    if (rally[k].team === team) {
                        if (rally[k].type === 'reception') {
                            contextAction = rally[k];
                            contextType = 'reception';
                            break;
                        }
                        if (rally[k].type === 'defense') {
                            contextAction = rally[k];
                            contextType = 'defense';
                            break;
                        }
                    }
                }

                // Zone de reception/defense (pour renversement)
                var receptionZone = null;
                if (contextAction && contextAction.endPos) {
                    receptionZone = self._getPassZone(contextAction.endPos, team, cameraSide);
                }

                // Zone 3 bandes pour renversement (reception seulement) : R4 (35%) | Centre (30%) | Pointu (35%)
                // La passe va toujours vers R4 ou Pointu (zone = _getPassZone, 2 zones)
                var recReversalZone = (contextAction && contextAction.endPos)
                    ? self._getReversalZone(contextAction.endPos, team, cameraSide)
                    : null;

                // Determiner le resultat d'attaque categorise
                // Port de analyzeAfterDefended (match-live.html) pour detecter BP
                var attackCat = null;
                if (attackAction) {
                    var isRelance = attackAction.attackType === 'relance';
                    if (!isRelance) {
                        if (attackAction.result === 'point' || attackAction.result === 'bloc_out') {
                            attackCat = 'aplus';
                        } else if (attackAction.result === 'blocked') {
                            attackCat = 'bp';
                        } else if (attackAction.result === 'fault_net' || attackAction.result === 'out' || attackAction.attackType === 'faute') {
                            attackCat = 'fa';
                        } else if (attackAction.result === 'defended') {
                            // Analyser la suite du rally (port de analyzeAfterDefended)
                            var afterIdx = rally.indexOf(attackAction);
                            var otherTeam = team === 'home' ? 'away' : 'home';
                            var outcome = self._analyzeAfterDefended(rally, afterIdx, otherTeam);
                            if (outcome === 'blocked') {
                                attackCat = 'bp';
                            } else if (outcome === 'continued') {
                                attackCat = 'aminus';
                            } else {
                                attackCat = 'aplus'; // 'ended'
                            }
                        }
                    }
                }

                sequences.push({
                    passer: action.player,
                    passerRole: action.role || null,
                    zone: zone,
                    attacker: attackAction ? attackAction.player : null,
                    attackerRole: attackAction ? (attackAction.role || null) : null,
                    attackResult: attackAction ? attackAction.result : null,
                    attackCat: attackCat,
                    attackType: attackAction ? attackAction.attackType : null,
                    contextType: contextType,
                    contextPlayer: contextAction ? contextAction.player : null,
                    contextRole: contextAction ? (contextAction.role || null) : null,
                    contextQuality: (contextType === 'reception' && contextAction)
                        ? StatsRepair._recQualityToNote(contextAction.quality) : null,
                    receptionZone: receptionZone,
                    recReversalZone: recReversalZone,
                    passScore: passScore,
                    // Renversement (grand cote) : reception cote R4 → passe Pointu, ou inversement
                    isReversal: (zone && recReversalZone
                        && recReversalZone !== 'Centre'
                        && zone !== recReversalZone),
                    // Petit cote : reception cote R4 → passe R4 (meme cote), ou Pointu → Pointu
                    isPetitCote: (zone && recReversalZone
                        && recReversalZone !== 'Centre'
                        && zone === recReversalZone),
                    // Passe classique : reception zone centre (neutre, ni renversement ni petit cote)
                    isClassique: (zone && recReversalZone
                        && recReversalZone === 'Centre'),
                    homeScore: point.homeScore,
                    awayScore: point.awayScore,
                    setIndex: set.number || 0,
                    samePlayerRecAttack: (contextType === 'reception'
                        && contextAction && attackAction
                        && contextAction.player === attackAction.player
                        && contextAction.player !== action.player)
                });
            }
        });

        return sequences;
    },

    analyzeMatch(match, team) {
        var self = this;
        var allSequences = [];
        var sequencesBySet = [];

        (match.sets || []).filter(function(s) { return s.completed; }).forEach(function(set, idx) {
            var setSeqs = self.analyzeSet(set, team);
            setSeqs.forEach(function(s) { s.setIndex = idx; });
            sequencesBySet.push(setSeqs);
            allSequences = allSequences.concat(setSeqs);
        });

        return { all: allSequences, bySet: sequencesBySet };
    },

    // --- Fonctions d'agregation ---

    _filterByContext(sequences, filter) {
        if (filter === 'all') return sequences;
        return sequences.filter(function(s) { return s.contextType === filter; });
    },

    computeDistribution(sequences, filter) {
        var filtered = this._filterByContext(sequences, filter || this._contextFilter);
        var zones = {};
        var self = this;
        Object.keys(self.ZONE_COLORS).forEach(function(z) {
            zones[z] = { total: 0, byAttacker: {}, attackCats: { aplus: 0, aminus: 0, bp: 0, fa: 0 } };
        });
        var unknown = 0;

        filtered.forEach(function(s) {
            if (!s.zone) { unknown++; return; }
            var z = zones[s.zone];
            z.total++;
            if (s.attacker) {
                if (!z.byAttacker[s.attacker]) {
                    z.byAttacker[s.attacker] = { total: 0, attackCats: { aplus: 0, aminus: 0, bp: 0, fa: 0 }, role: s.attackerRole };
                }
                z.byAttacker[s.attacker].total++;
                if (s.attackCat) z.byAttacker[s.attacker].attackCats[s.attackCat]++;
            }
            if (s.attackCat) z.attackCats[s.attackCat]++;
        });

        return { zones: zones, total: filtered.length, unknown: unknown };
    },

    computeSamePlayerRecAttack(sequences) {
        // Filtrer : receptions R4/R3 uniquement (R2/R1/FR = pas de vrai choix du passeur)
        // + faites par des attaquants (R4/Pointu) uniquement
        var allRecSeqs = sequences.filter(function(s) {
            return s.contextType === 'reception' && s.attacker
                && s.contextRole && s.contextRole !== 'Passeur' && s.contextRole !== 'Centre';
        });
        // DEBUG: vérifier les valeurs de contextQuality
        var qualCounts = { null_: 0, q0: 0, q1: 0, q2: 0, q3: 0, q4: 0 };
        allRecSeqs.forEach(function(s) {
            if (s.contextQuality === null || s.contextQuality === undefined) qualCounts.null_++;
            else qualCounts['q' + s.contextQuality]++;
        });
        console.log('[RecAtt] contextQuality distribution:', JSON.stringify(qualCounts), 'total:', allRecSeqs.length);
        var recSeqs = allRecSeqs.filter(function(s) {
            return s.contextQuality !== null && s.contextQuality >= 3;
        });
        var samePlayer = recSeqs.filter(function(s) { return s.samePlayerRecAttack; });

        // Stats par joueur (recepteur)
        var byPlayer = {};
        recSeqs.forEach(function(s) {
            var name = s.contextPlayer;
            if (!name) return;
            if (!byPlayer[name]) byPlayer[name] = { total: 0, same: 0, role: s.contextRole };
            byPlayer[name].total++;
            if (s.samePlayerRecAttack) byPlayer[name].same++;
        });

        return {
            total: recSeqs.length,
            samePlayer: samePlayer.length,
            percent: recSeqs.length > 0 ? Math.round(samePlayer.length / recSeqs.length * 100) : 0,
            byPlayer: byPlayer
        };
    },

    computeReversals(sequences) {
        // Eligible = passes ou zone de passe ET zone reception 3 bandes sont connues
        var eligible = sequences.filter(function(s) {
            return s.zone && s.recReversalZone;
        });
        // Renversement (grand cote) : reception extreme → passe cote oppose
        var reversals = eligible.filter(function(s) { return s.isReversal; });
        // Petit cote : reception extreme → passe meme cote
        var petitCote = eligible.filter(function(s) { return s.isPetitCote; });
        // Passe classique : reception zone centre (neutre)
        var classique = eligible.filter(function(s) { return s.isClassique; });

        // Stats completes pour un groupe de sequences
        function computeStats(seqs) {
            var total = seqs.length;
            if (total === 0) return { total: 0, quality: null, aplus: 0, aminus: 0, fabp: 0, aplusPct: 0, aminusPct: 0, fabpPct: 0 };
            var aplus = seqs.filter(function(s) { return s.attackCat === 'aplus'; }).length;
            var aminus = seqs.filter(function(s) { return s.attackCat === 'aminus'; }).length;
            var fa = seqs.filter(function(s) { return s.attackCat === 'fa'; }).length;
            var bp = seqs.filter(function(s) { return s.attackCat === 'bp'; }).length;
            var fabp = fa + bp;
            var scored = seqs.filter(function(s) { return s.passScore !== null; });
            var qualSum = 0;
            scored.forEach(function(s) { qualSum += s.passScore; });
            var quality = scored.length > 0 ? Math.round(qualSum / scored.length * 10) / 10 : null;
            return {
                total: total, quality: quality,
                aplus: aplus, aminus: aminus, fabp: fabp,
                aplusPct: Math.round(aplus / total * 100),
                aminusPct: Math.round(aminus / total * 100),
                fabpPct: Math.round(fabp / total * 100)
            };
        }

        // Par destination (R4 / Pointu)
        var r4All = eligible.filter(function(s) { return s.zone === 'R4'; });
        var pointuAll = eligible.filter(function(s) { return s.zone === 'Pointu'; });
        var r4Grand = r4All.filter(function(s) { return s.isReversal; });
        var r4Petit = r4All.filter(function(s) { return s.isPetitCote; });
        var r4Classique = r4All.filter(function(s) { return s.isClassique; });
        var pointuGrand = pointuAll.filter(function(s) { return s.isReversal; });
        var pointuPetit = pointuAll.filter(function(s) { return s.isPetitCote; });
        var pointuClassique = pointuAll.filter(function(s) { return s.isClassique; });

        return {
            eligible: eligible.length,
            total: computeStats(eligible),
            r4: computeStats(r4All),
            r4Grand: computeStats(r4Grand),
            r4Petit: computeStats(r4Petit),
            r4Classique: computeStats(r4Classique),
            pointu: computeStats(pointuAll),
            pointuGrand: computeStats(pointuGrand),
            pointuPetit: computeStats(pointuPetit),
            pointuClassique: computeStats(pointuClassique)
        };
    },

    computeReFeedAfterFailure(match, team) {
        var completedSets = (match.sets || []).filter(function(s) { return s.completed; });
        var results = {};

        completedSets.forEach(function(set) {
            var points = set.points || [];

            for (var p = 0; p < points.length - 1; p++) {
                var rally = points[p].rally;
                if (!rally) continue;

                // Trouver la derniere attaque et le dernier passeur (Passeur uniquement) de l'equipe dans ce rally
                var lastAttack = null;
                var lastPasser = null;
                for (var i = rally.length - 1; i >= 0; i--) {
                    if (rally[i].team === team && rally[i].type === 'attack' && !lastAttack) {
                        lastAttack = rally[i];
                    }
                    if (rally[i].team === team && rally[i].type === 'pass' && rally[i].role === 'Passeur' && !lastPasser) {
                        lastPasser = rally[i];
                    }
                }

                if (!lastAttack || !lastPasser) continue;

                // L'attaque est-elle un echec ?
                var isRelance = lastAttack.attackType === 'relance';
                if (isRelance) continue;

                var isFailure = (lastAttack.result === 'blocked' ||
                    lastAttack.result === 'fault_net' ||
                    lastAttack.result === 'out' ||
                    lastAttack.attackType === 'faute');

                if (lastAttack.result === 'defended') {
                    var otherTeam = team === 'home' ? 'away' : 'home';
                    for (var j = rally.indexOf(lastAttack) + 1; j < rally.length; j++) {
                        if (rally[j].team === otherTeam && rally[j].type === 'pass') {
                            isFailure = true;
                            break;
                        }
                    }
                }

                if (!isFailure) continue;

                // Rally N+1 : meme passeur ?
                var nextRally = points[p + 1].rally;
                if (!nextRally) continue;

                var nextPasser = null, nextAttacker = null;
                for (var k = 0; k < nextRally.length; k++) {
                    if (nextRally[k].team === team && nextRally[k].type === 'pass' && nextRally[k].role === 'Passeur' && !nextPasser) {
                        nextPasser = nextRally[k];
                    }
                    if (nextRally[k].team === team && nextRally[k].type === 'attack' && !nextAttacker) {
                        nextAttacker = nextRally[k];
                    }
                }

                if (!nextPasser || !nextAttacker) continue;
                if (nextPasser.player !== lastPasser.player) continue;

                var passerName = lastPasser.player;
                if (!results[passerName]) {
                    results[passerName] = { reFeed: 0, switch_: 0, reFeedSuccess: 0, switchSuccess: 0, total: 0 };
                }
                results[passerName].total++;

                var isReFeed = (nextAttacker.player === lastAttack.player);
                var nextSuccess = (nextAttacker.result === 'point' || nextAttacker.result === 'bloc_out');

                if (isReFeed) {
                    results[passerName].reFeed++;
                    if (nextSuccess) results[passerName].reFeedSuccess++;
                } else {
                    results[passerName].switch_++;
                    if (nextSuccess) results[passerName].switchSuccess++;
                }
            }
        });

        return results;
    },

    computePressureDistribution(sequences) {
        var pressure = { 'R4': 0, 'Pointu': 0, total: 0 };
        var normal = { 'R4': 0, 'Pointu': 0, total: 0 };
        var pressureBySet = {};
        var normalBySet = {};

        sequences.forEach(function(s) {
            if (!s.zone) return;
            var lead = (s.homeScore || 0) - (s.awayScore || 0); // positif = Jen mene
            var bucket = lead <= 3 ? pressure : normal;
            bucket[s.zone]++;
            bucket.total++;

            // Par set
            var setNum = s.setIndex || 0;
            var bySetMap = lead <= 3 ? pressureBySet : normalBySet;
            if (!bySetMap[setNum]) bySetMap[setNum] = { 'R4': 0, 'Pointu': 0, total: 0 };
            bySetMap[setNum][s.zone]++;
            bySetMap[setNum].total++;
        });

        return { pressure: pressure, normal: normal, pressureBySet: pressureBySet, normalBySet: normalBySet };
    },

    computeDistributionBySet(sequencesBySet) {
        return sequencesBySet.map(function(setSeqs) {
            var zones = { 'R4': 0, 'Pointu': 0 };
            setSeqs.forEach(function(s) { if (s.zone) zones[s.zone]++; });
            return zones;
        });
    },

    // --- Rendering ---

    renderForMatch(match, team) {
        var data = this.analyzeMatch(match, team);
        if (data.all.length === 0) return '';

        var html = '<div class="hist-section pa-section collapsed">';
        html += '<div class="hist-section-title" style="color:#7c3aed">Relation Passe / Attaque</div>';
        html += '<div id="pa-content-match">';
        html += this._renderContent(data, match, team, 'match');
        html += '</div>';
        html += '</div>';
        return html;
    },

    renderForYear(matches, team) {
        var self = this;
        var allSequences = [];

        matches.forEach(function(match) {
            var data = self.analyzeMatch(match, team);
            allSequences = allSequences.concat(data.all);
        });

        if (allSequences.length === 0) return '';

        var html = '<div class="hist-section pa-section collapsed">';
        html += '<div class="hist-section-title" style="color:#7c3aed">Relation Passe / Attaque</div>';
        html += '<div id="pa-content-year">';
        html += this._renderContent({ all: allSequences, bySet: null }, null, team, 'year');
        html += '</div>';
        html += '</div>';
        return html;
    },

    _renderContent(data, match, team, mode) {
        var html = '';

        // Construire playerRolesMap depuis les sequences pour les pastilles
        var rolesMap = {};
        data.all.forEach(function(s) {
            if (s.attacker && s.attackerRole) {
                if (!rolesMap[s.attacker]) rolesMap[s.attacker] = { primaryRole: s.attackerRole, roles: {} };
                rolesMap[s.attacker].roles[s.attackerRole] = (rolesMap[s.attacker].roles[s.attackerRole] || 0) + 1;
            }
            if (s.passer && s.passerRole) {
                if (!rolesMap[s.passer]) rolesMap[s.passer] = { primaryRole: s.passerRole, roles: {} };
                rolesMap[s.passer].roles[s.passerRole] = (rolesMap[s.passer].roles[s.passerRole] || 0) + 1;
            }
        });
        // Determiner le role principal (le plus frequent)
        Object.keys(rolesMap).forEach(function(name) {
            var roles = rolesMap[name].roles;
            var best = null, bestCount = 0;
            Object.keys(roles).forEach(function(r) { if (roles[r] > bestCount) { best = r; bestCount = roles[r]; } });
            if (best) rolesMap[name].primaryRole = best;
        });
        SharedComponents.playerRolesMap = rolesMap;

        // Separer sequences Passeur vs Transition (non-Passeur)
        var passeurSeqs = data.all.filter(function(s) { return s.passerRole === 'Passeur'; });
        var transitionSeqs = data.all.filter(function(s) { return s.passerRole && s.passerRole !== 'Passeur'; });

        // A. Distribution Passeur (toggle integre dans le titre)
        html += this._renderDistribution(passeurSeqs, mode);

        // B. Distribution Transition
        html += this._renderDistributionTransition(transitionSeqs, mode);

        // C. Enchainement recep/attaque (Passeur uniquement)
        html += this._renderSamePlayerRecAttack(passeurSeqs, mode);

        // D. Renversement (Passeur uniquement)
        html += this._renderReversals(passeurSeqs, mode);

        // E. Mental passeur (Passeur uniquement)
        html += this._renderMentalPasseur(match, team, passeurSeqs, mode);

        // F. Courbe distribution par set (match uniquement, Passeur seulement)
        if (mode === 'match' && data.bySet && data.bySet.length >= 2) {
            var passeurBySet = data.bySet.map(function(setSeqs) {
                return setSeqs.filter(function(s) { return s.passerRole === 'Passeur'; });
            });
            html += this._renderDistributionChart(passeurBySet, match);
        }

        SharedComponents.playerRolesMap = null;
        return html;
    },

    _renderToggle(mode) {
        var f = this._contextFilter;
        var html = '<div class="pa-toggle-bar">';
        html += '<button class="pa-toggle-btn' + (f === 'all' ? ' active' : '') + '" onclick="PassAttackAnalyzer._onToggle(\'all\',\'' + mode + '\')">Tot</button>';
        html += '<button class="pa-toggle-btn' + (f === 'reception' ? ' active' : '') + '" onclick="PassAttackAnalyzer._onToggle(\'reception\',\'' + mode + '\')">Recep</button>';
        html += '<button class="pa-toggle-btn' + (f === 'defense' ? ' active' : '') + '" onclick="PassAttackAnalyzer._onToggle(\'defense\',\'' + mode + '\')">D\u00e9f</button>';
        html += '</div>';
        return html;
    },

    _onToggle(filter, mode) {
        this._contextFilter = filter;
        // Re-render la section
        var containerId = mode === 'match' ? 'pa-content-match' : 'pa-content-year';
        var container = document.getElementById(containerId);
        if (!container) return;

        // Reconstruire les donnees
        if (mode === 'match') {
            var match = MatchStatsView.currentMatch;
            if (!match) return;
            var data = this.analyzeMatch(match, 'home');
            container.innerHTML = this._renderContent(data, match, 'home', 'match');
        } else {
            // Stats Annee : reconstituer depuis les matchs filtres
            var filtered = YearStatsView._lastFiltered || [];
            var self = this;
            var allSeqs = [];
            filtered.forEach(function(m) {
                var d = self.analyzeMatch(m, 'home');
                allSeqs = allSeqs.concat(d.all);
            });
            container.innerHTML = this._renderContent({ all: allSeqs, bySet: null }, null, 'home', 'year');
        }
    },

    // Tri Distribution Passeur — état
    _distSortCol: 'passes', // 'zone','passes','pct','aplus','aminus','fabp','pm'
    _distSortAsc: false,

    _distSortIcon(col) {
        if (this._distSortCol === col) {
            var arrow = this._distSortAsc ? '\u25B2' : '\u25BC';
            return ' <span class="sort-arrow active">' + arrow + '</span>';
        }
        return ' <span class="sort-arrow">\u25BC</span>';
    },

    _getAttackerSortValue(a, col, distTotal) {
        var fabp = (a.attackCats.fa || 0) + (a.attackCats.bp || 0);
        switch (col) {
            case 'passes': return a.total;
            case 'pct': return distTotal > 0 ? a.total / distTotal : 0;
            case 'aplus': return a.total > 0 ? (a.attackCats.aplus || 0) / a.total : 0;
            case 'aminus': return a.total > 0 ? (a.attackCats.aminus || 0) / a.total : 0;
            case 'fabp': return a.total > 0 ? fabp / a.total : 0;
            case 'pm': return (a.attackCats.aplus || 0) - fabp;
            default: return a.total;
        }
    },

    _onDistSort(col, mode, table) {
        var currentCol, currentAsc;
        if (table === 'transition') {
            currentCol = this._distTransSortCol; currentAsc = this._distTransSortAsc;
        } else if (table === 'recatt') {
            currentCol = this._recAttSortCol; currentAsc = this._recAttSortAsc;
        } else if (table === 'reversal') {
            currentCol = this._revSortCol; currentAsc = this._revSortAsc;
        } else {
            currentCol = this._distSortCol; currentAsc = this._distSortAsc;
        }
        var newAsc = (currentCol === col) ? !currentAsc : (col === 'zone' || col === 'player' || col === 'type');
        if (table === 'transition') {
            this._distTransSortCol = col; this._distTransSortAsc = newAsc;
        } else if (table === 'recatt') {
            this._recAttSortCol = col; this._recAttSortAsc = newAsc;
        } else if (table === 'reversal') {
            this._revSortCol = col; this._revSortAsc = newAsc;
        } else {
            this._distSortCol = col; this._distSortAsc = newAsc;
        }
        this._onToggle(this._contextFilter, mode);
    },

    // Tri Distribution Transition — état séparé
    _distTransSortCol: 'passes',
    _distTransSortAsc: false,

    _distTransSortIcon(col) {
        if (this._distTransSortCol === col) {
            var arrow = this._distTransSortAsc ? '\u25B2' : '\u25BC';
            return ' <span class="sort-arrow active">' + arrow + '</span>';
        }
        return ' <span class="sort-arrow">\u25BC</span>';
    },

    _renderDistribution(sequences) {
        var mode = arguments[1] || 'match';
        var dist = this.computeDistribution(sequences, this._contextFilter);
        if (dist.total === 0) return '<div class="pa-subsection"><div class="pa-empty">Aucune donn\u00e9e disponible</div></div>';

        var self = this;
        var html = '<div class="pa-subsection">';
        html += '<div class="pa-subtitle" style="display:flex;align-items:center;justify-content:space-between;">';
        html += '<span style="color:var(--cat-passe)">Distribution Passeur</span>';
        html += this._renderToggle(mode);
        html += '</div>';
        html += '<table class="pa-table pa-dist-table" data-pa-mode="' + mode + '">';
        html += '<thead><tr>';
        html += '<th class="pa-sortable" data-pa-sort="zone">Zone' + self._distSortIcon('zone') + '</th>';
        html += '<th class="pa-sortable" data-pa-sort="passes">Passes' + self._distSortIcon('passes') + '</th>';
        html += '<th class="pa-sortable" data-pa-sort="pct">%' + self._distSortIcon('pct') + '</th>';
        html += '<th class="pa-sortable" data-pa-sort="aplus">A+' + self._distSortIcon('aplus') + '</th>';
        html += '<th class="pa-sortable" data-pa-sort="aminus">A\u2212' + self._distSortIcon('aminus') + '</th>';
        html += '<th class="pa-sortable" data-pa-sort="fabp">FA(BP)' + self._distSortIcon('fabp') + '</th>';
        html += '<th class="pa-sortable" data-pa-sort="pm">+/\u2212' + self._distSortIcon('pm') + '</th>';
        html += '</tr></thead>';
        html += '<tbody>';

        var rolesMap = SharedComponents.playerRolesMap || {};
        Object.keys(self.ZONE_COLORS).forEach(function(zone) {
            var z = dist.zones[zone];
            var pct = dist.total > 0 ? Math.round(z.total / dist.total * 100) : 0;
            var fabp = (z.attackCats.fa || 0) + (z.attackCats.bp || 0);
            var plusMinus = (z.attackCats.aplus || 0) - fabp;
            var zAplusPct = z.total > 0 ? Math.round((z.attackCats.aplus || 0) / z.total * 100) : 0;
            var zAminusPct = z.total > 0 ? Math.round((z.attackCats.aminus || 0) / z.total * 100) : 0;
            var zFabpPct = z.total > 0 ? Math.round(fabp / z.total * 100) : 0;
            html += '<tr class="pa-zone-row">';
            html += '<td><span class="pt-role-header-bar" style="background:' + self.ZONE_COLORS[zone] + '"></span> ' + zone + '</td>';
            html += '<td>' + z.total + '</td>';
            html += '<td>' + pct + '%</td>';
            html += '<td' + (z.attackCats.aplus ? ' class="pa-positive"' : '') + '>' + (z.attackCats.aplus ? zAplusPct + '%' : '-') + '</td>';
            html += '<td>' + (z.attackCats.aminus ? zAminusPct + '%' : '-') + '</td>';
            html += '<td' + (fabp ? ' class="pa-negative"' : '') + '>' + (fabp ? zFabpPct + '%' : '-') + '</td>';
            html += '<td class="' + (plusMinus > 0 ? 'pa-positive' : plusMinus < 0 ? 'pa-negative' : '') + '">' + (plusMinus > 0 ? '+' : '') + plusMinus + '</td>';
            html += '</tr>';

            // Sous-lignes par attaquant — tri par colonne ou par affinité rôle/zone
            var sortCol = self._distSortCol;
            var sortAsc = self._distSortAsc;
            var attackers = Object.keys(z.byAttacker).sort(function(a, b) {
                if (sortCol === 'zone') {
                    // Tri par affinité rôle/zone : pur → principal → secondaire
                    var infoA = rolesMap[a] || {}, infoB = rolesMap[b] || {};
                    var rolesA = Object.keys(infoA.roles || {}), rolesB = Object.keys(infoB.roles || {});
                    var prioA = infoA.primaryRole === zone ? (rolesA.length === 1 ? 0 : 1) : 2;
                    var prioB = infoB.primaryRole === zone ? (rolesB.length === 1 ? 0 : 1) : 2;
                    if (prioA !== prioB) return sortAsc ? prioA - prioB : prioB - prioA;
                    return z.byAttacker[b].total - z.byAttacker[a].total;
                }
                // Tri numérique par colonne
                var va = self._getAttackerSortValue(z.byAttacker[a], sortCol, dist.total);
                var vb = self._getAttackerSortValue(z.byAttacker[b], sortCol, dist.total);
                if (va !== vb) return sortAsc ? va - vb : vb - va;
                return z.byAttacker[b].total - z.byAttacker[a].total;
            });
            attackers.forEach(function(name) {
                var a = z.byAttacker[name];
                var aPct = dist.total > 0 ? Math.round(a.total / dist.total * 100) : 0;
                var aFabp = (a.attackCats.fa || 0) + (a.attackCats.bp || 0);
                var aPlusMinus = (a.attackCats.aplus || 0) - aFabp;
                var aAplusPct = a.total > 0 ? Math.round((a.attackCats.aplus || 0) / a.total * 100) : 0;
                var aAminusPct = a.total > 0 ? Math.round((a.attackCats.aminus || 0) / a.total * 100) : 0;
                var aFabpPct = a.total > 0 ? Math.round(aFabp / a.total * 100) : 0;
                html += '<tr class="pa-player-row">';
                html += '<td><div class="player-cell">' + SharedComponents.renderRoleDots(name) + Utils.escapeHtml(name) + '</div></td>';
                html += '<td>' + a.total + '</td>';
                html += '<td>' + aPct + '%</td>';
                html += '<td' + (a.attackCats.aplus ? ' class="pa-positive"' : '') + '>' + (a.attackCats.aplus ? aAplusPct + '%' : '-') + '</td>';
                html += '<td>' + (a.attackCats.aminus ? aAminusPct + '%' : '-') + '</td>';
                html += '<td' + (aFabp ? ' class="pa-negative"' : '') + '>' + (aFabp ? aFabpPct + '%' : '-') + '</td>';
                html += '<td class="' + (aPlusMinus > 0 ? 'pa-positive' : aPlusMinus < 0 ? 'pa-negative' : '') + '">' + (aPlusMinus > 0 ? '+' : '') + aPlusMinus + '</td>';
                html += '</tr>';
            });
        });

        html += '</tbody></table></div>';
        return html;
    },

    _renderDistributionTransition(sequences, mode) {
        mode = mode || 'match';
        // Quand le Passeur attaque en transition, forcer zone Pointu
        var adjusted = sequences.map(function(s) {
            if (s.attackerRole === 'Passeur' && s.zone !== 'Pointu') {
                var copy = {};
                for (var k in s) copy[k] = s[k];
                copy.zone = 'Pointu';
                return copy;
            }
            return s;
        });
        var dist = this.computeDistribution(adjusted, 'all');
        if (dist.total === 0) return '';

        var self = this;
        var html = '<div class="pa-subsection">';
        html += '<div class="pa-subtitle">Distribution Transition</div>';
        html += '<table class="pa-table pa-dist-table" data-pa-mode="' + mode + '" data-pa-table="transition">';
        html += '<thead><tr>';
        html += '<th class="pa-sortable" data-pa-sort="zone" data-pa-table="transition">Zone' + self._distTransSortIcon('zone') + '</th>';
        html += '<th class="pa-sortable" data-pa-sort="passes" data-pa-table="transition">Passes' + self._distTransSortIcon('passes') + '</th>';
        html += '<th class="pa-sortable" data-pa-sort="pct" data-pa-table="transition">%' + self._distTransSortIcon('pct') + '</th>';
        html += '<th class="pa-sortable" data-pa-sort="aplus" data-pa-table="transition">A+' + self._distTransSortIcon('aplus') + '</th>';
        html += '<th class="pa-sortable" data-pa-sort="aminus" data-pa-table="transition">A\u2212' + self._distTransSortIcon('aminus') + '</th>';
        html += '<th class="pa-sortable" data-pa-sort="fabp" data-pa-table="transition">FA(BP)' + self._distTransSortIcon('fabp') + '</th>';
        html += '<th class="pa-sortable" data-pa-sort="pm" data-pa-table="transition">+/\u2212' + self._distTransSortIcon('pm') + '</th>';
        html += '</tr></thead>';
        html += '<tbody>';

        var rolesMap = SharedComponents.playerRolesMap || {};
        Object.keys(self.ZONE_COLORS).forEach(function(zone) {
            var z = dist.zones[zone];
            var pct = dist.total > 0 ? Math.round(z.total / dist.total * 100) : 0;
            var fabp = (z.attackCats.fa || 0) + (z.attackCats.bp || 0);
            var plusMinus = (z.attackCats.aplus || 0) - fabp;
            var zAplusPct = z.total > 0 ? Math.round((z.attackCats.aplus || 0) / z.total * 100) : 0;
            var zAminusPct = z.total > 0 ? Math.round((z.attackCats.aminus || 0) / z.total * 100) : 0;
            var zFabpPct = z.total > 0 ? Math.round(fabp / z.total * 100) : 0;
            html += '<tr class="pa-zone-row">';
            html += '<td><span class="pt-role-header-bar" style="background:' + self.ZONE_COLORS[zone] + '"></span> ' + zone + '</td>';
            html += '<td>' + z.total + '</td>';
            html += '<td>' + pct + '%</td>';
            html += '<td' + (z.attackCats.aplus ? ' class="pa-positive"' : '') + '>' + (z.attackCats.aplus ? zAplusPct + '%' : '-') + '</td>';
            html += '<td>' + (z.attackCats.aminus ? zAminusPct + '%' : '-') + '</td>';
            html += '<td' + (fabp ? ' class="pa-negative"' : '') + '>' + (fabp ? zFabpPct + '%' : '-') + '</td>';
            html += '<td class="' + (plusMinus > 0 ? 'pa-positive' : plusMinus < 0 ? 'pa-negative' : '') + '">' + (plusMinus > 0 ? '+' : '') + plusMinus + '</td>';
            html += '</tr>';

            // Sous-lignes par attaquant — tri par colonne ou par rôle
            var sortCol = self._distTransSortCol;
            var sortAsc = self._distTransSortAsc;
            var attackers = Object.keys(z.byAttacker).sort(function(a, b) {
                if (sortCol === 'zone') {
                    var infoA = rolesMap[a] || {}, infoB = rolesMap[b] || {};
                    var rolesA = Object.keys(infoA.roles || {}), rolesB = Object.keys(infoB.roles || {});
                    var prioA = infoA.primaryRole === zone ? (rolesA.length === 1 ? 0 : 1) : 2;
                    var prioB = infoB.primaryRole === zone ? (rolesB.length === 1 ? 0 : 1) : 2;
                    if (prioA !== prioB) return sortAsc ? prioA - prioB : prioB - prioA;
                    return z.byAttacker[b].total - z.byAttacker[a].total;
                }
                var va = self._getAttackerSortValue(z.byAttacker[a], sortCol, dist.total);
                var vb = self._getAttackerSortValue(z.byAttacker[b], sortCol, dist.total);
                if (va !== vb) return sortAsc ? va - vb : vb - va;
                return z.byAttacker[b].total - z.byAttacker[a].total;
            });
            attackers.forEach(function(name) {
                var a = z.byAttacker[name];
                var aPct = dist.total > 0 ? Math.round(a.total / dist.total * 100) : 0;
                var aFabp = (a.attackCats.fa || 0) + (a.attackCats.bp || 0);
                var aPlusMinus = (a.attackCats.aplus || 0) - aFabp;
                var aAplusPct = a.total > 0 ? Math.round((a.attackCats.aplus || 0) / a.total * 100) : 0;
                var aAminusPct = a.total > 0 ? Math.round((a.attackCats.aminus || 0) / a.total * 100) : 0;
                var aFabpPct = a.total > 0 ? Math.round(aFabp / a.total * 100) : 0;
                html += '<tr class="pa-player-row">';
                html += '<td><div class="player-cell">' + SharedComponents.renderRoleDots(name) + Utils.escapeHtml(name) + '</div></td>';
                html += '<td>' + a.total + '</td>';
                html += '<td>' + aPct + '%</td>';
                html += '<td' + (a.attackCats.aplus ? ' class="pa-positive"' : '') + '>' + (a.attackCats.aplus ? aAplusPct + '%' : '-') + '</td>';
                html += '<td>' + (a.attackCats.aminus ? aAminusPct + '%' : '-') + '</td>';
                html += '<td' + (aFabp ? ' class="pa-negative"' : '') + '>' + (aFabp ? aFabpPct + '%' : '-') + '</td>';
                html += '<td class="' + (aPlusMinus > 0 ? 'pa-positive' : aPlusMinus < 0 ? 'pa-negative' : '') + '">' + (aPlusMinus > 0 ? '+' : '') + aPlusMinus + '</td>';
                html += '</tr>';
            });
        });

        html += '</tbody></table></div>';
        return html;
    },

    // Tri Enchaînement Réception → Attaque — état
    _recAttSortCol: 'recep',
    _recAttSortAsc: false,

    // Tri Renversement — état
    _revSortCol: 'pct',
    _revSortAsc: false,

    _revSortIcon(col) {
        if (this._revSortCol === col) {
            var arrow = this._revSortAsc ? '\u25B2' : '\u25BC';
            return ' <span class="sort-arrow active">' + arrow + '</span>';
        }
        return ' <span class="sort-arrow">\u25BC</span>';
    },

    _recAttSortIcon(col) {
        if (this._recAttSortCol === col) {
            var arrow = this._recAttSortAsc ? '\u25B2' : '\u25BC';
            return ' <span class="sort-arrow active">' + arrow + '</span>';
        }
        return ' <span class="sort-arrow">\u25BC</span>';
    },

    _renderSamePlayerRecAttack(sequences, mode) {
        mode = mode || 'match';
        var data = this.computeSamePlayerRecAttack(sequences);
        if (data.total === 0) return '';

        var self = this;
        var html = '<div class="pa-subsection">';
        html += '<div class="pa-subtitle">Encha\u00eenement R\u00e9ception \u2192 Attaque</div>';

        // Tableau par joueur
        html += '<table class="pa-table pa-dist-table" data-pa-mode="' + mode + '" data-pa-table="recatt">';
        html += '<thead><tr>';
        html += '<th class="pa-sortable" data-pa-sort="player" data-pa-table="recatt">Joueur' + self._recAttSortIcon('player') + '</th>';
        html += '<th class="pa-sortable" data-pa-sort="recep" data-pa-table="recatt">Recep' + self._recAttSortIcon('recep') + '</th>';
        html += '<th class="pa-sortable" data-pa-sort="chained" data-pa-table="recatt">Encha\u00een\u00e9' + self._recAttSortIcon('chained') + '</th>';
        html += '<th class="pa-sortable" data-pa-sort="pct" data-pa-table="recatt">%' + self._recAttSortIcon('pct') + '</th>';
        html += '</tr></thead>';
        html += '<tbody>';

        var sortCol = this._recAttSortCol;
        var sortAsc = this._recAttSortAsc;
        var rolesMap = SharedComponents.playerRolesMap || {};
        var players = Object.keys(data.byPlayer).sort(function(a, b) {
            if (sortCol === 'player') {
                // Tri par rôle
                var infoA = rolesMap[a] || {}, infoB = rolesMap[b] || {};
                var rolesA = Object.keys(infoA.roles || {}), rolesB = Object.keys(infoB.roles || {});
                var prioA = infoA.primaryRole ? rolesA.length : 99;
                var prioB = infoB.primaryRole ? rolesB.length : 99;
                if (prioA !== prioB) return sortAsc ? prioA - prioB : prioB - prioA;
                return data.byPlayer[b].total - data.byPlayer[a].total;
            }
            var va, vb;
            var pa = data.byPlayer[a], pb = data.byPlayer[b];
            if (sortCol === 'recep') { va = pa.total; vb = pb.total; }
            else if (sortCol === 'chained') { va = pa.same; vb = pb.same; }
            else if (sortCol === 'pct') { va = pa.total > 0 ? pa.same / pa.total : 0; vb = pb.total > 0 ? pb.same / pb.total : 0; }
            else { va = pa.total; vb = pb.total; }
            if (va !== vb) return sortAsc ? va - vb : vb - va;
            return data.byPlayer[b].total - data.byPlayer[a].total;
        });
        players.forEach(function(name) {
            var p = data.byPlayer[name];
            var pct = p.total > 0 ? Math.round(p.same / p.total * 100) : 0;
            html += '<tr class="pa-player-row">';
            html += '<td><div class="player-cell">' + SharedComponents.renderRoleDots(name) + Utils.escapeHtml(name) + '</div></td>';
            html += '<td>' + p.total + '</td>';
            html += '<td>' + p.same + '</td>';
            html += '<td class="pa-positive">' + pct + '%</td>';
            html += '</tr>';
        });

        // Ligne total
        html += '<tr class="pa-zone-row">';
        html += '<td>Total</td>';
        html += '<td>' + data.total + '</td>';
        html += '<td>' + data.samePlayer + '</td>';
        html += '<td class="pa-positive">' + data.percent + '%</td>';
        html += '</tr>';

        html += '</tbody></table></div>';
        return html;
    },

    _renderReversals(sequences, mode) {
        var self = this;
        mode = mode || 'match';
        var data = this.computeReversals(sequences);
        if (data.eligible === 0) return '';

        // Helpers
        function fmtQ(q) { return q !== null ? q.toFixed(1) : '-'; }
        function pct(n, tot) { return tot > 0 ? Math.round(n / tot * 100) + '%' : '-'; }

        // Render une ligne de stats
        function renderRow(cls, label, stats, totalForPct) {
            var row = '<tr class="' + cls + '">';
            row += '<td>' + label + '</td>';
            row += '<td>' + pct(stats.total, totalForPct) + '</td>';
            row += '<td>' + fmtQ(stats.quality) + '</td>';
            row += '<td' + (stats.aplus ? ' class="pa-positive"' : '') + '>' + (stats.aplus ? stats.aplusPct + '%' : '-') + '</td>';
            row += '<td>' + (stats.aminus ? stats.aminusPct + '%' : '-') + '</td>';
            var fabp = stats.fabp;
            row += '<td' + (fabp ? ' class="pa-negative"' : '') + '>' + (fabp ? stats.fabpPct + '%' : '-') + '</td>';
            row += '</tr>';
            return row;
        }

        // Sort value for a sub-row
        function getSortValue(stats, col, zoneTot) {
            switch (col) {
                case 'type': return stats.total; // alphabetical not meaningful, sort by count
                case 'pct': return zoneTot > 0 ? stats.total / zoneTot : 0;
                case 'qual': return stats.quality !== null ? stats.quality : -1;
                case 'aplus': return stats.total > 0 ? (stats.aplus || 0) / stats.total : 0;
                case 'aminus': return stats.total > 0 ? (stats.aminus || 0) / stats.total : 0;
                case 'fabp': return stats.total > 0 ? (stats.fabp || 0) / stats.total : 0;
                default: return stats.total;
            }
        }

        // Sort sub-rows within a zone
        function sortSubRows(subRows, zoneTot) {
            var sortCol = self._revSortCol;
            var sortAsc = self._revSortAsc;
            return subRows.filter(function(r) { return r.stats.total > 0; }).sort(function(a, b) {
                var va = getSortValue(a.stats, sortCol, zoneTot);
                var vb = getSortValue(b.stats, sortCol, zoneTot);
                if (va !== vb) return sortAsc ? va - vb : vb - va;
                return b.stats.total - a.stats.total;
            });
        }

        var html = '<div class="pa-subsection">';
        html += '<div class="pa-subtitle">Renversement</div>';
        html += '<table class="pa-table pa-dist-table" data-pa-mode="' + mode + '" data-pa-table="reversal">';
        html += '<thead><tr>';
        html += '<th class="pa-sortable" data-pa-sort="type" data-pa-table="reversal">Type' + self._revSortIcon('type') + '</th>';
        html += '<th class="pa-sortable" data-pa-sort="pct" data-pa-table="reversal">%' + self._revSortIcon('pct') + '</th>';
        html += '<th class="pa-sortable" data-pa-sort="qual" data-pa-table="reversal">Qual.Passe' + self._revSortIcon('qual') + '</th>';
        html += '<th class="pa-sortable" data-pa-sort="aplus" data-pa-table="reversal">A+' + self._revSortIcon('aplus') + '</th>';
        html += '<th class="pa-sortable" data-pa-sort="aminus" data-pa-table="reversal">A\u2212' + self._revSortIcon('aminus') + '</th>';
        html += '<th class="pa-sortable" data-pa-sort="fabp" data-pa-table="reversal">FA(BP)' + self._revSortIcon('fabp') + '</th>';
        html += '</tr></thead>';
        html += '<tbody>';

        // ← R4
        var r4SubRows = [
            { label: '\u2514 Grand c\u00f4t\u00e9 \ud83c\udf0a <span class="pa-stat-detail">(' + data.r4Grand.total + ')</span>', stats: data.r4Grand },
            { label: '\u2514 Petit c\u00f4t\u00e9 <span class="pa-stat-detail">(' + data.r4Petit.total + ')</span>', stats: data.r4Petit },
            { label: '\u2514 Classique <span class="pa-stat-detail">(' + data.r4Classique.total + ')</span>', stats: data.r4Classique }
        ];
        html += renderRow('pa-zone-row',
            '<span class="pt-role-header-bar" style="background:' + this.ZONE_COLORS['R4'] + '"></span> <strong>\u2190 R4</strong> <strong>(' + data.r4.total + ')</strong>',
            data.r4, data.eligible);
        sortSubRows(r4SubRows, data.r4.total).forEach(function(r) {
            html += renderRow('pa-player-row', r.label, r.stats, data.r4.total);
        });

        // → Pointu
        var pointuSubRows = [
            { label: '\u2514 Grand c\u00f4t\u00e9 \ud83c\udf0a <span class="pa-stat-detail">(' + data.pointuGrand.total + ')</span>', stats: data.pointuGrand },
            { label: '\u2514 Petit c\u00f4t\u00e9 <span class="pa-stat-detail">(' + data.pointuPetit.total + ')</span>', stats: data.pointuPetit },
            { label: '\u2514 Classique <span class="pa-stat-detail">(' + data.pointuClassique.total + ')</span>', stats: data.pointuClassique }
        ];
        html += renderRow('pa-zone-row',
            '<span class="pt-role-header-bar" style="background:' + this.ZONE_COLORS['Pointu'] + '"></span> <strong>\u2192 Pointu</strong> <strong>(' + data.pointu.total + ')</strong>',
            data.pointu, data.eligible);
        sortSubRows(pointuSubRows, data.pointu.total).forEach(function(r) {
            html += renderRow('pa-player-row', r.label, r.stats, data.pointu.total);
        });

        // Total
        html += '<tr class="pa-zone-row" style="border-top:2px solid var(--border-color)">';
        html += '<td><span class="pt-role-header-bar" style="background:#9ca3af"></span> <strong>Total (' + data.eligible + ')</strong></td>';
        html += '<td>100%</td>';
        html += '<td>' + fmtQ(data.total.quality) + '</td>';
        html += '<td>' + data.total.aplusPct + '%</td>';
        html += '<td>' + data.total.aminusPct + '%</td>';
        html += '<td>' + data.total.fabpPct + '%</td>';
        html += '</tr>';

        html += '</tbody></table></div>';
        return html;
    },

    _renderMentalPasseur(match, team, sequences, mode) {
        var html = '<div class="pa-subsection">';
        html += '<div class="pa-subtitle">Mental Passeur</div>';

        // D1 : Distribution sous pression
        html += this._renderPressure(sequences);

        // D2 : Funnel re-feed/switch par attaquant (chain-based)
        var matches;
        if (match) {
            matches = [match];
        } else if (mode === 'year') {
            matches = YearStatsView._lastFiltered || [];
        }
        if (matches && matches.length > 0) {
            var funnelData = this.computeMentalFunnel(matches, team);
            html += this._renderMentalFunnel(funnelData, mode);
        }

        html += '</div>';
        return html;
    },

    _renderReFeed(match, team) {
        var data = this.computeReFeedAfterFailure(match, team);
        return this._renderReFeedTable(data);
    },

    _renderReFeedTable(data) {
        var names = Object.keys(data);
        if (names.length === 0) return '<div class="pa-empty">Pas assez de donn\u00e9es (re-confiance)</div>';

        var html = '<div class="pa-mental-label">Apr\u00e8s \u00e9chec de l\'attaquant :</div>';
        html += '<table class="pa-table pa-mental-table">';
        html += '<thead><tr><th>Passeur</th><th>Re-feed</th><th>Switch</th><th>A+ re-feed</th><th>A+ switch</th></tr></thead>';
        html += '<tbody>';

        names.forEach(function(name) {
            var d = data[name];
            if (d.total === 0) return;
            var reFeedPct = Math.round(d.reFeed / d.total * 100);
            var switchPct = Math.round(d.switch_ / d.total * 100);
            var reFeedSucc = d.reFeed > 0 ? Math.round(d.reFeedSuccess / d.reFeed * 100) : 0;
            var switchSucc = d.switch_ > 0 ? Math.round(d.switchSuccess / d.switch_ * 100) : 0;

            html += '<tr>';
            html += '<td><div class="player-cell">' + SharedComponents.renderRoleDots(name) + '<strong>' + Utils.escapeHtml(name) + '</strong></div><span class="pa-stat-detail">' + d.total + ' situations</span></td>';
            html += '<td>' + reFeedPct + '%<br><span class="pa-stat-detail">' + d.reFeed + '</span></td>';
            html += '<td>' + switchPct + '%<br><span class="pa-stat-detail">' + d.switch_ + '</span></td>';
            html += '<td class="' + (reFeedSucc >= 50 ? 'pa-positive' : '') + '">' + reFeedSucc + '%</td>';
            html += '<td class="' + (switchSucc >= 50 ? 'pa-positive' : '') + '">' + switchSucc + '%</td>';
            html += '</tr>';
        });

        html += '</tbody></table>';
        return html;
    },

    _renderPressure(sequences) {
        var data = this.computePressureDistribution(sequences);
        if (data.pressure.total === 0 && data.normal.total === 0) return '';

        var self = this;
        var html = '<div class="pa-mental-label" style="margin-top:12px">Distribution sous pression (men\u00e9 ou +3 max) vs confort :</div>';
        html += '<table class="pa-table">';
        var zones = Object.keys(self.ZONE_COLORS);
        html += '<thead><tr><th></th>';
        zones.forEach(function(z) {
            html += '<th><span class="pa-zone-dot" style="background:' + self.ZONE_COLORS[z] + '"></span> ' + z + '</th>';
        });
        html += '</tr></thead><tbody>';

        // Collecter les numeros de sets
        var allSets = {};
        Object.keys(data.pressureBySet).forEach(function(k) { allSets[k] = true; });
        Object.keys(data.normalBySet).forEach(function(k) { allSets[k] = true; });
        var setNums = Object.keys(allSets).map(Number).sort(function(a, b) { return a - b; });

        // Ligne pression (header)
        html += '<tr class="pa-zone-row"><td><strong>Serr\u00e9</strong> \ud83d\udd25</td>';
        zones.forEach(function(z) {
            var pct = data.pressure.total > 0 ? Math.round((data.pressure[z] || 0) / data.pressure.total * 100) : 0;
            html += '<td>' + pct + '%</td>';
        });
        html += '</tr>';

        // Sous-lignes par set (pression)
        setNums.forEach(function(setNum) {
            var setData = data.pressureBySet[setNum];
            if (!setData || setData.total === 0) return;
            html += '<tr class="pa-player-row"><td>\u2514 Set ' + (setNum + 1) + ' <span class="pa-stat-detail">(' + setData.total + ')</span></td>';
            zones.forEach(function(z) {
                var pct = setData.total > 0 ? Math.round((setData[z] || 0) / setData.total * 100) : 0;
                html += '<td>' + pct + '%</td>';
            });
            html += '</tr>';
        });

        // Ligne confort (header)
        html += '<tr class="pa-zone-row"><td><strong>Confort</strong> \ud83c\udf3f</td>';
        zones.forEach(function(z) {
            var pct = data.normal.total > 0 ? Math.round((data.normal[z] || 0) / data.normal.total * 100) : 0;
            html += '<td>' + pct + '%</td>';
        });
        html += '</tr>';

        // Sous-lignes par set (confort)
        setNums.forEach(function(setNum) {
            var setData = data.normalBySet[setNum];
            if (!setData || setData.total === 0) return;
            html += '<tr class="pa-player-row"><td>\u2514 Set ' + (setNum + 1) + ' <span class="pa-stat-detail">(' + setData.total + ')</span></td>';
            zones.forEach(function(z) {
                var pct = setData.total > 0 ? Math.round((setData[z] || 0) / setData.total * 100) : 0;
                html += '<td>' + pct + '%</td>';
            });
            html += '</tr>';
        });

        html += '</tbody></table>';
        return html;
    },

    // --- Mental Passeur : Funnel re-feed/switch (chain-based) ---

    computeMentalFunnel(matches, team) {
        var self = this;
        var data = {}; // keyed by attacker name

        function initAttacker() {
            return {
                totalAtt: 0,
                base: { aplus: 0, aminus: 0, bp: 0, fa: 0 },
                situations: {
                    aplus:  { total: 0, rf: 0, rfAplus: 0, sw: 0, swAplus: 0 },
                    aminus: { total: 0, rf: 0, rfAplus: 0, sw: 0, swAplus: 0 },
                    bp:     { total: 0, rf: 0, rfAplus: 0, sw: 0, swAplus: 0 },
                    fa:     { total: 0, rf: 0, rfAplus: 0, sw: 0, swAplus: 0 }
                }
            };
        }

        matches.forEach(function(match) {
            var completedSets = (match.sets || []).filter(function(s) { return s.completed; });
            completedSets.forEach(function(set) {
                var sequences = self.analyzeSet(set, team);

                // Filtrer : passes du Passeur avec attaquant et categorie (pas relance)
                var passeurSeqs = sequences.filter(function(s) {
                    return s.passerRole === 'Passeur' && s.attacker && s.attackCat;
                });

                // Base stats
                passeurSeqs.forEach(function(s) {
                    if (!data[s.attacker]) data[s.attacker] = initAttacker();
                    data[s.attacker].totalAtt++;
                    data[s.attacker].base[s.attackCat]++;
                });

                // Chain : paires consecutives dans le set
                for (var i = 0; i < passeurSeqs.length - 1; i++) {
                    var current = passeurSeqs[i];
                    var next = passeurSeqs[i + 1];
                    var cat = current.attackCat;
                    var attacker = current.attacker;

                    if (!data[attacker]) data[attacker] = initAttacker();
                    var sit = data[attacker].situations[cat];
                    sit.total++;

                    if (next.attacker === attacker) {
                        sit.rf++;
                        if (next.attackCat === 'aplus') sit.rfAplus++;
                    } else {
                        sit.sw++;
                        if (next.attackCat === 'aplus') sit.swAplus++;
                    }
                }
            });
        });

        return data;
    },

    _renderMentalFunnel(funnelData, mode) {
        var attackers = Object.keys(funnelData);
        if (attackers.length === 0) return '';

        // Trier par totalAtt decroissant
        attackers.sort(function(a, b) { return funnelData[b].totalAtt - funnelData[a].totalAtt; });

        // Filtrer : minimum 10 attaques en mode Année uniquement
        if (mode === 'year') {
            attackers = attackers.filter(function(a) { return funnelData[a].totalAtt >= 10; });
        }
        if (attackers.length === 0) return '';

        var html = '';
        // 3 lignes : A+, A-, FA(BP) — BP et FA fusionnés pour échantillon significatif
        var cats = ['aplus', 'aminus', 'fabp'];
        var catLabels = { aplus: 'A+', aminus: 'A\u2212', fabp: 'FA(BP)' };
        var catTags = { aplus: 'pa-tag-aplus', aminus: 'pa-tag-aminus', fabp: 'pa-tag-fa' };

        attackers.forEach(function(name) {
            var d = funnelData[name];
            // Fusionner BP + FA en une seule catégorie
            var mergedBase = d.base.bp + d.base.fa;
            var mergedSit = {
                total: d.situations.bp.total + d.situations.fa.total,
                rf: d.situations.bp.rf + d.situations.fa.rf,
                rfAplus: d.situations.bp.rfAplus + d.situations.fa.rfAplus,
                sw: d.situations.bp.sw + d.situations.fa.sw,
                swAplus: d.situations.bp.swAplus + d.situations.fa.swAplus
            };
            var mergedData = { base: { aplus: d.base.aplus, aminus: d.base.aminus, fabp: mergedBase },
                situations: { aplus: d.situations.aplus, aminus: d.situations.aminus, fabp: mergedSit } };

            var totalSit = 0;
            cats.forEach(function(c) { totalSit += mergedData.situations[c].total; });

            html += '<div class="pa-funnel-card">';
            html += '<div class="pa-funnel-header">';
            html += '<div class="player-cell">' + SharedComponents.renderRoleDots(name) + '<strong>' + Utils.escapeHtml(name) + '</strong></div>';
            html += '<span class="pa-stat-detail">' + d.totalAtt + ' att \u00b7 ' + totalSit + ' situations</span>';
            html += '</div>';

            html += '<table class="pa-funnel-table">';
            html += '<thead>';
            html += '<tr>';
            html += '<th rowspan="2" style="text-align:left"></th>';
            html += '<th rowspan="2" class="pa-funnel-base">Base</th>';
            html += '<th colspan="2" class="pa-funnel-sep">\ud83d\udd01 Re-feed</th>';
            html += '<th colspan="2" class="pa-funnel-sep">\ud83d\udd00 Switch</th>';
            html += '</tr>';
            html += '<tr>';
            html += '<th class="pa-funnel-sep">%</th><th>\u2192 A+</th>';
            html += '<th class="pa-funnel-sep">%</th><th>\u2192 A+</th>';
            html += '</tr>';
            html += '</thead><tbody>';

            cats.forEach(function(cat) {
                var base = mergedData.base[cat];
                var basePct = d.totalAtt > 0 ? Math.round(base / d.totalAtt * 100) : 0;
                var s = mergedData.situations[cat];

                html += '<tr>';
                html += '<td><span class="pa-tag ' + catTags[cat] + '">' + catLabels[cat] + '</span></td>';

                // Base
                var baseHighlight = cat === 'aplus' ? ' pa-positive' : (cat === 'fabp' ? ' pa-negative' : '');
                html += '<td class="pa-funnel-base"><span class="' + baseHighlight + '"><strong>' + basePct + '%</strong></span>';
                html += '<br><span class="pa-stat-detail">' + base + '</span></td>';

                if (s.total === 0) {
                    html += '<td class="pa-funnel-sep" colspan="2">\u2014</td>';
                    html += '<td class="pa-funnel-sep" colspan="2">\u2014</td>';
                } else {
                    var rfPct = Math.round(s.rf / s.total * 100);
                    var rfAplusPct = s.rf > 0 ? Math.round(s.rfAplus / s.rf * 100) : 0;
                    var swPct = Math.round(s.sw / s.total * 100);
                    var swAplusPct = s.sw > 0 ? Math.round(s.swAplus / s.sw * 100) : 0;

                    var rfBold = rfPct >= swPct ? ' style="font-weight:700"' : '';
                    var swBold = swPct > rfPct ? ' style="font-weight:700"' : '';

                    html += '<td class="pa-funnel-sep"' + rfBold + '>' + rfPct + '%<br><span class="pa-stat-detail">' + s.rf + '/' + s.total + '</span></td>';
                    html += '<td>' + (rfAplusPct >= 50 ? '<span class="pa-positive">' : '') + rfAplusPct + '%' + (rfAplusPct >= 50 ? '</span>' : '') + '<br><span class="pa-stat-detail">' + s.rfAplus + '/' + s.rf + '</span></td>';

                    html += '<td class="pa-funnel-sep"' + swBold + '>' + swPct + '%<br><span class="pa-stat-detail">' + s.sw + '/' + s.total + '</span></td>';
                    html += '<td>' + (swAplusPct >= 50 ? '<span class="pa-positive">' : '') + swAplusPct + '%' + (swAplusPct >= 50 ? '</span>' : '') + '<br><span class="pa-stat-detail">' + s.swAplus + '/' + s.sw + '</span></td>';
                }

                html += '</tr>';
            });

            html += '</tbody></table></div>';
        });

        return html;
    },

    _renderDistributionChart(bySet, match) {
        if (!bySet || bySet.length < 2) return '';

        var completedSets = (match.sets || []).filter(function(s) { return s.completed; });
        var distBySet = this.computeDistributionBySet(bySet);

        // Dimensions SVG
        var W = 340, H = 180;
        var pL = 30, pR = 20, pT = 25, pB = 30;
        var cW = W - pL - pR, cH = H - pT - pB;

        // Max Y
        var self = this;
        var zones = Object.keys(self.ZONE_COLORS);
        var maxVal = 0;
        distBySet.forEach(function(d) {
            zones.forEach(function(z) {
                if (d[z] > maxVal) maxVal = d[z];
            });
        });
        if (maxVal === 0) maxVal = 1;
        maxVal = Math.ceil(maxVal / 5) * 5 || 5;

        var n = distBySet.length;
        var xStep = n > 1 ? cW / (n - 1) : 0;
        var self = this;

        var html = '<div class="pa-subsection">';
        html += '<div class="pa-subtitle">Distribution par set</div>';
        html += '<div class="pa-chart-wrap">';
        html += '<svg viewBox="0 0 ' + W + ' ' + H + '" xmlns="http://www.w3.org/2000/svg">';

        // Grille horizontale
        for (var g = 0; g <= 4; g++) {
            var gy = pT + cH - (g / 4) * cH;
            var gVal = Math.round(maxVal * g / 4);
            html += '<line x1="' + pL + '" y1="' + gy.toFixed(1) + '" x2="' + (W - pR) + '" y2="' + gy.toFixed(1) + '" stroke="#e2e8f0" stroke-width="1"/>';
            html += '<text x="' + (pL - 4) + '" y="' + (gy + 3).toFixed(1) + '" font-size="9" fill="#94a3b8" text-anchor="end">' + gVal + '</text>';
        }

        // Axes X
        for (var i = 0; i < n; i++) {
            var x = pL + i * xStep;
            var setObj = completedSets[i];
            var isLost = setObj && (setObj.finalHomeScore || 0) < (setObj.finalAwayScore || 0);
            var label = (i === 4) ? 'TB' : 'S' + (i + 1);
            html += '<text x="' + x.toFixed(1) + '" y="' + (H - 5) + '" font-size="10" fill="' + (isLost ? '#ef4444' : '#64748b') + '" ' + (isLost ? 'font-weight="bold" ' : '') + 'text-anchor="middle">' + label + (isLost ? ' \u2716' : '') + '</text>';
        }

        // Polylines par zone
        zones.forEach(function(zone) {
            var color = self.ZONE_COLORS[zone];
            var pts = [];
            for (var i = 0; i < n; i++) {
                var x = pL + i * xStep;
                var val = distBySet[i][zone] || 0;
                var y = pT + cH - (val / maxVal) * cH;
                pts.push(x.toFixed(1) + ',' + y.toFixed(1));
            }
            html += '<polyline points="' + pts.join(' ') + '" fill="none" stroke="' + color + '" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>';

            for (var i = 0; i < n; i++) {
                var x = pL + i * xStep;
                var val = distBySet[i][zone] || 0;
                var y = pT + cH - (val / maxVal) * cH;
                html += '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="3.5" fill="' + color + '"/>';
                html += '<text x="' + x.toFixed(1) + '" y="' + (y - 7).toFixed(1) + '" font-size="9" font-weight="600" fill="' + color + '" text-anchor="middle">' + val + '</text>';
            }
        });

        html += '</svg></div>';

        // Legende
        html += '<div class="pa-legend">';
        zones.forEach(function(zone) {
            html += '<div class="pa-legend-item"><span class="pa-legend-box" style="background:' + self.ZONE_COLORS[zone] + '"></span>' + zone + '</div>';
        });
        html += '</div></div>';
        return html;
    }
};

// ==================== STATS AGGREGATION ====================
const StatsAggregator = {

    _passCtx() { return { tot: 0, p4: 0, p3: 0, p2: 0, p1: 0, fp: 0 }; },

    initPlayerStats() {
        return {
            service: { tot: 0, ace: 0, splus: 0, fser: 0, recSumAdv: 0, recCountAdv: 0 },
            reception: { tot: 0, r4: 0, r3: 0, r2: 0, r1: 0, frec: 0 },
            pass: {
                tot: 0, p4: 0, p3: 0, p2: 0, p1: 0, fp: 0,
                passeur: { tot: 0, p4: 0, p3: 0, p2: 0, p1: 0, fp: 0,
                    confort: this._passCtx(), contraint: this._passCtx(), transition: this._passCtx() },
                autre: { tot: 0, p4: 0, p3: 0, p2: 0, p1: 0, fp: 0,
                    contraint: this._passCtx(), transition: this._passCtx() }
            },
            attack: { tot: 0, attplus: 0, attminus: 0, bp: 0, fatt: 0 },
            relance: { tot: 0, relplus: 0, relminus: 0, frel: 0 },
            defense: { tot: 0, defplus: 0, defneutral: 0, defminus: 0, fdef: 0 },
            block: { tot: 0, blcplus: 0, blcminus: 0, fblc: 0 }
        };
    },

    /**
     * Agrege les stats d'une equipe sur plusieurs sets.
     * Gere les noms de champs legacy (fs/fser, fd/attplus, bl/blcplus, faute/frec).
     */
    aggregateStats(setsData, teamKey, validPlayers) {
        // V20.287 : reparer les stats manquantes depuis les rallies avant aggregation
        setsData.forEach(function(s) {
            if (StatsRepair.needsRepair(s)) {
                StatsRepair.repairSetStats(s);
            }
        });

        // V20.26 : auto-construire la liste des joueurs valides depuis les lineups
        // pour exclure les joueurs adverses enregistres par erreur avec le mauvais team
        var lineupPlayers = null;
        if (!validPlayers) {
            var lineupKey = teamKey === 'home' ? 'homeLineup' : 'awayLineup';
            var initialKey = teamKey === 'home' ? 'initialHomeLineup' : 'initialAwayLineup';
            lineupPlayers = {};
            setsData.forEach(function(s) {
                [initialKey, lineupKey].forEach(function(k) {
                    var lineup = s[k];
                    if (!lineup) return;
                    Object.keys(lineup).forEach(function(pos) {
                        if (lineup[pos]) lineupPlayers[lineup[pos]] = true;
                    });
                });
            });
        }
        var allowed = validPlayers || lineupPlayers;

        const playerTotals = {};
        setsData.forEach(function(s) {
            if (!s.stats || !s.stats[teamKey]) return;
            // V21.1 : calcul proraté de _setsPlayed (cohérent avec proratedSets de l'Impact)
            var totalPts = (s.points || []).length;
            var lineups = (totalPts >= 20) ? PlusMinusCalculator._getLineupAtEachPoint(s, teamKey) : null;
            for (const [name, data] of Object.entries(s.stats[teamKey])) {
                // V20.26 : exclure les joueurs qui ne font pas partie du roster/lineups
                if (allowed && (Array.isArray(allowed) ? allowed.indexOf(name) === -1 : !allowed[name])) continue;
                if (!playerTotals[name]) {
                    playerTotals[name] = StatsAggregator.initPlayerStats();
                    playerTotals[name]._setsPlayed = 0;
                }
                const t = playerTotals[name];
                // V21.1 : prorata par points joués (comme Impact) au lieu de +1 entier
                if (lineups && totalPts > 0) {
                    var ptsInSet = 0;
                    for (var pp = 0; pp < lineups.length; pp++) {
                        if (lineups[pp] && lineups[pp].indexOf(name) >= 0) ptsInSet++;
                    }
                    t._setsPlayed += ptsInSet / totalPts;
                }

                // Service
                t.service.tot += (data.service?.tot || 0);
                t.service.ace += (data.service?.ace || 0);
                t.service.splus += (data.service?.splus || 0);
                t.service.fser += (data.service?.fs || data.service?.fser || 0);
                t.service.recSumAdv += (data.service?.recSumAdv || 0);
                t.service.recCountAdv += (data.service?.recCountAdv || 0);

                // Reception
                t.reception.tot += (data.reception?.tot || 0);
                t.reception.r4 += (data.reception?.r4 || 0);
                t.reception.r3 += (data.reception?.r3 || 0);
                t.reception.r2 += (data.reception?.r2 || 0);
                t.reception.r1 += (data.reception?.r1 || 0);
                t.reception.frec += (data.reception?.faute || data.reception?.frec || 0);

                // Passe (plat)
                t.pass.tot += (data.pass?.tot || 0);
                t.pass.p4 += (data.pass?.p4 || 0);
                t.pass.p3 += (data.pass?.p3 || 0);
                t.pass.p2 += (data.pass?.p2 || 0);
                t.pass.p1 += (data.pass?.p1 || 0);
                t.pass.fp += (data.pass?.fp || 0);

                // Passe ventilation V19.2 (passeur/autre + contextes)
                var pKeys = ['tot', 'p4', 'p3', 'p2', 'p1', 'fp'];
                ['passeur', 'autre'].forEach(function(pType) {
                    var src = data.pass?.[pType];
                    if (!src) return;
                    pKeys.forEach(function(k) { t.pass[pType][k] += (src[k] || 0); });
                    var ctxs = pType === 'passeur' ? ['confort', 'contraint', 'transition'] : ['contraint', 'transition'];
                    ctxs.forEach(function(ctx) {
                        if (!src[ctx]) return;
                        pKeys.forEach(function(k) { t.pass[pType][ctx][k] += (src[ctx]?.[k] || 0); });
                    });
                });

                // Attaque
                t.attack.tot += (data.attack?.tot || 0);
                t.attack.attplus += (data.attack?.fd || data.attack?.attplus || 0);
                t.attack.attminus += (data.attack?.attminus || 0);
                t.attack.bp += (data.attack?.bp || 0);
                t.attack.fatt += (data.attack?.fatt || 0);

                // Relance
                t.relance.tot += (data.relance?.tot || 0);
                t.relance.relplus += (data.relance?.relplus || 0);
                t.relance.relminus += (data.relance?.relminus || 0);
                t.relance.frel += (data.relance?.frel || 0);

                // Defense (V20.15 : D+/D/D-/FD — rétrocompat ancien format)
                t.defense.tot += (data.defense?.tot || 0);
                t.defense.defplus += (data.defense?.defplus || 0);
                if (data.defense?.defneutral !== undefined) {
                    // Nouveau format V20.15+ : champs avec nouvelles significations
                    t.defense.defneutral += (data.defense.defneutral || 0);
                    t.defense.defminus += (data.defense.defminus || 0);
                    t.defense.fdef += (data.defense.fdef || 0);
                } else {
                    // Ancien format : defminus = "D neutre", fdef = "D- faute touchée"
                    t.defense.defneutral += (data.defense?.defminus || 0);
                    t.defense.defminus += (data.defense?.fdef || 0);
                    // fdef reste à 0 (non-touchée n'existait pas)
                }

                // Bloc
                t.block.tot += (data.block?.tot || 0);
                t.block.blcplus += (data.block?.bl || data.block?.blcplus || 0);
                t.block.blcminus += (data.block?.blcminus || 0);
                t.block.fblc += (data.block?.fblc || 0);
            }
        });
        return playerTotals;
    },

    /**
     * Comme aggregateStats, mais filtre les sets par indices.
     */
    aggregateStatsBySetIndices(setsData, teamKey, setIndices, validPlayers) {
        var filtered = setIndices.map(function(i) { return setsData[i]; }).filter(Boolean);
        return this.aggregateStats(filtered, teamKey, validPlayers);
    },

    /**
     * Fusionne les stats joueurs par poste (role).
     * Retourne { 'Passeur Adv.': stats, 'R4 Adv.': stats, 'Pointu Adv.': stats, 'Centre Adv.': stats }
     */
    aggregateByRole(playerTotals, playerRolesMap) {
        var ROLE_LABELS = { 'Passeur': 'Passeur Adv.', 'R4': 'R4 Adv.', 'Pointu': 'Pointu Adv.', 'Centre': 'Centre Adv.' };
        var self = this;
        var roleTotals = {};
        Object.keys(ROLE_LABELS).forEach(function(role) {
            roleTotals[ROLE_LABELS[role]] = self.initPlayerStats();
        });

        // Helper recursif pour sommer toutes les proprietes numeriques
        function sumInto(dst, src) {
            Object.keys(src).forEach(function(key) {
                if (typeof src[key] === 'number') {
                    dst[key] = (dst[key] || 0) + src[key];
                } else if (typeof src[key] === 'object' && src[key] !== null) {
                    if (!dst[key]) dst[key] = {};
                    sumInto(dst[key], src[key]);
                }
            });
        }

        Object.keys(playerTotals).forEach(function(name) {
            var roleInfo = playerRolesMap ? playerRolesMap[name] : null;
            var primaryRole = roleInfo ? roleInfo.primaryRole : null;
            var label = primaryRole ? ROLE_LABELS[primaryRole] : null;
            if (!label) return;
            sumInto(roleTotals[label], playerTotals[name]);
        });

        return roleTotals;
    },

    /**
     * Calcule les totaux equipe a partir des totaux joueurs.
     */
    computeTotals(playerTotals) {
        const totals = StatsAggregator.initPlayerStats();
        const pKeys = ['tot', 'p4', 'p3', 'p2', 'p1', 'fp'];
        for (const p of Object.values(playerTotals)) {
            for (const cat of ['service', 'reception', 'attack', 'relance', 'defense', 'block']) {
                for (const key of Object.keys(totals[cat])) {
                    totals[cat][key] += (p[cat]?.[key] || 0);
                }
            }
            // Passe : champs plats + ventilation
            pKeys.forEach(function(k) { totals.pass[k] += (p.pass?.[k] || 0); });
            ['passeur', 'autre'].forEach(function(pType) {
                if (!p.pass?.[pType]) return;
                pKeys.forEach(function(k) { totals.pass[pType][k] += (p.pass[pType][k] || 0); });
                var ctxs = pType === 'passeur' ? ['confort', 'contraint', 'transition'] : ['contraint', 'transition'];
                ctxs.forEach(function(ctx) {
                    if (!p.pass[pType][ctx]) return;
                    pKeys.forEach(function(k) { totals.pass[pType][ctx][k] += (p.pass[pType][ctx]?.[k] || 0); });
                });
            });
        }
        return totals;
    },

    /**
     * Moyenne service (plus bas = meilleur serveur).
     */
    srvMoy(p) {
        const count = p.service.recCountAdv + p.service.ace;
        if (count === 0) return null;
        return p.service.recSumAdv / count;
    },

    srvMoyDisplay(p) {
        const moy = StatsAggregator.srvMoy(p);
        return moy !== null ? moy.toFixed(1) : '-';
    },

    srvMoyClass(p) {
        const moy = StatsAggregator.srvMoy(p);
        if (moy === null) return '';
        if (moy <= 1.5) return 'positive';
        if (moy >= 3.0) return 'negative';
        return '';
    }
};

// ==================== SHARED COMPONENTS ====================
const SharedComponents = {

    // Definition des colonnes par categorie — variante MATCH (Tab 1 : FA et BP separes)
    CATEGORIES_MATCH: {
        service: {
            label: 'Service', key: 'service',
            columns: [
                { key: 'tot', label: 'Tot', cls: '' },
                { key: '_acePlus', label: 'Ace', cls: 'positive', pct: true, computed: 'acePlus' },
                { key: 'fser', label: 'FS', cls: 'negative', pct: true },
                { key: '_moy', label: 'Moy', cls: '_srvMoy' }
            ]
        },
        reception: {
            label: 'Reception', key: 'reception',
            columns: [
                { key: 'tot', label: 'Tot', cls: '' },
                { key: 'r4', label: 'R4', cls: 'positive', pct: true },
                { key: 'r3', label: 'R3', cls: '', pct: true },
                { key: 'r2', label: 'R2', cls: 'warning', pct: true },
                { key: '_r1Fr', label: 'R1/FR', cls: 'negative', pct: true, computed: 'r1Fr' }
            ]
        },
        passe: {
            label: 'Passe', key: 'pass',
            columns: [
                { key: 'tot', label: 'Tot', cls: '' },
                { key: 'p4', label: 'P4', cls: 'positive', pct: true },
                { key: 'p3', label: 'P3', cls: '', pct: true },
                { key: 'p2', label: 'P2', cls: 'warning', pct: true },
                { key: '_p1Fp', label: 'P1/FP', cls: 'negative', pct: true, computed: 'p1Fp' }
            ]
        },
        attack: {
            label: 'Attaque', key: 'attack',
            columns: [
                { key: 'tot', label: 'Tot', cls: '' },
                { key: 'attplus', label: 'A+', cls: 'positive', pct: true },
                { key: 'attminus', label: 'A-', cls: 'neutral', pct: true },
                { key: '_faBp', label: 'FA(BP)', cls: 'negative', pct: true, computed: 'faBp' }
            ]
        },
        relance: {
            label: 'Relance', key: 'relance',
            columns: [
                { key: 'tot', label: 'Tot', cls: '' },
                { key: 'relplus', label: 'R+', cls: 'positive', pct: true },
                { key: 'relminus', label: 'R-', cls: 'neutral', pct: true },
                { key: 'frel', label: 'FRel', cls: 'negative', pct: true }
            ]
        },
        defense: {
            label: 'Defense', key: 'defense',
            columns: [
                { key: 'tot', label: 'Tot', cls: '' },
                { key: 'defplus', label: 'D+', cls: 'positive', pct: true },
                { key: 'defneutral', label: 'D', cls: 'neutral', pct: true },
                { key: 'defminus', label: 'D-', cls: 'warning', pct: true },
                { key: 'fdef', label: 'FD', cls: 'negative', pct: true }
            ]
        },
        block: {
            label: 'Bloc', key: 'block',
            columns: [
                { key: 'tot', label: 'Tot', cls: '' },
                { key: 'blcplus', label: 'B+', cls: 'positive', pct: true },
                { key: 'blcminus', label: 'B-', cls: 'neutral', pct: true },
                { key: 'fblc', label: 'FB', cls: 'negative', pct: true }
            ]
        }
    },

    // Definition des colonnes — variante AGGREGATED (Tab 2 & 3 : Ace fusionne avec S+)
    CATEGORIES_AGGREGATED: {
        service: {
            label: 'Service', key: 'service',
            columns: [
                { key: 'tot', label: 'Tot', cls: '' },
                { key: '_acePlus', label: 'Ace', cls: 'positive', pct: true, computed: 'acePlus' },
                { key: 'fser', label: 'FS', cls: 'negative', pct: true },
                { key: '_moy', label: 'Moy', cls: '_srvMoy' }
            ]
        },
        reception: {
            label: 'Reception', key: 'reception',
            columns: [
                { key: 'tot', label: 'Tot', cls: '' },
                { key: 'r4', label: 'R4', cls: 'positive', pct: true },
                { key: 'r3', label: 'R3', cls: '', pct: true },
                { key: 'r2', label: 'R2', cls: 'warning', pct: true },
                { key: '_r1Fr', label: 'R1/FR', cls: 'negative', pct: true, computed: 'r1Fr' }
            ]
        },
        passe: {
            label: 'Passe', key: 'pass',
            columns: [
                { key: 'tot', label: 'Tot', cls: '' },
                { key: 'p4', label: 'P4', cls: 'positive', pct: true },
                { key: 'p3', label: 'P3', cls: '', pct: true },
                { key: 'p2', label: 'P2', cls: 'warning', pct: true },
                { key: '_p1Fp', label: 'P1/FP', cls: 'negative', pct: true, computed: 'p1Fp' }
            ]
        },
        attack: {
            label: 'Attaque', key: 'attack',
            columns: [
                { key: 'tot', label: 'Tot', cls: '' },
                { key: 'attplus', label: 'A+', cls: 'positive', pct: true },
                { key: 'attminus', label: 'A-', cls: 'neutral', pct: true },
                { key: '_faBp', label: 'FA(BP)', cls: 'negative', pct: true, computed: 'faBp' }
            ]
        },
        relance: {
            label: 'Relance', key: 'relance',
            columns: [
                { key: 'tot', label: 'Tot', cls: '' },
                { key: 'relplus', label: 'R+', cls: 'positive', pct: true },
                { key: 'relminus', label: 'R-', cls: 'neutral', pct: true },
                { key: 'frel', label: 'FRel', cls: 'negative', pct: true }
            ]
        },
        defense: {
            label: 'Defense', key: 'defense',
            columns: [
                { key: 'tot', label: 'Tot', cls: '' },
                { key: 'defplus', label: 'D+', cls: 'positive', pct: true },
                { key: 'defneutral', label: 'D', cls: 'neutral', pct: true },
                { key: 'defminus', label: 'D-', cls: 'warning', pct: true },
                { key: 'fdef', label: 'FD', cls: 'negative', pct: true }
            ]
        },
        block: {
            label: 'Bloc', key: 'block',
            columns: [
                { key: 'tot', label: 'Tot', cls: '' },
                { key: 'blcplus', label: 'B+', cls: 'positive', pct: true },
                { key: 'blcminus', label: 'B-', cls: 'neutral', pct: true },
                { key: 'fblc', label: 'FB', cls: 'negative', pct: true }
            ]
        }
    },

    /**
     * Retourne la definition de categories a utiliser selon le contexte.
     */
    getCategories(variant) {
        return variant === 'aggregated' ? this.CATEGORIES_AGGREGATED : this.CATEGORIES_MATCH;
    },

    // --- Toggle Tot/Moy ---
    _avgMode: 'tot',         // 'tot' = totaux cumules, 'moy' = moyenne par set joue
    _showAvgToggle: false,   // visible uniquement en Set ALL et Stats Annee
    _totalSets: 1,           // nombre total de sets (pour la ligne Total en mode moy)

    renderAvgModeToggle() {
        if (!this._showAvgToggle) return '';
        var isTot = this._avgMode === 'tot';
        return '<div class="display-mode-toggle avg-mode-toggle">' +
            '<button class="avg-mode-btn' + (isTot ? ' active' : '') + '" data-avg="tot">Tot</button>' +
            '<button class="avg-mode-btn' + (!isTot ? ' active' : '') + '" data-avg="moy">Moy</button>' +
            '</div>';
    },

    toggleAvgMode(rerenderFn) {
        this._avgMode = this._avgMode === 'tot' ? 'moy' : 'tot';
        if (rerenderFn) rerenderFn();
    },

    // --- Toggle #/% ---
    _displayMode: 'hash',   // 'hash' = valeurs absolues en grand, 'pct' = pourcentages en grand

    renderDisplayModeToggle() {
        var isHash = this._displayMode === 'hash';
        return '<div class="display-mode-toggle">' +
            '<button class="display-mode-btn' + (isHash ? ' active' : '') + '" data-mode="hash">#</button>' +
            '<button class="display-mode-btn' + (!isHash ? ' active' : '') + '" data-mode="pct">%</button>' +
            '</div>';
    },

    toggleDisplayMode(rerenderFn) {
        this._displayMode = this._displayMode === 'hash' ? 'pct' : 'hash';
        if (rerenderFn) rerenderFn();
    },

    // --- Tri des tableaux de stats ---
    _statsSortCol: null,     // colonne active (null = defaut, 'player' = defaut aussi)
    _statsSortCat: null,     // categorie active (ex: 'service', 'attack')
    _statsSortAsc: false,    // direction

    resetStatsSort() {
        this._statsSortCol = null;
        this._statsSortCat = null;
        this._statsSortAsc = false;
    },

    /**
     * Extrait la valeur numerique d'une colonne pour un joueur (pour le tri).
     */
    getStatSortValue(playerStats, category, col) {
        if (col.key === '_moy') {
            var moy = StatsAggregator.srvMoy(playerStats);
            return moy !== null ? moy : 99; // pas de data → tri en dernier
        }
        var dataKey = (category === 'passe') ? 'pass' : category;
        var catData = playerStats[dataKey] || {};
        var val;
        if (col.computed === 'acePlus') {
            var srvData = playerStats.service || {};
            val = (srvData.ace || 0) + (srvData.splus || 0);
        } else if (col.computed === 'faBp') {
            var atkData = playerStats.attack || {};
            val = (atkData.fatt || 0) + (atkData.bp || 0);
        } else if (col.computed === 'r1Fr') {
            var recData = playerStats.reception || {};
            val = (recData.r1 || 0) + (recData.frec || 0);
        } else if (col.computed === 'p1Fp') {
            var passD = playerStats[dataKey] || {};
            val = (passD.p1 || 0) + (passD.fp || 0);
        } else {
            val = catData[col.key] || 0;
        }

        // En mode %, trier par pourcentage
        if (this._displayMode === 'pct' && col.pct && val > 0) {
            var tot = catData.tot || 0;
            if (col.computed === 'acePlus') tot = (playerStats.service || {}).tot || 0;
            if (col.computed === 'faBp') tot = (playerStats.attack || {}).tot || 0;
            if (col.computed === 'r1Fr') tot = (playerStats.reception || {}).tot || 0;
            if (col.computed === 'p1Fp') tot = (playerStats[dataKey] || {}).tot || 0;
            return tot > 0 ? (val / tot * 100) : 0;
        }
        // En mode Moy, trier par moyenne par set joue
        if (this._avgMode === 'moy' && playerStats._setsPlayed > 1) {
            return val / playerStats._setsPlayed;
        }
        return val;
    },

    /**
     * Tri des joueurs pour les tableaux de stats.
     * Si un tri par colonne est actif et correspond a la categorie, trie par cette colonne.
     * Sinon, tri par defaut (role + volume).
     */
    sortPlayersForStats(names, playerTotals, category, catDef) {
        if (!this._statsSortCol || this._statsSortCol === 'player' || this._statsSortCat !== category) {
            return this.sortPlayers(names, playerTotals);
        }
        var self = this;
        var sortCol = null;
        catDef.columns.forEach(function(c) {
            if (c.key === self._statsSortCol || c.computed === self._statsSortCol) sortCol = c;
        });
        if (!sortCol) return this.sortPlayers(names, playerTotals);

        var asc = this._statsSortAsc;
        return names.slice().sort(function(a, b) {
            var va = self.getStatSortValue(playerTotals[a], category, sortCol);
            var vb = self.getStatSortValue(playerTotals[b], category, sortCol);
            // Joueurs sans donnees (0 ou null/99 pour Moy) toujours en fin de liste
            var aEmpty = (sortCol.key === '_moy') ? (va >= 99) : (va === 0);
            var bEmpty = (sortCol.key === '_moy') ? (vb >= 99) : (vb === 0);
            if (aEmpty && !bEmpty) return 1;
            if (!aEmpty && bEmpty) return -1;
            if (aEmpty && bEmpty) return 0;
            return asc ? (va - vb) : (vb - va);
        });
    },

    /**
     * Genere l'icone de tri pour un header.
     */
    _sortIcon(colKey, category) {
        var active;
        if (colKey === 'player') {
            // Joueur actif quand : pas de tri colonne (defaut), ou tri explicitement 'player'
            active = !this._statsSortCol || this._statsSortCol === 'player';
        } else {
            active = this._statsSortCol === colKey && this._statsSortCat === category;
        }
        if (!active) return ' <span class="sort-arrow">\u25BC</span>';
        var arrow = this._statsSortAsc ? '\u25B2' : '\u25BC';
        // Defaut (pas de tri explicite) : toujours fleche descendante
        if (colKey === 'player' && !this._statsSortCol) arrow = '\u25BC';
        return ' <span class="sort-arrow active">' + arrow + '</span>';
    },

    /**
     * Lie les handlers de tri sur les headers cliquables d'un container.
     * @param {Element} container - le container DOM
     * @param {Function} rerenderFn - fonction appelee apres changement de tri
     */
    bindStatsSortHandlers(container, rerenderFn) {
        var self = this;
        var headers = container.querySelectorAll('th[data-sort-col], .player-header[data-sort-col]');
        headers.forEach(function(th) {
            th.addEventListener('click', function() {
                var col = th.dataset.sortCol;
                var cat = th.dataset.sortCat || null;
                if (col === 'player') {
                    // Joueur : toggle visuel mais toujours tri par defaut
                    if (self._statsSortCol === 'player') {
                        self._statsSortAsc = !self._statsSortAsc;
                    } else {
                        self._statsSortCol = 'player';
                        self._statsSortCat = null;
                        self._statsSortAsc = false;
                    }
                } else if (self._statsSortCol === col && self._statsSortCat === cat) {
                    self._statsSortAsc = !self._statsSortAsc;
                } else {
                    self._statsSortCol = col;
                    self._statsSortCat = cat;
                    self._statsSortAsc = false; // numerique = desc par defaut
                }
                rerenderFn();
            });
        });

        // Toggle Tot/Moy
        container.querySelectorAll('.avg-mode-btn').forEach(function(btn) {
            btn.addEventListener('click', function() {
                self.toggleAvgMode(rerenderFn);
            });
        });

        // Toggle #/%
        container.querySelectorAll('.display-mode-btn').forEach(function(btn) {
            btn.addEventListener('click', function() {
                self.toggleDisplayMode(rerenderFn);
            });
        });
    },

    /**
     * Genere le HTML du tableau stats mobile pour une categorie et une equipe.
     * @param {string} variant - 'match' ou 'aggregated'
     */
    renderCategoryTable(playerTotals, category, teamLabel, teamClass, variant) {
        const cats = this.getCategories(variant);
        const catDef = cats[category];
        if (!catDef) return '';

        const players = this.sortPlayersForStats(Object.keys(playerTotals), playerTotals, category, catDef);
        if (players.length === 0) return '';

        const totals = StatsAggregator.computeTotals(playerTotals);
        var self = this;

        // Header avec tri
        let html = '<div class="stats-team-block">';
        html += '<div class="stats-team-title ' + teamClass + '">';
        html += '<span>' + Utils.escapeHtml(teamLabel) + '</span>';
        html += SharedComponents.renderAvgModeToggle();
        html += SharedComponents.renderDisplayModeToggle();
        html += '</div>';
        html += '<table class="stats-table"><thead><tr>';
        html += '<th data-sort-col="player" data-sort-cat="' + category + '">Joueur' + self._sortIcon('player', category) + '</th>';
        catDef.columns.forEach(function(col) {
            var sortKey = col.computed || col.key;
            html += '<th data-sort-col="' + sortKey + '" data-sort-cat="' + category + '">' + col.label + self._sortIcon(sortKey, category) + '</th>';
        });
        html += '</tr></thead><tbody>';

        // Lignes joueurs
        players.forEach(function(name) {
            const p = playerTotals[name];
            html += '<tr><td><div class="player-cell">';
            html += SharedComponents.renderRoleDots(name);
            html += Utils.escapeHtml(name);
            html += '</div></td>';
            catDef.columns.forEach(function(col) {
                html += SharedComponents.renderCell(p, category, col);
            });
            html += '</tr>';
        });

        // Ligne total
        // V19.1 fix : la cle UI 'passe' correspond a la cle data 'pass'
        var totDataKey = (category === 'passe') ? 'pass' : category;
        html += '<tr class="total-row"><td>Total</td>';
        var totalRowStats = { [totDataKey]: totals[totDataKey], service: totals.service, _setsPlayed: SharedComponents._totalSets };
        catDef.columns.forEach(function(col) {
            html += SharedComponents.renderCell(totalRowStats, category, col);
        });
        html += '</tr>';

        html += '</tbody></table></div>';
        return html;
    },

    /**
     * Genere une cellule de stat.
     * Supporte: colonnes normales, colonnes avec %, colonnes calculees (acePlus, faBp).
     */
    renderCell(playerStats, category, col) {
        // Cas special : moyenne service
        if (col.key === '_moy') {
            const cls = StatsAggregator.srvMoyClass(playerStats);
            return '<td class="' + cls + '">' + StatsAggregator.srvMoyDisplay(playerStats) + '</td>';
        }

        // V19.1 fix : la cle UI 'passe' correspond a la cle data 'pass'
        var dataKey = (category === 'passe') ? 'pass' : category;
        var catData = playerStats[dataKey] || {};
        var val, display, extraInfo = '';

        // Colonnes calculees
        if (col.computed === 'acePlus') {
            // Ace fusionne = ace + splus
            var srvData = playerStats.service || {};
            val = (srvData.ace || 0) + (srvData.splus || 0);
        } else if (col.computed === 'faBp') {
            // FA(BP) fusionne = fatt + bp, affiche bp entre parentheses
            var atkData = playerStats.attack || {};
            var fa = atkData.fatt || 0;
            var bp = atkData.bp || 0;
            val = fa + bp;
            if (bp > 0) extraInfo = '(' + bp + ')';
        } else if (col.computed === 'r1Fr') {
            // R1/FR fusionne = r1 + frec, affiche frec entre parentheses
            var recData = playerStats.reception || {};
            var r1 = recData.r1 || 0;
            var fr = recData.frec || 0;
            val = r1 + fr;
            if (fr > 0) extraInfo = '(' + fr + ')';
        } else if (col.computed === 'p1Fp') {
            // P1/FP fusionne = p1 + fp, affiche fp entre parentheses
            var passData2 = playerStats[dataKey] || {};
            var p1 = passData2.p1 || 0;
            var fp = passData2.fp || 0;
            val = p1 + fp;
            if (fp > 0) extraInfo = '(' + fp + ')';
        } else {
            val = catData[col.key] || 0;
        }

        // Pourcentage (calcule sur valeurs brutes, avant division moy)
        var pctVal = null;
        if (col.pct && val > 0) {
            var tot = catData.tot || 0;
            // Pour acePlus, le tot est dans service
            if (col.computed === 'acePlus') tot = (playerStats.service || {}).tot || 0;
            // Pour faBp, le tot est dans attack
            if (col.computed === 'faBp') tot = (playerStats.attack || {}).tot || 0;
            if (tot > 0) pctVal = Math.round(val / tot * 100);
        }

        // Mode Moy : diviser par sets joues
        if (this._avgMode === 'moy' && playerStats._setsPlayed > 1) {
            val = val / playerStats._setsPlayed;
            if (extraInfo) {
                var detailMoy = 0;
                if (col.computed === 'faBp') detailMoy = ((playerStats.attack || {}).bp || 0) / playerStats._setsPlayed;
                else if (col.computed === 'r1Fr') detailMoy = ((playerStats.reception || {}).frec || 0) / playerStats._setsPlayed;
                else if (col.computed === 'p1Fp') detailMoy = ((playerStats[dataKey] || {}).fp || 0) / playerStats._setsPlayed;
                extraInfo = '(' + (detailMoy % 1 === 0 ? detailMoy : detailMoy.toFixed(1)) + ')';
            }
        }

        var cls = val > 0 ? col.cls : '';

        if (val <= 0) {
            return '<td class="">-</td>';
        }

        // Formater la valeur (entier ou 1 decimale si moy)
        var displayVal = (val % 1 === 0) ? val : val.toFixed(1);

        // Mode % : pourcentage en grand, valeur absolue en petit
        if (this._displayMode === 'pct' && pctVal !== null) {
            var secondary = extraInfo ? displayVal + extraInfo : displayVal;
            return '<td class="' + cls + '">' + pctVal + '% <span class="stat-secondary">' + secondary + '</span></td>';
        }

        // Mode # (defaut) : valeur absolue en grand, pourcentage en petit
        var pctStr = pctVal !== null ? ' <span class="stat-pct">' + pctVal + '%</span>' : '';
        if (extraInfo) {
            return '<td class="' + cls + '">' + displayVal + extraInfo + pctStr + '</td>';
        }
        return '<td class="' + cls + '">' + displayVal + pctStr + '</td>';
    },

    /**
     * Genere le HTML complet desktop (multi-cartes horizontales) pour une equipe.
     * @param {string} variant - 'match' ou 'aggregated'
     */
    renderDesktopStatsTable(playerTotals, teamLabel, teamClass, variant) {
        const cats = this.getCategories(variant);
        const self = this;

        // Tri : si un tri par colonne est actif, l'appliquer globalement (toutes categories partagent le meme ordre joueurs)
        var players;
        if (this._statsSortCol && this._statsSortCol !== 'player' && this._statsSortCat) {
            var sortCatDef = cats[this._statsSortCat];
            if (sortCatDef) {
                players = this.sortPlayersForStats(Object.keys(playerTotals), playerTotals, this._statsSortCat, sortCatDef);
            } else {
                players = this.sortPlayers(Object.keys(playerTotals), playerTotals);
            }
        } else {
            players = this.sortPlayers(Object.keys(playerTotals), playerTotals);
        }
        if (players.length === 0) return '';

        const totals = StatsAggregator.computeTotals(playerTotals);
        let html = '';

        html += '<div class="stats-team-title ' + teamClass + '">';
        html += '<span>' + Utils.escapeHtml(teamLabel) + '</span>';
        html += SharedComponents.renderAvgModeToggle();
        html += SharedComponents.renderDisplayModeToggle();
        html += '</div>';
        html += '<div class="stats-tables-container">';

        // Colonne noms joueurs (sticky)
        html += '<div class="stats-players-col">';
        html += '<div class="player-header" data-sort-col="player">Joueur' + self._sortIcon('player', null) + '</div>';
        html += '<div class="player-subheader"></div>';
        players.forEach(function(name) {
            html += '<div class="player-name">' + Utils.escapeHtml(name) + '</div>';
        });
        html += '<div class="player-name total-row">Total</div>';
        html += '</div>';

        // Cartes par categorie
        var catKeys = ['service', 'reception', 'passe', 'attack', 'relance', 'defense', 'block'];
        catKeys.forEach(function(catKey) {
            var catDef = cats[catKey];
            html += '<div class="stat-table-card">';
            html += '<div class="stat-table-header ' + catKey + '">' + catDef.label + '</div>';
            html += '<table class="detail-stats-table"><thead><tr>';
            catDef.columns.forEach(function(col) {
                var sortKey = col.computed || col.key;
                html += '<th data-sort-col="' + sortKey + '" data-sort-cat="' + catKey + '">' + col.label + self._sortIcon(sortKey, catKey) + '</th>';
            });
            html += '</tr></thead><tbody>';

            players.forEach(function(name) {
                var p = playerTotals[name];
                html += '<tr>';
                catDef.columns.forEach(function(col) {
                    html += SharedComponents.renderCell(p, catKey, col);
                });
                html += '</tr>';
            });

            // Total
            // V19.1 fix : la cle UI 'passe' correspond a la cle data 'pass'
            var totDataK = (catKey === 'passe') ? 'pass' : catKey;
            html += '<tr class="total-row">';
            var totRowStats = { [totDataK]: totals[totDataK], service: totals.service, _setsPlayed: SharedComponents._totalSets };
            catDef.columns.forEach(function(col) {
                html += SharedComponents.renderCell(totRowStats, catKey, col);
            });
            html += '</tr>';

            html += '</tbody></table></div>';
        });

        html += '</div>';
        return html;
    },

    /**
     * Rendu detail passe avec ventilation Passeur/Autre + contextes.
     * Utilise en mobile (onglet Passe) et dans l'export texte.
     * @param {Object} playerTotals - {name: {pass: {passeur: {confort:...}, autre:...}}}
     * @param {string} teamLabel
     * @param {string} teamClass - 'home' ou 'away'
     */
    renderPassDetailView(playerTotals, teamLabel, teamClass) {
        var totals = StatsAggregator.computeTotals(playerTotals);
        var passData = totals.pass || {};
        if (!passData.tot && !passData.fp) return '';

        var cols = [
            { key: 'tot', label: 'Tot', cls: '' },
            { key: 'p4', label: 'P4', cls: 'positive', pct: true },
            { key: 'p3', label: 'P3', cls: '', pct: true },
            { key: 'p2', label: 'P2', cls: 'warning', pct: true },
            { key: '_p1Fp', label: 'P1/FP', cls: 'negative', pct: true, merged: ['p1', 'fp'], computed: 'p1Fp' }
        ];

        function cell(bucket, col, setsPlayed) {
            var v, detail = 0;
            if (col.merged) {
                v = (bucket[col.merged[0]] || 0) + (bucket[col.merged[1]] || 0);
                detail = bucket[col.merged[1]] || 0;
            } else {
                v = bucket[col.key] || 0;
            }
            if (v <= 0) return '<td class="">-</td>';
            var pctVal = null;
            if (col.key !== 'tot' && bucket.tot > 0) {
                pctVal = Math.round(v / bucket.tot * 100);
            }
            // Mode Moy : diviser par sets joues
            var detailMoy = detail;
            if (SharedComponents._avgMode === 'moy' && setsPlayed > 1) {
                v = v / setsPlayed;
                if (detail) detailMoy = detail / setsPlayed;
            }
            var colorCls = v > 0 ? col.cls : '';
            var displayVal = (v % 1 === 0) ? v : v.toFixed(1);
            var extraInfo = (col.merged && detail > 0) ? '(' + (detailMoy % 1 === 0 ? detailMoy : detailMoy.toFixed(1)) + ')' : '';
            if (SharedComponents._displayMode === 'pct' && pctVal !== null) {
                var secondary = extraInfo ? displayVal + extraInfo : displayVal;
                return '<td class="' + colorCls + '">' + pctVal + '% <span class="stat-secondary">' + secondary + '</span></td>';
            }
            var pct = pctVal !== null ? ' <span class="stat-pct">' + pctVal + '%</span>' : '';
            if (extraInfo) {
                return '<td class="' + colorCls + '">' + displayVal + extraInfo + pct + '</td>';
            }
            return '<td class="' + colorCls + '">' + displayVal + pct + '</td>';
        }

        function typeRow(label, bucket, cssClass) {
            var sp = SharedComponents._totalSets;
            var html = '<tr class="' + cssClass + '"><td>' + label + '</td>';
            cols.forEach(function(c) { html += cell(bucket, c, sp); });
            html += '</tr>';
            return html;
        }

        function ctxRow(label, bucket) {
            var sp = SharedComponents._totalSets;
            var html = '<tr class="pass-ctx-row"><td>\u2514 ' + label + '</td>';
            cols.forEach(function(c) { html += cell(bucket, c, sp); });
            html += '</tr>';
            return html;
        }

        var html = '<div class="stats-team-block">';
        html += '<div class="stats-team-title ' + teamClass + '">';
        html += '<span>' + Utils.escapeHtml(teamLabel) + '</span>';
        html += SharedComponents.renderAvgModeToggle();
        html += SharedComponents.renderDisplayModeToggle();
        html += '</div>';

        // -- Tableau par joueur (standard) --
        var passCatDef = { columns: cols };
        var players = SharedComponents.sortPlayersForStats(Object.keys(playerTotals), playerTotals, 'passe', passCatDef);
        html += '<table class="stats-table"><thead><tr>';
        html += '<th data-sort-col="player" data-sort-cat="passe">Joueur' + SharedComponents._sortIcon('player', 'passe') + '</th>';
        cols.forEach(function(c) {
            var sortKey = c.computed || c.key;
            html += '<th data-sort-col="' + sortKey + '" data-sort-cat="passe">' + c.label + SharedComponents._sortIcon(sortKey, 'passe') + '</th>';
        });
        html += '</tr></thead><tbody>';

        players.forEach(function(name) {
            var p = playerTotals[name].pass || {};
            var sp = playerTotals[name]._setsPlayed || 1;
            html += '<tr><td><div class="player-cell">';
            html += SharedComponents.renderRoleDots(name);
            html += Utils.escapeHtml(name);
            html += '</div></td>';
            cols.forEach(function(c) { html += cell(p, c, sp); });
            html += '</tr>';
        });

        // Total
        var totalSP = SharedComponents._totalSets;
        html += '<tr class="total-row"><td>Total</td>';
        cols.forEach(function(c) { html += cell(passData, c, totalSP); });
        html += '</tr>';
        html += '</tbody></table>';

        // -- Tableau ventilation equipe --
        var psr = passData.passeur || {};
        var aut = passData.autre || {};
        if (psr.tot || aut.tot || psr.fp || aut.fp) {
            html += '<div class="pass-ventilation-title">Ventilation equipe</div>';
            html += '<table class="stats-table pass-ventilation-table"><thead><tr><th></th>';
            cols.forEach(function(c) { html += '<th>' + c.label + '</th>'; });
            html += '</tr></thead><tbody>';

            html += typeRow('Passeur', psr, 'pass-type-row');
            if (psr.confort) html += ctxRow('Maxi', psr.confort);
            if (psr.contraint) html += ctxRow('Moyen', psr.contraint);
            if (psr.transition) html += ctxRow('Mini', psr.transition);

            html += typeRow('Autres', aut, 'pass-type-row');
            if (aut.contraint) html += ctxRow('Moyen', aut.contraint);
            if (aut.transition) html += ctxRow('Mini', aut.transition);

            html += '</tbody></table>';
        }

        html += '</div>';
        return html;
    },

    /**
     * Map de roles par joueur, positionne avant chaque render.
     * Format : { 'Didier': { primaryRole: 'R4', roles: { 'R4': 2, 'Pointu': 1 } } }
     */
    playerRolesMap: null,

    ROLE_COLORS_CSS: {
        'Passeur': 'var(--role-passeur)',
        'R4': 'var(--role-r4)',
        'Centre': 'var(--role-centre)',
        'Pointu': 'var(--role-pointu)'
    },

    ROLE_ORDER: { 'Passeur': 0, 'R4': 1, 'Pointu': 2, 'Centre': 3 },

    /**
     * Trie les joueurs par poste (Passeur → R4 → Pointu → Centre) puis par volume d'actions.
     */
    sortPlayers(names, playerTotals) {
        var self = this;
        return names.slice().sort(function(a, b) {
            var roleA = self.playerRolesMap && self.playerRolesMap[a] ? self.playerRolesMap[a].primaryRole : null;
            var roleB = self.playerRolesMap && self.playerRolesMap[b] ? self.playerRolesMap[b].primaryRole : null;
            var orderA = roleA ? (self.ROLE_ORDER[roleA] !== undefined ? self.ROLE_ORDER[roleA] : 9) : 9;
            var orderB = roleB ? (self.ROLE_ORDER[roleB] !== undefined ? self.ROLE_ORDER[roleB] : 9) : 9;
            if (orderA !== orderB) return orderA - orderB;
            // Meme poste : trier par volume total d'actions (decroissant)
            var totA = 0, totB = 0;
            var pa = playerTotals[a], pb = playerTotals[b];
            ['service', 'reception', 'attack', 'defense', 'block', 'relance'].forEach(function(cat) {
                totA += (pa[cat] && pa[cat].tot) || 0;
                totB += (pb[cat] && pb[cat].tot) || 0;
            });
            var passA = pa.pass || pa.passe || {}; totA += passA.tot || 0;
            var passB = pb.pass || pb.passe || {}; totB += passB.tot || 0;
            return totB - totA;
        });
    },

    /**
     * Retourne la couleur du role d'un joueur.
     * Utilise playerRolesMap si disponible, sinon fallback par nom.
     */
    getRoleColor(name) {
        if (this.playerRolesMap && this.playerRolesMap[name]) {
            var role = this.playerRolesMap[name].primaryRole;
            return this.ROLE_COLORS_CSS[role] || 'var(--text-secondary)';
        }
        const lower = name.toLowerCase();
        if (lower.includes('passeur')) return 'var(--role-passeur)';
        if (lower.includes('r4')) return 'var(--role-r4)';
        if (lower.includes('centre')) return 'var(--role-centre)';
        if (lower.includes('pointu')) return 'var(--role-pointu)';
        return 'var(--text-secondary)';
    },

    /**
     * Genere le HTML des pastilles de role pour un joueur.
     * Multi-postes : plusieurs pastilles si le joueur a joué différents rôles.
     */
    renderRoleDots(name) {
        if (this.playerRolesMap && this.playerRolesMap[name]) {
            var info = this.playerRolesMap[name];
            var roleKeys = Object.keys(info.roles || {});
            if (roleKeys.length > 1) {
                // Multi-pastilles empilées verticalement (comme Temps de jeu / Profils radar)
                var sorted = roleKeys.sort(function(a, b) { return (info.roles[b] || 0) - (info.roles[a] || 0); });
                var html = '<span class="role-dots">';
                for (var i = 0; i < sorted.length; i++) {
                    html += '<span class="role-dot role-dot-stacked" style="background:' + (this.ROLE_COLORS_CSS[sorted[i]] || 'var(--text-secondary)') + '"></span>';
                }
                html += '</span>';
                return html;
            }
            return '<span class="role-dot" style="background:' + (this.ROLE_COLORS_CSS[info.primaryRole] || 'var(--text-secondary)') + '"></span>';
        }
        return '<span class="role-dot" style="background:' + this.getRoleColor(name) + '"></span>';
    },

    // ==================== TIMELINE ====================

    buildTimelineData(set) {
        const points = set.points || [];
        if (points.length === 0) return [];

        const initialHome = set.initialHomeScore || 0;
        const runs = [];
        let currentRun = null;

        for (let i = 0; i < points.length; i++) {
            const pt = points[i];
            const prevHome = i > 0 ? points[i - 1].homeScore : initialHome;
            const scorer = pt.homeScore > prevHome ? 'home' : 'away';
            const teamScore = scorer === 'home' ? pt.homeScore : pt.awayScore;

            if (currentRun && currentRun.team === scorer) {
                currentRun.points.push({ teamScore: teamScore });
            } else {
                currentRun = { team: scorer, points: [{ teamScore: teamScore }] };
                runs.push(currentRun);
            }
        }
        return runs;
    },

    computeBlockSize(totalPoints, runsCount, containerWidth) {
        var availableWidth = containerWidth || 340;
        var gapWidth = Math.max(0, runsCount - 1) * 4;
        var internalGaps = totalPoints - runsCount;
        var blockWidth = Math.floor((availableWidth - gapWidth - internalGaps) / totalPoints);
        return Math.max(6, Math.min(20, blockWidth));
    },

    renderTimeline(match, containerId, setFilter) {
        var container = document.getElementById(containerId);
        var section = container ? container.parentElement : null;

        if (!match.sets) {
            if (section) section.style.display = 'none';
            return;
        }

        var completedSets = match.sets.filter(function(s) { return s.completed; });
        if (completedSets.length === 0 || !completedSets.some(function(s) { return s.points && s.points.length > 0; })) {
            if (section) section.style.display = 'none';
            return;
        }

        // Filtrer selon le set selectionne
        var setsToShow;
        if (setFilter !== undefined && setFilter !== 'all') {
            setsToShow = [completedSets[setFilter]].filter(Boolean);
        } else {
            setsToShow = completedSets;
        }

        if (setsToShow.length === 0 || !setsToShow.some(function(s) { return s.points && s.points.length > 0; })) {
            if (section) section.style.display = 'none';
            return;
        }

        if (section) section.style.display = 'block';

        // Calculer la largeur disponible
        var containerWidth = container.clientWidth || 340;

        var html = '';
        setsToShow.forEach(function(set, i) {
            // Retrouver l'index reel du set pour le label
            var realIndex = (setFilter !== undefined && setFilter !== 'all') ? setFilter : completedSets.indexOf(set);
            var runs = SharedComponents.buildTimelineData(set);
            var mixHome = set.mixiteHome || 0;
            var mixAway = set.mixiteAway || 0;
            var hasMix = mixHome > 0 || mixAway > 0;
            if (runs.length === 0 && !hasMix) return;

            var totalPoints = runs.reduce(function(sum, r) { return sum + r.points.length; }, 0);
            var totalMixBlocks = mixHome + mixAway;
            var totalAll = totalPoints + totalMixBlocks;
            var mixRuns = (mixHome > 0 ? 1 : 0) + (mixAway > 0 ? 1 : 0);
            var blockSize = SharedComponents.computeBlockSize(totalAll, runs.length + mixRuns, containerWidth);
            var fontSize = blockSize >= 14 ? 9 : (blockSize >= 10 ? 7 : 0);
            var blockHeight = 20;

            var homeScore = set.finalHomeScore || set.homeScore || 0;
            var awayScore = set.finalAwayScore || set.awayScore || 0;
            var homeWon = homeScore > awayScore;
            var label = realIndex === 4 ? 'Tie-break' : 'Set ' + (realIndex + 1);

            html += '<div class="timeline-set">';
            html += '<div class="timeline-header">';
            html += '<span class="timeline-set-label">' + label + '</span>';
            html += '<span class="timeline-set-score">';
            html += '<span class="' + (homeWon ? 'tl-score-win' : 'tl-score-loss') + '">' + homeScore + '</span>';
            html += '<span class="tl-sep">-</span>';
            html += '<span class="tl-score-opponent">' + awayScore + '</span>';
            html += '</span></div>';

            html += '<div class="timeline-chart">';

            // Blocs mixité gris au début
            if (mixHome > 0) {
                html += '<div class="timeline-run">';
                html += '<div class="timeline-row">';
                for (var m = 1; m <= mixHome; m++) {
                    html += '<div class="tl-block mixite" style="width:' + blockSize + 'px;height:' + blockHeight + 'px;font-size:' + fontSize + 'px;">' + (fontSize > 0 ? m : '') + '</div>';
                }
                html += '</div>';
                html += '<div class="timeline-row">';
                for (var m = 0; m < mixHome; m++) {
                    html += '<div class="tl-block empty" style="width:' + blockSize + 'px;height:' + blockHeight + 'px;"></div>';
                }
                html += '</div></div>';
            }
            if (mixAway > 0) {
                html += '<div class="timeline-run">';
                html += '<div class="timeline-row">';
                for (var m = 0; m < mixAway; m++) {
                    html += '<div class="tl-block empty" style="width:' + blockSize + 'px;height:' + blockHeight + 'px;"></div>';
                }
                html += '</div>';
                html += '<div class="timeline-row">';
                for (var m = 1; m <= mixAway; m++) {
                    html += '<div class="tl-block mixite" style="width:' + blockSize + 'px;height:' + blockHeight + 'px;font-size:' + fontSize + 'px;">' + (fontSize > 0 ? m : '') + '</div>';
                }
                html += '</div></div>';
            }

            runs.forEach(function(run) {
                html += '<div class="timeline-run">';
                // Top row (home)
                html += '<div class="timeline-row">';
                run.points.forEach(function(pt) {
                    if (run.team === 'home') {
                        html += '<div class="tl-block home" style="width:' + blockSize + 'px;height:' + blockHeight + 'px;font-size:' + fontSize + 'px;">' + (fontSize > 0 ? pt.teamScore : '') + '</div>';
                    } else {
                        html += '<div class="tl-block empty" style="width:' + blockSize + 'px;height:' + blockHeight + 'px;"></div>';
                    }
                });
                html += '</div>';
                // Bottom row (away)
                html += '<div class="timeline-row">';
                run.points.forEach(function(pt) {
                    if (run.team === 'away') {
                        html += '<div class="tl-block away" style="width:' + blockSize + 'px;height:' + blockHeight + 'px;font-size:' + fontSize + 'px;">' + (fontSize > 0 ? pt.teamScore : '') + '</div>';
                    } else {
                        html += '<div class="tl-block empty" style="width:' + blockSize + 'px;height:' + blockHeight + 'px;"></div>';
                    }
                });
                html += '</div>';
                html += '</div>';
            });
            html += '</div></div>';
        });

        container.innerHTML = html;
    },

    /**
     * Genere le bloc Side Out / Break Out.
     */
    renderSideOutBlock(match, setFilter, containerId) {
        var container = document.getElementById(containerId);
        if (!container) return;

        if (!match.sets) { container.innerHTML = ''; return; }

        var completedSets = match.sets.filter(function(s) { return s.completed; });
        var setsToUse = setFilter === 'all' ? completedSets : [completedSets[setFilter]].filter(Boolean);

        // Verifier qu'il y a des points
        var hasPoints = setsToUse.some(function(s) { return s.points && s.points.length > 0; });
        if (!hasPoints) { container.innerHTML = ''; return; }

        var stats = SideOutAnalysis.aggregateSideOutStats(setsToUse);
        var opponent = match.opponent || 'Adversaire';

        // Moyenne match (tous sets) pour comparaison quand on regarde un set specifique
        var allStats = null;
        if (setFilter !== 'all' && completedSets.length > 1) {
            allStats = SideOutAnalysis.aggregateSideOutStats(completedSets);
        }

        var html = '<table class="sideout-table">';
        html += '<thead><tr><th></th>';
        html += '<th>Jen</th>';
        html += '<th>' + Utils.escapeHtml(opponent) + '</th>';
        html += '</tr></thead><tbody>';

        html += '<tr><td>Side Out</td>';
        html += '<td class="home-val">' + (stats.home.soPercent !== null ? stats.home.soPercent + '%' : '-') + '</td>';
        html += '<td class="away-val">' + (stats.away.soPercent !== null ? stats.away.soPercent + '%' : '-') + '</td>';
        html += '</tr>';
        if (allStats) {
            html += '<tr class="moy-row"><td>Moy. match</td>';
            html += '<td class="moy-val">' + (allStats.home.soPercent !== null ? allStats.home.soPercent + '%' : '-') + '</td>';
            html += '<td class="moy-val">' + (allStats.away.soPercent !== null ? allStats.away.soPercent + '%' : '-') + '</td>';
            html += '</tr>';
        }

        html += '<tr><td>Break Out</td>';
        html += '<td class="home-val">' + (stats.home.brkPercent !== null ? stats.home.brkPercent + '%' : '-') + '</td>';
        html += '<td class="away-val">' + (stats.away.brkPercent !== null ? stats.away.brkPercent + '%' : '-') + '</td>';
        html += '</tr>';
        if (allStats) {
            html += '<tr class="moy-row"><td>Moy. match</td>';
            html += '<td class="moy-val">' + (allStats.home.brkPercent !== null ? allStats.home.brkPercent + '%' : '-') + '</td>';
            html += '<td class="moy-val">' + (allStats.away.brkPercent !== null ? allStats.away.brkPercent + '%' : '-') + '</td>';
            html += '</tr>';
        }

        html += '</tbody></table>';
        container.innerHTML = html;
    }
};

// ==================== BILAN VIEW (Spider Charts + IP) ====================
const BilanView = {

    // Mapping position → role (duplique match-live-helpers.js, pas d'import en vanilla)
    POSITION_ROLES_HOME: { 1: 'Passeur', 2: 'R4', 3: 'Centre', 4: 'Pointu' },
    POSITION_ROLES_AWAY: { 4: 'Passeur', 1: 'R4', 2: 'Centre', 3: 'Pointu' },

    ROLE_ORDER: ['Passeur', 'R4', 'Pointu', 'Centre'],

    // Familles de postes : regroupement pour spider charts multi-postes
    ROLE_TO_FAMILY: { 'Passeur': 'Passeur', 'R4': 'Ailier', 'Pointu': 'Ailier', 'Centre': 'Centre' },
    FAMILY_ORDER: ['Passeur', 'Ailier', 'Centre'],
    FAMILY_LABELS: { 'Passeur': 'Passeur', 'Ailier': 'Ailiers', 'Centre': 'Centre' },

    ROLE_COLORS: {
        'Passeur': '#8b5cf6',
        'R4': '#3b82f6',
        'Centre': '#ef4444',
        'Pointu': '#22c55e'
    },

    // Couleurs adverses : meme famille, teinte decalee (contraste fort)
    // Rollback : remplacer par _lightenColor(roleColor, 0.35) dans renderSpiderChart
    // V precedente : Passeur #a78bfa, R4 #60a5fa, Centre #f87171, Pointu #4ade80
    ROLE_COLORS_AWAY: {
        'Passeur': '#9A5CF6',   // violet decale
        'R4': '#3B41F6',        // bleu-indigo
        'Centre': '#F23333',    // rouge vif
        'Pointu': '#22C532'     // vert decale
    },

    // Ponderations IP par poste (V20.25)
    IP_WEIGHTS: {
        'Passeur': { attaque: 0.00, bloc: 0.00, relance: 0.05, reception: 0.00, defense: 0.35, passe: 0.35, service: 0.25 },
        'Centre':  { attaque: 0.10, bloc: 0.05, relance: 0.10, reception: 0.25, defense: 0.25, passe: 0.05, service: 0.20 },
        'R4':      { attaque: 0.45, bloc: 0.10, relance: 0.05, reception: 0.30, defense: 0.05, passe: 0.00, service: 0.05 },
        'Pointu':  { attaque: 0.45, bloc: 0.10, relance: 0.05, reception: 0.30, defense: 0.05, passe: 0.00, service: 0.05 }
    },

    // 7 axes du spider chart (heptagone, ordre UNIQUE pour tous les postes)
    // Espacement uniforme : 360/7 ≈ 51.43°
    // Sens horaire depuis le haut : Att → Blc → Rel → Srv → Pas → Def → Rec
    //            Att (-90°)
    //           /          \
    //    Rec (-141°)    Blc (-39°)
    //      |                |
    //   Def (167°)     Rel (13°)
    //      \              /
    //    Pas (116°)  Srv (64°)
    SPIDER_AXES: [
        { key: 'attaque',   label: 'Att',  angle: -90 },
        { key: 'bloc',      label: 'Blc',  angle: -38.57 },
        { key: 'relance',   label: 'Rel',  angle: 12.86 },
        { key: 'service',   label: 'Srv',  angle: 64.29 },
        { key: 'passe',     label: 'Pas',  angle: 115.71 },
        { key: 'defense',   label: 'Def',  angle: 167.14 },
        { key: 'reception', label: 'Rec',  angle: 218.57 }
    ],

    // Tous les postes utilisent SPIDER_AXES (ordre unique)
    SPIDER_AXES_PASSEUR: null,  // -> SPIDER_AXES
    SPIDER_AXES_CENTRE: null,   // -> SPIDER_AXES

    // --- Point d'entree ---
    render(match, container) {
        if (!match || !match.sets) {
            container.innerHTML = '<div style="text-align:center;color:var(--text-secondary);padding:20px;">Aucune donnée disponible</div>';
            return;
        }

        var completedSets = match.sets.filter(function(s) { return s.completed; });
        if (completedSets.length === 0) {
            container.innerHTML = '<div style="text-align:center;color:var(--text-secondary);padding:20px;">Aucun set terminé</div>';
            return;
        }

        var self = this;

        // Familles par joueur (avec indices des sets et roles specifiques)
        var homeFamilies = this.getPlayerFamilies(match, 'home');
        var awayFamilies = this.getPlayerFamilies(match, 'away');

        // Stats agregees completes (pour Distinctions)
        var homeTotals = StatsAggregator.aggregateStats(completedSets, 'home');
        var homeRoles = this.getPlayerRoles(match, 'home');
        var statCategories = ['service', 'reception', 'pass', 'attack', 'relance', 'defense', 'block'];
        var homePlayers = Object.keys(homeTotals).filter(function(name) {
            if (!homeRoles[name]) return false;
            var p = homeTotals[name];
            return statCategories.some(function(cat) { return p[cat] && p[cat].tot > 0; });
        });

        // --- Head to head : Jen (gauche) vs Adverse (droite) ---
        var html = '<div class="hist-section bilan-section collapsed">';
        html += '<div class="hist-section-title">Profils radar</div>';
        html += '<div class="bilan-h2h-header">';
        html += '<span class="bilan-h2h-team" style="color:#0056D2">Jen et ses Saints</span>';
        html += '<span class="bilan-h2h-vs">vs</span>';
        html += '<span class="bilan-h2h-team" style="color:#ea4335">' + Utils.escapeHtml(match.opponent || 'Adverse') + '</span>';
        html += '</div>';
        html += '<div class="bilan-compare-bar">';
        html += '<button class="bilan-compare-toggle" onclick="BilanView.toggleCompare(this)" title="Superposer l\'adversaire">';
        html += '<span class="bilan-compare-icon">👁</span> Comparer</button>';
        html += '</div>';

        html += '<div class="bilan-grid">';

        // --- Collecter toutes les donnees par famille, puis aplatir ---
        // Ordre de rendu : Passeur → R4 (IP) → Pointu (IP) → Centre
        // Slots de tri pour les ailiers : primaryRole distingue R4 de Pointu
        var SLOT_ORDER = ['Passeur', 'R4', 'Pointu', 'Centre'];
        var allHome = []; // { slot, data, family }
        var allAway = [];

        self.FAMILY_ORDER.forEach(function(family) {
            var familyAxes = self.SPIDER_AXES;
            var familyIpRole = (family === 'Ailier') ? 'R4' : family;

            function collectPlayers(familiesData) {
                var names = [];
                Object.keys(familiesData).forEach(function(name) {
                    if (familiesData[name].families[family]) names.push(name);
                });
                return names;
            }

            function computeFamilyData(names, familiesData, teamKey, side) {
                return names.map(function(name) {
                    var famData = familiesData[name].families[family];
                    var setIndices = famData.setIndices;
                    var roles = famData.roles;

                    var playerTotals = StatsAggregator.aggregateStatsBySetIndices(completedSets, teamKey, setIndices);
                    var stats = playerTotals[name] || StatsAggregator.initPlayerStats();

                    var effectiveRole = family;
                    var axes = familyAxes;
                    var ipRole = familyIpRole;

                    if (side === 'away' && family === 'Centre') {
                        var hasAttack = stats.attack && stats.attack.tot >= 2;
                        var hasBlock = stats.block && stats.block.tot >= 1;
                        if (hasAttack || hasBlock) {
                            axes = self.SPIDER_AXES;
                            ipRole = 'R4';
                            effectiveRole = 'R4';
                        }
                    }

                    var roleColors = Object.keys(roles).map(function(r) {
                        return self.ROLE_COLORS[r];
                    });
                    var primaryRoleInFamily = Object.keys(roles).sort(function(a, b) {
                        return roles[b] - roles[a];
                    })[0];
                    var primaryColor = self.ROLE_COLORS[primaryRoleInFamily];

                    var scores = self.computeAxisScores(stats, ipRole);
                    var ip = self.computeIP(scores, ipRole);

                    // Slot de tri : pour les ailiers, utiliser le role principal (R4 ou Pointu)
                    var slot = family;
                    if (family === 'Ailier') slot = primaryRoleInFamily;

                    return {
                        name: name, scores: scores, ip: ip, axes: axes,
                        effectiveRole: effectiveRole, primaryColor: primaryColor,
                        roleColors: roleColors, family: family, slot: slot
                    };
                });
            }

            var homeInFamily = collectPlayers(homeFamilies);
            var awayInFamily = collectPlayers(awayFamilies);

            var homeData = computeFamilyData(homeInFamily, homeFamilies, 'home', 'home');
            var awayData = computeFamilyData(awayInFamily, awayFamilies, 'away', 'away');

            // Filtrer joueurs sans stats
            function hasStats(d) {
                return d.scores.service > 0 || d.scores.reception > 0 || d.scores.passe > 0
                    || d.scores.attaque > 0 || d.scores.bloc > 0 || d.scores.relance > 0 || d.scores.defense > 0;
            }
            homeData.filter(hasStats).forEach(function(d) { allHome.push(d); });
            awayData.filter(hasStats).forEach(function(d) { allAway.push(d); });
        });

        // Grouper par slot et trier par IP desc au sein de chaque slot
        function groupBySlot(arr) {
            var groups = {};
            SLOT_ORDER.forEach(function(s) { groups[s] = []; });
            arr.forEach(function(d) {
                if (!groups[d.slot]) groups[d.slot] = [];
                groups[d.slot].push(d);
            });
            SLOT_ORDER.forEach(function(s) {
                groups[s].sort(function(a, b) { return b.ip - a.ip; });
            });
            return groups;
        }
        var homeBySlot = groupBySlot(allHome);
        var awayBySlot = groupBySlot(allAway);

        // Overlay par famille : meilleur adverse dans la meme famille
        var bestAwayByFamily = {};
        var bestHomeByFamily = {};
        self.FAMILY_ORDER.forEach(function(fam) {
            var bestA = null;
            allAway.forEach(function(d) { if (d.family === fam && (!bestA || d.ip > bestA.ip)) bestA = d; });
            if (bestA) bestAwayByFamily[fam] = { scores: bestA.scores, role: bestA.effectiveRole, name: bestA.name, ip: bestA.ip };
            var bestH = null;
            allHome.forEach(function(d) { if (d.family === fam && (!bestH || d.ip > bestH.ip)) bestH = d; });
            if (bestH) bestHomeByFamily[fam] = { scores: bestH.scores, role: bestH.effectiveRole, name: bestH.name, ip: bestH.ip };
        });

        // Rendu paires home/away alignees par slot
        SLOT_ORDER.forEach(function(slot) {
            var homeSlot = homeBySlot[slot] || [];
            var awaySlot = awayBySlot[slot] || [];
            var maxLen = Math.max(homeSlot.length, awaySlot.length);
            if (maxLen === 0) return;

            for (var i = 0; i < maxLen; i++) {
                if (homeSlot[i]) {
                    var h = homeSlot[i];
                    html += self.renderSpiderChart(h.name, h.effectiveRole, h.scores, h.ip, h.primaryColor, h.axes, false, bestAwayByFamily[h.family], h.roleColors);
                } else {
                    html += '<div class="bilan-player-card bilan-player-empty"></div>';
                }

                if (awaySlot[i]) {
                    var a = awaySlot[i];
                    html += self.renderSpiderChart(a.name, a.effectiveRole, a.scores, a.ip, a.primaryColor, a.axes, true, bestHomeByFamily[a.family], a.roleColors);
                } else {
                    html += '<div class="bilan-player-card bilan-player-empty"></div>';
                }
            }
        });

        html += '</div>'; // ferme bilan-grid
        html += '</div>'; // ferme bilan-section

        // Section Impact +/-
        html += ImpactView.renderForMatch(match, 'home');

        // Section Relation Passe/Attaque (V23)
        html += PassAttackAnalyzer.renderForMatch(match, 'home');

        container.innerHTML = html;
    },

    // --- Helper : formater un pourcentage ---
    _pct(num, den) {
        if (den === 0) return '0%';
        return Math.round(num / den * 100) + '%';
    },

    // --- Distinctions : MVP + meilleurs joueurs par categorie ---
    // V20.26 : unifie sur computeAxisScores + IP_MIN_ACTIONS pour coherence avec spider charts
    renderDistinctions(homeTotals, playerRoles, filteredPlayers) {
        var self = this;
        var players = filteredPlayers || Object.keys(homeTotals).filter(function(name) {
            return playerRoles[name];
        });
        var minActions = self.IP_MIN_ACTIONS;

        // --- Calculer axes + IP de chaque joueur une seule fois ---
        var playerData = {};
        players.forEach(function(name) {
            var role = playerRoles[name].primaryRole;
            var axes = self.computeAxisScores(homeTotals[name], role);
            var ip = self.computeIP(axes, role);
            playerData[name] = { role: role, axes: axes, ip: ip, stats: homeTotals[name] };
        });

        // --- Helper : trouver le meilleur joueur sur un axe ---
        // eligibleRoles : tableau optionnel de roles eligibles (ex: ['Passeur','Centre'])
        // customScoreFn : fonction optionnelle (stats) => score pour remplacer le score d'axe
        // Seuil : un joueur doit avoir >= 5% du total des actions de la categorie
        function findBestOnAxis(axisKey, eligibleRoles, customScoreFn) {
            // Calculer le total d'actions de tous les joueurs pour cet axe
            var totalActions = 0;
            players.forEach(function(name) {
                var d = playerData[name];
                var tot = d.axes._tots ? d.axes._tots[axisKey] : 0;
                totalActions += (tot || 0);
            });

            var bestName = null, bestScore = -1;
            players.forEach(function(name) {
                var d = playerData[name];
                // Filtrer par role si specifie
                if (eligibleRoles && eligibleRoles.indexOf(d.role) === -1) return;
                // Score : custom ou axe standard
                var score = customScoreFn ? customScoreFn(d.stats) : (d.axes[axisKey] || 0);
                if (score <= 0) return;
                // Verifier seuil minimum via _tots
                var tot = d.axes._tots ? d.axes._tots[axisKey] : undefined;
                if (tot !== undefined && minActions[axisKey] && tot < minActions[axisKey]) return;
                // Seuil proportionnel : au moins 5% du total des actions de la categorie
                if (totalActions > 0 && tot !== undefined && tot / totalActions < 0.05) return;
                if (score > bestScore) {
                    bestScore = score;
                    bestName = name;
                }
            });
            return bestName ? { name: bestName, score: bestScore } : null;
        }

        // --- Trouver le MVP (meilleur IP) ---
        var mvpName = null, mvpIP = -1;
        players.forEach(function(name) {
            if (playerData[name].ip > mvpIP) {
                mvpIP = playerData[name].ip;
                mvpName = name;
            }
        });

        var html = '<div class="bilan-distinctions">';

        // --- MVP ---
        if (mvpName) {
            var mvp = playerData[mvpName];
            var mvpColor = self.ROLE_COLORS[mvp.role] || '#5f6368';
            html += '<div class="distinction-row distinction-mvp">';
            html += '<div class="distinction-header">';
            html += '<span class="distinction-emoji">👑</span>';
            html += '<span class="distinction-label">MVP</span>';
            html += '<span class="bilan-role-dot" style="background:' + mvpColor + '"></span>';
            html += '<span class="distinction-name">' + Utils.escapeHtml(mvpName) + '</span>';
            html += '</div>';
            html += '<div class="distinction-stats">';
            html += '<span class="distinction-stat-highlight">IP ' + mvpIP + '</span>';
            html += '<span class="distinction-stat-detail">' + self._mvpStats(mvp.stats, mvp.role) + '</span>';
            html += '</div>';
            html += '</div>';
        }

        // --- Definition des distinctions par axe ---
        var distinctions = [
            { axisKey: 'service',   emoji: '🎯', label: 'Meilleur Serveur',       statsFn: function(s) {
                var srv = s.service;
                var recCount = srv.recCountAdv + srv.ace;
                var moy = recCount > 0 ? srv.recSumAdv / recCount : 0;
                return 'Tot : ' + srv.tot + ' · Ace : ' + srv.ace + ' (' + self._pct(srv.ace, srv.tot) + ')' +
                       ' · FS : ' + srv.fser + ' (' + self._pct(srv.fser, srv.tot) + ')' +
                       ' · Moy Adv : ' + moy.toFixed(1);
            }},
            { axisKey: 'reception', emoji: '🏐', label: 'Meilleur Réceptionneur', statsFn: function(s) {
                var r = s.reception;
                var moy = r.tot > 0 ? (r.r4 * 4 + r.r3 * 3 + r.r2 * 2 + r.r1 * 1) / r.tot : 0;
                return 'R4 : ' + r.r4 + ' (' + self._pct(r.r4, r.tot) + ')' +
                       ' · R1(FR) : ' + (r.r1 + r.frec) + ' (' + self._pct(r.r1 + r.frec, r.tot) + ')' +
                       ' · Moy : ' + moy.toFixed(1);
            }},
            { axisKey: 'attaque',   emoji: '⚔️', label: 'Meilleur Attaquant',     statsFn: function(s) {
                var a = s.attack;
                return 'A+ : ' + a.attplus + ' (' + self._pct(a.attplus, a.tot) + ')' +
                       ' · A- : ' + a.attminus + ' (' + self._pct(a.attminus, a.tot) + ')' +
                       ' · FA(BP) : ' + a.fatt + '(' + a.bp + ') (' + self._pct(a.fatt + a.bp, a.tot) + ')';
            }},
            { axisKey: 'defense',   emoji: '🛡️', label: 'Meilleur Défenseur',     eligibleRoles: ['Passeur', 'Centre'], statsFn: function(s) {
                var d = s.defense;
                var rl = s.relance;
                return 'D+ : ' + d.defplus + ' · D- : ' + d.defminus + ' · FD : ' + d.fdef +
                       ' · R+ : ' + rl.relplus + ' · R- : ' + rl.relminus + ' · FR : ' + rl.frel;
            }},
            { axisKey: 'bloc',      emoji: '🧱', label: 'Meilleur Bloqueur',
              // Score custom : meme formule que computeAxisScores mais volume normalise par set joue
              // Cela recompense la production par set (presence au filet) plutot que le total brut
              // Un joueur qui bloque 6/set sur 11 sets bat un joueur qui bloque 3.6/set sur 15 sets
              customScoreFn: function(stats) {
                var blk = stats.block;
                if (!blk || blk.tot <= 0) return 0;
                var setsPlayed = stats._setsPlayed || 1;
                var effectiveSuccess = (blk.blcplus + blk.blcminus * 0.5) / blk.tot;
                var perSetTot = blk.tot / setsPlayed;
                var volBonus = Math.min(perSetTot, 6) * 5;
                return self.clamp(self.AXIS_FLOOR, 100, Math.round(20 + effectiveSuccess * 50 + volBonus));
              },
              statsFn: function(s) {
                var b = s.block;
                return 'B+ : ' + b.blcplus + ' (' + self._pct(b.blcplus, b.tot) + ')' +
                       ' · B- : ' + b.blcminus + ' (' + self._pct(b.blcminus, b.tot) + ')' +
                       ' · FB : ' + b.fblc + ' (' + self._pct(b.fblc, b.tot) + ')';
            }}
        ];

        distinctions.forEach(function(dist) {
            var best = findBestOnAxis(dist.axisKey, dist.eligibleRoles, dist.customScoreFn);
            if (!best) return;
            var d = playerData[best.name];
            var color = self.ROLE_COLORS[d.role] || '#5f6368';
            html += '<div class="distinction-row">';
            html += '<div class="distinction-header">';
            html += '<span class="distinction-emoji">' + dist.emoji + '</span>';
            html += '<span class="distinction-label">' + dist.label + '</span>';
            html += '<span class="bilan-role-dot" style="background:' + color + '"></span>';
            html += '<span class="distinction-name">' + Utils.escapeHtml(best.name) + '</span>';
            html += '</div>';
            html += '<div class="distinction-stats">';
            html += '<span class="distinction-stat-highlight">IP ' + d.ip + '</span>';
            html += '<span class="distinction-stat-detail">' + dist.statsFn(d.stats) + '</span>';
            html += '</div>';
            html += '</div>';
        });

        html += '</div>'; // bilan-distinctions
        return html;
    },

    // --- Helper : trouver le meilleur joueur ---
    _findBest(players, computeFn) {
        var best = null;
        var bestName = null;
        players.forEach(function(name) {
            var result = computeFn(name);
            if (result && (!best || result.score > best.score)) {
                best = result;
                bestName = name;
            }
        });
        return bestName ? { name: bestName, data: best } : null;
    },

    // --- Helper : stats MVP selon le poste ---
    _mvpStats(stats, role) {
        var self = this;
        if (role === 'Passeur') {
            var p = stats.pass || {};
            var d = stats.defense;
            var s = stats.service;
            var parts = [];
            if (p.tot > 0) parts.push('P4 : ' + (p.p4 || 0) + ' (' + self._pct(p.p4 || 0, p.tot) + ')');
            if (d.tot > 0) parts.push('D+ : ' + d.defplus);
            if (s.tot > 0) parts.push('Ace : ' + s.ace);
            return parts.join(' · ');
        }
        if (role === 'Centre') {
            var r = stats.reception;
            var d = stats.defense;
            var s = stats.service;
            var parts = [];
            if (s.tot > 0) parts.push('Ace : ' + s.ace);
            if (r.tot > 0) {
                var moy = (r.r4 * 4 + r.r3 * 3 + r.r2 * 2 + r.r1 * 1) / r.tot;
                parts.push('Rec Moy : ' + moy.toFixed(1));
            }
            if (d.tot > 0) parts.push('D+ : ' + d.defplus);
            return parts.join(' · ');
        }
        // Ailiers (R4, Pointu)
        var a = stats.attack;
        var b = stats.block;
        var r = stats.reception;
        var parts = [];
        if (a.tot > 0) parts.push('A+ : ' + a.attplus + ' (' + self._pct(a.attplus, a.tot) + ')');
        if (b.tot > 0) parts.push('B+ : ' + b.blcplus);
        if (r.tot > 0) {
            var moy = (r.r4 * 4 + r.r3 * 3 + r.r2 * 2 + r.r1 * 1) / r.tot;
            parts.push('Rec : ' + moy.toFixed(1));
        }
        return parts.join(' · ');
    },

    // --- Determiner le role primaire de chaque joueur depuis les lineups ---
    getPlayerRoles(match, team, setFilter) {
        var roleCounts = {};
        var self = this;
        var side = team || 'home';
        // Utiliser initialLineup (feuille de match) plutot que lineup courant (apres substitutions)
        var initialKey = (side === 'away') ? 'initialAwayLineup' : 'initialHomeLineup';
        var lineupKey = (side === 'away') ? 'awayLineup' : 'homeLineup';
        var positionRoles = (side === 'away') ? self.POSITION_ROLES_AWAY : self.POSITION_ROLES_HOME;
        var completedSets = (match.sets || []).filter(function(s) { return s.completed; });

        // V20.69 : filtrer par set si setFilter spécifié (index numérique)
        var setsToScan = completedSets;
        if (typeof setFilter === 'number') {
            setsToScan = [completedSets[setFilter]].filter(Boolean);
        }

        setsToScan.forEach(function(set) {
            var lineup = set[initialKey] || set[lineupKey];
            if (!lineup) return;
            Object.keys(lineup).forEach(function(pos) {
                var playerName = lineup[pos];
                if (!playerName) return;
                var role = positionRoles[pos];
                if (!role) return;
                if (!roleCounts[playerName]) roleCounts[playerName] = {};
                roleCounts[playerName][role] = (roleCounts[playerName][role] || 0) + 1;
            });
            // V20.26 : inclure aussi les joueurs entrés en substitution (lineup final)
            var finalLineup = set[lineupKey];
            if (finalLineup && finalLineup !== lineup) {
                Object.keys(finalLineup).forEach(function(pos) {
                    var playerName = finalLineup[pos];
                    if (!playerName) return;
                    if (roleCounts[playerName]) return; // Déjà compté via initialLineup
                    var role = positionRoles[pos];
                    if (!role) return;
                    roleCounts[playerName] = {};
                    roleCounts[playerName][role] = 1;
                });
            }
        });

        var result = {};
        Object.keys(roleCounts).forEach(function(name) {
            var roles = roleCounts[name];
            var primary = Object.keys(roles).sort(function(a, b) { return roles[b] - roles[a]; })[0];
            result[name] = { primaryRole: primary, roles: roles };
        });
        return result;
    },

    // Retourne par joueur : familles jouees, indices des sets, roles specifiques
    // Ex: { "Alex": { families: { "Ailier": { setIndices: [0,1], roles: { R4:1, Pointu:1 } } } } }
    getPlayerFamilies(match, team) {
        var self = this;
        var side = team || 'home';
        var initialKey = (side === 'away') ? 'initialAwayLineup' : 'initialHomeLineup';
        var lineupKey = (side === 'away') ? 'awayLineup' : 'homeLineup';
        var positionRoles = (side === 'away') ? self.POSITION_ROLES_AWAY : self.POSITION_ROLES_HOME;
        var completedSets = (match.sets || []).filter(function(s) { return s.completed; });
        var result = {};

        completedSets.forEach(function(set, setIndex) {
            // V20.26 : helper pour ajouter un joueur depuis un lineup
            function addFromLineup(lu) {
                if (!lu) return;
                Object.keys(lu).forEach(function(pos) {
                    var playerName = lu[pos];
                    if (!playerName) return;
                    var role = positionRoles[pos];
                    if (!role) return;
                    var family = self.ROLE_TO_FAMILY[role];
                    if (!family) return;

                    if (!result[playerName]) result[playerName] = { families: {} };
                    if (!result[playerName].families[family]) {
                        result[playerName].families[family] = { setIndices: [], roles: {} };
                    }
                    var fam = result[playerName].families[family];
                    if (fam.setIndices.indexOf(setIndex) === -1) {
                        fam.setIndices.push(setIndex);
                    }
                    fam.roles[role] = (fam.roles[role] || 0) + 1;
                });
            }
            var lineup = set[initialKey] || set[lineupKey];
            addFromLineup(lineup);
            // V20.26 : inclure aussi les joueurs entrés en substitution
            var finalLineup = set[lineupKey];
            if (finalLineup && finalLineup !== lineup) {
                Object.keys(finalLineup).forEach(function(pos) {
                    var playerName = finalLineup[pos];
                    if (!playerName || result[playerName]) return; // Déjà compté
                    addFromLineup(finalLineup);
                });
            }
        });

        return result;
    },

    // --- Helpers pour Stats Annee ---

    _median(arr) {
        if (!arr || arr.length === 0) return 0;
        var sorted = arr.slice().sort(function(a, b) { return a - b; });
        var mid = Math.floor(sorted.length / 2);
        return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
    },

    _mergePlayerStats(target, source) {
        var cats = ['service', 'reception', 'attack', 'relance', 'defense', 'block'];
        cats.forEach(function(cat) {
            if (!source[cat]) return;
            Object.keys(target[cat]).forEach(function(k) {
                if (typeof target[cat][k] === 'number') {
                    target[cat][k] += (source[cat][k] || 0);
                }
            });
        });
        // Passe (plat)
        if (source.pass) {
            var pKeys = ['tot', 'p4', 'p3', 'p2', 'p1', 'fp'];
            pKeys.forEach(function(k) { target.pass[k] += (source.pass[k] || 0); });
            ['passeur', 'autre'].forEach(function(pType) {
                if (!source.pass[pType]) return;
                pKeys.forEach(function(k) { target.pass[pType][k] += (source.pass[pType][k] || 0); });
                var ctxs = pType === 'passeur' ? ['confort', 'contraint', 'transition'] : ['contraint', 'transition'];
                ctxs.forEach(function(ctx) {
                    if (!source.pass[pType][ctx]) return;
                    pKeys.forEach(function(k) { target.pass[pType][ctx][k] += (source.pass[pType][ctx][k] || 0); });
                });
            });
        }
    },

    getPlayerRolesYear(matches, team) {
        var self = this;
        var side = team || 'home';
        var mergedCounts = {};
        matches.forEach(function(match) {
            var roles = self.getPlayerRoles(match, side);
            Object.keys(roles).forEach(function(name) {
                if (!mergedCounts[name]) mergedCounts[name] = {};
                Object.keys(roles[name].roles).forEach(function(role) {
                    mergedCounts[name][role] = (mergedCounts[name][role] || 0) + roles[name].roles[role];
                });
            });
        });
        var result = {};
        Object.keys(mergedCounts).forEach(function(name) {
            var roles = mergedCounts[name];
            var primary = Object.keys(roles).sort(function(a, b) { return roles[b] - roles[a]; })[0];
            result[name] = { primaryRole: primary, roles: roles };
        });
        return result;
    },

    getPlayerFamiliesYear(matches) {
        var self = this;
        var result = {};
        matches.forEach(function(match, matchIndex) {
            var completedSets = (match.sets || []).filter(function(s) { return s.completed; });
            completedSets.forEach(function(set, setIndex) {
                // V20.26 : helper pour ajouter un joueur depuis un lineup
                function addPlayer(pos, playerName) {
                    if (!playerName) return;
                    var role = self.POSITION_ROLES_HOME[pos];
                    if (!role) return;
                    var family = self.ROLE_TO_FAMILY[role];
                    if (!family) return;

                    if (!result[playerName]) result[playerName] = { primaryFamily: null, families: {} };
                    if (!result[playerName].families[family]) {
                        result[playerName].families[family] = { matchSets: [], roles: {}, totalSets: 0 };
                    }
                    var fam = result[playerName].families[family];
                    fam.roles[role] = (fam.roles[role] || 0) + 1;
                    fam.totalSets++;

                    // Ajouter le setIndex au matchSets correspondant
                    var ms = fam.matchSets.find(function(m) { return m.matchIndex === matchIndex; });
                    if (!ms) {
                        ms = { matchIndex: matchIndex, setIndices: [] };
                        fam.matchSets.push(ms);
                    }
                    if (ms.setIndices.indexOf(setIndex) === -1) {
                        ms.setIndices.push(setIndex);
                    }
                }
                var lineup = set.initialHomeLineup || set.homeLineup;
                if (!lineup) return;
                Object.keys(lineup).forEach(function(pos) { addPlayer(pos, lineup[pos]); });
                // V20.26 : inclure aussi les joueurs entrés en substitution
                var finalLineup = set.homeLineup;
                if (finalLineup && finalLineup !== lineup) {
                    Object.keys(finalLineup).forEach(function(pos) {
                        var playerName = finalLineup[pos];
                        if (!playerName || result[playerName]) return; // Déjà compté
                        addPlayer(pos, playerName);
                    });
                }
            });
        });

        // Determiner primaryFamily par joueur
        var familyOrder = self.FAMILY_ORDER;
        Object.keys(result).forEach(function(name) {
            var families = result[name].families;
            var best = null;
            var bestCount = -1;
            Object.keys(families).forEach(function(fam) {
                var count = families[fam].totalSets;
                if (count > bestCount || (count === bestCount && familyOrder.indexOf(fam) < familyOrder.indexOf(best))) {
                    best = fam;
                    bestCount = count;
                }
            });
            result[name].primaryFamily = best;
        });

        return result;
    },

    aggregateStatsForFamilyYear(matches, playerName, familyData) {
        var self = this;
        var merged = StatsAggregator.initPlayerStats();
        familyData.matchSets.forEach(function(ms) {
            var match = matches[ms.matchIndex];
            if (!match) return;
            var completedSets = (match.sets || []).filter(function(s) { return s.completed; });
            var playerTotals = StatsAggregator.aggregateStatsBySetIndices(completedSets, 'home', ms.setIndices);
            var stats = playerTotals[playerName];
            if (stats) {
                self._mergePlayerStats(merged, stats);
            }
        });
        return merged;
    },

    computeMedianIPForFamily(matches, playerFamiliesYear, family) {
        var self = this;
        var familyIpRole = (family === 'Ailier') ? 'R4' : family;
        var results = [];

        Object.keys(playerFamiliesYear).forEach(function(name) {
            var pData = playerFamiliesYear[name];
            if (pData.primaryFamily !== family) return;
            var famData = pData.families[family];
            if (!famData) return;

            var perMatchIPs = [];
            famData.matchSets.forEach(function(ms) {
                var match = matches[ms.matchIndex];
                if (!match) return;
                var completedSets = (match.sets || []).filter(function(s) { return s.completed; });
                var playerTotals = StatsAggregator.aggregateStatsBySetIndices(completedSets, 'home', ms.setIndices);
                var stats = playerTotals[name];
                if (!stats) return;
                var scores = self.computeAxisScores(stats, familyIpRole);
                var ip = self.computeIP(scores, familyIpRole);
                perMatchIPs.push(ip);
            });

            if (perMatchIPs.length > 0) {
                results.push({
                    name: name,
                    medianIP: self._median(perMatchIPs),
                    matchCount: perMatchIPs.length
                });
            }
        });

        results.sort(function(a, b) { return b.medianIP - a.medianIP; });
        return results;
    },

    // Score plancher par axe : evite les polygones ecrases pour les postes
    // qui n'interviennent pas sur certains axes (ex: passeur sans attaque/bloc)
    // Plancher = 10 pour les axes secondaires, 0 pour tot=0 si le joueur n'a
    // simplement jamais ete sollicite sur cet axe (normal pour son poste)
    AXIS_FLOOR: 10,

    // --- Calcul des scores 0-100 par axe depuis les stats brutes ---
    // Formules calibrees pour produire des polygones avec du volume :
    // - Score plancher pour eviter l'ecrasement
    // - Echelle genereuse : un joueur "correct" doit etre a 50-60, pas 30
    // - Bonus participation pour recompenser le volume d'actions
    // role: optionnel, utilise pour le bonus/plafond passe (Passeur +5, non-passeur cap 80)
    computeAxisScores(playerStats, role) {
        var scores = {};
        var s = playerStats;
        var floor = this.AXIS_FLOOR;

        // SERVICE (V20.26) : moyenne adverse recentrée sur 3.5 + bonus volume
        // Echelle : moy 2.0 + aces = 90+, moy 2.7 + peu de fautes = 65-70, moy 3.5 = 40-50
        var srv = s.service;
        if (srv.tot >= 3) {
            var aceRate = (srv.ace + srv.splus) / srv.tot;
            var faultRate = srv.fser / srv.tot;
            var recCount = srv.recCountAdv + srv.ace;
            // Moyenne adverse recentrée : 3.5 = neutre, < 3.5 = bonus, > 3.5 = pénalité
            var moyBonus = recCount > 0 ? (3.5 - srv.recSumAdv / recCount) * 20 : 0;
            // Bonus volume : servir beaucoup = fiabilite prouvee (plafonné à 60)
            var volBonus = Math.min(srv.tot, 60) * 0.3;
            var raw = 30 + moyBonus + aceRate * 80 - faultRate * 80 + volBonus;
            scores.service = this.clamp(floor, 100, Math.round(raw));
        } else {
            scores.service = 0;
        }

        // RECEPTION (V20.26) : moyenne ponderee + bonus taux positif (R4+R3)
        // Bonus : un joueur avec >50% de R4+R3 est recompense pour sa regularite
        var rec = s.reception;
        if (rec.tot > 0) {
            var recRaw = (rec.r4 * 100 + rec.r3 * 75 + rec.r2 * 40 + rec.r1 * 15) / rec.tot;
            // Bonus taux positif : (R4+R3)/tot au-dessus de 50% → jusqu'à +10
            var positiveRate = (rec.r4 + rec.r3) / rec.tot;
            var recBonus = Math.max(0, positiveRate - 0.5) * 20;
            scores.reception = this.clamp(floor, 100, Math.round(recRaw + recBonus));
        } else {
            scores.reception = 0;
        }

        // PASSE (V22.05) : P4 majore pour recompenser la precision — plafond non-passeur (80)
        var pas = s.pass || {};
        if (pas.tot > 0) {
            var passeRaw = (pas.p4 * 120 + pas.p3 * 60 + pas.p2 * 30 + pas.p1 * 10) / pas.tot;
            if (role === 'Passeur') {
                passeRaw += 5; // Bonus passeur : son role premier, recompense la constance
            } else if (role) {
                passeRaw = Math.min(passeRaw, 80); // Non-passeur plafonne a 80
            }
            scores.passe = this.clamp(floor, 100, Math.round(passeRaw));
        } else {
            scores.passe = 0;
        }

        // ATTAQUE (V20.26) : base 35 + kill% bonus - error penalty (30→40)
        // Seuil minimum 3 attaques pour eviter les scores gonfles (1 kill = 100)
        var atk = s.attack;
        if (atk.tot >= 3) {
            var killPct = atk.attplus / atk.tot;
            var errorPct = (atk.fatt + atk.bp) / atk.tot;
            var raw = 40 + killPct * 80 - errorPct * 40;
            scores.attaque = this.clamp(floor, 100, Math.round(raw));
        } else {
            scores.attaque = 0;
        }

        // BLOC : B- compte comme demi-positif (ralentir l'attaque = utile)
        // + bonus volume (toucher des blocs = bien, meme sans kill)
        var blk = s.block;
        if (blk.tot > 0) {
            var effectiveSuccess = (blk.blcplus + blk.blcminus * 0.5) / blk.tot;
            var raw = 20 + effectiveSuccess * 50 + Math.min(blk.tot, 6) * 5;
            scores.bloc = this.clamp(floor, 100, Math.round(raw));
        } else {
            scores.bloc = 0;
        }

        // RELANCE : base 30 + taux R+ - fault penalty
        var rel = s.relance;
        if (rel && rel.tot > 0) {
            var relPosRate = rel.relplus / rel.tot;
            var relFaultRate = rel.frel / rel.tot;
            var raw = 30 + relPosRate * 50 + (1 - relFaultRate) * 20;
            scores.relance = this.clamp(floor, 100, Math.round(raw));
        } else {
            scores.relance = 0;
        }

        // DEFENSE (V20.25) : refonte complete
        // Base 40 + D+% bonus (×60) + D% neutre (×15) - D-% penalite (×15) - FD% penalite (×25)
        // + bonus volume : min(tot, 15) × 1.5 (recompense la participation defensive)
        var def = s.defense;
        if (def.tot > 0) {
            var posRate = def.defplus / def.tot;
            var neutralRate = (def.defneutral || 0) / def.tot;
            var negRate = def.defminus / def.tot;
            var faultRate = def.fdef / def.tot;
            var raw = 40 + posRate * 60 + neutralRate * 15 - negRate * 15 - faultRate * 25 + Math.min(def.tot, 15) * 1.5;
            scores.defense = this.clamp(floor, 100, Math.round(raw));
        } else {
            scores.defense = 0;
        }

        // Stocker les volumes bruts par axe (V20.25)
        // Utilises par computeIP pour le seuil minimum d'echantillon
        scores._tots = {
            service: srv.tot,
            reception: rec.tot,
            reception_r4: rec.r4,  // V20.285 : discriminant ailier 1 recep R4
            passe: (pas.tot || 0),
            attaque: atk.tot,
            bloc: blk.tot,
            relance: (rel && rel.tot) || 0,
            defense: def.tot
        };

        return scores;
    },

    // Seuils minimums d'actions par axe pour compter dans l'IP (V20.25)
    // Si tot < seuil, le score est VISIBLE sur le spider chart mais EXCLU de l'IP
    // Evite qu'un joueur avec 2 services dont 1 ace ait un IP gonfle
    IP_MIN_ACTIONS: {
        service: 5,     // 2 services = pas significatif
        reception: 2,   // 1 reception ratee = pas representatif, 2+ = ok
        passe: 3,       // 1-2 passes = anecdotique
        attaque: 3,     // 1-2 attaques = pas significatif
        bloc: 1,        // le bloc est rare, 1 suffit
        relance: 5,     // V22.05 : 2-4 relances donnent souvent score 100 → non significatif
        defense: 2      // 1 defense = anecdotique
    },

    // --- Indice de Performance (somme ponderee par poste) ---
    // V20.26 : redistribution partielle 50% des poids des axes inactifs
    // Un axe inactif ne redistribue que 50% de son poids aux axes actifs
    // Les 50% restants sont "perdus" = penalite pour ne pas avoir joue sur cet axe
    computeIP(axisScores, role) {
        var weights = this.IP_WEIGHTS[role] || this.IP_WEIGHTS['R4'];
        var minActions = this.IP_MIN_ACTIONS;
        var tots = axisScores._tots || {}; // volumes bruts (absent pour les scores moyennes)

        // V20.282 : Ailiers (R4/Pointu) qui servent — booster service de 0.05 à 0.20 (comme Centre)
        // Redistribution proportionnelle sur 115% pour rester à 100%
        // V20.283 : seuil minimum 5 services pour activer le boost (évite surpondération sur petit volume)
        var ailierServiceTot = tots.service || 0;
        if ((role === 'R4' || role === 'Pointu') && axisScores.service && axisScores.service > 0 && ailierServiceTot >= 5) {
            var boosted = {};
            Object.keys(weights).forEach(function(key) { boosted[key] = weights[key]; });
            boosted.service = 0.20;
            var newTotal = 0;
            Object.keys(boosted).forEach(function(key) { newTotal += boosted[key]; });
            Object.keys(boosted).forEach(function(key) { boosted[key] = boosted[key] / newTotal; });
            weights = boosted;
        }

        // V22.05 : Passeur polyvalent — boost attaque (+0.10) et bloc (+0.05) si volume suffisant
        // En 4v4, les passeurs attaquent et bloquent souvent. Redistribution proportionnelle pour rester a 100%
        if (role === 'Passeur') {
            var passeurAttTot = tots.attaque || 0;
            var passeurBlcTot = tots.bloc || 0;
            var needsPasseurBoost = false;
            if (axisScores.attaque && axisScores.attaque > 0 && passeurAttTot >= 3) needsPasseurBoost = true;
            if (axisScores.bloc && axisScores.bloc > 0 && passeurBlcTot >= 1) needsPasseurBoost = true;
            if (needsPasseurBoost) {
                var boosted = {};
                Object.keys(weights).forEach(function(key) { boosted[key] = weights[key]; });
                if (axisScores.attaque && axisScores.attaque > 0 && passeurAttTot >= 3) {
                    boosted.attaque = 0.10;
                }
                if (axisScores.bloc && axisScores.bloc > 0 && passeurBlcTot >= 1) {
                    boosted.bloc = 0.05;
                }
                var newTotal = 0;
                Object.keys(boosted).forEach(function(key) { newTotal += boosted[key]; });
                Object.keys(boosted).forEach(function(key) { boosted[key] = boosted[key] / newTotal; });
                weights = boosted;
            }
        }

        // Calculer le poids total de tous les axes du role (= 1.0 normalement)
        var totalWeight = 0;
        Object.keys(weights).forEach(function(key) {
            if (weights[key] > 0) totalWeight += weights[key];
        });

        // V20.285 : helper pour verifier si un axe atteint le seuil minimum d'actions
        // Exception ailier : 1 seule reception R4 compte, sinon 1 recep ne compte pas
        var isAilier = (role === 'R4' || role === 'Pointu');
        function meetsMinActions(key) {
            var tot = tots[key];
            if (tot === undefined || !minActions[key]) return true; // pas de seuil defini
            if (tot >= minActions[key]) return true; // seuil atteint
            // Exception ailier : 1 reception unique R4 compte dans l'IP
            if (isAilier && key === 'reception' && tot === 1 && (tots.reception_r4 || 0) === 1) return true;
            return false;
        }

        // Calculer le poids des axes actifs et inactifs (score > 0 + seuil atteint)
        // V22.05 : approche hybride — axes offensifs (attaque, bloc) penalises a 50% si inactifs
        // Axes defensifs (tout le reste) : redistribution 100% (pas de penalite)
        // Logique : en 4v4, ne jamais attaquer/bloquer est une vraie limitation,
        // mais 0 defense peut etre contextuel (adversaire evite le joueur)
        var OFFENSIVE_AXES = { attaque: true, bloc: true, service: true };
        var activeWeight = 0;
        var inactiveOffWeight = 0;
        Object.keys(weights).forEach(function(key) {
            if (weights[key] <= 0) return;
            var score = axisScores[key] || 0;
            if (score <= 0 || !meetsMinActions(key)) {
                if (OFFENSIVE_AXES[key]) inactiveOffWeight += weights[key];
                // Axes defensifs inactifs : redistribution 100% (poids ignore)
                return;
            }
            activeWeight += weights[key];
        });
        if (activeWeight === 0) return 0;

        // Denominateur : actifs + 50% des offensifs inactifs (penalite polyvalence)
        var effectiveDenominator = activeWeight + inactiveOffWeight * 0.5;

        // IP = somme ponderee / denominateur effectif
        var ip = 0;
        Object.keys(weights).forEach(function(key) {
            if (weights[key] <= 0) return;
            var score = axisScores[key] || 0;
            if (score <= 0) return;
            if (!meetsMinActions(key)) return;
            ip += score * weights[key];
        });
        ip = ip / effectiveDenominator;

        return Math.round(ip);
    },

    // --- Rendu SVG d'un spider chart pour un joueur ---
    // overlayData: { scores, role } — polygone adverse en overlay (toggle comparer)
    renderSpiderChart(playerName, role, axisScores, ip, roleColor, chartAxes, isAway, overlayData, multiRoleColors) {
        var cx = 75, cy = 78, maxR = 67;
        var self = this;
        var axes = chartAxes || self.SPIDER_AXES;

        // V20.286 — Reduction visuelle axe Passe pour les ailiers uniquement (cosmétique)
        // V22.05 : Centres affichent Passe a 100% pour eviter l'effet noeud papillon
        var isAilier = (role === 'R4' || role === 'Pointu' || role === 'Ailier');
        var axisMaxR = {};
        axes.forEach(function(axis) {
            axisMaxR[axis.key] = (axis.key === 'passe' && isAilier) ? maxR * 0.5 : maxR;
        });

        // Meme couleur home/away (couleurs originales ROLE_COLORS)
        var chartColor = roleColor;

        var html = '<div class="bilan-player-card">';

        // Header : role dot(s) + nom + IP — multi-pastilles si plusieurs roles dans la famille
        html += '<div class="bilan-player-header">';
        var dotColors = multiRoleColors && multiRoleColors.length > 1 ? multiRoleColors : [roleColor];
        if (dotColors.length > 1) {
            html += '<span class="bilan-role-dots">';
            dotColors.forEach(function(c) {
                html += '<span class="bilan-role-dot bilan-role-dot-stacked" style="background:' + c + '"></span>';
            });
            html += '</span>';
        } else {
            html += '<span class="bilan-role-dot" style="background:' + dotColors[0] + '"></span>';
        }
        html += '<span class="bilan-player-name">' + Utils.escapeHtml(playerName) + '</span>';
        html += '<span class="bilan-ip" style="color:' + roleColor + '">IP ' + ip + '</span>';
        html += '</div>';

        // SVG spider chart
        html += '<svg class="spider-chart" viewBox="0 0 150 160" xmlns="http://www.w3.org/2000/svg">';

        // Polygones concentriques de fond (25%, 50%, 75%, 100%) — grille reguliere (non deformee)
        [0.25, 0.5, 0.75, 1.0].forEach(function(scale) {
            var points = axes.map(function(axis) {
                var pt = self.polarToCartesian(cx, cy, maxR * scale, axis.angle);
                return pt.x.toFixed(1) + ',' + pt.y.toFixed(1);
            }).join(' ');
            html += '<polygon points="' + points + '" fill="none" stroke="#e8eaed" stroke-width="0.8"/>';
        });

        // Lignes d'axes (centre → sommet) — longueur reguliere (grille non deformee)
        axes.forEach(function(axis) {
            var pt = self.polarToCartesian(cx, cy, maxR, axis.angle);
            html += '<line x1="' + cx + '" y1="' + cy + '" x2="' + pt.x.toFixed(1) + '" y2="' + pt.y.toFixed(1) + '" stroke="#e8eaed" stroke-width="0.8"/>';
        });

        // Polygone de donnees — regle basee sur le nombre de sommets avec valeur :
        // 7 sommets : heptagone complet
        // 6 sommets (1 zero) : tracer le zero au centre
        // 5 sommets (2 zeros) :
        //   - 2 zeros voisins (consecutifs) : tracer au centre
        //   - 2 zeros separés (encadrent une valeur) : skip les zeros
        // 4 ou moins : skip les zeros
        var polyPoints = [];
        var dotPoints = [];
        var n = axes.length;

        var vals = axes.map(function(a) { return axisScores[a.key] || 0; });
        var vertexCount = vals.filter(function(v) { return v > 0; }).length;

        // Pour 5 sommets : detecter si les 2 zeros sont voisins (consecutifs)
        var zerosAreConsecutive = false;
        if (vertexCount === 5) {
            for (var zi = 0; zi < n; zi++) {
                if (vals[zi] === 0 && vals[(zi + 1) % n] === 0) {
                    zerosAreConsecutive = true;
                    break;
                }
            }
        }

        // Regle de skip :
        // - 7 ou 6 sommets : jamais skip
        // - 5 sommets + zeros consecutifs : jamais skip (tracer au centre)
        // - 5 sommets + zeros separes : skip
        // - 4 ou moins : skip
        // V20.26 : Passeur — toujours skip les zeros pour relier Def→Att directement
        var skipZeros = (role === 'Passeur') || (vertexCount <= 4) || (vertexCount === 5 && !zerosAreConsecutive);

        axes.forEach(function(axis, i) {
            var val = vals[i];
            if (val > 0) {
                var r = axisMaxR[axis.key] * val / 100;
                var pt = self.polarToCartesian(cx, cy, r, axis.angle);
                polyPoints.push(pt);
                dotPoints.push(pt);
            } else if (!skipZeros) {
                polyPoints.push({ x: cx, y: cy });
            }
        });

        if (polyPoints.length >= 2) {
            var dataPolygon = polyPoints.map(function(pt) { return pt.x.toFixed(1) + ',' + pt.y.toFixed(1); }).join(' ');
            html += '<polygon points="' + dataPolygon + '" fill="' + chartColor + '" fill-opacity="0.2" stroke="' + chartColor + '" stroke-width="1.5"/>';
        }

        // Points (cercles) uniquement sur les axes avec valeur
        dotPoints.forEach(function(pt) {
            html += '<circle cx="' + pt.x.toFixed(1) + '" cy="' + pt.y.toFixed(1) + '" r="2.5" fill="' + chartColor + '"/>';
        });

        // --- Overlay adversaire (visible seulement quand toggle "comparer" actif) ---
        if (overlayData && overlayData.scores) {
            var ovScores = overlayData.scores;
            var ovRole = overlayData.role || role;
            var ovColor = '#9aa0a6'; // gris neutre pour l'overlay
            var ovPoints = [];

            // Meme logique — seuil + detection zeros consecutifs
            var ovVals = axes.map(function(a) { return ovScores[a.key] || 0; });
            var ovVertexCount = ovVals.filter(function(v) { return v > 0; }).length;

            var ovZerosConsecutive = false;
            if (ovVertexCount === 5) {
                for (var ozi = 0; ozi < n; ozi++) {
                    if (ovVals[ozi] === 0 && ovVals[(ozi + 1) % n] === 0) {
                        ovZerosConsecutive = true;
                        break;
                    }
                }
            }
            var ovSkipZeros = (ovRole === 'Passeur') || (ovVertexCount <= 4) || (ovVertexCount === 5 && !ovZerosConsecutive);

            // V20.286 — axisMaxR de l'overlay basé sur le role overlay
            // V22.05 : Centres affichent Passe a 100% (coherence avec le joueur principal)
            var ovIsAilier = (ovRole === 'R4' || ovRole === 'Pointu' || ovRole === 'Ailier');
            var ovAxisMaxR = {};
            axes.forEach(function(axis) {
                ovAxisMaxR[axis.key] = (axis.key === 'passe' && ovIsAilier) ? maxR * 0.5 : maxR;
            });

            axes.forEach(function(axis, i) {
                var val = ovVals[i];
                if (val > 0) {
                    var r = ovAxisMaxR[axis.key] * val / 100;
                    ovPoints.push(self.polarToCartesian(cx, cy, r, axis.angle));
                } else if (!ovSkipZeros) {
                    ovPoints.push({ x: cx, y: cy });
                }
            });

            if (ovPoints.length >= 2) {
                var ovPoly = ovPoints.map(function(pt) { return pt.x.toFixed(1) + ',' + pt.y.toFixed(1); }).join(' ');
                html += '<polygon class="spider-overlay" points="' + ovPoly + '" fill="' + ovColor + '" fill-opacity="0.08" stroke="' + ovColor + '" stroke-width="1.2" stroke-dasharray="4,3"/>';
            }
        }

        // Labels d'axes a l'exterieur
        axes.forEach(function(axis) {
            var labelR = 69; // fixe, independant de maxR
            var pt = self.polarToCartesian(cx, cy, labelR, axis.angle);

            // Alignement du texte selon l'angle (generique)
            var cos = Math.cos(axis.angle * Math.PI / 180);
            var sin = Math.sin(axis.angle * Math.PI / 180);
            var anchor = 'middle';
            if (cos > 0.3) anchor = 'start';
            else if (cos < -0.3) anchor = 'end';

            // Decalage vertical selon la position
            var dy = 4;
            if (sin < -0.7) dy = -2;  // haut
            else if (sin > 0.7) dy = 10; // bas

            html += '<text x="' + pt.x.toFixed(1) + '" y="' + (pt.y + dy).toFixed(1) + '" ';
            html += 'text-anchor="' + anchor + '" font-size="8" font-weight="500" ';
            html += 'font-family="Google Sans, Roboto, sans-serif" fill="#5f6368">';
            html += axis.label + '</text>';
        });

        html += '</svg>';

        // Label du joueur compare (visible uniquement quand toggle comparer actif)
        if (overlayData && overlayData.name) {
            html += '<div class="spider-overlay bilan-compare-label">';
            html += '<span class="bilan-compare-name">' + Utils.escapeHtml(overlayData.name) + '</span>';
            if (overlayData.ip != null) {
                html += '<span class="bilan-compare-ip">IP ' + overlayData.ip + '</span>';
            }
            html += '</div>';
        }

        html += '</div>';
        return html;
    },

    // --- Utilitaires ---
    polarToCartesian(cx, cy, radius, angleDeg) {
        var angleRad = angleDeg * Math.PI / 180;
        return {
            x: cx + radius * Math.cos(angleRad),
            y: cy + radius * Math.sin(angleRad)
        };
    },

    clamp(min, max, val) {
        return Math.max(min, Math.min(max, val));
    },

    // --- Eclaircir une couleur hex de amount (0-1) ---
    _lightenColor(hex, amount) {
        var r = parseInt(hex.slice(1, 3), 16);
        var g = parseInt(hex.slice(3, 5), 16);
        var b = parseInt(hex.slice(5, 7), 16);
        r = Math.round(r + (255 - r) * amount);
        g = Math.round(g + (255 - g) * amount);
        b = Math.round(b + (255 - b) * amount);
        return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    },

    // --- Agreger le meilleur joueur adverse d'un role sur la saison (moyenne des scores axes) ---
    // role: 'Passeur' | 'R4' | 'Pointu' | 'Centre'
    aggregateAwayRoleYear(matches, role) {
        var self = this;
        var family = self.ROLE_TO_FAMILY[role]; // 'Passeur', 'Ailier', ou 'Centre'
        var bestPerMatch = [];

        matches.forEach(function(match) {
            var awayFamilies = self.getPlayerFamilies(match, 'away');
            var completedSets = (match.sets || []).filter(function(s) { return s.completed; });
            if (completedSets.length === 0) return;

            var bestScores = null;
            var bestIp = -1;

            Object.keys(awayFamilies).forEach(function(name) {
                var fam = awayFamilies[name].families[family];
                if (!fam) return;

                // Pour Ailier : filtrer par role primaire (R4 vs Pointu)
                if (family === 'Ailier') {
                    var primaryRole = Object.keys(fam.roles).sort(function(a, b) {
                        return (fam.roles[b] || 0) - (fam.roles[a] || 0);
                    })[0];
                    if (primaryRole !== role) return;
                }

                var playerTotals = StatsAggregator.aggregateStatsBySetIndices(
                    completedSets, 'away', fam.setIndices
                );
                var stats = playerTotals[name];
                if (!stats) return;

                var scores = self.computeAxisScores(stats, role);
                var hasAny = ['service', 'reception', 'passe', 'attaque', 'bloc', 'relance', 'defense'].some(function(k) {
                    return (scores[k] || 0) > 0;
                });
                if (!hasAny) return;

                var ip = self.computeIP(scores, role);
                if (ip > bestIp) {
                    bestIp = ip;
                    bestScores = scores;
                }
            });

            if (bestScores) bestPerMatch.push(bestScores);
        });

        if (bestPerMatch.length === 0) return null;

        // Moyenne par axe sur les joueurs ayant un score > 0
        // V22.05 : pas de seuil IP_MIN_ACTIONS ici — les scores individuels sont deja calcules,
        // on moyenne tous les non-zero (le seuil s'applique dans computeIP, pas dans la moyenne)
        var avgScores = {};
        var avgTots = {};
        ['service', 'reception', 'passe', 'attaque', 'bloc', 'relance', 'defense'].forEach(function(k) {
            var withStats = bestPerMatch.filter(function(sc) {
                return (sc[k] || 0) > 0;
            });
            if (withStats.length === 0) { avgScores[k] = 0; avgTots[k] = 0; return; }
            var sumScores = withStats.reduce(function(s, sc) { return s + sc[k]; }, 0);
            var sumTots = withStats.reduce(function(s, sc) { return s + ((sc._tots || {})[k] || 0); }, 0);
            avgScores[k] = Math.round(sumScores / withStats.length);
            avgTots[k] = Math.round(sumTots / withStats.length);
        });
        avgScores._tots = avgTots;

        var ROLE_LABELS = { 'Passeur': 'Passeurs', 'R4': 'R4', 'Pointu': 'Pointus', 'Centre': 'Centres' };
        return {
            name: (ROLE_LABELS[role] || role) + ' Adv.',
            scores: avgScores,
            ip: self.computeIP(avgScores, role),
            count: bestPerMatch.length
        };
    },

    // Wrapper retrocompatible
    aggregateAwayPasseursYear(matches) {
        return this.aggregateAwayRoleYear(matches, 'Passeur');
    },

    // --- Toggle comparaison : affiche/masque les overlays adverses ---
    toggleCompare(btn) {
        var grid = btn.closest('.bilan-section').querySelector('.bilan-grid');
        var active = grid.classList.toggle('bilan-compare-active');
        btn.classList.toggle('active', active);
    },

    // --- Toggle comparaison Stats Annee : meilleur coequipier au poste ---
    toggleCompareYear(btn) {
        var grid = btn.closest('.bilan-section').querySelector('.bilan-grid-year');
        if (!grid) return;
        var active = grid.classList.toggle('bilan-compare-active');
        btn.classList.toggle('active', active);
    },

    // --- Toggle comparaison Stats Annee : meilleur Jen au poste (section adversaire) ---
    toggleCompareYearAway(btn) {
        var grid = btn.closest('.bilan-section').querySelector('.bilan-grid-year-away');
        if (!grid) return;
        var active = grid.classList.toggle('bilan-compare-active');
        btn.classList.toggle('active', active);
    }
};

// ==================== IMPACT +/- VIEW ====================
const ImpactView = {

    _avgMode: 'tot', // 'tot' ou 'moy'
    _showToggle: false, // visible si multi-sets
    _lastData: null, // cache pour re-render toggle
    _lastPlayerRoles: null,
    _seasonRoster: null, // cache du roster saisonnier
    _seasonDirPerSet: null, // cache du Direct/set saisonnier (pour calcul roster match)
    _sortCol: null, // null = tri par defaut (role + pm), sinon colKey
    _sortAsc: false, // desc par defaut pour valeurs numeriques

    // Calcule et cache les donnees saisonnieres si pas encore fait
    _ensureSeasonData(team) {
        if (this._seasonRoster && this._seasonDirPerSet) return;
        var matches = SeasonSelector.getFilteredMatches();
        if (!matches || matches.length === 0) return;
        var seasonData = PlusMinusCalculator.aggregateAcrossMatches(matches, team);
        var seasonRoster = {};
        var seasonDirPerSet = {};
        Object.keys(seasonData).forEach(function(name) {
            seasonRoster[name] = seasonData[name].roster;
            var r = seasonData[name];
            seasonDirPerSet[name] = r.proratedSets > 0 ? r.direct / r.proratedSets : 0;
        });
        this._seasonRoster = seasonRoster;
        this._seasonDirPerSet = seasonDirPerSet;
    },

    // Calcule le roster specifique a un match (force des coequipiers presents)
    // Utilise seasonDirPerSet comme reference de force, mais lineups du match
    _computeMatchRoster(match, team, players) {
        var seasonDirPerSet = this._seasonDirPerSet || {};
        var completedSets = (match.sets || []).filter(function(s) { return s.completed; });
        var rosterSum = {};
        var rosterWeight = {};
        players.forEach(function(name) { rosterSum[name] = 0; rosterWeight[name] = 0; });

        completedSets.forEach(function(set) {
            if (!set.points || set.points.length < 20) return;
            var lineups = PlusMinusCalculator._getLineupAtEachPoint(set, team);
            for (var pi = 0; pi < lineups.length; pi++) {
                var onCourt = lineups[pi];
                if (!onCourt || onCourt.length < 2) continue;
                onCourt.forEach(function(name) {
                    if (rosterSum[name] === undefined) return;
                    onCourt.forEach(function(coPlayer) {
                        if (coPlayer !== name && seasonDirPerSet[coPlayer] !== undefined) {
                            rosterSum[name] += seasonDirPerSet[coPlayer];
                            rosterWeight[name]++;
                        }
                    });
                });
            }
        });

        var matchRoster = {};
        players.forEach(function(name) {
            matchRoster[name] = rosterWeight[name] > 0 ? rosterSum[name] / rosterWeight[name] : 0;
        });
        return matchRoster;
    },

    renderForMatch(match, team) {
        var completedSets = (match.sets || []).filter(function(s) { return s.completed; });
        if (completedSets.length === 0) return '';

        var data = PlusMinusCalculator.compute(completedSets, team);
        if (Object.keys(data).length === 0) return '';

        // Calculer le roster specifique au match (coequipiers presents dans CE match)
        this._ensureSeasonData(team);
        var players = Object.keys(data);
        var matchRoster = this._computeMatchRoster(match, team, players);
        players.forEach(function(name) {
            data[name].roster = matchRoster[name] || 0;
        });

        var playerRoles = BilanView.getPlayerRoles(match, team);
        this._showToggle = completedSets.filter(function(s) { return s.points && s.points.length > 0; }).length > 1;
        this._lastData = data;
        this._lastPlayerRoles = playerRoles;
        return this._renderSection(data, playerRoles);
    },

    renderForYear(matches, team) {
        if (matches.length === 0) return '';

        var data = PlusMinusCalculator.aggregateAcrossMatches(matches, team);
        if (Object.keys(data).length === 0) return '';

        // Cache du roster et dirPerSet saisonniers pour reutilisation en vue match
        var seasonRoster = {};
        var seasonDirPerSet = {};
        Object.keys(data).forEach(function(name) {
            seasonRoster[name] = data[name].roster;
            var r = data[name];
            seasonDirPerSet[name] = r.proratedSets > 0 ? r.direct / r.proratedSets : 0;
        });
        this._seasonRoster = seasonRoster;
        this._seasonDirPerSet = seasonDirPerSet;

        var playerRoles = BilanView.getPlayerRolesYear(matches, team);
        this._showToggle = true;
        this._lastData = data;
        this._lastPlayerRoles = playerRoles;
        return this._renderSection(data, playerRoles);
    },

    _renderSection(data, playerRoles) {
        var isMoy = this._avgMode === 'moy';
        var html = '<div class="hist-section impact-section collapsed">';
        html += '<div class="hist-section-title">Impact +/\u2212</div>';
        html += this._renderClaudeTable(data, playerRoles);
        html += this._renderArnaudTable(data, playerRoles);
        html += '</div>';
        return html;
    },

    toggleAvgMode() {
        this._avgMode = this._avgMode === 'tot' ? 'moy' : 'tot';
    },

    // Icone de tri (fleche) pour les headers
    _sortIcon(colKey) {
        var active;
        if (colKey === 'player') {
            active = !this._sortCol || this._sortCol === 'player';
        } else {
            active = this._sortCol === colKey;
        }
        if (!active) return ' <span class="sort-arrow">\u25BC</span>';
        var arrow = this._sortAsc ? '\u25B2' : '\u25BC';
        if (colKey === 'player' && !this._sortCol) arrow = '\u25BC';
        return ' <span class="sort-arrow active">' + arrow + '</span>';
    },

    // Valeur brute pour le tri d'une colonne (name requis pour 'mental')
    _getSortValue(r, colKey, name) {
        var isMoy = this._avgMode === 'moy';
        var sp = r.proratedSets || r.setsPlayed || 1;
        var raw;
        switch (colKey) {
            case 'pts': raw = r.ptsPlayed; break;
            case 'pm': raw = r.plusMinus; break;
            case 'dir': raw = r.direct; break;
            case 'indirect': raw = r.indirect; break;
            case 'roster': return r.roster || 0;
            case 'mental': {
                if (!this._lastData || !name) return 0;
                var players = Object.keys(this._lastData).filter(function(n) { return this._lastData[n].ptsPlayed > 0; }.bind(this));
                var avgR = this._computeAvgRoster(this._lastData, players);
                return this._computeScore(r, this._lastPlayerRoles, name, avgR);
            }
            case 'serv': raw = r.techServ; break;
            case 'rec': raw = r.techRec; break;
            case 'passe': raw = r.techPasse; break;
            case 'att': raw = r.techAtt; break;
            case 'rel': raw = r.techRel; break;
            case 'def': raw = r.techDef; break;
            case 'blc': raw = r.techBlc; break;
            case 'defblc': raw = r.techDefBlc; break;
            default: raw = r.plusMinus;
        }
        return isMoy && sp > 1 ? raw / sp : raw;
    },

    _sortPlayers(data, playerRoles) {
        var self = this;
        var isMoy = this._avgMode === 'moy';
        var players = Object.keys(data).filter(function(name) {
            return data[name].ptsPlayed > 0;
        });

        // Tri par defaut (pas de colonne selectionnee ou 'player') : role puis +/- desc
        if (!this._sortCol || this._sortCol === 'player') {
            var roleOrder = { 'Passeur': 0, 'R4': 1, 'Pointu': 2, 'Centre': 3 };
            var asc = this._sortCol === 'player' ? this._sortAsc : false;
            players.sort(function(a, b) {
                var roleA = playerRoles && playerRoles[a] ? playerRoles[a].primaryRole : null;
                var roleB = playerRoles && playerRoles[b] ? playerRoles[b].primaryRole : null;
                var orderA = roleA && roleOrder[roleA] !== undefined ? roleOrder[roleA] : 9;
                var orderB = roleB && roleOrder[roleB] !== undefined ? roleOrder[roleB] : 9;
                var roleCmp = asc ? orderB - orderA : orderA - orderB;
                if (roleCmp !== 0) return roleCmp;
                // Meme poste : meilleur +/- en premier
                var spA = data[a].proratedSets || data[a].setsPlayed || 1;
                var spB = data[b].proratedSets || data[b].setsPlayed || 1;
                var pmA = isMoy && spA > 1 ? data[a].plusMinus / spA : data[a].plusMinus;
                var pmB = isMoy && spB > 1 ? data[b].plusMinus / spB : data[b].plusMinus;
                return asc ? pmA - pmB : pmB - pmA;
            });
            return players;
        }

        // Tri par colonne numerique — zeros en fin de liste
        var col = this._sortCol;
        var asc = this._sortAsc;
        players.sort(function(a, b) {
            var valA = self._getSortValue(data[a], col, a);
            var valB = self._getSortValue(data[b], col, b);
            var aZero = (valA === 0);
            var bZero = (valB === 0);
            if (aZero && !bZero) return 1;
            if (!aZero && bZero) return -1;
            if (aZero && bZero) return 0;
            return asc ? valA - valB : valB - valA;
        });
        return players;
    },

    _teamTotals(data, players) {
        var fields = ['ptsPlayed', 'plusMinus', 'direct', 'indirect',
            'techServ', 'techRec', 'techPasse', 'techAtt', 'techRel', 'techDef', 'techBlc', 'techDefBlc',
            'servImpact', 'recImpact', 'pasImpact', 'attImpact', 'defImpact', 'blcImpact'];
        var t = { setsPlayed: 0, proratedSets: 0, onOff: null, influence: null, roster: 0 };
        fields.forEach(function(f) { t[f] = 0; });
        players.forEach(function(name) {
            var r = data[name];
            fields.forEach(function(f) { t[f] += r[f]; });
            if (r.setsPlayed > t.setsPlayed) t.setsPlayed = r.setsPlayed;
            if (r.proratedSets > t.proratedSets) t.proratedSets = r.proratedSets;
        });
        return t;
    },

    // colorMode: undefined=vert/rouge, 'dark'=noir, 'infl'=violet/parme
    _colorCls(v, colorMode) {
        if (colorMode === 'dark') return 'impact-dark';
        if (!colorMode) return v > 0 ? 'positive' : 'negative';
        return v > 0 ? (colorMode + '-pos') : (colorMode + '-neg');
    },

    _fmtVal(val, setsPlayed, showZero, colorMode) {
        var isMoy = this._avgMode === 'moy';
        var v = val;
        if (isMoy && setsPlayed > 1) v = val / setsPlayed;
        var zeroLabel = showZero ? '0' : '\u2212';
        if (isMoy) {
            if (Math.abs(v) < 0.05) return '<span class="impact-zero">' + zeroLabel + '</span>';
            var cls = this._colorCls(v, colorMode);
            var formatted = (v > 0 ? '+' : '') + v.toFixed(1);
            return '<span class="' + cls + '">' + formatted + '</span>';
        }
        if (Math.abs(v) < 0.05) return '<span class="impact-zero">' + zeroLabel + '</span>';
        var cls = this._colorCls(v, colorMode);
        // En Tot : arrondir a 1 decimale si float (servBonus rend certaines valeurs non-entieres)
        var display = (v % 1 !== 0) ? v.toFixed(1) : String(v);
        return '<span class="' + cls + '">' + (v > 0 ? '+' : '') + display + '</span>';
    },

    _fmtDirVal(val, setsPlayed) {
        var isMoy = this._avgMode === 'moy';
        var v = val;
        if (isMoy && setsPlayed > 1) v = val / setsPlayed;
        if (isMoy) {
            if (v < 0.05) return '<span class="impact-zero">\u2212</span>';
            return v.toFixed(1);
        }
        if (v === 0) return '<span class="impact-zero">\u2212</span>';
        return String(v);
    },

    _fmtOnOff(val, setsPlayed, isPlayer, colorMode) {
        if (val === null || val === undefined) return '<span class="impact-zero">' + (isPlayer ? '\u221E' : '\u2212') + '</span>';
        var isMoy = this._avgMode === 'moy';
        var v = val;
        if (isMoy && setsPlayed > 1) v = val / setsPlayed;
        if (Math.abs(v) < 0.05) return '<span class="impact-zero">\u2212</span>';
        var cls = this._colorCls(v, colorMode || 'dark');
        var formatted = (v > 0 ? '+' : '') + v.toFixed(1);
        return '<span class="' + cls + '">' + formatted + '</span>';
    },

    _renderPlayerCell(name, playerRoles) {
        var savedMap = SharedComponents.playerRolesMap;
        SharedComponents.playerRolesMap = playerRoles;
        var dot = SharedComponents.renderRoleDots(name);
        SharedComponents.playerRolesMap = savedMap;
        return '<div class="player-cell">' + dot + Utils.escapeHtml(name) + '</div>';
    },

    // Calcule Score a la volee pour un joueur
    // roleAlign est TOUJOURS calcule depuis les valeurs brutes (Tot) pour eviter
    // que le "+1" du denominateur ne change les ratios selon l'echelle Tot/Moy
    _computeScore(r, playerRoles, name, avgRoster) {
        if (!playerRoles || !playerRoles[name]) return 0;
        var role = playerRoles[name].primaryRole;
        var sp = r.proratedSets || r.setsPlayed || 1;
        var isMoy = this._avgMode === 'moy';
        // Seul pm change d'echelle en Moy — roleAlign reste structurel (valeurs brutes)
        var pm = isMoy ? r.plusMinus / sp : r.plusMinus;
        var dir = r.direct || 0;
        var ind = r.indirect || 0;
        var absDir = Math.abs(dir);
        var absInd = Math.abs(ind);
        var denom = absDir + absInd + 1;
        var roleAlign;
        if (role === 'R4' || role === 'Pointu') {
            roleAlign = Math.max(0, dir) / denom;
        } else if (role === 'Centre') {
            roleAlign = Math.max(0, ind) / denom;
        } else { // Passeur
            roleAlign = (Math.max(0, dir) + Math.max(0, ind)) / (2 * denom);
        }
        var rosterCoeff = avgRoster > 0 ? 1 + 0.5 * (avgRoster - r.roster) / avgRoster : 1;
        return pm * (1 + roleAlign) * rosterCoeff;
    },

    // Calcule avgRoster (moyenne des rosters des joueurs avec >= 4 setsPlayed)
    _computeAvgRoster(data, players) {
        var sum = 0, count = 0;
        players.forEach(function(name) {
            var r = data[name];
            if (r.setsPlayed >= 4 && r.roster !== 0) { sum += r.roster; count++; }
        });
        return count > 0 ? sum / count : 0;
    },

    _fmtRoster(val) {
        if (val === 0 || val === null || val === undefined) return '<span class="impact-zero">\u2212</span>';
        // Degrade bleu : 4 niveaux bases sur les quartiles min/max des joueurs
        var min = this._rosterMin || 0;
        var max = this._rosterMax || 4;
        var range = max - min || 1;
        var norm = (val - min) / range; // 0..1
        var level;
        if (norm <= 0.25) level = 1;
        else if (norm <= 0.5) level = 2;
        else if (norm <= 0.75) level = 3;
        else level = 4;
        return '<span class="impact-roster-' + level + '">' + val.toFixed(1) + '</span>';
    },

    _fmtScore(val, setsPlayed) {
        // setsPlayed optionnel : pour la ligne Total en mode Moy, diviser la somme
        var isMoy = this._avgMode === 'moy';
        var v = (isMoy && setsPlayed && setsPlayed > 1) ? val / setsPlayed : val;
        if (Math.abs(v) < 0.5) return '<span class="impact-zero">\u2212</span>';
        var cls = v > 0 ? 'impact-score-pos' : 'impact-score-neg';
        var rounded = Math.round(v);
        return '<span class="' + cls + '">' + (rounded > 0 ? '+' : '') + rounded + '</span>';
    },

    _renderClaudeTable(data, playerRoles) {
        var players = this._sortPlayers(data, playerRoles);
        if (players.length === 0) return '';
        var self = this;
        var isMoy = this._avgMode === 'moy';
        var avgRoster = this._computeAvgRoster(data, players);
        // Calculer min/max roster pour le degrade de couleur
        var rosterVals = players.map(function(n) { return data[n].roster || 0; }).filter(function(v) { return v !== 0; });
        this._rosterMin = rosterVals.length > 0 ? Math.min.apply(null, rosterVals) : 0;
        this._rosterMax = rosterVals.length > 0 ? Math.max.apply(null, rosterVals) : 4;

        var html = '<div class="impact-table-wrapper">';
        html += '<div class="impact-table-label"><span>Impact Global</span>';
        if (this._showToggle) {
            html += '<div class="display-mode-toggle impact-avg-toggle">';
            html += '<button class="avg-mode-btn' + (!isMoy ? ' active' : '') + '" data-impact-avg="tot">Tot</button>';
            html += '<button class="avg-mode-btn' + (isMoy ? ' active' : '') + '" data-impact-avg="moy">Moy</button>';
            html += '</div>';
        }
        html += '</div>';
        html += '<table class="stats-table impact-table">';
        html += '<colgroup><col style="width:18%"><col style="width:10%"><col style="width:12%"><col style="width:12%"><col style="width:12%"><col style="width:12%"><col style="width:12%"></colgroup>';
        html += '<thead><tr>';
        html += '<th data-sort-col="player" class="impact-sortable">Joueur' + self._sortIcon('player') + '</th>';
        html += '<th data-sort-col="pts" class="impact-sortable">Pts Jou\u00e9s' + self._sortIcon('pts') + '</th>';
        html += '<th data-sort-col="pm" class="impact-col-main impact-sortable">+/\u2212' + self._sortIcon('pm') + '</th>';
        html += '<th data-sort-col="dir" class="impact-sortable">Direct' + self._sortIcon('dir') + '</th>';
        html += '<th data-sort-col="indirect" class="impact-sortable">Indirect' + self._sortIcon('indirect') + '</th>';
        html += '<th data-sort-col="roster" class="impact-sortable">Roster' + self._sortIcon('roster') + '</th>';
        html += '<th data-sort-col="mental" class="impact-sortable">Mental' + self._sortIcon('mental') + '</th>';
        html += '</tr></thead><tbody>';

        players.forEach(function(name) {
            var r = data[name];
            var sp = r.proratedSets || r.setsPlayed || 1;
            var score = self._computeScore(r, playerRoles, name, avgRoster);
            html += '<tr>';
            html += '<td>' + self._renderPlayerCell(name, playerRoles) + '</td>';
            html += '<td><span class="impact-dark">' + r.ptsPlayed + '</span></td>';
            html += '<td class="impact-col-main">' + self._fmtVal(r.plusMinus, sp, true, 'dark') + '</td>';
            html += '<td>' + self._fmtVal(r.direct, sp) + '</td>';
            html += '<td>' + self._fmtVal(r.indirect, sp) + '</td>';
            html += '<td>' + self._fmtRoster(r.roster) + '</td>';
            html += '<td>' + self._fmtScore(score) + '</td>';
            html += '</tr>';
        });

        // Ligne Total equipe
        var t = this._teamTotals(data, players);
        var tsp = t.proratedSets || t.setsPlayed || 1;
        // Roster total = moyenne des rosters individuels
        var rosterSum = 0, rosterCount = 0;
        players.forEach(function(name) {
            var rv = data[name].roster;
            if (rv && rv !== 0) { rosterSum += rv; rosterCount++; }
        });
        var teamRoster = rosterCount > 0 ? rosterSum / rosterCount : 0;
        // Mental total = somme des mental individuels
        var teamMental = 0;
        players.forEach(function(name) {
            teamMental += self._computeScore(data[name], playerRoles, name, avgRoster);
        });
        html += '<tr class="total-row"><td>Total</td>';
        html += '<td><span class="impact-dark">' + t.ptsPlayed + '</span></td>';
        html += '<td class="impact-col-main">' + self._fmtVal(t.plusMinus, tsp, true, 'dark') + '</td>';
        html += '<td>' + self._fmtVal(t.direct, tsp) + '</td>';
        html += '<td>' + self._fmtVal(t.indirect, tsp) + '</td>';
        html += '<td>' + self._fmtRoster(teamRoster) + '</td>';
        html += '<td>' + self._fmtScore(teamMental, tsp) + '</td>';
        html += '</tr>';

        html += '</tbody></table>';
        html += '</div>';
        return html;
    },

    _renderArnaudTable(data, playerRoles) {
        var players = this._sortPlayers(data, playerRoles);
        if (players.length === 0) return '';
        var self = this;
        var isMoy = this._avgMode === 'moy';

        var html = '<div class="impact-table-wrapper">';
        html += '<div class="impact-table-label"><span>Impact Technique</span>';
        if (this._showToggle) {
            html += '<div class="display-mode-toggle impact-avg-toggle">';
            html += '<button class="avg-mode-btn' + (!isMoy ? ' active' : '') + '" data-impact-avg="tot">Tot</button>';
            html += '<button class="avg-mode-btn' + (isMoy ? ' active' : '') + '" data-impact-avg="moy">Moy</button>';
            html += '</div>';
        }
        html += '</div>';
        html += '<table class="stats-table impact-table">';
        html += '<colgroup><col style="width:19%"><col style="width:13.5%"><col style="width:13.5%"><col style="width:13.5%"><col style="width:13.5%"><col style="width:13.5%"><col style="width:13.5%"></colgroup>';
        html += '<thead><tr>';
        html += '<th data-sort-col="player" class="impact-sortable">Joueur' + self._sortIcon('player') + '</th>';
        html += '<th data-sort-col="serv" class="impact-sortable">Serv' + self._sortIcon('serv') + '</th>';
        html += '<th data-sort-col="rec" class="impact-sortable">Rec' + self._sortIcon('rec') + '</th>';
        html += '<th data-sort-col="passe" class="impact-sortable">Passe' + self._sortIcon('passe') + '</th>';
        html += '<th data-sort-col="att" class="impact-sortable">Att' + self._sortIcon('att') + '</th>';
        html += '<th data-sort-col="def" class="impact-sortable">Def' + self._sortIcon('def') + '</th>';
        html += '<th data-sort-col="blc" class="impact-sortable">Blc' + self._sortIcon('blc') + '</th>';
        html += '</tr></thead><tbody>';

        players.forEach(function(name) {
            var r = data[name];
            var sp = r.proratedSets || r.setsPlayed || 1;
            html += '<tr>';
            html += '<td>' + self._renderPlayerCell(name, playerRoles) + '</td>';
            html += '<td>' + self._fmtVal(r.techServ, sp) + '</td>';
            html += '<td>' + self._fmtVal(r.techRec, sp) + '</td>';
            html += '<td>' + self._fmtVal(r.techPasse, sp) + '</td>';
            html += '<td>' + self._fmtVal(r.techAtt, sp) + '</td>';
            html += '<td>' + self._fmtVal(r.techDef, sp) + '</td>';
            html += '<td>' + self._fmtVal(r.techBlc, sp) + '</td>';
            html += '</tr>';
        });

        // Ligne Total equipe
        var t = this._teamTotals(data, players);
        var tsp = t.proratedSets || t.setsPlayed || 1;
        html += '<tr class="total-row"><td>Total</td>';
        html += '<td>' + self._fmtVal(t.techServ, tsp) + '</td>';
        html += '<td>' + self._fmtVal(t.techRec, tsp) + '</td>';
        html += '<td>' + self._fmtVal(t.techPasse, tsp) + '</td>';
        html += '<td>' + self._fmtVal(t.techAtt, tsp) + '</td>';
        html += '<td>' + self._fmtVal(t.techDef, tsp) + '</td>';
        html += '<td>' + self._fmtVal(t.techBlc, tsp) + '</td>';
        html += '</tr>';

        html += '</tbody></table>';
        html += '</div>';
        return html;
    }
};

// ==================== TAB 5: RANKING VIEW ====================
const TEAM_COLORS = {
    'Jen et ses Saints': '#9b59b6',
    'Kiki Team': '#3498db',
    'Red Hot Sucy Pépère': '#e74c3c',
    'Les Rescapés': '#2ecc71',
    'Marvels 4': '#f39c12',
    'RSC Champigny 1': '#1abc9c',
    'Manu Andy-sport': '#e67e22',
    'Bières et le loup': '#f1c40f',
    'Rhinos Féroces': '#95a5a6',
    'StarPAFF': '#34495e'
};

const RankingView = {
    _rendered: false,
    currentFilter: 'all',
    currentSubTab: 'equipes',
    _cachedData: null,
    _equipesSort: { col: 'ipStarters', asc: false },
    _joueursSort: { col: 'ip', asc: false },
    _joueursGroupMode: 'tous', // 'tous' | 'poste'

    render() {
        var container = document.getElementById('content-ranking');
        if (!container) return;
        if (this._rendered) return;

        var matches = SeasonSelector.getFilteredMatches();
        if (matches.length === 0) {
            container.innerHTML = '<div class="empty-state"><h3 class="empty-state-title">Aucun match</h3>' +
                '<p class="empty-state-desc">Aucun match trouvé pour cette saison.</p></div>';
            this._rendered = true;
            return;
        }

        var filtered = this.applyFilter(matches);
        this._cachedData = this._computeRankingData(filtered);

        var html = '';
        html += this.renderFilters();
        html += this.renderSubTabs();
        html += '<div class="ranking-subtab-content" id="rankingEquipes">' + this.renderEquipes(this._cachedData) + '</div>';
        html += '<div class="ranking-subtab-content" id="rankingJoueurs" style="display:none">' + this.renderJoueurs(this._cachedData) + '</div>';
        container.innerHTML = html;

        this._updateSubTabVisibility();
        this.bindEvents(container);
        this._rendered = true;
    },

    applyFilter(matches) {
        if (this.currentFilter === 'all') return matches;
        return matches.filter(function(m) { return m.type === this.currentFilter; }.bind(this));
    },

    renderSubTabs() {
        var self = this;
        var html = '<div class="segmented-tabs ranking-sub-tabs">';
        [{ key: 'equipes', label: 'Équipes' }, { key: 'joueurs', label: 'Joueurs' }].forEach(function(t) {
            html += '<button class="seg-tab ranking-sub-btn' + (self.currentSubTab === t.key ? ' active' : '') + '" data-subtab="' + t.key + '">' + t.label + '</button>';
        });
        html += '</div>';
        return html;
    },

    renderFilters() {
        var self = this;
        var html = '<div class="segmented-tabs year-filters ranking-filters">';
        [{ key: 'all', label: 'Tous' }, { key: 'championnat', label: 'Championnat' }, { key: 'ginette', label: 'Ginette' }].forEach(function(f) {
            html += '<button class="seg-tab ranking-filter-btn' + (self.currentFilter === f.key ? ' active' : '') + '" data-filter="' + f.key + '">' + f.label + '</button>';
        });
        html += '</div>';
        return html;
    },

    // --- Calcul central des donnees ---
    _computeRankingData(matches) {
        var self = this;
        var teams = [];
        var allPlayerCards = [];

        // 1. Jen et ses Saints (home)
        var jenData = self._computeTeamData(matches, 'home', 'Jen et ses Saints');
        teams.push(jenData);
        jenData.allPlayers.forEach(function(p) {
            allPlayerCards.push({
                name: p.name, teamName: 'Jen et ses Saints',
                role: p.role, roleColor: p.roleColor,
                scores: p.scores, ip: p.ip
            });
        });

        // 2. Grouper les matchs par adversaire
        var opponentGroups = {};
        matches.forEach(function(m) {
            var opp = m.opponent || 'Adversaire';
            if (!opponentGroups[opp]) opponentGroups[opp] = [];
            opponentGroups[opp].push(m);
        });

        Object.keys(opponentGroups).forEach(function(oppName) {
            var oppMatches = opponentGroups[oppName];
            var oppData = self._computeTeamData(oppMatches, 'away', oppName);
            teams.push(oppData);
            oppData.allPlayers.forEach(function(p) {
                allPlayerCards.push({
                    name: p.name, teamName: oppName,
                    role: p.role, roleColor: p.roleColor,
                    scores: p.scores, ip: p.ip
                });
            });
        });

        // Tri par ipStarters decroissant
        teams.sort(function(a, b) { return b.ipStarters - a.ipStarters; });

        // V22.05 : exclure les joueurs avec trop peu d'actions (non significatif)
        var MIN_TOTAL_ACTIONS = 15;
        allPlayerCards = allPlayerCards.filter(function(p) {
            var t = p.scores && p.scores._tots ? p.scores._tots : {};
            var total = (t.service||0) + (t.reception||0) + (t.passe||0) + (t.attaque||0) + (t.bloc||0) + (t.relance||0) + (t.defense||0);
            return total >= MIN_TOTAL_ACTIONS;
        });

        // Tri joueurs par IP decroissant
        allPlayerCards.sort(function(a, b) { return b.ip - a.ip; });

        return { teams: teams, allPlayerCards: allPlayerCards };
    },

    _computeTeamData(matches, teamKey, teamName) {
        var isAway = (teamKey === 'away');
        var matchesWithSets = matches.filter(function(m) {
            return (m.sets || []).some(function(s) { return s.completed; });
        });

        if (matchesWithSets.length === 0) {
            return { name: teamName, isHome: !isAway, matchCount: matches.length,
                     allPlayers: [], starters: [], ipAll: 0, ipStarters: 0 };
        }

        // --- Approche Profils Radar Annee : agreger TOUTES les stats saison → IP unique ---
        // (et non IP par match puis moyenne, qui donne des resultats differents car formules non-lineaires)
        var allPlayers = [];

        if (!isAway) {
            // HOME (Jen) : getPlayerFamiliesYear + aggregateStatsForFamilyYear (identique a Annee)
            var playerFamiliesYear = BilanView.getPlayerFamiliesYear(matchesWithSets);
            var playerRolesYear = BilanView.getPlayerRolesYear(matchesWithSets, 'home');

            // Phase 1 : collecter scores (ip=0) pour tous les joueurs
            BilanView.FAMILY_ORDER.forEach(function(family) {
                var familyIpRole = (family === 'Ailier') ? 'R4' : family;

                Object.keys(playerFamiliesYear).forEach(function(name) {
                    if (playerFamiliesYear[name].primaryFamily !== family) return;
                    var famData = playerFamiliesYear[name].families[family];
                    if (!famData) return;

                    var stats = BilanView.aggregateStatsForFamilyYear(matchesWithSets, name, famData);
                    var hasStats = ['service', 'reception', 'pass', 'attack', 'relance', 'defense', 'block'].some(function(cat) {
                        return stats[cat] && stats[cat].tot > 0;
                    });
                    if (!hasStats) return;

                    var scores = BilanView.computeAxisScores(stats, familyIpRole);

                    var roleInfo = playerRolesYear[name];
                    var primaryRole = roleInfo ? roleInfo.primaryRole : family;
                    var roleColor = BilanView.ROLE_COLORS[primaryRole] || '#5f6368';

                    allPlayers.push({
                        name: name, role: primaryRole, roleColor: roleColor,
                        scores: scores, ip: 0, effectiveRole: familyIpRole,
                        matchCount: famData.matchSets.length
                    });
                });
            });

            // Phase 2 : seuil 10% service (identique a Annee Profils radar V21.21)
            var teamTotalService = 0;
            allPlayers.forEach(function(d) {
                teamTotalService += (d.scores._tots && d.scores._tots.service) || 0;
            });
            allPlayers.forEach(function(d) {
                var playerSrvTot = (d.scores._tots && d.scores._tots.service) || 0;
                if (teamTotalService > 0 && playerSrvTot < teamTotalService * 0.10) {
                    d.scores.service = 0;
                }
                d.ip = BilanView.computeIP(d.scores, d.effectiveRole);
            });
        } else {
            // AWAY : agreger stats par joueur sur tous les matchs → IP unique
            var mergedData = {}; // name → { stats, roles: {role: count}, matchCount }

            matchesWithSets.forEach(function(match) {
                var completedSets = (match.sets || []).filter(function(s) { return s.completed; });
                if (completedSets.length === 0) return;

                var families = BilanView.getPlayerFamilies(match, 'away');
                var roles = BilanView.getPlayerRoles(match, 'away');

                Object.keys(families).forEach(function(name) {
                    var roleInfo = roles[name];
                    if (!roleInfo) return;
                    var primaryRole = roleInfo.primaryRole;
                    var primaryFamily = BilanView.ROLE_TO_FAMILY[primaryRole];
                    if (!primaryFamily) return;

                    var famData = families[name].families[primaryFamily];
                    if (!famData) return;
                    var playerTotals = StatsAggregator.aggregateStatsBySetIndices(completedSets, 'away', famData.setIndices);
                    var stats = playerTotals[name];
                    if (!stats) return;

                    if (!mergedData[name]) {
                        mergedData[name] = {
                            stats: StatsAggregator.initPlayerStats(),
                            roles: {}, matchCount: 0
                        };
                    }
                    BilanView._mergePlayerStats(mergedData[name].stats, stats);
                    mergedData[name].roles[primaryRole] = (mergedData[name].roles[primaryRole] || 0) + 1;
                    mergedData[name].matchCount++;
                });
            });

            Object.keys(mergedData).forEach(function(name) {
                var entry = mergedData[name];
                var stats = entry.stats;

                var hasStats = ['service', 'reception', 'pass', 'attack', 'relance', 'defense', 'block'].some(function(cat) {
                    return stats[cat] && stats[cat].tot > 0;
                });
                if (!hasStats) return;

                var primaryRole = Object.keys(entry.roles).sort(function(a, b) { return entry.roles[b] - entry.roles[a]; })[0];
                var primaryFamily = BilanView.ROLE_TO_FAMILY[primaryRole];
                var ipRole = (primaryFamily === 'Ailier') ? 'R4' : primaryFamily;

                // V22.05 : pas de detection centre offensif dans le Ranking
                // Tous les centres sont evalues comme Centre (coherence home/away)

                var scores = BilanView.computeAxisScores(stats, ipRole);
                var roleColor = BilanView.ROLE_COLORS[primaryRole] || '#5f6368';

                allPlayers.push({
                    name: name, role: primaryRole, roleColor: roleColor,
                    scores: scores, ip: 0, effectiveRole: ipRole, matchCount: entry.matchCount
                });
            });

            // Phase 2 Away : seuil 10% service (coherence avec Home, V22.05)
            var teamTotalService = 0;
            allPlayers.forEach(function(d) {
                teamTotalService += (d.scores._tots && d.scores._tots.service) || 0;
            });
            allPlayers.forEach(function(d) {
                var playerSrvTot = (d.scores._tots && d.scores._tots.service) || 0;
                if (teamTotalService > 0 && playerSrvTot < teamTotalService * 0.10) {
                    d.scores.service = 0;
                }
                d.ip = BilanView.computeIP(d.scores, d.effectiveRole);
            });
        }

        // --- IP EQUIPE = moyenne de tous les IP joueurs ---
        var ipAll = allPlayers.length > 0
            ? Math.round(allPlayers.reduce(function(s, p) { return s + p.ip; }, 0) / allPlayers.length)
            : 0;

        // --- IP TITULAIRES = meilleur joueur par poste, IP moyen ---
        var POSITIONS = ['Passeur', 'R4', 'Centre', 'Pointu'];
        var bestByPos = {};
        POSITIONS.forEach(function(pos) {
            var candidates = allPlayers.filter(function(p) { return p.role === pos; });
            if (candidates.length === 0) return;
            candidates.sort(function(a, b) { return b.ip - a.ip; });
            bestByPos[pos] = candidates[0];
        });
        var posValues = POSITIONS.map(function(pos) { return bestByPos[pos] ? bestByPos[pos].ip : null; }).filter(function(v) { return v !== null; });
        var ipStarters = posValues.length > 0
            ? Math.round(posValues.reduce(function(s, v) { return s + v; }, 0) / posValues.length)
            : 0;

        return {
            name: teamName,
            isHome: !isAway,
            matchCount: matchesWithSets.length,
            allPlayers: allPlayers,
            starters: Object.values(bestByPos),
            ipAll: ipAll,
            ipStarters: ipStarters
        };
    },

    // --- Rendu sous-onglet Equipes ---
    renderEquipes(data) {
        var self = this;
        var s = this._equipesSort;
        var sorted = this._sortData(data.teams, s.col, s.asc);

        var html = '<div class="ranking-table-wrap">';
        html += '<table class="ranking-table" data-ranking-table="equipes">';
        html += '<thead><tr>';
        html += '<th>#</th>';
        html += '<th data-sort-col="ipStarters">Équipe' + self._sortIcon('ipStarters', s) + '</th>';
        html += '<th data-sort-col="matchCount">Matchs' + self._sortIcon('matchCount', s) + '</th>';
        html += '<th data-sort-col="ipAll">IP Équipe' + self._sortIcon('ipAll', s) + '</th>';
        html += '<th data-sort-col="ipStarters">IP Titulaires' + self._sortIcon('ipStarters', s) + '</th>';
        html += '</tr></thead>';
        html += '<tbody>';

        sorted.forEach(function(team, idx) {
            var teamColor = TEAM_COLORS[team.name] || '#999';
            html += '<tr class="ranking-row" data-team="' + team.name.replace(/"/g, '&quot;') + '">';
            html += '<td>' + (idx + 1) + '</td>';
            html += '<td class="ranking-team-name"><span class="ranking-team-badge" style="background:' + teamColor + '">' + team.name + '</span></td>';
            html += '<td class="ranking-matchcount">' + team.matchCount + '</td>';
            html += '<td class="ranking-ip-cell">' + team.ipAll + '</td>';
            html += '<td class="ranking-ip-cell">' + team.ipStarters + '</td>';
            html += '</tr>';
        });

        html += '</tbody></table></div>';
        return html;
    },

    // --- Rendu sous-onglet Joueurs ---
    renderJoueurs(data) {
        var self = this;
        var s = this._joueursSort;
        var isPoste = this._joueursGroupMode === 'poste';
        var isTous = !isPoste;

        // Toggle Tous/Poste
        var html = '<div class="ranking-group-toggle-bar">';
        html += '<div class="display-mode-toggle avg-mode-toggle">';
        html += '<button class="avg-mode-btn' + (isTous ? ' active' : '') + '" data-ranking-group="tous">Tous</button>';
        html += '<button class="avg-mode-btn' + (isPoste ? ' active' : '') + '" data-ranking-group="poste">Poste</button>';
        html += '</div></div>';

        html += '<div class="ranking-table-wrap">';
        html += '<table class="ranking-table" data-ranking-table="joueurs">';
        html += '<thead><tr>';
        html += '<th>#</th>';
        html += '<th data-sort-col="ip">Joueur' + self._sortIcon('ip', s) + '</th>';
        html += '<th data-sort-col="teamName">Équipe' + self._sortIcon('teamName', s) + '</th>';
        html += '<th data-sort-col="ip">IP' + self._sortIcon('ip', s) + '</th>';
        html += '</tr></thead>';
        html += '<tbody>';

        if (isPoste) {
            // Grouper par famille (Passeur → Ailier → Centre), tri intra-groupe
            var FAMILY_ORDER = ['Passeur', 'Ailier', 'Centre'];
            var FAMILY_LABELS = { 'Passeur': 'Passeurs', 'Ailier': 'Ailiers', 'Centre': 'Centres' };
            var FAMILY_COLORS = { 'Passeur': '#8b5cf6', 'Ailier': '#3b82f6', 'Centre': '#ef4444' };
            var roleToFamily = BilanView.ROLE_TO_FAMILY;

            var groups = {};
            FAMILY_ORDER.forEach(function(f) { groups[f] = []; });
            data.allPlayerCards.forEach(function(p) {
                var fam = roleToFamily[p.role] || 'Ailier';
                if (groups[fam]) groups[fam].push(p);
            });

            // Trier chaque groupe par IP desc (ou par le sort actif)
            FAMILY_ORDER.forEach(function(fam) {
                groups[fam] = self._sortData(groups[fam], s.col, s.asc);
            });

            FAMILY_ORDER.forEach(function(fam) {
                if (groups[fam].length === 0) return;
                // En-tete de categorie (meme style que T.Jeu)
                html += '<tr class="pt-role-header"><td colspan="4">';
                html += '<span class="pt-role-header-bar" style="background:' + FAMILY_COLORS[fam] + '"></span>';
                html += FAMILY_LABELS[fam];
                html += '</td></tr>';

                var rank = 1; // # repart a 1 pour chaque poste
                groups[fam].forEach(function(p) {
                    var teamColor = TEAM_COLORS[p.teamName] || '#999';
                    html += '<tr class="ranking-row ranking-player-row" data-player-name="' + p.name.replace(/"/g, '&quot;') + '" data-player-team="' + p.teamName.replace(/"/g, '&quot;') + '">';
                    html += '<td>' + rank + '</td>';
                    html += '<td><span class="bilan-role-dot" style="background:' + p.roleColor + '"></span> ' + p.name + '</td>';
                    html += '<td class="ranking-matchcount"><span class="ranking-team-badge ranking-team-badge-sm" style="background:' + teamColor + '">' + p.teamName + '</span></td>';
                    html += '<td class="ranking-ip-cell">' + p.ip + '</td>';
                    html += '</tr>';
                    rank++;
                });
            });
        } else {
            // Mode Tous : tri global
            var sorted = this._sortData(data.allPlayerCards, s.col, s.asc);
            sorted.forEach(function(p, idx) {
                var teamColor = TEAM_COLORS[p.teamName] || '#999';
                html += '<tr class="ranking-row ranking-player-row" data-player-name="' + p.name.replace(/"/g, '&quot;') + '" data-player-team="' + p.teamName.replace(/"/g, '&quot;') + '">';
                html += '<td>' + (idx + 1) + '</td>';
                html += '<td><span class="bilan-role-dot" style="background:' + p.roleColor + '"></span> ' + p.name + '</td>';
                html += '<td class="ranking-matchcount"><span class="ranking-team-badge ranking-team-badge-sm" style="background:' + teamColor + '">' + p.teamName + '</span></td>';
                html += '<td class="ranking-ip-cell">' + p.ip + '</td>';
                html += '</tr>';
            });
        }

        html += '</tbody></table></div>';
        return html;
    },

    // --- Rendu modal joueur (1 spider chart) ---
    renderPlayerModal(playerData) {
        var html = '<div class="ranking-team-info">';
        html += playerData.teamName + ' · ' + playerData.role;
        html += '</div>';
        html += '<div style="max-width:300px;margin:0 auto">';
        html += BilanView.renderSpiderChart(
            playerData.name, playerData.role, playerData.scores, playerData.ip, playerData.roleColor,
            BilanView.SPIDER_AXES, false, null, null
        );
        html += '</div>';
        return html;
    },

    // --- Rendu modal equipe (4 spider charts) ---
    renderTeamModal(teamData) {
        var SLOT_ORDER = ['Passeur', 'R4', 'Pointu', 'Centre'];
        var sorted = teamData.starters.slice().sort(function(a, b) {
            return SLOT_ORDER.indexOf(a.role) - SLOT_ORDER.indexOf(b.role);
        });

        var html = '<div class="ranking-team-info">';
        html += teamData.matchCount + ' match' + (teamData.matchCount > 1 ? 's' : '') +
            ' · IP Équipe : ' + teamData.ipAll + ' · IP Titulaires : ' + teamData.ipStarters;
        html += '</div>';
        html += '<div class="ranking-modal-grid">';

        sorted.forEach(function(p) {
            html += BilanView.renderSpiderChart(
                p.name, p.role, p.scores, p.ip, p.roleColor,
                BilanView.SPIDER_AXES, !teamData.isHome, null, null
            );
        });
        // Remplir les cases vides si moins de 4 titulaires
        for (var i = sorted.length; i < 4; i++) {
            html += '<div class="bilan-player-card bilan-player-empty" style="min-height:160px"></div>';
        }

        html += '</div>';
        return html;
    },

    // --- Tri ---
    _sortIcon(col, sortState) {
        var active = sortState.col === col;
        var arrow = active ? (sortState.asc ? '\u25B2' : '\u25BC') : '\u25BC';
        return ' <span class="sort-arrow' + (active ? ' active' : '') + '">' + arrow + '</span>';
    },

    _sortData(array, col, asc) {
        var ALPHA_COLS = { name: true, teamName: true };
        return array.slice().sort(function(a, b) {
            var va = a[col], vb = b[col];
            if (ALPHA_COLS[col]) {
                va = (va || '').toLowerCase();
                vb = (vb || '').toLowerCase();
                return asc ? va.localeCompare(vb) : vb.localeCompare(va);
            }
            return asc ? (va - vb) : (vb - va);
        });
    },

    _rerenderTable(subTab) {
        var container = document.getElementById('content-ranking');
        if (!container || !this._cachedData) return;

        if (subTab === 'equipes' || !subTab) {
            var eqDiv = document.getElementById('rankingEquipes');
            if (eqDiv) {
                eqDiv.innerHTML = this.renderEquipes(this._cachedData);
                this._bindTableEvents(container, 'equipes');
                this._equalizeBadges(container);
            }
        }
        if (subTab === 'joueurs' || !subTab) {
            var joDiv = document.getElementById('rankingJoueurs');
            if (joDiv) {
                joDiv.innerHTML = this.renderJoueurs(this._cachedData);
                this._bindTableEvents(container, 'joueurs');
                this._equalizeBadges(container);
            }
        }
    },

    _bindTableEvents(container, subTab) {
        var self = this;

        // Sort handlers
        var tableSelector = 'table[data-ranking-table="' + subTab + '"]';
        var table = container.querySelector(tableSelector);
        if (table) {
            table.querySelectorAll('th[data-sort-col]').forEach(function(th) {
                th.addEventListener('click', function(e) {
                    e.stopPropagation();
                    var col = th.dataset.sortCol;
                    var sortState = (subTab === 'equipes') ? self._equipesSort : self._joueursSort;

                    // Toggle direction si meme colonne, sinon desc par defaut (asc pour alpha)
                    if (sortState.col === col) {
                        sortState.asc = !sortState.asc;
                    } else {
                        sortState.col = col;
                        sortState.asc = (col === 'teamName');
                    }
                    self._rerenderTable(subTab);
                });
            });
        }

        // Toggle Tous/Poste (joueurs only)
        if (subTab === 'joueurs') {
            container.querySelectorAll('#rankingJoueurs [data-ranking-group]').forEach(function(btn) {
                btn.addEventListener('click', function() {
                    var mode = btn.dataset.rankingGroup;
                    if (mode === self._joueursGroupMode) return;
                    self._joueursGroupMode = mode;
                    self._rerenderTable('joueurs');
                });
            });
        }

        // Row click handlers
        if (subTab === 'equipes') {
            container.querySelectorAll('#rankingEquipes .ranking-row[data-team]').forEach(function(row) {
                row.addEventListener('click', function() {
                    var teamName = row.dataset.team;
                    var teamData = self._cachedData.teams.find(function(t) { return t.name === teamName; });
                    if (!teamData) return;
                    RankingTeamModal.open(self.renderTeamModal(teamData), teamName);
                });
            });
        } else {
            container.querySelectorAll('#rankingJoueurs .ranking-player-row').forEach(function(row) {
                row.addEventListener('click', function() {
                    var name = row.dataset.playerName;
                    var team = row.dataset.playerTeam;
                    var playerData = self._cachedData.allPlayerCards.find(function(p) {
                        return p.name === name && p.teamName === team;
                    });
                    if (!playerData) return;
                    RankingTeamModal.open(self.renderPlayerModal(playerData), playerData.name);
                });
            });
        }
    },

    _updateSubTabVisibility() {
        var eq = document.getElementById('rankingEquipes');
        var jo = document.getElementById('rankingJoueurs');
        if (eq) eq.style.display = this.currentSubTab === 'equipes' ? '' : 'none';
        if (jo) jo.style.display = this.currentSubTab === 'joueurs' ? '' : 'none';
    },

    _equalizeBadges(container) {
        // Pour chaque groupe visible, trouver le badge le plus large et appliquer à tous
        ['rankingEquipes', 'rankingJoueurs'].forEach(function(id) {
            var section = container.querySelector('#' + id);
            if (!section || section.style.display === 'none') return;
            var badges = section.querySelectorAll('.ranking-team-badge');
            if (badges.length === 0) return;
            // Reset pour mesurer la taille naturelle
            badges.forEach(function(b) { b.style.width = ''; });
            var maxW = 0;
            badges.forEach(function(b) { if (b.offsetWidth > maxW) maxW = b.offsetWidth; });
            badges.forEach(function(b) { b.style.width = maxW + 'px'; });
        });
    },

    bindEvents(container) {
        var self = this;

        // Sous-onglets Equipes / Joueurs
        container.querySelectorAll('.ranking-sub-btn').forEach(function(btn) {
            btn.addEventListener('click', function() {
                self.currentSubTab = btn.dataset.subtab;
                container.querySelectorAll('.ranking-sub-btn').forEach(function(b) {
                    b.classList.toggle('active', b.dataset.subtab === self.currentSubTab);
                });
                self._updateSubTabVisibility();
                self._equalizeBadges(container);
            });
        });

        // Filtres Tous/Championnat/Ginette
        container.querySelectorAll('.ranking-filter-btn').forEach(function(btn) {
            btn.addEventListener('click', function() {
                self.currentFilter = btn.dataset.filter;
                container.querySelectorAll('.ranking-filter-btn').forEach(function(b) {
                    b.classList.toggle('active', b.dataset.filter === self.currentFilter);
                });
                self._rendered = false;
                self.render();
            });
        });

        // Bind sort + row click handlers pour les deux tableaux
        this._bindTableEvents(container, 'equipes');
        this._bindTableEvents(container, 'joueurs');
        this._equalizeBadges(container);
    }
};

// ==================== PROGRESSION VIEW (Data tab) ====================

const ProgressionView = {
    _rendered: false,
    _data: null,
    _selectedPlayers: {},   // { name: true/false }
    _currentMetric: 'ip',
    _currentSubTab: 'evolution', // 'evolution' | 'statsVisuelles'

    // Palette de couleurs uniques par joueur (fallback si pas de PLAYER_COLORS défini)
    DEFAULT_PALETTE: [
        '#0056D2', '#ea4335', '#34a853', '#8b5cf6', '#f59e0b',
        '#06b6d4', '#ec4899', '#84cc16', '#f97316', '#6366f1'
    ],

    // Couleurs joueurs — personnalisées par joueur
    PLAYER_COLORS: {
        'Alexandre': '#8b5cf6',  // Violet (Passeur)
        'Arnaud':    '#48D0FA',  // Cyan
        'Tom':       '#3b82f6',  // Bleu R4
        'Mikael':    '#60a5fa',  // Bleu clair
        'Lenny':     '#22c55e',  // Vert Pointu
        'Antoine':   '#4ade80',  // Vert clair
        'Jennifer':  '#ef4444',  // Rouge Centre
        'Assum':     '#f87171',  // Rouge clair
        'Olivier':   '#374151',  // Gris très foncé
    },

    METRICS: [
        { key: 'ip', label: 'IP', unit: '', decimals: 0 },
        { key: 'attEff', label: 'Eff. Att', unit: '%', decimals: 0, multiply: 100 },
        { key: 'recMoy', label: 'Rec Moy', unit: '', decimals: 2 },
        { key: 'passMoy', label: 'Passe Moy', unit: '', decimals: 2 },
        { key: 'srvPression', label: 'Srv Pression', unit: '', decimals: 2 },
        { key: 'defPlusRate', label: 'D+ Rate', unit: '%', decimals: 0, multiply: 100 }
    ],

    render() {
        if (this._rendered) return;
        var container = document.getElementById('content-visualStats');
        if (!container) return;

        this._data = this._computeAllData();

        // Sous-onglets Évolution / Stats Visuelles
        var self = this;
        var html = '<nav class="segmented-tabs data-sub-tabs">';
        html += '<button class="seg-tab data-sub-btn' + (this._currentSubTab === 'evolution' ? ' active' : '') + '" data-subtab="evolution">Évolution</button>';
        html += '<button class="seg-tab data-sub-btn' + (this._currentSubTab === 'statsVisuelles' ? ' active' : '') + '" data-subtab="statsVisuelles">Stats Visuelles</button>';
        html += '</nav>';
        html += '<div class="data-sub-content" id="data-sub-evolution"' + (this._currentSubTab !== 'evolution' ? ' style="display:none"' : '') + '></div>';
        html += '<div class="data-sub-content" id="data-sub-statsVisuelles"' + (this._currentSubTab !== 'statsVisuelles' ? ' style="display:none"' : '') + '></div>';
        container.innerHTML = html;

        // Bind sous-onglets
        container.querySelectorAll('.data-sub-btn').forEach(function(btn) {
            btn.addEventListener('click', function() {
                self._switchSubTab(btn.dataset.subtab);
            });
        });

        // Rendu du sous-onglet actif
        this._renderSubTab();
        this._rendered = true;
    },

    _switchSubTab(subtab) {
        this._currentSubTab = subtab;
        // Update boutons actifs
        document.querySelectorAll('.data-sub-btn').forEach(function(btn) {
            btn.classList.toggle('active', btn.dataset.subtab === subtab);
        });
        // Basculer visibilité
        document.querySelectorAll('.data-sub-content').forEach(function(el) {
            el.style.display = 'none';
        });
        var target = document.getElementById('data-sub-' + subtab);
        if (target) target.style.display = '';
        this._renderSubTab();
    },

    _renderSubTab() {
        if (this._currentSubTab === 'evolution') {
            this._renderEvolutionTab();
        } else {
            this._renderStatsVisuellesTab();
        }
    },

    _renderEvolutionTab() {
        var container = document.getElementById('data-sub-evolution');
        if (!container || container.children.length > 0) return;

        if (!this._data || this._data.players.length === 0) {
            container.innerHTML = '<div class="empty-state"><h3 class="empty-state-title">Pas de données</h3><p class="empty-state-desc">Aucun match filmé trouvé pour cette saison.</p></div>';
            return;
        }

        // Sélectionner tous les joueurs par défaut
        var self = this;
        this._data.players.forEach(function(p) {
            if (self._selectedPlayers[p.name] === undefined) self._selectedPlayers[p.name] = true;
        });

        this._renderAll(container);
    },

    _renderStatsVisuellesTab() {
        var container = document.getElementById('data-sub-statsVisuelles');
        if (!container || container.children.length > 0) return;
        StatsVisuellesView.render(container);
    },

    // ========== DATA COMPUTATION ==========

    _parseMatchId(id) {
        var parts = (id || '').split('_');
        return parts.length >= 3 ? { season: parts[1], num: parseInt(parts[2]) || 0 } : { season: '0', num: 0 };
    },

    _computeAllData() {
        var matches = SeasonSelector.getFilteredMatches().slice();
        if (matches.length === 0) return null;

        // Tri chronologique par ID
        var self = this;
        matches.sort(function(a, b) {
            var pa = self._parseMatchId(a.id), pb = self._parseMatchId(b.id);
            if (pa.season !== pb.season) return pa.season < pb.season ? -1 : 1;
            return pa.num - pb.num;
        });

        var matchLabels = [];
        var matchResults = [];
        var playerMap = {}; // name → { role, color, matchData[] }

        matches.forEach(function(match, mi) {
            var label = match.opponent || '?';
            if (label.length > 10) label = label.substring(0, 9) + '.';
            matchLabels.push(label);
            matchResults.push(match.result);

            var completedSets = (match.sets || []).filter(function(s) { return s.completed; });
            if (completedSets.length === 0) return;

            var roles = BilanView.getPlayerRoles(match, 'home');
            var matchStats = StatsAggregator.aggregateStats(completedSets, 'home');

            Object.keys(matchStats).forEach(function(name) {
                var pStats = matchStats[name];
                var roleInfo = roles[name];
                var role = roleInfo ? roleInfo.primaryRole : null;
                if (!role) return;

                if (!playerMap[name]) {
                    playerMap[name] = { role: null, _roleCounts: {}, matchData: [] };
                }
                var pd = playerMap[name];

                // Total actions
                var totalAct = (pStats.service.tot || 0) + (pStats.reception.tot || 0) +
                    (pStats.attack.tot || 0) + (pStats.defense.tot || 0) +
                    (pStats.block.tot || 0) + (pStats.pass.tot || 0) + (pStats.relance.tot || 0);

                if (totalAct < 3) {
                    pd.matchData.push({ played: false, matchIndex: mi });
                    return;
                }

                // Track role frequency
                pd._roleCounts[role] = (pd._roleCounts[role] || 0) + 1;
                var rc = pd._roleCounts;
                pd.role = Object.keys(rc).sort(function(a, b) { return rc[b] - rc[a]; })[0];

                // Compute IP
                var axisScores = BilanView.computeAxisScores(pStats, role);
                var ip = BilanView.computeIP(axisScores, role);

                // Derived metrics
                var metrics = self._computeDerived(pStats);

                pd.matchData.push({
                    played: true,
                    matchIndex: mi,
                    ip: ip,
                    role: role,
                    attEff: metrics.attEff,
                    recMoy: metrics.recMoy,
                    passMoy: metrics.passMoy,
                    srvPression: metrics.srvPression,
                    defPlusRate: metrics.defPlusRate
                });
            });

            // Fill 'not played' for players not in this match
            Object.keys(playerMap).forEach(function(name) {
                var pd = playerMap[name];
                if (pd.matchData.length <= mi) {
                    pd.matchData.push({ played: false, matchIndex: mi });
                }
            });
        });

        // Build sorted players array (by most recent IP descending)
        var players = [];
        var colorIdx = 0;
        Object.keys(playerMap).forEach(function(name) {
            var pd = playerMap[name];
            var playedMatches = pd.matchData.filter(function(d) { return d.played; });
            if (playedMatches.length === 0) return;

            var color = self.PLAYER_COLORS[name] || self.DEFAULT_PALETTE[colorIdx % self.DEFAULT_PALETTE.length];
            colorIdx++;

            var lastPlayed = playedMatches[playedMatches.length - 1];
            players.push({
                name: name,
                role: pd.role,
                color: color,
                matchData: pd.matchData,
                lastIP: lastPlayed.ip,
                playedCount: playedMatches.length
            });
        });

        players.sort(function(a, b) { return b.lastIP - a.lastIP; });

        return { matches: matches, matchLabels: matchLabels, matchResults: matchResults, players: players, playerMap: playerMap };
    },

    _computeDerived(s) {
        var m = {};
        // Attack efficiency
        if (s.attack.tot >= 3) {
            m.attEff = (s.attack.attplus - s.attack.fatt - s.attack.bp) / s.attack.tot;
        } else { m.attEff = null; }
        // Reception avg
        var rec = s.reception;
        if (rec.tot > 0) {
            m.recMoy = (rec.r4 * 4 + rec.r3 * 3 + rec.r2 * 2 + rec.r1 * 1) / rec.tot;
        } else { m.recMoy = null; }
        // Pass avg
        var pas = s.pass;
        if (pas && pas.tot > 0) {
            m.passMoy = (pas.p4 * 4 + pas.p3 * 3 + pas.p2 * 2 + pas.p1 * 1) / pas.tot;
        } else { m.passMoy = null; }
        // Service pressure
        var srv = s.service;
        var recCount = (srv.recCountAdv || 0) + (srv.ace || 0);
        if (recCount > 0) {
            m.srvPression = 4 - (srv.recSumAdv / recCount);
        } else { m.srvPression = null; }
        // D+ rate
        var def = s.defense;
        if (def.tot > 0) {
            m.defPlusRate = def.defplus / def.tot;
        } else { m.defPlusRate = null; }
        return m;
    },

    _getMetricValues(name, metricKey) {
        var pd = this._data.playerMap[name];
        if (!pd) return [];
        return pd.matchData.map(function(d) { return d.played ? (d[metricKey] != null ? d[metricKey] : null) : null; });
    },

    // ========== RENDERING ==========

    _renderAll(container) {
        var html = '';
        html += this._renderCardsHTML();
        html += this._renderChartHTML();
        html += this._renderFormeHTML();
        html += this._renderProgressionHTML();
        container.innerHTML = html;

        this._bindEvents(container);
        this._drawAllSparklines(container);
        this._drawChart(container);
    },

    _renderCardsHTML() {
        var self = this;
        var html = '<div class="prog-section"><div class="prog-section-title">Joueurs</div><div class="prog-cards">';
        this._data.players.forEach(function(p) {
            var sel = self._selectedPlayers[p.name] !== false;
            var roleColor = BilanView.ROLE_COLORS[p.role] || '#999';
            html += '<div class="prog-card ' + (sel ? 'selected' : 'dimmed') + '" data-player="' + p.name + '" style="--prog-player-color: ' + p.color + '">';
            html += '<div class="prog-card-header">';
            html += '<span class="prog-card-name">' + p.name + '</span>';
            html += '<span class="prog-card-role" style="background:' + roleColor + '">' + p.role + '</span>';
            html += '</div>';
            html += '<div class="prog-card-ip" style="color:' + p.color + '">' + (p.lastIP || '—') + '</div>';
            html += '<div class="prog-card-label">IP dernier match</div>';

            // Trend
            var played = p.matchData.filter(function(d) { return d.played; });
            var trend = self._computeTrend(played);
            html += '<div class="prog-card-trend ' + trend.cls + '">' + trend.text + '</div>';

            html += '<canvas class="prog-sparkline" data-player="' + p.name + '"></canvas>';
            html += '</div>';
        });
        html += '</div></div>';
        return html;
    },

    _computeTrend(played) {
        if (played.length < 4) return { text: '→ stable', cls: 'prog-trend-stable' };
        var last3 = played.slice(-3);
        var prev = played.slice(0, -3);
        var avg3 = last3.reduce(function(s, d) { return s + d.ip; }, 0) / last3.length;
        var avgPrev = prev.reduce(function(s, d) { return s + d.ip; }, 0) / prev.length;
        var diff = avgPrev > 0 ? ((avg3 - avgPrev) / avgPrev * 100) : 0;
        if (diff > 8) return { text: '↑ +' + Math.round(diff) + '%', cls: 'prog-trend-up' };
        if (diff < -8) return { text: '↓ ' + Math.round(diff) + '%', cls: 'prog-trend-down' };
        return { text: '→ stable', cls: 'prog-trend-stable' };
    },

    _renderChartHTML() {
        var self = this;
        var html = '<div class="prog-section">';
        html += '<div class="prog-section-title">Évolution match par match</div>';
        html += '<div class="prog-metrics">';
        this.METRICS.forEach(function(m) {
            html += '<button class="prog-metric-btn' + (m.key === self._currentMetric ? ' active' : '') + '" data-metric="' + m.key + '">' + m.label + '</button>';
        });
        html += '</div>';
        html += '<div class="prog-chart-wrap"><canvas id="progMainChart"></canvas></div>';
        html += '</div>';
        return html;
    },

    _renderFormeHTML() {
        var self = this;
        var metric = this.METRICS.find(function(m) { return m.key === self._currentMetric; });
        var html = '<div class="prog-section">';
        html += '<div class="prog-section-title">Forme récente (3 derniers matchs) vs Moyenne saison — ' + metric.label + '</div>';
        html += '<table class="prog-table"><thead><tr>';
        html += '<th>Joueur</th><th>Moy. saison</th><th>3 derniers</th><th>Écart</th><th>Forme</th>';
        html += '</tr></thead><tbody>';

        this._data.players.forEach(function(p) {
            if (self._selectedPlayers[p.name] === false) return;
            var vals = self._getMetricValues(p.name, self._currentMetric).filter(function(v) { return v !== null; });
            if (vals.length < 2) return;

            var mul = metric.multiply || 1;
            var avg = vals.reduce(function(a, b) { return a + b; }, 0) / vals.length * mul;
            var last3 = vals.slice(-3);
            var rolling = last3.reduce(function(a, b) { return a + b; }, 0) / last3.length * mul;
            var diff = avg !== 0 ? ((rolling - avg) / Math.abs(avg) * 100) : 0;

            html += '<tr>';
            html += '<td><span class="prog-player-dot" style="background:' + p.color + '"></span><span class="prog-player-name">' + p.name + '</span></td>';
            html += '<td>' + avg.toFixed(metric.decimals) + (metric.unit || '') + '</td>';
            html += '<td>' + rolling.toFixed(metric.decimals) + (metric.unit || '') + '</td>';
            html += '<td class="' + (diff >= 0 ? 'prog-diff-positive' : 'prog-diff-negative') + '">' + (diff >= 0 ? '+' : '') + diff.toFixed(0) + '%</td>';
            var barW = Math.min(Math.abs(diff) * 3, 100);
            html += '<td class="prog-bar-cell"><div class="prog-bar ' + (diff >= 0 ? 'prog-bar-positive' : 'prog-bar-negative') + '" style="width:' + barW + 'px"></div></td>';
            html += '</tr>';
        });

        html += '</tbody></table></div>';
        return html;
    },

    _renderProgressionHTML() {
        var self = this;
        var metric = this.METRICS.find(function(m) { return m.key === self._currentMetric; });
        var html = '<div class="prog-section">';
        html += '<div class="prog-section-title">Progression 1ère moitié → 2ème moitié — ' + metric.label + '</div>';
        html += '<table class="prog-table"><thead><tr>';
        html += '<th>Joueur</th><th>1ère moitié</th><th>2ème moitié</th><th>Progression</th><th>Tendance</th>';
        html += '</tr></thead><tbody>';

        this._data.players.forEach(function(p) {
            if (self._selectedPlayers[p.name] === false) return;
            var allVals = self._getMetricValues(p.name, self._currentMetric);
            var played = [];
            allVals.forEach(function(v, i) { if (v !== null) played.push({ val: v, idx: i }); });
            if (played.length < 4) return;

            var mul = metric.multiply || 1;
            var half = Math.ceil(played.length / 2);
            var first = played.slice(0, half);
            var second = played.slice(half);
            var avg1 = first.reduce(function(s, d) { return s + d.val; }, 0) / first.length * mul;
            var avg2 = second.reduce(function(s, d) { return s + d.val; }, 0) / second.length * mul;
            var diff = avg1 !== 0 ? ((avg2 - avg1) / Math.abs(avg1) * 100) : 0;

            html += '<tr>';
            html += '<td><span class="prog-player-dot" style="background:' + p.color + '"></span><span class="prog-player-name">' + p.name + '</span></td>';
            html += '<td>' + avg1.toFixed(metric.decimals) + (metric.unit || '') + '</td>';
            html += '<td>' + avg2.toFixed(metric.decimals) + (metric.unit || '') + '</td>';
            html += '<td class="' + (diff >= 0 ? 'prog-diff-positive' : 'prog-diff-negative') + '">' + (diff >= 0 ? '+' : '') + diff.toFixed(0) + '%</td>';
            var barW = Math.min(Math.abs(diff) * 2, 100);
            html += '<td class="prog-bar-cell"><div class="prog-bar ' + (diff >= 0 ? 'prog-bar-positive' : 'prog-bar-negative') + '" style="width:' + barW + 'px"></div></td>';
            html += '</tr>';
        });

        html += '</tbody></table></div>';
        return html;
    },

    // ========== CANVAS DRAWING ==========

    _drawAllSparklines(container) {
        var self = this;
        requestAnimationFrame(function() {
            self._data.players.forEach(function(p) {
                var canvas = container.querySelector('canvas.prog-sparkline[data-player="' + p.name + '"]');
                if (!canvas) return;
                var played = p.matchData.filter(function(d) { return d.played; });
                var vals = played.map(function(d) { return d.ip || 0; });
                self._drawSparkline(canvas, vals, p.color);
            });
        });
    },

    _drawSparkline(canvas, values, color) {
        if (values.length < 2) return;
        var rect = canvas.getBoundingClientRect();
        var w = rect.width || 140;
        var h = rect.height || 28;
        var dpr = window.devicePixelRatio || 1;
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        var ctx = canvas.getContext('2d');
        ctx.scale(dpr, dpr);

        var min = Math.min.apply(null, values);
        var max = Math.max.apply(null, values);
        if (max === min) { max = min + 1; }

        var pad = 2;
        var points = values.map(function(v, i) {
            return {
                x: values.length === 1 ? w / 2 : pad + (i / (values.length - 1)) * (w - pad * 2),
                y: h - ((v - min) / (max - min)) * (h - 4) - 2
            };
        });

        // Area fill
        ctx.beginPath();
        ctx.moveTo(points[0].x, h);
        points.forEach(function(pt) { ctx.lineTo(pt.x, pt.y); });
        ctx.lineTo(points[points.length - 1].x, h);
        ctx.closePath();
        ctx.fillStyle = color + '15';
        ctx.fill();

        // Line
        ctx.beginPath();
        points.forEach(function(pt, i) { i === 0 ? ctx.moveTo(pt.x, pt.y) : ctx.lineTo(pt.x, pt.y); });
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.lineJoin = 'round';
        ctx.stroke();

        // Last point dot
        var last = points[points.length - 1];
        ctx.beginPath();
        ctx.arc(last.x, last.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
    },

    _drawChart(container) {
        var canvas = container.querySelector('#progMainChart');
        if (!canvas) return;
        var self = this;
        var wrap = canvas.parentElement;
        var w = wrap.offsetWidth;
        var h = wrap.offsetHeight;
        var dpr = window.devicePixelRatio || 1;
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        canvas.style.width = w + 'px';
        canvas.style.height = h + 'px';
        var ctx = canvas.getContext('2d');
        ctx.scale(dpr, dpr);

        var pad = { top: 20, right: 25, bottom: 45, left: 10 };
        var chartW = w - pad.left - pad.right;
        var chartH = h - pad.top - pad.bottom;
        var numMatches = this._data.matchLabels.length;
        if (numMatches === 0) return;

        var metricKey = this._currentMetric;
        var metricDef = this.METRICS.find(function(m) { return m.key === metricKey; });
        var mul = metricDef.multiply || 1;

        // Collect all visible values for Y range
        var allVals = [];
        this._data.players.forEach(function(p) {
            if (self._selectedPlayers[p.name] === false) return;
            self._getMetricValues(p.name, metricKey).forEach(function(v) {
                if (v !== null) allVals.push(v * mul);
            });
        });
        if (allVals.length === 0) return;

        var dataMin = Math.min.apply(null, allVals);
        var dataMax = Math.max.apply(null, allVals);
        var range = dataMax - dataMin || 1;
        var yMin = dataMin - range * 0.15;
        var yMax = dataMax + range * 0.15;

        function xPos(i) { return pad.left + (numMatches === 1 ? chartW / 2 : (i / (numMatches - 1)) * chartW); }
        function yPos(v) { return pad.top + (1 - (v - yMin) / (yMax - yMin)) * chartH; }

        // Grid
        ctx.strokeStyle = '#e8eaed';
        ctx.lineWidth = 0.5;
        ctx.fillStyle = '#5f6368';
        ctx.font = '11px Roboto, sans-serif';
        ctx.textAlign = 'right';
        for (var gi = 0; gi <= 4; gi++) {
            var gv = yMin + (gi / 4) * (yMax - yMin);
            var gy = yPos(gv);
            ctx.beginPath();
            ctx.moveTo(pad.left, gy);
            ctx.lineTo(w - pad.right, gy);
            ctx.stroke();
            ctx.fillText(gv.toFixed(metricDef.decimals), w - 2, gy + 3);
        }

        // X-axis labels + result dots
        ctx.textAlign = 'center';
        ctx.font = '10px Roboto, sans-serif';
        this._data.matchLabels.forEach(function(label, i) {
            var x = xPos(i);
            ctx.fillStyle = '#5f6368';
            ctx.save();
            ctx.translate(x, h - pad.bottom + 14);
            ctx.rotate(-0.4);
            ctx.fillText(label, 0, 0);
            ctx.restore();

            // Result dot
            var res = self._data.matchResults[i];
            ctx.beginPath();
            ctx.arc(x, h - pad.bottom + 28, 3, 0, Math.PI * 2);
            ctx.fillStyle = res === 'win' ? '#34a853' : res === 'loss' ? '#ea4335' : '#f59e0b';
            ctx.fill();
        });

        // Player lines
        this._data.players.forEach(function(p) {
            if (self._selectedPlayers[p.name] === false) return;
            var vals = self._getMetricValues(p.name, metricKey);

            // Collect visible points
            var pts = [];
            vals.forEach(function(v, i) {
                if (v !== null) pts.push({ x: xPos(i), y: yPos(v * mul), val: v * mul });
            });
            if (pts.length < 1) return;

            // Area fill
            ctx.beginPath();
            ctx.moveTo(pts[0].x, pad.top + chartH);
            pts.forEach(function(pt) { ctx.lineTo(pt.x, pt.y); });
            ctx.lineTo(pts[pts.length - 1].x, pad.top + chartH);
            ctx.closePath();
            ctx.fillStyle = p.color + '08';
            ctx.fill();

            // Line
            ctx.beginPath();
            pts.forEach(function(pt, i) { i === 0 ? ctx.moveTo(pt.x, pt.y) : ctx.lineTo(pt.x, pt.y); });
            ctx.strokeStyle = p.color;
            ctx.lineWidth = 2.5;
            ctx.lineJoin = 'round';
            ctx.stroke();

            // Dots
            pts.forEach(function(pt) {
                ctx.beginPath();
                ctx.arc(pt.x, pt.y, 4, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.fill();
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 2;
                ctx.stroke();
            });

            // Season average dashed line
            var nonNull = vals.filter(function(v) { return v !== null; });
            if (nonNull.length > 1) {
                var avg = nonNull.reduce(function(a, b) { return a + b; }, 0) / nonNull.length * mul;
                var avgY = yPos(avg);
                ctx.setLineDash([4, 4]);
                ctx.strokeStyle = p.color + '50';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(pad.left, avgY);
                ctx.lineTo(w - pad.right, avgY);
                ctx.stroke();
                ctx.setLineDash([]);
            }
        });
    },

    // ========== EVENTS ==========

    _bindEvents(container) {
        var self = this;

        // Card toggle
        container.querySelectorAll('.prog-card').forEach(function(card) {
            card.addEventListener('click', function() {
                var name = card.dataset.player;
                self._selectedPlayers[name] = !self._selectedPlayers[name];
                card.classList.toggle('selected', self._selectedPlayers[name]);
                card.classList.toggle('dimmed', !self._selectedPlayers[name]);
                self._redrawDynamic(container);
            });
        });

        // Metric buttons
        container.querySelectorAll('.prog-metric-btn').forEach(function(btn) {
            btn.addEventListener('click', function() {
                container.querySelectorAll('.prog-metric-btn').forEach(function(b) { b.classList.remove('active'); });
                btn.classList.add('active');
                self._currentMetric = btn.dataset.metric;
                self._redrawDynamic(container);
            });
        });
    },

    _redrawDynamic(container) {
        this._drawChart(container);
        // Re-render tables (replace innerHTML of table sections)
        var sections = container.querySelectorAll('.prog-section');
        if (sections.length >= 3) {
            // Forme = section[2], Progression = section[3]
            var formeDiv = document.createElement('div');
            formeDiv.innerHTML = this._renderFormeHTML();
            sections[2].replaceWith(formeDiv.firstElementChild);

            var progDiv = document.createElement('div');
            progDiv.innerHTML = this._renderProgressionHTML();
            sections[3].replaceWith(progDiv.firstElementChild);
        }
    }
};

// ==================== STATS VISUELLES VIEW ====================

const StatsVisuellesView = {
    // State
    _rendered: false,
    _container: null,
    _selectedMatch: 'all',
    _selectedCategories: { service: true, reception: false, pass: false, attack: true, relance: false, defense: false, block: false },
    _selectedResult: 'all', // 'all'|'positive'|'neutral'|'negative'
    _selectedPlayers: {},   // { name: true/false }
    _selectedSet: 'all',    // 'all' | set index number
    _heatmapMode: 'both',   // 'start' | 'end' | 'both'
    _hmBoth:   { radius: 0.07, gamma: 0.45, alpha: 200, cutoff: 0.01 },
    _hmSingle: { radius: 0.10, gamma: 0.65, alpha: 240, cutoff: 0.01 },
    _trajectories: [],

    _layout: null,    // measured element rects for coordinate mapping

    RESULT_COLORS: {
        positive: '#34a853',
        negative: '#ea4335',
        neutral: '#9e9e9e'
    },

    // Couleurs par type d'attaque (identiques à match-live)
    ATTACK_TYPE_COLORS: {
        'attack': null,           // utilise la couleur résultat par défaut
        'attack-feinte': '#f97316',   // orange
        'attack-relance': '#faef00',  // jaune
        'attack-second': '#22d3ee',   // cyan
        'block-touch': '#ff1493'      // rose
    },

    CATEGORY_LABELS: [
        { key: 'service', label: 'Serv' },
        { key: 'reception', label: 'Rec' },
        { key: 'pass', label: 'Pas' },
        { key: 'attack', label: 'Att' },
        { key: 'relance', label: 'Rel' },
        { key: 'defense', label: 'Def' },
        { key: 'block', label: 'Blc' }
    ],

    render(container) {
        this._container = container;
        var matches = SeasonSelector.getFilteredMatches();
        if (!matches || matches.length === 0) {
            container.innerHTML = '<div class="empty-state"><h3 class="empty-state-title">Pas de données</h3><p class="empty-state-desc">Aucun match trouvé pour cette saison.</p></div>';
            return;
        }

        // Init player selection
        var players = this._getPlayersForScope(matches);
        var self = this;
        players.forEach(function(p) {
            if (self._selectedPlayers[p.name] === undefined) self._selectedPlayers[p.name] = true;
        });

        container.innerHTML = this._buildHTML(matches, players);
        this._bindEvents(container);
        // Delay arrow update to ensure layout is computed (aspect-ratio needs layout pass)
        var self = this;
        requestAnimationFrame(function() { self._updateArrows(); });
    },

    // ========== HTML GENERATION ==========

    _buildHTML(matches, players) {
        var html = '<div class="sv-container">';

        // Match selector
        html += '<div class="sv-filters">';
        html += this._buildMatchSelector(matches);

        // Category pills
        html += '<div class="sv-filter-group">';
        html += '<div class="sv-cat-pills">';
        var self = this;
        this.CATEGORY_LABELS.forEach(function(c) {
            var active = self._selectedCategories[c.key] ? ' active' : '';
            html += '<button class="sv-cat-pill' + active + '" data-cat="' + c.key + '">' + c.label + '</button>';
        });
        html += '</div></div>';

        // Result filter
        html += '<div class="sv-filter-group">';
        html += '<div class="sv-result-pills">';
        var results = [
            { key: 'all', label: 'Tout' },
            { key: 'positive', label: '+', color: this.RESULT_COLORS.positive },
            { key: 'neutral', label: '=', color: this.RESULT_COLORS.neutral },
            { key: 'negative', label: '−', color: this.RESULT_COLORS.negative }
        ];
        results.forEach(function(r) {
            var active = self._selectedResult === r.key ? ' active' : '';
            var style = r.color && !active ? ' style="border-color:' + r.color + ';color:' + r.color + '"' : '';
            var styleActive = r.color && active ? ' style="background:' + r.color + ';border-color:' + r.color + '"' : '';
            html += '<button class="sv-result-pill' + active + '" data-result="' + r.key + '"' + (active ? styleActive : style) + '>' + r.label + '</button>';
        });
        html += '</div></div>';

        // Player chips
        html += '<div class="sv-filter-group">';
        html += '<div class="sv-player-chips">';
        players.forEach(function(p) {
            var active = self._selectedPlayers[p.name] !== false ? ' active' : '';
            html += '<button class="sv-player-chip' + active + '" data-player="' + p.name + '" style="--sv-player-color:' + p.color + '">';
            html += '<span class="sv-role-dot" style="background:' + p.roleColor + '"></span>';
            html += p.name;
            html += '</button>';
        });
        html += '</div></div>';

        // Set filter
        html += this._buildSetFilter(matches);

        // Heatmap mode toggle (for reception)
        html += '<div class="sv-filter-group sv-heatmap-toggle" id="svHeatmapToggle">';
        html += '<div class="sv-heatmap-pills">';
        var hmModes = [
            { key: 'both', label: 'Les deux' },
            { key: 'start', label: 'Départ' },
            { key: 'end', label: 'Arrivée' }
        ];
        hmModes.forEach(function(m) {
            var active = self._heatmapMode === m.key ? ' active' : '';
            html += '<button class="sv-heatmap-pill' + active + '" data-hm="' + m.key + '">' + m.label + '</button>';
        });
        html += '</div></div>';

        // Heatmap tuner panel (visible with ?tuner in URL)
        if (window.location.search.indexOf('tuner') !== -1) {
            html += '<div class="sv-heatmap-tuner" id="svHeatmapTuner">';
            html += '<div class="sv-tuner-title">Heatmap Tuner</div>';
            html += '<div class="sv-tuner-columns">';
            // Column 1: "Les deux"
            html += '<div class="sv-tuner-col">';
            html += '<div class="sv-tuner-subtitle">Les deux</div>';
            html += '<div class="sv-tuner-row"><label>Taille <span id="hm-v-both_radius">' + (self._hmBoth.radius) + '</span></label><input type="range" id="hm-both_radius" min="0.03" max="0.18" step="0.01" value="' + self._hmBoth.radius + '"></div>';
            html += '<div class="sv-tuner-row"><label>Contraste <span id="hm-v-both_gamma">' + (self._hmBoth.gamma) + '</span></label><input type="range" id="hm-both_gamma" min="0.2" max="0.9" step="0.05" value="' + self._hmBoth.gamma + '"></div>';
            html += '<div class="sv-tuner-row"><label>Opacité <span id="hm-v-both_alpha">' + (self._hmBoth.alpha) + '</span></label><input type="range" id="hm-both_alpha" min="80" max="255" step="5" value="' + self._hmBoth.alpha + '"></div>';
            html += '<div class="sv-tuner-row"><label>Seuil <span id="hm-v-both_cutoff">' + (self._hmBoth.cutoff) + '</span></label><input type="range" id="hm-both_cutoff" min="0" max="0.15" step="0.005" value="' + self._hmBoth.cutoff + '"></div>';
            html += '</div>';
            // Column 2: "Départ / Arrivée"
            html += '<div class="sv-tuner-col">';
            html += '<div class="sv-tuner-subtitle">Départ / Arrivée</div>';
            html += '<div class="sv-tuner-row"><label>Taille <span id="hm-v-single_radius">' + (self._hmSingle.radius) + '</span></label><input type="range" id="hm-single_radius" min="0.03" max="0.18" step="0.01" value="' + self._hmSingle.radius + '"></div>';
            html += '<div class="sv-tuner-row"><label>Contraste <span id="hm-v-single_gamma">' + (self._hmSingle.gamma) + '</span></label><input type="range" id="hm-single_gamma" min="0.2" max="0.9" step="0.05" value="' + self._hmSingle.gamma + '"></div>';
            html += '<div class="sv-tuner-row"><label>Opacité <span id="hm-v-single_alpha">' + (self._hmSingle.alpha) + '</span></label><input type="range" id="hm-single_alpha" min="80" max="255" step="5" value="' + self._hmSingle.alpha + '"></div>';
            html += '<div class="sv-tuner-row"><label>Seuil <span id="hm-v-single_cutoff">' + (self._hmSingle.cutoff) + '</span></label><input type="range" id="hm-single_cutoff" min="0" max="0.15" step="0.005" value="' + self._hmSingle.cutoff + '"></div>';
            html += '</div>';
            html += '</div></div>';
        }

        html += '</div>'; // end sv-filters

        // Court (HTML/CSS like match-live + SVG overlay for arrows)
        html += this._buildCourt();

        // Arrow count
        html += '<div class="sv-arrow-count" id="svArrowCount"></div>';

        html += '</div>'; // end sv-container
        return html;
    },

    _buildMatchSelector(matches) {
        var html = '<div class="sv-filter-group">';
        html += '<select class="sv-match-select" id="svMatchSelect">';
        html += '<option value="all"' + (this._selectedMatch === 'all' ? ' selected' : '') + '>Tous les matchs</option>';
        matches.forEach(function(m) {
            var label = 'vs ' + (m.opponent || '?');
            if (m.sets) label += ' (' + m.sets.length + ' sets)';
            var sel = (this._selectedMatch === m.id) ? ' selected' : '';
            html += '<option value="' + m.id + '"' + sel + '>' + label + '</option>';
        }.bind(this));
        html += '</select></div>';
        return html;
    },

    _buildSetFilter(matches) {
        // Determine max sets from scope
        var maxSets = 0;
        var scopeMatches = this._selectedMatch === 'all' ? matches : matches.filter(function(m) { return m.id === this._selectedMatch; }.bind(this));
        scopeMatches.forEach(function(m) {
            if (m.sets) maxSets = Math.max(maxSets, m.sets.length);
        });

        var html = '<div class="sv-filter-group"><div class="sv-set-pills">';
        html += '<button class="sv-set-pill' + (this._selectedSet === 'all' ? ' active' : '') + '" data-set="all">Tout</button>';
        for (var i = 0; i < maxSets; i++) {
            html += '<button class="sv-set-pill' + (this._selectedSet === i ? ' active' : '') + '" data-set="' + i + '">S' + (i + 1) + '</button>';
        }
        html += '</div></div>';
        return html;
    },

    _buildCourt() {
        var self = this;
        var html = '<div class="sv-court-wrapper">';
        html += '<div class="sv-court" id="svCourt">';

        // Service zone top
        html += '<div class="sv-service-zone sv-top" id="svServiceTop">';
        html += '<span class="sv-svc-label">Service</span>';
        html += '</div>';

        // Team label top
        html += '<div class="sv-team-label">ADVERSE</div>';

        // Court half top (adverse)
        html += '<div class="sv-court-half sv-away" id="svCourtAway"></div>';

        // Net
        html += '<div class="sv-net" id="svNet"></div>';

        // Court half bottom (Jen)
        html += '<div class="sv-court-half sv-home" id="svCourtHome"></div>';

        // Team label bottom
        html += '<div class="sv-team-label">JEN</div>';

        // Service zone bottom
        html += '<div class="sv-service-zone sv-bottom" id="svServiceBot">';
        html += '<span class="sv-svc-label">Service</span>';
        html += '</div>';

        // SVG overlay for arrows (positioned absolutely over the court)
        html += '<svg class="sv-arrow-svg" id="svArrowSvg">';
        html += '<defs>';
        // Markers par résultat (pour service, réception, etc.)
        ['positive', 'negative', 'neutral'].forEach(function(r) {
            html += '<marker id="sv-arrow-' + r + '" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto" markerUnits="userSpaceOnUse">';
            html += '<polygon points="0 0, 10 3.5, 0 7" fill="' + self.RESULT_COLORS[r] + '"/>';
            html += '</marker>';
        });
        // Markers par type d'attaque (feinte, relance, 2e main, block-touch)
        Object.keys(self.ATTACK_TYPE_COLORS).forEach(function(type) {
            var c = self.ATTACK_TYPE_COLORS[type];
            if (!c) return; // skip 'attack' (uses result color)
            html += '<marker id="sv-arrow-' + type + '" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto" markerUnits="userSpaceOnUse">';
            html += '<polygon points="0 0, 10 3.5, 0 7" fill="' + c + '"/>';
            html += '</marker>';
        });
        html += '</defs>';
        html += '<g id="svArrowGroup"></g>';
        html += '</svg>';

        // Canvas overlay for heatmap (reception)
        html += '<canvas class="sv-heatmap-canvas" id="svHeatmapCanvas"></canvas>';

        html += '</div>'; // sv-court
        html += '</div>'; // sv-court-wrapper
        return html;
    },

    // ========== DATA EXTRACTION ==========

    _getPlayersForScope(matches) {
        var scopeMatches = this._selectedMatch === 'all' ? matches : matches.filter(function(m) { return m.id === this._selectedMatch; }.bind(this));
        var playerMap = {};
        var self = this;

        scopeMatches.forEach(function(match) {
            if (!match.sets) return;
            var roles = BilanView.getPlayerRoles ? BilanView.getPlayerRoles(match, 'home') : {};
            match.sets.forEach(function(set) {
                if (!set.homeLineup) return;
                Object.keys(set.homeLineup).forEach(function(pos) {
                    var name = set.homeLineup[pos];
                    if (!name || playerMap[name]) return;
                    var role = roles[name] ? roles[name].primaryRole : '';
                    var roleColor = BilanView.ROLE_COLORS ? (BilanView.ROLE_COLORS[role] || '#999') : '#999';
                    var color = (ProgressionView.PLAYER_COLORS && ProgressionView.PLAYER_COLORS[name]) || '#0056D2';
                    playerMap[name] = { name: name, role: role, roleColor: roleColor, color: color };
                });
            });
        });

        var players = Object.values(playerMap);
        players.sort(function(a, b) { return a.name.localeCompare(b.name); });
        return players;
    },

    _extractTrajectories() {
        var matches = SeasonSelector.getFilteredMatches();
        if (!matches) return [];

        var scopeMatches = this._selectedMatch === 'all' ? matches : matches.filter(function(m) { return m.id === this._selectedMatch; }.bind(this));
        var trajectories = [];
        var self = this;

        scopeMatches.forEach(function(match) {
            if (!match.sets) return;
            match.sets.forEach(function(set, setIdx) {
                // Set filter
                if (self._selectedSet !== 'all' && self._selectedSet !== setIdx) return;
                if (!set.points) return;

                var cameraSide = set.cameraSide || 'home';

                set.points.forEach(function(point) {
                    if (!point.rally) return;
                    point.rally.forEach(function(action, actionIdx) {
                        // Only home team actions
                        if (action.team !== 'home') return;

                        // Distinguish relance from attack for category filtering
                        var effectiveType = action.type;
                        if (action.type === 'attack' && action.attackType === 'relance') {
                            effectiveType = 'relance';
                        }

                        // Category filter (using effective type)
                        if (!self._selectedCategories[effectiveType]) return;
                        // Player filter
                        if (action.player && self._selectedPlayers[action.player] === false) return;

                        // Need at least endPos
                        if (!action.endPos) return;

                        var result = self._classifyResult(action);
                        // Result filter
                        if (self._selectedResult !== 'all' && result !== self._selectedResult) return;

                        // Determine attack arrow type (feinte, relance, 2e main)
                        var attackArrowType = null;
                        if (effectiveType === 'attack' || effectiveType === 'relance') {
                            if (action.attackType === 'feinte') attackArrowType = 'attack-feinte';
                            else if (action.attackType === 'relance') attackArrowType = 'attack-relance';
                            else if (action.attackType === 'deuxieme_main') attackArrowType = 'attack-second';
                        }

                        // Annoter les positions 'out' avec targetCourt pour le clampage
                        // home team : startPos = terrain home, endPos dépend du type d'action
                        var startPos = action.startPos ? Object.assign({}, action.startPos) : null;
                        var endPos = Object.assign({}, action.endPos);
                        if (startPos && startPos.courtSide === 'out') {
                            startPos.targetCourt = 'home'; // Le joueur home est toujours sur son terrain
                        }
                        if (endPos.courtSide === 'out') {
                            // Défense, réception, passe : endPos sur le terrain home
                            // Attaque, service : endPos sur le terrain adverse (là où la balle atterrit)
                            if (effectiveType === 'defense' || effectiveType === 'reception' || effectiveType === 'pass') {
                                endPos.targetCourt = 'home';
                            } else if (effectiveType === 'service' || effectiveType === 'attack' || effectiveType === 'relance') {
                                endPos.targetCourt = 'away';
                            }
                        }

                        var hasStart = startPos && startPos.courtSide;
                        var startSvg = hasStart ? self._posToSvg(self._normalizePos(startPos, cameraSide)) : null;

                        // Blocs : afficher au filet (pas à endPos qui est l'atterrissage)
                        // On utilise startPos.x de l'attaque adverse (= position attaquant, en face du bloqueur)
                        // On normalise d'abord la position de l'attaquant, puis on place le bloc au filet (y=0 de 'bottom')
                        var endSvg;
                        if (effectiveType === 'block') {
                            var blockX = 50; // fallback centre
                            for (var bi = actionIdx - 1; bi >= 0; bi--) {
                                var prevA = point.rally[bi];
                                if (prevA.type === 'attack' && prevA.startPos) {
                                    var normAttacker = self._normalizePos(prevA.startPos, cameraSide);
                                    blockX = normAttacker.x;
                                    break;
                                }
                            }
                            endSvg = self._posToSvg({ x: blockX, y: 0, courtSide: 'bottom' });
                        } else {
                            endSvg = self._posToSvg(self._normalizePos(endPos, cameraSide));
                        }

                        trajectories.push({
                            type: effectiveType,
                            player: action.player,
                            result: result,
                            attackArrowType: attackArrowType,
                            startPos: startSvg,
                            endPos: endSvg,
                            hasArrow: hasStart
                        });

                        // Block-touch : si l'attaque touche le filet/bloc, chercher le bloc qui suit
                        // pour tracer la continuation (filet → terrain adverse)
                        if ((effectiveType === 'attack' || effectiveType === 'relance') &&
                            action.endPos && action.endPos.courtSide === 'net') {
                            // Chercher le block action suivant dans le rally
                            for (var bi = actionIdx + 1; bi < point.rally.length; bi++) {
                                var nextAction = point.rally[bi];
                                if (nextAction.type === 'block' && nextAction.endPos) {
                                    var blockEndSvg = self._posToSvg(self._normalizePos(nextAction.endPos, cameraSide));
                                    trajectories.push({
                                        type: 'block-touch',
                                        player: action.player,
                                        result: 'block-touch',
                                        attackArrowType: 'block-touch',
                                        startPos: endSvg,  // départ = position au filet
                                        endPos: blockEndSvg,
                                        hasArrow: true
                                    });
                                    break;
                                }
                                // Stop if we hit another attack or pass (new sequence)
                                if (nextAction.type === 'attack' || nextAction.type === 'pass') break;
                            }
                        }
                    });
                });
            });
        });

        return trajectories;
    },

    _normalizePos(pos, cameraSide) {
        if (!pos) return pos;
        // Si cameraSide === 'home', home=bottom et away=top (déjà canonique)
        if (cameraSide === 'home') {
            var r = { x: pos.x, y: pos.y, courtSide: pos.courtSide };
            if (pos.targetCourt) r.targetCourt = pos.targetCourt;
            return r;
        }

        // cameraSide === 'away': rotation 180° — home était en top, away en bottom
        // On flip courtSide, X (gauche-droite inversé car caméra côté opposé) et Y
        var flipMap = { 'top': 'bottom', 'bottom': 'top', 'service_top': 'service_bottom', 'service_bottom': 'service_top' };
        var newSide = flipMap[pos.courtSide] || pos.courtSide;
        // net et out sont en % du courtContainer → flip X et Y aussi
        var result = {
            x: 100 - pos.x,
            y: 100 - pos.y,
            courtSide: newSide
        };
        // Préserver targetCourt (logique, pas dépendant de la caméra)
        if (pos.targetCourt) result.targetCourt = pos.targetCourt;
        return result;
    },

    _posToSvg(pos) {
        if (!pos || !this._layout) return { x: 0, y: 0 };
        var L = this._layout;
        var cR = L.court;

        function mapTo(rect, px, py) {
            return {
                x: (rect.left - cR.left) + (px / 100) * rect.width,
                y: (rect.top - cR.top) + (py / 100) * rect.height
            };
        }

        switch (pos.courtSide) {
            case 'bottom': return mapTo(L.home, pos.x, pos.y);
            case 'top': return mapTo(L.away, pos.x, pos.y);
            case 'service_bottom': return mapTo(L.svcBot, pos.x, pos.y);
            case 'service_top': return mapTo(L.svcTop, pos.x, pos.y);
            case 'net': {
                // net x,y sont en % de courtContainer (= sv-court-wrapper)
                // X : mapper via wrapper puis convertir en coords SVG (relatives à sv-court)
                // Y : toujours le centre mesuré du filet (dans match-live, Y stocké = centre du filet)
                var wR = L.wrapper;
                return {
                    x: (pos.x / 100) * wR.width + (wR.left - cR.left),
                    y: (L.net.top - cR.top) + L.net.height / 2
                };
            }
            case 'out': {
                // out x,y sont en % de courtContainer (= sv-court-wrapper)
                // Mapper via wrapper puis convertir en coords SVG, puis clamper vers le demi-terrain cible
                var wR = L.wrapper;
                var svgX = (pos.x / 100) * wR.width + (wR.left - cR.left);
                var svgY = (pos.y / 100) * wR.height + (wR.top - cR.top);
                var homeTop = L.home.top - cR.top;
                var homeBot = homeTop + L.home.height;
                var awayTop = L.away.top - cR.top;
                var awayBot = awayTop + L.away.height;
                var netY = (homeTop + awayBot) / 2;
                var target = pos.targetCourt || (svgY <= netY ? 'away' : 'home');
                if (target === 'home') {
                    svgY = Math.max(homeTop, Math.min(homeBot, svgY));
                } else {
                    svgY = Math.max(awayTop, Math.min(awayBot, svgY));
                }
                var courtLeft = L.home.left - cR.left;
                var courtRight = courtLeft + L.home.width;
                svgX = Math.max(courtLeft, Math.min(courtRight, svgX));
                return { x: svgX, y: svgY };
            }
            default:
                return {
                    x: (L.net.left - cR.left) + (pos.x / 100) * L.net.width,
                    y: (L.net.top - cR.top) + L.net.height / 2
                };
        }
    },

    _classifyResult(action) {
        switch (action.type) {
            case 'service':
                if (action.result === 'ace') return 'positive';
                if (action.result && action.result.indexOf('fault') === 0) return 'negative';
                return 'neutral';
            case 'reception':
                if (action.quality) {
                    if (action.quality.score >= 3) return 'positive';
                    if (action.quality.score <= 1) return 'negative';
                }
                return 'neutral';
            case 'pass':
                if (action.quality) {
                    if (action.quality.score >= 3) return 'positive';
                    if (action.quality.score <= 1) return 'negative';
                }
                return 'neutral';
            case 'attack':
                if (action.result === 'point' || action.result === 'bloc_out') return 'positive';
                if (action.result === 'blocked' || action.result === 'out' || action.result === 'fault_net') return 'negative';
                if (action.attackType === 'faute') return 'negative';
                return 'neutral';
            case 'defense':
                if (action.defenseQuality === 'positive') return 'positive';
                if (action.result === 'fault') return 'negative';
                return 'neutral';
            case 'block':
                if (action.result === 'kill' || action.result === 'point') return 'positive';
                if (action.result === 'bloc_out') return 'negative';
                return 'neutral';
            default:
                return 'neutral';
        }
    },

    // ========== HEATMAP RENDERING ==========

    // Vibrant heatmap palette — football analytics style
    _HEAT_PALETTE: [
        [0, 0, 200],      // blue (low)
        [0, 160, 255],    // cyan
        [0, 220, 80],     // green
        [255, 240, 0],    // yellow
        [255, 120, 0],    // orange
        [255, 0, 0]       // red (high)
    ],

    // Blue-toned palette for "Départ" layer in both mode
    // Clair → Foncé : bleu clair = peu de réceptions, bleu foncé = beaucoup
    _HEAT_PALETTE_BLUE: [
        [140, 220, 255],  // bleu très clair (faible densité)
        [80, 180, 255],   // bleu clair
        [0, 140, 255],    // bleu moyen
        [0, 90, 220],     // bleu vif
        [10, 50, 170],    // bleu foncé
        [5, 20, 120]      // bleu marine (forte densité)
    ],

    // Green-toned palette for "Arrivée" layer in both mode
    // Clair → Foncé : vert clair = peu, vert foncé = beaucoup
    _HEAT_PALETTE_GREEN: [
        [140, 255, 160],  // vert très clair (faible densité)
        [80, 230, 100],   // vert clair
        [0, 200, 60],     // vert moyen
        [0, 150, 40],     // vert vif
        [0, 100, 25],     // vert foncé
        [0, 60, 15]       // vert forêt (forte densité)
    ],

    _interpolatePalette(palette, t) {
        // t in [0,1] → RGB
        if (t <= 0) return palette[0];
        if (t >= 1) return palette[palette.length - 1];
        var scaled = t * (palette.length - 1);
        var idx = Math.floor(scaled);
        var frac = scaled - idx;
        if (idx >= palette.length - 1) return palette[palette.length - 1];
        var a = palette[idx], b = palette[idx + 1];
        return [
            a[0] + (b[0] - a[0]) * frac,
            a[1] + (b[1] - a[1]) * frac,
            a[2] + (b[2] - a[2]) * frac
        ];
    },

    _drawHeatmap(receptionTrajs) {
        var canvas = document.getElementById('svHeatmapCanvas');
        var court = document.getElementById('svCourt');
        if (!canvas || !court) return;

        var rect = court.getBoundingClientRect();
        var w = rect.width;
        var h = rect.height;
        var dpr = window.devicePixelRatio || 1;
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
        canvas.style.width = w + 'px';
        canvas.style.height = h + 'px';
        var ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Clip to court area (service zones + court halves) to prevent overflow
        var cR = rect; // court (svCourt) rect
        var awayEl = document.getElementById('svCourtAway');
        var homeEl = document.getElementById('svCourtHome');
        var svcTopEl = document.getElementById('svServiceTop');
        var svcBotEl = document.getElementById('svServiceBot');
        if (awayEl && homeEl) {
            var aR = awayEl.getBoundingClientRect();
            var hR = homeEl.getBoundingClientRect();
            // Clip from top of away court to bottom of home court (full playable area)
            var clipTop = (svcTopEl ? svcTopEl.getBoundingClientRect().top : aR.top) - cR.top;
            var clipBot = (svcBotEl ? svcBotEl.getBoundingClientRect().bottom : hR.bottom) - cR.top;
            var clipLeft = aR.left - cR.left;
            var clipRight = aR.right - cR.left;
            ctx.save();
            ctx.beginPath();
            ctx.rect(clipLeft * dpr, clipTop * dpr, (clipRight - clipLeft) * dpr, (clipBot - clipTop) * dpr);
            ctx.clip();
        }

        var mode = this._heatmapMode;

        // Collect points in pixel coords (already SVG coords = court-relative pixels)
        var startPts = [];
        var endPts = [];
        receptionTrajs.forEach(function(t) {
            if (t.startPos && (mode === 'start' || mode === 'both')) {
                startPts.push({ x: t.startPos.x * dpr, y: t.startPos.y * dpr });
            }
            if (t.endPos && (mode === 'end' || mode === 'both')) {
                endPts.push({ x: t.endPos.x * dpr, y: t.endPos.y * dpr });
            }
        });

        // Tunable params — separate for 'both' vs 'single' modes
        var hmConf = (mode === 'both') ? this._hmBoth : this._hmSingle;
        var radius = Math.round(w * hmConf.radius * dpr);

        if (mode === 'both') {
            // Two vibrant layers: green (arrivée) dessous, blue (départ) au-dessus
            if (endPts.length > 0) {
                var endLayer = this._renderHeatLayer(canvas.width, canvas.height, endPts, radius);
                this._colorizeLayerHeat(endLayer, this._HEAT_PALETTE_GREEN, 0.95);
                ctx.drawImage(endLayer.canvas, 0, 0);
            }
            if (startPts.length > 0) {
                var startLayer = this._renderHeatLayer(canvas.width, canvas.height, startPts, radius);
                this._colorizeLayerHeat(startLayer, this._HEAT_PALETTE_BLUE, 0.95);
                ctx.drawImage(startLayer.canvas, 0, 0);
            }
        } else {
            // Single layer: vibrant heatmap palette
            var pts = mode === 'start' ? startPts : endPts;
            if (pts.length > 0) {
                var layer = this._renderHeatLayer(canvas.width, canvas.height, pts, radius);
                this._colorizeLayerHeat(layer);
                ctx.drawImage(layer.canvas, 0, 0);
            }
        }

        ctx.restore();

        // Draw legend
        var svContainer = this._container;
        if (svContainer) this._drawLegend(svContainer, mode);
    },

    // Render gaussian density on offscreen canvas (grayscale alpha)
    _renderHeatLayer(w, h, points, radius) {
        var offscreen = document.createElement('canvas');
        offscreen.width = w;
        offscreen.height = h;
        var ctx = offscreen.getContext('2d');

        // Accumulate density using alpha channel on a black canvas.
        // Use a Float32 array to avoid 255 clamping, then normalize at the end.
        var density = new Float32Array(w * h);

        // Precompute gaussian kernel lookup (radius in pixels)
        var r2 = radius * radius;

        points.forEach(function(pt) {
            var cx = Math.round(pt.x);
            var cy = Math.round(pt.y);
            var x0 = Math.max(0, cx - radius);
            var x1 = Math.min(w - 1, cx + radius);
            var y0 = Math.max(0, cy - radius);
            var y1 = Math.min(h - 1, cy + radius);
            for (var y = y0; y <= y1; y++) {
                var dy = y - cy;
                var dy2 = dy * dy;
                for (var x = x0; x <= x1; x++) {
                    var dx = x - cx;
                    var dist2 = dx * dx + dy2;
                    if (dist2 <= r2) {
                        // Gaussian-ish falloff: 1 at center, 0 at edge
                        var t = 1 - dist2 / r2;
                        density[y * w + x] += t * t; // quadratic falloff (smoother than linear)
                    }
                }
            }
        });

        // Find max density for normalization
        var maxDensity = 0;
        for (var i = 0; i < density.length; i++) {
            if (density[i] > maxDensity) maxDensity = density[i];
        }

        // Write normalized density to canvas as grayscale
        if (maxDensity > 0) {
            var imgData = ctx.getImageData(0, 0, w, h);
            var data = imgData.data;
            for (var i = 0; i < density.length; i++) {
                if (density[i] > 0) {
                    var val = Math.round((density[i] / maxDensity) * 255);
                    var pi = i * 4;
                    data[pi] = val;
                    data[pi + 1] = val;
                    data[pi + 2] = val;
                    data[pi + 3] = 255;
                }
            }
            ctx.putImageData(imgData, 0, 0);
        }

        return { canvas: offscreen, ctx: ctx, maxDensity: maxDensity, density: density, w: w, h: h };
    },

    // Colorize grayscale layer with a single color + alpha mapping
    _colorizeLayer(layer, colorArr, maxAlpha) {
        var ctx = layer.ctx;
        var w = layer.canvas.width;
        var h = layer.canvas.height;
        var imgData = ctx.getImageData(0, 0, w, h);
        var data = imgData.data;
        var r = colorArr[0][0], g = colorArr[0][1], b = colorArr[0][2];

        // Find max value for normalization
        var maxVal = 0;
        for (var i = 0; i < data.length; i += 4) {
            if (data[i] > maxVal) maxVal = data[i];
        }
        if (maxVal === 0) { ctx.putImageData(imgData, 0, 0); return; }

        for (var i = 0; i < data.length; i += 4) {
            var val = data[i]; // white channel = density
            if (val === 0) {
                data[i + 3] = 0;
                continue;
            }
            var t = Math.pow(val / maxVal, 0.6); // gamma to spread mid-tones
            data[i] = r;
            data[i + 1] = g;
            data[i + 2] = b;
            data[i + 3] = Math.round(t * maxAlpha * 255);
        }
        ctx.putImageData(imgData, 0, 0);
    },

    // Colorize grayscale layer with heat palette (default: vibrant rainbow, or custom palette)
    _colorizeLayerHeat(layer, palette, maxOpacity) {
        palette = palette || this._HEAT_PALETTE;
        maxOpacity = maxOpacity !== undefined ? maxOpacity : 1.0;
        var ctx = layer.ctx;
        var w = layer.canvas.width;
        var h = layer.canvas.height;
        var imgData = ctx.getImageData(0, 0, w, h);
        var data = imgData.data;
        var self = this;

        // Find max value for normalization
        var maxVal = 0;
        for (var i = 0; i < data.length; i += 4) {
            if (data[i] > maxVal) maxVal = data[i];
        }
        if (maxVal === 0) { ctx.putImageData(imgData, 0, 0); return; }

        // Params from active heatmap config
        var isBoth = self._heatmapMode === 'both';
        var hmConf = isBoth ? self._hmBoth : self._hmSingle;
        var hmGamma = hmConf.gamma;
        var hmAlpha = hmConf.alpha;
        var hmCutoff = hmConf.cutoff;
        var cutoff = maxVal * hmCutoff;

        for (var i = 0; i < data.length; i += 4) {
            var val = data[i];
            if (val === 0 || val < cutoff) {
                data[i + 3] = 0;
                continue;
            }
            var t = Math.pow(val / maxVal, hmGamma);
            var rgb = self._interpolatePalette(palette, t);
            data[i] = Math.round(rgb[0]);
            data[i + 1] = Math.round(rgb[1]);
            data[i + 2] = Math.round(rgb[2]);
            var alpha = Math.min(1, t * 1.5);
            data[i + 3] = Math.round(alpha * hmAlpha * maxOpacity);
        }
        ctx.putImageData(imgData, 0, 0);
    },

    // Draw iso-density contour lines on the main canvas
    _drawContours(ctx, layer, nLevels, color) {
        if (!layer.density || layer.maxDensity === 0) return;
        var d = layer.density;
        var w = layer.w;
        var h = layer.h;
        var max = layer.maxDensity;
        color = color || 'rgba(255,255,255,0.6)';

        ctx.strokeStyle = color;
        ctx.lineWidth = 1.2;
        ctx.lineJoin = 'round';

        // For each contour level, find boundary pixels and trace
        for (var level = 1; level <= nLevels; level++) {
            var threshold = (level / (nLevels + 1)) * max;
            ctx.beginPath();
            // Scan for boundary pixels (where density crosses the threshold)
            // Step by 2 for performance
            for (var y = 1; y < h - 1; y += 2) {
                for (var x = 1; x < w - 1; x += 2) {
                    var idx = y * w + x;
                    var val = d[idx];
                    if (val >= threshold) {
                        // Check if any neighbor is below threshold (= boundary)
                        var isEdge = (
                            d[idx - 1] < threshold ||
                            d[idx + 1] < threshold ||
                            d[idx - w] < threshold ||
                            d[idx + w] < threshold
                        );
                        if (isEdge) {
                            ctx.moveTo(x, y);
                            ctx.arc(x, y, 0.8, 0, Math.PI * 2);
                        }
                    }
                }
            }
            ctx.stroke();
        }
    },

    // Draw color legend bar under the court
    _drawLegend(container, mode) {
        var existing = container.querySelector('.sv-heatmap-legend');
        if (existing) existing.remove();

        var div = document.createElement('div');
        div.className = 'sv-heatmap-legend';

        // Adapt labels to active categories
        var hasRec = this._selectedCategories['reception'];
        var hasDef = this._selectedCategories['defense'];
        var startLabel = hasRec && hasDef ? 'Départ (position du joueur)' :
                         hasDef ? 'Départ (où on défend)' : 'Départ (où on réceptionne)';
        var endLabel = 'Arrivée (où va la balle)';

        if (mode === 'both') {
            div.innerHTML =
                '<div class="sv-legend-row">' +
                '<span class="sv-legend-bar sv-legend-bar-blue" style="width:60px;height:10px;border-radius:5px;background:linear-gradient(to right, #8CDCFF, #008CFF, #0A32AA, #051478)"></span>' +
                '<span class="sv-legend-label">' + startLabel + '</span>' +
                '</div>' +
                '<div class="sv-legend-row">' +
                '<span class="sv-legend-bar sv-legend-bar-green" style="width:60px;height:10px;border-radius:5px;background:linear-gradient(to right, #8CFFA0, #00C83C, #006419, #003C0F)"></span>' +
                '<span class="sv-legend-label">' + endLabel + '</span>' +
                '</div>';
        } else {
            var startText = hasRec && hasDef ? 'Position du joueur' :
                           hasDef ? 'Où on défend' : 'Où on réceptionne';
            var label = mode === 'start' ? startText : 'Où va la balle';
            div.innerHTML =
                '<div class="sv-legend-bar-container">' +
                '<div class="sv-legend-bar"></div>' +
                '<div class="sv-legend-labels">' +
                '<span>Faible</span><span>' + label + '</span><span>Forte</span>' +
                '</div></div>';
        }

        // Insert after the court wrapper
        var courtWrapper = container.querySelector('.sv-court-wrapper');
        if (courtWrapper && courtWrapper.nextSibling) {
            courtWrapper.parentNode.insertBefore(div, courtWrapper.nextSibling);
        }
    },

    // ========== ARROW RENDERING ==========

    _updateArrows() {
        var svgEl = document.getElementById('svArrowSvg');
        var group = document.getElementById('svArrowGroup');
        var court = document.getElementById('svCourt');
        if (!svgEl || !group || !court) return;

        // Measure actual element positions for coordinate mapping
        var courtRect = court.getBoundingClientRect();
        var wrapperEl = document.querySelector('.sv-court-wrapper');
        this._layout = {
            court: courtRect,
            wrapper: wrapperEl ? wrapperEl.getBoundingClientRect() : courtRect, // ≡ courtContainer dans match-live
            away: document.getElementById('svCourtAway').getBoundingClientRect(),
            home: document.getElementById('svCourtHome').getBoundingClientRect(),
            net: document.getElementById('svNet').getBoundingClientRect(),
            svcTop: document.getElementById('svServiceTop').getBoundingClientRect(),
            svcBot: document.getElementById('svServiceBot').getBoundingClientRect()
        };

        // Set SVG viewBox to match court container dimensions
        svgEl.setAttribute('viewBox', '0 0 ' + courtRect.width.toFixed(1) + ' ' + courtRect.height.toFixed(1));

        this._trajectories = this._extractTrajectories();

        // Split heatmap categories (reception, defense) from SVG categories
        var heatmapTrajs = [];
        var svgTrajs = [];
        this._trajectories.forEach(function(t) {
            if (t.type === 'reception' || t.type === 'defense') {
                heatmapTrajs.push(t);
            } else {
                svgTrajs.push(t);
            }
        });

        var canvasEl = document.getElementById('svHeatmapCanvas');
        var hmToggle = document.getElementById('svHeatmapToggle');

        // Heatmap for reception & defense
        if (heatmapTrajs.length > 0) {
            this._drawHeatmap(heatmapTrajs);
            if (canvasEl) canvasEl.style.display = '';
            if (hmToggle) hmToggle.style.display = '';
        } else {
            if (canvasEl) { canvasEl.style.display = 'none'; canvasEl.getContext('2d').clearRect(0, 0, canvasEl.width, canvasEl.height); }
            if (hmToggle) hmToggle.style.display = 'none';
        }

        // SVG rendering for non-reception trajectories
        var count = svgTrajs.length;
        var totalCount = this._trajectories.length;

        var opacity = count <= 100 ? 1 : count <= 250 ? 0.7 : count <= 500 ? 0.4 : 0.25;
        var strokeW = count <= 100 ? 2 : 1.5;

        var markerR = 5;
        var markerSW = 1.5;

        var svgCircles = '';
        var svgLines = '';
        var self = this;
        svgTrajs.forEach(function(t) {
            var attackColor = t.attackArrowType ? self.ATTACK_TYPE_COLORS[t.attackArrowType] : null;
            var color = attackColor || self.RESULT_COLORS[t.result] || self.RESULT_COLORS.neutral;
            var markerId = (t.attackArrowType && self.ATTACK_TYPE_COLORS[t.attackArrowType]) ? t.attackArrowType : t.result;

            if (t.hasArrow && t.startPos) {
                svgCircles += '<circle cx="' + t.startPos.x.toFixed(1) + '" cy="' + t.startPos.y.toFixed(1) +
                    '" r="' + markerR + '" fill="' + color + '" stroke="white" stroke-width="' + markerSW + '" opacity="' + opacity + '"/>';
                svgCircles += '<circle cx="' + t.endPos.x.toFixed(1) + '" cy="' + t.endPos.y.toFixed(1) +
                    '" r="' + markerR + '" fill="' + color + '" stroke="white" stroke-width="' + markerSW + '" opacity="' + opacity + '"/>';
                var dashAttr = (t.type === 'block-touch') ? ' stroke-dasharray="4,3"' : '';
                svgLines += '<line x1="' + t.startPos.x.toFixed(1) + '" y1="' + t.startPos.y.toFixed(1) +
                    '" x2="' + t.endPos.x.toFixed(1) + '" y2="' + t.endPos.y.toFixed(1) +
                    '" stroke="' + color + '" stroke-width="' + strokeW + '" stroke-linecap="round"' +
                    dashAttr + ' opacity="' + opacity + '" marker-end="url(#sv-arrow-' + markerId + ')"/>';
            } else {
                svgCircles += '<circle cx="' + t.endPos.x.toFixed(1) + '" cy="' + t.endPos.y.toFixed(1) +
                    '" r="' + markerR + '" fill="' + color + '" stroke="white" stroke-width="' + markerSW + '" opacity="' + opacity + '"/>';
            }
        });

        group.innerHTML = svgCircles + svgLines;

        // Update count (total trajectories)
        var countEl = document.getElementById('svArrowCount');
        if (countEl) {
            if (heatmapTrajs.length > 0 && svgTrajs.length === 0) {
                // Label based on active heatmap categories
                var hmHasRec = heatmapTrajs.some(function(t) { return t.type === 'reception'; });
                var hmHasDef = heatmapTrajs.some(function(t) { return t.type === 'defense'; });
                var hmLabel = hmHasRec && hmHasDef ? 'actions' :
                              hmHasDef ? 'défense' + (heatmapTrajs.length > 1 ? 's' : '') :
                              'réception' + (heatmapTrajs.length > 1 ? 's' : '');
                countEl.textContent = heatmapTrajs.length + ' ' + hmLabel;
            } else {
                countEl.textContent = totalCount > 0 ? totalCount + ' trajectoire' + (totalCount > 1 ? 's' : '') : 'Aucune trajectoire';
            }
        }
    },

    // ========== EVENTS ==========

    _bindEvents(container) {
        var self = this;

        // Match selector
        var matchSelect = container.querySelector('#svMatchSelect');
        if (matchSelect) {
            matchSelect.addEventListener('change', function() {
                self._selectedMatch = matchSelect.value;
                self._selectedSet = 'all';
                self._rebuildAndRender();
            });
        }

        // Category pills
        container.querySelectorAll('.sv-cat-pill').forEach(function(btn) {
            btn.addEventListener('click', function() {
                var cat = btn.dataset.cat;
                self._selectedCategories[cat] = !self._selectedCategories[cat];
                btn.classList.toggle('active', self._selectedCategories[cat]);
                self._updateArrows();
            });
        });

        // Result pills
        container.querySelectorAll('.sv-result-pill').forEach(function(btn) {
            btn.addEventListener('click', function() {
                self._selectedResult = btn.dataset.result;
                container.querySelectorAll('.sv-result-pill').forEach(function(b) {
                    var isActive = b.dataset.result === self._selectedResult;
                    b.classList.toggle('active', isActive);
                    var color = self.RESULT_COLORS[b.dataset.result];
                    if (color) {
                        b.style.background = isActive ? color : '#fff';
                        b.style.borderColor = color;
                        b.style.color = isActive ? '#fff' : color;
                    } else {
                        b.style.background = isActive ? 'var(--accent-blue)' : '#fff';
                        b.style.borderColor = isActive ? 'var(--accent-blue)' : '#d1d5db';
                        b.style.color = isActive ? '#fff' : '#6b7280';
                    }
                });
                self._updateArrows();
            });
        });

        // Player chips
        container.querySelectorAll('.sv-player-chip').forEach(function(btn) {
            btn.addEventListener('click', function() {
                var name = btn.dataset.player;
                self._selectedPlayers[name] = !self._selectedPlayers[name];
                btn.classList.toggle('active', self._selectedPlayers[name]);
                self._updateArrows();
            });
        });

        // Set pills
        container.querySelectorAll('.sv-set-pill').forEach(function(btn) {
            btn.addEventListener('click', function() {
                self._selectedSet = btn.dataset.set === 'all' ? 'all' : parseInt(btn.dataset.set);
                container.querySelectorAll('.sv-set-pill').forEach(function(b) {
                    var val = b.dataset.set === 'all' ? 'all' : parseInt(b.dataset.set);
                    b.classList.toggle('active', val === self._selectedSet);
                });
                self._updateArrows();
            });
        });

        // Heatmap mode pills
        container.querySelectorAll('.sv-heatmap-pill').forEach(function(btn) {
            btn.addEventListener('click', function() {
                self._heatmapMode = btn.dataset.hm;
                container.querySelectorAll('.sv-heatmap-pill').forEach(function(b) {
                    b.classList.toggle('active', b.dataset.hm === self._heatmapMode);
                });
                self._updateArrows();
            });
        });

        // Heatmap tuner sliders (if ?tuner in URL)
        var tunerKeys = ['both_radius','both_gamma','both_alpha','both_cutoff','single_radius','single_gamma','single_alpha','single_cutoff'];
        tunerKeys.forEach(function(id) {
            var slider = document.getElementById('hm-' + id);
            if (!slider) return;
            slider.addEventListener('input', function() {
                var v = parseFloat(this.value);
                var parts = id.split('_');
                var mode = parts[0]; // 'both' or 'single'
                var param = parts[1]; // 'radius', 'gamma', 'alpha', 'cutoff'
                var conf = (mode === 'both') ? self._hmBoth : self._hmSingle;
                conf[param] = v;
                var label = document.getElementById('hm-v-' + id);
                if (label) label.textContent = v;
                self._updateArrows();
            });
        });
    },

    _rebuildAndRender() {
        if (!this._container) return;
        this._container.innerHTML = '';
        var matches = SeasonSelector.getFilteredMatches();
        var players = this._getPlayersForScope(matches);
        var self = this;
        players.forEach(function(p) {
            if (self._selectedPlayers[p.name] === undefined) self._selectedPlayers[p.name] = true;
        });
        this._container.innerHTML = this._buildHTML(matches, players);
        this._bindEvents(this._container);
        this._updateArrows();
    }
};

// ==================== TAB NAVIGATION ====================
const TabNav = {
    currentTab: 'yearStats',

    init() {
        var saved = sessionStorage.getItem('historique_tab');
        if (saved) {
            this.switchTo(saved);
        }
    },

    switchTo(tab) {
        this.currentTab = tab;
        sessionStorage.setItem('historique_tab', tab);

        document.querySelectorAll('.main-tabs .tab-btn').forEach(function(btn) {
            btn.classList.toggle('active', btn.dataset.tab === tab);
        });
        // Auto-scroll l'onglet actif au centre (après layout)
        requestAnimationFrame(function() {
            var tabsContainer = document.querySelector('.main-tabs');
            var activeBtn = tabsContainer && tabsContainer.querySelector('.tab-btn.active');
            if (activeBtn && tabsContainer) {
                var scrollLeft = activeBtn.offsetLeft - (tabsContainer.offsetWidth - activeBtn.offsetWidth) / 2;
                tabsContainer.scrollTo({left: Math.max(0, scrollLeft), behavior: 'smooth'});
            }
        });

        document.querySelectorAll('.tab-content').forEach(function(content) {
            content.classList.toggle('active', content.id === 'content-' + tab);
        });

        // Lazy-load le contenu de l'onglet
        switch (tab) {
            case 'matchStats': MatchStatsView.render(); break;
            case 'yearStats': YearStatsView.render(); break;
            case 'setsStats': SetsPlayedView.render(); break;
            case 'visualStats': ProgressionView.render(); break;
            case 'ranking': RankingView.render(); break;
        }
    }
};

// ==================== TAB 1: MATCH STATS VIEW ====================
const MatchStatsView = {
    selectedMatchIndex: null,
    currentMatch: null,
    currentSetFilter: 'all',
    currentCategory: 'service',
    _rendered: false,

    render() {
        if (this._rendered) return;
        this.renderMatchGrid();
        this._rendered = true;
    },

    renderMatchGrid() {
        var matchHistory = SeasonSelector.getFilteredMatches();
        var matchesContainer = document.getElementById('matchesContainer');
        var matchSelect = document.getElementById('matchSelect');
        var emptyState = document.getElementById('emptyStateMatchStats');
        var detailContainer = document.getElementById('matchDetailContainer');

        if (matchHistory.length === 0) {
            emptyState.style.display = 'flex';
            matchesContainer.style.display = 'none';
            detailContainer.classList.remove('active');
            return;
        }

        emptyState.style.display = 'none';
        matchesContainer.style.display = 'block';

        var sorted = matchHistory.slice().sort(function(a, b) { return (b.matchDate || b.timestamp || 0) - (a.matchDate || a.timestamp || 0); });
        var self = this;

        // Générer les options du select
        var hasSelection = self.selectedMatchIndex !== null;
        var optionsHtml = '<option value="" disabled' + (!hasSelection ? ' selected' : '') + '>Sélectionner un match…</option>';
        sorted.forEach(function(match, index) {
            var resultEmoji = match.result === 'win' ? '🟢' : (match.result === 'loss' ? '🔴' : '🟡');
            var opponent = match.opponent || 'Adversaire';
            var detail = '';
            if (match.type === 'ginette' && match.round) {
                detail = ' (' + match.round + ')';
            } else if (match.location) {
                detail = ' (' + (match.location === 'domicile' ? 'dom' : 'ext') + ')';
            }
            var selected = self.selectedMatchIndex === index ? ' selected' : '';

            optionsHtml += '<option value="' + index + '"' + selected + '>' +
                resultEmoji + ' ' + opponent + detail +
                '</option>';
        });
        matchSelect.innerHTML = optionsHtml;

        // Event listener
        matchSelect.onchange = function() {
            var index = parseInt(matchSelect.value);
            if (!isNaN(index)) {
                self.selectMatch(index);
            }
        };

        // Auto-sélectionner le premier match seulement au tout premier rendu
        if (this.selectedMatchIndex === null && sorted.length > 0 && !this._rendered) {
            matchSelect.value = '0';
            this.selectMatch(0);
        }
    },

    selectMatch(index) {
        var matchHistory = SeasonSelector.getFilteredMatches();
        var sorted = matchHistory.slice().sort(function(a, b) { return (b.matchDate || b.timestamp || 0) - (a.matchDate || a.timestamp || 0); });
        var match = sorted[index];
        if (!match) return;

        this.selectedMatchIndex = index;
        this.currentMatch = match;
        this.currentSetFilter = 'bilan';
        this.currentCategory = 'service';
        SharedComponents.resetStatsSort();

        // Mise a jour du select
        var matchSelect = document.getElementById('matchSelect');
        if (matchSelect) matchSelect.value = '' + index;

        this.renderDetailHeader(match);
        this.renderDetailSetTabs(match);
        this.renderCategoryTabs();
        this.showBilanView(match);
        this.setupDeleteButton(match);
        this.setupDatePicker(match);
        this.setupExportButton(match);

        document.getElementById('matchDetailContainer').classList.add('active');
    },

    renderDetailHeader(match) {
        var isWin = match.result === 'win';
        var isLoss = match.result === 'loss';
        var opponent = match.opponent || 'Adversaire';

        document.getElementById('detailResultIcon').textContent = isWin ? '🏆' : (isLoss ? '😔' : '🤝');
        var labelEl = document.getElementById('detailResultLabel');
        labelEl.textContent = isWin ? 'Victoire' : (isLoss ? 'Defaite' : 'Match nul');
        labelEl.className = 'detail-result-label ' + (match.result || 'draw');
        document.getElementById('detailOpponent').textContent = 'vs ' + opponent;

        // Meta
        var matchDate = (match.matchDate || match.timestamp) ? Utils.formatDate(match.matchDate || match.timestamp) : '';
        var typeName = match.type === 'ginette' ? 'Ginette' : 'Championnat';
        document.getElementById('detailMeta').innerHTML =
            '<span class="match-type-badge ' + (match.type === 'ginette' ? 'ginette' : 'championnat') + '">' + typeName + '</span>' +
            '<span>\u2022</span><span>' + matchDate + '</span>';

        // Score sets
        var homeSetsEl = document.getElementById('detailHomeSets');
        var awaySetsEl = document.getElementById('detailAwaySets');
        var isWin = match.result === 'win';
        var isDraw = match.result === 'draw';
        var homeScoreClass = isWin ? 'score-win' : (isDraw ? 'score-draw' : 'score-loss');
        homeSetsEl.textContent = match.setsWon || 0;
        awaySetsEl.textContent = match.setsLost || 0;
        homeSetsEl.className = 'detail-header-team-score ' + homeScoreClass;
        awaySetsEl.className = 'detail-header-team-score score-opponent';
        document.getElementById('detailAwayName').textContent = opponent;

        // Detail sets chips
        this.renderHeaderSets(match);

        // Lien YouTube
        this.renderYoutubeLink(match);

        // Bouton Distinctions
        this.renderDistinctionsButton(match);
    },

    renderDistinctionsButton(match) {
        var container = document.getElementById('detailDistinctionsLink');
        if (!container) return;

        var completedSets = (match.sets || []).filter(function(s) { return s.completed; });
        if (completedSets.length === 0) {
            container.innerHTML = '';
            container.style.display = 'none';
            return;
        }

        container.innerHTML = '<button class="detail-distinctions-btn" id="matchDistinctionsBtn">' +
            '<span class="distinctions-star">\u2B50</span>' +
            '<span>Distinctions</span></button>';
        container.style.display = 'block';

        var btn = document.getElementById('matchDistinctionsBtn');
        btn.addEventListener('click', function() {
            var homeTotals = StatsAggregator.aggregateStats(completedSets, 'home');
            var homeRoles = BilanView.getPlayerRoles(match, 'home');
            var statCategories = ['service', 'reception', 'pass', 'attack', 'relance', 'defense', 'block'];
            var homePlayers = Object.keys(homeTotals).filter(function(name) {
                if (!homeRoles[name]) return false;
                var p = homeTotals[name];
                return statCategories.some(function(cat) { return p[cat] && p[cat].tot > 0; });
            });
            var html = BilanView.renderDistinctions(homeTotals, homeRoles, homePlayers);
            DistinctionsModal.open(html, 'Distinctions \u2014 vs ' + (match.opponent || 'Adversaire'));
        });
    },

    renderHeaderSets(match) {
        var container = document.getElementById('detailHeaderSets');
        if (!match.sets) { container.innerHTML = ''; return; }

        var completedSets = match.sets.filter(function(s) { return s.completed; });
        container.innerHTML = completedSets.map(function(s, i) {
            var h = s.finalHomeScore || 0;
            var a = s.finalAwayScore || 0;
            var homeWon = h > a;
            var label = (i === 4) ? 'TB' : 'S' + (i + 1);
            var homeClass = homeWon ? 'score-win' : 'score-loss';

            return '<span class="detail-header-set-chip">' +
                '<span class="set-label">' + label + '</span>' +
                '<span class="set-score ' + homeClass + '">' + h + '</span>' +
                '<span class="set-label">-</span>' +
                '<span class="set-score score-opponent">' + a + '</span>' +
                '</span>';
        }).join('');
    },

    renderYoutubeLink(match) {
        var linkContainer = document.getElementById('detailYoutubeLink');
        if (!linkContainer) return;

        // Collecter les URLs YouTube uniques
        var urls = [];
        (match.sets || []).forEach(function(s) {
            if (s.youtubeUrl && urls.indexOf(s.youtubeUrl) === -1) {
                urls.push(s.youtubeUrl);
            }
        });

        if (urls.length > 0) {
            linkContainer.innerHTML = '<a class="detail-youtube-link" href="' + Utils.escapeHtml(urls[0]) + '" target="_blank">' +
                '<svg class="yt-icon" viewBox="0 0 28 20" xmlns="http://www.w3.org/2000/svg">' +
                '<rect width="28" height="20" rx="4" fill="#FF0000"/>' +
                '<polygon points="11,4.5 11,15.5 20,10" fill="#FFF"/>' +
                '</svg>' +
                '<span>Voir la vidéo</span></a>';
            linkContainer.style.display = 'block';
        } else {
            linkContainer.innerHTML = '';
            linkContainer.style.display = 'none';
        }
    },

    renderSubstitutions(match, filter) {
        var section = document.getElementById('remplacementsSection');
        var container = document.getElementById('remplacementsContainer');
        if (!section || !container) return;

        var completedSets = (match.sets || []).filter(function(s) { return s.completed; });
        var posRoles = BilanView.POSITION_ROLES_HOME;
        var roleColors = SharedComponents.ROLE_COLORS_CSS;

        var entries = [];
        completedSets.forEach(function(set, idx) {
            if (filter !== 'all' && filter !== idx) return;

            // Substitutions enregistrées
            var recordedSubs = (set.substitutions || []).filter(function(s) { return s.team === 'home'; });
            recordedSubs.forEach(function(sub) {
                if (sub.type === 'swap') {
                    entries.push({
                        type: 'swap',
                        setNum: idx + 1,
                        homeScore: sub.homeScore || 0,
                        awayScore: sub.awayScore || 0,
                        role1: sub.role1,
                        player1: sub.player1,
                        role2: sub.role2,
                        player2: sub.player2
                    });
                } else {
                    entries.push({
                        type: 'sub',
                        setNum: idx + 1,
                        homeScore: sub.homeScore || 0,
                        awayScore: sub.awayScore || 0,
                        role: posRoles[sub.position] || '?',
                        playerIn: sub.playerIn,
                        playerOut: sub.playerOut
                    });
                }
            });

            // Inférer les substitutions manquantes (anciens matchs sans tracking)
            var initial = set.initialHomeLineup || set.homeLineup;
            var current = set.homeLineup;
            if (initial && current) {
                // Positions couvertes par les subs enregistrées
                var coveredPositions = {};
                recordedSubs.forEach(function(s) {
                    if (s.type !== 'swap' && s.position) coveredPositions[s.position] = true;
                });
                var points = set.points || [];
                Object.keys(initial).forEach(function(pos) {
                    if (initial[pos] !== current[pos] && !coveredPositions[pos]) {
                        // Estimer le score en croisant dernier point du sortant et premier du entrant
                        var inPlayer = current[pos];
                        var outPlayer = initial[pos];
                        var estHome = '?', estAway = '?';
                        // Dernier point où le joueur sortant agit
                        var lastOutScore = null;
                        for (var pi = points.length - 1; pi >= 0; pi--) {
                            var rally = points[pi].rally || [];
                            if (rally.some(function(a) { return a.player === outPlayer; })) {
                                lastOutScore = { h: points[pi].homeScore || 0, a: points[pi].awayScore || 0 };
                                break;
                            }
                        }
                        // Premier point où le joueur entrant agit
                        var firstInScore = null;
                        for (var pi2 = 0; pi2 < points.length; pi2++) {
                            var rally2 = points[pi2].rally || [];
                            if (rally2.some(function(a) { return a.player === inPlayer; })) {
                                firstInScore = { h: points[pi2].homeScore || 0, a: points[pi2].awayScore || 0 };
                                break;
                            }
                        }
                        // Priorité : score du dernier point du sortant (sub juste après)
                        if (lastOutScore) {
                            estHome = lastOutScore.h;
                            estAway = lastOutScore.a;
                        } else if (firstInScore) {
                            estHome = firstInScore.h;
                            estAway = firstInScore.a;
                        }
                        entries.push({
                            type: 'sub',
                            setNum: idx + 1,
                            homeScore: estHome,
                            awayScore: estAway,
                            role: posRoles[pos] || '?',
                            playerIn: inPlayer,
                            playerOut: initial[pos]
                        });
                    }
                });
            }
        });

        // Tri : par set croissant, puis par score total croissant (premier changement en haut)
        entries.sort(function(a, b) {
            if (a.setNum !== b.setNum) return a.setNum - b.setNum;
            var scoreA = (typeof a.homeScore === 'number' ? a.homeScore : 0) + (typeof a.awayScore === 'number' ? a.awayScore : 0);
            var scoreB = (typeof b.homeScore === 'number' ? b.homeScore : 0) + (typeof b.awayScore === 'number' ? b.awayScore : 0);
            return scoreA - scoreB;
        });

        if (entries.length === 0) {
            section.style.display = 'none';
            return;
        }

        section.style.display = '';
        var html = '';
        entries.forEach(function(s) {
            html += '<div class="remplacement-row">';
            html += '<span class="remplacement-set">S' + s.setNum + '</span> ';
            html += '<span class="remplacement-score">[' + s.homeScore + '-' + s.awayScore + ']</span> ';
            if (s.type === 'swap') {
                var c1 = roleColors[s.role1] || 'var(--text-secondary)';
                var c2 = roleColors[s.role2] || 'var(--text-secondary)';
                html += '<span class="remplacement-label">switch</span>';
                html += '<span class="remplacement-sep">/</span>';
                html += '<span class="bilan-role-dot" style="background:' + c1 + '"></span>';
                html += '<span class="remplacement-name">' + Utils.escapeHtml(s.player1) + '</span>';
                html += '<span class="remplacement-arrow">\u2194</span>';
                html += '<span class="bilan-role-dot" style="background:' + c2 + '"></span>';
                html += '<span class="remplacement-name">' + Utils.escapeHtml(s.player2) + '</span>';
                html += '<span class="remplacement-sep">/</span>';
                html += '<span class="remplacement-label">switch</span>';
            } else {
                var color = roleColors[s.role] || 'var(--text-secondary)';
                html += '<span class="remplacement-label">entrant</span>';
                html += '<span class="remplacement-sep">/</span>';
                html += '<span class="bilan-role-dot" style="background:' + color + '"></span>';
                html += '<span class="remplacement-name">' + Utils.escapeHtml(s.playerIn) + '</span>';
                html += '<span class="remplacement-arrow">\u2192</span>';
                html += '<span class="bilan-role-dot" style="background:' + color + '"></span>';
                html += '<span class="remplacement-name">' + Utils.escapeHtml(s.playerOut) + '</span>';
                html += '<span class="remplacement-sep">/</span>';
                html += '<span class="remplacement-label">sortant</span>';
            }
            html += '</div>';
        });
        container.innerHTML = html;
    },

    renderDetailSetTabs(match) {
        var container = document.getElementById('detailSetTabs');
        if (!match.sets) { container.innerHTML = ''; return; }

        var completedSets = match.sets.filter(function(s) { return s.completed; });
        var self = this;

        var html = '<button class="seg-tab detail-set-tab active" data-set="bilan">Bilan</button>';
        html += '<button class="seg-tab detail-set-tab" data-set="all">Set ALL</button>';
        completedSets.forEach(function(s, i) {
            html += '<button class="seg-tab detail-set-tab" data-set="' + i + '">S' + (i + 1) + '</button>';
        });
        container.innerHTML = html;

        container.onclick = function(e) {
            var tab = e.target.closest('.detail-set-tab');
            if (!tab) return;
            var raw = tab.dataset.set;
            var filter = (raw === 'all') ? 'all' : (raw === 'bilan') ? 'bilan' : parseInt(raw);
            self.switchSetFilter(filter);
        };
    },

    switchSetFilter(filter) {
        this.currentSetFilter = filter;

        document.querySelectorAll('.detail-set-tab').forEach(function(tab) {
            var raw = tab.dataset.set;
            var tabFilter = (raw === 'all') ? 'all' : (raw === 'bilan') ? 'bilan' : parseInt(raw);
            tab.classList.toggle('active', tabFilter === filter);
        });

        if (filter === 'bilan') {
            this.showBilanView(this.currentMatch);
        } else {
            this.hideBilanView();
            this.renderStats(this.currentMatch, filter);
            this.renderSubstitutions(this.currentMatch, filter);
            SharedComponents.renderSideOutBlock(this.currentMatch, filter, 'sideoutContainer');
            SharedComponents.renderTimeline(this.currentMatch, 'timelineContainer', filter);
        }
    },

    showBilanView(match) {
        // Masquer les sections stats normales
        var statsSection = document.getElementById('statsSection');
        var sideout = document.querySelector('.sideout-section');
        var timeline = document.getElementById('timelineSection');
        var remplacements = document.getElementById('remplacementsSection');

        if (statsSection) statsSection.style.display = 'none';
        if (sideout) sideout.style.display = 'none';
        if (timeline) timeline.style.display = 'none';
        if (remplacements) remplacements.style.display = 'none';

        // Afficher et rendre le bilan
        var bilanContainer = document.getElementById('bilanContainer');
        if (bilanContainer) {
            bilanContainer.style.display = 'block';
            BilanView.render(match, bilanContainer);
            OpenSections.restore(bilanContainer);
        }
    },

    hideBilanView() {
        var bilanContainer = document.getElementById('bilanContainer');
        if (bilanContainer) bilanContainer.style.display = 'none';

        // Restaurer les sections normales
        var statsSection = document.getElementById('statsSection');
        var sideout = document.querySelector('.sideout-section');

        if (statsSection) statsSection.style.display = '';
        if (sideout) sideout.style.display = '';
        // timeline : sa visibilite est geree par renderTimeline()
    },

    renderCategoryTabs() {
        var container = document.getElementById('statsCategoryTabs');
        if (!container) return;

        var self = this;
        var cats = ['service', 'reception', 'passe', 'attack', 'relance', 'defense', 'block'];
        var labels = { service: 'Serv', reception: 'Rec', passe: 'Pas', attack: 'Att', relance: 'Rel', defense: 'Def', block: 'Blc' };

        container.innerHTML = cats.map(function(cat) {
            var isActive = self.currentCategory === cat;
            return '<button class="seg-tab cat-tab ' + (isActive ? 'active' : '') + '" data-cat="' + cat + '">' + labels[cat] + '</button>';
        }).join('');

        container.onclick = function(e) {
            var tab = e.target.closest('.cat-tab');
            if (!tab) return;
            self.switchCategory(tab.dataset.cat);
        };
    },

    switchCategory(category) {
        this.currentCategory = category;
        SharedComponents.resetStatsSort();

        document.querySelectorAll('.cat-tab').forEach(function(tab) {
            tab.classList.toggle('active', tab.dataset.cat === category);
        });

        this.renderStats(this.currentMatch, this.currentSetFilter);
    },

    renderStats(match, setFilter) {
        var mobileContainer = document.getElementById('statsMobileContainer');
        var desktopContainer = document.getElementById('statsDesktopContainer');

        if (!match || !match.sets) {
            if (mobileContainer) mobileContainer.innerHTML = '<div style="text-align:center;color:var(--text-secondary);padding:20px;">Aucune statistique disponible</div>';
            if (desktopContainer) desktopContainer.innerHTML = '';
            return;
        }

        var opponent = match.opponent || 'Adversaire';
        var completedSets = match.sets.filter(function(s) { return s.completed; });
        var setsToUse = (setFilter === 'all') ? completedSets : [completedSets[setFilter]].filter(Boolean);

        var homeTotals = StatsAggregator.aggregateStats(setsToUse, 'home');
        var awayTotals = StatsAggregator.aggregateStats(setsToUse, 'away');

        // Toggle Tot/Moy : visible uniquement en Set ALL (multi-sets)
        // V20.293 : ne compter que les sets avec stats (exclure sets sans camera)
        var setsWithStats = setsToUse.filter(function(s) { return s.stats && (s.stats.home || s.stats.away); });
        SharedComponents._showAvgToggle = (setFilter === 'all' && setsWithStats.length > 1);
        SharedComponents._totalSets = setsWithStats.length;
        if (!SharedComponents._showAvgToggle) SharedComponents._avgMode = 'tot';

        // Roles par joueur pour pastilles colorees — filtrés par set si vue Set X
        var homeRoles = BilanView.getPlayerRoles(match, 'home', setFilter === 'all' ? undefined : setFilter);
        var awayRoles = BilanView.getPlayerRoles(match, 'away', setFilter === 'all' ? undefined : setFilter);

        // Vue mobile : categorie selectionnee
        var self = this;
        if (mobileContainer) {
            var cat = this.currentCategory;
            if (cat === 'passe') {
                SharedComponents.playerRolesMap = homeRoles;
                var homeHtml = SharedComponents.renderPassDetailView(homeTotals, 'Jen et ses Saints', 'home');
                SharedComponents.playerRolesMap = awayRoles;
                var awayHtml = SharedComponents.renderPassDetailView(awayTotals, opponent, 'away');
                mobileContainer.innerHTML = homeHtml + awayHtml;
            } else {
                SharedComponents.playerRolesMap = homeRoles;
                var homeHtml = SharedComponents.renderCategoryTable(homeTotals, cat, 'Jen et ses Saints', 'home', 'match');
                SharedComponents.playerRolesMap = awayRoles;
                var awayHtml = SharedComponents.renderCategoryTable(awayTotals, cat, opponent, 'away', 'match');
                mobileContainer.innerHTML = homeHtml + awayHtml;
            }
            SharedComponents.playerRolesMap = null;
            SharedComponents.bindStatsSortHandlers(mobileContainer, function() {
                self.renderStats(self.currentMatch, self.currentSetFilter);
            });
        }

        // Vue desktop : tableau complet
        if (desktopContainer) {
            SharedComponents.playerRolesMap = homeRoles;
            var homeDesktop = SharedComponents.renderDesktopStatsTable(homeTotals, 'Jen et ses Saints', 'home', 'match');
            SharedComponents.playerRolesMap = awayRoles;
            var awayDesktop = SharedComponents.renderDesktopStatsTable(awayTotals, opponent, 'away', 'match');
            SharedComponents.playerRolesMap = null;
            desktopContainer.innerHTML = homeDesktop + awayDesktop;
            SharedComponents.bindStatsSortHandlers(desktopContainer, function() {
                self.renderStats(self.currentMatch, self.currentSetFilter);
            });
        }
    },

    _closeGearMenu() {
        var gearMenu = document.getElementById('detailGearMenu');
        var gearBtn = document.getElementById('detailGearBtn');
        if (gearMenu) gearMenu.classList.remove('open');
        if (gearBtn) gearBtn.classList.remove('active');
    },

    setupDeleteButton(match) {
        var btn = document.getElementById('detailDeleteBtn');
        if (!btn) return;
        var self = this;
        var opponent = match.opponent || 'Adversaire';

        // Cacher le bouton si pas admin (seul le propriétaire peut supprimer)
        var adminOk = typeof FirebaseSync !== 'undefined' && FirebaseSync.isAdmin();
        btn.style.display = adminOk ? '' : 'none';

        btn.onclick = async function() {
            // Double-check admin au moment du clic
            if (typeof FirebaseSync === 'undefined' || !FirebaseSync.isAdmin()) {
                alert('Seul le propriétaire peut supprimer un match.');
                return;
            }
            self._closeGearMenu();
            if (confirm('Supprimer ce match ?\n' + opponent + ' (' + (match.setsWon || 0) + '-' + (match.setsLost || 0) + ')')) {
                await HistoriqueData.deleteMatch(match.id);
                self.selectedMatchIndex = null;
                self.currentMatch = null;
                document.getElementById('matchDetailContainer').classList.remove('active');
                // Re-render la liste sans auto-sélection
                self.renderMatchGrid();
            }
        };
    },

    setupDatePicker(match) {
        var item = document.getElementById('detailDateItem');
        var input = document.getElementById('detailDateInput');
        if (!item || !input) return;
        var self = this;

        // Admin only
        var adminOk = typeof FirebaseSync !== 'undefined' && FirebaseSync.isAdmin();
        item.style.display = adminOk ? '' : 'none';
        if (!adminOk) return;

        // Pré-remplir avec matchDate ou timestamp
        var ts = match.matchDate || match.timestamp;
        if (ts) {
            var d = new Date(ts);
            // Format yyyy-mm-dd pour l'input date
            var yyyy = d.getFullYear();
            var mm = String(d.getMonth() + 1).padStart(2, '0');
            var dd = String(d.getDate()).padStart(2, '0');
            input.value = yyyy + '-' + mm + '-' + dd;
        } else {
            input.value = '';
        }

        input.onchange = function() {
            if (!input.value) return;
            // Convertir la date ISO (yyyy-mm-dd) en timestamp à midi (éviter décalages timezone)
            var parts = input.value.split('-');
            var dateObj = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]), 12, 0, 0);
            match.matchDate = dateObj.getTime();

            // Sauvegarder
            Storage.saveMatch(match);
            HistoriqueData.invalidateCache();

            // Mettre à jour l'affichage meta
            self.renderDetailHeader(match);
            // Re-trier le dropdown
            self.renderMatchGrid();
        };
    },

    setupExportButton(match) {
        var btn = document.getElementById('detailExportBtn');
        if (!btn) return;
        var self = this;

        btn.onclick = function() {
            self.exportStats(match);
            self._closeGearMenu();
        };
    },

    exportStats(match) {
        if (!match || !match.sets) return;

        var opponent = match.opponent || 'Adversaire';
        var completedSets = match.sets.filter(function(s) { return s.completed; });
        // Bilan → exporter comme Set ALL
        var exportFilter = (this.currentSetFilter === 'bilan') ? 'all' : this.currentSetFilter;
        var setsToUse = (exportFilter === 'all') ? completedSets : [completedSets[exportFilter]].filter(Boolean);
        var homeTotalsRaw = StatsAggregator.aggregateStats(setsToUse, 'home');
        // Filtrer les joueurs sans aucune stat (ex: joueurs adverses dans les données home)
        var homeTotals = {};
        Object.entries(homeTotalsRaw).forEach(function(entry) {
            var p = entry[1];
            var hasAny = ['service', 'reception', 'pass', 'attack', 'relance', 'defense', 'block'].some(function(cat) {
                return p[cat] && Object.values(p[cat]).some(function(v) { return v > 0; });
            });
            if (hasAny) homeTotals[entry[0]] = p;
        });
        var totals = StatsAggregator.computeTotals(homeTotals);

        var text = 'Stats Match vs ' + opponent + '\n';
        text += 'Score: ' + (match.setsWon || 0) + '-' + (match.setsLost || 0) + '\n';
        if (exportFilter !== 'all') {
            text += 'Set ' + (exportFilter + 1) + '\n';
        }
        text += '\n';

        var cats = ['service', 'reception', 'passe', 'attack', 'relance', 'defense', 'block'];
        cats.forEach(function(catKey) {
            var catDef = SharedComponents.CATEGORIES_MATCH[catKey];
            // V19.1 fix : la cle UI 'passe' correspond a la cle data 'pass'
            var exportDataKey = (catKey === 'passe') ? 'pass' : catKey;
            text += catDef.label.toUpperCase() + '\n';
            // Header
            text += 'Joueur'.padEnd(14);
            catDef.columns.forEach(function(col) {
                var w = col.computed ? 7 : 5;
                text += col.label.padStart(w);
            });
            text += '\n';
            // Joueurs
            Object.entries(homeTotals).forEach(function(entry) {
                var name = entry[0];
                var p = entry[1];
                text += name.padEnd(14);
                catDef.columns.forEach(function(col) {
                    if (col.key === '_moy') {
                        text += StatsAggregator.srvMoyDisplay(p).padStart(5);
                    } else if (col.computed === 'faBp') {
                        var atkData = p.attack || {};
                        var fa = atkData.fatt || 0;
                        var bp = atkData.bp || 0;
                        var combined = fa + bp;
                        var cell = combined > 0 ? String(combined) + (bp > 0 ? '(' + bp + ')' : '') : '-';
                        text += cell.padStart(7);
                    } else if (col.computed === 'r1Fr') {
                        var recData = p.reception || {};
                        var r1v = recData.r1 || 0, frv = recData.frec || 0;
                        var sum = r1v + frv;
                        var cell = sum > 0 ? String(sum) + (frv > 0 ? '(' + frv + ')' : '') : '-';
                        text += cell.padStart(7);
                    } else if (col.computed === 'p1Fp') {
                        var passD = p[exportDataKey] || {};
                        var p1v = passD.p1 || 0, fpv = passD.fp || 0;
                        var sum = p1v + fpv;
                        var cell = sum > 0 ? String(sum) + (fpv > 0 ? '(' + fpv + ')' : '') : '-';
                        text += cell.padStart(7);
                    } else {
                        var val = p[exportDataKey] ? (p[exportDataKey][col.key] || 0) : 0;
                        text += (val > 0 ? String(val) : '-').padStart(5);
                    }
                });
                text += '\n';
            });
            // V19.2 : ventilation passe equipe apres les lignes joueurs
            if (catKey === 'passe') {
                function exportPassLine(label, bucket) {
                    if (!bucket || !bucket.tot) return '';
                    var line = label.padEnd(14);
                    // Tot, P4, P3, P2 puis P1/FP fusionné
                    ['tot', 'p4', 'p3', 'p2'].forEach(function(k) {
                        var v = bucket[k] || 0;
                        line += (v > 0 ? String(v) : '-').padStart(5);
                    });
                    var p1v = bucket.p1 || 0, fpv = bucket.fp || 0;
                    var sum = p1v + fpv;
                    var cell = sum > 0 ? String(sum) + (fpv > 0 ? '(' + fpv + ')' : '') : '-';
                    line += cell.padStart(7);
                    return line + '\n';
                }
                var pt = totals.pass || {};
                if (pt.passeur && (pt.passeur.tot || pt.passeur.fp)) {
                    text += exportPassLine('Passeur', pt.passeur);
                    if (pt.passeur.confort) text += exportPassLine('  Maxi', pt.passeur.confort);
                    if (pt.passeur.contraint) text += exportPassLine('  Moyen', pt.passeur.contraint);
                    if (pt.passeur.transition) text += exportPassLine('  Mini', pt.passeur.transition);
                }
                if (pt.autre && (pt.autre.tot || pt.autre.fp)) {
                    text += exportPassLine('Autres', pt.autre);
                    if (pt.autre.contraint) text += exportPassLine('  Moyen', pt.autre.contraint);
                    if (pt.autre.transition) text += exportPassLine('  Mini', pt.autre.transition);
                }
            }
            text += '\n';
        });

        navigator.clipboard.writeText(text).then(function() {
            var feedback = document.getElementById('exportFeedback');
            if (feedback) {
                feedback.classList.add('visible');
                setTimeout(function() { feedback.classList.remove('visible'); }, 2000);
            }
        });
    },

    closeDetail() {
        document.getElementById('matchDetailContainer').classList.remove('active');
        this.selectedMatchIndex = null;
        this.currentMatch = null;
        var matchSelect = document.getElementById('matchSelect');
        if (matchSelect) matchSelect.value = '';
        this._closeGearMenu();
    }
};

// ==================== TAB 2: YEAR STATS VIEW ====================
const YearStatsView = {
    currentFilter: 'all',
    _rendered: false,

    render() {
        var matches = SeasonSelector.getFilteredMatches();
        var container = document.getElementById('content-yearStats');
        if (!container) return;

        if (matches.length === 0) {
            this.renderEmpty(container);
            return;
        }

        var filtered = this.applyFilter(matches);
        var html = '';

        // Filtres
        html += this.renderFilters();

        // Bilan saison
        html += this.renderSummary(filtered);

        // Spider charts par famille
        html += this.renderSpiderCharts(filtered);

        // Impact +/- saison
        html += ImpactView.renderForYear(filtered, 'home');

        // Stats joueurs cumulees (meme composant que Tab 1)
        html += this.renderPlayerStats(filtered);

        // Side Out / Break Out agrege
        html += this.renderYearSideOut(filtered);

        // Relation Passe/Attaque (V23)
        YearStatsView._lastFiltered = filtered;
        html += PassAttackAnalyzer.renderForYear(filtered, 'home');

        // Graphique momentum agrege
        html += this.renderYearMomentum(filtered);

        container.innerHTML = html;
        OpenSections.restore(container);
        this.bindEvents(container);

        // Bouton Distinctions dans Bilan Saison
        var yearDistBtn = document.getElementById('yearDistinctionsBtn');
        if (yearDistBtn) {
            var self = this;
            yearDistBtn.addEventListener('click', function() {
                var distinctionsHtml = self.renderYearDistinctions(filtered);
                if (distinctionsHtml) {
                    DistinctionsModal.open(distinctionsHtml, 'Distinctions \u2014 ' + SeasonSelector.getLabel());
                }
            });
        }

        this._rendered = true;
    },

    applyFilter(matches) {
        if (this.currentFilter === 'all') return matches;
        return matches.filter(function(m) { return m.type === this.currentFilter; }.bind(this));
    },

    renderEmpty(container) {
        container.innerHTML = '<div class="empty-state">' +
            '<div class="empty-state-icon visual">' +
            '<svg width="32" height="32" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM9 10H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2z"/></svg>' +
            '</div>' +
            '<h3 class="empty-state-title">Statistiques annuelles</h3>' +
            '<p class="empty-state-desc">Les statistiques cumulees de la saison seront disponibles apres vos premiers matchs.</p>' +
            '</div>';
    },

    renderFilters() {
        var filters = [
            { key: 'all', label: 'Tous' },
            { key: 'championnat', label: 'Championnat' },
            { key: 'ginette', label: 'Ginette' }
        ];
        var self = this;
        var html = '<div class="segmented-tabs year-filters">';
        filters.forEach(function(f) {
            html += '<button class="seg-tab year-filter-btn ' + (self.currentFilter === f.key ? 'active' : '') + '" data-filter="' + f.key + '">' + f.label + '</button>';
        });
        html += '</div>';
        return html;
    },

    renderSummary(matches) {
        var wins = matches.filter(function(m) { return m.result === 'win'; }).length;
        var losses = matches.filter(function(m) { return m.result === 'loss'; }).length;
        var draws = matches.filter(function(m) { return m.result === 'draw'; }).length;
        var setsWon = matches.reduce(function(s, m) { return s + (m.setsWon || 0); }, 0);
        var setsLost = matches.reduce(function(s, m) { return s + (m.setsLost || 0); }, 0);

        var html = '<div class="year-summary-card">';
        html += '<div class="year-summary-title">Bilan ' + SeasonSelector.getLabel() + '</div>';
        html += '<div class="year-summary-row"><span class="year-summary-big">' + matches.length + '</span> matchs &nbsp; ';
        html += '<span style="color:var(--win-color);font-weight:600">' + wins + 'V</span>';
        html += ' \u00b7 <span style="color:var(--loss-color);font-weight:600">' + losses + 'D</span>';
        if (draws > 0) html += ' \u00b7 <span style="color:var(--draw-color);font-weight:600">' + draws + 'N</span>';
        html += '</div>';
        html += '<div class="year-summary-row">Sets: <strong>' + setsWon + '-' + setsLost + '</strong></div>';
        html += '<button class="year-distinctions-btn" id="yearDistinctionsBtn">' +
            '<span class="distinctions-star">\u2B50</span>' +
            '<span>Distinctions</span></button>';
        html += '</div>';
        return html;
    },

    renderRankings(matches) {
        var allSets = [];
        matches.forEach(function(m) {
            (m.sets || []).filter(function(s) { return s.completed; }).forEach(function(s) { allSets.push(s); });
        });

        var playerTotals = StatsAggregator.aggregateStats(allSets, 'home');
        var players = Object.entries(playerTotals);
        if (players.length === 0) return '';

        var rankings = [];

        // Meilleur attaquant (A+ / Tot)
        var bestAtt = players.slice().sort(function(a, b) {
            var rA = a[1].attack.tot > 0 ? a[1].attack.attplus / a[1].attack.tot : 0;
            var rB = b[1].attack.tot > 0 ? b[1].attack.attplus / b[1].attack.tot : 0;
            return rB - rA;
        })[0];
        if (bestAtt && bestAtt[1].attack.tot > 0) {
            var pct = Math.round(bestAtt[1].attack.attplus / bestAtt[1].attack.tot * 100);
            rankings.push({ label: 'Meilleur attaquant', name: bestAtt[0], value: 'A+: ' + bestAtt[1].attack.attplus + ' (' + pct + '%)' });
        }

        // Meilleur receptionneur (moyenne)
        var bestRec = players.slice().sort(function(a, b) {
            var avgA = a[1].reception.tot > 0 ? (a[1].reception.r4 * 4 + a[1].reception.r3 * 3 + a[1].reception.r2 * 2 + a[1].reception.r1 * 1) / a[1].reception.tot : 0;
            var avgB = b[1].reception.tot > 0 ? (b[1].reception.r4 * 4 + b[1].reception.r3 * 3 + b[1].reception.r2 * 2 + b[1].reception.r1 * 1) / b[1].reception.tot : 0;
            return avgB - avgA;
        })[0];
        if (bestRec && bestRec[1].reception.tot > 0) {
            var avg = ((bestRec[1].reception.r4 * 4 + bestRec[1].reception.r3 * 3 + bestRec[1].reception.r2 * 2 + bestRec[1].reception.r1 * 1) / bestRec[1].reception.tot).toFixed(1);
            rankings.push({ label: 'Meilleur receptionneur', name: bestRec[0], value: 'Moy: ' + avg });
        }

        // Meilleur serveur (moy basse)
        var bestSrv = players.slice().filter(function(p) { return (p[1].service.recCountAdv + p[1].service.ace) > 0; })
            .sort(function(a, b) {
                return StatsAggregator.srvMoy(a[1]) - StatsAggregator.srvMoy(b[1]);
            })[0];
        if (bestSrv) {
            rankings.push({ label: 'Meilleur serveur', name: bestSrv[0], value: 'Moy: ' + StatsAggregator.srvMoyDisplay(bestSrv[1]) });
        }

        // Meilleur bloqueur
        var bestBlk = players.slice().sort(function(a, b) { return b[1].block.blcplus - a[1].block.blcplus; })[0];
        if (bestBlk && bestBlk[1].block.blcplus > 0) {
            rankings.push({ label: 'Meilleur bloqueur', name: bestBlk[0], value: 'B+: ' + bestBlk[1].block.blcplus });
        }

        if (rankings.length === 0) return '';

        var html = '<div class="rankings-list">';
        rankings.forEach(function(r) {
            html += '<div class="ranking-card">';
            html += '<div><div class="ranking-label">' + r.label + '</div>';
            html += '<div class="ranking-player">' + SharedComponents.renderRoleDots(r.name) + Utils.escapeHtml(r.name) + '</div>';
            html += '</div>';
            html += '<div class="ranking-value">' + r.value + '</div>';
            html += '</div>';
        });
        html += '</div>';
        return html;
    },

    renderSpiderCharts(matches) {
        var playerFamiliesYear = BilanView.getPlayerFamiliesYear(matches);
        if (Object.keys(playerFamiliesYear).length === 0) return '';

        var html = '<div class="hist-section bilan-section collapsed">';
        html += '<div class="hist-section-title">Profils radar</div>';
        html += '<div class="bilan-h2h-header">';
        html += '<span class="bilan-h2h-team" style="color:#0056D2">Jen et ses Saints</span>';
        html += '</div>';
        html += '<div class="bilan-compare-bar">';
        html += '<button class="bilan-compare-toggle" onclick="BilanView.toggleCompareYear(this)" title="Comparer au meilleur au poste">';
        html += '<span class="bilan-compare-icon">\uD83D\uDC41</span> Comparer</button>';
        html += '</div>';

        html += '<div class="bilan-grid-year">';

        // Collecter tous les joueurs, trier Passeur → R4 → Pointu → Centre par IP
        var SLOT_ORDER_YEAR = ['Passeur', 'R4', 'Pointu', 'Centre'];
        var allPlayerData = [];

        BilanView.FAMILY_ORDER.forEach(function(family) {
            var familyAxes = BilanView.SPIDER_AXES;
            var familyIpRole = (family === 'Ailier') ? 'R4' : family;

            var playersInFamily = [];
            Object.keys(playerFamiliesYear).forEach(function(name) {
                if (playerFamiliesYear[name].primaryFamily === family) {
                    playersInFamily.push(name);
                }
            });
            if (playersInFamily.length === 0) return;

            // Overlay par famille
            var medianRanking = BilanView.computeMedianIPForFamily(matches, playerFamiliesYear, family);
            var eligible = medianRanking.filter(function(r) { return r.matchCount >= 1; });
            var bestName = eligible.length > 0 ? eligible[0].name : null;
            var secondBestName = eligible.length > 1 ? eligible[1].name : null;

            playersInFamily.forEach(function(name) {
                var famData = playerFamiliesYear[name].families[family];
                var stats = BilanView.aggregateStatsForFamilyYear(matches, name, famData);
                var scores = BilanView.computeAxisScores(stats, familyIpRole);

                var roleColors = Object.keys(famData.roles).map(function(r) {
                    return BilanView.ROLE_COLORS[r];
                });
                var primaryRoleInFamily = Object.keys(famData.roles).sort(function(a, b) {
                    return famData.roles[b] - famData.roles[a];
                })[0];
                var primaryColor = BilanView.ROLE_COLORS[primaryRoleInFamily];

                var slot = family;
                if (family === 'Ailier') slot = primaryRoleInFamily;

                var hasAnyStats = scores.service > 0 || scores.reception > 0 || scores.passe > 0
                    || scores.attaque > 0 || scores.bloc > 0 || scores.relance > 0 || scores.defense > 0;
                if (!hasAnyStats) return;

                allPlayerData.push({
                    name: name, scores: scores, ip: 0, stats: stats,
                    primaryColor: primaryColor, roleColors: roleColors,
                    effectiveRole: familyIpRole, family: family, slot: slot,
                    axes: familyAxes, bestName: bestName, secondBestName: secondBestName
                });
            });
        });

        // V21.21 : Seuil 10% — exclure le service du radar Stats Année
        // si un joueur a servi moins de 10% du total équipe (ex: remplacement ponctuel)
        // La perf reste visible dans Stats Matchs (match individuel = mérité)
        var teamTotalService = 0;
        allPlayerData.forEach(function(d) {
            teamTotalService += (d.scores._tots && d.scores._tots.service) || 0;
        });
        allPlayerData.forEach(function(d) {
            var playerSrvTot = (d.scores._tots && d.scores._tots.service) || 0;
            if (teamTotalService > 0 && playerSrvTot < teamTotalService * 0.10) {
                d.scores.service = 0;
            }
            d.ip = BilanView.computeIP(d.scores, d.effectiveRole);
        });

        // Trier par slot puis IP desc
        allPlayerData.sort(function(a, b) {
            var ai = SLOT_ORDER_YEAR.indexOf(a.slot);
            var bi = SLOT_ORDER_YEAR.indexOf(b.slot);
            if (ai === -1) ai = 99;
            if (bi === -1) bi = 99;
            if (ai !== bi) return ai - bi;
            return b.ip - a.ip;
        });

        // Pre-calculer overlays par famille (best + secondBest)
        var familyOverlays = {};
        BilanView.FAMILY_ORDER.forEach(function(fam) {
            var inFam = allPlayerData.filter(function(d) { return d.family === fam; });
            inFam.sort(function(a, b) { return b.ip - a.ip; });
            familyOverlays[fam] = {
                best: inFam.length > 0 ? { name: inFam[0].name, scores: inFam[0].scores, role: inFam[0].effectiveRole, ip: inFam[0].ip } : null,
                second: inFam.length > 1 ? { name: inFam[1].name, scores: inFam[1].scores, role: inFam[1].effectiveRole, ip: inFam[1].ip } : null
            };
        });

        // Moyenne passeurs adverses pour comparaison au poste Passeur
        var awayPasseursAvg = BilanView.aggregateAwayPasseursYear(matches);
        var passeurCount = allPlayerData.filter(function(d) { return d.family === 'Passeur'; }).length;

        // Si un seul passeur Jen et des passeurs adverses, utiliser la moyenne adverse comme overlay
        if (passeurCount === 1 && awayPasseursAvg) {
            familyOverlays['Passeur'] = {
                best: familyOverlays['Passeur'] ? familyOverlays['Passeur'].best : null,
                second: { name: awayPasseursAvg.name, scores: awayPasseursAvg.scores, role: 'Passeur' }
            };
        }

        // Grouper par slot pour aligner sur la grille 2 colonnes
        var dataBySlot = {};
        SLOT_ORDER_YEAR.forEach(function(s) { dataBySlot[s] = []; });
        allPlayerData.forEach(function(d) {
            if (!dataBySlot[d.slot]) dataBySlot[d.slot] = [];
            dataBySlot[d.slot].push(d);
        });

        // Rendu cartes Jen par slot, case vide si nombre impair
        SLOT_ORDER_YEAR.forEach(function(slot) {
            var slotData = dataBySlot[slot] || [];
            var totalCards = slotData.length;

            // Pour le slot Passeur : ajouter la carte moyenne adverse lilas
            var showAwayPasseurCard = (slot === 'Passeur' && awayPasseursAvg);
            if (showAwayPasseurCard) totalCards++;

            if (totalCards === 0) return;

            slotData.forEach(function(d) {
                var fo = familyOverlays[d.family];
                var overlay = null;
                if (fo) {
                    if (fo.best && d.name === fo.best.name) {
                        overlay = fo.second;
                    } else {
                        overlay = fo.best;
                    }
                }
                html += BilanView.renderSpiderChart(d.name, d.effectiveRole, d.scores, d.ip, d.primaryColor, d.axes, false, overlay, d.roleColors);
            });

            // Carte moyenne passeurs adverses (lilas, avec overlay comparaison)
            if (showAwayPasseurCard) {
                var homePasseurOverlay = (passeurCount === 1 && familyOverlays['Passeur'] && familyOverlays['Passeur'].best)
                    ? familyOverlays['Passeur'].best : null;
                var awayCard = BilanView.renderSpiderChart(
                    awayPasseursAvg.name,
                    'Passeur', awayPasseursAvg.scores, awayPasseursAvg.ip,
                    '#b4a0d6', BilanView.SPIDER_AXES, true,
                    homePasseurOverlay, null
                );
                html += awayCard.replace('bilan-player-card"', 'bilan-player-card bilan-away-avg bilan-away-avg-lilas"');
            }

            if (totalCards % 2 !== 0) {
                html += '<div class="bilan-player-card bilan-player-empty"></div>';
            }
        });

        html += '</div>'; // bilan-grid-year

        // --- Section Adversaire moyen (4 roles) ---
        var AWAY_ROLES = ['Passeur', 'R4', 'Pointu', 'Centre'];
        var awayCards = [];
        AWAY_ROLES.forEach(function(role) {
            var avg = BilanView.aggregateAwayRoleYear(matches, role);
            if (avg) awayCards.push({ role: role, data: avg });
        });

        if (awayCards.length > 0) {
            // Pre-calculer meilleur Jen par role pour overlay
            var bestJenByRole = {};
            allPlayerData.forEach(function(d) {
                var role = d.slot; // slot = role effectif (Passeur, R4, Pointu, Centre)
                if (!bestJenByRole[role] || d.ip > bestJenByRole[role].ip) {
                    bestJenByRole[role] = { name: d.name, scores: d.scores, role: d.effectiveRole, ip: d.ip };
                }
            });

            html += '<div class="bilan-h2h-header">';
            html += '<span class="bilan-h2h-team" style="color:#ea4335">Adversaire moyen</span>';
            html += '</div>';
            html += '<div class="bilan-compare-bar">';
            html += '<button class="bilan-compare-toggle" onclick="BilanView.toggleCompareYearAway(this)" title="Comparer au meilleur Jen au poste">';
            html += '<span class="bilan-compare-icon">\uD83D\uDC41</span> Comparer</button>';
            html += '</div>';
            html += '<div class="bilan-grid-year bilan-grid-year-away">';
            awayCards.forEach(function(ac) {
                var roleColor = BilanView.ROLE_COLORS[ac.role] || '#ea4335';
                var mutedColor = BilanView._lightenColor(roleColor, 0.35);
                var overlay = bestJenByRole[ac.role] || null;
                var awayCard = BilanView.renderSpiderChart(
                    ac.data.name, ac.role, ac.data.scores, ac.data.ip,
                    mutedColor, BilanView.SPIDER_AXES, true, overlay, null
                );
                html += awayCard.replace('bilan-player-card"', 'bilan-player-card bilan-away-avg bilan-away-avg-lilas"');
            });
            if (awayCards.length % 2 !== 0) {
                html += '<div class="bilan-player-card bilan-player-empty"></div>';
            }
            html += '</div>'; // bilan-grid-year-away
        }

        html += '</div>'; // bilan-section
        return html;
    },

    renderYearDistinctions(matches) {
        var allSets = [];
        matches.forEach(function(m) {
            (m.sets || []).filter(function(s) { return s.completed; }).forEach(function(s) { allSets.push(s); });
        });
        var homeTotals = StatsAggregator.aggregateStats(allSets, 'home');
        if (Object.keys(homeTotals).length === 0) return '';

        var mergedRoles = BilanView.getPlayerRolesYear(matches);
        var statCategories = ['service', 'reception', 'pass', 'attack', 'relance', 'defense', 'block'];
        var players = Object.keys(homeTotals).filter(function(name) {
            if (!mergedRoles[name]) return false;
            var p = homeTotals[name];
            return statCategories.some(function(cat) { return p[cat] && p[cat].tot > 0; });
        });

        return BilanView.renderDistinctions(homeTotals, mergedRoles, players);
    },

    renderYearSideOut(matches) {
        var allSets = [];
        matches.forEach(function(m) {
            (m.sets || []).filter(function(s) { return s.completed; }).forEach(function(s) { allSets.push(s); });
        });
        if (allSets.length === 0) return '';

        var agg = { home: { soTotal: 0, soWon: 0, brkTotal: 0, brkWon: 0 }, away: { soTotal: 0, soWon: 0, brkTotal: 0, brkWon: 0 } };
        allSets.forEach(function(set) {
            var setStats = SideOutAnalysis.calculateSideOutStats(set.points || [], set.initialHomeScore || 0, set.initialAwayScore || 0);
            ['home', 'away'].forEach(function(team) {
                agg[team].soTotal += setStats[team].soTotal;
                agg[team].soWon += setStats[team].soWon;
                agg[team].brkTotal += setStats[team].brkTotal;
                agg[team].brkWon += setStats[team].brkWon;
            });
        });

        ['home', 'away'].forEach(function(team) {
            agg[team].soPercent = agg[team].soTotal > 0 ? Math.round(agg[team].soWon / agg[team].soTotal * 100) : null;
            agg[team].brkPercent = agg[team].brkTotal > 0 ? Math.round(agg[team].brkWon / agg[team].brkTotal * 100) : null;
        });

        var html = '<div class="hist-section sideout-section collapsed">';
        html += '<div class="hist-section-title">Side Out / Break Out</div>';
        html += '<table class="sideout-table">';
        html += '<thead><tr><th></th><th>Jen</th><th>Adversaires</th></tr></thead><tbody>';
        html += '<tr><td>Side Out</td>';
        html += '<td class="home-val">' + (agg.home.soPercent !== null ? agg.home.soPercent + '%' : '-') + '</td>';
        html += '<td class="away-val">' + (agg.away.soPercent !== null ? agg.away.soPercent + '%' : '-') + '</td>';
        html += '</tr>';
        html += '<tr><td>Break Out</td>';
        html += '<td class="home-val">' + (agg.home.brkPercent !== null ? agg.home.brkPercent + '%' : '-') + '</td>';
        html += '<td class="away-val">' + (agg.away.brkPercent !== null ? agg.away.brkPercent + '%' : '-') + '</td>';
        html += '</tr>';
        html += '</tbody></table></div>';
        return html;
    },

    renderYearMomentum(matches) {
        // Collecter les courbes d'ecart de chaque set
        var curves = [];
        var totalCompletedSets = 0;
        matches.forEach(function(m) {
            (m.sets || []).forEach(function(s) { if (s.completed) totalCompletedSets++; });
            (m.sets || []).filter(function(s) { return s.completed && s.points && s.points.length >= 20; }).forEach(function(s) {
                var pts = s.points;
                var ih = s.initialHomeScore || 0;
                var ia = s.initialAwayScore || 0;
                var curve = [0];
                for (var i = 0; i < pts.length; i++) {
                    curve.push((pts[i].homeScore - ih) - (pts[i].awayScore - ia));
                }
                curves.push(curve);
            });
        });
        if (curves.length === 0) return '';

        // Normaliser chaque set sur RESOLUTION positions (0% a 100%)
        // Echantillonnage "nearest" (pas d'interpolation) pour garder les a-coups
        var RESOLUTION = 50;
        var rawCurve = [];
        for (var pct = 0; pct <= RESOLUTION; pct++) {
            var sum = 0;
            for (var s = 0; s < curves.length; s++) {
                var c = curves[s];
                var idx = Math.round((pct / RESOLUTION) * (c.length - 1));
                sum += c[idx];
            }
            rawCurve.push(sum / curves.length);
        }

        // EMA (Exponential Moving Average) pour lisser legerement
        // alpha bas = plus lisse, alpha haut = plus nerveux
        var alpha = 0.95;
        var avgCurve = [rawCurve[0]];
        for (var i = 1; i < rawCurve.length; i++) {
            avgCurve.push(alpha * rawCurve[i] + (1 - alpha) * avgCurve[i - 1]);
        }

        // Echelle symetrique
        var absMax = 0;
        for (var i = 0; i < avgCurve.length; i++) {
            var a = Math.abs(avgCurve[i]);
            if (a > absMax) absMax = a;
        }
        if (absMax === 0) absMax = 1;
        var scaleMax = Math.ceil(absMax * 2) / 2;

        var n = avgCurve.length - 1;

        // Dimensions SVG
        var svgWidth = 340;
        var svgHeight = 160;
        var padLeft = 24;
        var padRight = 4;
        var padTop = 10;
        var padBottom = 18;
        var chartW = svgWidth - padLeft - padRight;
        var chartH = svgHeight - padTop - padBottom;
        var midY = padTop + chartH / 2;
        var topY = padTop;
        var botY = padTop + chartH;

        // Helper : interpolation couleur bleu (froid) → rouge (chaud) selon valeur normalisee [-1, +1]
        // -1 (adversaire domine) = bleu #0056D2, 0 = gris #888, +1 (Jen domine) = rouge #ea4335
        function momentumColor(val, max) {
            var t = max > 0 ? val / max : 0; // [-1, +1]
            var r, g, b;
            if (t >= 0) {
                // gris → rouge
                r = Math.round(136 + t * (234 - 136));
                g = Math.round(136 - t * (136 - 67));
                b = Math.round(136 - t * (136 - 53));
            } else {
                // gris → bleu
                var s = -t;
                r = Math.round(136 - s * (136 - 0));
                g = Math.round(136 - s * (136 - 86));
                b = Math.round(136 + s * (210 - 136));
            }
            return 'rgb(' + r + ',' + g + ',' + b + ')';
        }

        var html = '<div class="hist-section momentum-section collapsed">';
        html += '<div class="hist-section-title">Momentum <span class="momentum-subtitle">' + curves.length + ' sets filmés (sur ' + totalCompletedSets + ' sets joués)</span></div>';

        html += '<svg class="momentum-chart" viewBox="0 0 ' + svgWidth + ' ' + svgHeight + '">';

        // Grilles legeres
        html += '<line x1="' + padLeft + '" y1="' + topY + '" x2="' + (svgWidth - padRight) + '" y2="' + topY + '" stroke="#e8eaed" stroke-width="0.5"/>';
        html += '<line x1="' + padLeft + '" y1="' + botY + '" x2="' + (svgWidth - padRight) + '" y2="' + botY + '" stroke="#e8eaed" stroke-width="0.5"/>';

        // Labels echelle
        var scaleLabel = scaleMax % 1 === 0 ? scaleMax.toFixed(0) : scaleMax.toFixed(1);
        html += '<text x="' + (padLeft - 3) + '" y="' + (topY + 4) + '" text-anchor="end" font-size="8" fill="#5f6368">+' + scaleLabel + '</text>';
        html += '<text x="' + (padLeft - 3) + '" y="' + (midY + 3) + '" text-anchor="end" font-size="8" fill="#5f6368">0</text>';
        html += '<text x="' + (padLeft - 3) + '" y="' + (botY + 1) + '" text-anchor="end" font-size="8" fill="#5f6368">-' + scaleLabel + '</text>';

        // Ligne zero
        html += '<line x1="' + padLeft + '" y1="' + midY + '" x2="' + (svgWidth - padRight) + '" y2="' + midY + '" stroke="#333" stroke-width="1"/>';

        // Separateurs tiers + labels abscisse
        var thirds = ['Debut', 'Milieu', 'Fin'];
        for (var t = 0; t < 3; t++) {
            var thirdX = padLeft + ((t + 0.5) / 3) * chartW;
            html += '<text x="' + thirdX.toFixed(1) + '" y="' + (botY + 9) + '" text-anchor="middle" font-size="7" fill="#5f6368">' + thirds[t] + '</text>';
            if (t > 0) {
                var sepX = padLeft + (t / 3) * chartW;
                html += '<line x1="' + sepX.toFixed(1) + '" y1="' + topY + '" x2="' + sepX.toFixed(1) + '" y2="' + botY + '" stroke="#e8eaed" stroke-width="0.5" stroke-dasharray="3,3"/>';
            }
        }

        // Calculer les pentes (derivee) pour la colorisation
        var slopes = [];
        var maxSlope = 0;
        for (var i = 0; i < n; i++) {
            var slope = avgCurve[i + 1] - avgCurve[i];
            slopes.push(slope);
            if (Math.abs(slope) > maxSlope) maxSlope = Math.abs(slope);
        }
        if (maxSlope === 0) maxSlope = 1;

        // Courbe segment par segment : couleur selon la pente
        // Pente positive (Jen accelere) = rouge chaud, pente negative (Adv accelere) = bleu froid
        for (var i = 0; i < n; i++) {
            var x1 = padLeft + (i / n) * chartW;
            var x2 = padLeft + ((i + 1) / n) * chartW;
            var y1 = midY - (avgCurve[i] / scaleMax) * (chartH / 2);
            var y2 = midY - (avgCurve[i + 1] / scaleMax) * (chartH / 2);
            html += '<line x1="' + x1.toFixed(1) + '" y1="' + y1.toFixed(1) + '" x2="' + x2.toFixed(1) + '" y2="' + y2.toFixed(1) + '" stroke="' + momentumColor(slopes[i], maxSlope) + '" stroke-width="2" stroke-linecap="round"/>';
        }

        // Pastille finale coloree selon derniere pente
        var lastX = padLeft + chartW;
        var lastY = midY - (avgCurve[n] / scaleMax) * (chartH / 2);
        var lastSlope = slopes.length > 0 ? slopes[slopes.length - 1] : 0;
        html += '<circle cx="' + lastX.toFixed(1) + '" cy="' + lastY.toFixed(1) + '" r="3" fill="' + momentumColor(lastSlope, maxSlope) + '"/>';

        // Labels Jen / Adversaires
        html += '<text x="' + (svgWidth - padRight) + '" y="' + (topY + 4) + '" text-anchor="end" font-size="7" fill="#ea4335" opacity="0.6">Jen +</text>';
        html += '<text x="' + (svgWidth - padRight) + '" y="' + (botY - 1) + '" text-anchor="end" font-size="7" fill="#0056D2" opacity="0.6">Adv +</text>';

        html += '</svg>';
        html += '</div>';
        return html;
    },

    renderPlayerStats(matches) {
        var allSets = [];
        matches.forEach(function(m) {
            (m.sets || []).filter(function(s) { return s.completed; }).forEach(function(s) { allSets.push(s); });
        });

        var homeTotals = StatsAggregator.aggregateStats(allSets, 'home');
        if (Object.keys(homeTotals).length === 0) return '';

        // Toggle Tot/Moy : toujours visible en Stats Annee (multi-sets)
        // V20.293 : ne compter que les sets avec stats (exclure sets sans camera)
        var setsWithStats = allSets.filter(function(s) { return s.stats && (s.stats.home || s.stats.away); });
        SharedComponents._showAvgToggle = (setsWithStats.length > 1);
        SharedComponents._totalSets = setsWithStats.length;

        var homeRoles = BilanView.getPlayerRolesYear(matches, 'home');
        var awayRoles = BilanView.getPlayerRolesYear(matches, 'away');
        var awayTotalsRaw = StatsAggregator.aggregateStats(allSets, 'away');
        var awayByRole = StatsAggregator.aggregateByRole(awayTotalsRaw, awayRoles);
        var awayRoleMap = {
            'Passeur Adv.': { primaryRole: 'Passeur', roles: { 'Passeur': 1 } },
            'R4 Adv.': { primaryRole: 'R4', roles: { 'R4': 1 } },
            'Pointu Adv.': { primaryRole: 'Pointu', roles: { 'Pointu': 1 } },
            'Centre Adv.': { primaryRole: 'Centre', roles: { 'Centre': 1 } }
        };

        // Mobile : onglets categorie + premier onglet service
        var html = '<div class="hist-section stats-section collapsed">';
        html += '<div class="hist-section-title">Tableaux de Statistiques</div>';
        html += '<div class="segmented-tabs stats-category-tabs" id="yearCategoryTabs">';
        var cats = ['service', 'reception', 'passe', 'attack', 'relance', 'defense', 'block'];
        var labels = { service: 'Serv', reception: 'Rec', passe: 'Pas', attack: 'Att', relance: 'Rel', defense: 'Def', block: 'Blc' };
        cats.forEach(function(cat) {
            html += '<button class="seg-tab cat-tab ' + (cat === 'service' ? 'active' : '') + '" data-cat="' + cat + '">' + labels[cat] + '</button>';
        });
        html += '</div>';

        html += '<div class="stats-mobile" id="yearStatsMobile">';
        SharedComponents.playerRolesMap = homeRoles;
        html += SharedComponents.renderCategoryTable(homeTotals, 'service', 'Jen et ses Saints', 'home', 'aggregated');
        SharedComponents.playerRolesMap = awayRoleMap;
        html += SharedComponents.renderCategoryTable(awayByRole, 'service', 'Adversaire', 'away', 'aggregated');
        html += '</div>';

        // Desktop
        html += '<div class="stats-desktop" id="yearStatsDesktop">';
        SharedComponents.playerRolesMap = homeRoles;
        html += SharedComponents.renderDesktopStatsTable(homeTotals, 'Jen et ses Saints', 'home', 'aggregated');
        SharedComponents.playerRolesMap = awayRoleMap;
        html += SharedComponents.renderDesktopStatsTable(awayByRole, 'Adversaire', 'away', 'aggregated');
        html += '</div>';

        SharedComponents.playerRolesMap = null;

        html += '</div>';
        return html;
    },

    /**
     * Re-rend les tableaux stats (mobile + desktop) pour Stats Annee.
     * Utilise par les handlers de tri et les onglets categorie.
     */
    _rerenderStatsContainers(activeCat) {
        var matches = SeasonSelector.getFilteredMatches();
        var filtered = this.applyFilter(matches);
        var allSets = [];
        filtered.forEach(function(m) {
            (m.sets || []).filter(function(s) { return s.completed; }).forEach(function(s) { allSets.push(s); });
        });
        var homeTotals = StatsAggregator.aggregateStats(allSets, 'home');

        // Toggle Tot/Moy : toujours visible en Stats Annee (multi-sets)
        // V20.293 : ne compter que les sets avec stats (exclure sets sans camera)
        var setsWithStats2 = allSets.filter(function(s) { return s.stats && (s.stats.home || s.stats.away); });
        SharedComponents._showAvgToggle = (setsWithStats2.length > 1);
        SharedComponents._totalSets = setsWithStats2.length;

        var homeRoles = BilanView.getPlayerRolesYear(filtered, 'home');
        var awayRoles = BilanView.getPlayerRolesYear(filtered, 'away');
        var awayTotalsRaw = StatsAggregator.aggregateStats(allSets, 'away');
        var awayByRole = StatsAggregator.aggregateByRole(awayTotalsRaw, awayRoles);
        var awayRoleMap = {
            'Passeur Adv.': { primaryRole: 'Passeur', roles: { 'Passeur': 1 } },
            'R4 Adv.': { primaryRole: 'R4', roles: { 'R4': 1 } },
            'Pointu Adv.': { primaryRole: 'Pointu', roles: { 'Pointu': 1 } },
            'Centre Adv.': { primaryRole: 'Centre', roles: { 'Centre': 1 } }
        };

        var self = this;
        var rerenderFn = function() { self._rerenderStatsContainers(activeCat); };

        // Mobile
        var mobileContainer = document.getElementById('yearStatsMobile');
        if (mobileContainer) {
            var mobileHtml = '';
            if (activeCat === 'passe') {
                SharedComponents.playerRolesMap = homeRoles;
                mobileHtml += SharedComponents.renderPassDetailView(homeTotals, 'Jen et ses Saints', 'home');
                SharedComponents.playerRolesMap = awayRoleMap;
                mobileHtml += SharedComponents.renderPassDetailView(awayByRole, 'Adversaire', 'away');
            } else {
                SharedComponents.playerRolesMap = homeRoles;
                mobileHtml += SharedComponents.renderCategoryTable(homeTotals, activeCat, 'Jen et ses Saints', 'home', 'aggregated');
                SharedComponents.playerRolesMap = awayRoleMap;
                mobileHtml += SharedComponents.renderCategoryTable(awayByRole, activeCat, 'Adversaire', 'away', 'aggregated');
            }
            mobileContainer.innerHTML = mobileHtml;
            SharedComponents.bindStatsSortHandlers(mobileContainer, rerenderFn);
        }

        // Desktop
        var desktopContainer = document.getElementById('yearStatsDesktop');
        if (desktopContainer) {
            SharedComponents.playerRolesMap = homeRoles;
            var desktopHtml = SharedComponents.renderDesktopStatsTable(homeTotals, 'Jen et ses Saints', 'home', 'aggregated');
            SharedComponents.playerRolesMap = awayRoleMap;
            desktopHtml += SharedComponents.renderDesktopStatsTable(awayByRole, 'Adversaire', 'away', 'aggregated');
            desktopContainer.innerHTML = desktopHtml;
            SharedComponents.bindStatsSortHandlers(desktopContainer, rerenderFn);
        }

        SharedComponents.playerRolesMap = null;
    },

    bindEvents(container) {
        var self = this;

        // Filtres
        container.querySelectorAll('.year-filter-btn').forEach(function(btn) {
            btn.addEventListener('click', function() {
                self.currentFilter = btn.dataset.filter;
                self._rendered = false;
                self.render();
            });
        });

        // Bind tri sur le rendu initial
        var mobileInit = document.getElementById('yearStatsMobile');
        if (mobileInit) {
            SharedComponents.bindStatsSortHandlers(mobileInit, function() {
                var activeTab = document.querySelector('#yearCategoryTabs .cat-tab.active');
                self._rerenderStatsContainers(activeTab ? activeTab.dataset.cat : 'service');
            });
        }
        var desktopInit = document.getElementById('yearStatsDesktop');
        if (desktopInit) {
            SharedComponents.bindStatsSortHandlers(desktopInit, function() {
                var activeTab = document.querySelector('#yearCategoryTabs .cat-tab.active');
                self._rerenderStatsContainers(activeTab ? activeTab.dataset.cat : 'service');
            });
        }

        // Onglets categorie (mobile)
        var catTabs = document.getElementById('yearCategoryTabs');
        if (catTabs) {
            catTabs.onclick = function(e) {
                var tab = e.target.closest('.cat-tab');
                if (!tab) return;
                var cat = tab.dataset.cat;

                catTabs.querySelectorAll('.cat-tab').forEach(function(t) {
                    t.classList.toggle('active', t.dataset.cat === cat);
                });

                self._rerenderStatsContainers(cat);
            };
        }
    }
};

// ==================== TAB 3: TEMPS DE JEU ====================
const SetsPlayedView = {
    _rendered: false,
    _sortCol: 'pct',    // colonne de tri par defaut
    _sortAsc: false,     // decroissant par defaut
    _ptAvgMode: 'tot',   // 'tot' = totaux, 'moy' = moyenne par match
    _cachedData: null,
    _cachedMatches: null,

    render() {
        var container = document.getElementById('content-setsStats');
        if (!container) return;

        var matches = SeasonSelector.getFilteredMatches();
        if (matches.length === 0) {
            this.renderEmpty(container);
            return;
        }

        var playerRoles = BilanView.getPlayerRolesYear(matches);
        this._cachedData = this.computePlayingTime(matches, playerRoles);
        this._cachedMatches = matches;
        this._renderWithSort(container);
        this._rendered = true;
    },

    _renderWithSort(container) {
        var data = this._cachedData;
        var matches = this._cachedMatches;
        if (!data || !matches) return;

        // Trier au sein de chaque groupe de role
        var totalMatches = matches.length;
        var self = this;
        var sortedData = this._sortDataByRole(data, totalMatches);
        container.innerHTML = this.renderTable(sortedData, matches);
        this._bindSortHeaders(container);
        this._bindAvgToggle(container);
    },

    _sortDataByRole(data, totalMatches) {
        // Grouper par role, trier chaque groupe, reconstituer
        var roleOrder = ['Passeur', 'R4', 'Pointu', 'Centre'];
        var groups = {};
        roleOrder.forEach(function(r) { groups[r] = []; });
        groups['Autre'] = [];

        data.forEach(function(p) {
            var key = groups[p.role] ? p.role : 'Autre';
            groups[key].push(p);
        });

        var col = this._sortCol;
        var asc = this._sortAsc;
        var isMoy = this._ptAvgMode === 'moy';

        function getSortValue(p) {
            switch (col) {
                case 'name':
                case 'pct':
                case 'sets':
                case 'sm':
                    return isMoy ? p.setsPerMatch : p.setsPlayed;
                case 'pts': return isMoy ? p.pointsPerMatch : p.pointsPlayed;
                case 'matchs': return p.matchesPresent;
                case 'titu': return p.matchesPresent > 0 ? p.matchesStarting / p.matchesPresent : 0;
                default: return isMoy ? p.setsPerMatch : p.setsPlayed;
            }
        }

        roleOrder.concat(['Autre']).forEach(function(role) {
            if (!groups[role]) return;
            groups[role].sort(function(a, b) {
                var va = getSortValue(a);
                var vb = getSortValue(b);
                if (typeof va === 'string') {
                    return asc ? va.localeCompare(vb) : vb.localeCompare(va);
                }
                return asc ? va - vb : vb - va;
            });
        });

        var result = [];
        roleOrder.concat(['Autre']).forEach(function(role) {
            if (groups[role] && groups[role].length > 0) {
                result = result.concat(groups[role]);
            }
        });
        return result;
    },

    _bindSortHeaders(container) {
        var self = this;
        var headers = container.querySelectorAll('th[data-sort]');
        headers.forEach(function(th) {
            th.style.cursor = 'pointer';
            th.addEventListener('click', function() {
                var col = th.dataset.sort;
                if (self._sortCol === col) {
                    self._sortAsc = !self._sortAsc;
                } else {
                    self._sortCol = col;
                    self._sortAsc = false; // toujours desc par defaut
                }
                self._renderWithSort(container);
            });
        });
    },

    _bindAvgToggle(container) {
        var self = this;
        var btns = container.querySelectorAll('[data-pt-avg]');
        btns.forEach(function(btn) {
            btn.addEventListener('click', function() {
                self._ptAvgMode = self._ptAvgMode === 'tot' ? 'moy' : 'tot';
                // Tri naturel : % en Tot, S/M en Moy
                self._sortCol = (self._ptAvgMode === 'moy') ? 'sm' : 'pct';
                self._sortAsc = false;
                self._renderWithSort(container);
            });
        });
    },

    renderEmpty(container) {
        container.innerHTML = '<div class="empty-state">' +
            '<div class="empty-state-icon visual">' +
            '<svg width="32" height="32" fill="currentColor" viewBox="0 0 24 24"><path d="M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99z"/></svg>' +
            '</div>' +
            '<h3 class="empty-state-title">Temps de jeu</h3>' +
            '<p class="empty-state-desc">Les statistiques de temps de jeu seront disponibles apres vos premiers matchs.</p>' +
            '</div>';
    },

    /**
     * Calcule le temps de jeu par joueur (V20.26).
     * Pour chaque set, le total doit etre exactement 4.0 (4 slots).
     * - Si substitutions[] existe → prorata precis base sur les points joues
     * - Sinon, si >4 joueurs avec stats → infere les substitutions depuis les rallies
     * - Sinon → chaque joueur = 1 set complet (4 joueurs × 1.0 = 4.0)
     *
     * Retourne un tableau trie par role puis setsPlayed decroissant.
     */
    computePlayingTime(matches, playerRoles) {
        var players = {}; // { name: { setsPlayed, setsPlayedByRole, matchIds, startingMatchIds, pointsPlayed } }
        var posRoles = BilanView.POSITION_ROLES_HOME;

        function ensurePlayer(name) {
            if (!players[name]) players[name] = { setsPlayed: 0, setsPlayedByRole: {}, matchIds: {}, startingMatchIds: {}, pointsPlayed: 0 };
            return players[name];
        }

        function addByRole(name, role, amount) {
            var p = ensurePlayer(name);
            p.setsPlayedByRole[role] = (p.setsPlayedByRole[role] || 0) + amount;
        }

        // Construit le map joueur → role depuis un lineup (position → joueur)
        function buildRoleMap(lineup) {
            var map = {};
            Object.keys(lineup).forEach(function(pos) {
                if (lineup[pos]) map[lineup[pos]] = posRoles[pos] || 'Autre';
            });
            return map;
        }

        matches.forEach(function(match) {
            var completedSets = (match.sets || []).filter(function(s) { return s.completed; });
            if (completedSets.length === 0) return;

            completedSets.forEach(function(set, setIdx) {
                var totalPoints = (set.points || []).length;
                // Points reels joues : depuis points[] ou depuis les scores (matchs sans stats detaillees)
                // Fallback : finalHomeScore/finalAwayScore si homeScore/awayScore === 0
                var scoreHome = (set.homeScore || 0) || (set.finalHomeScore || 0);
                var scoreAway = (set.awayScore || 0) || (set.finalAwayScore || 0);
                var totalPointsReal = totalPoints > 0 ? totalPoints : (scoreHome + scoreAway);
                if (totalPoints === 0) totalPoints = 1; // eviter division par 0 pour setsPlayed
                var subs = set.substitutions || [];
                var homeSubs = subs.filter(function(s) { return s.team === 'home'; });

                // Determiner le lineup initial du set
                var initialLineup = set.initialHomeLineup || set.homeLineup || {};
                var initialPlayers = Object.values(initialLineup).filter(function(p) { return p !== null; });
                var playerRoleMap = buildRoleMap(initialLineup);

                // ---- Fonction commune : accumuler les intervalles ----
                // Normalise a 4 joueurs par intervalle (filet de securite si push a cree >4)
                function accumulateIntervals(intervals, totalPts, totalPtsReal, matchId) {
                    intervals.forEach(function(interval) {
                        var duration = (interval.end - interval.start) / totalPts;
                        var pointsInInterval = Math.round((interval.end - interval.start) / totalPts * totalPtsReal);
                        var nPlayers = interval.players.length;
                        // Chaque intervalle = 4 slots. Si >4 joueurs, normaliser pour garder 4.0 total
                        var perPlayer = nPlayers > 4 ? (duration * 4 / nPlayers) : duration;
                        interval.players.forEach(function(name) {
                            var p = ensurePlayer(name);
                            p.setsPlayed += perPlayer;
                            p.pointsPlayed += pointsInInterval;
                            p.matchIds[matchId] = true;
                            var role = interval.roleMap[name] || 'Autre';
                            addByRole(name, role, perPlayer);
                        });
                    });
                }

                // ---- Fonction commune : construire les intervalles depuis des subs ----
                function buildIntervals(sortedSubs, startPlayers, startRoleMap, totalPts) {
                    var currentOnCourt = startPlayers.slice();
                    var currentRoleMap = Object.assign({}, startRoleMap);
                    var intervals = [];
                    var prevIdx = 0;

                    sortedSubs.forEach(function(sub) {
                        if (sub.pointIndex > prevIdx) {
                            intervals.push({ start: prevIdx, end: sub.pointIndex, players: currentOnCourt.slice(), roleMap: Object.assign({}, currentRoleMap) });
                        }
                        // Appliquer la substitution — le remplacant herite du role
                        var idx = currentOnCourt.indexOf(sub.playerOut);
                        if (idx >= 0) {
                            currentOnCourt[idx] = sub.playerIn;
                        } else {
                            // playerOut introuvable (nom different dans lineup) → trouver le slot libre
                            // Chercher un joueur du currentOnCourt absent des rallies recents
                            currentOnCourt.push(sub.playerIn);
                        }
                        if (currentRoleMap[sub.playerOut]) {
                            currentRoleMap[sub.playerIn] = currentRoleMap[sub.playerOut];
                        }
                        prevIdx = sub.pointIndex;
                    });

                    // Dernier intervalle
                    if (prevIdx < totalPts) {
                        intervals.push({ start: prevIdx, end: totalPts, players: currentOnCourt.slice(), roleMap: Object.assign({}, currentRoleMap) });
                    }
                    return intervals;
                }

                if (homeSubs.length > 0) {
                    // ---- Calcul precis avec substitutions enregistrees ----
                    var sortedSubs = homeSubs.slice().sort(function(a, b) { return a.pointIndex - b.pointIndex; });
                    var intervals = buildIntervals(sortedSubs, initialPlayers, playerRoleMap, totalPoints);
                    accumulateIntervals(intervals, totalPoints, totalPointsReal, match.id);
                } else {
                    // ---- Fallback : detecter substitutions depuis les rallies ----
                    // Trouver tous les joueurs home avec des actions dans les rallies
                    var playerFirstPoint = {}; // joueur → premier point avec action
                    var playerLastPoint = {};  // joueur → dernier point avec action
                    (set.points || []).forEach(function(point, pi) {
                        (point.rally || []).forEach(function(action) {
                            if (action.team === 'home' && action.player) {
                                var name = action.player;
                                if (playerFirstPoint[name] === undefined) playerFirstPoint[name] = pi;
                                playerLastPoint[name] = pi;
                            }
                        });
                    });

                    // Collecter aussi les joueurs des lineups + stats
                    var validHomePlayers = {};
                    [set.initialHomeLineup, set.homeLineup].forEach(function(lu) {
                        if (!lu) return;
                        Object.keys(lu).forEach(function(pos) { if (lu[pos]) validHomePlayers[lu[pos]] = true; });
                    });
                    var statsHome = (set.stats && set.stats.home) ? set.stats.home : {};
                    var playersWithStats = Object.keys(statsHome).filter(function(name) {
                        if (!validHomePlayers[name]) return false;
                        var s = statsHome[name];
                        return s && (
                            (s.service && s.service.tot > 0) ||
                            (s.reception && s.reception.tot > 0) ||
                            (s.pass && s.pass.tot > 0) ||
                            (s.attack && s.attack.tot > 0) ||
                            (s.relance && s.relance.tot > 0) ||
                            (s.defense && s.defense.tot > 0) ||
                            (s.block && s.block.tot > 0)
                        );
                    });

                    if (playersWithStats.length === 0) {
                        playersWithStats = initialPlayers.slice();
                    }
                    // Fallback roster : si ni lineup ni stats, utiliser le roster du match (premiers 4 joueurs)
                    if (playersWithStats.length === 0 && totalPointsReal > 0) {
                        var roster = (match.players || []).map(function(p) {
                            return (typeof p === 'object' && p !== null) ? p.prenom : p;
                        }).filter(Boolean);
                        playersWithStats = roster.slice(0, 4);
                    }

                    if (playersWithStats.length <= 4) {
                        // Pas de substitution : chaque joueur = 1 set complet
                        playersWithStats.forEach(function(name) {
                            var p = ensurePlayer(name);
                            p.setsPlayed += 1;
                            p.pointsPlayed += totalPointsReal;
                            p.matchIds[match.id] = true;
                            var role = playerRoleMap[name] || 'Autre';
                            addByRole(name, role, 1);
                        });
                    } else {
                        // Plus de 4 joueurs → substitution(s) non enregistree(s)
                        // Inferer les changements depuis les rallies (first/last action)
                        var inferredSubs = [];
                        var nonInitial = playersWithStats.filter(function(name) {
                            return initialPlayers.indexOf(name) === -1;
                        });

                        nonInitial.forEach(function(newPlayer) {
                            var entryPoint = playerFirstPoint[newPlayer] || 0;
                            // Qui a-t-il remplace ? Le titulaire dont la derniere action est avant l'entree
                            var candidates = initialPlayers.filter(function(name) {
                                return playerLastPoint[name] !== undefined && playerLastPoint[name] < entryPoint &&
                                    inferredSubs.every(function(s) { return s.playerOut !== name; }); // pas deja remplace
                            });
                            var replacedPlayer = null;
                            if (candidates.length === 1) {
                                replacedPlayer = candidates[0];
                            } else if (candidates.length > 1) {
                                // Plusieurs candidats : celui dont la derniere action est la plus proche de l'entree
                                candidates.sort(function(a, b) { return playerLastPoint[b] - playerLastPoint[a]; });
                                replacedPlayer = candidates[0];
                            } else {
                                // Aucun candidat clair : chercher parmi tous les joueurs on-court
                                // dont la derniere action est avant ou egale a l'entree
                                var allOnCourt = initialPlayers.filter(function(name) {
                                    return inferredSubs.every(function(s) { return s.playerOut !== name; });
                                });
                                var fallbackCandidates = allOnCourt.filter(function(name) {
                                    return playerLastPoint[name] === undefined || playerLastPoint[name] <= entryPoint;
                                });
                                if (fallbackCandidates.length > 0) {
                                    replacedPlayer = fallbackCandidates[0];
                                }
                            }
                            if (replacedPlayer) {
                                inferredSubs.push({
                                    pointIndex: entryPoint,
                                    playerIn: newPlayer,
                                    playerOut: replacedPlayer
                                });
                            }
                        });

                        if (inferredSubs.length > 0) {
                            inferredSubs.sort(function(a, b) { return a.pointIndex - b.pointIndex; });
                            var intervals = buildIntervals(inferredSubs, initialPlayers, playerRoleMap, totalPoints);
                            accumulateIntervals(intervals, totalPoints, totalPointsReal, match.id);
                        } else {
                            // Impossible d'inferer → repartir equitablement sur 4 slots
                            var share = 4 / playersWithStats.length;
                            playersWithStats.forEach(function(name) {
                                var p = ensurePlayer(name);
                                p.setsPlayed += share;
                                p.pointsPlayed += totalPointsReal;
                                p.matchIds[match.id] = true;
                                var role = playerRoleMap[name] || 'Autre';
                                addByRole(name, role, share);
                            });
                        }
                    }
                }

                // Titulaire = dans le lineup initial du Set 1 (setIdx === 0)
                if (setIdx === 0) {
                    initialPlayers.forEach(function(name) {
                        ensurePlayer(name).startingMatchIds[match.id] = true;
                    });
                }
            });

            // Joueur present dans le roster du match mais n'ayant joue aucun set → compter comme present
            (match.players || []).forEach(function(p) {
                var name = (typeof p === 'object' && p !== null) ? p.prenom : p;
                if (name) {
                    ensurePlayer(name).matchIds[match.id] = true;
                }
            });
        });

        // Calculer le nombre de sets completes par match (pour mode Moy)
        var setsPerMatchId = {};
        matches.forEach(function(match) {
            var count = (match.sets || []).filter(function(s) { return s.completed; }).length;
            setsPerMatchId[match.id] = count;
        });

        // Convertir en tableau avec role principal
        var roleOrder = { 'Passeur': 0, 'R4': 1, 'Pointu': 2, 'Centre': 3 };
        var result = Object.keys(players).map(function(name) {
            var p = players[name];
            var matchesPresent = Object.keys(p.matchIds).length;
            var matchesStarting = Object.keys(p.startingMatchIds).length;
            // Somme des sets completes dans les matchs ou le joueur etait present
            var totalSetsWhenPresent = 0;
            Object.keys(p.matchIds).forEach(function(mid) {
                totalSetsWhenPresent += (setsPerMatchId[mid] || 0);
            });
            var role = (playerRoles && playerRoles[name]) ? playerRoles[name].primaryRole : null;
            // Fusionner le temps 'Autre' dans le role principal
            if (p.setsPlayedByRole['Autre'] && role && role !== 'Autre') {
                p.setsPlayedByRole[role] = (p.setsPlayedByRole[role] || 0) + p.setsPlayedByRole['Autre'];
                delete p.setsPlayedByRole['Autre'];
            }
            return {
                name: name,
                role: role || 'Autre',
                setsPlayed: p.setsPlayed,
                setsPlayedByRole: p.setsPlayedByRole,
                matchesPresent: matchesPresent,
                matchesStarting: matchesStarting,
                setsPerMatch: matchesPresent > 0 ? p.setsPlayed / matchesPresent : 0,
                pointsPlayed: p.pointsPlayed,
                pointsPerMatch: matchesPresent > 0 ? p.pointsPlayed / matchesPresent : 0,
                totalSetsWhenPresent: totalSetsWhenPresent
            };
        });

        // Trier par role (ordre poste) puis par setsPlayed decroissant
        result.sort(function(a, b) {
            var ra = roleOrder[a.role] !== undefined ? roleOrder[a.role] : 99;
            var rb = roleOrder[b.role] !== undefined ? roleOrder[b.role] : 99;
            if (ra !== rb) return ra - rb;
            return b.setsPlayed - a.setsPlayed;
        });
        return result;
    },

    renderTable(data, matches) {
        if (data.length === 0) {
            return '<div style="text-align:center;color:var(--text-secondary);padding:24px;">Aucune donnee de temps de jeu.</div>';
        }

        // Totaux pour X/Y
        var totalSets = 0;
        matches.forEach(function(m) {
            (m.sets || []).forEach(function(s) {
                if (s.completed) totalSets++;
            });
        });
        var totalMatches = matches.length;
        var maxSets = 0;
        var maxSM = 0;
        data.forEach(function(p) {
            if (p.setsPlayed > maxSets) maxSets = p.setsPlayed;
            if (p.setsPerMatch > maxSM) maxSM = p.setsPerMatch;
        });
        var isMoy = this._ptAvgMode === 'moy';

        var roleColors = BilanView.ROLE_COLORS;
        var currentRole = null;
        var numCols = 6;

        var self = this;
        var sortCol = self._sortCol;
        var sortAsc = self._sortAsc;
        function sortIcon(col) {
            if (sortCol !== col) return '<span style="font-size:8px;visibility:hidden">\u25BC</span>';
            return '<span style="font-size:8px;opacity:0.7">' + (sortAsc ? '\u25B2' : '\u25BC') + '</span>';
        }

        // Mini bilan + Toggle Tot/Moy
        var isTot = !isMoy;
        var html = '<div style="display:flex;justify-content:space-between;align-items:center;background:var(--bg-container);border-radius:10px;padding:8px 14px;margin-bottom:8px;">';
        html += '<span style="font-size:13px;font-weight:700;color:var(--text-primary);font-family:Google Sans,sans-serif;">' + totalMatches + ' matchs</span>';
        html += '<div class="display-mode-toggle avg-mode-toggle">';
        html += '<button class="avg-mode-btn' + (isTot ? ' active' : '') + '" data-pt-avg="tot">Tot</button>';
        html += '<button class="avg-mode-btn' + (isMoy ? ' active' : '') + '" data-pt-avg="moy">Moy</button>';
        html += '</div></div>';

        html += '<div class="pt-table-container">';
        html += '<table class="pt-table">';
        html += '<thead><tr>';
        html += '<th class="pt-th-name" data-sort="name">Joueur' + sortIcon('name') + '</th>';
        html += '<th class="pt-th-num" data-sort="pct">%' + sortIcon('pct') + '</th>';
        if (isMoy) {
            html += '<th class="pt-th-num" data-sort="sm">S/M' + sortIcon('sm') + '</th>';
        } else {
            html += '<th class="pt-th-num" data-sort="sets">Sets' + sortIcon('sets') + '</th>';
        }
        html += '<th class="pt-th-num" data-sort="pts">Pts' + sortIcon('pts') + '</th>';
        html += '<th class="pt-th-num" data-sort="matchs">Matchs' + sortIcon('matchs') + '</th>';
        html += '<th class="pt-th-num" data-sort="titu">Titu.' + sortIcon('titu') + '</th>';
        html += '</tr></thead>';
        html += '<tbody>';

        data.forEach(function(p) {
            // En-tete de categorie quand le role change
            if (p.role !== currentRole) {
                currentRole = p.role;
                var roleColor = roleColors[currentRole] || '#5f6368';
                html += '<tr class="pt-role-header"><td colspan="' + numCols + '">';
                html += '<span class="pt-role-header-bar" style="background:' + roleColor + '"></span>';
                html += currentRole;
                html += '</td></tr>';
            }

            // % toujours base sur totalSets (part de la saison), valeur centrale selon le mode
            var pctValue = totalSets > 0 ? (p.setsPlayed / totalSets * 100) : 0;
            var centralDisplay;
            if (isMoy) {
                centralDisplay = p.setsPerMatch.toFixed(1);
            } else {
                centralDisplay = (p.setsPlayed % 1 === 0) ? p.setsPlayed.toFixed(0) : p.setsPlayed.toFixed(1);
            }
            var pctDisplay = Math.round(pctValue);
            var barWidth = isMoy
                ? (maxSM > 0 ? (p.setsPerMatch / maxSM * 100) : 0)
                : (maxSets > 0 ? (p.setsPlayed / maxSets * 100) : 0);

            // Roles tries par temps decroissant
            var rolesByTime = Object.keys(p.setsPlayedByRole || {}).sort(function(a, b) {
                return (p.setsPlayedByRole[b] || 0) - (p.setsPlayedByRole[a] || 0);
            });

            // Pastilles : empilees si multi-postes, simple sinon
            var dotsHtml;
            if (rolesByTime.length > 1) {
                dotsHtml = '<span class="role-dots">';
                rolesByTime.forEach(function(r) {
                    dotsHtml += '<span class="role-dot role-dot-stacked" style="background:' + (roleColors[r] || '#5f6368') + '"></span>';
                });
                dotsHtml += '</span>';
            } else {
                var dotColor = roleColors[p.role] || '#5f6368';
                dotsHtml = '<span class="role-dot" style="background:' + dotColor + '"></span>';
            }

            // Barre : segmentee si multi-postes, simple sinon
            var barHtml;
            if (rolesByTime.length > 1 && p.setsPlayed > 0) {
                barHtml = '';
                if (isMoy) {
                    // En mode Moy, proportionner les segments par role sur la base S/M
                    rolesByTime.forEach(function(r) {
                        var roleShare = p.setsPlayed > 0 ? (p.setsPlayedByRole[r] || 0) / p.setsPlayed : 0;
                        var segWidth = barWidth * roleShare;
                        barHtml += '<div class="pt-bar-segment" style="width:' + segWidth.toFixed(1) + '%;background:' + (roleColors[r] || '#5f6368') + '"></div>';
                    });
                } else {
                    rolesByTime.forEach(function(r) {
                        var segWidth = maxSets > 0 ? ((p.setsPlayedByRole[r] || 0) / maxSets * 100) : 0;
                        barHtml += '<div class="pt-bar-segment" style="width:' + segWidth.toFixed(1) + '%;background:' + (roleColors[r] || '#5f6368') + '"></div>';
                    });
                }
            } else {
                var dotColor = roleColors[p.role] || '#5f6368';
                barHtml = '<div class="pt-bar" style="width:' + barWidth.toFixed(1) + '%;background:' + dotColor + '"></div>';
            }

            html += '<tr>';
            html += '<td class="pt-td-name">';
            html += '<div class="pt-player-name">' + dotsHtml + Utils.escapeHtml(p.name) + '</div>';
            html += '<div class="pt-bar-container">' + barHtml + '</div>';
            html += '</td>';
            var ptsDisplay = isMoy ? p.pointsPerMatch.toFixed(0) : p.pointsPlayed;
            html += '<td class="pt-td-num pt-pct">' + pctDisplay + '%</td>';
            html += '<td class="pt-td-num pt-sets-val">' + centralDisplay + '</td>';
            html += '<td class="pt-td-num">' + ptsDisplay + '</td>';
            html += '<td class="pt-td-num">' + p.matchesPresent + '</td>';
            html += '<td class="pt-td-num">' + p.matchesStarting + '</td>';
            html += '</tr>';
        });

        html += '</tbody></table>';
        html += '</div>';
        return html;
    }
};

// ==================== MODAL DISTINCTIONS ====================
var DistinctionsModal = {
    open(contentHtml, title) {
        var modal = document.getElementById('distinctionsModal');
        if (!modal) return;
        document.getElementById('distinctionsModalTitle').textContent = title || 'Distinctions';
        document.getElementById('distinctionsModalBody').innerHTML = contentHtml;
        modal.style.display = 'flex';
    },

    close() {
        var modal = document.getElementById('distinctionsModal');
        if (modal) modal.style.display = 'none';
    },

    init() {
        var modal = document.getElementById('distinctionsModal');
        if (!modal) return;

        // Fermeture par clic sur le backdrop
        modal.addEventListener('click', function(e) {
            if (e.target === modal) DistinctionsModal.close();
        });

        // Fermeture par bouton X
        var closeBtn = document.getElementById('distinctionsModalClose');
        if (closeBtn) closeBtn.addEventListener('click', function() { DistinctionsModal.close(); });

        // Fermeture par Escape
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && modal.style.display !== 'none') {
                DistinctionsModal.close();
            }
        });
    }
};

// ==================== RANKING TEAM MODAL ====================
var RankingTeamModal = {
    open(contentHtml, title) {
        var modal = document.getElementById('rankingTeamModal');
        if (!modal) return;
        document.getElementById('rankingTeamModalTitle').textContent = title || 'Équipe';
        document.getElementById('rankingTeamModalBody').innerHTML = contentHtml;
        modal.style.display = 'flex';
    },

    close() {
        var modal = document.getElementById('rankingTeamModal');
        if (modal) modal.style.display = 'none';
    },

    init() {
        var modal = document.getElementById('rankingTeamModal');
        if (!modal) return;

        modal.addEventListener('click', function(e) {
            if (e.target === modal) RankingTeamModal.close();
        });

        var closeBtn = document.getElementById('rankingTeamModalClose');
        if (closeBtn) closeBtn.addEventListener('click', function() { RankingTeamModal.close(); });

        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && modal.style.display !== 'none') {
                RankingTeamModal.close();
            }
        });
    }
};

// ==================== SECTIONS OUVERTES (tracking) ====================
const OpenSections = {
    _open: new Set(),
    track(titleText, isOpen) {
        var key = titleText.trim();
        if (isOpen) this._open.add(key); else this._open.delete(key);
    },
    restore(container) {
        if (!container) return;
        container.querySelectorAll('.hist-section.collapsed').forEach(function(section) {
            var title = section.querySelector('.hist-section-title');
            if (title && OpenSections._open.has(title.textContent.trim())) {
                section.classList.remove('collapsed');
            }
        });
    }
};

// ==================== INIT ====================
document.addEventListener('DOMContentLoaded', async function() {
    // Init Firebase Auth UI
    if (typeof FirebaseAuthUI !== 'undefined') {
        FirebaseAuthUI.init();
    }

    // Init modal distinctions
    DistinctionsModal.init();
    RankingTeamModal.init();

    // Init season selector + tabs
    SeasonSelector.init();
    SeasonSelector._updateFooter();
    TabNav.init();

    // Rendu initial avec données locales (rapide)
    TabNav.switchTo(TabNav.currentTab);

    // Charger les données Firebase en arrière-plan puis rafraîchir
    const hasFirebaseData = await HistoriqueData.loadFromFirebase();
    if (hasFirebaseData) {
        MatchStatsView._rendered = false;
        YearStatsView._rendered = false;
        SetsPlayedView._rendered = false;
        RankingView._rendered = false;
        TabNav.switchTo(TabNav.currentTab);
    }

    // Migration one-shot : push toutes les données locales vers Firebase (première connexion)
    if (typeof FirebaseSync !== 'undefined' && FirebaseSync.isConfigured()) {
        auth.onAuthStateChanged(async function(user) {
            if (user && !localStorage.getItem('firebase_migrated')) {
                try {
                    await FirebaseSync.pushAll();
                    localStorage.setItem('firebase_migrated', 'true');
                } catch (err) {
                    console.warn('[Historique] Migration Firebase échouée :', err.message);
                }
            }
            // Afficher le bouton "Démarrer un match" uniquement si admin
            var startBtn = document.getElementById('emptyStateStartMatch');
            if (startBtn) {
                startBtn.style.display = (typeof FirebaseSync !== 'undefined' && FirebaseSync.isAdmin()) ? '' : 'none';
            }
        });
    }

    // Event listeners pour le sélecteur de saison
    document.querySelectorAll('.season-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            SeasonSelector.switchTo(btn.dataset.season);
        });
    });

    // Event listeners pour les tabs principaux
    document.querySelectorAll('.main-tabs .tab-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            TabNav.switchTo(btn.dataset.tab);
        });
    });

    // Tri colonnes Distribution Passeur + Transition (delegation)
    document.addEventListener('click', function(e) {
        var th = e.target.closest('[data-pa-sort]');
        if (!th) return;
        var col = th.getAttribute('data-pa-sort');
        var tableEl = th.closest('.pa-dist-table');
        var mode = tableEl ? tableEl.getAttribute('data-pa-mode') : 'match';
        var tableName = th.getAttribute('data-pa-table') || 'passeur';
        PassAttackAnalyzer._onDistSort(col, mode, tableName);
    });

    // Toggle sections collapsibles (delegation) + animation ouverture/fermeture
    document.addEventListener('click', function(e) {
        var title = e.target.closest('.hist-section-title');
        if (!title) return;
        var section = title.closest('.hist-section');
        if (!section) return;
        if (section._animating) return;
        var wasCollapsed = section.classList.contains('collapsed');
        OpenSections.track(title.textContent, wasCollapsed);
        section._animating = true;

        function cleanup() {
            section.style.height = '';
            section.style.overflow = '';
            section.style.transition = '';
            section._animating = false;
        }

        if (wasCollapsed) {
            // OUVERTURE : instantanée + smooth scroll
            section.classList.remove('collapsed');
            section._animating = false;
            requestAnimationFrame(function() {
                var headerOffset = 8;
                var titleRect = title.getBoundingClientRect();
                var scrollTarget = window.pageYOffset + titleRect.top - headerOffset;
                var maxScroll = document.documentElement.scrollHeight - window.innerHeight;
                var finalScroll = Math.min(scrollTarget, maxScroll);
                window.scrollTo({ top: finalScroll, behavior: 'smooth' });
            });
        } else {
            // FERMETURE : scroll vers le titre, puis animer la hauteur
            var headerOffset = 8;
            var titleRect = title.getBoundingClientRect();
            var needsScroll = titleRect.top < -10 || titleRect.top > 80;

            function animateClose() {
                var currentH = section.offsetHeight;
                section.classList.add('collapsed');
                var targetH = section.offsetHeight;
                section.classList.remove('collapsed');
                section.style.height = currentH + 'px';
                section.style.overflow = 'hidden';
                var closeDone = false;
                function onCloseDone() {
                    if (closeDone) return;
                    closeDone = true;
                    clearTimeout(closeTimer);
                    section.classList.add('collapsed');
                    cleanup();
                }
                section.addEventListener('transitionend', function handler(ev) {
                    if (ev.propertyName !== 'height') return;
                    section.removeEventListener('transitionend', handler);
                    onCloseDone();
                });
                var closeTimer = setTimeout(onCloseDone, 350);
                requestAnimationFrame(function() {
                    section.style.transition = 'height 0.25s ease-in-out';
                    section.style.height = targetH + 'px';
                });
            }

            if (needsScroll) {
                // Scroll custom avec easing doux
                var scrollStart = window.pageYOffset;
                var scrollTarget = scrollStart + titleRect.top - headerOffset;
                var scrollDist = scrollTarget - scrollStart;
                var duration = Math.min(450, Math.max(250, Math.abs(scrollDist) * 0.4));
                var startTime = null;
                function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }
                function scrollStep(ts) {
                    if (!startTime) startTime = ts;
                    var progress = Math.min((ts - startTime) / duration, 1);
                    window.scrollTo(0, scrollStart + scrollDist * easeOutCubic(progress));
                    if (progress < 1) {
                        requestAnimationFrame(scrollStep);
                    } else {
                        animateClose();
                    }
                }
                requestAnimationFrame(scrollStep);
            } else {
                animateClose();
            }
        }
    });

    // Toggle Tot/Moy Impact +/- (delegation)
    document.addEventListener('click', function(e) {
        var btn = e.target.closest('[data-impact-avg]');
        if (!btn) return;
        ImpactView.toggleAvgMode();
        var section = btn.closest('.impact-section');
        if (section && ImpactView._lastData) {
            var wasOpen = !section.classList.contains('collapsed');
            var html = ImpactView._renderSection(ImpactView._lastData, ImpactView._lastPlayerRoles);
            var temp = document.createElement('div');
            temp.innerHTML = html;
            var newSection = temp.firstChild;
            if (wasOpen) newSection.classList.remove('collapsed');
            section.replaceWith(newSection);
        }
    });

    // Tri colonnes Impact +/- (delegation)
    document.addEventListener('click', function(e) {
        var th = e.target.closest('.impact-table th[data-sort-col]');
        if (!th) return;
        var col = th.dataset.sortCol;
        if (col === 'player') {
            if (ImpactView._sortCol === 'player') {
                ImpactView._sortAsc = !ImpactView._sortAsc;
            } else {
                ImpactView._sortCol = 'player';
                ImpactView._sortAsc = false;
            }
        } else if (ImpactView._sortCol === col) {
            ImpactView._sortAsc = !ImpactView._sortAsc;
        } else {
            ImpactView._sortCol = col;
            ImpactView._sortAsc = false;
        }
        var section = th.closest('.impact-section');
        if (section && ImpactView._lastData) {
            var wasOpen = !section.classList.contains('collapsed');
            var html = ImpactView._renderSection(ImpactView._lastData, ImpactView._lastPlayerRoles);
            var temp = document.createElement('div');
            temp.innerHTML = html;
            var newSection = temp.firstChild;
            if (wasOpen) newSection.classList.remove('collapsed');
            section.replaceWith(newSection);
        }
    });

    // Bouton fermer detail
    var closeBtn = document.getElementById('detailCloseBtn');
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            MatchStatsView.closeDetail();
        });
    }

    // Bouton gear (menu actions)
    var gearBtn = document.getElementById('detailGearBtn');
    var gearMenu = document.getElementById('detailGearMenu');
    if (gearBtn && gearMenu) {
        gearBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            var isOpen = gearMenu.classList.toggle('open');
            gearBtn.classList.toggle('active', isOpen);
        });

        // Fermer le menu au clic extérieur
        document.addEventListener('click', function(e) {
            if (!gearMenu.contains(e.target) && e.target !== gearBtn) {
                gearMenu.classList.remove('open');
                gearBtn.classList.remove('active');
            }
        });
    }

    // Ouvrir automatiquement un match si passe en parametre URL
    var params = new URLSearchParams(window.location.search);
    var matchId = params.get('match');
    if (matchId) {
        // Chercher dans TOUS les matchs (pas filtré par saison)
        var allMatches = HistoriqueData.getCompletedMatches();
        var foundMatch = allMatches.find(function(m) { return m.id === matchId; });
        if (foundMatch) {
            // Basculer vers la saison du match trouvé
            if (foundMatch.season && foundMatch.season !== SeasonSelector.current) {
                SeasonSelector.current = foundMatch.season;
                sessionStorage.setItem('historique_season', foundMatch.season);
                SeasonSelector._updateButtons();
                SeasonSelector._updateFooter();
                MatchStatsView._rendered = false;
            }
            // Chercher l'index dans les matchs filtrés
            var filtered = SeasonSelector.getFilteredMatches()
                .slice().sort(function(a, b) { return (b.matchDate || b.timestamp || 0) - (a.matchDate || a.timestamp || 0); });
            var index = filtered.findIndex(function(m) { return m.id === matchId; });
            if (index >= 0) {
                MatchStatsView.render();
                MatchStatsView.selectMatch(index);
            }
        }
        window.history.replaceState({}, '', window.location.pathname);
    }
});
