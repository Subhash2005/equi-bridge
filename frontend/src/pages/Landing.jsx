import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import JoinModal from '../components/JoinModal'
import Chatbot from '../components/Chatbot'

const SEGMENTS = [
    {
        id: 'student',
        emoji: <span className="notranslate">🎓</span>,
        label: 'Student',
        desc: 'Dream-to-career pipelines with sponsor backing',
        path: '/student',
        color: '#00d483ff',
        gradient: 'linear-gradient(135deg, rgba(177, 194, 191, 0.15), rgba(0,180,216,0.08))',
        border: 'rgba(0,212,170,0.3)',
    },
    {
        id: 'daily',
        emoji: <span className="notranslate">🛠</span>,
        label: 'Daily Wager',
        desc: 'Local gig work with auto-invest micro savings',
        path: '/daily',
        color: '#f59e0b',
        gradient: 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(239,68,68,0.08))',
        border: 'rgba(245,158,11,0.3)',
    },
    {
        id: 'disability',
        emoji: <span className="notranslate">♿</span>,
        label: 'Disability',
        desc: 'Accessible job matching & inclusive employment',
        path: '/disability',
        color: '#8b5cf6',
        gradient: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(236,72,153,0.08))',
        border: 'rgba(139,92,246,0.3)',
    },
]

const STATS = [
    { value: '12,400+', label: 'Students Placed', emoji: <span className="notranslate">🎓</span> },
    { value: '₹2.8Cr', label: 'Wages Distributed', emoji: <span className="notranslate">💰</span> },
    { value: '3,200+', label: 'Inclusive Jobs', emoji: <span className="notranslate">♿</span> },
    { value: '98%', label: 'Success Rate', emoji: <span className="notranslate">📈</span> },
]

export default function Landing() {
    const { user } = useAuth()
    const [showModal, setShowModal] = useState(false)
    const navigate = useNavigate()

    const handleSegment = (path) => {
        if (!user) { setShowModal(true); return }
        navigate(path)
    }

    return (
        <div className="page-container" style={{ maxWidth: 1200 }}>
            {/* Hero */}
            <div style={{ textAlign: 'center', padding: '60px 0 80px' }}>
                <div className="badge badge-teal" style={{ marginBottom: 20, fontSize: 13 }}>
                    Cross-Segment Opportunity Exchange
                </div>
                <h1 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: 'clamp(40px, 6vw, 72px)', lineHeight: 1.1, marginBottom: 24 }}>
                    Bridge the Gap Between{' '}
                    <span className="gradient-text-teal">Dreams</span>{' '}
                    &amp;{' '}
                    <span className="gradient-text-purple">Opportunity</span>
                </h1>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 18, maxWidth: 600, margin: '0 auto 40px', lineHeight: 1.7 }}>
                    One unified platform connecting students, daily wage workers, and persons with disabilities to structured career pipelines, income generation, and financial growth.
                </p>

                {user ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 16 }}>
                        <span style={{ fontSize: 20 }}></span>
                        <span style={{ color: '#00d4aa', fontWeight: 600, fontSize: 20 }}>You have joined the EquiBridge Community</span>
                    </div>
                ) : (
                    <button className="btn-primary" style={{ fontSize: 17, padding: '14px 40px', marginBottom: 16 }} onClick={() => setShowModal(true)}>
                        Join EquiBridge
                    </button>
                )}
                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>Free to join · Real payments · Fully Integrated</p>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 80 }}>
                {STATS.map(s => (
                    <div key={s.label} className="glass" style={{ padding: '24px 20px', textAlign: 'center' }}>
                        <div style={{ fontSize: 28, marginBottom: 8 }}>{s.emoji}</div>
                        <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 28, color: '#fff', marginBottom: 4 }}>{s.value}</div>
                        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Segment Cards */}
            <div style={{ marginBottom: 60 }}>
                <h2 style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 32, textAlign: 'center', marginBottom: 12 }}>Choose Your Path</h2>
                <p style={{ color: 'rgba(255,255,255,0.5)', textAlign: 'center', marginBottom: 40, fontSize: 16 }}>
                    {user ? 'Select your segment to begin your journey' : 'Join first to unlock your opportunity segment'}
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
                    {SEGMENTS.map(seg => (
                        <div
                            key={seg.id}
                            className="card-hover"
                            onClick={() => handleSegment(seg.path)}
                            style={{
                                background: seg.gradient,
                                border: `1px solid ${user ? seg.border : 'rgba(255,255,255,0.06)'}`,
                                borderRadius: 20,
                                padding: 32,
                                cursor: user ? 'pointer' : 'not-allowed',
                                opacity: user ? 1 : 0.5,
                                position: 'relative',
                                overflow: 'hidden',
                            }}
                        >
                            {!user && (
                                <div style={{ position: 'absolute', top: 12, right: 12 }}>
                                    <span className="badge" style={{ background: 'rgba(0,0,0,0.4)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.1)', fontSize: 11 }}>🔒 Join First</span>
                                </div>
                            )}
                            <div style={{ fontSize: 52, marginBottom: 16 }}>{seg.emoji}</div>
                            <h3 style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 24, color: seg.color, marginBottom: 10 }}>{seg.label}</h3>
                            <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 15, lineHeight: 1.6, marginBottom: 20 }}>{seg.desc}</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: seg.color, fontWeight: 600, fontSize: 14 }}>
                                {user ? 'Get Started' : 'Locked'} <span>→</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* How it works */}
            <div className="glass" style={{ padding: '48px 40px', marginBottom: 60, textAlign: 'center' }}>
                <h2 style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 28, marginBottom: 40 }}>How EquiBridge Works</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 32 }}>
                    {[
                        { step: '01', title: 'Join', desc: 'Create your free account and choose your segment', emoji: <span className="notranslate">🔑</span> },
                        { step: '02', title: 'Connect', desc: 'Match with organizations, jobs, or gig opportunities', emoji: <span className="notranslate">🔗</span> },
                        { step: '03', title: 'Grow', desc: 'Track progress, earn income, and build financial resilience', emoji: <span className="notranslate">📈</span> },
                        { step: '04', title: 'Thrive', desc: 'Repay forward and help others bridge the gap', emoji: <span className="notranslate">🌟</span> },
                    ].map(item => (
                        <div key={item.step}>
                            <div style={{ fontSize: 36, marginBottom: 12 }}>{item.emoji}</div>
                            <div style={{ color: '#00d4aa', fontWeight: 700, fontSize: 13, marginBottom: 6, letterSpacing: 2 }}>STEP {item.step}</div>
                            <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>{item.title}</div>
                            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, lineHeight: 1.6 }}>{item.desc}</div>
                        </div>
                    ))}
                </div>
            </div>

            <Chatbot />
            {showModal && <JoinModal onClose={() => setShowModal(false)} />}
        </div>
    )
}
