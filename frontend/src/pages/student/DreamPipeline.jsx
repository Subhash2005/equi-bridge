import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import API from '../../api/client'

export default function DreamPipeline() {
    const { user } = useAuth()
    const navigate = useNavigate()
    const org = JSON.parse(localStorage.getItem('equibridge_org') || '{}')
    const student = JSON.parse(localStorage.getItem('equibridge_student') || '{}')

    const [pipeline, setPipeline] = useState(null)
    const [loading, setLoading] = useState(true)
    const [selectedStep, setSelectedStep] = useState(null) // for side panel
    const [planned, setPlanned] = useState([]) // step numbers marked as planned

    useEffect(() => {
        if (!org.name) { navigate('/student/org'); return }
        API.get(`/student/pipeline/${encodeURIComponent(org.name)}`)
            .then(res => setPipeline(res.data))
            .catch(() => { })
            .finally(() => setLoading(false))
    }, [])

    const togglePlanned = (stepNum) => {
        setPlanned(prev =>
            prev.includes(stepNum) ? prev.filter(s => s !== stepNum) : [...prev, stepNum]
        )
    }

    const handleStartTracking = async () => {
        if (user?.email && planned.length > 0) {
            try {
                await API.post('/student/progress', {
                    user_email: user.email,
                    org_name: org.name,
                    completed_steps: planned,
                })
            } catch { }
        }
        navigate('/student/progress')
    }

    if (loading) return <div className="page-container" style={{ textAlign: 'center', paddingTop: 120, color: 'rgba(255,255,255,0.4)' }}>Loading roadmap...</div>
    if (!pipeline) return null

    const roadmap = pipeline.roadmap || []
    const totalFee = roadmap.reduce((s, r) => s + r.estimated_fee, 0)
    const totalFunding = roadmap.reduce((s, r) => s + (r.funding_amount || 0), 0)
    const netCost = totalFee - totalFunding

    return (
        <div className="page-container" style={{ position: 'relative' }}>
            <div style={{ marginBottom: 32 }}>
                <div className="badge badge-teal" style={{ marginBottom: 12 }}>🎓 Student Flow · Step 3 of 5</div>
                <h1 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 36, marginBottom: 8 }}>
                    {pipeline.logo_emoji} {org.name} <span className="gradient-text-teal">Roadmap</span>
                </h1>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 15 }}>
                    {roadmap.length}-step career pipeline · Click any step to see fees & funding
                </p>
            </div>

            {/* Summary bar */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
                {[
                    { label: 'Total Estimated Cost', value: `₹${totalFee.toLocaleString()}`, color: '#f87171' },
                    { label: 'Total Funding Available', value: `₹${totalFunding.toLocaleString()}`, color: '#4ade80' },
                    { label: 'Net Out-of-Pocket', value: `₹${netCost.toLocaleString()}`, color: '#00d4aa' },
                ].map(item => (
                    <div key={item.label} className="glass" style={{ padding: '18px 20px', textAlign: 'center' }}>
                        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>{item.label}</div>
                        <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 22, color: item.color }}>{item.value}</div>
                    </div>
                ))}
            </div>

            {/* Steps */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 32 }}>
                {roadmap.map((step, idx) => {
                    const isPlanned = planned.includes(step.step)
                    return (
                        <div
                            key={step.step}
                            className="glass card-hover"
                            style={{
                                padding: '20px 24px',
                                cursor: 'pointer',
                                border: isPlanned ? '1px solid rgba(0,212,170,0.4)' : '1px solid rgba(255,255,255,0.08)',
                                background: isPlanned ? 'rgba(0,212,170,0.05)' : 'rgba(255,255,255,0.04)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 20,
                            }}
                            onClick={() => setSelectedStep(step)}
                        >
                            {/* Step number */}
                            <div style={{
                                width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
                                background: isPlanned ? 'rgba(0,212,170,0.2)' : 'rgba(255,255,255,0.06)',
                                border: `2px solid ${isPlanned ? '#00d4aa' : 'rgba(255,255,255,0.15)'}`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontFamily: 'Outfit', fontWeight: 800, fontSize: 16,
                                color: isPlanned ? '#00d4aa' : 'rgba(255,255,255,0.5)',
                            }}>
                                {isPlanned ? '✓' : step.step}
                            </div>

                            {/* Content */}
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                                    <span style={{ fontWeight: 700, fontSize: 16 }}>{step.title}</span>
                                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>· {step.duration}</span>
                                </div>
                                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                    <span style={{ fontSize: 12, color: '#f87171' }}>💰 ₹{step.estimated_fee.toLocaleString()}</span>
                                    {step.funding_available && (
                                        <span style={{ fontSize: 12, color: '#4ade80' }}>✅ ₹{step.funding_amount.toLocaleString()} funded</span>
                                    )}
                                    {step.skills?.slice(0, 2).map(s => (
                                        <span key={s} className="badge badge-teal" style={{ fontSize: 10 }}>{s}</span>
                                    ))}
                                </div>
                            </div>

                            <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 18 }}>›</div>
                        </div>
                    )
                })}
            </div>

            <button className="btn-primary" style={{ padding: '14px 32px', fontSize: 16 }} onClick={handleStartTracking}>
                Start Progress Tracking →
            </button>

            {/* ── Side Panel ── */}
            {selectedStep && (
                <>
                    {/* Overlay */}
                    <div
                        onClick={() => setSelectedStep(null)}
                        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, backdropFilter: 'blur(4px)' }}
                    />
                    {/* Panel */}
                    <div style={{
                        position: 'fixed', top: 0, right: 0, bottom: 0, width: '100%', maxWidth: 440,
                        background: 'rgba(10,10,20,0.97)', borderLeft: '1px solid rgba(255,255,255,0.1)',
                        zIndex: 201, overflowY: 'auto', padding: 32,
                        animation: 'slideInRight 0.3s ease',
                    }}>
                        <style>{`@keyframes slideInRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`}</style>

                        <button onClick={() => setSelectedStep(null)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: 22, cursor: 'pointer', marginBottom: 20 }}>✕ Close</button>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(0,212,170,0.15)', border: '2px solid #00d4aa', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#00d4aa' }}>
                                {selectedStep.step}
                            </div>
                            <div>
                                <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 18 }}>{selectedStep.title}</div>
                                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>⏱ {selectedStep.duration}</div>
                            </div>
                        </div>

                        <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 14, lineHeight: 1.7, marginBottom: 24 }}>{selectedStep.description}</p>

                        {/* Fee breakdown */}
                        <div style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 12, padding: '16px 18px', marginBottom: 16 }}>
                            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>ESTIMATED COST</div>
                            <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 28, color: '#f87171' }}>₹{selectedStep.estimated_fee.toLocaleString()}</div>
                        </div>

                        {selectedStep.funding_available ? (
                            <div style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)', borderRadius: 12, padding: '16px 18px', marginBottom: 16 }}>
                                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>FUNDING AVAILABLE</div>
                                <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 24, color: '#4ade80', marginBottom: 4 }}>₹{selectedStep.funding_amount.toLocaleString()}</div>
                                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>via {selectedStep.funding_source}</div>
                            </div>
                        ) : (
                            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '14px 18px', marginBottom: 16 }}>
                                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>❌ No funding available for this step</div>
                            </div>
                        )}

                        <div style={{ background: 'rgba(0,212,170,0.08)', border: '1px solid rgba(0,212,170,0.2)', borderRadius: 12, padding: '14px 18px', marginBottom: 24 }}>
                            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>NET COST (after funding)</div>
                            <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 22, color: '#00d4aa' }}>
                                ₹{(selectedStep.estimated_fee - (selectedStep.funding_amount || 0)).toLocaleString()}
                            </div>
                        </div>

                        {/* Skills */}
                        {selectedStep.skills?.length > 0 && (
                            <div style={{ marginBottom: 24 }}>
                                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 10 }}>Skills you'll gain:</div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                    {selectedStep.skills.map(s => <span key={s} className="badge badge-teal">{s}</span>)}
                                </div>
                            </div>
                        )}

                        <button
                            className={planned.includes(selectedStep.step) ? 'btn-outline' : 'btn-primary'}
                            style={{ width: '100%', padding: 14, fontSize: 15 }}
                            onClick={() => { togglePlanned(selectedStep.step); setSelectedStep(null) }}
                        >
                            {planned.includes(selectedStep.step) ? '✓ Marked as Planned' : '📌 Mark as Planned'}
                        </button>
                    </div>
                </>
            )}
        </div>
    )
}
