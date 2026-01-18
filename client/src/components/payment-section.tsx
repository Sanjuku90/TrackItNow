import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard, Clock, ShieldCheck, Lock, CheckCircle2 } from "lucide-react";
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
  const [selectedPlan, setSelectedPlan] = useState<'standard' | 'priority' | 'family' | 'temporary'>('standard');

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
    if (selectedPlan === 'priority' || selectedPlan === 'family') {
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

  const getPrice = () => {
    switch (selectedPlan) {
      case 'priority': return 32.90;
      case 'family': return 49.90;
      case 'temporary': return 4.99;
      default: return 9.99;
    }
  };

  const currentPrice = getPrice();

  return (
    <div className="mb-8 animate-in slide-in-from-bottom-5 duration-300">
      <Card className="bg-slate-800/50 backdrop-blur-lg border-slate-700/50">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <h2 className="text-2xl font-bold flex items-center">
              <CreditCard className="text-blue-400 mr-3" size={24} />
              Choix du Plan de Traçage
            </h2>
            <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-1.5">
              <ShieldCheck className="text-emerald-400" size={18} />
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Sécurisé par SSL 256-bit</span>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div 
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] ${selectedPlan === 'standard' ? 'border-blue-500 bg-blue-500/10 shadow-[0_0_15px_rgba(59,130,246,0.2)]' : 'border-slate-700 bg-slate-800/50'}`}
                onClick={() => setSelectedPlan('standard')}
              >
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold text-lg flex items-center">
                    {selectedPlan === 'standard' && <CheckCircle2 className="text-blue-400 mr-2" size={18} />}
                    Plan Basique
                  </h3>
                  <span className="text-xl font-bold">$9.99</span>
                </div>
                <ul className="text-sm text-slate-400 space-y-1">
                  <li>• Position fixe instantanée</li>
                  <li>• Rapport d'activité unique</li>
                  <li>• Localisation GPS précise</li>
                </ul>
              </div>

              <div 
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] ${selectedPlan === 'priority' ? 'border-emerald-500 bg-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'border-slate-700 bg-slate-800/50'}`}
                onClick={() => setSelectedPlan('priority')}
              >
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold text-lg text-emerald-400 flex items-center">
                    {selectedPlan === 'priority' && <CheckCircle2 className="text-emerald-400 mr-2" size={18} />}
                    Fast Track Priority
                  </h3>
                  <span className="text-xl font-bold text-emerald-400">$32.90</span>
                </div>
                <ul className="text-sm text-slate-400 space-y-1">
                  <li>• Traçage en temps réel continu</li>
                  <li>• Suivi des mouvements (100m/étape)</li>
                  <li>• Alertes de déplacement instantanées</li>
                  <li>• Historique complet des positions</li>
                </ul>
              </div>

              <div 
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] ${selectedPlan === 'family' ? 'border-blue-400 bg-blue-400/10 shadow-[0_0_15px_rgba(96,165,250,0.2)]' : 'border-slate-700 bg-slate-800/50'}`}
                onClick={() => setSelectedPlan('family')}
              >
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold text-lg text-blue-400 flex items-center">
                    {selectedPlan === 'family' && <CheckCircle2 className="text-blue-400 mr-2" size={18} />}
                    Plan Famille
                  </h3>
                  <span className="text-xl font-bold text-blue-400">$49.90</span>
                </div>
                <ul className="text-sm text-slate-400 space-y-1">
                  <li>• Jusqu'à 5 appareils</li>
                  <li>• Tableau de bord unique</li>
                  <li>• Localisation partagée</li>
                  <li>• Contrôle parental</li>
                </ul>
              </div>

              <div 
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] ${selectedPlan === 'temporary' ? 'border-orange-500 bg-orange-500/10 shadow-[0_0_15px_rgba(249,115,22,0.2)]' : 'border-slate-700 bg-slate-800/50'}`}
                onClick={() => setSelectedPlan('temporary')}
              >
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold text-lg text-orange-400 flex items-center">
                    {selectedPlan === 'temporary' && <CheckCircle2 className="text-orange-400 mr-2" size={18} />}
                    Partage Temporaire
                  </h3>
                  <span className="text-xl font-bold text-orange-400">$4.99</span>
                </div>
                <ul className="text-sm text-slate-400 space-y-1">
                  <li>• Lien sécurisé (1h-2h)</li>
                  <li>• Sans application</li>
                  <li>• Usage unique</li>
                  <li>• Accès navigateur</li>
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

              <div className="grid grid-cols-3 gap-2 mt-4">
                <div className="flex flex-col items-center gap-1 p-2 rounded bg-slate-900/40 border border-slate-700/50">
                  <Lock className="text-slate-500" size={14} />
                  <span className="text-[10px] uppercase text-slate-500 font-bold">Encrypted</span>
                </div>
                <div className="flex flex-col items-center gap-1 p-2 rounded bg-slate-900/40 border border-slate-700/50">
                  <ShieldCheck className="text-slate-500" size={14} />
                  <span className="text-[10px] uppercase text-slate-500 font-bold">Verified</span>
                </div>
                <div className="flex flex-col items-center gap-1 p-2 rounded bg-slate-900/40 border border-slate-700/50">
                  <CheckCircle2 className="text-slate-500" size={14} />
                  <span className="text-[10px] uppercase text-slate-500 font-bold">Certified</span>
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
              
              {!paymentSubmitted ? (
                <Button 
                  onClick={handlePaymentClick}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 px-6 rounded-lg shadow-lg shadow-emerald-500/20 transition-all hover:shadow-emerald-500/40"
                >
                  Confirmer l'achat du plan
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
