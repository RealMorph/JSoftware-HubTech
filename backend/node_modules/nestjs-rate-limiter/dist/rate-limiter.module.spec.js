"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const rate_limiter_module_1 = require("./rate-limiter.module");
describe('RateLimiterModule', () => {
    it('should validate that RateLimiterModule exists', () => __awaiter(void 0, void 0, void 0, function* () {
        expect(rate_limiter_module_1.RateLimiterModule).toBeDefined();
    }));
    it('should register RateLimiterModule with empty options', () => __awaiter(void 0, void 0, void 0, function* () {
        const rateLimiterOptions = {};
        const registeredDynamicModule = rate_limiter_module_1.RateLimiterModule.register(rateLimiterOptions);
        expect(registeredDynamicModule).toBeDefined();
        expect(typeof registeredDynamicModule.module).toBeDefined();
        expect(registeredDynamicModule.providers.length).toBe(1);
        const rateLimitOptionsProvider = registeredDynamicModule.providers[0];
        expect(rateLimitOptionsProvider.provide).toBe('RATE_LIMITER_OPTIONS');
        expect(rateLimitOptionsProvider.useValue).toBeDefined();
    }));
    it('should register RateLimiterModule with default options', () => __awaiter(void 0, void 0, void 0, function* () {
        const rateLimiterOptions = {};
        const registeredDynamicModule = rate_limiter_module_1.RateLimiterModule.register();
        expect(registeredDynamicModule).toBeDefined();
        expect(typeof registeredDynamicModule.module).toBeDefined();
        expect(registeredDynamicModule.providers.length).toBe(1);
        const rateLimitOptionsProvider = registeredDynamicModule.providers[0];
        expect(rateLimitOptionsProvider.provide).toBe('RATE_LIMITER_OPTIONS');
        expect(rateLimitOptionsProvider.useValue).toBeDefined();
        const options = rateLimitOptionsProvider.useValue;
        expect(options.for).toBe('Express');
    }));
    it('should register async RateLimiterModule with async options', () => __awaiter(void 0, void 0, void 0, function* () {
        const rateLimiterOptions = {};
        const registeredDynamicModule = rate_limiter_module_1.RateLimiterModule.registerAsync(rateLimiterOptions);
        expect(registeredDynamicModule).toBeDefined();
        expect(typeof registeredDynamicModule.module).toBeDefined();
        expect(registeredDynamicModule.providers.length).toBe(2);
        const rateLimitOptionsProvider = registeredDynamicModule.providers[0];
        expect(rateLimitOptionsProvider.provide).toBe('RATE_LIMITER_OPTIONS');
        expect(rateLimitOptionsProvider.useFactory).toBeDefined();
        expect(rateLimitOptionsProvider.inject).toBeDefined();
    }));
});
