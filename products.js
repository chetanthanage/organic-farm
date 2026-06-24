/* ════════════════════════════════════════════════════════════════
   PRODUCTS.JS — Organic Farm
   ──────────────────────────────────────────────────────────────
   Responsibilities:
   1. DEFAULT_PRODUCTS  — the original 187-item static catalog.
      Used as a graceful fallback when Firestore is empty,
      unreachable, or not yet configured — so the storefront
      NEVER breaks, even before the admin migrates data.
   2. PRODUCT_CATEGORIES — canonical category list used by the
      Admin Panel's "Category" dropdown (kept in sync with the
      category tabs on the storefront).
   3. PRODUCT_IMAGE_MANIFEST — list of files in /images/products/,
      used by the Admin Panel's image picker (no Firebase Storage
      / no uploads — images are local static files only).
   4. window.ProductsAPI — Firestore-backed CRUD + realtime sync
      for PRODUCT DATA ONLY (name/price/category/quantity/
      availability/image path/order). Used by both the public
      storefront (read-only) and the Admin Panel (full read/write).

   This file is loaded as a plain classic <script> (no bundler),
   so everything is attached to `window` for both index.html and
   admin/index.html to consume.

   NOTE: The gallery is fully static (see GallerySection in
   index.html) and does NOT use Firestore or Storage — this file
   and the Admin Panel only manage the product catalog.
   ════════════════════════════════════════════════════════════════ */

