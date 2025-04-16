"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RateLimiterGuard = void 0;
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const rate_limiter_flexible_1 = require("rate-limiter-flexible");
const default_options_1 = require("./default-options");
let RateLimiterGuard = class RateLimiterGuard {
    constructor(options, reflector) {
        this.options = options;
        this.reflector = reflector;
        this.rateLimiters = new Map();
    }
    getRateLimiter(options) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
        return __awaiter(this, void 0, void 0, function* () {
            this.options = Object.assign(Object.assign({}, default_options_1.defaultRateLimiterOptions), this.options);
            this.specificOptions = null;
            this.specificOptions = options;
            const limiterOptions = Object.assign(Object.assign({}, this.options), options);
            const libraryArguments = __rest(limiterOptions, []);
            let rateLimiter = this.rateLimiters.get(libraryArguments.keyPrefix);
            if (libraryArguments.execEvenlyMinDelayMs === undefined)
                libraryArguments.execEvenlyMinDelayMs = (this.options.duration * 1000) / this.options.points;
            if (!rateLimiter) {
                const logger = ((_a = this.specificOptions) === null || _a === void 0 ? void 0 : _a.logger) || this.options.logger;
                switch (((_b = this.specificOptions) === null || _b === void 0 ? void 0 : _b.type) || this.options.type) {
                    case 'Memory':
                        rateLimiter = new rate_limiter_flexible_1.RateLimiterMemory(libraryArguments);
                        if (logger) {
                            common_1.Logger.log(`Rate Limiter started with ${limiterOptions.keyPrefix} key prefix`, 'RateLimiterMemory');
                        }
                        break;
                    case 'Redis':
                        rateLimiter = new rate_limiter_flexible_1.RateLimiterRedis(libraryArguments);
                        if (logger) {
                            common_1.Logger.log(`Rate Limiter started with ${limiterOptions.keyPrefix} key prefix`, 'RateLimiterRedis');
                        }
                        break;
                    case 'Memcache':
                        rateLimiter = new rate_limiter_flexible_1.RateLimiterMemcache(libraryArguments);
                        if (logger) {
                            common_1.Logger.log(`Rate Limiter started with ${limiterOptions.keyPrefix} key prefix`, 'RateLimiterMemcache');
                        }
                        break;
                    case 'Postgres':
                        if (libraryArguments.storeType === undefined)
                            libraryArguments.storeType = this.options.storeClient.constructor.name;
                        libraryArguments.tableName = ((_c = this.specificOptions) === null || _c === void 0 ? void 0 : _c.tableName) || this.options.tableName;
                        if (libraryArguments.tableName === undefined) {
                            libraryArguments.tableName = ((_d = this.specificOptions) === null || _d === void 0 ? void 0 : _d.keyPrefix) || this.options.keyPrefix;
                        }
                        if (libraryArguments.tableCreated === undefined)
                            libraryArguments.tableCreated = false;
                        if (libraryArguments.clearExpiredByTimeout === undefined)
                            libraryArguments.clearExpiredByTimeout = true;
                        rateLimiter = yield new Promise((resolve, reject) => {
                            const limiter = new rate_limiter_flexible_1.RateLimiterPostgres(libraryArguments, (err) => {
                                if (err) {
                                    reject(err);
                                }
                                else {
                                    resolve(limiter);
                                }
                            });
                        });
                        if (logger) {
                            common_1.Logger.log(`Rate Limiter started with ${limiterOptions.keyPrefix} key prefix`, 'RateLimiterPostgres');
                        }
                        break;
                    case 'MySQL':
                        if (libraryArguments.storeType === undefined)
                            libraryArguments.storeType = this.options.storeClient.constructor.name;
                        libraryArguments.tableName = ((_e = this.specificOptions) === null || _e === void 0 ? void 0 : _e.tableName) || this.options.tableName;
                        if (libraryArguments.tableName === undefined) {
                            libraryArguments.tableName = ((_f = this.specificOptions) === null || _f === void 0 ? void 0 : _f.keyPrefix) || this.options.keyPrefix;
                        }
                        if (libraryArguments.tableCreated === undefined)
                            libraryArguments.tableCreated = false;
                        if (libraryArguments.clearExpiredByTimeout === undefined)
                            libraryArguments.clearExpiredByTimeout = true;
                        rateLimiter = yield new Promise((resolve, reject) => {
                            const limiter = new rate_limiter_flexible_1.RateLimiterMySQL(libraryArguments, (err) => {
                                if (err) {
                                    reject(err);
                                }
                                else {
                                    resolve(limiter);
                                }
                            });
                        });
                        if (logger) {
                            common_1.Logger.log(`Rate Limiter started with ${limiterOptions.keyPrefix} key prefix`, 'RateLimiterMySQL');
                        }
                        break;
                    case 'Mongo':
                        if (libraryArguments.storeType === undefined)
                            libraryArguments.storeType = this.options.storeClient.constructor.name;
                        libraryArguments.tableName = ((_g = this.specificOptions) === null || _g === void 0 ? void 0 : _g.tableName) || this.options.tableName;
                        if (libraryArguments.tableName === undefined) {
                            libraryArguments.tableName = ((_h = this.specificOptions) === null || _h === void 0 ? void 0 : _h.keyPrefix) || this.options.keyPrefix;
                        }
                        rateLimiter = new rate_limiter_flexible_1.RateLimiterMongo(libraryArguments);
                        if (logger) {
                            common_1.Logger.log(`Rate Limiter started with ${limiterOptions.keyPrefix} key prefix`, 'RateLimiterMongo');
                        }
                        break;
                    default:
                        throw new Error(`Invalid "type" option provided to RateLimiterGuard. Value was ${limiterOptions.type}`);
                }
                this.rateLimiters.set(limiterOptions.keyPrefix, rateLimiter);
            }
            if (((_j = this.specificOptions) === null || _j === void 0 ? void 0 : _j.queueEnabled) || this.options.queueEnabled) {
                this.queueLimiter = new rate_limiter_flexible_1.RateLimiterQueue(rateLimiter, {
                    maxQueueSize: ((_k = this.specificOptions) === null || _k === void 0 ? void 0 : _k.maxQueueSize) || this.options.maxQueueSize
                });
            }
            rateLimiter = new rate_limiter_flexible_1.RLWrapperBlackAndWhite({
                limiter: rateLimiter,
                whiteList: ((_l = this.specificOptions) === null || _l === void 0 ? void 0 : _l.whiteList) || this.options.whiteList,
                blackList: ((_m = this.specificOptions) === null || _m === void 0 ? void 0 : _m.blackList) || this.options.blackList,
                runActionAnyway: false
            });
            return rateLimiter;
        });
    }
    canActivate(context) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            let points = ((_a = this.specificOptions) === null || _a === void 0 ? void 0 : _a.points) || this.options.points;
            let pointsConsumed = ((_b = this.specificOptions) === null || _b === void 0 ? void 0 : _b.pointsConsumed) || this.options.pointsConsumed;
            const reflectedOptions = this.reflector.get('rateLimit', context.getHandler());
            if (reflectedOptions) {
                if (reflectedOptions.points) {
                    points = reflectedOptions.points;
                }
                if (reflectedOptions.pointsConsumed) {
                    pointsConsumed = reflectedOptions.pointsConsumed;
                }
            }
            const request = this.httpHandler(context).req;
            const response = this.httpHandler(context).res;
            const rateLimiter = yield this.getRateLimiter(reflectedOptions);
            const key = this.getIpFromRequest(request);
            yield this.responseHandler(response, key, rateLimiter, points, pointsConsumed);
            return true;
        });
    }
    getIpFromRequest(request) {
        var _a, _b;
        return (_b = (_a = request.ip) === null || _a === void 0 ? void 0 : _a.match(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/)) === null || _b === void 0 ? void 0 : _b[0];
    }
    httpHandler(context) {
        if (this.options.for === 'ExpressGraphql') {
            return {
                req: context.getArgByIndex(2).req,
                res: context.getArgByIndex(2).req.res
            };
        }
        else if (this.options.for === 'FastifyGraphql') {
            return {
                req: context.getArgByIndex(2).req,
                res: context.getArgByIndex(2).res
            };
        }
        else {
            return {
                req: context.switchToHttp().getRequest(),
                res: context.switchToHttp().getResponse()
            };
        }
    }
    setResponseHeaders(response, points, rateLimiterResponse) {
        return __awaiter(this, void 0, void 0, function* () {
            response.header('Retry-After', Math.ceil(rateLimiterResponse.msBeforeNext / 1000));
            response.header('X-RateLimit-Limit', points);
            response.header('X-Retry-Remaining', rateLimiterResponse.remainingPoints);
            response.header('X-Retry-Reset', new Date(Date.now() + rateLimiterResponse.msBeforeNext).toUTCString());
        });
    }
    responseHandler(response, key, rateLimiter, points, pointsConsumed) {
        var _a, _b, _c, _d, _e;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (((_a = this.specificOptions) === null || _a === void 0 ? void 0 : _a.queueEnabled) || this.options.queueEnabled)
                    yield this.queueLimiter.removeTokens(1);
                else {
                    const rateLimiterResponse = yield rateLimiter.consume(key, pointsConsumed);
                    if (!((_b = this.specificOptions) === null || _b === void 0 ? void 0 : _b.omitResponseHeaders) && !this.options.omitResponseHeaders)
                        this.setResponseHeaders(response, points, rateLimiterResponse);
                }
            }
            catch (rateLimiterResponse) {
                response.header('Retry-After', Math.ceil(rateLimiterResponse.msBeforeNext / 1000));
                if (typeof ((_c = this.specificOptions) === null || _c === void 0 ? void 0 : _c.customResponseSchema) === 'function' || typeof this.options.customResponseSchema === 'function') {
                    const errorBody = ((_d = this.specificOptions) === null || _d === void 0 ? void 0 : _d.customResponseSchema) || this.options.customResponseSchema;
                    throw new common_1.HttpException(errorBody(rateLimiterResponse), common_1.HttpStatus.TOO_MANY_REQUESTS);
                }
                else {
                    throw new common_1.HttpException(((_e = this.specificOptions) === null || _e === void 0 ? void 0 : _e.errorMessage) || this.options.errorMessage, common_1.HttpStatus.TOO_MANY_REQUESTS);
                }
            }
        });
    }
};
RateLimiterGuard = __decorate([
    common_1.Injectable(),
    __param(0, common_1.Inject('RATE_LIMITER_OPTIONS')), __param(1, common_1.Inject('Reflector')),
    __metadata("design:paramtypes", [Object, core_1.Reflector])
], RateLimiterGuard);
exports.RateLimiterGuard = RateLimiterGuard;
