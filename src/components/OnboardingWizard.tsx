import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Zap, Users, X, ChevronRight, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Step = {
  title: string;
  description: string;
  icon: React.ReactNode;
  targetId?: string;
  position: 'center' | 'bottom' | 'top';
};

const steps: Step[] = [
  {
    title: 'Welcome to MES Campus School!',
    description:
      'Let us show you around our Annual Day website. Click Next to begin the tour.',
    icon: <span className="text-4xl">🎉</span>,
    position: 'center',
  },
  {
    title: 'Programme Schedule',
    description:
      'Find the complete Annual Day programme schedule here. See all performances, timings, and events.',
    icon: <Calendar className="w-8 h-8 text-primary" />,
    targetId: 'schedule',
    position: 'top',
  },
  {
    title: 'AI Assistant',
    description:
      'Have questions about Annual Day? Our AI assistant can help! Ask about schedules, performers, or anything else.',
    icon: <Zap className="w-8 h-8 text-primary" />,
    position: 'bottom',
  },
  {
    title: 'Community Board',
    description:
      'Share your thoughts, photos, and videos! Students, parents, and teachers can all participate.',
    icon: <Users className="w-8 h-8 text-primary" />,
    position: 'center',
  },
];

export const OnboardingWizard = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const hasSeen = localStorage.getItem('mes_onboarding_complete');
    if (!hasSeen) {
      const timer = setTimeout(() => setIsOpen(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleComplete = () => {
    localStorage.setItem('mes_onboarding_complete', 'true');
    setIsOpen(false);
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      const next = currentStep + 1;
      setCurrentStep(next);

      const target = steps[next].targetId;
      if (target) {
        document.getElementById(target)?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) setCurrentStep((s) => s - 1);
  };

  const step = steps[currentStep];

  // 📱 Mobile-safe positioning
  const getPositionClasses = () => {
    if (window.innerWidth < 640) {
      return 'bottom-4 left-1/2 -translate-x-1/2';
    }

    switch (step.position) {
      case 'top':
        return 'top-24 left-1/2 -translate-x-1/2';
      case 'bottom':
        return 'bottom-24 left-1/2 -translate-x-1/2';
      default:
        return 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[100]"
          />

          {/* Tooltip Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`fixed z-[101] w-[92vw] max-w-md ${getPositionClasses()}`}
          >
            <div
              className="
                glass-card rounded-2xl border border-primary/30 shadow-2xl
                max-h-[85dvh] flex flex-col
                p-5 sm:p-6
              "
            >
              {/* Close */}
              <button
                onClick={handleComplete}
                className="absolute top-3 right-3 p-1 rounded-full hover:bg-muted"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>

              {/* Progress */}
              <div className="flex justify-center gap-2 mb-3">
                {steps.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 rounded-full transition-all ${
                      i === currentStep
                        ? 'w-6 bg-primary'
                        : i < currentStep
                        ? 'w-1.5 bg-primary/50'
                        : 'w-1.5 bg-muted'
                    }`}
                  />
                ))}
              </div>

              {/* Scrollable content */}
              <div className="flex-1 overflow-y-auto px-1">
                <div className="flex justify-center mb-4">
                  <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center">
                    {step.icon}
                  </div>
                </div>

                <h3 className="text-lg sm:text-xl font-bold text-center mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground text-center mb-4">
                  {step.description}
                </p>
              </div>

              {/* Navigation */}
              <div className="pt-3 border-t flex items-center justify-between gap-2">
                <Button
                  variant="ghost"
                  onClick={handlePrev}
                  disabled={currentStep === 0}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Back
                </Button>

                <Button variant="ghost" onClick={handleComplete}>
                  Skip
                </Button>

                <Button onClick={handleNext}>
                  {currentStep === steps.length - 1
                    ? 'Get Started'
                    : 'Next'}
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
