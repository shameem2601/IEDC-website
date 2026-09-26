import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Phone, MapPin, Building, ArrowUpRight } from 'lucide-react';
import { SiteSettings } from '../types';

interface JoinUsModalProps {
  isOpen: boolean;
  onClose: () => void;
  siteSettings?: SiteSettings;
}

export const JoinUsModal: React.FC<JoinUsModalProps> = ({ isOpen, onClose, siteSettings }) => {
  if (!isOpen) return null;

  const email = siteSettings?.contactEmail || 'hello@iedcmtm.in';
  const phone = siteSettings?.contactPhone || '+91 98470 00000';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 font-instrument">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#0B0B0E]/80 backdrop-blur-md"
        />

        {/* Modal Window (Read-Only Informational Card) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 16 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-lg bg-white rounded-[2px] shadow-2xl p-6 sm:p-8 z-10 border border-[#e5e5e5]"
        >
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-[2px] border border-[#e5e5e5] bg-white hover:bg-black hover:text-white flex items-center justify-center transition-colors cursor-pointer text-[#000000]"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Tag */}
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="w-1.5 h-1.5 rounded-[1px] bg-[#000000]" />
            <span className="font-spacemono uppercase tracking-widest text-[10px] text-[#888888]">
              STUDENT COHORTS &amp; VENTURES
            </span>
          </div>

          <h2
            style={{ letterSpacing: '-1px' }}
            className="font-instrument font-normal text-2xl sm:text-3xl text-[#000000] leading-tight mb-3"
          >
            Join IEDC MTM College
          </h2>

          <p className="font-instrument text-sm sm:text-base text-[#666666] leading-relaxed mb-6 font-normal">
            Cohort admissions, lab access, and pre-incubation grants are facilitated directly on-campus
            through the collegiate innovation desk and orientation sessions.
          </p>

          {/* Official Contact Info Cards (Read-only, no inputs) */}
          <div className="space-y-3 mb-6">
            <div className="p-3.5 rounded-[2px] bg-[#fafaf9] border border-[#e5e5e5] flex items-center gap-3">
              <span className="w-8 h-8 rounded-[2px] bg-white border border-[#e5e5e5] text-[#000000] flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4" />
              </span>
              <div>
                <span className="text-[10px] font-spacemono uppercase tracking-wider text-[#888888] block">
                  Campus Location
                </span>
                <span className="text-xs sm:text-sm font-medium text-[#000000]">
                  Innovation &amp; Prototyping Lab, MTM College Ponnani
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-[2px] bg-[#fafaf9] border border-[#e5e5e5] flex items-center gap-3">
              <span className="w-8 h-8 rounded-[2px] bg-white border border-[#e5e5e5] text-[#000000] flex items-center justify-center shrink-0">
                <Building className="w-4 h-4" />
              </span>
              <div>
                <span className="text-[10px] font-spacemono uppercase tracking-wider text-[#888888] block">
                  Leadership Desk
                </span>
                <span className="text-xs sm:text-sm font-medium text-[#000000]">
                  Dr. K. M. Abdul Gafoor (Faculty Nodal Officer)
                </span>
              </div>
            </div>

            <a
              href={`mailto:${email}`}
              className="p-3.5 rounded-[2px] bg-[#fafaf9] border border-[#e5e5e5] hover:border-[#000000] transition-colors flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-[2px] bg-white border border-[#e5e5e5] text-[#000000] flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4" />
                </span>
                <div>
                  <span className="text-[10px] font-spacemono uppercase tracking-wider text-[#888888] block">
                    Official Inquiries
                  </span>
                  <span className="text-xs sm:text-sm font-medium text-[#000000] group-hover:underline">
                    {email}
                  </span>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-[#888888] group-hover:text-black transition-colors" />
            </a>

            {phone && (
              <a
                href={`tel:${phone}`}
                className="p-3.5 rounded-[2px] bg-[#fafaf9] border border-[#e5e5e5] hover:border-[#000000] transition-colors flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-[2px] bg-white border border-[#e5e5e5] text-[#000000] flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4" />
                  </span>
                  <div>
                    <span className="text-[10px] font-spacemono uppercase tracking-wider text-[#888888] block">
                      Phone
                    </span>
                    <span className="text-xs sm:text-sm font-medium text-[#000000] group-hover:underline">
                      {phone}
                    </span>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-[#888888] group-hover:text-black transition-colors" />
              </a>
            )}
          </div>

          {/* Action Button */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#e5e5e5]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs text-[#666666] hover:text-[#000000] cursor-pointer"
            >
              Close
            </button>
            <a
              href={`mailto:${email}?subject=Inquiry%20regarding%20IEDC%20MTM%20Cohort`}
              className="px-5 py-2 bg-[#000000] text-white text-xs font-medium rounded-[2px] hover:bg-neutral-800 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
            >
              <span>Email Innovation Desk</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
