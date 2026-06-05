// ── map.js — Google Maps integration ─────────────────────────
import { PARKING_LOTS, statusColor, statusLabel } from './app.js';
import { rtdb }    from './firebase-config.js';
import { ref, onValue } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

let map, markers = [], infoWindow;

export function initMap() {
  // Load Google Maps
  const script = document.createElement('script');
  script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyAu3UNQd4oQodx5wiuoIPyTsgqShnCgGBs=onMapReady`;
  script.async = true; script.defer = true;
  document.head.appendChild(script);
  window.onMapReady = _initMap;
}

function _initMap() {
  const GUNTUR = { lat: 16.3067, lng: 80.4365 };

  map = new google.maps.Map(document.getElementById('google-map'), {
    center:    GUNTUR,
    zoom:      14,
    mapTypeId: 'roadmap',
    styles: [
      { featureType:'poi',       stylers:[{visibility:'off'}] },
      { featureType:'transit',   stylers:[{visibility:'off'}] },
      { featureType:'road',      elementType:'geometry', stylers:[{color:'#ffffff'}] },
      { featureType:'landscape', elementType:'geometry', stylers:[{color:'#f5f5f5'}] },
      { featureType:'water',     elementType:'geometry', stylers:[{color:'#bfdbfe'}] },
    ],
    disableDefaultUI:   true,
    zoomControl:        false,
    fullscreenControl:  false,
    streetViewControl:  false,
  });
  const miniMap = new google.maps.Map(
  document.getElementById("duplicate-map"),
  {
    center: GUNTUR,
    zoom: 13,
    disableDefaultUI: true,
    mapTypeId: "roadmap"
  }
);

  infoWindow = new google.maps.InfoWindow();

  // Try get user location
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(pos => {
      map.setCenter({ lat: pos.coords.latitude, lng: pos.coords.longitude });
    });
  }

  // Listen to Realtime DB for live slot counts
  const lotsRef = ref(rtdb, 'smartpark/parking_lots');
  onValue(lotsRef, snap => {
    const fbData = snap.val() || {};
    const lots = PARKING_LOTS.map(l => ({
      ...l, available: fbData[l.id]?.available ?? l.available
    }));
    renderMarkers(lots);
    renderBottomCards(lots);
  }, () => { renderMarkers(PARKING_LOTS); renderBottomCards(PARKING_LOTS); });
}

function renderMarkers(lots) {
  markers.forEach(m => m.setMap(null)); markers = [];

  lots.forEach(lot => {
    const col = statusColor(lot);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="50" viewBox="0 0 40 50">
      <circle cx="20" cy="20" r="18" fill="${col}" stroke="white" stroke-width="2"/>
      <text x="20" y="25" text-anchor="middle" font-size="16" font-weight="900" fill="black">P</text>
      <path d="M20 38 L14 26 Q20 40 26 26 Z" fill="${col}"/>
    </svg>`;

    const marker = new google.maps.Marker({
      position: { lat: lot.lat, lng: lot.lng },
      map,
      icon: { url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg), scaledSize: new google.maps.Size(40,50) },
      title: lot.name,
    });

    marker.addListener('click', () => {
      infoWindow.setContent(`
        <div style="font-family:sans-serif;padding:4px;min-width:160px">
          <b style="font-size:14px">${lot.name}</b><br>
          <span style="color:#666;font-size:12px">${lot.address}</span><br>
          <span style="color:${col};font-weight:700;font-size:13px">${statusLabel(lot)}</span>
          &nbsp;·&nbsp;${lot.price}<br>
          <a href="booking.html" onclick="sessionStorage.setItem('sp_selected_lot','${JSON.stringify(lot).replace(/'/g,"\\'")}');return true"
            style="color:#00C6A2;font-weight:700;font-size:12px">Book Now →</a>
        </div>`);
      infoWindow.open(map, marker);
      sessionStorage.setItem('sp_selected_lot', JSON.stringify(lot));
    });
    markers.push(marker);
  });
}

function renderBottomCards(lots) {
  const container = document.getElementById('map-lot-cards');
  if (!container) return;
  container.innerHTML = lots.map((lot, i) => {
    const col = statusColor(lot);
    return `
    <div class="map-lot-card" style="min-width:200px;background:#fff;border:1px solid #E2E8F0;border-radius:14px;padding:12px;cursor:pointer;box-shadow:0 2px 12px rgba(0,0,0,.06)"
      onclick="sessionStorage.setItem('sp_selected_lot',JSON.stringify(${JSON.stringify(lot).replace(/"/g,'&quot;')}));window.location.href='booking.html'">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
        <b style="font-size:13px">${lot.name}</b>
        <span style="background:${col}18;color:${col};border:1px solid ${col}30;padding:2px 8px;border-radius:100px;font-size:10px;font-weight:700">${statusLabel(lot)}</span>
      </div>
      <div style="font-size:11px;color:#9BAAB8;margin-bottom:6px">${lot.address}</div>
      <div style="display:flex;justify-content:space-between;align-items:center">
        <span style="font-size:11px;color:#9BAAB8">★ ${lot.rating}</span>
        <b style="font-size:13px;color:#00C6A2">${lot.price}</b>
      </div>
    </div>`;
  }).join('');
}
