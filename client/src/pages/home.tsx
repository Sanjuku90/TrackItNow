import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  Satellite, 
  Clock, 
  Globe, 
  Star, 
  CheckCircle,
  Users,
  MapPin,
  Lock,
  Award,
  ArrowRight,
  ChevronRight,
  Zap,
  Layout,
  MousePointer2
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import heroImage from "@assets/generated_images/modern_high-tech_device_tracking_hero_image.png";

export default function Home() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { data: user } = useQuery<any>({ 
    queryKey: ["/api/user"],
    retry: false
  });

  const [showAuth, setShowAuth] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiRequest("POST", isLogin ? "/api/login" : "/api/register", { email, password });
      setLocation("/dashboard");
    } catch (e: any) {
      toast({ title: "Auth failed", description: e.message, variant: "destructive" });
    }
  };

  const handleTrackingClick = (planType: "standard" | "priority") => {
    if (!user) {
      setLocation("/auth");
    } else {
      // Direct payment flow logic here if needed, or just redirect
      setLocation(planType === "priority" ? "/tracking?fast=true" : "/tracking");
    }
  };

  const stats = [
    { number: "50,000+", label: "Devices Located", icon: MapPin },
    { number: "99.8%", label: "Success Rate", icon: CheckCircle },
    { number: "2 mins", label: "Average Time", icon: Clock },
    { number: "24/7", label: "Support Available", icon: Shield }
  ];

  const features = [
    {
      icon: Satellite,
      title: "Real-time GPS Tracking",
      description: "Precise location tracking with advanced satellite technology",
      color: "blue"
    },
    {
      icon: Shield,
      title: "Military-grade Security",
      description: "Your data is encrypted with bank-level security protocols",
      color: "emerald"
    },
    {
      icon: Globe,
      title: "Global Coverage",
      description: "Works worldwide on all Android and iOS devices",
      color: "purple"
    },
    {
      icon: Zap,
      title: "Instant Results",
      description: "Get location coordinates within minutes of activation",
      color: "orange"
    }
  ];

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("auth") === "true") {
      setShowAuth(true);
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0E1A] text-slate-50 overflow-x-hidden">
      {/* Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0A0E1A]/80 backdrop-blur-xl border-b border-white/5">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                <Satellite className="text-white" size={22} />
              </div>
              <span className="text-xl font-bold tracking-tight">TrackIt <span className="text-primary">Now</span></span>
            </div>
            <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-400">
              <a href="#" className="hover:text-white transition-colors">Features</a>
              <a href="#" className="hover:text-white transition-colors">How it works</a>
              <a href="#" className="hover:text-white transition-colors">Pricing</a>
            </nav>
            <div className="flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-4">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setLocation("/dashboard")}
                    className="hover:bg-white/5 text-primary font-bold"
                  >
                    Dashboard
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => apiRequest("POST", "/api/logout").then(() => window.location.reload())}
                    className="hover:bg-white/5"
                  >
                    Logout
                  </Button>
                </div>
              ) : (
                <Button variant="default" size="sm" onClick={() => setLocation("/auth")} className="rounded-full px-6">
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl -z-10">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full" />
        </div>

        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Badge variant="outline" className="mb-6 py-1.5 px-4 rounded-full border-primary/20 bg-primary/5 text-primary text-xs font-semibold tracking-wider uppercase">
                <Zap className="w-3 h-3 mr-2 fill-primary" />
                Next-Gen Device Recovery
              </Badge>
              <h1 className="text-5xl lg:text-7xl font-bold leading-[1.1] mb-8">
                Locate Any Device <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-400 to-emerald-400">With 99.8% Accuracy</span>
              </h1>
              <p className="text-xl text-slate-400 mb-10 leading-relaxed max-w-xl">
                Track lost or stolen Android and iOS devices instantly. Our military-grade satellite integration provides real-time GPS coordinates anywhere in the world.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  className="h-14 px-8 rounded-full text-lg font-semibold bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20"
                  onClick={() => handleTrackingClick("standard")}
                >
                  Start Tracking Now
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <div className="flex -space-x-3 items-center ml-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-[#0A0E1A] bg-slate-800 flex items-center justify-center overflow-hidden">
                      <img src={`https://i.pravatar.cc/150?u=${i}`} alt="user" className="w-full h-full object-cover" />
                    </div>
                  ))}
                  <div className="pl-6">
                    <div className="flex items-center text-yellow-500 mb-0.5">
                      {[1, 2, 3, 4, 5].map((s) => <Star key={s} className="w-3 h-3 fill-current" />)}
                    </div>
                    <div className="text-xs text-slate-400 font-medium">50k+ Happy Users</div>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent blur-3xl -z-10 rounded-full" />
              <div className="relative rounded-3xl border border-white/5 bg-white/5 p-4 backdrop-blur-sm overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <img 
                  src={heroImage} 
                  alt="TrackIt Dashboard" 
                  className="rounded-2xl w-full shadow-2xl transition-transform duration-700 group-hover:scale-[1.02]"
                />
                
                {/* Floating UI Elements */}
                <div className="absolute top-10 right-10 bg-[#0A0E1A]/90 backdrop-blur-md p-4 rounded-2xl border border-white/10 shadow-2xl">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Live Status</span>
                  </div>
                  <div className="text-sm font-semibold">Signal Strength: 100%</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 border-y border-white/5 bg-white/[0.02]">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="mb-4 inline-flex w-12 h-12 items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-primary group-hover:scale-110 transition-transform">
                  <stat.icon size={24} />
                </div>
                <div className="text-3xl font-bold mb-1">{stat.number}</div>
                <div className="text-sm text-slate-400 font-medium uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-32">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-4xl font-bold mb-6">Powerful Features for Peace of Mind</h2>
            <p className="text-lg text-slate-400">Our platform combines cutting-edge satellite technology with an intuitive interface to help you recover your property faster.</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="bg-white/5 border-white/5 hover:border-primary/20 hover:bg-white/[0.08] transition-all duration-300 group rounded-3xl border-none">
                <CardContent className="p-8">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-8 bg-${feature.color}-500/10 text-${feature.color}-400 group-hover:scale-110 transition-transform`}>
                    <feature.icon size={28} />
                  </div>
                  <h3 className="text-xl font-bold mb-4 text-white">{feature.title}</h3>
                  <p className="text-slate-400 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Bento Grid Section */}
      <section className="py-32 bg-white/[0.01]">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-[2.5rem] p-12 overflow-hidden relative group">
              <div className="relative z-10">
                <Badge className="mb-6 rounded-full bg-blue-500/20 text-blue-400 border-none px-4 py-1">Advanced Maps</Badge>
                <h3 className="text-4xl font-bold mb-6 max-w-md">Precise Visualization with Interactive Maps</h3>
                <p className="text-lg text-slate-400 max-w-sm mb-8">Get a bird's-eye view of your device's movement with our high-resolution mapping system.</p>
                <Button variant="ghost" className="group/btn p-0 hover:bg-transparent text-primary">
                  Learn more <ChevronRight className="ml-1 w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </Button>
              </div>
              <div className="absolute bottom-[-10%] right-[-10%] w-[60%] opacity-20 group-hover:opacity-40 transition-opacity duration-700">
                <Layout className="w-full h-full text-primary" />
              </div>
            </div>
            
            <div className="bg-primary border border-primary/20 rounded-[2.5rem] p-12 text-white relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-3xl font-bold mb-6">Global Signal Network</h3>
                <p className="text-blue-100 mb-8 leading-relaxed text-lg">Connect to over 400 satellites for instantaneous tracking coverage on all continents.</p>
                <div className="pt-4 flex items-center space-x-2">
                  {[1,2,3].map(i => <div key={i} className="w-2 h-2 rounded-full bg-white animate-pulse" style={{ animationDelay: `${i*0.2}s` }} />)}
                </div>
              </div>
              <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
                <Globe className="w-full h-full scale-150 rotate-12" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing / CTA Section */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-4xl bg-primary/20 blur-[150px] -z-10 rounded-full" />
        
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-5xl font-bold mb-8">Ready to Recover Your Device?</h2>
          <p className="text-xl text-slate-400 mb-16 max-w-2xl mx-auto leading-relaxed">
            Choose the tracking plan that fits your needs. Our standard and priority services both offer guaranteed results.
          </p>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <motion.div whileHover={{ y: -10 }} className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10 text-left hover:bg-white/[0.08] transition-all flex flex-col">
              <div className="mb-8">
                <Badge className="bg-slate-800 text-slate-400 border-none mb-4">Plan Standard</Badge>
                <div className="text-5xl font-bold mb-2">$9.99</div>
                <div className="text-slate-400">Paiement unique</div>
              </div>
              <ul className="space-y-4 mb-12 flex-1">
                {['Accès Appareil Unique', 'Localisation Temps Réel', 'Support Standard', 'Historique des Positions'].map((item, i) => (
                  <li key={i} className="flex items-center text-slate-300">
                    <CheckCircle className="w-5 h-5 text-primary mr-3" />
                    {item}
                  </li>
                ))}
              </ul>
              <Button 
                size="lg" 
                variant="outline" 
                className="w-full h-14 rounded-2xl border-white/10 hover:bg-white/5"
                onClick={() => handleTrackingClick("standard")}
              >
                Choisir Standard
              </Button>
            </motion.div>

            <motion.div whileHover={{ y: -10 }} className="bg-gradient-to-br from-primary to-blue-600 rounded-[2.5rem] p-10 text-left relative overflow-hidden shadow-2xl shadow-primary/20 flex flex-col">
              <div className="absolute top-0 right-0 p-8">
                <div className="bg-white/20 backdrop-blur-md rounded-full px-4 py-1 text-[10px] font-bold uppercase tracking-widest">Le Plus Populaire</div>
              </div>
              <div className="relative z-10 flex flex-col h-full">
                <div className="mb-8">
                  <Badge className="bg-white/20 text-white border-none mb-4">Accès Premium</Badge>
                  <div className="text-5xl font-bold mb-2 text-white">$32.90</div>
                  <div className="text-blue-100">Traçage prioritaire</div>
                </div>
                <ul className="space-y-4 mb-12 flex-1">
                  {['Appareils Illimités', 'Mode Haute Précision', 'Support Prioritaire 24/7', 'Mises à jour Automatiques', 'Verrouillage à Distance'].map((item, i) => (
                    <li key={i} className="flex items-center text-white">
                      <CheckCircle className="w-5 h-5 text-blue-200 mr-3" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Button 
                  size="lg" 
                  className="w-full h-14 rounded-2xl bg-white text-primary hover:bg-slate-100 font-bold"
                  onClick={() => handleTrackingClick("priority")}
                >
                  Démarrer Maintenant
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="pt-20 pb-10 border-t border-white/5">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-20">
            <div className="col-span-2 lg:col-span-1">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Satellite className="text-white" size={16} />
                </div>
                <span className="text-lg font-bold">TrackIt Now</span>
              </div>
              <p className="text-slate-400 max-w-xs leading-relaxed">
                Empowering individuals with advanced satellite technology to secure and recover their digital life.
              </p>
            </div>
            
            <div>
              <h4 className="font-bold mb-6 text-sm uppercase tracking-widest text-slate-500">Service</h4>
              <ul className="space-y-4 text-slate-400 text-sm">
                <li><a href="#" className="hover:text-primary transition-colors">Pricing Plans</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Global Coverage</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Security Standards</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-6 text-sm uppercase tracking-widest text-slate-500">Legal</h4>
              <ul className="space-y-4 text-slate-400 text-sm">
                <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
                <li><a href="#" className="hover:text-primary transition-colors">GDPR</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-6 text-sm uppercase tracking-widest text-slate-500">Support</h4>
              <div className="text-sm text-slate-400 leading-relaxed mb-6">
                24/7 technical support is available for all users.
              </div>
              <Button variant="outline" className="w-full border-white/10 rounded-xl text-xs uppercase tracking-widest">Contact Support</Button>
            </div>
          </div>
          
          <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-xs text-slate-500 font-medium tracking-wide italic">
              Military-grade device tracking technology &copy; 2024 TrackIt Now. All rights reserved.
            </p>
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2 grayscale opacity-50">
                <Shield className="w-4 h-4" />
                <span className="text-[10px] font-bold">SSL SECURED</span>
              </div>
              <div className="flex items-center space-x-2 grayscale opacity-50">
                <Lock className="w-4 h-4" />
                <span className="text-[10px] font-bold">GDPR COMPLIANT</span>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Auth Dialog */}
      <Dialog open={showAuth} onOpenChange={setShowAuth}>
        <DialogContent className="sm:max-w-md bg-[#0A0E1A] border-white/10 rounded-[2rem] p-0 overflow-hidden shadow-2xl">
          <div className="relative p-10">
            <div className="absolute top-0 right-0 p-10 opacity-10">
              <MousePointer2 className="w-24 h-24 rotate-12" />
            </div>
            <DialogHeader className="mb-8">
              <DialogTitle className="text-3xl font-bold tracking-tight">
                {isLogin ? "Welcome Back" : "Create Account"}
              </DialogTitle>
              <p className="text-slate-400 pt-2">Enter your credentials to access tracking services.</p>
            </DialogHeader>
            <form onSubmit={handleAuth} className="space-y-6">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Email Address</Label>
                <div className="relative">
                  <Input 
                    type="email" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                    required 
                    className="bg-white/5 border-white/10 h-12 rounded-xl focus:ring-primary focus:border-primary text-white placeholder:text-slate-600"
                    placeholder="name@company.com"
                  />
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Password</Label>
                <div className="relative">
                  <Input 
                    type="password" 
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                    required 
                    className="bg-white/5 border-white/10 h-12 rounded-xl focus:ring-primary focus:border-primary text-white placeholder:text-slate-600"
                    placeholder="••••••••"
                  />
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                </div>
              </div>
              <Button type="submit" className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 font-bold shadow-lg shadow-primary/20">
                {isLogin ? "Continue Tracking" : "Sign Up Now"}
              </Button>
              <div className="text-center">
                <button 
                  type="button"
                  className="text-sm font-medium text-slate-500 hover:text-white transition-colors"
                  onClick={() => setIsLogin(!isLogin)}
                >
                  {isLogin ? "Don't have an account? Create one" : "Already have an account? Sign in"}
                </button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
