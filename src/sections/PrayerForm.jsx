import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, CheckCircle2, Loader2 } from 'lucide-react';
import { submitPrayerRequest } from '../firebase/api';

const categories = [
  "Healing", "Anxiety", "Family", "Financial", 
  "Depression", "Relationship", "Spiritual", "Other"
];

export default function PrayerForm() {
  const [formData, setFormData] = useState({ name: '', request: '', category: '', isPublic: true });
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [errorMessage, setErrorMessage] = useState('');
  const [prayerCode, setPrayerCode] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.request.trim()) return;

    setStatus('loading');
    setErrorMessage('');
    try {
      const result = await submitPrayerRequest({
        name: formData.name.trim() || 'Anonymous',
        request: formData.request.trim(),
        category: formData.category || 'Uncategorized'
      });
      setPrayerCode(result.prayerCode);
      setStatus('success');
      setFormData({ name: '', request: '', category: '', isPublic: true });
      
      // Reset form after 15 seconds instead of 5 to give them time to copy the code
      setTimeout(() => {
        setStatus('idle');
        setPrayerCode('');
      }, 15000);
    } catch (error) {
      console.error("Error submitting prayer:", error);
      setErrorMessage(error.message || 'Unknown error');
      setStatus('error');
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(prayerCode);
  };

  return (
    <section id="prayer-form" className="py-24 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[var(--color-gold-500)] opacity-[0.02] rounded-full blur-[100px] pointer-events-none"></div>

      <div className="container mx-auto px-6 max-w-2xl relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-semibold mb-4">Share Your Burden</h2>
          <p className="text-zinc-400 font-light">Your prayer will be kept safe, and someone will pray for you tonight.</p>
        </div>

        <div className="glass-card rounded-3xl p-8 md:p-10 shadow-2xl relative overflow-hidden">
          <AnimatePresence mode="wait">
            {status === 'success' ? (
              <motion.div
                key="success"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center text-center py-12 relative"
              >
                {/* Crazy Explosion Animation using Framer Motion */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
                  <motion.div
                    initial={{ scale: 0, opacity: 1 }}
                    animate={{ scale: [0, 4, 8], opacity: [1, 0.8, 0] }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="absolute w-32 h-32 bg-[var(--color-gold-500)] rounded-full blur-2xl mix-blend-screen"
                  />
                  {[...Array(12)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0, x: 0, y: 0, opacity: 1 }}
                      animate={{ 
                        scale: [0, Math.random() * 2 + 1, 0],
                        x: (Math.random() - 0.5) * 400,
                        y: (Math.random() - 0.5) * 400,
                        opacity: [1, 1, 0]
                      }}
                      transition={{ duration: 1.5 + Math.random(), ease: "easeOut" }}
                      className="absolute w-2 h-2 bg-white rounded-full shadow-[0_0_10px_2px_var(--color-gold-400)]"
                    />
                  ))}
                </div>

                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.2 }}
                  className="w-24 h-24 rounded-full bg-[var(--color-gold-500)]/10 border border-[var(--color-gold-500)]/30 flex items-center justify-center mb-8 relative z-10 shadow-[0_0_50px_rgba(232,208,141,0.2)]"
                >
                  <CheckCircle2 size={48} className="text-[var(--color-gold-400)] drop-shadow-[0_0_10px_rgba(232,208,141,0.5)]" />
                </motion.div>
                
                <motion.h3 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-3xl font-medium mb-3 relative z-10 text-white"
                >
                  Your prayer is received.
                </motion.h3>
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="text-zinc-300 font-light mb-10 relative z-10"
                >
                  Tonight, someone will pray for you.
                </motion.p>
                
                <motion.div 
                  initial={{ opacity: 0, y: 30, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: "spring", delay: 1.2, duration: 0.8 }}
                  className="w-full bg-black/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 text-center relative z-10 shadow-2xl overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--color-gold-500)]/10 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite] pointer-events-none" />
                  
                  <p className="text-xs text-[var(--color-gold-500)] uppercase tracking-[0.2em] mb-4 font-semibold">Your Secret Prayer Code</p>
                  
                  <div className="flex items-center justify-center gap-4 mb-6">
                    <motion.span 
                      initial={{ letterSpacing: "1em", filter: "blur(10px)" }}
                      animate={{ letterSpacing: "0.1em", filter: "blur(0px)" }}
                      transition={{ duration: 1.5, delay: 1.5, ease: "easeOut" }}
                      className="text-4xl md:text-5xl font-mono text-white font-medium drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                    >
                      {prayerCode}
                    </motion.span>
                  </div>
                  
                  <p className="text-zinc-400 text-sm font-light mb-6">
                    Save this code. You can use it anytime to check if your prayer has been lifted up.
                  </p>
                  
                  <button 
                    onClick={copyCode}
                    className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm transition-all border border-white/5 hover:border-white/20 flex items-center justify-center gap-2 mx-auto"
                  >
                    Copy to Clipboard
                  </button>
                </motion.div>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleSubmit}
                className="space-y-6"
              >
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">Name (Optional)</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="You may stay anonymous"
                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-200 focus:outline-none focus:border-[var(--color-gold-500)]/50 focus:ring-1 focus:ring-[var(--color-gold-500)]/50 transition-all placeholder:text-zinc-600 font-light"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">Category (Optional)</label>
                  <div className="relative">
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-200 focus:outline-none focus:border-[var(--color-gold-500)]/50 focus:ring-1 focus:ring-[var(--color-gold-500)]/50 transition-all appearance-none font-light"
                    >
                      <option value="" className="bg-zinc-900">Select a category...</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat} className="bg-zinc-900">{cat}</option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-zinc-500">
                      <ArrowDownIcon />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">Prayer Request <span className="text-[var(--color-gold-500)]">*</span></label>
                  <textarea
                    required
                    rows={6}
                    value={formData.request}
                    onChange={(e) => setFormData({...formData, request: e.target.value})}
                    placeholder="Pour out your heart..."
                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-200 focus:outline-none focus:border-[var(--color-gold-500)]/50 focus:ring-1 focus:ring-[var(--color-gold-500)]/50 transition-all placeholder:text-zinc-600 font-light resize-none"
                  ></textarea>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isPublic"
                    checked={formData.isPublic}
                    onChange={(e) => setFormData({...formData, isPublic: e.target.checked})}
                    className="w-5 h-5 rounded border-zinc-800 bg-zinc-900/50 text-[var(--color-gold-500)] focus:ring-[var(--color-gold-500)]/50 cursor-pointer accent-[var(--color-gold-500)]"
                  />
                  <label htmlFor="isPublic" className="text-sm text-zinc-400 font-light cursor-pointer select-none flex-1">
                    Allow others to see and pray for my request on the Community Wall
                  </label>
                </div>

                {status === 'error' && (
                  <div className="text-red-400 text-sm font-light bg-red-400/10 p-3 rounded-lg border border-red-400/20">
                    <p className="font-medium mb-1">Something went wrong:</p>
                    <p className="font-mono text-xs break-words">{errorMessage}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={status === 'loading' || !formData.request.trim()}
                  className="w-full bg-zinc-100 text-zinc-900 rounded-xl py-4 font-medium flex items-center justify-center gap-2 hover:bg-white transition-all disabled:opacity-70 disabled:cursor-not-allowed group"
                >
                  {status === 'loading' ? (
                    <Loader2 size={20} className="animate-spin text-zinc-600" />
                  ) : (
                    <>
                      Send Prayer Request
                      <Send size={18} className="text-zinc-600 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

function ArrowDownIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m6 9 6 6 6-6"/>
    </svg>
  );
}
