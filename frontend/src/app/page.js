// src/app/page.js
'use client';

import { useEffect, useState } from 'react';
import api from '../utils/api';
import { formatDistanceToNow } from 'date-fns';
import { 
  MessageSquare, ThumbsUp, X, ChevronDown, ChevronUp, 
  Zap, Sparkles, TerminalSquare, Activity, Cpu, Layers, 
  Send, Code2
} from 'lucide-react';

// Fixed JWT Decoder: Accurately grabs the ID based on your backend auth.js implementation
const getUserIdFromToken = (token) => {
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    // Your backend uses { id: user._id } when signing the token
    return payload.id || payload.user?.id || null;
  } catch (e) { 
    return null; 
  }
};

export default function Home() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);

  // UI State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  
  // Form State
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newTags, setNewTags] = useState('');
  const [answerText, setAnswerText] = useState('');

  const fetchQuestions = async () => {
    try {
      const res = await api.get('/questions');
      setQuestions(res.data.data?.questions || res.data || []); 
    } catch (error) {
      console.error('Failed to fetch questions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      setToken(savedToken);
      setCurrentUserId(getUserIdFromToken(savedToken));
    }
    fetchQuestions();
  }, []);

  const handleDemoLogin = async () => {
    try {
      const res = await api.post('/auth/login', { email: 'demo@demo.com', password: 'password123' });
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      setCurrentUserId(getUserIdFromToken(res.data.token));
    } catch (err) {
      try {
        const uniqueString = Math.random().toString(36).substring(7);
        const res = await api.post('/auth/register', { 
          username: `Demo_${uniqueString}`, email: `demo_${uniqueString}@demo.com`, password: 'password123' 
        });
        localStorage.setItem('token', res.data.token);
        setToken(res.data.token);
        setCurrentUserId(getUserIdFromToken(res.data.token));
      } catch (registerErr) {
        alert('Auth Error: Please check backend logs.');
      }
    }
  };

  // 🔥 ADVANCED OPTIMISTIC UI
  const handleUpvote = async (id, e) => {
    e.stopPropagation(); 
    
    // Check if token and currentUserId exist before proceeding
    if (!token || !currentUserId) return alert('System Alert: Authentication required. Initialize Demo User.');
    
    const previousQuestions = [...questions];

    setQuestions(questions.map(q => {
      if (q._id === id) {
        // Ensure q.upvotes is always an array
        const safeUpvotes = q.upvotes || [];
        const hasUpvoted = safeUpvotes.includes(currentUserId);
        const newUpvotes = hasUpvoted 
          ? safeUpvotes.filter(uid => uid !== currentUserId) 
          : [...safeUpvotes, currentUserId];
        return { ...q, upvotes: newUpvotes };
      }
      return q;
    }));

    try {
      await api.post(`/questions/${id}/upvote`);
    } catch (error) {
      setQuestions(previousQuestions); 
    }
  };

  const handleAskQuestion = async (e) => {
    e.preventDefault();
    if (!token) return alert('System Alert: Authentication required.');
    try {
      await api.post('/questions', { title: newTitle, description: newDesc, tags: newTags.split(',').map(t => t.trim()) });
      setIsModalOpen(false);
      setNewTitle(''); setNewDesc(''); setNewTags('');
      fetchQuestions(); 
    } catch (error) {
      alert('Failed to execute POST operation');
    }
  };

  const handlePostAnswer = async (qId) => {
    if (!token) return alert('System Alert: Authentication required.');
    if (!answerText.trim()) return;
    try {
      await api.post(`/questions/${qId}/answer`, { content: answerText });
      setAnswerText('');
      fetchQuestions(); 
    } catch (err) {
      alert('Failed to deploy solution');
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#030303] flex justify-center items-center relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-[#030303] to-[#030303]"></div>
      <div className="flex flex-col items-center gap-6 z-10">
        <div className="relative">
          <div className="absolute inset-0 rounded-full blur-xl bg-cyan-500/30 animate-pulse"></div>
          <Cpu className="text-cyan-400 animate-bounce relative z-10" size={48} />
        </div>
        <div className="flex flex-col items-center gap-2">
          <p className="text-cyan-400 font-mono text-sm tracking-widest uppercase animate-pulse">Initializing Mainframe</p>
          <div className="h-1 w-48 bg-gray-900 rounded-full overflow-hidden">
            <div className="h-full bg-cyan-400 w-full origin-left animate-[scaleX_1.5s_ease-in-out_infinite]"></div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-slate-300 font-sans selection:bg-cyan-500/30 relative overflow-hidden">
      {/* GOD MODE BACKGROUNDS */}
      <div className="fixed inset-0 z-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-[#050505] to-[#000000]" />
      <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-cyan-600/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none mix-blend-overlay z-0"></div>

      <main className="max-w-5xl mx-auto p-4 md:p-8 relative z-10">
        {/* HEADER SECTION */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6 border-b border-white/5 pb-8 relative">
          <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent"></div>
          
          <div className="flex items-center gap-4 group">
            <div className="p-3 bg-black/40 border border-indigo-500/30 rounded-2xl shadow-[0_0_20px_-5px_rgba(99,102,241,0.4)] group-hover:shadow-[0_0_30px_-5px_rgba(99,102,241,0.6)] transition-all duration-500 backdrop-blur-md">
              <TerminalSquare size={32} className="text-indigo-400 group-hover:text-cyan-400 transition-colors duration-500"/>
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-cyan-400 to-emerald-400 tracking-tight">
                DevOverflow <span className="text-white/20 font-light">V2</span>
              </h1>
              <div className="flex items-center gap-3 mt-2">
                <span className="flex items-center gap-1.5 text-xs font-mono text-cyan-400/80 bg-cyan-500/10 px-2 py-0.5 rounded-md border border-cyan-500/20">
                  <Activity size={12} className="animate-pulse"/> SYSTEM.ONLINE
                </span>
                <span className="text-xs text-slate-500 font-mono hidden md:inline-block">CLUSTER_REGION: US-EAST-1</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
            {!token ? (
              <button onClick={handleDemoLogin} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-black/40 border border-white/10 text-white px-5 py-2.5 rounded-xl hover:bg-white/5 hover:border-cyan-500/50 hover:text-cyan-300 hover:shadow-[0_0_15px_-3px_rgba(6,182,212,0.3)] transition-all duration-300 backdrop-blur-md font-medium text-sm">
                <Sparkles size={16} className="text-cyan-400"/> Authenticate Demo
              </button>
            ) : (
              <button onClick={() => { localStorage.removeItem('token'); setToken(null); setCurrentUserId(null); }} className="flex-1 md:flex-none text-slate-400 hover:text-red-400 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 hover:bg-red-500/10 border border-transparent hover:border-red-500/20">
                Terminate Session
              </button>
            )}
            <button onClick={() => setIsModalOpen(true)} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white px-6 py-2.5 rounded-xl transition-all duration-300 shadow-[0_0_20px_-5px_rgba(6,182,212,0.5)] hover:shadow-[0_0_30px_-5px_rgba(6,182,212,0.7)] font-semibold text-sm border border-white/10 hover:scale-[1.02] active:scale-95">
              <Code2 size={16} /> Deploy Query
            </button>
          </div>
        </header>

        {/* FEED SECTION */}
        <div className="space-y-6">
          {questions.map((q) => {
            const safeUpvotes = q.upvotes || [];
            const hasUpvoted = safeUpvotes.includes(currentUserId);
            const isExpanded = expandedId === q._id;

            return (
              <div 
                key={q._id} 
                className={`relative group bg-black/40 backdrop-blur-xl border rounded-3xl p-1 transition-all duration-500 overflow-hidden ${isExpanded ? 'border-cyan-500/50 shadow-[0_0_40px_-10px_rgba(6,182,212,0.15)] bg-gradient-to-b from-cyan-950/20 to-black/40' : 'border-white/5 hover:border-indigo-500/30 hover:bg-black/60 hover:shadow-[0_0_30px_-10px_rgba(99,102,241,0.1)]'}`}
              >
                {/* Neon Top Border Accent */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-[1px] bg-gradient-to-r from-transparent via-white/20 group-hover:via-indigo-400 to-transparent transition-all duration-500 opacity-0 group-hover:opacity-100"></div>

                <div className="bg-[#0a0a0a]/80 rounded-[22px] p-5 md:p-7 relative z-10 flex gap-4 md:gap-8">
                  
                  {/* METRICS SIDEBAR */}
                  <div className="flex flex-col items-center gap-4 min-w-[56px] pt-1">
                    <button 
                      onClick={(e) => handleUpvote(q._id, e)} 
                      className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all duration-300 w-full group/btn ${hasUpvoted ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-400 shadow-[0_0_15px_-3px_rgba(6,182,212,0.4)] scale-105' : 'bg-black/50 border-white/5 text-slate-500 hover:text-cyan-400 hover:border-cyan-500/40 hover:bg-cyan-500/10 hover:shadow-[0_0_15px_-3px_rgba(6,182,212,0.2)]'}`}
                    >
                      <ThumbsUp size={20} className={`transition-transform duration-300 ${hasUpvoted ? 'fill-cyan-400/20 scale-110' : 'group-hover/btn:-translate-y-1'}`} /> 
                      <span className="font-mono font-bold text-sm mt-1.5">{safeUpvotes.length}</span>
                    </button>
                    <div className="flex flex-col items-center justify-center text-slate-500 text-xs font-mono">
                      <MessageSquare size={18} className="mb-1.5 opacity-40" /> 
                      {q.answers?.length || 0}
                    </div>
                  </div>

                  {/* MAIN CONTENT */}
                  <div className="flex-1 w-full">
                    <div 
                      className="flex justify-between items-start cursor-pointer mb-3 group/header"
                      onClick={() => setExpandedId(isExpanded ? null : q._id)}
                    >
                      <h2 className={`text-xl md:text-2xl font-bold transition-colors duration-300 pr-4 leading-tight tracking-tight ${isExpanded ? 'text-cyan-300' : 'text-slate-100 group-hover/header:text-indigo-300'}`}>
                        {q.title}
                      </h2>
                      <div className={`shrink-0 flex items-center justify-center w-8 h-8 rounded-full border transition-all duration-300 ${isExpanded ? 'bg-cyan-500/20 border-cyan-500/30 text-cyan-400 rotate-180' : 'bg-white/5 border-transparent text-slate-500 group-hover/header:bg-white/10 group-hover/header:text-white'}`}>
                        <ChevronDown size={18}/>
                      </div>
                    </div>
                    
                    <p className={`text-slate-400 text-sm md:text-base leading-relaxed mb-6 font-light ${isExpanded ? '' : 'line-clamp-2'}`}>
                      {q.description}
                    </p>
                    
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div className="flex flex-wrap gap-2">
                        {q.tags?.map((tag) => (
                          <span key={tag} className="px-3 py-1.5 rounded-lg bg-indigo-950/30 text-indigo-300 text-xs font-mono font-medium border border-indigo-500/20 flex items-center gap-1.5 hover:bg-indigo-900/40 hover:border-indigo-400/40 transition-colors cursor-default">
                            <Layers size={10} className="text-indigo-400/70" /> {tag}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center gap-2 text-xs font-mono text-slate-500 bg-black/40 px-3 py-1.5 rounded-lg border border-white/5">
                        <span className="text-cyan-400/80 font-semibold">{q.user?.username || 'SYS_ANON'}</span> 
                        <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                        <span>{q.createdAt ? formatDistanceToNow(new Date(q.createdAt)) + ' ago' : 'SYS_RECENT'}</span>
                      </div>
                    </div>

                    {/* EXPANDED THREAD SECTION */}
                    {isExpanded && (
                      <div className="mt-8 pt-6 border-t border-white/5 relative">
                        <div className="flex items-center gap-3 mb-6">
                          <h3 className="text-xs font-bold text-cyan-400 tracking-[0.2em] uppercase flex items-center gap-2">
                            <Activity size={14}/> Execution Thread 
                            <span className="bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-md border border-cyan-500/30">{q.answers?.length || 0}</span>
                          </h3>
                          <div className="h-[1px] flex-1 bg-gradient-to-r from-white/5 to-transparent"></div>
                        </div>
                        
                        <div className="space-y-4 mb-6 max-h-[400px] overflow-y-auto pr-3 custom-scrollbar">
                          {q.answers?.map((ans, idx) => (
                            <div key={idx} className="group/ans bg-black/40 border border-white/5 hover:border-indigo-500/20 p-5 rounded-2xl text-sm md:text-base text-slate-300 font-light leading-relaxed relative transition-colors duration-300 backdrop-blur-sm">
                               <p className="relative z-10">{ans.content}</p>
                               {/* Stylistic Nodes */}
                               <div className="absolute top-5 right-5 w-2 h-2 rounded-full bg-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.8)] group-hover/ans:bg-emerald-400 transition-colors"></div>
                               <div className="absolute top-0 left-0 w-[2px] h-0 bg-indigo-500 group-hover/ans:h-full transition-all duration-500 rounded-l-2xl opacity-50"></div>
                            </div>
                          ))}
                          {(!q.answers || q.answers.length === 0) && (
                            <div className="text-center py-10 border border-dashed border-white/5 rounded-2xl bg-white/[0.01]">
                              <Code2 size={24} className="mx-auto mb-3 text-slate-600"/>
                              <p className="text-sm font-mono text-slate-500 uppercase tracking-widest">Awaiting Solution Protocol</p>
                            </div>
                          )}
                        </div>

                        {/* INPUT TERMINAL */}
                        <div className="flex flex-col md:flex-row gap-3 bg-black/60 p-2 rounded-2xl border border-white/10 focus-within:border-cyan-500/50 focus-within:shadow-[0_0_20px_-5px_rgba(6,182,212,0.2)] transition-all duration-300">
                          <div className="flex items-center pl-3 text-cyan-500/50 font-mono font-bold hidden md:flex">{'>'}</div>
                          <input 
                            value={answerText} onChange={(e) => setAnswerText(e.target.value)}
                            placeholder="Input solution parameters..." 
                            className="flex-1 bg-transparent p-3 outline-none text-white placeholder-slate-600 font-mono text-sm"
                          />
                          <button onClick={() => handlePostAnswer(q._id)} className="flex items-center justify-center gap-2 bg-white/10 hover:bg-cyan-500 text-white hover:text-black px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300">
                            <Send size={16} /> Execute
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          {questions.length === 0 && (
            <div className="flex flex-col items-center justify-center text-slate-500 py-32 border border-dashed border-white/10 rounded-3xl bg-black/20 backdrop-blur-sm relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-indigo-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
              <TerminalSquare size={56} className="mx-auto mb-6 text-slate-700 group-hover:text-indigo-500 transition-colors duration-500"/>
              <p className="font-mono text-sm uppercase tracking-widest text-slate-400">Database Empty. Initialize Sequence.</p>
            </div>
          )}
        </div>

        {/* ASK QUESTION MODAL (GOD MODE) */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/90 flex justify-center items-center p-4 z-50 backdrop-blur-xl">
            {/* Ambient Modal Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-indigo-600/20 blur-[150px] rounded-full pointer-events-none" />
            
            <div className="bg-[#0a0a0a]/90 rounded-3xl border border-white/10 shadow-[0_0_50px_-10px_rgba(6,182,212,0.3)] w-full max-w-xl transform transition-all relative z-10 overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400"></div>
              
              <div className="p-8">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-3 tracking-tight">
                    <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/30">
                      <Zap size={20} className="text-cyan-400"/> 
                    </div>
                    Initialize Thread
                  </h2>
                  <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-red-400 transition-colors bg-white/5 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 p-2 rounded-xl">
                    <X size={20}/>
                  </button>
                </div>

                <form onSubmit={handleAskQuestion} className="space-y-6">
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-2 text-xs font-mono font-bold text-cyan-500/80 uppercase tracking-widest">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-500"></span> Subject Protocol
                    </label>
                    <input required value={newTitle} onChange={e => setNewTitle(e.target.value)} className="w-full bg-black/50 border border-white/10 p-4 rounded-xl focus:border-cyan-500/50 focus:shadow-[0_0_15px_rgba(6,182,212,0.1)] outline-none text-white text-sm transition-all font-mono placeholder-slate-600" placeholder="System architecture failure at node..." />
                  </div>
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-2 text-xs font-mono font-bold text-indigo-400/80 uppercase tracking-widest">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span> Context Matrix
                    </label>
                    <textarea required value={newDesc} onChange={e => setNewDesc(e.target.value)} className="w-full bg-black/50 border border-white/10 p-4 rounded-xl h-36 focus:border-indigo-500/50 focus:shadow-[0_0_15px_rgba(99,102,241,0.1)] outline-none text-white text-sm custom-scrollbar transition-all resize-none font-mono placeholder-slate-600" placeholder="Provide raw system logs and environmental variables..." />
                  </div>
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-400/80 uppercase tracking-widest">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Classification Tags
                    </label>
                    <input required value={newTags} onChange={e => setNewTags(e.target.value)} className="w-full bg-black/50 border border-white/10 p-4 rounded-xl focus:border-emerald-500/50 focus:shadow-[0_0_15px_rgba(16,185,129,0.1)] outline-none text-white text-sm transition-all font-mono placeholder-slate-600" placeholder="kubernetes, redis, clustering" />
                  </div>

                  <div className="flex justify-end gap-3 pt-6 border-t border-white/5">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 text-sm font-bold font-mono text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all">ABORT</button>
                    <button type="submit" className="bg-white text-black px-8 py-3 rounded-xl text-sm font-bold font-mono hover:bg-cyan-400 hover:shadow-[0_0_25px_-5px_rgba(6,182,212,0.6)] transition-all duration-300">EXECUTE POST</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </main>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scaleX {
          0%, 100% { transform: scaleX(0.2); transform-origin: left; }
          50% { transform: scaleX(1); transform-origin: left; }
        }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.3); border-radius: 8px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(6,182,212,0.3); border-radius: 8px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(6,182,212,0.8); }
      `}} />
    </div>
  );
}