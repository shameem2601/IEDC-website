import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User } from 'firebase/auth';
import { signInWithPopup, googleProvider, auth, signOut } from '../lib/firebase';
import { LogIn, LogOut, Ticket, Sparkles, User as UserIcon, X, Menu } from 'lucide-react';

interface NavbarProps {
  user: User | null;
  userRegistrationsCount: number;
  onOpenJoinModal: () => void;
  onOpenUserModal: () => void;
}

interface NavItem {
  id: string;
  label: string;
  href: string;
}

// 4 clean main sections
const NAV_ITEMS: NavItem[] = [
  { id: 'home', label: 'Home', href: '#' },
  { id: 'about', label: 'About', href: '#about' },
  { id: 'events', label: 'Events', href: '#events' },
  { id: 'team', label: 'Team', href: '#team' },
];

export const Navbar: React.FC<NavbarProps> = ({
  user,
  userRegistrationsCount,
  onOpenJoinModal,
  onOpenUserModal,
}) => {
  const [activeSection, setActiveSection] = useState('home');
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);

  // Seamless, gapless scroll spy
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          setIsScrolled(scrollY > 20);

          // If scrolled near page bottom, securely select team
          if (
            window.innerHeight + scrollY >=
            document.documentElement.scrollHeight - 70
          ) {
            setActiveSection('team');
            ticking = false;
            return;
          }

          const teamEl = document.getElementById('team');
          const eventsEl = document.getElementById('events');
          const aboutEl = document.getElementById('about');

          // Trigger offset when section top enters upper viewport
          const triggerOffset = 220;
          const currentPos = scrollY + triggerOffset;

          if (teamEl && currentPos >= teamEl.offsetTop) {
            setActiveSection('team');
          } else if (eventsEl && currentPos >= eventsEl.offsetTop) {
            setActiveSection('events');
          } else if (aboutEl && currentPos >= aboutEl.offsetTop) {
            setActiveSection('about');
          } else {
            setActiveSection('home');
          }

          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (item: NavItem) => {
    setActiveSection(item.id);
    setMobileMenuOpen(false);

    if (item.id === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const targetEl = document.getElementById(item.id);
      if (targetEl) {
        const offset = 85;
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

  const handleGoogleSignIn = async () => {
    setAuthLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: unknown) {
      console.error('Google sign-in error:', err);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setUserDropdownOpen(false);
    } catch (err) {
      console.error('Sign-out error:', err);
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
                        stiffness: 440,
                        damping: 32,
                        mass: 0.75,
                      }}
                    />
                  )}

                  <span className="relative z-10">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action Cluster: Join Us & Auth / Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Join Us / Apply Button */}
            <button
              type="button"
              onClick={onOpenJoinModal}
              className="bg-[#5231FF] text-white text-xs sm:text-sm font-semibold px-4 sm:px-5 py-2 rounded-full shadow-[0_4px_16px_rgba(82,49,255,0.28)] hover:shadow-[0_8px_24px_rgba(82,49,255,0.45)] hover:brightness-110 hover:scale-105 active:scale-95 transition-all duration-300 inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Join Us</span>
            </button>

            {/* User Profile / Google Sign-In Pill */}
            <div className="relative">
              {user ? (
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  aria-label="User Account"
                  className="w-9 h-9 rounded-full bg-white border border-[#5231FF]/20 flex items-center justify-center overflow-hidden transition-all duration-300 hover:scale-105 shadow-sm hover:border-[#5231FF] cursor-pointer"
                >
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'User'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#5231FF] text-white flex items-center justify-center font-bold text-xs">
                      {user.displayName?.charAt(0) || 'U'}
                    </div>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={authLoading}
                  title="Sign In with Google"
                  className="w-9 h-9 rounded-full bg-white border border-black/10 flex items-center justify-center text-[#5231FF] hover:bg-[#5231FF] hover:text-white hover:border-[#5231FF] transition-all duration-300 hover:scale-105 shadow-xs cursor-pointer"
                >
                  {authLoading ? (
                    <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <UserIcon className="w-4 h-4" />
                  )}
                </button>
              )}

              {/* User Dropdown */}
              <AnimatePresence>
                {userDropdownOpen && user && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-3 w-64 liquid-glass-nav rounded-2xl p-4 shadow-xl border border-white/90 z-50 text-left"
                  >
                    <div className="flex items-center gap-3 pb-3 border-b border-black/5">
                      {user.photoURL ? (
                        <img
                          src={user.photoURL}
                          alt={user.displayName || ''}
                          className="w-10 h-10 rounded-full border border-black/10"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-[#5231FF] text-white font-bold flex items-center justify-center">
                          {user.displayName?.charAt(0) || 'U'}
                        </div>
                      )}
                      <div className="overflow-hidden">
                        <p className="text-sm font-bold text-[#111114] truncate">
                          {user.displayName || 'Innovator'}
                        </p>
                        <p className="text-xs text-[#6B6B74] truncate">{user.email}</p>
                      </div>
                    </div>

                    <div className="py-2 flex flex-col gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setUserDropdownOpen(false);
                          onOpenUserModal();
                        }}
                        className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-[#111114] rounded-xl hover:bg-black/5 transition-colors cursor-pointer text-left"
                      >
                        <span className="flex items-center gap-2">
                          <Ticket className="w-4 h-4 text-[#5231FF]" />
                          My Registrations
                        </span>
                        <span className="bg-[#5231FF]/10 text-[#5231FF] px-2 py-0.5 rounded-full text-[11px] font-mono font-bold">
                          {userRegistrationsCount}
                        </span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-600 rounded-xl hover:bg-rose-50 transition-colors cursor-pointer text-left border-t border-black/5 mt-1"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile Hamburger Toggle (Mobile/Android) */}
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

      {/* Mobile Drawer (Clean, tailored for Android & iOS mobile without desktop capsule) */}
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

            <div className="pt-3 border-t border-black/5 flex items-center justify-between">
              {user ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#6B6B74]">Signed in as:</span>
                  <span className="text-xs font-bold text-[#111114] truncate max-w-[150px]">
                    {user.displayName || user.email}
                  </span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-white border border-black/10 rounded-xl text-xs font-semibold text-[#111114] shadow-xs cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5 text-[#5231FF]" />
                  Sign In with Google
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
