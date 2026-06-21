/**
 * vote-config.js — Awards de fin d'année (Jen et ses Saints)
 *
 * SOURCE UNIQUE des awards. Utilisé par vote.html (écrans de vote) et
 * vote-results.html (dépouillement). Pour AJOUTER ou MODIFIER un award,
 * édite simplement ce tableau : un award = un écran de vote, généré
 * automatiquement. L'`id` doit être unique et stable (il sert de clé de stockage).
 *
 * Ordre = on alterne un vote SÉRIEUX puis un vote DRÔLE, puis montée en
 * pression (Polyvalent, Révélation) et finale Clutch → Leader → MVP.
 * Catégories sérieuses alignées sur les « Distinctions » de la saison (historique.js).
 */
const AWARDS = [
    // --- Alternance sérieux / drôle ---
    { id: 'passeur',        emoji: '🤲', title: 'Meilleur Passeur',       desc: "Distribue les meilleures balles à attaquer" },
    { id: 'drole',          emoji: '😂', title: 'Joueur le plus drôle',   desc: "Le boute-en-train qui fait rire tout le groupe" },
    { id: 'receptionneur',  emoji: '🏐', title: 'Meilleur Réceptionneur', desc: "Le·la plus solide en réception" },
    { id: 'pires-conseils', emoji: '🗣️', title: 'Pires Conseils',         desc: "Celui ou celle qu'il ne faut surtout pas écouter" },
    { id: 'serveur',        emoji: '🎯', title: 'Meilleur Serveur',       desc: "Le service le plus redoutable (aces, pression)" },
    { id: 'entrainement',   emoji: '🏋️', title: "Meilleur à l'entraînement", desc: "Investi·e, appliqué·e et plein·e d'énergie à chaque séance" },
    { id: 'libero',         emoji: '🏅', title: 'Meilleur Libéro',        desc: "Le·la spécialiste réception et défense" },
    { id: 'cinquieme-homme',emoji: '🔄', title: 'Meilleur 5e homme',      desc: "La meilleure entrée en jeu, l'impact du banc" },
    { id: 'defenseur',      emoji: '🛡️', title: 'Meilleur Défenseur',     desc: "Récupère les balles impossibles au sol" },
    { id: 'dix-doigts',     emoji: '🖐️', title: 'Meilleurs 10 doigts',    desc: "Le toucher de balle le plus fin de l'équipe" },
    { id: 'bloqueur',       emoji: '🧱', title: 'Meilleur Bloqueur',      desc: "Le mur au filet" },
    { id: 'manchette',      emoji: '🦾', title: 'Meilleure manchette',    desc: "La plus belle manchette de l'équipe" },
    { id: 'attaquant',      emoji: '⚔️', title: 'Meilleur Attaquant',     desc: "Le·la plus efficace pour conclure les points" },
    { id: 'bidouille',      emoji: '🪄', title: 'Roi de la bidouille',    desc: "Le·la plus efficace en jeu bricolé et improvisé" },

    // --- Montée en pression + finale ---
    { id: 'polyvalent',     emoji: '🎭', title: 'Joueur Polyvalent',      desc: "À l'aise et utile à tous les postes" },
    { id: 'revelation',     emoji: '🌟', title: 'Révélation',             desc: "La belle surprise / la plus grosse progression" },
    { id: 'clutch',         emoji: '💪', title: 'Joueur Clutch',          desc: "Marque les points qui comptent sous pression" },
    { id: 'leader',         emoji: '🧠', title: 'Joueur Leader',          desc: "Par son attitude et son énergie, fait avancer le groupe" },
    { id: 'mvp',            emoji: '👑', title: 'MVP',                     desc: "Le·la joueur·se le·la plus déterminant·e de la saison" },
];
