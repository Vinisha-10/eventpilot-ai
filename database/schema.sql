-- ============================================
-- EventPilot AI — Supabase Database Schema
-- ============================================
-- Run this in the Supabase SQL Editor to set up
-- all tables, RLS policies, and triggers.
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. PROFILES (extends Supabase auth.users)
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'vendor')),
    phone TEXT,
    company TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, email, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- 2. EVENTS
-- ============================================
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    event_type TEXT NOT NULL CHECK (event_type IN (
        'wedding', 'birthday', 'college_festival', 'corporate',
        'conference', 'workshop', 'exhibition', 'music_show', 'community', 'other'
    )),
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ,
    venue_name TEXT,
    venue_address TEXT,
    venue_lat DOUBLE PRECISION,
    venue_lng DOUBLE PRECISION,
    total_budget DECIMAL(12, 2) DEFAULT 0,
    spent_budget DECIMAL(12, 2) DEFAULT 0,
    theme TEXT,
    special_requirements TEXT,
    status TEXT DEFAULT 'planning' CHECK (status IN ('planning', 'confirmed', 'in_progress', 'completed', 'cancelled')),
    ai_plan JSONB,          -- Stores the AI-generated event plan
    cover_image TEXT,
    max_guests INTEGER DEFAULT 100,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_events_user_id ON events(user_id);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_start_date ON events(start_date);

-- ============================================
-- 3. GUESTS
-- ============================================
CREATE TABLE IF NOT EXISTS guests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    rsvp_status TEXT DEFAULT 'pending' CHECK (rsvp_status IN ('pending', 'accepted', 'declined', 'maybe')),
    plus_ones INTEGER DEFAULT 0,
    dietary_requirements TEXT,
    seat_assignment TEXT,
    table_number INTEGER,
    qr_code TEXT,           -- Base64 or URL of QR ticket
    invitation_sent BOOLEAN DEFAULT FALSE,
    invitation_sent_at TIMESTAMPTZ,
    checked_in BOOLEAN DEFAULT FALSE,
    checked_in_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_guests_event_id ON guests(event_id);
CREATE INDEX idx_guests_rsvp ON guests(rsvp_status);

-- ============================================
-- 4. TASKS
-- ============================================
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'done', 'cancelled')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    category TEXT,
    due_date TIMESTAMPTZ,
    assigned_to TEXT,
    completed_at TIMESTAMPTZ,
    is_milestone BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tasks_event_id ON tasks(event_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);

-- ============================================
-- 5. BUDGET ITEMS
-- ============================================
CREATE TABLE IF NOT EXISTS budget_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    category TEXT NOT NULL CHECK (category IN (
        'venue', 'catering', 'decoration', 'photography', 'music',
        'transportation', 'accommodation', 'marketing', 'equipment',
        'staff', 'gifts', 'miscellaneous'
    )),
    description TEXT NOT NULL,
    estimated_cost DECIMAL(10, 2) DEFAULT 0,
    actual_cost DECIMAL(10, 2),
    vendor_id UUID REFERENCES vendors(id) ON DELETE SET NULL,
    is_paid BOOLEAN DEFAULT FALSE,
    paid_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_budget_items_event_id ON budget_items(event_id);

-- ============================================
-- 6. VENDORS
-- ============================================
CREATE TABLE IF NOT EXISTS vendors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN (
        'venue', 'caterer', 'photographer', 'videographer', 'decorator',
        'dj', 'band', 'florist', 'baker', 'planner', 'transport',
        'equipment', 'security', 'other'
    )),
    contact_name TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    website TEXT,
    address TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    rating DECIMAL(2, 1) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
    price_range TEXT CHECK (price_range IN ('budget', 'moderate', 'premium', 'luxury')),
    status TEXT DEFAULT 'suggested' CHECK (status IN ('suggested', 'contacted', 'quoted', 'booked', 'rejected')),
    quoted_price DECIMAL(10, 2),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_vendors_event_id ON vendors(event_id);
CREATE INDEX idx_vendors_category ON vendors(category);

-- ============================================
-- 7. INVOICES
-- ============================================
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    vendor_id UUID REFERENCES vendors(id) ON DELETE SET NULL,
    invoice_number TEXT,
    amount DECIMAL(10, 2) NOT NULL,
    tax DECIMAL(10, 2) DEFAULT 0,
    total DECIMAL(10, 2) NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled')),
    due_date TIMESTAMPTZ,
    paid_at TIMESTAMPTZ,
    pdf_url TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_invoices_event_id ON invoices(event_id);

-- ============================================
-- 8. NOTIFICATIONS
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('reminder', 'rsvp', 'budget', 'task', 'vendor', 'ai_suggestion', 'system')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    action_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);

-- ============================================
-- 9. MESSAGES (AI Chat History)
-- ============================================
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    tool_calls JSONB,       -- Stores AI tool calling metadata
    metadata JSONB,         -- Additional context (agent used, tokens, etc.)
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_messages_event_id ON messages(event_id);
CREATE INDEX idx_messages_user_id ON messages(user_id);

-- ============================================
-- 10. MARKETING CONTENT
-- ============================================
CREATE TABLE IF NOT EXISTS marketing_content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    platform TEXT NOT NULL CHECK (platform IN ('instagram', 'linkedin', 'facebook', 'twitter', 'email', 'poster', 'other')),
    content_type TEXT DEFAULT 'post' CHECK (content_type IN ('post', 'caption', 'description', 'email_campaign', 'poster_prompt')),
    title TEXT,
    content TEXT NOT NULL,
    hashtags TEXT[],
    generated_by TEXT DEFAULT 'ai',
    is_published BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_marketing_event_id ON marketing_content(event_id);

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_content ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read/update their own profile
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Events: users can CRUD their own events
CREATE POLICY "Users can view own events" ON events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create events" ON events FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own events" ON events FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own events" ON events FOR DELETE USING (auth.uid() = user_id);

