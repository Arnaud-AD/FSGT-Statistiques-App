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

// Standings column sort state
// col = null → official rank order; otherwise data field name
var standingsSort = { col: null, asc: true };

// Columns where "less is better" → default sort is ascending
var ASC_DEFAULT_COLS = { p: true, setMinus: true, ptsMinus: true, pp: true };

// Points perdus : ce qu'une équipe a laissé filer sur ses matchs joués (3 par match max)
function pointsPerdus(s) { return 3 * s.mj - s.pts; }

// Mobile: teams whose detail row is unfolded (team key → true)
var standingsExpanded = {};

// Desktop: teams whose full calendar is unfolded (team key → true)
var standingsCalendarOpen = {};

// ------------------------------------------------------------
// 2. Initialization
// ------------------------------------------------------------

// 'no-cache' : le navigateur revalide toujours les JSON auprès du serveur,
// les visiteurs voient donc chaque mise à jour sans hard refresh.
const FETCH_FRESH = { cache: 'no-cache' };

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const resp = await fetch('data/championships.json', FETCH_FRESH);
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
            const resp = await fetch('data/ginette.json', FETCH_FRESH);
            if (!resp.ok) throw new Error('Failed to load ginette');
            GINETTE_DATA = await resp.json();
            currentSlug = slug;

            const url = new URL(window.location);
            url.searchParams.set('champ', slug);
            history.replaceState(null, '', url);

            document.title = 'FSGT94 Volley - Coupe Ginette';
            updateDropdownSelection(slug);
            setGinetteMode(true);
            await loadGinetteTeamInfo();
            buildGinetteCtx();
            renderGinetteStandings();
            renderGinetteMatches();
            renderGinette();
        } else {
            const resp = await fetch('data/' + slug + '.json', FETCH_FRESH);
            if (!resp.ok) throw new Error('Failed to load ' + slug);
            DATA = await resp.json();
            currentSlug = slug;

            const url = new URL(window.location);
            url.searchParams.set('champ', slug);
            history.replaceState(null, '', url);

            // Reset standings sort on championship change
            standingsSort = { col: null, asc: true };

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


// Échappement HTML : les noms/dates/lieux viennent du scraping du site FSGT (source externe)
function esc(v) {
    return String(v == null ? '' : v)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
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
    // Relegation zone: last 2 teams, whatever the pool size (rule since 2026-2027)
    const relegationStart = totalTeams - 1;
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
    var tabIds = ['ginette-classement', 'ginette-matchs', 'ginette-pr'];
    var idx = tabIds.indexOf(tabId);
    document.querySelectorAll('.ginette-tabs .tab, .mobile-ginette-tabs .tab').forEach(function(t, i) {
        if (i % tabIds.length === idx) t.classList.add('active');
    });
}

// ------------------------------------------------------------
// 6. Render functions
// ------------------------------------------------------------

function standingsSortIcon(col) {
    if (standingsSort.col === col) {
        var arrow = standingsSort.asc ? '\u25B2' : '\u25BC';
        return ' <span class="sort-arrow active">' + arrow + '</span>';
    }
    return ' <span class="sort-arrow">\u25BC</span>';
}

function getStandingSortValue(s, col) {
    if (col === 'coefSet' || col === 'coefPts') return parseFloat(s[col]) || 0;
    if (col === 'pp') return pointsPerdus(s);
    return s[col];
}

function renderStandings() {
    const container = document.getElementById('classement-table-content');
    if (!container || !DATA) return;

    function buildFormItems(formArray) {
        return formArray.map(function(f) {
            let cls = 'form-pending';
            if (f === 'W') cls = 'form-win';
            else if (f === 'L') cls = 'form-loss';
            else if (f === 'C') cls = 'form-close';   // défaite serrée (1 set d'écart)
            else if (f === 'D') cls = 'form-postponed';
            return '<span class="form-item form-item-sm ' + cls + '"></span>';
        }).join('');
    }

    // Sort standings (or keep official rank order)
    var sorted = DATA.standings.slice();
    if (standingsSort.col) {
        var col = standingsSort.col;
        var asc = standingsSort.asc;
        sorted.sort(function(a, b) {
            var va = getStandingSortValue(a, col);
            var vb = getStandingSortValue(b, col);
            if (va !== vb) return asc ? va - vb : vb - va;
            if (col === 'pp' && a.ds !== b.ds) return b.ds - a.ds; // PP égaux : meilleure DS devant
            return a.rank - b.rank; // tie-break: official rank
        });
    }

    // Sortable column definitions: [label, dataField, boldClass]
    var sortableCols = [
        ['MJ', 'mj', ''],
        ['V', 'g', ''],
        ['D', 'p', ''],
        ['Set+', 'setPlus', 'col-opt'],
        ['Set-', 'setMinus', 'col-opt'],
        ['DS', 'ds', 'bold-col'],
        ['Coef Set', 'coefSet', 'col-opt'],
        ['Pts+', 'ptsPlus', 'col-opt'],
        ['Pts-', 'ptsMinus', 'col-opt'],
        ['DP', 'dp', 'col-opt'],
        ['Coef Pts', 'coefPts', 'col-opt'],
        ['Pts', 'pts', 'bold-col']
    ];

    // Clic sur « Club » : tri caché par points perdus (3 × MJ − Pts), puis DS.
    // Pas de flèche tant qu'il n'est pas actif.
    var clubActive = standingsSort.col === 'pp';
    var theadCols = '<th class="standings-sortable" data-sort-col="pp" title="Trier par points perdus">Club' +
        (clubActive ? standingsSortIcon('pp') : '') + '</th>';
    sortableCols.forEach(function(c) {
        var classes = 'standings-sortable';
        if (c[2]) classes += ' ' + c[2];
        theadCols += '<th class="' + classes + '" data-sort-col="' + c[1] + '">' + c[0] + standingsSortIcon(c[1]) + '</th>';
    });
    theadCols += '<th class="col-opt">Forme</th>';

    let rows = '';
    sorted.forEach(function(s) {
        const team = DATA.teams[s.team];
        if (!team) return;
        const allerItems = buildFormItems(s.formAller);
        const retourItems = buildFormItems(s.formRetour);

        const expanded = !!standingsExpanded[s.team];
        rows += '<tr class="rank-' + s.rank + ' standings-row' + (expanded ? ' expanded' : '') + (standingsCalendarOpen[s.team] ? ' cal-open' : '') + '" data-team="' + s.team + '">' +
            '<td>' +
                '<div class="team-cell">' +
                    '<div class="rank-indicator"></div>' +
                    '<span class="row-chevron">&#9656;</span>' +
                    '<span class="rank-number">' + s.rank + '</span>' +
                    '<div class="team-logo logo-' + s.team + '">' + esc(team.short) + '</div>' +
                    '<span class="team-name">' + esc(team.name) + '</span>' +
                '</div>' +
            '</td>' +
            '<td>' + s.mj + '</td>' +
            '<td>' + s.g + '</td>' +
            '<td>' + s.p + '</td>' +
            '<td class="col-opt">' + s.setPlus + '</td>' +
            '<td class="col-opt">' + s.setMinus + '</td>' +
            '<td class="bold-val">' + s.ds + '</td>' +
            '<td class="col-opt">' + s.coefSet + '</td>' +
            '<td class="col-opt">' + s.ptsPlus + '</td>' +
            '<td class="col-opt">' + s.ptsMinus + '</td>' +
            '<td class="col-opt">' + s.dp + '</td>' +
            '<td class="col-opt">' + s.coefPts + '</td>' +
            '<td class="bold-val">' + s.pts + '</td>' +
            '<td class="col-opt">' +
                '<div class="form-section">' +
                    '<span class="form-label">A</span>' +
                    '<div class="form-container">' + allerItems + '</div>' +
                '</div>' +
                '<div class="form-section">' +
                    '<span class="form-label">R</span>' +
                    '<div class="form-container">' + retourItems + '</div>' +
                '</div>' +
            '</td>' +
        '</tr>' +
        // Mobile: details shown under the team when its row is expanded
        '<tr class="standings-detail rank-' + s.rank + (expanded ? ' expanded' : '') + '" data-team="' + s.team + '">' +
            '<td colspan="6">' +
                '<div class="detail-line detail-grid">' +
                    '<span class="detail-label">Sets</span>' +
                    '<span class="detail-stat"><em>Set+</em> ' + s.setPlus + '</span>' +
                    '<span class="detail-stat"><em>Set-</em> ' + s.setMinus + '</span>' +
                    detailDiffStat('DS', s.ds) +
                    '<span class="detail-stat"><em>Coef</em> ' + s.coefSet + '</span>' +
                '</div>' +
                '<div class="detail-line detail-grid">' +
                    '<span class="detail-label">Points</span>' +
                    '<span class="detail-stat"><em>Pts+</em> ' + s.ptsPlus + '</span>' +
                    '<span class="detail-stat"><em>Pts-</em> ' + s.ptsMinus + '</span>' +
                    detailDiffStat('DP', s.dp) +
                    '<span class="detail-stat"><em>Coef</em> ' + s.coefPts + '</span>' +
                '</div>' +
                '<div class="detail-line">' +
                    '<span class="detail-label">Forme</span>' +
                    '<div class="form-section"><span class="form-label">A</span><div class="form-container">' + allerItems + '</div></div>' +
                    '<div class="form-section"><span class="form-label">R</span><div class="form-container">' + retourItems + '</div></div>' +
                '</div>' +
            '</td>' +
        '</tr>' +
        // Desktop: full calendar shown under the team when its row is clicked
        '<tr class="standings-calendar rank-' + s.rank + (standingsCalendarOpen[s.team] ? ' open' : '') + '" data-team="' + s.team + '">' +
            '<td colspan="' + (sortableCols.length + 2) + '">' + buildTeamCalendar(s.team) + '</td>' +
        '</tr>';
    });

    container.innerHTML = '<div class="table-container standings-table">' +
        '<table>' +
            '<thead><tr>' + theadCols + '</tr></thead>' +
            '<tbody>' + rows + '</tbody>' +
        '</table>' +
    '</div>';
}

// Mobile detail: signed difference (DS, DP)
function detailDiffStat(label, value) {
    var n = parseInt(value, 10) || 0;
    var txt = n > 0 ? '+' + n : String(n);
    return '<span class="detail-stat"><em>' + label + '</em> ' + txt + '</span>';
}

// "dd/mm/yyyy" → Date (null for "N/C" or anything unparsable)
function parseFrDate(d) {
    if (!d || d === 'N/C') return null;
    var parts = d.split('/');
    if (parts.length !== 3) return null;
    return new Date(parts[2], parts[1] - 1, parts[0]);
}

// Desktop: full calendar of one team (played + upcoming, by date), like the FSGT site
var CAL_DAYS = ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'];
var CAL_MONTHS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];

