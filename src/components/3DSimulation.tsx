import React, { Suspense, useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Box, Sphere } from '@react-three/drei';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Maximize2, 
  Minimize2, 
  RotateCcw, 
  Eye, 
  Cpu,
  Users
} from 'lucide-react';
import * as THREE from 'three';

// Satellite basemap ground built from map tiles
const SatelliteGround = ({
  centerLat = 19.9975, // Nashik approx
  centerLon = 73.7898,
  zoom = 16,
  tileSize = 256,
  tilesRadius = 1,
}: {
  centerLat?: number;
  centerLon?: number;
  zoom?: number;
  tileSize?: number;
  tilesRadius?: number;
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const textureRef = useRef<THREE.CanvasTexture | null>(null);

  const tileUrlTemplate = useMemo(() => {
    const envUrl = import.meta.env.VITE_SATELLITE_TILE_URL as string | undefined;
    // Default to Esri World_Imagery if not provided
    return envUrl || 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
  }, []);

  useEffect(() => {
    let isCancelled = false;

    const lonLatToTile = (lon: number, lat: number, z: number) => {
      const latRad = (lat * Math.PI) / 180;
      const n = Math.pow(2, z);
      const x = Math.floor(((lon + 180) / 360) * n);
      const y = Math.floor(
        (1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2 * n
      );
      return { x, y };
    };

    const { x: cx, y: cy } = lonLatToTile(centerLon, centerLat, zoom);
    const count = tilesRadius * 2 + 1;
    const canvas = document.createElement('canvas');
    canvas.width = tileSize * count;
    canvas.height = tileSize * count;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const fetchTile = (x: number, y: number) => {
      const url = tileUrlTemplate
        .replace('{z}', String(zoom))
        .replace('{x}', String(x))
        .replace('{y}', String(y));
      return new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = reject as OnErrorEventHandler;
        img.src = url;
      });
    };

    const load = async () => {
      try {
        const promises: Array<Promise<HTMLImageElement>> = [];
        for (let dy = -tilesRadius; dy <= tilesRadius; dy++) {
          for (let dx = -tilesRadius; dx <= tilesRadius; dx++) {
            promises.push(fetchTile(cx + dx, cy + dy));
          }
        }
        const images = await Promise.all(promises);
        if (isCancelled) return;

        let i = 0;
        for (let dy = -tilesRadius; dy <= tilesRadius; dy++) {
          for (let dx = -tilesRadius; dx <= tilesRadius; dx++) {
            const img = images[i++];
            const sx = (dx + tilesRadius) * tileSize;
            const sy = (dy + tilesRadius) * tileSize;
            ctx.drawImage(img, sx, sy, tileSize, tileSize);
          }
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.ClampToEdgeWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;
        texture.anisotropy = 8;
        texture.needsUpdate = true;
        textureRef.current = texture;
        if (meshRef.current) {
          const material = meshRef.current.material as THREE.MeshStandardMaterial;
          material.map = texture;
          material.needsUpdate = true;
        }
      } catch {
        // Ignore load errors
      }
    };

    load();
    return () => {
      isCancelled = true;
      if (textureRef.current) {
        textureRef.current.dispose();
        textureRef.current = null;
      }
    };
  }, [centerLat, centerLon, tileSize, tilesRadius, tileUrlTemplate, zoom]);

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
      <planeGeometry args={[5, 5]} />
      <meshStandardMaterial color="#e5e7eb" />
    </mesh>
  );
};

// Animated crowd particles
const CrowdParticle = ({ position, color, speed }: { position: [number, number, number], color: string, speed: number }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.x += Math.sin(state.clock.elapsedTime * speed) * 0.001;
      meshRef.current.position.z += Math.cos(state.clock.elapsedTime * speed) * 0.001;
    }
  });

  return (
    <Sphere ref={meshRef} position={position} args={[0.02, 8, 8]}>
      <meshStandardMaterial color={color} />
    </Sphere>
  );
};

// Temple/Location markers
const LocationMarker = ({ position, label, riskLevel }: { 
  position: [number, number, number], 
  label: string, 
  riskLevel: string 
}) => {
  const getColor = () => {
    switch (riskLevel) {
      case 'low': return '#10b981';
      case 'medium': return '#f59e0b';
      case 'high': return '#f97316';
      case 'critical': return '#ef4444';
      default: return '#6b7280';
    }
  };

  return (
    <group position={position}>
      <Box args={[0.1, 0.2, 0.1]}>
        <meshStandardMaterial color={getColor()} />
      </Box>
      <Text
        position={[0, 0.15, 0]}
        fontSize={0.05}
        color={getColor()}
        anchorX="center"
        anchorY="middle"
      >
        {label}
      </Text>
    </group>
  );
};

