import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  milliseconds: number;
}

export const CountdownTimer = () => {
  const [targetDate, setTargetDate] = useState<Date | null>(null);
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCountdownDate = async () => {
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('value')
          .eq('key', 'countdown_date')
          .maybeSingle();

        if (error) throw error;
        
        if (data?.value) {
          const dateValue = (data.value as { date: string }).date;
          if (dateValue) {
            setTargetDate(new Date(dateValue));
          }
        }
      } catch (error) {
        console.error('Failed to fetch countdown date:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCountdownDate();
  }, []);

  useEffect(() => {
    if (!targetDate) return;

    const calculateTimeLeft = (): TimeLeft | null => {
      const now = new Date().getTime();
      const target = targetDate.getTime();
      const difference = target - now;

      if (difference <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0, milliseconds: 0 };
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000),
        milliseconds: Math.floor((difference % 1000) / 10),
      };
    };

    // Update every 10ms for smooth milliseconds
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 10);

    return () => clearInterval(timer);
  }, [targetDate]);

  if (isLoading) {
    return null;
  }

  if (!targetDate || !timeLeft) {
    return null;
  }

  const timeUnits = [
    { label: 'Days', value: timeLeft.days },
    { label: 'Hours', value: timeLeft.hours },
    { label: 'Minutes', value: timeLeft.minutes },
    { label: 'Seconds', value: timeLeft.seconds },
    { label: 'MS', value: timeLeft.milliseconds },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative py-8 bg-gradient-to-b from-background via-card/50 to-background"
    >
      <div className="container mx-auto px-4">
        <div className="text-center mb-6">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-gradient-gold">
            Annual Day Countdown
          </h2>
        </div>
        
        <div className="flex justify-center items-center gap-2 md:gap-4 flex-wrap">
          {timeUnits.map((unit, index) => (
            <motion.div
              key={unit.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="glass-card rounded-xl p-3 md:p-6 min-w-[70px] md:min-w-[100px] text-center border border-primary/20"
            >
              <div className="font-display text-2xl md:text-4xl lg:text-5xl font-bold text-primary tabular-nums">
                {String(unit.value).padStart(2, '0')}
              </div>
              <div className="text-xs md:text-sm text-muted-foreground mt-1 uppercase tracking-wider">
                {unit.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
};