const DEFAULT_PRODUCTS = [
  /* ─── DAL & PULSES ─── */
  {id:1, name:"उडीद डाळ (सफेद)", nameEn:"Urad Dal (White)", category:"Dal", quantity:"500g", price:95,
   image:"images/products/Urad_Dal_White.jpg"},
  {id:2, name:"मसूर डाळ", nameEn:"Masur Dal", category:"Dal", quantity:"500g", price:80,
   image:"images/products/Masur_Dal.jpg"},
  {id:3, name:"हरभरा डाळ", nameEn:"Harbhara Dal (Chana)", category:"Dal", quantity:"500g", price:70,
   image:"images/products/Harbhara_Dal_Chana.jpg"},
  {id:4, name:"मूंग डाळ", nameEn:"Moong Dal", category:"Dal", quantity:"500g", price:85,
   image:"images/products/Moong_Dal.jpg"},
  {id:5, name:"तूर डाळ", nameEn:"Tur Dal", category:"Dal", quantity:"500g", price:90,
   image:"images/products/Tur_Dal.jpg"},
  {id:6, name:"छोले (काबुली चना)", nameEn:"Chole / Chickpeas", category:"Dal", quantity:"500g", price:80,
   image:"images/products/Chole__Chickpeas.jpg"},
  {id:7, name:"राजमा", nameEn:"Rajma", category:"Dal", quantity:"500g", price:100,
   image:"images/products/Rajma.jpg"},
  {id:8, name:"चवळी", nameEn:"Chavali (Black-eyed peas)", category:"Dal", quantity:"500g", price:75,
   image:"images/products/Chavali_Blackeyed_peas.jpg"},

  /* ─── GRAINS ─── */
  {id:9, name:"गहू", nameEn:"Wheat", category:"Grains", quantity:"1 Kg", price:55,
   image:"images/products/Wheat.jpg"},
  {id:10, name:"बाजरी", nameEn:"Bajra (Pearl Millet)", category:"Grains", quantity:"1 Kg", price:40,
   image:"images/products/Bajra_Pearl_Millet.jpg"},
  {id:11, name:"बासमती तांदूळ", nameEn:"Basmati Rice", category:"Grains", quantity:"1 Kg", price:130,
   image:"images/products/Basmati_Rice.jpg"},
  {id:12, name:"इंद्रायणी तांदूळ", nameEn:"Indrayani Rice", category:"Grains", quantity:"1 Kg", price:90,
   image:"images/products/Indrayani_Rice.jpg"},
  {id:13, name:"नागली (रागी)", nameEn:"Nagli / Ragi (Finger Millet)", category:"Grains", quantity:"500g", price:60,
   image:"images/products/Nagli__Ragi_Finger_Millet.jpg"},
  {id:14, name:"भगर (वरई)", nameEn:"Bhagar / Varai (Barnyard Millet)", category:"Grains", quantity:"500g", price:70,
   image:"images/products/Bhagar__Varai_Barnyard_Millet.jpg"},
  {id:15, name:"पोहे", nameEn:"Pohe (Flattened Rice)", category:"Grains", quantity:"500g", price:45,
   image:"images/products/Pohe_Flattened_Rice.jpg"},
  {id:16, name:"शेवई", nameEn:"Shevai (Rice Noodles)", category:"Grains", quantity:"250g", price:35,
   image:"images/products/Shevai_Rice_Noodles.jpg"},
  {id:17, name:"जवस (अळशी)", nameEn:"Javas / Flaxseed", category:"Grains", quantity:"250g", price:55,
   image:"images/products/Javas__Flaxseed.jpg"},

  /* ─── DAIRY & FAT ─── */
  {id:18, name:"तूप (देशी गाईचे)", nameEn:"Desi Cow Ghee", category:"Dairy", quantity:"500g", price:380,
   image:"images/products/Desi_Cow_Ghee.jpg"},
  {id:19, name:"शिरगाईचे तूप", nameEn:"Shirgai Ghee", category:"Dairy", quantity:"200g", price:180,
   image:"images/products/Shirgai_Ghee.jpg"},
  {id:20, name:"दूध (गाईचे)", nameEn:"Cow Milk", category:"Dairy", quantity:"1 Litre", price:65,
   image:"images/products/Cow_Milk.jpg"},
  {id:21, name:"लोणी (ताजे)", nameEn:"Fresh Butter", category:"Dairy", quantity:"200g", price:120,
   image:"images/products/Fresh_Butter.jpg"},

  /* ─── SWEETENERS ─── */
  {id:22, name:"गूळ", nameEn:"Jaggery (Block)", category:"Sweeteners", quantity:"500g", price:65,
   image:"images/products/Jaggery_Block.jpg"},
  {id:23, name:"गूळ पावडर", nameEn:"Jaggery Powder", category:"Sweeteners", quantity:"500g", price:70,
   image:"images/products/Jaggery_Powder.jpg"},
  {id:24, name:"मध (शुद्ध)", nameEn:"Pure Honey", category:"Sweeteners", quantity:"250g", price:180,
   image:"images/products/Pure_Honey.jpg"},

  /* ─── OILS ─── */
  {id:25, name:"शेंगदाणा तेल", nameEn:"Groundnut Oil", category:"Oils", quantity:"1 Litre", price:200,
   image:"images/products/Groundnut_Oil.jpg"},
  {id:26, name:"खोबरेल तेल", nameEn:"Coconut Oil", category:"Oils", quantity:"500ml", price:160,
   image:"images/products/Coconut_Oil.jpg"},
  {id:27, name:"तिळाचे तेल", nameEn:"Sesame Oil", category:"Oils", quantity:"500ml", price:180,
   image:"images/products/Sesame_Oil.jpg"},
  {id:28, name:"जवसाचे तेल", nameEn:"Flaxseed Oil", category:"Oils", quantity:"250ml", price:140,
   image:"images/products/Flaxseed_Oil.jpg"},

  /* ─── SPICES ─── */
  {id:29, name:"धने पावडर", nameEn:"Coriander Powder", category:"Spices", quantity:"200g", price:50,
   image:"images/products/Coriander_Powder.jpg"},
  {id:30, name:"जिरे पावडर", nameEn:"Cumin Powder", category:"Spices", quantity:"200g", price:55,
   image:"images/products/Cumin_Powder.jpg"},
  {id:31, name:"हळद पावडर", nameEn:"Turmeric Powder", category:"Spices", quantity:"200g", price:80,
   image:"images/products/Turmeric_Powder.jpg"},
  {id:32, name:"लाल मिरची पावडर", nameEn:"Red Chilli Powder", category:"Spices", quantity:"200g", price:60,
   image:"images/products/Red_Chilli_Powder.jpg"},
  {id:33, name:"गरम मसाला", nameEn:"Garam Masala", category:"Spices", quantity:"100g", price:80,
   image:"images/products/Garam_Masala.jpg"},

  /* ─── NUTS & DRY FRUITS ─── */
  {id:34, name:"काजू", nameEn:"Cashew Nuts", category:"Nuts", quantity:"250g", price:280,
   image:"images/products/Cashew_Nuts.jpg"},
  {id:35, name:"बदाम", nameEn:"Almonds", category:"Nuts", quantity:"250g", price:320,
   image:"images/products/Almonds.jpg"},
  {id:36, name:"अक्रोड", nameEn:"Walnut", category:"Nuts", quantity:"250g", price:350,
   image:"images/products/Walnut.jpg"},
  {id:37, name:"खजूर", nameEn:"Dates", category:"Nuts", quantity:"500g", price:180,
   image:"images/products/Dates.jpg"},

  /* ─── VEGETABLES ─── */
  {id:38, name:"टमाटर", nameEn:"Organic Tomato", category:"Vegetables", quantity:"1 Kg", price:60,
   image:"images/products/Organic_Tomato.jpg"},
  {id:39, name:"गाजर", nameEn:"Fresh Carrot", category:"Vegetables", quantity:"1 Kg", price:70,
   image:"images/products/Fresh_Carrot.jpg"},
  {id:40, name:"बटाटा", nameEn:"Organic Potato", category:"Vegetables", quantity:"1 Kg", price:35,
   image:"images/products/Organic_Potato.jpg"},
  {id:41, name:"कांदा", nameEn:"Organic Onion", category:"Vegetables", quantity:"1 Kg", price:40,
   image:"images/products/Organic_Onion.jpg"},
  {id:42, name:"कोबी", nameEn:"Cabbage", category:"Vegetables", quantity:"1 Pcs", price:30,
   image:"images/products/Cabbage.jpg"},
  {id:43, name:"पालक", nameEn:"Green Spinach", category:"Vegetables", quantity:"250g", price:20,
   image:"images/products/Green_Spinach.jpg"},
  {id:44, name:"कोथिंबीर", nameEn:"Fresh Coriander", category:"Vegetables", quantity:"100g", price:15,
   image:"images/products/Fresh_Coriander.jpg"},
  {id:45, name:"मेथी", nameEn:"Fenugreek Leaves", category:"Vegetables", quantity:"250g", price:25,
   image:"images/products/Fenugreek_Leaves.jpg"},
  {id:51, name:"वांगी", nameEn:"Brinjal (Eggplant)", category:"Vegetables", quantity:"1 Kg", price:50,
   image:"images/products/Brinjal_Eggplant.jpg"},
  {id:52, name:"फ्लॉवर", nameEn:"Cauliflower", category:"Vegetables", quantity:"1 Pcs", price:35,
   image:"images/products/Cauliflower.jpg"},
  {id:53, name:"मटार (वाटाणा)", nameEn:"Green Peas", category:"Vegetables", quantity:"500g", price:60,
   image:"images/products/Green_Peas.jpg"},
  {id:54, name:"दुधी भोपळा", nameEn:"Bottle Gourd (Dudhi)", category:"Vegetables", quantity:"1 Pcs", price:30,
   image:"images/products/Bottle_Gourd_Dudhi.jpg"},
  {id:55, name:"दोडका", nameEn:"Ridge Gourd (Dodka)", category:"Vegetables", quantity:"500g", price:35,
   image:"images/products/Ridge_Gourd_Dodka.jpg"},
  {id:56, name:"कारले", nameEn:"Bitter Gourd (Karela)", category:"Vegetables", quantity:"500g", price:40,
   image:"images/products/Bitter_Gourd_Karela.jpg"},
  {id:57, name:"काकडी", nameEn:"Cucumber", category:"Vegetables", quantity:"1 Kg", price:30,
   image:"images/products/Cucumber.jpg"},
  {id:58, name:"ढोबळी मिरची", nameEn:"Capsicum (Bell Pepper)", category:"Vegetables", quantity:"500g", price:60,
   image:"images/products/Capsicum_Bell_Pepper.jpg"},
  {id:59, name:"हिरवी मिरची", nameEn:"Green Chilli", category:"Vegetables", quantity:"250g", price:30,
   image:"images/products/Green_Chilli.jpg"},
  {id:60, name:"भेंडी", nameEn:"Ladies Finger (Okra)", category:"Vegetables", quantity:"500g", price:40,
   image:"images/products/Ladies_Finger_Okra.jpg"},
  {id:61, name:"शेवगा", nameEn:"Drumstick (Shevga)", category:"Vegetables", quantity:"250g", price:35,
   image:"images/products/Drumstick_Shevga.jpg"},
  {id:62, name:"मुळा", nameEn:"Radish", category:"Vegetables", quantity:"1 Kg", price:25,
   image:"images/products/Radish.jpg"},
  {id:63, name:"बीट", nameEn:"Beetroot", category:"Vegetables", quantity:"500g", price:35,
   image:"images/products/Beetroot.jpg"},
  {id:64, name:"मका (कणीस)", nameEn:"Sweet Corn", category:"Vegetables", quantity:"2 Pcs", price:30,
   image:"images/products/Sweet_Corn.jpg"},
  {id:65, name:"लाल भोपळा", nameEn:"Red Pumpkin", category:"Vegetables", quantity:"1 Kg", price:30,
   image:"images/products/Red_Pumpkin.jpg"},
  {id:66, name:"गवार", nameEn:"Cluster Beans (Gavar)", category:"Vegetables", quantity:"500g", price:50,
   image:"images/products/Cluster_Beans_Gavar.jpg"},
  {id:67, name:"फरसबी", nameEn:"French Beans", category:"Vegetables", quantity:"500g", price:60,
   image:"images/products/French_Beans.jpg"},
  {id:68, name:"लसूण", nameEn:"Garlic", category:"Vegetables", quantity:"250g", price:60,
   image:"images/products/Garlic.jpg"},
  {id:69, name:"आले", nameEn:"Ginger", category:"Vegetables", quantity:"250g", price:50,
   image:"images/products/Ginger.jpg"},
  {id:70, name:"रताळे", nameEn:"Sweet Potato", category:"Vegetables", quantity:"1 Kg", price:50,
   image:"images/products/Sweet_Potato.jpg"},
  {id:71, name:"कांदा पात", nameEn:"Spring Onion", category:"Vegetables", quantity:"250g", price:20,
   image:"images/products/Spring_Onion.jpg"},

  /* ─── FRUITS ─── */
  {id:46, name:"सफरचंद", nameEn:"Organic Apple", category:"Fruits", quantity:"1 Kg", price:180,
   image:"images/products/Organic_Apple.jpg"},
  {id:47, name:"केळे", nameEn:"Fresh Banana", category:"Fruits", quantity:"1 Dozen", price:50,
   image:"images/products/Fresh_Banana.jpg"},
  {id:48, name:"संत्री", nameEn:"Organic Orange", category:"Fruits", quantity:"1 Kg", price:120,
   image:"images/products/Organic_Orange.jpg"},
  {id:49, name:"पपई", nameEn:"Fresh Papaya", category:"Fruits", quantity:"1 Kg", price:45,
   image:"images/products/Fresh_Papaya.jpg"},
  {id:50, name:"डाळिंब", nameEn:"Pomegranate", category:"Fruits", quantity:"1 Kg", price:160,
   image:"images/products/Pomegranate.jpg"},

  /* ─── FLOUR / ATTA ─── */
  {id:72, name:"गव्हाचे पीठ", nameEn:"Wheat Flour (Atta)", category:"Flour", quantity:"1 Kg", price:55,
   image:"images/products/Wheat_Flour_Atta.jpg"},
  {id:73, name:"ज्वारीचे पीठ", nameEn:"Jowar Flour (Sorghum)", category:"Flour", quantity:"1 Kg", price:50,
   image:"images/products/Jowar_Flour_Sorghum.jpg"},
  {id:74, name:"बाजरीचे पीठ", nameEn:"Bajra Flour (Pearl Millet)", category:"Flour", quantity:"1 Kg", price:45,
   image:"images/products/Bajra_Flour_Pearl_Millet.jpg"},
  {id:75, name:"नागलीचे पीठ", nameEn:"Ragi Flour (Finger Millet)", category:"Flour", quantity:"500g", price:60,
   image:"images/products/Ragi_Flour_Finger_Millet.jpg"},
  {id:76, name:"बेसन", nameEn:"Besan (Chickpea Flour)", category:"Flour", quantity:"500g", price:65,
   image:"images/products/Besan_Chickpea_Flour.jpg"},
  {id:77, name:"मैदा", nameEn:"Maida (All Purpose Flour)", category:"Flour", quantity:"1 Kg", price:45,
   image:"images/products/Maida_All_Purpose_Flour.jpg"},
  {id:78, name:"रवा / सूजी", nameEn:"Semolina (Rava / Suji)", category:"Flour", quantity:"500g", price:40,
   image:"images/products/Semolina_Rava__Suji.jpg"},
  {id:79, name:"कॉर्नफ्लोर", nameEn:"Corn Flour / Starch", category:"Flour", quantity:"500g", price:50,
   image:"images/products/Corn_Flour__Starch.jpg"},
  {id:80, name:"राजगिरा पीठ", nameEn:"Rajgira Flour (Amaranth)", category:"Flour", quantity:"500g", price:80,
   image:"images/products/Rajgira_Flour_Amaranth.jpg"},
  {id:81, name:"कुट्टू पीठ", nameEn:"Buckwheat Flour (Kuttu)", category:"Flour", quantity:"500g", price:90,
   image:"images/products/Buckwheat_Flour_Kuttu.jpg"},
  {id:82, name:"थालीपीठ भाजणी", nameEn:"Thalipeeth Bhajani", category:"Flour", quantity:"500g", price:75,
   image:"images/products/Thalipeeth_Bhajani.jpg"},

  /* ─── RICE VARIETIES ─── */
  {id:83, name:"कोलम तांदूळ", nameEn:"Kolam Rice", category:"Grains", quantity:"1 Kg", price:70,
   image:"images/products/Kolam_Rice.jpg"},
  {id:84, name:"अंबेमोहर तांदूळ", nameEn:"Ambemohar Rice", category:"Grains", quantity:"1 Kg", price:100,
   image:"images/products/Ambemohar_Rice.jpg"},
  {id:85, name:"काळा तांदूळ", nameEn:"Black Rice (Forbidden)", category:"Grains", quantity:"500g", price:120,
   image:"images/products/Black_Rice_Forbidden.jpg"},
  {id:86, name:"लाल तांदूळ", nameEn:"Red Rice", category:"Grains", quantity:"1 Kg", price:90,
   image:"images/products/Red_Rice.jpg"},

  /* ─── MORE DAL ─── */
  {id:87, name:"मटकी", nameEn:"Matki (Moth Bean)", category:"Dal", quantity:"500g", price:75,
   image:"images/products/Matki_Moth_Bean.jpg"},
  {id:88, name:"वाल", nameEn:"Field Beans (Val)", category:"Dal", quantity:"500g", price:70,
   image:"images/products/Field_Beans_Val.jpg"},
  {id:89, name:"हिरवे वाटाणे (वाळलेले)", nameEn:"Dried Green Peas", category:"Dal", quantity:"500g", price:65,
   image:"images/products/Dried_Green_Peas.jpg"},
  {id:90, name:"काळे वाटाणे", nameEn:"Black Peas (Kala Vatana)", category:"Dal", quantity:"500g", price:70,
   image:"images/products/Black_Peas_Kala_Vatana.jpg"},
  {id:91, name:"लाल मसूर (साबुत)", nameEn:"Whole Red Lentils", category:"Dal", quantity:"500g", price:80,
   image:"images/products/Whole_Red_Lentils.jpg"},

  /* ─── MORE FRUITS ─── */
  {id:92, name:"पेरू", nameEn:"Guava", category:"Fruits", quantity:"500g", price:40,
   image:"images/products/Guava.jpg"},
  {id:93, name:"चिकू", nameEn:"Sapodilla (Chikoo)", category:"Fruits", quantity:"500g", price:50,
   image:"images/products/Sapodilla_Chikoo.jpg"},
  {id:94, name:"सीताफळ", nameEn:"Custard Apple (Sitafal)", category:"Fruits", quantity:"500g", price:80,
   image:"images/products/Custard_Apple_Sitafal.jpg"},
  {id:95, name:"आवळा", nameEn:"Amla (Indian Gooseberry)", category:"Fruits", quantity:"250g", price:40,
   image:"images/products/Amla_Indian_Gooseberry.jpg"},
  {id:96, name:"नारळ", nameEn:"Coconut", category:"Fruits", quantity:"1 Pcs", price:30,
   image:"images/products/Coconut.jpg"},
  {id:97, name:"लिंबू", nameEn:"Lemon", category:"Fruits", quantity:"6 Pcs", price:20,
   image:"images/products/Lemon.jpg"},
  {id:98, name:"आंबा (हापूस)", nameEn:"Alphonso Mango (Hapus)", category:"Fruits", quantity:"1 Dozen", price:350,
   image:"images/products/Alphonso_Mango_Hapus.jpg"},
  {id:99, name:"द्राक्षे", nameEn:"Grapes", category:"Fruits", quantity:"500g", price:80,
   image:"images/products/Grapes.jpg"},
  {id:100, name:"स्ट्रॉबेरी", nameEn:"Strawberry", category:"Fruits", quantity:"250g", price:90,
   image:"images/products/Strawberry.jpg"},

  /* ─── MORE SPICES ─── */
  {id:101, name:"मोहरी", nameEn:"Mustard Seeds (Mohri)", category:"Spices", quantity:"100g", price:25,
   image:"images/products/Mustard_Seeds_Mohri.jpg"},
  {id:102, name:"मेथी दाणे", nameEn:"Fenugreek Seeds (Methi)", category:"Spices", quantity:"100g", price:30,
   image:"images/products/Fenugreek_Seeds_Methi.jpg"},
  {id:103, name:"ओवा", nameEn:"Carom Seeds (Ajwain)", category:"Spices", quantity:"100g", price:35,
   image:"images/products/Carom_Seeds_Ajwain.jpg"},
  {id:104, name:"तमालपत्र", nameEn:"Bay Leaves (Tamalpatra)", category:"Spices", quantity:"25g", price:20,
   image:"images/products/Bay_Leaves_Tamalpatra.jpg"},
  {id:105, name:"दालचिनी", nameEn:"Cinnamon (Dalchini)", category:"Spices", quantity:"50g", price:40,
   image:"images/products/Cinnamon_Dalchini.jpg"},
  {id:106, name:"लवंग", nameEn:"Cloves (Lavang)", category:"Spices", quantity:"50g", price:50,
   image:"images/products/Cloves_Lavang.jpg"},
  {id:107, name:"वेलदोडे", nameEn:"Cardamom (Elaichi)", category:"Spices", quantity:"25g", price:60,
   image:"images/products/Cardamom_Elaichi.jpg"},
  {id:108, name:"काळी मिरी", nameEn:"Black Pepper", category:"Spices", quantity:"50g", price:55,
   image:"images/products/Black_Pepper.jpg"},
  {id:109, name:"हिंग", nameEn:"Asafoetida (Hing)", category:"Spices", quantity:"25g", price:40,
   image:"images/products/Asafoetida_Hing.jpg"},
  {id:110, name:"काश्मिरी लाल मिरची", nameEn:"Kashmiri Red Chilli", category:"Spices", quantity:"100g", price:70,
   image:"images/products/Kashmiri_Red_Chilli.jpg"},
  {id:111, name:"आमचूर पावडर", nameEn:"Dry Mango Powder (Amchur)", category:"Spices", quantity:"100g", price:45,
   image:"images/products/Dry_Mango_Powder_Amchur.jpg"},
  {id:112, name:"चाट मसाला", nameEn:"Chaat Masala", category:"Spices", quantity:"100g", price:50,
   image:"images/products/Chaat_Masala.jpg"},
  {id:113, name:"गोडा मसाला", nameEn:"Goda Masala (Maharashtrian)", category:"Spices", quantity:"100g", price:80,
   image:"images/products/Goda_Masala_Maharashtrian.jpg"},
  {id:114, name:"पावभाजी मसाला", nameEn:"Pav Bhaji Masala", category:"Spices", quantity:"100g", price:55,
   image:"images/products/Pav_Bhaji_Masala.jpg"},
  {id:115, name:"सांबार मसाला", nameEn:"Sambar Masala", category:"Spices", quantity:"100g", price:55,
   image:"images/products/Sambar_Masala.jpg"},

  /* ─── MORE DAIRY ─── */
  {id:116, name:"पनीर", nameEn:"Paneer (Cottage Cheese)", category:"Dairy", quantity:"200g", price:80,
   image:"images/products/Paneer_Cottage_Cheese.jpg"},
  {id:117, name:"दही", nameEn:"Curd (Dahi)", category:"Dairy", quantity:"500g", price:40,
   image:"images/products/Curd_Dahi.jpg"},
  {id:118, name:"ताक", nameEn:"Buttermilk (Tak)", category:"Dairy", quantity:"500ml", price:25,
   image:"images/products/Buttermilk_Tak.jpg"},
  {id:119, name:"मावा / खवा", nameEn:"Mawa / Khoya", category:"Dairy", quantity:"200g", price:100,
   image:"images/products/Mawa__Khoya.jpg"},
  {id:120, name:"श्रीखंड", nameEn:"Shrikhand", category:"Dairy", quantity:"200g", price:70,
   image:"images/products/Shrikhand.jpg"},

  /* ─── MORE OILS ─── */
  {id:121, name:"मोहरी तेल", nameEn:"Mustard Oil", category:"Oils", quantity:"1 Litre", price:180,
   image:"images/products/Mustard_Oil.jpg"},
  {id:122, name:"बदाम तेल", nameEn:"Almond Oil (Cold Pressed)", category:"Oils", quantity:"200ml", price:280,
   image:"images/products/Almond_Oil_Cold_Pressed.jpg"},
  {id:123, name:"एरंडेल तेल", nameEn:"Castor Oil", category:"Oils", quantity:"200ml", price:120,
   image:"images/products/Castor_Oil.jpg"},

  /* ─── MORE SWEETENERS ─── */
  {id:124, name:"नारळ साखर", nameEn:"Coconut Sugar", category:"Sweeteners", quantity:"250g", price:120,
   image:"images/products/Coconut_Sugar.jpg"},
  {id:125, name:"ताडगूळ", nameEn:"Palm Jaggery (Tadgul)", category:"Sweeteners", quantity:"250g", price:80,
   image:"images/products/Palm_Jaggery_Tadgul.jpg"},

  /* ─── MORE NUTS ─── */
  {id:126, name:"पिस्ता", nameEn:"Pistachios", category:"Nuts", quantity:"100g", price:200,
   image:"images/products/Pistachios.jpg"},
  {id:127, name:"खजूर", nameEn:"Dates (Khajoor)", category:"Nuts", quantity:"500g", price:180,
   image:"images/products/Dates_Khajoor.jpg"},
  {id:128, name:"मनुका", nameEn:"Raisins (Manuka)", category:"Nuts", quantity:"250g", price:120,
   image:"images/products/Raisins_Manuka.jpg"},
  {id:129, name:"अंजीर (वाळलेले)", nameEn:"Dried Figs (Anjeer)", category:"Nuts", quantity:"250g", price:160,
   image:"images/products/Dried_Figs_Anjeer.jpg"},
  {id:130, name:"जर्दाळू", nameEn:"Dried Apricot (Jardalu)", category:"Nuts", quantity:"250g", price:180,
   image:"images/products/Dried_Apricot_Jardalu.jpg"},

  /* ─── SNACKS & NAMKEEN ─── */
  {id:131, name:"शेंगदाणे (भाजलेले)", nameEn:"Roasted Peanuts", category:"Snacks", quantity:"250g", price:40,
   image:"images/products/Roasted_Peanuts.jpg"},
  {id:132, name:"चुरमुरे", nameEn:"Puffed Rice (Churmure)", category:"Snacks", quantity:"200g", price:25,
   image:"images/products/Puffed_Rice_Churmure.jpg"},
  {id:133, name:"चिवडा", nameEn:"Chivda (Poha Mix)", category:"Snacks", quantity:"250g", price:50,
   image:"images/products/Chivda_Poha_Mix.jpg"},
  {id:134, name:"लाडू (बेसन)", nameEn:"Besan Ladoo", category:"Snacks", quantity:"250g", price:120,
   image:"images/products/Besan_Ladoo.jpg"},
  {id:135, name:"चकली", nameEn:"Chakli", category:"Snacks", quantity:"250g", price:100,
   image:"images/products/Chakli.jpg"},
  {id:136, name:"शेव", nameEn:"Sev (Gram Flour Snack)", category:"Snacks", quantity:"200g", price:50,
   image:"images/products/Sev_Gram_Flour_Snack.jpg"},
  {id:137, name:"उडीद पापड", nameEn:"Urad Dal Papad", category:"Snacks", quantity:"200g", price:55,
   image:"images/products/Urad_Dal_Papad.jpg"},
  {id:138, name:"साबुदाणा पापड", nameEn:"Sabudana Papad", category:"Snacks", quantity:"200g", price:60,
   image:"images/products/Sabudana_Papad.jpg"},

  /* ─── BREAKFAST / READY MIX ─── */
  {id:139, name:"इडली रवा", nameEn:"Idli Rava Mix", category:"Breakfast", quantity:"500g", price:55,
   image:"images/products/Idli_Rava_Mix.jpg"},
  {id:140, name:"डोसा मिक्स", nameEn:"Dosa Ready Mix", category:"Breakfast", quantity:"500g", price:70,
   image:"images/products/Dosa_Ready_Mix.jpg"},
  {id:141, name:"उपमा रवा", nameEn:"Upma Rava (Semolina)", category:"Breakfast", quantity:"500g", price:40,
   image:"images/products/Upma_Rava_Semolina.jpg"},
  {id:142, name:"पोहे", nameEn:"Pohe (Flattened Rice)", category:"Breakfast", quantity:"500g", price:45,
   image:"images/products/Pohe_Flattened_Rice.jpg"},
  {id:143, name:"साबुदाणा", nameEn:"Sago (Sabudana)", category:"Breakfast", quantity:"500g", price:70,
   image:"images/products/Sago_Sabudana.jpg"},
  {id:144, name:"नाचणी सत्व", nameEn:"Ragi Porridge Mix", category:"Breakfast", quantity:"500g", price:80,
   image:"images/products/Ragi_Porridge_Mix.jpg"},

  /* ─── BEVERAGES ─── */
  {id:145, name:"आले-लसूण पेस्ट", nameEn:"Ginger-Garlic Paste", category:"Condiments", quantity:"200g", price:50,
   image:"images/products/GingerGarlic_Paste.jpg"},
  {id:146, name:"कोकम सरबत", nameEn:"Kokum Sharbat (Syrup)", category:"Beverages", quantity:"500ml", price:120,
   image:"images/products/Kokum_Sharbat_Syrup.jpg"},
  {id:147, name:"आमरस", nameEn:"Aamras (Mango Pulp)", category:"Beverages", quantity:"500g", price:100,
   image:"images/products/Aamras_Mango_Pulp.jpg"},
  {id:148, name:"तुळस बी (सब्जा)", nameEn:"Sabja / Basil Seeds", category:"Beverages", quantity:"100g", price:50,
   image:"images/products/Sabja__Basil_Seeds.jpg"},
  {id:149, name:"गुलाब पाणी", nameEn:"Rose Water", category:"Beverages", quantity:"200ml", price:60,
   image:"images/products/Rose_Water.jpg"},

  /* ─── PICKLES & CONDIMENTS ─── */
  {id:150, name:"आंबा लोणचे", nameEn:"Mango Pickle (Aam Achar)", category:"Condiments", quantity:"250g", price:80,
   image:"images/products/Mango_Pickle_Aam_Achar.jpg"},
  {id:151, name:"लिंबू लोणचे", nameEn:"Lemon Pickle", category:"Condiments", quantity:"250g", price:70,
   image:"images/products/Lemon_Pickle.jpg"},
  {id:152, name:"मिरची लोणचे", nameEn:"Green Chilli Pickle", category:"Condiments", quantity:"250g", price:65,
   image:"images/products/Green_Chilli_Pickle.jpg"},
  {id:153, name:"शेंगदाणा चटणी", nameEn:"Peanut Chutney Powder", category:"Condiments", quantity:"200g", price:60,
   image:"images/products/Peanut_Chutney_Powder.jpg"},
  {id:154, name:"खोबरे चटणी पावडर", nameEn:"Dry Coconut Chutney Powder", category:"Condiments", quantity:"150g", price:70,
   image:"images/products/Dry_Coconut_Chutney_Powder.jpg"},
  {id:155, name:"टोमॅटो सॉस", nameEn:"Tomato Sauce (Organic)", category:"Condiments", quantity:"500g", price:90,
   image:"images/products/Tomato_Sauce_Organic.jpg"},

  /* ─── AYURVEDIC / HEALTH ─── */
  {id:156, name:"अश्वगंधा पावडर", nameEn:"Ashwagandha Powder", category:"Ayurvedic", quantity:"100g", price:120,
   image:"images/products/Ashwagandha_Powder.jpg"},
  {id:157, name:"त्रिफळा पावडर", nameEn:"Triphala Powder", category:"Ayurvedic", quantity:"100g", price:80,
   image:"images/products/Triphala_Powder.jpg"},
  {id:158, name:"शतावरी पावडर", nameEn:"Shatavari Powder", category:"Ayurvedic", quantity:"100g", price:150,
   image:"images/products/Shatavari_Powder.jpg"},
  {id:159, name:"ब्राह्मी पावडर", nameEn:"Brahmi Powder", category:"Ayurvedic", quantity:"100g", price:90,
   image:"images/products/Brahmi_Powder.jpg"},
  {id:160, name:"गिलोय पावडर", nameEn:"Giloy Powder (Guduchi)", category:"Ayurvedic", quantity:"100g", price:70,
   image:"images/products/Giloy_Powder_Guduchi.jpg"},
  {id:161, name:"मोरिंगा पावडर", nameEn:"Moringa / Drumstick Leaf Powder", category:"Ayurvedic", quantity:"100g", price:100,
   image:"images/products/Moringa__Drumstick_Leaf_Powder.jpg"},
  {id:162, name:"तुळस पावडर", nameEn:"Tulsi Powder (Holy Basil)", category:"Ayurvedic", quantity:"100g", price:60,
   image:"images/products/Tulsi_Powder_Holy_Basil.jpg"},
  {id:163, name:"आवळा पावडर", nameEn:"Amla Powder", category:"Ayurvedic", quantity:"100g", price:70,
   image:"images/products/Amla_Powder.jpg"},

  /* ─── PERSONAL CARE ─── */
  {id:164, name:"शिकेकाई पावडर", nameEn:"Shikakai Powder", category:"Personal Care", quantity:"100g", price:45,
   image:"images/products/Shikakai_Powder.jpg"},
  {id:165, name:"रिठा पावडर", nameEn:"Reetha Powder (Soapnut)", category:"Personal Care", quantity:"100g", price:50,
   image:"images/products/Reetha_Powder_Soapnut.jpg"},
  {id:166, name:"नीम पावडर", nameEn:"Neem Powder", category:"Personal Care", quantity:"100g", price:45,
   image:"images/products/Neem_Powder.jpg"},
  {id:167, name:"मुलतानी माती", nameEn:"Multani Mitti (Fuller's Earth)", category:"Personal Care", quantity:"200g", price:40,
   image:"images/products/Multani_Mitti_Fullers_Earth.jpg"},
  {id:168, name:"साबण (नारळ)", nameEn:"Coconut Soap Bar (Herbal)", category:"Personal Care", quantity:"1 Pcs", price:40,
   image:"images/products/Coconut_Soap_Bar_Herbal.jpg"},

  /* ─── NEW ARRIVALS (19 products) ─── */
  {id:169, name:"अमुल्य हरिद्रा हळद", nameEn:"Amulya Haridra Turmeric Powder", category:"Spices", quantity:"200g", price:90,
   image:"images/products/Amulya_Haridra_Turmeric.jpg"},
  {id:170, name:"उडीद पापड (लसुण मिरची)", nameEn:"Urad Dal Papad (Garlic Chilli)", category:"Snacks", quantity:"200g", price:70,
   image:"images/products/Urad_Dal_Papad_Lasun_Mirchi.jpg"},
  {id:171, name:"खडा गरम मसाला", nameEn:"Whole Garam Masala (Khada)", category:"Spices", quantity:"1 Kg", price:790,
   image:"images/products/Khada_Garam_Masala.jpg"},
  {id:172, name:"खपली गहू गार्लिक ब्रेड", nameEn:"Khapli Wheat Garlic Bread", category:"Bakery", quantity:"1 Pcs", price:50,
   image:"images/products/Khapli_Wheat_Garlic_Bread.jpg"},
  {id:173, name:"खपली गहू ब्रेड", nameEn:"Khapli Wheat Bread", category:"Bakery", quantity:"300g", price:70,
   image:"images/products/Khapli_Wheat_Bread.jpg"},
  {id:174, name:"खोबरे वाटी", nameEn:"Dry Coconut Halves (Khobre Vati)", category:"Fruits", quantity:"250g", price:60,
   image:"images/products/Khobre_Vati.jpg"},
  {id:175, name:"गवती चहा", nameEn:"Lemongrass (Gavati Chaha)", category:"Beverages", quantity:"1 Bunch", price:20,
   image:"images/products/Gavati_Chaha.jpg"},
  {id:176, name:"गुलकंद", nameEn:"Gulkand (Rose Petal Preserve)", category:"Ayurvedic", quantity:"250g", price:150,
   image:"images/products/Gulkand.jpg"},
  {id:177, name:"तीळ चटणी", nameEn:"Sesame Chutney (Til Chutney)", category:"Condiments", quantity:"100g", price:50,
   image:"images/products/Til_Chutney.jpg"},
  {id:178, name:"तोंडले", nameEn:"Tindora (Ivy Gourd)", category:"Vegetables", quantity:"500g", price:40,
   image:"images/products/Tondli.jpg"},
  {id:179, name:"नवजीवन हींग", nameEn:"Navjeevan Hing (Asafoetida)", category:"Spices", quantity:"100g", price:80,
   image:"images/products/Navjeevan_Hing.jpg"},
  {id:180, name:"नागली नुडल्स", nameEn:"Nagli Noodles (Ragi Noodles)", category:"Snacks", quantity:"200g", price:60,
   image:"images/products/Nagli_Noodles.jpg"},
  {id:181, name:"नागली पापड", nameEn:"Nagli Papad (Ragi Papad)", category:"Snacks", quantity:"200g", price:60,
   image:"images/products/Nagli_Papad.jpg"},
  {id:182, name:"नागली पास्ता", nameEn:"Nagli Pasta (Ragi Pasta)", category:"Snacks", quantity:"200g", price:65,
   image:"images/products/Nagli_Pasta.jpg"},
  {id:183, name:"फ्रेश चिंच", nameEn:"Fresh Tamarind", category:"Vegetables", quantity:"250g", price:40,
   image:"images/products/Fresh_Tamarind.jpg"},
  {id:184, name:"भजनी पीठ", nameEn:"Bhajani Peeth (Bhajani Flour)", category:"Flour", quantity:"250g", price:60,
   image:"images/products/Bhajani_Peeth.jpg"},
  {id:185, name:"मेतकुट", nameEn:"Metkut", category:"Condiments", quantity:"100g", price:40,
   image:"images/products/Metkut.jpg"},
  {id:186, name:"लसून खोबरे चटणी", nameEn:"Garlic Coconut Chutney", category:"Condiments", quantity:"100g", price:70,
   image:"images/products/Lasun_Khobre_Chutney.jpg"},
  {id:187, name:"वांगे", nameEn:"Brinjal (Vange)", category:"Vegetables", quantity:"500g", price:45,
   image:"images/products/Vange_Brinjal.jpg"},
];

