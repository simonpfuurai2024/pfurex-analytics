import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { saveAs } from 'file-saver';
import api from '../services/api';

const ScenarioComparison = () => {
  const { id } = useParams();
  const [scenarios, setScenarios] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchScenarios();
  }, [id]);

  const fetchScenarios = async () => {
    try {
      const res = await api.get(`/companies/${id}/scenarios/`);
      setScenarios(res.data);
    } catch (err) {
      setError('Failed to load scenarios');
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (scenarioId) => {
    setSelected(prev =>
      prev.includes(scenarioId) ? prev.filter(s => s !== scenarioId) : [...prev, scenarioId]
    );
  };

  const deleteScenario = async (scenarioId) => {
    await api.delete(`/companies/${id}/scenarios/${scenarioId}`);
    fetchScenarios();
    setSelected(prev => prev.filter(s => s !== scenarioId));
  };

  const downloadScenario = async (scenarioId, name) => {
    try {
      const res = await api.get(`/companies/${id}/scenarios/${scenarioId}/export/`, { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, `${name.replace(/\s+/g, '_')}.xlsx`);
    } catch (err) {
      console.error('Download failed', err);
    }
  };

  // Prepare comparison data
  const selectedScenarios = scenarios.filter(s => selected.includes(s.id));

  // For cash balance overlay, we need to combine data
  const overlayData = [];
  if (selectedScenarios.length > 0) {
    const firstScenario = selectedScenarios[0];
    const projections = firstScenario.results?.projections || [];
    for (let i = 0; i < projections.length; i++) {
      const point = { month: projections[i].month };
      selectedScenarios.forEach(sc => {
        const proj = sc.results?.projections?.[i];
        point[sc.name] = proj?.cash_balance || 0;
      });
      overlayData.push(point);
    }
    // Monte Carlo: use cash_balance_bands instead
    if (projections.length === 0) {
      const bands = firstScenario.results?.cash_balance_bands || [];
      for (let i = 0; i < bands.length; i++) {
        const point = { month: bands[i].month };
        selectedScenarios.forEach(sc => {
          const band = sc.results?.cash_balance_bands?.[i];
          point[sc.name] = band?.p50 || 0;
        });
        overlayData.push(point);
      }
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0A1929] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Dual back buttons */}
        <div className="flex gap-4 mb-6">
          <Link to="/dashboard" className="inline-flex items-center text-sm text-[#D4AF37] hover:underline">
            ← Main Dashboard
          </Link>
          <Link to={`/companies/${id}`} className="inline-flex items-center text-sm text-[#D4AF37] hover:underline">
            ← Company Dashboard
          </Link>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-[#0A1929] dark:text-white">Scenario Comparison</h1>
              <p className="text-slate-600 dark:text-slate-400 mt-2">
                Select saved scenarios to compare side‑by‑side.
              </p>
            </div>
            <Link
              to={`/companies/${id}/simulate`}
              className="px-5 py-3 bg-[#D4AF37] text-[#0A1929] font-bold rounded-xl hover:bg-[#c9a32b] transition shadow-lg"
            >
              + New Simulation
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#D4AF37]"></div>
            </div>
          ) : scenarios.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-[#0A1929] rounded-2xl border border-slate-200 dark:border-slate-800">
              <p className="text-slate-500 text-lg">No saved scenarios yet.</p>
              <p className="text-slate-400 text-sm mt-2">Run a simulation and save it to compare here.</p>
              <Link to={`/companies/${id}/simulate`} className="mt-4 inline-block text-[#D4AF37] hover:underline">
                Go to Simulation →
              </Link>
            </div>
          ) : (
            <>
              {/* Scenario Selection */}
              <div className="grid md:grid-cols-3 gap-4 mb-8">
                {scenarios.map(sc => (
                  <motion.div
                    key={sc.id}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => toggleSelect(sc.id)}
                    className={`cursor-pointer rounded-2xl p-5 border transition ${
                      selected.includes(sc.id)
                        ? 'border-[#D4AF37] bg-[#D4AF37]/5'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0A1929]'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-[#0A1929] dark:text-white">{sc.name}</h3>
                        <p className="text-xs text-slate-500 mt-1">{sc.mode} · {new Date(sc.created_at).toLocaleDateString()}</p>
                        {sc.notes && <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">{sc.notes}</p>}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); downloadScenario(sc.id, sc.name); }}
                          className="text-blue-400 hover:text-blue-600 text-sm"
                          title="Download Excel"
                        >
                          📥
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteScenario(sc.id); }}
                          className="text-red-400 hover:text-red-600 text-sm"
                          title="Delete"
                        >
                          🗑
                        </button>
                      </div>
                    </div>
                    {sc.mode === 'deterministic' ? (
                      <div className="grid grid-cols-2 gap-2 mt-4 text-sm">
                        <Metric label="Runway" value={`${sc.results?.runway_months} months`} />
                        <Metric label="Final Cash" value={`$${sc.results?.final_cash_balance?.toLocaleString()}`} />
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2 mt-4 text-sm">
                        <Metric label="Runway (P50)" value={`${sc.results?.runway_percentiles?.p50} months`} />
                        <Metric label="Break‑even Prob" value={`${sc.results?.breakeven_probability}%`} />
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Comparison Section */}
              {selected.length >= 2 && (
                <>
                  {/* Metrics Table */}
                  <div className="bg-white dark:bg-[#0A1929] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 mb-8">
                    <h2 className="text-lg font-semibold mb-4 text-[#0A1929] dark:text-white">Metrics Comparison</h2>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-slate-200 dark:border-slate-700">
                            <th className="text-left py-2 text-slate-500">Metric</th>
                            {selectedScenarios.map(s => (
                              <th key={s.id} className="text-right py-2 text-slate-500">{s.name}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {selectedScenarios[0]?.mode === 'deterministic' ? (
                            <>
                              <TableRow label="Runway" selected={selectedScenarios} accessor={(s) => `${s.results?.runway_months} months`} />
                              <TableRow label="Break‑even Month" selected={selectedScenarios} accessor={(s) => s.results?.break_even_month || 'N/A'} />
                              <TableRow label="Final Cash Balance" selected={selectedScenarios} accessor={(s) => `$${s.results?.final_cash_balance?.toLocaleString()}`} />
                              <TableRow label="IRR" selected={selectedScenarios} accessor={(s) => s.results?.irr ? `${s.results.irr}%` : 'N/A'} />
                            </>
                          ) : (
                            <>
                              <TableRow label="Runway (P50)" selected={selectedScenarios} accessor={(s) => `${s.results?.runway_percentiles?.p50} months`} />
                              <TableRow label="Break‑even Prob" selected={selectedScenarios} accessor={(s) => `${s.results?.breakeven_probability}%`} />
                              <TableRow label="Cash Positive Prob" selected={selectedScenarios} accessor={(s) => `${s.results?.cash_positive_probability}%`} />
                              <TableRow label="Final Cash (P50)" selected={selectedScenarios} accessor={(s) => `$${s.results?.final_cash_percentiles?.p50?.toLocaleString()}`} />
                            </>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Overlay Cash Balance Chart */}
                  <div className="bg-white dark:bg-[#0A1929] border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
                    <h2 className="text-lg font-semibold mb-4 text-[#0A1929] dark:text-white">Cash Balance Overlay</h2>
                    {overlayData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={400}>
                        <LineChart data={overlayData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                          <XAxis dataKey="month" stroke="#94a3b8" />
                          <YAxis stroke="#94a3b8" />
                          <Tooltip />
                          <Legend />
                          {selectedScenarios.map((s, idx) => (
                            <Line
                              key={s.id}
                              type="monotone"
                              dataKey={s.name}
                              stroke={['#D4AF37', '#00A896', '#ff6b6b', '#4ecdc4', '#45b7d1'][idx % 5]}
                              strokeWidth={2}
                              dot={false}
                            />
                          ))}
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-slate-500 text-center py-10">Chart data not available for the selected scenarios.</p>
                    )}
                  </div>
                </>
              )}

              {selected.length === 1 && (
                <div className="text-center py-10 text-slate-500">
                  Select at least one more scenario to compare.
                </div>
              )}
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
};

const Metric = ({ label, value }) => (
  <div>
    <p className="text-xs text-slate-400">{label}</p>
    <p className="font-semibold text-[#0A1929] dark:text-white">{value}</p>
  </div>
);

const TableRow = ({ label, selected, accessor }) => (
  <tr className="border-b border-slate-100 dark:border-slate-800">
    <td className="py-2 text-slate-500">{label}</td>
    {selected.map(s => (
      <td key={s.id} className="py-2 text-right text-[#0A1929] dark:text-white font-medium">{accessor(s)}</td>
    ))}
  </tr>
);

export default ScenarioComparison;
