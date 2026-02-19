import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import API from '../../api/client'
import SegmentHeader from '../../components/SegmentHeader'

const FIELDS = ['Scientist', 'Software Developer', 'AI Engineer', 'Doctor', 'Physiotherapist']

export default function StudentRegister() {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [form, setForm] = useState({ name: '', age: '', document_id: '', field_of_interest: 'Scientist' })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [existing, setExisting] = useState(null)
    const [checking, setChecking] = useState(false)

    // On load: check if student already exists for this email
    useEffect(() => {
        if (!user?.email) return
        setChecking(true)
        API.get(`/student/me/${encodeURIComponent(user.email)}`)
            .then(res => {
                setExisting(res.data)
                setForm({
                    name: res.data.name || '',
                    age: res.data.age || '',
                    document_id: res.data.document_id || '',
                    field_of_interest: res.data.field_of_interest || 'Scientist',
                })
            })
            .catch(() => { }) // 404 = new student, fine
            .finally(() => setChecking(false))
    }, [user])

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!user) { navigate('/'); return }
        setLoading(true)
        try {
            const res = await API.post('/student/register', {
                ...form,
                age: parseInt(form.age),
                user_email: user.email,
            })
            localStorage.setItem('equibridge_student', JSON.stringify(res.data))
            navigate('/student/org')
        } catch (err) {
            setError(err.response?.data?.detail || 'Registration failed')
        } finally { setLoading(false) }
    }

    const handleResume = () => {
        localStorage.setItem('equibridge_student', JSON.stringify(existing))
        navigate('/student/org')
    }

    return (
        <div className="page-container" style={{ maxWidth: 600 }}>
            <SegmentHeader
                badge="🎓 Student Flow · Step 1 of 5"
                badgeClass="badge-teal"
                title={<>Student <span className="gradient-text-teal">Registration</span></>}
                subtitle="Tell us about yourself to find the right career path"
                color="#00d4aa"
            />

            {checking ? (
                <div style={{ textAlign: 'center', padding: 40, color: 'rgba(255,255,255,0.4)' }}>Checking your profile...</div>
            ) : (
                <div className="glass" style={{ padding: 36 }}>
                    {existing && (
                        <div style={{ background: 'rgba(0,212,170,0.08)', border: '1px solid rgba(0,212,170,0.25)', borderRadius: 12, padding: '16px 20px', marginBottom: 24 }}>
                            <div style={{ fontWeight: 700, marginBottom: 4, color: '#00d4aa' }}>👋 Welcome back, {existing.name}!</div>
                            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, marginBottom: 12 }}>
                                We found your existing profile ({existing.field_of_interest}). Resume your journey or update your details below.
                            </div>
                            <button className="btn-primary" style={{ padding: '10px 20px', fontSize: 14 }} onClick={handleResume}>
                                Resume Journey →
                            </button>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: 8, fontSize: 14, color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>Full Name</label>
                            <input className="input-field" placeholder="Enter your full name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: 8, fontSize: 14, color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>Age</label>
                            <input className="input-field" type="number" placeholder="Your age" min="10" max="30" value={form.age} onChange={e => setForm({ ...form, age: e.target.value })} required />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: 8, fontSize: 14, color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>Document ID</label>
                            <input className="input-field" placeholder="Aadhar / Student ID" value={form.document_id} onChange={e => setForm({ ...form, document_id: e.target.value })} required />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: 8, fontSize: 14, color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>Field of Interest</label>
                            <select className="input-field" value={form.field_of_interest} onChange={e => setForm({ ...form, field_of_interest: e.target.value })}>
                                {FIELDS.map(f => <option key={f} value={f}>{f}</option>)}
                            </select>
                        </div>
                        {error && <p style={{ color: '#f87171', fontSize: 13 }}>{error}</p>}
                        <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: 8 }}>
                            {loading ? 'Saving...' : existing ? 'Update & Continue →' : 'Continue to Organizations →'}
                        </button>
                    </form>
                </div>
            )}
        </div>
    )
}
