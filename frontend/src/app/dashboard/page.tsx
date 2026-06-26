'use client';

/**
 * EventPilot AI — Dashboard Page
 * Main dashboard with stats, charts, upcoming events, and AI suggestions.
 */

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import {
  Calendar, Users, DollarSign, CheckCircle2, TrendingUp,
  Sparkles, ArrowRight, Plus, Clock, MapPin, BarChart3, MessageSquare
} from 'lucide-react';
import type { Event } from '@/types';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0 },
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  const loadEvents = useCallback(async () => {
    try {
      const res = await api.getEvents();
      setEvents((res.data as Event[]) || []);
    } catch {
      // Will work once Supabase is configured
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadEvents();
  }, [loadEvents]);

  const upcomingEvents = events
    .filter(e => new Date(e.start_date) > new Date())
    .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
    .slice(0, 5);

  const totalBudget = events.reduce((sum, e) => sum + (e.total_budget || 0), 0);
  const totalSpent = events.reduce((sum, e) => sum + (e.spent_budget || 0), 0);

  const stats = [
    { label: 'Total Events', value: events.length.toString(), icon: Calendar, color: 'from-indigo-500 to-purple-500', change: '+2 this month' },
    { label: 'Upcoming', value: upcomingEvents.length.toString(), icon: Clock, color: 'from-emerald-500 to-teal-500', change: 'Next 30 days' },
    { label: 'Total Budget', value: `$${(totalBudget / 1000).toFixed(1)}K`, icon: DollarSign, color: 'from-amber-500 to-orange-500', change: `$${(totalBudget - totalSpent).toFixed(0)} remaining` },
    { label: 'Tasks Done', value: '—', icon: CheckCircle2, color: 'from-pink-500 to-rose-500', change: 'Across all events' },
  ];

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const aiSuggestions = [
    '🎯 Create your first event to get AI-powered planning',
    '📊 Set up budget tracking to get optimization tips',
    '👥 Import your guest list for RSVP management',
    '🗓️ Connect Google Calendar for auto-sync',
  ];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      {/* Header */}
      <motion.div variants={itemVariants} className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-white">
          {greeting()}, {user?.user_metadata?.full_name?.split(' ')[0] || 'there'} 👋
        </h1>
        <p className="text-gray-400 mt-1">Here&apos;s what&apos;s happening with your events.</p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => (
          <div key={i} className="glass-card p-5 group">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <TrendingUp className="w-4 h-4 text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="text-2xl font-bold text-white">{stat.value}</div>
            <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
            <div className="text-xs text-gray-600 mt-0.5">{stat.change}</div>
          </div>
        ))}
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Upcoming Events */}
        <motion.div variants={itemVariants} className="lg:col-span-2 glass-card-static p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-400" />
              Upcoming Events
            </h2>
            <Link href="/dashboard/events" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-20 rounded-xl shimmer bg-white/5" />
              ))}
            </div>
          ) : upcomingEvents.length > 0 ? (
            <div className="space-y-3">
              {upcomingEvents.map((event, i) => (
                <Link
                  key={event.id}
                  href={`/dashboard/events/${event.id}`}
                  className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-indigo-500/20 transition-all group"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center text-xl flex-shrink-0">
                    {event.event_type === 'wedding' ? '💒' :
                     event.event_type === 'birthday' ? '🎂' :
                     event.event_type === 'conference' ? '🎤' :
                     event.event_type === 'corporate' ? '💼' : '🎉'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-white truncate group-hover:text-indigo-300 transition-colors">{event.name}</div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(event.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      {event.venue_name && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {event.venue_name}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className={`badge ${
                    event.status === 'planning' ? 'badge-primary' :
                    event.status === 'confirmed' ? 'badge-success' :
                    event.status === 'in_progress' ? 'badge-warning' :
                    'badge-neutral'
                  }`}>
                    {event.status}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-4xl mb-3">🎉</div>
              <p className="text-gray-400 text-sm mb-4">No upcoming events yet</p>
              <Link href="/dashboard/events/new" className="btn-primary text-sm">
                <Plus className="w-4 h-4" />
                Create Your First Event
              </Link>
            </div>
          )}
        </motion.div>

        {/* AI Suggestions */}
        <motion.div variants={itemVariants} className="glass-card-static p-6">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-5">
            <Sparkles className="w-5 h-5 text-amber-400" />
            AI Suggestions
          </h2>
          <div className="space-y-3">
            {aiSuggestions.map((suggestion, i) => (
              <div
                key={i}
                className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-sm text-gray-300 hover:bg-white/[0.05] hover:border-indigo-500/20 transition-all cursor-pointer"
              >
                {suggestion}
              </div>
            ))}
          </div>

          <Link
            href="/dashboard/chat"
            className="btn-secondary w-full justify-center mt-5 text-sm"
          >
            <MessageSquare className="w-4 h-4" />
            Ask AI Assistant
          </Link>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div variants={itemVariants} className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'New Event', icon: Plus, href: '/dashboard/events/new', color: 'from-indigo-500 to-purple-500' },
          { label: 'AI Chat', icon: MessageSquare, href: '/dashboard/chat', color: 'from-emerald-500 to-teal-500' },
          { label: 'View Events', icon: Calendar, href: '/dashboard/events', color: 'from-amber-500 to-orange-500' },
          { label: 'Analytics', icon: BarChart3, href: '/dashboard', color: 'from-pink-500 to-rose-500' },
        ].map((action, i) => (
          <Link
            key={i}
            href={action.href}
            className="glass-card p-4 text-center group"
          >
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform`}>
              <action.icon className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm text-gray-400 group-hover:text-white transition-colors">{action.label}</span>
          </Link>
        ))}
      </motion.div>
    </motion.div>
  );
}

