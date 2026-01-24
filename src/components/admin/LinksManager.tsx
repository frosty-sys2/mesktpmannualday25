import { useState, useEffect } from 'react';
import { linksApi } from '@/lib/adminApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Plus, Trash2, Save, GripVertical, ExternalLink } from 'lucide-react';

interface QuickLink {
  id: string;
  title: string;
  url: string;
  icon: string | null;
  display_order: number;
}

export const LinksManager = () => {
  const [links, setLinks] = useState<QuickLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    try {
      const data = await linksApi.list();
      setLinks(data || []);
    } catch (error: any) {
      toast.error('Failed to load links: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const addNewLink = () => {
    const newLink: QuickLink = {
      id: `temp-${Date.now()}`,
      title: '',
      url: '',
      icon: '🔗',
      display_order: links.length,
    };
    setLinks([...links, newLink]);
  };

  const updateLink = (index: number, updates: Partial<QuickLink>) => {
    const updated = [...links];
    updated[index] = { ...updated[index], ...updates };
    setLinks(updated);
  };

  const deleteLink = async (index: number) => {
    const link = links[index];

    if (!link.id.startsWith('temp-')) {
      try {
        await linksApi.delete(link.id);
        toast.success('Link deleted');
      } catch (error: any) {
        toast.error('Failed to delete: ' + error.message);
        return;
      }
    }

    setLinks(links.filter((_, i) => i !== index));
  };

  const saveAll = async () => {
    // Validate
    for (const link of links) {
      if (!link.title.trim() || !link.url.trim()) {
        toast.error('Please fill in all required fields');
        return;
      }
    }

    setIsSaving(true);

    try {
      for (let i = 0; i < links.length; i++) {
        const link = links[i];
        const data = {
          title: link.title,
          url: link.url,
          icon: link.icon,
          display_order: i,
        };

        if (link.id.startsWith('temp-')) {
          await linksApi.insert(data);
        } else {
          await linksApi.update(link.id, data);
        }
      }

      toast.success('All links saved!');
      fetchLinks();
    } catch (error: any) {
      toast.error('Failed to save: ' + error.message);
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
          Quick Links
        </h2>
        <div className="flex gap-3">
          <Button onClick={addNewLink} variant="outline" className="gap-2">
            <Plus className="h-4 w-4" />
            Add Link
          </Button>
          <Button onClick={saveAll} disabled={isSaving} className="gap-2 bg-gradient-gold text-primary-foreground">
            <Save className="h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save All'}
          </Button>
        </div>
      </div>

      {links.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">No links yet</p>
            <Button onClick={addNewLink} variant="link" className="mt-2">
              Add your first link
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {links.map((link, index) => (
            <Card key={link.id} className="border-border">
              <CardContent className="flex items-center gap-4 p-4">
                <GripVertical className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
                
                <div className="space-y-1">
                  <Label className="text-xs">Icon</Label>
                  <Input
                    value={link.icon || ''}
                    onChange={(e) => updateLink(index, { icon: e.target.value })}
                    className="h-10 w-16 text-center text-xl"
                    maxLength={2}
                  />
                </div>

                <div className="flex-1 space-y-1">
                  <Label className="text-xs">Title *</Label>
                  <Input
                    value={link.title}
                    onChange={(e) => updateLink(index, { title: e.target.value })}
                    placeholder="Link title"
                  />
                </div>

                <div className="flex-1 space-y-1">
                  <Label className="text-xs">URL *</Label>
                  <Input
                    value={link.url}
                    onChange={(e) => updateLink(index, { url: e.target.value })}
                    placeholder="https://..."
                    type="url"
                  />
                </div>

                <div className="flex gap-2">
                  {link.url && (
                    <Button
                      variant="ghost"
                      size="icon"
                      asChild
                    >
                      <a href={link.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteLink(index)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card className="border-border bg-muted/30">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Emoji Icons</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-2">
            Click to copy popular icons:
          </p>
          <div className="flex flex-wrap gap-2">
            {['🏠', '📚', '📧', '📞', '🎓', '📅', '🎭', '🏆', '🎵', '📸', '🎬', '💻', '📱', '🌐'].map(
              (emoji) => (
                <button
                  key={emoji}
                  onClick={() => {
                    navigator.clipboard.writeText(emoji);
                    toast.success('Copied!');
                  }}
                  className="rounded-lg border border-border bg-background px-3 py-2 text-xl transition-colors hover:bg-muted"
                >
                  {emoji}
                </button>
              )
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
