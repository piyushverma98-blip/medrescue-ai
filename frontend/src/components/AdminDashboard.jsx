import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Users, Shield } from 'lucide-react';

const AdminDashboard = ({ role }) => {
  const { token, user: currentUser } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchUsers = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/roles', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [token]);

  const updateRole = async (userId, newRole) => {
    setError('');
    try {
      const res = await fetch(`http://localhost:5000/api/roles/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role: newRole })
      });
      
      if (res.ok) {
        fetchUsers();
      } else {
        const data = await res.json();
        setError(data.msg);
      }
    } catch (err) {
      console.error(err);
      setError('Server Error');
    }
  };

  return (
    <div className="glass-card">
      <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <Shield /> User Role Management
      </h2>

      {error && <div style={{ background: 'rgba(230,57,70,0.2)', padding: '10px', borderRadius: '8px', color: 'var(--primary)', marginBottom: '20px' }}>{error}</div>}

      {loading ? <p>Loading users...</p> : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.05)' }}>
                <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid var(--glass-border)' }}>Name</th>
                <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid var(--glass-border)' }}>Email</th>
                <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid var(--glass-border)' }}>Current Role</th>
                <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid var(--glass-border)' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td style={{ padding: '15px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>{u.name}</td>
                  <td style={{ padding: '15px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>{u.email}</td>
                  <td style={{ padding: '15px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <span style={{ 
                      padding: '4px 8px', 
                      borderRadius: '4px', 
                      background: u.role === 'superadmin' ? 'var(--primary)' : (u.role === 'admin' ? 'var(--warning)' : 'rgba(255,255,255,0.1)'),
                      color: u.role === 'admin' ? '#000' : '#fff',
                      fontSize: '0.85rem'
                    }}>
                      {u.role.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: '15px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    {u.id !== currentUser.id && u.role !== 'superadmin' && (
                      <select 
                        value={u.role} 
                        onChange={(e) => updateRole(u.id, e.target.value)}
                        className="form-control"
                        style={{ padding: '8px', fontSize: '0.9rem' }}
                        disabled={role === 'admin' && e.target?.value === 'admin'} // Admin can't create admin (handled in backend too)
                      >
                        <option value="user">User</option>
                        <option value="staff">Staff</option>
                        {role === 'superadmin' && <option value="admin">Admin</option>}
                      </select>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
