import { Card, CardContent } from "@/components/ui/card";
import { Fingerprint, Smartphone } from "lucide-react";

interface IMEIGenerationProps {
  imei: string;
  isVisible: boolean;
}

export function IMEIGeneration({ imei, isVisible }: IMEIGenerationProps) {
  if (!isVisible) return null;

  return (
    <div className="mb-8 animate-in slide-in-from-bottom-5 duration-300">
      <Card className="bg-slate-800/50 backdrop-blur-lg border-slate-700/50">
        <CardContent className="p-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <Fingerprint className="text-blue-400 mr-3" size={24} />
            Device Identification
          </h2>
          
          <div className="bg-gradient-to-r from-blue-500/20 to-emerald-500/20 rounded-lg p-6 border border-blue-500/30">
            <div className="flex items-center space-x-4">
              <Smartphone className="text-3xl text-blue-400" size={48} />
              <div>
                <p className="text-sm text-slate-300 mb-1">IMEI Number Detected:</p>
                <p className="text-2xl font-mono font-bold text-white">{imei}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
