import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";
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
  LockKeyhole
} from "lucide-react";
import { mockDeviceInfo, generateLomeLocation } from "@/lib/device-data";
import { ActivityEntry, createActivityEntry } from "@/lib/tracking-utils";

interface MainDashboardProps {
  isVisible: boolean;
}

export function MainDashboard({ isVisible }: MainDashboardProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [currentLocation, setCurrentLocation] = useState(generateLomeLocation());
  const [activities, setActivities] = useState<ActivityEntry[]>([
    createActivityEntry('Identifier accepted', 'success'),
    createActivityEntry('Location found - Lomé, Togo', 'info'),
    createActivityEntry('Device locked remotely', 'warning')
  ]);

  const addActivity = (message: string, type: ActivityEntry['type'] = 'info') => {
    const newActivity = createActivityEntry(message, type);
    setActivities(prev => [newActivity, ...prev.slice(0, 9)]); // Keep only last 10
  };

  const executeAction = (action: string) => {
    const messages = {
      ring: 'Device is now ringing...',
      lock: 'Device has been locked remotely',
      wipe: 'Data wipe initiated - This cannot be undone!'
    };

    const types: Record<string, ActivityEntry['type']> = {
      ring: 'info',
      lock: 'warning', 
      wipe: 'error'
    };

    addActivity(messages[action as keyof typeof messages], types[action]);
  };

  const refreshLocation = () => {
    const newLocation = generateLomeLocation();
    setCurrentLocation(newLocation);
    addActivity('Location refreshed - Lomé, Togo', 'info');
  };

  useEffect(() => {
    if (!isVisible || !mapRef.current) return;

    // Initialize Leaflet map
    const L = (window as any).L;
    if (!L) return;

    const map = L.map(mapRef.current).setView(currentLocation, 13);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Add device marker
    const deviceIcon = L.divIcon({
      html: '<div class="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center animate-pulse"><div class="w-3 h-3 bg-white rounded-full"></div></div>',
      iconSize: [24, 24],
      className: 'device-marker'
    });

    L.marker(currentLocation, { icon: deviceIcon })
      .addTo(map)
      .bindPopup(`Device Location<br>Battery: ${mockDeviceInfo.battery}<br>Last seen: 2 minutes ago`)
      .openPopup();

    return () => {
      map.remove();
    };
  }, [isVisible, currentLocation]);

  if (!isVisible) return null;

  return (
    <div className="animate-in slide-in-from-bottom-5 duration-300">
      <div className="grid lg:grid-cols-3 gap-8 mb-8">
        
        {/* Map Section */}
        <div className="lg:col-span-2">
          <Card className="bg-slate-800/50 backdrop-blur-lg border-slate-700/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold flex items-center">
                  <MapPin className="text-emerald-400 mr-3 animate-pulse" size={24} />
                  Live Location
                </h2>
                <Button 
                  onClick={refreshLocation}
                  size="sm"
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  <RefreshCw className="mr-2" size={16} />
                  Refresh
                </Button>
              </div>
              
              <div 
                ref={mapRef}
                className="h-80 rounded-lg border border-slate-600 bg-slate-700"
              />
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                <div className="bg-slate-700/50 rounded-lg p-3 text-center">
                  <MapPin className="text-emerald-400 mb-1 mx-auto" size={16} />
                  <p className="text-xs text-slate-400">Location</p>
                  <p className="font-semibold">Lomé, TG</p>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-3 text-center">
                  <Battery className="text-amber-400 mb-1 mx-auto" size={16} />
                  <p className="text-xs text-slate-400">Battery</p>
                  <p className="font-semibold">{mockDeviceInfo.battery}</p>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-3 text-center">
                  <Signal className="text-blue-400 mb-1 mx-auto" size={16} />
                  <p className="text-xs text-slate-400">Network</p>
                  <p className="font-semibold">{mockDeviceInfo.network}</p>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-3 text-center">
                  <LockKeyhole className="text-red-400 mb-1 mx-auto" size={16} />
                  <p className="text-xs text-slate-400">Status</p>
                  <p className="font-semibold">{mockDeviceInfo.lockStatus}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Control Panel */}
        <div className="space-y-6">
          {/* Device Actions */}
          <Card className="bg-slate-800/50 backdrop-blur-lg border-slate-700/50">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center">
                <Settings className="text-blue-400 mr-3" size={20} />
                Device Actions
              </h3>
              
              <div className="space-y-3">
                <Button 
                  onClick={() => executeAction('ring')}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-4 flex items-center justify-center"
                >
                  <Volume2 className="mr-2" size={16} />
                  Make Ring
                </Button>
                
                <Button 
                  onClick={() => executeAction('lock')}
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white font-medium py-3 px-4 flex items-center justify-center"
                >
                  <Lock className="mr-2" size={16} />
                  Remote Lock
                </Button>
                
                <Button 
                  onClick={() => executeAction('wipe')}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 flex items-center justify-center"
                >
                  <Trash2 className="mr-2" size={16} />
                  Wipe Data
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Activity Timeline */}
          <Card className="bg-slate-800/50 backdrop-blur-lg border-slate-700/50">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center">
                <History className="text-blue-400 mr-3" size={20} />
                Activity Journal
              </h3>
              
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {activities.map((activity) => {
                  const colors = {
                    success: 'bg-emerald-400',
                    error: 'bg-red-400',
                    warning: 'bg-amber-400',
                    info: 'bg-blue-400'
                  };

                  return (
                    <div key={activity.id} className="flex items-start space-x-3 animate-in fade-in-0 duration-300">
                      <div className={`w-2 h-2 ${colors[activity.type]} rounded-full mt-2`}></div>
                      <div>
                        <p className="text-sm font-medium">{activity.time} - {activity.message}</p>
                        <p className="text-xs text-slate-400">Real-time update</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* AI Assistant */}
      <Card className="bg-slate-800/50 backdrop-blur-lg border-slate-700/50">
        <CardContent className="p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center">
            <Bot className="text-blue-400 mr-3" size={20} />
            AI Assistant
          </h3>
          
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center animate-pulse">
              <Bot className="text-white" size={24} />
            </div>
            <div className="flex-1 bg-slate-700/50 rounded-lg p-4">
              <p className="text-sm">
                "I'm searching for the phone... Position found near Lomé, Togo. 
                Battery is low at {mockDeviceInfo.battery}. The device is currently {mockDeviceInfo.lockStatus.toLowerCase()}. 
                Would you like me to make it ring?"
              </p>
              <div className="flex space-x-2 mt-3">
                <Button 
                  size="sm"
                  onClick={() => executeAction('ring')}
                  className="bg-blue-500 hover:bg-blue-600 text-white text-xs px-3 py-1"
                >
                  Yes, Ring It
                </Button>
                <Button 
                  size="sm"
                  variant="outline"
                  className="bg-slate-600 hover:bg-slate-500 text-white text-xs px-3 py-1 border-slate-500"
                >
                  Not Now
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
