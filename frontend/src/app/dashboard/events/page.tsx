'use client';

/**
 * EventPilot AI — Events List Page
 */

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';
import { EVENT_TYPE_LABELS } from '@/types';
import type { Event } from '@/types';
import { Plus, Calendar, Clock, MapPin, DollarSign, Search, Filter } from 'lucide-react';

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

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

  const filteredEvents = events.filter(e => {
    const matchesSearch = e.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || e.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Events</h1>
          <p className="text-gray-400 text-sm mt-1">Manage all your events in one place</p>
        </div>
        <Link href="/dashboard/events/new" className="btn-primary text-sm">
          <Plus className="w-4 h-4" /> New Event
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-10 text-sm"
            placeholder="Search events..."
          />
        </div>
        <div className="flex gap-2">
          {['all', 'planning', 'confirmed', 'in_progress', 'completed'].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                statusFilter === status
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                  : 'bg-white/[0.02] text-gray-500 border border-white/5 hover:bg-white/[0.05]'
              }`}
            >
              {status === 'all' ? 'All' : status.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="glass-card-static p-6 h-48 shimmer" />
          ))}
        </div>
      ) : filteredEvents.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEvents.map((event, i) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                href={`/dashboard/events/${event.id}`}
                className="glass-card p-6 block h-full group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="text-3xl">
                    {event.event_type === 'wedding' ? '💒' :
                     event.event_type === 'birthday' ? '🎂' :
                     event.event_type === 'conference' ? '🎤' :
                     event.event_type === 'corporate' ? '💼' :
                     event.event_type === 'music_show' ? '🎵' : '🎉'}
                  </div>
                  <div className={`badge ${
                    event.status === 'planning' ? 'badge-primary' :
                    event.status === 'confirmed' ? 'badge-success' :
                    event.status === 'in_progress' ? 'badge-warning' :
                    event.status === 'completed' ? 'badge-success' : 'badge-neutral'
                  }`}>
                    {event.status}
                  </div>
                </div>
                <h3 className="text-base font-semibold text-white mb-1 group-hover:text-indigo-300 transition-colors truncate">
                  {event.name}
                </h3>
                <p className="text-xs text-gray-500 mb-4">
                  {EVENT_TYPE_LABELS[event.event_type]}
                </p>
                <div className="space-y-2 text-xs text-gray-400">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-gray-600" />
                    {new Date(event.start_date).toLocaleDateString('en-US', {
                      weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
                    })}
                  </div>
                  {event.venue_name && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-gray-600" />
                      {event.venue_name}
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-3.5 h-3.5 text-gray-600" />
                    ${event.total_budget?.toLocaleString() || '0'} budget
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 glass-card-static">
          <div className="text-5xl mb-4">🎪</div>
          <h3 className="text-lg font-semibold text-white mb-2">No events yet</h3>
          <p className="text-gray-400 text-sm mb-6">Create your first event and let AI do the planning!</p>
          <Link href="/dashboard/events/new" className="btn-primary text-sm">
            <Plus className="w-4 h-4" /> Create Event
          </Link>
        </div>
      )}
    </div>
  );
}
