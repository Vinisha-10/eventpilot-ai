"""
EventPilot AI — Pydantic Schemas
Request and response models for all API endpoints.
"""

from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List, Any
from datetime import datetime
from enum import Enum


# ============================================
# Enums
# ============================================

class EventType(str, Enum):
    WEDDING = "wedding"
    BIRTHDAY = "birthday"
    COLLEGE_FESTIVAL = "college_festival"
    CORPORATE = "corporate"
    CONFERENCE = "conference"
    WORKSHOP = "workshop"
    EXHIBITION = "exhibition"
    MUSIC_SHOW = "music_show"
    COMMUNITY = "community"
    OTHER = "other"


class EventStatus(str, Enum):
    PLANNING = "planning"
    CONFIRMED = "confirmed"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class RSVPStatus(str, Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    DECLINED = "declined"
    MAYBE = "maybe"


class TaskStatus(str, Enum):
    TODO = "todo"
    IN_PROGRESS = "in_progress"
    DONE = "done"
    CANCELLED = "cancelled"


class TaskPriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"


class BudgetCategory(str, Enum):
    VENUE = "venue"
    CATERING = "catering"
    DECORATION = "decoration"
    PHOTOGRAPHY = "photography"
    MUSIC = "music"
    TRANSPORTATION = "transportation"
    ACCOMMODATION = "accommodation"
    MARKETING = "marketing"
    EQUIPMENT = "equipment"
    STAFF = "staff"
    GIFTS = "gifts"
    MISCELLANEOUS = "miscellaneous"


class VendorCategory(str, Enum):
    VENUE = "venue"
    CATERER = "caterer"
    PHOTOGRAPHER = "photographer"
    VIDEOGRAPHER = "videographer"
    DECORATOR = "decorator"
    DJ = "dj"
    BAND = "band"
    FLORIST = "florist"
    BAKER = "baker"
    PLANNER = "planner"
    TRANSPORT = "transport"
    EQUIPMENT = "equipment"
    SECURITY = "security"
    OTHER = "other"


class VendorStatus(str, Enum):
    SUGGESTED = "suggested"
    CONTACTED = "contacted"
    QUOTED = "quoted"
    BOOKED = "booked"
    REJECTED = "rejected"


class Platform(str, Enum):
    INSTAGRAM = "instagram"
    LINKEDIN = "linkedin"
    FACEBOOK = "facebook"
    TWITTER = "twitter"
    EMAIL = "email"
    POSTER = "poster"
    OTHER = "other"


# ============================================
# Auth Schemas
# ============================================

class SignUpRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    full_name: str = Field(min_length=1)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class AuthResponse(BaseModel):
    access_token: str
    refresh_token: str
    user: dict


class UserProfile(BaseModel):
    id: str
    email: str
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    role: str = "user"
    phone: Optional[str] = None
    company: Optional[str] = None


# ============================================
# Event Schemas
# ============================================

class EventCreate(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    description: Optional[str] = None
    event_type: EventType
    start_date: datetime
    end_date: Optional[datetime] = None
    venue_name: Optional[str] = None
    venue_address: Optional[str] = None
    venue_lat: Optional[float] = None
    venue_lng: Optional[float] = None
    total_budget: float = 0
    theme: Optional[str] = None
    special_requirements: Optional[str] = None
    max_guests: int = 100


class EventUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    event_type: Optional[EventType] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    venue_name: Optional[str] = None
    venue_address: Optional[str] = None
    venue_lat: Optional[float] = None
    venue_lng: Optional[float] = None
    total_budget: Optional[float] = None
    theme: Optional[str] = None
    special_requirements: Optional[str] = None
    status: Optional[EventStatus] = None
    max_guests: Optional[int] = None


class EventResponse(BaseModel):
    id: str
    user_id: str
    name: str
    description: Optional[str] = None
    event_type: str
    start_date: str
    end_date: Optional[str] = None
    venue_name: Optional[str] = None
    venue_address: Optional[str] = None
    venue_lat: Optional[float] = None
    venue_lng: Optional[float] = None
    total_budget: float = 0
    spent_budget: float = 0
    theme: Optional[str] = None
    special_requirements: Optional[str] = None
    status: str = "planning"
    ai_plan: Optional[dict] = None
    max_guests: int = 100
    created_at: str
    updated_at: str


# ============================================
# Guest Schemas
# ============================================

class GuestCreate(BaseModel):
    name: str = Field(min_length=1)
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    plus_ones: int = 0
    dietary_requirements: Optional[str] = None
    notes: Optional[str] = None


class GuestUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    rsvp_status: Optional[RSVPStatus] = None
    plus_ones: Optional[int] = None
    dietary_requirements: Optional[str] = None
    seat_assignment: Optional[str] = None
    table_number: Optional[int] = None
    notes: Optional[str] = None


class GuestResponse(BaseModel):
    id: str
    event_id: str
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    rsvp_status: str = "pending"
    plus_ones: int = 0
    dietary_requirements: Optional[str] = None
    seat_assignment: Optional[str] = None
    table_number: Optional[int] = None
    qr_code: Optional[str] = None
    invitation_sent: bool = False
    checked_in: bool = False
    created_at: str


class BulkGuestCreate(BaseModel):
    guests: List[GuestCreate]


class InviteGuestsRequest(BaseModel):
    guest_ids: List[str]
    message: Optional[str] = None


# ============================================
# Task Schemas
# ============================================

class TaskCreate(BaseModel):
    title: str = Field(min_length=1)
    description: Optional[str] = None
    priority: TaskPriority = TaskPriority.MEDIUM
    category: Optional[str] = None
    due_date: Optional[datetime] = None
    assigned_to: Optional[str] = None
    is_milestone: bool = False


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[TaskStatus] = None
    priority: Optional[TaskPriority] = None
    category: Optional[str] = None
    due_date: Optional[datetime] = None
    assigned_to: Optional[str] = None
    sort_order: Optional[int] = None


class TaskResponse(BaseModel):
    id: str
    event_id: str
    title: str
    description: Optional[str] = None
    status: str = "todo"
    priority: str = "medium"
    category: Optional[str] = None
    due_date: Optional[str] = None
    assigned_to: Optional[str] = None
    is_milestone: bool = False
    sort_order: int = 0
    created_at: str


# ============================================
# Budget Schemas
# ============================================

class BudgetItemCreate(BaseModel):
    category: BudgetCategory
    description: str = Field(min_length=1)
    estimated_cost: float = 0
    actual_cost: Optional[float] = None
    vendor_id: Optional[str] = None
    notes: Optional[str] = None


class BudgetItemUpdate(BaseModel):
    category: Optional[BudgetCategory] = None
    description: Optional[str] = None
    estimated_cost: Optional[float] = None
    actual_cost: Optional[float] = None
    vendor_id: Optional[str] = None
    is_paid: Optional[bool] = None
    notes: Optional[str] = None


class BudgetItemResponse(BaseModel):
    id: str
    event_id: str
    category: str
    description: str
    estimated_cost: float = 0
    actual_cost: Optional[float] = None
    vendor_id: Optional[str] = None
    is_paid: bool = False
    notes: Optional[str] = None
    created_at: str


class BudgetInsights(BaseModel):
    total_budget: float
    total_estimated: float
    total_actual: float
    remaining: float
    by_category: dict
    suggestions: List[str]
    risk_level: str  # "low", "medium", "high"


# ============================================
# Vendor Schemas
# ============================================

class VendorCreate(BaseModel):
    name: str = Field(min_length=1)
    category: VendorCategory
    contact_name: Optional[str] = None
    contact_email: Optional[EmailStr] = None
    contact_phone: Optional[str] = None
    website: Optional[str] = None
    address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    rating: float = 0
    price_range: Optional[str] = None
    quoted_price: Optional[float] = None
    notes: Optional[str] = None


class VendorUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[VendorCategory] = None
    contact_name: Optional[str] = None
    contact_email: Optional[EmailStr] = None
    contact_phone: Optional[str] = None
    website: Optional[str] = None
    address: Optional[str] = None
    status: Optional[VendorStatus] = None
    quoted_price: Optional[float] = None
    notes: Optional[str] = None


class VendorResponse(BaseModel):
    id: str
    event_id: Optional[str] = None
    name: str
    category: str
    contact_name: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    website: Optional[str] = None
    address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    rating: float = 0
    price_range: Optional[str] = None
    status: str = "suggested"
    quoted_price: Optional[float] = None
    created_at: str


class VendorSearchRequest(BaseModel):
    category: VendorCategory
    latitude: float
    longitude: float
    radius_km: float = 10


# ============================================
# Chat Schemas
# ============================================

class ChatMessage(BaseModel):
    content: str = Field(min_length=1)
    event_id: Optional[str] = None


class ChatResponse(BaseModel):
    role: str = "assistant"
    content: str
    tool_calls: Optional[List[dict]] = None
    suggestions: Optional[List[str]] = None


# ============================================
# Marketing Schemas
# ============================================

class MarketingGenerateRequest(BaseModel):
    event_id: str
    platform: Platform
    content_type: str = "post"
    tone: str = "professional"
    additional_context: Optional[str] = None


class MarketingContentResponse(BaseModel):
    id: str
    event_id: str
    platform: str
    content_type: str
    title: Optional[str] = None
    content: str
    hashtags: Optional[List[str]] = None
    created_at: str


# ============================================
# Schedule Schemas
# ============================================

class ScheduleItemCreate(BaseModel):
    title: str
    description: Optional[str] = None
    start_time: datetime
    end_time: datetime
    location: Optional[str] = None
    assigned_to: Optional[str] = None


class ScheduleGenerateRequest(BaseModel):
    event_id: str
    preferences: Optional[str] = None


# ============================================
# Dashboard Schemas
# ============================================

class DashboardStats(BaseModel):
    total_events: int
    upcoming_events: int
    total_guests: int
    rsvp_accepted: int
    rsvp_pending: int
    rsvp_declined: int
    total_budget: float
    total_spent: float
    tasks_completed: int
    tasks_total: int
    vendors_booked: int


# ============================================
# AI Plan Schemas
# ============================================

class AIEventPlan(BaseModel):
    timeline: List[dict]
    checklist: List[dict]
    milestones: List[dict]
    reminders: List[dict]
    budget_breakdown: List[dict]
    vendor_suggestions: List[dict]
    risk_factors: List[str]
    weather_advisory: Optional[str] = None


# ============================================
# Generic Response
# ============================================

class APIResponse(BaseModel):
    success: bool = True
    message: str = ""
    data: Optional[Any] = None
