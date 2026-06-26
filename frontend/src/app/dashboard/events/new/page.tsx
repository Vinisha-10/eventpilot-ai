'use client';

/**
 * EventPilot AI — Event Creation Wizard
 * 7-step wizard: Name → Date → Venue → Budget → Guests → Theme → Requirements
 * AI generates a complete plan after submission.
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api';
import { EVENT_TYPE_LABELS } from '@/types';
import type { EventType, EventWizardData } from '@/types';
import {
  ArrowLeft, ArrowRight, Sparkles, Calendar, MapPin, DollarSign,
  Users, Palette, FileText, Loader2, Check, PartyPopper
} from 'lucide-react';
import toast from 'react-hot-toast';

const steps = [
  { id: 1, title: 'Event Details', icon: PartyPopper, description: 'Name and type of your event' },
  { id: 2, title: 'Date & Time', icon: Calendar, description: 'When is the event happening?' },
  { id: 3, title: 'Venue', icon: MapPin, description: 'Where will it take place?' },
  { id: 4, title: 'Budget', icon: DollarSign, description: 'Set your total budget' },
  { id: 5, title: 'Guests', icon: Users, description: 'Expected number of guests' },
  { id: 6, title: 'Theme', icon: Palette, description: 'Style and theme preferences' },
  { id: 7, title: 'Requirements', icon: FileText, description: 'Any special requirements' },
];

const eventTypes: EventType[] = [
  'wedding', 'birthday', 'college_festival', 'corporate',
  'conference', 'workshop', 'exhibition', 'music_show', 'community', 'other',
];

export default function NewEventPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [generatingPlan, setGeneratingPlan] = useState(false);

  const [data, setData] = useState<EventWizardData>({
    name: '',
    event_type: 'corporate',
    start_date: '',
    end_date: '',
    venue_name: '',
    venue_address: '',
    total_budget: 5000,
    max_guests: 100,
    theme: '',
    special_requirements: '',
  });

  const updateData = (field: keyof EventWizardData, value: string | number) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 7));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const canProceed = () => {
    switch (currentStep) {
      case 1: return data.name.trim().length > 0;
      case 2: return data.start_date.length > 0;
      default: return true;
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const eventData = {
        ...data,
        start_date: new Date(data.start_date).toISOString(),
        end_date: data.end_date ? new Date(data.end_date).toISOString() : undefined,
      };

      const res = await api.createEvent(eventData);
      const event = res.data as { id: string };

      if (event?.id) {
        toast.success('Event created! Generating AI plan...');
        setGeneratingPlan(true);

        try {
          await api.generatePlan(event.id);
          toast.success('AI plan generated! 🎉');
        } catch {
          toast.error('Plan generation will be available when AI is configured');
        }

        router.push(`/dashboard/events/${event.id}`);
      }
    } catch (error) {
      toast.error('Failed to create event. Please check your Supabase configuration.');
    } finally {
      setLoading(false);
      setGeneratingPlan(false);
    }
  };

  const slideVariants = {
    enter: { x: 30, opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: { x: -30, opacity: 0 },
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <button onClick={() => router.back()} className="btn-ghost text-sm mb-4">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <Sparkles className="w-7 h-7 text-indigo-400" />
          Create New Event
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Complete the wizard and our AI will generate a complete event plan for you.
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center gap-1 mb-8 overflow-x-auto pb-2">
        {steps.map((step, i) => (
          <div key={step.id} className="flex items-center">
            <div
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                currentStep === step.id
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                  : currentStep > step.id
                  ? 'text-emerald-400'
                  : 'text-gray-600'
              }`}
              onClick={() => step.id < currentStep && setCurrentStep(step.id)}
            >
              {currentStep > step.id ? (
                <Check className="w-4 h-4" />
              ) : (
                <step.icon className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">{step.title}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={`w-6 h-px mx-1 ${currentStep > step.id ? 'bg-emerald-500' : 'bg-gray-700'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Form Content */}
      <div className="glass-card-static p-8 max-w-2xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3 }}
          >
            {/* Step 1: Event Details */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <label htmlFor="event-name" className="input-label">Event Name *</label>
                  <input
                    id="event-name"
                    type="text"
                    value={data.name}
                    onChange={(e) => updateData('name', e.target.value)}
                    className="input-field"
                    placeholder="My Amazing Event"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="input-label">Event Type *</label>
                  <div className="grid grid-cols-2 gap-2">
                    {eventTypes.map(type => (
                      <button
                        key={type}
                        onClick={() => updateData('event_type', type)}
                        className={`p-3 rounded-xl text-sm text-left transition-all ${
                          data.event_type === type
                            ? 'bg-indigo-500/20 border border-indigo-500/40 text-indigo-300'
                            : 'bg-white/[0.02] border border-white/5 text-gray-400 hover:bg-white/[0.05]'
                        }`}
                      >
                        {EVENT_TYPE_LABELS[type]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Date */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <label htmlFor="start-date" className="input-label">Start Date & Time *</label>
                  <input
                    id="start-date"
                    type="datetime-local"
                    value={data.start_date}
                    onChange={(e) => updateData('start_date', e.target.value)}
                    className="input-field"
                  />
                </div>
                <div>
                  <label htmlFor="end-date" className="input-label">End Date & Time (optional)</label>
                  <input
                    id="end-date"
                    type="datetime-local"
                    value={data.end_date}
                    onChange={(e) => updateData('end_date', e.target.value)}
                    className="input-field"
                  />
                </div>
              </div>
            )}

            {/* Step 3: Venue */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <label htmlFor="venue-name" className="input-label">Venue Name</label>
                  <input
                    id="venue-name"
                    type="text"
                    value={data.venue_name}
                    onChange={(e) => updateData('venue_name', e.target.value)}
                    className="input-field"
                    placeholder="Grand Ballroom Hotel"
                  />
                </div>
                <div>
                  <label htmlFor="venue-address" className="input-label">Venue Address</label>
                  <input
                    id="venue-address"
                    type="text"
                    value={data.venue_address}
                    onChange={(e) => updateData('venue_address', e.target.value)}
                    className="input-field"
                    placeholder="123 Main St, City, State"
                  />
                </div>
                <p className="text-xs text-gray-500">
                  💡 You can search for venues later using our AI-powered vendor discovery.
                </p>
              </div>
            )}

            {/* Step 4: Budget */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div>
                  <label htmlFor="budget" className="input-label">Total Budget (USD)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      id="budget"
                      type="number"
                      value={data.total_budget}
                      onChange={(e) => updateData('total_budget', Number(e.target.value))}
                      className="input-field pl-11"
                      min={0}
                      step={100}
                    />
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {[1000, 5000, 10000, 25000, 50000, 100000].map(val => (
                    <button
                      key={val}
                      onClick={() => updateData('total_budget', val)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        data.total_budget === val
                          ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                          : 'bg-white/[0.02] text-gray-500 border border-white/5 hover:bg-white/[0.05]'
                      }`}
                    >
                      ${val.toLocaleString()}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500">
                  💡 Our AI will help you optimize spending within your budget.
                </p>
              </div>
            )}

            {/* Step 5: Guests */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <div>
                  <label htmlFor="guests" className="input-label">Expected Number of Guests</label>
                  <input
                    id="guests"
                    type="number"
                    value={data.max_guests}
                    onChange={(e) => updateData('max_guests', Number(e.target.value))}
                    className="input-field"
                    min={1}
                  />
                </div>
                <div className="flex gap-2 flex-wrap">
                  {[20, 50, 100, 200, 500, 1000].map(val => (
                    <button
                      key={val}
                      onClick={() => updateData('max_guests', val)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        data.max_guests === val
                          ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                          : 'bg-white/[0.02] text-gray-500 border border-white/5 hover:bg-white/[0.05]'
                      }`}
                    >
                      {val} guests
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 6: Theme */}
            {currentStep === 6 && (
              <div className="space-y-6">
                <div>
                  <label htmlFor="theme" className="input-label">Event Theme / Style</label>
                  <input
                    id="theme"
                    type="text"
                    value={data.theme}
                    onChange={(e) => updateData('theme', e.target.value)}
                    className="input-field"
                    placeholder="e.g., Rustic Garden, Modern Minimalist, Tropical..."
                  />
                </div>
                <div className="flex gap-2 flex-wrap">
                  {['Elegant Classic', 'Modern Minimalist', 'Rustic Garden', 'Bohemian', 'Tropical Paradise', 'Tech Forward', 'Vintage', 'Black & Gold'].map(t => (
                    <button
                      key={t}
                      onClick={() => updateData('theme', t)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        data.theme === t
                          ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                          : 'bg-white/[0.02] text-gray-500 border border-white/5 hover:bg-white/[0.05]'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 7: Requirements */}
            {currentStep === 7 && (
              <div className="space-y-6">
                <div>
                  <label htmlFor="requirements" className="input-label">Special Requirements</label>
                  <textarea
                    id="requirements"
                    value={data.special_requirements}
                    onChange={(e) => updateData('special_requirements', e.target.value)}
                    className="input-field min-h-[120px] resize-y"
                    placeholder="e.g., Wheelchair accessibility, dietary restrictions, specific entertainment, parking needs..."
                  />
                </div>
                <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                  <p className="text-sm text-indigo-300 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    After creating, our AI will generate a complete event plan including timeline, checklist, budget breakdown, and vendor suggestions!
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/5">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className="btn-secondary text-sm disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-4 h-4" /> Previous
          </button>

          {currentStep < 7 ? (
            <button
              onClick={nextStep}
              disabled={!canProceed()}
              className="btn-primary text-sm disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Next <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading || !canProceed()}
              className="btn-primary text-sm disabled:opacity-30"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {generatingPlan ? 'Generating AI Plan...' : 'Creating...'}
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Create Event & Generate Plan
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
