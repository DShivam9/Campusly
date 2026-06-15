import React, { useState } from 'react';
import { motion } from 'framer-motion';

export interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
  color: 'cyan' | 'magenta' | 'purple' | 'lime' | 'electric';
}

export interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  onTabChange?: (tabId: string) => void;
}

const colorClasses: Record<string, { underline: string; text: string; glow: string }> = {
  cyan: {
    underline: 'tab-underline-cyan',
    text: 'neon-text-cyan',
    glow: 'shadow-neon-cyan',
  },
  magenta: {
    underline: 'tab-underline-magenta',
    text: 'neon-text-magenta',
    glow: 'shadow-neon-magenta',
  },
  purple: {
    underline: 'tab-underline-purple',
    text: 'neon-text-purple',
    glow: 'shadow-neon-purple',
  },
  lime: {
    underline: 'tab-underline-lime',
    text: 'neon-text-lime',
    glow: 'shadow-neon-lime',
  },
  electric: {
    underline: 'tab-underline-electric',
    text: 'neon-text-electric',
    glow: 'shadow-neon-electric',
  },
};

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  defaultTab = tabs[0]?.id,
  onTabChange,
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    onTabChange?.(tabId);
  };

  const activeTabData = tabs.find((tab) => tab.id === activeTab);

  return (
    <div className="w-full h-full flex flex-col">
      {/* Tab Buttons */}
      <div className="relative flex justify-center gap-2 px-4 pt-8 pb-2 border-b border-white/10">
        {/* Blurred background glow effect */}
        <div className="absolute inset-0 top-0 h-20 bg-gradient-to-b from-white/5 to-transparent blur-xl opacity-50" />
        
        <div className="relative flex gap-4 flex-wrap justify-center md:flex-nowrap">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const colorClass = colorClasses[tab.color];

            return (
              <motion.button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`relative px-6 py-3 rounded-lg font-bold text-lg transition-all duration-300 ease-out whitespace-nowrap ${
                  isActive
                    ? `${colorClass.text} bg-white/5 backdrop-blur-sm border border-white/20`
                    : 'text-white/60 bg-transparent border border-white/5 hover:border-white/20'
                } hover:text-white/80`}
                whileHover={{
                  scale: 1.05,
                  boxShadow: isActive
                    ? `0 0 20px ${tab.color === 'cyan' ? '#00f0ff' : tab.color === 'magenta' ? '#ff00ff' : tab.color === 'purple' ? '#b400ff' : tab.color === 'lime' ? '#00ff00' : '#0080ff'}`
                    : 'none',
                }}
                whileTap={{ scale: 0.98 }}
              >
                {tab.label}
                
                {/* Active indicator underline */}
                {isActive && (
                  <motion.div
                    className={`tab-underline ${colorClass.underline} w-full`}
                    layoutId="activeIndicator"
                    initial={{ opacity: 0, scaleX: 0 }}
                    animate={{ opacity: 1, scaleX: 1 }}
                    exit={{ opacity: 0, scaleX: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-auto">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="h-full"
        >
          <div className="p-6 md:p-8 h-full">
            {activeTabData?.content}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Tabs;
