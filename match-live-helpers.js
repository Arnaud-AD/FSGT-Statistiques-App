// match-live-helpers.js - Position roles & helpers
// ==================== HELPERS ====================
// ==================== POSITION ROLES ====================
const POSITION_ROLES = {
    home: { 1: 'Passeur', 2: 'R4', 3: 'Centre', 4: 'Pointu' },
    away: { 4: 'Passeur', 1: 'R4', 2: 'Centre', 3: 'Pointu' }
};

const ROLE_COLORS = {
    'R4': '#3b82f6',
    'Centre': '#ef4444',
    'Pointu': '#22c55e'
};

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
        zoneElements[i].style.background = m.color + '40';
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

// Affiche les 2 zones d'attaque (gauche=R4, droite=Pointu) sur le terrain de l'équipe
// Si le R4 ou Pointu est le dernier toucheur (passeur), la zone droite bascule sur le Passeur
// Affiche les 2 zones d'attaque sur le terrain de l'équipe.
// excludePlayer : joueur qui a fait la passe (ne peut pas attaquer = double touche)
//   - null/undefined = cas standard phase pass (Passeur rôle fait la passe, zones R4/Pointu)
//   - nom du joueur = cas passe manuelle (ce joueur est remplacé dans sa zone par le Passeur rôle)
function showAttackZones(team, excludePlayer, visualOnly) {
    const courtSide = getCourtSideForTeam(team);
    const zonesId = courtSide === 'top' ? 'attackZonesTop' : 'attackZonesBottom';
    const zones = document.getElementById(zonesId);

    const r4Player = getPlayerByRole(team, 'R4');
    const pointuPlayer = getPlayerByRole(team, 'Pointu');
    const passeurPlayer = getPlayerByRole(team, 'Passeur');

    // Zone gauche = R4, Zone droite = Pointu (par défaut)
    // Si un joueur est exclu (il a fait la passe), sa zone est remplacée par le Passeur (rôle)
    let leftPlayer = r4Player, leftRole = 'R4', leftColor = ROLE_COLORS['R4'], leftDisabled = false;
    let rightPlayer = pointuPlayer, rightRole = 'Pointu', rightColor = ROLE_COLORS['Pointu'], rightDisabled = false;

    if (excludePlayer) {
        if (excludePlayer === r4Player) {
            // R4 a fait la passe → zone gauche désactivée (Passeur n'attaque pas côté R4)
            leftDisabled = true;
        }
        if (excludePlayer === pointuPlayer) {
            // Pointu a fait la passe → zone droite = Passeur (il est physiquement de ce côté)
            rightPlayer = passeurPlayer;
            rightRole = 'Passeur';
            rightColor = '#8b5cf6';
        }
    }

    // Mapping selon le côté du terrain (miroir pour le court top)
    let leftMapping, rightMapping;
    if (courtSide === 'bottom') {
        leftMapping = { player: leftPlayer, role: leftRole, color: leftColor, disabled: leftDisabled };
        rightMapping = { player: rightPlayer, role: rightRole, color: rightColor, disabled: rightDisabled };
    } else {
        // Top: miroir — droite à gauche, gauche à droite
        leftMapping = { player: rightPlayer, role: rightRole, color: rightColor, disabled: rightDisabled };
        rightMapping = { player: leftPlayer, role: leftRole, color: leftColor, disabled: leftDisabled };
    }

    const zoneElements = zones.querySelectorAll('.attack-zone');
    const mappings = [leftMapping, rightMapping];
    mappings.forEach((m, i) => {
        zoneElements[i].style.background = m.color + '40';
        zoneElements[i].style.borderColor = m.color + '80';
        zoneElements[i].innerHTML = `<span class="zone-label">${m.role}<br>${m.player}</span>`;
        zoneElements[i].dataset.player = m.player;
        zoneElements[i].dataset.role = m.role;
        if (m.disabled) {
            zoneElements[i].classList.add('disabled');
        } else {
            zoneElements[i].classList.remove('disabled');
        }
    });

    zones.classList.add('active');
    if (visualOnly) {
        zones.classList.add('visual-only');
    } else {
        zones.classList.remove('visual-only');
    }
}

function hideAttackZones() {
    document.getElementById('attackZonesTop').classList.remove('active');
    document.getElementById('attackZonesTop').classList.remove('visual-only');
    document.getElementById('attackZonesBottom').classList.remove('active');
    document.getElementById('attackZonesBottom').classList.remove('visual-only');
}

