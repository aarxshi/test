/**
 * map.js
 * MapLibre GL setup, layer definitions, hover/click/route interactions.
 * Depends on: buildings.js (BUILDINGS, GRAPH)
 */

/* ── MAP INIT ───────────────────────────────────────── */
const map = new maplibregl.Map({
  container: 'map',
  style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
  center: window.innerWidth < 768 ? [77.566574, 12.908188] : [77.5667, 12.9075],
  zoom: window.innerWidth < 768 ? 16.2 : 16.5,
  bearing: 90,
  attributionControl: false,
});

map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');

map.on('load', () => {
  /* Raster overlay ─────────────────────────────────── */
  map.addSource('overlay', {
    type: 'image',
    url: 'georef_small.png',
    coordinates: [
      [77.56443976346985, 12.910353408746811],
      [77.56899995730454, 12.910353408746811],
      [77.56899995730454, 12.905528106751351],
      [77.56443976346985, 12.905528106751351],
    ],
  });
  map.addLayer({
    id: 'overlay-layer', source: 'overlay', type: 'raster',
    paint: {
      'raster-opacity': 0.88,
      'raster-saturation': -0.15,
      'raster-brightness-min': 0.04,
      'raster-contrast': -0.04,
    },
  });

  /* Building polygons ──────────────────────────────── */
  map.addSource('buildings', { type: 'geojson', data: 'build.geojson' });

  // Soft glow behind active buildings
  map.addLayer({
    id: 'building-glow', type: 'fill', source: 'buildings',
    paint: {
      'fill-color': ['case',
        ['boolean', ['feature-state', 'routeEnd'],   false], '#dc2626',
        ['boolean', ['feature-state', 'routeStart'], false], '#16a34a',
        '#0ea5e9',
      ],
      'fill-opacity': ['case',
        ['any',
          ['boolean', ['feature-state', 'hover'],      false],
          ['boolean', ['feature-state', 'selected'],   false],
          ['boolean', ['feature-state', 'routeStart'], false],
          ['boolean', ['feature-state', 'routeEnd'],   false],
        ], 0.14, 0,
      ],
    },
  });

  // Main fill
  map.addLayer({
    id: 'building-fill', type: 'fill', source: 'buildings',
    paint: {
      'fill-color': ['case',
        ['boolean', ['feature-state', 'routeEnd'],   false], '#dc2626',
        ['boolean', ['feature-state', 'routeStart'], false], '#16a34a',
        ['boolean', ['feature-state', 'searched'],   false], '#f59e0b',
        '#0ea5e9',
      ],
      'fill-opacity': ['case',
        ['boolean', ['feature-state', 'routeEnd'],   false], 0.55,
        ['boolean', ['feature-state', 'routeStart'], false], 0.55,
        ['boolean', ['feature-state', 'searched'],   false], 0.50,
        ['boolean', ['feature-state', 'selected'],   false], 0.45,
        ['boolean', ['feature-state', 'hover'],      false], 0.38,
        0,
      ],
    },
  });

  // Outline ring
  map.addLayer({
    id: 'building-outline', type: 'line', source: 'buildings',
    paint: {
      'line-color': ['case',
        ['boolean', ['feature-state', 'routeEnd'],   false], '#dc2626',
        ['boolean', ['feature-state', 'routeStart'], false], '#16a34a',
        ['boolean', ['feature-state', 'searched'],   false], '#d97706',
        ['boolean', ['feature-state', 'selected'],   false], '#0284c7',
        ['boolean', ['feature-state', 'hover'],      false], '#0284c7',
        'rgba(0,0,0,0)',
      ],
      'line-width': ['case',
        ['boolean', ['feature-state', 'routeEnd'],   false], 2.5,
        ['boolean', ['feature-state', 'routeStart'], false], 2.5,
        ['boolean', ['feature-state', 'searched'],   false], 2,
        ['boolean', ['feature-state', 'selected'],   false], 2,
        2,
      ],
    },
  });

  /* Campus paths ───────────────────────────────────── */
  map.addSource('paths', { type: 'geojson', data: 'paths.geojson' });
  map.addLayer({
    id: 'campus-paths', type: 'line', source: 'paths',
    paint: { 'line-color': '#c8bfb0', 'line-width': 1.5, 'line-dasharray': [3, 2] },
  });

  /* Route line ─────────────────────────────────────── */
  map.addSource('route-line', {
    type: 'geojson',
    data: { type: 'Feature', geometry: { type: 'LineString', coordinates: [] } }
  });

  map.addLayer({
    id: 'route-line-glow', type: 'line', source: 'route-line',
    paint: { 'line-color': '#4285F4', 'line-width': 12, 'line-opacity': 0.15, 'line-blur': 5 }
  });

  map.addLayer({
    id: 'route-line-border', type: 'line', source: 'route-line',
    layout: { 'line-join': 'round', 'line-cap': 'round' },
    paint: { 'line-color': '#ffffff', 'line-width': 7, 'line-opacity': 0.5 }
  });

  map.addLayer({
    id: 'route-line-main', type: 'line', source: 'route-line',
    layout: { 'line-join': 'round', 'line-cap': 'round' },
    paint: { 'line-color': '#4285F4', 'line-width': 4, 'line-opacity': 1 }
  });

  // Initialise router after map loads
  Router.init().then(() => {
    console.log('Router ready');
  });

  // Force route layers to render on top of everything including raster overlay
  ['route-line-glow','route-line-border','route-line-main'].forEach(id => map.moveLayer(id));

  /* Hover pulse ────────────────────────────────────── */
  let hoveredId = null, pulseDir = 1, pulseVal = 0.38;

  setInterval(() => {
    if (hoveredId !== null) {
      pulseVal += 0.013 * pulseDir;
      if (pulseVal >= 0.56 || pulseVal <= 0.24) pulseDir *= -1;
      map.setPaintProperty('building-fill', 'fill-opacity', ['case',
        ['boolean', ['feature-state', 'routeEnd'],   false], 0.55,
        ['boolean', ['feature-state', 'routeStart'], false], 0.55,
        ['boolean', ['feature-state', 'searched'],   false], 0.50,
        ['boolean', ['feature-state', 'selected'],   false], 0.45,
        ['boolean', ['feature-state', 'hover'],      false], pulseVal,
        0,
      ]);
    }
  }, 40);

  map.on('mousemove', 'building-fill', e => {
    if (e.features.length > 0) {
      if (hoveredId !== null)
        map.setFeatureState({ source: 'buildings', id: hoveredId }, { hover: false });
      hoveredId = e.features[0].id;
      map.setFeatureState({ source: 'buildings', id: hoveredId }, { hover: true });
    }
  });

  map.on('mouseleave', 'building-fill', () => {
    if (hoveredId !== null)
      map.setFeatureState({ source: 'buildings', id: hoveredId }, { hover: false });
    hoveredId = null;
    pulseVal = 0.38;
  });

  map.on('click', 'building-fill', e => {
    const bid = String(e.features[0].properties?.id ?? e.features[0].id);
    if (BUILDINGS[bid]) selectBuilding(bid, 'map');
  });

  map.on('mouseenter', 'building-fill', () => map.getCanvas().style.cursor = 'pointer');
  map.on('mouseleave', 'building-fill', () => map.getCanvas().style.cursor = '');
});

