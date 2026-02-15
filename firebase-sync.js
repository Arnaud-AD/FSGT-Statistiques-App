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
            .orderBy('timestamp', 'desc')
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
            container.innerHTML = `
                <div class="firebase-auth-bar">
                    <span class="firebase-auth-email">${user.email}</span>
                    <button class="firebase-auth-btn firebase-auth-signout" id="firebase-signout-btn">
                        Déconnexion
                    </button>
                </div>
            `;
            document.getElementById('firebase-signout-btn')
                .addEventListener('click', () => this.signOut());
        } else {
            container.innerHTML = `
                <div class="firebase-auth-bar">
                    <button class="firebase-auth-btn firebase-auth-signin" id="firebase-signin-btn">
                        🔐 Se connecter
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
