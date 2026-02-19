import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import API from '../../api/client'

export default function JobStatus() {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [paying, setPaying] = useState(false)
    const [payMsg, setPayMsg] = useState('')

    const fetchStatus = () => {
        if (!user?.email) { setLoading(false); return }
        API.get(`/student/job-status/${encodeURIComponent(user.email)}`)
            .then(res => setData(res.data))
            .catch(() => { })
            .finally(() => setLoading(false))
    }

    useEffect(() => { fetchStatus() }, [])

    const handleRepayMonth = async () => {
        if (!user?.email) return
        setPaying(true)
        try {
            const res = await API.post('/student/repay-month', { user_email: user.email })
            setPayMsg(res.data.message)
            fetchStatus()
        } catch { }
        setPaying(false)
    }

    if (loading) return <div className="page-container" style={{ textAlign: 'center', paddingTop: 120, color: 'rgba(255,255,255,0.4)' }}>Loading...</div>

    const d = data || {
        name: 'Student', org: 'Your Organization', field: 'Your Field',
        salary: 50000, total_funding_received: 0, repayment_paid: 0,
        remaining_debt: 0, monthly_repayment: 5000, months_repaid: 0,
        months_remaining: 0, net_this_month: 50000, funding_breakdown: [], progress_pct: 0,
    }

    const repaidPct = d.total_funding_received > 0
        ? Math.min(100, Math.round((d.repayment_paid / d.total_funding_received) * 100))
        : 0
    const fullyRepaid = d.remaining_debt <= 0 && d.total_funding_received > 0

    return (
        <div className="page-container" style={{ maxWidth: 720 }}>
            <div style={{ marginBottom: 32 }}>
                <div className="badge badge-teal" style={{ marginBottom: 12 }}>🎓 Student Flow · Step 5 of 5</div>
                <h1 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 36, marginBottom: 8 }}>
                    Job <span className="gradient-text-teal">Status</span>
                </h1>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 15 }}>Placed at {d.org} · {d.field}</p>
            </div>

            {/* Placement banner */}
            <div style={{ background: 'linear-gradient(135deg, rgba(0,212,170,0.12), rgba(0,180,216,0.06))', border: '1px solid rgba(0,212,170,0.25)', borderRadius: 20, padding: '24px 28px', marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
                    <div style={{ fontSize: 44 }}>🎉</div>
                    <div>
                        <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 20 }}>Congratulations, {d.name}!</div>
                        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>Placed at {d.org} · {d.progress_pct}% pipeline completed</div>
                    </div>
                </div>

                {/* Salary breakdown */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', background: 'rgba(255,255,255,0.05)', borderRadius: 10 }}>
                        <span style={{ color: 'rgba(255,255,255,0.6)' }}>Monthly Salary</span>
                        <span style={{ fontWeight: 700, fontSize: 18 }}>₹{d.salary.toLocaleString()}</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', background: d.remaining_debt > 0 ? 'rgba(248,113,113,0.08)' : 'rgba(74,222,128,0.06)', borderRadius: 10, border: `1px solid ${d.remaining_debt > 0 ? 'rgba(248,113,113,0.15)' : 'rgba(74,222,128,0.15)'}` }}>
                        <div>
                            <span style={{ color: 'rgba(255,255,255,0.6)' }}>Fund Repayment (10% of salary)</span>
                            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>
                                {d.remaining_debt > 0 ? `₹${d.remaining_debt.toLocaleString()} remaining · ~${d.months_remaining} months left` : '✅ Fully repaid!'}
                            </div>
                        </div>
                        <span style={{ fontWeight: 700, fontSize: 18, color: d.remaining_debt > 0 ? '#f87171' : '#4ade80' }}>
                            {d.remaining_debt > 0 ? `- ₹${d.monthly_repayment.toLocaleString()}` : '₹0'}
                        </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 16px', background: 'rgba(0,212,170,0.1)', borderRadius: 10, border: '1px solid rgba(0,212,170,0.25)' }}>
                        <span style={{ fontWeight: 700 }}>Net Monthly Credit</span>
                        <span style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: 22, color: '#00d4aa' }}>₹{d.net_this_month.toLocaleString()}</span>
                    </div>
                </div>
            </div>

            {/* Repayment progress */}
            <div className="glass" style={{ padding: '20px 24px', marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                    <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>REPAYMENT PROGRESS</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: fullyRepaid ? '#4ade80' : '#fbbf24' }}>{repaidPct}% repaid</span>
                </div>
                <div className="progress-bar" style={{ height: 12, marginBottom: 10 }}>
                    <div className="progress-fill" style={{ width: `${repaidPct}%`, background: fullyRepaid ? 'linear-gradient(90deg, #4ade80, #00d4aa)' : 'linear-gradient(90deg, #f59e0b, #00d4aa)', transition: 'width 1s ease' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
                    <span>Paid: ₹{d.repayment_paid.toLocaleString()}</span>
                    <span>Remaining: ₹{d.remaining_debt.toLocaleString()}</span>
                    <span>Total: ₹{d.total_funding_received.toLocaleString()}</span>
                </div>
            </div>

            {/* Monthly repayment stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 20 }}>
                {[
                    { label: 'Months Repaid', value: d.months_repaid, icon: '📅', color: '#00d4aa' },
                    { label: 'Months Remaining', value: d.remaining_debt > 0 ? d.months_remaining : 0, icon: '⏳', color: '#fbbf24' },
                    { label: 'Monthly Deduction', value: `₹${d.monthly_repayment.toLocaleString()}`, icon: '💸', color: '#f87171' },
                ].map(item => (
                    <div key={item.label} className="glass" style={{ padding: '16px 18px', textAlign: 'center' }}>
                        <div style={{ fontSize: 24, marginBottom: 6 }}>{item.icon}</div>
                        <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 20, color: item.color }}>{item.value}</div>
                        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>{item.label}</div>
                    </div>
                ))}
            </div>

            {/* Funding breakdown */}
            {d.funding_breakdown?.length > 0 && (
                <div className="glass" style={{ padding: '20px 24px', marginBottom: 20 }}>
                    <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', fontWeight: 600, marginBottom: 14 }}>
                        💰 FUNDING BREAKDOWN — ORG PAID 100%, YOU PAID ₹0
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {d.funding_breakdown.map((item, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: 14 }}>Step {item.step}: {item.title}</div>
                                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Student paid: ₹0 · Org funded: ₹{item.org_funded.toLocaleString()}</div>
                                </div>
                                <span style={{ color: '#4ade80', fontWeight: 700 }}>₹{item.org_funded.toLocaleString()}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Pay this month button */}
            {payMsg && (
                <div style={{ background: 'rgba(0,212,170,0.08)', border: '1px solid rgba(0,212,170,0.2)', borderRadius: 10, padding: '12px 16px', marginBottom: 16, fontSize: 14, color: '#00d4aa' }}>
                    {payMsg}
                </div>
            )}

            <div style={{ display: 'flex', gap: 12 }}>
                {d.remaining_debt > 0 && (
                    <button className="btn-primary" style={{ flex: 1, padding: 14, fontSize: 15 }} onClick={handleRepayMonth} disabled={paying}>
                        {paying ? 'Processing...' : `💳 Pay This Month (₹${d.monthly_repayment.toLocaleString()})`}
                    </button>
                )}
                {fullyRepaid && (
                    <div style={{ flex: 1, padding: 14, textAlign: 'center', background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.3)', borderRadius: 12, color: '#4ade80', fontWeight: 700 }}>
                        🎉 Debt Fully Repaid! You're free!
                    </div>
                )}
                <button className="btn-outline" style={{ flex: 1, padding: 14, fontSize: 15 }} onClick={() => navigate('/')}>
                    Go to Home
                </button>
            </div>
        </div>
    )
}
