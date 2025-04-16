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
describe('RateLimiterOptionsFactory', () => {
    it('should validate that RateLimiterOptionsFactory exists', () => __awaiter(void 0, void 0, void 0, function* () {
        const rateLimiterOptionsFactory = {
            createRateLimiterOptions: jest.fn()
        };
        expect(rateLimiterOptionsFactory).toBeDefined();
        expect(rateLimiterOptionsFactory.createRateLimiterOptions).toBeDefined();
    }));
});
describe('RateLimiterModuleAsyncOptions', () => {
    it('should validate that RateLimiterModuleAsyncOptions with no properties', () => __awaiter(void 0, void 0, void 0, function* () {
        const rateLimiterModuleAsyncOptions = {};
        expect(rateLimiterModuleAsyncOptions).toBeDefined();
        expect(rateLimiterModuleAsyncOptions.useExisting).toBeUndefined();
    }));
    it('should validate that RateLimiterModuleAsyncOptions with optional properties', () => __awaiter(void 0, void 0, void 0, function* () {
        const rateLimiterModuleAsyncOptions = {
            useFactory: jest.fn(),
            inject: ['test']
        };
        expect(rateLimiterModuleAsyncOptions).toBeDefined();
        expect(rateLimiterModuleAsyncOptions.useFactory).toBeDefined();
        expect(rateLimiterModuleAsyncOptions.inject.length).toBe(1);
    }));
});
describe('RateLimiterOptions', () => {
    it('should validate that RateLimiterOptions with no properties', () => __awaiter(void 0, void 0, void 0, function* () {
        const rateLimiterOptions = {};
        expect(rateLimiterOptions).toBeDefined();
        expect(rateLimiterOptions.for).toBeUndefined();
    }));
    it('should validate that RateLimiterOptions with no properties', () => __awaiter(void 0, void 0, void 0, function* () {
        const rateLimiterOptions = {
            for: 'Express',
            type: 'Memory',
            points: 2,
            pointsConsumed: 3,
            dbName: 'test'
        };
        expect(rateLimiterOptions).toBeDefined();
        expect(rateLimiterOptions.for).toBe('Express');
        expect(rateLimiterOptions.type).toBe('Memory');
        expect(rateLimiterOptions.points).toBe(2);
        expect(rateLimiterOptions.pointsConsumed).toBe(3);
        expect(rateLimiterOptions.dbName).toBe('test');
    }));
});
