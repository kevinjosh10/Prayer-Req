import { motion } from 'framer-motion';
import { ArrowDown, Search } from 'lucide-react';
import { useState } from 'react';
import CheckPrayerModal from '../components/CheckPrayerModal';

export default function Hero() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const scrollToForm = () => {
    document.getElementById('prayer-form').scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToVerses = () => {
    document.getElementById('bible-verses').scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 pb-16">
      <div className="absolute inset-0 z-0">
        {/* Abstract beautiful background */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#09090b]/50 to-[#09090b] z-10"></div>
        <motion.div 
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 0.15, scale: 1 }}
          transition={{ duration: 3, ease: "easeOut" }}
          className="w-full h-full bg-[url('https://images.unsplash.com/photo-1490730141103-6cac27aaab94?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center"
        />
      </div>
      
      <div className="container mx-auto px-6 relative z-20 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="mb-6 flex items-center justify-center"
        >
          <div className="w-[1px] h-12 bg-gradient-to-b from-transparent via-[var(--color-gold-500)] to-transparent"></div>
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
            onClick={scrollToVerses}
            className="px-8 py-4 text-zinc-400 hover:text-zinc-200 transition-colors duration-300 font-light hidden md:block"
          >
            Read Promises
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
