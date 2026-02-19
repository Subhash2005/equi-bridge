import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import API from '../../api/client'

export default function OrgListing() {
    const { user } = useAuth()
    const navigate = useNavigate()
    const student = JSON.parse(localStorage.getItem('equibridge_student') || '{}')
    const [orgs, setOrgs] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const field = student.field_of_interest || ''
        API.get(`/student/organizations?field=${encodeURIComponent(field)}`)
            .then(res => setOrgs(res.data))
            .catch(() => { })
            .finally(() => setLoading(false))
    }, [])

    const handleJoin = async (org) => {
        if (!user?.email) { navigate('/'); return }
        try {
            await API.post(`/student/select-org?user_email=${encodeURIComponent(user.email)}&org_name=${encodeURIComponent(org.name)}`)
        } catch { }
        localStorage.setItem('equibridge_org', JSON.stringify(org))
        navigate('/student/pipeline')
    }

    return (
        <div className="page-container">
            <div style={{ marginBottom: 32 }}>
                <div className="badge badge-teal" style={{ marginBottom: 12 }}>🎓 Student Flow · Step 2 of 5</div>
                <h1 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 36, marginBottom: 8 }}>
                    Choose Your <span className="gradient-text-teal">Organization</span>
                </h1>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 15 }}>
                    Sponsor organizations for <strong style={{ color: '#00d4aa' }}>{student.field_of_interest || 'your field'}</strong>
                </p>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: 60, color: 'rgba(255,255,255,0.4)' }}>Loading organizations...</div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
                    {orgs.map(org => (
                        <div key={org.id || org.name} className="glass card-hover" style={{ padding: 28 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
                                <div style={{ fontSize: 44, flexShrink: 0 }}>{org.logo_emoji}</div>
                                <div>
                                    <h3 style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 20, marginBottom: 4 }}>{org.name}</h3>
                                    <span className="badge badge-teal" style={{ fontSize: 11 }}>{org.field}</span>
                                </div>
                            </div>
                            <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 14, lineHeight: 1.6, marginBottom: 16 }}>{org.description}</p>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 2 }}>Total Funding</div>
                                    <div style={{ fontWeight: 700, color: '#00d4aa', fontSize: 16 }}>₹{(org.total_funding || 0).toLocaleString()}</div>
                                </div>
                                <button className="btn-primary" style={{ padding: '9px 20px', fontSize: 14 }} onClick={() => handleJoin(org)}>
                                    Join →
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
