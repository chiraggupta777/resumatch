import React, { useState, useRef } from 'react';
import Navbar from '../components/Navbar';
import ResumeUploader from '../components/ResumeUploader';
import StreamingPanel from '../components/StreamingPanel';
import MatchResultPanel, { type MatchResult } from '../components/MatchResultPanel';
import ScoreResultPanel, { type ScoreResult } from '../components/ScoreResultPanel';
import Toast, { useToast } from '../components/Toast';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

type Mode = 'match' | 'score';

const BASE_URL = import.meta.env.VITE_API_URL;

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        padding: '8px 20px',
        borderRadius: 999,
        border: 'none',
        cursor: 'pointer',
        fontSize: 14,
        fontWeight: 600,
        backgroundColor: active ? '#6366f1' : hover ? '#1a1a24' : 'transparent',
        color: active ? '#fff' : hover ? '#374151' : '#64748b',
        transition: 'all 0.2s ease',
      }}
    >
      {children}
    </button>
  );
}

function inputStyle(focused: boolean): React.CSSProperties {
  return {
    width: '100%',
    padding: '10px 14px',
    borderRadius: 10,
    border: `1px solid ${focused ? '#6366f1' : '#e2e8f0'}`,
    backgroundColor: '#f0efea',
    color: '#1a1a1a',
    fontSize: 14,
    outline: 'none',
    transition: 'border-color 0.2s ease',
    resize: 'vertical' as const,
    fontFamily: 'Inter, sans-serif',
  };
}

