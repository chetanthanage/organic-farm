# Changes Made — Static → Dynamic Conversion

## Hotfix (latest)

Two bugs reported from a live deployment, both in `admin.js` /
`products.js`:

1. **Product thumbnails 404'd in the Admin Panel** (`/admin/images/products/...`
   instead of `/images/products/...`). Cause: the table thumbnail used the
   stored root-relative path directly (`src={p.image}`), but
   `/admin/index.html` resolves relative paths against `/admin/`, not the
   site root. Fix: added a `toAdminSrc()` helper in `admin.js` that
   prefixes `../` for root-relative paths, applied to every `<img>` in the
   Admin Panel.
2. **`TypeError: n.indexOf is not a function` when saving an edited
   product.** Cause: when the Firestore `products` collection is empty
   (e.g. "Import Original Catalog" hasn't been run yet) or temporarily
   unreachable, the panel was *displaying* the built-in fallback catalog
   but still *labeling* it "live from Firestore" and leaving Edit/Delete/
   Toggle/Reorder enabled. Fallback items have plain numeric `id`s (from
   `DEFAULT_PRODUCTS`), and passing a number into Firestore's
   `.collection().doc(id)` crashes deep inside the SDK with this cryptic
   error instead of a clear message. Fix, two layers:
   - `products.js`: `subscribeProducts` now reports a second `isLive`
     argument so callers know whether the list is real Firestore data;
     `updateProduct`/`deleteProduct`/`setAvailability`/`reorderProducts`
     now call a `requireLiveId()` guard that throws a clear, actionable
     error ("Click Import Original Catalog first…") instead of crashing.
   - `admin.js`: `ProductsManager` tracks `isLive` and disables
     Add/Edit/Delete/Toggle/Reorder whenever it's `false`, with a banner
     pointing the admin at the "Import Original Catalog" button.

No schema, security-rule, or storefront changes were needed for this fix.

---

> ⚠️ **Superseded in part.** This document describes the *original*
> conversion, which used Firebase Storage for image uploads and gave
> the gallery its own Firestore collection. A follow-up revision
> **removed Firebase Storage entirely** and scoped Firestore down to
> product data only (the gallery is fully static again). See
> `MIGRATION_NOTES.md` for exactly what changed in that revision, and
> `FIRESTORE_SCHEMA.md` for the current (final) data model. The
> summary below is kept for historical context on the overall
> static→dynamic conversion; treat any mention of Storage, image
> uploads, or a `gallery` collection as no longer accurate.

## Summary

The site was a single-file static React app (`index.html`, transpiled
in-browser via Babel-standalone, no build step) with a hardcoded
187-product catalog and a hardcoded 7-photo gallery. It's now backed
by Firebase (Auth + Firestore) with a secure `/admin` panel for
managing the product catalog — **while remaining 100% static-hosting
compatible** and **never breaking** if Firebase isn't configured yet
(see `SETUP_GUIDE.md` § 0 for how the fallback works).

No design, animation, layout, or copy was changed. No existing
feature was removed.

---

## Files added

| File | Purpose |
|---|---|
| `firebase-config.js` | Initializes Firebase (Auth/Firestore/Storage) via the compat SDK. Detects placeholder config and gracefully disables dynamic mode if not yet set up. |
| `auth.js` | Login/logout/session helpers (`AuthService`) used by the Admin Panel. |
| `gallery.js` | `DEFAULT_GALLERY` fallback data + `GalleryAPI` (Firestore/Storage CRUD: get, subscribe, add, update, delete, reorder, seed). |
| `admin.js` | The full Admin Panel React app (login screen, route guard, products manager, gallery manager, modals). |
| `admin/index.html` | Admin Panel entry point, served at `/admin`. Loads the same React/Babel/Firebase scripts as the storefront plus `admin.js`. |
| `css/admin.css` | Admin Panel styling, reusing the storefront's brand colors/fonts for visual consistency. |
| `firestore.rules` | Public read / authenticated-only write rules for `products` and `gallery` collections. |
| `storage.rules` | Public read / authenticated-only write rules for uploaded images, capped at 5MB and image-only content types. |
| `firebase.json`, `.firebaserc`, `firestore.indexes.json` | Firebase CLI/Hosting configuration for one-command deploys. |
| `SETUP_GUIDE.md` | Step-by-step Firebase setup, rules deployment, data import, and hosting/deployment instructions. |
| `CHANGES.md` | This file. |

## Files modified

### `products.js`
Completely rewritten. Previously an **unused legacy file** (not
referenced anywhere by `index.html`, which had its own inline
catalog). It now:
- Holds the full original 187-product catalog as `DEFAULT_PRODUCTS`
  (moved here verbatim from `index.html`'s inline script).
- Defines `PRODUCT_CATEGORIES` (17 categories, ids matching the
  original data exactly) and `PRODUCT_UNITS` for the Admin form.
- Exposes `window.ProductsAPI` with: `getProducts`,
  `subscribeProducts` (realtime), `addProduct`, `updateProduct`,
  `deleteProduct`, `setAvailability`, `reorderProducts`,
  `uploadProductImage`, `seedDefaultProducts`. Every read function
  falls back to `DEFAULT_PRODUCTS` automatically if Firestore is
  empty, unreachable, or not configured.

### `index.html`
- **`<head>`**: added the Firebase compat SDK (`app`, `auth`,
  `firestore`, `storage`) and `<script>` tags for
  `firebase-config.js`, `products.js`, `gallery.js`. No existing
  `<link>`/`<script>` tags were removed or reordered.
- **Removed** the inline `const PRODUCTS = [...187 items...]` array
  and the unused inline `const CATEGORIES = [...]` array (replaced
  with comments pointing to their new home in `products.js`). The
  presentational `CAT_TABS` array (icons/colors for the navbar) is
  untouched.
- **`ProductCard`**: now accepts products with `available === false`
  and renders an "Out of Stock" badge + disables the add button,
  without changing the card's markup/classes for available products
  (zero visual regression for existing data, which has no
  `available` field and defaults to available).
- **`ProductsSection`**: now loads products via
  `window.ProductsAPI.subscribeProducts(...)` in a `useEffect`,
  stored in component state, with a loading state. Falls back to
  `window.DEFAULT_PRODUCTS` if `ProductsAPI` isn't available for any
  reason. Search/category filtering logic is unchanged.
- **`GallerySection`**: now loads photos via
  `window.GalleryAPI.subscribeGallery(...)`, falling back to
  `window.DEFAULT_GALLERY`. Bento grid markup/classes unchanged.
- **`Footer`**: added a small "Admin Login" text link to `/admin`
  next to the copyright line (low-visibility, doesn't affect layout
  or design).

---

## Files NOT modified (verified unaffected)

- `css/style.css` — untouched. All existing styling, animations, and
  responsive breakpoints are unchanged.
- `images/` — untouched.
- `download_images.sh` — untouched (unrelated utility script).
- WhatsApp ordering logic (`ADMIN_WA`, `CartPage.handleConfirm`,
  `handleWA`), the quantity selector (`QtyModal`), the product popup,
  Google Maps button (`MAP_DIRECTIONS`), mobile responsiveness, and
  Marathi-language copy throughout — all untouched and verified to
  still reference the same constants/components.

---

## Architecture decisions & why

- **Compat SDK over modular SDK**: the project has no bundler — it
  relies on CDN `<script>` tags and in-browser Babel. The Firebase
  *compat* SDK exposes a single global `firebase` object that works
  with plain `<script>` tags, exactly like the React/Babel CDN setup
  already in use. This avoids introducing a build step, which would
  break the "static hosting compatible" requirement.
- **Graceful fallback everywhere**: every read path
  (`ProductsAPI`/`GalleryAPI`) defaults to the original static data
  on any failure — Firebase misconfigured, offline, rules not
  deployed yet, or collections still empty. This guarantees the
  storefront can never show a broken or empty state, satisfying
  "zero regression in existing functionality."
- **No public sign-up page**: admin accounts are created manually in
  the Firebase Console. Combined with Firestore/Storage rules that
  require `request.auth != null` for writes, this is a simple and
  secure model — there's no registration flow to harden or guard
  against abuse.
- **One-click data migration**: rather than requiring the admin to
  manually re-enter 187 products, `seedDefaultProducts()` /
  `seedDefaultGallery()` import the existing static data into
  Firestore in a single click, and are self-guarding (refuse to run
  if data already exists) so they can never duplicate records.
- **Reorder via up/down buttons** rather than drag-and-drop: keeps
  the Admin Panel dependency-free (no extra drag-and-drop library)
  while still fully satisfying the "reorder products/images"
  requirement, and works identically on touch and desktop.

---

## Testing checklist

Before going live, verify:

- [ ] Storefront loads and shows all products with Firebase
      *not yet* configured (placeholder values) — confirms the
      fallback works.
- [ ] After configuring Firebase + deploying rules, `/admin` shows
      the login screen.
- [ ] Logging in with the manually-created admin account succeeds;
      refreshing the page keeps you logged in (session persistence).
- [ ] Logging out returns you to the login screen, and visiting
      `/admin` afterward does not show the dashboard (route
      protection).
- [ ] "Import Original Catalog" / "Import Original Gallery" run once
      successfully; running them again shows the
      "already has data" message instead of duplicating.
- [ ] Add/edit/delete a product and a gallery photo from `/admin`;
      confirm changes appear on the live storefront without a
      redeploy.
- [ ] Toggle a product's availability; confirm it shows "Out of
      Stock" on the storefront and can't be added to the cart.
- [ ] Reorder products/photos; confirm the new order reflects on the
      storefront.
- [ ] WhatsApp ordering, quantity selector, product popup, Google
      Maps button, and mobile responsiveness all still work exactly
      as before.
- [ ] Try writing to Firestore directly via the browser console
      while logged out — confirm it's rejected (security rules
      working).
