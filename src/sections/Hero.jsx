import { motion } from 'framer-motion';
import { ArrowDown, Search, Share2, Check } from 'lucide-react';
import { useState } from 'react';
import CheckPrayerModal from '../components/CheckPrayerModal';

export default function Hero() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const scrollToForm = () => {
    document.getElementById('prayer-form').scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToVerses = () => {
    document.getElementById('bible-verses').scrollIntoView({ behavior: 'smooth' });
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Give Your Worries to God',
          text: 'Share your prayer request anonymously, and a community will pray for you tonight.',
          url: url,
        });
      } catch (err) {
        console.error("Error sharing", err);
      }
    } else {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 pb-16">
      <div className="absolute inset-0 z-0 overflow-hidden">
        {/* Lighter overlays so the video is highly visible */}
        <div className="absolute inset-0 bg-[#09090b]/30 z-10" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#09090b] z-10" />
        <motion.video 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.8 }}
          transition={{ duration: 2 }}
          autoPlay 
          loop 
          muted 
          playsInline
          className="w-full h-full object-cover scale-105 filter blur-sm mix-blend-screen"
        >
          {/* Extremely reliable public abstract fluid video */}
          <source src="https://assets.codepen.io/3364143/7btrrd.mp4" type="video/mp4" />
        </motion.video>
      </div>
      
      <div className="container mx-auto px-6 relative z-20 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0, rotate: -15 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 1.2, delay: 0.5, type: "spring", stiffness: 100 }}
          className="mb-6 flex items-center justify-center text-[var(--color-gold-400)] drop-shadow-[0_0_15px_rgba(232,208,141,0.8)]"
        >
          <svg width="32" height="44" viewBox="0 0 24 36" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2V34M4 10H20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="text-5xl md:text-7xl font-bold tracking-tight mb-6"
        >
          Give your worries <br className="hidden md:block"/> 
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-gold-400)] to-[var(--color-gold-600)] glow-text">
            to God.
          </span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.2 }}
          className="text-xl text-zinc-300 max-w-2xl mb-12 font-light leading-relaxed"
        >
          You are not alone. Share your prayer request anonymously, and it will be prayed for tonight.
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.5 }}
          className="flex flex-col sm:flex-row flex-wrap justify-center gap-4 w-full sm:w-auto"
        >
          <button 
            onClick={scrollToForm}
            className="px-8 py-4 bg-zinc-100 text-zinc-900 rounded-full font-medium hover:bg-white hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all duration-300 transform hover:-translate-y-1"
          >
            Submit a Prayer
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-8 py-4 glass text-zinc-100 rounded-full font-medium hover:bg-white/10 transition-all duration-300 border border-white/10 flex items-center justify-center gap-2"
          >
            Check Status
            <Search size={16} className="text-zinc-400" />
          </button>
          <button 
            onClick={handleShare}
            className="px-6 py-4 glass text-[var(--color-gold-400)] rounded-full font-medium hover:bg-[var(--color-gold-500)]/10 transition-all duration-300 border border-[var(--color-gold-500)]/20 flex items-center justify-center gap-2"
          >
            {copied ? (
              <><Check size={16} /> Copied!</>
            ) : (
              <><Share2 size={16} /> Share</>
            )}
          </button>
        </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.5, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20"
      >
        <button onClick={scrollToVerses} className="text-zinc-500 hover:text-zinc-300 transition-colors animate-bounce">
          <ArrowDown size={24} strokeWidth={1} />
        </button>
      </motion.div>

      <CheckPrayerModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </section>
  );
}
