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

/* ══════════════════════════════════════════════════════════════════
   LIVE LOCATION
   ────────────────────────────────────────────────────────────────
   Raw browser GPS on a dense campus is genuinely noisy (typically
   5–20m error outdoors, worse between buildings — the same "urban
   canyon" effect that throws off phones downtown). Google Maps hides
   this by fusing GPS with wifi/cell positioning and the phone's
   motion sensors — a browser can't access any of that. What we CAN
   do to get most of the way there:
     1. Reject/downweight low-accuracy fixes instead of trusting every one
     2. Smooth the last few fixes (rolling average) instead of jumping to each
     3. Snap the smoothed point onto the path network (Router.snapToNetwork)
        — like a car snapping onto a road — since you're almost always on
        a path, not in a flowerbed
     4. Animate the marker between fixes instead of teleporting it
     5. Use the device compass for heading, since GPS heading is only
        derived from movement and is useless standing still
════════════════════════════════════════════════════════════════════ */

const GPS_GOOD_ACCURACY_M  = 25;   // fixes at or below this are trusted fully, and enable path-snapping
const GPS_OK_ACCURACY_M    = 60;   // fixes at or below this still count, just weighted down
                                    // (nothing is ever hard-rejected — a weak fix beats no fix)
const GPS_SMOOTH_WINDOW    = 4;    // rolling-average window size
const GPS_SNAP_MAX_DIST_M  = 25;   // beyond this, trust raw fix over snapped one
const GPS_ANIM_MS          = 650;  // marker glide duration between fixes
const GPS_REROUTE_DRIFT_M  = 18;   // deviation from route before we recompute

let _gpsWatchId   = null;
let _gpsRecent    = [];     // rolling buffer of accepted [lng,lat,accuracy]
let _gpsSmoothed  = null;   // current smoothed (pre-snap) position
let _gpsDisplayed = null;   // position actually drawn (post-snap, animated)
let _gpsHeading   = null;
let _gpsMarkerEl  = null;
let _gpsAccuracyCircleId = 'gps-accuracy';
let _gpsAnimFrame = null;
let _gpsActiveRouteTo = null;   // building id we're live-navigating to, or null
let _gpsFirstFix  = true;
let _gpsLastTier  = null;   // 'good' | 'ok' | 'weak' — for toast de-duplication + visual state

function isGPSActive() { return _gpsWatchId !== null; }

function startGPS() {
  if (!navigator.geolocation) {
    showToast('Location isn\'t supported on this browser');
    return;
  }
  if (_gpsWatchId !== null) { stopGPS(); return; } // toggle off if already on

  _gpsRecent = [];
  _gpsFirstFix = true;
  document.getElementById('gpsBtn')?.classList.add('gps-loading');
  showToast('Finding your location…');

  requestCompassPermissionIfNeeded();

  _gpsWatchId = navigator.geolocation.watchPosition(
    onGPSFix, onGPSError,
    { enableHighAccuracy: true, maximumAge: 2000, timeout: 15000 }
  );
}

function stopGPS() {
  if (_gpsWatchId !== null) navigator.geolocation.clearWatch(_gpsWatchId);
  _gpsWatchId = null;
  _gpsActiveRouteTo = null;
  cancelAnimationFrame(_gpsAnimFrame);
  document.getElementById('gpsBtn')?.classList.remove('gps-loading', 'gps-active');
  removeGPSMarker();
  if (map.getLayer(_gpsAccuracyCircleId)) map.removeLayer(_gpsAccuracyCircleId);
  if (map.getSource(_gpsAccuracyCircleId)) map.removeSource(_gpsAccuracyCircleId);
}

function onGPSError(err) {
  const msgs = {
    1: 'Location access denied — allow it in your browser settings',
    2: 'Location signal lost',
    3: 'Location request timed out — try again outdoors',
  };
  showToast(msgs[err.code] || 'Location error');
  if (_gpsFirstFix) stopGPS(); // don't leave a spinner stuck if the very first fix fails
}

