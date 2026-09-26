import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import confetti from 'canvas-confetti';
import { X, CheckCircle2, Rocket } from 'lucide-react';

interface JoinUsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const JoinUsModal: React.FC<JoinUsModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
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
        submittedAt: serverTimestamp(),
      });

      setSubmitted(true);
      confetti({
        particleCount: 50,
        spread: 50,
        origin: { y: 0.5 },
        colors: ['#000000', '#888888', '#e5e5e5'],
      });
    } catch (err) {
      console.error('Failed to submit application:', err);
      // Fallback
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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/40 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: 12 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-xl bg-white rounded-[2px] shadow-2xl p-6 sm:p-8 z-10 border border-[#e5e5e5] max-h-[90vh] overflow-y-auto no-scrollbar font-instrument"
        >
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 w-7 h-7 rounded-[2px] border border-[#e5e5e5] bg-white hover:bg-[#fafaf9] text-[#000000] flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          {submitted ? (
            <div className="py-8 text-center flex flex-col items-center">
              <div className="w-12 h-12 rounded-[2px] border border-emerald-300 bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="font-instrument font-normal text-2xl text-[#000000] mb-2 tracking-tight">
                Application Submitted
              </h3>
              <p className="font-instrument text-xs sm:text-sm text-[#666666] max-w-sm mb-6 leading-relaxed">
                Thank you, <span className="font-medium text-[#000000]">{formData.name}</span>. The
                IEDC MTM College incubation panel will review your proposal and get back to
                you within 48 hours.
              </p>
              <button
                type="button"
                onClick={handleReset}
                className="px-6 py-2.5 bg-[#000000] text-white text-xs font-medium rounded-[2px] border border-[#000000] hover:bg-neutral-800 cursor-pointer font-instrument"
              >
                Done
              </button>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-1.5 h-1.5 rounded-[1px] bg-[#888888]" />
                <span className="font-spacemono uppercase tracking-widest text-[10px] text-[#888888]">
                  STUDENT INCUBATION &amp; PRE-SEED
                </span>
              </div>
              <h2 className="font-instrument font-normal text-2xl sm:text-3xl text-[#000000] mb-1 tracking-tight">
                Join IEDC MTM College
              </h2>
              <p className="font-instrument text-xs sm:text-sm text-[#666666] mb-6 font-normal">
                Turn your collegiate project into a registered venture. Access structured mentorship,
                cloud credits, and pre-incubation grants.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-[#000000] mb-1 font-instrument uppercase tracking-wider">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Adil Shan"
                      className="w-full bg-[#fafaf9] border border-[#e5e5e5] rounded-[2px] px-3 py-2 text-xs text-[#000000] focus:outline-none focus:border-[#000000] focus:bg-white transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-[#000000] mb-1 font-instrument uppercase tracking-wider">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="you@mtmcollege.in"
                      className="w-full bg-[#fafaf9] border border-[#e5e5e5] rounded-[2px] px-3 py-2 text-xs text-[#000000] focus:outline-none focus:border-[#000000] focus:bg-white transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-[#000000] mb-1 font-instrument uppercase tracking-wider">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 98470 00000"
                      className="w-full bg-[#fafaf9] border border-[#e5e5e5] rounded-[2px] px-3 py-2 text-xs text-[#000000] focus:outline-none focus:border-[#000000] focus:bg-white transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-[#000000] mb-1 font-instrument uppercase tracking-wider">
                      Department / Major *
                    </label>
                    <select
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="w-full bg-[#fafaf9] border border-[#e5e5e5] rounded-[2px] px-3 py-2 text-xs text-[#000000] focus:outline-none focus:border-[#000000] focus:bg-white transition-colors"
                    >
                      <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                      <option value="Commerce & Management">Commerce & Management</option>
                      <option value="Electronics & Communication">Electronics & Communication</option>
                      <option value="Arts & Humanities">Arts & Humanities</option>
                      <option value="Other Cohort">Other Cohort</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-[#000000] mb-1 font-instrument uppercase tracking-wider">
                      Proposed Venture / Project Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.startupName}
                      onChange={(e) => setFormData({ ...formData, startupName: e.target.value })}
                      placeholder="e.g. AgriDrone Labs"
                      className="w-full bg-[#fafaf9] border border-[#e5e5e5] rounded-[2px] px-3 py-2 text-xs text-[#000000] focus:outline-none focus:border-[#000000] focus:bg-white transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-[#000000] mb-1 font-instrument uppercase tracking-wider">
                      Maturity Stage *
                    </label>
                    <select
                      value={formData.stage}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          stage: e.target.value as 'Idea' | 'Prototype' | 'Early Traction' | 'Pre-Incubation',
                        })
                      }
                      className="w-full bg-[#fafaf9] border border-[#e5e5e5] rounded-[2px] px-3 py-2 text-xs text-[#000000] focus:outline-none focus:border-[#000000] focus:bg-white transition-colors"
                    >
                      <option value="Idea">Idea Stage</option>
                      <option value="Prototype">Working Prototype</option>
                      <option value="Early Traction">Early Traction / Users</option>
                      <option value="Pre-Incubation">Registered Pre-Incubation</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[#000000] mb-1 font-instrument uppercase tracking-wider">
                    Pitch Summary / Problem Statement *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={formData.pitchSummary}
                    onChange={(e) => setFormData({ ...formData, pitchSummary: e.target.value })}
                    placeholder="Briefly describe what problem you are solving, who the target audience is, and how your technical solution works."
                    className="w-full bg-[#fafaf9] border border-[#e5e5e5] rounded-[2px] px-3 py-2 text-xs text-[#000000] focus:outline-none focus:border-[#000000] focus:bg-white transition-colors resize-none"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="needsGrant"
                    checked={formData.needsGrant}
                    onChange={(e) => setFormData({ ...formData, needsGrant: e.target.checked })}
                    className="w-3.5 h-3.5 rounded-[1px] text-[#000000] focus:ring-[#000000]"
                  />
                  <label htmlFor="needsGrant" className="text-xs text-[#666666] cursor-pointer font-instrument">
                    Apply for pre-incubation seed grant (Up to ₹50,000 for verified prototypes)
                  </label>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 bg-[#000000] text-white rounded-[2px] font-medium text-xs hover:bg-neutral-800 border border-[#000000] transition-colors flex items-center justify-center gap-2 cursor-pointer font-instrument"
                  >
                    {loading ? (
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Rocket className="w-3.5 h-3.5" />
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
