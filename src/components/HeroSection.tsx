import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import heroImage from '@/assets/kumbh-mela-hero.jpg';

type HeroSectionProps = {
  onNavigate?: (tab: string) => void;
};
const HeroSection: React.FC<HeroSectionProps> = ({ onNavigate }) => {
  const navigate = onNavigate ?? (() => {});
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const targetDate = new Date('2027-07-15T00:00:00').getTime();

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center text-white px-4 max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-6xl md:text-8xl font-bold mb-4 bg-gradient-to-r from-kumbh-saffron via-kumbh-gold to-kumbh-deep-saffron bg-clip-text text-transparent">
            कुंभ मेळा 2027
          </h1>
          <h2 className="text-4xl md:text-6xl font-semibold mb-6">
            Nashik Kumbh Mela 2027
          </h2>
          <p className="text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto leading-relaxed">
            Sacred gathering of millions at the banks of Godavari River. Advanced crowd management system ensuring safety and seamless pilgrimage experience.
          </p>
        </div>

        {/* Countdown */}
        <div className="grid grid-cols-4 gap-4 md:gap-8 max-w-2xl mx-auto mb-12">
          {[
            { label: 'Days', value: timeLeft.days },
            { label: 'Hours', value: timeLeft.hours },
            { label: 'Minutes', value: timeLeft.minutes },
            { label: 'Seconds', value: timeLeft.seconds }
          ].map((item, index) => (
            <Card key={index} className="bg-white/10 backdrop-blur-md border-white/20">
              <CardContent className="p-4 text-center">
                <div className="text-2xl md:text-4xl font-bold text-kumbh-gold">
                  {item.value.toString().padStart(2, '0')}
                </div>
                <div className="text-sm md:text-base text-gray-200 mt-1">
                  {item.label}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button variant="sacred" size="lg" className="text-lg px-8 py-4" onClick={() => navigate('heatmap')}>
            View Crowd Status
          </Button>
          <Button variant="golden" size="lg" className="text-lg px-8 py-4" onClick={() => navigate('assistant')}>
            Plan Your Journey
          </Button>
          <Button variant="spiritual" size="lg" className="text-lg px-8 py-4" onClick={() => navigate('emergency')}>
            Emergency Contact
          </Button>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white animate-bounce">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/70 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;