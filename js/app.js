// ── SmartPark — Parking Lots Data ────────────────────────────
export const PARKING_LOTS = [
  { id:'l1', name:'City Mall Parking',     address:'MG Road, Guntur',         price:'₹20/hr', available:14, total:60, rating:4.5, lat:16.3067, lng:80.4365, features:['Covered','24/7','EV','CCTV'], covered:true,  open24:true,  ev:true,  cctv:true  },
  { id:'l2', name:'Railway Station Lot',   address:'Station Road, Guntur',    price:'₹15/hr', available:3,  total:40, rating:4.1, lat:16.2994, lng:80.4571, features:['Open','24/7','Security'],    covered:false, open24:true,  ev:false, cctv:true  },
  { id:'l3', name:'Tech Park Tower B',     address:'Auto Nagar, Guntur',      price:'₹25/hr', available:28, total:80, rating:4.7, lat:16.3189, lng:80.4512, features:['Covered','EV','Valet'],      covered:true,  open24:false, ev:true,  cctv:true  },
  { id:'l4', name:'Govt Plaza',            address:'Collectorate, Guntur',    price:'₹10/hr', available:0,  total:30, rating:3.8, lat:16.3042, lng:80.4502, features:['Open','Security'],           covered:false, open24:false, ev:false, cctv:false },
  { id:'l5', name:'Central Market',        address:'Old Town, Guntur',        price:'₹12/hr', available:7,  total:50, rating:4.0, lat:16.2918, lng:80.4428, features:['Open','Covered','24/7'],     covered:true,  open24:true,  ev:false, cctv:false },
  { id:'l6', name:'Hospital Street Lot',   address:'Brodipet, Guntur',        price:'₹8/hr',  available:20, total:35, rating:4.3, lat:16.3098, lng:80.4390, features:['Open','Security'],           covered:false, open24:false, ev:false, cctv:true  },
];

export const CAR_SLOTS = {
  Ground: {
    A:['A01','A02','A03','A04','A05','A06','A07','A08'],
    B:['B01','B02','B03','B04','B05','B06','B07','B08'],
  },
  'Floor 1': {
    C:['C01','C02','C03','C04','C05','C06','C07','C08'],
    D:['D01','D02','D03','D04','D05','D06','D07','D08'],
  },
  'Floor 2': {
    E:['E01','E02','E03','E04','E05','E06','E07','E08'],
    F:['F01','F02','F03','F04','F05','F06','F07','F08'],
  },
  'Floor 3': {
    G:['G01','G02','G03','G04','G05','G06','G07','G08'],
    H:['H01','H02','H03','H04','H05','H06','H07','H08'],
  },
};

export const TAKEN_SLOTS   = { Ground:['A03','A05','A07','B01','B03','B05'], 'Floor 1':['C02','C04','D03','D06'], 'Floor 2':[], 'Floor 3':['G01'] };
export const RESERVED_SLOTS= { Ground:['A08','B06'],                         'Floor 1':['C07'],                  'Floor 2':['E04'], 'Floor 3':[] };
export const HANDICAP_SLOTS = { Ground:['A01','B08'],                         'Floor 1':['C01','D08'],             'Floor 2':['E01'], 'Floor 3':['G01'] };

// ── Helpers ───────────────────────────────────────────────────
export function statusColor(lot) {
  if (lot.available === 0)  return '#FF5C5C';
  if (lot.available <= 5)   return '#FFB547';
  return '#00C6A2';
}
export function statusLabel(lot) {
  if (lot.available === 0)  return 'Full';
  if (lot.available <= 5)   return `${lot.available} left`;
  return `${lot.available} free`;
}
export function occupancyPct(lot) {
  return Math.round(((lot.total - lot.available) / lot.total) * 100);
}
export function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning ☀️';
  if (h < 17) return 'Good Afternoon 👋';
  return 'Good Evening 🌙';
}
export function navigate(page) {
  window.location.href = page;
}
export function formatPrice(p) { return p; }

// ── Auth guard — redirect to login if not logged in ───────────
export function requireAuth() {
  const user = JSON.parse(sessionStorage.getItem('sp_user') || 'null');
  if (!user) { window.location.href = 'login.html'; return null; }
  return user;
}
export function saveUser(user) {
  sessionStorage.setItem('sp_user', JSON.stringify(user));
}
export function getUser() {
  return JSON.parse(sessionStorage.getItem('sp_user') || 'null');
}
export function signOut() {
  sessionStorage.removeItem('sp_user');
  window.location.href = 'login.html';
}

// ── Also expose window functions for pages that need them ─────
if (typeof window !== 'undefined') {
  window.SP = { navigate, getUser, signOut };
}
