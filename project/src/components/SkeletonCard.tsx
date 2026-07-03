export default function SkeletonCard() {
  return (
    <div style={{
      backgroundColor: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: 16,
      padding: '20px 24px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div className="skeleton" style={{ height: 18, width: '45%', borderRadius: 6 }} />
        <div className="skeleton" style={{ height: 24, width: 60, borderRadius: 999 }} />
      </div>
      <div className="skeleton" style={{ height: 13, width: '30%', borderRadius: 4, marginBottom: 16 }} />
      <div style={{ display: 'flex', gap: 8 }}>
        <div className="skeleton" style={{ height: 26, width: 80, borderRadius: 999 }} />
        <div className="skeleton" style={{ height: 26, width: 100, borderRadius: 999 }} />
      </div>
    </div>
  );
}
