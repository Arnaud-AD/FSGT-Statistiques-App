// ==================== WORKFLOW ENGINE V18.0 ====================
// Réécriture complète du workflow match-live.
// Remplace : tous les handlers, le routeur switch/case, l'undo par phase.
// Garde : zones, flèches, tags, stats, CSS, HTML, Firebase.

const WorkflowEngine = {
    // ==================== REGISTRE DES PHASES ====================
    phases: {},

    // ==================== PILE D'UNDO (snapshots) ====================
    stateStack: [],
    maxStackSize: 50,

    // ==================== API PUBLIQUE ====================

    registerPhase(name, handler) {
        handler.name = name;
        this.phases[name] = handler;
    },

    /**
     * Transition vers une nouvelle phase.
     * Appelle exit() sur la phase courante, puis enter() sur la nouvelle.
     */
    transition(newPhase, context) {
        const oldPhase = this.phases[gameState.phase];
        if (oldPhase && oldPhase.exit) {
            oldPhase.exit();
        }
        gameState.phase = newPhase;
        const newHandler = this.phases[newPhase];
        if (newHandler && newHandler.enter) {
            newHandler.enter(context || {});
        }
        updatePhase();
    },

    /**
     * Sauvegarde un snapshot complet de gameState avant chaque action utilisateur.
     */
    pushState(label) {
        const snapshot = {
            label: label || gameState.phase,
            phase: gameState.phase,
            servingTeam: gameState.servingTeam,
            attackingTeam: gameState.attackingTeam,
            currentServer: gameState.currentServer,
            homeScore: gameState.homeScore,
            awayScore: gameState.awayScore,
            setEnded: gameState.setEnded,
            currentAction: JSON.parse(JSON.stringify(gameState.currentAction)),
            rally: JSON.parse(JSON.stringify(gameState.rally)),
            context: JSON.parse(JSON.stringify(gameState.context)),
            overridePlayer: gameState.overridePlayer,
            autoSelectedPlayer: gameState.autoSelectedPlayer,
            overrideTagsTeam: gameState.overrideTagsTeam,
        };
        this.stateStack.push(snapshot);
        if (this.stateStack.length > this.maxStackSize) {
            this.stateStack.shift();
        }
    },

    /**
     * Restaure le snapshot précédent (= undo).
     * Retourne true si restauration réussie, false si pile vide.
     */
    popState() {
        console.log('[DEBUG popState] stackSize:', this.stateStack.length);
        if (this.stateStack.length === 0) { console.log('[DEBUG popState] EMPTY STACK'); return false; }
        const snapshot = this.stateStack.pop();
        console.log('[DEBUG popState] restoring phase:', snapshot.phase, 'label:', snapshot.label);

        // Restaurer gameState
        gameState.phase = snapshot.phase;
        gameState.servingTeam = snapshot.servingTeam;
        gameState.attackingTeam = snapshot.attackingTeam;
        gameState.currentServer = snapshot.currentServer;
        gameState.homeScore = snapshot.homeScore;
        gameState.awayScore = snapshot.awayScore;
        gameState.setEnded = snapshot.setEnded;
        gameState.currentAction = snapshot.currentAction;
        gameState.rally = snapshot.rally;
        gameState.context = snapshot.context;
        gameState.overridePlayer = snapshot.overridePlayer;
        gameState.autoSelectedPlayer = snapshot.autoSelectedPlayer;
        gameState.overrideTagsTeam = snapshot.overrideTagsTeam;

        // Nettoyage UI complet
        clearMarkers();
        clearArrows();
        hideAllSections();
        hideDefenseZones();
        hideDefenseQualityZones();
        hideAttackZones();
        hidePositionZones();
        hideReceptionQualityZones();
        hideServiceZones();
        deactivateNetZone();
        document.getElementById('outArea').classList.remove('active');
        document.getElementById('outLabelTop').style.display = 'none';
        document.getElementById('outLabelBottom').style.display = 'none';
        highlightCourt(null);

        // Reconstruire les visuels du rally en cours
        redrawRally();

        // Redessiner les visuels de l'action en cours (pas encore dans le rally)
        this._redrawCurrentAction();

        // Re-entrer dans la phase restaurée
        const handler = this.phases[gameState.phase];
        if (handler && handler.reenter) {
            handler.reenter();
        }

        // Mettre à jour l'affichage
        updatePhase();
        updateScore();

        return true;
    },

    /**
     * Vide la pile d'undo (nouveau point).
     */
    clearStack() {
        this.stateStack = [];
    },

    /**
     * Redessine les visuels de l'action en cours (pas encore dans le rally).
     * Appelé par popState() après redrawRally() pour restaurer les marqueurs
     * d'une action partiellement construite (ex: service avec startPos mais pas encore endPos).
     */
    _redrawCurrentAction() {
        const action = gameState.currentAction;
        if (!action || !action.type) return;

        if (action.type === 'service' && action.startPos) {
            addMarker(action.startPos, 'service');
        }
        // Défense avec startPos pré-défini (zone auto-select) pas encore dans le rally
        if (action.type === 'defense' && action.startPos) {
            addMarker(action.startPos, 'defense');
            // Dessiner la flèche intermédiaire (attaque → zone de défense)
            const lastRallyAction = gameState.rally.length > 0 ? gameState.rally[gameState.rally.length - 1] : null;
            if (lastRallyAction && lastRallyAction.endPos && action.incomingArrowType) {
                drawArrow(lastRallyAction.endPos, action.startPos, action.incomingArrowType);
            }
        }
    },

    // ==================== DÉLÉGATION DES CLICS ====================

    handleCourtClick(clickData) {
        const handler = this.phases[gameState.phase];
        if (handler && handler.handleClick) {
            handler.handleClick(clickData);
        }
    },

    handleNetZoneClick(clickData) {
        const handler = this.phases[gameState.phase];
        if (handler && handler.handleNetClick) {
            handler.handleNetClick(clickData);
        }
    },

    handleOutAreaClick(clickData) {
        const handler = this.phases[gameState.phase];
        if (handler && handler.handleOutClick) {
            handler.handleOutClick(clickData);
        }
    },

    handleButton(action, ...args) {
        const handler = this.phases[gameState.phase];
        if (handler && handler.handleButton) {
            handler.handleButton(action, ...args);
        }
    },

    // ==================== LIFECYCLE ====================

    /**
     * Attribue un point à une équipe.
     */
    awardPoint(team) {
        if (team === 'home') {
            gameState.homeScore++;
        } else {
            gameState.awayScore++;
        }
        updateScore();

        // Side-out : l'équipe qui réceptionne gagne → elle sert maintenant
        if (team !== gameState.servingTeam) {
            gameState.servingTeam = team;
            gameState.currentServer = null; // Nouveau serveur nécessaire
        }
        // Break : le serveur continue

        saveCurrentSet();
        gameState.setEnded = false;
        checkSetEnd();
    },

    /**
     * Finalise le rally en cours : sauvegarde le point, recalcule les stats.
     */
    endRally() {
        // Sauvegarder le point
        const serviceAction = gameState.rally.find(a => a.type === 'service');
        currentSet.points.push({
            rally: JSON.parse(JSON.stringify(gameState.rally)),
            homeScore: gameState.homeScore,
            awayScore: gameState.awayScore,
            servingTeam: serviceAction ? serviceAction.team : gameState.servingTeam,
            server: serviceAction ? serviceAction.player : null,
            timestamp: Date.now()
        });

        recalculateAllStats();

        // Si le set est terminé, ne pas démarrer un nouveau point
        if (gameState.setEnded) {
            this._resetRallyState();
            return;
        }

        // Préparer le prochain point
        this._resetRallyState();
        this.clearStack();

        if (gameState.currentServer) {
            // Même serveur continue
            this.transition('serve_start', { serverContinue: true });
        } else {
            // Nouveau serveur nécessaire (side-out)
            this.transition('server_selection');
        }
    },

    /**
     * Reset l'état du rally (entre les points).
     */
    _resetRallyState() {
        gameState.rally = [];
        gameState.currentAction = {};
        gameState.context = this._freshContext();
        gameState.overridePlayer = null;
        gameState.autoSelectedPlayer = null;
        gameState.overrideTagsTeam = null;
        clearMarkers();
        clearArrows();
        hideServiceZones();
        hideReceptionQualityZones();
        hideDefenseQualityZones();
        hideAttackZones();
        hideDefenseZones();
        hidePositionZones();
        deactivateNetZone();
        document.getElementById('outArea').classList.remove('active');
        highlightCourt(null);
    },

    /**
     * Retourne un objet context frais (remplace les flags ad-hoc).
     */
    _freshContext() {
        return {
            source: null,
            autoDefender: null,
            autoBlocker: null,
            pendingBlockEnd: null,
            pendingDefenseClick: null,
            netBlockPos: null,
            blockMarkerDrawn: false,
            blockingTeam: null,
            defenseFaultShortcut: false,
            blocOutAttackingTeam: null,
            blocOutPending: false,
            blocOutBlockingTeam: null,
            passAutoSelected: false,
            attackAutoSelected: false,
            receptionAutoSelected: false,
            defenseAttackerRole: null,
            showDirectAttack: false,
            receptionOpponentClickData: null,
            passRelance: false
        };
    },

    // ==================== HELPERS ====================

    /**
     * Retourne le côté terrain opposé à l'équipe donnée.
     */
    getOppositeCourtSide(team) {
        const side = getCourtSideForTeam(team);
        return side === 'top' ? 'bottom' : 'top';
    },

    /**
     * Affiche les labels OUT correctement selon l'équipe.
     */
    showOutLabels(team) {
        const courtSide = team ? getCourtSideForTeam(team) : null;
        document.getElementById('outLabelTop').style.display =
            (!team || courtSide === 'top') ? 'block' : 'none';
        document.getElementById('outLabelBottom').style.display =
            (!team || courtSide === 'bottom') ? 'block' : 'none';
    },

    // ==================== INITIALISATION ====================

    /**
     * Configure les listeners sur le terrain et démarre le workflow.
     */
    setupListeners() {
        const courtTop = document.getElementById('courtTop');
        const courtBottom = document.getElementById('courtBottom');
        const serviceZoneTop = document.getElementById('serviceZoneTop');
        const serviceZoneBottom = document.getElementById('serviceZoneBottom');
        const outArea = document.getElementById('outArea');
        const netClickZone = document.getElementById('netClickZone');

        // Clic terrain
        courtTop.addEventListener('click', (e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            const clickData = { x, y, courtSide: 'top' };

            // Auto-select défenseur hors terrain (clics débordant)
            if (x < 0 || x > 100 || y < 0 || y > 100) {
                this._handleOutOfBoundsClick(e, clickData);
                return;
            }

            this.handleCourtClick(clickData);
        });

        courtBottom.addEventListener('click', (e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            const clickData = { x, y, courtSide: 'bottom' };

            if (x < 0 || x > 100 || y < 0 || y > 100) {
                this._handleOutOfBoundsClick(e, clickData);
                return;
            }

            this.handleCourtClick(clickData);
        });

        // Clic zone service
        serviceZoneTop.addEventListener('click', (e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            this.handleCourtClick({ x, y, courtSide: 'service_top' });
        });

        serviceZoneBottom.addEventListener('click', (e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            this.handleCourtClick({ x, y, courtSide: 'service_bottom' });
        });

        // Clic zone out
        outArea.addEventListener('click', (e) => {
            if (e.target.closest('.court-half') || e.target.closest('.service-zone') ||
                e.target.closest('.net-click-zone')) return;
            const containerRect = document.getElementById('courtContainer').getBoundingClientRect();
            const x = ((e.clientX - containerRect.left) / containerRect.width) * 100;
            const y = ((e.clientY - containerRect.top) / containerRect.height) * 100;
            const clickData = { x, y, courtSide: 'out' };

            // Auto-select défenseur depuis zone out
            if (gameState.phase === 'defense') {
                const np = findNearestDefenseZonePlayer(e);
                if (np) {
                    this.handleButton('selectPlayer', np);
                    return;
                }
            }
            if (gameState.phase === 'attack_net_choice') {
                const np = findNearestDefenseZonePlayer(e);
                if (np) {
                    gameState.context.autoDefender = { player: np };
                }
            }

            this.handleOutAreaClick(clickData);
        });

        // Clic zone filet
        netClickZone.addEventListener('click', (e) => {
            e.stopPropagation();
            const zoneHalf = e.target.closest('.net-zone-half');
            if (zoneHalf && netClickZone.classList.contains('split')) {
                gameState.context.autoBlocker = {
                    player: zoneHalf.dataset.player,
                    role: zoneHalf.dataset.role
                };
            }
            const containerRect = document.getElementById('courtContainer').getBoundingClientRect();
            const netRect = document.getElementById('netZone').getBoundingClientRect();
            const x = ((e.clientX - containerRect.left) / containerRect.width) * 100;
            const y = ((netRect.top + netRect.height / 2 - containerRect.top) / containerRect.height) * 100;
            this.handleNetZoneClick({ x, y, courtSide: 'net' });
        });

        // Clic zones de position (auto-select réceptionneur)
        document.querySelectorAll('.position-zone').forEach(zone => {
            zone.addEventListener('click', (e) => {
                e.stopPropagation();
                const player = e.currentTarget.dataset.player;
                if (!player) return;

                if (gameState.phase === 'ace_reception') {
                    this.handleButton('aceReceptionPlayer', player);
                    return;
                }
                if (gameState.phase === 'reception') {
                    const effective = getEffectivePlayer() || player;
                    this.handleButton('selectPlayer', effective);
                    return;
                }
                if (gameState.phase === 'serve_end') {
                    // Auto-select réceptionneur + enregistrer service
                    const courtHalf = e.currentTarget.closest('.court-half');
                    const rect = courtHalf.getBoundingClientRect();
                    const cx = ((e.clientX - rect.left) / rect.width) * 100;
                    const cy = ((e.clientY - rect.top) / rect.height) * 100;
                    const courtSide = courtHalf.id === 'courtTop' ? 'top' : 'bottom';
                    // Passer les données via un event custom
                    this.handleButton('positionZoneClick', player, { x: cx, y: cy, courtSide });
                    return;
                }
            });
        });

        // Clic zones d'attaque (auto-select attaquant)
        document.querySelectorAll('.attack-zone').forEach(zone => {
            zone.addEventListener('click', (e) => {
                e.stopPropagation();
                const player = e.currentTarget.dataset.player;
                const role = e.currentTarget.dataset.role;
                if (!player) return;

                const courtHalf = e.currentTarget.closest('.court-half');
                const rect = courtHalf.getBoundingClientRect();
                const x = ((e.clientX - rect.left) / rect.width) * 100;
                const y = ((e.clientY - rect.top) / rect.height) * 100;
                const courtSide = courtHalf.id === 'courtTop' ? 'top' : 'bottom';
                const clickData = { x, y, courtSide };

                this.handleButton('attackZoneClick', player, role, clickData);
            });
        });

        // Clic zones de défense (auto-select défenseur)
        document.querySelectorAll('.defense-zones').forEach(container => {
            container.addEventListener('click', (e) => {
                e.stopPropagation();
                if (!container.classList.contains('active')) return;

                const courtHalf = container.closest('.court-half');
                const rect = container.getBoundingClientRect();
                const xPct = ((e.clientX - rect.left) / rect.width) * 100;
                const yPct = ((e.clientY - rect.top) / rect.height) * 100;

                // Point-in-polygon pour trouver la zone cliquée
                let clickedPlayer = null;
                let clickedRole = null;
                const zones = container.querySelectorAll('.defense-zone');
                for (const zone of zones) {
                    if (!zone.dataset.player) continue;
                    const clipPath = getComputedStyle(zone).clipPath;
                    if (!clipPath || clipPath === 'none') continue;
                    const polygon = parseClipPathPolygon(clipPath);
                    if (polygon && pointInPolygon(xPct, yPct, polygon)) {
                        clickedPlayer = zone.dataset.player;
                        clickedRole = zone.dataset.role;
                        break;
                    }
                }

                if (!clickedPlayer) return;

                const courtRect = courtHalf.getBoundingClientRect();
                const cx = ((e.clientX - courtRect.left) / courtRect.width) * 100;
                const cy = ((e.clientY - courtRect.top) / courtRect.height) * 100;
                const courtSide = courtHalf.id === 'courtTop' ? 'top' : 'bottom';
                const defClickData = { x: cx, y: cy, courtSide };

                this.handleButton('defenseZoneClick', clickedPlayer, clickedRole, defClickData);
            });
        });
    },

    /**
     * Gère les clics hors limites (overflow court-half).
     */
    _handleOutOfBoundsClick(event, clickData) {
        const np = findNearestDefenseZonePlayer(event);
        if (gameState.phase === 'attack_net_choice' && np) {
            gameState.context.autoDefender = { player: np };
        } else if (gameState.phase === 'defense' && np) {
            this.handleButton('selectPlayer', np);
            return;
        }
        this.handleCourtClick(clickData);
    },

    /**
     * Point d'entrée : initialise le workflow.
     * Appelé par init() dans match-live.html après le chargement des données.
     */
    start() {
        this.setupListeners();
        gameState.context = this._freshContext();

        if (gameState.currentServer) {
            this.transition('serve_start', { serverContinue: true });
        } else {
            this.transition('server_selection');
        }
    }
};


