import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter } from 'lucide-react';
import { listenToPrayerRequests, incrementCommunityPrayer, flagPrayerRequest } from '../firebase/api';
import { Link } from 'react-router-dom';
import PrayerCard from '../components/PrayerCard';
import html2canvas from 'html2canvas';
import ShareStoryCard from '../components/ShareStoryCard';
import { useRef } from 'react';

const ALL_CATEGORIES = ["All", "Healing", "Anxiety", "Family", "Financial", "Depression", "Relationship", "Spiritual", "Other"];

export default function CommunityWall({ showPinnedOnly, showUnpinnedOnly }) {
  const [prayers, setPrayers] = useState([]);
  const [prayedForIds, setPrayedForIds] = useState(new Set());
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [shareData, setShareData] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const shareCardRef = useRef(null);

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

  const handleShare = async (prayer) => {
    setIsGenerating(true);
    setShareData(prayer);
    
    setTimeout(async () => {
      if (shareCardRef.current) {
        try {
          const canvas = await html2canvas(shareCardRef.current, {
            scale: 1,
            backgroundColor: '#09090b',
            logging: false,
            useCORS: true
          });
          const image = canvas.toDataURL('image/png');
          const link = document.createElement('a');
          link.href = image;
          link.download = 'prayer.png';
          link.click();
        } catch (error) {
          console.error("Error generating image:", error);
        }
      }
      setIsGenerating(false);
      setShareData(null);
    }, 150);
  };

  let filteredPrayers = selectedCategory === "All" 
    ? prayers
    : prayers.filter(p => p.category === selectedCategory || (selectedCategory === "Other" && p.category === "Uncategorized"));

  if (showPinnedOnly) {
    filteredPrayers = filteredPrayers.filter(p => p.isPinned);
  } else if (showUnpinnedOnly) {
    filteredPrayers = filteredPrayers.filter(p => !p.isPinned);
  }

  // If we are strictly showing pinned but there are none, don't render the section.
  // Wait, if we want to show a message, we can let it render the "No prayers found" state.
  if (prayers.length === 0 && !showPinnedOnly) return null;

  return (
    <section className="py-24 relative overflow-hidden bg-black/50">
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900/50 text-zinc-400 text-sm font-medium mb-6 border border-zinc-800"
          >
            <span className="text-[var(--color-gold-500)]">✨</span> Global Community Wall
          </motion.div>
          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-zinc-500">
            {showPinnedOnly ? "Featured Prayers" : "You Are Not Alone"}
          </h2>
          <p className="text-zinc-400 font-light max-w-2xl mx-auto text-lg leading-relaxed">
            {showPinnedOnly 
              ? "Read and lift up these special requests selected from our community." 
              : "Every whisper is heard. Stand together and lift up these anonymous prayers from around the world."}
          </p>
        </div>

        {/* Filters - Only show if not limited by pinned */}
        {!showPinnedOnly && (
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
        )}

        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
          <AnimatePresence mode="popLayout">
            {filteredPrayers.map((prayer) => (
              <PrayerCard 
                key={prayer.id} 
                prayer={prayer} 
                handlePray={handlePray} 
                handleFlag={handleFlag} 
                handleShare={handleShare}
                prayedForIds={prayedForIds} 
                getTimeAgo={getTimeAgo} 
                isGenerating={isGenerating}
              />
            ))}
          </AnimatePresence>
        </div>
        
        {filteredPrayers.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 text-zinc-500 font-light"
          >
            {showPinnedOnly ? "No prayers are currently featured." : "No prayers found in this category right now."}
          </motion.div>
        )}

        {showPinnedOnly && prayers.filter(p => !p.isPinned).length > 0 && (
          <div className="mt-16 text-center relative z-10">
            <Link 
              to="/prayers" 
              className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-[var(--color-gold-600)] to-[var(--color-gold-500)] text-zinc-950 rounded-full font-bold transition-all hover:scale-105 shadow-[0_0_40px_rgba(232,208,141,0.3)] hover:shadow-[0_0_60px_rgba(232,208,141,0.5)]"
            >
              Lift Up More Prayers &rarr;
            </Link>
          </div>
        )}
      </div>

      {shareData && (
        <ShareStoryCard 
          ref={shareCardRef}
          type="prayer"
          content={shareData.request}
          category={shareData.category}
          verse="Casting all your anxieties on him, because he cares for you."
        />
      )}
    </section>
  );
}


