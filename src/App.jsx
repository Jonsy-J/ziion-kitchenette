import React, { useState, useMemo } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation, Outlet, useOutletContext, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Utensils, LayoutDashboard, ChefHat, Package, MessageSquare, 
  Store, QrCode, Search, Star, Plus, Minus, Info, Clock, 
  ArrowRight, ShoppingCart, ChevronRight, X, Trash2,
  ChevronLeft, CreditCard, Wallet, Banknote, ShieldCheck,
  Loader2, CheckCircle2, MessageCircle, ChevronDown, TrendingUp
} from 'lucide-react';

// --- 1. MOCK DATA (Updated with your local file extensions) ---
const MENU_ITEMS = [
  { 
    id: '1', name: 'Pork Adobo', category: 'Main Dish', price: 85, rating: 4.8, popular: true,
    desc: 'Classic Filipino pork stew braised in soy sauce, vinegar, and garlic.',
    img: '/images/adobo.jpg' 
  },
  { 
    id: '2', name: 'Sinigang na Baboy', category: 'Main Dish', price: 95, rating: 4.6, popular: false,
    desc: 'Sour soup with pork, vegetables, and tamarind broth.',
    img: '/images/sinigang.png'
  },
  { 
    id: '3', name: 'Lumpiang Shanghai', category: 'Side Dish', price: 45, rating: 4.9, popular: true,
    desc: 'Crispy spring rolls filled with ground pork and vegetables.',
    img: '/images/lumpia.png'
  },
  { 
    id: '4', name: 'Chicken Inasal', category: 'Grilled', price: 110, rating: 4.7, popular: false,
    desc: 'Grilled chicken marinated in calamansi, ginger, and annatto oil.',
    img: '/images/inasal.png'
  },
  { 
    id: '5', name: 'Halo-Halo', category: 'Dessert', price: 65, rating: 4.9, popular: true,
    desc: 'Shaved ice with sweetened beans, fruits, and evaporated milk.',
    img: '/images/halo-halo.png'
  },
];

