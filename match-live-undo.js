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
    const serverTeamName = serverTeam === 'home' ? 'Jen et ses Saints' : escapeHtml(currentMatch.opponent || 'Adversaire');

    // Qui a marqué ?
    const whoScored = lastPoint.homeScore > scoreBeforeHome ? 'home' : 'away';
    const whoScoredName = whoScored === 'home' ? 'Jen et ses Saints' : escapeHtml(currentMatch.opponent || 'Adversaire');

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
        const safePlayer = escapeHtml(lastAction.player);

        if (lastAction.type === 'service') {
            if (lastAction.result === 'ace') lastActionDesc = `Ace de ${safePlayer}`;
            else if (lastAction.result === 'fault' || lastAction.result === 'fault_out' || lastAction.result === 'fault_net') lastActionDesc = `Faute au service de ${safePlayer}`;
            else lastActionDesc = `Service de ${safePlayer}`;
        } else if (lastAction.type === 'attack') {
            if (lastAction.result === 'point') lastActionDesc = `Attaque gagnante de ${safePlayer}`;
            else if (lastAction.attackType === 'faute') lastActionDesc = `Faute d'attaque de ${safePlayer}`;
            else if (lastAction.result === 'out') lastActionDesc = `Attaque out de ${safePlayer}`;
            else lastActionDesc = `${actionLabel} de ${safePlayer}`;
        } else if (lastAction.type === 'reception') {
            if (lastAction.isDirectReturnWinner) lastActionDesc = `Retour gagnant de ${safePlayer}`;
            else if (lastAction.quality?.label === 'Faute') lastActionDesc = `Faute réception de ${safePlayer}`;
            else lastActionDesc = `${actionLabel} de ${safePlayer}`;
        } else {
            lastActionDesc = `${actionLabel}${lastAction.player ? ' de ' + safePlayer : ''}`;
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
            <div><span class="label">🏐 Service :</span> ${escapeHtml(serverName)} (${serverTeamName})</div>
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

    // Switch tie-break : si on rembobine avant l'index, annuler le switch
    if (currentSet.cameraSwitchAtPointIndex !== undefined
        && points.length < currentSet.cameraSwitchAtPointIndex) {
        delete currentSet.cameraSwitchAtPointIndex;
        if (typeof refreshCameraSideFromState === 'function') {
            refreshCameraSideFromState();
        }
        if (typeof updateLabels === 'function') updateLabels();
    }

    // V20.27 : Restaurer l'équipe au service ET le serveur intelligemment
    const serviceAction = removedPoint.rally.find(a => a.type === 'service');
    if (serviceAction) {
        gameState.servingTeam = serviceAction.team;

        // Chercher le point précédent pour déterminer si le serveur continue
        if (prevPoint) {
            const prevServiceAction = prevPoint.rally.find(a => a.type === 'service');
            if (prevServiceAction && prevServiceAction.team === serviceAction.team) {
                // Même équipe servait au point précédent → garder le serveur précédent
                gameState.currentServer = prevServiceAction.player;
            } else {
                // Side-out : le serveur du point supprimé était le bon serveur pour cette équipe
                gameState.currentServer = serviceAction.player;
            }
        } else {
            // Premier point du set → on ne sait pas qui servait avant
            gameState.currentServer = null;
        }
    } else {
        gameState.currentServer = null;
    }

    // Mettre à jour l'affichage
    updateScore();

    // Recalculer les stats
    recalculateAllStats();

    // Sauvegarder
    saveCurrentSet();

    // Fermer la modal
    closeUndoPointModal();

    // Reset pour nouveau point via WorkflowEngine
    WorkflowEngine._resetRallyState();
    WorkflowEngine.clearStack();

    // V20.27 : Transition vers serve_start si le serveur est connu, sinon server_selection
    if (gameState.currentServer) {
        WorkflowEngine.transition('serve_start', { serverContinue: true });
    } else {
        WorkflowEngine.transition('server_selection');
    }
}

// ==================== V20.183 : Revenir dans le point précédent ====================

