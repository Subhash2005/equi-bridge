import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import JoinModal from './JoinModal'

/**
 * SegmentHeader – shows a segment badge + title + login button (top-right)
 * for each of the 3 segment entry pages.
 *
 * Props:
 *   badge      – e.g. "🎓 Student"
 *   badgeClass – CSS class: "badge-teal" | "badge-amber" | "badge-purple"
 *   title      – JSX for the <h1>
 *   subtitle   – plain string subtitle
 *   color      – accent hex color for the login button
 */
export default function SegmentHeader({ badge, badgeClass, title, subtitle, color = '#00d4aa' }) {
    const { user } = useAuth()
    const [showModal, setShowModal] = useState(false)

    return (
        <>
            {/* Top-right login button – only shown when not logged in */}
            {!user && (
                <div style={{
                    position: 'fixed',
                    top: 72,          // just below the main navbar (64px)
                    right: 24,
                    zIndex: 90,
                }}>
                    <button
                        onClick={() => setShowModal(true)}
                        style={{
                            background: `${color}18`,
                            border: `1px solid ${color}55`,
                            color: color,
                            fontWeight: 700,
                            fontSize: 14,
                            padding: '9px 20px',
                            borderRadius: 10,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            backdropFilter: 'blur(12px)',
                            transition: 'all 0.2s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = `${color}30`}
                        onMouseLeave={e => e.currentTarget.style.background = `${color}18`}
                    >
                        🔑 Login / Register
                    </button>
                </div>
            )}

            {/* Segment heading */}
            <div style={{ marginBottom: 32 }}>
                <div className={`badge ${badgeClass}`} style={{ marginBottom: 12 }}>{badge}</div>
                <h1 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 36, marginBottom: 8 }}>
                    {title}
                </h1>
                {subtitle && (
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 15 }}>{subtitle}</p>
                )}

                {/* Logged-in user pill */}
                {user && (
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 999, padding: '5px 14px' }}>
                        <span style={{ fontSize: 14 }}>👤</span>
                        <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>{user.email}</span>
                        <span style={{ fontSize: 11, color: color, fontWeight: 600, background: `${color}18`, padding: '2px 8px', borderRadius: 999 }}>✓ Logged in</span>
                    </div>
                )}
            </div>

            {showModal && <JoinModal onClose={() => setShowModal(false)} />}
        </>
    )
}
