import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const DOC_TYPES = [
  { value: 'pitch_deck', label: 'Pitch Deck (PDF)' },
  { value: 'financial_model', label: 'Financial Model (Excel)' },
  { value: 'ecocash_statement', label: 'EcoCash Statement (PDF/Excel)' },
  { value: 'tax_return', label: 'Tax Return (PDF)' },
  { value: 'other', label: 'Other' },
];

const Upload = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [companyId, setCompanyId] = useState(null);
  const [title, setTitle] = useState('');
  const [documentType, setDocumentType] = useState('pitch_deck');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  // Get the business owner's first company
  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const res = await api.get('/companies/');
        if (res.data.length > 0) setCompanyId(res.data[0].id);
      } catch (err) {
        console.error(err);
      }
    };
    if (user?.role === 'business_owner') fetchCompany();
  }, [user]);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      const ext = selected.name.split('.').pop().toLowerCase();
      if (!['pdf', 'xlsx', 'xls'].includes(ext)) {
        setError('Only PDF and Excel files are supported.');
        return;
      }
      setFile(selected);
      setError('');
    }
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) {
      const ext = dropped.name.split('.').pop().toLowerCase();
      if (!['pdf', 'xlsx', 'xls'].includes(ext)) {
        setError('Only PDF and Excel files are supported.');
        return;
      }
      setFile(dropped);
      setError('');
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!companyId) {
      setError('No company found. Create a company first.');
      return;
    }
    if (!file) {
      setError('Please select a file.');
      return;
    }
    setUploading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('title', title || file.name);
      formData.append('document_type', documentType);
      formData.append('file', file);

      await api.post(`/companies/${companyId}/documents/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.detail || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  if (user?.role !== 'business_owner') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] dark:bg-[#0A1929] p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#0A1929] dark:text-white mb-4">Access Denied</h2>
          <p className="text-slate-600 dark:text-slate-400">Only business owners can upload documents.</p>
          <Link to="/dashboard" className="mt-4 inline-block text-[#D4AF37] hover:underline">Back to Dashboard</Link>
        </div>
      </div>
    );
  }

  if (!companyId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] dark:bg-[#0A1929] p-6">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">🏢</div>
          <h2 className="text-2xl font-bold text-[#0A1929] dark:text-white mb-4">No Company Found</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">You need to create a company before you can upload documents.</p>
          <Link to="/companies/new" className="inline-block bg-[#D4AF37] text-[#0A1929] font-bold px-6 py-3 rounded-xl hover:bg-[#c9a32b] transition shadow-lg">
            Create Company
          </Link>
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
          <h1 className="text-2xl font-bold text-[#0A1929] dark:text-white mb-6">Upload Document</h1>

          {success ? (
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center py-8">
              <div className="text-6xl mb-4">✅</div>
              <h2 className="text-xl font-semibold text-[#0A1929] dark:text-white mb-2">Upload Successful!</h2>
              <p className="text-slate-600 dark:text-slate-400 mb-6">Your document is being processed. The AI will extract data and update the dashboard shortly.</p>
              <Link
                to={`/companies/${companyId}`}
                className="inline-block bg-[#D4AF37] text-[#0A1929] font-bold px-6 py-3 rounded-xl hover:bg-[#c9a32b] transition shadow-lg"
              >
                View Dashboard
              </Link>
              <button
                onClick={() => { setSuccess(false); setFile(null); setTitle(''); }}
                className="block mx-auto mt-4 text-sm text-[#D4AF37] hover:underline"
              >
                Upload Another Document
              </button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
                  {error}
                </div>
              )}

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-[#0A1929] dark:text-slate-300 mb-1">Document Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#F8FAFC] dark:bg-[#0a1422] border border-slate-200 dark:border-slate-700 text-[#0A1929] dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] transition"
                  placeholder="e.g., Q1 2025 Cash Flow"
                />
              </div>

              {/* Document Type */}
              <div>
                <label className="block text-sm font-medium text-[#0A1929] dark:text-slate-300 mb-1">Document Type</label>
                <select
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#F8FAFC] dark:bg-[#0a1422] border border-slate-200 dark:border-slate-700 text-[#0A1929] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37] transition"
                >
                  {DOC_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              {/* Drag & Drop Zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-xl p-8 text-center transition ${
                  dragOver ? 'border-[#D4AF37] bg-[#D4AF37]/5' : 'border-slate-300 dark:border-slate-600'
                }`}
              >
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.xlsx,.xls"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                {file ? (
                  <div className="pointer-events-none">
                    <div className="text-4xl mb-2">📄</div>
                    <p className="font-medium text-[#0A1929] dark:text-white">{file.name}</p>
                    <p className="text-sm text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                ) : (
                  <div className="pointer-events-none">
                    <div className="text-4xl mb-2">📁</div>
                    <p className="text-slate-600 dark:text-slate-400">Drag & drop a file here, or click to browse</p>
                    <p className="text-xs text-slate-400 mt-1">PDF, Excel (.xlsx, .xls) up to 10 MB</p>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={uploading || !file}
                className="w-full py-3 bg-[#D4AF37] text-[#0A1929] font-bold rounded-xl hover:bg-[#c9a32b] transition shadow-lg disabled:opacity-50"
              >
                {uploading ? 'Uploading...' : 'Upload Document'}
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Upload;
