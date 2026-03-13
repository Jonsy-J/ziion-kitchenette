import React, { useState, useMemo, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation, Outlet, useOutletContext } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { 
  Utensils, LayoutDashboard, ChefHat, Package, MessageSquare, 
  Store, Search, Star, Plus, Minus, Clock, 
  ArrowRight, ShoppingCart, ChevronRight, X, Trash2,
  ChevronLeft, Banknote, ShieldCheck,
  Loader2, CheckCircle2, TrendingUp, AlertTriangle
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
          <div><h1 className="font-bold text-xl leading-none text-slate-900">Ziion J's</h1><p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Kitchenette</p></div>
        </Link>
        <nav className="space-y-1 flex-1">
          {[{ name: "Customer Menu", path: "/menu", icon: Utensils },
            { name: "Forecast Dashboard", path: "/admin", icon: LayoutDashboard },
            { name: "Kitchen Display", path: "/kitchen", icon: ChefHat },
            { name: "Feedback", path: "/feedback", icon: MessageSquare }].map((item) => (
            <Link key={item.path} to={item.path} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm ${location.pathname === item.path ? 'bg-orange-50 text-orange-600 border border-orange-100' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
              <item.icon size={18} /> {item.name}
            </Link>
          ))}
        </nav>
      </aside>

      <main className="flex-1 ml-64 p-12">
        <AnimatePresence mode="wait">
          {orderStatus === 'success' ? (
            <SuccessView onOrderMore={resetOrder} />
          ) : orderStatus === 'checkout' ? (
            <CheckoutView cart={cart} subtotal={subtotal} onBack={() => setOrderStatus('none')} onConfirm={() => setOrderStatus('success')} />
          ) : (
            <motion.div key={location.pathname} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}><Outlet context={{ addToCart }} /></motion.div>
          )}
        </AnimatePresence>

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
                <div className="flex justify-between items-end"><h3 className="text-3xl font-black text-slate-900">Total</h3><h3 className="text-3xl font-black text-slate-900">₱{subtotal}</h3></div>
                <button onClick={() => { setIsDrawerOpen(false); setOrderStatus('checkout'); }} className="w-full bg-[#0F172A] text-white py-6 rounded-[2rem] font-black text-lg mt-8 shadow-2xl transition-all active:scale-95">Place Order</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- SUB-COMPONENTS ---

const ForecastDashboard = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    const { data } = await supabase.from('inventory').select('*');
    setInventory(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const totalRestockCost = inventory.reduce((acc, item) => {
    const restockAmt = Math.max(0, item.predicted_demand - item.current_stock);
    return acc + (restockAmt * item.cost_per_unit);
  }, 0);

  const categoryData = [
    { name: 'Main Dishes', value: 400, color: '#f97316' },
    { name: 'Side Dishes', value: 300, color: '#3b82f6' },
    { name: 'Desserts', value: 300, color: '#22c55e' },
    { name: 'Drinks', value: 200, color: '#a855f7' },
  ];

  const handleRestock = async (item) => {
    const restockAmt = Math.max(0, item.predicted_demand - item.current_stock);
    const { error } = await supabase.from('inventory').update({ current_stock: item.current_stock + restockAmt }).eq('id', item.id);
    if (!error) { fetchDashboardData(); }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20">
      <header className="flex justify-between items-start">
        <div><h2 className="text-4xl font-black tracking-tight text-slate-900">Forecast Dashboard</h2><p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-2">AI-powered inventory forecasting</p></div>
        <button className="bg-orange-500 text-white px-6 py-3 rounded-2xl font-black flex items-center gap-2 shadow-lg"><TrendingUp size={18} /> Export CSV</button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: "Total Restock Cost", val: `₱${totalRestockCost.toLocaleString()}`, icon: Banknote, color: "text-emerald-500", trend: "+12.5%" },
          { label: "Items to Restock", val: inventory.filter(i => i.current_stock < i.predicted_demand).length, icon: Package, color: "text-blue-500", trend: "+3 items" },
          { label: "Critical Priority", val: inventory.filter(i => (i.current_stock / i.predicted_demand) < 0.5).length, icon: AlertTriangle, color: "text-rose-500", trend: "Urgent" },
          { label: "Forecast Accuracy", val: "94.2%", icon: TrendingUp, color: "text-purple-500", trend: "+2.1%" }
        ].map((card, i) => (
          <div key={i} className="bg-white p-8 rounded-[2.5rem] border shadow-sm space-y-4">
            <div className="flex justify-between items-start"><div className={`p-3 rounded-2xl bg-slate-50 ${card.color}`}><card.icon size={24} /></div><span className={`text-[10px] font-black ${card.color}`}>{card.trend}</span></div>
            <div><p className="text-[10px] font-black uppercase text-slate-400">{card.label}</p><p className="text-3xl font-black text-slate-900">{card.val}</p></div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 bg-white rounded-[3rem] border shadow-sm p-10">
          <div className="flex justify-between items-center mb-10"><h3 className="text-2xl font-black text-slate-900">Inventory Restock Forecast</h3><span className="bg-orange-50 text-orange-500 px-4 py-1.5 rounded-full text-[10px] font-black uppercase">ML-Powered</span></div>
          <table className="w-full text-left">
            <thead><tr className="text-[10px] font-black text-slate-300 uppercase border-b"><th className="pb-6">Item</th><th className="pb-6 text-center">Current</th><th className="pb-6 text-center">Predicted</th><th className="pb-6 text-center">Action</th></tr></thead>
            <tbody className="divide-y divide-slate-50">
              {inventory.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-all">
                  <td className="py-6 font-bold text-slate-800">{item.item_name}</td>
                  <td className="py-6 text-center font-black text-slate-400">{item.current_stock}{item.unit}</td>
                  <td className="py-6 text-center font-black text-emerald-500">↗ {item.predicted_demand}{item.unit}</td>
                  <td className="py-6 text-center">{item.current_stock < item.predicted_demand ? <button onClick={() => handleRestock(item)} className="bg-orange-100 text-orange-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-orange-500 hover:text-white transition-all">Restock</button> : <span className="text-slate-300 text-[10px] font-black uppercase tracking-widest">Optimized</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-white rounded-[3rem] border shadow-sm p-10">
          <h3 className="text-xl font-black mb-8 text-slate-900">Popular Categories</h3>
          <div className="h-64"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={categoryData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">{categoryData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}</Pie><RechartsTooltip /></PieChart></ResponsiveContainer></div>
          <div className="space-y-4 mt-6">{categoryData.map(cat => (<div key={cat.name} className="flex justify-between items-center text-[11px] font-bold"><div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full" style={{ background: cat.color }} /><span className="text-slate-500">{cat.name}</span></div><span className="text-slate-900">35%</span></div>))}</div>
        </div>
      </div>
    </div>
  );
};

const Kitchen = () => {
  const [dbOrders, setDbOrders] = useState([]);
  const fetchOrders = async () => {
    const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    setDbOrders(data || []);
  };
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
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center gap-6 mb-12"><div className="bg-slate-900 p-6 rounded-[2.5rem] text-white shadow-2xl"><ChefHat size={36}/></div><div><h2 className="text-4xl font-black tracking-tight text-slate-900">Kitchen Display</h2><p className="text-emerald-500 font-bold text-xs uppercase animate-pulse">● Live WebSocket Connected</p></div></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        <AnimatePresence>{dbOrders.map(o => (
          <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} key={o.id} className="bg-white border-2 rounded-[3.5rem] overflow-hidden shadow-sm border-orange-100">
            <div className="p-10 border-b flex justify-between items-center"><div><h4 className="text-[10px] font-black text-slate-300 uppercase tracking-widest">ORDER #{o.id}</h4><span className="bg-slate-900 text-white text-[11px] font-black px-5 py-2 rounded-full">{o.table_number}</span></div><div className="bg-red-500 text-white px-4 py-2 rounded-2xl text-[10px] font-black tracking-widest uppercase tracking-widest">Live</div></div>
            <div className="p-10 space-y-4 min-h-[200px]">{o.items?.map((i, idx) => (<p key={idx} className="text-xl font-bold text-slate-800">{i.qty}x {i.name}</p>))}</div>
            <div className="p-6"><button onClick={() => handleMarkReady(o.id)} className="w-full py-5 rounded-[2.5rem] bg-emerald-500 text-white font-black text-xs uppercase tracking-widest active:scale-95 transition-all">Mark as Ready</button></div>
          </motion.div>
        ))}</AnimatePresence>
      </div>
    </div>
  );
};

const CustomerMenu = () => {
  const { addToCart } = useOutletContext();
  const [search, setSearch] = useState('');
  const filtered = MENU_ITEMS.filter(i => i.name.toLowerCase().includes(search.toLowerCase()));
  return (
    <div className="max-w-6xl mx-auto pb-40">
      <header className="flex justify-between items-end mb-12"><div><h2 className="text-4xl font-black tracking-tight text-slate-900">Our Menu</h2><p className="text-slate-400 font-bold uppercase text-xs tracking-widest">Fresh & Authentic</p></div><div className="relative w-80"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} /><input type="text" placeholder="Search..." value={search} onChange={(e)=>setSearch(e.target.value)} className="w-full bg-white border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 text-sm shadow-sm" /></div></header>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">{filtered.map(item => (
        <div key={item.id} className="bg-white rounded-[2.5rem] border border-slate-100 p-2 shadow-sm hover:shadow-2xl transition-all group">
          <div className="relative h-48 bg-slate-100 rounded-[2rem] overflow-hidden"><img src={item.img} className="w-full h-full object-cover group-hover:scale-110 transition-transform" /></div>
          <div className="p-6"><div className="flex justify-between items-start mb-2"><h4 className="font-bold text-slate-800 text-lg">{item.name}</h4><div className="flex items-center gap-1 text-[10px] font-black text-orange-400 mt-1"><Star size={12} fill="currentColor" /> {item.rating}</div></div><p className="text-slate-400 text-[11px] mb-8 line-clamp-2">{item.desc}</p>
          <div className="flex justify-between items-center pt-4 border-t border-slate-50"><span className="text-lg font-black text-slate-900">₱{item.price}</span><button onClick={() => addToCart(item)} className="bg-[#0F172A] text-white p-3 rounded-2xl hover:bg-orange-500 transition-all"><Plus size={18} /></button></div></div>
        </div>
      ))}</div>
    </div>
  );
};

