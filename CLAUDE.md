# FSGT-Statistiques-App — V17.0 (dernière version à jour)

Application web de statistiques volleyball 4v4 pour l'équipe "Jen et ses Saints" en FSGT.

> **Version** : V17.0 — Full Firebase sync (toutes données localStorage → Firestore) (15 février 2026).

## Contexte

- **Équipe** : Jen et ses Saints
- **Format** : 4v4 FSGT (pas de positions fixes)
- **Cible** : Chrome desktop, largeur 600px (split-screen vidéo ~870px)
- **Langue** : Interface et commentaires en français

## Stack technique

- **Frontend** : HTML5, CSS3, JavaScript vanilla (aucun framework)
- **Stockage local** : localStorage (offline-first pour le scoring live)
- **Base de données** : Firebase Firestore (matchs finalisés, partage équipe)
- **Authentification** : Firebase Auth (Google Sign-In, écriture réservée au propriétaire)
- **Graphiques** : SVG + Canvas pour la visualisation du terrain
- **Fonts** : Google Sans, Roboto

## Structure du projet

```
/
├── index.html                 # Menu principal (mode admin via ?admin)
├── nouveau-match.html         # Sélection type de match (Championnat/Ginette)
├── match-config.html          # Sélection joueurs équipe domicile
├── match-adverse.html         # Sélection joueurs équipe adverse
├── match-set-composition.html # Configuration lineup et visualisation terrain
├── match-set-config.html      # Configuration set (caméra, service)
├── match-live.html            # Interface principale de scoring en direct (161K)
├── historique.html            # Historique et statistiques des matchs (coquille HTML)
├── historique.css             # Styles pour la vue historique (mobile-first responsive)
├── historique.js              # Logique JS pour la vue historique (modules)
├── equipe.html                # Gestion du roster de l'équipe
│
├── storage.js                 # Couche de persistance localStorage (inchangé)
├── firebase-config.js         # Configuration et initialisation Firebase
├── firebase-sync.js           # Sync Firestore + Auth UI (FirebaseSync, FirebaseAuthUI)
├── match-live-helpers.js      # Helpers domaine volleyball et gestion positions
├── match-live-undo.js         # Fonctionnalité undo/redo et gestion rallies
├── match-live.css             # Styles pour l'interface live
│
└── logo-jen.png               # Logo de l'équipe
```

## Règles volleyball FSGT 4v4

### Format de match
- **BO5** : Premier à 3 sets gagnés
- **Sets** : 25 points gagnants avec 2 points d'écart (24-24 → 26-24, etc.)
- **5ème set** : Tiebreak à 15 points
- **Temps limité** : Si temps écoulé, équipe en tête gagne le set. Si égalité, cumul des points tous sets. Si toujours égalité, point d'or.

### Règles de service
- 2 à 4 serveurs doivent s'alterner
- Un serveur ne peut pas avoir 2 tours de service consécutifs
- Le serveur continue tant que son équipe gagne le point
- Tirage au sort pour le premier service, puis alternance à chaque set

### Positions (terminologie française)
- **Passeur** : Position 1 (home) / Position 4 (away)
- **R4** : Réceptionneur-attaquant
- **Centre** : Joueur central
- **Pointu** : Attaquant principal

## Modèles de données

### Match
```javascript
{
    id: string,                          // UUID
    type: 'championship' | 'ginette',
    opponent: string,
    players: [string],                   // Roster domicile
    adversePlayers: [string],            // Roster adverse
    status: 'in_progress' | 'completed',
    sets: [Set],
    result: 'win' | 'loss' | 'draw',
    setsWon: number,
    setsLost: number
}
```

### Set
```javascript
{
    number: number,
    homeLineup: { 1: 'Passeur', 2: 'R4', 3: 'Centre', 4: 'Pointu' },
    awayLineup: { 1: 'R4', 2: 'Centre', 3: 'Pointu', 4: 'Passeur' },
    cameraSide: 'home' | 'away',
    initialServingTeam: 'home' | 'away',
    homeScore: number,
    awayScore: number,
    points: [Point],
    stats: { home: {}, away: {} }
}
```

### Point (Rally)
```javascript
{
    rally: [Action],           // Séquence d'actions
    homeScore: number,
    awayScore: number,
    servingTeam: 'home' | 'away',
    server: string,
    timestamp: number
}
```

