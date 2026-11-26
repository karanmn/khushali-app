import React, { useState, useMemo, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  deleteDoc,
  onSnapshot 
} from 'firebase/firestore';

// --- MASTER PRODUCTS WITH FRAGRANCE VARIANTS & CATALOG PRICING ---
const DEFAULT_PRODUCTS = [
  {
    id: "KHU-001",
    name: "White Phenyl Raw Material",
    category: "Disinfectant",
    minThresholdKg: 50,
    colorTheme: "#0284c7",
    colorName: "Milky White",
    pricing: { tier5: 255, tier25: 250, tier50: 245 },
    ratioLabel: "1:30",
    minRatio: 30,
    maxRatio: 30,
    dilutionRatio: 30,
    waterType: "RO Water (TDS 150-250)",
    waterAmountPerKg: 30,
    additives: "Add water slowly while continuous stirring. Ready instantly.",
    restingHours: 0,
    saltReqGram: 0,
    boosterReqGram: 0,
    notes: "TDS 150-250 wala paani dheere-dheere daalein.",
    packSizes: [5, 25, 50],
    unit: "kg",
    variants: [
      { id: "STD", name: "Standard Pine/Classic", type: "Standard", stockKg: 0 }
    ]
  },
  {
    id: "KHU-002",
    name: "Colour Phenyl Raw Material",
    category: "Disinfectant",
    minThresholdKg: 40,
    colorTheme: "#f43f5e",
    colorName: "Multi-Color Floral",
    pricing: { tier5: 265, tier25: 260, tier50: 255 },
    ratioLabel: "1:30",
    minRatio: 30,
    maxRatio: 30,
    dilutionRatio: 30,
    waterType: "RO Water (TDS 150-250)",
    waterAmountPerKg: 30,
    additives: "Mix slowly in TDS 150-250 water. Long lasting fragrance.",
    restingHours: 0,
    saltReqGram: 0,
    boosterReqGram: 0,
    notes: "TDS 150-250 water slow mix.",
    packSizes: [5, 25, 50],
    unit: "kg",
    variants: [
      { id: "ROSE", name: "Rose", type: "Standard", stockKg: 0 },
      { id: "LEMON", name: "Lemon", type: "Standard", stockKg: 0 },
      { id: "MOGRA", name: "Mogra", type: "Additional (Min 25kg)", stockKg: 0 },
      { id: "LAVENDER", name: "Lavender", type: "Additional (Min 25kg)", stockKg: 0 },
      { id: "CITRONELLA", name: "Citronella", type: "Additional (Min 25kg)", stockKg: 0 },
      { id: "LEMONGRASS", name: "Lemongrass", type: "Additional (Min 25kg)", stockKg: 0 },
      { id: "SANDAL", name: "Sandal", type: "Additional (Min 25kg)", stockKg: 0 },
      { id: "NEEM", name: "Neem", type: "Additional (Min 25kg)", stockKg: 0 }
    ]
  },
  {
    id: "KHU-003",
    name: "Black Phenyl Raw Material",
    category: "Disinfectant",
    minThresholdKg: 35,
    colorTheme: "#1e293b",
    colorName: "Dark Brown/Black",
    pricing: { tier5: 175, tier25: 170, tier50: 165 },
    ratioLabel: "1:6 to 1:9",
    minRatio: 6,
    maxRatio: 9,
    dilutionRatio: 8,
    waterType: "RO Water (< 70 TDS)",
    waterAmountPerKg: 8,
    additives: "Mix thoroughly in RO water (<70 TDS) until rich dark homogeneous solution forms.",
    restingHours: 0,
    saltReqGram: 0,
    boosterReqGram: 0,
    notes: "Achhi tarah milayein aur use karein.",
    packSizes: [5, 25, 50],
    unit: "kg",
    variants: [
      { id: "STD", name: "Standard Tar/Phenolic", type: "Standard", stockKg: 0 }
    ]
  },
  {
    id: "KHU-004",
    name: "Toilet Cleaner Raw Material",
    category: "Acidic & Bathroom",
    minThresholdKg: 30,
    colorTheme: "#2563eb",
    colorName: "Deep Ocean Blue",
    pricing: { tier5: 120, tier25: 110, tier50: 100 },
    ratioLabel: "1:7",
    minRatio: 7,
    maxRatio: 7,
    dilutionRatio: 7,
    waterType: "RO Water (< 70 TDS)",
    waterAmountPerKg: 7,
    additives: "Use clean RO water (<70 TDS). Mix well for uniform thick blue viscosity.",
    restingHours: 0,
    saltReqGram: 0,
    boosterReqGram: 0,
    notes: "RO paani < 70 TDS achhi tarah mix karein.",
    packSizes: [5, 25, 50],
    unit: "kg",
    variants: [
      { id: "STD", name: "Thick Blue Acidic", type: "Standard", stockKg: 0 }
    ]
  },
  {
    id: "KHU-005",
    name: "Bathroom Cleaner Raw Material (R1)",
    category: "Acidic & Bathroom",
    minThresholdKg: 25,
    colorTheme: "#dc2626",
    colorName: "Vibrant Red",
    pricing: { tier5: 125, tier25: 120, tier50: 115 },
    ratioLabel: "1:4 to 1:8",
    minRatio: 4,
    maxRatio: 8,
    dilutionRatio: 6,
    waterType: "RO Water (< 70 TDS)",
    waterAmountPerKg: 6,
    additives: "Mix thoroughly in low TDS water (<70 TDS). Leave 2-3 hours for clarity.",
    restingHours: 3,
    saltReqGram: 0,
    boosterReqGram: 0,
    notes: "RO paani < 70 TDS mix karein.",
    packSizes: [5, 15, 50],
    unit: "kg",
    variants: [
      { id: "STD", name: "Standard Floral/Fresh", type: "Standard", stockKg: 0 }
    ]
  },
  {
    id: "KHU-006",
    name: "Floor Cleaner Raw Material",
    category: "Surface Cleaners",
    minThresholdKg: 40,
    colorTheme: "#eab308",
    colorName: "Citrus / Floral",
    pricing: { tier5: 145, tier25: 140, tier50: 135 },
    ratioLabel: "1:40 to 1:60",
    minRatio: 40,
    maxRatio: 60,
    dilutionRatio: 50,
    waterType: "RO Water (< 70 TDS)",
    waterAmountPerKg: 50,
    additives: "Add to RO water (<70 TDS). Let it rest 2-3 hours for crystal clarity.",
    restingHours: 3,
    saltReqGram: 0,
    boosterReqGram: 0,
    notes: "Milakar 2-3 ghante chhod dein.",
    packSizes: [5, 25, 50],
    unit: "kg",
    variants: [
      { id: "LEMON", name: "Lemon", type: "Standard", stockKg: 0 },
      { id: "ROSE", name: "Rose", type: "Standard", stockKg: 0 },
      { id: "LAVENDER", name: "Lavender", type: "Additional (Min 25kg)", stockKg: 0 },
      { id: "JASMINE", name: "Jasmine", type: "Additional (Min 25kg)", stockKg: 0 },
      { id: "MOGRA", name: "Mogra", type: "Additional (Min 25kg)", stockKg: 0 },
      { id: "ORANGE", name: "Orange", type: "Additional (Min 25kg)", stockKg: 0 },
      { id: "GREEN_APPLE", name: "Green Apple", type: "Additional (Min 25kg)", stockKg: 0 },
      { id: "RAJNIGANDHA", name: "Rajnigandha", type: "Additional (Min 25kg)", stockKg: 0 },
      { id: "BELA", name: "Bela", type: "Additional (Min 25kg)", stockKg: 0 }
    ]
  },
  {
    id: "KHU-007",
    name: "Hand Wash Raw Material",
    category: "Personal Care",
    minThresholdKg: 30,
    colorTheme: "#ec4899",
    colorName: "Pearl Concentrate",
    pricing: { tier5: 350, tier25: 345, tier50: 340 },
    ratioLabel: "1:9",
    minRatio: 9,
    maxRatio: 9,
    dilutionRatio: 9.5,
    waterType: "RO Water",
    waterAmountPerKg: 8.5,
    additives: "Dissolve 500g Industrial Salt completely in 8.5kg water FIRST. Then add concentrate slowly. Rest 24h.",
    restingHours: 24,
    saltReqGram: 500,
    boosterReqGram: 0,
    notes: "Pehle paani me 500g namak gholein, fir concentrate daalein. 24h rest dein.",
    packSizes: [5, 25, 50],
    unit: "kg",
    variants: [
      { id: "ROSE", name: "Rose", type: "Standard", stockKg: 0 },
      { id: "LAVENDER", name: "Lavender", type: "Standard", stockKg: 0 },
      { id: "DETTOL", name: "Dettol Type", type: "Standard", stockKg: 0 },
      { id: "LEMON", name: "Lemon", type: "Additional (Min 25kg)", stockKg: 0 },
      { id: "GREEN_APPLE", name: "Green Apple", type: "Additional (Min 25kg)", stockKg: 0 },
      { id: "LIFEBUOY", name: "Lifebuoy Type", type: "Additional (Min 25kg)", stockKg: 0 },
      { id: "TULSI", name: "Tulsi", type: "Additional (Min 25kg)", stockKg: 0 },
      { id: "NEEM", name: "Neem", type: "Additional (Min 25kg)", stockKg: 0 },
      { id: "JASMINE", name: "Jasmine", type: "Additional (Min 25kg)", stockKg: 0 },
      { id: "STRAWBERRY", name: "Strawberry", type: "Additional (Min 25kg)", stockKg: 0 },
      { id: "SANDAL", name: "Sandal", type: "Additional (Min 25kg)", stockKg: 0 }
    ]
  },
  {
    id: "KHU-008",
    name: "Dishwash Raw Material",
    category: "Kitchen Care",
    minThresholdKg: 35,
    colorTheme: "#84cc16",
    colorName: "Lemon Lime Green",
    pricing: { tier5: 350, tier25: 345, tier50: 340 },
    ratioLabel: "1:9",
    minRatio: 9,
    maxRatio: 9,
    dilutionRatio: 10,
    waterType: "RO Water",
    waterAmountPerKg: 8.5,
    additives: "Dissolve 500g Industrial Salt + 500g-1000g Power Booster in 8.5kg water. Mix concentrate. Rest 24h.",
    restingHours: 24,
    saltReqGram: 500,
    boosterReqGram: 750,
    notes: "Paani me 500g namak aur booster milayein. 1 din rest rakhein.",
    packSizes: [5, 25, 50],
    unit: "kg",
    variants: [
      { id: "LEMON", name: "Lemon Active", type: "Standard", stockKg: 0 }
    ]
  },
  {
    id: "KHU-009",
    name: "Fabric Wash Raw Material",
    category: "Laundry Care",
    minThresholdKg: 25,
    colorTheme: "#06b6d4",
    colorName: "Oceanic Blue",
    pricing: { tier5: 350, tier25: 345, tier50: 340 },
    ratioLabel: "1:9",
    minRatio: 9,
    maxRatio: 9,
    dilutionRatio: 9.5,
    waterType: "RO Water",
    waterAmountPerKg: 8.5,
    additives: "First dissolve 500g Industrial Salt in water completely. Mix concentrate. Leave 24h for bubble clearance.",
    restingHours: 24,
    saltReqGram: 500,
    boosterReqGram: 0,
    notes: "Pehle 500g namak gholein. Mix karke 1 din chhod dein.",
    packSizes: [5, 25, 50],
    unit: "kg",
    variants: [
      { id: "STD", name: "Fresh Aqua / Surf", type: "Standard", stockKg: 0 }
    ]
  },
  {
    id: "KHU-010",
    name: "Glass Cleaner Raw Material",
    category: "Surface Cleaners",
    minThresholdKg: 20,
    colorTheme: "#0ea5e9",
    colorName: "Sky Blue",
    pricing: { tier5: 160, tier25: 155, tier50: 150 },
    ratioLabel: "1:80 to 1:100",
    minRatio: 80,
    maxRatio: 100,
    dilutionRatio: 90,
    waterType: "0 TDS (Battery / DM Water STRICTLY)",
    waterAmountPerKg: 90,
    additives: "MANDATORY: Use ONLY 0 TDS Demineralized/Battery water to prevent streaks and watermarks on glass.",
    restingHours: 0,
    saltReqGram: 0,
    boosterReqGram: 0,
    notes: "0 TDS (Battery/DM Water) ka hi upyog karein taaki daag na padein.",
    packSizes: [5, 25, 50],
    unit: "kg",
    variants: [
      { id: "STD", name: "Sparkle Blue", type: "Standard", stockKg: 0 }
    ]
  },
  {
    id: "KHU-011",
    name: "Car Wash Raw Material",
    category: "Auto Care",
    minThresholdKg: 25,
    colorTheme: "#f59e0b",
    colorName: "Golden Amber",
    pricing: { tier5: 350, tier25: 345, tier50: 340 },
    ratioLabel: "1:9",
    minRatio: 9,
    maxRatio: 9,
    dilutionRatio: 9.5,
    waterType: "RO Water",
    waterAmountPerKg: 8.5,
    additives: "Dissolve 500g Industrial Salt in 8.5kg water first. Mix concentrate for dense snow foam.",
    restingHours: 12,
    saltReqGram: 500,
    boosterReqGram: 0,
    notes: "Pehle paani me 500g namak milayein. High foam car shampoo ready.",
    packSizes: [5, 25, 50],
    unit: "kg",
    variants: [
      { id: "STD", name: "Snow Foam Wash", type: "Standard", stockKg: 0 }
    ]
  },
  {
    id: "KHU-012",
    name: "Room Freshener Raw Material",
    category: "Fragrance & Air",
    minThresholdKg: 10,
    colorTheme: "#8b5cf6",
    colorName: "Aromatic Mist",
    pricing: { tier5: 1220, tier25: 1210, tier50: 1210 },
    ratioLabel: "1:20",
    minRatio: 20,
    maxRatio: 20,
    dilutionRatio: 16,
    waterType: "RO Water (< 70 TDS)",
    waterAmountPerKg: 15,
    additives: "Mix with 15kg clean RO water (<70 TDS). Test with mist spray nozzle.",
    restingHours: 0,
    saltReqGram: 0,
    boosterReqGram: 0,
    notes: "RO paani < 70 TDS. Bottle me spray check karein.",
    packSizes: [5, 10],
    unit: "kg",
    variants: [
      { id: "LAVENDER", name: "Lavender", type: "Standard", stockKg: 0 },
      { id: "SEVEN_WONDER", name: "Seven Wonder", type: "Standard", stockKg: 0 },
      { id: "LONDON_LOVE", name: "London Love", type: "Standard", stockKg: 0 },
      { id: "ROSE", name: "Rose", type: "Additional (Min 25kg)", stockKg: 0 },
      { id: "MOGRA", name: "Mogra", type: "Additional (Min 25kg)", stockKg: 0 },
      { id: "CHANDAN", name: "Chandan", type: "Additional (Min 25kg)", stockKg: 0 },
      { id: "JASMINE", name: "Jasmine", type: "Additional (Min 25kg)", stockKg: 0 },
      { id: "AROGLOBAL", name: "Aroglobal", type: "Additional (Min 25kg)", stockKg: 0 },
      { id: "PUNCH", name: "Punch", type: "Additional (Min 25kg)", stockKg: 0 }
    ]
  }
];

