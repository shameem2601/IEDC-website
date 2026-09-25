import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, X, Menu } from 'lucide-react';

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
  const [activeSection, setActiveSection] = useState('home');
  const [isScrolled, setIsScrolled] = useState(false);
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
          setIsScrolled(scrollY > 20);

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
      <header className="fixed top-0 left-0 right-0 z-50 flex justify-center px-3 sm:px-6 pt-3 sm:pt-6 pointer-events-none">
        <div
          className={`pointer-events-auto w-full max-w-[1100px] h-16 rounded-full px-4 sm:px-6 flex items-center justify-between transition-all duration-400 liquid-glass-nav ${
            isScrolled ? 'is-scrolled' : ''
          }`}
        >
          {/* Logo */}
          <button
            type="button"
            onClick={() => handleNavClick(NAV_ITEMS[0])}
            className="group flex items-center gap-1.5 focus:outline-none select-none cursor-pointer bg-transparent border-0 p-0"
          >
            <span className="font-clash text-lg sm:text-xl text-[#111114] font-bold tracking-tight group-hover:text-[#5231FF] transition-colors">
              IEDC MTM
            </span>
            <span className="w-2 h-2 rounded-full bg-[#5231FF] inline-block group-hover:scale-125 transition-transform duration-300 shadow-[0_0_8px_rgba(82,49,255,0.4)]" />
          </button>

          {/* Desktop Navigation with Perfectly Aligned Capsule */}
          <nav
            role="tablist"
            className="hidden md:flex items-center gap-1 p-1 bg-black/[0.04] border border-black/[0.05] rounded-full relative"
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
                  className={`relative px-4 py-1.5 min-w-[74px] text-center text-sm font-semibold rounded-full transition-colors duration-200 select-none cursor-pointer flex items-center justify-center ${
                    isActive ? 'text-[#111114]' : 'text-[#6B6B74] hover:text-[#111114]'
                  }`}
                >
                  {/* Shared Layout Capsule with Exact inset-0 Pill Alignment */}
                  {isActive && (
                    <motion.div
                      layoutId="active-nav-capsule"
                      className="absolute inset-0 bg-white rounded-full shadow-[0_2px_10px_rgba(82,49,255,0.12),0_1px_3px_rgba(0,0,0,0.08)] border border-black/[0.06] z-0"
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

          {/* Right Action Cluster: Join Us (No Login & No CMS Button) */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Join Us / Apply Button */}
            <button
              type="button"
              onClick={onOpenJoinModal}
              className="bg-[#5231FF] text-white text-xs sm:text-sm font-semibold px-4 sm:px-5 py-2 rounded-full shadow-[0_4px_16px_rgba(82,49,255,0.28)] hover:shadow-[0_8px_24px_rgba(82,49,255,0.45)] hover:brightness-110 hover:scale-105 active:scale-95 transition-all duration-300 inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Join Us</span>
            </button>

            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden w-9 h-9 rounded-full flex items-center justify-center text-[#111114] hover:bg-black/5 transition-colors focus:outline-none"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer (No Login) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="fixed top-20 left-4 right-4 z-40 max-w-[1100px] mx-auto liquid-glass-nav rounded-2xl p-5 flex flex-col gap-2 shadow-2xl border border-white/90 md:hidden"
          >
            <div className="flex flex-col gap-1">
              {NAV_ITEMS.map((item) => {
                const isActive = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleNavClick(item)}
                    className={`w-full text-left px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 cursor-pointer ${
                      isActive
                        ? 'bg-[#5231FF] text-white font-bold shadow-sm'
                        : 'text-[#6B6B74] hover:text-[#111114] hover:bg-black/5'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>

            <div className="pt-3 border-t border-black/5 flex items-center">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenJoinModal();
                }}
                className="w-full py-2.5 px-4 bg-[#5231FF] text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Join Us</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
