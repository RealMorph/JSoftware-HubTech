import React, { useState, useEffect } from 'react';
import { FirestoreService, RoleManagementService } from '../../core/firebase';
import { Role, ROLE_DEFINITIONS } from '../../core/types/user-roles';
import { UserProfile } from '../../core/types/user-profile';

interface UserWithRoles extends UserProfile {
  roles: Role[];
}

export const UserRoleManagement: React.FC = () => {
  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserWithRoles | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [message, setMessage] = useState<{ type: string; text: string } | null>(null);
  
  const firestoreService = FirestoreService.getInstance();
  const roleService = RoleManagementService.getInstance();
  
  // Fetch users with their roles
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        
        // Get all users from Firestore
        const userProfiles = await firestoreService.getAllDocuments<UserProfile>('users');
        
        // Get roles for each user
        const usersWithRoles = await Promise.all(
          userProfiles.map(async (user) => {
            const userRoles = await roleService.getUserRoles(user.id);
            return { ...user, roles: userRoles.roles };
          })
        );
        
        setUsers(usersWithRoles);
      } catch (error) {
        console.error('Error fetching users:', error);
        setMessage({ 
          type: 'error', 
          text: 'Failed to load users. Please try again.' 
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUsers();
  }, []);
  
  // Handle role toggle for a user
  const handleRoleToggle = async (userId: string, role: Role, hasRole: boolean) => {
    try {
      setIsUpdating(true);
      
      if (hasRole) {
        // Remove role
        await roleService.removeRolesFromUser(userId, [role]);
      } else {
        // Add role
        await roleService.assignRolesToUser(userId, [role]);
      }
      
      // Update local state
      setUsers(prevUsers => 
        prevUsers.map(user => {
          if (user.id === userId) {
            const newRoles = hasRole
              ? user.roles.filter(r => r !== role)
              : [...user.roles, role];
            
            // Update selected user if it's the same user
            if (selectedUser && selectedUser.id === userId) {
              setSelectedUser({ ...user, roles: newRoles });
            }
            
            return { ...user, roles: newRoles };
          }
          return user;
        })
      );
      
      setMessage({ 
        type: 'success', 
        text: `Role ${hasRole ? 'removed from' : 'assigned to'} user successfully.` 
      });
    } catch (error) {
      console.error('Error updating user role:', error);
      setMessage({ 
        type: 'error', 
        text: 'Failed to update user role. Please try again.' 
      });
    } finally {
      setIsUpdating(false);
    }
  };
  
  // Filter users based on search query
  const filteredUsers = searchQuery
    ? users.filter(user => 
        user.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : users;
  
  return (
    <div className="user-role-management">
      <h2>User Role Management</h2>
      
      {message && (
        <div className={`message ${message.type}`}>
          {message.text}
          <button 
            className="close-button" 
            onClick={() => setMessage(null)}
          >
            ×
          </button>
        </div>
      )}
      
      <div className="search-container">
        <input
          type="text"
          placeholder="Search users by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
      </div>
      
      <div className="user-role-container">
        <div className="users-list">
          <h3>Users</h3>
          
          {isLoading ? (
            <div className="loading">Loading users...</div>
          ) : (
            <ul>
              {filteredUsers.map(user => (
                <li
                  key={user.id}
                  className={`user-item ${selectedUser?.id === user.id ? 'selected' : ''}`}
                  onClick={() => setSelectedUser(user)}
                >
                  <div className="user-info">
                    <div className="user-name">{user.displayName || 'Unnamed User'}</div>
                    <div className="user-email">{user.email}</div>
                    <div className="user-role-badges">
                      {user.roles.map(role => (
                        <span key={role} className={`role-badge ${role}`}>
                          {role}
                        </span>
                      ))}
                    </div>
                  </div>
                </li>
              ))}
              
              {filteredUsers.length === 0 && (
                <li className="no-results">No users found</li>
              )}
            </ul>
          )}
        </div>
        
        <div className="role-management-panel">
          {selectedUser ? (
            <>
              <h3>Manage Roles for {selectedUser.displayName}</h3>
              <div className="user-details">
                <div className="profile-info">
                  {selectedUser.photoURL && (
                    <img 
                      src={selectedUser.photoURL} 
                      alt={selectedUser.displayName || 'User'} 
                      className="profile-image"
                    />
                  )}
                  <div>
                    <p><strong>Email:</strong> {selectedUser.email}</p>
                    <p><strong>Created:</strong> {new Date(selectedUser.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                
                <div className="role-toggles">
                  <h4>Roles</h4>
                  {ROLE_DEFINITIONS.map(role => (
                    <div key={role.id} className="role-toggle">
                      <label>
                        <input
                          type="checkbox"
                          checked={selectedUser.roles.includes(role.id)}
                          onChange={() => handleRoleToggle(
                            selectedUser.id,
                            role.id,
                            selectedUser.roles.includes(role.id)
                          )}
                          disabled={isUpdating}
                        />
                        <span className="role-name">{role.name}</span>
                      </label>
                      <span className="role-description">{role.description}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="no-selection">
              <p>Select a user to manage their roles</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 