import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Companies = () => {
  const { user } = useAuth();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const res = await api.get('/companies/');
      setCompanies(res.data);
    } catch (err) {
      setError('Failed to load companies');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0A1929] p-6">
      <div className="max-w-6xl mx-auto">
        <Link
          to="/dashboard"
          className="inline-flex items-center text-sm text-[#D4AF37] hover:underline mb-6"
        >
          ← Back to Dashboard
        </Link>

        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl font-bold text-[#0A1929] dark:text-white mb-2">
              {user?.role === 'business_owner' ? 'My Company' : 'Companies'}
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              {user?.role === 'business_owner'
                ? 'Manage your company profile and funding application.'
                : 'Explore all registered companies.'}
            </p>
          </motion.div>

          {user?.role === 'business_owner' && (
            <Link
              to="/companies/new"
              className="inline-flex items-center gap-2 bg-[#D4AF37] text-[#0A1929] font-bold px-5 py-3 rounded-xl hover:bg-[#c9a32b] transition shadow-lg"
            >
              <span className="text-lg">+</span> Create Company
            </Link>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#D4AF37]"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center text-red-600 dark:text-red-400">
            {error}
          </div>
        ) : companies.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🏢</div>
            <p className="text-slate-500 dark:text-slate-400 text-lg mb-6">
              No companies yet.
            </p>
            {user?.role === 'business_owner' && (
              <Link
                to="/companies/new"
                className="inline-block bg-[#D4AF37] text-[#0A1929] font-bold px-6 py-3 rounded-xl hover:bg-[#c9a32b] transition shadow-lg"
              >
                Create Your First Company
              </Link>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {companies.map((company) => (
              <motion.div
                key={company.id}
                whileHover={{ scale: 1.02 }}
                className="bg-white dark:bg-[#0A1929] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl">🏢</span>
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#D4AF37]/10 text-[#D4AF37]">
                    {company.stage || 'Seed'}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-[#0A1929] dark:text-white mb-1">
                  {company.name}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                  {company.sector} · Founded {company.founded_year}
                </p>
                <Link
                  to={`/companies/${company.id}`}
                  className="inline-block text-sm font-semibold text-[#D4AF37] hover:underline"
                >
                  View Dashboard →
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Companies;
