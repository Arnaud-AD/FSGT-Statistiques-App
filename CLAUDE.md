# FSGT-Statistiques-App — V11.1 (dernière version à jour)

Application web de statistiques volleyball 4v4 pour l'équipe "Jen et ses Saints" en FSGT.

> **Version** : V11.1 — Refonte bloc out + bouton Point en défense (12 février 2026).

## Contexte

- **Équipe** : Jen et ses Saints
- **Format** : 4v4 FSGT (pas de positions fixes)
- **Cible** : Chrome desktop, largeur 600px (split-screen vidéo ~870px)
- **Langue** : Interface et commentaires en français

## Stack technique

- **Frontend** : HTML5, CSS3, JavaScript vanilla (aucun framework)
- **Stockage** : localStorage (100% offline, pas de backend)
- **Graphiques** : SVG + Canvas pour la visualisation du terrain
- **Fonts** : Google Sans, Roboto

## Structure du projet

```
/
├── index.html                 # Menu principal avec bannière match en cours
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
├── storage.js                 # Couche de persistance localStorage
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
```

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

> **Stratégie** : Implémenter toutes les fonctionnalités d'abord, puis phase finale de debug global + restructuration propre du code.

### ~~Phase 1 — Zones d'attaque détaillées + auto-select défenseur contextuel~~ ✅ TERMINÉE (V8.0)
**Objectif** : Zones d'attaque granulaires (incluant centre) avec auto-select défenseur basé sur la section du terrain (et non plus sur le joueur).
- [x] Ajouter zone d'attaque au centre (en plus des ailes existantes)
- [x] Redécouper le terrain adverse en sections de défense
- [x] Auto-select défenseur basé sur la zone d'impact terrain
- [x] Tests : chaque zone → bon défenseur auto-sélectionné

### ~~Phase 1bis — Système relance : zones de défense 4 joueurs + stats conditionnelles~~ ✅ TERMINÉE (V9.0)
**Objectif** : Zones de défense spécifiques pour les attaques en relance, avec 4 joueurs en défense et stats conditionnelles.
- [x] 4 zones de défense fixes pour attaques relance (R4, Pointu, Centre, Passeur) avec point de convergence (55%, 42%)
- [x] Auto-détection du type d'attaque dans `showDefenseZones()` sans modifier les call sites
- [x] Phase `attack_type` : toujours afficher les zones smash standard (pas de relance prématurée)
- [x] Nettoyage complet des zones dans `hideDefenseZones()` (style inline + contenu + dataset)
- [x] Stats relance : seul Att+ compte (Tot+1, Att+), FA/BP/Att- ignorés pour l'attaquant
- [x] 4ème zone HTML (`data-zone="extra"`) invisible par défaut, active uniquement en relance
- [x] Support miroir top/bottom court pour les 8 clip-paths relance

### ~~Phase 2 — Override joueur sur toutes les phases~~ ✅ TERMINÉE (V10.0)
**Objectif** : À chaque étape du workflow (réception, passe, attaque, défense, bloc — sauf service), 4 tags joueurs sont toujours visibles dans l'ordre fixe Passeur → R4 → Centre → Pointu. Le joueur auto-sélectionné est en surbrillance (fond couleur du rôle). Clic sur un autre tag = override. Clic sur le tag auto = retour au mode auto.

**Principe fondamental** : Ne jamais exclure de joueur des tags. Les 4 joueurs sont toujours affichés.

- [x] Tags joueurs visibles à chaque étape du workflow (sauf service) : réception, réception_end, passe, passe_end, attaque_player, attaque_type, attaque_end, résultat, défense, défense_end, bloc au filet, bloc out
- [x] Ordre fixe des tags : Passeur → R4 → Centre → Pointu (tri par rôle dans `renderOverrideTags()`)
- [x] Suppression de toute logique d'exclusion (`excludePlayers` ignoré, `lastToucher` non exclu)
- [x] `getEffectivePlayer()` unifié (sans side-effect) utilisé dans tous les handlers
- [x] Correction bug `updateOverrideVisuals()` : utilise `overrideTagsTeam` au lieu de `attackingTeam`
- [x] Reset automatique de `overridePlayer` dans `renderOverrideTags()` à chaque changement de phase
- [x] Bandeau mis à jour avec le joueur effectif (override ou auto) à chaque étape

