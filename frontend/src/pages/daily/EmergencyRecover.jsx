import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import API from '../../api/client'

export default function EmergencyRecover() {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [result, setResult] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [confirmed, setConfirmed] = useState(false)

    const handleRecover = async () => {
        if (!user?.email) { setError('User session not found. Please log in.'); return }
        setLoading(true)
        setError('')
        try {
            const res = await API.post('/investment/recover', { user_email: user.email })
            setResult(res.data)
        } catch (err) { setError(err.response?.data?.detail || 'Recovery failed') }
        finally { setLoading(false) }
    }


    return (
        <div className="page-container" style={{ maxWidth: 560 }}>
            <div style={{ marginBottom: 32 }}>
                <div className="badge badge-amber" style={{ marginBottom: 12 }}>🛠 Daily Wager Flow · Step 5</div>
                <h1 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 36, marginBottom: 8 }}>
                    Emergency <span className="gradient-text-amber">Recover</span>
                </h1>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 15 }}>Liquidate your gold investment in case of emergency</p>
            </div>

            {result ? (
                <div className="glass" style={{ padding: 36, textAlign: 'center' }}>
                    <div style={{ fontSize: 56, marginBottom: 12 }}>💰</div>
                    <h2 style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 24, color: '#f59e0b', marginBottom: 16 }}>Funds Recovered!</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 18px', background: 'rgba(0,212,170,0.08)', borderRadius: 12, border: '1px solid rgba(0,212,170,0.2)' }}>
                            <span style={{ color: 'rgba(255,255,255,0.7)' }}>Amount Recovered</span>
                            <span style={{ fontWeight: 800, fontSize: 20, color: '#00d4aa' }}>₹{result.recovered_amount}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 18px', background: 'rgba(255,255,255,0.04)', borderRadius: 12 }}>
                            <span style={{ color: 'rgba(255,255,255,0.7)' }}>New Balance</span>
                            <span style={{ fontWeight: 700 }}>₹{result.new_balance}</span>
                        </div>
                    </div>
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginBottom: 20 }}>Includes 1.5% gold appreciation bonus</p>
                    <button className="btn-amber" style={{ width: '100%', padding: 14 }} onClick={() => navigate('/daily/revenue')}>
                        Back to Dashboard →
                    </button>
                </div>
            ) : (
                <div className="glass" style={{ padding: 36 }}>
                    <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 12, padding: '16px 20px', marginBottom: 24 }}>
                        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                            <span style={{ fontSize: 24 }}>⚠️</span>
                            <div>
                                <div style={{ fontWeight: 700, marginBottom: 4 }}>Emergency Withdrawal</div>
                                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, lineHeight: 1.6 }}>This will liquidate ALL your gold investments. You'll receive your invested amount + 1.5% appreciation.</div>
                            </div>
                        </div>
                    </div>

                    <div style={{ marginBottom: 24 }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
                            <input type="checkbox" checked={confirmed} onChange={e => setConfirmed(e.target.checked)} style={{ width: 18, height: 18, accentColor: '#f59e0b' }} />
                            <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14 }}>I understand this will liquidate all my gold investments</span>
                        </label>
                    </div>

                    {error && <p style={{ color: '#f87171', fontSize: 14, marginBottom: 16 }}>{error}</p>}

                    <button className="btn-amber" style={{ width: '100%', padding: 14, fontSize: 16 }} disabled={!confirmed || loading} onClick={handleRecover}>
                        {loading ? 'Processing...' : '🆘 Recover Emergency Funds'}
                    </button>
                    <button className="btn-outline" style={{ width: '100%', padding: 12, fontSize: 14, marginTop: 12 }} onClick={() => navigate('/daily/revenue')}>
                        ← Back to Dashboard
                    </button>
                </div>
            )}
        </div>
    )
}
