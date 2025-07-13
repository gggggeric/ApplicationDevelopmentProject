import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { showToast } from '../utils/toast';
import driveSmartLogo from '../assets/driveSmartLogo.png';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();

  // Check authentication and admin status on component mount
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('userData'));

    if (!userData) {
      showToast('error', 'Session Expired', 'Please login again');
      navigate('/');
      return;
    }

    if (userData.userType !== 'admin') {
      showToast('error', 'Access Denied', 'Admin privileges required');
      navigate('/');
      return;
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    navigate('/admin/login');
    showToast('success', 'Logged Out', 'You have been successfully logged out');
  };

  return (
    <div className="admin-dashboard-container">
      <div className="gradient-background">
        {/* Decorative Circles */}
        <div className="decorative-circle-1"></div>
        <div className="decorative-circle-2"></div>
        <div className="decorative-circle-3"></div>

        <div className="scroll-content">
          {/* Header Section */}
          <div className="header-section">
            <div className="logo-container">
              <div className="logo-background">
                <img src={driveSmartLogo} alt="Logo" className="logo" />
              </div>
              <div className="logo-shadow"></div>
            </div>
            
            <h1 className="welcome-text">Admin Dashboard</h1>
            <p className="subtitle">Manage your application settings and users</p>
            
            <div className="decorative-line">
              <div className="line-segment"></div>
              <svg className="icon-car" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              <div className="line-segment"></div>
            </div>
          </div>
          
          {/* Dashboard Content */}
          <div className="dashboard-card">
            <div className="card-header">
              <h2 className="card-title">Welcome Back</h2>
              <p className="card-subtitle">Admin control panel</p>
            </div>
            
            <div className="dashboard-content">
              <div className="stats-container">
                <div className="stat-card">
                  <div className="stat-icon">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div className="stat-value">1,248</div>
                  <div className="stat-label">Total Users</div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-icon">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <div className="stat-value">356</div>
                  <div className="stat-label">Reports</div>
                </div>
              </div>
              
              <div className="quick-actions">
                <button className="action-button">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add New User
                </button>
                
                <button className="action-button">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Settings
                </button>
              </div>
            </div>
            
            <button 
              onClick={handleLogout}
              className="logout-button"
            >
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Log Out
            </button>
            
            {/* Security Note */}
            <div className="security-note">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>Restricted to authorized personnel only</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;