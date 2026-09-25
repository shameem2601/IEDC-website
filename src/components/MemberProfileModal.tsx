import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ExternalLink } from 'lucide-react';
import { TeamMember } from '../types';

interface MemberProfileModalProps {
  member: TeamMember | null;
  isOpen: boolean;
  onClose: () => void;
}

export const MemberProfileModal: React.FC<MemberProfileModalProps> = ({
  member,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !member) return null;

  const hierarchyLabel =
    member.hierarchy === 'nodal'
      ? 'Faculty Leadership'
      : member.hierarchy === 'executive'
      ? 'Executive Council'
      : 'Domain Lead & Innovator';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
        {/* Backdrop click to close */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0"
        />

        {/* Modal Dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 26, stiffness: 320 }}
          className="relative w-full max-w-md bg-white rounded-[28px] shadow-2xl border border-black/10 p-6 sm:p-8 overflow-hidden z-10"
        >
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Profile"
            className="absolute top-5 right-5 w-9 h-9 rounded-full bg-black/5 hover:bg-black/10 text-[#111114] flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Member Card Details */}
          <div className="flex flex-col items-center text-center">
            {/* Image / Avatar */}
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-[#F6F6F8] border border-black/10 overflow-hidden shadow-sm mb-5 flex items-center justify-center">
              {member.photoUrl ? (
                <img
                  src={member.photoUrl}
                  alt={member.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="font-clash font-bold text-3xl sm:text-4xl text-[#5231FF]">
                  {member.initials}
                </span>
              )}
            </div>

            {/* Hierarchy Badge */}
            <span className="font-spacemono uppercase tracking-wider text-[11px] font-bold text-[#5231FF] bg-[#5231FF]/8 px-3 py-1 rounded-full mb-2">
              {hierarchyLabel}
            </span>

            {/* Name */}
            <h3 className="font-clash font-bold text-2xl text-[#111114] mb-1">
              {member.name}
            </h3>

            {/* Role */}
            <p className="font-general text-sm font-semibold text-[#6B6B74] mb-6">
              {member.role}
            </p>

            {/* Social / Contact Links */}
            <div className="w-full space-y-2.5 pt-4 border-t border-black/5">
              {member.linkedin ? (
                <a
                  href={member.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-3 px-4 rounded-2xl bg-[#0A66C2]/10 hover:bg-[#0A66C2] text-[#0A66C2] hover:text-white font-semibold text-xs sm:text-sm flex items-center justify-between transition-all duration-200 group"
                >
                  <div className="flex items-center gap-2.5">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                    </svg>
                    <span>Connect on LinkedIn</span>
                  </div>
                  <ExternalLink className="w-4 h-4 opacity-70 group-hover:opacity-100" />
                </a>
              ) : null}

              {member.instagram ? (
                <a
                  href={member.instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-[#833AB4]/10 via-[#FD1D1D]/10 to-[#FCB045]/10 hover:from-[#833AB4] hover:to-[#FD1D1D] text-[#833AB4] hover:text-white font-semibold text-xs sm:text-sm flex items-center justify-between transition-all duration-200 group"
                >
                  <div className="flex items-center gap-2.5">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                    <span>Follow on Instagram</span>
                  </div>
                  <ExternalLink className="w-4 h-4 opacity-70 group-hover:opacity-100" />
                </a>
              ) : null}

              {!member.linkedin && !member.instagram && (
                <p className="text-xs text-[#6B6B74] py-2">
                  No public social profiles linked for this member.
                </p>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
