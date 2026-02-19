import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import API from '../../api/client'

// ── SVG Circular Ring ─────────────────────────────────────────────────────────
function CircularRing({ pct, size = 160, stroke = 14, color = '#00d4aa' }) {
    const r = (size - stroke) / 2
    const circ = 2 * Math.PI * r
    const offset = circ - (pct / 100) * circ
    return (
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
            <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} />
            <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
                strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 1.2s ease' }} />
            <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central"
                fill="#fff" fontSize={size * 0.18} fontWeight="800" fontFamily="Outfit"
                style={{ transform: 'rotate(90deg)', transformOrigin: '50% 50%' }}>{pct}%</text>
        </svg>
    )
}

// ── Quiz Modal ────────────────────────────────────────────────────────────────
function QuizModal({ monthData, onClose, onSubmit }) {
    const [answers, setAnswers] = useState(Array(monthData.quiz.length).fill(-1))
    const [taskText, setTaskText] = useState('')
    const [result, setResult] = useState(null)
    const [loading, setLoading] = useState(false)

    const handleSubmit = async () => {
        if (answers.some(a => a === -1)) { alert('Please answer all questions!'); return }
        setLoading(true)
        const res = await onSubmit(monthData.month, answers, taskText)
        setResult(res)
        setLoading(false)
    }

    if (result) {
        return (
            <div className="modal-overlay">
                <div className="modal-box glass-strong" style={{ padding: 36, maxWidth: 480, width: '90%', textAlign: 'center' }}>
                    <div style={{ fontSize: 56, marginBottom: 16 }}>{result.passed ? '🎉' : '😔'}</div>
                    <h2 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 24, marginBottom: 8 }}>
                        {result.passed ? 'Quiz Passed!' : 'Quiz Failed'}
                    </h2>
                    <div style={{ fontSize: 48, fontWeight: 900, color: result.passed ? '#4ade80' : '#f87171', marginBottom: 8 }}>
                        {result.pct_score}%
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.5)', marginBottom: 20 }}>
                        {result.score}/{result.total} correct · {result.message}
                    </div>
                    {/* Answer review */}
                    <div style={{ textAlign: 'left', marginBottom: 20 }}>
                        {monthData.quiz.map((q, i) => (
                            <div key={i} style={{ marginBottom: 8, padding: '8px 12px', borderRadius: 8, background: answers[i] === result.correct_answers[i] ? 'rgba(74,222,128,0.08)' : 'rgba(248,113,113,0.08)', border: `1px solid ${answers[i] === result.correct_answers[i] ? 'rgba(74,222,128,0.2)' : 'rgba(248,113,113,0.2)'}` }}>
                                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>Q{i + 1}: {q.q}</div>
                                <div style={{ fontSize: 12, color: answers[i] === result.correct_answers[i] ? '#4ade80' : '#f87171' }}>
                                    {answers[i] === result.correct_answers[i] ? '✓' : '✗'} Your answer: {q.options[answers[i]]}
                                    {answers[i] !== result.correct_answers[i] && <span style={{ color: '#4ade80' }}> · Correct: {q.options[result.correct_answers[i]]}</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                    <button className="btn-primary" style={{ width: '100%', padding: 12 }} onClick={onClose}>Close</button>
                </div>
            </div>
        )
    }

    return (
        <div className="modal-overlay">
            <div className="modal-box glass-strong" style={{ padding: 32, maxWidth: 560, width: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <div>
                        <div className="badge badge-teal" style={{ marginBottom: 6 }}>Month {monthData.month} Quiz</div>
                        <h2 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 20 }}>{monthData.topic}</h2>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: 20, cursor: 'pointer' }}>✕</button>
                </div>

                {/* Questions */}
                {monthData.quiz.map((q, qi) => (
                    <div key={qi} style={{ marginBottom: 20 }}>
                        <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 10 }}>Q{qi + 1}: {q.q}</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {q.options.map((opt, oi) => (
                                <div key={oi}
                                    onClick={() => { const a = [...answers]; a[qi] = oi; setAnswers(a) }}
                                    style={{
                                        padding: '10px 14px', borderRadius: 10, cursor: 'pointer',
                                        background: answers[qi] === oi ? 'rgba(0,212,170,0.15)' : 'rgba(255,255,255,0.04)',
                                        border: `1px solid ${answers[qi] === oi ? '#00d4aa' : 'rgba(255,255,255,0.1)'}`,
                                        fontSize: 14, transition: 'all 0.2s',
                                    }}>
                                    <span style={{ color: answers[qi] === oi ? '#00d4aa' : 'rgba(255,255,255,0.7)' }}>
                                        {['A', 'B', 'C', 'D'][oi]}. {opt}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                {/* Practical Task */}
                <div style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: 12, padding: '16px 18px', marginBottom: 20 }}>
                    <div style={{ fontSize: 12, color: '#a78bfa', fontWeight: 600, marginBottom: 6 }}>🛠 PRACTICAL TASK</div>
                    <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>{monthData.task.title}</div>
                    <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, lineHeight: 1.6, marginBottom: 10 }}>{monthData.task.description}</div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 8 }}>📎 Deliverable: {monthData.task.deliverable}</div>
                    <textarea
                        placeholder="Paste your GitHub link, submission URL, or describe what you built..."
                        value={taskText}
                        onChange={e => setTaskText(e.target.value)}
                        style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, padding: '10px 12px', color: '#fff', fontSize: 13, resize: 'vertical', minHeight: 70, outline: 'none' }}
                    />
                </div>

                <button className="btn-primary" style={{ width: '100%', padding: 14, fontSize: 15 }} onClick={handleSubmit} disabled={loading}>
                    {loading ? 'Grading...' : '📤 Submit Quiz & Task'}
                </button>
            </div>
        </div>
    )
}

