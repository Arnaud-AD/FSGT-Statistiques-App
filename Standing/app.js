// ============================================================
// FSGT94 Volleyball Championship Dashboard - app.js
// Multi-championship support with dynamic JSON loading.
// ============================================================

// ------------------------------------------------------------
// 1. State management
// ------------------------------------------------------------

let DATA = null;          // Current championship data (parsed JSON)
let GINETTE_DATA = null;  // Ginette cross-division data (parsed JSON)
let CHAMPIONSHIPS = null; // Championship registry
let currentSlug = null;   // Currently loaded championship slug

// ------------------------------------------------------------
// 2. Initialization
// ------------------------------------------------------------

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const resp = await fetch('data/championships.json');
        CHAMPIONSHIPS = await resp.json();
        populateChampionshipDropdown();

        const urlParams = new URLSearchParams(window.location.search);
        const slug = urlParams.get('champ') || CHAMPIONSHIPS.default || 'elite';
        await loadChampionship(slug);
    } catch (err) {
        console.error('Failed to initialize:', err);
    }
});

async function loadChampionship(slug) {
    showLoading(true);
    try {
        if (slug === 'ginette') {
            const resp = await fetch('data/ginette.json');
            if (!resp.ok) throw new Error('Failed to load ginette');
            GINETTE_DATA = await resp.json();
            currentSlug = slug;

            const url = new URL(window.location);
            url.searchParams.set('champ', slug);
            history.replaceState(null, '', url);

            document.title = 'FSGT94 Volley - Coupe Ginette';
            updateDropdownSelection(slug);
            setGinetteMode(true);
            renderGinetteClassement();
            renderGinette();
        } else {
            const resp = await fetch('data/' + slug + '.json');
            if (!resp.ok) throw new Error('Failed to load ' + slug);
            DATA = await resp.json();
            currentSlug = slug;

            const url = new URL(window.location);
            url.searchParams.set('champ', slug);
            history.replaceState(null, '', url);

            document.title = 'FSGT94 Volley - ' + DATA.meta.name;
            updateDropdownSelection(slug);
            setGinetteMode(false);
            injectTeamColors(DATA.teams);
            injectRankColors(Object.keys(DATA.teams).length);
            renderAll();
        }
    } catch (err) {
        console.error('Error loading championship:', err);
    } finally {
        showLoading(false);
    }
}

function setGinetteMode(isGinette) {
    var headerTabs = document.querySelector('.tabs');
    var mobileTabs = document.querySelector('.mobile-tabs');
    var ginetteTabs = document.querySelector('.ginette-tabs');
    var mobileGinetteTabs = document.querySelector('.mobile-ginette-tabs');
    var ginetteDiv = document.getElementById('ginette');
    var normalTabs = ['classement', 'matchs', 'powerranking'];

    if (isGinette) {
        // Hide normal tabs, show ginette tabs
        if (headerTabs) headerTabs.style.display = 'none';
        if (mobileTabs) mobileTabs.style.display = 'none';
        if (ginetteTabs) ginetteTabs.style.display = '';
        if (mobileGinetteTabs) mobileGinetteTabs.style.display = '';
        normalTabs.forEach(function(id) {
            var el = document.getElementById(id);
            if (el) el.classList.remove('active');
        });
        if (ginetteDiv) ginetteDiv.classList.add('active');
    } else {
        // Show normal tabs, hide ginette tabs
        if (headerTabs) headerTabs.style.display = '';
        if (mobileTabs) mobileTabs.style.display = '';
        if (ginetteTabs) ginetteTabs.style.display = 'none';
        if (mobileGinetteTabs) mobileGinetteTabs.style.display = 'none';
        if (ginetteDiv) ginetteDiv.classList.remove('active');
        // Restore default tab
        var classement = document.getElementById('classement');
        if (classement) classement.classList.add('active');
        // Reset tab button states
        document.querySelectorAll('.tabs .tab, .mobile-tabs .tab').forEach(function(t, i) {
            t.classList.toggle('active', i % 3 === 0);
        });
    }
}

function renderAll() {
    renderStandings();
    renderMatches();
    renderPRTeams();
    renderPRPlayers();
    drawEvolutionChart();
}

function showLoading(show) {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) overlay.classList.toggle('active', show);
}

// ------------------------------------------------------------
// 3. Championship dropdown
// ------------------------------------------------------------

function populateChampionshipDropdown() {
    const selects = document.querySelectorAll('#championship-select, #championship-select-mobile');
    selects.forEach(function(select) {
        select.innerHTML = '';
        var addedSeparator = false;
        CHAMPIONSHIPS.championships.forEach(function(c) {
            // Add separator before special formats (coupe)
            if (c.format === 'coupe' && !addedSeparator) {
                var sep = document.createElement('option');
                sep.disabled = true;
                sep.textContent = '──────────';
                select.appendChild(sep);
                addedSeparator = true;
            }
            const opt = document.createElement('option');
            opt.value = c.slug;
            var suffix = c.format === '6x6' ? ' (6x6)' : c.format === 'coupe' ? ' (Coupe)' : '';
            opt.textContent = c.name + suffix;
            select.appendChild(opt);
        });
    });
}