-- Guests: users can manage guests for their events
CREATE POLICY "Users can view guests" ON guests FOR SELECT
    USING (event_id IN (SELECT id FROM events WHERE user_id = auth.uid()));
CREATE POLICY "Users can add guests" ON guests FOR INSERT
    WITH CHECK (event_id IN (SELECT id FROM events WHERE user_id = auth.uid()));
CREATE POLICY "Users can update guests" ON guests FOR UPDATE
    USING (event_id IN (SELECT id FROM events WHERE user_id = auth.uid()));
CREATE POLICY "Users can delete guests" ON guests FOR DELETE
    USING (event_id IN (SELECT id FROM events WHERE user_id = auth.uid()));

-- Tasks: users can manage tasks for their events
CREATE POLICY "Users can view tasks" ON tasks FOR SELECT
    USING (event_id IN (SELECT id FROM events WHERE user_id = auth.uid()));
CREATE POLICY "Users can create tasks" ON tasks FOR INSERT
    WITH CHECK (event_id IN (SELECT id FROM events WHERE user_id = auth.uid()));
CREATE POLICY "Users can update tasks" ON tasks FOR UPDATE
    USING (event_id IN (SELECT id FROM events WHERE user_id = auth.uid()));
CREATE POLICY "Users can delete tasks" ON tasks FOR DELETE
    USING (event_id IN (SELECT id FROM events WHERE user_id = auth.uid()));

-- Budget items: users can manage budget for their events
CREATE POLICY "Users can view budget items" ON budget_items FOR SELECT
    USING (event_id IN (SELECT id FROM events WHERE user_id = auth.uid()));
CREATE POLICY "Users can create budget items" ON budget_items FOR INSERT
    WITH CHECK (event_id IN (SELECT id FROM events WHERE user_id = auth.uid()));
CREATE POLICY "Users can update budget items" ON budget_items FOR UPDATE
    USING (event_id IN (SELECT id FROM events WHERE user_id = auth.uid()));
CREATE POLICY "Users can delete budget items" ON budget_items FOR DELETE
    USING (event_id IN (SELECT id FROM events WHERE user_id = auth.uid()));

-- Vendors: users can manage vendors for their events
CREATE POLICY "Users can view vendors" ON vendors FOR SELECT
    USING (event_id IN (SELECT id FROM events WHERE user_id = auth.uid()));
CREATE POLICY "Users can create vendors" ON vendors FOR INSERT
    WITH CHECK (event_id IN (SELECT id FROM events WHERE user_id = auth.uid()));
CREATE POLICY "Users can update vendors" ON vendors FOR UPDATE
    USING (event_id IN (SELECT id FROM events WHERE user_id = auth.uid()));
CREATE POLICY "Users can delete vendors" ON vendors FOR DELETE
    USING (event_id IN (SELECT id FROM events WHERE user_id = auth.uid()));

-- Invoices: users can manage invoices for their events
CREATE POLICY "Users can view invoices" ON invoices FOR SELECT
    USING (event_id IN (SELECT id FROM events WHERE user_id = auth.uid()));
CREATE POLICY "Users can create invoices" ON invoices FOR INSERT
    WITH CHECK (event_id IN (SELECT id FROM events WHERE user_id = auth.uid()));
CREATE POLICY "Users can update invoices" ON invoices FOR UPDATE
    USING (event_id IN (SELECT id FROM events WHERE user_id = auth.uid()));
CREATE POLICY "Users can delete invoices" ON invoices FOR DELETE
    USING (event_id IN (SELECT id FROM events WHERE user_id = auth.uid()));

-- Notifications: users can view/update their own notifications
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT
    USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE
    USING (auth.uid() = user_id);

-- Messages: users can view/create messages for their events
CREATE POLICY "Users can view messages" ON messages FOR SELECT
    USING (auth.uid() = user_id);
CREATE POLICY "Users can create messages" ON messages FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Marketing: users can manage marketing for their events
CREATE POLICY "Users can view marketing" ON marketing_content FOR SELECT
    USING (event_id IN (SELECT id FROM events WHERE user_id = auth.uid()));
CREATE POLICY "Users can create marketing" ON marketing_content FOR INSERT
    WITH CHECK (event_id IN (SELECT id FROM events WHERE user_id = auth.uid()));
CREATE POLICY "Users can update marketing" ON marketing_content FOR UPDATE
    USING (event_id IN (SELECT id FROM events WHERE user_id = auth.uid()));
CREATE POLICY "Users can delete marketing" ON marketing_content FOR DELETE
    USING (event_id IN (SELECT id FROM events WHERE user_id = auth.uid()));

-- ============================================
-- UPDATED_AT TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all tables with updated_at column
CREATE TRIGGER set_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON events FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON guests FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON budget_items FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON vendors FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON marketing_content FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- HELPER: Update event spent_budget on budget change
-- ============================================
CREATE OR REPLACE FUNCTION update_event_spent_budget()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE events
    SET spent_budget = (
        SELECT COALESCE(SUM(actual_cost), 0)
        FROM budget_items
        WHERE event_id = COALESCE(NEW.event_id, OLD.event_id)
    )
    WHERE id = COALESCE(NEW.event_id, OLD.event_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_spent_budget
    AFTER INSERT OR UPDATE OR DELETE ON budget_items
    FOR EACH ROW EXECUTE FUNCTION update_event_spent_budget();
