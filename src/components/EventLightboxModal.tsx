import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { EventItem } from '../types';
import { isEventPast } from '../lib/dateUtils';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Calendar,
  MapPin,
  Clock,
  Users,
  CheckCircle2,
  Share2,
  ZoomIn,
  ZoomOut,
  Layers,
} from 'lucide-react';

interface EventLightboxModalProps {
  event: EventItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const EventLightboxModal: React.FC<EventLightboxModalProps> = ({
  event,
  isOpen,
  onClose,
}) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [activeTab, setActiveTab] = useState<'gallery' | 'details' | 'schedule'>('gallery');
  const [copySuccess, setCopySuccess] = useState(false);

  // Reset index when event changes
  useEffect(() => {
    setActiveImageIndex(0);
    setIsZoomed(false);
  }, [event?.id]);

  // Combine cover image as item 0 with the other attached images from Sanity
  const allImages = event ? [event.coverImage, ...(event.galleryImages || [])] : [];

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight' && allImages.length > 1) {
        setActiveImageIndex((prev) => (prev + 1) % allImages.length);
      } else if (e.key === 'ArrowLeft' && allImages.length > 1) {
        setActiveImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, allImages.length, onClose]);

  if (!isOpen || !event) return null;

  const isPast = isEventPast(event);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: event.title,
        text: `Check out ${event.title} at IEDC MTM College!`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 md:p-8">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#0B0B0E]/80 backdrop-blur-xl"
        />

        {/* Modal Window (100% Read-Only Presentation Showcase) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: 12 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-6xl max-h-[92vh] bg-white rounded-[2px] shadow-2xl overflow-hidden flex flex-col z-10 border border-[#e5e5e5] font-instrument"
        >
          {/* Header Bar */}
          <div className="px-6 py-4 border-b border-[#e5e5e5] flex items-center justify-between bg-white sticky top-0 z-20">
            <div className="flex items-center gap-3 truncate pr-4">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[2px] bg-[#fafaf9] border border-[#e5e5e5] text-[#000000] font-spacemono text-[10px] uppercase tracking-wider">
                <span className={`w-1.5 h-1.5 rounded-[1px] ${isPast ? 'bg-neutral-500' : 'bg-[#000000]'}`} />
                {event.category}
              </span>
              {isPast && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[2px] bg-neutral-900 text-neutral-200 font-spacemono text-[9px] uppercase tracking-wider">
                  Concluded · Archive
                </span>
              )}
              <h2 className="font-instrument font-normal text-lg sm:text-xl text-[#000000] truncate">
                {event.title}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleShare}
                className="w-8 h-8 rounded-[2px] border border-[#e5e5e5] bg-white hover:bg-[#fafaf9] text-[#000000] flex items-center justify-center transition-colors cursor-pointer"
                title="Share event link"
              >
                <Share2 className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-[2px] border border-[#e5e5e5] bg-white hover:bg-[#000000] hover:text-white text-[#000000] flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Close Lightbox"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Sub Navigation Bar inside Modal */}
          <div className="flex items-center justify-between px-6 py-2.5 bg-[#fafaf9] border-b border-[#e5e5e5] text-xs font-normal">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setActiveTab('gallery')}
                className={`px-3 py-1 rounded-[2px] transition-colors cursor-pointer text-xs font-instrument ${
                  activeTab === 'gallery'
                    ? 'bg-[#000000] text-white font-medium'
                    : 'text-[#666666] hover:text-[#000000]'
                }`}
              >
                Photo Gallery ({allImages.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('details')}
                className={`px-3 py-1 rounded-[2px] transition-colors cursor-pointer text-xs font-instrument ${
                  activeTab === 'details'
                    ? 'bg-[#000000] text-white font-medium'
                    : 'text-[#666666] hover:text-[#000000]'
                }`}
              >
                Event Details &amp; Mentors
              </button>
              {event.schedule && event.schedule.length > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveTab('schedule')}
                  className={`px-3 py-1 rounded-[2px] transition-colors cursor-pointer text-xs font-instrument ${
                    activeTab === 'schedule'
                      ? 'bg-[#000000] text-white font-medium'
                      : 'text-[#666666] hover:text-[#000000]'
                  }`}
                >
                  Schedule
                </button>
              )}
            </div>

            {copySuccess && (
              <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-[2px] border border-emerald-200">
                Link copied to clipboard!
              </span>
            )}
          </div>

          {/* Modal Body */}
          <div className="flex-1 overflow-y-auto max-h-[calc(92vh-130px)] bg-[#fafaf9]">
            {activeTab === 'gallery' ? (
              <div className="p-4 sm:p-6 flex flex-col items-center">
                {/* Main Selected Image Stage */}
                <div className="relative w-full aspect-video max-h-[58vh] bg-black rounded-[2px] overflow-hidden flex items-center justify-center border border-[#e5e5e5]">
                  {allImages.length > 0 ? (
                    <motion.img
                      key={activeImageIndex}
                      src={allImages[activeImageIndex]}
                      alt={`${event.title} - ${activeImageIndex + 1}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                      className={`w-full h-full object-contain select-none transition-transform duration-300 ${
                        isZoomed ? 'scale-125 cursor-zoom-out' : 'cursor-zoom-in'
                      }`}
                      onClick={() => setIsZoomed(!isZoomed)}
                    />
                  ) : (
                    <div className="text-neutral-500 font-spacemono text-xs">No photos uploaded</div>
                  )}

                  {/* Previous / Next Arrows */}
                  {allImages.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
                        }}
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-[2px] bg-black/70 hover:bg-black text-white flex items-center justify-center transition-all backdrop-blur-xs cursor-pointer"
                        aria-label="Previous photo"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveImageIndex((prev) => (prev + 1) % allImages.length);
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-[2px] bg-black/70 hover:bg-black text-white flex items-center justify-center transition-all backdrop-blur-xs cursor-pointer"
                        aria-label="Next photo"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </>
                  )}

                  {/* Image Counter & Zoom pill */}
                  <div className="absolute bottom-3 inset-x-3 flex items-center justify-between pointer-events-none">
                    <span className="font-spacemono text-[10px] text-white bg-black/75 backdrop-blur-xs px-2.5 py-1 rounded-[2px]">
                      {activeImageIndex + 1} / {allImages.length}
                    </span>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsZoomed(!isZoomed);
                      }}
                      className="pointer-events-auto p-1.5 rounded-[2px] bg-black/75 hover:bg-black text-white backdrop-blur-xs transition-colors cursor-pointer"
                      title={isZoomed ? 'Zoom out' : 'Zoom in'}
                    >
                      {isZoomed ? <ZoomOut className="w-3.5 h-3.5" /> : <ZoomIn className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Thumbnail Strip */}
                {allImages.length > 1 && (
                  <div className="w-full mt-4 flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
                    {allImages.map((imgUrl, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActiveImageIndex(idx)}
                        className={`relative flex-shrink-0 w-20 sm:w-24 aspect-[16/10] rounded-[2px] overflow-hidden border transition-all cursor-pointer ${
                          activeImageIndex === idx
                            ? 'border-[#000000] ring-2 ring-black/10'
                            : 'border-[#e5e5e5] opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img
                          src={imgUrl}
                          alt={`Thumbnail ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        {idx === 0 && (
                          <span className="absolute bottom-0 inset-x-0 bg-black/80 text-[8px] font-spacemono text-white text-center py-0.5">
                            COVER
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : activeTab === 'details' ? (
              <div className="p-6 sm:p-8 space-y-6 bg-white">
                <div>
                  <h3 className="font-instrument font-normal text-2xl text-[#000000] mb-3">
                    About this Initiative
                  </h3>
                  <p className="font-instrument text-[#666666] text-base leading-relaxed font-normal">
                    {event.fullDescription}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                  <div className="p-4 rounded-[2px] bg-[#fafaf9] border border-[#e5e5e5] flex items-center gap-3">
                    <span className="w-10 h-10 rounded-[2px] bg-white border border-[#e5e5e5] text-[#000000] flex items-center justify-center">
                      <Calendar className="w-4 h-4" />
                    </span>
                    <div>
                      <span className="text-[10px] font-spacemono uppercase tracking-wider text-[#888888] block">
                        Date &amp; Timing
                      </span>
                      <span className="text-sm font-medium text-[#000000] font-instrument">
                        {event.dateBadge} · {event.time}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 rounded-[2px] bg-[#fafaf9] border border-[#e5e5e5] flex items-center gap-3">
                    <span className="w-10 h-10 rounded-[2px] bg-white border border-[#e5e5e5] text-[#000000] flex items-center justify-center">
                      <MapPin className="w-4 h-4" />
                    </span>
                    <div>
                      <span className="text-[10px] font-spacemono uppercase tracking-wider text-[#888888] block">
                        Campus Venue
                      </span>
                      <span className="text-sm font-medium text-[#000000] font-instrument line-clamp-1">
                        {event.location}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 rounded-[2px] bg-[#fafaf9] border border-[#e5e5e5] flex items-center gap-3">
                    <span className="w-10 h-10 rounded-[2px] bg-white border border-[#e5e5e5] text-[#000000] flex items-center justify-center">
                      <Users className="w-4 h-4" />
                    </span>
                    <div>
                      <span className="text-[10px] font-spacemono uppercase tracking-wider text-[#888888] block">
                        {isPast ? 'Participation' : 'Cohort Capacity'}
                      </span>
                      <span className="text-sm font-medium text-[#000000] font-instrument">
                        {event.attendeeCount} {isPast ? 'Attended Builders' : 'Registered Builders'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Mentors / Speakers */}
                {event.mentors && event.mentors.length > 0 && (
                  <div className="pt-4">
                    <div className="inline-flex items-center gap-2 mb-3">
                      <span className="w-1.5 h-1.5 rounded-[1px] bg-[#000000]" />
                      <h4 className="font-instrument font-normal text-lg text-[#000000]">
                        Mentors &amp; Curators
                      </h4>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {event.mentors.map((m, i) => (
                        <div
                          key={i}
                          className="p-3 rounded-[2px] border border-[#e5e5e5] bg-[#fafaf9] flex items-center gap-3"
                        >
                          <div className="w-9 h-9 rounded-[2px] bg-white border border-[#e5e5e5] text-[#000000] font-medium text-xs flex items-center justify-center font-instrument">
                            {m.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                          </div>
                          <div>
                            <p className="text-xs font-medium text-[#000000] font-instrument">{m.name}</p>
                            <p className="text-[11px] text-[#666666] font-instrument line-clamp-1">{m.designation}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Schedule Tab */
              <div className="p-6 sm:p-8 bg-white space-y-4">
                <div className="inline-flex items-center gap-2 mb-2">
                  <span className="w-1.5 h-1.5 rounded-[1px] bg-[#000000]" />
                  <h3 className="font-instrument font-normal text-xl text-[#000000]">
                    Agenda &amp; Flow
                  </h3>
                </div>

                <div className="divide-y divide-[#e5e5e5] border border-[#e5e5e5] rounded-[2px] bg-[#fafaf9]">
                  {event.schedule?.map((item, idx) => (
                    <div key={idx} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <span className="text-xs font-spacemono font-medium text-[#000000] shrink-0">
                        {item.time}
                      </span>
                      <span className="text-sm font-normal text-[#666666]">
                        {item.activity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer (Read-Only Informational Bar, Zero Inputs) */}
          <div className="p-4 sm:px-6 py-4 bg-white border-t border-[#e5e5e5] flex flex-col sm:flex-row items-center justify-between gap-4 font-instrument">
            <div className="flex items-center gap-2 text-xs text-[#666666]">
              <span className={`w-1.5 h-1.5 rounded-[1px] ${isPast ? 'bg-neutral-400' : 'bg-emerald-600'}`} />
              <span>
                {isPast
                  ? 'This event has concluded. Browse the photo gallery and cohort highlights above.'
                  : 'Open to all students of MTM College. Inquire at the campus IEDC desk for entry.'}
              </span>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 rounded-[2px] font-medium text-xs bg-[#000000] text-white hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
