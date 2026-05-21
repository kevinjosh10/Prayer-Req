import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, CheckCircle2, Loader2 } from 'lucide-react';
import { submitPrayerRequest } from '../firebase/api';

const categories = [
  "Healing", "Anxiety", "Family", "Financial", 
  "Depression", "Relationship", "Spiritual", "Other"
];

export default function PrayerForm() {
  const [formData, setFormData] = useState({ name: '', request: '', category: '' });
  const [status, setStatus] = useState('idle'); // idle, loading, success, error

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.request.trim()) return;

    setStatus('loading');
    try {
      await submitPrayerRequest({
        name: formData.name.trim() || 'Anonymous',
        request: formData.request.trim(),
        category: formData.category || 'Uncategorized'
      });
      setStatus('success');
      setFormData({ name: '', request: '', category: '' });
      
      // Reset form after 5 seconds
      setTimeout(() => setStatus('idle'), 5000);
    } catch (error) {
      console.error("Error submitting prayer:", error);
      setStatus('error');
    }
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
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex flex-col items-center justify-center text-center py-12"
              >
                <div className="w-20 h-20 rounded-full bg-[var(--color-gold-500)]/20 flex items-center justify-center mb-6">
                  <CheckCircle2 size={40} className="text-[var(--color-gold-400)]" />
                </div>
                <h3 className="text-2xl font-medium mb-3">Your prayer has been received.</h3>
                <p className="text-zinc-400 font-light">Tonight, someone will pray for you.</p>
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

                {status === 'error' && (
                  <p className="text-red-400 text-sm font-light">Something went wrong. Please try again.</p>
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
