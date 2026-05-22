import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Clock, User, Flag, Share2, Loader2 } from 'lucide-react';

export default function PrayerCard({ prayer, handlePray, handleFlag, handleShare, prayedForIds, getTimeAgo, isGenerating }) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isBursting, setIsBursting] = useState(false);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const onPrayClick = () => {
    if (prayedForIds.has(prayer.id)) return;
    setIsBursting(true);
    handlePray(prayer.id);
    setTimeout(() => setIsBursting(false), 2000);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className="break-inside-avoid glass-card rounded-3xl p-6 md:p-8 hover:bg-zinc-900/80 transition-colors border border-white/5 relative group inline-block w-full overflow-hidden"
    >
      {/* Spotlight Hover Effect */}
      <div 
        className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300"
        style={{
          opacity: isHovering ? 1 : 0,
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(232, 208, 141, 0.08), transparent 40%)`
        }}
      />

      <div className="relative z-10 flex flex-col h-full">
        {prayer.prayedFor && (
          <div className="absolute -top-3 -right-3 bg-[var(--color-gold-500)] text-zinc-950 text-xs font-bold px-3 py-1 rounded-full shadow-lg transform rotate-3">
            Answered!
          </div>
        )}
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-zinc-500">
            <User size={14} />
            <span className="text-sm font-medium">{prayer.name || 'Anonymous'}</span>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => handleFlag && handleFlag(prayer.id)}
              className="text-zinc-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
              title="Flag as inappropriate"
            >
              <Flag size={14} />
            </button>
            <div className="flex items-center gap-1 text-zinc-600 text-xs font-light">
              <Clock size={12} />
              <span>{getTimeAgo(prayer.createdAt)}</span>
            </div>
          </div>
        </div>
        
        <p className="text-zinc-300 font-light leading-relaxed mb-6 whitespace-pre-wrap">
          "{prayer.request}"
        </p>
        
        <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-auto">
          <span className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">
            {prayer.category !== 'Uncategorized' ? prayer.category : 'Other'}
          </span>
          
          <div className="relative flex items-center">
            <button
              onClick={onPrayClick}
              disabled={prayedForIds.has(prayer.id)}
              className={`flex items-center gap-2 text-xs font-medium px-4 py-2 rounded-full transition-all relative z-10 ${
                prayedForIds.has(prayer.id)
                  ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                  : 'bg-zinc-900 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 border border-zinc-800 hover:border-red-500/20'
              }`}
            >
              <Heart 
                size={14} 
                className={prayedForIds.has(prayer.id) || isBursting ? "fill-red-400 text-red-400" : ""} 
              />
              <span>
                {(prayer.communityPrayers || 0) + (prayedForIds.has(prayer.id) ? (prayer.communityPrayers ? 0 : 1) : 0)} Praying
              </span>
            </button>

            {handleShare && (
              <button
                onClick={() => handleShare(prayer)}
                disabled={isGenerating}
                className="ml-2 p-2 rounded-full bg-zinc-900/50 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors disabled:opacity-50 opacity-0 group-hover:opacity-100"
                title="Share Prayer"
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
