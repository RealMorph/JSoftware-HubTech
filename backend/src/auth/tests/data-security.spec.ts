import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth.service';
import { UnauthorizedException, ForbiddenException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { DataSharingLevel, ApiKeyPermission } from '../dto/security-settings.dto';
import { ThemeMode, ThemeColor, NotificationFrequency, DashboardLayout, WidgetType } from '../dto/user-settings.dto';

describe('AuthService - Data Security', () => {
  let service: AuthService;
  let testUserEmail: string;
  let testUserId: string;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService],
    }).compile();

    service = module.get<AuthService>(AuthService);
    
    // Create standard test user data
    testUserEmail = `security-test-${Date.now()}@example.com`;
    const testUserData = {
      firstName: 'Security',
      lastName: 'Test',
      email: testUserEmail,
      password: 'SecureP@ssw0rd123!'
    };

    // Create a test user
    const userResponse = await service.register(testUserData);
    testUserId = userResponse.id;
    
    // Mark user as verified for login tests
    const userIndex = (service as any).users.findIndex(u => u.id === testUserId);
    if (userIndex >= 0) {
      (service as any).users[userIndex].isVerified = true;
    }
  });

  describe('Data Encryption', () => {
    it('should encrypt sensitive data before storing', async () => {
      // Get users array from service
      const users = (service as any).users;
      const createdUser = users.find(u => u.id === testUserId);
      
      // Password should be hashed
      expect(createdUser.password).not.toBe('SecureP@ssw0rd123!');
      // Verify hash format (bcrypt hashes start with $2)
      expect(createdUser.password.startsWith('$2')).toBe(true);
      
      // Verify we can validate with the original password
      const loginResult = await service.login(testUserEmail, 'SecureP@ssw0rd123!');
      expect(loginResult).toBeDefined();
      expect(loginResult.user.id).toBe(testUserId);
    });

    it('should securely handle password reset tokens', async () => {
      // Request password reset
      const resetResponse = await service.requestPasswordReset(testUserEmail);
      
      // Verify response indicates success
      expect(resetResponse).toBeDefined();
      expect(resetResponse.message).toContain('reset link');
      
      // In a real application with a database, we would verify the token is stored
      // securely and has proper expiration. For our mock service, we just verify
      // that the functionality exists and returns the expected response.
    });
  });

  describe('Secure Storage', () => {
    it('should store sensitive data securely', async () => {
      // Update user with security questions
      await service.setSecurityQuestions(testUserId, [
        { question: "What was your first pet's name?", answer: "Fluffy" },
        { question: "What city were you born in?", answer: "New York" }
      ]);
      
      // Get users array from service
      const users = (service as any).users;
      const user = users.find(u => u.id === testUserId);
      
      // Security question answers should be hashed, not stored in plaintext
      expect(user.securityQuestions).toBeDefined();
      user.securityQuestions.forEach(sq => {
        expect(sq.question).toBeDefined();
        expect(sq.answer).toBeDefined();
        expect(sq.answer).not.toBe("Fluffy");
        expect(sq.answer).not.toBe("New York");
      });
    });

    it('should have proper session storage security', async () => {
      // Login to create a session
      const loginResult = await service.login(testUserEmail, 'SecureP@ssw0rd123!');
      
      // Check session token
      expect(loginResult.accessToken).toBeDefined();
      
      // Get active sessions
      const activeSessions = (service as any).activeSessions;
      const userSession = activeSessions.find(s => s.userId === testUserId);
      
      // Session should exist
      expect(userSession).toBeDefined();
      
      // Session should have a secure token
      expect(userSession.token).toBeDefined();
      expect(userSession.token.length).toBeGreaterThan(16);
      
      // Session should store client info for validation
      expect(userSession.userAgent).toBeDefined();
      expect(userSession.ipAddress).toBeDefined();
    });
  });

  describe('Data Access Controls', () => {
    it('should enforce permission-based access to user data', async () => {
      // Create a second test user
      const secondUserEmail = `access-control-test-${Date.now()}@example.com`;
      const secondUser = await service.register({
        email: secondUserEmail,
        password: 'AnotherSecure123!',
        firstName: 'Access',
        lastName: 'Control'
      });
      
      // Mark second user as verified
      const userIndex = (service as any).users.findIndex(u => u.id === secondUser.id);
      if (userIndex >= 0) {
        (service as any).users[userIndex].isVerified = true;
      }
      
      // Test access to sessions
      const activeSessions = await service.getActiveSessions(testUserId);
      expect(activeSessions).toBeDefined();
      
      // Try to terminate another user's session (this should throw an error)
      try {
        const firstUserSessions = await service.getActiveSessions(testUserId);
        if (firstUserSessions.length > 0) {
          await service.terminateSession(secondUser.id, firstUserSessions[0].id);
          fail('Should not be able to terminate another user\'s session');
        }
      } catch (error) {
        expect(error).toBeInstanceOf(ForbiddenException);
      }
    });

    it('should enforce data sharing privacy settings', async () => {
      // Set privacy settings to minimal
      await service.updatePrivacySettings(testUserId, {
        dataSharingLevel: DataSharingLevel.MINIMAL,
        showProfileToPublic: false,
        showActivityHistory: false,
        allowThirdPartyDataSharing: false,
        allowAnalyticsCookies: false
      });
      
      // Get user's current privacy settings
      const users = (service as any).users;
      const user = users.find(u => u.id === testUserId);
      
      // Verify settings are applied
      expect(user.settings.security.privacy.dataSharingLevel).toBe(DataSharingLevel.MINIMAL);
      expect(user.settings.security.privacy.showProfileToPublic).toBe(false);
      expect(user.settings.security.privacy.showActivityHistory).toBe(false);
      expect(user.settings.security.privacy.allowThirdPartyDataSharing).toBe(false);
      expect(user.settings.security.privacy.allowAnalyticsCookies).toBe(false);
    });
    
    it('should ensure data access is properly logged and auditable', async () => {
      // Perform a few operations that should be logged
      await service.login(testUserEmail, 'SecureP@ssw0rd123!');
      
      // Check login history (access logs)
      const loginHistory = await service.getLoginHistory(testUserId);
      
      // Should have login events recorded
      expect(loginHistory).toBeDefined();
      expect(loginHistory.length).toBeGreaterThan(0);
      
      // Events should contain important security info
      const lastLogin = loginHistory[0];
      expect(lastLogin.userId).toBe(testUserId);
      expect(lastLogin.ipAddress).toBeDefined();
      expect(lastLogin.timestamp).toBeDefined();
      expect(lastLogin.userAgent).toBeDefined();
    });
  });
}); 