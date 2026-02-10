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
    },

    /**
     * Clear the current match ID
     */
    clearCurrentMatchId() {
        localStorage.removeItem(this.KEYS.CURRENT_ID);
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
    ENABLED: true,

    // Joueurs de test pour Jen et ses Saints
    HOME_PLAYERS: [
        { prenom: 'Passeur', poste: ['Passeur'] },
        { prenom: 'R4', poste: ['R4'] },
        { prenom: 'Centre', poste: ['Centre'] },
        { prenom: 'Pointu', poste: ['Pointu'] }
    ],

    // Joueurs de test pour l'équipe adverse
    AWAY_PLAYERS: ['Passeur Adv', 'R4 Adv', 'Centre Adv', 'Pointu Adv'],

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
    }
};