/* ════ CATEGORY METADATA (used by Admin product form dropdown) ════ */
const PRODUCT_CATEGORIES = [
  {id:"All",          label:"सर्व / All"},
  {id:"Dal",          label:"डाळ / Pulses"},
  {id:"Grains",       label:"धान्य / Grains"},
  {id:"Flour",        label:"पीठ / Flour"},
  {id:"Dairy",        label:"दुग्धजन्य / Dairy"},
  {id:"Sweeteners",   label:"गोड / Sweeteners"},
  {id:"Oils",         label:"तेल / Oils"},
  {id:"Spices",       label:"मसाले / Spices"},
  {id:"Nuts",         label:"सुका मेवा / Nuts & Dry Fruits"},
  {id:"Vegetables",   label:"भाज्या / Vegetables"},
  {id:"Fruits",       label:"फळे / Fruits"},
  {id:"Snacks",       label:"नाश्ता / Snacks"},
  {id:"Bakery",       label:"बेकरी / Bakery"},
  {id:"Breakfast",    label:"ब्रेकफास्ट / Breakfast"},
  {id:"Beverages",    label:"पेये / Beverages"},
  {id:"Condiments",   label:"लोणचे / Condiments"},
  {id:"Ayurvedic",    label:"आयुर्वेदिक / Ayurvedic"},
  {id:"Personal Care",label:"वैयक्तिक काळजी / Personal Care"},
];

