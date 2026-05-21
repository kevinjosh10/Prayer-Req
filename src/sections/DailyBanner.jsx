import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X } from 'lucide-react';
import { useState, useEffect } from 'react';

const verses = [
  '"The Lord is near to the brokenhearted and saves the crushed in spirit." - Psalm 34:18',
  '"Come to me, all who labor and are heavy laden, and I will give you rest." - Matthew 11:28',
  '"Peace I leave with you; my peace I give to you." - John 14:27',
  '"Cast all your anxiety on him because he cares for you." - 1 Peter 5:7',
  '"For I know the plans I have for you, declares the Lord, plans for welfare and not for evil, to give you a future and a hope." - Jeremiah 29:11',
  '"Be strong and courageous. Do not be frightened, and do not be dismayed, for the Lord your God is with you wherever you go." - Joshua 1:9',
  '"He heals the brokenhearted and binds up their wounds." - Psalm 147:3',
  '"When you pass through the waters, I will be with you." - Isaiah 43:2'
];

export default function DailyBanner() {
  const [isVisible, setIsVisible] = useState(true);
  const [verse, setVerse] = useState('');

  useEffect(() => {
    // Pick a verse based on the day of the year so it changes daily but is consistent for all users
    const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
    setVerse(verses[dayOfYear % verses.length]);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && verse && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20, height: 0, overflow: 'hidden' }}
          className="bg-zinc-900/80 backdrop-blur-md border-b border-white/5 py-3 relative z-50"
        >
          <div className="container mx-auto px-4 flex items-center justify-center gap-3">
            <Sparkles className="w-4 h-4 text-gold-400 shrink-0" />
            <p className="text-zinc-300 text-sm font-light text-center">
              {verse}
            </p>
            <button 
              onClick={() => setIsVisible(false)}
              className="absolute right-4 text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
