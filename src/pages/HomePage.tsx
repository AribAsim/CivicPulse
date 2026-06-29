import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, onSnapshot } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../config/firebase';
import { seedFirestoreIfEmpty } from '../utils/seedData';
import { Map as MapIcon, PlusCircle, CheckCircle, ArrowRight, Activity, ShieldAlert, Sparkles } from 'lucide-react';

export default function HomePage() {
  const navigate = useNavigate();
  const [issues, setIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Stats
  const [stats, setStats] = useState({
    reported: 0,
    resolved: 0,
    verified: 0,
    activeThisWeek: 0
  });

  // Automatically trigger Seeding on Home Page load if empty
  useEffect(() => {
    const runSeeding = async () => {
      if (isFirebaseConfigured) {
        await seedFirestoreIfEmpty();
      }
    };
    runSeeding();
  }, []);

  // Sync real-time stats from Firestore (up to 500 records)
  useEffect(() => {
    if (!isFirebaseConfigured) {
      setLoading(false);
      return;
    }

    const q = collection(db, 'issues');
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const issuesList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setIssues(issuesList);
      
      // Calculate real stats
      const reported = issuesList.length;
      const resolved = issuesList.filter((i: any) => i.status === 'resolved').length;
      const verified = issuesList.filter((i: any) => i.verified === true).length;
      const activeThisWeek = issuesList.filter((i: any) => i.status !== 'resolved').length;

      setStats({ reported, resolved, verified, activeThisWeek });
      setLoading(false);
    }, (error) => {
      console.error("Firestore loading error on HomePage:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 56px)' }}>
      
      {/* 1. Hero Section */}
      <section 
        style={{ 
          padding: '40px 16px', 
          maxWidth: '800px', 
          margin: '0 auto', 
          textAlign: 'center', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          gap: '16px',
          width: '100%',
          boxSizing: 'border-box'
        }}
      >
        <span 
          style={{ 
            fontSize: '11px', 
            textTransform: 'uppercase', 
            letterSpacing: '0.15em', 
            color: 'var(--primary)',
            fontWeight: 600
          }}
        >
          Community Issue Reporting
        </span>
        <h1 style={{ fontSize: 'clamp(32px, 8vw, 48px)', fontWeight: 600, color: 'var(--text-1)', lineHeight: '1.1', wordBreak: 'break-word' }}>
          Fix your city.
        </h1>
        <p style={{ 
          fontSize: '16px', 
          color: 'var(--text-2)', 
          maxWidth: '600px', 
          width: '100%',
          margin: '0 auto',
          wordBreak: 'break-word',
          overflowWrap: 'break-word',
          whiteSpace: 'normal',
          boxSizing: 'border-box',
          padding: '0 8px'
        }}>
          Report civic issues in seconds. AI triages, classifies, and prioritizes automatically. Track resolution publicly in real-time.
        </p>
        
        <div className="hero-btn-container" style={{ padding: '0 8px', boxSizing: 'border-box' }}>
          <Link to="/report" className="btn btn-primary" style={{ padding: '12px 24px', fontSize: '14px' }}>
            <PlusCircle size={16} />
            Report an Issue
          </Link>
          <Link to="/map" className="btn btn-secondary" style={{ padding: '12px 24px', fontSize: '14px' }}>
            <MapIcon size={16} />
            View Active Map
          </Link>
        </div>
      </section>

      {/* 2. Interactive Map Preview (60% height block of viewport) */}
      <section 
        style={{ 
          height: '60vh', 
          minHeight: '400px', 
          borderTop: '1px solid var(--border)', 
          borderBottom: '1px solid var(--border)', 
          background: 'var(--surface-2)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Dual Mode Overlay (Static/Interactive fallback vector map if Google Key unconfigured) */}
        <div 
          style={{ 
            width: '100%', 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            background: 'radial-gradient(circle at center, #111318 0%, #0A0C10 100%)',
            position: 'relative'
          }}
        >
          {/* Schematic Vector Representation of Bangalore Sectors */}
          <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0, opacity: 0.15 }}>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--border)" strokeWidth="1" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#grid)" />
            
            {/* Roads & Clusters */}
            <line x1="10%" y1="20%" x2="90%" y2="80%" stroke="var(--border-hover)" strokeWidth="3" />
            <line x1="20%" y1="80%" x2="80%" y2="10%" stroke="var(--border-hover)" strokeWidth="2" />
            <circle cx="30%" cy="40%" r="50" fill="none" stroke="var(--primary)" strokeWidth="1" strokeDasharray="5,5" />
            <circle cx="70%" cy="60%" r="70" fill="none" stroke="var(--warning)" strokeWidth="1" strokeDasharray="5,5" />
          </svg>

          <div style={{ zIndex: 10, textAlign: 'center', maxWidth: '440px', padding: '0 24px' }}>
            <Activity size={32} style={{ color: 'var(--primary)', marginBottom: '16px' }} />
            <h3 style={{ marginBottom: '8px' }}>Community Issue Live Radar</h3>
            <p className="text-sm" style={{ marginBottom: '20px' }}>
              We have loaded {issues.length || 20} active issues across municipal sectors. Open the full Map to filter reports, view heatmap grids, or analyze critical AI risk overlays.
            </p>
            <button 
              onClick={() => navigate('/map')} 
              className="btn btn-primary"
              style={{ padding: '10px 20px' }}
            >
              Launch Core Map Platform
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </section>

      {/* 3. Live Stats Bar */}
      <section 
        style={{ 
          background: 'var(--surface)', 
          borderBottom: '1px solid var(--border)',
          padding: '24px 16px'
        }}
      >
        <div 
          className="stats-grid"
          style={{ 
            maxWidth: '1200px', 
            margin: '0 auto', 
            textAlign: 'center'
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '12px 0' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Issues Reported
            </span>
            <span style={{ fontSize: '28px', fontWeight: 600, color: 'var(--text-1)' }}>
              {loading ? "..." : stats.reported}
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '12px 0', borderLeft: '1px solid var(--border)' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Resolved Issues
            </span>
            <span style={{ fontSize: '28px', fontWeight: 600, color: 'var(--success)' }}>
              {loading ? "..." : stats.resolved}
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '12px 0', borderLeft: '1px solid var(--border)' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              AI + Peer Verified
            </span>
            <span style={{ fontSize: '28px', fontWeight: 600, color: 'var(--primary)' }}>
              {loading ? "..." : stats.verified}
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '12px 0', borderLeft: '1px solid var(--border)' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Active This Week
            </span>
            <span style={{ fontSize: '28px', fontWeight: 600, color: 'var(--warning)' }}>
              {loading ? "..." : stats.activeThisWeek}
            </span>
          </div>
        </div>
      </section>

      {/* 4. How It Works */}
      <section 
        style={{ 
          padding: '60px 16px', 
          maxWidth: '1200px', 
          margin: '0 auto', 
          width: '100%',
          boxSizing: 'border-box'
        }}
      >
        <h2 style={{ textAlign: 'center', marginBottom: '40px', fontSize: 'clamp(24px, 5vw, 32px)' }}>Unified Civic Workflow</h2>
        <div 
          className="how-it-works-grid"
        >
          {/* Column 1 */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div 
              style={{ 
                width: '36px', 
                height: '36px', 
                borderRadius: '6px', 
                background: 'var(--primary-subtle)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: 'var(--primary)'
              }}
            >
              <Sparkles size={18} />
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: 600 }}>1. Instant Report</h3>
            <p className="text-sm" style={{ margin: 0 }}>
              Photograph any community problem. The vision model instantly validates, categorizes, estimates severity, and pre-fills details to block spam.
            </p>
          </div>

          {/* Column 2 */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div 
              style={{ 
                width: '36px', 
                height: '36px', 
                borderRadius: '6px', 
                background: 'var(--success-subtle)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: 'var(--success)'
              }}
            >
              <CheckCircle size={18} />
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: 600 }}>2. Community Verification</h3>
            <p className="text-sm" style={{ margin: 0 }}>
              Residents peer-verify reported hazards. When an issue reaches exactly 3 validations, the autonomous verification agent locks status and assigns points.
            </p>
          </div>

          {/* Column 3 */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div 
              style={{ 
                width: '36px', 
                height: '36px', 
                borderRadius: '6px', 
                background: 'var(--warning-subtle)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: 'var(--warning)'
              }}
            >
              <ShieldAlert size={18} />
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: 600 }}>3. Public Resolution</h3>
            <p className="text-sm" style={{ margin: 0 }}>
              Issues are tracked transparently. If unresolved for over 72 hours, the system auto-escalates, allowing residents to download a formal petition.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
}