### Types d'actions
- **service** : `{ type, team, player, result: 'ace'|'fault'|'in', startPos, endPos }`
- **reception** : `{ type, team, player, quality: 'positive'|'jouable'|'negative'|'faute', endPos }`
- **pass** : `{ type, team, player, endPos }`
- **attack** : `{ type, team, player, attackType: 'normal'|'feinte'|'relance'|'deuxieme_main', result, endPos }`
- **block** : `{ type, team, player }`

## Phases du jeu (State Machine)

```
server_selection → serve_start → serve_end → reception → pass →
attack_player → attack_type → attack_start → attack_end → result
                              ↓
                    (boucle: defense, block, contre-attaque)
```

## Clés localStorage

```javascript
Storage.KEYS = {
    MATCHES: 'volleyball_matches',           // Array de tous les matchs
    CURRENT_ID: 'volleyball_current_match_id', // ID du match actif
    PLAYERS: 'volleyball_players'            // Roster de l'équipe
}
// Clé ajoutée par Firebase :
// 'firebase_migrated' — flag de migration one-shot (true après premier upload)
```

## Architecture Firebase (V17.0)

### Principe
- **localStorage** : source de vérité synchrone (offline-first, lecture/écriture immédiate)
- **Firestore** : miroir cloud de toutes les données (partage équipe, multi-navigateur)
- **`Storage`** (storage.js) : couche synchrone localStorage, avec hooks Firebase non-bloquants
- **`FirebaseSync`** (firebase-sync.js) : layer async, sync bidirectionnelle

### Données synchronisées
| Donnée | localStorage | Firestore | Direction |
|--------|-------------|-----------|-----------|
| Matchs (tous statuts) | `volleyball_matches` | collection `matches` | Bidirectionnelle |
| Roster joueurs | `volleyball_players` | `config/roster` | Bidirectionnelle |
| Current match ID | `volleyball_current_match_id` | `config/state` | Bidirectionnelle |

### Flow de données
```
Écriture : Storage.saveMatch() → localStorage + FirebaseSync.saveMatchAny() (non-bloquant)
Lecture : index.html DOMContentLoaded → FirebaseSync.pullAll() → localStorage mis à jour
Migration : première connexion → FirebaseSync.pushAll() → toutes les données locales → Firestore
```

### Hooks dans Storage (non-bloquants)
- `saveMatch()` → `FirebaseSync.saveMatchAny()`
- `deleteMatch()` → `FirebaseSync.deleteMatch()`
- `setCurrentMatchId()` → `FirebaseSync.saveCurrentMatchId()`
- `clearCurrentMatchId()` → `FirebaseSync.saveCurrentMatchId(null)`
- `equipe.html` → `FirebaseSync.saveRoster()` (hook dédié)

