import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { ExternalLink, Link as LinkIcon } from 'lucide-react';

interface QuickLink {
  id: string;
  title: string;
  url: string;
  icon: string | null;
  display_order: number;
}

export const QuickLinks = () => {
  const [links, setLinks] = useState<QuickLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    try {
      const { data, error } = await supabase
        .from('quick_links')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setLinks(data || []);
    } catch (error) {
      console.error('Error fetching links:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return null;
  }

  if (links.length === 0) {
    return null;
  }

  return (
    <section className="py-24 px-4" id="links">
      <div className="container mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-16 text-center"
        >
          <div className="mb-4 flex items-center justify-center gap-3">
            <LinkIcon className="h-6 w-6 text-primary" />
            <span className="text-sm font-medium uppercase tracking-widest text-primary">
              Quick Access
            </span>
          </div>
          <h2 className="font-display text-4xl font-bold text-foreground sm:text-5xl">
            Useful <span className="text-gradient-gold italic">Links</span>
          </h2>
        </motion.div>

        <div className="grid gap-4 sm:grid-cols-2">
          {links.map((link, index) => (
            <motion.a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group flex items-center justify-between rounded-xl border border-border bg-card p-5 transition-all duration-300 hover:border-primary hover:bg-muted/30"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  {link.icon ? (
                    <span className="text-xl">{link.icon}</span>
                  ) : (
                    <LinkIcon className="h-5 w-5" />
                  )}
                </div>
                <span className="font-medium text-foreground">{link.title}</span>
              </div>
              <ExternalLink className="h-5 w-5 text-muted-foreground transition-colors group-hover:text-primary" />
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
};
