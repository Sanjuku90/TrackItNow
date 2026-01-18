import { Card, CardContent } from "@/components/ui/card";
import { Shield, Check, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

interface AuthStep {
  id: number;
  message: string;
  completed: boolean;
  active: boolean;
}

interface AuthenticationProcessProps {
  isVisible: boolean;
  onAuthComplete: () => void;
}

export function AuthenticationProcess({ isVisible, onAuthComplete }: AuthenticationProcessProps) {
  const [steps, setSteps] = useState<AuthStep[]>([
    { id: 1, message: "Scanning nearby cell towers...", completed: false, active: true },
    { id: 2, message: "Decrypting cellular signal packets...", completed: false, active: false },
    { id: 3, message: "Establishing secure satellite handshake...", completed: false, active: false },
    { id: 4, message: "Finalizing high-precision GPS fix...", completed: false, active: false },
    { id: 5, message: "Location service access granted", completed: false, active: false }
  ]);

  useEffect(() => {
    if (!isVisible) return;

    let currentStep = 0;
    const processStep = () => {
      if (currentStep < steps.length) {
        setSteps(prev => prev.map((step, index) => {
          if (index === currentStep) {
            return { ...step, active: true };
          }
          return step;
        }));

        setTimeout(() => {
          setSteps(prev => prev.map((step, index) => {
            if (index === currentStep) {
              return { ...step, completed: true, active: false };
            }
            return step;
          }));

          currentStep++;
          if (currentStep < steps.length) {
            setTimeout(processStep, 800);
          } else {
            setTimeout(() => {
              onAuthComplete();
            }, 1000);
          }
        }, 2000);
      }
    };

    processStep();
  }, [isVisible, onAuthComplete]);

  if (!isVisible) return null;

  return (
    <div className="mb-8 animate-in slide-in-from-bottom-5 duration-300">
      <Card className="bg-[#0A0E1A]/60 backdrop-blur-xl border-white/5 rounded-[2.5rem]">
        <CardContent className="p-8">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center text-primary mb-4 animate-pulse">
              <Shield size={32} />
            </div>
            <h2 className="text-2xl font-bold tracking-tight">
              Establishing Secure Link
            </h2>
            <p className="text-slate-400 text-sm mt-2">Satellite synchronization in progress</p>
          </div>
          
          <div className="space-y-3">
            {steps.map((step) => (
              <div 
                key={step.id}
                className={`flex items-center p-4 bg-white/[0.02] border border-white/5 rounded-2xl transition-all duration-300 ${
                  step.completed || step.active ? 'opacity-100' : 'opacity-40'
                }`}
              >
                <div className="mr-4">
                  {step.active && !step.completed && (
                    <Loader2 className="text-primary animate-spin" size={18} />
                  )}
                  {step.completed && (
                    <div className="bg-emerald-500/20 p-1 rounded-full">
                      <Check className="text-emerald-400" size={14} />
                    </div>
                  )}
                  {!step.active && !step.completed && (
                    <div className="w-4 h-4 rounded-full border border-white/10"></div>
                  )}
                </div>
                <span className={`text-sm font-medium ${step.completed ? 'text-emerald-400' : 'text-slate-200'}`}>
                  {step.message}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
