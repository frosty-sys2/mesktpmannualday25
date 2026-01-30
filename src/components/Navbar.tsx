import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Menu, X, Info, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import mesLogo from '@/assets/mes-logo.jpg';

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { href: '#schedule', label: 'Schedule' },
    { href: '#gallery', label: 'Gallery' },
    { href: '#links', label: 'Links' },
  ];

  const pageLinks = [
    { to: '/community', label: 'Community', icon: Users },
    { to: '/more', label: 'More', icon: Info },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
      className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${
        isScrolled ? 'glass-card py-3' : 'py-6'
      }`}
    >
      <div className="container mx-auto flex items-center justify-between px-4">
        <Link
          to="/"
          className="flex items-center gap-3 font-display text-xl font-bold text-foreground transition-colors hover:text-primary"
        >
          <img src={mesLogo} alt="MES Campus School" className="w-10 h-10 rounded-full object-cover" />
          <span><span className="text-gradient-gold">MES Campus School,</span> Kuttippuram</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </a>
          ))}
          {pageLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.to}
                to={link.to}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground flex items-center gap-1"
              >
                <Icon className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}
          <a
            href="https://mescampusschool.gt.tc"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
          >
            <Home className="h-4 w-4" />
            <span>School Home</span>
          </a>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="rounded-lg p-2 text-foreground md:hidden"
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="glass-card border-t border-border md:hidden"
          >
            <div className="container mx-auto flex flex-col gap-4 px-4 py-6">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-lg font-medium text-foreground transition-colors hover:text-primary"
                >
                  {item.label}
                </a>
              ))}
              {pageLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-lg font-medium text-foreground transition-colors hover:text-primary flex items-center gap-2"
                  >
                    <Icon className="h-5 w-5" />
                    {link.label}
                  </Link>
                );
              })}
              <a
                href="https://mescampusschool.gt.tc"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-gold px-6 py-3 font-semibold text-primary-foreground"
              >
                <Home className="h-5 w-5" />
                <span>Go to School Home</span>
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};
