import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Plus,
  Trash2,
  Upload,
  CheckCircle2,
  Sparkles,
  BarChart3,
  Calendar,
  Users,
  Settings,
  Image as ImageIcon,
  ExternalLink,
  Layers,
  Save,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { EventItem, TeamMember, SiteStats } from '../types';
import { SANITY_PROJECT_ID, SANITY_DATASET } from '../lib/sanity';

interface CmsDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: SiteStats;
  onSaveStats: (newStats: SiteStats) => Promise<void>;
  events: EventItem[];
  onSaveEvents: (newEvents: EventItem[]) => Promise<void>;
  teamMembers: TeamMember[];
  onSaveTeamMembers: (newMembers: TeamMember[]) => Promise<void>;
}

export const CmsDashboardModal: React.FC<CmsDashboardModalProps> = ({
  isOpen,
  onClose,
  stats,
  onSaveStats,
  events,
  onSaveEvents,
  teamMembers,
  onSaveTeamMembers,
}) => {
  const [activeTab, setActiveTab] = useState<'stats' | 'events' | 'team' | 'sanity'>('stats');

  // Stats edit state
  const [currentStats, setCurrentStats] = useState<SiteStats>(stats);
  const [savingStats, setSavingStats] = useState(false);
  const [statsSavedSuccess, setStatsSavedSuccess] = useState(false);

  // Events edit state
  const [currentEvents, setCurrentEvents] = useState<EventItem[]>(events);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);
  const [savingEvents, setSavingEvents] = useState(false);
  const [eventSuccess, setEventSuccess] = useState(false);
  const coverImageInputRef = useRef<HTMLInputElement>(null);
  const bulkGalleryInputRef = useRef<HTMLInputElement>(null);

  // Team edit state
  const [currentMembers, setCurrentMembers] = useState<TeamMember[]>(teamMembers);
  const [savingMembers, setSavingMembers] = useState(false);
  const [memberSuccess, setMemberSuccess] = useState(false);
  const bulkMemberInputRef = useRef<HTMLInputElement>(null);

  // Sync state if props change when opening
  React.useEffect(() => {
    setCurrentStats(stats);
    setCurrentEvents(events);
    setCurrentMembers(teamMembers);
  }, [stats, events, teamMembers, isOpen]);

  // Convert File to Base64 data URL
  const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // 1. SAVE STATS
  const handleSaveStatsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingStats(true);
    try {
      await onSaveStats(currentStats);
      setStatsSavedSuccess(true);
      setTimeout(() => setStatsSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving stats:', err);
    } finally {
      setSavingStats(false);
    }
  };

  // 2. EVENTS: Cover Image upload
  const handleCoverImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editingEvent) {
      const dataUrl = await fileToDataUrl(file);
      setEditingEvent({ ...editingEvent, coverImage: dataUrl });
    }
  };

  // 2. EVENTS: Bulk 8-9 gallery images upload
  const handleBulkGalleryChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0 && editingEvent) {
      const newUrls: string[] = [];
      const filesToProcess = Array.from(files).slice(0, 12); // up to 12 files
      for (const file of filesToProcess) {
        const url = await fileToDataUrl(file);
        newUrls.push(url);
      }
      setEditingEvent({
        ...editingEvent,
        galleryImages: [...editingEvent.galleryImages, ...newUrls],
      });
    }
  };

  // 2. EVENTS: Save event into list
  const handleSaveEventIntoList = async () => {
    if (!editingEvent) return;
    setSavingEvents(true);
    try {
      let updated: EventItem[];
      const exists = currentEvents.some((e) => e.id === editingEvent.id);
      if (exists) {
        updated = currentEvents.map((e) => (e.id === editingEvent.id ? editingEvent : e));
      } else {
        updated = [editingEvent, ...currentEvents];
      }
      setCurrentEvents(updated);
      await onSaveEvents(updated);
      setEditingEvent(null);
      setEventSuccess(true);
      setTimeout(() => setEventSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving events:', err);
    } finally {
      setSavingEvents(false);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    const updated = currentEvents.filter((e) => e.id !== id);
    setCurrentEvents(updated);
    await onSaveEvents(updated);
  };

  // 3. TEAM: Bulk member upload (up to 20 images at once)
  const handleBulkMemberUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const filesArray = Array.from(files).slice(0, 25); // choose up to 25 people
    const newMembersCreated: TeamMember[] = [];

    for (let i = 0; i < filesArray.length; i++) {
      const file = filesArray[i];
      const dataUrl = await fileToDataUrl(file);

      // Clean filename for initial display name suggestion
      const nameGuess = file.name
        .replace(/\.[^/.]+$/, '')
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());

      const initials = nameGuess
        .split(' ')
        .map((p) => p.charAt(0))
        .join('')
        .slice(0, 2)
        .toUpperCase() || 'TM';

      newMembersCreated.push({
        id: `member-${Date.now()}-${i}`,
        name: nameGuess || `Member ${currentMembers.length + i + 1}`,
        role: 'Executive Member',
        initials,
        badgeIcon: 'star',
        highlightColor: '#5231FF',
        linkedin: '',
        instagram: '',
        photoUrl: dataUrl,
        hierarchy: 'executive', // default tier, user can customize
      });
    }

    const updated = [...currentMembers, ...newMembersCreated];
    setCurrentMembers(updated);
    setSavingMembers(true);
    try {
      await onSaveTeamMembers(updated);
      setMemberSuccess(true);
      setTimeout(() => setMemberSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving team members:', err);
    } finally {
      setSavingMembers(false);
    }
  };

  const handleUpdateMemberField = (
    index: number,
    field: keyof TeamMember,
    value: string
  ) => {
    const updated = [...currentMembers];
    const member = { ...updated[index], [field]: value };
    // update initials if name changed
    if (field === 'name') {
      const initials = value
        .split(' ')
        .map((p) => p.charAt(0))
        .join('')
        .slice(0, 2)
        .toUpperCase();
      member.initials = initials || 'TM';
    }
    updated[index] = member;
    setCurrentMembers(updated);
  };

  const handleSaveAllMembers = async () => {
    setSavingMembers(true);
    try {
      await onSaveTeamMembers(currentMembers);
      setMemberSuccess(true);
      setTimeout(() => setMemberSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save members:', err);
    } finally {
      setSavingMembers(false);
    }
  };

  const handleDeleteMember = async (id: string) => {
    const updated = currentMembers.filter((m) => m.id !== id);
    setCurrentMembers(updated);
    await onSaveTeamMembers(updated);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-5xl bg-white rounded-[28px] shadow-2xl border border-black/10 overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-black/5 flex items-center justify-between bg-[#FDFCFD]">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-2xl bg-[#5231FF]/10 text-[#5231FF] flex items-center justify-center">
              <Settings className="w-5 h-5" />
            </span>
            <div>
              <h2 className="font-clash font-bold text-xl text-[#111114]">
                IEDC Content Manager &amp; Sanity CMS
              </h2>
              <p className="font-general text-xs text-[#6B6B74]">
                Update site metrics, events, and bulk upload team members with hierarchy
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-black/5 hover:bg-black/10 text-[#111114] flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-black/5 px-6 bg-white overflow-x-auto gap-2">
          <button
            type="button"
            onClick={() => {
              setActiveTab('stats');
              setEditingEvent(null);
            }}
            className={`flex items-center gap-2 py-3.5 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'stats'
                ? 'border-[#5231FF] text-[#5231FF]'
                : 'border-transparent text-[#6B6B74] hover:text-[#111114]'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Site Metrics (Stats)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('events')}
            className={`flex items-center gap-2 py-3.5 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'events'
                ? 'border-[#5231FF] text-[#5231FF]'
                : 'border-transparent text-[#6B6B74] hover:text-[#111114]'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Upcoming Events ({currentEvents.length})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('team');
              setEditingEvent(null);
            }}
            className={`flex items-center gap-2 py-3.5 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'team'
                ? 'border-[#5231FF] text-[#5231FF]'
                : 'border-transparent text-[#6B6B74] hover:text-[#111114]'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Team Members &amp; Bulk Upload ({currentMembers.length})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('sanity');
              setEditingEvent(null);
            }}
            className={`flex items-center gap-2 py-3.5 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'sanity'
                ? 'border-[#5231FF] text-[#5231FF]'
                : 'border-transparent text-[#6B6B74] hover:text-[#111114]'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Sanity Studio (`s4nzdr3x`)</span>
          </button>
        </div>

        {/* Tab Content Area */}
        <div className="p-6 overflow-y-auto flex-1 bg-[#FAF9FB]">
          {/* TAB 1: SITE STATS */}
          {activeTab === 'stats' && (
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="bg-white rounded-2xl p-6 border border-black/5 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-clash font-bold text-lg text-[#111114]">
                    Edit Key Campus Metrics
                  </h3>
                  {statsSavedSuccess && (
                    <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Saved &amp; Updated Live!
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#6B6B74] mb-6">
                  These numbers are highlighted in the animated metrics section on the homepage.
                </p>

                <form onSubmit={handleSaveStatsSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase font-spacemono text-[#111114] mb-1.5">
                        Events Hosted (Target Number)
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={currentStats.eventsHosted}
                        onChange={(e) =>
                          setCurrentStats({
                            ...currentStats,
                            eventsHosted: parseInt(e.target.value) || 0,
                          })
                        }
                        className="w-full bg-[#F6F6F8] border border-black/10 rounded-xl px-4 py-2.5 text-sm font-bold text-[#111114] focus:outline-none focus:border-[#5231FF] focus:bg-white"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase font-spacemono text-[#111114] mb-1.5">
                        Students Engaged
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={currentStats.studentsEngaged}
                        onChange={(e) =>
                          setCurrentStats({
                            ...currentStats,
                            studentsEngaged: parseInt(e.target.value) || 0,
                          })
                        }
                        className="w-full bg-[#F6F6F8] border border-black/10 rounded-xl px-4 py-2.5 text-sm font-bold text-[#111114] focus:outline-none focus:border-[#5231FF] focus:bg-white"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase font-spacemono text-[#111114] mb-1.5">
                        Startups Incubated
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={currentStats.startupsIncubated}
                        onChange={(e) =>
                          setCurrentStats({
                            ...currentStats,
                            startupsIncubated: parseInt(e.target.value) || 0,
                          })
                        }
                        className="w-full bg-[#F6F6F8] border border-black/10 rounded-xl px-4 py-2.5 text-sm font-bold text-[#111114] focus:outline-none focus:border-[#5231FF] focus:bg-white"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase font-spacemono text-[#111114] mb-1.5">
                        Industry Partners
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={currentStats.industryPartners}
                        onChange={(e) =>
                          setCurrentStats({
                            ...currentStats,
                            industryPartners: parseInt(e.target.value) || 0,
                          })
                        }
                        className="w-full bg-[#F6F6F8] border border-black/10 rounded-xl px-4 py-2.5 text-sm font-bold text-[#111114] focus:outline-none focus:border-[#5231FF] focus:bg-white"
                        required
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button
                      type="submit"
                      disabled={savingStats}
                      className="px-6 py-2.5 bg-[#5231FF] text-white rounded-full font-bold text-xs hover:brightness-110 flex items-center gap-2 shadow-md cursor-pointer"
                    >
                      {savingStats ? (
                        <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Save className="w-3.5 h-3.5" />
                      )}
                      <span>Save Metrics</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* TAB 2: UPCOMING EVENTS */}
          {activeTab === 'events' && (
            <div className="space-y-6">
              {editingEvent ? (
                /* EVENT EDIT FORM (Cover Image separately + Bulk 8-9 gallery images upload) */
                <div className="bg-white rounded-2xl p-6 border border-black/5 shadow-xs space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-black/5">
                    <div>
                      <h3 className="font-clash font-bold text-lg text-[#111114]">
                        {editingEvent.id ? 'Edit Event' : 'Create New Event'}
                      </h3>
                      <p className="text-xs text-[#6B6B74]">
                        Upload separate 16:9 cover image, and bulk upload 8-9 gallery photos at once.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditingEvent(null)}
                      className="text-xs font-semibold text-[#6B6B74] hover:text-[#111114] cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase font-spacemono text-[#111114] mb-1">
                        Event Title *
                      </label>
                      <input
                        type="text"
                        value={editingEvent.title}
                        onChange={(e) => setEditingEvent({ ...editingEvent, title: e.target.value })}
                        className="w-full bg-[#F6F6F8] border border-black/10 rounded-xl px-3.5 py-2 text-xs font-bold text-[#111114]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase font-spacemono text-[#111114] mb-1">
                        Category Tag *
                      </label>
                      <input
                        type="text"
                        value={editingEvent.category}
                        onChange={(e) =>
                          setEditingEvent({ ...editingEvent, category: e.target.value })
                        }
                        placeholder="e.g. 36-HOUR SPRINT, WORKSHOP"
                        className="w-full bg-[#F6F6F8] border border-black/10 rounded-xl px-3.5 py-2 text-xs font-bold text-[#111114]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase font-spacemono text-[#111114] mb-1">
                        Date Badge *
                      </label>
                      <input
                        type="text"
                        value={editingEvent.dateBadge}
                        onChange={(e) =>
                          setEditingEvent({ ...editingEvent, dateBadge: e.target.value })
                        }
                        placeholder="e.g. 12 OCT 2026"
                        className="w-full bg-[#F6F6F8] border border-black/10 rounded-xl px-3.5 py-2 text-xs font-bold text-[#111114]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase font-spacemono text-[#111114] mb-1">
                        Location
                      </label>
                      <input
                        type="text"
                        value={editingEvent.location}
                        onChange={(e) =>
                          setEditingEvent({ ...editingEvent, location: e.target.value })
                        }
                        className="w-full bg-[#F6F6F8] border border-black/10 rounded-xl px-3.5 py-2 text-xs font-bold text-[#111114]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase font-spacemono text-[#111114] mb-1">
                      Short Description
                    </label>
                    <textarea
                      rows={2}
                      value={editingEvent.shortDescription}
                      onChange={(e) =>
                        setEditingEvent({ ...editingEvent, shortDescription: e.target.value })
                      }
                      className="w-full bg-[#F6F6F8] border border-black/10 rounded-xl px-3.5 py-2 text-xs text-[#111114]"
                    />
                  </div>

                  {/* 1. SEPARATE COVER IMAGE UPLOAD */}
                  <div className="p-4 rounded-xl bg-[#F6F6F8] border border-black/5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold uppercase font-spacemono text-[#111114]">
                        1. Main Cover Image (Separately)
                      </span>
                      <button
                        type="button"
                        onClick={() => coverImageInputRef.current?.click()}
                        className="text-xs font-bold text-[#5231FF] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Cover Image</span>
                      </button>
                      <input
                        ref={coverImageInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleCoverImageChange}
                        className="hidden"
                      />
                    </div>
                    {editingEvent.coverImage && (
                      <div className="relative aspect-video max-h-48 rounded-lg overflow-hidden border border-black/10 bg-white">
                        <img
                          src={editingEvent.coverImage}
                          alt="Cover preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>

                  {/* 2. BULK GALLERY UPLOAD (8-9 images at once) */}
                  <div className="p-4 rounded-xl bg-[#F6F6F8] border border-black/5">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <span className="text-xs font-bold uppercase font-spacemono text-[#111114] block">
                          2. Gallery Photos (Choose 8-9 images at once in bulk)
                        </span>
                        <span className="text-[11px] text-[#6B6B74]">
                          {editingEvent.galleryImages?.length || 0} photos attached to gallery
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => bulkGalleryInputRef.current?.click()}
                        className="px-3.5 py-1.5 bg-[#5231FF] text-white rounded-full text-xs font-bold hover:brightness-110 flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Choose 8-9 Photos (Bulk)</span>
                      </button>
                      <input
                        ref={bulkGalleryInputRef}
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleBulkGalleryChange}
                        className="hidden"
                      />
                    </div>

                    {/* Preview Gallery Grid */}
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 mt-3">
                      {editingEvent.galleryImages?.map((imgUrl, gIdx) => (
                        <div
                          key={gIdx}
                          className="relative aspect-square rounded-lg overflow-hidden border border-black/10 group bg-white shadow-xs"
                        >
                          <img
                            src={imgUrl}
                            alt={`Gallery ${gIdx}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const filtered = editingEvent.galleryImages.filter(
                                (_, idx) => idx !== gIdx
                              );
                              setEditingEvent({ ...editingEvent, galleryImages: filtered });
                            }}
                            className="absolute top-1 right-1 w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setEditingEvent(null)}
                      className="px-5 py-2 rounded-full text-xs font-bold text-[#6B6B74] hover:bg-black/5 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveEventIntoList}
                      disabled={savingEvents}
                      className="px-6 py-2.5 rounded-full bg-[#5231FF] text-white text-xs font-bold hover:brightness-110 flex items-center gap-2 cursor-pointer shadow-md"
                    >
                      {savingEvents ? (
                        <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Save className="w-3.5 h-3.5" />
                      )}
                      <span>Save Event</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* EVENT LIST */
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-clash font-bold text-lg text-[#111114]">
                        Upcoming Events List
                      </h3>
                      <p className="text-xs text-[#6B6B74]">
                        Click on any event to edit, replace cover image, or bulk upload 8-9 gallery photos.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setEditingEvent({
                          id: `event-${Date.now()}`,
                          title: 'New Innovation Masterclass',
                          date: new Date().toISOString().split('T')[0],
                          dateBadge: 'UPCOMING',
                          category: 'WORKSHOP',
                          icon: 'lightbulb',
                          shortDescription: 'Hands-on interactive masterclass for campus entrepreneurs.',
                          fullDescription: 'Comprehensive workshop designed for venture builders.',
                          coverImage:
                            'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80',
                          galleryImages: [],
                          location: 'MTM Innovation Lab',
                          time: '10:00 AM',
                          registrationOpen: true,
                          attendeeCount: 45,
                          tags: ['Innovation', 'Startup'],
                        })
                      }
                      className="px-4 py-2 bg-[#5231FF] text-white text-xs font-bold rounded-full hover:brightness-110 flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add New Event</span>
                    </button>
                  </div>

                  {eventSuccess && (
                    <div className="p-3 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-xl flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Events saved and published live!</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentEvents.map((evt) => (
                      <div
                        key={evt.id}
                        className="bg-white rounded-2xl p-4 border border-black/5 shadow-xs flex gap-4 items-center justify-between group"
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          <img
                            src={evt.coverImage}
                            alt={evt.title}
                            className="w-16 h-14 rounded-xl object-cover shrink-0 border border-black/5"
                          />
                          <div className="overflow-hidden">
                            <span className="text-[10px] font-spacemono uppercase font-bold text-[#5231FF] block">
                              {evt.category} • {evt.galleryImages?.length || 0} Photos
                            </span>
                            <h4 className="font-clash font-bold text-sm text-[#111114] truncate">
                              {evt.title}
                            </h4>
                            <p className="text-xs text-[#6B6B74] truncate">{evt.dateBadge}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => setEditingEvent(evt)}
                            className="px-3 py-1.5 rounded-lg bg-black/5 hover:bg-[#5231FF] hover:text-white text-xs font-semibold transition-colors cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteEvent(evt.id)}
                            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: TEAM MEMBERS & BULK UPLOAD */}
          {activeTab === 'team' && (
            <div className="space-y-6">
              {/* Bulk Uploader Banner */}
              <div className="bg-gradient-to-r from-[#5231FF]/10 via-[#5231FF]/5 to-transparent rounded-2xl p-6 border border-[#5231FF]/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="w-4 h-4 text-[#5231FF]" />
                    <h3 className="font-clash font-bold text-base text-[#111114]">
                      Bulk Member Profile Creator (Upload up to 20 Photos at once)
                    </h3>
                  </div>
                  <p className="text-xs text-[#6B6B74] max-w-xl">
                    Choose multiple member photos simultaneously. Independent profiles will be created
                    instantly for each person where you can adjust hierarchy (Nodal / Executive / Member),
                    names, roles, LinkedIn, and Instagram.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => bulkMemberInputRef.current?.click()}
                    className="px-5 py-2.5 bg-[#5231FF] text-white rounded-full text-xs font-bold hover:brightness-110 flex items-center gap-2 shadow-md cursor-pointer"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Upload 20 Photos (Bulk)</span>
                  </button>
                  <input
                    ref={bulkMemberInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleBulkMemberUpload}
                    className="hidden"
                  />
                </div>
              </div>

              {memberSuccess && (
                <div className="p-3 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-xl flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Team changes saved and synchronized live!</span>
                </div>
              )}

              {/* Action Bar */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-clash font-bold text-base text-[#111114]">
                    Configured Team Roster ({currentMembers.length} profiles)
                  </h4>
                  <p className="text-xs text-[#6B6B74]">
                    Customize hierarchy, names, roles, and socials for every member below.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleSaveAllMembers}
                  disabled={savingMembers}
                  className="px-5 py-2 bg-[#111114] text-white text-xs font-bold rounded-full hover:bg-black flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  {savingMembers ? (
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Save className="w-3.5 h-3.5" />
                  )}
                  <span>Save All Members</span>
                </button>
              </div>

              {/* Members Grid / List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentMembers.map((member, idx) => (
                  <div
                    key={member.id || idx}
                    className="bg-white rounded-2xl p-4 border border-black/10 shadow-xs flex flex-col justify-between space-y-3"
                  >
                    <div className="flex items-center gap-3">
                      {/* Avatar preview */}
                      <div className="w-14 h-14 rounded-xl bg-[#F6F6F8] border border-black/10 flex items-center justify-center overflow-hidden shrink-0">
                        {member.photoUrl ? (
                          <img
                            src={member.photoUrl}
                            alt={member.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="font-clash font-bold text-lg text-[#5231FF]">
                            {member.initials}
                          </span>
                        )}
                      </div>

                      <div className="flex-1 overflow-hidden">
                        <label className="text-[10px] font-spacemono uppercase font-bold text-[#6B6B74] block">
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={member.name}
                          onChange={(e) => handleUpdateMemberField(idx, 'name', e.target.value)}
                          className="w-full font-clash font-bold text-sm text-[#111114] bg-[#F6F6F8] px-2 py-1 rounded-md border border-black/5"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteMember(member.id)}
                        className="text-rose-500 hover:text-rose-700 p-1"
                        title="Delete Member"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-2">
                      <div>
                        <label className="text-[10px] font-spacemono uppercase font-bold text-[#6B6B74] block">
                          Hierarchy Tier *
                        </label>
                        <select
                          value={member.hierarchy}
                          onChange={(e) =>
                            handleUpdateMemberField(
                              idx,
                              'hierarchy',
                              e.target.value as 'nodal' | 'executive' | 'member'
                            )
                          }
                          className="w-full text-xs font-bold bg-[#F6F6F8] px-2.5 py-1.5 rounded-lg border border-black/10 text-[#111114]"
                        >
                          <option value="nodal">Faculty Nodal Officer (2-3 per line)</option>
                          <option value="executive">Executive Council (4 per line)</option>
                          <option value="member">Domain Leads &amp; Innovators (5 per line)</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] font-spacemono uppercase font-bold text-[#6B6B74] block">
                          Designation / Role
                        </label>
                        <input
                          type="text"
                          value={member.role}
                          onChange={(e) => handleUpdateMemberField(idx, 'role', e.target.value)}
                          placeholder="e.g. Chief Technology Officer"
                          className="w-full text-xs font-semibold bg-[#F6F6F8] px-2.5 py-1 rounded-lg border border-black/5 text-[#111114]"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] font-spacemono uppercase font-bold text-[#6B6B74] block">
                            LinkedIn URL
                          </label>
                          <input
                            type="url"
                            value={member.linkedin || ''}
                            onChange={(e) => handleUpdateMemberField(idx, 'linkedin', e.target.value)}
                            placeholder="https://..."
                            className="w-full text-[11px] bg-[#F6F6F8] px-2 py-1 rounded border border-black/5"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-spacemono uppercase font-bold text-[#6B6B74] block">
                            Instagram URL
                          </label>
                          <input
                            type="url"
                            value={member.instagram || ''}
                            onChange={(e) =>
                              handleUpdateMemberField(idx, 'instagram', e.target.value)
                            }
                            placeholder="https://..."
                            className="w-full text-[11px] bg-[#F6F6F8] px-2 py-1 rounded border border-black/5"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: SANITY STUDIO & SYNC */}
          {activeTab === 'sanity' && (
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="bg-white rounded-2xl p-6 border border-black/5 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-black/5">
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center font-bold text-xs font-mono">
                      S
                    </span>
                    <div>
                      <h3 className="font-clash font-bold text-base text-[#111114]">
                        Sanity.io Integration
                      </h3>
                      <p className="text-xs text-[#6B6B74]">
                        Project: <code className="font-bold text-[#111114]">{SANITY_PROJECT_ID}</code> • Dataset:{' '}
                        <code className="font-bold text-[#111114]">{SANITY_DATASET}</code>
                      </p>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Client Connected
                  </span>
                </div>

                <p className="text-xs text-[#6B6B74] leading-relaxed">
                  Your Sanity client is configured in <code className="bg-black/5 px-1.5 py-0.5 rounded">src/lib/sanity.ts</code>.
                  You can deploy the standalone studio to manage schemas or use this in-app CMS with direct Firestore &amp; Sanity live sync!
                </p>

                <div className="p-4 rounded-xl bg-[#F6F6F8] border border-black/5 space-y-2">
                  <span className="text-xs font-bold font-spacemono uppercase text-[#111114]">
                    Sanity CLI Setup Quick Reference
                  </span>
                  <pre className="text-[11px] font-mono bg-black text-white p-3 rounded-lg overflow-x-auto">
                    {`# Run in parent directory:
npm create sanity@latest -- --project ${SANITY_PROJECT_ID} --dataset ${SANITY_DATASET} --template clean --typescript --output-path studio-iedc`}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
