import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Smartphone } from "lucide-react";
import { deviceData, Platform } from "@/lib/device-data";

interface DeviceSelectionProps {
  platform: Platform;
  selectedDevice: string;
  onDeviceSelect: (device: string) => void;
  isVisible: boolean;
}

export function DeviceSelection({ platform, selectedDevice, onDeviceSelect, isVisible }: DeviceSelectionProps) {
  if (!isVisible || !platform) return null;

  const devices = deviceData[platform];

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
                Device Model
              </Label>
              <Select value={selectedDevice} onValueChange={onDeviceSelect}>
                <SelectTrigger className="w-full bg-slate-700 border-slate-600 text-white focus:ring-2 focus:ring-blue-500">
                  <SelectValue placeholder="Choose a model..." />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  {devices.map((device) => (
                    <SelectItem key={device} value={device} className="text-white hover:bg-slate-600">
                      {device}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-center">
              <div className="w-32 h-40 bg-slate-700/50 rounded-2xl border-2 border-dashed border-slate-600 flex items-center justify-center">
                <Smartphone className="text-slate-500 text-4xl" size={48} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
