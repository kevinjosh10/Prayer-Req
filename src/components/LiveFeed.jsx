import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { listenToNewPrayers, listenToPrayerInteractions } from '../firebase/api';
import { Heart, Sparkles } from 'lucide-react';

export default function LiveFeed() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Listen for new prayers
    const unsubNew = listenToNewPrayers((prayer) => {
      const id = Date.now() + Math.random().toString();
      const message = prayer.category && prayer.category !== 'Uncategorized' 
        ? `A new prayer for ${prayer.category} was just submitted.` 
        : 'Someone just shared a new prayer request.';
      
      addNotification({ id, message, icon: 'sparkle' });
    });

    // Listen for prayer interactions (someone prayed)
    const unsubInteractions = listenToPrayerInteractions((prayer) => {
      // It's tricky to know exactly what changed without tracking previous state, 
      // but an interaction means the communityPrayers or prayedFor changed.
      const id = Date.now() + Math.random().toString();
      addNotification({ id, message: 'Someone in the world just prayed for a request.', icon: 'heart' });
    });

    return () => {
      unsubNew();
      unsubInteractions();
    };
  }, []);

  const addNotification = (notif) => {
    setNotifications(prev => [...prev, notif]);
    // Remove after 6 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notif.id));
    }, 6000);
  };

  return (
    <div className="fixed bottom-6 left-6 z-50 flex flex-col gap-3 pointer-events-none">
      <AnimatePresence>
        {notifications.map((notif) => (
          <motion.div
            key={notif.id}
            initial={{ opacity: 0, x: -20, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, filter: "blur(5px)" }}
            transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
            className="bg-black/60 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex items-center gap-3 shadow-2xl overflow-hidden relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--color-gold-500)]/10 to-transparent animate-[shimmer_2s_infinite] -translate-x-full"></div>
            
            <div className="w-8 h-8 rounded-full bg-[var(--color-gold-500)]/10 flex items-center justify-center relative z-10 shrink-0">
              {notif.icon === 'heart' ? (
                <Heart size={14} className="text-red-400 fill-red-400" />
              ) : (
                <Sparkles size={14} className="text-[var(--color-gold-400)]" />
              )}
            </div>
            <p className="text-sm text-zinc-300 font-light relative z-10">{notif.message}</p>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
