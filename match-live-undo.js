// match-live-undo.js - Undo points & substitutions
// ==================== ANNULER DERNIER POINT VALIDÉ ====================
function showUndoPointModal() {
    const points = currentSet.points;
    const lastPoint = points[points.length - 1];
    const rally = lastPoint.rally;
    
    // Calculer le score avant ce point
    const prevPoint = points.length >= 2 ? points[points.length - 2] : null;
    const scoreBefore = prevPoint 
        ? `${prevPoint.homeScore} - ${prevPoint.awayScore}` 
        : `${currentSet.homeScore || 0} - ${currentSet.awayScore || 0}`;
    
    // Score initial (bonus inclus)
    const initialHome = currentSet.initialHomeScore || 0;
    const initialAway = currentSet.initialAwayScore || 0;
    const scoreBeforeHome = prevPoint ? prevPoint.homeScore : initialHome;
    const scoreBeforeAway = prevPoint ? prevPoint.awayScore : initialAway;
    
    // Info service
    const serviceAction = rally.find(a => a.type === 'service');
    const serverName = serviceAction ? serviceAction.player : '?';
    const serverTeam = serviceAction ? serviceAction.team : '?';
    const serverTeamName = serverTeam === 'home' ? 'Jen et ses Saints' : (currentMatch.opponent || 'Adversaire');
    
    // Qui a marqué ?
    const whoScored = lastPoint.homeScore > scoreBeforeHome ? 'home' : 'away';
    const whoScoredName = whoScored === 'home' ? 'Jen et ses Saints' : (currentMatch.opponent || 'Adversaire');
    
    // Dernière action significative
    const lastAction = rally[rally.length - 1];
    let lastActionDesc = '';
    if (lastAction) {
        const actionLabels = {
            'service': 'Service',
            'reception': 'Réception',
            'pass': 'Passe',
            'attack': 'Attaque',
            'block': 'Block',
            'defense': 'Défense'
        };
        const actionLabel = actionLabels[lastAction.type] || lastAction.type;
        
        if (lastAction.type === 'service') {
            if (lastAction.result === 'ace') lastActionDesc = `Ace de ${lastAction.player}`;
            else if (lastAction.result === 'fault' || lastAction.result === 'fault_out' || lastAction.result === 'fault_net') lastActionDesc = `Faute au service de ${lastAction.player}`;
            else lastActionDesc = `Service de ${lastAction.player}`;
        } else if (lastAction.type === 'attack') {
            if (lastAction.result === 'point') lastActionDesc = `Attaque gagnante de ${lastAction.player}`;
            else if (lastAction.attackType === 'faute') lastActionDesc = `Faute d'attaque de ${lastAction.player}`;
            else if (lastAction.result === 'out') lastActionDesc = `Attaque out de ${lastAction.player}`;
            else lastActionDesc = `${actionLabel} de ${lastAction.player}`;
        } else if (lastAction.type === 'reception') {
            if (lastAction.isDirectReturnWinner) lastActionDesc = `Retour gagnant de ${lastAction.player}`;
            else if (lastAction.quality?.label === 'Faute') lastActionDesc = `Faute réception de ${lastAction.player}`;
            else lastActionDesc = `${actionLabel} de ${lastAction.player}`;
        } else {
            lastActionDesc = `${actionLabel}${lastAction.player ? ' de ' + lastAction.player : ''}`;
        }
    }
    
    // Construire le HTML
    const summaryEl = document.getElementById('undoPointSummary');
    summaryEl.innerHTML = `
        <div class="undo-point-score">
            <span class="score-before">${lastPoint.homeScore} - ${lastPoint.awayScore}</span>
            <span class="score-arrow">→</span>
            <span class="score-after">${scoreBeforeHome} - ${scoreBeforeAway}</span>
        </div>
        <div class="undo-point-detail">
            <div><span class="label">🏐 Service :</span> ${serverName} (${serverTeamName})</div>
            <div><span class="label">🏆 Point pour :</span> ${whoScoredName}</div>
            <div><span class="label">📋 Dernière action :</span> ${lastActionDesc}</div>
            <div style="margin-top:6px; font-size:11px; color:#9ca3af;">Point n°${points.length} • ${new Date(lastPoint.timestamp).toLocaleTimeString('fr-FR', {hour:'2-digit', minute:'2-digit'})}</div>
        </div>
    `;
    
    document.getElementById('undoPointOverlay').classList.add('active');
}

function closeUndoPointModal(event) {
    if (event && event.target !== event.currentTarget) return;
    document.getElementById('undoPointOverlay').classList.remove('active');
}

