import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../core/auth/AuthProvider';

export const PasswordResetForm: React.FC = () => {
  const { resetPassword, isLoading } = useAuth();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setError(null);
  };
  
  const validate = (): boolean => {
    if (!email) {
      setError('Email is required');
      return false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Email is invalid');
      return false;
    }
    return true;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }
    
    try {
      await resetPassword(email);
      setSuccess(true);
    } catch (error) {
      console.error('Password reset error:', error);
      setError(
        error instanceof Error 
          ? error.message 
          : 'An error occurred. Please try again.'
      );
    }
  };
  
  if (success) {
    return (
      <div className="auth-form-container">
        <h2>Password Reset Requested</h2>
        <div className="success-message">
          <p>
            If an account exists for {email}, you will receive password reset instructions 
            at your email address.
          </p>
          <p>
            Please check your email and follow the instructions to reset your password.
          </p>
        </div>
        <div className="auth-links">
          <button 
            onClick={() => navigate('/login')}
            className="secondary-button"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="auth-form-container">
      <h2>Reset Your Password</h2>
      
      <p className="form-description">
        Enter your email address and we'll send you instructions to reset your password.
      </p>
      
      {error && (
        <div className="error-message" role="alert">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={handleChange}
            disabled={isLoading}
            className={error ? 'error' : ''}
          />
        </div>
        
        <button 
          type="submit" 
          disabled={isLoading}
          className="submit-button"
        >
          {isLoading ? 'Sending...' : 'Reset Password'}
        </button>
      </form>
      
      <div className="auth-links">
        <a href="/login" onClick={(e) => { e.preventDefault(); navigate('/login'); }}>
          Back to Login
        </a>
      </div>
    </div>
  );
};

// Password Reset Confirmation Component for the second step after the user clicks the email link
export const PasswordResetConfirmationForm: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [token, setToken] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // Extract token from URL when component mounts
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tokenParam = urlParams.get('token');
    if (tokenParam) {
      setToken(tokenParam);
    } else {
      setSubmitError('Invalid or missing password reset token. Please request a new password reset link.');
    }
  }, []);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field is changed
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    
    // Clear submit error when any field changes
    if (submitError) {
      setSubmitError(null);
    }
  };
  
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate() || !token) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Use the auth service directly since we're not logged in
      const authService = new (await import('../../core/auth/auth-service')).AuthService();
      await authService.updatePassword(formData.password, token);
      
      setSuccess(true);
    } catch (error) {
      console.error('Password reset confirmation error:', error);
      setSubmitError(
        error instanceof Error 
          ? error.message 
          : 'An error occurred while resetting your password. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };
  
  if (success) {
    return (
      <div className="auth-form-container">
        <h2>Password Reset Complete</h2>
        <div className="success-message">
          <p>
            Your password has been successfully reset.
          </p>
          <p>
            You can now log in with your new password.
          </p>
        </div>
        <div className="auth-links">
          <button 
            onClick={() => navigate('/login')}
            className="primary-button"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="auth-form-container">
      <h2>Set New Password</h2>
      
      {submitError && (
        <div className="error-message" role="alert">
          {submitError}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="password">New Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            disabled={isLoading}
            className={errors.password ? 'error' : ''}
          />
          {errors.password && <div className="error-text">{errors.password}</div>}
        </div>
        
        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            disabled={isLoading}
            className={errors.confirmPassword ? 'error' : ''}
          />
          {errors.confirmPassword && <div className="error-text">{errors.confirmPassword}</div>}
        </div>
        
        <button 
          type="submit" 
          disabled={isLoading || !token}
          className="submit-button"
        >
          {isLoading ? 'Resetting Password...' : 'Reset Password'}
        </button>
      </form>
    </div>
  );
}; 