// ==================== PHASE : server_selection ====================
WorkflowEngine.registerPhase('server_selection', {
    enter(context) {
        hideAllSections();
        highlightCourt(null);

        // Afficher les boutons de sélection du serveur
        const serverTags = document.getElementById('serverTags');
        const serverSelection = document.getElementById('serverSelection');
        serverTags.innerHTML = '';

        const servingTeam = gameState.servingTeam;
        const players = getLineupPlayers(servingTeam);
        const teamClass = servingTeam === 'home' ? 'home' : 'away';

        players.forEach(player => {
            const btn = document.createElement('button');
            btn.className = `player-tag ${teamClass}`;
            btn.textContent = player;
            btn.onclick = () => WorkflowEngine.handleButton('selectServer', player);
            serverTags.appendChild(btn);
        });

        serverSelection.classList.remove('hidden');
        document.getElementById('serverContinue').classList.add('hidden');

        // Afficher boutons sub/end-set entre les points
        const btnSub = document.getElementById('btnSubstitute');
        const btnEnd = document.getElementById('btnEndSet');
        if (btnSub) btnSub.style.display = '';
        if (btnEnd) btnEnd.style.display = '';
    },

    handleButton(action, playerName) {
        if (action === 'selectServer') {
            WorkflowEngine.pushState('select_server');
            gameState.currentServer = playerName;
            gameState.currentAction = {
                type: 'service',
                player: playerName,
                team: gameState.servingTeam,
                role: getPlayerRole(gameState.servingTeam, playerName)
            };
            WorkflowEngine.transition('serve_start');
        }
    },

    reenter() {
        this.enter({});
    }
});


// ==================== PHASE : serve_start ====================
WorkflowEngine.registerPhase('serve_start', {
    enter(context) {
        hideAllSections();

        // Cacher boutons sub/end-set pendant le jeu
        const btnSub = document.getElementById('btnSubstitute');
        const btnEnd = document.getElementById('btnEndSet');
        if (btnSub) btnSub.style.display = 'none';
        if (btnEnd) btnEnd.style.display = 'none';

        if (context.serverContinue) {
            // Même serveur continue — afficher le bandeau
            gameState.currentAction = {
                type: 'service',
                player: gameState.currentServer,
                team: gameState.servingTeam,
                role: getPlayerRole(gameState.servingTeam, gameState.currentServer)
            };
            const banner = document.getElementById('serverContinue');
            const nameSpan = document.getElementById('serverContinueName');
            const bannerEl = document.getElementById('serverContinueBanner');
            nameSpan.textContent = gameState.currentServer;
            bannerEl.className = 'server-continue-banner' +
                (gameState.servingTeam === 'away' ? ' away' : '');
            banner.classList.remove('hidden');
            document.getElementById('serverSelection').classList.add('hidden');

            // Afficher boutons sub/end-set pour "continue" aussi
            if (btnSub) btnSub.style.display = '';
            if (btnEnd) btnEnd.style.display = '';
        }

        // Activer la zone de service
        showServiceZone();
    },

    handleClick(clickData) {
        // Seul un clic dans la zone de service est valide
        const servingCourtSide = getCourtSideForTeam(gameState.servingTeam);
        const expectedServiceSide = 'service_' + (servingCourtSide === 'top' ? 'top' : 'bottom');

        if (clickData.courtSide !== expectedServiceSide &&
            clickData.courtSide !== servingCourtSide) return;

        WorkflowEngine.pushState('serve_start_click');
        gameState.currentAction.startPos = clickData;
        addMarker(clickData, 'service');
        hideServiceZones();

        WorkflowEngine.transition('serve_end');
    },

    reenter() {
        hideAllSections();
        showServiceZone();
        console.log('[DEBUG serve_start.reenter]', {
            phase: gameState.phase,
            currentServer: gameState.currentServer,
            servingTeam: gameState.servingTeam,
            serviceZoneTopActive: document.getElementById('serviceZoneTop').classList.contains('active'),
            serviceZoneBottomActive: document.getElementById('serviceZoneBottom').classList.contains('active')
        });
        const banner = document.getElementById('serverContinue');
        const selection = document.getElementById('serverSelection');
        banner.classList.add('hidden');
        selection.classList.add('hidden');
        // Montrer le bon bandeau
        if (gameState.currentServer) {
            const nameSpan = document.getElementById('serverContinueName');
            const bannerEl = document.getElementById('serverContinueBanner');
            nameSpan.textContent = gameState.currentServer;
            bannerEl.className = 'server-continue-banner' +
                (gameState.servingTeam === 'away' ? ' away' : '');
            banner.classList.remove('hidden');
        }
    }
});


// ==================== PHASE : serve_end ====================
WorkflowEngine.registerPhase('serve_end', {
    enter() {
        hideAllSections();
        const receivingTeam = gameState.servingTeam === 'home' ? 'away' : 'home';
        gameState.attackingTeam = receivingTeam;

        // Afficher les zones de position pour auto-select réceptionneur
        showPositionZones(receivingTeam);
        highlightCourt(receivingTeam);

        // Activer filet (faute filet) et zone out (faute out)
        activateNetZone(false);
        document.getElementById('outArea').classList.add('active');
        const servingCourtSide = getCourtSideForTeam(gameState.servingTeam);
        // Masquer le label OUT du côté serveur
        document.getElementById('outLabelTop').style.display =
            servingCourtSide === 'top' ? 'none' : 'block';
        document.getElementById('outLabelBottom').style.display =
            servingCourtSide === 'bottom' ? 'none' : 'block';
    },

    handleClick(clickData) {
        const receivingTeam = gameState.attackingTeam;
        const receivingCourtSide = getCourtSideForTeam(receivingTeam);

        WorkflowEngine.pushState('serve_end_click');

        if (clickData.courtSide === 'out') {
            // Service out → faute
            gameState.currentAction.endPos = clickData;
            gameState.currentAction.result = 'fault_out';
            addMarker(clickData, 'service');
            if (gameState.currentAction.startPos) {
                drawArrow(gameState.currentAction.startPos, clickData, 'service');
            }
            gameState.rally.push({ ...gameState.currentAction });
            WorkflowEngine.awardPoint(receivingTeam);
            WorkflowEngine.endRally();
            return;
        }

        // Service atterrit sur le bon terrain ?
        if (clickData.courtSide !== receivingCourtSide) {
            // Clic côté serveur = service out
            gameState.currentAction.endPos = clickData;
            gameState.currentAction.result = 'fault_out';
            addMarker(clickData, 'service');
            if (gameState.currentAction.startPos) {
                drawArrow(gameState.currentAction.startPos, clickData, 'service');
            }
            gameState.rally.push({ ...gameState.currentAction });
            WorkflowEngine.awardPoint(receivingTeam);
            WorkflowEngine.endRally();
            return;
        }

        // Service in — enregistrer le point d'arrivée
        gameState.currentAction.endPos = clickData;
        gameState.currentAction.result = 'in';
        addMarker(clickData, 'service');
        if (gameState.currentAction.startPos) {
            drawArrow(gameState.currentAction.startPos, clickData, 'service');
        }

        // Pousser le service dans le rally
        gameState.rally.push({ ...gameState.currentAction });

        // Passer en phase réception
        hidePositionZones();
        deactivateNetZone();
        document.getElementById('outArea').classList.remove('active');

        WorkflowEngine.transition('reception');
    },

    handleNetClick(clickData) {
        // Service dans le filet → faute
        WorkflowEngine.pushState('serve_net');
        gameState.currentAction.endPos = clickData;
        gameState.currentAction.result = 'fault_net';
        addMarker(clickData, 'service');
        if (gameState.currentAction.startPos) {
            drawArrow(gameState.currentAction.startPos, clickData, 'service');
        }
        gameState.rally.push({ ...gameState.currentAction });

        const receivingTeam = gameState.attackingTeam;
        WorkflowEngine.awardPoint(receivingTeam);
        WorkflowEngine.endRally();
    },

    handleOutClick(clickData) {
        // Redirige vers handleClick avec courtSide 'out'
        this.handleClick(clickData);
    },

    handleButton(action, playerName, clickData) {
        if (action === 'positionZoneClick') {
            // Auto-select réceptionneur depuis zone de position
            WorkflowEngine.pushState('serve_end_zone');

            // Enregistrer le service avec le point de la zone comme endPos
            gameState.currentAction.endPos = clickData;
            gameState.currentAction.result = 'in';
            addMarker(clickData, 'service');
            if (gameState.currentAction.startPos) {
                drawArrow(gameState.currentAction.startPos, clickData, 'service');
            }
            gameState.rally.push({ ...gameState.currentAction });

            hidePositionZones();
            deactivateNetZone();
            document.getElementById('outArea').classList.remove('active');

            // Auto-sélectionner le réceptionneur et passer directement à reception_end
            gameState.context.receptionAutoSelected = true;
            const receivingTeam = gameState.attackingTeam;
            gameState.currentAction = {
                type: 'reception',
                player: playerName,
                team: receivingTeam,
                role: getPlayerRole(receivingTeam, playerName)
            };

            WorkflowEngine.transition('reception_end', { autoSelected: true });
        }
    },

    reenter() {
        this.enter();
    }
});


