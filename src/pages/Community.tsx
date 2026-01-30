import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Image, Video, Loader2, Trash2, Edit2, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Navbar } from '@/components/Navbar';
import { MobileNav } from '@/components/MobileNav';
import { Footer } from '@/components/Footer';

type Post = {
  id: string;
  user_name: string;
  user_role: string;
  content: string | null;
  media_urls: string[];
  created_at: string;
};

const Community = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState('student');
  const [content, setContent] = useState('');
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaPreviews, setMediaPreviews] = useState<string[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [editingPost, setEditingPost] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchPosts();
    checkAdminStatus();
  }, []);

  const checkAdminStatus = () => {
    const adminPassword = sessionStorage.getItem('admin_password');
    setIsAdmin(adminPassword === 'Vasudev@2012');
  };

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('community_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + mediaFiles.length > 5) {
      toast({ title: 'Maximum 5 files allowed', variant: 'destructive' });
      return;
    }

    const validFiles = files.filter(file => {
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      const maxSize = isVideo ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
      
      if (!isImage && !isVideo) {
        toast({ title: 'Only images and videos allowed', variant: 'destructive' });
        return false;
      }
      if (file.size > maxSize) {
        toast({ title: `File too large: ${file.name}`, variant: 'destructive' });
        return false;
      }
      return true;
    });

    setMediaFiles(prev => [...prev, ...validFiles]);
    
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setMediaPreviews(prev => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeMedia = (index: number) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
    setMediaPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim()) {
      toast({ title: 'Please enter your name', variant: 'destructive' });
      return;
    }
    if (!content.trim() && mediaFiles.length === 0) {
      toast({ title: 'Please add content or media', variant: 'destructive' });
      return;
    }

    setSubmitting(true);
    try {
      const mediaUrls: string[] = [];

      for (const file of mediaFiles) {
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}-${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from('community')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('community')
          .getPublicUrl(fileName);

        mediaUrls.push(urlData.publicUrl);
      }

      const { error } = await supabase.from('community_posts').insert({
        user_name: userName.trim(),
        user_role: userRole,
        content: content.trim() || null,
        media_urls: mediaUrls,
      });

      if (error) throw error;

      toast({ title: 'Post shared successfully!' });
      setContent('');
      setMediaFiles([]);
      setMediaPreviews([]);
      fetchPosts();
    } catch (error) {
      console.error('Error creating post:', error);
      toast({ title: 'Failed to create post', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      const { error } = await supabase
        .from('community_posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;
      toast({ title: 'Post deleted' });
      fetchPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
      toast({ title: 'Failed to delete post', variant: 'destructive' });
    }
  };

  const handleEdit = async (postId: string) => {
    try {
      const { error } = await supabase
        .from('community_posts')
        .update({ content: editContent })
        .eq('id', postId);

      if (error) throw error;
      toast({ title: 'Post updated' });
      setEditingPost(null);
      fetchPosts();
    } catch (error) {
      console.error('Error updating post:', error);
      toast({ title: 'Failed to update post', variant: 'destructive' });
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'teacher': return 'bg-blue-500/20 text-blue-400';
      case 'parent': return 'bg-green-500/20 text-green-400';
      default: return 'bg-primary/20 text-primary';
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          <h1 className="text-3xl md:text-4xl font-display font-bold text-center mb-2">
            <span className="text-gradient-gold">Community</span> Board
          </h1>
          <p className="text-muted-foreground text-center mb-8">
            Share your thoughts, photos, and videos with the MES Campus School community
          </p>

          {/* Create Post Form */}
          <Card className="glass-card border-border/50 mb-8" id="community-post-form">
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex gap-4">
                  <Input
                    placeholder="Your name"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="flex-1 bg-muted border-border"
                  />
                  <Select value={userRole} onValueChange={setUserRole}>
                    <SelectTrigger className="w-32 bg-muted border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="parent">Parent</SelectItem>
                      <SelectItem value="teacher">Teacher</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Textarea
                  placeholder="What's on your mind?"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="bg-muted border-border min-h-[100px]"
                />

                {mediaPreviews.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {mediaPreviews.map((preview, index) => (
                      <div key={index} className="relative">
                        {mediaFiles[index]?.type.startsWith('video/') ? (
                          <video src={preview} className="w-20 h-20 object-cover rounded-lg" />
                        ) : (
                          <img src={preview} alt="" className="w-20 h-20 object-cover rounded-lg" />
                        )}
                        <button
                          type="button"
                          onClick={() => removeMedia(index)}
                          className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleFileSelect}
                      />
                      <div className="flex items-center gap-1 px-3 py-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors">
                        <Image className="w-4 h-4" />
                        <span className="text-sm">Photo</span>
                      </div>
                    </label>
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="video/*"
                        className="hidden"
                        onChange={handleFileSelect}
                      />
                      <div className="flex items-center gap-1 px-3 py-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors">
                        <Video className="w-4 h-4" />
                        <span className="text-sm">Video</span>
                      </div>
                    </label>
                  </div>

                  <Button type="submit" disabled={submitting} className="bg-primary hover:bg-primary/90">
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    <span className="ml-2">Post</span>
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Posts Feed */}
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : posts.length === 0 ? (
            <Card className="glass-card border-border/50">
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No posts yet. Be the first to share!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {posts.map((post) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <Card className="glass-card border-border/50 overflow-hidden">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                              <span className="font-bold text-primary">
                                {post.user_name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="font-semibold text-foreground">{post.user_name}</p>
                              <div className="flex items-center gap-2">
                                <Badge className={getRoleBadgeColor(post.user_role)}>
                                  {post.user_role}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(post.created_at).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>

                          {isAdmin && (
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setEditingPost(post.id);
                                  setEditContent(post.content || '');
                                }}
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(post.id)}
                              >
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        {editingPost === post.id ? (
                          <div className="space-y-2">
                            <Textarea
                              value={editContent}
                              onChange={(e) => setEditContent(e.target.value)}
                              className="bg-muted border-border"
                            />
                            <div className="flex gap-2">
                              <Button size="sm" onClick={() => handleEdit(post.id)}>
                                <Check className="w-4 h-4 mr-1" /> Save
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => setEditingPost(null)}>
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          post.content && <p className="text-foreground mb-4">{post.content}</p>
                        )}

                        {post.media_urls && post.media_urls.length > 0 && (
                          <div className={`grid gap-2 ${post.media_urls.length > 1 ? 'grid-cols-2' : ''}`}>
                            {post.media_urls.map((url, index) => (
                              <div key={index} className="rounded-lg overflow-hidden">
                                {url.match(/\.(mp4|webm|mov)/) ? (
                                  <video
                                    src={url}
                                    controls
                                    className="w-full max-h-[400px] object-cover"
                                  />
                                ) : (
                                  <img
                                    src={url}
                                    alt=""
                                    className="w-full max-h-[400px] object-cover"
                                  />
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </main>
      <Footer />
      <MobileNav />
    </div>
  );
};

export default Community;
