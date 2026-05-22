import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { listenToTestimonies, incrementTestimonyPraise } from '../firebase/api';
import html2canvas from 'html2canvas';
import ShareStoryCard from '../components/ShareStoryCard';
import TestimonyCard from '../components/TestimonyCard';
import { Link } from 'react-router-dom';
import { useRef } from 'react';

export default function TestimoniesWall({ limit }) {
  const [testimonies, setTestimonies] = useState([]);
  const [praisedIds, setPraisedIds] = useState(new Set());
  const [shareData, setShareData] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const shareCardRef = useRef(null);

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

  const handleShare = async (testimony) => {
    setIsGenerating(true);
    setShareData(testimony);
    
    // Wait for React to render the hidden component
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
          link.download = 'my-testimony.png';
          link.click();
        } catch (error) {
          console.error("Error generating image:", error);
        }
      }
      setIsGenerating(false);
      setShareData(null);
    }, 150);
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

  if (testimonies.length === 0) return null;

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
          <h2 className="text-3xl md:text-5xl font-bold mb-6 glow-text text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-400">Look What God Has Done</h2>
          <p className="text-zinc-400 font-light max-w-2xl mx-auto text-lg">
            Real stories of answered prayers, healing, and miracles from our community.
          </p>
        </div>

        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
          <AnimatePresence mode="popLayout">
            {(limit ? testimonies.slice(0, limit) : testimonies).map((testimony) => (
              <TestimonyCard 
                key={testimony.id} 
                testimony={testimony} 
                handlePraise={handlePraise} 
                handleShare={handleShare}
                praisedIds={praisedIds} 
                getTimeAgo={getTimeAgo} 
                isGenerating={isGenerating}
              />
            ))}
          </AnimatePresence>
        </div>

        {limit && testimonies.length > limit && (
          <div className="mt-12 text-center">
            <Link 
              to="/testimonies" 
              className="inline-flex items-center gap-2 px-8 py-4 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 rounded-full font-medium transition-all hover:scale-105 border border-zinc-800 hover:border-zinc-700 shadow-lg"
            >
              Read All Testimonies &rarr;
            </Link>
          </div>
        )}
      </div>

      {shareData && (
        <ShareStoryCard 
          ref={shareCardRef}
          type="testimony"
          title={shareData.title}
          content={shareData.content}
          category={shareData.category}
        />
      )}
    </section>
  );
}