export default function MonthlyProgress() {
    const { user } = useAuth()
    const navigate = useNavigate()
    const org = JSON.parse(localStorage.getItem('equibridge_org') || '{}')
    const student = JSON.parse(localStorage.getItem('equibridge_student') || '{}')

    const [pipeline, setPipeline] = useState(null)
    const [curriculum, setCurriculum] = useState([])
    const [completed, setCompleted] = useState([])
    const [quizResults, setQuizResults] = useState({})
    const [activeQuiz, setActiveQuiz] = useState(null)
    const [saving, setSaving] = useState(false)
    const [totalFunding, setTotalFunding] = useState(0)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const field = student.field_of_interest || 'Software Developer'
        Promise.all([
            org.name ? API.get(`/student/pipeline/${encodeURIComponent(org.name)}`) : Promise.resolve({ data: null }),
            API.get(`/student/curriculum/${encodeURIComponent(field)}`),
            user?.email ? API.get(`/student/quiz/results/${encodeURIComponent(user.email)}`) : Promise.resolve({ data: {} }),
        ]).then(([pipeRes, currRes, quizRes]) => {
            if (pipeRes.data) setPipeline(pipeRes.data)
            setCurriculum(currRes.data || [])
            setQuizResults(quizRes.data || {})
        }).catch(() => { }).finally(() => setLoading(false))
    }, [])

    const toggleStep = (stepNum) => {
        setCompleted(prev => prev.includes(stepNum) ? prev.filter(s => s !== stepNum) : [...prev, stepNum])
    }

    const handleSave = async () => {
        if (!user?.email || !pipeline) return
        setSaving(true)
        try {
            const res = await API.post('/student/progress', {
                user_email: user.email,
                org_name: org.name,
                completed_steps: completed,
            })
            setTotalFunding(res.data.total_funding_received)
        } catch { }
        setSaving(false)
    }

    const handleQuizSubmit = async (month, answers, taskText) => {
        try {
            const res = await API.post('/student/quiz/submit', {
                user_email: user?.email || 'guest',
                month,
                answers,
                task_submission: taskText,
            })
            // Refresh quiz results
            if (user?.email) {
                const updated = await API.get(`/student/quiz/results/${encodeURIComponent(user.email)}`)
                setQuizResults(updated.data || {})
            }
            return res.data
        } catch (e) {
            return { passed: false, score: 0, total: 5, pct_score: 0, correct_answers: [], message: 'Error submitting' }
        }
    }

    const roadmap = pipeline?.roadmap || []
    const pct = roadmap.length ? Math.round((completed.length / roadmap.length) * 100) : 0
    const MILESTONE_ICONS = ['🌱', '📚', '🔬', '🏆', '💼', '🎓', '🚀']

    if (loading) return <div className="page-container" style={{ textAlign: 'center', paddingTop: 120, color: 'rgba(255,255,255,0.4)' }}>Loading...</div>

    return (
        <div className="page-container">
            <div style={{ marginBottom: 32 }}>
                <div className="badge badge-teal" style={{ marginBottom: 12 }}>🎓 Student Flow · Step 4 of 5</div>
                <h1 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 36, marginBottom: 8 }}>
                    Monthly <span className="gradient-text-teal">Progress</span>
                </h1>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 15 }}>Track your journey · Take monthly quizzes · Submit practical tasks</p>
            </div>

            {/* Top stats */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 28 }}>
                <div className="glass" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    <CircularRing pct={pct} size={120} stroke={10} />
                    <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>Pipeline Complete</div>
                </div>
                <div className="glass" style={{ padding: '18px 20px', textAlign: 'center' }}>
                    <div style={{ fontSize: 32, marginBottom: 8 }}>🏦</div>
                    <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 24, color: '#4ade80' }}>₹{totalFunding.toLocaleString()}</div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>Org Funded (you pay ₹0)</div>
                </div>
                <div className="glass" style={{ padding: '18px 20px', textAlign: 'center' }}>
                    <div style={{ fontSize: 32, marginBottom: 8 }}>📝</div>
                    <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 24, color: '#a78bfa' }}>
                        {Object.values(quizResults).filter(r => r.passed).length}/{curriculum.length}
                    </div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>Quizzes Passed</div>
                </div>
            </div>

            {/* Monthly Quizzes & Tasks */}
            {curriculum.length > 0 && (
                <div style={{ marginBottom: 28 }}>
                    <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', fontWeight: 600, marginBottom: 14 }}>📅 MONTHLY ASSESSMENTS</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                        {curriculum.map(month => {
                            const result = quizResults[`month_${month.month}`]
                            const passed = result?.passed
                            const attempted = !!result
                            return (
                                <div key={month.month} className="glass" style={{ padding: 22, border: `1px solid ${passed ? 'rgba(74,222,128,0.3)' : attempted ? 'rgba(248,113,113,0.2)' : 'rgba(255,255,255,0.08)'}` }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                                        <div>
                                            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>MONTH {month.month}</div>
                                            <div style={{ fontWeight: 700, fontSize: 16 }}>{month.topic}</div>
                                        </div>
                                        <div style={{ fontSize: 24 }}>{passed ? '✅' : attempted ? '❌' : '📋'}</div>
                                    </div>

                                    {attempted && (
                                        <div style={{ marginBottom: 12 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Score</span>
                                                <span style={{ fontSize: 12, fontWeight: 700, color: passed ? '#4ade80' : '#f87171' }}>{result.pct_score}%</span>
                                            </div>
                                            <div className="progress-bar">
                                                <div className="progress-fill" style={{ width: `${result.pct_score}%`, background: passed ? 'linear-gradient(90deg, #4ade80, #00d4aa)' : 'linear-gradient(90deg, #f87171, #f59e0b)' }} />
                                            </div>
                                            {result.task_submitted && <div style={{ fontSize: 11, color: '#a78bfa', marginTop: 6 }}>🛠 Task submitted</div>}
                                        </div>
                                    )}

                                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 12 }}>
                                        🛠 Task: {month.task.title}
                                    </div>

                                    <button
                                        className={passed ? 'btn-outline' : 'btn-primary'}
                                        style={{ width: '100%', padding: '9px 0', fontSize: 13 }}
                                        onClick={() => setActiveQuiz(month)}
                                    >
                                        {passed ? '✓ Retake Quiz' : attempted ? '🔄 Retry Quiz' : '▶ Start Quiz & Task'}
                                    </button>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* Pipeline step tracker */}
            {roadmap.length > 0 && (
                <div style={{ marginBottom: 24 }}>
                    <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', fontWeight: 600, marginBottom: 14 }}>🗺 PIPELINE STEPS — CLICK TO MARK COMPLETE</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {roadmap.map((step, i) => {
                            const done = completed.includes(step.step)
                            return (
                                <div key={step.step} onClick={() => toggleStep(step.step)} style={{
                                    display: 'flex', alignItems: 'center', gap: 16, padding: '14px 18px', borderRadius: 12, cursor: 'pointer',
                                    background: done ? 'rgba(0,212,170,0.08)' : 'rgba(255,255,255,0.03)',
                                    border: `1px solid ${done ? 'rgba(0,212,170,0.3)' : 'rgba(255,255,255,0.07)'}`,
                                    transition: 'all 0.25s',
                                }}>
                                    <div style={{ fontSize: 26, flexShrink: 0 }}>{MILESTONE_ICONS[i % MILESTONE_ICONS.length]}</div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 2 }}>{step.title}</div>
                                        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{step.duration} · Org funds: ₹{step.estimated_fee.toLocaleString()} · You pay: ₹0</div>
                                    </div>
                                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: done ? '#00d4aa' : 'rgba(255,255,255,0.1)', border: `2px solid ${done ? '#00d4aa' : 'rgba(255,255,255,0.2)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: done ? '#000' : 'transparent', transition: 'all 0.25s' }}>✓</div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}

            <div style={{ display: 'flex', gap: 12 }}>
                <button className="btn-primary" style={{ flex: 1, padding: 14, fontSize: 15 }} onClick={handleSave} disabled={saving}>
                    {saving ? 'Saving...' : '💾 Save Progress'}
                </button>
                <button className="btn-outline" style={{ flex: 1, padding: 14, fontSize: 15 }} onClick={() => navigate('/student/job')}>
                    View Job Status →
                </button>
            </div>

            {activeQuiz && (
                <QuizModal
                    monthData={activeQuiz}
                    onClose={() => setActiveQuiz(null)}
                    onSubmit={handleQuizSubmit}
                />
            )}
        </div>
    )
}
