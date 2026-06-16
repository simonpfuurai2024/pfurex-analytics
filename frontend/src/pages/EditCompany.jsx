import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const SECTORS = ['FinTech', 'AgriTech', 'HealthTech', 'CleanTech', 'Logistics', 'EdTech', 'Other'];
const STAGES = ['Pre-seed', 'Seed', 'Series A', 'Series B', 'Growth'];

const EditCompany = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [form, setForm] = useState({
    name: '',
    sector: 'FinTech',
    founded_year: '',
    stage: 'Seed',
    country: 'Zimbabwe',
    description: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [notAuthorized, setNotAuthorized] = useState(false);

  useEffect(() => {
    fetchCompany();
  }, [id]);

  const fetchCompany = async () => {
    try {
      const res = await api.get(`/companies/${id}`);
      const c = res.data;
      // Check ownership – only business_owner who owns this company can edit
      if (user?.role !== 'business_owner' || c.owner_id !== user.id) {
        setNotAuthorized(true);
        setLoading(false);
        return;
      }
      setForm({
        name: c.name || '',
        sector: c.sector || 'FinTech',
        founded_year: c.founded_year ? String(c.founded_year) : '',
        stage: c.stage || 'Seed',
        country: c.country || 'Zimbabwe',
        description: c.description || '',
      });
    } catch (err) {
      setError('Failed to load company');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.put(`/companies/${id}`, {
        ...form,
        founded_year: form.founded_year ? parseInt(form.founded_year) : null,
      });
      navigate(`/companies/${id}`);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update company');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/companies/${id}`);
      navigate('/companies');
    } catch (err) {
      setError('Failed to delete company');
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] dark:bg-[#0A1929]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#D4AF37]"></div>
      </div>
    );
  }

  if (notAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] dark:bg-[#0A1929] p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#0A1929] dark:text-white mb-4">Access Denied</h2>
          <p className="text-slate-600 dark:text-slate-400">Only the company owner can edit this company.</p>
          <Link to="/dashboard" className="mt-4 inline-block text-[#D4AF37] hover:underline">Back to Dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0A1929] p-6">
      <div className="max-w-xl mx-auto">
        <Link to={`/companies/${id}`} className="inline-flex items-center text-sm text-[#D4AF37] hover:underline mb-6">
          ← Back to Dashboard
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-[#0A1929] border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-xl"
        >
          <h1 className="text-2xl font-bold text-[#0A1929] dark:text-white mb-6">Edit Company</h1>

          {error && (
            <div className="mb-6 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[#0A1929] dark:text-slate-300 mb-1">Company Name *</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl bg-[#F8FAFC] dark:bg-[#0a1422] border border-slate-200 dark:border-slate-700 text-[#0A1929] dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] transition"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#0A1929] dark:text-slate-300 mb-1">Sector</label>
                <select
                  name="sector"
                  value={form.sector}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl bg-[#F8FAFC] dark:bg-[#0a1422] border border-slate-200 dark:border-slate-700 text-[#0A1929] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37] transition"
                >
                  {SECTORS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#0A1929] dark:text-slate-300 mb-1">Stage</label>
                <select
                  name="stage"
                  value={form.stage}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl bg-[#F8FAFC] dark:bg-[#0a1422] border border-slate-200 dark:border-slate-700 text-[#0A1929] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37] transition"
                >
                  {STAGES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#0A1929] dark:text-slate-300 mb-1">Founded Year</label>
              <input
                type="number"
                name="founded_year"
                value={form.founded_year}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl bg-[#F8FAFC] dark:bg-[#0a1422] border border-slate-200 dark:border-slate-700 text-[#0A1929] dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#0A1929] dark:text-slate-300 mb-1">Country</label>
              <input
                type="text"
                name="country"
                value={form.country}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl bg-[#F8FAFC] dark:bg-[#0a1422] border border-slate-200 dark:border-slate-700 text-[#0A1929] dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#0A1929] dark:text-slate-300 mb-1">Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-3 rounded-xl bg-[#F8FAFC] dark:bg-[#0a1422] border border-slate-200 dark:border-slate-700 text-[#0A1929] dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] transition resize-none"
              />
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 py-3 bg-[#D4AF37] text-[#0A1929] font-bold rounded-xl hover:bg-[#c9a32b] transition shadow-lg disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="px-6 py-3 border border-red-500 text-red-500 font-bold rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition"
              >
                Delete
              </button>
            </div>
          </form>

          {/* Delete Confirmation Modal */}
          {showDeleteConfirm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white dark:bg-[#0A1929] rounded-2xl p-6 max-w-sm mx-4 shadow-2xl border border-slate-200 dark:border-slate-800"
              >
                <h3 className="text-lg font-bold text-[#0A1929] dark:text-white mb-2">Delete Company?</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm mb-6">
                  This action cannot be undone. All company data, including valuations and documents, will be permanently removed.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 py-2 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="flex-1 py-2 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition disabled:opacity-50"
                  >
                    {deleting ? 'Deleting...' : 'Yes, Delete'}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default EditCompany;
