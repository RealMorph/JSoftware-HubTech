"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.beforeEach = exports.expect = exports.it = exports.describe = exports.jest = void 0;
exports.createMockResponse = createMockResponse;
exports.fail = fail;
const globals_1 = require("@jest/globals");
Object.defineProperty(exports, "jest", { enumerable: true, get: function () { return globals_1.jest; } });
Object.defineProperty(exports, "describe", { enumerable: true, get: function () { return globals_1.describe; } });
Object.defineProperty(exports, "it", { enumerable: true, get: function () { return globals_1.it; } });
Object.defineProperty(exports, "expect", { enumerable: true, get: function () { return globals_1.expect; } });
Object.defineProperty(exports, "beforeEach", { enumerable: true, get: function () { return globals_1.beforeEach; } });
function createMockResponse(data = {}) {
    const response = {
        status: globals_1.jest.fn().mockReturnThis(),
        json: globals_1.jest.fn().mockReturnThis(),
        send: globals_1.jest.fn().mockReturnThis(),
        data
    };
    return response;
}
function fail(message) {
    throw new Error(message);
}
//# sourceMappingURL=jest-test-helpers.js.map