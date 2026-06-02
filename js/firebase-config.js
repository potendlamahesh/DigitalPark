import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth }       from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore }  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getDatabase }   from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

const firebaseConfig = {
  apiKey:            "AIzaSyA_nPJbs2us5UhKPsrxSvZfpc1YQXhakAg",
  authDomain:        "smartpark-3ab7a.firebaseapp.com",
  databaseURL:       "https://smartpark-3ab7a-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId:         "smartpark-3ab7a",
  storageBucket:     "smartpark-3ab7a.firebasestorage.app",
  messagingSenderId: "628381544097",
  appId:             "1:628381544097:web:ADD_YOUR_WEB_APP_ID_HERE"
};

export const app  = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db   = getFirestore(app);
export const rtdb = getDatabase(app);
