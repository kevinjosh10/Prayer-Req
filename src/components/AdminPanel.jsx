import { useState, useEffect } from 'react';
import { listenToPrayerRequests, markAsPrayed, deletePrayerRequest } from '../firebase/api';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Trash2, ArrowLeft, Shield, Activity, Heart, Search, X } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

export default function AdminPanel() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [prayers, setPrayers] = useState([]);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('All');
  const [selectedPrayer, setSelectedPrayer] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      const unsubscribe = listenToPrayerRequests(setPrayers);
      return () => unsubscribe();
    }
  }, [isAuthenticated]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === 'KEVZ123') {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Invalid password');
    }
  };

  const handleTogglePrayed = async (id, currentStatus) => {
    try {
      await markAsPrayed(id, !currentStatus);
    } catch (e) {
      console.error(e);
      alert("Failed to update status");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this prayer?")) return;
    try {
      await deletePrayerRequest(id);
    } catch (e) {
      console.error(e);
      alert("Failed to delete prayer");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card rounded-3xl p-8 md:p-10 w-full max-w-md shadow-2xl border border-white/10 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--color-gold-400)] to-transparent"></div>
          
          <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-6">
            <Shield className="text-[var(--color-gold-500)]" />
          </div>
          
          <h2 className="text-2xl font-semibold mb-2 text-white">Admin Access</h2>
          <p className="text-zinc-500 text-sm mb-8">Enter your secure password to view and manage incoming prayer requests.</p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--color-gold-500)]/50 transition-all font-mono"
            />
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button
              type="submit"
              className="w-full bg-zinc-100 text-zinc-900 rounded-xl py-3 font-medium hover:bg-white transition-all"
            >
              Access Dashboard
            </button>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="w-full text-zinc-500 text-sm hover:text-zinc-300 transition-colors mt-4"
            >
              Return Home
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  const filteredPrayers = prayers.filter(req => {
    const matchesSearch = req.request.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          req.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          req.category?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === 'Unprayed') return matchesSearch && !req.prayedFor;
    if (filter === 'Prayed') return matchesSearch && req.prayedFor;
    return matchesSearch;
  });

  const totalPrayers = prayers.length;
  const answeredPrayers = prayers.filter(p => p.prayedFor).length;
  const waitingPrayers = totalPrayers - answeredPrayers;
  
  // Calculate top category
  const categories = prayers.reduce((acc, curr) => {
    const cat = curr.category || 'Uncategorized';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});
  const topCategory = Object.entries(categories).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 p-6 md:p-12 font-sans">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-12">
          <div>
            <Link to="/" className="text-zinc-500 hover:text-zinc-300 transition-colors flex items-center gap-2 mb-4 text-sm font-medium uppercase tracking-wider">
              <ArrowLeft size={16} /> Back to Site
            </Link>
            <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              <Shield className="text-[var(--color-gold-500)]" /> Prayer Dashboard
            </h1>
            <p className="text-zinc-500 mt-2">Secure administration panel for managing prayer requests.</p>
          </div>
          
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-full px-6 py-2 text-sm font-mono text-[var(--color-gold-400)] flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            System Online
          </div>
        </header>

        {/* Analytics Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-2xl p-6">
            <div className="flex items-center gap-3 text-zinc-400 mb-2">
              <Activity size={18} />
              <span className="text-sm font-medium uppercase tracking-wider">Total Received</span>
            </div>
            <p className="text-4xl font-bold text-white">{totalPrayers}</p>
          </div>
          
          <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Heart size={64} className="text-[var(--color-gold-500)]" />
            </div>
            <div className="flex items-center gap-3 text-zinc-400 mb-2 relative z-10">
              <CheckCircle2 size={18} className="text-[var(--color-gold-500)]" />
              <span className="text-sm font-medium uppercase tracking-wider">Answered</span>
            </div>
            <p className="text-4xl font-bold text-[var(--color-gold-400)] relative z-10">{answeredPrayers}</p>
            <p className="text-xs text-zinc-500 mt-2 relative z-10">{waitingPrayers} still waiting</p>
          </div>

          <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-2xl p-6">
            <div className="flex items-center gap-3 text-zinc-400 mb-2">
              <Shield size={18} />
              <span className="text-sm font-medium uppercase tracking-wider">Top Category</span>
            </div>
            <p className="text-2xl font-semibold text-white mt-2 truncate">{topCategory}</p>
          </div>
        </div>

        <div className="glass-card rounded-3xl p-6 md:p-8 border border-white/5">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <h2 className="text-xl font-medium">Recent Requests</h2>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Search prayers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full sm:w-64 bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-[var(--color-gold-500)]/50"
                />
              </div>
              
              <div className="flex bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden p-1">
                {['All', 'Unprayed', 'Prayed'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${
                      filter === f ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wider">
                  <th className="pb-4 font-medium px-4">Status</th>
                  <th className="pb-4 font-medium px-4">Code</th>
                  <th className="pb-4 font-medium px-4">Privacy</th>
                  <th className="pb-4 font-medium px-4">Date</th>
                  <th className="pb-4 font-medium px-4">Name / Category</th>
                  <th className="pb-4 font-medium px-4">Request</th>
                  <th className="pb-4 font-medium px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {filteredPrayers.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-12 text-center text-zinc-500 font-light">
                      No prayer requests found.
                    </td>
                  </tr>
                ) : (
                  filteredPrayers.map((req) => (
                    <tr 
                      key={req.id} 
                      onClick={() => setSelectedPrayer(req)}
                      className="group hover:bg-zinc-900/50 transition-colors cursor-pointer"
                    >
                      <td className="py-4 px-4 align-top" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleTogglePrayed(req.id, req.prayedFor)}
                          className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium transition-all ${
                            req.prayedFor 
                              ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                              : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                          }`}
                        >
                          <CheckCircle2 size={14} />
                          {req.prayedFor ? 'Prayed' : 'Mark Prayed'}
                        </button>
                      </td>
                      <td className="py-4 px-4 align-top">
                        <span className="font-mono text-xs text-[var(--color-gold-400)] bg-[var(--color-gold-500)]/10 px-2 py-1 rounded">
                          {req.prayerCode || 'LEGACY'}
                        </span>
                      </td>
                      <td className="py-4 px-4 align-top text-xs text-zinc-400">
                        {req.isPublic !== false ? (
                          <span className="text-zinc-300">Public</span>
                        ) : (
                          <span className="text-red-400 font-semibold">Private</span>
                        )}
                      </td>
                      <td className="py-4 px-4 align-top text-sm text-zinc-400 whitespace-nowrap">
                        {new Date(req.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-4 align-top">
                        <div className="font-medium text-sm text-zinc-200">{req.name || 'Anonymous'}</div>
                        <div className="text-xs text-zinc-500 uppercase tracking-wider mt-1">{req.category || 'Uncategorized'}</div>
                      </td>
                      <td className="py-4 px-4 align-top w-full max-w-md">
                        <p className="text-sm text-zinc-300 font-light leading-relaxed whitespace-pre-wrap line-clamp-2">{req.request}</p>
                      </td>
                      <td className="py-4 px-4 align-top text-right" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleDelete(req.id)}
                          className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                          title="Delete Request"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {selectedPrayer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPrayer(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-[#09090b] border border-[var(--color-gold-500)]/20 rounded-3xl p-8 shadow-2xl flex flex-col max-h-[90vh]"
            >
              <button 
                onClick={() => setSelectedPrayer(null)}
                className="absolute top-6 right-6 p-2 bg-zinc-900 rounded-full text-zinc-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>

              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-[var(--color-gold-500)]/20 flex items-center justify-center text-[var(--color-gold-400)]">
                  {selectedPrayer.prayedFor ? <CheckCircle2 size={24} /> : <Heart size={24} />}
                </div>
                <div>
                  <h3 className="text-xl font-medium text-white">{selectedPrayer.name || 'Anonymous'}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs font-mono text-[var(--color-gold-400)] bg-[var(--color-gold-500)]/10 px-2 py-0.5 rounded">
                      {selectedPrayer.prayerCode || 'LEGACY'}
                    </span>
                    <span className="text-xs text-zinc-500 uppercase tracking-wider">{selectedPrayer.category || 'Uncategorized'}</span>
                    <span className="text-xs text-zinc-600">{new Date(selectedPrayer.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                <p className="text-zinc-200 text-lg leading-relaxed whitespace-pre-wrap font-light">
                  "{selectedPrayer.request}"
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row gap-4 justify-between items-center">
                <div className="flex items-center gap-2 text-sm text-zinc-400">
                  Privacy: {selectedPrayer.isPublic !== false ? (
                    <span className="text-zinc-300">Public Wall</span>
                  ) : (
                    <span className="text-red-400">Private</span>
                  )}
                </div>
                
                <div className="flex gap-4 w-full sm:w-auto">
                  <button
                    onClick={() => {
                      handleDelete(selectedPrayer.id);
                      setSelectedPrayer(null);
                    }}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-colors font-medium text-sm"
                  >
                    <Trash2 size={16} /> Delete
                  </button>
                  <button
                    onClick={() => {
                      handleTogglePrayed(selectedPrayer.id, selectedPrayer.prayedFor);
                      // Update local state so modal updates instantly
                      setSelectedPrayer({...selectedPrayer, prayedFor: !selectedPrayer.prayedFor});
                    }}
                    className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl transition-all font-medium text-sm ${
                      selectedPrayer.prayedFor 
                        ? 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700' 
                        : 'bg-[var(--color-gold-500)] text-zinc-950 hover:bg-[var(--color-gold-400)] shadow-[0_0_20px_rgba(232,208,141,0.3)]'
                    }`}
                  >
                    <CheckCircle2 size={16} />
                    {selectedPrayer.prayedFor ? 'Mark Unprayed' : 'Mark Prayed'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
