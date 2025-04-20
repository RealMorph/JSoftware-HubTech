import React, { useState } from 'react';
import { useAuth } from '../../core/hooks/useAuth';
import { FirebaseStorageService, FirestoreService, UserProfileService } from '../../core/firebase';

export const PrivacySettings: React.FC = () => {
  const { currentUser, userProfile, logout } = useAuth();
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const firestoreService = FirestoreService.getInstance();
  const storageService = FirebaseStorageService.getInstance();
  const profileService = UserProfileService.getInstance();
  
  const handleExportData = async () => {
    if (!currentUser || !userProfile) return;
    
    try {
      setIsExporting(true);
      setMessage({ type: '', text: '' });
      
      // Gather user data
      const userData = {
        profile: userProfile,
        // Add other data collections as needed
      };
      
      // Generate downloadable JSON file
      const dataStr = JSON.stringify(userData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      
      // Create download link
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `user_data_${currentUser.uid}_${new Date().toISOString()}.json`;
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      URL.revokeObjectURL(url);
      document.body.removeChild(link);
      
      setMessage({ type: 'success', text: 'Your data has been exported successfully.' });
    } catch (error) {
      console.error('Error exporting user data:', error);
      setMessage({ type: 'error', text: 'Failed to export your data. Please try again later.' });
    } finally {
      setIsExporting(false);
    }
  };
  
  const handleDeleteAllData = async () => {
    if (!currentUser || !userProfile) return;
    
    const confirmed = window.confirm(
      'Are you sure you want to delete all your data? This action CANNOT be undone!'
    );
    
    if (!confirmed) return;
    
    const doubleConfirmed = window.confirm(
      'This will permanently delete your account and all associated data. Type "DELETE" to confirm.'
    );
    
    if (!doubleConfirmed) return;
    
    try {
      setIsDeleting(true);
      setMessage({ type: '', text: '' });
      
      // 1. Delete profile images from storage
      if (userProfile.photoURL) {
        try {
          // Extract path from URL
          const urlObj = new URL(userProfile.photoURL);
          const path = urlObj.pathname.split('/').slice(2).join('/');
          await storageService.deleteFile(path);
        } catch (error) {
          console.error('Error deleting profile image:', error);
          // Continue with deletion even if image deletion fails
        }
      }
      
      // 2. Delete user profile document
      await profileService.deleteUserProfile(currentUser.uid);
      
      // 3. Delete other user data as needed
      // This would include other collections associated with the user
      // For example:
      // await firestoreService.deleteDocument('user_preferences', currentUser.uid);
      // await firestoreService.deleteDocument('user_activity', currentUser.uid);
      
      // 4. Delete Firebase Authentication account
      await currentUser.delete();
      
      // 5. Log out and redirect
      await logout();
      window.location.href = '/';
      
    } catch (error) {
      console.error('Error deleting user data:', error);
      setMessage({ 
        type: 'error', 
        text: 'Failed to delete your data. You may need to re-authenticate before deleting your account.' 
      });
      setIsDeleting(false);
    }
  };
  
  const handleToggleCookieConsent = async (consentType: string, value: boolean) => {
    if (!currentUser || !userProfile) return;
    
    try {
      // Update user preferences
      await profileService.updateUserPreferences(currentUser.uid, {
        ...userProfile.preferences,
        cookieConsent: {
          ...userProfile.preferences?.cookieConsent,
          [consentType]: value
        }
      });
      
      setMessage({ type: 'success', text: 'Cookie preferences updated successfully.' });
    } catch (error) {
      console.error('Error updating cookie preferences:', error);
      setMessage({ type: 'error', text: 'Failed to update cookie preferences. Please try again later.' });
    }
  };
  
  if (!currentUser || !userProfile) {
    return <div>Loading privacy settings...</div>;
  }
  
  return (
    <div className="privacy-settings">
      <h2>Privacy & Data</h2>
      
      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}
      
      {/* Cookie Preferences Section */}
      <section className="cookie-preferences-section">
        <h3>Cookie Preferences</h3>
        <p>Manage how your data is used on our platform.</p>
        
        <div className="cookie-options">
          <div className="cookie-option">
            <input
              type="checkbox"
              id="essential-cookies"
              checked={true}
              disabled={true}
            />
            <label htmlFor="essential-cookies">
              <span className="cookie-name">Essential Cookies</span>
              <span className="cookie-description">
                These cookies are necessary for the website to function and cannot be disabled.
              </span>
            </label>
          </div>
          
          <div className="cookie-option">
            <input
              type="checkbox"
              id="analytics-cookies"
              checked={userProfile.preferences?.cookieConsent?.analytics ?? false}
              onChange={(e) => handleToggleCookieConsent('analytics', e.target.checked)}
            />
            <label htmlFor="analytics-cookies">
              <span className="cookie-name">Analytics Cookies</span>
              <span className="cookie-description">
                These cookies help us understand how visitors interact with our website.
              </span>
            </label>
          </div>
          
          <div className="cookie-option">
            <input
              type="checkbox"
              id="marketing-cookies"
              checked={userProfile.preferences?.cookieConsent?.marketing ?? false}
              onChange={(e) => handleToggleCookieConsent('marketing', e.target.checked)}
            />
            <label htmlFor="marketing-cookies">
              <span className="cookie-name">Marketing Cookies</span>
              <span className="cookie-description">
                These cookies are used to track effectiveness of marketing campaigns.
              </span>
            </label>
          </div>
        </div>
      </section>
      
      {/* Data Export Section */}
      <section className="data-export-section">
        <h3>Export Your Data</h3>
        <p>
          Download a copy of the personal data we have stored about you. 
          This includes your profile information and settings.
        </p>
        
        <button
          className="export-data-button"
          onClick={handleExportData}
          disabled={isExporting}
        >
          {isExporting ? 'Exporting...' : 'Export My Data'}
        </button>
      </section>
      
      {/* Data Deletion Section */}
      <section className="data-deletion-section">
        <h3>Delete All Data</h3>
        <p className="warning-text">
          This will permanently delete your account and all data associated with it.
          This action cannot be undone.
        </p>
        
        <button
          className="delete-data-button"
          onClick={handleDeleteAllData}
          disabled={isDeleting}
        >
          {isDeleting ? 'Deleting...' : 'Delete All My Data'}
        </button>
      </section>
    </div>
  );
}; 