function confirmUndoLastPoint() {
    const points = currentSet.points;
    if (!points || points.length === 0) return;
    
    // Retirer le dernier point
    const removedPoint = points.pop();
    
    // Restaurer le score
    const prevPoint = points.length > 0 ? points[points.length - 1] : null;
    const initialHome = currentSet.initialHomeScore || 0;
    const initialAway = currentSet.initialAwayScore || 0;
    
    gameState.homeScore = prevPoint ? prevPoint.homeScore : initialHome;
    gameState.awayScore = prevPoint ? prevPoint.awayScore : initialAway;
    
    // Restaurer l'équipe au service
    // Le serveur du point supprimé avait servi pour son équipe
    // Si cette équipe a perdu le point, le service avait changé → on rétablit
    const serviceAction = removedPoint.rally.find(a => a.type === 'service');
    if (serviceAction) {
        gameState.servingTeam = serviceAction.team;
    }
    
    // Réinitialiser le serveur (on ne sait pas forcément qui servait avant)
    gameState.currentServer = null;
    
    // Mettre à jour l'affichage
    updateScore();
    
    // Recalculer les stats
    recalculateAllStats();
    
    // Sauvegarder
    saveCurrentSet();
    
    // Fermer la modal
    closeUndoPointModal();
    
    // Reset pour nouveau point
    gameState.rally = [];
    gameState.currentAction = {};
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
    clearMarkers();
    clearArrows();
    hideServiceZones();
    hideReceptionQualityZones();
    hideDefenseQualityZones();
    hideAttackZones();
    hideDefenseZones();
    highlightCourt(null);

    gameState.phase = 'server_selection';
    updatePhase();
    renderServerSelection();
}

function redrawRally() {
    // Redessiner tous les markers et flèches du rally actuel
    clearMarkers();
    clearArrows();

    // Si le rally est vide, rien à redessiner
    if (gameState.rally.length === 0) return;

    // Redessiner le service si présent
    const serviceAction = gameState.rally.find(a => a.type === 'service');
    if (serviceAction) {
        if (serviceAction.startPos) {
            addMarker(serviceAction.startPos, 'service');
        }
        if (serviceAction.endPos) {
            addMarker(serviceAction.endPos, 'service');
        }
    }

    // Redessiner les autres actions
    for (let i = 0; i < gameState.rally.length; i++) {
        const action = gameState.rally[i];
        
        if (action.type === 'reception') {
            if (action.endPos) {
                addMarker(action.endPos, 'reception');
            }
            // Dessiner flèche service
            if (serviceAction && serviceAction.startPos && serviceAction.endPos) {
                drawArrow(serviceAction.startPos, serviceAction.endPos, 'service');
                // Dessiner la flèche de réception
                if (action.endPos) {
                    drawArrow(serviceAction.endPos, action.endPos, 'reception');
                }
                // Si retour direct avec position d'arrivée, dessiner la flèche du retour
                if (action.isDirectReturn && action.directReturnEndPos) {
                    addMarker(action.directReturnEndPos, 'reception');
                    drawArrow(action.endPos, action.directReturnEndPos, 'reception');
                }
            }
        } else if (action.type === 'pass') {
            if (action.endPos) {
                addMarker(action.endPos, 'pass');
            }
            // Trouver l'action précédente pour la flèche
            const prevAction = gameState.rally[i - 1];
            if (prevAction && prevAction.endPos && action.endPos) {
                drawArrow(prevAction.endPos, action.endPos, 'pass');
            }
        } else if (action.type === 'attack') {
            // Déterminer le type de marker/flèche selon le type d'attaque
            let arrowType = 'attack';
            if (action.attackType === 'feinte') {
                arrowType = 'attack-feinte';
            } else if (action.attackType === 'relance') {
                arrowType = 'attack-relance';
            } else if (action.attackType === 'deuxieme_main' || action.attackType === 'attaque_directe') {
                arrowType = 'attack-second';
            }
            
            if (action.endPos) {
                addMarker(action.endPos, arrowType);
            }
            // Trouver l'action précédente (passe, ou réception/défense si 2ème touche)
            const prevAction = gameState.rally[i - 1];
            if (prevAction && prevAction.endPos && action.endPos) {
                drawArrow(prevAction.endPos, action.endPos, arrowType);
            }
        } else if (action.type === 'block') {
            if (action.endPos) {
                addMarker(action.endPos, 'block-touch');
            }
            // 2 flèches : attaque → filet + filet → atterrissage bloc
            const lastAttack = [...gameState.rally.slice(0, i)].reverse().find(a => a.type === 'attack');
            if (lastAttack && lastAttack.endPos && action.endPos) {
                const netPos = getNetCenteredPos(lastAttack.endPos);
                drawArrow(lastAttack.endPos, netPos, getAttackArrowType(lastAttack.attackType));
                drawArrow(netPos, action.endPos, 'block-touch');
            }
        } else if (action.type === 'defense') {
            if (action.endPos) {
                addMarker(action.endPos, 'defense');
            }
            // Si c'est un retour direct de défense, afficher aussi le point d'arrivée
            if (action.isDirectReturn && action.directReturnEndPos) {
                addMarker(action.directReturnEndPos, 'defense');
                if (action.endPos) {
                    drawArrow(action.endPos, action.directReturnEndPos, 'defense');
                }
            } else {
                // Trouver l'action précédente (block, attack, ou retour direct)
                const prevAction = gameState.rally[i - 1];
                if (prevAction && prevAction.type === 'reception' && prevAction.isDirectReturn && prevAction.directReturnEndPos) {
                    // Cas du retour direct de réception : flèche depuis directReturnEndPos
                    if (action.endPos) {
                        drawArrow(prevAction.directReturnEndPos, action.endPos, 'defense');
                    }
                } else if (prevAction && prevAction.type === 'defense' && prevAction.isDirectReturn && prevAction.directReturnEndPos) {
                    // Cas du retour direct de défense précédente : flèche depuis directReturnEndPos
                    if (action.endPos) {
                        drawArrow(prevAction.directReturnEndPos, action.endPos, 'defense');
                    }
                } else if (prevAction && prevAction.endPos && action.endPos) {
                    drawArrow(prevAction.endPos, action.endPos, 'defense');
                }
            }
        }
    }
}

