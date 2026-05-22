import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Clock, User, Filter, Flag } from 'lucide-react';
import { listenToPrayerRequests, incrementCommunityPrayer, flagPrayerRequest } from '../firebase/api';

const ALL_CATEGORIES = ["All", "Healing", "Anxiety", "Family", "Financial", "Depression", "Relationship", "Spiritual", "Other"];

export default function CommunityWall() {
  const [prayers, setPrayers] = useState([]);
  const [prayedForIds, setPrayedForIds] = useState(new Set());
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    const unsubscribe = listenToPrayerRequests((data) => {
      // Filter out private prayers
      const publicPrayers = data.filter(p => p.isPublic !== false && p.isPublic !== "false");
      setPrayers(publicPrayers);
    });
    
    return () => unsubscribe();
  }, []);

  const handlePray = async (id) => {
    if (prayedForIds.has(id)) return;
    
    setPrayedForIds(prev => new Set(prev).add(id));
    
    try {
      await incrementCommunityPrayer(id);
    } catch (e) {
      console.error("Failed to increment prayer:", e);
      setPrayedForIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const handleFlag = async (id) => {
    if (!window.confirm("Are you sure you want to flag this prayer as inappropriate? It will be hidden immediately.")) return;
    
    // Optimistic UI update
    setPrayers(prev => prev.filter(p => p.id !== id));
    
    try {
      await flagPrayerRequest(id);
    } catch (e) {
      console.error("Failed to flag prayer:", e);
      // Let the realtime listener restore it if it failed
    }
  };

  const getTimeAgo = (timestamp) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const filteredPrayers = selectedCategory === "All" 
    ? prayers.slice(0, 24) 
    : prayers.filter(p => p.category === selectedCategory || (selectedCategory === "Other" && p.category === "Uncategorized")).slice(0, 24);

  if (prayers.length === 0) return null;

  return (
    <section className="py-24 relative overflow-hidden bg-black/50">
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-semibold mb-4">You Are Not Alone</h2>
          <p className="text-zinc-400 font-light max-w-2xl mx-auto">
            These are anonymous prayers from people around the world. Take a moment to lift someone else up.
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-hide snap-x justify-start md:justify-center">
          <div className="flex items-center gap-2 px-4 md:px-0">
            <Filter size={16} className="text-zinc-500 mr-2 shrink-0" />
            {ALL_CATEGORIES.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all snap-start ${
                  selectedCategory === category
                    ? 'bg-gold-500 text-zinc-900 shadow-[0_0_15px_rgba(232,208,141,0.3)]'
                    : 'bg-zinc-900/80 text-zinc-400 hover:text-zinc-200 border border-zinc-800 hover:border-gold-500/30'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
          <AnimatePresence mode="popLayout">
            {filteredPrayers.map((prayer) => (
              <PrayerCard key={prayer.id} prayer={prayer} handlePray={handlePray} handleFlag={handleFlag} prayedForIds={prayedForIds} getTimeAgo={getTimeAgo} />
            ))}
          </AnimatePresence>
        </div>
        
        {filteredPrayers.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 text-zinc-500 font-light"
          >
            No prayers found in this category right now.
          </motion.div>
        )}
      </div>
    </section>
  );
}

function PrayerCard({ prayer, handlePray, handleFlag, prayedForIds, getTimeAgo }) {
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

      <div className="relative z-10">
        {prayer.prayedFor && (
          <div className="absolute -top-3 -right-3 bg-gold-500 text-zinc-950 text-xs font-bold px-3 py-1 rounded-full shadow-lg transform rotate-3">
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
              onClick={() => handleFlag(prayer.id)}
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
          
          <div className="relative">
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
