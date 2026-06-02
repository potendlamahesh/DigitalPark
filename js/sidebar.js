// ── sidebar.js — injects desktop sidebar into every page ─────
import { getUser, signOut } from './app.js';

export function injectSidebar(activePage) {
  const user = getUser();
  const name  = user?.name || (user?.phone||'').replace('+91','') || 'User';
  const init  = name ? name.trim()[0].toUpperCase() : '?';

  const nav = [
    { href:'dashboard.html',    icon:'home',            label:'Home',       page:'dashboard' },
    { href:'map.html',          icon:'map',             label:'Map',        page:'map'       },
    { href:'search.html',       icon:'search',          label:'Search',     page:'search'    },
    { href:'notifications.html',icon:'bookmark_border', label:'My Bookings',page:'bookings', badge:'2' },
    { href:'qr-scanner.html',   icon:'qr_code_scanner', label:'QR Scanner', page:'qr'        },
  ];
  const nav2 = [
    { href:'profile.html',      icon:'person',          label:'Profile',    page:'profile'   },
    { href:'vehicles.html',     icon:'directions_car',  label:'Vehicles',   page:'vehicles'  },
    { href:'documents.html',    icon:'folder',          label:'Documents',  page:'documents' },
    { href:'settings.html',     icon:'settings',        label:'Settings',   page:'settings'  },
  ];

  const sidebar = document.createElement('nav');
  sidebar.className = 'sidebar-nav';
  sidebar.id = 'sidebar';
  sidebar.innerHTML = `
    <!-- Logo -->
    <div class="sidebar-logo">
      <div class="sidebar-logo-box"><i class="material-icons">local_parking</i></div>
      <div>
        <div class="sidebar-logo-txt">SmartPark</div>
        <div class="sidebar-logo-sub">AI-Powered Parking</div>
      </div>
    </div>

    <!-- Main nav -->
    ${nav.map(item => `
      <a href="${item.href}" class="sidebar-item${activePage===item.page?' active':''}">
        <i class="material-icons">${item.icon}</i>
        ${item.label}
        ${item.badge ? `<div class="sidebar-badge">${item.badge}</div>` : ''}
      </a>`).join('')}

    <div class="sidebar-divider"></div>

    <!-- Secondary nav -->
    ${nav2.map(item => `
      <a href="${item.href}" class="sidebar-item${activePage===item.page?' active':''}">
        <i class="material-icons">${item.icon}</i>
        ${item.label}
      </a>`).join('')}

    <!-- User card at bottom -->
    <div class="sidebar-divider"></div>
    <a href="profile.html" class="sidebar-user" style="text-decoration:none">
      <div class="nav-avatar-circle">${init}</div>
      <div class="sidebar-user-info">
        <div class="sidebar-user-name">${name}</div>
        <div class="sidebar-user-phone">${user?.phone || ''}</div>
      </div>
      <i class="material-icons" style="color:var(--text-muted);font-size:18px">chevron_right</i>
    </a>
  `;

  document.body.insertBefore(sidebar, document.body.firstChild);

  // Wrap content in main-content div for desktop layout
  const wrapper = document.createElement('div');
  wrapper.className = 'main-content';
  const inner = document.createElement('div');
  inner.className = 'page-inner';

  // Move all body children except sidebar into wrapper
  const children = [...document.body.children].filter(c => c !== sidebar);
  children.forEach(c => inner.appendChild(c));
  wrapper.appendChild(inner);
  document.body.appendChild(wrapper);
}
