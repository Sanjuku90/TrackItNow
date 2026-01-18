import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect, useRef, useState } from "react";
import { toast } from "@/hooks/use-toast";
import { 
  MapPin, 
  RefreshCw, 
  Volume2, 
  Lock, 
  Trash2, 
  Settings, 
  History, 
  Bot,
  Battery,
  Signal,
  LockKeyhole,
  Activity,
  Navigation2,
  ShieldAlert,
  Users,
  Share2,
  Ghost,
  Radio
} from "lucide-react";
import { mockDeviceInfo, generateLomeLocation } from "@/lib/device-data";
import { ActivityEntry, createActivityEntry } from "@/lib/tracking-utils";
import { motion, AnimatePresence } from "framer-motion";

interface MainDashboardProps {
  isVisible: boolean;
}

export function MainDashboard({ isVisible }: MainDashboardProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [currentLocation, setCurrentLocation] = useState(generateLomeLocation());
  const [direction, setDirection] = useState<[number, number]>([0.0009, 0]); 
  const [activities, setActivities] = useState<ActivityEntry[]>([
    createActivityEntry('Identifier accepted', 'success'),
    createActivityEntry('Location found - Lomé, Togo', 'info'),
    createActivityEntry('Device locked remotely', 'warning')
  ]);
  const [isPriority, setIsPriority] = useState(false);
  const [isFamilyPlan, setIsFamilyPlan] = useState(false);
  const [isGhostLink, setIsGhostLink] = useState(false);
  const [geofences, setGeofences] = useState<{name: string, lat: number, lng: number, radius: number}[]>([]);
  const [breadcrumbTrail, setBreadcrumbTrail] = useState<[number, number][]>([]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('fast') === 'true') {
      setIsPriority(true);
    }
    
    // Check for specific plans
    const plan = params.get('plan');
    if (plan === 'family') {
      setIsFamilyPlan(true);
      setGeofences([
        { name: "Maison", lat: currentLocation[0], lng: currentLocation[1], radius: 200 },
        { name: "École", lat: currentLocation[0] + 0.005, lng: currentLocation[1] + 0.005, radius: 300 }
      ]);
    }
    
    if (plan === 'temporary') {
      setIsGhostLink(true);
    }
  }, []);

  const generateGhostLink = () => {
    const token = Math.random().toString(36).substring(2, 15);
    const link = `${window.location.origin}/ghost/${token}`;
    navigator.clipboard.writeText(link);
    toast({
      title: "Ghost Link Generated",
      description: "Secure sharing link copied to clipboard. Expires in 2 hours.",
    });
    addActivity('Ghost Link generated for secure sharing', 'success');
  };

  useEffect(() => {
    if (!isVisible) return;
    
    const moveInterval = setInterval(() => {
      setCurrentLocation(prev => {
        const newLat = prev[0] + direction[0];
        const newLng = prev[1] + direction[1];
        
        // System 3: Breadcrumbs - store trail if family plan or priority
        if (isFamilyPlan || isPriority) {
          setBreadcrumbTrail(trail => [...trail, [newLat, newLng]] as [number, number][]);
        }

        addActivity('Device moving - tracking update', 'info', [newLat, newLng]);
        
        // System 1 & 4: Geofencing & Check-in
        if (isFamilyPlan) {
          geofences.forEach(gf => {
            const dist = Math.sqrt(Math.pow(newLat - gf.lat, 2) + Math.pow(newLng - gf.lng, 2)) * 111000;
            if (dist > gf.radius && Math.random() > 0.8) {
              addActivity(`ALERTE: Sortie de zone - ${gf.name}`, 'error');
            } else if (dist < 50 && Math.random() > 0.9) {
              addActivity(`CHECK-IN: Arrivé à ${gf.name}`, 'success');
            }
          });
        }

        if (Math.random() > 0.7) {
          addActivity('Proximity Alert: Target entered secure perimeter', 'warning');
          try {
            const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const oscillator = audioCtx.createOscillator();
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(440, audioCtx.currentTime);
            oscillator.connect(audioCtx.destination);
            oscillator.start();
            oscillator.stop(audioCtx.currentTime + 0.1);
          } catch (e) {}
        }
        
        return [newLat, newLng] as [number, number];
      });
    }, isPriority ? 3000 : 5000);

    return () => clearInterval(moveInterval);
  }, [isVisible, isPriority, isFamilyPlan, direction, geofences]);

  const addActivity = (message: string, type: ActivityEntry['type'] = 'info', location?: [number, number]) => {
    const newActivity = createActivityEntry(message, type, location);
    setActivities(prev => [newActivity, ...prev.slice(0, 9)]);
  };

  const handleActivityClick = (activity: ActivityEntry) => {
    if (activity.location) {
      setCurrentLocation(activity.location);
      toast({
        title: "Historique de localisation",
        description: `Visualisation de la position à ${activity.time}`,
      });
    }
  };

  const executeAction = (action: string) => {
    const messages = {
      ring: 'Device is now ringing...',
      lock: 'Device has been locked remotely',
      wipe: 'Data wipe initiated - This cannot be undone!',
      panic: 'MOD RE URGENCE: Tracking haute fréquence activé, micro/caméra ouverts'
    };

    const types: Record<string, ActivityEntry['type']> = {
      ring: 'info',
      lock: 'warning', 
      wipe: 'error',
      panic: 'error'
    };

    addActivity(messages[action as keyof typeof messages], types[action]);
  };

  useEffect(() => {
    if (!isVisible || !mapRef.current) return;

    const L = (window as any).L;
    if (!L) return;

    const map = L.map(mapRef.current, {
      zoomControl: false,
      attributionControl: false
    }).setView(currentLocation, 13);
    
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 20
    }).addTo(map);

    const deviceIcon = L.divIcon({
      html: '<div class="relative w-10 h-10 flex items-center justify-center"><div class="absolute inset-0 bg-primary/20 rounded-full animate-ping"></div><div class="relative w-4 h-4 bg-primary rounded-full border-2 border-white shadow-lg"></div></div>',
      iconSize: [40, 40],
      className: 'device-marker'
    });

    L.marker(currentLocation, { icon: deviceIcon })
      .addTo(map);

    // System 3: Breadcrumbs - draw trail
    if ((isFamilyPlan || isPriority) && breadcrumbTrail.length > 1) {
      L.polyline(breadcrumbTrail, {
        color: isPriority ? '#3b82f6' : '#10b981',
        weight: 3,
        opacity: 0.5,
        dashArray: '5, 10'
      }).addTo(map);
    }

    if (isFamilyPlan) {
      geofences.forEach(gf => {
        L.circle([gf.lat, gf.lng], {
          color: '#3b82f6',
          fillColor: '#3b82f6',
          fillOpacity: 0.1,
          radius: gf.radius
        }).addTo(map);

        L.marker([gf.lat, gf.lng], {
          icon: L.divIcon({
            html: `<div class="bg-blue-500/20 p-1 rounded-full border border-blue-500/50"><div class="w-2 h-2 bg-blue-500 rounded-full"></div></div>`,
            className: 'geofence-marker'
          })
        }).addTo(map).bindPopup(gf.name);
      });
    }

    return () => {
      map.remove();
    };
  }, [isVisible, currentLocation, isFamilyPlan, geofences]);

  if (!isVisible) return null;

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-0 sm:px-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-4 sm:px-0">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <Badge className="bg-emerald-500/20 text-emerald-400 border-none px-3">Live Tracking</Badge>
            {isPriority && <Badge className="bg-primary/20 text-primary border-none px-3">Fast Track Priority</Badge>}
            {isFamilyPlan && <Badge className="bg-blue-500/20 text-blue-400 border-none px-3 flex items-center gap-1"><Users size={12}/> Family Circle</Badge>}
            {isGhostLink && <Badge className="bg-purple-500/20 text-purple-400 border-none px-3 flex items-center gap-1"><Ghost size={12}/> Ghost Link Active</Badge>}
          </div>
          <h2 className="text-3xl font-bold tracking-tight">Tracking Terminal</h2>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm" className="rounded-xl border-white/10 bg-white/5 h-10">
            <History className="w-4 h-4 mr-2" />
            Full History
          </Button>
          <Button variant="outline" size="sm" className="rounded-xl border-white/10 bg-white/5 h-10">
            <Navigation2 className="w-4 h-4 mr-2" />
            Route Plans
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 sm:gap-8 px-4 sm:px-0 items-start">
        <div className="lg:col-span-2 space-y-6">
          {/* Map Card */}
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/50 to-emerald-500/50 rounded-2xl sm:rounded-[2.5rem] blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
            <Card className="relative bg-[#0A0E1A] border-white/5 rounded-2xl sm:rounded-[2.5rem] overflow-hidden">
              <CardContent className="p-0">
                <div 
                  ref={mapRef}
                  className="h-[400px] sm:h-[500px] w-full grayscale-[0.5] contrast-[1.2]"
                />
                
                {/* Floating Map Stats */}
                <div className="absolute top-4 left-4 right-4 sm:top-6 sm:left-6 sm:right-6 flex justify-between items-start pointer-events-none">
                  <div className="flex flex-col gap-2 sm:gap-3">
                    {[
                      { label: 'Battery', value: '36%', icon: Battery, color: 'emerald' },
                      { label: 'Status', value: 'Locked', icon: LockKeyhole, color: 'white' }
                    ].map((stat, i) => (
                      <div key={i} className="bg-[#0A0E1A]/90 backdrop-blur-md border border-white/10 p-2 sm:p-3 pr-4 sm:pr-6 rounded-xl sm:rounded-2xl flex items-center space-x-2 sm:space-x-3 shadow-2xl pointer-events-auto">
                        <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-white/5 flex items-center justify-center shrink-0 ${stat.color === 'emerald' ? 'text-emerald-400' : 'text-white'}`}>
                          <stat.icon size={16} />
                        </div>
                        <div>
                          <p className="text-[8px] sm:text-[10px] font-bold uppercase tracking-widest text-slate-500">{stat.label}</p>
                          <p className="text-sm sm:text-base font-bold">{stat.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col gap-2 sm:gap-3 items-end">
                    {[
                      { label: 'Signal', value: 'Excellent', icon: Signal, color: 'blue' },
                      { label: 'Pulse', value: 'Active', icon: Activity, color: 'white' }
                    ].map((stat, i) => (
                      <div key={i} className="bg-[#0A0E1A]/90 backdrop-blur-md border border-white/10 p-2 sm:p-3 pl-4 sm:pl-6 rounded-xl sm:rounded-2xl flex items-center space-x-2 sm:space-x-3 shadow-2xl pointer-events-auto">
                        <div className="text-right">
                          <p className="text-[8px] sm:text-[10px] font-bold uppercase tracking-widest text-slate-500">{stat.label}</p>
                          <p className="text-sm sm:text-base font-bold">{stat.value}</p>
                        </div>
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-white/5 flex items-center justify-center shrink-0 text-blue-400">
                          <stat.icon size={16} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* AI Insights */}
          <Card className="bg-white/5 border-white/5 rounded-2xl sm:rounded-[2.5rem] p-4 sm:p-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 text-center sm:text-left">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-[1.5rem] bg-primary/20 flex items-center justify-center text-primary shrink-0 animate-pulse">
                <Bot size={28} className="sm:size-8" />
              </div>
              <div className="space-y-3 sm:space-y-4 w-full">
                <div className="flex items-center justify-center sm:justify-start space-x-2">
                  <h3 className="font-bold text-base sm:text-lg">Predictive Assistant</h3>
                  <Badge variant="outline" className="text-[8px] sm:text-[10px] uppercase font-bold tracking-widest border-primary/20 text-primary">Active</Badge>
                </div>
                <p className="text-slate-400 leading-relaxed text-sm sm:text-lg italic">
                  "Target device is currently stationary at a residence in Lomé. Signal stability is optimal. Battery levels suggest approximately 4 hours of operation remaining. Recommend enabling remote lock if the device is not in a safe zone."
                </p>
                <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 pt-2">
                  <Button variant="default" size="sm" className="w-full sm:w-auto rounded-xl h-10 px-6 font-bold bg-primary hover:bg-primary/90" onClick={() => executeAction('lock')}>
                    Confirm Remote Lock
                  </Button>
                  <Button variant="ghost" size="sm" className="w-full sm:w-auto rounded-xl h-10 px-6 text-slate-400 hover:text-white hover:bg-white/5">
                    Ignore Recommendation
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-white/5 border-white/5 rounded-2xl sm:rounded-[2.5rem] p-6 sm:p-8">
            <h3 className="text-lg sm:text-xl font-bold mb-6 sm:mb-8 flex items-center">
              <Settings className="text-primary mr-3" size={20} />
              Action Center
            </h3>
            
            <div className="space-y-4">
              {isFamilyPlan && (
                <button
                  onClick={() => executeAction('panic')}
                  className="w-full group text-left p-4 rounded-3xl bg-red-500/10 border border-red-500/20 hover:border-red-500/40 hover:bg-red-500/20 transition-all duration-300 flex items-center space-x-4 mb-2"
                >
                  <div className="w-12 h-12 rounded-2xl bg-red-500/20 text-red-400 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
                    <ShieldAlert size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm truncate text-red-300">PANIC MODE</h4>
                    <p className="text-xs text-red-400/60 truncate">Activez l'urgence maximale</p>
                  </div>
                </button>
              )}
              {isGhostLink && (
                <button
                  onClick={generateGhostLink}
                  className="w-full group text-left p-4 rounded-3xl bg-purple-500/10 border border-purple-500/20 hover:border-purple-500/40 hover:bg-purple-500/20 transition-all duration-300 flex items-center space-x-4 mb-4"
                >
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
                    <Share2 size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm truncate text-purple-300">Generate Ghost Link</h4>
                    <p className="text-xs text-purple-400/60 truncate">Share secure temporary access</p>
                  </div>
                </button>
              )}
              {[
                { id: 'ring', name: 'Emergency Alarm', desc: 'Trigger maximum volume ring', icon: Volume2, color: 'emerald' },
                { id: 'lock', name: 'Secure Lock', desc: 'Lock with custom message', icon: Lock, color: 'amber' },
                { id: 'wipe', name: 'Nuclear Wipe', desc: 'Irreversible data erasure', icon: Trash2, color: 'red' }
              ].map((action) => (
                <button
                  key={action.id}
                  onClick={() => executeAction(action.id)}
                  className="w-full group text-left p-4 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-white/10 hover:bg-white/[0.05] transition-all duration-300 flex items-center space-x-4"
                >
                  <div className={`w-12 h-12 rounded-2xl bg-${action.color}-500/10 text-${action.color}-400 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0`}>
                    <action.icon size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm truncate">{action.name}</h4>
                    <p className="text-xs text-slate-500 truncate">{action.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </Card>

          <Card className="bg-white/5 border-white/5 rounded-2xl sm:rounded-[2.5rem] p-6 sm:p-8 h-[400px] sm:h-[450px] flex flex-col">
            <div className="flex items-center justify-between mb-6 sm:mb-8">
              <h3 className="text-lg sm:text-xl font-bold flex items-center">
                <History className="text-primary mr-3" size={20} />
                Historique d'activité
              </h3>
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            
            <ScrollArea className="flex-1 -mx-2 px-2">
              <div className="space-y-4 sm:space-y-6">
                <AnimatePresence initial={false}>
                  {activities.map((activity) => (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`group p-2 rounded-xl transition-colors ${activity.location ? 'cursor-pointer hover:bg-white/5' : ''}`}
                      onClick={() => handleActivityClick(activity)}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <p className={`text-xs sm:text-sm font-medium ${
                          activity.type === 'warning' ? 'text-amber-400' : 'text-slate-200'
                        }`}>
                          {activity.message}
                          {activity.location && <MapPin size={12} className="inline ml-2 text-primary/60 group-hover:text-primary transition-colors" />}
                        </p>
                        {activity.type === 'warning' && <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />}
                      </div>
                      <p className="text-[9px] sm:text-[10px] font-bold text-slate-600 uppercase tracking-widest">{activity.time}</p>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </ScrollArea>
          </Card>
        </div>
      </div>
    </div>
  );
}
