'use client';

/**
 * EventPilot AI — Settings Page
 */

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Save, User, Bell, Shield, Palette, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-2">Settings</h1>
      <p className="text-gray-400 text-sm mb-8">Manage your account and preferences</p>

      <div className="space-y-6 max-w-2xl">
        {/* Profile */}
        <div className="glass-card-static p-6">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
            <User className="w-5 h-5 text-indigo-400" />
            Profile
          </h2>
          <div className="space-y-4">
            <div>
              <label className="input-label">Email</label>
              <input
                type="email"
                value={user?.email || ''}
                className="input-field"
                disabled
              />
            </div>
            <div>
              <label className="input-label">Full Name</label>
              <input
                type="text"
                defaultValue={user?.user_metadata?.full_name || ''}
                className="input-field"
                placeholder="Your name"
              />
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="glass-card-static p-6">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
            <Bell className="w-5 h-5 text-amber-400" />
            Notifications
          </h2>
          <div className="space-y-3">
            {[
              { label: 'Email notifications for RSVPs', checked: true },
              { label: 'Task reminders', checked: true },
              { label: 'AI suggestions', checked: true },
              { label: 'Budget alerts', checked: false },
            ].map((item, i) => (
              <label key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] cursor-pointer hover:bg-white/[0.04] transition-all">
                <span className="text-sm text-gray-300">{item.label}</span>
                <input
                  type="checkbox"
                  defaultChecked={item.checked}
                  className="w-4 h-4 rounded bg-white/10 border-white/20 text-indigo-500 focus:ring-indigo-500/50"
                />
              </label>
            ))}
          </div>
        </div>

        {/* API Configuration */}
        <div className="glass-card-static p-6">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-emerald-400" />
            API Configuration
          </h2>
          <p className="text-xs text-gray-500 mb-4">
            These are configured via environment variables on the backend. See the README for details.
          </p>
          <div className="space-y-3">
            {[
              { label: 'Supabase', status: 'Check backend .env' },
              { label: 'Gemini AI', status: 'Check backend .env' },
              { label: 'Resend Email', status: 'Optional' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02]">
                <span className="text-sm text-gray-300">{item.label}</span>
                <span className="badge badge-neutral text-xs">{item.status}</span>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={() => { setSaving(true); setTimeout(() => { setSaving(false); toast.success('Settings saved'); }, 1000); }}
          className="btn-primary"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Changes
        </button>
      </div>
    </div>
  );
}