// ==================== PHASE : reception ====================
WorkflowEngine.registerPhase('reception', {
    enter() {
        hideAllSections();
        const receivingTeam = gameState.attackingTeam;

        // Afficher les zones de position pour sélection manuelle
        showPositionZones(receivingTeam);
        highlightCourt(receivingTeam);

        // Tags pour sélection du réceptionneur
        renderOverrideTags({
            team: receivingTeam,
            phaseLabel: 'Réception',
            autoPlayer: null,
            autoRole: null,
            eligiblePlayers: getLineupPlayers(receivingTeam),
            mode: 'select',
            showAceButton: true
        });
    },

    handleButton(action, playerName) {
        if (action === 'selectPlayer') {
            WorkflowEngine.pushState('select_receiver');

            const receivingTeam = gameState.attackingTeam;
            gameState.currentAction = {
                type: 'reception',
                player: playerName,
                team: receivingTeam,
                role: getPlayerRole(receivingTeam, playerName)
            };

            hidePositionZones();
            WorkflowEngine.transition('reception_end');
        }
        if (action === 'ace') {
            WorkflowEngine.pushState('ace_from_reception');
            // Vérifier si un joueur est sélectionné via override
            const effective = getEffectivePlayer();
            if (effective) {
                // Ace avec joueur connu → finaliser directement
                this._finalizeAce(effective);
            } else {
                // Pas de joueur sélectionné → demander qui a raté
                WorkflowEngine.transition('ace_reception');
            }
        }
        if (action === 'receptionFault') {
            const effective = getEffectivePlayer();
            if (effective) {
                WorkflowEngine.pushState('reception_fault_from_tags');
                const receivingTeam = gameState.attackingTeam;
                gameState.currentAction = {
                    type: 'reception',
                    player: effective,
                    team: receivingTeam,
                    role: getPlayerRole(receivingTeam, effective),
                    quality: { score: 0, label: 'Faute' }
                };
                WorkflowEngine.transition('reception_fault_trajectory');
            }
        }
    },

    _finalizeAce(playerName) {
        const receivingTeam = gameState.attackingTeam;
        const servingTeam = gameState.servingTeam;

        // Créer la réception en faute
        gameState.currentAction = {
            type: 'reception',
            player: playerName,
            team: receivingTeam,
            role: getPlayerRole(receivingTeam, playerName),
            quality: { score: 0, label: 'Faute' }
        };
        const serviceAction = gameState.rally.find(a => a.type === 'service');
        if (serviceAction && serviceAction.endPos) {
            gameState.currentAction.endPos = serviceAction.endPos;
        }
        gameState.rally.push({ ...gameState.currentAction });

        // Marquer le service comme ace
        if (serviceAction) {
            serviceAction.result = 'ace';
        }

        WorkflowEngine.awardPoint(servingTeam);
        WorkflowEngine.endRally();
    },

    reenter() {
        this.enter();
    }
});


// ==================== PHASE : ace_reception ====================
WorkflowEngine.registerPhase('ace_reception', {
    enter() {
        hideAllSections();
        const receivingTeam = gameState.attackingTeam;

        showPositionZones(receivingTeam);

        // Tags pour sélectionner qui a raté
        renderOverrideTags({
            team: receivingTeam,
            phaseLabel: 'Ace !',
            autoPlayer: null,
            autoRole: null,
            eligiblePlayers: getLineupPlayers(receivingTeam),
            mode: 'select'
        });
    },

    handleButton(action, playerName) {
        if (action === 'selectPlayer' || action === 'aceReceptionPlayer') {
            WorkflowEngine.pushState('ace_select_player');

            const receivingTeam = gameState.attackingTeam;
            const servingTeam = gameState.servingTeam;

            gameState.currentAction = {
                type: 'reception',
                player: playerName,
                team: receivingTeam,
                role: getPlayerRole(receivingTeam, playerName),
                quality: { score: 0, label: 'Faute' }
            };
            const serviceAction = gameState.rally.find(a => a.type === 'service');
            if (serviceAction && serviceAction.endPos) {
                gameState.currentAction.endPos = serviceAction.endPos;
            }
            gameState.rally.push({ ...gameState.currentAction });

            if (serviceAction) {
                serviceAction.result = 'ace';
            }

            hidePositionZones();
            WorkflowEngine.awardPoint(servingTeam);
            WorkflowEngine.endRally();
        }
    },

    reenter() {
        this.enter();
    }
});


// ==================== PHASE : reception_end ====================
WorkflowEngine.registerPhase('reception_end', {
    enter(context) {
        hideAllSections();
        const receivingTeam = gameState.attackingTeam;

        // Afficher zones de qualité de réception
        showReceptionQualityZones();
        highlightCourt(receivingTeam);

        // Tags avec le réceptionneur auto-sélectionné
        renderOverrideTags({
            team: receivingTeam,
            phaseLabel: 'Réception',
            autoPlayer: gameState.currentAction.player,
            autoRole: gameState.currentAction.role,
            eligiblePlayers: getLineupPlayers(receivingTeam),
            mode: 'override'
        });

        // Boutons Ace et Faute réception
        document.getElementById('receptionFaultSection').classList.remove('hidden');

        // Activer out et filet
        document.getElementById('outArea').classList.add('active');
        activateNetZone(true);

        const courtSide = getCourtSideForTeam(receivingTeam);
        document.getElementById('outLabelTop').style.display =
            courtSide === 'top' ? 'none' : 'block';
        document.getElementById('outLabelBottom').style.display =
            courtSide === 'bottom' ? 'none' : 'block';
    },

    handleClick(clickData) {
        WorkflowEngine.pushState('reception_end_click');

        const receivingTeam = gameState.attackingTeam;
        const receivingCourtSide = getCourtSideForTeam(receivingTeam);
        const oppositeCourtSide = receivingCourtSide === 'top' ? 'bottom' : 'top';
        const effectivePlayer = getEffectivePlayer() || gameState.currentAction.player;

        // Mettre à jour le joueur si override
        if (effectivePlayer !== gameState.currentAction.player) {
            gameState.currentAction.player = effectivePlayer;
            gameState.currentAction.role = getPlayerRole(receivingTeam, effectivePlayer);
        }

        // startPos = arrivée du service
        const serviceAction = gameState.rally.find(a => a.type === 'service');
        if (serviceAction && serviceAction.endPos) {
            gameState.currentAction.startPos = serviceAction.endPos;
        }

        if (clickData.courtSide === oppositeCourtSide) {
            // Réception va chez l'adversaire → retour direct
            gameState.currentAction.quality = { score: 1, label: 'Négative' };
            gameState.currentAction.isDirectReturn = true;
            gameState.currentAction.directReturnEndPos = clickData;
            gameState.currentAction.endPos = serviceAction ? serviceAction.endPos : null;

            addMarker(clickData, 'reception');
            if (serviceAction && serviceAction.endPos) {
                drawArrow(serviceAction.endPos, clickData, 'reception');
            }

            gameState.rally.push({ ...gameState.currentAction });

            // Sauvegarder le clic pour les choix
            gameState.context.receptionOpponentClickData = clickData;

            hideReceptionQualityZones();
            deactivateNetZone();
            document.getElementById('outArea').classList.remove('active');

            WorkflowEngine.transition('reception_opponent_choice');
            return;
        }

        if (clickData.courtSide === 'out') {
            // Réception hors terrain → R1 (Négative)
            gameState.currentAction.quality = { score: 1, label: 'Négative' };
            gameState.currentAction.endPos = clickData;
            addMarker(clickData, 'reception');
            if (serviceAction && serviceAction.endPos) {
                drawArrow(serviceAction.endPos, clickData, 'reception');
            }
            gameState.rally.push({ ...gameState.currentAction });

            hideReceptionQualityZones();
            deactivateNetZone();
            document.getElementById('outArea').classList.remove('active');

            WorkflowEngine.transition('pass');
            return;
        }

        // Réception normale sur son propre terrain
        gameState.currentAction.quality = calculateReceptionQuality(clickData);
        gameState.currentAction.endPos = clickData;
        addMarker(clickData, 'reception');
        if (serviceAction && serviceAction.endPos) {
            drawArrow(serviceAction.endPos, clickData, 'reception');
        }
        gameState.rally.push({ ...gameState.currentAction });

        hideReceptionQualityZones();
        deactivateNetZone();
        document.getElementById('outArea').classList.remove('active');

        WorkflowEngine.transition('pass');
    },

    handleNetClick(clickData) {
        // Réception dans le filet
        WorkflowEngine.pushState('reception_net');

        const effectivePlayer = getEffectivePlayer() || gameState.currentAction.player;
        const receivingTeam = gameState.attackingTeam;
        if (effectivePlayer !== gameState.currentAction.player) {
            gameState.currentAction.player = effectivePlayer;
            gameState.currentAction.role = getPlayerRole(receivingTeam, effectivePlayer);
        }

        gameState.currentAction.quality = { score: 0, label: 'Filet' };
        const serviceAction = gameState.rally.find(a => a.type === 'service');
        if (serviceAction && serviceAction.endPos) {
            gameState.currentAction.endPos = serviceAction.endPos;
        }
        gameState.currentAction.netPos = clickData;
        addMarker(clickData, 'reception');
        gameState.rally.push({ ...gameState.currentAction });

        hideReceptionQualityZones();
        deactivateNetZone();
        document.getElementById('outArea').classList.remove('active');

        gameState.context.netBlockPos = clickData;
        WorkflowEngine.transition('reception_net_choice');
    },

    handleOutClick(clickData) {
        this.handleClick(clickData);
    },

    handleButton(action, ...args) {
        if (action === 'ace') {
            WorkflowEngine.pushState('ace_from_reception_end');
            const effective = getEffectivePlayer() || gameState.currentAction.player;
            // Finaliser l'ace
            const receivingTeam = gameState.attackingTeam;
            const servingTeam = gameState.servingTeam;

            gameState.currentAction.quality = { score: 0, label: 'Faute' };
            const serviceAction = gameState.rally.find(a => a.type === 'service');
            if (serviceAction && serviceAction.endPos) {
                gameState.currentAction.endPos = serviceAction.endPos;
            }
            gameState.rally.push({ ...gameState.currentAction });
            if (serviceAction) serviceAction.result = 'ace';

            hideReceptionQualityZones();
            WorkflowEngine.awardPoint(servingTeam);
            WorkflowEngine.endRally();
        }
        if (action === 'receptionFault') {
            WorkflowEngine.pushState('reception_fault');
            const effective = getEffectivePlayer() || gameState.currentAction.player;
            const receivingTeam = gameState.attackingTeam;

            gameState.currentAction.player = effective;
            gameState.currentAction.role = getPlayerRole(receivingTeam, effective);
            gameState.currentAction.quality = { score: 0, label: 'Faute' };

            hideReceptionQualityZones();
            deactivateNetZone();
            document.getElementById('outArea').classList.remove('active');

            WorkflowEngine.transition('reception_fault_trajectory');
        }
    },

    reenter() {
        this.enter({});
    }
});


// ==================== PHASE : reception_fault_trajectory ====================
WorkflowEngine.registerPhase('reception_fault_trajectory', {
    enter() {
        hideAllSections();
        highlightCourt(null);
        document.getElementById('receptionFaultTrajectory').classList.remove('hidden');
        document.getElementById('outArea').classList.add('active');
        document.getElementById('outLabelTop').style.display = 'block';
        document.getElementById('outLabelBottom').style.display = 'block';
    },

    handleClick(clickData) {
        WorkflowEngine.pushState('reception_fault_traj_click');
        gameState.currentAction.faultTrajectory = clickData;
        addMarker(clickData, 'reception');
        this._finalize();
    },

    handleOutClick(clickData) {
        this.handleClick(clickData);
    },

    handleButton(action) {
        if (action === 'skip') {
            WorkflowEngine.pushState('reception_fault_skip');
            this._finalize();
        }
    },

    _finalize() {
        const serviceAction = gameState.rally.find(a => a.type === 'service');
        if (serviceAction && serviceAction.endPos) {
            gameState.currentAction.endPos = serviceAction.endPos;
        }
        gameState.rally.push({ ...gameState.currentAction });

        // Marquer le service comme ace
        if (serviceAction) serviceAction.result = 'ace';

        const servingTeam = gameState.servingTeam;
        WorkflowEngine.awardPoint(servingTeam);
        WorkflowEngine.endRally();
    },

    reenter() {
        this.enter();
    }
});


// ==================== PHASE : reception_opponent_choice ====================
WorkflowEngine.registerPhase('reception_opponent_choice', {
    enter() {
        hideAllSections();
        document.getElementById('receptionOpponentChoice').classList.remove('hidden');
    },

    handleButton(action) {
        WorkflowEngine.pushState('opponent_choice_' + action);

        if (action === 'winner') {
            // Retour gagnant = R1 + point direct
            const lastRec = gameState.rally[gameState.rally.length - 1];
            if (lastRec) lastRec.isDirectReturnWinner = true;
            WorkflowEngine.awardPoint(gameState.attackingTeam);
            WorkflowEngine.endRally();
        }
        else if (action === 'direct_attack') {
            // Attaque directe = R1 + l'adversaire attaque
            const servingTeam = gameState.servingTeam;
            gameState.attackingTeam = servingTeam;
            gameState.context.source = 'reception_direct_return';
            WorkflowEngine.transition('attack_player', { directAttack: true });
        }
        else if (action === 'defense') {
            // Défendu = R1 + l'adversaire défend
            const servingTeam = gameState.servingTeam;
            gameState.attackingTeam = servingTeam;
            highlightCourt(servingTeam);
            WorkflowEngine.transition('defense', { attackerRole: null });
        }
    },

    reenter() {
        this.enter();
    }
});


