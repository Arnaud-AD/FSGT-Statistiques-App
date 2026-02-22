/**
 * Garde d'accès admin — FSGT Statistiques App
 *
 * Inclure ce script APRÈS firebase-config.js, admin-config.js et firebase-sync.js
 * sur toutes les pages réservées à l'admin (scoring, config, équipe, etc.)
 *
 * Comportement : attend la résolution de l'état auth Firebase,
 * puis redirige vers index.html si l'utilisateur n'est pas l'admin.
 */
(function() {
    'use strict';

    // Si Firebase Auth n'est pas dispo, rediriger immédiatement
    if (typeof auth === 'undefined' || typeof FirebaseSync === 'undefined') {
        window.location.replace('index.html');
        return;
    }

    // Cacher le body pendant la vérification pour éviter un flash de contenu
    document.documentElement.style.visibility = 'hidden';

    auth.onAuthStateChanged(function(user) {
        if (user && FirebaseSync.isAdmin()) {
            // Admin confirmé — afficher la page
            document.documentElement.style.visibility = '';
        } else {
            // Non-admin ou non connecté — rediriger
            window.location.replace('index.html');
        }
    });
})();
