interface StreamingPanelProps {
  stage: number;
  text: string;
}

const STAGES = [
  '📄 Extracting text from your resume...',
  '🔍 Comparing against job description...',
  '✨ Generating your personalized insights...',
];

export default function StreamingPanel({ stage, text }: StreamingPanelProps) {
  return (
    <div style={{
      backgroundColor: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: 16,
      padding: '28px 24px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 20,
    }}>
      <div style={{
        width: 12,
        height: 12,
        borderRadius: '50%',
        backgroundColor: '#6366f1',
        animation: 'pulse-dot 1.5s ease-in-out infinite',
      }} />

      <p style={{
        margin: 0,
        fontSize: 15,
        color: '#374151',
        fontWeight: 500,
        textAlign: 'center',
        transition: 'all 0.3s ease',
      }}>
        {STAGES[Math.min(stage, STAGES.length - 1)]}
      </p>

      {text && (
        <div style={{
          width: '100%',
          maxHeight: 280,
          overflowY: 'auto',
          padding: '14px 16px',
          borderRadius: 10,
          backgroundColor: '#f0efea',
          border: '1px solid #e2e8f0',
          fontFamily: 'monospace',
          fontSize: 13,
          lineHeight: 1.7,
          color: '#9ca3af',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}>
          {text}
          <span className="animate-blink" style={{ marginLeft: 1, color: '#6366f1', fontWeight: 700 }}>|</span>
        </div>
      )}
    </div>
  );
}
