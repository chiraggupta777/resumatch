import React, { useState } from 'react';
import ScoreBar from './ScoreBar';

export interface MatchResult {
  _id?: string;
  type: 'match';
  jobTitle: string;
  matchScore: number;
  atsKeywordsFound: string[];
  atsKeywordsMissing: string[];
  strengths: string[];
  gaps: string[];
  suggestions: string[];
  createdAt?: string;
}

interface MatchResultPanelProps {
  result: MatchResult;
  onReset?: () => void;
}

function scoreColor(score: number) {
  if (score >= 71) return '#22c55e';
  if (score >= 41) return '#f59e0b';
  return '#ef4444';
}

function scoreLabel(score: number) {
  if (score >= 71) return 'Strong Match';
  if (score >= 41) return 'Moderate Match';
  return 'Low Match';
}

function Chip({ label, variant }: { label: string; variant: 'green' | 'red' | 'amber' | 'indigo' }) {
  const colors = {
    green: { bg: 'rgba(34,197,94,0.08)', border: 'rgba(34,197,94,0.3)', text: '#86efac' },
    red: { bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.3)', text: '#fca5a5' },
    amber: { bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.3)', text: '#fcd34d' },
    indigo: { bg: 'rgba(99,102,241,0.08)', border: 'rgba(99,102,241,0.3)', text: '#a5b4fc' },
  };
  const c = colors[variant];
  return (
    <span style={{
      display: 'inline-block',
      padding: '4px 10px',
      borderRadius: 999,
      border: `1px solid ${c.border}`,
      backgroundColor: c.bg,
      color: c.text,
      fontSize: 12,
      fontWeight: 500,
    }}>
      {label}
    </span>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="animate-fade-in" style={{
      backgroundColor: '#111118',
      border: '1px solid #1e1e2e',
      borderRadius: 16,
      padding: '20px 24px',
    }}>
      {children}
    </div>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 600, color: '#fff' }}>{children}</h3>
  );
}

export default function MatchResultPanel({ result, onReset }: MatchResultPanelProps) {
  const color = scoreColor(result.matchScore);
  const label = scoreLabel(result.matchScore);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Match Score */}
      <Card>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, marginBottom: 16 }}>
          <div style={{ fontSize: 72, fontWeight: 800, color, lineHeight: 1, letterSpacing: '-2px' }}>
            {result.matchScore}%
          </div>
          <p style={{ margin: 0, fontSize: 14, color: '#9ca3af' }}>
            Match Score for {result.jobTitle}
          </p>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '4px 12px',
            borderRadius: 999,
            border: `1px solid ${color}40`,
            backgroundColor: `${color}10`,
          }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: color }} />
            <span style={{ fontSize: 13, fontWeight: 600, color }}>{label}</span>
          </div>
        </div>
        <ScoreBar value={result.matchScore} color={color} height={8} />
      </Card>

      {/* ATS Keywords */}
      <Card>
        <SectionHeading>🔍 ATS Keywords</SectionHeading>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <p style={{ margin: '0 0 8px', fontSize: 12, color: '#6b7280', fontWeight: 500 }}>Found in your resume</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {result.atsKeywordsFound.length > 0
                ? result.atsKeywordsFound.map((k) => <Chip key={k} label={k} variant="green" />)
                : <span style={{ fontSize: 13, color: '#4b5563' }}>None detected</span>}
            </div>
          </div>
          <div>
            <p style={{ margin: '0 0 8px', fontSize: 12, color: '#6b7280', fontWeight: 500 }}>Missing from your resume</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {result.atsKeywordsMissing.length > 0
                ? result.atsKeywordsMissing.map((k) => <Chip key={k} label={k} variant="red" />)
                : <span style={{ fontSize: 13, color: '#4b5563' }}>None missing</span>}
            </div>
          </div>
        </div>
      </Card>

      {/* Strengths */}
      {result.strengths.length > 0 && (
        <Card>
          <SectionHeading>✅ What's Working</SectionHeading>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {result.strengths.map((s) => <Chip key={s} label={s} variant="green" />)}
          </div>
        </Card>
      )}

      {/* Gaps */}
      {result.gaps.length > 0 && (
        <Card>
          <SectionHeading>⚠️ What's Missing</SectionHeading>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {result.gaps.map((g) => <Chip key={g} label={g} variant="amber" />)}
          </div>
        </Card>
      )}

      {/* Suggestions */}
      {result.suggestions.length > 0 && (
        <Card>
          <SectionHeading>💡 How to Improve</SectionHeading>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {result.suggestions.map((s, i) => (
              <SuggestionRow key={i} index={i + 1} text={s} />
            ))}
          </div>
        </Card>
      )}

      {onReset && (
        <button
          onClick={onReset}
          style={{
            padding: '10px 20px',
            borderRadius: 10,
            border: '1px solid #1e1e2e',
            backgroundColor: 'transparent',
            color: '#9ca3af',
            fontSize: 14,
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => { (e.target as HTMLElement).style.backgroundColor = '#111118'; (e.target as HTMLElement).style.color = '#fff'; }}
          onMouseLeave={(e) => { (e.target as HTMLElement).style.backgroundColor = 'transparent'; (e.target as HTMLElement).style.color = '#9ca3af'; }}
        >
          Analyze Another Resume
        </button>
      )}
    </div>
  );
}

function SuggestionRow({ index, text }: { index: number; text: string }) {
  const [hover, setHover] = useState(false);
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex',
        gap: 12,
        padding: '10px 14px',
        borderRadius: 8,
        borderLeft: '3px solid #6366f1',
        backgroundColor: hover ? 'rgba(99,102,241,0.04)' : 'transparent',
        transition: 'background-color 0.2s ease',
      }}
    >
      <span style={{ flexShrink: 0, fontSize: 13, fontWeight: 600, color: '#6366f1', minWidth: 20 }}>{index}.</span>
      <span style={{ fontSize: 14, color: '#d1d5db', lineHeight: 1.6 }}>{text}</span>
    </div>
  );
}