const CheckoutView = ({ cart, subtotal, onBack, onConfirm }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const handleConfirm = async () => {
    setIsProcessing(true);
    const { error } = await supabase.from('orders').insert([{ items: cart, total: subtotal, table_number: 'T-04', status: 'pending' }]);
    if (!error) onConfirm();
    setIsProcessing(false);
  };
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="max-w-6xl mx-auto">
      <button onClick={onBack} className="flex items-center gap-2 text-slate-400 font-bold mb-10"><ChevronLeft size={16} /> Back to Menu</button>
      <div className="flex gap-12 items-start"><div className="flex-1 space-y-16">
        <section><h2 className="text-3xl font-black mb-8 text-slate-900">Payment Method</h2><div className="grid grid-cols-3 gap-6"><div className="p-8 rounded-[2.5rem] border-2 border-orange-500 bg-white"><Banknote size={24} className="mb-4 text-orange-500"/> <h4 className="font-bold text-sm text-slate-900">Pay at Cashier</h4></div></div></section>
        <section><h2 className="text-3xl font-black mb-8 text-slate-900">Table Information</h2><div className="bg-white border p-10 rounded-[3rem] shadow-sm flex items-center gap-5"><ShieldCheck size={28} className="text-emerald-500"/><h4 className="text-xl font-bold text-slate-900">Table T-04</h4></div></section>
      </div><aside className="w-[400px] sticky top-12"><div className="bg-white border rounded-[3rem] p-10 shadow-2xl space-y-8"><h3 className="text-2xl font-black text-slate-900">Summary</h3><div className="flex justify-between items-center pt-8 border-t"><h3 className="text-4xl font-black text-slate-900">₱{subtotal}</h3></div><button onClick={handleConfirm} disabled={isProcessing} className="w-full bg-orange-500 text-white py-6 rounded-3xl font-black text-lg shadow-xl active:scale-95 transition-all">{isProcessing ? <Loader2 className="animate-spin" /> : "Confirm Order"}</button></div></aside></div>
    </motion.div>
  );
};

