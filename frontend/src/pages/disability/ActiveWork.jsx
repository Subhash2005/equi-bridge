import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import API from '../../api/client'
import SegmentHeader from '../../components/SegmentHeader'

export default function ActiveWork() {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [jobs, setJobs] = useState([])
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState(null)

    const fetchActiveJobs = () => {
        if (!user?.email) return
        API.get(`/disability/my-active-jobs/${encodeURIComponent(user.email)}`)
            .then(res => setJobs(res.data))
            .catch(() => { })
            .finally(() => setLoading(false))
    }

    useEffect(() => { fetchActiveJobs() }, [user])

    const handleComplete = async (jobId) => {
        if (!user?.email) return
        setActionLoading(jobId)
        try {
            await API.post('/disability/complete', { user_email: user.email, job_id: jobId })
            fetchActiveJobs()
        } catch { }
        finally { setActionLoading(null) }
    }

    return (
        <div className="page-container" style={{ maxWidth: 800 }}>
            <SegmentHeader
                badge="📝 Disability Flow · Step 3"
                badgeClass="badge-purple"
                title={<>Active <span className="gradient-text-purple">Work</span></>}
                subtitle="Track your progress and submit completed tasks for approval"
                color="#8b5cf6"
            />

            {loading ? (
                <div style={{ textAlign: 'center', padding: 60, color: 'rgba(255,255,255,0.4)' }}>Loading your work...</div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {jobs.map(job => (
                        <div key={job.id} className="glass" style={{ padding: 24, display: 'flex', gap: 20, alignItems: 'center', borderLeft: job.status === 'completed' ? '4px solid #f59e0b' : job.status === 'approved' ? '4px solid #4ade80' : '4px solid #8b5cf6' }}>
                            <div style={{ fontSize: 42 }}>{job.emoji || '💼'}</div>
                            <div style={{ flex: 1 }}>
                                <h3 style={{ fontWeight: 700, fontSize: 18, marginBottom: 4 }}>{job.title}</h3>
                                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginBottom: 8 }}>🏢 {job.company}</div>
                                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                    <span className={`badge ${job.status === 'in_progress' ? 'badge-purple' : job.status === 'completed' ? 'badge-amber' : 'badge-emerald'}`} style={{ fontSize: 11 }}>
                                        {job.status === 'in_progress' ? '🔄 In Progress' : job.status === 'completed' ? '⏳ Waiting Approval' : '✅ Approved & Paid'}
                                    </span>
                                    <span style={{ fontSize: 14, fontWeight: 700, color: '#a78bfa' }}>₹{job.pay.toLocaleString()}</span>
                                </div>
                            </div>

                            {job.status === 'in_progress' && (
                                <button
                                    className="btn-purple"
                                    style={{ padding: '10px 20px', fontSize: 14 }}
                                    disabled={actionLoading === job.id}
                                    onClick={() => handleComplete(job.id)}
                                >
                                    {actionLoading === job.id ? 'Submitting...' : 'Mark as Complete'}
                                </button>
                            )}

                            {job.status === 'completed' && (
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ color: '#f59e0b', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Client Reviewing</div>
                                    <button className="btn-outline" style={{ fontSize: 12, padding: '4px 10px' }} onClick={() => navigate('/disability/pay')}>Check Earnings</button>
                                </div>
                            )}

                            {job.status === 'approved' && (
                                <div style={{ textAlign: 'right', color: '#4ade80', fontWeight: 700 }}>
                                    Paid ✅
                                </div>
                            )}
                        </div>
                    ))}

                    {jobs.length === 0 && (
                        <div className="glass" style={{ textAlign: 'center', padding: 60, color: 'rgba(255,255,255,0.4)' }}>
                            <div style={{ fontSize: 40, marginBottom: 12 }}>🌑</div>
                            <div>You don't have any active jobs yet.</div>
                            <button className="btn-outline" style={{ marginTop: 16 }} onClick={() => navigate('/disability/jobs')}>Find Work →</button>
                        </div>
                    )}
                </div>
            )}

            <button className="btn-outline" style={{ marginTop: 32, width: '100%', padding: 14 }} onClick={() => navigate('/disability/jobs')}>
                ← Back to Vacancy Connect
            </button>
        </div>
    )
}
