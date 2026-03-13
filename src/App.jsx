import React, { useState, useMemo, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation, Outlet, useOutletContext, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { 
  Utensils, LayoutDashboard, ChefHat, Package, MessageSquare, 
  Search, Star, Plus, Minus, ArrowRight, ShoppingCart, 
  ChevronRight, X, Trash2, ChevronLeft, Banknote, 
  ShieldCheck, Loader2, CheckCircle2, TrendingUp, AlertTriangle, Lock
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
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [passInput, setPassInput] = useState("");
  const [cart, setCart] = useState([]);

  const handleAdminNav = (path) => {
    if (isAdmin) navigate(path);
    else setShowLogin(true);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (passInput === "admin123") {
      setIsAdmin(true);
      setShowLogin(false);
      setPassInput("");
      navigate("/admin");
    } else {
      alert("Invalid Admin Credentials");
    }
  };

  const addToCart = (item) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) return prev.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...item, qty: 1 }];
    });
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans overflow-x-hidden">
      <aside className="w-64 bg-white border-r border-slate-200 p-6 flex flex-col fixed h-full z-20 shadow-sm">
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

      <main className="flex-1 ml-64 p-12 min-h-screen">
        <Outlet context={{ addToCart, isAdmin, setShowLogin }} />
      </main>

      {/* CENTERED ADMIN LOGIN MODAL */}
      <AnimatePresence>
        {showLogin && (
          <div className="fixed inset-0 flex items-center justify-center z-[100]">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowLogin(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative z-[110] bg-white p-10 rounded-[3rem] shadow-2xl w-full max-w-[400px] mx-4 text-center">
              <div className="w-14 h-14 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center mb-6 mx-auto"><Lock size={28}/></div>
              <h3 className="text-2xl font-black mb-2 text-slate-900">Admin Access</h3>
              <p className="text-slate-400 text-sm mb-8 font-medium">Enter credentials to unlock the dashboard.</p>
              <form onSubmit={handleLogin} className="space-y-4">
                <input type="password" placeholder="Password" value={passInput} onChange={(e) => setPassInput(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 outline-none focus:ring-4 focus:ring-orange-500/10 font-bold text-center" autoFocus />
                <button type="submit" className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black hover:bg-orange-500 transition-all shadow-lg active:scale-95">Verify Identity</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- VIEW COMPONENTS ---

const Home = () => {
  const { setShowLogin, isAdmin } = useOutletContext();
  const navigate = useNavigate();
  return (
    <div className="max-w-6xl mx-auto text-center flex flex-col items-center justify-center min-h-[70vh]">
      <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-600 px-4 py-1.5 rounded-full text-[9px] font-black tracking-widest uppercase border border-orange-100 mb-6"><TrendingUp size={12} /> Smart Digital Canteen System</div>
      <h1 className="text-7xl font-black text-slate-900 tracking-tighter mb-4 leading-tight">Ziion J's <span className="text-orange-500">Kitchenette</span></h1>
      <p className="text-slate-400 font-medium mb-20">Real-time canteen automation for Devoops Team.</p>
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

const CustomerMenu = () => {
  const { addToCart } = useOutletContext();
  const [search, setSearch] = useState('');
  const filtered = MENU_ITEMS.filter(i => i.name.toLowerCase().includes(search.toLowerCase()));
  return (
    <div className="max-w-6xl mx-auto pb-40 text-left">
      <header className="flex justify-between items-end mb-12"><div><h2 className="text-4xl font-black tracking-tight text-slate-900">Our Menu</h2><p className="text-slate-400 font-bold uppercase text-xs tracking-widest">Fresh & Authentic</p></div><div className="relative w-80"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} /><input type="text" placeholder="Search..." value={search} onChange={(e)=>setSearch(e.target.value)} className="w-full bg-white border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 text-sm shadow-sm" /></div></header>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">{filtered.map(item => (
        <div key={item.id} className="bg-white rounded-[2.5rem] border border-slate-100 p-2 shadow-sm hover:shadow-2xl transition-all group text-left">
          <div className="relative h-48 bg-slate-100 rounded-[2rem] overflow-hidden"><img src={item.img} className="w-full h-full object-cover group-hover:scale-110 transition-transform" /></div>
          <div className="p-6"><div className="flex justify-between items-start mb-2"><h4 className="font-bold text-slate-800 text-lg">{item.name}</h4><div className="flex items-center gap-1 text-[10px] font-black text-orange-400 mt-1"><Star size={12} fill="currentColor" /> {item.rating}</div></div><p className="text-slate-400 text-[11px] mb-8 line-clamp-2">{item.desc}</p>
          <div className="flex justify-between items-center pt-4 border-t border-slate-50"><span className="text-lg font-black text-slate-900">₱{item.price}</span><button onClick={() => addToCart(item)} className="bg-[#0F172A] text-white p-3 rounded-2xl hover:bg-orange-500 transition-all"><Plus size={18} /></button></div></div>
        </div>
      ))}</div>
    </div>
  );
};

const Kitchen = () => {
  const [dbOrders, setDbOrders] = useState([]);
  const fetchOrders = async () => { const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false }); setDbOrders(data || []); };
  const handleMarkReady = async (id) => { await supabase.from('orders').delete().eq('id', id); };
  useEffect(() => {
    fetchOrders();
    const channel = supabase.channel('kitchen').on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
      if (payload.eventType === 'INSERT') setDbOrders(p => [payload.new, ...p]);
      else if (payload.eventType === 'DELETE') setDbOrders(p => p.filter(o => o.id !== payload.old.id));
    }).subscribe();
    return () => supabase.removeChannel(channel);
  }, []);
  return (
    <div className="max-w-6xl mx-auto text-left">
      <div className="flex items-center gap-6 mb-12"><div className="bg-slate-900 p-6 rounded-[2.5rem] text-white shadow-2xl"><ChefHat size={36}/></div><div><h2 className="text-4xl font-black text-slate-900">Kitchen Display</h2><p className="text-emerald-500 font-bold text-xs animate-pulse">● Live WebSocket Connected</p></div></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        <AnimatePresence>{dbOrders.map(o => (
          <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} key={o.id} className="bg-white border-2 rounded-[3.5rem] overflow-hidden shadow-sm border-orange-100">
            <div className="p-10 border-b flex justify-between items-center"><div><h4 className="text-[10px] font-black text-slate-300 uppercase">ORDER #{o.id}</h4><span className="bg-slate-900 text-white text-[11px] font-black px-5 py-2 rounded-full">{o.table_number}</span></div><div className="bg-red-500 text-white px-4 py-2 rounded-2xl text-[10px] font-black uppercase">Live</div></div>
            <div className="p-10 space-y-4 min-h-[200px]">{o.items?.map((i, idx) => (<p key={idx} className="text-xl font-bold text-slate-800">{i.qty}x {i.name}</p>))}</div>
            <div className="p-6"><button onClick={() => handleMarkReady(o.id)} className="w-full py-5 rounded-[2.5rem] bg-emerald-500 text-white font-black text-xs uppercase">Mark as Ready</button></div>
          </motion.div>
        ))}</AnimatePresence>
      </div>
    </div>
  );
};

