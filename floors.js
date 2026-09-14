/**
 * floors.js — floor plan + room reassignment, wired into the main site
 *
 * Layout this drives (see index.html):
 *   #pane-floors > #floorsPaneContent   — sidebar: building/floor list,
 *                                          room list, reassignment panel
 *   #floorPlanArea (inside #map)        — visual floor plan, overlays
 *                                          the map canvas only
 *
 * Entry points other files call:
 *   FloorUI.onTabShown()      — Floors tab clicked in the tab bar / FAB
 *   FloorUI.openFromCard(bid) — "View Floors" clicked on a building card
 *   FloorUI.closeFloorPlan()  — "Back to map" clicked on the plan overlay
 * Everything else is internal (exposed only because inline onclick=""
 * handlers need a path to it).
 */

const FloorUI = (function () {
  let buildingId = null;   // currently open building, or null = picker
  let building = null;     // FLOOR_DATA[buildingId]
  let currentFloor = null; // the floor object within building.floors
  let selectedRoomId = null;
  let roomSearch = '';

  const HISTORY_KEY = 'campusnav-floor-history';

  function loadAllHistory() {
    try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || '{}'); }
    catch (_) { return {}; }
  }
  function loadHistory(roomId) { return loadAllHistory()[roomId] || []; }
  function pushHistory(roomId, entry) {
    const all = loadAllHistory();
    if (!all[roomId]) all[roomId] = [];
    all[roomId].unshift(entry);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(all));
  }

  function el(id) { return document.getElementById(id); }

  /* ── ENTRY POINTS ──────────────────────────────────── */
  function onTabShown() {
    // Re-render whatever state we're already in (idempotent). If nothing
    // has ever been opened, this shows the building picker.
    renderSidebar();
  }

  function openFromCard(bid) {
    bid = String(bid);
    if (!FLOOR_DATA[bid]) return;
    buildingId = bid;
    building = FLOOR_DATA[bid];
    currentFloor = null;
    selectedRoomId = null;
    roomSearch = '';
    hideFloorPlan();
    switchTab('floors'); // triggers FloorUI.onTabShown() -> renders the floor list
  }

  function closeFloorPlan() {
    currentFloor = null;
    selectedRoomId = null;
    roomSearch = '';
    hideFloorPlan();
    renderSidebar();
  }

  /* ── SIDEBAR: dispatch by current state ───────────────*/
  function renderSidebar() {
    if (!buildingId) return renderBuildingPicker();
    if (!currentFloor) return renderFloorList();
    return renderRoomList();
  }

  /* ── SIDEBAR: building picker (Floors tab opened directly) ── */
  function renderBuildingPicker() {
    const ids = Object.keys(FLOOR_DATA);
    const rows = ids.map(bid => {
      const b = BUILDINGS[bid];
      const fd = FLOOR_DATA[bid];
      if (!b) return '';
      return `<div class="floor-row" onclick="FloorUI._pickBuilding('${bid}')">
        <div class="floor-badge">${fd.floors.length}</div>
        <div class="floor-info">
          <div class="floor-label">${b.name}</div>
          <div class="floor-meta">${fd.alias ? fd.alias + ' · ' : ''}${fd.floors.length} floor${fd.floors.length === 1 ? '' : 's'}</div>
        </div>
        <svg class="floor-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg>
      </div>`;
    }).join('');

    el('floorsPaneContent').innerHTML = `
      <div class="floors-scroll">
        <div class="floor-list-page">
          <div class="page-title">Floors</div>
          <div class="page-sub">Pick a building to view its floors and reassign rooms</div>
          ${rows || '<div class="side-panel-empty">No digitized buildings yet</div>'}
        </div>
      </div>`;
  }

  function pickBuilding(bid) {
    buildingId = bid;
    building = FLOOR_DATA[bid];
    currentFloor = null;
    selectedRoomId = null;
    renderSidebar();
  }

  /* ── SIDEBAR: floor list for the open building ────────────── */
  function renderFloorList() {
    const b = BUILDINGS[buildingId];
    const rows = building.floors.map(f => {
      if (!f.digitized) {
        return `<div class="floor-row not-digitized">
          <div class="floor-badge">${f.floor}</div>
          <div class="floor-info">
            <div class="floor-label">${f.label}</div>
            <div class="floor-meta">Not yet digitized</div>
          </div>
        </div>`;
      }
      const assignable = f.rooms.filter(r => r.assignable);
      const unassignedCount = assignable.filter(r => r.department === 'Unassigned').length;
      const summary = assignable.length === 0
        ? 'No assignable rooms'
        : unassignedCount === assignable.length
          ? `${assignable.length} rooms · none assigned yet`
          : `${assignable.length} rooms · ${new Set(assignable.map(r => r.department)).size - (unassignedCount ? 1 : 0)} departments`;
      return `<div class="floor-row" onclick="FloorUI._openFloor(${f.floor})">
        <div class="floor-badge">${f.floor}</div>
        <div class="floor-info">
          <div class="floor-label">${f.label}</div>
          <div class="floor-meta">${summary}</div>
        </div>
        <svg class="floor-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg>
      </div>`;
    }).join('');

    el('floorsPaneContent').innerHTML = `
      <div class="floors-crumb">
        <button class="floors-crumb-back" onclick="FloorUI._backToPicker()" title="All buildings">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <div class="floors-crumb-text"><b>${b.name}</b>${building.alias ? ' · ' + building.alias : ''}</div>
      </div>
      <div class="floors-scroll">
        <div class="floor-list-page">
          ${rows}
        </div>
      </div>`;
  }

  /* ── FLOOR OPEN: sidebar room list + map-overlay plan ─────── */
  function openFloor(floorNum) {
    const f = building.floors.find(x => x.floor === floorNum);
    if (!f || !f.digitized) return;
    currentFloor = f;
    selectedRoomId = null;
    roomSearch = '';
    renderSidebar();
    showFloorPlan();
  }

  // Natural sort: "Room 2" before "Room 10", numbers compared as numbers
  // rather than character-by-character. Sorts by room number when present
  // (assignable rooms), falling back to the name (infra rooms, or rooms
  // with no number set).
  function roomSortKey(r) { return r.roomNumber || r.name; }
  function sortRooms(list) {
    return list.slice().sort((a, b) =>
      roomSortKey(a).localeCompare(roomSortKey(b), undefined, { numeric: true, sensitivity: 'base' })
    );
  }

  function roomRowHTML(r, colors) {
    if (!r.assignable) {
      return `<div class="room-row infra" onclick="FloorUI._selectInfra('${r.id}')">
        <div class="room-dot" style="background:var(--text-faint)"></div>
        <div class="room-row-txt">
          <div class="room-row-name">${r.name}</div>
          <div class="room-row-dept">${r.type}</div>
        </div>
      </div>`;
    }
    return `<div class="room-row" onclick="FloorUI._selectRoom('${r.id}')">
      <div class="room-dot" style="background:${colors[r.department] || '#999'}"></div>
      <div class="room-row-txt">
        <div class="room-row-name">${r.roomNumber ? 'Room ' + r.roomNumber : r.name}</div>
        <div class="room-row-dept">${r.department}</div>
      </div>
      <svg class="room-row-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg>
    </div>`;
  }

  function filteredSortedRoomRows(q, colors) {
    const qq = q.trim().toLowerCase();
    return sortRooms(currentFloor.rooms)
      .filter(r => !qq || r.name.toLowerCase().includes(qq) || (r.roomNumber || '').toLowerCase().includes(qq) || (r.department || '').toLowerCase().includes(qq))
      .map(r => roomRowHTML(r, colors))
      .join('');
  }

  function renderRoomList() {
    const b = BUILDINGS[buildingId];
    const colors = building.deptColors;
    const rows = filteredSortedRoomRows(roomSearch, colors);

    el('floorsPaneContent').innerHTML = `
      <div class="floors-crumb">
        <button class="floors-crumb-back" onclick="FloorUI._backToList()" title="Back to floors">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <div class="floors-crumb-text"><b>${b.name}</b> · ${currentFloor.label}</div>
      </div>
      <div class="floors-scroll">
        <div class="floor-list-page">
          <div class="floors-search">
            <div class="search-wrap" style="max-width:none">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              <input class="search-input" type="text" placeholder="Search rooms or departments…"
                     value="${roomSearch}" oninput="FloorUI._searchRooms(this.value)" />
            </div>
          </div>
          <div id="floorRoomListRows">${rows || '<div class="side-panel-empty">No rooms match</div>'}</div>
        </div>
      </div>`;
  }

  function searchRooms(q) {
    roomSearch = q;
    // Re-render just the row list so the search input doesn't lose focus
    const colors = building.deptColors;
    const rows = filteredSortedRoomRows(q, colors);
    const target = el('floorRoomListRows');
    if (target) target.innerHTML = rows || '<div class="side-panel-empty">No rooms match</div>';
  }

  function backToPicker() {
    buildingId = null;
    building = null;
    currentFloor = null;
    selectedRoomId = null;
    hideFloorPlan();
    renderSidebar();
  }

  function backToList() {
    currentFloor = null;
    selectedRoomId = null;
    hideFloorPlan();
    renderSidebar();
  }

  /* ── MAP OVERLAY: the visual floor plan ───────────────────── */
  function showFloorPlan() {
    const b = BUILDINGS[buildingId];
    const f = currentFloor;
    el('floorPlanCrumb').innerHTML = `<b>${b.name}</b> · ${f.label}`;
    el('floorPlanPane').innerHTML = `
      <div class="plan-canvas-wrap" style="width:${f.imageWidth}px;height:${f.imageHeight}px">
        ${f.backgroundImage ? `<img src="${f.backgroundImage}" width="${f.imageWidth}" height="${f.imageHeight}" />` : ''}
        <svg class="plan-svg" id="floorPlanSvg" width="${f.imageWidth}" height="${f.imageHeight}" viewBox="0 0 ${f.imageWidth} ${f.imageHeight}"></svg>
      </div>`;
    renderRoomPolygons();
    el('floorPlanArea').classList.add('open');
  }

  function hideFloorPlan() {
    const area = el('floorPlanArea');
    area.classList.remove('open');
    el('floorPlanPane').innerHTML = '';
  }

  // Polygons carry no fill/label of their own — the plan image already
  // shows room numbers, and department color lives in the sidebar dot.
  // Appearance (hover highlight, selected state, infra dashing) is
  // entirely CSS-driven off the class list; see .room-poly-group in style.css.
  //
  // r.points supports two shapes for backward compatibility:
  //   flat:   [[x,y],[x,y],[x,y],[x,y]]              — one rectangle (legacy)
  //   nested: [ [[x,y]x4], [[x,y]x4], ... ]           — multiple pieces,
  //           e.g. an L-shaped or irregular room made of several rectangles
  function roomShapes(points) {
    if (!points || points.length === 0) return [];
    return Array.isArray(points[0][0]) ? points : [points];
  }

  // When a room is made of more than one axis-aligned rectangle, we don't
  // want to draw each rectangle's own outline — overlapping/adjoining
  // pieces would show internal seams cutting across the room. Instead we
  // compute the actual outer boundary of their union (treating shared
  // interior edges as internal, not drawn) and render that as one shape.
  //
  // Approach: rasterize onto a small grid built from every rectangle's own
  // edge coordinates (so each grid cell is fully inside or fully outside
  // any given rectangle — no partial overlap), mark which cells are
  // covered, then emit a boundary edge for every cell face that borders
  // an uncovered cell (or the outside). Those edges are chained into
  // closed loops and rendered as one <path> with fill-rule="evenodd" —
  // which lets genuinely enclosed gaps (rare, but possible) render as
  // real holes without needing to track winding direction.
  function unionBoundaryPath(shapes) {
    const rects = shapes.map(shape => {
      const xs = shape.map(p => p[0]), ys = shape.map(p => p[1]);
      return { x1: Math.min(...xs), y1: Math.min(...ys), x2: Math.max(...xs), y2: Math.max(...ys) };
    });
    const xs = [...new Set(rects.flatMap(r => [r.x1, r.x2]))].sort((a, b) => a - b);
    const ys = [...new Set(rects.flatMap(r => [r.y1, r.y2]))].sort((a, b) => a - b);

    const covered = [];
    for (let i = 0; i < xs.length - 1; i++) {
      covered[i] = [];
      const cx = (xs[i] + xs[i + 1]) / 2;
      for (let j = 0; j < ys.length - 1; j++) {
        const cy = (ys[j] + ys[j + 1]) / 2;
        covered[i][j] = rects.some(r => cx > r.x1 && cx < r.x2 && cy > r.y1 && cy < r.y2);
      }
    }

    const edges = []; // each: [[x,y],[x,y]]
    for (let i = 0; i < xs.length - 1; i++) {
      for (let j = 0; j < ys.length - 1; j++) {
        if (!covered[i][j]) continue;
        if (j === 0 || !covered[i][j - 1]) edges.push([[xs[i], ys[j]], [xs[i + 1], ys[j]]]);
        if (j === ys.length - 2 || !covered[i][j + 1]) edges.push([[xs[i], ys[j + 1]], [xs[i + 1], ys[j + 1]]]);
        if (i === 0 || !covered[i - 1][j]) edges.push([[xs[i], ys[j]], [xs[i], ys[j + 1]]]);
        if (i === xs.length - 2 || !covered[i + 1][j]) edges.push([[xs[i + 1], ys[j]], [xs[i + 1], ys[j + 1]]]);
      }
    }

    // Chain edges (undirected) into closed loops by walking shared endpoints.
    const key = (p) => p[0] + ',' + p[1];
    const remaining = edges.slice();
    const loops = [];
    while (remaining.length) {
      const loop = [remaining.shift()];
      let changed = true;
      while (changed) {
        changed = false;
        const tail = loop[loop.length - 1][1];
        for (let k = 0; k < remaining.length; k++) {
          const [a, b] = remaining[k];
          if (key(a) === key(tail)) { loop.push([a, b]); remaining.splice(k, 1); changed = true; break; }
          if (key(b) === key(tail)) { loop.push([b, a]); remaining.splice(k, 1); changed = true; break; }
        }
      }
      loops.push(loop.map(seg => seg[0]));
    }

    return loops.map(loop => 'M' + loop.map(p => p.join(',')).join('L') + 'Z').join(' ');
  }

  function renderRoomPolygons() {
    const svg = el('floorPlanSvg');
    if (!svg) return;
    svg.innerHTML = currentFloor.rooms.map(r => {
      const shapes = roomShapes(r.points);
      const shapeMarkup = shapes.length === 1
        ? `<polygon class="room-poly" points="${shapes[0].map(p => p.join(',')).join(' ')}" />`
        : `<path class="room-poly" fill-rule="evenodd" d="${unionBoundaryPath(shapes)}" />`;
      const classes = ['room-poly-group'];
      if (!r.assignable) classes.push('infra');
      if (r.id === selectedRoomId) classes.push('selected');
      return `<g class="${classes.join(' ')}"
        onclick="${r.assignable ? `FloorUI._selectRoom('${r.id}')` : `FloorUI._selectInfra('${r.id}')`}">${shapeMarkup}</g>`;
    }).join('');
  }

  /* ── ROOM SELECTION + REASSIGNMENT PANEL (sidebar) ────────── */
  function selectRoom(roomId) {
    selectedRoomId = roomId;
    renderRoomPolygons();
    renderRoomPanel('details');
  }

  function selectInfra(roomId) {
    selectedRoomId = roomId;
    renderRoomPolygons();
    const r = currentFloor.rooms.find(x => x.id === roomId);
    const b = BUILDINGS[buildingId];
    el('floorsPaneContent').innerHTML = `
      <div class="floors-crumb">
        <button class="floors-crumb-back" onclick="FloorUI._deselectRoom()" title="Back to room list">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <div class="floors-crumb-text"><b>${b.name}</b> · ${currentFloor.label}</div>
      </div>
      <div class="floors-scroll">
        <div class="panel-header">
          <div class="panel-room-type">${r.type}</div>
          <div class="panel-room-name">${r.name}</div>
        </div>
        <div class="panel-body">
          <div class="infra-note">This is a shared/infrastructure space, not departmental room area — no reassignment needed.</div>
        </div>
      </div>`;
  }

  function deselectRoom() {
    selectedRoomId = null;
    renderRoomPolygons();
    renderRoomList();
  }

  function renderRoomPanel(tab) {
    const r = currentFloor.rooms.find(x => x.id === selectedRoomId);
    if (!r) return renderRoomList();
    const b = BUILDINGS[buildingId];
    const colors = building.deptColors;
    const deptOptions = building.depts.map(d => `<option value="${d}" ${d === r.department ? 'selected' : ''}>${d}</option>`).join('');

    // Optional info rows — only shown when the room actually has a value for
    // them, so a plain room with nothing filled in shows no table at all.
    const infoRows = [
      ['Floor', currentFloor.label],
      ['Room No.', r.roomNumber],
      ['New Room No.', r.newRoomNumber],
      ['Used For', r.usedFor],
      ['Remarks', r.remarks],
    ].filter(([, v]) => v);
    const infoTableHTML = infoRows.length === 0 ? '' : `
      <div class="room-info-table">
        ${infoRows.map(([label, value]) => `
          <div class="room-info-row"><div class="room-info-label">${label}</div><div class="room-info-value">${value}</div></div>
        `).join('')}
      </div>`;

    const detailsHTML = `
      ${infoTableHTML}
      <div class="dept-pill"><div class="dept-pill-dot" style="background:${colors[r.department] || '#999'}"></div>${r.department}</div>
      <div class="field-label">Reassign to</div>
      <select class="dept-select" id="floorReassignSelect">
        <option value="Unassigned" ${r.department === 'Unassigned' ? 'selected' : ''}>Unassigned</option>
        ${deptOptions}
      </select>
      <button class="btn-reassign" onclick="FloorUI._doReassign('${r.id}')">Save reassignment</button>`;

    const hist = loadHistory(r.id);
    const historyHTML = hist.length === 0
      ? `<div class="history-empty">No reassignment history yet</div>`
      : hist.map(h => `<div class="history-item">
          <div class="history-change">${h.from} → ${h.to}</div>
          <div class="history-time">${new Date(h.at).toLocaleString()}</div>
        </div>`).join('');

    el('floorsPaneContent').innerHTML = `
      <div class="floors-crumb">
        <button class="floors-crumb-back" onclick="FloorUI._deselectRoom()" title="Back to room list">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <div class="floors-crumb-text"><b>${b.name}</b> · ${currentFloor.label}</div>
      </div>
      <div class="floors-scroll">
        <div class="panel-header">
          <div class="panel-room-type">${r.type}${r.roomNumber ? ' · Room ' + r.roomNumber : ''}</div>
          <div class="panel-room-name">${r.name}</div>
          ${r.capacity ? `<div class="panel-room-cap">${r.capacity} seat capacity</div>` : '<div class="panel-room-cap">&nbsp;</div>'}
        </div>
        <div class="panel-tabs">
          <div class="panel-tab ${tab === 'details' ? 'active' : ''}" onclick="FloorUI._renderRoomPanel('details')">Details</div>
          <div class="panel-tab ${tab === 'history' ? 'active' : ''}" onclick="FloorUI._renderRoomPanel('history')">History</div>
        </div>
        <div class="panel-body">${tab === 'details' ? detailsHTML : historyHTML}</div>
      </div>`;
  }

  function doReassign(roomId) {
    const r = currentFloor.rooms.find(x => x.id === roomId);
    const newDept = el('floorReassignSelect').value;
    if (newDept === r.department) { showToast('No change made'); return; }

    pushHistory(roomId, { from: r.department, to: newDept, at: Date.now() });
    r.department = newDept;

    renderRoomPolygons();
    renderRoomPanel('details');
    showToast(`${r.name} reassigned to ${newDept}`);
  }

  return {
    onTabShown,
    openFromCard,
    closeFloorPlan,
    _pickBuilding: pickBuilding,
    _backToPicker: backToPicker,
    _backToList: backToList,
    _openFloor: openFloor,
    _searchRooms: searchRooms,
    _selectRoom: selectRoom,
    _selectInfra: selectInfra,
    _deselectRoom: deselectRoom,
    _renderRoomPanel: renderRoomPanel,
    _doReassign: doReassign,
  };
})();