### Sécurité Firestore
- **Lecture** : publique (toute l'équipe peut consulter)
- **Écriture** : réservée aux utilisateurs authentifiés (Google Sign-In)
- Les clés Firebase dans `firebase-config.js` sont publiques par design (identifient le projet, pas l'accès)
- La sécurité repose sur les **Security Rules** côté serveur

### Objets exposés
- `FirebaseSync` : saveMatchAny(), getAllMatches(), deleteMatch(), mergeMatches(), saveRoster(), getRoster(), saveCurrentMatchId(), getCurrentMatchId(), pushAll(), pullAll(), uploadMatch(), getCompletedMatches(), migrateLocalMatches()
- `FirebaseAuthUI` : init(), signIn(), signOut()
- `db` : instance Firestore (global)
- `auth` : instance Firebase Auth (global)

## Couleurs des rôles

```javascript
// ROLE_COLORS (match-live-helpers.js) — source unique
'Passeur': '#8b5cf6'   /* Violet */
'R4': '#3b82f6'        /* Bleu */
'Centre': '#ef4444'    /* Rouge */
'Pointu': '#22c55e'    /* Vert */

// Couleurs équipes
--home-color: #0056D2;  /* Bleu foncé */
--away-color: #ea4335;  /* Rouge */
```

## Patterns importants

### Flux de navigation
```
index → nouveau-match → match-config → match-adverse →
match-set-composition → match-set-config → match-live → (boucle sets) → historique
```

### Persistance
- `Storage.saveCurrentMatch()` appelé à chaque action significative
- `getResumeTarget(match)` détermine où reprendre un match interrompu
- Points immuables après confirmation (undo supprime le point entier)

### Calcul des stats
- Stats recalculées depuis l'array `points` à chaque modification
- Pas d'incrémentation directe (lazy calculation)

### Undo
- Supprime le dernier point complet
- Recalcule toutes les stats depuis zéro
- Modal de confirmation avec résumé du point

## Commandes utiles

```bash
# Servir localement (Python)
python -m http.server 8000

# Ou avec Node
npx serve .

# Ouvrir dans Chrome à la bonne largeur
open -a "Google Chrome" "http://localhost:8000" --args --window-size=600,900
```

## Conventions de code

- **Langue** : Variables et fonctions en anglais, commentaires et UI en français
- **Nommage** : camelCase pour fonctions/variables, SCREAMING_CASE pour constantes
- **DOM** : IDs en kebab-case
- **Pas de framework** : JavaScript vanilla, manipulation DOM directe
- **Stats** : Toujours recalculer depuis les données brutes (points[])

## Sécurité — Commits & Déploiement

> **OBLIGATOIRE** avant tout `git commit`, `git push`, ou déploiement.

### Audit de sécurité pré-commit
1. **Aucun secret dans le code** : vérifier qu'aucun mot de passe, clé privée, token, ou credential ne figure dans les fichiers commités
2. **Fichiers sensibles exclus** : vérifier que `.gitignore` exclut les fichiers qui ne sont pas nécessaires au fonctionnement public (`.env`, clés privées, configs locales, données personnelles)
3. **Clés Firebase** : les clés de config Firebase (`apiKey`, `projectId`, etc.) sont publiques par design — OK à commiter. Mais les **service account keys** et **admin SDK keys** ne doivent JAMAIS être commitées
4. **localStorage** : ne jamais logger ou exposer le contenu brut du localStorage dans la console en production
5. **Données utilisateur** : aucune donnée personnelle (emails, noms réels hors prénoms joueurs) ne doit être exposée dans le code source

### Checklist avant push
- [ ] `git diff --staged` : relire chaque ligne modifiée
- [ ] Rechercher : `password`, `secret`, `token`, `credential`, `apiKey` (hors config Firebase publique)
- [ ] Vérifier `.gitignore` : fichiers sensibles exclus
- [ ] Aucun `console.log` avec des données sensibles
- [ ] Les Security Rules Firebase sont correctement configurées (pas de write public)

## Fonctionnalités clés

### Auto-sélection
- Clic sur zone de position → sélection automatique du réceptionneur
- Réception excellente → auto-sélection du Passeur pour la passe
- Zones colorées selon les rôles pour identification rapide

### Workflow optimisé
- Réduction des clics pour l'enregistrement live
- Bouton Ace intégré pour enregistrement rapide
- Substitutions uniquement entre les points

### Visualisation
- Terrain double (domicile/adverse)
- Flèches SVG pour trajectoires (service, attaque)
- Marqueurs Canvas pour positions
- Zones cliquables avec feedback visuel

## Mode admin (index.html)

L'index a deux modes d'affichage :

- **Mode normal** (`index.html`) : seul le bouton "Stats matchs passés" est visible. L'app est en lecture seule pour les coéquipiers.
- **Mode admin** : les 3 boutons sont visibles (Équipe manager, Stats matchs passés, Nouveau match) + le bandeau match en cours. Réservé au statisticien.

Le mode admin s'active de deux façons :
1. **`?admin` dans l'URL** : pour la première connexion
2. **Utilisateur connecté** (Firebase Auth) : détection automatique via `auth.onAuthStateChanged()` → `enableAdminMode()`

Les éléments admin ont la classe CSS `admin-only` et `style="display:none"` par défaut.

### Bouton Firebase Auth (V16.2)
- **Déconnecté** : pill arrondi avec icône Google 4 couleurs + "Connexion"
- **Connecté** : pill avec avatar miniature + "Déconnexion"
- Styles dans `index.html` (inline) et `historique.css`, rendu dans `FirebaseAuthUI._render()`

## Mode Test / Développement (DevTestMode)

> **TEMPORAIRE** — À retirer une fois l'app terminée.

Objet `DevTestMode` dans `storage.js` qui auto-remplit les joueurs et compositions pour tester rapidement après un reset localStorage. Activé via `DevTestMode.ENABLED = true`.

### Ce qu'il fait
- **equipe.html** / **match-config.html** : Crée automatiquement 4 joueurs (Passeur, R4, Centre, Pointu) dans le roster si vide
- **match-adverse.html** : Crée 4 joueurs adverses (Passeur Adv, R4 Adv, Centre Adv, Pointu Adv)
- **match-set-composition.html** : Place automatiquement les 8 joueurs aux bonnes positions sur le terrain + configure les bloqueurs (Passeur Red Hot en bloqueur principal côté droit)
- **match-set-config.html** : Pré-remplit caméra côté adverse (Sucy), service Jen, et URL YouTube du match de test

### Configuration de test (Red Hot Sucy Pépère)
> **TEMPORAIRE** — Ces données sont spécifiques au match de test contre Red Hot Sucy Pépère. À retirer une fois l'app terminée.

- **Bloqueurs** : Home = Pointu côté droit / Away = Passeur côté droit, bloqueur principal côté droit pour les deux
- **Caméra** : Côté adverse (Sucy en bas de l'écran)
- **Service** : Jen et ses Saints au service
- **YouTube** : `https://www.youtube.com/watch?v=_5YHPt3W6nY&list=PLNR0tSMfwXlVSgtzXMopLcYBGQBR2qZa8`

### Match test historique (Equipe Test)
> **TEMPORAIRE** — Données de test pour valider historique.html. À retirer avec le reste du mode test.

- **Adversaire** : Equipe Test (joueurs : TestPasseur, TestR4, TestCentre, TestPointu)
- **Joueurs Jen** : Alexandre, Arnaud, Jennifer, Antoine
- **Scores** : S1 20-25, S2 12-25, S3 25-23, S4 25-22 → Résultat 2-2
- **Stats** : Aléatoires mais réalistes (service, réception, attaque, défense, bloc)
- **Points** : Séries simulées cohérentes avec les scores (servingTeam correct pour Side Out/Break Out)
- **Méthodes** : `ensureTestMatch()`, `_generatePoints()`, `_generateSetStats()`
- **Appel** : `historique.js` dans `DOMContentLoaded` → `DevTestMode.ensureTestMatch()`

### Fichiers concernés
Chaque intégration est marquée par le commentaire `[DEV TEST] ... — À RETIRER` :
- `storage.js` : Définition de `DevTestMode` (objet complet avec `BLOCKER_CONFIG`, `SET_CONFIG`, `ensureTestMatch()`, méthodes)
- `equipe.html` : Appel `DevTestMode.ensureHomePlayers()`
- `match-config.html` : Appel `DevTestMode.ensureHomePlayers()`
- `match-adverse.html` : Appel `DevTestMode.ensureAwayPlayers()`
- `match-set-composition.html` : Fonction `devTestAutoPlace()` + appel `DevTestMode.getAutoLineup()` + `DevTestMode.getBlockerConfig()`
- `match-set-config.html` : Appel `DevTestMode.getSetConfig()` (caméra, service, YouTube)
- `historique.js` : Appel `DevTestMode.ensureTestMatch()` dans l'init

### Pour désactiver / retirer
- **Désactiver** : `DevTestMode.ENABLED = false` dans `storage.js`
- **Retirer** : Supprimer le bloc `DevTestMode` dans `storage.js` et tous les blocs `[DEV TEST]` dans les 5 HTML

## Logique des statistiques (V7)

> Les stats sont recalculées à chaque point depuis les données brutes (`currentSet.points[]`) via `recalculateAllStats()` → `updateStatsFromRally(rally)`. L'analyse est **contextuelle** : chaque action est évaluée dans le contexte du rally complet (ce qui suit/précède dans la séquence d'actions).

### Tableau de stats — Colonnes par catégorie

| Catégorie  | Colonnes                          |
|------------|-----------------------------------|
| Service    | Tot, Ace, S+, FS, Moy            |
| Réception  | Tot, R4, R3, R2, R1, FR          |
| Attaque    | Tot, A+, A-, BP, FA              |
| Relance    | Tot, R+, R-, FR *(V19.0)* |
| Défense    | Tot, D+, D-, FD                  |
| Bloc       | Tot, B+, B-, FB                  |

### Service

| Stat | Signification | Condition |
|------|---------------|-----------|
| Tot  | Total services | Chaque action `type: 'service'` |
| Ace  | Ace | `result === 'ace'` |
| S+   | Service gagnant (force la faute réception) | La réception adverse qui suit a `quality.label === 'Faute'` (note 0) |
| FS   | Faute de service | `result === 'fault' \| 'fault_out' \| 'fault_net'` |
| Moy  | Moyenne réception adverse | `recSumAdv / (recCountAdv + ace)` — Échelle 0-4 (0 = meilleur serveur). Ace compte comme note 0. |

### Réception

| Stat | Signification | Qualité reçue (quality.label) | Note |
|------|---------------|-------------------------------|------|
| Tot  | Total réceptions | Chaque action `type: 'reception'` | — |
| R4   | Excellente | `'Excellente'` | 4 |
| R3   | Positive | `'Positive'` | 3 |
| R2   | Jouable | `'Jouable'` | 2 |
| R1   | Négative | `'Négative'` | 1 |
| FR   | Faute de réception | `'Faute'` | 0 |

> **Retour gagnant** : Si `action.isDirectReturnWinner === true` sur une réception → compte aussi comme `Att+ (attack.attplus)` et `attack.tot++`.

### Attaque

| Stat | Signification | Condition |
|------|---------------|-----------|
| Tot  | Total attaques | Chaque action `type: 'attack'` |
| A+   | Attaque gagnante | Kill direct (`result === 'point'`), bloc out (`result === 'bloc_out'`), ou attaque défendue mais **pas de passe adverse après** (= l'adversaire n'a pas pu organiser son jeu) |
| A-   | Attaque neutre | `result === 'defended'` ET il y a une passe (`type: 'pass'`) de l'équipe adverse **après** cette attaque dans le rally |
| BP   | Bloc pris | `result === 'blocked'` (la balle revient chez l'attaquant) |
| FA   | Faute d'attaque | `attackType === 'faute'` ou `result === 'fault_net'` ou `result === 'out'` |

> **Critère A+ vs A-** : S'il y a une passe (`pass`) de l'équipe adverse après l'attaque dans le rally → A- (jeu organisé). Sinon → A+ (l'attaque a forcé le point ou l'erreur).

### Relance *(V19.0)*

> **Distinction attaque vs relance** : La relance (`attackType === 'relance'`) est une catégorie de stats **séparée** de l'attaque. Ce n'est pas une attaque — c'est un geste de survie quand le joueur reçoit une balle impossible à attaquer (mauvaise passe ou mauvaise défense en amont). La responsabilité de la situation incombe à la passe/défense précédente, pas à l'attaquant.

> **Contexte dans le workflow** : La relance est déclenchée dans le workflow quand le joueur choisit `attackType === 'relance'` au lieu de `'normal'`/`'feinte'`/`'deuxieme_main'`. Le workflow est identique à une attaque (choix de zone, trajectoire, résultat) mais la comptabilisation stats est différente.

| Stat | Signification | Condition |
|------|---------------|-----------|
| Tot  | Total relances | Chaque action `type: 'attack'` avec `attackType === 'relance'` |
| R+   | Relance positive | Point direct (`result === 'point'`) ou relance qui permet de continuer le jeu (l'adversaire ne marque pas directement après) |
| R-   | Relance neutre/mauvaise | Relance défendue qui mène à une attaque adverse organisée |
| FR   | Faute de relance | `result === 'fault_net'` ou `result === 'out'` |

> **Règle actuelle (pré-V19.0)** : Les relances sont comptées en attaque (Tot+1, Att+ si point direct, FA/BP/A- ignorés). En V19.0, elles seront **retirées de la catégorie attaque** et migrées vers cette catégorie dédiée.
>
> **Impact sur les stats d'attaque** : Après V19.0, les actions avec `attackType === 'relance'` ne compteront plus dans `attack.tot`, `attack.attplus`, etc. Seules les attaques réelles (`normal`, `feinte`, `deuxieme_main`) resteront dans la catégorie attaque.

### Défense

| Stat | Signification | Condition |
|------|---------------|-----------|
| Tot  | Total défenses | Chaque action `type: 'defense'` |
| D+   | Défense positive | `result !== 'fault'` ET `defenseQuality === 'positive'` (clic dans la zone bleue D+) |
| D-   | Défense négative | `result !== 'fault'` ET `defenseQuality === 'negative'` (clic hors zone) OU `result === 'fault'` ET un bloc de la **même équipe** précède cette défense (responsabilité partagée) |
| FD   | Faute de défense | `result === 'fault'` ET **aucun** bloc de la même équipe ne précède (défenseur seul responsable) |

> **Zone D+** : Demi-cercle bleu (#3b82f6, 43% largeur, 50% hauteur depuis le filet). Calcul elliptique : `√((distX/21.5)² + (distNet/50)²) ≤ 1` → positive, sinon → negative.
>
> **D- après bloc (responsabilité partagée)** : On cherche en arrière dans le rally un `block` de la même équipe que le défenseur (en s'arrêtant si on trouve une `pass` ou `attack` de la même équipe = nouvel échange).

### Bloc

| Stat | Signification | Condition |
|------|---------------|-----------|
| Tot  | Total blocs | Chaque action `type: 'block'` avec un `player` défini |
| B+   | Bloc gagnant | `result === 'kill' \| 'point'`, ou l'adversaire rate sa défense après le bloc (`defense.result === 'fault'` de l'équipe adverse), ou fin du rally sans suite (le bloc a fait le point) |
| B-   | Bloc neutre | Le jeu continue après le bloc : défense réussie, ou passe/attaque trouvée après dans le rally |
| FB   | Faute de bloc | `result === 'bloc_out'`, ou défense ratée par **sa propre équipe** après le bloc |

> **Analyse contextuelle du bloc** : On parcourt le rally après le bloc :
> 1. Si on trouve une `defense` réussie → B-
> 2. Si on trouve une `defense` en faute de la même équipe que le bloqueur → FB
> 3. Si on trouve une `defense` en faute de l'équipe adverse → B+
> 4. Si on trouve une `pass` ou `attack` sans défense → B- (le jeu a continué)
> 5. Si fin du rally sans suite → B+ (le bloc a fait le point)

### Structure de données stats joueur (`initPlayerStats()`)

```javascript
{
    service:   { tot: 0, ace: 0, splus: 0, fser: 0, recSumAdv: 0, recCountAdv: 0 },
    reception: { tot: 0, r4: 0, r3: 0, r2: 0, r1: 0, frec: 0 },
    attack:    { tot: 0, attplus: 0, attminus: 0, bp: 0, fatt: 0 },
    relance:   { tot: 0, relplus: 0, relminus: 0, frel: 0 },  // V19.0
    defense:   { tot: 0, defplus: 0, defminus: 0, fdef: 0 },
    block:     { tot: 0, blcplus: 0, blcminus: 0, fblc: 0 }
}
```

### Bouton Bloc Out (V11.1)

Le bouton "Bloc out" apparaît uniquement dans la **vue attaque filet** (`attackNetChoice`) — quand l'attaque touche le filet/bloc et ressort. Les autres points d'entrée (vue résultat attaque, vue défense) ont été supprimés en V11.1 pour cohérence.

Phases associées : `bloc_out_player` (sélection du bloqueur) → `bloc_out_trajectory` (clic pour coordonnées ou "Passer").

### Bouton Point en Défense (V11.1)

Bouton "Point" ajouté en vue défense (`defenseFaultSection`) pour les attaques qui traversent le block et touchent le sol directement (pas de défense possible). Permet d'attribuer le point sans passer par une faute de défense.

### Zone de qualité de défense (D+)

Zone semi-circulaire bleue affichée pendant la phase `defense_end` (après auto-sélection du défenseur). Le flow :
1. Zones auto-select défenseurs visibles (pas de zone D+)
2. Clic zone → défenseur auto-sélectionné → zones disparaissent → zone D+ apparaît
3. Clic dans la zone D+ → D+ enregistré / Clic hors zone → D- enregistré

## Points d'attention

- **Performance** : match-live.html fait 161K, optimiser si nécessaire
- **Offline-first** : Tout en localStorage, pas de sync cloud
- **Un seul match actif** : Conception pour un match à la fois
- **Perspective caméra** : Le terrain s'inverse selon le côté caméra

## Planning de développement

> **Stratégie** : Workflow d'abord (scoring live solide), puis enrichissement historique, puis stats avancées, puis finalisation.

### Phases terminées (V8.0 → V19.0)

| Phase | Description | Version |
|-------|-------------|---------|
| Phase 1 | Zones d'attaque détaillées + auto-select défenseur contextuel | V8.0 ✅ |
| Phase 1bis | Système relance : zones de défense 4 joueurs + stats conditionnelles | V9.0 ✅ |
| Phase 2 | Override joueur sur toutes les phases (4 tags toujours visibles) | V10.0 ✅ |
| Phase 3 | Stats attaque différenciées (relance : seul Att+ compte) | V9.0 ✅ |
| Phase 4 | Défense contextuelle (bloc/relance) — absorbée par 1 + 1bis | V9.0 ✅ |
| Phase 6 | Flèches après bloc (Y = centre filet, X = position réelle) | V11.0 ✅ |
| Phase 7 | Bloc out trajectoire en un clic | V11.1 ✅ |
| Phase 8 | Stats Side Out / Break Out — absorbée par Phase 11 | V13.0 ✅ |
| Phase 9 | Timeline de séries de points | V11.1 ✅ |
| Phase 11 | Refonte totale historique (5 volets) | V13.52 ✅ |
| V14.0 | Fix stats attaque filet→block (`result = 'defended'`) | V14.0 ✅ |
| V14.1 | Suppression auto-select défenseur après block | V14.1 ✅ |
| V16.x | Mode admin + Firebase Auth UI | V16.4 ✅ |
| V17.x | Full Firebase sync (localStorage → Firestore) | V17.3 ✅ |
| V18.0 | Audit & fix retours directs (réception, passe, défense) + comptabilisation stats | V18.0 ✅ |
| V18.1 | Réécriture complète du système undo (WorkflowEngine) + bug fixes (flèches, bloc) | V18.1 ✅ |
| V18.2 | Points de mixité modifiables en cours de set + blocs gris timeline | V18.2 ✅ |
| V19.0 | Nouvelle catégorie stats Relance (séparée de l'attaque) — Tot, R+, R-, FR | V19.0 ✅ |

---

### ~~Phase 18 — Workflow : Corrections & Robustesse~~ ✅ TERMINÉE

~~**V18.0 — Audit & fix retours directs**~~ ✅
- [x] Auditer tous les cas de retour direct (réception, passe, défense) et leur comptabilisation stats
- [x] Corriger les cas manquants/incohérents
- [x] Vérifier les retours directs gagnants ET perdants depuis chaque phase

~~**V18.1 — Fix undo complet**~~ ✅
- [x] Réécriture complète du système undo (WorkflowEngine)
- [x] Bug fixes flèches, bloc, undo sur tous scénarios

~~**V18.2 — Points de mixité en cours de set**~~ ✅
- [x] Ajouter bouton dans match-live pour ajouter/modifier les points de mixité pendant le set
- [x] Gestion séries de points : points mixité gris toujours au début pour l'équipe concernée dans la timeline

### Phase 19 — Workflow : Stats relance & Qualité de passe
*Enrichissement du modèle de données*

~~**V19.0 — Nouvelle catégorie stats : Relance**~~ ✅
- [x] Créer une catégorie de stats à part entière "Relance" (séparée de l'attaque — la relance n'est pas une attaque, c'est un geste de survie dû à une mauvaise passe/défense en amont)
- [x] Colonnes : Tot, R+ (relance qui permet de continuer le jeu / point direct), R- (relance neutre/mauvaise), FR (faute de relance)
- [x] Intégration dans le calcul de stats (`recalculateAllStats`) et l'affichage (match-live + historique)
- [x] Retirer les relances des stats d'attaque (actuellement : Tot+1 et Att+ si point direct → à migrer vers la catégorie Relance)
- [x] V19.0(+1) : Fix export stats FA(BP) + header aligné + filtrage joueurs fantômes adverses

**V19.1 — Système de qualité de passe**
- [ ] 3 grilles prédéfinies selon le contexte : **confort** (après R4/R3), **contraint** (après R2/R1), **transition** (après défense/relance ou passeur non principal)
- [ ] Chaque grille a ses propres zones ~50cm×50cm avec seuils "optimale / acceptable / mauvaise"
- [ ] Passeur en poste → grille confort ou contraint selon réception. Autres joueurs → toujours grille transition
- [ ] Enregistrement qualité de passe dans le modèle de données (action `pass` : `passQuality`, `passContext`)
- [ ] Distinction passeur principal / passeur de transition dans les stats

**V19.2 — Badges flash feedback visuel**
- [ ] Badges temporaires après chaque action : résultat (R4→R0, D+, D-, A+, BP, FA...)
- [ ] Badges optionnels en haut pour ajuster la qualité (override vers qualité inférieure si jugé)
- [ ] Design discret, animation courte (apparition/disparition rapide)

### Phase 20 — Historique : Refonte structure & design

> **Responsive** : La vue historique est optimisée pour **mobile** (375–430px portrait) ET **MacBook Air 13"** (1470px). Breakpoints : ≤480px (mobile portrait), 481–768px (mobile paysage), ≥1024px (laptop).

**V20.0 — Restructuration onglets**
- [ ] Renommer "Stats Matchs" → "Stats ALL" (stats détaillées par joueur, actuellement dans Global)
- [ ] Nouvel onglet "Global" : stats globales du match (side out/break out, séries, meilleurs joueurs, graphiques par poste)
- [ ] Onglet stats passe dédié dans Stats ALL et dans chaque Set (passeur principal / passeur transition)

**V20.1 — Améliorations visuelles match**
- [ ] Bouton YouTube redesigné style YouTube (carré rouge, bouton play blanc/texte gris)
- [ ] Scores sets et match colorés : vert (victoire Neuilly) / rouge (défaite Neuilly) / noir (adversaire)
- [ ] Détection poste par joueur par set → pastilles de rôle dans la vue historique (multi-pastilles si multi-postes dans différents sets)
- [ ] Side Out / Break Out : ajouter ligne moyenne par set dans les onglets Set X (pour comparaison). Ligne absente de Stats ALL car moyenne = ALL

**V20.2 — Stats globales enrichies (onglet Global)**
- [ ] Meilleur marqueur, meilleur bloqueur, meilleur réceptionneur (règles à définir + visuels)
- [ ] Graphiques par poste : Att/Recep/Bloc pour ailiers, Passe/Serv/Def pour passeur, Recep/Def pour centre
- [ ] Statistiques comparatives joueur vs moyenne année
- [ ] Graphique momentum lié aux séries de points (chaud/froid, courbe d'élan)

**V20.3 — Refonte design tableaux desktop + responsive**
- [ ] Refonte complète des tableaux stats (desktop — design propre)
- [ ] Mobile portrait : double onglet Serv/Recep OU Passe/Attaque OU Def/Bloc
- [ ] Mobile paysage : layout adapté

### Phase 21 — Historique : Visualisation terrain (flèches)

**V21.0 — Vue terrain avec flèches filtrables**
- [ ] Rendu terrain SVG avec toutes les trajectoires enregistrées (service, réception, attaque, passe, défense)
- [ ] Couleurs par résultat : vert (gagnant), rouge (perdant), orange (neutre)
- [ ] Filtres combinables multi-sélection : joueur(s), set(s)/match, catégorie(s), résultat(s)
- [ ] Intégration dans historique.html (onglet ou section dédiée)

**V21.1 — Heatmap passe**
- [ ] Heatmap terrain avec zones colorées selon qualité de passe (données de V19.1)
- [ ] Filtres : passeur principal vs transition, par set, par qualité de réception en amont
- [ ] Tendances : petit côté vs grand côté selon lieu/qualité de réception

### Phase 22 — Stats avancées

**V22.0 — Notes joueurs /100 par poste**
- [ ] Barème ailier : pondération Attaque / Réception / Bloc
- [ ] Barème passeur : pondération Passe / Service / Défense
- [ ] Barème centre : pondération Réception / Défense
- [ ] Affichage dans historique (par match et cumulé année)

**V22.1 — Stats Side Out / Break Out enrichies**
- [ ] Stats filtrées par contexte : Att% en side out, Rec Moy en side out, Pression service
- [ ] Métriques croisées Stats Année : tableau récapitulatif SO%/BO% par match + total saison
- [ ] Tests : set simulé → vérifier les % side out / break out vs comptage manuel

**V22.2 — Stats texte export**
- [ ] Export texte par match : Set 1,2,3,4,5 + stats totales par joueur
- [ ] Sets joués / points +/- par set
- [ ] Note /100 par joueur dans l'export

**V22.3 — Graphique momentum Stats Année**
- [ ] Graphique momentum agrégé dans l'onglet Stats Année (tendances sur la saison)

**V22.4 — Stats mentalité / distribution passeur**
- [ ] Détecter les séquences : attaquant échoue (A-, BP, defended) → passe suivante du même passeur → même attaquant ou switch
- [ ] Taux de re-confiance par passeur (% redistribution au même attaquant après échec)
- [ ] Taux de switch : vers qui le passeur redirige après un échec
- [ ] Corrélation : est-ce que le re-feed donne un meilleur ou pire résultat ?
- [ ] Affichage dans les stats passe (historique)

### Phase 23 — Ginette 4v6
*À détailler quand les phases précédentes seront terminées*
- [ ] Adaptation workflow pour matchs 4 contre 6 (zones de défense, positions)
- [ ] Stats spécifiques Ginette

### Phase 24 — Finalisation

**V24.0 — Uniformisation thème**
- [ ] Thème visuel cohérent sur toutes les pages (palette couleurs, typographie, composants)

**V24.1 — Retrait DevTestMode (ex-Phase 10)**
- [ ] Supprimer `DevTestMode` dans `storage.js`
- [ ] Supprimer tous les blocs `[DEV TEST]` dans les fichiers HTML
- [ ] Vérifier qu'aucune référence ne subsiste

**V24.2 — Debug global (ex-Phase 5)**
- [ ] Test complet tous workflows (happy path, contre-attaque, undo, retours directs)
- [ ] Vérification cohérence state machine avec tous les nouveaux cas
- [ ] Nettoyage final du code

### Dépendances
```
Phase 18 (workflow fixes)  ──→ Phase 19 (relance + passe) ──→ Phase 21.1 (heatmap passe)
                                                            ↗
Phase 20 (historique)      ──→ Phase 21.0 (flèches terrain)
                           ──→ Phase 22 (stats avancées)
Phase 23 (Ginette)         ── indépendante, à détailler
Phase 24 (finalisation)    ── après toutes les autres phases
```
