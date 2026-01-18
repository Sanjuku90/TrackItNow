import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Settings, 
  CreditCard, 
  History, 
  ShieldCheck, 
  Smartphone, 
  Plus, 
  ChevronRight,
  Satellite,
  Zap,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { motion } from "framer-motion";
import { apiRequest } from "@/lib/queryClient";

import { useToast } from "@/hooks/use-toast";

export default function UserDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { data: user, isLoading } = useQuery<any>({ 
    queryKey: ["/api/user"],
    retry: false
  });

  const { data: userPurchases = [] } = useQuery<any[]>({
    queryKey: ["/api/admin/purchases"],
    enabled: !!user,
  });

  if (isLoading) return <div className="min-h-screen bg-[#0A0E1A] flex items-center justify-center text-white">Loading...</div>;

  if (!user) {
    setLocation("/?auth=true");
    return null;
  }

  const isPremium = user.premiumExpiry && new Date(user.premiumExpiry) > new Date();
  
  const handleViewTracking = (trkId: string) => {
    setLocation(`/tracking?id=${trkId}`);
    toast({
      title: "Récupération des données",
      description: `Chargement de l'historique pour la session ${trkId}...`,
    });
  };

  const plans = [
    {
      id: "standard",
      name: "Standard Tracking",
      price: "$9.99",
      features: ["Single Device", "Real-time Location", "Standard Support"],
      icon: Satellite,
      color: "blue",
      disabled: isPremium
    },
    {
      id: "priority",
      name: "Fast Track Priority",
      price: "$32.90",
      features: ["Unlimited Devices", "Highest Accuracy", "24/7 Priority Support", "Remote Lock/Wipe"],
      icon: Zap,
      color: "emerald",
      popular: true,
      disabled: isPremium
    }
  ];

  // Filter purchases for this user
  const recentTracking = userPurchases
    .filter((p: any) => p.userEmail.toLowerCase() === user.email.toLowerCase())
    .map((p: any) => ({
      id: `TRK-${p.id}`,
      device: p.device,
      date: new Date().toLocaleDateString(), // In a real app we'd have a createdAt
      status: p.status === 'validated' ? 'Active' : 'Pending',
      accuracy: p.status === 'validated' ? 'High' : 'N/A'
    }));

  return (
    <div className="min-h-screen bg-[#0A0E1A] text-slate-50">
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0A0E1A]/80 backdrop-blur-xl border-b border-white/5">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center space-x-3 cursor-pointer">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Satellite className="text-white" size={18} />
              </div>
              <span className="text-lg font-bold tracking-tight">TrackIt <span className="text-primary">Now</span></span>
            </div>
          </Link>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
              <User className="w-4 h-4 text-slate-400" />
              <span className="text-sm font-medium text-slate-300">{user.email}</span>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => apiRequest("POST", "/api/logout").then(() => window.location.reload())}
              className="text-slate-400 hover:text-white"
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 pt-32 pb-20">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column: Profile & Stats */}
          <div className="space-y-8">
            <Card className="bg-white/5 border-white/5 rounded-[2.5rem] p-8 overflow-hidden relative">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <ShieldCheck className="w-24 h-24 rotate-12" />
              </div>
              <div className="relative z-10">
                <div className="w-20 h-20 rounded-[1.5rem] bg-primary/20 flex items-center justify-center text-primary mb-6">
                  <User size={40} />
                </div>
                <h2 className="text-2xl font-bold mb-1">Account Status</h2>
                <p className="text-slate-400 text-sm mb-6 uppercase tracking-widest font-bold">Verified Member</p>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
                    <span className="text-sm text-slate-400">Current Plan</span>
                    <Badge variant="outline" className={isPremium ? "border-emerald-500/20 text-emerald-400" : "border-primary/20 text-primary"}>
                      {isPremium ? "Premium (8 mois)" : "Free Tier"}
                    </Badge>
                  </div>
                  {isPremium && (
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
                      <span className="text-sm text-slate-400">Expire le</span>
                      <span className="text-sm font-bold text-emerald-400">
                        {new Date(user.premiumExpiry).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
                    <span className="text-sm text-slate-400">Member Since</span>
                    <span className="text-sm font-bold">May 2024</span>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="bg-white/5 border-white/5 rounded-[2.5rem] p-8">
              <h3 className="text-lg font-bold mb-6 flex items-center">
                <History className="text-primary mr-3" size={20} />
                Recent Activity
              </h3>
              <div className="space-y-4">
                {recentTracking.length > 0 ? (
                  recentTracking.map((trk: any) => (
                    <div 
                      key={trk.id} 
                      className="p-4 bg-white/5 rounded-2xl hover:bg-white/[0.08] transition-colors group cursor-pointer border border-white/5 hover:border-primary/20"
                      onClick={() => handleViewTracking(trk.id)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-tighter">{trk.id}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[8px] py-0 px-1 border-primary/30 text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                            REVOIR
                          </Badge>
                          <Badge className={trk.status === 'Active' ? 'bg-emerald-500/20 text-emerald-400 border-none' : 'bg-slate-500/20 text-slate-400 border-none'}>
                            {trk.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="font-bold text-sm mb-1">{trk.device}</div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-slate-500">{trk.date}</span>
                        <span className="text-[10px] text-primary font-bold">Accuracy: {trk.accuracy}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center bg-white/5 rounded-2xl border border-dashed border-white/10">
                    <p className="text-sm text-slate-500">Aucun historique disponible pour le moment.</p>
                  </div>
                )}
                {recentTracking.length > 0 && (
                  <Button variant="ghost" className="w-full text-xs text-slate-500 hover:text-white mt-2">
                    View Full History
                  </Button>
                )}
              </div>
            </Card>
          </div>

          {/* Right Column: Plans & Upgrade */}
          <div className="lg:col-span-2 space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold tracking-tight">Available Plans</h2>
              <p className="text-sm text-slate-400">Upgrade to unlock military-grade features</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {plans.map((plan) => (
                <Card key={plan.id} className={`bg-white/5 border-white/5 rounded-[2.5rem] p-6 lg:p-8 flex flex-col relative group transition-all duration-300 hover:scale-[1.02] overflow-hidden ${plan.popular ? 'border-primary/20 bg-primary/5' : ''}`}>
                  {plan.popular && (
                    <div className="absolute top-6 right-6 lg:top-8 lg:right-8">
                      <Badge className="bg-primary text-white border-none text-[10px] uppercase font-bold tracking-widest px-3">Popular</Badge>
                    </div>
                  )}
                  <div className={`w-12 h-12 lg:w-14 lg:h-14 rounded-2xl flex items-center justify-center mb-6 lg:mb-8 bg-${plan.color}-500/10 text-${plan.color}-400 shrink-0`}>
                    <plan.icon size={24} className="lg:size-7" />
                  </div>
                  <h3 className="text-xl lg:text-2xl font-bold mb-2 break-words">{plan.name}</h3>
                  <div className="flex items-baseline space-x-2 mb-6 lg:mb-8">
                    <span className="text-3xl lg:text-4xl font-bold">{plan.price}</span>
                    <span className="text-slate-500 text-sm">/ device</span>
                  </div>
                  <ul className="space-y-3 lg:space-y-4 mb-8 lg:mb-10 flex-1">
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-start text-sm text-slate-300">
                        <CheckCircle2 className={`w-4 h-4 mr-3 mt-0.5 text-${plan.color}-400 shrink-0`} />
                        <span className="leading-tight">{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className={`w-full h-12 lg:h-14 rounded-2xl font-bold text-base lg:text-lg ${plan.popular ? 'bg-primary hover:bg-primary/90' : 'bg-white/10 hover:bg-white/20'}`}
                    onClick={() => setLocation(plan.id === 'priority' ? '/tracking?fast=true' : '/tracking')}
                    disabled={plan.disabled}
                  >
                    {plan.disabled ? 'Plan Actif' : 'Select Plan'}
                    {!plan.disabled && <ArrowRight className="ml-2 w-4 h-4 lg:w-5 lg:h-5" />}
                  </Button>
                </Card>
              ))}
            </div>

            <Card className="bg-gradient-to-r from-emerald-600/20 to-primary/20 border-white/5 rounded-[2.5rem] p-10 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                <Satellite className="w-full h-full scale-150 rotate-12" />
              </div>
              <div className="relative z-10 text-center md:text-left space-y-4 max-w-md">
                <Badge className="bg-emerald-500 text-white border-none uppercase text-[10px] font-bold tracking-widest px-3 py-1">Security Alert</Badge>
                <h3 className="text-2xl font-bold leading-tight">Your device is vulnerable until tracking is activated</h3>
                <p className="text-slate-400 text-sm">
                  Once a device is stolen, every minute counts. Activate a tracking plan now to ensure you can recover your property instantly.
                </p>
              </div>
              <Button 
                size="lg" 
                className="relative z-10 h-14 px-10 rounded-2xl bg-white text-slate-950 hover:bg-slate-100 font-bold text-lg shrink-0 shadow-2xl shadow-white/10"
                onClick={() => setLocation("/tracking")}
              >
                Activate Protection
              </Button>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
