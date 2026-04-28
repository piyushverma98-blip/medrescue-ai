import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CheckCircle2, Circle } from 'lucide-react';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const validations = {
    length: formData.password.length >= 8,
    upper: /[A-Z]/.test(formData.password),
    lower: /[a-z]/.test(formData.password),
    number: /[0-9]/.test(formData.password),
    special: /[^A-Za-z0-9]/.test(formData.password),
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isLogin && (!Object.values(validations).every(v => v))) {
      setError('Please meet all password and email requirements.');
      return;
    }

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    
    try {
      const res = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      
      if (res.ok) {
        login(data.token, { name: data.name, role: data.role });
        navigate('/');
      } else {
        setError(data.msg || 'Authentication failed');
      }
    } catch (err) {
      setError('Server error. Please try again later.');
    }
  };

  return (
    <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <div className="glass-panel" style={{ padding: '40px', width: '100%', maxWidth: '450px' }}>
        <h2 className="text-center" style={{ marginBottom: '10px' }}>MedRescue AI</h2>
        <p className="text-center text-muted" style={{ marginBottom: '30px' }}>Smart Emergency Coordination</p>
        
        {error && <div style={{ background: 'rgba(230,57,70,0.2)', padding: '10px', borderRadius: '8px', color: 'var(--primary)', marginBottom: '20px', textAlign: 'center' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label>Name</label>
              <input type="text" name="name" className="form-control" value={formData.name} onChange={handleChange} required />
            </div>
          )}
          
          <div className="form-group">
            <label>Email</label>
            <input type="email" name="email" className="form-control" value={formData.email} onChange={handleChange} required />
            {!isLogin && (
              <ul className="validation-list">
                <li className={validations.email ? 'valid' : ''}>
                  {validations.email ? <CheckCircle2 size={14} /> : <Circle size={14} />} Valid email format (contains @ and domain)
                </li>
              </ul>
            )}
          </div>
          
          <div className="form-group">
            <label>Password</label>
            <input type="password" name="password" className="form-control" value={formData.password} onChange={handleChange} required />
            
            {!isLogin && (
              <ul className="validation-list">
                <li className={validations.length ? 'valid' : ''}>
                  {validations.length ? <CheckCircle2 size={14} /> : <Circle size={14} />} 8+ characters
                </li>
                <li className={validations.upper ? 'valid' : ''}>
                  {validations.upper ? <CheckCircle2 size={14} /> : <Circle size={14} />} Uppercase letter
                </li>
                <li className={validations.lower ? 'valid' : ''}>
                  {validations.lower ? <CheckCircle2 size={14} /> : <Circle size={14} />} Lowercase letter
                </li>
                <li className={validations.number ? 'valid' : ''}>
                  {validations.number ? <CheckCircle2 size={14} /> : <Circle size={14} />} Number
                </li>
                <li className={validations.special ? 'valid' : ''}>
                  {validations.special ? <CheckCircle2 size={14} /> : <Circle size={14} />} Special character
                </li>
              </ul>
            )}
          </div>

          <button type="submit" className="btn btn-primary w-full mt-2">
            {isLogin ? 'Login' : 'Sign Up'}
          </button>
        </form>

        <div className="text-center mt-2" style={{ marginTop: '20px' }}>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
            <span 
              style={{ color: 'var(--accent)', cursor: 'pointer', textDecoration: 'underline' }} 
              onClick={() => { setIsLogin(!isLogin); setError(''); }}
            >
              {isLogin ? 'Sign Up' : 'Login'}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
