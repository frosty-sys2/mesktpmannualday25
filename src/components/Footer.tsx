import { motion } from 'framer-motion';
import { Home, Heart } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="border-t border-border bg-card/50 py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center gap-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h3 className="font-display text-2xl font-bold text-foreground">
              MES Campus School
            </h3>
            <p className="mt-2 text-muted-foreground">Kuttippuram</p>
          </motion.div>

          <motion.a
            href="https://mescampusschool.gt.tc"
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-3 rounded-full bg-gradient-gold px-8 py-4 font-semibold text-primary-foreground shadow-lg transition-transform hover:scale-105"
          >
            <Home className="h-5 w-5" />
            <span>Go to School Website</span>
          </motion.a>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex items-center gap-2 text-sm text-muted-foreground"
          >
            Made with <Heart className="h-4 w-4 text-red-500" /> for Annual Day Celebration
          </motion.p>
        </div>
      </div>
    </footer>
  );
};