function showResumePointModal() {
    const points = currentSet.points;
    if (!points || points.length === 0) return;

    const lastPoint = points[points.length - 1];
    const rally = lastPoint.rally;

    // Score avant ce point
    const prevPoint = points.length >= 2 ? points[points.length - 2] : null;
    const initialHome = currentSet.initialHomeScore || 0;
    const initialAway = currentSet.initialAwayScore || 0;
    const scoreBeforeHome = prevPoint ? prevPoint.homeScore : initialHome;
    const scoreBeforeAway = prevPoint ? prevPoint.awayScore : initialAway;

    // Info service
    const serviceAction = rally.find(a => a.type === 'service');
    const serverName = serviceAction ? serviceAction.player : '?';
    const serverTeam = serviceAction ? serviceAction.team : '?';
    const serverTeamName = serverTeam === 'home' ? 'Jen et ses Saints' : escapeHtml(currentMatch.opponent || 'Adversaire');

    // Dernière action (celle qui a terminé le point)
    const lastAction = rally[rally.length - 1];
    let lastActionDesc = '';
    if (lastAction) {
        const actionLabels = {
            'service': 'Service', 'reception': 'Réception', 'pass': 'Passe',
            'attack': 'Attaque', 'block': 'Block', 'defense': 'Défense'
        };
        const actionLabel = actionLabels[lastAction.type] || lastAction.type;
        const safePlayer = escapeHtml(lastAction.player);

        if (lastAction.type === 'service') {
            if (lastAction.result === 'ace') lastActionDesc = `Ace de ${safePlayer}`;
            else if (lastAction.result === 'fault' || lastAction.result === 'fault_out' || lastAction.result === 'fault_net') lastActionDesc = `Faute au service de ${safePlayer}`;
            else lastActionDesc = `Service de ${safePlayer}`;
        } else if (lastAction.type === 'attack') {
            if (lastAction.result === 'point') lastActionDesc = `Attaque gagnante de ${safePlayer}`;
            else if (lastAction.attackType === 'faute') lastActionDesc = `Faute d'attaque de ${safePlayer}`;
            else if (lastAction.result === 'out') lastActionDesc = `Attaque out de ${safePlayer}`;
            else if (lastAction.result === 'fault_net') lastActionDesc = `Attaque filet de ${safePlayer}`;
            else lastActionDesc = `${actionLabel} de ${safePlayer}`;
        } else if (lastAction.type === 'reception') {
            if (lastAction.isDirectReturnWinner) lastActionDesc = `Retour gagnant de ${safePlayer}`;
            else if (lastAction.quality && lastAction.quality.label === 'Faute') lastActionDesc = `Faute réception de ${safePlayer}`;
            else lastActionDesc = `${actionLabel} de ${safePlayer}`;
        } else if (lastAction.type === 'defense') {
            if (lastAction.result === 'fault') lastActionDesc = `Faute défense de ${safePlayer}`;
            else lastActionDesc = `${actionLabel}${lastAction.player ? ' de ' + safePlayer : ''}`;
        } else if (lastAction.type === 'pass') {
            if (lastAction.result === 'out') lastActionDesc = `Passe out de ${safePlayer}`;
            else lastActionDesc = `${actionLabel}${lastAction.player ? ' de ' + safePlayer : ''}`;
        } else {
            lastActionDesc = `${actionLabel}${lastAction.player ? ' de ' + safePlayer : ''}`;
        }
    }

    // Nombre d'actions dans le rally (hors la dernière)
    const nbActions = rally.length - 1;

    const summaryEl = document.getElementById('resumePointSummary');
    summaryEl.innerHTML = `
        <div class="undo-point-score">
            <span class="score-before">${lastPoint.homeScore} - ${lastPoint.awayScore}</span>
            <span class="score-arrow">→</span>
            <span class="score-after">${scoreBeforeHome} - ${scoreBeforeAway}</span>
        </div>
        <div class="undo-point-detail">
            <div><span class="label">🏐 Service :</span> ${escapeHtml(serverName)} (${serverTeamName})</div>
            <div><span class="label">❌ Action à annuler :</span> ${lastActionDesc}</div>
            <div style="margin-top:6px; font-size:11px; color:#9ca3af;">Le rally (${nbActions} action${nbActions > 1 ? 's' : ''}) sera restauré juste avant cette action</div>
        </div>
    `;

    document.getElementById('resumePointOverlay').classList.add('active');
}

