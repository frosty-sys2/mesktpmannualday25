import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Calendar, Users, Zap, Info } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { AIChatBot } from './AIChatBot';

export const MobileNav = () => {
  const location = useLocation();
  const [showAI, setShowAI] = useState(false);

  const navItems = [
    { href: '/', icon: Home, label: 'Home' },
    { href: '/#schedule', icon: Calendar, label: 'Schedule' },
    { href: '/community', icon: Users, label: 'Community' },
    { href: '/more', icon: Info, label: 'More' },
  ];

  const isActive = (href: string) => {
    if (href === '/') return location.pathname === '/';
    if (href.startsWith('/#')) return location.pathname === '/' && location.hash === href.slice(1);
    return location.pathname === href;
  };

  const handleNavClick = (href: string) => {
    if (href.startsWith('/#')) {
      const sectionId = href.slice(2);
      if (location.pathname === '/') {
        const element = document.getElementById(sectionId);
        element?.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <motion.nav
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
      >
        <div className="mx-4 mb-4">
          <div className="glass-card rounded-full px-2 py-2 flex items-center justify-around shadow-lg border border-border/50">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              
              return item.href.startsWith('/#') ? (
                <button
                  key={item.href}
                  onClick={() => handleNavClick(item.href)}
                  className={`flex flex-col items-center gap-1 px-4 py-2 rounded-full transition-all ${
                    active 
                      ? 'bg-primary text-primary-foreground' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-[10px] font-medium">{item.label}</span>
                </button>
              ) : (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`flex flex-col items-center gap-1 px-4 py-2 rounded-full transition-all ${
                    active 
                      ? 'bg-primary text-primary-foreground' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-[10px] font-medium">{item.label}</span>
                </Link>
              );
            })}

            {/* AI Button */}
            <button
              onClick={() => setShowAI(true)}
              className="flex flex-col items-center gap-1 px-4 py-2 rounded-full bg-gradient-gold text-primary-foreground transition-all"
            >
              <Zap className="w-5 h-5" />
              <span className="text-[10px] font-medium">AI</span>
            </button>
          </div>
        </div>
      </motion.nav>

      {/* AI Chat Sidebar - controlled by mobile nav */}
      <AnimatePresence>
        {showAI && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAI(false)}
              className="fixed inset-0 bg-background/60 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full sm:w-96 bg-card border-l border-border z-50"
            >
              <AIChatBot embedded onClose={() => setShowAI(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
