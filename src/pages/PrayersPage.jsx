import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import CommunityWall from '../sections/CommunityWall';

export default function PrayersPage() {
  return (
    <div className="min-h-screen bg-black font-sans relative">
      {/* Background glow */}
      <div className="fixed inset-0 z-[0] pointer-events-none">
        <div className="absolute top-0 left-1/4 w-1/2 h-[500px] rounded-full bg-[var(--color-gold-600)] opacity-[0.03] blur-[120px] mix-blend-screen"></div>
      </div>

      <header className="py-6 px-6 md:px-12 relative z-20">
        <div className="container mx-auto flex items-center">
          <Link to="/" className="text-zinc-500 hover:text-zinc-300 transition-colors flex items-center gap-2 text-sm font-medium uppercase tracking-wider">
            <ArrowLeft size={16} /> Back Home
          </Link>
        </div>
      </header>

      <main className="relative z-10 -mt-12">
        <CommunityWall showUnpinnedOnly={true} />
      </main>
    </div>
  );
}
