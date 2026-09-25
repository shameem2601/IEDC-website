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
                    <span className="material-symbols-outlined text-[18px]">work</span>
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
                    <span className="material-symbols-outlined text-[18px]">photo_camera</span>
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
