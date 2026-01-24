import { useState, useEffect } from 'react';
import { settingsApi } from '@/lib/adminApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { Save, Calendar, Clock } from 'lucide-react';

export const CountdownManager = () => {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchCountdownDate();
  }, []);

  const fetchCountdownDate = async () => {
    try {
      const data = await settingsApi.get('countdown_date');
      if (data?.value?.date) {
        const dateObj = new Date(data.value.date);
        setDate(dateObj.toISOString().split('T')[0]);
        setTime(dateObj.toTimeString().slice(0, 5));
      }
    } catch (error: any) {
      console.error('Failed to load countdown:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveCountdown = async () => {
    if (!date) {
      toast.error('Please select a date');
      return;
    }

    setIsSaving(true);
    try {
      const dateTimeString = `${date}T${time || '00:00'}:00`;
      await settingsApi.set('countdown_date', { date: dateTimeString });
      toast.success('Countdown date saved!');
    } catch (error: any) {
      toast.error('Failed to save: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const clearCountdown = async () => {
    setIsSaving(true);
    try {
      await settingsApi.delete('countdown_date');
      setDate('');
      setTime('');
      toast.success('Countdown cleared!');
    } catch (error: any) {
      toast.error('Failed to clear: ' + error.message);
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
          Countdown Timer
        </h2>
      </div>

      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Annual Day Date & Time
          </CardTitle>
          <CardDescription>
            Set the date and time for the Annual Day event. The countdown will be displayed on the homepage.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Event Date
              </label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="bg-muted border-border"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Event Time
              </label>
              <Input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="bg-muted border-border"
              />
            </div>
          </div>

          {date && (
            <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
              <p className="text-sm text-foreground">
                <span className="font-semibold">Event scheduled for:</span>{' '}
                {new Date(`${date}T${time || '00:00'}`).toLocaleString('en-IN', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              onClick={saveCountdown}
              disabled={isSaving || !date}
              className="gap-2 bg-gradient-gold text-primary-foreground"
            >
              <Save className="h-4 w-4" />
              {isSaving ? 'Saving...' : 'Save Countdown'}
            </Button>
            {date && (
              <Button
                onClick={clearCountdown}
                disabled={isSaving}
                variant="outline"
                className="text-destructive hover:text-destructive"
              >
                Clear Countdown
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
