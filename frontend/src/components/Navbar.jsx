import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useVoiceAssistant } from '../hooks/useVoiceAssistant'
import JoinModal from './JoinModal'

export default function Navbar() {
    const { user, logout } = useAuth()
    const [showModal, setShowModal] = useState(false)
    const [showLangMenu, setShowLangMenu] = useState(false)
    const [currentLang, setCurrentLang] = useState('English')
    const navigate = useNavigate()
    const { isListening, toggleListening } = useVoiceAssistant()

    const languages = [
        { name: 'English', code: 'en' },
        { name: 'Hindi', code: 'hi' },
        { name: 'Marathi', code: 'mr' },
        { name: 'Tamil', code: 'ta' },
        { name: 'Telugu', code: 'te' },
        { name: 'Bengali', code: 'bn' },
        { name: 'Gujarati', code: 'gu' },
        { name: 'Kannada', code: 'kn' },
        { name: 'Malayalam', code: 'ml' },
    ]

    const changeLanguage = (langName, langCode) => {
        setCurrentLang(langName)
        setShowLangMenu(false)

        const googleSelect = document.querySelector('.goog-te-combo');
        if (googleSelect) {
            googleSelect.value = langCode;
            googleSelect.dispatchEvent(new Event('change'));
        }
    }

    // Force re-initialization of Google Translate if it hasn't loaded
    useEffect(() => {
        const initTranslate = () => {
            if (window.googleTranslateElementInit && window.google && window.google.translate) {
                // Only init if not already present
                if (!document.querySelector('.goog-te-gadget-simple') && !document.querySelector('.goog-te-combo')) {
                    window.googleTranslateElementInit();
                }
            }
        };

        const interval = setInterval(initTranslate, 1000);
        return () => clearInterval(interval);
    }, []);

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showLangMenu && !event.target.closest('.lang-selector-container')) {
                setShowLangMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showLangMenu]);

    return (
        <>
            <nav className="navbar notranslate">
                <Link to="/" style={{ textDecoration: 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 28 }}></span>
                        <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: 30, background: 'linear-gradient(135deg, #00d4aa, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            EquiBridge
                        </span>
                    </div>
                </Link>

                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    {/* HIDDEN Google Translate Container */}
                    <div id="google_translate_element" style={{ display: 'none', position: 'absolute', visibility: 'hidden' }}></div>

                    {/* Premium Language Selector */}
                    <div className="lang-selector-container" style={{ position: 'relative' }}>
                        <button
                            className={`btn-lang ${showLangMenu ? 'active' : ''}`}
                            onClick={() => setShowLangMenu(!showLangMenu)}
                        >
                            🌐 <span style={{ marginRight: 4 }}>{currentLang}</span>
                            <span style={{ fontSize: '10px', opacity: 0.5 }}>{showLangMenu ? '▲' : '▼'}</span>
                        </button>

                        {showLangMenu && (
                            <div className="lang-dropdown glass-strong">
                                {languages.map((lang) => (
                                    <div
                                        key={lang.code}
                                        className={`lang-item ${currentLang === lang.name ? 'active' : ''}`}
                                        onClick={() => changeLanguage(lang.name, lang.code)}
                                    >
                                        {lang.name}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Voice Mode Toggle */}
                    <button
                        className={`btn-voice ${isListening ? 'listening' : ''}`}
                        onClick={toggleListening}
                        title="Voice navigation mode"
                    >
                        {isListening ? '🎙️ Listening...' : '🎤 Voice Mode'}
                    </button>

                    {user ? (
                        <>
                            <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>
                                👤 {user.email}
                            </span>
                            <button className="btn-outline" style={{ padding: '8px 20px', fontSize: 14 }} onClick={() => { logout(); navigate('/') }}>
                                Logout
                            </button>
                        </>
                    ) : (
                        <button className="btn-primary" style={{ padding: '8px 24px', fontSize: 14 }} onClick={() => setShowModal(true)}>
                            JOIN
                        </button>
                    )}
                </div>
            </nav>

            {showModal && <JoinModal onClose={() => setShowModal(false)} />}
        </>
    )
}
