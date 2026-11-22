import React, { useState, useMemo, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  deleteDoc,
  onSnapshot 
} from 'firebase/firestore';

// --- 15 MASTER CHEMICAL PRODUCTS ---
const DEFAULT_PRODUCTS = [
  {
    id: "KHU-001",
    name: "White Phenyl Raw Material",
    category: "Disinfectant",
    stockKg: 0,
    minThresholdKg: 50,
    colorTheme: "#0284c7",
    colorName: "Milky White",
    pricing: { tier5: 275, tier25: 270, tier50: 265 },
    ratioLabel: "1:30",
    dilutionRatio: 30,
    waterType: "RO Water (TDS 150-250)",
    waterAmountPerKg: 30,
    additives: "Add water slowly while continuous stirring. Ready instantly.",
    restingHours: 0,
    saltReqGram: 0,
    boosterReqGram: 0,
    notes: "TDS 150-250 wala paani dheere-dheere daalein.",
    packSizes: [5, 25, 50],
    unit: "kg"
  },
  {
    id: "KHU-002",
    name: "Colour Phenyl (Rose)",
    category: "Disinfectant",
    stockKg: 0,
    minThresholdKg: 40,
    colorTheme: "#f43f5e",
    colorName: "Rose Pink",
    pricing: { tier5: 265, tier25: 260, tier50: 255 },
    ratioLabel: "1:30",
    dilutionRatio: 30,
    waterType: "RO Water (TDS 150-250)",
    waterAmountPerKg: 30,
    additives: "Mix slowly in TDS 150-250 water. Long lasting rose fragrance.",
    restingHours: 0,
    saltReqGram: 0,
    boosterReqGram: 0,
    notes: "TDS 150-250 water slow mix.",
    packSizes: [5, 25, 50],
    unit: "kg"
  },
  {
    id: "KHU-003",
    name: "Black Phenyl Raw Material",
    category: "Disinfectant",
    stockKg: 0,
    minThresholdKg: 35,
    colorTheme: "#1e293b",
    colorName: "Dark Brown/Black",
    pricing: { tier5: 175, tier25: 170, tier50: 165 },
    ratioLabel: "1:6 to 1:9",
    dilutionRatio: 8,
    waterType: "Normal / RO Water",
    waterAmountPerKg: 8,
    additives: "Mix thoroughly until rich dark homogeneous solution forms.",
    restingHours: 0,
    saltReqGram: 0,
    boosterReqGram: 0,
    notes: "Achhi tarah milayein aur use karein.",
    packSizes: [5, 25, 50],
    unit: "kg"
  },
  {
    id: "KHU-004",
    name: "Toilet Cleaner Raw Material",
    category: "Acidic & Bathroom",
    stockKg: 0,
    minThresholdKg: 30,
    colorTheme: "#2563eb",
    colorName: "Deep Ocean Blue",
    pricing: { tier5: 120, tier25: 110, tier50: 100 },
    ratioLabel: "1:7",
    dilutionRatio: 7,
    waterType: "RO Water (< 70 TDS)",
    waterAmountPerKg: 7,
    additives: "Use clean RO water (<70 TDS). Mix well for uniform thick blue viscosity.",
    restingHours: 0,
    saltReqGram: 0,
    boosterReqGram: 0,
    notes: "RO paani < 70 TDS achhi tarah mix karein.",
    packSizes: [5, 25, 50],
    unit: "kg"
  },
  {
    id: "KHU-005",
    name: "R1 - Bathroom Cleaner",
    category: "Acidic & Bathroom",
    stockKg: 0,
    minThresholdKg: 25,
    colorTheme: "#dc2626",
    colorName: "Vibrant Red",
    pricing: { tier5: 125, tier25: 120, tier50: 115 },
    ratioLabel: "1:4 to 1:8",
    dilutionRatio: 6,
    waterType: "RO Water (< 70 TDS)",
    waterAmountPerKg: 6,
    additives: "Mix thoroughly in low TDS water (<70 TDS). Instant red shine formula.",
    restingHours: 0,
    saltReqGram: 0,
    boosterReqGram: 0,
    notes: "RO paani < 70 TDS mix karein.",
    packSizes: [5, 15, 25, 50],
    unit: "kg"
  },
  {
    id: "KHU-006",
    name: "Floor Cleaner (Lemon Flavor)",
    category: "Surface Cleaners",
    stockKg: 0,
    minThresholdKg: 40,
    colorTheme: "#eab308",
    colorName: "Citrus Yellow",
    pricing: { tier5: 145, tier25: 140, tier50: 135 },
    ratioLabel: "1:40 to 1:60",
    dilutionRatio: 50,
    waterType: "RO Water (< 70 TDS)",
    waterAmountPerKg: 50,
    additives: "Fresh lemon fragrance. Add to RO water (<70 TDS). Let it rest 2-3 hours for clarity.",
    restingHours: 3,
    saltReqGram: 0,
    boosterReqGram: 0,
    notes: "Lemon aroma. Milakar 2-3 ghante chhod dein.",
    packSizes: [5, 25, 50],
    unit: "kg"
  },
  {
    id: "KHU-007",
    name: "Floor Cleaner (Rose Flavor)",
    category: "Surface Cleaners",
    stockKg: 0,
    minThresholdKg: 40,
    colorTheme: "#fb7185",
    colorName: "Rose Floral",
    pricing: { tier5: 145, tier25: 140, tier50: 135 },
    ratioLabel: "1:40 to 1:60",
    dilutionRatio: 50,
    waterType: "RO Water (< 70 TDS)",
    waterAmountPerKg: 50,
    additives: "Sweet rose fragrance. Add to RO water (<70 TDS). Let it rest 2-3 hours for clarity.",
    restingHours: 3,
    saltReqGram: 0,
    boosterReqGram: 0,
    notes: "Rose aroma. Milakar 2-3 ghante chhod dein.",
    packSizes: [5, 25, 50],
    unit: "kg"
  },
  {
    id: "KHU-008",
    name: "Hand Wash (Rose) Concentrate",
    category: "Personal Care",
    stockKg: 0,
    minThresholdKg: 30,
    colorTheme: "#ec4899",
    colorName: "Pearl Rose Pink",
    pricing: { tier5: 350, tier25: 345, tier50: 340 },
    ratioLabel: "1:9",
    dilutionRatio: 9.5,
    waterType: "RO Water",
    waterAmountPerKg: 8.5,
    additives: "Dissolve 500g Industrial Salt completely in 8.5kg water FIRST. Then add concentrate slowly. Rest 24h.",
    restingHours: 24,
    saltReqGram: 500,
    boosterReqGram: 0,
    notes: "Pehle paani me 500g namak gholein, fir concentrate daalein. 24h rest dein.",
    packSizes: [5, 25, 50],
    unit: "kg"
  },
  {
    id: "KHU-009",
    name: "Hand Wash (Dettol Type) Concentrate",
    category: "Personal Care",
    stockKg: 0,
    minThresholdKg: 30,
    colorTheme: "#10b981",
    colorName: "Antiseptic Pine Green",
    pricing: { tier5: 350, tier25: 345, tier50: 340 },
    ratioLabel: "1:9",
    dilutionRatio: 9.5,
    waterType: "RO Water",
    waterAmountPerKg: 8.5,
    additives: "Antiseptic Pine/Dettol formula. Dissolve 500g Industrial Salt in water first. Add concentrate. Rest 24h.",
    restingHours: 24,
    saltReqGram: 500,
    boosterReqGram: 0,
    notes: "Dettol fragrance & antiseptic protection. Pehle 500g namak gholein, 24h rest.",
    packSizes: [5, 25, 50],
    unit: "kg"
  },
  {
    id: "KHU-010",
    name: "Dishwash Raw Material",
    category: "Kitchen Care",
    stockKg: 0,
    minThresholdKg: 35,
    colorTheme: "#84cc16",
    colorName: "Lemon Lime Green",
    pricing: { tier5: 350, tier25: 345, tier50: 340 },
    ratioLabel: "1:9",
    dilutionRatio: 10,
    waterType: "RO Water",
    waterAmountPerKg: 8.5,
    additives: "Dissolve 500g Industrial Salt + 500g-1000g Power Booster in 8.5kg water. Mix concentrate. Rest 24h.",
    restingHours: 24,
    saltReqGram: 500,
    boosterReqGram: 750,
    notes: "Paani me 500g namak aur booster milayein. 1 din rest rakhein.",
    packSizes: [5, 25, 50],
    unit: "kg"
  },
  {
    id: "KHU-011",
    name: "Fabric Wash Concentrate",
    category: "Laundry Care",
    stockKg: 0,
    minThresholdKg: 25,
    colorTheme: "#06b6d4",
    colorName: "Oceanic Blue",
    pricing: { tier5: 350, tier25: 345, tier50: 340 },
    ratioLabel: "1:9",
    dilutionRatio: 9.5,
    waterType: "RO Water",
    waterAmountPerKg: 8.5,
    additives: "First dissolve 500g Industrial Salt in water completely. Mix concentrate. Leave 24h for bubble clearance.",
    restingHours: 24,
    saltReqGram: 500,
    boosterReqGram: 0,
    notes: "Pehle 500g namak gholein. Mix karke 1 din chhod dein.",
    packSizes: [5, 25, 50],
    unit: "kg"
  },
  {
    id: "KHU-012",
    name: "Glass Cleaner Raw Material",
    category: "Surface Cleaners",
    stockKg: 0,
    minThresholdKg: 20,
    colorTheme: "#0ea5e9",
    colorName: "Sky Blue",
    pricing: { tier5: 155, tier25: 150, tier50: 145 },
    ratioLabel: "1:80 to 1:100",
    dilutionRatio: 90,
    waterType: "0 TDS (Battery / DM Water STRICTLY)",
    waterAmountPerKg: 90,
    additives: "MANDATORY: Use ONLY 0 TDS Demineralized/Battery water to prevent streaks and watermarks on glass.",
    restingHours: 0,
    saltReqGram: 0,
    boosterReqGram: 0,
    notes: "0 TDS (Battery/DM Water) ka hi upyog karein taaki daag na padein.",
    packSizes: [5, 25, 50],
    unit: "kg"
  },
  {
    id: "KHU-013",
    name: "Car Wash Shampoo Raw Material",
    category: "Auto Care",
    stockKg: 0,
    minThresholdKg: 25,
    colorTheme: "#f59e0b",
    colorName: "Golden Amber",
    pricing: { tier5: 350, tier25: 345, tier50: 340 },
    ratioLabel: "1:9",
    dilutionRatio: 9.5,
    waterType: "RO Water",
    waterAmountPerKg: 8.5,
    additives: "Dissolve 500g Industrial Salt in 8.5kg water first. Mix concentrate for dense snow foam.",
    restingHours: 12,
    saltReqGram: 500,
    boosterReqGram: 0,
    notes: "Pehle paani me 500g namak milayein. High foam car shampoo ready.",
    packSizes: [5, 25, 50],
    unit: "kg"
  },
  {
    id: "KHU-014",
    name: "Room Freshener (Rose)",
    category: "Fragrance & Air",
    stockKg: 0,
    minThresholdKg: 10,
    colorTheme: "#f43f5e",
    colorName: "Classic Rose",
    pricing: { tier5: 1220, tier25: 1210, tier50: 1210 },
    ratioLabel: "1:20",
    dilutionRatio: 16,
    waterType: "RO Water (< 70 TDS)",
    waterAmountPerKg: 15,
    additives: "Rose Aroma formulation. Mix with 15kg clean RO water (<70 TDS). Test with mist spray nozzle.",
    restingHours: 0,
    saltReqGram: 0,
    boosterReqGram: 0,
    notes: "Rose Fragrance concentrate. RO paani < 70 TDS.",
    packSizes: [5, 10],
    unit: "kg"
  },
  {
    id: "KHU-015",
    name: "Room Freshener (Lavender)",
    category: "Fragrance & Air",
    stockKg: 0,
    minThresholdKg: 10,
    colorTheme: "#8b5cf6",
    colorName: "French Lavender",
    pricing: { tier5: 1220, tier25: 1210, tier50: 1210 },
    ratioLabel: "1:20",
    dilutionRatio: 16,
    waterType: "RO Water (< 70 TDS)",
    waterAmountPerKg: 15,
    additives: "Lavender Aroma formulation. Mix with 15kg clean RO water (<70 TDS). Long-lasting soothing mist.",
    restingHours: 0,
    saltReqGram: 0,
    boosterReqGram: 0,
    notes: "Lavender Fragrance concentrate. RO paani < 70 TDS.",
    packSizes: [5, 10],
    unit: "kg"
  }
];

