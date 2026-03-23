/**
 * analytics.js — Suivi anonymisé des visites et actions
 *
 * Écrit dans Firestore collection 'analytics'.
 * Exclut : admin connecté, localhost.
 * Données : page, action, visitorId (UUID aléatoire), timestamp, userAgent tronqué.
 * Aucune IP, aucun email, aucune donnée personnelle.
 */

const AppAnalytics = {

    /** Exclure admin connecté et dev local */
    shouldTrack() {
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') return false;
        if (typeof auth !== 'undefined' && auth.currentUser) return false;
        if (typeof db === 'undefined') return false;
        return true;
    },

    /** ID visiteur anonyme persistant (UUID, pas d'IP) */
    getVisitorId() {
        let id = localStorage.getItem('analytics_visitor_id');
        if (!id) {
            id = crypto.randomUUID();
            localStorage.setItem('analytics_visitor_id', id);
        }
        return id;
    },

    /** Tracker une page vue */
    trackPageView(pageName) {
        if (!this.shouldTrack()) return;
        try {
            db.collection('analytics').add({
                type: 'page_view',
                page: pageName,
                visitor: this.getVisitorId(),
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                ua: navigator.userAgent.substring(0, 80)
            });
        } catch (e) {
            // Silencieux — le tracking ne doit jamais casser l'app
        }
    },

    /** Tracker une action utilisateur */
    trackAction(action, details) {
        if (!this.shouldTrack()) return;
        try {
            const data = {
                type: 'action',
                action: action,
                visitor: this.getVisitorId(),
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            };
            if (details) {
                Object.keys(details).forEach(k => { data[k] = details[k]; });
            }
            db.collection('analytics').add(data);
        } catch (e) {
            // Silencieux
        }
    }
};