function updateDropdownSelection(slug) {
    document.querySelectorAll('#championship-select, #championship-select-mobile')
        .forEach(function(s) { s.value = slug; });
}

function switchChampionship(slug) {
    if (slug === currentSlug) return;
    loadChampionship(slug);
    updateDropdownSelection(slug);
}

// ------------------------------------------------------------
// 4. Dynamic team colors injection
// ------------------------------------------------------------

function injectTeamColors(teams) {
    let style = document.getElementById('dynamic-team-styles');
    if (style) style.remove();

    style = document.createElement('style');
    style.id = 'dynamic-team-styles';

    let css = '';
    for (const key in teams) {
        css += '.logo-' + key + ' { background: ' + teams[key].color + '; }\n';
    }
    style.textContent = css;
    document.head.appendChild(style);
}

function injectRankColors(totalTeams) {
    let style = document.getElementById('dynamic-rank-styles');
    if (style) style.remove();

    style = document.createElement('style');
    style.id = 'dynamic-rank-styles';

    let css = '';
    // Relegation zone: last 3 teams (or last 2 if <= 8 teams)
    const relegationStart = totalTeams <= 8 ? totalTeams - 1 : totalTeams - 2;
    for (let i = 4; i <= totalTeams; i++) {
        if (i >= relegationStart) {
            css += '.rank-' + i + ' .rank-indicator { background: var(--rank-europa); }\n';
        } else {
            css += '.rank-' + i + ' .rank-indicator { background: transparent; }\n';
        }
    }
    style.textContent = css;
    document.head.appendChild(style);
}

// ------------------------------------------------------------
// 5. Navigation functions
// ------------------------------------------------------------

function showTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(function(c) { c.classList.remove('active'); });
    document.querySelectorAll('.tab').forEach(function(t) { t.classList.remove('active'); });
    document.getElementById(tabId).classList.add('active');
    event.target.classList.add('active');
    if (tabId === 'classement') setTimeout(drawEvolutionChart, 100);
}

function showSubTab(subTabId, btn) {
    document.querySelectorAll('.sub-tab-content').forEach(function(c) { c.classList.remove('active'); });
    document.querySelectorAll('.sub-tab').forEach(function(t) { t.classList.remove('active'); });
    document.getElementById(subTabId).classList.add('active');
    btn.classList.add('active');
}

function showClassementSubTab(subTabId, btn) {
    document.querySelectorAll('.classement-sub-tab-content').forEach(function(c) { c.classList.remove('active'); });
    btn.parentElement.querySelectorAll('.sub-tab').forEach(function(t) { t.classList.remove('active'); });
    document.getElementById(subTabId).classList.add('active');
    btn.classList.add('active');
    if (subTabId === 'classement-evolution') setTimeout(drawEvolutionChart, 100);
}

function showGinetteTab(tabId) {
    document.querySelectorAll('.ginette-tab-content').forEach(function(c) { c.classList.remove('active'); });
    document.querySelectorAll('.ginette-tabs .tab, .mobile-ginette-tabs .tab').forEach(function(t) { t.classList.remove('active'); });
    document.getElementById(tabId).classList.add('active');
    // Sync both desktop and mobile tab button states
    var idx = tabId === 'ginette-classement' ? 0 : 1;
    document.querySelectorAll('.ginette-tabs .tab, .mobile-ginette-tabs .tab').forEach(function(t, i) {
        if (i % 2 === idx) t.classList.add('active');
    });
}

function showGinetteSubTab(subTabId, btn) {
    document.querySelectorAll('.ginette-sub-tab-content').forEach(function(c) { c.classList.remove('active'); });
    btn.parentElement.querySelectorAll('.sub-tab').forEach(function(t) { t.classList.remove('active'); });
    document.getElementById(subTabId).classList.add('active');
    btn.classList.add('active');
}

// ------------------------------------------------------------
// 6. Render functions
// ------------------------------------------------------------

