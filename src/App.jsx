import React, { useState, useMemo, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation, Outlet, useOutletContext } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Utensils, LayoutDashboard, ChefHat, Package, MessageSquare, 
  Store, QrCode, Search, Star, Plus, Minus, Clock, 
  ArrowRight, ShoppingCart, ChevronRight, X, Trash2,
  ChevronLeft, CreditCard, Wallet, Banknote, ShieldCheck,
  Loader2, CheckCircle2, ChevronDown, TrendingUp
} from 'lucide-react';

// IMPORT YOUR SUPABASE CLIENT
import { supabase } from './supabaseClient';

// --- MOCK DATA (Local Images) ---
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
  const [cart, setCart] = useState([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [orderStatus, setOrderStatus] = useState('none'); 

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

  const resetOrder = () => { setCart([]); setOrderStatus('none'); };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans">
      <aside className="w-64 bg-white border-r border-slate-200 p-6 flex flex-col fixed h-full z-20">
        <Link to="/" onClick={resetOrder} className="flex items-center gap-3 mb-10 group">
          <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg transition-transform group-hover:rotate-12"><Utensils className="text-white w-6 h-6" /></div>
          <div><h1 className="font-bold text-xl leading-none">Ziion J's</h1><p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Kitchenette</p></div>
        </Link>
        <nav className="space-y-1 flex-1">
          {[{ name: "Customer Menu", path: "/menu", icon: Utensils },
            { name: "Forecast Dashboard", path: "/admin", icon: LayoutDashboard },
            { name: "Kitchen Display", path: "/kitchen", icon: ChefHat },
            { name: "Inventory", path: "/inventory", icon: Package },
            { name: "Feedback", path: "/feedback", icon: MessageSquare },
            { name: "POS Interface", path: "/pos", icon: Store }].map((item) => (
            <Link key={item.path} to={item.path} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm ${location.pathname === item.path ? 'bg-orange-50 text-orange-600 border border-orange-100' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
              <item.icon size={18} /> {item.name}
            </Link>
          ))}
        </nav>
      </aside>

      <main className="flex-1 ml-64 p-12">
        <AnimatePresence mode="wait">
          {orderStatus === 'success' ? (
            <SuccessView onOrderMore={resetOrder} onGiveFeedback={() => setOrderStatus('feedback')} />
          ) : orderStatus === 'checkout' ? (
            <CheckoutView cart={cart} subtotal={subtotal} onBack={() => setOrderStatus('none')} onConfirm={() => setOrderStatus('success')} />
          ) : (
            <motion.div key={location.pathname} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}><Outlet context={{ addToCart }} /></motion.div>
          )}
        </AnimatePresence>

        {/* Floating Cart Button */}
        <AnimatePresence>
          {cart.length > 0 && location.pathname === '/menu' && orderStatus === 'none' && !isDrawerOpen && (
            <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }} className="fixed bottom-10 right-10 z-40 bg-white border border-orange-100 rounded-[2.5rem] p-3 pl-6 pr-3 shadow-2xl flex items-center gap-8 ring-4 ring-orange-500/5">
              <div className="flex items-center gap-4 border-r border-slate-100 pr-8">
                <div className="relative bg-orange-50 p-3 rounded-2xl text-orange-600"><ShoppingCart size={24} /><span className="absolute -top-2 -right-2 bg-slate-900 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">{totalItems}</span></div>
                <div><p className="text-2xl font-black text-slate-900 leading-none">₱{subtotal}</p></div>
              </div>
              <button onClick={() => setIsDrawerOpen(true)} className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-[1.8rem] font-black text-sm flex items-center gap-3 transition-all shadow-lg">Review Cart <ChevronRight size={18} /></button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Cart Drawer */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsDrawerOpen(false)} className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40" />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="fixed right-0 top-0 h-full w-[450px] bg-white z-50 shadow-2xl flex flex-col p-10">
              <div className="flex justify-between items-center mb-10"><h2 className="text-3xl font-black">Your Order</h2><button onClick={() => setIsDrawerOpen(false)} className="p-2 hover:bg-slate-50 rounded-full"><X size={24} /></button></div>
              <div className="flex-1 overflow-y-auto pr-2 space-y-8">
                {cart.map(item => (
                  <div key={item.id} className="flex gap-6 items-start">
                    <div className="w-24 h-24 bg-slate-100 rounded-3xl overflow-hidden"><img src={item.img} className="w-full h-full object-cover" /></div>
                    <div className="flex-1">
                      <h4 className="font-bold text-xl">{item.name}</h4><p className="text-orange-500 font-black">₱{item.price}</p>
                      <div className="flex items-center gap-4 mt-4">
                        <div className="flex items-center bg-slate-50 rounded-xl p-1 border">
                          <button onClick={() => updateQty(item.id, -1)} className="p-1.5"><Minus size={14}/></button>
                          <span className="w-8 text-center font-bold">{item.qty}</span>
                          <button onClick={() => updateQty(item.id, 1)} className="p-1.5"><Plus size={14}/></button>
                        </div>
                        <button onClick={() => removeFromCart(item.id)} className="text-rose-400 hover:text-rose-600"><Trash2 size={18} /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-10 pt-10 border-t border-slate-100">
                <div className="flex justify-between items-end"><h3 className="text-3xl font-black">Total</h3><h3 className="text-3xl font-black">₱{subtotal}</h3></div>
                <button onClick={() => { setIsDrawerOpen(false); setOrderStatus('checkout'); }} className="w-full bg-[#0F172A] text-white py-6 rounded-[2rem] font-black text-lg mt-8 shadow-2xl transition-all active:scale-95">Place Order</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- COMPONENTS ---

const CustomerMenu = () => {
  const { addToCart } = useOutletContext();
  const [search, setSearch] = useState('');
  const filtered = MENU_ITEMS.filter(i => i.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="max-w-6xl mx-auto pb-40">
      <header className="flex justify-between items-end mb-12"><div><h2 className="text-4xl font-black tracking-tight">Our Menu</h2><p className="text-slate-400 font-bold uppercase text-xs tracking-widest">Fresh & Authentic</p></div><div className="relative w-80"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} /><input type="text" placeholder="Search..." value={search} onChange={(e)=>setSearch(e.target.value)} className="w-full bg-white border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:ring-4 focus:ring-orange-500/10 shadow-sm" /></div></header>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {filtered.map(item => (
          <div key={item.id} className="bg-white rounded-[2.5rem] border border-slate-100 p-2 shadow-sm hover:shadow-2xl transition-all group">
            <div className="relative h-48 bg-slate-100 rounded-[2rem] overflow-hidden"><img src={item.img} className="w-full h-full object-cover transition-transform group-hover:scale-110" /></div>
            <div className="p-6">
              <div className="flex justify-between items-start mb-2"><h4 className="font-bold text-slate-800 text-lg">{item.name}</h4><div className="flex items-center gap-1 text-[10px] font-black text-orange-400 mt-1"><Star size={12} fill="currentColor" /> {item.rating}</div></div>
              <p className="text-slate-400 text-[11px] mb-8 line-clamp-2 leading-relaxed">{item.desc}</p>
              <div className="flex justify-between items-center pt-4 border-t border-slate-50">
                <span className="text-lg font-black text-slate-900">₱{item.price}</span>
                <button onClick={() => addToCart(item)} className="bg-[#0F172A] text-white p-3 rounded-2xl hover:bg-orange-500 transition-all active:scale-90"><Plus size={18} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- CHECKOUT VIEW (WITH SUPABASE INTEGRATION) ---
const CheckoutView = ({ cart, subtotal, onBack, onConfirm }) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleConfirm = async () => {
    setIsProcessing(true);
    try {
      // SAVE TO SUPABASE
      const { data, error } = await supabase
        .from('orders')
        .insert([{ 
          items: cart, 
          total: subtotal, 
          table_number: 'T-04', 
          status: 'pending' 
        }]);

      if (error) throw error;
      onConfirm(); // Success screen
    } catch (err) {
      console.error(err);
      alert("Error connecting to Supabase: " + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="max-w-6xl mx-auto">
      <button onClick={onBack} className="flex items-center gap-2 text-slate-400 font-bold mb-10"><ChevronLeft size={16} /> Back to Menu</button>
      <div className="flex gap-12 items-start">
        <div className="flex-1 space-y-16">
          <section><h2 className="text-3xl font-black mb-8">Payment Method</h2><div className="grid grid-cols-3 gap-6"><div className="p-8 rounded-[2.5rem] border-2 border-orange-500 bg-white"><Banknote size={24} className="mb-4 text-orange-500"/> <h4 className="font-bold text-sm">Pay at Cashier</h4><p className="text-[10px] text-orange-500 font-bold uppercase">Default</p></div></div></section>
          <section><h2 className="text-3xl font-black mb-8">Table Information</h2><div className="bg-white border p-10 rounded-[3rem] shadow-sm flex items-center gap-5"><ShieldCheck size={28} className="text-emerald-500"/><div><h4 className="text-xl font-bold">Table T-04</h4><p className="text-slate-400 text-sm">Automatically detected via QR scan</p></div></div></section>
        </div>
        <aside className="w-[400px] sticky top-12"><div className="bg-white border rounded-[3rem] p-10 shadow-2xl space-y-8"><h3 className="text-2xl font-black">Summary</h3><div className="flex justify-between items-center pt-8 border-t"><h3 className="text-4xl font-black">₱{subtotal}</h3></div><button onClick={handleConfirm} disabled={isProcessing} className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-400 text-white py-6 rounded-3xl font-black text-lg flex items-center justify-center gap-3 shadow-xl transition-all">{isProcessing ? <><Loader2 className="animate-spin" size={20}/> Processing...</> : <>Confirm Order <ArrowRight size={20}/></>}</button></div></aside>
      </div>
    </motion.div>
  );
};

const SuccessView = ({ onOrderMore }) => (
  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-20 text-center max-w-2xl mx-auto">
    <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-10"><CheckCircle2 size={48} /></div>
    <h1 className="text-6xl font-black tracking-tighter mb-4">Order Received!</h1>
    <p className="text-slate-400 font-medium mb-12">Your order <span className="text-slate-900 font-bold">#ZJ-9921</span> has been sent to the kitchen. You can see it on the Kitchen Display now.</p>
    <button onClick={onOrderMore} className="bg-[#0F172A] text-white px-10 py-5 rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-xl">Back to Menu</button>
  </motion.div>
);

const Kitchen = () => {
  const [dbOrders, setDbOrders] = useState([]);

  // Fetch real orders from Supabase
  useEffect(() => {
    const fetchOrders = async () => {
      const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
      setDbOrders(data || []);
    };
    fetchOrders();
    // OPTIONAL: Realtime updates (Can be added later)
  }, []);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center gap-6 mb-12"><div className="bg-slate-900 p-6 rounded-[2.5rem] text-white shadow-2xl"><ChefHat size={36}/></div><div><h2 className="text-4xl font-black tracking-tight">Kitchen Display</h2><p className="text-slate-400 font-bold mt-2 text-xs tracking-widest uppercase">Live Cloud Data</p></div></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {dbOrders.map((o) => (
          <div key={o.id} className="bg-white border-2 rounded-[3.5rem] overflow-hidden shadow-sm border-orange-100">
            <div className="p-10 border-b flex justify-between items-center"><div><h4 className="text-[10px] font-black text-slate-300 uppercase tracking-widest">ORDER #{o.id}</h4><span className="bg-slate-900 text-white text-[11px] font-black px-5 py-2 rounded-full uppercase tracking-widest">{o.table_number}</span></div><div className="bg-red-500 text-white px-5 py-3 rounded-[1.5rem] text-xs font-black"><Clock size={14}/> Active</div></div>
            <div className="p-10 space-y-4 min-h-[200px]">
              {o.items?.map((item, idx) => (<p key={idx} className="text-xl font-bold text-slate-800">{item.qty}x {item.name}</p>))}
            </div>
            <div className="p-6"><button className="w-full py-5 rounded-[2.5rem] bg-emerald-500 text-white font-black text-xs uppercase tracking-widest">Mark as Ready</button></div>
          </div>
        ))}
      </div>
    </div>
  );
};

const Home = () => (
  <div className="max-w-6xl mx-auto text-center">
    <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-600 px-4 py-1.5 rounded-full text-[9px] font-black tracking-widest uppercase border border-orange-100 mb-6"><TrendingUp size={12} /> Smart Digital Canteen System</div>
    <h1 className="text-7xl font-black text-slate-900 tracking-tighter mb-4 leading-tight">Ziion J's <span className="text-orange-500">Kitchenette</span></h1>
    <p className="text-slate-400 font-medium mb-20 max-w-2xl mx-auto text-lg leading-relaxed text-balance">Optimizing kitchen operations through data-driven forecasting and intelligent inventory management.</p>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 text-left">
      <Link to="/menu" className="bg-white border p-12 rounded-[3.5rem] shadow-sm hover:shadow-2xl transition-all group">
         <div className="bg-slate-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-8"><Utensils size={28} className="text-orange-500" /></div>
         <h3 className="text-3xl font-black mb-3 text-balance">Customer Perspective</h3>
         <p className="text-slate-400 font-medium text-sm mb-10 leading-relaxed">Browse menu, place real orders via Supabase Cloud, and get real-time status.</p>
         <span className="flex items-center gap-2 text-xs font-black uppercase tracking-widest group-hover:text-orange-500 transition-colors">Start Ordering <ArrowRight size={16} /></span>
      </Link>
      <Link to="/kitchen" className="bg-[#0F172A] p-12 rounded-[3.5rem] shadow-sm hover:shadow-2xl transition-all group text-white">
         <div className="bg-white/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-8"><ChefHat size={28} className="text-orange-400" /></div>
         <h3 className="text-3xl font-black mb-3 text-balance">Kitchen Operations</h3>
         <p className="text-white/40 font-medium text-sm mb-10 leading-relaxed text-balance">Live queue management for staff. Orders sync automatically from the cloud database.</p>
         <span className="flex items-center gap-2 text-xs font-black uppercase tracking-widest group-hover:text-orange-400 transition-colors">View Live Queue <ArrowRight size={16} /></span>
      </Link>
    </div>
  </div>
);

// --- APP ROUTING ---
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="menu" element={<CustomerMenu />} />
          <Route path="kitchen" element={<Kitchen />} />
          <Route path="*" element={<Home />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}