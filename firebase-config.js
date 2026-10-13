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

// App Check (reCAPTCHA Enterprise) : prouve à Firebase que les requêtes viennent du vrai site.
// Clé du site PUBLIQUE par design (Enterprise : pas de clé secrète, liée au projet Google Cloud).
// En local : jeton de debug affiché dans la console, à enregistrer dans
// Firebase → App Check → Apps → ⋮ → Gérer les jetons de débogage.
const RECAPTCHA_SITE_KEY = '6LfCj-0tAAAAAJuRSg5hP7XViiPt3hHS6xjvkIj9';
if (typeof firebase.appCheck === 'function') {
    if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
        self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
    }
    firebase.appCheck().activate(new firebase.appCheck.ReCaptchaEnterpriseProvider(RECAPTCHA_SITE_KEY), true);
}

// Services Firebase exposés globalement
const db = firebase.firestore();
const auth = firebase.auth();

// Vérification que la config a été renseignée
if (firebaseConfig.apiKey === 'REMPLACER_PAR_VOTRE_API_KEY') {
    console.warn('[Firebase] ⚠️ Configuration non renseignée — Firebase désactivé. Voir firebase-config.js');
}
