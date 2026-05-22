import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { listenToTestimonies, incrementTestimonyPraise } from '../firebase/api';
import TestimonyCard from '../components/TestimonyCard';
import { Link } from 'react-router-dom';

export default function TestimoniesWall({ showPinnedOnly, showUnpinnedOnly }) {
  const [testimonies, setTestimonies] = useState([]);
  const [praisedIds, setPraisedIds] = useState(new Set());

  useEffect(() => {
    const unsubscribe = listenToTestimonies((data) => {
      setTestimonies(data);
    });
    return () => unsubscribe();
  }, []);

  const handlePraise = async (id) => {
    if (praisedIds.has(id)) return;
    
    setPraisedIds(prev => new Set(prev).add(id));
    
    try {
      await incrementTestimonyPraise(id);
    } catch (e) {
      console.error("Failed to increment praise:", e);
      setPraisedIds(prev => {
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

  let filteredTestimonies = testimonies;
  if (showPinnedOnly) {
    filteredTestimonies = filteredTestimonies.filter(t => t.isPinned);
  } else if (showUnpinnedOnly) {
    filteredTestimonies = filteredTestimonies.filter(t => !t.isPinned);
  }

  if (testimonies.length === 0 && !showPinnedOnly) return null;

  return (
    <section className="py-24 relative overflow-hidden bg-[#09090b] border-t border-zinc-800/50">
      <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-gold-500)]/5 to-transparent opacity-50 pointer-events-none" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-gold-500)]/10 text-[var(--color-gold-400)] text-sm font-medium mb-6"
          >
            <span>🙌</span> Praise Reports
          </motion.div>
          <h2 className="text-3xl md:text-5xl font-bold mb-6 glow-text text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-400">
            {showPinnedOnly ? "Featured Testimonies" : "Look What God Has Done"}
          </h2>
          <p className="text-zinc-400 font-light max-w-2xl mx-auto text-lg">
            {showPinnedOnly
              ? "Read our featured stories of answered prayers, healing, and miracles."
              : "Real stories of answered prayers, healing, and miracles from our community."}
          </p>
        </div>

        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
          <AnimatePresence mode="popLayout">
            {filteredTestimonies.map((testimony) => (
              <TestimonyCard 
                key={testimony.id} 
                testimony={testimony} 
                handlePraise={handlePraise} 
                praisedIds={praisedIds} 
                getTimeAgo={getTimeAgo} 
              />
            ))}
          </AnimatePresence>
        </div>

        {filteredTestimonies.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 text-zinc-500 font-light"
          >
            {showPinnedOnly ? "No testimonies are currently featured." : "No testimonies found right now."}
          </motion.div>
        )}

        {showPinnedOnly && testimonies.filter(t => !t.isPinned).length > 0 && (
          <div className="mt-16 text-center relative z-10">
            <Link 
              to="/testimonies" 
              className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-[var(--color-gold-600)] to-[var(--color-gold-500)] text-zinc-950 rounded-full font-bold transition-all hover:scale-105 shadow-[0_0_40px_rgba(232,208,141,0.3)] hover:shadow-[0_0_60px_rgba(232,208,141,0.5)]"
            >
              Read All Testimonies &rarr;
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

