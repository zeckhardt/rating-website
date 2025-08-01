import React, { useState, useCallback } from 'react';
import secret from './secrets';
import './Modal.css';

const LoginModal = ({
  isOpen,
  onToggle,
  isAuthenticated,
  onAuthenticationChange,
  password,
  onPasswordChange
}) => {
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  /**
   * Handles login form submission
   * @param {Event} e - Form submit event
   */
  const handleLogin = useCallback(async (e) => {
    e.preventDefault();
    
    if (!password.trim()) {
      setLoginError('Please enter a password');
      return;
    }

    try {
      setIsLoggingIn(true);
      setLoginError('');
      
      // Simulate a small delay for better UX
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (password === secret) {
        onAuthenticationChange(true);
        onToggle();
        onPasswordChange(''); // Clear password on successful login
      } else {
        setLoginError('Invalid password. Please try again.');
      }
    } catch (error) {
      setLoginError('Login failed. Please try again.');
    } finally {
      setIsLoggingIn(false);
    }
  }, [password, onAuthenticationChange, onToggle, onPasswordChange]);

  /**
   * Handles modal close
   */
  const handleClose = useCallback(() => {
    setLoginError('');
    onPasswordChange('');
    onToggle();
  }, [onPasswordChange, onToggle]);

  if (!isOpen) return null;

  return (
    <div className="modal show d-block" tabIndex="-1" role="dialog" aria-labelledby="loginModalTitle">
      <div className="modal-dialog" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="loginModalTitle">Admin Login</h5>
            <button 
              type="button" 
              className="btn-close" 
              onClick={handleClose}
              aria-label="Close"
              disabled={isLoggingIn}
            ></button>
          </div>
          
          <div className="modal-body">
            {loginError && (
              <div className="alert alert-danger" role="alert">
                {loginError}
              </div>
            )}
            
            <form onSubmit={handleLogin}>
              <div className="mb-3">
                <label htmlFor="passwordInput" className="form-label">
                  Password <span className="text-danger">*</span>
                </label>
                <input 
                  type="password"
                  id="passwordInput"
                  className="form-control"
                  value={password}
                  onChange={(e) => onPasswordChange(e.target.value)}
                  placeholder="Enter admin password"
                  disabled={isLoggingIn}
                  required
                  autoComplete="current-password"
                />
              </div>
              
              <div className="modal-footer">
                <button 
                  type="button"
                  className="btn btn-danger" 
                  onClick={handleClose}
                  disabled={isLoggingIn}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="btn btn-primary"
                  disabled={isLoggingIn || !password.trim()}
                >
                  {isLoggingIn ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Logging in...
                    </>
                  ) : (
                    'Login'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;