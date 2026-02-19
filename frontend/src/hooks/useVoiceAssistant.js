import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const useVoiceAssistant = () => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const navigate = useNavigate();
    const { logout } = useAuth();

    const speak = useCallback((text) => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1;
        utterance.pitch = 1;
        window.speechSynthesis.speak(utterance);
    }, []);

    const processCommand = useCallback((command) => {
        const cmd = command.toLowerCase();
        console.log('Processing voice command:', cmd);

        if (cmd.includes('go home') || cmd.includes('dashboard')) {
            speak('Navigating to home page');
            navigate('/');
        } else if (cmd.includes('student')) {
            speak('Opening student portal');
            navigate('/student');
        } else if (cmd.includes('daily work')) {
            speak('Opening daily work sector');
            navigate('/daily/work');
        } else if (cmd.includes('disability') || cmd.includes('jobs')) {
            speak('Opening disability jobs portal');
            navigate('/disability/jobs');
        } else if (cmd.includes('logout') || cmd.includes('sign out')) {
            speak('Logging you out. Goodbye.');
            logout();
            navigate('/');
        } else if (cmd.includes('help')) {
            speak('You can say commands like: go home, student portal, daily work, disability jobs, or logout.');
        } else {
            speak(`I heard ${cmd}, but I don't recognize that command. Say help for options.`);
        }
    }, [navigate, logout, speak]);

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            console.error('Speech recognition not supported in this browser.');
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
            setIsListening(true);
            console.log('Voice recognition started');
        };

        recognition.onresult = (event) => {
            const current = event.resultIndex;
            const resultTranscript = event.results[current][0].transcript;
            setTranscript(resultTranscript);
            processCommand(resultTranscript);
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error', event.error);
            setIsListening(false);
        };

        recognition.onend = () => {
            setIsListening(false);
            console.log('Voice recognition ended');
        };

        if (isListening) {
            recognition.start();
        }

        return () => {
            recognition.stop();
        };
    }, [isListening, processCommand]);

    const toggleListening = () => {
        if (!isListening) {
            speak('Voice mode activated. How can I help you?');
            setIsListening(true);
        } else {
            speak('Voice mode deactivated.');
            setIsListening(false);
        }
    };

    return { isListening, transcript, toggleListening };
};
