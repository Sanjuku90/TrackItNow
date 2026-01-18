import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Smartphone, Apple, CheckCircle2 } from "lucide-react";
import { Platform } from "@/lib/device-data";
import { motion } from "framer-motion";

interface PlatformSelectionProps {
  onPlatformSelect: (platform: Platform) => void;
  selectedPlatform: Platform;
}

export function PlatformSelection({ onPlatformSelect, selectedPlatform }: PlatformSelectionProps) {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-4">Select Device Platform</h2>
        <p className="text-slate-400">Choose the operating system of the device you want to locate.</p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-8">
        {[
          { id: 'android', name: 'Android', icon: Smartphone, color: 'emerald' },
          { id: 'ios', name: 'iOS / iPhone', icon: Apple, color: 'blue' }
        ].map((p) => (
          <motion.div
            key={p.id}
            whileHover={{ y: -5 }}
            whileTap={{ scale: 0.98 }}
            className={`relative group cursor-pointer rounded-[2rem] border-2 transition-all duration-300 p-8 flex flex-col items-center text-center ${
              selectedPlatform === p.id 
                ? `bg-${p.color}-500/10 border-${p.color}-500 shadow-xl shadow-${p.color}-500/10` 
                : 'bg-white/5 border-white/5 hover:border-white/10'
            }`}
            onClick={() => onPlatformSelect(p.id as Platform)}
          >
            {selectedPlatform === p.id && (
              <div className="absolute top-6 right-6">
                <CheckCircle2 className={`text-${p.color}-400 w-6 h-6`} />
              </div>
            )}
            <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-6 bg-${p.color}-500/10 text-${p.color}-400 group-hover:scale-110 transition-transform`}>
              <p.icon size={40} />
            </div>
            <h3 className="text-2xl font-bold mb-2 text-white">{p.name}</h3>
            <p className="text-slate-400 leading-relaxed">
              Track any {p.name} smartphone or tablet using satellite GPS.
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
