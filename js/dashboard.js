// ── dashboard.js ─────────────────────────────────────────────
import { PARKING_LOTS, statusColor, statusLabel,
         occupancyPct, greeting, getUser, requireAuth } from './app.js';
import { rtdb }    from './firebase-config.js';
import { ref, onValue } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

export function initDashboard() {
  const user = requireAuth();
  if (!user) return;

  // Set greeting + name
  document.getElementById('greeting-txt').textContent = greeting();
  document.getElementById('user-name').textContent = user.name || user.phone?.replace('+91','') || 'User';

  // Load real-time slot counts from Firebase
  const lotsRef = ref(rtdb, 'smartpark/parking_lots');
  onValue(lotsRef, (snapshot) => {
    const fbData = snapshot.val() || {};
    const lots = PARKING_LOTS.map(lot => ({
      ...lot,
      available: fbData[lot.id]?.available ?? lot.available,
    }));
    renderLots(lots);
  }, () => renderLots(PARKING_LOTS)); // fallback
}

function renderLots(lots) {
  const container = document.getElementById('lots-container');
  if (!container) return;
  container.innerHTML = lots.map(lot => lotCardHTML(lot)).join('');
  // Click handlers
  container.querySelectorAll('.lot-card').forEach((card, i) => {
    card.addEventListener('click', () => {
      sessionStorage.setItem('sp_selected_lot', JSON.stringify(lots[i]));
      window.location.href = 'booking.html';
    });
  });
}

export function lotCardHTML(lot) {
  const col = statusColor(lot);
  const lbl = statusLabel(lot);
  const pct = occupancyPct(lot);
  const featureTags = lot.features.slice(0,3).map(f =>
    `<span class="feature-tag">${f}</span>`).join('');
  return `
  <div class="lot-card">
    <div class="lot-card-body">
      <div class="lot-card-top">
        <div class="lot-icon" style="background:${col}18;border:1px solid ${col}30">
          <i class="material-icons" style="color:${col}">local_parking</i>
        </div>
        <div class="lot-info">
          <div class="lot-name">${lot.name}</div>
          <div class="lot-address"><i class="material-icons" style="font-size:11px">location_on</i> ${lot.address}</div>
          <div class="lot-meta">
            <span><i class="material-icons">star</i> ${lot.rating}</span>
            <span>•</span>
            <span>${lot.available} of ${lot.total} free</span>
          </div>
        </div>
        <div class="lot-price-col">
          <span class="lot-price">${lot.price}</span>
          <span class="badge" style="background:${col}18;color:${col};border:1px solid ${col}30">${lbl}</span>
        </div>
      </div>
      <div class="lot-features">${featureTags}</div>
      <div class="progress-bar">
        <div class="progress-fill" style="width:${pct}%;background:${col}"></div>
      </div>
      <div class="lot-bottom">
        <span class="lot-slots-txt">${lot.available} of ${lot.total} free</span>
        ${lot.available > 0
          ? `<button class="btn btn-primary btn-sm">Book Now</button>`
          : `<span class="badge" style="background:rgba(255,92,92,.1);color:#FF5C5C;border:1px solid rgba(255,92,92,.2)">Full</span>`}
      </div>
    </div>
  </div>`;
}
