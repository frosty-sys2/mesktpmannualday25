import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
    description: 'Let us show you around our Annual Day website. Click Next to begin the tour.',
    icon: <span className="text-4xl">🎉</span>,
    position: 'center',
  },
  {
    title: 'Programme Schedule',
    description: 'Find the complete Annual Day programme schedule here. See all performances, timings, and events.',
    icon: <Calendar className="w-8 h-8 text-primary" />,
    targetId: 'schedule',
    position: 'top',
  },
  {
    title: 'AI Assistant',
    description: 'Have questions about Annual Day? Our AI assistant can help! Ask about schedules, performers, or anything else.',
    icon: <Zap className="w-8 h-8 text-primary" />,
    position: 'bottom',
  },
  {
    title: 'Community Board',
    description: 'Share your thoughts, photos, and videos! Students, parents, and teachers can all participate.',
    icon: <Users className="w-8 h-8 text-primary" />,
    position: 'center',
  },
];

export const OnboardingWizard = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [mounted, setMounted] = useState(false); // SSR-safe portal mount

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('mes_onboarding_complete');
    if (!hasSeenOnboarding) {
      const timer = setTimeout(() => setIsOpen(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleComplete = () => {
    localStorage.setItem('mes_onboarding_complete', 'true');
    setIsOpen(false);
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      // Scroll to target if exists
      const nextStep = steps[currentStep + 1];
      if (nextStep.targetId) {
        const element = document.getElementById(nextStep.targetId);
        element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const step = steps[currentStep];

  // Responsive: adjust position and width for mobile
  const getPositionClasses = () => {
    // mobile
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      switch (step.position) {
        case 'top':
          return 'top-4 left-1/2 -translate-x-1/2 px-2 w-[98vw] max-w-full';
        case 'bottom':
          return 'bottom-28 left-1/2 -translate-x-1/2 px-2 w-[98vw] max-w-full'; // Avoid mobile nav bar
        default:
          return 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-2 w-[98vw] max-w-full';
      }
    }
    // Desktop logic
    switch (step.position) {
      case 'top':
        return 'top-24 left-1/2 -translate-x-1/2';
      case 'bottom':
        return 'bottom-24 left-1/2 -translate-x-1/2';
      default:
        return 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2';
    }
  };

  const content = (
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

          {/* Spotlight effect for targeted elements */}
          {step.targetId && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed inset-0 z-[99] pointer-events-none"
            >
              <div
                className="absolute bg-primary/20 rounded-2xl ring-4 ring-primary animate-pulse"
                style={{
                  top: document.getElementById(step.targetId)?.getBoundingClientRect().top ?? 0,
                  left: document.getElementById(step.targetId)?.getBoundingClientRect().left ?? 0,
                  width: document.getElementById(step.targetId)?.offsetWidth ?? 0,
                  height: Math.min(document.getElementById(step.targetId)?.offsetHeight ?? 0, 400),
                }}
              />
            </motion.div>
          )}

          {/* Tooltip Card - mobile responsive */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`fixed z-[101] ${getPositionClasses()}`}
          >
            <div className="glass-card rounded-2xl p-4 sm:p-6 border border-primary/30 shadow-2xl">
              {/* Close button */}
              <button
                onClick={handleSkip}
                className="absolute top-3 right-3 p-2 rounded-full hover:bg-muted transition-colors"
                tabIndex={0}
                aria-label="Close"
                style={{ minWidth: 44, minHeight: 44 }} // mobile touch target
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>

              {/* Step indicator */}
              <div className="flex justify-center gap-2 mb-4">
                {steps.map((_, index) => (
                  <div
                    key={index}
                    className={`h-1.5 rounded-full transition-all ${
                      index === currentStep
                        ? 'w-6 bg-primary'
                        : index < currentStep
                        ? 'w-1.5 bg-primary/50'
                        : 'w-1.5 bg-muted'
                    }`}
                  />
                ))}
              </div>

              {/* Icon */}
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                  {step.icon}
                </div>
              </div>

              {/* Content */}
              <h3 className="text-xl font-display font-bold text-center text-foreground mb-2">
                {step.title}
              </h3>
              <p className="text-muted-foreground text-center text-sm mb-6">
                {step.description}
              </p>

              {/* Navigation */}
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  onClick={handlePrev}
                  disabled={currentStep === 0}
                  className="opacity-70"
                  style={{ minWidth: 44, minHeight: 44 }} // touch friendly
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Back
                </Button>
                <Button
                  variant="ghost"
                  onClick={handleSkip}
                  className="text-muted-foreground"
                  style={{ minWidth: 44, minHeight: 44 }}
                >
                  Skip
                </Button>
                <Button
                  onClick={handleNext}
                  className="bg-primary hover:bg-primary/90"
                  style={{ minWidth: 44, minHeight: 44 }}
                >
                  {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  // Render via portal so fixed positioning is always relative to the viewport
  if (!mounted) return null;
  return createPortal(content, document.body);
};
