import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import API from '../../api/client'
import SegmentHeader from '../../components/SegmentHeader'

export default function RevenueCredit() {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [data, setData] = useState(null)
    const [pendingJobs, setPendingJobs] = useState([])
    const [loading, setLoading] = useState(true)
    const [approving, setApproving] = useState(null)

    const fetchData = async () => {
        if (!user?.email) return
        try {
            const [revRes, jobsRes] = await Promise.all([
                API.get(`/disability/revenue/${encodeURIComponent(user.email)}`),
                API.get(`/disability/my-active-jobs/${encodeURIComponent(user.email)}`)
            ])
            setData(revRes.data)
            setPendingJobs(jobsRes.data.filter(j => j.status === 'completed'))
        } catch (err) { }
        finally { setLoading(false) }
    }

    useEffect(() => { fetchData() }, [user])

    const handleSimulateApproval = async (jobId) => {
        if (!user?.email) return
        setApproving(jobId)
        try {
            await API.post('/disability/approve', { user_email: user.email, job_id: jobId })
            fetchData()
        } catch { }
        finally { setApproving(null) }
    }

    return (
        <div className="page-container" style={{ maxWidth: 800 }}>
            <SegmentHeader
                badge="💳 Disability Flow · Step 4"
                badgeClass="badge-emerald"
                title={<>Inclusive <span className="gradient-text-emerald">Earnings</span></>}
                subtitle="Track your approved income and pending payments"
                color="#10b981"
            />

            {loading ? (
                <div style={{ textAlign: 'center', padding: 60, color: 'rgba(255,255,255,0.4)' }}>Loading...</div>
            ) : data ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 300px', gap: 24, alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                        {/* Profile card */}
                        <div style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(52,211,153,0.08))', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 20, padding: 32 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                                <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(16,185,129,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>♿</div>
                                <div>
                                    <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 22 }}>{data.name}</div>
                                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>{data.profession} · {data.disability_type}</div>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 12, padding: '16px 20px' }}>
                                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginBottom: 4 }}>TOTAL EARNED</div>
                                    <div style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: 32, color: '#10b981' }}>₹{data.total_earnings.toLocaleString()}</div>
                                </div>
                                <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 12, padding: '16px 20px' }}>
                                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginBottom: 4 }}>PENDING Payout</div>
                                    <div style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: 32, color: '#f59e0b' }}>₹{data.pending_earnings.toLocaleString()}</div>
                                </div>
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="glass" style={{ padding: 24 }}>
                            <h3 style={{ fontWeight: 700, fontSize: 18, marginBottom: 16 }}>Pending Client Approvals</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {pendingJobs.map(job => (
                                    <div key={job.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 16, background: 'rgba(255,255,255,0.02)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)' }}>
                                        <div>
                                            <div style={{ fontWeight: 600, fontSize: 15 }}>{job.title}</div>
                                            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>Completed · Waiting for client</div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontWeight: 700, color: '#f59e0b', marginBottom: 4 }}>₹{job.pay.toLocaleString()}</div>
                                            <button
                                                className="btn-outline"
                                                style={{ fontSize: 10, padding: '4px 8px', borderColor: 'rgba(16,185,129,0.3)', color: '#10b981' }}
                                                onClick={() => handleSimulateApproval(job.id)}
                                                disabled={approving === job.id}
                                            >
                                                {approving === job.id ? 'Approving...' : 'Simulate Client Approval'}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {pendingJobs.length === 0 && (
                                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, textAlign: 'center', padding: 20 }}>No jobs waiting for approval</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div className="glass" style={{ padding: 20 }}>
                            <div style={{ fontSize: 24, marginBottom: 12 }}>🛡️</div>
                            <h4 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>Secured Payments</h4>
                            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>
                                Funds are held in escrow by the NGO until you complete the task.
                            </p>
                        </div>
                        <div className="glass" style={{ padding: 20 }}>
                            <div style={{ fontSize: 24, marginBottom: 12 }}>♿</div>
                            <h4 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>Inclusive Support</h4>
                            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>
                                Need help with a client? Contact our inclusive support team.
                            </p>
                        </div>
                        <button className="btn-purple" style={{ width: '100%', padding: 14 }} onClick={() => navigate('/disability/jobs')}>
                            Find More Jobs →
                        </button>
                    </div>
                </div>
            ) : (
                <div className="glass" style={{ padding: 48, textAlign: 'center' }}>
                    <div style={{ fontSize: 56, marginBottom: 16 }}>📊</div>
                    <h2 style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 22, marginBottom: 12 }}>No earnings yet</h2>
                    <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: 24 }}>Accept and complete a job to see your earnings here</p>
                    <button className="btn-purple" onClick={() => navigate('/disability/jobs')}>Browse Jobs →</button>
                </div>
            )}
        </div>
    )
}
