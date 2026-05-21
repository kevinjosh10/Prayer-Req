import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { listenToPrayerRequests } from '../firebase/api';
import { Globe2, Heart, Sparkles } from 'lucide-react';

export default function GlobalImpact() {
  const [stats, setStats] = useState({ total: 0, answered: 0 });

  useEffect(() => {
    // We listen to the global requests to compute stats
    const unsubscribe = listenToPrayerRequests((data) => {
      let answeredCount = 0;
      data.forEach(prayer => {
        if (prayer.prayedFor) {
          answeredCount++;
        }
      });
      setStats({
        total: data.length,
        answered: answeredCount
      });
    });
    
    return () => unsubscribe();
  }, []);

  return (
    <section className="py-16 relative overflow-hidden bg-[#09090b] border-t border-b border-white/5">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--color-gold-500)]/5 to-transparent z-0"></div>
      
      <div className="container mx-auto px-6 relative z-10 flex flex-col md:flex-row items-center justify-center gap-12">
        
        <div className="text-center md:text-right flex-1">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex flex-col items-center md:items-end"
          >
            <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-4 text-zinc-400">
              <Globe2 size={24} />
            </div>
            <h3 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-2">
              {stats.total.toLocaleString()}
            </h3>
            <p className="text-zinc-500 uppercase tracking-widest text-sm font-semibold">Prayers Submitted</p>
          </motion.div>
        </div>

        <div className="w-[1px] h-24 bg-gradient-to-b from-transparent via-white/10 to-transparent hidden md:block"></div>

        <div className="text-center md:text-left flex-1">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex flex-col items-center md:items-start"
          >
            <div className="w-12 h-12 rounded-full bg-[var(--color-gold-500)]/10 border border-[var(--color-gold-500)]/20 flex items-center justify-center mb-4 text-[var(--color-gold-400)] shadow-[0_0_15px_rgba(232,208,141,0.2)]">
              <Heart size={24} />
            </div>
            <h3 className="text-4xl md:text-5xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-gold-400)] to-[var(--color-gold-600)] mb-2 drop-shadow-[0_0_10px_rgba(232,208,141,0.3)]">
              {stats.answered.toLocaleString()}
            </h3>
            <p className="text-[var(--color-gold-500)]/80 uppercase tracking-widest text-sm font-semibold flex items-center gap-2">
              Prayers Answered <Sparkles size={14} />
            </p>
          </motion.div>
        </div>

      </div>
    </section>
  );
}