function closeResumePointModal(event) {
    if (event && event.target !== event.currentTarget) return;
    document.getElementById('resumePointOverlay').classList.remove('active');
}

function confirmResumeLastPoint() {
    const points = currentSet.points;
    if (!points || points.length === 0) return;

    // 1. Retirer le dernier point
    const removedPoint = points.pop();
    const savedStack = removedPoint._undoStack;

    // 2. Restaurer le score (avant ce point)
    const prevPoint = points.length > 0 ? points[points.length - 1] : null;
    const initialHome = currentSet.initialHomeScore || 0;
    const initialAway = currentSet.initialAwayScore || 0;
    gameState.homeScore = prevPoint ? prevPoint.homeScore : initialHome;
    gameState.awayScore = prevPoint ? prevPoint.awayScore : initialAway;

    // Switch tie-break : si on rembobine avant l'index, annuler le switch
    if (currentSet.cameraSwitchAtPointIndex !== undefined
        && points.length < currentSet.cameraSwitchAtPointIndex) {
        delete currentSet.cameraSwitchAtPointIndex;
        if (typeof refreshCameraSideFromState === 'function') {
            refreshCameraSideFromState();
        }
        if (typeof updateLabels === 'function') updateLabels();
    }

    // 3. Restaurer l'équipe au service
    const serviceAction = removedPoint.rally.find(a => a.type === 'service');
    if (serviceAction) {
        gameState.servingTeam = serviceAction.team;
        gameState.currentServer = serviceAction.player;
    }

    // 4. Recalculer les stats et sauvegarder
    updateScore();
    recalculateAllStats();
    saveCurrentSet();

    // 5. Fermer la modal
    closeResumePointModal();

    if (savedStack && savedStack.length > 0) {
        // V20.27 : stack caché → popState() fait EXACTEMENT comme un undo normal
        // Le dernier snapshot du stack = état juste avant l'action terminale
        WorkflowEngine.stateStack = JSON.parse(JSON.stringify(savedStack));
        WorkflowEngine.popState();
    } else {
        // Fallback : points anciens sans cache → reconstruction manuelle
        const rally = JSON.parse(JSON.stringify(removedPoint.rally));
        const removedAction = rally.pop();

        gameState.rally = rally;
        gameState.currentAction = {};
        gameState.context = WorkflowEngine._freshContext();
        gameState.overridePlayer = null;
        gameState.autoSelectedPlayer = null;
        gameState.overrideTagsTeam = null;

        // Restaurer l'attackingTeam depuis le contexte du rally
        if (removedAction) {
            if (removedAction.type === 'attack' || removedAction.type === 'pass') {
                gameState.attackingTeam = removedAction.team;
            } else if (removedAction.type === 'defense') {
                gameState.attackingTeam = removedAction.team === 'home' ? 'away' : 'home';
            } else if (removedAction.type === 'service') {
                gameState.attackingTeam = removedAction.team === 'home' ? 'away' : 'home';
            } else if (removedAction.type === 'reception') {
                gameState.attackingTeam = removedAction.team;
            } else if (removedAction.type === 'block') {
                gameState.attackingTeam = removedAction.team === 'home' ? 'away' : 'home';
            }
        }

        clearMarkers();
        clearArrows();
        WorkflowEngine.clearStack();
        _rebuildUndoStack(rally, serviceAction);
        redrawRally();
        _resumeToPhase(removedAction);
    }
}

/**
 * Reconstruit le stack undo à partir du rally restauré.
 * Pour chaque action du rally, on push un snapshot qui représente l'état
 * AVANT cette action. Quand popState() restaure ce snapshot, reenter()
 * de la phase reconstruit l'UI correctement.
 *
 * V20.27 : Les flags de contexte sont reconstruits depuis le rally
 * pour que reenter() affiche les bonnes zones et auto-sélections.
 */
