import { Injectable, ConflictException, BadRequestException, UnauthorizedException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from '../users/dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { ThemeMode, ThemeColor, NotificationFrequency, DashboardLayout, WidgetType } from './dto/user-settings.dto';
import { DataSharingLevel, ApiKeyPermission } from './dto/security-settings.dto';

@Injectable()
export class AuthService {
  private users = []; // In a real app, this would be a database repository
  private passwordResetTokens = []; // Store password reset tokens with user IDs and expiration dates
  private twoFactorSecrets = []; // Store 2FA secrets
  private twoFactorTempTokens = []; // Store temporary tokens for 2FA verification
  private emailVerificationCodes = []; // Store email verification codes
  private phoneVerificationCodes = []; // Store phone verification codes
  private loginHistory = []; // Store login history
  private activeSessions = []; // Store active sessions
  private notifications = []; // Store user notifications
  private apiKeys = []; // Store API keys
  
  // Valid language codes
  private readonly validLanguageCodes = [
    'en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'zh', 'ko', 'ar'
  ];
  
  // Valid timezones (simplified list for example)
  private readonly validTimezones = [
    'UTC', 'America/New_York', 'America/Los_Angeles', 'Europe/London', 
    'Europe/Paris', 'Asia/Tokyo', 'Asia/Shanghai', 'Australia/Sydney'
  ];

  // Private properties for brute force protection
  private failedLoginAttempts = new Map<string, number>(); // Track failed login attempts by email
  private loginAttemptTimestamps = new Map<string, Date[]>(); // Track timestamps of login attempts by email
  private userLockouts = new Map<string, Date>(); // Track account lockouts by email
  private ipLoginAttempts = new Map<string, Date[]>(); // Track login attempts by IP
  private globalAttempts = []; // Track all login attempts (for global rate limiting)
  private routeAttempts = new Map<string, Date[]>(); // Track attempts by route and IP
  
  // Brute force protection configuration
  private readonly MAX_FAILED_ATTEMPTS = 5;
  private readonly LOCKOUT_DURATION_MINUTES = 30;
  private readonly IP_RATE_LIMIT = 60; // Maximum attempts per IP in rate limit window
  private readonly IP_RATE_LIMIT_WINDOW_MINUTES = 10; // Time window for IP rate limiting
  private readonly GLOBAL_RATE_LIMIT = 1000; // Maximum global attempts in rate limit window
  private readonly GLOBAL_RATE_LIMIT_WINDOW_MINUTES = 1; // Time window for global rate limiting (1 minute)
  private readonly ROUTE_LIMITS = {
    login: { points: 10, window: 5 }, // 10 attempts per 5 minutes
    passwordReset: { points: 5, window: 10 } // 5 attempts per 10 minutes
  };
  
  // Helper methods for brute force protection
  public getRecentFailedAttempts(email: string): Promise<number> {
    return Promise.resolve(this.failedLoginAttempts.get(email) || 0);
  }
  
  public recordFailedLoginAttempt(email: string): void {
    const currentAttempts = this.failedLoginAttempts.get(email) || 0;
    this.failedLoginAttempts.set(email, currentAttempts + 1);
    
    // Record timestamp
    const timestamps = this.loginAttemptTimestamps.get(email) || [];
    timestamps.push(new Date());
    
    // Keep only attempts in the last 24 hours
    const oneDayAgo = new Date();
    oneDayAgo.setHours(oneDayAgo.getHours() - 24);
    this.loginAttemptTimestamps.set(email, timestamps.filter(date => date > oneDayAgo));
    
    // Calculate lockout or delay
    this.updateLockoutStatus(email);
  }
  
  public resetFailedLoginAttempts(email: string): void {
    this.failedLoginAttempts.set(email, 0);
    this.userLockouts.delete(email);
  }
  
  public updateLockoutStatus(email: string): void {
    const attempts = this.failedLoginAttempts.get(email) || 0;
    
    if (attempts >= this.MAX_FAILED_ATTEMPTS) {
      // Set lockout time
      const lockoutUntil = new Date();
      lockoutUntil.setMinutes(lockoutUntil.getMinutes() + this.LOCKOUT_DURATION_MINUTES);
      this.userLockouts.set(email, lockoutUntil);
    }
    else if (attempts > 1) {
      // Set progressive delay based on exponential backoff
      const delaySeconds = Math.pow(2, attempts - 2); // 0, 1, 2, 4, 8, 16...
      const nextAllowedAttempt = new Date();
      nextAllowedAttempt.setSeconds(nextAllowedAttempt.getSeconds() + delaySeconds);
      this.userLockouts.set(email, nextAllowedAttempt);
    }
  }
  
  public isUserLocked(email: string): boolean {
    const lockoutTime = this.userLockouts.get(email);
    return !!lockoutTime && lockoutTime > new Date();
  }
  
  public getLockoutRemainingMinutes(email: string): number {
    const lockoutTime = this.userLockouts.get(email);
    if (!lockoutTime || lockoutTime <= new Date()) {
      return 0;
    }
    
    return Math.ceil((lockoutTime.getTime() - new Date().getTime()) / (1000 * 60));
  }
  
  public recordIPAttempt(ipAddress: string): void {
    const timestamps = this.ipLoginAttempts.get(ipAddress) || [];
    timestamps.push(new Date());
    
    // Keep only attempts within the rate limit window
    const windowStart = new Date();
    windowStart.setMinutes(windowStart.getMinutes() - this.IP_RATE_LIMIT_WINDOW_MINUTES);
    this.ipLoginAttempts.set(ipAddress, timestamps.filter(date => date > windowStart));
  }
  
  public isIPRateLimited(ipAddress: string): boolean {
    const timestamps = this.ipLoginAttempts.get(ipAddress) || [];
    
    // Keep only attempts within the rate limit window
    const windowStart = new Date();
    windowStart.setMinutes(windowStart.getMinutes() - this.IP_RATE_LIMIT_WINDOW_MINUTES);
    const recentAttempts = timestamps.filter(date => date > windowStart);
    
    return recentAttempts.length >= this.IP_RATE_LIMIT;
  }
  
  public recordGlobalAttempt(): void {
    this.globalAttempts.push(new Date());
    
    // Keep only attempts within the global rate limit window
    const windowStart = new Date();
    windowStart.setMinutes(windowStart.getMinutes() - this.GLOBAL_RATE_LIMIT_WINDOW_MINUTES);
    this.globalAttempts = this.globalAttempts.filter(date => date > windowStart);
  }
  
  public isGlobalRateLimited(): boolean {
    // Keep only attempts within the global rate limit window
    const windowStart = new Date();
    windowStart.setMinutes(windowStart.getMinutes() - this.GLOBAL_RATE_LIMIT_WINDOW_MINUTES);
    const recentAttempts = this.globalAttempts.filter(date => date > windowStart);
    
    return recentAttempts.length >= this.GLOBAL_RATE_LIMIT;
  }
  
  public recordRouteAttempt(route: string, ipAddress: string): void {
    const key = `${route}:${ipAddress}`;
    const timestamps = this.routeAttempts.get(key) || [];
    timestamps.push(new Date());
    
    // Keep only attempts within the route's rate limit window
    if (this.ROUTE_LIMITS[route]) {
      const windowStart = new Date();
      windowStart.setMinutes(windowStart.getMinutes() - this.ROUTE_LIMITS[route].window);
      this.routeAttempts.set(key, timestamps.filter(date => date > windowStart));
    }
  }
  
  public isRouteLimited(route: string, ipAddress: string): boolean {
    if (!this.ROUTE_LIMITS[route]) {
      return false;
    }
    
    const key = `${route}:${ipAddress}`;
    const timestamps = this.routeAttempts.get(key) || [];
    
    // Keep only attempts within the route's rate limit window
    const windowStart = new Date();
    windowStart.setMinutes(windowStart.getMinutes() - this.ROUTE_LIMITS[route].window);
    const recentAttempts = timestamps.filter(date => date > windowStart);
    
    return recentAttempts.length >= this.ROUTE_LIMITS[route].points;
  }
  
  public verifyCaptcha(token: string): Promise<boolean> {
    // In a real app, this would call a CAPTCHA verification service
    // For this example, we'll just check if the token is not empty
    return Promise.resolve(!!token && token.length > 0);
  }

  async register(createUserDto: CreateUserDto) {
    const { email, password, firstName, lastName } = createUserDto;

    // Check for missing required fields
    if (!firstName || !lastName || !email || !password) {
      throw new BadRequestException('All fields are required');
    }

    // Check if email already exists
    const existingUser = this.users.find(user => user.email === email);
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new BadRequestException('Invalid email format');
    }

    // Check password strength
    if (password.length < 8) {
      throw new BadRequestException('Password must be at least 8 characters long');
    }

    // Hash password
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user with default settings
    const newUser = {
      id: uuidv4(),
      firstName,
      lastName,
      email,
      password: hashedPassword,
      createdAt: new Date(),
      isVerified: false,
      isActive: true,
      phoneNumber: null,
      isPhoneVerified: false,
      settings: {
        theme: {
          mode: ThemeMode.LIGHT,
          color: ThemeColor.BLUE
        },
        language: 'en',
        timezone: 'UTC',
        notifications: {
          email: {
            marketing: true,
            securityAlerts: true,
            accountUpdates: true,
            newFeatures: true
          },
          push: {
            marketing: true,
            securityAlerts: true,
            accountUpdates: true,
            newFeatures: true
          },
          sms: {
            marketing: false,
            securityAlerts: true,
            accountUpdates: true,
            newFeatures: false
          },
          frequency: {
            email: NotificationFrequency.DAILY,
            push: NotificationFrequency.IMMEDIATELY,
            sms: NotificationFrequency.WEEKLY
          }
        },
        dashboard: {
          layout: DashboardLayout.GRID,
          widgets: [
            {
              id: uuidv4(),
              type: WidgetType.ACTIVITY,
              title: 'Recent Activity',
              position: { x: 0, y: 0, width: 2, height: 2 },
              config: {}
            },
            {
              id: uuidv4(),
              type: WidgetType.STATS,
              title: 'Account Stats',
              position: { x: 2, y: 0, width: 1, height: 1 },
              config: {}
            },
            {
              id: uuidv4(),
              type: WidgetType.NOTIFICATIONS,
              title: 'Notifications',
              position: { x: 0, y: 2, width: 3, height: 1 },
              config: {}
            }
          ]
        },
        security: {
          privacy: {
            dataSharingLevel: DataSharingLevel.BASIC,
            showProfileToPublic: true,
            showActivityHistory: true,
            allowThirdPartyDataSharing: false,
            allowAnalyticsCookies: true
          },
          sessionTimeout: {
            timeoutMinutes: 30,
            extendOnActivity: true
          }
        }
      }
    };

    this.users.push(newUser);

    // Generate email verification code
    this.generateEmailVerificationCode(newUser.id);

    // Return user without password
    const { password: _, ...result } = newUser;
    return result;
  }

  async login(email: string, password: string, options?: { ipAddress?: string; userAgent?: string; captchaToken?: string; }) {
    const ipAddress = options?.ipAddress || '127.0.0.1';
    const startTime = Date.now();
    
    try {
      // Step 1: Apply global rate limiting
      this.recordGlobalAttempt();
      if (this.isGlobalRateLimited()) {
        throw new ForbiddenException('Too many login attempts. Please try again later.');
      }
      
      // Step 2: Apply IP-based rate limiting
      this.recordIPAttempt(ipAddress);
      if (this.isIPRateLimited(ipAddress)) {
        throw new ForbiddenException('Too many login attempts from your IP address. Please try again later.');
      }
      
      // Step 3: Apply route-specific rate limiting
      this.recordRouteAttempt('login', ipAddress);
      if (this.isRouteLimited('login', ipAddress)) {
        throw new ForbiddenException('Rate limit exceeded for login. Please try again later.');
      }
      
      // Step 4: Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new BadRequestException('Invalid email format');
      }

      // Step 5: Check if account is locked out
      if (this.isUserLocked(email)) {
        // If too many failed attempts, require CAPTCHA
        const recentFailedAttempts = await this.getRecentFailedAttempts(email);
        if (recentFailedAttempts >= 5) {
          // Check if CAPTCHA token is provided and valid
          if (!options?.captchaToken) {
            throw new UnauthorizedException('CAPTCHA required after too many failed attempts');
          }
          
          const isCaptchaValid = await this.verifyCaptcha(options.captchaToken);
          if (!isCaptchaValid) {
            throw new UnauthorizedException('Invalid CAPTCHA');
          }
          
          // CAPTCHA is valid, allow one more attempt even if account is locked
          if (this.getLockoutRemainingMinutes(email) > 0) {
            const remainingMinutes = this.getLockoutRemainingMinutes(email);
            throw new ForbiddenException(
              `Account locked due to too many failed attempts. Try again in ${remainingMinutes} minutes.`
            );
          }
        } else {
          const remainingMinutes = this.getLockoutRemainingMinutes(email);
          throw new ForbiddenException(
            `Account locked due to too many failed attempts. Try again in ${remainingMinutes} minutes.`
          );
        }
      }

      // Step 6: Find user by email
      const user = this.users.find(u => u.email === email);
      if (!user) {
        // For security, don't reveal that the email doesn't exist
        // Do password hashing work anyway for timing attack prevention
        await bcrypt.compare(password, '$2b$10$mockHashForNonExistentUser');
        this.recordFailedLoginAttempt(email);
        throw new UnauthorizedException('Invalid credentials');
      }

      // Step 7: Check password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        this.recordFailedLoginAttempt(email);
        throw new UnauthorizedException('Invalid credentials');
      }

      // Step 8: Check if email is verified
      if (!user.isVerified) {
        throw new ForbiddenException('Email not verified');
      }

      // Step 9: Check if account is active
      if (!user.isActive) {
        throw new ForbiddenException('Account is inactive');
      }

      // Step 10: Record successful login and reset failed attempts
      const previousFailedAttempts = await this.getRecentFailedAttempts(email);
      this.resetFailedLoginAttempts(email);
      
      // Record login history
      const loginHistoryEntry = {
        id: uuidv4(),
        userId: user.id,
        timestamp: new Date(),
        ipAddress: ipAddress,
        userAgent: options?.userAgent || 'Unknown',
        location: 'Unknown' // In a real app, determine from IP
      };
      this.loginHistory.push(loginHistoryEntry);

      // Create a new session
      const sessionId = uuidv4();
      const token = uuidv4(); // In a real app, generate a JWT token
      const session = {
        id: sessionId,
        userId: user.id,
        token,
        createdAt: new Date(),
        lastActiveAt: new Date(),
        ipAddress: ipAddress,
        userAgent: options?.userAgent || 'Unknown',
        deviceInfo: 'Unknown' // In a real app, extract from user agent
      };
      this.activeSessions.push(session);

      // Step 11: Check if 2FA is enabled
      const twoFactorSecret = this.twoFactorSecrets.find(s => s.userId === user.id);
      if (twoFactorSecret && twoFactorSecret.isEnabled) {
        // Generate a temporary token for the 2FA verification step
        const tempToken = uuidv4();
        
        // Store token with user ID and 5-minute expiration
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 5);
        
        this.twoFactorTempTokens.push({
          token: tempToken,
          userId: user.id,
          expiresAt
        });
        
        return {
          requiresTwoFactor: true,
          tempToken,
          previousFailedAttempts
        };
      }

      // Step 12: If 2FA is not enabled, proceed with normal login
      const { password: _, ...result } = user;
      return {
        user: result,
        sessionId,
        accessToken: token, // In a real app, we would generate a JWT token here
        previousFailedAttempts
      };
    } catch (error) {
      // Ensure consistent response time to prevent timing attacks
      const elapsedTime = Date.now() - startTime;
      const MIN_RESPONSE_TIME = 200; // milliseconds
      
      if (elapsedTime < MIN_RESPONSE_TIME) {
        // Add artificial delay
        await new Promise(resolve => setTimeout(resolve, MIN_RESPONSE_TIME - elapsedTime));
      }
      
      throw error;
    }
  }

  async requestPasswordReset(email: string) {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new BadRequestException('Invalid email format');
    }

    // Find user by email
    const user = this.users.find(u => u.email === email);
    if (!user) {
      // For security reasons, don't reveal that the email doesn't exist
      // Just pretend we sent the email
      return { message: 'If your email exists in our system, you will receive a password reset link' };
    }

    // Generate a unique token
    const token = uuidv4();
    
    // Set token expiration (1 hour from now)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);
    
    // Store the token with user id and expiration
    this.passwordResetTokens.push({
      token,
      userId: user.id,
      expiresAt
    });

    // In a real app, we would send an email with the reset link
    // For testing purposes, we'll just return the token
    return { 
      message: 'If your email exists in our system, you will receive a password reset link',
      token // Only for testing, wouldn't be returned in a real app
    };
  }
  
  async resetPassword(token: string, newPassword: string) {
    // Validate password
    if (!newPassword || newPassword.length < 8) {
      throw new BadRequestException('Password must be at least 8 characters long');
    }

    // Find the token
    const tokenRecord = this.passwordResetTokens.find(t => t.token === token);
    if (!tokenRecord) {
      throw new BadRequestException('Invalid or expired token');
    }

    // Check if token is expired
    if (new Date() > tokenRecord.expiresAt) {
      // Remove expired token
      this.passwordResetTokens = this.passwordResetTokens.filter(t => t.token !== token);
      throw new BadRequestException('Token has expired');
    }

    // Find the user
    const user = this.users.find(u => u.id === tokenRecord.userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Hash new password
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update user's password
    user.password = hashedPassword;

    // Remove the used token
    this.passwordResetTokens = this.passwordResetTokens.filter(t => t.token !== token);

    return { message: 'Password has been reset successfully' };
  }

  async enableTwoFactor(userId: string) {
    // Find the user
    const user = this.users.find(u => u.id === userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    
    // Check if 2FA is already enabled
    const existingSecret = this.twoFactorSecrets.find(s => s.userId === userId);
    if (existingSecret && existingSecret.isEnabled) {
      throw new BadRequestException('Two-factor authentication is already enabled');
    }
    
    // Generate a secret key
    // In a real app, we would use a library like 'speakeasy' to generate a proper TOTP secret
    const secret = Math.random().toString(36).substr(2, 10);
    
    // Store or update the secret
    if (existingSecret) {
      existingSecret.secret = secret;
      existingSecret.isEnabled = false; // Will be enabled after verification
    } else {
      this.twoFactorSecrets.push({
        userId,
        secret,
        isEnabled: false // Will be enabled after verification
      });
    }
    
    // In a real app, we would return a QR code for the user to scan
    return {
      secret,
      otpauthUrl: `otpauth://totp/WebEnginePlatform:${user.email}?secret=${secret}&issuer=WebEnginePlatform`
    };
  }
  
  async verifyAndEnableTwoFactor(userId: string, code: string) {
    // Find the user
    const user = this.users.find(u => u.id === userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    
    // Find the 2FA secret
    const secretRecord = this.twoFactorSecrets.find(s => s.userId === userId);
    if (!secretRecord) {
      throw new BadRequestException('Two-factor authentication not set up');
    }
    
    // Verify the code
    // In a real app, we would use a library like 'speakeasy' to verify the TOTP code
    // For testing, we'll just check if the code equals the secret
    if (code !== secretRecord.secret) {
      throw new UnauthorizedException('Invalid verification code');
    }
    
    // Enable 2FA
    secretRecord.isEnabled = true;
    
    return { message: 'Two-factor authentication enabled successfully' };
  }
  
  async verifyTwoFactorCode(tempToken: string, code: string) {
    // Find the temporary token
    const tokenRecord = this.twoFactorTempTokens.find(t => t.token === tempToken);
    if (!tokenRecord) {
      throw new UnauthorizedException('Invalid or expired token');
    }
    
    // Check if token is expired
    if (new Date() > tokenRecord.expiresAt) {
      // Remove expired token
      this.twoFactorTempTokens = this.twoFactorTempTokens.filter(t => t.token !== tempToken);
      throw new UnauthorizedException('Token has expired');
    }
    
    // Find the user
    const user = this.users.find(u => u.id === tokenRecord.userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    
    // Find the 2FA secret
    const secretRecord = this.twoFactorSecrets.find(s => s.userId === user.id);
    if (!secretRecord) {
      throw new BadRequestException('Two-factor authentication not set up');
    }
    
    // Verify the code
    // In a real app, we would use a library like 'speakeasy' to verify the TOTP code
    // For testing, we'll just check if the code equals the secret
    if (code !== secretRecord.secret) {
      throw new UnauthorizedException('Invalid verification code');
    }
    
    // Remove the temporary token
    this.twoFactorTempTokens = this.twoFactorTempTokens.filter(t => t.token !== tempToken);
    
    // Return user data
    const { password: _, ...result } = user;
    return {
      user: result,
      accessToken: 'dummy-jwt-token'
    };
  }
  
  async disableTwoFactor(userId: string, code: string) {
    // Find the user
    const user = this.users.find(u => u.id === userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    
    // Find the 2FA secret
    const secretRecord = this.twoFactorSecrets.find(s => s.userId === userId);
    if (!secretRecord) {
      throw new BadRequestException('Two-factor authentication not set up');
    }
    
    if (!secretRecord.isEnabled) {
      throw new BadRequestException('Two-factor authentication is not enabled');
    }
    
    // Verify the code
    if (code !== secretRecord.secret) {
      throw new UnauthorizedException('Invalid verification code');
    }
    
    // Disable 2FA
    this.twoFactorSecrets = this.twoFactorSecrets.filter(s => s.userId !== userId);
    
    return { message: 'Two-factor authentication disabled successfully' };
  }

  // New methods for profile verification

  private generateEmailVerificationCode(userId: string): string {
    // In a real app, we would generate a secure random code
    // For this example, we'll generate a simple 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Set verification code expiration (24 hours)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);
    
    // Store the verification code
    const existingCode = this.emailVerificationCodes.find(c => c.userId === userId);
    if (existingCode) {
      existingCode.code = code;
      existingCode.expiresAt = expiresAt;
    } else {
      this.emailVerificationCodes.push({
        userId,
        code,
        expiresAt
      });
    }
    
    // In a real app, we would send an email with the verification code
    // For testing purposes, we'll just return the code
    return code;
  }
  
  async requestEmailVerification(userId: string) {
    // Find the user
    const user = this.users.find(u => u.id === userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    
    // Check if email is already verified
    if (user.isVerified) {
      throw new BadRequestException('Email is already verified');
    }
    
    // Generate new verification code
    const code = this.generateEmailVerificationCode(userId);
    
    // In a real app, we would send an email with the verification code
    return {
      message: 'Email verification code sent',
      code // Only for testing purposes
    };
  }
  
  async verifyEmail(userId: string, code: string) {
    // Find the user
    const user = this.users.find(u => u.id === userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    
    // Check if email is already verified
    if (user.isVerified) {
      throw new BadRequestException('Email is already verified');
    }
    
    // Find the verification code
    const codeRecord = this.emailVerificationCodes.find(c => c.userId === userId);
    if (!codeRecord) {
      throw new BadRequestException('No verification code found. Please request a new one.');
    }
    
    // Check if code is expired
    if (new Date() > codeRecord.expiresAt) {
      // Remove expired code
      this.emailVerificationCodes = this.emailVerificationCodes.filter(c => c.userId !== userId);
      throw new BadRequestException('Verification code has expired. Please request a new one.');
    }
    
    // Verify the code
    if (code !== codeRecord.code) {
      throw new UnauthorizedException('Invalid verification code');
    }
    
    // Mark email as verified
    user.isVerified = true;
    
    // Remove the verification code
    this.emailVerificationCodes = this.emailVerificationCodes.filter(c => c.userId !== userId);
    
    return { message: 'Email verified successfully' };
  }
  
  async addPhoneNumber(userId: string, phoneNumber: string) {
    // Find the user
    const user = this.users.find(u => u.id === userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    
    // Validate phone number format (simple validation for example purposes)
    const phoneRegex = /^\+?[1-9]\d{9,14}$/;
    if (!phoneRegex.test(phoneNumber)) {
      throw new BadRequestException('Invalid phone number format');
    }
    
    // Check if phone number is already used by another user
    const existingUserWithPhone = this.users.find(u => u.phoneNumber === phoneNumber && u.id !== userId);
    if (existingUserWithPhone) {
      throw new ConflictException('Phone number is already in use');
    }
    
    // Add phone number to user profile
    user.phoneNumber = phoneNumber;
    user.isPhoneVerified = false;
    
    // Generate verification code
    const code = this.generatePhoneVerificationCode(userId);
    
    // In a real app, we would send an SMS with the verification code
    return {
      message: 'Phone number added. Verification code sent.',
      code // Only for testing purposes
    };
  }
  
  private generatePhoneVerificationCode(userId: string): string {
    // In a real app, we would generate a secure random code
    // For this example, we'll generate a simple 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Set verification code expiration (10 minutes)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);
    
    // Store the verification code
    const existingCode = this.phoneVerificationCodes.find(c => c.userId === userId);
    if (existingCode) {
      existingCode.code = code;
      existingCode.expiresAt = expiresAt;
    } else {
      this.phoneVerificationCodes.push({
        userId,
        code,
        expiresAt
      });
    }
    
    // In a real app, we would send an SMS with the verification code
    // For testing purposes, we'll just return the code
    return code;
  }
  
  async requestPhoneVerification(userId: string) {
    // Find the user
    const user = this.users.find(u => u.id === userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    
    // Check if user has a phone number
    if (!user.phoneNumber) {
      throw new BadRequestException('No phone number associated with this account');
    }
    
    // Check if phone is already verified
    if (user.isPhoneVerified) {
      throw new BadRequestException('Phone number is already verified');
    }
    
    // Generate new verification code
    const code = this.generatePhoneVerificationCode(userId);
    
    // In a real app, we would send an SMS with the verification code
    return {
      message: 'Phone verification code sent',
      code // Only for testing purposes
    };
  }
  
  async verifyPhone(userId: string, code: string) {
    // Find the user
    const user = this.users.find(u => u.id === userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    
    // Check if user has a phone number
    if (!user.phoneNumber) {
      throw new BadRequestException('No phone number associated with this account');
    }
    
    // Check if phone is already verified
    if (user.isPhoneVerified) {
      throw new BadRequestException('Phone number is already verified');
    }
    
    // Find the verification code
    const codeRecord = this.phoneVerificationCodes.find(c => c.userId === userId);
    if (!codeRecord) {
      throw new BadRequestException('No verification code found. Please request a new one.');
    }
    
    // Check if code is expired
    if (new Date() > codeRecord.expiresAt) {
      // Remove expired code
      this.phoneVerificationCodes = this.phoneVerificationCodes.filter(c => c.userId !== userId);
      throw new BadRequestException('Verification code has expired. Please request a new one.');
    }
    
    // Verify the code
    if (code !== codeRecord.code) {
      throw new UnauthorizedException('Invalid verification code');
    }
    
    // Mark phone as verified
    user.isPhoneVerified = true;
    
    // Remove the verification code
    this.phoneVerificationCodes = this.phoneVerificationCodes.filter(c => c.userId !== userId);
    
    return { message: 'Phone number verified successfully' };
  }

  // Profile Security Features

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    // Validate inputs
    if (!currentPassword || !newPassword) {
      throw new BadRequestException('Current and new passwords are required');
    }
    
    if (newPassword.length < 8) {
      throw new BadRequestException('New password must be at least 8 characters long');
    }
    
    // Find user
    const user = this.users.find(u => u.id === userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    
    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }
    
    // Hash new password
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Update password
    user.password = hashedPassword;
    
    return { message: 'Password changed successfully' };
  }
  
  async setSecurityQuestions(userId: string, questions: Array<{ question: string, answer: string }>) {
    // Validate inputs
    if (!questions || !Array.isArray(questions)) {
      throw new BadRequestException('Security questions are required');
    }
    
    // Minimum required questions
    const MIN_REQUIRED_QUESTIONS = 2;
    if (questions.length < MIN_REQUIRED_QUESTIONS) {
      throw new BadRequestException(`At least ${MIN_REQUIRED_QUESTIONS} security questions are required`);
    }
    
    // Find user
    const user = this.users.find(u => u.id === userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    
    // Hash answers
    const securityQuestionsWithHashedAnswers = await Promise.all(
      questions.map(async (q) => {
        const salt = await bcrypt.genSalt();
        const hashedAnswer = await bcrypt.hash(q.answer, salt);
        return {
          question: q.question,
          answer: hashedAnswer
        };
      })
    );
    
    // Save security questions
    user.securityQuestions = securityQuestionsWithHashedAnswers;
    
    return { message: 'Security questions set successfully' };
  }
  
  async getLoginHistory(userId: string, limit?: number) {
    // Find user
    const user = this.users.find(u => u.id === userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    
    // Get login history for user
    let history = this.loginHistory.filter(h => h.userId === userId);
    
    // Sort by timestamp (most recent first)
    history = history.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    
    // Apply limit if provided
    if (limit && typeof limit === 'number' && limit > 0) {
      history = history.slice(0, limit);
    }
    
    return history;
  }
  
  async getActiveSessions(userId: string) {
    // Find user
    const user = this.users.find(u => u.id === userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    
    // Get active sessions for user
    const sessions = this.activeSessions.filter(s => s.userId === userId);
    
    // Sort by last active timestamp (most recent first)
    return sessions.sort((a, b) => 
      new Date(b.lastActiveAt).getTime() - new Date(a.lastActiveAt).getTime()
    );
  }
  
  async terminateSession(userId: string, sessionId: string) {
    // Find user
    const user = this.users.find(u => u.id === userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    
    // Find session
    const sessionIndex = this.activeSessions.findIndex(
      s => s.userId === userId && s.id === sessionId
    );
    
    if (sessionIndex === -1) {
      throw new NotFoundException('Session not found');
    }
    
    // Remove session
    this.activeSessions.splice(sessionIndex, 1);
    
    return { message: 'Session terminated successfully' };
  }
  
  async terminateAllSessions(userId: string) {
    // Find user
    const user = this.users.find(u => u.id === userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    
    // Remove all sessions for user
    this.activeSessions = this.activeSessions.filter(s => s.userId !== userId);
    
    return { message: 'All sessions terminated successfully' };
  }

  // User Settings Features

  async updateThemeMode(userId: string, mode: ThemeMode) {
    // Find user
    const user = this.users.find(u => u.id === userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    
    // Update theme mode
    user.settings.theme.mode = mode;
    
    return { message: 'Theme mode updated successfully' };
  }
  
  async updateThemeColor(userId: string, color: ThemeColor) {
    // Find user
    const user = this.users.find(u => u.id === userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    
    // Update theme color
    user.settings.theme.color = color;
    
    return { message: 'Theme color updated successfully' };
  }
  
  async updateLanguage(userId: string, language: string) {
    // Find user
    const user = this.users.find(u => u.id === userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    
    // Validate language code
    if (!this.validLanguageCodes.includes(language)) {
      throw new BadRequestException('Invalid language code');
    }
    
    // Update language
    user.settings.language = language;
    
    return { message: 'Language updated successfully' };
  }
  
  async updateTimezone(userId: string, timezone: string) {
    // Find user
    const user = this.users.find(u => u.id === userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    
    // Validate timezone
    if (!this.validTimezones.includes(timezone)) {
      throw new BadRequestException('Invalid timezone');
    }
    
    // Update timezone
    user.settings.timezone = timezone;
    
    return { message: 'Timezone updated successfully' };
  }
  
  async getFormattedDateTime(userId: string, dateTimeString: string) {
    // Find user
    const user = this.users.find(u => u.id === userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    
    // Parse the input date
    const date = new Date(dateTimeString);
    if (isNaN(date.getTime())) {
      throw new BadRequestException('Invalid date format');
    }
    
    // Format the date according to user's language and timezone
    // In a real app, we would use a library like Intl.DateTimeFormat
    // For this example, we'll use a simplified approach
    
    let formattedDate;
    let formattedTime;
    
    // Adjust for user's timezone
    // In a real app, we would use a library like luxon or moment-timezone
    // For this example, we'll just return the settings
    
    // Format based on language
    switch (user.settings.language) {
      case 'fr':
        // French format: day/month/year
        formattedDate = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
        // 24-hour format
        formattedTime = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
        break;
      case 'de':
        // German format: day.month.year
        formattedDate = `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear()}`;
        // 24-hour format
        formattedTime = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
        break;
      default:
        // Default/English format: month/day/year
        formattedDate = `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}/${date.getFullYear()}`;
        // 12-hour format
        const hours12 = date.getHours() % 12 || 12;
        formattedTime = `${hours12}:${date.getMinutes().toString().padStart(2, '0')} ${date.getHours() >= 12 ? 'PM' : 'AM'}`;
    }
    
    return {
      formattedDate,
      formattedTime,
      language: user.settings.language,
      timezone: user.settings.timezone
    };
  }
  
  async updateEmailNotificationPreferences(userId: string, preferences: any) {
    // Find user
    const user = this.users.find(u => u.id === userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    
    // Update email notification preferences
    user.settings.notifications.email = {
      ...user.settings.notifications.email,
      ...preferences
    };
    
    return { message: 'Email notification preferences updated successfully' };
  }
  
  async updatePushNotificationPreferences(userId: string, preferences: any) {
    // Find user
    const user = this.users.find(u => u.id === userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    
    // Update push notification preferences
    user.settings.notifications.push = {
      ...user.settings.notifications.push,
      ...preferences
    };
    
    return { message: 'Push notification preferences updated successfully' };
  }
  
  async updateSmsNotificationPreferences(userId: string, preferences: any) {
    // Find user
    const user = this.users.find(u => u.id === userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    
    // Update SMS notification preferences
    user.settings.notifications.sms = {
      ...user.settings.notifications.sms,
      ...preferences
    };
    
    return { message: 'SMS notification preferences updated successfully' };
  }

  // Additional User Settings Features

  async updateNotificationFrequency(userId: string, frequencies: any) {
    // Find user
    const user = this.users.find(u => u.id === userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    
    // Initialize notification frequency if not exists
    if (!user.settings.notifications.frequency) {
      user.settings.notifications.frequency = {
        email: NotificationFrequency.DAILY,
        push: NotificationFrequency.IMMEDIATELY,
        sms: NotificationFrequency.WEEKLY
      };
    }
    
    // Update notification frequencies
    Object.keys(frequencies).forEach(channel => {
      if (
        channel in user.settings.notifications.frequency && 
        Object.values(NotificationFrequency).includes(frequencies[channel])
      ) {
        user.settings.notifications.frequency[channel] = frequencies[channel];
      }
    });
    
    return { 
      message: 'Notification frequency updated successfully',
      frequencies: user.settings.notifications.frequency
    };
  }
  
  async sendTestNotification(userId: string, channel: string) {
    // Find user
    const user = this.users.find(u => u.id === userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    
    // Validate channel
    const validChannels = ['email', 'push', 'sms'];
    if (!validChannels.includes(channel)) {
      throw new BadRequestException('Invalid notification channel');
    }
    
    // Check if channel is enabled
    const channelPreferences = user.settings.notifications[channel];
    if (!channelPreferences || !Object.values(channelPreferences).some(enabled => enabled === true)) {
      throw new BadRequestException(`${channel} notifications are not enabled`);
    }
    
    // In a real app, we would send an actual notification through the specified channel
    // For this example, we'll just create a record
    const notificationId = uuidv4();
    const notification = {
      id: notificationId,
      userId,
      channel,
      title: 'Test Notification',
      content: `This is a test ${channel} notification.`,
      sentAt: new Date(),
      status: 'delivered'
    };
    
    this.notifications.push(notification);
    
    return { 
      message: `Test ${channel} notification sent successfully`,
      notification
    };
  }
  
  async updateDashboardLayout(userId: string, layout: DashboardLayout) {
    // Find user
    const user = this.users.find(u => u.id === userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    
    // Initialize dashboard if not exists
    if (!user.settings.dashboard) {
      user.settings.dashboard = {
        layout: DashboardLayout.GRID,
        widgets: []
      };
    }
    
    // Update dashboard layout
    user.settings.dashboard.layout = layout;
    
    return { 
      message: 'Dashboard layout updated successfully',
      layout
    };
  }
  
  async updateDashboardWidgets(userId: string, widgets: any[]) {
    // Find user
    const user = this.users.find(u => u.id === userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    
    // Validate widgets
    if (!Array.isArray(widgets)) {
      throw new BadRequestException('Widgets must be an array');
    }
    
    // Validate each widget
    for (const widget of widgets) {
      if (!widget.id || !widget.type || !widget.title || !widget.position) {
        throw new BadRequestException('Invalid widget format');
      }
      
      if (!Object.values(WidgetType).includes(widget.type)) {
        throw new BadRequestException(`Invalid widget type: ${widget.type}`);
      }
      
      const { x, y, width, height } = widget.position;
      if (
        typeof x !== 'number' || typeof y !== 'number' || 
        typeof width !== 'number' || typeof height !== 'number' ||
        x < 0 || y < 0 || width < 1 || height < 1
      ) {
        throw new BadRequestException('Invalid widget position');
      }
    }
    
    // Initialize dashboard if not exists
    if (!user.settings.dashboard) {
      user.settings.dashboard = {
        layout: DashboardLayout.GRID,
        widgets: []
      };
    }
    
    // Update dashboard widgets
    user.settings.dashboard.widgets = widgets;
    
    return { 
      message: 'Dashboard widgets updated successfully',
      widgets
    };
  }
  
  async addDashboardWidget(userId: string, widget: any) {
    // Find user
    const user = this.users.find(u => u.id === userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    
    // Validate widget
    if (!widget.type || !widget.title || !widget.position) {
      throw new BadRequestException('Invalid widget format');
    }
    
    if (!Object.values(WidgetType).includes(widget.type)) {
      throw new BadRequestException(`Invalid widget type: ${widget.type}`);
    }
    
    const { x, y, width, height } = widget.position;
    if (
      typeof x !== 'number' || typeof y !== 'number' || 
      typeof width !== 'number' || typeof height !== 'number' ||
      x < 0 || y < 0 || width < 1 || height < 1
    ) {
      throw new BadRequestException('Invalid widget position');
    }
    
    // Initialize dashboard if not exists
    if (!user.settings.dashboard) {
      user.settings.dashboard = {
        layout: DashboardLayout.GRID,
        widgets: []
      };
    }
    
    // Create widget with a new ID
    const newWidget = {
      id: uuidv4(),
      type: widget.type,
      title: widget.title,
      position: widget.position,
      config: widget.config || {}
    };
    
    // Add widget to dashboard
    user.settings.dashboard.widgets.push(newWidget);
    
    return { 
      message: 'Widget added to dashboard successfully',
      widget: newWidget
    };
  }
  
  async removeDashboardWidget(userId: string, widgetId: string) {
    // Find user
    const user = this.users.find(u => u.id === userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    
    // Check if dashboard and widgets exist
    if (!user.settings.dashboard || !user.settings.dashboard.widgets) {
      throw new BadRequestException('No dashboard widgets found');
    }
    
    // Find widget
    const widgetIndex = user.settings.dashboard.widgets.findIndex(w => w.id === widgetId);
    if (widgetIndex === -1) {
      throw new NotFoundException('Widget not found');
    }
    
    // Remove widget
    user.settings.dashboard.widgets.splice(widgetIndex, 1);
    
    return { 
      message: 'Widget removed from dashboard successfully',
      widgetId
    };
  }
  
  async saveDashboardConfiguration(userId: string, configuration: any) {
    // Find user
    const user = this.users.find(u => u.id === userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    
    // Validate configuration
    if (!configuration) {
      throw new BadRequestException('Invalid dashboard configuration');
    }
    
    // Initialize dashboard if not exists
    if (!user.settings.dashboard) {
      user.settings.dashboard = {
        layout: DashboardLayout.GRID,
        widgets: []
      };
    }
    
    // Update dashboard configuration
    if (configuration.layout && Object.values(DashboardLayout).includes(configuration.layout)) {
      user.settings.dashboard.layout = configuration.layout;
    }
    
    if (Array.isArray(configuration.widgets)) {
      // Validate widgets
      for (const widget of configuration.widgets) {
        if (!widget.id || !widget.type || !widget.title || !widget.position) {
          throw new BadRequestException('Invalid widget format');
        }
        
        if (!Object.values(WidgetType).includes(widget.type)) {
          throw new BadRequestException(`Invalid widget type: ${widget.type}`);
        }
        
        const { x, y, width, height } = widget.position;
        if (
          typeof x !== 'number' || typeof y !== 'number' || 
          typeof width !== 'number' || typeof height !== 'number' ||
          x < 0 || y < 0 || width < 1 || height < 1
        ) {
          throw new BadRequestException('Invalid widget position');
        }
      }
      
      user.settings.dashboard.widgets = configuration.widgets;
    }
    
    return { 
      message: 'Dashboard configuration saved successfully',
      dashboard: user.settings.dashboard
    };
  }

  // Security Settings Features

  async updatePrivacySettings(userId: string, privacySettings: any) {
    // Find user
    const user = this.users.find(u => u.id === userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    
    // Initialize security settings if not exists
    if (!user.settings.security) {
      user.settings.security = {
        privacy: {
          dataSharingLevel: DataSharingLevel.BASIC,
          showProfileToPublic: true,
          showActivityHistory: true,
          allowThirdPartyDataSharing: false,
          allowAnalyticsCookies: true
        },
        sessionTimeout: {
          timeoutMinutes: 30,
          extendOnActivity: true
        }
      };
    }
    
    // If data sharing level is CUSTOM, make sure at least one specific setting is enabled
    if (privacySettings.dataSharingLevel === DataSharingLevel.CUSTOM) {
      const hasEnabledSetting = 
        privacySettings.showProfileToPublic || 
        privacySettings.showActivityHistory || 
        privacySettings.allowThirdPartyDataSharing || 
        privacySettings.allowAnalyticsCookies;
      
      if (!hasEnabledSetting) {
        throw new BadRequestException('Custom data sharing level requires at least one enabled privacy setting');
      }
    }
    
    // Apply recommended defaults for non-custom data sharing levels
    if (privacySettings.dataSharingLevel !== DataSharingLevel.CUSTOM) {
      switch (privacySettings.dataSharingLevel) {
        case DataSharingLevel.MINIMAL:
          privacySettings.showProfileToPublic = false;
          privacySettings.showActivityHistory = false;
          privacySettings.allowThirdPartyDataSharing = false;
          privacySettings.allowAnalyticsCookies = false;
          break;
        case DataSharingLevel.BASIC:
          privacySettings.showProfileToPublic = true;
          privacySettings.showActivityHistory = false;
          privacySettings.allowThirdPartyDataSharing = false;
          privacySettings.allowAnalyticsCookies = true;
          break;
        case DataSharingLevel.FULL:
          privacySettings.showProfileToPublic = true;
          privacySettings.showActivityHistory = true;
          privacySettings.allowThirdPartyDataSharing = true;
          privacySettings.allowAnalyticsCookies = true;
          break;
      }
    }
    
    // Update privacy settings
    user.settings.security.privacy = {
      ...user.settings.security.privacy,
      ...privacySettings
    };
    
    return { 
      message: 'Privacy settings updated successfully',
      privacy: user.settings.security.privacy
    };
  }
  
  async createApiKey(userId: string, apiKeyData: any) {
    // Find user
    const user = this.users.find(u => u.id === userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    
    // Validate api key data
    if (!apiKeyData.name || !apiKeyData.permissions || !Array.isArray(apiKeyData.permissions)) {
      throw new BadRequestException('Invalid API key data');
    }
    
    // Validate permissions
    for (const permission of apiKeyData.permissions) {
      if (!Object.values(ApiKeyPermission).includes(permission)) {
        throw new BadRequestException(`Invalid permission: ${permission}`);
      }
    }
    
    // Generate API key (in a real app, we would use a more secure method)
    const keyPrefix = 'apk_';
    const randomPart = Math.random().toString(36).substring(2, 15) + 
                     Math.random().toString(36).substring(2, 15);
    const key = `${keyPrefix}${randomPart}`;
    
    // Create new API key
    const newApiKey = {
      id: uuidv4(),
      userId,
      name: apiKeyData.name,
      key,
      permissions: apiKeyData.permissions,
      description: apiKeyData.description || '',
      createdAt: new Date().toISOString(),
      lastUsedAt: null,
      isActive: true
    };
    
    // Add to API keys
    this.apiKeys.push(newApiKey);
    
    return {
      message: 'API key created successfully',
      apiKey: newApiKey
    };
  }
  
  async getApiKeys(userId: string) {
    // Find user
    const user = this.users.find(u => u.id === userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    
    // Get API keys for user
    const userApiKeys = this.apiKeys
      .filter(key => key.userId === userId && key.isActive)
      .map(key => {
        // Don't return the full key, only the prefix and last 4 characters
        const maskedKey = `${key.key.substring(0, 6)}...${key.key.substring(key.key.length - 4)}`;
        
        return {
          id: key.id,
          name: key.name,
          permissions: key.permissions,
          description: key.description,
          key: maskedKey,
          createdAt: key.createdAt,
          lastUsedAt: key.lastUsedAt
        };
      });
    
    return userApiKeys;
  }
  
  async revokeApiKey(userId: string, keyId: string) {
    // Find user
    const user = this.users.find(u => u.id === userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    
    // Find API key
    const apiKeyIndex = this.apiKeys.findIndex(key => key.id === keyId && key.userId === userId);
    if (apiKeyIndex === -1) {
      throw new NotFoundException('API key not found');
    }
    
    // Deactivate API key
    this.apiKeys[apiKeyIndex].isActive = false;
    
    return { message: 'API key revoked successfully' };
  }
  
  async updateApiKey(userId: string, keyId: string, updateData: any) {
    // Find user
    const user = this.users.find(u => u.id === userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    
    // Find API key
    const apiKeyIndex = this.apiKeys.findIndex(key => key.id === keyId && key.userId === userId && key.isActive);
    if (apiKeyIndex === -1) {
      throw new NotFoundException('API key not found or already revoked');
    }
    
    // Update name and description if provided
    if (updateData.name !== undefined) {
      this.apiKeys[apiKeyIndex].name = updateData.name;
    }
    
    if (updateData.description !== undefined) {
      this.apiKeys[apiKeyIndex].description = updateData.description;
    }
    
    // Update permissions if provided
    if (updateData.permissions !== undefined && Array.isArray(updateData.permissions)) {
      // Validate permissions
      for (const permission of updateData.permissions) {
        if (!Object.values(ApiKeyPermission).includes(permission)) {
          throw new BadRequestException(`Invalid permission: ${permission}`);
        }
      }
      
      this.apiKeys[apiKeyIndex].permissions = updateData.permissions;
    }
    
    return {
      message: 'API key updated successfully',
      apiKey: {
        id: this.apiKeys[apiKeyIndex].id,
        name: this.apiKeys[apiKeyIndex].name,
        permissions: this.apiKeys[apiKeyIndex].permissions,
        description: this.apiKeys[apiKeyIndex].description,
        createdAt: this.apiKeys[apiKeyIndex].createdAt,
        lastUsedAt: this.apiKeys[apiKeyIndex].lastUsedAt
      }
    };
  }
  
  async configureSessionTimeout(userId: string, timeoutSettings: any) {
    // Find user
    const user = this.users.find(u => u.id === userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    
    // Validate timeout minutes
    if (timeoutSettings.timeoutMinutes !== undefined) {
      if (
        typeof timeoutSettings.timeoutMinutes !== 'number' || 
        timeoutSettings.timeoutMinutes < 5 || 
        timeoutSettings.timeoutMinutes > 1440
      ) {
        throw new BadRequestException('Session timeout must be between 5 and 1440 minutes');
      }
    }
    
    // Initialize security settings if not exists
    if (!user.settings.security) {
      user.settings.security = {
        privacy: {
          dataSharingLevel: DataSharingLevel.BASIC,
          showProfileToPublic: true,
          showActivityHistory: true,
          allowThirdPartyDataSharing: false,
          allowAnalyticsCookies: true
        },
        sessionTimeout: {
          timeoutMinutes: 30,
          extendOnActivity: true
        }
      };
    }
    
    // Update session timeout settings
    user.settings.security.sessionTimeout = {
      ...user.settings.security.sessionTimeout,
      ...timeoutSettings
    };
    
    // Update all active sessions with new timeout
    const userSessions = this.activeSessions.filter(session => session.userId === userId);
    for (const session of userSessions) {
      session.timeoutMinutes = user.settings.security.sessionTimeout.timeoutMinutes;
      session.extendOnActivity = user.settings.security.sessionTimeout.extendOnActivity;
    }
    
    return { 
      message: 'Session timeout configured successfully',
      sessionTimeout: user.settings.security.sessionTimeout
    };
  }
  
  async validateApiKey(key: string, requiredPermissions: ApiKeyPermission[] = []) {
    // Find API key
    const apiKey = this.apiKeys.find(k => k.key === key && k.isActive);
    if (!apiKey) {
      throw new UnauthorizedException('Invalid API key');
    }
    
    // Find user
    const user = this.users.find(u => u.id === apiKey.userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    
    // Check if user is active
    if (!user.isActive) {
      throw new UnauthorizedException('User account is inactive');
    }
    
    // Check permissions
    for (const permission of requiredPermissions) {
      if (!apiKey.permissions.includes(permission)) {
        throw new ForbiddenException(`Missing required permission: ${permission}`);
      }
    }
    
    // Update last used timestamp
    apiKey.lastUsedAt = new Date().toISOString();
    
    return {
      userId: user.id,
      permissions: apiKey.permissions
    };
  }

  async getApiKeyInfo(key: string) {
    const apiKey = this.apiKeys.find(k => k.key === key && k.isActive);
    if (!apiKey) {
      throw new UnauthorizedException('Invalid or inactive API key');
    }
    
    // Determine the tier based on permissions
    // (This is a simple implementation, could be enhanced with actual tier data)
    let tier = 'standard';
    if (apiKey.permissions.includes(ApiKeyPermission.ADMIN)) {
      tier = 'premium';
    }
    
    return {
      id: apiKey.id,
      userId: apiKey.userId,
      permissions: apiKey.permissions,
      tier,
      createdAt: apiKey.createdAt,
      lastUsedAt: apiKey.lastUsedAt
    };
  }
} 