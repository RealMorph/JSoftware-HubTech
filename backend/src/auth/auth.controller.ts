import { Body, Controller, Post, Param, UseGuards, Get, Delete, Query, Patch, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { 
  LoginDto,
  RequestPasswordResetDto,
  ResetPasswordDto,
  VerifyTwoFactorDto, 
  TwoFactorCodeVerificationDto, 
  DisableTwoFactorDto,
  VerificationCodeDto, 
  PhoneNumberDto,
  ChangePasswordDto,
  SecurityQuestionsDto,
  LoginHistoryQueryDto,
  ThemeModeDto,
  ThemeColorDto,
  LanguageDto,
  TimezoneDto,
  DateTimeFormatRequestDto,
  EmailNotificationPreferencesDto,
  PushNotificationPreferencesDto,
  SmsNotificationPreferencesDto,
  ThemeMode,
  ThemeColor,
  NotificationFrequencyDto,
  DashboardLayoutDto,
  DashboardWidgetsDto,
  WidgetDto
} from './dto';
import { PrivacySettingsDto, ApiKeyDto, SessionTimeoutDto } from './dto/security-settings.dto';
import { ApiKeyPermission } from './dto/security-settings.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto.email, loginDto.password);
  }

  @Post('password-reset-request')
  requestPasswordReset(@Body() requestPasswordResetDto: RequestPasswordResetDto) {
    return this.authService.requestPasswordReset(requestPasswordResetDto.email);
  }

  @Post('password-reset/:token')
  resetPassword(
    @Param('token') token: string,
    @Body() resetPasswordDto: ResetPasswordDto
  ) {
    return this.authService.resetPassword(token, resetPasswordDto.newPassword);
  }

  @Post('2fa/enable/:userId')
  enableTwoFactor(@Param('userId') userId: string) {
    return this.authService.enableTwoFactor(userId);
  }

  @Post('2fa/verify/:userId')
  verifyTwoFactor(
    @Param('userId') userId: string,
    @Body() verifyTwoFactorDto: VerifyTwoFactorDto
  ) {
    return this.authService.verifyAndEnableTwoFactor(userId, verifyTwoFactorDto.code);
  }

  @Post('2fa/authenticate')
  verifyTwoFactorCode(@Body() body: TwoFactorCodeVerificationDto) {
    return this.authService.verifyTwoFactorCode(
      body.tempToken,
      body.code
    );
  }

  @Post('2fa/disable/:userId')
  disableTwoFactor(
    @Param('userId') userId: string,
    @Body() disableTwoFactorDto: DisableTwoFactorDto
  ) {
    return this.authService.disableTwoFactor(userId, disableTwoFactorDto.code);
  }

  // Profile verification endpoints
  @Post('verify-email/request/:userId')
  requestEmailVerification(@Param('userId') userId: string) {
    return this.authService.requestEmailVerification(userId);
  }

  @Post('verify-email/:userId')
  verifyEmail(
    @Param('userId') userId: string,
    @Body() verificationCodeDto: VerificationCodeDto
  ) {
    return this.authService.verifyEmail(userId, verificationCodeDto.code);
  }

  @Post('phone/:userId')
  addPhoneNumber(
    @Param('userId') userId: string,
    @Body() phoneNumberDto: PhoneNumberDto
  ) {
    return this.authService.addPhoneNumber(userId, phoneNumberDto.phoneNumber);
  }

  @Post('verify-phone/request/:userId')
  requestPhoneVerification(@Param('userId') userId: string) {
    return this.authService.requestPhoneVerification(userId);
  }

  @Post('verify-phone/:userId')
  verifyPhone(
    @Param('userId') userId: string,
    @Body() verificationCodeDto: VerificationCodeDto
  ) {
    return this.authService.verifyPhone(userId, verificationCodeDto.code);
  }

  // Profile Security endpoints
  
  @Post('profile/change-password/:userId')
  changePassword(
    @Param('userId') userId: string,
    @Body() changePasswordDto: ChangePasswordDto
  ) {
    return this.authService.changePassword(
      userId,
      changePasswordDto.currentPassword,
      changePasswordDto.newPassword
    );
  }

  @Post('profile/security-questions/:userId')
  setSecurityQuestions(
    @Param('userId') userId: string,
    @Body() securityQuestionsDto: SecurityQuestionsDto
  ) {
    return this.authService.setSecurityQuestions(userId, securityQuestionsDto.questions);
  }

  @Get('profile/login-history/:userId')
  getLoginHistory(
    @Param('userId') userId: string,
    @Query() query: LoginHistoryQueryDto
  ) {
    return this.authService.getLoginHistory(userId, query.limit);
  }

  @Get('profile/sessions/:userId')
  getActiveSessions(@Param('userId') userId: string) {
    return this.authService.getActiveSessions(userId);
  }

  @Delete('profile/sessions/:userId/:sessionId')
  terminateSession(
    @Param('userId') userId: string,
    @Param('sessionId') sessionId: string
  ) {
    return this.authService.terminateSession(userId, sessionId);
  }

  @Delete('profile/sessions/:userId')
  terminateAllSessions(@Param('userId') userId: string) {
    return this.authService.terminateAllSessions(userId);
  }

  // User Settings endpoints

  @Patch('settings/theme/mode/:userId')
  updateThemeMode(
    @Param('userId') userId: string,
    @Body() themeModeDto: ThemeModeDto
  ) {
    return this.authService.updateThemeMode(userId, themeModeDto.mode);
  }

  @Patch('settings/theme/color/:userId')
  updateThemeColor(
    @Param('userId') userId: string,
    @Body() themeColorDto: ThemeColorDto
  ) {
    return this.authService.updateThemeColor(userId, themeColorDto.color);
  }

  @Patch('settings/language/:userId')
  updateLanguage(
    @Param('userId') userId: string,
    @Body() languageDto: LanguageDto
  ) {
    return this.authService.updateLanguage(userId, languageDto.language);
  }

  @Patch('settings/timezone/:userId')
  updateTimezone(
    @Param('userId') userId: string,
    @Body() timezoneDto: TimezoneDto
  ) {
    return this.authService.updateTimezone(userId, timezoneDto.timezone);
  }

  @Post('settings/format-datetime/:userId')
  getFormattedDateTime(
    @Param('userId') userId: string,
    @Body() dateTimeFormatDto: DateTimeFormatRequestDto
  ) {
    return this.authService.getFormattedDateTime(userId, dateTimeFormatDto.dateTime);
  }

  @Patch('settings/notifications/email/:userId')
  updateEmailNotificationPreferences(
    @Param('userId') userId: string,
    @Body() emailPrefsDto: EmailNotificationPreferencesDto
  ) {
    return this.authService.updateEmailNotificationPreferences(userId, emailPrefsDto.preferences);
  }

  @Patch('settings/notifications/push/:userId')
  updatePushNotificationPreferences(
    @Param('userId') userId: string,
    @Body() pushPrefsDto: PushNotificationPreferencesDto
  ) {
    return this.authService.updatePushNotificationPreferences(userId, pushPrefsDto.preferences);
  }

  @Patch('settings/notifications/sms/:userId')
  updateSmsNotificationPreferences(
    @Param('userId') userId: string,
    @Body() smsPrefsDto: SmsNotificationPreferencesDto
  ) {
    return this.authService.updateSmsNotificationPreferences(userId, smsPrefsDto.preferences);
  }

  @Patch('settings/notifications/frequency/:userId')
  async updateNotificationFrequency(
    @Param('userId') userId: string,
    @Body() frequencyDto: NotificationFrequencyDto
  ) {
    return this.authService.updateNotificationFrequency(userId, frequencyDto);
  }

  @Post('settings/notifications/test/:userId')
  async sendTestNotification(
    @Param('userId') userId: string,
    @Body() body: { channel: string }
  ) {
    if (!body || !body.channel) {
      throw new BadRequestException('Notification channel is required');
    }
    return this.authService.sendTestNotification(userId, body.channel);
  }

  @Patch('settings/dashboard/layout/:userId')
  async updateDashboardLayout(
    @Param('userId') userId: string,
    @Body() layoutDto: DashboardLayoutDto
  ) {
    return this.authService.updateDashboardLayout(userId, layoutDto.type);
  }

  @Patch('settings/dashboard/widgets/:userId')
  async updateDashboardWidgets(
    @Param('userId') userId: string,
    @Body() widgetsDto: DashboardWidgetsDto
  ) {
    return this.authService.updateDashboardWidgets(userId, widgetsDto.widgets);
  }

  @Post('settings/dashboard/widgets/:userId')
  async addDashboardWidget(
    @Param('userId') userId: string,
    @Body() widgetDto: WidgetDto
  ) {
    return this.authService.addDashboardWidget(userId, widgetDto);
  }

  @Delete('settings/dashboard/widgets/:userId/:widgetId')
  async removeDashboardWidget(
    @Param('userId') userId: string,
    @Param('widgetId') widgetId: string
  ) {
    return this.authService.removeDashboardWidget(userId, widgetId);
  }

  @Post('settings/dashboard/save/:userId')
  async saveDashboardConfiguration(
    @Param('userId') userId: string,
    @Body() configuration: any
  ) {
    return this.authService.saveDashboardConfiguration(userId, configuration);
  }

  // Security Settings endpoints

  @Patch('security/privacy/:userId')
  async updatePrivacySettings(
    @Param('userId') userId: string,
    @Body() privacySettingsDto: PrivacySettingsDto
  ) {
    return this.authService.updatePrivacySettings(userId, privacySettingsDto);
  }

  @Post('security/api-keys/:userId')
  async createApiKey(
    @Param('userId') userId: string,
    @Body() apiKeyDto: ApiKeyDto
  ) {
    return this.authService.createApiKey(userId, apiKeyDto);
  }

  @Get('security/api-keys/:userId')
  async getApiKeys(@Param('userId') userId: string) {
    return this.authService.getApiKeys(userId);
  }

  @Delete('security/api-keys/:userId/:keyId')
  async revokeApiKey(
    @Param('userId') userId: string,
    @Param('keyId') keyId: string
  ) {
    return this.authService.revokeApiKey(userId, keyId);
  }

  @Patch('security/api-keys/:userId/:keyId')
  async updateApiKey(
    @Param('userId') userId: string,
    @Param('keyId') keyId: string,
    @Body() updateData: Partial<ApiKeyDto>
  ) {
    return this.authService.updateApiKey(userId, keyId, updateData);
  }

  @Patch('security/session-timeout/:userId')
  async configureSessionTimeout(
    @Param('userId') userId: string,
    @Body() timeoutSettingsDto: SessionTimeoutDto
  ) {
    return this.authService.configureSessionTimeout(userId, timeoutSettingsDto);
  }

  @Post('validate-api-key')
  async validateApiKey(
    @Body() body: { 
      key: string, 
      requiredPermissions?: string[] 
    }
  ) {
    // Convert string[] to ApiKeyPermission[]
    const permissions = body.requiredPermissions?.map(p => p as ApiKeyPermission) || [];
    
    return this.authService.validateApiKey(body.key, permissions);
  }
} 