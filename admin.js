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
        <div className="adm-login-logo"><div className="ico"><i className="fa-solid fa-triangle-exclamation"/></div>Setup Required</div>
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
        <div className="adm-login-logo"><div className="ico"><i className="fa-solid fa-leaf"/></div>Organic Farm</div>
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
   (Single section now — Products only. Gallery has no
   admin UI since it's fully static.)
   ════════════════════════════════════════════════════ */
function Sidebar({user, onLogout}){
  return(
    <aside className="adm-sidebar">
      <div className="adm-sidebar-logo"><i className="fa-solid fa-leaf" style={{color:"var(--gold-light)"}}/>Organic Farm</div>
      <nav className="adm-nav">
        <button className="adm-nav-btn active" disabled>
          <i className="fa-solid fa-carrot"/> Products
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
        await window.ProductsAPI.updateProduct(product.id, payload);
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

  const move = async (idx, dir)=>{
    const target = idx+dir;
    if(target<0 || target>=filtered.length) return;
    // Reorder within the *full* list (products), based on filtered display order
    const fullOrder = products.map(p=>p.id);
    const a = filtered[idx].id, b = filtered[target].id;
    const ia = fullOrder.indexOf(a), ib = fullOrder.indexOf(b);
    [fullOrder[ia], fullOrder[ib]] = [fullOrder[ib], fullOrder[ia]];
    try{
      await window.ProductsAPI.reorderProducts(fullOrder);
    }catch(err){
      setBanner({type:"error", text: err.message});
    }
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
                  <th></th><th>Product</th><th>Category</th><th>Qty</th><th>Price</th><th>Status</th><th>Order</th><th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p,idx)=>(
                  <tr key={p.id}>
                    <td><img className="adm-thumb" src={p.image} alt="" onError={e=>{e.target.src="../images/products/Organic_Product.jpg";}}/></td>
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
                      <div style={{display:"flex",gap:4}}>
                        <button className="adm-icon-btn" disabled={idx===0||!window.firebaseEnabled} onClick={()=>move(idx,-1)} title="Move up"><i className="fa-solid fa-arrow-up"/></button>
                        <button className="adm-icon-btn" disabled={idx===filtered.length-1||!window.firebaseEnabled} onClick={()=>move(idx,1)} title="Move down"><i className="fa-solid fa-arrow-down"/></button>
                      </div>
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
   DASHBOARD SHELL (after login)
   Only one section now — Products. (Gallery is fully
   static and has no admin UI — see GallerySection in
   index.html.)
   ════════════════════════════════════════════════════ */
function Dashboard({user, onLogout}){
  return(
    <div className="adm-shell">
      <Sidebar user={user} onLogout={onLogout}/>
      <main className="adm-main">
        <ProductsManager/>
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