function renderStandings() {
    const container = document.getElementById('classement-table-content');
    if (!container || !DATA) return;

    function buildFormItems(formArray) {
        return formArray.map(function(f) {
            let cls = 'form-pending';
            if (f === 'W') cls = 'form-win';
            else if (f === 'L') cls = 'form-loss';
            else if (f === 'D') cls = 'form-postponed';
            return '<span class="form-item form-item-sm ' + cls + '"></span>';
        }).join('');
    }

    let rows = '';
    DATA.standings.forEach(function(s) {
        const team = DATA.teams[s.team];
        if (!team) return;
        const allerItems = buildFormItems(s.formAller);
        const retourItems = buildFormItems(s.formRetour);

        rows += '<tr class="rank-' + s.rank + '">' +
            '<td>' +
                '<div class="team-cell">' +
                    '<div class="rank-indicator"></div>' +
                    '<span class="rank-number">' + s.rank + '</span>' +
                    '<div class="team-logo logo-' + s.team + '">' + team.short + '</div>' +
                    '<span class="team-name">' + team.name + '</span>' +
                '</div>' +
            '</td>' +
            '<td>' + s.mj + '</td>' +
            '<td>' + s.g + '</td>' +
            '<td class="bold-val">' + s.p + '</td>' +
            '<td>' + s.setPlus + '</td>' +
            '<td>' + s.setMinus + '</td>' +
            '<td class="bold-val">' + s.ds + '</td>' +
            '<td>' + s.coefSet + '</td>' +
            '<td>' + s.ptsPlus + '</td>' +
            '<td>' + s.ptsMinus + '</td>' +
            '<td class="bold-val">' + s.dp + '</td>' +
            '<td>' + s.coefPts + '</td>' +
            '<td>' + s.pts + '</td>' +
            '<td>' +
                '<div class="form-section">' +
                    '<span class="form-label">A</span>' +
                    '<div class="form-container">' + allerItems + '</div>' +
                '</div>' +
                '<div class="form-section">' +
                    '<span class="form-label">R</span>' +
                    '<div class="form-container">' + retourItems + '</div>' +
                '</div>' +
            '</td>' +
        '</tr>';
    });

    container.innerHTML = '<div class="table-container">' +
        '<table>' +
            '<thead><tr>' +
                '<th>Club</th><th>MJ</th><th>G</th><th class="bold-col">P</th>' +
                '<th>Set+</th><th>Set-</th><th class="bold-col">DS</th><th>Coef Set</th>' +
                '<th>Pts+</th><th>Pts-</th><th class="bold-col">DP</th><th>Coef Pts</th>' +
                '<th>Pts</th><th>Forme</th>' +
            '</tr></thead>' +
            '<tbody>' + rows + '</tbody>' +
        '</table>' +
    '</div>';
}

function toggleMatchSection(sectionId) {
    const content = document.getElementById(sectionId);
    const header = content.previousElementSibling;
    const arrow = header.querySelector('.section-arrow');
    content.classList.toggle('collapsed');
    arrow.classList.toggle('collapsed');
    header.classList.toggle('header-collapsed');
}

function renderMatches() {
    const container = document.getElementById('matchs-content');
    if (!container || !DATA) return;

    // Played matches
    let playedCards = '';
    DATA.matchesPlayed.forEach(function(m) {
        const homeTeam = DATA.teams[m.home];
        const awayTeam = DATA.teams[m.away];
        if (!homeTeam || !awayTeam) return;
        playedCards += '<div class="match-card">' +
            '<div class="match-date">' + m.date + '</div>' +
            '<div class="match-teams">' +
                '<div class="match-team home">' +
                    '<span class="team-name">' + homeTeam.name + '</span>' +
                    '<div class="team-logo logo-' + m.home + '">' + homeTeam.short + '</div>' +
                '</div>' +
                '<div class="match-score">' +
                    '<span class="' + (m.homeWin ? 'winner' : 'loser') + '">' + m.scoreHome + '</span>' +
                    '<span class="separator">-</span>' +
                    '<span class="' + (m.homeWin ? 'loser' : 'winner') + '">' + m.scoreAway + '</span>' +
                '</div>' +
                '<div class="match-team away">' +
                    '<div class="team-logo logo-' + m.away + '">' + awayTeam.short + '</div>' +
                    '<span class="team-name">' + awayTeam.name + '</span>' +
                '</div>' +
            '</div>' +
            '<div class="match-status"><span class="status-played">' + m.status + '</span></div>' +
        '</div>';
    });

    // Sort upcoming matches by date (N/C first)
    function parseMatchDate(d) {
        if (!d || d === 'N/C') return null;
        var parts = d.split('/');
        if (parts.length !== 3) return null;
        return new Date(parts[2], parts[1] - 1, parts[0]);
    }
    var sortedUpcoming = DATA.matchesUpcoming.slice().sort(function(a, b) {
        var da = parseMatchDate(a.date);
        var db = parseMatchDate(b.date);
        if (!da && !db) return 0;
        if (!da) return -1;
        if (!db) return 1;
        return da - db;
    });

    // Group semaines for alternating backgrounds
    var semaineSet = new Set();
    sortedUpcoming.forEach(function(m) {
        var semMatch = m.status.match(/Sem\.\s*(\d+)/);
        if (semMatch) semaineSet.add(parseInt(semMatch[1]));
    });
    var semaineList = Array.from(semaineSet).sort(function(a, b) { return a - b; });
    var semaineIndex = {};
    semaineList.forEach(function(sem, i) { semaineIndex[sem] = i; });

    // Build rank lookup for clash detection
    var teamRank = {};
    DATA.standings.forEach(function(s) { teamRank[s.team] = s.rank; });

    let upcomingCards = '';
    sortedUpcoming.forEach(function(m) {
        const homeTeam = DATA.teams[m.home];
        const awayTeam = DATA.teams[m.away];
        if (!homeTeam || !awayTeam) return;
        const isPostponed = m.status.includes('Report');
        const statusClass = isPostponed ? 'status-postponed' : 'status-upcoming';

        let cardClasses = 'match-card';
        if (isPostponed) {
            cardClasses += ' match-card-postponed';
        } else {
            var semMatch = m.status.match(/Sem\.\s*(\d+)/);
            if (semMatch) {
                var idx = semaineIndex[parseInt(semMatch[1])];
                if (idx % 2 === 0) cardClasses += ' match-card-sem-even';
            }
        }

        // Clash badges
        var rH = teamRank[m.home] || 99;
        var rA = teamRank[m.away] || 99;
        let clashBadge = '';
        if (rH <= 3 && rA <= 3) {
            clashBadge = '<span class="clash-badge clash-top3" title="Choc au sommet">\uD83D\uDD25</span>';
        } else if (rH <= 5 && rA <= 5) {
            clashBadge = '<span class="clash-badge clash-top5" title="Affiche">\u26A1</span>';
        }

        upcomingCards += '<div class="' + cardClasses + '">' +
            '<div class="match-date">' + m.date + clashBadge + '</div>' +
            '<div class="match-teams">' +
                '<div class="match-team home">' +
                    '<span class="team-name">' + homeTeam.name + '</span>' +
                    '<div class="team-logo logo-' + m.home + '">' + homeTeam.short + '</div>' +
                '</div>' +
                '<div class="match-score">' +
                    '<span class="separator">-</span>' +
                '</div>' +
                '<div class="match-team away">' +
                    '<div class="team-logo logo-' + m.away + '">' + awayTeam.short + '</div>' +
                    '<span class="team-name">' + awayTeam.name + '</span>' +
                '</div>' +
            '</div>' +
            '<div class="match-status"><span class="' + statusClass + '">' + m.status + '</span></div>' +
        '</div>';
    });

    container.innerHTML =
        '<div class="matches-section">' +
            '<div class="section-header header-collapsed" onclick="toggleMatchSection(\'played-matches-content\')">' +
                '<h3 class="section-title">R\u00e9sultats</h3>' +
                '<span class="section-badge">' + DATA.matchesPlayed.length + ' matchs</span>' +
                '<span class="section-arrow collapsed">&#9660;</span>' +
            '</div>' +
            '<div id="played-matches-content" class="section-collapsible collapsed">' +
                playedCards +
            '</div>' +
        '</div>' +
        '<div class="matches-section">' +
            '<div class="section-header" onclick="toggleMatchSection(\'upcoming-matches-content\')">' +
                '<h3 class="section-title">\u00c0 venir</h3>' +
                '<span class="section-badge">' + DATA.matchesUpcoming.length + ' matchs</span>' +
                '<span class="section-arrow">&#9660;</span>' +
            '</div>' +
            '<div id="upcoming-matches-content" class="section-collapsible">' +
                upcomingCards +
            '</div>' +
        '</div>';
}

