import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Satellite } from "lucide-react";
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

type Step = 'platform' | 'device' | 'identifier' | 'auth' | 'imei' | 'payment' | 'dashboard';

export default function TrackingDashboard() {
  const [currentStep, setCurrentStep] = useState<Step>('platform');
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>('');
  const [selectedDevice, setSelectedDevice] = useState('');
  const [userIdentifier, setUserIdentifier] = useState('');
  const [generatedIMEI, setGeneratedIMEI] = useState('');
  const { toast } = useToast();

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
    setCurrentStep('identifier');
    toast({
      title: "Device Selected",
      description: `${device} selected successfully`,
    });
  };

  const handleAuthenticate = () => {
    if (!userIdentifier.trim()) {
      toast({
        title: "Error",
        description: "Please enter your identifier",
        variant: "destructive",
      });
      return;
    }
    setCurrentStep('auth');
  };

  const handleAuthComplete = () => {
    const imei = generateIMEI();
    setGeneratedIMEI(imei);
    setCurrentStep('imei');
    
    setTimeout(() => {
      setCurrentStep('payment');
    }, 2000);
  };

  const handlePaymentConfirmed = () => {
    toast({
      title: "Payment Processing",
      description: "Payment verification in progress. Please wait 3 minutes...",
    });
    
    // Auto-confirm payment after 3 minutes (180 seconds)
    setTimeout(() => {
      toast({
        title: "Payment Confirmed",
        description: "Payment confirmed! Initializing tracking...",
      });
      
      setTimeout(() => {
        setCurrentStep('dashboard');
      }, 2000);
    }, 180000); // 3 minutes = 180,000 milliseconds
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-50 transition-colors duration-300">
      {/* Header */}
      <header className="bg-slate-800/50 backdrop-blur-lg border-b border-slate-700/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <Satellite className="text-white text-lg" size={20} />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                TrackIt Now
              </h1>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Step 1: Platform Selection */}
        <PlatformSelection 
          onPlatformSelect={handlePlatformSelect}
          selectedPlatform={selectedPlatform}
        />

        {/* Step 2: Device Selection */}
        <DeviceSelection
          platform={selectedPlatform}
          selectedDevice={selectedDevice}
          onDeviceSelect={handleDeviceSelect}
          isVisible={currentStep === 'device' || (currentStep !== 'platform' && selectedDevice !== '')}
        />

        {/* Step 3: User Identifier */}
        <UserIdentifier
          platform={selectedPlatform}
          identifier={userIdentifier}
          onIdentifierChange={setUserIdentifier}
          onAuthenticate={handleAuthenticate}
          isVisible={currentStep === 'identifier' || (currentStep !== 'platform' && currentStep !== 'device' && userIdentifier !== '')}
        />

        {/* Step 4: Authentication Process */}
        <AuthenticationProcess
          isVisible={currentStep === 'auth'}
          onAuthComplete={handleAuthComplete}
        />

        {/* Step 5: IMEI Generation */}
        <IMEIGeneration
          imei={generatedIMEI}
          isVisible={currentStep === 'imei' || (currentStep !== 'platform' && currentStep !== 'device' && currentStep !== 'identifier' && currentStep !== 'auth' && generatedIMEI !== '')}
        />

        {/* Step 6: Payment Section */}
        <PaymentSection
          selectedDevice={selectedDevice}
          imei={generatedIMEI}
          isVisible={currentStep === 'payment'}
          onPaymentConfirmed={handlePaymentConfirmed}
        />

        {/* Step 7: Main Dashboard */}
        <MainDashboard
          isVisible={currentStep === 'dashboard'}
        />
      </main>
    </div>
  );
}
