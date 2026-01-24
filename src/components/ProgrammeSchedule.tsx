import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { Calendar } from 'lucide-react';

interface Schedule {
  id: string;
  title: string;
  table_data: string[][];
  column_headers: string[];
  display_order: number;
}

export const ProgrammeSchedule = () => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      const { data, error } = await supabase
        .from('programme_schedule')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      
      const formattedSchedules = (data || []).map(item => ({
        ...item,
        table_data: Array.isArray(item.table_data) ? item.table_data as string[][] : [],
        column_headers: Array.isArray(item.column_headers) ? item.column_headers as string[] : []
      }));
      
      setSchedules(formattedSchedules);
    } catch (error) {
      console.error('Error fetching schedules:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <section className="py-24 px-4">
        <div className="container mx-auto">
          <div className="flex items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        </div>
      </section>
    );
  }

  if (schedules.length === 0) {
    return null;
  }

  return (
    <section className="py-24 px-4" id="schedule">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-16 text-center"
        >
          <div className="mb-4 flex items-center justify-center gap-3">
            <Calendar className="h-6 w-6 text-primary" />
            <span className="text-sm font-medium uppercase tracking-widest text-primary">
              Event Schedule
            </span>
          </div>
          <h2 className="font-display text-4xl font-bold text-foreground sm:text-5xl">
            Programme <span className="text-gradient-gold italic">Schedule</span>
          </h2>
        </motion.div>

        <div className="space-y-12">
          {schedules.map((schedule, index) => (
            <motion.div
              key={schedule.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="glass-card overflow-hidden rounded-2xl"
            >
              <div className="border-b border-border/50 bg-muted/30 px-6 py-4">
                <h3 className="font-display text-xl font-semibold text-foreground">
                  {schedule.title}
                </h3>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border/30">
                      {schedule.column_headers.map((header, i) => (
                        <th
                          key={i}
                          className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider text-primary"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {schedule.table_data.map((row, rowIndex) => (
                      <tr
                        key={rowIndex}
                        className="border-b border-border/20 transition-colors hover:bg-muted/20"
                      >
                        {row.map((cell, cellIndex) => (
                          <td
                            key={cellIndex}
                            className="px-6 py-4 text-foreground/90"
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