/* Units available for the Admin product form's unit selector */
const PRODUCT_UNITS = ["g","kg","ml","Litre","Pcs","Dozen","Bunch","Packet"];

/* ════════════════════════════════════════════════════════════════
   IMAGE MANIFEST — every file currently in /images/products/
   ──────────────────────────────────────────────────────────────
   There is no Firebase Storage / file upload in this project —
   product photos are plain static files served from the local
   /images/products/ folder. The Admin Panel's "Image" field is a
   PICKER over this list (see admin.js), so an admin can only
   choose an image that's actually on disk; Firestore only ever
   stores the resulting relative path string, e.g.
   "images/products/tomato.jpg".

   ⚠️ If you add a new photo to /images/products/ via FTP/hosting
   file manager, add its filename to this list too (in alphabetical
   order, anywhere is fine) so it shows up in the Admin Panel's
   picker. See MIGRATION_NOTES.md for details.
   ════════════════════════════════════════════════════════════════ */
const PRODUCT_IMAGE_MANIFEST = [
  "Aamras_Mango_Pulp.jpg", "Almond_Oil_Cold_Pressed.jpg", "Almonds.jpg", "Alphonso_Mango_Hapus.jpg",
  "Ambemohar_Rice.jpg", "Amla_Indian_Gooseberry.jpg", "Amla_Powder.jpg", "Amulya_Haridra_Turmeric.jpg",
  "Asafoetida_Hing.jpg", "Ashwagandha_Powder.jpg", "Bajra_Flour_Pearl_Millet.jpg", "Bajra_Pearl_Millet.jpg",
  "Basmati_Rice.jpg", "Bay_Leaves_Tamalpatra.jpg", "Beetroot.jpg", "Besan_Chickpea_Flour.jpg",
  "Besan_Ladoo.jpg", "Bhagar__Varai_Barnyard_Millet.jpg", "Bhajani_Peeth.jpg", "Bitter_Gourd_Karela.jpg",
  "Black_Peas_Kala_Vatana.jpg", "Black_Pepper.jpg", "Black_Rice_Forbidden.jpg", "Bottle_Gourd_Dudhi.jpg",
  "Brahmi_Powder.jpg", "Brinjal_Eggplant.jpg", "Buckwheat_Flour_Kuttu.jpg", "Buttermilk_Tak.jpg",
  "Cabbage.jpg", "Capsicum_Bell_Pepper.jpg", "Cardamom_Elaichi.jpg", "Carom_Seeds_Ajwain.jpg",
  "Cashew_Nuts.jpg", "Castor_Oil.jpg", "Cauliflower.jpg", "Chaat_Masala.jpg",
  "Chakli.jpg", "Chavali_Blackeyed_peas.jpg", "Chivda_Poha_Mix.jpg", "Chole__Chickpeas.jpg",
  "Cinnamon_Dalchini.jpg", "Cloves_Lavang.jpg", "Cluster_Beans_Gavar.jpg", "Coconut.jpg",
  "Coconut_Oil.jpg", "Coconut_Soap_Bar_Herbal.jpg", "Coconut_Sugar.jpg", "Coriander_Powder.jpg",
  "Corn_Flour__Starch.jpg", "Cow_Milk.jpg", "Cucumber.jpg", "Cumin_Powder.jpg",
  "Curd_Dahi.jpg", "Custard_Apple_Sitafal.jpg", "Dates.jpg", "Dates_Khajoor.jpg",
  "Desi_Cow_Ghee.jpg", "Dosa_Ready_Mix.jpg", "Dried_Apricot_Jardalu.jpg", "Dried_Figs_Anjeer.jpg",
  "Dried_Green_Peas.jpg", "Drumstick_Shevga.jpg", "Dry_Coconut_Chutney_Powder.jpg", "Dry_Mango_Powder_Amchur.jpg",
  "Fenugreek_Leaves.jpg", "Fenugreek_Seeds_Methi.jpg", "Field_Beans_Val.jpg", "Flaxseed_Oil.jpg",
  "French_Beans.jpg", "Fresh_Banana.jpg", "Fresh_Butter.jpg", "Fresh_Carrot.jpg",
  "Fresh_Coriander.jpg", "Fresh_Papaya.jpg", "Fresh_Tamarind.jpg", "Garam_Masala.jpg",
  "Garlic.jpg", "Gavati_Chaha.jpg", "Giloy_Powder_Guduchi.jpg", "Ginger.jpg",
  "GingerGarlic_Paste.jpg", "Goda_Masala_Maharashtrian.jpg", "Grapes.jpg", "Green_Chilli.jpg",
  "Green_Chilli_Pickle.jpg", "Green_Peas.jpg", "Green_Spinach.jpg", "Groundnut_Oil.jpg",
  "Guava.jpg", "Gulkand.jpg", "Harbhara_Dal_Chana.jpg", "Idli_Rava_Mix.jpg",
  "Indrayani_Rice.jpg", "Jaggery_Block.jpg", "Jaggery_Powder.jpg", "Javas__Flaxseed.jpg",
  "Jowar_Flour_Sorghum.jpg", "Kashmiri_Red_Chilli.jpg", "Khada_Garam_Masala.jpg", "Khapli_Wheat_Bread.jpg",
  "Khapli_Wheat_Garlic_Bread.jpg", "Khobre_Vati.jpg", "Kokum_Sharbat_Syrup.jpg", "Kolam_Rice.jpg",
  "Ladies_Finger_Okra.jpg", "Lasun_Khobre_Chutney.jpg", "Lemon.jpg", "Lemon_Pickle.jpg",
  "Maida_All_Purpose_Flour.jpg", "Mango_Pickle_Aam_Achar.jpg", "Masur_Dal.jpg", "Matki_Moth_Bean.jpg",
  "Mawa__Khoya.jpg", "Metkut.jpg", "Moong_Dal.jpg", "Moringa__Drumstick_Leaf_Powder.jpg",
  "Multani_Mitti_Fullers_Earth.jpg", "Mustard_Oil.jpg", "Mustard_Seeds_Mohri.jpg", "Nagli_Noodles.jpg",
  "Nagli_Papad.jpg", "Nagli_Pasta.jpg", "Nagli__Ragi_Finger_Millet.jpg", "Navjeevan_Hing.jpg",
  "Neem_Powder.jpg", "Organic_Apple.jpg", "Organic_Onion.jpg", "Organic_Orange.jpg",
  "Organic_Potato.jpg", "Organic_Product.jpg", "Organic_Tomato.jpg", "Palm_Jaggery_Tadgul.jpg",
  "Paneer_Cottage_Cheese.jpg", "Pav_Bhaji_Masala.jpg", "Peanut_Chutney_Powder.jpg", "Pistachios.jpg",
  "Pohe_Flattened_Rice.jpg", "Pomegranate.jpg", "Puffed_Rice_Churmure.jpg", "Pure_Honey.jpg",
  "Radish.jpg", "Ragi_Flour_Finger_Millet.jpg", "Ragi_Porridge_Mix.jpg", "Raisins_Manuka.jpg",
  "Rajgira_Flour_Amaranth.jpg", "Rajma.jpg", "Red_Chilli_Powder.jpg", "Red_Pumpkin.jpg",
  "Red_Rice.jpg", "Reetha_Powder_Soapnut.jpg", "Ridge_Gourd_Dodka.jpg", "Roasted_Peanuts.jpg",
  "Rose_Water.jpg", "Sabja__Basil_Seeds.jpg", "Sabudana_Papad.jpg", "Sago_Sabudana.jpg",
  "Sambar_Masala.jpg", "Sapodilla_Chikoo.jpg", "Semolina_Rava__Suji.jpg", "Sesame_Oil.jpg",
  "Sev_Gram_Flour_Snack.jpg", "Shatavari_Powder.jpg", "Shevai_Rice_Noodles.jpg", "Shikakai_Powder.jpg",
  "Shirgai_Ghee.jpg", "Shrikhand.jpg", "Spring_Onion.jpg", "Strawberry.jpg",
  "Sweet_Corn.jpg", "Sweet_Potato.jpg", "Thalipeeth_Bhajani.jpg", "Til_Chutney.jpg",
  "Tomato_Sauce_Organic.jpg", "Tondli.jpg", "Triphala_Powder.jpg", "Tulsi_Powder_Holy_Basil.jpg",
  "Tur_Dal.jpg", "Turmeric_Powder.jpg", "Upma_Rava_Semolina.jpg", "Urad_Dal_Papad.jpg",
  "Urad_Dal_Papad_Lasun_Mirchi.jpg", "Urad_Dal_White.jpg", "Vange_Brinjal.jpg", "Walnut.jpg",
  "Wheat.jpg", "Wheat_Flour_Atta.jpg", "Whole_Red_Lentils.jpg",
];

