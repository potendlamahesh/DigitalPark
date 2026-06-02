# SmartPark Web

## Structure
```
smartpark-web/
├── index.html          ← Landing page
├── login.html          ← Phone OTP login
├── dashboard.html      ← Home with real-time lots
├── search.html         ← Search & filter parking
├── map.html            ← Google Maps view
├── booking.html        ← Slot selection + booking
├── booking-success.html← Confirmation + QR
├── notifications.html  ← Bookings & alerts
├── profile.html        ← User profile
├── vehicles.html       ← My vehicles
├── documents.html      ← Licence, RC, Insurance, PUC
├── settings.html       ← App settings
├── qr-scanner.html     ← Camera QR scanner
├── css/
│   ├── style.css
│   └── responsive.css
├── js/
│   ├── firebase-config.js
│   ├── app.js
│   ├── auth.js
│   ├── dashboard.js
│   ├── booking.js
│   └── map.js
└── assets/
    ├── images/   ← Add 1.jpeg, 2.jpeg, 3.jpeg
    └── icons/
```

## Deploy to GitHub Pages
1. Copy all files to your repo root (or /docs folder)
2. Go to GitHub repo → Settings → Pages
3. Source: main branch, /root (or /docs)
4. Your site: https://potendlamahesh.github.io/SmartPark/

## Firebase Setup
- Project: smartpark-3ab7a
- Auth: Phone OTP (already configured)
- Firestore: bookings, users, documents collections
- Realtime DB: smartpark/parking_lots

## Add Firebase Web App
1. Firebase Console → Project Settings → Add App → Web
2. Copy appId and add to js/firebase-config.js
