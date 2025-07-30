-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create base schema
CREATE SCHEMA IF NOT EXISTS public;

-- Set default privileges
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres, authenticated;

-- Enable RLS
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';
ALTER DATABASE postgres SET "app.jwt_exp" TO '3600';

-- Set up storage for media files
INSERT INTO storage.buckets (id, name, public) VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Media files are publicly accessible" ON storage.objects;
CREATE POLICY "Media files are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'media');

DROP POLICY IF EXISTS "Authenticated users can upload media files" ON storage.objects;
CREATE POLICY "Authenticated users can upload media files" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'media');

DROP POLICY IF EXISTS "Users can update their own media files" ON storage.objects;
CREATE POLICY "Users can update their own media files" ON storage.objects FOR UPDATE TO authenticated USING (auth.uid() = owner) WITH CHECK (bucket_id = 'media');

DROP POLICY IF EXISTS "Users can delete their own media files" ON storage.objects;
CREATE POLICY "Users can delete their own media files" ON storage.objects FOR DELETE TO authenticated USING (auth.uid() = owner AND bucket_id = 'media');

-- Create activity logs table
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID NOT NULL,
  details JSONB DEFAULT '{}'::jsonb NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create RLS policies for activity logs
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Activity logs are viewable by everyone" ON activity_logs;
CREATE POLICY "Activity logs are viewable by everyone"
ON activity_logs FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Users can create activity logs" ON activity_logs;
CREATE POLICY "Users can create activity logs"
ON activity_logs FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create organizations table
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  contact_email TEXT,
  contact_phone TEXT,
  registration_number TEXT,
  registration_status TEXT DEFAULT 'pending',
  municipality_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT NOT NULL,
  contact_email TEXT,
  contact_phone TEXT,
  max_participants INTEGER,
  current_participants INTEGER DEFAULT 0 NOT NULL,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create event registrations table
CREATE TABLE IF NOT EXISTS event_registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id),
  user_id UUID REFERENCES profiles(id),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'confirmed',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(event_id, email)
);

