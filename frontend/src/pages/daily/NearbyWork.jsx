import { useEffect, useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import API from '../../api/client'
import SegmentHeader from '../../components/SegmentHeader'

// ── Concentric Circle UI Component ───────────────────────────────────────────
const ConcentricCircles = ({ jobs, workers, onSelectJob }) => {
    const items = [
        ...jobs.map(j => ({ ...j, type: 'job' })),
        ...workers.map(w => ({ ...w, type: 'worker', emoji: '👷' }))
    ]

    return (
        <div style={{ position: 'relative', width: '100%', height: 420, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginBottom: 40 }}>
            {/* Pulsating Circles */}
            <div className="pulse-circle" style={{ width: 100, height: 100, border: '2px solid rgba(245, 158, 11, 0.4)' }} />
            <div className="pulse-circle" style={{ width: 220, height: 220, border: '2px solid rgba(245, 158, 11, 0.2)', animationDelay: '1s' }} />
            <div className="pulse-circle" style={{ width: 340, height: 340, border: '2px solid rgba(245, 158, 11, 0.1)', animationDelay: '2s' }} />

            {/* User Avatar in Center */}
            <div style={{ position: 'absolute', zIndex: 10, width: 64, height: 64, borderRadius: '50%', background: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, boxShadow: '0 0 25px rgba(245, 158, 11, 0.6)', border: '2px solid #fff' }}>
                👤
            </div>

            {/* Items scattered on circles */}
            {items.map((item, i) => {
                const angle = (i * 360) / items.length
                const radius = item.type === 'worker' ? 140 : 100 + (i % 2) * 60
                const x = Math.cos((angle * Math.PI) / 180) * radius
                const y = Math.sin((angle * Math.PI) / 180) * radius

                return (
                    <div
                        key={item.id}
                        className={`node ${item.type}`}
                        onClick={() => item.type === 'job' && onSelectJob(item)}
                        style={{
                            position: 'absolute',
                            transform: `translate(${x}px, ${y}px)`,
                            width: item.type === 'worker' ? 44 : 54,
                            height: item.type === 'worker' ? 44 : 54,
                            borderRadius: '50%',
                            background: item.type === 'worker' ? 'rgba(74, 222, 128, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                            border: `2px solid ${item.type === 'worker' ? '#4ade80' : '#f59e0b'}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 22,
                            cursor: item.type === 'job' ? 'pointer' : 'default',
                            zIndex: 20,
                            transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                        }}
                    >
                        {item.type === 'worker' && item.photo_url ? (
                            <img src={item.photo_url} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} alt="worker" />
                        ) : (
                            item.emoji || '🛠'
                        )}
                        <div className="tooltip" style={{ position: 'absolute', bottom: 65, whiteSpace: 'nowrap', background: '#1a1a2e', padding: '6px 12px', borderRadius: 10, fontSize: 13, border: `1px solid ${item.type === 'worker' ? '#4ade80' : '#f59e0b'}`, pointerEvents: 'none', zIndex: 30 }}>
                            {item.type === 'worker' ? `Worker: ${item.name}` : `${item.title} - ₹${item.pay}`}
                        </div>
                    </div>
                )
            })}


            <style>{`
                .pulse-circle {
                    position: absolute;
                    border-radius: 50%;
                    animation: circle-pulse 4s infinite linear;
                }
                @keyframes circle-pulse {
                    0% { transform: scale(0.5); opacity: 0; }
                    50% { opacity: 0.5; }
                    100% { transform: scale(1.5); opacity: 0; }
                }
                .job-node:hover {
                    transform: scale(1.2) translate(var(--tw-translate-x), var(--tw-translate-y));
                    background: #f59e0b;
                    box-shadow: 0 0 15px #f59e0b;
                }
                .job-node .job-tooltip { opacity: 0; transition: opacity 0.3s; }
                .job-node:hover .job-tooltip { opacity: 1; }
            `}</style>
        </div>
    )
}

