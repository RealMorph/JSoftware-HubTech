"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultRateLimiterOptions = void 0;
exports.defaultRateLimiterOptions = {
    for: 'Express',
    type: 'Memory',
    keyPrefix: 'global',
    points: 4,
    pointsConsumed: 1,
    inmemoryBlockOnConsumed: 0,
    duration: 1,
    blockDuration: 0,
    inmemoryBlockDuration: 0,
    queueEnabled: false,
    whiteList: [],
    blackList: [],
    storeClient: undefined,
    insuranceLimiter: undefined,
    storeType: undefined,
    dbName: 'rate-limiter',
    tableName: undefined,
    tableCreated: undefined,
    clearExpiredByTimeout: undefined,
    execEvenly: false,
    execEvenlyMinDelayMs: undefined,
    indexKeyPrefix: {},
    maxQueueSize: 100,
    omitResponseHeaders: false,
    errorMessage: 'Rate limit exceeded',
    customResponseSchema: undefined,
    logger: true
};
