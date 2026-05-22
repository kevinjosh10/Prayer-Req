import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, User, Share2 } from 'lucide-react';
import { listenToTestimonies, incrementTestimonyPraise } from '../firebase/api';
import html2canvas from 'html2canvas';
import ShareStoryCard from '../components/ShareStoryCard';
import { useRef } from 'react';

export default function TestimoniesWall() {
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
            {testimonies.slice(0, 24).map((testimony) => (
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

function TestimonyCard({ testimony, handlePraise, handleShare, praisedIds, getTimeAgo, isGenerating }) {
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
      className="break-inside-avoid bg-zinc-900/40 rounded-3xl p-6 md:p-8 hover:bg-zinc-900/80 transition-colors border border-[var(--color-gold-500)]/20 relative group inline-block w-full overflow-hidden shadow-[0_4px_30px_rgba(232,208,141,0.05)] hover:shadow-[0_4px_30px_rgba(232,208,141,0.1)]"
    >
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-[var(--color-gold-400)]">
            <User size={14} />
            <span className="text-sm font-medium">{testimony.name || 'Anonymous'}</span>
          </div>
          <div className="flex items-center gap-1 text-zinc-500 text-xs font-light">
            <Clock size={12} />
            <span>{getTimeAgo(testimony.createdAt)}</span>
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
          
          <div className="relative">
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
            
            <button
              onClick={() => handleShare(testimony)}
              disabled={isGenerating}
              className="ml-3 p-2 rounded-full bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors disabled:opacity-50"
              title="Share to Instagram Story"
            >
              <Share2 size={16} />
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