// ==================== PHASE : reception_net_choice ====================
WorkflowEngine.registerPhase('reception_net_choice', {
    enter() {
        hideAllSections();
        document.getElementById('receptionNetChoice').classList.remove('hidden');
    },

    handleClick(clickData) {
        // Court click = block auto
        WorkflowEngine.pushState('reception_net_court_click');
        gameState.context.pendingBlockEnd = clickData;
        addMarker(clickData, 'block-touch');
        gameState.context.blockMarkerDrawn = true;
        this._triggerBlock();
    },

    handleButton(action) {
        if (action === 'direct_attack') {
            WorkflowEngine.pushState('reception_net_direct_attack');
            const servingTeam = gameState.servingTeam;
            gameState.attackingTeam = servingTeam;
            gameState.context.source = 'reception_net';
            WorkflowEngine.transition('attack_player', { directAttack: true });
        }
        if (action === 'block') {
            WorkflowEngine.pushState('reception_net_block');
            this._triggerBlock();
        }
    },

    _triggerBlock() {
        const blockingTeam = gameState.servingTeam;
        gameState.context.source = 'reception_net';

        // Auto-blocker ?
        if (gameState.context.autoBlocker && gameState.context.autoBlocker.player) {
            const blocker = gameState.context.autoBlocker;
            gameState.currentAction = {
                type: 'block',
                player: blocker.player,
                team: blockingTeam,
                role: blocker.role || getPlayerRole(blockingTeam, blocker.player)
            };
            if (gameState.context.pendingBlockEnd) {
                WorkflowEngine.transition('net_block_end', { blockingTeam });
            } else {
                WorkflowEngine.transition('net_block_end', { blockingTeam });
            }
        } else {
            WorkflowEngine.transition('net_block_player', { blockingTeam });
        }
    },

    reenter() {
        this.enter();
    }
});


// ==================== PHASE : net_block_player (unifié) ====================
WorkflowEngine.registerPhase('net_block_player', {
    enter(context) {
        hideAllSections();
        const blockingTeam = context.blockingTeam || gameState.context.blockingTeam;
        gameState.context.blockingTeam = blockingTeam;

        renderOverrideTags({
            team: blockingTeam,
            phaseLabel: 'Block au filet',
            autoPlayer: null,
            autoRole: null,
            eligiblePlayers: getLineupPlayers(blockingTeam),
            mode: 'select'
        });
    },

    handleButton(action, playerName) {
        if (action === 'selectPlayer') {
            WorkflowEngine.pushState('net_block_select');
            const blockingTeam = gameState.context.blockingTeam;

            // Cas bloc out : push le block avec result 'bloc_out' et aller en trajectoire
            if (gameState.context.blocOutPending) {
                gameState.context.blocOutPending = false;
                gameState.rally.push({
                    type: 'block',
                    player: playerName,
                    team: blockingTeam,
                    role: getPlayerRole(blockingTeam, playerName),
                    result: 'bloc_out'
                });
                gameState.context.blocOutAttackingTeam = gameState.attackingTeam;
                WorkflowEngine.transition('bloc_out_trajectory');
                return;
            }

            gameState.currentAction = {
                type: 'block',
                player: playerName,
                team: blockingTeam,
                role: getPlayerRole(blockingTeam, playerName)
            };
            WorkflowEngine.transition('net_block_end', { blockingTeam });
        }
    },

    reenter() {
        this.enter({ blockingTeam: gameState.context.blockingTeam });
    }
});


// ==================== PHASE : net_block_end (unifié) ====================
WorkflowEngine.registerPhase('net_block_end', {
    enter(context) {
        hideAllSections();
        const blockingTeam = context.blockingTeam || gameState.context.blockingTeam;
        gameState.context.blockingTeam = blockingTeam;

        highlightCourt(null);
        document.getElementById('outArea').classList.add('active');
        document.getElementById('outLabelTop').style.display = 'block';
        document.getElementById('outLabelBottom').style.display = 'block';

        renderOverrideTags({
            team: blockingTeam,
            phaseLabel: 'Block au filet',
            autoPlayer: gameState.currentAction.player,
            autoRole: gameState.currentAction.role,
            eligiblePlayers: getLineupPlayers(blockingTeam),
            mode: 'override'
        });

        // Si on a un pendingBlockEnd (clic court pendant net_choice), aller directement
        if (gameState.context.pendingBlockEnd) {
            this.handleClick(gameState.context.pendingBlockEnd);
        }
    },

    handleClick(clickData) {
        WorkflowEngine.pushState('net_block_end_click');

        const blockingTeam = gameState.context.blockingTeam;
        const blockingCourtSide = getCourtSideForTeam(blockingTeam);
        const otherTeam = blockingTeam === 'home' ? 'away' : 'home';

        gameState.currentAction.endPos = clickData;

        // Dessiner les flèches block (rose = block-touch)
        const netPos = gameState.context.netBlockPos;
        if (netPos) {
            const netCentered = getNetCenteredPos(netPos);
            if (!gameState.context.blockMarkerDrawn) {
                addMarker(clickData, 'block-touch');
            }
            drawArrow(netCentered, clickData, 'block-touch');
        }

        gameState.rally.push({ ...gameState.currentAction });
        gameState.context.pendingBlockEnd = null;

        // Déterminer qui défend après le block
        if (clickData.courtSide === blockingCourtSide || clickData.courtSide === 'out') {
            // Block revient chez le bloqueur
            gameState.attackingTeam = blockingTeam;
        } else {
            // Block va chez l'adversaire
            gameState.attackingTeam = otherTeam;
        }

        document.getElementById('outArea').classList.remove('active');
        WorkflowEngine.transition('defense', {
            attackerRole: null,
            showDirectAttack: true
        });
    },

    handleOutClick(clickData) {
        this.handleClick(clickData);
    },

    reenter() {
        // Ne PAS appeler enter() car il auto-exécute handleClick si pendingBlockEnd existe
        // → reenter doit juste reconstruire l'UI sans déclencher de logique
        hideAllSections();
        const blockingTeam = gameState.context.blockingTeam;

        highlightCourt(null);
        document.getElementById('outArea').classList.add('active');
        document.getElementById('outLabelTop').style.display = 'block';
        document.getElementById('outLabelBottom').style.display = 'block';

        renderOverrideTags({
            team: blockingTeam,
            phaseLabel: 'Block au filet',
            autoPlayer: gameState.currentAction.player,
            autoRole: gameState.currentAction.role,
            eligiblePlayers: getLineupPlayers(blockingTeam),
            mode: 'override'
        });
    }
});


// ==================== HELPER : startPos depuis la dernière action ====================
function _getStartPosFromLastAction() {
    if (gameState.rally.length === 0) return null;
    const last = gameState.rally[gameState.rally.length - 1];
    if (last.isDirectReturn && last.directReturnEndPos) return last.directReturnEndPos;
    return last.endPos || null;
}

function _drawArrowFromPrev(toPos, arrowType) {
    if (gameState.rally.length === 0) return;
    const prev = gameState.rally[gameState.rally.length - 1];
    if (prev.isDirectReturn && prev.directReturnEndPos) {
        drawArrow(prev.directReturnEndPos, toPos, arrowType);
    } else if (prev.endPos) {
        drawArrow(prev.endPos, toPos, arrowType);
    }
}


// ==================== PHASE : pass ====================
WorkflowEngine.registerPhase('pass', {
    enter() {
        hideAllSections();
        const team = gameState.attackingTeam;

        highlightCourt(null);
        document.getElementById('outArea').classList.add('active');
        document.getElementById('outLabelTop').style.display = 'block';
        document.getElementById('outLabelBottom').style.display = 'block';
        activateNetZone(true);

        // Auto-select : Pointu si le Passeur est le dernier toucheur, sinon Passeur
        const passeur = getPlayerByRole(team, 'Passeur');
        const lastToucher = getLastTouchPlayer(team);
        let autoPlayer, autoRole;
        if (passeur && passeur === lastToucher) {
            const pointu = getPlayerByRole(team, 'Pointu');
            autoPlayer = pointu || null;
            autoRole = pointu ? 'Pointu' : null;
        } else {
            autoPlayer = passeur || null;
            autoRole = passeur ? 'Passeur' : null;
        }

        showAttackZones(team);

        renderOverrideTags({
            team,
            phaseLabel: 'Passe',
            autoPlayer,
            autoRole,
            eligiblePlayers: getLineupPlayers(team),
            mode: autoPlayer ? 'override' : 'select'
        });

        // Options 2ème touche
        document.getElementById('secondTouchOptions').classList.remove('hidden');
    },

    handleClick(clickData) {
        const team = gameState.attackingTeam;
        const passeur = getPlayerByRole(team, 'Passeur');
        const effectiveOverride = getEffectivePlayer();
        const selectedPasser = effectiveOverride || passeur;
        if (!selectedPasser) return;
        const selectedRole = getPlayerRole(team, selectedPasser);

        const passingCourtSide = getCourtSideForTeam(team);
        const oppositeCourtSide = passingCourtSide === 'top' ? 'bottom' : 'top';
        WorkflowEngine.pushState('pass_click');

        // Créer l'action passe
        gameState.currentAction = {
            type: 'pass',
            player: selectedPasser,
            team: team,
            role: selectedRole,
            endPos: clickData
        };
        // V20.0b : propager le flag relance passe
        if (gameState.context.passRelance) {
            gameState.currentAction.passType = 'relance';
            gameState.context.passRelance = false;
        }
        gameState.currentAction.startPos = _getStartPosFromLastAction();

        addMarker(clickData, 'pass');
        _drawArrowFromPrev(clickData, 'pass');

        if (clickData.courtSide === oppositeCourtSide) {
            // Passe chez l'adversaire → retour direct
            gameState.currentAction.isDirectReturn = true;
            gameState.currentAction.directReturnEndPos = clickData;
            gameState.rally.push({ ...gameState.currentAction });

            hideAttackZones();
            document.getElementById('outArea').classList.remove('active');
            deactivateNetZone();

            WorkflowEngine.transition('pass_direct_return_choice');
            return;
        }

        // Passe normale (y compris out = balle récupérable) — auto-sélection attaquant
        const autoAttacker = getAttackerFromClickX(clickData, selectedPasser);
        gameState.context.passAutoSelected = true;
        gameState.context.attackAutoSelected = !!autoAttacker;
        gameState.rally.push({ ...gameState.currentAction });
        hideAttackZones();
        deactivateNetZone();
        document.getElementById('outArea').classList.remove('active');

        if (autoAttacker) {
            WorkflowEngine.transition('attack_type', {
                attacker: autoAttacker,
                fromAutoSelect: true
            });
        } else {
            WorkflowEngine.transition('attack_player');
        }
    },

    handleNetClick(clickData) {
        WorkflowEngine.pushState('pass_net');
        // Passe dans le filet
        const team = gameState.attackingTeam;
        const passeur = getPlayerByRole(team, 'Passeur');
        const effectiveOverride = getEffectivePlayer();
        const selectedPasser = effectiveOverride || passeur;

        gameState.currentAction = {
            type: 'pass',
            player: selectedPasser,
            team: team,
            role: getPlayerRole(team, selectedPasser),
            endPos: clickData,
            netPos: clickData
        };
        gameState.currentAction.startPos = _getStartPosFromLastAction();
        addMarker(clickData, 'pass');
        gameState.rally.push({ ...gameState.currentAction });

        hideAttackZones();
        deactivateNetZone();
        document.getElementById('outArea').classList.remove('active');

        gameState.context.netBlockPos = clickData;
        WorkflowEngine.transition('pass_net_choice');
    },

    handleOutClick(clickData) {
        this.handleClick(clickData);
    },

    handleButton(action, ...args) {
        if (action === 'selectPlayer') {
            // Manuel : sélection du passeur via tag → passer à pass_end
            const playerName = args[0];
            WorkflowEngine.pushState('select_passer');

            gameState.currentAction = {
                type: 'pass',
                player: playerName,
                team: gameState.attackingTeam,
                role: getPlayerRole(gameState.attackingTeam, playerName)
            };
            gameState.context.passAutoSelected = false;

            WorkflowEngine.transition('pass_end', { passer: playerName });
        }
        if (action === 'secondTouch') {
            const type = args[0]; // 'deuxieme_main', 'attaque_directe', or 'relance'

            // V20.0b : Relance passe — le passeur fait un geste de survie dans son terrain
            // On reste en phase pass avec un flag, le clic terrain créera une pass avec passType: 'relance'
            if (type === 'relance') {
                WorkflowEngine.pushState('pass_relance');
                gameState.context.passRelance = true;
                // Cacher les options 2ème touche (le joueur va cliquer le terrain)
                document.getElementById('secondTouchOptions').classList.add('hidden');
                return;
            }

            const player = getEffectivePlayer();
            if (!player) return;

            WorkflowEngine.pushState('second_touch_' + type);

            const team = gameState.attackingTeam;
            const role = getPlayerRole(team, player);

            gameState.currentAction = {
                type: 'attack',
                player: player,
                team: team,
                attackType: type,
                role: role
            };

            // V19.3 : si la dernière action du rally est une défense, la transformer en passe
            // (le défenseur a fait office de passeur en envoyant directement)
            const lastRallyAction = gameState.rally[gameState.rally.length - 1];
            if (lastRallyAction && lastRallyAction.type === 'defense') {
                lastRallyAction.type = 'pass';
                delete lastRallyAction.defenseQuality;
                delete lastRallyAction.isDirectReturn;
                delete lastRallyAction.isDirectReturnWinner;
                delete lastRallyAction.directReturnEndPos;
            }

            WorkflowEngine.transition('attack_end', { fromSecondTouch: true });
        }
        // V19.3 : Faute de passe → phase trajectoire (comme defense_fault_trajectory)
        if (action === 'passFault') {
            const player = getEffectivePlayer();
            if (!player) return;

            WorkflowEngine.pushState('pass_fault');

            const team = gameState.attackingTeam;
            const role = getPlayerRole(team, player);

            gameState.currentAction = {
                type: 'pass',
                player: player,
                team: team,
                role: role
            };
            gameState.currentAction.startPos = _getStartPosFromLastAction();

            WorkflowEngine.transition('pass_fault_trajectory');
        }
        if (action === 'attackZoneClick') {
            // Clic zone d'attaque en phase pass = auto-passe + auto-attaquant
            const attackerPlayer = args[0];
            const attackerRole = args[1];
            const clickData = args[2];

            WorkflowEngine.pushState('pass_attack_zone');

            const team = gameState.attackingTeam;
            const passeur = getPlayerByRole(team, 'Passeur');
            const effectiveOverride = getEffectivePlayer();
            const selectedPasser = effectiveOverride || passeur;

            // Créer l'action passe
            gameState.currentAction = {
                type: 'pass',
                player: selectedPasser,
                team: team,
                role: getPlayerRole(team, selectedPasser),
                endPos: clickData
            };
            gameState.currentAction.startPos = _getStartPosFromLastAction();
            addMarker(clickData, 'pass');
            _drawArrowFromPrev(clickData, 'pass');
            gameState.rally.push({ ...gameState.currentAction });

            hideAttackZones();
            deactivateNetZone();
            document.getElementById('outArea').classList.remove('active');

            // Sélectionner l'attaquant directement
            WorkflowEngine.transition('attack_type', {
                attacker: attackerPlayer,
                fromAutoSelect: true
            });
        }
    },

    reenter() {
        this.enter();
    }
});


