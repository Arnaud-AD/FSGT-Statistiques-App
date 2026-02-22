'use strict';

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
        // Renommer Stats Année / Stats Années
        var yearStatsBtn = document.querySelector('.tab-btn[data-tab="yearStats"]');
        if (yearStatsBtn) yearStatsBtn.textContent = isAll ? 'Stats Années' : 'Stats Année';
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
            for (const [name, data] of Object.entries(s.stats[teamKey])) {
                // V20.26 : exclure les joueurs qui ne font pas partie du roster/lineups
                if (allowed && (Array.isArray(allowed) ? allowed.indexOf(name) === -1 : !allowed[name])) continue;
                if (!playerTotals[name]) {
                    playerTotals[name] = StatsAggregator.initPlayerStats();
                }
                const t = playerTotals[name];

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

    // Definition des colonnes par categorie — variante MATCH (Tab 1 : Ace et S+ separes, FA et BP separes)
    CATEGORIES_MATCH: {
        service: {
            label: 'Service', key: 'service',
            columns: [
                { key: 'tot', label: 'Tot', cls: '' },
                { key: 'ace', label: 'Ace', cls: 'positive', pct: true },
                { key: 'splus', label: 'S+', cls: 'positive' },
                { key: 'fser', label: 'FS', cls: 'negative', pct: true },
                { key: '_moy', label: 'Moy', cls: '_srvMoy' }
            ]
        },
        reception: {
            label: 'Reception', key: 'reception',
            columns: [
                { key: 'tot', label: 'Tot', cls: '' },
                { key: 'r4', label: 'R4', cls: 'positive', pct: true },
                { key: 'r3', label: 'R3', cls: '' },
                { key: 'r2', label: 'R2', cls: '' },
                { key: 'r1', label: 'R1', cls: 'warning' },
                { key: 'frec', label: 'FR', cls: 'negative', pct: true }
            ]
        },
        passe: {
            label: 'Passe', key: 'pass',
            columns: [
                { key: 'tot', label: 'Tot', cls: '' },
                { key: 'p4', label: 'P4', cls: 'positive', pct: true },
                { key: 'p3', label: 'P3', cls: '' },
                { key: 'p2', label: 'P2', cls: '' },
                { key: 'p1', label: 'P1', cls: 'warning' },
                { key: 'fp', label: 'FP', cls: 'negative', pct: true }
            ]
        },
        attack: {
            label: 'Attaque', key: 'attack',
            columns: [
                { key: 'tot', label: 'Tot', cls: '' },
                { key: 'attplus', label: 'A+', cls: 'positive', pct: true },
                { key: 'attminus', label: 'A-', cls: 'neutral' },
                { key: '_faBp', label: 'FA(BP)', cls: 'negative', pct: true, computed: 'faBp' }
            ]
        },
        relance: {
            label: 'Relance', key: 'relance',
            columns: [
                { key: 'tot', label: 'Tot', cls: '' },
                { key: 'relplus', label: 'R+', cls: 'positive', pct: true },
                { key: 'relminus', label: 'R-', cls: 'neutral' },
                { key: 'frel', label: 'FRel', cls: 'negative', pct: true }
            ]
        },
        defense: {
            label: 'Defense', key: 'defense',
            columns: [
                { key: 'tot', label: 'Tot', cls: '' },
                { key: 'defplus', label: 'D+', cls: 'positive', pct: true },
                { key: 'defneutral', label: 'D', cls: 'neutral' },
                { key: 'defminus', label: 'D-', cls: 'negative', pct: true },
                { key: 'fdef', label: 'FD', cls: 'negative', pct: true }
            ]
        },
        block: {
            label: 'Bloc', key: 'block',
            columns: [
                { key: 'tot', label: 'Tot', cls: '' },
                { key: 'blcplus', label: 'B+', cls: 'positive' },
                { key: 'blcminus', label: 'B-', cls: 'neutral' },
                { key: 'fblc', label: 'FB', cls: 'negative' }
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
                { key: 'r3', label: 'R3', cls: '' },
                { key: 'r2', label: 'R2', cls: '' },
                { key: 'r1', label: 'R1', cls: 'warning' },
                { key: 'frec', label: 'FR', cls: 'negative', pct: true }
            ]
        },
        passe: {
            label: 'Passe', key: 'pass',
            columns: [
                { key: 'tot', label: 'Tot', cls: '' },
                { key: 'p4', label: 'P4', cls: 'positive', pct: true },
                { key: 'p3', label: 'P3', cls: '' },
                { key: 'p2', label: 'P2', cls: '' },
                { key: 'p1', label: 'P1', cls: 'warning' },
                { key: 'fp', label: 'FP', cls: 'negative', pct: true }
            ]
        },
        attack: {
            label: 'Attaque', key: 'attack',
            columns: [
                { key: 'tot', label: 'Tot', cls: '' },
                { key: 'attplus', label: 'A+', cls: 'positive', pct: true },
                { key: 'attminus', label: 'A-', cls: 'neutral' },
                { key: '_faBp', label: 'FA(BP)', cls: 'negative', pct: true, computed: 'faBp' }
            ]
        },
        relance: {
            label: 'Relance', key: 'relance',
            columns: [
                { key: 'tot', label: 'Tot', cls: '' },
                { key: 'relplus', label: 'R+', cls: 'positive', pct: true },
                { key: 'relminus', label: 'R-', cls: 'neutral' },
                { key: 'frel', label: 'FRel', cls: 'negative', pct: true }
            ]
        },
        defense: {
            label: 'Defense', key: 'defense',
            columns: [
                { key: 'tot', label: 'Tot', cls: '' },
                { key: 'defplus', label: 'D+', cls: 'positive', pct: true },
                { key: 'defneutral', label: 'D', cls: 'neutral' },
                { key: 'defminus', label: 'D-', cls: 'negative', pct: true },
                { key: 'fdef', label: 'FD', cls: 'negative', pct: true }
            ]
        },
        block: {
            label: 'Bloc', key: 'block',
            columns: [
                { key: 'tot', label: 'Tot', cls: '' },
                { key: 'blcplus', label: 'B+', cls: 'positive' },
                { key: 'blcminus', label: 'B-', cls: 'neutral' },
                { key: 'fblc', label: 'FB', cls: 'negative' }
            ]
        }
    },

    /**
     * Retourne la definition de categories a utiliser selon le contexte.
     */
    getCategories(variant) {
        return variant === 'aggregated' ? this.CATEGORIES_AGGREGATED : this.CATEGORIES_MATCH;
    },

    /**
     * Genere le HTML du tableau stats mobile pour une categorie et une equipe.
     * @param {string} variant - 'match' ou 'aggregated'
     */
    renderCategoryTable(playerTotals, category, teamLabel, teamClass, variant) {
        const cats = this.getCategories(variant);
        const catDef = cats[category];
        if (!catDef) return '';

        const players = this.sortPlayers(Object.keys(playerTotals), playerTotals);
        if (players.length === 0) return '';

        const totals = StatsAggregator.computeTotals(playerTotals);

        // Header
        let html = '<div class="stats-team-block">';
        html += '<div class="stats-team-title ' + teamClass + '">' + Utils.escapeHtml(teamLabel) + '</div>';
        html += '<table class="stats-table"><thead><tr>';
        html += '<th>Joueur</th>';
        catDef.columns.forEach(function(col) {
            html += '<th>' + col.label + '</th>';
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
        catDef.columns.forEach(function(col) {
            html += SharedComponents.renderCell({ [totDataKey]: totals[totDataKey], service: totals.service }, category, col);
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
        } else {
            val = catData[col.key] || 0;
        }

        // Pourcentage
        var pctStr = '';
        if (col.pct && val > 0) {
            var tot = catData.tot || 0;
            // Pour acePlus, le tot est dans service
            if (col.computed === 'acePlus') tot = (playerStats.service || {}).tot || 0;
            // Pour faBp, le tot est dans attack
            if (col.computed === 'faBp') tot = (playerStats.attack || {}).tot || 0;
            if (tot > 0) {
                pctStr = ' <span class="stat-pct">' + Math.round(val / tot * 100) + '%</span>';
            }
        }

        display = val > 0 ? val : '-';
        var cls = val > 0 ? col.cls : '';

        if (val > 0 && extraInfo) {
            return '<td class="' + cls + '">' + display + extraInfo + pctStr + '</td>';
        }
        return '<td class="' + cls + '">' + display + pctStr + '</td>';
    },

    /**
     * Genere le HTML complet desktop (multi-cartes horizontales) pour une equipe.
     * @param {string} variant - 'match' ou 'aggregated'
     */
    renderDesktopStatsTable(playerTotals, teamLabel, teamClass, variant) {
        const players = this.sortPlayers(Object.keys(playerTotals), playerTotals);
        if (players.length === 0) return '';

        const cats = this.getCategories(variant);
        const totals = StatsAggregator.computeTotals(playerTotals);
        let html = '';

        html += '<div class="stats-team-title ' + teamClass + '">' + Utils.escapeHtml(teamLabel) + '</div>';
        html += '<div class="stats-tables-container">';

        // Colonne noms joueurs (sticky)
        html += '<div class="stats-players-col">';
        html += '<div class="player-header">Joueur</div>';
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
                html += '<th>' + col.label + '</th>';
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
            catDef.columns.forEach(function(col) {
                html += SharedComponents.renderCell({ [totDataK]: totals[totDataK], service: totals.service }, catKey, col);
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
            { key: 'p4', label: 'P4', cls: 'positive' },
            { key: 'p3', label: 'P3', cls: '' },
            { key: 'p2', label: 'P2', cls: '' },
            { key: 'p1', label: 'P1', cls: 'warning' },
            { key: 'fp', label: 'FP', cls: 'negative' }
        ];

        function cell(bucket, key, cls) {
            var v = bucket[key] || 0;
            var pct = '';
            if (v > 0 && (key === 'p4' || key === 'fp') && bucket.tot > 0) {
                pct = ' <span class="stat-pct">' + Math.round(v / bucket.tot * 100) + '%</span>';
            }
            return '<td class="' + (v > 0 ? cls : '') + '">' + (v > 0 ? v : '-') + pct + '</td>';
        }

        function typeRow(label, bucket, cssClass) {
            var html = '<tr class="' + cssClass + '"><td>' + label + '</td>';
            cols.forEach(function(c) { html += cell(bucket, c.key, c.cls); });
            html += '</tr>';
            return html;
        }

        function ctxRow(label, bucket) {
            var html = '<tr class="pass-ctx-row"><td>\u2514 ' + label + '</td>';
            cols.forEach(function(c) { html += cell(bucket, c.key, c.cls); });
            html += '</tr>';
            return html;
        }

        var html = '<div class="stats-team-block">';
        html += '<div class="stats-team-title ' + teamClass + '">' + Utils.escapeHtml(teamLabel) + '</div>';

        // -- Tableau par joueur (standard) --
        var players = SharedComponents.sortPlayers(Object.keys(playerTotals), playerTotals);
        html += '<table class="stats-table"><thead><tr><th>Joueur</th>';
        cols.forEach(function(c) { html += '<th>' + c.label + '</th>'; });
        html += '</tr></thead><tbody>';

        players.forEach(function(name) {
            var p = playerTotals[name].pass || {};
            html += '<tr><td><div class="player-cell">';
            html += SharedComponents.renderRoleDots(name);
            html += Utils.escapeHtml(name);
            html += '</div></td>';
            cols.forEach(function(c) { html += cell(p, c.key, c.cls); });
            html += '</tr>';
        });

        // Total
        html += '<tr class="total-row"><td>Total</td>';
        cols.forEach(function(c) { html += cell(passData, c.key, c.cls); });
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
            if (psr.confort) html += ctxRow('Confort', psr.confort);
            if (psr.contraint) html += ctxRow('Contraint', psr.contraint);
            if (psr.transition) html += ctxRow('Transition', psr.transition);

            html += typeRow('Autres', aut, 'pass-type-row');
            if (aut.contraint) html += ctxRow('Contraint', aut.contraint);
            if (aut.transition) html += ctxRow('Transition', aut.transition);

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
     * Multi-postes : pastilles empilees verticalement.
     */
    renderRoleDots(name) {
        if (this.playerRolesMap && this.playerRolesMap[name]) {
            var info = this.playerRolesMap[name];
            // Toujours 1 seule pastille = role principal (le plus joue)
            // Les anciens matchs sans initialLineup ont des roles pollues par les substitutions
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
        'Passeur': { attaque: 0.00, bloc: 0.00, relance: 0.05, reception: 0.00, defense: 0.25, passe: 0.45, service: 0.25 },
        'Centre':  { attaque: 0.10, bloc: 0.05, relance: 0.20, reception: 0.20, defense: 0.20, passe: 0.05, service: 0.20 },
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
        var html = '<div class="bilan-section">';
        html += '<div class="bilan-h2h-header">';
        html += '<span class="bilan-h2h-team">Jen et ses Saints</span>';
        html += '<span class="bilan-h2h-vs">vs</span>';
        html += '<span class="bilan-h2h-team">' + Utils.escapeHtml(match.opponent || 'Adverse') + '</span>';
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
            if (bestA) bestAwayByFamily[fam] = { scores: bestA.scores, role: bestA.effectiveRole, name: bestA.name };
            var bestH = null;
            allHome.forEach(function(d) { if (d.family === fam && (!bestH || d.ip > bestH.ip)) bestH = d; });
            if (bestH) bestHomeByFamily[fam] = { scores: bestH.scores, role: bestH.effectiveRole, name: bestH.name };
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

        // Section Distinctions (home uniquement, stats agregees completes)
        html += this.renderDistinctions(homeTotals, homeRoles, homePlayers);

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
        function findBestOnAxis(axisKey, eligibleRoles) {
            var bestName = null, bestScore = -1;
            players.forEach(function(name) {
                var d = playerData[name];
                // Filtrer par role si specifie
                if (eligibleRoles && eligibleRoles.indexOf(d.role) === -1) return;
                var score = d.axes[axisKey] || 0;
                if (score <= 0) return;
                // Verifier seuil minimum via _tots
                var tot = d.axes._tots ? d.axes._tots[axisKey] : undefined;
                if (tot !== undefined && minActions[axisKey] && tot < minActions[axisKey]) return;
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

        var html = '<div class="bilan-section">';
        html += '<div class="bilan-section-title">Distinctions</div>';
        html += '<div class="bilan-distinctions">';

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
            { axisKey: 'bloc',      emoji: '🧱', label: 'Meilleur Bloqueur',      statsFn: function(s) {
                var b = s.block;
                return 'B+ : ' + b.blcplus + ' (' + self._pct(b.blcplus, b.tot) + ')' +
                       ' · B- : ' + b.blcminus + ' (' + self._pct(b.blcminus, b.tot) + ')' +
                       ' · FB : ' + b.fblc + ' (' + self._pct(b.fblc, b.tot) + ')';
            }}
        ];

        distinctions.forEach(function(dist) {
            var best = findBestOnAxis(dist.axisKey, dist.eligibleRoles);
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
        html += '</div>'; // bilan-section
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
    getPlayerRoles(match, team) {
        var roleCounts = {};
        var self = this;
        var side = team || 'home';
        // Utiliser initialLineup (feuille de match) plutot que lineup courant (apres substitutions)
        var initialKey = (side === 'away') ? 'initialAwayLineup' : 'initialHomeLineup';
        var lineupKey = (side === 'away') ? 'awayLineup' : 'homeLineup';
        var positionRoles = (side === 'away') ? self.POSITION_ROLES_AWAY : self.POSITION_ROLES_HOME;
        var completedSets = (match.sets || []).filter(function(s) { return s.completed; });

        completedSets.forEach(function(set) {
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

    getPlayerRolesYear(matches) {
        var self = this;
        var mergedCounts = {};
        matches.forEach(function(match) {
            var roles = self.getPlayerRoles(match, 'home');
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

        // PASSE (V20.25) : moyenne ponderee + bonus Passeur (+5) / plafond non-passeur (80)
        var pas = s.pass || {};
        if (pas.tot > 0) {
            var passeRaw = (pas.p4 * 100 + pas.p3 * 75 + pas.p2 * 50 + pas.p1 * 25) / pas.tot;
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
        relance: 1,     // la relance est rare, 1 suffit
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

        // Calculer le poids total de tous les axes du role (= 1.0 normalement)
        var totalWeight = 0;
        Object.keys(weights).forEach(function(key) {
            if (weights[key] > 0) totalWeight += weights[key];
        });

        // Calculer le poids total des axes actifs
        // Actif = score > 0 ET poids > 0 ET volume >= seuil minimum
        var activeWeight = 0;
        Object.keys(weights).forEach(function(key) {
            if (weights[key] <= 0) return;
            var score = axisScores[key] || 0;
            if (score <= 0) return;
            // Verifier le seuil minimum si les volumes sont disponibles
            var tot = tots[key];
            if (tot !== undefined && minActions[key] && tot < minActions[key]) return;
            activeWeight += weights[key];
        });

        // Si aucun axe actif, IP = 0
        if (activeWeight === 0) return 0;

        // Redistribution partielle : seuls 50% du poids perdu sont redistribues
        var lostWeight = totalWeight - activeWeight;
        var effectiveDenominator = activeWeight + lostWeight * 0.5;

        // IP = somme ponderee / denominateur effectif
        var ip = 0;
        Object.keys(weights).forEach(function(key) {
            if (weights[key] <= 0) return;
            var score = axisScores[key] || 0;
            if (score <= 0) return;
            var tot = tots[key];
            if (tot !== undefined && minActions[key] && tot < minActions[key]) return;
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

        // Polygones concentriques de fond (25%, 50%, 75%, 100%)
        [0.25, 0.5, 0.75, 1.0].forEach(function(scale) {
            var points = axes.map(function(axis) {
                var pt = self.polarToCartesian(cx, cy, maxR * scale, axis.angle);
                return pt.x.toFixed(1) + ',' + pt.y.toFixed(1);
            }).join(' ');
            html += '<polygon points="' + points + '" fill="none" stroke="#e8eaed" stroke-width="0.8"/>';
        });

        // Lignes d'axes (centre → sommet)
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
                var r = maxR * val / 100;
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

            axes.forEach(function(axis, i) {
                var val = ovVals[i];
                if (val > 0) {
                    var r = maxR * val / 100;
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
            html += '<div class="spider-overlay bilan-compare-label">' + Utils.escapeHtml(overlayData.name) + '</div>';
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

    // --- Agreger les passeurs adverses de la saison (moyenne des scores axes) ---
    aggregateAwayPasseursYear(matches) {
        var self = this;
        var bestPerMatch = []; // meilleur passeur adverse de chaque match

        matches.forEach(function(match) {
            var awayFamilies = self.getPlayerFamilies(match, 'away');
            var completedSets = (match.sets || []).filter(function(s) { return s.completed; });
            if (completedSets.length === 0) return;

            var bestScores = null;
            var bestIp = -1;

            Object.keys(awayFamilies).forEach(function(name) {
                var fam = awayFamilies[name].families['Passeur'];
                if (!fam) return;

                var playerTotals = StatsAggregator.aggregateStatsBySetIndices(
                    completedSets, 'away', fam.setIndices
                );
                var stats = playerTotals[name];
                if (!stats) return;

                var scores = self.computeAxisScores(stats, 'Passeur');
                var hasAny = ['service', 'reception', 'passe', 'attaque', 'bloc', 'relance', 'defense'].some(function(k) {
                    return (scores[k] || 0) > 0;
                });
                if (!hasAny) return;

                var ip = self.computeIP(scores, 'Passeur');
                if (ip > bestIp) {
                    bestIp = ip;
                    bestScores = scores;
                }
            });

            if (bestScores) bestPerMatch.push(bestScores);
        });

        if (bestPerMatch.length === 0) return null;

        // Moyenne par axe uniquement sur les passeurs ayant des stats
        // significatives sur cet axe (V20.26 : respect du seuil IP_MIN_ACTIONS)
        var avgScores = {};
        var avgTots = {};
        var minActions = self.IP_MIN_ACTIONS;
        ['service', 'reception', 'passe', 'attaque', 'bloc', 'relance', 'defense'].forEach(function(k) {
            // Ne moyenner que les scores dont le volume depasse le seuil minimum
            var withStats = bestPerMatch.filter(function(sc) {
                if ((sc[k] || 0) <= 0) return false;
                var tots = sc._tots || {};
                if (tots[k] !== undefined && minActions[k] && tots[k] < minActions[k]) return false;
                return true;
            });
            if (withStats.length === 0) { avgScores[k] = 0; avgTots[k] = 0; return; }
            var sumScores = withStats.reduce(function(s, sc) { return s + sc[k]; }, 0);
            var sumTots = withStats.reduce(function(s, sc) { return s + ((sc._tots || {})[k] || 0); }, 0);
            avgScores[k] = Math.round(sumScores / withStats.length);
            avgTots[k] = Math.round(sumTots / withStats.length);
        });
        avgScores._tots = avgTots;

        return {
            name: 'Passeurs Adv.',
            scores: avgScores,
            ip: self.computeIP(avgScores, 'Passeur'),
            count: bestPerMatch.length
        };
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

        document.querySelectorAll('.tab-content').forEach(function(content) {
            content.classList.toggle('active', content.id === 'content-' + tab);
        });

        // Lazy-load le contenu de l'onglet
        switch (tab) {
            case 'matchStats': MatchStatsView.render(); break;
            case 'yearStats': YearStatsView.render(); break;
            case 'setsStats': SetsPlayedView.render(); break;
            case 'visualStats': break; // placeholder
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

        var sorted = matchHistory.slice().sort(function(a, b) { return (b.timestamp || 0) - (a.timestamp || 0); });
        var self = this;

        // Générer les options du select
        var hasSelection = self.selectedMatchIndex !== null;
        var optionsHtml = '<option value="" disabled' + (!hasSelection ? ' selected' : '') + '>Sélectionner un match…</option>';
        sorted.forEach(function(match, index) {
            var resultEmoji = match.result === 'win' ? '🟢' : (match.result === 'loss' ? '🔴' : '🟡');
            var setsDisplay = (match.setsWon !== undefined && match.setsLost !== undefined)
                ? match.setsWon + '-' + match.setsLost : '';
            var dateStr = match.timestamp ? Utils.formatDate(match.timestamp) : '';
            var opponent = match.opponent || 'Adversaire';
            var selected = self.selectedMatchIndex === index ? ' selected' : '';

            optionsHtml += '<option value="' + index + '"' + selected + '>' +
                resultEmoji + ' ' + opponent + '  ' + setsDisplay + '  ' + dateStr +
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
        var sorted = matchHistory.slice().sort(function(a, b) { return (b.timestamp || 0) - (a.timestamp || 0); });
        var match = sorted[index];
        if (!match) return;

        this.selectedMatchIndex = index;
        this.currentMatch = match;
        this.currentSetFilter = 'bilan';
        this.currentCategory = 'service';

        // Mise a jour du select
        var matchSelect = document.getElementById('matchSelect');
        if (matchSelect) matchSelect.value = '' + index;

        this.renderDetailHeader(match);
        this.renderDetailSetTabs(match);
        this.renderCategoryTabs();
        this.showBilanView(match);
        this.setupDeleteButton(match);
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
        var matchDate = match.timestamp ? Utils.formatDate(match.timestamp) : '';
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
            SharedComponents.renderSideOutBlock(this.currentMatch, filter, 'sideoutContainer');
            SharedComponents.renderTimeline(this.currentMatch, 'timelineContainer', filter);
        }
    },

    showBilanView(match) {
        // Masquer les sections stats normales (classe pour overrider !important)
        var catTabs = document.getElementById('statsCategoryTabs');
        var mobile = document.getElementById('statsMobileContainer');
        var desktop = document.getElementById('statsDesktopContainer');
        var sideout = document.querySelector('.sideout-section');
        var timeline = document.getElementById('timelineSection');

        if (catTabs) catTabs.style.display = 'none';
        if (mobile) { mobile.style.display = 'none'; mobile.classList.add('bilan-hidden'); }
        if (desktop) { desktop.style.display = 'none'; desktop.classList.add('bilan-hidden'); }
        if (sideout) sideout.style.display = 'none';
        if (timeline) timeline.style.display = 'none';

        // Afficher et rendre le bilan
        var bilanContainer = document.getElementById('bilanContainer');
        if (bilanContainer) {
            bilanContainer.style.display = 'block';
            BilanView.render(match, bilanContainer);
        }
    },

    hideBilanView() {
        var bilanContainer = document.getElementById('bilanContainer');
        if (bilanContainer) bilanContainer.style.display = 'none';

        // Restaurer les sections normales
        var catTabs = document.getElementById('statsCategoryTabs');
        var mobile = document.getElementById('statsMobileContainer');
        var desktop = document.getElementById('statsDesktopContainer');
        var sideout = document.querySelector('.sideout-section');

        if (catTabs) catTabs.style.display = '';
        if (mobile) { mobile.style.display = ''; mobile.classList.remove('bilan-hidden'); }
        if (desktop) { desktop.style.display = ''; desktop.classList.remove('bilan-hidden'); }
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

        // Roles par joueur pour pastilles colorees
        var homeRoles = BilanView.getPlayerRoles(match, 'home');
        var awayRoles = BilanView.getPlayerRoles(match, 'away');

        // Vue mobile : categorie selectionnee
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
        }

        // Vue desktop : tableau complet
        if (desktopContainer) {
            SharedComponents.playerRolesMap = homeRoles;
            var homeDesktop = SharedComponents.renderDesktopStatsTable(homeTotals, 'Jen et ses Saints', 'home', 'match');
            SharedComponents.playerRolesMap = awayRoles;
            var awayDesktop = SharedComponents.renderDesktopStatsTable(awayTotals, opponent, 'away', 'match');
            SharedComponents.playerRolesMap = null;
            desktopContainer.innerHTML = homeDesktop + awayDesktop;
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
                var w = (col.computed === 'faBp') ? 7 : 5;
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
                    } else {
                        var val = p[exportDataKey] ? (p[exportDataKey][col.key] || 0) : 0;
                        text += (val > 0 ? String(val) : '-').padStart(5);
                    }
                });
                text += '\n';
            });
            // V19.2 : ventilation passe equipe apres les lignes joueurs
            if (catKey === 'passe') {
                var passKeys = ['tot', 'p4', 'p3', 'p2', 'p1', 'fp'];
                function exportPassLine(label, bucket) {
                    if (!bucket || !bucket.tot) return '';
                    var line = label.padEnd(14);
                    passKeys.forEach(function(k) {
                        var v = bucket[k] || 0;
                        line += (v > 0 ? String(v) : '-').padStart(5);
                    });
                    return line + '\n';
                }
                var pt = totals.pass || {};
                if (pt.passeur && (pt.passeur.tot || pt.passeur.fp)) {
                    text += exportPassLine('Passeur', pt.passeur);
                    if (pt.passeur.confort) text += exportPassLine('  Confort', pt.passeur.confort);
                    if (pt.passeur.contraint) text += exportPassLine('  Contraint', pt.passeur.contraint);
                    if (pt.passeur.transition) text += exportPassLine('  Transition', pt.passeur.transition);
                }
                if (pt.autre && (pt.autre.tot || pt.autre.fp)) {
                    text += exportPassLine('Autres', pt.autre);
                    if (pt.autre.contraint) text += exportPassLine('  Contraint', pt.autre.contraint);
                    if (pt.autre.transition) text += exportPassLine('  Transition', pt.autre.transition);
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

        // Distinctions saison
        html += this.renderYearDistinctions(filtered);

        // Stats joueurs cumulees (meme composant que Tab 1)
        html += this.renderPlayerStats(filtered);

        // Side Out / Break Out agrege
        html += this.renderYearSideOut(filtered);

        // Graphique momentum agrege
        html += this.renderYearMomentum(filtered);

        container.innerHTML = html;
        this.bindEvents(container);
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

        var html = '<div class="bilan-section">';
        html += '<div class="bilan-h2h-header">';
        html += '<span class="bilan-h2h-team">Jen et ses Saints</span>';
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
                var ip = BilanView.computeIP(scores, familyIpRole);

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
                    name: name, scores: scores, ip: ip, stats: stats,
                    primaryColor: primaryColor, roleColors: roleColors,
                    effectiveRole: familyIpRole, family: family, slot: slot,
                    axes: familyAxes, bestName: bestName, secondBestName: secondBestName
                });
            });
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
                best: inFam.length > 0 ? { name: inFam[0].name, scores: inFam[0].scores, role: inFam[0].effectiveRole } : null,
                second: inFam.length > 1 ? { name: inFam[1].name, scores: inFam[1].scores, role: inFam[1].effectiveRole } : null
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

        // Rendu cartes par slot, case vide si nombre impair
        SLOT_ORDER_YEAR.forEach(function(slot) {
            var slotData = dataBySlot[slot] || [];
            var totalCards = slotData.length;

            // Pour le slot Passeur : ajouter la carte moyenne adverse
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

            // Carte moyenne passeurs adverses
            if (showAwayPasseurCard) {
                var homePasseurOverlay = (passeurCount === 1 && familyOverlays['Passeur'] && familyOverlays['Passeur'].best)
                    ? familyOverlays['Passeur'].best : null;
                var awayCard = BilanView.renderSpiderChart(
                    awayPasseursAvg.name,
                    'Passeur', awayPasseursAvg.scores, awayPasseursAvg.ip,
                    '#b4a0d6', BilanView.SPIDER_AXES, true,
                    homePasseurOverlay, null
                );
                // Ajouter classe bilan-away-avg pour style distinct
                html += awayCard.replace('bilan-player-card"', 'bilan-player-card bilan-away-avg"');
            }

            // Case vide si nombre impair pour completer la ligne de la grille
            if (totalCards % 2 !== 0) {
                html += '<div class="bilan-player-card bilan-player-empty"></div>';
            }
        });

        html += '</div>'; // bilan-grid-year
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

        var html = '<div class="sideout-section">';
        html += '<div class="sideout-section-title">Side Out / Break Out</div>';
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
        matches.forEach(function(m) {
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

        var html = '<div class="momentum-section">';
        html += '<div class="momentum-section-title">Momentum <span class="momentum-subtitle">' + curves.length + ' sets</span></div>';

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

        // Roles annee pour pastilles colorees
        SharedComponents.playerRolesMap = BilanView.getPlayerRolesYear(matches);

        // Mobile : onglets categorie + premier onglet service
        var html = '<div class="stats-section">';
        html += '<div class="segmented-tabs stats-category-tabs" id="yearCategoryTabs">';
        var cats = ['service', 'reception', 'passe', 'attack', 'relance', 'defense', 'block'];
        var labels = { service: 'Serv', reception: 'Rec', passe: 'Pas', attack: 'Att', relance: 'Rel', defense: 'Def', block: 'Blc' };
        cats.forEach(function(cat) {
            html += '<button class="seg-tab cat-tab ' + (cat === 'service' ? 'active' : '') + '" data-cat="' + cat + '">' + labels[cat] + '</button>';
        });
        html += '</div>';

        html += '<div class="stats-mobile" id="yearStatsMobile">';
        html += SharedComponents.renderCategoryTable(homeTotals, 'service', 'Jen et ses Saints', 'home', 'aggregated');
        html += '</div>';

        // Desktop
        html += '<div class="stats-desktop" id="yearStatsDesktop">';
        html += SharedComponents.renderDesktopStatsTable(homeTotals, 'Jen et ses Saints', 'home', 'aggregated');
        html += '</div>';

        SharedComponents.playerRolesMap = null;

        html += '</div>';
        return html;
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

                var matches = SeasonSelector.getFilteredMatches();
                var filtered = self.applyFilter(matches);
                var allSets = [];
                filtered.forEach(function(m) {
                    (m.sets || []).filter(function(s) { return s.completed; }).forEach(function(s) { allSets.push(s); });
                });
                var homeTotals = StatsAggregator.aggregateStats(allSets, 'home');

                // Roles annee pour pastilles colorees
                SharedComponents.playerRolesMap = BilanView.getPlayerRolesYear(filtered);

                var mobileContainer = document.getElementById('yearStatsMobile');
                if (mobileContainer) {
                    if (cat === 'passe') {
                        mobileContainer.innerHTML = SharedComponents.renderPassDetailView(homeTotals, 'Jen et ses Saints', 'home');
                    } else {
                        mobileContainer.innerHTML = SharedComponents.renderCategoryTable(homeTotals, cat, 'Jen et ses Saints', 'home', 'aggregated');
                    }
                }
                SharedComponents.playerRolesMap = null;
            };
        }
    }
};

// ==================== TAB 3: TEMPS DE JEU ====================
const SetsPlayedView = {
    _rendered: false,

    render() {
        var container = document.getElementById('content-setsStats');
        if (!container) return;

        var matches = SeasonSelector.getFilteredMatches();
        if (matches.length === 0) {
            this.renderEmpty(container);
            return;
        }

        var playerRoles = BilanView.getPlayerRolesYear(matches);
        var data = this.computePlayingTime(matches, playerRoles);
        container.innerHTML = this.renderTable(data, matches);
        this._rendered = true;
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
     * Calcule le temps de jeu par joueur.
     * Pour chaque set :
     * - Si substitutions[] existe → prorata précis basé sur les points joués
     * - Sinon → fallback : chaque joueur avec des stats compte pour 1 set complet
     *
     * Retourne un tableau trié par setsPlayed décroissant.
     */
    computePlayingTime(matches, playerRoles) {
        var players = {}; // { name: { setsPlayed, matchesPresent: Set, matchesStarting: Set, details } }

        matches.forEach(function(match) {
            var completedSets = (match.sets || []).filter(function(s) { return s.completed; });
            if (completedSets.length === 0) return;

            completedSets.forEach(function(set, setIdx) {
                var totalPoints = (set.points || []).length;
                if (totalPoints === 0) totalPoints = 1; // eviter division par 0
                var subs = set.substitutions || [];
                var homeSubs = subs.filter(function(s) { return s.team === 'home'; });

                // Determiner le lineup initial du set
                var initialLineup = set.initialHomeLineup || set.homeLineup || {};
                var initialPlayers = Object.values(initialLineup).filter(function(p) { return p !== null; });

                if (homeSubs.length > 0) {
                    // ---- Calcul precis avec substitutions ----
                    // Reconstruire la timeline : qui etait sur le terrain a chaque intervalle
                    // Trier les subs par pointIndex
                    var sortedSubs = homeSubs.slice().sort(function(a, b) { return a.pointIndex - b.pointIndex; });

                    // Construire les intervalles : [0, sub1.pointIndex), [sub1.pointIndex, sub2.pointIndex), ..., [lastSub.pointIndex, totalPoints)
                    var currentOnCourt = initialPlayers.slice();
                    var intervals = [];
                    var prevIndex = 0;

                    sortedSubs.forEach(function(sub) {
                        if (sub.pointIndex > prevIndex) {
                            intervals.push({ start: prevIndex, end: sub.pointIndex, players: currentOnCourt.slice() });
                        }
                        // Appliquer la substitution
                        var idx = currentOnCourt.indexOf(sub.playerOut);
                        if (idx >= 0) {
                            currentOnCourt[idx] = sub.playerIn;
                        } else {
                            currentOnCourt.push(sub.playerIn);
                        }
                        prevIndex = sub.pointIndex;
                    });

                    // Dernier intervalle
                    if (prevIndex < totalPoints) {
                        intervals.push({ start: prevIndex, end: totalPoints, players: currentOnCourt.slice() });
                    }

                    // Accumuler le prorata par joueur
                    intervals.forEach(function(interval) {
                        var pointsInInterval = interval.end - interval.start;
                        var ratio = pointsInInterval / totalPoints;
                        interval.players.forEach(function(name) {
                            if (!players[name]) players[name] = { setsPlayed: 0, matchIds: {}, startingMatchIds: {} };
                            players[name].setsPlayed += ratio;
                            players[name].matchIds[match.id] = true;
                        });
                    });
                } else {
                    // ---- Fallback : pas de substitutions ----
                    // V20.26 : construire la liste des joueurs home valides depuis les lineups
                    var validHomePlayers = {};
                    [set.initialHomeLineup, set.homeLineup].forEach(function(lu) {
                        if (!lu) return;
                        Object.keys(lu).forEach(function(pos) { if (lu[pos]) validHomePlayers[lu[pos]] = true; });
                    });
                    // Tous les joueurs qui apparaissent dans les stats du set ET dans un lineup home
                    var statsHome = (set.stats && set.stats.home) ? set.stats.home : {};
                    var playersInSet = Object.keys(statsHome).filter(function(name) {
                        if (!validHomePlayers[name]) return false; // exclure joueurs adverses
                        var s = statsHome[name];
                        // Verifier qu'il a au moins 1 action
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

                    // Si aucun joueur dans les stats, utiliser le lineup
                    if (playersInSet.length === 0) {
                        playersInSet = initialPlayers.slice();
                    }

                    playersInSet.forEach(function(name) {
                        if (!players[name]) players[name] = { setsPlayed: 0, matchIds: {}, startingMatchIds: {} };
                        players[name].setsPlayed += 1;
                        players[name].matchIds[match.id] = true;
                    });
                }

                // Titulaire = dans le lineup initial du Set 1 (setIdx === 0)
                if (setIdx === 0) {
                    initialPlayers.forEach(function(name) {
                        if (!players[name]) players[name] = { setsPlayed: 0, matchIds: {}, startingMatchIds: {} };
                        players[name].startingMatchIds[match.id] = true;
                    });
                }
            });
        });

        // Convertir en tableau avec role principal
        var roleOrder = { 'Passeur': 0, 'R4': 1, 'Pointu': 2, 'Centre': 3 };
        var result = Object.keys(players).map(function(name) {
            var p = players[name];
            var matchesPresent = Object.keys(p.matchIds).length;
            var matchesStarting = Object.keys(p.startingMatchIds).length;
            var role = (playerRoles && playerRoles[name]) ? playerRoles[name].primaryRole : null;
            return {
                name: name,
                role: role || 'Autre',
                setsPlayed: p.setsPlayed,
                matchesPresent: matchesPresent,
                matchesStarting: matchesStarting,
                setsPerMatch: matchesPresent > 0 ? p.setsPlayed / matchesPresent : 0
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
        var maxSets = data[0].setsPlayed; // pour la barre de progression

        var roleColors = BilanView.ROLE_COLORS;
        var currentRole = null;

        var html = '<div class="pt-table-container">';
        html += '<table class="pt-table">';
        html += '<thead><tr>';
        html += '<th class="pt-th-name">Joueur</th>';
        html += '<th class="pt-th-num">%</th>';
        html += '<th class="pt-th-num">Sets</th>';
        html += '<th class="pt-th-num">Matchs</th>';
        html += '<th class="pt-th-num">S/M</th>';
        html += '<th class="pt-th-num">Titu.</th>';
        html += '</tr></thead>';
        html += '<tbody>';

        data.forEach(function(p) {
            // En-tete de categorie quand le role change
            if (p.role !== currentRole) {
                currentRole = p.role;
                var roleColor = roleColors[currentRole] || '#5f6368';
                html += '<tr class="pt-role-header"><td colspan="6">';
                html += '<span class="pt-role-header-bar" style="background:' + roleColor + '"></span>';
                html += currentRole;
                html += '</td></tr>';
            }

            var setsDisplay = (p.setsPlayed % 1 === 0) ? p.setsPlayed.toFixed(0) : p.setsPlayed.toFixed(1);
            var spmDisplay = p.setsPerMatch.toFixed(2);
            var pctValue = totalSets > 0 ? (p.setsPlayed / totalSets * 100) : 0;
            var pctDisplay = Math.round(pctValue);
            var barWidth = maxSets > 0 ? (p.setsPlayed / maxSets * 100) : 0;
            var dotColor = roleColors[p.role] || '#5f6368';

            html += '<tr>';
            html += '<td class="pt-td-name">';
            html += '<div class="pt-player-name"><span class="role-dot" style="background:' + dotColor + '"></span>' + Utils.escapeHtml(p.name) + '</div>';
            html += '<div class="pt-bar-container"><div class="pt-bar" style="width:' + barWidth.toFixed(1) + '%;background:' + dotColor + '"></div></div>';
            html += '</td>';
            html += '<td class="pt-td-num pt-pct">' + pctDisplay + '%</td>';
            html += '<td class="pt-td-num pt-sets-val">' + setsDisplay + '</td>';
            html += '<td class="pt-td-num">' + p.matchesPresent + '/' + totalMatches + '</td>';
            html += '<td class="pt-td-num">' + spmDisplay + '</td>';
            html += '<td class="pt-td-num">' + p.matchesStarting + '</td>';
            html += '</tr>';
        });

        html += '</tbody></table>';
        html += '</div>';
        return html;
    }
};

// ==================== INIT ====================
document.addEventListener('DOMContentLoaded', async function() {
    // Init Firebase Auth UI
    if (typeof FirebaseAuthUI !== 'undefined') {
        FirebaseAuthUI.init();
    }

    // Init season selector + tabs
    SeasonSelector.init();
    SeasonSelector._updateFooter();
    TabNav.init();

    // Rendu initial avec données locales (rapide)
    TabNav.switchTo(TabNav.currentTab);

    // Charger les données Firebase en arrière-plan puis rafraîchir
    const hasFirebaseData = await HistoriqueData.loadFromFirebase();
    if (hasFirebaseData) {
        // Forcer le re-rendu des vues avec les données mergées
        MatchStatsView._rendered = false;
        YearStatsView._rendered = false;
        SetsPlayedView._rendered = false;
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
                .slice().sort(function(a, b) { return (b.timestamp || 0) - (a.timestamp || 0); });
            var index = filtered.findIndex(function(m) { return m.id === matchId; });
            if (index >= 0) {
                MatchStatsView.render();
                MatchStatsView.selectMatch(index);
            }
        }
        window.history.replaceState({}, '', window.location.pathname);
    }
});
