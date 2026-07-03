import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import HistoryCard from '../components/HistoryCard';
import SkeletonCard from '../components/SkeletonCard';
import Toast, { useToast } from '../components/Toast';
import type { MatchResult } from '../components/MatchResultPanel';
import type { ScoreResult } from '../components/ScoreResultPanel';
import { Link } from '../router';
import api from '../api';
import { ArrowRight } from 'lucide-react';

type HistoryItem = MatchResult | ScoreResult;
type Filter = 'all' | 'match' | 'score';

function FilterTab({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        padding: '6px 16px',
        borderRadius: 8,
        border: 'none',
        cursor: 'pointer',
        fontSize: 13,
        fontWeight: 500,
        backgroundColor: active ? '#e2e8f0' : hover ? '#ffffff' : 'transparent',
        color: active ? '#1a1a1a' : hover ? '#374151' : '#64748b',
        transition: 'all 0.2s ease',
      }}
    >
      {children}
    </button>
  );
}

export default function History() {
  const { toasts, addToast, removeToast } = useToast();
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>('all');

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/api/analysis/history');
        setItems(res.data);
      } catch (err: any) {
        if (err.response?.status !== 401) {
          addToast('Could not load history. Try refreshing.', 'error');
        }
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const filtered = items.filter((item) => {
    if (filter === 'all') return true;
    return item.type === filter;
  });

  const handleDeleteItem = async (id: string) => {
    if (!window.confirm('Delete this history entry?')) return;

    try {
      await api.delete(`/api/analysis/history/${id}`);
      setItems((prev) => prev.filter((item) => item._id !== id));
    } catch (err: any) {
      addToast('Could not delete history item. Try again.', 'error');
    }
  };

  const handleClearHistory = async () => {
    if (!window.confirm('Clear all history? This cannot be undone.')) return;

    try {
      await api.delete('/api/analysis/history');
      setItems([]);
    } catch (err: any) {
      addToast('Could not clear history. Try again.', 'error');
    }
  };

  return (
    <div style={{ backgroundColor: '#f0efea', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 24px' }}>
<div style={{ marginBottom: 28, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ margin: '0 0 6px', fontSize: 26, fontWeight: 700, color: '#1a1a1a', letterSpacing: '-0.5px' }}>
            Analysis History
          </h1>
          <p style={{ margin: 0, fontSize: 15, color: '#64748b' }}>
            All your past resume analyses, newest first.
          </p>
        </div>
        <button
          type="button"
          onClick={handleClearHistory}
          style={{
            padding: '10px 16px',
            borderRadius: 10,
            border: '1px solid #e2e8f0',
            backgroundColor: '#ffffff',
            color: '#374151',
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Clear History
        </button>
        </div>

        {/* Filter tabs */}
        <div style={{
          display: 'flex',
          gap: 4,
          marginBottom: 24,
          padding: 4,
          backgroundColor: '#f0efea',
          border: '1px solid #e2e8f0',
          borderRadius: 10,
          width: 'fit-content',
        }}>
          <FilterTab active={filter === 'all'} onClick={() => setFilter('all')}>All</FilterTab>
          <FilterTab active={filter === 'match'} onClick={() => setFilter('match')}>Resume Matcher</FilterTab>
          <FilterTab active={filter === 'score'} onClick={() => setFilter('score')}>Resume Score</FilterTab>
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState hasItems={items.length > 0} />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filtered.map((item) => (
              <HistoryCard key={item._id} item={item} onDelete={item._id ? handleDeleteItem : undefined} />
            ))}
          </div>
        )}
      </div>
      <Toast toasts={toasts} onRemove={removeToast} />
    </div>
  );
}

function EmptyState({ hasItems }: { hasItems: boolean }) {
  return (
    <div style={{ textAlign: 'center', padding: '80px 20px' }}>
      <div style={{
        width: 60,
        height: 60,
        borderRadius: 16,
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 16px',
        fontSize: 28,
      }}>
        📋
      </div>
      <h3 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 600, color: '#1a1a1a' }}>
        {hasItems ? 'No results for this filter' : 'No analyses yet.'}
      </h3>
      <p style={{ margin: '0 0 24px', fontSize: 14, color: '#64748b' }}>
        {hasItems ? 'Try a different filter above.' : 'Run your first resume analysis to see it here.'}
      </p>
      {!hasItems && (
        <Link
          to="/dashboard"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '10px 20px',
            borderRadius: 10,
            textDecoration: 'none',
            backgroundColor: '#6366f1',
            color: '#fff',
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          Run your first analysis <ArrowRight size={14} />
        </Link>
      )}
    </div>
  );
}
