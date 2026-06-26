'use client';

/**
 * Eventra AI — Landing Page
 * Redesigned with the structural sections of confettieventco.org,
 * in a premium light pink and white color palette.
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import {
  Sparkles, Calendar, Users, MapPin, Zap, Shield, ArrowRight,
  CheckCircle2, Mail, Phone, Clock, ChevronDown, Check
} from 'lucide-react';
import toast from 'react-hot-toast';

const servicesList = [
  {
    icon: '💍',
    title: 'Weddings & Celebrations',
    desc: 'From mehndi to reception — AI timeline generation, guest seat registries, vendor matching, and budget optimization tools.',
    price: 'Free plan access'
  },
  {
    icon: '🏢',
    title: 'Corporate Events',
    desc: 'Product launches, offsites, seminars, and conferences with interactive run-sheets, AI copywriting, and ticketing tools.',
    price: 'Pro features included'
  },
  {
    icon: '🎉',
    title: 'Private Parties',
    desc: 'Birthdays, anniversaries, and milestone events with custom checklists, digital invitation templates, and real-time expense logs.',
    price: 'Free plan access'
  },
  {
    icon: '🗂️',
    title: 'On-Day Coordination',
    desc: 'Hour-by-hour itineraries synced directly to your calendar, real-time task check-offs, and team notifications.',
    price: 'Included in dashboard'
  }
];

const faqs = [
  {
    question: 'How does the AI plan my event?',
    answer: 'Simply enter your event type, date, location, guest count, and budget. Eventra AI instantly creates an interactive hour-by-hour itinerary, a custom checklist of items, and budget category allocations which you can edit at any time.'
  },
  {
    question: 'Is it completely free to sign up?',
    answer: 'Yes! Eventra AI is free to start. You can create multiple events, track budgets, invite guests, and generate AI schedules. Professional features like advanced API integrations or exports are also available.'
  },
  {
    question: 'Can I coordinate guest lists and tickets?',
    answer: 'Absolutely. You can import your guest list, send email invitations, track RSVP statuses, and generate secure digital tickets with QR codes for seamless check-in on the day.'
  },
  {
    question: 'How does vendor management work?',
    answer: 'You can search nearby vendors and venues on our interactive maps, store contact details, record quotes, link invoices, and evaluate options inside your project dashboard.'
  }
];

const eventTypes = [
  'Weddings', 'Birthday Parties', 'College Festivals', 'Corporate Offsites',
  'Seminars', 'Workshops', 'Exhibitions', 'Music Concerts', 'Anniversaries'
];

export default function LandingPage() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      toast.success("Thank you! Your event inquiry has been sent. We'll get back to you shortly.");
      setName('');
      setPhone('');
      setEmail('');
      setMessage('');
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#faf3f4]">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass-card-static border-t-0 border-x-0 rounded-none bg-white/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-primary brand-title">Eventra <span className="brand-accent">AI</span></span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#services" className="text-sm font-semibold text-gray-500 hover:text-primary transition-colors">Services</a>
            <a href="#about" className="text-sm font-semibold text-gray-500 hover:text-primary transition-colors">About</a>
            <a href="#gallery" className="text-sm font-semibold text-gray-500 hover:text-primary transition-colors">Gallery</a>
            <a href="#faq" className="text-sm font-semibold text-gray-500 hover:text-primary transition-colors">FAQ</a>
            <a href="#contact" className="text-sm font-semibold text-gray-500 hover:text-primary transition-colors">Contact</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="btn-ghost text-sm font-semibold">Log In</Link>
            <a href="#contact" className="btn-primary text-sm font-semibold">Plan your event</a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 min-h-screen flex items-center bg-gradient-mesh">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Hero copy */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-pink-500/20 bg-pink-500/5">
              <Zap className="w-4 h-4 text-primary-500" />
              <span className="text-sm text-primary-600 font-semibold uppercase tracking-wider">AI-Powered Event & Wedding Planning</span>
            </div>

            {/* Overlapping title composition from reference image */}
            <div className="relative inline-block pb-6 select-none">
              <h1 className="brand-title text-7xl md:text-8xl font-black tracking-tight leading-none text-primary">
                EVENTRA
              </h1>
              <span className="brand-script text-6xl md:text-8xl absolute -bottom-3 md:-bottom-5 right-2 md:right-8 transform translate-x-2">
                AI
              </span>
            </div>

            <h2 className="text-2xl md:text-3xl font-normal font-serif italic text-accent-600 mt-2">
              Your big events, flawlessly orchestrated.
            </h2>

            <p className="text-base md:text-lg text-gray-500 max-w-xl leading-relaxed">
              Plan weddings, conferences, or parties end-to-end. Instantly generate timelines, checklists, budget projections, guest ticketing QR codes, and social media copy — powered by Google Gemini AI.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-4">
              <Link href="/signup" className="btn-primary text-base px-8 py-3.5 group justify-center text-center">
                Get Started Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a href="#contact" className="btn-secondary text-base px-8 py-3.5 justify-center text-center">
                Plan Your Event
              </a>
            </div>
          </div>

          {/* Right Visual Image Column */}
          <div className="lg:col-span-5 relative w-full flex justify-center">
            <div className="relative w-full max-w-md h-[480px] rounded-2xl overflow-hidden shadow-2xl border-4 border-white transform rotate-1 hover:rotate-0 transition-transform duration-500">
              <Image
                src="/event_hero.png"
                alt="Eventra AI Floral Setting"
                fill
                priority
                className="object-cover"
                sizes="(max-w-768px) 100vw, 500px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 text-white text-left">
                <span className="text-xs uppercase tracking-widest text-pink-200 font-semibold">Live Setting Showcase</span>
                <h3 className="text-lg font-bold text-white mt-1">Stunning Decors & Flawless Coordination</h3>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pillars Section (replacing fake metrics stats) */}
      <section className="py-12 bg-white border-y border-surface-300">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="flex flex-col items-center text-center p-3 border-r last:border-r-0 border-surface-300">
            <span className="text-3xl mb-1">🎁</span>
            <span className="text-sm font-bold text-primary uppercase tracking-wide">Free Plan</span>
            <span className="text-xs text-gray-500 mt-1">Start planning immediately at no cost</span>
          </div>
          <div className="flex flex-col items-center text-center p-3 border-r last:border-r-0 border-surface-300">
            <span className="text-3xl mb-1">🔒</span>
            <span className="text-sm font-bold text-primary uppercase tracking-wide">Secure Data</span>
            <span className="text-xs text-gray-500 mt-1">Secure budget logs & guest details</span>
          </div>
          <div className="flex flex-col items-center text-center p-3 border-r last:border-r-0 border-surface-300">
            <span className="text-3xl mb-1">⚡</span>
            <span className="text-sm font-bold text-primary uppercase tracking-wide">Gemini AI</span>
            <span className="text-xs text-gray-500 mt-1">Hour-by-hour timeline generation</span>
          </div>
          <div className="flex flex-col items-center text-center p-3">
            <span className="text-3xl mb-1">🎫</span>
            <span className="text-sm font-bold text-primary uppercase tracking-wide">QR Check-in</span>
            <span className="text-xs text-gray-500 mt-1">Generate digital guest tickets</span>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center max-w-xl mx-auto mb-16">
          <span className="text-xs uppercase tracking-widest text-accent-600 font-bold">WHAT WE OFFER</span>
          <h2 className="text-4xl font-extrabold text-primary tracking-tight mt-2">Services</h2>
          <p className="text-gray-500 mt-4">
            AI-driven workflows designed for any event type, giving you end-to-end execution support.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {servicesList.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="editorial-card relative overflow-hidden flex flex-col justify-between"
            >
              <div>
                <div className="text-4xl mb-4">{service.icon}</div>
                <h3 className="text-lg font-bold text-primary uppercase tracking-wider mb-2">{service.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-6">{service.desc}</p>
              </div>
              <div className="pt-4 border-t border-surface-300 flex items-center justify-between">
                <span className="text-xs text-accent-500 uppercase tracking-widest font-bold">{service.price}</span>
                <Link href="/signup" className="text-xs text-primary font-bold hover:text-pink-600 flex items-center gap-1">
                  Start Plan <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 px-6 bg-white border-t border-surface-300">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* About Image Showcase */}
          <div className="relative w-full h-[500px] rounded-2xl overflow-hidden shadow-xl border-4 border-white transform -rotate-1 hover:rotate-0 transition-transform duration-500">
            <Image
              src="/gallery_4.jpg"
              alt="Elegant Outdoor Setup"
              fill
              className="object-cover"
              sizes="(max-w-768px) 100vw, 600px"
            />
          </div>

          {/* About Details */}
          <div className="space-y-6 text-left">
            <span className="text-xs uppercase tracking-widest text-accent-600 font-bold">ABOUT</span>
            <h2 className="text-4xl font-extrabold text-primary mt-2">Eventra AI</h2>
            <p className="text-gray-500 leading-relaxed">
              Eventra AI is an advanced planning dashboard that handles the details you shouldn&apos;t have to — timelines, budget records, guest tickets, and checklists — so your events flow smoothly.
            </p>
            <p className="text-gray-500 leading-relaxed">
              From intimate celebrations to weddings and corporate launches, our AI-powered features let you build checklists, discover vendors, coordinate details, and execute with precision.
            </p>

            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
              {[
                'AI-generated schedules & check-lists',
                'Real-time budget logs',
                'Dedicated task Kanban boards',
                'Guest QR codes and invitation status',
                'Vendor discovery and map integrations',
                'Social copywriting generated in seconds'
              ].map((bullet, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-gray-500">
                  <div className="w-5 h-5 rounded-full bg-pink-100 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3.5 h-3.5 text-pink-600" />
                  </div>
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section id="gallery" className="py-24 px-6 border-t border-surface-300">
        <div className="max-w-7xl mx-auto text-center">
          <span className="text-xs uppercase tracking-widest text-accent-600 font-bold">GALLERY</span>
          <h2 className="text-4xl font-extrabold text-primary tracking-tight mt-2 mb-12">In Action</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { src: '/gallery_1.jpg', tag: 'Pavilion Arrangement' },
              { src: '/gallery_2.jpg', tag: 'Floral Garlands' },
              { src: '/gallery_3.jpg', tag: 'Warm Aesthetics', isGradient: true },
              { src: '/gallery_4.jpg', tag: 'Pathway Path' }
            ].map((img, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="group relative h-[360px] rounded-2xl overflow-hidden shadow-md border-4 border-white hover:shadow-xl transition-all duration-300 cursor-default"
              >
                {img.isGradient ? (
                  <div className="absolute inset-0 bg-gradient-to-br from-pink-300 via-rose-200 to-amber-200 p-8 flex flex-col justify-between items-center text-center">
                    <Sparkles className="w-8 h-8 text-primary/40 mt-8" />
                    <span className="text-sm font-serif italic text-primary-900 leading-relaxed font-semibold">
                      &ldquo;Designing events that sparkle and live in memories forever.&rdquo;
                    </span>
                    <span className="text-xs uppercase tracking-widest text-primary-700 font-bold mb-4">{img.tag}</span>
                  </div>
                ) : (
                  <>
                    <Image
                      src={img.src}
                      alt={img.tag}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-w-768px) 100vw, 300px"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <span className="text-white text-xs uppercase tracking-widest font-bold border border-white/40 px-4 py-2 rounded-full backdrop-blur-sm">
                        {img.tag}
                      </span>
                    </div>
                  </>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 px-6 bg-white border-t border-surface-300">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs uppercase tracking-widest text-accent-600 font-bold">HELP CENTER</span>
            <h2 className="text-4xl font-extrabold text-primary tracking-tight mt-2">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <details
                key={index}
                className="group border border-surface-300 rounded-xl bg-[#faf3f4]/30 overflow-hidden [&_summary::-webkit-details-marker]:hidden"
              >
                <summary className="flex items-center justify-between p-5 cursor-pointer text-primary hover:bg-[#faf3f4]/60 transition-colors">
                  <span className="text-base font-bold text-left tracking-wide">{faq.question}</span>
                  <ChevronDown className="w-5 h-5 text-gray-500 transition-transform duration-300 group-open:-rotate-180" />
                </summary>
                <div className="p-5 border-t border-surface-300 bg-white text-sm text-gray-500 leading-relaxed text-left">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Supported Event Categories served chips (like confettieventco served areas) */}
      <section className="py-12 bg-white border-t border-surface-300">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-xs uppercase tracking-widest text-gray-400 font-bold mb-4">Event Types We Power</p>
          <div className="flex flex-wrap justify-center gap-2 max-w-3xl mx-auto">
            {eventTypes.map((type, i) => (
              <span key={i} className="px-4 py-2 rounded-full text-xs font-semibold text-primary bg-[#faf3f4] border border-surface-300 hover:border-pink-300 transition-all cursor-default">
                {type}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 px-6 border-t border-surface-300">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Form Side */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <span className="text-xs uppercase tracking-widest text-accent-600 font-bold">GET IN TOUCH</span>
            <h2 className="text-4xl font-extrabold text-primary tracking-tight">Tell us about your event</h2>

            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="contact-name" className="input-label">Your Name</label>
                  <input
                    id="contact-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="E.g., John Doe"
                    className="input-field"
                    suppressHydrationWarning
                  />
                </div>
                <div>
                  <label htmlFor="contact-phone" className="input-label">Phone Number</label>
                  <input
                    id="contact-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="E.g., +91 99300 48820"
                    className="input-field"
                    suppressHydrationWarning
                  />
                </div>
              </div>
              <div>
                <label htmlFor="contact-email" className="input-label">Email Address</label>
                <input
                  id="contact-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="E.g., you@example.com"
                  className="input-field"
                  suppressHydrationWarning
                />
              </div>
              <div>
                <label htmlFor="contact-message" className="input-label">What are you planning?</label>
                <textarea
                  id="contact-message"
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us about the event date, type, guest count, or any custom requests..."
                  className="input-field resize-none"
                  suppressHydrationWarning
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full sm:w-auto px-8 py-3"
                suppressHydrationWarning
              >
                {loading ? 'Sending Inquiry...' : 'Submit Inquiry'}
              </button>
            </form>
          </div>

          {/* Contact Details Side */}
          <aside className="lg:col-span-5 glass-card-static p-8 text-left flex flex-col justify-between">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-primary uppercase tracking-wider mb-2">Eventra AI Planning Studio</h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Unit 5, Tech Park, Linking Road<br />
                  Khar West, Mumbai, Maharashtra 400052
                </p>
              </div>

              <div className="space-y-3">
                <p className="flex items-center gap-3 text-sm text-gray-500">
                  <Phone className="w-4 h-4 text-pink-500" />
                  <a href="tel:+919930048820" className="hover:text-primary transition-colors">+91 99300 48820</a>
                </p>
                <p className="flex items-center gap-3 text-sm text-gray-500">
                  <Mail className="w-4 h-4 text-pink-500" />
                  <a href="mailto:hello@eventra.ai" className="hover:text-primary transition-colors">hello@eventra.ai</a>
                </p>
                <p className="flex items-center gap-3 text-sm text-gray-500">
                  <Clock className="w-4 h-4 text-pink-500" />
                  <span>Mon – Sat: 10:00 AM – 7:00 PM</span>
                </p>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-surface-300 text-xs text-gray-400">
              Inquiries are analyzed in real time by our AI engine to compile initial checklists and timelines.
            </div>
          </aside>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-surface-300 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-semibold text-gray-400">Eventra AI</span>
          </div>
          <p className="text-xs text-gray-500">
            © 2026 Eventra AI. Built with ❤️ and AI.
          </p>
          <span className="text-xs text-gray-400 font-mono">eventra.ai</span>
        </div>
      </footer>
    </div>
  );
}