### ~~Phase 3 — Stats attaque différenciées (relance vs smash/feinte)~~ ✅ TERMINÉE (V9.0)
**Objectif** : Séparer les statistiques selon le type d'attaque pour une analyse plus fine.
- [x] Différencier relance vs smash/feinte dans le modèle de données
- [x] Stats relance conditionnelles : seul Att+ compte (Tot+1, Att+), FA/BP/Att- ignorés
- [x] Tests : vérifier que les stats se catégorisent correctement

### ~~Phase 4 — Défense contextuelle (bloc/relance)~~ ✅ TERMINÉE (absorbée par V8.0 + V9.0)
**Objectif** : Intégration bloc → défense relance. Réalisée de facto : `showDefenseZones()` auto-détecte le type d'attaque (relance vs standard) depuis `gameState` et affiche les zones appropriées quel que soit le contexte (après bloc, après attaque directe, etc.).
- [x] Si clic "filet" → génère bloc + défense adaptée au contexte relance
- [x] Transition bloc → défense relance gérée par auto-détection dans `showDefenseZones()`
- [x] Zones relance (4 joueurs) ou standard (3 joueurs) selon `attackType` du rally

### Phase 5 — Debug global + restructuration
**Objectif** : Rigidifier et nettoyer le code une fois toutes les fonctionnalités intégrées.
- [ ] Test complet workflow happy path (service → point marqué)
- [ ] Test complet workflow return (échange avec contre-attaque)
- [ ] Test complet undo/redo sur tous les scénarios
- [ ] Restructuration et nettoyage du code
- [ ] Vérification cohérence state machine avec tous les nouveaux cas

### ~~Phase 6 — Flèches après bloc (amélioration visuelle)~~ ✅ TERMINÉE (V11.0)
**Objectif** : Quand un bloc est déclenché (bloc out, block kill, bloc dévié), le point de départ de la flèche doit être centré sur le filet en hauteur, mais positionné correctement en largeur (position réelle du bloc).
- [x] Modifier le point de départ de la flèche post-bloc : Y = centre filet, X = position réelle
- [x] Appliquer à tous les cas : bloc out, block kill, bloc dévié
- [x] Tests : vérifier visuellement la cohérence des flèches post-bloc

### ~~Phase 7 — Bloc out : trajectoire en un clic~~ ✅ TERMINÉE (V11.1)
**Objectif** : Quand on clique sur le terrain adverse après un bloc, le clic indique déjà où la balle atterrit. Le système ne doit pas redemander la trajectoire.
- [x] Si clic terrain adverse après bloc → utiliser ce clic comme trajectoire finale directement
- [x] Supprimer l'étape redondante "Cliquez où va la balle" quand la position est déjà connue
- [x] Tests : bloc out via clic terrain → point attribué sans étape supplémentaire

### ~~Phase 8 — Stats Side Out / Break Out~~ → absorbée par Phase 11 (Volet 4)
**Objectif** : Identifier et afficher les statistiques de side out (point marqué par l'équipe en réception) vs break out (point marqué par l'équipe au service) pour les deux équipes. Permettre une analyse croisée pour comprendre les dynamiques tactiques du match.

> **Terminologie** : Side Out = % points marqués en réception. Break Out = % points marqués au service.

> **Données déjà disponibles** : Chaque `point` contient `servingTeam` et les scores `homeScore`/`awayScore`. Le side out se déduit en comparant `servingTeam` avec l'équipe qui marque (delta de score). Aucune modification du modèle de données nécessaire — c'est du calcul dérivé.

