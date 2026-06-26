'use client';

/**
 * EventPilot AI — Landing Page
 * Premium marketing page with glassmorphism design.
 */

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Sparkles, Calendar, Users, MapPin, Zap, Shield, ArrowRight, Star, CheckCircle2
} from 'lucide-react';

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
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-primary brand-title">EventPilot <span className="brand-accent">AI</span></span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#services" className="text-sm text-gray-500 hover:text-primary transition-colors">Services</a>
            <a href="#events" className="text-sm text-gray-500 hover:text-primary transition-colors">Event Types</a>
            <a href="#testimonials" className="text-sm text-gray-500 hover:text-primary transition-colors">Testimonials</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="btn-ghost text-sm">Log In</Link>
            <Link href="/signup" className="btn-primary text-sm">Get Started Free</Link>
          </div>
        </div>
      </nav>

      {/* Hero & Services Section */}
      <section id="services" className="relative pt-32 pb-20 px-6 min-h-screen flex items-center">
        <div className="absolute inset-0 bg-gradient-mesh pointer-events-none" />
        
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          
          {/* Left Column (Hero copy + brand design) - takes 7 cols on lg */}
          <div className="lg:col-span-7 space-y-8 text-left">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-pink-500/20 bg-pink-500/5">
                <Zap className="w-4 h-4 text-primary-500" />
                <span className="text-sm text-primary-600 font-medium">Powered by Google Gemini AI</span>
              </div>

              {/* Breathtaking structured editorial title inspired by reference image */}
              <div className="space-y-1 select-none">
                <h1 className="brand-title text-6xl md:text-8xl font-black tracking-tight leading-none text-primary">
                  EVENT
                </h1>
                <h1 className="brand-title text-6xl md:text-8xl font-black tracking-tight leading-none text-primary">
                  DESIGNING
                </h1>
                <h1 className="font-editorial italic font-normal text-accent-500 text-6xl md:text-9xl leading-none pl-12 md:pl-28 -mt-2">
                  Company
                </h1>
              </div>

              <p className="text-lg md:text-xl text-gray-500 max-w-xl leading-relaxed">
                From weddings to corporate conferences, EventPilot AI handles end-to-end planning, budgeting, vendors, guests, and marketing — so you can focus on creating unforgettable experiences.
              </p>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-4">
                <Link
                  href="/signup"
                  className="btn-primary text-base px-8 py-3.5 group"
                >
                  Start Planning Free
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/login"
                  className="btn-secondary text-base px-8 py-3.5"
                >
                  Watch Demo
                </Link>
              </div>
            </motion.div>

            {/* Clean Gold-lined Stats Box */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-8 border-t border-surface-300 max-w-2xl"
            >
              {stats.map((stat, i) => (
                <div key={i} className="text-left border-l-2 border-accent-400 pl-4 py-2">
                  <div className="text-2xl font-bold text-primary">{stat.value}</div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold mt-0.5">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right Column (OUR SERVICES editorial card) - takes 5 cols on lg */}
          <div className="lg:col-span-5 w-full">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="editorial-card w-full shadow-2xl"
            >
              <h2 className="editorial-header">
                OUR SERVICES
              </h2>
              <div className="editorial-list">
                {[
                  { num: '01', title: 'Concept & Theme Development', desc: 'AI-generated timelines, schedules, and custom checklists' },
                  { num: '02', title: 'Budget Planning & Management', desc: 'Real-time expense logs and smart spending recommendations' },
                  { num: '03', title: 'Venue & Vendor Coordination', desc: 'Map integration and smart recommendation engines' },
                  { num: '04', title: 'AI Marketing & Copywriting', desc: 'Automated captions, emails, and flyers generated for any platform' },
                  { num: '05', title: 'Guest & Logistics Management', desc: 'Digital QR ticketing, check-in, and auto-invitation emails' },
                  { num: '06', title: 'On-Ground Schedule Execution', desc: 'Hour-by-hour itineraries with calendar sync notifications' },
                ].map((service, index) => (
                  <div key={index} className="editorial-item">
                    <div className="editorial-left">
                      <span className="editorial-num">{service.num}.</span>
                      <div>
                        <span className="editorial-content block">{service.title}</span>
                        <span className="text-xs text-gray-500 block mt-0.5">{service.desc}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
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
