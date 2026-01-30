-- Create community_posts table for users to share content
CREATE TABLE public.community_posts (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_name TEXT NOT NULL,
    user_role TEXT NOT NULL DEFAULT 'student', -- student, parent, teacher
    content TEXT,
    media_urls TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;

-- Anyone can view posts
CREATE POLICY "Anyone can view community posts"
ON public.community_posts
FOR SELECT
USING (true);

-- Anyone can create posts (public community)
CREATE POLICY "Anyone can create community posts"
ON public.community_posts
FOR INSERT
WITH CHECK (true);

-- Admins can update posts
CREATE POLICY "Admins can update community posts"
ON public.community_posts
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can delete posts
CREATE POLICY "Admins can delete community posts"
ON public.community_posts
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_community_posts_updated_at
BEFORE UPDATE ON public.community_posts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for community media
INSERT INTO storage.buckets (id, name, public) VALUES ('community', 'community', true);

-- Storage policies for community bucket
CREATE POLICY "Anyone can view community media"
ON storage.objects
FOR SELECT
USING (bucket_id = 'community');

CREATE POLICY "Anyone can upload community media"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'community');

CREATE POLICY "Admins can delete community media"
ON storage.objects
FOR DELETE
USING (bucket_id = 'community' AND has_role(auth.uid(), 'admin'::app_role));