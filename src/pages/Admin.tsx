import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { LogOut, Calendar, Image, Link, Clock, Bot } from 'lucide-react';
import { ScheduleManager } from '@/components/admin/ScheduleManager';
import { MediaManager } from '@/components/admin/MediaManager';
import { LinksManager } from '@/components/admin/LinksManager';
import { CountdownManager } from '@/components/admin/CountdownManager';
import { AIModelManager } from '@/components/admin/AIModelManager';
import { setAdminPassword, clearAdminPassword } from '@/lib/adminApi';

const ADMIN_PASSWORD = 'Vasudev@2012';

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);

    // Simple password check
    setTimeout(() => {
      if (password === ADMIN_PASSWORD) {
        setAdminPassword(password);
        setIsAuthenticated(true);
        toast.success('Logged in successfully');
      } else {
        toast.error('Incorrect password');
      }
      setAuthLoading(false);
    }, 500);
  };

  const handleLogout = () => {
    clearAdminPassword();
    setIsAuthenticated(false);
    setPassword('');
    toast.success('Logged out successfully');
  };

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md border-border bg-card">
          <CardHeader className="text-center">
            <CardTitle className="font-display text-3xl">
              <span className="text-gradient-gold">Admin</span> Panel
            </CardTitle>
            <CardDescription>
              Enter password to manage the Annual Day website
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoFocus
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-gradient-gold text-primary-foreground"
                disabled={authLoading}
              >
                {authLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
            <div className="mt-6 text-center">
              <a
                href="/"
                className="text-sm text-muted-foreground hover:text-primary"
              >
                ← Back to website
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              <span className="text-gradient-gold">Admin</span> Panel
            </h1>
            <p className="text-sm text-muted-foreground">
              MES Campus School Annual Day
            </p>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="/"
              target="_blank"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              View Site →
            </a>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="gap-2"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="countdown" className="space-y-8">
          <TabsList className="glass-card grid w-full max-w-2xl grid-cols-5 p-1">
            <TabsTrigger value="countdown" className="gap-2">
              <Clock className="h-4 w-4" />
              <span className="hidden sm:inline">Countdown</span>
            </TabsTrigger>
            <TabsTrigger value="schedule" className="gap-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Schedule</span>
            </TabsTrigger>
            <TabsTrigger value="media" className="gap-2">
              <Image className="h-4 w-4" />
              <span className="hidden sm:inline">Media</span>
            </TabsTrigger>
            <TabsTrigger value="links" className="gap-2">
              <Link className="h-4 w-4" />
              <span className="hidden sm:inline">Links</span>
            </TabsTrigger>
            <TabsTrigger value="ai" className="gap-2">
              <Bot className="h-4 w-4" />
              <span className="hidden sm:inline">AI</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="countdown">
            <CountdownManager />
          </TabsContent>

          <TabsContent value="schedule">
            <ScheduleManager />
          </TabsContent>

          <TabsContent value="media">
            <MediaManager />
          </TabsContent>

          <TabsContent value="links">
            <LinksManager />
          </TabsContent>

          <TabsContent value="ai">
            <AIModelManager />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