> **Note** : L'implémentation de cette phase est intégrée dans la Phase 11, Volet 4. Voir Phase 11 pour les détails.

### ~~Phase 9 — Timeline de séries de points (visualisation)~~ ✅ TERMINÉE (V11.1)
**Objectif** : Afficher une timeline graphique des séries de points consécutifs par équipe, set par set. Chaque bloc numéroté représente un point, coloré selon l'équipe qui l'a marqué. Les séries longues sont immédiatement visibles. Inspiré du format "Run Chart" volleyball.

> **Données déjà disponibles** : Les `points[]` de chaque set contiennent `homeScore`/`awayScore` séquentiellement. Les séries se déduisent en comparant les deltas de score consécutifs. Aucune modification du modèle de données nécessaire.

- [x] Composant `renderTimeline(set, container)` : génère la timeline HTML/CSS pour un set
- [x] Algorithme de détection des séries : parcourir `points[]`, grouper les points consécutifs de la même équipe
- [x] Style CSS : blocs colorés, disposition deux lignes, numérotation, responsive pour sets courts (25-10) et serrés (26-24)
- [x] Intégrer dans historique.html : section "Timeline" avec un rendu par set
- [x] Optionnel : mini-timeline dans match-live.html pour suivi en temps réel
- [x] Tests : vérifier l'alignement visuel sur différentes longueurs de set
- [x] Tests : vérifier la cohérence numérotation vs score final

### Phase 10 — Retrait du mode test (DevTestMode)
**Objectif** : Une fois l'application terminée et toutes les fonctionnalités validées, supprimer entièrement le mode test.
- [ ] Supprimer l'objet `DevTestMode` dans `storage.js`
- [ ] Supprimer tous les blocs `[DEV TEST] ... — À RETIRER` dans les 5 fichiers HTML (equipe.html, match-config.html, match-adverse.html, match-set-composition.html, match-set-config.html)
- [ ] Vérifier qu'aucune référence à `DevTestMode` ne subsiste dans le code
- [ ] Tester que l'application fonctionne normalement sans le mode test

### Phase 11 — Refonte totale de la vue Historique
**Objectif** : Refonte complète de `historique.html` — redesign visuel, implémentation des onglets Stats Année et Sets joués (actuellement vides), intégration des stats Side Out / Break Point (Phase 8), et améliorations UX globales.

> **État actuel** : L'onglet "Stats Matchs" fonctionne (liste matchs, détail avec header/score/timeline/stats joueurs). Les onglets "Stats Année" et "Sets joués" sont des empty states sans contenu. Le code est entièrement inline dans un seul fichier (~1550 lignes HTML+CSS+JS). La Phase 8 (Side Out/Break) prévoyait déjà un affichage dans historique.html.

> **Responsive — EXCEPTION historique.html** : Contrairement au reste de l'app (optimisée Chrome desktop 600px), la vue historique doit être optimisée pour **2 types d'appareils** :
>
> | Appareil | Viewport CSS | Breakpoint | Usage |
> |----------|-------------|------------|-------|
> | **Mobile (smartphone)** | 375×667 à 430×932 | `≤ 768px` | Consultation post-match sur le terrain |
> | **MacBook Air 13"** | 1470×956 (défaut M3/M4) | `≥ 1024px` | Analyse détaillée à la maison |
>
> **Breakpoints cibles** :
> - `≤ 480px` : Mobile portrait (iPhone SE, petits Android) — layout 1 colonne, tableaux scrollables
> - `481px – 768px` : Mobile paysage / petites tablettes — layout adapté
> - `≥ 1024px` : Laptop / MacBook Air — layout élargi, tableaux complets côte à côte, pas de scroll horizontal
>
> **Note** : Cette contrainte responsive ne s'applique qu'à `historique.html` (et ses fichiers `historique.css` / `historique.js`). Les autres pages restent optimisées pour Chrome desktop 600px uniquement.

