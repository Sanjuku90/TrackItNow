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
    { id: 1, message: "Verifying information...", completed: false, active: true },
    { id: 2, message: "Secure authentication in progress...", completed: false, active: false },
    { id: 3, message: "Code sent to backup address", completed: false, active: false },
    { id: 4, message: "Location service access granted", completed: false, active: false }
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
      <Card className="bg-slate-800/50 backdrop-blur-lg border-slate-700/50">
        <CardContent className="p-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <Shield className="text-blue-400 mr-3" size={24} />
            Authentication in Progress
          </h2>
          
          <div className="space-y-4">
            {steps.map((step) => (
              <div 
                key={step.id}
                className={`flex items-center p-4 bg-slate-700/50 rounded-lg transition-opacity duration-300 ${
                  step.completed || step.active ? 'opacity-100' : 'opacity-50'
                }`}
              >
                <div className="mr-4">
                  {step.active && !step.completed && (
                    <Loader2 className="text-blue-400 animate-spin" size={20} />
                  )}
                  {step.completed && (
                    <Check className="text-emerald-400" size={20} />
                  )}
                  {!step.active && !step.completed && (
                    <div className="w-5 h-5 rounded-full border-2 border-slate-500"></div>
                  )}
                </div>
                <span className={step.completed ? 'text-emerald-400' : 'text-white'}>
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