// ==================== PHASE : pass_end ====================
WorkflowEngine.registerPhase('pass_end', {
    enter(context) {
        hideAllSections();
        const team = gameState.attackingTeam;
        const passer = context.passer || gameState.currentAction.player;

        renderOverrideTags({
            team,
            phaseLabel: 'Passe',
            autoPlayer: passer,
            autoRole: gameState.currentAction.role,
            eligiblePlayers: getLineupPlayers(team),
            mode: 'override'
        });

        highlightCourt(null);
        document.getElementById('outArea').classList.add('active');
        document.getElementById('outLabelTop').style.display = 'block';
        document.getElementById('outLabelBottom').style.display = 'block';
        activateNetZone(true);
        showAttackZones(team, passer);
    },

    handleClick(clickData) {
        WorkflowEngine.pushState('pass_end_click');

        const team = gameState.attackingTeam;
        gameState.currentAction.endPos = clickData;
        // V20.0b : propager le flag relance passe
        if (gameState.context.passRelance) {
            gameState.currentAction.passType = 'relance';
            gameState.context.passRelance = false;
        }
        gameState.currentAction.startPos = _getStartPosFromLastAction();
        addMarker(clickData, 'pass');
        _drawArrowFromPrev(clickData, 'pass');

        deactivateNetZone();
        document.getElementById('outArea').classList.remove('active');

        const passingCourtSide = getCourtSideForTeam(team);
        const oppositeCourtSide = passingCourtSide === 'top' ? 'bottom' : 'top';

        if (clickData.courtSide === oppositeCourtSide) {
            // Passe chez l'adversaire → retour direct
            gameState.currentAction.isDirectReturn = true;
            gameState.currentAction.directReturnEndPos = clickData;
            gameState.rally.push({ ...gameState.currentAction });
            hideAttackZones();
            WorkflowEngine.transition('pass_direct_return_choice');
            return;
        }

        // Passe normale (y compris out = balle récupérable)
        const passer = gameState.currentAction.player;
        gameState.rally.push({ ...gameState.currentAction });
        hideAttackZones();

        const autoAttacker = getAttackerFromClickX(clickData, passer);
        if (autoAttacker && autoAttacker !== passer) {
            gameState.context.attackAutoSelected = true;
            WorkflowEngine.transition('attack_type', {
                attacker: autoAttacker,
                fromAutoSelect: true
            });
        } else {
            gameState.context.attackAutoSelected = false;
            WorkflowEngine.transition('attack_player');
        }
    },

    handleNetClick(clickData) {
        WorkflowEngine.pushState('pass_end_net');

        gameState.currentAction.endPos = clickData;
        gameState.currentAction.netPos = clickData;
        gameState.currentAction.startPos = _getStartPosFromLastAction();
        addMarker(clickData, 'pass');
        gameState.rally.push({ ...gameState.currentAction });

        hideAttackZones();
        deactivateNetZone();
        document.getElementById('outArea').classList.remove('active');

        gameState.context.netBlockPos = clickData;
        WorkflowEngine.transition('pass_net_choice');
    },

    handleOutClick(clickData) {
        this.handleClick(clickData);
    },

    handleButton(action, ...args) {
        if (action === 'attackZoneClick') {
            const attackerPlayer = args[0];
            const attackerRole = args[1];
            const clickData = args[2];

            WorkflowEngine.pushState('pass_end_attack_zone');

            gameState.currentAction.endPos = clickData;
            gameState.currentAction.startPos = _getStartPosFromLastAction();
            addMarker(clickData, 'pass');
            _drawArrowFromPrev(clickData, 'pass');
            gameState.rally.push({ ...gameState.currentAction });

            hideAttackZones();
            deactivateNetZone();
            document.getElementById('outArea').classList.remove('active');

            WorkflowEngine.transition('attack_type', {
                attacker: attackerPlayer,
                fromAutoSelect: true
            });
        }
    },

    reenter() {
        this.enter({ passer: gameState.currentAction.player });
    }
});


// ==================== PHASE : pass_direct_return_choice ====================
WorkflowEngine.registerPhase('pass_direct_return_choice', {
    enter() {
        hideAllSections();
        document.getElementById('passDirectReturnChoice').classList.remove('hidden');
    },

    handleButton(action) {
        WorkflowEngine.pushState('pass_dr_choice_' + action);

        if (action === 'winner') {
            // Point direct pour l'équipe qui passe
            WorkflowEngine.awardPoint(gameState.attackingTeam);
            WorkflowEngine.endRally();
        }
        else if (action === 'direct_attack') {
            // L'adversaire attaque directement
            const otherTeam = gameState.attackingTeam === 'home' ? 'away' : 'home';
            gameState.attackingTeam = otherTeam;
            gameState.context.source = 'pass_direct_return';
            WorkflowEngine.transition('attack_player', { directAttack: true });
        }
        else if (action === 'defense') {
            // L'adversaire défend
            const otherTeam = gameState.attackingTeam === 'home' ? 'away' : 'home';
            gameState.attackingTeam = otherTeam;
            WorkflowEngine.transition('defense', { attackerRole: null });
        }
    },

    reenter() {
        this.enter();
    }
});


// ==================== PHASE : pass_net_choice ====================
WorkflowEngine.registerPhase('pass_net_choice', {
    enter() {
        hideAllSections();
        document.getElementById('passNetChoice').classList.remove('hidden');
    },

    handleClick(clickData) {
        // Court click = block auto
        WorkflowEngine.pushState('pass_net_court_click');
        gameState.context.pendingBlockEnd = clickData;
        addMarker(clickData, 'block-touch');
        gameState.context.blockMarkerDrawn = true;
        this._triggerBlock();
    },

    handleButton(action) {
        if (action === 'direct_attack') {
            WorkflowEngine.pushState('pass_net_direct_attack');
            const otherTeam = gameState.attackingTeam === 'home' ? 'away' : 'home';
            gameState.attackingTeam = otherTeam;
            gameState.context.source = 'pass_net';
            WorkflowEngine.transition('attack_player', { directAttack: true });
        }
        if (action === 'block') {
            WorkflowEngine.pushState('pass_net_block');
            this._triggerBlock();
        }
    },

    _triggerBlock() {
        const blockingTeam = gameState.attackingTeam === 'home' ? 'away' : 'home';
        gameState.context.source = 'pass_net';

        if (gameState.context.autoBlocker && gameState.context.autoBlocker.player) {
            const blocker = gameState.context.autoBlocker;
            gameState.currentAction = {
                type: 'block',
                player: blocker.player,
                team: blockingTeam,
                role: blocker.role || getPlayerRole(blockingTeam, blocker.player)
            };
            WorkflowEngine.transition('net_block_end', { blockingTeam });
        } else {
            WorkflowEngine.transition('net_block_player', { blockingTeam });
        }
    },

    reenter() {
        this.enter();
    }
});


// ==================== PHASE : attack_player ====================
WorkflowEngine.registerPhase('attack_player', {
    enter(context) {
        hideAllSections();
        const team = gameState.attackingTeam;

        if (context.directAttack || gameState.context.source) {
            // Attaque directe (depuis retour direct ou filet) : pas de zones, mode select
            renderOverrideTags({
                team,
                phaseLabel: 'Attaque',
                autoPlayer: null,
                autoRole: null,
                eligiblePlayers: getLineupPlayers(team),
                mode: 'select'
            });
        } else {
            // Normal : zones d'attaque
            const lastToucher = getLastTouchPlayer(team);
            showAttackZones(team, lastToucher);
            renderOverrideTags({
                team,
                phaseLabel: 'Attaque',
                autoPlayer: null,
                autoRole: null,
                eligiblePlayers: getLineupPlayers(team),
                mode: 'override'
            });
        }
    },

    handleButton(action, ...args) {
        if (action === 'selectPlayer') {
            const playerName = args[0];
            WorkflowEngine.pushState('select_attacker');
            hideAttackZones();
            WorkflowEngine.transition('attack_type', { attacker: playerName });
        }
        if (action === 'attackZoneClick') {
            const attackerPlayer = args[0];
            WorkflowEngine.pushState('attack_zone_select');
            const effectiveAttacker = getEffectivePlayer() || attackerPlayer;
            hideAttackZones();
            WorkflowEngine.transition('attack_type', { attacker: effectiveAttacker });
        }
    },

    reenter() {
        this.enter({
            directAttack: !!gameState.context.source
        });
    }
});


// ==================== PHASE : attack_type ====================
WorkflowEngine.registerPhase('attack_type', {
    enter(context) {
        hideAllSections();
        const team = gameState.attackingTeam;
        const attacker = context.attacker || gameState.currentAction.player;
        const attackerRole = getPlayerRole(team, attacker);

        gameState.currentAction = {
            type: 'attack',
            player: attacker,
            team: team,
            role: attackerRole
        };

        // Flag pour attaques directes
        if (gameState.context.source) {
            gameState.currentAction.isDirectAttack = true;
            gameState.currentAction.directAttackSource = gameState.context.source;
        }

        // Afficher type d'attaque (Feinte / Relance)
        document.getElementById('attackTypeSelection').classList.remove('hidden');

        renderOverrideTags({
            team,
            phaseLabel: 'Attaque',
            autoPlayer: attacker,
            autoRole: attackerRole,
            eligiblePlayers: getLineupPlayers(team),
            mode: 'override'
        });

        // Terrain adverse actif avec zones de défense
        const defendingTeam = team === 'home' ? 'away' : 'home';
        highlightCourt(defendingTeam);
        document.getElementById('outArea').classList.add('active');
        activateNetZone(true);
        const defendingCourtSide = getCourtSideForTeam(defendingTeam);
        document.getElementById('outLabelTop').style.display = defendingCourtSide === 'top' ? 'block' : 'none';
        document.getElementById('outLabelBottom').style.display = defendingCourtSide === 'bottom' ? 'block' : 'none';
        if (attackerRole) {
            showDefenseZones(defendingTeam, attackerRole);
        }
    },

    handleClick(clickData) {
        // Clic direct sur le terrain = smash (auto-set attackType)
        WorkflowEngine.pushState('attack_type_smash_click');
        gameState.currentAction.attackType = 'smash';
        this._handleAttackLanding(clickData);
    },

    handleNetClick(clickData) {
        WorkflowEngine.pushState('attack_type_net');
        gameState.currentAction.attackType = gameState.currentAction.attackType || 'smash';
        gameState.currentAction.endPos = clickData;
        gameState.currentAction.startPos = _getStartPosFromLastAction();
        // Pas de result ici — le choix se fait dans attack_net_choice

        hideDefenseZones();
        deactivateNetZone();

        const arrowType = getAttackArrowType(gameState.currentAction.attackType);
        addMarker(clickData, arrowType);
        _drawArrowFromPrev(clickData, arrowType);

        gameState.rally.push({ ...gameState.currentAction });
        gameState.context.netBlockPos = clickData;

        WorkflowEngine.transition('attack_net_choice');
    },

    handleOutClick(clickData) {
        // Out pendant attack_type = smash out
        WorkflowEngine.pushState('attack_type_out');
        gameState.currentAction.attackType = 'smash';
        this._handleAttackLanding(clickData);
    },

    handleButton(action, ...args) {
        if (action === 'selectAttackType') {
            const type = args[0]; // 'feinte' or 'relance'
            WorkflowEngine.pushState('attack_type_' + type);
            gameState.currentAction.attackType = type;

            WorkflowEngine.transition('attack_end');
        }
        if (action === 'defenseZoneClick') {
            // Clic zone de défense en phase attack_type = smash + auto-défenseur
            const defenderPlayer = args[0];
            const defenderRole = args[1];
            const defClickData = args[2];

            WorkflowEngine.pushState('attack_type_def_zone');
            gameState.currentAction.attackType = 'smash';
            gameState.context.autoDefender = { player: defenderPlayer, role: defenderRole };
            this._handleAttackLanding(defClickData);
        }
        if (action === 'attackZoneClick') {
            // Ignore en attack_type (attaquant déjà sélectionné)
        }
    },

    _handleAttackLanding(clickData) {
        hideDefenseZones();
        deactivateNetZone();

        gameState.currentAction.endPos = clickData;
        gameState.currentAction.startPos = _getStartPosFromLastAction();

        const arrowType = getAttackArrowType(gameState.currentAction.attackType);
        addMarker(clickData, arrowType);
        _drawArrowFromPrev(clickData, arrowType);

        const defendingTeam = gameState.attackingTeam === 'home' ? 'away' : 'home';
        const expectedCourtSide = getCourtSideForTeam(defendingTeam);

        if (clickData.courtSide !== expectedCourtSide) {
            // Attaque out
            gameState.currentAction.result = 'out';
            gameState.rally.push({ ...gameState.currentAction });
            WorkflowEngine.awardPoint(defendingTeam);
            WorkflowEngine.endRally();
        } else {
            // Attaque dans le terrain → phase résultat
            gameState.rally.push({ ...gameState.currentAction });
            WorkflowEngine.transition('result');
        }
    },

    reenter() {
        const attacker = gameState.currentAction.player;
        this.enter({ attacker });
    }
});


