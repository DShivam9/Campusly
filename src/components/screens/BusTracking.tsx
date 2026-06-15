import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import {
  Bus,
  MapPin,
  Clock,
  Navigation,
  ChevronRight,
  Wifi,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import * as api from '../../lib/api';

const busIconHtml = `<div style="background-color: #ffffff; padding: 6px; border-radius: 50%; color: black; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.5); width: 28px; height: 28px;">
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 6v6"/><path d="M15 6v6"/><path d="M2 12h19.6"/><path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4a2 2 0 0 0-2 2v10h3"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/></svg>
</div>`;

const getBusIcon = (isActive: boolean) => {
  return new L.DivIcon({
    html: busIconHtml.replace('#ffffff', isActive ? '#ffffff' : '#a1a1aa'),
    className: 'custom-bus-icon',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
};

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, map.getZoom(), { animate: true });
  }, [center, map]);
  return null;
}

export function BusTracking() {
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);
  const { data, isLoading, error } = useApi(() => api.fetchBusRoutes(), []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-accent-light animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-white/60 gap-3">
        <AlertTriangle className="w-8 h-8 text-amber-400" />
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  const routes = data?.routes || [];

  // Auto-select first route
  if (routes.length > 0 && selectedRoute === null) {
    setSelectedRoute(routes[0].id);
  }

  const activeRoute = routes.find((r: any) => r.id === selectedRoute);
  const stops = activeRoute ? (activeRoute.stops as any[]) : [];
  const activeBus = activeRoute?.buses?.[0];
  const currentStopName = activeBus?.currentLocation?.currentStop;

  // Determine stop statuses
  const stopsWithStatus = stops.map((stop: any) => {
    const currentIdx = stops.findIndex((s: any) => s.name === currentStopName);
    const thisIdx = stop.order - 1;
    let status = 'upcoming';
    if (currentIdx >= 0) {
      if (thisIdx < currentIdx) status = 'passed';
      else if (thisIdx === currentIdx) status = 'current';
    }
    return { ...stop, status };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Bus Tracking</h1>
        <p className="text-white/50 mt-1">Real-time campus bus status</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Active Buses', value: routes.reduce((s: number, r: any) => s + (r.buses?.length || 0), 0).toString(), icon: Bus },
          { label: 'Total Routes', value: routes.length.toString(), icon: Navigation },
          { label: 'Next Arrival', value: activeBus?.currentLocation ? '8 min' : '—', icon: Clock },
          { label: 'Live Tracking', value: 'ON', icon: Wifi },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="card-dark p-6"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                <stat.icon className="w-5 h-5 text-white/50" />
              </div>
            </div>
            <p className="text-2xl font-bold text-white tracking-tight">{stat.value}</p>
            <p className="text-[10px] uppercase font-bold tracking-widest text-white/30 mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Live Map */}
      <div className="card-dark p-1 rounded-xl h-[400px] overflow-hidden relative z-0">
        <MapContainer 
          center={[12.9716, 77.5946]} 
          zoom={12} 
          style={{ height: '100%', width: '100%', borderRadius: '0.6rem' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CartoDB</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
          {activeBus?.currentLocation && (
            <MapUpdater center={[activeBus.currentLocation.lat, activeBus.currentLocation.lng]} />
          )}
          {routes.map((route: any) => {
            const bus = route.buses?.[0];
            if (!bus?.currentLocation) return null;
            return (
              <Marker 
                key={route.id} 
                position={[bus.currentLocation.lat, bus.currentLocation.lng]}
                icon={getBusIcon(selectedRoute === route.id)}
              >
                <Popup className="custom-popup">
                  <div className="font-semibold text-black">{route.routeName}</div>
                  <div className="text-sm text-gray-800">Bus: {bus.registration || 'Unknown'}</div>
                  <div className="text-sm text-gray-800">Next Stop: {bus.currentLocation.nextStop || 'Arriving soon'}</div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Routes List */}
        <div className="lg:col-span-3 card-dark p-5">
          <div className="flex items-center gap-2 mb-4">
            <Bus className="w-5 h-5 text-white/50" />
            <h3 className="text-base font-semibold text-white">Bus Routes</h3>
          </div>
          <div className="space-y-3">
            {routes.map((route: any, i: number) => {
              const bus = route.buses?.[0];
              const isAtCampus = !bus?.currentLocation?.nextStop;
              const occupancy = bus?.currentLocation?.occupancy;

              return (
                <motion.button
                  key={route.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.06 }}
                  onClick={() => setSelectedRoute(route.id)}
                  className={`w-full text-left flex items-center gap-4 p-4 rounded-lg transition-all ${
                    selectedRoute === route.id
                      ? 'bg-accent/10 border border-accent/20'
                      : 'bg-white/[0.02] hover:bg-white/[0.04] border border-transparent'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    isAtCampus ? 'bg-white/10' : 'bg-white/5'
                  }`}>
                    <Bus className={`w-5 h-5 ${isAtCampus ? 'text-white' : 'text-white/40'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white/90">{route.routeName}</p>
                    <p className="text-xs text-white/40 mt-0.5">{bus?.registration || '—'} · {bus?.driver || '—'}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    {isAtCampus ? (
                      <span className="text-[10px] px-2 py-0.5 rounded border border-white/20 text-white font-bold">AT CAMPUS</span>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded border border-white/10 text-white/40">EN ROUTE</span>
                    )}
                    {bus && <p className="text-[10px] text-white/20 mt-1">{occupancy || 0}/{bus.capacity} seats</p>}
                  </div>
                  <ChevronRight className="w-4 h-4 text-white/20 flex-shrink-0" />
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Route Detail / Stops */}
        <div className="lg:col-span-2 card-dark p-5">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-5 h-5 text-white/50" />
            <h3 className="text-base font-semibold text-white">Route Stops</h3>
          </div>
          <div className="space-y-1">
            {stopsWithStatus.map((stop: any, i: number) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.06 }}
                className="flex items-center gap-3 py-2.5"
              >
                {/* Timeline */}
                <div className="flex flex-col items-center w-4 flex-shrink-0">
                  <div className={`w-3 h-3 rounded-full border-2 ${
                    stop.status === 'passed' ? 'bg-white/60 border-white/60' :
                    stop.status === 'current' ? 'bg-white border-white animate-pulse shadow-[0_0_10px_rgba(255,255,255,0.5)]' : 'bg-transparent border-white/20'
                  }`} />
                  {i < stopsWithStatus.length - 1 && (
                    <div className={`w-0.5 h-6 mt-0.5 ${
                      stop.status === 'passed' ? 'bg-white/20' : 'bg-white/5'
                    }`} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${
                    stop.status === 'current' ? 'font-bold text-white' :
                    stop.status === 'passed' ? 'text-white/30' : 'text-white/60'
                  }`}>{stop.name}</p>
                </div>
                <span className={`text-xs flex-shrink-0 ${
                  stop.status === 'current' ? 'text-white font-bold' : 'text-white/20'
                }`}>{stop.time}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
