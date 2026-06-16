import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [companies, setCompanies] = useState([]);

  // Fetch companies to know if the business owner already has one
  useEffect(() => {
    if (user?.role === 'business_owner') {
      api.get('/companies/').then(res => setCompanies(res.data)).catch(() => {});
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { icon: '📊', label: 'Dashboard', href: '/dashboard', roles: ['business_owner', 'investor', 'admin'] },
    { icon: '🏢', label: 'Companies', href: '/companies', roles: ['business_owner', 'investor', 'admin'] },
    { icon: '📝', label: 'My Application', href: '/application', roles: ['business_owner'] },
    { icon: '📤', label: 'Upload Documents', href: '/upload', roles: ['business_owner', 'admin'] },
    { icon: '👥', label: 'Users', href: '/admin/users', roles: ['admin'] },
  ];

  const filteredNav = navItems.filter(item => item.roles.includes(user?.role));

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0A1929] flex">
      {/* Sidebar (desktop) */}
      <motion.aside
        animate={{ width: sidebarOpen ? 260 : 0, opacity: sidebarOpen ? 1 : 0 }}
        className="hidden md:flex flex-col bg-white dark:bg-[#0A1929] border-r border-slate-200 dark:border-slate-800 h-screen sticky top-0 z-40 overflow-hidden"
      >
        <div className="p-6 flex items-center space-x-3">
          <img src="/pfurex-analytics-log.png" alt="Pfurex" className="h-8 w-auto dark:invert" />
          {sidebarOpen && <span className="text-lg font-bold text-[#0A1929] dark:text-white">Pfurex</span>}
        </div>
        <nav className="flex-1 px-4 space-y-1">
          {filteredNav.map((item, idx) => (
            <Link
              key={idx}
              to={item.href}
              className="flex items-center space-x-3 px-4 py-3 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-[#D4AF37]/10 hover:text-[#D4AF37] transition"
            >
              <span className="text-xl">{item.icon}</span>
              {sidebarOpen && <span className="font-medium">{item.label}</span>}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 w-full px-4 py-3 rounded-xl text-red-500 hover:bg-red-500/10 transition"
          >
            <span className="text-xl">🚪</span>
            {sidebarOpen && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="bg-white dark:bg-[#0A1929] border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden md:block text-slate-600 dark:text-slate-400 hover:text-[#D4AF37] transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-slate-600 dark:text-slate-400 hover:text-[#D4AF37] transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-xl font-semibold text-[#0A1929] dark:text-white hidden md:block">Dashboard</h1>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-medium text-slate-800 dark:text-white">{user?.email}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">{user?.role?.replace('_', ' ')}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#00A896] flex items-center justify-center text-white font-bold text-lg">
              {user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
          </div>
        </header>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, x: -300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -300 }}
              className="fixed inset-0 z-50 bg-[#0A1929] p-6 md:hidden"
            >
              <div className="flex justify-between items-center mb-10">
                <img src="/pfurex-analytics-log.png" alt="Pfurex" className="h-8 dark:invert" />
                <button onClick={() => setMobileMenuOpen(false)} className="text-white text-2xl">✕</button>
              </div>
              <nav className="space-y-4">
                {filteredNav.map((item, idx) => (
                  <Link
                    key={idx}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center space-x-4 px-4 py-3 rounded-xl text-white hover:bg-[#D4AF37]/10 transition text-lg"
                  >
                    <span className="text-2xl">{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                ))}
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-4 w-full px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition text-lg"
                >
                  <span className="text-2xl">🚪</span>
                  <span>Logout</span>
                </button>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content Area */}
        <main className="flex-1 p-6 overflow-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Welcome */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-[#0A1929] dark:text-white">
                Welcome back, {user?.email?.split('@')[0] || 'User'}
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mt-2">
                {user?.role === 'business_owner' && 'Track your funding application and upload financial documents.'}
                {user?.role === 'investor' && 'Review company valuations, risk scores, and investment opportunities.'}
                {user?.role === 'admin' && 'Manage users, companies, and system settings.'}
              </p>
            </div>

            {/* Business Owner: No Company Yet? */}
            {user?.role === 'business_owner' && companies.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-2xl p-6 mb-8"
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-[#0A1929] dark:text-white">No company yet</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Create your company to start the funding application process.</p>
                  </div>
                  <Link
                    to="/companies/new"
                    className="bg-[#D4AF37] text-[#0A1929] font-bold px-5 py-3 rounded-xl hover:bg-[#c9a32b] transition shadow-lg"
                  >
                    Create Company
                  </Link>
                </div>
              </motion.div>
            )}

            {/* Quick Stats / Cards */}
            <div className="grid md:grid-cols-3 gap-6 mb-10">
              {user?.role === 'business_owner' && (
                <>
                  <DashboardCard title="My Company" value={companies.length > 0 ? 'View Profile' : 'Create One'} icon="🏢" link={companies.length > 0 ? `/companies/${companies[0].id}` : '/companies/new'} />
                  <DashboardCard title="Funding Application" value="Submit / Edit" icon="📝" link="/application" />
                  <DashboardCard title="Documents" value="Upload Files" icon="📄" link="/upload" />
                </>
              )}
              {user?.role === 'investor' && (
                <>
                  <DashboardCard title="Companies" value="Browse" icon="🏢" link="/companies" />
                  <DashboardCard title="Latest Deals" value="View" icon="💰" link="/deals" />
                  <DashboardCard title="Reports" value="Export" icon="📈" link="/reports" />
                </>
              )}
              {user?.role === 'admin' && (
                <>
                  <DashboardCard title="Users" value="Manage" icon="👥" link="/admin/users" />
                  <DashboardCard title="Companies" value="All" icon="🏢" link="/companies" />
                  <DashboardCard title="Settings" value="Configure" icon="⚙️" link="/admin/settings" />
                </>
              )}
            </div>

            {/* Recent Activity Placeholder */}
            <div className="bg-white dark:bg-[#0A1929] border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-4 text-[#0A1929] dark:text-white">Recent Activity</h3>
              <p className="text-slate-500 dark:text-slate-400">
                Your activity feed will appear here once you start using the platform.
              </p>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

const DashboardCard = ({ title, value, icon, link }) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    className="bg-white dark:bg-[#0A1929] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition"
  >
    <div className="flex items-center justify-between mb-4">
      <span className="text-3xl">{icon}</span>
      <Link to={link} className="text-sm text-[#D4AF37] hover:underline">View</Link>
    </div>
    <h3 className="text-lg font-semibold text-[#0A1929] dark:text-white">{title}</h3>
    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{value}</p>
  </motion.div>
);

export default Dashboard;
