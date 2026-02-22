/**
 * storage.js - Couche d'abstraction pour le stockage des matchs
 * 
 * Source unique : volleyball_matches (tableau de tous les matchs)
 * Pointeur : volleyball_current_match_id (ID du match actif)
 * 
 * Usage : inclure <script src="storage.js"></script> AVANT le script de la page
 */
const Storage = {

    // ==================== KEYS ====================
    KEYS: {
        MATCHES: 'volleyball_matches',
        CURRENT_ID: 'volleyball_current_match_id',
        PLAYERS: 'volleyball_players',
        // Legacy keys (migration)
        LEGACY_CURRENT: 'volleyball_current_match',
        LEGACY_PLAYED: 'volleyball_played_matches',
        LEGACY_HISTORY: 'volleyball_match_history'
    },

    // ==================== INIT & MIGRATION ====================
    init() {
        // Migrate from legacy system if needed
        this._migrateLegacy();
    },

    _migrateLegacy() {
        const legacyCurrent = localStorage.getItem(this.KEYS.LEGACY_CURRENT);
        const hasNewSystem = localStorage.getItem(this.KEYS.MATCHES);

        if (legacyCurrent && !hasNewSystem) {
            // Old system had a match in progress - migrate it
            try {
                const match = JSON.parse(legacyCurrent);
                if (match && match.id) {
                    match.status = 'in_progress';
                    const matches = [match];
                    localStorage.setItem(this.KEYS.MATCHES, JSON.stringify(matches));
                    localStorage.setItem(this.KEYS.CURRENT_ID, match.id);
                }
            } catch (e) {
                console.warn('Storage: failed to migrate legacy match', e);
            }
        }

        // Migrate completed matches from legacy history
        const legacyHistory = localStorage.getItem(this.KEYS.LEGACY_HISTORY);
        if (legacyHistory) {
            try {
                const history = JSON.parse(legacyHistory);
                if (Array.isArray(history) && history.length > 0) {
                    const matches = this.getAllMatches();
                    for (const oldMatch of history) {
                        if (oldMatch.id && !matches.find(m => m.id === oldMatch.id)) {
                            oldMatch.status = 'completed';
                            matches.push(oldMatch);
                        }
                    }
                    localStorage.setItem(this.KEYS.MATCHES, JSON.stringify(matches));
                }
            } catch (e) {
                console.warn('Storage: failed to migrate legacy history', e);
            }
        }

        // Clean up legacy keys after successful migration
        if (hasNewSystem || legacyCurrent) {
            localStorage.removeItem(this.KEYS.LEGACY_CURRENT);
            localStorage.removeItem(this.KEYS.LEGACY_PLAYED);
            localStorage.removeItem(this.KEYS.LEGACY_HISTORY);
        }
    },

    // ==================== MATCHES CRUD ====================
    
    /**
     * Get all matches
     * @returns {Array} Array of match objects
     */
    getAllMatches() {
        try {
            return JSON.parse(localStorage.getItem(this.KEYS.MATCHES)) || [];
        } catch (e) {
            console.error('Storage: failed to read matches', e);
            return [];
        }
    },

    /**
     * Get a match by ID
     * @param {string} id - Match ID
     * @returns {Object|null} Match object or null
     */
    getMatchById(id) {
        const matches = this.getAllMatches();
        return matches.find(m => m.id === id) || null;
    },

    /**
     * Save (insert or update) a match in the collection
     * @param {Object} match - Match object (must have .id)
     */
    saveMatch(match) {
        if (!match || !match.id) {
            console.error('Storage: cannot save match without id');
            return;
        }
        const matches = this.getAllMatches();
        const index = matches.findIndex(m => m.id === match.id);
        if (index >= 0) {
            matches[index] = match;
        } else {
            matches.push(match);
        }
        localStorage.setItem(this.KEYS.MATCHES, JSON.stringify(matches));
        // Sync Firebase (non-bloquant)
        if (typeof FirebaseSync !== 'undefined' && FirebaseSync.isConfigured() && FirebaseSync.isAdmin()) {
            FirebaseSync.saveMatchAny(match).catch(() => {});
        }
    },

    /**
     * Delete a match from the collection
     * @param {string} id - Match ID
     */
    deleteMatch(id) {
        const matches = this.getAllMatches();
        const filtered = matches.filter(m => m.id !== id);
        localStorage.setItem(this.KEYS.MATCHES, JSON.stringify(filtered));
        // Clear current ID if it was this match
        if (this.getCurrentMatchId() === id) {
            this.clearCurrentMatchId();
        }
        // Sync Firebase (non-bloquant)
        if (typeof FirebaseSync !== 'undefined' && FirebaseSync.isConfigured() && FirebaseSync.isAdmin()) {
            FirebaseSync.deleteMatch(id).catch(() => {});
        }
    },

    // ==================== CURRENT MATCH ====================

    /**
     * Get the current match ID
     * @returns {string|null}
     */
    getCurrentMatchId() {
        return localStorage.getItem(this.KEYS.CURRENT_ID) || null;
    },

    /**
     * Set the current match ID
     * @param {string} id
     */
    setCurrentMatchId(id) {
        localStorage.setItem(this.KEYS.CURRENT_ID, id);
        // Sync Firebase (non-bloquant)
        if (typeof FirebaseSync !== 'undefined' && FirebaseSync.isConfigured() && FirebaseSync.isAdmin()) {
            FirebaseSync.saveCurrentMatchId(id).catch(() => {});
        }
    },

    /**
     * Clear the current match ID
     */
    clearCurrentMatchId() {
        localStorage.removeItem(this.KEYS.CURRENT_ID);
        // Sync Firebase (non-bloquant)
        if (typeof FirebaseSync !== 'undefined' && FirebaseSync.isConfigured() && FirebaseSync.isAdmin()) {
            FirebaseSync.saveCurrentMatchId(null).catch(() => {});
        }
    },

    /**
     * Get the current match object (convenience)
     * @returns {Object|null}
     */
    getCurrentMatch() {
        const id = this.getCurrentMatchId();
        if (!id) return null;
        return this.getMatchById(id);
    },

    /**
     * Save the current match (convenience - updates in the matches collection)
     * @param {Object} match - Match object
     */
    saveCurrentMatch(match) {
        this.saveMatch(match);
    },

    // ==================== CANCEL / CLEANUP ====================

    /**
     * Cancel the current match setup.
     * - If match has no completed sets and no points: delete it entirely
     * - If match has data: keep it as "in_progress", just clear current ID
     */
    cancelCurrentMatch() {
        const match = this.getCurrentMatch();
        if (match) {
            const hasData = this._matchHasData(match);
            if (!hasData) {
                // No meaningful data - delete the match entirely
                this.deleteMatch(match.id);
            }
            // If has data, keep it in volleyball_matches (will show as "en cours")
        }
        this.clearCurrentMatchId();
    },

    /**
     * Check if a match has meaningful data (completed sets or points in progress)
     */
    _matchHasData(match) {
        if (!match.sets || match.sets.length === 0) return false;
        return match.sets.some(set => 
            set.completed || (set.points && set.points.length > 0)
        );
    },

    // ==================== RESUME ====================

    /**
     * Determine where to redirect to resume a match
     * @param {Object} match - Match object
     * @returns {string} URL to redirect to
     */
    getResumeTarget(match) {
        if (!match) return 'nouveau-match.html';

        // No players selected yet
        if (!match.players || match.players.length === 0) {
            return 'match-config.html';
        }

        // No adverse players
        if (!match.adversePlayers || match.adversePlayers.length === 0) {
            return 'match-adverse.html';
        }

        // No sets at all
        if (!match.sets || match.sets.length === 0) {
            return 'match-set-composition.html';
        }

        // Check last set
        const lastSet = match.sets[match.sets.length - 1];

        if (lastSet.completed) {
            // Last set is done - need to set up next set
            return 'match-set-composition.html';
        }

        // Last set not completed - check if it's configured
        const hasLineup = lastSet.homeLineup && lastSet.awayLineup &&
            Object.values(lastSet.homeLineup).filter(v => v).length === 4 &&
            Object.values(lastSet.awayLineup).filter(v => v).length === 4;

        if (!hasLineup) {
            return 'match-set-composition.html';
        }

        // Has lineup - check if configured (cameraSide, servingTeam set)
        if (lastSet.isFilmed === undefined) {
            return 'match-set-config.html';
        }

        // Fully configured - go to live
        return 'match-live.html';
    },

    // ==================== MATCH STATUS HELPERS ====================

    /**
     * Check if a match is over (someone has 3 sets)
     * @param {Object} match
     * @returns {boolean}
     */
    isMatchOver(match) {
        const result = this.getSetScore(match);
        return result.homeWins >= 3 || result.awayWins >= 3;
    },

    /**
     * Get the set score for a match
     * @param {Object} match
     * @returns {{ homeWins: number, awayWins: number }}
     */
    getSetScore(match) {
        if (!match || !match.sets) return { homeWins: 0, awayWins: 0 };
        const completed = match.sets.filter(s => s.completed);
        return {
            homeWins: completed.filter(s => s.winner === 'home').length,
            awayWins: completed.filter(s => s.winner === 'away').length
        };
    },

    /**
     * Determine if the current set is a tie-break (5th set when 2-2)
     * @param {Object} match
     * @returns {boolean}
     */
    isTieBreak(match) {
        const score = this.getSetScore(match);
        return score.homeWins === 2 && score.awayWins === 2;
    },

    /**
     * Get the target score for the current set
     * @param {Object} match
     * @returns {number} 25 for normal sets, 15 for tie-break
     */
    getTargetScore(match) {
        return this.isTieBreak(match) ? 15 : 25;
    },

    /**
     * Finalize a match as completed
     * @param {Object} match
     * @param {string} endReason - 'normal' | 'interruption'
     */
    finalizeMatch(match, endReason = 'normal') {
        // V20.27 : Nettoyer les caches _undoStack des points (inutiles après finalisation)
        if (match.sets) {
            for (const set of match.sets) {
                if (set.points) {
                    for (const point of set.points) {
                        delete point._undoStack;
                    }
                }
            }
        }

        const setScore = this.getSetScore(match);

        match.status = 'completed';
        match.completedAt = Date.now();
        match.endReason = endReason;
        match.setsWon = setScore.homeWins;
        match.setsLost = setScore.awayWins;

        // Determine winner
        if (setScore.homeWins > setScore.awayWins) {
            match.result = 'win';
        } else if (setScore.awayWins > setScore.homeWins) {
            match.result = 'loss';
        } else {
            // Tie in sets - compare cumulative points
            const totals = this.getCumulativePoints(match);
            if (totals.home > totals.away) {
                match.result = 'win';
            } else if (totals.away > totals.home) {
                match.result = 'loss';
            } else {
                // Still tied - should not happen (decisive point rule)
                match.result = 'draw';
            }
        }

        this.saveMatch(match);
        this.clearCurrentMatchId();
    },

    /**
     * Get cumulative points across all sets
     * @param {Object} match
     * @returns {{ home: number, away: number }}
     */
    getCumulativePoints(match) {
        let home = 0, away = 0;
        if (match && match.sets) {
            for (const set of match.sets) {
                if (set.completed) {
                    home += set.finalHomeScore || 0;
                    away += set.finalAwayScore || 0;
                } else {
                    // Set not completed (interruption) - use current score
                    home += set.homeScore || 0;
                    away += set.awayScore || 0;
                }
            }
        }
        return { home, away };
    },

    // ==================== PLAYERS ====================

    /**
     * Get the team roster
     * @returns {Array}
     */
    getPlayers() {
        try {
            return JSON.parse(localStorage.getItem(this.KEYS.PLAYERS)) || [];
        } catch (e) {
            return [];
        }
    }
};

