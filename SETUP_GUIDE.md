# Organic Farm — Firebase Setup & Deployment Guide

This guide walks through everything needed to turn on the dynamic
Admin Panel. **The storefront works today, exactly as before, even
if you skip this guide** — it only needs Firebase once you want the
Admin Panel to manage products instead of editing code.

> Firestore is used for **product data only**. The gallery is fully
> static (plain files in `/images/gallery/`) and product photos are
> plain static files in `/images/products/` — there is no Firebase
> Storage anywhere in this project. See `FIRESTORE_SCHEMA.md` for
> the full data model and `MIGRATION_NOTES.md` if you're upgrading
> from an earlier Storage-based version.

---

## 0. How the fallback system works (read this first)

Every page that needs data (`index.html` and `admin/index.html`) now
loads `firebase-config.js`. That file checks whether you've filled in
real Firebase credentials:

- **Not configured yet** → `window.firebaseEnabled = false`. The
  storefront silently uses the original static catalog
  (`DEFAULT_PRODUCTS` in `products.js`). The Admin Panel shows a
  "Setup Required" screen.
- **Configured** → the storefront subscribes to Firestore in
  real-time. If the `products` collection is still empty, it
  automatically falls back to the same static data — so there's
  never a broken/empty catalog, even right after you connect
  Firebase for the first time.

This means you can deploy this updated code immediately with **zero
risk** to the live site, then connect Firebase whenever you're ready.

---

## 1. Create a Firebase project

1. Go to <https://console.firebase.google.com> and click **Add
   project**.
2. Name it (e.g. `organic-farm-nashik`) and finish the wizard (Google
   Analytics is optional — you can skip it).

## 2. Enable Authentication

1. In the left sidebar, go to **Build → Authentication → Get
   started**.
2. Under **Sign-in method**, enable **Email/Password**.
3. Go to the **Users** tab → **Add user**. Enter the admin's email
   and a strong password.
   - ⚠️ There is **no public sign-up page** anywhere in this project
     by design. This is the *only* way to create an admin account —
     repeat this step for every additional admin/staff member.

## 3. Enable Firestore Database

1. Go to **Build → Firestore Database → Create database**.
2. Choose **Production mode** (we ship our own security rules — see
   step 5).
3. Pick a location close to your users (e.g. `asia-south1` for
   India).

> There is no Storage step — Firebase Storage is not used anywhere
> in this project. If your Firebase project happens to have Storage
> enabled from something else, it's simply unused by this app.

## 4. Get your Web App config

1. Go to **Project settings** (gear icon, top-left) → scroll to
   **Your apps** → click the **Web** icon (`</>`).
2. Register an app (any nickname, e.g. "Organic Farm Web").
3. Firebase shows a `firebaseConfig` object. Copy it.
4. Open **`firebase-config.js`** in this project and paste your
   values in place of the `YOUR_...` placeholders:

```js
const firebaseConfig = {
  apiKey:            "AIza...",
  authDomain:         "organic-farm-nashik.firebaseapp.com",
  projectId:          "organic-farm-nashik",
  messagingSenderId:  "123456789012",
  appId:              "1:123456789012:web:abcdef123456",
};
```

   (Note there is no `storageBucket` field — it's intentionally
   omitted since this app never touches Storage.)

5. Save the file. That's it — no rebuild step needed, just re-upload
   this one file to your host.

## 5. Deploy the security rules

These rules make sure **only your logged-in admin account** can ever
add/edit/delete products — everyone else gets read-only access (so
the storefront can still display the catalog).

**Option A — Firebase CLI (recommended):**

```bash
npm install -g firebase-tools
firebase login
# from the project root (where firebase.json lives):
firebase use --add        # pick your project, alias it "default"
firebase deploy --only firestore:rules
```

**Option B — Copy/paste in the Console:**

- Firestore: **Firestore Database → Rules** tab → paste the contents
  of `firestore.rules` → **Publish**.

## 6. Add your product photos

Make sure every photo referenced by a product is already sitting in
`/images/products/` on your host (FTP, hosting file manager, git
push — whatever you normally use to update site files). This project
never uploads images for you; the Admin Panel only lets you *pick* a
path from what's already there. The original 187 product photos
ship in this folder already.

