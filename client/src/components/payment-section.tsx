import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard, Clock, ShieldCheck, Lock, CheckCircle2, Zap } from "lucide-react";
import { useState, useEffect } from "react";

interface PaymentSectionProps {
  isVisible: boolean;
  onPaymentComplete: () => void;
  amount: number;
  device: string;
  userEmail: string;
  trackingType: "standard" | "priority";
}

export function PaymentSection({ isVisible, onPaymentComplete, amount, device, userEmail, trackingType }: PaymentSectionProps) {
  const [paymentSubmitted, setPaymentSubmitted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(180); // 3 minutes in seconds

  useEffect(() => {
    if (!paymentSubmitted) return;

    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setTimeout(() => {
            onPaymentComplete();
          }, 1000);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [paymentSubmitted, onPaymentComplete]);

  const handlePaymentClick = async () => {
    try {
      await fetch('/api/purchases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          device,
          amount,
          trackingType,
          userEmail
        })
      });
      setPaymentSubmitted(true);
    } catch (error) {
      console.error('Failed to notify admin:', error);
      setPaymentSubmitted(true); // Proceed anyway for UX
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isVisible) return null;

  return (
    <div className="mb-8 animate-in slide-in-from-bottom-5 duration-300 w-full max-w-2xl mx-auto">
      <Card className="bg-white/5 border-white/10 rounded-[2.5rem] overflow-hidden">
        <CardContent className="p-8 sm:p-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <h2 className="text-2xl font-bold flex items-center">
              <CreditCard className="text-primary mr-3" size={24} />
              Finaliser le Paiement
            </h2>
            <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-1.5">
              <ShieldCheck className="text-emerald-400" size={18} />
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Sécurisé SSL</span>
            </div>
          </div>
          
          <div className="grid md:grid-cols-1 gap-8">
            <div className="space-y-6">
              <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-slate-400">Total à payer:</span>
                  <span className="text-3xl font-bold text-white">${amount} USD</span>
                </div>
                <div className="flex items-center gap-2 text-primary font-bold text-sm bg-primary/10 p-3 rounded-2xl">
                  <Lock size={16} />
                  <span>Accès Satellite Activé après vérification</span>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-bold flex items-center">
                  <Zap className="text-primary mr-2" size={20} />
                  Paiement USDT (TRC-20)
                </h3>
                <div className="bg-white/5 rounded-[2rem] p-6 border border-white/10">
                  <p className="text-sm text-slate-400 mb-4">Envoyez exactement <span className="text-white font-bold">${amount} USDT</span> à l'adresse suivante :</p>
                  <div className="bg-[#0A0E1A] rounded-2xl p-4 font-mono text-sm break-all border border-primary/30 text-primary shadow-inner">
                    TYjqWPHHpSrkEnkfNjueLpxeYevo6fwdg4
                  </div>
                  <p className="text-[10px] text-slate-500 mt-4 text-center uppercase tracking-widest font-bold">Réseau: TRON (TRC-20) UNIQUEMENT</p>
                </div>
              </div>
              
              {!paymentSubmitted ? (
                <Button 
                  onClick={handlePaymentClick}
                  className="w-full h-16 bg-primary hover:bg-primary/90 text-white font-bold rounded-2xl shadow-xl shadow-primary/20 transition-all text-lg"
                >
                  J'ai effectué le transfert
                </Button>
              ) : (
                <div className="space-y-6">
                  <div className="bg-primary/10 border border-primary/20 rounded-[2rem] p-8 text-center">
                    <Clock className="mx-auto mb-4 text-primary animate-spin-slow" size={32} />
                    <p className="text-sm text-slate-300 mb-2">Vérification de la transaction sur la Blockchain...</p>
                    <p className="text-4xl font-mono font-bold text-white mb-2">{formatTime(timeRemaining)}</p>
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
                      <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
                      <div className="w-2 h-2 rounded-full bg-primary animate-bounce" />
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 text-center leading-relaxed">
                    Veuillez ne pas fermer cette page. Le système de tracking s'activera automatiquement dès la confirmation du dépôt.
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
