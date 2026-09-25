/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, type Variants } from 'motion/react';
import {
  collection,
  onSnapshot,
  setDoc,
  doc,
  deleteDoc,
  getDocs,
} from 'firebase/firestore';
import { db } from './lib/firebase';
import {
  INITIAL_EVENTS,
  INITIAL_STATS,
  TEAM_MEMBERS,
} from './data/initialEvents';
import { EventItem, TeamMember, SiteStats } from './types';
import { Navbar } from './components/Navbar';
import { CursorSpotlight } from './components/CursorSpotlight';
import { StatsCounterGrid } from './components/StatsCounter';
import { EventLightboxModal } from './components/EventLightboxModal';
import { JoinUsModal } from './components/JoinUsModal';
import { CmsDashboardModal } from './components/CmsDashboardModal';
import { MemberProfileModal } from './components/MemberProfileModal';
import {
  ArrowRight,
  CheckCircle2,
  Images,
  Sparkles,
  Rocket,
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
  const [stats, setStats] = useState<SiteStats>(INITIAL_STATS);
  const [events, setEvents] = useState<EventItem[]>(INITIAL_EVENTS);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(TEAM_MEMBERS);
  const [userRegistrations, setUserRegistrations] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('iedc_event_rsvps');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isCmsModalOpen, setIsCmsModalOpen] = useState(false);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);

  // Hidden admin access: Ctrl+Shift+A (or Cmd+Shift+A), or visiting with #admin / ?admin=true
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        setIsCmsModalOpen((prev) => !prev);
      }
    };

    const checkUrlParams = () => {
      const params = new URLSearchParams(window.location.search);
      if (params.get('admin') === 'true' || window.location.hash === '#admin') {
        setIsCmsModalOpen(true);
      }
    };

    checkUrlParams();
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('hashchange', checkUrlParams);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('hashchange', checkUrlParams);
    };
  }, []);

  // 1. Firestore Sync for Site Stats
  useEffect(() => {
    const statsDocRef = doc(db, 'site_settings', 'stats');
    const unsub = onSnapshot(
      statsDocRef,
      (docSnap) => {
        if (docSnap.exists()) {
          setStats(docSnap.data() as SiteStats);
        } else {
          // Initialize stats in Firestore
          setDoc(statsDocRef, INITIAL_STATS).catch(() => {});
        }
      },
      (err) => {
        console.warn('Stats sync fallback:', err);
      }
    );
    return () => unsub();
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
        }
      },
      (err) => {
        console.warn('Events firestore note:', err);
      }
    );
    return () => unsub();
  }, []);

  // 3. Firestore Sync for Team Members
  useEffect(() => {
    const teamRef = collection(db, 'team_members');
    const unsub = onSnapshot(
      teamRef,
      (snapshot) => {
        if (!snapshot.empty) {
          const loadedMembers: TeamMember[] = [];
          snapshot.forEach((docSnap) => {
            loadedMembers.push({ id: docSnap.id, ...docSnap.data() } as TeamMember);
          });
          setTeamMembers(loadedMembers);
        }
      },
      (err) => {
        console.warn('Team firestore note:', err);
      }
    );
    return () => unsub();
  }, []);

  // Save Stats Handler
  const handleSaveStats = async (newStats: SiteStats) => {
    setStats(newStats);
    try {
      await setDoc(doc(db, 'site_settings', 'stats'), newStats);
    } catch (err) {
      console.error('Failed to save stats to Firestore:', err);
    }
  };

  // Save Events Handler
  const handleSaveEvents = async (newEvents: EventItem[]) => {
    setEvents(newEvents);
    try {
      for (const evt of newEvents) {
        await setDoc(doc(db, 'events', evt.id), evt);
      }
    } catch (err) {
      console.error('Failed to save events to Firestore:', err);
    }
  };

  // Save Team Members Handler
  const handleSaveTeamMembers = async (newMembers: TeamMember[]) => {
    setTeamMembers(newMembers);
    try {
      for (const member of newMembers) {
        await setDoc(doc(db, 'team_members', member.id), member);
      }
    } catch (err) {
      console.error('Failed to save team members to Firestore:', err);
    }
  };

  // Handle Register / Unregister for an event (No login required)
  const handleRegisterToggle = async (eventId: string) => {
    setUserRegistrations((prev) => {
      const isAlready = prev.includes(eventId);
      const next = isAlready ? prev.filter((id) => id !== eventId) : [...prev, eventId];
      try {
        localStorage.setItem('iedc_event_rsvps', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  // Attach Image from Lightbox
  const handleAttachImage = async (eventId: string, imageUrl: string) => {
    const targetEvent = events.find((e) => e.id === eventId);
    if (!targetEvent) return;

    const updatedGallery = [...(targetEvent.galleryImages || []), imageUrl];
    const updated = events.map((e) =>
      e.id === eventId ? { ...e, galleryImages: updatedGallery } : e
    );
    setEvents(updated);
    if (selectedEvent?.id === eventId) {
      setSelectedEvent({ ...selectedEvent, galleryImages: updatedGallery });
    }
    try {
      await setDoc(
        doc(db, 'events', eventId),
        { ...targetEvent, galleryImages: updatedGallery },
        { merge: true }
      );
    } catch (err) {
      console.error('Failed to attach image:', err);
    }
  };

  // Open Event Lightbox
  const handleOpenEventLightbox = (event: EventItem) => {
    setSelectedEvent(event);
    setIsLightboxOpen(true);
  };

  // Categorize Team Members dynamically by hierarchy
  const nodalOfficers = teamMembers.filter((m) => m.hierarchy === 'nodal');
  const executiveMembers = teamMembers.filter((m) => m.hierarchy === 'executive');
  const generalMembers = teamMembers.filter((m) => m.hierarchy === 'member');

  return (
    <div className="relative min-h-screen bg-[#FCF8FC] text-[#1B1B1E] selection:bg-[#5231FF]/15 selection:text-[#5231FF] overflow-x-hidden">
      {/* Interactive Cursor Spotlight Glow (Desktop Only) */}
      <CursorSpotlight />

      {/* Floating Liquid Glass Navigation Bar (No Login Button, No Public CMS Button) */}
      <Navbar
        onOpenJoinModal={() => setIsJoinModalOpen(true)}
      />

      <main className="w-full">
        {/* ==========================================
            SECTION 1: HERO (Full Viewport on Android & Desktop)
            ========================================== */}
        <section
          id="home"
          className="relative min-h-screen min-h-[100dvh] w-full flex flex-col justify-center items-center pt-24 pb-12 sm:pt-28 sm:pb-16 px-6 lg:px-12 bg-[#FFFFFF] overflow-hidden scroll-mt-20"
        >
          {/* Subtle Ambient Radial Lighting */}
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[700px] h-[340px] sm:h-[480px] bg-gradient-to-tr from-[#5231FF]/8 via-[#7B5CFF]/5 to-transparent rounded-full blur-[90px] sm:blur-[130px] pointer-events-none" />

          {/* Clean Grid Background Pattern (Very Subtle) */}
          <div
            className="absolute inset-0 opacity-[0.025] pointer-events-none bg-[radial-gradient(#111114_1px,transparent_1px)] [background-size:24px_24px]"
            aria-hidden="true"
          />

          <div className="max-w-5xl mx-auto text-center relative z-10 flex flex-col items-center my-auto">
            {/* 1. College & Partner Indicator */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/[0.03] border border-black/[0.06] mb-6 select-none"
            >
              <span className="w-2 h-2 rounded-full bg-[#5231FF] animate-pulse" />
              <span className="font-spacemono uppercase tracking-[0.2em] text-[11px] font-bold text-[#6B6B74]">
                MTM COLLEGE • KERALA STARTUP MISSION ACCREDITED
              </span>
            </motion.div>

            {/* 2. Bold, Unmistakable Title of the Website */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.08 }}
              className="mb-4"
            >
              <h1 className="font-clash font-extrabold text-5xl sm:text-7xl md:text-8xl lg:text-[102px] text-[#111114] tracking-tight leading-[0.98]">
                IEDC{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#5231FF] via-[#6847FF] to-[#3a00df]">
                  MTM
                </span>
              </h1>
              <p className="font-spacemono uppercase tracking-[0.16em] text-xs sm:text-sm md:text-base font-bold text-[#5231FF] mt-3">
                Innovation &amp; Entrepreneurship Development Centre
              </p>
            </motion.div>

            {/* 3. Simple, Exciting Description (No Clutter) */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.16 }}
              className="font-general text-base sm:text-xl text-[#6B6B74] max-w-2xl mx-auto leading-relaxed mb-8"
            >
              Where students turn ideas into funded ventures, build working prototypes, and connect
              with Kerala&apos;s leading mentors and hackathons.
            </motion.p>

            {/* 4. Action Buttons (Clean & Direct) */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.24 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full sm:w-auto select-none"
            >
              <a
                href="#events"
                className="w-full sm:w-auto bg-[#5231FF] text-white font-semibold text-sm sm:text-base px-8 py-3.5 rounded-full shadow-[0_6px_24px_rgba(82,49,255,0.32)] hover:shadow-[0_10px_32px_rgba(82,49,255,0.48)] hover:brightness-110 hover:scale-105 active:scale-95 transition-all duration-300 inline-flex items-center justify-center gap-2 group cursor-pointer"
              >
                <span>Explore Events &amp; Sprints</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              </a>

              <button
                type="button"
                onClick={() => setIsJoinModalOpen(true)}
                className="w-full sm:w-auto bg-black/[0.03] hover:bg-black/[0.06] text-[#111114] font-semibold text-sm sm:text-base px-8 py-3.5 rounded-full border border-black/[0.08] hover:border-black/20 hover:scale-105 active:scale-95 transition-all duration-300 inline-flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <Rocket className="w-4 h-4 text-[#5231FF]" />
                <span>Submit Startup Idea</span>
              </button>
            </motion.div>
          </div>
        </section>

        {/* ==========================================
            SECTION 2: ABOUT & STATS (#F6F6F8)
            ========================================== */}
        <section
          id="about"
          className="w-full bg-[#F6F6F8] py-28 md:py-36 px-6 lg:px-12 relative border-t border-black/[0.06] scroll-mt-20"
        >
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
              {/* Left Column: Narrative */}
              <div className="lg:col-span-6 flex flex-col justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 mb-3">
                    <span className="w-2 h-2 rounded-full bg-[#5231FF]" />
                    <span className="font-spacemono uppercase tracking-[0.2em] text-xs font-bold text-[#6B6B74]">
                      MISSION &amp; VISION
                    </span>
                  </div>

                  <h2 className="font-clash font-bold text-3xl sm:text-4xl md:text-5xl text-[#111114] tracking-tight leading-snug mb-6">
                    Fostering tomorrow’s founders right inside collegiate labs.
                  </h2>

                  <p className="font-general text-base md:text-lg text-[#6B6B74] leading-relaxed mb-6">
                    The Innovation and Entrepreneurship Development Cell (IEDC) at MTM College serves
                    as the prime institutional vehicle providing infrastructure, industry
                    mentorship, prototyping kits, and intellectual property backing to transform
                    student concepts into commercial ventures.
                  </p>

                  <p className="font-general text-sm md:text-base text-[#6B6B74] leading-relaxed mb-8">
                    Partnered with Kerala Startup Mission (KSUM), we operate dedicated hackspaces,
                    host continuous sprint weekends, and connect collegiate teams directly to angel
                    funds and patent filing resources.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-[rgba(0,0,0,0.06)]">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#5231FF]" />
                    <span className="text-xs font-spacemono font-bold uppercase text-[#111114]">
                      KSUM Accredited
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#5231FF]" />
                    <span className="text-xs font-spacemono font-bold uppercase text-[#111114]">
                      Seed Grant Backing
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#5231FF]" />
                    <span className="text-xs font-spacemono font-bold uppercase text-[#111114]">
                      24/7 Lab Access
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column: Dynamic Counter Grid */}
              <div className="lg:col-span-6">
                <StatsCounterGrid stats={stats} />
              </div>
            </div>
          </div>
        </section>

        {/* ==========================================
            SECTION 3: UPCOMING EVENTS (Pure White #FFFFFF)
            ========================================== */}
        <section
          id="events"
          className="w-full bg-[#FFFFFF] py-28 md:py-36 px-6 lg:px-12 relative border-t border-black/[0.06] scroll-mt-20"
        >
          <div className="max-w-7xl mx-auto">
            {/* Section Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-4">
              <div>
                <div className="inline-flex items-center gap-2 mb-3">
                  <span className="w-2 h-2 rounded-full bg-[#5231FF]" />
                  <span className="font-spacemono uppercase tracking-[0.2em] text-xs font-bold text-[#6B6B74]">
                    WHAT&apos;S NEXT
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
                const isRegistered = userRegistrations.includes(evt.id);
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
                      {/* 16:9 Cover Image Header */}
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
        <section
          id="team"
          className="w-full bg-[#F6F6F8] py-28 md:py-36 px-6 lg:px-12 relative border-t border-black/[0.06] scroll-mt-20"
        >
          <div className="max-w-7xl mx-auto">
            {/* Section Header */}
            <div className="max-w-2xl mb-12 sm:mb-16">
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
                The structured leadership hierarchy powering innovation, venture incubation, and
                student technology cohorts across MTM College.
              </p>
            </div>

            <div className="space-y-12 sm:space-y-16">
              {/* TIER 1: NODAL OFFICERS & FACULTY ADVISORY */}
              <div>
                <div className="flex items-center gap-2 mb-4 sm:mb-5">
                  <span className="w-2 h-2 rounded-full bg-[#5231FF]" />
                  <h3 className="font-spacemono text-xs sm:text-sm uppercase font-bold tracking-wider text-[#111114]">
                    Faculty Leadership &amp; Nodal Officers
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {nodalOfficers.map((member) => (
                    <div
                      key={member.id}
                      onClick={() => {
                        setSelectedMember(member);
                        setIsMemberModalOpen(true);
                      }}
                      className="glass-liquid-card group rounded-2xl sm:rounded-[24px] p-4 sm:p-5 flex flex-col justify-between transition-all duration-300 cursor-pointer hover:-translate-y-1.5 hover:shadow-lg border border-black/5"
                    >
                      {/* Image */}
                      <div className="w-full aspect-[4/3] sm:aspect-square rounded-xl sm:rounded-2xl bg-[#F6F6F8] flex items-center justify-center overflow-hidden mb-3.5 border border-black/5">
                        {member.photoUrl ? (
                          <img
                            src={member.photoUrl}
                            alt={member.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <span className="font-clash font-bold text-2xl sm:text-3xl text-[#5231FF] group-hover:scale-110 transition-transform">
                            {member.initials}
                          </span>
                        )}
                      </div>

                      {/* Name & Role Only */}
                      <div className="text-center">
                        <h4 className="font-clash font-bold text-sm sm:text-lg text-[#111114] leading-snug group-hover:text-[#5231FF] transition-colors truncate">
                          {member.name}
                        </h4>
                        <p className="font-general text-xs sm:text-sm text-[#6B6B74] font-medium mt-1 truncate">
                          {member.role}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* TIER 2: TEAM EXECUTIVES */}
              <div>
                <div className="flex items-center gap-2 mb-4 sm:mb-5">
                  <span className="w-2 h-2 rounded-full bg-[#5231FF]" />
                  <h3 className="font-spacemono text-xs sm:text-sm uppercase font-bold tracking-wider text-[#111114]">
                    Executive Council
                  </h3>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-5">
                  {executiveMembers.map((member) => (
                    <div
                      key={member.id}
                      onClick={() => {
                        setSelectedMember(member);
                        setIsMemberModalOpen(true);
                      }}
                      className="glass-liquid-card group rounded-2xl sm:rounded-[22px] p-3.5 sm:p-4 flex flex-col justify-between transition-all duration-300 cursor-pointer hover:-translate-y-1.5 hover:shadow-lg border border-black/5"
                    >
                      {/* Image */}
                      <div className="w-full aspect-square rounded-xl sm:rounded-2xl bg-[#F6F6F8] flex items-center justify-center overflow-hidden mb-3 border border-black/5">
                        {member.photoUrl ? (
                          <img
                            src={member.photoUrl}
                            alt={member.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <span className="font-clash font-bold text-xl sm:text-2xl text-[#5231FF] group-hover:scale-110 transition-transform">
                            {member.initials}
                          </span>
                        )}
                      </div>

                      {/* Name & Role Only */}
                      <div className="text-center">
                        <h4 className="font-clash font-bold text-xs sm:text-base text-[#111114] leading-tight truncate group-hover:text-[#5231FF] transition-colors">
                          {member.name}
                        </h4>
                        <p className="font-general text-[11px] sm:text-xs text-[#5231FF] font-semibold mt-1 truncate">
                          {member.role}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* TIER 3: NORMAL MEMBERS / DOMAIN LEADS */}
              <div>
                <div className="flex items-center gap-2 mb-4 sm:mb-5">
                  <span className="w-2 h-2 rounded-full bg-[#5231FF]" />
                  <h3 className="font-spacemono text-xs sm:text-sm uppercase font-bold tracking-wider text-[#111114]">
                    Domain Leads &amp; Innovators
                  </h3>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                  {generalMembers.map((member) => (
                    <div
                      key={member.id}
                      onClick={() => {
                        setSelectedMember(member);
                        setIsMemberModalOpen(true);
                      }}
                      className="glass-liquid-card group rounded-2xl p-3 sm:p-3.5 flex flex-col justify-between transition-all duration-300 cursor-pointer hover:-translate-y-1.5 hover:shadow-lg border border-black/5"
                    >
                      {/* Image */}
                      <div className="w-full aspect-square rounded-xl bg-[#F6F6F8] flex items-center justify-center overflow-hidden mb-2.5 border border-black/5">
                        {member.photoUrl ? (
                          <img
                            src={member.photoUrl}
                            alt={member.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <span className="font-clash font-bold text-base sm:text-lg text-[#5231FF] group-hover:scale-110 transition-transform">
                            {member.initials}
                          </span>
                        )}
                      </div>

                      {/* Name & Role Only */}
                      <div className="text-center">
                        <h4 className="font-clash font-bold text-xs sm:text-sm text-[#111114] leading-tight truncate group-hover:text-[#5231FF] transition-colors">
                          {member.name}
                        </h4>
                        <p className="font-general text-[10px] sm:text-[11px] text-[#6B6B74] font-medium mt-0.5 truncate">
                          {member.role}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
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
                  href="#home"
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
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="LinkedIn"
                  className="w-10 h-10 rounded-full border border-black/5 bg-[#F6F6F8] flex items-center justify-center text-[#6B6B74] hover:bg-[#5231FF] hover:text-white hover:border-transparent hover:-translate-y-1 hover:shadow-md transition-all duration-200"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="X (formerly Twitter)"
                  className="w-10 h-10 rounded-full border border-black/5 bg-[#F6F6F8] flex items-center justify-center text-[#6B6B74] hover:bg-[#5231FF] hover:text-white hover:border-transparent hover:-translate-y-1 hover:shadow-md transition-all duration-200"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
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

          {/* Requested Footer String Change with Discreet Admin Trigger */}
          <div className="border-t border-black/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 font-spacemono text-xs text-[#6B6B74]">
            <span>© 2026 IEDC MTM College. All rights reserved.</span>
            <span
              onClick={(e) => {
                if (e.detail === 3) {
                  setIsCmsModalOpen(true);
                }
              }}
              title=""
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#111114] select-none cursor-default"
            >
              Made by IEDC MTM &lt;3
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
        isRegistered={selectedEvent ? userRegistrations.includes(selectedEvent.id) : false}
        onRegisterToggle={handleRegisterToggle}
        onAttachImage={handleAttachImage}
      />

      {/* 2. Join Us / Student Startup Proposal Modal */}
      <JoinUsModal
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
      />

      {/* 3. Comprehensive CMS Dashboard (Bulk Uploads, Stats Edit, Events, Sanity Sync) */}
      <CmsDashboardModal
        isOpen={isCmsModalOpen}
        onClose={() => setIsCmsModalOpen(false)}
        stats={stats}
        onSaveStats={handleSaveStats}
        events={events}
        onSaveEvents={handleSaveEvents}
        teamMembers={teamMembers}
        onSaveTeamMembers={handleSaveTeamMembers}
      />

      {/* 4. Member Profile Details Modal (Instagram, LinkedIn, Contact) */}
      <MemberProfileModal
        member={selectedMember}
        isOpen={isMemberModalOpen}
        onClose={() => {
          setIsMemberModalOpen(false);
          setSelectedMember(null);
        }}
      />
    </div>
  );
}
