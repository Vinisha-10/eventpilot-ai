/**
 * EventPilot AI — TypeScript Type Definitions
 * All shared types for the frontend application.
 */

// ============================================
// Enums
// ============================================
export type EventType =
  | 'wedding' | 'birthday' | 'college_festival' | 'corporate'
  | 'conference' | 'workshop' | 'exhibition' | 'music_show'
  | 'community' | 'other';

export type EventStatus = 'planning' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
export type RSVPStatus = 'pending' | 'accepted' | 'declined' | 'maybe';
export type TaskStatus = 'todo' | 'in_progress' | 'done' | 'cancelled';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type BudgetCategory = 'venue' | 'catering' | 'decoration' | 'photography' | 'music' | 'transportation' | 'accommodation' | 'marketing' | 'equipment' | 'staff' | 'gifts' | 'miscellaneous';
export type VendorCategory = 'venue' | 'caterer' | 'photographer' | 'videographer' | 'decorator' | 'dj' | 'band' | 'florist' | 'baker' | 'planner' | 'transport' | 'equipment' | 'security' | 'other';
export type VendorStatus = 'suggested' | 'contacted' | 'quoted' | 'booked' | 'rejected';
export type Platform = 'instagram' | 'linkedin' | 'facebook' | 'twitter' | 'email' | 'poster' | 'other';

// ============================================
// Data Models
// ============================================
export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  role: string;
  phone?: string;
  company?: string;
}

export interface Event {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  event_type: EventType;
  start_date: string;
  end_date?: string;
  venue_name?: string;
  venue_address?: string;
  venue_lat?: number;
  venue_lng?: number;
  total_budget: number;
  spent_budget: number;
  theme?: string;
  special_requirements?: string;
  status: EventStatus;
  ai_plan?: AIEventPlan;
  max_guests: number;
  created_at: string;
  updated_at: string;
}

export interface Guest {
  id: string;
  event_id: string;
  name: string;
  email?: string;
  phone?: string;
  rsvp_status: RSVPStatus;
  plus_ones: number;
  dietary_requirements?: string;
  seat_assignment?: string;
  table_number?: number;
  qr_code?: string;
  invitation_sent: boolean;
  invitation_sent_at?: string;
  checked_in: boolean;
  checked_in_at?: string;
  notes?: string;
  created_at: string;
}

export interface Task {
  id: string;
  event_id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  category?: string;
  due_date?: string;
  assigned_to?: string;
  is_milestone: boolean;
  sort_order: number;
  created_at: string;
}

export interface BudgetItem {
  id: string;
  event_id: string;
  category: BudgetCategory;
  description: string;
  estimated_cost: number;
  actual_cost?: number;
  vendor_id?: string;
  is_paid: boolean;
  notes?: string;
  created_at: string;
}

export interface Vendor {
  id: string;
  event_id?: string;
  name: string;
  category: VendorCategory;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  website?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  rating: number;
  price_range?: string;
  status: VendorStatus;
  quoted_price?: number;
  created_at: string;
}

export interface MarketingContent {
  id: string;
  event_id: string;
  platform: Platform;
  content_type: string;
  title?: string;
  content: string;
  hashtags?: string[];
  generated_by: string;
  created_at: string;
}

export interface ChatMessageType {
  id?: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  tool_calls?: ToolCall[];
  suggestions?: string[];
  created_at?: string;
}

export interface ToolCall {
  agent: string;
  result: Record<string, unknown>;
}

// ============================================
// AI Plan
// ============================================
export interface AIEventPlan {
  timeline: { phase: string; period: string; tasks: string[] }[];
  checklist: { item: string; priority: string; category: string }[];
  milestones: { name: string; target_date: string; description: string }[];
  reminders: { message: string; days_before_event: number; priority: string }[];
  budget_breakdown: { category: string; percentage: number; estimated_amount: number; notes: string }[];
  vendor_suggestions: { category: string; priority: string; tips: string }[];
  risk_factors: string[];
  tips?: string[];
  weather_advisory?: string;
}

// ============================================
// Dashboard
// ============================================
export interface DashboardStats {
  total_events: number;
  upcoming_events: number;
  total_guests: number;
  rsvp_accepted: number;
  rsvp_pending: number;
  rsvp_declined: number;
  total_budget: number;
  total_spent: number;
  tasks_completed: number;
  tasks_total: number;
  vendors_booked: number;
}

// ============================================
// API Response
// ============================================
export interface APIResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}

// ============================================
// Event Wizard
// ============================================
export interface EventWizardData {
  name: string;
  event_type: EventType;
  start_date: string;
  end_date?: string;
  venue_name?: string;
  venue_address?: string;
  total_budget: number;
  max_guests: number;
  theme?: string;
  special_requirements?: string;
}

// ============================================
// Helpers
// ============================================
export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  wedding: '💒 Wedding',
  birthday: '🎂 Birthday Party',
  college_festival: '🎓 College Festival',
  corporate: '💼 Corporate Event',
  conference: '🎤 Conference',
  workshop: '🔧 Workshop',
  exhibition: '🎨 Exhibition',
  music_show: '🎵 Music Show',
  community: '🤝 Community Event',
  other: '📋 Other',
};

export const RSVP_COLORS: Record<RSVPStatus, string> = {
  accepted: '#10b981',
  declined: '#ef4444',
  pending: '#f59e0b',
  maybe: '#8b5cf6',
};

export const PRIORITY_COLORS: Record<TaskPriority, string> = {
  low: '#6b7280',
  medium: '#3b82f6',
  high: '#f59e0b',
  urgent: '#ef4444',
};
