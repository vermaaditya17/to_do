import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { Layers } from 'lucide-react';

export default function AnalyticsCharts({ token }) {
  const [period, setPeriod] = useState('daily');
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const res = await axios.get(`https://to-do-dmhr.onrender.com/api/analytics/${period}`, config);
        setData(res.data);
      } catch (err) { console.error(err); }
    };
    if (token) fetchAnalytics();
  }, [period, token]);

  return (
    <div className="bg-white border border-zinc-200 p-5 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.01)]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-purple-600 mb-0.5">
            <Layers size={11} /> Metrics Dashboard
          </div>
          <h3 className="text-base font-bold text-zinc-800 tracking-tight">Study Statistics</h3>
        </div>
        
        <div className="flex bg-zinc-100 p-1 rounded-xl border border-zinc-200/50">
          {['daily', 'monthly', 'yearly'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-all duration-300 ${
                period === p ? 'bg-white text-purple-700 shadow-sm' : 'text-zinc-400 hover:text-zinc-600'
              }`}
            >
              {p === 'daily' ? 'Day' : p === 'monthly' ? 'Month' : 'Year'}
            </button>
          ))}
        </div>
      </div>

      <div className="w-full h-56">
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-zinc-400 text-xs border border-dashed border-zinc-200 rounded-xl bg-zinc-50/50">
            No metrics parsed yet.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 5, left: -35, bottom: 0 }}>
              <defs>
                <linearGradient id="colorWave" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="label" stroke="#b1b1b8" fontSize={10} tickLine={false} axisLine={false} dy={5} />
              <YAxis stroke="#b1b1b8" fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} dx={-5} />
              <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E5E7EB', fontSize: '11px' }} />
              <Area type="monotone" dataKey="completed" stroke="#8B5CF6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorWave)" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}