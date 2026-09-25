import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { EventItem } from '../types';
import confetti from 'canvas-confetti';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Calendar,
  MapPin,
  Clock,
  Users,
  CheckCircle2,
  Sparkles,
  Share2,
  Image as ImageIcon,
  Plus,
  Layers,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';

interface EventLightboxModalProps {
  event: EventItem | null;
  isOpen: boolean;
  onClose: () => void;
  isRegistered: boolean;
  onRegisterToggle: (eventId: string) => Promise<void>;
  onAttachImage?: (eventId: string, imageUrl: string) => Promise<void>;
}

export const EventLightboxModal: React.FC<EventLightboxModalProps> = ({
  event,
  isOpen,
  onClose,
  isRegistered,
  onRegisterToggle,
  onAttachImage,
}) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [showAddImageInput, setShowAddImageInput] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [activeTab, setActiveTab] = useState<'gallery' | 'details' | 'schedule'>('gallery');
  const [copySuccess, setCopySuccess] = useState(false);

  // Reset index when event changes
  useEffect(() => {
    setActiveImageIndex(0);
    setIsZoomed(false);
    setShowAddImageInput(false);
  }, [event?.id]);

  // Combine cover image as item 0 with the other attached images
  const allImages = event ? [event.coverImage, ...(event.galleryImages || [])] : [];

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight') {
        setActiveImageIndex((prev) => (prev + 1) % allImages.length);
      } else if (e.key === 'ArrowLeft') {
        setActiveImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, allImages.length, onClose]);

  if (!isOpen || !event) return null;

  const handleRegister = async () => {
    setRegistering(true);
    try {
      await onRegisterToggle(event.id);
      if (!isRegistered) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#5231FF', '#FE4ED7', '#111114', '#00DF89'],
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRegistering(false);
    }
  };

  const handleAddCustomImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newImageUrl.trim() || !onAttachImage) return;
    try {
      await onAttachImage(event.id, newImageUrl.trim());
      setNewImageUrl('');
      setShowAddImageInput(false);
      setActiveImageIndex(allImages.length); // jump to newly added image
    } catch (err) {
      console.error('Failed to attach image:', err);
    }
  };

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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6">
        {/* Liquid Glass Frosted Overlay Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#0B0B0E]/80 backdrop-blur-xl"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 24 }}
          transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          className="relative w-full max-w-6xl max-h-[92vh] bg-white rounded-[28px] shadow-2xl overflow-hidden flex flex-col z-10 border border-white/80"
        >
          {/* Header Bar */}
          <div className="px-6 py-4 border-b border-black/[0.06] flex items-center justify-between bg-white/90 backdrop-blur-md sticky top-0 z-20">
            <div className="flex items-center gap-3 truncate pr-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#5231FF]/10 text-[#5231FF] font-spacemono text-xs font-bold uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-[#5231FF] animate-pulse" />
                {event.category}
              </span>
              <h2 className="font-clash font-bold text-lg sm:text-xl text-[#111114] truncate">
                {event.title}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleShare}
                className="w-9 h-9 rounded-full bg-black/5 hover:bg-black/10 text-[#111114] flex items-center justify-center transition-colors cursor-pointer"
                title="Share event"
              >
                <Share2 className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-black/5 hover:bg-[#5231FF] hover:text-white text-[#111114] flex items-center justify-center transition-all cursor-pointer"
                aria-label="Close Lightbox"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Sub Navigation Bar inside Modal */}
          <div className="flex items-center justify-between px-6 py-2.5 bg-[#F6F6F8] border-b border-black/[0.05] text-xs font-semibold">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setActiveTab('gallery')}
                className={`px-3 py-1.5 rounded-full transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'gallery'
                    ? 'bg-white text-[#5231FF] shadow-xs font-bold'
                    : 'text-[#6B6B74] hover:text-[#111114]'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Lightbox Gallery ({allImages.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('details')}
                className={`px-3 py-1.5 rounded-full transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'details'
                    ? 'bg-white text-[#5231FF] shadow-xs font-bold'
                    : 'text-[#6B6B74] hover:text-[#111114]'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Overview & Details</span>
              </button>

              {event.schedule && event.schedule.length > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveTab('schedule')}
                  className={`px-3 py-1.5 rounded-full transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'schedule'
                      ? 'bg-white text-[#5231FF] shadow-xs font-bold'
                      : 'text-[#6B6B74] hover:text-[#111114]'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Agenda</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {copySuccess && (
                <span className="text-emerald-600 text-xs font-mono font-bold">Link Copied!</span>
              )}
              <span className="font-spacemono text-[11px] text-[#6B6B74] hidden sm:inline">
                {activeImageIndex === 0
                  ? `Photo 1 of ${allImages.length} (Cover Photo)`
                  : `Photo ${activeImageIndex + 1} of ${allImages.length} (Attached View)`}
              </span>
            </div>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col">
            {activeTab === 'gallery' ? (
              <div className="flex flex-col flex-1 p-4 sm:p-6 bg-[#0E0E12]">
                {/* Main Lightbox Image Stage */}
                <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] max-h-[58vh] bg-black/60 rounded-2xl overflow-hidden flex items-center justify-center group select-none border border-white/10 shadow-inner">
                  <motion.img
                    key={allImages[activeImageIndex]}
                    src={allImages[activeImageIndex]}
                    alt={`${event.title} - photo ${activeImageIndex + 1}`}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{
                      opacity: 1,
                      scale: isZoomed ? 1.4 : 1,
                    }}
                    transition={{ duration: 0.3 }}
                    className={`max-h-full max-w-full object-contain transition-transform duration-300 ${
                      isZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'
                    }`}
                    onClick={() => setIsZoomed(!isZoomed)}
                  />

                  {/* Previous Button */}
                  {allImages.length > 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        setActiveImageIndex(
                          (prev) => (prev - 1 + allImages.length) % allImages.length
                        )
                      }
                      aria-label="Previous photo"
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/60 hover:bg-[#5231FF] text-white flex items-center justify-center transition-all duration-200 backdrop-blur-md border border-white/20 hover:scale-110 shadow-lg cursor-pointer opacity-90 group-hover:opacity-100"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                  )}

                  {/* Next Button */}
                  {allImages.length > 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        setActiveImageIndex((prev) => (prev + 1) % allImages.length)
                      }
                      aria-label="Next photo"
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/60 hover:bg-[#5231FF] text-white flex items-center justify-center transition-all duration-200 backdrop-blur-md border border-white/20 hover:scale-110 shadow-lg cursor-pointer opacity-90 group-hover:opacity-100"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  )}

                  {/* Image Badge Overlay */}
                  <div className="absolute bottom-3 left-4 flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-black/70 backdrop-blur-md text-white font-spacemono text-xs border border-white/15">
                      {activeImageIndex === 0 ? 'COVER IMAGE' : `ATTACHED PHOTO #${activeImageIndex}`}
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsZoomed(!isZoomed)}
                      className="p-1.5 rounded-full bg-black/70 backdrop-blur-md text-white hover:text-[#5231FF] border border-white/15 cursor-pointer"
                      title={isZoomed ? 'Zoom out' : 'Zoom in'}
                    >
                      {isZoomed ? <ZoomOut className="w-3.5 h-3.5" /> : <ZoomIn className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Attached Images Thumbnail Strip */}
                <div className="mt-4 flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar">
                  {allImages.map((imgUrl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setActiveImageIndex(idx);
                        setIsZoomed(false);
                      }}
                      className={`relative flex-shrink-0 w-20 sm:w-24 aspect-[16/10] rounded-xl overflow-hidden border-2 transition-all duration-200 cursor-pointer ${
                        activeImageIndex === idx
                          ? 'border-[#5231FF] scale-105 shadow-[0_0_14px_rgba(82,49,255,0.6)] ring-2 ring-[#5231FF]/30'
                          : 'border-white/20 opacity-60 hover:opacity-100 hover:border-white/60'
                      }`}
                    >
                      <img src={imgUrl} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                      {idx === 0 && (
                        <span className="absolute bottom-0 inset-x-0 bg-black/80 text-[8px] font-spacemono font-bold text-center text-white py-0.5">
                          COVER
                        </span>
                      )}
                    </button>
                  ))}

                  {/* Add more photos button for organizers/attendees */}
                  {onAttachImage && (
                    <button
                      type="button"
                      onClick={() => setShowAddImageInput(!showAddImageInput)}
                      className="flex-shrink-0 w-20 sm:w-24 aspect-[16/10] rounded-xl border-2 border-dashed border-white/30 hover:border-[#5231FF] flex flex-col items-center justify-center text-white/60 hover:text-white transition-all cursor-pointer bg-white/5"
                      title="Attach another photo to this event"
                    >
                      <Plus className="w-4 h-4 mb-0.5" />
                      <span className="text-[9px] font-spacemono uppercase font-bold">Add Photo</span>
                    </button>
                  )}
                </div>

                {/* Add Photo Input Dropdown */}
                {showAddImageInput && onAttachImage && (
                  <form
                    onSubmit={handleAddCustomImage}
                    className="mt-3 p-3 bg-white/10 rounded-xl border border-white/20 flex flex-col sm:flex-row items-center gap-2"
                  >
                    <input
                      type="url"
                      required
                      placeholder="Paste Image URL to attach (e.g. https://...)"
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      className="flex-1 w-full bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#5231FF]"
                    />
                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                      <button
                        type="submit"
                        className="px-4 py-1.5 bg-[#5231FF] text-white rounded-lg text-xs font-semibold hover:brightness-110 cursor-pointer"
                      >
                        Attach Photo
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAddImageInput(false)}
                        className="px-2 py-1.5 text-xs text-white/60 hover:text-white cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            ) : activeTab === 'details' ? (
              <div className="p-6 sm:p-8 space-y-6">
                <div>
                  <h3 className="font-clash font-bold text-2xl text-[#111114] mb-3">
                    About this Initiative
                  </h3>
                  <p className="font-general text-[#6B6B74] text-base leading-relaxed">
                    {event.fullDescription}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                  <div className="p-4 rounded-2xl bg-[#F6F6F8] border border-black/[0.04] flex items-center gap-3">
                    <span className="w-10 h-10 rounded-xl bg-[#5231FF]/10 text-[#5231FF] flex items-center justify-center">
                      <Calendar className="w-5 h-5" />
                    </span>
                    <div>
                      <span className="text-[11px] font-spacemono uppercase text-[#6B6B74] block">
                        Date & Timing
                      </span>
                      <span className="text-sm font-bold text-[#111114]">
                        {event.dateBadge} · {event.time}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#F6F6F8] border border-black/[0.04] flex items-center gap-3">
                    <span className="w-10 h-10 rounded-xl bg-[#5231FF]/10 text-[#5231FF] flex items-center justify-center">
                      <MapPin className="w-5 h-5" />
                    </span>
                    <div>
                      <span className="text-[11px] font-spacemono uppercase text-[#6B6B74] block">
                        Campus Venue
                      </span>
                      <span className="text-sm font-bold text-[#111114] line-clamp-1">
                        {event.location}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#F6F6F8] border border-black/[0.04] flex items-center gap-3">
                    <span className="w-10 h-10 rounded-xl bg-[#5231FF]/10 text-[#5231FF] flex items-center justify-center">
                      <Users className="w-5 h-5" />
                    </span>
                    <div>
                      <span className="text-[11px] font-spacemono uppercase text-[#6B6B74] block">
                        Cohort Capacity
                      </span>
                      <span className="text-sm font-bold text-[#111114]">
                        {event.attendeeCount} Registered Builders
                      </span>
                    </div>
                  </div>
                </div>

                {/* Mentors / Speakers */}
                {event.mentors && event.mentors.length > 0 && (
                  <div className="pt-4">
                    <h4 className="font-clash font-bold text-lg text-[#111114] mb-3">
                      Mentors & Curators
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {event.mentors.map((m, i) => (
                        <div
                          key={i}
                          className="p-3 rounded-xl border border-black/[0.06] bg-white flex items-center gap-3 shadow-xs"
                        >
                          <div className="w-9 h-9 rounded-full bg-[#5231FF]/10 text-[#5231FF] font-bold text-xs flex items-center justify-center font-clash">
                            {m.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-[#111114]">{m.name}</p>
                            <p className="text-[11px] text-[#6B6B74] line-clamp-1">{m.designation}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Schedule / Agenda Tab */
              <div className="p-6 sm:p-8 space-y-4">
                <h3 className="font-clash font-bold text-xl text-[#111114] mb-2">Event Schedule</h3>
                <div className="space-y-3">
                  {event.schedule?.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-[#F6F6F8] border border-black/[0.04] flex items-start gap-4"
                    >
                      <span className="font-spacemono text-xs font-bold text-[#5231FF] px-2.5 py-1 bg-white rounded-md shadow-xs">
                        {item.time}
                      </span>
                      <p className="text-sm font-medium text-[#111114] pt-0.5">{item.activity}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer with RSVP Action */}
          <div className="p-4 sm:px-6 py-4 bg-white border-t border-black/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-[#6B6B74]">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>
                {isRegistered
                  ? 'You are registered for this event!'
                  : 'Open to all students of MTM College & Kerala collegiate network'}
              </span>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleRegister}
                disabled={registering}
                className={`flex-1 sm:flex-none px-6 py-2.5 rounded-full font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-md ${
                  isRegistered
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100'
                    : 'bg-[#5231FF] text-white hover:brightness-110 hover:shadow-[0_6px_20px_rgba(82,49,255,0.4)] hover:scale-105 active:scale-95'
                }`}
              >
                {registering ? (
                  <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : isRegistered ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Registered · Cancel RSVP</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Register for Event</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
