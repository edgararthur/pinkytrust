-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create events table if it doesn't exist
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
  organization_id UUID NOT NULL,
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