import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import API from '../../api/client'

export default function RevenueDashboard() {
    const { user } = useAuth()
    const navigate = useNavigate()
    const worker = JSON.parse(localStorage.getItem('equibridge_worker') || '{}')
    const [data, setData] = useState({ total_earnings: 0, available_balance: 0, invested_amount: 0, auto_invest_enabled: false })
    const [loading, setLoading] = useState(true)
    const [withdrawing, setWithdrawing] = useState(false)
    const [withdrawAmt, setWithdrawAmt] = useState('')
    const [msg, setMsg] = useState('')

    const fetchData = () => {
        if (user?.email) {
            API.get(`/daily/revenue/${encodeURIComponent(user.email)}`)
                .then(res => setData({
                    total_earnings: res.data.total_earned || 0,
                    available_balance: res.data.balance || 0,
                    invested_amount: res.data.invested_amount || 0,
                    auto_invest_enabled: res.data.auto_invest || false
                }))
                .catch(() => { })
                .finally(() => setLoading(false))
        } else setLoading(false)
    }

    useEffect(() => { fetchData() }, [user])

    const handleWithdraw = async () => {
        if (!withdrawAmt || parseFloat(withdrawAmt) <= 0 || !user?.email) return
        setWithdrawing(true)
        try {
            await API.post('/daily/withdraw', { user_email: user.email, amount: parseFloat(withdrawAmt) })
            setMsg(`✅ ₹${withdrawAmt} withdrawn successfully!`)
            setWithdrawAmt('')
            fetchData()
        } catch (err) { setMsg('❌ ' + (err.response?.data?.detail || 'Withdrawal failed')) }
        finally { setWithdrawing(false) }
    }

    const handleToggleInvest = async () => {
        if (!user?.email) return
        try {
            const res = await API.post('/daily/toggle-invest', { user_email: user.email })
            setData(prev => ({ ...prev, auto_invest_enabled: res.data.auto_invest }))
        } catch { }
    }


    return (
        <div className="page-container" style={{ maxWidth: 700 }}>
            <div style={{ marginBottom: 32 }}>
                <div className="badge badge-amber" style={{ marginBottom: 12 }}>🛠 Daily Wager Flow · Step 3</div>
                <h1 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 36, marginBottom: 8 }}>
                    Revenue <span className="gradient-text-amber">Dashboard</span>
                </h1>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28 }}>
                {[
                    { label: 'Total Earned', value: `₹${data.total_earnings.toLocaleString()}`, emoji: '💰', color: '#00d4aa' },
                    { label: 'Available', value: `₹${data.available_balance.toLocaleString()}`, emoji: '💳', color: '#f59e0b' },
                    { label: 'Invested', value: `₹${data.invested_amount.toLocaleString()}`, emoji: '📈', color: '#8b5cf6' },
                ].map(s => (
                    <div key={s.label} className="glass" style={{ padding: '20px 16px', textAlign: 'center' }}>
                        <div style={{ fontSize: 28, marginBottom: 6 }}>{s.emoji}</div>
                        <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 22, color: s.color }}>{s.value}</div>
                        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginTop: 4 }}>{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Withdraw */}
            <div className="glass" style={{ padding: 28, marginBottom: 20 }}>
                <h3 style={{ fontWeight: 700, fontSize: 18, marginBottom: 16 }}>💸 Withdraw Funds</h3>
                <div style={{ display: 'flex', gap: 12 }}>
                    <input className="input-field" type="number" placeholder="Amount to withdraw" value={withdrawAmt} onChange={e => setWithdrawAmt(e.target.value)} style={{ flex: 1 }} />
                    <button className="btn-amber" style={{ padding: '12px 20px', flexShrink: 0 }} disabled={withdrawing} onClick={handleWithdraw}>
                        {withdrawing ? '...' : 'Withdraw'}
                    </button>
                </div>
                {msg && <p style={{ marginTop: 12, fontSize: 14, color: msg.startsWith('✅') ? '#4ade80' : '#f87171' }}>{msg}</p>}
            </div>

            {/* Auto invest toggle */}
            <div className="glass" style={{ padding: 24, marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                    <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>🥇 Auto-Invest ₹100</div>
                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>Automatically invest ₹100 in simulated gold</div>
                </div>
                <div onClick={handleToggleInvest} style={{ width: 52, height: 28, borderRadius: 999, background: data.auto_invest_enabled ? '#f59e0b' : 'rgba(255,255,255,0.15)', cursor: 'pointer', position: 'relative', transition: 'background 0.3s' }}>
                    <div style={{ position: 'absolute', top: 3, left: data.auto_invest_enabled ? 26 : 3, width: 22, height: 22, borderRadius: '50%', background: '#fff', transition: 'left 0.3s', boxShadow: '0 2px 6px rgba(0,0,0,0.3)' }} />
                </div>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
                <button className="btn-amber" style={{ flex: 1, padding: 14, fontSize: 15 }} onClick={() => navigate('/daily/invest')}>
                    🥇 Go to Auto-Invest →
                </button>
                <button className="btn-outline" style={{ flex: 1, padding: 14, fontSize: 15 }} onClick={() => navigate('/daily/recover')}>
                    🆘 Emergency Recover
                </button>
            </div>
        </div>
    )
}