function _rebuildUndoStack(rally, serviceAction) {
    if (!rally || rally.length === 0) return;

    for (let i = 0; i < rally.length; i++) {
        const rallySlice = rally.slice(0, i);

        // --- attackingTeam à ce point du rally ---
        let attackingTeam = gameState.servingTeam === 'home' ? 'away' : 'home';
        for (let j = 0; j < i; j++) {
            const a = rally[j];
            if (a.type === 'attack' && (a.result === 'defended' || a.result === 'blocked')) {
                attackingTeam = a.team === 'home' ? 'away' : 'home';
            } else if (a.type === 'reception' || a.type === 'pass') {
                attackingTeam = a.team;
            }
        }

        // --- Phase et currentAction pour ce snapshot ---
        let phase = 'server_selection';
        let snapshotAction = {};
        let snapshotContext = WorkflowEngine._freshContext();

        if (i === 0) {
            phase = 'server_selection';
        } else {
            const prevAction = rally[i - 1];

            if (prevAction.type === 'service') {
                if (prevAction.result === 'in') {
                    phase = 'reception';
                    snapshotAction = {};
                } else {
                    phase = 'serve_end';
                    snapshotAction = {
                        type: 'service',
                        player: prevAction.player,
                        team: prevAction.team,
                        role: prevAction.role,
                        startPos: prevAction.startPos
                    };
                }

            } else if (prevAction.type === 'reception') {
                phase = 'pass';
                snapshotAction = {};
                // V20.27 : si l'action suivante est une passe relance, le flag devait être actif
                if (i < rally.length && rally[i].type === 'pass' && rally[i].passType === 'relance') {
                    snapshotContext.passRelance = true;
                }

            } else if (prevAction.type === 'pass') {
                phase = 'attack_player';
                snapshotAction = {};

            } else if (prevAction.type === 'attack') {
                if (prevAction.result === 'defended' || prevAction.result === 'blocked') {
                    phase = 'result';
                    snapshotContext.autoDefender = null;
                    // V20.27 : reconstruire defenseAttackerRole pour les zones de défense
                    snapshotContext.defenseAttackerRole = prevAction.role;
                } else {
                    phase = 'attack_end';
                    snapshotAction = {
                        type: 'attack',
                        player: prevAction.player,
                        team: prevAction.team,
                        role: prevAction.role,
                        attackType: prevAction.attackType,
                        startPos: prevAction.startPos
                    };
                }

            } else if (prevAction.type === 'defense') {
                phase = 'pass';
                snapshotAction = {};
                // V20.27 : si l'action suivante est une passe relance, le flag devait être actif
                if (i < rally.length && rally[i].type === 'pass' && rally[i].passType === 'relance') {
                    snapshotContext.passRelance = true;
                }

            } else if (prevAction.type === 'block') {
                // V20.27 : reconstruire blockingTeam
                snapshotContext.blockingTeam = prevAction.team;
                // Après un bloc, les zones de défense ne sont PAS affichées (attackerRole: null)
                snapshotContext.defenseAttackerRole = null;
                if (prevAction.passThrough) {
                    // Pass-through : flow forward → result → defense
                    phase = 'result';
                    snapshotContext.autoDefender = null;
                } else {
                    // Bloc return : flow forward → defense directement
                    phase = 'defense';
                    snapshotContext.showDirectAttack = true;
                    // V20.28 : soutien de bloc si la défense est sur l'autre équipe que le bloqueur
                    if (i < rally.length && rally[i].type === 'defense' && rally[i].team !== prevAction.team) {
                        snapshotContext.isBlockSupport = true;
                    }
                }
            }
        }

        const snapshot = {
            label: 'rebuild_' + i,
            phase: phase,
            servingTeam: gameState.servingTeam,
            attackingTeam: attackingTeam,
            currentServer: gameState.currentServer,
            homeScore: gameState.homeScore,
            awayScore: gameState.awayScore,
            setEnded: false,
            currentAction: JSON.parse(JSON.stringify(snapshotAction)),
            rally: JSON.parse(JSON.stringify(rallySlice)),
            context: JSON.parse(JSON.stringify(snapshotContext)),
            overridePlayer: null,
            autoSelectedPlayer: null,
            overrideTagsTeam: null
        };

        WorkflowEngine.stateStack.push(snapshot);
    }
}