const ForecastDashboard = () => {
  const [inventory, setInventory] = useState([]);
  const fetchInventory = async () => { const { data } = await supabase.from('inventory').select('*'); setInventory(data || []); };
  useEffect(() => { fetchInventory(); }, []);
  const categoryData = [{ name: 'Main', value: 400, color: '#f97316' }, { name: 'Sides', value: 300, color: '#3b82f6' }];
  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20 text-left">
      <h2 className="text-4xl font-black text-slate-900">Forecast Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm">
          <p className="text-[10px] font-black uppercase text-slate-400">Total Items</p>
          <p className="text-3xl font-black text-slate-900">{inventory.length}</p>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm">
          <p className="text-[10px] font-black uppercase text-slate-400">Forecast Accuracy</p>
          <p className="text-3xl font-black text-emerald-500">94.2%</p>
        </div>
      </div>
      <div className="bg-white rounded-[3rem] border p-10 shadow-sm overflow-x-auto">
        <table className="w-full text-left">
          <thead><tr className="text-[10px] font-black text-slate-300 uppercase border-b"><th className="pb-6">Item</th><th className="pb-6">Current Stock</th><th className="pb-6">Predicted Demand</th></tr></thead>
          <tbody>
            {inventory.map(item => (
              <tr key={item.id} className="border-b border-slate-50 last:border-0">
                <td className="py-6 font-bold text-slate-800">{item.item_name}</td>
                <td className="py-6 font-black text-slate-400">{item.current_stock}{item.unit}</td>
                <td className="py-6 font-black text-emerald-500">↗ {item.predicted_demand}{item.unit}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const Feedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  useEffect(() => {
    const fetchFeedback = async () => { const { data } = await supabase.from('feedback').select('*').order('created_at', { ascending: false }); setFeedbacks(data || []); };
    fetchFeedback();
  }, []);
  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20 text-left">
      <h2 className="text-4xl font-black text-slate-900">Feedback Wall</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {feedbacks.map(f => (
          <div key={f.id} className="bg-white p-8 rounded-[2.5rem] border shadow-sm">
            <div className="flex gap-1 mb-4">{[...Array(5)].map((_, i) => (<Star key={i} size={14} fill={i < f.rating ? "#f97316" : "none"} stroke={i < f.rating ? "#f97316" : "#cbd5e1"} />))}</div>
            <p className="text-slate-700 font-medium">"{f.comment}"</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- APP ---
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