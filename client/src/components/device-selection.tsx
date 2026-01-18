import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Smartphone, Search, Check, ChevronRight } from "lucide-react";
import { deviceData, Platform } from "@/lib/device-data";
import { useState, useMemo } from "react";
import { motion } from "framer-motion";

interface DeviceSelectionProps {
  platform: Platform;
  selectedDevice: string;
  onDeviceSelect: (device: string) => void;
  isVisible: boolean;
}

export function DeviceSelection({ platform, selectedDevice, onDeviceSelect, isVisible }: DeviceSelectionProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const devices = platform ? deviceData[platform] : [];

  const filteredDevices = useMemo(() => {
    if (!searchQuery.trim()) return devices;
    const query = searchQuery.toLowerCase();
    return devices.filter(device => device.toLowerCase().includes(query));
  }, [devices, searchQuery]);

  if (!isVisible || !platform) return null;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-4">Select Device Model</h2>
        <p className="text-slate-400">Search for the specific model of the device you want to track.</p>
      </div>
      
      <div className="grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3 space-y-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
            <Input
              type="text"
              placeholder="Search by brand or model..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-14 pl-12 bg-white/5 border-white/10 rounded-2xl text-lg focus:ring-primary focus:border-primary"
            />
          </div>
          
          <ScrollArea className="h-[400px] rounded-[2rem] border border-white/5 bg-white/[0.02] p-2">
            <div className="grid gap-2">
              {filteredDevices.map((device) => (
                <button
                  key={device}
                  onClick={() => onDeviceSelect(device)}
                  className={`w-full text-left px-6 py-4 rounded-2xl transition-all duration-200 flex items-center justify-between group ${
                    selectedDevice === device 
                      ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                      : 'hover:bg-white/5 text-slate-300'
                  }`}
                >
                  <span className="flex items-center font-medium">
                    <Smartphone className="mr-4 opacity-50" size={18} />
                    {device}
                  </span>
                  {selectedDevice === device ? (
                    <Check size={18} />
                  ) : (
                    <ChevronRight className="opacity-0 group-hover:opacity-50 transition-opacity" size={18} />
                  )}
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>
        
        <div className="lg:col-span-2">
          <div className={`h-full min-h-[300px] rounded-[2.5rem] border-2 border-dashed transition-all duration-500 flex flex-col items-center justify-center p-8 text-center ${
            selectedDevice 
              ? 'bg-primary/5 border-primary/30' 
              : 'bg-white/[0.02] border-white/10'
          }`}>
            <motion.div
              animate={selectedDevice ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 0.5 }}
            >
              <div className={`w-24 h-24 rounded-3xl flex items-center justify-center mb-6 transition-colors ${
                selectedDevice ? 'bg-primary/20 text-primary' : 'bg-white/5 text-slate-600'
              }`}>
                <Smartphone size={48} />
              </div>
            </motion.div>
            <h4 className="text-xl font-bold mb-2">{selectedDevice || 'No Device Selected'}</h4>
            <p className="text-sm text-slate-500 leading-relaxed">
              {selectedDevice 
                ? 'Device selected and ready for military-grade satellite authentication.' 
                : 'Select a model from the list to proceed to the next step of tracking.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
