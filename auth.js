/* ════════════════════════════════════════════════════════════════
   AUTH.JS — Organic Farm Admin Authentication
   ──────────────────────────────────────────────────────────────
   Thin wrapper around Firebase Authentication used by the Admin
   Panel (admin/index.html + admin.js). Provides:
     • login / logout
     • onAuthChange — for session persistence + route protection
     • requireAuth  — guard used before any write operation

   Admin accounts are NOT self-service. There is no sign-up form
   anywhere in this project. Create admin users manually in the
   Firebase Console → Authentication → Users → "Add user".
   Only authenticated users (verified server-side by Firestore
   Security Rules, not just this client check) can write data.
   ════════════════════════════════════════════════════════════════ */

const AuthService = (function(){

  function isConfigured(){
    return !!(window.firebaseEnabled && window.firebaseAuth);
  }

  /* ── Log in with email + password. Returns the Firebase user. ── */
  async function login(email, password){
    if(!isConfigured()) throw new Error("Firebase is not configured. See SETUP_GUIDE.md.");
    const cred = await window.firebaseAuth.signInWithEmailAndPassword(
      String(email).trim(), password
    );
    return cred.user;
  }

  /* ── Log out the current admin. ── */
  async function logout(){
    if(!isConfigured()) return;
    await window.firebaseAuth.signOut();
  }

  /* ── Subscribe to auth state changes (login/logout/session restore).
        Used by the admin app for route protection + session
        persistence across page reloads. Returns an unsubscribe fn. ── */
  function onAuthChange(callback){
    if(!isConfigured()){
      // No Firebase configured → never authenticated.
      callback(null);
      return ()=>{};
    }
    return window.firebaseAuth.onAuthStateChanged(callback);
  }

  function getCurrentUser(){
    return isConfigured() ? window.firebaseAuth.currentUser : null;
  }

  function isLoggedIn(){
    return !!getCurrentUser();
  }

  /* ── Friendly error messages for the login form. ── */
  function friendlyError(err){
    const code = err && err.code || "";
    switch(code){
      case "auth/invalid-email":      return "Please enter a valid email address.";
      case "auth/user-disabled":      return "This admin account has been disabled.";
      case "auth/user-not-found":
      case "auth/wrong-password":
      case "auth/invalid-credential": return "Incorrect email or password.";
      case "auth/too-many-requests":  return "Too many attempts. Please wait and try again.";
      default:
        return err && err.message ? err.message : "Login failed. Please try again.";
    }
  }

  return { login, logout, onAuthChange, getCurrentUser, isLoggedIn, friendlyError, isConfigured };
})();

window.AuthService = AuthService;
