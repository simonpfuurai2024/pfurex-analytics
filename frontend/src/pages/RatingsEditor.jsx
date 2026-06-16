import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';

const SCORECARD_FACTORS = ['team', 'market_size', 'product_tech', 'competitive_environment', 'marketing_sales', 'funding_need', 'other'];
const RISK_FACTORS = ['policy_regulatory', 'currency_macro', 'management_governance', 'operational_infrastructure', 'market_competition'];

const RatingsEditor = () => {
  const { companyId, documentId } = useParams();
  const navigate = useNavigate();
  const [doc, setDoc] = useState(null);
  const [scorecard, setScorecard] = useState({});
  const [risk, setRisk] = useState({});
  const [justifications, setJustifications] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    fetchDocument();
  }, [documentId]);

  const fetchDocument = async () => {
    try {
      const res = await api.get(`/companies/${companyId}/documents/${documentId}`);
      setDoc(res.data);
      const analysis = res.data.parsed_data?.llm_analysis;
      const edited = res.data.parsed_data?.edited_ratings;
      if (edited) {
        setScorecard(Object.fromEntries(Object.entries(edited.scorecard_ratings).map(([k, v]) => [k, v.rating])));
        setRisk(Object.fromEntries(Object.entries(edited.risk_scores).map(([k, v]) => [k, v.score])));
        setJustifications(Object.fromEntries(Object.entries(edited.scorecard_ratings).map(([k, v]) => [k, v.justification || ''])));
      } else if (analysis) {
        if (analysis.scorecard_ratings) {
          setScorecard(Object.fromEntries(Object.entries(analysis.scorecard_ratings).map(([k, v]) => [k, v.rating])));
          setJustifications(Object.fromEntries(Object.entries(analysis.scorecard_ratings).map(([k, v]) => [k, v.justification || ''])));
        }
        if (analysis.risk_scores) {
          setRisk(Object.fromEntries(Object.entries(analysis.risk_scores).map(([k, v]) => [k, v.score])));
        }
      }
    } catch (err) {
      setError('Failed to load document.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (recalculate = true) => {
    setSubmitting(true);
    setError('');
    try {
      const payload = {
        scorecard_ratings: scorecard,
        risk_scores: risk,
        justifications,
        recalculate,
      };
      const res = await api.put(`/companies/${companyId}/documents/${documentId}/ratings`, payload);
      setResult(res.data);
      setShowSuccess(true);
      // Navigate back after showing success message
      setTimeout(() => {
        navigate(`/companies/${companyId}`);
      }, 2500);
    } catch (err) {
      setError(err.response?.data?.detail || 'Update failed.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] dark:bg-[#0A1929]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#D4AF37]"></div>
      </div>
    );
  }

  if (error && !doc) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] dark:bg-[#0A1929]">
        <div className="text-center text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0A1929] p-6">
      <div className="max-w-4xl mx-auto">
        <Link to={`/companies/${companyId}`} className="inline-flex items-center text-sm text-[#D4AF37] hover:underline mb-6">
          ← Back to Dashboard
        </Link>

        {/* Success Toast */}
        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-6 right-6 z-50 bg-green-50 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-xl p-4 shadow-lg max-w-sm"
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">✅</span>
                <div>
                  <h3 className="font-semibold text-green-800 dark:text-green-300">Ratings Updated Successfully!</h3>
                  <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                    Valuations and risk score recalculated. Redirecting to dashboard...
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold text-[#0A1929] dark:text-white mb-6">Edit Ratings</h1>
          <p className="text-slate-600 dark:text-slate-400 mb-8">
            Document: {doc?.title} ({doc?.document_type})
          </p>

          {/* Scorecard Factors */}
          <h2 className="text-xl font-semibold mb-4 text-[#0A1929] dark:text-white">Scorecard Factors (0.5 – 2.0)</h2>
          <div className="grid md:grid-cols-2 gap-6 mb-10">
            {SCORECARD_FACTORS.map((factor) => (
              <div key={factor} className="bg-white dark:bg-[#0A1929] border border-slate-200 dark:border-slate-800 rounded-xl p-4">
                <label className="block text-sm font-medium capitalize mb-1 text-[#0A1929] dark:text-slate-300">{factor.replace('_', ' ')}</label>
                <input
                  type="number"
                  min="0.5"
                  max="2.0"
                  step="0.1"
                  value={scorecard[factor] || 1.0}
                  onChange={(e) => setScorecard({ ...scorecard, [factor]: parseFloat(e.target.value) || 1.0 })}
                  className="w-full px-3 py-2 rounded-lg bg-[#F8FAFC] dark:bg-[#0a1422] border border-slate-200 dark:border-slate-700 text-[#0A1929] dark:text-white"
                />
                <input
                  type="text"
                  placeholder="Justification..."
                  value={justifications[factor] || ''}
                  onChange={(e) => setJustifications({ ...justifications, [factor]: e.target.value })}
                  className="w-full mt-2 px-3 py-2 rounded-lg bg-[#F8FAFC] dark:bg-[#0a1422] border border-slate-200 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-400"
                />
              </div>
            ))}
          </div>

          {/* Risk Scores */}
          <h2 className="text-xl font-semibold mb-4 text-[#0A1929] dark:text-white">Risk Scores (1 – 10)</h2>
          <div className="grid md:grid-cols-2 gap-6 mb-10">
            {RISK_FACTORS.map((factor) => (
              <div key={factor} className="bg-white dark:bg-[#0A1929] border border-slate-200 dark:border-slate-800 rounded-xl p-4">
                <label className="block text-sm font-medium capitalize mb-1 text-[#0A1929] dark:text-slate-300">{factor.replace('_', ' ')}</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={risk[factor] || 5}
                  onChange={(e) => setRisk({ ...risk, [factor]: parseInt(e.target.value) || 5 })}
                  className="w-full px-3 py-2 rounded-lg bg-[#F8FAFC] dark:bg-[#0a1422] border border-slate-200 dark:border-slate-700 text-[#0A1929] dark:text-white"
                />
              </div>
            ))}
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm mb-4">
              {error}
            </div>
          )}

          <div className="flex gap-4">
            <button
              onClick={() => handleSubmit(true)}
              disabled={submitting}
              className="px-6 py-3 bg-[#D4AF37] text-[#0A1929] font-bold rounded-xl hover:bg-[#c9a32b] transition shadow-lg disabled:opacity-50"
            >
              {submitting ? 'Recalculating...' : 'Save & Recalculate'}
            </button>
            <button
              onClick={() => handleSubmit(false)}
              disabled={submitting}
              className="px-6 py-3 border border-[#D4AF37] text-[#D4AF37] font-bold rounded-xl hover:bg-[#D4AF37] hover:text-[#0A1929] transition disabled:opacity-50"
            >
              Save Only
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default RatingsEditor;
