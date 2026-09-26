/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, type Variants } from 'motion/react';
import { sanityClient, SANITY_QUERIES } from './lib/sanity';
import { isEventPast } from './lib/dateUtils';
import {
  INITIAL_EVENTS,
  INITIAL_STATS,
  TEAM_MEMBERS,
} from './data/initialEvents';
import { EventItem, TeamMember, SiteSettings } from './types';
import { Navbar } from './components/Navbar';
import { CursorSpotlight } from './components/CursorSpotlight';
import { StatsCounterGrid } from './components/StatsCounter';
import { EventLightboxModal } from './components/EventLightboxModal';
import { JoinUsModal } from './components/JoinUsModal';
import { MemberProfileModal } from './components/MemberProfileModal';
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Images,
  Rocket,
  Mail,
  Phone,
} from 'lucide-react';

const eventsContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const eventCardVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

export default function App() {
  const [events, setEvents] = useState<EventItem[]>(INITIAL_EVENTS);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({...INITIAL_STATS});
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(TEAM_MEMBERS);

  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);

  const [eventFilter, setEventFilter] = useState<'all' | 'upcoming' | 'past'>('all');

  const upcomingEvents = useMemo(() => events.filter((e) => !isEventPast(e)), [events]);
  const pastEvents = useMemo(() => events.filter((e) => isEventPast(e)), [events]);

  const displayedEvents = useMemo(() => {
    if (eventFilter === 'upcoming') return upcomingEvents;
    if (eventFilter === 'past') return pastEvents;
    return events;
  }, [eventFilter, events, upcomingEvents, pastEvents]);

  // Scroll animations
  const { scrollY, scrollYProgress } = useScroll();
  const heroY = useTransform(scrollY, [0, 500], [0, 110]);
  const heroOpacity = useTransform(scrollY, [0, 420], [1, 0]);
  const heroScale = useTransform(scrollY, [0, 420], [1, 0.96]);
  const scrollCueOpacity = useTransform(scrollY, [0, 140], [1, 0]);

  // Live Sync with Sanity CMS
  useEffect(() => {
    const fetchSanityData = async () => {
      try {
        // 1. Fetch Site Settings (stats + footer + social + content)
        const settingsData = await sanityClient.fetch(SANITY_QUERIES.siteSettings);
        if (settingsData) setSiteSettings((prev) => ({...prev, ...settingsData}));
        // 2. Fetch Events
        const eventsData = await sanityClient.fetch(SANITY_QUERIES.events);
        if (eventsData && eventsData.length > 0) setEvents(eventsData);
        // 3. Fetch Team Members
        const teamData = await sanityClient.fetch(SANITY_QUERIES.teamMembers);
        if (teamData && teamData.length > 0) setTeamMembers(teamData);
      } catch (err) {
        console.warn('Sanity fetch fallback:', err);
      }
    };
    fetchSanityData();
    // Real-time listener: updates the website the moment you click "Publish" in Sanity!
    const subscription = sanityClient
      .listen('*[_type in ["event", "teamMember", "siteSettings"]]')
      .subscribe(() => {
        fetchSanityData();
      });
    return () => subscription.unsubscribe();
  }, []);

  const handleOpenEventLightbox = (event: EventItem) => {
    setSelectedEvent(event);
    setIsLightboxOpen(true);
  };

  // Categorize Team Members dynamically by hierarchy
  const nodalOfficers = teamMembers.filter((m) => m.hierarchy === 'nodal');
  const executiveMembers = teamMembers.filter((m) => m.hierarchy === 'executive');
  const generalMembers = teamMembers.filter((m) => m.hierarchy === 'member');

  return (
    <div className="relative min-h-screen bg-[#FFFFFF] text-[#000000] selection:bg-[#000000] selection:text-[#FFFFFF] overflow-x-hidden font-instrument">
      {/* Global Minimal Scroll Progress Indicator */}
      <motion.div
        style={{ scaleX: scrollYProgress, transformOrigin: '0%' }}
        className="fixed top-0 left-0 right-0 h-[2.5px] bg-[#000000] z-[100] pointer-events-none"
      />

      {/* Interactive Cursor Spotlight Glow (Desktop Only) */}
      <CursorSpotlight />

      {/* Sharp Optimus Navigation Bar */}
      <Navbar
        onOpenJoinModal={() => setIsJoinModalOpen(true)}
      />

      <main className="w-full">
        {/* ==========================================
            SECTION 1: HERO (Optimus Design: Clean, minimal, sharp)
            ========================================== */}
        <section
          id="home"
          className="relative min-h-screen min-h-[100dvh] w-full flex flex-col justify-center items-center pt-24 pb-16 sm:pt-28 sm:pb-20 px-6 lg:px-12 bg-[#FFFFFF] overflow-hidden scroll-mt-20 border-b border-[#e5e5e5]"
        >
          {/* Subtle 24px Grid Background */}
          <div
            className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#000000_1px,transparent_1px)] [background-size:24px_24px]"
            aria-hidden="true"
          />

          {/* Hero Content with Scroll-Linked Parallax, Fade, and Scale */}
          <motion.div
            style={{ y: heroY, opacity: heroOpacity, scale: heroScale }}
            className="max-w-5xl mx-auto text-center relative z-10 flex flex-col items-center my-auto"
          >
            {/* 1. College & Partner Indicator */}
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-[2px] bg-[#fafaf9] border border-[#e5e5e5] mb-8 select-none"
            >
              <span className="w-1.5 h-1.5 rounded-[1px] bg-[#888888]" />
              <span className="font-spacemono uppercase tracking-widest text-[10px] text-[#666666]">
                MTM COLLEGE • KERALA STARTUP MISSION ACCREDITED
              </span>
            </motion.div>

            {/* 2. Headline: Instrument Sans weight 400 */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.05 }}
              className="mb-6 max-w-4xl"
            >
              <h1
                style={{ letterSpacing: '-0.035em' }}
                className="font-instrument font-normal text-6xl sm:text-7xl md:text-8xl lg:text-[100px] text-[#000000] leading-[0.95]"
              >
                {siteSettings.heroHeadline || 'Where ideas become ventures.'}
              </h1>
              <p className="font-instrument text-base sm:text-xl text-[#000000] font-normal mt-4 tracking-tight">
                {siteSettings.heroSubtitle || 'IEDC MTM — Innovation & Entrepreneurship Development Centre'}
              </p>
            </motion.div>

            {/* 3. Description: Deliberate Whitespace */}
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.12 }}
              className="font-instrument text-base sm:text-lg text-[#666666] max-w-2xl mx-auto leading-relaxed mb-10 font-normal"
            >
              {siteSettings.heroDescription || `Empowering student builders to turn bold concepts into working prototypes, funded startups, and connect with Kerala's leading mentors and tech cohorts.`}
            </motion.p>

            {/* 4. Action Buttons (Sharp corners 0-2px, base spacing 24px) */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.18 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto select-none"
            >
              <a
                href="#events"
                className="w-full sm:w-auto bg-[#000000] text-white font-medium text-sm px-6 py-3 rounded-[2px] border border-[#000000] hover:bg-neutral-800 transition-colors inline-flex items-center justify-center gap-2 cursor-pointer font-instrument"
              >
                <span>Explore Events &amp; Sprints</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <button
                type="button"
                onClick={() => setIsJoinModalOpen(true)}
                className="w-full sm:w-auto bg-white hover:bg-[#fafaf9] text-[#000000] font-medium text-sm px-6 py-3 rounded-[2px] border border-[#e5e5e5] hover:border-black transition-colors inline-flex items-center justify-center gap-2 cursor-pointer font-instrument"
              >
                <Rocket className="w-4 h-4 text-[#888888]" />
                <span>Submit Startup Idea</span>
              </button>
            </motion.div>
          </motion.div>

          {/* Interactive Scroll Down Cue */}
          <motion.div
            style={{ opacity: scrollCueOpacity }}
            className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 cursor-pointer z-20 select-none group"
            onClick={() => {
              document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            <span className="font-spacemono text-[10px] uppercase tracking-widest text-[#888888] group-hover:text-black transition-colors">
              Scroll to explore
            </span>
            <div className="w-5 h-8 rounded-full border border-[#cccccc] group-hover:border-black flex justify-center pt-1.5 transition-colors">
              <motion.div
                animate={{ y: [0, 8, 0], opacity: [1, 0.3, 1] }}
                transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
                className="w-1 h-2 rounded-full bg-[#000000]"
              />
            </div>
          </motion.div>
        </section>

        {/* ==========================================
            SECTION 2: ABOUT & STATS (#fafaf9 surface)
            ========================================== */}
        <section
          id="about"
          className="w-full bg-[#fafaf9] py-24 md:py-32 px-6 lg:px-12 relative border-b border-[#e5e5e5] scroll-mt-20"
        >
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
              {/* Left Column: Narrative with Scroll Reveal */}
              <motion.div
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="lg:col-span-6 flex flex-col justify-between"
              >
                <div>
                  <div className="inline-flex items-center gap-2 mb-3">
                    <span className="w-1.5 h-1.5 rounded-[1px] bg-[#888888]" />
                    <span className="font-spacemono uppercase tracking-widest text-[10px] text-[#888888]">
                      MISSION &amp; VISION
                    </span>
                  </div>

                  <h2
                    style={{ letterSpacing: '-1.5px' }}
                    className="font-instrument font-normal text-3xl sm:text-4xl md:text-5xl text-[#000000] leading-tight mb-6"
                  >
                    {siteSettings.missionHeadline || 'Fostering tomorrow’s founders right inside collegiate labs.'}
                  </h2>

                  <p className="font-instrument text-base sm:text-lg text-[#666666] leading-relaxed mb-6 font-normal">
                    {siteSettings.missionDescription || 'The Innovation and Entrepreneurship Development Cell (IEDC) at MTM College serves as the prime institutional vehicle providing infrastructure, industry mentorship, prototyping kits, and intellectual property backing to transform student concepts into commercial ventures.'}
                  </p>

                  <p className="font-instrument text-sm sm:text-base text-[#666666] leading-relaxed mb-8 font-normal">
                    {siteSettings.missionSubtext || 'Partnered with Kerala Startup Mission (KSUM), we operate dedicated hackspaces, host continuous sprint weekends, and connect collegiate teams directly to angel funds and patent filing resources.'}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-6 border-t border-[#e5e5e5]">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-[2px] bg-white border border-[#e5e5e5] text-xs font-instrument text-[#000000]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#000000]" />
                    <span>KSUM Accredited</span>
                  </div>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-[2px] bg-white border border-[#e5e5e5] text-xs font-instrument text-[#000000]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#000000]" />
                    <span>Seed Grant Backing</span>
                  </div>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-[2px] bg-white border border-[#e5e5e5] text-xs font-instrument text-[#000000]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#000000]" />
                    <span>24/7 Lab Access</span>
                  </div>
                </div>
              </motion.div>

              {/* Right Column: Dynamic Counter Grid with Scroll Reveal */}
              <motion.div
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
                className="lg:col-span-6"
              >
                <StatsCounterGrid stats={siteSettings} />
              </motion.div>
            </div>
          </div>
        </section>

        {/* ==========================================
            SECTION 3: EVENTS & CALENDAR (#FFFFFF)
            ========================================== */}
        <section
          id="events"
          className="w-full bg-[#FFFFFF] py-24 md:py-32 px-6 lg:px-12 relative border-b border-[#e5e5e5] scroll-mt-20"
        >
          <div className="max-w-7xl mx-auto">
            {/* Section Header with Scroll Reveal & Filter Tabs */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6"
            >
              <div>
                <div className="inline-flex items-center gap-2 mb-3">
                  <span className="w-1.5 h-1.5 rounded-[1px] bg-[#888888]" />
                  <span className="font-spacemono uppercase tracking-widest text-[10px] text-[#888888]">
                    EVENTS &amp; CALENDAR
                  </span>
                </div>
                <h2
                  style={{ letterSpacing: '-1.5px' }}
                  className="font-instrument font-normal text-3xl sm:text-4xl md:text-5xl text-[#000000] leading-tight"
                >
                  Events &amp; Initiatives
                </h2>
              </div>

              {/* Interactive Calendar Tabs: All, Upcoming, Past */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="inline-flex p-1 bg-[#fafaf9] border border-[#e5e5e5] rounded-[2px]">
                  <button
                    type="button"
                    onClick={() => setEventFilter('all')}
                    className={`px-3 py-1.5 text-xs font-spacemono uppercase tracking-wider rounded-[2px] transition-all cursor-pointer ${
                      eventFilter === 'all'
                        ? 'bg-[#000000] text-white shadow-sm'
                        : 'text-[#666666] hover:text-[#000000]'
                    }`}
                  >
                    All ({events.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setEventFilter('upcoming')}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-spacemono uppercase tracking-wider rounded-[2px] transition-all cursor-pointer ${
                      eventFilter === 'upcoming'
                        ? 'bg-[#000000] text-white shadow-sm'
                        : 'text-[#666666] hover:text-[#000000]'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Upcoming ({upcomingEvents.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setEventFilter('past')}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-spacemono uppercase tracking-wider rounded-[2px] transition-all cursor-pointer ${
                      eventFilter === 'past'
                        ? 'bg-[#000000] text-white shadow-sm'
                        : 'text-[#666666] hover:text-[#000000]'
                    }`}
                  >
                    <span>Past &amp; Archive ({pastEvents.length})</span>
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Empty State */}
            {displayedEvents.length === 0 ? (
              <div className="py-20 text-center border border-dashed border-[#e5e5e5] rounded-[2px] bg-[#fafaf9] p-8">
                <p className="font-instrument text-base text-[#666666]">
                  {eventFilter === 'upcoming'
                    ? 'No upcoming events scheduled right now. Check back soon or view past initiatives.'
                    : 'No past events archived yet.'}
                </p>
                <button
                  type="button"
                  onClick={() => setEventFilter('all')}
                  className="mt-4 px-4 py-2 bg-[#000000] text-white text-xs font-spacemono uppercase tracking-wider rounded-[2px] hover:bg-neutral-800 transition-colors cursor-pointer"
                >
                  View All Events
                </button>
              </div>
            ) : (
              /* Events Grid with Staggered motion.div Entry */
              <motion.div
                key={eventFilter}
                variants={eventsContainerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
              >
                {displayedEvents.map((evt) => {
                  const attachedCount = (evt.galleryImages?.length || 0) + 1;
                  const isPast = isEventPast(evt);

                  return (
                    <motion.div
                      key={evt.id}
                      variants={eventCardVariants}
                      whileHover={{ y: -4, transition: { duration: 0.2 } }}
                      onClick={() => handleOpenEventLightbox(evt)}
                      className="optimus-card group rounded-[2px] overflow-hidden flex flex-col justify-between cursor-pointer border border-[#e5e5e5] bg-white hover:border-[#888888]"
                    >
                      <div>
                        {/* 16:9 Cover Image Header */}
                        <div className="relative w-full aspect-video bg-[#fafaf9] overflow-hidden border-b border-[#e5e5e5]">
                          <img
                            src={evt.coverImage}
                            alt={evt.title}
                            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-102"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

                          {/* Top Overlays */}
                          <div className="absolute top-3 inset-x-3 flex items-center justify-between z-10">
                            {isPast ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[2px] bg-neutral-900/90 text-neutral-200 font-spacemono text-[10px] tracking-wider border border-neutral-700 backdrop-blur-sm">
                                <span className="w-1.5 h-1.5 rounded-[1px] bg-neutral-400" />
                                CONCLUDED · {evt.dateBadge}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[2px] bg-white/95 text-[#000000] font-spacemono text-[10px] tracking-wider border border-[#e5e5e5] backdrop-blur-sm">
                                <span className="w-1.5 h-1.5 rounded-[1px] bg-emerald-600 animate-pulse" />
                                {evt.dateBadge}
                              </span>
                            )}

                            <span className="w-7 h-7 rounded-[2px] bg-white/95 border border-[#e5e5e5] text-[#000000] flex items-center justify-center">
                              <span className="material-symbols-outlined text-[16px]">
                                {evt.icon}
                              </span>
                            </span>
                          </div>

                          {/* Bottom Overlay with Category & Gallery Counter Pill */}
                          <div className="absolute bottom-3 inset-x-3 flex items-center justify-between z-10">
                            <span className="font-spacemono uppercase text-[9px] tracking-widest text-white bg-black/80 px-2 py-0.5 rounded-[2px]">
                              {evt.category}
                            </span>

                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[2px] bg-white text-[#000000] font-spacemono text-[9px] border border-[#e5e5e5]">
                              <Images className="w-3 h-3 text-[#000000]" />
                              <span>{attachedCount} Photos</span>
                            </span>
                          </div>
                        </div>

                        {/* Content Area */}
                        <div className="p-6">
                          <div className="flex items-center justify-between mb-2">
                            {isPast ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded-[2px] border border-neutral-200">
                                <CheckCircle2 className="w-3 h-3 text-neutral-500" />
                                Concluded &amp; Archived
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-[2px] border border-emerald-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                                Upcoming Session
                              </span>
                            )}
                          </div>

                          <h3 className="font-instrument font-normal text-xl text-[#000000] leading-snug mb-2 group-hover:text-neutral-800 transition-colors">
                            {evt.title}
                          </h3>

                          <p className="font-instrument font-normal text-xs sm:text-sm text-[#666666] leading-relaxed line-clamp-2">
                            {evt.shortDescription}
                          </p>
                        </div>
                      </div>

                      {/* Card Action Footer */}
                      <div className="px-6 pb-6 pt-1 flex items-center justify-between border-t border-[#f3f2ee]">
                        <div className="inline-flex items-center gap-1 font-instrument text-xs text-[#000000] group-hover:underline">
                          <span>{isPast ? 'View Recap & Gallery' : 'View Gallery & Details'}</span>
                          <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                        </div>

                        <span className="text-[10px] font-spacemono text-[#888888]">
                          {evt.attendeeCount} {isPast ? 'attended' : 'capacity'}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </div>
        </section>

        {/* ==========================================
            SECTION 4: MEMBERS / TEAM (#fafaf9 surface)
            ========================================== */}
        <section
          id="team"
          className="w-full bg-[#fafaf9] py-24 md:py-32 px-6 lg:px-12 relative scroll-mt-20"
        >
          <div className="max-w-7xl mx-auto">
            {/* Section Header with Scroll Reveal */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-2xl mb-12 sm:mb-16"
            >
              <div className="inline-flex items-center gap-2 mb-3">
                <span className="w-1.5 h-1.5 rounded-[1px] bg-[#888888]" />
                <span className="font-spacemono uppercase tracking-widest text-[10px] text-[#888888]">
                  THE PEOPLE
                </span>
              </div>
              <h2
                style={{ letterSpacing: '-1.5px' }}
                className="font-instrument font-normal text-3xl sm:text-4xl md:text-5xl text-[#000000] leading-tight mb-4"
              >
                Meet the Team
              </h2>
              <p className="font-instrument text-base md:text-lg text-[#666666] leading-relaxed font-normal">
                The structured leadership hierarchy powering innovation, venture incubation, and
                student technology cohorts across MTM College.
              </p>
            </motion.div>

            <div className="space-y-12 sm:space-y-16">
              {/* TIER 1: NODAL OFFICERS & FACULTY ADVISORY */}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="flex items-center gap-2 mb-4 sm:mb-5">
                  <span className="w-1.5 h-1.5 rounded-[1px] bg-[#000000]" />
                  <h3 className="font-spacemono text-xs uppercase tracking-wider text-[#000000]">
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
                      className="optimus-card group rounded-[2px] p-4 sm:p-5 flex flex-col justify-between transition-all duration-200 cursor-pointer hover:border-[#888888] border border-[#e5e5e5] bg-white"
                    >
                      {/* Image */}
                      <div className="w-full aspect-[4/3] sm:aspect-square rounded-[2px] bg-[#fafaf9] flex items-center justify-center overflow-hidden mb-3.5 border border-[#e5e5e5]">
                        {member.photoUrl ? (
                          <img
                            src={member.photoUrl}
                            alt={member.name}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-102"
                          />
                        ) : (
                          <span className="font-instrument font-normal text-2xl sm:text-3xl text-[#000000]">
                            {member.initials}
                          </span>
                        )}
                      </div>

                      {/* Name & Role Only */}
                      <div className="text-center">
                        <h4 className="font-instrument font-normal text-base sm:text-lg text-[#000000] leading-snug truncate">
                          {member.name}
                        </h4>
                        <p className="font-instrument text-xs text-[#666666] font-normal mt-1 truncate">
                          {member.role}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* TIER 2: TEAM EXECUTIVES */}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="flex items-center gap-2 mb-4 sm:mb-5">
                  <span className="w-1.5 h-1.5 rounded-[1px] bg-[#000000]" />
                  <h3 className="font-spacemono text-xs uppercase tracking-wider text-[#000000]">
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
                      className="optimus-card group rounded-[2px] p-3.5 sm:p-4 flex flex-col justify-between transition-all duration-200 cursor-pointer hover:border-[#888888] border border-[#e5e5e5] bg-white"
                    >
                      {/* Image */}
                      <div className="w-full aspect-square rounded-[2px] bg-[#fafaf9] flex items-center justify-center overflow-hidden mb-3 border border-[#e5e5e5]">
                        {member.photoUrl ? (
                          <img
                            src={member.photoUrl}
                            alt={member.name}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-102"
                          />
                        ) : (
                          <span className="font-instrument font-normal text-xl sm:text-2xl text-[#000000]">
                            {member.initials}
                          </span>
                        )}
                      </div>

                      {/* Name & Role Only */}
                      <div className="text-center">
                        <h4 className="font-instrument font-normal text-xs sm:text-sm text-[#000000] leading-tight truncate">
                          {member.name}
                        </h4>
                        <p className="font-instrument text-[11px] text-[#666666] mt-0.5 truncate">
                          {member.role}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* TIER 3: NORMAL MEMBERS / DOMAIN LEADS */}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="flex items-center gap-2 mb-4 sm:mb-5">
                  <span className="w-1.5 h-1.5 rounded-[1px] bg-[#000000]" />
                  <h3 className="font-spacemono text-xs uppercase tracking-wider text-[#000000]">
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
                      className="optimus-card group rounded-[2px] p-3 sm:p-3.5 flex flex-col justify-between transition-all duration-200 cursor-pointer hover:border-[#888888] border border-[#e5e5e5] bg-white"
                    >
                      {/* Image */}
                      <div className="w-full aspect-square rounded-[2px] bg-[#fafaf9] flex items-center justify-center overflow-hidden mb-2.5 border border-[#e5e5e5]">
                        {member.photoUrl ? (
                          <img
                            src={member.photoUrl}
                            alt={member.name}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-102"
                          />
                        ) : (
                          <span className="font-instrument font-normal text-base sm:text-lg text-[#000000]">
                            {member.initials}
                          </span>
                        )}
                      </div>

                      {/* Name & Role Only */}
                      <div className="text-center">
                        <h4 className="font-instrument font-normal text-xs sm:text-sm text-[#000000] leading-tight truncate">
                          {member.name}
                        </h4>
                        <p className="font-instrument text-[11px] text-[#666666] mt-0.5 truncate">
                          {member.role}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      </main>

      {/* ==========================================
          FOOTER (Optimus Design: Minimal, sharp, border-t #e5e5e5)
          ========================================== */}
      <footer className="w-full bg-white border-t border-[#e5e5e5] pt-14 pb-8 font-instrument">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12">
            <div className="md:col-span-5 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <span className="font-instrument text-lg text-[#000000] font-normal tracking-tight">
                  IEDC MTM
                </span>
                <span className="w-1.5 h-1.5 rounded-[1px] bg-[#888888]" />
              </div>
              <p className="font-instrument text-xs sm:text-sm text-[#666666] max-w-sm leading-relaxed">
                {siteSettings.footerDescription || 'Innovation and Entrepreneurship Development Cell, MTM College, Ponnani, Kerala'}
              </p>
            </div>

            <div className="md:col-span-3 flex flex-col gap-3">
              <span className="font-spacemono text-[10px] uppercase text-[#888888] tracking-widest">
                Navigation
              </span>
              <div className="flex flex-col gap-1.5">
                <a
                  href="#home"
                  className="font-instrument text-xs sm:text-sm text-[#666666] hover:text-[#000000] transition-colors"
                >
                  Home
                </a>
                <a
                  href="#about"
                  className="font-instrument text-xs sm:text-sm text-[#666666] hover:text-[#000000] transition-colors"
                >
                  About
                </a>
                <a
                  href="#events"
                  className="font-instrument text-xs sm:text-sm text-[#666666] hover:text-[#000000] transition-colors"
                >
                  Events
                </a>
                <a
                  href="#team"
                  className="font-instrument text-xs sm:text-sm text-[#666666] hover:text-[#000000] transition-colors"
                >
                  Team
                </a>
              </div>
            </div>

            <div className="md:col-span-4 flex flex-col gap-3">
              <span className="font-spacemono text-[10px] uppercase text-[#888888] tracking-widest">
                Connect
              </span>
              <div className="flex items-center gap-2">
                <a
                  href={siteSettings.instagramUrl || 'https://instagram.com'}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Instagram"
                  className="w-8 h-8 rounded-[2px] border border-[#e5e5e5] bg-[#fafaf9] flex items-center justify-center text-[#000000] hover:bg-[#000000] hover:text-white hover:border-[#000000] transition-colors"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
                <a
                  href={siteSettings.linkedinUrl || 'https://linkedin.com'}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="LinkedIn"
                  className="w-8 h-8 rounded-[2px] border border-[#e5e5e5] bg-[#fafaf9] flex items-center justify-center text-[#000000] hover:bg-[#000000] hover:text-white hover:border-[#000000] transition-colors"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                </a>
                <a
                  href={siteSettings.twitterUrl || 'https://twitter.com'}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="X (formerly Twitter)"
                  className="w-8 h-8 rounded-[2px] border border-[#e5e5e5] bg-[#fafaf9] flex items-center justify-center text-[#000000] hover:bg-[#000000] hover:text-white hover:border-[#000000] transition-colors"
                >
                  <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
              </div>

              <div className="flex flex-col gap-1 font-instrument text-xs text-[#666666] mt-1">
                <a
                  href={`mailto:${siteSettings.contactEmail || 'hello@iedcmtm.in'}`}
                  className="hover:text-[#000000] transition-colors flex items-center gap-1.5"
                >
                  <Mail className="w-3 h-3 text-[#888888]" />
                  <span>{siteSettings.contactEmail || 'hello@iedcmtm.in'}</span>
                </a>
                <a
                  href={`tel:${(siteSettings.contactPhone || '+91 98470 00000').replace(/\s/g, '')}`}
                  className="hover:text-[#000000] transition-colors flex items-center gap-1.5"
                >
                  <Phone className="w-3 h-3 text-[#888888]" />
                  <span>{siteSettings.contactPhone || '+91 98470 00000'}</span>
                </a>
              </div>
            </div>
          </div>

          {/* Footer String with Discreet Admin Trigger */}
          <div className="border-t border-[#e5e5e5] pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 font-instrument text-xs text-[#888888]">
            <span>© 2026 IEDC MTM College. All rights reserved.</span>
            <span
              className="inline-flex items-center gap-1.5 text-xs text-[#000000] select-none cursor-default"
            >
              Made by IEDC MTM &lt;3
            </span>
          </div>
        </div>
      </footer>

      {/* ==========================================
          MODALS (100% Read-Only Presentation)
          ========================================== */}
      {/* 1. Expandable Lightbox Gallery Modal for Events */}
      <EventLightboxModal
        event={selectedEvent}
        isOpen={isLightboxOpen}
        onClose={() => {
          setIsLightboxOpen(false);
          setSelectedEvent(null);
        }}
      />

      {/* 2. Join Us / Student Startup Info Modal */}
      <JoinUsModal
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
        siteSettings={siteSettings}
      />

      {/* 3. Member Profile Details Modal */}
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