/* ── SELECTED STATE HELPERS ─────────────────────────── */
let _selectedMapId = null;

function setMapSelected(bid) {
  clearMapSelected();
  const id = isNaN(bid) ? bid : Number(bid);
  try { map.setFeatureState({ source: 'buildings', id }, { selected: true }); } catch (_) {}
  _selectedMapId = id;
}

function clearMapSelected() {
  if (_selectedMapId !== null) {
    try { map.setFeatureState({ source: 'buildings', id: _selectedMapId }, { selected: false }); } catch (_) {}
    _selectedMapId = null;
  }
}

/* ── ROUTE STATE HELPERS ────────────────────────────── */
function setRouteStates(fromBid, toBid) {
  clearRouteStates();
  const startId = isNaN(fromBid) ? fromBid : Number(fromBid);
  const endId   = isNaN(toBid)   ? toBid   : Number(toBid);
  try { map.setFeatureState({ source: 'buildings', id: startId }, { routeStart: true }); } catch (_) {}
  try { map.setFeatureState({ source: 'buildings', id: endId },   { routeEnd:   true }); } catch (_) {}
}

function clearRouteStates() {
  Object.keys(BUILDINGS).forEach(bid => {
    const id = isNaN(bid) ? bid : Number(bid);
    try { map.setFeatureState({ source: 'buildings', id }, { routeStart: false, routeEnd: false }); } catch (_) {}
  });
}