// Affiche les 3 zones de défense selon le rôle de l'attaquant adverse
// defendingTeam : équipe qui défend
// attackerRole : rôle de l'attaquant adverse ('R4', 'Pointu', 'Centre', 'Passeur')
function showDefenseZones(defendingTeam, attackerRole) {
    const courtSide = getCourtSideForTeam(defendingTeam);
    const zonesId = courtSide === 'top' ? 'defenseZonesTop' : 'defenseZonesBottom';
    const zones = document.getElementById(zonesId);

    // Nettoyer les classes de cas précédents
    zones.classList.remove('attack-r4', 'attack-pointu', 'attack-centre');

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
    }
    // TODO: cas 'Centre' à implémenter

    if (!zoneMapping) return;

    // Appliquer les couleurs et labels aux zones
    const zoneElements = zones.querySelectorAll('.defense-zone');
    zoneElements.forEach(el => {
        const zoneType = el.dataset.zone; // 'line', 'diagonal', 'short'
        const m = zoneMapping[zoneType];
        if (m) {
            el.style.background = m.color + '40';
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
        el.classList.remove('active', 'attack-r4', 'attack-pointu', 'attack-centre');
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
    // "behind" → diagonal est toujours correct.
    //
    // Positions des zones par cas :
    //   Bottom + R4 :     short=GAUCHE(filet), line=GAUCHE(fond), diagonal=DROITE
    //   Bottom + Pointu : short=DROITE(filet), line=DROITE(fond), diagonal=GAUCHE
    //   Top + R4 :        short=DROITE(filet), line=GAUCHE,       diagonal=DROITE(fond)
    //   Top + Pointu :    short=GAUCHE(filet), line=DROITE,       diagonal=GAUCHE(fond)
    const isPointuAttack = activeContainer.classList.contains('attack-pointu');
    let targetZone;
    if (outSector === 'behind') {
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

function renderPlayerSelection(team, title) {
    const container = document.getElementById('playerTags');
    document.getElementById('playerSelectionTitle').textContent = title;

    const lineup = team === 'home' ? currentSet.homeLineup : currentSet.awayLineup;
    let players = Object.values(lineup).filter(p => p !== null);

    // Exclure le dernier toucheur (un joueur ne peut pas toucher 2 fois d'affilée)
    if (gameState.phase === 'attack_player' || gameState.phase === 'second_touch_player') {
        const lastToucher = getLastTouchPlayer(team);
        if (lastToucher) {
            players = players.filter(p => p !== lastToucher);
        }
    }

    let html = players.map(playerName => `
        <button class="player-tag ${team}" onclick="handlePlayerSelection('${playerName}')">
            ${playerName}
        </button>
    `).join('');

    // Ajouter le bouton Ace en phase reception
    if (gameState.phase === 'reception') {
        html += `<button class="action-tag ace" onclick="handleAceFromReception()">🎯 Ace</button>`;
    }

    container.innerHTML = html;

    showSection('playerSelection');

    // En phase defense, afficher aussi le bouton Attaque directe dans sa section dédiée
    if (gameState.phase === 'defense') {
        document.getElementById('defenseDirectAttackSection').classList.remove('hidden');
    }
}

// Version allégée pour la défense avec zones auto-select actives :
// Masque la section joueurs et affiche uniquement le bouton Attaque directe
function renderDefenseZonesOnly() {
    document.getElementById('playerSelection').classList.add('hidden');
    document.getElementById('defenseDirectAttackSection').classList.remove('hidden');
}

function handlePlayerSelection(playerName) {
    switch (gameState.phase) {
        case 'reception':
            selectReceptioner(playerName);
            break;
        case 'pass':
            selectPasser(playerName);
            break;
        case 'second_touch_player':
            selectSecondTouchPlayer(playerName);
            break;
        case 'attack_player':
            selectAttacker(playerName);
            break;
        case 'defense':
            selectDefender(playerName);
            break;
        case 'reception_net_block_player':
            selectNetBlocker(playerName);
            break;
        case 'pass_net_block_player':
            selectPassNetBlocker(playerName);
            break;
        case 'attack_net_block_player':
            selectAttackNetBlocker(playerName);
            break;
        case 'bloc_out_player':
            selectBlocOutPlayer(playerName);
            break;
    }
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
    document.getElementById('passFaultSection').classList.add('hidden');
    document.getElementById('passFaultResultSection').classList.add('hidden');
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
    document.getElementById('defenseFaultSection').classList.add('hidden');
    document.getElementById('defenseFaultTrajectory').classList.add('hidden');
    document.getElementById('blocOutTrajectory').classList.add('hidden');
    document.getElementById('serveAceSection').classList.add('hidden');
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

    // Effacer les markers, flèches et zones de défense
    clearMarkers();
    clearArrows();
    hideDefenseZones();

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
            if (gameState.aceMode) {
                // Just deactivate ace mode, stay in serve_end
                gameState.aceMode = false;
                const aceRecvTeam = gameState.servingTeam === 'home' ? 'away' : 'home';
                showPositionZones(aceRecvTeam);
                document.getElementById('serveAceSection').classList.remove('hidden');
                updatePhase();
                // Redraw start marker
                if (gameState.currentAction.startPos) {
                    addMarker(gameState.currentAction.startPos, 'service');
                }
                break;
            }
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
            // Afficher le bouton Ace
            document.getElementById('serveAceSection').classList.remove('hidden');
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
                // Afficher le bouton Ace
                document.getElementById('serveAceSection').classList.remove('hidden');
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
                renderPlayerSelection(gameState.attackingTeam, 'Qui réceptionne ?');
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
            highlightCourt(gameState.attackingTeam);
            document.getElementById('passFaultSection').classList.remove('hidden');
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
                highlightCourt(null);
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

        case 'pass_fault_end':
            // Retirer le subType fault
            gameState.currentAction.subType = undefined;
            // Aussi retirer de l'action dans le rally si elle y est déjà
            const rallyPassAction = gameState.rally[gameState.rally.length - 1];
            if (rallyPassAction && rallyPassAction.type === 'pass') {
                rallyPassAction.subType = undefined;
            }
            if (gameState.passFaultFromAttackPlayer) {
                // Retour à attack_player (la passe auto est déjà dans le rally)
                gameState.passFaultFromAttackPlayer = false;
                gameState.phase = 'attack_player';
                updatePhase();
                hideAllSections();
                renderAttackPlayerSelection();
                document.getElementById('passFaultSection').classList.remove('hidden');
            } else if (gameState.passAutoSelected) {
                // Retour à la phase pass combinée
                gameState.passAutoSelected = false;
                gameState.phase = 'pass';
                updatePhase();
                hideAllSections();
                highlightCourt(null);
                document.getElementById('outArea').classList.add('active');
                document.getElementById('outLabelTop').style.display = 'block';
                document.getElementById('outLabelBottom').style.display = 'block';
                renderPassPlayerSelection();
            } else {
                // Retour à pass_end (le passeur est déjà sélectionné manuellement)
                gameState.phase = 'pass_end';
                updatePhase();
                hideAllSections();
                document.getElementById('passFaultSection').classList.remove('hidden');
                document.getElementById('outArea').classList.add('active');
                activateNetZone(true);
                highlightCourt(gameState.attackingTeam);
                const passFaultUndoCourtSide = getCourtSideForTeam(gameState.attackingTeam);
                document.getElementById('outLabelTop').style.display = passFaultUndoCourtSide === 'top' ? 'block' : 'none';
                document.getElementById('outLabelBottom').style.display = passFaultUndoCourtSide === 'bottom' ? 'block' : 'none';
                // Afficher les zones d'attaque visuelles
                if (gameState.currentAction && gameState.currentAction.player) {
                    showAttackZones(gameState.attackingTeam, gameState.currentAction.player, true);
                }
            }
            redrawRally();
            break;

        case 'pass_fault_result':
            // Retour à pass_fault_end — retirer le marker et l'action du rally
            gameState.rally.pop();
            gameState.currentAction.endPos = undefined;
            gameState.phase = 'pass_fault_end';
            updatePhase();
            hideAllSections();
            document.getElementById('outArea').classList.add('active');
            document.getElementById('outLabelTop').style.display = 'block';
            document.getElementById('outLabelBottom').style.display = 'block';
            highlightCourt(null);
            redrawRally();
            break;

        case 'second_touch_player':
            // Retour à la phase pass combinée
            gameState.phase = 'pass';
            gameState.secondTouchType = null;
            updatePhase();
            hideAllSections();
            highlightCourt(null);
            document.getElementById('outArea').classList.add('active');
            document.getElementById('outLabelTop').style.display = 'block';
            document.getElementById('outLabelBottom').style.display = 'block';
            renderPassPlayerSelection();
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
            // Vérifier si on vient d'une attaque directe depuis la défense
            } else if (gameState.defenseDirectAttack || (gameState.currentAction && gameState.currentAction.isDefenseDirectAttack)) {
                // Retour à la sélection du défenseur
                gameState.defenseDirectAttack = false;
                gameState.phase = 'defense';
                hideAllSections();
                // Ré-afficher les zones de défense si on connaît le rôle de l'attaquant
                const lastAttackForDirectUndo = [...gameState.rally].reverse().find(a => a.type === 'attack');
                if (lastAttackForDirectUndo && lastAttackForDirectUndo.role) {
                    renderDefenseZonesOnly();
                    showDefenseZones(gameState.attackingTeam, lastAttackForDirectUndo.role);
                } else {
                    renderPlayerSelection(gameState.attackingTeam, 'Qui défend ?');
                }
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
                highlightCourt(gameState.attackingTeam);
                document.getElementById('passFaultSection').classList.remove('hidden');
                // Activer la zone out pour les passes
                document.getElementById('outArea').classList.add('active');
                activateNetZone(true);
                const attackingCourtSide = getCourtSideForTeam(gameState.attackingTeam);
                document.getElementById('outLabelTop').style.display = attackingCourtSide === 'top' ? 'block' : 'none';
                document.getElementById('outLabelBottom').style.display = attackingCourtSide === 'bottom' ? 'block' : 'none';
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
                highlightCourt(gameState.attackingTeam);
                document.getElementById('passFaultSection').classList.remove('hidden');
                document.getElementById('outArea').classList.add('active');
                activateNetZone(true);
                const attackingCourtSide = getCourtSideForTeam(gameState.attackingTeam);
                document.getElementById('outLabelTop').style.display = attackingCourtSide === 'top' ? 'block' : 'none';
                document.getElementById('outLabelBottom').style.display = attackingCourtSide === 'bottom' ? 'block' : 'none';
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
            showSection('attackTypeSelection');
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
                // C'était après un retour direct de réception, retourner à direct_return_end
                gameState.phase = 'direct_return_end';
                const directReturnFromRally = gameState.rally.pop();
                if (directReturnFromRally) {
                    gameState.currentAction = { ...directReturnFromRally };
                    // Enlever le directReturnEndPos car on va le re-cliquer
                    delete gameState.currentAction.directReturnEndPos;
                }
                // Remettre l'équipe qui attaque à celle qui a fait le retour direct
                gameState.attackingTeam = gameState.servingTeam === 'home' ? 'away' : 'home';
                hideAllSections();
                highlightCourt(gameState.servingTeam);
                redrawRally();
            } else if (lastActionForDefense && lastActionForDefense.type === 'defense' && lastActionForDefense.isDirectReturn) {
                // C'était après un retour direct de défense, retourner à defense_end de l'action précédente
                const directReturnDefense = gameState.rally.pop();
                // Remettre l'équipe qui attaque à celle qui a fait le retour direct
                gameState.attackingTeam = directReturnDefense.team;
                gameState.currentAction = { 
                    type: 'defense',
                    player: directReturnDefense.player,
                    team: directReturnDefense.team
                };
                gameState.phase = 'defense_end';
                hideAllSections();
                highlightCourt(null);
                document.getElementById('outArea').classList.add('active');
                const defendingCourtSide = getCourtSideForTeam(gameState.attackingTeam);
                document.getElementById('outLabelTop').style.display = defendingCourtSide === 'top' ? 'block' : 'none';
                document.getElementById('outLabelBottom').style.display = defendingCourtSide === 'bottom' ? 'block' : 'none';
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
            // Ré-afficher les zones de défense pour auto-sélection
            {
                const lastAttackForZones = [...gameState.rally].reverse().find(a => a.type === 'attack');
                if (lastAttackForZones && lastAttackForZones.role) {
                    renderDefenseZonesOnly();
                    showDefenseZones(gameState.attackingTeam, lastAttackForZones.role);
                } else {
                    renderPlayerSelection(gameState.attackingTeam, 'Qui défend ?');
                }
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
            highlightCourt(null);
            document.getElementById('outArea').classList.add('active');
            const defendingCourtSideUndo = getCourtSideForTeam(gameState.attackingTeam);
            document.getElementById('outLabelTop').style.display = defendingCourtSideUndo === 'top' ? 'block' : 'none';
            document.getElementById('outLabelBottom').style.display = defendingCourtSideUndo === 'bottom' ? 'block' : 'none';
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
    gameState.passAutoSelected = false;
    gameState.attackAutoSelected = false;
    gameState.receptionAutoSelected = false;
    gameState.netDirectAttack = false;
    gameState.defenseDirectAttack = false;
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

