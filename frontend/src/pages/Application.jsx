import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const STEPS = [
  { id: 0, label: 'Executive Summary' },
  { id: 1, label: 'Business Model' },
  { id: 2, label: 'History' },
  { id: 3, label: 'Team' },
  { id: 4, label: 'Purpose' },
  { id: 5, label: 'Tech Assistance' },
  { id: 6, label: 'Offer' },
  { id: 7, label: 'Traction & Docs' },
];

const INITIAL_FORM = {
  executive_summary: '',
  business_model: '',
  history: '',
  team: '',
  purpose_of_application: '',
  technical_assistance_required: '',
  offer: '',
  traction_to_date: '',
  additional_documents: '',
};

const Application = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(INITIAL_FORM);
  const [companyId, setCompanyId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Fetch the business owner's company
  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const res = await api.get('/companies/');
        if (res.data.length > 0) {
          setCompanyId(res.data[0].id);
        }
      } catch (err) {
        console.error(err);
      }
    };
    if (user?.role === 'business_owner') fetchCompany();
  }, [user]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const nextStep = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const prevStep = () => setStep((s) => Math.max(s - 1, 0));

  const handleSubmit = async () => {
    if (!companyId) {
      setError('No company found. Please create a company first.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await api.post(`/companies/${companyId}/application/`, form);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.detail || 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const fieldForStep = (stepId) => {
    const map = {
      0: 'executive_summary',
      1: 'business_model',
      2: 'history',
      3: 'team',
      4: 'purpose_of_application',
      5: 'technical_assistance_required',
      6: 'offer',
      7: 'traction_to_date',
    };
    return map[stepId];
  };

  const isCurrentStepValid = () => {
    const field = fieldForStep(step);
    if (step === 7) return true; // traction + additional are optional
    return form[field]?.trim().length > 10;
  };

  // If user is not a business owner
  if (user?.role !== 'business_owner') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] dark:bg-[#0A1929] p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#0A1929] dark:text-white mb-4">Access Denied</h2>
          <p className="text-slate-600 dark:text-slate-400">Only business owners can submit funding applications.</p>
          <Link to="/dashboard" className="mt-4 inline-block text-[#D4AF37] hover:underline">Back to Dashboard</Link>
        </div>
      </div>
    );
  }

  // Success screen
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] dark:bg-[#0A1929] p-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center max-w-md bg-white dark:bg-[#0A1929] border border-slate-200 dark:border-slate-800 rounded-2xl p-10 shadow-2xl"
        >
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-[#0A1929] dark:text-white mb-2">Application Submitted!</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Your funding application is now being analyzed by our AI. You’ll receive valuations and risk scores shortly.
          </p>
          <Link
            to={`/companies/${companyId}`}
            className="inline-block bg-[#D4AF37] text-[#0A1929] font-bold px-6 py-3 rounded-xl hover:bg-[#c9a32b] transition shadow-lg"
          >
            View Dashboard
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0A1929] p-6">
      <div className="max-w-3xl mx-auto">
        {/* Back button */}
        <Link to="/dashboard" className="inline-flex items-center text-sm text-[#D4AF37] hover:underline mb-6">
          ← Back to Dashboard
        </Link>

        <h1 className="text-3xl font-bold text-[#0A1929] dark:text-white mb-2">Funding Application</h1>
        <p className="text-slate-600 dark:text-slate-400 mb-8">
          Complete all sections to submit your application for AI‑powered analysis.
        </p>

        {/* Progress Bar */}
        <div className="flex items-center gap-1 mb-10">
          {STEPS.map((s, idx) => (
            <div key={s.id} className="flex-1 flex flex-col items-center">
              <div
                className={`w-full h-2 rounded-full transition-colors duration-300 ${
                  idx <= step ? 'bg-[#D4AF37]' : 'bg-slate-200 dark:bg-slate-700'
                }`}
              />
              <span
                className={`text-xs mt-2 hidden md:block ${
                  idx <= step ? 'text-[#D4AF37] font-semibold' : 'text-slate-400'
                }`}
              >
                {s.label}
              </span>
            </div>
          ))}
        </div>

        {/* Form Card */}
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
          className="bg-white dark:bg-[#0A1929] border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-lg"
        >
          <h2 className="text-xl font-semibold text-[#0A1929] dark:text-white mb-6">
            {STEPS[step].label}
          </h2>

          {/* Step 0: Executive Summary */}
          {step === 0 && (
            <textarea
              name="executive_summary"
              value={form.executive_summary}
              onChange={handleChange}
              placeholder="Describe your business in one paragraph. What problem are you solving? What makes you unique?"
              rows={6}
              className="w-full px-4 py-3 rounded-xl bg-[#F8FAFC] dark:bg-[#0a1422] border border-slate-200 dark:border-slate-700 text-[#0A1929] dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] transition resize-none"
            />
          )}

          {/* Step 1: Business Model */}
          {step === 1 && (
            <textarea
              name="business_model"
              value={form.business_model}
              onChange={handleChange}
              placeholder="Explain how you make money. Who are your customers? What are your sales channels?"
              rows={6}
              className="w-full px-4 py-3 rounded-xl bg-[#F8FAFC] dark:bg-[#0a1422] border border-slate-200 dark:border-slate-700 text-[#0A1929] dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] transition resize-none"
            />
          )}

          {/* Step 2: History */}
          {step === 2 && (
            <textarea
              name="history"
              value={form.history}
              onChange={handleChange}
              placeholder="When did you start? What milestones have you achieved so far?"
              rows={6}
              className="w-full px-4 py-3 rounded-xl bg-[#F8FAFC] dark:bg-[#0a1422] border border-slate-200 dark:border-slate-700 text-[#0A1929] dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] transition resize-none"
            />
          )}

          {/* Step 3: Team */}
          {step === 3 && (
            <textarea
              name="team"
              value={form.team}
              onChange={handleChange}
              placeholder="List key team members, their qualifications, and experience."
              rows={6}
              className="w-full px-4 py-3 rounded-xl bg-[#F8FAFC] dark:bg-[#0a1422] border border-slate-200 dark:border-slate-700 text-[#0A1929] dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] transition resize-none"
            />
          )}

          {/* Step 4: Purpose of Application */}
          {step === 4 && (
            <textarea
              name="purpose_of_application"
              value={form.purpose_of_application}
              onChange={handleChange}
              placeholder="How much funding do you need? What will you use it for? What impact will it have?"
              rows={6}
              className="w-full px-4 py-3 rounded-xl bg-[#F8FAFC] dark:bg-[#0a1422] border border-slate-200 dark:border-slate-700 text-[#0A1929] dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] transition resize-none"
            />
          )}

          {/* Step 5: Technical Assistance */}
          {step === 5 && (
            <textarea
              name="technical_assistance_required"
              value={form.technical_assistance_required}
              onChange={handleChange}
              placeholder="Do you need help with governance, marketing, accounting, or other areas?"
              rows={6}
              className="w-full px-4 py-3 rounded-xl bg-[#F8FAFC] dark:bg-[#0a1422] border border-slate-200 dark:border-slate-700 text-[#0A1929] dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] transition resize-none"
            />
          )}

          {/* Step 6: Offer */}
          {step === 6 && (
            <textarea
              name="offer"
              value={form.offer}
              onChange={handleChange}
              placeholder="What percentage equity are you offering? Do you have a buyback proposal?"
              rows={6}
              className="w-full px-4 py-3 rounded-xl bg-[#F8FAFC] dark:bg-[#0a1422] border border-slate-200 dark:border-slate-700 text-[#0A1929] dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] transition resize-none"
            />
          )}

          {/* Step 7: Traction & Additional Documents */}
          {step === 7 && (
            <>
              <textarea
                name="traction_to_date"
                value={form.traction_to_date}
                onChange={handleChange}
                placeholder="List your major achievements (e.g., users, revenue, partnerships)."
                rows={4}
                className="w-full px-4 py-3 rounded-xl bg-[#F8FAFC] dark:bg-[#0a1422] border border-slate-200 dark:border-slate-700 text-[#0A1929] dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] transition resize-none mb-4"
              />
              <textarea
                name="additional_documents"
                value={form.additional_documents}
                onChange={handleChange}
                placeholder="List any additional documents available (e.g., business plan, bank statements)."
                rows={3}
                className="w-full px-4 py-3 rounded-xl bg-[#F8FAFC] dark:bg-[#0a1422] border border-slate-200 dark:border-slate-700 text-[#0A1929] dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] transition resize-none"
              />
            </>
          )}

          {/* Error message */}
          {error && (
            <div className="mt-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <button
              onClick={prevStep}
              disabled={step === 0}
              className="px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition disabled:opacity-50"
            >
              Previous
            </button>

            {step < STEPS.length - 1 ? (
              <button
                onClick={nextStep}
                disabled={!isCurrentStepValid()}
                className="px-6 py-3 bg-[#D4AF37] text-[#0A1929] font-bold rounded-xl hover:bg-[#c9a32b] transition shadow-lg disabled:opacity-50"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-6 py-3 bg-[#00A896] text-white font-bold rounded-xl hover:bg-[#008f7a] transition shadow-lg disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Application'}
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Application;
