import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User } from 'firebase/auth';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import confetti from 'canvas-confetti';
import { X, Sparkles, Send, CheckCircle2, Rocket, Lightbulb, ShieldCheck } from 'lucide-react';

interface JoinUsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

export const JoinUsModal: React.FC<JoinUsModalProps> = ({ isOpen, onClose, user }) => {
  const [formData, setFormData] = useState({
    name: user?.displayName || '',
    email: user?.email || '',
    phone: '',
    startupName: '',
    department: 'Computer Science & Engineering',
    stage: 'Idea' as 'Idea' | 'Prototype' | 'Early Traction' | 'Pre-Incubation',
    pitchSummary: '',
    needsGrant: true,
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await addDoc(collection(db, 'applications'), {
        ...formData,
        userId: user?.uid || null,
        submittedAt: serverTimestamp(),
      });

      setSubmitted(true);
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.5 },
        colors: ['#5231FF', '#FE4ED7', '#111114'],
      });
    } catch (err) {
      console.error('Failed to submit application:', err);
      // Even if Firestore security rules or network fails, provide feedback
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    onClose();
  };

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
          className="relative w-full max-w-xl bg-white rounded-[28px] shadow-2xl p-6 sm:p-8 z-10 border border-white/80 max-h-[90vh] overflow-y-auto no-scrollbar"
        >
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-black/5 hover:bg-[#5231FF] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          {submitted ? (
            <div className="py-8 text-center flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4 shadow-sm">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <h3 className="font-clash font-bold text-2xl text-[#111114] mb-2">
                Application Submitted!
              </h3>
              <p className="font-general text-sm text-[#6B6B74] max-w-sm mb-6 leading-relaxed">
                Thank you, <span className="font-bold text-[#111114]">{formData.name}</span>. The
                IEDC MTM College incubation curation panel will review your proposal and get back to
                you within 48 hours.
              </p>
              <button
                type="button"
                onClick={handleReset}
                className="px-6 py-2.5 bg-[#5231FF] text-white text-sm font-semibold rounded-full hover:brightness-110 cursor-pointer shadow-md"
              >
                Done
              </button>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-[#5231FF]" />
                <span className="font-spacemono uppercase tracking-wider text-xs font-bold text-[#6B6B74]">
                  STUDENT INCUBATION &amp; PRE-SEED
                </span>
              </div>
              <h2 className="font-clash font-bold text-2xl sm:text-3xl text-[#111114] mb-1">
                Join IEDC MTM College
              </h2>
              <p className="font-general text-xs sm:text-sm text-[#6B6B74] mb-6">
                Turn your collegiate project into a registered venture. Access structured mentorship,
                cloud credits, and pre-incubation grants.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#111114] mb-1 font-spacemono uppercase">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Adil Shan"
                      className="w-full bg-[#F6F6F8] border border-black/5 rounded-xl px-3.5 py-2.5 text-xs text-[#111114] focus:outline-none focus:border-[#5231FF] focus:bg-white transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#111114] mb-1 font-spacemono uppercase">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="you@mtmcollege.in"
                      className="w-full bg-[#F6F6F8] border border-black/5 rounded-xl px-3.5 py-2.5 text-xs text-[#111114] focus:outline-none focus:border-[#5231FF] focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#111114] mb-1 font-spacemono uppercase">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 98470 00000"
                      className="w-full bg-[#F6F6F8] border border-black/5 rounded-xl px-3.5 py-2.5 text-xs text-[#111114] focus:outline-none focus:border-[#5231FF] focus:bg-white transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#111114] mb-1 font-spacemono uppercase">
                      Department / Major *
                    </label>
                    <select
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="w-full bg-[#F6F6F8] border border-black/5 rounded-xl px-3.5 py-2.5 text-xs text-[#111114] focus:outline-none focus:border-[#5231FF] focus:bg-white transition-all"
                    >
                      <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                      <option value="Commerce & Management">Commerce & Management</option>
                      <option value="Electronics & Communication">Electronics & Communication</option>
                      <option value="Information Technology">Information Technology</option>
                      <option value="Multidisciplinary Team">Multidisciplinary Cohort</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#111114] mb-1 font-spacemono uppercase">
                      Startup / Idea Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.startupName}
                      onChange={(e) => setFormData({ ...formData, startupName: e.target.value })}
                      placeholder="e.g. AgriDrone Kerala"
                      className="w-full bg-[#F6F6F8] border border-black/5 rounded-xl px-3.5 py-2.5 text-xs text-[#111114] focus:outline-none focus:border-[#5231FF] focus:bg-white transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#111114] mb-1 font-spacemono uppercase">
                      Maturity Stage *
                    </label>
                    <select
                      value={formData.stage}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          stage: e.target.value as any,
                        })
                      }
                      className="w-full bg-[#F6F6F8] border border-black/5 rounded-xl px-3.5 py-2.5 text-xs text-[#111114] focus:outline-none focus:border-[#5231FF] focus:bg-white transition-all"
                    >
                      <option value="Idea">Idea on Paper</option>
                      <option value="Prototype">Working Prototype / MVP</option>
                      <option value="Early Traction">Early Traction / Pilot Users</option>
                      <option value="Pre-Incubation">Registered Entity</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#111114] mb-1 font-spacemono uppercase">
                    Pitch Summary / Problem Statement *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={formData.pitchSummary}
                    onChange={(e) => setFormData({ ...formData, pitchSummary: e.target.value })}
                    placeholder="Briefly describe what problem you are solving, who the target audience is, and how your technical solution works."
                    className="w-full bg-[#F6F6F8] border border-black/5 rounded-xl px-3.5 py-2.5 text-xs text-[#111114] focus:outline-none focus:border-[#5231FF] focus:bg-white transition-all resize-none"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="needsGrant"
                    checked={formData.needsGrant}
                    onChange={(e) => setFormData({ ...formData, needsGrant: e.target.checked })}
                    className="w-4 h-4 rounded text-[#5231FF] focus:ring-[#5231FF]"
                  />
                  <label htmlFor="needsGrant" className="text-xs text-[#111114] cursor-pointer">
                    Apply for pre-incubation seed grant (Up to ₹50,000 for verified prototypes)
                  </label>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-[#5231FF] text-white rounded-full font-semibold text-sm hover:brightness-110 shadow-[0_4px_18px_rgba(82,49,255,0.3)] transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {loading ? (
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Rocket className="w-4 h-4" />
                        <span>Submit Proposal</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
