"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RateLimit = void 0;
const common_1 = require("@nestjs/common");
const RateLimit = (options) => common_1.SetMetadata('rateLimit', options);
exports.RateLimit = RateLimit;
