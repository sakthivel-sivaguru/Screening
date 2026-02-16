import React, { useState, useRef } from 'react';
import { JobDescription, Candidate } from '../types';
import { 
  Users, 
  Upload, 
  FileText, 
  ShieldCheck, 
  AlertCircle, 
  Loader2, 
  MoreVertical,
  ThumbsUp,
  ThumbsDown,
  Mail,
  ExternalLink,
  BrainCircuit,
  PieChart,
  XCircle
} from 'lucide-react';
import { evaluateCandidate, generateEmail } from '../services/geminiService';

interface CandidateScreeningProps {
  jobs: JobDescription[];
  candidates: Candidate[];
  selectedJobId: string | null;
  onAddCandidate: (candidate: Candidate) => void;
  onUpdateCandidate: (candidate: Candidate) => void;
}

const CandidateScreening: React.FC<CandidateScreeningProps> = ({ 
  jobs, 
  candidates, 
  selectedJobId, 
  onAddCandidate,
  onUpdateCandidate
}) => {
  const [activeJobId, setActiveJobId] = useState<string | null>(selectedJobId);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState<{ isOpen: boolean; candidate: Candidate | null }>({ isOpen: false, candidate: null });
  const [emailContent, setEmailContent] = useState('');
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeJob = jobs.find(j => j.id === activeJobId);
  const filteredCandidates = candidates.filter(c => true); // In a real app, match to job ID

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeJob) return;

    setIsProcessing(true);
    
    try {
      // For demo, we simulate extraction. In prod, use a PDF parser.
      const reader = new FileReader();
      reader.onload = async (event) => {
        const text = event.target?.result as string;
        
        // Use Gemini to evaluate
        const evaluation = await evaluateCandidate(activeJob.content, text);
        
        const newCandidate: Candidate = {
          id: Math.random().toString(36).substr(2, 9),
          name: file.name.split('.')[0].replace(/[-_]/g, ' '),
          email: 'contact@candidate.com',
          resumeText: text,
          score: evaluation.matchPercentage,
          status: evaluation.matchPercentage > 75 ? 'shortlisted' : 'screened',
          evaluation
        };
        
        onAddCandidate(newCandidate);
        setIsProcessing(false);
      };
      reader.readAsText(file);
    } catch (error) {
      console.error("Evaluation failed", error);
      setIsProcessing(false);
    }
  };

  const handleSendEmail = async (candidate: Candidate) => {
    if (!activeJob) return;
    setIsEmailLoading(true);
    setShowEmailModal({ isOpen: true, candidate });
    
    try {
      const email = await generateEmail(candidate.name, activeJob.title, candidate.score);
      setEmailContent(email);
    } catch (error) {
      setEmailContent("Failed to generate email template. Please try again.");
    } finally {
      setIsEmailLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Candidate Screening</h1>
          <p className="text-slate-500 mt-1">AI-driven evaluation of incoming applications.</p>
        </div>
        <div className="flex items-center gap-3">
          <select 
            value={activeJobId || ''} 
            onChange={(e) => setActiveJobId(e.target.value)}
            className="bg-white px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-100 font-medium text-slate-700 min-w-[200px]"
          >
            <option value="" disabled>Select Job Role</option>
            {jobs.map(j => <option key={j.id} value={j.id}>{j.title}</option>)}
          </select>
          
          <button 
            disabled={!activeJobId || isProcessing}
            onClick={() => fileInputRef.current?.click()}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold shadow-lg transition-all ${
              activeJobId && !isProcessing 
                ? 'bg-slate-900 text-white hover:bg-slate-800' 
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            {isProcessing ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
            <span>{isProcessing ? 'Analyzing...' : 'Upload Resumes'}</span>
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            onChange={handleFileUpload} 
            accept=".txt,.pdf"
          />
        </div>
      </header>

      {/* Candidate List */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Candidate Info</th>
                <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">AI Match Score</th>
                <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Key Strengths</th>
                <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCandidates.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center justify-center opacity-40">
                      <Users size={64} className="mb-4 text-slate-300" />
                      <p className="text-xl font-medium text-slate-400">No candidates analyzed yet</p>
                      <p className="text-sm text-slate-400 mt-1">Upload a resume to begin the AI screening process.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCandidates.map((candidate) => (
                  <tr key={candidate.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                          {candidate.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900">{candidate.name}</h4>
                          <p className="text-sm text-slate-500">{candidate.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col items-center">
                        <div className={`text-2xl font-black ${
                          candidate.score > 80 ? 'text-emerald-600' : 
                          candidate.score > 60 ? 'text-amber-600' : 'text-rose-600'
                        }`}>
                          {candidate.score}%
                        </div>
                        <div className="w-24 bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${
                              candidate.score > 80 ? 'bg-emerald-500' : 
                              candidate.score > 60 ? 'bg-amber-500' : 'bg-rose-500'
                            }`}
                            style={{ width: `${candidate.score}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-wrap gap-1.5 max-w-[300px]">
                        {candidate.evaluation?.pros.slice(0, 2).map((pro, i) => (
                          <span key={i} className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-1 rounded-md border border-emerald-100 uppercase truncate">
                            {pro}
                          </span>
                        ))}
                        {candidate.evaluation?.pros.length ? (
                          <span className="text-[10px] text-slate-400 font-bold px-2 py-1">+{candidate.evaluation.pros.length - 2} more</span>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${
                        candidate.status === 'shortlisted' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                        candidate.status === 'screened' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                        'bg-slate-100 text-slate-700 border-slate-200'
                      }`}>
                        {candidate.status === 'shortlisted' && <ShieldCheck size={14} />}
                        {candidate.status.charAt(0).toUpperCase() + candidate.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleSendEmail(candidate)}
                          className="p-2.5 rounded-xl text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Send Invitation"
                        >
                          <Mail size={18} />
                        </button>
                        <button 
                          className="p-2.5 rounded-xl text-slate-400 hover:bg-slate-100 transition-colors"
                          title="View Details"
                        >
                          <ExternalLink size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Email Modal */}
      {showEmailModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[60] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                  <Mail className="text-blue-600" />
                  Invite Candidate
                </h2>
                <p className="text-slate-500 mt-1">AI-generated interview invitation for {showEmailModal.candidate?.name}</p>
              </div>
              <button 
                onClick={() => setShowEmailModal({ isOpen: false, candidate: null })}
                className="text-slate-400 hover:text-slate-600"
              >
                <XCircle size={24} />
              </button>
            </div>
            
            <div className="p-8 bg-slate-50">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 min-h-[300px] shadow-inner font-mono text-sm text-slate-700 whitespace-pre-wrap leading-relaxed overflow-y-auto max-h-[400px]">
                {isEmailLoading ? (
                  <div className="flex flex-col items-center justify-center h-full gap-4 text-slate-400">
                    <Loader2 size={32} className="animate-spin text-blue-600" />
                    <p className="font-sans font-medium">Generating personalized invite...</p>
                  </div>
                ) : (
                  emailContent
                )}
              </div>
            </div>

            <div className="p-8 bg-white flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-slate-500 text-sm">
                <AlertCircle size={16} />
                <span>AI scores above 80% automatically trigger triggers for review.</span>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowEmailModal({ isOpen: false, candidate: null })}
                  className="px-6 py-2.5 font-semibold text-slate-600 hover:text-slate-800 transition-colors"
                >
                  Discard
                </button>
                <button 
                  onClick={() => {
                    alert(`Simulated email sent to ${showEmailModal.candidate?.email}`);
                    setShowEmailModal({ isOpen: false, candidate: null });
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-100 transition-all flex items-center gap-2"
                >
                  <Mail size={18} />
                  <span>Send Invitation</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CandidateScreening;