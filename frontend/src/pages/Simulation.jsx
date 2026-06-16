import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend
} from 'recharts';
import api from '../services/api';

const Simulation = () => {
  const { id } = useParams();
  const [mode, setMode] = useState('deterministic');

  // ---------- All numeric inputs are stored as strings ----------
  const [form, setForm] = useState({
    initial_revenue_override: '',
    monthly_revenue_growth_pct: '10',
    salary_growth_pct: '2',
    cogs_pct_of_revenue: '40',
    marketing_pct_of_revenue: '10',
    gna_pct_of_revenue: '15',
    infrastructure_fixed: '500',
    currency_mix_usd_pct: '70',
    forex_premium_pct: '5',
    zesa_cost_per_month: '200',
    inflation_rate_pct: '10',
    payment_delay_days: '30',
  });

  const [capexList, setCapexList] = useState([]);
  const [hireList, setHireList] = useState([]);
  const [distributions, setDistributions] = useState([
    { name: 'monthly_revenue_growth_pct', type: 'uniform', params: ['5', '15'] },
    { name: 'salary_growth_pct', type: 'uniform', params: ['1', '4'] },
  ]);
  const [iterations, setIterations] = useState('200');   // string

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [suggesting, setSuggesting] = useState(false);
  const [error, setError] = useState('');
  const [scenarioName, setScenarioName] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Generic change handler – treats everything as a string
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const fetchSuggestions = async () => {
    setSuggesting(true);
    try {
      const res = await api.get(`/companies/${id}/simulate/suggest/`);
      const suggested = res.data.suggested_assumptions;
      setForm(prev => ({
        ...prev,
        monthly_revenue_growth_pct: suggested.monthly_revenue_growth_pct?.toString() ?? prev.monthly_revenue_growth_pct,
        salary_growth_pct: suggested.salary_growth_pct?.toString() ?? prev.salary_growth_pct,
        cogs_pct_of_revenue: suggested.cogs_pct_of_revenue?.toString() ?? prev.cogs_pct_of_revenue,
        marketing_pct_of_revenue: suggested.marketing_pct_of_revenue?.toString() ?? prev.marketing_pct_of_revenue,
        gna_pct_of_revenue: suggested.gna_pct_of_revenue?.toString() ?? prev.gna_pct_of_revenue,
        infrastructure_fixed: suggested.infrastructure_fixed?.toString() ?? prev.infrastructure_fixed,
        currency_mix_usd_pct: suggested.currency_mix_usd_pct?.toString() ?? prev.currency_mix_usd_pct,
        forex_premium_pct: suggested.forex_premium_pct?.toString() ?? prev.forex_premium_pct,
        zesa_cost_per_month: suggested.zesa_cost_per_month?.toString() ?? prev.zesa_cost_per_month,
        inflation_rate_pct: suggested.inflation_rate_pct?.toString() ?? prev.inflation_rate_pct,
        payment_delay_days: suggested.payment_delay_days?.toString() ?? prev.payment_delay_days,
      }));
      if (suggested.capex && Array.isArray(suggested.capex)) setCapexList(suggested.capex);
      if (suggested.new_hires && Array.isArray(suggested.new_hires)) setHireList(suggested.new_hires);
    } catch (err) {
      console.error('Failed to get suggestions', err);
      setError('Failed to get LLM suggestions. Make sure you have a completed funding application.');
    } finally {
      setSuggesting(false);
    }
  };

  // Helper: convert form strings to numbers, with fallback defaults
  const toNum = (val, fallback) => {
    const n = parseFloat(val);
    return isNaN(n) ? fallback : n;
  };

  const runSimulation = async () => {
    setLoading(true);
    setError('');
    setSaveSuccess(false);
    try {
      if (mode === 'deterministic') {
        const payload = {
          initial_revenue_override: form.initial_revenue_override || undefined,
          monthly_revenue_growth_pct: toNum(form.monthly_revenue_growth_pct, 10),
          salary_growth_pct: toNum(form.salary_growth_pct, 2),
          cogs_pct_of_revenue: toNum(form.cogs_pct_of_revenue, 40),
          marketing_pct_of_revenue: toNum(form.marketing_pct_of_revenue, 10),
          gna_pct_of_revenue: toNum(form.gna_pct_of_revenue, 15),
          infrastructure_fixed: toNum(form.infrastructure_fixed, 500),
          currency_mix_usd_pct: toNum(form.currency_mix_usd_pct, 70),
          forex_premium_pct: toNum(form.forex_premium_pct, 5),
          zesa_cost_per_month: toNum(form.zesa_cost_per_month, 200),
          inflation_rate_pct: toNum(form.inflation_rate_pct, 10),
          payment_delay_days: toNum(form.payment_delay_days, 30),
          capex: capexList,
          new_hires: hireList,
        };
        const res = await api.post(`/companies/${id}/simulate/`, payload);
        setResult({ type: 'deterministic', ...res.data });
      } else {
        const payload = {
          base_assumptions: {
            initial_revenue_override: form.initial_revenue_override || undefined,
            monthly_revenue_growth_pct: toNum(form.monthly_revenue_growth_pct, 10),
            salary_growth_pct: toNum(form.salary_growth_pct, 2),
            cogs_pct_of_revenue: toNum(form.cogs_pct_of_revenue, 40),
            marketing_pct_of_revenue: toNum(form.marketing_pct_of_revenue, 10),
            gna_pct_of_revenue: toNum(form.gna_pct_of_revenue, 15),
            infrastructure_fixed: toNum(form.infrastructure_fixed, 500),
            currency_mix_usd_pct: toNum(form.currency_mix_usd_pct, 70),
            forex_premium_pct: toNum(form.forex_premium_pct, 5),
            zesa_cost_per_month: toNum(form.zesa_cost_per_month, 200),
            inflation_rate_pct: toNum(form.inflation_rate_pct, 10),
            payment_delay_days: toNum(form.payment_delay_days, 30),
            capex: capexList,
            new_hires: hireList,
          },
          distributions: distributions.map(d => ({
            ...d,
            params: d.params.map(p => toNum(p, 0))
          })),
          iterations: toNum(iterations, 200),
        };
        const res = await api.post(`/companies/${id}/simulate/monte-carlo`, payload);
        setResult({ type: 'monte-carlo', ...res.data });
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Simulation failed');
    } finally {
      setLoading(false);
    }
  };

  const saveScenario = async () => {
    if (!result) return;
    try {
      await api.post(`/companies/${id}/scenarios/`, {
        name: scenarioName || 'Untitled Scenario',
        mode: mode,
        assumptions: { ...form, capex: capexList, new_hires: hireList },
        results: result
      });
      setSaveSuccess(true);
      setScenarioName('');
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setError('Failed to save scenario');
    }
  };

  // CapEx & Hire handlers (use string values locally)
  const addCapex = () => setCapexList([...capexList, { month: '1', amount: '0', useful_life: '36' }]);
  const updateCapex = (idx, field, value) => {
    const updated = [...capexList]; updated[idx][field] = value; setCapexList(updated);
  };
  const removeCapex = (idx) => setCapexList(capexList.filter((_, i) => i !== idx));

  const addHire = () => setHireList([...hireList, { month: '1', salary: '0' }]);
  const updateHire = (idx, field, value) => {
    const updated = [...hireList]; updated[idx][field] = value; setHireList(updated);
  };
  const removeHire = (idx) => setHireList(hireList.filter((_, i) => i !== idx));

  const addDist = () => setDistributions([...distributions, { name: '', type: 'uniform', params: ['0', '10'] }]);
  const updateDist = (idx, field, value) => {
    const updated = [...distributions]; updated[idx][field] = value; setDistributions(updated);
  };
  const removeDist = (idx) => setDistributions(distributions.filter((_, i) => i !== idx));
  const updateDistParam = (idx, paramIdx, val) => {
    const updated = [...distributions];
    updated[idx].params[paramIdx] = val;   // string
    setDistributions(updated);
  };

  // Styles
  const inputClass = "w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-gray-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] transition";
  const distInputClass = "w-28 px-2 py-2 rounded-lg bg-slate-800 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] transition";
  const selectClass = "px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm";

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0A1929] p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <Link to={`/companies/${id}`} className="inline-flex items-center text-sm text-[#D4AF37] hover:underline">
            ← Back to Dashboard
          </Link>
          <Link to={`/companies/${id}/scenarios`} className="text-sm bg-[#D4AF37]/10 text-[#D4AF37] px-4 py-2 rounded-xl font-semibold hover:bg-[#D4AF37]/20 transition">
            📊 Compare Scenarios
          </Link>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold text-[#0A1929] dark:text-white mb-6">Financial Simulation</h1>
          <p className="text-slate-600 dark:text-slate-400 mb-8">Project cash flow, runway, and investor returns.</p>

          <div className="flex gap-4 mb-8">
            <button onClick={() => setMode('deterministic')}
              className={`px-4 py-2 rounded-xl font-semibold transition ${mode === 'deterministic' ? 'bg-[#D4AF37] text-[#0A1929]' : 'bg-gray-200 dark:bg-gray-700 text-slate-600 dark:text-slate-300'}`}>Deterministic</button>
            <button onClick={() => setMode('monte-carlo')}
              className={`px-4 py-2 rounded-xl font-semibold transition ${mode === 'monte-carlo' ? 'bg-[#D4AF37] text-[#0A1929]' : 'bg-gray-200 dark:bg-gray-700 text-slate-600 dark:text-slate-300'}`}>Monte Carlo</button>
          </div>

          {mode === 'monte-carlo' && (
            <div className="bg-white dark:bg-[#0A1929] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 mb-8">
              <h2 className="text-lg font-semibold mb-4 text-[#0A1929] dark:text-white">Distributions</h2>
              <div className="space-y-4">
                {distributions.map((d, idx) => (
                  <div key={idx} className="flex gap-4 items-end flex-wrap">
                    <div><label className="block text-xs text-slate-500 mb-1">Field</label>
                      <select value={d.name} onChange={(e) => updateDist(idx, 'name', e.target.value)} className={selectClass}>
                        <option value="">Choose field</option>
                        <option value="monthly_revenue_growth_pct">Revenue Growth</option>
                        <option value="salary_growth_pct">Salary Growth</option>
                        <option value="cogs_pct_of_revenue">COGS %</option>
                        <option value="marketing_pct_of_revenue">Marketing %</option>
                        <option value="gna_pct_of_revenue">G&A %</option>
                      </select>
                    </div>
                    <div><label className="block text-xs text-slate-500 mb-1">Type</label>
                      <select value={d.type} onChange={(e) => updateDist(idx, 'type', e.target.value)} className={selectClass}>
                        <option value="uniform">Uniform</option>
                        <option value="normal">Normal</option>
                      </select>
                    </div>
                    <div><label className="block text-xs text-slate-500 mb-1">{d.type === 'uniform' ? 'Min' : 'Mean'}</label>
                      <input type="text" inputMode="decimal" value={d.params[0]} onChange={(e) => updateDistParam(idx, 0, e.target.value)} className={distInputClass} />
                    </div>
                    <div><label className="block text-xs text-slate-500 mb-1">{d.type === 'uniform' ? 'Max' : 'Std Dev'}</label>
                      <input type="text" inputMode="decimal" value={d.params[1]} onChange={(e) => updateDistParam(idx, 1, e.target.value)} className={distInputClass} />
                    </div>
                    <button onClick={() => removeDist(idx)} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 px-2 py-1 rounded-lg text-sm self-end mb-1">✕</button>
                  </div>
                ))}
                <button onClick={addDist} className="text-sm bg-[#D4AF37]/10 text-[#D4AF37] px-3 py-1 rounded-xl hover:bg-[#D4AF37]/20 transition">+ Add Distribution</button>
              </div>
              <div className="mt-6">
                <label className="block text-sm font-medium text-[#0A1929] dark:text-slate-300 mb-1">Iterations</label>
                <input type="text" inputMode="numeric" value={iterations} onChange={(e) => setIterations(e.target.value)} className={`${inputClass} w-32`} />
                <p className="text-xs text-slate-400 mt-1">More iterations = smoother results. Start with 200‑500.</p>
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Starting Point */}
            <div className="bg-white dark:bg-[#0A1929] border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
              <h2 className="text-lg font-semibold mb-4 text-[#0A1929] dark:text-white">Starting Point</h2>
              <p className="text-sm text-slate-500 mb-4">If the system cannot find revenue records, enter the current monthly revenue manually.</p>
              <label className="block text-sm font-medium text-[#0A1929] dark:text-slate-300 mb-1">Initial Monthly Revenue ($)</label>
              <input name="initial_revenue_override" value={form.initial_revenue_override} onChange={handleChange} className={inputClass} placeholder="Auto‑detected if blank" />
            </div>

            {/* Growth */}
            <div className="bg-white dark:bg-[#0A1929] border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
              <h2 className="text-lg font-semibold mb-4 text-[#0A1929] dark:text-white">Growth</h2>
              <div className="space-y-4">
                <SliderField label="Revenue Growth (% MoM)" name="monthly_revenue_growth_pct" value={form.monthly_revenue_growth_pct} onChange={handleChange} />
                <SliderField label="Salary Growth (% MoM)" name="salary_growth_pct" value={form.salary_growth_pct} onChange={handleChange} />
              </div>
            </div>

            {/* Expense Ratios */}
            <div className="bg-white dark:bg-[#0A1929] border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
              <h2 className="text-lg font-semibold mb-4 text-[#0A1929] dark:text-white">Expense Ratios (% of Revenue)</h2>
              <div className="space-y-4">
                <SliderField label="COGS" name="cogs_pct_of_revenue" value={form.cogs_pct_of_revenue} onChange={handleChange} />
                <SliderField label="Marketing" name="marketing_pct_of_revenue" value={form.marketing_pct_of_revenue} onChange={handleChange} />
                <SliderField label="G&A" name="gna_pct_of_revenue" value={form.gna_pct_of_revenue} onChange={handleChange} />
                <div>
                  <label className="block text-sm font-medium text-[#0A1929] dark:text-slate-300 mb-1">Fixed Infrastructure ($/mo)</label>
                  <input name="infrastructure_fixed" value={form.infrastructure_fixed} onChange={handleChange} className={inputClass} />
                </div>
              </div>
            </div>

            {/* Zimbabwe Adjustments */}
            <div className="bg-white dark:bg-[#0A1929] border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
              <h2 className="text-lg font-semibold mb-4 text-[#0A1929] dark:text-white">Zimbabwe Adjustments</h2>
              <div className="space-y-4">
                <SliderField label="Currency Mix (% USD)" name="currency_mix_usd_pct" value={form.currency_mix_usd_pct} onChange={handleChange} min={0} max={100} />
                <SliderField label="Forex Premium (%)" name="forex_premium_pct" value={form.forex_premium_pct} onChange={handleChange} />
                <div>
                  <label className="block text-sm font-medium text-[#0A1929] dark:text-slate-300 mb-1">ZESA / Generator ($/mo)</label>
                  <input name="zesa_cost_per_month" value={form.zesa_cost_per_month} onChange={handleChange} className={inputClass} />
                </div>
                <SliderField label="Inflation Rate (% p.a.)" name="inflation_rate_pct" value={form.inflation_rate_pct} onChange={handleChange} />
                <div>
                  <label className="block text-sm font-medium text-[#0A1929] dark:text-slate-300 mb-1">Payment Delay (days)</label>
                  <input name="payment_delay_days" value={form.payment_delay_days} onChange={handleChange} className={inputClass} />
                </div>
              </div>
            </div>

            {/* CapEx */}
            <div className="bg-white dark:bg-[#0A1929] border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-[#0A1929] dark:text-white">CapEx</h2>
                <button onClick={addCapex} className="text-sm bg-[#D4AF37]/10 text-[#D4AF37] px-3 py-1 rounded-xl hover:bg-[#D4AF37]/20 transition">+ Add Item</button>
              </div>
              {capexList.length === 0 && <p className="text-sm text-slate-500">No capital expenditures added yet.</p>}
              <div className="space-y-4">
                {capexList.map((item, idx) => (
                  <div key={idx} className="flex gap-2 items-end p-3 bg-[#F8FAFC] dark:bg-[#0a1422] rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="flex-1"><label className="text-xs text-slate-500">Month</label><input type="text" inputMode="numeric" value={item.month} onChange={(e) => updateCapex(idx, 'month', e.target.value)} className={`${inputClass} w-full`} /></div>
                    <div className="flex-1"><label className="text-xs text-slate-500">Amount ($)</label><input type="text" inputMode="decimal" value={item.amount} onChange={(e) => updateCapex(idx, 'amount', e.target.value)} className={`${inputClass} w-full`} /></div>
                    <div className="flex-1"><label className="text-xs text-slate-500">Useful Life (mo)</label><input type="text" inputMode="numeric" value={item.useful_life} onChange={(e) => updateCapex(idx, 'useful_life', e.target.value)} className={`${inputClass} w-full`} /></div>
                    <button onClick={() => removeCapex(idx)} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 px-2 py-1 rounded-lg text-sm">✕</button>
                  </div>
                ))}
              </div>
            </div>

            {/* Hiring Plan */}
            <div className="bg-white dark:bg-[#0A1929] border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-[#0A1929] dark:text-white">Hiring Plan</h2>
                <button onClick={addHire} className="text-sm bg-[#D4AF37]/10 text-[#D4AF37] px-3 py-1 rounded-xl hover:bg-[#D4AF37]/20 transition">+ Add Hire</button>
              </div>
              {hireList.length === 0 && <p className="text-sm text-slate-500">No new hires planned yet.</p>}
              <div className="space-y-4">
                {hireList.map((item, idx) => (
                  <div key={idx} className="flex gap-2 items-end p-3 bg-[#F8FAFC] dark:bg-[#0a1422] rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="flex-1"><label className="text-xs text-slate-500">Month</label><input type="text" inputMode="numeric" value={item.month} onChange={(e) => updateHire(idx, 'month', e.target.value)} className={`${inputClass} w-full`} /></div>
                    <div className="flex-1"><label className="text-xs text-slate-500">Salary ($/mo)</label><input type="text" inputMode="decimal" value={item.salary} onChange={(e) => updateHire(idx, 'salary', e.target.value)} className={`${inputClass} w-full`} /></div>
                    <button onClick={() => removeHire(idx)} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 px-2 py-1 rounded-lg text-sm">✕</button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-4 mb-8">
            <button onClick={fetchSuggestions} disabled={suggesting} className="px-6 py-3 border border-[#D4AF37] text-[#D4AF37] font-bold rounded-xl hover:bg-[#D4AF37] hover:text-[#0A1929] transition disabled:opacity-50">
              {suggesting ? 'Loading...' : '🤖 Suggest Assumptions'}
            </button>
            <button onClick={runSimulation} disabled={loading} className="px-8 py-3 bg-[#D4AF37] text-[#0A1929] font-bold rounded-xl hover:bg-[#c9a32b] transition shadow-lg disabled:opacity-50">
              {loading ? 'Running...' : 'Run Simulation'}
            </button>
          </div>

          {error && (
            <div className="mt-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">{error}</div>
          )}

          {result && (
            <div className="mt-10 space-y-8">
              {result.type === 'deterministic' ? (
                <>
                  <div className="grid md:grid-cols-4 gap-4">
                    <MetricCard label="Runway" value={`${result.runway_months} months`} />
                    <MetricCard label="Break‑even Month" value={result.break_even_month || 'Not reached'} />
                    <MetricCard label="Final Cash Balance" value={`$${result.final_cash_balance?.toLocaleString()}`} />
                    <MetricCard label="IRR" value={result.irr ? `${result.irr}%` : 'N/A'} />
                  </div>
                  <CashChart data={result.projections} />
                  <RevExpChart data={result.projections} />
                </>
              ) : (
                <>
                  <div className="grid md:grid-cols-3 gap-4">
                    <MetricCard label="Runway (P50)" value={`${result.runway_percentiles?.p50} months`} />
                    <MetricCard label="Break‑even Probability" value={`${result.breakeven_probability}%`} />
                    <MetricCard label="Cash Positive Probability" value={`${result.cash_positive_probability}%`} />
                  </div>
                  <div className="bg-white dark:bg-[#0A1929] border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
                    <h2 className="text-lg font-semibold mb-4 text-[#0A1929] dark:text-white">Cash Balance Fan Chart</h2>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={result.cash_balance_bands}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" /><XAxis dataKey="month" stroke="#94a3b8" /><YAxis stroke="#94a3b8" /><Tooltip />
                        <Line dataKey="p10" stroke="#00A896" strokeWidth={1} dot={false} name="10th %ile" />
                        <Line dataKey="p50" stroke="#D4AF37" strokeWidth={2} dot={false} name="50th %ile (Median)" />
                        <Line dataKey="p90" stroke="#D4AF37" strokeWidth={1} dot={false} name="90th %ile" strokeDasharray="5 5" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="bg-white dark:bg-[#0A1929] border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
                    <h2 className="text-lg font-semibold mb-4 text-[#0A1929] dark:text-white">Revenue Fan Chart</h2>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={result.revenue_bands}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" /><XAxis dataKey="month" stroke="#94a3b8" /><YAxis stroke="#94a3b8" /><Tooltip />
                        <Line dataKey="p10" stroke="#00A896" strokeWidth={1} dot={false} name="10th %ile" />
                        <Line dataKey="p50" stroke="#D4AF37" strokeWidth={2} dot={false} name="50th %ile (Median)" />
                        <Line dataKey="p90" stroke="#D4AF37" strokeWidth={1} dot={false} name="90th %ile" strokeDasharray="5 5" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </>
              )}

              {/* Save Scenario */}
              <div className="bg-white dark:bg-[#0A1929] border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
                <h3 className="text-lg font-semibold mb-4 text-[#0A1929] dark:text-white">Save Scenario</h3>
                {saveSuccess && (
                  <div className="mb-4 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 text-sm">
                    Scenario saved successfully! View it in the comparison page.
                  </div>
                )}
                <div className="flex gap-4 items-end">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-[#0A1929] dark:text-slate-300 mb-1">Scenario Name</label>
                    <input type="text" value={scenarioName} onChange={(e) => setScenarioName(e.target.value)} className={inputClass} placeholder="e.g., Optimistic Growth" />
                  </div>
                  <button onClick={saveScenario} className="px-6 py-2 bg-[#D4AF37] text-[#0A1929] font-bold rounded-xl hover:bg-[#c9a32b] transition shadow-lg">Save</button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

// Helper components (unchanged, but SliderField will now receive string values and treat them as numbers visually)
const SliderField = ({ label, name, value, onChange, min = 0, max = 100, step = 0.1 }) => {
  // value is a string, but we display it directly as the label
  const numVal = parseFloat(value) || 0;
  return (
    <div>
      <label className="block text-sm font-medium text-[#0A1929] dark:text-slate-300 mb-1">{label}: {value}%</label>
      <input type="range" min={min} max={max} step={step} name={name} value={numVal} onChange={(e) => onChange({ target: { name, value: e.target.value } })} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-[#D4AF37]" />
    </div>
  );
};

const MetricCard = ({ label, value }) => (
  <div className="bg-white dark:bg-[#0A1929] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-center">
    <p className="text-sm text-slate-500">{label}</p>
    <p className="text-2xl font-bold text-[#0A1929] dark:text-white mt-1">{value}</p>
  </div>
);

const CashChart = ({ data }) => (
  <div className="bg-white dark:bg-[#0A1929] border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
    <h2 className="text-lg font-semibold mb-4 text-[#0A1929] dark:text-white">Cash Balance</h2>
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}><CartesianGrid strokeDasharray="3 3" stroke="#334155" /><XAxis dataKey="month" stroke="#94a3b8" /><YAxis stroke="#94a3b8" /><Tooltip /><Line type="monotone" dataKey="cash_balance" stroke="#D4AF37" strokeWidth={2} dot={false} /></LineChart>
    </ResponsiveContainer>
  </div>
);

const RevExpChart = ({ data }) => (
  <div className="bg-white dark:bg-[#0A1929] border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
    <h2 className="text-lg font-semibold mb-4 text-[#0A1929] dark:text-white">Revenue & Expenses</h2>
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}><CartesianGrid strokeDasharray="3 3" stroke="#334155" /><XAxis dataKey="month" stroke="#94a3b8" /><YAxis stroke="#94a3b8" /><Tooltip /><Legend /><Bar dataKey="revenue" fill="#00A896" name="Revenue" /><Bar dataKey="total_expenses" fill="#D4AF37" name="Expenses" /></BarChart>
    </ResponsiveContainer>
  </div>
);

export default Simulation;
