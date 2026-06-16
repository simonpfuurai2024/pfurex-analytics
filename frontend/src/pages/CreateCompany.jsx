import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const SECTORS = ['FinTech', 'AgriTech', 'HealthTech', 'CleanTech', 'Logistics', 'EdTech', 'Other'];
const STAGES = ['Pre-seed', 'Seed', 'Series A', 'Series B', 'Growth'];

const CreateCompany = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    sector: 'FinTech',
    founded_year: new Date().getFullYear(),
    stage: 'Seed',
    country: 'Zimbabwe',
    description: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/companies/', {
        ...form,
        founded_year: parseInt(form.founded_year),
      });
      navigate('/companies'); // go to companies list after creation
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create company');
    } finally {
      setLoading(false);
    }
  };

  if (user?.role !== 'business_owner') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] dark:bg-[#0A1929] p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#0A1929] dark:text-white mb-4">Access Denied</h2>
          <p className="text-slate-600 dark:text-slate-400">Only business owners can create a company.</p>
          <Link to="/dashboard" className="mt-4 inline-block text-[#D4AF37] hover:underline">Back to Dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0A1929] p-6">
      <div className="max-w-xl mx-auto">
        <Link to="/dashboard" className="inline-flex items-center text-sm text-[#D4AF37] hover:underline mb-6">
          ← Back to Dashboard
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-[#0A1929] border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-xl"
        >
          <h1 className="text-2xl font-bold text-[#0A1929] dark:text-white mb-6">Create Your Company</h1>

          {error && (
            <div className="mb-6 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[#0A1929] dark:text-slate-300 mb-1">Company Name *</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl bg-[#F8FAFC] dark:bg-[#0a1422] border border-slate-200 dark:border-slate-700 text-[#0A1929] dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] transition"
                placeholder="EcoCash Analytics"
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
                placeholder="A brief description of your company..."
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#D4AF37] text-[#0A1929] font-bold rounded-xl hover:bg-[#c9a32b] transition shadow-lg disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Company'}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default CreateCompany;
