/**
 * Firebase Sync — FSGT Statistiques App
 *
 * Gère la synchronisation des matchs entre localStorage et Firestore,
 * l'authentification Google, et l'UI auth (bouton connexion).
 *
 * Dépendances : firebase-config.js (doit être chargé avant)
 */

// ============================================================
// FirebaseSync — Synchronisation Firestore
// ============================================================

const FirebaseSync = {

    /** Collection Firestore pour les matchs */
    COLLECTION: 'matches',

    /**
     * Vérifie si Firebase est correctement configuré
     */
    isConfigured() {
        return typeof firebase !== 'undefined'
            && typeof db !== 'undefined'
            && typeof firebaseConfig !== 'undefined'
            && firebaseConfig.apiKey !== 'REMPLACER_PAR_VOTRE_API_KEY';
    },

    /**
     * Upload un match finalisé vers Firestore
     * @param {Object} match - Le match complet (status === 'completed')
     * @returns {Promise<void>}
     */
    async uploadMatch(match) {
        if (!this.isConfigured()) return;

        const user = auth.currentUser;
        if (!user) {
            console.warn('[FirebaseSync] Non authentifié — match sauvé localement uniquement');
            return;
        }

        // Ajouter les métadonnées de sync
        const matchData = {
            ...match,
            syncedAt: firebase.firestore.FieldValue.serverTimestamp(),
            syncedBy: user.uid
        };

        await db.collection(this.COLLECTION).doc(match.id).set(matchData);
        console.log('[FirebaseSync] Match uploadé :', match.id);
    },

    /**
     * Charger tous les matchs completed depuis Firestore
     * @returns {Promise<Array>} Liste des matchs
     */
    async getCompletedMatches() {
        if (!this.isConfigured()) return [];

        const snapshot = await db.collection(this.COLLECTION)
            .where('status', '==', 'completed')
            .get();

        return snapshot.docs.map(doc => {
            const data = doc.data();
            // Convertir les Firestore Timestamps en nombres
            if (data.syncedAt && data.syncedAt.toMillis) {
                data.syncedAt = data.syncedAt.toMillis();
            }
            return data;
        });
    },

    /**
     * Supprimer un match de Firestore
     * @param {string} matchId
     * @returns {Promise<void>}
     */
    async deleteMatch(matchId) {
        if (!this.isConfigured()) return;

        const user = auth.currentUser;
        if (!user) {
            console.warn('[FirebaseSync] Non authentifié — suppression Firestore ignorée');
            return;
        }

        await db.collection(this.COLLECTION).doc(matchId).delete();
        console.log('[FirebaseSync] Match supprimé de Firestore :', matchId);
    },

    /**
     * Merger les matchs locaux et Firebase
     * Firebase est prioritaire si même ID (données plus récentes / partagées)
     * @param {Array} localMatches
     * @param {Array} firebaseMatches
     * @returns {Array} Matchs fusionnés
     */
    mergeMatches(localMatches, firebaseMatches) {
        const merged = new Map();

        // Ajouter les matchs locaux
        localMatches.forEach(m => merged.set(m.id, m));

        // Les matchs Firebase écrasent les locaux (source de vérité partagée)
        firebaseMatches.forEach(m => merged.set(m.id, m));

        // Trier par date décroissante
        return Array.from(merged.values())
            .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    },

    /**
     * Migration one-shot : upload tous les matchs locaux vers Firebase
     * Appelé une seule fois après la première authentification
     * @returns {Promise<number>} Nombre de matchs migrés
     */
    async migrateLocalMatches() {
        if (!this.isConfigured()) return 0;

        const user = auth.currentUser;
        if (!user) return 0;

        const localMatches = Storage.getAllMatches()
            .filter(m => m.status === 'completed');

        if (localMatches.length === 0) return 0;

        // Vérifier quels matchs existent déjà dans Firebase
        const existingIds = new Set();
        const snapshot = await db.collection(this.COLLECTION).get();
        snapshot.docs.forEach(doc => existingIds.add(doc.id));

        let migrated = 0;
        for (const match of localMatches) {
            if (!existingIds.has(match.id)) {
                await this.uploadMatch(match);
                migrated++;
            }
        }

        console.log(`[FirebaseSync] Migration : ${migrated}/${localMatches.length} matchs uploadés`);
        return migrated;
    },

    // ==================== ROSTER SYNC ====================

    /**
     * Sauvegarder le roster dans Firestore
     * @param {Array} players - Liste des noms de joueurs
     */
    async saveRoster(players) {
        if (!this.isConfigured() || !auth.currentUser) return;
        await db.collection('config').doc('roster').set({
            players: players,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
    },

    /**
     * Charger le roster depuis Firestore
     * @returns {Promise<Array|null>} Liste des joueurs ou null
     */
    async getRoster() {
        if (!this.isConfigured()) return null;
        const doc = await db.collection('config').doc('roster').get();
        if (doc.exists) {
            return doc.data().players || [];
        }
        return null;
    },

    // ==================== MATCH IN PROGRESS SYNC ====================

    /**
     * Sauvegarder un match (tous statuts) vers Firestore
     * @param {Object} match
     */
    async saveMatchAny(match) {
        if (!this.isConfigured() || !auth.currentUser) return;
        const matchData = {
            ...match,
            syncedAt: firebase.firestore.FieldValue.serverTimestamp(),
            syncedBy: auth.currentUser.uid
        };
        await db.collection(this.COLLECTION).doc(match.id).set(matchData);
    },

    /**
     * Charger tous les matchs depuis Firestore (tous statuts)
     * @returns {Promise<Array>}
     */
    async getAllMatches() {
        if (!this.isConfigured()) return [];
        const snapshot = await db.collection(this.COLLECTION).get();
        return snapshot.docs.map(doc => {
            const data = doc.data();
            if (data.syncedAt && data.syncedAt.toMillis) {
                data.syncedAt = data.syncedAt.toMillis();
            }
            return data;
        });
    },

    // ==================== PASS GRIDS SYNC ====================

    /**
     * Sauvegarder les grilles de qualité de passe dans Firestore
     * @param {Object} grids - Les 9 grilles (3 zones x 3 contextes)
     */
    async savePassGrids(grids) {
        if (!this.isConfigured() || !auth.currentUser) return;
        await db.collection('config').doc('passGrids').set({
            grids: grids,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
    },

    /**
     * Charger les grilles de qualité de passe depuis Firestore
     * @returns {Promise<Object|null>} Les grilles ou null
     */
    async getPassGrids() {
        if (!this.isConfigured()) return null;
        const doc = await db.collection('config').doc('passGrids').get();
        if (doc.exists) {
            return doc.data().grids || null;
        }
        return null;
    },

    // ==================== STATE SYNC ====================

    /**
     * Sauvegarder le current match ID dans Firestore
     * @param {string|null} matchId
     */
    async saveCurrentMatchId(matchId) {
        if (!this.isConfigured() || !auth.currentUser) return;
        await db.collection('config').doc('state').set({
            currentMatchId: matchId,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
    },

    /**
     * Charger le current match ID depuis Firestore
     * @returns {Promise<string|null>}
     */
    async getCurrentMatchId() {
        if (!this.isConfigured()) return null;
        const doc = await db.collection('config').doc('state').get();
        if (doc.exists) {
            return doc.data().currentMatchId || null;
        }
        return null;
    },

    // ==================== FULL SYNC ====================

    /**
     * Sync complète : pousse toutes les données localStorage vers Firebase
     * Appelé après connexion pour garantir que Firebase a les données à jour
     */
    async pushAll() {
        if (!this.isConfigured() || !auth.currentUser) return;

        // Roster
        const players = Storage.getPlayers();
        if (players.length > 0) {
            await this.saveRoster(players);
        }

        // Tous les matchs
        const matches = Storage.getAllMatches();
        for (const match of matches) {
            await this.saveMatchAny(match);
        }

        // Current match ID
        const currentId = Storage.getCurrentMatchId();
        await this.saveCurrentMatchId(currentId);

        // Pass grids — ne jamais ecraser Firebase avec des grilles vides/default
        const passGrids = localStorage.getItem('volleyball_pass_grids');
        if (passGrids) {
            const parsed = JSON.parse(passGrids);
            // Verifier qu'au moins une cellule n'est pas P1 (valeur 1)
            const hasData = Object.values(parsed).some(zone =>
                zone && Object.values(zone).some(ctx =>
                    Array.isArray(ctx) && ctx.some(row =>
                        Array.isArray(row) && row.some(v => v !== 1)
                    )
                )
            );
            if (hasData) {
                await this.savePassGrids(parsed);
            }
        }

        console.log('[FirebaseSync] Push complet : roster, matchs, state, passGrids');
    },

    /**
     * Sync complète : charge toutes les données Firebase → localStorage
     * Appelé au chargement pour récupérer les données partagées
     */
    async pullAll() {
        if (!this.isConfigured()) return;

        // Roster
        const roster = await this.getRoster();
        if (roster && roster.length > 0) {
            localStorage.setItem(Storage.KEYS.PLAYERS, JSON.stringify(roster));
        }

        // Tous les matchs : merge Firebase + local
        const remoteMatches = await this.getAllMatches();
        if (remoteMatches.length > 0) {
            const localMatches = Storage.getAllMatches();
            const merged = this.mergeMatches(localMatches, remoteMatches);
            localStorage.setItem(Storage.KEYS.MATCHES, JSON.stringify(merged));
        }

        // Current match ID
        const remoteId = await this.getCurrentMatchId();
        if (remoteId) {
            localStorage.setItem(Storage.KEYS.CURRENT_ID, remoteId);
        }

        // Pass grids
        const passGrids = await this.getPassGrids();
        if (passGrids) {
            localStorage.setItem('volleyball_pass_grids', JSON.stringify(passGrids));
        }

        console.log('[FirebaseSync] Pull complet : roster, matchs, state, passGrids');
    }
};


// ============================================================
// FirebaseAuthUI — Interface d'authentification
// ============================================================

const FirebaseAuthUI = {

    /** Conteneur pour le bouton auth (ID dans le HTML) */
    CONTAINER_ID: 'firebase-auth-container',

    /**
     * Initialise l'UI d'authentification
     * Le bouton n'apparaît que si ?admin est dans l'URL (mode admin caché)
     */
    init() {
        if (!FirebaseSync.isConfigured()) return;

        const container = document.getElementById(this.CONTAINER_ID);
        if (!container) return;

        // Mode admin : le bouton n'apparaît que si ?admin est dans l'URL
        const isAdminMode = new URLSearchParams(window.location.search).has('admin');

        // Écouter les changements d'état auth
        auth.onAuthStateChanged(user => {
            if (isAdminMode || user) {
                // Afficher si mode admin OU si déjà connecté (pour pouvoir se déconnecter)
                this._render(container, user);
            } else {
                // Pas de mode admin et pas connecté → cacher le bouton
                container.innerHTML = '';
            }
            // Dispatch un événement custom pour que les pages puissent réagir
            window.dispatchEvent(new CustomEvent('firebase-auth-changed', { detail: { user } }));
        });
    },

    /**
     * Rend le bouton auth (connecté / déconnecté)
     * @param {HTMLElement} container
     * @param {Object|null} user - L'utilisateur Firebase ou null
     */
    _render(container, user) {
        if (user) {
            const photoURL = user.photoURL || '';
            const initial = (user.displayName || user.email || '?')[0].toUpperCase();
            const avatarImg = photoURL
                ? `<img src="${photoURL}" alt="" class="firebase-auth-avatar" referrerpolicy="no-referrer">`
                : `<div class="firebase-auth-avatar" style="display:flex;align-items:center;justify-content:center;background:#e8eaed;font-size:13px;font-weight:500;color:#5f6368;">${initial}</div>`;
            container.innerHTML = `
                <div class="firebase-auth-bar">
                    <button class="firebase-auth-btn firebase-auth-signout" id="firebase-signout-btn">
                        ${avatarImg}
                        Déconnexion
                    </button>
                </div>
            `;
            document.getElementById('firebase-signout-btn')
                .addEventListener('click', () => this.signOut());
        } else {
            container.innerHTML = `
                <div class="firebase-auth-bar">
                    <button class="firebase-auth-btn" id="firebase-signin-btn">
                        <svg width="14" height="14" viewBox="0 0 48 48"><path fill="#4285F4" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#34A853" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59A14.5 14.5 0 019.5 24c0-1.59.28-3.13.76-4.59l-7.98-6.19A23.99 23.99 0 000 24c0 3.77.87 7.34 2.44 10.51l8.09-5.92z"/><path fill="#EA4335" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
                        Connexion
                    </button>
                </div>
            `;
            document.getElementById('firebase-signin-btn')
                .addEventListener('click', () => this.signIn());
        }
    },

    /**
     * Connexion avec Google
     */
    async signIn() {
        if (!FirebaseSync.isConfigured()) return;

        try {
            const provider = new firebase.auth.GoogleAuthProvider();
            await auth.signInWithPopup(provider);
        } catch (err) {
            if (err.code !== 'auth/popup-closed-by-user') {
                console.error('[FirebaseAuth] Erreur connexion :', err);
                alert('Erreur de connexion : ' + err.message);
            }
        }
    },

    /**
     * Déconnexion
     */
    async signOut() {
        if (!FirebaseSync.isConfigured()) return;

        try {
            await auth.signOut();
        } catch (err) {
            console.error('[FirebaseAuth] Erreur déconnexion :', err);
        }
    }
};
