import { ChevronRight, GraduationCap, Users, BookOpen, Calendar, Clock, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Silk from '../ui/Silk';

export function Landing() {
  const navigate = useNavigate();

  const features = [
    {
      icon: Clock,
      title: "Smart Attendance",
      description: "Real-time tracking for students and faculty with automated reporting."
    },
    {
      icon: CreditCard,
      title: "Fee Management",
      description: "Secure, transparent digital fee collection and scholarship tracking."
    },
    {
      icon: Calendar,
      title: "Event Hub",
      description: "Coordinate campus-wide events, workshops, and student club activities."
    },
    {
      icon: BookOpen,
      title: "Library OS",
      description: "Deep integration for book search, reservations, and inventory logs."
    }
  ];

  const stats = [
    { label: "Students", value: "12,000+", icon: Users },
    { label: "Faculty", value: "450+", icon: GraduationCap },
    { label: "Placement", value: "94%", icon: ChevronRight }
  ];
  
  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden font-body selection:bg-white selection:text-black">
      {/* Background Layer */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Silk 
          className="w-full h-full opacity-[0.8]" 
          color="#cbd5e1" 
          speed={0.5} 
          scale={1.2} 
        />
      </div>

      {/* Surface Texture */}
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none mix-blend-overlay" 
           style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }} 
      />

      {/* Header */}
      <header className="relative z-20 w-full px-6 py-8 md:px-12 flex justify-between items-center bg-gradient-to-b from-zinc-950/40 to-transparent backdrop-blur-[2px]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-white flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-black" />
          </div>
          <span className="text-xl font-bold tracking-tight">Campusly</span>
        </div>
        <button 
          onClick={() => navigate('/auth')}
          className="px-6 py-2 bg-white text-black text-sm font-semibold rounded-full hover:bg-zinc-200 transition-all hover:scale-105"
        >
          Portal Login
        </button>
      </header>

      <main className="relative z-10 pt-20 md:pt-32 pb-24">
        {/* Hero Section */}
        <section className="px-6 md:px-12 mb-32 max-w-7xl mx-auto">
          <div className="max-w-4xl">
            <h1 className="font-heading text-6xl md:text-8xl lg:text-9xl leading-[0.85] tracking-tighter mb-8 text-white">
              Smart Campus <br />
              <span className="text-zinc-500 italic mix-blend-plus-lighter">Management.</span>
            </h1>
            <p className="text-xl md:text-2xl text-zinc-400 font-light max-w-2xl mb-12 leading-relaxed">
              A comprehensive digital infrastructure designed for modern educational excellence. Streamline operations and enhance student experience with absolute clarity.
            </p>
            <div className="flex flex-wrap gap-4">
              <button 
                onClick={() => navigate('/auth')}
                className="px-8 py-4 bg-zinc-50 text-zinc-950 font-bold rounded flex items-center gap-2 hover:bg-white transition-all group"
              >
                Access Platform
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button 
                className="px-8 py-4 bg-transparent border border-zinc-700 text-zinc-300 font-bold rounded hover:border-zinc-500 transition-all"
              >
                Learn More
              </button>
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="px-6 md:px-12 mb-32 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((feat, i) => (
              <div 
                key={i}
                className="p-8 bg-zinc-900/40 backdrop-blur-md border border-zinc-800/50 hover:border-zinc-600 transition-all group"
              >
                <div className="w-10 h-10 rounded bg-zinc-800 flex items-center justify-center mb-6 group-hover:bg-zinc-50 group-hover:text-zinc-950 transition-colors">
                  <feat.icon className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{feat.title}</h3>
                <p className="text-sm text-zinc-400 leading-relaxed font-light">{feat.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Stats Section */}
        <section className="px-6 md:px-12 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 border-t border-b border-zinc-800/50 py-16 gap-12">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center sm:text-left">
                <div className="text-4xl md:text-5xl font-heading text-white mb-2">{stat.value}</div>
                <div className="text-xs uppercase tracking-[0.2em] text-zinc-500 font-bold">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Minimal Footer */}
      <footer className="relative z-10 w-full px-6 py-12 md:px-12 border-t border-zinc-900 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] tracking-widest uppercase text-zinc-500">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-zinc-800 flex items-center justify-center">
            <GraduationCap className="w-2.5 h-2.5" />
          </div>
          <span>© {new Date().getFullYear()} Campusly Infrastructure</span>
        </div>
        <div className="flex gap-8">
          <span className="hover:text-zinc-200 transition-colors cursor-pointer">Security</span>
          <span className="hover:text-zinc-200 transition-colors cursor-pointer">Privacy</span>
          <span className="hover:text-zinc-200 transition-colors cursor-pointer">System Status</span>
        </div>
      </footer>
    </div>
  );
}
