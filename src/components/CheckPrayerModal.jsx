import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Loader2 } from 'lucide-react';
import { checkPrayerStatusByCode } from '../firebase/api';

export default function CheckPrayerModal({ isOpen, onClose }) {
  const [code, setCode] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, result, error
  const [result, setResult] = useState(null);

  const handleCheck = async (e) => {
    e.preventDefault();
    if (!code.trim()) return;

    setStatus('loading');
    try {
      const prayer = await checkPrayerStatusByCode(code.trim());
      if (prayer) {
        setResult(prayer);
        setStatus('result');
      } else {
        setStatus('error');
      }
    } catch (error) {
      console.error(error);
      setStatus('error');
    }
  };

  const handleClose = () => {
    setCode('');
    setStatus('idle');
    setResult(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          onClick={handleClose}
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 md:p-8 w-full max-w-md relative z-10 shadow-2xl"
        >
          <button 
            onClick={handleClose}
            className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>

          <h3 className="text-xl font-medium mb-2 text-white">Check Prayer Status</h3>
          <p className="text-sm text-zinc-400 mb-6 font-light">Enter your secret Prayer Code to see if your prayer has been lifted up.</p>

          <form onSubmit={handleCheck} className="space-y-4">
            <div>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. HOPE-A1B2C"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-gold-400 font-mono text-center tracking-widest focus:outline-none focus:border-gold-500/50 transition-all uppercase placeholder:normal-case placeholder:tracking-normal placeholder:text-zinc-700"
              />
            </div>
            <button
              type="submit"
              disabled={status === 'loading' || !code.trim()}
              className="w-full bg-zinc-100 text-zinc-900 rounded-xl py-3 font-medium flex items-center justify-center gap-2 hover:bg-white transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {status === 'loading' ? <Loader2 size={18} className="animate-spin" /> : 'Check Status'}
            </button>
          </form>

          {status === 'error' && (
            <div className="mt-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-center">
              <p className="text-sm text-red-400">We couldn't find a prayer with that code. Please check it and try again.</p>
            </div>
          )}

          {status === 'result' && result && (
            <div className="mt-6 p-6 rounded-xl bg-zinc-950 border border-zinc-800 text-center">
              {result.prayedFor ? (
                <>
                  <div className="w-12 h-12 rounded-full bg-gold-500/20 flex items-center justify-center mx-auto mb-3">
                    <CheckCircle2 size={24} className="text-gold-400" />
                  </div>
                  <h4 className="text-lg font-medium text-white mb-2">It has been prayed for.</h4>
                  <p className="text-sm text-zinc-400 font-light">
                    Your prayer was lifted up on {new Date(result.prayedForAt).toLocaleDateString()}. You are not alone.
                  </p>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center mx-auto mb-3">
                    <Search size={20} className="text-zinc-400" />
                  </div>
                  <h4 className="text-lg font-medium text-white mb-2">Safe & Waiting</h4>
                  <p className="text-sm text-zinc-400 font-light">
                    Your prayer is safe in our room. It is waiting to be prayed for soon.
                  </p>
                </>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

// Ensure CheckCircle2 is available if not imported top level
import { CheckCircle2 } from 'lucide-react';
