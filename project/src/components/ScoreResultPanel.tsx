import React from 'react';
import ScoreBar from './ScoreBar';

export interface ScoreResult {
  _id?: string;
  type: 'score';
  overallScore: number;
  contentScore: number;
  impactScore: number;
  keywordScore: number;
  formatScore: number;
  atsKeywordsFound: string[];
  suggestions: string[];
  createdAt?: string;
}

interface ScoreResultPanelProps {
  result: ScoreResult;
  onReset?: () => void;
}

function scoreColor(score: number) {
  if (score >= 71) return '#22c55e';
  if (score >= 41) return '#f59e0b';
  return '#ef4444';
}

function scoreLabel(score: number) {
  if (score >= 71) return 'Strong';
  if (score >= 41) return 'Moderate';
  return 'Weak';
}

function Chip({ label }: { label: string }) {
  return (
    <span style={{
      display: 'inline-block',
      padding: '4px 10px',
      borderRadius: 999,
      border: '1px solid rgba(99,102,241,0.3)',
      backgroundColor: 'rgba(99,102,241,0.08)',
      color: '#a5b4fc',
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
      backgroundColor: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: 16,
      padding: '20px 24px',
    }}>
      {children}
    </div>
  );
}

function SubScoreCard({ label, score }: { label: string; score: number }) {
  const color = scoreColor(score);
  return (
    <div style={{
      backgroundColor: '#f0efea',
      border: '1px solid #e2e8f0',
      borderRadius: 12,
      padding: '16px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <span style={{ fontSize: 13, fontWeight: 500, color: '#9ca3af' }}>{label}</span>
        <span style={{ fontSize: 16, fontWeight: 700, color }}>{score}</span>
      </div>
      <ScoreBar value={score} color={color} height={5} />
    </div>
  );
}

function SuggestionRow({ index, text }: { index: number; text: string }) {
  const [hover, setHover] = React.useState(false);
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
      <span style={{ fontSize: 14, color: '#374151', lineHeight: 1.6 }}>{text}</span>
    </div>
  );
}

export default function ScoreResultPanel({ result, onReset }: ScoreResultPanelProps) {
  const color = scoreColor(result.overallScore);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 600, margin: '0 auto', width: '100%' }}>
      {/* Overall Score */}
      <Card>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, marginBottom: 16 }}>
          <div style={{ fontSize: 72, fontWeight: 800, color, lineHeight: 1, letterSpacing: '-2px' }}>
            {result.overallScore}
            <span style={{ fontSize: 32, fontWeight: 600, color: '#4b5563' }}>/100</span>
          </div>
          <p style={{ margin: 0, fontSize: 14, color: '#9ca3af' }}>Overall Resume Score</p>
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
            <span style={{ fontSize: 13, fontWeight: 600, color }}>{scoreLabel(result.overallScore)} Resume</span>
          </div>
        </div>
        <ScoreBar value={result.overallScore} color={color} height={8} />
      </Card>

      {/* Sub Scores */}
      <Card>
        <h3 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 600, color: '#1a1a1a' }}>Score Breakdown</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
          <SubScoreCard label="📝 Content Quality" score={result.contentScore} />
          <SubScoreCard label="🎯 Impact & Achievements" score={result.impactScore} />
          <SubScoreCard label="🔑 Keyword Density" score={result.keywordScore} />
          <SubScoreCard label="📐 Format & Structure" score={result.formatScore} />
        </div>
      </Card>

      {/* ATS Keywords */}
      {result.atsKeywordsFound.length > 0 && (
        <Card>
          <h3 style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 600, color: '#1a1a1a' }}>🔍 ATS Keywords Found</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {result.atsKeywordsFound.map((k) => <Chip key={k} label={k} />)}
          </div>
        </Card>
      )}

      {/* Suggestions */}
      {result.suggestions.length > 0 && (
        <Card>
          <h3 style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 600, color: '#1a1a1a' }}>💡 Improvement Tips</h3>
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
          onMouseEnter={(e) => { (e.target as HTMLElement).style.backgroundColor = '#ffffff'; (e.target as HTMLElement).style.color = '#1a1a1a'; }}
          onMouseLeave={(e) => { (e.target as HTMLElement).style.backgroundColor = 'transparent'; (e.target as HTMLElement).style.color = '#9ca3af'; }}
        >
          Score Another Resume
        </button>
      )}
    </div>
  );
}
