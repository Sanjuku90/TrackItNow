import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Smartphone, Search, Check } from "lucide-react";
import { deviceData, Platform } from "@/lib/device-data";
import { useState, useMemo } from "react";

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
    <div className="mb-8 animate-in slide-in-from-bottom-5 duration-300">
      <Card className="bg-slate-800/50 backdrop-blur-lg border-slate-700/50">
        <CardContent className="p-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <Smartphone className="text-blue-400 mr-3" size={24} />
            Select Device Model
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <Label className="block text-sm font-medium mb-2 text-slate-300">
                Search your device
              </Label>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                <Input
                  type="text"
                  placeholder="Search by brand or model..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500"
                  data-testid="input-device-search"
                />
              </div>
              
              <Label className="block text-sm font-medium mb-2 text-slate-300">
                {filteredDevices.length} device{filteredDevices.length !== 1 ? 's' : ''} found
              </Label>
              
              <ScrollArea className="h-64 rounded-lg border border-slate-600 bg-slate-700/50">
                <div className="p-2">
                  {filteredDevices.length > 0 ? (
                    filteredDevices.map((device) => (
                      <button
                        key={device}
                        onClick={() => onDeviceSelect(device)}
                        className={`w-full text-left px-4 py-3 rounded-lg mb-1 transition-all flex items-center justify-between ${
                          selectedDevice === device 
                            ? 'bg-blue-500 text-white' 
                            : 'hover:bg-slate-600 text-slate-200'
                        }`}
                        data-testid={`button-device-${device.replace(/\s+/g, '-').toLowerCase()}`}
                      >
                        <span className="flex items-center">
                          <Smartphone className="mr-3" size={18} />
                          {device}
                        </span>
                        {selectedDevice === device && <Check size={18} />}
                      </button>
                    ))
                  ) : (
                    <div className="text-center py-8 text-slate-400">
                      <Smartphone className="mx-auto mb-2 opacity-50" size={32} />
                      <p>No devices found for "{searchQuery}"</p>
                      <p className="text-sm mt-1">Try a different search term</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
            
            <div className="flex items-center justify-center">
              <div className={`w-32 h-40 rounded-2xl border-2 flex items-center justify-center transition-all ${
                selectedDevice 
                  ? 'bg-blue-500/20 border-blue-500' 
                  : 'bg-slate-700/50 border-dashed border-slate-600'
              }`}>
                <div className="text-center">
                  <Smartphone className={`mx-auto ${selectedDevice ? 'text-blue-400' : 'text-slate-500'}`} size={48} />
                  {selectedDevice && (
                    <p className="text-xs mt-2 text-blue-300 px-2 truncate max-w-[120px]">
                      {selectedDevice}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
