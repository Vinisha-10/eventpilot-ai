'use client';

/**
 * EventPilot AI — Event Detail Page
 * Tabbed view with overview, budget, guests, vendors, tasks, marketing, schedule.
 */

import { useState, useEffect, use, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';
import type { Event, Task, Guest, BudgetItem, Vendor } from '@/types';
import { EVENT_TYPE_LABELS } from '@/types';
import {
  ArrowLeft, Calendar, DollarSign, Users, MapPin, CheckCircle2,
  Sparkles, Clock, Plus, Trash2, BarChart3, Megaphone, CalendarDays,
  Store, Loader2, Edit3, TrendingUp
} from 'lucide-react';
import toast from 'react-hot-toast';

const tabs = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'tasks', label: 'Tasks', icon: CheckCircle2 },
  { id: 'guests', label: 'Guests', icon: Users },
  { id: 'budget', label: 'Budget', icon: DollarSign },
  { id: 'vendors', label: 'Vendors', icon: Store },
  { id: 'marketing', label: 'Marketing', icon: Megaphone },
];

export default function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [event, setEvent] = useState<Event | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  // Task form
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [addingTask, setAddingTask] = useState(false);

  // Guest form
  const [newGuestName, setNewGuestName] = useState('');
  const [newGuestEmail, setNewGuestEmail] = useState('');
  const [addingGuest, setAddingGuest] = useState(false);

  const loadEvent = useCallback(async () => {
    try {
      const res = await api.getEvent(id);
      setEvent(res.data as Event);
      // Load related data
      const [tasksRes, guestsRes, budgetRes, vendorsRes] = await Promise.allSettled([
        api.getTasks(id),
        api.getGuests(id),
        api.getBudgetItems(id),
        api.getVendors(id),
      ]);
      if (tasksRes.status === 'fulfilled') setTasks(tasksRes.value.data as Task[] || []);
      if (guestsRes.status === 'fulfilled') setGuests(guestsRes.value.data as Guest[] || []);
      if (budgetRes.status === 'fulfilled') setBudgetItems(budgetRes.value.data as BudgetItem[] || []);
      if (vendorsRes.status === 'fulfilled') setVendors(vendorsRes.value.data as Vendor[] || []);
    } catch {
      toast.error('Failed to load event');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadEvent();
  }, [loadEvent]);

  const handleAddTask = async () => {
    if (!newTaskTitle.trim()) return;
    setAddingTask(true);
    try {
      await api.createTask(id, { title: newTaskTitle, priority: 'medium' });
      setNewTaskTitle('');
      const res = await api.getTasks(id);
      setTasks(res.data as Task[] || []);
      toast.success('Task added');
    } catch { toast.error('Failed to add task'); }
    finally { setAddingTask(false); }
  };

  const handleToggleTask = async (task: Task) => {
    const newStatus = task.status === 'done' ? 'todo' : 'done';
    try {
      await api.updateTask(id, task.id, { status: newStatus });
      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: newStatus } : t));
    } catch { toast.error('Failed to update task'); }
  };

  const handleAddGuest = async () => {
    if (!newGuestName.trim()) return;
    setAddingGuest(true);
    try {
      await api.addGuest(id, { name: newGuestName, email: newGuestEmail || undefined });
      setNewGuestName('');
      setNewGuestEmail('');
      const res = await api.getGuests(id);
      setGuests(res.data as Guest[] || []);
      toast.success('Guest added');
    } catch { toast.error('Failed to add guest'); }
    finally { setAddingGuest(false); }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400">Event not found</p>
        <button onClick={() => router.push('/dashboard/events')} className="btn-primary text-sm mt-4">
          Back to Events
        </button>
      </div>
    );
  }

  // eslint-disable-next-line react-hooks/purity
  const daysUntil = Math.max(0, Math.ceil((new Date(event.start_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
  const budgetUsed = event.total_budget > 0 ? (event.spent_budget / event.total_budget) * 100 : 0;

  return (
    <div>
      {/* Header */}
      <button onClick={() => router.push('/dashboard/events')} className="btn-ghost text-sm mb-4">
        <ArrowLeft className="w-4 h-4" /> Back to Events
      </button>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            {event.name}
            <span className={`badge ${event.status === 'planning' ? 'badge-primary' : event.status === 'confirmed' ? 'badge-success' : 'badge-warning'}`}>
              {event.status}
            </span>
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            {EVENT_TYPE_LABELS[event.event_type]} · {new Date(event.start_date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => api.generatePlan(id).then(() => { toast.success('Plan regenerated!'); loadEvent(); }).catch(() => toast.error('AI not configured'))} className="btn-secondary text-sm">
            <Sparkles className="w-4 h-4" /> Regenerate Plan
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="glass-card-static p-4 text-center">
          <Clock className="w-5 h-5 text-indigo-400 mx-auto mb-1" />
          <div className="text-xl font-bold text-white">{daysUntil}</div>
          <div className="text-xs text-gray-500">Days to go</div>
        </div>
        <div className="glass-card-static p-4 text-center">
          <Users className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
          <div className="text-xl font-bold text-white">{guests.length}</div>
          <div className="text-xs text-gray-500">Guests</div>
        </div>
        <div className="glass-card-static p-4 text-center">
          <CheckCircle2 className="w-5 h-5 text-amber-400 mx-auto mb-1" />
          <div className="text-xl font-bold text-white">{tasks.filter(t => t.status === 'done').length}/{tasks.length}</div>
          <div className="text-xs text-gray-500">Tasks Done</div>
        </div>
        <div className="glass-card-static p-4 text-center">
          <DollarSign className="w-5 h-5 text-pink-400 mx-auto mb-1" />
          <div className="text-xl font-bold text-white">{budgetUsed.toFixed(0)}%</div>
          <div className="text-xs text-gray-500">Budget Used</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 overflow-x-auto pb-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                : 'text-gray-500 hover:text-gray-300 hover:bg-white/[0.02]'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {event.ai_plan ? (
              <>
                {event.ai_plan.weather_advisory && (
                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-sm text-amber-300">
                    {event.ai_plan.weather_advisory}
                  </div>
                )}
                <div className="glass-card-static p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">📅 Timeline</h3>
                  <div className="space-y-3">
                    {event.ai_plan.timeline?.map((phase, i) => (
                      <div key={i} className="flex gap-4 p-3 rounded-lg bg-white/[0.02]">
                        <div className="text-sm font-medium text-indigo-300 w-32 flex-shrink-0">{phase.period}</div>
                        <div>
                          <div className="text-sm font-medium text-white">{phase.phase}</div>
                          <ul className="mt-1 space-y-1">
                            {phase.tasks?.map((task, j) => (
                              <li key={j} className="text-xs text-gray-400">• {task}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                {event.ai_plan.risk_factors && event.ai_plan.risk_factors.length > 0 && (
                  <div className="glass-card-static p-6">
                    <h3 className="text-lg font-semibold text-white mb-3">⚠️ Risk Factors</h3>
                    <ul className="space-y-2">
                      {event.ai_plan.risk_factors.map((risk, i) => (
                        <li key={i} className="text-sm text-gray-400 flex items-start gap-2">
                          <span className="text-amber-400 mt-0.5">•</span> {risk}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            ) : (
              <div className="glass-card-static p-12 text-center">
                <Sparkles className="w-10 h-10 text-indigo-400 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-white mb-2">No AI Plan Yet</h3>
                <p className="text-gray-400 text-sm mb-4">Click &quot;Regenerate Plan&quot; to have AI create a complete event plan.</p>
              </div>
            )}
          </div>
        )}

        {/* Tasks Tab */}
        {activeTab === 'tasks' && (
          <div className="glass-card-static p-6">
            <div className="flex items-center gap-2 mb-4">
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
                className="input-field flex-1 text-sm"
                placeholder="Add a new task..."
              />
              <button onClick={handleAddTask} disabled={addingTask} className="btn-primary text-sm">
                {addingTask ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              </button>
            </div>
            <div className="space-y-2">
              {tasks.length > 0 ? tasks.map(task => (
                <div key={task.id} className={`flex items-center gap-3 p-3 rounded-lg transition-all ${task.status === 'done' ? 'bg-emerald-500/5' : 'bg-white/[0.02]'} hover:bg-white/[0.04]`}>
                  <button onClick={() => handleToggleTask(task)} className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${task.status === 'done' ? 'bg-emerald-500 border-emerald-500' : 'border-gray-600 hover:border-indigo-400'}`}>
                    {task.status === 'done' && <CheckCircle2 className="w-3 h-3 text-white" />}
                  </button>
                  <span className={`text-sm flex-1 ${task.status === 'done' ? 'text-gray-500 line-through' : 'text-gray-300'}`}>{task.title}</span>
                  <span className={`badge text-xs ${task.priority === 'high' || task.priority === 'urgent' ? 'badge-danger' : task.priority === 'medium' ? 'badge-warning' : 'badge-neutral'}`}>{task.priority}</span>
                </div>
              )) : (
                <p className="text-center text-gray-500 text-sm py-8">No tasks yet. Add one above!</p>
              )}
            </div>
          </div>
        )}

        {/* Guests Tab */}
        {activeTab === 'guests' && (
          <div className="glass-card-static p-6">
            <div className="flex items-center gap-2 mb-4">
              <input type="text" value={newGuestName} onChange={(e) => setNewGuestName(e.target.value)} className="input-field flex-1 text-sm" placeholder="Guest name..." />
              <input type="email" value={newGuestEmail} onChange={(e) => setNewGuestEmail(e.target.value)} className="input-field flex-1 text-sm" placeholder="Email (optional)..." />
              <button onClick={handleAddGuest} disabled={addingGuest} className="btn-primary text-sm">
                {addingGuest ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              </button>
            </div>
            {/* RSVP Summary */}
            <div className="grid grid-cols-4 gap-2 mb-4">
              {(['accepted', 'pending', 'declined', 'maybe'] as const).map(status => (
                <div key={status} className={`text-center p-2 rounded-lg ${status === 'accepted' ? 'bg-emerald-500/10' : status === 'declined' ? 'bg-red-500/10' : status === 'maybe' ? 'bg-purple-500/10' : 'bg-amber-500/10'}`}>
                  <div className="text-lg font-bold text-white">{guests.filter(g => g.rsvp_status === status).length}</div>
                  <div className="text-xs text-gray-500 capitalize">{status}</div>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              {guests.length > 0 ? guests.map(guest => (
                <div key={guest.id} className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] hover:bg-white/[0.04]">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                    {guest.name[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-white truncate">{guest.name}</div>
                    <div className="text-xs text-gray-500 truncate">{guest.email || 'No email'}</div>
                  </div>
                  <span className={`badge text-xs ${guest.rsvp_status === 'accepted' ? 'badge-success' : guest.rsvp_status === 'declined' ? 'badge-danger' : guest.rsvp_status === 'maybe' ? 'badge-primary' : 'badge-warning'}`}>
                    {guest.rsvp_status}
                  </span>
                </div>
              )) : (
                <p className="text-center text-gray-500 text-sm py-8">No guests yet. Add them above!</p>
              )}
            </div>
          </div>
        )}

        {/* Budget Tab */}
        {activeTab === 'budget' && (
          <div className="glass-card-static p-6">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Budget Usage</span>
                <span className="text-sm font-semibold text-white">${event.spent_budget?.toLocaleString() || '0'} / ${event.total_budget?.toLocaleString() || '0'}</span>
              </div>
              <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all ${budgetUsed > 90 ? 'bg-red-500' : budgetUsed > 70 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(budgetUsed, 100)}%` }} />
              </div>
            </div>
            {budgetItems.length > 0 ? (
              <div className="space-y-2">
                {budgetItems.map(item => (
                  <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02]">
                    <div>
                      <div className="text-sm text-white">{item.description}</div>
                      <div className="text-xs text-gray-500 capitalize">{item.category}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-white">${item.actual_cost?.toLocaleString() || item.estimated_cost?.toLocaleString() || '0'}</div>
                      <div className={`badge text-xs ${item.is_paid ? 'badge-success' : 'badge-warning'}`}>{item.is_paid ? 'Paid' : 'Pending'}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 text-sm py-8">No budget items yet. Add expenses to track your spending.</p>
            )}
          </div>
        )}

        {/* Vendors Tab */}
        {activeTab === 'vendors' && (
          <div className="glass-card-static p-6">
            {vendors.length > 0 ? (
              <div className="space-y-3">
                {vendors.map(vendor => (
                  <div key={vendor.id} className="flex items-center gap-4 p-4 rounded-lg bg-white/[0.02]">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center text-lg flex-shrink-0">
                      {vendor.category === 'caterer' ? '🍽️' : vendor.category === 'photographer' ? '📷' : vendor.category === 'dj' ? '🎧' : vendor.category === 'decorator' ? '🎨' : vendor.category === 'venue' ? '🏛️' : '📦'}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-white">{vendor.name}</div>
                      <div className="text-xs text-gray-500 capitalize">{vendor.category} · {vendor.address || 'No address'}</div>
                    </div>
                    <span className={`badge text-xs ${vendor.status === 'booked' ? 'badge-success' : vendor.status === 'contacted' ? 'badge-primary' : vendor.status === 'rejected' ? 'badge-danger' : 'badge-neutral'}`}>
                      {vendor.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 text-sm mb-4">No vendors yet.</p>
                <button className="btn-primary text-sm" onClick={() => api.getVendorRecommendations(id).then(res => toast.success('Check AI suggestions!')).catch(() => toast.error('AI not configured'))}>
                  <Sparkles className="w-4 h-4" /> Get AI Recommendations
                </button>
              </div>
            )}
          </div>
        )}

        {/* Marketing Tab */}
        {activeTab === 'marketing' && (
          <div className="glass-card-static p-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
              {(['instagram', 'linkedin', 'facebook', 'twitter', 'email', 'poster'] as const).map(platform => (
                <button
                  key={platform}
                  onClick={() => api.generateMarketingContent({ event_id: id, platform, tone: 'professional' }).then(() => toast.success(`${platform} content generated!`)).catch(() => toast.error('AI not configured'))}
                  className="glass-card p-4 text-center text-sm"
                >
                  <div className="text-2xl mb-1">
                    {platform === 'instagram' ? '📸' : platform === 'linkedin' ? '💼' : platform === 'facebook' ? '📘' : platform === 'twitter' ? '🐦' : platform === 'email' ? '📧' : '🖼️'}
                  </div>
                  <span className="text-gray-400 capitalize">{platform}</span>
                </button>
              ))}
            </div>
            <p className="text-center text-gray-500 text-sm">Click a platform to generate AI marketing content.</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
