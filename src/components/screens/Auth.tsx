import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { Loader2, GraduationCap, ArrowRight } from 'lucide-react';
import Silk from '../ui/Silk';

interface AuthProps {
  onLogin: () => void;
}

export const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const { login, isLoading, error, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!email || !password) return;
    try {
      await login(email, password);
      onLogin();
    } catch {
      // error is set in context
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleLogin();
  };

  const fillDemo = (demoEmail: string, demoPass: string) => {
    clearError();
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="min-h-screen bg-black text-white relative flex items-center justify-center p-6 selection:bg-white selection:text-black overflow-hidden font-body">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Silk 
          className="w-full h-full opacity-[0.8]" 
          color="#cbd5e1" 
          speed={0.5} 
          scale={1.2} 
        />
      </div>

      {/* Header Overlay */}
      <div className="absolute top-0 left-0 right-0 p-8 flex items-center gap-3 z-20">
        <div className="w-8 h-8 rounded bg-white flex items-center justify-center">
          <GraduationCap className="w-5 h-5 text-black" />
        </div>
        <span className="text-xl font-bold tracking-tight text-white">Campusly</span>
      </div>

      {/* Auth Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="bg-zinc-900/60 backdrop-blur-3xl p-10 border border-zinc-800 shadow-2xl">
          <div className="mb-10">
            <h1 className="font-heading text-4xl font-bold text-white mb-2 italic">Welcome back.</h1>
            <p className="text-zinc-500 font-light tracking-wide uppercase text-[10px]">Secure Identity Portal</p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="mb-8 p-4 bg-red-500/10 border-l-2 border-red-500 text-red-100 text-[10px] uppercase font-bold tracking-widest"
            >
              {error}
            </motion.div>
          )}

          <div className="space-y-6">
            <div className="group">
              <label className="block text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-2 group-focus-within:text-zinc-300 transition-colors">
                Academic Identifier
              </label>
              <input
                type="email"
                placeholder="email@campusly.edu"
                value={email}
                onChange={(e) => { setEmail(e.target.value); clearError(); }}
                onKeyDown={handleKeyPress}
                className="input-dark w-full"
                disabled={isLoading}
              />
            </div>
            
            <div className="group">
              <label className="block text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-2 group-focus-within:text-zinc-300 transition-colors">
                Security Credential
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => { setPassword(e.target.value); clearError(); }}
                onKeyDown={handleKeyPress}
                className="w-full bg-zinc-900/50 border border-zinc-800 px-4 py-3 text-sm text-white focus:outline-none focus:border-zinc-500 transition-all placeholder:text-zinc-700"
                disabled={isLoading}
              />
            </div>

            <button
              onClick={handleLogin}
              disabled={!email || !password || isLoading}
              className={`w-full py-4 font-bold text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 border ${
                email && password && !isLoading
                  ? 'bg-white text-zinc-950 border-white hover:bg-transparent hover:text-white'
                  : 'bg-transparent text-zinc-700 border-zinc-900 cursor-not-allowed'
              }`}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
              ) : (
                <>
                  Access Terminal
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          {/* Quick Access */}
          <div className="mt-12 pt-8 border-t border-zinc-800">
            <p className="text-[10px] uppercase tracking-widest font-bold text-zinc-600 mb-6">Simulation Profiles</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Student', email: 'rahul@campusly.edu', pass: 'student123' },
                { label: 'Faculty', email: 'prof.sharma@campusly.edu', pass: 'faculty123' },
                { label: 'Admin', email: 'admin@campusly.edu', pass: 'admin123' },
                { label: 'Alumni', email: 'anita.alumni@campusly.edu', pass: 'alumni123' },
              ].map((demo) => (
                <button
                  key={demo.email}
                  onClick={() => fillDemo(demo.email, demo.pass)}
                  className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-zinc-400 bg-zinc-950/40 border border-zinc-900 hover:border-zinc-700 hover:text-white transition-all text-center"
                >
                  {demo.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        <p className="text-center text-[10px] uppercase tracking-[0.3em] font-medium text-zinc-600 mt-8">
          © {new Date().getFullYear()} Campusly Infrastructure
        </p>
      </motion.div>
    </div>
  );
};

