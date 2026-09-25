import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User } from 'firebase/auth';
import { EventItem, EventRegistration } from '../types';
import { X, Ticket, Calendar, MapPin, ArrowRight, ExternalLink } from 'lucide-react';

interface UserRegistrationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  registrations: EventRegistration[];
  events: EventItem[];
  onSelectEvent: (event: EventItem) => void;
}

export const UserRegistrationsModal: React.FC<UserRegistrationsModalProps> = ({
  isOpen,
  onClose,
  user,
  registrations,
  events,
  onSelectEvent,
}) => {
  if (!isOpen || !user) return null;

  const registeredEvents = events.filter((e) =>
    registrations.some((r) => r.eventId === e.id)
  );

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#0B0B0E]/70 backdrop-blur-md"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          className="relative w-full max-w-lg bg-white rounded-[28px] shadow-2xl p-6 sm:p-8 z-10 border border-white/80 max-h-[85vh] overflow-y-auto no-scrollbar"
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-black/5 hover:bg-[#5231FF] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <Ticket className="w-5 h-5 text-[#5231FF]" />
            <span className="font-spacemono uppercase tracking-wider text-xs font-bold text-[#6B6B74]">
              YOUR EVENT TICKETS
            </span>
          </div>

          <h2 className="font-clash font-bold text-2xl text-[#111114] mb-1">
            Registered Initiatives
          </h2>
          <p className="font-general text-xs text-[#6B6B74] mb-6">
            Signed in as <span className="font-semibold text-[#111114]">{user.email}</span>. Show
            this digital pass at the entrance desk.
          </p>

          {registeredEvents.length === 0 ? (
            <div className="py-12 text-center bg-[#F6F6F8] rounded-2xl p-6">
              <Ticket className="w-10 h-10 text-[#6B6B74] mx-auto mb-3 opacity-50" />
              <p className="font-clash font-semibold text-[#111114] mb-1">No Registrations Yet</p>
              <p className="text-xs text-[#6B6B74] max-w-xs mx-auto mb-4">
                Explore the upcoming hackathons, pitch clinics, and conclaves on the events section.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 bg-[#5231FF] text-white text-xs font-semibold rounded-full hover:brightness-110 cursor-pointer"
              >
                Browse Events
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {registeredEvents.map((evt) => (
                <div
                  key={evt.id}
                  className="p-4 rounded-2xl bg-[#F6F6F8] border border-black/5 flex flex-col justify-between hover:border-[#5231FF]/30 transition-all group"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <span className="inline-block text-[10px] font-spacemono uppercase font-bold text-[#5231FF] bg-[#5231FF]/10 px-2 py-0.5 rounded mb-1">
                        {evt.category}
                      </span>
                      <h4 className="font-clash font-bold text-base text-[#111114] leading-snug">
                        {evt.title}
                      </h4>
                    </div>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 flex-shrink-0 mt-1" title="Confirmed" />
                  </div>

                  <div className="flex items-center gap-4 text-xs text-[#6B6B74] mt-1 mb-3">
                    <span className="flex items-center gap-1 font-spacemono">
                      <Calendar className="w-3.5 h-3.5" />
                      {evt.dateBadge}
                    </span>
                    <span className="flex items-center gap-1 line-clamp-1">
                      <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                      {evt.location.split(',')[0]}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-black/5 flex items-center justify-between">
                    <span className="text-[11px] font-spacemono text-emerald-600 font-bold">
                      ✓ PASS CONFIRMED
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onSelectEvent(evt);
                      }}
                      className="text-xs font-semibold text-[#5231FF] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>View Gallery &amp; Details</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
