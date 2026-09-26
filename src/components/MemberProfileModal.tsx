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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
        {/* Backdrop click to close */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0"
        />

        {/* Modal Dialog (Optimus Sharp Technical Window) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: 8 }}
          transition={{ duration: 0.18 }}
          className="relative w-full max-w-md bg-white rounded-[2px] shadow-2xl border border-[#e5e5e5] p-6 sm:p-7 overflow-hidden z-10"
        >
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Profile"
            className="absolute top-4 right-4 w-7 h-7 rounded-[2px] border border-[#e5e5e5] bg-white hover:bg-[#fafaf9] text-[#000000] flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Member Card Details */}
          <div className="flex flex-col items-center text-center">
            {/* Image / Avatar */}
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-[2px] bg-[#fafaf9] border border-[#e5e5e5] overflow-hidden mb-4 flex items-center justify-center">
              {member.photoUrl ? (
                <img
                  src={member.photoUrl}
                  alt={member.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="font-instrument text-2xl sm:text-3xl text-[#000000]">
                  {member.initials}
                </span>
              )}
            </div>

            {/* Hierarchy Badge */}
            <span className="font-spacemono uppercase tracking-wider text-[10px] text-[#666666] border border-[#e5e5e5] bg-[#fafaf9] px-2.5 py-0.5 rounded-[2px] mb-2">
              {hierarchyLabel}
            </span>

            {/* Name */}
            <h3 className="font-instrument font-normal text-xl sm:text-2xl text-[#000000] mb-0.5 tracking-tight">
              {member.name}
            </h3>

            {/* Role */}
            <p className="font-instrument text-xs text-[#666666] mb-5">
              {member.role}
            </p>

            {/* Social / Contact Links */}
            <div className="w-full space-y-2 pt-4 border-t border-[#e5e5e5]">
              {member.linkedin ? (
                <a
                  href={member.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 px-3 rounded-[2px] bg-[#fafaf9] hover:bg-[#000000] text-[#000000] hover:text-white border border-[#e5e5e5] hover:border-black font-instrument text-xs flex items-center justify-between transition-colors group"
                >
                  <div className="flex items-center gap-2">
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                    </svg>
                    <span>LinkedIn Profile</span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100" />
                </a>
              ) : null}

              {member.instagram ? (
                <a
                  href={member.instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 px-3 rounded-[2px] bg-[#fafaf9] hover:bg-[#000000] text-[#000000] hover:text-white border border-[#e5e5e5] hover:border-black font-instrument text-xs flex items-center justify-between transition-colors group"
                >
                  <div className="flex items-center gap-2">
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                    <span>Instagram Profile</span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100" />
                </a>
              ) : null}

              {!member.linkedin && !member.instagram && (
                <p className="font-instrument text-xs text-[#666666] py-1">
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
