import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Loader2 } from 'lucide-react';
import { checkPrayerStatusByCode } from '../firebase/api';

const categoryVerses = {
  "Healing": { verse: "Jeremiah 17:14", text: "Heal me, O Lord, and I shall be healed; save me, and I shall be saved, for you are my praise." },
  "Anxiety": { verse: "Philippians 4:6-7", text: "Do not be anxious about anything, but in everything by prayer and supplication with thanksgiving let your requests be made known to God." },
  "Family": { verse: "Joshua 24:15", text: "But as for me and my house, we will serve the Lord." },
  "Financial": { verse: "Philippians 4:19", text: "And my God will supply every need of yours according to his riches in glory in Christ Jesus." },
  "Depression": { verse: "Psalm 34:18", text: "The Lord is near to the brokenhearted and saves the crushed in spirit." },
  "Relationship": { verse: "1 Corinthians 13:4-7", text: "Love is patient and kind; love does not envy or boast; it is not arrogant or rude." },
  "Spiritual": { verse: "James 4:8", text: "Draw near to God, and he will draw near to you." },
  "Career": { verse: "Proverbs 16:3", text: "Commit your work to the Lord, and your plans will be established." },
  "Addiction": { verse: "1 Corinthians 10:13", text: "God is faithful, and he will not let you be tempted beyond your ability, but with the temptation he will also provide the way of escape." },
  "Grief": { verse: "Matthew 5:4", text: "Blessed are those who mourn, for they shall be comforted." },
  "Guidance": { verse: "Proverbs 3:5-6", text: "Trust in the Lord with all your heart, and do not lean on your own understanding. In all your ways acknowledge him, and he will make straight your paths." },
  "Protection": { verse: "Psalm 91:11", text: "For he will command his angels concerning you to guard you in all your ways." },
  "Marriage": { verse: "Ephesians 4:2-3", text: "With all humility and gentleness, with patience, bearing with one another in love, eager to maintain the unity of the Spirit in the bond of peace." },
  "Loneliness": { verse: "Deuteronomy 31:8", text: "It is the Lord who goes before you. He will be with you; he will not leave you or forsake you. Do not fear or be dismayed." },
  "Peace": { verse: "John 14:27", text: "Peace I leave with you; my peace I give to you. Not as the world gives do I give to you. Let not your hearts be troubled, neither let them be afraid." },
  "Praise": { verse: "Psalm 103:1", text: "Bless the Lord, O my soul, and all that is within me, bless his holy name!" },
  "Deliverance": { verse: "Psalm 34:4", text: "I sought the Lord, and he answered me and delivered me from all my fears." },
  "Other": { verse: "1 Peter 5:7", text: "Casting all your anxieties on him, because he cares for you." },
  "Uncategorized": { verse: "1 Peter 5:7", text: "Casting all your anxieties on him, because he cares for you." }
};

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
            <div className="mt-6 p-6 rounded-xl bg-zinc-950 border border-zinc-800 text-center relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-gold-500)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
              
              {result.prayedFor ? (
                <>
                  <div className="w-12 h-12 rounded-full bg-gold-500/20 flex items-center justify-center mx-auto mb-3 shadow-[0_0_15px_rgba(232,208,141,0.2)]">
                    <CheckCircle2 size={24} className="text-gold-400" />
                  </div>
                  <h4 className="text-lg font-medium text-white mb-2">It has been prayed for.</h4>
                  <p className="text-sm text-zinc-400 font-light mb-6">
                    Your prayer was lifted up on {new Date(result.prayedForAt).toLocaleDateString()}. You are not alone.
                  </p>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center mx-auto mb-3">
                    <Search size={20} className="text-zinc-400" />
                  </div>
                  <h4 className="text-lg font-medium text-white mb-2">Safe & Waiting</h4>
                  <p className="text-sm text-zinc-400 font-light mb-6">
                    Your prayer is safe in our room. It is waiting to be prayed for soon.
                  </p>
                </>
              )}

              {/* Personalized Comfort */}
              <div className="pt-4 border-t border-zinc-800/50">
                {categoryVerses[result.category] ? (
                  <>
                    <p className="text-sm italic text-zinc-300 mb-2 leading-relaxed font-serif">
                      "{categoryVerses[result.category].text}"
                    </p>
                    <p className="text-xs text-[var(--color-gold-500)] uppercase tracking-widest font-semibold">
                      — {categoryVerses[result.category].verse}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-sm italic text-zinc-300 mb-2 leading-relaxed font-serif">
                      "Casting all your anxieties on him, because he cares for you."
                    </p>
                    <p className="text-xs text-[var(--color-gold-500)] uppercase tracking-widest font-semibold">
                      — 1 Peter 5:7
                    </p>
                  </>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

// Ensure CheckCircle2 is available if not imported top level
import { CheckCircle2 } from 'lucide-react';
