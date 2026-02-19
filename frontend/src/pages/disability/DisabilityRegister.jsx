import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import API from '../../api/client'
import SegmentHeader from '../../components/SegmentHeader'

const PROFESSIONS = ['Tailor', 'Customer Support', 'Data Entry', 'Teacher', 'Designer', 'Accountant', 'Media', 'Other']
const DISABILITY_TYPES = ['Visual Impairment', 'Hearing Impairment', 'Mobility Impairment', 'Cognitive Disability', 'Speech Impairment', 'Other']

export default function DisabilityRegister() {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [form, setForm] = useState({ name: '', id_proof: '', profession: 'Data Entry', disability_type: 'Visual Impairment', skills: '' })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!user?.email) { navigate('/'); return }
        setLoading(true)
        try {
            const skillsArray = form.skills.split(',').map(s => s.trim()).filter(s => s)
            const res = await API.post('/disability/register', {
                ...form,
                user_email: user.email,
                skills: skillsArray
            })
            localStorage.setItem('equibridge_disability', JSON.stringify(res.data))
            navigate('/disability/jobs')
        } catch (err) {
            setError('Registration failed. Please try again.')
        } finally { setLoading(false) }
    }


    return (
        <div className="page-container" style={{ maxWidth: 600 }}>
            <SegmentHeader
                badge="♿ Disability Flow · Step 1"
                badgeClass="badge-purple"
                title={<>Inclusive <span className="gradient-text-purple">Registration</span></>}
                subtitle="Register to access accessible employment opportunities"
                color="#8b5cf6"
            />

            <div className="glass" style={{ padding: 36 }}>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: 8, fontSize: 14, color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>Full Name</label>
                        <input className="input-field" placeholder="Your full name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: 8, fontSize: 14, color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>ID Proof</label>
                        <input className="input-field" placeholder="Disability certificate / Aadhar number" value={form.id_proof} onChange={e => setForm({ ...form, id_proof: e.target.value })} required />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: 8, fontSize: 14, color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>Profession / Skill</label>
                        <select className="input-field" value={form.profession} onChange={e => setForm({ ...form, profession: e.target.value })}>
                            {PROFESSIONS.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: 8, fontSize: 14, color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>Type of Disability</label>
                        <select className="input-field" value={form.disability_type} onChange={e => setForm({ ...form, disability_type: e.target.value })}>
                            {DISABILITY_TYPES.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: 8, fontSize: 14, color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>Skills (Comma separated)</label>
                        <input className="input-field" placeholder="e.g. Typing, MS Excel, Content Writing" value={form.skills} onChange={e => setForm({ ...form, skills: e.target.value })} />
                        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>These help match you with better jobs</p>
                    </div>

                    {error && <p style={{ color: '#f87171', fontSize: 13 }}>{error}</p>}
                    <button type="submit" className="btn-purple" disabled={loading} style={{ marginTop: 8 }}>
                        {loading ? 'Registering...' : 'Find Inclusive Jobs →'}
                    </button>
                </form>
            </div>
        </div>
    )
}
