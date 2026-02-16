
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Briefcase, 
  Users, 
  Zap, 
  ChevronRight,
  Plus,
  Mail,
  CheckCircle,
  XCircle,
  Clock,
  Search
} from 'lucide-react';
import { JobDescription, Candidate } from './types';
import Dashboard from './components/Dashboard';
import JobManager from './components/JobManager';
import CandidateScreening from './components/CandidateScreening';

const App: React.FC = () => {
  const [view, setView] = useState<'dashboard' | 'jobs' | 'screening'>('dashboard');
  const [jobs, setJobs] = useState<JobDescription[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  // Mock initial data
  useEffect(() => {
    const mockJobs: JobDescription[] = [
      {
        id: '1',
        title: 'Senior Frontend Engineer',
        department: 'Engineering',
        content: 'We are looking for a React expert with 5+ years experience...',
        skills: ['React', 'TypeScript', 'Tailwind CSS'],
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        title: 'Product Designer',
        department: 'Design',
        content: 'Join our creative team to build the next generation of fintech tools...',
        skills: ['Figma', 'UI/UX', 'Prototyping'],
        createdAt: new Date().toISOString()
      }
    ];
    setJobs(mockJobs);
  }, []);

  const addJob = (job: JobDescription) => {
    setJobs(prev => [job, ...prev]);
  };

  const addCandidate = (candidate: Candidate) => {
    setCandidates(prev => [candidate, ...prev]);
  };

  const updateCandidate = (updated: Candidate) => {
    setCandidates(prev => prev.map(c => c.id === updated.id ? updated : c));
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col fixed h-full">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-2 text-blue-600 font-bold text-xl">
            <Zap className="fill-blue-600" />
            <span>HireAI</span>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => setView('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${view === 'dashboard' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <LayoutDashboard size={20} />
            <span className="font-medium">Dashboard</span>
          </button>
          
          <button 
            onClick={() => setView('jobs')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${view === 'jobs' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <Briefcase size={20} />
            <span className="font-medium">Job Descriptions</span>
          </button>
          
          <button 
            onClick={() => setView('screening')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${view === 'screening' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <Users size={20} />
            <span className="font-medium">Screening</span>
          </button>
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="bg-slate-900 rounded-xl p-4 text-white">
            <p className="text-xs text-slate-400 mb-2 uppercase tracking-wider font-semibold">Current Usage</p>
            <div className="flex justify-between items-end mb-1">
              <span className="text-sm font-medium">AI Tokens</span>
              <span className="text-xs text-slate-400">84% remaining</span>
            </div>
            <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
              <div className="bg-blue-500 h-full w-[84%]"></div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8">
        {view === 'dashboard' && (
          <Dashboard 
            jobs={jobs} 
            candidates={candidates} 
            onNavigate={(v) => setView(v)} 
          />
        )}
        
        {view === 'jobs' && (
          <JobManager 
            jobs={jobs} 
            onAddJob={addJob} 
            onSelectJob={(id) => {
              setSelectedJobId(id);
              setView('screening');
            }}
          />
        )}

        {view === 'screening' && (
          <CandidateScreening 
            jobs={jobs}
            candidates={candidates}
            selectedJobId={selectedJobId}
            onAddCandidate={addCandidate}
            onUpdateCandidate={updateCandidate}
          />
        )}
      </main>
    </div>
  );
};

export default App;
