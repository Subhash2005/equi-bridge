import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import API from '../../api/client'
import SegmentHeader from '../../components/SegmentHeader'

export default function VacancyConnect() {
    const { user } = useAuth()
    const navigate = useNavigate()
    const dUser = JSON.parse(localStorage.getItem('equibridge_disability') || '{}')
    const [jobs, setJobs] = useState([])
    const [loading, setLoading] = useState(true)
    const [accepted, setAccepted] = useState(null)

    useEffect(() => {
        if (!user?.email) return
        const profession = dUser.profession || ''
        API.get(`/disability/jobs?user_email=${encodeURIComponent(user.email)}&profession=${encodeURIComponent(profession)}`)
            .then(res => setJobs(res.data))
            .catch(() => { })
            .finally(() => setLoading(false))
    }, [user])

    const handleAccept = async (job) => {
        if (!user?.email) return
        try {
            const res = await API.post('/disability/accept', { user_email: user.email, job_id: job.id })
            setAccepted({ ...job, message: res.data.message })
            setJobs(prev => prev.filter(j => j.id !== job.id))
        } catch (err) {
            setAccepted({ ...job, message: 'Job accepted! Complete it to get paid.' })
        }
    }

    return (
        <div className="page-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32 }}>
                <SegmentHeader
                    badge="♿ Disability Flow · Step 2"
                    badgeClass="badge-purple"
                    title={<>Vacancy <span className="gradient-text-purple">Connect</span></>}
                    subtitle={`Inclusive jobs matched for your skills & profession`}
                    color="#8b5cf6"
                    style={{ marginBottom: 0 }}
                />
                <div style={{ display: 'flex', gap: 12 }}>
                    <button className="btn-outline" onClick={() => navigate('/disability/post')} style={{ padding: '10px 20px', fontSize: 14 }}>
                        🏢 Post a Job (NGO)
                    </button>
                    <button className="btn-purple" onClick={() => navigate('/disability/active')} style={{ padding: '10px 20px', fontSize: 14 }}>
                        📝 My Active Work
                    </button>
                </div>
            </div>

            {accepted && (
                <div style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(236,72,153,0.08))', border: '1px solid rgba(139,92,246,0.3)', borderRadius: 16, padding: '20px 24px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
                    <span style={{ fontSize: 36 }}>✅</span>
                    <div>
                        <div style={{ fontWeight: 700, marginBottom: 4 }}>Job Accepted: {accepted.title}</div>
                        <div style={{ color: '#a78bfa', fontSize: 14 }}>{accepted.message}</div>
                    </div>
                    <button className="btn-purple" style={{ marginLeft: 'auto', padding: '10px 20px', fontSize: 14, flexShrink: 0 }} onClick={() => navigate('/disability/active')}>
                        Start Working →
                    </button>
                </div>
            )}

            {loading ? (
                <div style={{ textAlign: 'center', padding: 60, color: 'rgba(255,255,255,0.4)' }}>Finding inclusive jobs...</div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 }}>
                    {jobs.map(job => (
                        <div key={job.id} className="glass card-hover" style={{ padding: 24, display: 'flex', flexDirection: 'column' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 14 }}>
                                <div style={{ fontSize: 42, flexShrink: 0 }}>{job.emoji || '💼'}</div>
                                <div style={{ flex: 1 }}>
                                    <h3 style={{ fontWeight: 700, fontSize: 17, marginBottom: 6 }}>{job.title}</h3>
                                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                        {job.is_profession_match && (
                                            <span className="badge badge-purple" style={{ fontSize: 10 }}>Role Match ✅</span>
                                        )}
                                        {job.skill_match_count > 0 && (
                                            <span className="badge" style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)', fontSize: 10 }}>
                                                {job.skill_match_count} Skill Matches ✨
                                            </span>
                                        )}
                                        <span className="badge" style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.1)', fontSize: 10 }}>
                                            🏠 Remote
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 14, lineHeight: 1.6, marginBottom: 16 }}>{job.description}</p>

                            <div style={{ marginBottom: 20 }}>
                                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Req. Skills</div>
                                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                    {job.required_skills?.map(s => (
                                        <span key={s} style={{ fontSize: 11, padding: '3px 8px', borderRadius: 6, background: dUser.skills?.includes(s) ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.04)', color: dUser.skills?.includes(s) ? '#a78bfa' : 'rgba(255,255,255,0.5)', border: dUser.skills?.includes(s) ? '1px solid rgba(139,92,246,0.3)' : '1px solid rgba(255,255,255,0.05)' }}>
                                            {s}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Potential Earnings</span>
                                    <span style={{ fontWeight: 800, fontSize: 22, color: '#a78bfa' }}>₹{job.pay.toLocaleString()}</span>
                                </div>
                                <button className="btn-purple" style={{ padding: '10px 22px', fontSize: 15 }} onClick={() => handleAccept(job)}>Accept Job</button>
                            </div>
                        </div>
                    ))}
                    {jobs.length === 0 && !loading && (
                        <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 80 }} className="glass">
                            <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
                            <h3 style={{ marginBottom: 8 }}>No matching jobs found</h3>
                            <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: 24 }}>Try adding more skills to your profile to see more opportunities.</p>
                            <button className="btn-outline" onClick={() => navigate('/disability')}>Update My Profile</button>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
