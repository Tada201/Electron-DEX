import React from 'react';
import { Settings } from 'lucide-react';
import { motion } from 'framer-motion';

const SettingsTrigger = ({ onClick }) => {
  return (
    <motion.button
      onClick={onClick}
      className="lmstudio-trigger-btn fixed top-4 left-4 z-50 p-3 bg-gray-900 border border-cyan-500/30 rounded-sm hover:border-cyan-400 hover:bg-gray-800 transition-all duration-200 group"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Settings
        className="w-5 h-5 text-cyan-400 group-hover:text-cyan-300 transition-colors duration-200"
      />
      <motion.div
        className="absolute inset-0 bg-cyan-500/10 rounded-sm"
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      />
    </motion.button>
  );
};

export default SettingsTrigger;