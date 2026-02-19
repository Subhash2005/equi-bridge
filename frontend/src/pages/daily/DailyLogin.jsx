import { useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import API from '../../api/client'
import SegmentHeader from '../../components/SegmentHeader'

export default function DailyLogin() {
    const { user } = useAuth()
    const navigate = useNavigate()

    // Location state
    const [location, setLocation] = useState('')
    const [geoLoading, setGeoLoading] = useState(false)
    const [geoError, setGeoError] = useState('')

    // Photo state
    const [photoPreview, setPhotoPreview] = useState(null)
    const [photoName, setPhotoName] = useState('')

    // Camera modal state
    const [cameraOpen, setCameraOpen] = useState(false)
    const [cameraError, setCameraError] = useState('')
    const [stream, setStream] = useState(null)

    // Problem type state
    const [problemType, setProblemType] = useState('General Labor')
    const [customProblem, setCustomProblem] = useState('')

    // Refs
    const uploadRef = useRef(null)
    const videoRef = useRef(null)
    const canvasRef = useRef(null)
    const streamRef = useRef(null)

    const [loading, setLoading] = useState(false)


    // ── Geolocation ──────────────────────────────────────────────────────────────
    const handleAutoLocation = () => {
        if (!navigator.geolocation) {
            setGeoError('Geolocation not supported by your browser.')
            return
        }
        setGeoLoading(true)
        setGeoError('')
        navigator.geolocation.getCurrentPosition(
            async ({ coords: { latitude, longitude } }) => {
                try {
                    const res = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
                    )
                    const data = await res.json()
                    const addr = data.address
                    const area = addr.suburb || addr.neighbourhood || addr.village || addr.town || addr.city_district || addr.city || ''
                    const city = addr.city || addr.town || addr.state_district || addr.state || ''
                    setLocation(area && city ? `${area}, ${city}` : area || city || `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`)
                } catch {
                    setLocation(`${latitude.toFixed(5)}, ${longitude.toFixed(5)}`)
                }
                setGeoLoading(false)
            },
            (err) => {
                setGeoLoading(false)
                if (err.code === 1) setGeoError('Permission denied. Allow location access in your browser settings, or type manually.')
                else if (err.code === 2) setGeoError('Location unavailable. Please type your area manually.')
                else setGeoError('Timed out. Please type your area manually.')
            },
            { timeout: 10000, enableHighAccuracy: true }
        )
    }

    // ── File Upload ───────────────────────────────────────────────────────────────
    const handleFileChange = (e) => {
        const file = e.target.files[0]
        if (!file) return
        setPhotoName(file.name)
        const reader = new FileReader()
        reader.onload = (ev) => setPhotoPreview(ev.target.result)
        reader.readAsDataURL(file)
    }

    // ── Camera: Open ─────────────────────────────────────────────────────────────
    const openCamera = async () => {
        setCameraError('')
        setCameraOpen(true)
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
                audio: false,
            })
            streamRef.current = mediaStream
            setStream(mediaStream)
            // Attach stream to video element after it mounts
            setTimeout(() => {
                if (videoRef.current) {
                    videoRef.current.srcObject = mediaStream
                    videoRef.current.play()
                }
            }, 100)
        } catch (err) {
            setCameraError(
                err.name === 'NotAllowedError'
                    ? 'Camera permission denied. Please allow camera access in your browser.'
                    : err.name === 'NotFoundError'
                        ? 'No camera found on this device.'
                        : `Camera error: ${err.message}`
            )
        }
    }

    // ── Camera: Capture ───────────────────────────────────────────────────────────
    const capturePhoto = useCallback(() => {
        const video = videoRef.current
        const canvas = canvasRef.current
        if (!video || !canvas) return
        canvas.width = video.videoWidth || 640
        canvas.height = video.videoHeight || 480
        canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height)
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9)
        setPhotoPreview(dataUrl)
        setPhotoName('camera_photo.jpg')
        closeCamera()
    }, [])

    // ── Camera: Close ─────────────────────────────────────────────────────────────
    const closeCamera = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(t => t.stop())
            streamRef.current = null
        }
        setStream(null)
        setCameraOpen(false)
        setCameraError('')
    }, [])

    // ── Submit ────────────────────────────────────────────────────────────────────
    const handleRegister = async () => {
        if (!user?.email) { navigate('/'); return }
        setLoading(true)
        try {
            const probType = problemType === 'Other' ? customProblem : problemType
            const res = await API.post('/daily/post-problem', {
                user_email: user.email,
                location,
                problem_type: probType,
                photo_url: photoPreview || '',
                description: `Request for ${probType} at ${location}`
            })
            // Also register/update worker profile simultaneously for convenience
            await API.post('/daily/register', {
                user_email: user.email,
                name: user.email.split('@')[0],
                location,
                problem_type: probType,
                photo_url: photoPreview || '',
            })
            localStorage.setItem('equibridge_worker', JSON.stringify({ ...res.data, problem_id: res.data.id }))
            navigate('/daily/work')
        } catch (err) {
            console.error('Registration error:', err)
            navigate('/daily/work')
        } finally { setLoading(false) }
    }



    return (
        <div className="page-container" style={{ maxWidth: 560 }}>
            <SegmentHeader
                badge="🛠 Daily Wager Flow · Step 1"
                badgeClass="badge-amber"
                title={<>Daily <span className="gradient-text-amber">Wager</span> Setup</>}
                subtitle="Set up your profile to start finding nearby work"
                color="#f59e0b"
            />

            <div className="glass" style={{ padding: 36 }}>

                {/* ── Location ── */}
                <div style={{ marginBottom: 28 }}>
                    <label style={{ display: 'block', marginBottom: 8, fontSize: 14, color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>
                        📍 Your Location
                    </label>
                    <div style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
                        <input
                            className="input-field"
                            placeholder="Type your area (e.g. Koramangala, Bangalore)"
                            value={location}
                            onChange={e => { setLocation(e.target.value); setGeoError('') }}
                            style={{ flex: 1 }}
                        />
                        <button
                            className="btn-outline"
                            style={{ padding: '12px 14px', fontSize: 13, flexShrink: 0, minWidth: 96 }}
                            onClick={handleAutoLocation}
                            disabled={geoLoading}
                        >
                            {geoLoading ? '⏳ ...' : '📡 Detect'}
                        </button>
                    </div>
                    {geoError && <p style={{ color: '#fbbf24', fontSize: 13 }}>⚠️ {geoError}</p>}
                    {location && !geoError && <p style={{ color: '#4ade80', fontSize: 13 }}>✅ {location}</p>}
                </div>

                {/* ── Problem Type / Specialization ── */}
                <div style={{ marginBottom: 20 }}>
                    <label style={{ display: 'block', marginBottom: 8, fontSize: 14, color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>
                        🛠 Specialized Problem / Skillset
                    </label>
                    <select
                        className="input-field"
                        value={problemType}
                        onChange={e => setProblemType(e.target.value)}
                        style={{ marginBottom: problemType === 'Other' ? 10 : 0 }}
                    >
                        <option value="Plumbing">Plumbing</option>
                        <option value="Electrical Work">Electrical Work</option>
                        <option value="Carpentry">Carpentry</option>
                        <option value="Cleaning">Cleaning</option>
                        <option value="Gardening">Gardening</option>
                        <option value="General Labor">General Labor</option>
                        <option value="Other">Other (Type below)</option>
                    </select>
                    {problemType === 'Other' && (
                        <input
                            className="input-field"
                            placeholder="Describe the specialized problem"
                            value={customProblem}
                            onChange={e => setCustomProblem(e.target.value)}
                        />
                    )}
                </div>

                {/* ── Photo ── */}

                <div style={{ marginBottom: 28 }}>
                    <label style={{ display: 'block', marginBottom: 8, fontSize: 14, color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>
                        📷 Profile Photo
                    </label>

                    {/* Hidden file input */}
                    <input ref={uploadRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
                    {/* Hidden canvas for camera capture */}
                    <canvas ref={canvasRef} style={{ display: 'none' }} />

                    {/* Preview */}
                    {photoPreview ? (
                        <div style={{ position: 'relative', marginBottom: 12 }}>
                            <img
                                src={photoPreview}
                                alt="Profile preview"
                                style={{ width: '100%', maxHeight: 200, objectFit: 'cover', borderRadius: 12, border: '2px solid #f59e0b' }}
                            />
                            <div style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.7)', borderRadius: 8, padding: '4px 10px', fontSize: 12, color: '#fbbf24' }}>
                                ✅ {photoName}
                            </div>
                        </div>
                    ) : (
                        <div style={{ border: '2px dashed rgba(255,255,255,0.12)', borderRadius: 12, padding: '24px 20px', textAlign: 'center', marginBottom: 12, background: 'rgba(255,255,255,0.02)' }}>
                            <div style={{ fontSize: 36, marginBottom: 8 }}>📸</div>
                            <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 14 }}>No photo selected yet</div>
                        </div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        <button
                            className="btn-outline"
                            style={{ padding: '11px 16px', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                            onClick={() => uploadRef.current?.click()}
                        >
                            📁 Upload File
                        </button>
                        <button
                            className="btn-outline"
                            style={{ padding: '11px 16px', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, borderColor: 'rgba(245,158,11,0.4)', color: '#fbbf24' }}
                            onClick={openCamera}
                        >
                            📷 Use Camera
                        </button>
                    </div>
                </div>

                <button
                    className="btn-amber"
                    style={{ width: '100%', fontSize: 16, padding: 14 }}
                    disabled={loading || !location}
                    onClick={handleRegister}
                >
                    {loading ? 'Setting up...' : 'Find Nearby Work →'}
                </button>
                {!location && (
                    <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 13, marginTop: 10 }}>
                        Enter or detect your location to continue
                    </p>
                )}
            </div>

            {/* ── Camera Modal ── */}
            {cameraOpen && (
                <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && closeCamera()}>
                    <div className="modal-box glass-strong" style={{ width: '100%', maxWidth: 520, padding: 28, position: 'relative' }}>
                        <button
                            onClick={closeCamera}
                            style={{ position: 'absolute', top: 14, right: 16, background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: 22, cursor: 'pointer' }}
                        >✕</button>

                        <h3 style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 20, marginBottom: 16 }}>📷 Take a Photo</h3>

                        {cameraError ? (
                            <div style={{ padding: '24px 20px', textAlign: 'center' }}>
                                <div style={{ fontSize: 40, marginBottom: 12 }}>🚫</div>
                                <p style={{ color: '#f87171', fontSize: 14, lineHeight: 1.6, marginBottom: 20 }}>{cameraError}</p>
                                <button className="btn-outline" onClick={closeCamera}>Close</button>
                            </div>
                        ) : (
                            <>
                                {/* Live video feed */}
                                <div style={{ borderRadius: 12, overflow: 'hidden', background: '#000', marginBottom: 16, position: 'relative' }}>
                                    <video
                                        ref={videoRef}
                                        autoPlay
                                        playsInline
                                        muted
                                        style={{ width: '100%', display: 'block', maxHeight: 320, objectFit: 'cover' }}
                                    />
                                    {!stream && (
                                        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>
                                            Starting camera...
                                        </div>
                                    )}
                                </div>

                                <div style={{ display: 'flex', gap: 12 }}>
                                    <button
                                        className="btn-amber"
                                        style={{ flex: 1, padding: '13px 20px', fontSize: 15 }}
                                        onClick={capturePhoto}
                                        disabled={!stream}
                                    >
                                        📸 Capture Photo
                                    </button>
                                    <button className="btn-outline" style={{ padding: '13px 20px', fontSize: 15 }} onClick={closeCamera}>
                                        Cancel
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
