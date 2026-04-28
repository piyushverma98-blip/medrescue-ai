import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import UserDashboard from '../components/UserDashboard';
import StaffDashboard from '../components/StaffDashboard';
import AdminDashboard from '../components/AdminDashboard';
import { LogOut } from 'lucide-react';

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);

  if (!user) return <div>Loading...</div>;

  const renderDashboard = () => {
    switch (user.role) {
      case 'user':
        return <UserDashboard />;
      case 'staff':
        return <StaffDashboard />;
      case 'admin':
      case 'superadmin':
        return <AdminDashboard role={user.role} />;
      default:
        return <div>Unknown role</div>;
    }
  };

  return (
    <div className="container" style={{ paddingTop: '20px', paddingBottom: '40px' }}>
      <header className="glass-panel" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', color: 'var(--accent)' }}>MedRescue AI</h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Welcome, {user.name} ({user.role})</p>
        </div>
        <button onClick={logout} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <LogOut size={18} /> Logout
        </button>
      </header>
      
      {renderDashboard()}
    </div>
  );
};

export default Dashboard;
