import React from 'react';
import useErrorHandler from './useErrorHandler';

interface UserData {
  id: string;
  name: string;
  email: string;
}

/**
 * Example component demonstrating how to use the useErrorHandler hook
 */
const UserProfile: React.FC = () => {
  // Use the error handler hook with context about this component
  const { error, isLoading, handlePromise, wrapAsync, reset } = useErrorHandler({
    context: { component: 'UserProfile' },
    onError: (err) => {
      console.log('Custom error handling:', err.message);
    }
  });

  // Example API call wrapped with error handling
  const fetchUserData = wrapAsync(
    async (userId: string): Promise<UserData> => {
      const response = await fetch(`/api/users/${userId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch user: ${response.statusText}`);
      }
      
      return response.json();
    },
    { action: 'fetchUser' } // Additional context for this specific operation
  );

  // State to store user data
  const [userData, setUserData] = React.useState<UserData | null>(null);

  // Handle form submission with error handling
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const formData = new FormData(event.target as HTMLFormElement);
    const userId = formData.get('userId') as string;
    
    const data = await fetchUserData(userId);
    if (data) {
      setUserData(data);
    }
  };

  // Example of handling a promise directly
  const handleSaveClick = () => {
    if (!userData) return;
    
    handlePromise(
      fetch(`/api/users/${userData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      }).then(response => {
        if (!response.ok) throw new Error('Failed to save user data');
        return response.json();
      }),
      { action: 'saveUser' }
    );
  };

  return (
    <div className="user-profile">
      {error && (
        <div className="error-message">
          <p>Error: {error instanceof Error ? error.message : String(error)}</p>
          <button onClick={reset}>Dismiss</button>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <input type="text" name="userId" placeholder="Enter user ID" />
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Loading...' : 'Load User Data'}
        </button>
      </form>

      {userData && (
        <div className="user-data">
          <h2>{userData.name}</h2>
          <p>{userData.email}</p>
          <button onClick={handleSaveClick}>Save Changes</button>
        </div>
      )}
    </div>
  );
};

export default UserProfile; 