import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Plus, Trash2, Save, GripVertical, X } from 'lucide-react';

interface Schedule {
  id: string;
  title: string;
  table_data: string[][];
  column_headers: string[];
  display_order: number;
}

export const ScheduleManager = () => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

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
    } catch (error: any) {
      toast.error('Failed to load schedules');
    } finally {
      setIsLoading(false);
    }
  };

  const addNewSchedule = () => {
    const newSchedule: Schedule = {
      id: `temp-${Date.now()}`,
      title: 'New Schedule',
      column_headers: ['Time', 'Programme', 'Participants'],
      table_data: [['10:00 AM', 'Event Name', 'Class']],
      display_order: schedules.length,
    };
    setSchedules([...schedules, newSchedule]);
  };

  const updateSchedule = (index: number, updates: Partial<Schedule>) => {
    const updated = [...schedules];
    updated[index] = { ...updated[index], ...updates };
    setSchedules(updated);
  };

  const deleteSchedule = async (index: number) => {
    const schedule = schedules[index];
    
    if (!schedule.id.startsWith('temp-')) {
      try {
        const { error } = await supabase
          .from('programme_schedule')
          .delete()
          .eq('id', schedule.id);
        if (error) throw error;
        toast.success('Schedule deleted');
      } catch (error: any) {
        toast.error('Failed to delete schedule');
        return;
      }
    }

    setSchedules(schedules.filter((_, i) => i !== index));
  };

  const addColumn = (scheduleIndex: number) => {
    const schedule = schedules[scheduleIndex];
    const newHeaders = [...schedule.column_headers, 'New Column'];
    const newData = schedule.table_data.map(row => [...row, '']);
    updateSchedule(scheduleIndex, { column_headers: newHeaders, table_data: newData });
  };

  const removeColumn = (scheduleIndex: number, colIndex: number) => {
    const schedule = schedules[scheduleIndex];
    const newHeaders = schedule.column_headers.filter((_, i) => i !== colIndex);
    const newData = schedule.table_data.map(row => row.filter((_, i) => i !== colIndex));
    updateSchedule(scheduleIndex, { column_headers: newHeaders, table_data: newData });
  };

  const addRow = (scheduleIndex: number) => {
    const schedule = schedules[scheduleIndex];
    const newRow = new Array(schedule.column_headers.length).fill('');
    updateSchedule(scheduleIndex, { table_data: [...schedule.table_data, newRow] });
  };

  const removeRow = (scheduleIndex: number, rowIndex: number) => {
    const schedule = schedules[scheduleIndex];
    const newData = schedule.table_data.filter((_, i) => i !== rowIndex);
    updateSchedule(scheduleIndex, { table_data: newData });
  };

  const updateCell = (scheduleIndex: number, rowIndex: number, colIndex: number, value: string) => {
    const schedule = schedules[scheduleIndex];
    const newData = [...schedule.table_data];
    newData[rowIndex] = [...newData[rowIndex]];
    newData[rowIndex][colIndex] = value;
    updateSchedule(scheduleIndex, { table_data: newData });
  };

  const updateHeader = (scheduleIndex: number, colIndex: number, value: string) => {
    const schedule = schedules[scheduleIndex];
    const newHeaders = [...schedule.column_headers];
    newHeaders[colIndex] = value;
    updateSchedule(scheduleIndex, { column_headers: newHeaders });
  };

  const saveAll = async () => {
    setIsSaving(true);

    try {
      for (let i = 0; i < schedules.length; i++) {
        const schedule = schedules[i];
        const data = {
          title: schedule.title,
          column_headers: schedule.column_headers,
          table_data: schedule.table_data,
          display_order: i,
        };

        if (schedule.id.startsWith('temp-')) {
          const { error } = await supabase
            .from('programme_schedule')
            .insert(data);
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from('programme_schedule')
            .update(data)
            .eq('id', schedule.id);
          if (error) throw error;
        }
      }

      toast.success('All schedules saved!');
      fetchSchedules();
    } catch (error: any) {
      toast.error('Failed to save schedules');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold text-foreground">
          Programme Schedules
        </h2>
        <div className="flex gap-3">
          <Button onClick={addNewSchedule} variant="outline" className="gap-2">
            <Plus className="h-4 w-4" />
            Add Schedule
          </Button>
          <Button onClick={saveAll} disabled={isSaving} className="gap-2 bg-gradient-gold text-primary-foreground">
            <Save className="h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save All'}
          </Button>
        </div>
      </div>

      {schedules.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">No schedules yet</p>
            <Button onClick={addNewSchedule} variant="link" className="mt-2">
              Create your first schedule
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {schedules.map((schedule, scheduleIndex) => (
            <Card key={schedule.id} className="border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div className="flex items-center gap-3">
                  <GripVertical className="h-5 w-5 text-muted-foreground" />
                  <Input
                    value={schedule.title}
                    onChange={(e) => updateSchedule(scheduleIndex, { title: e.target.value })}
                    className="max-w-xs font-display text-lg font-semibold"
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteSchedule(scheduleIndex)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr>
                        {schedule.column_headers.map((header, colIndex) => (
                          <th key={colIndex} className="border border-border p-2">
                            <div className="flex items-center gap-2">
                              <Input
                                value={header}
                                onChange={(e) => updateHeader(scheduleIndex, colIndex, e.target.value)}
                                className="h-8 min-w-24 text-center text-sm font-semibold"
                              />
                              {schedule.column_headers.length > 1 && (
                                <button
                                  onClick={() => removeColumn(scheduleIndex, colIndex)}
                                  className="text-muted-foreground hover:text-destructive"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          </th>
                        ))}
                        <th className="border border-border p-2 w-20">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => addColumn(scheduleIndex)}
                            className="h-8 w-full"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {schedule.table_data.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                          {row.map((cell, colIndex) => (
                            <td key={colIndex} className="border border-border p-2">
                              <Input
                                value={cell}
                                onChange={(e) => updateCell(scheduleIndex, rowIndex, colIndex, e.target.value)}
                                className="h-8 min-w-24 text-sm"
                              />
                            </td>
                          ))}
                          <td className="border border-border p-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeRow(scheduleIndex, rowIndex)}
                              className="h-8 w-full text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addRow(scheduleIndex)}
                  className="mt-4 gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Row
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
