import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { 
  Play, 
  Pause, 
  Square, 
  RotateCcw, 
  Settings, 
  Cpu, 
  Clock,
  Users,
  Activity
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';

interface SimulationControlProps {
  isRunning: boolean;
  onToggle: () => void;
  onStop?: () => void;
  onResetSimulation?: () => void;
}

const SimulationControl = ({ isRunning, onToggle, onStop, onResetSimulation }: SimulationControlProps) => {
  const [speed, setSpeed] = useState([1]);
  const [totalPilgrims, setTotalPilgrims] = useState([50000]);
  const [timeOfDay, setTimeOfDay] = useState([14]); // 14:00 (2 PM)
  const [weatherIntensity, setWeatherIntensity] = useState([70]);

  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [autoPauseOnEmergency, setAutoPauseOnEmergency] = useState(true);
  const [enableSoundAlerts, setEnableSoundAlerts] = useState(false);
  const [highQualityRendering, setHighQualityRendering] = useState(true);

  const formatTime = (hour: number) => {
    return `${hour.toString().padStart(2, '0')}:00`;
  };

  const getWeatherDescription = (intensity: number) => {
    if (intensity < 30) return 'Clear';
    if (intensity < 60) return 'Partly Cloudy';
    if (intensity < 85) return 'Overcast';
    return 'Heavy Rain';
  };

  const handleStop = () => {
    if (onStop) {
      onStop();
    } else if (isRunning) {
      onToggle();
    }
    toast({ title: 'Simulation Stopped', description: 'The simulation has been halted.' });
  };

  const handleReset = () => {
    setSpeed([1]);
    setTotalPilgrims([50000]);
    setTimeOfDay([14]);
    setWeatherIntensity([70]);
    onResetSimulation?.();
    toast({ title: 'Simulation Reset', description: 'Parameters restored to defaults.' });
  };

  const applyPreset = (preset: 'peak' | 'emergency' | 'normal' | 'festival') => {
    switch (preset) {
      case 'peak':
        setTotalPilgrims([150000]);
        setTimeOfDay([18]);
        setWeatherIntensity([40]);
        setSpeed([1.5]);
        toast({ title: 'Peak Hours', description: 'High crowd levels applied.' });
        break;
      case 'emergency':
        setTotalPilgrims([200000]);
        setTimeOfDay([12]);
        setWeatherIntensity([90]);
        setSpeed([2]);
        toast({ title: 'Emergency Scenario', description: 'Extreme conditions applied.' });
        if (autoPauseOnEmergency && isRunning) {
          onToggle();
        }
        break;
      case 'normal':
        setTotalPilgrims([50000]);
        setTimeOfDay([14]);
        setWeatherIntensity([30]);
        setSpeed([1]);
        toast({ title: 'Normal Day', description: 'Typical conditions applied.' });
        break;
      case 'festival':
        setTotalPilgrims([180000]);
        setTimeOfDay([10]);
        setWeatherIntensity([70]);
        setSpeed([1.2]);
        toast({ title: 'Festival Day', description: 'Festival crowd and weather set.' });
        break;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Simulation Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cpu className="h-5 w-5 text-kumbh-saffron" />
            Simulation Controls
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Status */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Status</span>
            <Badge variant={isRunning ? "default" : "secondary"} className={isRunning ? "bg-green-600" : ""}>
              {isRunning ? 'Running' : 'Stopped'}
            </Badge>
          </div>

          {/* Control Buttons */}
          <div className="grid grid-cols-4 gap-2">
            <Button
              onClick={onToggle}
              variant={isRunning ? "destructive" : "sacred"}
              size="sm"
              className="flex flex-col gap-1 h-auto py-3"
            >
              {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              <span className="text-xs">{isRunning ? 'Pause' : 'Start'}</span>
            </Button>
            
            <Button
              onClick={handleStop}
              variant="outline"
              size="sm"
              className="flex flex-col gap-1 h-auto py-3"
            >
              <Square className="h-4 w-4" />
              <span className="text-xs">Stop</span>
            </Button>
            
            <Button
              onClick={handleReset}
              variant="outline"
              size="sm"
              className="flex flex-col gap-1 h-auto py-3"
            >
              <RotateCcw className="h-4 w-4" />
              <span className="text-xs">Reset</span>
            </Button>
            
            <Dialog open={isConfigOpen} onOpenChange={setIsConfigOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex flex-col gap-1 h-auto py-3"
                >
                  <Settings className="h-4 w-4" />
                  <span className="text-xs">Config</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Simulation Configuration</DialogTitle>
                  <DialogDescription>Adjust behavior and preferences.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="auto-pause">Auto-pause on emergency</Label>
                    <Switch id="auto-pause" checked={autoPauseOnEmergency} onCheckedChange={setAutoPauseOnEmergency} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="sound-alerts">Enable sound alerts</Label>
                    <Switch id="sound-alerts" checked={enableSoundAlerts} onCheckedChange={setEnableSoundAlerts} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="hq-render">High quality rendering</Label>
                    <Switch id="hq-render" checked={highQualityRendering} onCheckedChange={setHighQualityRendering} />
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Speed Control */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Simulation Speed
              </label>
              <span className="text-sm text-muted-foreground">{speed[0]}x</span>
            </div>
            <Slider
              value={speed}
              onValueChange={setSpeed}
              max={5}
              min={0.1}
              step={0.1}
              className="w-full"
            />
          </div>
        </CardContent>
      </Card>

      {/* Environment Parameters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-kumbh-saffron" />
            Environment Parameters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Total Pilgrims */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4" />
                Total Pilgrims
              </label>
              <span className="text-sm text-muted-foreground">
                {totalPilgrims[0].toLocaleString()}
              </span>
            </div>
            <Slider
              value={totalPilgrims}
              onValueChange={setTotalPilgrims}
              max={200000}
              min={10000}
              step={5000}
              className="w-full"
            />
          </div>

          {/* Time of Day */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Time of Day
              </label>
              <span className="text-sm text-muted-foreground">
                {formatTime(timeOfDay[0])}
              </span>
            </div>
            <Slider
              value={timeOfDay}
              onValueChange={setTimeOfDay}
              max={23}
              min={0}
              step={1}
              className="w-full"
            />
          </div>

          {/* Weather Conditions */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Weather Conditions</label>
              <span className="text-sm text-muted-foreground">
                {getWeatherDescription(weatherIntensity[0])}
              </span>
            </div>
            <Slider
              value={weatherIntensity}
              onValueChange={setWeatherIntensity}
              max={100}
              min={0}
              step={5}
              className="w-full"
            />
          </div>

          {/* Quick Presets */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Quick Scenarios</label>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" onClick={() => applyPreset('peak')}>
                Peak Hours
              </Button>
              <Button variant="outline" size="sm" onClick={() => applyPreset('emergency')}>
                Emergency
              </Button>
              <Button variant="outline" size="sm" onClick={() => applyPreset('normal')}>
                Normal Day
              </Button>
              <Button variant="outline" size="sm" onClick={() => applyPreset('festival')}>
                Festival Day
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SimulationControl;