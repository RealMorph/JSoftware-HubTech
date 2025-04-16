import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth.service';
import { BadRequestException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from '../../users/dto/create-user.dto';
import * as bcrypt from 'bcrypt';

describe('AuthService - Profile Security', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // Helper function to register a user
  const registerUser = async (userData: CreateUserDto) => {
    const user = await service.register(userData);
    // Get private access to mark user as verified
    const authServiceWithPrivateAccess = service as any;
    const userIndex = authServiceWithPrivateAccess.users.findIndex(u => u.id === user.id);
    if (userIndex !== -1) {
      authServiceWithPrivateAccess.users[userIndex].isVerified = true;
    }
    return user;
  };

  // Helper to get user from private array
  const getPrivateUser = (userId: string) => {
    const authServiceWithPrivateAccess = service as any;
    return authServiceWithPrivateAccess.users.find(u => u.id === userId);
  };

  describe('Change Password', () => {
    it('should change password with valid current password', async () => {
      // Register a user
      const userData = {
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane.doe@example.com',
        password: 'Password123!'
      };
      const user = await registerUser(userData);

      // Change password
      const result = await service.changePassword(
        user.id,
        userData.password, // current password
        'NewPassword456!' // new password
      );

      expect(result).toBeDefined();
      expect(result.message).toBe('Password changed successfully');

      // Login should fail with old password
      await expect(service.login(userData.email, userData.password)).rejects.toThrow();
      
      // Login should succeed with new password
      const loginResult = await service.login(userData.email, 'NewPassword456!');
      expect(loginResult).toBeDefined();
      expect(loginResult.user.email).toBe(userData.email);
    });

    it('should throw error when changing password with incorrect current password', async () => {
      // Register a user
      const userData = {
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane2.doe@example.com',
        password: 'Password123!'
      };
      const user = await registerUser(userData);

      // Attempt to change password with wrong current password
      await expect(service.changePassword(
        user.id,
        'WrongPassword123!', // incorrect current password
        'NewPassword456!'    // new password
      )).rejects.toThrow(UnauthorizedException);
    });

    it('should throw error when changing password with invalid new password', async () => {
      // Register a user
      const userData = {
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane3.doe@example.com',
        password: 'Password123!'
      };
      const user = await registerUser(userData);

      // Attempt to change password with too short new password
      await expect(service.changePassword(
        user.id,
        userData.password, // correct current password
        'short'           // too short new password
      )).rejects.toThrow(BadRequestException);
    });
  });

  describe('Security Questions', () => {
    it('should set security questions for a user', async () => {
      // Register a user
      const userData = {
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@example.com',
        password: 'Password123!'
      };
      const user = await registerUser(userData);

      // Set security questions
      const securityQuestions = [
        { question: 'What was your first pet\'s name?', answer: 'Fluffy' },
        { question: 'What was the name of your first school?', answer: 'Lincoln Elementary' },
        { question: 'What is your mother\'s maiden name?', answer: 'Johnson' }
      ];

      const result = await service.setSecurityQuestions(user.id, securityQuestions);
      
      expect(result).toBeDefined();
      expect(result.message).toBe('Security questions set successfully');

      // Check if questions are stored correctly
      const privateUser = getPrivateUser(user.id);
      expect(privateUser.securityQuestions).toBeDefined();
      expect(privateUser.securityQuestions.length).toBe(3);
      
      // Verify answers are hashed
      for (let i = 0; i < securityQuestions.length; i++) {
        expect(privateUser.securityQuestions[i].question).toBe(securityQuestions[i].question);
        // Answers should be hashed, not stored in plain text
        expect(privateUser.securityQuestions[i].answer).not.toBe(securityQuestions[i].answer);
        // Verify the hash matches the original answer
        const isMatch = await bcrypt.compare(
          securityQuestions[i].answer,
          privateUser.securityQuestions[i].answer
        );
        expect(isMatch).toBe(true);
      }
    });

    it('should update security questions for a user', async () => {
      // Register a user
      const userData = {
        firstName: 'Alice',
        lastName: 'Brown',
        email: 'alice.brown@example.com',
        password: 'Password123!'
      };
      const user = await registerUser(userData);

      // Set initial security questions
      const initialQuestions = [
        { question: 'What was your first pet\'s name?', answer: 'Fluffy' },
        { question: 'What was the name of your first school?', answer: 'Lincoln Elementary' }
      ];

      await service.setSecurityQuestions(user.id, initialQuestions);

      // Update security questions
      const updatedQuestions = [
        { question: 'What was your first pet\'s name?', answer: 'Buddy' },
        { question: 'What was the name of your first school?', answer: 'Washington High' },
        { question: 'What is your favorite book?', answer: 'Pride and Prejudice' }
      ];

      const result = await service.setSecurityQuestions(user.id, updatedQuestions);
      
      expect(result).toBeDefined();
      expect(result.message).toBe('Security questions set successfully');

      // Check if questions are updated correctly
      const privateUser = getPrivateUser(user.id);
      expect(privateUser.securityQuestions).toBeDefined();
      expect(privateUser.securityQuestions.length).toBe(3);
      expect(privateUser.securityQuestions[0].question).toBe(updatedQuestions[0].question);
      
      // Verify updated answers are hashed correctly
      for (let i = 0; i < updatedQuestions.length; i++) {
        const isMatch = await bcrypt.compare(
          updatedQuestions[i].answer,
          privateUser.securityQuestions[i].answer
        );
        expect(isMatch).toBe(true);
      }
    });

    it('should throw error when setting less than required security questions', async () => {
      // Register a user
      const userData = {
        firstName: 'Bob',
        lastName: 'Williams',
        email: 'bob.williams@example.com',
        password: 'Password123!'
      };
      const user = await registerUser(userData);

      // Try to set only one security question
      const questions = [
        { question: 'What was your first pet\'s name?', answer: 'Rex' }
      ];

      await expect(service.setSecurityQuestions(user.id, questions)).rejects.toThrow(BadRequestException);
    });
  });

  describe('Login History', () => {
    it('should record login history when user logs in', async () => {
      // Register a user
      const userData = {
        firstName: 'Thomas',
        lastName: 'Clark',
        email: 'thomas.clark@example.com',
        password: 'Password123!'
      };
      const user = await registerUser(userData);

      // Login
      await service.login(userData.email, userData.password);

      // Get login history
      const history = await service.getLoginHistory(user.id);
      
      expect(history).toBeDefined();
      expect(history.length).toBeGreaterThan(0);
      expect(history[0].userId).toBe(user.id);
      expect(history[0].timestamp).toBeDefined();
      expect(history[0].ipAddress).toBeDefined();
      expect(history[0].userAgent).toBeDefined();
    });

    it('should retrieve limited login history entries', async () => {
      // Register a user
      const userData = {
        firstName: 'Sarah',
        lastName: 'Jones',
        email: 'sarah.jones@example.com',
        password: 'Password123!'
      };
      const user = await registerUser(userData);

      // Simulate multiple logins
      await service.login(userData.email, userData.password);
      
      // Manually add more login history entries
      const authServiceWithPrivateAccess = service as any;
      for (let i = 0; i < 10; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        authServiceWithPrivateAccess.loginHistory.push({
          id: `history-${i}`,
          userId: user.id,
          timestamp: date,
          ipAddress: '192.168.1.1',
          userAgent: 'Test Browser',
          location: 'Test Location'
        });
      }

      // Get limited login history (5 entries)
      const limitedHistory = await service.getLoginHistory(user.id, 5);
      
      expect(limitedHistory).toBeDefined();
      expect(limitedHistory.length).toBe(5);
      
      // Check if entries are sorted by most recent first
      for (let i = 0; i < limitedHistory.length - 1; i++) {
        expect(new Date(limitedHistory[i].timestamp).getTime())
          .toBeGreaterThanOrEqual(new Date(limitedHistory[i + 1].timestamp).getTime());
      }
    });
  });

  describe('Active Sessions', () => {
    it('should list active sessions for a user', async () => {
      // Register a user
      const userData = {
        firstName: 'Emily',
        lastName: 'Davis',
        email: 'emily.davis@example.com',
        password: 'Password123!'
      };
      const user = await registerUser(userData);

      // Login to create a session
      const loginResult = await service.login(userData.email, userData.password);
      
      // Get active sessions
      const sessions = await service.getActiveSessions(user.id);
      
      expect(sessions).toBeDefined();
      expect(sessions.length).toBeGreaterThan(0);
      expect(sessions[0].userId).toBe(user.id);
      expect(sessions[0].createdAt).toBeDefined();
      expect(sessions[0].lastActiveAt).toBeDefined();
      expect(sessions[0].ipAddress).toBeDefined();
      expect(sessions[0].userAgent).toBeDefined();
    });

    it('should terminate specific session for a user', async () => {
      // Register a user
      const userData = {
        firstName: 'Michael',
        lastName: 'Johnson',
        email: 'michael.johnson@example.com',
        password: 'Password123!'
      };
      const user = await registerUser(userData);

      // Login to create a session
      await service.login(userData.email, userData.password);
      
      // Get active sessions
      const sessions = await service.getActiveSessions(user.id);
      const sessionId = sessions[0].id;
      
      // Terminate the session
      const result = await service.terminateSession(user.id, sessionId);
      
      expect(result).toBeDefined();
      expect(result.message).toBe('Session terminated successfully');
      
      // Check if session is removed
      const updatedSessions = await service.getActiveSessions(user.id);
      const terminatedSession = updatedSessions.find(s => s.id === sessionId);
      expect(terminatedSession).toBeUndefined();
    });

    it('should terminate all sessions for a user', async () => {
      // Register a user
      const userData = {
        firstName: 'David',
        lastName: 'Miller',
        email: 'david.miller@example.com',
        password: 'Password123!'
      };
      const user = await registerUser(userData);

      // Simulate multiple logins to create multiple sessions
      await service.login(userData.email, userData.password);
      
      // Manually add more sessions
      const authServiceWithPrivateAccess = service as any;
      for (let i = 0; i < 3; i++) {
        authServiceWithPrivateAccess.activeSessions.push({
          id: `session-${i}`,
          userId: user.id,
          token: `token-${i}`,
          createdAt: new Date(),
          lastActiveAt: new Date(),
          ipAddress: '192.168.1.1',
          userAgent: 'Test Browser',
          deviceInfo: 'Test Device'
        });
      }
      
      // Get active sessions to confirm there are multiple
      const sessions = await service.getActiveSessions(user.id);
      expect(sessions.length).toBeGreaterThan(1);
      
      // Terminate all sessions
      const result = await service.terminateAllSessions(user.id);
      
      expect(result).toBeDefined();
      expect(result.message).toBe('All sessions terminated successfully');
      
      // Check if all sessions are removed
      const updatedSessions = await service.getActiveSessions(user.id);
      expect(updatedSessions.length).toBe(0);
    });

    it('should throw error when terminating non-existent session', async () => {
      // Register a user
      const userData = {
        firstName: 'Lisa',
        lastName: 'Wilson',
        email: 'lisa.wilson@example.com',
        password: 'Password123!'
      };
      const user = await registerUser(userData);

      // Try to terminate non-existent session
      await expect(service.terminateSession(user.id, 'non-existent-session-id')).rejects.toThrow(NotFoundException);
    });
  });
}); 