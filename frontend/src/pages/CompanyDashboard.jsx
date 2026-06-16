import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const CompanyDashboard = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboard();
  }, [id]);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/companies/${id}/dashboard/`);
      setData(res.data);
    } catch (err) {
      setError('Failed to load dashboard');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] dark:bg-[#0A1929]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#D4AF37]"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] dark:bg-[#0A1929]">
        <div className="text-center text-red-500">{error || 'Data not found'}</div>
      </div>
    );
  }

  const { company, valuations, risk_assessment, financial_records, documents } = data;

  // Restrict edit to business owner only
  const canEdit = user?.role === 'business_owner' && company.owner_id === user.id;

  // Find a completed funding application or pitch deck for Ratings Editor link
  const analysisDoc = documents.find(
    (doc) =>
      (doc.document_type === 'funding_application' || doc.document_type === 'pitch_deck') &&
      doc.parse_status === 'completed'
  );
  const canEditRatings = user?.role === 'investor' || user?.role === 'admin';

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0A1929] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Back button */}
        <Link
          to="/companies"
          className="inline-flex items-center text-sm text-[#D4AF37] hover:underline mb-6"
        >
          ← Back to Companies
        </Link>

        {/* Company Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-[#0A1929] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 mb-6"
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-[#0A1929] dark:text-white">{company.name}</h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                {company.sector} · {company.stage} · Founded {company.founded_year}
              </p>
              <p className="text-slate-500 dark:text-slate-500 text-sm mt-2">{company.description}</p>
            </div>
            <div className="flex items-center gap-2">
              {/* Download Report button */}
              <button
                onClick={() => {
                  api.get(`/companies/${company.id}/dashboard/report`, { responseType: 'blob' })
                    .then(response => {
                      const url = window.URL.createObjectURL(new Blob([response.data]));
                      const link = document.createElement('a');
                      link.href = url;
                      link.setAttribute('download', `${company.name.replace(/\s+/g, '_')}_report.xlsx`);
                      document.body.appendChild(link);
                      link.click();
                      link.remove();
                    })
                    .catch(err => console.error('Download failed', err));
                }}
                className="px-4 py-2 bg-[#00A896]/10 text-[#00A896] rounded-xl text-sm font-semibold hover:bg-[#00A896]/20 transition"
              >
                📥 Download Report
              </button>
              {/* Simulate button */}
              <Link
                to={`/companies/${company.id}/simulate`}
                className="px-4 py-2 bg-[#D4AF37]/10 text-[#D4AF37] rounded-xl text-sm font-semibold hover:bg-[#D4AF37]/20 transition"
              >
                📊 Simulate
              </Link>
              {canEdit && (
                <Link
                  to={`/companies/${company.id}/edit`}
                  className="px-4 py-2 bg-[#D4AF37]/10 text-[#D4AF37] rounded-xl text-sm font-semibold hover:bg-[#D4AF37]/20 transition"
                >
                  ✏️ Edit
                </Link>
              )}
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#D4AF37]/10 text-[#D4AF37]">
                {company.stage || 'N/A'}
              </span>
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#00A896]/10 text-[#00A896]">
                {company.sector}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Valuations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-[#0A1929] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-[#0A1929] dark:text-white">Valuations</h2>
            {/* Ratings Editor button – visible only to investors/admins when analysis doc exists */}
            {canEditRatings && analysisDoc && (
              <Link
                to={`/companies/${id}/documents/${analysisDoc.id}/ratings`}
                className="text-sm bg-[#D4AF37]/10 text-[#D4AF37] px-4 py-2 rounded-xl font-semibold hover:bg-[#D4AF37]/20 transition"
              >
                ✏️ Edit Ratings
              </Link>
            )}
          </div>
          {Object.keys(valuations).length === 0 ? (
            <p className="text-slate-500">No valuations yet.</p>
          ) : (
            <div className="grid md:grid-cols-3 gap-4">
              {Object.entries(valuations).map(([method, val]) => (
                <div key={method} className="p-4 bg-[#F8FAFC] dark:bg-[#0a1422] rounded-xl border border-slate-200 dark:border-slate-800">
                  <p className="text-sm text-slate-500 dark:text-slate-400 capitalize mb-1">
                    {method.replace('_', ' ')}
                  </p>
                  <p className="text-2xl font-bold text-[#0A1929] dark:text-white">
                    ${val.pre_money_usd?.toLocaleString() || 'N/A'}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">Pre‑money</p>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Risk & Financials side by side */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Risk Assessment */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-[#0A1929] border border-slate-200 dark:border-slate-800 rounded-2xl p-6"
          >
            <h2 className="text-xl font-semibold text-[#0A1929] dark:text-white mb-4">Risk Assessment</h2>
            {risk_assessment ? (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-slate-600 dark:text-slate-400">Overall Score</span>
                  <span className={`text-2xl font-bold ${
                    risk_assessment.overall_score <= 40 ? 'text-green-500' :
                    risk_assessment.overall_score <= 70 ? 'text-yellow-500' : 'text-red-500'
                  }`}>
                    {risk_assessment.overall_score}
                  </span>
                </div>
                <div className="space-y-2">
                  {Object.entries(risk_assessment.category_scores?.category_breakdown || {}).map(([cat, details]) => (
                    <div key={cat} className="flex justify-between text-sm">
                      <span className="text-slate-500 dark:text-slate-400 capitalize">{cat.replace('_', ' ')}</span>
                      <span className="font-medium text-[#0A1929] dark:text-white">{details.raw_score}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-slate-500">No risk assessment yet.</p>
            )}
          </motion.div>

          {/* Financial Records */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-[#0A1929] border border-slate-200 dark:border-slate-800 rounded-2xl p-6"
          >
            <h2 className="text-xl font-semibold text-[#0A1929] dark:text-white mb-4">Financial Records</h2>
            {financial_records.length === 0 ? (
              <p className="text-slate-500">No financial records yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700">
                      <th className="text-left py-2 text-slate-500">Metric</th>
                      <th className="text-right py-2 text-slate-500">Amount</th>
                      <th className="text-right py-2 text-slate-500">Currency</th>
                    </tr>
                  </thead>
                  <tbody>
                    {financial_records.slice(0, 10).map((f) => (
                      <tr key={f.id} className="border-b border-slate-100 dark:border-slate-800">
                        <td className="py-2 capitalize text-[#0A1929] dark:text-white">{f.metric_name}</td>
                        <td className="py-2 text-right text-[#0A1929] dark:text-white">{f.amount?.toLocaleString()}</td>
                        <td className="py-2 text-right text-slate-500">{f.currency}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        </div>

        {/* Documents */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-[#0A1929] border border-slate-200 dark:border-slate-800 rounded-2xl p-6"
        >
          <h2 className="text-xl font-semibold text-[#0A1929] dark:text-white mb-4">Documents</h2>
          {documents.length === 0 ? (
            <p className="text-slate-500">No documents uploaded yet.</p>
          ) : (
            <div className="space-y-2">
              {documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">📄</span>
                    <span className="text-[#0A1929] dark:text-white font-medium">{doc.title}</span>
                    <span className="text-xs text-slate-400 uppercase">{doc.document_type}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      doc.parse_status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                      doc.parse_status === 'processing' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                      doc.parse_status === 'failed' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                      'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
                    }`}>
                      {doc.parse_status}
                    </span>
                    {/* Secondary Edit Ratings link (per document) – visible only to investors/admins */}
                    {canEditRatings && (doc.document_type === 'pitch_deck' || doc.document_type === 'funding_application') && doc.parse_status === 'completed' && (
                      <Link
                        to={`/companies/${id}/documents/${doc.id}/ratings`}
                        className="text-xs bg-[#D4AF37]/10 text-[#D4AF37] px-3 py-1 rounded-full hover:bg-[#D4AF37]/20 transition"
                      >
                        ✏️ Edit Ratings
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default CompanyDashboard;