function onGPSFix(pos) {
  const { longitude: lng, latitude: lat, accuracy, heading, speed } = pos.coords;
  const acc = accuracy ?? 50;

  // Never hard-reject a fix — a weak fix beats leaving the user with
  // nothing on screen. Instead we weight it down in the average and
  // skip path-snapping until we're confident enough to trust it.
  document.getElementById('gpsBtn')?.classList.remove('gps-loading');
  document.getElementById('gpsBtn')?.classList.add('gps-active');

  // Tell the user what tier of signal they're on, but only when it
  // actually changes tier — not on every single fix (that was the
  // "stuck spamming weak GPS" toast spam before).
  const tier = acc <= GPS_GOOD_ACCURACY_M ? 'good' : acc <= GPS_OK_ACCURACY_M ? 'ok' : 'weak';
  if (tier !== _gpsLastTier) {
    if (tier === 'good') showToast(`Locked in (±${Math.round(acc)}m)`);
    else if (tier === 'weak') showToast(`Weak signal (±${Math.round(acc)}m) — showing your best available position`);
    _gpsLastTier = tier;
  }

  // 1. Rolling average of recent fixes, weighted heavily toward more
  //    accurate ones — a weak fix still nudges the average, just barely
  _gpsRecent.push({ lng, lat, accuracy: acc });
  if (_gpsRecent.length > GPS_SMOOTH_WINDOW) _gpsRecent.shift();

  let wSum = 0, xSum = 0, ySum = 0;
  for (const f of _gpsRecent) {
    const w = 1 / (f.accuracy * f.accuracy); // inverse-square: good fixes dominate hard
    wSum += w; xSum += f.lng * w; ySum += f.lat * w;
  }
  _gpsSmoothed = [xSum / wSum, ySum / wSum];

  // 2. Only snap onto the path network once we trust the fix — snapping
  //    a genuinely bad fix onto a path can put you on the WRONG path,
  //    which is worse than an honest wide accuracy circle
  let displayPoint = _gpsSmoothed;
  if (tier !== 'weak' && Router.isReady()) {
    const snap = Router.snapToNetwork(_gpsSmoothed);
    if (snap && snap.distM <= GPS_SNAP_MAX_DIST_M) displayPoint = snap.point;
  }

  // Heading: prefer the device compass (works standing still); fall back
  // to GPS-derived heading (only meaningful while moving at real speed)
  if (_gpsHeading == null && heading != null && speed > 0.3) {
    _gpsHeading = heading;
  }

  animateGPSMarkerTo(displayPoint, acc);
  setGPSAccuracyTier(tier);

  if (_gpsFirstFix) {
    map.flyTo({ center: displayPoint, zoom: Math.max(map.getZoom(), 18.5), duration: 900 });
    _gpsFirstFix = false;
  }

  // 3. Live reroute if navigating from "My Location" and we've drifted off route
  if (_gpsActiveRouteTo && tier !== 'weak' && Router.isReady()) {
    maybeRerouteFromGPS(displayPoint, _gpsActiveRouteTo);
  }
}

/* Smoothly glide the marker to its new spot instead of teleporting —
   this alone removes most of the "jumping around" feel of raw GPS. */
function animateGPSMarkerTo(target, accuracy) {
  ensureGPSMarker();

  const from = _gpsDisplayed || target;
  const to   = target;
  const start = performance.now();
  cancelAnimationFrame(_gpsAnimFrame);

  function step(now) {
    const t = Math.min(1, (now - start) / GPS_ANIM_MS);
    const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; // ease-in-out
    const lng = from[0] + (to[0] - from[0]) * eased;
    const lat = from[1] + (to[1] - from[1]) * eased;
    setGPSMarkerPosition([lng, lat], accuracy);
    if (t < 1) _gpsAnimFrame = requestAnimationFrame(step);
    else _gpsDisplayed = to;
  }
  _gpsAnimFrame = requestAnimationFrame(step);
}

