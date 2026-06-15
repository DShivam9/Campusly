import React from 'react';
import { motion } from 'framer-motion';

interface LearnMoreProps {
  onBack: () => void;
}

export const LearnMore: React.FC<LearnMoreProps> = ({ onBack }) => {
  return (
    <div
      className="min-h-screen overflow-hidden text-white"
      style={{ background: 'linear-gradient(135deg, #0a0c10 0%, #0f1218 30%, #111827 60%, #0d1017 100%)' }}
    >
      {/* Header */}
      <div className="sticky top-0 z-50 border-b border-white/[0.06] bg-surface-100/80 backdrop-blur-lg">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white/90">Learn More</h1>
          <button
            onClick={onBack}
            className="px-5 py-2 border border-white/[0.12] text-white/60 rounded-lg hover:bg-white/[0.05] hover:border-white/[0.2] transition-all duration-200 text-sm font-medium"
          >
            ← Back
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="space-y-12"
        >
          {/* Features Section */}
          <section>
            <h2 className="text-2xl font-bold mb-8 text-white/90">Key Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[
                { title: 'Smart Attendance', desc: 'AI-powered attendance tracking with biometric support' },
                { title: 'Event Management', desc: 'Create, manage, and promote campus events effortlessly' },
                { title: 'Marketplace', desc: 'Buy and sell items within the campus community' },
                { title: 'Alumni Network', desc: 'Connect with alumni and build lasting relationships' },
                { title: 'Grade Tracking', desc: 'Monitor your academic progress in real-time' },
                { title: 'Bus Tracking', desc: 'Real-time campus bus location and schedules' },
              ].map((feature, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * idx, duration: 0.6 }}
                  className="p-6 rounded-xl bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.15] hover:bg-white/[0.05] transition-all duration-300"
                >
                  <h3 className="text-base font-semibold text-white/80 mb-2">{feature.title}</h3>
                  <p className="text-sm text-white/40 leading-relaxed">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Benefits Section */}
          <section>
            <h2 className="text-2xl font-bold mb-8 text-white/90">Why Choose Us?</h2>
            <div className="space-y-3">
              {[
                'Secure and encrypted data handling',
                'User-friendly and intuitive interface',
                '24/7 support and regular updates',
                'Mobile-responsive design',
                'Real-time notifications and alerts',
              ].map((benefit, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * idx, duration: 0.6 }}
                  className="flex items-center gap-4 p-4 rounded-lg bg-white/[0.03] border border-white/[0.07] hover:border-accent/30 transition-all duration-300"
                >
                  <div className="text-accent text-lg">✓</div>
                  <p className="text-white/55 text-sm">{benefit}</p>
                </motion.div>
              ))}
            </div>
          </section>
        </motion.div>
      </div>
    </div>
  );
};
