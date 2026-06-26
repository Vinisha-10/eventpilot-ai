'use client';

/**
 * EventPilot AI — Landing Page
 * Premium marketing page with glassmorphism design.
 */

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Sparkles, Calendar, Users, BarChart3, MessageSquare,
  MapPin, Zap, Shield, ArrowRight, Star, CheckCircle2
} from 'lucide-react';

const features = [
  {
    icon: <Sparkles className="w-6 h-6" />,
    title: 'AI-Powered Planning',
    description: 'Generate complete event plans with timelines, checklists, and milestones in seconds.',
    color: 'from-violet-500 to-purple-500',
  },
  {
    icon: <BarChart3 className="w-6 h-6" />,
    title: 'Smart Budget Tracking',
    description: 'AI analyzes your spending and suggests optimizations to save money.',
    color: 'from-emerald-500 to-teal-500',
  },
  {
    icon: <MapPin className="w-6 h-6" />,
    title: 'Vendor Discovery',
    description: 'Find and compare vendors nearby with ratings, pricing, and AI recommendations.',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: 'Guest Management',
    description: 'QR tickets, RSVP tracking, seating plans, and automated invitation emails.',
    color: 'from-pink-500 to-rose-500',
  },
  {
    icon: <MessageSquare className="w-6 h-6" />,
    title: 'AI Chat Assistant',
    description: '"Plan my wedding" — just ask. Our AI understands natural language commands.',
    color: 'from-amber-500 to-orange-500',
  },
  {
    icon: <Calendar className="w-6 h-6" />,
    title: 'Auto Scheduling',
    description: 'Intelligent scheduling with calendar sync, reminders, and conflict detection.',
    color: 'from-indigo-500 to-blue-500',
  },
];

const eventTypes = [
  '💒 Weddings', '🎂 Birthday Parties', '🎓 College Festivals',
  '💼 Corporate Events', '🎤 Conferences', '🔧 Workshops',
  '🎨 Exhibitions', '🎵 Music Shows', '🤝 Community Events',
];

const stats = [
  { value: '10K+', label: 'Events Planned' },
  { value: '50K+', label: 'Happy Guests' },
  { value: '99%', label: 'Satisfaction' },
  { value: '24/7', label: 'AI Available' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass-card-static" style={{ borderRadius: 0, borderTop: 'none', borderLeft: 'none', borderRight: 'none' }}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-white">EventPilot<span className="text-indigo-400">AI</span></span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-gray-400 hover:text-white transition-colors">Features</a>
            <a href="#events" className="text-sm text-gray-400 hover:text-white transition-colors">Event Types</a>
            <a href="#testimonials" className="text-sm text-gray-400 hover:text-white transition-colors">Testimonials</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="btn-ghost text-sm">Log In</Link>
            <Link href="/signup" className="btn-primary text-sm">Get Started Free</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="absolute inset-0 bg-gradient-mesh" />
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 mb-8">
              <Zap className="w-4 h-4 text-indigo-400" />
              <span className="text-sm text-indigo-300">Powered by Google Gemini AI</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="text-white">Plan Any Event</span>
              <br />
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                With AI Superpowers
              </span>
            </h1>

            <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              From weddings to conferences, EventPilot AI handles planning, budgeting, vendors, 
              guests, and marketing — so you can focus on creating unforgettable experiences.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/signup"
                className="btn-primary text-base px-8 py-3 group"
              >
                Start Planning Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/login"
                className="btn-secondary text-base px-8 py-3"
              >
                Watch Demo
              </Link>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20"
          >
            {stats.map((stat, i) => (
              <div key={i} className="glass-card p-6 text-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Everything You Need to Plan
              <span className="text-indigo-400"> Perfect Events</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Six intelligent AI agents work together to handle every aspect of your event.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="glass-card p-8 group cursor-default"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Event Types */}
      <section id="events" className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Built for <span className="text-indigo-400">Every</span> Occasion
          </h2>
          <p className="text-gray-400 mb-12">
            Specialized AI plans tailored to each event type.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {eventTypes.map((type, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className="glass-card px-5 py-3 text-sm text-gray-300 hover:text-white cursor-default"
              >
                {type}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-12 text-center">
            Loved by <span className="text-indigo-400">Event Planners</span>
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: 'Sarah Johnson', role: 'Wedding Planner', text: 'EventPilot AI cut my planning time in half. The AI suggestions are incredibly accurate and the guest management is seamless.' },
              { name: 'Marcus Chen', role: 'Conference Organizer', text: 'Managing 500+ attendees used to be a nightmare. Now the AI handles scheduling, RSVPs, and vendor coordination effortlessly.' },
              { name: 'Priya Sharma', role: 'Event Coordinator', text: 'The budget optimization alone saved us 20% on our last corporate event. The AI marketing content generator is a game-changer.' },
            ].map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="glass-card p-8"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-gray-300 text-sm leading-relaxed mb-6">&ldquo;{t.text}&rdquo;</p>
                <div>
                  <div className="font-semibold text-white text-sm">{t.name}</div>
                  <div className="text-xs text-gray-500">{t.role}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="glass-card p-12 md:p-16 text-center animate-pulse-glow">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Plan Your Next Event?
            </h2>
            <p className="text-gray-400 mb-8 max-w-xl mx-auto">
              Join thousands of event planners using AI to create extraordinary experiences. 
              Start free — no credit card required.
            </p>
            <Link href="/signup" className="btn-primary text-base px-10 py-4 group">
              Get Started Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <div className="flex items-center justify-center gap-6 mt-8 text-sm text-gray-500">
              <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Free forever plan</span>
              <span className="flex items-center gap-1"><Shield className="w-4 h-4 text-emerald-500" /> Secure & private</span>
              <span className="flex items-center gap-1"><Zap className="w-4 h-4 text-emerald-500" /> AI-powered</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-semibold text-gray-400">EventPilot AI</span>
          </div>
          <p className="text-xs text-gray-600">
            © 2026 EventPilot AI. Built with ❤️ and AI.
          </p>
        </div>
      </footer>
    </div>
  );
}