**Volet 1 — Restructuration et redesign UI**
- [ ] Extraire le CSS dans un fichier séparé `historique.css` (cohérent avec `match-live.css`)
- [ ] Extraire le JS dans un fichier séparé `historique.js`
- [ ] Redesign visuel du header et de la navigation par onglets
- [ ] Améliorer le design des cartes match (sélecteur de match)
- [ ] Redesign de la vue détail match (header, scores, sets)
- [ ] Améliorer le rendu des tableaux de stats joueurs (lisibilité, responsive scroll)
- [ ] Améliorer le rendu de la timeline des séries de points

**Volet 2 — Onglet Stats Année (statistiques cumulées saison)**
- [ ] Agréger les stats de tous les matchs complétés de la saison
- [ ] Afficher le bilan global : matchs joués, V/D, sets gagnés/perdus, points marqués/encaissés
- [ ] Tableau stats joueurs cumulées (service, réception, attaque, défense, bloc) sur toute la saison
- [ ] Classement joueurs par catégorie (meilleur attaquant, meilleur réceptionneur, etc.)
- [ ] Filtres : par type de match (Championnat / Ginette), par période

**Volet 3 — Onglet Sets joués (analyse détaillée des sets)**
- [ ] Liste de tous les sets joués (tous matchs confondus), triés chronologiquement
- [ ] Pour chaque set : score final, adversaire, timeline des séries, durée estimée
- [ ] Filtres : sets gagnés/perdus, par adversaire, par score serré (≤3 pts d'écart) vs dominé
- [ ] Stats agrégées par type de set (sets gagnés vs perdus, sets serrés vs dominés)

**Volet 4 — Intégration Side Out / Break Out (absorbe Phase 8)**
- [ ] Fonction `classifyPoint(point, prevPoint)` : retourne `'sideout'` ou `'breakout'`
- [ ] Fonction `calculateSideOutStats(points)` : Side Out % et Break Out % par équipe
- [ ] Stats filtrées par contexte : Att% en side out, Rec Moy en side out, Pression service
- [ ] Bloc résumé "Side Out / Break Out" dans la vue détail match (SO% et BO% par équipe, par set et global)
- [ ] Métriques croisées dans l'onglet Stats Année : tableau récapitulatif par match + total saison
- [ ] Tests : set simulé → vérifier les % side out / break out vs comptage manuel

**Volet 5 — Améliorations UX**
- [ ] Navigation fluide entre onglets (pas de rechargement)
- [ ] Persistance de l'onglet actif (retour sur la même vue après navigation)
- [ ] Bouton d'export des stats (copier dans le presse-papier en format texte lisible)
- [ ] Lien direct vers la vidéo YouTube du match (si configurée dans match-set-config)
- [ ] Responsive : optimiser pour mobile (≤768px, cible 375–430px) ET MacBook Air 13" (≥1024px, cible 1470px) — cf. note responsive ci-dessus

### Dépendances mises à jour
```
Phase 1 (zones attaque)   ── ✅
Phase 1bis (relance)      ── ✅
Phase 3 (stats attaque)   ── ✅
Phase 2 (override joueur) ── ✅
Phase 4 (défense bloc)    ── ✅ (absorbée par 1 + 1bis)
Phase 6 (flèches bloc)    ── ✅
Phase 7 (bloc out 1-clic) ── ✅
Phase 8 (stats side out)  ─────────────────────────────────────────→ Phase 11 (absorbée)
Phase 9 (timeline séries) ── ✅
Phase 11 (refonte histo)  ── indépendante (peut être faite en parallèle de Phase 5)
Phase 5 (debug global)   ─────────────────────────────────────────→ Phase 10 (retrait mode test)
```

### Roadmap future (post-V11)
- Persistance long terme pour analytics multi-matchs/saisons
- Visualisation des patterns de jeu sur diagrammes terrain
- Statistiques joueurs sur plusieurs matchs
- Amélioration du déploiement GitHub Pages