function renderPRTeams() {
    const container = document.getElementById('pr-equipes-content');
    if (!container || !DATA) return;

    let rows = '';
    DATA.prTeams.forEach(function(r) {
        const team = DATA.teams[r.team];
        if (!team) return;
        const barClass = r.rank <= 10 ? 'bar-rank-' + r.rank : 'bar-rank-rest';
        const mvtClass = r.movement > 0 ? 'elo-up' : r.movement < 0 ? 'elo-down' : 'elo-neutral';
        const mvtArrow = r.movement > 0 ? '\u25b2' : r.movement < 0 ? '\u25bc' : '';
        const mvtText = r.movement > 0 ? '+' + r.movement : r.movement < 0 ? '' + r.movement : '-';
        const score = Math.round(r.power);
        rows += '<tr>' +
            '<td class="pr-rank">' + r.rank + '</td>' +
            '<td><div class="team-cell"><div class="team-logo logo-' + r.team + '">' + team.short + '</div><span class="team-name">' + team.name + '</span></div></td>' +
            '<td class="center"><span class="record-text">' + r.record + '</span></td>' +
            '<td class="center"><span class="pr-value">' + score + '</span></td>' +
            '<td class="center"><div class="pr-bar-container"><div class="pr-bar"><div class="pr-bar-fill ' + barClass + '" style="width: ' + r.power + '%;"></div></div></div></td>' +
            '<td class="center"><span class="elo-movement ' + mvtClass + '">' + mvtArrow + ' ' + mvtText + '</span></td>' +
            '<td class="center"><span class="difficulty-badge ' + r.diffClass + '">' + r.calendar + '</span></td>' +
        '</tr>';
    });

    container.innerHTML = '<div class="table-container">' +
        '<table class="pr-table">' +
            '<thead><tr>' +
                '<th style="width: 40px;">#</th>' +
                '<th>\u00c9quipe</th>' +
                '<th class="center">V-D</th>' +
                '<th class="center">Score</th>' +
                '<th class="center" style="width: 150px;"></th>' +
                '<th class="center">Mvt</th>' +
                '<th class="center">Forme</th>' +
            '</tr></thead>' +
            '<tbody>' + rows + '</tbody>' +
        '</table>' +
    '</div>';
}