// Heat zone visualization
const HeatZone = ({ center, radius, intensity }: { 
  center: [number, number, number], 
  radius: number, 
  intensity: number 
}) => {
  const getColor = () => {
    if (intensity < 0.25) return '#10b981';
    if (intensity < 0.5) return '#f59e0b';
    if (intensity < 0.75) return '#f97316';
    return '#ef4444';
  };

  return (
    <Sphere position={center} args={[radius, 16, 16]}>
      <meshStandardMaterial 
        color={getColor()} 
        transparent 
        opacity={0.3}
        wireframe
      />
    </Sphere>
  );
};

export type LocationData = { position: [number, number, number]; label: string; riskLevel: 'low' | 'medium' | 'high' | 'critical' };
export type HeatZoneData = { center: [number, number, number]; radius: number; intensity: number };
export type ParticleData = { position: [number, number, number]; color: string; speed: number };

// Main 3D Scene
const Scene3D = ({
  locations,
  heatZones,
  crowdParticles,
}: {
  locations?: LocationData[];
  heatZones?: HeatZoneData[];
  crowdParticles?: ParticleData[];
}) => {
  // Fallback sample data when props not provided
  const defaultLocations: LocationData[] = useMemo(() => ([
    { position: [-1, 0, -1], label: 'Ramkund', riskLevel: 'high' },
    { position: [1, 0, -1], label: 'Triveni', riskLevel: 'critical' },
    { position: [0, 0, 1], label: 'Kalaram', riskLevel: 'medium' },
    { position: [-1.5, 0, 0.5], label: 'Sita Gufha', riskLevel: 'low' },
  ]), []);

  const defaultHeatZones: HeatZoneData[] = useMemo(() => ([
    { center: [-1, 0, -1], radius: 0.3, intensity: 0.8 },
    { center: [1, 0, -1], radius: 0.4, intensity: 0.95 },
    { center: [0, 0, 1], radius: 0.25, intensity: 0.6 },
    { center: [-1.5, 0, 0.5], radius: 0.2, intensity: 0.3 },
  ]), []);

  const defaultParticles: ParticleData[] = useMemo(() => {
    const arr: ParticleData[] = [];
    for (let i = 0; i < 200; i++) {
      const x = (Math.random() - 0.5) * 4;
      const z = (Math.random() - 0.5) * 4;
      const y = 0.02;
      const intensity = Math.abs(x) + Math.abs(z) < 1.5 ? 0.8 : 0.3;
      const color = intensity > 0.6 ? '#ef4444' : '#10b981';
      arr.push({ position: [x, y, z], color, speed: Math.random() * 2 + 1 });
    }
    return arr;
  }, []);

  const locs = locations ?? defaultLocations;
  const zones = heatZones ?? defaultHeatZones;
  const particles = crowdParticles ?? defaultParticles;

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      
      {/* Satellite ground */}
      <SatelliteGround />

      {/* Location markers */}
      {locs.map((location, index) => (
        <LocationMarker
          key={index}
          position={location.position}
          label={location.label}
          riskLevel={location.riskLevel}
        />
      ))}

      {/* Heat zones */}
      {zones.map((zone, index) => (
        <HeatZone
          key={index}
          center={zone.center}
          radius={zone.radius}
          intensity={zone.intensity}
        />
      ))}

      {/* Crowd particles */}
      {particles.map((particle, index) => (
        <CrowdParticle
          key={index}
          position={particle.position}
          color={particle.color}
          speed={particle.speed}
        />
      ))}

      {/* Camera controls */}
      <OrbitControls 
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        maxDistance={8}
        minDistance={2}
      />
    </>
  );
};

