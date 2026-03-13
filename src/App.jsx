import React, { useState, useMemo, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation, Outlet, useOutletContext, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { 
  Utensils, LayoutDashboard, ChefHat, Package, MessageSquare, 
  Store, Search, Star, Plus, Minus, Clock, 
  ArrowRight, ShoppingCart, ChevronRight, X, Trash2,
  ChevronLeft, Banknote, ShieldCheck,
  Loader2, CheckCircle2, TrendingUp, AlertTriangle, Lock
} from 'lucide-react';

// IMPORT YOUR SUPABASE CLIENT
import { supabase } from './supabaseClient';

// --- MENU DATA ---
const MENU_ITEMS = [
  { id: '1', name: 'Pork Adobo', category: 'Main Dish', price: 85, rating: 4.8, popular: true, desc: 'Classic Filipino pork stew braised in soy sauce, vinegar, and garlic.', img: '/images/adobo.jpg' },
  { id: '2', name: 'Sinigang na Baboy', category: 'Main Dish', price: 95, rating: 4.6, popular: false, desc: 'Sour soup with pork, vegetables, and tamarind broth.', img: '/images/sinigang.png' },
  { id: '3', name: 'Lumpiang Shanghai', category: 'Side Dish', price: 45, rating: 4.9, popular: true, desc: 'Crispy spring rolls filled with ground pork and vegetables.', img: '/images/lumpia.png' },
  { id: '4', name: 'Chicken Inasal', category: 'Grilled', price: 110, rating: 4.7, popular: false, desc: 'Grilled chicken marinated in calamansi, ginger, and annatto oil.', img: '/images/inasal.png' },
  { id: '5', name: 'Halo-Halo', category: 'Dessert', price: 65, rating: 4.9, popular: true, desc: 'Shaved ice with sweetened beans, fruits, and evaporated milk.', img: '/images/halo-halo.png' },
];

// --- MAIN LAYOUT ---
function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [orderStatus, setOrderStatus] = useState('none'); 
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [passInput, setPassInput] = useState("");

  const handleAdminNav = (path) => {
    if (isAdmin) {
      navigate(path);
    } else {
      setShowLogin(true);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (passInput === "devoops2026") {
      setIsAdmin(true);
      setShowLogin(false);
      navigate("/admin");
    } else {
      alert("Invalid Team Credentials");
    }
  };

  const addToCart = (item) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) return prev.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const updateQty = (id, delta) => setCart(prev => prev.map(i => i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i));
  const removeFromCart = (id) => setCart(prev => prev.filter(i => i.id !== id));
  const subtotal = useMemo(() => cart.reduce((sum, i) => sum + (i.price * i.qty), 0), [cart]);
  const totalItems = useMemo(() => cart.reduce((sum, i) => sum + i.qty, 0), [cart]);

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans">
      <aside className="w-64 bg-white border-r border-slate-200 p-6 flex flex-col fixed h-full z-20">
        <Link to="/" className="flex items-center gap-3 mb-10 group">
          <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg transition-transform group-hover:rotate-12"><Utensils className="text-white w-6 h-6" /></div>
          <div><h1 className="font-bold text-xl leading-none">Ziion J's</h1><p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Kitchenette</p></div>
        </Link>
        <nav className="space-y-1 flex-1">
          <Link to="/menu" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm ${location.pathname === '/menu' ? 'bg-orange-50 text-orange-600 border border-orange-100' : 'text-slate-600 hover:bg-slate-50'}`}>
            <Utensils size={18} /> Customer Menu
          </Link>
          <button onClick={() => handleAdminNav("/admin")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm ${location.pathname === '/admin' ? 'bg-orange-50 text-orange-600 border border-orange-100' : 'text-slate-600 hover:bg-slate-50'}`}>
            <LayoutDashboard size={18} /> Forecast Dashboard {!isAdmin && <Lock size={12} className="ml-auto opacity-40"/>}
          </button>
          <Link to="/kitchen" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm ${location.pathname === '/kitchen' ? 'bg-orange-50 text-orange-600 border border-orange-100' : 'text-slate-600 hover:bg-slate-50'}`}>
            <ChefHat size={18} /> Kitchen Display
          </Link>
          <Link to="/feedback" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm ${location.pathname === '/feedback' ? 'bg-orange-50 text-orange-600 border border-orange-100' : 'text-slate-600 hover:bg-slate-50'}`}>
            <MessageSquare size={18} /> Feedback
          </Link>
        </nav>
      </aside>

      <main className="flex-1 ml-64 p-12">
        <AnimatePresence mode="wait">
          {orderStatus === 'success' ? (
            <SuccessView onOrderMore={() => setOrderStatus('none')} />
          ) : orderStatus === 'checkout' ? (
            <CheckoutView cart={cart} subtotal={subtotal} onBack={() => setOrderStatus('none')} onConfirm={() => {setOrderStatus('success'); setCart([]);}} />
          ) : (
            <motion.div key={location.pathname} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <Outlet context={{ addToCart, isAdmin, setShowLogin }} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ADMIN LOGIN MODAL */}
      <AnimatePresence>
        {showLogin && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowLogin(false)} className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100]" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="fixed z-[110] bg-white p-10 rounded-[3rem] shadow-2xl w-[400px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="w-12 h-12 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center mb-6"><Lock size={24}/></div>
              <h3 className="text-2xl font-black mb-2">Admin Access</h3>
              <p className="text-slate-400 text-sm mb-8">Enter Devoops Team credentials.</p>
              <form onSubmit={handleLogin} className="space-y-4">
                <input type="password" placeholder="Password" value={passInput} onChange={(e) => setPassInput(e.target.value)} className="w-full bg-slate-50 border rounded-2xl p-4 outline-none focus:ring-2 focus:ring-orange-500 font-bold" autoFocus />
                <button type="submit" className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black hover:bg-orange-500 transition-all">Verify & Open</button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Cart Drawer & Floating Button omitted for brevity, but same as previous version */}
    </div>
  );
}

