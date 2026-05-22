import { useState, useEffect } from 'react';
import { listenToPrayerRequests, markAsPrayed, deletePrayerRequest, updatePrayerVisibility, listenToTestimonies, deleteTestimony } from '../firebase/api';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Trash2, ArrowLeft, Shield, Activity, Heart, Search, X, EyeOff, Eye } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

export default function AdminPanel() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [prayers, setPrayers] = useState([]);
  const [testimonies, setTestimonies] = useState([]);
  const [activeTab, setActiveTab] = useState('prayers');
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('All');
  const [selectedPrayer, setSelectedPrayer] = useState(null);
  const [selectedTestimony, setSelectedTestimony] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      const unsubscribePrayers = listenToPrayerRequests(setPrayers);
      const unsubscribeTestimonies = listenToTestimonies(setTestimonies);
      return () => {
        unsubscribePrayers();
        unsubscribeTestimonies();
      };
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

  const handleToggleVisibility = (id, currentIsPublic, isCurrentlyFlagged) => {
    setConfirmDialog({
      isOpen: true,
      title: currentIsPublic !== false ? 'Hide Prayer' : 'Show Prayer',
      message: `Are you sure you want to make this prayer ${currentIsPublic !== false ? 'Private (hide from wall)' : 'Public (show on wall)'}?`,
      actionLabel: currentIsPublic !== false ? 'Yes, Hide' : 'Yes, Show',
      actionColor: 'bg-zinc-700 text-white hover:bg-zinc-600',
      onConfirm: async () => {
        try {
          await updatePrayerVisibility(id, currentIsPublic === false ? true : false, isCurrentlyFlagged);
          if (selectedPrayer && selectedPrayer.id === id) {
            setSelectedPrayer(prev => ({
              ...prev, 
              isPublic: currentIsPublic === false ? true : false,
              flagged: isCurrentlyFlagged ? false : prev.flagged
            }));
          }
        } catch (e) {
          console.error(e);
          alert("Failed to update visibility");
        }
      }
    });
  };

  const handleDelete = (id) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Prayer',
      message: "Are you sure you want to completely delete this prayer? This action cannot be undone.",
      actionLabel: 'Yes, Delete',
      actionColor: 'bg-red-500 hover:bg-red-600 text-white',
      onConfirm: async () => {
        try {
          await deletePrayerRequest(id);
          if (selectedPrayer && selectedPrayer.id === id) {
            setSelectedPrayer(null);
          }
        } catch (e) {
          console.error(e);
          alert("Failed to delete prayer");
        }
      }
    });
  };

  const handleDeleteTestimony = (id) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Testimony',
      message: "Are you sure you want to completely delete this testimony? This action cannot be undone.",
      actionLabel: 'Yes, Delete',
      actionColor: 'bg-red-500 hover:bg-red-600 text-white',
      onConfirm: async () => {
        try {
          await deleteTestimony(id);
          if (selectedTestimony && selectedTestimony.id === id) {
            setSelectedTestimony(null);
          }
        } catch (e) {
          console.error(e);
          alert("Failed to delete testimony");
        }
      }
    });
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
    
    if (filter === 'Unprayed') return matchesSearch && !req.prayedFor && req.isPublic !== false;
    if (filter === 'Prayed') return matchesSearch && req.prayedFor && req.isPublic !== false;
    if (filter === 'Flagged') return matchesSearch && req.flagged === true;
    return matchesSearch;
  });

  const filteredTestimonies = testimonies.filter(testimony => {
    return testimony.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
           testimony.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           testimony.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           testimony.category?.toLowerCase().includes(searchTerm.toLowerCase());
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

        {/* Tab Selector */}
        <div className="flex gap-4 mb-8 border-b border-zinc-800">
          <button
            onClick={() => setActiveTab('prayers')}
            className={`pb-4 px-2 font-medium text-sm transition-all border-b-2 ${
              activeTab === 'prayers' 
                ? 'border-[var(--color-gold-500)] text-[var(--color-gold-400)]' 
                : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Prayer Requests ({totalPrayers})
          </button>
          <button
            onClick={() => setActiveTab('testimonies')}
            className={`pb-4 px-2 font-medium text-sm transition-all border-b-2 ${
              activeTab === 'testimonies' 
                ? 'border-[var(--color-gold-500)] text-[var(--color-gold-400)]' 
                : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Testimonies ({testimonies.length})
          </button>
        </div>

        <div className="glass-card rounded-3xl p-6 md:p-8 border border-white/5">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <h2 className="text-xl font-medium">
              {activeTab === 'prayers' ? 'Recent Prayers' : 'Recent Testimonies'}
            </h2>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full sm:w-64 bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-[var(--color-gold-500)]/50"
                />
              </div>
              
              {activeTab === 'prayers' && (
                <div className="flex bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden p-1 flex-wrap sm:flex-nowrap">
                  {['All', 'Unprayed', 'Prayed', 'Flagged'].map((f) => (
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
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              {activeTab === 'prayers' ? (
                <>
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
                            {req.flagged ? (
                              <span className="text-red-500 font-bold bg-red-500/10 px-2 py-1 rounded">FLAGGED</span>
                            ) : req.isPublic !== false ? (
                              <span className="text-zinc-300">Public</span>
                            ) : (
                              <span className="text-zinc-500 font-semibold">Private</span>
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
                          <td className="py-4 px-4 align-top text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => handleToggleVisibility(req.id, req.isPublic, req.flagged)}
                              className="p-2 text-zinc-400 hover:text-[var(--color-gold-400)] hover:bg-[var(--color-gold-500)]/10 rounded-lg transition-all mr-2 inline-flex items-center justify-center bg-zinc-900/50"
                              title={req.isPublic !== false ? "Make Private (Hide)" : "Make Public (Show & Unflag)"}
                            >
                              {req.isPublic !== false ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                            <button
                              onClick={() => handleDelete(req.id)}
                              className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all inline-flex items-center justify-center bg-zinc-900/50"
                              title="Delete Request"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </>
              ) : (
                <>
                  <thead>
                    <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wider">
                      <th className="pb-4 font-medium px-4">Date</th>
                      <th className="pb-4 font-medium px-4">Name / Category</th>
                      <th className="pb-4 font-medium px-4">Title</th>
                      <th className="pb-4 font-medium px-4">Content</th>
                      <th className="pb-4 font-medium px-4">Praises</th>
                      <th className="pb-4 font-medium px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/50">
                    {filteredTestimonies.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="py-12 text-center text-zinc-500 font-light">
                          No testimonies found.
                        </td>
                      </tr>
                    ) : (
                      filteredTestimonies.map((req) => (
                        <tr 
                          key={req.id} 
                          onClick={() => setSelectedTestimony(req)}
                          className="group hover:bg-zinc-900/50 transition-colors cursor-pointer"
                        >
                          <td className="py-4 px-4 align-top text-sm text-zinc-400 whitespace-nowrap">
                            {new Date(req.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-4 px-4 align-top">
                            <div className="font-medium text-sm text-zinc-200">{req.name || 'Anonymous'}</div>
                            <div className="text-xs text-[var(--color-gold-500)] uppercase tracking-wider mt-1">{req.category || 'Praise'}</div>
                          </td>
                          <td className="py-4 px-4 align-top">
                            <div className="font-medium text-sm text-zinc-200">{req.title}</div>
                          </td>
                          <td className="py-4 px-4 align-top w-full max-w-md">
                            <p className="text-sm text-zinc-300 font-light leading-relaxed whitespace-pre-wrap line-clamp-2">{req.content}</p>
                          </td>
                          <td className="py-4 px-4 align-top">
                            <span className="font-mono text-sm text-[var(--color-gold-400)] bg-[var(--color-gold-500)]/10 px-3 py-1 rounded-full">
                              {req.praises || 0} 🙌
                            </span>
                          </td>
                          <td className="py-4 px-4 align-top text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => handleDeleteTestimony(req.id)}
                              className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all inline-flex items-center justify-center bg-zinc-900/50"
                              title="Delete Testimony"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </>
              )}
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
                
                <div className="flex gap-4 w-full sm:w-auto flex-wrap sm:flex-nowrap">
                  <button
                    onClick={() => handleDelete(selectedPrayer.id)}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-colors font-medium text-sm"
                  >
                    <Trash2 size={16} /> Delete
                  </button>
                  <button
                    onClick={() => handleToggleVisibility(selectedPrayer.id, selectedPrayer.isPublic, selectedPrayer.flagged)}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl transition-colors font-medium text-sm"
                  >
                    {selectedPrayer.isPublic !== false ? <><EyeOff size={16} /> Hide</> : <><Eye size={16} /> Show</>}
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

      <AnimatePresence>
        {selectedTestimony && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedTestimony(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-[#09090b] border border-[var(--color-gold-500)]/20 rounded-3xl p-8 shadow-2xl flex flex-col max-h-[90vh]"
            >
              <button 
                onClick={() => setSelectedTestimony(null)}
                className="absolute top-6 right-6 p-2 bg-zinc-900 rounded-full text-zinc-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>

              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-[var(--color-gold-500)]/20 flex items-center justify-center text-[var(--color-gold-400)]">
                  <Heart size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-medium text-white">{selectedTestimony.name || 'Anonymous'}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-[var(--color-gold-500)] uppercase tracking-wider">{selectedTestimony.category || 'Praise'}</span>
                    <span className="text-xs text-zinc-600">{new Date(selectedTestimony.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-white mb-4">{selectedTestimony.title}</h2>

              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                <p className="text-zinc-200 text-lg leading-relaxed whitespace-pre-wrap font-light">
                  {selectedTestimony.content}
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row gap-4 justify-end items-center">
                <button
                  onClick={() => handleDeleteTestimony(selectedTestimony.id)}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-colors font-medium text-sm"
                >
                  <Trash2 size={16} /> Delete Testimony
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {confirmDialog?.isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirmDialog(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 w-full max-w-sm relative z-10 shadow-2xl text-center"
            >
              <h3 className="text-xl font-semibold text-white mb-2">{confirmDialog.title}</h3>
              <p className="text-zinc-400 text-sm mb-8 font-light leading-relaxed">{confirmDialog.message}</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmDialog(null)}
                  className="flex-1 py-3 rounded-xl bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors font-medium text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    await confirmDialog.onConfirm();
                    setConfirmDialog(null);
                  }}
                  className={`flex-1 py-3 rounded-xl transition-colors font-medium text-sm ${confirmDialog.actionColor}`}
                >
                  {confirmDialog.actionLabel}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