function saveCurrentSet() {
    currentSet.homeScore = gameState.homeScore;
    currentSet.awayScore = gameState.awayScore;
    currentMatch.sets[setIndex] = currentSet;
    Storage.saveCurrentMatch(currentMatch);
}

// ==================== CHANGEMENT DE JOUEUR ====================
let subState = {
    team: 'home',
    selectedSlot: null,   // Position number on court
    selectedBench: null   // Bench player name
};

function openSubModal() {
    subState = { team: 'home', selectedSlot: null, selectedBench: null };
    
    document.getElementById('subTabAway').textContent = currentMatch.opponent || 'Adversaire';
    document.getElementById('subTabHome').classList.add('active');
    document.getElementById('subTabAway').classList.remove('active');
    
    renderSubModal();
    document.getElementById('subModalOverlay').classList.add('active');
}

function closeSubModal(event) {
    if (event && event.target !== event.currentTarget) return;
    document.getElementById('subModalOverlay').classList.remove('active');
}

function switchSubTeam(team) {
    subState = { team, selectedSlot: null, selectedBench: null };
    
    document.getElementById('subTabHome').classList.toggle('active', team === 'home');
    document.getElementById('subTabAway').classList.toggle('active', team === 'away');
    
    renderSubModal();
}

function getPosForRole(team, role) {
    const roles = POSITION_ROLES[team];
    for (const [pos, r] of Object.entries(roles)) {
        if (r === role) return pos;
    }
    return null;
}

