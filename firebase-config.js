/* ════════════════════════════════════════════════════════════════
   FIREBASE-CONFIG.JS — Organic Farm
   ──────────────────────────────────────────────────────────────
   Initializes Firebase (Auth + Firestore ONLY) using the COMPAT
   SDK so it works with plain <script> tags — no bundler, no build
   step, fully compatible with static hosting (Firebase Hosting,
   Netlify, GitHub Pages, or your own custom domain).

   ⚠️ Firebase Storage is intentionally NOT used anywhere in this
   project. All product images live as static files in
   /images/products/ and all gallery images live as static files
   in /images/gallery/ — Firestore only ever stores a relative
   path string (e.g. "images/products/tomato.jpg"), never a file
   or a Storage URL. There is no storageBucket reference and no
   upload code anywhere in this codebase.

   ⚠️ SETUP REQUIRED:
   1. Create a Firebase project at https://console.firebase.google.com
   2. Enable: Authentication (Email/Password) and Firestore Database
      (see SETUP_GUIDE.md for step-by-step instructions).
   3. Replace the placeholder values below with YOUR project's
      config (Project Settings → General → "Your apps" → Web app).
   4. Manually create one admin user under
      Authentication → Users → "Add user" (email + password).
      There is NO public sign-up page by design — only people you
      create as Firebase Auth users can log into /admin.

   The site is designed to keep working with the original static
   product catalog even if this config is left as placeholders or
   Firestore is unreachable — see products.js (DEFAULT_PRODUCTS).
   ════════════════════════════════════════════════════════════════ */

const firebaseConfig = {
  apiKey:            "YOUR_API_KEY",
  authDomain:         "YOUR_PROJECT_ID.firebaseapp.com",
  projectId:          "YOUR_PROJECT_ID",
  messagingSenderId:  "YOUR_SENDER_ID",
  appId:              "YOUR_APP_ID",
};

/* Detect whether the placeholders above have been replaced.
   If not, we skip Firebase init entirely and the site silently
   runs in "static fallback" mode (original hardcoded catalog). */
const isFirebaseConfigured =
  firebaseConfig.apiKey && !firebaseConfig.apiKey.startsWith("YOUR_") &&
  firebaseConfig.projectId && !firebaseConfig.projectId.startsWith("YOUR_");

window.firebaseEnabled = false;

if(isFirebaseConfigured && typeof firebase !== "undefined"){
  try{
    firebase.initializeApp(firebaseConfig);

    const auth = firebase.auth();
    const db   = firebase.firestore();

    /* Keep the admin logged in across browser restarts/tabs
       until they explicitly log out (session persistence). */
    auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
      .catch(err=>console.error("Firebase Auth persistence error:", err));

    window.firebaseApp  = firebase.app();
    window.firebaseAuth = auth;
    window.firebaseDB   = db;
    window.firebaseEnabled = true;

    console.log("✅ Firebase initialized (Auth + Firestore) — dynamic product catalog active.");
  }catch(err){
    console.error("❌ Firebase initialization failed — falling back to static catalog.", err);
    window.firebaseEnabled = false;
  }
}else{
  console.warn(
    "⚠️ Firebase is not configured yet (firebase-config.js still has placeholder values).\n" +
    "The storefront will keep working using the original static product catalog.\n" +
    "See SETUP_GUIDE.md to enable the Admin Panel."
  );
}