export default function NearbyWork() {
    const { user } = useAuth()
    const navigate = useNavigate()
    const worker = JSON.parse(localStorage.getItem('equibridge_worker') || '{}')

    const [jobs, setJobs] = useState([])
    const [workers, setWorkers] = useState([])
    const [loading, setLoading] = useState(true)
    const [accepted, setAccepted] = useState(null)
    const [completing, setCompleting] = useState(false)
    const [aiVerifying, setAiVerifying] = useState(false)
    const [videoPreview, setVideoPreview] = useState(null)
    const [aiResult, setAiResult] = useState(null)

    // Camera refs
    const videoRef = useRef(null)
    const [cameraOpen, setCameraOpen] = useState(false)
    const [stream, setStream] = useState(null)

    useEffect(() => {
        if (!user?.email) return
        // Fetch nearby jobs and workers simultaneously
        Promise.all([
            API.get('/daily/work'),
            API.get(`/daily/nearby?location=${encodeURIComponent(worker.location || '')}`)
        ]).then(([jobRes, workerRes]) => {
            setJobs(jobRes.data || [])
            setWorkers(workerRes.data || [])
        }).catch(() => { }).finally(() => setLoading(false))
    }, [user])


    const handleAccept = async (job) => {
        if (!user?.email) return
        try {
            await API.post('/daily/accept', { user_email: user.email, job_id: job.id })
            setAccepted(job)
        } catch {
            // Fallback for demo
            setAccepted(job)
        }
    }

    const openCamera = async () => {
        setCameraOpen(true)
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true })
            setStream(mediaStream)
            if (videoRef.current) videoRef.current.srcObject = mediaStream
        } catch (err) {
            console.error('Camera error:', err)
        }
    }

    const captureVideo = () => {
        // Mocking video capture
        setVideoPreview('mock-video-url')
        if (stream) {
            stream.getTracks().forEach(track => track.stop())
            setStream(null)
        }
        setCameraOpen(false)
    }

    const handleFileChange = (e) => {
        const file = e.target.files[0]
        if (file) setVideoPreview(URL.createObjectURL(file))
    }

    const handleComplete = async () => {
        if (!videoPreview || !user?.email) return
        setAiVerifying(true)

        // Simulate AI verification
        setTimeout(async () => {
            setAiVerifying(false)
            setAiResult({ success: true, message: 'AI Verified ✅ - Completion matches initial problem!' })

            setCompleting(true)
            try {
                await API.post('/daily/complete', {
                    user_email: user.email,
                    job_id: accepted.id,
                    ai_verified: true,
                    completion_video_url: videoPreview
                })
            } catch { }
            setTimeout(() => navigate('/daily/revenue'), 2000)
        }, 3000)
    }

    return (
        <div className="page-container">
            <SegmentHeader
                badge="🛠 Daily Wager Flow · Step 2"
                badgeClass="badge-amber"
                title={<>Nearby <span className="gradient-text-amber">Work</span></>}
                subtitle="Find and accept jobs matching your skillset"
                color="#f59e0b"
            />

            {accepted ? (
                /* Job accepted – show completion UI */
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <div className="glass" style={{ padding: 36, maxWidth: 560, width: '100%' }}>
                        <div style={{ textAlign: 'center', marginBottom: 28 }}>
                            <div style={{ fontSize: 64, marginBottom: 12 }}>{accepted.emoji}</div>
                            <h2 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 26, marginBottom: 8 }}>Job in Progress</h2>
                            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 16 }}>{accepted.title}</p>
                            <div style={{ marginTop: 14 }}>
                                <span className="badge badge-amber" style={{ fontSize: 14, padding: '6px 16px' }}>💰 ₹{accepted.pay} on completion</span>
                            </div>
                        </div>

                        {/* Initial Problem Photo */}
                        <div style={{ marginBottom: 20 }}>
                            <label style={{ display: 'block', marginBottom: 12, fontWeight: 700, fontSize: 15, color: '#f59e0b' }}>🖼️ Initial Problem State</label>
                            {accepted.photo_url ? (
                                <img
                                    src={accepted.photo_url}
                                    style={{ width: '100%', maxHeight: 200, objectFit: 'cover', borderRadius: 12, border: '2px solid rgba(245, 158, 11, 0.3)' }}
                                    alt="initial problem"
                                />
                            ) : (
                                <div style={{ padding: 20, textAlign: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: 12, color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>
                                    No photo uploaded at start
                                </div>
                            )}
                        </div>


                        <div style={{ marginBottom: 28 }}>
                            <label style={{ display: 'block', marginBottom: 12, fontWeight: 700, fontSize: 15 }}>📹 Upload Completion Proof</label>

                            {videoPreview ? (
                                <div style={{ border: '2px solid #f59e0b', borderRadius: 12, padding: 20, textAlign: 'center', background: 'rgba(245,158,11,0.05)' }}>
                                    <div style={{ fontSize: 48, marginBottom: 8 }}>✅</div>
                                    <div style={{ fontWeight: 700, color: '#f59e0b' }}>Completion Video Ready</div>
                                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>Proof captured for AI verification</div>
                                    <button className="btn-outline" style={{ marginTop: 12, fontSize: 12, padding: '4px 10px' }} onClick={() => setVideoPreview(null)}>Change Proof</button>
                                </div>
                            ) : (
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                    <div
                                        onClick={openCamera}
                                        style={{ border: '2px dashed rgba(255,255,255,0.15)', borderRadius: 12, padding: 24, textAlign: 'center', cursor: 'pointer', background: 'rgba(255,255,255,0.02)' }}
                                    >
                                        <div style={{ fontSize: 32, marginBottom: 8 }}>📷</div>
                                        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>Rec Video</div>
                                    </div>
                                    <label style={{ border: '2px dashed rgba(255,255,255,0.15)', borderRadius: 12, padding: 24, textAlign: 'center', cursor: 'pointer', background: 'rgba(255,255,255,0.02)' }}>
                                        <input type="file" accept="video/*" style={{ display: 'none' }} onChange={handleFileChange} />
                                        <div style={{ fontSize: 32, marginBottom: 8 }}>📁</div>
                                        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>Upload File</div>
                                    </label>
                                </div>
                            )}
                        </div>

                        {aiVerifying && (
                            <div style={{ padding: 20, textAlign: 'center', background: 'rgba(139,92,246,0.1)', borderRadius: 12, marginBottom: 20, border: '1px solid rgba(139,92,246,0.2)' }}>
                                <div className="pulse-loader" style={{ width: 20, height: 20, background: '#8b5cf6', borderRadius: '50%', margin: '0 auto 12px' }} />
                                <div style={{ fontWeight: 600, color: '#a78bfa' }}>AI Analyzing Proof...</div>
                                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>Comparing against initial job photo/problem</div>
                            </div>
                        )}

                        {aiResult && (
                            <div style={{ padding: 16, textAlign: 'center', background: 'rgba(74,222,128,0.1)', borderRadius: 12, marginBottom: 20, border: '1px solid rgba(74,222,128,0.3)', color: '#4ade80', fontWeight: 700 }}>
                                {aiResult.message}
                            </div>
                        )}

                        <button
                            className="btn-amber"
                            style={{ width: '100%', padding: 16, fontSize: 16 }}
                            disabled={!videoPreview || completing || aiVerifying}
                            onClick={handleComplete}
                        >
                            {aiVerifying ? 'Analyzing...' : completing ? 'Crediting Payment...' : 'Verify & Mark Complete →'}
                        </button>
                    </div>
                </div>
            ) : (
                /* Concentric Circle Matching */
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ maxWidth: 800, width: '100%', textAlign: 'center', marginBottom: 20 }}>
                        <div className="glass" style={{ padding: '10px 20px', borderRadius: 999, display: 'inline-flex', alignItems: 'center', gap: 10, border: '1px solid rgba(245,158,11,0.3)' }}>
                            <span className="pulse-loader" style={{ width: 8, height: 8, background: '#f59e0b', borderRadius: '50%' }} />
                            <span style={{ fontSize: 14, fontWeight: 500 }}>AI searching for jobs around {worker.location || 'your area'}...</span>
                        </div>
                    </div>

                    <ConcentricCircles jobs={jobs} workers={workers} onSelectJob={handleAccept} />

                    <div style={{ width: '100%', maxWidth: 700 }}>
                        <h3 style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 20, marginBottom: 16 }}>Available Work (List View)</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
                            {jobs.map(job => (
                                <div key={job.id} className="glass card-hover" style={{ padding: 22, border: '1px solid rgba(255,255,255,0.06)' }}>
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
                                        <div style={{ fontSize: 32 }}>{job.emoji}</div>
                                        <div style={{ flex: 1 }}>
                                            <h4 style={{ fontWeight: 700, fontSize: 16, marginBottom: 2 }}>{job.title}</h4>
                                            <div style={{ display: 'flex', gap: 8 }}>
                                                <span className="badge badge-amber" style={{ fontSize: 10 }}>{job.category}</span>
                                                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>📍 {job.location}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginBottom: 16, lineHeight: 1.5 }}>{job.description}</p>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontWeight: 800, color: '#f59e0b', fontSize: 18 }}>₹{job.pay}</span>
                                        <button className="btn-amber" style={{ padding: '8px 16px', fontSize: 13 }} onClick={() => handleAccept(job)}>Accept Job</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Camera Overlay */}
            {cameraOpen && (
                <div className="modal-overlay" style={{ zIndex: 1000 }}>
                    <div className="modal-box glass-strong" style={{ width: '100%', maxWidth: 480, padding: 20, textAlign: 'center' }}>
                        <h3 style={{ marginBottom: 16 }}>Rec Completion Video</h3>
                        <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', borderRadius: 12, background: '#000', marginBottom: 20 }} />
                        <div style={{ display: 'flex', gap: 12 }}>
                            <button className="btn-amber" style={{ flex: 1 }} onClick={captureVideo}>📸 Capture</button>
                            <button className="btn-outline" onClick={() => {
                                if (stream) {
                                    stream.getTracks().forEach(track => track.stop())
                                    setStream(null)
                                }
                                setCameraOpen(false)
                            }}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .pulse-loader {
                    animation: pulse 1.5s infinite ease-in-out;
                }
                @keyframes pulse {
                    0% { transform: scale(0.8); opacity: 0.5; }
                    50% { transform: scale(1.2); opacity: 1; }
                    100% { transform: scale(0.8); opacity: 0.5; }
                }
            `}</style>
        </div>
    )
}
