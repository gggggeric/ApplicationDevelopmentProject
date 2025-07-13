import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../utils/api';
import { showToast } from '../utils/toast';
import driveSmartLogo from '../assets/driveSmartLogo.png';
import './AdminLogin.css';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);
  const navigate = useNavigate();

  const validateForm = () => {
    if (!email.trim()) {
      showToast('error', 'Email Required', 'Please enter your email address');
      return false;
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      showToast('error', 'Invalid Email', 'Please enter a valid email address');
      return false;
    }

    if (!password.trim()) {
      showToast('error', 'Password Required', 'Please enter your password');
      return false;
    }

    if (password.length < 6) {
      showToast('error', 'Password Too Short', 'Password must be at least 6 characters');
      return false;
    }

    return true;
  };

const handleLogin = async (e) => {
  e.preventDefault();
  if (!validateForm()) return;

  setLoading(true);

  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: email.trim().toLowerCase(),
      password: password.trim()
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.data.success) {
      throw new Error(response.data.message || 'Login failed');
    }

    // Check if user is admin
    if (response.data.user.userType !== 'admin') {
      // Clear any potential stored data
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      
      showToast('error', 'Access Denied', 'Only admin users can access this portal');
      return; // Stop further execution
    }

    // Only store data and proceed if user is admin
    localStorage.setItem('authToken', response.data.token);
    localStorage.setItem('userData', JSON.stringify(response.data.user));

    showToast('success', 'Login Successful', `Welcome back, ${response.data.user.name || 'Admin'}!`);
    navigate('/dashboard'); // Redirect to dashboard
    
  } catch (error) {
    let errorMessage = 'An error occurred during login';
    
    if (error.response) {
      errorMessage = error.response.data.message || error.response.statusText;
    } else if (error.request) {
      errorMessage = 'No response from server';
    } else {
      errorMessage = error.message;
    }
    
    showToast('error', 'Login Failed', errorMessage);
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="admin-login-container">
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
            
            <h1 className="welcome-text">Admin Portal</h1>
            <p className="subtitle">Secure access to administration dashboard</p>
            
            <div className="decorative-line">
              <div className="line-segment"></div>
              <svg className="icon-car" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              <div className="line-segment"></div>
            </div>
          </div>
          
          {/* Form Card */}
          <div className="form-card">
            <div className="card-header">
              <h2 className="card-title">Admin Login</h2>
              <p className="card-subtitle">Enter your credentials to continue</p>
            </div>
            
            <form onSubmit={handleLogin}>
              <div className="input-container">
                {/* Email Input */}
                <div className={`input-wrapper ${focusedInput === 'email' ? 'input-wrapper-focused' : ''}`}>
                  <div className="input-icon-container">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <input
                    type="email"
                    placeholder="Admin email"
                    className="input-field"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocusedInput('email')}
                    onBlur={() => setFocusedInput(null)}
                    required
                  />
                </div>
                
                {/* Password Input */}
                <div className={`input-wrapper ${focusedInput === 'password' ? 'input-wrapper-focused' : ''}`}>
                  <div className="input-icon-container">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password"
                    className="input-field password-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocusedInput('password')}
                    onBlur={() => setFocusedInput(null)}
                    required
                  />
                  <button
                    type="button"
                    className="eye-icon"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              
              {/* Login Button */}
              <button
                type="submit"
                className={`login-button ${loading ? 'button-disabled' : ''}`}
                disabled={loading}
              >
                <div className="button-gradient">
                  {loading ? (
                    <div className="spinner"></div>
                  ) : (
                    <div className="button-content">
                      <span className="login-button-text">Access Dashboard</span>
                      <div className="button-icon-container">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
              </button>
            </form>
            
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

export default AdminLogin;