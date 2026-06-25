/* ════════════════════════════════════════════════════════════════
   ADMIN.JS — Organic Farm Admin Panel
   ──────────────────────────────────────────────────────────────
   Self-contained React app (same CDN React + Babel-standalone
   pattern as the storefront — no build step) mounted into
   admin/index.html at #admin-root.

   SCOPE: Firestore is used for PRODUCT DATA ONLY. There is no
   Firebase Storage anywhere in this app — no file uploads, no
   storage bucket, no storagePath fields. Product photos are
   static files in /images/products/; the admin picks a path from
   that folder (via window.PRODUCT_IMAGE_MANIFEST in products.js),
   and only the relative path string is ever written to Firestore.
   The gallery is fully static (plain images/gallery/ files in
   index.html) and has no admin UI at all.

   Structure:
     • LoginScreen      — email/password login (Firebase Auth)
     • AdminApp         — route guard + session persistence
     • Sidebar          — branding + logout (single section: Products)
     • ProductsManager  — full CRUD + reorder + availability + search
     • ProductFormModal — add/edit product (local image PATH PICKER,
                          no upload)

   All writes go through window.ProductsAPI (products.js), which in
   turn enforces `requireAuth()` client-side — and Firestore
   Security Rules enforce it server-side (see firestore.rules), so
   this page can never be used to write data unless truly logged in.
   ════════════════════════════════════════════════════════════════ */

const {useState, useEffect, useMemo, useRef} = React;

/* ════════════════════════════════════════════════════
   NOT CONFIGURED BANNER
   Shown if firebase-config.js still has placeholder
   values — guides the owner to SETUP_GUIDE.md instead
   of silently failing.
   ════════════════════════════════════════════════════ */
