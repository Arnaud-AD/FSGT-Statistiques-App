/**
 * analytics.js — Suivi avec identification par IP hashée (personas)
 *
 * Chaque visiteur est identifié via un hash SHA-256 (salé) de son IP publique.
 * Un persona séquentiel « Visiteur N » est attribué à la 1ʳᵉ visite, puis réutilisé.
 * L'IP n'est JAMAIS stockée en clair : seul le hash est envoyé à Firestore.
 *
 * Collections Firestore :
 *   - analytics                       : events (page_view / action) + champ `persona`
 *   - analytics_personas              : { ipHash, label, number, firstSeen, lastSeen, linkedVisitorIds[] }
 *   - analytics_meta/persona_counter  : { count } — compteur séquentiel atomique
 *
 * Exclusions : admin connecté (attendu via onAuthStateChanged), localhost.
 */

const AppAnalytics = {

    // Salt applicatif : rend plus coûteux un éventuel brute-force de l'IP à partir du hash.
    _SALT: 'fsgt-jen-ses-saints-v1',

    _persona: null,
    _resolvePromise: null,
    _authReadyPromise: null,

    /** Exclure admin connecté et dev local */
    shouldTrack() {
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') return false;
        if (typeof auth !== 'undefined' && auth.currentUser) return false;
        if (typeof db === 'undefined') return false;
        return true;
    },

    /** ID visiteur anonyme persistant (UUID, pas d'IP) — conservé pour compat historique */
    getVisitorId() {
        let id = localStorage.getItem('analytics_visitor_id');
        if (!id) {
            id = crypto.randomUUID();
            localStorage.setItem('analytics_visitor_id', id);
        }
        return id;
    },

    /** Attend la résolution de l'état auth Firebase (ou 1.5 s de sécurité) */
    _waitAuth() {
        if (this._authReadyPromise) return this._authReadyPromise;
        this._authReadyPromise = new Promise(resolve => {
            if (typeof auth === 'undefined') return resolve();
            let done = false;
            const finish = () => { if (!done) { done = true; resolve(); } };
            const unsub = auth.onAuthStateChanged(() => { finish(); try { unsub(); } catch (e) {} });
            setTimeout(finish, 1500);
        });
        return this._authReadyPromise;
    },

    /** Récupère l'IP publique puis renvoie son hash SHA-256 salé (hex). null si échec. */
    async _fetchIpHash() {
        try {
            const res = await fetch('https://api.ipify.org?format=json', { cache: 'no-store' });
            if (!res.ok) return null;
            const { ip } = await res.json();
            if (!ip) return null;
            const enc = new TextEncoder().encode(this._SALT + '|' + ip);
            const hashBuf = await crypto.subtle.digest('SHA-256', enc);
            return Array.from(new Uint8Array(hashBuf))
                .map(b => b.toString(16).padStart(2, '0'))
                .join('');
        } catch (e) {
            return null;
        }
    },

    /** Résout (ou crée) le persona du visiteur. Mémoïsé pour éviter les courses. */
    _resolvePersona() {
        if (this._persona) return Promise.resolve(this._persona);
        if (this._resolvePromise) return this._resolvePromise;

        this._resolvePromise = (async () => {
            const visitorId = this.getVisitorId();

            // 1) Fast path : persona mis en cache en localStorage
            const cachedId = localStorage.getItem('analytics_persona_id');
            if (cachedId) {
                try {
                    const doc = await db.collection('analytics_personas').doc(cachedId).get();
                    if (doc.exists) {
                        this._persona = { id: doc.id, ...doc.data() };
                        return this._persona;
                    }
                } catch (e) {}
            }

            // 2) Chercher persona existant par visitorId (même device, IP changée)
            try {
                const byVisitor = await db.collection('analytics_personas')
                    .where('linkedVisitorIds', 'array-contains', visitorId)
                    .limit(1).get();
                if (!byVisitor.empty) {
                    const d = byVisitor.docs[0];
                    this._persona = { id: d.id, ...d.data() };
                    localStorage.setItem('analytics_persona_id', d.id);
                    return this._persona;
                }
            } catch (e) {}

            // 3) Chercher par ipHash — lier le visitorId courant au persona trouvé
            const ipHash = await this._fetchIpHash();
            if (ipHash) {
                try {
                    const byIp = await db.collection('analytics_personas')
                        .where('ipHash', '==', ipHash).limit(1).get();
                    if (!byIp.empty) {
                        const d = byIp.docs[0];
                        const data = d.data();
                        if (!data.linkedVisitorIds || !data.linkedVisitorIds.includes(visitorId)) {
                            try {
                                await d.ref.update({
                                    linkedVisitorIds: firebase.firestore.FieldValue.arrayUnion(visitorId),
                                    lastSeen: firebase.firestore.FieldValue.serverTimestamp()
                                });
                            } catch (e) {}
                        }
                        this._persona = { id: d.id, ...data };
                        if (!this._persona.linkedVisitorIds) this._persona.linkedVisitorIds = [];
                        if (!this._persona.linkedVisitorIds.includes(visitorId)) this._persona.linkedVisitorIds.push(visitorId);
                        localStorage.setItem('analytics_persona_id', d.id);
                        return this._persona;
                    }
                } catch (e) {}
            }

            // 4) Créer un nouveau persona avec numérotation séquentielle atomique
            try {
                const counterRef = db.collection('analytics_meta').doc('persona_counter');
                const newNumber = await db.runTransaction(async tx => {
                    const snap = await tx.get(counterRef);
                    const curr = snap.exists ? (snap.data().count || 0) : 0;
                    const next = curr + 1;
                    tx.set(counterRef, { count: next });
                    return next;
                });
                const label = 'Visiteur ' + newNumber;
                const docRef = await db.collection('analytics_personas').add({
                    ipHash: ipHash || null,
                    label: label,
                    number: newNumber,
                    firstSeen: firebase.firestore.FieldValue.serverTimestamp(),
                    lastSeen: firebase.firestore.FieldValue.serverTimestamp(),
                    linkedVisitorIds: [visitorId]
                });
                this._persona = {
                    id: docRef.id,
                    ipHash: ipHash || null,
                    label: label,
                    number: newNumber,
                    linkedVisitorIds: [visitorId]
                };
                localStorage.setItem('analytics_persona_id', docRef.id);
                return this._persona;
            } catch (e) {
                return null;
            }
        })();

        return this._resolvePromise;
    },

    /** Tracker une page vue */
    async trackPageView(pageName) {
        try {
            await this._waitAuth();
            if (!this.shouldTrack()) return;
            const persona = await this._resolvePersona();
            const data = {
                type: 'page_view',
                page: pageName,
                visitor: this.getVisitorId(),
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                ua: navigator.userAgent.substring(0, 80)
            };
            if (persona) data.persona = persona.id;
            await db.collection('analytics').add(data);
            if (persona) {
                db.collection('analytics_personas').doc(persona.id).update({
                    lastSeen: firebase.firestore.FieldValue.serverTimestamp()
                }).catch(() => {});
            }
        } catch (e) {
            // Silencieux — le tracking ne doit jamais casser l'app
        }
    },

    /** Tracker une action utilisateur */
    async trackAction(action, details) {
        try {
            await this._waitAuth();
            if (!this.shouldTrack()) return;
            const persona = await this._resolvePersona();
            const data = {
                type: 'action',
                action: action,
                visitor: this.getVisitorId(),
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            };
            if (details) Object.keys(details).forEach(k => { data[k] = details[k]; });
            if (persona) data.persona = persona.id;
            await db.collection('analytics').add(data);
        } catch (e) {}
    }
};