function renderPRPlayers() {
    const container = document.getElementById('pr-joueurs-content');
    if (!container || !DATA) return;

    // Hide/show Joueurs tab based on data availability
    const joueursTab = document.getElementById('pr-joueurs-tab');
    if (!DATA.prPlayers || DATA.prPlayers.length === 0) {
        if (joueursTab) joueursTab.style.display = 'none';
        container.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 40px;">Pas de classement joueurs disponible pour ce championnat.</p>';
        return;
    }
    if (joueursTab) joueursTab.style.display = '';

    let rows = '';
    DATA.prPlayers.forEach(function(p) {
        const team = DATA.teams[p.team];
        if (!team) return;
        const barClass = p.rank <= 10 ? 'bar-rank-' + p.rank : 'bar-rank-rest';
        rows += '<tr>' +
            '<td class="pr-rank">' + p.rank + '</td>' +
            '<td><span class="player-name">' + p.name + '</span></td>' +
            '<td class="center"><div class="team-logo logo-' + p.team + '">' + team.short + '</div></td>' +
            '<td class="center">' + p.pos + '</td>' +
            '<td class="center"><span class="pr-value">' + p.power + '</span></td>' +
            '<td class="center"><div class="pr-bar-container"><div class="pr-bar"><div class="pr-bar-fill ' + barClass + '" style="width: ' + p.power + '%;"></div></div></div></td>' +
        '</tr>';
    });

    container.innerHTML = '<div class="table-container">' +
        '<table class="pr-table">' +
            '<thead><tr>' +
                '<th style="width: 40px;">#</th>' +
                '<th>Joueur</th>' +
                '<th class="center">\u00c9quipe</th>' +
                '<th class="center">Poste</th>' +
                '<th class="center">Power</th>' +
                '<th class="center" style="width: 150px;">Barre</th>' +
            '</tr></thead>' +
            '<tbody>' + rows + '</tbody>' +
        '</table>' +
    '</div>' +
    '<p style="text-align: center; color: var(--text-secondary); font-size: 12px; margin-top: 16px;">' + DATA.prPlayers.length + ' joueurs class\u00e9s</p>';
}

// ------------------------------------------------------------
// 7. Ginette cross-division ranking
// ------------------------------------------------------------

var GINETTE_DIV_COLORS = {
    "elite": "#1a73e8",
    "hard": "#9b59b6",
    "medium": "#34a853",
    "easy": "#f39c12",
    "starter": "#ff5722",
    "or6x6": "#e91e63",
    "argent": "#607d8b"
};

function renderGinetteMatchCards(matches) {
    var html = '';
    matches.forEach(function(m) {
        var homeColor = GINETTE_DIV_COLORS[m.homeDivision] || '#999';
        var awayColor = GINETTE_DIV_COLORS[m.awayDivision] || '#999';
        var homeDivLabel = DIV_LABELS_JS[m.homeDivision] || m.homeDivision;
        var awayDivLabel = DIV_LABELS_JS[m.awayDivision] || m.awayDivision;
        var homeWin = m.winner === m.home;
        var forfeit = m.forfeit;

        var scoreDetail = '';
        if (m.homeScores && m.homeScores.length > 0 && !forfeit) {
            var setScores = [];
            for (var i = 0; i < m.homeScores.length; i++) {
                setScores.push(m.homeScores[i] + '-' + m.awayScores[i]);
            }
            scoreDetail = '<span class="ginette-set-detail">(' + setScores.join(', ') + ')</span>';
        }

        var cardClass = 'match-card ginette-match-card';
        if (forfeit) cardClass += ' ginette-match-forfeit';

        html += '<div class="' + cardClass + '">' +
            '<div class="match-teams">' +
                '<div class="match-team home">' +
                    '<span class="division-badge division-badge-sm" style="background: ' + homeColor + ';">' + homeDivLabel + '</span>' +
                    '<span class="team-name">' + m.home + '</span>' +
                '</div>' +
                '<div class="match-score">' +
                    '<span class="' + (homeWin ? 'winner' : 'loser') + '">' + m.homeSets + '</span>' +
                    '<span class="separator">-</span>' +
                    '<span class="' + (homeWin ? 'loser' : 'winner') + '">' + m.awaySets + '</span>' +
                '</div>' +
                '<div class="match-team away">' +
                    '<span class="team-name">' + m.away + '</span>' +
                    '<span class="division-badge division-badge-sm" style="background: ' + awayColor + ';">' + awayDivLabel + '</span>' +
                '</div>' +
            '</div>' +
            '<div class="ginette-match-detail">' + scoreDetail +
                (forfeit ? '<span class="ginette-forfeit-badge">Forfait</span>' : '') +
            '</div>' +
        '</div>';
    });
    return html;
}

