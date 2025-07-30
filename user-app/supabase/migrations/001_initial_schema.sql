-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types
CREATE TYPE event_category AS ENUM ('screening', 'education', 'support', 'fundraising', 'awareness');
CREATE TYPE event_type AS ENUM ('in-person', 'virtual', 'hybrid');
CREATE TYPE organizer_type AS ENUM ('hospital', 'nonprofit', 'government', 'community', 'corporate');
CREATE TYPE content_type AS ENUM ('article', 'video', 'interactive', 'infographic', 'podcast', 'checklist', 'quiz', 'webinar');
CREATE TYPE content_difficulty AS ENUM ('beginner', 'intermediate', 'advanced');
CREATE TYPE risk_level AS ENUM ('low', 'moderate', 'high');

-- Users table (extends Supabase auth.users)
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT,
    full_name TEXT,
    avatar_url TEXT,
    date_of_birth DATE,
    phone TEXT,
    emergency_contact JSONB,
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Events table
CREATE TABLE public.events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    date DATE NOT NULL,
    time TIME NOT NULL,
    end_time TIME,
    location TEXT NOT NULL,
    address TEXT,
    category event_category NOT NULL,
    type event_type NOT NULL DEFAULT 'in-person',
    price DECIMAL(10,2) DEFAULT 0,
    max_attendees INTEGER,
    current_attendees INTEGER DEFAULT 0,
    image_url TEXT,
    organizer JSONB NOT NULL,
    tags TEXT[],
    featured BOOLEAN DEFAULT FALSE,
    registration_required BOOLEAN DEFAULT TRUE,
    registration_url TEXT,
    contact_info JSONB,
    requirements TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Event registrations
CREATE TABLE public.event_registrations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    registration_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status TEXT DEFAULT 'registered',
    notes TEXT,
    UNIQUE(event_id, user_id)
);

-- Assessment questions
CREATE TABLE public.assessment_questions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    question_id TEXT UNIQUE NOT NULL,
    question TEXT NOT NULL,
    subtitle TEXT,
    type TEXT NOT NULL CHECK (type IN ('boolean', 'number', 'select', 'multiselect', 'scale')),
    options JSONB,
    weight INTEGER NOT NULL DEFAULT 1,
    category TEXT NOT NULL,
    help_text TEXT,
    min_value INTEGER,
    max_value INTEGER,
    unit TEXT,
    required BOOLEAN DEFAULT TRUE,
    order_index INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User assessments
CREATE TABLE public.user_assessments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    answers JSONB NOT NULL,
    risk_score INTEGER,
    risk_level risk_level,
    recommendations JSONB,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Awareness content
CREATE TABLE public.awareness_content (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    subtitle TEXT,
    description TEXT NOT NULL,
    content TEXT,
    category TEXT NOT NULL,
    type content_type NOT NULL,
    difficulty content_difficulty DEFAULT 'beginner',
    read_time INTEGER, -- in minutes
    author JSONB,
    published_date DATE DEFAULT CURRENT_DATE,
    image_url TEXT,
    video_url TEXT,
    audio_url TEXT,
    tags TEXT[],
    featured BOOLEAN DEFAULT FALSE,
    is_new BOOLEAN DEFAULT TRUE,
    is_premium BOOLEAN DEFAULT FALSE,
    is_expert_reviewed BOOLEAN DEFAULT FALSE,
    medical_review_date DATE,
    language TEXT DEFAULT 'English',
    accessibility JSONB DEFAULT '{}',
    engagement JSONB DEFAULT '{"views": 0, "likes": 0, "shares": 0, "comments": 0}',
    learning_objectives TEXT[],
    certificate BOOLEAN DEFAULT FALSE,
    estimated_completion_time TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Community posts
CREATE TABLE public.community_posts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    image_url TEXT,
    tags TEXT[],
    type TEXT DEFAULT 'post',
    likes INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    is_anonymous BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Community groups
CREATE TABLE public.community_groups (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    member_count INTEGER DEFAULT 0,
    next_meeting TIMESTAMP WITH TIME ZONE,
    location TEXT,
    image_url TEXT,
    is_private BOOLEAN DEFAULT FALSE,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Group memberships
CREATE TABLE public.group_memberships (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    group_id UUID REFERENCES public.community_groups(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member',
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(group_id, user_id)
);

-- User bookmarks
CREATE TABLE public.user_bookmarks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    content_type TEXT NOT NULL, -- 'event', 'content', 'post'
    content_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, content_type, content_id)
);

-- User progress tracking
CREATE TABLE public.user_progress (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    content_id UUID REFERENCES public.awareness_content(id) ON DELETE CASCADE,
    progress INTEGER DEFAULT 0, -- percentage
    completed BOOLEAN DEFAULT FALSE,
    time_spent INTEGER DEFAULT 0, -- in seconds
    last_accessed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(user_id, content_id)
);

-- Scan history (for QR code scanner)
CREATE TABLE public.scan_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    scanned_data JSONB NOT NULL,
    scan_type TEXT NOT NULL,
    location JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_events_date ON public.events(date);
CREATE INDEX idx_events_category ON public.events(category);
CREATE INDEX idx_events_featured ON public.events(featured);
CREATE INDEX idx_awareness_content_category ON public.awareness_content(category);
CREATE INDEX idx_awareness_content_featured ON public.awareness_content(featured);
CREATE INDEX idx_community_posts_author ON public.community_posts(author_id);
CREATE INDEX idx_community_posts_created ON public.community_posts(created_at);
CREATE INDEX idx_user_assessments_user ON public.user_assessments(user_id);
CREATE INDEX idx_user_progress_user ON public.user_progress(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scan_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Anyone can view public events" ON public.events
    FOR SELECT USING (true);

CREATE POLICY "Users can view their own registrations" ON public.event_registrations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own registrations" ON public.event_registrations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can view assessment questions" ON public.assessment_questions
    FOR SELECT USING (true);

CREATE POLICY "Users can view their own assessments" ON public.user_assessments
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own assessments" ON public.user_assessments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can view public awareness content" ON public.awareness_content
    FOR SELECT USING (true);

CREATE POLICY "Anyone can view community posts" ON public.community_posts
    FOR SELECT USING (true);

CREATE POLICY "Users can create community posts" ON public.community_posts
    FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can view their own bookmarks" ON public.user_bookmarks
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own bookmarks" ON public.user_bookmarks
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own progress" ON public.user_progress
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own progress" ON public.user_progress
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own scan history" ON public.scan_history
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own scan history" ON public.scan_history
    FOR INSERT WITH CHECK (auth.uid() = user_id);
