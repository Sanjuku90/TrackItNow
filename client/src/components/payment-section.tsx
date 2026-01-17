import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard, QrCode, Clock } from "lucide-react";
import { useState, useEffect } from "react";

interface PaymentSectionProps {
  selectedDevice: string;
  imei: string;
  isVisible: boolean;
  onPaymentConfirmed: () => void;
}

export function PaymentSection({ selectedDevice, imei, isVisible, onPaymentConfirmed }: PaymentSectionProps) {
  const [paymentSubmitted, setPaymentSubmitted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(60); // 1 minute in seconds
  const [selectedPlan, setSelectedPlan] = useState<'standard' | 'priority'>('standard');

  useEffect(() => {
    if (!paymentSubmitted) return;

    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [paymentSubmitted]);

  const handlePaymentClick = () => {
    // Update URL if priority selected to simulate plan in dashboard
    if (selectedPlan === 'priority') {
      const url = new URL(window.location.href);
      url.searchParams.set('fast', 'true');
      window.history.replaceState({}, '', url);
    }
    setPaymentSubmitted(true);
    onPaymentConfirmed();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isVisible) return null;

  const currentPrice = selectedPlan === 'priority' ? 32.90 : 9.99;

  return (
    <div className="mb-8 animate-in slide-in-from-bottom-5 duration-300">
      <Card className="bg-slate-800/50 backdrop-blur-lg border-slate-700/50">
        <CardContent className="p-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <CreditCard className="text-blue-400 mr-3" size={24} />
            Choix du Plan de Traçage
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div 
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${selectedPlan === 'standard' ? 'border-blue-500 bg-blue-500/10' : 'border-slate-700 bg-slate-800/50'}`}
                onClick={() => setSelectedPlan('standard')}
              >
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold text-lg">Plan Basique</h3>
                  <span className="text-xl font-bold">$9.99</span>
                </div>
                <ul className="text-sm text-slate-400 space-y-1">
                  <li>• Position fixe instantanée</li>
                  <li>• Rapport d'activité unique</li>
                  <li>• Localisation GPS précise</li>
                </ul>
              </div>

              <div 
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${selectedPlan === 'priority' ? 'border-emerald-500 bg-emerald-500/10' : 'border-slate-700 bg-slate-800/50'}`}
                onClick={() => setSelectedPlan('priority')}
              >
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold text-lg text-emerald-400">Fast Track Priority</h3>
                  <span className="text-xl font-bold text-emerald-400">$32.90</span>
                </div>
                <ul className="text-sm text-slate-400 space-y-1">
                  <li>• Traçage en temps réel continu</li>
                  <li>• Suivi des mouvements (100m/étape)</li>
                  <li>• Alertes de déplacement instantanées</li>
                  <li>• Historique complet des positions</li>
                </ul>
              </div>

              <div className="pt-4 border-t border-slate-700">
                <div className="flex justify-between text-slate-300 mb-2">
                  <span>Appareil:</span>
                  <span>{selectedDevice}</span>
                </div>
                <div className="flex justify-between text-white font-bold text-lg">
                  <span>Total à payer:</span>
                  <span>${currentPrice} USD</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Paiement Crypto (USDT TRC-20)</h3>
              <div className="bg-slate-700/50 rounded-lg p-4 mb-4">
                <p className="text-sm text-slate-300 mb-2">Envoyez exactement ${currentPrice} USDT à :</p>
                <div className="bg-slate-900 rounded p-3 font-mono text-sm break-all border">
                  TAB1oeEKDS5NATwFAaUrTioDU9djX7anyS
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-4 flex justify-center mb-4">
                <QrCode className="w-32 h-32 text-gray-400" />
              </div>
              
              {!paymentSubmitted ? (
                <Button 
                  onClick={handlePaymentClick}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-3 px-6"
                >
                  J'ai envoyé le paiement
                </Button>
              ) : (
                <div className="space-y-4">
                  <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4 text-center">
                    <Clock className="mx-auto mb-2 text-blue-400" size={24} />
                    <p className="text-sm text-blue-300 mb-1">Vérification du paiement en cours</p>
                    <p className="text-2xl font-mono font-bold text-white">{formatTime(timeRemaining)}</p>
                    <p className="text-xs text-slate-400">Confirmation automatique en cours...</p>
                  </div>
                  <Button 
                    disabled
                    className="w-full bg-slate-600 text-slate-400 font-medium py-3 px-6 cursor-not-allowed"
                  >
                    Traitement du paiement...
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