export default function Dashboard() {
  const { token } = useAuth();
  const { toasts, addToast, removeToast } = useToast();

  const [mode, setMode] = useState<Mode>('match');

  // Shared state
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState('');
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [streamedText, setStreamedText] = useState('');
  const [streamStage, setStreamStage] = useState(0);

  // Match mode state
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [jobTitleError, setJobTitleError] = useState('');
  const [jobDescError, setJobDescError] = useState('');
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);

  // Score mode state
  const [scoreResult, setScoreResult] = useState<ScoreResult | null>(null);

  const [jtFocused, setJtFocused] = useState(false);
  const [jdFocused, setJdFocused] = useState(false);

  const stageTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const resetAll = () => {
    setFile(null);
    setFileError('');
    setMatchResult(null);
    setScoreResult(null);
    setStreamedText('');
    setStreaming(false);
    setLoading(false);
    setJobTitle('');
    setJobDescription('');
    setJobTitleError('');
    setJobDescError('');
    setStreamStage(0);
  };

  const handleFileChange = (f: File | null) => {
    if (!f) {
      setFile(null);
      setFileError('');
      return;
    }
    if (f.type !== 'application/pdf') {
      setFileError('Only PDF files are supported');
      setFile(null);
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      setFileError('File size must be under 10MB');
      setFile(null);
      return;
    }
    setFileError('');
    setFile(f);
  };

  const startStageTimer = () => {
    let stage = 0;
    setStreamStage(0);
    stageTimerRef.current = setInterval(() => {
      stage = Math.min(stage + 1, 2);
      setStreamStage(stage);
    }, 2500);
  };

  const stopStageTimer = () => {
    if (stageTimerRef.current) clearInterval(stageTimerRef.current);
  };

  const runStream = async (endpoint: string, formData: FormData) => {
    setLoading(true);
    setStreaming(true);
    setStreamedText('');
    setMatchResult(null);
    setScoreResult(null);
    startStageTimer();

    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return;
      }

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let fullText = '';
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        
        for (const line of lines) {
          const trimmedLine = line.trim();
          if (trimmedLine.startsWith('data: ') && !trimmedLine.includes('[DONE]')) {
            try {
              const data = JSON.parse(trimmedLine.slice(6));
              const content = data.choices?.[0]?.delta?.content || '';
              if (content) {
                fullText += content;
                setStreamedText(prev => prev + content);
              }
            } catch (e) {
              // Catch JSON splits inside the reader safely
            }
          }
        }
      }

      stopStageTimer();

      // Robust JSON extraction - find first { and last }
      const start = fullText.indexOf('{');
      const end = fullText.lastIndexOf('}');

      if (start === -1 || end === -1) {
        throw new Error('No valid JSON in response');
      }

      const jsonStr = fullText.slice(start, end + 1);
      const parsed = JSON.parse(jsonStr);

      setStreamedText('');
      setStreaming(false);

      if (endpoint.includes('match')) {
        setMatchResult(parsed);
      } else {
        setScoreResult(parsed);
      }
    } catch (err: any) {
      stopStageTimer();
      setStreaming(false);
      setStreamedText('');
      if (err.message?.includes('fetch')) {
        addToast('Server unreachable. Please try again.', 'error');
      } else {
        addToast('Analysis failed. Please try again.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleMatchSubmit = () => {
    let valid = true;
    if (!file) { setFileError('Please upload your resume PDF'); valid = false; }
    if (!jobTitle.trim()) { setJobTitleError('Job title is required'); valid = false; }
    if (!jobDescription.trim()) { setJobDescError('Job description is required'); valid = false; }
    if (!valid) return;

    setJobTitleError('');
    setJobDescError('');
    const fd = new FormData();
    fd.append('resume', file!);
    fd.append('jobTitle', jobTitle);
    fd.append('jobDescription', jobDescription);
    runStream('/api/analysis/match', fd);
  };

  const handleScoreSubmit = () => {
    if (!file) { setFileError('Please upload your resume PDF'); return; }
    setFileError('');
    const fd = new FormData();
    fd.append('resume', file!);
    runStream('/api/analysis/score', fd);
  };

  return (
    <div style={{ backgroundColor: '#f0efea', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>
        {/* Mode tabs */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 36 }}>
          <div style={{
            display: 'inline-flex',
            gap: 4,
            padding: 4,
            borderRadius: 999,
            backgroundColor: '#f0efea',
            border: '1px solid #e2e8f0',
          }}>
            <TabButton active={mode === 'match'} onClick={() => { setMode('match'); resetAll(); }}>
              🎯 Resume Matcher
            </TabButton>
            <TabButton active={mode === 'score'} onClick={() => { setMode('score'); resetAll(); }}>
              📄 Resume Score
            </TabButton>
          </div>
        </div>

        {mode === 'match' ? (
          <MatchMode
            file={file}
            onFileChange={handleFileChange}
            fileError={fileError}
            jobTitle={jobTitle}
            setJobTitle={setJobTitle}
            jobTitleError={jobTitleError}
            jobDescription={jobDescription}
            setJobDescription={setJobDescription}
            jobDescError={jobDescError}
            jtFocused={jtFocused}
            setJtFocused={setJtFocused}
            jdFocused={jdFocused}
            setJdFocused={setJdFocused}
            loading={loading}
            streaming={streaming}
            streamedText={streamedText}
            streamStage={streamStage}
            matchResult={matchResult}
            onSubmit={handleMatchSubmit}
            onReset={resetAll}
          />
        ) : (
          <ScoreMode
            file={file}
            onFileChange={handleFileChange}
            fileError={fileError}
            loading={loading}
            streaming={streaming}
            streamedText={streamedText}
            streamStage={streamStage}
            scoreResult={scoreResult}
            onSubmit={handleScoreSubmit}
            onReset={resetAll}
          />
        )}
      </div>
      <Toast toasts={toasts} onRemove={removeToast} />
    </div>
  );
}

interface MatchModeProps {
  file: File | null; onFileChange: (f: File | null) => void; fileError: string;
  jobTitle: string; setJobTitle: (v: string) => void; jobTitleError: string;
  jobDescription: string; setJobDescription: (v: string) => void; jobDescError: string;
  jtFocused: boolean; setJtFocused: (v: boolean) => void;
  jdFocused: boolean; setJdFocused: (v: boolean) => void;
  loading: boolean; streaming: boolean; streamedText: string; streamStage: number;
  matchResult: MatchResult | null; onSubmit: () => void; onReset: () => void;
}

function MatchMode(props: MatchModeProps) {
  const showResults = props.streaming || props.matchResult;

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: showResults ? '1fr 1fr' : '1fr',
      gap: 24,
      alignItems: 'start',
    }}
    className="match-grid">
      {/* Left panel */}
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: 20,
        padding: '28px 24px',
      }}>
        <h2 style={{ margin: '0 0 6px', fontSize: 20, fontWeight: 700, color: '#1a1a1a' }}>Analyze Your Resume</h2>
        <p style={{ margin: '0 0 24px', fontSize: 14, color: '#64748b', lineHeight: 1.6 }}>
          Upload your PDF and paste the job description to get your AI match report.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div>
            <label style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 500, color: '#374151' }}>
              Resume PDF
            </label>
            <ResumeUploader file={props.file} onFileChange={props.onFileChange} error={props.fileError} />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500, color: '#d1d5db' }}>
              Job Title
            </label>
            <input
              type="text"
              value={props.jobTitle}
              onChange={(e) => props.setJobTitle(e.target.value)}
              placeholder="e.g. Frontend Developer at Google"
              onFocus={() => props.setJtFocused(true)}
              onBlur={() => props.setJtFocused(false)}
              style={inputStyle(props.jtFocused)}
            />
            {props.jobTitleError && <p style={{ margin: '4px 0 0', fontSize: 12, color: '#ef4444' }}>{props.jobTitleError}</p>}
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500, color: '#d1d5db' }}>
              Job Description
            </label>
            <textarea
              value={props.jobDescription}
              onChange={(e) => props.setJobDescription(e.target.value)}
              placeholder="Paste the full job description here..."
              rows={7}
              onFocus={() => props.setJdFocused(true)}
              onBlur={() => props.setJdFocused(false)}
              style={inputStyle(props.jdFocused)}
            />
            {props.jobDescError && <p style={{ margin: '4px 0 0', fontSize: 12, color: '#ef4444' }}>{props.jobDescError}</p>}
          </div>

          <AnalyzeButton
            loading={props.loading}
            label="Analyze Resume"
            loadingLabel="Analyzing..."
            onClick={props.onSubmit}
          />
        </div>
      </div>

      {/* Right panel */}
      {showResults && (
        <div>
          {props.streaming ? (
            <StreamingPanel stage={props.streamStage} text="" />
          ) : props.matchResult ? (
            <MatchResultPanel result={props.matchResult} onReset={props.onReset} displayJobTitle={props.jobTitle} />
          ) : null}
        </div>
      )}
    </div>
  );
}

