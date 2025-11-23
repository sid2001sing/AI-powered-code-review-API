import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldAlert, 
  Bug, 
  Lightbulb, 
  Code2, 
  Play, 
  Loader2, 
  CheckCircle2,
  Terminal,
  Copy,
  ChevronDown
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) { return twMerge(clsx(inputs)); }

const LANGUAGES = [
  "javascript", "typescript", "python", "java", "csharp", "cpp", 
  "go", "rust", "php", "ruby", "html", "css", "json", "sql", "yaml"
];

export default function App() {
  const [code, setCode] = useState(`// Select a language above and paste your code!
function example() {
  console.log("Hello World");
}`);
  const [language, setLanguage] = useState("javascript");
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('audit');

  const handleReview = async () => {
    setLoading(true);
    setReview(null);
    setActiveTab('audit');
    
    try {
      const response = await fetch('http://localhost:5000/api/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language }), // Send language context
      });
      const data = await response.json();
      setReview(data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-300 font-sans selection:bg-indigo-500/30">
      {/* Navbar */}
      <nav className="border-b border-slate-800 bg-[#0f172a]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
              <Code2 className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <h1 className="font-bold text-slate-100 text-lg tracking-tight">CodeGuardian AI</h1>
              <p className="text-xs text-slate-500 font-medium">Automated Security & Quality Audit</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 text-xs font-medium text-slate-500 bg-slate-900 px-3 py-1.5 rounded-full border border-slate-800">
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
              Groq Llama 3
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-[1600px] mx-auto p-6 h-[calc(100vh-64px)] grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* LEFT COLUMN: Code Editor */}
        <div className="flex flex-col gap-4 h-full">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h2 className="flex items-center gap-2 font-semibold text-slate-200">
                <Terminal className="w-4 h-4 text-indigo-400" />
                Source Code
              </h2>
              
              {/* Language Selector */}
              <div className="relative group">
                <select 
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="appearance-none bg-slate-800 text-xs font-medium text-slate-300 pl-3 pr-8 py-1.5 rounded-md border border-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer hover:bg-slate-750 uppercase tracking-wide"
                >
                  {LANGUAGES.map(lang => (
                    <option key={lang} value={lang}>{lang}</option>
                  ))}
                </select>
                <ChevronDown className="w-3 h-3 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <button
              onClick={handleReview}
              disabled={loading}
              className={cn(
                "flex items-center gap-2 px-5 py-2 rounded-lg font-medium transition-all duration-200",
                loading 
                  ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 active:scale-95"
              )}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  Run Audit
                </>
              )}
            </button>
          </div>

          <div className="flex-1 rounded-xl overflow-hidden border border-slate-700/50 shadow-2xl bg-[#1e293b]">
            <Editor
              height="100%"
              language={language} // DYNAMIC LANGUAGE
              theme="vs-dark"
              value={code}
              onChange={(value) => setCode(value)}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                padding: { top: 20 },
                scrollBeyondLastLine: false,
                smoothScrolling: true,
                cursorBlinking: "smooth",
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              }}
            />
          </div>
        </div>

        {/* RIGHT COLUMN: Analysis Results */}
        <div className="flex flex-col gap-4 h-full overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h2 className="flex items-center gap-2 font-semibold text-slate-200">
              <ShieldAlert className="w-4 h-4 text-emerald-400" />
              Analysis Report
            </h2>
            
            {review && (
              <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800">
                <button
                  onClick={() => setActiveTab('audit')}
                  className={cn(
                    "px-3 py-1 text-xs font-medium rounded-md transition-all",
                    activeTab === 'audit' ? "bg-slate-800 text-white" : "text-slate-500 hover:text-slate-300"
                  )}
                >
                  Audit Results
                </button>
                <button
                  onClick={() => setActiveTab('code')}
                  className={cn(
                    "px-3 py-1 text-xs font-medium rounded-md transition-all",
                    activeTab === 'code' ? "bg-indigo-600 text-white" : "text-slate-500 hover:text-slate-300"
                  )}
                >
                  Refactored Code
                </button>
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto pr-2 space-y-6 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
            
            <AnimatePresence mode="wait">
              {!review && !loading && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="h-full flex flex-col items-center justify-center text-slate-500 border-2 border-dashed border-slate-800 rounded-xl p-12 bg-slate-900/50"
                >
                  <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mb-4">
                    <Code2 className="w-8 h-8 text-slate-600" />
                  </div>
                  <h3 className="text-lg font-medium text-slate-300">Ready to Review</h3>
                  <p className="text-sm max-w-xs text-center mt-2">
                    Paste your {language} code in the editor and click "Run Audit".
                  </p>
                </motion.div>
              )}

              {loading && (
                <div className="space-y-4 mt-4">
                  <div className="h-24 bg-slate-800/50 rounded-xl animate-pulse border border-slate-800" />
                  <div className="h-40 bg-slate-800/30 rounded-xl animate-pulse border border-slate-800" />
                  <div className="h-32 bg-slate-800/20 rounded-xl animate-pulse border border-slate-800" />
                </div>
              )}

              {review && activeTab === 'audit' && (
                <motion.div 
                  key="audit"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  {/* Summary Card */}
                  <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800">
                    <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Executive Summary</h3>
                    <p className="text-slate-300 leading-relaxed">{review.summary}</p>
                  </div>

                  {/* Detailed Issues */}
                  <div className="space-y-4">
                    {review.issues && review.issues.map((issue, idx) => (
                      <IssueCard key={idx} issue={issue} index={idx} />
                    ))}
                  </div>
                </motion.div>
              )}

              {review && activeTab === 'code' && (
                <motion.div 
                  key="code"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="h-full flex flex-col"
                >
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-sm font-medium text-emerald-400 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      Recommended Fix
                    </h3>
                    <button 
                      onClick={() => navigator.clipboard.writeText(review.refactored_code)}
                      className="text-xs flex items-center gap-1 text-slate-500 hover:text-white transition-colors"
                    >
                      <Copy className="w-3 h-3" /> Copy
                    </button>
                  </div>
                  <div className="flex-1 rounded-xl overflow-hidden border border-emerald-500/20 shadow-2xl bg-[#1e293b]">
                    <Editor
                      height="100%"
                      language={language} // Use same language for output
                      theme="vs-dark"
                      value={review.refactored_code}
                      options={{
                        readOnly: true,
                        minimap: { enabled: false },
                        fontSize: 13,
                        padding: { top: 20 },
                        fontFamily: "'JetBrains Mono', monospace",
                      }}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}

// --- Reusable Issue Card Component ---
function IssueCard({ issue, index }) {
  const styles = {
    security: {
      icon: <ShieldAlert className="w-5 h-5 text-rose-400" />,
      border: "border-rose-500/20",
      bg: "bg-rose-500/5",
      badge: "bg-rose-500/10 text-rose-400"
    },
    bug: {
      icon: <Bug className="w-5 h-5 text-amber-400" />,
      border: "border-amber-500/20",
      bg: "bg-amber-500/5",
      badge: "bg-amber-500/10 text-amber-400"
    },
    style: {
      icon: <Lightbulb className="w-5 h-5 text-blue-400" />,
      border: "border-blue-500/20",
      bg: "bg-blue-500/5",
      badge: "bg-blue-500/10 text-blue-400"
    }
  };

  const style = styles[issue.type] || styles.bug;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={cn("rounded-xl border p-4", style.border, style.bg)}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-3">
          {style.icon}
          <h4 className="font-semibold text-slate-200">{issue.title}</h4>
        </div>
        <span className={cn("text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider", style.badge)}>
          {issue.severity} Priority
        </span>
      </div>
      <p className="text-sm text-slate-400 leading-relaxed pl-8">
        {issue.description}
      </p>
    </motion.div>
  );
}
