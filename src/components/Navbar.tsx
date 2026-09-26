import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowUpRight, X, Menu } from 'lucide-react';
import { useScrollPosition } from '../hooks/useScrollPosition';

interface NavbarProps {
  onOpenJoinModal: () => void;
}

interface NavItem {
  id: string;
  label: string;
  href: string;
}

// 4 clean main sections
const NAV_ITEMS: NavItem[] = [
  { id: 'home', label: 'Home', href: '#home' },
  { id: 'about', label: 'About', href: '#about' },
  { id: 'events', label: 'Events', href: '#events' },
  { id: 'team', label: 'Team', href: '#team' },
];

export const Navbar: React.FC<NavbarProps> = ({
  onOpenJoinModal,
}) => {
  // Hook tracking scroll position to detect scrolling past hero & threshold of 100px
  const { isScrolled } = useScrollPosition(100);

  const [activeSection, setActiveSection] = useState('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Lock to prevent scroll-spy from intermediate state flickering during smooth navigation clicks
  const isManualClickRef = useRef(false);
  const manualClickTimeoutRef = useRef<number | null>(null);

  // Sync initial hash on mount (e.g. if arriving via direct link like #events or #about)
  useEffect(() => {
    const initialHash = window.location.hash.replace('#', '');
    if (initialHash && ['home', 'about', 'events', 'team'].includes(initialHash)) {
      setActiveSection(initialHash);
      const timer = setTimeout(() => {
        if (initialHash === 'home') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          const el = document.getElementById(initialHash);
          if (el) {
            const offset = 80;
            const bodyRect = document.body.getBoundingClientRect().top;
            const elementRect = el.getBoundingClientRect().top;
            const elementPosition = elementRect - bodyRect;
            window.scrollTo({
              top: elementPosition - offset,
              behavior: 'smooth',
            });
          }
        }
      }, 150);
      return () => clearTimeout(timer);
    }
  }, []);

  // Seamless, continuous scroll spy that updates activeSection and URL hash
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollY = window.scrollY;

          // If user clicked a navigation item, do NOT let passing sections interrupt the capsule slide
          if (isManualClickRef.current) {
            ticking = false;
            return;
          }

          let currentSection = 'home';

          // If scrolled near page bottom, securely select team
          if (
            window.innerHeight + scrollY >=
            document.documentElement.scrollHeight - 70
          ) {
            currentSection = 'team';
          } else {
            const teamEl = document.getElementById('team');
            const eventsEl = document.getElementById('events');
            const aboutEl = document.getElementById('about');

            // Trigger offset when section top enters upper viewport
            const triggerOffset = 220;
            const currentPos = scrollY + triggerOffset;

            if (teamEl && currentPos >= teamEl.offsetTop) {
              currentSection = 'team';
            } else if (eventsEl && currentPos >= eventsEl.offsetTop) {
              currentSection = 'events';
            } else if (aboutEl && currentPos >= aboutEl.offsetTop) {
              currentSection = 'about';
            } else {
              currentSection = 'home';
            }
          }

          setActiveSection(currentSection);

          // Update URL hash smoothly without causing physical page jumps or disconnection
          const targetHash = `#${currentSection}`;
          if (window.location.hash !== targetHash) {
            window.history.replaceState(null, '', targetHash);
          }

          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (manualClickTimeoutRef.current) {
        clearTimeout(manualClickTimeoutRef.current);
      }
    };
  }, []);

  const handleNavClick = (item: NavItem) => {
    // 1. Instantly set target section so the capsule glides directly without hesitation
    setActiveSection(item.id);
    setMobileMenuOpen(false);

    // 2. Lock scroll spy during smooth scroll transition
    isManualClickRef.current = true;
    if (manualClickTimeoutRef.current) {
      clearTimeout(manualClickTimeoutRef.current);
    }
    manualClickTimeoutRef.current = window.setTimeout(() => {
      isManualClickRef.current = false;
    }, 850);

    // 3. Update URL hash directly
    window.history.pushState(null, '', `#${item.id}`);

    // 4. Smoothly scroll to target
    if (item.id === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const targetEl = document.getElementById(item.id);
      if (targetEl) {
        const offset = 80;
        const bodyRect = document.body.getBoundingClientRect().top;
        const elementRect = targetEl.getBoundingClientRect().top;
        const elementPosition = elementRect - bodyRect;
        const offsetPosition = elementPosition - offset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth',
        });
      }
    }
  };

  return (
    <>
      <header className={`navbar-wrapper ${isScrolled ? 'is-scrolled' : ''}`}>
        <div
          className={`optimus-nav liquid-glass-nav pointer-events-auto flex items-center justify-between ${
            isScrolled ? 'is-scrolled' : ''
          }`}
        >
          {/* Logo (Instrument Sans 400 with technical precision) */}
          <button
            type="button"
            onClick={() => handleNavClick(NAV_ITEMS[0])}
            className="group flex items-center gap-2 focus:outline-none select-none cursor-pointer bg-transparent border-0 p-0"
          >
            <span className="font-instrument text-base sm:text-lg text-[#000000] font-normal tracking-tight">
              IEDC MTM
            </span>
            <span className="w-1.5 h-1.5 rounded-[1px] bg-[#888888] inline-block group-hover:bg-[#000000] transition-colors" />
          </button>

          {/* Desktop Navigation with Frosted Liquid Glass Sliding Capsule */}
          <nav
            role="tablist"
            className="hidden md:flex items-center gap-0.5 p-1 bg-white/40 backdrop-blur-md border border-[#e5e5e5]/80 rounded-[2px] relative shadow-[inset_0_1px_1px_rgba(255,255,255,0.7)]"
          >
            {NAV_ITEMS.map((item) => {
              const isActive = activeSection === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => handleNavClick(item)}
                  className={`relative px-4 py-1 text-center text-xs sm:text-sm font-normal rounded-[2px] transition-colors duration-150 select-none cursor-pointer flex items-center justify-center font-instrument ${
                    isActive ? 'text-[#000000] font-medium' : 'text-[#666666] hover:text-[#000000]'
                  }`}
                >
                  {/* Frosted Glass Sliding Capsule */}
                  {isActive && (
                    <motion.div
                      layoutId="active-nav-capsule"
                      className="absolute inset-0 bg-white/85 backdrop-blur-md rounded-[2px] border border-white/90 shadow-[inset_0_1px_1.5px_rgba(255,255,255,1),0_2px_6px_rgba(0,0,0,0.04)] z-0"
                      transition={{
                        type: 'spring',
                        stiffness: 500,
                        damping: 35,
                        mass: 0.55,
                      }}
                    />
                  )}

                  <span className="relative z-10">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action Cluster: Frosted Liquid Glass Join Us button */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenJoinModal}
              className="btn-liquid-glass text-xs font-medium px-3.5 py-1.5 inline-flex items-center gap-1.5 cursor-pointer font-instrument select-none"
            >
              <span>Join Us</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>

            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden w-8 h-8 rounded-[2px] bg-white/60 backdrop-blur-md border border-[#e5e5e5] flex items-center justify-center text-[#000000] hover:bg-white/90 transition-all focus:outline-none shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)]"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className={`fixed ${
              isScrolled ? 'top-18 sm:top-20' : 'top-20 sm:top-22'
            } left-4 right-4 z-40 max-w-[1100px] mx-auto bg-white/90 backdrop-blur-xl rounded-[2px] p-4 flex flex-col gap-2 shadow-2xl border border-white/60 md:hidden`}
          >
            <div className="flex flex-col gap-1">
              {NAV_ITEMS.map((item) => {
                const isActive = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleNavClick(item)}
                    className={`w-full text-left px-3 py-2 rounded-[2px] font-instrument text-sm transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-black text-white font-medium'
                        : 'text-[#666666] hover:text-[#000000] hover:bg-black/5'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>

            <div className="pt-3 border-t border-[#e5e5e5] flex items-center">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenJoinModal();
                }}
                className="w-full py-2.5 px-3 btn-liquid-glass rounded-[2px] text-xs font-medium flex items-center justify-center gap-1.5 cursor-pointer font-instrument"
              >
                <span>Join Us</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
