import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import API from '../../api/client'

const GOLD_PRICE = 6500

export default function AutoInvest() {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [result, setResult] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleInvest = async () => {
        if (!user?.email) { setError('User session not found. Please log in.'); return }
        setLoading(true)
        setError('')
        try {
            const res = await API.post('/investment/invest', { user_email: user.email })
            setResult(res.data)
        } catch (err) { setError(err.response?.data?.detail || 'Investment failed') }
        finally { setLoading(false) }
    }


    return (
        <div className="page-container" style={{ maxWidth: 600 }}>
            <div style={{ marginBottom: 32 }}>
                <div className="badge badge-amber" style={{ marginBottom: 12 }}>🛠 Daily Wager Flow · Step 4</div>
                <h1 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 36, marginBottom: 8 }}>
                    Auto <span className="gradient-text-amber">Invest</span>
                </h1>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 15 }}>Invest ₹100 in simulated gold and grow your savings</p>
            </div>

            {/* Gold price card */}
            <div style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(239,68,68,0.08))', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 20, padding: '28px 32px', marginBottom: 28 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                    <span style={{ fontSize: 48 }}>🥇</span>
                    <div>
                        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginBottom: 4 }}>SIMULATED GOLD PRICE</div>
                        <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 32, color: '#f59e0b' }}>₹{GOLD_PRICE.toLocaleString()}/gram</div>
                    </div>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 12, padding: '14px 18px' }}>
                    <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, marginBottom: 4 }}>₹100 investment =</div>
                    <div style={{ fontWeight: 700, fontSize: 18 }}>{(100 / GOLD_PRICE).toFixed(6)} grams of gold</div>
                </div>
            </div>

            {result ? (
                <div className="glass" style={{ padding: 32, textAlign: 'center' }}>
                    <div style={{ fontSize: 56, marginBottom: 12 }}>✅</div>
                    <h2 style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 24, color: '#f59e0b', marginBottom: 16 }}>Investment Successful!</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', background: 'rgba(255,255,255,0.04)', borderRadius: 10 }}>
                            <span style={{ color: 'rgba(255,255,255,0.6)' }}>Amount Invested</span>
                            <span style={{ fontWeight: 700 }}>₹{result.invested}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', background: 'rgba(255,255,255,0.04)', borderRadius: 10 }}>
                            <span style={{ color: 'rgba(255,255,255,0.6)' }}>Gold Purchased</span>
                            <span style={{ fontWeight: 700, color: '#f59e0b' }}>{result.gold_grams}g</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', background: 'rgba(255,255,255,0.04)', borderRadius: 10 }}>
                            <span style={{ color: 'rgba(255,255,255,0.6)' }}>Remaining Balance</span>
                            <span style={{ fontWeight: 700, color: '#00d4aa' }}>₹{result.remaining_balance}</span>
                        </div>
                    </div>
                    <button className="btn-amber" style={{ width: '100%', padding: 14 }} onClick={handleInvest} disabled={loading}>
                        Invest Another ₹100
                    </button>
                </div>
            ) : (
                <div className="glass" style={{ padding: 32 }}>
                    <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 15, lineHeight: 1.7, marginBottom: 24 }}>
                        ₹100 will be auto-deducted from your available balance and invested in simulated gold. Your investment grows with gold price appreciation.
                    </p>
                    {error && <p style={{ color: '#f87171', fontSize: 14, marginBottom: 16 }}>{error}</p>}
                    <button className="btn-amber" style={{ width: '100%', padding: 14, fontSize: 16 }} disabled={loading} onClick={handleInvest}>
                        {loading ? 'Investing...' : '🥇 Invest ₹100 in Gold'}
                    </button>
                    <button className="btn-outline" style={{ width: '100%', padding: 12, fontSize: 14, marginTop: 12 }} onClick={() => navigate('/daily/revenue')}>
                        ← Back to Dashboard
                    </button>
                </div>
            )}
        </div>
    )
}