function renderSubModal() {
    const team = subState.team;
    const lineup = team === 'home' ? currentSet.homeLineup : currentSet.awayLineup;
    
    // Update court slots by role
    const roleList = ['Passeur', 'R4', 'Centre', 'Pointu'];
    roleList.forEach(role => {
        const slotEl = document.getElementById('subSlot' + role);
        const playerSpan = slotEl.querySelector('.slot-player');
        const pos = getPosForRole(team, role);
        const playerName = lineup[pos];
        
        playerSpan.textContent = playerName || '—';
        slotEl.classList.toggle('empty', !playerName);
        slotEl.classList.toggle('selected', subState.selectedSlot === role);
    });
    
    // Update bench
    const benchGrid = document.getElementById('subBenchGrid');
    const onCourt = Object.values(lineup).filter(p => p !== null);
    let bench = [];
    
    if (team === 'home') {
        const allPlayers = currentMatch.players || [];
        bench = allPlayers.filter(p => !onCourt.includes(p.prenom)).map(p => p.prenom);
    } else {
        const allAway = currentMatch.adversePlayers || [];
        bench = allAway.filter(name => !onCourt.includes(name));
    }
    
    if (bench.length > 0) {
        benchGrid.innerHTML = bench.map(name => `
            <div class="sub-bench-player ${subState.selectedBench === name ? 'selected' : ''}"
                 onclick="subBenchClick('${name}')">${name}</div>
        `).join('');
    } else {
        benchGrid.innerHTML = '<span class="sub-no-player">Pas de remplaçant</span>';
    }

    // Blocker right toggle (Passeur/Pointu)
    const blockerRightToggle = document.getElementById('subBlockerRightToggle');
    const currentBlockerRight = team === 'home'
        ? (currentSet.homeBlockerRight || 'Pointu')
        : (currentSet.awayBlockerRight || 'Pointu');
    blockerRightToggle.innerHTML = ['Pointu', 'Passeur'].map(role => `
        <div class="sub-blocker-btn ${team} ${currentBlockerRight === role ? 'active' : ''}"
             onclick="setSubBlockerRight('${role}')">${role}</div>
    `).join('');

    // Primary blocker toggle (R4 / bloqueur droit)
    const primaryBlockerToggle = document.getElementById('subPrimaryBlockerToggle');
    const currentPrimary = team === 'home'
        ? (currentSet.homePrimaryBlocker || 'right')
        : (currentSet.awayPrimaryBlocker || 'right');
    primaryBlockerToggle.innerHTML = [
        { value: 'R4', label: 'R4' },
        { value: 'right', label: 'Pointu/Passeur' }
    ].map(opt => `
        <div class="sub-blocker-btn ${team} ${currentPrimary === opt.value ? 'active' : ''}"
             onclick="setSubPrimaryBlocker('${opt.value}')">${opt.label}</div>
    `).join('');
}

function subSlotClick(role) {
    const team = subState.team;
    const lineup = team === 'home' ? currentSet.homeLineup : currentSet.awayLineup;
    const pos = getPosForRole(team, role);
    
    if (subState.selectedBench) {
        // Bench player selected → substitute into this slot
        const benchPlayer = subState.selectedBench;
        
        lineup[pos] = benchPlayer;
        
        const statsTeam = team === 'home' ? setStats.home : setStats.away;
        if (!statsTeam[benchPlayer]) {
            statsTeam[benchPlayer] = initPlayerStats(benchPlayer);
        }
        
        subState.selectedBench = null;
        saveCurrentSet();
        renderStatsTables();
        renderServerSelection();
        renderSubModal();
        
    } else if (subState.selectedSlot !== null) {
        if (subState.selectedSlot === role) {
            // Deselect
            subState.selectedSlot = null;
            renderSubModal();
        } else {
            // Swap positions between the two roles
            const pos1 = getPosForRole(team, subState.selectedSlot);
            const pos2 = pos;
            const temp = lineup[pos1];
            lineup[pos1] = lineup[pos2];
            lineup[pos2] = temp;
            
            subState.selectedSlot = null;
            saveCurrentSet();
            renderSubModal();
        }
    } else {
        // Select this slot
        subState.selectedSlot = role;
        subState.selectedBench = null;
        renderSubModal();
    }
}

function subBenchClick(playerName) {
    if (subState.selectedSlot !== null) {
        // Court slot selected → substitute bench player into that slot
        const team = subState.team;
        const lineup = team === 'home' ? currentSet.homeLineup : currentSet.awayLineup;
        const pos = getPosForRole(team, subState.selectedSlot);
        
        lineup[pos] = playerName;
        
        const statsTeam = team === 'home' ? setStats.home : setStats.away;
        if (!statsTeam[playerName]) {
            statsTeam[playerName] = initPlayerStats(playerName);
        }
        
        subState.selectedSlot = null;
        saveCurrentSet();
        renderStatsTables();
        renderServerSelection();
        renderSubModal();
        
    } else if (subState.selectedBench === playerName) {
        // Deselect
        subState.selectedBench = null;
        renderSubModal();
    } else {
        // Select this bench player
        subState.selectedBench = playerName;
        subState.selectedSlot = null;
        renderSubModal();
    }
}

function setSubBlockerRight(role) {
    const team = subState.team;
    if (team === 'home') {
        currentSet.homeBlockerRight = role;
    } else {
        currentSet.awayBlockerRight = role;
    }
    saveCurrentSet();
    renderSubModal();
}

function setSubPrimaryBlocker(value) {
    const team = subState.team;
    if (team === 'home') {
        currentSet.homePrimaryBlocker = value;
    } else {
        currentSet.awayPrimaryBlocker = value;
    }
    saveCurrentSet();
    renderSubModal();
}

function handleBack() {
    if (confirm('Voulez-vous quitter le match en cours ? Les données seront sauvegardées.')) {
        saveCurrentSet();
        window.location.href = 'index.html';
    }
}

