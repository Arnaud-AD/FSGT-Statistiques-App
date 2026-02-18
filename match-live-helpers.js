// match-live-helpers.js - Position roles & helpers
// ==================== HELPERS ====================
// ==================== POSITION ROLES ====================
const POSITION_ROLES = {
    home: { 1: 'Passeur', 2: 'R4', 3: 'Centre', 4: 'Pointu' },
    away: { 4: 'Passeur', 1: 'R4', 2: 'Centre', 3: 'Pointu' }
};

const ROLE_COLORS = {
    'Passeur': '#8b5cf6',
    'R4': '#3b82f6',
    'Centre': '#ef4444',
    'Pointu': '#22c55e'
};

// ==================== PASS QUALITY GRIDS (V19.1) ====================
// 9 grilles : 3 zones d'attaque (R4, Centre, Pointu) x 3 contextes (confort, contraint, transition)
// R4 : 8 lignes x 22 colonnes (18 terrain + 4 debordement gauche, ~2m hors touche)
// Centre : 8 lignes x 18 colonnes (terrain uniquement)
// Pointu : 8 lignes x 22 colonnes (18 terrain + 4 debordement droite, ~2m hors touche)
// Couvrant les ~4 premiers metres derriere le filet (~44% du demi-terrain)
// Valeurs : 4=Optimale (P4), 3=Bonne (P3), 2=Jouable (P2), 1=Mauvaise (P1)
// Grilles calibrees — source de verite dans le code, modifiables via pass-grids.html
// loadPassGridsFromStorage() peut les surcharger avec les valeurs localStorage au runtime
const PASS_GRIDS = {
    'R4': {
        'confort': [
            [1,1,1,2,4,4,4,3,2,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,1,1,3,4,4,4,3,2,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,1,1,3,3,3,3,3,2,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,1,1,2,2,2,2,2,2,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,2,2,2,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
        ],
        'contraint': [
            [1,1,1,3,4,4,4,4,3,2,2,1,1,1,1,1,1,1,1,1,1,1],
            [1,1,2,3,4,4,4,4,3,2,2,1,1,1,1,1,1,1,1,1,1,1],
            [1,1,2,3,4,4,4,4,3,2,2,1,1,1,1,1,1,1,1,1,1,1],
            [1,1,2,3,3,3,3,3,3,2,2,1,1,1,1,1,1,1,1,1,1,1],
            [1,1,1,1,2,2,2,2,2,2,2,1,1,1,1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,2,2,2,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
        ],
        'transition': [
            [1,1,2,3,4,4,4,4,4,3,2,1,1,1,1,1,1,1,1,1,1,1],
            [1,1,2,3,4,4,4,4,4,3,2,1,1,1,1,1,1,1,1,1,1,1],
            [1,1,2,3,4,4,4,4,4,3,2,1,1,1,1,1,1,1,1,1,1,1],
            [1,1,2,3,3,3,3,3,3,3,2,1,1,1,1,1,1,1,1,1,1,1],
            [1,1,2,2,2,2,3,3,3,3,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,1,1,1,2,2,2,2,2,2,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
        ]
    },
    'Centre': {
        'confort': [
            [1,1,1,1,1,2,3,4,4,4,4,3,2,1,1,1,1,1],
            [1,1,1,1,1,2,3,3,3,3,3,3,2,1,1,1,1,1],
            [1,1,1,1,1,2,2,2,2,2,2,2,2,1,1,1,1,1],
            [1,1,1,1,1,1,1,2,2,2,2,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
        ],
        'contraint': [
            [1,1,1,1,1,3,4,4,4,4,4,4,3,1,1,1,1,1],
            [1,1,1,1,1,3,3,4,4,4,4,3,3,1,1,1,1,1],
            [1,1,1,1,1,2,3,3,3,3,3,3,2,1,1,1,1,1],
            [1,1,1,1,1,1,2,2,2,2,2,2,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,2,2,2,2,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
        ],
        'transition': [
            [1,1,1,1,1,3,4,4,4,4,4,4,3,1,1,1,1,1],
            [1,1,1,1,1,3,3,4,4,4,4,3,3,1,1,1,1,1],
            [1,1,1,1,1,2,3,4,4,4,4,3,2,1,1,1,1,1],
            [1,1,1,1,1,2,3,3,3,3,3,3,2,1,1,1,1,1],
            [1,1,1,1,1,1,2,2,2,2,2,2,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,2,2,2,2,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
        ]
    },
    'Pointu': {
        'confort': [
            [1,1,1,1,1,1,1,1,1,1,1,1,1,3,4,4,4,4,2,1,1,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,3,4,4,4,4,3,1,1,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,3,3,3,3,3,3,1,1,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,2,2,2,3,3,2,1,1,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,2,2,2,1,1,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
        ],
        'contraint': [
            [1,1,1,1,1,1,1,1,1,1,1,1,1,3,4,4,4,4,3,1,1,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,3,4,4,4,4,3,2,1,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,3,4,4,4,4,3,2,1,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,3,3,3,3,3,3,2,1,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,2,2,2,2,2,2,2,1,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,2,2,1,1,1,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
        ],
        'transition': [
            [1,1,1,1,1,1,1,1,1,1,1,2,3,4,4,4,4,4,3,2,1,1],
            [1,1,1,1,1,1,1,1,1,1,1,2,3,4,4,4,4,4,3,2,1,1],
            [1,1,1,1,1,1,1,1,1,1,1,2,3,4,4,4,4,4,3,2,1,1],
            [1,1,1,1,1,1,1,1,1,1,1,2,3,3,3,3,3,3,3,2,1,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,2,2,3,3,3,3,3,2,1,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,2,2,2,2,2,2,2,2,1,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
        ]
    }
};

const PASS_QUALITY_LABELS = {
    4: 'Optimale',
    3: 'Bonne',
    2: 'Jouable',
    1: 'Mauvaise'
};

const PASS_GRID_ROWS = 8;
const PASS_GRID_COLS_BASE = 18;   // Colonnes terrain (9m / 50cm)
const PASS_GRID_COLS_EXTRA = 4;   // Colonnes hors-terrain (2m / 50cm)
const PASS_GRID_DEPTH = 44;       // % du demi-terrain couvert par la grille (≈4m sur 9m)
const PASS_GRID_OVERFLOW = 22.22; // % hors-terrain pour R4 (gauche) et Pointu (droite) = 2m/9m * 100

// Nombre de colonnes par zone
function getPassGridCols(zone) {
    return (zone === 'R4' || zone === 'Pointu') ? PASS_GRID_COLS_BASE + PASS_GRID_COLS_EXTRA : PASS_GRID_COLS_BASE;
}

/**
 * Charge les grilles de passe calibrees depuis localStorage et mute PASS_GRIDS en place.
 * Appelee au demarrage de match-live.html pour utiliser les grilles du calibrateur.
 * Migration integree : grilles 18 cols → 22 cols pour R4/Pointu.
 */
function loadPassGridsFromStorage() {
    const raw = localStorage.getItem('volleyball_pass_grids');
    if (!raw) return;
    try {
        const saved = JSON.parse(raw);
        ['R4', 'Centre', 'Pointu'].forEach(zone => {
            if (!saved[zone]) return;
            const expectedCols = getPassGridCols(zone);
            ['confort', 'contraint', 'transition'].forEach(ctx => {
                if (!saved[zone][ctx] || !PASS_GRIDS[zone] || !PASS_GRIDS[zone][ctx]) return;
                let grid = saved[zone][ctx];
                // Migration colonnes si necessaire (anciennes grilles 18 cols → 22 cols)
                if (grid[0] && grid[0].length < expectedCols) {
                    const diff = expectedCols - grid[0].length;
                    grid = grid.map(row => {
                        const extra = new Array(diff).fill(1);
                        return zone === 'R4' ? [...extra, ...row] : [...row, ...extra];
                    });
                }
                // Muter PASS_GRIDS en place (const objet → proprietes mutables)
                for (let r = 0; r < PASS_GRID_ROWS && r < grid.length; r++) {
                    PASS_GRIDS[zone][ctx][r] = grid[r];
                }
            });
        });
    } catch (e) {
        console.warn('[V19.1] Erreur chargement grilles passe:', e);
    }
}

function getPlayerByRole(team, role) {
    const lineup = team === 'home' ? currentSet.homeLineup : currentSet.awayLineup;
    const roles = POSITION_ROLES[team];
    for (const [pos, r] of Object.entries(roles)) {
        if (r === role) return lineup[pos];
    }
    return null;
}

function getPlayerRole(team, playerName) {
    const lineup = team === 'home' ? currentSet.homeLineup : currentSet.awayLineup;
    const roles = POSITION_ROLES[team];
    for (const [pos, name] of Object.entries(lineup)) {
        if (name === playerName) return roles[pos] || null;
    }
    return null;
}

const ROLE_ORDER = ['Passeur', 'R4', 'Centre', 'Pointu'];

function getLineupPlayers(team) {
    const lineup = team === 'home' ? currentSet.homeLineup : currentSet.awayLineup;
    const roles = POSITION_ROLES[team];
    return ROLE_ORDER
        .map(role => {
            const pos = Object.keys(roles).find(k => roles[k] === role);
            return pos ? lineup[pos] : null;
        })
        .filter(p => p !== null);
}

function showPositionZones(team) {
    const courtSide = getCourtSideForTeam(team);
    const zonesId = courtSide === 'top' ? 'positionZonesTop' : 'positionZonesBottom';
    const zones = document.getElementById(zonesId);
    
    const lineup = team === 'home' ? currentSet.homeLineup : currentSet.awayLineup;
    
    // Position numbers for back row roles
    let r4Pos, centrePos, pointuPos;
    if (team === 'home') {
        r4Pos = 2; centrePos = 3; pointuPos = 4;
    } else {
        r4Pos = 1; centrePos = 2; pointuPos = 3;
    }
    
    // Map viewer-left/center/right based on court side
    // Bottom court: R4 à gauche, Centre au milieu, Pointu à droite (comme composition home)
    // Top court: miroir (Pointu à gauche, Centre au milieu, R4 à droite)
    let mapping;
    if (courtSide === 'bottom') {
        mapping = [
            { player: lineup[r4Pos], role: 'R4', color: ROLE_COLORS['R4'] },
            { player: lineup[centrePos], role: 'Centre', color: ROLE_COLORS['Centre'] },
            { player: lineup[pointuPos], role: 'Pointu', color: ROLE_COLORS['Pointu'] }
        ];
    } else {
        // Top court: mirrored left-right
        mapping = [
            { player: lineup[pointuPos], role: 'Pointu', color: ROLE_COLORS['Pointu'] },
            { player: lineup[centrePos], role: 'Centre', color: ROLE_COLORS['Centre'] },
            { player: lineup[r4Pos], role: 'R4', color: ROLE_COLORS['R4'] }
        ];
    }
    
    const zoneElements = zones.querySelectorAll('.position-zone');
    mapping.forEach((m, i) => {
        zoneElements[i].style.background = m.color + 'cc';
        zoneElements[i].style.borderColor = m.color + '80';
        zoneElements[i].innerHTML = `<span class="zone-label">${m.role}<br>${m.player}</span>`;
        zoneElements[i].dataset.player = m.player;
        zoneElements[i].dataset.role = m.role;
    });
    
    zones.classList.add('active');
}

function hidePositionZones() {
    document.getElementById('positionZonesTop').classList.remove('active');
    document.getElementById('positionZonesBottom').classList.remove('active');
}

// Affiche les zones d'attaque sur le terrain de l'équipe.
// 2 zones (R4/Pointu) si centreAttack désactivé, 3 zones (R4/Centre/Pointu) si activé.
// excludePlayer : joueur qui a fait la passe (ne peut pas attaquer = double touche)
//   - null/undefined = cas standard phase pass (Passeur rôle fait la passe)
//   - nom du joueur = cas passe manuelle (ce joueur est remplacé dans sa zone par le Passeur rôle)
function showAttackZones(team, excludePlayer, visualOnly) {
    // Toujours nettoyer les deux côtés avant d'activer un seul côté
    hideAttackZones();
    const courtSide = getCourtSideForTeam(team);
    const zonesId = courtSide === 'top' ? 'attackZonesTop' : 'attackZonesBottom';
    const zones = document.getElementById(zonesId);

    const r4Player = getPlayerByRole(team, 'R4');
    const centrePlayer = getPlayerByRole(team, 'Centre');
    const pointuPlayer = getPlayerByRole(team, 'Pointu');
    const passeurPlayer = getPlayerByRole(team, 'Passeur');

    // Config attaque centre pour cette équipe
    const centreAttackEnabled = team === 'home'
        ? (currentSet.homeCentreAttack === true)
        : (currentSet.awayCentreAttack !== false); // défaut true pour away

    // Zone gauche = R4, Zone centre = Centre, Zone droite = Pointu (par défaut)
    let leftPlayer = r4Player, leftRole = 'R4', leftColor = ROLE_COLORS['R4'], leftDisabled = false;
    let centerPlayer = centrePlayer, centerRole = 'Centre', centerColor = ROLE_COLORS['Centre'], centerDisabled = false;
    let rightPlayer = pointuPlayer, rightRole = 'Pointu', rightColor = ROLE_COLORS['Pointu'], rightDisabled = false;

    if (excludePlayer) {
        if (excludePlayer === r4Player) {
            leftDisabled = true;
        }
        if (excludePlayer === centrePlayer) {
            centerDisabled = true;
        }
        if (excludePlayer === pointuPlayer) {
            // Pointu a fait la passe → zone droite = Passeur (physiquement de ce côté)
            rightPlayer = passeurPlayer;
            rightRole = 'Passeur';
            rightColor = ROLE_COLORS['Passeur'];
        }
    }

    // Activer/désactiver le mode centre sur le conteneur (contrôle les clip-paths CSS)
    if (centreAttackEnabled) {
        zones.classList.add('centre-enabled');
    } else {
        zones.classList.remove('centre-enabled');
    }

    // Mapping selon le côté du terrain (miroir pour le court top)
    // Centre reste au centre (pas de miroir), gauche/droite s'échangent
    let leftMapping, centerMapping, rightMapping;
    centerMapping = { player: centerPlayer, role: centerRole, color: centerColor, disabled: centerDisabled };

    if (courtSide === 'bottom') {
        leftMapping = { player: leftPlayer, role: leftRole, color: leftColor, disabled: leftDisabled };
        rightMapping = { player: rightPlayer, role: rightRole, color: rightColor, disabled: rightDisabled };
    } else {
        // Top: miroir — droite à gauche, gauche à droite
        leftMapping = { player: rightPlayer, role: rightRole, color: rightColor, disabled: rightDisabled };
        rightMapping = { player: leftPlayer, role: leftRole, color: leftColor, disabled: leftDisabled };
    }

    // Helper pour appliquer un mapping à un élément DOM
    const applyMapping = (el, m) => {
        // Mode 3 zones : fond quasi-opaque (pas de mélange avec l'orange du terrain)
        // Mode 2 zones : fond semi-transparent (comportement d'origine)
        el.style.background = m.color + 'cc';
        el.style.borderColor = m.color + '80';
        el.innerHTML = `<span class="zone-label">${m.role}<br>${m.player}</span>`;
        el.dataset.player = m.player;
        el.dataset.role = m.role;
        if (m.disabled) {
            el.classList.add('disabled');
        } else {
            el.classList.remove('disabled');
        }
    };

    applyMapping(zones.querySelector('.attack-zone[data-zone="left"]'), leftMapping);
    applyMapping(zones.querySelector('.attack-zone[data-zone="right"]'), rightMapping);
    if (centreAttackEnabled) {
        applyMapping(zones.querySelector('.attack-zone[data-zone="center"]'), centerMapping);
        // Label flottant hors du clip-path pour qu'il ne soit pas rogné
        let floatingLabel = zones.querySelector('.centre-floating-label');
        if (!floatingLabel) {
            floatingLabel = document.createElement('div');
            floatingLabel.className = 'centre-floating-label';
            zones.appendChild(floatingLabel);
        }
        floatingLabel.innerHTML = `${centerMapping.role}<br>${centerMapping.player}`;
        floatingLabel.style.color = centerMapping.disabled ? '#ffffff40' : '#fff';
        // Cacher le label interne de la zone centre (il serait croppé)
        const innerLabel = zones.querySelector('.attack-zone[data-zone="center"] .zone-label');
        if (innerLabel) innerLabel.style.display = 'none';
    }

    zones.classList.add('active');
    if (visualOnly) {
        zones.classList.add('visual-only');
    } else {
        zones.classList.remove('visual-only');
    }
}

function hideAttackZones() {
    ['attackZonesTop', 'attackZonesBottom'].forEach(id => {
        const zones = document.getElementById(id);
        zones.classList.remove('active', 'visual-only', 'centre-enabled');
        // Retirer le label flottant centre
        const floatingLabel = zones.querySelector('.centre-floating-label');
        if (floatingLabel) floatingLabel.remove();
    });
}

// Affiche les 3 zones de défense selon le rôle de l'attaquant adverse
// defendingTeam : équipe qui défend
// attackerRole : rôle de l'attaquant adverse ('R4', 'Pointu', 'Centre', 'Passeur')
function showDefenseZones(defendingTeam, attackerRole) {
    const courtSide = getCourtSideForTeam(defendingTeam);
    const zonesId = courtSide === 'top' ? 'defenseZonesTop' : 'defenseZonesBottom';
    const zones = document.getElementById(zonesId);

    // Nettoyer les classes de cas précédents
    zones.classList.remove('attack-r4', 'attack-pointu', 'attack-centre-left', 'attack-centre-right', 'attack-relance');

    // Auto-détecter le type d'attaque depuis gameState
    // IMPORTANT : en phase attack_type, le joueur n'a pas encore choisi → toujours zones standard
    let attackType = null;
    const isAttackTypePhase = typeof gameState !== 'undefined' && gameState && gameState.phase === 'attack_type';
    if (!isAttackTypePhase) {
        if (typeof gameState !== 'undefined' && gameState && gameState.currentAction && gameState.currentAction.attackType) {
            attackType = gameState.currentAction.attackType;
        }
        // Fallback: chercher la dernière attaque dans le rally en cours
        if (!attackType && typeof gameState !== 'undefined' && gameState && gameState.rally) {
            const lastAttack = [...gameState.rally].reverse().find(a => a.type === 'attack');
            if (lastAttack) attackType = lastAttack.attackType;
        }
    }

    // ===== CAS RELANCE : 4 zones FIXES (indépendantes du rôle de l'attaquant) =====
    if (attackType === 'relance') {
        zones.classList.add('attack-relance');
        // Mapping fixe : short=R4, line=Pointu, diagonal=Centre, extra=Passeur
        const zoneMapping = {
            short:    { player: getPlayerByRole(defendingTeam, 'R4'),      role: 'R4',      color: ROLE_COLORS['R4']      || '#3b82f6' },
            line:     { player: getPlayerByRole(defendingTeam, 'Pointu'),  role: 'Pointu',  color: ROLE_COLORS['Pointu']  || '#22c55e' },
            diagonal: { player: getPlayerByRole(defendingTeam, 'Centre'),  role: 'Centre',  color: ROLE_COLORS['Centre']  || '#ef4444' },
            extra:    { player: getPlayerByRole(defendingTeam, 'Passeur'), role: 'Passeur', color: ROLE_COLORS['Passeur'] || '#8b5cf6' }
        };

        // Appliquer les couleurs et labels aux 4 zones
        const zoneElements = zones.querySelectorAll('.defense-zone');
        zoneElements.forEach(el => {
            const zoneType = el.dataset.zone;
            const m = zoneMapping[zoneType];
            if (m) {
                el.style.background = m.color + 'cc';
                el.innerHTML = `<span class="zone-label">${m.role}<br>${m.player}</span>`;
                el.dataset.player = m.player;
                el.dataset.role = m.role;
            }
        });

        zones.classList.add('active');
        return;
    }

    // ===== CAS STANDARD : 3 zones dépendantes du rôle de l'attaquant =====
    // Passeur attaque comme le Pointu (même position)
    const effectiveRole = attackerRole === 'Passeur' ? 'Pointu' : attackerRole;

    // Déterminer qui bloque et qui défend où
    let zoneMapping; // { line: {player, role, color}, diagonal: {player, role, color}, short: {player, role, color} }

    if (effectiveRole === 'R4') {
        zones.classList.add('attack-r4');
        // R4 adverse attaque → le blockerRight bloque TOUJOURS face au R4
        // (Pointu ou Passeur selon config, positionné au filet côté R4)
        const blockerRightRole = defendingTeam === 'home'
            ? (currentSet.homeBlockerRight || 'Pointu')
            : (currentSet.awayBlockerRight || 'Pointu');
        const blockerRole = blockerRightRole;
        // Les 3 défenseurs = tous sauf le blockerRight
        // L'autre entre Passeur/Pointu (non-bloqueur)
        const otherSide = (blockerRightRole === 'Pointu') ? 'Passeur' : 'Pointu';
        // short = R4 (au filet petite diag, côté bloc)
        // Centre = fond court côté bloc (derrière le bloc)
        // non-bloqueur (Passeur/Pointu) = grande zone diagonale opposée
        //
        // ATTENTION : les noms CSS "line"/"diagonal" correspondent à des zones DIFFÉRENTES
        // selon le court (miroir X+Y) :
        //   Bottom court : "line" = fond côté bloc (petit), "diagonal" = grande zone opposée
        //   Top court :    "line" = grande zone côté bloc,  "diagonal" = fond côté bloc
        const shortRole = 'R4';
        let lineRole, diagRole;
        if (courtSide === 'bottom') {
            // Bottom : line=fond côté bloc=Centre, diagonal=grande zone opposée=non-bloqueur
            lineRole = 'Centre';
            diagRole = otherSide;
        } else {
            // Top : line=grande zone=non-bloqueur, diagonal=fond côté bloc=Centre
            lineRole = otherSide;
            diagRole = 'Centre';
        }

        zoneMapping = {
            short: { player: getPlayerByRole(defendingTeam, shortRole), role: shortRole, color: ROLE_COLORS[shortRole] || '#8b5cf6' },
            line: { player: getPlayerByRole(defendingTeam, lineRole), role: lineRole, color: ROLE_COLORS[lineRole] || '#8b5cf6' },
            diagonal: { player: getPlayerByRole(defendingTeam, diagRole), role: diagRole, color: ROLE_COLORS[diagRole] || '#8b5cf6' }
        };

    } else if (effectiveRole === 'Pointu') {
        zones.classList.add('attack-pointu');
        // Pointu adverse attaque → le R4 bloque TOUJOURS face au Pointu
        // (il est positionné au filet côté Pointu, c'est le bloqueur naturel)
        const blockerRole = 'R4';
        // Les 3 défenseurs = Passeur, Pointu, Centre (tous sauf R4)
        // Déterminer qui va en short (petite diag au filet) vs line (fond court)
        const blockerRightRole = defendingTeam === 'home'
            ? (currentSet.homeBlockerRight || 'Pointu')
            : (currentSet.awayBlockerRight || 'Pointu');
        // blockerRight = celui qui bloque habituellement côté R4 (pas ici, R4 bloque)
        // Il est donc dispo en défense : il va en short (petite diag au filet, côté bloc)
        // L'autre entre Passeur/Pointu (non-bloqueur) va en fond court côté bloc
        // Le Centre couvre la grande zone opposée
        //
        // ATTENTION : les noms CSS "line"/"diagonal" correspondent à des zones DIFFÉRENTES
        // selon le court (miroir X+Y), donc le mapping JS doit s'adapter :
        //   Top court :    "line" = grande zone droite (opposée), "diagonal" = fond côté bloc
        //   Bottom court : "line" = fond côté bloc,               "diagonal" = grande zone gauche (opposée)
        const shortRole = blockerRightRole;
        const nonBlockerRole = (blockerRightRole === 'Pointu') ? 'Passeur' : 'Pointu';
        let lineRole, diagRole;
        if (courtSide === 'top') {
            // Top : line=grande zone opposée=Centre, diagonal=fond côté bloc=non-bloqueur
            lineRole = 'Centre';
            diagRole = nonBlockerRole;
        } else {
            // Bottom : line=fond côté bloc=non-bloqueur, diagonal=grande zone opposée=Centre
            lineRole = nonBlockerRole;
            diagRole = 'Centre';
        }

        zoneMapping = {
            short: { player: getPlayerByRole(defendingTeam, shortRole), role: shortRole, color: ROLE_COLORS[shortRole] || '#8b5cf6' },
            line: { player: getPlayerByRole(defendingTeam, lineRole), role: lineRole, color: ROLE_COLORS[lineRole] || '#8b5cf6' },
            diagonal: { player: getPlayerByRole(defendingTeam, diagRole), role: diagRole, color: ROLE_COLORS[diagRole] || '#8b5cf6' }
        };
    } else if (effectiveRole === 'Centre') {
        // Centre adverse attaque depuis le milieu du filet
        // Qui bloque dépend du primaryBlocker :
        //   primaryBlocker === 'right' → le blockerRight (Pointu/Passeur) bloque
        //   primaryBlocker === 'R4'    → le R4 bloque (il couvre le centre du filet)
        const primaryBlocker = defendingTeam === 'home'
            ? (currentSet.homePrimaryBlocker || 'right')
            : (currentSet.awayPrimaryBlocker || 'right');
        const blockerRightRole = defendingTeam === 'home'
            ? (currentSet.homeBlockerRight || 'Pointu')
            : (currentSet.awayBlockerRight || 'Pointu');
        const otherSide = (blockerRightRole === 'Pointu') ? 'Passeur' : 'Pointu';

        // Short du côté du bloqueur (le défenseur court est à côté du bloc) :
        //   blockerRight bloque → short côté gauche écran bottom (attack-centre-left)
        //   R4 bloque           → short côté droit écran bottom (attack-centre-right)
        const isShortLeft = (primaryBlocker !== 'R4');
        zones.classList.add(isShortLeft ? 'attack-centre-left' : 'attack-centre-right');

        let shortRole, lineRole, diagRole;
        if (primaryBlocker === 'R4') {
            // R4 bloque → blockerRight (Pointu) en short à droite, Centre à gauche, otherSide à droite profond
            shortRole = blockerRightRole;
            lineRole = 'Centre';     // gauche écran (bottom) = grande zone
            diagRole = otherSide;    // droite écran (bottom) = zone profonde hors short
        } else {
            // blockerRight bloque → R4 en short à gauche, otherSide à droite, Centre à gauche profond
            shortRole = 'R4';
            lineRole = otherSide;    // droite écran (bottom)
            diagRole = 'Centre';     // gauche écran profond (bottom)
        }

        zoneMapping = {
            short: { player: getPlayerByRole(defendingTeam, shortRole), role: shortRole, color: ROLE_COLORS[shortRole] || '#8b5cf6' },
            line: { player: getPlayerByRole(defendingTeam, lineRole), role: lineRole, color: ROLE_COLORS[lineRole] || '#8b5cf6' },
            diagonal: { player: getPlayerByRole(defendingTeam, diagRole), role: diagRole, color: ROLE_COLORS[diagRole] || '#8b5cf6' }
        };
    }

    if (!zoneMapping) return;

    // Appliquer les couleurs et labels aux zones
    const zoneElements = zones.querySelectorAll('.defense-zone');
    zoneElements.forEach(el => {
        const zoneType = el.dataset.zone; // 'line', 'diagonal', 'short'
        const m = zoneMapping[zoneType];
        if (m) {
            el.style.background = m.color + 'cc';
            el.innerHTML = `<span class="zone-label">${m.role}<br>${m.player}</span>`;
            el.dataset.player = m.player;
            el.dataset.role = m.role;
        }
    });

    zones.classList.add('active');
}

function hideDefenseZones() {
    ['defenseZonesTop', 'defenseZonesBottom'].forEach(id => {
        const el = document.getElementById(id);
        el.classList.remove('active', 'attack-r4', 'attack-pointu', 'attack-centre-left', 'attack-centre-right', 'attack-relance');
        // Nettoyer le style inline et contenu de toutes les zones (y compris extra)
        el.querySelectorAll('.defense-zone').forEach(zone => {
            zone.style.background = '';
            zone.innerHTML = '';
            zone.dataset.player = '';
            zone.dataset.role = '';
        });
    });
    document.getElementById('defenseDirectAttackSection').classList.add('hidden');
}

// Trouve le défenseur correspondant à un clic out en prolongeant les zones de défense
// Uniquement après un block (la balle peut sortir du terrain mais être défendue)
// Logique simple par secteur : gauche/droite/derrière le terrain → zone correspondante
function findNearestDefenseZonePlayer(event) {
    // Trouver le container de zones actif
    const topZones = document.getElementById('defenseZonesTop');
    const bottomZones = document.getElementById('defenseZonesBottom');
    const isTop = topZones.classList.contains('active');
    const isBottom = bottomZones.classList.contains('active');
    const activeContainer = isTop ? topZones : isBottom ? bottomZones : null;
    if (!activeContainer) return null;

    // Obtenir le court-half parent
    const courtHalf = activeContainer.closest('.court-half');
    const courtRect = courtHalf.getBoundingClientRect();

    // Convertir les coordonnées client en % relatif au court-half
    const xPct = ((event.clientX - courtRect.left) / courtRect.width) * 100;
    const yPct = ((event.clientY - courtRect.top) / courtRect.height) * 100;

    // Déterminer le secteur out par rapport au terrain défenseur
    // Le "derrière" dépend de si c'est le terrain du haut ou du bas :
    //   - Bottom court (filet en haut) : derrière = y > 100 (en bas)
    //   - Top court (filet en bas) : derrière = y < 0 (en haut)
    let outSector; // 'left', 'right', 'behind'

    if (xPct < 0) {
        outSector = 'left';
    } else if (xPct > 100) {
        outSector = 'right';
    } else if (isBottom && yPct > 100) {
        outSector = 'behind';
    } else if (isTop && yPct < 0) {
        outSector = 'behind';
    } else {
        // Clic entre filet et terrain ou dans le terrain — pas un vrai out pour la défense
        // Regarder la direction dominante
        if (isBottom && yPct < 0) {
            // Devant le filet côté bottom — utiliser gauche/droite
            outSector = xPct < 50 ? 'left' : 'right';
        } else if (isTop && yPct > 100) {
            // Devant le filet côté top — utiliser gauche/droite
            outSector = xPct < 50 ? 'left' : 'right';
        } else {
            outSector = xPct < 50 ? 'left' : 'right';
        }
    }

    // Mapping secteur out → zone de défense
    // Le mapping dépend du type d'attaque ET du court (top/bottom) car :
    //   - Les zones short/line changent de côté entre R4 et Pointu
    //   - Le miroir X+Y du top court inverse aussi les côtés
    //
    // Positions des zones par cas :
    //   Bottom + R4 :     short=GAUCHE(filet), line=GAUCHE(fond), diagonal=DROITE
    //   Bottom + Pointu : short=DROITE(filet), line=DROITE(fond), diagonal=GAUCHE
    //   Bottom + Centre : short=CENTRE(filet), line=GAUCHE(fond), diagonal=DROITE(fond) [symétrique]
    //   Top + R4 :        short=DROITE(filet), line=GAUCHE,       diagonal=DROITE(fond)
    //   Top + Pointu :    short=GAUCHE(filet), line=DROITE,       diagonal=GAUCHE(fond)
    //   Top + Centre :    short=CENTRE(filet), line=DROITE(fond), diagonal=GAUCHE(fond) [symétrique miroir]
    const isRelanceAttack = activeContainer.classList.contains('attack-relance');
    const isPointuAttack = activeContainer.classList.contains('attack-pointu');
    const isCentreLeftAttack = activeContainer.classList.contains('attack-centre-left');
    const isCentreRightAttack = activeContainer.classList.contains('attack-centre-right');
    const isCentreAttack = isCentreLeftAttack || isCentreRightAttack;
    let targetZone;

    if (isRelanceAttack) {
        // Relance : 4 zones fixes en quadrants
        // Bottom : short(R4)=haut-gauche, extra(Passeur)=coin haut-droite,
        //          line(Pointu)=droite, diagonal(Centre)=bas
        // Top : miroir X+Y
        if (isBottom) {
            if (outSector === 'left') {
                targetZone = yPct < 50 ? 'short' : 'diagonal';
            } else if (outSector === 'right') {
                targetZone = yPct < 50 ? 'line' : 'diagonal';
            } else {
                // behind (bas)
                targetZone = xPct < 50 ? 'diagonal' : 'diagonal';
            }
        } else {
            // Top court (miroir)
            if (outSector === 'left') {
                targetZone = yPct > 50 ? 'line' : 'diagonal';
            } else if (outSector === 'right') {
                targetZone = yPct > 50 ? 'short' : 'diagonal';
            } else {
                // behind (haut)
                targetZone = 'diagonal';
            }
        }
    } else if (isCentreAttack) {
        // centre-left : line=droite écran (bottom), diagonal=gauche écran (bottom)
        // centre-right : line=gauche écran (bottom), diagonal=droite écran (bottom) — inversé
        if (isCentreLeftAttack) {
            if (outSector === 'behind') {
                targetZone = xPct < 50 ? 'diagonal' : 'line';
            } else if (isBottom) {
                targetZone = outSector === 'left' ? 'diagonal' : 'line';
            } else {
                targetZone = outSector === 'left' ? 'line' : 'diagonal';
            }
        } else {
            // centre-right : inversé
            if (outSector === 'behind') {
                targetZone = xPct < 50 ? 'line' : 'diagonal';
            } else if (isBottom) {
                targetZone = outSector === 'left' ? 'line' : 'diagonal';
            } else {
                targetZone = outSector === 'left' ? 'diagonal' : 'line';
            }
        }
    } else if (outSector === 'behind') {
        targetZone = 'diagonal';
    } else if (isBottom && !isPointuAttack) {
        // Bottom + R4 : short+line à gauche, diagonal à droite
        if (outSector === 'left') targetZone = 'line';
        else targetZone = 'diagonal'; // right
    } else if (isBottom && isPointuAttack) {
        // Bottom + Pointu : short+line à droite, diagonal à gauche
        if (outSector === 'left') targetZone = 'diagonal';
        else targetZone = 'line'; // right → line (fond-droite)
    } else if (isTop && !isPointuAttack) {
        // Top + R4 : line à gauche, short+diagonal à droite
        if (outSector === 'left') targetZone = 'line';
        else targetZone = 'diagonal'; // right → diagonal (fond-droite)
    } else {
        // Top + Pointu : short+diagonal à gauche, line à droite
        if (outSector === 'left') targetZone = 'diagonal';
        else targetZone = 'line'; // right → line (côté droit)
    }

    // Trouver le joueur assigné à cette zone
    const zoneEl = activeContainer.querySelector(`.defense-zone[data-zone="${targetZone}"]`);
    return zoneEl ? zoneEl.dataset.player : null;
}

// Parse un clip-path CSS polygon() en tableau de [x, y]
function parseClipPathPolygon(clipPath) {
    const match = clipPath.match(/polygon\(([^)]+)\)/);
    if (!match) return null;
    return match[1].split(',').map(pair => {
        const [x, y] = pair.trim().split(/\s+/).map(v => parseFloat(v));
        return [x, y];
    });
}

// Test point-in-polygon (ray casting)
function pointInPolygon(x, y, polygon) {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const xi = polygon[i][0], yi = polygon[i][1];
        const xj = polygon[j][0], yj = polygon[j][1];
        if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
            inside = !inside;
        }
    }
    return inside;
}

function getCourtSideForTeam(team) {
    // Retourne 'top' ou 'bottom' selon le côté caméra
    if (cameraSide === 'home') {
        return team === 'home' ? 'bottom' : 'top';
    } else {
        return team === 'home' ? 'top' : 'bottom';
    }
}

// ==================== PASS QUALITY EVALUATION (V19.1) ====================

/**
 * Determine la zone d'attaque visee par une passe (endPos).
 * Tiers du terrain : gauche = R4 (bottom) ou Pointu (top), centre = Centre, droite = inverse.
 * @param {Object} endPos - {x, y, courtSide}
 * @param {string} team - 'home' ou 'away'
 * @returns {string} 'R4' | 'Centre' | 'Pointu'
 */
function getPassZone(endPos, team) {
    const courtSide = getCourtSideForTeam(team);
    const x = endPos.x;

    if (courtSide === 'bottom') {
        // Bottom : gauche = R4, centre = Centre, droite = Pointu
        if (x < 33.33) return 'R4';
        if (x > 66.67) return 'Pointu';
        return 'Centre';
    } else {
        // Top : miroir — gauche = Pointu, centre = Centre, droite = R4
        if (x < 33.33) return 'Pointu';
        if (x > 66.67) return 'R4';
        return 'Centre';
    }
}

/**
 * V19.2 : Determine le contexte de la passe depuis l'historique du rally.
 * Retourne un objet {playerType, context} pour la ventilation stats.
 *
 * Passeur (role === 'Passeur'):
 *   R4 → confort | R3 → contraint | R2/R1 → contraint
 *   D+/R+ → contraint | D-/R- → transition
 *
 * Autre (non-passeur):
 *   R4/R3 → transition | R2/R1 → contraint
 *   D+/R+ → contraint | D-/R- → transition
 *
 * @param {Array} rally - Actions du rally en cours (SANS la passe courante)
 * @param {string} passerRole - Role du passeur ('Passeur', 'R4', etc.)
 * @returns {{ playerType: 'Passeur'|'Autre', context: 'confort'|'contraint'|'transition' }}
 */
function getPassContext(rally, passerRole) {
    const isPasseur = (passerRole === 'Passeur');
    const playerType = isPasseur ? 'Passeur' : 'Autre';
    const fallback = { playerType, context: 'transition' };

    // Chercher la derniere reception ou defense dans le rally
    for (let i = rally.length - 1; i >= 0; i--) {
        const action = rally[i];

        if (action.type === 'reception') {
            const score = action.quality ? action.quality.score : 2;
            if (isPasseur) {
                // Passeur: R4=confort, R3/R2/R1=contraint
                if (score === 4) return { playerType, context: 'confort' };
                return { playerType, context: 'contraint' };
            } else {
                // Autre: R4/R3=transition, R2/R1=contraint
                if (score >= 3) return { playerType, context: 'transition' };
                return { playerType, context: 'contraint' };
            }
        }

        if (action.type === 'defense') {
            // D+/R+ (positive) → contraint, D-/R- (negative) → transition
            const defQ = action.defenseQuality || 'negative';
            if (defQ === 'positive') return { playerType, context: 'contraint' };
            return { playerType, context: 'transition' };
        }
    }

    return fallback;
}

/**
 * Evalue la qualite d'une passe via lookup dans PASS_GRIDS.
 * @param {Object} endPos - {x, y, courtSide}
 * @param {string} zone - 'R4' | 'Centre' | 'Pointu'
 * @param {string} context - 'confort' | 'contraint' | 'transition'
 * @param {string} team - 'home' ou 'away'
 * @returns {Object} { quality: string, score: number, zone: string, context: string }
 */
function evaluatePassQuality(endPos, zone, context, team) {
    const courtSide = getCourtSideForTeam(team);

    // Normaliser Y en distance depuis le filet (0% = au filet, 100% = fond de terrain)
    let distFromNet;
    if (courtSide === 'bottom') {
        distFromNet = endPos.y; // Bottom : y=0 est le filet
    } else {
        distFromNet = 100 - endPos.y; // Top : y=100 est le filet
    }

    // Au-dela de la zone de detail (44%) → toujours P1
    if (distFromNet > PASS_GRID_DEPTH) {
        return { quality: 'mauvaise', score: 1, zone, context };
    }

    // Nombre de colonnes pour cette zone
    const totalCols = getPassGridCols(zone);

    // Mapper X vers la colonne
    // endPos.x est en % du court-half complet (0-100% = 9m de largeur terrain)
    // Chaque grille (R4/Centre/Pointu) couvre les 9m COMPLETS du terrain (18 cols = 50cm chacune)
    // R4 et Pointu ont 4 colonnes extra (2m) hors-terrain d'un cote → 22 cols au total = 11m
    let col;

    if (zone === 'R4' || zone === 'Pointu') {
        // Grille etendue : 22 colonnes = 11m
        // 18 cols couvrent 0-100% du terrain (9m), 4 cols couvrent 2m hors-terrain d'un cote
        // PASS_GRID_OVERFLOW = 2m/9m * 100 = 22.22% du terrain
        // Largeur totale de la grille en % du terrain : 100 + 22.22 = 122.22%
        const totalWidth = 100 + PASS_GRID_OVERFLOW; // 122.22%
        let xShifted;

        // R4 (bottom) deborde a GAUCHE / R4 (top) deborde a DROITE
        // Pointu (bottom) deborde a DROITE / Pointu (top) deborde a GAUCHE
        const overflowLeft = (zone === 'R4' && courtSide === 'bottom') || (zone === 'Pointu' && courtSide === 'top');
        if (overflowLeft) {
            // Grille va de x = -22.22% a x = 100% → decaler pour que -22.22 devienne 0
            xShifted = endPos.x + PASS_GRID_OVERFLOW;
        } else {
            // Grille va de x = 0% a x = 122.22% → pas de decalage
            xShifted = endPos.x;
        }
        col = Math.min(totalCols - 1, Math.max(0, Math.floor(xShifted / totalWidth * totalCols)));
    } else {
        // Centre : 18 colonnes couvrant 0-100% du terrain (9m)
        col = Math.min(totalCols - 1, Math.max(0, Math.floor(endPos.x / 100 * totalCols)));
    }

    // Miroir top court : les grilles sont calibrees depuis la perspective bottom (col 0 = gauche)
    // En top court, gauche/droite sont inverses → lire les colonnes a l'envers
    if (courtSide === 'top') {
        col = totalCols - 1 - col;
    }

    const row = Math.min(PASS_GRID_ROWS - 1, Math.max(0, Math.floor(distFromNet / PASS_GRID_DEPTH * PASS_GRID_ROWS)));

    // Lookup dans la grille
    const grid = PASS_GRIDS[zone] && PASS_GRIDS[zone][context];
    if (!grid || !grid[row]) {
        return { quality: 'jouable', score: 2, zone, context }; // Fallback si grille manquante
    }

    const score = grid[row][col] || 1;
    const labels = { 4: 'optimale', 3: 'bonne', 2: 'jouable', 1: 'mauvaise' };

    return { quality: labels[score] || 'jouable', score, zone, context };
}

// Retourne le bloqueur assigné à une zone du filet (left ou right)
function getBlockerForNetZone(blockingTeam, zone) {
    // Qui bloque côté droit du filet (face au R4 adverse) : Passeur ou Pointu
    const blockerRightRole = blockingTeam === 'home'
        ? (currentSet.homeBlockerRight || 'Pointu')
        : (currentSet.awayBlockerRight || 'Pointu');

    const blockingCourtSide = getCourtSideForTeam(blockingTeam);

    // Position des bloqueurs (fixe) :
    // Bottom court : R4 à gauche, bloqueur droit à droite
    // Top court : bloqueur droit à gauche, R4 à droite — miroir
    let r4Zone, rightBlockerZone;
    if (blockingCourtSide === 'bottom') {
        r4Zone = 'left';
        rightBlockerZone = 'right';
    } else {
        r4Zone = 'right';
        rightBlockerZone = 'left';
    }

    const role = (zone === r4Zone) ? 'R4' : blockerRightRole;
    const player = getPlayerByRole(blockingTeam, role);
    return { player, role };
}

// Active la zone filet cliquable, positionnée côté adverse (pas sur le terrain du réceptionneur)
// splitMode = true : découpe le filet en 2 zones (1/3 R4 + 2/3 bloqueur principal)
function activateNetZone(splitMode) {
    const netZone = document.getElementById('netClickZone');
    // Déterminer quel côté est le terrain de l'équipe qui défend (opposé à l'attaquant)
    const attackingTeam = gameState.attackingTeam;
    const defendingTeam = attackingTeam === 'home' ? 'away' : 'home';
    const defendingCourtSide = getCourtSideForTeam(defendingTeam);
    // La zone filet doit être côté défenseur
    netZone.classList.remove('adverse-top', 'adverse-bottom', 'split');
    if (defendingCourtSide === 'top') {
        netZone.classList.add('adverse-top');
    } else {
        netZone.classList.add('adverse-bottom');
    }
    netZone.classList.add('active');

    const leftZone = document.getElementById('netZoneLeft');
    const rightZone = document.getElementById('netZoneRight');

    if (splitMode) {
        netZone.classList.add('split');

        // L'équipe qui bloque = celle qui défend
        const blockingTeam = defendingTeam;
        const blockingCourtSide = getCourtSideForTeam(blockingTeam);

        // Calculer les bloqueurs pour chaque zone
        const leftBlocker = getBlockerForNetZone(blockingTeam, 'left');
        const rightBlocker = getBlockerForNetZone(blockingTeam, 'right');

        // Qui est le bloqueur principal ? ('right' = bloqueur droit, 'R4')
        const primaryBlocker = blockingTeam === 'home'
            ? (currentSet.homePrimaryBlocker || 'right')
            : (currentSet.awayPrimaryBlocker || 'right');

        // Déterminer quelle zone est le R4 (pour appliquer les widths)
        const r4Zone = (blockingCourtSide === 'bottom') ? 'left' : 'right';
        const rightBlockerZone = (blockingCourtSide === 'bottom') ? 'right' : 'left';

        // Dimensions : 2/3 pour le principal, 1/3 pour l'autre
        if (primaryBlocker === 'R4') {
            // R4 est principal → R4 en 2/3, bloqueur droit en 1/3
            if (r4Zone === 'left') {
                leftZone.style.width = '66.67%';
                rightZone.style.width = '33.33%';
            } else {
                leftZone.style.width = '33.33%';
                rightZone.style.width = '66.67%';
            }
        } else {
            // Bloqueur droit est principal → bloqueur droit en 2/3, R4 en 1/3
            if (r4Zone === 'left') {
                leftZone.style.width = '33.33%';
                rightZone.style.width = '66.67%';
            } else {
                leftZone.style.width = '66.67%';
                rightZone.style.width = '33.33%';
            }
        }

        // Data-attributes pour le clic
        leftZone.dataset.player = leftBlocker.player || '';
        leftZone.dataset.role = leftBlocker.role;
        rightZone.dataset.player = rightBlocker.player || '';
        rightZone.dataset.role = rightBlocker.role;

        // Couleurs selon le rôle
        leftZone.style.backgroundColor = ROLE_COLORS[leftBlocker.role] || 'rgba(255,255,255,0.2)';
        rightZone.style.backgroundColor = ROLE_COLORS[rightBlocker.role] || 'rgba(255,255,255,0.2)';

        // Labels avec nom du joueur
        leftZone.innerHTML = `<span class="zone-blocker-label">${leftBlocker.player || leftBlocker.role}</span>`;
        rightZone.innerHTML = `<span class="zone-blocker-label">${rightBlocker.player || rightBlocker.role}</span>`;
    } else {
        // Mode non-split : nettoyer les sous-zones
        leftZone.style.width = '';
        leftZone.style.backgroundColor = '';
        leftZone.innerHTML = '';
        leftZone.removeAttribute('data-player');
        leftZone.removeAttribute('data-role');
        rightZone.style.width = '';
        rightZone.style.backgroundColor = '';
        rightZone.innerHTML = '';
        rightZone.removeAttribute('data-player');
        rightZone.removeAttribute('data-role');
    }
}

// Désactive la zone filet cliquable
function deactivateNetZone() {
    const netZone = document.getElementById('netClickZone');
    netZone.classList.remove('active', 'adverse-top', 'adverse-bottom', 'split');
    // Nettoyer les sous-zones
    const leftZone = document.getElementById('netZoneLeft');
    const rightZone = document.getElementById('netZoneRight');
    if (leftZone) {
        leftZone.style.width = '';
        leftZone.style.backgroundColor = '';
        leftZone.innerHTML = '';
        leftZone.removeAttribute('data-player');
        leftZone.removeAttribute('data-role');
    }
    if (rightZone) {
        rightZone.style.width = '';
        rightZone.style.backgroundColor = '';
        rightZone.innerHTML = '';
        rightZone.removeAttribute('data-player');
        rightZone.removeAttribute('data-role');
    }
}

// Retourne le joueur qui a fait la dernière touche de balle dans la même équipe
function getLastTouchPlayer(team) {
    if (gameState.rally.length === 0) return null;
    const lastAction = gameState.rally[gameState.rally.length - 1];
    if (lastAction.team === team && lastAction.player) {
        return lastAction.player;
    }
    return null;
}

// ==================== SYSTÈME UNIFIÉ OVERRIDE JOUEURS (Phase 2) ====================

// Met à jour le bandeau #phaseIndicator avec le joueur auto-sélectionné + action
// Si playerName est null, affiche "ActionLabel — Sélectionnez le joueur"
function updatePhaseIndicatorWithPlayer(playerName, role, actionLabel) {
    const phaseEl = document.getElementById('phaseIndicator');
    if (playerName) {
        const color = ROLE_COLORS[role] || '#8b5cf6';
        phaseEl.innerHTML = `<span class="highlight">${actionLabel}</span> — <span class="phase-player-badge" style="background:${color}">${playerName}</span>`;
    } else {
        phaseEl.innerHTML = `<span class="highlight">${actionLabel}</span> — Sélectionnez le joueur`;
    }
}

// Fonction unifiée pour afficher les tags override/sélection joueur
// config.mode = 'override' : clic tag = set overridePlayer, attend clic terrain
// config.mode = 'select'  : clic tag = appelle handlePlayerSelection immédiatement
function renderOverrideTags(config) {
    const {
        team, phaseLabel, autoPlayer = null, autoRole = null,
        eligiblePlayers, mode = 'override',
        showAceButton = false
    } = config;
    // excludePlayers ignoré — on affiche toujours les 4 joueurs

    // 1. Stocker le joueur auto-sélectionné et l'équipe des tags
    gameState.autoSelectedPlayer = autoPlayer;
    gameState.overridePlayer = null; // Reset override à chaque nouveau rendu de tags
    gameState.overrideTagsTeam = team; // Pour updateOverrideVisuals()

    // 2. Mettre à jour le bandeau
    updatePhaseIndicatorWithPlayer(autoPlayer, autoRole, phaseLabel);

    // 3. Trier les joueurs dans l'ordre fixe : Passeur → R4 → Centre → Pointu
    const ROLE_ORDER = ['Passeur', 'R4', 'Centre', 'Pointu'];
    const tagPlayers = [...eligiblePlayers].sort((a, b) => {
        const roleA = getPlayerRole(team, a);
        const roleB = getPlayerRole(team, b);
        return ROLE_ORDER.indexOf(roleA) - ROLE_ORDER.indexOf(roleB);
    });

    // 4. Rendre les tags
    const container = document.getElementById('playerTags');
    document.getElementById('playerSelectionTitle').textContent = '';

    let html = tagPlayers.map(playerName => {
        const role = getPlayerRole(team, playerName);
        const color = ROLE_COLORS[role] || '#8b5cf6';
        const isAuto = (mode === 'override' && playerName === autoPlayer);
        const selectedClass = isAuto ? ' selected' : '';
        if (mode === 'override') {
            return `<button class="player-tag override-tag${selectedClass} ${team}" data-player="${playerName}"
                        onclick="handleOverrideTag('${playerName}')"
                        style="--tag-role-color: ${color}; border-color: ${color}; color: ${color}">
                        ${playerName}
                    </button>`;
        } else {
            return `<button class="player-tag override-tag ${team}" data-player="${playerName}"
                        onclick="handlePlayerSelection('${playerName}')"
                        style="--tag-role-color: ${color}; border-color: ${color}; color: ${color}">
                        ${playerName}
                    </button>`;
        }
    }).join('');

    // Boutons Ace et Faute réception en phase réception
    if (showAceButton) {
        html += `<button class="action-tag ace" onclick="WorkflowEngine.handleButton('ace')">🎯 Ace</button>`;
        html += `<button class="action-tag faute" onclick="WorkflowEngine.handleButton('receptionFault')">❌ Faute réception</button>`;
    }

    container.innerHTML = html;

    // Ne PAS appeler showSection() pour éviter hideAllSections()
    document.getElementById('playerSelection').classList.remove('hidden');
}

// Helper : retourne le joueur effectif (override ou auto-sélectionné)
function getEffectivePlayer() {
    return gameState.overridePlayer || gameState.autoSelectedPlayer;
}

// Gère le clic sur un tag override
function handleOverrideTag(playerName) {
    if (playerName === gameState.autoSelectedPlayer) {
        // Clic sur le joueur auto-sélectionné = retour au mode auto
        gameState.overridePlayer = null;
    } else if (gameState.overridePlayer === playerName) {
        // Re-clic sur l'override actif = retour au mode auto
        gameState.overridePlayer = null;
    } else {
        gameState.overridePlayer = playerName;
    }
    updateOverrideVisuals();
}

// Met à jour les visuels des tags override et du bandeau
function updateOverrideVisuals() {
    // Le joueur actif = override si défini, sinon auto-sélectionné
    const activePlayer = gameState.overridePlayer || gameState.autoSelectedPlayer;
    document.querySelectorAll('.override-tag').forEach(tag => {
        if (tag.dataset.player === activePlayer) {
            tag.classList.add('selected');
        } else {
            tag.classList.remove('selected');
        }
    });

    // Mettre à jour le bandeau avec le joueur effectif (overridé ou auto)
    const effectivePlayer = gameState.overridePlayer || gameState.autoSelectedPlayer;
    const team = gameState.overrideTagsTeam || gameState.attackingTeam;
    const role = effectivePlayer ? getPlayerRole(team, effectivePlayer) : null;

    // Récupérer le label de phase depuis le bandeau actuel
    const highlightEl = document.querySelector('#phaseIndicator .highlight');
    const phaseLabel = highlightEl ? highlightEl.textContent : '';

    updatePhaseIndicatorWithPlayer(effectivePlayer, role, phaseLabel);
}

// Helper défense unifié : remplace le pattern if/else renderDefenseZonesOnly/renderPlayerSelection
function renderDefenseSelection(team, attackerRole, showDirectAttack = false) {
    if (attackerRole) {
        showDefenseZones(team, attackerRole);
        renderOverrideTags({
            team,
            phaseLabel: 'Défense',
            autoPlayer: null,
            autoRole: null,
            eligiblePlayers: getLineupPlayers(team),
            mode: 'override'
        });
    } else {
        renderOverrideTags({
            team,
            phaseLabel: 'Défense',
            autoPlayer: null,
            autoRole: null,
            eligiblePlayers: getLineupPlayers(team),
            mode: 'select'
        });
    }
    // Bouton Attaque directe visible seulement après un bloc
    const section = document.getElementById('defenseDirectAttackSection');
    if (showDirectAttack) {
        section.classList.remove('hidden');
    } else {
        section.classList.add('hidden');
    }
}

// V18.0 : Délègue au WorkflowEngine au lieu du switch/case
function handlePlayerSelection(playerName) {
    WorkflowEngine.handleButton('selectPlayer', playerName);
}

function showSection(sectionId) {
    hideAllSections();
    document.getElementById(sectionId).classList.remove('hidden');
}

function hideAllSections() {
    document.getElementById('serverSelection').classList.add('hidden');
    document.getElementById('serverContinue').classList.add('hidden');
    document.getElementById('playerSelection').classList.add('hidden');
    document.getElementById('secondTouchOptions').classList.add('hidden');
    document.getElementById('passDirectReturnChoice').classList.add('hidden');
    deactivateNetZone();
    document.getElementById('attackTypeSelection').classList.add('hidden');
    document.getElementById('resultSelection').classList.add('hidden');
    document.getElementById('receptionFaultSection').classList.add('hidden');
    document.getElementById('receptionOpponentChoice').classList.add('hidden');
    document.getElementById('receptionNetChoice').classList.add('hidden');
    document.getElementById('passNetChoice').classList.add('hidden');
    document.getElementById('attackNetChoice').classList.add('hidden');
    document.getElementById('receptionFaultTrajectory').classList.add('hidden');
    document.getElementById('defenseDirectAttackSection').classList.add('hidden');
    document.getElementById('blockKillBtn').classList.add('hidden');
    document.getElementById('defenseDirectReturnChoice').classList.add('hidden');
    document.getElementById('defenseFaultSection').classList.add('hidden');
    document.getElementById('defenseFaultTrajectory').classList.add('hidden');
    document.getElementById('blocOutTrajectory').classList.add('hidden');
    document.getElementById('outArea').classList.remove('active');
    hideReceptionQualityZones();
    hidePositionZones();
    hideAttackZones();
}

function highlightCourt(team) {
    const courtTop = document.getElementById('courtTop');
    const courtBottom = document.getElementById('courtBottom');

    courtTop.classList.remove('target', 'inactive');
    courtBottom.classList.remove('target', 'inactive');

    if (team === null) {
        // Pas de highlight
        return;
    }

    const targetSide = getCourtSideForTeam(team);

    if (targetSide === 'top') {
        courtTop.classList.add('target');
        courtBottom.classList.add('inactive');
    } else {
        courtBottom.classList.add('target');
        courtTop.classList.add('inactive');
    }
}

function addMarker(pos, actionType) {
    const courtContainer = document.getElementById('courtContainer');
    const courtTop = document.getElementById('courtTop');
    const courtBottom = document.getElementById('courtBottom');
    const serviceZoneTop = document.getElementById('serviceZoneTop');
    const serviceZoneBottom = document.getElementById('serviceZoneBottom');

    const marker = document.createElement('div');
    marker.className = `click-marker ${actionType}`;

    // Calculer la position absolue dans le courtContainer
    const containerRect = courtContainer.getBoundingClientRect();
    
    // Cas spécial : clic en dehors du terrain (out) ou sur le filet (net)
    if (pos.courtSide === 'out' || pos.courtSide === 'net') {
        const left = (pos.x / 100) * containerRect.width;
        const top = (pos.y / 100) * containerRect.height;
        
        marker.style.left = `${left}px`;
        marker.style.top = `${top}px`;
        courtContainer.appendChild(marker);
        return;
    }
    
    let targetElement;
    
    if (pos.courtSide === 'service_top') {
        targetElement = serviceZoneTop;
    } else if (pos.courtSide === 'service_bottom') {
        targetElement = serviceZoneBottom;
    } else if (pos.courtSide === 'top') {
        targetElement = courtTop;
    } else {
        targetElement = courtBottom;
    }
    
    const targetRect = targetElement.getBoundingClientRect();
    const offsetTop = targetRect.top - containerRect.top;
    const offsetLeft = targetRect.left - containerRect.left;
    const left = (pos.x / 100) * targetRect.width + offsetLeft;
    const top = (pos.y / 100) * targetRect.height + offsetTop;

    marker.style.left = `${left}px`;
    marker.style.top = `${top}px`;

    courtContainer.appendChild(marker);
}

function drawArrow(from, to, actionType) {
    const svg = document.getElementById('arrowSvg');
    const courtContainer = document.getElementById('courtContainer');
    const courtTop = document.getElementById('courtTop');
    const courtBottom = document.getElementById('courtBottom');
    const serviceZoneTop = document.getElementById('serviceZoneTop');
    const serviceZoneBottom = document.getElementById('serviceZoneBottom');
    const containerRect = courtContainer.getBoundingClientRect();
    
    // Décalage du SVG (il est positionné à -50px, -50px)
    const svgOffset = 50;

    // Calculer les positions
    function getAbsolutePos(pos) {
        // Cas spécial : position out ou filet (en dehors du terrain)
        if (pos.courtSide === 'out' || pos.courtSide === 'net') {
            const left = (pos.x / 100) * containerRect.width + svgOffset;
            const top = (pos.y / 100) * containerRect.height + svgOffset;
            return { x: left, y: top };
        }
        
        let targetElement;
        
        if (pos.courtSide === 'service_top') {
            targetElement = serviceZoneTop;
        } else if (pos.courtSide === 'service_bottom') {
            targetElement = serviceZoneBottom;
        } else if (pos.courtSide === 'top') {
            targetElement = courtTop;
        } else {
            targetElement = courtBottom;
        }
        
        const targetRect = targetElement.getBoundingClientRect();
        const offsetTop = targetRect.top - containerRect.top + svgOffset;
        const offsetLeft = targetRect.left - containerRect.left + svgOffset;
        const left = (pos.x / 100) * targetRect.width + offsetLeft;
        const top = (pos.y / 100) * targetRect.height + offsetTop;
        return { x: left, y: top };
    }

    const startPos = getAbsolutePos(from);
    const endPos = getAbsolutePos(to);

    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('class', `arrow-line ${actionType}`);
    line.setAttribute('x1', startPos.x);
    line.setAttribute('y1', startPos.y);
    line.setAttribute('x2', endPos.x);
    line.setAttribute('y2', endPos.y);
    line.setAttribute('marker-end', `url(#arrowhead-${actionType})`);

    svg.appendChild(line);
}

// Convertit une position court en position centrée sur le filet.
// Conserve la coordonnée X réelle mais place le Y au centre du filet.
// Utilisé pour les flèches de bloc qui doivent partir du filet.
function getNetCenteredPos(pos) {
    const container = document.getElementById('courtContainer');
    const netElement = document.getElementById('netZone');
    const containerRect = container.getBoundingClientRect();
    const netRect = netElement.getBoundingClientRect();

    // Y du centre du filet en % du container
    const netCenterY = ((netRect.top + netRect.height / 2 - containerRect.top) / containerRect.height) * 100;

    // Convertir le X de la court-half au container
    let netX;
    if (pos.courtSide === 'net' || pos.courtSide === 'out') {
        netX = pos.x;
    } else {
        const sourceId = pos.courtSide === 'top' ? 'courtTop' : 'courtBottom';
        const sourceElement = document.getElementById(sourceId);
        const sourceRect = sourceElement.getBoundingClientRect();
        const absoluteX = (pos.x / 100) * sourceRect.width + sourceRect.left;
        netX = ((absoluteX - containerRect.left) / containerRect.width) * 100;
    }

    return { x: netX, y: netCenterY, courtSide: 'net' };
}

// Retourne le type de flèche SVG correspondant au type d'attaque
function getAttackArrowType(attackType) {
    if (attackType === 'feinte') return 'attack-feinte';
    if (attackType === 'relance') return 'attack-relance';
    if (attackType === 'deuxieme_main') return 'attack-second';
    return 'attack';
}

function clearMarkers() {
    document.querySelectorAll('.click-marker').forEach(m => m.remove());
}

function clearArrows() {
    const svg = document.getElementById('arrowSvg');
    svg.querySelectorAll('line').forEach(l => l.remove());
}

function undoLastAction() {
    // Si on est à la sélection du serveur, rien à annuler
    if (gameState.phase === 'server_selection') {
        return;
    }

    // Reset override player (Phase 2)
    gameState.overridePlayer = null;
    gameState.autoSelectedPlayer = null;

    // Effacer les markers, flèches et zones de défense
    clearMarkers();
    clearArrows();
    hideDefenseZones();
    hideDefenseQualityZones();

    // Déterminer l'état précédent selon la phase actuelle
    switch (gameState.phase) {
        case 'serve_start':
            // Retour à la sélection du serveur
            gameState.phase = 'server_selection';
            gameState.currentAction = {};
            gameState.rally = []; // Vider le rally pour éviter les artefacts visuels résiduels
            hideServiceZones();
            renderServerSelection();
            break;

        case 'serve_end':
            // Retour au début du service
            gameState.phase = 'serve_start';
            gameState.currentAction = {
                type: 'service',
                player: gameState.currentServer,
                team: gameState.servingTeam
            };
            hideAllSections();
            highlightCourt(null);
            showServiceZone();
            break;

        case 'ace_reception':
            // Retour à la phase reception (tags joueurs)
            gameState.phase = 'reception';
            hideAllSections();
            // Remettre le service result à 'in' (annuler le marquage ace)
            const aceServiceAction = gameState.rally.find(a => a.type === 'service');
            if (aceServiceAction) {
                aceServiceAction.result = 'in';
            }
            showPositionZones(gameState.attackingTeam);
            renderOverrideTags({
                team: gameState.attackingTeam,
                phaseLabel: 'Réception',
                autoPlayer: null,
                autoRole: null,
                eligiblePlayers: getLineupPlayers(gameState.attackingTeam),
                mode: 'override',
                showAceButton: true
            });
            redrawRally();
            break;

        case 'reception':
            // Retour à serve_end
            gameState.phase = 'serve_end';
            // Récupérer les données du service depuis le rally
            const serviceFromRally = gameState.rally.pop(); // Retirer le service du rally
            if (serviceFromRally) {
                // Garder seulement startPos, on va re-cliquer endPos
                gameState.currentAction = {
                    type: 'service',
                    player: serviceFromRally.player,
                    team: serviceFromRally.team,
                    startPos: serviceFromRally.startPos
                };
            }
            hideAllSections();
            const recvTeam = gameState.servingTeam === 'home' ? 'away' : 'home';
            highlightCourt(recvTeam);
            // Réactiver zone out et zone filet
            document.getElementById('outArea').classList.add('active');
            activateNetZone();
            // Afficher les zones de position pour auto-sélection
            showPositionZones(recvTeam);
            const servCourtSide = getCourtSideForTeam(gameState.servingTeam);
            document.getElementById('outLabelTop').style.display = servCourtSide === 'top' ? 'none' : 'block';
            document.getElementById('outLabelBottom').style.display = servCourtSide === 'bottom' ? 'none' : 'block';
            // Redessiner (juste le marker de départ du service)
            redrawRally();
            // Ajouter le marker de départ du service en cours
            if (gameState.currentAction.startPos) {
                addMarker(gameState.currentAction.startPos, 'service');
            }
            break;

        case 'reception_end':
            if (gameState.receptionAutoSelected) {
                // Auto-sélectionné: retour combiné à serve_end
                gameState.phase = 'serve_end';
                gameState.receptionAutoSelected = false;
                // Retirer le service du rally
                const autoServiceAction = gameState.rally.pop();
                if (autoServiceAction) {
                    gameState.currentAction = {
                        type: 'service',
                        player: autoServiceAction.player,
                        team: autoServiceAction.team,
                        startPos: autoServiceAction.startPos,
                        role: autoServiceAction.role
                    };
                }
                hideAllSections();
                hideReceptionQualityZones();
                document.getElementById('receptionFaultSection').classList.add('hidden');
                const autoRecvTeam = gameState.servingTeam === 'home' ? 'away' : 'home';
                highlightCourt(autoRecvTeam);
                // Réactiver zone out et zone filet
                document.getElementById('outArea').classList.add('active');
                activateNetZone();
                showPositionZones(autoRecvTeam);
                // Labels OUT corrects
                const autoSrvCourtSide = getCourtSideForTeam(gameState.servingTeam);
                document.getElementById('outLabelTop').style.display = autoSrvCourtSide === 'top' ? 'none' : 'block';
                document.getElementById('outLabelBottom').style.display = autoSrvCourtSide === 'bottom' ? 'none' : 'block';
                redrawRally();
                if (gameState.currentAction.startPos) {
                    addMarker(gameState.currentAction.startPos, 'service');
                }
            } else {
                // Retour standard à la sélection du réceptionneur
                gameState.phase = 'reception';
                hideReceptionQualityZones();
                document.getElementById('receptionFaultSection').classList.add('hidden');
                showPositionZones(gameState.attackingTeam);
                renderOverrideTags({
                    team: gameState.attackingTeam,
                    phaseLabel: 'Réception',
                    autoPlayer: null,
                    autoRole: null,
                    eligiblePlayers: getLineupPlayers(gameState.attackingTeam),
                    mode: 'override',
                    showAceButton: true
                });
                redrawRally();
            }
            break;

        case 'direct_return_end':
            // Retour à reception_end (avant le clic sur retour direct)
            gameState.phase = 'reception_end';
            gameState.currentAction.isDirectReturn = false;
            gameState.currentAction.quality = null;
            hideAllSections();
            highlightCourt(gameState.attackingTeam);
            showReceptionQualityZones();
            document.getElementById('receptionFaultSection').classList.remove('hidden');
            document.getElementById('outArea').classList.add('active');
            activateNetZone(true);
            redrawRally();
            break;

        case 'reception_fault_trajectory':
            // Retour à reception_end
            gameState.phase = 'reception_end';
            gameState.currentAction.quality = null;
            gameState.currentAction.faultTrajectory = null;
            hideAllSections();
            highlightCourt(gameState.attackingTeam);
            showReceptionQualityZones();
            document.getElementById('receptionFaultSection').classList.remove('hidden');
            document.getElementById('outArea').classList.add('active');
            activateNetZone(true);
            const faultUndoCourtSide = getCourtSideForTeam(gameState.attackingTeam);
            document.getElementById('outLabelTop').style.display = faultUndoCourtSide === 'top' ? 'block' : 'none';
            document.getElementById('outLabelBottom').style.display = faultUndoCourtSide === 'bottom' ? 'block' : 'none';
            redrawRally();
            break;

        case 'reception_opponent_choice':
            // Retour à reception_end (avant le clic sur terrain adverse)
            gameState.phase = 'reception_end';
            gameState.currentAction.quality = null;
            gameState.currentAction.isDirectReturn = false;
            gameState.currentAction.directReturnEndPos = null;
            gameState.receptionOpponentClickData = null;
            hideAllSections();
            highlightCourt(gameState.attackingTeam);
            showReceptionQualityZones();
            document.getElementById('receptionFaultSection').classList.remove('hidden');
            document.getElementById('outArea').classList.add('active');
            activateNetZone(true);
            const opChoiceUndoCourtSide = getCourtSideForTeam(gameState.attackingTeam);
            document.getElementById('outLabelTop').style.display = opChoiceUndoCourtSide === 'top' ? 'block' : 'none';
            document.getElementById('outLabelBottom').style.display = opChoiceUndoCourtSide === 'bottom' ? 'block' : 'none';
            redrawRally();
            break;

        case 'reception_net_choice':
            // Retour à reception_end (avant le clic sur le filet)
            gameState.phase = 'reception_end';
            gameState.currentAction.quality = null;
            gameState.currentAction.isNetDirect = false;
            gameState.currentAction.isNetBlock = false;
            gameState.currentAction.endPos = null;
            hideAllSections();
            highlightCourt(gameState.attackingTeam);
            showReceptionQualityZones();
            document.getElementById('receptionFaultSection').classList.remove('hidden');
            document.getElementById('outArea').classList.add('active');
            activateNetZone(true);
            const netChoiceUndoCourtSide = getCourtSideForTeam(gameState.attackingTeam);
            document.getElementById('outLabelTop').style.display = netChoiceUndoCourtSide === 'top' ? 'block' : 'none';
            document.getElementById('outLabelBottom').style.display = netChoiceUndoCourtSide === 'bottom' ? 'block' : 'none';
            redrawRally();
            break;

        case 'reception_net_block_player':
            // Retour à reception_net_choice (retirer la réception du rally)
            gameState.rally.pop(); // Retirer la réception
            gameState.phase = 'reception_net_choice';
            // Restaurer currentAction comme réception
            const lastRecForBlock = gameState.rally[gameState.rally.length - 1];
            // On recrée l'état de reception_net_choice
            updatePhase();
            hideAllSections();
            document.getElementById('receptionNetChoice').classList.remove('hidden');
            redrawRally();
            break;

        case 'reception_net_block_end':
            // Retour à reception_net_choice (le bloqueur est auto-sélectionné)
            gameState.phase = 'reception_net_choice';
            updatePhase();
            hideAllSections();
            document.getElementById('receptionNetChoice').classList.remove('hidden');
            redrawRally();
            break;

        case 'pass_net_choice':
            // Retour à pass_end (retirer la passe du rally)
            const passNetAction = gameState.rally.pop(); // Retirer la passe
            gameState.phase = 'pass_end';
            updatePhase();
            hideAllSections();
            highlightCourt(null);
            document.getElementById('outArea').classList.add('active');
            activateNetZone(true);
            const passNetUndoCourtSide = getCourtSideForTeam(gameState.attackingTeam);
            document.getElementById('outLabelTop').style.display = passNetUndoCourtSide === 'top' ? 'block' : 'none';
            document.getElementById('outLabelBottom').style.display = passNetUndoCourtSide === 'bottom' ? 'block' : 'none';
            // Afficher les zones d'attaque visuelles
            if (passNetAction && passNetAction.player) {
                showAttackZones(gameState.attackingTeam, passNetAction.player, true);
            }
            redrawRally();
            break;

        case 'pass_net_block_player':
            // Retour à pass_net_choice
            gameState.phase = 'pass_net_choice';
            updatePhase();
            hideAllSections();
            document.getElementById('passNetChoice').classList.remove('hidden');
            redrawRally();
            break;

        case 'pass_net_block_end':
            // Retour à pass_net_choice (le bloqueur est auto-sélectionné)
            gameState.phase = 'pass_net_choice';
            updatePhase();
            hideAllSections();
            document.getElementById('passNetChoice').classList.remove('hidden');
            redrawRally();
            break;

        case 'attack_net_choice':
            // Retour à attack_end (retirer l'attaque du rally)
            gameState.rally.pop(); // Retirer l'attaque
            gameState.phase = 'attack_end';
            updatePhase();
            hideAllSections();
            {
                const defTeamUndo = gameState.attackingTeam === 'home' ? 'away' : 'home';
                highlightCourt(defTeamUndo);
            }
            document.getElementById('outArea').classList.add('active');
            activateNetZone(true);
            redrawRally();
            break;

        case 'attack_net_block_player':
            // Retour à attack_net_choice
            gameState.phase = 'attack_net_choice';
            updatePhase();
            hideAllSections();
            document.getElementById('attackNetChoice').classList.remove('hidden');
            redrawRally();
            break;

        case 'attack_net_block_end':
            // Retour à attack_net_choice (le bloqueur est auto-sélectionné)
            gameState.phase = 'attack_net_choice';
            updatePhase();
            hideAllSections();
            document.getElementById('attackNetChoice').classList.remove('hidden');
            redrawRally();
            break;

        case 'pass':
            // Retour à reception_end, defense_end ou reception_net_block_end
            gameState.passAutoSelected = false;
            // Vérifier d'où on vient
            const lastRallyActionForPass = gameState.rally[gameState.rally.length - 1];
            if (lastRallyActionForPass && lastRallyActionForPass.type === 'block' &&
                lastRallyActionForPass.startPos && lastRallyActionForPass.startPos.courtSide === 'net') {
                // Vient d'un block au filet qui est revenu chez le bloqueur → retour à reception_net_block_end
                gameState.phase = 'reception_net_block_end';
                const netBlockForPass = gameState.rally.pop();
                if (netBlockForPass) {
                    gameState.currentAction = {
                        type: 'block',
                        player: netBlockForPass.player,
                        team: netBlockForPass.team,
                        startPos: netBlockForPass.startPos
                    };
                }
                // Restaurer attackingTeam
                gameState.attackingTeam = gameState.servingTeam === 'home' ? 'away' : 'home';
                hideAllSections();
                highlightCourt(null);
                document.getElementById('outArea').classList.add('active');
                document.getElementById('outLabelTop').style.display = 'block';
                document.getElementById('outLabelBottom').style.display = 'block';
            } else if (lastRallyActionForPass && lastRallyActionForPass.type === 'defense') {
                // Vient d'une défense (cycle contre-attaque) → retour à defense_end
                gameState.phase = 'defense_end';
                const defenseFromRally = gameState.rally.pop();
                if (defenseFromRally) {
                    gameState.currentAction = {
                        type: 'defense',
                        player: defenseFromRally.player,
                        team: defenseFromRally.team,
                        role: defenseFromRally.role
                    };
                }
                hideAllSections();
                document.getElementById('defenseFaultSection').classList.remove('hidden');
                // Afficher les tags override avec le défenseur (comme dans selectDefender)
                if (defenseFromRally) {
                    renderOverrideTags({
                        team: gameState.attackingTeam,
                        phaseLabel: 'Défense',
                        autoPlayer: defenseFromRally.player,
                        autoRole: defenseFromRally.role,
                        eligiblePlayers: getLineupPlayers(gameState.attackingTeam),
                        mode: 'override'
                    });
                }
                // Afficher la zone de qualité D+ (comme dans selectDefender)
                showDefenseQualityZones();
                // Highlight terrain défenseur (adverse grisé mais cliquable pour retour direct)
                highlightCourt(gameState.attackingTeam);
                document.getElementById('outArea').classList.add('active');
                const defUndoCourtSide = getCourtSideForTeam(gameState.attackingTeam);
                document.getElementById('outLabelTop').style.display = defUndoCourtSide === 'top' ? 'block' : 'none';
                document.getElementById('outLabelBottom').style.display = defUndoCourtSide === 'bottom' ? 'block' : 'none';
            } else {
                // Standard: retour à reception_end
                gameState.phase = 'reception_end';
                const receptionFromRally = gameState.rally.pop();
                if (receptionFromRally) {
                    gameState.currentAction = { ...receptionFromRally };
                }
                hideAllSections();
                highlightCourt(gameState.attackingTeam);
                showReceptionQualityZones();
                document.getElementById('receptionFaultSection').classList.remove('hidden');
                document.getElementById('outArea').classList.add('active');
                activateNetZone(true);
                const passUndoCourtSide = getCourtSideForTeam(gameState.attackingTeam);
                document.getElementById('outLabelTop').style.display = passUndoCourtSide === 'top' ? 'block' : 'none';
                document.getElementById('outLabelBottom').style.display = passUndoCourtSide === 'bottom' ? 'block' : 'none';
            }
            redrawRally();
            break;

        case 'pass_end':
            // Retour à la phase pass combinée (terrain actif + boutons joueurs)
            gameState.phase = 'pass';
            updatePhase();
            hideAllSections();
            highlightCourt(null);
            document.getElementById('outArea').classList.add('active');
            document.getElementById('outLabelTop').style.display = 'block';
            document.getElementById('outLabelBottom').style.display = 'block';
            renderPassPlayerSelection();
            redrawRally();
            break;

        case 'pass_direct_return_choice':
            // Retour à pass_end (avant le clic sur terrain adverse)
            {
                // Retirer la passe du rally (elle a été pushée avant le popup)
                const passFromRallyUndo = gameState.rally.pop();
                if (passFromRallyUndo) {
                    gameState.currentAction = { ...passFromRallyUndo };
                    gameState.currentAction.isDirectReturn = false;
                    gameState.currentAction.directReturnEndPos = null;
                    gameState.currentAction.endPos = null;
                }
                gameState.passDirectReturnClickData = null;
                gameState.phase = 'pass_end';
                updatePhase();
                hideAllSections();
                highlightCourt(null);
                document.getElementById('outArea').classList.add('active');
                activateNetZone(true);
                document.getElementById('outLabelTop').style.display = 'block';
                document.getElementById('outLabelBottom').style.display = 'block';
                if (gameState.currentAction && gameState.currentAction.player) {
                    showAttackZones(gameState.attackingTeam, gameState.currentAction.player, true);
                }
            }
            redrawRally();
            break;

        case 'attack_player':
            // Vérifier si on vient d'une attaque directe depuis une réception filet
            if (gameState.netDirectAttack || (gameState.currentAction && gameState.currentAction.isNetDirectAttack)) {
                // Retour à reception_net_choice : retirer la réception du rally
                gameState.netDirectAttack = false;
                gameState.rally.pop(); // Retirer la réception
                // Restaurer l'équipe attaquante = l'équipe qui réceptionnait
                const receivingTeamUndo = gameState.servingTeam === 'home' ? 'away' : 'home';
                gameState.attackingTeam = receivingTeamUndo;
                gameState.phase = 'reception_net_choice';
                updatePhase();
                hideAllSections();
                document.getElementById('receptionNetChoice').classList.remove('hidden');
                redrawRally();
            // Vérifier si on vient d'une attaque directe depuis un retour direct réception
            } else if (gameState.receptionDirectAttackSource) {
                // Retour au popup receptionOpponentChoice : retirer la réception du rally
                gameState.receptionDirectAttackSource = false;
                gameState.defenseDirectAttack = false;
                const recFromRally = gameState.rally.pop();
                if (recFromRally) {
                    gameState.currentAction = { ...recFromRally };
                    gameState.currentAction.isDirectReturn = false;
                    gameState.currentAction.directReturnEndPos = null;
                }
                // Restaurer l'équipe attaquante = l'équipe qui réceptionnait
                gameState.attackingTeam = gameState.servingTeam === 'home' ? 'away' : 'home';
                gameState.phase = 'reception_opponent_choice';
                updatePhase();
                hideAllSections();
                document.getElementById('receptionOpponentChoice').classList.remove('hidden');
                redrawRally();
            // Vérifier si on vient d'une attaque directe depuis un retour direct de passe
            } else if (gameState.passDirectReturnAttackSource) {
                gameState.passDirectReturnAttackSource = false;
                gameState.defenseDirectAttack = false;
                const passFromRallyUndo2 = gameState.rally.pop();
                if (passFromRallyUndo2) {
                    gameState.currentAction = { ...passFromRallyUndo2 };
                }
                gameState.attackingTeam = passFromRallyUndo2 ? passFromRallyUndo2.team : gameState.attackingTeam;
                gameState.phase = 'pass_direct_return_choice';
                updatePhase();
                hideAllSections();
                document.getElementById('passDirectReturnChoice').classList.remove('hidden');
                redrawRally();
            // Vérifier si on vient d'une attaque directe depuis un retour direct de défense
            } else if (gameState.defenseDirectReturnAttackSource) {
                // Retour au popup defenseDirectReturnChoice : retirer la défense du rally
                gameState.defenseDirectReturnAttackSource = false;
                gameState.defenseDirectAttack = false;
                const defFromRally = gameState.rally.pop();
                if (defFromRally) {
                    gameState.currentAction = { ...defFromRally };
                    gameState.currentAction.isDirectReturn = false;
                    gameState.currentAction.directReturnEndPos = null;
                }
                gameState.attackingTeam = defFromRally ? defFromRally.team : gameState.attackingTeam;
                gameState.phase = 'defense_direct_return_choice';
                updatePhase();
                hideAllSections();
                document.getElementById('defenseDirectReturnChoice').classList.remove('hidden');
                redrawRally();
            // Vérifier si on vient d'une attaque directe depuis la défense
            } else if (gameState.defenseDirectAttack || (gameState.currentAction && gameState.currentAction.isDefenseDirectAttack)) {
                // Retour à la sélection du défenseur
                gameState.defenseDirectAttack = false;
                gameState.phase = 'defense';
                hideAllSections();
                // Retour après attaque directe (post-bloc) : PAS de zones auto-select
                renderDefenseSelection(gameState.attackingTeam, null, true);
                redrawRally();
            } else if (gameState.passAutoSelected) {
                // Passe auto-sélectionnée (clic terrain en phase pass) : retour à pass
                gameState.rally.pop(); // Retirer la passe
                gameState.passAutoSelected = false;
                gameState.phase = 'pass';
                updatePhase();
                hideAllSections();
                highlightCourt(null);
                document.getElementById('outArea').classList.add('active');
                document.getElementById('outLabelTop').style.display = 'block';
                document.getElementById('outLabelBottom').style.display = 'block';
                renderPassPlayerSelection();
                redrawRally();
            } else {
                // Retour à pass_end (passe manuelle)
                gameState.phase = 'pass_end';
                // Récupérer la passe depuis le rally
                const passFromRally = gameState.rally.pop();
                if (passFromRally) {
                    gameState.currentAction = {
                        type: 'pass',
                        player: passFromRally.player,
                        team: passFromRally.team,
                        startPos: passFromRally.startPos
                    };
                }
                hideAllSections();
                highlightCourt(null);
                // Activer la zone out pour les passes
                document.getElementById('outArea').classList.add('active');
                activateNetZone(true);
                document.getElementById('outLabelTop').style.display = 'block';
                document.getElementById('outLabelBottom').style.display = 'block';
                // Afficher les zones d'attaque visuelles
                if (passFromRally && passFromRally.player) {
                    showAttackZones(gameState.attackingTeam, passFromRally.player, true);
                }
                redrawRally();
            }
            break;

        case 'attack_type':
            // Si c'était une attaque directe depuis la défense, remettre le flag
            if (gameState.currentAction && gameState.currentAction.isDefenseDirectAttack) {
                gameState.defenseDirectAttack = true;
            }
            // Si c'était une attaque directe depuis réception filet, remettre le flag
            if (gameState.currentAction && gameState.currentAction.isNetDirectAttack) {
                gameState.netDirectAttack = true;
            }

            if (gameState.attackAutoSelected && gameState.passAutoSelected) {
                // Passe auto + attaque auto en 1 clic → retour à la phase pass
                // Retirer la passe du rally
                gameState.attackAutoSelected = false;
                gameState.passAutoSelected = false;
                const passInRally = gameState.rally[gameState.rally.length - 1];
                if (passInRally && passInRally.type === 'pass') {
                    gameState.rally.pop();
                }
                gameState.phase = 'pass';
                updatePhase();
                hideAllSections();
                highlightCourt(null);
                document.getElementById('outArea').classList.add('active');
                document.getElementById('outLabelTop').style.display = 'block';
                document.getElementById('outLabelBottom').style.display = 'block';
                renderPassPlayerSelection();
                redrawRally();
            } else if (gameState.attackAutoSelected && !gameState.passAutoSelected) {
                // Passe manuelle + attaque auto → retour à pass_end (re-cliquer la position de passe)
                gameState.attackAutoSelected = false;
                const passInRally = gameState.rally[gameState.rally.length - 1];
                if (passInRally && passInRally.type === 'pass') {
                    // Garder le passeur sélectionné, enlever endPos
                    gameState.currentAction = {
                        type: 'pass',
                        player: passInRally.player,
                        team: passInRally.team,
                        role: passInRally.role
                    };
                    gameState.rally.pop();
                }
                gameState.phase = 'pass_end';
                updatePhase();
                hideAllSections();
                highlightCourt(null);
                document.getElementById('outArea').classList.add('active');
                activateNetZone(true);
                document.getElementById('outLabelTop').style.display = 'block';
                document.getElementById('outLabelBottom').style.display = 'block';
                // Afficher les zones d'attaque visuelles (comme dans selectPasser)
                if (passInRally && passInRally.player) {
                    showAttackZones(gameState.attackingTeam, passInRally.player, true);
                }
                redrawRally();
            } else {
                // Retour à la sélection de l'attaquant
                gameState.phase = 'attack_player';
                hideAllSections();
                renderAttackPlayerSelection();
                redrawRally();
            }
            break;

        case 'attack_end':
            // Retour au choix du type d'attaque
            gameState.defenseAutoSelected = false;
            gameState.defenseAutoPlayer = null;
            gameState.phase = 'attack_type';
            // Reset le type d'attaque car on retourne au choix (smash par défaut)
            if (gameState.currentAction) {
                gameState.currentAction.attackType = 'smash';
            }
            showSection('attackTypeSelection');
            // Ré-afficher les override tags avec l'attaquant
            {
                const attackPlayer = gameState.currentAction ? gameState.currentAction.player : null;
                const attackRole = gameState.currentAction ? gameState.currentAction.role : null;
                renderOverrideTags({
                    team: gameState.attackingTeam,
                    phaseLabel: 'Attaque',
                    autoPlayer: attackPlayer,
                    autoRole: attackRole,
                    eligiblePlayers: getLineupPlayers(gameState.attackingTeam),
                    mode: 'override'
                });
            }
            // Ré-afficher les zones de défense (elles sont visibles pendant attack_type)
            {
                const defTeamAtkEnd = gameState.attackingTeam === 'home' ? 'away' : 'home';
                highlightCourt(defTeamAtkEnd);
                document.getElementById('outArea').classList.add('active');
                activateNetZone(true);
                const attackerRoleAtkEnd = gameState.currentAction ? gameState.currentAction.role : null;
                if (attackerRoleAtkEnd) {
                    showDefenseZones(defTeamAtkEnd, attackerRoleAtkEnd);
                }
            }
            redrawRally();
            break;

        case 'result':
            // Retour à attack_end
            gameState.defenseAutoSelected = false;
            gameState.defenseAutoPlayer = null;
            gameState.phase = 'attack_end';
            // Récupérer l'attaque depuis le rally
            const attackFromRally = gameState.rally.pop();
            if (attackFromRally) {
                // Garder tout sauf endPos qu'on va re-cliquer
                gameState.currentAction = {
                    type: 'attack',
                    player: attackFromRally.player,
                    team: attackFromRally.team,
                    attackType: attackFromRally.attackType,
                    startPos: attackFromRally.startPos
                };
            }
            hideAllSections();
            {
                const defTeam = gameState.attackingTeam === 'home' ? 'away' : 'home';
                highlightCourt(defTeam);
                document.getElementById('outArea').classList.add('active');
                activateNetZone(true);
                // Ré-afficher les zones de défense
                if (attackFromRally && attackFromRally.role) {
                    showDefenseZones(defTeam, attackFromRally.role);
                }
            }
            redrawRally();
            break;

        case 'defense':
            // Retour au résultat, au block_end, au direct_return_end, ou à la défense précédente
            gameState.defenseAutoSelected = false;
            gameState.defenseAutoPlayer = null;
            gameState.defenseFaultShortcut = false;
            const lastActionForDefense = gameState.rally[gameState.rally.length - 1];
            
            if (lastActionForDefense && lastActionForDefense.type === 'reception' && lastActionForDefense.isDirectReturn) {
                // C'était après un retour direct de réception → retourner au popup de choix
                const directReturnFromRally = gameState.rally.pop();
                // Sauvegarder les positions du retour direct avant de les effacer
                const recEndPos = directReturnFromRally ? directReturnFromRally.endPos : null;
                const directReturnEndPos = directReturnFromRally ? directReturnFromRally.directReturnEndPos : null;
                if (directReturnFromRally) {
                    gameState.currentAction = { ...directReturnFromRally };
                    gameState.currentAction.isDirectReturn = false;
                    gameState.currentAction.directReturnEndPos = null;
                }
                gameState.attackingTeam = gameState.servingTeam === 'home' ? 'away' : 'home';
                gameState.phase = 'reception_opponent_choice';
                updatePhase();
                hideAllSections();
                document.getElementById('receptionOpponentChoice').classList.remove('hidden');
                // redrawRally dessine le service (flèche + markers). On ajoute ensuite
                // la flèche du retour direct qui n'est plus dans le rally.
                // Note : reception.endPos === service.endPos (set par handleOpponentChoice),
                // donc on dessine une seule flèche service.endPos → directReturnEndPos.
                redrawRally();
                if (directReturnEndPos) {
                    const serviceAction = gameState.rally.find(a => a.type === 'service');
                    if (serviceAction && serviceAction.endPos) {
                        addMarker(directReturnEndPos, 'reception');
                        drawArrow(serviceAction.endPos, directReturnEndPos, 'reception');
                    }
                }
            } else if (lastActionForDefense && lastActionForDefense.type === 'pass' && lastActionForDefense.isDirectReturn) {
                // C'était après un retour direct de passe → retourner au popup de choix
                const directReturnPass = gameState.rally.pop();
                gameState.attackingTeam = directReturnPass.team;
                gameState.currentAction = { ...directReturnPass };
                gameState.phase = 'pass_direct_return_choice';
                updatePhase();
                hideAllSections();
                document.getElementById('passDirectReturnChoice').classList.remove('hidden');
                redrawRally();
            } else if (lastActionForDefense && lastActionForDefense.type === 'defense' && lastActionForDefense.isDirectReturn) {
                // C'était après un retour direct de défense → retourner au popup de choix
                const directReturnDefense = gameState.rally.pop();
                gameState.attackingTeam = directReturnDefense.team;
                gameState.currentAction = { ...directReturnDefense };
                gameState.currentAction.isDirectReturn = false;
                gameState.currentAction.directReturnEndPos = null;
                gameState.currentAction.isDirectReturnWinner = false;
                gameState.phase = 'defense_direct_return_choice';
                updatePhase();
                hideAllSections();
                document.getElementById('defenseDirectReturnChoice').classList.remove('hidden');
                redrawRally();
            } else if (lastActionForDefense && lastActionForDefense.type === 'block') {
                // C'était après un block
                if (lastActionForDefense.startPos && lastActionForDefense.startPos.courtSide === 'net') {
                    // Block au filet → déterminer le type selon l'action précédente
                    const netBlockFromRally = gameState.rally.pop();
                    if (netBlockFromRally) {
                        gameState.currentAction = {
                            type: 'block',
                            player: netBlockFromRally.player,
                            team: netBlockFromRally.team,
                            startPos: netBlockFromRally.startPos
                        };
                    }
                    // Déterminer quel type de block au filet c'était
                    const actionBeforeBlock = gameState.rally[gameState.rally.length - 1];
                    if (actionBeforeBlock && actionBeforeBlock.type === 'attack') {
                        gameState.phase = 'attack_net_block_end';
                    } else if (actionBeforeBlock && actionBeforeBlock.type === 'pass') {
                        gameState.phase = 'pass_net_block_end';
                    } else {
                        gameState.phase = 'reception_net_block_end';
                        // Restaurer attackingTeam à l'équipe qui a réceptionné
                        gameState.attackingTeam = gameState.servingTeam === 'home' ? 'away' : 'home';
                    }
                    hideAllSections();
                    highlightCourt(null);
                    document.getElementById('outArea').classList.add('active');
                    document.getElementById('outLabelTop').style.display = 'block';
                    document.getElementById('outLabelBottom').style.display = 'block';
                } else {
                    // Block standard après attaque → retourner à block_end
                    gameState.phase = 'block_end';
                    const blockFromRally = gameState.rally.pop();
                    if (blockFromRally) {
                        gameState.currentAction = {
                            type: 'block',
                            player: blockFromRally.player,
                            team: blockFromRally.team,
                            startPos: blockFromRally.startPos
                        };
                    }
                    hideAllSections();
                    highlightCourt(gameState.attackingTeam);
                }
                redrawRally();
            } else {
                // C'était après un defended, retour au résultat
                gameState.phase = 'result';
                showSection('resultSelection');
                // Vérifier si c'était defended (équipe changée)
                const lastAttackAct = gameState.rally[gameState.rally.length - 1];
                if (lastAttackAct && lastAttackAct.result === 'defended') {
                    gameState.attackingTeam = gameState.attackingTeam === 'home' ? 'away' : 'home';
                }
                // Ré-afficher les zones de défense sur le terrain du défenseur
                if (lastAttackAct && lastAttackAct.role) {
                    const defTeamForZones = gameState.attackingTeam === 'home' ? 'away' : 'home';
                    showDefenseZones(defTeamForZones, lastAttackAct.role);
                }
                redrawRally();
            }
            break;

        case 'block_end':
            // Retour au résultat
            gameState.phase = 'result';
            showSection('resultSelection');
            // Ré-afficher les zones de défense
            {
                const lastAttackForBlock = [...gameState.rally].reverse().find(a => a.type === 'attack');
                if (lastAttackForBlock && lastAttackForBlock.role) {
                    const defTeamBlock = gameState.attackingTeam === 'home' ? 'away' : 'home';
                    showDefenseZones(defTeamBlock, lastAttackForBlock.role);
                }
            }
            redrawRally();
            break;

        case 'defense_end':
            // Retour à la sélection du défenseur
            gameState.defenseAutoSelected = false;
            gameState.defenseAutoPlayer = null;
            gameState.phase = 'defense';
            hideAllSections();
            hideDefenseQualityZones();
            // Désactiver la zone out et les labels OUT (restés de defense_end)
            document.getElementById('outArea').classList.remove('active');
            document.getElementById('outLabelTop').style.display = 'none';
            document.getElementById('outLabelBottom').style.display = 'none';
            // Ré-afficher le terrain du défenseur
            highlightCourt(gameState.attackingTeam);
            {
                const lastAttackForZones = [...gameState.rally].reverse().find(a => a.type === 'attack');
                const defTeam = gameState.attackingTeam;
                // Détecter si un bloc précède cette défense (pour afficher le bouton Attaque directe)
                let hasBlockBefore = false;
                for (let i = gameState.rally.length - 1; i >= 0; i--) {
                    const a = gameState.rally[i];
                    if (a.type === 'block' && a.team === defTeam) { hasBlockBefore = true; break; }
                    if ((a.type === 'pass' || a.type === 'attack') && a.team === defTeam) break;
                }
                // Détecter si la défense vient d'un retour direct (balle imprévisible → pas de zones)
                const lastRallyAction = gameState.rally[gameState.rally.length - 1];
                const isAfterDirectReturn = lastRallyAction && lastRallyAction.isDirectReturn;
                // Si après un bloc ou un retour direct : PAS de zones auto-select, sinon zones normales
                const noAutoZones = hasBlockBefore || isAfterDirectReturn;
                const attackerRoleForUndo = noAutoZones ? null : (lastAttackForZones ? lastAttackForZones.role : null);
                renderDefenseSelection(gameState.attackingTeam, attackerRoleForUndo, hasBlockBefore);
            }
            redrawRally();
            break;

        case 'defense_fault_trajectory':
            // Retour à defense_end
            gameState.phase = 'defense_end';
            gameState.currentAction.result = null;
            gameState.currentAction.faultTrajectory = null;
            hideAllSections();
            document.getElementById('defenseFaultSection').classList.remove('hidden');
            // Afficher les tags override avec le défenseur
            if (gameState.currentAction && gameState.currentAction.player) {
                renderOverrideTags({
                    team: gameState.attackingTeam,
                    phaseLabel: 'Défense',
                    autoPlayer: gameState.currentAction.player,
                    autoRole: gameState.currentAction.role,
                    eligiblePlayers: getLineupPlayers(gameState.attackingTeam),
                    mode: 'override'
                });
            }
            showDefenseQualityZones();
            // Highlight terrain défenseur (adverse grisé mais cliquable pour retour direct)
            highlightCourt(gameState.attackingTeam);
            document.getElementById('outArea').classList.add('active');
            const defendingCourtSideUndo = getCourtSideForTeam(gameState.attackingTeam);
            document.getElementById('outLabelTop').style.display = defendingCourtSideUndo === 'top' ? 'block' : 'none';
            document.getElementById('outLabelBottom').style.display = defendingCourtSideUndo === 'bottom' ? 'block' : 'none';
            redrawRally();
            break;

        case 'defense_direct_return_choice':
            // Retour à defense_end (avant le clic sur terrain adverse)
            gameState.currentAction.isDirectReturn = false;
            gameState.currentAction.directReturnEndPos = null;
            gameState.currentAction.isDirectReturnWinner = false;
            gameState.defenseDirectReturnClickData = null;
            gameState.phase = 'defense_end';
            hideDefenseZones();
            hideAttackZones();
            hideAllSections();
            document.getElementById('defenseFaultSection').classList.remove('hidden');
            // Afficher les tags override avec le défenseur (comme dans selectDefender)
            if (gameState.currentAction && gameState.currentAction.player) {
                renderOverrideTags({
                    team: gameState.attackingTeam,
                    phaseLabel: 'Défense',
                    autoPlayer: gameState.currentAction.player,
                    autoRole: gameState.currentAction.role,
                    eligiblePlayers: getLineupPlayers(gameState.attackingTeam),
                    mode: 'override'
                });
            }
            // Afficher la zone de qualité D+
            showDefenseQualityZones();
            // Highlight terrain défenseur (adverse grisé mais cliquable pour retour direct)
            highlightCourt(gameState.attackingTeam);
            document.getElementById('outArea').classList.add('active');
            {
                const defReturnUndoCourtSide = getCourtSideForTeam(gameState.attackingTeam);
                document.getElementById('outLabelTop').style.display = defReturnUndoCourtSide === 'top' ? 'block' : 'none';
                document.getElementById('outLabelBottom').style.display = defReturnUndoCourtSide === 'bottom' ? 'block' : 'none';
            }
            redrawRally();
            break;
    }

    updatePhase();
}

function cancelPoint() {
    // Si on est au début d'un point (sélection serveur ou serve_start avec même serveur)
    // → proposer d'annuler le dernier point validé
    if (gameState.phase === 'server_selection' || 
        (gameState.phase === 'serve_start' && gameState.currentServer && gameState.rally.length === 0)) {
        if (currentSet.points && currentSet.points.length > 0) {
            showUndoPointModal();
        } else {
            alert('Aucun point à annuler.');
        }
        return;
    }
    
    // Sinon, on est en cours de rally → annuler le rally en cours
    if (!confirm('Annuler ce point et recommencer ?')) {
        return;
    }

    // Reset complet du point
    gameState.rally = [];
    gameState.currentAction = {};
    gameState.currentServer = null;
    
    // Remettre l'équipe qui attaque
    const receivingTeam = gameState.servingTeam === 'home' ? 'away' : 'home';
    gameState.attackingTeam = receivingTeam;

    clearMarkers();
    clearArrows();
    hideServiceZones();
    hideReceptionQualityZones();
    hideDefenseQualityZones();
    hideAttackZones();
    hideDefenseZones();
    highlightCourt(null);

    // Reset flags d'auto-sélection
    gameState.overridePlayer = null;
    gameState.autoSelectedPlayer = null;
    gameState.passAutoSelected = false;
    gameState.attackAutoSelected = false;
    gameState.receptionAutoSelected = false;
    gameState.netDirectAttack = false;
    gameState.defenseDirectAttack = false;
    gameState.receptionDirectAttackSource = false;
    gameState.defenseDirectReturnAttackSource = false;
    gameState.defenseDirectReturnClickData = null;
    gameState.passDirectReturnAttackSource = false;
    gameState.passDirectReturnClickData = null;
    gameState.defenseAutoSelected = false;
    gameState.defenseAutoPlayer = null;
    gameState.defenseFaultShortcut = false;
    delete gameState.blocOutPending;
    delete gameState.blocOutAttackingTeam;

    // Retour à la sélection du serveur
    gameState.phase = 'server_selection';
    updatePhase();
    renderServerSelection();
}