/* ════════════════════════════════════════════════════════════════
   FIRESTORE-BACKED PRODUCTS API
   ════════════════════════════════════════════════════════════════ */
const ProductsAPI = (function(){

  const COLLECTION = "products";

  function fsReady(){
    return !!(window.firebaseDB && window.firebaseEnabled);
  }

  /* ── One-time fetch. Falls back to DEFAULT_PRODUCTS on any
        failure or if the Firestore collection is still empty
        (e.g. before the admin has migrated/added products). ── */
  async function getProducts(){
    if(!fsReady()) return [...DEFAULT_PRODUCTS];
    try{
      const snap = await window.firebaseDB.collection(COLLECTION).orderBy("order","asc").get();
      if(snap.empty) return [...DEFAULT_PRODUCTS];
      return snap.docs.map(docToProduct);
    }catch(err){
      console.error("ProductsAPI.getProducts failed, using defaults:", err);
      return [...DEFAULT_PRODUCTS];
    }
  }

  /* ── Realtime subscription for the storefront. Returns an
        unsubscribe function. Calls back with DEFAULT_PRODUCTS
        immediately if Firestore isn't configured, or once if
        the collection is empty.

        `onData(list, isLive)` — the second argument tells callers
        whether `list` is real Firestore data (`true`) or the
        static fallback catalog (`false`). The Admin Panel uses
        this to disable editing on fallback data (see admin.js),
        since fallback items don't have real Firestore document
        IDs and can't be updated/deleted. ── */
  function subscribeProducts(onData, onError){
    if(!fsReady()){
      onData([...DEFAULT_PRODUCTS], false);
      return ()=>{};
    }
    try{
      return window.firebaseDB.collection(COLLECTION).orderBy("order","asc")
        .onSnapshot(
          snap=>{
            if(snap.empty){ onData([...DEFAULT_PRODUCTS], false); return; }
            onData(snap.docs.map(docToProduct), true);
          },
          err=>{
            console.error("ProductsAPI.subscribeProducts error, using defaults:", err);
            onData([...DEFAULT_PRODUCTS], false);
            if(onError) onError(err);
          }
        );
    }catch(err){
      console.error("ProductsAPI.subscribeProducts failed, using defaults:", err);
      onData([...DEFAULT_PRODUCTS], false);
      return ()=>{};
    }
  }

  function docToProduct(doc){
    const d = doc.data();
    return {
      id:          doc.id,
      name:        d.name        || "",
      nameEn:      d.nameEn       || "",
      category:    d.category     || "Vegetables",
      quantity:    d.quantity     || "1 Kg",
      price:       Number(d.price)|| 0,
      image:       d.image        || "images/products/Organic_Product.jpg",
      available:   d.available !== false, // default true
      order:       typeof d.order === "number" ? d.order : 0,
    };
  }

  /* ── Admin: create a product. `order` auto-assigned to the end.
        `data.image` must be a relative local path, e.g.
        "images/products/tomato.jpg" — chosen from
        window.PRODUCT_IMAGE_MANIFEST by the Admin Panel's image
        picker (see admin.js). No file upload, no Storage. ── */
  async function addProduct(data){
    requireAuth();
    const countSnap = await window.firebaseDB.collection(COLLECTION).get();
    const nextOrder = countSnap.size;
    const payload = {
      name:        data.name        || "",
      nameEn:      data.nameEn      || "",
      category:    data.category    || "Vegetables",
      quantity:    data.quantity    || "1 Kg",
      price:       Number(data.price)||0,
      image:       data.image       || "images/products/Organic_Product.jpg",
      available:   data.available !== false,
      order:       typeof data.order === "number" ? data.order : nextOrder,
      createdAt:   firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt:   firebase.firestore.FieldValue.serverTimestamp(),
    };
    const ref = await window.firebaseDB.collection(COLLECTION).add(payload);
    return ref.id;
  }

  /* ── Admin: update a product (partial update). ── */
  async function updateProduct(id, data){
    requireAuth();
    requireLiveId(id);
    const payload = {...data, updatedAt: firebase.firestore.FieldValue.serverTimestamp()};
    delete payload.id;
    await window.firebaseDB.collection(COLLECTION).doc(id).update(payload);
  }

  /* ── Admin: delete a product. Images live as static files in
        /images/products/ and are never touched by the app — only
        the Firestore document is removed. ── */
  async function deleteProduct(id){
    requireAuth();
    requireLiveId(id);
    await window.firebaseDB.collection(COLLECTION).doc(id).delete();
  }

  /* ── Admin: toggle availability quickly. ── */
  async function setAvailability(id, available){
    requireAuth();
    requireLiveId(id);
    await window.firebaseDB.collection(COLLECTION).doc(id).update({
      available: !!available,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
  }

  /* ── Admin: persist new order after drag/up-down reorder.
        `orderedIds` = array of doc ids in the desired order. ── */
  async function reorderProducts(orderedIds){
    requireAuth();
    orderedIds.forEach(requireLiveId);
    const batch = window.firebaseDB.batch();
    orderedIds.forEach((id, idx)=>{
      batch.update(window.firebaseDB.collection(COLLECTION).doc(id), {order: idx});
    });
    await batch.commit();
  }

  /* ── Admin: one-click migration of the original 187-item
        static catalog into Firestore. Safe to call multiple
        times — it only runs if the collection is still empty,
        so it will never duplicate or overwrite live data. ── */
  async function seedDefaultProducts(){
    requireAuth();
    const existing = await window.firebaseDB.collection(COLLECTION).limit(1).get();
    if(!existing.empty){
      throw new Error("Products collection already has data — seeding skipped to avoid duplicates.");
    }
    const batchSize = 400; // Firestore batch limit is 500 writes
    for(let i=0;i<DEFAULT_PRODUCTS.length;i+=batchSize){
      const batch = window.firebaseDB.batch();
      const chunk = DEFAULT_PRODUCTS.slice(i,i+batchSize);
      chunk.forEach((p, idx)=>{
        const ref = window.firebaseDB.collection(COLLECTION).doc();
        batch.set(ref, {
          name: p.name, nameEn: p.nameEn, category: p.category,
          quantity: p.quantity, price: p.price, image: p.image,
          available: true, order: i+idx,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        });
      });
      await batch.commit();
    }
    return DEFAULT_PRODUCTS.length;
  }

  function requireAuth(){
    if(!window.firebaseAuth || !window.firebaseAuth.currentUser){
      throw new Error("Not authenticated — admin login required for write operations.");
    }
  }

  /* ── Guard against operating on a fallback/static product (which
        has a plain number for `id`, e.g. 1, 2, 3 from DEFAULT_PRODUCTS,
        not a real Firestore document ID). Without this check, calling
        .doc(id) with a number crashes deep inside the Firestore SDK
        with a cryptic "n.indexOf is not a function" error instead of
        a clear message. ── */
  function requireLiveId(id){
    if(typeof id !== "string" || !id){
      throw new Error(
        "This product is showing the built-in catalog, not real Firestore data yet. " +
        "Click \"Import Original Catalog\" first, then try editing again."
      );
    }
  }

  return {
    getProducts, subscribeProducts, addProduct, updateProduct,
    deleteProduct, setAvailability, reorderProducts,
    seedDefaultProducts,
  };
})();

window.DEFAULT_PRODUCTS         = DEFAULT_PRODUCTS;
window.PRODUCT_CATEGORIES        = PRODUCT_CATEGORIES;
window.PRODUCT_UNITS             = PRODUCT_UNITS;
window.PRODUCT_IMAGE_MANIFEST    = PRODUCT_IMAGE_MANIFEST;
window.ProductsAPI               = ProductsAPI;
