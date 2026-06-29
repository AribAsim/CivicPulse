import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, doc, getDoc, getDocs, limit, query, where, orderBy } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../config/firebase';
import { 
  Award, CheckCircle, TrendingUp, AlertCircle, Sparkles, 
  ChevronRight, Calendar, User, ShieldAlert 
} from 'lucide-react';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // Stats & Analytics states
  const [healthScore, setHealthScore] = useState(85);
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    resolved: 0,
    verified: 0,
    avgSeverity: 3
  });

  const [areaSummary, setAreaSummary] = useState('');
  const [categoryCounts, setCategoryCounts] = useState<{ [key: string]: number }>({
    pothole: 0,
    streetlight: 0,
    water: 0,
    waste: 0,
    other: 0
  });

  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [resolutions, setResolutions] = useState<any[]>([]);

  // Load and cache summary briefing / health statistics
  useEffect(() => {
    if (!isFirebaseConfigured) {
      setLoading(false);
      return;
    }

    const loadDashboardData = async () => {
      try {
        // 1. Fetch Area Summary (Check sessionStorage cache first for 10-minute rate limit safeguard)
        const cachedSummary = sessionStorage.getItem('civicpulse_area_summary');
        const cachedTime = sessionStorage.getItem('civicpulse_area_summary_time');
        const now = Date.now();

        if (cachedSummary && cachedTime && (now - parseInt(cachedTime)) < 10 * 60 * 1000) {
          setAreaSummary(cachedSummary);
        } else {
          const summarySnap = await getDoc(doc(db, 'analytics', 'summary'));
          if (summarySnap.exists()) {
            const txt = summarySnap.data().summaryText;
            setAreaSummary(txt);
            sessionStorage.setItem('civicpulse_area_summary', txt);
            sessionStorage.setItem('civicpulse_area_summary_time', now.toString());
          } else {
            setAreaSummary("Municipal and community operations are balanced. Focus is directed on pothole repairs and lighting safety in central residential zones.");
          }
        }

        // 2. Fetch Health Score document
        const healthSnap = await getDoc(doc(db, 'analytics', 'healthScore'));
        let calculatedScore = 85;
        if (healthSnap.exists()) {
          const data = healthSnap.data();
          calculatedScore = data.score || 85;
          setHealthScore(calculatedScore);
          setStats({
            total: data.totalIssues || 0,
            open: data.openCount || 0,
            resolved: data.resolvedCount || 0,
            verified: data.verifiedCount || 0,
            avgSeverity: data.avgSeverity || 3
          });
        }

        // 3. Load all issues to calculate Category Hotspots
        const issuesSnap = await getDocs(collection(db, 'issues'));
        const counts: { [key: string]: number } = { pothole: 0, streetlight: 0, water: 0, waste: 0, other: 0 };
        const resolvedList: any[] = [];

        issuesSnap.docs.forEach((docSnap) => {
          const issue = docSnap.data();
          const cat = issue.category || 'other';
          if (counts[cat] !== undefined) {
            counts[cat]++;
          } else {
            counts['other']++;
          }

          if (issue.status === 'resolved') {
            resolvedList.push({
              id: docSnap.id,
              ...issue
            });
          }
        });

        setCategoryCounts(counts);

        // Sort resolved list by resolvedAt or date desc
        resolvedList.sort((a, b) => {
          const tA = a.resolvedAt?.seconds || 0;
          const tB = b.resolvedAt?.seconds || 0;
          return tB - tA;
        });
        setResolutions(resolvedList.slice(0, 5));

        // 4. Fetch Leaderboard (Users ordered by points desc)
        const usersSnap = await getDocs(collection(db, 'users'));
        const usersList = usersSnap.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
        usersList.sort((a: any, b: any) => (b.points || 0) - (a.points || 0));
        setLeaderboard(usersList.slice(0, 10));

      } catch (err) {
        console.error("Failed to load dashboard statistics:", err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  // Determine health score indicator colors
  const getHealthColorClass = (score: number) => {
    if (score >= 80) return { color: 'var(--success)', label: 'OPTIMAL' };
    if (score >= 50) return { color: 'var(--warning)', label: 'ELEVATED' };
    return { color: 'var(--danger)', label: 'CRITICAL' };
  };

  const healthMeta = getHealthColorClass(healthScore);

  // Dynamic circular stroke math
  const strokeRadius = 40;
  const strokeCircumference = 2 * Math.PI * strokeRadius;
  const strokeDashoffset = strokeCircumference - (healthScore / 100) * strokeCircumference;

  return (
    <div style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 24px' }}>
      
      {/* Page Title */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ marginBottom: '6px' }}>Municipal Analytics & Intelligence</h1>
        <p style={{ color: 'var(--text-2)' }}>
          Real-time community health scores, AI-summarized insights, and citizen resolution leadership tracker.
        </p>
      </div>

      {/* TOP SECTION: Health Score & Area Summary */}
      <div className="grid-dashboard-top" style={{ gap: '24px', marginBottom: '32px' }}>
        
        {/* Dynamic Health Score Card */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '24px', justifyContent: 'center' }}>
          
          {/* Radial Gauge */}
          <div style={{ position: 'relative', width: '100px', height: '100px' }}>
            <svg width="100" height="100" style={{ transform: 'rotate(-90deg)' }}>
              {/* Back Circle */}
              <circle 
                cx="50" cy="50" r={strokeRadius} 
                fill="transparent" 
                stroke="var(--border)" 
                strokeWidth="6" 
              />
              {/* Progress Circle */}
              <circle 
                cx="50" cy="50" r={strokeRadius} 
                fill="transparent" 
                stroke={healthMeta.color} 
                strokeWidth="6" 
                strokeDasharray={strokeCircumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 0.5s ease-out' }}
              />
            </svg>
            <div 
              style={{ 
                position: 'absolute', 
                top: 0, left: 0, right: 0, bottom: 0, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                flexDirection: 'column'
              }}
            >
              <span style={{ fontSize: '24px', fontWeight: 600, color: 'var(--text-1)', lineHeight: '1' }}>
                {healthScore}
              </span>
              <span style={{ fontSize: '10px', color: 'var(--text-3)', fontWeight: 600 }}>
                SCORE
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Ward Health index
            </span>
            <span style={{ fontSize: '18px', fontWeight: 600, color: healthMeta.color }}>
              {healthMeta.label}
            </span>
            <span style={{ fontSize: '12px', color: 'var(--text-3)' }}>
              Computed from {stats.open} unresolved of {stats.total} total reports.
            </span>
          </div>

        </div>

        {/* Area Summary Card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '10px', justifyContent: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={16} style={{ color: 'var(--primary)' }} />
            <h3 style={{ fontSize: '14px', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Area Summary
            </h3>
          </div>
          <p className="text-sm" style={{ margin: 0, color: 'var(--text-1)', lineHeight: '1.5' }}>
            {areaSummary}
          </p>
          <span style={{ fontSize: '10px', color: 'var(--text-3)' }}>
            ⚡ Autonomous Summary Agent briefing. Updates periodically.
          </span>
        </div>

      </div>

      {/* THREE COLUMNS BELOW: Hotspots, Leaderboard, Resolutions */}
      <div className="grid-dashboard-main" style={{ gap: '24px', alignItems: 'start' }}>
        
        {/* Column 1: Category Hotspots */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', minHeight: '420px', minWidth: 0, width: '100%' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '4px' }}>Category Hotspots</h3>
            <span style={{ fontSize: '11px', color: 'var(--text-3)' }}>Concentration of municipal distress logs</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '8px' }}>
            {Object.entries(categoryCounts).map(([cat, count]) => {
              // Calculate width %
              const maxCount = Math.max(...(Object.values(categoryCounts) as number[]), 1);
              const percentage = ((count as number) / maxCount) * 100;

              // Color mappings
              let fill = 'var(--primary)';
              if (cat === 'streetlight') fill = 'var(--warning)';
              if (cat === 'water') fill = 'var(--info)';
              if (cat === 'waste') fill = 'var(--success)';

              return (
                <div key={cat} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                    <span style={{ textTransform: 'capitalize', color: 'var(--text-1)', fontWeight: 500 }}>{cat}</span>
                    <span style={{ color: 'var(--text-2)', fontFamily: 'var(--font-mono)' }}>{count} logs</span>
                  </div>
                  <div style={{ height: '8px', background: 'var(--surface-2)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div 
                      style={{ 
                        height: '100%', 
                        width: `${percentage}%`, 
                        background: fill, 
                        borderRadius: '4px',
                        transition: 'width 0.6s ease' 
                      }} 
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Column 2: Citizen Leaderboard */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', minHeight: '420px', minWidth: 0, width: '100%' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '4px' }}>Citizen Leaderboard</h3>
            <span style={{ fontSize: '11px', color: 'var(--text-3)' }}>Top ward advocates and resolution scorecards</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto', maxHeight: '340px' }}>
            {leaderboard.length > 0 ? (
              leaderboard.map((user, idx) => (
                <div 
                  key={user.uid} 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    paddingBottom: '8px',
                    borderBottom: '1px solid var(--border)',
                    gap: '12px',
                    width: '100%',
                    minWidth: 0
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-3)', width: '16px', flexShrink: 0 }}>
                      {idx + 1}
                    </div>
                    <img 
                      src={user.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.displayName}`} 
                      alt={user.displayName}
                      style={{ width: '28px', height: '28px', borderRadius: '50%', border: '1px solid var(--border)', flexShrink: 0 }}
                    />
                    <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1 }}>
                      <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {user.displayName}
                      </span>
                      {/* Badge chips */}
                      <div style={{ display: 'flex', gap: '4px', marginTop: '2px', flexWrap: 'wrap' }}>
                        {(user.badges || []).slice(0, 2).map((badge: string) => (
                          <span 
                            key={badge} 
                            style={{ 
                              fontSize: '8px', 
                              padding: '1px 4px', 
                              background: 'var(--primary-subtle)', 
                              color: 'var(--primary)', 
                              borderRadius: '2px',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            🏆 {badge.split(' ')[0]}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-1)', fontFamily: 'var(--font-mono)', flexShrink: 0 }}>
                    {user.points || 0} pts
                  </span>
                </div>
              ))
            ) : (
              <span className="text-sm text-center" style={{ color: 'var(--text-3)' }}>Leaderboard seeding...</span>
            )}
          </div>
        </div>

        {/* Column 3: Recent Resolutions Feed */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', minHeight: '420px', minWidth: 0, width: '100%' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '4px' }}>Recent Resolutions</h3>
            <span style={{ fontSize: '11px', color: 'var(--text-3)' }}>Verified public repair completions</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', overflowY: 'auto', maxHeight: '340px' }}>
            {resolutions.length > 0 ? (
              resolutions.map((res) => {
                const dateClose = res.resolvedAt?.seconds 
                  ? new Date(res.resolvedAt.seconds * 1000).toLocaleDateString()
                  : "Recently";

                return (
                  <div 
                    key={res.id} 
                    onClick={() => navigate(`/issue/${res.id}`)}
                    style={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: '4px',
                      padding: '8px 12px',
                      background: 'var(--surface-2)',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      border: '1px solid transparent',
                      transition: 'all 0.2s ease',
                      width: '100%',
                      minWidth: 0
                    }}
                    className="hover-card"
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', width: '100%', minWidth: 0 }}>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                        <CheckCircle size={12} />
                        RESOLVED
                      </span>
                      <span className="text-mono" style={{ fontSize: '9px', color: 'var(--text-3)', flexShrink: 0 }}>
                        {dateClose}
                      </span>
                    </div>

                    <h4 style={{ fontSize: '13px', fontWeight: 500, margin: 0, color: 'var(--text-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {res.title}
                    </h4>

                    <p className="text-xs" style={{ margin: 0, color: 'var(--text-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {res.verificationReason || "Closed successfully by ward operators."}
                    </p>
                  </div>
                );
              })
            ) : (
              <span className="text-sm text-center" style={{ color: 'var(--text-3)', padding: '24px 0' }}>
                Awaiting resolution events. Go to details page and click 'Set Resolved' to log closure events.
              </span>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