interface ScoreModeProps {
  file: File | null; onFileChange: (f: File | null) => void; fileError: string;
  loading: boolean; streaming: boolean; streamedText: string; streamStage: number;
  scoreResult: ScoreResult | null; onSubmit: () => void; onReset: () => void;
}

function ScoreMode(props: ScoreModeProps) {
  return (
    <div style={{ maxWidth: 560, margin: '0 auto' }}>
      {props.streaming ? (
        <StreamingPanel stage={props.streamStage} text="" />
      ) : props.scoreResult ? (
        <ScoreResultPanel result={props.scoreResult} onReset={props.onReset} />
      ) : (
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: 20,
          padding: '32px 28px',
        }}>
          <h2 style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 700, color: '#1a1a1a', textAlign: 'center' }}>
            Get Your Resume Score
          </h2>
          <p style={{ margin: '0 0 28px', fontSize: 14, color: '#64748b', textAlign: 'center', lineHeight: 1.6 }}>
            Upload your resume and get an overall strength score — no job description needed.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <ResumeUploader file={props.file} onFileChange={props.onFileChange} error={props.fileError} />
            <AnalyzeButton
              loading={props.loading}
              label="Score My Resume"
              loadingLabel="Scoring..."
              onClick={props.onSubmit}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function AnalyzeButton({ loading, label, loadingLabel, onClick }: {
  loading: boolean; label: string; loadingLabel: string; onClick: () => void;
}) {
  const [hover, setHover] = useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: '100%',
        padding: '13px',
        borderRadius: 10,
        border: 'none',
        backgroundColor: loading ? '#4f46e5' : hover ? '#4f46e5' : '#6366f1',
        color: '#fff',
        fontSize: 15,
        fontWeight: 600,
        cursor: loading ? 'not-allowed' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        transition: 'background-color 0.2s ease',
      }}
    >
      {loading && <Loader2 size={16} style={{ animation: 'spin 0.8s linear infinite' }} />}
      {loading ? loadingLabel : label}
    </button>
  );
}