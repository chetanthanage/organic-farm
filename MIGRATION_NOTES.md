# Migration Notes — Removing Firebase Storage (Products-Only Firestore)

This converts the previous Storage-backed Admin Panel to a
**Firestore-for-products-only** architecture. If you already
deployed the earlier version and have live data, read this before
re-deploying.

---

## 1. What changed, in one paragraph

Firebase Storage is gone completely — no upload SDK, no bucket, no
`storagePath` field, no file picker. Product photos are now plain
static files in `/images/products/` (moved there from the old flat
`/images/` folder), and the Admin Panel's "Image" field is a **picker
over the existing files** (dropdown + manual path entry), not an
uploader. The gallery — which briefly had its own Firestore
collection + Storage uploads in the previous version — is now fully
static again: a hardcoded array in `index.html` pointing at
`/images/gallery/*.jpg`, with no admin UI and no database involvement
at all.

---

## 2. File/folder changes

| Change | Detail |
|---|---|
| **Moved** | All 187 product photos: `/images/*.jpg` → `/images/products/*.jpg` (including the `Organic_Product.jpg` fallback placeholder) |
| **Unchanged** | `/images/gallery/*.jpg` — already in its own folder, nothing to move |
| **Deleted** | `gallery.js` (no longer needed — gallery has no API, no Firestore, no Storage) |
| **Deleted** | `storage.rules` (no Storage to secure) |
| **Updated** | `products.js` — all 187 `image:` paths now read `images/products/...`; added `PRODUCT_IMAGE_MANIFEST` (the list of files in `/images/products/`, used by the Admin Panel's picker); removed `storagePath` and `uploadProductImage` entirely |
| **Updated** | `firebase-config.js` — no longer initializes `firebase.storage()`; no `storageBucket` key in the config object; no `window.firebaseStorage` global |
| **Updated** | `admin.js` — Gallery tab/manager/upload-modal removed entirely; `ProductFormModal`'s file-upload UI replaced with `ImagePathPicker` (dropdown of `PRODUCT_IMAGE_MANIFEST` + manual text input); no `storagePath` anywhere |
| **Updated** | `index.html` — removed the Firebase Storage SDK `<script>` tag and the `gallery.js` `<script>` tag; `GallerySection` reverted to a fully static inline array (no Firestore subscription); all `Organic_Product.jpg` fallback references updated to `images/products/Organic_Product.jpg` |
| **Updated** | `firestore.rules` — removed the `gallery` collection rules; only `products` remains |
| **Updated** | `firebase.json` — removed the `"storage"` block (no `storage.rules` to deploy) |

---

## 3. If you already have live Firestore data from the previous version

You have two situations:

### A) You only ever clicked "Import Original Catalog" (no manual edits)

Just delete the `products` collection in the Firestore Console and
click **Import Original Catalog** again from the updated Admin
Panel — it will write fresh documents using the new
`images/products/...` paths and no `storagePath` field. This is the
simplest path and is **recommended** unless you've made real edits.

### B) You've manually added/edited products since deploying the old version

Don't delete the collection — update it in place instead:

1. **Drop the `storagePath` field** from every document (it's now
   ignored by the app, but leaving it costs nothing if you'd rather
   skip this step — it's purely cosmetic cleanup).
2. **Check every document's `image` field.** Any image whose path
   still starts with the old flat layout (`images/SomeFile.jpg`
   instead of `images/products/SomeFile.jpg`) needs the prefix
   fixed, OR was uploaded to Firebase Storage in the old version
   (a `https://firebasestorage.googleapis.com/...` URL) and needs to
   be **re-pointed to a local file**:
   - Download the image from its Storage URL.
   - Upload it to `/images/products/` on your host via FTP/file
     manager.
   - Add its filename to `PRODUCT_IMAGE_MANIFEST` in `products.js`
     (see § 4 below).
   - Edit the product in the Admin Panel and pick the new path.
3. Once every document's `image` field is a clean
   `images/products/...` path, you're done — no other field changed
   shape.

A quick way to do steps 1–2 for many documents at once is the
Firebase Console's Firestore data import/export, or a short one-off
script using the Admin SDK — ask if you'd like one written.

---

## 4. Keeping `PRODUCT_IMAGE_MANIFEST` in sync

`products.js` ships with a manifest of the 187 files that exist in
`/images/products/` today, used by the Admin Panel's image picker
dropdown. **This manifest is just a plain JS array — it is not
generated automatically**, because there's no server/build step that
could list the folder for you on a static host.

Whenever you add a new photo to `/images/products/` (via FTP, your
host's file manager, git, etc.), also add its filename to
`PRODUCT_IMAGE_MANIFEST` near the top of `products.js`:

```js
const PRODUCT_IMAGE_MANIFEST = [
  "Aamras_Mango_Pulp.jpg", "Almond_Oil_Cold_Pressed.jpg", /* ... */,
  "Your_New_Photo.jpg",   // ← add new files anywhere in the list
];
```

If you forget, it's not a hard failure — the admin can still type
the path manually in the "or type the path manually" field of the
image picker; the dropdown is just a convenience, not a hard
restriction.

---

## 5. Nothing else changed

Firebase Authentication (login/logout/session persistence/route
protection), the Firestore-backed product CRUD (add/edit/delete/
toggle availability/reorder/search), the static-fallback safety net
(`DEFAULT_PRODUCTS` in `products.js`), and every storefront feature
(WhatsApp ordering, quantity selector, product popup, category
filters, search, mobile responsiveness, Marathi copy, Google Maps
button) are all unchanged from the previous version — only the
image-storage mechanism and the gallery's data source changed.
