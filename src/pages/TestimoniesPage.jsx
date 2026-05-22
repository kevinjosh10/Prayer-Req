import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import TestimoniesWall from '../sections/TestimoniesWall';

export default function TestimoniesPage() {
  return (
    <div className="min-h-screen bg-[#09090b] font-sans relative">
      <header className="py-6 px-6 md:px-12 relative z-20">
        <div className="container mx-auto flex items-center">
          <Link to="/" className="text-zinc-500 hover:text-zinc-300 transition-colors flex items-center gap-2 text-sm font-medium uppercase tracking-wider">
            <ArrowLeft size={16} /> Back Home
          </Link>
        </div>
      </header>

      <main className="relative z-10 -mt-12">
        <TestimoniesWall />
      </main>
    </div>
  );
}