// --- COMPONENTS ---

const Home = () => {
  const { setShowLogin, isAdmin } = useOutletContext();
  const navigate = useNavigate();

  return (
    <div className="max-w-6xl mx-auto text-center flex flex-col items-center justify-center min-h-[70vh]">
      <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-600 px-4 py-1.5 rounded-full text-[9px] font-black tracking-widest uppercase border border-orange-100 mb-6"><TrendingUp size={12} /> Smart Digital Canteen System</div>
      <h1 className="text-7xl font-black text-slate-900 tracking-tighter mb-4 leading-tight">Ziion J's <span className="text-orange-500">Kitchenette</span></h1>
      <p className="text-slate-400 font-medium mb-20 max-w-2xl mx-auto text-lg leading-relaxed text-balance">Real-time canteen automation for Devoops Team.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 text-left w-full max-w-4xl">
        <Link to="/menu" className="bg-white border p-12 rounded-[3.5rem] shadow-sm hover:shadow-2xl transition-all group">
          <div className="bg-slate-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-8"><Utensils size={28} className="text-orange-500" /></div>
          <h3 className="text-3xl font-black mb-3">Customer Perspective</h3>
          <span className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-orange-500">Start Ordering <ArrowRight size={16} /></span>
        </Link>
        <button onClick={() => isAdmin ? navigate("/admin") : setShowLogin(true)} className="bg-[#0F172A] p-12 rounded-[3.5rem] shadow-sm hover:shadow-2xl transition-all group text-left text-white">
          <div className="bg-white/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-8"><LayoutDashboard size={28} className="text-orange-400" /></div>
          <h3 className="text-3xl font-black mb-3">AI Forecast Dashboard</h3>
          <span className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-orange-400">View Analytics <ArrowRight size={16} /></span>
        </button>
      </div>
    </div>
  );
};

