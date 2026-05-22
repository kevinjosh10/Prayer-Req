import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Heart } from 'lucide-react';
import { submitTestimony } from '../firebase/api';

const CATEGORIES = ["Healing", "Provision", "Relationship", "Spiritual", "Deliverance", "Family", "Career", "Peace", "Other"];

export default function TestimonyModal({ isOpen, onClose }) {
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Healing');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() || !title.trim()) return;

    setIsSubmitting(true);
    try {
      await submitTestimony({
        name: name.trim() || 'Anonymous',
        title: title.trim(),
        content: content.trim(),
        category,
      });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setName('');
        setTitle('');
        setContent('');
        setCategory('Healing');
        onClose();
      }, 2500);
    } catch (err) {
      console.error(err);
      alert("Failed to submit testimony. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg bg-[#09090b] border border-[var(--color-gold-500)]/20 rounded-3xl p-8 shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto custom-scrollbar"
          >
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 p-2 bg-zinc-900 rounded-full text-zinc-400 hover:text-white transition-colors z-10"
            >
              <X size={20} />
            </button>

            {success ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-12 flex flex-col items-center text-center"
              >
                <div className="w-20 h-20 bg-[var(--color-gold-500)]/10 rounded-full flex items-center justify-center mb-6">
                  <Heart className="text-[var(--color-gold-400)]" size={40} />
                </div>
                <h3 className="text-2xl font-semibold text-white mb-2">Praise God!</h3>
                <p className="text-zinc-400 font-light">Your testimony has been shared to encourage others.</p>
              </motion.div>
            ) : (
              <>
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-white mb-2">Share a Testimony</h2>
                  <p className="text-zinc-400 text-sm font-light">
                    Encourage someone today by sharing what God has done in your life.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-zinc-400 text-sm mb-2">Name (Optional)</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Anonymous"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-200 focus:outline-none focus:border-[var(--color-gold-500)]/50 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-400 text-sm mb-2">Title</label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g., God healed my anxiety"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-200 focus:outline-none focus:border-[var(--color-gold-500)]/50 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-400 text-sm mb-2">Category</label>
                    <div className="flex flex-wrap gap-2">
                      {CATEGORIES.map(c => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setCategory(c)}
                          className={`px-4 py-2 rounded-full text-xs font-medium transition-colors ${
                            category === c 
                              ? 'bg-[var(--color-gold-500)] text-zinc-950' 
                              : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-600'
                          }`}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-zinc-400 text-sm mb-2">What did God do?</label>
                    <textarea
                      required
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Share your story..."
                      rows={5}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-200 focus:outline-none focus:border-[var(--color-gold-500)]/50 transition-colors resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || !content.trim() || !title.trim()}
                    className="w-full py-4 rounded-xl bg-[var(--color-gold-500)] hover:bg-[var(--color-gold-400)] text-zinc-950 font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(232,208,141,0.2)]"
                  >
                    {isSubmitting ? (
                      <span className="animate-pulse">Sharing...</span>
                    ) : (
                      <>
                        <Send size={18} /> Share Testimony
                      </>
                    )}
                  </button>
                </form>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
