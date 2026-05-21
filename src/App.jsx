import { HashRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Hero from './sections/Hero';
import BibleVerses from './sections/BibleVerses';
import PrayerForm from './sections/PrayerForm';
import CommunityWall from './sections/CommunityWall';
import AdminPanel from './components/AdminPanel';
import { Shield } from 'lucide-react';
import DailyBanner from './sections/DailyBanner';
import HopeSparks from './components/HopeSparks';

function LandingPage() {
  return (
    <div className="relative min-h-screen font-sans">
      <DailyBanner />
      <HopeSparks />
      {/* Subtle background glow effects */}
      <div className="fixed inset-0 z-[-1] bg-[#09090b]">
        <div className="absolute top-0 left-1/4 w-1/2 h-[500px] rounded-full bg-[var(--color-gold-600)] opacity-[0.03] blur-[120px] mix-blend-screen pointer-events-none"></div>
        <div className="absolute bottom-0 right-1/4 w-1/3 h-[400px] rounded-full bg-zinc-500 opacity-[0.03] blur-[100px] mix-blend-screen pointer-events-none"></div>
      </div>
      
      <Hero />
      <BibleVerses />
      <PrayerForm />
      <CommunityWall />
      
      <footer className="py-16 border-t border-zinc-800/50 relative">
        <div className="container mx-auto px-6 text-center max-w-3xl">
          <p className="text-zinc-400 italic mb-6 font-light text-lg">
            "The Lord is near to all who call on him, to all who call on him in truth." <br />
            <span className="text-zinc-500 text-sm block mt-2">— Psalm 145:18</span>
          </p>
          <div className="flex justify-center mt-12">
            <Link to="/admin" className="text-zinc-600 hover:text-zinc-400 transition-colors flex items-center gap-2 text-xs font-medium tracking-widest uppercase">
              <Shield size={12} /> Admin Access
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    </Router>
  );
}

export default App;
