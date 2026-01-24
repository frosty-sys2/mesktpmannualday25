import { useState, useEffect, useRef } from 'react';
import { mediaApi } from '@/lib/adminApi';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Plus, Trash2, Upload, Video, Image as ImageIcon, Star } from 'lucide-react';

interface MediaItem {
  id: string;
  title: string | null;
  description: string | null;
  media_type: string;
  url: string;
  thumbnail_url: string | null;
  is_featured: boolean;
  display_order: number;
}

export const MediaManager = () => {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newMedia, setNewMedia] = useState({
    title: '',
    description: '',
    media_type: 'image' as 'image' | 'video',
    url: '',
  });

  useEffect(() => {
    fetchMedia();
  }, []);

  const fetchMedia = async () => {
    try {
      const data = await mediaApi.list();
      setMedia(data || []);
    } catch (error: any) {
      toast.error('Failed to load media: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `uploads/${fileName}`;

      const result = await mediaApi.upload(file, filePath);

      const mediaType = file.type.startsWith('video/') ? 'video' : 'image';

      setNewMedia({
        ...newMedia,
        url: result.publicUrl,
        media_type: mediaType,
      });

      toast.success('File uploaded successfully');
    } catch (error: any) {
      toast.error('Failed to upload: ' + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const addMedia = async () => {
    if (!newMedia.url) {
      toast.error('Please upload a file or provide a URL');
      return;
    }

    try {
      await mediaApi.insert({
        title: newMedia.title || null,
        description: newMedia.description || null,
        media_type: newMedia.media_type,
        url: newMedia.url,
        display_order: media.length,
      });

      toast.success('Media added successfully');
      setNewMedia({ title: '', description: '', media_type: 'image', url: '' });
      fetchMedia();
    } catch (error: any) {
      toast.error('Failed to add media: ' + error.message);
    }
  };

  const deleteMedia = async (id: string) => {
    try {
      await mediaApi.delete(id);
      toast.success('Media deleted');
      setMedia(media.filter((m) => m.id !== id));
    } catch (error: any) {
      toast.error('Failed to delete: ' + error.message);
    }
  };

  const toggleFeatured = async (id: string, currentState: boolean) => {
    try {
      await mediaApi.update(id, { is_featured: !currentState });
      setMedia(
        media.map((m) =>
          m.id === id ? { ...m, is_featured: !currentState } : m
        )
      );
    } catch (error: any) {
      toast.error('Failed to update: ' + error.message);
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
    <div className="space-y-8">
      {/* Add New Media */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="font-display text-xl">Add New Media</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Title (optional)</Label>
              <Input
                value={newMedia.title}
                onChange={(e) => setNewMedia({ ...newMedia, title: e.target.value })}
                placeholder="Enter title"
              />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={newMedia.media_type}
                onValueChange={(value: 'image' | 'video') =>
                  setNewMedia({ ...newMedia, media_type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="image">Image</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Description (optional)</Label>
            <Textarea
              value={newMedia.description}
              onChange={(e) => setNewMedia({ ...newMedia, description: e.target.value })}
              placeholder="Enter description"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label>Upload File or Enter URL</Label>
            <div className="flex gap-4">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*,video/*"
                className="hidden"
              />
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="gap-2"
              >
                <Upload className="h-4 w-4" />
                {isUploading ? 'Uploading...' : 'Upload File'}
              </Button>
              <span className="flex items-center text-muted-foreground">or</span>
              <Input
                value={newMedia.url}
                onChange={(e) => setNewMedia({ ...newMedia, url: e.target.value })}
                placeholder="https://..."
                className="flex-1"
              />
            </div>
          </div>

          {newMedia.url && (
            <div className="aspect-video max-w-xs overflow-hidden rounded-lg border border-border">
              {newMedia.media_type === 'video' ? (
                <video src={newMedia.url} className="h-full w-full object-cover" controls />
              ) : (
                <img src={newMedia.url} alt="Preview" className="h-full w-full object-cover" />
              )}
            </div>
          )}

          <Button onClick={addMedia} className="gap-2 bg-gradient-gold text-primary-foreground">
            <Plus className="h-4 w-4" />
            Add Media
          </Button>
        </CardContent>
      </Card>

      {/* Media Grid */}
      <div>
        <h2 className="mb-4 font-display text-2xl font-bold text-foreground">
          Gallery ({media.length})
        </h2>
        
        {media.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground">No media yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {media.map((item) => (
              <Card key={item.id} className="group overflow-hidden border-border">
                <div className="relative aspect-video">
                  {item.media_type === 'video' ? (
                    <video
                      src={item.url}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <img
                      src={item.url}
                      alt={item.title || 'Media'}
                      className="h-full w-full object-cover"
                    />
                  )}
                  <div className="absolute left-2 top-2">
                    {item.media_type === 'video' ? (
                      <Video className="h-5 w-5 text-white drop-shadow-md" />
                    ) : (
                      <ImageIcon className="h-5 w-5 text-white drop-shadow-md" />
                    )}
                  </div>
                  <div className="absolute right-2 top-2 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button
                      variant="secondary"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => toggleFeatured(item.id, item.is_featured)}
                    >
                      <Star
                        className={`h-4 w-4 ${
                          item.is_featured ? 'fill-primary text-primary' : ''
                        }`}
                      />
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => deleteMedia(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {item.title && (
                  <CardContent className="p-3">
                    <p className="font-medium text-foreground line-clamp-1">
                      {item.title}
                    </p>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