function renderGinetteClassement() {
    if (!GINETTE_DATA) return;
    var matches = GINETTE_DATA.matches;

    var tour1 = matches.filter(function(m) { return m.round === 'Tour 1'; });
    var tour2 = matches.filter(function(m) { return m.round === 'Tour 2'; });
    var principale = matches.filter(function(m) { return m.round === '1/8 Principale'; });
    var consolante = matches.filter(function(m) { return m.round === '1/8 Consolante'; });

    // Tour 1
    var tour1Container = document.getElementById('ginette-tour1');
    if (tour1Container) {
        tour1Container.innerHTML =
            '<div class="matches-section">' +
                '<div class="section-header" onclick="toggleMatchSection(\'ginette-tour1-matches\')">' +
                    '<h3 class="section-title">Tour 1</h3>' +
                    '<span class="section-badge">' + tour1.length + ' matchs</span>' +
                    '<span class="section-arrow">&#9660;</span>' +
                '</div>' +
                '<div id="ginette-tour1-matches" class="section-collapsible">' +
                    renderGinetteMatchCards(tour1) +
                '</div>' +
            '</div>';
    }

    // Tour 2
    var tour2Container = document.getElementById('ginette-tour2');
    if (tour2Container) {
        tour2Container.innerHTML =
            '<div class="matches-section">' +
                '<div class="section-header" onclick="toggleMatchSection(\'ginette-tour2-matches\')">' +
                    '<h3 class="section-title">Tour 2</h3>' +
                    '<span class="section-badge">' + tour2.length + ' matchs</span>' +
                    '<span class="section-arrow">&#9660;</span>' +
                '</div>' +
                '<div id="ginette-tour2-matches" class="section-collapsible">' +
                    renderGinetteMatchCards(tour2) +
                '</div>' +
            '</div>';
    }

    // 1/8ème de finale
    var huitContainer = document.getElementById('ginette-8eme');
    if (huitContainer) {
        huitContainer.innerHTML =
            '<div class="matches-section">' +
                '<div class="section-header" onclick="toggleMatchSection(\'ginette-principale-matches\')">' +
                    '<h3 class="section-title">Principale</h3>' +
                    '<span class="section-badge">' + principale.length + ' matchs</span>' +
                    '<span class="section-arrow">&#9660;</span>' +
                '</div>' +
                '<div id="ginette-principale-matches" class="section-collapsible">' +
                    renderGinetteMatchCards(principale) +
                '</div>' +
            '</div>' +
            '<div class="matches-section" style="margin-top: 16px;">' +
                '<div class="section-header" onclick="toggleMatchSection(\'ginette-consolante-matches\')">' +
                    '<h3 class="section-title">Consolante</h3>' +
                    '<span class="section-badge">' + consolante.length + ' matchs</span>' +
                    '<span class="section-arrow">&#9660;</span>' +
                '</div>' +
                '<div id="ginette-consolante-matches" class="section-collapsible">' +
                    renderGinetteMatchCards(consolante) +
                '</div>' +
            '</div>';
    }
}

