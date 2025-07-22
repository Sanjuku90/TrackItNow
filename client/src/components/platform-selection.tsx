import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Smartphone, Apple } from "lucide-react";
import { Platform } from "@/lib/device-data";

interface PlatformSelectionProps {
  onPlatformSelect: (platform: Platform) => void;
  selectedPlatform: Platform;
}

export function PlatformSelection({ onPlatformSelect, selectedPlatform }: PlatformSelectionProps) {
  return (
    <div className="mb-8 animate-in fade-in-0 duration-500">
      <Card className="bg-slate-800/50 backdrop-blur-lg border-slate-700/50">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Smartphone className="text-blue-400 text-2xl" size={32} />
            </div>
            <h2 className="text-3xl font-bold mb-2">Choose Device Platform</h2>
            <p className="text-slate-400">Select your device platform to begin tracking</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <Button
              variant="outline"
              className={`group relative overflow-hidden h-auto p-8 border transition-all duration-300 transform hover:scale-105 ${
                selectedPlatform === 'android' 
                  ? 'bg-emerald-600 border-emerald-500 hover:bg-emerald-700' 
                  : 'bg-gradient-to-br from-slate-700 to-slate-800 hover:from-emerald-600 hover:to-emerald-700 border-slate-600 hover:border-emerald-500'
              }`}
              onClick={() => onPlatformSelect('android')}
            >
              <div className="relative z-10 text-center">
                <Smartphone className="mx-auto mb-4 text-emerald-400" size={48} />
                <h3 className="text-2xl font-bold mb-2">Android</h3>
                <p className="text-slate-300 group-hover:text-white">Track Android devices</p>
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/10 to-emerald-700/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </Button>
            
            <Button
              variant="outline"
              className={`group relative overflow-hidden h-auto p-8 border transition-all duration-300 transform hover:scale-105 ${
                selectedPlatform === 'ios' 
                  ? 'bg-blue-600 border-blue-500 hover:bg-blue-700' 
                  : 'bg-gradient-to-br from-slate-700 to-slate-800 hover:from-blue-600 hover:to-blue-700 border-slate-600 hover:border-blue-500'
              }`}
              onClick={() => onPlatformSelect('ios')}
            >
              <div className="relative z-10 text-center">
                <Apple className="mx-auto mb-4 text-blue-400" size={48} />
                <h3 className="text-2xl font-bold mb-2">iOS</h3>
                <p className="text-slate-300 group-hover:text-white">Track iPhone devices</p>
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-blue-700/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