const SuccessView = ({ onOrderMore }) => (
  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-20 text-center max-w-2xl mx-auto">
    <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-10"><CheckCircle2 size={48} /></div>
    <h1 className="text-6xl font-black tracking-tighter mb-4 text-slate-900">Order Received!</h1>
    <button onClick={onOrderMore} className="bg-[#0F172A] text-white px-10 py-5 rounded-2xl font-bold hover:bg-slate-800 shadow-xl">Back to Menu</button>
  </motion.div>
);

const Feedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [newRating, setNewRating] = useState(5);
  const fetchFeedback = async () => { const { data } = await supabase.from('feedback').select('*').order('created_at', { ascending: false }); setFeedbacks(data || []); };
  const handleSubmit = async (e) => {
    e.preventDefault();
    const s = newRating >= 4 ? 'positive' : newRating === 3 ? 'neutral' : 'negative';
    await supabase.from('feedback').insert([{ rating: newRating, comment: newComment, sentiment: s }]);
    setNewComment(""); setNewRating(5); fetchFeedback();
  };
  useEffect(() => { fetchFeedback(); }, []);
  const avg = feedbacks.length > 0 ? (feedbacks.reduce((a,f)=>a+f.rating,0)/feedbacks.length).toFixed(1) : 0;
  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20">
      <header className="flex justify-between items-center"><div><h2 className="text-4xl font-black text-slate-900">Customer Feedback</h2><p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-2">Voice of the Customer</p></div><div className="bg-white p-6 rounded-[2rem] border shadow-sm flex items-center gap-6"><div className="text-center px-4 border-r"><p className="text-3xl font-black text-orange-500">{avg}</p><p className="text-[10px] font-black uppercase text-slate-400">Rating</p></div><div className="text-center px-4"><p className="text-3xl font-black text-slate-900">{feedbacks.length}</p><p className="text-[10px] font-black uppercase text-slate-400">Reviews</p></div></div></header>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="bg-[#0F172A] p-10 rounded-[3rem] text-white h-fit sticky top-10">
          <h3 className="text-2xl font-black mb-6">Rate your meal</h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div><p className="text-xs font-black uppercase text-slate-400 mb-3">Rating</p><div className="flex gap-2">{[1, 2, 3, 4, 5].map(n => (<button key={n} type="button" onClick={()=>setNewRating(n)} className={`w-10 h-10 rounded-xl font-black ${newRating >= n ? 'bg-orange-500 text-white' : 'bg-white/10 text-white/40'}`}><Star size={16} fill={newRating >= n ? "currentColor" : "none"} /></button>))}</div></div>
            <textarea value={newComment} onChange={(e)=>setNewComment(e.target.value)} placeholder="Your thoughts..." className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm outline-none h-32" required />
            <button className="w-full bg-orange-500 py-4 rounded-2xl font-black">Submit Review</button>
          </form>
        </div>
        <div className="lg:col-span-2 space-y-6">{feedbacks.map(f => (
          <div key={f.id} className="bg-white p-8 rounded-[2.5rem] border shadow-sm">
            <div className="flex justify-between items-start mb-4"><div className="flex gap-1">{[...Array(5)].map((_, i) => (<Star key={i} size={14} fill={i < f.rating ? "#f97316" : "none"} stroke={i < f.rating ? "#f97316" : "#cbd5e1"} />))}</div><span className="text-[10px] font-black uppercase px-3 py-1 rounded-full bg-slate-50 text-slate-500">{f.sentiment}</span></div>
            <p className="text-slate-700 font-medium leading-relaxed">"{f.comment}"</p>
          </div>
        ))}</div>
      </div>
    </div>
  );
};

