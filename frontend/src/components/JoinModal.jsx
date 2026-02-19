import { useState } from 'react'
import { GoogleLogin } from '@react-oauth/google'
import { jwtDecode } from 'jwt-decode'
import { useAuth } from '../context/AuthContext'
import API from '../api/client'

const CLIENT_ID_SET = !!import.meta.env.VITE_GOOGLE_CLIENT_ID &&
    import.meta.env.VITE_GOOGLE_CLIENT_ID !== 'YOUR_GOOGLE_CLIENT_ID_HERE.apps.googleusercontent.com'

export default function JoinModal({ onClose }) {
    const { login } = useAuth()
    const [mode, setMode] = useState('login') // login | register
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)
    const [successName, setSuccessName] = useState('')

    // ── Email / Password ──────────────────────────────────────────────────────
    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        try {
            if (mode === 'register') {
                await API.post('/auth/register', { email, password })
                setMode('login')
                setLoading(false)
                return
            }
            const res = await API.post('/auth/login', { email, password })
            login(res.data)
            setSuccessName(res.data.email.split('@')[0])
            setSuccess(true)
            setTimeout(() => onClose(), 2200)
        } catch (err) {
            setError(err.response?.data?.detail || 'Something went wrong')
        } finally {
            setLoading(false)
        }
    }

    // ── Real Google OAuth success ─────────────────────────────────────────────
    const handleGoogleSuccess = async (credentialResponse) => {
        setLoading(true)
        setError('')
        try {
            // Decode the JWT to get user info (name, email, picture)
            const decoded = jwtDecode(credentialResponse.credential)
            const { email: gEmail, name, sub: googleId, picture } = decoded

            // Send credential token to backend for verification & auto-register
            const res = await API.post('/auth/google', {
                credential: credentialResponse.credential,
                email: gEmail,
                name,
                google_id: googleId,
                picture,
            })

            login(res.data)
            setSuccessName(name || gEmail.split('@')[0])
            setSuccess(true)
            setTimeout(() => onClose(), 2200)
        } catch (err) {
            setError(err.response?.data?.detail || 'Google sign-in failed. Please try email/password.')
        } finally {
            setLoading(false)
        }
    }

    const handleGoogleError = () => {
        setError('Google sign-in was cancelled or failed. Please try again or use email/password.')
    }

    return (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="modal-box glass-strong" style={{ width: '100%', maxWidth: 420, padding: 36, position: 'relative' }}>
                {/* Close */}
                <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: 22, cursor: 'pointer', lineHeight: 1 }}>✕</button>

                {success ? (
                    <div style={{ textAlign: 'center', padding: '20px 0' }}>
                        <div style={{ fontSize: 56, marginBottom: 16 }}>📢</div>
                        <h2 style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 22, marginBottom: 8 }}>
                            Welcome, {successName}!
                        </h2>
                        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 15 }}>
                            You have joined the EquiBridge Community
                        </p>
                    </div>
                ) : (
                    <>
                        <div style={{ textAlign: 'center', marginBottom: 28 }}>
                            <div style={{ fontSize: 40, marginBottom: 8 }}></div>
                            <h2 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 24, marginBottom: 4 }}>
                                {mode === 'login' ? 'Welcome Back' : 'Create Account'}
                            </h2>
                            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>Join the opportunity exchange</p>
                        </div>

                        {/* ── Google Login ── */}
                        <div style={{ marginBottom: 20 }}>
                            {CLIENT_ID_SET ? (
                                /* Real Google OAuth button */
                                <div style={{ display: 'flex', justifyContent: 'center' }}>
                                    <GoogleLogin
                                        onSuccess={handleGoogleSuccess}
                                        onError={handleGoogleError}
                                        theme="filled_black"
                                        shape="rectangular"
                                        size="large"
                                        text="continue_with"
                                        width="348"
                                        logo_alignment="left"
                                    />
                                </div>
                            ) : (
                                /* Fallback: show setup notice */
                                <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 10, padding: '14px 16px', textAlign: 'center' }}>
                                    <p style={{ color: '#fbbf24', fontSize: 13, marginBottom: 6, fontWeight: 600 }}>⚙️ Google Sign-In Setup Required</p>
                                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, lineHeight: 1.6 }}>
                                        Add your Google Client ID to <code style={{ color: '#fbbf24' }}>frontend/.env</code> to enable Google login.
                                        See the file for instructions.
                                    </p>
                                </div>
                            )}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }} />
                            <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>or</span>
                            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }} />
                        </div>

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            <input className="input-field" type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} required />
                            <input className="input-field" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />

                            {error && <p style={{ color: '#f87171', fontSize: 13, textAlign: 'center' }}>{error}</p>}

                            <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', marginTop: 4 }}>
                                {loading ? '...' : mode === 'login' ? 'Sign In' : 'Create Account'}
                            </button>
                        </form>

                        <p style={{ textAlign: 'center', marginTop: 18, fontSize: 14, color: 'rgba(255,255,255,0.5)' }}>
                            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                            <button onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError('') }} style={{ background: 'none', border: 'none', color: '#00d4aa', cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>
                                {mode === 'login' ? 'Register' : 'Sign In'}
                            </button>
                        </p>
                    </>
                )}
            </div>
        </div>
    )
}
