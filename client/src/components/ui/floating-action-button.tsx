/**
 * Floating Action Button
 * Quick access to common actions
 */

import { useState } from "react";
import { Sparkles, Upload, MessageSquare, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FABProps {
  onAnalyze?: () => void;
  onUpload?: () => void;
  onChat?: () => void;
}

export function FloatingActionButton({ onAnalyze, onUpload, onChat }: FABProps) {
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    { icon: Sparkles, label: "Analyze", onClick: onAnalyze, color: "bg-blue-600 hover:bg-blue-700" },
    { icon: Upload, label: "Upload PDF", onClick: onUpload, color: "bg-purple-600 hover:bg-purple-700" },
    { icon: MessageSquare, label: "Ask AI", onClick: onChat, color: "bg-emerald-600 hover:bg-emerald-700" },
  ].filter(a => a.onClick);

  return (
    <div className="fixed bottom-8 right-8 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-20 right-0 space-y-3"
          >
            {actions.map((action, idx) => (
              <motion.button
                key={action.label}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => {
                  action.onClick?.();
                  setIsOpen(false);
                }}
                className={`flex items-center gap-3 ${action.color} text-white px-4 py-3 rounded-full shadow-lg transition-all hover:scale-105`}
              >
                <action.icon className="h-5 w-5" />
                <span className="font-semibold pr-1">{action.label}</span>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`h-16 w-16 rounded-full shadow-2xl flex items-center justify-center transition-all ${
          isOpen 
            ? "bg-gray-700 hover:bg-gray-800" 
            : "bg-gradient-to-br from-primary to-blue-600 hover:shadow-primary/50"
        }`}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
            >
              <X className="h-7 w-7 text-white" />
            </motion.div>
          ) : (
            <motion.div
              key="sparkles"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
            >
              <Sparkles className="h-7 w-7 text-white" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
