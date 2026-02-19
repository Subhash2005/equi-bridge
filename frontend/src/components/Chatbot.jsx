import { useState, useEffect, useRef } from 'react';

export default function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { text: "Hi! How can I help you today?", isBot: true }
    ]);
    const [inputValue, setInputValue] = useState('');
    const scrollRef = useRef(null);

    const questions = [
        "What is EquiBridge?",
        "How to join as a student?",
        "How does daily wager work?",
        "Disability job matching?",
        "Contact support"
    ];

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = (text) => {
        if (!text.trim()) return;

        const newMessages = [...messages, { text, isBot: false }];
        setMessages(newMessages);
        setInputValue('');

        // Simulated AI response
        setTimeout(() => {
            let response = "That's a great question! EquiBridge connects people to structured opportunities. For specific details on that, check our portal sections.";

            if (text.includes("student")) response = "Students can join the Dream Pipeline to get sponsor backing and career guidance.";
            if (text.includes("daily")) response = "The Daily Wager section offers local gig work with automated micro-savings features.";
            if (text.includes("disability")) response = "We offer inclusive job matching and skills-based opportunities for persons with disabilities.";

            setMessages(prev => [...prev, { text: response, isBot: true }]);
        }, 1000);
    };

    return (
        <div className="chatbot-container notranslate">
            {/* FAB */}
            <button
                className={`chatbot-fab ${isOpen ? 'active' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? '✕' : '💬'}
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className="chat-window shadow-xl">
                    <div className="chat-header">
                        <div style={{ fontWeight: 800, fontSize: 18 }}>EquiAssistant</div>
                        <div style={{ fontSize: 12, opacity: 0.7 }}>Powered by AI</div>
                    </div>

                    <div className="chat-messages" ref={scrollRef}>
                        {messages.map((m, i) => (
                            <div key={i} className={`message-bubble ${m.isBot ? 'bot' : 'user'}`}>
                                {m.text}
                            </div>
                        ))}
                    </div>

                    {/* Quick Questions */}
                    <div className="quick-questions">
                        {questions.map((q, i) => (
                            <button key={i} className="quick-q-btn" onClick={() => handleSend(q)}>
                                {q}
                            </button>
                        ))}
                    </div>

                    <div className="chat-input-area">
                        <input
                            type="text"
                            className="chat-input"
                            placeholder="Type a message..."
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend(inputValue)}
                        />
                        <button className="chat-send-btn" onClick={() => handleSend(inputValue)}>
                            ➔
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