const Home = () => (
  <div className="max-w-6xl mx-auto text-center">
    <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-600 px-4 py-1.5 rounded-full text-[9px] font-black tracking-widest uppercase border border-orange-100 mb-6"><TrendingUp size={12} /> Smart Digital Canteen System</div>
    <h1 className="text-7xl font-black text-slate-900 tracking-tighter mb-4 leading-tight">Ziion J's <span className="text-orange-500">Kitchenette</span></h1>
    <p className="text-slate-400 font-medium mb-20 max-w-2xl mx-auto text-lg leading-relaxed text-balance">Real-time canteen automation for Devoops Team.</p>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 text-left">
      <Link to="/menu" className="bg-white border p-12 rounded-[3.5rem] shadow-sm hover:shadow-2xl transition-all group"><div className="bg-slate-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-8"><Utensils size={28} className="text-orange-500" /></div><h3 className="text-3xl font-black mb-3 text-slate-900">Customer Perspective</h3><span className="flex items-center gap-2 text-xs font-black uppercase tracking-widest group-hover:text-orange-500">Start Ordering <ArrowRight size={16} /></span></Link>
      <Link to="/admin" className="bg-[#0F172A] p-12 rounded-[3.5rem] shadow-sm hover:shadow-2xl transition-all group text-white"><div className="bg-white/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-8"><LayoutDashboard size={28} className="text-orange-400" /></div><h3 className="text-3xl font-black mb-3">AI Forecast Dashboard</h3><span className="flex items-center gap-2 text-xs font-black uppercase tracking-widest group-hover:text-orange-400">View Analytics <ArrowRight size={16} /></span></Link>
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
          <Route path="feedback" element={<Feedback />} />
          <Route path="admin" element={<ForecastDashboard />} />
          <Route path="*" element={<Home />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}