// --- FIREBASE CONFIGURATION ---
const firebaseConfig = {
  apiKey: "AIzaSyD3pPGlB37Njyp7IVnV2a0k4ArRNJFZ9JY",
  authDomain: "khushali-a24f0.firebaseapp.com",
  projectId: "khushali-a24f0",
  storageBucket: "khushali-a24f0.firebasestorage.app",
  messagingSenderId: "1072051479007",
  appId: "1:1072051479007:web:47acc32a1cb85e7c4f246a",
  measurementId: "G-QGVJV5V7HS"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export default function App() {
  // --- AUTH & ROLE STATE (ADMIN vs STAFF) ---
  const [userRole, setUserRole] = useState(null); // 'ADMIN' | 'STAFF' | null
  const [loginPassword, setLoginPassword] = useState('');

  const [syncStatus, setSyncStatus] = useState('Connecting to live database...');
  const [isCloudConnected, setIsCloudConnected] = useState(false);
  const [cloudError, setCloudError] = useState(null);

  const [baseProducts, setBaseProducts] = useState(DEFAULT_PRODUCTS);
  const [customProducts, setCustomProducts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  
  const [activeTab, setActiveTab] = useState('inventory');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  const [notification, setNotification] = useState(null);

  // Track active selected variant pill on each product card
  const [selectedVariantsMap, setSelectedVariantsMap] = useState({});

  // --- LEDGER FILTERS & SORTING ---
  const [ledgerSortOrder, setLedgerSortOrder] = useState('desc');
  const [ledgerTypeFilter, setLedgerTypeFilter] = useState('ALL');
  const [ledgerProductFilter, setLedgerProductFilter] = useState('ALL');
  const [ledgerDateFilter, setLedgerDateFilter] = useState('ALL'); // 'ALL' | 'TODAY' | 'MONTH'

  // --- MODALS ---
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [confirmResetModal, setConfirmResetModal] = useState(false);
  const [challanModal, setChallanModal] = useState({ open: false, tx: null });
  const [addVariantModal, setAddVariantModal] = useState({ open: false, product: null });
  const [newVariantName, setNewVariantName] = useState('');
  const [newVariantType, setNewVariantType] = useState('Standard');

  const [addProductModalOpen, setAddProductModalOpen] = useState(false);
  const [newProdName, setNewProdName] = useState('');
  const [newProdCategory, setNewProdCategory] = useState('Surface Cleaners');
  const [newProdRatioLabel, setNewProdRatioLabel] = useState('1:20');
  const [newProdRatioNum, setNewProdRatioNum] = useState(20);
  const [newProdWaterType, setNewProdWaterType] = useState('RO Water (< 70 TDS)');
  const [newProdTier5, setNewProdTier5] = useState(200);
  const [newProdTier25, setNewProdTier25] = useState(195);
  const [newProdTier50, setNewProdTier50] = useState(190);
  const [newProdMinThresh, setNewProdMinThresh] = useState(25);
  const [newProdFragrances, setNewProdFragrances] = useState('Standard');

  const [editPriceModal, setEditPriceModal] = useState({ open: false, product: null });
  const [editTier5, setEditTier5] = useState('');
  const [editTier25, setEditTier25] = useState('');
  const [editTier50, setEditTier50] = useState('');
  const [editMinThreshold, setEditMinThreshold] = useState('');

  const [quickStockModal, setQuickStockModal] = useState({ open: false, product: null, variantId: null, type: 'INWARD' });
  const [modalQty, setModalQty] = useState('');
  const [modalVariantId, setModalVariantId] = useState('');
  const [modalRef, setModalRef] = useState('');
  const [modalParty, setModalParty] = useState('');
  const [modalPartyGst, setModalPartyGst] = useState('');
  const [modalPriceTier, setModalPriceTier] = useState('tier25');
  const [modalNotes, setModalNotes] = useState('');

  // --- DILUTION CALCULATOR STATE ---
  const [calcProductId, setCalcProductId] = useState("KHU-004");
  const [calcVariantId, setCalcVariantId] = useState("STD");
  const [calcInputType, setCalcInputType] = useState("CONCENTRATE");
  const [calcAmount, setCalcAmount] = useState(5);
  const [calcCustomRatio, setCalcCustomRatio] = useState(7);
  const [calcCostTier, setCalcCostTier] = useState("tier25");

  const showToast = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3500);
  };

  // Firebase Auth
  useEffect(() => {
    signInAnonymously(auth).catch((err) => {
      console.error("Auth error:", err);
      setCloudError("Auth Error: " + err.message);
    });

    const unsub = onAuthStateChanged(auth, (u) => {
      if (u) {
        setIsCloudConnected(true);
        setSyncStatus('🟢 Cloud Live Sync Active');
      }
    });
    return () => unsub();
  }, []);

  // Firebase Firestore Listeners
  useEffect(() => {
    const productsRef = collection(db, 'products');
    const txRef = collection(db, 'transactions');

    const unsubProducts = onSnapshot(
      productsRef,
      (snapshot) => {
        const cloudMap = {};
        const customList = [];

        snapshot.forEach(docSnap => {
          const data = docSnap.data();
          cloudMap[docSnap.id] = data;
          if (data.isCustom) {
            customList.push({ id: docSnap.id, ...data });
          }
        });

        setCustomProducts(customList);

        setBaseProducts(prev => prev.map(def => {
          const remote = cloudMap[def.id];
          if (!remote) return def;
          
          // Merge variants safely
          let mergedVariants = [...def.variants];
          if (remote.variants && Array.isArray(remote.variants)) {
            remote.variants.forEach(rv => {
              const existingIdx = mergedVariants.findIndex(v => v.id === rv.id);
              if (existingIdx > -1) {
                mergedVariants[existingIdx] = { ...mergedVariants[existingIdx], ...rv };
              } else {
                mergedVariants.push(rv);
              }
            });
          }

          return {
            ...def,
            ...remote,
            pricing: {
              ...def.pricing,
              ...(remote.pricing || {})
            },
            variants: mergedVariants
          };
        }));
      },
      (error) => {
        console.error("Firestore product error:", error);
      }
    );

    const unsubTx = onSnapshot(
      txRef,
      (snapshot) => {
        const list = [];
        snapshot.forEach(docSnap => {
          list.push({ id: docSnap.id, ...docSnap.data() });
        });
        // Sort chronologically ascending first to compute accurate running balances
        list.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
        setTransactions(list);
      },
      (error) => {
        console.error("Firestore tx error:", error);
      }
    );

    return () => {
      unsubProducts();
      unsubTx();
    };
  }, []);

  // Compute Live Variant-Level & Product-Level Stocks from Transactions
  const products = useMemo(() => {
    const combined = [...baseProducts, ...customProducts];

    // Map: productId -> variantId -> stockKg
    const stockLedgerMap = {};

    transactions.forEach(tx => {
      if (tx.type === 'PRODUCT_RESET') {
        Object.keys(stockLedgerMap).forEach(pid => {
          stockLedgerMap[pid] = {};
        });
        return;
      }

      if (!tx.productId || tx.qty === undefined) return;
      const pid = tx.productId;
      if (!stockLedgerMap[pid]) stockLedgerMap[pid] = {};

      // Fallback to first variant if legacy tx had no variantId
      const prodObj = combined.find(p => p.id === pid);
      const defaultVarId = prodObj && prodObj.variants && prodObj.variants[0] ? prodObj.variants[0].id : 'STD';
      const vid = tx.variantId || defaultVarId;

      if (!stockLedgerMap[pid][vid]) stockLedgerMap[pid][vid] = 0;
      const qty = Number(tx.qty) || 0;

      if (tx.type === 'INWARD') {
        stockLedgerMap[pid][vid] += qty;
      } else if (tx.type === 'DISPATCH' || tx.type === 'PRODUCTION_DILUTION') {
        stockLedgerMap[pid][vid] -= qty;
      }
    });

    return combined.map(p => {
      const pStocks = stockLedgerMap[p.id] || {};
      const updatedVariants = (p.variants || [{ id: 'STD', name: 'Standard', type: 'Standard', stockKg: 0 }]).map(v => ({
        ...v,
        stockKg: Math.max(0, Number((pStocks[v.id] || 0).toFixed(2)))
      }));

      const totalStockKg = updatedVariants.reduce((sum, v) => sum + v.stockKg, 0);

      return {
        ...p,
        variants: updatedVariants,
        stockKg: Number(totalStockKg.toFixed(2))
      };
    });
  }, [baseProducts, customProducts, transactions]);

  // Update calculator ratio & variant when product changes
  useEffect(() => {
    const prod = products.find(p => p.id === calcProductId);
    if (prod) {
      setCalcCustomRatio(prod.dilutionRatio || prod.minRatio || 10);
      if (prod.variants && prod.variants.length > 0) {
        const exists = prod.variants.some(v => v.id === calcVariantId);
        if (!exists) setCalcVariantId(prod.variants[0].id);
      }
    }
  }, [calcProductId, products]);

  // --- FILTERED & SORTED LEDGER ---
  const filteredTransactions = useMemo(() => {
    const now = new Date();
    const todayStr = now.toDateString();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const list = transactions.filter(tx => {
      if (ledgerTypeFilter !== 'ALL' && tx.type !== ledgerTypeFilter) return false;
      if (ledgerProductFilter !== 'ALL' && tx.productId !== ledgerProductFilter) return false;
      
      if (ledgerDateFilter !== 'ALL' && tx.timestamp) {
        const txDate = new Date(tx.timestamp);
        if (ledgerDateFilter === 'TODAY' && txDate.toDateString() !== todayStr) return false;
        if (ledgerDateFilter === 'MONTH' && (txDate.getMonth() !== currentMonth || txDate.getFullYear() !== currentYear)) return false;
      }
      return true;
    });

    list.sort((a, b) => {
      const timeA = a.timestamp || 0;
      const timeB = b.timestamp || 0;
      return ledgerSortOrder === 'desc' ? timeB - timeA : timeA - timeB;
    });
    return list;
  }, [transactions, ledgerSortOrder, ledgerTypeFilter, ledgerProductFilter, ledgerDateFilter]);

  const saveProductToCloud = async (productId, updatedFields) => {
    try {
      await setDoc(doc(db, 'products', productId), updatedFields, { merge: true });
    } catch (err) {
      console.error("Failed to save product:", err);
      showToast("Cloud write failed: " + err.message, "error");
    }
  };

  const saveTransactionToCloud = async (txData) => {
    try {
      await setDoc(doc(db, 'transactions', txData.id), {
        ...txData,
        timestamp: Date.now()
      });
    } catch (err) {
      console.error("Failed to save tx:", err);
      showToast("Failed to log transaction: " + err.message, "error");
    }
  };

  const handleDeleteTransaction = async (tx) => {
    if (userRole !== 'ADMIN') {
      showToast("Only Admin can delete ledger entries!", "error");
      return;
    }
    if (!window.confirm(`Undo/Delete transaction [${tx.id}]? Stock will be automatically reversed.`)) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'transactions', tx.id));
      showToast(`Transaction ${tx.id} deleted and stock reversed!`);
    } catch (err) {
      console.error("Error deleting transaction:", err);
      showToast("Failed to delete transaction: " + err.message, "error");
    }
  };

  // --- INVENTORY STATS ---
  const inventoryStats = useMemo(() => {
    let totalStockKg = 0;
    let totalStockValuation = 0;
    let totalPotentialDilutedLitres = 0;
    let lowStockCount = 0;
    let totalVariantsCount = 0;

    products.forEach(p => {
      const stock = Number(p.stockKg) || 0;
      totalStockKg += stock;
      const baseVal = p.pricing ? (p.pricing.tier25 || p.pricing.tier5 || 0) : 0;
      totalStockValuation += stock * baseVal;
      totalPotentialDilutedLitres += stock * (p.dilutionRatio || 1);
      if (stock < (p.minThresholdKg || 20)) lowStockCount++;
      totalVariantsCount += (p.variants ? p.variants.length : 1);
    });

    return {
      totalStockKg,
      totalStockValuation,
      totalPotentialDilutedLitres,
      lowStockCount,
      totalProducts: products.length,
      totalVariantsCount
    };
  }, [products]);

  const categories = useMemo(() => {
    const set = new Set(products.map(p => p.category));
    return ['ALL', ...Array.from(set)];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchCat = selectedCategory === 'ALL' || p.category === selectedCategory;
      const isLow = (p.stockKg || 0) < (p.minThresholdKg || 20);
      if (showLowStockOnly && !isLow) return false;

      const q = searchQuery.toLowerCase();
      const matchName = p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
      const matchVariant = p.variants && p.variants.some(v => v.name.toLowerCase().includes(q));
      return matchCat && (matchName || matchVariant);
    });
  }, [products, selectedCategory, searchQuery, showLowStockOnly]);

  // --- DILUTION CALCULATOR RESULT ---
  const selectedCalcProduct = useMemo(() => {
    return products.find(p => p.id === calcProductId) || products[0];
  }, [products, calcProductId]);

  const selectedCalcVariant = useMemo(() => {
    if (!selectedCalcProduct || !selectedCalcProduct.variants) return { id: 'STD', name: 'Standard', stockKg: 0 };
    return selectedCalcProduct.variants.find(v => v.id === calcVariantId) || selectedCalcProduct.variants[0];
  }, [selectedCalcProduct, calcVariantId]);

  const formulationResult = useMemo(() => {
    if (!selectedCalcProduct || calcAmount <= 0) return null;

    const activeRatio = Number(calcCustomRatio) || selectedCalcProduct.dilutionRatio || 1;
    let concentrateKg = 0;
    let finishedLitres = 0;

    if (calcInputType === "CONCENTRATE") {
      concentrateKg = Number(calcAmount);
      finishedLitres = concentrateKg * activeRatio;
    } else {
      finishedLitres = Number(calcAmount);
      concentrateKg = finishedLitres / activeRatio;
    }

    // Adjust water proportionally if slider ratio changed
    const baseRatio = selectedCalcProduct.dilutionRatio || 1;
    const baseWaterPerKg = selectedCalcProduct.waterAmountPerKg || baseRatio;
    const effectiveWaterPerKg = baseRatio === activeRatio ? baseWaterPerKg : activeRatio;

    const waterKg = concentrateKg * effectiveWaterPerKg;
    const saltGrams = concentrateKg * (selectedCalcProduct.saltReqGram || 0);
    const boosterGrams = concentrateKg * (selectedCalcProduct.boosterReqGram || 0);

    const ratePerKg = (selectedCalcProduct.pricing && selectedCalcProduct.pricing[calcCostTier]) || (selectedCalcProduct.pricing && selectedCalcProduct.pricing.tier5) || 0;
    const totalConcentrateCost = concentrateKg * ratePerKg;
    const costPerFinishedLitre = finishedLitres > 0 ? (totalConcentrateCost / finishedLitres) : 0;

    const variantStock = selectedCalcVariant ? (selectedCalcVariant.stockKg || 0) : 0;

    return {
      concentrateKg: concentrateKg.toFixed(2),
      finishedLitres: finishedLitres.toFixed(1),
      waterKg: waterKg.toFixed(1),
      saltGrams: saltGrams.toFixed(0),
      saltKg: (saltGrams / 1000).toFixed(2),
      boosterGrams: boosterGrams.toFixed(0),
      boosterKg: (boosterGrams / 1000).toFixed(2),
      ratePerKg: ratePerKg,
      totalConcentrateCost: Math.round(totalConcentrateCost),
      costPerFinishedLitre: costPerFinishedLitre.toFixed(2),
      restingHours: selectedCalcProduct.restingHours || 0,
      waterType: selectedCalcProduct.waterType,
      instructions: selectedCalcProduct.additives,
      availableInStock: variantStock >= concentrateKg,
      variantStock
    };
  }, [selectedCalcProduct, selectedCalcVariant, calcAmount, calcInputType, calcCostTier, calcCustomRatio]);

  // --- HANDLERS ---
  const handleOpenEditPrice = (product) => {
    if (userRole !== 'ADMIN') {
      showToast("Admin PIN required to edit pricing & thresholds!", "error");
      return;
    }
    setEditPriceModal({ open: true, product: product });
    setEditTier5(product.pricing.tier5);
    setEditTier25(product.pricing.tier25);
    setEditTier50(product.pricing.tier50);
    setEditMinThreshold(product.minThresholdKg || 30);
  };

  const handleSavePriceEdits = async (e) => {
    e.preventDefault();
    const product = editPriceModal.product;
    if (!product) return;

    const newPricing = {
      tier5: parseFloat(editTier5) || product.pricing.tier5,
      tier25: parseFloat(editTier25) || product.pricing.tier25,
      tier50: parseFloat(editTier50) || product.pricing.tier50
    };
    const newMinThresh = parseFloat(editMinThreshold) || product.minThresholdKg;

    await saveProductToCloud(product.id, {
      pricing: newPricing,
      minThresholdKg: newMinThresh
    });

    showToast("Updated rates for " + product.name + "! Synced live.");
    setEditPriceModal({ open: false, product: null });
  };

  const handleAddNewVariant = async (e) => {
    e.preventDefault();
    const product = addVariantModal.product;
    if (!product || !newVariantName.trim()) return;

    const varId = newVariantName.trim().toUpperCase().replace(/[^A-Z0-9]/g, '_');
    if (product.variants.some(v => v.id === varId)) {
      showToast("This fragrance already exists in this product!", "error");
      return;
    }

    const updatedVariants = [
      ...product.variants,
      { id: varId, name: newVariantName.trim(), type: newVariantType, stockKg: 0 }
    ];

    await saveProductToCloud(product.id, { variants: updatedVariants });
    setSelectedVariantsMap(prev => ({ ...prev, [product.id]: varId }));
    showToast(`Added "${newVariantName.trim()}" fragrance to ${product.name}!`);
    setNewVariantName('');
    setAddVariantModal({ open: false, product: null });
  };

  const handleCreateCustomProduct = async (e) => {
    e.preventDefault();
    if (!newProdName.trim()) return;

    const newId = "KHU-C" + Date.now().toString().slice(-3);
    const fragList = newProdFragrances
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const variants = fragList.length > 0
      ? fragList.map(f => ({
          id: f.toUpperCase().replace(/[^A-Z0-9]/g, '_'),
          name: f,
          type: 'Standard',
          stockKg: 0
        }))
      : [{ id: 'STD', name: 'Standard', type: 'Standard', stockKg: 0 }];

    const ratioNum = Number(newProdRatioNum) || 10;

    const newProductObj = {
      id: newId,
      name: newProdName.trim(),
      category: newProdCategory,
      minThresholdKg: Number(newProdMinThresh) || 25,
      colorTheme: "#14b8a6",
      colorName: "Custom Formula",
      pricing: {
        tier5: Number(newProdTier5) || 200,
        tier25: Number(newProdTier25) || 195,
        tier50: Number(newProdTier50) || 190
      },
      ratioLabel: newProdRatioLabel || `1:${ratioNum}`,
      minRatio: ratioNum,
      maxRatio: ratioNum,
      dilutionRatio: ratioNum,
      waterType: newProdWaterType,
      waterAmountPerKg: ratioNum,
      additives: "Mix thoroughly as per standard batch instructions.",
      restingHours: 0,
      saltReqGram: 0,
      boosterReqGram: 0,
      notes: "Custom added formula.",
      packSizes: [5, 25, 50],
      unit: "kg",
      variants,
      isCustom: true
    };

    await saveProductToCloud(newId, newProductObj);
    showToast(`New Product "${newProdName}" created & synced!`);
    setAddProductModalOpen(false);
    setNewProdName('');
  };

  const handleQuickAdd = async (product, variant, addAmount) => {
    const newTx = {
      id: "TX-" + Date.now().toString().slice(-5),
      date: new Date().toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }),
      type: 'INWARD',
      productId: product.id,
      productName: product.name,
      variantId: variant.id,
      variantName: variant.name,
      qty: addAmount,
      unit: "kg",
      refNumber: "GRN-" + addAmount + "KG",
      party: 'Factory Line Inward',
      notes: `${variant.name} • Quick batch +${addAmount}kg`,
      amount: addAmount * (product.pricing.tier25 || product.pricing.tier5)
    };
    await saveTransactionToCloud(newTx);
    showToast(`+${addAmount}kg (${variant.name}) added to ${product.name}!`);
  };

  const handleStockUpdate = async (e) => {
    e.preventDefault();
    const qtyNum = parseFloat(modalQty);
    if (!qtyNum || qtyNum <= 0) {
      showToast("Please enter a valid quantity in kg", "error");
      return;
    }

    const product = quickStockModal.product;
    if (!product) return;

    const targetVariant = product.variants.find(v => v.id === modalVariantId) || product.variants[0];
    const currentVariantStock = Number(targetVariant.stockKg) || 0;

    if (quickStockModal.type === 'DISPATCH' && currentVariantStock < qtyNum) {
      showToast(`Insufficient ${targetVariant.name} stock! Available: ${currentVariantStock}kg`, "error");
      return;
    }

    const unitPrice = product.pricing[modalPriceTier] || product.pricing.tier25;
    const totalAmt = Math.round(qtyNum * unitPrice);

    const newTx = {
      id: "TX-" + Date.now().toString().slice(-5),
      date: new Date().toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }),
      type: quickStockModal.type,
      productId: product.id,
      productName: product.name,
      variantId: targetVariant.id,
      variantName: targetVariant.name,
      qty: qtyNum,
      unit: product.unit || "kg",
      refNumber: modalRef || (quickStockModal.type === 'INWARD' ? "GRN-" + Date.now().toString().slice(-4) : "DISP-" + Date.now().toString().slice(-4)),
      party: modalParty || (quickStockModal.type === 'INWARD' ? 'Factory Batch' : 'Wholesale Client'),
      partyGst: modalPartyGst || '',
      rateApplied: unitPrice,
      notes: modalNotes || `${targetVariant.name} (${targetVariant.type}) @ Rs.${unitPrice}/kg`,
      amount: totalAmt
    };
    await saveTransactionToCloud(newTx);

    showToast(
      quickStockModal.type === 'INWARD'
        ? `Added +${qtyNum}kg (${targetVariant.name}) to ${product.name}.`
        : `Dispatched -${qtyNum}kg (${targetVariant.name}) from ${product.name}.`
    );

    setQuickStockModal({ open: false, product: null, variantId: null, type: 'INWARD' });
    setModalQty('');
    setModalRef('');
    setModalParty('');
    setModalPartyGst('');
    setModalNotes('');

    // Open Delivery Challan automatically on Dispatch
    if (quickStockModal.type === 'DISPATCH') {
      setChallanModal({ open: true, tx: newTx });
    }
  };

  const handleLogDilutionBatch = async () => {
    if (!formulationResult) return;
    const reqConc = parseFloat(formulationResult.concentrateKg);
    const currentStock = Number(selectedCalcVariant.stockKg) || 0;

    if (currentStock < reqConc) {
      showToast(`${selectedCalcVariant.name} stock is ${currentStock}kg, need ${reqConc}kg.`, "error");
      return;
    }

    const newTx = {
      id: "TX-" + Date.now().toString().slice(-5),
      date: new Date().toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }),
      type: 'PRODUCTION_DILUTION',
      productId: selectedCalcProduct.id,
      productName: selectedCalcProduct.name,
      variantId: selectedCalcVariant.id,
      variantName: selectedCalcVariant.name,
      qty: reqConc,
      unit: "kg",
      refNumber: "BATCH-" + Date.now().toString().slice(-4),
      notes: `[${selectedCalcVariant.name}] Mixed ${reqConc}kg (1:${calcCustomRatio}) + ${formulationResult.waterKg}kg water -> ${formulationResult.finishedLitres}L output.`
    };
    await saveTransactionToCloud(newTx);

    showToast(`Batch logged: ${formulationResult.finishedLitres}L (${selectedCalcVariant.name}) produced!`);
  };

  const shareRecipeOnWhatsApp = () => {
    if (!formulationResult || !selectedCalcProduct) return;
    const msg = `*KHUSHALI CHEMICALS - BATCH FORMULATION & QUOTE* 🧪\n` +
      `-----------------------------------\n` +
      `*Product:* ${selectedCalcProduct.name} (${selectedCalcVariant.name})\n` +
      `*Dilution Ratio:* 1:${calcCustomRatio}\n` +
      `*Raw Concentrate Needed:* ${formulationResult.concentrateKg} kg\n` +
      `*Water Required:* ${formulationResult.waterKg} Litres (${formulationResult.waterType})\n` +
      (parseFloat(formulationResult.saltGrams) > 0 ? `*Industrial Salt:* ${formulationResult.saltKg} kg (${formulationResult.saltGrams}g)\n` : '') +
      (parseFloat(formulationResult.boosterGrams) > 0 ? `*Power Booster:* ${formulationResult.boosterKg} kg (${formulationResult.boosterGrams}g)\n` : '') +
      `*Total Ready Product:* *${formulationResult.finishedLitres} Litres*\n` +
      `-----------------------------------\n` +
      `*Concentrate Rate:* Rs.${formulationResult.ratePerKg}/kg (Incl. 18% GST)\n` +
      `*Total Raw Material Cost:* Rs.${formulationResult.totalConcentrateCost}\n` +
      `*Final Ready Cost / Litre:* *Rs.${formulationResult.costPerFinishedLitre} / L*\n` +
      `-----------------------------------\n` +
      `📍 Jaipur, Rajasthan | 📞 +91 8905878950`;

    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const sendLowStockWhatsApp = (product, variant) => {
    const msg = `*URGENT FACTORY REORDER - KHUSHALI CHEMICALS* ⚠️\n` +
      `Product: *${product.name}*\n` +
      `Fragrance/Variant: *${variant.name}*\n` +
      `Current Stock: *${variant.stockKg} kg* (Total SKU: ${product.stockKg} kg)\n` +
      `Min Threshold: ${product.minThresholdKg} kg\n` +
      `Please schedule next production batch.`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const executeResetAllStock = async () => {
    if (userRole !== 'ADMIN') return;
    const resetTx = {
      id: "TX-RESET-ALL-" + Date.now().toString().slice(-4),
      date: new Date().toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }),
      type: 'PRODUCT_RESET',
      productId: 'ALL-SKUS',
      productName: 'All Products & Variants Initialized',
      variantId: 'ALL',
      variantName: 'All Fragrances',
      qty: 0,
      unit: 'kg',
      refNumber: 'CLOUD-RESET',
      party: "Admin Device",
      notes: 'All product & fragrance inventories reset to 0 kg across all devices',
      amount: 0
    };
    await saveTransactionToCloud(resetTx);

    setConfirmResetModal(false);
    showToast("All product & fragrance stocks reset to 0 kg!");
  };

  const copyShareLink = () => {
    const url = window.location.href;
    const textArea = document.createElement("textarea");
    textArea.value = url;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      showToast("App URL copied! Open on any phone browser.");
    } catch (err) {
      showToast("Could not copy link", "error");
    }
    document.body.removeChild(textArea);
  };

  // --- ROLE-BASED LOGIN SCREEN ---
  if (!userRole) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-sans">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-8 shadow-2xl space-y-6 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-400"></div>
          
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-cyan-400 flex items-center justify-center font-black text-white text-2xl shadow-lg shadow-blue-500/20 border border-blue-400/30">
            KC
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold text-cyan-400 tracking-widest uppercase bg-cyan-950/80 px-3 py-1 rounded-full border border-cyan-800">
              Khushali Chemicals • Jaipur
            </span>
            <h2 className="text-2xl font-black text-white tracking-tight">
              Inventory & Dilution Portal
            </h2>
            <p className="text-xs text-slate-400">
              Enter Admin PIN (Full Access) or Staff PIN (Stock & Dilution)
            </p>
          </div>

          <form onSubmit={(e) => {
            e.preventDefault();
            if (loginPassword === '7568') {
              setUserRole('ADMIN');
              showToast("Logged in as ADMIN (Full Access)");
            } else if (loginPassword === '1234') {
              setUserRole('STAFF');
              showToast("Logged in as STAFF (Warehouse & Sales Mode)");
            } else {
              showToast("Invalid PIN! Use Admin (7568) or Staff (1234)", "error");
            }
          }} className="space-y-4 pt-2">
            <div>
              <input
                type="password"
                placeholder="Enter Access PIN"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-4 py-3.5 text-center text-lg font-bold text-white tracking-widest focus:outline-none focus:border-blue-500 shadow-inner"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-2xl shadow-lg shadow-blue-600/30 transition active:scale-95 text-sm"
            >
              🔐 Unlock Portal
            </button>
          </form>

          <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80 text-[11px] text-slate-400 flex justify-around">
            <span>👑 Admin PIN: <strong className="text-slate-200">7568</strong></span>
            <span>👷 Staff PIN: <strong className="text-slate-200">1234</strong></span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {notification && (
        <div className={"fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-2xl backdrop-blur-md border flex items-center gap-3 transition-all " + (notification.type === 'error' ? 'bg-rose-950/90 border-rose-600 text-rose-200' : 'bg-emerald-950/90 border-emerald-600 text-emerald-200')}>
          <span className="text-xl">{notification.type === 'error' ? '⚠️' : '✅'}</span>
          <p className="text-sm font-medium">{notification.msg}</p>
        </div>
      )}

      {cloudError && (
        <div className="bg-rose-950 border-b border-rose-700 py-2.5 px-4 text-center text-xs text-rose-200 font-semibold">
          ⚠️ {cloudError}
        </div>
      )}

      {/* HEADER */}
      <header className="bg-slate-950/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-cyan-400 flex items-center justify-center font-black text-white text-xl shadow-lg shadow-blue-500/20 border border-blue-400/30">
                KC
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base sm:text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                    KHUSHALI <span className="text-cyan-400 font-extrabold">CHEMICALS</span>
                  </h1>
                  <span className={"px-2 py-0.5 text-[10px] font-bold tracking-wide rounded-md border flex items-center gap-1 " + (userRole === 'ADMIN' ? 'bg-amber-950 text-amber-300 border-amber-700' : 'bg-cyan-950 text-cyan-300 border-cyan-700')}>
                    {userRole === 'ADMIN' ? '👑 ADMIN' : '👷 STAFF'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 flex items-center gap-2">
                  <span>📍 Jaipur, Rajasthan</span>
                  <span className="hidden md:inline">• Contact: 8905878950</span>
                  <span className="hidden lg:inline">• GST: 08PBDPS5444B1ZD</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {userRole === 'ADMIN' && (
                <button
                  onClick={() => setAddProductModalOpen(true)}
                  className="flex items-center gap-1 px-3 py-2 text-xs font-semibold bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 border border-emerald-700/60 rounded-lg transition shadow-sm"
                >
                  <span>➕</span> <span className="hidden sm:inline">New Product</span>
                </button>
              )}
              <button
                onClick={() => setShareModalOpen(true)}
                className="flex items-center gap-1 px-3 py-2 text-xs font-semibold bg-blue-900/60 hover:bg-blue-800 text-blue-200 border border-blue-700/60 rounded-lg transition shadow-sm"
              >
                <span>📱</span> <span className="hidden sm:inline">Connect Phones</span>
              </button>
              <button
                onClick={() => { setUserRole(null); setLoginPassword(''); }}
                className="px-2.5 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg transition"
                title="Switch Role / Lock"
              >
                🔒
              </button>
            </div>
          </div>
        </div>

        {/* NAVIGATION TABS */}
        <div className="border-t border-slate-800/80 bg-slate-950/60 overflow-x-auto scrollbar-none">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex space-x-1 sm:space-x-2 py-2">
            {[
              { id: 'inventory', label: '📦 Fragrance-Wise Stock', badge: `${inventoryStats.totalProducts} SKUs • ${inventoryStats.totalVariantsCount} Fragrances` },
              { id: 'calculator', label: '🧪 Batch Dilution Engine', badge: 'Interactive Ratios' },
              { id: 'ledger', label: '📋 Cloud Stock Ledger', badge: transactions.length },
              { id: 'catalog', label: '📖 Master Catalog & Fragrances', badge: null }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={"whitespace-nowrap px-3.5 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all flex items-center gap-2 " + (activeTab === tab.id ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/70')}
              >
                {tab.label}
                {tab.badge && (
                  <span className={"text-[10px] px-1.5 py-0.5 rounded-full " + (activeTab === tab.id ? 'bg-blue-800 text-blue-100' : 'bg-slate-800 text-slate-300')}>
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* SYNC & ADMIN BAR */}
      <div className="bg-slate-950/70 border-b border-slate-800/80 py-2 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between text-xs gap-2">
          <div className="flex items-center gap-2 text-slate-300">
            <span className={"w-2 h-2 rounded-full animate-pulse " + (isCloudConnected ? 'bg-emerald-400' : 'bg-amber-400')}></span>
            <span>{syncStatus}</span>
          </div>
          <div className="flex items-center gap-3">
            {userRole === 'ADMIN' && (
              <button
                onClick={() => setConfirmResetModal(true)}
                className="text-[11px] text-rose-400 hover:text-rose-300 underline font-medium"
              >
                Reset All Stock to 0 kg
              </button>
            )}
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* KPI SUMMARY CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <div className="bg-slate-800/80 border border-slate-700/70 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-1">
              <span>Total Concentrates Stock</span>
              <span className="text-blue-400 text-lg">⚖️</span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-white">
              {inventoryStats.totalStockKg.toLocaleString()} <span className="text-xs font-normal text-slate-400">kg</span>
            </div>
            <div className="mt-1 text-[11px] text-cyan-400 font-medium">
              Across {inventoryStats.totalVariantsCount} Fragrances
            </div>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/70 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-1">
              <span>Diluted Finished Yield</span>
              <span className="text-cyan-400 text-lg">💧</span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-cyan-300">
              {inventoryStats.totalPotentialDilutedLitres.toLocaleString()} <span className="text-xs font-normal text-cyan-500">Litres</span>
            </div>
            <div className="mt-1 text-[11px] text-slate-400">
              Ready product output potential
            </div>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/70 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-1">
              <span>Stock Valuation (Tier 25kg)</span>
              <span className="text-emerald-400 text-lg">Rs.</span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-emerald-400">
              {userRole === 'ADMIN' ? `Rs.${inventoryStats.totalStockValuation.toLocaleString('en-IN')}` : '🔒 Admin Only'}
            </div>
            <div className="mt-1 text-[11px] text-slate-400">
              GST 18% inclusive
            </div>
          </div>

          <div 
            onClick={() => setShowLowStockOnly(prev => !prev)}
            className={"cursor-pointer border rounded-2xl p-4 shadow-sm transition " + (showLowStockOnly ? 'bg-rose-950/60 border-rose-500' : 'bg-slate-800/80 border-slate-700/70 hover:border-amber-500/50')}
          >
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-1">
              <span>Low / Empty Stock Alerts</span>
              <span className="text-rose-400 text-lg animate-bounce">🚨</span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-rose-400">
              {inventoryStats.lowStockCount} <span className="text-xs font-normal text-slate-400">/ {inventoryStats.totalProducts} SKUs</span>
            </div>
            <div className="mt-1 text-[11px] text-amber-300 font-medium">
              {showLowStockOnly ? "Showing Low Stock Only (Click to reset)" : "Click to filter low stock items"}
            </div>
          </div>
        </div>

        {/* TAB 1: FRAGRANCE-WISE LIVE INVENTORY */}
        {activeTab === 'inventory' && (
          <div className="space-y-5">
            <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
              <div className="relative flex-1">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 text-sm">
                  🔍
                </span>
                <input
                  type="text"
                  placeholder="Search product or fragrance (e.g. Mogra, Dettol, Green Apple, Seven Wonder)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 md:pb-0">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={"text-xs px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition " + (selectedCategory === cat ? 'bg-blue-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800')}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts.map((p) => {
                const totalStockKg = Number(p.stockKg) || 0;
                const minThresh = Number(p.minThresholdKg) || 20;
                const isLowStock = totalStockKg < minThresh;

                // Determine currently selected fragrance variant on this card
                const activeVarId = selectedVariantsMap[p.id] || (p.variants && p.variants[0] ? p.variants[0].id : 'STD');
                const activeVariant = (p.variants || []).find(v => v.id === activeVarId) || p.variants[0];
                const activeVariantStock = activeVariant ? (activeVariant.stockKg || 0) : 0;

                return (
                  <div
                    key={p.id}
                    className={"bg-slate-800/90 rounded-2xl border transition-all duration-200 flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-xl " + (isLowStock ? 'border-rose-500/60 ring-1 ring-rose-500/20' : 'border-blue-500/40 ring-1 ring-blue-500/20')}
                  >
                    <div className="p-4 sm:p-5">
                      {/* TOP BADGES */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className="w-3 h-3 rounded-full ring-2 ring-slate-900 shadow-sm"
                            style={{ backgroundColor: p.colorTheme }}
                          />
                          <span className="text-[11px] font-mono font-bold text-slate-400 bg-slate-900/90 px-2 py-0.5 rounded border border-slate-700">
                            {p.id}
                          </span>
                          {isLowStock && (
                            <span className="text-[10px] font-bold text-rose-200 bg-rose-950/90 px-2 py-0.5 rounded border border-rose-700 animate-pulse">
                              ⚠️ Low (&lt;{minThresh}kg)
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1">
                          {userRole === 'ADMIN' && (
                            <button
                              onClick={() => handleOpenEditPrice(p)}
                              className="text-[10px] px-2 py-0.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded font-medium transition"
                              title="Edit rates & threshold"
                            >
                              ✏️ Rates
                            </button>
                          )}
                        </div>
                      </div>

                      <h3 className="text-base font-bold text-white tracking-tight mb-0.5">
                        {p.name}
                      </h3>
                      <p className="text-xs text-slate-400 mb-3">
                        Ratio: <span className="font-semibold text-slate-200">{p.ratioLabel}</span> • Total SKU Stock: <span className="text-cyan-400 font-bold">{totalStockKg} kg</span>
                      </p>

                      {/* FRAGRANCE VARIANT PILLS SELECTOR */}
                      <div className="mb-3">
                        <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1.5">
                          <span className="font-semibold uppercase tracking-wider">Select Fragrance ({p.variants.length}):</span>
                          <button
                            onClick={() => setAddVariantModal({ open: true, product: p })}
                            className="text-cyan-400 hover:text-cyan-300 font-bold"
                          >
                            + Add Fragrance
                          </button>
                        </div>

                        <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                          {p.variants.map(v => {
                            const isSelected = v.id === activeVariant.id;
                            const isAdditional = v.type && v.type.includes('25kg');
                            return (
                              <button
                                key={v.id}
                                onClick={() => setSelectedVariantsMap(prev => ({ ...prev, [p.id]: v.id }))}
                                className={"text-[11px] px-2.5 py-1 rounded-lg border font-medium transition flex items-center gap-1.5 " + (isSelected ? 'bg-blue-600 text-white border-blue-400 shadow-sm' : 'bg-slate-900/90 text-slate-300 border-slate-700 hover:border-slate-500')}
                              >
                                <span>{v.name}</span>
                                <span className={"font-mono text-[10px] px-1 rounded " + (isSelected ? 'bg-blue-800 text-blue-100' : v.stockKg > 0 ? 'bg-emerald-950 text-emerald-300' : 'bg-slate-800 text-slate-500')}>
                                  {v.stockKg}kg
                                </span>
                                {isAdditional && (
                                  <span className="text-[9px] text-amber-300" title="Additional Fragrance: Min 25kg Order">★</span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* ACTIVE FRAGRANCE STOCK BOX */}
                      <div className="bg-slate-900/95 p-3 rounded-xl border border-slate-800 mb-3">
                        <div className="flex items-center justify-between mb-1">
                          <div>
                            <div className="text-[11px] text-slate-400">
                              Selected: <strong className="text-white">{activeVariant.name}</strong>
                            </div>
                            {activeVariant.type && activeVariant.type.includes('25kg') && (
                              <span className="text-[9px] text-amber-300 bg-amber-950/70 px-1.5 py-0.5 rounded border border-amber-800/50 inline-block mt-0.5">
                                ★ Additional Fragrance (Min 25kg Order)
                              </span>
                            )}
                          </div>
                          <div className="text-right">
                            <span className="text-lg font-black text-white font-mono">
                              {activeVariantStock} <span className="text-xs font-normal text-slate-400">kg</span>
                            </span>
                          </div>
                        </div>

                        {/* QUICK INWARD & REORDER */}
                        <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px]">
                          <div className="flex gap-1">
                            {[5, 25, 50].map(amt => (
                              <button
                                key={amt}
                                onClick={() => handleQuickAdd(p, activeVariant, amt)}
                                className="px-2 py-0.5 bg-slate-800 hover:bg-emerald-900/60 hover:text-emerald-200 text-slate-300 rounded border border-slate-700 text-[10px] font-mono transition"
                              >
                                +{amt}kg
                              </button>
                            ))}
                          </div>

                          {isLowStock && (
                            <button
                              onClick={() => sendLowStockWhatsApp(p, activeVariant)}
                              className="px-2 py-0.5 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-700/70 rounded text-[10px] font-semibold flex items-center gap-1"
                              title="Send WhatsApp reorder alert to factory"
                            >
                              <span>📲</span> Reorder
                            </button>
                          )}
                        </div>
                      </div>

                      {/* PRICING SLABS */}
                      <div 
                        onClick={() => userRole === 'ADMIN' && handleOpenEditPrice(p)}
                        className={"bg-slate-950/40 rounded-xl p-2 border border-slate-800/70 text-xs transition " + (userRole === 'ADMIN' ? 'hover:bg-slate-950/80 cursor-pointer' : '')}
                      >
                        <div className="grid grid-cols-3 gap-1 text-center font-mono">
                          <div className="bg-slate-900/90 py-1 rounded border border-slate-800">
                            <div className="text-[9px] text-slate-400">5 kg</div>
                            <div className="font-bold text-white">Rs.{p.pricing.tier5}</div>
                          </div>
                          <div className="bg-slate-900/90 py-1 rounded border border-slate-800">
                            <div className="text-[9px] text-slate-400">25 kg</div>
                            <div className="font-bold text-blue-300">Rs.{p.pricing.tier25}</div>
                          </div>
                          <div className="bg-slate-900/90 py-1 rounded border border-slate-800">
                            <div className="text-[9px] text-slate-400">50 kg</div>
                            <div className="font-bold text-emerald-400">Rs.{p.pricing.tier50}</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* ACTION BUTTONS */}
                    <div className="bg-slate-900/80 p-3 border-t border-slate-700/60 grid grid-cols-3 gap-2">
                      <button
                        onClick={() => {
                          setQuickStockModal({ open: true, product: p, variantId: activeVariant.id, type: 'INWARD' });
                          setModalVariantId(activeVariant.id);
                          setModalPriceTier('tier25');
                        }}
                        className="py-1.5 px-2 bg-emerald-900/50 hover:bg-emerald-800 text-emerald-200 border border-emerald-700/60 rounded-lg text-xs font-medium transition flex items-center justify-center gap-1"
                      >
                        <span>➕</span> Inward
                      </button>

                      <button
                        onClick={() => {
                          setQuickStockModal({ open: true, product: p, variantId: activeVariant.id, type: 'DISPATCH' });
                          setModalVariantId(activeVariant.id);
                          setModalPriceTier('tier5');
                        }}
                        className="py-1.5 px-2 bg-blue-900/50 hover:bg-blue-800 text-blue-200 border border-blue-700/60 rounded-lg text-xs font-medium transition flex items-center justify-center gap-1"
                      >
                        <span>📤</span> Dispatch
                      </button>

                      <button
                        onClick={() => {
                          setCalcProductId(p.id);
                          setCalcVariantId(activeVariant.id);
                          setActiveTab('calculator');
                        }}
                        className="py-1.5 px-2 bg-indigo-900/50 hover:bg-indigo-800 text-indigo-200 border border-indigo-700/60 rounded-lg text-xs font-medium transition flex items-center justify-center gap-1"
                      >
                        <span>🧪</span> Dilute
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: BATCH DILUTION ENGINE WITH RATIO SLIDER & WHATSAPP QUOTE */}
        {activeTab === 'calculator' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 bg-slate-800/90 rounded-2xl p-5 sm:p-6 border border-slate-700 shadow-md">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-700">
                <span className="text-2xl">🧪</span>
                <div>
                  <h2 className="text-lg font-bold text-white">Batch Mixing Engine</h2>
                  <p className="text-xs text-slate-400">Select product, fragrance & custom thickness ratio</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    1. Select Base Product
                  </label>
                  <select
                    value={calcProductId}
                    onChange={(e) => setCalcProductId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white font-medium focus:outline-none focus:border-blue-500"
                  >
                    {products.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} (Ratio: {p.ratioLabel}) — Total: {p.stockKg || 0}kg
                      </option>
                    ))}
                  </select>
                </div>

                {/* FRAGRANCE VARIANT DROPDOWN */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    2. Select Fragrance / Variant
                  </label>
                  <select
                    value={calcVariantId}
                    onChange={(e) => setCalcVariantId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-cyan-300 font-semibold focus:outline-none focus:border-blue-500"
                  >
                    {selectedCalcProduct.variants.map(v => (
                      <option key={v.id} value={v.id}>
                        {v.name} ({v.type}) — Live Stock: {v.stockKg} kg
                      </option>
                    ))}
                  </select>
                </div>

                {/* INTERACTIVE DILUTION RATIO SLIDER (WHEN RANGE EXISTS) */}
                {selectedCalcProduct.minRatio !== selectedCalcProduct.maxRatio && (
                  <div className="bg-slate-900/90 p-3.5 rounded-xl border border-cyan-800/50 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-cyan-300">Quality / Dilution Slider:</span>
                      <span className="font-mono font-black text-white bg-blue-600 px-2 py-0.5 rounded">
                        1 : {calcCustomRatio}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={selectedCalcProduct.minRatio}
                      max={selectedCalcProduct.maxRatio}
                      step="1"
                      value={calcCustomRatio}
                      onChange={(e) => setCalcCustomRatio(Number(e.target.value))}
                      className="w-full accent-cyan-400 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                      <span>Thick / Premium (1:{selectedCalcProduct.minRatio})</span>
                      <span>Economy / High Yield (1:{selectedCalcProduct.maxRatio})</span>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Calculation Mode
                  </label>
                  <div className="grid grid-cols-2 gap-2 bg-slate-900 p-1 rounded-xl border border-slate-700">
                    <button
                      type="button"
                      onClick={() => setCalcInputType("CONCENTRATE")}
                      className={"py-2 text-xs font-bold rounded-lg transition " + (calcInputType === "CONCENTRATE" ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white')}
                    >
                      From Concentrate (kg)
                    </button>
                    <button
                      type="button"
                      onClick={() => setCalcInputType("DESIRED_OUTPUT")}
                      className={"py-2 text-xs font-bold rounded-lg transition " + (calcInputType === "DESIRED_OUTPUT" ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white')}
                    >
                      Target Output (Litres)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex justify-between">
                    <span>
                      {calcInputType === "CONCENTRATE" ? "Concentrate Amount (kg)" : "Desired Finished Output (Litres)"}
                    </span>
                    <span className="text-slate-400 text-[11px]">
                      {selectedCalcVariant.name} Stock: <span className="text-cyan-400 font-bold">{selectedCalcVariant.stockKg || 0} kg</span>
                    </span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={calcAmount}
                      onChange={(e) => setCalcAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-lg font-bold text-white focus:outline-none focus:border-blue-500 font-mono"
                    />
                    <span className="absolute inset-y-0 right-0 pr-4 flex items-center text-xs font-bold text-slate-400">
                      {calcInputType === "CONCENTRATE" ? "KG" : "LITRES"}
                    </span>
                  </div>

                  <div className="flex gap-2 mt-2">
                    {[1, 5, 25, 50, 100].map(val => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setCalcAmount(val)}
                        className="text-xs px-2.5 py-1 bg-slate-900 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 font-mono"
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Price Tier Applied
                  </label>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    {[
                      { id: 'tier5', label: '5kg Rate', price: selectedCalcProduct.pricing.tier5 },
                      { id: 'tier25', label: '25kg Rate', price: selectedCalcProduct.pricing.tier25 },
                      { id: 'tier50', label: '50kg Rate', price: selectedCalcProduct.pricing.tier50 }
                    ].map(tier => (
                      <button
                        key={tier.id}
                        type="button"
                        onClick={() => setCalcCostTier(tier.id)}
                        className={"p-2 rounded-xl border text-center font-mono transition " + (calcCostTier === tier.id ? 'bg-blue-900/60 border-blue-500 text-white font-bold' : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700')}
                      >
                        <div className="text-[10px] text-slate-400">{tier.label}</div>
                        <div className="font-bold text-slate-200">Rs.{tier.price}/kg</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 space-y-4">
              {formulationResult && (
                <div className="bg-slate-800/90 rounded-2xl p-5 sm:p-6 border border-slate-700 shadow-lg space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-700">
                    <div>
                      <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wide">
                        Batch Recipe & Output • Ratio 1:{calcCustomRatio}
                      </span>
                      <h3 className="text-xl font-black text-white">
                        {selectedCalcProduct.name} <span className="text-cyan-300">({selectedCalcVariant.name})</span>
                      </h3>
                    </div>
                    <div className="text-left sm:text-right">
                      <div className="text-2xl font-black text-emerald-400 font-mono">
                        {formulationResult.finishedLitres} <span className="text-sm font-normal text-emerald-300">Litres</span>
                      </div>
                      <div className="text-xs text-slate-400">Total Ready Output Yield</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-700/80">
                      <div className="text-xs text-slate-400 mb-1 flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                        <span>1. Raw Concentrate ({selectedCalcVariant.name})</span>
                      </div>
                      <div className="text-xl font-bold text-white font-mono">
                        {formulationResult.concentrateKg} <span className="text-xs font-normal text-slate-400">kg</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1">
                        Available in {selectedCalcVariant.name}: {formulationResult.variantStock} kg
                      </div>
                    </div>

                    <div className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-700/80">
                      <div className="text-xs text-slate-400 mb-1 flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
                        <span>2. Water Quantity Required</span>
                      </div>
                      <div className="text-xl font-bold text-cyan-300 font-mono">
                        {formulationResult.waterKg} <span className="text-xs font-normal text-cyan-500">kg / Litres</span>
                      </div>
                      <div className="text-[11px] text-cyan-400 font-medium mt-1">
                        Water Type: {formulationResult.waterType}
                      </div>
                    </div>

                    {parseFloat(formulationResult.saltGrams) > 0 && (
                      <div className="bg-slate-900/90 p-3.5 rounded-xl border border-amber-900/40">
                        <div className="text-xs text-slate-400 mb-1 flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                          <span>3. Industrial Salt (Namak)</span>
                        </div>
                        <div className="text-xl font-bold text-amber-300 font-mono">
                          {formulationResult.saltKg} <span className="text-xs font-normal text-amber-400">kg ({formulationResult.saltGrams}g)</span>
                        </div>
                        <div className="text-[11px] text-amber-400/90 mt-1">
                          ⚠️ Dissolve in water FIRST before adding concentrate
                        </div>
                      </div>
                    )}

                    {parseFloat(formulationResult.boosterGrams) > 0 && (
                      <div className="bg-slate-900/90 p-3.5 rounded-xl border border-teal-900/40">
                        <div className="text-xs text-slate-400 mb-1 flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-teal-400"></span>
                          <span>4. Power Booster</span>
                        </div>
                        <div className="text-xl font-bold text-teal-300 font-mono">
                          {formulationResult.boosterKg} <span className="text-xs font-normal text-teal-400">kg ({formulationResult.boosterGrams}g)</span>
                        </div>
                        <div className="text-[11px] text-teal-400 mt-1">
                          Boosts cleaning & grease removal power
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="bg-blue-950/40 border border-blue-800/60 rounded-xl p-4 text-xs space-y-2">
                    <div className="font-bold text-blue-200 flex items-center gap-1.5">
                      <span>📋</span> Step-by-Step Production Guide:
                    </div>
                    <p className="text-slate-300 leading-relaxed">
                      {formulationResult.instructions}
                    </p>
                    {formulationResult.restingHours > 0 && (
                      <div className="flex items-center gap-2 text-amber-300 bg-amber-950/40 px-3 py-1.5 rounded-lg border border-amber-800/40 font-medium">
                        <span>⏳</span>
                        <span>
                          <strong>Resting Period Required:</strong> Minimum {formulationResult.restingHours} hours rest for clarity & bubble clearance.
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div>
                      <div className="text-xs text-slate-400">Raw Concentrate Cost</div>
                      <div className="text-lg font-bold text-white font-mono">
                        Rs.{formulationResult.totalConcentrateCost.toLocaleString('en-IN')}{' '}
                        <span className="text-xs text-slate-400 font-normal">(@ Rs.{formulationResult.ratePerKg}/kg)</span>
                      </div>
                    </div>
                    <div className="text-center sm:text-right">
                      <div className="text-xs text-slate-400">Estimated Cost / Finished Litre</div>
                      <div className="text-2xl font-black text-emerald-400 font-mono">
                        Rs.{formulationResult.costPerFinishedLitre} <span className="text-xs text-slate-300">/ L</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      onClick={shareRecipeOnWhatsApp}
                      className="py-3 px-4 rounded-xl text-sm font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20 transition flex items-center justify-center gap-2"
                    >
                      <span>📲</span> Share Quote on WhatsApp
                    </button>

                    <button
                      onClick={handleLogDilutionBatch}
                      disabled={!formulationResult.availableInStock}
                      className={"py-3 px-4 rounded-xl text-sm font-bold shadow-lg transition flex items-center justify-center gap-2 " + (formulationResult.availableInStock ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-600/30' : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700')}
                    >
                      <span>⚡</span>
                      {formulationResult.availableInStock
                        ? `Deduct ${formulationResult.concentrateKg}kg (${selectedCalcVariant.name})`
                        : `Insufficient Stock (${formulationResult.variantStock}kg)`}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: CLOUD STOCK LEDGER WITH ADVANCED FILTERS & CHALLAN */}
        {activeTab === 'ledger' && (
          <div className="bg-slate-800/90 rounded-2xl p-5 border border-slate-700 shadow-md space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-700">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>📋</span> Cloud Stock Audit Ledger
                </h2>
                <p className="text-xs text-slate-400">Filter by date, product, or transaction type • Print GST Delivery Challans</p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setLedgerSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
                  className="px-3 py-2 text-xs font-semibold bg-blue-900/60 hover:bg-blue-800 text-blue-200 border border-blue-700/60 rounded-lg transition"
                >
                  🔄 {ledgerSortOrder === 'desc' ? 'Newest First' : 'Oldest First'}
                </button>

                {filteredTransactions.length > 0 && (
                  <button
                    onClick={() => {
                      const headers = "ID,Date,Type,Product,Fragrance,Qty,Unit,Reference,Party,Amount,Notes\n";
                      const rows = filteredTransactions.map(t => 
                        `"${t.id}","${t.date}","${t.type}","${t.productName}","${t.variantName || 'Standard'}","${t.qty}","${t.unit}","${t.refNumber || ''}","${t.party || ''}","${t.amount || 0}","${t.notes || ''}"`
                      ).join("\n");
                      const blob = new Blob([headers + rows], { type: 'text/csv' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = "Khushali_Ledger_" + Date.now() + ".csv";
                      a.click();
                      showToast("Filtered Ledger CSV downloaded!");
                    }}
                    className="px-3.5 py-2 text-xs font-semibold bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg border border-slate-600 transition"
                  >
                    📥 Export CSV
                  </button>
                )}
              </div>
            </div>

            {/* FILTER BAR */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-xs">
              <div>
                <label className="block text-[10px] text-slate-400 mb-1">Filter by Date Period</label>
                <select
                  value={ledgerDateFilter}
                  onChange={(e) => setLedgerDateFilter(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200"
                >
                  <option value="ALL">All Time</option>
                  <option value="TODAY">Today's Entries</option>
                  <option value="MONTH">This Month</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 mb-1">Filter by Transaction Type</label>
                <select
                  value={ledgerTypeFilter}
                  onChange={(e) => setLedgerTypeFilter(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200"
                >
                  <option value="ALL">All Types</option>
                  <option value="INWARD">INWARD (+ Stock)</option>
                  <option value="DISPATCH">DISPATCH (- Sales)</option>
                  <option value="PRODUCTION_DILUTION">PRODUCTION DILUTION</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 mb-1">Filter by Product</label>
                <select
                  value={ledgerProductFilter}
                  onChange={(e) => setLedgerProductFilter(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200"
                >
                  <option value="ALL">All Products</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {filteredTransactions.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-sm">
                📦 No matching transactions found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-900/90 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-700">
                    <tr>
                      <th className="py-3 px-3">Date / ID</th>
                      <th className="py-3 px-3">Type</th>
                      <th className="py-3 px-3">Product & Fragrance</th>
                      <th className="py-3 px-3">Quantity</th>
                      <th className="py-3 px-3">Party / Notes</th>
                      <th className="py-3 px-3 text-right">Amount (Rs.)</th>
                      <th className="py-3 px-3 text-center">Slip / Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 font-mono">
                    {filteredTransactions.map((tx) => {
                      const isPlus = tx.type === 'INWARD';
                      const isDilution = tx.type === 'PRODUCTION_DILUTION';
                      const isReset = tx.type === 'STOCK_RESET' || tx.type === 'PRODUCT_RESET';

                      return (
                        <tr key={tx.id} className="hover:bg-slate-900/40 transition">
                          <td className="py-3 px-3">
                            <div className="font-bold text-slate-200">{tx.date}</div>
                            <div className="text-[10px] text-slate-500 font-normal">{tx.id}</div>
                          </td>
                          <td className="py-3 px-3">
                            <span className={"px-2 py-0.5 rounded text-[10px] font-bold " + (isPlus ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : isDilution ? 'bg-indigo-950 text-indigo-300 border border-indigo-800' : isReset ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-blue-950 text-blue-300 border border-blue-800')}>
                              {tx.type}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-sans">
                            <div className="font-semibold text-slate-200">{tx.productName}</div>
                            {tx.variantName && (
                              <span className="text-[10px] text-cyan-300 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-800/40">
                                {tx.variantName}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-3">
                            <span className={"font-bold " + (isPlus ? 'text-emerald-400' : isReset ? 'text-rose-400' : 'text-slate-300')}>
                              {isPlus ? '+' : isReset ? '' : '-'}{tx.qty} {tx.unit}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-sans">
                            <div className="text-slate-300">{tx.party || tx.refNumber}</div>
                            <div className="text-[10px] text-slate-500">{tx.notes}</div>
                          </td>
                          <td className="py-3 px-3 text-right font-bold text-slate-200">
                            {tx.amount ? "Rs." + tx.amount.toLocaleString('en-IN') : '-'}
                          </td>
                          <td className="py-3 px-3 text-center font-sans">
                            <div className="flex items-center justify-center gap-1.5">
                              {tx.type === 'DISPATCH' && (
                                <button
                                  onClick={() => setChallanModal({ open: true, tx })}
                                  className="px-2 py-1 bg-blue-950/80 hover:bg-blue-900 text-blue-300 border border-blue-700/60 rounded text-[11px] font-medium transition"
                                  title="View / Print Delivery Challan"
                                >
                                  🧾 Slip
                                </button>
                              )}
                              {userRole === 'ADMIN' && (
                                <button
                                  onClick={() => handleDeleteTransaction(tx)}
                                  className="px-2 py-1 bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-700/60 rounded text-[11px] font-medium transition"
                                  title="Delete entry and reverse stock"
                                >
                                  ❌
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: MASTER CATALOG & FRAGRANCE DIRECTORY */}
        {activeTab === 'catalog' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 rounded-2xl p-6 border border-blue-800/50 shadow-md">
              <div className="max-w-3xl">
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 bg-cyan-950 px-2.5 py-1 rounded border border-cyan-800 mb-2 inline-block">
                  Master Technical Manual & Fragrance Catalog
                </span>
                <h2 className="text-xl font-black text-white mt-1">
                  Khushali Chemicals Official Formula Directory
                </h2>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  All rates include 18% GST. Standard fragrances are ready-to-dispatch; Additional fragrances require a minimum 25 kg order.
                </p>
              </div>
            </div>

            <div className="bg-slate-800/90 rounded-2xl p-5 border border-slate-700 shadow-md">
              <h3 className="text-base font-bold text-white mb-4">Complete Price, Ratio & Fragrance Matrix</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-900/90 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-700">
                    <tr>
                      <th className="py-3 px-3"># SKU & Name</th>
                      <th className="py-3 px-3">Available Fragrances</th>
                      <th className="py-3 px-3">Ratio</th>
                      <th className="py-3 px-3">5kg</th>
                      <th className="py-3 px-3">25kg</th>
                      <th className="py-3 px-3">50kg</th>
                      <th className="py-3 px-3">Water / TDS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {products.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-900/40">
                        <td className="py-3 px-3 font-semibold text-white">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: p.colorTheme }} />
                            <div>
                              <div>{p.name}</div>
                              <div className="text-[10px] text-slate-500 font-mono">{p.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3 max-w-xs">
                          <div className="flex flex-wrap gap-1">
                            {p.variants.map(v => (
                              <span
                                key={v.id}
                                className={"text-[10px] px-1.5 py-0.5 rounded border " + (v.type.includes('25kg') ? 'bg-amber-950/60 text-amber-200 border-amber-800/60' : 'bg-slate-900 text-slate-300 border-slate-700')}
                              >
                                {v.name} ({v.stockKg}kg)
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-cyan-300">
                          {p.ratioLabel}
                        </td>
                        <td className="py-3 px-3 font-mono">Rs.{p.pricing.tier5}</td>
                        <td className="py-3 px-3 font-mono text-blue-300">Rs.{p.pricing.tier25}</td>
                        <td className="py-3 px-3 font-mono text-emerald-400 font-bold">Rs.{p.pricing.tier50}</td>
                        <td className="py-3 px-3 text-[11px] text-slate-300">
                          {p.waterType}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MODAL: ADD NEW FRAGRANCE VARIANT TO PRODUCT */}
      {addVariantModal.open && addVariantModal.product && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">
                🌸 Add New Fragrance Variant
              </h3>
              <button onClick={() => setAddVariantModal({ open: false, product: null })} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="text-xs text-slate-400">
              Adding fragrance under: <strong className="text-cyan-300">{addVariantModal.product.name}</strong>
            </div>

            <form onSubmit={handleAddNewVariant} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Fragrance Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pineapple, Oceanic, Musk"
                  value={newVariantName}
                  onChange={(e) => setNewVariantName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Order Category</label>
                <select
                  value={newVariantType}
                  onChange={(e) => setNewVariantType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                >
                  <option value="Standard">Standard (Ready Stock)</option>
                  <option value="Additional (Min 25kg)">Additional Fragrance (Min 25kg Order)</option>
                </select>
              </div>

              <div className="pt-2 flex gap-2">
                <button type="button" onClick={() => setAddVariantModal({ open: false, product: null })} className="flex-1 py-2.5 bg-slate-800 text-slate-300 rounded-xl font-semibold">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold">Add & Sync</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD NEW CUSTOM PRODUCT */}
      {addProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">➕ Add New Product Formula</h3>
              <button onClick={() => setAddProductModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateCustomProduct} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Product Name</label>
                <input type="text" required placeholder="e.g. Tap & Tile Cleaner Concentrate" value={newProdName} onChange={(e) => setNewProdName(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white" />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Category</label>
                  <input type="text" required value={newProdCategory} onChange={(e) => setNewProdCategory(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white" />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Dilution Factor (Water Litres per 1kg)</label>
                  <input type="number" required value={newProdRatioNum} onChange={(e) => { setNewProdRatioNum(e.target.value); setNewProdRatioLabel(`1:${e.target.value}`); }} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono" />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Fragrances (comma separated)</label>
                <input type="text" placeholder="e.g. Lemon, Rose, Lavender" value={newProdFragrances} onChange={(e) => setNewProdFragrances(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white" />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">5kg Rate (Rs.)</label>
                  <input type="number" required value={newProdTier5} onChange={(e) => setNewProdTier5(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono" />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">25kg Rate (Rs.)</label>
                  <input type="number" required value={newProdTier25} onChange={(e) => setNewProdTier25(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono" />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">50kg Rate (Rs.)</label>
                  <input type="number" required value={newProdTier50} onChange={(e) => setNewProdTier50(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono" />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Water / TDS Specification</label>
                <input type="text" value={newProdWaterType} onChange={(e) => setNewProdWaterType(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white" />
              </div>

              <div className="pt-2 flex gap-2">
                <button type="button" onClick={() => setAddProductModalOpen(false)} className="flex-1 py-2.5 bg-slate-800 text-slate-300 rounded-xl font-semibold">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold">Create Product</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: INWARD / DISPATCH WITH FRAGRANCE SELECTION & GST CHALLAN */}
      {quickStockModal.open && quickStockModal.product && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xl">{quickStockModal.type === 'INWARD' ? '📥' : '📤'}</span>
                <h3 className="text-base font-bold text-white">
                  {quickStockModal.type === 'INWARD' ? 'Cloud Restock Inward' : 'Record Cloud Dispatch'}
                </h3>
              </div>
              <button onClick={() => setQuickStockModal({ open: false, product: null, variantId: null, type: 'INWARD' })} className="text-slate-400 hover:text-white text-lg font-bold">✕</button>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
              <div className="text-sm font-bold text-white">{quickStockModal.product.name}</div>
              <div className="text-slate-400 mt-1">
                Total SKU Stock: <span className="font-mono text-cyan-400 font-bold">{quickStockModal.product.stockKg || 0} kg</span>
              </div>
            </div>

            <form onSubmit={handleStockUpdate} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Select Fragrance / Variant
                </label>
                <select
                  value={modalVariantId}
                  onChange={(e) => setModalVariantId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-cyan-300 font-bold"
                >
                  {quickStockModal.product.variants.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.type}) — Available: {v.stockKg} kg
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Quantity in kg</label>
                <input
                  type="number"
                  step="any"
                  min="0"
                  required
                  placeholder="e.g. 25"
                  value={modalQty}
                  onChange={(e) => setModalQty(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-base font-bold text-white focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Price Tier (18% GST Included)</label>
                <select
                  value={modalPriceTier}
                  onChange={(e) => setModalPriceTier(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                >
                  <option value="tier5">5kg Rate (Rs.{quickStockModal.product.pricing.tier5}/kg)</option>
                  <option value="tier25">25kg Rate (Rs.{quickStockModal.product.pricing.tier25}/kg)</option>
                  <option value="tier50">50kg Rate (Rs.{quickStockModal.product.pricing.tier50}/kg)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  {quickStockModal.type === 'INWARD' ? 'Batch / Supplier Ref #' : 'Party / Customer Name'}
                </label>
                <input
                  type="text"
                  placeholder={quickStockModal.type === 'INWARD' ? 'e.g. BATCH-NOV-102' : 'e.g. CleanCo Distributors'}
                  value={modalParty}
                  onChange={(e) => setModalParty(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              {quickStockModal.type === 'DISPATCH' && (
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Customer GSTIN (Optional for Slip)</label>
                  <input
                    type="text"
                    placeholder="e.g. 08AAAAA0000A1Z5"
                    value={modalPartyGst}
                    onChange={(e) => setModalPartyGst(e.target.value.toUpperCase())}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Notes (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Transport / LR number"
                  value={modalNotes}
                  onChange={(e) => setModalNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-3 flex gap-2">
                <button type="button" onClick={() => setQuickStockModal({ open: false, product: null, variantId: null, type: 'INWARD' })} className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold transition">Cancel</button>
                <button type="submit" className={"flex-1 py-2.5 rounded-xl font-bold text-white transition " + (quickStockModal.type === 'INWARD' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-blue-600 hover:bg-blue-500')}>
                  Confirm & Sync
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DELIVERY CHALLAN / GST ESTIMATE SLIP */}
      {challanModal.open && challanModal.tx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="bg-white text-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="border-b-2 border-slate-900 pb-3 flex justify-between items-start">
              <div>
                <h3 className="text-lg font-black tracking-tight text-slate-900">KHUSHALI CHEMICALS</h3>
                <p className="text-[11px] text-slate-600">Jaipur, Rajasthan • Mob: +91 8905878950</p>
                <p className="text-[11px] font-mono font-bold text-slate-800">GSTIN: 08PBDPS5444B1ZD</p>
              </div>
              <span className="bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded uppercase">
                Dispatch Slip
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs bg-slate-100 p-3 rounded-xl">
              <div>
                <span className="text-slate-500 block text-[10px]">Challan / Ref ID:</span>
                <strong className="font-mono">{challanModal.tx.id}</strong>
              </div>
              <div className="text-right">
                <span className="text-slate-500 block text-[10px]">Date & Time:</span>
                <strong>{challanModal.tx.date}</strong>
              </div>
              <div className="col-span-2 pt-1 border-t border-slate-200">
                <span className="text-slate-500 block text-[10px]">Billed / Dispatched To:</span>
                <strong className="text-sm">{challanModal.tx.party}</strong>
                {challanModal.tx.partyGst && (
                  <span className="block font-mono text-[11px] text-slate-700">GSTIN: {challanModal.tx.partyGst}</span>
                )}
              </div>
            </div>

            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-300 text-slate-500 text-[10px] uppercase">
                  <th className="py-1.5 text-left">Item & Fragrance</th>
                  <th className="py-1.5 text-right">Qty</th>
                  <th className="py-1.5 text-right">Total (Incl. GST)</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-200">
                  <td className="py-2">
                    <div className="font-bold text-slate-900">{challanModal.tx.productName}</div>
                    <div className="text-[11px] text-slate-600">Fragrance: {challanModal.tx.variantName || 'Standard'}</div>
                  </td>
                  <td className="py-2 text-right font-mono font-bold">{challanModal.tx.qty} kg</td>
                  <td className="py-2 text-right font-mono font-bold">Rs.{(challanModal.tx.amount || 0).toLocaleString('en-IN')}</td>
                </tr>
              </tbody>
            </table>

            {challanModal.tx.amount > 0 && (
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-[11px] space-y-1 font-mono">
                <div className="flex justify-between text-slate-600">
                  <span>Taxable Value (Base):</span>
                  <span>Rs.{(challanModal.tx.amount / 1.18).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>GST (18% Included):</span>
                  <span>Rs.{(challanModal.tx.amount - (challanModal.tx.amount / 1.18)).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-black text-slate-900 text-xs pt-1 border-t border-slate-300">
                  <span>Grand Total:</span>
                  <span>Rs.{challanModal.tx.amount.toLocaleString('en-IN')}</span>
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  const tx = challanModal.tx;
                  const msg = `*KHUSHALI CHEMICALS - DISPATCH CHALLAN* 🧾\n` +
                    `Challan ID: ${tx.id} | Date: ${tx.date}\n` +
                    `Party: *${tx.party}*\n` +
                    `Product: *${tx.productName}* (${tx.variantName || 'Standard'})\n` +
                    `Quantity: *${tx.qty} kg*\n` +
                    `Total Amount (Incl. 18% GST): *Rs.${(tx.amount || 0).toLocaleString('en-IN')}*\n` +
                    `GSTIN: 08PBDPS5444B1ZD | Jaipur`;
                  window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
                }}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold"
              >
                📲 Share on WhatsApp
              </button>
              <button
                onClick={() => window.print()}
                className="py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold"
              >
                🖨️ Print
              </button>
              <button
                onClick={() => setChallanModal({ open: false, tx: null })}
                className="py-2.5 px-3 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EDIT PRICE TIERS */}
      {editPriceModal.open && editPriceModal.product && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">✏️ Edit Price Tiers (18% GST Inc.)</h3>
              <button onClick={() => setEditPriceModal({ open: false, product: null })} className="text-slate-400 hover:text-white text-lg font-bold">✕</button>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
              <div className="text-sm font-bold text-cyan-300">{editPriceModal.product.name}</div>
              <div className="text-[11px] text-slate-500 font-mono mt-0.5">{editPriceModal.product.id}</div>
            </div>

            <form onSubmit={handleSavePriceEdits} className="space-y-3 text-xs">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">5kg Rate</label>
                  <input type="number" step="1" required value={editTier5} onChange={(e) => setEditTier5(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm font-bold text-white font-mono" />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">25kg Rate</label>
                  <input type="number" step="1" required value={editTier25} onChange={(e) => setEditTier25(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm font-bold text-blue-300 font-mono" />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">50kg Rate</label>
                  <input type="number" step="1" required value={editTier50} onChange={(e) => setEditTier50(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm font-bold text-emerald-400 font-mono" />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Low Stock Alert Threshold (kg)</label>
                <input type="number" step="5" required value={editMinThreshold} onChange={(e) => setEditMinThreshold(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white font-mono" />
              </div>

              <div className="pt-3 flex gap-2">
                <button type="button" onClick={() => setEditPriceModal({ open: false, product: null })} className="flex-1 py-2.5 bg-slate-800 text-slate-300 rounded-xl font-semibold">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold">Save & Sync</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: RESET CONFIRM */}
      {confirmResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="bg-slate-900 border border-rose-800/80 rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-base">
              <span>⚠️</span> Reset All Inventories to 0 kg?
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              This will reset all products & fragrance stocks to <strong className="text-white">0 kg</strong> across all connected devices.
            </p>
            <div className="flex gap-2 pt-2">
              <button onClick={() => setConfirmResetModal(false)} className="flex-1 py-2.5 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold">Cancel</button>
              <button onClick={executeResetAllStock} className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold">Yes, Reset to 0 kg</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: SHARE LINK */}
      {shareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">📱 Open on Multiple Phones</h3>
              <button onClick={() => setShareModalOpen(false)} className="text-slate-400 hover:text-white text-lg font-bold">✕</button>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs text-slate-300">
              <p><strong>Admin PIN:</strong> <code className="text-amber-300">7568</code> (Full Access)</p>
              <p><strong>Staff PIN:</strong> <code className="text-cyan-300">1234</code> (Stock Inward, Dispatch & Calculator only)</p>
            </div>

            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 flex items-center justify-between gap-2">
              <div className="text-xs text-slate-300 font-mono truncate">{window.location.href}</div>
              <button onClick={copyShareLink} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold whitespace-nowrap">Copy Link</button>
            </div>

            <div className="flex justify-end">
              <button onClick={() => setShareModalOpen(false)} className="py-2 px-5 bg-slate-800 text-white font-semibold rounded-xl text-xs">Close</button>
            </div>
          </div>
        </div>
      )}

      <footer className="bg-slate-950 border-t border-slate-800 py-4 px-4 text-center text-xs text-slate-500">
        <p>Khushali Chemicals • Jaipur, Rajasthan • Contact: +91 8905878950 • GST: 08PBDPS5444B1ZD</p>
      </footer>
    </div>
  );
}

