import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { AlertTriangle, CheckCircle, MapPin } from 'lucide-react';

const StaffDashboard = () => {
  const { token } = useContext(AuthContext);
  const [emergencies, setEmergencies] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchEmergencies = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/emergency', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setEmergencies(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmergencies();
    const interval = setInterval(fetchEmergencies, 5000); // Poll every 5s
    return () => clearInterval(interval);
  }, [token]);

  const resolveEmergency = async (id) => {
    try {
      await fetch(`http://localhost:5000/api/emergency/${id}/resolve`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchEmergencies();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="glass-card">
      <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <AlertTriangle color="var(--warning)" /> Active Emergencies
      </h2>

      {loading ? <p>Loading alerts...</p> : emergencies.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
          <CheckCircle size={48} style={{ marginBottom: '10px', color: 'var(--success)' }} />
          <p>No active emergencies. All clear.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '15px' }}>
          {emergencies.map(em => (
            <div key={em.id} style={{ 
              background: 'rgba(230, 57, 70, 0.1)', 
              border: '1px solid var(--primary)', 
              padding: '20px', 
              borderRadius: '12px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <h3 style={{ color: 'var(--primary)', marginBottom: '5px' }}>SOS Alert - {em.type.toUpperCase()}</h3>
                <p><strong>User:</strong> {em.name} ({em.email})</p>
                <p style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '5px' }}>
                  <MapPin size={16} color="var(--text-muted)" /> Lat: {em.latitude}, Lng: {em.longitude}
                </p>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '5px' }}>Reported at: {new Date(em.created_at).toLocaleString()}</p>
              </div>
              <button onClick={() => resolveEmergency(em.id)} className="btn btn-primary" style={{ background: 'var(--success)' }}>
                Resolve / Accept
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StaffDashboard;
