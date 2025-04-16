import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { AuthService } from '../auth.service';
export interface LoginReturnType {
    accessToken?: string;
    user?: any;
    sessionId?: string;
    requiresTwoFactor?: boolean;
    tempToken?: string;
}
export interface LoginOptions {
    captchaToken?: string;
    ipAddress?: string;
}
export interface EnhancedLoginResult extends LoginReturnType {
    previousFailedAttempts?: number;
    requiresCaptcha?: boolean;
    message?: string;
}
export interface TestAuthService extends AuthService {
    getRecentFailedAttempts(email: string): Promise<number>;
    verifyCaptcha(token: string): Promise<boolean>;
}
export declare function createMockResponse(data?: any): {
    status: import("jest-mock").Mock<import("jest-mock").UnknownFunction>;
    json: import("jest-mock").Mock<import("jest-mock").UnknownFunction>;
    send: import("jest-mock").Mock<import("jest-mock").UnknownFunction>;
    data: any;
};
export declare function fail(message: string): never;
export { jest, describe, it, expect, beforeEach };
