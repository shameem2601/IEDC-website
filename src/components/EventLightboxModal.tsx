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
          colors: ['#000000', '#888888', '#e5e5e5', '#333333'],
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
                <span className="w-1.5 h-1.5 rounded-[1px] bg-[#000000]" />
                {event.category}
              </span>
              <h2 className="font-instrument font-normal text-lg sm:text-xl text-[#000000] truncate">
                {event.title}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleShare}
                className="w-8 h-8 rounded-[2px] border border-[#e5e5e5] bg-white hover:bg-[#fafaf9] text-[#000000] flex items-center justify-center transition-colors cursor-pointer"
                title="Share event"
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
                className={`px-3 py-1 rounded-[2px] transition-colors cursor-pointer flex items-center gap-1.5 font-instrument ${
                  activeTab === 'gallery'
                    ? 'bg-white text-[#000000] border border-[#e5e5e5] font-medium'
                    : 'text-[#666666] hover:text-[#000000]'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Lightbox Gallery ({allImages.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('details')}
                className={`px-3 py-1 rounded-[2px] transition-colors cursor-pointer flex items-center gap-1.5 font-instrument ${
                  activeTab === 'details'
                    ? 'bg-white text-[#000000] border border-[#e5e5e5] font-medium'
                    : 'text-[#666666] hover:text-[#000000]'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Overview & Details</span>
              </button>

              {event.schedule && event.schedule.length > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveTab('schedule')}
                  className={`px-3 py-1 rounded-[2px] transition-colors cursor-pointer flex items-center gap-1.5 font-instrument ${
                    activeTab === 'schedule'
                      ? 'bg-white text-[#000000] border border-[#e5e5e5] font-medium'
                      : 'text-[#666666] hover:text-[#000000]'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Agenda</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {copySuccess && (
                <span className="text-emerald-700 text-xs font-mono font-medium">Link Copied!</span>
              )}
              <span className="font-spacemono text-[10px] text-[#888888] hidden sm:inline">
                {activeImageIndex === 0
                  ? `Photo 1 of ${allImages.length} (Cover Photo)`
                  : `Photo ${activeImageIndex + 1} of ${allImages.length} (Attached View)`}
              </span>
            </div>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col font-instrument">
            {activeTab === 'gallery' ? (
              <div className="flex flex-col flex-1 p-4 sm:p-6 bg-[#fafaf9] border-t border-[#e5e5e5]">
                {/* Main Lightbox Image Stage (Optimus Sharp Theme) */}
                <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] max-h-[58vh] bg-[#141414] rounded-[2px] overflow-hidden flex items-center justify-center group select-none border border-[#e5e5e5] shadow-xs">
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
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-[2px] bg-white/95 hover:bg-[#000000] hover:text-white text-[#000000] flex items-center justify-center transition-all duration-150 backdrop-blur-md border border-[#e5e5e5] shadow-xs cursor-pointer opacity-90 group-hover:opacity-100"
                    >
                      <ChevronLeft className="w-5 h-5" />
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
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-[2px] bg-white/95 hover:bg-[#000000] hover:text-white text-[#000000] flex items-center justify-center transition-all duration-150 backdrop-blur-md border border-[#e5e5e5] shadow-xs cursor-pointer opacity-90 group-hover:opacity-100"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  )}

                  {/* Image Badge Overlay */}
                  <div className="absolute bottom-3 left-3 sm:left-4 flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-[2px] bg-white/95 backdrop-blur-md text-[#000000] font-spacemono text-[10px] uppercase tracking-wider border border-[#e5e5e5] shadow-xs">
                      {activeImageIndex === 0 ? 'COVER IMAGE' : `ATTACHED PHOTO #${activeImageIndex}`}
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsZoomed(!isZoomed)}
                      className="p-1 rounded-[2px] bg-white/95 backdrop-blur-md text-[#000000] hover:bg-[#000000] hover:text-white border border-[#e5e5e5] shadow-xs transition-colors cursor-pointer"
                      title={isZoomed ? 'Zoom out' : 'Zoom in'}
                    >
                      {isZoomed ? <ZoomOut className="w-3.5 h-3.5" /> : <ZoomIn className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Attached Images Thumbnail Strip */}
                <div className="mt-4 flex items-center gap-2.5 overflow-x-auto pb-1 no-scrollbar">
                  {allImages.map((imgUrl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setActiveImageIndex(idx);
                        setIsZoomed(false);
                      }}
                      className={`relative flex-shrink-0 w-20 sm:w-24 aspect-[16/10] rounded-[2px] overflow-hidden border transition-all duration-150 cursor-pointer ${
                        activeImageIndex === idx
                          ? 'border-2 border-[#000000] shadow-xs'
                          : 'border-[#e5e5e5] opacity-60 hover:opacity-100 hover:border-[#888888]'
                      }`}
                    >
                      <img src={imgUrl} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                      {idx === 0 && (
                        <span className="absolute bottom-0 inset-x-0 bg-[#000000] text-[8px] font-spacemono uppercase tracking-wider text-center text-white py-0.5">
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
                      className="flex-shrink-0 w-20 sm:w-24 aspect-[16/10] rounded-[2px] border border-dashed border-[#cccccc] hover:border-[#000000] flex flex-col items-center justify-center text-[#666666] hover:text-[#000000] transition-colors cursor-pointer bg-white"
                      title="Attach another photo to this event"
                    >
                      <Plus className="w-3.5 h-3.5 mb-0.5" />
                      <span className="text-[9px] font-spacemono uppercase">Add Photo</span>
                    </button>
                  )}
                </div>

                {/* Add Photo Input Dropdown */}
                {showAddImageInput && onAttachImage && (
                  <form
                    onSubmit={handleAddCustomImage}
                    className="mt-3 p-3 bg-white rounded-[2px] border border-[#e5e5e5] flex flex-col sm:flex-row items-center gap-2"
                  >
                    <input
                      type="url"
                      required
                      placeholder="Paste Image URL to attach (e.g. https://...)"
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      className="flex-1 w-full bg-[#fafaf9] border border-[#e5e5e5] rounded-[2px] px-3 py-1.5 text-xs text-[#000000] placeholder-[#888888] focus:outline-none focus:border-[#000000] font-instrument"
                    />
                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                      <button
                        type="submit"
                        className="px-4 py-1.5 bg-[#000000] text-white rounded-[2px] text-xs font-medium hover:bg-neutral-800 transition-colors cursor-pointer font-instrument"
                      >
                        Attach Photo
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAddImageInput(false)}
                        className="px-3 py-1.5 text-xs text-[#666666] hover:text-[#000000] rounded-[2px] cursor-pointer font-instrument"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
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
                        Cohort Capacity
                      </span>
                      <span className="text-sm font-medium text-[#000000] font-instrument">
                        {event.attendeeCount} Registered Builders
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
              /* Schedule / Agenda Tab (Optimus Sharp Theme) */
              <div className="p-6 sm:p-8 space-y-4 bg-white">
                <div className="inline-flex items-center gap-2 mb-2">
                  <span className="w-1.5 h-1.5 rounded-[1px] bg-[#000000]" />
                  <h3 className="font-instrument font-normal text-xl sm:text-2xl text-[#000000]">
                    Event Schedule &amp; Agenda
                  </h3>
                </div>
                <div className="space-y-2.5">
                  {event.schedule?.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 sm:p-4 rounded-[2px] bg-[#fafaf9] border border-[#e5e5e5] flex items-start gap-3 hover:border-[#888888] transition-colors"
                    >
                      <span className="font-spacemono text-xs font-normal text-[#000000] px-2.5 py-1 bg-white border border-[#e5e5e5] rounded-[2px] whitespace-nowrap">
                        {item.time}
                      </span>
                      <p className="text-sm font-normal text-[#000000] pt-0.5 leading-snug font-instrument">
                        {item.activity}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer with RSVP Action (Optimus Design) */}
          <div className="p-4 sm:px-6 py-4 bg-white border-t border-[#e5e5e5] flex flex-col sm:flex-row items-center justify-between gap-4 font-instrument">
            <div className="flex items-center gap-2 text-xs text-[#666666]">
              <span className="w-1.5 h-1.5 rounded-[1px] bg-[#888888]" />
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
                className={`flex-1 sm:flex-none px-5 py-2 rounded-[2px] font-medium text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer ${
                  isRegistered
                    ? 'bg-[#fafaf9] text-[#000000] border border-[#e5e5e5] hover:bg-[#f3f2ee]'
                    : 'bg-[#000000] text-white border border-[#000000] hover:bg-neutral-800'
                }`}
              >
                {registering ? (
                  <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : isRegistered ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Registered · Cancel RSVP</span>
                  </>
                ) : (
                  <>
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
