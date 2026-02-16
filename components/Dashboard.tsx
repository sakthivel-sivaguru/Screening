
import React from 'react';
import { 
  Users, 
  Briefcase, 
  TrendingUp, 
  Activity,
  ArrowUpRight,
  UserPlus
} from 'lucide-react';
import { JobDescription, Candidate } from '../types';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

interface DashboardProps {
  jobs: JobDescription[];
  candidates: Candidate[];
  onNavigate: (view: 'dashboard' | 'jobs' | 'screening') => void;
}

const Dashboard: React.FC<DashboardProps> = ({ jobs, candidates, onNavigate }) => {
  const chartData = [
    { name: 'Mon', apps: 4 },
    { name: 'Tue', apps: 7 },
    { name: 'Wed', apps: 5 },
    { name: 'Thu', apps: 12 },
    { name: 'Fri', apps: 8 },
    { name: 'Sat', apps: 2 },
    { name: 'Sun', apps: 3 },
  ];

  const stats = [
    { label: 'Active Jobs', value: jobs.length, icon: Briefcase, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Total Candidates', value: candidates.length, icon: Users, color: 'text-purple-600', bg: 'bg-purple-100' },
    { label: 'Shortlisted', value: candidates.filter(c => c.status === 'shortlisted').length, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { label: 'Avg Match Score', value: `${candidates.length ? Math.round(candidates.reduce((a, b) => a + b.score, 0) / candidates.length) : 0}%`, icon: Activity, color: 'text-amber-600', bg: 'bg-amber-100' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Recruitment Overview</h1>
          <p className="text-slate-500 mt-1">Track your hiring funnel and AI evaluations in real-time.</p>
        </div>
        <button 
          onClick={() => onNavigate('jobs')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-all shadow-sm"
        >
          <UserPlus size={18} />
          <span>New Job Opening</span>
        </button>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.bg} ${stat.color} p-3 rounded-xl`}>
                <stat.icon size={24} />
              </div>
              <span className="text-emerald-500 text-xs font-bold flex items-center gap-0.5 bg-emerald-50 px-2 py-1 rounded-full">
                <ArrowUpRight size={14} />
                +12%
              </span>
            </div>
            <h3 className="text-slate-500 text-sm font-medium">{stat.label}</h3>
            <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Application Trends</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                />
                <Area type="monotone" dataKey="apps" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorApps)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6">High Potential Candidates</h3>
          <div className="space-y-4">
            {candidates.length === 0 ? (
              <div className="text-center py-10 text-slate-400">
                <Users className="mx-auto mb-3 opacity-20" size={48} />
                <p>No candidates screened yet</p>
              </div>
            ) : (
              candidates
                .sort((a, b) => b.score - a.score)
                .slice(0, 5)
                .map((candidate) => (
                  <div key={candidate.id} className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer group">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                      {candidate.name.charAt(0)}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <h4 className="font-semibold text-slate-900 truncate">{candidate.name}</h4>
                      <p className="text-xs text-slate-500 truncate">{candidate.email}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-blue-600">{candidate.score}%</span>
                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tight">MATCH</p>
                    </div>
                  </div>
                ))
            )}
          </div>
          <button 
            onClick={() => onNavigate('screening')}
            className="w-full mt-6 text-center text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline"
          >
            View all candidates
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
