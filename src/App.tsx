/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, type Variants } from 'motion/react';
import { User } from 'firebase/auth';
import {
  collection,
  query,
  where,
  onSnapshot,
  setDoc,
  doc,
  deleteDoc,
  addDoc,
  serverTimestamp,
  getDocs,
} from 'firebase/firestore';
import { auth, onAuthStateChanged, db } from './lib/firebase';
import { INITIAL_EVENTS, TEAM_MEMBERS } from './data/initialEvents';
import { EventItem, EventRegistration } from './types';
import { Navbar } from './components/Navbar';
import { CursorSpotlight } from './components/CursorSpotlight';
import { StatsCounterGrid } from './components/StatsCounter';
import { EventLightboxModal } from './components/EventLightboxModal';
import { JoinUsModal } from './components/JoinUsModal';
import { UserRegistrationsModal } from './components/UserRegistrationsModal';
import {
  ArrowRight,
  CheckCircle2,
  Images,
  Ticket,
  Sparkles,
  Rocket,
  ChevronDown,
  Mail,
  Phone,
} from 'lucide-react';

// Variants for staggered entrance animation
const eventsContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.14,
      delayChildren: 0.08,
    },
  },
};

const eventCardVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 36,
    scale: 0.96,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 280,
      damping: 24,
      mass: 0.85,
    },
  },
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [events, setEvents] = useState<EventItem[]>(INITIAL_EVENTS);
  const [userRegistrations, setUserRegistrations] = useState<EventRegistration[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);

  // 1. Firebase Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // 2. Firestore Sync for Events
  useEffect(() => {
    const eventsRef = collection(db, 'events');
    const unsub = onSnapshot(
      eventsRef,
      (snapshot) => {
        if (!snapshot.empty) {
          const loadedEvents: EventItem[] = [];
          snapshot.forEach((docSnap) => {
            loadedEvents.push({ id: docSnap.id, ...docSnap.data() } as EventItem);
          });
          setEvents(loadedEvents);
        } else {
          // Seed initial events to Firestore if collection is empty
          INITIAL_EVENTS.forEach(async (evt) => {
            try {
              await setDoc(doc(db, 'events', evt.id), evt);
            } catch (e) {
              // Ignore if offline / security
            }
          });
          setEvents(INITIAL_EVENTS);
        }
      },
      (err) => {
        console.warn('Events firestore snapshot note:', err);
        // Fallback to local default data
        setEvents(INITIAL_EVENTS);
      }
    );
    return () => unsub();
  }, []);

  // 3. Firestore Sync for User's Registrations
  useEffect(() => {
    if (!user) {
      setUserRegistrations([]);
      return;
    }

    const regRef = collection(db, 'event_registrations');
    const q = query(regRef, where('userId', '==', user.uid));
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const regs: EventRegistration[] = [];
        snapshot.forEach((docSnap) => {
          regs.push({ id: docSnap.id, ...docSnap.data() } as EventRegistration);
        });
        setUserRegistrations(regs);
      },
      (err) => {
        console.warn('Registrations snapshot note:', err);
      }
    );
    return () => unsub();
  }, [user]);

  // Handle Register / Unregister for an event
  const handleRegisterToggle = async (eventId: string) => {
    if (!user) {
      // If not logged in, prompt sign in via modal/button
      alert('Please sign in with Google to register for this event!');
      return;
    }

    const existingReg = userRegistrations.find((r) => r.eventId === eventId);
    if (existingReg) {
      // Unregister
      try {
        await deleteDoc(doc(db, 'event_registrations', existingReg.id));
      } catch (err) {
        console.error('Failed to cancel registration:', err);
      }
    } else {
      // Register
      try {
        const regDoc = doc(collection(db, 'event_registrations'));
        await setDoc(regDoc, {
          id: regDoc.id,
          eventId,
          userId: user.uid,
          userName: user.displayName || 'Innovator',
          userEmail: user.email || '',
          userPhoto: user.photoURL || '',
          registeredAt: new Date().toISOString(),
        });
      } catch (err) {
        console.error('Failed to register:', err);
      }
    }
  };

  // Allow attaching new images to event (persists to Firestore)
  const handleAttachImage = async (eventId: string, newImageUrl: string) => {
    const targetEvent = events.find((e) => e.id === eventId);
    if (!targetEvent) return;

    const updatedGallery = [...(targetEvent.galleryImages || []), newImageUrl];
    try {
      await setDoc(
        doc(db, 'events', eventId),
        {
          ...targetEvent,
          galleryImages: updatedGallery,
        },
        { merge: true }
      );
      // Update local state in case offline
      setEvents((prev) =>
        prev.map((e) => (e.id === eventId ? { ...e, galleryImages: updatedGallery } : e))
      );
      if (selectedEvent?.id === eventId) {
        setSelectedEvent({ ...selectedEvent, galleryImages: updatedGallery });
      }
    } catch (err) {
      console.error('Failed to attach image:', err);
    }
  };

  // Open Event Lightbox
  const handleOpenEventLightbox = (event: EventItem) => {
    setSelectedEvent(event);
    setIsLightboxOpen(true);
  };

  return (
    <div className="relative min-h-screen bg-[#FCF8FC] text-[#1B1B1E] selection:bg-[#5231FF]/15 selection:text-[#5231FF] overflow-x-hidden">
      {/* Interactive Cursor Spotlight Glow (Desktop Only) */}
      <CursorSpotlight />

      {/* Floating Liquid Glass Navigation Bar with Animated Capsule */}
      <Navbar
        user={user}
        userRegistrationsCount={userRegistrations.length}
        onOpenJoinModal={() => setIsJoinModalOpen(true)}
        onOpenUserModal={() => setIsUserModalOpen(true)}
      />

      <main className="w-full">
        {/* ==========================================
            SECTION 1: HERO (Pure White #FFFFFF)
            ========================================== */}
        <section
          id="home"
          className="relative min-h-[92vh] sm:min-h-screen w-full bg-[#FFFFFF] flex flex-col justify-between items-center text-center px-4 sm:px-6 lg:px-12 py-16 overflow-hidden select-none"
        >
          {/* Animated Ambient Hero Glow (#5231FF -> #FF4FD8) & Floating Mesh Particles */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center -z-0">
            <div
              className="animate-hero-glow w-[360px] sm:w-[640px] lg:w-[900px] h-[360px] sm:h-[640px] lg:h-[900px] rounded-full blur-3xl opacity-80"
              style={{
                background:
                  'radial-gradient(circle, rgba(82, 49, 255, 0.17) 0%, rgba(255, 79, 216, 0.09) 45%, rgba(255, 255, 255, 0) 72%)',
              }}
            />
            {/* Subtle floating geometric particles */}
            <div className="particle-float-1 absolute top-[28%] left-[18%] w-3 h-3 rounded-full bg-[#5231FF]/20 blur-[1px]" />
            <div className="particle-float-2 absolute top-[38%] right-[22%] w-4 h-4 rounded-full bg-[#FE4ED7]/25 blur-[1px]" />
            <div className="particle-float-3 absolute bottom-[32%] left-[28%] w-2 h-2 rounded-full bg-[#5231FF]/30" />
            <div className="particle-float-1 absolute top-[62%] right-[16%] w-2.5 h-2.5 rounded-full bg-[#5231FF]/15" />
          </div>

          {/* Top Spacer for True Vertical Center */}
          <div className="w-full h-8 sm:h-12" />

          {/* Center Content Cluster with Staggered Entrance */}
          <div className="relative z-10 max-w-7xl mx-auto flex flex-col items-center justify-center">
            {/* Eyebrow */}
            <motion.span
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="font-spacemono uppercase font-medium text-xs sm:text-sm tracking-[0.24em] text-[#6B6B74] mb-6 sm:mb-8 block"
            >
              Innovation and Entrepreneurship Development Cell
            </motion.span>

            {/* Primary Title */}
            <motion.h1
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.25 }}
              className="font-clash font-bold text-[#111114] tracking-[-0.025em] leading-[0.92] text-5xl sm:text-7xl md:text-8xl lg:text-9xl text-center select-none transition-transform hover:scale-[1.01] duration-500"
            >
              IEDC MTM COLLEGE
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.45 }}
              className="font-general font-medium text-lg sm:text-xl md:text-2xl text-[#6B6B74] mt-6 sm:mt-8 tracking-[-0.01em]"
            >
              MTM College · Ponnani, Kerala
            </motion.p>
          </div>

          {/* Floating Chevron pointing downward */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.65 }}
            className="relative z-10 w-full flex justify-center pb-2"
          >
            <a
              href="#about"
              aria-label="Scroll to about section"
              className="animate-float-chevron group w-11 h-11 rounded-full flex items-center justify-center text-[#6B6B74]/80 hover:text-[#5231FF] hover:bg-[#5231FF]/10 hover:shadow-[0_0_16px_rgba(82,49,255,0.2)] transition-all cursor-pointer"
            >
              <ChevronDown className="w-6 h-6 group-hover:scale-110 transition-transform" />
            </a>
          </motion.div>
        </section>

        {/* ==========================================
            SECTION 2: ABOUT & ACHIEVEMENTS (#F6F6F8)
            ========================================== */}
        <section id="about" className="w-full bg-[#F6F6F8] py-28 md:py-36 px-6 lg:px-12 relative">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
              {/* Left Column: Story */}
              <div className="lg:col-span-6 flex flex-col justify-center">
                <div className="inline-flex items-center gap-2 mb-4">
                  <span className="w-2 h-2 rounded-full bg-[#5231FF] animate-ping" />
                  <span className="font-spacemono uppercase tracking-[0.18em] text-xs font-bold text-[#6B6B74]">
                    ABOUT US
                  </span>
                </div>

                <h2 className="font-clash font-bold text-3xl sm:text-4xl md:text-5xl text-[#111114] tracking-tight mb-6 leading-tight">
                  Who We Are
                </h2>

                <p className="font-general text-base md:text-lg text-[#6B6B74] leading-relaxed mb-6">
                  IEDC MTM College serves as the crucible for student-led innovation, turning
                  ambitious ideas into resilient technical ventures. Rooted in MTM College, Ponnani,
                  we empower young founders through structured mentorship, industry immersion, and
                  pre-incubation grants.
                </p>

                <p className="font-general text-base md:text-lg text-[#6B6B74] leading-relaxed mb-8">
                  Our ecosystem bridges grassroots collegiate creativity with Kerala’s thriving
                  technological renaissance, producing leaders primed to solve regional and global
                  challenges with technical discipline.
                </p>

                {/* Core Pillar Indicators */}
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="flex items-center gap-3 group p-2.5 rounded-xl transition-all duration-300 hover:bg-white/80 hover:shadow-sm">
                    <span className="w-8 h-8 rounded-full bg-[#5231FF]/10 text-[#5231FF] flex items-center justify-center group-hover:bg-[#5231FF] group-hover:text-white group-hover:scale-110 shadow-xs transition-all duration-300">
                      <span className="material-symbols-outlined text-[18px]">rocket_launch</span>
                    </span>
                    <span className="font-general font-medium text-sm text-[#111114] group-hover:text-[#5231FF] transition-colors">
                      Student Incubation
                    </span>
                  </div>

                  <div className="flex items-center gap-3 group p-2.5 rounded-xl transition-all duration-300 hover:bg-white/80 hover:shadow-sm">
                    <span className="w-8 h-8 rounded-full bg-[#5231FF]/10 text-[#5231FF] flex items-center justify-center group-hover:bg-[#5231FF] group-hover:text-white group-hover:scale-110 shadow-xs transition-all duration-300">
                      <span className="material-symbols-outlined text-[18px]">hub</span>
                    </span>
                    <span className="font-general font-medium text-sm text-[#111114] group-hover:text-[#5231FF] transition-colors">
                      Kerala Startup Ecosystem
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column: 2x2 Liquid Glass Stats Grid */}
              <div className="lg:col-span-6">
                <StatsCounterGrid />
              </div>
            </div>
          </div>
        </section>

        {/* ==========================================
            SECTION 3: UPCOMING EVENTS (Pure White #FFFFFF)
            ========================================== */}
        <section id="events" className="w-full bg-[#FFFFFF] py-28 md:py-36 px-6 lg:px-12 relative">
          <div className="max-w-7xl mx-auto">
            {/* Section Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-4">
              <div>
                <div className="inline-flex items-center gap-2 mb-3">
                  <span className="w-2 h-2 rounded-full bg-[#5231FF]" />
                  <span className="font-spacemono uppercase tracking-[0.2em] text-xs font-bold text-[#6B6B74]">
                    WHAT'S NEXT
                  </span>
                </div>
                <h2 className="font-clash font-bold text-3xl sm:text-4xl md:text-5xl text-[#111114] tracking-tight">
                  Upcoming Events
                </h2>
              </div>
              <div className="font-general text-sm text-[#6B6B74] max-w-sm">
                Hands-on sprints, founder clinics, and venture roundtables open to all passionate
                builders. Click any event to open its complete image gallery and details.
              </div>
            </div>

            {/* Events Grid with Staggered motion.div Entry */}
            <motion.div
              variants={eventsContainerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.12 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {events.map((evt) => {
                const isRegistered = userRegistrations.some((r) => r.eventId === evt.id);
                const attachedCount = (evt.galleryImages?.length || 0) + 1;

                return (
                  <motion.div
                    key={evt.id}
                    variants={eventCardVariants}
                    whileHover={{ y: -6, transition: { duration: 0.25, ease: 'easeOut' } }}
                    onClick={() => handleOpenEventLightbox(evt)}
                    className="glass-liquid-card group rounded-[24px] overflow-hidden flex flex-col justify-between cursor-pointer"
                  >
                    <div>
                      {/* 16:9 Cover Image Header (As requested: visitors only see the cover image initially) */}
                      <div className="relative w-full aspect-video bg-[#F6F6F8] overflow-hidden">
                        {/* Cover Image */}
                        <img
                          src={evt.coverImage}
                          alt={evt.title}
                          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />

                        {/* Top Overlays */}
                        <div className="absolute top-4 inset-x-4 flex items-center justify-between z-10">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 text-[#111114] font-spacemono text-[11px] font-bold tracking-wider shadow-sm transition-all duration-300 group-hover:shadow-[0_0_12px_rgba(82,49,255,0.25)] group-hover:scale-105">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#5231FF]" />
                            {evt.dateBadge}
                          </span>

                          <span className="w-8 h-8 rounded-full bg-white/95 text-[#5231FF] flex items-center justify-center shadow-sm group-hover:bg-[#5231FF] group-hover:text-white group-hover:rotate-6 transition-all duration-300">
                            <span className="material-symbols-outlined text-[18px]">
                              {evt.icon}
                            </span>
                          </span>
                        </div>

                        {/* Bottom Overlay with Category & Gallery Counter Pill */}
                        <div className="absolute bottom-3 inset-x-4 flex items-center justify-between z-10">
                          <span className="font-spacemono uppercase text-[10px] tracking-widest text-white bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/20">
                            {evt.category}
                          </span>

                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/90 backdrop-blur-md text-[#111114] font-spacemono text-[10px] font-bold shadow-xs">
                            <Images className="w-3 h-3 text-[#5231FF]" />
                            <span>{attachedCount} Photos</span>
                          </span>
                        </div>
                      </div>

                      {/* Content Area */}
                      <div className="p-7">
                        <div className="flex items-center justify-between mb-2">
                          {isRegistered && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                              <CheckCircle2 className="w-3 h-3" />
                              RSVP Confirmed
                            </span>
                          )}
                        </div>

                        <h3 className="font-clash font-bold text-xl text-[#111114] leading-snug mb-3 group-hover:text-[#5231FF] transition-colors">
                          {evt.title}
                        </h3>

                        <p className="font-general text-sm text-[#6B6B74] leading-relaxed line-clamp-2">
                          {evt.shortDescription}
                        </p>
                      </div>
                    </div>

                    {/* Card Action Footer */}
                    <div className="px-7 pb-7 pt-1 flex items-center justify-between">
                      <div className="inline-flex items-center gap-2 font-general font-semibold text-sm text-[#5231FF] group-hover:text-[#3a00df] transition-colors">
                        <span>View Gallery &amp; Details</span>
                        <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1.5" />
                      </div>

                      <span className="text-[11px] font-spacemono text-[#6B6B74]">
                        {evt.attendeeCount} registered
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </section>

        {/* ==========================================
            SECTION 4: MEMBERS / TEAM (#F6F6F8)
            ========================================== */}
        <section id="team" className="w-full bg-[#F6F6F8] py-28 md:py-36 px-6 lg:px-12 relative">
          <div className="max-w-7xl mx-auto">
            {/* Section Header */}
            <div className="max-w-2xl mb-16">
              <div className="inline-flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full bg-[#5231FF]" />
                <span className="font-spacemono uppercase tracking-[0.2em] text-xs font-bold text-[#6B6B74]">
                  THE PEOPLE
                </span>
              </div>
              <h2 className="font-clash font-bold text-3xl sm:text-4xl md:text-5xl text-[#111114] tracking-tight mb-4">
                Meet the Team
              </h2>
              <p className="font-general text-base md:text-lg text-[#6B6B74] leading-relaxed">
                The dedicated student leads, faculty curators, and mentors driving innovation across
                campus.
              </p>
            </div>

            {/* 4-Column Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {TEAM_MEMBERS.map((member, idx) => (
                <div
                  key={idx}
                  className="glass-liquid-card group rounded-[24px] p-6 flex flex-col justify-between transition-all duration-300 cursor-default"
                >
                  <div>
                    {/* Avatar Area with dynamic shine and scale */}
                    <div className="w-full aspect-square rounded-[20px] bg-[#FFFFFF] flex flex-col items-center justify-center relative overflow-hidden mb-6 shadow-sm border border-transparent group-hover:border-[#5231FF]/25 group-hover:shadow-[0_12px_28px_rgba(82,49,255,0.14)] transition-all duration-300">
                      <span
                        className={`font-clash font-bold text-3xl sm:text-4xl transition-all duration-300 group-hover:scale-110 ${
                          member.initials === 'FR'
                            ? 'text-[#5231FF] group-hover:text-[#3a00df]'
                            : 'text-[#111114]/80 group-hover:text-[#5231FF]'
                        }`}
                      >
                        {member.initials}
                      </span>

                      <span
                        className={`absolute bottom-3 right-3 w-7 h-7 rounded-full flex items-center justify-center shadow-xs transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12 ${
                          member.initials === 'FR'
                            ? 'bg-[#5231FF] text-white'
                            : 'bg-[#F6F6F8] text-[#5231FF]'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          {member.badgeIcon}
                        </span>
                      </span>
                    </div>

                    <h3 className="font-clash font-bold text-lg text-[#111114] leading-snug group-hover:text-[#5231FF] transition-colors">
                      {member.name}
                    </h3>
                    <p className="font-general text-sm text-[#6B6B74] font-medium mt-1">
                      {member.role}
                    </p>
                  </div>

                  {/* Social Buttons */}
                  <div className="flex items-center gap-2 pt-6 mt-4 border-t border-[rgba(0,0,0,0.04)]">
                    <a
                      href={member.linkedin}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`${member.name} LinkedIn`}
                      className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-[#6B6B74] hover:text-white hover:bg-[#5231FF] hover:rotate-6 hover:scale-110 shadow-sm transition-all duration-200"
                    >
                      <span className="material-symbols-outlined text-[18px]">work</span>
                    </a>
                    <a
                      href={member.instagram}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`${member.name} Instagram`}
                      className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-[#6B6B74] hover:text-white hover:bg-[#5231FF] hover:-rotate-6 hover:scale-110 shadow-sm transition-all duration-200"
                    >
                      <span className="material-symbols-outlined text-[18px]">photo_camera</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* ==========================================
          FOOTER
          ========================================== */}
      <footer className="w-full bg-white border-t border-[rgba(0,0,0,0.06)] pt-14 pb-8">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12">
            <div className="md:col-span-5 flex flex-col gap-3">
              <div className="flex items-center gap-1.5">
                <span className="font-clash text-xl text-[#111114] font-bold tracking-tight">
                  IEDC MTM
                </span>
                <span className="w-2 h-2 rounded-full bg-[#5231FF] inline-block shadow-[0_0_8px_rgba(82,49,255,0.4)]" />
              </div>
              <p className="font-general text-sm text-[#6B6B74] max-w-sm">
                Innovation and Entrepreneurship Development Cell, MTM College, Ponnani, Kerala
              </p>
            </div>

            <div className="md:col-span-3 flex flex-col gap-3">
              <span className="font-spacemono text-xs uppercase font-bold text-[#6B6B74]">
                Quick Links
              </span>
              <div className="flex flex-col gap-2">
                <a
                  href="#"
                  className="font-general text-sm text-[#6B6B74] hover:text-[#5231FF] hover:translate-x-1.5 transition-all duration-200"
                >
                  Home
                </a>
                <a
                  href="#about"
                  className="font-general text-sm text-[#6B6B74] hover:text-[#5231FF] hover:translate-x-1.5 transition-all duration-200"
                >
                  About
                </a>
                <a
                  href="#events"
                  className="font-general text-sm text-[#6B6B74] hover:text-[#5231FF] hover:translate-x-1.5 transition-all duration-200"
                >
                  Events
                </a>
                <a
                  href="#team"
                  className="font-general text-sm text-[#6B6B74] hover:text-[#5231FF] hover:translate-x-1.5 transition-all duration-200"
                >
                  Team
                </a>
              </div>
            </div>

            <div className="md:col-span-4 flex flex-col gap-4">
              <span className="font-spacemono text-xs uppercase font-bold text-[#6B6B74]">
                Connect
              </span>
              <div className="flex items-center gap-2">
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Instagram"
                  className="w-10 h-10 rounded-full border border-black/5 bg-[#F6F6F8] flex items-center justify-center text-[#6B6B74] hover:bg-[#5231FF] hover:text-white hover:border-transparent hover:-translate-y-1 hover:shadow-md transition-all duration-200"
                >
                  <span className="material-symbols-outlined text-[18px]">photo_camera</span>
                </a>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="LinkedIn"
                  className="w-10 h-10 rounded-full border border-black/5 bg-[#F6F6F8] flex items-center justify-center text-[#6B6B74] hover:bg-[#5231FF] hover:text-white hover:border-transparent hover:-translate-y-1 hover:shadow-md transition-all duration-200"
                >
                  <span className="material-symbols-outlined text-[18px]">work</span>
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Twitter"
                  className="w-10 h-10 rounded-full border border-black/5 bg-[#F6F6F8] flex items-center justify-center text-[#6B6B74] hover:bg-[#5231FF] hover:text-white hover:border-transparent hover:-translate-y-1 hover:shadow-md transition-all duration-200"
                >
                  <span className="material-symbols-outlined text-[18px]">tag</span>
                </a>
              </div>

              <div className="flex flex-col gap-1.5 font-general text-xs text-[#6B6B74] mt-1">
                <a
                  href="mailto:hello@iedcmtm.in"
                  className="hover:text-[#5231FF] transition-colors flex items-center gap-1.5"
                >
                  <Mail className="w-3.5 h-3.5" />
                  hello@iedcmtm.in
                </a>
                <a
                  href="tel:+919847000000"
                  className="hover:text-[#5231FF] transition-colors flex items-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5" />
                  +91 98470 00000
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-black/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 font-spacemono text-xs text-[#6B6B74]">
            <span>© 2026 IEDC MTM College. All rights reserved.</span>
            <span className="inline-flex items-center gap-1.5">
              Made with <span className="text-rose-500 animate-heartbeat text-base">❤️</span> by IEDC MTM
            </span>
          </div>
        </div>
      </footer>

      {/* ==========================================
          MODALS
          ========================================== */}
      {/* 1. Expandable Lightbox Gallery Modal for Events */}
      <EventLightboxModal
        event={selectedEvent}
        isOpen={isLightboxOpen}
        onClose={() => {
          setIsLightboxOpen(false);
          setSelectedEvent(null);
        }}
        isRegistered={
          selectedEvent ? userRegistrations.some((r) => r.eventId === selectedEvent.id) : false
        }
        onRegisterToggle={handleRegisterToggle}
        user={user}
        onAttachImage={handleAttachImage}
      />

      {/* 2. Join Us / Student Startup Proposal Modal */}
      <JoinUsModal
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
        user={user}
      />

      {/* 3. User Registered Events Tickets Modal */}
      <UserRegistrationsModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        user={user}
        registrations={userRegistrations}
        events={events}
        onSelectEvent={(evt) => {
          setSelectedEvent(evt);
          setIsLightboxOpen(true);
        }}
      />
    </div>
  );
}
