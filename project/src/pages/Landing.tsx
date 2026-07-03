import React, { useState } from 'react';
import { Link } from '../router';
import { ArrowRight, Target, Search, Lightbulb } from 'lucide-react';

function NavButton({ children, filled, to }: { children: React.ReactNode; filled?: boolean; to: string }) {
  const [hover, setHover] = useState(false);
  return (
    <Link
      to={to}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        padding: '7px 16px',
        borderRadius: 10,
        fontSize: 14,
        fontWeight: 500,
        textDecoration: 'none',
        border: filled ? 'none' : '1px solid #e2e8f0',
        backgroundColor: filled ? (hover ? '#4f46e5' : '#6366f1') : (hover ? '#ffffff' : 'transparent'),
        color: filled ? '#fff' : '#1a1a1a',
        transition: 'all 0.2s ease',
      }}
    >
      {children}
    </Link>
  );
}

function FeatureCard({ icon: Icon, title, desc }: { icon: React.ElementType; title: string; desc: string }) {
  const [hover, setHover] = useState(false);
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        flex: 1,
        minWidth: 240,
        backgroundColor: '#ffffff',
        border: `1px solid ${hover ? '#cbd5e1' : '#e2e8f0'}`,
        borderRadius: 18,
        padding: '28px 24px',
        transition: 'all 0.2s ease',
        transform: hover ? 'translateY(-2px)' : 'none',
      }}
    >
      <div style={{
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: 'rgba(99,102,241,0.12)',
        border: '1px solid rgba(99,102,241,0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
      }}>
        <Icon size={22} color="#6366f1" />
      </div>
      <h3 style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 600, color: '#1a1a1a' }}>{title}</h3>
      <p style={{ margin: 0, fontSize: 14, color: '#6b7280', lineHeight: 1.6 }}>{desc}</p>
    </div>
  );
}

function StepCard({ num, title, desc }: { num: number; title: string; desc: string }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: 16,
      flex: 1,
      minWidth: 200,
    }}>
      <div style={{
        width: 36,
        height: 36,
        borderRadius: '50%',
        border: '2px solid #6366f1',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 15,
        fontWeight: 700,
        color: '#6366f1',
        flexShrink: 0,
      }}>{num}</div>
      <div>
        <h4 style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 600, color: '#1a1a1a' }}>{title}</h4>
        <p style={{ margin: 0, fontSize: 14, color: '#6b7280', lineHeight: 1.6 }}>{desc}</p>
      </div>
    </div>
  );
}

