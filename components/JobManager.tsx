
import React, { useState } from 'react';
import { JobDescription } from '../types';
import { Briefcase, Plus, Calendar, Search, MapPin, Building2, ChevronRight } from 'lucide-react';

interface JobManagerProps {
  jobs: JobDescription[];
  onAddJob: (job: JobDescription) => void;
  onSelectJob: (id: string) => void;
}

const JobManager: React.FC<JobManagerProps> = ({ jobs, onAddJob, onSelectJob }) => {
  const [showForm, setShowForm] = useState(false);
  const [newJob, setNewJob] = useState({ title: '', department: '', content: '' });
  const [search, setSearch] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const job: JobDescription = {
      id: Math.random().toString(36).substr(2, 9),
      ...newJob,
      skills: [], // Logic to extract skills could be added here or via AI
      createdAt: new Date().toISOString(),
    };
    onAddJob(job);
    setShowForm(false);
    setNewJob({ title: '', department: '', content: '' });
  };

  const filteredJobs = jobs.filter(j => 
    j.title.toLowerCase().includes(search.toLowerCase()) || 
    j.department.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Job Descriptions</h1>
          <p className="text-slate-500 mt-1">Define roles and set criteria for AI screening.</p>
        </div>
        <button 
          onClick={() => setShowForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 transition-all shadow-md"
        >
          <Plus size={20} />
          <span>Create New JD</span>
        </button>
      </div>

      <div className="flex items-center gap-3 bg-white px-4 py-3 rounded-xl border border-slate-200 shadow-sm max-w-md focus-within:ring-2 focus-within:ring-blue-100 transition-all">
        <Search size={18} className="text-slate-400" />
        <input 
          type="text" 
          placeholder="Search roles or departments..." 
          className="bg-transparent border-none outline-none w-full text-slate-700"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredJobs.map((job) => (
          <div 
            key={job.id} 
            className="group bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl transition-all cursor-pointer overflow-hidden flex flex-col"
            onClick={() => onSelectJob(job.id)}
          >
            <div className="p-6 flex-1">
              <div className="flex justify-between items-start mb-4">
                <div className="bg-blue-50 text-blue-600 p-3 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Briefcase size={22} />
                </div>
                <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
                  Active
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{job.title}</h3>
              <div className="mt-3 space-y-2">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Building2 size={14} />
                  <span>{job.department}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Calendar size={14} />
                  <span>{new Date(job.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <p className="mt-4 text-slate-600 text-sm line-clamp-3 leading-relaxed">
                {job.content}
              </p>
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between group-hover:bg-blue-50 transition-colors">
              <span className="text-sm font-semibold text-slate-700 group-hover:text-blue-700">Screen Candidates</span>
              <ChevronRight size={18} className="text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
            <form onSubmit={handleSubmit}>
              <div className="p-8 border-b border-slate-100">
                <h2 className="text-2xl font-bold text-slate-900">Create Job Description</h2>
                <p className="text-slate-500">Define the core requirements for this position.</p>
              </div>
              
              <div className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Job Title</label>
                    <input 
                      required
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
                      placeholder="e.g. Senior Backend Engineer"
                      value={newJob.title}
                      onChange={(e) => setNewJob({...newJob, title: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Department</label>
                    <input 
                      required
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
                      placeholder="e.g. Technology"
                      value={newJob.department}
                      onChange={(e) => setNewJob({...newJob, department: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Full Job Description</label>
                  <textarea 
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all min-h-[200px] resize-none"
                    placeholder="Paste or write the job requirements, responsibilities, and benefits..."
                    value={newJob.content}
                    onChange={(e) => setNewJob({...newJob, content: e.target.value})}
                  />
                </div>
              </div>

              <div className="p-8 bg-slate-50 flex items-center justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-2.5 font-semibold text-slate-600 hover:text-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-200 transition-all active:scale-95"
                >
                  Save Position
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobManager;
