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
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [passInput, setPassInput] = useState("");

  const handleAdminNav = (path) => {
    if (isAdmin) navigate(path);
    else setShowLogin(true);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (passInput === "admin123") { // Updated Password
      setIsAdmin(true);
      setShowLogin(false);
      setPassInput("");
      navigate("/admin");
    } else {
      alert("Invalid Admin Credentials");
    }
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
        <Outlet context={{ isAdmin, setShowLogin }} />
      </main>

      {/* CENTERED ADMIN LOGIN MODAL */}
      <AnimatePresence>
        {showLogin && (
          <div className="fixed inset-0 flex items-center justify-center z-[100]">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setShowLogin(false)} 
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" 
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.9, opacity: 0, y: 20 }} 
              className="relative z-[110] bg-white p-10 rounded-[3rem] shadow-2xl w-full max-w-[400px] mx-4"
            >
              <div className="w-14 h-14 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center mb-6 mx-auto"><Lock size={28}/></div>
              <h3 className="text-2xl font-black mb-2 text-center text-slate-900">Admin Access</h3>
              <p className="text-slate-400 text-sm mb-8 text-center font-medium">Enter credentials to unlock the dashboard.</p>
              <form onSubmit={handleLogin} className="space-y-4">
                <input 
                  type="password" 
                  placeholder="Password" 
                  value={passInput} 
                  onChange={(e) => setPassInput(e.target.value)} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 outline-none focus:ring-4 focus:ring-orange-500/10 font-bold text-center" 
                  autoFocus 
                />
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
      <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-600 px-4 py-1.5 rounded-full text-[9px] font-black tracking-widest uppercase border border-orange-100 mb-6">
        <TrendingUp size={12} /> Smart Digital Canteen System
      </div>
      <h1 className="text-7xl font-black text-slate-900 tracking-tighter mb-4 leading-tight">
        Ziion J's <span className="text-orange-500">Kitchenette</span>
      </h1>
      <p className="text-slate-400 font-medium mb-20 max-w-2xl mx-auto text-lg leading-relaxed text-balance">
        Real-time canteen automation for Devoops Team.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 text-left w-full max-w-4xl">
        <Link to="/menu" className="bg-white border p-12 rounded-[3.5rem] shadow-sm hover:shadow-2xl transition-all group">
          <div className="bg-slate-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-8"><Utensils size={28} className="text-orange-500" /></div>
          <h3 className="text-3xl font-black mb-3 text-slate-900">Customer Perspective</h3>
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

// ... Rest of the components (CustomerMenu, Kitchen, ForecastDashboard, Feedback) ...
// Ensure they all use useOutletContext correctly.

const App = () => (
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

export default App;