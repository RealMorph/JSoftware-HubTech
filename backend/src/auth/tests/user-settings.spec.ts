import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateUserDto } from '../../users/dto/create-user.dto';
import { ThemeMode, ThemeColor } from '../dto';

describe('AuthService - User Settings', () => {
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

  describe('Theme Settings', () => {
    it('should update theme mode', async () => {
      // Register a user
      const userData = {
        firstName: 'Alex',
        lastName: 'Johnson',
        email: 'alex.johnson@example.com',
        password: 'Password123!'
      };
      const user = await registerUser(userData);

      // Update theme mode to dark
      let result = await service.updateThemeMode(user.id, ThemeMode.DARK);
      expect(result).toBeDefined();
      expect(result.message).toBe('Theme mode updated successfully');

      // Verify the theme mode was updated
      let privateUser = getPrivateUser(user.id);
      expect(privateUser.settings).toBeDefined();
      expect(privateUser.settings.theme.mode).toBe(ThemeMode.DARK);

      // Update theme mode to light
      result = await service.updateThemeMode(user.id, ThemeMode.LIGHT);
      expect(result.message).toBe('Theme mode updated successfully');

      // Verify the theme mode was updated
      privateUser = getPrivateUser(user.id);
      expect(privateUser.settings.theme.mode).toBe(ThemeMode.LIGHT);
    });

    it('should update theme colors', async () => {
      // Register a user
      const userData = {
        firstName: 'Emma',
        lastName: 'Wilson',
        email: 'emma.wilson@example.com',
        password: 'Password123!'
      };
      const user = await registerUser(userData);

      // Update theme colors to BLUE
      const result = await service.updateThemeColor(user.id, ThemeColor.BLUE);
      expect(result).toBeDefined();
      expect(result.message).toBe('Theme color updated successfully');

      // Verify the theme color was updated
      const privateUser = getPrivateUser(user.id);
      expect(privateUser.settings).toBeDefined();
      expect(privateUser.settings.theme.color).toBe(ThemeColor.BLUE);
    });

    it('should have theme settings persist across logins', async () => {
      // Register a user
      const userData = {
        firstName: 'Noah',
        lastName: 'Brown',
        email: 'noah.brown@example.com',
        password: 'Password123!'
      };
      const user = await registerUser(userData);

      // Update theme settings
      await service.updateThemeMode(user.id, ThemeMode.DARK);
      await service.updateThemeColor(user.id, ThemeColor.PURPLE);

      // Log in
      const loginResult = await service.login(userData.email, userData.password);
      
      // Verify theme settings are present in the login response
      expect(loginResult.user.settings).toBeDefined();
      expect(loginResult.user.settings.theme.mode).toBe(ThemeMode.DARK);
      expect(loginResult.user.settings.theme.color).toBe(ThemeColor.PURPLE);
    });

    it('should throw error when updating theme mode for non-existent user', async () => {
      await expect(service.updateThemeMode('non-existent-id', ThemeMode.LIGHT)).rejects.toThrow(NotFoundException);
    });

    it('should throw error when updating theme color for non-existent user', async () => {
      await expect(service.updateThemeColor('non-existent-id', ThemeColor.GREEN)).rejects.toThrow(NotFoundException);
    });
  });

  describe('Language & Timezone Settings', () => {
    it('should update language preference', async () => {
      // Register a user
      const userData = {
        firstName: 'Sophie',
        lastName: 'Martin',
        email: 'sophie.martin@example.com',
        password: 'Password123!'
      };
      const user = await registerUser(userData);

      // Update language to Spanish
      const result = await service.updateLanguage(user.id, 'es');
      expect(result).toBeDefined();
      expect(result.message).toBe('Language updated successfully');

      // Verify the language was updated
      const privateUser = getPrivateUser(user.id);
      expect(privateUser.settings).toBeDefined();
      expect(privateUser.settings.language).toBe('es');
    });

    it('should update timezone', async () => {
      // Register a user
      const userData = {
        firstName: 'William',
        lastName: 'Taylor',
        email: 'william.taylor@example.com',
        password: 'Password123!'
      };
      const user = await registerUser(userData);

      // Update timezone to Europe/Paris
      const result = await service.updateTimezone(user.id, 'Europe/Paris');
      expect(result).toBeDefined();
      expect(result.message).toBe('Timezone updated successfully');

      // Verify the timezone was updated
      const privateUser = getPrivateUser(user.id);
      expect(privateUser.settings).toBeDefined();
      expect(privateUser.settings.timezone).toBe('Europe/Paris');
    });

    it('should verify date/time formatting based on user settings', async () => {
      // Register a user
      const userData = {
        firstName: 'Olivia',
        lastName: 'Anderson',
        email: 'olivia.anderson@example.com',
        password: 'Password123!'
      };
      const user = await registerUser(userData);

      // Update language and timezone
      await service.updateLanguage(user.id, 'fr');
      await service.updateTimezone(user.id, 'Europe/Paris');

      // Get formatted date and time
      const dateString = '2023-05-15T12:30:00.000Z';
      const formatted = await service.getFormattedDateTime(user.id, dateString);
      
      expect(formatted).toBeDefined();
      expect(formatted.formattedDate).toBeDefined();
      expect(formatted.formattedTime).toBeDefined();
      
      // For French locale, expecting date format like "15/05/2023"
      expect(formatted.formattedDate).toMatch(/\d{2}\/\d{2}\/\d{4}/);
      
      // For Europe/Paris timezone, expecting time adjusted from UTC
      expect(formatted.timezone).toBe('Europe/Paris');
    });

    it('should throw error when updating language with invalid code', async () => {
      // Register a user
      const userData = {
        firstName: 'Lucas',
        lastName: 'Miller',
        email: 'lucas.miller@example.com',
        password: 'Password123!'
      };
      const user = await registerUser(userData);

      // Try to update with invalid language code
      await expect(service.updateLanguage(user.id, 'invalid-code')).rejects.toThrow(BadRequestException);
    });

    it('should throw error when updating timezone with invalid zone', async () => {
      // Register a user
      const userData = {
        firstName: 'Amelia',
        lastName: 'Davis',
        email: 'amelia.davis@example.com',
        password: 'Password123!'
      };
      const user = await registerUser(userData);

      // Try to update with invalid timezone
      await expect(service.updateTimezone(user.id, 'Invalid/Zone')).rejects.toThrow(BadRequestException);
    });
  });

  describe('Notification Preferences', () => {
    it('should update email notification preferences', async () => {
      // Register a user
      const userData = {
        firstName: 'Ethan',
        lastName: 'White',
        email: 'ethan.white@example.com',
        password: 'Password123!'
      };
      const user = await registerUser(userData);

      // Update email notification preferences
      const emailPreferences = {
        marketing: false,
        securityAlerts: true,
        accountUpdates: true,
        newFeatures: false
      };
      
      const result = await service.updateEmailNotificationPreferences(user.id, emailPreferences);
      expect(result).toBeDefined();
      expect(result.message).toBe('Email notification preferences updated successfully');

      // Verify the preferences were updated
      const privateUser = getPrivateUser(user.id);
      expect(privateUser.settings).toBeDefined();
      expect(privateUser.settings.notifications.email).toEqual(emailPreferences);
    });

    it('should update push notification preferences', async () => {
      // Register a user
      const userData = {
        firstName: 'Ava',
        lastName: 'Smith',
        email: 'ava.smith@example.com',
        password: 'Password123!'
      };
      const user = await registerUser(userData);

      // Update push notification preferences
      const pushPreferences = {
        marketing: false,
        securityAlerts: true,
        accountUpdates: false,
        newFeatures: true
      };
      
      const result = await service.updatePushNotificationPreferences(user.id, pushPreferences);
      expect(result).toBeDefined();
      expect(result.message).toBe('Push notification preferences updated successfully');

      // Verify the preferences were updated
      const privateUser = getPrivateUser(user.id);
      expect(privateUser.settings).toBeDefined();
      expect(privateUser.settings.notifications.push).toEqual(pushPreferences);
    });

    it('should update SMS notification preferences', async () => {
      // Register a user
      const userData = {
        firstName: 'Liam',
        lastName: 'Johnson',
        email: 'liam.johnson@example.com',
        password: 'Password123!'
      };
      const user = await registerUser(userData);

      // Update SMS notification preferences
      const smsPreferences = {
        marketing: false,
        securityAlerts: true,
        accountUpdates: true,
        newFeatures: false
      };
      
      const result = await service.updateSmsNotificationPreferences(user.id, smsPreferences);
      expect(result).toBeDefined();
      expect(result.message).toBe('SMS notification preferences updated successfully');

      // Verify the preferences were updated
      const privateUser = getPrivateUser(user.id);
      expect(privateUser.settings).toBeDefined();
      expect(privateUser.settings.notifications.sms).toEqual(smsPreferences);
    });

    it('should throw error when updating notification preferences for non-existent user', async () => {
      const preferences = {
        marketing: true,
        securityAlerts: true,
        accountUpdates: true,
        newFeatures: true
      };
      
      await expect(service.updateEmailNotificationPreferences('non-existent-id', preferences)).rejects.toThrow(NotFoundException);
    });
  });
}); 