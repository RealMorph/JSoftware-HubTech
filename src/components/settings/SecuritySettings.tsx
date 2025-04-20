import React, { useState } from 'react';
import { useAuth } from '../../core/hooks/useAuth';
import { FirebaseAuthService } from '../../core/firebase';

export const SecuritySettings: React.FC = () => {
  const { currentUser, updatePassword, sendVerificationEmail } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset message
    setMessage({ type: '', text: '' });
    
    // Validate passwords
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    
    if (newPassword.length < 8) {
      setMessage({ type: 'error', text: 'New password must be at least 8 characters long.' });
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Update password (reauthentication is now handled in the updatePassword method)
      await updatePassword(newPassword);
      
      // Clear form and show success message
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setMessage({ type: 'success', text: 'Password updated successfully.' });
    } catch (error) {
      console.error('Error changing password:', error);
      setMessage({ type: 'error', text: 'Failed to update password. Please try again later.' });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="security-settings">
      <h2>Security Settings</h2>
      
      {/* Password Change Section */}
      <section className="password-change-section">
        <h3>Change Password</h3>
        
        {message.text && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}
        
        <form onSubmit={handleChangePassword}>
          <div className="form-group">
            <label htmlFor="currentPassword">Current Password</label>
            <input
              type="password"
              id="currentPassword"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="newPassword">New Password</label>
            <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm New Password</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>
          
          <button
            type="submit"
            className="change-password-button"
            disabled={isLoading}
          >
            {isLoading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </section>
      
      {/* Account Security Section */}
      <section className="account-security-section">
        <h3>Account Security</h3>
        
        <div className="security-info">
          <div className="security-item">
            <span className="security-label">Email Verification:</span>
            <span className="security-value">
              {currentUser?.emailVerified ? (
                <span className="verified">Verified</span>
              ) : (
                <span className="not-verified">Not Verified</span>
              )}
            </span>
            
            {!currentUser?.emailVerified && (
              <button
                className="verify-email-button"
                onClick={async () => {
                  try {
                    setIsLoading(true);
                    await sendVerificationEmail();
                    setMessage({ type: 'success', text: 'Verification email sent. Please check your inbox.' });
                  } catch (error) {
                    console.error('Error sending verification email:', error);
                    setMessage({ type: 'error', text: 'Failed to send verification email. Please try again later.' });
                  } finally {
                    setIsLoading(false);
                  }
                }}
                disabled={isLoading}
              >
                Send Verification Email
              </button>
            )}
          </div>
          
          <div className="security-item">
            <span className="security-label">Last Sign In:</span>
            <span className="security-value">
              {currentUser?.metadata.lastSignInTime ? 
                new Date(currentUser.metadata.lastSignInTime).toLocaleString() : 
                'Unknown'}
            </span>
          </div>
          
          <div className="security-item">
            <span className="security-label">Account Created:</span>
            <span className="security-value">
              {currentUser?.metadata.creationTime ? 
                new Date(currentUser.metadata.creationTime).toLocaleString() : 
                'Unknown'}
            </span>
          </div>
        </div>
      </section>
      
      {/* Account Deletion Section */}
      <section className="account-deletion-section">
        <h3>Delete Account</h3>
        <p className="warning-text">
          Once you delete your account, there is no going back. Please be certain.
        </p>
        
        <button
          className="delete-account-button"
          onClick={async () => {
            const confirmed = window.confirm(
              'Are you sure you want to delete your account? This action cannot be undone.'
            );
            
            if (confirmed) {
              try {
                setIsLoading(true);
                await currentUser?.delete();
                window.location.href = '/';
              } catch (error) {
                console.error('Error deleting account:', error);
                setMessage({
                  type: 'error',
                  text: 'Failed to delete account. You may need to re-authenticate before deleting your account.'
                });
                setIsLoading(false);
              }
            }
          }}
          disabled={isLoading}
        >
          Delete Account
        </button>
      </section>
    </div>
  );
}; 