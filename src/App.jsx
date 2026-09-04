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

// --- 15 MASTER PRODUCTS ---
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

// --- PASTE YOUR FIREBASE KEYS HERE ---
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
  // Login & Welcome State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginPassword, setLoginPassword] = useState('');

  const [syncStatus, setSyncStatus] = useState('Connecting to live database...');
  const [isCloudConnected, setIsCloudConnected] = useState(false);
  const [cloudError, setCloudError] = useState(null);

  const [products, setProducts] = useState(DEFAULT_PRODUCTS);
  const [transactions, setTransactions] = useState([]);
  const [activeTab, setActiveTab] = useState('inventory');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [notification, setNotification] = useState(null);

  const [ledgerSortOrder, setLedgerSortOrder] = useState('desc');

  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [confirmResetModal, setConfirmResetModal] = useState(false);

  const [editPriceModal, setEditPriceModal] = useState({ open: false, product: null });
  const [editTier5, setEditTier5] = useState('');
  const [editTier25, setEditTier25] = useState('');
  const [editTier50, setEditTier50] = useState('');
  const [editMinThreshold, setEditMinThreshold] = useState('');

  const [quickStockModal, setQuickStockModal] = useState({ open: false, product: null, type: 'INWARD' });
  const [modalQty, setModalQty] = useState('');
  const [modalRef, setModalRef] = useState('');
  const [modalParty, setModalParty] = useState('');
  const [modalPriceTier, setModalPriceTier] = useState('tier25');
  const [modalNotes, setModalNotes] = useState('');

  const [calcProductId, setCalcProductId] = useState("KHU-004");
  const [calcInputType, setCalcInputType] = useState("CONCENTRATE");
  const [calcAmount, setCalcAmount] = useState(5);
  const [calcCostTier, setCalcCostTier] = useState("tier25");

  const [quoteItems, setQuoteItems] = useState([
    { productId: "KHU-004", packSize: 25, quantityPacks: 1 },
    { productId: "KHU-006", packSize: 25, quantityPacks: 1 },
    { productId: "KHU-001", packSize: 25, quantityPacks: 1 }
  ]);
  const [quoteCustomerName, setQuoteCustomerName] = useState("Wholesale Buyer");
  const [quoteCustomerCity, setQuoteCustomerCity] = useState("Jaipur, Rajasthan");

  const showToast = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3500);
  };

  // 1. Authenticate immediately
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

  // 2. Direct Firestore Collection Listeners & Auto Stock Recovery from Ledger
  useEffect(() => {
    const productsRef = collection(db, 'products');
    const txRef = collection(db, 'transactions');

    const unsubProducts = onSnapshot(
      productsRef,
      (snapshot) => {
        if (snapshot.empty) {
          DEFAULT_PRODUCTS.forEach(async (p) => {
            try {
              await setDoc(doc(db, 'products', p.id), p, { merge: true });
            } catch (e) {
              console.error("Init save error:", e);
            }
          });
        } else {
          const cloudMap = {};
          snapshot.forEach(docSnap => {
            cloudMap[docSnap.id] = docSnap.data();
          });

          setProducts(DEFAULT_PRODUCTS.map(def => {
            const remote = cloudMap[def.id];
            if (!remote) return def;
            return {
              ...def,
              ...remote,
              pricing: {
                ...def.pricing,
                ...(remote.pricing || {})
              }
            };
          }));
        }
      },
      (error) => {
        console.error("Firestore product error:", error);
        setCloudError("Firestore Error: " + error.message);
        setSyncStatus('⚠️ Sync Error');
      }
    );

    const unsubTx = onSnapshot(
      txRef,
      (snapshot) => {
        const list = [];
        snapshot.forEach(docSnap => {
          list.push({ id: docSnap.id, ...docSnap.data() });
        });
        setTransactions(list);

        const calculatedStocks = {};
        list.forEach(tx => {
          if (tx.productId && tx.qty) {
            if (!calculatedStocks[tx.productId]) calculatedStocks[tx.productId] = 0;
            const qty = Number(tx.qty) || 0;
            if (tx.type === 'INWARD' || tx.type === 'PRODUCTION_DILUTION') {
              calculatedStocks[tx.productId] += qty;
            } else if (tx.type === 'DISPATCH') {
              calculatedStocks[tx.productId] -= qty;
            } else if (tx.type === 'PRODUCT_RESET') {
              calculatedStocks[tx.productId] = 0;
            }
          }
        });

        if (list.length > 0) {
          setProducts(prev => prev.map(p => {
            const calculated = calculatedStocks[p.id];
            if (calculated !== undefined) {
              return { ...p, stockKg: Math.max(0, calculated) };
            }
            return p;
          }));
        }
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
    }
  };

  // Individual Product Reset to 0 Functionality
  const handleResetProductStock = async (product) => {
    if (!window.confirm(`Are you sure you want to reset stock of ${product.name} to 0 kg?`)) {
      return;
    }

    const currentStock = Number(product.stockKg) || 0;
    if (currentStock <= 0) {
      showToast(`${product.name} stock is already 0 kg.`);
      return;
    }

    // Set local stock to 0
    setProducts(prev => prev.map(p => p.id === product.id ? { ...p, stockKg: 0 } : p));
    await saveProductToCloud(product.id, { stockKg: 0 });

    // Log reset transaction in ledger
    const resetTx = {
      id: "TX-RESET-" + product.id + "-" + Date.now().toString().slice(-4),
      date: new Date().toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }),
      type: 'PRODUCT_RESET',
      productId: product.id,
      productName: product.name,
      qty: currentStock,
      unit: product.unit || 'kg',
      refNumber: 'RESET-0',
      party: 'Admin Reset',
      notes: `Reset ${product.name} stock from ${currentStock}kg to 0kg`,
      amount: 0
    };
    await saveTransactionToCloud(resetTx);

    showToast(`Reset ${product.name} stock to 0 kg successfully!`);
  };

  const handleDeleteTransaction = async (tx) => {
    if (!window.confirm(`Are you sure you want to undo/delete transaction [${tx.id}]? This will reverse the stock change!`)) {
      return;
    }

    try {
      if (tx.productId && tx.qty && tx.type) {
        const targetProd = products.find(p => p.id === tx.productId);
        if (targetProd) {
          let currentStock = Number(targetProd.stockKg) || 0;
          let newStock = currentStock;

          if (tx.type === 'INWARD' || tx.type === 'PRODUCTION_DILUTION') {
            newStock = Math.max(0, currentStock - Number(tx.qty));
          } else if (tx.type === 'DISPATCH') {
            newStock = currentStock + Number(tx.qty);
          }

          setProducts(prev => prev.map(p => p.id === targetProd.id ? { ...p, stockKg: newStock } : p));
          await saveProductToCloud(targetProd.id, { stockKg: newStock });
        }
      }

      await deleteDoc(doc(db, 'transactions', tx.id));
      showToast(`Transaction ${tx.id} deleted and stock adjusted successfully!`);
    } catch (err) {
      console.error("Error deleting transaction:", err);
      showToast("Failed to delete transaction: " + err.message, "error");
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

    return {
      totalStockKg,
      totalStockValuation,
      totalPotentialDilutedLitres,
      zeroStockCount,
      totalProducts: products.length
    };
  }, [products]);

  const categories = useMemo(() => {
    const set = new Set(products.map(p => p.category));
    return ['ALL', ...Array.from(set)];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchCat = selectedCategory === 'ALL' || p.category === selectedCategory;
      const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  const selectedCalcProduct = useMemo(() => {
    return products.find(p => p.id === calcProductId) || products[0];
  }, [products, calcProductId]);

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

    const ratePerKg = (selectedCalcProduct.pricing && selectedCalcProduct.pricing[calcCostTier]) || (selectedCalcProduct.pricing && selectedCalcProduct.pricing.tier5) || 0;
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
      ratePerKg: ratePerKg,
      totalConcentrateCost: Math.round(totalConcentrateCost),
      costPerFinishedLitre: costPerFinishedLitre.toFixed(2),
      restingHours: selectedCalcProduct.restingHours,
      waterType: selectedCalcProduct.waterType,
      instructions: selectedCalcProduct.additives,
      availableInStock: (selectedCalcProduct.stockKg || 0) >= concentrateKg
    };
  }, [selectedCalcProduct, calcAmount, calcInputType, calcCostTier]);

  const handleOpenEditPrice = (product) => {
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

    setProducts(prev => prev.map(p => p.id === product.id ? { 
      ...p, 
      pricing: newPricing,
      minThresholdKg: newMinThresh
    } : p));

    await saveProductToCloud(product.id, {
      pricing: newPricing,
      minThresholdKg: newMinThresh
    });

    showToast("Updated rates for " + product.name + "! Synced across all phones.");
    setEditPriceModal({ open: false, product: null });
  };

  const handleQuickAdd = async (product, addAmount) => {
    const current = Number(product.stockKg) || 0;
    const newStock = current + addAmount;
    
    setProducts(prev => prev.map(p => p.id === product.id ? { ...p, stockKg: newStock } : p));
    await saveProductToCloud(product.id, { stockKg: newStock });

    const newTx = {
      id: "TX-" + Date.now().toString().slice(-5),
      date: new Date().toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }),
      type: 'INWARD',
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

    showToast("Added +" + addAmount + "kg to " + product.name + "! Stock is now " + newStock + "kg");
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

    const currentStock = Number(product.stockKg) || 0;
    if (quickStockModal.type === 'DISPATCH' && currentStock < qtyNum) {
      showToast("Cannot dispatch " + qtyNum + "kg. Available stock is " + currentStock + "kg!", "error");
      return;
    }

    const delta = quickStockModal.type === 'INWARD' ? qtyNum : -qtyNum;
    const newStock = Math.max(0, currentStock + delta);

    setProducts(prev => prev.map(p => p.id === product.id ? { ...p, stockKg: newStock } : p));
    await saveProductToCloud(product.id, { stockKg: newStock });

    const unitPrice = product.pricing[modalPriceTier] || product.pricing.tier25;
    const totalAmt = Math.round(qtyNum * unitPrice);

    const newTx = {
      id: "TX-" + Date.now().toString().slice(-5),
      date: new Date().toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }),
      type: quickStockModal.type,
      productId: product.id,
      productName: product.name,
      qty: qtyNum,
      unit: product.unit || "kg",
      refNumber: modalRef || (quickStockModal.type === 'INWARD' ? "GRN-" + Date.now().toString().slice(-4) : "DISP-" + Date.now().toString().slice(-4)),
      party: modalParty || (quickStockModal.type === 'INWARD' ? 'Factory Batch' : 'Wholesale Client'),
      notes: modalNotes || ((quickStockModal.type === 'INWARD' ? 'Stock Added' : 'Stock Dispatched') + " @ Rs." + unitPrice + "/" + product.unit),
      amount: totalAmt
    };
    await saveTransactionToCloud(newTx);

    showToast(
      quickStockModal.type === 'INWARD'
        ? "Added +" + qtyNum + "kg to " + product.name + ". Synced on all devices."
        : "Dispatched -" + qtyNum + "kg from " + product.name + ". Synced on all devices."
    );

    setQuickStockModal({ open: false, product: null, type: 'INWARD' });
    setModalQty('');
    setModalRef('');
    setModalParty('');
    setModalNotes('');
  };

  const handleLogDilutionBatch = async () => {
    if (!formulationResult) return;
    const reqConc = parseFloat(formulationResult.concentrateKg);
    const currentStock = Number(selectedCalcProduct.stockKg) || 0;

    if (currentStock < reqConc) {
      showToast("Stock is " + currentStock + "kg, but batch needs " + reqConc + "kg. Inward concentrate first.", "error");
      return;
    }

    const newStock = currentStock - reqConc;
    setProducts(prev => prev.map(p => p.id === selectedCalcProduct.id ? { ...p, stockKg: newStock } : p));
    await saveProductToCloud(selectedCalcProduct.id, { stockKg: newStock });

    const newTx = {
      id: "TX-" + Date.now().toString().slice(-5),
      date: new Date().toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }),
      type: 'PRODUCTION_DILUTION',
      productId: selectedCalcProduct.id,
      productName: selectedCalcProduct.name,
      qty: reqConc,
      unit: "kg",
      refNumber: "BATCH-" + Date.now().toString().slice(-4),
      notes: "Mixed " + reqConc + "kg concentrate with " + formulationResult.waterKg + "kg " + selectedCalcProduct.waterType + ". Yield: " + formulationResult.finishedLitres + "L finished product."
    };
    await saveTransactionToCloud(newTx);

    showToast("Batch recorded: " + formulationResult.finishedLitres + "L produced! Deducted on all phones.");
  };

  const executeResetAllStock = async () => {
    setProducts(prev => prev.map(p => ({ ...p, stockKg: 0 })));

    DEFAULT_PRODUCTS.forEach(async (p) => {
      try {
        await setDoc(doc(db, 'products', p.id), { stockKg: 0 }, { merge: true });
      } catch (err) {
        console.error("Reset error:", err);
      }
    });

    const resetTx = {
      id: "TX-RESET-" + Date.now().toString().slice(-4),
      date: new Date().toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }),
      type: 'STOCK_RESET',
      productId: 'ALL-15',
      productName: 'All 15 SKUs Initialized',
      qty: 0,
      unit: 'kg',
      refNumber: 'CLOUD-RESET',
      party: "Admin Device",
      notes: 'All 15 product inventories reset to 0 kg across all devices'
    };
    await saveTransactionToCloud(resetTx);

    setConfirmResetModal(false);
    showToast("All 15 product stocks reset to 0 kg on all devices!");
  };

  const addQuoteItem = () => {
    setQuoteItems([...quoteItems, { productId: products[0].id, packSize: 25, quantityPacks: 1 }]);
  };

  const removeQuoteItem = (idx) => {
    setQuoteItems(quoteItems.filter((_, i) => i !== idx));
  };

  const updateQuoteItem = (idx, field, value) => {
    const updated = [...quoteItems];
    updated[idx][field] = value;
    setQuoteItems(updated);
  };

  const quoteCalculations = useMemo(() => {
    let subtotal = 0;
    const itemsDetailed = quoteItems.map(item => {
      const prod = products.find(p => p.id === item.productId) || products[0];
      const packSize = Number(item.packSize) || 5;
      const qtyPacks = Number(item.quantityPacks) || 1;
      const totalKg = packSize * qtyPacks;

      let ratePerKg = prod.pricing ? prod.pricing.tier5 : 0;
      if (prod.pricing) {
        if (packSize >= 50 || totalKg >= 50) {
          ratePerKg = prod.pricing.tier50;
        } else if (packSize >= 25 || totalKg >= 25) {
          ratePerKg = prod.pricing.tier25;
        }
      }

      const itemTotal = totalKg * ratePerKg;
      subtotal += itemTotal;

      return {
        ...item,
        prodName: prod.name,
        totalKg: totalKg,
        ratePerKg: ratePerKg,
        itemTotal: itemTotal,
        ratio: prod.ratioLabel
      };
    });

    const totalAmount = subtotal;
    const estimatedGstPortion = Math.round((subtotal * 18) / 118);
    const baseValue = subtotal - estimatedGstPortion;

    return {
      items: itemsDetailed,
      subtotal,
      totalAmount,
      estimatedGstPortion,
      baseValue
    };
  }, [quoteItems, products]);

  const generateWhatsAppMessage = () => {
    const lines = [
      "*KHUSHALI CHEMICALS - QUOTATION*",
      "📍 Jaipur, Rajasthan | 📞 +91 8905878950",
      "GST: 08PBDPS5444B1ZD | Web: khushalichemicals.com",
      "------------------------------------------",
      "*Client:* " + (quoteCustomerName || 'Valued Buyer') + " (" + (quoteCustomerCity || 'India') + ")",
      "*Date:* " + new Date().toLocaleDateString('en-IN'),
      "------------------------------------------",
      "*ORDER SUMMARY:*"
    ];

    quoteCalculations.items.forEach((it, idx) => {
      lines.push((idx + 1) + ". *" + it.prodName + "*");
      lines.push("   📦 " + it.quantityPacks + " Can(s) of " + it.packSize + "kg = " + it.totalKg + "kg @ Rs." + it.ratePerKg + "/kg");
      lines.push("   👉 *Total: Rs." + it.itemTotal.toLocaleString('en-IN') + "* (Yield: ~" + it.ratio + ")");
    });

    lines.push("------------------------------------------");
    lines.push("💰 *TOTAL INVOICE VALUE: Rs." + quoteCalculations.totalAmount.toLocaleString('en-IN') + "*");
    lines.push("(18% GST included: Rs." + quoteCalculations.estimatedGstPortion.toLocaleString('en-IN') + ")");
    lines.push("\nTo confirm this order, kindly reply to this message or call 8905878950.");

    return lines.join('\n');
  };

  const copyQuotation = () => {
    const text = generateWhatsAppMessage();
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      showToast("Quotation copied to clipboard!");
    } catch (err) {
      showToast("Unable to copy", "error");
    }
    document.body.removeChild(textArea);
  };

  const openWhatsAppShare = () => {
    const msg = encodeURIComponent(generateWhatsAppMessage());
    window.open("https://wa.me/?text=" + msg, '_blank');
  };

  const copyShareLink = () => {
    const url = window.location.href;
    const textArea = document.createElement("textarea");
    textArea.value = url;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      showToast("App URL copied! Open on any phone browser to access.");
    } catch (err) {
      showToast("Could not copy link", "error");
    }
    document.body.removeChild(textArea);
  };

  // --- LOGIN SCREEN WITH WELCOME POPUP ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-sans">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-8 shadow-2xl space-y-6 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-400"></div>
          
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-cyan-400 flex items-center justify-center font-black text-white text-2xl shadow-lg shadow-blue-500/20 border border-blue-400/30">
            KC
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold text-cyan-400 tracking-widest uppercase bg-cyan-950/80 px-3 py-1 rounded-full border border-cyan-800">
              Welcome to Khushali Chemicals
            </span>
            <h2 className="text-2xl font-black text-white tracking-tight">
              Inventory & Dilution Portal
            </h2>
            <p className="text-xs text-slate-400">
              Enter your secure access code to manage inventory, live stock, and quotations.
            </p>
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
            <div>
              <input
                type="password"
                placeholder="Enter Password to Access"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-4 py-3.5 text-center text-lg font-bold text-white tracking-widest focus:outline-none focus:border-blue-500 shadow-inner"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-2xl shadow-lg shadow-blue-600/30 transition active:scale-95 text-sm"
            >
              🔐 Enter Portal
            </button>
          </form>

          <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-800">
            Jaipur, Rajasthan • Secure Cloud Inventory System
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

      <header className="bg-slate-950/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-cyan-400 flex items-center justify-center font-black text-white text-xl shadow-lg shadow-blue-500/20 border border-blue-400/30">
                KC
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                    KHUSHALI <span className="text-cyan-400 font-extrabold">CHEMICALS</span>
                  </h1>
                  <span className={"px-2 py-0.5 text-[10px] font-bold tracking-wide rounded-md border flex items-center gap-1 " + (isCloudConnected ? 'bg-emerald-950 text-emerald-300 border-emerald-700' : 'bg-amber-950 text-amber-300 border-amber-700')}>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>15 PRODUCTS</span>
                  </span>
                </div>
                <p className="text-xs text-slate-400 flex items-center gap-2">
                  <span>📍 Jaipur, Rajasthan</span>
                  <span className="hidden md:inline">• Contact: 8905878950</span>
                  <span className="hidden lg:inline">• GST: 08PBDPS5444B1ZD</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => setShareModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-blue-900/60 hover:bg-blue-800 text-blue-200 border border-blue-700/60 rounded-lg transition shadow-sm"
              >
                <span>📱</span> Connect Phones
              </button>
              <button
                onClick={() => setActiveTab('quotation')}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-lg shadow-md shadow-emerald-700/20 transition active:scale-95"
              >
                <span>💬</span> WhatsApp Quote
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800/80 bg-slate-950/60 overflow-x-auto scrollbar-none">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex space-x-1 sm:space-x-2 py-2">
            {[
              { id: 'inventory', label: '📦 Live Stock (15 Products)', badge: products.filter(p => (p.stockKg || 0) > 0).length + " in stock" },
              { id: 'calculator', label: '🧪 Batch Dilution Engine', badge: '1:6 to 1:100' },
              { id: 'quotation', label: '💬 WhatsApp Quotation & GST', badge: '18% Inc.' },
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
            <span className="text-[11px] text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800">
              Toilet Cleaner: Rs.{products.find(p=>p.id==="KHU-004")?.pricing.tier5}/kg • Floor Cleaner: Rs.{products.find(p=>p.id==="KHU-006")?.pricing.tier5}/kg
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setConfirmResetModal(true)}
              className="text-[11px] text-rose-400 hover:text-rose-300 underline font-medium"
            >
              Reset All 15 SKUs to 0 kg
            </button>
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
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
              15 SKUs Configured
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
              Rs.{inventoryStats.totalStockValuation.toLocaleString('en-IN')}
            </div>
            <div className="mt-1 text-[11px] text-slate-400">
              GST 18% inclusive
            </div>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/70 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-1">
              <span>Empty Stock Items</span>
              <span className="text-amber-400 text-lg">📦</span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-amber-400">
              {inventoryStats.zeroStockCount} <span className="text-xs font-normal text-slate-400">/ 15 items</span>
            </div>
            <div className="mt-1 text-[11px] text-slate-400">
              {inventoryStats.zeroStockCount > 0 ? "Ready for inward batch entry" : "All 15 SKUs stocked"}
            </div>
          </div>
        </div>

        {activeTab === 'inventory' && (
          <div className="space-y-5">
            <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
              <div className="relative flex-1">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 text-sm">
                  🔍
                </span>
                <input
                  type="text"
                  placeholder="Search 15 products by name (Toilet Cleaner, Floor Cleaner, Dettol, Rose)..."
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
                const stockValKg = Number(p.stockKg) || 0;
                const isZero = stockValKg === 0;

                return (
                  <div
                    key={p.id}
                    className={"bg-slate-800/90 rounded-2xl border transition-all duration-200 flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-xl hover:border-slate-600 " + (isZero ? 'border-slate-700/60' : 'border-blue-500/40 ring-1 ring-blue-500/20')}
                  >
                    <div className="p-4 sm:p-5">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3.5 h-3.5 rounded-full ring-2 ring-slate-900 shadow-sm"
                            style={{ backgroundColor: p.colorTheme }}
                            title={p.colorName}
                          />
                          <span className="text-[11px] font-mono font-bold text-slate-400 bg-slate-900/90 px-2 py-0.5 rounded border border-slate-700">
                            {p.id}
                          </span>
                          <span className="text-[10px] uppercase tracking-wider font-semibold text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">
                            {p.category}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {/* Individual Reset to 0 Button */}
                          <button
                            onClick={() => handleResetProductStock(p)}
                            className="text-[10px] px-2 py-0.5 bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800 rounded font-medium transition flex items-center gap-1"
                            title="Reset this product stock to 0 kg"
                          >
                            <span>🔄</span> Reset 0
                          </button>
                          <button
                            onClick={() => handleOpenEditPrice(p)}
                            className="text-[10px] px-2 py-0.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded font-medium transition flex items-center gap-1"
                            title="Click to edit prices & minimum stock threshold"
                          >
                            <span>✏️</span> Edit Rates
                          </button>
                        </div>
                      </div>

                      <h3 className="text-base font-bold text-white tracking-tight mb-1">
                        {p.name}
                      </h3>

                      <p className="text-xs text-slate-400 line-clamp-1 mb-3">
                        Ratio: <span className="font-semibold text-slate-200">{p.ratioLabel}</span> • {p.waterType}
                      </p>

                      <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 mb-3">
                        <div className="flex items-baseline justify-between mb-1">
                          <span className="text-xs text-slate-400">Available Stock:</span>
                          <span className="text-lg font-black text-white font-mono">
                            {stockValKg} <span className="text-xs font-normal text-slate-400">{p.unit}</span>
                          </span>
                        </div>

                        <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px]">
                          <span className="text-slate-500 text-[10px]">Cloud Inward:</span>
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleQuickAdd(p, 5)}
                              className="px-2 py-0.5 bg-slate-800 hover:bg-emerald-900/60 hover:text-emerald-200 text-slate-300 rounded border border-slate-700 text-[10px] font-mono transition"
                            >
                              +5kg
                            </button>
                            <button
                              onClick={() => handleQuickAdd(p, 25)}
                              className="px-2 py-0.5 bg-slate-800 hover:bg-emerald-900/60 hover:text-emerald-200 text-slate-300 rounded border border-slate-700 text-[10px] font-mono transition"
                            >
                              +25kg
                            </button>
                            <button
                              onClick={() => handleQuickAdd(p, 50)}
                              className="px-2 py-0.5 bg-slate-800 hover:bg-emerald-900/60 hover:text-emerald-200 text-slate-300 rounded border border-slate-700 text-[10px] font-mono transition"
                            >
                              +50kg
                            </button>
                          </div>
                        </div>
                      </div>

                      <div 
                        onClick={() => handleOpenEditPrice(p)}
                        className="bg-slate-950/40 hover:bg-slate-950/80 cursor-pointer rounded-xl p-2 border border-slate-800/70 text-xs transition"
                        title="Click to edit these tier rates"
                      >
                        <div className="text-[10px] text-slate-400 mb-1 flex justify-between">
                          <span>Rates (18% GST Inc.)</span>
                          <span className="text-cyan-400 text-[9px]">Click to change</span>
                        </div>
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

                    <div className="bg-slate-900/80 p-3 border-t border-slate-700/60 grid grid-cols-3 gap-2">
                      <button
                        onClick={() => {
                          setQuickStockModal({ open: true, product: p, type: 'INWARD' });
                          setModalPriceTier('tier25');
                        }}
                        className="py-1.5 px-2 bg-emerald-900/50 hover:bg-emerald-800 text-emerald-200 border border-emerald-700/60 rounded-lg text-xs font-medium transition flex items-center justify-center gap-1"
                      >
                        <span>➕</span> Inward
                      </button>

                      <button
                        onClick={() => {
                          setQuickStockModal({ open: true, product: p, type: 'DISPATCH' });
                          setModalPriceTier('tier5');
                        }}
                        className="py-1.5 px-2 bg-blue-900/50 hover:bg-blue-800 text-blue-200 border border-blue-700/60 rounded-lg text-xs font-medium transition flex items-center justify-center gap-1"
                      >
                        <span>📤</span> Dispatch
                      </button>

                      <button
                        onClick={() => {
                          setCalcProductId(p.id);
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

        {activeTab === 'calculator' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 bg-slate-800/90 rounded-2xl p-5 sm:p-6 border border-slate-700 shadow-md">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-700">
                <span className="text-2xl">🧪</span>
                <div>
                  <h2 className="text-lg font-bold text-white">Batch Mixing Engine</h2>
                  <p className="text-xs text-slate-400">Technical dilution specs with auto cost-per-litre</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Select Product Concentrate (1 of 15)
                  </label>
                  <select
                    value={calcProductId}
                    onChange={(e) => setCalcProductId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white font-medium focus:outline-none focus:border-blue-500"
                  >
                    {products.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} (Rate: Rs.{p.pricing.tier25}/kg, Ratio: {p.ratioLabel}) — Live Stock: {p.stockKg || 0}kg
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Calculation Target
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
                      Live in Stock: <span className="text-cyan-400 font-bold">{selectedCalcProduct.stockKg || 0} kg</span>
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
                        +{val}
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
                        Batch Recipe & Output
                      </span>
                      <h3 className="text-xl font-black text-white">
                        {selectedCalcProduct.name}
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
                        <span>1. Raw Concentrate</span>
                      </div>
                      <div className="text-xl font-bold text-white font-mono">
                        {formulationResult.concentrateKg} <span className="text-xs font-normal text-slate-400">kg</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1">
                        Live stock on phones: {selectedCalcProduct.stockKg || 0} kg
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
                          <strong>Resting Period Required:</strong> Minimum {formulationResult.restingHours} hours rest for crystal-clear transparency & bubble clearance.
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

                  <button
                    onClick={handleLogDilutionBatch}
                    disabled={!formulationResult.availableInStock}
                    className={"w-full py-3 px-4 rounded-xl text-sm font-bold shadow-lg transition flex items-center justify-center gap-2 " + (formulationResult.availableInStock ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-600/30' : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700')}
                  >
                    <span>⚡</span>
                    {formulationResult.availableInStock
                      ? "Log Finished Batch (" + formulationResult.finishedLitres + "L) & Deduct " + formulationResult.concentrateKg + "kg on All Phones"
                      : "Stock Insufficient (Have " + (selectedCalcProduct.stockKg || 0) + "kg, need " + formulationResult.concentrateKg + "kg)"}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'quotation' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-6 bg-slate-800/90 rounded-2xl p-5 border border-slate-700 shadow-md space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-700">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">💬</span>
                  <div>
                    <h2 className="text-lg font-bold text-white">Quotation & Order Maker</h2>
                    <p className="text-xs text-slate-400">15 SKUs with accurate wholesale pricing</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={addQuoteItem}
                  className="px-3 py-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition"
                >
                  + Add Item
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Buyer / Business Name
                  </label>
                  <input
                    type="text"
                    value={quoteCustomerName}
                    onChange={(e) => setQuoteCustomerName(e.target.value)}
                    placeholder="e.g. Ramesh Cleaners"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    City & State
                  </label>
                  <input
                    type="text"
                    value={quoteCustomerCity}
                    onChange={(e) => setQuoteCustomerCity(e.target.value)}
                    placeholder="e.g. Surat, Gujarat"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                {quoteItems.map((item, idx) => {
                  const prod = products.find(p => p.id === item.productId) || products[0];
                  const isCustomSize = !prod.packSizes.includes(item.packSize);

                  return (
                    <div key={idx} className="bg-slate-900 p-3.5 rounded-xl border border-slate-700 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-400">Item #{idx + 1}</span>
                        {quoteItems.length > 1 && (
                          <button
                            onClick={() => removeQuoteItem(idx)}
                            className="text-xs text-rose-400 hover:text-rose-300 hover:underline"
                          >
                            Remove
                          </button>
                        )}
                      </div>

                      <select
                        value={item.productId}
                        onChange={(e) => updateQuoteItem(idx, 'productId', e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-medium focus:outline-none focus:border-blue-500"
                      >
                        {products.map(p => (
                          <option key={p.id} value={p.id}>
                            {p.name} (Rs.{p.pricing ? p.pricing.tier25 : 0}/kg)
                          </option>
                        ))}
                      </select>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <label className="block text-[10px] text-slate-400 mb-1">Can Size (kg)</label>
                          <select
                            value={isCustomSize ? 'CUSTOM' : item.packSize}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val === 'CUSTOM') {
                                updateQuoteItem(idx, 'packSize', 10);
                              } else {
                                updateQuoteItem(idx, 'packSize', Number(val));
                              }
                            }}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-white"
                          >
                            {prod.packSizes.map(sz => (
                              <option key={sz} value={sz}>{sz} kg Can</option>
                            ))}
                            <option value="CUSTOM">➕ Custom Size...</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] text-slate-400 mb-1">Quantity of Cans</label>
                          <input
                            type="number"
                            min="1"
                            value={item.quantityPacks}
                            onChange={(e) => updateQuoteItem(idx, 'quantityPacks', Math.max(1, parseInt(e.target.value) || 1))}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-white font-mono"
                          />
                        </div>
                      </div>

                      {isCustomSize && (
                        <div className="pt-1">
                          <label className="block text-[10px] text-cyan-400 mb-1">Enter Custom Pack Size (kg)</label>
                          <input
                            type="number"
                            min="0.1"
                            step="0.5"
                            value={item.packSize}
                            onChange={(e) => updateQuoteItem(idx, 'packSize', Math.max(0.1, parseFloat(e.target.value) || 1))}
                            placeholder="e.g. 35"
                            className="w-full bg-slate-950 border border-cyan-700 rounded-lg px-2 py-1.5 text-xs text-white font-mono"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="lg:col-span-6 space-y-4">
              <div className="bg-slate-800/90 rounded-2xl p-5 border border-slate-700 shadow-md space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-700">
                  <h3 className="text-base font-bold text-white">Quotation Summary</h3>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700">
                    GST 18% Inclusive
                  </span>
                </div>

                <div className="space-y-2">
                  {quoteCalculations.items.map((it, idx) => (
                    <div key={idx} className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-xs flex items-center justify-between">
                      <div>
                        <div className="font-bold text-white">{it.prodName}</div>
                        <div className="text-[11px] text-slate-400">
                          {it.quantityPacks} can(s) × {it.packSize}kg = <span className="text-cyan-300 font-semibold">{it.totalKg}kg</span> @ Rs.{it.ratePerKg}/kg
                        </div>
                      </div>
                      <div className="text-right font-mono font-bold text-slate-200">
                        Rs.{it.itemTotal.toLocaleString('en-IN')}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Base Taxable Amount:</span>
                    <span className="font-mono">Rs.{quoteCalculations.baseValue.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>GST (18% included in rates):</span>
                    <span className="font-mono">Rs.{quoteCalculations.estimatedGstPortion.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-800 flex justify-between items-baseline text-sm font-bold text-white">
                    <span>Total Payable:</span>
                    <span className="text-xl font-black text-emerald-400 font-mono">
                      Rs.{quoteCalculations.totalAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={openWhatsAppShare}
                    className="py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/30 transition flex items-center justify-center gap-2 text-sm"
                  >
                    <span>💬</span> Send on WhatsApp
                  </button>

                  <button
                    onClick={copyQuotation}
                    className="py-3 px-4 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl border border-slate-600 transition flex items-center justify-center gap-2 text-sm"
                  >
                    <span>📋</span> Copy Text
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'ledger' && (
          <div className="bg-slate-800/90 rounded-2xl p-5 border border-slate-700 shadow-md space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-700">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>📋</span> Cloud Stock Audit Ledger
                </h2>
                <p className="text-xs text-slate-400">Live records synced from all connected staff devices in real-time</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setLedgerSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
                  className="px-3 py-2 text-xs font-semibold bg-blue-900/60 hover:bg-blue-800 text-blue-200 border border-blue-700/60 rounded-lg transition flex items-center gap-1.5"
                >
                  <span>🔄</span> Sort: {ledgerSortOrder === 'desc' ? 'Newest First' : 'Oldest First'}
                </button>

                {transactions.length > 0 && (
                  <button
                    onClick={() => {
                      const headers = "ID,Date,Type,Product,Qty,Unit,Reference,Party,Amount,Notes\n";
                      const rows = sortedTransactions.map(t => 
                        '"' + t.id + '","' + t.date + '","' + t.type + '","' + t.productName + '","' + t.qty + '","' + t.unit + '","' + (t.refNumber || '') + '","' + (t.party || '') + '","' + (t.amount || 0) + '","' + (t.notes || '') + '"'
                      ).join("\n");
                      const blob = new Blob([headers + rows], { type: 'text/csv' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = "Khushali_Ledger_" + Date.now() + ".csv";
                      a.click();
                      showToast("Ledger CSV downloaded!");
                    }}
                    className="px-3.5 py-2 text-xs font-semibold bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg border border-slate-600 transition flex items-center gap-1.5"
                  >
                    <span>📥</span> Export CSV
                  </button>
                )}
              </div>
            </div>

            {transactions.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-sm">
                <span>📦</span> No transactions logged yet. Inward some stock on any phone to start.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-900/90 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-700">
                    <tr>
                      <th className="py-3 px-3">Date / ID</th>
                      <th className="py-3 px-3">Type</th>
                      <th className="py-3 px-3">Product Name</th>
                      <th className="py-3 px-3">Quantity</th>
                      <th className="py-3 px-3">Reference / Device</th>
                      <th className="py-3 px-3 text-right">Amount (Rs.)</th>
                      <th className="py-3 px-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 font-mono">
                    {sortedTransactions.map((tx) => {
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
                          <td className="py-3 px-3 font-sans font-medium text-slate-200">
                            {tx.productName}
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
                          <td className="py-3 px-3 text-center">
                            <button
                              onClick={() => handleDeleteTransaction(tx)}
                              className="px-2.5 py-1 bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-700/60 rounded text-[11px] font-sans font-medium transition"
                              title="Delete entry and reverse stock"
                            >
                              ❌ Undo
                            </button>
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

        {activeTab === 'catalog' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 rounded-2xl p-6 border border-blue-800/50 shadow-md">
              <div className="max-w-3xl">
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 bg-cyan-950 px-2.5 py-1 rounded border border-cyan-800 mb-2 inline-block">
                  Master 15 Products Technical Manual & Rates
                </span>
                <h2 className="text-xl font-black text-white mt-1">
                  Khushali Chemicals Official Formula Directory
                </h2>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  Single-step compound solutions designed to manufacture high-yield commercial cleaning products with zero chemical complexity.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-6">
                <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-700 text-xs space-y-1">
                  <div className="font-bold text-amber-300 flex items-center gap-1.5">
                    <span>🧂</span> 1. Industrial Salt Method
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    Always dissolve salt thoroughly in water FIRST. Never add salt directly into thick concentrate.
                  </p>
                </div>

                <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-700 text-xs space-y-1">
                  <div className="font-bold text-blue-300 flex items-center gap-1.5">
                    <span>⏳</span> 2. 24-Hour Resting Rule
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    Handwashes (Rose & Dettol), Dishwash & Fabric wash need 24h rest for micro-bubbles to settle completely.
                  </p>
                </div>

                <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-700 text-xs space-y-1">
                  <div className="font-bold text-cyan-300 flex items-center gap-1.5">
                    <span>🪟</span> 3. Zero TDS Glass Cleaner
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    Strictly use 0 TDS demineralized / battery water to eliminate spots or streaks on glass surfaces.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/90 rounded-2xl p-5 border border-slate-700 shadow-md">
              <h3 className="text-base font-bold text-white mb-4">Complete 15-Product Price & Formula Matrix</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-900/90 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-700">
                    <tr>
                      <th className="py-3 px-3"># SKU & Name</th>
                      <th className="py-3 px-3">Category</th>
                      <th className="py-3 px-3">Mixing Ratio</th>
                      <th className="py-3 px-3">5kg Rate</th>
                      <th className="py-3 px-3">25kg Rate</th>
                      <th className="py-3 px-3">50kg Rate</th>
                      <th className="py-3 px-3">Water / TDS Specification</th>
                      <th className="py-3 px-3 text-center">Edit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {products.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-900/40">
                        <td className="py-3 px-3 font-semibold text-white flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.colorTheme }} />
                          <div>
                            <div>{p.name}</div>
                            <div className="text-[10px] text-slate-500 font-mono">{p.id}</div>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <span className="text-[10px] bg-slate-900 px-2 py-0.5 rounded border border-slate-700 text-slate-300">
                            {p.category}
                          </span>
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
                        <td className="py-3 px-3 text-center">
                          <button
                            onClick={() => handleOpenEditPrice(p)}
                            className="px-2.5 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded text-[11px] font-medium transition"
                          >
                            ✏️ Edit
                          </button>
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

      {editPriceModal.open && editPriceModal.product && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xl">✏️</span>
                <h3 className="text-base font-bold text-white">
                  Edit Price Tiers (18% GST Inc.)
                </h3>
              </div>
              <button
                onClick={() => setEditPriceModal({ open: false, product: null })}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
              <div className="text-slate-400">Editing Product:</div>
              <div className="text-sm font-bold text-cyan-300">{editPriceModal.product.name}</div>
              <div className="text-[11px] text-slate-500 font-mono mt-0.5">{editPriceModal.product.id} • {editPriceModal.product.category}</div>
            </div>

            <form onSubmit={handleSavePriceEdits} className="space-y-3 text-xs">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    5kg Rate (Rs./kg)
                  </label>
                  <input
                    type="number"
                    step="1"
                    required
                    value={editTier5}
                    onChange={(e) => setEditTier5(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm font-bold text-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    25kg Rate (Rs./kg)
                  </label>
                  <input
                    type="number"
                    step="1"
                    required
                    value={editTier25}
                    onChange={(e) => setEditTier25(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm font-bold text-blue-300 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    50kg Rate (Rs./kg)
                  </label>
                  <input
                    type="number"
                    step="1"
                    required
                    value={editTier50}
                    onChange={(e) => setEditTier50(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm font-bold text-emerald-400 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Low Stock Alert Threshold (kg)
                </label>
                <input
                  type="number"
                  step="5"
                  required
                  value={editMinThreshold}
                  onChange={(e) => setEditMinThreshold(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditPriceModal({ open: false, product: null })}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition shadow-md shadow-blue-600/30"
                >
                  Save & Sync to All Phones
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {quickStockModal.open && quickStockModal.product && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xl">
                  {quickStockModal.type === 'INWARD' ? '📥' : '📤'}
                </span>
                <h3 className="text-base font-bold text-white">
                  {quickStockModal.type === 'INWARD' ? 'Cloud Restock Inward' : 'Record Cloud Dispatch'}
                </h3>
              </div>
              <button
                onClick={() => setQuickStockModal({ open: false, product: null, type: 'INWARD' })}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
              <div className="text-slate-400">Product:</div>
              <div className="text-sm font-bold text-white">{quickStockModal.product.name}</div>
              <div className="text-slate-400 mt-1">
                Current Stock: <span className="font-mono text-cyan-400 font-bold">{quickStockModal.product.stockKg || 0} kg</span>
              </div>
            </div>

            <form onSubmit={handleStockUpdate} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Quantity in kg
                </label>
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
                <label className="block text-slate-300 font-semibold mb-1">
                  Price Tier (18% GST Included)
                </label>
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
                  {quickStockModal.type === 'INWARD' ? 'Batch / Supplier Ref #' : 'Customer / Invoice #'}
                </label>
                <input
                  type="text"
                  placeholder={quickStockModal.type === 'INWARD' ? 'e.g. BATCH-AUG-102' : 'e.g. CleanCo Distributors'}
                  value={modalParty}
                  onChange={(e) => setModalParty(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Notes (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Can packaging verified"
                  value={modalNotes}
                  onChange={(e) => setModalNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setQuickStockModal({ open: false, product: null, type: 'INWARD' })}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={"flex-1 py-2.5 rounded-xl font-bold text-white transition " + (quickStockModal.type === 'INWARD' ? 'bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/30' : 'bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-600/30')}
                >
                  Confirm & Sync
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirmResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="bg-slate-900 border border-rose-800/80 rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-base">
              <span>⚠️</span> Reset All Inventories to 0 kg?
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              This action will reset the stock of all 15 products to <strong className="text-white">0 kg</strong> in the cloud database across all connected phones.
            </p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setConfirmResetModal(false)}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={executeResetAllStock}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-rose-600/30"
              >
                Yes, Reset to 0 kg
              </button>
            </div>
          </div>
        </div>
      )}

      {shareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-2xl">📱</span>
                <div>
                  <h3 className="text-base font-bold text-white">Open on Multiple Phones</h3>
                  <p className="text-xs text-slate-400">Share with warehouse & sales team</p>
                </div>
              </div>
              <button
                onClick={() => setShareModalOpen(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 text-xs">
              <div className="font-bold text-cyan-300 flex items-center gap-1.5">
                <span>⚡</span> Simple Multi-User Steps:
              </div>
              <ol className="list-decimal pl-4 space-y-1.5 text-slate-300">
                <li>Click <strong>Copy Link</strong> below and send it on WhatsApp to your staff.</li>
                <li>They can open the link directly in Chrome or Safari on their phone.</li>
                <li>Tap <strong>"Add to Home screen"</strong> in the browser menu to use it like a regular mobile app.</li>
                <li>Every inward, dispatch, and price update will automatically reflect across all phones.</li>
              </ol>
            </div>

            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 flex items-center justify-between gap-2">
              <div className="text-xs text-slate-300 font-mono truncate">
                {window.location.href}
              </div>
              <button
                onClick={copyShareLink}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold whitespace-nowrap transition"
              >
                Copy Link
              </button>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShareModalOpen(false)}
                className="py-2.5 px-5 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl text-xs transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="bg-slate-950 border-t border-slate-800 py-4 px-4 text-center text-xs text-slate-500">
        <p>
          Khushali Chemicals • Jaipur, Rajasthan • Contact: +91 8905878950 • GST: 08PBDPS5444B1ZD
        </p>
      </footer>
    </div>
  );
}
