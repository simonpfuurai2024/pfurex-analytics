import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const AdminUsers = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [newUser, setNewUser] = useState({ email: '', password: '', full_name: '', role: 'investor' });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/users');
      setUsers(res.data);
    } catch (err) {
      setError('Failed to load users');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (userId, currentActive) => {
    try {
      await api.put(`/admin/users/${userId}`, { is_active: !currentActive });
      // Refresh the list
      fetchUsers();
    } catch (err) {
      setError('Failed to update user');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    setError('');
    try {
      await api.post('/admin/users', newUser);
      setShowForm(false);
      setNewUser({ email: '', password: '', full_name: '', role: 'investor' });
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.detail || 'Creation failed');
    } finally {
      setCreating(false);
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] dark:bg-[#0A1929] p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#0A1929] dark:text-white mb-4">Access Denied</h2>
          <p className="text-slate-600 dark:text-slate-400">Only admins can manage users.</p>
          <Link to="/dashboard" className="mt-4 inline-block text-[#D4AF37] hover:underline">Back to Dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0A1929] p-6">
      <div className="max-w-5xl mx-auto">
        <Link to="/dashboard" className="inline-flex items-center text-sm text-[#D4AF37] hover:underline mb-6">
          ← Back to Dashboard
        </Link>

        <div className="flex items-center justify-between mb-8">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl font-bold text-[#0A1929] dark:text-white">User Management</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">Manage all platform users</p>
          </motion.div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-5 py-3 bg-[#D4AF37] text-[#0A1929] font-bold rounded-xl hover:bg-[#c9a32b] transition shadow-lg"
          >
            {showForm ? 'Cancel' : '+ Add User'}
          </button>
        </div>

        {/* Create User Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8 overflow-hidden"
            >
              <form onSubmit={handleCreate} className="bg-white dark:bg-[#0A1929] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-lg">
                <h3 className="text-lg font-semibold mb-4 text-[#0A1929] dark:text-white">Create New User</h3>
                {error && (
                  <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
                    {error}
                  </div>
                )}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#0A1929] dark:text-slate-300 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={newUser.full_name}
                      onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
                      required
                      className="w-full px-4 py-3 rounded-xl bg-[#F8FAFC] dark:bg-[#0a1422] border border-slate-200 dark:border-slate-700 text-[#0A1929] dark:text-white"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#0A1929] dark:text-slate-300 mb-1">Email</label>
                    <input
                      type="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                      required
                      className="w-full px-4 py-3 rounded-xl bg-[#F8FAFC] dark:bg-[#0a1422] border border-slate-200 dark:border-slate-700 text-[#0A1929] dark:text-white"
                      placeholder="user@example.co.zw"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#0A1929] dark:text-slate-300 mb-1">Password</label>
                    <input
                      type="password"
                      value={newUser.password}
                      onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                      required
                      className="w-full px-4 py-3 rounded-xl bg-[#F8FAFC] dark:bg-[#0a1422] border border-slate-200 dark:border-slate-700 text-[#0A1929] dark:text-white"
                      placeholder="••••••••"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#0A1929] dark:text-slate-300 mb-1">Role</label>
                    <select
                      value={newUser.role}
                      onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-[#F8FAFC] dark:bg-[#0a1422] border border-slate-200 dark:border-slate-700 text-[#0A1929] dark:text-white"
                    >
                      <option value="investor">Investor</option>
                      <option value="business_owner">Business Owner</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={creating}
                  className="mt-4 px-6 py-3 bg-[#00A896] text-white font-bold rounded-xl hover:bg-[#008f7a] transition shadow-lg disabled:opacity-50"
                >
                  {creating ? 'Creating...' : 'Create User'}
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Users Table */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#D4AF37]"></div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white dark:bg-[#0A1929] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#F8FAFC] dark:bg-[#0a1422] border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="text-left py-3 px-4 text-slate-500 font-medium">Name</th>
                    <th className="text-left py-3 px-4 text-slate-500 font-medium">Email</th>
                    <th className="text-left py-3 px-4 text-slate-500 font-medium">Role</th>
                    <th className="text-left py-3 px-4 text-slate-500 font-medium">Status</th>
                    <th className="text-right py-3 px-4 text-slate-500 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b border-slate-100 dark:border-slate-800 last:border-0">
                      <td className="py-3 px-4 text-[#0A1929] dark:text-white font-medium">{u.full_name}</td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{u.email}</td>
                      <td className="py-3 px-4">
                        <span className="text-xs font-semibold px-2 py-1 rounded-full bg-[#D4AF37]/10 text-[#D4AF37] capitalize">
                          {u.role.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                          u.is_active ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                          'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                          {u.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => toggleActive(u.id, u.is_active)}
                          className={`text-xs font-semibold px-3 py-1 rounded-full transition ${
                            u.is_active
                              ? 'bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400'
                              : 'bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400'
                          }`}
                        >
                          {u.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan="5" className="py-10 text-center text-slate-500">No users found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
