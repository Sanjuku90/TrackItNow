import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect, useRef, useState } from "react";
import { toast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
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
import { LocationHistory } from "@shared/schema";

interface MainDashboardProps {
  isVisible: boolean;
  purchaseId?: number;
}

export function MainDashboard({ isVisible, purchaseId }: MainDashboardProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [currentLocation, setCurrentLocation] = useState<[number, number]>(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (id) {
      return [6.1375 + (parseInt(id.split('-')[1]) % 100) * 0.0001, 1.2125 + (parseInt(id.split('-')[1]) % 100) * 0.0001];
    }
    return generateLomeLocation();
  });

  const { data: history } = useQuery<LocationHistory[]>({
    queryKey: [`/api/purchases/${purchaseId}/history`],
    enabled: !!purchaseId && isVisible
  });

  const [activities, setActivities] = useState<ActivityEntry[]>([]);
  const [isPriority, setIsPriority] = useState(false);
  const [geofences, setGeofences] = useState<{name: string, lat: number, lng: number, radius: number}[]>([]);
  const [isReviewMode, setIsReviewMode] = useState(() => {
    return new URLSearchParams(window.location.search).has('id');
  });

  useEffect(() => {
    if (history && history.length > 0) {
      const historyActivities = history.map(h => 
        createActivityEntry(`Position enregistrée`, 'info', [parseFloat(h.lat), parseFloat(h.lng)])
      );
      setActivities(prev => [...historyActivities, ...prev].slice(0, 20));
    }
  }, [history]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('fast') === 'true') {
      setIsPriority(true);
    }
  }, []);

  const generateGhostLink = () => {
    toast({
      title: "Action indisponible",
      description: "La génération de lien Ghost n'est disponible que dans le plan Premium.",
    });
  };

  // Realistic movement simulation following streets in Lomé
  useEffect(() => {
    if (isReviewMode) return;
    if (!isVisible) return;

    const moveInterval = setInterval(() => {
      setCurrentLocation(prev => {
        // Lomé coordinate bounds
        const walkSpeed = 0.00015; 
        
        // Simple logic to mimic street turns
        // We alternate between changing lat and lng to simulate 90-degree turns typical of street grids
        const isHorizontal = Math.random() > 0.5;
        const drift = (Math.random() > 0.5 ? 1 : -1) * walkSpeed;
        
        let newLat = prev[0];
        let newLng = prev[1];

        if (isHorizontal) {
          newLng += drift;
        } else {
          newLat += drift;
        }

        // Keep within Lomé area roughly
        if (newLat > 6.22) newLat -= walkSpeed * 5;
        if (newLat < 6.10) newLat += walkSpeed * 5;
        if (newLng > 1.28) newLng -= walkSpeed * 5;
        if (newLng < 1.12) newLng += walkSpeed * 5;

        // System 3: Breadcrumbs - store trail if priority
        if (isPriority) {
          // Temporarily commented out until state is added back if needed
          // setBreadcrumbTrail(trail => [...trail, [newLat, newLng]] as [number, number][]);
        }

        addActivity('Mise à jour du traçage - Déplacement dans les rues', 'info', [newLat, newLng]);
        
        return [newLat, newLng] as [number, number];
      });
      
      setLastUpdate(new Date().toLocaleTimeString());
    }, isPriority ? 6000 : 10000);

    return () => clearInterval(moveInterval);
  }, [isVisible, isPriority, isReviewMode]);

  // Set initial last update
  const [lastUpdate, setLastUpdate] = useState(new Date().toLocaleTimeString());

  const addActivity = (message: string, type: ActivityEntry['type'] = 'info', location?: [number, number]) => {
    const newActivity = createActivityEntry(message, type, location);
    setActivities(prev => [newActivity, ...prev.slice(0, 9)]);
  };

  const handleActivityClick = (activity: ActivityEntry) => {
    if (activity.location) {
      setCurrentLocation(activity.location);
      // Ensure the map center is updated
      if (mapRef.current && (window as any).L) {
        const L = (window as any).L;
        const maps = document.querySelectorAll('.leaflet-container');
        maps.forEach((m: any) => {
          if (m._leaflet_id) {
            // This is a bit hacky since we don't store the map instance in state,
            // but the useEffect will handle the re-render with new currentLocation
          }
        });
      }
      toast({
        title: "Historique de localisation",
        description: `Visualisation de la position à ${activity.time}`,
      });
    }
  };

  const executeAction = (action: string) => {
    const messages = {
      ring: 'L\'appareil sonne actuellement...',
      lock: 'L\'appareil a été verrouillé à distance',
      wipe: 'Effacement des données initié - Cette action est irréversible !',
    };

    const types: Record<string, ActivityEntry['type']> = {
      ring: 'info',
      lock: 'warning', 
      wipe: 'error',
    };

    addActivity(messages[action as keyof typeof messages], types[action]);
  };

  useEffect(() => {
    if (!isVisible || !mapRef.current) return;

    const L = (window as any).L;
    if (!L) return;

    const map = L.map(mapRef.current, {
      zoomControl: true,
      attributionControl: false
    }).setView(currentLocation, 15);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Optional: Add a subtle overlay for a more technical look
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png', {
      pane: 'shadowPane'
    }).addTo(map);

    const deviceIcon = L.divIcon({
      html: '<div class="relative w-10 h-10 flex items-center justify-center"><div class="absolute inset-0 bg-primary/20 rounded-full animate-ping"></div><div class="relative w-4 h-4 bg-primary rounded-full border-2 border-white shadow-lg"></div></div>',
      iconSize: [40, 40],
      className: 'device-marker'
    });

    L.marker(currentLocation, { icon: deviceIcon })
      .addTo(map);

    // Center map on current location when it changes
    map.panTo(currentLocation);

    // Draw history trail
    if (history && history.length > 1) {
      const pathCoords = history.map(h => [parseFloat(h.lat), parseFloat(h.lng)] as [number, number]);
      L.polyline(pathCoords, {
        color: '#10b981',
        weight: 3,
        opacity: 0.6,
        dashArray: '10, 10'
      }).addTo(map);

      // Add small markers for history points
      pathCoords.forEach((coord, i) => {
        if (i === pathCoords.length - 1) return; // Skip last one (current)
        L.circleMarker(coord, {
          radius: 4,
          fillColor: '#10b981',
          color: '#fff',
          weight: 1,
          opacity: 1,
          fillOpacity: 0.8
        }).addTo(map);
      });
    }

    return () => {
      map.remove();
    };
  }, [isVisible, currentLocation, geofences]);

  if (!isVisible) return null;

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-0 sm:px-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-4 sm:px-0">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <Badge className="bg-emerald-500/20 text-emerald-400 border-none px-3">Live Tracking</Badge>
            {isPriority && <Badge className="bg-primary/20 text-primary border-none px-3">Premium Fast Track</Badge>}
          </div>
          <h2 className="text-3xl font-bold tracking-tight">Terminal de Suivi</h2>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm" className="rounded-xl border-white/10 bg-white/5 h-10">
            <History className="w-4 h-4 mr-2" />
            Historique Complet
          </Button>
          <Button variant="outline" size="sm" className="rounded-xl border-white/10 bg-white/5 h-10">
            <Navigation2 className="w-4 h-4 mr-2" />
            Itinéraires
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
                  className="h-[400px] sm:h-[500px] w-full rounded-2xl sm:rounded-[2.5rem]"
                />
                
                {/* Floating Map Stats */}
                <div className="absolute top-4 left-4 right-4 sm:top-6 sm:left-6 sm:right-6 flex justify-between items-start pointer-events-none">
                  <div className="flex flex-col gap-2 sm:gap-3">
                    {[
                      { label: 'Status', value: 'Locked', icon: LockKeyhole, color: 'white' },
                      { label: 'Pulse', value: 'Active', icon: Activity, color: 'white' }
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
                      { label: 'Network', value: 'MTN 4G', icon: Radio, color: 'white' }
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
                  <h3 className="font-bold text-base sm:text-lg">Assistant Prédictif</h3>
                  <Badge variant="outline" className="text-[8px] sm:text-[10px] uppercase font-bold tracking-widest border-primary/20 text-primary">Actif</Badge>
                </div>
                <p className="text-slate-400 leading-relaxed text-sm sm:text-lg italic">
                  "L'appareil cible est actuellement stationnaire dans une zone résidentielle à Lomé. La stabilité du signal est optimale. Le niveau de batterie suggère environ 4 heures d'autonomie restantes. Recommandation : activer le verrouillage à distance si l'appareil n'est pas en zone sûre."
                </p>
                <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 pt-2">
                  <Button variant="default" size="sm" className="w-full sm:w-auto rounded-xl h-10 px-6 font-bold bg-primary hover:bg-primary/90" onClick={() => executeAction('lock')}>
                    Confirmer le Verrouillage
                  </Button>
                  <Button variant="ghost" size="sm" className="w-full sm:w-auto rounded-xl h-10 px-6 text-slate-400 hover:text-white hover:bg-white/5">
                    Ignorer la Recommandation
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
              Centre d'Action
            </h3>
            
            <div className="space-y-4">
              {[
                { id: 'ring', name: 'Alarme d\'Urgence', desc: 'Déclencher la sonnerie au volume max', icon: Volume2, color: 'emerald' },
                { id: 'lock', name: 'Verrouillage Sécure', desc: 'Verrouiller avec message personnalisé', icon: Lock, color: 'amber' },
                { id: 'wipe', name: 'Effacement Total', desc: 'Suppression irréversible des données', icon: Trash2, color: 'red' }
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
                Activités Récentes
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
                      className={`group p-3 rounded-xl transition-all border border-transparent ${activity.location ? 'cursor-pointer hover:bg-white/5 hover:border-white/10' : ''}`}
                      onClick={() => handleActivityClick(activity)}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <p className={`text-xs sm:text-sm font-medium ${
                            activity.type === 'warning' ? 'text-amber-400' : 
                            activity.type === 'error' ? 'text-red-400' :
                            activity.type === 'success' ? 'text-emerald-400' :
                            'text-slate-200'
                          }`}>
                            {activity.message}
                          </p>
                          {activity.location && (
                            <Badge variant="outline" className="text-[8px] py-0 px-1 border-primary/30 text-primary group-hover:bg-primary/10 transition-colors">
                              VOIR POSITION
                            </Badge>
                          )}
                        </div>
                        {activity.type === 'warning' && <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />}
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-[9px] sm:text-[10px] font-bold text-slate-600 uppercase tracking-widest">{activity.time}</p>
                        {activity.location && <MapPin size={10} className="text-primary/40 group-hover:text-primary transition-colors" />}
                      </div>
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
