import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Navigation from '@/components/Navigation';
import HeroSection from '@/components/HeroSection';
import CrowdDashboard from '@/components/CrowdDashboard';
import HeatMapVisualization from '@/components/HeatMapVisualization';
import SimulationControl from '@/components/SimulationControl';
import RiskPrediction from '@/components/RiskPrediction';
import AIAssistant from '@/components/AIAssistant';
import Simulation3D from '@/components/3DSimulation';
import PilgrimageSchedule from '@/components/PilgrimageSchedule';
import EmergencyInfo from '@/components/EmergencyInfo';

const Index = () => {
  const [isSimulationRunning, setIsSimulationRunning] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  const handleToggleSimulation = () => {
    setIsSimulationRunning(!isSimulationRunning);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation 
        isSimulationRunning={isSimulationRunning}
        onToggleSimulation={handleToggleSimulation}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />
      
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="simulation">Simulation</TabsTrigger>
            <TabsTrigger value="heatmap">Heat Map</TabsTrigger>
            <TabsTrigger value="prediction">AI Prediction</TabsTrigger>
            <TabsTrigger value="assistant">AI Assistant</TabsTrigger>
            <TabsTrigger value="emergency">Emergency</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8">
            <HeroSection />
            <CrowdDashboard />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Simulation3D />
              <AIAssistant />
            </div>
          </TabsContent>

          <TabsContent value="simulation" className="space-y-6">
            <SimulationControl 
              isRunning={isSimulationRunning}
              onToggle={handleToggleSimulation}
            />
            <Simulation3D />
          </TabsContent>

          <TabsContent value="heatmap" className="space-y-6">
  {/* This is your original component */}
  <HeatMapVisualization />

  {/* This new div and iframe adds your map */}
  <div style={{ 
      border: '1px solid #27272a', 
      borderRadius: '8px', 
      overflow: 'hidden'
  }}>
    <iframe
      title="Kumbh Flow Map"
      src="/map.html"
      style={{ 
        width: '100%', 
        height: '75vh',
        border: 'none' 
      }}
    ></iframe>
  </div>
</TabsContent>

          <TabsContent value="prediction">
            <RiskPrediction />
          </TabsContent>

          <TabsContent value="assistant">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-6">
                <RiskPrediction />
              </div>
              <AIAssistant />
            </div>
          </TabsContent>

          <TabsContent value="emergency" className="space-y-6">
            <EmergencyInfo />
            <PilgrimageSchedule />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
