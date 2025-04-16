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
const default_options_1 = require("./default-options");
describe('defaultRateLimiterOptions', () => {
    it('should validate that defaultRateLimiterOptions exists', () => __awaiter(void 0, void 0, void 0, function* () {
        expect(default_options_1.defaultRateLimiterOptions).toBeDefined();
    }));
    it('should validate the defaultRateLimiterOptions', () => __awaiter(void 0, void 0, void 0, function* () {
        expect(default_options_1.defaultRateLimiterOptions.for).toBe('Express');
        expect(default_options_1.defaultRateLimiterOptions.type).toBe('Memory');
        expect(default_options_1.defaultRateLimiterOptions.keyPrefix).toBe('global');
        expect(default_options_1.defaultRateLimiterOptions.points).toBe(4);
        expect(default_options_1.defaultRateLimiterOptions.pointsConsumed).toBe(1);
        expect(default_options_1.defaultRateLimiterOptions.inmemoryBlockOnConsumed).toBe(0);
        expect(default_options_1.defaultRateLimiterOptions.duration).toBe(1);
        expect(default_options_1.defaultRateLimiterOptions.blockDuration).toBe(0);
        expect(default_options_1.defaultRateLimiterOptions.inmemoryBlockDuration).toBe(0);
        expect(default_options_1.defaultRateLimiterOptions.queueEnabled).toBe(false);
        expect(default_options_1.defaultRateLimiterOptions.whiteList.length).toBe(0);
        expect(default_options_1.defaultRateLimiterOptions.blackList.length).toBe(0);
        expect(default_options_1.defaultRateLimiterOptions.storeClient).toBeUndefined();
        expect(default_options_1.defaultRateLimiterOptions.insuranceLimiter).toBeUndefined();
        expect(default_options_1.defaultRateLimiterOptions.dbName).toBe('rate-limiter');
        expect(default_options_1.defaultRateLimiterOptions.tableName).toBeUndefined();
        expect(default_options_1.defaultRateLimiterOptions.tableCreated).toBeUndefined();
        expect(default_options_1.defaultRateLimiterOptions.clearExpiredByTimeout).toBeUndefined();
        expect(default_options_1.defaultRateLimiterOptions.execEvenly).toBe(false);
        expect(default_options_1.defaultRateLimiterOptions.execEvenlyMinDelayMs).toBeUndefined();
        expect(Object.keys(default_options_1.defaultRateLimiterOptions.indexKeyPrefix).length).toBe(0);
        expect(default_options_1.defaultRateLimiterOptions.maxQueueSize).toBe(100);
        expect(default_options_1.defaultRateLimiterOptions.omitResponseHeaders).toBe(false);
        expect(default_options_1.defaultRateLimiterOptions.errorMessage).toBe('Rate limit exceeded');
        expect(default_options_1.defaultRateLimiterOptions.customResponseSchema).toBeUndefined();
    }));
});