export default function Landing() {
  const [ctaHover, setCtaHover] = useState(false);
  const [ctaHover2, setCtaHover2] = useState(false);
  const [bannerHover, setBannerHover] = useState(false);
  const currentYear = new Date().getFullYear();

  return (
    <div style={{ backgroundColor: '#f0efea', minHeight: '100vh', color: '#1a1a1a' }}>
      {/* Navbar */}
      <nav style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backgroundColor: 'rgba(255,255,255,0.82)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(15, 23, 42, 0.08)',
        boxShadow: '0 1px 20px rgba(15, 23, 42, 0.04)',
      }}>
        <div style={{
          maxWidth: 1100,
          margin: '0 auto',
          padding: '0 24px',
          height: 62,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              backgroundColor: '#6366f1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: 16,
              color: '#fff',
            }}>R</div>
            <span style={{ fontWeight: 700, fontSize: 17, letterSpacing: '-0.3px', color: '#1a1a1a' }}>ResuMatch</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <NavButton to="/login">Sign In</NavButton>
            <NavButton to="/signup" filled>Get Started Free</NavButton>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '96px 24px 80px', textAlign: 'center' }}>
        <div style={{
          display: 'inline-block',
          padding: '5px 14px',
          borderRadius: 999,
          border: '1px solid rgba(99,102,241,0.3)',
          backgroundColor: 'rgba(99,102,241,0.08)',
          fontSize: 13,
          color: '#a5b4fc',
          fontWeight: 500,
          marginBottom: 28,
        }}>
          AI-Powered Resume Analysis
        </div>

        <h1 style={{
          margin: '0 0 20px',
          fontSize: 'clamp(36px, 6vw, 64px)',
          fontWeight: 800,
          lineHeight: 1.1,
          letterSpacing: '-1.5px',
          color: '#1a1a1a',
        }}>
          Land More Interviews.<br />
          <span style={{ color: '#6366f1' }}>Match Your Resume</span> to<br />
          Any Job in Seconds.
        </h1>

        <p style={{
          margin: '0 auto 36px',
          maxWidth: 560,
          fontSize: 18,
          color: '#64748b',
          lineHeight: 1.7,
        }}>
          AI-powered resume analysis that shows your match score, missing keywords,
          and exactly what to fix — in real time.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
          <Link
            to="/signup"
            onMouseEnter={() => setCtaHover(true)}
            onMouseLeave={() => setCtaHover(false)}
            style={{
              padding: '13px 28px',
              borderRadius: 10,
              fontSize: 15,
              fontWeight: 600,
              textDecoration: 'none',
              backgroundColor: ctaHover ? '#4f46e5' : '#6366f1',
              color: '#fff',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            Analyze My Resume <ArrowRight size={16} />
          </Link>
          <a
            href="#how-it-works"
            onMouseEnter={() => setCtaHover2(true)}
            onMouseLeave={() => setCtaHover2(false)}
            onClick={(e) => {
              e.preventDefault();
              document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
            }}
            style={{
              padding: '13px 28px',
              borderRadius: 10,
              fontSize: 15,
              fontWeight: 600,
              textDecoration: 'none',
              backgroundColor: ctaHover2 ? '#111118' : 'transparent',
              border: '1px solid #3b82f6',
              color: '#2563eb',
              transition: 'all 0.2s ease',
            }}
          >
            See How It Works
          </a>
        </div>

        <p style={{ margin: 0, fontSize: 13, color: '#4b5563' }}>
          Free to use &nbsp;·&nbsp; No credit card &nbsp;·&nbsp; Instant results
        </p>
      </section>

      {/* Feature cards */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px 96px' }}>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <FeatureCard
            icon={Target}
            title="Match Score"
            desc="See exactly how well your resume matches any job description with a real-time AI score."
          />
          <FeatureCard
            icon={Search}
            title="ATS Keyword Check"
            desc="Find every missing keyword that ATS systems use to filter out resumes before humans see them."
          />
          <FeatureCard
            icon={Lightbulb}
            title="AI Suggestions"
            desc="Get specific, actionable improvements tailored to your resume and the job you're applying for."
          />
        </div>
      </section>

      {/* How it works */}
      <section
        id="how-it-works"
        style={{
          borderTop: '1px solid #e2e8f0',
          borderBottom: '1px solid #e2e8f0',
          backgroundColor: '#f8fafc',
          scrollMarginTop: 86,
        }}
      >
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '80px 24px' }}>
          <h2 style={{ textAlign: 'center', margin: '0 0 56px', fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 700, letterSpacing: '-0.5px' }}>
            How It Works
          </h2>
          <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap', justifyContent: 'center' }}>
            <StepCard num={1} title="Upload your resume PDF" desc="Drop your resume or click to select. We accept PDF files up to 10MB." />
            <StepCard num={2} title="Paste the job description" desc="Copy the full job listing from any job board and paste it into the tool." />
            <StepCard num={3} title="Get your AI analysis" desc="Receive a match score, keyword gaps, strengths, and improvement suggestions in seconds." />
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '80px 24px' }}>
        <div style={{
          textAlign: 'center',
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: 24,
          padding: '64px 32px',
        }}>
          <h2 style={{ margin: '0 0 16px', fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 700, letterSpacing: '-0.5px' }}>
            Ready to get more interviews?
          </h2>
          <p style={{ margin: '0 0 32px', fontSize: 16, color: '#64748b' }}>
            Join thousands of job seekers who optimized their resumes with ResuMatch.
          </p>
          <Link
            to="/signup"
            onMouseEnter={() => setBannerHover(true)}
            onMouseLeave={() => setBannerHover(false)}
            style={{
              padding: '13px 32px',
              borderRadius: 10,
              fontSize: 15,
              fontWeight: 600,
              textDecoration: 'none',
              backgroundColor: bannerHover ? '#4f46e5' : '#6366f1',
              color: '#fff',
              transition: 'all 0.2s ease',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            Start Analyzing Free <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(15, 23, 42, 0.08)', padding: '24px 24px' }}>
        <div style={{
          maxWidth: 1100,
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 26,
              height: 26,
              borderRadius: 6,
              backgroundColor: '#6366f1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: 13,
              color: '#fff',
            }}>R</div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 15, color: '#1a1a1a' }}>ResuMatch</div>
              <div style={{ fontSize: 13, color: '#64748b' }}>AI-powered resume analysis for smarter job applications.</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 13, color: '#4b5563' }}>© {currentYear} ResuMatch</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
