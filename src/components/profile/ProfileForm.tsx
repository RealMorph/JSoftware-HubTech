import React, { useState, useEffect } from 'react';
import { useAuth } from '../../core/hooks/useAuth';
import { UserProfile } from '../../core/types/user-profile';

interface ProfileFormProps {
  onSaved?: () => void;
}

export const ProfileForm: React.FC<ProfileFormProps> = ({ onSaved }) => {
  const { userProfile, updateProfile, uploadProfileImage } = useAuth();
  
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    displayName: '',
    phoneNumber: '',
    preferences: {
      emailNotifications: false,
      pushNotifications: false
    }
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Update form when user profile changes
  useEffect(() => {
    if (userProfile) {
      setFormData({
        displayName: userProfile.displayName || '',
        phoneNumber: userProfile.phoneNumber || '',
        preferences: {
          emailNotifications: userProfile.preferences?.emailNotifications || false,
          pushNotifications: userProfile.preferences?.pushNotifications || false
        }
      });
    }
  }, [userProfile]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox' && name.startsWith('preferences.')) {
      const preferenceName = name.split('.')[1] as keyof UserProfile['preferences'];
      setFormData({
        ...formData,
        preferences: {
          ...formData.preferences,
          [preferenceName]: checked
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };
  
  const handleProfileImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Please select an image file' });
      return;
    }
    
    try {
      setIsLoading(true);
      await uploadProfileImage(file);
      setMessage({ type: 'success', text: 'Profile image updated successfully' });
    } catch (error) {
      console.error('Error uploading profile image:', error);
      setMessage({ type: 'error', text: 'Failed to upload image' });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      await updateProfile(formData);
      setMessage({ type: 'success', text: 'Profile updated successfully' });
      if (onSaved) onSaved();
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ type: 'error', text: 'Failed to update profile' });
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!userProfile) {
    return <div>Please log in to edit your profile</div>;
  }
  
  return (
    <div className="profile-form-container">
      <h2>Edit Profile</h2>
      
      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}
      
      <div className="profile-image-container">
        <img 
          src={userProfile.photoURL || 'https://via.placeholder.com/150'} 
          alt="Profile" 
          className="profile-image"
        />
        <div className="profile-image-upload">
          <label htmlFor="profile-image-input" className="image-upload-label">
            Change Photo
          </label>
          <input
            id="profile-image-input"
            type="file"
            accept="image/*"
            onChange={handleProfileImageChange}
            className="image-upload-input"
          />
        </div>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="displayName">Display Name</label>
          <input
            type="text"
            id="displayName"
            name="displayName"
            value={formData.displayName}
            onChange={handleInputChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={userProfile.email}
            disabled
          />
          <small>Email cannot be changed</small>
        </div>
        
        <div className="form-group">
          <label htmlFor="phoneNumber">Phone Number</label>
          <input
            type="tel"
            id="phoneNumber"
            name="phoneNumber"
            value={formData.phoneNumber || ''}
            onChange={handleInputChange}
          />
        </div>
        
        <h3>Notification Preferences</h3>
        
        <div className="form-group checkbox">
          <input
            type="checkbox"
            id="emailNotifications"
            name="preferences.emailNotifications"
            checked={formData.preferences?.emailNotifications || false}
            onChange={handleInputChange}
          />
          <label htmlFor="emailNotifications">Email Notifications</label>
        </div>
        
        <div className="form-group checkbox">
          <input
            type="checkbox"
            id="pushNotifications"
            name="preferences.pushNotifications"
            checked={formData.preferences?.pushNotifications || false}
            onChange={handleInputChange}
          />
          <label htmlFor="pushNotifications">Push Notifications</label>
        </div>
        
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}; 