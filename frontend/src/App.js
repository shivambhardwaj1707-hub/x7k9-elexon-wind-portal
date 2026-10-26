import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, CartesianGrid } from 'recharts';
import { Activity, AlertTriangle, TrendingUp, ShieldCheck } from 'lucide-react';

function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/wind/analytics')
      .then(res => {
        setData(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div style={{ padding: 40, color: '#fff', backgroundColor: '#0f172a', minHeight: '100vh' }}>Loading UK Grid Energy Data...</div>;
  if (!data) return <div style={{ padding: 40, color: '#ef4444', backgroundColor: '#0f172a', minHeight: '100vh' }}>Failed to load API data. Make sure backend is running.</div>;

  const { summary_metrics, series } = data;

  return (
    <div style={{ backgroundColor: '#0f172a', color: '#f8fafc', minHeight: '100vh', padding: '24px', fontFamily: 'sans-serif' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid #334155', paddingBottom: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#38bdf8' }}>UK Wind Generation & Day-Ahead Risk Portal</h1>
          <p style={{ color: '#94a3b8', fontSize: '14px' }}>Elexon BMRS Forecast vs Actual Analysis — January 2026</p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', backgroundColor: '#1e293b', padding: '8px 16px', borderRadius: '8px', border: '1px solid #334155' }}>
          <ShieldCheck color="#4ade80" size={18} />
          <span style={{ fontSize: '13px', color: '#cbd5e1' }}>Live Grid Stream Online</span>
        </div>
      </header>

      {/* KPI Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ backgroundColor: '#1e293b', padding: '16px', borderRadius: '12px', border: '1px solid #334155' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '12px', marginBottom: '8px' }}>
            <span>TOTAL ACTUAL GENERATION</span>
            <Activity size={16} color="#38bdf8" />
          </div>
          <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{summary_metrics.total_actual_mwh.toLocaleString()} MWh</div>
        </div>

        <div style={{ backgroundColor: '#1e293b', padding: '16px', borderRadius: '12px', border: '1px solid #334155' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '12px', marginBottom: '8px' }}>
            <span>TOTAL FORECASTED</span>
            <TrendingUp size={16} color="#818cf8" />
          </div>
          <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{summary_metrics.total_forecast_mwh.toLocaleString()} MWh</div>
        </div>

        <div style={{ backgroundColor: '#1e293b', padding: '16px', borderRadius: '12px', border: '1px solid #334155' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '12px', marginBottom: '8px' }}>
            <span>MEAN ABSOLUTE ERROR (MAE)</span>
            <AlertTriangle size={16} color="#facc15" />
          </div>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#facc15' }}>{summary_metrics.mae_mw} MW</div>
        </div>

        <div style={{ backgroundColor: '#1e293b', padding: '16px', borderRadius: '12px', border: '1px solid #334155' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '12px', marginBottom: '8px' }}>
            <span>MAPE ERROR %</span>
            <AlertTriangle size={16} color="#f87171" />
          </div>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#f87171' }}>{summary_metrics.mape_percent}%</div>
        </div>
      </div>

      {/* Main Chart: Actual vs Forecast Overlay */}
      <div style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px', color: '#e2e8f0' }}>Day-Ahead Wind Power: Actual vs Latest Forecast (30-min Intervals)</h3>
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={series.slice(0, 96)}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="startTime" tickFormatter={(str) => str.substring(11, 16)} stroke="#64748b" />
            <YAxis stroke="#64748b" label={{ value: 'Generation (MW)', angle: -90, position: 'insideLeft', fill: '#94a3b8' }} />
            <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
            <Legend />
            <Line type="monotone" dataKey="actual_generation_mw" name="Actual Wind (MW)" stroke="#38bdf8" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="forecast_generation_mw" name="Forecast Wind (MW)" stroke="#818cf8" strokeWidth={2} strokeDasharray="4 4" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Secondary Chart: Procurement Error Risk Delta */}
      <div style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px', color: '#e2e8f0' }}>Procurement Imbalance Delta (Actual - Forecast MW)</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={series.slice(0, 96)}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="startTime" tickFormatter={(str) => str.substring(11, 16)} stroke="#64748b" />
            <YAxis stroke="#64748b" />
            <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
            <Bar dataKey="error_mw" name="MW Imbalance" fill="#f59e0b" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default App;