function renderGinette() {
    var container = document.getElementById('ginette-content');
    if (!container || !GINETTE_DATA) return;

    var ranking = GINETTE_DATA.ranking;
    var divStats = GINETTE_DATA.divisionStats;
    var upsets = GINETTE_DATA.upsets;
    var meta = GINETTE_DATA.meta;

    // ── Ranking table ──
    var rows = '';
    ranking.forEach(function(r) {
        var divColor = GINETTE_DIV_COLORS[r.divSlug] || '#999';
        var barClass = r.rank <= 10 ? 'bar-rank-' + r.rank : 'bar-rank-rest';
        var deltaClass = r.delta > 0 ? 'elo-up' : r.delta < 0 ? 'elo-down' : 'elo-neutral';
        var deltaArrow = r.delta > 0 ? '\u25b2' : r.delta < 0 ? '\u25bc' : '';
        var deltaText = r.delta > 0 ? '+' + r.delta : r.delta < 0 ? '' + r.delta : '-';

        // Form items
        var formHtml = r.form.map(function(f) {
            var cls = f === 'W' ? 'form-win' : 'form-loss';
            return '<span class="form-item form-item-sm ' + cls + '"></span>';
        }).join('');

        rows += '<tr>' +
            '<td class="pr-rank">' + r.rank + '</td>' +
            '<td>' +
                '<div class="team-cell">' +
                    '<span class="team-name">' + r.name + '</span>' +
                '</div>' +
            '</td>' +
            '<td class="center"><span class="division-badge" style="background: ' + divColor + ';">' + r.division + '</span></td>' +
            '<td class="center"><span class="pr-value">' + Math.round(r.elo) + '</span></td>' +
            '<td class="center"><div class="pr-bar-container"><div class="pr-bar"><div class="pr-bar-fill ' + barClass + '" style="width: ' + r.power + '%;"></div></div></div></td>' +
            '<td class="center"><span class="elo-movement ' + deltaClass + '">' + deltaArrow + ' ' + deltaText + '</span></td>' +
            '<td class="center"><span class="record-text">' + r.record + '</span></td>' +
            '<td class="center"><div class="form-container" style="justify-content: center;">' + formHtml + '</div></td>' +
        '</tr>';
    });

    var rankingHtml = '<div class="table-container">' +
        '<table class="pr-table">' +
            '<thead><tr>' +
                '<th style="width: 40px;">#</th>' +
                '<th>\u00c9quipe</th>' +
                '<th class="center">Division</th>' +
                '<th class="center">ELO</th>' +
                '<th class="center" style="width: 120px;"></th>' +
                '<th class="center">\u0394</th>' +
                '<th class="center">V-D</th>' +
                '<th class="center">Forme</th>' +
            '</tr></thead>' +
            '<tbody>' + rows + '</tbody>' +
        '</table>' +
    '</div>';

    // ── Division stats ──
    var divRows = '';
    divStats.forEach(function(d) {
        var divColor = GINETTE_DIV_COLORS[d.slug] || '#999';
        divRows += '<tr>' +
            '<td><span class="division-badge" style="background: ' + divColor + ';">' + d.name + '</span></td>' +
            '<td class="center">' + d.teams + '</td>' +
            '<td class="center"><strong>' + Math.round(d.avgElo) + '</strong></td>' +
            '<td class="center">' + Math.round(d.maxElo) + '</td>' +
            '<td class="center">' + Math.round(d.minElo) + '</td>' +
            '<td class="center">' + d.wins + '-' + d.losses + '</td>' +
            '<td class="center"><strong>' + d.winPct + '%</strong></td>' +
        '</tr>';
    });

    var divStatsHtml = '<div class="ginette-section">' +
        '<h3 class="ginette-section-title">Performance par division</h3>' +
        '<div class="table-container">' +
            '<table class="pr-table ginette-div-table">' +
                '<thead><tr>' +
                    '<th>Division</th>' +
                    '<th class="center">\u00c9q.</th>' +
                    '<th class="center">ELO moy.</th>' +
                    '<th class="center">Max</th>' +
                    '<th class="center">Min</th>' +
                    '<th class="center">V-D</th>' +
                    '<th class="center">% Vic.</th>' +
                '</tr></thead>' +
                '<tbody>' + divRows + '</tbody>' +
            '</table>' +
        '</div>' +
    '</div>';

    // ── Upsets ──
    var upsetsHtml = '';
    if (upsets && upsets.length > 0) {
        var upsetItems = '';
        upsets.forEach(function(u) {
            var fires = '';
            for (var i = 0; i < Math.min(u.gap, 3); i++) fires += '\uD83D\uDD25';
            var wColor = GINETTE_DIV_COLORS[u.winnerDiv.toLowerCase().replace(' 6x6', '').replace('or ', 'or')] || '#999';
            var lColor = GINETTE_DIV_COLORS[u.loserDiv.toLowerCase().replace(' 6x6', '').replace('or ', 'or')] || '#999';
            // Map display names back to slugs for color lookup
            var wSlug = Object.keys(GINETTE_DIV_COLORS).find(function(k) {
                return DIV_LABELS_JS[k] === u.winnerDiv;
            }) || '';
            var lSlug = Object.keys(GINETTE_DIV_COLORS).find(function(k) {
                return DIV_LABELS_JS[k] === u.loserDiv;
            }) || '';
            wColor = GINETTE_DIV_COLORS[wSlug] || '#999';
            lColor = GINETTE_DIV_COLORS[lSlug] || '#999';

            upsetItems += '<div class="upset-item">' +
                '<span class="upset-fire">' + fires + '</span> ' +
                '<strong>' + u.winner + '</strong> ' +
                '<span class="division-badge division-badge-sm" style="background: ' + wColor + ';">' + u.winnerDiv + '</span>' +
                ' bat ' +
                '<strong>' + u.loser + '</strong> ' +
                '<span class="division-badge division-badge-sm" style="background: ' + lColor + ';">' + u.loserDiv + '</span>' +
                ' <span class="upset-score">' + u.score + '</span>' +
            '</div>';
        });

        upsetsHtml = '<div class="ginette-section">' +
            '<h3 class="ginette-section-title">Upsets notables</h3>' +
            '<div class="ginette-upsets">' + upsetItems + '</div>' +
        '</div>';
    }

    // ── Meta info ──
    var metaHtml = '<div class="ginette-meta">' +
        '<span class="ginette-meta-item">' + meta.teamCount + ' \u00e9quipes</span>' +
        '<span class="ginette-meta-item">' + meta.matchCount + ' matchs</span>' +
        '<span class="ginette-meta-item">' + meta.rounds.length + ' tours</span>' +
        '<span class="ginette-meta-item">Mis \u00e0 jour : ' + meta.lastUpdated.split('T')[0] + '</span>' +
    '</div>';

    container.innerHTML = metaHtml + rankingHtml + divStatsHtml + upsetsHtml;
}

var DIV_LABELS_JS = {
    "elite": "Elite",
    "hard": "Hard",
    "medium": "Medium",
    "easy": "Easy",
    "starter": "Starter",
    "or6x6": "Or 6x6",
    "argent": "Argent"
};

// ------------------------------------------------------------
// 8. Evolution chart (canvas drawing)
// ------------------------------------------------------------