function ensureGPSMarker() {
  if (_gpsMarkerEl) return;
  const wrap = document.createElement('div');
  wrap.className = 'gps-dot-wrap';
  wrap.innerHTML = '<div class="gps-heading" id="gpsHeadingArrow"></div><div class="gps-dot"></div>';
  _gpsMarkerEl = new maplibregl.Marker({ element: wrap, anchor: 'center' })
    .setLngLat(map.getCenter()).addTo(map);

  if (!map.getSource(_gpsAccuracyCircleId)) {
    map.addSource(_gpsAccuracyCircleId, {
      type: 'geojson',
      data: { type: 'Feature', geometry: { type: 'Point', coordinates: [0, 0] }, properties: { radiusM: 0 } }
    });
    map.addLayer({
      id: _gpsAccuracyCircleId, type: 'circle', source: _gpsAccuracyCircleId,
      paint: {
        'circle-radius': ['interpolate', ['linear'], ['zoom'], 15, ['/', ['get', 'radiusM'], 4], 20, ['*', ['get', 'radiusM'], 2]],
        'circle-color': '#4285F4', 'circle-opacity': 0.12,
        'circle-stroke-color': '#4285F4', 'circle-stroke-width': 1, 'circle-stroke-opacity': 0.3,
      },
    });
  }
}

function setGPSMarkerPosition([lng, lat], accuracy) {
  if (!_gpsMarkerEl) return;
  _gpsMarkerEl.setLngLat([lng, lat]);
  const src = map.getSource(_gpsAccuracyCircleId);
  if (src) src.setData({ type: 'Feature', geometry: { type: 'Point', coordinates: [lng, lat] }, properties: { radiusM: accuracy } });
  const arrow = document.getElementById('gpsHeadingArrow');
  if (arrow) arrow.style.transform = `rotate(${(_gpsHeading ?? 0) - map.getBearing()}deg)`;
}

// Visually be honest about uncertainty: a weak fix gets a paler dot and a
// dashed accuracy ring, instead of the same confident solid blue dot you'd
// see when we're actually sure where you are.
function setGPSAccuracyTier(tier) {
  if (!_gpsMarkerEl) return;
  const el = _gpsMarkerEl.getElement();
  el.classList.toggle('gps-tier-weak', tier === 'weak');
  el.classList.toggle('gps-tier-ok', tier === 'ok');
  if (map.getLayer(_gpsAccuracyCircleId)) {
    map.setPaintProperty(_gpsAccuracyCircleId, 'circle-stroke-dasharray', tier === 'weak' ? [2, 2] : undefined);
  }
}

function removeGPSMarker() {
  if (_gpsMarkerEl) { _gpsMarkerEl.remove(); _gpsMarkerEl = null; }
  _gpsRecent = []; _gpsSmoothed = null; _gpsDisplayed = null; _gpsHeading = null; _gpsLastTier = null;
}

/* Compass heading — iOS 13+ needs an explicit user-gesture permission
   prompt; other browsers just fire the event. */
function requestCompassPermissionIfNeeded() {
  const DOE = window.DeviceOrientationEvent;
  if (DOE && typeof DOE.requestPermission === 'function') {
    DOE.requestPermission().then(state => {
      if (state === 'granted') window.addEventListener('deviceorientationabsolute', onCompassEvent, true);
    }).catch(() => {});
  } else {
    window.addEventListener('deviceorientationabsolute', onCompassEvent, true);
    window.addEventListener('deviceorientation', onCompassEvent, true); // fallback for browsers w/o "absolute"
  }
}

function onCompassEvent(e) {
  const heading = e.webkitCompassHeading /* iOS Safari */ ?? (e.absolute && e.alpha != null ? 360 - e.alpha : null);
  if (heading != null && !isNaN(heading)) _gpsHeading = heading;
}

/* Recompute the route from wherever the user actually is if they've
   drifted more than GPS_REROUTE_DRIFT_M off the current route line —
   this is the "recalculating…" behaviour Maps apps do on foot. */
let _lastRerouteAt = 0;
function maybeRerouteFromGPS(currentPoint, toBid) {
  const now = Date.now();
  if (now - _lastRerouteAt < 4000) return; // don't spam recompute
  const toCenter = getBuildingCenter(toBid, currentPoint);
  if (!toCenter) return;
  const route = Router.find(currentPoint, toCenter);
  if (route && route.coords.length > 1) {
    drawRoute(route.coords);
    _lastRerouteAt = now;
  }
}
