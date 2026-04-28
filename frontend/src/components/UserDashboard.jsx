import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Mic, MicOff, AlertCircle, Send, MapPin } from 'lucide-react';

const UserDashboard = () => {
  const { token } = useContext(AuthContext);
  const [isListening, setIsListening] = useState(false);
  const [sosActive, setSosActive] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [location, setLocation] = useState(null);

  // Initialize Speech Recognition
  let recognition = null;
  if ('webkitSpeechRecognition' in window) {
    recognition = new window.webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase();
      console.log('Heard:', transcript);
      
      if (transcript.includes('help') || transcript.includes('emergency')) {
        triggerSOS();
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      if (isListening) recognition.start(); // Keep listening if active
    };
  }

  const toggleListening = () => {
    if (isListening) {
      recognition?.stop();
      setIsListening(false);
    } else {
      recognition?.start();
      setIsListening(true);
    }
  };

  const triggerSOS = async () => {
    if (sosActive) return;
    setSosActive(true);
    
    // Mock Location
    const mockLocation = { lat: 37.7749, lng: -122.4194 };
    setLocation(mockLocation);

    try {
      await fetch('http://localhost:5000/api/emergency', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ type: 'medical', latitude: mockLocation.lat, longitude: mockLocation.lng })
      });
      
      setChatMessages(prev => [...prev, { sender: 'ai', text: 'EMERGENCY TRIGGERED. Location captured. Finding nearest hospital. Staff alerted.' }]);
    } catch (err) {
      console.error(err);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMsg = { sender: 'user', text: inputText };
    setChatMessages(prev => [...prev, userMsg]);
    setInputText('');

    try {
      const res = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: userMsg.text, language: 'en' })
      });
      const data = await res.json();
      setChatMessages(prev => [...prev, { sender: 'ai', text: data.reply }]);
      
      if (userMsg.text.toLowerCase().includes('help')) triggerSOS();
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    return () => recognition?.stop(); // Cleanup
  }, [recognition]);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
      {/* Panic UI & SOS */}
      <div className="glass-card flex-col items-center justify-between" style={{ display: 'flex', minHeight: '400px' }}>
        <h2 style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AlertCircle /> Panic Mode UI
        </h2>
        
        <button 
          className="sos-button"
          onClick={triggerSOS}
          style={{ background: sosActive ? '#555' : 'var(--primary)' }}
          disabled={sosActive}
        >
          {sosActive ? 'SOS SENT' : 'SOS'}
        </button>
        
        <div style={{ width: '100%', textAlign: 'center', marginTop: '20px' }}>
          <button onClick={toggleListening} className={`btn ${isListening ? 'btn-primary' : 'btn-secondary'}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', width: '100%' }}>
            {isListening ? <Mic size={18} /> : <MicOff size={18} />}
            {isListening ? 'Voice Trigger Active' : 'Enable Voice Trigger ("Help")'}
          </button>
        </div>

        {location && (
          <div style={{ marginTop: '20px', padding: '15px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', width: '100%' }}>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '10px' }}><MapPin size={16} /> Location Captured</h4>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Lat: {location.lat}, Lng: {location.lng}</p>
            <p style={{ fontSize: '0.9rem', color: 'var(--success)', marginTop: '5px' }}>Nearest Hospital: St. Jude Medical (2km)</p>
          </div>
        )}
      </div>

      {/* AI Chatbot */}
      <div className="glass-card flex-col" style={{ display: 'flex', minHeight: '400px' }}>
        <h2 style={{ marginBottom: '15px' }}>Multi-Language AI</h2>
        
        <div style={{ flex: 1, overflowY: 'auto', padding: '10px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', marginBottom: '15px' }}>
          {chatMessages.length === 0 && <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '20px' }}>Ask for help or say "Emergency" to trigger SOS.</p>}
          {chatMessages.map((msg, idx) => (
            <div key={idx} style={{ 
              padding: '10px', 
              borderRadius: '8px', 
              marginBottom: '10px',
              background: msg.sender === 'user' ? 'rgba(69, 123, 157, 0.3)' : 'rgba(230, 57, 70, 0.2)',
              alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
              marginLeft: msg.sender === 'user' ? '20%' : '0',
              marginRight: msg.sender === 'ai' ? '20%' : '0',
              border: `1px solid ${msg.sender === 'user' ? 'rgba(69, 123, 157, 0.5)' : 'rgba(230, 57, 70, 0.4)'}`
            }}>
              {msg.text}
            </div>
          ))}
        </div>

        <form onSubmit={sendMessage} style={{ display: 'flex', gap: '10px' }}>
          <input 
            type="text" 
            className="form-control" 
            style={{ flex: 1 }} 
            placeholder="Type your message..." 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
          <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default UserDashboard;