// ctx: { played, upcoming, teams } — the championship (DATA) by default, or the Ginette (ginetteMatchCtx)
function champMatchCtx() {
    return { played: DATA.matchesPlayed, upcoming: DATA.matchesUpcoming, teams: DATA.teams };
}

function buildTeamCalendar(teamKey, ctx) {
    ctx = ctx || champMatchCtx();
    var list = [];
    ctx.played.forEach(function(m) {
        if (m.home === teamKey || m.away === teamKey) list.push({ m: m, played: true });
    });
    ctx.upcoming.forEach(function(m) {
        if (m.home === teamKey || m.away === teamKey) list.push({ m: m, played: false });
    });
    list.forEach(function(e, i) { e.order = i; e.d = parseFrDate(e.m.date); });
    list.sort(function(a, b) {
        if (!a.d && !b.d) return a.order - b.order;
        if (!a.d) return 1;   // N/C at the end
        if (!b.d) return -1;
        return (a.d - b.d) || (a.order - b.order);
    });

    var team = ctx.teams[teamKey] || { name: teamKey, short: '?' };
    var nPlayed = 0;
    var nextFound = false;
    var rows = [];
    list.forEach(function(e) {
        var m = e.m;
        var isHome = m.home === teamKey;
        var oppKey = isHome ? m.away : m.home;
        var opp = ctx.teams[oppKey] || { name: oppKey, short: '?' };
        var cls = 'cal-row';
        var result = '<span class="cal-vs">–</span>';
        var sets = '';
        var status;

        if (e.played) {
            nPlayed++;
            var own = isHome ? m.scoreHome : m.scoreAway;
            var other = isHome ? m.scoreAway : m.scoreHome;
            var won = isHome ? !!m.homeWin : !m.homeWin;
            var formCls = won ? 'form-win' : (other - own <= 1 ? 'form-close' : 'form-loss');
            result = '<span class="form-item form-item-sm ' + formCls + '"></span>' +
                '<span class="cal-score ' + (won ? 'winner' : 'loser') + '">' + own + '<span class="separator">-</span>' + other + '</span>';
            if (Array.isArray(m.sets) && m.sets.length) {
                sets = m.sets.map(function(st) {
                    var a = isHome ? st[0] : st[1];
                    var b = isHome ? st[1] : st[0];
                    return '<span class="cal-set' + (a > b ? ' cal-set-won' : '') + '">' + a + '-' + b + '</span>';
                }).join('');
            }
            cls += ' cal-played';
            status = '<span class="status-played">' + esc(m.status) + '</span>';
        } else if (m.status.indexOf('Report') !== -1) {
            cls += ' cal-postponed';
            status = '<span class="status-postponed">' + esc(m.status) + '</span>';
        } else {
            if (!nextFound) {
                nextFound = true;
                cls += ' cal-next';
            }
            status = '<span class="status-upcoming">' + esc(m.status) + '</span>';
        }

        var dateHtml = e.d
            ? '<span class="cal-day">' + CAL_DAYS[e.d.getDay()] + '</span> ' +
              String(e.d.getDate()).padStart(2, '0') + '/' + String(e.d.getMonth() + 1).padStart(2, '0')
            : 'N/C';

        rows.push('<div class="' + cls + '">' +
            '<span class="cal-date">' + dateHtml +
                (m.time ? '<span class="cal-time">' + esc(m.time) + '</span>' : '') +
            '</span>' +
            '<span class="cal-venue' + (isHome ? ' home' : '') + '" title="' + (isHome ? 'Domicile' : 'Extérieur') + '">' + (isHome ? 'D' : 'E') + '</span>' +
            '<span class="cal-opp">' +
                '<span class="team-logo logo-' + esc(oppKey) + '">' + esc(opp.short) + '</span>' +
                '<span class="team-name">' + esc(opp.name) + '</span>' +
            '</span>' +
            '<span class="cal-result">' + result + '</span>' +
            '<span class="cal-sets">' + sets + '</span>' +
            '<span class="cal-status">' + status + '</span>' +
        '</div>');
    });

    var header = '<div class="cal-header">' +
        '<span class="cal-title">Calendrier de ' + esc(team.name) + '</span>' +
        '<span class="cal-counts">' + list.length + ' matchs · ' + nPlayed + ' joués · ' + (list.length - nPlayed) + ' à venir</span>' +
    '</div>';

    if (!rows.length) return '<div class="team-calendar">' + header + '<div class="cal-empty">Aucun match au calendrier</div></div>';

    // Two columns (first half / second half of the season) to keep it short
    var half = Math.ceil(rows.length / 2);
    return '<div class="team-calendar">' + header +
        '<div class="cal-grid">' +
            '<div class="cal-col">' + rows.slice(0, half).join('') + '</div>' +
            '<div class="cal-col">' + rows.slice(half).join('') + '</div>' +
        '</div>' +
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

function toggleMatchDetail(card) {
    const detail = card.nextElementSibling;
    if (!detail || !detail.classList.contains('match-detail')) return;
    const open = detail.classList.toggle('open');
    card.classList.toggle('expanded', open);
    card.setAttribute('aria-expanded', open ? 'true' : 'false');
}

// Set-by-set table shown under a played match (sets: [[home, away], ...], total: [home, away])
function buildSetsDetail(m, homeTeam, awayTeam) {
    var total = m.total;
    if (!total) {
        total = [0, 0];
        m.sets.forEach(function(st) { total[0] += st[0]; total[1] += st[1]; });
    }
    function cell(a, b) {
        return '<td class="' + (a > b ? 'set-won' : '') + '">' + a + '</td>';
    }
    var head = '<th></th>';
    var rowHome = '<th><span class="team-logo logo-' + esc(m.home) + '">' + esc(homeTeam.short) + '</span>' +
        '<span class="set-team-name">' + esc(homeTeam.name) + '</span></th>';
    var rowAway = '<th><span class="team-logo logo-' + esc(m.away) + '">' + esc(awayTeam.short) + '</span>' +
        '<span class="set-team-name">' + esc(awayTeam.name) + '</span></th>';
    m.sets.forEach(function(st, i) {
        head += '<th>S' + (i + 1) + '</th>';
        rowHome += cell(st[0], st[1]);
        rowAway += cell(st[1], st[0]);
    });
    head += '<th class="set-total">Total</th>';
    rowHome += '<td class="set-total ' + (total[0] > total[1] ? 'set-won' : '') + '">' + total[0] + '</td>';
    rowAway += '<td class="set-total ' + (total[1] > total[0] ? 'set-won' : '') + '">' + total[1] + '</td>';
    return '<div class="match-detail">' +
        '<table class="sets-table">' +
            '<thead><tr>' + head + '</tr></thead>' +
            '<tbody><tr>' + rowHome + '</tr><tr>' + rowAway + '</tr></tbody>' +
        '</table>' +
    '</div>';
}

function renderMatches() {
    const container = document.getElementById('matchs-content');
    if (!container || !DATA) return;

    // Build rank lookup for clash detection
    var teamRank = {};
    DATA.standings.forEach(function(s) { teamRank[s.team] = s.rank; });

    container.innerHTML = buildMatchesTab(champMatchCtx(), {
        idPrefix: '',
        // Alternating backgrounds by week ("Sem. 3")
        groupOf: function(m) {
            var semMatch = m.status.match(/Sem\.\s*(\d+)/);
            return semMatch ? parseInt(semMatch[1]) : null;
        },
        badgeOf: function(m) {
            var rH = teamRank[m.home] || 99;
            var rA = teamRank[m.away] || 99;
            if (rH <= 3 && rA <= 3) return '<span class="clash-badge clash-top3" title="Choc au sommet">\uD83D\uDD25</span>';
            if (rH <= 5 && rA <= 5) return '<span class="clash-badge clash-top5" title="Affiche">\u26A1</span>';
            return '';
        }
    });
}

// "Résultats" (folded) + "À venir" sections, shared by the championships and the Ginette.
// ctx: { played, upcoming, teams }; opts: { idPrefix, groupOf(m) → number for alternating backgrounds, badgeOf(m) }
function buildMatchesTab(ctx, opts) {
    var teams = ctx.teams;
    var playedId = opts.idPrefix + 'played-matches-content';
    var upcomingId = opts.idPrefix + 'upcoming-matches-content';

    // Played matches
    let playedCards = '';
    ctx.played.forEach(function(m) {
        const homeTeam = teams[m.home];
        const awayTeam = teams[m.away];
        if (!homeTeam || !awayTeam) return;
        const hasSets = Array.isArray(m.sets) && m.sets.length > 0;
        playedCards += '<div class="match-card' + (hasSets ? ' match-card-clickable' : '') + (m.forfeit ? ' match-card-forfeit' : '') + '"' +
            (hasSets ? ' onclick="toggleMatchDetail(this)" role="button" tabindex="0" aria-expanded="false"' +
                ' onkeydown="if(event.key===\'Enter\'||event.key===\' \'){event.preventDefault();toggleMatchDetail(this);}"' : '') + '>' +
            '<div class="match-date">' + esc(m.date) + (m.forfeit ? '<span class="forfeit-badge">Forfait</span>' : '') + '</div>' +
            '<div class="match-teams">' +
                '<div class="match-team home">' +
                    '<span class="team-name">' + esc(homeTeam.name) + '</span>' +
                    '<div class="team-logo logo-' + esc(m.home) + '">' + esc(homeTeam.short) + '</div>' +
                '</div>' +
                '<div class="match-score">' +
                    '<span class="' + (m.homeWin ? 'winner' : 'loser') + '">' + m.scoreHome + '</span>' +
                    '<span class="separator">-</span>' +
                    '<span class="' + (m.homeWin ? 'loser' : 'winner') + '">' + m.scoreAway + '</span>' +
                '</div>' +
                '<div class="match-team away">' +
                    '<div class="team-logo logo-' + esc(m.away) + '">' + esc(awayTeam.short) + '</div>' +
                    '<span class="team-name">' + esc(awayTeam.name) + '</span>' +
                '</div>' +
            '</div>' +
            '<div class="match-status"><span class="status-played">' + esc(m.status) + '</span>' +
                (hasSets ? '<span class="match-detail-arrow">&#9660;</span>' : '') +
            '</div>' +
        '</div>' +
        (hasSets ? buildSetsDetail(m, homeTeam, awayTeam) : '');
    });

    // Sort upcoming matches by date (N/C first)
    var sortedUpcoming = ctx.upcoming.slice().sort(function(a, b) {
        var da = parseFrDate(a.date);
        var db = parseFrDate(b.date);
        if (!da && !db) return 0;
        if (!da) return -1;
        if (!db) return 1;
        return da - db;
    });

    // Group (week or round) for alternating backgrounds
    var groupSet = new Set();
    sortedUpcoming.forEach(function(m) {
        var g = opts.groupOf(m);
        if (g != null) groupSet.add(g);
    });
    var groupIndex = {};
    Array.from(groupSet).sort(function(a, b) { return a - b; })
        .forEach(function(g, i) { groupIndex[g] = i; });

    let upcomingCards = '';
    sortedUpcoming.forEach(function(m) {
        const homeTeam = teams[m.home];
        const awayTeam = teams[m.away];
        if (!homeTeam || !awayTeam) return;
        const isPostponed = m.status.includes('Report');
        const statusClass = isPostponed ? 'status-postponed' : 'status-upcoming';

        let cardClasses = 'match-card';
        if (isPostponed) {
            cardClasses += ' match-card-postponed';
        } else {
            var g = opts.groupOf(m);
            if (g != null && groupIndex[g] % 2 === 0) cardClasses += ' match-card-sem-even';
        }

        upcomingCards += '<div class="' + cardClasses + '">' +
            '<div class="match-date">' + esc(m.date) + (opts.badgeOf ? opts.badgeOf(m) : '') + '</div>' +
            '<div class="match-teams">' +
                '<div class="match-team home">' +
                    '<span class="team-name">' + esc(homeTeam.name) + '</span>' +
                    '<div class="team-logo logo-' + esc(m.home) + '">' + esc(homeTeam.short) + '</div>' +
                '</div>' +
                '<div class="match-score">' +
                    '<span class="separator">-</span>' +
                '</div>' +
                '<div class="match-team away">' +
                    '<div class="team-logo logo-' + esc(m.away) + '">' + esc(awayTeam.short) + '</div>' +
                    '<span class="team-name">' + esc(awayTeam.name) + '</span>' +
                '</div>' +
            '</div>' +
            '<div class="match-status"><span class="' + statusClass + '">' + esc(m.status) + '</span></div>' +
        '</div>';
    });

    // Part de la saison jouée / restante (sur le total des matchs du calendrier)
    var nPlayed = ctx.played.length;
    var nUpcoming = ctx.upcoming.length;
    var nTotal = nPlayed + nUpcoming;
    var pctPlayed = nTotal ? Math.round(nPlayed / nTotal * 100) : 0;
    var pctUpcoming = nTotal ? 100 - pctPlayed : 0;

    return '<div class="matches-section">' +
            '<div class="section-header header-collapsed" onclick="toggleMatchSection(\'' + playedId + '\')">' +
                '<h3 class="section-title">R\u00e9sultats</h3>' +
                '<span class="section-badge">' + nPlayed + ' matchs</span>' +
                '<span class="section-badge">' + pctPlayed + ' % jou\u00e9s</span>' +
                '<span class="section-arrow collapsed">&#9660;</span>' +
            '</div>' +
            '<div id="' + playedId + '" class="section-collapsible collapsed">' +
                playedCards +
            '</div>' +
        '</div>' +
        '<div class="matches-section">' +
            '<div class="section-header" onclick="toggleMatchSection(\'' + upcomingId + '\')">' +
                '<h3 class="section-title">\u00c0 venir</h3>' +
                '<span class="section-badge">' + nUpcoming + ' matchs</span>' +
                '<span class="section-badge">' + pctUpcoming + ' % \u00e0 venir</span>' +
                '<span class="section-arrow">&#9660;</span>' +
            '</div>' +
            '<div id="' + upcomingId + '" class="section-collapsible">' +
                upcomingCards +
            '</div>' +
        '</div>';
}

// Score du Power Ranking sur une échelle fixe : 1500 (ELO de départ) = 50, ±200 points
// d'ELO = ±50. Remplace le « power » du script (min/max de la poule, 0 forcé sans victoire),
// qui affichait beaucoup de 0 et mettait toujours le premier à 100.
var PR_ELO_CENTER = 1500;
var PR_ELO_SPAN = 200;
function prScoreFromElo(elo) {
    var v = 50 + (elo - PR_ELO_CENTER) / PR_ELO_SPAN * 50;
    return Math.max(0, Math.min(100, v));
}

function renderPRTeams() {
    const container = document.getElementById('pr-equipes-content');
    if (!container || !DATA) return;

    // Une équipe sans match joué reste à l'ELO de départ : on ne la classe pas,
    // elle passe en bas avec « — » (sinon elle s'intercale au milieu avec un score à 0)
    function hasPlayed(r) {
        return (r.record || '0-0').split('-').some(function(n) { return parseInt(n, 10) > 0; });
    }
    var played = DATA.prTeams.filter(hasPlayed);
    var notPlayed = DATA.prTeams.filter(function(r) { return !hasPlayed(r); });

    let rows = '';
    played.forEach(function(r, i) {
        const team = DATA.teams[r.team];
        if (!team) return;
        r = Object.assign({}, r, { rank: i + 1 });
        const barClass = r.rank <= 10 ? 'bar-rank-' + r.rank : 'bar-rank-rest';
        const mvtClass = r.movement > 0 ? 'elo-up' : r.movement < 0 ? 'elo-down' : 'elo-neutral';
        const mvtArrow = r.movement > 0 ? '\u25b2' : r.movement < 0 ? '\u25bc' : '';
        const mvtText = r.movement > 0 ? '+' + r.movement : r.movement < 0 ? '' + r.movement : '-';
        const power = (typeof r.elo === 'number') ? prScoreFromElo(r.elo) : r.power;
        const score = Math.round(power);
        rows += '<tr>' +
            '<td class="pr-rank">' + r.rank + '</td>' +
            '<td><div class="team-cell"><div class="team-logo logo-' + r.team + '">' + esc(team.short) + '</div><span class="team-name">' + esc(team.name) + '</span></div></td>' +
            '<td class="center"><span class="record-text">' + esc(r.record) + '</span></td>' +
            '<td class="center"><span class="pr-value">' + score + '</span></td>' +
            '<td class="center col-opt"><div class="pr-bar-container"><div class="pr-bar"><div class="pr-bar-fill ' + barClass + '" style="width: ' + power.toFixed(1) + '%;"></div></div></div></td>' +
            '<td class="center"><span class="elo-movement ' + mvtClass + '">' + mvtArrow + ' ' + mvtText + '</span></td>' +
            '<td class="center col-opt"><span class="difficulty-badge ' + r.diffClass + '">' + esc(r.calendar) + '</span></td>' +
        '</tr>';
    });
    notPlayed.forEach(function(r) {
        const team = DATA.teams[r.team];
        if (!team) return;
        rows += '<tr class="pr-not-played">' +
            '<td class="pr-rank">\u2014</td>' +
            '<td><div class="team-cell"><div class="team-logo logo-' + r.team + '">' + esc(team.short) + '</div><span class="team-name">' + esc(team.name) + '</span></div></td>' +
            '<td class="center"><span class="record-text">' + esc(r.record) + '</span></td>' +
            '<td class="center"><span class="pr-value">\u2014</span></td>' +
            '<td class="center col-opt"></td>' +
            '<td class="center"><span class="elo-movement elo-neutral">-</span></td>' +
            '<td class="center col-opt"><span class="difficulty-badge ' + r.diffClass + '">' + esc(r.calendar) + '</span></td>' +
        '</tr>';
    });

    container.innerHTML = '<div class="table-container">' +
        '<table class="pr-table">' +
            '<thead><tr>' +
                '<th style="width: 40px;">#</th>' +
                '<th>\u00c9quipe</th>' +
                '<th class="center">V-D</th>' +
                '<th class="center">Score</th>' +
                '<th class="center col-opt" style="width: 150px;"></th>' +
                '<th class="center">Mvt</th>' +
                '<th class="center col-opt">Forme</th>' +
            '</tr></thead>' +
            '<tbody>' + rows + '</tbody>' +
        '</table>' +
    '</div>';
}

// ------------------------------------------------------------
// 7. Ginette cross-division ranking
// ------------------------------------------------------------

var GINETTE_DIV_COLORS = {
    "ultimate": "#212121",
    "elite": "#1a73e8",
    "hard": "#9b59b6",
    "medium": "#34a853",
    "easy": "#f39c12",
    "starter": "#ff5722",
    "or6x6": "#e91e63",
    "argent": "#607d8b"
};

// Ginette teams come from every division: logo (short + color) taken from the championship JSONs,
// loaded once (loadGinetteTeamInfo). Keys 'g0', 'g1'… so the championship match/calendar code can be reused.
var GINETTE_TEAM_INFO = null;   // team name → { short, color }
var GINETTE_CTX = null;         // { played, upcoming, teams, keyOf }

var GINETTE_ROUND_ORDER = ['Tour 1', 'Tour 2', '1/8 Principale', '1/8 Consolante', '1/4 Principale', '1/4 Consolante',
    '1/2 Principale', '1/2 Consolante', 'Finale Principale', 'Finale Consolante'];

function ginetteRoundLabel(round) {
    return String(round || '').replace(/^1\/8\b/, '1/8ème');
}

async function loadGinetteTeamInfo() {
    if (GINETTE_TEAM_INFO) return;
    var info = {};
    var slugs = (CHAMPIONSHIPS ? CHAMPIONSHIPS.championships : [])
        .filter(function(c) { return c.format !== 'coupe'; })
        .map(function(c) { return c.slug; });
    await Promise.all(slugs.map(async function(slug) {
        try {
            var resp = await fetch('data/' + slug + '.json', FETCH_FRESH);
            if (!resp.ok) return;
            var d = await resp.json();
            Object.keys(d.teams || {}).forEach(function(k) {
                var t = d.teams[k];
                if (t && t.name && !info[t.name]) info[t.name] = { short: t.short, color: t.color };
            });
        } catch (e) { /* logo falls back to initials + division color */ }
    }));
    GINETTE_TEAM_INFO = info;
}

function ginetteInitials(name) {
    var words = String(name).replace(/[^A-Za-zÀ-ÿ0-9 ]/g, ' ').split(/\s+/).filter(Boolean);
    if (!words.length) return '?';
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
    return (words[0][0] + words[1][0]).toUpperCase();
}

function buildGinetteCtx() {
    var teams = {};
    var keyByName = {};
    var info = GINETTE_TEAM_INFO || {};
    function keyOf(name, division) {
        if (keyByName[name]) return keyByName[name];
        var key = 'g' + Object.keys(keyByName).length;
        keyByName[name] = key;
        var i = info[name] || {};
        teams[key] = {
            name: name,
            short: i.short || ginetteInitials(name),
            color: i.color || GINETTE_DIV_COLORS[division] || '#999'
        };
        return key;
    }
    var played = [];
    var upcoming = [];
    GINETTE_DATA.matches.forEach(function(m, idx) {
        var home = keyOf(m.home, m.homeDivision);
        var away = keyOf(m.away, m.awayDivision);
        var isUpcoming = m.upcoming === true || (m.winner == null && (m.homeSets == null || m.awaySets == null));
        var label = ginetteRoundLabel(m.round);
        var x = { date: m.date || 'N/C', time: m.time, home: home, away: away, round: m.round, order: idx };
        if (isUpcoming) {
            x.status = label;
            upcoming.push(x);
            return;
        }
        x.scoreHome = m.homeSets;
        x.scoreAway = m.awaySets;
        x.homeWin = m.winner === m.home;
        x.forfeit = !!m.forfeit;
        x.status = label;
        if (!m.forfeit && m.homeScores && m.homeScores.length) {
            x.sets = m.homeScores.map(function(h, i) { return [h, m.awayScores[i]]; });
        }
        played.push(x);
    });
    // Results: most recent first, as in the championships (round, then date)
    function dateVal(x) { var d = parseFrDate(x.date); return d ? d.getTime() : 0; }
    played.sort(function(a, b) {
        return (GINETTE_ROUND_ORDER.indexOf(b.round) - GINETTE_ROUND_ORDER.indexOf(a.round)) ||
            (dateVal(b) - dateVal(a)) || (a.order - b.order);
    });

    var css = '';
    Object.keys(teams).forEach(function(k) { css += '.logo-' + k + ' { background: ' + teams[k].color + '; }\n'; });
    var style = document.getElementById('ginette-team-styles');
    if (!style) {
        style = document.createElement('style');
        style.id = 'ginette-team-styles';
        document.head.appendChild(style);
    }
    style.textContent = css;

    GINETTE_CTX = { played: played, upcoming: upcoming, teams: teams, keyOf: function(n) { return keyByName[n]; } };
    return GINETTE_CTX;
}

// Matchs tab. Before the 1/8 draw: just Résultats + À venir for the Tours.
// Once the 1/8 are drawn: three folding menus (Tours 1-2, Principale, Consolante), each with Résultats + À venir.
var GINETTE_PHASES = [
    { id: 'tours', label: 'Tours 1-2', match: function(r) { return r === 'Tour 1' || r === 'Tour 2'; } },
    { id: 'principale', label: 'Principale', match: function(r) { return / Principale$/.test(r); } },
    { id: 'consolante', label: 'Consolante', match: function(r) { return / Consolante$/.test(r); } }
];
var ginettePhaseOpen = null;   // phase id → open (kept across re-renders)

function ginettePhaseStatus(round) {
    // Within a phase the suffix is redundant: "1/8 Principale" → "1/8ème"
    return ginetteRoundLabel(String(round).replace(/ (Principale|Consolante)$/, ''));
}

function renderGinetteMatches() {
    var container = document.getElementById('ginette-matchs-content');
    if (!container || !GINETTE_CTX) return;

    var phases = GINETTE_PHASES.map(function(ph) {
        function pick(list) {
            return list.filter(function(m) { return ph.match(m.round); })
                .map(function(m) { return Object.assign({}, m, { status: ginettePhaseStatus(m.round) }); });
        }
        return { ph: ph, ctx: { played: pick(GINETTE_CTX.played), upcoming: pick(GINETTE_CTX.upcoming), teams: GINETTE_CTX.teams } };
    });
    function body(x) {
        return buildMatchesTab(x.ctx, {
            idPrefix: 'ginette-' + x.ph.id + '-',
            // Alternating backgrounds by round
            groupOf: function(m) {
                var i = GINETTE_ROUND_ORDER.indexOf(m.round);
                return i === -1 ? null : i;
            }
        });
    }

    var drawn = phases.slice(1).some(function(x) { return x.ctx.played.length || x.ctx.upcoming.length; });
    if (!drawn) {
        container.innerHTML = body(phases[0]);
        return;
    }

    // Open by default: the phase in progress (matches to come), else the last one with results
    if (!ginettePhaseOpen) {
        var current = phases.find(function(x) { return x.ctx.upcoming.length; }) ||
            phases.slice().reverse().find(function(x) { return x.ctx.played.length; }) || phases[0];
        ginettePhaseOpen = {};
        ginettePhaseOpen[current.ph.id] = true;
    }

    container.innerHTML = phases.map(function(x) {
        var open = !!ginettePhaseOpen[x.ph.id];
        var id = 'ginette-phase-' + x.ph.id;
        var n = x.ctx.played.length + x.ctx.upcoming.length;
        return '<div class="matches-section ginette-phase">' +
            '<div class="section-header ginette-phase-header' + (open ? '' : ' header-collapsed') + '" onclick="toggleGinettePhase(\'' + x.ph.id + '\')">' +
                '<h3 class="section-title">' + x.ph.label + '</h3>' +
                '<span class="section-badge">' + n + ' matchs</span>' +
                '<span class="section-arrow' + (open ? '' : ' collapsed') + '">&#9660;</span>' +
            '</div>' +
            '<div id="' + id + '" class="section-collapsible ginette-phase-body' + (open ? '' : ' collapsed') + '">' +
                (n ? body(x) : '<p class="ginette-standings-note">Aucun match pour l’instant.</p>') +
            '</div>' +
        '</div>';
    }).join('');
}

function toggleGinettePhase(phaseId) {
    ginettePhaseOpen[phaseId] = !ginettePhaseOpen[phaseId];
    toggleMatchSection('ginette-phase-' + phaseId);
}

// Classement après les tours 1 et 2, calculé comme en championnat :
// victoire 3 pts, défaite serrée (1 set d'écart ou 2-2) 2 pts, défaite 1 pt, forfait 0,
// moins les points de pénalité publiés par le site (penalties : { équipe: points }).
// 1-16 → poule principale, 17-32 → poule consolante, au-delà → éliminé.
function computeGinetteStandings(matches, penalties) {
    var byTeam = {};
    var order = [];
    function entry(name, division) {
        if (!byTeam[name]) {
            byTeam[name] = { team: name, division: division, drawOrder: order.length, mj: 0, g: 0, p: 0,
                setPlus: 0, setMinus: 0, ptsPlus: 0, ptsMinus: 0, pts: 0, penalty: 0, results: [] };
            order.push(name);
        }
        return byTeam[name];
    }
    function sum(arr) { return (arr || []).reduce(function(a, b) { return a + b; }, 0); }

    matches.forEach(function(m) {
        if (m.round !== 'Tour 1' && m.round !== 'Tour 2') return;
        var home = entry(m.home, m.homeDivision);
        var away = entry(m.away, m.awayDivision);
        var played = m.winner != null && m.homeSets != null && m.awaySets != null;
        [[home, m.homeSets, m.awaySets, m.homeScores, m.awayScores, m.away],
         [away, m.awaySets, m.homeSets, m.awayScores, m.homeScores, m.home]].forEach(function(x) {
            var t = x[0];
            var round = m.round === 'Tour 1' ? 'T1' : 'T2';
            if (!played) {
                t.results.push({ round: round, opponent: x[5], status: 'P' });
                return;
            }
            var win = m.winner === t.team;
            t.mj++;
            t.setPlus += x[1];
            t.setMinus += x[2];
            t.ptsPlus += sum(x[3]);
            t.ptsMinus += sum(x[4]);
            var status;
            if (win) { t.g++; t.pts += 3; status = 'W'; }
            else {
                t.p++;
                if (m.forfeit) status = 'F';
                else if (Math.abs(x[1] - x[2]) <= 1) { t.pts += 2; status = 'C'; }
                else { t.pts += 1; status = 'L'; }
            }
            t.results.push({ round: round, opponent: x[5], status: status, sets: x[1] + '-' + x[2] });
        });
    });

    function ratio(a, b) { return b ? a / b : (a ? Infinity : 0); }
    var list = order.map(function(n) {
        var t = byTeam[n];
        t.penalty = (penalties && penalties[n]) || 0;
        t.pts -= t.penalty;
        t.setAvg = ratio(t.setPlus, t.setMinus);
        t.ptsAvg = ratio(t.ptsPlus, t.ptsMinus);
        return t;
    });
    // Sans résultat, l'ordre reste celui du tirage (comme sur le site)
    list.sort(function(a, b) {
        return (b.pts - a.pts) || (b.setAvg - a.setAvg) || (b.ptsAvg - a.ptsAvg) || (a.drawOrder - b.drawOrder);
    });
    list.forEach(function(t, i) {
        t.rank = i + 1;
        t.zone = t.rank <= 16 ? 'principale' : (t.rank <= 32 ? 'consolante' : 'elimine');
    });
    return list;
}

function renderGinetteStandings() {
    var container = document.getElementById('ginette-standings-content');
    if (!container || !GINETTE_DATA) return;
    var list = computeGinetteStandings(GINETTE_DATA.matches, GINETTE_DATA.penalties);
    if (!list.length) {
        container.innerHTML = '<p class="ginette-standings-note">Aucun match de tour 1 ou 2 pour l’instant.</p>';
        return;
    }
    var anyPlayed = list.some(function(t) { return t.mj > 0; });

    function fmtAvg(v, played) {
        if (!played) return '-';
        return v === Infinity ? 'MAX' : v.toFixed(2);
    }
    var statusLabels = { W: 'V', C: 'D', L: 'D', F: 'Forfait', P: 'À venir' };
    function resultsHtml(t) {
        return t.results.map(function(r) {
            var cls = r.status === 'W' ? 'form-win' : (r.status === 'C' ? 'form-close' : (r.status === 'P' ? 'form-pending' : 'form-loss'));
            var label = statusLabels[r.status] + (r.sets && r.status !== 'F' ? ' ' + r.sets : '');
            return '<span class="detail-stat"><span class="form-item form-item-sm ' + cls + '"></span>' +
                '<em>' + r.round + '</em> ' + esc(label) + ' vs ' + esc(r.opponent) + '</span>';
        }).join('');
    }

    var rows = '';
    list.forEach(function(t) {
        var key = 'ginette:' + t.team;
        var expanded = !!standingsExpanded[key];
        var divColor = GINETTE_DIV_COLORS[t.division] || '#999';
        var divLabel = DIV_LABELS_JS[t.division] || t.division || '';
        var played = t.mj > 0;
        var zoneBreak = (t.rank === 17 || t.rank === 33) ? ' ginette-zone-break' : '';
        var calOpen = !!standingsCalendarOpen[key];
        var teamKey = GINETTE_CTX ? GINETTE_CTX.keyOf(t.team) : null;
        rows += '<tr class="standings-row ginette-zone-' + t.zone + zoneBreak + (expanded ? ' expanded' : '') + (calOpen ? ' cal-open' : '') + '" data-team="' + esc(key) + '">' +
            '<td>' +
                '<div class="team-cell">' +
                    '<div class="rank-indicator"></div>' +
                    '<span class="row-chevron">&#9656;</span>' +
                    '<span class="rank-number">' + t.rank + '</span>' +
                    (divLabel ? '<span class="division-badge division-badge-sm" style="background: ' + divColor + ';">' + esc(divLabel) + '</span>' : '') +
                    '<span class="team-name">' + esc(t.team) + '</span>' +
                '</div>' +
            '</td>' +
            '<td>' + t.mj + '</td>' +
            '<td>' + t.g + '</td>' +
            '<td>' + t.p + '</td>' +
            '<td class="col-opt">' + t.setPlus + '</td>' +
            '<td class="col-opt">' + t.setMinus + '</td>' +
            '<td>' + fmtAvg(t.setAvg, played) + '</td>' +
            '<td class="col-opt">' + t.ptsPlus + '</td>' +
            '<td class="col-opt">' + t.ptsMinus + '</td>' +
            '<td class="col-opt">' + fmtAvg(t.ptsAvg, played) + '</td>' +
            '<td class="col-opt">' + (t.penalty ? '-' + t.penalty : '0') + '</td>' +
            '<td class="bold-val">' + t.pts + '</td>' +
        '</tr>' +
        '<tr class="standings-detail ginette-zone-' + t.zone + (expanded ? ' expanded' : '') + '" data-team="' + esc(key) + '">' +
            '<td colspan="6">' +
                '<div class="detail-line">' +
                    '<span class="detail-label">Sets</span>' +
                    '<span class="detail-stat"><em>Set+</em> ' + t.setPlus + '</span>' +
                    '<span class="detail-stat"><em>Set-</em> ' + t.setMinus + '</span>' +
                    '<span class="detail-stat"><em>Avg</em> ' + fmtAvg(t.setAvg, played) + '</span>' +
                '</div>' +
                '<div class="detail-line">' +
                    '<span class="detail-label">Points</span>' +
                    '<span class="detail-stat"><em>Pts+</em> ' + t.ptsPlus + '</span>' +
                    '<span class="detail-stat"><em>Pts-</em> ' + t.ptsMinus + '</span>' +
                    '<span class="detail-stat"><em>Avg</em> ' + fmtAvg(t.ptsAvg, played) + '</span>' +
                    '<span class="detail-stat"><em>Pén.</em> ' + (t.penalty ? '-' + t.penalty : '0') + '</span>' +
                '</div>' +
                '<div class="detail-line">' +
                    '<span class="detail-label">Matchs</span>' + resultsHtml(t) +
                '</div>' +
            '</td>' +
        '</tr>' +
        // Desktop: the team's Ginette calendar, as in the championships
        (teamKey ? '<tr class="standings-calendar ginette-zone-' + t.zone + (calOpen ? ' open' : '') + '" data-team="' + esc(key) + '">' +
            '<td colspan="12">' + buildTeamCalendar(teamKey, GINETTE_CTX) + '</td>' +
        '</tr>' : '');
    });

    container.innerHTML =
        (anyPlayed ? '' : '<p class="ginette-standings-note">Aucun match joué pour l’instant : les équipes sont dans l’ordre du tirage.</p>') +
        '<div class="table-container standings-table ginette-standings">' +
            '<table>' +
                '<thead><tr>' +
                    '<th>Équipe</th><th>MJ</th><th>V</th><th>D</th>' +
                    '<th class="col-opt">Set+</th><th class="col-opt">Set-</th><th>Set avg</th>' +
                    '<th class="col-opt">Pts+</th><th class="col-opt">Pts-</th><th class="col-opt">Pts avg</th><th class="col-opt">Pén.</th>' +
                    '<th class="bold-col">Pts</th>' +
                '</tr></thead>' +
                '<tbody>' + rows + '</tbody>' +
            '</table>' +
        '</div>';
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
                    '<span class="team-name">' + esc(r.name) + '</span>' +
                '</div>' +
            '</td>' +
            '<td class="center"><span class="division-badge" style="background: ' + divColor + ';">' + esc(r.division) + '</span></td>' +
            '<td class="center"><span class="pr-value">' + Math.round(r.elo) + '</span></td>' +
            '<td class="center col-opt"><div class="pr-bar-container"><div class="pr-bar"><div class="pr-bar-fill ' + barClass + '" style="width: ' + r.power + '%;"></div></div></div></td>' +
            '<td class="center"><span class="elo-movement ' + deltaClass + '">' + deltaArrow + ' ' + deltaText + '</span></td>' +
            '<td class="center col-opt"><span class="record-text">' + esc(r.record) + '</span></td>' +
            '<td class="center col-opt"><div class="form-container" style="justify-content: center;">' + formHtml + '</div></td>' +
        '</tr>';
    });

    var rankingHtml = '<div class="table-container">' +
        '<table class="pr-table">' +
            '<thead><tr>' +
                '<th style="width: 40px;">#</th>' +
                '<th>\u00c9quipe</th>' +
                '<th class="center">Division</th>' +
                '<th class="center">ELO</th>' +
                '<th class="center col-opt" style="width: 120px;"></th>' +
                '<th class="center">\u0394</th>' +
                '<th class="center col-opt">V-D</th>' +
                '<th class="center col-opt">Forme</th>' +
            '</tr></thead>' +
            '<tbody>' + rows + '</tbody>' +
        '</table>' +
    '</div>';

    // ── Division stats ──
    var divRows = '';
    divStats.forEach(function(d) {
        var divColor = GINETTE_DIV_COLORS[d.slug] || '#999';
        divRows += '<tr>' +
            '<td><span class="division-badge" style="background: ' + divColor + ';">' + esc(d.name) + '</span></td>' +
            '<td class="center">' + d.teams + '</td>' +
            '<td class="center"><strong>' + Math.round(d.avgElo) + '</strong></td>' +
            '<td class="center col-opt">' + Math.round(d.maxElo) + '</td>' +
            '<td class="center col-opt">' + Math.round(d.minElo) + '</td>' +
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
                    '<th class="center col-opt">Max</th>' +
                    '<th class="center col-opt">Min</th>' +
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
                '<strong>' + esc(u.winner) + '</strong> ' +
                '<span class="division-badge division-badge-sm" style="background: ' + wColor + ';">' + esc(u.winnerDiv) + '</span>' +
                ' bat ' +
                '<strong>' + esc(u.loser) + '</strong> ' +
                '<span class="division-badge division-badge-sm" style="background: ' + lColor + ';">' + esc(u.loserDiv) + '</span>' +
                ' <span class="upset-score">' + esc(u.score) + '</span>' +
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
    "ultimate": "Ultimate",
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

    const cs = getComputedStyle(container);
    const innerWidth = container.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    const isSmall = innerWidth < 600;
    const width = Math.min(innerWidth, 900);
    const height = isSmall ? Math.max(300, Math.round(width * 0.95)) : 600;
    const dpr = window.devicePixelRatio || 1;

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const iconAreaWidth = isSmall ? 30 : 80;
    const padding = isSmall
        ? { top: 20, right: 8 + iconAreaWidth, bottom: 44, left: 38 }
        : { top: 30, right: 30 + iconAreaWidth, bottom: 50, left: 50 };
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
    for (let i = 0; i <= maxPoints; i += 3) { // 3 pts = une victoire
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

// Desktop: click a team row to unfold / fold its full calendar
document.addEventListener('click', function(e) {
    var row = e.target.closest('.standings-row');
    if (!row || window.matchMedia('(max-width: 760px)').matches) return;
    var team = row.getAttribute('data-team');
    var cal = row.nextElementSibling;
    while (cal && !cal.classList.contains('standings-calendar')) {
        if (cal.classList.contains('standings-row')) { cal = null; break; }
        cal = cal.nextElementSibling;
    }
    if (!cal) return;
    standingsCalendarOpen[team] = !standingsCalendarOpen[team];
    row.classList.toggle('cal-open', standingsCalendarOpen[team]);
    cal.classList.toggle('open', standingsCalendarOpen[team]);
});

// Mobile: tap a team row to unfold / fold its details
document.addEventListener('click', function(e) {
    var row = e.target.closest('.standings-row');
    if (!row || !window.matchMedia('(max-width: 760px)').matches) return;
    var team = row.getAttribute('data-team');
    standingsExpanded[team] = !standingsExpanded[team];
    row.classList.toggle('expanded', standingsExpanded[team]);
    var detail = row.nextElementSibling;
    if (detail && detail.classList.contains('standings-detail')) detail.classList.toggle('expanded', standingsExpanded[team]);
});

// Delegated click handler for standings column sorting
document.addEventListener('click', function(e) {
    var th = e.target.closest('.standings-sortable');
    if (!th) return;
    var col = th.getAttribute('data-sort-col');
    if (!col) return;

    if (col === 'pp' && standingsSort.col === 'pp') {
        // Clic sur « Club » : simple bascule tri points perdus ↔ classement officiel
        standingsSort = { col: null, asc: true };
    } else if (standingsSort.col === col) {
        // Same column: toggle asc/desc, then reset on third click
        if (standingsSort.asc === !ASC_DEFAULT_COLS[col]) {
            // Was on non-default order → reset to official rank
            standingsSort = { col: null, asc: true };
        } else {
            // Toggle direction
            standingsSort.asc = !standingsSort.asc;
        }
    } else {
        // New column: default direction (desc, or asc for "less is better")
        standingsSort = { col: col, asc: !!ASC_DEFAULT_COLS[col] };
    }
    renderStandings();
});
