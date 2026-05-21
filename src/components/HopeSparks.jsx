import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { listenToNewPrayers } from '../firebase/api';

export default function HopeSparks() {
  const [sparks, setSparks] = useState([]);

  useEffect(() => {
    const unsubscribe = listenToNewPrayers((newPrayer) => {
      // Create a spark at a random horizontal position
      const id = Date.now() + Math.random().toString();
      const newSpark = {
        id,
        x: Math.random() * 80 + 10, // 10% to 90% across screen
      };
      
      setSparks(prev => [...prev, newSpark]);
      
      // Remove spark after animation completes
      setTimeout(() => {
        setSparks(prev => prev.filter(s => s.id !== id));
      }, 5000);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
      <AnimatePresence>
        {sparks.map(spark => (
          <motion.div
            key={spark.id}
            initial={{ 
              opacity: 0, 
              y: '100vh', 
              x: `${spark.x}vw`,
              scale: 0.5 
            }}
            animate={{ 
              opacity: [0, 1, 1, 0], 
              y: '-10vh', 
              x: [`${spark.x}vw`, `${spark.x + (Math.random() * 5 - 2.5)}vw`],
              scale: [0.5, 1.5, 1, 0.5] 
            }}
            transition={{ 
              duration: 4.5, 
              ease: "easeOut",
              opacity: { times: [0, 0.2, 0.8, 1] }
            }}
            className="absolute bottom-0 w-2 h-2 rounded-full bg-gold-400 shadow-[0_0_20px_4px_var(--color-gold-500)]"
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
