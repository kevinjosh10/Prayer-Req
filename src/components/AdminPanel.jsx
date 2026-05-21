import { useState, useEffect } from 'react';
import { listenToPrayerRequests, markAsPrayed, deletePrayerRequest } from '../firebase/api';
import { Lock, ArrowLeft, Heart, Search, CheckCircle, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const [requests, setRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('All'); // All, Unprayed, Prayed
  
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const unsubscribe = listenToPrayerRequests((data) => {
      setRequests(data);
    });
    
    return () => unsubscribe();
  }, [isAuthenticated]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === 'KEVZ123') {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Incorrect password.');
    }
  };

  const handleTogglePrayed = async (id, currentStatus) => {
    await markAsPrayed(id, !currentStatus);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this prayer request?")) {
      await deletePrayerRequest(id);
    }
  };

  const filteredRequests = requests.filter(req => {
    const matchesSearch = req.request.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          req.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          req.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === 'Unprayed') return matchesSearch && !req.prayedFor;
    if (filter === 'Prayed') return matchesSearch && req.prayedFor;
    return matchesSearch;
  });

  const todayCount = requests.filter(r => {
    const today = new Date().setHours(0,0,0,0);
    const reqDate = new Date(r.createdAt).setHours(0,0,0,0);
    return today === reqDate;
  }).length;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 relative">
        <div className="absolute inset-0 z-[-1] bg-[#09090b]">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-zinc-800 rounded-full blur-[120px] opacity-20 pointer-events-none"></div>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-3xl p-8 md:p-10 w-full max-w-md shadow-2xl"
        >
          <Link to="/" className="text-zinc-500 hover:text-zinc-300 inline-flex items-center gap-2 mb-8 transition-colors text-sm">
            <ArrowLeft size={16} /> Back Home
          </Link>
          
          <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center mb-6">
            <Lock size={20} className="text-zinc-400" />
          </div>
          <h1 className="text-2xl font-medium mb-2">Admin Access</h1>
          <p className="text-zinc-400 font-light text-sm mb-8">Enter the password to view the prayer room.</p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-200 focus:outline-none focus:border-zinc-600 transition-all placeholder:text-zinc-600"
              />
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button type="submit" className="w-full bg-zinc-100 text-zinc-900 rounded-xl py-3 font-medium hover:bg-white transition-all">
              Unlock
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100">
      <header className="border-b border-white/5 bg-[#09090b]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-zinc-500 hover:text-zinc-300 transition-colors">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="font-medium text-lg tracking-wide">Prayer Room</h1>
          </div>
          <div className="text-sm text-zinc-500">
            {todayCount} new today
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="glass-card p-5 rounded-2xl">
            <p className="text-zinc-500 text-sm mb-1">Total Requests</p>
            <p className="text-2xl font-medium">{requests.length}</p>
          </div>
          <div className="glass-card p-5 rounded-2xl">
            <p className="text-zinc-500 text-sm mb-1">Today</p>
            <p className="text-2xl font-medium text-[var(--color-gold-400)]">{todayCount}</p>
          </div>
          <div className="glass-card p-5 rounded-2xl">
            <p className="text-zinc-500 text-sm mb-1">Unprayed</p>
            <p className="text-2xl font-medium">{requests.filter(r => !r.prayedFor).length}</p>
          </div>
          <div className="glass-card p-5 rounded-2xl">
            <p className="text-zinc-500 text-sm mb-1">Prayed For</p>
            <p className="text-2xl font-medium text-green-500">{requests.filter(r => r.prayedFor).length}</p>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row gap-4 mb-8 justify-between">
          <div className="relative max-w-md w-full">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input 
              type="text" 
              placeholder="Search prayers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-zinc-200 focus:outline-none focus:border-zinc-600 transition-all text-sm"
            />
          </div>
          
          <div className="flex gap-2 bg-zinc-900/50 p-1 rounded-xl border border-zinc-800 w-fit">
            {['All', 'Unprayed', 'Prayed'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-lg text-sm transition-all ${filter === f ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Requests List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredRequests.map((req) => (
              <motion.div
                key={req.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`p-6 rounded-2xl border transition-all ${req.prayedFor ? 'bg-zinc-900/30 border-zinc-800/50 opacity-70' : 'glass-card border-zinc-800/50'}`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-medium text-zinc-200">{req.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-zinc-500">{new Date(req.createdAt).toLocaleDateString()}</span>
                      <span className="w-1 h-1 rounded-full bg-zinc-700"></span>
                      <span className="text-xs text-[var(--color-gold-500)] bg-[var(--color-gold-500)]/10 px-2 py-0.5 rounded-full">{req.category}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleDelete(req.id)}
                    className="text-zinc-600 hover:text-red-400 transition-colors p-1"
                    title="Delete request"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                
                <p className="text-zinc-300 font-light text-sm leading-relaxed mb-6 whitespace-pre-wrap">
                  {req.request}
                </p>
                
                <div className="mt-auto border-t border-zinc-800/50 pt-4 flex justify-end">
                  <button
                    onClick={() => handleTogglePrayed(req.id, req.prayedFor)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      req.prayedFor 
                        ? 'bg-zinc-800 text-green-500 hover:bg-zinc-700' 
                        : 'bg-[var(--color-gold-500)]/10 text-[var(--color-gold-400)] hover:bg-[var(--color-gold-500)]/20'
                    }`}
                  >
                    {req.prayedFor ? <CheckCircle size={16} /> : <Heart size={16} />}
                    {req.prayedFor ? 'Prayed For' : 'Mark as Prayed'}
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {filteredRequests.length === 0 && (
            <div className="col-span-full py-20 text-center text-zinc-500">
              <Heart size={48} className="mx-auto mb-4 opacity-20" />
              <p>No prayer requests found.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
