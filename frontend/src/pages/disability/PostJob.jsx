import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../../api/client'
import SegmentHeader from '../../components/SegmentHeader'

const PROFESSIONS = ['Data Entry', 'Tailor', 'Customer Support', 'Teacher', 'Designer', 'Accountant', 'Media', 'Other']

export default function PostJob() {
    const navigate = useNavigate()
    const [form, setForm] = useState({
        title: '',
        company: '',
        description: '',
        required_skills: '',
        pay: '',
        profession: 'Data Entry'
    })
    const [loading, setLoading] = useState(false)
    const [msg, setMsg] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setMsg('')
        try {
            const skillsArray = form.required_skills.split(',').map(s => s.trim()).filter(s => s)
            await API.post('/disability/post-job', {
                ...form,
                pay: parseFloat(form.pay),
                required_skills: skillsArray
            })
            setMsg('✅ Job posted successfully! Redirecting to vacancies...')
            setTimeout(() => navigate('/disability/jobs'), 2000)
        } catch (err) {
            setMsg('❌ Failed to post job. Please try again.')
        } finally { setLoading(false) }
    }

    return (
        <div className="page-container" style={{ maxWidth: 600 }}>
            <SegmentHeader
                badge="🏢 Org / NGO Portal"
                badgeClass="badge-purple"
                title={<>Post a <span className="gradient-text-purple">Vocational</span> Job</>}
                subtitle="Provide accessible work opportunities for people with disabilities"
                color="#8b5cf6"
            />

            <div className="glass" style={{ padding: 36 }}>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: 8, fontSize: 14, color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>Job Title</label>
                        <input className="input-field" placeholder="e.g. Remote Data Entry Operator" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: 8, fontSize: 14, color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>Organization / NGO Name</label>
                        <input className="input-field" placeholder="Your Org name" value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} required />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: 8, fontSize: 14, color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>Target Profession</label>
                        <select className="input-field" value={form.profession} onChange={e => setForm({ ...form, profession: e.target.value })}>
                            {PROFESSIONS.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: 8, fontSize: 14, color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>Required Skills (Comma separated)</label>
                        <input className="input-field" placeholder="e.g. Typing, MS Excel" value={form.required_skills} onChange={e => setForm({ ...form, required_skills: e.target.value })} required />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: 8, fontSize: 14, color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>Description</label>
                        <textarea className="input-field" style={{ minHeight: 100, paddingTop: 12 }} placeholder="Fully describe the work..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: 8, fontSize: 14, color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>Pay Amount (₹)</label>
                        <input className="input-field" type="number" placeholder="5000" value={form.pay} onChange={e => setForm({ ...form, pay: e.target.value })} required />
                    </div>

                    {msg && <p style={{ color: msg.startsWith('✅') ? '#4ade80' : '#f87171', fontSize: 14 }}>{msg}</p>}

                    <button type="submit" className="btn-purple" disabled={loading} style={{ marginTop: 8 }}>
                        {loading ? 'Posting...' : '🚀 Post Job Now'}
                    </button>
                    <button type="button" className="btn-outline" onClick={() => navigate('/disability/jobs')}>
                        Back to Job View
                    </button>
                </form>
            </div>
        </div>
    )
}
