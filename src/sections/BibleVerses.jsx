import { motion } from 'framer-motion';

const verses = [
  {
    text: "Come to me, all you who are weary and burdened, and I will give you rest.",
    reference: "Matthew 11:28"
  },
  {
    text: "Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God.",
    reference: "Philippians 4:6"
  },
  {
    text: "The righteous cry out, and the Lord hears them; he delivers them from all their troubles.",
    reference: "Psalm 34:17"
  },
  {
    text: "For I know the plans I have for you... plans to prosper you and not to harm you, plans to give you hope and a future.",
    reference: "Jeremiah 29:11"
  }
];

export default function BibleVerses() {
  return (
    <section id="bible-verses" className="py-24 relative">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-semibold mb-4">God's Promises</h2>
          <div className="w-12 h-[2px] bg-[var(--color-gold-500)] mx-auto opacity-50"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {verses.map((verse, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="glass-card p-8 rounded-2xl flex flex-col justify-between glow-border transition-all duration-300"
            >
              <p className="text-lg md:text-xl font-light leading-relaxed text-zinc-200 mb-6 italic">
                "{verse.text}"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-6 h-[1px] bg-[var(--color-gold-500)]"></div>
                <span className="text-[var(--color-gold-400)] font-medium text-sm tracking-widest uppercase">
                  {verse.reference}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