// --- 2. LAYOUT COMPONENT ---
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

  const resetOrder = () => {
    setCart([]);
    setOrderStatus('none');
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans">
      <aside className="w-64 bg-white border-r border-slate-200 p-6 flex flex-col fixed h-full z-20">
        <Link to="/" onClick={resetOrder} className="flex items-center gap-3 mb-10 group">
          <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-200 transition-transform group-hover:rotate-12"><Utensils className="text-white w-6 h-6" /></div>
          <div><h1 className="font-bold text-xl leading-none tracking-tight">Ziion J's</h1><p className="text-[10px] text-slate-400 font-black tracking-widest uppercase">Kitchenette</p></div>
        </Link>
        <nav className="space-y-1 flex-1">
          {[{ name: "Customer Menu", path: "/menu", icon: Utensils },
            { name: "Forecast Dashboard", path: "/admin", icon: LayoutDashboard },
            { name: "Kitchen Display", path: "/kitchen", icon: ChefHat },
            { name: "Inventory", path: "/inventory", icon: Package },
            { name: "Feedback", path: "/feedback", icon: MessageSquare },
            { name: "POS Interface", path: "/pos", icon: Store }].map((item) => (
            <Link key={item.path} to={item.path} onClick={() => { if(item.name !== "Feedback") resetOrder(); if(item.name === "Feedback") setOrderStatus('feedback'); }} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm ${location.pathname === item.path || (item.name === "Feedback" && orderStatus === 'feedback') ? 'bg-orange-50 text-orange-600 border border-orange-100' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
              <item.icon size={18} /> {item.name}
            </Link>
          ))}
        </nav>
        <div className="bg-[#0F172A] rounded-2xl p-4 text-white mt-auto">
          <div className="flex items-center gap-2 mb-2"><QrCode size={14} className="text-orange-400"/><span className="text-[10px] font-black tracking-widest uppercase text-nowrap">QR Ordering System</span></div>
          <p className="text-[10px] text-slate-400 mb-4 leading-relaxed tracking-tight text-balance">Customers can scan the table QR code to view menu and order.</p>
          <button className="w-full bg-orange-500 hover:bg-orange-600 text-white text-[10px] font-black py-2.5 rounded-xl transition-colors uppercase">Generate QR</button>
        </div>
      </aside>

      <main className="flex-1 ml-64 p-12 relative">
        <AnimatePresence mode="wait">
          {orderStatus === 'feedback' ? (
            <FeedbackView onBack={resetOrder} />
          ) : orderStatus === 'success' ? (
            <SuccessView onOrderMore={resetOrder} onGiveFeedback={() => setOrderStatus('feedback')} />
          ) : orderStatus === 'checkout' ? (
            <CheckoutView subtotal={subtotal} onBack={() => setOrderStatus('none')} onConfirm={() => setOrderStatus('success')} />
          ) : (
            <motion.div key={location.pathname} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}><Outlet context={{ addToCart }} /></motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {cart.length > 0 && location.pathname === '/menu' && orderStatus === 'none' && !isDrawerOpen && (
            <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }} className="fixed bottom-10 right-10 z-40 bg-white border border-orange-100 rounded-[2.5rem] p-3 pl-6 pr-3 shadow-2xl flex items-center gap-8 ring-4 ring-orange-500/5">
              <div className="flex items-center gap-4 border-r border-slate-100 pr-8">
                <div className="relative bg-orange-50 p-3 rounded-2xl text-orange-600"><ShoppingCart size={24} /><span className="absolute -top-2 -right-2 bg-slate-900 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">{totalItems}</span></div>
                <div><p className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none mb-1 text-nowrap">Total Amount</p><p className="text-2xl font-black text-slate-900 leading-none">₱{subtotal}</p></div>
              </div>
              <button onClick={() => setIsDrawerOpen(true)} className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-[1.8rem] font-black text-sm flex items-center gap-3 transition-all shadow-lg shadow-orange-200">Review Cart <ChevronRight size={18} /></button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {isDrawerOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsDrawerOpen(false)} className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40" />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="fixed right-0 top-0 h-full w-[450px] bg-white z-50 shadow-2xl flex flex-col p-10">
              <div className="flex justify-between items-center mb-10"><h2 className="text-3xl font-black text-slate-900">Your Order</h2><button onClick={() => setIsDrawerOpen(false)} className="p-2 hover:bg-slate-50 rounded-full transition-colors"><X size={24} /></button></div>
              <div className="flex-1 overflow-y-auto pr-2 space-y-8 scrollbar-hide">
                {cart.map(item => (
                  <div key={item.id} className="flex gap-6 items-start">
                    <div className="w-24 h-24 bg-slate-50 rounded-3xl flex items-center justify-center border border-slate-100 overflow-hidden">
                      <img src={item.img} className="w-full h-full object-cover" alt={item.name} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-xl text-slate-900">{item.name}</h4><p className="text-orange-500 font-black text-sm mt-1">₱{item.price}</p>
                      <div className="flex items-center gap-4 mt-4">
                        <div className="flex items-center bg-slate-50 rounded-xl p-1 border border-slate-100">
                          <button onClick={() => updateQty(item.id, -1)} className="p-1.5 hover:text-orange-500"><Minus size={14}/></button>
                          <span className="w-8 text-center font-bold text-sm">{item.qty}</span>
                          <button onClick={() => updateQty(item.id, 1)} className="p-1.5 hover:text-orange-500"><Plus size={14}/></button>
                        </div>
                        <button onClick={() => removeFromCart(item.id)} className="text-rose-400 hover:text-rose-600 transition-colors"><Trash2 size={18} /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-10 pt-10 border-t border-slate-100 space-y-4">
                <div className="flex justify-between items-end mt-4"><h3 className="text-3xl font-black text-slate-900">Total</h3><h3 className="text-3xl font-black text-slate-900">₱{subtotal}</h3></div>
                <button onClick={() => { setIsDrawerOpen(false); setOrderStatus('checkout'); }} className="w-full bg-[#0F172A] text-white py-6 rounded-[2rem] font-black text-lg mt-8 shadow-2xl transition-all active:scale-95">Place Order</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- 3. PAGE COMPONENTS ---

const Home = () => {
  const modules = [
    { title: "Customer Perspective", icon: <Utensils className="text-orange-500" />, path: "/menu", desc: "Browse menu, place orders, and provide feedback.", tags: ["Digital Menu", "Order Tracking", "Feedback Form"] },
    { title: "Kitchen Staff", icon: <ChefHat className="text-blue-500" />, path: "/kitchen", desc: "Real-time order management and preparation tracking.", tags: ["Live Queue", "Status Updates", "Order Details"] },
    { title: "Administrator", icon: <LayoutDashboard className="text-emerald-500" />, path: "/admin", desc: "Demand forecasting, inventory management, and analytics.", tags: ["Sales Dashboard", "Inventory Forecast", "Sentiment Analysis"] },
    { title: "Cashier / POS", icon: <Store className="text-purple-500" />, path: "/pos", desc: "Point-of-sale transactions and checkout processing.", tags: ["Order Payment", "Sales Recording", "Manual Entry"] }
  ];

  return (
    <div className="max-w-6xl mx-auto text-center">
      <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-600 px-4 py-1.5 rounded-full text-[9px] font-black tracking-widest uppercase border border-orange-100 mb-6"><TrendingUp size={12} /> Smart Digital Canteen System</div>
      <h1 className="text-7xl font-black text-slate-900 tracking-tighter mb-4 text-balance leading-tight">Ziion J's <span className="text-orange-500">Kitchenette</span></h1>
      <p className="text-slate-400 font-medium mb-20 max-w-2xl mx-auto text-lg leading-relaxed">Optimizing kitchen operations through data-driven forecasting and intelligent inventory management.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {modules.map((m, i) => (
          <Link key={i} to={m.path} className="bg-white border border-slate-100 p-12 rounded-[3.5rem] shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all text-left group">
             <div className="bg-slate-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">{React.cloneElement(m.icon, { size: 28 })}</div>
             <h3 className="text-3xl font-black text-slate-900 mb-3">{m.title}</h3>
             <p className="text-slate-400 font-medium text-sm leading-relaxed mb-8">{m.desc}</p>
             <div className="flex flex-wrap gap-2 mb-10">{m.tags.map(tag => <span key={tag} className="bg-slate-50 text-slate-400 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider">{tag}</span>)}</div>
             <span className="flex items-center gap-2 text-xs font-black text-slate-900 uppercase tracking-[0.2em] group-hover:gap-4 transition-all group-hover:text-orange-500">Open Module <ArrowRight size={16} /></span>
          </Link>
        ))}
      </div>
    </div>
  );
};

const CustomerMenu = () => {
  const { addToCart } = useOutletContext();
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState('All');
  const filtered = MENU_ITEMS.filter(i => (cat === 'All' || i.category === cat) && i.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="max-w-6xl mx-auto pb-40">
      <header className="flex justify-between items-end mb-12"><div><h2 className="text-4xl font-black text-slate-900 tracking-tight">Our Menu</h2><p className="text-slate-400 font-bold mt-1 uppercase text-xs tracking-widest tracking-tighter leading-tight">Ziion J's • Fresh & Authentic</p></div><div className="relative w-80"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} /><input type="text" placeholder="Search..." value={search} onChange={(e)=>setSearch(e.target.value)} className="w-full bg-white border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:outline-none focus:ring-4 focus:ring-orange-500/10 shadow-sm" /></div></header>
      <div className="flex gap-3 mb-10 overflow-x-auto pb-2 scrollbar-hide">{['All', 'Main Dish', 'Side Dish', 'Grilled', 'Dessert'].map(c => (<button key={c} onClick={()=>setCat(c)} className={`px-8 py-2.5 rounded-full text-xs font-black border transition-all ${cat === c ? 'bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-200' : 'bg-white text-slate-400'}`}>{c.toUpperCase()}</button>))}</div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {filtered.map(item => (
          <div key={item.id} className="bg-white rounded-[2.5rem] border border-slate-100 p-2 shadow-sm hover:shadow-2xl transition-all group">
            <div className="relative h-48 bg-slate-100 rounded-[2rem] overflow-hidden">
              <img src={item.img} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt={item.name} />
              {item.popular && <span className="absolute top-4 left-4 bg-emerald-500 text-white text-[9px] font-black px-3 py-1.5 rounded-lg shadow-md tracking-widest uppercase">Popular</span>}
              <span className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg text-orange-600 font-black text-xs">₱{item.price}</span>
            </div>
            <div className="p-6">
              <div className="flex justify-between items-start mb-2"><h4 className="font-bold text-slate-800 text-lg mb-2 leading-tight">{item.name}</h4><div className="flex items-center gap-1 text-[10px] font-black text-orange-400 mt-1"><Star size={12} fill="currentColor" /> {item.rating}</div></div>
              <p className="text-slate-400 text-[11px] mb-8 line-clamp-2 leading-relaxed">{item.desc}</p>
              <div className="flex justify-between items-center pt-4 border-t border-slate-50">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{item.category}</span>
                <button onClick={() => addToCart(item)} className="bg-[#0F172A] text-white p-3 rounded-2xl hover:bg-orange-500 transition-all shadow-xl active:scale-90"><Plus size={18} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const FeedbackView = ({ onBack }) => {
  const [rating, setRating] = useState(0);
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto text-center pb-20">
      <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-600 px-4 py-1.5 rounded-full text-[9px] font-black tracking-widest uppercase border border-orange-100 mb-8"><MessageSquare size={12} /> ZiionSmart Feedback</div>
      <h1 className="text-6xl font-black text-slate-900 tracking-tighter mb-4">How was your <span className="text-orange-500">Meal?</span></h1>
      <p className="text-slate-400 font-medium mb-16 max-w-lg mx-auto leading-relaxed text-lg text-pretty">Your ratings directly influence our weekly market purchases and menu adjustments.</p>
      <div className="bg-white border border-slate-100 rounded-[3.5rem] p-16 shadow-sm space-y-16 text-left">
        <section className="text-center">
          <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] mb-10 block">Overall Experience</label>
          <div className="flex justify-center gap-6">{[1, 2, 3, 4, 5].map((star) => (<button key={star} onClick={() => setRating(star)} className="transition-all hover:scale-125 group"><Star size={56} className={`transition-colors ${star <= rating ? 'text-orange-400 fill-orange-400' : 'text-slate-300 group-hover:text-orange-200'}`} strokeWidth={2}/></button>))}</div>
        </section>
        <section className="space-y-4">
          <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">Specific Dish (Optional)</label>
          <div className="w-full bg-slate-50 border border-slate-200 rounded-3xl p-7 flex justify-between items-center cursor-pointer transition-colors"><span className="text-slate-900 font-bold text-lg">Which dish did you order?</span><ChevronDown size={24} className="text-slate-400" /></div>
        </section>
        <section className="space-y-4">
          <div className="flex justify-between items-center"><label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">Your Comments</label><span className="bg-orange-100 text-orange-600 text-[9px] font-black px-3 py-1 rounded-lg uppercase tracking-widest">AI Analysis Active</span></div>
          <div className="relative group"><textarea placeholder="Tell us what you loved..." className="w-full bg-slate-50 border border-slate-200 rounded-[2.5rem] p-10 text-lg text-slate-900 focus:outline-none focus:ring-8 focus:ring-orange-500/5 focus:bg-white transition-all min-h-[200px] resize-none" /><div className="absolute bottom-8 right-10 flex items-center gap-3"><div className="w-2.5 h-2.5 rounded-full bg-orange-400 animate-pulse shadow-sm shadow-orange-100" /><span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Sentiment Stream</span></div></div>
        </section>
        <button onClick={onBack} className="w-full bg-[#0F172A] text-white py-7 rounded-[2rem] font-black text-xl shadow-2xl hover:bg-slate-800 transition-all flex items-center justify-center gap-3 active:scale-95">Submit Feedback <CheckCircle2 size={24} /></button>
      </div>
    </motion.div>
  );
};

const SuccessView = ({ onOrderMore, onGiveFeedback }) => (
  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-20 text-center max-w-2xl mx-auto">
    <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-10 ring-8 ring-emerald-50"><CheckCircle2 size={48} /></div>
    <h1 className="text-6xl font-black text-slate-900 tracking-tighter mb-4 text-balance">Order Received!</h1>
    <p className="text-slate-400 font-medium mb-12 text-pretty">Your order <span className="text-slate-900 font-bold">#ZJ-9921</span> has been sent to the kitchen. You'll receive a notification when it's ready.</p>
    <div className="bg-white border border-slate-100 rounded-[3rem] p-10 w-full mb-12 space-y-6 text-left shadow-sm">
      <div className="flex items-center gap-4 text-slate-700 font-bold"><Clock className="text-orange-500" size={20}/> Estimated prep time: 15-20 mins</div>
      <div className="flex items-center gap-4 text-slate-700 font-bold"><Store className="text-orange-500" size={20}/> Table Number: T-04</div>
    </div>
    <div className="flex gap-4">
      <button onClick={onOrderMore} className="bg-[#0F172A] text-white px-10 py-5 rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-xl">Order More</button>
      <button onClick={onGiveFeedback} className="bg-orange-500 text-white px-10 py-5 rounded-2xl font-bold hover:bg-orange-600 shadow-xl shadow-orange-100 transition-all">Give Feedback</button>
    </div>
  </motion.div>
);

const CheckoutView = ({ subtotal, onBack, onConfirm }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [method, setMethod] = useState('cash');
  const handleConfirm = () => { setIsProcessing(true); setTimeout(() => { setIsProcessing(false); onConfirm(); }, 1500); };
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="max-w-6xl mx-auto">
      <button onClick={onBack} className="flex items-center gap-2 text-slate-400 font-bold text-sm hover:text-orange-500 transition-colors mb-10"><ChevronLeft size={16} /> Back to Menu</button>
      <div className="flex gap-12 items-start">
        <div className="flex-1 space-y-16">
          <section><h2 className="text-3xl font-black text-slate-900 mb-8 tracking-tight">Payment Method</h2><div className="grid grid-cols-3 gap-6"><PaymentCard active={method === 'cash'} onClick={() => setMethod('cash')} icon={<Banknote size={24}/>} label="Pay at Cashier" sub="Pay after dining" color="orange" /><PaymentCard active={method === 'card'} onClick={() => setMethod('card')} icon={<CreditCard size={24}/>} label="Credit Card" sub="Visa, Mastercard" color="blue" /><PaymentCard active={method === 'digital'} onClick={() => setMethod('digital')} icon={<Wallet size={24}/>} label="GCash / Maya" sub="Fast & Secure" color="purple" /></div></section>
          <section><h2 className="text-3xl font-black text-slate-900 mb-8 tracking-tight">Table Information</h2><div className="bg-white border border-slate-100 rounded-[3rem] p-10 shadow-sm space-y-8"><div className="flex items-center gap-5"><div className="bg-slate-50 p-4 rounded-2xl text-slate-900"><ShieldCheck size={28}/></div><div><h4 className="text-xl font-bold text-slate-800 tracking-tight">Table T-04</h4><p className="text-slate-400 text-sm font-medium">Automatically detected via QR scan</p></div></div><div className="space-y-4"><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Order Notes (Optional)</label><textarea placeholder="E.g. No onions, extra spicy, etc." className="w-full bg-slate-50 border border-slate-100 rounded-3xl p-6 text-sm min-h-[120px]" /></div></div></section>
        </div>
        <aside className="w-[400px] sticky top-12"><div className="bg-white border border-slate-50 rounded-[3rem] p-10 shadow-2xl space-y-8"><h3 className="text-2xl font-black text-slate-900 tracking-tight">Summary</h3><div className="space-y-4 text-sm font-bold text-slate-400"><div className="flex justify-between"><p>Subtotal</p><p>₱{subtotal.toFixed(2)}</p></div><div className="flex justify-between"><p>Service Fee</p><p>₱0.00</p></div></div><div className="flex justify-between items-center pt-8 border-t border-slate-50"><h3 className="text-4xl font-black text-slate-900 tracking-tighter">Total</h3><h3 className="text-4xl font-black text-slate-900 tracking-tighter">₱{subtotal.toFixed(2)}</h3></div><button onClick={handleConfirm} disabled={isProcessing} className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-400 text-white py-6 rounded-3xl font-black text-lg flex items-center justify-center gap-3 shadow-xl transition-all">{isProcessing ? <><Loader2 className="animate-spin" size={20}/> Processing...</> : <>Confirm Order <ArrowRight size={20}/></>}</button></div></aside>
      </div>
    </motion.div>
  );
};

function PaymentCard({ active, onClick, icon, label, sub, color }) {
  const activeStyles = { orange: 'bg-orange-500', blue: 'bg-blue-500', purple: 'bg-purple-500' };
  return (<button onClick={onClick} className={`p-8 rounded-[2.5rem] border-2 transition-all text-left flex flex-col items-start ${active ? 'border-orange-500 bg-white shadow-xl shadow-orange-100' : 'border-slate-100 bg-white hover:border-slate-200'}`}><div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${active ? activeStyles[color] + ' text-white' : 'bg-slate-100 text-slate-500'}`}>{icon}</div><h4 className={`font-bold text-sm mb-1 ${active ? 'text-slate-900' : 'text-slate-700'}`}>{label}</h4><p className={`text-[10px] font-bold ${active ? 'text-orange-500' : 'text-slate-500'}`}>{sub}</p></button>);
}

const AdminDashboard = () => <div className="p-10 text-4xl font-black tracking-tight text-slate-900">Forecast Dashboard Content</div>;

const Kitchen = () => (
  <div className="max-w-6xl mx-auto">
    <div className="flex items-center gap-6 mb-12">
      <div className="bg-slate-900 p-6 rounded-[2.5rem] text-white shadow-2xl"><ChefHat size={36}/></div>
      <div><h2 className="text-4xl font-black text-slate-900 tracking-tight">Kitchen Display</h2><p className="text-slate-400 font-bold mt-2 text-xs tracking-widest uppercase tracking-tighter">Live Queue Management</p></div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
      {[{id:'#101', table:'T-04', time:'57m', status:'preparing', items: ['2x Pork Adobo', '1x Lumpiang Shanghai']}, {id:'#102', table:'T-12', time:'50m', status:'pending', items: ['1x Sinigang na Baboy']}, {id:'#103', table:'T-08', time:'47m', status:'pending', items: ['1x Chicken Inasal']}].map((o, i) => (
        <div key={i} className={`bg-white border-2 rounded-[3.5rem] overflow-hidden shadow-sm transition-all ${o.status === 'preparing' ? 'border-orange-100 shadow-orange-50' : 'border-slate-50'}`}>
          <div className="p-10 border-b border-slate-50 flex justify-between items-center">
             <div><h4 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.25em] mb-2">ORDER {o.id}</h4><span className="bg-slate-900 text-white text-[11px] font-black px-5 py-2 rounded-full uppercase tracking-widest leading-none">{o.table}</span></div>
             <div className="bg-red-500 text-white px-5 py-3 rounded-[1.5rem] flex flex-col items-center shadow-lg shadow-red-100"><div className="flex items-center gap-1.5 text-xs font-black leading-none"><Clock size={14}/> {o.time}</div><span className="text-[8px] font-black tracking-widest mt-1 opacity-70 uppercase leading-none">Delayed</span></div>
          </div>
          <div className="p-10 space-y-8 min-h-[220px]">
            {o.items.map(item => (<div key={item} className="flex gap-6"><p className="text-2xl font-bold text-slate-800 tracking-tight leading-none">{item}</p></div>))}
          </div>
          <div className="p-6">
            <button className={`w-full py-5 rounded-[2.5rem] font-black text-xs uppercase tracking-[0.3em] shadow-xl transition-all ${o.status === 'preparing' ? 'bg-emerald-500 text-white hover:bg-emerald-600' : 'bg-blue-500 text-white hover:bg-blue-600'}`}>
              {o.status === 'preparing' ? 'Order Ready' : 'Start Cooking'}
            </button>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="menu" element={<CustomerMenu />} />
          <Route path="admin" element={<AdminDashboard />} />
          <Route path="kitchen" element={<Kitchen />} />
          <Route path="*" element={<Home />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}