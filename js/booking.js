// ── booking.js ────────────────────────────────────────────────
import { CAR_SLOTS, TAKEN_SLOTS, RESERVED_SLOTS,
         HANDICAP_SLOTS, getUser, requireAuth, parsePrice } from './app.js';
import { db }        from './firebase-config.js';
import { collection, addDoc, serverTimestamp }
         from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { rtdb }      from './firebase-config.js';
import { ref, get, update }
         from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

let selectedSlot  = null;
let selectedFloor = 'Ground';
const floors = ['Ground','Floor 1','Floor 2','Floor 3'];

export function initBooking() {
  const user = requireAuth();
  if (!user) return;

  const lot = JSON.parse(sessionStorage.getItem('sp_selected_lot') || 'null');
  if (!lot) { window.location.href = 'dashboard.html'; return; }

  // Set parking name in appbar
  document.getElementById('parking-name').textContent = lot.name;

  // Build floor tabs
  const tabsEl = document.getElementById('floor-tabs');
  floors.forEach((f, i) => {
    const t = document.createElement('div');
    t.className = `floor-tab${i===0?' active':''}`;
    t.textContent = f;
    t.onclick = () => { selectedFloor = f; selectedSlot = null;
      document.querySelectorAll('.floor-tab').forEach(x => x.classList.remove('active'));
      t.classList.add('active'); renderSlots(); updateSummaryBar(); };
    tabsEl.appendChild(t);
  });

  renderSlots();
  updateCostBar(lot);

  // Date picker
  const dateEl = document.getElementById('pick-date');
  dateEl.value = new Date().toISOString().split('T')[0];
  dateEl.min   = new Date().toISOString().split('T')[0];

  // Confirm button
  document.getElementById('confirm-btn').onclick = () => confirmBooking(lot);
}

function renderSlots() {
  const container = document.getElementById('slot-grid-container');
  const floorData = CAR_SLOTS[selectedFloor];
  const taken     = TAKEN_SLOTS[selectedFloor]    || [];
  const reserved  = RESERVED_SLOTS[selectedFloor] || [];
  const handicap  = HANDICAP_SLOTS[selectedFloor] || [];

  let html = `<div class="entry-marker"><span class="material-icons" style="font-size:13px">directions_car</span> ENTRY</div>`;

  Object.entries(floorData).forEach(([rowKey, slots], ri) => {
    html += `<div class="row-label"><span style="font-size:10px;font-weight:800;color:var(--text-muted);margin-right:6px">${rowKey}</span>`;
    html += `<div class="slot-grid" style="flex:1">`;
    slots.forEach(s => {
      let cls = 'free';
      if (handicap.includes(s)) cls = 'handicap';
      else if (taken.includes(s))    cls = 'taken';
      else if (reserved.includes(s)) cls = 'reserved';
      if (s === selectedSlot) cls += ' selected';
      const icon = cls.includes('handicap') ? '♿' : s;
      html += `<div class="slot ${cls}" data-slot="${s}" data-status="${cls.replace(' selected','')}">${icon}</div>`;
    });
    html += `</div></div>`;
    html += `<div class="driving-lane">← DRIVING LANE →</div>`;
  });

  container.innerHTML = html;

  // Click handlers for free slots
  container.querySelectorAll('.slot').forEach(el => {
    const st = el.dataset.status;
    if (st === 'taken' || st === 'reserved') return;
    el.addEventListener('click', () => {
      if (selectedSlot === el.dataset.slot) {
        selectedSlot = null;
      } else {
        selectedSlot = el.dataset.slot;
      }
      renderSlots(); updateSummaryBar();
    });
  });
}

function updateCostBar(lot) {
  const from = document.getElementById('pick-from').value || '10:00';
  const to   = document.getElementById('pick-to').value   || '12:00';
  const [fh,fm] = from.split(':').map(Number);
  const [th,tm] = to.split(':').map(Number);
  const mins = Math.max(60, (th*60+tm) - (fh*60+fm));
  const rate = parsePrice(lot.price);
  const cost = ((mins/60) * rate).toFixed(2);
  document.getElementById('cost-duration').textContent = `${Math.floor(mins/60)}h ${mins%60}m`;
  document.getElementById('cost-rate').textContent     = lot.price;
  document.getElementById('cost-est').textContent      = `₹${cost}`;
  return { mins, cost: parseFloat(cost) };
}

function updateSummaryBar() {
  const bar    = document.getElementById('slot-summary');
  const btnEl  = document.getElementById('confirm-btn');
  const plateEl= document.getElementById('plate-input');
  if (selectedSlot) {
    bar.classList.remove('hidden');
    document.getElementById('summary-slot').textContent  = selectedSlot;
    document.getElementById('summary-floor').textContent = `${selectedFloor} · Slot ${selectedSlot}`;
    document.getElementById('summary-plate').textContent = plateEl?.value || 'Enter plate above ↑';
    const costEl = document.getElementById('cost-est');
    document.getElementById('summary-cost').textContent  = costEl ? costEl.textContent : '';
    btnEl.textContent = `Confirm · ${selectedFloor} · Slot ${selectedSlot}`;
    btnEl.disabled    = false;
  } else {
    bar.classList.add('hidden');
    btnEl.textContent = 'Select a Car Slot to Continue';
    btnEl.disabled    = true;
  }
}

async function confirmBooking(lot) {
  const user  = getUser();
  const plate = document.getElementById('plate-input').value.trim().toUpperCase();
  if (!plate) { showToast('Enter your car number plate'); return; }
  if (!selectedSlot) { showToast('Select a slot first'); return; }

  const btn = document.getElementById('confirm-btn');
  btn.innerHTML = '<div class="spinner"></div>';
  btn.disabled  = true;

  try {
    // Save to Firestore
    const bookingRef = await addDoc(collection(db, 'bookings'), {
      userId:    user.uid,
      phone:     user.phone,
      parking:   lot.name,
      floor:     selectedFloor,
      slot:      selectedSlot,
      vehicle:   plate,
      rate:      lot.price,
      status:    'active',
      createdAt: serverTimestamp(),
    });

    // Decrement available in Realtime DB
    const lotRef  = ref(rtdb, `smartpark/parking_lots/${lot.id}`);
    const snap    = await get(lotRef);
    if (snap.exists()) {
      const cur = snap.val().available || 0;
      if (cur > 0) await update(lotRef, { available: cur - 1 });
    }

    // Save booking for success screen
    sessionStorage.setItem('sp_booking', JSON.stringify({
      id: bookingRef.id, lot: lot.name, floor: selectedFloor,
      slot: selectedSlot, plate, rate: lot.price,
    }));

    window.location.href = 'booking-success.html';
  } catch (e) {
    showToast('Booking failed: ' + e.message);
    btn.textContent = `Confirm · ${selectedFloor} · Slot ${selectedSlot}`;
    btn.disabled    = false;
  }
}

function showToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg; t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}

// Expose for inline event handlers
window.updateCostBarFromLot = updateCostBar;
window.updateSummaryBarFromLot = updateSummaryBar;
