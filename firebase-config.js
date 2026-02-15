/**
 * Firebase Configuration — FSGT Statistiques App
 *
 * Les clés ci-dessous sont PUBLIQUES par design (identifient le projet, pas l'accès).
 * La sécurité repose sur les Firestore Security Rules côté serveur.
 *
 * ⚠️  REMPLACER les valeurs placeholder par celles de votre projet Firebase.
 *     Console : https://console.firebase.google.com
 */

const firebaseConfig = {
    apiKey: "AIzaSyAwO1RtalQXt1M9b7kAkiwZF5nU69T7EJI",
    authDomain: "fsgt-stats.firebaseapp.com",
    projectId: "fsgt-stats",
    storageBucket: "fsgt-stats.firebasestorage.app",
    messagingSenderId: "359241380045",
    appId: "1:359241380045:web:d3d40b30796a096f2cf984"
};

// Initialisation Firebase (SDK compat chargé via CDN dans les HTML)
firebase.initializeApp(firebaseConfig);

// Services Firebase exposés globalement
const db = firebase.firestore();
const auth = firebase.auth();

// Vérification que la config a été renseignée
if (firebaseConfig.apiKey === 'REMPLACER_PAR_VOTRE_API_KEY') {
    console.warn('[Firebase] ⚠️ Configuration non renseignée — Firebase désactivé. Voir firebase-config.js');
}
