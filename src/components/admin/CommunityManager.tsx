import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Trash2, Edit2, X, Check } from 'lucide-react';
import { communityApi } from '@/lib/adminApi';

type Post = {
  id: string;
  user_name: string;
  user_role: string;
  content: string | null;
  media_urls: string[];
  created_at: string;
};

export const CommunityManager = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPost, setEditingPost] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const data = await communityApi.list();
      // Sort by created_at descending
      setPosts(data.sort((a: Post, b: Post) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ));
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast({ title: 'Failed to load posts', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      await communityApi.delete(postId);
      toast({ title: 'Post deleted' });
      fetchPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
      toast({ title: 'Failed to delete post', variant: 'destructive' });
    }
  };

  const handleEdit = async (postId: string) => {
    try {
      await communityApi.update(postId, { content: editContent });
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

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Community Posts</h2>
        <Badge variant="outline">{posts.length} posts</Badge>
      </div>

      {posts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No community posts yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <Card key={post.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="font-bold text-primary">
                        {post.user_name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <CardTitle className="text-base">{post.user_name}</CardTitle>
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
                </div>
              </CardHeader>
              <CardContent>
                {editingPost === post.id ? (
                  <div className="space-y-2">
                    <Textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleEdit(post.id)}>
                        <Check className="w-4 h-4 mr-1" /> Save
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingPost(null)}>
                        <X className="w-4 h-4 mr-1" /> Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  post.content && <p className="text-foreground">{post.content}</p>
                )}

                {post.media_urls && post.media_urls.length > 0 && (
                  <div className={`grid gap-2 mt-4 ${post.media_urls.length > 1 ? 'grid-cols-2' : ''}`}>
                    {post.media_urls.map((url, index) => (
                      <div key={index} className="rounded-lg overflow-hidden">
                        {url.match(/\.(mp4|webm|mov)/) ? (
                          <video
                            src={url}
                            controls
                            className="w-full max-h-[200px] object-cover"
                          />
                        ) : (
                          <img
                            src={url}
                            alt=""
                            className="w-full max-h-[200px] object-cover"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
