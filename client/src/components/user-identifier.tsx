import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Key } from "lucide-react";
import { Platform } from "@/lib/device-data";

interface UserIdentifierProps {
  platform: Platform;
  identifier: string;
  onIdentifierChange: (identifier: string) => void;
  onAuthenticate: () => void;
  isVisible: boolean;
}

export function UserIdentifier({ 
  platform, 
  identifier, 
  onIdentifierChange, 
  onAuthenticate, 
  isVisible 
}: UserIdentifierProps) {
  if (!isVisible || !platform) return null;

  const isAndroid = platform === 'android';
  const labelText = isAndroid ? 'Gmail Address' : 'iCloud ID';
  const placeholder = isAndroid ? 'Enter your Gmail address' : 'Enter your iCloud ID';

  return (
    <div className="mb-8 animate-in slide-in-from-bottom-5 duration-300">
      <Card className="bg-slate-800/50 backdrop-blur-lg border-slate-700/50">
        <CardContent className="p-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <Key className="text-blue-400 mr-3" size={24} />
            User Identifier
          </h2>
          
          <div className="max-w-md">
            <Label className="block text-sm font-medium mb-2 text-slate-300">
              {labelText}
            </Label>
            <Input
              type="email"
              value={identifier}
              onChange={(e) => onIdentifierChange(e.target.value)}
              placeholder={placeholder}
              className="w-full bg-slate-700 border-slate-600 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <Button 
              onClick={onAuthenticate}
              disabled={!identifier.trim()}
              className="w-full mt-4 bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-6 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Begin Authentication
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