const ForecastDashboard = () => {
  const [inventory, setInventory] = useState([]);
  const fetchInventory = async () => { const { data } = await supabase.from('inventory').select('*'); setInventory(data || []); };
  useEffect(() => { fetchInventory(); }, []);

  const totalCost = inventory.reduce((acc, i) => acc + (Math.max(0, i.predicted_demand - i.current_stock) * i.cost_per_unit), 0);
  const categoryData = [{ name: 'Main', value: 40, color: '#f97316' }, { name: 'Sides', value: 30, color: '#3b82f6' }, { name: 'Desserts', value: 20, color: '#22c55e' }, { name: 'Drinks', value: 10, color: '#a855f7' }];

  const handleRestock = async (item) => {
    const amt = Math.max(0, item.predicted_demand - item.current_stock);
    await supabase.from('inventory').update({ current_stock: item.current_stock + amt }).eq('id', item.id);
    fetchInventory();
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20">
      <header className="flex justify-between items-start">
        <div><h2 className="text-4xl font-black tracking-tight">Forecast Dashboard</h2><p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-2">AI-powered recommendations</p></div>
        <button className="bg-orange-500 text-white px-6 py-3 rounded-2xl font-black flex items-center gap-2 shadow-lg"><TrendingUp size={18} /> Export CSV</button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: "Restock Cost", val: `₱${totalCost.toLocaleString()}`, icon: Banknote, color: "text-emerald-500" },
          { label: "Low Stock Items", val: inventory.filter(i => i.current_stock < i.predicted_demand).length, icon: Package, color: "text-blue-500" },
          { label: "Critical Stock", val: inventory.filter(i => (i.current_stock/i.predicted_demand) < 0.5).length, icon: AlertTriangle, color: "text-rose-500" },
          { label: "Accuracy", val: "94.2%", icon: TrendingUp, color: "text-purple-500" }
        ].map((c, i) => (
          <div key={i} className="bg-white p-8 rounded-[2.5rem] border shadow-sm">
            <div className={`p-3 rounded-2xl bg-slate-50 w-fit mb-4 ${c.color}`}><c.icon size={24} /></div>
            <p className="text-[10px] font-black uppercase text-slate-400">{c.label}</p>
            <p className="text-3xl font-black text-slate-900">{c.val}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 bg-white rounded-[3rem] border p-10 shadow-sm">
          <h3 className="text-2xl font-black mb-10">Inventory Forecast</h3>
          <table className="w-full text-left">
            <thead><tr className="text-[10px] font-black text-slate-300 uppercase border-b"><th className="pb-6">Item</th><th className="pb-6">Current</th><th className="pb-6">Predicted</th><th className="pb-6">Action</th></tr></thead>
            <tbody className="divide-y divide-slate-50">
              {inventory.map(item => (
                <tr key={item.id}>
                  <td className="py-6 font-bold">{item.item_name}</td>
                  <td className="py-6 font-black text-slate-400">{item.current_stock}{item.unit}</td>
                  <td className="py-6 font-black text-emerald-500">↗ {item.predicted_demand}{item.unit}</td>
                  <td className="py-6">
                    {item.current_stock < item.predicted_demand ? 
                      <button onClick={() => handleRestock(item)} className="bg-orange-100 text-orange-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-orange-500 hover:text-white transition-all">Restock</button> : 
                      <span className="text-slate-300 text-[10px] font-black uppercase">Optimal</span>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="bg-white rounded-[3rem] border p-10 shadow-sm">
          <h3 className="text-xl font-black mb-8">Categories</h3>
          <div className="h-64"><ResponsiveContainer><PieChart><Pie data={categoryData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">{categoryData.map((e, idx) => (<Cell key={idx} fill={e.color} />))}</Pie><RechartsTooltip /></PieChart></ResponsiveContainer></div>
        </div>
      </div>
    </div>
  );
};

// --- REST OF COMPONENTS (Kitchen, CustomerMenu, Feedback, Success, Checkout) ---
// Note: These remain the same as the previous full version provided.

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="menu" element={<CustomerMenu />} />
          <Route path="kitchen" element={<Kitchen />} />
          <Route path="feedback" element={<Feedback />} />
          <Route path="admin" element={<ForecastDashboard />} />
          <Route path="*" element={<Home />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}