/* ── DIJKSTRA ───────────────────────────────────────── */
function dijkstra(from, to) {
  const dist = {}, prev = {}, visited = new Set();
  Object.keys(GRAPH).forEach(k => dist[k] = Infinity);
  dist[from] = 0;
  const pq = Object.keys(GRAPH).slice();
  while (pq.length) {
    pq.sort((a, b) => dist[a] - dist[b]);
    const u = pq.shift();
    if (visited.has(u)) continue;
    visited.add(u);
    if (u === to) break;
    for (const [v, w] of Object.entries(GRAPH[u] || {})) {
      const d = dist[u] + w;
      if (d < (dist[v] ?? Infinity)) { dist[v] = d; prev[v] = u; }
    }
  }
  const path = []; let c = to;
  while (c) { path.unshift(c); c = prev[c]; }
  return { path, dist: dist[to] };
}

/* ── ROUTE LINE HELPERS ─────────────────────────────── */

function drawRoute(coords) {
  if (!map.getSource('route-line')) return;
  map.getSource('route-line').setData({
    type: 'Feature',
    geometry: { type: 'LineString', coordinates: coords }
  });
}

function clearRoute() {
  if (map.getSource('route-line')) {
    map.getSource('route-line').setData({
      type: 'Feature',
      geometry: { type: 'LineString', coordinates: [] }
    });
  }
  if (map.getSource('route-endpoints')) {
    map.getSource('route-endpoints').setData({
      type: 'FeatureCollection', features: []
    });
  }
}
/**
 * Get the routing anchor point for a building.
 *
 * - unreachable:true → returns null
 * - entrances:[...]  → picks door whose nearest path-node is closest to origin
 * - entrance:[...]   → single door, used directly
 * - fallback         → polygon centroid
 */
function getBuildingCenter(bid, origin) {
  const b = BUILDINGS[String(bid)];
  if (!b) return null;
  if (b.unreachable) return null;

  if (b.entrances && b.entrances.length) {
    if (!origin || !Router.isReady()) return b.entrances[0];
    let best = b.entrances[0], bestDist = Infinity;
    for (const e of b.entrances) {
      const snap = Router.nearestPoint(e);
      if (!snap) continue;
      const d = Math.hypot(snap[0] - origin[0], snap[1] - origin[1]);
      if (d < bestDist) { bestDist = d; best = e; }
    }
    return best;
  }

  if (b.entrance) return b.entrance;

  // Polygon centroid fallback
  const numId = isNaN(bid) ? bid : Number(bid);
  let features = map.queryRenderedFeatures({ layers: ['building-fill'] })
    .filter(f => (f.id === numId) || (f.properties?.id == bid));
  if (!features.length) {
    features = map.querySourceFeatures('buildings')
      .filter(f => (f.id === numId) || (f.properties?.id == bid));
  }
  if (!features.length) return null;
  const geom = features[0].geometry;
  let ring;
  if (geom.type === 'Polygon')           ring = geom.coordinates[0];
  else if (geom.type === 'MultiPolygon') ring = geom.coordinates[0][0];
  else return null;
  return [
    ring.reduce((s, c) => s + c[0], 0) / ring.length,
    ring.reduce((s, c) => s + c[1], 0) / ring.length,
  ];
}

/* ── GPS / LOCATION ─────────────────────────────────── */
let _gpsWatchId   = null;
let _gpsMarker    = null;
let _gpsAccuracy  = null;
let _gpsCentre    = true;   // fly to position on first fix
let _gpsStale     = false;