const Simulation3D = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [view, setView] = useState<'overview' | 'heatmap' | 'crowd'>('overview');

  // Real-time state
  const [locations, setLocations] = useState<LocationData[] | undefined>(undefined);
  const [heatZones, setHeatZones] = useState<HeatZoneData[] | undefined>(undefined);
  const [crowdParticles, setCrowdParticles] = useState<ParticleData[] | undefined>(undefined);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    // Try WebSocket, fallback to timer-based simulation
    const url = import.meta.env.VITE_SIM_WS_URL as string | undefined;
    let ws: WebSocket | null = null;
    let timer: number | null = null;

    const bootstrapDefaults = () => {
      // Start from current defaults of Scene3D for consistency
      const seedLocations: LocationData[] = [
        { position: [-1, 0, -1], label: 'Ramkund', riskLevel: 'high' },
        { position: [1, 0, -1], label: 'Triveni', riskLevel: 'critical' },
        { position: [0, 0, 1], label: 'Kalaram', riskLevel: 'medium' },
        { position: [-1.5, 0, 0.5], label: 'Sita Gufha', riskLevel: 'low' },
      ];
      const seedHeat: HeatZoneData[] = [
        { center: [-1, 0, -1], radius: 0.3, intensity: 0.8 },
        { center: [1, 0, -1], radius: 0.4, intensity: 0.95 },
        { center: [0, 0, 1], radius: 0.25, intensity: 0.6 },
        { center: [-1.5, 0, 0.5], radius: 0.2, intensity: 0.3 },
      ];
      const seedParticles: ParticleData[] = Array.from({ length: 200 }).map(() => {
        const x = (Math.random() - 0.5) * 4;
        const z = (Math.random() - 0.5) * 4;
        const y = 0.02;
        const intensity = Math.abs(x) + Math.abs(z) < 1.5 ? 0.8 : 0.3;
        const color = intensity > 0.6 ? '#ef4444' : '#10b981';
        return { position: [x, y, z], color, speed: Math.random() * 2 + 1 };
      });
      setLocations(seedLocations);
      setHeatZones(seedHeat);
      setCrowdParticles(seedParticles);
    };

    bootstrapDefaults();

    if (url) {
      try {
        ws = new WebSocket(url);
        ws.onopen = () => setIsLive(true);
        ws.onclose = () => setIsLive(false);
        ws.onerror = () => setIsLive(false);
        ws.onmessage = (evt) => {
          try {
            const data = JSON.parse(evt.data);
            if (data.locations) setLocations(data.locations);
            if (data.heatZones) setHeatZones(data.heatZones);
            if (data.crowdParticles) setCrowdParticles(data.crowdParticles);
          } catch {
            // ignore malformed messages
          }
        };
      } catch {
        setIsLive(false);
      }
    }

    if (!url) {
      // Fallback: periodically mutate the state to simulate live updates
      timer = window.setInterval(() => {
        setHeatZones((prev) => {
          const arr = (prev ?? []).map(z => ({
            ...z,
            intensity: Math.max(0.05, Math.min(1, z.intensity + (Math.random() - 0.5) * 0.1)),
          }));
          return arr.length ? arr : prev;
        });
        setCrowdParticles((prev) => {
          const arr = (prev ?? []).map(p => {
            const [x, y, z] = p.position;
            const nx = Math.max(-2, Math.min(2, x + (Math.random() - 0.5) * 0.02));
            const nz = Math.max(-2, Math.min(2, z + (Math.random() - 0.5) * 0.02));
            return { ...p, position: [nx, y, nz] as [number, number, number] };
          });
          return arr.length ? arr : prev;
        });
      }, 1000);
    }

    return () => {
      if (ws) ws.close();
      if (timer) window.clearInterval(timer);
    };
  }, []);

  return (
    <Card className={isFullscreen ? 'fixed inset-4 z-50' : ''}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Cpu className="h-5 w-5 text-kumbh-saffron" />
            3D Crowd Simulation
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-kumbh-saffron/10">
              {isLive ? 'Real-time' : 'Simulated'}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* View Controls */}
        <div className="flex items-center gap-2 mb-4">
          <Button
            variant={view === 'overview' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setView('overview')}
          >
            <Eye className="h-4 w-4 mr-1" />
            Overview
          </Button>
          <Button
            variant={view === 'heatmap' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setView('heatmap')}
          >
            Heat Map
          </Button>
          <Button
            variant={view === 'crowd' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setView('crowd')}
          >
            <Users className="h-4 w-4 mr-1" />
            Crowd Flow
          </Button>
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>

        {/* 3D Canvas */}
        <div className={`bg-gradient-to-br from-background to-accent/20 rounded-lg border overflow-hidden ${
          isFullscreen ? 'h-[calc(100vh-200px)]' : 'h-96'
        }`}>
          <Canvas camera={{ position: [3, 3, 3], fov: 60 }}>
            <Suspense fallback={null}>
              <Scene3D 
                locations={locations}
                heatZones={heatZones}
                crowdParticles={crowdParticles}
              />
            </Suspense>
          </Canvas>
        </div>

        {/* Legend */}
        <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Low Risk</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span>Medium Risk</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            <span>High Risk</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>Critical Risk</span>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-4 grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-kumbh-spiritual-blue">226K</div>
            <div className="text-sm text-muted-foreground">Total Simulated</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-kumbh-deep-saffron">8</div>
            <div className="text-sm text-muted-foreground">Active Zones</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-kumbh-river-blue">92%</div>
            <div className="text-sm text-muted-foreground">Accuracy</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Simulation3D;