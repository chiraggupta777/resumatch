import { useState } from 'react';
import { ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import type { MatchResult } from './MatchResultPanel';
import type { ScoreResult } from './ScoreResultPanel';
import ScoreBar from './ScoreBar';

type HistoryItem = MatchResult | ScoreResult;

interface HistoryCardProps {
  item: HistoryItem;
  onDelete?: (id: string) => void;
}

function scoreColor(score: number) {
  if (score >= 71) return '#22c55e';
  if (score >= 41) return '#f59e0b';
  return '#ef4444';
}

function Chip({ label, variant }: { label: string; variant: 'green' | 'red' | 'indigo' }) {
  const colors = {
    green: { bg: 'rgba(34,197,94,0.08)', border: 'rgba(34,197,94,0.3)', text: '#86efac' },
    red: { bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.3)', text: '#fca5a5' },
    indigo: { bg: 'rgba(99,102,241,0.08)', border: 'rgba(99,102,241,0.3)', text: '#a5b4fc' },
  };
  const c = colors[variant];
  return (
    <span style={{
      display: 'inline-block',
      padding: '3px 9px',
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

function formatDate(dateString: string) {
  const d = new Date(dateString);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function HistoryCard({ item, onDelete }: HistoryCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [hover, setHover] = useState(false);

  const isMatch = item.type === 'match';
  const score = isMatch ? (item as MatchResult).matchScore : (item as ScoreResult).overallScore;
  const scoreMax = isMatch ? undefined : 100;
  const color = scoreColor(score);
  const title = isMatch ? (item as MatchResult).jobTitle : 'Resume Score';
  const typeBadgeColor = isMatch
    ? { bg: 'rgba(99,102,241,0.1)', border: 'rgba(99,102,241,0.3)', text: '#a5b4fc' }
    : { bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)', text: '#fcd34d' };

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        border: `1px solid ${hover || expanded ? '#2e2e3e' : '#e2e8f0'}`,
        borderRadius: 16,
        overflow: 'hidden',
        transition: 'border-color 0.2s ease',
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {/* Header row */}
      <button
        onClick={() => setExpanded((p) => !p)}
        className="history-card-button"
        style={{
          alignItems: 'center',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
            <span style={{ fontSize: 15, fontWeight: 600, color: '#1a1a1a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {title}
            </span>
            <span style={{
              fontSize: 11,
              fontWeight: 500,
              padding: '2px 8px',
              borderRadius: 999,
              border: `1px solid ${typeBadgeColor.border}`,
              backgroundColor: typeBadgeColor.bg,
              color: typeBadgeColor.text,
              flexShrink: 0,
            }}>
              {isMatch ? 'Resume Matcher' : 'Resume Score'}
            </span>
          </div>
          <span style={{ fontSize: 12, color: '#64748b' }}>
            {item.createdAt ? formatDate(item.createdAt) : 'Unknown date'}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <div style={{
            padding: '4px 12px',
            borderRadius: 999,
            border: `1px solid ${color}40`,
            backgroundColor: `${color}15`,
            fontSize: 14,
            fontWeight: 700,
            color,
          }}>
            {score}{scoreMax ? `/${scoreMax}` : '%'}
          </div>
          {item._id && onDelete && (
            <div
              onClick={(e) => {
                e.stopPropagation();
                onDelete(item._id!);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 34,
                height: 34,
                borderRadius: 999,
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                cursor: 'pointer',
              }}
              title="Delete history entry"
            >
              <Trash2 size={16} color="#64748b" />
            </div>
          )}
          {expanded ? <ChevronUp size={16} color="#64748b" /> : <ChevronDown size={16} color="#64748b" />}
        </div>
      </button>

      {/* Accordion body */}
      <div style={{
        maxHeight: expanded ? 1000 : 0,
        overflow: 'hidden',
        transition: 'max-height 0.4s cubic-bezier(0.4,0,0.2,1)',
      }}>
        <div style={{ padding: '0 20px 20px', borderTop: '1px solid #e2e8f0' }}>
          {isMatch ? (
            <MatchBody item={item as MatchResult} />
          ) : (
            <ScoreBody item={item as ScoreResult} />
          )}
        </div>
      </div>
    </div>
  );
}

function MatchBody({ item }: { item: MatchResult }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 16 }}>
      {/* ATS Keywords */}
      <div>
        <p style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 600, color: '#9ca3af' }}>ATS Keywords</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12 }}>
          <div>
            <p style={{ margin: '0 0 6px', fontSize: 11, color: '#64748b' }}>Found</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {item.atsKeywordsFound.map((k) => <Chip key={k} label={k} variant="green" />)}
            </div>
          </div>
          <div>
            <p style={{ margin: '0 0 6px', fontSize: 11, color: '#64748b' }}>Missing</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {item.atsKeywordsMissing.map((k) => <Chip key={k} label={k} variant="red" />)}
            </div>
          </div>
        </div>
      </div>
      {item.strengths.length > 0 && (
        <div>
          <p style={{ margin: '0 0 6px', fontSize: 13, fontWeight: 600, color: '#9ca3af' }}>Strengths</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            {item.strengths.map((s) => <Chip key={s} label={s} variant="green" />)}
          </div>
        </div>
      )}
      {item.gaps.length > 0 && (
        <div>
          <p style={{ margin: '0 0 6px', fontSize: 13, fontWeight: 600, color: '#9ca3af' }}>Gaps</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            {item.gaps.map((g) => <Chip key={g} label={g} variant="red" />)}
          </div>
        </div>
      )}
      {item.suggestions.length > 0 && (
        <div>
          <p style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 600, color: '#9ca3af' }}>Suggestions</p>
          <ol style={{ margin: 0, paddingLeft: 16, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {item.suggestions.map((s, i) => (
              <li key={i} style={{ fontSize: 13, color: '#d1d5db', lineHeight: 1.6 }}>{s}</li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}

function ScoreBody({ item }: { item: ScoreResult }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingTop: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
        {[
          { label: 'Content Quality', score: item.contentScore },
          { label: 'Impact & Achievements', score: item.impactScore },
          { label: 'Keyword Density', score: item.keywordScore },
          { label: 'Format & Structure', score: item.formatScore },
        ].map(({ label, score }) => (
          <div key={label}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 12, color: '#64748b' }}>{label}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: scoreColor(score) }}>{score}</span>
            </div>
            <ScoreBar value={score} color={scoreColor(score)} height={4} />
          </div>
        ))}
      </div>
      {item.atsKeywordsFound.length > 0 && (
        <div>
          <p style={{ margin: '0 0 6px', fontSize: 13, fontWeight: 600, color: '#9ca3af' }}>Keywords Found</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            {item.atsKeywordsFound.map((k) => <Chip key={k} label={k} variant="indigo" />)}
          </div>
        </div>
      )}
      {item.suggestions.length > 0 && (
        <div>
          <p style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 600, color: '#9ca3af' }}>Improvement Tips</p>
          <ol style={{ margin: 0, paddingLeft: 16, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {item.suggestions.map((s, i) => (
              <li key={i} style={{ fontSize: 13, color: '#d1d5db', lineHeight: 1.6 }}>{s}</li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