// ==================== PHASE : attack_end ====================
WorkflowEngine.registerPhase('attack_end', {
    enter(context) {
        hideAllSections();
        const team = gameState.attackingTeam;
        const attacker = gameState.currentAction.player;
        const attackerRole = gameState.currentAction.role;

        renderOverrideTags({
            team,
            phaseLabel: 'Attaque',
            autoPlayer: attacker,
            autoRole: attackerRole,
            eligiblePlayers: getLineupPlayers(team),
            mode: 'override'
        });

        const defendingTeam = team === 'home' ? 'away' : 'home';
        highlightCourt(defendingTeam);
        document.getElementById('outArea').classList.add('active');
        activateNetZone(true);
        const defendingCourtSide = getCourtSideForTeam(defendingTeam);
        document.getElementById('outLabelTop').style.display = defendingCourtSide === 'top' ? 'block' : 'none';
        document.getElementById('outLabelBottom').style.display = defendingCourtSide === 'bottom' ? 'block' : 'none';
        if (attackerRole) {
            showDefenseZones(defendingTeam, attackerRole);
        }
    },

    handleClick(clickData) {
        WorkflowEngine.pushState('attack_end_click');

        hideDefenseZones();
        deactivateNetZone();

        gameState.currentAction.endPos = clickData;
        gameState.currentAction.startPos = _getStartPosFromLastAction();

        const arrowType = getAttackArrowType(gameState.currentAction.attackType);
        addMarker(clickData, arrowType);
        _drawArrowFromPrev(clickData, arrowType);

        const defendingTeam = gameState.attackingTeam === 'home' ? 'away' : 'home';
        const expectedCourtSide = getCourtSideForTeam(defendingTeam);

        if (clickData.courtSide !== expectedCourtSide) {
            // Out
            gameState.currentAction.result = 'out';
            gameState.rally.push({ ...gameState.currentAction });
            WorkflowEngine.awardPoint(defendingTeam);
            WorkflowEngine.endRally();
        } else {
            gameState.rally.push({ ...gameState.currentAction });
            WorkflowEngine.transition('result');
        }
    },

    handleNetClick(clickData) {
        WorkflowEngine.pushState('attack_end_net');

        hideDefenseZones();
        deactivateNetZone();

        gameState.currentAction.endPos = clickData;
        gameState.currentAction.startPos = _getStartPosFromLastAction();

        const arrowType = getAttackArrowType(gameState.currentAction.attackType);
        addMarker(clickData, arrowType);
        _drawArrowFromPrev(clickData, arrowType);

        gameState.rally.push({ ...gameState.currentAction });
        gameState.context.netBlockPos = clickData;

        WorkflowEngine.transition('attack_net_choice');
    },

    handleOutClick(clickData) {
        this.handleClick(clickData);
    },

    handleButton(action, ...args) {
        if (action === 'defenseZoneClick') {
            // Clic zone de défense pendant attack_end → enregistrer le défenseur auto + traiter l'attaque
            const defenderPlayer = args[0];
            const defenderRole = args[1];
            const defClickData = args[2];

            gameState.context.autoDefender = { player: defenderPlayer, role: defenderRole };
            this.handleClick(defClickData);
        }
    },

    reenter() {
        this.enter({});
    }
});


// ==================== PHASE : attack_net_choice ====================
// L'attaque touche le filet. On ne sait pas encore si c'est faute, block, ou si ça passe.
// On affiche : zones de défense auto-select + boutons Faute/Bloc out + override tags bloqueur.
// Clic zone défense = l'attaque passe → défense. Clic terrain attaquant = block retourné.
WorkflowEngine.registerPhase('attack_net_choice', {
    enter() {
        hideAllSections();
        // Afficher les boutons Faute filet / Bloc out
        document.getElementById('attackNetChoice').classList.remove('hidden');

        const defendingTeam = gameState.attackingTeam === 'home' ? 'away' : 'home';

        // Zones de défense auto-select (comme attack_end)
        const lastAttack = [...gameState.rally].reverse().find(a => a.type === 'attack');
        const attackerRole = lastAttack ? lastAttack.role : null;
        if (attackerRole) {
            showDefenseZones(defendingTeam, attackerRole);
        }

        // Highlight le terrain défenseur + out + filet inactif
        highlightCourt(defendingTeam);
        document.getElementById('outArea').classList.add('active');
        const defCourtSide = getCourtSideForTeam(defendingTeam);
        document.getElementById('outLabelTop').style.display = defCourtSide === 'top' ? 'block' : 'none';
        document.getElementById('outLabelBottom').style.display = defCourtSide === 'bottom' ? 'block' : 'none';

        // Override tags pour le bloqueur (équipe défensive)
        const autoBlocker = gameState.context.autoBlocker;
        const blockerPlayer = autoBlocker ? autoBlocker.player : null;
        const blockerRole = blockerPlayer ? (autoBlocker.role || getPlayerRole(defendingTeam, blockerPlayer)) : null;

        renderOverrideTags({
            team: defendingTeam,
            phaseLabel: 'Attaque filet',
            autoPlayer: blockerPlayer,
            autoRole: blockerRole,
            eligiblePlayers: getLineupPlayers(defendingTeam),
            mode: 'override'
        });
    },

    handleClick(clickData) {
        // Clic terrain pendant attack_net_choice
        const defendingTeam = gameState.attackingTeam === 'home' ? 'away' : 'home';
        const defendingCourtSide = getCourtSideForTeam(defendingTeam);
        const attackingCourtSide = getCourtSideForTeam(gameState.attackingTeam);

        if (clickData.courtSide === attackingCourtSide) {
            // Clic côté attaquant = la balle revient côté attaquant = block retourné
            WorkflowEngine.pushState('attack_net_block_click');

            const lastAttack = [...gameState.rally].reverse().find(a => a.type === 'attack');
            if (lastAttack) lastAttack.result = 'defended';

            hideDefenseZones();
            document.getElementById('outArea').classList.remove('active');

            gameState.context.pendingBlockEnd = clickData;
            addMarker(clickData, 'block-touch');
            gameState.context.blockMarkerDrawn = true;

            const blockingTeam = defendingTeam;

            if (gameState.context.autoBlocker && gameState.context.autoBlocker.player) {
                const blocker = gameState.context.autoBlocker;
                gameState.currentAction = {
                    type: 'block',
                    player: blocker.player,
                    team: blockingTeam,
                    role: blocker.role || getPlayerRole(blockingTeam, blocker.player)
                };
                WorkflowEngine.transition('net_block_end', { blockingTeam });
            } else {
                WorkflowEngine.transition('net_block_player', { blockingTeam });
            }
        } else if (clickData.courtSide === defendingCourtSide) {
            // Clic côté défenseur = l'attaque passe le filet → transition vers result
            WorkflowEngine.pushState('attack_net_pass_through');

            const lastAttack = [...gameState.rally].reverse().find(a => a.type === 'attack');
            if (lastAttack && !lastAttack.result) lastAttack.result = 'defended';

            hideDefenseZones();
            document.getElementById('outArea').classList.remove('active');

            gameState.context.pendingDefenseClick = clickData;
            WorkflowEngine.transition('result');
        }
    },

    handleOutClick(clickData) {
        // Out = l'attaque passe le filet mais atterrit out → faute attaque
        WorkflowEngine.pushState('attack_net_out');

        const lastAttack = [...gameState.rally].reverse().find(a => a.type === 'attack');
        if (lastAttack) lastAttack.result = 'out';

        hideDefenseZones();
        document.getElementById('outArea').classList.remove('active');

        const defendingTeam = gameState.attackingTeam === 'home' ? 'away' : 'home';
        WorkflowEngine.awardPoint(defendingTeam);
        WorkflowEngine.endRally();
    },

    handleButton(action, ...args) {
        if (action === 'faute') {
            WorkflowEngine.pushState('attack_net_faute');
            const lastAttack = [...gameState.rally].reverse().find(a => a.type === 'attack');
            if (lastAttack) lastAttack.result = 'fault_net';

            hideDefenseZones();
            document.getElementById('outArea').classList.remove('active');

            const defendingTeam = gameState.attackingTeam === 'home' ? 'away' : 'home';
            WorkflowEngine.awardPoint(defendingTeam);
            WorkflowEngine.endRally();
        }
        if (action === 'bloc_out') {
            WorkflowEngine.pushState('attack_net_bloc_out');
            const lastAttack = [...gameState.rally].reverse().find(a => a.type === 'attack');
            if (lastAttack) lastAttack.result = 'bloc_out';

            hideDefenseZones();
            document.getElementById('outArea').classList.remove('active');

            const blockingTeam = gameState.attackingTeam === 'home' ? 'away' : 'home';

            if (gameState.context.autoBlocker && gameState.context.autoBlocker.player) {
                const blocker = gameState.context.autoBlocker;
                gameState.rally.push({
                    type: 'block',
                    player: blocker.player,
                    team: blockingTeam,
                    role: blocker.role || getPlayerRole(blockingTeam, blocker.player),
                    result: 'bloc_out'
                });
                gameState.context.blocOutAttackingTeam = gameState.attackingTeam;
                WorkflowEngine.transition('bloc_out_trajectory');
            } else {
                gameState.context.blocOutPending = true;
                gameState.context.blocOutBlockingTeam = blockingTeam;
                WorkflowEngine.transition('net_block_player', {
                    blockingTeam,
                    isBlocOut: true
                });
            }
        }
        if (action === 'defenseZoneClick') {
            // Clic zone de défense = l'attaque passe le filet → auto-défenseur → defense_end
            const defenderPlayer = args[0];
            const defenderRole = args[1];
            const defClickData = args[2];

            WorkflowEngine.pushState('attack_net_def_zone');

            const lastAttack = [...gameState.rally].reverse().find(a => a.type === 'attack');
            if (lastAttack && !lastAttack.result) lastAttack.result = 'defended';

            // Dessiner la flèche filet → zone de défense (rose = touché par le filet/bloc)
            if (defClickData) {
                addMarker(defClickData, 'block-touch');
                _drawArrowFromPrev(defClickData, 'block-touch');
            }

            hideDefenseZones();
            hideDefenseQualityZones();
            document.getElementById('outArea').classList.remove('active');

            const newAttackingTeam = gameState.attackingTeam === 'home' ? 'away' : 'home';
            gameState.attackingTeam = newAttackingTeam;
            gameState.context.autoDefender = null;

            gameState.currentAction = {
                type: 'defense',
                player: defenderPlayer,
                team: newAttackingTeam,
                role: getPlayerRole(newAttackingTeam, defenderPlayer),
                startPos: defClickData,  // Position du clic zone auto-select = point d'arrivée de la balle
                incomingArrowType: 'block-touch'  // Flèche rose = balle passée par le filet/bloc
            };
            WorkflowEngine.transition('defense_end');
        }
    },

    reenter() {
        this.enter();
    }
});