-- Create function to handle event registration
CREATE OR REPLACE FUNCTION register_for_event(
  p_event_id UUID,
  p_name TEXT,
  p_email TEXT,
  p_phone TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_max_participants INTEGER;
  v_current_participants INTEGER;
BEGIN
  -- Get the current user ID if authenticated
  v_user_id := auth.uid();

  -- Check if the event exists and get participant limits
  SELECT max_participants, current_participants
  INTO v_max_participants, v_current_participants
  FROM events
  WHERE id = p_event_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Event not found';
  END IF;

  -- Check if the event is full
  IF v_max_participants IS NOT NULL AND v_current_participants >= v_max_participants THEN
    RAISE EXCEPTION 'Event is full';
  END IF;

  -- Begin transaction
  BEGIN
    -- Insert registration
    INSERT INTO event_registrations (
      event_id,
      user_id,
      name,
      email,
      phone
    )
    VALUES (
      p_event_id,
      v_user_id,
      p_name,
      p_email,
      p_phone
    );

    -- Update participant count
    UPDATE events
    SET
      current_participants = current_participants + 1,
      updated_at = timezone('utc'::text, now())
    WHERE id = p_event_id;

    -- Log activity
    INSERT INTO activity_logs (
      user_id,
      action,
      resource_type,
      resource_id,
      details
    )
    VALUES (
      v_user_id,
      'register',
      'event',
      p_event_id,
      jsonb_build_object(
        'name', p_name,
        'email', p_email
      )
    );
  EXCEPTION
    WHEN unique_violation THEN
      RAISE EXCEPTION 'Already registered for this event';
  END;
END;
$$;

-- Create content types enum
DO $$ BEGIN
  CREATE TYPE content_type AS ENUM ('article', 'update', 'photo', 'video');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create content status enum
DO $$ BEGIN
  CREATE TYPE content_status AS ENUM ('draft', 'published', 'archived');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create content table
CREATE TABLE IF NOT EXISTS content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  content_type content_type NOT NULL,
  media_url TEXT,
  thumbnail_url TEXT,
  author_id UUID NOT NULL REFERENCES profiles(id),
  organization_id UUID REFERENCES organizations(id),
  likes_count INTEGER DEFAULT 0 NOT NULL,
  comments_count INTEGER DEFAULT 0 NOT NULL,
  is_featured BOOLEAN DEFAULT false NOT NULL,
  status content_status DEFAULT 'draft' NOT NULL,
  tags TEXT[] DEFAULT '{}' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create content likes table
CREATE TABLE IF NOT EXISTS content_likes (
  content_id UUID NOT NULL REFERENCES content(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY (content_id, user_id)
);

-- Create content comments table
CREATE TABLE IF NOT EXISTS content_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_id UUID NOT NULL REFERENCES content(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES profiles(id),
  text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create function to handle content likes
CREATE OR REPLACE FUNCTION like_content(p_content_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Get the current user ID
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Begin transaction
  BEGIN
    -- Insert like
    INSERT INTO content_likes (content_id, user_id)
    VALUES (p_content_id, v_user_id);

    -- Update likes count
    UPDATE content
    SET
      likes_count = likes_count + 1,
      updated_at = timezone('utc'::text, now())
    WHERE id = p_content_id;

    -- Log activity
    INSERT INTO activity_logs (
      user_id,
      action,
      resource_type,
      resource_id,
      details
    )
    VALUES (
      v_user_id,
      'like',
      'content',
      p_content_id,
      jsonb_build_object(
        'type', 'like'
      )
    );
  EXCEPTION
    WHEN unique_violation THEN
      RAISE EXCEPTION 'Already liked this content';
  END;
END;
$$;

-- Create function to handle content unlikes
CREATE OR REPLACE FUNCTION unlike_content(p_content_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Get the current user ID
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Begin transaction
  BEGIN
    -- Delete like
    DELETE FROM content_likes
    WHERE content_id = p_content_id AND user_id = v_user_id;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Like not found';
    END IF;

    -- Update likes count
    UPDATE content
    SET
      likes_count = likes_count - 1,
      updated_at = timezone('utc'::text, now())
    WHERE id = p_content_id;

    -- Log activity
    INSERT INTO activity_logs (
      user_id,
      action,
      resource_type,
      resource_id,
      details
    )
    VALUES (
      v_user_id,
      'unlike',
      'content',
      p_content_id,
      jsonb_build_object(
        'type', 'unlike'
      )
    );
  END;
END;
$$;

-- Create trigger to update comments count
CREATE OR REPLACE FUNCTION update_content_comments_count()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE content
    SET comments_count = comments_count + 1
    WHERE id = NEW.content_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE content
    SET comments_count = comments_count - 1
    WHERE id = OLD.content_id;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS content_comments_count_trigger ON content_comments;
CREATE TRIGGER content_comments_count_trigger
AFTER INSERT OR DELETE ON content_comments
FOR EACH ROW
EXECUTE FUNCTION update_content_comments_count();

-- Create RLS policies for content
ALTER TABLE content ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Content is viewable by everyone" ON content;
CREATE POLICY "Content is viewable by everyone"
ON content FOR SELECT
USING (status = 'published');

DROP POLICY IF EXISTS "Users can create content" ON content;
CREATE POLICY "Users can create content"
ON content FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "Users can update their own content" ON content;
CREATE POLICY "Users can update their own content"
ON content FOR UPDATE
TO authenticated
USING (auth.uid() = author_id)
WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "Users can delete their own content" ON content;
CREATE POLICY "Users can delete their own content"
ON content FOR DELETE
TO authenticated
USING (auth.uid() = author_id);

-- Create RLS policies for comments
ALTER TABLE content_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Comments are viewable by everyone" ON content_comments;
CREATE POLICY "Comments are viewable by everyone"
ON content_comments FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Users can create comments" ON content_comments;
CREATE POLICY "Users can create comments"
ON content_comments FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "Users can delete their own comments" ON content_comments;
CREATE POLICY "Users can delete their own comments"
ON content_comments FOR DELETE
TO authenticated
USING (auth.uid() = author_id);

-- Create RLS policies for likes
ALTER TABLE content_likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Likes are viewable by everyone" ON content_likes;
CREATE POLICY "Likes are viewable by everyone"
ON content_likes FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Users can create likes" ON content_likes;
CREATE POLICY "Users can create likes"
ON content_likes FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own likes" ON content_likes;
CREATE POLICY "Users can delete their own likes"
ON content_likes FOR DELETE
TO authenticated
USING (auth.uid() = user_id); 