/**
 * Détermine la phase de reprise en fonction de l'action retirée
 * et entre dans cette phase via WorkflowEngine.transition()
 */
function _resumeToPhase(removedAction) {
    if (!removedAction) {
        WorkflowEngine.transition('server_selection');
        return;
    }

    switch (removedAction.type) {
        case 'attack': {
            // L'attaque a terminé le point (out, point, fault, bloc_out)
            // Reprendre en attack_end : l'attaquant est déjà sélectionné, on attend le clic terrain
            gameState.currentAction = {
                type: 'attack',
                player: removedAction.player,
                team: removedAction.team,
                role: removedAction.role,
                attackType: removedAction.attackType
            };
            if (removedAction.startPos) {
                gameState.currentAction.startPos = removedAction.startPos;
            }
            WorkflowEngine.transition('attack_end');
            break;
        }

        case 'service': {
            // Service ace ou fault → reprendre en serve_end
            gameState.currentAction = {
                type: 'service',
                player: removedAction.player,
                team: removedAction.team,
                role: removedAction.role,
                startPos: removedAction.startPos
            };
            WorkflowEngine.transition('serve_end');
            break;
        }

        case 'reception': {
            // Réception fault ou retour direct → reprendre en reception
            // L'équipe qui réceptionne est l'attacking team
            gameState.attackingTeam = removedAction.team;
            WorkflowEngine.transition('reception');
            break;
        }

        case 'defense': {
            // Défense fault → reprendre en result (l'attaque est terminée, on attend le résultat défensif)
            // L'équipe qui attaquait est l'adverse du défenseur
            gameState.attackingTeam = removedAction.team === 'home' ? 'away' : 'home';
            WorkflowEngine.transition('result');
            break;
        }

        case 'pass': {
            // Passe fault/out → reprendre en pass
            gameState.attackingTeam = removedAction.team;
            WorkflowEngine.transition('pass');
            break;
        }

        case 'block': {
            // Block qui termine le point → reprendre en attack_net_choice ou result
            // L'équipe qui attaquait est l'adverse du bloqueur
            gameState.attackingTeam = removedAction.team === 'home' ? 'away' : 'home';
            WorkflowEngine.transition('result');
            break;
        }

        default:
            // Fallback : revenir à server_selection
            WorkflowEngine.transition('server_selection');
            break;
    }

    // Le stack a déjà été restauré (cache V20.27) ou reconstruit (_rebuildUndoStack)
    // Pas besoin de pushState ici — le Retour remontera dans le rally
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
        // Flèche de service dessinée indépendamment de la réception
        if (serviceAction.startPos && serviceAction.endPos) {
            drawArrow(serviceAction.startPos, serviceAction.endPos, 'service');
        }
    }

    // Redessiner les autres actions
    for (let i = 0; i < gameState.rally.length; i++) {
        const action = gameState.rally[i];

        if (action.type === 'reception') {
            if (action.endPos) {
                addMarker(action.endPos, 'reception');
            }
            // Dessiner la flèche de réception (service → réception)
            if (serviceAction && serviceAction.endPos && action.endPos) {
                drawArrow(serviceAction.endPos, action.endPos, 'reception');
            }
            // Si retour direct avec position d'arrivée, dessiner la flèche du retour
            if (action.isDirectReturn && action.directReturnEndPos) {
                addMarker(action.directReturnEndPos, 'reception');
                drawArrow(action.endPos, action.directReturnEndPos, 'reception');
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
            if (action.passThrough) {
                // V20.27 : pass-through — pas de flèches bloc (la balle continue)
                // La défense suivante dessinera sa flèche depuis block.endPos (filet)
            } else {
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
            }
        } else if (action.type === 'defense') {
            // Marqueur au point de départ de la défense (zone auto-select) si disponible
            if (action.startPos && action.startPos !== action.endPos) {
                addMarker(action.startPos, 'defense');
            }
            if (action.endPos) {
                addMarker(action.endPos, 'defense');
            }
            // Si c'est un retour direct de défense, afficher aussi le point d'arrivée
            if (action.isDirectReturn && action.directReturnEndPos) {
                addMarker(action.directReturnEndPos, 'defense');
                if (action.endPos) {
                    drawArrow(action.endPos, action.directReturnEndPos, 'defense');
                }
            } else if (action.startPos && action.endPos) {
                // Flèche intermédiaire : attaque → zone de défense
                const prevAction = gameState.rally[i - 1];
                if (prevAction && prevAction.endPos && action.incomingArrowType) {
                    drawArrow(prevAction.endPos, action.startPos, action.incomingArrowType);
                } else if (prevAction && prevAction.endPos) {
                    // Fallback si pas de incomingArrowType
                    const arrowType = prevAction.type === 'attack'
                        ? getAttackArrowType(prevAction.attackType)
                        : 'defense';
                    drawArrow(prevAction.endPos, action.startPos, arrowType);
                }
                // Flèche depuis la position de défense (startPos = zone auto-select)
                drawArrow(action.startPos, action.endPos, 'defense');
            } else {
                // Fallback : flèche depuis l'action précédente
                const prevAction = gameState.rally[i - 1];
                if (prevAction && prevAction.type === 'reception' && prevAction.isDirectReturn && prevAction.directReturnEndPos) {
                    if (action.endPos) {
                        drawArrow(prevAction.directReturnEndPos, action.endPos, 'defense');
                    }
                } else if (prevAction && prevAction.type === 'defense' && prevAction.isDirectReturn && prevAction.directReturnEndPos) {
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
    try {
        Storage.saveCurrentMatch(currentMatch);
    } catch (e) {
        if (e.name === 'QuotaExceededError') {
            // Libérer de l'espace : supprimer tous les _undoStack des points
            for (const set of currentMatch.sets) {
                if (set && set.points) {
                    for (const pt of set.points) {
                        if (pt._undoStack) delete pt._undoStack;
                    }
                }
            }
            try {
                Storage.saveCurrentMatch(currentMatch);
            } catch (e2) {
                console.error('localStorage plein même après nettoyage _undoStack', e2);
            }
        } else {
            throw e;
        }
    }
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
                 data-bench-player="${escapeHtml(name)}">${escapeHtml(name)}</div>
        `).join('');
        benchGrid.querySelectorAll('[data-bench-player]').forEach(el => {
            el.addEventListener('click', () => subBenchClick(el.dataset.benchPlayer));
        });
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
             data-blocker-role="${role}">${role}</div>
    `).join('');
    blockerRightToggle.querySelectorAll('[data-blocker-role]').forEach(el => {
        el.addEventListener('click', () => setSubBlockerRight(el.dataset.blockerRole));
    });

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
             data-primary-blocker="${opt.value}">${opt.label}</div>
    `).join('');
    primaryBlockerToggle.querySelectorAll('[data-primary-blocker]').forEach(el => {
        el.addEventListener('click', () => setSubPrimaryBlocker(el.dataset.primaryBlocker));
    });

    // Mixité — pré-remplir avec les valeurs actuelles
    document.getElementById('subMixiteHome').value = currentSet.mixiteHome || 0;
    document.getElementById('subMixiteAway').value = currentSet.mixiteAway || 0;
    document.getElementById('subMixiteAwayLabel').textContent =
        (currentMatch.opponent || 'Adv').substring(0, 10); // textContent est safe (pas innerHTML)
}

function subSlotClick(role) {
    const team = subState.team;
    const lineup = team === 'home' ? currentSet.homeLineup : currentSet.awayLineup;
    const pos = getPosForRole(team, role);
    
    if (subState.selectedBench) {
        // Bench player selected → substitute into this slot
        const benchPlayer = subState.selectedBench;
        const oldPlayer = lineup[pos];

        lineup[pos] = benchPlayer;

        // Log substitution for playing time tracking
        if (!currentSet.substitutions) currentSet.substitutions = [];
        if (oldPlayer && benchPlayer) {
            currentSet.substitutions.push({
                pointIndex: (currentSet.points || []).length,
                team: team,
                playerOut: oldPlayer,
                playerIn: benchPlayer,
                position: parseInt(pos),
                homeScore: currentSet.homeScore || 0,
                awayScore: currentSet.awayScore || 0
            });
        }

        const statsTeam = team === 'home' ? setStats.home : setStats.away;
        if (!statsTeam[benchPlayer]) {
            statsTeam[benchPlayer] = initPlayerStats(benchPlayer);
        }
        
        subState.selectedBench = null;
        saveCurrentSet();
        renderStatsTables();
        if (WorkflowEngine && WorkflowEngine.phases[gameState.phase] && WorkflowEngine.phases[gameState.phase].reenter) {
            WorkflowEngine.phases[gameState.phase].reenter();
        }
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
            const player1 = lineup[pos1];
            const player2 = lineup[pos2];
            lineup[pos1] = player2;
            lineup[pos2] = player1;

            // Log role swap for historique
            if (!currentSet.substitutions) currentSet.substitutions = [];
            currentSet.substitutions.push({
                type: 'swap',
                pointIndex: (currentSet.points || []).length,
                team: team,
                player1: player1,
                role1: subState.selectedSlot,
                player2: player2,
                role2: role,
                homeScore: currentSet.homeScore || 0,
                awayScore: currentSet.awayScore || 0
            });

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
        const oldPlayer = lineup[pos];

        lineup[pos] = playerName;

        // Log substitution for playing time tracking
        if (!currentSet.substitutions) currentSet.substitutions = [];
        if (oldPlayer && playerName) {
            currentSet.substitutions.push({
                pointIndex: (currentSet.points || []).length,
                team: team,
                playerOut: oldPlayer,
                playerIn: playerName,
                position: parseInt(pos),
                homeScore: currentSet.homeScore || 0,
                awayScore: currentSet.awayScore || 0
            });
        }

        const statsTeam = team === 'home' ? setStats.home : setStats.away;
        if (!statsTeam[playerName]) {
            statsTeam[playerName] = initPlayerStats(playerName);
        }

        subState.selectedSlot = null;
        saveCurrentSet();
        renderStatsTables();
        if (WorkflowEngine && WorkflowEngine.phases[gameState.phase] && WorkflowEngine.phases[gameState.phase].reenter) {
            WorkflowEngine.phases[gameState.phase].reenter();
        }
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

function setMixite() {
    const newMixHome = parseInt(document.getElementById('subMixiteHome').value) || 0;
    const newMixAway = parseInt(document.getElementById('subMixiteAway').value) || 0;

    const oldMixHome = currentSet.mixiteHome || 0;
    const oldMixAway = currentSet.mixiteAway || 0;

    const diffHome = newMixHome - oldMixHome;
    const diffAway = newMixAway - oldMixAway;

    if (diffHome === 0 && diffAway === 0) return;

    // Mettre à jour les champs mixité sur le set
    currentSet.mixiteHome = newMixHome;
    currentSet.mixiteAway = newMixAway;

    // Mettre à jour le score initial (bonus) et le score courant sur le set
    currentSet.initialHomeScore = (currentSet.initialHomeScore || 0) + diffHome;
    currentSet.initialAwayScore = (currentSet.initialAwayScore || 0) + diffAway;
    currentSet.homeScore = (currentSet.homeScore || 0) + diffHome;
    currentSet.awayScore = (currentSet.awayScore || 0) + diffAway;

    // Mettre à jour gameState
    gameState.homeScore += diffHome;
    gameState.awayScore += diffAway;

    // Décaler tous les scores stockés dans les points du set
    if (currentSet.points) {
        currentSet.points.forEach(function(pt) {
            pt.homeScore += diffHome;
            pt.awayScore += diffAway;
        });
    }

    // Mettre à jour l'affichage
    updateScore();
    renderMiniTimeline();
    saveCurrentSet();

    // Vérifier si le nouveau score déclenche une fin de set
    checkSetEnd();
    if (gameState.setEnded) {
        closeSubModal();
    }
}

function handleBack() {
    if (confirm('Voulez-vous quitter le match en cours ? Les données seront sauvegardées.')) {
        saveCurrentSet();
        window.location.href = 'index.html';
    }
}