// --- BOTTLES, CANS & CAPS STOCK (OCTOBER BOTTLE CATALOG - 18% GST INCLUDED) ---
const DEFAULT_BOTTLES = [
  { id: "BTL-001", name: "500ml Floor Cleaner Bottle", rate: 15, moq: 100, stockQty: 0, unit: "pcs", category: "Bottles & Cans" },
  { id: "BTL-002", name: "500ml Dishwash Bottle", rate: 12, moq: 100, stockQty: 0, unit: "pcs", category: "Bottles & Cans" },
  { id: "BTL-003", name: "500ml Handwash Bottle", rate: 18, moq: 100, stockQty: 0, unit: "pcs", category: "Bottles & Cans" },
  { id: "BTL-004", name: "500ml Toilet Cleaner Bottle (60 gm)", rate: 15, moq: 300, stockQty: 0, unit: "pcs", category: "Bottles & Cans" },
  { id: "BTL-005", name: "1000ml Toilet Cleaner Bottle (60 gm)", rate: 22, moq: 150, stockQty: 0, unit: "pcs", category: "Bottles & Cans" },
  { id: "BTL-006", name: "5L HDPE Can (170 gm)", rate: 48, moq: 12, stockQty: 0, unit: "pcs", category: "Bottles & Cans" },
  { id: "BTL-007", name: "500ml Glass Cleaner Bottle", rate: 22.5, moq: 100, stockQty: 0, unit: "pcs", category: "Bottles & Cans" },
  { id: "BTL-008", name: "500ml Red Bottle", rate: 12.8, moq: 100, stockQty: 0, unit: "pcs", category: "Bottles & Cans" },
  { id: "CAP-001", name: "Glass Cleaner Pump", rate: 10, moq: 100, stockQty: 0, unit: "pcs", category: "Pumps & Caps" },
  { id: "CAP-002", name: "Push Pull Cap", rate: 2.5, moq: 10, stockQty: 0, unit: "pcs", category: "Pumps & Caps" },
  { id: "CAP-003", name: "Handwash Pump", rate: 8, moq: 10, stockQty: 0, unit: "pcs", category: "Pumps & Caps" }
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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginPassword, setLoginPassword] = useState('');

  const [syncStatus, setSyncStatus] = useState('Connecting to live database...');
  const [isCloudConnected, setIsCloudConnected] = useState(false);
  const [cloudError, setCloudError] = useState(null);

  const [products, setProducts] = useState(DEFAULT_PRODUCTS);
  const [bottles, setBottles] = useState(DEFAULT_BOTTLES);
  const [transactions, setTransactions] = useState([]);
  const [activeTab, setActiveTab] = useState('inventory');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [notification, setNotification] = useState(null);

  const [ledgerSortOrder, setLedgerSortOrder] = useState('desc');
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [confirmResetModal, setConfirmResetModal] = useState(false);

  // Price & Threshold Edit Modal
  const [editPriceModal, setEditPriceModal] = useState({ open: false, product: null });
  const [editTier5, setEditTier5] = useState('');
  const [editTier25, setEditTier25] = useState('');
  const [editTier50, setEditTier50] = useState('');
  const [editMinThreshold, setEditMinThreshold] = useState('');

  // Bottle Price Edit Modal
  const [editBottleModal, setEditBottleModal] = useState({ open: false, bottle: null });
  const [editBottleRate, setEditBottleRate] = useState('');
  const [editBottleMoq, setEditBottleMoq] = useState('');

  // Quick Stock Modal (with live editable price while selecting price tier)
  const [quickStockModal, setQuickStockModal] = useState({ open: false, item: null, type: 'INWARD', isBottle: false });
  const [modalQty, setModalQty] = useState('');
  const [modalParty, setModalParty] = useState('');
  const [modalPriceTier, setModalPriceTier] = useState('tier25');
  const [modalCustomUnitPrice, setModalCustomUnitPrice] = useState('');
  const [modalNotes, setModalNotes] = useState('');

  // Dilution Calculator (with live editable rate while selecting price tier)
  const [calcProductId, setCalcProductId] = useState("KHU-004");
  const [calcInputType, setCalcInputType] = useState("CONCENTRATE");
  const [calcAmount, setCalcAmount] = useState(5);
  const [calcCostTier, setCalcCostTier] = useState("tier25");
  const [calcCustomRate, setCalcCustomRate] = useState("");

  const showToast = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3500);
  };

  useEffect(() => {
    signInAnonymously(auth)
      .then(() => {
        setIsCloudConnected(true);
        setSyncStatus('🟢 Cloud Live Sync Active');
      })
      .catch((err) => {
        console.error("Auth error:", err);
        setCloudError("Auth Error: " + err.message);
      });
  }, []);

  useEffect(() => {
    const productsRef = collection(db, 'products');
    const bottlesRef = collection(db, 'bottles');
    const txRef = collection(db, 'transactions');

    const unsubProducts = onSnapshot(productsRef, (snapshot) => {
      if (!snapshot.empty) {
        const cloudMap = {};
        snapshot.forEach(docSnap => {
          cloudMap[docSnap.id] = docSnap.data();
        });
        setProducts(prev => prev.map(def => {
          const remote = cloudMap[def.id];
          if (!remote) return def;
          return {
            ...def,
            ...remote,
            pricing: { ...def.pricing, ...(remote.pricing || {}) }
          };
        }));
      }
    }, (err) => console.error("Firestore product error:", err));

    const unsubBottles = onSnapshot(bottlesRef, (snapshot) => {
      if (!snapshot.empty) {
        const cloudMap = {};
        snapshot.forEach(docSnap => {
          cloudMap[docSnap.id] = docSnap.data();
        });
        setBottles(prev => prev.map(def => ({
          ...def,
          ...(cloudMap[def.id] || {})
        })));
      }
    }, (err) => console.error("Firestore bottle error:", err));

    const unsubTx = onSnapshot(txRef, (snapshot) => {
      const list = [];
      snapshot.forEach(docSnap => {
        list.push({ id: docSnap.id, ...docSnap.data() });
      });
      setTransactions(list);

      const calculatedStocks = {};
      const calculatedBottleStocks = {};

      list.forEach(tx => {
        const qty = Number(tx.qty) || 0;
        if (tx.itemCategory === 'BOTTLE' && tx.productId) {
          if (!calculatedBottleStocks[tx.productId]) calculatedBottleStocks[tx.productId] = 0;
          if (tx.type === 'INWARD') calculatedBottleStocks[tx.productId] += qty;
          else if (tx.type === 'DISPATCH') calculatedBottleStocks[tx.productId] -= qty;
          else if (tx.type === 'PRODUCT_RESET') calculatedBottleStocks[tx.productId] = 0;
        } else if (tx.productId && qty) {
          if (!calculatedStocks[tx.productId]) calculatedStocks[tx.productId] = 0;
          if (tx.type === 'INWARD' || tx.type === 'PRODUCTION_DILUTION') calculatedStocks[tx.productId] += qty;
          else if (tx.type === 'DISPATCH') calculatedStocks[tx.productId] -= qty;
          else if (tx.type === 'PRODUCT_RESET') calculatedStocks[tx.productId] = 0;
        }
      });

      setProducts(prev => prev.map(p => ({
        ...p,
        stockKg: calculatedStocks[p.id] !== undefined ? Math.max(0, calculatedStocks[p.id]) : 0
      })));

      setBottles(prev => prev.map(b => ({
        ...b,
        stockQty: calculatedBottleStocks[b.id] !== undefined ? Math.max(0, calculatedBottleStocks[b.id]) : 0
      })));
    }, (err) => console.error("Firestore tx error:", err));

    return () => {
      unsubProducts();
      unsubBottles();
      unsubTx();
    };
  }, []);

  const sortedTransactions = useMemo(() => {
    const list = [...transactions];
    list.sort((a, b) => {
      const timeA = a.timestamp || 0;
      const timeB = b.timestamp || 0;
      return ledgerSortOrder === 'desc' ? timeB - timeA : timeA - timeB;
    });
    return list;
  }, [transactions, ledgerSortOrder]);

  const saveProductToCloud = async (productId, updatedFields) => {
    try {
      await setDoc(doc(db, 'products', productId), updatedFields, { merge: true });
    } catch (err) {
      showToast("Cloud write failed: " + err.message, "error");
    }
  };

  const saveBottleToCloud = async (bottleId, updatedFields) => {
    try {
      await setDoc(doc(db, 'bottles', bottleId), updatedFields, { merge: true });
    } catch (err) {
      showToast("Bottle sync failed: " + err.message, "error");
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
    }
  };

  const handleDeleteTransaction = async (tx) => {
    if (!window.confirm(`Delete transaction [${tx.id}] and reverse stock?`)) return;
    try {
      await deleteDoc(doc(db, 'transactions', tx.id));
      showToast(`Transaction ${tx.id} deleted!`);
    } catch (err) {
      showToast("Failed to delete: " + err.message, "error");
    }
  };

  const inventoryStats = useMemo(() => {
    let totalStockKg = 0;
    let totalStockValuation = 0;
    let totalPotentialDilutedLitres = 0;
    let zeroStockCount = 0;

    products.forEach(p => {
      const stock = Number(p.stockKg) || 0;
      totalStockKg += stock;
      const baseVal = p.pricing ? (p.pricing.tier25 || p.pricing.tier5 || 0) : 0;
      totalStockValuation += stock * baseVal;
      totalPotentialDilutedLitres += stock * (p.dilutionRatio || 1);
      if (stock === 0) zeroStockCount++;
    });

    const totalBottleStockPcs = bottles.reduce((sum, b) => sum + (Number(b.stockQty) || 0), 0);
    const totalBottleValuation = bottles.reduce((sum, b) => sum + ((Number(b.stockQty) || 0) * (Number(b.rate) || 0)), 0);

    return {
      totalStockKg,
      totalStockValuation: totalStockValuation + totalBottleValuation,
      totalPotentialDilutedLitres,
      zeroStockCount,
      totalBottleStockPcs
    };
  }, [products, bottles]);

  const categories = useMemo(() => {
    const set = new Set(products.map(p => p.category));
    return ['ALL', ...Array.from(set)];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchCat = selectedCategory === 'ALL' || p.category === selectedCategory;
      const matchSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  const filteredBottles = useMemo(() => {
    return bottles.filter(b =>
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [bottles, searchQuery]);

  const selectedCalcProduct = useMemo(() => {
    return products.find(p => p.id === calcProductId) || products[0];
  }, [products, calcProductId]);

  // Sync calcCustomRate whenever product or tier changes
  useEffect(() => {
    if (selectedCalcProduct?.pricing) {
      setCalcCustomRate(String(selectedCalcProduct.pricing[calcCostTier] || selectedCalcProduct.pricing.tier5 || 0));
    }
  }, [selectedCalcProduct, calcCostTier]);

  const formulationResult = useMemo(() => {
    if (!selectedCalcProduct || calcAmount <= 0) return null;

    let concentrateKg = 0;
    let finishedLitres = 0;

    if (calcInputType === "CONCENTRATE") {
      concentrateKg = Number(calcAmount);
      finishedLitres = concentrateKg * selectedCalcProduct.dilutionRatio;
    } else {
      finishedLitres = Number(calcAmount);
      concentrateKg = finishedLitres / selectedCalcProduct.dilutionRatio;
    }

    const waterKg = concentrateKg * selectedCalcProduct.waterAmountPerKg;
    const saltGrams = concentrateKg * selectedCalcProduct.saltReqGram;
    const boosterGrams = concentrateKg * selectedCalcProduct.boosterReqGram;

    const defaultTierPrice = (selectedCalcProduct.pricing && selectedCalcProduct.pricing[calcCostTier]) || 0;
    const ratePerKg = calcCustomRate !== "" && !isNaN(parseFloat(calcCustomRate)) ? parseFloat(calcCustomRate) : defaultTierPrice;
    const totalConcentrateCost = concentrateKg * ratePerKg;
    const costPerFinishedLitre = finishedLitres > 0 ? (totalConcentrateCost / finishedLitres) : 0;

    return {
      concentrateKg: concentrateKg.toFixed(2),
      finishedLitres: finishedLitres.toFixed(1),
      waterKg: waterKg.toFixed(1),
      saltGrams: saltGrams.toFixed(0),
      saltKg: (saltGrams / 1000).toFixed(2),
      boosterGrams: boosterGrams.toFixed(0),
      boosterKg: (boosterGrams / 1000).toFixed(2),
      ratePerKg,
      totalConcentrateCost: Math.round(totalConcentrateCost),
      costPerFinishedLitre: costPerFinishedLitre.toFixed(2),
      restingHours: selectedCalcProduct.restingHours,
      waterType: selectedCalcProduct.waterType,
      instructions: selectedCalcProduct.additives,
      availableInStock: (selectedCalcProduct.stockKg || 0) >= concentrateKg
    };
  }, [selectedCalcProduct, calcAmount, calcInputType, calcCostTier, calcCustomRate]);

  const handleOpenEditPrice = (product) => {
    setEditPriceModal({ open: true, product });
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

    setProducts(prev => prev.map(p => p.id === product.id ? { ...p, pricing: newPricing, minThresholdKg: newMinThresh } : p));
    await saveProductToCloud(product.id, { pricing: newPricing, minThresholdKg: newMinThresh });
    showToast(`Updated rates for ${product.name}!`);
    setEditPriceModal({ open: false, product: null });
  };

  const handleOpenEditBottle = (bottle) => {
    setEditBottleModal({ open: true, bottle });
    setEditBottleRate(bottle.rate);
    setEditBottleMoq(bottle.moq);
  };

  const handleSaveBottleEdits = async (e) => {
    e.preventDefault();
    const bottle = editBottleModal.bottle;
    if (!bottle) return;

    const updatedRate = parseFloat(editBottleRate) || bottle.rate;
    const updatedMoq = parseInt(editBottleMoq, 10) || bottle.moq;

    setBottles(prev => prev.map(b => b.id === bottle.id ? { ...b, rate: updatedRate, moq: updatedMoq } : b));
    await saveBottleToCloud(bottle.id, { rate: updatedRate, moq: updatedMoq });
    showToast(`Updated ${bottle.name} rate to ₹${updatedRate}!`);
    setEditBottleModal({ open: false, bottle: null });
  };

  const openStockModalForItem = (item, type, isBottle = false) => {
    const defaultTier = type === 'INWARD' ? 'tier25' : 'tier5';
    const initialPrice = isBottle
      ? item.rate
      : (item.pricing[defaultTier] || item.pricing.tier25);

    setQuickStockModal({ open: true, item, type, isBottle });
    setModalPriceTier(defaultTier);
    setModalCustomUnitPrice(String(initialPrice));
    setModalQty('');
    setModalParty('');
    setModalNotes('');
  };

  const handleQuickAddChemical = async (product, addAmount) => {
    const newTx = {
      id: "TX-" + Date.now().toString().slice(-5),
      date: new Date().toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }),
      type: 'INWARD',
      itemCategory: 'CHEMICAL',
      productId: product.id,
      productName: product.name,
      qty: addAmount,
      unit: "kg",
      refNumber: "GRN-" + addAmount + "KG",
      party: 'Factory Line Inward',
      notes: "Quick batch addition +" + addAmount + "kg",
      amount: addAmount * (product.pricing.tier25 || product.pricing.tier5)
    };
    await saveTransactionToCloud(newTx);
    showToast(`Added +${addAmount}kg to ${product.name}!`);
  };

  const handleQuickAddBottle = async (bottle, addQty) => {
    const newTx = {
      id: "TX-" + Date.now().toString().slice(-5),
      date: new Date().toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }),
      type: 'INWARD',
      itemCategory: 'BOTTLE',
      productId: bottle.id,
      productName: bottle.name,
      qty: addQty,
      unit: "pcs",
      refNumber: "BTL-GRN-" + addQty,
      party: 'Packaging Stock Inward',
      notes: `Added +${addQty} ${bottle.name}`,
      amount: addQty * bottle.rate
    };
    await saveTransactionToCloud(newTx);
    showToast(`Added +${addQty} pcs to ${bottle.name}!`);
  };

  const handleStockUpdate = async (e) => {
    e.preventDefault();
    const qtyNum = parseFloat(modalQty);
    if (!qtyNum || qtyNum <= 0) {
      showToast("Please enter a valid quantity", "error");
      return;
    }

    const { item, type, isBottle } = quickStockModal;
    if (!item) return;

    const currentStock = isBottle ? (Number(item.stockQty) || 0) : (Number(item.stockKg) || 0);
    if (type === 'DISPATCH' && currentStock < qtyNum) {
      showToast(`Available stock is only ${currentStock} ${isBottle ? 'pcs' : 'kg'}!`, "error");
      return;
    }

    const unitPrice = modalCustomUnitPrice !== "" && !isNaN(parseFloat(modalCustomUnitPrice))
      ? parseFloat(modalCustomUnitPrice)
      : (isBottle ? item.rate : (item.pricing[modalPriceTier] || item.pricing.tier25));

    // Optionally update master catalog price if changed during selection
    if (isBottle && unitPrice !== item.rate) {
      setBottles(prev => prev.map(b => b.id === item.id ? { ...b, rate: unitPrice } : b));
      await saveBottleToCloud(item.id, { rate: unitPrice });
    } else if (!isBottle && item.pricing[modalPriceTier] !== unitPrice) {
      const updatedPricing = { ...item.pricing, [modalPriceTier]: unitPrice };
      setProducts(prev => prev.map(p => p.id === item.id ? { ...p, pricing: updatedPricing } : p));
      await saveProductToCloud(item.id, { pricing: updatedPricing });
    }

    const newTx = {
      id: "TX-" + Date.now().toString().slice(-5),
      date: new Date().toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }),
      type,
      itemCategory: isBottle ? 'BOTTLE' : 'CHEMICAL',
      productId: item.id,
      productName: item.name,
      qty: qtyNum,
      unit: isBottle ? "pcs" : (item.unit || "kg"),
      refNumber: type === 'INWARD' ? "GRN-" + Date.now().toString().slice(-4) : "DISP-" + Date.now().toString().slice(-4),
      party: modalParty || (type === 'INWARD' ? 'Stock Inward' : 'Customer Dispatch'),
      notes: modalNotes || `${type === 'INWARD' ? 'Added' : 'Dispatched'} @ Rs.${unitPrice}/${isBottle ? 'pc' : 'kg'}`,
      amount: Math.round(qtyNum * unitPrice)
    };

    await saveTransactionToCloud(newTx);
    showToast(`${type === 'INWARD' ? 'Added' : 'Dispatched'} ${qtyNum} ${isBottle ? 'pcs' : 'kg'} @ ₹${unitPrice}!`);
    setQuickStockModal({ open: false, item: null, type: 'INWARD', isBottle: false });
  };

  const handleLogDilutionBatch = async () => {
    if (!formulationResult) return;
    const reqConc = parseFloat(formulationResult.concentrateKg);
    const currentStock = Number(selectedCalcProduct.stockKg) || 0;

    if (currentStock < reqConc) {
      showToast(`Stock is ${currentStock}kg, batch needs ${reqConc}kg.`, "error");
      return;
    }

    const newTx = {
      id: "TX-" + Date.now().toString().slice(-5),
      date: new Date().toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }),
      type: 'PRODUCTION_DILUTION',
      itemCategory: 'CHEMICAL',
      productId: selectedCalcProduct.id,
      productName: selectedCalcProduct.name,
      qty: reqConc,
      unit: "kg",
      refNumber: "BATCH-" + Date.now().toString().slice(-4),
      notes: `Mixed ${reqConc}kg concentrate with ${formulationResult.waterKg}kg ${selectedCalcProduct.waterType}. Yield: ${formulationResult.finishedLitres}L.`
    };
    await saveTransactionToCloud(newTx);
    showToast(`Batch recorded: ${formulationResult.finishedLitres}L produced!`);
  };

  const executeResetAllStock = async () => {
    const resetTx = {
      id: "TX-RESET-ALL-" + Date.now().toString().slice(-4),
      date: new Date().toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }),
      type: 'PRODUCT_RESET',
      itemCategory: 'ALL',
      productId: 'ALL',
      productName: 'All Chemicals & Bottles Reset',
      qty: 0,
      unit: 'kg',
      refNumber: 'CLOUD-RESET',
      party: "Admin Device",
      notes: 'All chemical & bottle stocks reset to 0',
      amount: 0
    };
    await saveTransactionToCloud(resetTx);
    setConfirmResetModal(false);
    showToast("All stocks reset to 0!");
  };

  const copyShareLink = () => {
    const url = window.location.href;
    navigator.clipboard?.writeText(url);
    showToast("App URL copied!");
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-sans">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-8 shadow-2xl space-y-6 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-400"></div>
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-cyan-400 flex items-center justify-center font-black text-white text-2xl shadow-lg">
            KC
          </div>
          <div className="space-y-2">
            <span className="text-xs font-bold text-cyan-400 tracking-widest uppercase bg-cyan-950/80 px-3 py-1 rounded-full border border-cyan-800">
              Welcome to Khushali Chemicals
            </span>
            <h2 className="text-2xl font-black text-white tracking-tight">
              Inventory & Dilution Portal
            </h2>
          </div>
          <form onSubmit={(e) => {
            e.preventDefault();
            if (loginPassword === '7568') {
              setIsAuthenticated(true);
              showToast("Welcome! Login successful.");
            } else {
              showToast("Incorrect password! Try 7568", "error");
            }
          }} className="space-y-4 pt-2">
            <input
              type="password"
              placeholder="Enter Password to Access"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-4 py-3.5 text-center text-lg font-bold text-white tracking-widest focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-2xl shadow-lg transition text-sm"
            >
              🔐 Enter Portal
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      {notification && (
        <div className={"fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-2xl border flex items-center gap-3 " + (notification.type === 'error' ? 'bg-rose-950/90 border-rose-600 text-rose-200' : 'bg-emerald-950/90 border-emerald-600 text-emerald-200')}>
          <span className="text-xl">{notification.type === 'error' ? '⚠️' : '✅'}</span>
          <p className="text-sm font-medium">{notification.msg}</p>
        </div>
      )}

      {cloudError && (
        <div className="bg-rose-950 border-b border-rose-700 py-2.5 px-4 text-center text-xs text-rose-200 font-semibold">
          ⚠️ {cloudError}
        </div>
      )}

      <header className="bg-slate-950/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-cyan-400 flex items-center justify-center font-black text-white text-xl shadow-lg">
                KC
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white">
                    KHUSHALI <span className="text-cyan-400 font-extrabold">CHEMICALS</span>
                  </h1>
                  <span className={"px-2 py-0.5 text-[10px] font-bold rounded-md border " + (isCloudConnected ? 'bg-emerald-950 text-emerald-300 border-emerald-700' : 'bg-amber-950 text-amber-300 border-amber-700')}>
                    15 CHEMICALS + {bottles.length} BOTTLES
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  📍 Jaipur, Rajasthan • Contact: 8905878950 • GST: 08PBDPS5444B1ZD
                </p>
              </div>
            </div>

            <button
              onClick={() => setShareModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-blue-900/60 hover:bg-blue-800 text-blue-200 border border-blue-700/60 rounded-lg transition"
            >
              <span>📱</span> Connect Phones
            </button>
          </div>
        </div>

        {/* NAVIGATION TABS (WhatsApp Quote tab removed & moved to page.js) */}
        <div className="border-t border-slate-800/80 bg-slate-950/60 overflow-x-auto scrollbar-none">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex space-x-1 sm:space-x-2 py-2">
            {[
              { id: 'inventory', label: '📦 Live Stock (15 SKUs)', badge: products.filter(p => (p.stockKg || 0) > 0).length + " in stock" },
              { id: 'bottles', label: '🧴 Bottles, Cans & Caps Stock', badge: `${inventoryStats.totalBottleStockPcs} pcs` },
              { id: 'calculator', label: '🧪 Batch Dilution Engine', badge: '1:6 to 1:100' },
              { id: 'ledger', label: '📋 Cloud Stock Ledger', badge: transactions.length },
              { id: 'catalog', label: '📖 15 Formulas & Rates Matrix', badge: null }
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

      <div className="bg-slate-950/70 border-b border-slate-800/80 py-2 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between text-xs gap-2">
          <div className="flex items-center gap-2 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>{syncStatus}</span>
          </div>
          <button
            onClick={() => setConfirmResetModal(true)}
            className="text-[11px] text-rose-400 hover:text-rose-300 underline font-medium"
          >
            Reset All Stocks to 0
          </button>
        </div>
      </div>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* TOP KPI STATS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <div className="bg-slate-800/80 border border-slate-700/70 rounded-2xl p-4">
            <div className="text-slate-400 text-xs font-medium mb-1">Total Concentrates Stock</div>
            <div className="text-xl sm:text-2xl font-black text-white">
              {inventoryStats.totalStockKg.toLocaleString()} <span className="text-xs font-normal text-slate-400">kg</span>
            </div>
            <div className="mt-1 text-[11px] text-cyan-400">15 Chemical SKUs</div>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/70 rounded-2xl p-4">
            <div className="text-slate-400 text-xs font-medium mb-1">Bottles, Cans & Caps</div>
            <div className="text-xl sm:text-2xl font-black text-indigo-300">
              {inventoryStats.totalBottleStockPcs.toLocaleString()} <span className="text-xs font-normal text-indigo-400">pcs</span>
            </div>
            <div className="mt-1 text-[11px] text-slate-400">{bottles.length} Packaging Items</div>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/70 rounded-2xl p-4">
            <div className="text-slate-400 text-xs font-medium mb-1">Diluted Finished Yield</div>
            <div className="text-xl sm:text-2xl font-black text-cyan-300">
              {inventoryStats.totalPotentialDilutedLitres.toLocaleString()} <span className="text-xs font-normal text-cyan-500">Litres</span>
            </div>
            <div className="mt-1 text-[11px] text-slate-400">Ready output potential</div>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/70 rounded-2xl p-4">
            <div className="text-slate-400 text-xs font-medium mb-1">Total Stock Valuation</div>
            <div className="text-xl sm:text-2xl font-black text-emerald-400">
              Rs.{inventoryStats.totalStockValuation.toLocaleString('en-IN')}
            </div>
            <div className="mt-1 text-[11px] text-slate-400">GST 18% inclusive</div>
          </div>
        </div>

        {/* CHEMICAL INVENTORY TAB */}
        {activeTab === 'inventory' && (
          <div className="space-y-5">
            <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
              <input
                type="text"
                placeholder="Search 15 products by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-blue-500"
              />
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
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
                const stockValKg = Number(p.stockKg) || 0;
                return (
                  <div
                    key={p.id}
                    className={"bg-slate-800/90 rounded-2xl border flex flex-col justify-between overflow-hidden " + (stockValKg === 0 ? 'border-slate-700/60' : 'border-blue-500/40')}
                  >
                    <div className="p-4 sm:p-5">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: p.colorTheme }} />
                          <span className="text-[11px] font-mono font-bold text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-700">
                            {p.id}
                          </span>
                        </div>
                        <button
                          onClick={() => handleOpenEditPrice(p)}
                          className="text-[10px] px-2 py-0.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded font-medium"
                        >
                          ✏️ Edit Rates
                        </button>
                      </div>

                      <h3 className="text-base font-bold text-white mb-1">{p.name}</h3>
                      <p className="text-xs text-slate-400 mb-3">
                        Ratio: <span className="font-semibold text-slate-200">{p.ratioLabel}</span> • {p.waterType}
                      </p>

                      <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 mb-3">
                        <div className="flex items-baseline justify-between mb-2">
                          <span className="text-xs text-slate-400">Available Stock:</span>
                          <span className="text-lg font-black text-white font-mono">{stockValKg} kg</span>
                        </div>
                        <div className="flex justify-end gap-1">
                          {[5, 25, 50].map(amt => (
                            <button
                              key={amt}
                              onClick={() => handleQuickAddChemical(p, amt)}
                              className="px-2 py-0.5 bg-slate-800 hover:bg-emerald-900/60 text-slate-300 rounded border border-slate-700 text-[10px] font-mono"
                            >
                              +{amt}kg
                            </button>
                          ))}
                        </div>
                      </div>

                      <div
                        onClick={() => handleOpenEditPrice(p)}
                        className="bg-slate-950/40 hover:bg-slate-950/80 cursor-pointer rounded-xl p-2 border border-slate-800/70 text-xs"
                      >
                        <div className="text-[10px] text-slate-400 mb-1 flex justify-between">
                          <span>Rates (18% GST Inc.)</span>
                          <span className="text-cyan-400 text-[9px]">Click to edit</span>
                        </div>
                        <div className="grid grid-cols-3 gap-1 text-center font-mono">
                          <div className="bg-slate-900 py-1 rounded border border-slate-800">
                            <div className="text-[9px] text-slate-400">5 kg</div>
                            <div className="font-bold text-white">Rs.{p.pricing.tier5}</div>
                          </div>
                          <div className="bg-slate-900 py-1 rounded border border-slate-800">
                            <div className="text-[9px] text-slate-400">25 kg</div>
                            <div className="font-bold text-blue-300">Rs.{p.pricing.tier25}</div>
                          </div>
                          <div className="bg-slate-900 py-1 rounded border border-slate-800">
                            <div className="text-[9px] text-slate-400">50 kg</div>
                            <div className="font-bold text-emerald-400">Rs.{p.pricing.tier50}</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-900/80 p-3 border-t border-slate-700/60 grid grid-cols-3 gap-2">
                      <button
                        onClick={() => openStockModalForItem(p, 'INWARD', false)}
                        className="py-1.5 px-2 bg-emerald-900/50 hover:bg-emerald-800 text-emerald-200 border border-emerald-700/60 rounded-lg text-xs font-medium"
                      >
                        ➕ Inward
                      </button>
                      <button
                        onClick={() => openStockModalForItem(p, 'DISPATCH', false)}
                        className="py-1.5 px-2 bg-blue-900/50 hover:bg-blue-800 text-blue-200 border border-blue-700/60 rounded-lg text-xs font-medium"
                      >
                        📤 Dispatch
                      </button>
                      <button
                        onClick={() => {
                          setCalcProductId(p.id);
                          setActiveTab('calculator');
                        }}
                        className="py-1.5 px-2 bg-indigo-900/50 hover:bg-indigo-800 text-indigo-200 border border-indigo-700/60 rounded-lg text-xs font-medium"
                      >
                        🧪 Dilute
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* BOTTLES, CANS & CAPS STOCK TAB */}
        {activeTab === 'bottles' && (
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800">
              <div>
                <h2 className="text-base font-bold text-white">Bottles, Cans, Pumps & Caps Stock</h2>
                <p className="text-xs text-slate-400">October Bottle Catalog • Rates per piece (18% GST Included)</p>
              </div>
              <input
                type="text"
                placeholder="Search bottle, 5L can, pump, cap..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredBottles.map((b) => {
                const qty = Number(b.stockQty) || 0;
                return (
                  <div key={b.id} className="bg-slate-800/90 rounded-2xl border border-slate-700/80 flex flex-col justify-between overflow-hidden">
                    <div className="p-4 sm:p-5">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-mono font-bold text-indigo-300 bg-indigo-950/70 px-2 py-0.5 rounded border border-indigo-800">
                          {b.id} • MOQ {b.moq}
                        </span>
                        <button
                          onClick={() => handleOpenEditBottle(b)}
                          className="text-[10px] px-2 py-0.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded font-medium"
                        >
                          ✏️ Edit Rate
                        </button>
                      </div>

                      <h3 className="text-base font-bold text-white mb-1">{b.name}</h3>
                      <p className="text-xs text-emerald-400 font-mono font-bold mb-3">
                        Rate: Rs.{b.rate} / pc (18% GST Inc.) • Min Order: {b.moq} pcs
                      </p>

                      <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                        <div className="flex items-baseline justify-between mb-2">
                          <span className="text-xs text-slate-400">Live Bottle Stock:</span>
                          <span className="text-lg font-black text-white font-mono">{qty} <span className="text-xs text-slate-400">pcs</span></span>
                        </div>
                        <div className="flex justify-end gap-1">
                          {[50, 100, 300].map(addPcs => (
                            <button
                              key={addPcs}
                              onClick={() => handleQuickAddBottle(b, addPcs)}
                              className="px-2 py-0.5 bg-slate-800 hover:bg-emerald-900/60 text-slate-300 rounded border border-slate-700 text-[10px] font-mono"
                            >
                              +{addPcs}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-900/80 p-3 border-t border-slate-700/60 grid grid-cols-2 gap-2">
                      <button
                        onClick={() => openStockModalForItem(b, 'INWARD', true)}
                        className="py-1.5 px-3 bg-emerald-900/50 hover:bg-emerald-800 text-emerald-200 border border-emerald-700/60 rounded-lg text-xs font-medium"
                      >
                        ➕ Inward Pcs
                      </button>
                      <button
                        onClick={() => openStockModalForItem(b, 'DISPATCH', true)}
                        className="py-1.5 px-3 bg-blue-900/50 hover:bg-blue-800 text-blue-200 border border-blue-700/60 rounded-lg text-xs font-medium"
                      >
                        📤 Dispatch Pcs
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* BATCH DILUTION ENGINE WITH LIVE PRICE CHANGE WHILE SELECTING PRICE */}
        {activeTab === 'calculator' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 bg-slate-800/90 rounded-2xl p-5 sm:p-6 border border-slate-700 space-y-4">
              <h2 className="text-lg font-bold text-white pb-3 border-b border-slate-700">🧪 Batch Mixing Engine</h2>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Select Product Concentrate</label>
                <select
                  value={calcProductId}
                  onChange={(e) => setCalcProductId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white"
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Ratio: {p.ratioLabel}) — Stock: {p.stockKg || 0}kg
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2 bg-slate-900 p-1 rounded-xl border border-slate-700">
                <button
                  type="button"
                  onClick={() => setCalcInputType("CONCENTRATE")}
                  className={"py-2 text-xs font-bold rounded-lg " + (calcInputType === "CONCENTRATE" ? 'bg-blue-600 text-white' : 'text-slate-400')}
                >
                  From Concentrate (kg)
                </button>
                <button
                  type="button"
                  onClick={() => setCalcInputType("DESIRED_OUTPUT")}
                  className={"py-2 text-xs font-bold rounded-lg " + (calcInputType === "DESIRED_OUTPUT" ? 'bg-blue-600 text-white' : 'text-slate-400')}
                >
                  Target Output (Litres)
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {calcInputType === "CONCENTRATE" ? "Concentrate Amount (kg)" : "Desired Finished Output (Litres)"}
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={calcAmount}
                  onChange={(e) => setCalcAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-lg font-bold text-white font-mono"
                />
              </div>

              {/* SELECT PRICE TIER + INLINE EDIT RATE RIGHT WHILE SELECTING */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-300">
                  Price Tier & Editable Rate (Rs./kg)
                </label>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {[
                    { id: 'tier5', label: '5kg Tier', price: selectedCalcProduct.pricing.tier5 },
                    { id: 'tier25', label: '25kg Tier', price: selectedCalcProduct.pricing.tier25 },
                    { id: 'tier50', label: '50kg Tier', price: selectedCalcProduct.pricing.tier50 }
                  ].map(tier => (
                    <button
                      key={tier.id}
                      type="button"
                      onClick={() => {
                        setCalcCostTier(tier.id);
                        setCalcCustomRate(String(tier.price));
                      }}
                      className={"p-2 rounded-xl border text-center font-mono transition " + (calcCostTier === tier.id ? 'bg-blue-900/60 border-blue-500 text-white font-bold' : 'bg-slate-900 border-slate-800 text-slate-400')}
                    >
                      <div className="text-[10px]">{tier.label}</div>
                      <div>Rs.{tier.price}/kg</div>
                    </button>
                  ))}
                </div>
                <div className="flex items-center justify-between gap-2 bg-slate-950 p-2.5 rounded-xl border border-cyan-800/60">
                  <span className="text-xs text-cyan-300 font-semibold">Active Rate (Change if needed):</span>
                  <input
                    type="number"
                    step="any"
                    value={calcCustomRate}
                    onChange={(e) => setCalcCustomRate(e.target.value)}
                    className="w-28 bg-slate-900 border border-cyan-600 rounded-lg px-2.5 py-1 text-right text-sm font-bold text-emerald-400 font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="lg:col-span-7">
              {formulationResult && (
                <div className="bg-slate-800/90 rounded-2xl p-5 sm:p-6 border border-slate-700 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-700">
                    <div>
                      <span className="text-[11px] font-bold text-cyan-400 uppercase">Batch Recipe & Cost</span>
                      <h3 className="text-xl font-black text-white">{selectedCalcProduct.name}</h3>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-black text-emerald-400 font-mono">{formulationResult.finishedLitres} L</div>
                      <div className="text-xs text-slate-400">Ready Yield</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-700">
                      <div className="text-xs text-slate-400">Raw Concentrate</div>
                      <div className="text-xl font-bold text-white font-mono">{formulationResult.concentrateKg} kg</div>
                    </div>
                    <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-700">
                      <div className="text-xs text-slate-400">Water ({formulationResult.waterType})</div>
                      <div className="text-xl font-bold text-cyan-300 font-mono">{formulationResult.waterKg} kg</div>
                    </div>
                  </div>

                  <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="text-xs text-slate-400">Concentrate Cost (@ Rs.{formulationResult.ratePerKg}/kg)</div>
                      <div className="text-lg font-bold text-white font-mono">Rs.{formulationResult.totalConcentrateCost.toLocaleString('en-IN')}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-slate-400">Cost / Finished Litre</div>
                      <div className="text-2xl font-black text-emerald-400 font-mono">Rs.{formulationResult.costPerFinishedLitre} / L</div>
                    </div>
                  </div>

                  <button
                    onClick={handleLogDilutionBatch}
                    disabled={!formulationResult.availableInStock}
                    className={"w-full py-3 px-4 rounded-xl text-sm font-bold transition " + (formulationResult.availableInStock ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-slate-800 text-slate-500 cursor-not-allowed')}
                  >
                    {formulationResult.availableInStock
                      ? `⚡ Log Batch (${formulationResult.finishedLitres}L) & Deduct ${formulationResult.concentrateKg}kg`
                      : `Insufficient Stock (Have ${selectedCalcProduct.stockKg || 0}kg)`}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* LEDGER TAB */}
        {activeTab === 'ledger' && (
          <div className="bg-slate-800/90 rounded-2xl p-5 border border-slate-700 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700">
              <h2 className="text-lg font-bold text-white">📋 Cloud Stock Audit Ledger</h2>
              <button
                onClick={() => setLedgerSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
                className="px-3 py-1.5 text-xs font-semibold bg-blue-900/60 text-blue-200 border border-blue-700/60 rounded-lg"
              >
                🔄 {ledgerSortOrder === 'desc' ? 'Newest First' : 'Oldest First'}
              </button>
            </div>

            {sortedTransactions.length === 0 ? (
              <div className="py-10 text-center text-slate-500 text-sm">No transactions logged yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] border-b border-slate-700">
                    <tr>
                      <th className="py-3 px-3">Date / ID</th>
                      <th className="py-3 px-3">Type</th>
                      <th className="py-3 px-3">Item</th>
                      <th className="py-3 px-3">Qty</th>
                      <th className="py-3 px-3 text-right">Amount</th>
                      <th className="py-3 px-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 font-mono">
                    {sortedTransactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-900/40">
                        <td className="py-3 px-3">
                          <div className="text-slate-200">{tx.date}</div>
                          <div className="text-[10px] text-slate-500">{tx.id}</div>
                        </td>
                        <td className="py-3 px-3">{tx.type}</td>
                        <td className="py-3 px-3 font-sans text-white">{tx.productName}</td>
                        <td className="py-3 px-3 font-bold text-emerald-400">{tx.qty} {tx.unit}</td>
                        <td className="py-3 px-3 text-right">{tx.amount ? `Rs.${tx.amount.toLocaleString('en-IN')}` : '-'}</td>
                        <td className="py-3 px-3 text-center">
                          <button
                            onClick={() => handleDeleteTransaction(tx)}
                            className="px-2 py-1 bg-rose-950 text-rose-300 border border-rose-800 rounded text-[11px] font-sans"
                          >
                            ❌ Undo
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* CATALOG TAB */}
        {activeTab === 'catalog' && (
          <div className="bg-slate-800/90 rounded-2xl p-5 border border-slate-700 space-y-4">
            <h2 className="text-lg font-bold text-white">📖 15 Chemicals & Bottles Master Rates</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] border-b border-slate-700">
                  <tr>
                    <th className="py-3 px-3">Product</th>
                    <th className="py-3 px-3">Ratio</th>
                    <th className="py-3 px-3">5kg</th>
                    <th className="py-3 px-3">25kg</th>
                    <th className="py-3 px-3">50kg</th>
                    <th className="py-3 px-3 text-center">Edit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {products.map(p => (
                    <tr key={p.id}>
                      <td className="py-2.5 px-3 font-semibold text-white">{p.name}</td>
                      <td className="py-2.5 px-3 font-mono text-cyan-300">{p.ratioLabel}</td>
                      <td className="py-2.5 px-3 font-mono">Rs.{p.pricing.tier5}</td>
                      <td className="py-2.5 px-3 font-mono text-blue-300">Rs.{p.pricing.tier25}</td>
                      <td className="py-2.5 px-3 font-mono text-emerald-400">Rs.{p.pricing.tier50}</td>
                      <td className="py-2.5 px-3 text-center">
                        <button onClick={() => handleOpenEditPrice(p)} className="px-2 py-1 bg-slate-700 rounded text-[11px]">✏️ Edit</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* QUICK STOCK MODAL (WITH PRICE SELECTION + LIVE PRICE EDIT) */}
      {quickStockModal.open && quickStockModal.item && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">
                {quickStockModal.type === 'INWARD' ? '📥 Stock Inward' : '📤 Stock Dispatch'} — {quickStockModal.item.name}
              </h3>
              <button onClick={() => setQuickStockModal({ open: false, item: null, type: 'INWARD', isBottle: false })} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleStockUpdate} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Quantity ({quickStockModal.isBottle ? 'Pieces' : 'kg'}) *
                </label>
                <input
                  type="number"
                  step="any"
                  min="0"
                  required
                  placeholder={quickStockModal.isBottle ? "e.g. 100" : "e.g. 25"}
                  value={modalQty}
                  onChange={(e) => setModalQty(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-base font-bold text-white font-mono"
                />
              </div>

              {!quickStockModal.isBottle ? (
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Select Price Tier</label>
                  <select
                    value={modalPriceTier}
                    onChange={(e) => {
                      const tier = e.target.value;
                      setModalPriceTier(tier);
                      setModalCustomUnitPrice(String(quickStockModal.item.pricing[tier] || 0));
                    }}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="tier5">5kg Tier (Rs.{quickStockModal.item.pricing.tier5}/kg)</option>
                    <option value="tier25">25kg Tier (Rs.{quickStockModal.item.pricing.tier25}/kg)</option>
                    <option value="tier50">50kg Tier (Rs.{quickStockModal.item.pricing.tier50}/kg)</option>
                  </select>
                </div>
              ) : null}

              <div>
                <label className="block text-cyan-300 font-semibold mb-1">
                  Rate / Price per {quickStockModal.isBottle ? 'Piece' : 'kg'} (Change Price While Selecting)
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  value={modalCustomUnitPrice}
                  onChange={(e) => setModalCustomUnitPrice(e.target.value)}
                  className="w-full bg-slate-950 border border-cyan-600 rounded-xl px-3 py-2 text-sm font-bold text-emerald-400 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Party / Reference</label>
                <input
                  type="text"
                  value={modalParty}
                  onChange={(e) => setModalParty(e.target.value)}
                  placeholder="Customer / Batch ref"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Notes</label>
                <input
                  type="text"
                  value={modalNotes}
                  onChange={(e) => setModalNotes(e.target.value)}
                  placeholder="Optional remarks"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button type="button" onClick={() => setQuickStockModal({ open: false, item: null, type: 'INWARD', isBottle: false })} className="flex-1 py-2.5 bg-slate-800 rounded-xl font-semibold">
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold">
                  Confirm & Sync
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT CHEMICAL RATES MODAL */}
      {editPriceModal.open && editPriceModal.product && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">✏️ Edit Rates — {editPriceModal.product.name}</h3>
            <form onSubmit={handleSavePriceEdits} className="space-y-3 text-xs">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">5kg Rate</label>
                  <input type="number" required value={editTier5} onChange={(e) => setEditTier5(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-2 text-white font-mono" />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">25kg Rate</label>
                  <input type="number" required value={editTier25} onChange={(e) => setEditTier25(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-2 text-blue-300 font-mono" />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">50kg Rate</label>
                  <input type="number" required value={editTier50} onChange={(e) => setEditTier50(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-2 text-emerald-400 font-mono" />
                </div>
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Min Alert Stock (kg)</label>
                <input type="number" required value={editMinThreshold} onChange={(e) => setEditMinThreshold(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono" />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setEditPriceModal({ open: false, product: null })} className="flex-1 py-2.5 bg-slate-800 rounded-xl">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl font-bold">Save Rates</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT BOTTLE RATE MODAL */}
      {editBottleModal.open && editBottleModal.bottle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">✏️ Edit Bottle — {editBottleModal.bottle.name}</h3>
            <form onSubmit={handleSaveBottleEdits} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Rate per Piece (Rs.)</label>
                <input type="number" step="any" required value={editBottleRate} onChange={(e) => setEditBottleRate(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-emerald-400 font-mono font-bold" />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">MOQ (Pieces)</label>
                <input type="number" required value={editBottleMoq} onChange={(e) => setEditBottleMoq(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono" />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setEditBottleModal({ open: false, bottle: null })} className="flex-1 py-2.5 bg-slate-800 rounded-xl">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl font-bold">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESET MODAL */}
      {confirmResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="bg-slate-900 border border-rose-800 rounded-2xl max-w-sm w-full p-6 space-y-4">
            <div className="text-rose-400 font-bold text-base">⚠️ Reset All Stocks to 0?</div>
            <p className="text-xs text-slate-300">This will reset chemical and bottle stocks to 0 across all devices.</p>
            <div className="flex gap-2">
              <button onClick={() => setConfirmResetModal(false)} className="flex-1 py-2.5 bg-slate-800 rounded-xl text-xs">Cancel</button>
              <button onClick={executeResetAllStock} className="flex-1 py-2.5 bg-rose-600 text-white rounded-xl text-xs font-bold">Yes, Reset</button>
            </div>
          </div>
        </div>
      )}

      {/* SHARE MODAL */}
      {shareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-white">📱 Connect Phones</h3>
              <button onClick={() => setShareModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <div className="bg-slate-800 p-3 rounded-xl border border-slate-700 flex items-center justify-between gap-2">
              <span className="text-xs font-mono truncate">{window.location.href}</span>
              <button onClick={copyShareLink} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold">Copy</button>
            </div>
          </div>
        </div>
      )}

      <footer className="bg-slate-950 border-t border-slate-800 py-4 px-4 text-center text-xs text-slate-500">
        Khushali Chemicals • Jaipur, Rajasthan • Contact: +91 8905878950 • GST: 08PBDPS5444B1ZD
      </footer>
    </div>
  );
}
