import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Clock, User, Filter } from 'lucide-react';
import { listenToPrayerRequests, incrementCommunityPrayer } from '../firebase/api';

const ALL_CATEGORIES = ["All", "Healing", "Anxiety", "Family", "Financial", "Depression", "Relationship", "Spiritual", "Other"];

export default function CommunityWall() {
  const [prayers, setPrayers] = useState([]);
  const [prayedForIds, setPrayedForIds] = useState(new Set());
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    const unsubscribe = listenToPrayerRequests((data) => {
      // Filter out private prayers
      const publicPrayers = data.filter(p => p.isPublic !== false);
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
              <motion.div
                layout
                key={prayer.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                className="break-inside-avoid glass-card rounded-3xl p-6 md:p-8 hover:bg-zinc-900/60 transition-colors border border-white/5 relative group inline-block w-full"
              >
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
                  <div className="flex items-center gap-1 text-zinc-600 text-xs font-light">
                    <Clock size={12} />
                    <span>{getTimeAgo(prayer.createdAt)}</span>
                  </div>
                </div>
                
                <p className="text-zinc-300 font-light leading-relaxed mb-6 whitespace-pre-wrap">
                  "{prayer.request}"
                </p>
                
                <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-auto">
                  <span className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">
                    {prayer.category !== 'Uncategorized' ? prayer.category : 'Other'}
                  </span>
                  
                  <button
                    onClick={() => handlePray(prayer.id)}
                    disabled={prayedForIds.has(prayer.id)}
                    className={`flex items-center gap-2 text-xs font-medium px-4 py-2 rounded-full transition-all ${
                      prayedForIds.has(prayer.id)
                        ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                        : 'bg-zinc-900 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 border border-zinc-800 hover:border-red-500/20'
                    }`}
                  >
                    <Heart 
                      size={14} 
                      className={prayedForIds.has(prayer.id) ? "fill-red-400" : ""} 
                    />
                    <span>
                      {(prayer.communityPrayers || 0) + (prayedForIds.has(prayer.id) ? (prayer.communityPrayers ? 0 : 1) : 0)} Praying
                    </span>
                  </button>
                </div>
              </motion.div>
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