// ==================== PHASE : block_end (standard, from result 'blocked') ====================
WorkflowEngine.registerPhase('block_end', {
    enter(context) {
        hideAllSections();
        // Le block est sur le terrain de l'attaquant
        highlightCourt(gameState.attackingTeam);
        document.getElementById('outArea').classList.add('active');
        document.getElementById('outLabelTop').style.display = 'block';
        document.getElementById('outLabelBottom').style.display = 'block';
    },

    handleClick(clickData) {
        WorkflowEngine.pushState('block_end_click');

        gameState.currentAction.endPos = clickData;
        addMarker(clickData, 'block-touch');

        // 2 flèches : attaque → filet + filet → landing
        const lastAttack = [...gameState.rally].reverse().find(a => a.type === 'attack');
        if (lastAttack && lastAttack.endPos) {
            const netPos = getNetCenteredPos(lastAttack.endPos);
            drawArrow(lastAttack.endPos, netPos, getAttackArrowType(lastAttack.attackType));
            drawArrow(netPos, clickData, 'block-touch');
        }

        gameState.rally.push({ ...gameState.currentAction });

        document.getElementById('outArea').classList.remove('active');
        // Passer à la défense — pas de zones auto (bloc dévié = imprévisible)
        WorkflowEngine.transition('defense', {
            attackerRole: null,
            showDirectAttack: true
        });
    },

    handleOutClick(clickData) {
        this.handleClick(clickData);
    },

    reenter() {
        this.enter({});
    }
});


// ==================== PHASE : bloc_out_trajectory ====================
WorkflowEngine.registerPhase('bloc_out_trajectory', {
    enter() {
        hideAllSections();
        document.getElementById('blocOutTrajectory').classList.remove('hidden');

        // Tags avec le bloqueur sélectionné
        const lastBlock = [...gameState.rally].reverse().find(a => a.type === 'block');
        if (lastBlock && lastBlock.player) {
            renderOverrideTags({
                team: lastBlock.team,
                phaseLabel: 'Bloc out',
                autoPlayer: lastBlock.player,
                autoRole: lastBlock.role,
                eligiblePlayers: getLineupPlayers(lastBlock.team),
                mode: 'override'
            });
        }

        document.getElementById('outArea').classList.add('active');
        document.getElementById('outLabelTop').style.display = 'block';
        document.getElementById('outLabelBottom').style.display = 'block';
        highlightCourt(null);
    },

    handleClick(clickData) {
        WorkflowEngine.pushState('bloc_out_traj_click');

        const lastBlock = [...gameState.rally].reverse().find(a => a.type === 'block');
        if (lastBlock) {
            lastBlock.endPos = clickData;
            const lastAttack = [...gameState.rally].reverse().find(a => a.type === 'attack');
            if (lastAttack && lastAttack.endPos) {
                const netPos = getNetCenteredPos(lastAttack.endPos);
                lastBlock.startPos = netPos;
                drawArrow(lastAttack.endPos, netPos, getAttackArrowType(lastAttack.attackType));
                drawArrow(netPos, clickData, 'block-touch');
            }
        }
        addMarker(clickData, 'block-touch');

        document.getElementById('outArea').classList.remove('active');

        const pointWinner = gameState.context.blocOutAttackingTeam || gameState.attackingTeam;
        gameState.context.blocOutAttackingTeam = null;
        WorkflowEngine.awardPoint(pointWinner);
        WorkflowEngine.endRally();
    },

    handleOutClick(clickData) {
        this.handleClick(clickData);
    },

    handleButton(action) {
        if (action === 'skip') {
            WorkflowEngine.pushState('bloc_out_skip');
            document.getElementById('outArea').classList.remove('active');
            const pointWinner = gameState.context.blocOutAttackingTeam || gameState.attackingTeam;
            gameState.context.blocOutAttackingTeam = null;
            WorkflowEngine.awardPoint(pointWinner);
            WorkflowEngine.endRally();
        }
    },

    reenter() {
        this.enter();
    }
});


// ==================== PHASE : defense ====================
WorkflowEngine.registerPhase('defense', {
    enter(context) {
        hideAllSections();
        const team = gameState.attackingTeam;
        const attackerRole = context.attackerRole !== undefined ? context.attackerRole : null;
        const showDirectAttack = context.showDirectAttack || false;

        highlightCourt(team);
        document.getElementById('outArea').classList.add('active');
        const courtSide = getCourtSideForTeam(team);
        document.getElementById('outLabelTop').style.display = courtSide === 'top' ? 'block' : 'none';
        document.getElementById('outLabelBottom').style.display = courtSide === 'bottom' ? 'block' : 'none';

        // Stocker le contexte pour reenter
        gameState.context.defenseAttackerRole = attackerRole;
        gameState.context.showDirectAttack = showDirectAttack;

        if (attackerRole) {
            // Avec zones de défense : auto-select au clic zone
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
            // Sans zones (après block, retour direct...) : sélection pure par tags
            renderOverrideTags({
                team,
                phaseLabel: 'Défense',
                autoPlayer: null,
                autoRole: null,
                eligiblePlayers: getLineupPlayers(team),
                mode: 'select'
            });
        }

        // Boutons conditionnels (après block)
        if (showDirectAttack) {
            document.getElementById('defenseDirectAttackSection').classList.remove('hidden');
            // Bouton Bloc Kill = la balle touche le sol sans défense → point
            document.getElementById('blockKillBtn').classList.remove('hidden');
        }
    },

    handleButton(action, ...args) {
        if (action === 'selectPlayer') {
            const playerName = args[0];
            WorkflowEngine.pushState('select_defender');
            this._selectDefender(playerName);
        }
        if (action === 'defenseZoneClick') {
            const defenderPlayer = args[0];
            const defenderRole = args[1];
            const defClickData = args[2];

            WorkflowEngine.pushState('defense_zone_select');
            // Auto-sélection par zone de défense
            hideDefenseZones();
            gameState.context.pendingDefenseClick = defClickData;
            this._selectDefender(defenderPlayer);
        }
        if (action === 'directAttack') {
            WorkflowEngine.pushState('defense_direct_attack');
            hideDefenseZones();
            gameState.context.source = 'defense_direct_attack';
            WorkflowEngine.transition('attack_player', { directAttack: true });
        }
        if (action === 'blockKill') {
            // Bloc Kill : la balle touche le sol → B+ pour le bloqueur, point pour l'équipe du bloqueur
            WorkflowEngine.pushState('block_kill');

            const lastBlock = [...gameState.rally].reverse().find(a => a.type === 'block');
            if (lastBlock) lastBlock.result = 'kill';

            // L'équipe du bloqueur marque le point (= l'autre équipe par rapport à l'attaquant actuel)
            // attackingTeam = équipe qui défend (dont le terrain est ciblé), le bloqueur est de l'autre côté
            const blockingTeam = lastBlock ? lastBlock.team : (gameState.attackingTeam === 'home' ? 'away' : 'home');
            gameState.currentAction = {};
            WorkflowEngine.awardPoint(blockingTeam);
            WorkflowEngine.endRally();
        }
    },

    _selectDefender(playerName) {
        hideDefenseZones();
        hideAttackZones();

        gameState.currentAction = {
            type: 'defense',
            player: playerName,
            team: gameState.attackingTeam,
            role: getPlayerRole(gameState.attackingTeam, playerName)
        };

        // Si faute défense en raccourci (from result 'defense_fault')
        if (gameState.context.defenseFaultShortcut) {
            gameState.context.defenseFaultShortcut = false;
            gameState.currentAction.result = 'fault';
            WorkflowEngine.transition('defense_fault_trajectory');
            return;
        }

        // Si position D+/D- déjà connue (pendingDefenseClick from result court click or zone click)
        if (gameState.context.pendingDefenseClick) {
            const pendingClick = gameState.context.pendingDefenseClick;
            gameState.context.pendingDefenseClick = null;
            this._completeDefense(playerName, pendingClick);
            return;
        }

        // Normal : transition vers defense_end pour qualité D+/D-
        WorkflowEngine.transition('defense_end');
    },

    _completeDefense(defenderName, clickData) {
        // Défense complète en 1 étape (défenseur + position connus)
        gameState.currentAction.player = defenderName;
        gameState.currentAction.role = getPlayerRole(gameState.attackingTeam, defenderName);

        const defendingTeam = gameState.attackingTeam;
        const defendingCourtSide = getCourtSideForTeam(defendingTeam);
        const oppositeCourtSide = defendingCourtSide === 'top' ? 'bottom' : 'top';

        if (clickData.courtSide === oppositeCourtSide) {
            // Retour direct de défense
            gameState.currentAction.isDirectReturn = true;
            gameState.currentAction.directReturnEndPos = clickData;
            gameState.currentAction.defenseQuality = 'negative';

            const startPos = _getStartPosFromLastAction();
            gameState.currentAction.endPos = startPos;
            gameState.currentAction.startPos = startPos;

            if (startPos) addMarker(startPos, 'defense');
            addMarker(clickData, 'defense');
            if (startPos) drawArrow(startPos, clickData, 'defense');

            gameState.rally.push({ ...gameState.currentAction });
            WorkflowEngine.transition('defense_direct_return_choice');
            return;
        }

        // D+/D-
        if (clickData.courtSide === 'out') {
            gameState.currentAction.defenseQuality = 'negative';
        } else {
            gameState.currentAction.defenseQuality = calculateDefenseQuality(clickData);
        }

        gameState.currentAction.endPos = clickData;
        gameState.currentAction.startPos = _getStartPosFromLastAction();
        addMarker(clickData, 'defense');

        const prev = gameState.rally[gameState.rally.length - 1];
        if (prev && prev.endPos) {
            drawArrow(prev.endPos, clickData, 'defense');
        } else if (prev && prev.isDirectReturn && prev.directReturnEndPos) {
            drawArrow(prev.directReturnEndPos, clickData, 'defense');
        }

        gameState.rally.push({ ...gameState.currentAction });

        // Passer à la passe
        WorkflowEngine.transition('pass');
    },

    reenter() {
        this.enter({
            attackerRole: gameState.context.defenseAttackerRole,
            showDirectAttack: gameState.context.showDirectAttack
        });
    }
});


// ==================== PHASE : defense_end ====================
WorkflowEngine.registerPhase('defense_end', {
    enter() {
        hideAllSections();
        const team = gameState.attackingTeam;
        const player = gameState.currentAction.player;
        const role = gameState.currentAction.role;

        renderOverrideTags({
            team,
            phaseLabel: 'Défense',
            autoPlayer: player,
            autoRole: role,
            eligiblePlayers: getLineupPlayers(team),
            mode: 'override'
        });

        document.getElementById('defenseFaultSection').classList.remove('hidden');
        showDefenseQualityZones();
        highlightCourt(team);

        document.getElementById('outArea').classList.add('active');
        const defendingCourtSide = getCourtSideForTeam(team);
        document.getElementById('outLabelTop').style.display = defendingCourtSide === 'top' ? 'block' : 'none';
        document.getElementById('outLabelBottom').style.display = defendingCourtSide === 'bottom' ? 'block' : 'none';
    },

    handleClick(clickData) {
        WorkflowEngine.pushState('defense_end_click');

        document.getElementById('outArea').classList.remove('active');
        hideDefenseQualityZones();

        const effectivePlayer = getEffectivePlayer() || gameState.currentAction.player;
        if (effectivePlayer !== gameState.currentAction.player) {
            gameState.currentAction.player = effectivePlayer;
            gameState.currentAction.role = getPlayerRole(gameState.attackingTeam, effectivePlayer);
        }

        const defendingTeam = gameState.attackingTeam;
        const defendingCourtSide = getCourtSideForTeam(defendingTeam);
        const oppositeCourtSide = defendingCourtSide === 'top' ? 'bottom' : 'top';

        if (clickData.courtSide === oppositeCourtSide) {
            // Retour direct de défense
            gameState.currentAction.isDirectReturn = true;
            gameState.currentAction.directReturnEndPos = clickData;

            // Utiliser startPos pré-défini (defenseZoneClick) ou fallback sur dernière action
            const startPos = gameState.currentAction.startPos || _getStartPosFromLastAction();
            gameState.currentAction.endPos = startPos;
            gameState.currentAction.startPos = startPos;

            if (startPos) addMarker(startPos, 'defense');
            addMarker(clickData, 'defense');
            if (startPos) drawArrow(startPos, clickData, 'defense');

            gameState.rally.push({ ...gameState.currentAction });
            WorkflowEngine.transition('defense_direct_return_choice');
            return;
        }

        // D+/D- normal
        if (clickData.courtSide === 'out') {
            gameState.currentAction.defenseQuality = 'negative';
        } else {
            gameState.currentAction.defenseQuality = calculateDefenseQuality(clickData);
        }

        gameState.currentAction.endPos = clickData;
        // Ne pas écraser startPos si déjà défini (ex: defenseZoneClick auto-select)
        if (!gameState.currentAction.startPos) {
            gameState.currentAction.startPos = _getStartPosFromLastAction();
        }
        addMarker(clickData, 'defense');
        // Flèche depuis la position de défense (startPos) vers le point de chute
        if (gameState.currentAction.startPos) {
            drawArrow(gameState.currentAction.startPos, clickData, 'defense');
        } else {
            _drawArrowFromPrev(clickData, 'defense');
        }

        gameState.rally.push({ ...gameState.currentAction });

        // Passer à la passe
        document.getElementById('outArea').classList.remove('active');
        WorkflowEngine.transition('pass');
    },

    handleOutClick(clickData) {
        this.handleClick(clickData);
    },

    handleButton(action) {
        if (action === 'defenseFault') {
            WorkflowEngine.pushState('defense_fault_btn');
            hideDefenseQualityZones();

            const effectivePlayer = getEffectivePlayer() || gameState.currentAction.player;
            gameState.currentAction.player = effectivePlayer;
            gameState.currentAction.role = getPlayerRole(gameState.attackingTeam, effectivePlayer);
            gameState.currentAction.result = 'fault';

            WorkflowEngine.transition('defense_fault_trajectory');
        }
        if (action === 'defensePoint') {
            WorkflowEngine.pushState('defense_point_btn');
            hideDefenseQualityZones();

            // L'attaque a traversé et touché le sol — point pour l'attaquant
            const attackingTeam = gameState.attackingTeam === 'home' ? 'away' : 'home';

            const lastAttack = [...gameState.rally].reverse().find(a => a.type === 'attack');
            if (lastAttack) lastAttack.result = 'point';

            gameState.currentAction = {};
            WorkflowEngine.awardPoint(attackingTeam);
            WorkflowEngine.endRally();
        }
    },

    reenter() {
        this.enter();
    }
});