function drawEvolutionChart() {
    const canvas = document.getElementById('evolutionChart');
    if (!canvas || !DATA || !DATA.evolutionData) return;

    const ctx = canvas.getContext('2d');
    const container = canvas.parentElement;

    canvas.width = Math.min(container.clientWidth - 40, 900);
    canvas.height = 600;

    const width = canvas.width;
    const height = canvas.height;
    const iconAreaWidth = 80;
    const padding = { top: 30, right: 30 + iconAreaWidth, bottom: 50, left: 50 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    // Clear
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Max values
    let maxMatches = 0;
    let maxPoints = 0;
    const teamsData = DATA.evolutionData.teams;
    for (const key in teamsData) {
        const data = teamsData[key];
        const teamMatches = data.points.length - 1;
        const teamMaxPts = Math.max.apply(null, data.points);
        if (teamMatches > maxMatches) maxMatches = teamMatches;
        if (teamMaxPts > maxPoints) maxPoints = teamMaxPts;
    }
    if (maxMatches === 0 || maxPoints === 0) return;

    // Grid
    for (let i = 0; i <= maxPoints; i += 2) {
        const y = padding.top + chartHeight - (i / maxPoints) * chartHeight;
        ctx.beginPath();
        ctx.strokeStyle = '#e8e8e8';
        ctx.lineWidth = 0.5;
        ctx.moveTo(padding.left, y);
        ctx.lineTo(width - padding.right, y);
        ctx.stroke();

        ctx.fillStyle = '#333';
        ctx.font = '11px -apple-system, sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(i.toString(), padding.left - 10, y + 4);
    }

    for (let i = 0; i <= maxMatches; i++) {
        const x = padding.left + (i / maxMatches) * chartWidth;
        ctx.beginPath();
        ctx.strokeStyle = '#e8e8e8';
        ctx.lineWidth = 0.5;
        ctx.moveTo(x, padding.top);
        ctx.lineTo(x, height - padding.bottom);
        ctx.stroke();

        ctx.fillStyle = '#333';
        ctx.font = '11px -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(i.toString(), x, height - padding.bottom + 20);
    }

    // Axes
    ctx.beginPath();
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1.5;
    ctx.moveTo(padding.left, padding.top);
    ctx.lineTo(padding.left, height - padding.bottom);
    ctx.lineTo(width - padding.right, height - padding.bottom);
    ctx.stroke();

    // Axis labels
    ctx.fillStyle = '#333';
    ctx.font = '12px -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Matchs jou\u00e9s', width / 2, height - 10);

    ctx.save();
    ctx.translate(15, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Points', 0, 0);
    ctx.restore();

    // Draw lines for each team
    for (const teamKey in teamsData) {
        const data = teamsData[teamKey];
        const team = DATA.teams[teamKey];
        const color = team ? team.color : '#999999';

        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = 2.5;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';

        data.points.forEach(function(points, matchIndex) {
            const x = padding.left + (matchIndex / maxMatches) * chartWidth;
            const y = padding.top + chartHeight - (points / maxPoints) * chartHeight;
            if (matchIndex === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.stroke();

        // Dots
        data.points.forEach(function(points, matchIndex) {
            const x = padding.left + (matchIndex / maxMatches) * chartWidth;
            const y = padding.top + chartHeight - (points / maxPoints) * chartHeight;
            ctx.beginPath();
            ctx.fillStyle = color;
            ctx.arc(x, y, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.fillStyle = '#ffffff';
            ctx.arc(x, y, 2, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    // Team icons at end of curves
    const iconSize = 22;
    const iconOffset = 8;

    const teamsForIcons = [];
    for (const teamKey in teamsData) {
        const data = teamsData[teamKey];
        const team = DATA.teams[teamKey];
        const lastMatchIndex = data.points.length - 1;
        const finalPoints = data.points[lastMatchIndex];
        teamsForIcons.push({
            key: teamKey,
            short: team ? team.short : teamKey.substring(0, 3).toUpperCase(),
            color: team ? team.color : '#999999',
            finalPoints: finalPoints,
            lastMatchIndex: lastMatchIndex,
            rank: data.rank,
            x: padding.left + (lastMatchIndex / maxMatches) * chartWidth + iconOffset,
            y: padding.top + chartHeight - (finalPoints / maxPoints) * chartHeight
        });
    }

    // Resolve overlapping icons
    teamsForIcons.sort(function(a, b) { return a.y - b.y || a.rank - b.rank; });
    for (let i = 1; i < teamsForIcons.length; i++) {
        const prev = teamsForIcons[i - 1];
        const curr = teamsForIcons[i];
        const minGap = iconSize + 2;
        if (Math.abs(curr.y - prev.y) < minGap) {
            const midY = (prev.y + curr.y) / 2;
            prev.y = midY - minGap / 2;
            curr.y = midY + minGap / 2;
        }
    }

    teamsForIcons.forEach(function(team) {
        const x = team.x;
        const y = team.y;

        // Rounded square
        const radius = 4;
        ctx.beginPath();
        ctx.moveTo(x + radius, y - iconSize / 2);
        ctx.lineTo(x + iconSize - radius, y - iconSize / 2);
        ctx.quadraticCurveTo(x + iconSize, y - iconSize / 2, x + iconSize, y - iconSize / 2 + radius);
        ctx.lineTo(x + iconSize, y + iconSize / 2 - radius);
        ctx.quadraticCurveTo(x + iconSize, y + iconSize / 2, x + iconSize - radius, y + iconSize / 2);
        ctx.lineTo(x + radius, y + iconSize / 2);
        ctx.quadraticCurveTo(x, y + iconSize / 2, x, y + iconSize / 2 - radius);
        ctx.lineTo(x, y - iconSize / 2 + radius);
        ctx.quadraticCurveTo(x, y - iconSize / 2, x + radius, y - iconSize / 2);
        ctx.closePath();
        ctx.fillStyle = team.color;
        ctx.fill();

        // Team initials
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 9px -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(team.short, x + iconSize / 2, y + 1);
    });
}

window.addEventListener('resize', drawEvolutionChart);