function toggleGPS() {
  if (_gpsWatchId !== null) {
    stopGPS();
  } else {
    startGPS();
  }
}

function startGPS() {
  if (!navigator.geolocation) {
    showToast('GPS not supported on this device');
    return;
  }
  const btn = document.getElementById('gpsBtn');
  btn.classList.add('gps-active');
  const fab = document.getElementById('gpsFabBtn');
  if (fab) fab.style.color = 'var(--accent)';
  _gpsCentre = true;

  _gpsWatchId = navigator.geolocation.watchPosition(
    onGPSUpdate,
    onGPSError,
    { enableHighAccuracy: true, maximumAge: 3000, timeout: 10000 }
  );
}

function stopGPS() {
  if (_gpsWatchId !== null) {
    navigator.geolocation.clearWatch(_gpsWatchId);
    _gpsWatchId = null;
  }
  if (_gpsMarker)   { _gpsMarker.remove();   _gpsMarker   = null; }
  if (_gpsAccuracy) { _gpsAccuracy.remove(); _gpsAccuracy = null; }
  document.getElementById('gpsBtn').classList.remove('gps-active');
  const fab2 = document.getElementById('gpsFabBtn');
  if (fab2) fab2.style.color = '';
  stopGPSNav();
}

/* Fixes above this radius (metres) are too noisy to trust for
   snapping — show the raw point but don't feed it into nav logic. */
const GPS_ACCURACY_LIMIT_M = 30;
/* A fix has to snap within this distance of a path to count as
   "on" it, rather than genuinely off-network (inside a building etc). */
const GPS_SNAP_LIMIT_M = 20;

function onGPSUpdate(pos) {
  const { longitude: lng, latitude: lat, accuracy } = pos.coords;
  _gpsStale = accuracy > GPS_ACCURACY_LIMIT_M;

  // Snap onto the path network when the fix is trustworthy and close
  // enough to a path — otherwise show the raw fix as-is.
  let displayPoint = [lng, lat];
  if (!_gpsStale && Router.isReady()) {
    const snap = Router.snapToNetwork([lng, lat]);
    if (snap && snap.distM <= GPS_SNAP_LIMIT_M) displayPoint = snap.point;
  }

  // Blue dot
  if (!_gpsMarker) {
    const dotWrap = document.createElement('div');
    dotWrap.className = 'gps-dot-wrap';
    const dot = document.createElement('div');
    dot.className = 'gps-dot';
    dot.id = 'gpsDot';
    dotWrap.appendChild(dot);
    _gpsMarker = new maplibregl.Marker({ element: dotWrap, anchor: 'center' })
      .setLngLat(displayPoint).addTo(map);
  } else {
    _gpsMarker.setLngLat(displayPoint);
  }
  document.getElementById('gpsDot')?.classList.toggle('gps-stale', _gpsStale);

  // Fly to on first fix, then just re-centre if button tapped again
  if (_gpsCentre) {
    map.flyTo({ center: displayPoint, zoom: Math.max(map.getZoom(), 18), duration: 800 });
    _gpsCentre = false;
  }

  // Stop spinning, keep pin blue
  const btn = document.getElementById('gpsBtn');
  btn.classList.remove('gps-active');
  btn.style.color = '#2563eb';
  const fab3 = document.getElementById('gpsFabBtn');
  if (fab3) { fab3.style.color = '#2563eb'; }

  // Skip nav-progress work on a bad fix — wait for a better one
  if (_gpsStale) return;

  updateGPSNavProgress(displayPoint);
}

/* ── GPS NAV — progress tracking + confirmed reroute ───────
   Once a route is being followed live from GPS, this tracks how
   far along route.coords the walker has gotten, redraws the line
   showing only the remaining stretch, and reroutes only after a
   few consecutive fixes agree the walker has actually left the
   path (not just one jittery reading). ──────────────────────── */
let _gpsNavActive      = false;
let _gpsDestBid        = null;
let _gpsRouteCoords    = null;
let _gpsProgressIdx    = 0;
let _gpsDeviationCount = 0;

const GPS_DEVIATION_LIMIT_M    = 18;
const GPS_DEVIATION_CONFIRM_N  = 3;
const GPS_ARRIVED_LIMIT_M      = 8;

