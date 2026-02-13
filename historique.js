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

    getCompletedMatches() {
        if (!this._cache) {
            this._cache = Storage.getAllMatches().filter(m => m.status === 'completed');
        }
        return this._cache;
    },

    invalidateCache() {
        this._cache = null;
    },

    deleteMatch(id) {
        Storage.deleteMatch(id);
        this.invalidateCache();
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

    initPlayerStats() {
        return {
            service: { tot: 0, ace: 0, splus: 0, fser: 0, recSumAdv: 0, recCountAdv: 0 },
            reception: { tot: 0, r4: 0, r3: 0, r2: 0, r1: 0, frec: 0 },
            attack: { tot: 0, attplus: 0, attminus: 0, bp: 0, fatt: 0 },
            defense: { tot: 0, defplus: 0, defminus: 0, fdef: 0 },
            block: { tot: 0, blcplus: 0, blcminus: 0, fblc: 0 }
        };
    },

    /**
     * Agrege les stats d'une equipe sur plusieurs sets.
     * Gere les noms de champs legacy (fs/fser, fd/attplus, bl/blcplus, faute/frec).
     */
    aggregateStats(setsData, teamKey) {
        const playerTotals = {};
        setsData.forEach(function(s) {
            if (!s.stats || !s.stats[teamKey]) return;
            for (const [name, data] of Object.entries(s.stats[teamKey])) {
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

                // Attaque
                t.attack.tot += (data.attack?.tot || 0);
                t.attack.attplus += (data.attack?.fd || data.attack?.attplus || 0);
                t.attack.attminus += (data.attack?.attminus || 0);
                t.attack.bp += (data.attack?.bp || 0);
                t.attack.fatt += (data.attack?.fatt || 0);

                // Defense
                t.defense.tot += (data.defense?.tot || 0);
                t.defense.defplus += (data.defense?.defplus || 0);
                t.defense.defminus += (data.defense?.defminus || 0);
                t.defense.fdef += (data.defense?.fdef || 0);

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
     * Calcule les totaux equipe a partir des totaux joueurs.
     */
    computeTotals(playerTotals) {
        const totals = StatsAggregator.initPlayerStats();
        for (const p of Object.values(playerTotals)) {
            for (const cat of ['service', 'reception', 'attack', 'defense', 'block']) {
                for (const key of Object.keys(totals[cat])) {
                    totals[cat][key] += (p[cat][key] || 0);
                }
            }
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

    // Definition des colonnes par categorie
    CATEGORIES: {
        service: {
            label: 'Service', key: 'service',
            columns: [
                { key: 'tot', label: 'Tot', cls: '' },
                { key: 'ace', label: 'Ace', cls: 'positive' },
                { key: 'splus', label: 'S+', cls: 'positive' },
                { key: 'fser', label: 'FS', cls: 'negative' },
                { key: '_moy', label: 'Moy', cls: '_srvMoy' }
            ]
        },
        reception: {
            label: 'Reception', key: 'reception',
            columns: [
                { key: 'tot', label: 'Tot', cls: '' },
                { key: 'r4', label: 'R4', cls: 'positive' },
                { key: 'r3', label: 'R3', cls: 'positive' },
                { key: 'r2', label: 'R2', cls: 'neutral' },
                { key: 'r1', label: 'R1', cls: 'negative' },
                { key: 'frec', label: 'FR', cls: 'negative' }
            ]
        },
        attack: {
            label: 'Attaque', key: 'attack',
            columns: [
                { key: 'tot', label: 'Tot', cls: '' },
                { key: 'attplus', label: 'A+', cls: 'positive' },
                { key: 'attminus', label: 'A-', cls: 'neutral' },
                { key: 'bp', label: 'BP', cls: 'negative' },
                { key: 'fatt', label: 'FA', cls: 'negative' }
            ]
        },
        defense: {
            label: 'Defense', key: 'defense',
            columns: [
                { key: 'tot', label: 'Tot', cls: '' },
                { key: 'defplus', label: 'D+', cls: 'positive' },
                { key: 'defminus', label: 'D-', cls: 'neutral' },
                { key: 'fdef', label: 'FD', cls: 'negative' }
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
     * Genere le HTML du tableau stats mobile pour une categorie et une equipe.
     */
    renderCategoryTable(playerTotals, category, teamLabel, teamClass) {
        const catDef = SharedComponents.CATEGORIES[category];
        if (!catDef) return '';

        const players = Object.keys(playerTotals);
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
            html += '<span class="role-dot" style="background:' + SharedComponents.getRoleColor(name) + '"></span>';
            html += Utils.escapeHtml(name);
            html += '</div></td>';
            catDef.columns.forEach(function(col) {
                html += SharedComponents.renderCell(p, category, col);
            });
            html += '</tr>';
        });

        // Ligne total
        html += '<tr class="total-row"><td>Total</td>';
        catDef.columns.forEach(function(col) {
            html += SharedComponents.renderCell({ [category]: totals[category], service: totals.service }, category, col);
        });
        html += '</tr>';

        html += '</tbody></table></div>';
        return html;
    },

    /**
     * Genere une cellule de stat.
     */
    renderCell(playerStats, category, col) {
        // Cas special : moyenne service
        if (col.key === '_moy') {
            const cls = StatsAggregator.srvMoyClass(playerStats);
            return '<td class="' + cls + '">' + StatsAggregator.srvMoyDisplay(playerStats) + '</td>';
        }

        const val = playerStats[category] ? (playerStats[category][col.key] || 0) : 0;
        const display = val > 0 ? val : '-';
        const cls = val > 0 ? col.cls : '';
        return '<td class="' + cls + '">' + display + '</td>';
    },

    /**
     * Genere le HTML complet desktop (multi-cartes horizontales) pour une equipe.
     */
    renderDesktopStatsTable(playerTotals, teamLabel, teamClass) {
        const players = Object.keys(playerTotals);
        if (players.length === 0) return '';

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
        var catKeys = ['service', 'reception', 'attack', 'defense', 'block'];
        catKeys.forEach(function(catKey) {
            var catDef = SharedComponents.CATEGORIES[catKey];
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
            html += '<tr class="total-row">';
            catDef.columns.forEach(function(col) {
                html += SharedComponents.renderCell({ [catKey]: totals[catKey], service: totals.service }, catKey, col);
            });
            html += '</tr>';

            html += '</tbody></table></div>';
        });

        html += '</div>';
        return html;
    },

    /**
     * Retourne la couleur du role d'un joueur (basique, par nom).
     */
    getRoleColor(name) {
        const lower = name.toLowerCase();
        if (lower.includes('passeur')) return 'var(--role-passeur)';
        if (lower.includes('r4')) return 'var(--role-r4)';
        if (lower.includes('centre')) return 'var(--role-centre)';
        if (lower.includes('pointu')) return 'var(--role-pointu)';
        // Fallback
        return 'var(--text-secondary)';
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
            if (runs.length === 0) return;

            var totalPoints = runs.reduce(function(sum, r) { return sum + r.points.length; }, 0);
            var blockSize = SharedComponents.computeBlockSize(totalPoints, runs.length, containerWidth);
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
            html += '<span class="' + (homeWon ? 'tl-score-home' : 'tl-score-lost') + '">' + homeScore + '</span>';
            html += '<span class="tl-sep">-</span>';
            html += '<span class="' + (homeWon ? 'tl-score-lost' : 'tl-score-away') + '">' + awayScore + '</span>';
            html += '</span></div>';

            html += '<div class="timeline-chart">';
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

        var html = '<table class="sideout-table">';
        html += '<thead><tr><th></th>';
        html += '<th>Jen</th>';
        html += '<th>' + Utils.escapeHtml(opponent) + '</th>';
        html += '</tr></thead><tbody>';

        html += '<tr><td>Side Out</td>';
        html += '<td class="home-val">' + (stats.home.soPercent !== null ? stats.home.soPercent + '%' : '-') + '</td>';
        html += '<td class="away-val">' + (stats.away.soPercent !== null ? stats.away.soPercent + '%' : '-') + '</td>';
        html += '</tr>';

        html += '<tr><td>Break Out</td>';
        html += '<td class="home-val">' + (stats.home.brkPercent !== null ? stats.home.brkPercent + '%' : '-') + '</td>';
        html += '<td class="away-val">' + (stats.away.brkPercent !== null ? stats.away.brkPercent + '%' : '-') + '</td>';
        html += '</tr>';

        html += '</tbody></table>';
        container.innerHTML = html;
    }
};

// ==================== TAB NAVIGATION ====================
const TabNav = {
    currentTab: 'matchStats',

    init() {
        var saved = sessionStorage.getItem('historique_tab');
        if (saved) {
            this.switchTo(saved);
        }
    },

    switchTo(tab) {
        this.currentTab = tab;
        sessionStorage.setItem('historique_tab', tab);

        document.querySelectorAll('.tabs-container .tab-btn').forEach(function(btn) {
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
        var matchHistory = HistoriqueData.getCompletedMatches();
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
        var matchHistory = HistoriqueData.getCompletedMatches();
        var sorted = matchHistory.slice().sort(function(a, b) { return (b.timestamp || 0) - (a.timestamp || 0); });
        var match = sorted[index];
        if (!match) return;

        this.selectedMatchIndex = index;
        this.currentMatch = match;
        this.currentSetFilter = 'all';
        this.currentCategory = 'service';

        // Mise a jour du select
        var matchSelect = document.getElementById('matchSelect');
        if (matchSelect) matchSelect.value = '' + index;

        this.renderDetailHeader(match);
        this.renderDetailSetTabs(match);
        SharedComponents.renderTimeline(match, 'timelineContainer', 'all');
        SharedComponents.renderSideOutBlock(match, 'all', 'sideoutContainer');
        this.renderCategoryTabs();
        this.renderStats(match, 'all');
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
        var homeWon = (match.setsWon || 0) > (match.setsLost || 0);
        homeSetsEl.textContent = match.setsWon || 0;
        awaySetsEl.textContent = match.setsLost || 0;
        homeSetsEl.className = 'detail-header-team-score ' + (homeWon ? 'home-winner' : 'home-loser');
        awaySetsEl.className = 'detail-header-team-score ' + (homeWon ? 'away-loser' : 'away-winner');
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
            var homeClass = homeWon ? 'home-won' : 'home-lost';
            var awayClass = homeWon ? 'away-lost' : 'away-won';

            return '<span class="detail-header-set-chip">' +
                '<span class="set-label">' + label + '</span>' +
                '<span class="set-score ' + homeClass + '">' + h + '</span>' +
                '<span class="set-label">-</span>' +
                '<span class="set-score ' + awayClass + '">' + a + '</span>' +
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
            linkContainer.innerHTML = '<a class="detail-youtube-link" href="' + Utils.escapeHtml(urls[0]) + '" target="_blank">\u25b6 Voir la video</a>';
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

        var html = '<button class="detail-set-tab active" data-set="all">Global</button>';
        completedSets.forEach(function(s, i) {
            html += '<button class="detail-set-tab" data-set="' + i + '">S' + (i + 1) + '</button>';
        });
        container.innerHTML = html;

        container.onclick = function(e) {
            var tab = e.target.closest('.detail-set-tab');
            if (!tab) return;
            var filter = tab.dataset.set === 'all' ? 'all' : parseInt(tab.dataset.set);
            self.switchSetFilter(filter);
        };
    },

    switchSetFilter(filter) {
        this.currentSetFilter = filter;

        document.querySelectorAll('.detail-set-tab').forEach(function(tab) {
            var tabFilter = tab.dataset.set === 'all' ? 'all' : parseInt(tab.dataset.set);
            tab.classList.toggle('active', tabFilter === filter);
        });

        this.renderStats(this.currentMatch, filter);
        SharedComponents.renderSideOutBlock(this.currentMatch, filter, 'sideoutContainer');
        SharedComponents.renderTimeline(this.currentMatch, 'timelineContainer', filter);
    },

    renderCategoryTabs() {
        var container = document.getElementById('statsCategoryTabs');
        if (!container) return;

        var self = this;
        var cats = ['service', 'reception', 'attack', 'defense', 'block'];
        var labels = { service: 'Serv', reception: 'Rec', attack: 'Att', defense: 'Def', block: 'Blc' };

        container.innerHTML = cats.map(function(cat) {
            var isActive = self.currentCategory === cat;
            return '<button class="cat-tab ' + (isActive ? 'active' : '') + '" data-cat="' + cat + '">' + labels[cat] + '</button>';
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

        // Vue mobile : categorie selectionnee
        if (mobileContainer) {
            var cat = this.currentCategory;
            mobileContainer.innerHTML =
                SharedComponents.renderCategoryTable(homeTotals, cat, 'Jen et ses Saints', 'home') +
                SharedComponents.renderCategoryTable(awayTotals, cat, opponent, 'away');
        }

        // Vue desktop : tableau complet
        if (desktopContainer) {
            desktopContainer.innerHTML =
                SharedComponents.renderDesktopStatsTable(homeTotals, 'Jen et ses Saints', 'home') +
                SharedComponents.renderDesktopStatsTable(awayTotals, opponent, 'away');
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

        btn.onclick = function() {
            self._closeGearMenu();
            if (confirm('Supprimer ce match ?\n' + opponent + ' (' + (match.setsWon || 0) + '-' + (match.setsLost || 0) + ')')) {
                HistoriqueData.deleteMatch(match.id);
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
        var setsToUse = (this.currentSetFilter === 'all') ? completedSets : [completedSets[this.currentSetFilter]].filter(Boolean);
        var homeTotals = StatsAggregator.aggregateStats(setsToUse, 'home');
        var totals = StatsAggregator.computeTotals(homeTotals);

        var text = 'Stats Match vs ' + opponent + '\n';
        text += 'Score: ' + (match.setsWon || 0) + '-' + (match.setsLost || 0) + '\n';
        if (this.currentSetFilter !== 'all') {
            text += 'Set ' + (this.currentSetFilter + 1) + '\n';
        }
        text += '\n';

        var cats = ['service', 'reception', 'attack', 'defense', 'block'];
        cats.forEach(function(catKey) {
            var catDef = SharedComponents.CATEGORIES[catKey];
            text += catDef.label.toUpperCase() + '\n';
            // Header
            text += 'Joueur'.padEnd(14);
            catDef.columns.forEach(function(col) {
                text += col.label.padStart(5);
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
                    } else {
                        var val = p[catKey] ? (p[catKey][col.key] || 0) : 0;
                        text += (val > 0 ? String(val) : '-').padStart(5);
                    }
                });
                text += '\n';
            });
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
        var matches = HistoriqueData.getCompletedMatches();
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

        // Classement joueurs
        html += this.renderRankings(filtered);

        // Stats joueurs cumulees (meme composant que Tab 1)
        html += this.renderPlayerStats(filtered);

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
            { key: 'championship', label: 'Championnat' },
            { key: 'ginette', label: 'Ginette' }
        ];
        var self = this;
        var html = '<div class="year-filters">';
        filters.forEach(function(f) {
            html += '<button class="year-filter-btn ' + (self.currentFilter === f.key ? 'active' : '') + '" data-filter="' + f.key + '">' + f.label + '</button>';
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
        html += '<div class="year-summary-title">Bilan Saison 2025-2026</div>';
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
            html += '<div class="ranking-player"><span class="role-dot" style="background:' + SharedComponents.getRoleColor(r.name) + '"></span>' + Utils.escapeHtml(r.name) + '</div>';
            html += '</div>';
            html += '<div class="ranking-value">' + r.value + '</div>';
            html += '</div>';
        });
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

        // Mobile : onglets categorie + premier onglet service
        var html = '<div class="stats-section">';
        html += '<div class="stats-category-tabs" id="yearCategoryTabs">';
        var cats = ['service', 'reception', 'attack', 'defense', 'block'];
        var labels = { service: 'Serv', reception: 'Rec', attack: 'Att', defense: 'Def', block: 'Blc' };
        cats.forEach(function(cat) {
            html += '<button class="cat-tab ' + (cat === 'service' ? 'active' : '') + '" data-cat="' + cat + '">' + labels[cat] + '</button>';
        });
        html += '</div>';

        html += '<div class="stats-mobile" id="yearStatsMobile">';
        html += SharedComponents.renderCategoryTable(homeTotals, 'service', 'Jen et ses Saints', 'home');
        html += '</div>';

        // Desktop
        html += '<div class="stats-desktop" id="yearStatsDesktop">';
        html += SharedComponents.renderDesktopStatsTable(homeTotals, 'Jen et ses Saints', 'home');
        html += '</div>';

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

                var matches = HistoriqueData.getCompletedMatches();
                var filtered = self.applyFilter(matches);
                var allSets = [];
                filtered.forEach(function(m) {
                    (m.sets || []).filter(function(s) { return s.completed; }).forEach(function(s) { allSets.push(s); });
                });
                var homeTotals = StatsAggregator.aggregateStats(allSets, 'home');

                var mobileContainer = document.getElementById('yearStatsMobile');
                if (mobileContainer) {
                    mobileContainer.innerHTML = SharedComponents.renderCategoryTable(homeTotals, cat, 'Jen et ses Saints', 'home');
                }
            };
        }
    }
};

// ==================== TAB 3: SETS PLAYED VIEW ====================
const SetsPlayedView = {
    filters: { outcome: 'all', type: 'all' },
    _rendered: false,

    render() {
        var container = document.getElementById('content-setsStats');
        if (!container) return;

        var allSets = this.loadAllSets();
        if (allSets.length === 0) {
            this.renderEmpty(container);
            return;
        }

        var filtered = this.filterSets(allSets);

        var html = '';
        html += this.renderSummary(allSets);
        html += this.renderFilterPills();
        html += this.renderSetList(filtered);

        container.innerHTML = html;
        this.bindEvents(container, allSets);
        this._rendered = true;
    },

    loadAllSets() {
        var matches = HistoriqueData.getCompletedMatches();
        var sets = [];
        matches.forEach(function(match) {
            (match.sets || []).filter(function(s) { return s.completed; }).forEach(function(set) {
                var homeScore = set.finalHomeScore || 0;
                var awayScore = set.finalAwayScore || 0;
                sets.push({
                    matchId: match.id,
                    opponent: match.opponent || 'Adversaire',
                    matchType: match.type,
                    matchDate: match.timestamp || match.completedAt,
                    setNumber: set.number,
                    homeScore: homeScore,
                    awayScore: awayScore,
                    winner: set.winner || (homeScore > awayScore ? 'home' : 'away'),
                    points: set.points || [],
                    margin: Math.abs(homeScore - awayScore),
                    isClose: Math.abs(homeScore - awayScore) <= 3,
                    stats: set.stats,
                    set: set
                });
            });
        });
        return sets.sort(function(a, b) { return (b.matchDate || 0) - (a.matchDate || 0); });
    },

    filterSets(sets) {
        var f = this.filters;
        var result = sets;
        if (f.outcome === 'won') result = result.filter(function(s) { return s.winner === 'home'; });
        if (f.outcome === 'lost') result = result.filter(function(s) { return s.winner === 'away'; });
        if (f.type === 'close') result = result.filter(function(s) { return s.isClose; });
        if (f.type === 'dominated') result = result.filter(function(s) { return !s.isClose; });
        return result;
    },

    renderEmpty(container) {
        container.innerHTML = '<div class="empty-state">' +
            '<div class="empty-state-icon visual">' +
            '<svg width="32" height="32" fill="currentColor" viewBox="0 0 24 24"><path d="M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99z"/></svg>' +
            '</div>' +
            '<h3 class="empty-state-title">Sets joues</h3>' +
            '<p class="empty-state-desc">L\'analyse detaillee de tous vos sets sera disponible ici.</p>' +
            '</div>';
    },

    renderSummary(sets) {
        var won = sets.filter(function(s) { return s.winner === 'home'; }).length;
        var lost = sets.filter(function(s) { return s.winner === 'away'; }).length;
        var closeSets = sets.filter(function(s) { return s.isClose; });
        var closeWon = closeSets.filter(function(s) { return s.winner === 'home'; }).length;

        var html = '<div class="sets-summary-card">';
        html += '<strong>' + sets.length + ' sets</strong> &nbsp; ';
        html += '<span style="color:var(--win-color);font-weight:600">' + won + 'V</span>';
        html += ' \u00b7 <span style="color:var(--loss-color);font-weight:600">' + lost + 'D</span>';
        html += ' &nbsp; Win: <strong>' + (sets.length > 0 ? Math.round(won / sets.length * 100) : 0) + '%</strong>';
        if (closeSets.length > 0) {
            html += '<br>Serres: ' + closeSets.length + ' (' + closeWon + 'V \u00b7 ' + (closeSets.length - closeWon) + 'D)';
        }
        html += '</div>';
        return html;
    },

    renderFilterPills() {
        var self = this;
        var html = '<div class="sets-filters">';

        // Outcome filters
        var outcomes = [
            { key: 'all', label: 'Tous' },
            { key: 'won', label: 'Gagnes' },
            { key: 'lost', label: 'Perdus' }
        ];
        outcomes.forEach(function(f) {
            html += '<button class="sets-filter-pill ' + (self.filters.outcome === f.key ? 'active' : '') + '" data-group="outcome" data-value="' + f.key + '">' + f.label + '</button>';
        });

        // Type filters
        var types = [
            { key: 'all', label: 'Tous types' },
            { key: 'close', label: 'Serres' },
            { key: 'dominated', label: 'Domines' }
        ];
        types.forEach(function(f) {
            html += '<button class="sets-filter-pill ' + (self.filters.type === f.key ? 'active' : '') + '" data-group="type" data-value="' + f.key + '">' + f.label + '</button>';
        });

        html += '</div>';
        return html;
    },

    renderSetList(sets) {
        if (sets.length === 0) {
            return '<div style="text-align:center;color:var(--text-secondary);padding:24px;">Aucun set correspondant aux filtres.</div>';
        }

        var html = '<div class="sets-list">';
        sets.forEach(function(s, i) {
            var isWin = s.winner === 'home';
            var scoreColor = isWin ? 'color:var(--accent-blue)' : 'color:var(--loss-color)';
            var dateStr = s.matchDate ? Utils.formatDate(s.matchDate) : '';

            html += '<div class="set-card" data-set-index="' + i + '">';
            html += '<div class="set-card-header">';
            html += '<span class="set-card-result ' + (isWin ? 'win' : 'loss') + '"></span>';
            html += '<div class="set-card-info">';
            html += '<div class="set-card-title">Set ' + (s.setNumber || '?') + ' vs ' + Utils.escapeHtml(s.opponent) + '</div>';
            html += '<div class="set-card-meta">' + dateStr + '</div>';
            html += '</div>';
            html += '<span class="set-card-score" style="' + scoreColor + '">' + s.homeScore + '-' + s.awayScore + '</span>';
            if (s.isClose) {
                html += '<span class="set-card-badge">serre</span>';
            }
            html += '</div>'; // set-card-header

            // Mini timeline
            if (s.points.length > 0) {
                html += '<div class="set-card-timeline" id="setTimeline' + i + '"></div>';
            }

            html += '</div>'; // set-card
        });
        html += '</div>';
        return html;
    },

    bindEvents(container, allSets) {
        var self = this;

        // Filtres
        container.querySelectorAll('.sets-filter-pill').forEach(function(pill) {
            pill.addEventListener('click', function() {
                var group = pill.dataset.group;
                var value = pill.dataset.value;
                self.filters[group] = value;
                self._rendered = false;
                self.render();
            });
        });

        // Rendre les mini-timelines apres insertion dans le DOM
        var filtered = this.filterSets(allSets);
        filtered.forEach(function(s, i) {
            if (s.points.length > 0) {
                var timelineEl = document.getElementById('setTimeline' + i);
                if (timelineEl) {
                    var containerWidth = timelineEl.clientWidth || 300;
                    var runs = SharedComponents.buildTimelineData(s.set || { points: s.points, initialHomeScore: 0 });
                    if (runs.length > 0) {
                        var totalPoints = runs.reduce(function(sum, r) { return sum + r.points.length; }, 0);
                        var blockSize = SharedComponents.computeBlockSize(totalPoints, runs.length, containerWidth);
                        var fontSize = blockSize >= 14 ? 8 : 0;
                        var blockHeight = 14;

                        var html = '<div class="timeline-chart" style="gap:2px;">';
                        runs.forEach(function(run) {
                            html += '<div class="timeline-run">';
                            html += '<div class="timeline-row">';
                            run.points.forEach(function(pt) {
                                if (run.team === 'home') {
                                    html += '<div class="tl-block home" style="width:' + blockSize + 'px;height:' + blockHeight + 'px;font-size:' + fontSize + 'px;">' + (fontSize > 0 ? pt.teamScore : '') + '</div>';
                                } else {
                                    html += '<div class="tl-block empty" style="width:' + blockSize + 'px;height:' + blockHeight + 'px;"></div>';
                                }
                            });
                            html += '</div><div class="timeline-row">';
                            run.points.forEach(function(pt) {
                                if (run.team === 'away') {
                                    html += '<div class="tl-block away" style="width:' + blockSize + 'px;height:' + blockHeight + 'px;font-size:' + fontSize + 'px;">' + (fontSize > 0 ? pt.teamScore : '') + '</div>';
                                } else {
                                    html += '<div class="tl-block empty" style="width:' + blockSize + 'px;height:' + blockHeight + 'px;"></div>';
                                }
                            });
                            html += '</div></div>';
                        });
                        html += '</div>';
                        timelineEl.innerHTML = html;
                    }
                }
            }
        });
    }
};

// ==================== INIT ====================
document.addEventListener('DOMContentLoaded', function() {
    // [DEV TEST] Créer le match test si nécessaire — À RETIRER
    if (typeof DevTestMode !== 'undefined' && DevTestMode.ENABLED) {
        DevTestMode.ensureTestMatch();
    }

    // Init tabs
    TabNav.init();

    // Rendu initial de l'onglet actif
    if (TabNav.currentTab === 'matchStats') {
        MatchStatsView.render();
    }

    // Event listeners pour les tabs principaux
    document.querySelectorAll('.tabs-container .tab-btn').forEach(function(btn) {
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
        var matches = HistoriqueData.getCompletedMatches()
            .slice().sort(function(a, b) { return (b.timestamp || 0) - (a.timestamp || 0); });
        var index = matches.findIndex(function(m) { return m.id === matchId; });
        if (index >= 0) {
            MatchStatsView.render();
            MatchStatsView.selectMatch(index);
        }
        window.history.replaceState({}, '', window.location.pathname);
    }
});