function NotConfiguredScreen(){
  return(
    <div className="adm-login-wrap">
      <div className="adm-login-card" style={{maxWidth:460}}>
        <div className="adm-login-logo">
          <div className="adm-brand-badge adm-brand-badge--warn">
            <span className="adm-brand-name">Sudarshan</span>
            <span className="adm-brand-organic">Organic</span>
            <span className="adm-brand-rule"/>
            <span className="adm-brand-sub">Farm &amp; Store</span>
          </div>
        </div>
        <p className="adm-login-sub" style={{marginBottom:0}}>
          Firebase hasn't been configured yet. Open <code>firebase-config.js</code> and
          replace the placeholder values with your Firebase project's credentials,
          then enable Authentication and Firestore Database.
          Full step-by-step instructions are in <code>SETUP_GUIDE.md</code>.
        </p>
        <a className="adm-back-link" href="/">← Back to storefront</a>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════
   LOGIN SCREEN
   ════════════════════════════════════════════════════ */
function LoginScreen(){
  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e)=>{
    e.preventDefault();
    setError("");
    if(!email.trim() || !password){
      setError("Please enter both email and password.");
      return;
    }
    setLoading(true);
    try{
      await window.AuthService.login(email, password);
      // onAuthChange (subscribed in AdminApp) will flip the view automatically.
    }catch(err){
      setError(window.AuthService.friendlyError(err));
    }finally{
      setLoading(false);
    }
  };

  return(
    <div className="adm-login-wrap">
      <form className="adm-login-card" onSubmit={handleSubmit}>
        <div className="adm-login-logo">
          <div className="adm-brand-badge">
            <span className="adm-brand-name">Sudarshan</span>
            <span className="adm-brand-organic">Organic</span>
            <span className="adm-brand-rule"/>
            <span className="adm-brand-sub">Farm &amp; Store</span>
          </div>
        </div>
        <p className="adm-login-sub">Admin Panel — authorized access only</p>

        {error && <div className="adm-err-box"><i className="fa-solid fa-circle-exclamation" style={{marginRight:6}}/>{error}</div>}

        <div className="adm-fg">
          <label>Email</label>
          <input type="email" autoComplete="username" value={email} onChange={e=>setEmail(e.target.value)} placeholder="admin@example.com" disabled={loading}/>
        </div>
        <div className="adm-fg">
          <label>Password</label>
          <input type="password" autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" disabled={loading}/>
        </div>

        <button className="adm-btn-primary" type="submit" disabled={loading}>
          {loading?<><span className="adm-spinner"/>Signing in…</>:<><i className="fa-solid fa-right-to-bracket"/>Log In</>}
        </button>

        <a className="adm-back-link" href="/">← Back to storefront</a>
      </form>
    </div>
  );
}

/* ════════════════════════════════════════════════════
   SIDEBAR
   ════════════════════════════════════════════════════ */
function Sidebar({user, onLogout, section, onSection}){
  return(
    <aside className="adm-sidebar">
      <div className="adm-sidebar-logo">
        <div className="adm-brand-badge adm-brand-badge--sidebar">
          <span className="adm-brand-name adm-brand-name--sidebar">Sudarshan</span>
          <span className="adm-brand-organic adm-brand-organic--sidebar">Organic</span>
          <span className="adm-brand-rule"/>
          <span className="adm-brand-sub adm-brand-sub--sidebar">Farm &amp; Store</span>
        </div>
      </div>
      <nav className="adm-nav">
        <button className={`adm-nav-btn${section==="products"?" active":""}`} onClick={()=>onSection("products")}>
          <i className="fa-solid fa-carrot"/> Products
        </button>
        <button className={`adm-nav-btn${section==="categories"?" active":""}`} onClick={()=>onSection("categories")}>
          <i className="fa-solid fa-layer-group"/> Categories
        </button>
        <a className="adm-nav-btn" href="/" target="_blank" rel="noreferrer">
          <i className="fa-solid fa-arrow-up-right-from-square"/> View Site
        </a>
      </nav>
      <div className="adm-sidebar-footer">
        <div className="adm-user-email"><i className="fa-solid fa-circle-user" style={{marginRight:6}}/>{user && user.email}</div>
        <button className="adm-logout-btn" onClick={onLogout}><i className="fa-solid fa-right-from-bracket"/> Log Out</button>
      </div>
    </aside>
  );
}

/* ════════════════════════════════════════════════════
   IMAGE PATH PICKER
   Lets the admin choose a photo that already exists in
   /images/products/ — no upload, no Firebase Storage.
   Combines a dropdown (browse the manifest) with a text
   input (manual override, e.g. for a file just added via
   FTP that hasn't been added to the manifest yet).
   ════════════════════════════════════════════════════ */
function ImagePathPicker({value, onChange}){
  const manifest = window.PRODUCT_IMAGE_MANIFEST || [];
  const currentFile = value ? value.replace(/^images\/products\//,"") : "";
  const previewSrc = value || "images/products/Organic_Product.jpg";

  return(
    <div className="adm-fg">
      <label>Product Image</label>
      <img
        className="adm-img-preview"
        src={previewSrc.startsWith("../")?previewSrc:`../${previewSrc}`}
        alt=""
        onError={e=>{e.target.src="../images/products/Organic_Product.jpg";}}
      />

      <label style={{fontSize:".76rem",color:"var(--text-muted)",fontWeight:600,display:"block",marginBottom:4}}>
        Choose from /images/products/
      </label>
      <select
        value={manifest.includes(currentFile)?currentFile:""}
        onChange={e=>{ if(e.target.value) onChange(`images/products/${e.target.value}`); }}
        style={{marginBottom:10}}
      >
        <option value="">— select an existing image —</option>
        {manifest.map(f=>(
          <option key={f} value={f}>{f}</option>
        ))}
      </select>

      <label style={{fontSize:".76rem",color:"var(--text-muted)",fontWeight:600,display:"block",marginBottom:4}}>
        or type the path manually
      </label>
      <input
        value={value}
        onChange={e=>onChange(e.target.value)}
        placeholder="images/products/tomato.jpg"
      />
      <p style={{fontSize:".74rem",color:"var(--text-muted)",margin:"6px 0 0"}}>
        Images aren't uploaded here — add the file to <code>/images/products/</code> on
        your host first (FTP / hosting file manager), then pick or type its path.
      </p>
    </div>
  );
}

/* ════════════════════════════════════════════════════
   PRODUCT FORM MODAL — Add / Edit
   ════════════════════════════════════════════════════ */
function ProductFormModal({product, onClose, onSaved}){
  const isEdit = !!product;

  function guessUnit(q){
    const m = String(q).match(/[a-zA-Z]+/);
    return m ? m[0] : "Kg";
  }

  const [form, setForm] = useState({
    name:      product?.name      || "",
    nameEn:    product?.nameEn    || "",
    category:  product?.category  || "Vegetables",
    qtyNum:    product ? (parseFloat(product.quantity) || "") : "",
    qtyUnit:   product?.quantity ? guessUnit(product.quantity) : "Kg",
    price:     product?.price     || "",
    available: product?.available !== false,
    image:     product?.image     || "images/products/Organic_Product.jpg",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (k,v)=>setForm(f=>({...f,[k]:v}));

  const handleSubmit = async (e)=>{
    e.preventDefault();
    setError("");
    if(!form.name.trim() || !form.nameEn.trim()){ setError("Please fill in both name fields."); return; }
    if(!form.qtyNum || Number(form.qtyNum)<=0){ setError("Please enter a valid quantity."); return; }
    if(!form.price || Number(form.price)<=0){ setError("Please enter a valid price."); return; }
    if(!form.image.trim()){ setError("Please choose or enter an image path."); return; }

    setSaving(true);
    try{
      const noSpaceUnits = ["g","ml"]; // matches original catalog convention (e.g. "500g","250ml" vs "1 Kg","2 Pcs")
      const payload = {
        name:      form.name.trim(),
        nameEn:    form.nameEn.trim(),
        category:  form.category,
        quantity:  `${form.qtyNum}${noSpaceUnits.includes(form.qtyUnit)?form.qtyUnit:" "+form.qtyUnit}`,
        price:     Number(form.price),
        available: !!form.available,
        image:     form.image.trim(),
      };

      if(isEdit){
        // Always pass the Firestore document id string — never the full product object.
        const docId = product.id;
        if(typeof docId !== "string" || !docId.trim()){
          throw new Error("Cannot update product: missing or invalid document id.");
        }
        await window.ProductsAPI.updateProduct(docId, payload);
      }else{
        await window.ProductsAPI.addProduct(payload);
      }
      onSaved();
    }catch(err){
      console.error(err);
      setError(err.message || "Failed to save product.");
    }finally{
      setSaving(false);
    }
  };

  return(
    <div className="adm-modal-backdrop" onClick={onClose}>
      <div className="adm-modal" onClick={e=>e.stopPropagation()}>
        <h3>{isEdit?"Edit Product":"Add New Product"}</h3>
        {error && <div className="adm-err-box">{error}</div>}
        <form onSubmit={handleSubmit}>

          <ImagePathPicker value={form.image} onChange={v=>set("image",v)}/>

          <div className="adm-fg-row">
            <div className="adm-fg">
              <label>Name (Marathi) *</label>
              <input value={form.name} onChange={e=>set("name",e.target.value)} placeholder="उडीद डाळ"/>
            </div>
            <div className="adm-fg">
              <label>Name (English) *</label>
              <input value={form.nameEn} onChange={e=>set("nameEn",e.target.value)} placeholder="Urad Dal"/>
            </div>
          </div>

          <div className="adm-fg">
            <label>Category</label>
            <select value={form.category} onChange={e=>set("category",e.target.value)}>
              {(window.PRODUCT_CATEGORIES||[]).filter(c=>c.id!=="All").map(c=>(
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </div>

          <div className="adm-fg-row">
            <div className="adm-fg">
              <label>Quantity *</label>
              <input type="number" min="0" step="any" value={form.qtyNum} onChange={e=>set("qtyNum",e.target.value)} placeholder="500"/>
            </div>
            <div className="adm-fg">
              <label>Unit *</label>
              <select value={form.qtyUnit} onChange={e=>set("qtyUnit",e.target.value)}>
                <option value="g">Gram (g)</option>
                <option value="Kg">Kilogram (Kg)</option>
                <option value="ml">Millilitre (ml)</option>
                <option value="Litre">Litre</option>
                <option value="Pcs">Piece (Pcs)</option>
                <option value="Dozen">Dozen</option>
                <option value="Bunch">Bunch</option>
                <option value="Packet">Packet</option>
              </select>
            </div>
          </div>

          <div className="adm-fg">
            <label>Price (₹) *</label>
            <input type="number" min="0" step="any" value={form.price} onChange={e=>set("price",e.target.value)} placeholder="95"/>
          </div>

          <div className="adm-toggle-row">
            <span style={{fontWeight:600,fontSize:".86rem"}}>Available for ordering</span>
            <label style={{display:"inline-flex",alignItems:"center",gap:8,cursor:"pointer"}}>
              <input type="checkbox" checked={form.available} onChange={e=>set("available",e.target.checked)} style={{width:18,height:18}}/>
              {form.available?"Yes":"No"}
            </label>
          </div>

          <div className="adm-modal-actions">
            <button type="button" className="adm-btn adm-btn-outline" onClick={onClose} disabled={saving}>Cancel</button>
            <button type="submit" className="adm-btn adm-btn-green" disabled={saving}>
              {saving?<><span className="adm-spinner"/>Saving…</>:<><i className="fa-solid fa-floppy-disk"/>Save Product</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════
   PRODUCTS MANAGER
   ════════════════════════════════════════════════════ */
function ProductsManager(){
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("All");
  const [modal, setModal] = useState(null); // null | "new" | productObj
  const [banner, setBanner] = useState(null);
  const [seeding, setSeeding] = useState(false);
  const [busyId, setBusyId] = useState(null);

  useEffect(()=>{
    const unsub = window.ProductsAPI.subscribeProducts(
      (list)=>{ setProducts(list); setLoading(false); },
      ()=>setLoading(false)
    );
    return unsub;
  },[]);

  const filtered = useMemo(()=>{
    let list = [...products];
    if(catFilter!=="All") list = list.filter(p=>p.category===catFilter);
    if(search.trim()){
      const q = search.toLowerCase();
      list = list.filter(p=>p.name.toLowerCase().includes(q)||p.nameEn.toLowerCase().includes(q));
    }
    return list;
  },[products,search,catFilter]);

  const handleDelete = async (p)=>{
    if(!confirm(`Delete "${p.nameEn}"? This cannot be undone. (Its image file in /images/products/ is not deleted.)`)) return;
    setBusyId(p.id);
    try{
      await window.ProductsAPI.deleteProduct(p.id);
    }catch(err){
      setBanner({type:"error", text: err.message});
    }finally{
      setBusyId(null);
    }
  };

  const handleToggleAvailable = async (p)=>{
    setBusyId(p.id);
    try{
      await window.ProductsAPI.setAvailability(p.id, !(p.available!==false));
    }catch(err){
      setBanner({type:"error", text: err.message});
    }finally{
      setBusyId(null);
    }
  };

  const dragIdx = useRef(null);
  const [dragOver, setDragOver] = useState(null);

  const reorderTo = async (fromIdx, toIdx)=>{
    if(fromIdx === toIdx) return;
    const newFiltered = [...filtered];
    const [moved] = newFiltered.splice(fromIdx, 1);
    newFiltered.splice(toIdx, 0, moved);
    const filteredIds = new Set(filtered.map(p=>p.id));
    const fullOrder = [...products.map(p=>p.id)];
    const slots = fullOrder.map((id,i)=>filteredIds.has(id)?i:null).filter(i=>i!==null);
    slots.forEach((slot,i)=>{ fullOrder[slot] = newFiltered[i].id; });
    try{
      await window.ProductsAPI.reorderProducts(fullOrder);
    }catch(err){
      setBanner({type:"error", text: err.message});
    }
  };

  const handleDragStart = (idx)=>{ dragIdx.current = idx; };
  const handleDragOver  = (e, idx)=>{ e.preventDefault(); setDragOver(idx); };
  const handleDrop      = async (idx)=>{ setDragOver(null); await reorderTo(dragIdx.current, idx); dragIdx.current = null; };
  const handleDragEnd   = ()=>{ setDragOver(null); dragIdx.current = null; };

  const handleMoveToPos = async (idx, rawVal)=>{
    const pos = parseInt(rawVal, 10);
    if(isNaN(pos)) return;
    const toIdx = Math.max(0, Math.min(filtered.length-1, pos-1));
    await reorderTo(idx, toIdx);
  };

  const handleSeed = async ()=>{
    if(!confirm("Import the original 187-product catalog into Firestore? This only runs once (skipped automatically if products already exist).")) return;
    setSeeding(true);
    try{
      const count = await window.ProductsAPI.seedDefaultProducts();
      setBanner({type:"success", text:`Imported ${count} products into Firestore.`});
    }catch(err){
      setBanner({type:"error", text: err.message});
    }finally{
      setSeeding(false);
    }
  };

  return(
    <div>
      <div className="adm-topbar">
        <div>
          <h1 className="adm-title">Products</h1>
          <p className="adm-sub">{products.length} product{products.length!==1?"s":""} {window.firebaseEnabled?"· live from Firestore":"· static fallback data"}</p>
        </div>
        <div style={{display:"flex",gap:10}}>
          {window.firebaseEnabled && (
            <button className="adm-btn adm-btn-outline" onClick={handleSeed} disabled={seeding}>
              {seeding?<><span className="adm-spinner"/>Importing…</>:<><i className="fa-solid fa-cloud-arrow-up"/>Import Original Catalog</>}
            </button>
          )}
          <button className="adm-btn adm-btn-green" onClick={()=>setModal("new")} disabled={!window.firebaseEnabled}>
            <i className="fa-solid fa-plus"/> Add Product
          </button>
        </div>
      </div>

      {!window.firebaseEnabled && (
        <div className="adm-banner warn"><i className="fa-solid fa-triangle-exclamation"/> Firebase isn't configured — showing read-only static catalog. See SETUP_GUIDE.md to enable editing.</div>
      )}
      {banner && (
        <div className={`adm-banner ${banner.type}`} onClick={()=>setBanner(null)} style={{cursor:"pointer"}}>
          <i className="fa-solid fa-circle-info"/> {banner.text} <span style={{marginLeft:"auto",opacity:.6}}>✕</span>
        </div>
      )}

      <div className="adm-card">
        <div className="adm-toolbar">
          <div className="adm-search">
            <i className="fa-solid fa-magnifying-glass"/>
            <input placeholder="Search products…" value={search} onChange={e=>setSearch(e.target.value)}/>
          </div>
          <select className="adm-select" value={catFilter} onChange={e=>setCatFilter(e.target.value)}>
            {(window.PRODUCT_CATEGORIES||[{id:"All",label:"All"}]).map(c=>(
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </select>
        </div>

        {loading?(
          <div className="adm-empty"><span className="adm-spinner" style={{borderTopColor:"var(--green)",borderColor:"rgba(45,106,79,.25)"}}/> Loading products…</div>
        ):filtered.length===0?(
          <div className="adm-empty"><i className="fa-solid fa-box-open" style={{fontSize:"1.8rem",marginBottom:8,display:"block"}}/>No products found.</div>
        ):(
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr>
                  <th title="Drag to reorder"></th><th>Product</th><th>Category</th><th>Qty</th><th>Price</th><th>Status</th><th title="Type a position number to jump">Pos</th><th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p,idx)=>(
                  <tr key={p.id}
                    draggable={window.firebaseEnabled}
                    onDragStart={()=>handleDragStart(idx)}
                    onDragOver={e=>handleDragOver(e,idx)}
                    onDrop={()=>handleDrop(idx)}
                    onDragEnd={handleDragEnd}
                    style={{
                      cursor:window.firebaseEnabled?"grab":"default",
                      background:dragOver===idx?"var(--cream-dark)":undefined,
                      borderTop:dragOver===idx?"2px solid var(--green)":undefined,
                      opacity:dragIdx.current===idx?.4:1,
                      transition:"background .15s",
                    }}
                  >
                    <td style={{paddingRight:0}}>
                      {window.firebaseEnabled && <i className="fa-solid fa-grip-vertical" style={{color:"var(--text-muted)",fontSize:".8rem",cursor:"grab"}}/>}
                      <img className="adm-thumb" src={p.image} alt="" onError={e=>{e.target.src="../images/products/Organic_Product.jpg";}} style={{marginLeft:8}}/>
                    </td>
                    <td><div className="adm-pname">{p.name}</div><div className="adm-pname-en">{p.nameEn}</div></td>
                    <td>{p.category}</td>
                    <td>{p.quantity}</td>
                    <td>₹{p.price}</td>
                    <td>
                      <button
                        className={`adm-badge ${p.available!==false?"ok":"no"}`}
                        style={{border:"none",cursor:window.firebaseEnabled?"pointer":"default"}}
                        onClick={()=>window.firebaseEnabled && handleToggleAvailable(p)}
                        disabled={busyId===p.id || !window.firebaseEnabled}
                      >
                        <i className={`fa-solid ${p.available!==false?"fa-check":"fa-xmark"}`}/>
                        {p.available!==false?"Available":"Out of Stock"}
                      </button>
                    </td>
                    <td>
                      <input
                        type="number"
                        min="1"
                        max={filtered.length}
                        defaultValue={idx+1}
                        key={`${p.id}-${idx}`}
                        disabled={!window.firebaseEnabled}
                        onBlur={e=>handleMoveToPos(idx, e.target.value)}
                        onKeyDown={e=>{ if(e.key==="Enter"){ e.target.blur(); } }}
                        style={{width:54,padding:"5px 7px",border:"1.5px solid var(--cream-dark)",borderRadius:8,fontFamily:"inherit",fontSize:".82rem",textAlign:"center"}}
                        title="Type a position number and press Enter"
                      />
                    </td>
                    <td>
                      <div className="adm-row-actions">
                        <button className="adm-icon-btn" disabled={!window.firebaseEnabled} onClick={()=>setModal(p)} title="Edit"><i className="fa-solid fa-pen"/></button>
                        <button className="adm-icon-btn danger" disabled={!window.firebaseEnabled||busyId===p.id} onClick={()=>handleDelete(p)} title="Delete"><i className="fa-solid fa-trash"/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal && (
        <ProductFormModal
          product={modal==="new"?null:modal}
          onClose={()=>setModal(null)}
          onSaved={()=>{setModal(null); setBanner({type:"success",text:"Product saved."});}}
        />
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════
   CATEGORIES MANAGER
   Shows all categories (except "All" which is pinned
   first) with Up / Down arrow buttons to reorder them.
   Order is saved to Firestore (settings/categoryOrder).
   ════════════════════════════════════════════════════ */
function CategoriesManager(){
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [banner, setBanner]         = useState(null);

  /* Subscribe to live category order */
  useEffect(()=>{
    const unsub = window.CategoriesAPI.subscribeCategories(cats=>{
      setCategories(cats);
      setLoading(false);
    });
    return unsub;
  },[]);

  /* Move a category up or down by one position (skips "All" pin) */
  const move = async (idx, dir)=>{
    /* idx is the index in the full categories array (All is at 0).
       The moveable range starts at 1. */
    const newCats = [...categories];
    const targetIdx = idx + dir;
    /* Guard: never move "All", never go out of bounds */
    if(idx <= 1 && dir === -1) return; // "All" at 0, first moveable at 1
    if(targetIdx <= 0) return;
    if(targetIdx >= newCats.length) return;
    [newCats[idx], newCats[targetIdx]] = [newCats[targetIdx], newCats[idx]];
    /* Optimistic UI update */
    setCategories(newCats);
    setSaving(true);
    try{
      await window.CategoriesAPI.reorderCategories(newCats.map(c=>c.id));
      setBanner({type:"success", text:"Category order saved."});
      setTimeout(()=>setBanner(null), 2500);
    }catch(err){
      /* Revert on failure */
      setCategories([...categories]);
      setBanner({type:"error", text: err.message});
    }finally{
      setSaving(false);
    }
  };

  /* Reset to default order */
  const handleReset = async ()=>{
    if(!confirm("Reset categories to the default order?")) return;
    setSaving(true);
    try{
      const defaultIds = window.CategoriesAPI.defaultOrder();
      await window.CategoriesAPI.reorderCategories(defaultIds);
      setBanner({type:"success", text:"Category order reset to default."});
      setTimeout(()=>setBanner(null), 2500);
    }catch(err){
      setBanner({type:"error", text: err.message});
    }finally{
      setSaving(false);
    }
  };

  /* Count products per category */
  const productCounts = useMemo(()=>{
    const counts = {};
    (window.DEFAULT_PRODUCTS||[]).forEach(p=>{
      counts[p.category] = (counts[p.category]||0)+1;
    });
    return counts;
  },[]);

  return(
    <div>
      <div className="adm-topbar">
        <div>
          <h1 className="adm-title">Categories</h1>
          <p className="adm-sub">
            {categories.length-1} categories &nbsp;·&nbsp;
            Drag or use ↑ ↓ to reorder &nbsp;·&nbsp;
            <em style={{color:"var(--text-muted)",fontStyle:"normal"}}>"All" is always pinned first</em>
          </p>
        </div>
        <button className="adm-btn adm-btn-outline" onClick={handleReset} disabled={saving||!window.firebaseEnabled}>
          <i className="fa-solid fa-arrow-rotate-left"/> Reset Order
        </button>
      </div>

      {!window.firebaseEnabled && (
        <div className="adm-banner warn"><i className="fa-solid fa-triangle-exclamation"/> Firebase isn't configured — category order cannot be saved. Configure Firebase to enable editing.</div>
      )}
      {banner && (
        <div className={`adm-banner ${banner.type}`} onClick={()=>setBanner(null)} style={{cursor:"pointer"}}>
          <i className={`fa-solid ${banner.type==="success"?"fa-circle-check":"fa-circle-exclamation"}`}/> {banner.text} <span style={{marginLeft:"auto",opacity:.6}}>✕</span>
        </div>
      )}

      <div className="adm-card">
        {loading ? (
          <div className="adm-empty">
            <span className="adm-spinner" style={{borderTopColor:"var(--green)",borderColor:"rgba(45,106,79,.25)"}}/>
            {" "}Loading categories…
          </div>
        ) : (
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr>
                  <th style={{width:42}}>#</th>
                  <th>Category</th>
                  <th>ID</th>
                  <th style={{width:80,textAlign:"center"}}>Products</th>
                  <th style={{width:110,textAlign:"center"}}>Move</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat, idx)=>{
                  const isPinned = cat.id === "All";
                  const isFirst  = idx === 1; // first moveable
                  const isLast   = idx === categories.length - 1;
                  return(
                    <tr key={cat.id} className={isPinned?"adm-cat-pinned-row":""}>
                      <td style={{color:"var(--text-muted)",fontWeight:700,fontSize:".8rem"}}>{idx+1}</td>
                      <td>
                        <div style={{display:"flex",alignItems:"center",gap:10}}>
                          {isPinned && (
                            <span className="adm-cat-pin-badge"><i className="fa-solid fa-thumbtack"/> Pinned</span>
                          )}
                          <div>
                            <div className="adm-pname" style={{fontSize:".88rem"}}>{cat.label}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{fontFamily:"monospace",fontSize:".78rem",color:"var(--text-muted)"}}>{cat.id}</td>
                      <td style={{textAlign:"center"}}>
                        {!isPinned && (
                          <span className="adm-badge ok" style={{justifyContent:"center"}}>
                            {productCounts[cat.id]||0}
                          </span>
                        )}
                      </td>
                      <td style={{textAlign:"center"}}>
                        {!isPinned && (
                          <div className="adm-cat-move-btns">
                            <button
                              className="adm-cat-move-btn"
                              title="Move up"
                              disabled={isFirst || saving || !window.firebaseEnabled}
                              onClick={()=>move(idx,-1)}
                            >
                              <i className="fa-solid fa-chevron-up"/>
                            </button>
                            <button
                              className="adm-cat-move-btn"
                              title="Move down"
                              disabled={isLast || saving || !window.firebaseEnabled}
                              onClick={()=>move(idx,1)}
                            >
                              <i className="fa-solid fa-chevron-down"/>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════
   DASHBOARD SHELL (after login)
   ════════════════════════════════════════════════════ */
function Dashboard({user, onLogout}){
  const [section, setSection] = useState("products");
  return(
    <div className="adm-shell">
      <Sidebar user={user} onLogout={onLogout} section={section} onSection={setSection}/>
      <main className="adm-main">
        {section==="products"  && <ProductsManager/>}
        {section==="categories"&& <CategoriesManager/>}
      </main>
    </div>
  );
}

/* ════════════════════════════════════════════════════
   ROOT APP — route protection + session persistence
   ════════════════════════════════════════════════════ */
function AdminApp(){
  const [authState, setAuthState] = useState("checking"); // checking | out | in
  const [user, setUser] = useState(null);

  useEffect(()=>{
    if(!window.firebaseEnabled){
      setAuthState("not-configured");
      return;
    }
    // onAuthStateChanged fires once immediately with the restored
    // session (if any), then again on every login/logout — this is
    // what gives us session persistence + route protection.
    const unsub = window.AuthService.onAuthChange((u)=>{
      setUser(u);
      setAuthState(u ? "in" : "out");
    });
    return unsub;
  },[]);

  const handleLogout = async ()=>{
    await window.AuthService.logout();
  };

  if(authState==="not-configured") return <NotConfiguredScreen/>;
  if(authState==="checking"){
    return(
      <div className="adm-login-wrap">
        <div style={{color:"#fff",display:"flex",alignItems:"center",gap:10,fontWeight:600}}>
          <span className="adm-spinner"/> Checking session…
        </div>
      </div>
    );
  }
  if(authState==="out") return <LoginScreen/>;
  return <Dashboard user={user} onLogout={handleLogout}/>;
}

ReactDOM.createRoot(document.getElementById("admin-root")).render(<AdminApp/>);