function startGPSNav(destBid, coords) {
  _gpsNavActive      = true;
  _gpsDestBid        = destBid;
  _gpsRouteCoords    = coords;
  _gpsProgressIdx    = 0;
  _gpsDeviationCount = 0;
}

function stopGPSNav() {
  _gpsNavActive      = false;
  _gpsDestBid        = null;
  _gpsRouteCoords    = null;
  _gpsProgressIdx    = 0;
  _gpsDeviationCount = 0;
}

function haversineM([lng1, lat1], [lng2, lat2]) {
  const R  = 6371000;
  const dL = (lat2 - lat1) * Math.PI / 180;
  const dl = (lng2 - lng1) * Math.PI / 180;
  const a  = Math.sin(dL/2)**2 +
             Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * Math.sin(dl/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

function routeLengthM(coords) {
  let total = 0;
  for (let i = 0; i < coords.length - 1; i++) total += haversineM(coords[i], coords[i + 1]);
  return total;
}

function projectPointOnSegmentM([px, py], [ax, ay], [bx, by]) {
  const dx = bx - ax, dy = by - ay;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return [ax, ay];
  let t = ((px - ax) * dx + (py - ay) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));
  return [ax + t * dx, ay + t * dy];
}

/* Find the closest point on `coords`, searching forward from
   `fromIdx` (with a one-segment backward allowance for jitter) so
   progress can't randomly leap to a far-off, geometrically-closer
   part of the path the walker hasn't reached yet. */
function projectOntoRoute(coords, point, fromIdx) {
  const searchFrom = Math.max(0, fromIdx - 1);
  let best = null;
  for (let i = searchFrom; i < coords.length - 1; i++) {
    const proj = projectPointOnSegmentM(point, coords[i], coords[i + 1]);
    const d = haversineM(point, proj);
    if (!best || d < best.distM) best = { index: i, point: proj, distM: d };
  }
  return best;
}

function updateGPSNavProgress(point) {
  if (!_gpsNavActive || !_gpsRouteCoords || !Router.isReady()) return;

  const proj = projectOntoRoute(_gpsRouteCoords, point, _gpsProgressIdx);
  if (!proj) return;

  if (proj.distM <= GPS_DEVIATION_LIMIT_M) {
    _gpsDeviationCount = 0;
    _gpsProgressIdx = proj.index;

    const remaining = [proj.point, ..._gpsRouteCoords.slice(proj.index + 1)];
    drawRoute(remaining);

    const metres = Math.round(routeLengthM(remaining));
    const mins   = Math.max(1, Math.round(metres / 80));
    const dEl = document.getElementById('rDist');
    const tEl = document.getElementById('rTime');
    if (dEl) dEl.textContent = metres;
    if (tEl) tEl.textContent = '~' + mins;

    if (metres <= GPS_ARRIVED_LIMIT_M) {
      showToast('📍 You’ve arrived');
      stopGPSNav();
    }
  } else {
    _gpsDeviationCount++;
    if (_gpsDeviationCount >= GPS_DEVIATION_CONFIRM_N) {
      rerouteGPSNav(point);
    }
  }
}

function rerouteGPSNav(point) {
  if (!_gpsDestBid) return;
  const toCenter = getBuildingCenter(_gpsDestBid, point);
  if (!toCenter) return;
  const route = Router.find(point, toCenter);
  if (!route) return;

  startGPSNav(_gpsDestBid, route.coords);
  drawRoute(route.coords);

  const metres = Math.round(route.distanceM);
  const mins   = Math.max(1, Math.round(metres / 80));
  const dEl = document.getElementById('rDist');
  const tEl = document.getElementById('rTime');
  if (dEl) dEl.textContent = metres;
  if (tEl) tEl.textContent = '~' + mins;

  showToast('↻ Route updated');
}

function onGPSError(err) {
  stopGPS();
  const msgs = {
    1: 'Location access denied — please allow in browser settings',
    2: 'GPS signal lost',
    3: 'GPS timed out',
  };
  showToast('📍 ' + (msgs[err.code] || 'GPS error'));
}
