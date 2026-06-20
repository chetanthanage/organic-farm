// ============================================================
// ORGANIC FARM — COMPLETE PRODUCT CATALOG (71 products)
// Sourced from catalog PDF + existing project
// All names in Marathi with English translation
// ============================================================

export const PRODUCTS = [
  // ── DAL & PULSES ──
  {id:1,  name:"उडीद डाळ (सफेद)",   nameEn:"Urad Dal (White)",        category:"Dal",        quantity:"500g",   price:95},
  {id:2,  name:"मसूर डाळ",           nameEn:"Masur Dal",               category:"Dal",        quantity:"500g",   price:80},
  {id:3,  name:"हरभरा डाळ",          nameEn:"Harbhara Dal (Chana)",    category:"Dal",        quantity:"500g",   price:70},
  {id:4,  name:"मूंग डाळ",           nameEn:"Moong Dal",               category:"Dal",        quantity:"500g",   price:85},
  {id:5,  name:"तूर डाळ",            nameEn:"Tur Dal",                 category:"Dal",        quantity:"500g",   price:90},
  {id:6,  name:"छोले (काबुली चना)",  nameEn:"Chole / Chickpeas",       category:"Dal",        quantity:"500g",   price:80},
  {id:7,  name:"राजमा",              nameEn:"Rajma",                   category:"Dal",        quantity:"500g",   price:100},
  {id:8,  name:"चवळी",               nameEn:"Chavali (Black-eyed peas)",category:"Dal",       quantity:"500g",   price:75},

  // ── GRAINS ──
  {id:9,  name:"गहू",                nameEn:"Wheat",                   category:"Grains",     quantity:"1 Kg",   price:55},
  {id:10, name:"बाजरी",              nameEn:"Bajra (Pearl Millet)",    category:"Grains",     quantity:"1 Kg",   price:40},
  {id:11, name:"बासमती तांदूळ",      nameEn:"Basmati Rice",            category:"Grains",     quantity:"1 Kg",   price:130},
  {id:12, name:"इंद्रायणी तांदूळ",  nameEn:"Indrayani Rice",          category:"Grains",     quantity:"1 Kg",   price:90},
  {id:13, name:"नागली (रागी)",       nameEn:"Nagli / Ragi",            category:"Grains",     quantity:"500g",   price:60},
  {id:14, name:"भगर (वरई)",          nameEn:"Bhagar / Varai",          category:"Grains",     quantity:"500g",   price:70},
  {id:15, name:"पोहे",               nameEn:"Pohe (Flattened Rice)",   category:"Grains",     quantity:"500g",   price:45},
  {id:16, name:"शेवई",               nameEn:"Shevai (Rice Noodles)",   category:"Grains",     quantity:"250g",   price:35},
  {id:17, name:"जवस (अळशी)",         nameEn:"Javas / Flaxseed",        category:"Grains",     quantity:"250g",   price:55},

  // ── DAIRY ──
  {id:18, name:"तूप (देशी गाईचे)",  nameEn:"Desi Cow Ghee",           category:"Dairy",      quantity:"500g",   price:380},
  {id:19, name:"शिरगाईचे तूप",      nameEn:"Shirgai Ghee",            category:"Dairy",      quantity:"200g",   price:180},
  {id:20, name:"दूध (गाईचे)",       nameEn:"Cow Milk",                category:"Dairy",      quantity:"1 Litre",price:65},
  {id:21, name:"लोणी (ताजे)",       nameEn:"Fresh Butter",            category:"Dairy",      quantity:"200g",   price:120},

  // ── SWEETENERS ──
  {id:22, name:"गूळ",               nameEn:"Jaggery (Block)",         category:"Sweeteners", quantity:"500g",   price:65},
  {id:23, name:"गूळ पावडर",         nameEn:"Jaggery Powder",          category:"Sweeteners", quantity:"500g",   price:70},
  {id:24, name:"मध (शुद्ध)",        nameEn:"Pure Honey",              category:"Sweeteners", quantity:"250g",   price:180},

  // ── OILS ──
  {id:25, name:"शेंगदाणा तेल",      nameEn:"Groundnut Oil",           category:"Oils",       quantity:"1 Litre",price:200},
  {id:26, name:"खोबरेल तेल",        nameEn:"Coconut Oil",             category:"Oils",       quantity:"500ml",  price:160},
  {id:27, name:"तिळाचे तेल",        nameEn:"Sesame Oil",              category:"Oils",       quantity:"500ml",  price:180},
  {id:28, name:"जवसाचे तेल",        nameEn:"Flaxseed Oil",            category:"Oils",       quantity:"250ml",  price:140},

  // ── SPICES ──
  {id:29, name:"धने पावडर",         nameEn:"Coriander Powder",        category:"Spices",     quantity:"200g",   price:50},
  {id:30, name:"जिरे पावडर",        nameEn:"Cumin Powder",            category:"Spices",     quantity:"200g",   price:55},
  {id:31, name:"हळद पावडर",         nameEn:"Turmeric Powder",         category:"Spices",     quantity:"200g",   price:80},
  {id:32, name:"लाल मिरची पावडर",   nameEn:"Red Chilli Powder",       category:"Spices",     quantity:"200g",   price:60},
  {id:33, name:"गरम मसाला",         nameEn:"Garam Masala",            category:"Spices",     quantity:"100g",   price:80},

  // ── NUTS & DRY FRUITS ──
  {id:34, name:"काजू",              nameEn:"Cashew Nuts",             category:"Nuts",       quantity:"250g",   price:280},
  {id:35, name:"बदाम",              nameEn:"Almonds",                 category:"Nuts",       quantity:"250g",   price:320},
  {id:36, name:"अक्रोड",            nameEn:"Walnut",                  category:"Nuts",       quantity:"250g",   price:350},
  {id:37, name:"खजूर",              nameEn:"Dates",                   category:"Nuts",       quantity:"500g",   price:180},

  // ── VEGETABLES ──
  {id:38, name:"टमाटर",             nameEn:"Organic Tomato",          category:"Vegetables", quantity:"1 Kg",   price:60},
  {id:39, name:"गाजर",              nameEn:"Fresh Carrot",            category:"Vegetables", quantity:"1 Kg",   price:70},
  {id:40, name:"बटाटा",             nameEn:"Organic Potato",          category:"Vegetables", quantity:"1 Kg",   price:35},
  {id:41, name:"कांदा",             nameEn:"Organic Onion",           category:"Vegetables", quantity:"1 Kg",   price:40},
  {id:42, name:"कोबी",              nameEn:"Cabbage",                 category:"Vegetables", quantity:"1 Pcs",  price:30},
  {id:43, name:"पालक",              nameEn:"Green Spinach",           category:"Vegetables", quantity:"250g",   price:20},
  {id:44, name:"कोथिंबीर",          nameEn:"Fresh Coriander",         category:"Vegetables", quantity:"100g",   price:15},
  {id:45, name:"मेथी",              nameEn:"Fenugreek Leaves",        category:"Vegetables", quantity:"250g",   price:25},
  {id:51, name:"वांगी",             nameEn:"Brinjal (Eggplant)",      category:"Vegetables", quantity:"1 Kg",   price:50},
  {id:52, name:"फ्लॉवर",            nameEn:"Cauliflower",             category:"Vegetables", quantity:"1 Pcs",  price:35},
  {id:53, name:"मटार (वाटाणा)",     nameEn:"Green Peas",              category:"Vegetables", quantity:"500g",   price:60},
  {id:54, name:"दुधी भोपळा",        nameEn:"Bottle Gourd (Dudhi)",    category:"Vegetables", quantity:"1 Pcs",  price:30},
  {id:55, name:"दोडका",             nameEn:"Ridge Gourd (Dodka)",     category:"Vegetables", quantity:"500g",   price:35},
  {id:56, name:"कारले",             nameEn:"Bitter Gourd (Karela)",   category:"Vegetables", quantity:"500g",   price:40},
  {id:57, name:"काकडी",             nameEn:"Cucumber",                category:"Vegetables", quantity:"1 Kg",   price:30},
  {id:58, name:"ढोबळी मिरची",       nameEn:"Capsicum (Bell Pepper)",  category:"Vegetables", quantity:"500g",   price:60},
  {id:59, name:"हिरवी मिरची",       nameEn:"Green Chilli",            category:"Vegetables", quantity:"250g",   price:30},
  {id:60, name:"भेंडी",             nameEn:"Ladies Finger (Okra)",    category:"Vegetables", quantity:"500g",   price:40},
  {id:61, name:"शेवगा",             nameEn:"Drumstick (Shevga)",      category:"Vegetables", quantity:"250g",   price:35},
  {id:62, name:"मुळा",              nameEn:"Radish",                  category:"Vegetables", quantity:"1 Kg",   price:25},
  {id:63, name:"बीट",               nameEn:"Beetroot",                category:"Vegetables", quantity:"500g",   price:35},
  {id:64, name:"मका (कणीस)",        nameEn:"Sweet Corn",              category:"Vegetables", quantity:"2 Pcs",  price:30},
  {id:65, name:"लाल भोपळा",         nameEn:"Red Pumpkin",             category:"Vegetables", quantity:"1 Kg",   price:30},
  {id:66, name:"गवार",              nameEn:"Cluster Beans (Gavar)",   category:"Vegetables", quantity:"500g",   price:50},
  {id:67, name:"फरसबी",             nameEn:"French Beans",            category:"Vegetables", quantity:"500g",   price:60},
  {id:68, name:"लसूण",              nameEn:"Garlic",                  category:"Vegetables", quantity:"250g",   price:60},
  {id:69, name:"आले",               nameEn:"Ginger",                  category:"Vegetables", quantity:"250g",   price:50},
  {id:70, name:"रताळे",             nameEn:"Sweet Potato",            category:"Vegetables", quantity:"1 Kg",   price:50},
  {id:71, name:"कांदा पात",         nameEn:"Spring Onion",            category:"Vegetables", quantity:"250g",   price:20},

  // ── FRUITS ──
  {id:46, name:"सफरचंद",            nameEn:"Organic Apple",           category:"Fruits",     quantity:"1 Kg",   price:180},
  {id:47, name:"केळे",              nameEn:"Fresh Banana",            category:"Fruits",     quantity:"1 Dozen",price:50},
  {id:48, name:"संत्री",            nameEn:"Organic Orange",          category:"Fruits",     quantity:"1 Kg",   price:120},
  {id:49, name:"पपई",               nameEn:"Fresh Papaya",            category:"Fruits",     quantity:"1 Kg",   price:45},
  {id:50, name:"डाळिंब",            nameEn:"Pomegranate",             category:"Fruits",     quantity:"1 Kg",   price:160},
];

export const CATEGORIES = [
  {id:"All",        label:"सर्व",        icon:"🌿"},
  {id:"Dal",        label:"डाळ",         icon:"🫘"},
  {id:"Grains",     label:"धान्य",       icon:"🌾"},
  {id:"Dairy",      label:"दुग्धजन्य",  icon:"🥛"},
  {id:"Sweeteners", label:"गोड",         icon:"🍯"},
  {id:"Oils",       label:"तेल",         icon:"🫙"},
  {id:"Spices",     label:"मसाले",       icon:"🌶️"},
  {id:"Nuts",       label:"सुका मेवा",  icon:"🥜"},
  {id:"Vegetables", label:"भाज्या",     icon:"🥕"},
  {id:"Fruits",     label:"फळे",         icon:"🍎"},
];

export const ADMIN_WA = "917743917248";
export const MAP_DIRECTIONS = "https://www.google.com/maps/dir//XQRH+7H8,+Shri+Hari+Narayan+Kute+Marg,+Near+Mumbai+Naka,+Matoshree+Nagar,+Nashik,+Maharashtra+422002";