// Auto-initialize on load
Storage.init();

// =======================================================================
// MODE TEST / DÉVELOPPEMENT — À RETIRER UNE FOIS L'APP TERMINÉE
// Permet d'auto-remplir les joueurs et compositions pour tester rapidement
// sans devoir tout recréer manuellement après un reset localStorage.
// =======================================================================
const DevTestMode = {
    // Mettre à true pour activer l'auto-remplissage sur chaque page
    ENABLED: false,

    // Joueurs de test pour Jen et ses Saints
    HOME_PLAYERS: [
        { prenom: 'Passeur', poste: ['Passeur'] },
        { prenom: 'R4', poste: ['R4'] },
        { prenom: 'Centre', poste: ['Centre'] },
        { prenom: 'Pointu', poste: ['Pointu'] }
    ],

    // Joueurs de test pour l'équipe adverse
    AWAY_PLAYERS: ['Passeur Adv', 'R4 Adv', 'Centre Adv', 'Pointu Adv'],

    // Config bloqueurs de test — À RETIRER
    // Pour Red Hot Sucy Pépère : Passeur adverse en bloqueur principal
    BLOCKER_CONFIG: {
        home: { blockerRight: 'Pointu', primaryBlocker: 'right', centreAttack: false },
        away: { blockerRight: 'Passeur', primaryBlocker: 'right', centreAttack: true }
    },

    // Config set de test — À RETIRER
    // Sucy côté caméra (away), Jen au service, vidéo YouTube du match
    SET_CONFIG: {
        cameraSide: 'away',
        servingTeam: 'home',
        youtubeUrl: 'https://www.youtube.com/watch?v=_5YHPt3W6nY&list=PLNR0tSMfwXlVSgtzXMopLcYBGQBR2qZa8'
    },

    /**
     * Crée le roster de l'équipe si vide (pour equipe.html et match-config.html)
     * @returns {boolean} true si le roster a été créé
     */
    ensureHomePlayers() {
        if (!this.ENABLED) return false;
        const existing = Storage.getPlayers();
        if (existing.length > 0) return false;
        localStorage.setItem(Storage.KEYS.PLAYERS, JSON.stringify(this.HOME_PLAYERS));
        console.log('[DEV TEST] Auto-création du roster Jen et ses Saints');
        return true;
    },

    /**
     * Auto-remplit les joueurs adverses dans le match courant (pour match-adverse.html)
     * @returns {string[]|null} les joueurs adverses ou null si pas d'action
     */
    ensureAwayPlayers() {
        if (!this.ENABLED) return null;
        const match = Storage.getCurrentMatch();
        if (!match) return null;
        if (match.adversePlayers && match.adversePlayers.length > 0) return null;
        match.adversePlayers = [...this.AWAY_PLAYERS];
        Storage.saveCurrentMatch(match);
        console.log('[DEV TEST] Auto-création des joueurs adverses');
        return this.AWAY_PLAYERS;
    },

    /**
     * Auto-place les joueurs sur le terrain (pour match-set-composition.html)
     * Retourne les positions home et away pré-remplies
     * @returns {{ home: Object, away: Object }|null}
     */
    getAutoLineup() {
        if (!this.ENABLED) return null;
        const match = Storage.getCurrentMatch();
        if (!match) return null;

        const home = {};
        const away = {};
        const homePlayers = match.players || [];
        const awayPlayers = match.adversePlayers || [];

        // Position 1 = Passeur, 2 = R4, 3 = Centre, 4 = Pointu
        if (homePlayers.length >= 4) {
            // Trouver le joueur pour chaque poste
            const findByPoste = (poste) => homePlayers.find(p => {
                const postes = Array.isArray(p.poste) ? p.poste : [p.poste];
                return postes.includes(poste);
            });
            const passeur = findByPoste('Passeur');
            const r4 = findByPoste('R4');
            const centre = findByPoste('Centre');
            const pointu = findByPoste('Pointu');
            if (passeur) home[1] = passeur.prenom;
            if (r4) home[2] = r4.prenom;
            if (centre) home[3] = centre.prenom;
            if (pointu) home[4] = pointu.prenom;
        }

        if (awayPlayers.length >= 4) {
            // Adversaires : index 0=Passeur(pos4), 1=R4(pos1), 2=Centre(pos2), 3=Pointu(pos3)
            away[4] = awayPlayers[0]; // Passeur Adv
            away[1] = awayPlayers[1]; // R4 Adv
            away[2] = awayPlayers[2]; // Centre Adv
            away[3] = awayPlayers[3]; // Pointu Adv
        }

        const allHomeSet = Object.values(home).filter(v => v).length === 4;
        const allAwaySet = Object.values(away).filter(v => v).length === 4;

        if (allHomeSet && allAwaySet) {
            console.log('[DEV TEST] Auto-placement des joueurs sur le terrain');
            return { home, away };
        }
        return null;
    },

    /**
     * Retourne la config bloqueurs de test (pour match-set-composition.html)
     * @returns {{ home: { blockerRight, primaryBlocker }, away: { blockerRight, primaryBlocker } }|null}
     */
    getBlockerConfig() {
        if (!this.ENABLED) return null;
        console.log('[DEV TEST] Auto-configuration des bloqueurs');
        return this.BLOCKER_CONFIG;
    },

    /**
     * Retourne la config set de test (pour match-set-config.html)
     * @returns {{ cameraSide, servingTeam, youtubeUrl }|null}
     */
    getSetConfig() {
        if (!this.ENABLED) return null;
        console.log('[DEV TEST] Auto-configuration du set (caméra, service, YouTube)');
        return this.SET_CONFIG;
    },

    // ==================== MATCH TEST HISTORIQUE — À RETIRER ====================

    /**
     * [DEV TEST] Crée un match test complet pour tester historique.html — À RETIRER
     * Match "Equipe Test vs Jen et ses Saints" avec 4 sets et stats aléatoires.
     * Scores : S1 20-25, S2 12-25, S3 25-23, S4 25-22 → Résultat 3-1 victoire Jen.
     * Génère des séries de points (rallies) cohérentes avec les scores.
     */
    ensureTestMatch() {
        if (!this.ENABLED) return false;

        // Vérifier si le match test existe déjà
        var matches = Storage.getAllMatches();
        var exists = matches.some(function(m) { return m.opponent === 'Equipe Test'; });
        if (exists) return false;

        var matchId = 'test-match-' + Date.now();
        var homePlayers = ['Alexandre', 'Arnaud', 'Jennifer', 'Antoine'];
        var awayPlayers = ['TestPasseur', 'TestR4', 'TestCentre', 'TestPointu'];

        // Scores des 4 sets (home = Jen et ses Saints, away = Equipe Test)
        // User: S1 20-25, S2 12-25, S3 25-23, S4 25-22 → Résultat 2-2
        var setScores = [
            { home: 20, away: 25 },  // S1 : Jen perd
            { home: 12, away: 25 },  // S2 : Jen perd
            { home: 25, away: 23 },  // S3 : Jen gagne
            { home: 25, away: 22 }   // S4 : Jen gagne
        ];

        var sets = [];

        for (var si = 0; si < setScores.length; si++) {
            var sc = setScores[si];
            var points = this._generatePoints(sc.home, sc.away);
            var stats = this._generateSetStats(homePlayers, awayPlayers, sc.home, sc.away);

            sets.push({
                number: si + 1,
                homeLineup: { 1: 'Alexandre', 2: 'Arnaud', 3: 'Jennifer', 4: 'Antoine' },
                awayLineup: { 1: 'TestR4', 2: 'TestCentre', 3: 'TestPointu', 4: 'TestPasseur' },
                cameraSide: 'away',
                initialServingTeam: si % 2 === 0 ? 'home' : 'away',
                homeScore: sc.home,
                awayScore: sc.away,
                finalHomeScore: sc.home,
                finalAwayScore: sc.away,
                completed: true,
                winner: sc.home > sc.away ? 'home' : 'away',
                points: points,
                stats: stats
            });
        }

        var setsWon = sets.filter(function(s) { return s.winner === 'home'; }).length;
        var setsLost = sets.filter(function(s) { return s.winner === 'away'; }).length;
        var result = setsWon > setsLost ? 'win' : (setsLost > setsWon ? 'loss' : 'draw');

        var match = {
            id: matchId,
            type: 'championship',
            opponent: 'Equipe Test',
            players: homePlayers.map(function(p) { return { prenom: p }; }),
            adversePlayers: awayPlayers,
            status: 'completed',
            sets: sets,
            result: result,
            setsWon: setsWon,
            setsLost: setsLost,
            timestamp: Date.now() - 86400000 // Hier
        };

        Storage.saveMatch(match);
        console.log('[DEV TEST] Match test créé : Jen ' + setsWon + '-' + setsLost + ' Equipe Test');
        return true;
    },

    /**
     * [DEV TEST] Génère des points (rallies) cohérents avec le score final — À RETIRER
     * Simule une alternance réaliste de séries de points.
     */
    _generatePoints(homeTotal, awayTotal) {
        var points = [];
        var homeScore = 0;
        var awayScore = 0;
        var servingTeam = 'home';
        var homeServers = ['Alexandre', 'Arnaud', 'Jennifer', 'Antoine'];
        var awayServers = ['TestPasseur', 'TestR4', 'TestCentre', 'TestPointu'];
        var homeServerIdx = 0;
        var awayServerIdx = 0;

        while (homeScore < homeTotal || awayScore < awayTotal) {
            var homeNeeds = homeTotal - homeScore;
            var awayNeeds = awayTotal - awayScore;
            var scorer;

            if (homeNeeds <= 0) {
                scorer = 'away';
            } else if (awayNeeds <= 0) {
                scorer = 'home';
            } else {
                // Probabilité basée sur les points restants + bruit pour séries réalistes
                var homeProb = homeNeeds / (homeNeeds + awayNeeds);
                homeProb += (Math.random() - 0.5) * 0.3;
                homeProb = Math.max(0.1, Math.min(0.9, homeProb));
                scorer = Math.random() < homeProb ? 'home' : 'away';
            }

            // Le serveur actuel
            var server = servingTeam === 'home'
                ? homeServers[homeServerIdx % homeServers.length]
                : awayServers[awayServerIdx % awayServers.length];

            if (scorer === 'home') homeScore++;
            else awayScore++;

            points.push({
                rally: [],
                homeScore: homeScore,
                awayScore: awayScore,
                servingTeam: servingTeam,
                server: server,
                timestamp: Date.now() - Math.floor(Math.random() * 3600000)
            });

            // Le service change quand l'équipe en réception marque (side out)
            if (scorer !== servingTeam) {
                servingTeam = scorer;
                if (scorer === 'home') homeServerIdx++;
                else awayServerIdx++;
            }
        }

        return points;
    },

    /**
     * [DEV TEST] Génère des stats réalistes pour un set — À RETIRER
     * Distribue aléatoirement des stats proportionnelles aux scores.
     */
    _generateSetStats(homePlayers, awayPlayers, homeScore, awayScore) {
        var stats = { home: {}, away: {} };

        function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
        function distributeAmong(total, n) {
            var arr = [];
            var remaining = total;
            for (var i = 0; i < n - 1; i++) {
                var max = Math.min(remaining, Math.ceil(total / n) + 2);
                var val = Math.min(remaining, randInt(0, max));
                arr.push(val);
                remaining -= val;
            }
            arr.push(remaining);
            return arr;
        }

        function generatePlayerStats(totalPoints, isWinner) {
            var ps = {
                service:   { tot: 0, ace: 0, splus: 0, fser: 0, recSumAdv: 0, recCountAdv: 0 },
                reception: { tot: 0, r4: 0, r3: 0, r2: 0, r1: 0, frec: 0 },
                attack:    { tot: 0, attplus: 0, attminus: 0, bp: 0, fatt: 0 },
                defense:   { tot: 0, defplus: 0, defminus: 0, fdef: 0 },
                block:     { tot: 0, blcplus: 0, blcminus: 0, fblc: 0 }
            };

            // Service
            ps.service.tot = randInt(2, 8);
            ps.service.ace = randInt(0, Math.min(2, ps.service.tot));
            ps.service.splus = randInt(0, Math.min(2, ps.service.tot - ps.service.ace));
            ps.service.fser = randInt(0, Math.min(2, ps.service.tot - ps.service.ace - ps.service.splus));
            var recAdv = ps.service.tot - ps.service.ace - ps.service.fser;
            ps.service.recCountAdv = recAdv;
            ps.service.recSumAdv = recAdv * randInt(1, 4);

            // Réception
            ps.reception.tot = randInt(2, 8);
            var recRemaining = ps.reception.tot;
            ps.reception.r4 = randInt(0, Math.min(3, recRemaining));
            recRemaining -= ps.reception.r4;
            ps.reception.r3 = randInt(0, Math.min(3, recRemaining));
            recRemaining -= ps.reception.r3;
            ps.reception.r2 = randInt(0, Math.min(2, recRemaining));
            recRemaining -= ps.reception.r2;
            ps.reception.r1 = randInt(0, Math.min(2, recRemaining));
            recRemaining -= ps.reception.r1;
            ps.reception.frec = recRemaining;

            // Attaque
            ps.attack.tot = randInt(3, 10);
            ps.attack.attplus = randInt(1, Math.min(5, ps.attack.tot));
            var attRemaining = ps.attack.tot - ps.attack.attplus;
            ps.attack.attminus = randInt(0, Math.min(3, attRemaining));
            attRemaining -= ps.attack.attminus;
            ps.attack.bp = randInt(0, Math.min(2, attRemaining));
            attRemaining -= ps.attack.bp;
            ps.attack.fatt = attRemaining;

            // Défense
            ps.defense.tot = randInt(1, 6);
            ps.defense.defplus = randInt(0, Math.min(3, ps.defense.tot));
            var defRemaining = ps.defense.tot - ps.defense.defplus;
            ps.defense.defminus = randInt(0, defRemaining);
            ps.defense.fdef = defRemaining - ps.defense.defminus;

            // Bloc
            ps.block.tot = randInt(0, 4);
            ps.block.blcplus = randInt(0, Math.min(2, ps.block.tot));
            var blcRemaining = ps.block.tot - ps.block.blcplus;
            ps.block.blcminus = randInt(0, blcRemaining);
            ps.block.fblc = blcRemaining - ps.block.blcminus;

            return ps;
        }

        // Générer stats pour chaque joueur home
        homePlayers.forEach(function(name) {
            stats.home[name] = generatePlayerStats(homeScore, homeScore > awayScore);
        });

        // Générer stats pour chaque joueur away
        awayPlayers.forEach(function(name) {
            stats.away[name] = generatePlayerStats(awayScore, awayScore > homeScore);
        });

        return stats;
    }
};