If you add a brand-new photo later, also add its filename to
`PRODUCT_IMAGE_MANIFEST` near the top of `products.js` so it shows up
in the Admin Panel's image picker dropdown (see `MIGRATION_NOTES.md`
§ 4 for the exact format).

## 7. Import your existing catalog (one click)

1. Re-upload the updated project files to your host (or open
   `admin/index.html` locally via a static server — see note below).
2. Visit `yourdomain.com/admin` and log in with the admin account you
   created in step 2.
3. Click **Import Original Catalog** — this copies all 187 existing
   products into Firestore in one go (safe to click once; it refuses
   to run again if products already exist, so it never duplicates
   data).
4. From here on, use the Admin Panel to add, edit, delete, reorder,
   search, and toggle availability — changes appear on the live
   storefront instantly (no redeploy needed).

> **Local testing note:** Because the Admin Panel loads `admin.js`
> via `<script type="text/babel" src="../admin.js">`, it needs to be
> served over `http(s)://`, not opened directly as a `file://` path.
> Any static server works, e.g. from the project root:
> `npx serve .` or VS Code's "Live Server" extension, then visit
> `http://localhost:.../admin`.

---

## 8. Hosting / deployment instructions

This project remains 100% static files — deploy it anywhere that
serves static sites.

### Firebase Hosting (easiest, since you already have a Firebase project)

```bash
firebase init hosting   # if you haven't already; point "public" to "."
firebase deploy --only hosting
```

`firebase.json` is already included and configured (`public: "."`).
Firebase Hosting serves `/admin/index.html` automatically when
visiting `/admin`.

### Netlify

1. Drag-and-drop the project folder into Netlify, or connect your
   Git repo.
2. Build command: none. Publish directory: `.` (project root).
3. Netlify serves `/admin/index.html` for the `/admin` route
   automatically (directory index resolution).

### GitHub Pages

1. Push this project to a repository.
2. Settings → Pages → set source to the branch/folder containing
   these files.
3. `https://yourusername.github.io/repo/admin/` will serve the admin
   panel (GitHub Pages requires the trailing slash for folder
   index pages — link to it that way, or add a redirect if you want
   the exact `/admin` path without a slash).

### Custom domain (any host above)

All three options above support attaching a custom domain through
their respective dashboards (Firebase Hosting → **Add custom
domain**; Netlify → **Domain settings**; GitHub Pages → **Custom
domain** field). DNS changes (CNAME/A records) are configured with
your domain registrar as instructed by your chosen host — nothing in
this codebase needs to change for a custom domain to work.

---

## 9. Firestore data shape (quick reference)

See `FIRESTORE_SCHEMA.md` for the full field-by-field breakdown.

**`products/{id}`**
```
name: string            // Marathi name
nameEn: string           // English name
category: string         // one of the PRODUCT_CATEGORIES ids in products.js
quantity: string         // e.g. "500g", "1 Kg", "2 Pcs"
price: number
image: string             // LOCAL relative path only, e.g. "images/products/tomato.jpg"
available: boolean
order: number              // controls display order
createdAt / updatedAt: server timestamps
```

There is no `gallery` collection — the gallery is a hardcoded array
in `index.html` pointing at static files in `/images/gallery/`.

---

## 10. Troubleshooting

| Symptom | Likely cause |
|---|---|
| Storefront shows old/static products after editing in admin | `firebase-config.js` still has placeholder values, or Firestore rules weren't deployed |
| Admin login fails with "Incorrect email or password" | Double-check the user was created in **Authentication → Users**, not just any Google account |
| A product's image doesn't show on the storefront | The path in Firestore doesn't match an actual file in `/images/products/` — check spelling/case, or that the file was actually uploaded to your host |
| New photo doesn't appear in the Admin Panel's image dropdown | Add its filename to `PRODUCT_IMAGE_MANIFEST` in `products.js` (or just type the path manually in the picker — the dropdown is a convenience, not a requirement) |
| `/admin` shows a blank page | Make sure you're serving over http(s), not opening the file directly (see local testing note above) |
