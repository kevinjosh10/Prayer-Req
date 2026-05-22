import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, User, Share2, Flag, Loader2 } from 'lucide-react';

export default function TestimonyCard({ testimony, handlePraise, handleShare, handleFlag, praisedIds, getTimeAgo, isGenerating }) {
  const [isBursting, setIsBursting] = useState(false);

  const onPraiseClick = () => {
    if (praisedIds.has(testimony.id)) return;
    setIsBursting(true);
    handlePraise(testimony.id);
    setTimeout(() => setIsBursting(false), 2000);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      className="break-inside-avoid bg-zinc-900/40 rounded-3xl p-6 md:p-8 hover:bg-zinc-900/80 transition-colors border border-[var(--color-gold-500)]/20 relative group inline-block w-full overflow-hidden shadow-[0_4px_30px_rgba(232,208,141,0.05)] hover:shadow-[0_4px_30px_rgba(232,208,141,0.1)] flex flex-col"
    >
      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-[var(--color-gold-400)]">
            <User size={14} />
            <span className="text-sm font-medium">{testimony.name || 'Anonymous'}</span>
          </div>
          <div className="flex items-center gap-3">
            {handleFlag && (
              <button 
                onClick={() => handleFlag(testimony.id)}
                className="text-zinc-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                title="Flag as inappropriate"
              >
                <Flag size={14} />
              </button>
            )}
            <div className="flex items-center gap-1 text-zinc-500 text-xs font-light">
              <Clock size={12} />
              <span>{getTimeAgo(testimony.createdAt)}</span>
            </div>
          </div>
        </div>
        
        <h3 className="text-lg font-semibold text-white mb-2">{testimony.title}</h3>
        
        <p className="text-zinc-300 font-light leading-relaxed mb-6 whitespace-pre-wrap">
          {testimony.content}
        </p>
        
        <div className="flex items-center justify-between border-t border-[var(--color-gold-500)]/10 pt-4 mt-auto">
          <span className="text-xs text-[var(--color-gold-500)]/70 uppercase tracking-wider font-semibold">
            {testimony.category || 'Praise'}
          </span>
          
          <div className="relative flex items-center">
            <button
              onClick={onPraiseClick}
              disabled={praisedIds.has(testimony.id)}
              className={`flex items-center gap-2 text-xs font-medium px-4 py-2 rounded-full transition-all relative z-10 ${
                praisedIds.has(testimony.id)
                  ? 'bg-[var(--color-gold-500)]/20 text-[var(--color-gold-400)] border border-[var(--color-gold-500)]/30'
                  : 'bg-zinc-950 text-zinc-400 hover:text-[var(--color-gold-400)] hover:bg-[var(--color-gold-500)]/10 border border-zinc-800 hover:border-[var(--color-gold-500)]/30'
              }`}
            >
              <span className={praisedIds.has(testimony.id) || isBursting ? "scale-110 transition-transform" : ""}>🙌</span>
              <span>
                {(testimony.praises || 0) + (praisedIds.has(testimony.id) ? (testimony.praises ? 0 : 1) : 0)} Praise God
              </span>
            </button>
            
            {handleShare && (
              <button
                onClick={() => handleShare(testimony)}
                disabled={isGenerating}
                className="ml-2 p-2 rounded-full bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors disabled:opacity-50 opacity-0 group-hover:opacity-100"
                title="Share to Instagram Story"
              >
                {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <Share2 size={14} />}
              </button>
            )}
            
            {/* Particle Burst Animation */}
            <AnimatePresence>
              {isBursting && (
                <div className="absolute inset-0 pointer-events-none z-0 flex items-center justify-center">
                  {[...Array(8)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 1, scale: 0, x: 0, y: 0 }}
                      animate={{
                        opacity: [1, 1, 0],
                        scale: [0, 1.5, 0],
                        x: (Math.random() - 0.5) * 60,
                        y: (Math.random() - 0.5) * 60 - 20,
                      }}
                      transition={{ duration: 1, ease: "easeOut", delay: Math.random() * 0.2 }}
                      className="absolute w-2 h-2 rounded-full bg-[var(--color-gold-400)] shadow-[0_0_10px_var(--color-gold-500)]"
                    />
                  ))}
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
