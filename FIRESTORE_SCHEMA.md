# Firestore Schema — Organic Farm (Products Only)

Firestore is used for **product data only**. There is no `gallery`
collection, no Storage bucket, and no file/blob fields anywhere in
this schema — every image reference is a plain relative path string
to a file that already exists in `/images/products/`.

---

## Collection: `products`

One document per product. Document ID is Firestore's auto-generated ID.

| Field | Type | Required | Notes |
|---|---|---|---|
| `name` | `string` | ✅ | Marathi product name, e.g. `"उडीद डाळ (सफेद)"` |
| `nameEn` | `string` | ✅ | English product name, e.g. `"Urad Dal (White)"` |
| `category` | `string` | ✅ | One of the 17 category ids in `products.js` → `PRODUCT_CATEGORIES` (e.g. `"Dal"`, `"Vegetables"`, `"Spices"`) |
| `quantity` | `string` | ✅ | Free-form, matches existing catalog convention: no space before `g`/`ml` (`"500g"`, `"250ml"`), space before everything else (`"1 Kg"`, `"2 Pcs"`, `"1 Dozen"`, `"1 Bunch"`, `"1 Litre"`) |
| `price` | `number` | ✅ | Price in ₹ for the stated quantity. Must be `>= 0` (enforced by `firestore.rules` on create) |
| `image` | `string` | ✅ | **Relative local path only** — e.g. `"images/products/tomato.jpg"`. Must point to a file that already exists in `/images/products/` on your host. **Not** a Storage URL, never a `gs://` path, never a download token |
| `available` | `boolean` | ✅ | `true` = orderable, `false` = shows "Out of Stock" badge on the storefront and disables the add-to-cart button |
| `order` | `number` | ✅ | Controls display order on the storefront (ascending). Re-written in bulk by the Admin Panel's reorder buttons |
| `createdAt` | `timestamp` | auto | Set once via `firebase.firestore.FieldValue.serverTimestamp()` |
| `updatedAt` | `timestamp` | auto | Refreshed on every update |

### Example document

```json
{
  "name": "उडीद डाळ (सफेद)",
  "nameEn": "Urad Dal (White)",
  "category": "Dal",
  "quantity": "500g",
  "price": 95,
  "image": "images/products/Urad_Dal_White.jpg",
  "available": true,
  "order": 0,
  "createdAt": "<server timestamp>",
  "updatedAt": "<server timestamp>"
}
```

### Fields intentionally REMOVED from the previous (Storage-based) version

| Removed field | Was used for | Why it's gone |
|---|---|---|
| `storagePath` | Tracking the uploaded file in Firebase Storage so it could be deleted alongside the product | No more uploads — images are static files the app never writes to or deletes |

There is no other collection. The gallery section on the storefront
renders a hardcoded array of `/images/gallery/*.jpg` paths directly
in `index.html` — it is never read from or written to Firestore.

---

## Indexes

A single composite-free index is enough: `products` ordered by
`order` ascending (the default single-field index Firestore creates
automatically — no manual index configuration is required).
`firestore.indexes.json` is included but intentionally empty.

---

## Security model

See `firestore.rules` for the enforced version. Summary:

- **Read**: public (`allow read: if true`) — the storefront must load
  the catalog without anyone logging in.
- **Create**: only `request.auth != null`, plus a minimal shape check
  (`name` is a string, `image` is a string, `price` is a non-negative
  number) to reject obviously malformed writes.
- **Update / Delete**: only `request.auth != null`.
- Everything else (`/{document=**}`): denied by default.
