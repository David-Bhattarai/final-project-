
import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { fetchMoodHistory } from '../services/api';

const defaultMoodHistory = [
  { day: 'Mon', score: 65, label: 'Stable' },
  { day: 'Tue', score: 40, label: 'Stressed' },
  { day: 'Wed', score: 85, label: 'Happy' },
  { day: 'Thu', score: 70, label: 'Calm' },
  { day: 'Fri', score: 60, label: 'Tired' },
  { day: 'Sat', score: 90, label: 'Excellent' },
  { day: 'Sun', score: 88, label: 'Relaxed' },
];

const stressData = [
  { name: 'Work', value: 45 },
  { name: 'Health', value: 20 },
  { name: 'Finance', value: 15 },
  { name: 'Social', value: 20 },
];

const Dashboard: React.FC = () => {
  const [moodData, setMoodData] = useState(defaultMoodHistory);

  useEffect(() => {
    const loadData = async () => {
      const history = await fetchMoodHistory();
      if (history && history.length > 0) {
        setMoodData(history);
      }
    };
    loadData();
  }, []);

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Good morning, Alex</h1>
          <p className="text-slate-500">Your wellness dashboard is synced with MindCare Backend.</p>
        </div>
        <div className="flex items-center space-x-3 bg-white px-6 py-4 rounded-2xl border border-slate-100 shadow-sm">
          <div className="text-right">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Daily Wellness Score</p>
            <p className="text-2xl font-bold text-indigo-600">84/100</p>
          </div>
          <div className="w-12 h-12 rounded-full border-4 border-indigo-100 flex items-center justify-center">
            <i className="fas fa-trophy text-indigo-500"></i>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Mood Trend Chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-slate-900">Live Mood History</h2>
            <select className="bg-slate-50 border-none rounded-lg text-sm font-medium text-slate-500 px-3 py-1 outline-none">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={moodData}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                <YAxis hide domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                  labelStyle={{ fontWeight: 'bold' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#4f46e5" 
                  strokeWidth={4} 
                  fillOpacity={1} 
                  fill="url(#colorScore)" 
                  animationDuration={2000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Stress Distribution */}
        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 mb-8">Stress Sources</h2>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stressData} layout="vertical">
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} width={70} />
                <Tooltip 
                   cursor={{fill: 'transparent'}}
                   contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="value" radius={[0, 10, 10, 0]} barSize={20}>
                  {stressData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#6366f1', '#10b981', '#f59e0b', '#ef4444'][index % 4]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
              <span className="text-sm font-medium text-slate-600">Avg. Heart Rate</span>
              <span className="text-sm font-bold text-slate-900">72 bpm</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
              <span className="text-sm font-medium text-slate-600">Sleep Quality</span>
              <span className="text-sm font-bold text-emerald-600">Good</span>
            </div>
          </div>
        </div>
      </div>

      {/* Suggested Activities */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 p-8 rounded-[32px] text-white shadow-lg shadow-indigo-200">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-6 text-xl">
             <i className="fas fa-feather"></i>
          </div>
          <h3 className="text-xl font-bold mb-2">Morning Journal</h3>
          <p className="text-indigo-100 text-sm mb-6">Write down 3 things you are grateful for today.</p>
          <button className="bg-white text-indigo-600 font-bold px-6 py-2 rounded-xl text-sm">Start Journal</button>
        </div>
        
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-8 rounded-[32px] text-white shadow-lg shadow-emerald-200">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-6 text-xl">
             <i className="fas fa-spa"></i>
          </div>
          <h3 className="text-xl font-bold mb-2">Deep Breathing</h3>
          <p className="text-emerald-100 text-sm mb-6">A 2-minute exercise to lower cortisol levels.</p>
          <button className="bg-white text-emerald-600 font-bold px-6 py-2 rounded-xl text-sm">Breathe Now</button>
        </div>

        <div className="bg-slate-900 p-8 rounded-[32px] text-white shadow-lg shadow-slate-200">
          <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6 text-xl">
             <i className="fas fa-microphone"></i>
          </div>
          <h3 className="text-xl font-bold mb-2">AI Voice Check</h3>
          <p className="text-slate-400 text-sm mb-6">Speak for 30 seconds to analyze stress in your tone.</p>
          <button className="bg-indigo-500 text-white font-bold px-6 py-2 rounded-xl text-sm">Record Voice</button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
