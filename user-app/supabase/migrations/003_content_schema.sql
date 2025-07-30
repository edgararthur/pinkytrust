-- Create content types enum
CREATE TYPE content_type AS ENUM ('article', 'update', 'photo', 'video');

-- Create content status enum
CREATE TYPE content_status AS ENUM ('draft', 'published', 'archived');

-- Create organizations table if it doesn't exist
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

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

CREATE TRIGGER content_comments_count_trigger
AFTER INSERT OR DELETE ON content_comments
FOR EACH ROW
EXECUTE FUNCTION update_content_comments_count();

-- Create RLS policies
ALTER TABLE content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Content is viewable by everyone"
ON content FOR SELECT
USING (status = 'published');

CREATE POLICY "Users can create content"
ON content FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own content"
ON content FOR UPDATE
TO authenticated
USING (auth.uid() = author_id)
WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can delete their own content"
ON content FOR DELETE
TO authenticated
USING (auth.uid() = author_id);

-- Comments policies
ALTER TABLE content_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Comments are viewable by everyone"
ON content_comments FOR SELECT
USING (true);

CREATE POLICY "Users can create comments"
ON content_comments FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can delete their own comments"
ON content_comments FOR DELETE
TO authenticated
USING (auth.uid() = author_id);

-- Likes policies
ALTER TABLE content_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Likes are viewable by everyone"
ON content_likes FOR SELECT
USING (true);

CREATE POLICY "Users can create likes"
ON content_likes FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own likes"
ON content_likes FOR DELETE
TO authenticated
USING (auth.uid() = user_id); 