// ==================== PHASE : defense_fault_trajectory ====================
WorkflowEngine.registerPhase('defense_fault_trajectory', {
    enter() {
        hideAllSections();
        document.getElementById('defenseFaultTrajectory').classList.remove('hidden');
        document.getElementById('outArea').classList.add('active');
        document.getElementById('outLabelTop').style.display = 'block';
        document.getElementById('outLabelBottom').style.display = 'block';
        highlightCourt(null);
    },

    handleClick(clickData) {
        WorkflowEngine.pushState('def_fault_traj_click');
        gameState.currentAction.faultTrajectory = clickData;

        // Flèche de trajectoire
        const prev = gameState.rally[gameState.rally.length - 1];
        if (prev && prev.isDirectReturn && prev.directReturnEndPos) {
            drawArrow(prev.directReturnEndPos, clickData, 'defense');
            addMarker(prev.directReturnEndPos, 'defense');
        } else if (prev && prev.endPos) {
            drawArrow(prev.endPos, clickData, 'defense');
            addMarker(prev.endPos, 'defense');
        }
        addMarker(clickData, 'defense');

        this._finalize();
    },

    handleOutClick(clickData) {
        this.handleClick(clickData);
    },

    handleButton(action) {
        if (action === 'skip') {
            WorkflowEngine.pushState('def_fault_skip');
            this._finalize();
        }
    },

    _finalize() {
        document.getElementById('outArea').classList.remove('active');

        const defendingTeam = gameState.attackingTeam;
        const scoringTeam = defendingTeam === 'home' ? 'away' : 'home';

        gameState.currentAction.endPos = gameState.currentAction.faultTrajectory || null;
        gameState.currentAction.startPos = _getStartPosFromLastAction();
        gameState.rally.push({ ...gameState.currentAction });

        WorkflowEngine.awardPoint(scoringTeam);
        WorkflowEngine.endRally();
    },

    reenter() {
        this.enter();
    }
});


// ==================== PHASE : pass_fault_trajectory (V19.3) ====================
WorkflowEngine.registerPhase('pass_fault_trajectory', {
    enter() {
        hideAllSections();
        document.getElementById('passFaultTrajectory').classList.remove('hidden');
        document.getElementById('outArea').classList.add('active');
        document.getElementById('outLabelTop').style.display = 'block';
        document.getElementById('outLabelBottom').style.display = 'block';
        highlightCourt(null);
    },

    handleClick(clickData) {
        WorkflowEngine.pushState('pass_fault_traj_click');
        gameState.currentAction.faultTrajectory = clickData;

        // Flèche de trajectoire depuis la dernière action
        if (gameState.currentAction.startPos) {
            drawArrow(gameState.currentAction.startPos, clickData, 'pass');
            addMarker(gameState.currentAction.startPos, 'pass');
        }
        addMarker(clickData, 'pass');

        this._finalize();
    },

    handleOutClick(clickData) {
        this.handleClick(clickData);
    },

    handleButton(action) {
        if (action === 'skip') {
            WorkflowEngine.pushState('pass_fault_skip');
            this._finalize();
        }
    },

    _finalize() {
        document.getElementById('outArea').classList.remove('active');

        const team = gameState.attackingTeam;
        const oppositeTeam = team === 'home' ? 'away' : 'home';

        gameState.currentAction.endPos = gameState.currentAction.faultTrajectory || null;
        gameState.rally.push({ ...gameState.currentAction });

        WorkflowEngine.awardPoint(oppositeTeam);
        WorkflowEngine.endRally();
    },

    reenter() {
        this.enter();
    }
});


// ==================== PHASE : defense_direct_return_choice ====================
WorkflowEngine.registerPhase('defense_direct_return_choice', {
    enter() {
        hideAllSections();
        document.getElementById('defenseDirectReturnChoice').classList.remove('hidden');
    },

    handleButton(action) {
        WorkflowEngine.pushState('def_dr_choice_' + action);

        if (action === 'winner') {
            // Retour gagnant = D- + point
            const lastDef = gameState.rally[gameState.rally.length - 1];
            if (lastDef) {
                lastDef.isDirectReturnWinner = true;
                lastDef.defenseQuality = 'negative';
            }
            WorkflowEngine.awardPoint(gameState.attackingTeam);
            WorkflowEngine.endRally();
        }
        else if (action === 'direct_attack') {
            // D- + l'adversaire attaque directement
            const lastDef = gameState.rally[gameState.rally.length - 1];
            if (lastDef) lastDef.defenseQuality = 'negative';

            const otherTeam = gameState.attackingTeam === 'home' ? 'away' : 'home';
            gameState.attackingTeam = otherTeam;
            gameState.context.source = 'defense_direct_return';
            WorkflowEngine.transition('attack_player', { directAttack: true });
        }
        else if (action === 'defense') {
            // D- + l'adversaire défend
            const lastDef = gameState.rally[gameState.rally.length - 1];
            if (lastDef) lastDef.defenseQuality = 'negative';

            const otherTeam = gameState.attackingTeam === 'home' ? 'away' : 'home';
            gameState.attackingTeam = otherTeam;
            WorkflowEngine.transition('defense', { attackerRole: null });
        }
    },

    reenter() {
        this.enter();
    }
});


// ==================== PHASE : result ====================
WorkflowEngine.registerPhase('result', {
    enter() {
        hideAllSections();
        document.getElementById('resultSelection').classList.remove('hidden');

        const defendingTeam = gameState.attackingTeam === 'home' ? 'away' : 'home';

        // Zone out active pour les défenses hors terrain
        document.getElementById('outArea').classList.add('active');
        const defCourtSide = getCourtSideForTeam(defendingTeam);
        document.getElementById('outLabelTop').style.display = defCourtSide === 'top' ? 'block' : 'none';
        document.getElementById('outLabelBottom').style.display = defCourtSide === 'bottom' ? 'block' : 'none';

        // Zones D+ pour qualifier la défense au clic
        hideDefenseZones();
        showDefenseQualityZones(defendingTeam);

        // Tags override pour le défenseur
        const autoDefender = gameState.context.autoDefender;
        const defAutoPlayer = autoDefender ? autoDefender.player : null;
        const defAutoRole = defAutoPlayer ? (autoDefender.role || getPlayerRole(defendingTeam, defAutoPlayer)) : null;

        renderOverrideTags({
            team: defendingTeam,
            phaseLabel: 'Résultat',
            autoPlayer: defAutoPlayer,
            autoRole: defAutoRole,
            eligiblePlayers: getLineupPlayers(defendingTeam),
            mode: 'override'
        });
    },

    handleClick(clickData) {
        // Clic terrain en phase result = auto "Défendu"
        WorkflowEngine.pushState('result_court_click');
        gameState.context.pendingDefenseClick = clickData;
        hideDefenseQualityZones();
        this._selectResult('defended');
    },

    handleOutClick(clickData) {
        this.handleClick(clickData);
    },

    handleButton(action, ...args) {
        if (action === 'point') {
            WorkflowEngine.pushState('result_point');
            this._selectResult('point');
        }
        if (action === 'defenseFault') {
            WorkflowEngine.pushState('result_defense_fault');
            this._selectResult('defense_fault');
        }
        if (action === 'blocked') {
            WorkflowEngine.pushState('result_blocked');
            this._selectResult('blocked');
        }
        if (action === 'defenseZoneClick') {
            // Clic zone de défense en phase result = Défendu + auto-défenseur
            const defenderPlayer = args[0];
            const defenderRole = args[1];
            const defClickData = args[2];

            WorkflowEngine.pushState('result_def_zone');

            const lastAction = gameState.rally[gameState.rally.length - 1];
            if (lastAction) lastAction.result = 'defended';

            // Dessiner la flèche attaque → zone de défense
            if (defClickData) {
                addMarker(defClickData, 'defense');
                _drawArrowFromPrev(defClickData, getAttackArrowType(lastAction ? lastAction.attackType : 'smash'));
            }

            hideDefenseZones();
            hideDefenseQualityZones();
            document.getElementById('outArea').classList.remove('active');

            const newAttackingTeam = gameState.attackingTeam === 'home' ? 'away' : 'home';
            gameState.attackingTeam = newAttackingTeam;
            gameState.context.autoDefender = null;

            // Sélectionner le défenseur → affiche zone D+
            const incomingType = lastAction ? getAttackArrowType(lastAction.attackType) : 'attack';
            gameState.currentAction = {
                type: 'defense',
                player: defenderPlayer,
                team: newAttackingTeam,
                role: getPlayerRole(newAttackingTeam, defenderPlayer),
                startPos: defClickData,  // Position du clic zone auto-select = point d'arrivée de la balle
                incomingArrowType: incomingType  // Type flèche attaque → zone défense
            };
            WorkflowEngine.transition('defense_end');
        }
    },

    _selectResult(result) {
        const lastAction = gameState.rally[gameState.rally.length - 1];
        if (lastAction && result !== 'defended') {
            lastAction.result = result;
        }

        hideDefenseZones();
        hideDefenseQualityZones();
        document.getElementById('outArea').classList.remove('active');

        if (result === 'point') {
            gameState.context.autoDefender = null;
            WorkflowEngine.awardPoint(gameState.attackingTeam);
            WorkflowEngine.endRally();
        }
        else if (result === 'defended') {
            if (lastAction) lastAction.result = 'defended';

            const attackerRole = lastAction ? lastAction.role : null;
            const newAttackingTeam = gameState.attackingTeam === 'home' ? 'away' : 'home';
            gameState.attackingTeam = newAttackingTeam;

            const pendingClick = gameState.context.pendingDefenseClick;
            gameState.context.pendingDefenseClick = null;
            const autoDefender = gameState.context.autoDefender;
            gameState.context.autoDefender = null;

            if (pendingClick && autoDefender && autoDefender.player) {
                // Position + défenseur connus → défense complète en 1 étape
                const effectiveDefender = getEffectivePlayer() || autoDefender.player;
                gameState.currentAction = {
                    type: 'defense',
                    player: effectiveDefender,
                    team: newAttackingTeam,
                    role: getPlayerRole(newAttackingTeam, effectiveDefender)
                };
                // Compléter via la logique de defense._completeDefense
                const defPhase = WorkflowEngine.phases['defense'];
                defPhase._completeDefense.call(defPhase, effectiveDefender, pendingClick);
            } else if (pendingClick) {
                // Position connue mais pas de défenseur
                gameState.context.pendingDefenseClick = pendingClick;
                WorkflowEngine.transition('defense', { attackerRole });
            } else if (autoDefender && autoDefender.player) {
                // Défenseur connu mais pas de position → afficher zone D+
                gameState.currentAction = {
                    type: 'defense',
                    player: autoDefender.player,
                    team: newAttackingTeam,
                    role: getPlayerRole(newAttackingTeam, autoDefender.player)
                };
                WorkflowEngine.transition('defense_end');
            } else {
                // Rien de pré-sélectionné → flow normal
                WorkflowEngine.transition('defense', { attackerRole });
            }
        }
        else if (result === 'defense_fault') {
            // Attaque défendue mais faute de défense
            if (lastAction) lastAction.result = 'defended';
            const attackerRole = lastAction ? lastAction.role : null;
            const newAttackingTeam = gameState.attackingTeam === 'home' ? 'away' : 'home';
            gameState.attackingTeam = newAttackingTeam;
            gameState.context.defenseFaultShortcut = true;

            const autoDefender = gameState.context.autoDefender;
            gameState.context.autoDefender = null;

            if (autoDefender && autoDefender.player) {
                gameState.currentAction = {
                    type: 'defense',
                    player: autoDefender.player,
                    team: newAttackingTeam,
                    role: getPlayerRole(newAttackingTeam, autoDefender.player)
                };
                gameState.context.defenseFaultShortcut = false;
                gameState.currentAction.result = 'fault';
                WorkflowEngine.transition('defense_fault_trajectory');
            } else {
                WorkflowEngine.transition('defense', { attackerRole });
            }
        }
        else if (result === 'blocked') {
            gameState.context.autoDefender = null;
            const blockingTeam = gameState.attackingTeam === 'home' ? 'away' : 'home';
            gameState.currentAction = {
                type: 'block',
                team: blockingTeam
            };
            WorkflowEngine.transition('block_end');
        }
    },

    reenter() {
        this.enter();
    }
});
